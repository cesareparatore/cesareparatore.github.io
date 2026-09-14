/**
 * FORM / Cesare Paratore — Presenza Professionale
 * Motion discreto, fluido ed elegante (Steve Jobs Motion Baseline)
 */

document.addEventListener('DOMContentLoaded', () => {

  // 1. Fluid Scroll Reveal (Intersection Observer)
  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -60px 0px',
    threshold: 0.08
  };

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Seleziona gli elementi da far apparire in sequenza
  const elementsToAnimate = document.querySelectorAll(
    '.matrix-card, .section-block .content-narrow, .hero-portrait-wrap, .plain-list li'
  );

  elementsToAnimate.forEach((el, index) => {
    el.classList.add('fade-in');
    // Micro-delay per creare l'effetto cascata elegante
    el.style.transitionDelay = `${(index % 3) * 0.1}s`;
    observer.observe(el);
  });

  // 2. Smooth Header Resize on Scroll
  const header = document.querySelector('.site-header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.style.padding = '16px 0';
    } else {
      header.style.padding = '24px 0';
    }
  });

});
