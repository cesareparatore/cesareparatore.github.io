(() => {
  "use strict";

  const CFG = {
    loaderMin: 700,
    loaderMax: 2200,
    cursorLerp: 0.18,
    resizeDebounce: 160,
    navOffset: 18,
    cursorEnabled: true
  };

  const st = {
    loaded: false,
    menuOpen: false,
    reduced: false,
    active: 0,
    resizeTimer: 0,
    raf: 0,
    progressRaf: 0,
    menuReturn: null,
    pointer: {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2
    },
    cursor: {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2
    },
    visibleChapters: new Set()
  };

  const q = selector => document.querySelector(selector);
  const qa = selector => [...document.querySelectorAll(selector)];

  const dom = {
    html: document.documentElement,
    body: document.body,

    loader: q(".page-loader"),

    cursor: q(".custom-cursor"),
    dot: q(".custom-cursor-dot"),
    ring: q(".custom-cursor-ring"),

    header: q(".site-header"),
    menu: q(".site-menu"),
    menuBtn: q(".menu-trigger"),
    menuLinks: qa(".site-menu-nav a"),

    label: q("#progress-current"),
    fill: q("#progress-fill"),
    point: q("#progress-point"),

    prev: q("#previous-section"),
    prevLabel: q("#previous-section-label"),
    next: q("#next-section"),
    nextLabel: q("#next-section-label"),

    chapters: qa(".chapter"),

    magnetic: qa(".magnetic")
  };

  const clamp = (value, min, max) =>
    Math.min(Math.max(value, min), max);

  const lerp = (a, b, t) =>
    a + (b - a) * t;

  const secNum = index =>
    String(index + 1).padStart(2, "0");

  const finePointer = () =>
    window.matchMedia("(pointer:fine)").matches;

  const motionOK = () =>
    !st.reduced;

  const chapter = index =>
    dom.chapters[
      clamp(index, 0, dom.chapters.length - 1)
    ] || null;

  /* ==========================================================
     ACCESSIBILITY
     ========================================================== */

  function focusables(root) {
    if (!root) return [];

    return [
      ...root.querySelectorAll(
        'a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])'
      )
    ].filter(el =>
      !el.hidden &&
      el.offsetParent !== null
    );
  }

  function setInert(element, value) {
    if (!element) return;

    if ("inert" in element) {
      element.inert = value;
      return;
    }

    if (value) {
      element.setAttribute("inert", "");
    } else {
      element.removeAttribute("inert");
    }
  }

  /* ==========================================================
     REDUCED MOTION
     ========================================================== */

  function motionInit() {
    const media = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

    const apply = reduced => {
      st.reduced = reduced;
      dom.html.classList.toggle(
        "reduced-motion",
        reduced
      );

      if (reduced) {
        document.documentElement.style.setProperty(
          "--chapter-progress",
          "0"
        );
      }
    };

    apply(media.matches);

    media.addEventListener?.(
      "change",
      event => apply(event.matches)
    );
  }

  /* ==========================================================
     LOADER — MANTENUTO
     ========================================================== */

  function loaderInit() {
    if (!dom.loader) {
      st.loaded = true;
      return;
    }

    const started = performance.now();
    let done = false;

    const finish = () => {
      if (done) return;

      done = true;

      const wait = Math.max(
        0,
        CFG.loaderMin -
          (performance.now() - started)
      );

      setTimeout(() => {
        st.loaded = true;

        dom.loader.classList.add(
          "is-hidden"
        );

        setTimeout(() => {
          dom.loader?.remove();
        }, 700);
      }, wait);
    };

    if (document.readyState === "complete") {
      finish();
    } else {
      window.addEventListener(
        "load",
        finish,
        { once: true }
      );
    }

    setTimeout(
      finish,
      CFG.loaderMax
    );
  }

  /* ==========================================================
     MENU
     ========================================================== */

  function menuOpen() {
    if (!dom.menu || st.menuOpen) return;

    st.menuReturn = document.activeElement;
    st.menuOpen = true;

    dom.menu.setAttribute(
      "aria-hidden",
      "false"
    );

    dom.menuBtn?.setAttribute(
      "aria-expanded",
      "true"
    );

    dom.menuBtn?.setAttribute(
      "aria-label",
      "Chiudi menu"
    );

    dom.body.classList.add(
      "is-menu-open"
    );

    setInert(
      dom.menu,
      false
    );

    requestAnimationFrame(() => {
      dom.menuLinks[0]?.focus({
        preventScroll: true
      });
    });
  }

  function menuClose(restore = true) {
    if (!dom.menu || !st.menuOpen) return;

    st.menuOpen = false;

    dom.menu.setAttribute(
      "aria-hidden",
      "true"
    );

    dom.menuBtn?.setAttribute(
      "aria-expanded",
      "false"
    );

    dom.menuBtn?.setAttribute(
      "aria-label",
      "Apri menu"
    );

    dom.body.classList.remove(
      "is-menu-open"
    );

    setInert(
      dom.menu,
      true
    );

    if (restore) {
      const target = st.menuReturn;

      if (
        target &&
        document.contains(target) &&
        typeof target.focus === "function"
      ) {
        target.focus({
          preventScroll: true
        });
      } else {
        dom.menuBtn?.focus({
          preventScroll: true
        });
      }
    }

    st.menuReturn = null;
  }

  function menuInit() {
    if (!dom.menu || !dom.menuBtn) return;

    setInert(dom.menu, true);

    dom.menuBtn.addEventListener(
      "click",
      () => {
        st.menuOpen
          ? menuClose()
          : menuOpen();
      }
    );

    dom.menuLinks.forEach(link => {
      link.addEventListener(
        "click",
        () => menuClose(false)
      );
    });

    document.addEventListener(
      "keydown",
      event => {
        if (event.key === "Escape" && st.menuOpen) {
          event.preventDefault();
          menuClose();
          return;
        }

        if (
          event.key !== "Tab" ||
          !st.menuOpen
        ) {
          return;
        }

        const elements =
          focusables(dom.menu);

        if (!elements.length) return;

        const first = elements[0];
        const last =
          elements[elements.length - 1];

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
    );
  }

  /* ==========================================================
     CHAPTER NAVIGATION
     ========================================================== */

  function updateNavigation(index) {
    const current = chapter(index);

    if (!current) return;

    st.active = index;

    const total = dom.chapters.length;

    /*
     * Il progress indicator conserva il comportamento
     * del vecchio header, ma ora rappresenta 01 / 11.
     */
    const progress =
      total > 1
        ? index / (total - 1)
        : 0;

    if (dom.label) {
      dom.label.textContent =
        `${secNum(index)} / ${String(total).padStart(2, "0")}`;
    }

    if (dom.fill) {
      dom.fill.style.width =
        `${progress * 100}%`;
    }

    if (dom.point) {
      dom.point.style.left =
        `${progress * 100}%`;
    }

    const first = index === 0;
    const last = index === total - 1;

    if (dom.prev) {
      dom.prev.classList.toggle(
        "is-disabled",
        first
      );

      dom.prev.setAttribute(
        "aria-hidden",
        String(first)
      );

      if (first) {
        dom.prev.setAttribute(
          "tabindex",
          "-1"
        );
      } else {
        dom.prev.removeAttribute(
          "tabindex"
        );

        dom.prev.href =
          `#${secNum(index - 1)}`;

        dom.prev.setAttribute(
          "aria-label",
          `Vai al capitolo ${secNum(index - 1)}`
        );

        if (dom.prevLabel) {
          dom.prevLabel.textContent =
            secNum(index - 1);
        }
      }
    }

    if (dom.next) {
      if (last) {
        dom.next.href = "#01";

        dom.next.setAttribute(
          "aria-label",
          "Torna all'inizio"
        );

        if (dom.nextLabel) {
          dom.nextLabel.textContent = "01";
        }

        const arrow =
          dom.next.querySelector(
            ".section-jump-arrow"
          );

        if (arrow) {
          arrow.textContent = "↑";
        }
      } else {
        dom.next.href =
          `#${secNum(index + 1)}`;

        dom.next.setAttribute(
          "aria-label",
          `Vai al capitolo ${secNum(index + 1)}`
        );

        if (dom.nextLabel) {
          dom.nextLabel.textContent =
            secNum(index + 1);
        }

        const arrow =
          dom.next.querySelector(
            ".section-jump-arrow"
          );

        if (arrow) {
          arrow.textContent = "→";
        }
      }
    }
  }

  function goTo(index) {
    const target = chapter(index);

    if (!target) return;

    const headerHeight =
      dom.header?.offsetHeight || 0;

    const top =
      window.scrollY +
      target.getBoundingClientRect().top -
      headerHeight -
      18;

    window.scrollTo({
      top: Math.max(0, top),
      behavior: motionOK()
        ? "smooth"
        : "auto"
    });

    history.replaceState(
      null,
      "",
      `#${target.id}`
    );
  }

  function navigationInit() {
    dom.prev?.addEventListener(
      "click",
      event => {
        event.preventDefault();

        if (st.active > 0) {
          goTo(st.active - 1);
        }
      }
    );

    dom.next?.addEventListener(
      "click",
      event => {
        event.preventDefault();

        if (
          st.active ===
          dom.chapters.length - 1
        ) {
          goTo(0);
        } else {
          goTo(st.active + 1);
        }
      }
    );
  }

  /* ==========================================================
     INTERSECTION OBSERVER
     ========================================================== */

  function chapterObserverInit() {
    if (!dom.chapters.length) return;

    if (!("IntersectionObserver" in window)) {
      updateNavigation(0);
      return;
    }

    const observer =
      new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            const index =
              dom.chapters.indexOf(
                entry.target
              );

            if (entry.isIntersecting) {
              st.visibleChapters.add(index);
            } else {
              st.visibleChapters.delete(index);
            }
          });

          if (!st.visibleChapters.size) {
            return;
          }

          const center =
            window.innerHeight / 2;

          let best = st.active;
          let distance = Infinity;

          st.visibleChapters.forEach(
            index => {
              const target =
                chapter(index);

              if (!target) return;

              const rect =
                target.getBoundingClientRect();

              const targetCenter =
                rect.top +
                rect.height / 2;

              const distanceToCenter =
                Math.abs(
                  targetCenter - center
                );

              if (
                distanceToCenter <
                distance
              ) {
                distance =
                  distanceToCenter;
                best = index;
              }
            }
          );

          if (best !== st.active) {
            updateNavigation(best);
          }
        },
        {
          threshold: [0, .1, .25, .5],
          rootMargin:
            "-15% 0px -15% 0px"
        }
      );

    dom.chapters.forEach(
      chapterElement =>
        observer.observe(
          chapterElement
        )
    );
  }

  /* ==========================================================
     CHAPTER PROGRESS
     ========================================================== */

  function calculateChapterProgress() {
    if (!dom.chapters.length) return;

    const current =
      chapter(st.active);

    if (!current) return;

    const rect =
      current.getBoundingClientRect();

    const viewport =
      window.innerHeight;

    /*
     * La progressione riguarda la posizione
     * del capitolo nella viewport, non l'intera pagina.
     */
    const total =
      rect.height + viewport;

    const currentPosition =
      viewport - rect.top;

    const progress =
      clamp(
        currentPosition / total,
        0,
        1
      );

    dom.html.style.setProperty(
      "--chapter-progress",
      progress.toFixed(4)
    );
  }

  function requestProgressFrame() {
    if (st.progressRaf) return;

    st.progressRaf =
      requestAnimationFrame(() => {
        st.progressRaf = 0;
        calculateChapterProgress();
      });
  }

  function chapterProgressInit() {
    calculateChapterProgress();

    window.addEventListener(
      "scroll",
      requestProgressFrame,
      { passive: true }
    );
  }

  /* ==========================================================
     KEYBOARD NAVIGATION
     ========================================================== */

  function keyboardInit() {
    document.addEventListener(
      "keydown",
      event => {
        if (
          st.menuOpen ||
          !dom.chapters.length
        ) {
          return;
        }

        if (
          event.key !== "PageDown" &&
          event.key !== "PageUp"
        ) {
          return;
        }

        event.preventDefault();

        const direction =
          event.key === "PageDown"
            ? 1
            : -1;

        goTo(
          clamp(
            st.active + direction,
            0,
            dom.chapters.length - 1
          )
        );
      }
    );
  }

  /* ==========================================================
     HASH
     ========================================================== */

  function hashInit() {
    const raw =
      window.location.hash.slice(1);

    const index =
      dom.chapters.findIndex(
        element =>
          element.id === raw
      );

    if (index < 0) return;

    setTimeout(
      () => goTo(index),
      st.reduced ? 0 : 100
    );
  }

  /* ==========================================================
     HEADER STATE
     ========================================================== */

  function headerInit() {
    if (!dom.header) return;

    let previousY =
      window.scrollY;

    let ticking = false;

    const update = () => {
      const currentY =
        window.scrollY;

      if (
        currentY > 30 &&
        currentY > previousY
      ) {
        dom.header.classList.add(
          "is-scrolled"
        );
      } else if (
        currentY < previousY
      ) {
        dom.header.classList.remove(
          "is-scrolled"
        );
      }

      previousY = currentY;
      ticking = false;
    };

    window.addEventListener(
      "scroll",
      () => {
        if (ticking) return;

        ticking = true;

        requestAnimationFrame(update);
      },
      { passive: true }
    );
  }

  /* ==========================================================
     CURSOR
     ========================================================== */

  function cursorInit() {
    if (
      !CFG.cursorEnabled ||
      !dom.cursor ||
      !dom.dot ||
      !dom.ring ||
      !finePointer() ||
      st.reduced
    ) {
      return;
    }

    document.addEventListener(
      "pointermove",
      event => {
        st.pointer.x =
          event.clientX;

        st.pointer.y =
          event.clientY;

        dom.cursor.classList.add(
          "is-visible"
        );

        requestCursorFrame();
      },
      { passive: true }
    );

    qa("a,button").forEach(
      element => {
        element.addEventListener(
          "pointerenter",
          () =>
            dom.cursor.classList.add(
              "is-hovering"
            )
        );

        element.addEventListener(
          "pointerleave",
          () =>
            dom.cursor.classList.remove(
              "is-hovering"
            )
        );
      }
    );

    window.addEventListener(
      "pointerleave",
      () =>
        dom.cursor.classList.remove(
          "is-visible",
          "is-hovering"
        )
    );
  }

  function requestCursorFrame() {
    if (st.raf) return;

    st.raf =
      requestAnimationFrame(
        cursorFrame
      );
  }

  function cursorFrame() {
    st.raf = 0;

    if (
      !dom.cursor ||
      !dom.dot ||
      !dom.ring ||
      st.reduced ||
      !finePointer()
    ) {
      return;
    }

    st.cursor.x =
      lerp(
        st.cursor.x,
        st.pointer.x,
        CFG.cursorLerp
      );

    st.cursor.y =
      lerp(
        st.cursor.y,
        st.pointer.y,
        CFG.cursorLerp
      );

    dom.dot.style.transform =
      `translate3d(${st.pointer.x}px,${st.pointer.y}px,0) translate(-50%,-50%)`;

    dom.ring.style.transform =
      `translate3d(${st.cursor.x}px,${st.cursor.y}px,0) translate(-50%,-50%)`;

    const dx =
      Math.abs(
        st.cursor.x -
        st.pointer.x
      );

    const dy =
      Math.abs(
        st.cursor.y -
        st.pointer.y
      );

    if (dx > .2 || dy > .2) {
      requestCursorFrame();
    }
  }

  /* ==========================================================
     MAGNETIC — desktop only
     ========================================================== */

  function magneticInit() {
    if (
      !finePointer() ||
      st.reduced
    ) {
      return;
    }

    dom.magnetic.forEach(
      element => {
        element.addEventListener(
          "pointermove",
          event => {
            const rect =
              element.getBoundingClientRect();

            const dx =
              event.clientX -
              (rect.left +
                rect.width / 2);

            const dy =
              event.clientY -
              (rect.top +
                rect.height / 2);

            const distance =
              Math.hypot(dx, dy);

            const radius = 90;

            if (distance > radius) {
              return;
            }

            const strength =
              .12 *
              (1 -
                distance / radius);

            element.style.setProperty(
              "--magnetic-x",
              `${dx * strength}px`
            );

            element.style.setProperty(
              "--magnetic-y",
              `${dy * strength}px`
            );
          },
          { passive: true }
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
      }
    );
  }

  /* ==========================================================
     RESIZE
     ========================================================== */

  function resizeInit() {
    window.addEventListener(
      "resize",
      () => {
        clearTimeout(
          st.resizeTimer
        );

        st.resizeTimer =
          setTimeout(() => {
            calculateChapterProgress();
          }, CFG.resizeDebounce);
      },
      { passive: true }
    );
  }

  /* ==========================================================
     INITIAL STATE
     ========================================================== */

  function initialState() {
    if (!dom.chapters.length) {
      return;
    }

    updateNavigation(0);
    calculateChapterProgress();
  }

  /* ==========================================================
     INIT
     ========================================================== */

  function init() {
    motionInit();

    loaderInit();

    menuInit();

    navigationInit();

    chapterObserverInit();

    chapterProgressInit();

    keyboardInit();

    hashInit();

    headerInit();

    cursorInit();

    magneticInit();

    resizeInit();

    initialState();

    document.addEventListener(
      "visibilitychange",
      () => {
        if (
          document.hidden &&
          st.raf
        ) {
          cancelAnimationFrame(
            st.raf
          );

          st.raf = 0;
        }

        if (
          !document.hidden &&
          finePointer() &&
          !st.reduced
        ) {
          requestCursorFrame();
        }
      }
    );
  }

  if (
    document.readyState ===
    "loading"
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
