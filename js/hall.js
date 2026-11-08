document.addEventListener("DOMContentLoaded", () => {
    try {
        const matchesStr = window.BACKUP_DATA.letopis.data.matches_json_srp_kids;
        const opponentsStr = window.BACKUP_DATA.letopis.data.opponents_json_srp_kids;
        
        let matches = JSON.parse(matchesStr);
        const opponents = JSON.parse(opponentsStr);

        // Сортируем от старых к новым
        matches.sort((a, b) => {
            const dA = a.date.split('.').map(Number); const dB = b.date.split('.').map(Number);
            return (dA[2] - dB[2]) || (dA[1] - dB[1]) || (dA[0] - dB[0]);
        });

        // --- 1. СОПЕРНИКИ ---
        const oppList = document.getElementById("opponents-list");
        opponents.sort((a,b) => a.name.localeCompare(b.name)).forEach(opp => {
            const span = document.createElement("span");
            span.className = "tag-gold";
            span.innerText = opp.name;
            oppList.appendChild(span);
        });

        // --- 2. КОМАНДНЫЕ РЕКОРДЫ ---
        let firstWin = null;
        let biggestWin = { diff: -1, text: "", date: "", tournament: "" };
        let highestScoring = { total: 0, text: "", date: "", tournament: "" };
        let totalGoals = 0;

        matches.forEach(m => {
            if (m.technical) return;
            totalGoals += m.ourScore;

            // Первая победа
            if (!firstWin && m.ourScore > m.theirScore) {
                firstWin = m;
            }

            // Самая крупная победа
            const diff = m.ourScore - m.theirScore;
            if (diff > biggestWin.diff) {
                biggestWin = { 
                    diff: diff, 
                    text: `${m.ourScore}:${m.theirScore} против «${m.opponent}»`, 
                    date: m.date, 
                    tournament: m.tournament 
                };
            }

            // Самый результативный матч
            const matchTotal = m.ourScore + m.theirScore;
            if (matchTotal > highestScoring.total) {
                highestScoring = { 
                    total: matchTotal, 
                    text: `${m.ourScore}:${m.theirScore} против «${m.opponent}»`, 
                    date: m.date, 
                    tournament: m.tournament 
                };
            }
        });

        const teamRecordsHtml = `
            ${firstWin ? `
            <div class="glass-card">
                <div class="record-icon">🏆</div>
                <div class="record-title">Первая победа</div>
                <div class="record-desc">Историческое достижение команды</div>
                <div class="record-value">${firstWin.ourScore}:${firstWin.theirScore}</div>
                <div class="record-context">против «${firstWin.opponent}»<br>${firstWin.date} · ${firstWin.tournament}</div>
            </div>` : ''}

            <div class="glass-card">
                <div class="record-icon">🔥</div>
                <div class="record-title">Самая крупная победа</div>
                <div class="record-desc">Рекордный результат команды</div>
                <div class="record-value">${biggestWin.text.split(' ')[0]}</div>
                <div class="record-context">${biggestWin.text.split(' против ')[1]}<br>${biggestWin.date} · ${biggestWin.tournament}</div>
            </div>

            <div class="glass-card">
                <div class="record-icon">⚽</div>
                <div class="record-title">Самый результативный матч</div>
                <div class="record-desc">Наибольшее количество голов</div>
                <div class="record-value">${highestScoring.total} голов</div>
                <div class="record-context">${highestScoring.text}<br>${highestScoring.date} · ${highestScoring.tournament}</div>
            </div>

            <div class="glass-card">
                <div class="record-icon">🎯</div>
                <div class="record-title">Всего забито</div>
                <div class="record-desc">Общекомандный показатель</div>
                <div class="record-value">${totalGoals}</div>
                <div class="record-context">голов за всю историю клуба</div>
            </div>
        `;
        document.getElementById("team-records").innerHTML = teamRecordsHtml;

        // --- 3. ИНДИВИДУАЛЬНЫЕ РЕКОРДЫ ---
        const stats = {};
        matches.forEach(m => {
            if (m.technical) return;
            if (m.lineup) m.lineup.forEach(p => { if(!stats[p]) stats[p]={goals:0,assists:0,games:0}; stats[p].games++; });
            if (m.goals) for (const [p, c] of Object.entries(m.goals)) { if (p!=='Автогол') { if(!stats[p]) stats[p]={goals:0,assists:0,games:0}; stats[p].goals += c; } }
            if (m.assists) for (const [p, c] of Object.entries(m.assists)) { if(!stats[p]) stats[p]={goals:0,assists:0,games:0}; stats[p].assists += c; }
        });

        const players = Object.keys(stats).map(name => ({ name, ...stats[name] }));
        const bestScorer = [...players].sort((a,b) => b.goals - a.goals)[0];
        const bestAssist = [...players].sort((a,b) => b.assists - a.assists)[0];
        const ironMan = [...players].sort((a,b) => b.games - a.games)[0];
        
        // Ищем, в каком матче бомбардир забил больше всего
        let bestScorerMatch = { goals: 0, date: "", tournament: "" };
        if (bestScorer) {
            matches.forEach(m => {
                if (m.goals && m.goals[bestScorer.name] > bestScorerMatch.goals) {
                    bestScorerMatch = { goals: m.goals[bestScorer.name], date: m.date, tournament: m.tournament };
                }
            });
        }

        const playerRecordsHtml = `
            ${bestScorer ? `
            <div class="glass-card">
                <div class="record-icon">👟</div>
                <div class="record-title">Лучший бомбардир</div>
                <div class="record-desc">Личный рекорд игрока</div>
                <div class="record-value">${bestScorer.name}</div>
                <div class="record-context">${bestScorer.goals} голов за карьеру<br>Максимум за матч: ${bestScorerMatch.goals} (${bestScorerMatch.date})</div>
            </div>` : ''}

            ${bestAssist ? `
            <div class="glass-card">
                <div class="record-icon">🎯</div>
                <div class="record-title">Лучший ассистент</div>
                <div class="record-desc">Мастер голевых передач</div>
                <div class="record-value">${bestAssist.name}</div>
                <div class="record-context">${bestAssist.assists} результативных передач</div>
            </div>` : ''}

            ${ironMan ? `
            <div class="glass-card">
                <div class="record-icon">🛡️</div>
                <div class="record-title">Железный человек</div>
                <div class="record-desc">Наибольшее количество матчей</div>
                <div class="record-value">${ironMan.name}</div>
                <div class="record-context">${ironMan.games} сыгранных матчей</div>
            </div>` : ''}
        `;
        document.getElementById("player-records").innerHTML = playerRecordsHtml;

        // --- 4. ВЕХИ ИСТОРИИ ---
        let milestones = [];
        if (matches.length > 0) {
            const first = matches[0];
            milestones.push({ date: first.date, text: `Первый официальный матч против «${first.opponent}». Результат: ${first.ourScore}:${first.theirScore}.` });
        }
        milestones.push({ date: '09.10.25', text: 'Официальная регистрация АНО «Спорт-Ревю Поволжья» в Министерстве юстиции.' });
        if (biggestWin.diff > 0) {
            milestones.push({ date: biggestWin.date, text: `Историческая победа над «${biggestWin.text.split(' против ')[1].replace(/«|»/g, '')}» со счётом ${biggestWin.text.split(' ')[0]}!` });
        }

        milestones.sort((a, b) => {
            const dA = a.date.split('.').map(Number); const dB = b.date.split('.').map(Number);
            return (dB[2] - dA[2]) || (dB[1] - dA[1]) || (dB[0] - dA[0]);
        });

        const timeline = document.getElementById("milestones-list");
        timeline.innerHTML = ""; 
        milestones.forEach(ms => {
            timeline.innerHTML += `
            <div class="timeline-item">
                <div class="timeline-dot"></div>
                <div class="timeline-date">${ms.date}</div>
                <div class="timeline-content">${ms.text}</div>
            </div>`;
        });

    } catch (e) {
        console.error(e);
    }
});
