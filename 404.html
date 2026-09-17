/* =========================================================
   CESARE PARATORE
   MOVIMENTO / CON DIREZIONE.
   script.js — interaction + motion system
   ========================================================= */

(() => {
  "use strict";

  const root = document.documentElement;
  const body = document.body;

  root.classList.add("js");

  /* =======================================================
     01. UTILITIES
     ======================================================= */

  const $ = (selector, scope = document) =>
    scope.querySelector(selector);

  const $$ = (selector, scope = document) =>
    Array.from(scope.querySelectorAll(selector));

  const clamp = (value, min, max) =>
    Math.min(Math.max(value, min), max);

  const prefersReducedMotion = () =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const isFinePointer = () =>
    window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* =======================================================
     02. LOADER
     ======================================================= */

  const loader = $("#intro");

  let loaderHidden = false;

  const hideLoader = () => {
    if (!loader || loaderHidden) return;

    loaderHidden = true;
    loader.classList.add("is-hidden");

    window.setTimeout(() => {
      loader.setAttribute("aria-hidden", "true");
    }, 1000);
  };

  /*
   * Il loader non deve mai bloccare il sito se un modulo
   * successivo dovesse generare un errore.
   */
  window.addEventListener("load", () => {
    window.setTimeout(hideLoader, 650);
  }, { once: true });

  /*
   * Fail-safe assoluto.
   */
  window.setTimeout(hideLoader, 3800);


  /* =======================================================
     03. HEADER
     ======================================================= */

  const header = $(".site-header");

  let lastScrollY = window.scrollY;
  let tickingHeader = false;

  const updateHeader = () => {
    if (!header) return;

    const currentY = window.scrollY;

    if (currentY < 30) {
      header.classList.remove("is-hidden");
    } else if (
      currentY > lastScrollY + 8 &&
      !body.classList.contains("menu-open")
    ) {
      header.classList.add("is-hidden");
    } else if (currentY < lastScrollY - 8) {
      header.classList.remove("is-hidden");
    }

    lastScrollY = currentY;
    tickingHeader = false;
  };

  window.addEventListener("scroll", () => {
    if (!tickingHeader) {
      window.requestAnimationFrame(updateHeader);
      tickingHeader = true;
    }
  }, { passive: true });


  /* =======================================================
     04. SCROLL PROGRESS
     ======================================================= */

  const updateScrollProgress = () => {
    const maxScroll =
      document.documentElement.scrollHeight - window.innerHeight;

    const progress =
      maxScroll > 0
        ? clamp(window.scrollY / maxScroll, 0, 1)
        : 0;

    root.style.setProperty(
      "--scroll-progress",
      `${progress * 100}%`
    );

    root.style.setProperty(
      "--mobile-progress",
      `${progress * 100}%`
    );
  };

  let progressTicking = false;

  window.addEventListener("scroll", () => {
    if (!progressTicking) {
      window.requestAnimationFrame(() => {
        updateScrollProgress();
        progressTicking = false;
      });

      progressTicking = true;
    }
  }, { passive: true });

  window.addEventListener("resize", updateScrollProgress);
  updateScrollProgress();


  /* =======================================================
     05. SECTION INDEX
     ======================================================= */

  const sections = $$("main section[id]");
  const sectionIndex = $("#section-index");
  const indexCurrent = $(".index-current", sectionIndex || document);
  const indexTotal = $(".index-total", sectionIndex || document);

  const sectionEntries = sections.map((section, index) => ({
    element: section,
    number:
      section.dataset.index ||
      String(index + 1).padStart(2, "0")
  }));

  if (indexTotal && sectionEntries.length) {
    indexTotal.textContent =
      String(sectionEntries.length).padStart(2, "0");
  }

  let currentSection = null;

  const setCurrentSection = (entry) => {
    if (!entry || entry === currentSection) return;

    currentSection = entry;

    if (indexCurrent) {
      indexCurrent.textContent = entry.number;
    }

    root.style.setProperty(
      "--active-section",
      entry.number
    );

    document.dispatchEvent(
      new CustomEvent("cp:section-change", {
        detail: {
          id: entry.element.id,
          number: entry.number
        }
      })
    );
  };

  if ("IntersectionObserver" in window && sectionEntries.length) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (a, b) =>
              b.intersectionRatio - a.intersectionRatio
          );

        if (!visible.length) return;

        const target = sectionEntries.find(
          (item) =>
            item.element === visible[0].target
        );

        setCurrentSection(target);
      },
      {
        threshold: [0.15, 0.3, 0.5, 0.7],
        rootMargin: "-12% 0px -45% 0px"
      }
    );

    sectionEntries.forEach(({ element }) => {
      sectionObserver.observe(element);
    });
  }


  /* =======================================================
     06. REVEAL SYSTEM
     ======================================================= */

  root.classList.add("reveal-ready");

  const revealElements = $$("[data-reveal]");

  if (
    !prefersReducedMotion() &&
    "IntersectionObserver" in window &&
    revealElements.length
  ) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.08,
        rootMargin: "0px 0px -8% 0px"
      }
    );

    revealElements.forEach((element) => {
      revealObserver.observe(element);
    });
  } else {
    revealElements.forEach((element) => {
      element.classList.add("is-visible");
    });
  }


  /* =======================================================
     07. HERO PARALLAX
     ======================================================= */

  const heroVisual = $(".hero-visual");

  if (
    heroVisual &&
    !prefersReducedMotion() &&
    isFinePointer()
  ) {
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let raf = null;

    const renderHero = () => {
      currentX += (targetX - currentX) * 0.075;
      currentY += (targetY - currentY) * 0.075;

      heroVisual.style.transform =
        `translate3d(${currentX}px, ${currentY}px, 0)`;

      raf = window.requestAnimationFrame(renderHero);
    };

    window.addEventListener("pointermove", (event) => {
      targetX =
        (event.clientX / window.innerWidth - 0.5) * 22;

      targetY =
        (event.clientY / window.innerHeight - 0.5) * 18;

      if (!raf) {
        raf = window.requestAnimationFrame(renderHero);
      }
    }, { passive: true });

    window.addEventListener("pointerleave", () => {
      targetX = 0;
      targetY = 0;
    });

    renderHero();
  }


  /* =======================================================
     08. FULLSCREEN MENU
     ======================================================= */

  const menu = $("#site-menu");
  const menuToggle = $("#menu-toggle");
  const menuCloseElements = $$("[data-menu-close]");
  const menuLinks = $$(".primary-nav a", menu || document);

  let menuOpen = false;
  let previousFocusedElement = null;

  const getFocusable = () => {
    if (!menu) return [];

    return $$(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      menu
    ).filter((element) => {
      const style = window.getComputedStyle(element);

      return (
        style.display !== "none" &&
        style.visibility !== "hidden"
      );
    });
  };

  const openMenu = () => {
    if (!menu || menuOpen) return;

    menuOpen = true;
    previousFocusedElement = document.activeElement;

    body.classList.add("menu-open");

    menu.setAttribute("aria-hidden", "false");

    if (menuToggle) {
      menuToggle.setAttribute("aria-expanded", "true");
    }

    const focusable = getFocusable();

    window.setTimeout(() => {
      if (focusable[0]) {
        focusable[0].focus();
      }
    }, 250);
  };

  const closeMenu = (restoreFocus = true) => {
    if (!menu || !menuOpen) return;

    menuOpen = false;

    body.classList.remove("menu-open");

    menu.setAttribute("aria-hidden", "true");

    if (menuToggle) {
      menuToggle.setAttribute("aria-expanded", "false");
    }

    if (
      restoreFocus &&
      previousFocusedElement &&
      typeof previousFocusedElement.focus === "function"
    ) {
      previousFocusedElement.focus();
    }
  };

  if (menuToggle) {
    menuToggle.addEventListener("click", () => {
      if (menuOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    });
  }

  menuCloseElements.forEach((element) => {
    element.addEventListener("click", () => {
      closeMenu();
    });
  });

  menuLinks.forEach((link) => {
    link.addEventListener("click", () => {
      closeMenu(false);
    });
  });

  document.addEventListener("keydown", (event) => {
    if (!menuOpen) return;

    if (event.key === "Escape") {
      event.preventDefault();
      closeMenu();
      return;
    }

    if (event.key !== "Tab") return;

    const focusable = getFocusable();

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


  /* =======================================================
     09. SAME-PAGE NAVIGATION
     ======================================================= */

  const getHeaderOffset = () => {
    return header
      ? header.getBoundingClientRect().height
      : 0;
  };

  const scrollToTarget = (target, updateHash = true) => {
    if (!target) return;

    const top =
      target.getBoundingClientRect().top +
      window.scrollY -
      getHeaderOffset() -
      12;

    window.scrollTo({
      top: Math.max(0, top),
      behavior: prefersReducedMotion()
        ? "auto"
        : "smooth"
    });

    if (updateHash && target.id) {
      history.pushState(
        null,
        "",
        `#${target.id}`
      );
    }
  };

  $$('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");

      if (!href || href === "#") return;

      const target = $(href);

      if (!target) return;

      event.preventDefault();

      closeMenu(false);

      scrollToTarget(target);
    });
  });


  /* =======================================================
     10. SECTION NAVIGATION — CONTINUITY
     ======================================================= */

  const orderedSections = sectionEntries.map(
    (entry) => entry.element
  );

  const navigateSection = (direction) => {
    if (!orderedSections.length) return;

    const current =
      currentSection?.element ||
      orderedSections[0];

    let index =
      orderedSections.indexOf(current);

    if (index < 0) index = 0;

    const nextIndex = clamp(
      index + direction,
      0,
      orderedSections.length - 1
    );

    if (nextIndex === index) return;

    scrollToTarget(
      orderedSections[nextIndex],
      true
    );
  };

  /*
   * Frecce da tastiera.
   * Non interferiscono quando l'utente sta scrivendo.
   */
  document.addEventListener("keydown", (event) => {
    const tag = event.target?.tagName;

    if (
      tag === "INPUT" ||
      tag === "TEXTAREA" ||
      tag === "SELECT" ||
      event.metaKey ||
      event.ctrlKey ||
      event.altKey
    ) {
      return;
    }

    if (body.classList.contains("menu-open")) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      navigateSection(1);
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      navigateSection(-1);
    }
  });


  /* =======================================================
     11. MOBILE SECTION NAV
     ======================================================= */

  let mobileNav = null;

  const createMobileNav = () => {
    if (mobileNav || orderedSections.length < 2) return;

    mobileNav = document.createElement("nav");
    mobileNav.className = "mobile-section-nav";
    mobileNav.setAttribute(
      "aria-label",
      "Navigazione sezioni"
    );

    mobileNav.innerHTML = `
      <div class="mobile-section-nav-inner">
        <button
          type="button"
          class="mobile-section-prev"
          aria-label="Sezione precedente"
        >←</button>

        <span
          class="mobile-section-nav-label"
          aria-live="polite"
        >01</span>

        <button
          type="button"
          class="mobile-section-next"
          aria-label="Sezione successiva"
        >→</button>

        <span
          class="mobile-section-nav-progress"
          aria-hidden="true"
        ></span>
      </div>
    `;

    body.appendChild(mobileNav);

    $(".mobile-section-prev", mobileNav)
      ?.addEventListener("click", () => {
        navigateSection(-1);
      });

    $(".mobile-section-next", mobileNav)
      ?.addEventListener("click", () => {
        navigateSection(1);
      });

    const updateMobileLabel = () => {
      const label = $(".mobile-section-nav-label", mobileNav);

      if (!label || !currentSection) return;

      label.textContent =
        `${currentSection.number} / ${String(
          orderedSections.length
        ).padStart(2, "0")}`;
    };

    document.addEventListener(
      "cp:section-change",
      updateMobileLabel
    );

    window.addEventListener(
      "scroll",
      () => {
        if (window.scrollY > 250) {
          mobileNav.classList.add("is-visible");
        } else {
          mobileNav.classList.remove("is-visible");
        }
      },
      { passive: true }
    );
  };

  if (window.matchMedia("(max-width: 760px)").matches) {
    createMobileNav();
  }

  window
    .matchMedia("(max-width: 760px)")
    .addEventListener("change", (event) => {
      if (event.matches) {
        createMobileNav();
      }
    });


  /* =======================================================
     12. DIRECTION ITEMS
     ======================================================= */

  const directionItems = $$(".direction-item");

  directionItems.forEach((item) => {
    item.addEventListener("mouseenter", () => {
      directionItems.forEach((other) => {
        if (other !== item) {
          other.classList.remove("is-active");
        }
      });

      item.classList.add("is-active");
    });

    item.addEventListener("mouseleave", () => {
      item.classList.remove("is-active");
    });
  });


  /* =======================================================
     13. MAGNETIC INTERACTIONS
     ======================================================= */

  if (!prefersReducedMotion() && isFinePointer()) {
    const magneticItems = $$(
      "[data-magnetic]"
    );

    magneticItems.forEach((element) => {
      let frame = null;

      const reset = () => {
        if (frame) {
          cancelAnimationFrame(frame);
        }

        element.style.transform = "";
      };

      element.addEventListener("pointermove", (event) => {
        const rect =
          element.getBoundingClientRect();

        const x =
          (event.clientX - rect.left) /
          rect.width -
          0.5;

        const y =
          (event.clientY - rect.top) /
          rect.height -
          0.5;

        const strength =
          Number(element.dataset.magnetic) || 12;

        if (frame) {
          cancelAnimationFrame(frame);
        }

        frame = requestAnimationFrame(() => {
          element.style.transform =
            `translate3d(${x * strength}px, ${y * strength}px, 0)`;
        });
      });

      element.addEventListener(
        "pointerleave",
        reset
      );
    });
  }


  /* =======================================================
     14. POINTER TRAIL / VISUAL CURSOR
     ======================================================= */

  if (
    !prefersReducedMotion() &&
    isFinePointer()
  ) {
    const cursor = document.createElement("div");

    cursor.setAttribute("aria-hidden", "true");

    Object.assign(cursor.style, {
      position: "fixed",
      left: "0",
      top: "0",
      width: "8px",
      height: "8px",
      borderRadius: "50%",
      background: "var(--navy)",
      pointerEvents: "none",
      zIndex: "7000",
      opacity: "0",
      transform: "translate3d(-50%, -50%, 0)",
      transition:
        "width 250ms ease, height 250ms ease, opacity 250ms ease"
    });

    body.appendChild(cursor);

    let cursorX = -100;
    let cursorY = -100;
    let renderX = cursorX;
    let renderY = cursorY;

    const renderCursor = () => {
      renderX += (cursorX - renderX) * 0.2;
      renderY += (cursorY - renderY) * 0.2;

      cursor.style.transform =
        `translate3d(${renderX}px, ${renderY}px, 0)`;

      requestAnimationFrame(renderCursor);
    };

    window.addEventListener("pointermove", (event) => {
      cursorX = event.clientX;
      cursorY = event.clientY;
      cursor.style.opacity = "1";
    }, { passive: true });

    window.addEventListener("pointerleave", () => {
      cursor.style.opacity = "0";
    });

    $$("a, button, [data-magnetic]").forEach(
      (element) => {
        element.addEventListener("mouseenter", () => {
          cursor.style.width = "18px";
          cursor.style.height = "18px";
        });

        element.addEventListener("mouseleave", () => {
          cursor.style.width = "8px";
          cursor.style.height = "8px";
        });
      }
    );

    renderCursor();
  }


  /* =======================================================
     15. STANDBY SYSTEM
     ======================================================= */

  const STANDBY_DELAY = 30000;
  const STANDBY_WAKE_DELAY = 1200;

  let standbyTimer = null;
  let standbyScreen = null;
  let standbyActive = false;

  const createStandbyScreen = () => {
    if (standbyScreen) return;

    standbyScreen = document.createElement("div");

    standbyScreen.className = "standby-screen";
    standbyScreen.setAttribute(
      "aria-hidden",
      "true"
    );

    standbyScreen.innerHTML = `
      <div class="standby-screen-inner">
        <img
          class="standby-logo"
          src="assets/images/cp-mark.png"
          alt=""
          width="150"
          height="150"
        >

        <div class="standby-kicker">
          MOVIMENTO / CON DIREZIONE.
        </div>

        <h2 class="standby-title">
          IN ATTESA.
        </h2>

        <p class="standby-subtitle">
          Il percorso continua quando torni.
        </p>

        <button
          class="standby-wake"
          type="button"
        >
          Riprendi il percorso
        </button>
      </div>
    `;

    body.appendChild(standbyScreen);

    $(".standby-wake", standbyScreen)
      ?.addEventListener("click", wakeFromStandby);
  };

  const enterStandby = () => {
    if (
      standbyActive ||
      body.classList.contains("menu-open")
    ) {
      return;
    }

    createStandbyScreen();

    standbyActive = true;

    body.classList.add("standby-active");
    root.classList.add("standby-mode");

    standbyScreen.setAttribute(
      "aria-hidden",
      "false"
    );

    document.dispatchEvent(
      new CustomEvent("cp:standby-enter")
    );
  };

  const wakeFromStandby = () => {
    if (!standbyActive) return;

    standbyActive = false;

    body.classList.remove("standby-active");
    root.classList.remove("standby-mode");

    if (standbyScreen) {
      standbyScreen.setAttribute(
        "aria-hidden",
        "true"
      );
    }

    window.clearTimeout(standbyTimer);

    document.dispatchEvent(
      new CustomEvent("cp:standby-wake")
    );

    scheduleStandby();
  };

  const scheduleStandby = () => {
    window.clearTimeout(standbyTimer);

    if (
      document.hidden ||
      prefersReducedMotion()
    ) {
      return;
    }

    standbyTimer = window.setTimeout(
      enterStandby,
      STANDBY_DELAY
    );
  };

  const activityEvents = [
    "pointermove",
    "pointerdown",
    "wheel",
    "touchstart",
    "keydown",
    "scroll"
  ];

  activityEvents.forEach((eventName) => {
    window.addEventListener(
      eventName,
      () => {
        if (standbyActive) {
          wakeFromStandby();
        } else {
          scheduleStandby();
        }
      },
      {
        passive:
          eventName !== "keydown"
      }
    );
  });

  document.addEventListener(
    "visibilitychange",
    () => {
      if (document.hidden) {
        window.clearTimeout(standbyTimer);
      } else {
        scheduleStandby();
      }
    }
  );

  document.addEventListener(
    "keydown",
    (event) => {
      if (!standbyActive) return;

      if (
        event.key === "Escape" ||
        event.key === "Enter" ||
        event.key === " "
      ) {
        event.preventDefault();
        wakeFromStandby();
      }
    }
  );

  createStandbyScreen();
  scheduleStandby();


  /* =======================================================
     16. PAGE TRANSITIONS
     ======================================================= */

  const supportsViewTransition =
    typeof document.startViewTransition === "function";

  const createPageTransition = () => {
    if ($(".page-transition")) return;

    const transition = document.createElement("div");

    transition.className = "page-transition";
    transition.setAttribute(
      "aria-hidden",
      "true"
    );

    body.appendChild(transition);
  };

  createPageTransition();

  const navigateToPage = (url) => {
    if (!url) return;

    const href = url.href;

    /*
     * Link esterno / nuova tab / download:
     * nessuna manipolazione.
     */
    if (
      url.origin !== window.location.origin ||
      url.protocol === "mailto:" ||
      url.protocol === "tel:"
    ) {
      return;
    }

    if (supportsViewTransition) {
      try {
        document.startViewTransition(() => {
          window.location.href = href;
        });

        return;
      } catch {
        /* fallback below */
      }
    }

    root.classList.add("is-page-leaving");

    window.setTimeout(() => {
      window.location.href = href;
    }, 520);
  };

  $$("a[href]").forEach((link) => {
    link.addEventListener("click", (event) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        link.target === "_blank" ||
        link.hasAttribute("download")
      ) {
        return;
      }

      const href = link.getAttribute("href");

      if (
        !href ||
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:")
      ) {
        return;
      }

      let url;

      try {
        url = new URL(
          href,
          window.location.href
        );
      } catch {
        return;
      }

      if (
        url.origin !== window.location.origin ||
        url.pathname === window.location.pathname
      ) {
        return;
      }

      event.preventDefault();

      closeMenu(false);
      navigateToPage(url);
    });
  });


  /* =======================================================
     17. INITIAL PAGE ENTRY
     ======================================================= */

  window.addEventListener("pageshow", () => {
    root.classList.add("page-ready");
    root.classList.remove("is-page-leaving");
  });

  window.addEventListener("load", () => {
    root.classList.add("page-ready");
  });


  /* =======================================================
     18. INITIAL HASH
     ======================================================= */

  const initialHash = window.location.hash;

  if (initialHash) {
    window.setTimeout(() => {
      const target = $(initialHash);

      if (target) {
        scrollToTarget(target, false);
      }
    }, 500);
  }


  /* =======================================================
     19. RESIZE
     ======================================================= */

  let resizeTimer = null;

  window.addEventListener("resize", () => {
    window.clearTimeout(resizeTimer);

    resizeTimer = window.setTimeout(() => {
      updateScrollProgress();

      /*
       * Evita che il menu resti aperto in uno stato
       * incoerente durante un cambio drastico di viewport.
       */
      if (
        window.innerWidth > 760 &&
        mobileNav
      ) {
        mobileNav.classList.remove(
          "is-visible"
        );
      }
    }, 150);
  });


  /* =======================================================
     20. ORIENTATION / MEDIA QUERY
     ======================================================= */

  const reducedMotionQuery =
    window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

  reducedMotionQuery.addEventListener?.(
    "change",
    () => {
      if (reducedMotionQuery.matches) {
        root.classList.add("reduced-motion");
      } else {
        root.classList.remove("reduced-motion");
      }
    }
  );

  if (reducedMotionQuery.matches) {
    root.classList.add("reduced-motion");
  }


  /* =======================================================
     21. PAGE VISIBILITY
     ======================================================= */

  document.addEventListener(
    "visibilitychange",
    () => {
      if (document.hidden) {
        root.classList.add("page-hidden");
      } else {
        root.classList.remove("page-hidden");
      }
    }
  );


  /* =======================================================
     22. DEBUG API
     ======================================================= */

  window.CP = {
    version: "2026.09",
    sections: sectionEntries.map(
      ({ element, number }) => ({
        id: element.id,
        number
      })
    ),
    menu: {
      open: openMenu,
      close: closeMenu
    },
    standby: {
      enter: enterStandby,
      wake: wakeFromStandby
    },
    navigation: {
      next: () => navigateSection(1),
      previous: () => navigateSection(-1)
    }
  };


  /* =======================================================
     23. FINAL INITIALIZATION
     ======================================================= */

  updateHeader();
  updateScrollProgress();

  if (sectionEntries.length) {
    setCurrentSection(sectionEntries[0]);
  }

})();
