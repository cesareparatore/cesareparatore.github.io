(() => {
  "use strict";

  const CONFIG = {
    standbyDelay: 40000,
    loaderFailsafe: 3500,
    scrollOffset: 12,
    pointerThrottle: 700
  };

  const state = {
    menuOpen: false,
    lastFocused: null,
    sections: [],
    activeIndex: 0,
    ticking: false,
    standbyTimer: null,
    pointerTimer: null,
    reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches
  };

  const dom = {
    body: document.body,
    loader: document.getElementById("loader"),
    standby: document.getElementById("standby"),
    menuToggle: document.getElementById("menu-toggle"),
    menuToggleLabel: document.querySelector(".menu-toggle-label"),
    menu: document.getElementById("site-menu"),
    main: document.getElementById("main-content"),
    footer: document.querySelector(".site-footer"),
    sectionCurrent: document.getElementById("section-current"),
    sections: [...document.querySelectorAll(".story")],
    menuLinks: [...document.querySelectorAll(".menu-nav a")],
    sectionButtons: [...document.querySelectorAll(".section-nav-button")]
  };

  state.sections = dom.sections;

  const focusableSelector = [
    "a[href]",
    "button:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    "[tabindex]:not([tabindex='-1'])"
  ].join(",");

  function getFocusable(container) {
    return [...container.querySelectorAll(focusableSelector)]
      .filter((element) => {
        const style = window.getComputedStyle(element);
        return style.display !== "none" &&
          style.visibility !== "hidden" &&
          !element.hasAttribute("disabled");
      });
  }

  function setMenuState(open) {
    state.menuOpen = open;

    dom.menuToggle.setAttribute("aria-expanded", String(open));
    dom.menuToggle.setAttribute(
      "aria-label",
      open ? "Chiudi menu" : "Apri menu"
    );

    dom.menuToggleLabel.textContent = open ? "CHIUDI" : "MENU";

    dom.menu.classList.toggle("is-open", open);
    dom.menu.setAttribute("aria-hidden", String(!open));
    dom.body.classList.toggle("menu-open", open);

    if (open) {
      dom.menu.removeAttribute("inert");
      state.lastFocused = document.activeElement;

      requestAnimationFrame(() => {
        const first = getFocusable(dom.menu)[0];
        if (first) first.focus();
      });
    } else {
      dom.menu.setAttribute("inert", "");
      dom.menu.setAttribute("aria-hidden", "true");

      if (state.lastFocused && typeof state.lastFocused.focus === "function") {
        state.lastFocused.focus({ preventScroll: true });
      }
    }
  }

  function handleMenuKeydown(event) {
    if (!state.menuOpen) return;

    if (event.key === "Escape") {
      event.preventDefault();
      setMenuState(false);
      return;
    }

    if (event.key !== "Tab") return;

    const focusables = getFocusable(dom.menu);
    if (!focusables.length) return;

    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function initMenu() {
    dom.menu.setAttribute("inert", "");
    dom.menu.setAttribute("aria-hidden", "true");

    dom.menuToggle.addEventListener("click", () => {
      setMenuState(!state.menuOpen);
    });

    dom.menu.addEventListener("keydown", handleMenuKeydown);

    dom.menuLinks.forEach((link) => {
      link.addEventListener("click", () => {
        setMenuState(false);
      });
    });
  }

  function updateHash(section) {
    if (!section || !section.id) return;

    const currentHash = window.location.hash.replace("#", "");

    if (currentHash === section.id) return;

    history.replaceState(
      null,
      "",
      `#${section.id}`
    );
  }

  function scrollToSection(index, behavior = "smooth") {
    const sections = state.sections;
    if (!sections.length) return;

    const nextIndex = Math.max(
      0,
      Math.min(index, sections.length - 1)
    );

    const section = sections[nextIndex];

    section.scrollIntoView({
      behavior: state.reducedMotion ? "auto" : behavior,
      block: "start"
    });

    state.activeIndex = nextIndex;
    updateSectionUI(nextIndex);
  }

  function updateSectionUI(index) {
    const section = state.sections[index];
    if (!section) return;

    state.activeIndex = index;

    if (dom.sectionCurrent) {
      dom.sectionCurrent.textContent =
        String(index + 1).padStart(2, "0");
    }

    dom.sections.forEach((item, itemIndex) => {
      item.toggleAttribute(
        "data-active",
        itemIndex === index
      );
    });

    dom.menuLinks.forEach((link) => {
      const target = link.getAttribute("href");
      const isCurrent = target === `#${section.id}`;

      if (isCurrent) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  function calculateActiveSection() {
    const viewportCenter = window.innerHeight * 0.45;

    let closestIndex = state.activeIndex;
    let closestDistance = Infinity;

    state.sections.forEach((section, index) => {
      const rect = section.getBoundingClientRect();
      const center = rect.top + rect.height * 0.45;
      const distance = Math.abs(center - viewportCenter);

      if (
        rect.bottom > 0 &&
        rect.top < window.innerHeight &&
        distance < closestDistance
      ) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    if (closestIndex !== state.activeIndex) {
      updateSectionUI(closestIndex);
    }
  }

  function handleScroll() {
    if (state.ticking) return;

    state.ticking = true;

    requestAnimationFrame(() => {
      calculateActiveSection();
      state.ticking = false;
    });
  }

  function initSectionNavigation() {
    dom.sectionButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const direction = button.dataset.direction;
        const delta = direction === "prev" ? -1 : 1;

        scrollToSection(state.activeIndex + delta);
      });
    });

    document.addEventListener("keydown", (event) => {
      if (state.menuOpen) return;

      if (event.key === "ArrowDown") {
        event.preventDefault();
        scrollToSection(state.activeIndex + 1);
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        scrollToSection(state.activeIndex - 1);
      }
    });
  }

  function handleHash() {
    const hash = window.location.hash.slice(1);

    if (!hash) {
      updateSectionUI(0);
      return;
    }

    const index = state.sections.findIndex(
      (section) => section.id === hash
    );

    if (index === -1) {
      updateSectionUI(0);
      return;
    }

    state.activeIndex = index;

    requestAnimationFrame(() => {
      state.sections[index].scrollIntoView({
        behavior: "auto",
        block: "start"
      });

      updateSectionUI(index);
    });
  }

  function startStandbyTimer() {
    clearTimeout(state.standbyTimer);

    state.standbyTimer = window.setTimeout(() => {
      dom.standby.classList.add("is-visible");
      dom.standby.setAttribute("aria-hidden", "false");
    }, CONFIG.standbyDelay);
  }

  function wakeFromStandby() {
    if (dom.standby.classList.contains("is-visible")) {
      dom.standby.classList.remove("is-visible");
      dom.standby.setAttribute("aria-hidden", "true");
    }

    startStandbyTimer();
  }

  function initStandby() {
    [
      "pointerdown",
      "pointermove",
      "keydown",
      "wheel",
      "touchstart"
    ].forEach((eventName) => {
      window.addEventListener(eventName, wakeFromStandby, {
        passive: true
      });
    });

    startStandbyTimer();
  }

  function initLoader() {
    const finish = () => {
      if (!dom.loader) return;

      if (
        !window.gsap ||
        state.reducedMotion
      ) {
        dom.loader.style.opacity = "0";
        dom.loader.style.visibility = "hidden";
        dom.loader.style.pointerEvents = "none";
        return;
      }

      gsap.to(dom.loader, {
        autoAlpha: 0,
        duration: 0.8,
        ease: "power2.out",
        onComplete: () => {
          dom.loader.style.pointerEvents = "none";
        }
      });
    };

    window.addEventListener("load", finish, {
      once: true
    });

    window.setTimeout(finish, CONFIG.loaderFailsafe);
  }

  function initGsap() {
    if (
      state.reducedMotion ||
      !window.gsap ||
      !window.ScrollTrigger
    ) {
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    /* Generic story reveal */
    gsap.utils.toArray(".story-copy > *, .section-heading > *, .narrative-copy > *").forEach((element) => {
      gsap.fromTo(
        element,
        {
          y: 28,
          opacity: 0
        },
        {
          y: 0,
          opacity: 1,
          duration: .9,
          ease: "power3.out",
          scrollTrigger: {
            trigger: element,
            start: "top 82%",
            once: true
          }
        }
      );
    });

    /* CRT */
    const crt = document.querySelector(".crt-monitor");

    if (crt) {
      gsap.fromTo(
        crt,
        {
          opacity: 0,
          y: 35,
          rotateY: -13
        },
        {
          opacity: 1,
          y: 0,
          rotateY: -7,
          duration: 1.25,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".story-computer",
            start: "top 70%",
            once: true
          }
        }
      );
    }

    /* Runner */
    gsap.utils.toArray(".runner-bone, .runner-body").forEach((path) => {
      const length = path.getTotalLength
        ? path.getTotalLength()
        : 1000;

      gsap.set(path, {
        strokeDasharray: length,
        strokeDashoffset: length
      });

      gsap.to(path, {
        strokeDashoffset: 0,
        duration: 1.6,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".story-sport",
          start: "top 65%",
          once: true
        }
      });
    });

    /* Science */
    gsap.fromTo(
      ".visual-science .orbit",
      {
        scale: .85,
        opacity: 0
      },
      {
        scale: 1,
        opacity: 1,
        duration: 1.3,
        stagger: .08,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".story-science",
          start: "top 70%",
          once: true
        }
      }
    );

    gsap.fromTo(
      ".visual-science .measure-point",
      {
        scale: 0,
        transformOrigin: "center"
      },
      {
        scale: 1,
        duration: .7,
        stagger: .08,
        ease: "back.out(1.5)",
        scrollTrigger: {
          trigger: ".story-science",
          start: "top 65%",
          once: true
        }
      }
    );

    /* Education network */
    gsap.utils.toArray(".edu-path").forEach((path) => {
      const length = path.getTotalLength
        ? path.getTotalLength()
        : 1000;

      gsap.set(path, {
        strokeDasharray: length,
        strokeDashoffset: length
      });

      gsap.to(path, {
        strokeDashoffset: 0,
        duration: 1.8,
        ease: "power2.inOut",
        scrollTrigger: {
          trigger: ".story-education",
          start: "top 70%",
          once: true
        }
      });
    });

    gsap.fromTo(
      ".edu-node",
      {
        scale: 0,
        transformOrigin: "center"
      },
      {
        scale: 1,
        duration: .55,
        stagger: .1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".story-education",
          start: "top 65%",
          once: true
        }
      }
    );

    /* Management */
    gsap.fromTo(
      ".management-line",
      {
        strokeDasharray: 1000,
        strokeDashoffset: 1000
      },
      {
        strokeDashoffset: 0,
        duration: 1.5,
        stagger: .08,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".story-management",
          start: "top 65%",
          once: true
        }
      }
    );

    gsap.fromTo(
      ".management-core, .management-end",
      {
        scale: 0,
        transformOrigin: "center"
      },
      {
        scale: 1,
        duration: .65,
        stagger: .15,
        ease: "back.out(1.4)",
        scrollTrigger: {
          trigger: ".story-management",
          start: "top 60%",
          once: true
        }
      }
    );

    /* Digital transformation */
    const digitalTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: ".story-digital",
        start: "top bottom",
        end: "center center",
        scrub: 1.2
      }
    });

    digitalTimeline
      .fromTo(
        ".digital-device",
        {
          scale: .88,
          y: 70,
          rotateY: -15
        },
        {
          scale: 1,
          y: 0,
          rotateY: -7,
          ease: "none"
        }
      )
      .fromTo(
        ".digital-grid",
        {
          opacity: .1,
          scale: .8
        },
        {
          opacity: .8,
          scale: 1.15,
          ease: "none"
        },
        "<"
      )
      .fromTo(
        ".digital-emergence",
        {
          opacity: 0,
          x: 80,
          scale: .7
        },
        {
          opacity: 1,
          x: 0,
          scale: 1,
          ease: "none"
        },
        "<.1"
      );

    /* Connected network */
    gsap.fromTo(
      ".network-link",
      {
        strokeDasharray: 1800,
        strokeDashoffset: 1800
      },
      {
        strokeDashoffset: 0,
        duration: 1.8,
        ease: "power2.inOut",
        scrollTrigger: {
          trigger: ".story-connect",
          start: "top 70%",
          once: true
        }
      }
    );

    gsap.fromTo(
      ".network-node",
      {
        scale: 0,
        transformOrigin: "center"
      },
      {
        scale: 1,
        duration: .7,
        stagger: .12,
        ease: "back.out(1.4)",
        scrollTrigger: {
          trigger: ".story-connect",
          start: "top 65%",
          once: true
        }
      }
    );

    /* Today */
    const todayWords = gsap.utils.toArray(".today-method span");

    todayWords.forEach((word, index) => {
      gsap.fromTo(
        word,
        {
          opacity: .12,
          x: 50
        },
        {
          opacity: 1,
          x: 0,
          duration: .8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: word,
            start: "top 82%",
            end: "top 55%",
            scrub: .7
          }
        }
      );

      if (index < todayWords.length - 1) {
        gsap.to(word, {
          opacity: .25,
          scrollTrigger: {
            trigger: todayWords[index + 1],
            start: "top 68%",
            end: "top 48%",
            scrub: .5
          }
        });
      }
    });

    /* Objective line */
    const objectiveProgress = document.querySelector(".objective-progress");
    const objectiveBase = document.querySelector(".objective-base");

    if (objectiveProgress && objectiveBase) {
      const length = objectiveBase.getTotalLength
        ? objectiveBase.getTotalLength()
        : 1000;

      gsap.set(objectiveProgress, {
        strokeDasharray: length,
        strokeDashoffset: length
      });

      gsap.to(objectiveProgress, {
        strokeDashoffset: 0,
        ease: "none",
        scrollTrigger: {
          trigger: ".story-objective",
          start: "top 70%",
          end: "bottom 60%",
          scrub: 1
        }
      });
    }

    /* Presence */
    gsap.fromTo(
      ".presence-main, .presence-branch",
      {
        strokeDasharray: 1200,
        strokeDashoffset: 1200
      },
      {
        strokeDashoffset: 0,
        duration: 1.8,
        stagger: .1,
        ease: "power2.inOut",
        scrollTrigger: {
          trigger: ".story-from-here",
          start: "top 70%",
          once: true
        }
      }
    );

    gsap.fromTo(
      ".presence-node, .presence-end",
      {
        scale: 0,
        transformOrigin: "center"
      },
      {
        scale: 1,
        duration: .6,
        stagger: .12,
        ease: "back.out(1.4)",
        scrollTrigger: {
          trigger: ".story-from-here",
          start: "top 65%",
          once: true
        }
      }
    );

    /* Portrait */
    gsap.fromTo(
      ".person-frame",
      {
        clipPath: "inset(0 0 100% 0)"
      },
      {
        clipPath: "inset(0 0 0% 0)",
        duration: 1.3,
        ease: "power3.inOut",
        scrollTrigger: {
          trigger: ".story-person",
          start: "top 65%",
          once: true
        }
      }
    );

    /* Contact */
    gsap.fromTo(
      ".contact-lead",
      {
        y: 45,
        opacity: 0
      },
      {
        y: 0,
        opacity: 1,
        duration: 1.1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".story-contact",
          start: "top 70%",
          once: true
        }
      }
    );

    ScrollTrigger.refresh();
  }

  function initPointerWake() {
    window.addEventListener(
      "pointermove",
      () => {
        if (state.pointerTimer) return;

        wakeFromStandby();

        state.pointerTimer = window.setTimeout(() => {
          state.pointerTimer = null;
        }, CONFIG.pointerThrottle);
      },
      { passive: true }
    );
  }

  function initVisibility() {
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden && window.ScrollTrigger) {
        window.setTimeout(() => {
          window.ScrollTrigger.refresh();
          calculateActiveSection();
        }, 100);
      }
    });

    window.addEventListener("pageshow", () => {
      if (window.ScrollTrigger) {
        window.ScrollTrigger.refresh();
      }
      calculateActiveSection();
    });
  }

  function initResize() {
    let resizeTimer;

    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);

      resizeTimer = window.setTimeout(() => {
        if (window.ScrollTrigger) {
          window.ScrollTrigger.refresh();
        }

        calculateActiveSection();
      }, 120);
    });
  }

  function init() {
    initMenu();
    initSectionNavigation();
    initStandby();
    initLoader();
    initPointerWake();
    initVisibility();
    initResize();

    window.addEventListener("scroll", handleScroll, {
      passive: true
    });

    window.addEventListener("hashchange", handleHash);

    handleHash();
    calculateActiveSection();

    /*
     * GSAP viene inizializzato dopo che il browser ha avuto
     * la possibilità di costruire il layout completo.
     */
    window.setTimeout(initGsap, 50);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, {
      once: true
    });
  } else {
    init();
  }
})();
