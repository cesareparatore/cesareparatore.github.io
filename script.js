/* =========================================================
   CESARE PARATORE — HOME
   script.js
   ========================================================= */

(() => {
  'use strict';

  /* =========================================================
     DOM READY
     ========================================================= */

  const onReady = (callback) => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback, { once: true });
    } else {
      callback();
    }
  };

  /* =========================================================
     LOADER
     
     IMPORTANTE:
     Il loader viene gestito anche da un meccanismo autonomo
     nell'HTML. Questa funzione è quindi solo un secondo livello
     di sicurezza.
     ========================================================= */

  const hideLoader = () => {
    const loader = document.getElementById('loader');

    if (!loader) {
      document.documentElement.classList.add('site-ready');
      return;
    }

    document.documentElement.classList.add('site-ready');
    loader.classList.add('is-hidden');

    window.setTimeout(() => {
      if (loader && loader.parentNode) {
        loader.remove();
      }
    }, 900);
  };

  /*
   * Non aspettiamo GSAP.
   * Non aspettiamo immagini.
   * Non aspettiamo font.
   * Non aspettiamo IntersectionObserver.
   */

  onReady(() => {
    hideLoader();

    initMenu();
    initNavigation();
    initSections();
    initLinks();
    initStandby();
    initMotion();
  });

  /*
   * Failsafe assoluto:
   * anche se una funzione successiva dovesse generare un errore,
   * il loader deve comunque essere rimosso.
   */

  window.setTimeout(hideLoader, 2200);


  /* =========================================================
     MENU
     ========================================================= */

  function initMenu() {
    const menuButton = document.querySelector('.menu-toggle');
    const menu = document.querySelector('.site-menu');
    const menuLinks = document.querySelectorAll('.site-menu a');

    if (!menuButton || !menu) return;

    const closeMenu = () => {
      menu.classList.remove('is-open');
      menuButton.classList.remove('is-open');
      menuButton.setAttribute('aria-expanded', 'false');
      document.documentElement.classList.remove('menu-open');
    };

    const openMenu = () => {
      menu.classList.add('is-open');
      menuButton.classList.add('is-open');
      menuButton.setAttribute('aria-expanded', 'true');
      document.documentElement.classList.add('menu-open');
    };

    menuButton.addEventListener('click', () => {
      const isOpen = menu.classList.contains('is-open');

      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    menuLinks.forEach((link) => {
      link.addEventListener('click', closeMenu);
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        closeMenu();
      }
    });

    document.addEventListener('click', (event) => {
      if (!menu.classList.contains('is-open')) return;

      if (
        !menu.contains(event.target) &&
        !menuButton.contains(event.target)
      ) {
        closeMenu();
      }
    });
  }


  /* =========================================================
     NARRATIVE NAVIGATION
     ========================================================= */

  function initNavigation() {
    const navigation = document.querySelector('.narrative-navigation');

    if (!navigation) return;

    const previousButton = navigation.querySelector(
      '[data-narrative-prev]'
    );

    const nextButton = navigation.querySelector(
      '[data-narrative-next]'
    );

    const sections = Array.from(
      document.querySelectorAll('[data-section]')
    );

    if (!sections.length) return;

    let currentIndex = 0;

    const getSectionIndex = () => {
      let closestIndex = 0;
      let closestDistance = Infinity;

      sections.forEach((section, index) => {
        const rect = section.getBoundingClientRect();
        const distance = Math.abs(rect.top);

        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });

      return closestIndex;
    };

    const goToSection = (index) => {
      if (!sections.length) return;

      const normalizedIndex =
        (index + sections.length) % sections.length;

      const section = sections[normalizedIndex];

      if (!section) return;

      currentIndex = normalizedIndex;

      section.scrollIntoView({
        behavior: prefersReducedMotion() ? 'auto' : 'smooth',
        block: 'start'
      });
    };

    if (previousButton) {
      previousButton.addEventListener('click', () => {
        currentIndex = getSectionIndex();

        if (currentIndex <= 0) {
          return;
        }

        goToSection(currentIndex - 1);
      });
    }

    if (nextButton) {
      nextButton.addEventListener('click', () => {
        currentIndex = getSectionIndex();

        if (currentIndex >= sections.length - 1) {
          goToSection(0);
          return;
        }

        goToSection(currentIndex + 1);
      });
    }

    document.addEventListener('keydown', (event) => {
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement
      ) {
        return;
      }

      if (event.key === 'ArrowLeft') {
        currentIndex = getSectionIndex();

        if (currentIndex > 0) {
          goToSection(currentIndex - 1);
        }
      }

      if (event.key === 'ArrowRight') {
        currentIndex = getSectionIndex();

        if (currentIndex >= sections.length - 1) {
          goToSection(0);
        } else {
          goToSection(currentIndex + 1);
        }
      }
    });
  }


  /* =========================================================
     SECTIONS / ACTIVE TITLE
     ========================================================= */

  function initSections() {
    const sections = Array.from(
      document.querySelectorAll('[data-section]')
    );

    const navigation = document.querySelector('.narrative-navigation');

    if (!sections.length || !navigation) return;

    const activeTitle = navigation.querySelector(
      '[data-active-title]'
    );

    const previousButton = navigation.querySelector(
      '[data-narrative-prev]'
    );

    if (!activeTitle) return;

    const updateActiveSection = (section) => {
      if (!section) return;

      const title =
        section.getAttribute('data-title') ||
        section.querySelector('.section-title')?.textContent ||
        '';

      activeTitle.textContent = title.trim();

      const index = sections.indexOf(section);

      if (previousButton) {
        previousButton.disabled = index <= 0;
        previousButton.setAttribute(
          'aria-disabled',
          index <= 0 ? 'true' : 'false'
        );
      }

      sections.forEach((item) => {
        item.classList.toggle('is-active', item === section);
      });
    };

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          const visible = entries
            .filter((entry) => entry.isIntersecting)
            .sort(
              (a, b) =>
                b.intersectionRatio - a.intersectionRatio
            );

          if (visible.length) {
            updateActiveSection(visible[0].target);
          }
        },
        {
          threshold: [0.15, 0.35, 0.6, 0.85],
          rootMargin: '-10% 0px -10% 0px'
        }
      );

      sections.forEach((section) => {
        observer.observe(section);
      });
    } else {
      updateActiveSection(sections[0]);
    }
  }


  /* =========================================================
     INTERNAL LINKS
     ========================================================= */

  function initLinks() {
    const links = document.querySelectorAll(
      'a[href^="#"]'
    );

    links.forEach((link) => {
      link.addEventListener('click', (event) => {
        const href = link.getAttribute('href');

        if (!href || href === '#') return;

        const target = document.querySelector(href);

        if (!target) return;

        event.preventDefault();

        target.scrollIntoView({
          behavior: prefersReducedMotion() ? 'auto' : 'smooth',
          block: 'start'
        });

        history.replaceState(null, '', href);
      });
    });
  }


  /* =========================================================
     MOTION
     
     GSAP è completamente opzionale.
     Se non viene caricato, il sito continua a funzionare.
     ========================================================= */

  function initMotion() {
    if (prefersReducedMotion()) {
      document.documentElement.classList.add(
        'reduced-motion'
      );

      revealWithoutAnimation();
      return;
    }

    /*
     * Aspettiamo un solo frame per permettere al browser
     * di completare il primo rendering.
     */

    requestAnimationFrame(() => {
      if (window.gsap && window.ScrollTrigger) {
        initGSAP();
      } else {
        revealWithoutGSAP();
      }
    });
  }


  /* =========================================================
     FALLBACK MOTION
     ========================================================= */

  function revealWithoutAnimation() {
    const elements = document.querySelectorAll(
      '[data-reveal], [data-title-reveal], [data-body-reveal]'
    );

    elements.forEach((element) => {
      element.classList.add('is-visible');
    });
  }

  function revealWithoutGSAP() {
    const elements = document.querySelectorAll(
      '[data-reveal], [data-title-reveal], [data-body-reveal]'
    );

    elements.forEach((element) => {
      element.classList.add('is-visible');
    });

    if (
      'IntersectionObserver' in window
    ) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;

            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          });
        },
        {
          threshold: 0.12,
          rootMargin: '0px 0px -8% 0px'
        }
      );

      elements.forEach((element) => {
        observer.observe(element);
      });
    }
  }


  /* =========================================================
     GSAP
     ========================================================= */

  function initGSAP() {
    const gsap = window.gsap;
    const ScrollTrigger = window.ScrollTrigger;

    if (!gsap || !ScrollTrigger) {
      revealWithoutGSAP();
      return;
    }

    try {
      gsap.registerPlugin(ScrollTrigger);

      initGSAPTitles(gsap, ScrollTrigger);
      initGSAPBodies(gsap, ScrollTrigger);
      initGSAPImages(gsap, ScrollTrigger);

      ScrollTrigger.refresh();
    } catch (error) {
      /*
       * Un errore nella motion layer NON deve compromettere
       * il contenuto del sito.
       */

      console.error(
        'GSAP motion initialization failed:',
        error
      );

      revealWithoutGSAP();
    }
  }


  /* =========================================================
     GSAP — TITLES
     ========================================================= */

  function initGSAPTitles(gsap, ScrollTrigger) {
    const titles = document.querySelectorAll(
      '[data-title-reveal]'
    );

    titles.forEach((title) => {
      gsap.fromTo(
        title,
        {
          opacity: 0,
          y: 32
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: title,
            start: 'top 82%',
            end: 'top 42%',
            toggleActions:
              'play none none reverse'
          }
        }
      );
    });
  }


  /* =========================================================
     GSAP — BODY
     ========================================================= */

  function initGSAPBodies(gsap, ScrollTrigger) {
    const bodies = document.querySelectorAll(
      '[data-body-reveal]'
    );

    bodies.forEach((body) => {
      gsap.fromTo(
        body,
        {
          opacity: 0,
          y: 24
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          delay: 0.08,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: body,
            start: 'top 84%',
            end: 'top 50%',
            toggleActions:
              'play none none reverse'
          }
        }
      );
    });
  }


  /* =========================================================
     GSAP — IMAGES
     ========================================================= */

  function initGSAPImages(gsap, ScrollTrigger) {
    const images = document.querySelectorAll(
      '[data-image-reveal]'
    );

    images.forEach((image) => {
      gsap.fromTo(
        image,
        {
          opacity: 0,
          y: 24
        },
        {
          opacity: 1,
          y: 0,
          duration: 1.1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: image,
            start: 'top 84%',
            end: 'top 48%',
            toggleActions:
              'play none none reverse'
          }
        }
      );
    });
  }


  /* =========================================================
     STANDBY
     
     40 secondi di inattività.
     Nessun cambio di scroll.
     Nessuna navigazione automatica.
     ========================================================= */

  function initStandby() {
    const standby = document.querySelector(
      '[data-standby]'
    );

    if (!standby) return;

    const standbyDelay = 40000;

    let standbyTimer = null;
    let isStandby = false;

    const enterStandby = () => {
      if (isStandby) return;

      isStandby = true;

      standby.classList.add('is-active');
      document.documentElement.classList.add(
        'standby-active'
      );
    };

    const exitStandby = () => {
      if (!isStandby) return;

      isStandby = false;

      standby.classList.remove('is-active');
      document.documentElement.classList.remove(
        'standby-active'
      );

      resetTimer();
    };

    const resetTimer = () => {
      if (standbyTimer) {
        window.clearTimeout(standbyTimer);
      }

      standbyTimer = window.setTimeout(
        enterStandby,
        standbyDelay
      );
    };

    const activityEvents = [
      'pointerdown',
      'pointermove',
      'wheel',
      'touchstart',
      'keydown',
      'scroll'
    ];

    activityEvents.forEach((eventName) => {
      window.addEventListener(
        eventName,
        () => {
          if (isStandby) {
            exitStandby();
          } else {
            resetTimer();
          }
        },
        {
          passive: true
        }
      );
    });

    standby.addEventListener(
      'click',
      exitStandby
    );

    document.addEventListener(
      'visibilitychange',
      () => {
        if (document.hidden) {
          if (standbyTimer) {
            window.clearTimeout(standbyTimer);
          }
        } else {
          resetTimer();
        }
      }
    );

    resetTimer();
  }


  /* =========================================================
     REDUCED MOTION
     ========================================================= */

  function prefersReducedMotion() {
    return window.matchMedia &&
      window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches;
  }


  /* =========================================================
     RESIZE
     ========================================================= */

  let resizeTimer = null;

  window.addEventListener(
    'resize',
    () => {
      if (resizeTimer) {
        window.clearTimeout(resizeTimer);
      }

      resizeTimer = window.setTimeout(() => {
        if (
          window.ScrollTrigger &&
          !prefersReducedMotion()
        ) {
          try {
            window.ScrollTrigger.refresh();
          } catch (error) {
            console.warn(
              'ScrollTrigger refresh failed:',
              error
            );
          }
        }
      }, 150);
    },
    {
      passive: true
    }
  );


  /* =========================================================
     PAGE VISIBILITY
     ========================================================= */

  document.addEventListener(
    'visibilitychange',
    () => {
      if (
        !document.hidden &&
        window.ScrollTrigger &&
        !prefersReducedMotion()
      ) {
        window.requestAnimationFrame(() => {
          try {
            window.ScrollTrigger.refresh();
          } catch (error) {
            console.warn(
              'ScrollTrigger refresh failed:',
              error
            );
          }
        });
      }
    }
  );


  /* =========================================================
     WINDOW LOAD
     
     Non controlla il loader.
     Serve solamente ad aggiornare ScrollTrigger dopo
     il caricamento delle risorse.
     ========================================================= */

  window.addEventListener(
    'load',
    () => {
      if (
        window.ScrollTrigger &&
        !prefersReducedMotion()
      ) {
        try {
          window.ScrollTrigger.refresh();
        } catch (error) {
          console.warn(
            'Final ScrollTrigger refresh failed:',
            error
          );
        }
      }
    },
    {
      once: true
    }
  );

})();
