(() => {
  "use strict";

  /* =======================================================
     ELEMENTS
     ======================================================= */

  const body = document.body;

  const loader = document.querySelector(".loader");
  const standby = document.querySelector(".standby");

  const menuTrigger = document.querySelector(".menu-trigger");
  const menu = document.querySelector(".site-menu");
  const menuLinks = document.querySelectorAll(".site-menu-nav a");

  const sections = Array.from(
    document.querySelectorAll(".story-section")
  );

  const sectionNav = document.querySelector(".section-nav");
  const sectionNavTitle = document.querySelector(".section-nav-title");
  const previousButton = document.querySelector(".section-nav-prev");
  const nextButton = document.querySelector(".section-nav-next");

  const prefersReducedMotion =
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;


  /* =======================================================
     MENU
     L'HEADER NON VIENE MAI MODIFICATO.
     ======================================================= */

  const setMenu = (open) => {
    if (!menuTrigger || !menu) return;

    menuTrigger.setAttribute(
      "aria-expanded",
      String(open)
    );

    menu.setAttribute(
      "aria-hidden",
      String(!open)
    );

    menu.classList.toggle("is-open", open);
    body.classList.toggle("menu-open", open);
  };

  if (menuTrigger && menu) {

    menuTrigger.addEventListener("click", () => {
      const isOpen =
        menuTrigger.getAttribute("aria-expanded") === "true";

      setMenu(!isOpen);
    });

    menuLinks.forEach((link) => {
      link.addEventListener("click", () => {
        setMenu(false);
      });
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        setMenu(false);
      }
    });
  }


  /* =======================================================
     NARRATIVE NAVIGATION
     ======================================================= */

  let activeIndex = 0;

  const updateNavigation = (index) => {

    if (!sections.length) return;

    activeIndex = index;

    const title =
      sections[index].dataset.sectionTitle || "";

    if (sectionNavTitle) {
      sectionNavTitle.textContent = title;
    }

    if (previousButton) {
      previousButton.disabled = index === 0;
    }

    if (nextButton) {
      nextButton.disabled = false;
    }
  };


  const scrollToSection = (index) => {

    if (!sections.length) return;

    const total = sections.length;

    let targetIndex = index;

    if (targetIndex < 0) {
      targetIndex = 0;
    }

    if (targetIndex >= total) {
      targetIndex = 0;
    }

    const target = sections[targetIndex];

    if (!target) return;

    updateNavigation(targetIndex);

    target.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "start"
    });
  };


  if (previousButton) {
    previousButton.addEventListener("click", () => {
      scrollToSection(activeIndex - 1);
    });
  }

  if (nextButton) {
    nextButton.addEventListener("click", () => {
      const nextIndex =
        activeIndex === sections.length - 1
          ? 0
          : activeIndex + 1;

      scrollToSection(nextIndex);
    });
  }


  /* =======================================================
     ACTIVE SECTION OBSERVER
     ======================================================= */

  if (sections.length) {

    const observer = new IntersectionObserver(
      (entries) => {

        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (a, b) =>
              b.intersectionRatio - a.intersectionRatio
          );

        if (!visible.length) return;

        const current =
          visible[0].target;

        const index =
          sections.indexOf(current);

        if (index !== -1) {
          updateNavigation(index);
        }
      },
      {
        root: null,
        threshold: [0.2, 0.4, 0.6],
        rootMargin:
          `-${getComputedStyle(document.documentElement)
            .getPropertyValue("--header-h")} 0px -25% 0px`
      }
    );

    sections.forEach((section) => {
      observer.observe(section);
    });

    updateNavigation(0);
  }


  /* =======================================================
     MOTION
     ======================================================= */

  const initMotion = () => {

    if (
      prefersReducedMotion ||
      typeof window.gsap === "undefined"
    ) {
      return;
    }

    if (
      typeof window.ScrollTrigger === "undefined"
    ) {
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    sections.forEach((section) => {

      const title =
        section.querySelector(".section-title");

      const bodyContent =
        section.querySelector(".story-body");

      const image =
        section.querySelector(".portrait-frame");

      if (title) {

        gsap.fromTo(
          title,
          {
            opacity: 0,
            y: 44,
            scale: .985
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: .9,
            ease: "power2.out",
            scrollTrigger: {
              trigger: section,
              start: "top 72%",
              end: "top 28%",
              toggleActions:
                "play reverse play reverse"
            }
          }
        );
      }

      if (bodyContent) {

        gsap.fromTo(
          bodyContent,
          {
            opacity: 0,
            y: 28
          },
          {
            opacity: 1,
            y: 0,
            duration: .9,
            delay: .08,
            ease: "power2.out",
            scrollTrigger: {
              trigger: section,
              start: "top 64%",
              end: "top 25%",
              toggleActions:
                "play reverse play reverse"
            }
          }
        );
      }

      if (image) {

        gsap.fromTo(
          image,
          {
            opacity: 0,
            y: 24
          },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: section,
              start: "top 65%",
              end: "top 25%",
              toggleActions:
                "play reverse play reverse"
            }
          }
        );
      }
    });
  };


  /* =======================================================
     LOADER / SIPARIO
     ======================================================= */

  const initLoader = () => {

    if (!loader) return;

    if (prefersReducedMotion) {

      loader.style.opacity = "0";
      loader.style.visibility = "hidden";

      initMotion();
      return;
    }

    const loaderLogo =
      loader.querySelector(".loader-logo");

    const loaderName =
      loader.querySelector(".loader-name");

    const finish = () => {

      if (typeof window.gsap === "undefined") {

        loader.style.opacity = "0";
        loader.style.visibility = "hidden";

        initMotion();
        return;
      }

      const timeline =
        gsap.timeline({
          onComplete: () => {
            loader.style.visibility = "hidden";
            initMotion();
          }
        });

      timeline
        .to(loaderLogo, {
          opacity: 0,
          duration: .45,
          ease: "power2.inOut"
        })
        .to(loaderName, {
          opacity: 0,
          duration: .35,
          ease: "power2.inOut"
        }, "<")
        .to(loader, {
          opacity: 0,
          duration: .65,
          ease: "power2.inOut"
        });
    };

    if (
      typeof window.gsap !== "undefined"
    ) {

      gsap.set(loaderLogo, {
        opacity: 0,
        y: 12
      });

      gsap.set(loaderName, {
        opacity: 0,
        y: 8
      });

      const timeline =
        gsap.timeline();

      timeline
        .to(loaderLogo, {
          opacity: 1,
          y: 0,
          duration: .7,
          ease: "power2.out"
        })
        .to(loaderName, {
          opacity: 1,
          y: 0,
          duration: .5,
          ease: "power2.out"
        }, "-=.25")
        .to({}, {
          duration: .45
        })
        .call(finish);

    } else {

      window.setTimeout(finish, 1400);
    }
  };


  /* =======================================================
     STANDBY
     ======================================================= */

  let standbyTimer = null;
  let standbyActive = false;

  const showStandby = () => {

    if (!standby || standbyActive) return;

    standbyActive = true;

    standby.classList.add("is-active");
    body.classList.add("standby-active");
  };


  const hideStandby = () => {

    if (!standby || !standbyActive) return;

    standbyActive = false;

    standby.classList.remove("is-active");
    body.classList.remove("standby-active");
  };


  const resetStandbyTimer = () => {

    if (standbyTimer) {
      window.clearTimeout(standbyTimer);
    }

    if (standbyActive) {
      hideStandby();
    }

    standbyTimer =
      window.setTimeout(
        showStandby,
        40000
      );
  };


  [
    "mousemove",
    "mousedown",
    "touchstart",
    "wheel",
    "scroll",
    "keydown"
  ].forEach((eventName) => {

    window.addEventListener(
      eventName,
      resetStandbyTimer,
      {
        passive: true
      }
    );
  });


  if (standby) {

    standby.addEventListener(
      "click",
      hideStandby
    );
  }


  /* =======================================================
     RESIZE
     ======================================================= */

  let resizeTimer = null;

  window.addEventListener(
    "resize",
    () => {

      window.clearTimeout(resizeTimer);

      resizeTimer =
        window.setTimeout(() => {

          if (
            typeof window.ScrollTrigger !== "undefined"
          ) {
            ScrollTrigger.refresh();
          }

        }, 150);
    },
    {
      passive: true
    }
  );


  /* =======================================================
     INITIALIZATION
     ======================================================= */

  resetStandbyTimer();
  initLoader();

})();
