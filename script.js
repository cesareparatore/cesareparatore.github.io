(() => {

  "use strict";


  /* =========================================================
     CORE REFERENCES
  ========================================================== */

  const root =
    document.documentElement;

  const body =
    document.body;

  const header =
    document.getElementById("site-header");

  const loader =
    document.getElementById("loader");

  const menu =
    document.getElementById("site-menu");

  const menuTrigger =
    document.querySelector(".menu-trigger");

  const menuLinks =
    [...document.querySelectorAll("[data-menu-link]")];

  const chapters =
    [...document.querySelectorAll("[data-chapter]")];

  const cover =
    document.querySelector("[data-cover]");

  const progressFill =
    document.getElementById("progress-fill");

  const progressPoint =
    document.getElementById("progress-point");

  const progressCurrent =
    document.getElementById("progress-current");

  const previous =
    document.getElementById("previous-section");

  const next =
    document.getElementById("next-section");

  const previousLabel =
    document.getElementById(
      "previous-section-label"
    );

  const nextLabel =
    document.getElementById(
      "next-section-label"
    );

  const idleOverlay =
    document.getElementById(
      "idle-overlay"
    );


  /* =========================================================
     MOTION / STATE
  ========================================================== */

  const reducedMotion =
    window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

  const finePointer =
    window.matchMedia(
      "(pointer:fine)"
    );


  const chapterMeta =
    chapters.map(
      (element, index) => ({
        element,
        id: element.dataset.chapter,
        title: element.dataset.title,
        index
      })
    );


  let state = {

    activeIndex: -1,

    journeyProgress: 0,

    chapterProgress: 0,

    menuOpen: false,

    idle: false

  };


  let animationFrame = 0;

  let renderRequested = true;

  let lastInteraction =
    performance.now();

  let idleTimer = null;

  let loaderFinished = false;

  let loaderFallback = null;


  /* =========================================================
     UTILITIES
  ========================================================== */

  const clamp =
    (value, min, max) =>
      Math.min(
        max,
        Math.max(
          min,
          value
        )
      );


  function requestRender() {

    renderRequested = true;

    if (!animationFrame) {

      animationFrame =
        requestAnimationFrame(
          render
        );
    }
  }


  function getSectionProgress(
    section
  ) {

    const rect =
      section.getBoundingClientRect();

    const viewport =
      window.innerHeight;

    const travel =
      Math.max(
        1,
        rect.height - viewport
      );

    return clamp(
      -rect.top / travel,
      0,
      1
    );
  }


  /* =========================================================
     STATE CALCULATION
  ========================================================== */

  function calculateState() {

    const scrollTop =
      window.scrollY;


    let activeIndex = -1;

    let nearestDistance =
      Infinity;


    chapterMeta.forEach(
      (chapter) => {

        const rect =
          chapter.element.getBoundingClientRect();


        const chapterCenter =
          rect.top +
          Math.min(
            rect.height,
            window.innerHeight
          ) / 2;


        const distance =
          Math.abs(
            chapterCenter -
            window.innerHeight / 2
          );


        const visible =
          rect.bottom >
          header.offsetHeight * .75
          &&
          rect.top <
          window.innerHeight * .75;


        if (
          visible &&
          distance <
          nearestDistance
        ) {

          nearestDistance =
            distance;

          activeIndex =
            chapter.index;
        }

      }
    );


    /*
      La cover resta una fase identitaria.
      Il capitolo 01 diventa attivo solo
      quando l'utente entra davvero nel racconto.
    */

    if (
      scrollTop <
      cover.offsetHeight * .72
    ) {

      activeIndex = -1;
    }


    const firstChapter =
      chapters[0];

    const lastChapter =
      chapters[
        chapters.length - 1
      ];


    const journeyStart =
      firstChapter.offsetTop;


    const journeyEnd =
      lastChapter.offsetTop +
      lastChapter.offsetHeight -
      window.innerHeight;


    const journeyProgress =
      clamp(
        (
          scrollTop -
          journeyStart
        ) /
        Math.max(
          1,
          journeyEnd -
          journeyStart
        ),
        0,
        1
      );


    const chapterProgress =
      activeIndex >= 0
        ? getSectionProgress(
            chapters[activeIndex]
          )
        : 0;


    state = {

      ...state,

      activeIndex,

      journeyProgress,

      chapterProgress

    };

  }


  /* =========================================================
     PROGRESS BAR
  ========================================================== */

  function updateProgressBar() {

    if (!progressFill ||
        !progressPoint) {

      return;
    }


    const progress =
      state.journeyProgress;


    progressFill.style.width =
      `${progress * 100}%`;


    const trackWidth =
      progressPoint
        .parentElement
        .getBoundingClientRect()
        .width;


    progressPoint.style.left =
      `${progress * trackWidth}px`;

  }


  /* =========================================================
     NAVIGATION STATE
  ========================================================== */

  function updateNavigation() {

    const active =
      state.activeIndex >= 0
        ? chapterMeta[
            state.activeIndex
          ]
        : null;


    const previousChapter =
      state.activeIndex > 0
        ? chapterMeta[
            state.activeIndex - 1
          ]
        : null;


    const nextChapter =
      state.activeIndex >= 0 &&
      state.activeIndex <
      chapterMeta.length - 1

        ? chapterMeta[
            state.activeIndex + 1
          ]

        : state.activeIndex < 0
          ? chapterMeta[0]
          : null;


    /*
      TITLE
    */

    if (progressCurrent) {

      progressCurrent.textContent =
        active
          ? active.title
          : "MOVIMENTO / CON DIREZIONE";

    }


    /*
      PREVIOUS
    */

    if (previousChapter) {

      previous.href =
        `#${previousChapter.id}`;

      previousLabel.textContent =
        previousChapter.id;

      previous.setAttribute(
        "aria-label",
        `Vai alla sezione ${previousChapter.id}`
      );

      previous.removeAttribute(
        "aria-hidden"
      );

      previous.removeAttribute(
        "tabindex"
      );

      previous.classList.remove(
        "is-disabled"
      );

    } else {

      previous.href = "#01";

      previousLabel.textContent = "";

      previous.setAttribute(
        "aria-label",
        "Sezione precedente"
      );

      previous.setAttribute(
        "aria-hidden",
        "true"
      );

      previous.setAttribute(
        "tabindex",
        "-1"
      );

      previous.classList.add(
        "is-disabled"
      );

    }


    /*
      NEXT
    */

    if (nextChapter) {

      next.href =
        `#${nextChapter.id}`;

      nextLabel.textContent =
        nextChapter.id;

      next.setAttribute(
        "aria-label",
        `Vai alla sezione ${nextChapter.id}`
      );

      next.classList.remove(
        "is-disabled"
      );

    } else {

      next.href = "#10";

      nextLabel.textContent = "10";

      next.setAttribute(
        "aria-label",
        "Sezione finale"
      );

      next.classList.add(
        "is-disabled"
      );

    }

  }


  /* =========================================================
     CHAPTER PROGRESS
  ========================================================== */

  function updateChapterVariables() {

    chapterMeta.forEach(
      (chapter) => {

        const progress =
          getSectionProgress(
            chapter.element
          );


        chapter.element.style
          .setProperty(
            "--section-progress",
            progress.toFixed(4)
          );

      }
    );


    root.style.setProperty(
      "--chapter-progress",
      state.chapterProgress.toFixed(4)
    );


    root.style.setProperty(
      "--journey-progress",
      state.journeyProgress.toFixed(4)
    );

  }


  /* =========================================================
     CENTRAL RENDER
  ========================================================== */

  function render() {

    animationFrame = 0;


    if (!renderRequested) {
      return;
    }


    renderRequested = false;


    calculateState();

    updateProgressBar();

    updateNavigation();

    updateChapterVariables();

  }


  /* =========================================================
     SCROLL TO HASH
  ========================================================== */

  function scrollToHash(
    hash
  ) {

    if (!hash ||
        hash === "#") {

      return;
    }


    const target =
      document.querySelector(
        hash
      );


    if (!target) {
      return;
    }


    const targetTop =
      target.getBoundingClientRect()
        .top +
      window.scrollY;


    window.scrollTo({

      top: targetTop,

      behavior:
        reducedMotion.matches
          ? "auto"
          : "smooth"

    });

  }


  /* =========================================================
     HASH NAVIGATION
  ========================================================== */

  document
    .querySelectorAll(
      'a[href^="#"]'
    )
    .forEach(
      (link) => {

        if (
          link.closest(
            ".site-menu"
          )
        ) {

          return;
        }


        link.addEventListener(
          "click",
          (event) => {

            const hash =
              link.getAttribute(
                "href"
              );


            if (!hash ||
                hash === "#") {

              return;
            }


            const target =
              document.querySelector(
                hash
              );


            if (!target) {
              return;
            }


            event.preventDefault();


            scrollToHash(hash);


            history.replaceState(
              null,
              "",
              hash
            );

          }
        );

      }
    );


  /* =========================================================
     MENU
  ========================================================== */

  function openMenu() {

    state.menuOpen = true;

    body.classList.add(
      "is-menu-open"
    );


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


    document.documentElement.style
      .setProperty(
        "scrollbar-gutter",
        "stable"
      );


    resetIdle();


    if (menuLinks[0]) {

      window.setTimeout(
        () => {

          menuLinks[0].focus({
            preventScroll: true
          });

        },
        120
      );

    }

  }


  function closeMenu({
    restoreFocus = true
  } = {}) {

    state.menuOpen = false;

    body.classList.remove(
      "is-menu-open"
    );


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
      restoreFocus
    ) {

      menuTrigger.focus({
        preventScroll: true
      });

    }


    resetIdle();

  }


  function toggleMenu() {

    if (state.menuOpen) {

      closeMenu();

    } else {

      openMenu();

    }

  }


  menuTrigger.addEventListener(
    "click",
    toggleMenu
  );


  menuLinks.forEach(
    (link) => {

      link.addEventListener(
        "click",
        (event) => {

          event.preventDefault();


          const hash =
            link.getAttribute(
              "href"
            );


          closeMenu({
            restoreFocus: false
          });


          window.setTimeout(
            () => {

              scrollToHash(
                hash
              );

            },
            40
          );


          history.replaceState(
            null,
            "",
            hash
          );

        }
      );

    }
  );


  document.addEventListener(
    "keydown",
    (event) => {

      if (
        event.key === "Escape" &&
        state.menuOpen
      ) {

        closeMenu();

      }

    }
  );


  /* =========================================================
     MAGNETIC MICRO-INTERACTION
  ========================================================== */

  function setupMagnetic() {

    if (
      reducedMotion.matches ||
      !finePointer.matches
    ) {

      return;
    }


    document
      .querySelectorAll(
        ".magnetic"
      )
      .forEach(
        (element) => {

          element.addEventListener(
            "pointermove",
            (event) => {

              const rect =
                element.getBoundingClientRect();


              const relativeX =
                (
                  event.clientX -
                  rect.left
                ) /
                rect.width -
                .5;


              const relativeY =
                (
                  event.clientY -
                  rect.top
                ) /
                rect.height -
                .5;


              const x =
                relativeX * 5;

              const y =
                relativeY * 5;


              element.style
                .setProperty(
                  "--magnetic-x",
                  `${x}px`
                );


              element.style
                .setProperty(
                  "--magnetic-y",
                  `${y}px`
                );

            }
          );


          element.addEventListener(
            "pointerleave",
            () => {

              element.style
                .setProperty(
                  "--magnetic-x",
                  "0px"
                );

              element.style
                .setProperty(
                  "--magnetic-y",
                  "0px"
                );

            }
          );

        }
      );

  }


  /* =========================================================
     IDLE
  ========================================================== */

  function resetIdle() {

    lastInteraction =
      performance.now();


    if (state.idle) {

      state.idle = false;

      body.classList.remove(
        "is-idle"
      );

      idleOverlay.setAttribute(
        "aria-hidden",
        "true"
      );

    }

  }


  function setupIdle() {

    const events = [

      "pointerdown",
      "pointermove",
      "wheel",
      "touchstart",
      "keydown",
      "scroll"

    ];


    events.forEach(
      (eventName) => {

        window.addEventListener(
          eventName,
          resetIdle,
          {
            passive: true
          }
        );

      }
    );


    function checkIdle() {

      const elapsed =
        performance.now() -
        lastInteraction;


      if (
        !state.menuOpen &&
        !reducedMotion.matches &&
        elapsed > 42000
      ) {

        state.idle = true;

        body.classList.add(
          "is-idle"
        );

        idleOverlay.setAttribute(
          "aria-hidden",
          "false"
        );

      }


      idleTimer =
        window.setTimeout(
          checkIdle,
          1000
        );

    }


    idleTimer =
      window.setTimeout(
        checkIdle,
        1000
      );

  }


  /* =========================================================
     INTERSECTION OBSERVER
  ========================================================== */

  function setupObserver() {

    if (
      !("IntersectionObserver" in window)
    ) {

      requestRender();

      return;
    }


    const observer =
      new IntersectionObserver(
        () => {

          requestRender();

        },
        {
          rootMargin:
            "-20% 0px -20% 0px",

          threshold: [
            0,
            .2,
            .5,
            .8,
            1
          ]

        }
      );


    chapters.forEach(
      (chapter) => {

        observer.observe(
          chapter
        );

      }
    );

  }


  /* =========================================================
     LOADER
  ========================================================== */

  function finishLoader() {

    if (loaderFinished) {
      return;
    }


    loaderFinished = true;


    window.clearTimeout(
      loaderFallback
    );


    if (
      reducedMotion.matches
    ) {

      loader.remove();

      requestRender();

      return;
    }


    window.setTimeout(
      () => {

        loader.classList.add(
          "is-leaving"
        );


        window.setTimeout(
          () => {

            loader.remove();

          },
          760
        );

      },
      650
    );

  }


  window.addEventListener(
    "load",
    finishLoader,
    {
      once: true
    }
  );


  /*
    Fallback fondamentale:
    la pagina NON può rimanere nera
    se un asset o un font ritarda window.load.
  */

  loaderFallback =
    window.setTimeout(
      finishLoader,
      4200
    );


  /* =========================================================
     GLOBAL INPUT
  ========================================================== */

  window.addEventListener(
    "scroll",
    requestRender,
    {
      passive: true
    }
  );


  window.addEventListener(
    "resize",
    requestRender,
    {
      passive: true
    }
  );


  window.addEventListener(
    "orientationchange",
    requestRender,
    {
      passive: true
    }
  );


  if (
    typeof reducedMotion.addEventListener ===
    "function"
  ) {

    reducedMotion.addEventListener(
      "change",
      () => {

        requestRender();

      }
    );

  }


  /* =========================================================
     INITIAL HASH
  ========================================================== */

  if (
    location.hash &&
    document.querySelector(
      location.hash
    )
  ) {

    window.addEventListener(
      "load",
      () => {

        window.setTimeout(
          () => {

            scrollToHash(
              location.hash
            );

          },
          80
        );

      },
      {
        once: true
      }
    );

  }


  /* =========================================================
     BOOT
  ========================================================== */

  setupMagnetic();

  setupIdle();

  setupObserver();

  requestRender();


})();
