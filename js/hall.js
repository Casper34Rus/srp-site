document.addEventListener("DOMContentLoaded", () => {
    try {
        const matchesStr = window.BACKUP_DATA.letopis.data.matches_json_srp_kids;
        const opponentsStr = window.BACKUP_DATA.letopis.data.opponents_json_srp_kids;
        
        const matches = JSON.parse(matchesStr);
        const opponents = JSON.parse(opponentsStr);

        // --- 1. СОПЕРНИКИ (ИСТОРИЯ ВСТРЕЧ) ---
        const oppList = document.getElementById("opponents-list");
        oppList.innerHTML = "";
        opponents.sort((a,b) => a.name.localeCompare(b.name)).forEach(opp => {
            const span = document.createElement("span");
            span.className = "tag-gold";
            span.innerText = opp.name;
            oppList.appendChild(span);
        });

        // --- 2. РЕКОРДЫ ИГРОКОВ ---
        const stats = {}; 
        const keepers = {}; 

        function ensurePlayer(name) {
            if (!stats[name]) stats[name] = { name: name, games: 0, goals: 0, assists: 0 };
        }

        matches.forEach(m => {
            if (m.technical) return;
            if (m.lineup && Array.isArray(m.lineup)) {
                m.lineup.forEach(p => { ensurePlayer(p); stats[p].games++; });
            }
            if (m.goals) {
                for (const [p, c] of Object.entries(m.goals)) {
                    if (p.toLowerCase() === 'автогол') continue;
                    ensurePlayer(p); stats[p].goals += c;
                }
            }
            if (m.assists) {
                for (const [p, c] of Object.entries(m.assists)) {
                    ensurePlayer(p); stats[p].assists += c;
                }
            }
            if (m.goalkeepers && m.theirScore === 0) {
                for (const [p, c] of Object.entries(m.goalkeepers)) {
                    if (!keepers[p]) keepers[p] = { name: p, dryGames: 0 };
                    keepers[p].dryGames++;
                }
            }
        });

        const players = Object.values(stats);
        const keeperList = Object.values(keepers);

        const sortedByGoals = [...players].sort((a, b) => b.goals - a.goals);
        const sortedByAssists = [...players].sort((a, b) => b.assists - a.assists);
        const sortedByGames = [...players].sort((a, b) => b.games - a.games);
        const sortedKeepers = [...keeperList].sort((a, b) => b.dryGames - a.dryGames);

        const recordsToShow = [];
        const mentionedCount = {}; 

        function addRecord(title, playerName, valueText) {
            if ((mentionedCount[playerName] || 0) >= 2) return false;
            recordsToShow.push({ title, name: playerName, value: valueText });
            mentionedCount[playerName] = (mentionedCount[playerName] || 0) + 1;
            return true;
        }

        for (let p of sortedByGoals) {
            if (addRecord("Лучший бомбардир", p.name, `${p.goals} голов`)) break;
        }
        for (let p of sortedByAssists) {
            if (addRecord("Лучший ассистент", p.name, `${p.assists} передач`)) break;
        }
        for (let p of sortedByGames) {
            if (addRecord("Железный человек", p.name, `${p.games} матчей`)) break;
        }
        if (sortedKeepers.length > 0) {
            for (let k of sortedKeepers) {
                if (addRecord("Стена (вратарь)", k.name, `${k.dryGames} сухих игр`)) break;
            }
        }

        let maxGoalsInMatch = { goals: 0, player: '', opponent: '' };
        matches.forEach(m => {
            if (m.technical || !m.goals) return;
            for (const [p, c] of Object.entries(m.goals)) {
                if (p.toLowerCase() === 'автогол') continue;
                if (c > maxGoalsInMatch.goals) {
                    maxGoalsInMatch = { goals: c, player: p, opponent: m.opponent };
                }
            }
        });
        if (maxGoalsInMatch.goals > 0) {
            addRecord("Гол за матч", maxGoalsInMatch.player, `${maxGoalsInMatch.goals} в ворота «${maxGoalsInMatch.opponent}»`);
        }

        const recList = document.getElementById("records-list");
        recList.innerHTML = recordsToShow.map(r => `
            <div class="glass-card">
                <div class="record-title">${r.title}</div>
                <div class="record-name">${r.name}</div>
                <div class="record-value">${r.value}</div>
            </div>
        `).join("");

        // --- 3. ВЕХИ ИСТОРИИ ---
        let milestones = [];

        // Первый матч
        const sortedOldest = [...matches].filter(m => !m.technical).sort((a, b) => {
            const dA = a.date.split('.').map(Number); const dB = b.date.split('.').map(Number);
            return (dA[2] - dB[2]) || (dA[1] - dB[1]) || (dA[0] - dB[0]);
        });
        if (sortedOldest.length > 0) {
            const first = sortedOldest[0];
            milestones.push({
                date: first.date,
                text: `Первый официальный матч против «${first.opponent}». Результат: ${first.ourScore}:${first.theirScore}.`
            });
        }

        // Самая крупная победа
        let maxWin = { diff: -1, text: "" };
        matches.forEach(m => {
            if (m.technical) return;
            const diff = m.ourScore - m.theirScore;
            if (diff > maxWin.diff) {
                maxWin = { diff: diff, text: `${m.ourScore}:${m.theirScore} против ${m.opponent} (${m.date})` };
            }
        });
        milestones.push({
            date: maxWin.text.match(/\((.*?)\)/)[1], 
            text: `Историческая победа над «${maxWin.text.split(' против ')[1].split(' (')[0]}» со счётом ${maxWin.text.split(' против ')[0]}!`
        });

        // Официальная регистрация
        milestones.push({
            date: '09.10.25',
            text: 'Официальная регистрация АНО «Спорт-Ревю Поволжья» в Министерстве юстиции.'
        });

        // Сортируем (сначала новые)
        milestones.sort((a, b) => {
            const dA = a.date.split('.').map(Number); const dB = b.date.split('.').map(Number);
            return (dB[2] - dA[2]) || (dB[1] - dA[1]) || (dB[0] - dA[0]);
        });

        const timeline = document.getElementById("milestones-list");
        timeline.innerHTML = ""; 
        milestones.forEach(ms => {
            const div = document.createElement("div");
            div.className = "timeline-item";
            div.innerHTML = `
                <div class="timeline-dot"></div>
                <div class="timeline-date">${ms.date}</div>
                <div class="timeline-content">${ms.text}</div>
            `;
            timeline.appendChild(div);
        });

    } catch (e) {
        console.error(e);
        document.getElementById("records-list").innerHTML = `<p style="color:red;">Ошибка загрузки: ${e.message}</p>`;
    }
});
