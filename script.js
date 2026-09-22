(() => {
  "use strict";

  const loader = document.getElementById("siteLoader");
  const menu = document.getElementById("siteMenu");
  const menuTrigger = document.getElementById("menuTrigger");
  const menuClose = document.getElementById("menuClose");

  const sections = [...document.querySelectorAll(".narrative-section")];

  const nav = document.getElementById("sectionNav");
  const navTitle = document.getElementById("navTitle");
  const navPrev = document.getElementById("navPrev");
  const navNext = document.getElementById("navNext");

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  let activeIndex = 0;
  let standbyTimer = null;
  let standbyLayer = null;
  let loaderFinished = false;

  /* =========================================================
     MENU
     ========================================================= */

  function setMenu(open) {
    menu.classList.toggle("is-open", open);
    menu.setAttribute("aria-hidden", String(!open));
    menuTrigger.setAttribute("aria-expanded", String(open));
    document.body.classList.toggle("menu-open", open);

    if (window.gsap) {
      if (open) {
        gsap.set(menu, {
          visibility: "visible"
        });

        gsap.to(menu, {
          opacity: 1,
          duration: reduceMotion ? 0 : 0.45,
          ease: "power2.out"
        });

        window.setTimeout(() => {
          menuClose.focus();
        }, reduceMotion ? 0 : 50);

      } else {
        gsap.to(menu, {
          opacity: 0,
          duration: reduceMotion ? 0 : 0.35,
          ease: "power2.in",
          onComplete: () => {
            gsap.set(menu, {
              visibility: "hidden"
            });
          }
        });

        window.setTimeout(() => {
          menuTrigger.focus();
        }, reduceMotion ? 0 : 50);
      }

    } else {
      menu.style.visibility = open ? "visible" : "hidden";
      menu.style.opacity = open ? "1" : "0";

      if (open) {
        menuClose.focus();
      } else {
        menuTrigger.focus();
      }
    }
  }

  menuTrigger.addEventListener("click", () => {
    setMenu(true);
  });

  menuClose.addEventListener("click", () => {
    setMenu(false);
  });

  menu.addEventListener("click", (event) => {
    if (event.target === menu) {
      setMenu(false);
    }
  });

  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      setMenu(false);
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menu.classList.contains("is-open")) {
      setMenu(false);
    }
  });

  /* =========================================================
     STANDBY
     ========================================================= */

  function ensureStandbyLayer() {
    if (standbyLayer) return;

    standbyLayer = document.createElement("div");

    standbyLayer.className = "standby-layer";
    standbyLayer.setAttribute("aria-hidden", "true");

    standbyLayer.innerHTML = `
      <div class="standby-word">GUARDA.</div>
    `;

    document.body.appendChild(standbyLayer);
  }

  function showStandby() {
    if (document.body.classList.contains("menu-open")) return;

    ensureStandbyLayer();

    document.body.classList.add("is-standby");
    standbyLayer.classList.add("is-visible");
    standbyLayer.setAttribute("aria-hidden", "false");

    const duration = reduceMotion ? 0 : 0.8;

    if (window.gsap) {
      gsap.set(standbyLayer, {
        visibility: "visible"
      });

      gsap.to(standbyLayer, {
        opacity: 1,
        duration,
        ease: "power2.out"
      });

    } else {
      standbyLayer.style.visibility = "visible";
      standbyLayer.style.opacity = "1";
    }
  }

  function hideStandby() {
    if (!standbyLayer) return;

    document.body.classList.remove("is-standby");

    const duration = reduceMotion ? 0 : 0.5;

    if (window.gsap) {
      gsap.to(standbyLayer, {
        opacity: 0,
        duration,
        ease: "power2.in",
        onComplete: () => {
          standbyLayer.style.visibility = "hidden";
          standbyLayer.classList.remove("is-visible");
          standbyLayer.setAttribute("aria-hidden", "true");
        }
      });

    } else {
      standbyLayer.style.visibility = "hidden";
      standbyLayer.style.opacity = "0";
      standbyLayer.classList.remove("is-visible");
      standbyLayer.setAttribute("aria-hidden", "true");
    }
  }

  function resetStandbyTimer() {
    window.clearTimeout(standbyTimer);

    standbyTimer = window.setTimeout(() => {
      showStandby();
    }, 40000);
  }

  [
    "pointermove",
    "pointerdown",
    "keydown",
    "wheel",
    "touchstart",
    "scroll"
  ].forEach((eventName) => {
    window.addEventListener(
      eventName,
      () => {
        if (document.body.classList.contains("is-standby")) {
          hideStandby();
        }

        resetStandbyTimer();
      },
      { passive: true }
    );
  });

  /* =========================================================
     SECTION NAVIGATION
     ========================================================= */

  function updateNavigation(index) {
    if (!sections.length) return;

    activeIndex = index;

    navTitle.textContent = sections[index].dataset.title || "";

    navPrev.disabled = index === 0;

    navPrev.setAttribute(
      "aria-disabled",
      String(index === 0)
    );

    navNext.setAttribute(
      "aria-label",
      index === sections.length - 1
        ? "Torna a GUARDA"
        : "Sezione successiva"
    );
  }

  function goToSection(index) {
    const count = sections.length;

    if (!count) return;

    const targetIndex =
      ((index % count) + count) % count;

    sections[targetIndex].scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "start"
    });

    updateNavigation(targetIndex);
  }

  navPrev.addEventListener("click", () => {
    if (activeIndex > 0) {
      goToSection(activeIndex - 1);
    }
  });

  navNext.addEventListener("click", () => {
    goToSection(activeIndex + 1);
  });

  function initNavigationObserver() {
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (a, b) =>
              b.intersectionRatio -
              a.intersectionRatio
          );

        if (!visibleEntries.length) return;

        const index = sections.indexOf(
          visibleEntries[0].target
        );

        if (index !== -1) {
          updateNavigation(index);
        }
      },
      {
        root: null,
        rootMargin: "-35% 0px -35% 0px",
        threshold: [0.05, 0.2, 0.5, 0.8]
      }
    );

    sections.forEach((section) => {
      observer.observe(section);
    });
  }

  /* =========================================================
     GSAP / SCROLLTRIGGER
     ========================================================= */

  function initScrollMotion() {
    if (!window.gsap || !window.ScrollTrigger) {
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    if (reduceMotion) {
      sections.forEach((section) => {
        const animatedElements = section.querySelectorAll(
          ".section-title, .narrative-copy, .hero-word, .contact-line, .location-copy, .map-frame, .portrait-copy, .portrait-frame"
        );

        gsap.set(animatedElements, {
          clearProps: "all"
        });
      });

      return;
    }

    sections.forEach((section, index) => {
      const title = section.querySelector(
        ".section-title, .hero-word"
      );

      const body = section.querySelector(
        ".narrative-copy, .contact-line"
      );

      if (title) {
        gsap.fromTo(
          title,
          {
            opacity: 0,
            y: 42,
            scale: 0.985
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 1.05,
            ease: "power3.out",

            scrollTrigger: {
              trigger: section,
              start: "top 72%",
              end: "top 28%",
              toggleActions:
                "play reverse play reverse"
            }
          }
        );
      }

      if (body) {
        gsap.fromTo(
          body,
          {
            opacity: 0,
            y: 24
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            delay: 0.12,
            ease: "power2.out",

            scrollTrigger: {
              trigger: section,
              start: "top 64%",
              toggleActions:
                "play none none reverse"
            }
          }
        );
      }

      ScrollTrigger.create({
        trigger: section,
        start: "top center",
        end: "bottom center",

        onEnter: () => {
          updateNavigation(index);
        },

        onEnterBack: () => {
          updateNavigation(index);
        }
      });
    });

    ScrollTrigger.refresh();
  }

  /* =========================================================
     LOADER
     ========================================================= */

  function initLoader() {
    const finish = () => {
      if (loaderFinished) return;

      loaderFinished = true;

      const duration = reduceMotion ? 0 : 0.9;

      if (window.gsap) {
        const tl = gsap.timeline();

        tl.to(loader, {
          opacity: 0,
          duration,
          ease: "power2.inOut",

          onComplete: () => {
            loader.style.visibility = "hidden";
            loader.setAttribute("aria-hidden", "true");
          }
        });

        tl.call(() => {
          const heroWord =
            document.querySelector(".hero-word");

          if (!heroWord) return;

          gsap.fromTo(
            heroWord,
            {
              opacity: 0,
              y: 28
            },
            {
              opacity: 1,
              y: 0,
              duration: reduceMotion ? 0 : 1,
              ease: "power3.out"
            }
          );
        });

      } else {
        loader.style.opacity = "0";
        loader.style.visibility = "hidden";
        loader.setAttribute("aria-hidden", "true");
      }

      initScrollMotion();
      resetStandbyTimer();
    };

    const delay = reduceMotion ? 0 : 700;

    window.setTimeout(finish, delay);
  }

  /* =========================================================
     INIT
     ========================================================= */

  function init() {
    updateNavigation(0);

    nav.setAttribute(
      "aria-label",
      "Navigazione narrativa"
    );

    initNavigationObserver();

    if (window.gsap) {
      const heroWord =
        document.querySelector(".hero-word");

      if (heroWord) {
        gsap.set(heroWord, {
          opacity: 0
        });
      }
    }

    initLoader();
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      init,
      { once: true }
    );
  } else {
    init();
  }

})();
