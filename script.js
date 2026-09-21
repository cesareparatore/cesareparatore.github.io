(() => {
  "use strict";

  /* =======================================================
     CONFIG
     ======================================================= */

  const CFG = {
    /* Loader */
    loaderMin: 2850,
    loaderMax: 4200,

    /* Reveal */
    revealThreshold: 0.12,

    /* Cursor */
    cursorLerp: 0.18,

    /* Resize */
    resizeDebounce: 160,

    /* Navigation */
    navOffset: 18,
    transitionMs: 620,

    /* Trajectory */
    trajectoryLerp: 0.09,
    trajectoryDrift: 18,

    /* Magnetic */
    magneticStrength: 0.12,
    magneticRadius: 90,

    /* Standby */
    standbyDelay: 45000
  };


  /* =======================================================
     STATE
     ======================================================= */

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

    cursorMoving: false,

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
    }
  };


  /* =======================================================
     DOM HELPERS
     ======================================================= */

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

    transitionLinks: qa(
      'a[href]:not([target="_blank"])'
    ),

    standby: q(".standby-screen"),
    wake: q(".standby-wake"),

    cta: q(".cta-trajectory"),
    contact: q(".contact-cta"),

    dirLinks: qa(
      ".hero-direction[data-direction]"
    ),

    dirNodes: qa(
      ".direction-node[data-direction]"
    )
  };


  /* =======================================================
     UTILITIES
     ======================================================= */

  const clamp = (n, a, b) =>
    Math.min(Math.max(n, a), b);

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
      clamp(i, 0, dom.sections.length - 1)
    ] || null;


  /* =======================================================
     FOCUS MANAGEMENT
     ======================================================= */

  function focusables(root) {
    if (!root) return [];

    return [
      ...root.querySelectorAll(
        'a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])'
      )
    ].filter(
      el =>
        !el.hidden &&
        el.offsetParent !== null
    );
  }


  function setInert(el, value) {
    if (!el) return;

    if ("inert" in el) {
      el.inert = value;
      return;
    }

    if (value) {
      el.setAttribute("inert", "");
    } else {
      el.removeAttribute("inert");
    }
  }


  /* =======================================================
     REDUCED MOTION
     ======================================================= */

  function motionInit() {
    const mq = matchMedia(
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


  /* =======================================================
     LOADER
     ======================================================= */

  function loaderInit() {
    if (!dom.loader) {
      st.loaded = true;
      return;
    }

    const started =
      performance.now();

    let done = false;

    const finish = () => {
      if (done) return;

      done = true;

      const elapsed =
        performance.now() - started;

      const wait = Math.max(
        0,
        CFG.loaderMin - elapsed
      );

      setTimeout(() => {
        st.loaded = true;

        dom.loader.classList.add(
          "is-hidden"
        );

        /*
         * Lasciamo completare la dissolvenza
         * prima di rimuovere il nodo dal DOM.
         */
        setTimeout(() => {
          dom.loader?.remove();
        }, 850);

      }, wait);
    };


    /*
     * Se la pagina è già completamente caricata,
     * rispettiamo comunque la durata minima.
     */
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


    /*
     * Fallback di sicurezza.
     */
    setTimeout(
      finish,
      CFG.loaderMax
    );
  }


  /* =======================================================
     PAGE TRANSITIONS
     ======================================================= */

  function pageTransitionsInit() {
    if (!dom.transition) return;

    dom.transitionLinks.forEach(
      link => {

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


            const sameDocument =
              url.origin === location.origin &&
              url.pathname === location.pathname &&
              url.search === location.search &&
              !!url.hash;


            if (
              url.origin !== location.origin ||
              sameDocument
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
      }
    );


    window.addEventListener(
      "pageshow",
      () => {
        dom.transition.classList.remove(
          "is-active"
        );
      }
    );
  }


  /* =======================================================
     MENU
     ======================================================= */

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
        preventScroll: true
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
      const el =
        st.menuReturn;

      if (
        el &&
        document.contains(el) &&
        typeof el.focus === "function"
      ) {
        el.focus({
          preventScroll: true
        });
      } else {
        dom.menuBtn?.focus({
          preventScroll: true
        });
      }
    }


    st.menuReturn = null;

    resetStandby();
  }


  function menuInit() {

    dom.menuBtn?.addEventListener(
      "click",
      () => {
        st.menuOpen
          ? menuClose()
          : menuOpen();
      }
    );


    dom.menuLinks.forEach(
      link => {
        link.addEventListener(
          "click",
          () => menuClose(false)
        );
      }
    );


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

        if (event.key === "Escape") {

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


  /* =======================================================
     SECTION PROGRESS
     ======================================================= */

  function wowUpdate(i) {
    const s = section(i);

    if (!s) return;

    st.active = i;

    const total =
      dom.sections.length;

    const p =
      total > 1
        ? i / (total - 1)
        : 0;


    if (dom.label) {
      dom.label.textContent =
        s.dataset.sectionTitle || "";
    }


    if (dom.fill) {
      dom.fill.style.width =
        `${p * 100}%`;
    }


    if (dom.point) {
      dom.point.style.left =
        `${p * 100}%`;
    }


    const first =
      i === 0;

    const last =
      i === total - 1;


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
        dom.prevLabel.textContent = "";
      }

    } else {

      dom.prev?.removeAttribute(
        "tabindex"
      );

      if (dom.prev) {
        dom.prev.href =
          `#${secNum(i - 1)}`;

        dom.prev.setAttribute(
          "aria-label",
          `Vai alla sezione ${secNum(i - 1)}`
        );
      }

      if (dom.prevLabel) {
        dom.prevLabel.textContent =
          secNum(i - 1);
      }
    }


    if (last) {

      if (dom.next) {
        dom.next.href = "#01";

        dom.next.setAttribute(
          "aria-label",
          "Torna all'inizio"
        );


        const arrow =
          dom.next.querySelector(
            ".section-jump-arrow"
          );


        if (dom.nextLabel) {
          dom.nextLabel.textContent =
            "01";
        }


        if (arrow) {
          arrow.textContent = "↑";
        }
      }

    } else {

      if (dom.next) {
        dom.next.href =
          `#${secNum(i + 1)}`;

        dom.next.setAttribute(
          "aria-label",
          `Vai alla sezione ${secNum(i + 1)}`
        );


        const arrow =
          dom.next.querySelector(
            ".section-jump-arrow"
          );


        if (dom.nextLabel) {
          dom.nextLabel.textContent =
            secNum(i + 1);
        }


        if (arrow) {
          arrow.textContent = "→";
        }
      }
    }
  }


  function goTo(
    i,
    updateHash = true
  ) {

    const s =
      section(i);

    if (!s) return;


    const y =
      window.scrollY +
      s.getBoundingClientRect().top -
      (dom.header?.offsetHeight || 0) -
      CFG.navOffset;


    window.scrollTo({
      top: Math.max(0, y),
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
        `#${s.id}`
      );
    }


    if (updateHash) {
      s.setAttribute(
        "tabindex",
        "-1"
      );
    }
  }


  function wowInit() {

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


    const ref =
      innerHeight * 0.52;

    let best =
      st.active;

    let dist =
      Infinity;


    dom.sections.forEach(
      (s, i) => {

        const r =
          s.getBoundingClientRect();


        if (
          r.bottom <= 0 ||
          r.top >= innerHeight
        ) {
          return;
        }


        const d =
          Math.abs(
            r.top +
            r.height / 2 -
            ref
          );


        if (d < dist) {
          dist = d;
          best = i;
        }
      }
    );


    if (
      best !== st.active
    ) {
      wowUpdate(best);
    }
  }


  /* =======================================================
     REVEALS
     ======================================================= */

  function revealInit() {

    if (
      !dom.reveals.length ||
      st.reduced ||
      !("IntersectionObserver" in window)
    ) {
      dom.reveals.forEach(
        el =>
          el.classList.add(
            "is-visible"
          )
      );

      return;
    }


    const io =
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


              io.unobserve(
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
      el =>
        io.observe(el)
    );
  }


  /* =======================================================
     HERO DIRECTIONS
     ======================================================= */

  function directionInit() {

    const set = (
      key,
      on
    ) => {

      dom.dirLinks
        .filter(
          x =>
            x.dataset.direction === key
        )
        .forEach(
          x =>
            x.classList.toggle(
              "is-active",
              on
            )
        );


      dom.dirNodes
        .filter(
          x =>
            x.dataset.direction === key
        )
        .forEach(
          x =>
            x.classList.toggle(
              "is-active",
              on
            )
        );
    };


    dom.dirLinks.forEach(
      link => {

        const key =
          link.dataset.direction;


        link.addEventListener(
          "pointerenter",
          () => set(key, true)
        );


        link.addEventListener(
          "pointerleave",
          () => set(key, false)
        );


        link.addEventListener(
          "focusin",
          () => set(key, true)
        );


        link.addEventListener(
          "focusout",
          () => set(key, false)
        );
      }
    );
  }


  /* =======================================================
     NARRATIVE LINKS
     ======================================================= */

  function narrativeInit() {

    dom.links.forEach(
      link => {

        const key =
          link.dataset.trajectoryNode;

        if (!key) return;


        let escaped;

        try {
          escaped =
            CSS.escape(key);
        } catch {
          return;
        }


        const els =
          qa(
            `[data-node="${escaped}"],
             [data-direction="${escaped}"]`
          );


        const on = () => {
          els.forEach(
            el =>
              el.classList.add(
                "is-linked"
              )
          );
        };


        const off = () => {
          els.forEach(
            el =>
              el.classList.remove(
                "is-linked"
              )
          );
        };


        link.addEventListener(
          "pointerenter",
          on
        );


        link.addEventListener(
          "pointerleave",
          off
        );


        link.addEventListener(
          "focusin",
          on
        );


        link.addEventListener(
          "focusout",
          off
        );
      }
    );
  }


  /* =======================================================
     CUSTOM CURSOR
     ======================================================= */

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

        st.cursorMoving = true;

        wakeRaf();
      },
      { passive: true }
    );


    qa("a,button").forEach(
      el => {

        el.addEventListener(
          "pointerenter",
          () => {
            dom.cursor.classList.add(
              "is-hovering"
            );
          }
        );


        el.addEventListener(
          "pointerleave",
          () => {
            dom.cursor.classList.remove(
              "is-hovering"
            );
          }
        );
      }
    );


    window.addEventListener(
      "pointerleave",
      () => {
        dom.cursor.classList.remove(
          "is-visible",
          "is-hovering"
        );

        st.cursorMoving = false;
      }
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
      st.cursorMoving = false;
      return false;
    }


    if (!st.cursorMoving) {
      return false;
    }


    const dx =
      st.pointer.x -
      st.cursor.x;

    const dy =
      st.pointer.y -
      st.cursor.y;


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
      `translate3d(
        ${st.pointer.x}px,
        ${st.pointer.y}px,
        0
      ) translate(-50%,-50%)`;


    dom.ring.style.transform =
      `translate3d(
        ${st.cursor.x}px,
        ${st.cursor.y}px,
        0
      ) translate(-50%,-50%)`;


    /*
     * Quando il ring ha quasi raggiunto
     * il puntatore, possiamo fermare il RAF.
     */
    const settled =
      Math.abs(dx) < 0.15 &&
      Math.abs(dy) < 0.15;


    if (settled) {
      st.cursor.x =
        st.pointer.x;

      st.cursor.y =
        st.pointer.y;

      st.cursorMoving = false;

      dom.ring.style.transform =
        `translate3d(
          ${st.cursor.x}px,
          ${st.cursor.y}px,
          0
        ) translate(-50%,-50%)`;
    }


    return st.cursorMoving;
  }


  /* =======================================================
     MAGNETIC ELEMENTS
     ======================================================= */

  function magneticInit() {

    if (
      !fine() ||
      st.reduced
    ) {
      return;
    }


    dom.magnetic.forEach(
      el => {

        el.addEventListener(
          "pointermove",
          event => {

            const r =
              el.getBoundingClientRect();


            const dx =
              event.clientX -
              (
                r.left +
                r.width / 2
              );


            const dy =
              event.clientY -
              (
                r.top +
                r.height / 2
              );


            const d =
              Math.hypot(dx, dy);


            if (
              d >
              CFG.magneticRadius
            ) {
              return;
            }


            const k =
              CFG.magneticStrength *
              (
                1 -
                d / CFG.magneticRadius
              );


            el.style.setProperty(
              "--magnetic-x",
              `${dx * k}px`
            );


            el.style.setProperty(
              "--magnetic-y",
              `${dy * k}px`
            );
          },
          { passive: true }
        );


        el.addEventListener(
          "pointerleave",
          () => {

            el.style.setProperty(
              "--magnetic-x",
              "0px"
            );


            el.style.setProperty(
              "--magnetic-y",
              "0px"
            );
          }
        );
      }
    );
  }


  /* =======================================================
     CTA
     ======================================================= */

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


  /* =======================================================
     STANDBY
     ======================================================= */

  function clearStandby() {

    if (!st.standbyTimer) {
      return;
    }


    clearTimeout(
      st.standbyTimer
    );


    st.standbyTimer = 0;
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
      preventScroll: true
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


    const el =
      st.standbyReturn;


    st.standbyReturn = null;


    if (
      el &&
      document.contains(el) &&
      typeof el.focus === "function"
    ) {
      requestAnimationFrame(
        () =>
          el.focus({
            preventScroll: true
          })
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
          preventScroll: true
        });
      }
    );


    [
      "pointerdown",
      "wheel",
      "touchstart",
      "scroll"
    ].forEach(
      type => {

        window.addEventListener(
          type,
          () => {
            if (st.standby) {
              closeStandby();
            } else {
              resetStandby();
            }
          },
          { passive: true }
        );
      }
    );


    document.addEventListener(
      "visibilitychange",
      () => {

        if (document.hidden) {
          clearStandby();
        } else {
          resetStandby();
        }
      }
    );
  }


  /* =======================================================
     TRAJECTORY
     ======================================================= */

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
      first.top +
      scrollY;


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


  /* =======================================================
     RAF
     ======================================================= */

  function raf() {

    const cursorActive =
      cursorFrame();


    trajectoryFrame();


    const trajectoryActive =
      Math.abs(
        st.traj.d -
        st.traj.td
      ) > 0.02;


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


  /* =======================================================
     HASH
     ======================================================= */

  function hashInit() {

    const raw =
      location.hash.slice(1);


    const i =
      dom.sections.findIndex(
        s =>
          s.id === raw
      );


    if (i < 0) {
      return;
    }


    setTimeout(
      () =>
        goTo(
          i,
          false
        ),
      st.reduced
        ? 0
        : 300
    );
  }


  /* =======================================================
     KEYBOARD NAVIGATION
     ======================================================= */

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
          event.key !== "PageDown" &&
          event.key !== "PageUp"
        ) {
          return;
        }


        event.preventDefault();


        goTo(
          clamp(
            st.active +
              (
                event.key === "PageDown"
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


  /* =======================================================
     SCROLL
     ======================================================= */

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
      { passive: true }
    );
  }


  /* =======================================================
     RESIZE
     ======================================================= */

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

              wowUpdate(
                st.active
              );

              resetStandby();

              wakeRaf();

            },
            CFG.resizeDebounce
          );
      },
      { passive: true }
    );
  }


  /* =======================================================
     INITIAL STATE
     ======================================================= */

  function setInitial() {

    if (!dom.sections.length) {
      return;
    }


    st.active = 0;


    wowUpdate(0);


    trajectoryTargets();


    resetStandby();
  }


  /* =======================================================
     INIT
     ======================================================= */

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

        if (
          document.hidden &&
          st.raf
        ) {
          cancelAnimationFrame(
            st.raf
          );

          st.raf = 0;

        } else if (
          !document.hidden
        ) {
          wakeRaf();
        }
      }
    );


    scrollInit();

    resizeInit();
  }


  /* =======================================================
     BOOT
     ======================================================= */

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
