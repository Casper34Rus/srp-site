document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("matches-list");
    const modal = document.getElementById("matchModal");
    const modalBody = document.getElementById("modalMatchBody");

    window.closeModal = function() {
        modal.classList.remove("active");
    }

    if (!window.BACKUP_DATA) {
        container.innerHTML = "<p>Ошибка: данные не загружены.</p>";
        return;
    }

    try {
        const matchesStr = window.BACKUP_DATA.letopis.data.matches_json_srp_kids;
        const matches = JSON.parse(matchesStr);
        container.innerHTML = "";

        matches.sort((a, b) => {
            const dateA = a.date.split('.').map(Number);
            const dateB = b.date.split('.').map(Number);
            return (dateB[2] - dateA[2]) || (dateB[1] - dateA[1]) || (dateB[0] - dateA[0]);
        });

        matches.forEach((match, index) => {
            let scoreClass = "score-draw";
            if (match.ourScore > match.theirScore) scoreClass = "score-win";
            if (match.ourScore < match.theirScore) scoreClass = "score-lose";

            const card = document.createElement("div");
            card.className = "match-card clickable";
            card.innerHTML = `
                <div class="match-header">
                    <span class="match-date">${match.date}</span>
                    <span class="match-tournament">${match.tournament}</span>
                </div>
                <div class="match-body">
                    <div class="match-team">СРП</div>
                    <div class="match-score ${scoreClass}">${match.ourScore} : ${match.theirScore}</div>
                    <div class="match-team">${match.opponent}</div>
                </div>
                <div class="match-footer">
                    ${match.technical ? '<span class="badge tech">Технический</span>' : '<span>Подробнее ▾</span>'}
                </div>
            `;
            
            // Обработчик клика по карточке
            card.onclick = () => {
                modalBody.innerHTML = `
                    <div class="modal-title">${match.opponent} — ${match.ourScore}:${match.theirScore}</div>
                    <div class="modal-section">
                        <p><strong>Дата:</strong> ${match.date} в ${match.time}</p>
                        <p><strong>Турнир:</strong> ${match.tournament} (${match.format})</p>
                        <p><strong>Стадион:</strong> ${match.stadium}, ${match.city}</p>
                        <p><strong>Счёт по таймам:</strong> ${match.halfTimeOur || 0} : ${match.halfTimeTheir || 0}</p>
                    </div>
                    
                    ${match.note ? `
                    <div class="modal-section">
                        <h4>Заметка тренера</h4>
                        <p style="font-style: italic; color: #ccc;">"${match.note}"</p>
                    </div>` : ''}

                    <div class="modal-section">
                        <h4>Состав (${match.lineup ? match.lineup.length : 0} чел.)</h4>
                        <p>${match.lineup && match.lineup.length > 0 ? match.lineup.join(', ') : 'Не указан'}</p>
                    </div>

                    ${!match.technical ? `
                    <div class="modal-section">
                        <h4>Голы</h4>
                        ${Object.keys(match.goals).length > 0 
                            ? '<ul>' + Object.entries(match.goals).map(([p, g]) => `<li><strong>${p}</strong> — ${g} ⚽</li>`).join('') + '</ul>'
                            : '<p>Нет</p>'}
                    </div>
                    <div class="modal-section">
                        <h4>Голевые передачи</h4>
                        ${Object.keys(match.assists).length > 0 
                            ? '<ul>' + Object.entries(match.assists).map(([p, a]) => `<li><strong>${p}</strong> — ${a} 🎯</li>`).join('') + '</ul>'
                            : '<p>Нет</p>'}
                    </div>
                    ` : ''}
                `;
                modal.classList.add("active");
            };
            container.appendChild(card);
        });
    } catch (e) {
        container.innerHTML = `<p>Ошибка: ${e.message}</p>`;
    }
});
