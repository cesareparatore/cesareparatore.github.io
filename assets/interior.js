/* Progressive enhancement for interior pages. */
(() => {
  'use strict';
  const body=document.body, root=document.documentElement;
  root.classList.add('js-enabled');
  const footerClock=document.getElementById('footerClock');
  const footerClockFormatter=new Intl.DateTimeFormat('it-IT',{timeZone:'Europe/Rome',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false});
  const updateFooterClock=()=>{if(footerClock)footerClock.textContent=footerClockFormatter.format(new Date());};
  updateFooterClock();
  if(footerClock)window.setInterval(updateFooterClock,1000);
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
    for(const element of translatable){const value=element.dataset[language];if(value!==undefined){const icon=element.matches('.footer-privacy')?element.querySelector('svg.link-arrow-icon'):null;if(icon){element.textContent='';element.append(document.createTextNode(value+' '));element.append(icon);}else{element.textContent=value;}}}
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
  // Header behaviour shared with the homepage: visible at the opening and again at the footer.
  const main=document.querySelector('main');
  const heroSection=main?.querySelector(':scope > .hero');
  const siteFooter=document.querySelector('.site-footer');
  let footerVisible=false;
  if(siteFooter&&'IntersectionObserver' in window){
    const footerObserver=new IntersectionObserver(entries=>{
      footerVisible=entries.some(entry=>entry.isIntersecting);
      updateHeaderPlacement();
    },{root:null,threshold:0.01});
    footerObserver.observe(siteFooter);
  }
  function updateHeaderPlacement(){
    const heroBottom=heroSection?heroSection.getBoundingClientRect().bottom:0;
    const footerRect=siteFooter?siteFooter.getBoundingClientRect():{top:Infinity,bottom:-Infinity};
    const atHero=window.scrollY<Math.max(1,(heroSection?.offsetHeight||window.innerHeight)-80);
    const atFooter=footerVisible||(footerRect.top<window.innerHeight&&footerRect.bottom>0);
    const floating=!atHero&&!atFooter;
    body.classList.toggle('header-menu-mode',atHero||atFooter);
    body.classList.toggle('footer-menu-mode',atFooter);
    body.classList.toggle('contact-return-mode',atFooter);
    body.classList.toggle('chapter-float-mode',floating);
    if(menuButton&&floating&&menuButton.getAttribute('aria-expanded')==='true')setMenuOpen(false);
  }
  window.addEventListener('scroll',updateHeaderPlacement,{passive:true});
  window.addEventListener('resize',updateHeaderPlacement,{passive:true});
  updateHeaderPlacement();
  // Stessa logica della homepage: la firma si rivela quando il footer entra in vista.
  const signature=document.querySelector('.signature');
  let signatureCompleteTimer=null;
  function resetSignatureCompletion(){
    if(signatureCompleteTimer){clearTimeout(signatureCompleteTimer);signatureCompleteTimer=null;}
    body.classList.remove('footer-signature-complete');
  }
  function markSignatureComplete(){
    resetSignatureCompletion();
    if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){
      body.classList.add('footer-signature-complete');
      return;
    }
    signatureCompleteTimer=window.setTimeout(()=>{
      if(siteFooter&&siteFooter.getBoundingClientRect().top<window.innerHeight&&siteFooter.getBoundingClientRect().bottom>0){
        body.classList.add('footer-signature-complete');
      }
      signatureCompleteTimer=null;
    },2350);
  }
  if(signature&&siteFooter){
    if('IntersectionObserver' in window){
      const signatureObserver=new IntersectionObserver(entries=>{
        entries.forEach(entry=>{
          if(entry.isIntersecting){
            resetSignatureCompletion();
            signature.classList.remove('is-signing');
            void signature.offsetWidth;
            signature.classList.add('is-signing');
            markSignatureComplete();
          }else{
            resetSignatureCompletion();
            signature.classList.remove('is-signing');
          }
        });
      },{threshold:0.35});
      signatureObserver.observe(siteFooter);
    }else{
      signature.classList.add('is-signing');
      markSignatureComplete();
    }
  }

  const backToTop=document.getElementById('backToTop');
  backToTop?.addEventListener('click',()=>window.scrollTo({top:0,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'}));

  // La navigazione tra sezioni avviene tramite contenuto, menu e normali link contestuali.
  applyLanguage(language);
})();
