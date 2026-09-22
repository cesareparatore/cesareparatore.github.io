(() => {
  "use strict";

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const body = document.body;

  const loader = document.getElementById("loader");

  const menu = document.getElementById("siteMenu");
  const menuTrigger = document.getElementById("menuTrigger");
  const menuTriggerLabel =
    document.getElementById("menuTriggerLabel");

  const navPrev = document.getElementById("navPrev");
  const navNext = document.getElementById("navNext");
  const navTitle = document.getElementById("navTitle");

  const standby = document.getElementById("standby");

  const sections = Array.from(
    document.querySelectorAll(
      "main > section[data-title]"
    )
  );

  let activeIndex = 0;
  let standbyTimer = null;
  let menuOpen = false;

  /* =======================================================
     MENU

     L'header non viene modificato.
     Il menu occupa esclusivamente l'area sottostante.
     ======================================================= */

  function setMenu(open) {

    menuOpen = open;

    menu.classList.toggle(
      "is-open",
      open
    );

    menu.setAttribute(
      "aria-hidden",
      String(!open)
    );

    menuTrigger.setAttribute(
      "aria-expanded",
      String(open)
    );

    menuTriggerLabel.textContent =
      open ? "CHIUDI" : "MENU";

    body.classList.toggle(
      "menu-open",
      open
    );

    if (open) {

      menu.style.opacity = "1";
      menu.style.visibility = "visible";

    } else {

      menu.style.opacity = "0";
      menu.style.visibility = "hidden";

    }
  }

  menuTrigger.addEventListener(
    "click",
    () => {
      setMenu(!menuOpen);
    }
  );

  menu.addEventListener(
    "click",
    (event) => {

      const link =
        event.target.closest("a");

      if (link) {
        setMenu(false);
      }
    }
  );

  document.addEventListener(
    "keydown",
    (event) => {

      if (
        event.key === "Escape" &&
        menuOpen
      ) {
        setMenu(false);
        menuTrigger.focus();
      }
    }
  );

  /* =======================================================
     NAVIGAZIONE NARRATIVA
     ======================================================= */

  function updateNavigation(index) {

    if (!sections.length) {
      return;
    }

    activeIndex = index;

    navTitle.textContent =
      sections[index].dataset.title || "";

    navPrev.disabled =
      index === 0;

    navPrev.setAttribute(
      "aria-disabled",
      String(index === 0)
    );

    const isLast =
      index === sections.length - 1;

    navNext.setAttribute(
      "aria-label",
      isLast
        ? "Torna a GUARDA"
        : "Sezione successiva"
    );
  }

  function goToSection(index) {

    const count = sections.length;

    if (!count) {
      return;
    }

    const targetIndex =
      ((index % count) + count) % count;

    sections[targetIndex].scrollIntoView({
      behavior:
        reduceMotion
          ? "auto"
          : "smooth",
      block: "start"
    });

    updateNavigation(
      targetIndex
    );
  }

  navPrev.addEventListener(
    "click",
    () => {

      if (activeIndex > 0) {
        goToSection(
          activeIndex - 1
        );
      }
    }
  );

  navNext.addEventListener(
    "click",
    () => {

      if (
        activeIndex ===
        sections.length - 1
      ) {
        goToSection(0);
      } else {
        goToSection(
          activeIndex + 1
        );
      }
    }
  );

  /* =======================================================
     SECTION OBSERVER
     ======================================================= */

  function initNavigationObserver() {

    if (!sections.length) {
      return;
    }

    const observer =
      new IntersectionObserver(
        (entries) => {

          const visibleEntries =
            entries
              .filter(
                (entry) =>
                  entry.isIntersecting
              )
              .sort(
                (a, b) =>
                  b.intersectionRatio -
                  a.intersectionRatio
              );

          if (
            !visibleEntries.length
          ) {
            return;
          }

          const index =
            sections.indexOf(
              visibleEntries[0].target
            );

          if (index !== -1) {
            updateNavigation(index);
          }
        },
        {
          root: null,

          rootMargin:
            "-30% 0px -45% 0px",

          threshold: [
            0.05,
            0.2,
            0.5,
            0.8
          ]
        }
      );

    sections.forEach(
      (section) => {
        observer.observe(section);
      }
    );
  }

  /* =======================================================
     MOTION
     ======================================================= */

  function initMotion() {

    if (reduceMotion) {
      return;
    }

    if (
      !window.gsap ||
      !window.ScrollTrigger
    ) {
      return;
    }

    gsap.registerPlugin(
      ScrollTrigger
    );

    document
      .querySelectorAll(
        ".narrative-section, .context-section, .portrait-section"
      )
      .forEach(
        (section) => {

          const title =
            section.querySelector(
              ".section-title"
            );

          const content =
            section.querySelector(
              ".narrative-body"
            );

          const image =
            section.querySelector(
              ".portrait-frame"
            );

          if (title) {

            gsap.fromTo(
              title,
              {
                y: 34,
                opacity: 0
              },
              {
                y: 0,
                opacity: 1,
                duration: 1,
                ease: "power2.out",

                scrollTrigger: {
                  trigger: section,
                  start: "top 76%",
                  once: true
                }
              }
            );
          }

          if (content) {

            gsap.fromTo(
              content,
              {
                y: 24,
                opacity: 0
              },
              {
                y: 0,
                opacity: 1,
                duration: 1,
                delay: 0.12,
                ease: "power2.out",

                scrollTrigger: {
                  trigger: section,
                  start: "top 70%",
                  once: true
                }
              }
            );
          }

          if (image) {

            gsap.fromTo(
              image,
              {
                y: 18,
                opacity: 0
              },
              {
                y: 0,
                opacity: 1,
                duration: 1,
                delay: 0.16,
                ease: "power2.out",

                scrollTrigger: {
                  trigger: section,
                  start: "top 70%",
                  once: true
                }
              }
            );
          }
        }
      );
  }

  /* =======================================================
     STANDBY
     ======================================================= */

  function resetStandbyTimer() {

    window.clearTimeout(
      standbyTimer
    );

    if (menuOpen) {
      return;
    }

    standbyTimer =
      window.setTimeout(
        () => {

          standby.classList.add(
            "is-active"
          );

          standby.setAttribute(
            "aria-hidden",
            "false"
          );

          body.classList.add(
            "standby-active"
          );

        },
        40000
      );
  }

  function exitStandby() {

    if (
      !standby.classList.contains(
        "is-active"
      )
    ) {
      return;
    }

    standby.classList.remove(
      "is-active"
    );

    standby.setAttribute(
      "aria-hidden",
      "true"
    );

    body.classList.remove(
      "standby-active"
    );

    const current =
      sections[activeIndex];

    if (current) {

      current.scrollIntoView({
        behavior:
          reduceMotion
            ? "auto"
            : "smooth",

        block: "start"
      });
    }
  }

  [
    "pointermove",
    "pointerdown",
    "wheel",
    "touchstart",
    "keydown"
  ].forEach(
    (eventName) => {

      window.addEventListener(
        eventName,
        () => {

          if (
            standby.classList.contains(
              "is-active"
            )
          ) {
            exitStandby();
          }

          resetStandbyTimer();
        },
        {
          passive:
            eventName !== "keydown"
        }
      );
    }
  );

  /* =======================================================
     LOADER / SIPARIO
     ======================================================= */

  function initLoader() {

    if (!loader) {
      return;
    }

    const finish =
      () => {

        loader.classList.add(
          "is-hidden"
        );

        loader.setAttribute(
          "aria-hidden",
          "true"
        );

        resetStandbyTimer();
      };

    if (reduceMotion) {
      finish();
      return;
    }

    window.setTimeout(
      finish,
      1400
    );
  }

  /* =======================================================
     INIT
     ======================================================= */

  updateNavigation(0);

  initNavigationObserver();

  initMotion();

  initLoader();

})();
