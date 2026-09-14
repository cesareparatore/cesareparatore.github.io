/**
 * FORM / Cesare Paratore — Presenza Professionale
 * Motion discreto e minimale (PDD Cap. 25)
 */

document.addEventListener('DOMContentLoaded', () => {
  // Animazione controllata all'entrata in viewport (Intersection Observer)
  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -50px 0px',
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        obs.unobserve(entry.target); // Ferma l'osservazione dopo la prima apparizione
      }
    });
  }, observerOptions);

  // Applica il fade-in sobrio alle sezioni chiave
  const elementsToAnimate = document.querySelectorAll('.matrix-card, .section-block .content-narrow, .hero-portrait-wrap');
  
  elementsToAnimate.forEach(el => {
    el.classList.add('fade-in');
    observer.observe(el);
  });
});
