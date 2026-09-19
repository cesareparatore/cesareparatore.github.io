(() => {
  "use strict";

  const body = document.body;

  const loader = document.querySelector(".page-loader");

  const menuTrigger = document.querySelector(".menu-trigger");
  const menu = document.querySelector(".site-menu");
  const menuClose = document.querySelector(".chapter-close");
  const menuLinks = [...document.querySelectorAll("[data-menu-link]")];

  const chapters = [...document.querySelectorAll(".chapter, .home-section")];

  const progressCurrent = document.getElementById("progress-current");
  const progressFill = document.getElementById("progress-fill");
  const progressPoint = document.getElementById("progress-point");

  const previousSection = document.getElementById("previous-section");
  const previousSectionLabel = document.getElementById("previous-section-label");

  const nextSection = document.getElementById("next-section");
  const nextSectionLabel = document.getElementById("next-section-label");

  const cursor = document.getElementById("cursor");

  const idleScreen = document.getElementById("idle-screen");

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let initialized = false;
  let activeIndex = 0;
  let menuOpen = false;

  let framePending = false;
  let idleTimer = null;
  let lastPointerX = 0;
  let lastPointerY = 0;

  const IDLE_DELAY = 45000;


  /* --------------------------------
     JS FALLBACK / READY
  -------------------------------- */

  body.classList.add("js-ready");


  /* --------------------------------
     LOADER
  -------------------------------- */

  const hideLoader = () => {
    if (!loader) return;

    loader.classList.add("is-hidden");

    window.setTimeout(() => {
      loader.setAttribute("aria-hidden", "true");
    }, 950);
  };

  const startLoader = () => {
    if (reducedMotion) {
      hideLoader();
      return;
    }

    const fallback = window.setTimeout(hideLoader, 5200);

    window.addEventListener("load", () => {
      window.clearTimeout(fallback);

      window.setTimeout(() => {
        hideLoader();
      }, 2400);
    }, { once: true });
  };


  /* --------------------------------
     IDLE / STANDBY
  -------------------------------- */

  const clearIdleTimer = () => {
    if (idleTimer) {
      window.clearTimeout(idleTimer);
      idleTimer = null;
    }
  };

  const exitIdle = () => {
    if (!body.classList.contains("is-idle")) return;

    body.classList.remove("is-idle");

    if (idleScreen) {
      idleScreen.setAttribute("aria-hidden", "true");
    }
  };

  const enterIdle = () => {
    if (
      menuOpen ||
      document.visibilityState !== "visible" ||
      reducedMotion
    ) {
      scheduleIdle();
      return;
    }

    body.classList.add("is-idle");

    if (idleScreen) {
      idleScreen.setAttribute("aria-hidden", "false");
    }
  };

  const scheduleIdle = () => {
    clearIdleTimer();

    if (reducedMotion) return;

    idleTimer = window.setTimeout(() => {
      enterIdle();
    }, IDLE_DELAY);
  };

  const registerActivity = () => {
    if (body.classList.contains("is-idle")) {
      exitIdle();
    }

    scheduleIdle();
  };

  [
    "pointerdown",
    "pointermove",
    "wheel",
    "touchstart",
    "keydown",
    "scroll"
  ].forEach((eventName) => {
    window.addEventListener(eventName, registerActivity, {
      passive: eventName !== "keydown"
    });
  });

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState !== "visible") {
      clearIdleTimer();
      exitIdle();
    } else {
      scheduleIdle();
    }
  });


  /* --------------------------------
     HEADER SCROLL STATE
  -------------------------------- */

  const updateHeader = () => {
    if (window.scrollY > 30) {
      body.classList.add("is-scrolled");
    } else {
      body.classList.remove("is-scrolled");
    }
  };


  /* --------------------------------
     CHAPTER PROGRESS
  -------------------------------- */

  const clamp = (value, min, max) => {
    return Math.min(Math.max(value, min), max);
  };

  const getChapterProgress = (chapter) => {
    const rect = chapter.getBoundingClientRect();
    const viewportHeight = window.innerHeight;

    const start = viewportHeight;
    const end = -rect.height;

    const raw = (start - rect.top) / (start - end);

    return clamp(raw, 0, 1);
  };

  const updateChapterProgress = () => {
    chapters.forEach((chapter) => {
      const progress = getChapterProgress(chapter);

      chapter.style.setProperty(
        "--chapter-progress",
        progress.toFixed(4)
      );
    });
  };


  /* --------------------------------
     ACTIVE CHAPTER
  -------------------------------- */

  const updateActiveChapter = (index) => {
    if (index < 0 || index >= chapters.length) return;

    activeIndex = index;

    chapters.forEach((chapter, chapterIndex) => {
      chapter.classList.toggle(
        "is-active",
        chapterIndex === index
      );

      chapter.classList.toggle(
        "is-complete",
        chapterIndex < index
      );
    });

    const current = chapters[index];

    if (progressCurrent) {
      progressCurrent.textContent =
        current.dataset.sectionTitle || "";
    }

    const previous = chapters[index - 1];
    const next = chapters[index + 1];

    if (previous && previous.id) {
      previousSection.href = `#${previous.id}`;
      previousSectionLabel.textContent =
        previous.dataset.sectionTitle || "";
      previousSection.classList.remove("is-disabled");
      previousSection.setAttribute("aria-hidden", "false");
      previousSection.tabIndex = 0;
    } else {
      previousSection.href = "#01";
      previousSectionLabel.textContent = "";
      previousSection.classList.add("is-disabled");
      previousSection.setAttribute("aria-hidden", "true");
      previousSection.tabIndex = -1;
    }

    if (next && next.id) {
      nextSection.href = `#${next.id}`;

      /*
       * The header itself remains visually minimal.
       * The section number is retained only here because
       * the fixed header uses it as a navigation affordance.
       */
      nextSectionLabel.textContent =
        String(index + 2).padStart(2, "0");

      nextSection.setAttribute(
        "aria-label",
        `Vai alla sezione ${index + 2}`
      );

      nextSection.classList.remove("is-disabled");
    } else {
      nextSection.href = "#11";
      nextSectionLabel.textContent = "FINE";
      nextSection.classList.add("is-disabled");
    }

    const overall = chapters.length > 1
      ? index / (chapters.length - 1)
      : 0;

    if (progressFill) {
      progressFill.style.width = `${overall * 100}%`;
    }

    if (progressPoint) {
      progressPoint.style.left = `${overall * 100}%`;
    }
  };


  /* --------------------------------
     INTERSECTION OBSERVER
  -------------------------------- */

  const chapterObserver = new IntersectionObserver(
    (entries) => {
      let strongest = null;
      let strongestRatio = 0;

      entries.forEach((entry) => {
        if (
          entry.isIntersecting &&
          entry.intersectionRatio >= strongestRatio
        ) {
          strongest = entry.target;
          strongestRatio = entry.intersectionRatio;
        }
      });

      if (!strongest) return;

      const index = chapters.indexOf(strongest);

      if (index !== -1) {
        updateActiveChapter(index);
      }
    },
    {
      threshold: [0.15, 0.3, 0.5, 0.7],
      rootMargin: "-10% 0px -10% 0px"
    }
  );

  chapters.forEach((chapter) => {
    chapterObserver.observe(chapter);
  });


  /* --------------------------------
     REVEAL OBSERVER
  -------------------------------- */

  const revealElements = [
    ...document.querySelectorAll(".reveal")
  ];

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      });
    },
    {
      threshold: 0.12,
      rootMargin: "0px 0px -8% 0px"
    }
  );

  revealElements.forEach((element) => {
    revealObserver.observe(element);
  });


  /* --------------------------------
     MENU
  -------------------------------- */

  let lastFocusedElement = null;

  const openMenu = () => {
    if (!menu || !menuTrigger) return;

    lastFocusedElement = document.activeElement;

    menuOpen = true;

    body.classList.add("is-menu-open");

    menuTrigger.setAttribute("aria-expanded", "true");
    menuTrigger.setAttribute("aria-label", "Chiudi menu");

    menu.setAttribute("aria-hidden", "false");

    clearIdleTimer();
    exitIdle();

    window.setTimeout(() => {
      if (menuClose) {
        menuClose.focus();
      }
    }, 400);
  };

  const closeMenu = (restoreFocus = true) => {
    if (!menu || !menuTrigger) return;

    menuOpen = false;

    body.classList.remove("is-menu-open");

    menuTrigger.setAttribute("aria-expanded", "false");
    menuTrigger.setAttribute("aria-label", "Apri menu");

    menu.setAttribute("aria-hidden", "true");

    if (
      restoreFocus &&
      lastFocusedElement &&
      typeof lastFocusedElement.focus === "function"
    ) {
      lastFocusedElement.focus();
    }

    scheduleIdle();
  };

  menuTrigger?.addEventListener("click", () => {
    if (menuOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  menuClose?.addEventListener("click", () => {
    closeMenu();
  });

  menuLinks.forEach((link) => {
    link.addEventListener("click", () => {
      closeMenu(false);
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menuOpen) {
      closeMenu();
    }
  });


  /* --------------------------------
     MENU FOCUS TRAP
  -------------------------------- */

  document.addEventListener("keydown", (event) => {
    if (
      event.key !== "Tab" ||
      !menuOpen ||
      !menu
    ) {
      return;
    }

    const focusable = [
      menuClose,
      ...menu.querySelectorAll("a[href]")
    ].filter(Boolean);

    if (!focusable.length) return;

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


  /* --------------------------------
     SMOOTH ANCHOR NAVIGATION
  -------------------------------- */

  document.addEventListener("click", (event) => {
    const link = event.target.closest('a[href^="#"]');

    if (!link) return;

    const href = link.getAttribute("href");

    if (!href || href === "#") return;

    const target = document.querySelector(href);

    if (!target) return;

    event.preventDefault();

    const headerOffset =
      parseInt(
        getComputedStyle(document.documentElement)
          .getPropertyValue("--header-height"),
        10
      ) || 0;

    const targetTop =
      target.getBoundingClientRect().top +
      window.scrollY -
      Math.max(headerOffset * .35, 0);

    window.scrollTo({
      top: targetTop,
      behavior: reducedMotion ? "auto" : "smooth"
    });

    if (menuOpen) {
      closeMenu(false);
    }
  });


  /* --------------------------------
     MAGNETIC INTERACTION
  -------------------------------- */

  const magneticElements = [
    ...document.querySelectorAll(".magnetic")
  ];

  const updateMagnetic = (element, event) => {
    if (reducedMotion) return;

    const rect = element.getBoundingClientRect();

    const x =
      (event.clientX - (rect.left + rect.width / 2)) * .12;

    const y =
      (event.clientY - (rect.top + rect.height / 2)) * .12;

    element.style.setProperty(
      "--magnetic-x",
      `${clamp(x, -8, 8)}px`
    );

    element.style.setProperty(
      "--magnetic-y",
      `${clamp(y, -8, 8)}px`
    );
  };

  const resetMagnetic = (element) => {
    element.style.setProperty("--magnetic-x", "0px");
    element.style.setProperty("--magnetic-y", "0px");
  };

  magneticElements.forEach((element) => {
    element.addEventListener("pointermove", (event) => {
      updateMagnetic(element, event);
    });

    element.addEventListener("pointerleave", () => {
      resetMagnetic(element);
    });
  });


  /* --------------------------------
     CONTEXTUAL CURSOR
  -------------------------------- */

  const hasFinePointer =
    window.matchMedia("(pointer:fine)").matches;

  if (hasFinePointer && cursor && !reducedMotion) {

    body.classList.add("has-pointer");

    window.addEventListener("pointermove", (event) => {
      lastPointerX = event.clientX;
      lastPointerY = event.clientY;

      cursor.style.left = `${lastPointerX}px`;
      cursor.style.top = `${lastPointerY}px`;
    }, { passive: true });

    const interactiveElements = [
      ...document.querySelectorAll(
        "a, button, .direction-item, .site-door, .synthesis-item"
      )
    ];

    interactiveElements.forEach((element) => {
      element.addEventListener("pointerenter", () => {
        cursor.classList.add("is-hover");
      });

      element.addEventListener("pointerleave", () => {
        cursor.classList.remove("is-hover");
      });
    });
  }


  /* --------------------------------
     CENTRAL RAF
  -------------------------------- */

  const frame = () => {
    framePending = false;

    updateHeader();
    updateChapterProgress();
  };

  const requestFrame = () => {
    if (framePending) return;

    framePending = true;

    window.requestAnimationFrame(frame);
  };

  window.addEventListener("scroll", requestFrame, {
    passive: true
  });

  window.addEventListener("resize", requestFrame, {
    passive: true
  });


  /* --------------------------------
     HASH / INITIAL POSITION
  -------------------------------- */

  const initialHash = window.location.hash;

  if (initialHash) {
    const target = document.querySelector(initialHash);

    if (target) {
      window.requestAnimationFrame(() => {
        target.scrollIntoView({
          behavior:"auto",
          block:"start"
        });
      });
    }
  }


  /* --------------------------------
     INITIALIZATION
  -------------------------------- */

  const initialize = () => {
    if (initialized) return;

    initialized = true;

    updateHeader();
    updateChapterProgress();

    if (chapters.length) {
      let closestIndex = 0;
      let closestDistance = Infinity;

      chapters.forEach((chapter, index) => {
        const rect = chapter.getBoundingClientRect();

        const distance =
          Math.abs(
            rect.top -
            window.innerHeight * .35
          );

        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });

      updateActiveChapter(closestIndex);
    }

    scheduleIdle();
    startLoader();
  };

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initialize,
      { once:true }
    );
  } else {
    initialize();
  }

})();
