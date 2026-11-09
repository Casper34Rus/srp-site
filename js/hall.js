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
        oppList.innerHTML = "";
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
            if (!firstWin && m.ourScore > m.theirScore) firstWin = m;
            const diff = m.ourScore - m.theirScore;
            if (diff > biggestWin.diff) biggestWin = { diff: diff, text: `${m.ourScore}:${m.theirScore} против «${m.opponent}»`, date: m.date, tournament: m.tournament };
            const matchTotal = m.ourScore + m.theirScore;
            if (matchTotal > highestScoring.total) highestScoring = { total: matchTotal, text: `${m.ourScore}:${m.theirScore} против «${m.opponent}»`, date: m.date, tournament: m.tournament };
        });

        const teamRecordsHtml = `
            ${firstWin ? `
            <div class="glass-card record-card--first-win">
                <div class="record-icon" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" focusable="false" aria-hidden="true"><path d="M7 4h10v8a5 5 0 0 1-10 0V4Z"/><path d="M7 6H4v3a4 4 0 0 0 4 4M17 6h3v3a4 4 0 0 1-4 4M12 17v3M8 20h8"/></svg></div>
                <div class="record-title">Первая победа</div>
                <div class="record-desc">Историческое достижение команды</div>
                <div class="record-value">${firstWin.ourScore}:${firstWin.theirScore}</div>
                <div class="record-context">против «${firstWin.opponent}»<br>${firstWin.date} · ${firstWin.tournament}</div>
            </div>` : ''}
            <div class="glass-card record-card--biggest-win">
                <div class="record-icon" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" focusable="false" aria-hidden="true"><path d="M3 20V6l9-4 9 4v14H3Z"/><path d="M3 10h18M8 6v14M16 6v14M3 15h18"/></svg></div>
                <div class="record-title">Самая крупная победа</div>
                <div class="record-desc">Рекордный результат команды</div>
                <div class="record-value">${biggestWin.text.split(' ')[0]}</div>
                <div class="record-context">${biggestWin.text.split(' против ')[1]}<br>${biggestWin.date} · ${biggestWin.tournament}</div>
            </div>
            <div class="glass-card record-card--highest-scoring">
                <div class="record-icon" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" focusable="false" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="m12 7 4 3-1.5 4.5h-5L8 10l4-3ZM9.5 14.5 7 18m7.5-3.5L17 18M8 10 4.5 9M16 10l3.5-1"/></svg></div>
                <div class="record-title">Самый результативный матч</div>
                <div class="record-desc">Наибольшее количество голов</div>
                <div class="record-value">${highestScoring.total} голов</div>
                <div class="record-context">${highestScoring.text}<br>${highestScoring.date} · ${highestScoring.tournament}</div>
            </div>
            <div class="glass-card record-card--total-goals">
                <div class="record-icon" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" focusable="false" aria-hidden="true"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/></svg></div>
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
            <div class="glass-card record-card--top-scorer">
                <div class="record-icon" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" focusable="false" aria-hidden="true"><path d="M3 19h18v-4l-5-1-3-5-3 2-4-1v4l-3 2v3Z"/><path d="M7 16h11M11 11l2 3"/></svg></div>
                <div class="record-title">Лучший бомбардир</div>
                <div class="record-desc">Личный рекорд игрока</div>
                <div class="record-value">${bestScorer.name}</div>
                <div class="record-context">${bestScorer.goals} голов за карьеру<br>Максимум за матч: ${bestScorerMatch.goals} (${bestScorerMatch.date})</div>
            </div>` : ''}
            ${bestAssist ? `
            <div class="glass-card record-card--best-assist">
                <div class="record-icon" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" focusable="false" aria-hidden="true"><path d="M4 8h15m-4-4 4 4-4 4M20 16H5m4-4-4 4 4 4"/></svg></div>
                <div class="record-title">Лучший ассистент</div>
                <div class="record-desc">Мастер голевых передач</div>
                <div class="record-value">${bestAssist.name}</div>
                <div class="record-context">${bestAssist.assists} результативных передач</div>
            </div>` : ''}
            ${ironMan ? `
            <div class="glass-card record-card--iron-man">
                <div class="record-icon" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" focusable="false" aria-hidden="true"><path d="m12 2 8 3v6c0 5-3.4 8.7-8 11-4.6-2.3-8-6-8-11V5l8-3Z"/><path d="m9 12 2 2 4-4"/></svg></div>
                <div class="record-title">Железный человек</div>
                <div class="record-desc">Наибольшее количество матчей</div>
                <div class="record-value">${ironMan.name}</div>
                <div class="record-context">${ironMan.games} сыгранных матчей</div>
            </div>` : ''}
        `;
        document.getElementById("player-records").innerHTML = playerRecordsHtml;

        // --- 4. МУЗЕЙНЫЙ ТАЙМЛАЙН (5 ГЛАВНЫХ ВЕХ) ---
        const milestones = [];
        
        // 1. Основание
        milestones.push({ year: '2025', date: 'Апрель', title: 'Основание команды', desc: 'Начало истории. Первые тренировки, формирование команды и постановка спортивных целей.' });

        // 2. Первый матч
        if (matches.length > 0) {
            milestones.push({ year: '2025', date: 'Май', title: 'Первый официальный матч', desc: `Первый игровой опыт против «${matches[0].opponent}». Начало соревновательной истории клуба.` });
        }

        // 3. Первый турнир
        const firstTournament = matches[0]?.tournament || 'Местный турнир';
        milestones.push({ year: '2025', date: 'Лето', title: 'Первый турнир', desc: `Выход на новый уровень. Первое участие в организованном соревновании (${firstTournament}).` });

        // 4. Первые награды
        const nominationsStr = window.BACKUP_DATA.letopis.data.nominations_json_srp_kids;
        const nominations = nominationsStr ? JSON.parse(nominationsStr) : [];
        if (nominations.length > 0) {
            milestones.push({ year: '2025/26', date: 'Конец года', title: 'Первые значимые награды', desc: 'Новые достижения. Победы, призовые места и первые индивидуальные награды игроков.' });
        }

        // 5. Развитие
        milestones.push({ year: '2026', date: 'Сегодня', title: 'Развитие клуба', desc: 'Новый этап. Новые команды, спортивные проекты и запуск цифровой системы «Спорт-Учёт».' });

        const timeline = document.getElementById("milestones-list");
        timeline.innerHTML = ""; 
        milestones.forEach((ms, index) => {
            timeline.innerHTML += `
            <div class="milestone-box">
                <div class="milestone-year">${ms.year}</div>
                <div class="milestone-title">${ms.title}</div>
                <div class="milestone-desc">${ms.desc}</div>
            </div>`;
        });

    } catch (e) {
        console.error(e);
    }
});
