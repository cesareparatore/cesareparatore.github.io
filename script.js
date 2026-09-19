(() => {
  "use strict";

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

  const DIRECTIONS = [
    "sport",
    "scienze-motorie",
    "educazione",
    "management",
    "digitale"
  ];

  const JOURNEY = {
    0: {
      visited: [],
      current: null,
      state: "origin"
    },

    1: {
      visited: ["sport"],
      current: "sport",
      state: "current"
    },

    2: {
      visited: DIRECTIONS,
      current: null,
      state: "exploration"
    },

    3: {
      visited: DIRECTIONS,
      current: null,
      state: "converged"
    },

    4: {
      visited: DIRECTIONS,
      current: null,
      state: "pause"
    },

    5: {
      visited: DIRECTIONS,
      current: null,
      state: "territory"
    },

    6: {
      visited: DIRECTIONS,
      current: null,
      state: "integrated"
    },

    7: {
      visited: DIRECTIONS,
      current: null,
      state: "possibility"
    },

    8: {
      visited: DIRECTIONS,
      current: null,
      state: "reader"
    },

    9: {
      visited: DIRECTIONS,
      current: null,
      state: "complete"
    }
  };

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
      x: innerWidth / 2,
      y: innerHeight / 2
    },

    cursor: {
      x: innerWidth / 2,
      y: innerHeight / 2
    },

    traj: {
      p: 0,
      tp: 0,
      d: 0,
      td: 0
    },

    interaction: {
      hover: new Set(),
      focus: new Set()
    }
  };

  const q = selector =>
    document.querySelector(selector);

  const qa = selector =>
    [...document.querySelectorAll(selector)];

  const dom = {
    html: document.documentElement,
    body: document.body,

    loader: q(".page-loader"),
    transition: q(".page-transition"),

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

    sections: qa(".home-section"),
    reveals: qa(".reveal"),

    links: qa(".narrative-link"),
    magnetic: qa(".magnetic"),

    transitionLinks:
      qa('a[href]:not([target="_blank"])'),

    standby: q(".standby-screen"),
    wake: q(".standby-wake"),

    cta: q(".cta-trajectory"),
    contact: q(".contact-cta"),

    dirLinks:
      qa(".hero-direction[data-direction]"),

    dirNodes:
      qa(".direction-node[data-direction]"),

    fiveDirections:
      qa(".five-directions [data-trajectory-node]"),

    networkNodes:
      qa(".network-node[data-node]")
  };

  const clamp = (n, min, max) =>
    Math.min(Math.max(n, min), max);

  const lerp = (a, b, t) =>
    a + (b - a) * t;

  const secNum = i =>
    String(i + 1).padStart(2, "0");

  const fine = () =>
    matchMedia("(pointer:fine)").matches;

  const motionOK = () =>
    !st.reduced;

  const section = i =>
    dom.sections[
      clamp(
        i,
        0,
        dom.sections.length - 1
      )
    ] || null;

  function focusables(root) {
    return [
      ...root.querySelectorAll(
        'a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])'
      )
    ].filter(el =>
      !el.hidden &&
      el.offsetParent !== null
    );
  }

  function setInert(el, value) {
    if (!el) return;

    if ("inert" in el) {
      el.inert = value;
    } else if (value) {
      el.setAttribute("inert", "");
    } else {
      el.removeAttribute("inert");
    }
  }

  /* ========================================================
     MOTION
     ======================================================== */

  function motionInit() {
    const mq =
      matchMedia(
        "(prefers-reduced-motion: reduce)"
      );

    const apply = reduced => {
      st.reduced = reduced;

      dom.html.classList.toggle(
        "reduced-motion",
        reduced
      );

      if (reduced) {
        closeStandby();
      }

      resetStandby();
      wakeRaf();
    };

    apply(mq.matches);

    mq.addEventListener?.(
      "change",
      event =>
        apply(event.matches)
    );
  }

  /* ========================================================
     LOADER — FROZEN
     ======================================================== */

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

    if (
      document.readyState ===
      "complete"
    ) {
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

  /* ========================================================
     PAGE TRANSITIONS
     ======================================================== */

  function pageTransitionsInit() {
    if (!dom.transition) return;

    dom.transitionLinks.forEach(link => {
      link.addEventListener(
        "click",
        event => {
          if (
            st.reduced ||
            event.defaultPrevented ||
            event.button !== 0 ||
            event.metaKey ||
            event.ctrlKey ||
            event.shiftKey ||
            event.altKey
          ) {
            return;
          }

          const href =
            link.getAttribute("href");

          if (
            !href ||
            href.startsWith("#") ||
            href.startsWith("mailto:") ||
            href.startsWith("tel:") ||
            link.hasAttribute("download")
          ) {
            return;
          }

          let url;

          try {
            url = new URL(
              href,
              location.href
            );
          } catch {
            return;
          }

          const samePage =
            url.origin === location.origin &&
            url.pathname === location.pathname &&
            url.search === location.search;

          if (
            samePage &&
            url.hash
          ) {
            return;
          }

          if (
            url.origin !==
            location.origin
          ) {
            return;
          }

          event.preventDefault();

          dom.transition.classList.add(
            "is-active"
          );

          setTimeout(() => {
            location.href = url.href;
          }, CFG.transitionMs);
        }
      );
    });

    window.addEventListener(
      "pageshow",
      () =>
        dom.transition.classList.remove(
          "is-active"
        )
    );
  }

  /* ========================================================
     MENU — FROZEN EXPERIENCE
     ======================================================== */

  function menuOpen() {
    if (
      !dom.menu ||
      st.menuOpen
    ) {
      return;
    }

    clearStandby();

    st.menuReturn =
      document.activeElement;

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
        preventScroll:true
      });
    });
  }

  function menuClose(restore = true) {
    if (
      !dom.menu ||
      !st.menuOpen
    ) {
      return;
    }

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
      const target =
        st.menuReturn;

      if (
        target &&
        document.contains(target) &&
        typeof target.focus ===
          "function"
      ) {
        target.focus({
          preventScroll:true
        });
      } else {
        dom.menuBtn?.focus({
          preventScroll:true
        });
      }
    }

    st.menuReturn = null;

    resetStandby();
  }

  function menuInit() {
    dom.menuBtn?.addEventListener(
      "click",
      () =>
        st.menuOpen
          ? menuClose()
          : menuOpen()
    );

    dom.menuLinks.forEach(link => {
      link.addEventListener(
        "click",
        () =>
          menuClose(false)
      );
    });

    dom.menu?.addEventListener(
      "click",
      event => {
        if (
          event.target === dom.menu
        ) {
          menuClose();
        }
      }
    );

    document.addEventListener(
      "keydown",
      event => {
        if (
          event.key === "Escape"
        ) {
          if (st.menuOpen) {
            event.preventDefault();
            menuClose();
            return;
          }

          if (st.standby) {
            event.preventDefault();
            closeStandby();
          }
        }

        if (
          event.key !== "Tab" ||
          !st.menuOpen
        ) {
          return;
        }

        const els =
          focusables(dom.menu);

        if (!els.length) return;

        const first = els[0];
        const last =
          els[els.length - 1];

        if (
          event.shiftKey &&
          document.activeElement ===
            first
        ) {
          event.preventDefault();
          last.focus();
        } else if (
          !event.shiftKey &&
          document.activeElement ===
            last
        ) {
          event.preventDefault();
          first.focus();
        }
      }
    );
  }

  /* ========================================================
     PROGRESS
     ======================================================== */

  function wowUpdate(index) {
    const current =
      section(index);

    if (!current) return;

    st.active = index;

    const total =
      dom.sections.length;

    const progress =
      total > 1
        ? index / (total - 1)
        : 0;

    if (dom.label) {
      dom.label.textContent =
        current.dataset.sectionTitle ||
        "";
    }

    if (dom.fill) {
      dom.fill.style.width =
        `${progress * 100}%`;
    }

    if (dom.point) {
      dom.point.style.left =
        `${progress * 100}%`;
    }

    const first =
      index === 0;

    const last =
      index === total - 1;

    dom.prev?.classList.toggle(
      "is-disabled",
      first
    );

    dom.prev?.setAttribute(
      "aria-hidden",
      String(first)
    );

    if (first) {
      dom.prev?.setAttribute(
        "tabindex",
        "-1"
      );

      if (dom.prevLabel) {
        dom.prevLabel.textContent =
          "";
      }
    } else {
      dom.prev?.removeAttribute(
        "tabindex"
      );

      dom.prev.href =
        `#${secNum(index - 1)}`;

      dom.prev.setAttribute(
        "aria-label",
        `Vai alla sezione ${secNum(index - 1)}`
      );

      if (dom.prevLabel) {
        dom.prevLabel.textContent =
          secNum(index - 1);
      }
    }

    const arrow =
      dom.next?.querySelector(
        ".section-jump-arrow"
      );

    if (last) {
      dom.next.href = "#01";

      dom.next.setAttribute(
        "aria-label",
        "Torna all'inizio"
      );

      dom.nextLabel.textContent =
        "01";

      if (arrow) {
        arrow.textContent = "↑";
      }
    } else {
      dom.next.href =
        `#${secNum(index + 1)}`;

      dom.next.setAttribute(
        "aria-label",
        `Vai alla sezione ${secNum(index + 1)}`
      );

      dom.nextLabel.textContent =
        secNum(index + 1);

      if (arrow) {
        arrow.textContent = "→";
      }
    }

    journeyUpdate(index);
  }

  function goTo(
    index,
    updateHash = true
  ) {
    const target =
      section(index);

    if (!target) return;

    const headerHeight =
      dom.header?.offsetHeight || 0;

    const y =
      window.scrollY +
      target.getBoundingClientRect().top -
      headerHeight -
      CFG.navOffset;

    window.scrollTo({
      top:Math.max(0,y),
      behavior:
        motionOK()
          ? "smooth"
          : "auto"
    });

    if (
      updateHash &&
      history.replaceState
    ) {
      history.replaceState(
        null,
        "",
        `#${target.id}`
      );
    }

    target.setAttribute(
      "tabindex",
      "-1"
    );
  }

  function wowInit() {
    dom.prev?.addEventListener(
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

        goTo(
          st.active ===
            dom.sections.length - 1
            ? 0
            : st.active + 1
        );
      }
    );
  }

  function activeDetect() {
    if (!dom.sections.length) {
      return;
    }

    const reference =
      innerHeight * .52;

    let best = st.active;
    let distance = Infinity;

    dom.sections.forEach(
      (current,index) => {
        const rect =
          current.getBoundingClientRect();

        if (
          rect.bottom <= 0 ||
          rect.top >= innerHeight
        ) {
          return;
        }

        const center =
          rect.top +
          rect.height / 2;

        const currentDistance =
          Math.abs(
            center - reference
          );

        if (
          currentDistance <
          distance
        ) {
          distance =
            currentDistance;

          best = index;
        }
      }
    );

    if (
      best !== st.active
    ) {
      wowUpdate(best);
    }
  }

  /* ========================================================
     JOURNEY SYSTEM
     ======================================================== */

  function directionRepresentations(key) {
    return [
      ...dom.dirLinks.filter(
        element =>
          element.dataset.direction ===
          key
      ),

      ...dom.dirNodes.filter(
        element =>
          element.dataset.direction ===
          key
      ),

      ...dom.links.filter(
        element =>
          element.dataset.trajectoryNode ===
          key
      ),

      ...dom.fiveDirections.filter(
        element =>
          element.dataset.trajectoryNode ===
          key
      ),

      ...dom.networkNodes.filter(
        element =>
          element.dataset.node ===
          key
      )
    ];
  }

  function setStateClass(
    elements,
    className,
    active
  ) {
    elements.forEach(
      element =>
        element.classList.toggle(
          className,
          active
        )
    );
  }

  function applyJourneyState(
    index
  ) {
    const config =
      JOURNEY[index] ||
      JOURNEY[0];

    dom.sections.forEach(
      (element,sectionIndex) => {
        const state =
          JOURNEY[sectionIndex]?.state ||
          "origin";

        element.dataset.journeyState =
          state;
      }
    );

    DIRECTIONS.forEach(key => {
      const elements =
        directionRepresentations(key);

      setStateClass(
        elements,
        "is-visited",
        config.visited.includes(key)
      );

      setStateClass(
        elements,
        "is-current",
        config.current === key
      );

      setStateClass(
        elements,
        "is-converged",
        (
          config.state === "converged" ||
          config.state === "integrated" ||
          config.state === "possibility" ||
          config.state === "reader" ||
          config.state === "complete"
        ) &&
        config.visited.includes(key)
      );
    });

    const current =
      section(index);

    if (
      current &&
      config.current
    ) {
      current.dataset.direction =
        config.current;
    } else if (current) {
      delete current.dataset.direction;
    }
  }

  function journeyUpdate(index) {
    applyJourneyState(index);
  }

  function interactionState(
    key,
    source,
    active
  ) {
    const collection =
      st.interaction[source];

    if (active) {
      collection.add(key);
    } else {
      collection.delete(key);
    }

    const isActive =
      st.interaction.hover.has(key) ||
      st.interaction.focus.has(key);

    setStateClass(
      directionRepresentations(key),
      "is-active",
      isActive
    );
  }

  function narrativeInit() {
    dom.links.forEach(link => {
      const key =
        link.dataset.trajectoryNode;

      if (!key) return;

      link.addEventListener(
        "pointerenter",
        () =>
          interactionState(
            key,
            "hover",
            true
          )
      );

      link.addEventListener(
        "pointerleave",
        () =>
          interactionState(
            key,
            "hover",
            false
          )
      );

      link.addEventListener(
        "focusin",
        () =>
          interactionState(
            key,
            "focus",
            true
          )
      );

      link.addEventListener(
        "focusout",
        () =>
          interactionState(
            key,
            "focus",
            false
          )
      );
    });
  }

  function directionInit() {
    dom.dirLinks.forEach(link => {
      const key =
        link.dataset.direction;

      if (!key) return;

      link.addEventListener(
        "pointerenter",
        () =>
          interactionState(
            key,
            "hover",
            true
          )
      );

      link.addEventListener(
        "pointerleave",
        () =>
          interactionState(
            key,
            "hover",
            false
          )
      );

      link.addEventListener(
        "focusin",
        () =>
          interactionState(
            key,
            "focus",
            true
          )
      );

      link.addEventListener(
        "focusout",
        () =>
          interactionState(
            key,
            "focus",
            false
          )
      );
    });
  }

  /* ========================================================
     REVEAL
     ======================================================== */

  function revealInit() {
    if (
      !dom.reveals.length ||
      st.reduced ||
      !("IntersectionObserver" in window)
    ) {
      dom.reveals.forEach(
        element =>
          element.classList.add(
            "is-visible"
          )
      );

      return;
    }

    const observer =
      new IntersectionObserver(
        entries => {
          entries.forEach(
            entry => {
              if (
                !entry.isIntersecting
              ) {
                return;
              }

              entry.target.classList.add(
                "is-visible"
              );

              observer.unobserve(
                entry.target
              );
            }
          );
        },
        {
          threshold:
            CFG.revealThreshold,
          rootMargin:
            "0px 0px -8% 0px"
        }
      );

    dom.reveals.forEach(
      element =>
        observer.observe(element)
    );
  }

  /* ========================================================
     CURSOR
     ======================================================== */

  function cursorInit() {
    if (
      !dom.cursor ||
      !dom.dot ||
      !dom.ring ||
      !fine() ||
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

        wakeRaf();
      },
      { passive:true }
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

  function cursorFrame() {
    if (
      !dom.cursor ||
      !dom.dot ||
      !dom.ring ||
      !fine() ||
      st.reduced
    ) {
      return false;
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

    const distance =
      Math.hypot(
        st.cursor.x -
          st.pointer.x,
        st.cursor.y -
          st.pointer.y
      );

    return distance > .1;
  }

  /* ========================================================
     MAGNETIC
     ======================================================== */

  function magneticInit() {
    if (
      !fine() ||
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
              (
                rect.left +
                rect.width / 2
              );

            const dy =
              event.clientY -
              (
                rect.top +
                rect.height / 2
              );

            const distance =
              Math.hypot(dx,dy);

            if (
              distance >
              CFG.magneticRadius
            ) {
              return;
            }

            const strength =
              CFG.magneticStrength *
              (
                1 -
                distance /
                  CFG.magneticRadius
              );

            element.style.setProperty(
              "--magnetic-x",
              `${dx * strength}px`
            );

            element.style.setProperty(
              "--magnetic-y",
              `${dy * strength}px`
            );
          },
          { passive:true }
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

  /* ========================================================
     CTA
     ======================================================== */

  function ctaInit() {
    if (
      !dom.cta ||
      !dom.contact
    ) {
      return;
    }

    const on = () =>
      dom.cta.classList.add(
        "is-engaged"
      );

    const off = () =>
      dom.cta.classList.remove(
        "is-engaged"
      );

    dom.contact.addEventListener(
      "pointerenter",
      on
    );

    dom.contact.addEventListener(
      "pointerleave",
      off
    );

    dom.contact.addEventListener(
      "focusin",
      on
    );

    dom.contact.addEventListener(
      "focusout",
      off
    );
  }

  /* ========================================================
     STANDBY — FROZEN
     ======================================================== */

  function clearStandby() {
    if (st.standbyTimer) {
      clearTimeout(
        st.standbyTimer
      );

      st.standbyTimer = 0;
    }
  }

  function openStandby() {
    if (
      st.menuOpen ||
      st.standby ||
      st.reduced ||
      !dom.standby ||
      document.hidden ||
      innerWidth < 700
    ) {
      return;
    }

    st.standby = true;

    st.standbyReturn =
      document.activeElement;

    clearStandby();

    dom.body.classList.add(
      "is-standby"
    );

    dom.standby.classList.add(
      "is-active"
    );

    dom.standby.setAttribute(
      "aria-hidden",
      "false"
    );

    setInert(
      dom.standby,
      false
    );

    dom.wake?.focus({
      preventScroll:true
    });
  }

  function closeStandby() {
    if (
      !st.standby ||
      !dom.standby
    ) {
      return;
    }

    st.standby = false;

    dom.body.classList.remove(
      "is-standby"
    );

    dom.standby.classList.remove(
      "is-active"
    );

    dom.standby.setAttribute(
      "aria-hidden",
      "true"
    );

    setInert(
      dom.standby,
      true
    );

    const target =
      st.standbyReturn;

    st.standbyReturn = null;

    if (
      target &&
      document.contains(target) &&
      typeof target.focus ===
        "function"
    ) {
      requestAnimationFrame(
        () => {
          target.focus({
            preventScroll:true
          });
        }
      );
    }

    resetStandby();
  }

  function resetStandby() {
    clearStandby();

    if (
      st.menuOpen ||
      st.standby ||
      st.reduced ||
      document.hidden ||
      innerWidth < 700
    ) {
      return;
    }

    st.standbyTimer =
      setTimeout(
        openStandby,
        CFG.standbyDelay
      );
  }

  function standbyInit() {
    if (!dom.standby) {
      return;
    }

    setInert(
      dom.standby,
      true
    );

    dom.wake?.addEventListener(
      "click",
      closeStandby
    );

    dom.standby.addEventListener(
      "keydown",
      event => {
        if (
          !st.standby ||
          event.key !== "Tab"
        ) {
          return;
        }

        event.preventDefault();

        dom.wake?.focus({
          preventScroll:true
        });
      }
    );

    [
      "pointerdown",
      "wheel",
      "touchstart",
      "scroll"
    ].forEach(type => {
      window.addEventListener(
        type,
        () =>
          st.standby
            ? closeStandby()
            : resetStandby(),
        { passive:true }
      );
    });

    document.addEventListener(
      "visibilitychange",
      () =>
        document.hidden
          ? clearStandby()
          : resetStandby()
    );
  }

  /* ========================================================
     TRAJECTORY
     ======================================================== */

  function trajectoryTargets() {
    if (
      dom.sections.length < 2
    ) {
      return;
    }

    const first =
      dom.sections[0]
        .getBoundingClientRect();

    const last =
      dom.sections[
        dom.sections.length - 1
      ].getBoundingClientRect();

    const start =
      first.top + scrollY;

    const end =
      last.bottom +
      scrollY -
      innerHeight;

    const range =
      end - start;

    st.traj.tp =
      range <= 0
        ? 0
        : clamp(
            (
              scrollY -
              start
            ) / range,
            0,
            1
          );

    st.traj.td =
      st.reduced
        ? 0
        : Math.sin(
            st.traj.tp *
            Math.PI *
            2
          ) *
          CFG.trajectoryDrift;
  }

  function trajectoryFrame() {
    st.traj.p =
      st.reduced
        ? st.traj.tp
        : lerp(
            st.traj.p,
            st.traj.tp,
            CFG.trajectoryLerp
          );

    st.traj.d =
      st.reduced
        ? 0
        : lerp(
            st.traj.d,
            st.traj.td,
            CFG.trajectoryLerp
          );

    dom.html.style.setProperty(
      "--trajectory-drift",
      `${st.traj.d.toFixed(2)}px`
    );
  }

  function raf() {
    const cursorActive =
      cursorFrame();

    trajectoryFrame();

    const trajectoryActive =
      Math.abs(
        st.traj.d -
        st.traj.td
      ) > .02;

    if (
      cursorActive ||
      trajectoryActive
    ) {
      st.raf =
        requestAnimationFrame(
          raf
        );
    } else {
      st.raf = 0;
    }
  }

  function wakeRaf() {
    if (!st.raf) {
      st.raf =
        requestAnimationFrame(
          raf
        );
    }
  }

  /* ========================================================
     HASH / KEYBOARD
     ======================================================== */

  function hashInit() {
    const raw =
      location.hash.slice(1);

    const index =
      dom.sections.findIndex(
        current =>
          current.id === raw
      );

    if (index < 0) {
      return;
    }

    setTimeout(
      () =>
        goTo(
          index,
          false
        ),
      st.reduced
        ? 0
        : 300
    );
  }

  function keyboardInit() {
    document.addEventListener(
      "keydown",
      event => {
        if (
          st.menuOpen ||
          st.standby ||
          !dom.sections.length
        ) {
          return;
        }

        if (
          event.key !==
            "PageDown" &&
          event.key !==
            "PageUp"
        ) {
          return;
        }

        event.preventDefault();

        goTo(
          clamp(
            st.active +
              (
                event.key ===
                "PageDown"
                  ? 1
                  : -1
              ),
            0,
            dom.sections.length - 1
          )
        );
      }
    );
  }

  /* ========================================================
     SCROLL / RESIZE
     ======================================================== */

  function scrollInit() {
    let ticking = false;

    window.addEventListener(
      "scroll",
      () => {
        resetStandby();
        wakeRaf();

        if (ticking) {
          return;
        }

        ticking = true;

        requestAnimationFrame(
          () => {
            activeDetect();
            trajectoryTargets();
            ticking = false;
          }
        );
      },
      { passive:true }
    );
  }

  function resizeInit() {
    window.addEventListener(
      "resize",
      () => {
        clearTimeout(
          st.resizeTimer
        );

        st.resizeTimer =
          setTimeout(
            () => {
              activeDetect();
              trajectoryTargets();
              wowUpdate(st.active);
              resetStandby();
              wakeRaf();
            },
            CFG.resizeDebounce
          );
      },
      { passive:true }
    );
  }

  function setInitial() {
    if (
      !dom.sections.length
    ) {
      return;
    }

    st.active = 0;

    wowUpdate(0);
    trajectoryTargets();
    resetStandby();
  }

  /* ========================================================
     INIT
     ======================================================== */

  function init() {
    motionInit();
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

    setInitial();
    activeDetect();
    trajectoryTargets();
    wakeRaf();

    document.addEventListener(
      "visibilitychange",
      () => {
        if (document.hidden) {
          if (st.raf) {
            cancelAnimationFrame(
              st.raf
            );

            st.raf = 0;
          }
        } else {
          wakeRaf();
        }
      }
    );

    scrollInit();
    resizeInit();
  }

  if (
    document.readyState ===
    "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      init,
      { once:true }
    );
  } else {
    init();
  }
})();
