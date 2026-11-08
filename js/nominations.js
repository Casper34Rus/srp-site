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

        // Функция подбора картинки под название номинации
        function getTrophyImage(title) {
            const t = title.toLowerCase();
            if (t.includes('бомбардир')) return 'assets/award-boot.jpg';
            if (t.includes('mvp') || t.includes('игрок')) return 'assets/award-mvp.jpg';
            if (t.includes('воля') || t.includes('характер')) return 'assets/award-globe.jpg';
            if (t.includes('прогресс') || t.includes('открытие')) return 'assets/award-wreath.jpg';
            return 'assets/award-mvp.jpg'; // Картинка по умолчанию
        }

        nominations.forEach(n => {
            const desc = n.description ? n.description.replace(/\n/g, '<br>') : '';
            const imgSrc = getTrophyImage(n.title);

            const card = document.createElement("div");
            card.className = "award-card";
            card.innerHTML = `
                <div class="award-image" style="padding: 0; overflow: hidden;">
                    <img src="${imgSrc}" alt="${n.title}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.style.display='none'">
                </div>
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
