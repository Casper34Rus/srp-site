document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("matches-container");
    const modal = document.getElementById("matchModal");
    const modalBody = document.getElementById("modalMatchBody");

    if (!window.BACKUP_DATA) {
        container.innerHTML = "<p>Ошибка: данные не загружены.</p>";
        return;
    }

    try {
        const matchesStr = window.BACKUP_DATA.letopis.data.matches_json_srp_kids;
        const matches = JSON.parse(matchesStr);

        // 1. СЧИТАЕМ ЦИФРЫ ДЛЯ ШАПКИ
        let totalMatches = matches.length;
        let totalWins = 0;
        let totalGoals = 0;
        const tournamentsSet = new Set();

        matches.forEach(m => {
            if (!m.technical) {
                if (m.ourScore > m.theirScore) totalWins++;
                totalGoals += m.ourScore;
            }
            if (m.tournament) tournamentsSet.add(m.tournament);
        });

        document.getElementById("metric-matches").innerText = totalMatches;
        document.getElementById("metric-wins").innerText = totalWins;
        document.getElementById("metric-tournaments").innerText = tournamentsSet.size;
        document.getElementById("metric-goals").innerText = totalGoals;

        // 2. РИСУЕМ КАРТОЧКИ
        container.innerHTML = "";

        // Сортируем по дате (сначала новые)
        matches.sort((a, b) => {
            const dA = a.date.split('.').map(Number); const dB = b.date.split('.').map(Number);
            return (dB[2] - dA[2]) || (dB[1] - dA[1]) || (dB[0] - dA[0]);
        });

        matches.forEach((match) => {
            let resultBadge = "";
            if (match.ourScore > match.theirScore) resultBadge = '<span class="score-badge win">Победа</span>';
            else if (match.ourScore < match.theirScore) resultBadge = '<span class="score-badge lose">Поражение</span>';
            else resultBadge = '<span class="score-badge draw">Ничья</span>';

            const year = match.date.split('.')[2];
            const season = year === '26' ? 'Сезон 2025/26' : 'Сезон 2024/25';

            // Нейтральный логотип для соперника (Серый щит SVG)
            const opponentLogo = `
                <img src="assets/opponent-logo.jpg" alt="Соперник" class="team-logo-img" style="border: 1px solid #444; background: transparent; padding: 5px;" onerror="this.src='assets/logo.jpg'">
            `;

            const card = document.createElement("div");
            card.className = "match-card-new";
            card.innerHTML = `
                <div class="match-season-bar">
                    <span>${season} · ${match.tournament}</span>
                    <span class="badge-finished">Завершён</span>
                </div>
                <div class="match-main-info">
                    <div class="team-block">
                        <!-- Наш логотип из папки assets -->
                        <img src="assets/logo.jpg" alt="Спорт-Ревю" class="team-logo-img" onerror="this.style.display='none'">
                        <div class="team-name">Спорт-Ревю Поволжья</div>
                    </div>
                    <div class="score-block">
                        <div class="score-value">${match.ourScore} : ${match.theirScore}</div>
                        ${resultBadge}
                    </div>
                    <div class="team-block">
                        ${opponentLogo}
                        <div class="team-name">${match.opponent}</div>
                    </div>
                </div>
                <div class="match-footer-new">
                    <div style="color: #a0a0a0; font-size: 14px;">${match.date} · ${match.stadium || 'Стадион'}</div>
                    <button class="btn-details" onclick='openMatch(${JSON.stringify(match).replace(/'/g, "&#39;")})'>Посмотреть детали матча</button>
                </div>
            `;
            container.appendChild(card);
        });
    } catch (e) {
        container.innerHTML = `<p>Ошибка: ${e.message}</p>`;
    }
});

// Функция открытия модалки
window.openMatch = function(match) {
    const modal = document.getElementById("matchModal");
    const modalBody = document.getElementById("modalMatchBody");

    modalBody.innerHTML = `
        <div class="modal-title" style="font-size: 24px; color: #fff; margin-bottom: 5px;">${match.opponent} — ${match.ourScore}:${match.theirScore}</div>
        <div style="color: #0077FF; font-weight: bold; margin-bottom: 20px;">${match.tournament} · ${match.date}</div>
        
        <div class="modal-section">
            <h4>Состав команды</h4>
            <p>${match.lineup && match.lineup.length > 0 ? match.lineup.join(', ') : 'Не указан'}</p>
        </div>
        
        ${!match.technical ? `
        <div class="modal-section">
            <h4>Голы</h4>
            ${Object.keys(match.goals).length > 0 
                ? '<ul>' + Object.entries(match.goals).map(([p, g]) => `<li><strong>${p}</strong> — ${g}</li>`).join('') + '</ul>'
                : '<p>Нет</p>'}
        </div>
        <div class="modal-section">
            <h4>Голевые передачи</h4>
            ${Object.keys(match.assists).length > 0 
                ? '<ul>' + Object.entries(match.assists).map(([p, a]) => `<li><strong>${p}</strong> — ${a}</li>`).join('') + '</ul>'
                : '<p>Нет</p>'}
        </div>
        ` : ''}

        ${match.note ? `
        <div class="modal-section">
            <h4>Заметка тренера</h4>
            <p style="font-style: italic; color: #ccc;">"${match.note}"</p>
        </div>` : ''}
    `;
    modal.classList.add("active");
}

