document.addEventListener("DOMContentLoaded", () => {
    const tbody = document.querySelector("#tournaments-table tbody");
    const modal = document.getElementById("tournamentModal");
    const modalBody = document.getElementById("modalTournamentBody");

    window.closeTournamentModal = function() {
        modal.classList.remove("active");
    }

    try {
        const tourStr = window.BACKUP_DATA.letopis.data.tournaments_json_srp_kids;
        const matchesStr = window.BACKUP_DATA.letopis.data.matches_json_srp_kids;
        
        const tournaments = JSON.parse(tourStr);
        const matches = JSON.parse(matchesStr);
        
        tournaments.sort((a, b) => b.season.localeCompare(a.season));

        tournaments.forEach(t => {
            // Считаем статистику по этому турниру
            const tMatches = matches.filter(m => m.tournament === t.name && !m.technical);
            const wins = tMatches.filter(m => m.ourScore > m.theirScore).length;
            const draws = tMatches.filter(m => m.ourScore === m.theirScore).length;
            const losses = tMatches.filter(m => m.ourScore < m.theirScore).length;

            const tr = document.createElement("tr");
            tr.className = "clickable";
            tr.innerHTML = `
                <td>${t.season}</td>
                <td><strong>${t.name}</strong></td>
                <td>${t.city || '—'}</td>
                <td>${t.organizer || '—'}</td>
            `;
            
            tr.onclick = () => {
                let matchesHtml = "";
                if (tMatches.length === 0) {
                    matchesHtml = "<p>Нет записей о матчах в этом турнире.</p>";
                } else {
                    matchesHtml = '<ul>' + tMatches.map(m => `
                        <li style="margin-bottom:8px;">
                            <strong>${m.date}</strong>: СРП ${m.ourScore} : ${m.theirScore} ${m.opponent}
                        </li>
                    `).join('') + '</ul>';
                }

                modalBody.innerHTML = `
                    <div class="modal-title">${t.name}</div>
                    <div class="modal-section">
                        <p><strong>Сезон:</strong> ${t.season}</p>
                        <p><strong>Город:</strong> ${t.city}</p>
                        <p><strong>Организатор:</strong> ${t.organizer || '—'}</p>
                    </div>
                    <div class="modal-section">
                        <h4>Статистика в турнире</h4>
                        <p>Игр: ${tMatches.length} | <span style="color:#4ade80">В: ${wins}</span> | <span style="color:#fbbf24">Н: ${draws}</span> | <span style="color:#ef4444">П: ${losses}</span></p>
                    </div>
                    <div class="modal-section">
                        <h4>Результаты матчей</h4>
                        ${matchesHtml}
                    </div>
                `;
                modal.classList.add("active");
            };
            tbody.appendChild(tr);
        });
    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="4">Ошибка: ${e.message}</td></tr>`;
    }
});
