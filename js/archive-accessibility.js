/* Support the existing match and tournament modals. */
(() => {
  "use strict";
  document.addEventListener("DOMContentLoaded", () => {
    ["matchModal", "tournamentModal"].forEach((id) => {
      const overlay = document.getElementById(id);
      if (!overlay) return;
      const close = overlay.querySelector(".modal-close");
      if (!close) return;
      let wasOpen = overlay.classList.contains("active");
      let previousFocus = null;
      overlay.addEventListener("click", (event) => {
        if (event.target === overlay && overlay.classList.contains("active")) close.click();
      });
      document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && overlay.classList.contains("active")) {
          event.preventDefault();
          close.click();
        }
      });
      const observer = new MutationObserver(() => {
        const isOpen = overlay.classList.contains("active");
        if (isOpen && !wasOpen) {
          previousFocus = document.activeElement;
          close.focus();
        } else if (!isOpen && wasOpen && previousFocus &&
                   typeof previousFocus.focus === "function") {
          previousFocus.focus();
        }
        wasOpen = isOpen;
      });
      observer.observe(overlay, { attributes: true, attributeFilter: ["class"] });
    });
  });
})();
