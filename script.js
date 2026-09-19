(() => {
  "use strict";

  /*
   * ============================================================
   * MOVIMENTO / CON DIREZIONE.
   * Interaction system
   *
   * Principi:
   * - un solo requestAnimationFrame per lo scroll
   * - IntersectionObserver per l'attivazione dei capitoli
   * - CSS custom property per la progressione
   * - nessun contenuto nascosto prima dell'inizializzazione
   * - degradazione completa senza JS
   * ============================================================
   */

  const root = document.documentElement;

  root.classList.remove("no-js");

  const body = document.body;

  const loader = document.querySelector(".page-loader");

  const chapters = Array.from(
    document.querySelectorAll(".chapter, .home-section--territory")
  );

  const progressFill = document.getElementById("progress-fill");
  const progressPoint = document.getElementById("progress-point");
  const progressCurrent = document.getElementById("progress-current");

  const previousSection = document.getElementById("previous-section");
  const previousSectionLabel = document.getElementById("previous-section-label");

  const nextSection = document.getElementById("next-section");
  const nextSectionLabel = document.getElementById("next-section-label");

  const menuTrigger = document.querySelector(".menu-trigger");
  const menu = document.getElementById("site-menu");
  const menuClose = document.querySelector(".chapter-close");
  const menuLinks = Array.from(document.querySelectorAll("[data-menu-link]"));

  const contextCursor = document.querySelector(".context-cursor");
  const contextCursorLabel = document.querySelector(".context-cursor-label");

  const isReducedMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;


  /*
   * ============================================================
   * CONFIG
   * ============================================================
   */

  const chapterData = chapters.map((chapter, index) => ({
    element: chapter,
    id: chapter.id || String(index + 1).padStart(2, "0"),
    title:
      chapter.dataset.sectionTitle ||
      `CAPITOLO ${String(index + 1).padStart(2, "0")}`,
    index
  }));

  let activeChapterIndex = 0;
  let scrollTicking = false;
  let menuOpen = false;
  let previousFocusedElement = null;


  /*
   * ============================================================
   * LOADER
   * ============================================================
   */

  const hideLoader = () => {
    if (!loader) return;

    window.setTimeout(() => {
      loader.classList.add("is-hidden");
    }, isReducedMotion ? 0 : 1450);
  };

  if (document.readyState === "complete") {
    hideLoader();
  } else {
    window.addEventListener("load", hideLoader, { once: true });
  }


  /*
   * ============================================================
   * CHAPTER ACTIVATION
   * ============================================================
   */

  const setChapterActive = (index) => {
    if (!chapterData[index]) return;

    chapterData.forEach((item, itemIndex) => {
      item.element.classList.toggle(
        "is-active",
        itemIndex === index
      );
    });

    activeChapterIndex = index;

    updateNavigation();
  };


  const observer = new IntersectionObserver(
    (entries) => {
      let strongestEntry = null;

      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        if (
          !strongestEntry ||
          entry.intersectionRatio > strongestEntry.intersectionRatio
        ) {
          strongestEntry = entry;
        }

        entry.target.classList.add("is-visible");
      });

      if (strongestEntry) {
        const index = chapterData.findIndex(
          (item) => item.element === strongestEntry.target
        );

        if (index >= 0) {
          setChapterActive(index);
        }
      }
    },
    {
      threshold: [0.08, 0.2, 0.4, 0.6, 0.8],
      rootMargin: "-12% 0px -12% 0px"
    }
  );

  chapterData.forEach((item) => observer.observe(item.element));


  /*
   * ============================================================
   * PROGRESS
   * ============================================================
   */

  const clamp = (value, min, max) =>
    Math.min(Math.max(value, min), max);


  const getChapterProgress = (element) => {
    const rect = element.getBoundingClientRect();
    const viewportHeight = window.innerHeight;

    const scrollableDistance =
      Math.max(element.offsetHeight - viewportHeight, 1);

    const passed = -rect.top;

    return clamp(passed / scrollableDistance, 0, 1);
  };


  const updateChapterProgress = () => {
    chapterData.forEach((item, index) => {
      const progress = getChapterProgress(item.element);

      item.element.style.setProperty(
        "--chapter-progress",
        progress.toFixed(4)
      );

      /*
       * La sezione 06 è una sezione reale con un comportamento
       * leggermente diverso, ma partecipa comunque alla progressione.
       */
      if (index === activeChapterIndex) {
        item.element.style.setProperty(
          "--trajectory-drift",
          `${Math.round(progress * 20)}px`
        );
      }
    });
  };


  const updateGlobalProgress = () => {
    if (!chapters.length) return;

    const first = chapters[0];
    const last = chapters[chapters.length - 1];

    const firstTop = first.offsetTop;
    const lastBottom = last.offsetTop + last.offsetHeight;

    const scrollPosition =
      window.scrollY + window.innerHeight * 0.45;

    const total =
      Math.max(lastBottom - firstTop - window.innerHeight, 1);

    const progress = clamp(
      (scrollPosition - firstTop) / total,
      0,
      1
    );

    const percent = progress * 100;

    if (progressFill) {
      progressFill.style.width = `${percent}%`;
    }

    if (progressPoint) {
      progressPoint.style.left = `${percent}%`;
    }

    updateChapterProgress();
  };


  const requestScrollUpdate = () => {
    if (scrollTicking) return;

    scrollTicking = true;

    window.requestAnimationFrame(() => {
      updateGlobalProgress();
      scrollTicking = false;
    });
  };


  window.addEventListener("scroll", requestScrollUpdate, {
    passive: true
  });

  window.addEventListener("resize", requestScrollUpdate);

  updateGlobalProgress();


  /*
   * ============================================================
   * HEADER NAVIGATION
   * ============================================================
   */

  const updateNavigation = () => {
    const current = chapterData[activeChapterIndex];

    if (!current) return;

    if (progressCurrent) {
      progressCurrent.textContent = current.title;
    }

    const previous = chapterData[activeChapterIndex - 1];
    const next = chapterData[activeChapterIndex + 1];

    if (previous && previousSection && previousSectionLabel) {
      previousSection.href = `#${previous.id}`;
      previousSectionLabel.textContent = previous.id;
      previousSection.classList.remove("is-disabled");
      previousSection.removeAttribute("aria-hidden");
      previousSection.removeAttribute("tabindex");
    } else if (previousSection) {
      previousSection.href = "#01";
      previousSection.classList.add("is-disabled");
      previousSection.setAttribute("aria-hidden", "true");
      previousSection.setAttribute("tabindex", "-1");
    }

    if (next && nextSection && nextSectionLabel) {
      nextSection.href = `#${next.id}`;
      nextSectionLabel.textContent = next.id;
      nextSection.setAttribute(
        "aria-label",
        `Vai alla sezione ${next.id}`
      );
    } else if (nextSection && nextSectionLabel) {
      nextSection.href = "#11";
      nextSectionLabel.textContent = "—";
      nextSection.setAttribute(
        "aria-label",
        "Ultima sezione"
      );
    }
  };


  /*
   * ============================================================
   * MENU
   * ============================================================
   */

  const getFocusableMenuElements = () => {
    if (!menu) return [];

    return Array.from(
      menu.querySelectorAll(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    );
  };


  const openMenu = () => {
    if (menuOpen || !menu) return;

    previousFocusedElement = document.activeElement;
    menuOpen = true;

    body.classList.add("is-menu-open");

    menu.setAttribute("aria-hidden", "false");

    if (menuTrigger) {
      menuTrigger.setAttribute("aria-expanded", "true");
      menuTrigger.setAttribute("aria-label", "Chiudi menu");
    }

    const focusable = getFocusableMenuElements();

    if (focusable.length) {
      window.setTimeout(() => {
        focusable[0].focus();
      }, isReducedMotion ? 0 : 300);
    }
  };


  const closeMenu = () => {
    if (!menuOpen) return;

    menuOpen = false;

    body.classList.remove("is-menu-open");

    menu.setAttribute("aria-hidden", "true");

    if (menuTrigger) {
      menuTrigger.setAttribute("aria-expanded", "false");
      menuTrigger.setAttribute("aria-label", "Apri menu");
    }

    if (
      previousFocusedElement &&
      typeof previousFocusedElement.focus === "function"
    ) {
      previousFocusedElement.focus();
    }
  };


  if (menuTrigger) {
    menuTrigger.addEventListener("click", () => {
      if (menuOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    });
  }


  if (menuClose) {
    menuClose.addEventListener("click", closeMenu);
  }


  menuLinks.forEach((link) => {
    link.addEventListener("click", () => {
      closeMenu();
    });
  });


  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menuOpen) {
      closeMenu();
      return;
    }

    if (
      event.key === "Tab" &&
      menuOpen &&
      menu
    ) {
      const focusable = getFocusableMenuElements();

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
    }
  });


  /*
   * ============================================================
   * MAGNETIC INTERACTION
   * ============================================================
   */

  const supportsFinePointer =
    window.matchMedia &&
    window.matchMedia("(pointer:fine)").matches;

  const magneticElements = Array.from(
    document.querySelectorAll(".magnetic")
  );

  if (supportsFinePointer && !isReducedMotion) {
    magneticElements.forEach((element) => {
      const strength = 0.18;

      element.addEventListener("pointermove", (event) => {
        const rect = element.getBoundingClientRect();

        const x =
          event.clientX -
          (rect.left + rect.width / 2);

        const y =
          event.clientY -
          (rect.top + rect.height / 2);

        element.style.setProperty(
          "--magnetic-x",
          `${x * strength}px`
        );

        element.style.setProperty(
          "--magnetic-y",
          `${y * strength}px`
        );
      });

      element.addEventListener("pointerleave", () => {
        element.style.setProperty("--magnetic-x", "0px");
        element.style.setProperty("--magnetic-y", "0px");
      });
    });
  }


  /*
   * ============================================================
   * CONTEXT CURSOR
   * ============================================================
   */

  if (
    contextCursor &&
    contextCursorLabel &&
    supportsFinePointer &&
    !isReducedMotion
  ) {
    body.classList.add("has-pointer");

    window.addEventListener(
      "pointermove",
      (event) => {
        root.style.setProperty(
          "--cursor-x",
          `${event.clientX}px`
        );

        root.style.setProperty(
          "--cursor-y",
          `${event.clientY}px`
        );
      },
      { passive: true }
    );

    const interactiveElements = document.querySelectorAll(
      "a, button"
    );

    interactiveElements.forEach((element) => {
      element.addEventListener("mouseenter", () => {
        const href = element.getAttribute("href");

        if (
          element.classList.contains("final-cta") ||
          href === "/contatti/"
        ) {
          contextCursorLabel.textContent = "TALK";
          return;
        }

        contextCursorLabel.textContent = "→";
      });

      element.addEventListener("mouseleave", () => {
        contextCursorLabel.textContent = "MOVE";
      });
    });
  } else if (contextCursor) {
    contextCursor.style.display = "none";
  }


  /*
   * ============================================================
   * HEADER SCROLL STATE
   * ============================================================
   */

  const updateHeaderState = () => {
    if (window.scrollY > 20) {
      body.classList.add("is-scrolled");
    } else {
      body.classList.remove("is-scrolled");
    }
  };

  window.addEventListener("scroll", updateHeaderState, {
    passive: true
  });

  updateHeaderState();


  /*
   * ============================================================
   * HASH NAVIGATION
   * ============================================================
   */

  const scrollToHashTarget = (hash) => {
    if (!hash || hash === "#") return;

    const target = document.querySelector(hash);

    if (!target) return;

    target.scrollIntoView({
      behavior: isReducedMotion ? "auto" : "smooth",
      block: "start"
    });
  };


  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const hash = link.getAttribute("href");

      if (!hash || hash === "#") return;

      const target = document.querySelector(hash);

      if (!target) return;

      event.preventDefault();

      if (menuOpen) {
        closeMenu();
      }

      window.setTimeout(
        () => scrollToHashTarget(hash),
        menuOpen && !isReducedMotion ? 450 : 0
      );

      history.pushState(null, "", hash);
    });
  });


  /*
   * ============================================================
   * INITIAL STATE
   * ============================================================
   */

  if (chapterData.length) {
    chapterData[0].element.classList.add("is-visible");
    setChapterActive(0);
  }

  updateGlobalProgress();


  /*
   * ============================================================
   * RESPECT REDUCED MOTION DYNAMICALLY
   * ============================================================
   */

  if (window.matchMedia) {
    const motionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

    const handleMotionPreference = (event) => {
      body.classList.toggle(
        "is-reduced-motion",
        event.matches
      );
    };

    handleMotionPreference(motionQuery);

    if (typeof motionQuery.addEventListener === "function") {
      motionQuery.addEventListener(
        "change",
        handleMotionPreference
      );
    }
  }

})();
