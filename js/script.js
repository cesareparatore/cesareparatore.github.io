/* Cesare Paratore — Digital HQ JS 10/10 Master */
document.addEventListener("DOMContentLoaded", () => {
  const observerOptions = { threshold: 0.1, rootMargin: "0px 0px -50px 0px" };
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("revealed");
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll("[data-reveal]").forEach(el => revealObserver.observe(el));

  const menuToggle = document.getElementById("menuToggle");
  const menuPanel = document.getElementById("menuPanel");
  if (menuToggle && menuPanel) {
    menuToggle.addEventListener("click", () => {
      const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
      menuToggle.setAttribute("aria-expanded", !isExpanded);
      menuPanel.setAttribute("aria-hidden", isExpanded);
      if (isExpanded) {
        menuPanel.setAttribute("inert", "");
      } else {
        menuPanel.removeAttribute("inert");
      }
    });
  }
});
