/* Progressive enhancement for interior pages. */
(() => {
  'use strict';
  const body=document.body, root=document.documentElement;
  const languageButton=document.querySelector('.language-toggle');
  const menuButton=document.querySelector('.menu-toggle');
  const navigation=document.querySelector('#site-navigation');
  const translatable=[...document.querySelectorAll('[data-it][data-en]')];
  const titleIt=body.dataset.titleIt||document.title, titleEn=body.dataset.titleEn||titleIt;
  const descriptionIt=body.dataset.descriptionIt||'', descriptionEn=body.dataset.descriptionEn||descriptionIt;
  const descriptionTag=document.querySelector('meta[name="description"]');
  const ogTitleTag=document.querySelector('meta[property="og:title"]');
  const ogDescriptionTag=document.querySelector('meta[property="og:description"]');
  const twitterTitleTag=document.querySelector('meta[name="twitter:title"]');
  const twitterDescriptionTag=document.querySelector('meta[name="twitter:description"]');
  let language='it';
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
    if(languageButton){languageButton.setAttribute('aria-pressed',String(language==='en'));languageButton.setAttribute('aria-label',language==='it'?'Switch language to English':'Passa alla lingua italiana');languageButton.textContent=language==='it'?'IT / EN':'EN / IT';}
    root.dataset.language=language;
    updateMenuLabel();
  }
  function updateMenuLabel(){if(!menuButton)return;const open=menuButton.getAttribute('aria-expanded')==='true';menuButton.setAttribute('aria-label',open?(language==='it'?'Chiudi menu':'Close menu'):(language==='it'?'Apri menu':'Open menu'));}
  function setMenuOpen(open,{returnFocus=false}={}){
    if(!navigation||!menuButton)return;
    const next=Boolean(open);menuButton.setAttribute('aria-expanded',String(next));navigation.classList.toggle('is-open',next);updateMenuLabel();
    if(next){const first=navigation.querySelector('a[href]');if(first&&window.matchMedia('(max-width: 720px)').matches)first.focus();}
    else if(returnFocus)menuButton.focus();
  }
  languageButton?.addEventListener('click',()=>applyLanguage(language==='it'?'en':'it'));
  menuButton?.addEventListener('click',()=>setMenuOpen(menuButton.getAttribute('aria-expanded')!=='true'));
  navigation?.addEventListener('click',event=>{if(event.target.closest('a'))setMenuOpen(false);});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&menuButton?.getAttribute('aria-expanded')==='true')setMenuOpen(false,{returnFocus:true});});
  document.addEventListener('click',event=>{if(menuButton?.getAttribute('aria-expanded')==='true'&&!navigation?.contains(event.target)&&!menuButton.contains(event.target))setMenuOpen(false);});
  window.addEventListener('resize',()=>{if(window.matchMedia('(min-width: 721px)').matches)setMenuOpen(false);},{passive:true});
  applyLanguage('it');
})();
