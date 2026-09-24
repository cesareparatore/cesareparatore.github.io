(() => {
  "use strict";

  /*
   * ========================================================
   * CESARE PARATORE
   * Navigation / loader / narrative progression
   * V4
   * ========================================================
   */

  const html = document.documentElement;
  const body = document.body;

  html.classList.add("js");


  /* ========================================================
     DOM
     ======================================================== */

  const loader =
    document.getElementById("site-loader");

  const header =
    document.getElementById("site-header");

  const menuToggle =
    document.getElementById("menu-toggle");

  const menu =
    document.getElementById("site-menu");

  const menuLinks =
    Array.from(
      document.querySelectorAll(".menu-link")
    );

  const activeChapter =
    document.getElementById("active-chapter");

  const previousButton =
    document.getElementById("prev-section");

  const nextButton =
    document.getElementById("next-section");

  const nextArrowSymbol =
    document.getElementById("next-arrow-symbol");

  const nextArrowLabel =
    document.getElementById("next-arrow-label");

  const wowProgress =
    document.getElementById("wow-progress");

  const wowDot =
    document.getElementById("wow-dot-active");

  const wowTrack =
    document.querySelector(".wow-track");

  const brand =
    document.querySelector(".brand");

  const main =
    document.getElementById("main-content");

  const footer =
    document.querySelector(".site-footer");

  const skipLink =
    document.querySelector(".skip-link");

  const sections =
    Array.from(
      document.querySelectorAll(".story-section")
    );


  /* ========================================================
     BASIC SAFETY
     ======================================================== */

  if (
    !header ||
    !menuToggle ||
    !menu ||
    !activeChapter ||
    !previousButton ||
    !nextButton ||
    !nextArrowSymbol ||
    !nextArrowLabel ||
    !wowProgress ||
    !wowDot ||
    !main ||
    !sections.length
  ) {
    return;
  }


  /* ========================================================
     STATE
     ======================================================== */

  let activeIndex = 0;
  let menuOpen = false;

  let scrollFrame = null;

  let loaderMinTimer = null;
  let loaderFallbackTimer = null;
  let loaderExitTimer = null;

  let loaderStartedAt = 0;
  let loaderFinished = false;

  let lastFocusedElement = null;

  let navigationLock = null;
  let navigationFrame = null;
  let navigationTimer = null;

  const reducedMotion =
    window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

  const narrativeCache =
    sections.map(() => ({
      titleAlpha: null,
      titleY: null,
      contentAlpha: null,
      contentY: null
    }));


  /* ========================================================
     HELPERS
     ======================================================== */

  const clamp = (
    value,
    min,
    max
  ) => {
    return Math.min(
      Math.max(value, min),
      max
    );
  };


  const smoothStep = (value) => {
    const t = clamp(value, 0, 1);

    return t * t * (3 - 2 * t);
  };


  const getHeaderHeight = () => {
    return header.getBoundingClientRect().height;
  };


  const getSectionIndex = (section) => {
    return sections.indexOf(section);
  };


  const isElement = (target) => {
    return target instanceof Element;
  };


  const isEditableTarget = (target) => {
    if (!isElement(target)) {
      return false;
    }

    return Boolean(
      target.closest(
        "input, textarea, select, [contenteditable='true']"
      )
    );
  };


  const isInteractiveTarget = (target) => {
    if (!isElement(target)) {
      return false;
    }

    return Boolean(
      target.closest(
        "a, button, input, textarea, select, summary, [contenteditable='true']"
      )
    );
  };


  const getFocusableMenuElements = () => {
    return Array.from(
      menu.querySelectorAll(
        "a[href], button:not([disabled]), [tabindex]:not([tabindex='-1'])"
      )
    ).filter((element) => {
      return (
        !element.hasAttribute("disabled") &&
        element.getAttribute("aria-hidden") !== "true"
      );
    });
  };


  const setPageInert = (locked) => {
    [main, footer].forEach((element) => {
      if (!element) {
        return;
      }

      element.inert = Boolean(locked);
    });
  };


  const setMenuInert = (locked) => {
    menu.inert = Boolean(locked);
  };


  /* ========================================================
     LOADER
     ======================================================== */

  const finishLoader = () => {
    if (!loader || loaderFinished) {
      return;
    }

    loaderFinished = true;

    if (loaderMinTimer !== null) {
      window.clearTimeout(loaderMinTimer);
      loaderMinTimer = null;
    }

    if (loaderFallbackTimer !== null) {
      window.clearTimeout(loaderFallbackTimer);
      loaderFallbackTimer = null;
    }

    loader.classList.add("is-exiting");

    const exitDuration =
      reducedMotion.matches
        ? 20
        : 1150;

    loaderExitTimer =
      window.setTimeout(() => {
        loader.classList.remove("is-active");
        loader.classList.remove("is-exiting");

        loader.setAttribute(
          "aria-hidden",
          "true"
        );

        loaderExitTimer = null;
      }, exitDuration);
  };


  const tryFinishLoader = () => {
    if (!loader || loaderFinished) {
      return;
    }

    const minimumDuration =
      reducedMotion.matches
        ? 0
        : 900;

    const elapsed =
      performance.now() -
      loaderStartedAt;

    const remaining =
      Math.max(
        0,
        minimumDuration - elapsed
      );

    if (remaining === 0) {
      finishLoader();
      return;
    }

    if (loaderMinTimer !== null) {
      window.clearTimeout(loaderMinTimer);
    }

    loaderMinTimer =
      window.setTimeout(
        finishLoader,
        remaining
      );
  };


  const startLoader = () => {
    if (!loader) {
      return;
    }

    if (loader.classList.contains("is-active")) {
      return;
    }

    loaderStartedAt =
      performance.now();

    loaderFinished = false;

    loader.classList.add("is-active");

    if (
      document.readyState === "complete"
    ) {
      tryFinishLoader();
    } else {
      window.addEventListener(
        "load",
        tryFinishLoader,
        {
          once: true
        }
      );
    }

    loaderFallbackTimer =
      window.setTimeout(
        finishLoader,
        reducedMotion.matches
          ? 1000
          : 4500
      );
  };


  /* ========================================================
     MENU
     ======================================================== */

  const updateMenuCurrentState = () => {
    menuLinks.forEach((link) => {
      const href =
        link.getAttribute("href");

      const isCurrent =
        href ===
        `#${sections[activeIndex]?.id || ""}`;

      if (isCurrent) {
        link.setAttribute(
          "aria-current",
          "page"
        );
      } else {
        link.removeAttribute(
          "aria-current"
        );
      }
    });
  };


  const setMenuState = (open) => {
    const nextState = Boolean(open);

    if (
      nextState === menuOpen &&
      menu.classList.contains("is-open")
    ) {
      return;
    }

    if (nextState) {

      lastFocusedElement =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : menuToggle;

      menuOpen = true;

      header.classList.add("menu-open");
      menu.classList.add("is-open");

      menu.setAttribute(
        "aria-hidden",
        "false"
      );

      setMenuInert(false);

      menuToggle.setAttribute(
        "aria-expanded",
        "true"
      );

      menuToggle.setAttribute(
        "aria-label",
        "Chiudi menu"
      );

      body.classList.add(
        "menu-is-open"
      );

      setPageInert(true);

      window.requestAnimationFrame(() => {
        const focusable =
          getFocusableMenuElements();

        if (focusable.length) {
          focusable[0].focus({
            preventScroll: true
          });
        }
      });

      return;
    }


    menuOpen = false;

    header.classList.remove("menu-open");
    menu.classList.remove("is-open");

    menu.setAttribute(
      "aria-hidden",
      "true"
    );

    setMenuInert(true);

    menuToggle.setAttribute(
      "aria-expanded",
      "false"
    );

    menuToggle.setAttribute(
      "aria-label",
      "Apri menu"
    );

    body.classList.remove(
      "menu-is-open"
    );

    setPageInert(false);

    const focusTarget =
      lastFocusedElement &&
      document.contains(lastFocusedElement) &&
      !lastFocusedElement.hasAttribute("disabled")
        ? lastFocusedElement
        : menuToggle;

    window.requestAnimationFrame(() => {
      focusTarget.focus({
        preventScroll: true
      });
    });

    lastFocusedElement = null;
  };


  menuToggle.addEventListener(
    "click",
    () => {
      setMenuState(!menuOpen);
    }
  );


  /* ========================================================
     ACTIVE SECTION UI
     ======================================================== */

  const setActiveSection = (
    index,
    updateHash = false
  ) => {

    const safeIndex =
      clamp(
        Number.isFinite(Number(index))
          ? Number(index)
          : 0,
        0,
        sections.length - 1
      );

    activeIndex = safeIndex;

    const section =
      sections[safeIndex];

    if (!section) {
      return;
    }

    const chapter =
      section.dataset.chapter || "";

    activeChapter.textContent =
      chapter;


    /* ------------------------------------
       PREVIOUS
       ------------------------------------ */

    const first =
      safeIndex === 0;

    previousButton.disabled =
      first;

    previousButton.setAttribute(
      "aria-label",
      first
        ? "Sei all'inizio"
        : `Vai alla sezione precedente: ${
            sections[safeIndex - 1]
              ?.dataset.chapter || ""
          }`
    );


    /* ------------------------------------
       NEXT / RETURN
       ------------------------------------ */

    const last =
      safeIndex === sections.length - 1;

    nextButton.classList.toggle(
      "is-return",
      last
    );

    if (last) {

      nextArrowSymbol.textContent =
        "↶";

      nextArrowLabel.textContent =
        "INIZIO";

      nextButton.setAttribute(
        "aria-label",
        "Torna all'inizio"
      );

    } else {

      nextArrowSymbol.textContent =
        "→";

      nextArrowLabel.textContent =
        "AVANTI";

      nextButton.setAttribute(
        "aria-label",
        `Vai alla sezione successiva: ${
          sections[safeIndex + 1]
            ?.dataset.chapter || ""
        }`
      );
    }


    /* ------------------------------------
       PROGRESS
       ------------------------------------ */

    const percentage =
      sections.length > 1
        ? (
            safeIndex /
            (sections.length - 1)
          ) * 100
        : 0;

    const percentageValue =
      `${percentage}%`;

    wowProgress.style.width =
      percentageValue;

    wowDot.style.left =
      percentageValue;


    if (wowTrack) {
      wowTrack.setAttribute(
        "aria-valuenow",
        String(safeIndex + 1)
      );

      wowTrack.setAttribute(
        "aria-valuetext",
        `Sezione ${
          safeIndex + 1
        } di ${
          sections.length
        }: ${chapter}`
      );
    }


    /* ------------------------------------
       MENU CURRENT
       ------------------------------------ */

    updateMenuCurrentState();


    /* ------------------------------------
       HASH
       ------------------------------------ */

    if (
      updateHash &&
      section.id
    ) {
      const newHash =
        `#${section.id}`;

      if (
        window.location.hash !==
        newHash
      ) {
        window.history.replaceState(
          null,
          "",
          newHash
        );
      }
    }
  };


  /* ========================================================
     SCROLL TARGET
     ======================================================== */

  const getScrollTarget = (section) => {
    if (!section) {
      return 0;
    }

    const rect =
      section.getBoundingClientRect();

    const documentTop =
      window.scrollY +
      rect.top;

    const maxScroll =
      Math.max(
        0,
        document.documentElement.scrollHeight -
        window.innerHeight
      );

    return clamp(
      documentTop -
      getHeaderHeight(),
      0,
      maxScroll
    );
  };


  const scrollToSection = (
    section,
    behavior = "smooth"
  ) => {

    const targetTop =
      getScrollTarget(section);

    window.scrollTo({
      top: targetTop,
      behavior
    });

    return targetTop;
  };


  /* ========================================================
     NAVIGATION LOCK
     ======================================================== */

  const stopNavigationMonitor = () => {

    if (navigationFrame !== null) {
      window.cancelAnimationFrame(
        navigationFrame
      );

      navigationFrame = null;
    }

    if (navigationTimer !== null) {
      window.clearTimeout(
        navigationTimer
      );

      navigationTimer = null;
    }
  };


  const releaseNavigationLock = (
    syncToViewport = true
  ) => {

    if (!navigationLock) {
      return;
    }

    const lockedIndex =
      navigationLock.index;

    navigationLock = null;

    stopNavigationMonitor();

    if (syncToViewport) {
      requestNarrativeUpdate();
    } else {
      setActiveSection(
        lockedIndex,
        false
      );
    }
  };


  const monitorNavigation = () => {

    if (!navigationLock) {
      return;
    }

    const distance =
      Math.abs(
        window.scrollY -
        navigationLock.targetTop
      );

    if (
      reducedMotion.matches ||
      distance <= 3
    ) {
      releaseNavigationLock(false);
      return;
    }

    if (
      performance.now() >=
      navigationLock.deadline
    ) {
      releaseNavigationLock(true);
      return;
    }

    navigationFrame =
      window.requestAnimationFrame(
        monitorNavigation
      );
  };


  const navigateToSection = (
    index,
    updateHash = true
  ) => {

    const safeIndex =
      clamp(
        Number.isFinite(Number(index))
          ? Number(index)
          : 0,
        0,
        sections.length - 1
      );

    const target =
      sections[safeIndex];

    if (!target) {
      return;
    }

    stopNavigationMonitor();

    setActiveSection(
      safeIndex,
      updateHash
    );

    const behavior =
      reducedMotion.matches
        ? "auto"
        : "smooth";

    const targetTop =
      scrollToSection(
        target,
        behavior
      );

    if (behavior === "auto") {
      navigationLock = null;
      requestNarrativeUpdate();
      return;
    }

    navigationLock = {
      index: safeIndex,
      targetTop,
      deadline:
        performance.now() + 2200
    };

    navigationFrame =
      window.requestAnimationFrame(
        monitorNavigation
      );
  };


  /* ========================================================
     MENU LINKS
     ======================================================== */

  menuLinks.forEach((link) => {

    link.addEventListener(
      "click",
      (event) => {

        const href =
          link.getAttribute("href");

        if (
          !href ||
          !href.startsWith("#")
        ) {
          return;
        }

        const target =
          document.getElementById(
            href.slice(1)
          );

        if (!target) {
          return;
        }

        const index =
          getSectionIndex(target);

        if (index < 0) {
          return;
        }

        event.preventDefault();

        setMenuState(false);

        navigateToSection(
          index,
          true
        );
      }
    );
  });


  /* ========================================================
     NARRATIVE CACHE
     ======================================================== */

  const updateSectionVariable = (
    section,
    index,
    key,
    value
  ) => {

    if (
      narrativeCache[index][key] ===
      value
    ) {
      return;
    }

    narrativeCache[index][key] =
      value;

    section.style.setProperty(
      `--${key.replace(
        /[A-Z]/g,
        (match) =>
          `-${match.toLowerCase()}`
      )}`,
      value
    );
  };


  /* ========================================================
     ACTIVE SECTION DETECTION
     ======================================================== */

  const getViewportActiveIndex = () => {

    const viewportHeight =
      window.innerHeight;

    const headerHeight =
      getHeaderHeight();

    const anchor =
      headerHeight +
      (
        viewportHeight -
        headerHeight
      ) * .38;

    let containingIndex = -1;

    sections.forEach(
      (section, index) => {

        const rect =
          section.getBoundingClientRect();

        if (
          rect.top <= anchor &&
          rect.bottom > anchor
        ) {
          containingIndex =
            index;
        }
      }
    );

    if (
      containingIndex >= 0
    ) {
      return containingIndex;
    }

    let nearestIndex = 0;
    let nearestDistance = Infinity;

    sections.forEach(
      (section, index) => {

        const rect =
          section.getBoundingClientRect();

        const distance =
          Math.abs(
            rect.top -
            anchor
          );

        if (
          distance <
          nearestDistance
        ) {
          nearestDistance =
            distance;

          nearestIndex =
            index;
        }
      }
    );

    return nearestIndex;
  };


  /* ========================================================
     NARRATIVE PROGRESSION
     ======================================================== */

  const updateNarrative = () => {

    scrollFrame = null;

    const viewportHeight =
      window.innerHeight;

    const headerHeight =
      getHeaderHeight();

    const anchor =
      headerHeight +
      (
        viewportHeight -
        headerHeight
      ) * .38;


    sections.forEach(
      (section, index) => {

        const rect =
          section.getBoundingClientRect();

        const height =
          Math.max(
            rect.height,
            1
          );


        /* --------------------------------
           SECTION PROGRESS
           -------------------------------- */

        const raw =
          (
            anchor -
            rect.top
          ) / height;

        const progress =
          clamp(
            raw,
            0,
            1
          );


        /* --------------------------------
           TITLE
           -------------------------------- */

        const titleFade =
          smoothStep(
            (progress - .05) / .42
          );

        const titleAlpha =
          (
            1 -
            titleFade
          ).toFixed(3);

        const titleY =
          `${(
            -22 *
            titleFade
          ).toFixed(1)}px`;


        /* --------------------------------
           CONTENT
           -------------------------------- */

        const contentReveal =
          smoothStep(
            (progress - .14) / .42
          );

        const contentAlpha =
          (
            .18 +
            (.82 * contentReveal)
          ).toFixed(3);

        const contentY =
          `${(
            32 *
            (1 - contentReveal)
          ).toFixed(1)}px`;


        updateSectionVariable(
          section,
          index,
          "titleAlpha",
          titleAlpha
        );

        updateSectionVariable(
          section,
          index,
          "titleY",
          titleY
        );

        updateSectionVariable(
          section,
          index,
          "contentAlpha",
          contentAlpha
        );

        updateSectionVariable(
          section,
          index,
          "contentY",
          contentY
        );
      }
    );


    if (navigationLock) {
      return;
    }

    const viewportIndex =
      getViewportActiveIndex();

    if (
      viewportIndex !==
      activeIndex
    ) {
      setActiveSection(
        viewportIndex,
        false
      );
    }
  };


  const requestNarrativeUpdate = () => {

    if (
      scrollFrame !== null
    ) {
      return;
    }

    scrollFrame =
      window.requestAnimationFrame(
        updateNarrative
      );
  };


  window.addEventListener(
    "scroll",
    requestNarrativeUpdate,
    {
      passive: true
    }
  );


  window.addEventListener(
    "resize",
    requestNarrativeUpdate,
    {
      passive: true
    }
  );


  /* ========================================================
     SCROLL END ENHANCEMENT
     ======================================================== */

  if ("onscrollend" in window) {

    window.addEventListener(
      "scrollend",
      () => {

        if (navigationLock) {
          releaseNavigationLock(true);
        } else {
          requestNarrativeUpdate();
        }
      }
    );
  }


  /* ========================================================
     PREVIOUS
     ======================================================== */

  previousButton.addEventListener(
    "click",
    () => {

      if (activeIndex <= 0) {
        return;
      }

      navigateToSection(
        activeIndex - 1,
        true
      );
    }
  );


  /* ========================================================
     NEXT / RETURN
     ======================================================== */

  nextButton.addEventListener(
    "click",
    () => {

      const last =
        activeIndex ===
        sections.length - 1;

      if (last) {
        navigateToSection(
          0,
          true
        );

        return;
      }

      navigateToSection(
        activeIndex + 1,
        true
      );
    }
  );


  /* ========================================================
     BRAND
     ======================================================== */

  if (brand) {

    brand.addEventListener(
      "click",
      (event) => {

        event.preventDefault();

        setMenuState(false);

        navigateToSection(
          0,
          true
        );
      }
    );
  }


  /* ========================================================
     FOOTER MARK
     ======================================================== */

  const footerMark =
    document.querySelector(".footer-mark");

  if (footerMark) {

    footerMark.addEventListener(
      "click",
      (event) => {

        event.preventDefault();

        setMenuState(false);

        navigateToSection(
          0,
          true
        );
      }
    );
  }


  /* ========================================================
     KEYBOARD
     ======================================================== */

  document.addEventListener(
    "keydown",
    (event) => {

      /* --------------------------------
         ESCAPE
         -------------------------------- */

      if (
        event.key === "Escape" &&
        menuOpen
      ) {

        event.preventDefault();

        setMenuState(false);

        return;
      }


      /* --------------------------------
         FOCUS TRAP
         -------------------------------- */

      if (
        event.key === "Tab" &&
        menuOpen
      ) {

        const focusable =
          getFocusableMenuElements();

        if (!focusable.length) {
          event.preventDefault();
          return;
        }

        const first =
          focusable[0];

        const last =
          focusable[
            focusable.length - 1
          ];

        if (
          event.shiftKey &&
          document.activeElement === first
        ) {

          event.preventDefault();

          last.focus();

          return;
        }

        if (
          !event.shiftKey &&
          document.activeElement === last
        ) {

          event.preventDefault();

          first.focus();
        }

        return;
      }


      /* --------------------------------
         EDITABLE / INTERACTIVE
         -------------------------------- */

      if (
        isEditableTarget(event.target) ||
        isInteractiveTarget(event.target)
      ) {
        return;
      }


      if (
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey
      ) {
        return;
      }


      /* --------------------------------
         ARROW NAVIGATION
         -------------------------------- */

      if (
        event.key === "ArrowLeft" &&
        !menuOpen
      ) {

        event.preventDefault();

        previousButton.click();

        return;
      }


      if (
        event.key === "ArrowRight" &&
        !menuOpen
      ) {

        event.preventDefault();

        nextButton.click();
      }
    }
  );


  /* ========================================================
     HASH
     ======================================================== */

  const getHashTarget = () => {

    const hash =
      window.location.hash;

    if (!hash) {
      return null;
    }

    let id = "";

    try {
      id =
        decodeURIComponent(
          hash.slice(1)
        );
    } catch {
      return null;
    }

    if (!id) {
      return null;
    }

    return document.getElementById(id);
  };


  const handleHash = () => {

    const target =
      getHashTarget();

    if (!target) {
      return;
    }

    const index =
      getSectionIndex(target);

    if (index < 0) {
      return;
    }

    window.setTimeout(
      () => {

        navigateToSection(
          index,
          false
        );

      },
      80
    );
  };


  window.addEventListener(
    "hashchange",
    handleHash
  );


  /* ========================================================
     INITIAL STATE
     ======================================================== */

  sections.forEach(
    (section, index) => {

      const initialState =
        index === 0
          ? {
              titleAlpha: "1",
              titleY: "0px",
              contentAlpha: "1",
              contentY: "0px"
            }
          : {
              titleAlpha: "0.15",
              titleY: "-10px",
              contentAlpha: "0.18",
              contentY: "32px"
            };

      narrativeCache[index] = {
        ...initialState
      };

      section.style.setProperty(
        "--title-alpha",
        initialState.titleAlpha
      );

      section.style.setProperty(
        "--title-y",
        initialState.titleY
      );

      section.style.setProperty(
        "--content-alpha",
        initialState.contentAlpha
      );

      section.style.setProperty(
        "--content-y",
        initialState.contentY
      );
    }
  );


  /* ========================================================
     INITIAL MENU STATE
     ======================================================== */

  setMenuInert(true);

  menu.setAttribute(
    "aria-hidden",
    "true"
  );

  setPageInert(false);


  /* ========================================================
     INITIAL ACTIVE SECTION
     ======================================================== */

  setActiveSection(
    0,
    false
  );

  requestNarrativeUpdate();


  /* ========================================================
     LOADER
     ======================================================== */

  startLoader();


  /* ========================================================
     HASH RESTORE
     ======================================================== */

  if (window.location.hash) {
    handleHash();
  }


  /* ========================================================
     BFCache / PAGE SHOW
     ======================================================== */

  window.addEventListener(
    "pageshow",
    (event) => {

      if (event.persisted) {

        menuOpen = false;

        header.classList.remove(
          "menu-open"
        );

        menu.classList.remove(
          "is-open"
        );

        menu.setAttribute(
          "aria-hidden",
          "true"
        );

        setMenuInert(true);

        body.classList.remove(
          "menu-is-open"
        );

        setPageInert(false);

        requestNarrativeUpdate();
      }
    }
  );


  /* ========================================================
     CLEANUP
     ======================================================== */

  window.addEventListener(
    "pagehide",
    () => {

      if (
        loaderMinTimer !== null
      ) {
        window.clearTimeout(
          loaderMinTimer
        );
      }

      if (
        loaderFallbackTimer !== null
      ) {
        window.clearTimeout(
          loaderFallbackTimer
        );
      }

      if (
        loaderExitTimer !== null
      ) {
        window.clearTimeout(
          loaderExitTimer
        );
      }

      stopNavigationMonitor();

      if (
        scrollFrame !== null
      ) {
        window.cancelAnimationFrame(
          scrollFrame
        );

        scrollFrame = null;
      }
    }
  );

})();
