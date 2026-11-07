document.addEventListener("DOMContentLoaded", () => {
    try {
        const matchesStr = window.BACKUP_DATA.letopis.data.matches_json_srp_kids;
        const opponentsStr = window.BACKUP_DATA.letopis.data.opponents_json_srp_kids;
        
        const matches = JSON.parse(matchesStr);
        const opponents = JSON.parse(opponentsStr);

        // --- 1. СОПЕРНИКИ ---
        const oppList = document.getElementById("opponents-list");
        opponents.sort((a,b) => a.name.localeCompare(b.name)).forEach(opp => {
            const span = document.createElement("span");
            span.className = "tag";
            span.innerText = opp.name;
            oppList.appendChild(span);
        });

        // --- 2. РЕКОРДЫ ИГРОКОВ (УМНЫЙ ФИЛЬТР) ---
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

        function addRecord(title, playerName, valueText, styleClass = "") {
            if ((mentionedCount[playerName] || 0) >= 2) return false;
            recordsToShow.push({ title, name: playerName, value: valueText, style: styleClass });
            mentionedCount[playerName] = (mentionedCount[playerName] || 0) + 1;
            return true;
        }

        for (let p of sortedByGoals) {
            if (addRecord("Лучший бомбардир", p.name, `${p.goals} голов`, "record-value")) break;
        }
        for (let p of sortedByAssists) {
            if (addRecord("Лучший ассистент", p.name, `${p.assists} передач`, "record-value draw")) break;
        }
        for (let p of sortedByGames) {
            if (addRecord("Железный человек (больше всех игр)", p.name, `${p.games} матчей`, "record-value")) break;
        }
        if (sortedKeepers.length > 0) {
            for (let k of sortedKeepers) {
                if (addRecord("Стена (больше всех сухих матчей)", k.name, `${k.dryGames} сухих игр`, "record-value")) break;
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
            addRecord("Рекорд по голам за матч", maxGoalsInMatch.player, `${maxGoalsInMatch.goals} голов в ворота «${maxGoalsInMatch.opponent}»`, "record-value lose");
        }

        const recList = document.getElementById("records-list");
        recList.innerHTML = recordsToShow.map(r => `
            <div class="record-item">
                <div class="record-title">${r.title}</div>
                <div class="${r.style}">${r.name} (${r.value})</div>
            </div>
        `).join("");

        // --- 3. ВЕХИ (ИСПРАВЛЕНО) ---
        let milestones = [];

        // Берем самый первый матч из базы как отправную точку
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

        // Самый результативный матч
        let maxGoals = { count: 0, text: "" };
        matches.forEach(m => {
            if (m.technical) return;
            const totalGoals = m.ourScore + m.theirScore;
            if (totalGoals > maxGoals.count) {
                maxGoals = { count: totalGoals, text: `${m.ourScore}:${m.theirScore} против ${m.opponent} (${m.date})` };
            }
        });
        milestones.push({
            date: maxGoals.text.match(/\((.*?)\)/)[1], 
            text: `Самый результативный матч в истории клуба против «${maxGoals.text.split(' против ')[1].split(' (')[0]}» (${maxGoals.count} голов).`
        });

        // Официальная регистрация (оставляем как веху, но с пояснением)
        milestones.push({
            date: '09.10.25',
            text: 'Официальная регистрация АНО «Спорт-Ревю Поволжья» в Министерстве юстиции.'
        });

        milestones.sort((a, b) => {
            const dA = a.date.split('.').map(Number); const dB = b.date.split('.').map(Number);
            return (dB[2] - dA[2]) || (dB[1] - dA[1]) || (dB[0] - dA[0]);
        });
        
        // Ограничиваем топ-4
        milestones = milestones.slice(0, 4); 

        const timeline = document.getElementById("milestones-list");
        timeline.innerHTML = ""; 
        milestones.forEach(ms => {
            const li = document.createElement("li");
            li.innerHTML = `
                <div class="timeline-date">${ms.date}</div>
                <div class="timeline-text">${ms.text}</div>
            `;
            timeline.appendChild(li);
        });

    } catch (e) {
        console.error(e);
        document.getElementById("records-list").innerHTML = `<p>Ошибка загрузки: ${e.message}</p>`;
    }
});
