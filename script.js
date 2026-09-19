(() => {
  "use strict";

  /*
   * ============================================================
   * CONFIG
   * ============================================================
   */

  const CONFIG = {
    idleDelay: 45000,
    loaderFallback: 7000,
    scrollEase: "smooth"
  };


  /*
   * ============================================================
   * DOM
   * ============================================================
   */

  const body = document.body;

  const loader = document.getElementById("page-loader");
  const idleScreen = document.getElementById("idle-screen");

  const menu = document.getElementById("site-menu");
  const menuTrigger = document.getElementById("menu-trigger");

  const progressCurrent = document.getElementById("progress-current");
  const progressFill = document.getElementById("progress-fill");
  const progressPoint = document.getElementById("progress-point");

  const previousSection = document.getElementById("previous-section");
  const previousSectionLabel = document.getElementById("previous-section-label");

  const nextSection = document.getElementById("next-section");
  const nextSectionLabel = document.getElementById("next-section-label");

  const sections = Array.from(
    document.querySelectorAll(".home-section")
  );


  /*
   * ============================================================
   * STATE
   * ============================================================
   */

  let activeSectionIndex = 0;
  let menuOpen = false;
  let idleActive = false;
  let loaderFinished = false;

  let idleTimer = null;

  let lastScrollY = window.scrollY;
  let ticking = false;

  let previousBodyOverflow = "";
  let lastFocusedElement = null;


  /*
   * ============================================================
   * HELPERS
   * ============================================================
   */

  const prefersReducedMotion = () =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;


  const clamp = (value, min, max) =>
    Math.min(Math.max(value, min), max);


  const getSectionLabel = (section) =>
    section?.dataset?.shortTitle ||
    section?.dataset?.sectionTitle ||
    "";


  const getSectionTitle = (section) =>
    section?.dataset?.sectionTitle || "";


  /*
   * ============================================================
   * LOADER
   * ============================================================
   */

  function finishLoader() {
    if (loaderFinished) return;

    loaderFinished = true;

    if (!loader) return;

    loader.classList.add("is-hidden");

    window.setTimeout(() => {
      loader.setAttribute("aria-hidden", "true");
      resetIdleTimer();
    }, prefersReducedMotion() ? 100 : 1100);
  }


  function startLoader() {
    if (!loader) {
      loaderFinished = true;
      resetIdleTimer();
      return;
    }

    const fallbackTimer = window.setTimeout(
      finishLoader,
      CONFIG.loaderFallback
    );

    const onLoad = () => {
      window.clearTimeout(fallbackTimer);

      if (prefersReducedMotion()) {
        window.setTimeout(finishLoader, 250);
      } else {
        /*
         * The loader itself contains the long cinematic sequence.
         * We deliberately wait before opening the page.
         */
        window.setTimeout(finishLoader, 3400);
      }
    };

    if (document.readyState === "complete") {
      onLoad();
    } else {
      window.addEventListener("load", onLoad, {
        once: true
      });
    }
  }


  /*
   * ============================================================
   * SECTION NAVIGATION
   * ============================================================
   */

  function updateHeader(index) {
    if (!sections.length) return;

    const section = sections[index];

    if (!section) return;

    const total = sections.length;

    const progress =
      total <= 1
        ? 0
        : index / (total - 1);

    const percent = progress * 100;

    progressCurrent.textContent =
      getSectionTitle(section);

    progressFill.style.width =
      `${percent}%`;

    progressPoint.style.left =
      `${percent}%`;

    /*
     * Previous
     */

    if (index > 0) {
      const previous = sections[index - 1];

      previousSection.classList.remove("is-disabled");
      previousSection.setAttribute("aria-hidden", "false");
      previousSection.removeAttribute("tabindex");

      previousSection.href =
        `#${previous.id}`;

      previousSectionLabel.textContent =
        getSectionLabel(previous);

      previousSection.setAttribute(
        "aria-label",
        `Vai a ${getSectionTitle(previous)}`
      );
    } else {
      previousSection.classList.add("is-disabled");
      previousSection.setAttribute("aria-hidden", "true");
      previousSection.setAttribute("tabindex", "-1");
      previousSection.href = "#01";
      previousSectionLabel.textContent = "";
    }

    /*
     * Next
     */

    if (index < total - 1) {
      const next = sections[index + 1];

      nextSection.classList.remove("is-disabled");
      nextSection.href =
        `#${next.id}`;

      nextSectionLabel.textContent =
        getSectionLabel(next);

      nextSection.setAttribute(
        "aria-label",
        `Vai a ${getSectionTitle(next)}`
      );
    } else {
      nextSection.classList.add("is-disabled");
      nextSection.href = "#11";
      nextSectionLabel.textContent = "";
    }

    activeSectionIndex = index;
  }


  /*
   * ============================================================
   * INTERSECTION OBSERVER
   * ============================================================
   */

  const sectionObserver = new IntersectionObserver(
    entries => {
      const visibleEntries = entries
        .filter(entry => entry.isIntersecting)
        .sort(
          (a, b) =>
            b.intersectionRatio -
            a.intersectionRatio
        );

      if (!visibleEntries.length) return;

      const section = visibleEntries[0].target;
      const index = sections.indexOf(section);

      if (index === -1) return;

      updateHeader(index);
    },
    {
      root:null,
      threshold:[
        0.2,
        0.35,
        0.5,
        0.65
      ],
      rootMargin:"-10% 0px -10% 0px"
    }
  );


  sections.forEach(section => {
    sectionObserver.observe(section);
  });


  /*
   * ============================================================
   * CHAPTER PROGRESS
   * ============================================================
   */

  function updateChapterProgress() {
    if (!sections.length) return;

    const viewportHeight =
      window.innerHeight;

    const scrollY =
      window.scrollY;

    sections.forEach(section => {

      const rect =
        section.getBoundingClientRect();

      const sectionTop =
        scrollY + rect.top;

      const sectionHeight =
        Math.max(
          section.offsetHeight,
          viewportHeight
        );

      const rawProgress =
        (scrollY - sectionTop) /
        Math.max(
          sectionHeight - viewportHeight,
          1
        );

      const progress =
        clamp(rawProgress, 0, 1);

      section.style.setProperty(
        "--chapter-progress",
        progress.toFixed(4)
      );
    });

    lastScrollY = scrollY;
    ticking = false;
  }


  function requestScrollUpdate() {
    if (ticking) return;

    ticking = true;

    window.requestAnimationFrame(
      updateChapterProgress
    );
  }


  window.addEventListener(
    "scroll",
    requestScrollUpdate,
    {
      passive:true
    }
  );

  window.addEventListener(
    "resize",
    requestScrollUpdate
  );

  requestScrollUpdate();


  /*
   * ============================================================
   * ANCHOR NAVIGATION
   * ============================================================
   */

  function scrollToTarget(target) {
    if (!target) return;

    target.scrollIntoView({
      behavior:
        prefersReducedMotion()
          ? "auto"
          : CONFIG.scrollEase,
      block:"start"
    });
  }


  document.addEventListener(
    "click",
    event => {

      const link =
        event.target.closest(
          'a[href^="#"]'
        );

      if (!link) return;

      const href =
        link.getAttribute("href");

      if (
        !href ||
        href === "#" ||
        href === "#territorio"
      ) {
        return;
      }

      const target =
        document.querySelector(href);

      if (!target) return;

      event.preventDefault();

      if (menuOpen) {
        closeMenu();
      }

      scrollToTarget(target);
    }
  );


  /*
   * ============================================================
   * MENU
   * ============================================================
   */

  function getFocusableMenuElements() {
    return Array.from(
      menu.querySelectorAll(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    );
  }


  function lockBodyScroll() {
    previousBodyOverflow =
      body.style.overflow;

    body.style.overflow = "hidden";
  }


  function unlockBodyScroll() {
    body.style.overflow =
      previousBodyOverflow;
  }


  function openMenu() {
    if (menuOpen) return;

    lastFocusedElement =
      document.activeElement;

    menuOpen = true;

    body.classList.add("is-menu-open");

    lockBodyScroll();

    menu.classList.add("is-open");

    menu.setAttribute(
      "aria-hidden",
      "false"
    );

    menuTrigger.setAttribute(
      "aria-expanded",
      "true"
    );

    menuTrigger.setAttribute(
      "aria-label",
      "Chiudi menu"
    );

    const focusables =
      getFocusableMenuElements();

    if (focusables.length) {
      window.setTimeout(() => {
        focusables[0].focus();
      }, 250);
    }
  }


  function closeMenu() {
    if (!menuOpen) return;

    menuOpen = false;

    body.classList.remove("is-menu-open");

    unlockBodyScroll();

    menu.classList.remove("is-open");

    menu.setAttribute(
      "aria-hidden",
      "true"
    );

    menuTrigger.setAttribute(
      "aria-expanded",
      "false"
    );

    menuTrigger.setAttribute(
      "aria-label",
      "Apri menu"
    );

    if (
      lastFocusedElement &&
      typeof lastFocusedElement.focus === "function"
    ) {
      window.setTimeout(() => {
        lastFocusedElement.focus();
      }, 250);
    }
  }


  menuTrigger.addEventListener(
    "click",
    () => {
      if (menuOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    }
  );


  document.addEventListener(
    "keydown",
    event => {

      if (event.key === "Escape") {

        if (menuOpen) {
          closeMenu();
          return;
        }

        if (idleActive) {
          exitIdle();
        }
      }

      if (
        menuOpen &&
        event.key === "Tab"
      ) {

        const focusables =
          getFocusableMenuElements();

        if (!focusables.length) return;

        const first =
          focusables[0];

        const last =
          focusables[focusables.length - 1];

        if (
          event.shiftKey &&
          document.activeElement === first
        ) {
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
    }
  );


  /*
   * ============================================================
   * MAGNETIC ELEMENTS
   * ============================================================
   */

  function initMagnetic() {

    if (
      prefersReducedMotion() ||
      window.matchMedia("(pointer:coarse)").matches
    ) {
      return;
    }

    const elements =
      document.querySelectorAll(
        ".magnetic"
      );

    elements.forEach(element => {

      element.addEventListener(
        "pointermove",
        event => {

          const rect =
            element.getBoundingClientRect();

          const x =
            event.clientX -
            (rect.left + rect.width / 2);

          const y =
            event.clientY -
            (rect.top + rect.height / 2);

          const strength = 0.12;

          element.style.setProperty(
            "--magnetic-x",
            `${x * strength}px`
          );

          element.style.setProperty(
            "--magnetic-y",
            `${y * strength}px`
          );
        }
      );

      element.addEventListener(
        "pointerleave",
        () => {
          element.style.setProperty(
            "--magnetic-x",
            "0px"
          );

          element.style.setProperty(
            "--magnetic-y",
            "0px"
          );
        }
      );
    });
  }


  /*
   * ============================================================
   * TEMPORARY PHOTO TRANSITION BLUR
   *
   * The stable state is ALWAYS blur(0).
   * No permanent blur.
   * ============================================================
   */

  function initImageTransitions() {

    const images =
      document.querySelectorAll(
        ".origin-image img"
      );

    images.forEach(image => {

      image.addEventListener(
        "load",
        () => {
          image.style.filter = "blur(0)";
        }
      );

      image.style.filter = "blur(0)";
    });
  }


  /*
   * ============================================================
   * IDLE STANDBY
   * ============================================================
   */

  function clearIdleTimer() {
    if (!idleTimer) return;

    window.clearTimeout(idleTimer);
    idleTimer = null;
  }


  function resetIdleTimer() {

    clearIdleTimer();

    if (
      !loaderFinished ||
      menuOpen ||
      idleActive
    ) {
      return;
    }

    idleTimer =
      window.setTimeout(
        enterIdle,
        CONFIG.idleDelay
      );
  }


  function enterIdle() {

    if (
      !loaderFinished ||
      menuOpen ||
      idleActive
    ) {
      return;
    }

    idleActive = true;

    body.classList.add("is-idle");

    idleScreen.classList.add(
      "is-active"
    );

    idleScreen.setAttribute(
      "aria-hidden",
      "false"
    );
  }


  function exitIdle() {

    if (!idleActive) return;

    idleActive = false;

    body.classList.remove("is-idle");

    idleScreen.classList.remove(
      "is-active"
    );

    idleScreen.setAttribute(
      "aria-hidden",
      "true"
    );

    /*
     * No scroll restoration is needed because the standby
     * screen is fixed over the document and never changes
     * scrollTop.
     */

    resetIdleTimer();
  }


  const interactionEvents = [
    "pointerdown",
    "pointermove",
    "touchstart",
    "wheel",
    "scroll",
    "keydown"
  ];


  interactionEvents.forEach(
    eventName => {

      window.addEventListener(
        eventName,
        () => {

          if (idleActive) {
            exitIdle();
          } else {
            resetIdleTimer();
          }

        },
        {
          passive:
            eventName !== "keydown"
        }
      );

    }
  );


  /*
   * ============================================================
   * INITIAL STATE
   * ============================================================
   */

  if (sections.length) {
    updateHeader(0);
  }

  initMagnetic();
  initImageTransitions();
  startLoader();


  /*
   * ============================================================
   * RE-INITIALIZE IDLE AFTER VISIBILITY RETURN
   * ============================================================
   */

  document.addEventListener(
    "visibilitychange",
    () => {

      if (
        document.visibilityState === "visible"
      ) {
        resetIdleTimer();
      } else {
        clearIdleTimer();
      }

    }
  );

})();
