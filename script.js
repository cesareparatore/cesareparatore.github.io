/* =========================================================
   CESARE PARATORE
   SCIENZE MOTORIE E SPORT
   JavaScript — static GitHub Pages
   ========================================================= */

"use strict";


/* =========================================================
   DOM
   ========================================================= */

const header = document.querySelector(".site-header");
const menuToggle = document.querySelector(".menu-toggle");
const navigation = document.querySelector(".primary-navigation");
const navigationLinks = document.querySelectorAll(
  ".primary-navigation a"
);

const revealElements = document.querySelectorAll(".reveal");

const yearElement = document.getElementById("current-year");


/* =========================================================
   YEAR
   ========================================================= */

if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}


/* =========================================================
   HEADER SCROLL STATE
   ========================================================= */

function updateHeader() {
  if (!header) return;

  if (window.scrollY > 20) {
    header.classList.add("scrolled");
  } else {
    header.classList.remove("scrolled");
  }
}

updateHeader();

window.addEventListener(
  "scroll",
  updateHeader,
  { passive: true }
);


/* =========================================================
   MOBILE MENU
   ========================================================= */

function closeMenu() {
  if (!menuToggle || !navigation) return;

  menuToggle.classList.remove("active");
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Apri il menu");

  navigation.classList.remove("open");
}

if (menuToggle && navigation) {

  menuToggle.addEventListener("click", () => {

    const isOpen =
      menuToggle.getAttribute("aria-expanded") === "true";

    menuToggle.classList.toggle("active", !isOpen);

    menuToggle.setAttribute(
      "aria-expanded",
      String(!isOpen)
    );

    menuToggle.setAttribute(
      "aria-label",
      isOpen ? "Apri il menu" : "Chiudi il menu"
    );

    navigation.classList.toggle("open", !isOpen);
  });

  navigationLinks.forEach((link) => {
    link.addEventListener("click", () => {
      closeMenu();
    });
  });

  document.addEventListener("click", (event) => {

    if (!navigation.classList.contains("open")) {
      return;
    }

    const target = event.target;

    if (
      target instanceof Node &&
      !navigation.contains(target) &&
      !menuToggle.contains(target)
    ) {
      closeMenu();
    }
  });

  document.addEventListener("keydown", (event) => {

    if (event.key === "Escape") {
      closeMenu();
    }
  });
}


/* =========================================================
   INTERSECTION OBSERVER
   ========================================================= */

if (
  "IntersectionObserver" in window &&
  revealElements.length
) {

  const observer = new IntersectionObserver(
    (entries, observerInstance) => {

      entries.forEach((entry) => {

        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("visible");

        observerInstance.unobserve(entry.target);
      });

    },
    {
      threshold: 0.12,
      rootMargin: "0px 0px -50px 0px"
    }
  );

  revealElements.forEach((element) => {
    observer.observe(element);
  });

} else {

  revealElements.forEach((element) => {
    element.classList.add("visible");
  });

}


/* =========================================================
   ACTIVE SECTION
   ========================================================= */

const sections = document.querySelectorAll(
  "main section[id]"
);

const navMap = new Map();

navigationLinks.forEach((link) => {

  const href = link.getAttribute("href");

  if (!href || !href.startsWith("#")) {
    return;
  }

  navMap.set(href.substring(1), link);
});


if (
  "IntersectionObserver" in window &&
  sections.length
) {

  const sectionObserver =
    new IntersectionObserver(
      (entries) => {

        entries.forEach((entry) => {

          const link = navMap.get(entry.target.id);

          if (!link) {
            return;
          }

          if (entry.isIntersecting) {

            navigationLinks.forEach((item) => {
              item.removeAttribute("aria-current");
            });

            link.setAttribute(
              "aria-current",
              "page"
            );
          }

        });

      },
      {
        rootMargin: "-35% 0px -55% 0px",
        threshold: 0
      }
    );

  sections.forEach((section) => {
    sectionObserver.observe(section);
  });
}


/* =========================================================
   EXTERNAL LINK SAFETY
   ========================================================= */

document
  .querySelectorAll('a[target="_blank"]')
  .forEach((link) => {

    const rel =
      link.getAttribute("rel") || "";

    if (!rel.includes("noopener")) {
      link.setAttribute(
        "rel",
        `${rel} noopener noreferrer`.trim()
      );
    }
  });


/* =========================================================
   SMOOTH ANCHOR HANDLING
   ========================================================= */

document
  .querySelectorAll('a[href^="#"]')
  .forEach((anchor) => {

    anchor.addEventListener("click", (event) => {

      const href =
        anchor.getAttribute("href");

      if (!href || href === "#") {
        return;
      }

      const target =
        document.querySelector(href);

      if (!target) {
        return;
      }

      event.preventDefault();

      target.scrollIntoView({
        behavior:
          window.matchMedia(
            "(prefers-reduced-motion: reduce)"
          ).matches
            ? "auto"
            : "smooth",
        block: "start"
      });

      history.replaceState(
        null,
        "",
        href
      );
    });
  });


/* =========================================================
   RESIZE SAFETY
   ========================================================= */

let resizeTimer;

window.addEventListener(
  "resize",
  () => {

    clearTimeout(resizeTimer);

    resizeTimer = setTimeout(() => {

      if (
        window.innerWidth > 780 &&
        navigation &&
        navigation.classList.contains("open")
      ) {
        closeMenu();
      }

    }, 150);
  },
  { passive: true }
);
