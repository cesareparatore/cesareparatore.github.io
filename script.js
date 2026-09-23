(() => {
  "use strict";

  /* =========================================================
     CESARE PARATORE — EXPERIENCE ENGINE V2
     ---------------------------------------------------------
     Principi:
     - la narrazione viene prima dell'effetto
     - navigazione lineare e prevedibile
     - motion differenziato per capitolo
     - accessibilità reale del menu
     - reduced motion rispettato
     - fallback robusti se GSAP non è disponibile
     ========================================================= */

  const body = document.body;

  const loader = document.querySelector("#loader");
  const loaderLogo = document.querySelector(".loader-logo");
  const loaderName = document.querySelector(".loader-name");

  const standby = document.querySelector("#standby");

  const menuTrigger = document.querySelector(".menu-trigger");
  const menu = document.querySelector("#menu");
  const menuLinks = menu
    ? [...menu.querySelectorAll("a[href]")]
    : [];

  const sections = [...document.querySelectorAll(".story-section")];

  const sectionNav = document.querySelector(".section-nav");
  const sectionTitle = document.querySelector(".section-nav-title");
  const previousButton = document.querySelector(".section-nav-prev");
  const nextButton = document.querySelector(".section-nav-next");

  const reducedMotionQuery = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  let prefersReducedMotion = reducedMotionQuery.matches;

  let activeIndex = 0;
  let menuOpen = false;
  let standbyTimer = null;
  let resizeTimer = null;
  let loaderFinished = false;

  let lastFocusedElement = null;

  /* =========================================================
     UTILITIES
     ========================================================= */

  const getHeaderHeight = () => {
    const value = getComputedStyle(document.documentElement)
      .getPropertyValue("--header-h")
      .trim();

    const parsed = parseFloat(value);

    return Number.isFinite(parsed) ? parsed : 76;
  };

  const clamp = (value, min, max) =>
    Math.min(Math.max(value, min), max);

  const isElementVisible = (element) => {
    if (!element) return false;

    const style = window.getComputedStyle(element);

    return (
      style.display !== "none" &&
      style.visibility !== "hidden"
    );
  };

  const getFocusableElements = (container) => {
    if (!container) return [];

    return [
      ...container.querySelectorAll(
        [
          "a[href]",
          "button:not([disabled])",
          "input:not([disabled])",
          "select:not([disabled])",
          "textarea:not([disabled])",
          "[tabindex]:not([tabindex='-1'])"
        ].join(",")
      )
    ].filter(isElementVisible);
  };

  /* =========================================================
     REDUCED MOTION
     ========================================================= */

  const handleReducedMotionChange = (event) => {
    prefersReducedMotion = event.matches;

    if (prefersReducedMotion) {
      document.documentElement.classList.add("reduced-motion");
    } else {
      document.documentElement.classList.remove("reduced-motion");
    }

    if (window.ScrollTrigger) {
      window.ScrollTrigger.refresh();
    }
  };

  if (prefersReducedMotion) {
    document.documentElement.classList.add("reduced-motion");
  }

  if (typeof reducedMotionQuery.addEventListener === "function") {
    reducedMotionQuery.addEventListener(
      "change",
      handleReducedMotionChange
    );
  } else if (typeof reducedMotionQuery.addListener === "function") {
    reducedMotionQuery.addListener(handleReducedMotionChange);
  }

  /* =========================================================
     MENU
     ========================================================= */

  const setMenuState = (open, { restoreFocus = true } = {}) => {
    if (!menu || !menuTrigger) return;

    menuOpen = Boolean(open);

    if (menuOpen) {
      lastFocusedElement = document.activeElement;

      menuTrigger.setAttribute("aria-expanded", "true");
      menu.setAttribute("aria-hidden", "false");
      menu.classList.add("is-open");
      body.classList.add("menu-open");

      /*
       * inert impedisce interazioni con il contenuto dietro
       * il menu nei browser che lo supportano.
       */
      document.querySelector("main")?.setAttribute("inert", "");
      document.querySelector("footer")?.setAttribute("inert", "");

      requestAnimationFrame(() => {
        const focusable = getFocusableElements(menu);

        if (focusable.length) {
          focusable[0].focus();
        }
      });
    } else {
      menuTrigger.setAttribute("aria-expanded", "false");
      menu.setAttribute("aria-hidden", "true");
      menu.classList.remove("is-open");
      body.classList.remove("menu-open");

      document.querySelector("main")?.removeAttribute("inert");
      document.querySelector("footer")?.removeAttribute("inert");

      if (
        restoreFocus &&
        lastFocusedElement &&
        typeof lastFocusedElement.focus === "function"
      ) {
        requestAnimationFrame(() => {
          lastFocusedElement.focus();
        });
      }
    }
  };

  if (menuTrigger && menu) {
    /*
     * Se il markup non contiene già questi attributi,
     * li rendiamo espliciti via JS.
     */
    menuTrigger.setAttribute(
      "aria-expanded",
      menuOpen ? "true" : "false"
    );

    menu.setAttribute(
      "aria-hidden",
      menuOpen ? "false" : "true"
    );

    menuLinks.forEach((link) => {
      link.addEventListener("click", () => {
        setMenuState(false, { restoreFocus: false });
      });
    });

    menuTrigger.addEventListener("click", () => {
      setMenuState(!menuOpen);
    });

    /*
     * Click sullo spazio dell'overlay:
     * utile se il menu ha un contenitore esterno.
     */
    menu.addEventListener("click", (event) => {
      if (event.target === menu) {
        setMenuState(false);
      }
    });
  }

  /* =========================================================
     MENU — KEYBOARD
     ========================================================= */

  document.addEventListener("keydown", (event) => {
    if (!menuOpen || !menu) return;

    if (event.key === "Escape") {
      event.preventDefault();
      setMenuState(false);
      return;
    }

    if (event.key !== "Tab") return;

    const focusable = getFocusableElements(menu);

    if (!focusable.length) {
      event.preventDefault();
      return;
    }

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

  /* =========================================================
     NARRATIVE NAVIGATION
     ========================================================= */

  const updateNavigation = (index) => {
    if (!sections.length) return;

    activeIndex = clamp(
      index,
      0,
      sections.length - 1
    );

    const currentSection = sections[activeIndex];

    if (sectionTitle && currentSection) {
      const title =
        currentSection.dataset.navTitle ||
        currentSection.querySelector("h1, h2")?.textContent?.trim() ||
        "";

      sectionTitle.textContent = title;
    }

    if (previousButton) {
      previousButton.disabled = activeIndex === 0;
      previousButton.setAttribute(
        "aria-disabled",
        activeIndex === 0 ? "true" : "false"
      );
    }

    if (nextButton) {
      const isLast = activeIndex === sections.length - 1;

      nextButton.disabled = isLast;
      nextButton.setAttribute(
        "aria-disabled",
        isLast ? "true" : "false"
      );
    }

    sections.forEach((section, index) => {
      section.toggleAttribute(
        "data-active-section",
        index === activeIndex
      );
    });
  };

  const scrollToSection = (index) => {
    if (!sections.length) return;

    const targetIndex = clamp(
      index,
      0,
      sections.length - 1
    );

    const target = sections[targetIndex];

    if (!target) return;

    updateNavigation(targetIndex);

    /*
     * scrollIntoView() può comportarsi diversamente a seconda
     * della combinazione sticky/header/browser.
     *
     * Calcoliamo quindi una posizione esplicita.
     */
    const headerHeight = getHeaderHeight();

    const targetTop =
      window.scrollY +
      target.getBoundingClientRect().top -
      headerHeight;

    window.scrollTo({
      top: Math.max(0, targetTop),
      behavior: prefersReducedMotion ? "auto" : "smooth"
    });
  };

  if (previousButton) {
    previousButton.addEventListener("click", () => {
      if (activeIndex > 0) {
        scrollToSection(activeIndex - 1);
      }
    });
  }

  if (nextButton) {
    nextButton.addEventListener("click", () => {
      /*
       * Niente wrap-around:
       * arrivati alla fine, la storia è arrivata alla fine.
       */
      if (activeIndex < sections.length - 1) {
        scrollToSection(activeIndex + 1);
      }
    });
  }

  /* =========================================================
     ACTIVE SECTION ENGINE
     ---------------------------------------------------------
     Invece di scegliere semplicemente il ratio maggiore,
     usiamo una "reading line" nella parte alta del viewport.
     Questo rende la navigazione più stabile.
     ========================================================= */

  const getSectionAtReadingLine = () => {
    if (!sections.length) return 0;

    const headerHeight = getHeaderHeight();

    /*
     * La linea di lettura è circa un terzo del viewport.
     * Evita che header e nav sticky dominino il rilevamento.
     */
    const readingLine =
      headerHeight +
      Math.min(window.innerHeight * 0.34, 360);

    let bestIndex = activeIndex;
    let bestDistance = Infinity;

    sections.forEach((section, index) => {
      const rect = section.getBoundingClientRect();

      const top = rect.top;
      const bottom = rect.bottom;

      if (top <= readingLine && bottom >= readingLine) {
        const distance = Math.abs(
          rect.top -
            (readingLine - rect.height * 0.12)
        );

        if (distance < bestDistance) {
          bestDistance = distance;
          bestIndex = index;
        }
      }
    });

    /*
     * Fallback nel caso la linea non cada dentro nessuna
     * sezione durante un frame di transizione.
     */
    if (bestDistance === Infinity) {
      let closest = Infinity;

      sections.forEach((section, index) => {
        const rect = section.getBoundingClientRect();
        const distance = Math.abs(rect.top - readingLine);

        if (distance < closest) {
          closest = distance;
          bestIndex = index;
        }
      });
    }

    return bestIndex;
  };

  let ticking = false;

  const updateActiveSectionFromScroll = () => {
    if (ticking) return;

    ticking = true;

    requestAnimationFrame(() => {
      const nextIndex = getSectionAtReadingLine();

      if (nextIndex !== activeIndex) {
        updateNavigation(nextIndex);
      }

      ticking = false;
    });
  };

  window.addEventListener(
    "scroll",
    updateActiveSectionFromScroll,
    { passive: true }
  );

  /*
   * IntersectionObserver rimane utile come supporto iniziale,
   * soprattutto durante il caricamento.
   */
  if ("IntersectionObserver" in window && sections.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (a, b) =>
              b.intersectionRatio -
              a.intersectionRatio
          );

        if (!visible.length) return;

        const candidate = visible[0].target;
        const index = sections.indexOf(candidate);

        if (index !== -1) {
          updateNavigation(index);
        }
      },
      {
        threshold: [0.15, 0.35, 0.55, 0.75],
        rootMargin: `-${getHeaderHeight()}px 0px -35% 0px`
      }
    );

    sections.forEach((section) => observer.observe(section));
  }

  updateNavigation(0);

  /* =========================================================
     MOTION DESIGN
     ========================================================= */

  const initMotion = () => {
    if (
      prefersReducedMotion ||
      typeof window.gsap === "undefined" ||
      typeof window.ScrollTrigger === "undefined"
    ) {
      return;
    }

    const gsap = window.gsap;
    const ScrollTrigger = window.ScrollTrigger;

    gsap.registerPlugin(ScrollTrigger);

    /*
     * Selezioniamo gli elementi in modo difensivo.
     * Il sistema continua a funzionare anche se una sezione
     * non possiede esattamente la stessa struttura.
     */
    sections.forEach((section, index) => {
      const title =
        section.querySelector(".story-title, h1, h2");

      const bodyContent =
        section.querySelector(".story-body");

      const eyebrow =
        section.querySelector(".story-eyebrow");

      const frame =
        section.querySelector(
          ".portrait-frame, .person-image, .place-image"
        );

      const indexLabel =
        section.querySelector(".story-index");

      /*
       * Movimento base del titolo.
       * Non è identico per tutte le sezioni: alcune hanno
       * un piccolo trattamento laterale/verticale.
       */
      if (title) {
        const titleVariants = [
          {
            y: 54,
            x: 0,
            scale: 0.965,
            duration: 1.05
          },
          {
            y: 38,
            x: -12,
            scale: 0.98,
            duration: 0.9
          },
          {
            y: 64,
            x: 0,
            scale: 0.95,
            duration: 1.1
          },
          {
            y: 32,
            x: 10,
            scale: 0.985,
            duration: 0.85
          }
        ];

        const variant =
          titleVariants[index % titleVariants.length];

        gsap.fromTo(
          title,
          {
            autoAlpha: 0,
            y: variant.y,
            x: variant.x,
            scale: variant.scale
          },
          {
            autoAlpha: 1,
            y: 0,
            x: 0,
            scale: 1,
            duration: variant.duration,
            ease: "power3.out",
            scrollTrigger: {
              trigger: section,
              start: "top 78%",
              end: "top 32%",
              toggleActions:
                "play none none reverse"
            }
          }
        );
      }

      /*
       * Eyebrow / numero se presente.
       */
      if (eyebrow) {
        gsap.fromTo(
          eyebrow,
          {
            autoAlpha: 0,
            y: 16
          },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.7,
            delay: 0.05,
            ease: "power2.out",
            scrollTrigger: {
              trigger: section,
              start: "top 82%",
              end: "top 38%",
              toggleActions:
                "play none none reverse"
            }
          }
        );
      }

      if (indexLabel) {
        gsap.fromTo(
          indexLabel,
          {
            autoAlpha: 0
          },
          {
            autoAlpha: 1,
            duration: 0.6,
            delay: 0.12,
            ease: "power1.out",
            scrollTrigger: {
              trigger: section,
              start: "top 86%",
              end: "top 42%",
              toggleActions:
                "play none none reverse"
            }
          }
        );
      }

      /*
       * Corpo narrativo.
       * Il movimento è volutamente minimo:
       * il testo deve essere letto, non "animato".
       */
      if (bodyContent) {
        gsap.fromTo(
          bodyContent,
          {
            autoAlpha: 0,
            y: 26
          },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.95,
            delay: 0.1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: section,
              start: "top 67%",
              end: "top 28%",
              toggleActions:
                "play none none reverse"
            }
          }
        );
      }

      /*
       * Immagini / portrait.
       */
      if (frame) {
        gsap.fromTo(
          frame,
          {
            autoAlpha: 0,
            y: 34,
            scale: 0.985
          },
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: 1.15,
            ease: "power3.out",
            scrollTrigger: {
              trigger: section,
              start: "top 72%",
              end: "top 25%",
              toggleActions:
                "play none none reverse"
            }
          }
        );
      }

      /* =====================================================
         MOMENTI NARRATIVI SPECIALI
         ===================================================== */

      /*
       * 01 — GUARDA.
       * Apertura più lenta e minimale.
       */
      if (index === 0 && title) {
        gsap.fromTo(
          title,
          {
            autoAlpha: 0,
            y: 70,
            scale: 0.93,
            letterSpacing: "0.02em"
          },
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            letterSpacing: "normal",
            duration: 1.35,
            ease: "power4.out",
            scrollTrigger: {
              trigger: section,
              start: "top 90%",
              end: "top 38%",
              toggleActions:
                "play none none reverse"
            }
          }
        );
      }

      /*
       * 07 — RITORNA.
       * Il cambio verso il digitale può avere un ingresso
       * più netto.
       */
      if (index === 6 && title) {
        gsap.fromTo(
          title,
          {
            autoAlpha: 0,
            x: -45,
            y: 0
          },
          {
            autoAlpha: 1,
            x: 0,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: {
              trigger: section,
              start: "top 72%",
              end: "top 35%",
              toggleActions:
                "play none none reverse"
            }
          }
        );
      }

      /*
       * 08 — COLLEGARE.
       * Movimento più sottile e centripeto.
       */
      if (index === 7 && bodyContent) {
        gsap.fromTo(
          bodyContent,
          {
            autoAlpha: 0,
            y: 14,
            scale: 0.99
          },
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: 1.15,
            ease: "power2.out",
            scrollTrigger: {
              trigger: section,
              start: "top 65%",
              end: "top 28%",
              toggleActions:
                "play none none reverse"
            }
          }
        );
      }

      /*
       * 09 — OGGI.
       * È uno dei punti concettuali più importanti.
       * Il contenuto deve avere maggiore presenza.
       */
      if (index === 8) {
        const children = [
          title,
          bodyContent
        ].filter(Boolean);

        if (children.length) {
          gsap.fromTo(
            children,
            {
              autoAlpha: 0,
              y: 28
            },
            {
              autoAlpha: 1,
              y: 0,
              duration: 1.05,
              stagger: 0.12,
              ease: "power3.out",
              scrollTrigger: {
                trigger: section,
                start: "top 72%",
                end: "top 30%",
                toggleActions:
                  "play none none reverse"
              }
            }
          );
        }
      }

      /*
       * 11 — QUI.
       * Il territorio deve sembrare una pausa concreta,
       * non una semplice sezione informativa.
       */
      if (index === 10 && frame) {
        gsap.fromTo(
          frame,
          {
            autoAlpha: 0,
            scale: 1.025
          },
          {
            autoAlpha: 1,
            scale: 1,
            duration: 1.4,
            ease: "power2.out",
            scrollTrigger: {
              trigger: section,
              start: "top 74%",
              end: "top 25%",
              toggleActions:
                "play none none reverse"
            }
          }
        );
      }

      /*
       * 13 — ECCOMI.
       * Il ritratto è il momento umano: niente effetto
       * aggressivo, solo comparsa lenta.
       */
      if (index === 12 && frame) {
        gsap.fromTo(
          frame,
          {
            autoAlpha: 0,
            y: 18,
            scale: 0.97
          },
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: 1.5,
            ease: "power2.out",
            scrollTrigger: {
              trigger: section,
              start: "top 78%",
              end: "top 30%",
              toggleActions:
                "play none none reverse"
            }
          }
        );
      }

      /*
       * 14 — SCRIVIMI.
       * Chiusura pulita. Nessun movimento superfluo.
       */
      if (index === sections.length - 1) {
        const finalElements = [
          title,
          bodyContent
        ].filter(Boolean);

        if (finalElements.length) {
          gsap.fromTo(
            finalElements,
            {
              autoAlpha: 0,
              y: 20
            },
            {
              autoAlpha: 1,
              y: 0,
              duration: 1,
              stagger: 0.1,
              ease: "power3.out",
              scrollTrigger: {
                trigger: section,
                start: "top 76%",
                end: "top 35%",
                toggleActions:
                  "play none none reverse"
              }
            }
          );
        }
      }
    });

    /*
     * Piccolo respiro sullo scroll della nav narrativa.
     * Non viene trasformata in un elemento "appiccicoso"
     * iper-animato: deve restare discreta.
     */
    if (sectionNav) {
      gsap.fromTo(
        sectionNav,
        {
          autoAlpha: 0
        },
        {
          autoAlpha: 1,
          duration: 0.7,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sections[0],
            start: "top 60%",
            end: "top 30%",
            toggleActions:
              "play none none reverse"
          }
        }
      );
    }

    ScrollTrigger.refresh();
  };

  /* =========================================================
     LOADER
     ========================================================= */

  const finishLoader = () => {
    if (loaderFinished || !loader) return;

    loaderFinished = true;

    if (
      prefersReducedMotion ||
      typeof window.gsap === "undefined"
    ) {
      loader.classList.add("is-done");

      setTimeout(() => {
        loader.setAttribute("aria-hidden", "true");
        loader.style.visibility = "hidden";
        initMotion();
      }, prefersReducedMotion ? 0 : 100);

      return;
    }

    const gsap = window.gsap;

    const timeline = gsap.timeline({
      defaults: {
        ease: "power2.out"
      },
      onComplete: () => {
        loader.classList.add("is-done");
        loader.setAttribute("aria-hidden", "true");
        loader.style.visibility = "hidden";

        initMotion();
      }
    });

    timeline
      .to(
        [loaderLogo, loaderName].filter(Boolean),
        {
          autoAlpha: 0,
          y: -12,
          duration: 0.42,
          stagger: 0.035
        }
      )
      .to(
        loader,
        {
          autoAlpha: 0,
          duration: 0.58,
          ease: "power2.inOut"
        },
        "-=0.12"
      );
  };

  const initLoader = () => {
    if (!loader) {
      initMotion();
      return;
    }

    loader.setAttribute("aria-hidden", "false");

    if (
      prefersReducedMotion ||
      typeof window.gsap === "undefined"
    ) {
      loaderFinished = false;

      /*
       * Non blocchiamo l'esperienza se GSAP non è disponibile.
       */
      setTimeout(finishLoader, 80);

      return;
    }

    const gsap = window.gsap;

    gsap.set(
      [loaderLogo, loaderName].filter(Boolean),
      {
        autoAlpha: 0,
        y: 20
      }
    );

    const timeline = gsap.timeline();

    timeline
      .to(
        loaderLogo,
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.7,
          ease: "power3.out"
        }
      )
      .to(
        loaderName,
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.55,
          ease: "power3.out"
        },
        "-=0.35"
      )
      .to({}, { duration: 0.35 })
      .call(finishLoader);
  };

  /* =========================================================
     STANDBY / INATTIVITÀ
     ========================================================= */

  const STANDBY_DELAY = 40000;

  const hideStandby = () => {
    if (!standby) return;

    standby.classList.remove("is-active");
    body.classList.remove("standby-active");
  };

  const showStandby = () => {
    if (!standby || menuOpen) return;

    standby.classList.add("is-active");
    body.classList.add("standby-active");
  };

  const resetStandbyTimer = () => {
    if (!standby) return;

    window.clearTimeout(standbyTimer);

    hideStandby();

    /*
     * Non iniziamo a considerare inattivo l'utente mentre
     * il loader è ancora presente.
     */
    if (loader && !loaderFinished) {
      return;
    }

    standbyTimer = window.setTimeout(
      showStandby,
      STANDBY_DELAY
    );
  };

  if (standby) {
    standby.addEventListener("click", () => {
      hideStandby();
      resetStandbyTimer();
    });

    [
      "pointerdown",
      "pointermove",
      "wheel",
      "touchstart",
      "keydown"
    ].forEach((eventName) => {
      window.addEventListener(
        eventName,
        resetStandbyTimer,
        {
          passive:
            eventName !== "keydown"
        }
      );
    });
  }

  /* =========================================================
     VISIBILITY / TAB
     ========================================================= */

  document.addEventListener(
    "visibilitychange",
    () => {
      if (document.hidden) {
        window.clearTimeout(standbyTimer);
      } else {
        resetStandbyTimer();
      }
    }
  );

  /* =========================================================
     RESIZE
     ========================================================= */

  window.addEventListener(
    "resize",
    () => {
      window.clearTimeout(resizeTimer);

      resizeTimer = window.setTimeout(() => {
        if (window.ScrollTrigger) {
          window.ScrollTrigger.refresh();
        }

        updateActiveSectionFromScroll();
      }, 180);
    },
    { passive: true }
  );

  /* =========================================================
     ORIENTATION CHANGE
     ========================================================= */

  window.addEventListener(
    "orientationchange",
    () => {
      window.setTimeout(() => {
        if (window.ScrollTrigger) {
          window.ScrollTrigger.refresh();
        }

        updateActiveSectionFromScroll();
      }, 250);
    },
    { passive: true }
  );

  /* =========================================================
     PAGE LOAD / INITIALIZATION
     ========================================================= */

  const start = () => {
    /*
     * Nascondiamo il menu fino a quando l'esperienza non
     * è esplicitamente aperta.
     */
    if (menu) {
      menu.setAttribute(
        "aria-hidden",
        menuOpen ? "false" : "true"
      );
    }

    updateNavigation(0);

    initLoader();

    /*
     * Il timer standby partirà dopo il loader.
     */
    window.setTimeout(() => {
      if (loaderFinished) {
        resetStandbyTimer();
      }
    }, 100);
  };

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      start,
      { once: true }
    );
  } else {
    start();
  }

})();
