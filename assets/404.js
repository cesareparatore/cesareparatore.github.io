/* Localized GitHub Pages 404 page. */
(() => {
  'use strict';
  const english = /^\/en(?:\/|$)/.test(window.location.pathname);
  const language = english ? 'en' : 'it';
  document.documentElement.lang = language;
  for (const element of document.querySelectorAll('[data-it][data-en]')) {
    const value = element.dataset[language];
    if (value === undefined) continue;
    if (element.id === 'home-link') {
      element.textContent = value;
      const arrow = document.createElement('span');
      arrow.setAttribute('aria-hidden', 'true');
      arrow.textContent = ' ↗';
      element.appendChild(arrow);
    } else {
      element.textContent = value;
    }
  }
  document.title = english ? 'Page not found | Cesare Paratore' : 'Pagina non trovata | Cesare Paratore';
  const description = document.querySelector('meta[name="description"]');
  if (description) description.content = english
    ? 'The requested page is not available. Return to Cesare Paratore’s homepage.'
    : 'La pagina richiesta non è disponibile. Torna alla homepage di Cesare Paratore.';
  const homeLink = document.getElementById('home-link');
  if (homeLink) homeLink.href = english ? '/en/' : '/';
})();
