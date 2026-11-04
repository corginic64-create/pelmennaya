/* ============================================================
   Пельмень — спокойные анимации
   ============================================================ */

(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- появление блоков ---------- */

  var revealEls = Array.prototype.slice.call(document.querySelectorAll(".reveal"));

  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  } else {
    var observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });

    revealEls.forEach(function (el) { observer.observe(el); });
  }

  /* ---------- шапка ---------- */

  var nav = document.getElementById("nav");

  if (nav) {
    var ticking = false;

    function updateNav() {
      nav.classList.toggle("is-stuck", (window.scrollY || window.pageYOffset || 0) > 40);
      ticking = false;
    }

    window.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(updateNav);
    }, { passive: true });

    updateNav();
  }

  /* ---------- меню: открыть / свернуть ---------- */

  var menuBody = document.getElementById("menu-body");
  var menuToggle = document.querySelector("[data-menu-toggle]");

  if (menuBody && menuToggle) {
    var menuInner = menuBody.querySelector(".menu__body-inner");
    var menuLabel = menuToggle.querySelector(".menu__toggle-label");

    function setMenu(open) {
      menuBody.classList.toggle("is-open", open);
      menuToggle.setAttribute("aria-expanded", open ? "true" : "false");
      if (menuLabel) menuLabel.textContent = open ? "Свернуть меню" : "Открыть меню";
      if (menuInner) menuInner.inert = !open;
    }

    setMenu(false);

    menuToggle.addEventListener("click", function () {
      var open = !menuBody.classList.contains("is-open");
      setMenu(open);

      if (!open && menuToggle.getBoundingClientRect().top < 0) {
        menuToggle.scrollIntoView({
          behavior: reduceMotion ? "auto" : "smooth",
          block: "center"
        });
      }
    });

    function openForHash(hash) {
      if (hash === "#menu") {
        setMenu(true);
        return;
      }
      if (hash.indexOf("#m-") !== 0) return;

      var target = document.getElementById(hash.slice(1));
      if (!target) return;

      var wasClosed = !menuBody.classList.contains("is-open");
      setMenu(true);
      if (!wasClosed) return;

      var scrollToTarget = function () {
        target.scrollIntoView({
          behavior: reduceMotion ? "auto" : "smooth",
          block: "start"
        });
      };

      if (reduceMotion) {
        scrollToTarget();
      } else {
        menuBody.addEventListener("transitionend", function onEnd(event) {
          if (event.propertyName !== "grid-template-rows") return;
          menuBody.removeEventListener("transitionend", onEnd);
          scrollToTarget();
        });
      }
    }

    openForHash(window.location.hash);

    window.addEventListener("hashchange", function () {
      openForHash(window.location.hash);
    });

    Array.prototype.forEach.call(
      document.querySelectorAll('a[href="#menu"]'),
      function (link) {
        link.addEventListener("click", function () { setMenu(true); });
      }
    );
  }
})();
