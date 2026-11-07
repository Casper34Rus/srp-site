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
