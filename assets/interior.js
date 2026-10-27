/* Progressive enhancement for the shared interior pages. */
(() => {
  'use strict';
  const body = document.body;
  const toggle = document.querySelector('.language-toggle');
  const menuToggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#site-navigation');
  const metaDescription = document.querySelector('meta[name="description"]');
  const ogTitle = document.querySelector('meta[property="og:title"]');
  const ogDescription = document.querySelector('meta[property="og:description"]');
  const titleFor = lang => lang === 'en' ? body.dataset.titleEn : body.dataset.titleIt;
  const descriptionFor = lang => lang === 'en' ? body.dataset.descriptionEn : body.dataset.descriptionIt;

  function setLanguage(lang) {
    const next = lang === 'en' ? 'en' : 'it';
    document.documentElement.lang = next;
    document.querySelectorAll('[data-it][data-en]').forEach(el => {
      const value = el.dataset[next];
      if (value !== undefined) el.textContent = value;
    });
    const title = titleFor(next);
    const description = descriptionFor(next);
    if (title) document.title = title;
    if (description && metaDescription) metaDescription.content = description;
    if (title && ogTitle) ogTitle.content = title;
    if (description && ogDescription) ogDescription.content = description;
    if (menuToggle) {
      const open = menuToggle.getAttribute('aria-expanded') === 'true';
      menuToggle.setAttribute('aria-label', open ? (next === 'en' ? 'Close menu' : 'Chiudi menu') : (next === 'en' ? 'Open menu' : 'Apri menu'));
    }
    if (toggle) {
      toggle.setAttribute('aria-pressed', String(next === 'en'));
      toggle.setAttribute('aria-label', next === 'it' ? 'Switch language to English' : 'Passa alla lingua italiana');
    }
    try { localStorage.setItem('cp-language', next); } catch (_) { /* Storage may be unavailable. */ }
  }

  function setMenu(open) {
    if (!menuToggle || !nav) return;
    nav.classList.toggle('is-open', open);
    menuToggle.setAttribute('aria-expanded', String(open));
    const english = document.documentElement.lang.toLowerCase().startsWith('en');
    menuToggle.setAttribute('aria-label', open ? (english ? 'Close menu' : 'Chiudi menu') : (english ? 'Open menu' : 'Apri menu'));
  }

  if (toggle) {
    toggle.addEventListener('click', () => {
      const currentlyEnglish = document.documentElement.lang.toLowerCase().startsWith('en');
      setLanguage(currentlyEnglish ? 'it' : 'en');
    });
  }
  if (menuToggle && nav) {
    menuToggle.addEventListener('click', () => setMenu(menuToggle.getAttribute('aria-expanded') !== 'true'));
    nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false)));
    document.addEventListener('keydown', event => { if (event.key === 'Escape') { setMenu(false); menuToggle.focus(); } });
    window.addEventListener('resize', () => { if (window.matchMedia('(min-width: 921px)').matches) setMenu(false); });
  }

  let preferred = 'it';
  try { const saved = localStorage.getItem('cp-language'); if (saved === 'it' || saved === 'en') preferred = saved; } catch (_) { /* Use the page language. */ }
  if (preferred !== 'it') setLanguage(preferred);
})();
