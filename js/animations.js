document.addEventListener("DOMContentLoaded", () => {
    // Находим все элементы, которые должны появляться плавно
    const elementsToAnimate = document.querySelectorAll('.section, .info-block, .match-card, .coach-card, .pricing-card');
    
    // Добавляем им класс для начального состояния (скрыты)
    elementsToAnimate.forEach(el => el.classList.add('fade-in-element'));

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Анимируем только 1 раз
            }
        });
    }, { threshold: 0.1 });

    elementsToAnimate.forEach(el => observer.observe(el));
});

// Скрипт для удобного открытия меню на телефонах
document.addEventListener("DOMContentLoaded", () => {
    const dropbtn = document.querySelector('.dropbtn');
    const dropdownContent = document.querySelector('.dropdown-content');

    if (dropbtn && dropdownContent) {
        // При клике на "Летопись"
        dropbtn.addEventListener('click', function(e) {
            // Если это мобильный телефон (ширина экрана <= 768)
            if (window.innerWidth <= 768) {
                e.preventDefault(); // Отменяем переход по ссылке (чтобы меню просто открылось)
                dropdownContent.classList.toggle('show');
            }
        });

        // Закрываем меню, если кликнули в любое другое место
        document.addEventListener('click', function(e) {
            if (window.innerWidth <= 768 && !e.target.closest('.dropdown')) {
                dropdownContent.classList.remove('show');
            }
        });
    }
});
