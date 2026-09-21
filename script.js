(() => {
  "use strict";

  /* ========================================================
     CONFIG
  ======================================================== */

  const CFG = {
    loaderMin: 3200,
    loaderMax: 3800,

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


  /* ========================================================
     STATE
  ======================================================== */

  const st = {
    loaded: false,
    menuOpen: false,
    standby: false,
    active: 0,
    reduced: false,

    resizeTimer: 0,
    standbyTimer: 0,
    raf: 0,

    menuReturn: null,
    standbyReturn: null,

    pointer: {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2
    },

    cursor: {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2
    },

    traj: {
      p: 0,
      tp: 0,
      d: 0,
      td: 0
    },

    cursorRunning: false
  };


  /* ========================================================
     DOM
  ======================================================== */

  const dom = {
    body: document.body,

    loader: document.querySelector(".page-loader"),
    transition: document.querySelector(".page-transition"),

    cursor: document.querySelector(".custom-cursor"),
    cursorDot: document.querySelector(".custom-cursor-dot"),
    cursorRing: document.querySelector(".custom-cursor-ring"),

    header: document.querySelector(".site-header"),
    brand: document.querySelector(".site-brand"),
    menuTrigger: document.querySelector(".menu-trigger"),

    progress: document.querySelector(".wow-progress"),
    progressCurrent: document.querySelector("#progress-current"),
    progressFill: document.querySelector("#progress-fill"),
    progressPoint: document.querySelector("#progress-point"),

    previous: document.querySelector("#previous-section"),
    previousLabel: document.querySelector("#previous-section-label"),

    next: document.querySelector("#next-section"),
    nextLabel: document.querySelector("#next-section-label"),

    menu: document.querySelector("#site-menu"),

    menuLinks: [
      ...document.querySelectorAll("#site-menu a")
    ],

    sections: [
      ...document.querySelectorAll(".home-section")
    ],

    reveals: [
      ...document.querySelectorAll(".reveal")
    ],

    narrativeLinks: [
      ...document.querySelectorAll("[data-trajectory-node]")
    ],

    magnetic: [
      ...document.querySelectorAll(".magnetic")
    ],

    directions: [
      ...document.querySelectorAll(".hero-direction")
    ],

    directionNodes: [
      ...document.querySelectorAll(".direction-node")
    ],

    networkNodes: [
      ...document.querySelectorAll(".network-node")
    ],

    cta: document.querySelector(".contact-cta"),
    ctaTrajectory: document.querySelector(".cta-trajectory"),

    standby: document.querySelector(".standby-screen"),
    standbyWake: document.querySelector(".standby-wake")
  };


  /* ========================================================
     MOTION
  ======================================================== */

  function motionInit() {
    st.reduced =
      window.matchMedia &&
      window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

    if (st.reduced) {
      dom.body.classList.add("reduced-motion");
    }
  }


  /* ========================================================
     LOADER
  ======================================================== */

  function loaderInit() {
    if (!dom.loader) {
      st.loaded = true;
      return;
    }

    const start = performance.now();

    const finish = () => {
      if (st.loaded) return;

      st.loaded = true;

      const elapsed = performance.now() - start;

      const remaining = Math.max(
        0,
        CFG.loaderMin - elapsed
      );

      window.setTimeout(() => {
        dom.loader.classList.add("is-hidden");

        window.setTimeout(() => {
          dom.loader.setAttribute(
            "aria-hidden",
            "true"
          );

          dom.loader.style.pointerEvents = "none";
        }, 850);

        requestAnimationFrame(() => {
          revealInit();
          wowUpdate(true);
        });
      }, remaining);
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

    window.setTimeout(
      finish,
      CFG.loaderMax
    );
  }


  /* ========================================================
     PAGE TRANSITIONS
  ======================================================== */

  function pageTransitionsInit() {
    if (!dom.transition) return;

    document.addEventListener("click", event => {
      const link = event.target.closest("a");

      if (!link) return;
      if (event.defaultPrevented) return;
      if (event.button !== 0) return;

      if (
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      if (link.target === "_blank") return;
      if (link.hasAttribute("download")) return;

      const href = link.getAttribute("href");

      if (!href) return;
      if (href.startsWith("#")) return;
      if (href.startsWith("mailto:")) return;
      if (href.startsWith("tel:")) return;

      let url;

      try {
        url = new URL(
          href,
          window.location.href
        );
      } catch {
        return;
      }

      const sameDocument =
        url.origin === window.location.origin &&
        url.pathname === window.location.pathname &&
        url.search === window.location.search;

      if (sameDocument) return;

      if (
        url.origin !==
        window.location.origin
      ) {
        return;
      }

      event.preventDefault();

      dom.transition.classList.add(
        "is-active"
      );

      window.setTimeout(() => {
        window.location.href = url.href;
      }, CFG.transitionMs);
    });

    window.addEventListener(
      "pageshow",
      () => {
        dom.transition.classList.remove(
          "is-active"
        );
      }
    );
  }


  /* ========================================================
     MENU
  ======================================================== */

  function menuOpen() {
    if (!dom.menu || st.menuOpen) return;

    st.menuOpen = true;
    st.menuReturn = document.activeElement;

    dom.body.classList.add(
      "is-menu-open"
    );

    dom.menu.classList.add(
      "is-open"
    );

    dom.menu.setAttribute(
      "aria-hidden",
      "false"
    );

    dom.menu.removeAttribute("inert");

    dom.menuTrigger?.setAttribute(
      "aria-expanded",
      "true"
    );

    dom.menuTrigger?.setAttribute(
      "aria-label",
      "Chiudi menu"
    );

    window.setTimeout(() => {
      dom.menuLinks[0]?.focus();
    }, 120);
  }


  function menuClose(restoreFocus = true) {
    if (!dom.menu || !st.menuOpen) return;

    st.menuOpen = false;

    dom.body.classList.remove(
      "is-menu-open"
    );

    dom.menu.classList.remove(
      "is-open"
    );

    dom.menu.setAttribute(
      "aria-hidden",
      "true"
    );

    dom.menu.setAttribute(
      "inert",
      ""
    );

    dom.menuTrigger?.setAttribute(
      "aria-expanded",
      "false"
    );

    dom.menuTrigger?.setAttribute(
      "aria-label",
      "Apri menu"
    );

    if (
      restoreFocus &&
      st.menuReturn instanceof HTMLElement
    ) {
      st.menuReturn.focus();
    }

    st.menuReturn = null;
  }


  function menuInit() {
    if (
      !dom.menuTrigger ||
      !dom.menu
    ) {
      return;
    }

    /* Stato iniziale */
    dom.menu.setAttribute(
      "aria-hidden",
      "true"
    );

    dom.menu.setAttribute(
      "inert",
      ""
    );

    dom.menuTrigger.setAttribute(
      "aria-expanded",
      "false"
    );

    dom.menuTrigger.addEventListener(
      "click",
      event => {
        event.preventDefault();
        event.stopPropagation();

        if (st.menuOpen) {
          menuClose();
        } else {
          menuOpen();
        }
      }
    );

    dom.menuLinks.forEach(link => {
      link.addEventListener(
        "click",
        () => {
          menuClose(false);
        }
      );
    });

    dom.menu.addEventListener(
      "click",
      event => {
        if (event.target === dom.menu) {
          menuClose();
        }
      }
    );
  }


/* ========================================================
   SECTION / PROGRESS
======================================================== */

function getHeaderHeight() {
  return dom.header
    ? dom.header.getBoundingClientRect().height
    : 0;
}


function getSectionTop(section) {
  if (!section) return 0;

  const rect =
    section.getBoundingClientRect();

  return (
    window.scrollY +
    rect.top -
    getHeaderHeight() -
    CFG.navOffset
  );
}


function goTo(index, options = {}) {
  if (!dom.sections.length) return;

  const clamped = Math.max(
    0,
    Math.min(
      index,
      dom.sections.length - 1
    )
  );

  const section =
    dom.sections[clamped];

  if (!section) return;

  const target =
    getSectionTop(section);

  const behavior =
    options.instant || st.reduced
      ? "auto"
      : "smooth";

  window.scrollTo({
    top: Math.max(0, target),
    behavior
  });

  st.active = clamped;

  wowUpdate(true);
}


function updateProgress(index) {
  if (!dom.sections.length) return;

  const clamped = Math.max(
    0,
    Math.min(
      index,
      dom.sections.length - 1
    )
  );

  const section =
    dom.sections[clamped];

  if (!section) return;

  st.active = clamped;

  /* ----------------------------------------
     Titolo sezione
  ---------------------------------------- */

  const title =
    section.dataset.sectionTitle || "";

  if (dom.progressCurrent) {
    dom.progressCurrent.textContent =
      title;
  }


  /* ----------------------------------------
     Progressione
  ---------------------------------------- */

  const progress =
    dom.sections.length > 1
      ? clamped /
        (dom.sections.length - 1)
      : 0;

  if (dom.progressFill) {
    dom.progressFill.style.width =
      `${progress * 100}%`;
  }

  if (dom.progressPoint) {
    dom.progressPoint.style.left =
      `${progress * 100}%`;
  }


  /* ----------------------------------------
     Precedente
  ---------------------------------------- */

  const previousIndex =
    clamped - 1;

  if (
    dom.previous &&
    dom.previousLabel
  ) {
    if (previousIndex >= 0) {
      const number =
        String(
          previousIndex + 1
        ).padStart(2, "0");

      dom.previous.classList.remove(
        "is-disabled"
      );

      dom.previous.setAttribute(
        "aria-hidden",
        "false"
      );

      dom.previous.setAttribute(
        "tabindex",
        "0"
      );

      dom.previous.href =
        `#${number}`;

      dom.previousLabel.textContent =
        number;

    } else {
      dom.previous.classList.add(
        "is-disabled"
      );

      dom.previous.setAttribute(
        "aria-hidden",
        "true"
      );

      dom.previous.setAttribute(
        "tabindex",
        "-1"
      );

      dom.previous.href =
        "#01";

      dom.previousLabel.textContent =
        "";
    }
  }


  /* ----------------------------------------
     Successiva
  ---------------------------------------- */

  const nextIndex =
    clamped + 1;

  if (
    dom.next &&
    dom.nextLabel
  ) {
    if (
      nextIndex <
      dom.sections.length
    ) {
      const number =
        String(
          nextIndex + 1
        ).padStart(2, "0");

      dom.next.classList.remove(
        "is-disabled"
      );

      dom.next.href =
        `#${number}`;

      dom.nextLabel.textContent =
        number;

      dom.next.setAttribute(
        "aria-label",
        `Vai alla sezione ${number}`
      );

    } else {
      const finalNumber =
        String(
          dom.sections.length
        ).padStart(2, "0");

      dom.next.classList.add(
        "is-disabled"
      );

      dom.next.href =
        `#${finalNumber}`;

      dom.nextLabel.textContent =
        finalNumber;

      dom.next.setAttribute(
        "aria-label",
        "Fine del percorso"
      );
    }
  }
}


function wowUpdate(force = false) {
  if (!dom.sections.length) return;

  /*
     Il punto di riferimento è appena sotto
     l'header, non il centro della viewport.

     Questo rende la navigazione dell'header
     coerente con la sezione realmente visibile.
  */

  const headerHeight =
    getHeaderHeight();

  const reference =
    window.scrollY +
    headerHeight +
    Math.min(
      window.innerHeight * 0.18,
      160
    );

  let closest = 0;
  let distance = Infinity;

  dom.sections.forEach(
    (section, index) => {
      const rect =
        section.getBoundingClientRect();

      const top =
        window.scrollY +
        rect.top;

      const currentDistance =
        Math.abs(
          top -
          reference
        );

      if (
        currentDistance <
        distance
      ) {
        distance =
          currentDistance;

        closest = index;
      }
    }
  );

  if (
    !force &&
    closest === st.active
  ) {
    return;
  }

  updateProgress(closest);
}


function activeDetect() {
  wowUpdate();
}


function wowInit() {
  if (!dom.sections.length) return;

  dom.previous?.addEventListener(
    "click",
    event => {
      event.preventDefault();

      if (st.active > 0) {
        goTo(
          st.active - 1
        );
      }
    }
  );

  dom.next?.addEventListener(
    "click",
    event => {
      event.preventDefault();

      if (
        st.active <
        dom.sections.length - 1
      ) {
        goTo(
          st.active + 1
        );
      }
    }
  );

  dom.brand?.addEventListener(
    "click",
    event => {
      event.preventDefault();

      goTo(0);
    }
  );

  activeDetect();
}


  /* ========================================================
     REVEALS
  ======================================================== */

  function revealInit() {
    if (!dom.reveals.length) return;

    if (st.reduced) {
      dom.reveals.forEach(item => {
        item.classList.add(
          "is-visible"
        );
      });

      return;
    }

    if (
      !("IntersectionObserver" in window)
    ) {
      dom.reveals.forEach(item => {
        item.classList.add(
          "is-visible"
        );
      });

      return;
    }

    const observer =
      new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (
              entry.isIntersecting
            ) {
              entry.target.classList.add(
                "is-visible"
              );

              observer.unobserve(
                entry.target
              );
            }
          });
        },
        {
          threshold:
            CFG.revealThreshold,

          rootMargin:
            "0px 0px -8% 0px"
        }
      );

    dom.reveals.forEach(item => {
      observer.observe(item);
    });
  }


  /* ========================================================
     DIRECTION / NARRATIVE
  ======================================================== */

  function clearDirectionState(key) {
    dom.directions.forEach(item => {
      item.classList.toggle(
        "is-active",
        item.dataset.direction === key
      );
    });

    dom.directionNodes.forEach(item => {
      item.classList.toggle(
        "is-linked",
        item.dataset.direction === key
      );
    });

    dom.networkNodes.forEach(item => {
      item.classList.toggle(
        "is-linked",
        item.dataset.node === key
      );
    });

    document
      .querySelectorAll(
        ".five-directions a"
      )
      .forEach(item => {
        item.classList.toggle(
          "is-linked",
          item.dataset.trajectoryNode === key
        );
      });
  }


  function directionInit() {
    const items = [
      ...dom.directions,
      ...dom.narrativeLinks
    ];

    items.forEach(item => {
      const key =
        item.dataset.direction ||
        item.dataset.trajectoryNode;

      if (!key) return;

      item.addEventListener(
        "mouseenter",
        () => {
          clearDirectionState(key);
        }
      );

      item.addEventListener(
        "focus",
        () => {
          clearDirectionState(key);
        }
      );

      item.addEventListener(
        "mouseleave",
        () => {
          clearDirectionState("");
        }
      );

      item.addEventListener(
        "blur",
        () => {
          clearDirectionState("");
        }
      );
    });
  }


  function narrativeInit() {
    dom.narrativeLinks.forEach(
      link => {
        const key =
          link.dataset.trajectoryNode;

        if (!key) return;

        link.addEventListener(
          "mouseenter",
          () => {
            clearDirectionState(key);
          }
        );

        link.addEventListener(
          "focus",
          () => {
            clearDirectionState(key);
          }
        );
      }
    );
  }


  /* ========================================================
     CURSOR
  ======================================================== */

  function cursorRender() {
    if (
      !dom.cursor ||
      !dom.cursorDot ||
      !dom.cursorRing
    ) {
      st.cursorRunning = false;
      return;
    }

    const dx =
      st.pointer.x -
      st.cursor.x;

    const dy =
      st.pointer.y -
      st.cursor.y;

    st.cursor.x +=
      dx * CFG.cursorLerp;

    st.cursor.y +=
      dy * CFG.cursorLerp;

    dom.cursorDot.style.transform =
      `translate3d(
        ${st.pointer.x - 3}px,
        ${st.pointer.y - 3}px,
        0
      )`;

    dom.cursorRing.style.transform =
      `translate3d(
        ${st.cursor.x - 15}px,
        ${st.cursor.y - 15}px,
        0
      )`;

    if (
      Math.abs(dx) > 0.2 ||
      Math.abs(dy) > 0.2
    ) {
      requestAnimationFrame(
        cursorRender
      );
    } else {
      st.cursorRunning = false;
    }
  }


  function cursorInit() {
    if (
      !dom.cursor ||
      st.reduced ||
      !window.matchMedia(
        "(pointer:fine)"
      ).matches
    ) {
      return;
    }

    const move = event => {
      st.pointer.x =
        event.clientX;

      st.pointer.y =
        event.clientY;

      dom.cursor.classList.add(
        "is-visible"
      );

      if (!st.cursorRunning) {
        st.cursorRunning = true;

        requestAnimationFrame(
          cursorRender
        );
      }
    };

    window.addEventListener(
      "pointermove",
      move,
      {
        passive: true
      }
    );

    window.addEventListener(
      "pointerleave",
      () => {
        dom.cursor.classList.remove(
          "is-visible"
        );
      }
    );

    const hoverTargets =
      document.querySelectorAll(
        "a, button, [role='button']"
      );

    hoverTargets.forEach(
      target => {
        target.addEventListener(
          "mouseenter",
          () => {
            dom.cursor.classList.add(
              "is-hovering"
            );
          }
        );

        target.addEventListener(
          "mouseleave",
          () => {
            dom.cursor.classList.remove(
              "is-hovering"
            );
          }
        );
      }
    );
  }


  /* ========================================================
     MAGNETIC
  ======================================================== */

  function magneticInit() {
    if (
      st.reduced ||
      !window.matchMedia(
        "(pointer:fine)"
      ).matches
    ) {
      return;
    }

    dom.magnetic.forEach(
      element => {
        const reset = () => {
          element.style.setProperty(
            "--magnetic-x",
            "0px"
          );

          element.style.setProperty(
            "--magnetic-y",
            "0px"
          );
        };

        element.addEventListener(
          "pointermove",
          event => {
            const rect =
              element.getBoundingClientRect();

            const centerX =
              rect.left +
              rect.width / 2;

            const centerY =
              rect.top +
              rect.height / 2;

            const distanceX =
              event.clientX -
              centerX;

            const distanceY =
              event.clientY -
              centerY;

            const distance =
              Math.hypot(
                distanceX,
                distanceY
              );

            if (
              distance >
              CFG.magneticRadius
            ) {
              reset();
              return;
            }

            element.style.setProperty(
              "--magnetic-x",
              `${distanceX * CFG.magneticStrength}px`
            );

            element.style.setProperty(
              "--magnetic-y",
              `${distanceY * CFG.magneticStrength}px`
            );
          }
        );

        element.addEventListener(
          "pointerleave",
          reset
        );
      }
    );
  }


  /* ========================================================
     CTA
  ======================================================== */

  function ctaInit() {
    if (
      !dom.ctaTrajectory ||
      !dom.cta
    ) {
      return;
    }

    const activate = () => {
      dom.ctaTrajectory.classList.add(
        "is-engaged"
      );
    };

    const deactivate = () => {
      dom.ctaTrajectory.classList.remove(
        "is-engaged"
      );
    };

    dom.cta.addEventListener(
      "mouseenter",
      activate
    );

    dom.cta.addEventListener(
      "focus",
      activate
    );

    dom.cta.addEventListener(
      "mouseleave",
      deactivate
    );

    dom.cta.addEventListener(
      "blur",
      deactivate
    );
  }


  /* ========================================================
     STANDBY
  ======================================================== */

  function clearStandbyTimer() {
    if (st.standbyTimer) {
      window.clearTimeout(
        st.standbyTimer
      );

      st.standbyTimer = 0;
    }
  }


  function resetStandby() {
    if (st.standby) return;

    clearStandbyTimer();

    st.standbyTimer =
      window.setTimeout(
        openStandby,
        CFG.standbyDelay
      );
  }


  function openStandby() {
    if (
      st.standby ||
      st.menuOpen ||
      !st.loaded ||
      document.visibilityState !==
        "visible"
    ) {
      return;
    }

    st.standby = true;

    st.standbyReturn =
      document.activeElement;

    dom.body.classList.add(
      "is-standby"
    );

    dom.standby?.classList.add(
      "is-active"
    );

    dom.standby?.setAttribute(
      "aria-hidden",
      "false"
    );

    dom.standby?.removeAttribute(
      "inert"
    );

    window.setTimeout(() => {
      dom.standbyWake?.focus();
    }, 120);
  }


  function closeStandby(
    restoreFocus = true
  ) {
    if (!st.standby) return;

    st.standby = false;

    dom.body.classList.remove(
      "is-standby"
    );

    dom.standby?.classList.remove(
      "is-active"
    );

    dom.standby?.setAttribute(
      "aria-hidden",
      "true"
    );

    dom.standby?.setAttribute(
      "inert",
      ""
    );

    if (
      restoreFocus &&
      st.standbyReturn instanceof
        HTMLElement
    ) {
      st.standbyReturn.focus();
    }

    st.standbyReturn = null;

    resetStandby();
  }


  function standbyInit() {
    if (!dom.standby) return;

    dom.standbyWake?.addEventListener(
      "click",
      () => {
        closeStandby();
      }
    );

    [
      "pointerdown",
      "scroll",
      "keydown",
      "touchstart"
    ].forEach(eventName => {
      window.addEventListener(
        eventName,
        () => {
          if (!st.standby) {
            resetStandby();
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
        if (
          document.visibilityState ===
          "hidden"
        ) {
          clearStandbyTimer();
        } else if (!st.standby) {
          resetStandby();
        }
      }
    );

    resetStandby();
  }


  /* ========================================================
     TRAJECTORY
  ======================================================== */

  function trajectoryTargets() {
    if (!dom.sections.length) return;

    const first =
      dom.sections[0];

    const last =
      dom.sections[
        dom.sections.length - 1
      ];

    const firstTop =
      window.scrollY +
      first.getBoundingClientRect().top;

    const lastBottom =
      window.scrollY +
      last.getBoundingClientRect().bottom;

    const total =
      Math.max(
        1,
        lastBottom - firstTop
      );

    const current =
      window.scrollY +
      window.innerHeight * 0.42 -
      firstTop;

    const progress =
      Math.max(
        0,
        Math.min(
          1,
          current / total
        )
      );

    st.traj.tp =
      progress;

    st.traj.td =
      Math.sin(
        progress *
        Math.PI *
        2
      ) *
      CFG.trajectoryDrift;
  }


  function trajectoryFrame() {
    st.traj.p +=
      (
        st.traj.tp -
        st.traj.p
      ) *
      CFG.trajectoryLerp;

    st.traj.d +=
      (
        st.traj.td -
        st.traj.d
      ) *
      CFG.trajectoryLerp;

    dom.body.style.setProperty(
      "--trajectory-drift",
      `${st.traj.d}px`
    );
  }


  /* ========================================================
     RAF
  ======================================================== */

  function animationFrame() {
    trajectoryFrame();

    st.raf =
      requestAnimationFrame(
        animationFrame
      );
  }


  function animationInit() {
    if (st.reduced) return;

    st.raf =
      requestAnimationFrame(
        animationFrame
      );
  }


  /* ========================================================
     HASH
  ======================================================== */

  function hashInit() {
    const applyHash = () => {
      const hash =
        window.location.hash;

      if (!hash) return;

      const target =
        document.getElementById(
          hash.slice(1)
        );

      if (!target) return;

      const index =
        dom.sections.indexOf(target);

      if (index === -1) return;

      window.setTimeout(() => {
        goTo(index, {
          instant: true
        });
      }, 100);
    };

    applyHash();

    window.addEventListener(
      "hashchange",
      applyHash
    );
  }


  /* ========================================================
     KEYBOARD
  ======================================================== */

  function keyboardInit() {
    document.addEventListener(
      "keydown",
      event => {

        if (event.key === "Escape") {
          if (st.menuOpen) {
            menuClose();
            return;
          }

          if (st.standby) {
            closeStandby();
          }

          return;
        }

        if (st.menuOpen) {
          if (event.key === "Tab") {
            const focusable =
              dom.menu.querySelectorAll(
                "a,button,[tabindex]:not([tabindex='-1'])"
              );

            if (!focusable.length) return;

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
            } else if (
              !event.shiftKey &&
              document.activeElement === last
            ) {
              event.preventDefault();
              first.focus();
            }
          }

          return;
        }

        if (
          event.key === "ArrowDown" ||
          event.key === "PageDown"
        ) {
          event.preventDefault();

          goTo(
            Math.min(
              st.active + 1,
              dom.sections.length - 1
            )
          );
        }

        if (
          event.key === "ArrowUp" ||
          event.key === "PageUp"
        ) {
          event.preventDefault();

          goTo(
            Math.max(
              st.active - 1,
              0
            )
          );
        }
      }
    );
  }


  /* ========================================================
     SCROLL
  ======================================================== */

  function scrollInit() {
    let ticking = false;

    window.addEventListener(
      "scroll",
      () => {
        resetStandby();

        if (ticking) return;

        ticking = true;

        requestAnimationFrame(() => {
          activeDetect();
          trajectoryTargets();

          ticking = false;
        });
      },
      {
        passive: true
      }
    );
  }


  /* ========================================================
     RESIZE
  ======================================================== */

  function resizeInit() {
    window.addEventListener(
      "resize",
      () => {
        window.clearTimeout(
          st.resizeTimer
        );

        st.resizeTimer =
  window.setTimeout(() => {
    trajectoryTargets();
    updateProgress(st.active);
    wowUpdate(true);
  }, CFG.resizeDebounce);
      },
      {
        passive: true
      }
    );
  }


  /* ========================================================
     INITIAL STATE
  ======================================================== */

  function setInitial() {
    if (!dom.sections.length) return;

    st.active = 0;

    if (dom.progressCurrent) {
      dom.progressCurrent.textContent =
        dom.sections[0]
          .dataset.sectionTitle ||
        "";
    }

    if (dom.progressFill) {
      dom.progressFill.style.width =
        "0%";
    }

    if (dom.progressPoint) {
      dom.progressPoint.style.left =
        "0%";
    }

    if (dom.previous) {
      dom.previous.classList.add(
        "is-disabled"
      );

      dom.previous.setAttribute(
        "aria-hidden",
        "true"
      );

      dom.previous.setAttribute(
        "tabindex",
        "-1"
      );
    }

    if (
      dom.next &&
      dom.nextLabel
    ) {
      dom.next.href = "#02";
      dom.nextLabel.textContent =
        "02";
    }
  }


  /* ========================================================
     INIT
  ======================================================== */

  function init() {
    motionInit();

    setInitial();

    loaderInit();

    pageTransitionsInit();

    menuInit();

    wowInit();

    revealInit();

    directionInit();

    narrativeInit();

    cursorInit();

    magneticInit();

    ctaInit();

    standbyInit();

    hashInit();

    keyboardInit();

    scrollInit();

    resizeInit();

    trajectoryTargets();

    animationInit();
  }


  /* ========================================================
     BOOT
  ======================================================== */

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
