document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("nominations-list");
    try {
        const str = window.BACKUP_DATA.letopis.data.nominations_json_srp_kids;
        const nominations = JSON.parse(str);
        
        container.innerHTML = "";

        if (nominations.length === 0) {
            container.innerHTML = "<p>Пока нет номинаций.</p>";
            return;
        }

        nominations.forEach(n => {
            const card = document.createElement("div");
            card.className = "nomination-card";
            
            // Обрабатываем переносы строк в описании
            const desc = n.description ? n.description.replace(/\n/g, '<br>') : '';

            card.innerHTML = `
                <div class="nomination-title">${n.title} (${n.year})</div>
                <div class="nomination-player">🏆 ${n.player || 'Команда'}</div>
                <div style="font-size:14px; color:#a0a0a0; line-height:1.8;">${desc}</div>
            `;
            container.appendChild(card);
        });
    } catch (e) {
        container.innerHTML = `<p>Ошибка: ${e.message}</p>`;
    }
});
