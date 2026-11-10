(function () {
  "use strict";

  var CONSENT_KEY = "srp_analytics_consent_v1";
  var COUNTER_ID = 114132098;
  var consentValue = null;
  var banner = null;

  function readConsent() {
    try {
      var saved = localStorage.getItem(CONSENT_KEY);
      if (saved === "accepted" || saved === "rejected") return saved;
    } catch (error) {}
    return null;
  }

  function startAnalytics() {
    if (window.__srpMetrikaStarted) return;
    window.__srpMetrikaStarted = true;

    (function (m, e, t, r, i, k, a) {
      m[i] = m[i] || function () {
        (m[i].a = m[i].a || []).push(arguments);
      };
      m[i].l = 1 * new Date();
      k = e.createElement(t);
      a = e.getElementsByTagName(t)[0];
      k.async = 1;
      k.src = r;
      a.parentNode.insertBefore(k, a);
    })(window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

    window.ym(COUNTER_ID, "init", {
      clickmap: true,
      trackLinks: true,
      accurateTrackBounce: true,
      webvisor: true
    });
  }

  function saveConsent(value) {
    consentValue = value;
    try {
      localStorage.setItem(CONSENT_KEY, value);
    } catch (error) {}
    if (value === "accepted") startAnalytics();
    hideBanner();
    updateSettingsButton();
  }

  function hideBanner() {
    if (banner) banner.hidden = true;
  }

  function showBanner() {
    if (!banner) return;
    banner.hidden = false;
    var accept = banner.querySelector("[data-consent-accept]");
    if (accept) accept.focus();
  }

  function updateSettingsButton() {
    var button = document.querySelector("[data-cookie-settings]");
    if (button) {
      button.textContent = consentValue === "accepted"
        ? "Настройки cookie"
        : "Настройки аналитики";
    }
  }

  function createInterface() {
    var styleLink = document.querySelector('link[href*="cookie-consent.css"]');
    if (!styleLink) {
      styleLink = document.createElement("link");
      styleLink.rel = "stylesheet";
      styleLink.href = "/css/cookie-consent.css?v=1";
      document.head.appendChild(styleLink);
    }

    banner = document.createElement("section");
    banner.className = "srp-cookie-banner";
    banner.setAttribute("role", "dialog");
    banner.setAttribute("aria-modal", "false");
    banner.setAttribute("aria-labelledby", "srp-cookie-title");
    banner.setAttribute("aria-describedby", "srp-cookie-description");
    banner.hidden = true;
    banner.innerHTML =
      '<div class="srp-cookie-banner__content">' +
        '<div class="srp-cookie-banner__copy">' +
          '<p class="srp-cookie-banner__eyebrow">Настройки конфиденциальности</p>' +
          '<h2 id="srp-cookie-title">Использовать аналитические cookie?</h2>' +
          '<p id="srp-cookie-description">Мы используем Яндекс.Метрику, чтобы понимать, как посетители работают с сайтом, и улучшать его. При разрешении также включается Вебвизор. Без вашего выбора аналитика не запускается. Вы можете отказаться или изменить решение позднее.</p>' +
          '<a class="srp-cookie-banner__link" href="/privacy.html">Политика обработки персональных данных</a>' +
        '</div>' +
        '<div class="srp-cookie-banner__actions">' +
          '<button type="button" class="srp-cookie-banner__button srp-cookie-banner__button--accept" data-consent-accept>Разрешить аналитику</button>' +
          '<button type="button" class="srp-cookie-banner__button srp-cookie-banner__button--reject" data-consent-reject>Отказаться</button>' +
        '</div>' +
      '</div>';

    var settings = document.createElement("button");
    settings.type = "button";
    settings.className = "srp-cookie-settings";
    settings.setAttribute("data-cookie-settings", "");
    settings.setAttribute("aria-label", "Изменить настройки аналитических cookie");
    settings.textContent = "Настройки аналитики";
    settings.addEventListener("click", showBanner);

    banner.querySelector("[data-consent-accept]").addEventListener("click", function () {
      saveConsent("accepted");
    });
    banner.querySelector("[data-consent-reject]").addEventListener("click", function () {
      saveConsent("rejected");
    });

    document.body.appendChild(banner);
    document.body.appendChild(settings);
    updateSettingsButton();
  }

  function init() {
    consentValue = readConsent();
    createInterface();

    if (consentValue === "accepted") {
      startAnalytics();
    } else if (consentValue === null) {
      showBanner();
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();