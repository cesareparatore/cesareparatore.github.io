/* Progressive enhancement for interior pages. */
(() => {
  'use strict';
  const body=document.body, root=document.documentElement;
  root.classList.add('js-enabled');
  const languageButton=document.querySelector('.language-toggle');
  const menuButton=document.querySelector('.menu-toggle');
  const navigation=document.querySelector('#site-navigation');
  const menuPanel=document.querySelector('#menuPanel');
  const audioButton=document.querySelector('#headerAudioToggle');
  let headerAudio=null;
  const translatable=[...document.querySelectorAll('[data-it][data-en]')];
  const titleIt=body.dataset.titleIt||document.title, titleEn=body.dataset.titleEn||titleIt;
  const descriptionIt=body.dataset.descriptionIt||'', descriptionEn=body.dataset.descriptionEn||descriptionIt;
  const descriptionTag=document.querySelector('meta[name="description"]');
  const ogTitleTag=document.querySelector('meta[property="og:title"]');
  const ogDescriptionTag=document.querySelector('meta[property="og:description"]');
  const twitterTitleTag=document.querySelector('meta[name="twitter:title"]');
  const twitterDescriptionTag=document.querySelector('meta[name="twitter:description"]');
  let language=root.lang==='en'?'en':'it';
  function applyLanguage(nextLanguage) {
    language=nextLanguage==='en'?'en':'it'; root.lang=language;
    for(const element of translatable){const value=element.dataset[language];if(value!==undefined)element.textContent=value;}
    const activeTitle=language==='en'?titleEn:titleIt;
    const activeDescription=language==='en'?descriptionEn:descriptionIt;
    document.title=activeTitle;
    if(descriptionTag&&activeDescription)descriptionTag.content=activeDescription;
    if(ogTitleTag)ogTitleTag.content=activeTitle;
    if(ogDescriptionTag&&activeDescription)ogDescriptionTag.content=activeDescription;
    if(twitterTitleTag)twitterTitleTag.content=activeTitle;
    if(twitterDescriptionTag&&activeDescription)twitterDescriptionTag.content=activeDescription;
    if(languageButton){languageButton.setAttribute('aria-pressed',String(language==='en'));languageButton.setAttribute('aria-label',language==='it'?'Switch language to English':'Switch language to Italian');const current=languageButton.querySelector('.language-current');const other=languageButton.querySelector('.language-other');if(current&&other){current.textContent=language.toUpperCase();other.textContent=language==='it'?'EN':'IT';}else{languageButton.textContent=language==='it'?'IT / EN':'EN / IT';}}
    root.dataset.language=language;
    if(audioButton)audioButton.setAttribute('aria-label',language==='it'?(audioButton.getAttribute('aria-pressed')==='true'?'Disattiva audio':'Attiva audio'):(audioButton.getAttribute('aria-pressed')==='true'?'Turn audio off':'Turn audio on'));
    updateMenuLabel();
  }
  function updateMenuLabel(){if(!menuButton)return;const open=menuButton.getAttribute('aria-expanded')==='true';menuButton.setAttribute('aria-label',open?(language==='it'?'Chiudi menu':'Close menu'):(language==='it'?'Apri menu':'Open menu'));}
  if(menuPanel){menuPanel.setAttribute('aria-hidden','true');menuPanel.inert=true;}
  function setMenuOpen(open,{returnFocus=false}={}){
    if(!navigation||!menuButton)return;
    const next=Boolean(open);menuButton.setAttribute('aria-expanded',String(next));menuPanel?.classList.toggle('is-open',next);navigation.classList.toggle('is-open',next);if(menuPanel){menuPanel.setAttribute('aria-hidden',String(!next));menuPanel.inert=!next;}updateMenuLabel();
    if(next){const first=navigation.querySelector('a[href]');if(first)first.focus();}
    else if(returnFocus)menuButton.focus();
  }
  languageButton?.addEventListener('click',()=>{const path=window.location.pathname;const inEnglishRoute=/^\/en(?:\/|$)/.test(path);const nextPath=inEnglishRoute?(path.replace(/^\/en(?=\/|$)/,'')||'/'):(path==='/'?'/en/':'/en'+path);window.location.assign(nextPath+window.location.search+window.location.hash);});
  menuButton?.addEventListener('click',()=>setMenuOpen(menuButton.getAttribute('aria-expanded')!=='true'));
  navigation?.addEventListener('click',event=>{if(event.target.closest('a'))setMenuOpen(false);});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&menuButton?.getAttribute('aria-expanded')==='true')setMenuOpen(false,{returnFocus:true});});
  document.addEventListener('click',event=>{if(menuButton?.getAttribute('aria-expanded')==='true'&&!navigation?.contains(event.target)&&!menuButton.contains(event.target))setMenuOpen(false);});
  window.addEventListener('resize',()=>{if(window.matchMedia('(min-width: 721px)').matches)setMenuOpen(false);},{passive:true});
  audioButton?.addEventListener('click',()=>{
    if(!headerAudio){headerAudio=new Audio('/assets/audio/Weight_of_Intent.mp3');headerAudio.loop=true;headerAudio.preload='none';headerAudio.addEventListener('ended',()=>{audioButton.classList.remove('is-playing');audioButton.setAttribute('aria-pressed','false');});}
    if(headerAudio.paused){headerAudio.play().then(()=>{audioButton.classList.add('is-playing');audioButton.setAttribute('aria-pressed','true');audioButton.setAttribute('aria-label',language==='it'?'Disattiva audio':'Turn audio off');}).catch(()=>{audioButton.setAttribute('aria-pressed','false');});}
    else{headerAudio.pause();audioButton.classList.remove('is-playing');audioButton.setAttribute('aria-pressed','false');audioButton.setAttribute('aria-label',language==='it'?'Attiva audio':'Turn audio on');}
  });
  applyLanguage(language);
})();
