/* =========================================================
   GUARDARE. CAPIRE. FARE.
   Minimal progressive enhancement
   ========================================================= */

(() => {
  "use strict";

  /* ---------------------------------------------------------
     CONFIGURAZIONE
     Sostituire esclusivamente questi valori.
     --------------------------------------------------------- */

  const CONFIG = {
    /*
     Google Maps Embed API.

     Inserire la propria chiave reale.
     Non pubblicare una chiave non protetta.

     Il luogo non è stato specificato nella specifica,
     quindi NON viene inventato.
    */
    googleMapsApiKey: "YOUR_GOOGLE_MAPS_API_KEY",

    /*
     Inserire qui il luogo reale del progetto.
     Esempio puramente strutturale:
     "Nome del luogo, Città, Paese"
    */
    googleMapsPlace: "YOUR_PROJECT_PLACE",

    /*
     Inserire l'indirizzo email reale.
     */
    contactEmail: "YOUR_EMAIL@example.com"
  };


  /* ---------------------------------------------------------
     DOM
     --------------------------------------------------------- */

  const header = document.querySelector(".site-header");
  const menuToggle = document.querySelector(".menu-toggle");
  const navigation = document.querySelector(".site-navigation");
  const contactLink = document.querySelector("#contact-link");
  const currentYear = document.querySelector("#current-year");

  const revealElements = document.querySelectorAll(".reveal");

  const mapFrame = document.querySelector("#google-map");
  const mapWrapper = document.querySelector(".map-wrapper");


  /* ---------------------------------------------------------
     HEADER
     Mostra la navigazione solo dopo l'inizio della pagina.
     --------------------------------------------------------- */

  const updateHeader = () => {
    if (!header) return;

    if (window.scrollY > 40) {
      header.classList.add("is-visible");
    } else {
      header.classList.remove("is-visible");
    }
  };

  window.addEventListener("scroll", updateHeader, {
    passive: true
  });

  updateHeader();


  /* ---------------------------------------------------------
     MOBILE NAVIGATION
     --------------------------------------------------------- */

  const closeNavigation = () => {
    if (!menuToggle || !navigation) return;

    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Apri navigazione");
    navigation.classList.remove("is-open");
  };

  const openNavigation = () => {
    if (!menuToggle || !navigation) return;

    menuToggle.setAttribute("aria-expanded", "true");
    menuToggle.setAttribute("aria-label", "Chiudi navigazione");
    navigation.classList.add("is-open");
  };

  if (menuToggle && navigation) {
    menuToggle.addEventListener("click", () => {
      const isOpen =
        menuToggle.getAttribute("aria-expanded") === "true";

      if (isOpen) {
        closeNavigation();
      } else {
        openNavigation();
      }
    });

    navigation.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeNavigation);
    });

    document.addEventListener("click", (event) => {
      const target = event.target;

      if (
        navigation.classList.contains("is-open") &&
        !navigation.contains(target) &&
        !menuToggle.contains(target)
      ) {
        closeNavigation();
      }
    });
  }


  /* ---------------------------------------------------------
     INTERSECTION OBSERVER
     L'animazione è un miglioramento:
     il contenuto rimane accessibile senza JavaScript.
     --------------------------------------------------------- */

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if (!reducedMotion && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries, observerInstance) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          entry.target.classList.add("is-visible");
          observerInstance.unobserve(entry.target);
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -8% 0px"
      }
    );

    revealElements.forEach((element) => {
      observer.observe(element);
    });
  } else {
    revealElements.forEach((element) => {
      element.classList.add("is-visible");
    });
  }


  /* ---------------------------------------------------------
     GOOGLE MAPS
     La configurazione viene generata esclusivamente quando
     entrambi i dati indispensabili sono stati sostituiti.
     --------------------------------------------------------- */

  const configureGoogleMaps = () => {
    if (!mapFrame || !mapWrapper) return;

    const apiKey = CONFIG.googleMapsApiKey.trim();
    const place = CONFIG.googleMapsPlace.trim();

    const validApiKey =
      apiKey &&
      apiKey !== "YOUR_GOOGLE_MAPS_API_KEY";

    const validPlace =
      place &&
      place !== "YOUR_PROJECT_PLACE";

    if (!validApiKey || !validPlace) {
      return;
    }

    const query = encodeURIComponent(place);

    const mapUrl =
      "https://www.google.com/maps/embed/v1/place" +
      `?key=${encodeURIComponent(apiKey)}` +
      `&q=${query}`;

    mapFrame.src = mapUrl;
    mapWrapper.classList.add("is-configured");
  };

  configureGoogleMaps();


  /* ---------------------------------------------------------
     CTA
     --------------------------------------------------------- */

  const configureContact = () => {
    if (!contactLink) return;

    const email = CONFIG.contactEmail.trim();

    if (
      !email ||
      email === "YOUR_EMAIL@example.com"
    ) {
      /*
       * Il placeholder rimane esplicito finché non viene
       * configurato un indirizzo reale.
       */
      contactLink.setAttribute(
        "href",
        "mailto:YOUR_EMAIL@example.com"
      );
      return;
    }

    contactLink.href = `mailto:${encodeURIComponent(email)}`;
  };

  configureContact();


  /* ---------------------------------------------------------
     ANNO
     --------------------------------------------------------- */

  if (currentYear) {
    currentYear.textContent = new Date().getFullYear();
  }

})();
