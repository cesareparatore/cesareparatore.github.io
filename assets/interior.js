/* Progressive enhancement for the site's interior pages. */
(() => {
  'use strict';
  const body = document.body;
  const languageButton = document.querySelector('.language-toggle');
  const menuButton = document.querySelector('.menu-toggle');
  const navigation = document.querySelector('#site-navigation');
  const translatable = [...document.querySelectorAll('[data-it][data-en]')];
  const titleIt = body.dataset.titleIt || document.title;
  const titleEn = body.dataset.titleEn || titleIt;
  const descriptionIt = body.dataset.descriptionIt || '';
  const descriptionEn = body.dataset.descriptionEn || descriptionIt;
  const descriptionTag = document.querySelector('meta[name="description"]');
  const ogTitleTag = document.querySelector('meta[property="og:title"]');
  const ogDescriptionTag = document.querySelector('meta[property="og:description"]');
  const twitterTitleTag = document.querySelector('meta[name="twitter:title"]');
  const twitterDescriptionTag = document.querySelector('meta[name="twitter:description"]');
  let language = 'it';

  function applyLanguage(nextLanguage) {
    language = nextLanguage === 'en' ? 'en' : 'it';
    body.lang = language;
    for (const element of translatable) {
      const value = element.dataset[language];
      if (value !== undefined) element.textContent = value;
    }
    document.title = language === 'en' ? titleEn : titleIt;
    const activeTitle = language === 'en' ? titleEn : titleIt;
    const activeDescription = language === 'en' ? descriptionEn : descriptionIt;
    if (descriptionTag) descriptionTag.content = activeDescription;
    if (ogTitleTag) ogTitleTag.content = activeTitle;
    if (ogDescriptionTag) ogDescriptionTag.content = activeDescription;
    if (twitterTitleTag) twitterTitleTag.content = activeTitle;
    if (twitterDescriptionTag) twitterDescriptionTag.content = activeDescription;
    if (languageButton) {
      languageButton.setAttribute('aria-pressed', String(language === 'en'));
      languageButton.setAttribute('aria-label', language === 'it' ? 'Switch language to English' : 'Passa alla lingua italiana');
      languageButton.textContent = language === 'it' ? 'IT / EN' : 'EN / IT';
    }
    document.documentElement.dataset.language = language;
  }

  languageButton?.addEventListener('click', () => applyLanguage(language === 'it' ? 'en' : 'it'));
  menuButton?.addEventListener('click', () => {
    if (!navigation) return;
    const expanded = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!expanded));
    navigation.classList.toggle('is-open', !expanded);
  });
  navigation?.addEventListener('click', event => {
    if (event.target.closest('a') && menuButton) {
      menuButton.setAttribute('aria-expanded', 'false');
      navigation.classList.remove('is-open');
    }
  });
  window.addEventListener('resize', () => {
    if (window.matchMedia('(min-width: 721px)').matches && navigation && menuButton) {
      navigation.classList.remove('is-open');
      menuButton.setAttribute('aria-expanded', 'false');
    }
  }, { passive: true });
  applyLanguage('it');
})();
