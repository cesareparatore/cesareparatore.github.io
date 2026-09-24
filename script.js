document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.querySelector(".menu-toggle");
  const menu = document.querySelector("#site-menu");
  const menuLabel = document.querySelector(".menu-toggle-label");

  if (!menuToggle || !menu || !menuLabel) return;

  const menuLinks = [...menu.querySelectorAll("a")];

  let lastFocusedElement = null;

  function openMenu() {
    lastFocusedElement = document.activeElement;

    menuToggle.setAttribute("aria-expanded", "true");
    menu.setAttribute("aria-hidden", "false");
    menu.removeAttribute("inert");

    menu.classList.add("is-open");

    menuLabel.textContent = "CHIUDI";

    document.body.classList.add("menu-open");

    const firstLink = menuLinks[0];

    if (firstLink) {
      requestAnimationFrame(() => {
        firstLink.focus();
      });
    }
  }

  function closeMenu(returnFocus = true) {
    menuToggle.setAttribute("aria-expanded", "false");
    menu.setAttribute("aria-hidden", "true");
    menu.setAttribute("inert", "");

    menu.classList.remove("is-open");

    menuLabel.textContent = "MENU";

    document.body.classList.remove("menu-open");

    if (
      returnFocus &&
      lastFocusedElement &&
      typeof lastFocusedElement.focus === "function"
    ) {
      lastFocusedElement.focus();
    } else {
      menuToggle.focus();
    }
  }

  function toggleMenu() {
    const isOpen =
      menuToggle.getAttribute("aria-expanded") === "true";

    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  }

  menuToggle.addEventListener("click", toggleMenu);

  document.addEventListener("keydown", (event) => {
    const isOpen =
      menuToggle.getAttribute("aria-expanded") === "true";

    if (!isOpen) return;

    if (event.key === "Escape") {
      event.preventDefault();
      closeMenu();
      return;
    }

    if (event.key !== "Tab") return;

    const focusable = [
      menuToggle,
      ...menuLinks
    ].filter(
      (element) =>
        element &&
        !element.hasAttribute("disabled") &&
        element.offsetParent !== null
    );

    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  menuLinks.forEach((link) => {
    link.addEventListener("click", () => {
      closeMenu(false);
    });
  });

  /*
   * Stato iniziale coerente:
   * menu chiuso, non interattivo e non presente nel tree del focus.
   */
  closeMenu(false);
});
