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

        // Витрина сайта: только знаковые встречи. Все исходные матчи
        // остаются в BACKUP_DATA и участвуют в расчётах статистики.
        // Используем составной ключ, поскольку у старых записей нет ID.
        const featuredMatches = [
            { date: "26.04.25", opponent: "РКШ", ourScore: 7, theirScore: 2, label: "Первый официальный матч" },
            { date: "29.06.25", opponent: "Спартак Юниор (Чёрные)", ourScore: 5, theirScore: 3, label: "Победа в четвертьфинале" },
            { date: "29.06.25", opponent: "Ротор Д", ourScore: 3, theirScore: 2, label: "Выход в финал" },
            { date: "29.06.25", opponent: "Форвард (Михайловка)", ourScore: 3, theirScore: 4, label: "Серебро турнира" },
            { date: "05.09.26", opponent: "Академия Ротор 2016", ourScore: 5, theirScore: 5, label: "Боевая ничья с Академией «Ротор»" },
            { date: "13.04.26", opponent: "Киликия (Ереван, Армения)", ourScore: 0, theirScore: 2, label: "Первый международный матч" },
            { date: "25.10.26", opponent: "Сталинград", ourScore: 4, theirScore: 0, label: "Победа над «Сталинградом»" }
        ];

        const displayMatches = featuredMatches.map(feature => {
            const match = matches.find(m =>
                m.date === feature.date &&
                m.opponent === feature.opponent &&
                m.ourScore === feature.ourScore &&
                m.theirScore === feature.theirScore
            );
            return match ? { match, label: feature.label } : null;
        }).filter(Boolean);

        displayMatches.forEach(({ match, label }) => {
            let resultBadge = "";
            if (match.ourScore > match.theirScore) resultBadge = '<span class="score-badge win">Победа</span>';
            else if (match.ourScore < match.theirScore) resultBadge = '<span class="score-badge lose">Поражение</span>';
            else resultBadge = '<span class="score-badge draw">Ничья</span>';

            const year = match.date.split('.')[2];
            const season = year === '26' ? 'Сезон 2025/26' : 'Сезон 2024/25';

            // Фотографии настоящих эмблем добавляются только после проверки
            // принадлежности команде. До этого — нейтральные инициалы.
            // Никаких логотипов сторонних клубов вместо эмблемы соперника.
            const opponentLogoByName = {
                "РКШ": { file: "rksh", initials: "РКШ" },
                "Спартак Юниор (Чёрные)": { file: "spartak-junior", initials: "СЮ" },
                "Ротор Д": { file: "rotor-d", initials: "РД" },
                "Академия Ротор 2016": { file: "academy-rotor-2016", initials: "АР" },
                "Форвард (Михайловка)": { file: "forward-mikhaylovka", initials: "ФМ" },
                "Сборная Спартановки": { file: "spartanovka", initials: "СС" },
                "Киликия (Ереван, Армения)": { file: "kilikia-yerevan", initials: "К" },
                "Сталинград": { file: "stalingrad", initials: "СТ" }
            };
            const opponentBadge = opponentLogoByName[match.opponent] || { file: null, initials: "ФК" };
            const safeInitials = opponentBadge.initials;
            const imagePath = opponentBadge.file
                ? `assets/opponents/${opponentBadge.file}.${opponentBadge.file === "spartak-junior" ? "jpg" : "webp"}?v=20261109c`
                : null;
            // HTML keeps a fallback visible; on successful image load,
            // only the letters are hidden. Absent files do not show a broken icon.
            const opponentLogo = `
                <span class="srp-opponent-crest" role="img" aria-label="Эмблема или условный знак: ${match.opponent}">
                    <span class="srp-opponent-initials">${safeInitials}</span>
                    ${imagePath ? `<img class="srp-opponent-real-logo" src="${imagePath}" alt="" loading="eager" decoding="async" onload="this.classList.add('is-loaded');this.previousElementSibling.hidden=true" onerror="this.remove()">` : ""}
                </span>
            `;

            const card = document.createElement("div");
            card.className = "match-card-new";
            card.innerHTML = `
                <div class="srp-featured-match-label">${label}</div>
                <div class="match-season-bar">
                    <span>${season} · ${match.tournament}</span>
                    <span class="badge-finished">Завершён</span>
                </div>
                <div class="match-main-info">
                    <div class="team-block">
                        <!-- Наш логотип из папки assets -->
                        <img src="assets/logo-main.png" alt="Спорт-Ревю" class="team-logo-img" onerror="this.style.display='none'">
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

