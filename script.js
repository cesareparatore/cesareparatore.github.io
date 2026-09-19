(function () {
  "use strict";

  const body = document.body;
  const loader = document.querySelector(".page-loader");

  const menuTrigger = document.querySelector(".menu-trigger");
  const menu = document.querySelector(".site-menu");
  const menuClose = document.querySelector(".chapter-close");
  const menuLinks = document.querySelectorAll(".menu-links a");

  const chapters = Array.from(
    document.querySelectorAll(".chapter")
  );

  const progressFill = document.querySelector("#progress-fill");
  const progressPoint = document.querySelector("#progress-point");
  const progressLabel = document.querySelector("#progress-current");

  const previousSection = document.querySelector("#previous-section");
  const previousSectionLabel = document.querySelector("#previous-section-label");

  const nextSection = document.querySelector("#next-section");
  const nextSectionLabel = document.querySelector("#next-section-label");

  let activeChapter = 0;
  let ticking = false;

  /* --------------------------------
     LOADER
  -------------------------------- */

  window.addEventListener("load", function () {
    window.setTimeout(function () {
      if (loader) {
        loader.classList.add("is-hidden");
      }
    }, 1500);
  });


  /* --------------------------------
     MENU
  -------------------------------- */

  function openMenu() {
    body.classList.add("is-menu-open");

    if (menuTrigger) {
      menuTrigger.setAttribute("aria-expanded", "true");
      menuTrigger.setAttribute("aria-label", "Chiudi menu");
    }

    if (menu) {
      menu.setAttribute("aria-hidden", "false");
    }

    const firstLink = menuLinks[0];

    if (firstLink) {
      window.setTimeout(function () {
        firstLink.focus();
      }, 350);
    }
  }

  function closeMenu() {
    body.classList.remove("is-menu-open");

    if (menuTrigger) {
      menuTrigger.setAttribute("aria-expanded", "false");
      menuTrigger.setAttribute("aria-label", "Apri menu");
      menuTrigger.focus();
    }

    if (menu) {
      menu.setAttribute("aria-hidden", "true");
    }
  }

  if (menuTrigger) {
    menuTrigger.addEventListener("click", function () {
      const isOpen = body.classList.contains("is-menu-open");

      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    });
  }

  if (menuClose) {
    menuClose.addEventListener("click", closeMenu);
  }

  menuLinks.forEach(function (link) {
    link.addEventListener("click", function () {
      closeMenu();
    });
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      if (body.classList.contains("is-menu-open")) {
        closeMenu();
      }
    }
  });


  /* --------------------------------
     CHAPTER NAVIGATION
  -------------------------------- */

  function goToChapter(index) {
    if (!chapters[index]) {
      return;
    }

    chapters[index].scrollIntoView({
      behavior: window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches ? "auto" : "smooth",
      block: "start"
    });
  }

  if (previousSection) {
    previousSection.addEventListener("click", function (event) {
      event.preventDefault();

      if (activeChapter > 0) {
        goToChapter(activeChapter - 1);
      }
    });
  }

  if (nextSection) {
    nextSection.addEventListener("click", function (event) {
      event.preventDefault();

      if (activeChapter < chapters.length - 1) {
        goToChapter(activeChapter + 1);
      }
    });
  }


  /* --------------------------------
     ACTIVE CHAPTER
  -------------------------------- */

  function updateChapterNavigation(index) {
    activeChapter = index;

    const chapterNumber = String(index + 1).padStart(2, "0");

    if (progressLabel) {
      const title =
        chapters[index].dataset.sectionTitle ||
        chapterNumber + " / 11";

      progressLabel.textContent = title;
    }

    if (progressFill) {
      const percentage =
        chapters.length > 1
          ? (index / (chapters.length - 1)) * 100
          : 0;

      progressFill.style.width = percentage + "%";
    }

    if (progressPoint) {
      const percentage =
        chapters.length > 1
          ? (index / (chapters.length - 1)) * 100
          : 0;

      progressPoint.style.left = percentage + "%";
    }

    /* Previous */

    if (index > 0) {
      const previousNumber =
        String(index).padStart(2, "0");

      if (previousSection) {
        previousSection.href =
          "#" + chapters[index - 1].id;

        previousSection.classList.remove("is-disabled");
        previousSection.setAttribute(
          "aria-hidden",
          "false"
        );
        previousSection.removeAttribute("tabindex");
      }

      if (previousSectionLabel) {
        previousSectionLabel.textContent =
          previousNumber;
      }
    } else {
      if (previousSection) {
        previousSection.classList.add("is-disabled");
        previousSection.setAttribute(
          "aria-hidden",
          "true"
        );
        previousSection.setAttribute(
          "tabindex",
          "-1"
        );
      }

      if (previousSectionLabel) {
        previousSectionLabel.textContent = "";
      }
    }

    /* Next */

    if (index < chapters.length - 1) {
      const nextNumber =
        String(index + 2).padStart(2, "0");

      if (nextSection) {
        nextSection.href =
          "#" + chapters[index + 1].id;

        nextSection.classList.remove("is-disabled");
      }

      if (nextSectionLabel) {
        nextSectionLabel.textContent =
          nextNumber;
      }
    } else {
      if (nextSection) {
        nextSection.classList.add("is-disabled");
      }

      if (nextSectionLabel) {
        nextSectionLabel.textContent = "";
      }
    }
  }


  /* --------------------------------
     INTERSECTION OBSERVER
  -------------------------------- */

  if ("IntersectionObserver" in window) {

    const observer = new IntersectionObserver(
      function (entries) {

        entries.forEach(function (entry) {

          if (entry.isIntersecting) {

            const index =
              chapters.indexOf(entry.target);

            if (index !== -1) {
              updateChapterNavigation(index);
            }

          }

        });

      },
      {
        root: null,
        threshold: 0.45
      }
    );

    chapters.forEach(function (chapter) {
      observer.observe(chapter);
    });

  } else {

    updateChapterNavigation(0);

  }


  /* --------------------------------
     CHAPTER PROGRESS
  -------------------------------- */

  function updateScrollProgress() {

    const viewportCenter =
      window.innerHeight * 0.5;

    chapters.forEach(function (chapter) {

      const rect =
        chapter.getBoundingClientRect();

      const height =
        Math.max(rect.height, 1);

      const progress =
        (viewportCenter - rect.top) / height;

      const clamped =
        Math.min(
          1,
          Math.max(0, progress)
        );

      chapter.style.setProperty(
        "--chapter-progress",
        clamped.toFixed(4)
      );

    });

    ticking = false;
  }

  function requestScrollUpdate() {

    if (!ticking) {

      window.requestAnimationFrame(
        updateScrollProgress
      );

      ticking = true;
    }

  }

  window.addEventListener(
    "scroll",
    requestScrollUpdate,
    { passive: true }
  );

  window.addEventListener(
    "resize",
    requestScrollUpdate
  );

  requestScrollUpdate();


  /* --------------------------------
     MAGNETIC ELEMENTS
  -------------------------------- */

  const magneticElements =
    document.querySelectorAll(".magnetic");

  const supportsHover =
    window.matchMedia(
      "(hover: hover) and (pointer: fine)"
    ).matches;

  if (supportsHover) {

    magneticElements.forEach(function (element) {

      element.addEventListener(
        "pointermove",
        function (event) {

          const rect =
            element.getBoundingClientRect();

          const x =
            (event.clientX - rect.left - rect.width / 2) * 0.12;

          const y =
            (event.clientY - rect.top - rect.height / 2) * 0.12;

          element.style.transform =
            "translate(" + x + "px, " + y + "px)";
        }
      );

      element.addEventListener(
        "pointerleave",
        function () {

          element.style.transform =
            "translate(0, 0)";
        }
      );

    });

  }


  /* --------------------------------
     HASH NAVIGATION
  -------------------------------- */

  function handleInitialHash() {

    const hash =
      window.location.hash;

    if (!hash) {
      return;
    }

    const target =
      document.querySelector(hash);

    if (!target) {
      return;
    }

    window.setTimeout(function () {

      target.scrollIntoView({
        behavior: "auto",
        block: "start"
      });

    }, 100);

  }

  handleInitialHash();

})();
