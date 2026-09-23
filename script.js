(() => {
  "use strict";

  /*
   * =========================================================
   * CESARE PARATORE — MAIN SCRIPT
   *
   * Nessuna dipendenza esterna.
   * Nessun GSAP necessario.
   * Il sito resta visibile anche se JS non viene eseguito.
   * =========================================================
   */

  const doc = document;
  const body = doc.body;

  const loader = doc.getElementById("site-loader");
  const header = doc.getElementById("site-header");
  const activeSection = doc.getElementById("active-section");

  const menuToggle = doc.getElementById("menu-toggle");
  const menu = doc.getElementById("menu");

  const prevButton = doc.getElementById("prev-section");
  const nextButton = doc.getElementById("next-section");

  const progressFill = doc.getElementById("progress-fill");
  const progressDots = doc.getElementById("progress-dots");
  const progressCurrent = doc.getElementById("progress-current");

  const sections = Array.from(
    doc.querySelectorAll(".story[data-title]")
  );

  let currentIndex = 0;
  let scrollTicking = false;
  let menuOpen = false;

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;


  /* =========================================================
     UTILITY
     ========================================================= */

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function scrollToSection(index) {
    const target = sections[index];

    if (!target) return;

    target.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "start"
    });
  }


  /* =========================================================
     LOADER
     =========================================================
     
     IMPORTANT:
     - Il loader è hidden di default nel CSS.
     - Solo JS lo attiva.
     - Se JS non parte, il sito è comunque visibile.
     */

  function runLoader() {
    if (!loader) return;

    if (prefersReducedMotion) {
      loader.remove();
      return;
    }

    loader.setAttribute("aria-hidden", "false");
    loader.classList.add("is-active");

    /*
     * Sequenza:
     * CP
     * linea
     * nome
     * sipario
     */

    window.setTimeout(() => {
      loader.classList.add("is-exiting");
    }, 2300);

    window.setTimeout(() => {
      loader.setAttribute("aria-hidden", "true");
      loader.remove();
    }, 3450);
  }


  /* =========================================================
     MENU
     ========================================================= */

  function openMenu() {
    if (!menu || !menuToggle) return;

    menuOpen = true;

    menu.classList.add("is-open");
    menu.setAttribute("aria-hidden", "false");

    menuToggle.setAttribute("aria-expanded", "true");

    /*
     * Nel menu aperto il titolo attivo sparisce.
     */
    if (activeSection) {
      activeSection.classList.add("is-changing");

      window.setTimeout(() => {
        if (menuOpen) {
          activeSection.style.visibility = "hidden";
        }
      }, 300);
    }

    body.classList.add("menu-open");
  }


  function closeMenu() {
    if (!menu || !menuToggle) return;

    menuOpen = false;

    menu.classList.remove("is-open");
    menu.setAttribute("aria-hidden", "true");

    menuToggle.setAttribute("aria-expanded", "false");

    if (activeSection) {
      activeSection.style.visibility = "";
      activeSection.classList.remove("is-changing");
    }

    body.classList.remove("menu-open");
  }


  function toggleMenu() {
    if (menuOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  }


  /* =========================================================
     MENU EVENTS
     ========================================================= */

  if (menuToggle) {
    menuToggle.addEventListener("click", toggleMenu);
  }

  if (menu) {
    menu.addEventListener("click", (event) => {
      const link = event.target.closest("a");

      if (!link) return;

      closeMenu();
    });
  }


  /* =========================================================
     KEYBOARD MENU
     ========================================================= */

  doc.addEventListener("keydown", (event) => {

    if (event.key === "Escape" && menuOpen) {
      closeMenu();
      menuToggle?.focus();
    }

  });


  /* =========================================================
     PROGRESS DOTS
     ========================================================= */

  function createProgressDots() {
    if (!progressDots) return;

    progressDots.innerHTML = "";

    sections.forEach((section, index) => {
      const dot = doc.createElement("span");

      dot.className = "progress-dot";

      dot.setAttribute(
        "aria-hidden",
        "true"
      );

      dot.dataset.index = String(index);

      progressDots.appendChild(dot);
    });
  }


  /* =========================================================
     HEADER / WOW BAR
     ========================================================= */

  function updateHeader(index, immediate = false) {
    const section = sections[index];

    if (!section) return;

    const title = section.dataset.title || "";

    if (
      activeSection &&
      activeSection.textContent.trim() !== title
    ) {

      if (!immediate) {
        activeSection.classList.add("is-changing");

        window.setTimeout(() => {

          if (!menuOpen) {
            activeSection.textContent = title;
            activeSection.classList.remove("is-changing");
          }

        }, 180);

      } else {
        activeSection.textContent = title;
      }
    }

    /*
     * Arrow states
     */
    if (prevButton) {
      prevButton.disabled = index <= 0;
    }

    if (nextButton) {
      nextButton.disabled = index >= sections.length - 1;
    }

    /*
     * Progress
     */
    const denominator = Math.max(sections.length - 1, 1);
    const percentage = (index / denominator) * 100;

    if (progressFill) {
      progressFill.style.width = `${percentage}%`;
    }

    if (progressCurrent) {
      progressCurrent.style.left = `${percentage}%`;
    }

    /*
     * Dots
     */
    if (progressDots) {

      const dots = Array.from(
        progressDots.querySelectorAll(".progress-dot")
      );

      dots.forEach((dot, dotIndex) => {
        dot.classList.toggle(
          "is-active",
          dotIndex === index
        );
      });
    }
  }


  /* =========================================================
     INTERSECTION OBSERVER
     ========================================================= */

  function setupSectionObserver() {

    if (!("IntersectionObserver" in window)) {

      sections.forEach((section) => {
        section.classList.add("is-visible");
      });

      updateHeader(0, true);

      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {

        entries.forEach((entry) => {

          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
          }

        });

      },
      {
        threshold: 0.18,
        rootMargin: "-10% 0px -10% 0px"
      }
    );

    sections.forEach((section) => {
      observer.observe(section);
    });
  }


  /* =========================================================
     SCROLL STATE
     ========================================================= */

  function updateScrollState() {

    const viewportCenter = window.innerHeight * 0.42;

    let bestIndex = 0;
    let bestDistance = Infinity;

    sections.forEach((section, index) => {

      const rect = section.getBoundingClientRect();

      const sectionCenter =
        rect.top + (rect.height / 2);

      const distance =
        Math.abs(sectionCenter - viewportCenter);

      if (distance < bestDistance) {
        bestDistance = distance;
        bestIndex = index;
      }

    });

    if (bestIndex !== currentIndex) {
      currentIndex = bestIndex;
      updateHeader(currentIndex);
    }

    /*
     * Opening section:
     * titolo forte all'inizio,
     * contenuto che arriva durante lo scroll.
     */

    const opening = sections[0];

    if (opening) {

      const rect = opening.getBoundingClientRect();

      const progress = clamp(
        -rect.top / Math.max(rect.height * 0.65, 1),
        0,
        1
      );

      opening.style.setProperty(
        "--section-progress",
        progress.toFixed(3)
      );

      if (progress > 0.08) {
        opening.classList.add("is-opening-scrolled");
      } else {
        opening.classList.remove("is-opening-scrolled");
      }
    }

    scrollTicking = false;
  }


  function requestScrollUpdate() {

    if (scrollTicking) return;

    scrollTicking = true;

    window.requestAnimationFrame(updateScrollState);
  }


  window.addEventListener(
    "scroll",
    requestScrollUpdate,
    { passive: true }
  );


  window.addEventListener(
    "resize",
    requestScrollUpdate,
    { passive: true }
  );


  /* =========================================================
     ARROWS
     ========================================================= */

  if (prevButton) {

    prevButton.addEventListener("click", () => {

      if (currentIndex <= 0) return;

      scrollToSection(currentIndex - 1);

    });
  }


  if (nextButton) {

    nextButton.addEventListener("click", () => {

      if (currentIndex >= sections.length - 1) return;

      scrollToSection(currentIndex + 1);

    });
  }


  /* =========================================================
     KEYBOARD CHAPTER NAVIGATION
     ========================================================= */

  doc.addEventListener("keydown", (event) => {

    if (menuOpen) return;

    /*
     * Non interferiamo con input/form.
     */
    const tag = event.target?.tagName?.toLowerCase();

    if (
      tag === "input" ||
      tag === "textarea" ||
      tag === "select"
    ) {
      return;
    }

    if (event.key === "ArrowRight" || event.key === "PageDown") {

      if (currentIndex < sections.length - 1) {
        event.preventDefault();
        scrollToSection(currentIndex + 1);
      }

    }

    if (event.key === "ArrowLeft" || event.key === "PageUp") {

      if (currentIndex > 0) {
        event.preventDefault();
        scrollToSection(currentIndex - 1);
      }

    }

  });


  /* =========================================================
     INITIALIZATION
     ========================================================= */

  function init() {

    createProgressDots();

    setupSectionObserver();

    /*
     * Prima rendiamo immediatamente coerente la UI.
     */
    updateHeader(0, true);

    /*
     * La pagina deve essere visibile anche prima/durante
     * l'esecuzione del loader.
     */
    window.requestAnimationFrame(() => {
      sections[0]?.classList.add("is-visible");
      updateScrollState();
    });

    /*
     * Il loader è l'ultimo elemento ad essere attivato.
     * Se qualcosa dovesse fallire prima di questo punto,
     * il sito resta comunque visibile.
     */
    runLoader();
  }


  /*
   * DOMContentLoaded non è indispensabile perché lo script
   * è alla fine del body, ma lo usiamo per avere una sequenza
   * esplicita e prevedibile.
   */

  if (doc.readyState === "loading") {
    doc.addEventListener("DOMContentLoaded", init, {
      once: true
    });
  } else {
    init();
  }

})();
