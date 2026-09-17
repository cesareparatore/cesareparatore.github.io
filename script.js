/* =========================================================
   CESARE PARATORE — MOVIMENTO / CON DIREZIONE.
   EXPERIENCE ENGINE
   ========================================================= */

(() => {
  "use strict";

  /* ---------------------------------------------------------
     ROOT
     --------------------------------------------------------- */

  const root = document.documentElement;
  const body = document.body;

  root.classList.add("js");

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  const isTouch =
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0;

  const sections = [...document.querySelectorAll("main > section")];

  const logoPath = "/assets/images/cp-mark.png";

  const state = {
    currentSection: 0,
    lastScrollY: window.scrollY,
    scrollDirection: "down",
    menuOpen: false,
    standby: false,
    pointerX: 0.5,
    pointerY: 0.5,
    ticking: false,
    lastInteraction: Date.now()
  };

  /* ---------------------------------------------------------
     UTILITIES
     --------------------------------------------------------- */

  const clamp = (value, min, max) =>
    Math.min(Math.max(value, min), max);

  const lerp = (a, b, t) =>
    a + (b - a) * t;

  const qs = (selector, scope = document) =>
    scope.querySelector(selector);

  const qsa = (selector, scope = document) =>
    [...scope.querySelectorAll(selector)];

  const create = (tag, className = "") => {
    const element = document.createElement(tag);

    if (className) {
      element.className = className;
    }

    return element;
  };

  const markInteraction = () => {
    state.lastInteraction = Date.now();

    if (state.standby) {
      wakeStandby();
    }
  };

  /* ---------------------------------------------------------
     LOADER
     --------------------------------------------------------- */

  const loader = qs(".site-loader");

  const hideLoader = () => {
    if (!loader) return;

    loader.classList.add("is-loaded");

    window.setTimeout(() => {
      loader.setAttribute("aria-hidden", "true");
    }, 900);
  };

  window.addEventListener("load", () => {
    window.setTimeout(hideLoader, 500);
  });

  // Fail-safe: the experience must never remain blocked.
  window.setTimeout(hideLoader, 4000);

  /* ---------------------------------------------------------
     HEADER
     --------------------------------------------------------- */

  const header = qs(".site-header");

  let previousScroll = window.scrollY;

  const updateHeader = () => {
    if (!header) return;

    const current = window.scrollY;

    if (current <= 20) {
      header.classList.remove("is-hidden");
      header.classList.remove("is-scrolled");
      previousScroll = current;
      return;
    }

    header.classList.add("is-scrolled");

    if (
      current > previousScroll &&
      current > 120 &&
      !state.menuOpen
    ) {
      header.classList.add("is-hidden");
    }

    if (current < previousScroll) {
      header.classList.remove("is-hidden");
    }

    previousScroll = current;
  };

  /* ---------------------------------------------------------
     SCROLL PROGRESS
     ------------------------------------------------
