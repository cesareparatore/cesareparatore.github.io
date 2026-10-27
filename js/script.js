/* Cesare Paratore — Digital HQ JS 10/10 Master */
document.addEventListener("DOMContentLoaded", () => {
  // 1. Revealer su scorrimento con IntersectionObserver ad alte prestazioni
  const observerOptions = { threshold: 0.1, rootMargin: "0px 0px -50px 0px" };
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("revealed");
        observer.unobserve(entry.target); // Libera risorse CPU/GPU
      }
    });
  }, observerOptions);

  document.querySelectorAll("[data-reveal]").forEach(el => revealObserver.observe(el));

  // 2. Controllo Visibilità Pagina (Sospensione trasparente dell'audio in background)
  let audioWasPlaying = false;
  const audioToggle = document.getElementById("audioToggle");
  
  document.addEventListener("visibilitychange", () => {
    const audioEl = document.getElementById("bgAudio");
    if (!audioEl) return;
    
    if (document.hidden) {
      if (!audioEl.paused) {
        audioEl.pause();
        audioWasPlaying = true;
      }
    } else {
      if (audioWasPlaying) {
        audioEl.play().catch(() => {});
        audioWasPlaying = false;
      }
    }
  });

  // 3. Gestione Menu Toggle
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