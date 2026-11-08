document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("awards-container");
    try {
        const str = window.BACKUP_DATA.letopis.data.nominations_json_srp_kids;
        const nominations = JSON.parse(str);
        
        container.innerHTML = "";

        if (nominations.length === 0) {
            container.innerHTML = "<p>Пока нет номинаций.</p>";
            return;
        }

        // Подбираем иконку-трофей в зависимости от названия номинации
        function getTrophyIcon(title) {
            if (title.includes('бомбардир')) return '👟'; // Золотая бутса
            if (title.includes('MVP') || title.includes('Игрок')) return '🏆'; // Кубок
            if (title.includes('воля') || title.includes('характер')) return '🛡️';
            if (title.includes('прогресс')) return '📈';
            return '🥇';
        }

        nominations.forEach(n => {
            const desc = n.description ? n.description.replace(/\n/g, '<br>') : '';
            const icon = getTrophyIcon(n.title.toLowerCase());

            const card = document.createElement("div");
            card.className = "award-card";
            card.innerHTML = `
                <div class="award-image">${icon}</div>
                <div class="award-content">
                    <div class="award-title">${n.title} (${n.year})</div>
                    <div class="award-subtitle">Номинация сезона</div>
                    <div class="award-player">🏅 ${n.player || 'Команда'}</div>
                    <div class="award-desc">${desc}</div>
                </div>
            `;
            container.appendChild(card);
        });
    } catch (e) {
        container.innerHTML = `<p>Ошибка: ${e.message}</p>`;
    }
});
