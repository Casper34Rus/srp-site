let currentPlayers = [];
let currentSortKey = 'total';
let isAscending = false;

document.addEventListener("DOMContentLoaded", () => {
    try {
        const matchesStr = window.BACKUP_DATA.letopis.data.matches_json_srp_kids;
        const matches = JSON.parse(matchesStr);
        
        const stats = {}; 

        function ensurePlayer(name) {
            if (!stats[name]) {
                stats[name] = { name: name, games: 0, goals: 0, assists: 0, yellow: 0, red: 0 };
            }
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
            if (m.yellowCards && Array.isArray(m.yellowCards)) {
                m.yellowCards.forEach(p => { ensurePlayer(p); stats[p].yellow++; });
            }
            if (m.redCards && Array.isArray(m.redCards)) {
                m.redCards.forEach(p => { ensurePlayer(p); stats[p].red++; });
            }
        });

        currentPlayers = Object.values(stats).map(p => {
            return { ...p, total: p.goals + p.assists };
        });
        
        renderTable();

    } catch (e) {
        document.getElementById("stats-body").innerHTML = `<tr><td colspan="7">Ошибка: ${e.message}</td></tr>`;
    }
});

window.sortBy = function(key) {
    if (currentSortKey === key) {
        isAscending = !isAscending;
    } else {
        currentSortKey = key;
        isAscending = false; // По умолчанию сортируем по убыванию (сначала больше)
    }

    // Обновляем стрелочки в заголовках
    document.querySelectorAll('.sortable').forEach(el => el.classList.remove('asc', 'desc'));
    const th = Array.from(document.querySelectorAll('.sortable')).find(el => el.getAttribute('onclick').includes(key));
    if (th) th.classList.add(isAscending ? 'asc' : 'desc');

    renderTable();
}

function renderTable() {
    const tbody = document.getElementById("stats-body");
    tbody.innerHTML = "";

    currentPlayers.sort((a, b) => {
        let valA = a[currentSortKey];
        let valB = b[currentSortKey];

        // Для строк (имена) используем localeCompare
        if (typeof valA === 'string') {
            return isAscending ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        
        // Для чисел
        if (valA === valB) {
            // Если равны, сортируем по голам (приоритет)
            if (currentSortKey !== 'goals') {
                return b.goals - a.goals;
            }
            return a.name.localeCompare(b.name);
        }
        
        return isAscending ? valA - valB : valB - valA;
    });

    currentPlayers.forEach(p => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td><strong>${p.name}</strong></td>
            <td style="text-align:center;">${p.games}</td>
            <td style="text-align:center; color:#4ade80; font-weight:bold;">${p.goals}</td>
            <td style="text-align:center; color:#3b82f6; font-weight:bold;">${p.assists}</td>
            <td style="text-align:center; color:#fbbf24;">${p.yellow || '-'}</td>
            <td style="text-align:center; color:#ef4444;">${p.red || '-'}</td>
            <td style="text-align:center; font-weight:bold; font-size:18px;">${p.total}</td>
        `;
        tbody.appendChild(tr);
    });
}
