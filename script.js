/* =========================================================
   CESARE PARATORE
   MOVIMENTO CON DIREZIONE
   HOME — FINAL NARRATIVE SYSTEM
   ========================================================= */

(() => {
  "use strict";


  /* =======================================================
     CONFIG
     ======================================================= */

  const CFG = {
    loaderMin: 700,
    loaderMax: 2200,
    revealThreshold: 0.12,
    cursorLerp: 0.18,
    resizeDebounce: 160,
    navOffset: 18,
    transitionMs: 620,
    trajectoryLerp: 0.09,
    trajectoryDrift: 18,
    magneticStrength: 0.12,
    magneticRadius: 90,
    standbyDelay: 45000
  };


  /* =======================================================
     DOM
     ======================================================= */

  const body = document.body;
  const loader = document.getElementById("loader");
  const header = document.getElementById("site-header");
  const menu = document.getElementById("site-menu");
  const menuToggle = document.querySelector(".menu-toggle");
  const menuLinks = [...document.querySelectorAll("[data-menu-link]")];

  const chapters = [
    ...document.querySelectorAll(".chapter[data-chapter]")
  ];

  const reveals = [
    ...document.querySelectorAll(".reveal")
  ];

  const progressCurrent =
    document.querySelector(".wow-progress-current");

  const progressFill =
    document.querySelector(".wow-progress-fill");

  const progressTotal =
    document.querySelector(".wow-progress-total");

  const standby =
    document.getElementById("standby");


  /* =======================================================
     STATE
     ======================================================= */

  let currentChapter = 1;
  let lastScrollY = window.scrollY;

  let resizeTimer = null;

  let standbyTimer = null;

  let menuOpen = false;

  let pointerX = window.innerWidth / 2;
  let pointerY = window.innerHeight / 2;

  let magneticX = 0;
  let magneticY = 0;

  let trajectoryTarget = 0;
  let trajectoryCurrent = 0;

  const DIRECTIONS = [
    "sport",
    "scienze-motorie",
    "educazione",
    "management",
    "digitale"
  ];

  const JOURNEY = {
    0: "origin",
    1: "sport",
    2: "exploration",
    3: "converged",
    4: "pause",
    5: "territory",
    6: "integrated",
    7: "possibility",
    8: "reader",
    9: "complete"
  };


  /* =======================================================
     HELPERS
     ======================================================= */

  const clamp = (value, min, max) =>
    Math.min(Math.max(value, min), max);

  const lerp = (a, b, amount) =>
    a + (b - a) * amount;

  const getChapterNumber = (chapter) =>
    Number(chapter?.dataset.chapter || 0);


  /* =======================================================
     LOADER
     ======================================================= */

  function initLoader() {

    if (!loader) {
      return;
    }

    const start = performance.now();

    const finish = () => {
      const elapsed = performance.now() - start;
      const remaining = Math.max(0, CFG.loaderMin - elapsed);

      window.setTimeout(() => {
        loader.classList.add("is-complete");
        window.setTimeout(() => {
          loader.remove();
        }, 950);
      }, remaining);
    };

    window.setTimeout(finish, CFG.loaderMax);
    window.addEventListener("load", finish, { once: true });
  }


  /* =======================================================
     PAGE TRANSITIONS
     ======================================================= */

  function sameOriginInternalLink(link) {

    if (!link) {
      return false;
    }

    if (link.target === "_blank") {
      return false;
    }

    if (link.hasAttribute("download")) {
      return false;
    }

    const href = link.getAttribute("href");

    if (!href || href.startsWith("#")) {
      return false;
    }

    try {
      const url = new URL(href, window.location.href);

      return (
        url.origin === window.location.origin &&
        url.pathname !== window.location.pathname
      );
    } catch {
      return false;
    }
  }


  function initPageTransitions() {

    document
      .querySelectorAll("a")
      .forEach((link) => {

        if (!sameOriginInternalLink(link)) {
          return;
        }

        link.addEventListener("click", (event) => {

          if (
            event.metaKey ||
            event.ctrlKey ||
            event.shiftKey ||
            event.altKey
          ) {
            return;
          }

          event.preventDefault();

          const destination =
            link.href;

          body.classList.add("is-navigating");

          window.setTimeout(() => {
            window.location.href = destination;
          }, CFG.transitionMs);
        });

      });
  }


  /* =======================================================
     MENU
     ======================================================= */

  function openMenu() {

    if (!menu || !menuToggle) {
      return;
    }

    menuOpen = true;

    menu.classList.add("is-open");
    menu.setAttribute("aria-hidden", "false");

    menuToggle.setAttribute("aria-expanded", "true");
    menuToggle.setAttribute("aria-label", "Chiudi menu");

    body.classList.add("is-locked");

    const firstLink = menuLinks[0];

    window.setTimeout(() => {
      firstLink?.focus();
    }, 450);
  }


  function closeMenu(returnFocus = true) {

    if (!menu || !menuToggle) {
      return;
    }

    menuOpen = false;

    menu.classList.remove("is-open");
    menu.setAttribute("aria-hidden", "true");

    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Apri menu");

    body.classList.remove("is-locked");

    if (returnFocus) {
      menuToggle.focus();
    }
  }


  function toggleMenu() {

    if (menuOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  }


  function initMenu() {

    if (!menuToggle) {
      return;
    }

    menuToggle.addEventListener("click", toggleMenu);

    menuLinks.forEach((link) => {
      link.addEventListener("click", () => {
        closeMenu(false);
      });
    });

    document.addEventListener("keydown", (event) => {

      if (!menuOpen) {
        return;
      }

      if (event.key === "Escape") {
        event.preventDefault();
        closeMenu();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const focusable = [
        menuToggle,
        ...menuLinks
      ].filter(Boolean);

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (
        !event.shiftKey &&
        document.activeElement === last
      ) {
        event.preventDefault();
        first.focus();
      }
    });
  }


  /* =======================================================
     NAVIGATION
     ======================================================= */

  function goTo(number, behavior = "smooth") {

    const target = chapters.find(
      chapter => getChapterNumber(chapter) === number
    );

    if (!target) {
      return;
    }

    const headerHeight =
      header?.offsetHeight || 0;

    const top =
      target.getBoundingClientRect().top +
      window.scrollY -
      headerHeight -
      CFG.navOffset;

    window.scrollTo({
      top: Math.max(0, top),
      behavior
    });
  }


  function initKeyboardNavigation() {

    document.addEventListener("keydown", (event) => {

      if (
        menuOpen ||
        event.target.matches(
          "input, textarea, select, button, a"
        )
      ) {
        return;
      }

      if (event.key === "PageDown") {

        event.preventDefault();

        goTo(
          clamp(
            currentChapter + 1,
            1,
            chapters.length
          )
        );
      }

      if (event.key === "PageUp") {

        event.preventDefault();

        goTo(
          clamp(
            currentChapter - 1,
            1,
            chapters.length
          )
        );
      }

    });
  }


  /* =======================================================
     PROGRESS
     ======================================================= */

  function wowUpdate() {

    if (!chapters.length) {
      return;
    }

    const viewportPoint =
      window.scrollY +
      window.innerHeight * 0.45;

    let closest = chapters[0];
    let closestDistance = Infinity;

    chapters.forEach((chapter) => {

      const rect =
        chapter.getBoundingClientRect();

      const center =
        rect.top +
        window.scrollY +
        rect.height / 2;

      const distance =
        Math.abs(center - viewportPoint);

      if (distance < closestDistance) {
        closest = chapter;
        closestDistance = distance;
      }
    });

    currentChapter =
      getChapterNumber(closest);

    const total =
      chapters.length;

    const progress =
      total <= 1
        ? 1
        : (currentChapter - 1) / (total - 1);

    if (progressCurrent) {
      progressCurrent.textContent =
        String(currentChapter).padStart(2, "0");
    }

    if (progressTotal) {
      progressTotal.textContent =
        String(total).padStart(2, "0");
    }

    if (progressFill) {
      progressFill.style.transform =
        `scaleX(${clamp(progress, 0, 1)})`;
    }

    applyJourneyState(currentChapter);
  }


  /* =======================================================
     JOURNEY STATE
     ======================================================= */

  function applyJourneyState(number) {

    const state =
      JOURNEY[number - 1] || "origin";

    document.documentElement.dataset.journey =
      state;

    chapters.forEach((chapter) => {

      const chapterNumber =
        getChapterNumber(chapter);

      chapter.classList.toggle(
        "is-current",
        chapterNumber === number
      );

      chapter.classList.toggle(
        "is-past",
        chapterNumber < number
      );

      chapter.classList.toggle(
        "is-future",
        chapterNumber > number
      );
    });

    const directionNodes =
      document.querySelectorAll(
        ".network-node"
      );

    if (number >= 4) {
      directionNodes.forEach(
        node => node.classList.add("is-active")
      );
    } else {
      directionNodes.forEach(
        node => node.classList.remove("is-active")
      );
    }
  }


  /* =======================================================
     REVEAL
     ======================================================= */

  function initReveal() {

    if (
      !("IntersectionObserver" in window)
    ) {
      reveals.forEach(
        element => element.classList.add("is-visible")
      );

      return;
    }

    const observer =
      new IntersectionObserver(
        (entries) => {

          entries.forEach((entry) => {

            if (!entry.isIntersecting) {
              return;
            }

            entry.target.classList.add(
              "is-visible"
            );

            observer.unobserve(
              entry.target
            );
          });

        },
        {
          threshold: CFG.revealThreshold,
          rootMargin: "0px 0px -8% 0px"
        }
      );

    reveals.forEach(
      element => observer.observe(element)
    );
  }


  /* =======================================================
     DIRECTION INTERACTION
     ======================================================= */

  function initDirections() {

    const links =
      document.querySelectorAll(
        ".direction-link"
      );

    links.forEach((link) => {

      link.addEventListener(
        "mouseenter",
        () => {

          const direction =
            link.dataset.direction;

          if (!direction) {
            return;
          }

          document.documentElement.dataset.direction =
            direction;
        }
      );

      link.addEventListener(
        "mouseleave",
        () => {

          delete document.documentElement
            .dataset.direction;
        }
      );

      link.addEventListener(
        "focus",
        () => {

          const direction =
            link.dataset.direction;

          if (!direction) {
            return;
          }

          document.documentElement.dataset.direction =
            direction;
        }
      );

      link.addEventListener(
        "blur",
        () => {

          delete document.documentElement
            .dataset.direction;
        }
      );

    });
  }


  /* =======================================================
     MAGNETIC CURSOR
     ======================================================= */

  function supportsFinePointer() {

    return window.matchMedia(
      "(pointer: fine)"
    ).matches;
  }


  function initCursor() {

    if (!supportsFinePointer()) {
      return;
    }

    const interactive =
      document.querySelectorAll(
        "a, button"
      );

    document.addEventListener(
      "pointermove",
      (event) => {

        pointerX = event.clientX;
        pointerY = event.clientY;
      },
      {
        passive: true
      }
    );

    function frame() {

      let targetX = 0;
      let targetY = 0;

      interactive.forEach((element) => {

        const rect =
          element.getBoundingClientRect();

        if (
          pointerX < rect.left - CFG.magneticRadius ||
          pointerX > rect.right + CFG.magneticRadius ||
          pointerY < rect.top - CFG.magneticRadius ||
          pointerY > rect.bottom + CFG.magneticRadius
        ) {
          return;
        }

        const centerX =
          rect.left +
          rect.width / 2;

        const centerY =
          rect.top +
          rect.height / 2;

        const dx =
          pointerX - centerX;

        const dy =
          pointerY - centerY;

        const distance =
          Math.sqrt(dx * dx + dy * dy);

        if (distance > CFG.magneticRadius) {
          return;
        }

        const strength =
          (1 - distance / CFG.magneticRadius) *
          CFG.magneticStrength;

        targetX += dx * strength;
        targetY += dy * strength;
      });

      magneticX =
        lerp(
          magneticX,
          targetX,
          CFG.cursorLerp
        );

      magneticY =
        lerp(
          magneticY,
          targetY,
          CFG.cursorLerp
        );

      document.documentElement.style
        .setProperty(
          "--magnetic-x",
          `${magneticX}px`
        );

      document.documentElement.style
        .setProperty(
          "--magnetic-y",
          `${magneticY}px`
        );

      requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);
  }


  /* =======================================================
     TRAJECTORY
     ======================================================= */

  function updateTrajectory() {

    const center =
      window.innerHeight / 2;

    const normalized =
      clamp(
        (pointerY - center) /
        Math.max(center, 1),
        -1,
        1
      );

    trajectoryTarget =
      normalized *
      CFG.trajectoryDrift;

    trajectoryCurrent =
      lerp(
        trajectoryCurrent,
        trajectoryTarget,
        CFG.trajectoryLerp
      );

    document.documentElement.style
      .setProperty(
        "--trajectory-drift",
        `${trajectoryCurrent}px`
      );

    requestAnimationFrame(
      updateTrajectory
    );
  }


  function initTrajectory() {

    if (!supportsFinePointer()) {
      return;
    }

    document.addEventListener(
      "pointermove",
      (event) => {
        pointerY = event.clientY;
      },
      {
        passive: true
      }
    );

    requestAnimationFrame(
      updateTrajectory
    );
  }


  /* =======================================================
     CTA ENGAGEMENT
     ======================================================= */

  function initCTA() {

    const cta =
      document.querySelector(
        ".final-cta"
      );

    if (!cta) {
      return;
    }

    cta.addEventListener(
      "mouseenter",
      () => {
        document.documentElement
          .classList.add("cta-engaged");
      }
    );

    cta.addEventListener(
      "mouseleave",
      () => {
        document.documentElement
          .classList.remove("cta-engaged");
      }
    );

    cta.addEventListener(
      "focus",
      () => {
        document.documentElement
          .classList.add("cta-engaged");
      }
    );

    cta.addEventListener(
      "blur",
      () => {
        document.documentElement
          .classList.remove("cta-engaged");
      }
    );
  }


  /* =======================================================
     STANDBY
     ======================================================= */

  function closeStandby() {

    if (!standby) {
      return;
    }

    standby.classList.remove(
      "is-active"
    );

    standby.setAttribute(
      "aria-hidden",
      "true"
    );

    body.classList.remove(
      "is-locked"
    );
  }


  function openStandby() {

    if (
      !standby ||
      menuOpen
    ) {
      return;
    }

    standby.classList.add(
      "is-active"
    );

    standby.setAttribute(
      "aria-hidden",
      "false"
    );

    body.classList.add(
      "is-locked"
    );
  }


  function resetStandbyTimer() {

    window.clearTimeout(
      standbyTimer
    );

    closeStandby();

    standbyTimer =
      window.setTimeout(
        openStandby,
        CFG.standbyDelay
      );
  }


  function initStandby() {

    [
      "pointermove",
      "pointerdown",
      "wheel",
      "touchstart",
      "keydown",
      "scroll"
    ].forEach((eventName) => {

      window.addEventListener(
        eventName,
        resetStandbyTimer,
        {
          passive: true
        }
      );

    });

    if (standby) {

      standby.addEventListener(
        "click",
        () => {
          resetStandbyTimer();
        }
      );

    }

    resetStandbyTimer();
  }


  /* =======================================================
     HASH
     ======================================================= */

  function initHashNavigation() {

    const hash =
      window.location.hash;

    if (!hash) {
      return;
    }

    const target =
      document.querySelector(hash);

    if (!target) {
      return;
    }

    window.setTimeout(() => {

      target.scrollIntoView({
        behavior: "auto",
        block: "start"
      });

    }, 100);
  }


  /* =======================================================
     SCROLL
     ======================================================= */

  function initScroll() {

    let ticking = false;

    const update = () => {

      wowUpdate();

      const currentY =
        window.scrollY;

      body.classList.toggle(
        "is-scrolling-down",
        currentY > lastScrollY
      );

      body.classList.toggle(
        "is-scrolling-up",
        currentY < lastScrollY
      );

      lastScrollY =
        currentY;

      ticking = false;
    };

    window.addEventListener(
      "scroll",
      () => {

        if (ticking) {
          return;
        }

        ticking = true;

        requestAnimationFrame(
          update
        );
      },
      {
        passive: true
      }
    );

    update();
  }


  /* =======================================================
     RESIZE
     ======================================================= */

  function initResize() {

    window.addEventListener(
      "resize",
      () => {

        window.clearTimeout(
          resizeTimer
        );

        resizeTimer =
          window.setTimeout(
            () => {
              wowUpdate();
            },
            CFG.resizeDebounce
          );
      },
      {
        passive: true
      }
    );
  }


  /* =======================================================
     INIT
     ======================================================= */

  function init() {

    initLoader();

    initMenu();

    initPageTransitions();

    initReveal();

    initDirections();

    initCursor();

    initTrajectory();

    initCTA();

    initStandby();

    initKeyboardNavigation();

    initScroll();

    initResize();

    initHashNavigation();

    wowUpdate();

    window.setTimeout(
      closeStandby,
      0
    );
  }


  /* =======================================================
     START
     ======================================================= */

  if (
    document.readyState === "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      init,
      { once: true }
    );
  } else {
    init();
  }

})();
