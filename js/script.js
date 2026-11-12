// Non-numeric preloader: it never presents a simulated percentage as real progress.
(function initSitePreloader(){
  const screen = document.getElementById("sitePreloader");
  if(!screen) return;
  const label = document.getElementById("preloaderPercent");
  if(label) label.textContent = document.documentElement.lang === "en" ? "LOADING" : "CARICAMENTO";

  let finished = false;
  const finish = () => {
    if(finished) return;
    finished = true;
    window.setTimeout(() => {
      screen.classList.add("is-done");
      window.setTimeout(() => {
        screen.remove();
        window.dispatchEvent(new Event("sitePreloaderFinished"));
      }, window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 350);
    }, 120);
  };

  // Internal navigation (same-site referrer) skips the intro: it is meant as a first impression, not a page transition.
  if(window.matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.classList.contains("intro-skip")){
    screen.remove();
    window.dispatchEvent(new Event("sitePreloaderFinished"));
    return;
  }
  if(document.readyState === "complete") finish();
  else window.addEventListener("load", finish, {once:true});
  // Never allow a stalled external or local resource to trap the visitor behind the intro.
  window.setTimeout(finish, 1500);
})();

(() => {
  "use strict";

  const sections = [
    {id:"guarda",label:"GUARDA"},
    {id:"storia",label:"STORIA"},
    {id:"mondi",label:"OGGI"},
    {id:"principio",label:"PRINCIPIO"},
    {id:"territorio",label:"DOVE SONO"},
    {id:"contatto",label:"CONTATTO"}
  ];

  const pageOrder = [
    "/",
    "/chi-sono/",
    "/sport-manager/",
    "/chinesiologo/",
    "/running-coach/",
    "/formatore/",
    "/web-designer/",
    "/dove-sono/",
    "/contatti/"
  ];

  let currentSectionIndex = 0;
  let inactivityTimer = null;
  let pauseActive = false;
  let pauseRestoreY = window.scrollY;
  let ticking = false;
  let chapterLabelTimer = null;

  const body = document.body;
  const isHomePage = ["GUARDA", "LOOK"].includes(body.dataset.pageLabel);
  const headerChapter = document.querySelector(".header-chapter");
  const chapterLabel = document.getElementById("chapterLabel");
  const chapterPrev = document.getElementById("chapterPrev");
  const chapterNext = document.getElementById("chapterNext");
  const chapterLine = document.querySelector(".chapter-line");
  const menuToggle = document.getElementById("menuToggle");
  const dockMenuToggle = document.getElementById("dockMenuToggle");
  const menuPanel = document.getElementById("menuPanel");
  const audioToggle = document.getElementById("audioToggle");
  const headerAudioToggle = document.getElementById("headerAudioToggle");
  const languageToggle = document.getElementById("languageToggle");
  const audioStatus = document.getElementById("audioStatus");
  const audioStatusMessage = document.getElementById("audioStatusMessage");
  const menuLinks = [...document.querySelectorAll(".menu-link")];
  const chapterElements = sections.map(s => document.getElementById(s.id)).filter(Boolean);
  const revealElements = [...document.querySelectorAll("[data-reveal]")].filter(element => !element.closest(".writing-copy"));

  // Open the intro curtain only after the percentage preloader has completed.
  const openIntroCurtain = () => {
    if(window.matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.classList.contains("intro-skip")){
      body.classList.add("is-ready", "hero-intro-open");
      window.dispatchEvent(new Event("heroIntroOpened"));
      return;
    }
    const panel = document.querySelector(".curtain-panel--right");
    let introStarted = false;
    const markIntroOpen = () => {
      if(introStarted) return;
      introStarted = true;
      body.classList.add("hero-intro-open");
      window.dispatchEvent(new Event("heroIntroOpened"));
    };
    if(panel) panel.addEventListener("transitionend", event => { if(event.propertyName === "transform") markIntroOpen(); }, {once:true});
    body.classList.add("is-ready");
    window.setTimeout(markIntroOpen, isHomePage ? 1800 : 5700); // Home intro failsafe; keep legacy timing on other pages.
  };
  const revealPage = () => {
    if(document.getElementById("sitePreloader")) {
      window.addEventListener("sitePreloaderFinished", openIntroCurtain, {once:true});
    } else {
      openIntroCurtain();
    }
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", revealPage, {once:true});
  else revealPage();
  // Recovery if the preloader script fails for any reason.
  window.setTimeout(() => { if(!body.classList.contains("is-ready")) openIntroCurtain(); }, isHomePage ? 3500 : 9000);

  function updateChapter(index, animate=true){
    const safe = Math.max(0, Math.min(index, sections.length-1));
    currentSectionIndex = safe;
    const current = sections[safe];

    if(animate){
      if(headerChapter) headerChapter.classList.add("is-changing");
      if(chapterLabelTimer) window.clearTimeout(chapterLabelTimer);
      chapterLabelTimer = window.setTimeout(() => {
        if(chapterLabel) chapterLabel.textContent = current.label;
        if(headerChapter) headerChapter.classList.remove("is-changing");
      },120);
    }else{
      if(chapterLabel) chapterLabel.textContent = current.label;
    }

    // La navigazione a frecce è stata rimossa dalla homepage: resta soltanto
    // l'aggiornamento interno dello stato delle sezioni, senza controlli visibili.
    if(headerChapter) headerChapter.setAttribute("aria-label", document.documentElement.lang === "en" ? "Section navigation" : "Navigazione tra le sezioni");

    updateChapterProgress();
  }

  function updateChapterProgress(){
    if(!chapterLine) return;

    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const progress = Math.max(0, Math.min(1, window.scrollY / maxScroll));

    chapterLine.style.setProperty(
      "--chapter-progress",
      `${(progress * 100).toFixed(2)}%`
    );
  }

  function scrollToSection(index){
    const safe = Math.max(0, Math.min(index, chapterElements.length-1));
    const target = chapterElements[safe];
    if(!target) return;

    target.scrollIntoView({
      behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      block:"start"
    });

    updateChapter(safe);
    resetInactivityTimer();
  }


  if ("IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if(!entry.isIntersecting) return;
        const index = sections.findIndex(s => s.id === entry.target.id);
        if(index !== -1) updateChapter(index);
      });
    },{threshold:0,rootMargin:"-40% 0px -40% 0px"});
    chapterElements.forEach(section => sectionObserver.observe(section));
  } else {
    // Graceful fallback for older browsers: update the active chapter on scroll.
    const updateChapterFromViewport = () => {
      const midpoint = window.innerHeight / 2;
      let closestIndex = 0;
      let closestDistance = Infinity;
      chapterElements.forEach((section, index) => {
        const rect = section.getBoundingClientRect();
        const distance = midpoint < rect.top ? rect.top - midpoint : midpoint > rect.bottom ? midpoint - rect.bottom : 0;
        if(distance < closestDistance){ closestDistance = distance; closestIndex = index; }
      });
      updateChapter(closestIndex, false);
    };
    window.addEventListener("scroll", updateChapterFromViewport, {passive:true});
    window.addEventListener("resize", updateChapterFromViewport, {passive:true});
    updateChapterFromViewport();
  }

  // The chapter navigation detaches visually from the header after GUARDA.
  // The brand/menu header is visible at the opening and returns at the footer.
  const heroSection = document.getElementById("guarda");
  const siteFooter = document.querySelector(".site-footer");
  const backToTop = document.getElementById("backToTop");
  if (backToTop) backToTop.setAttribute("aria-label", document.documentElement.lang === "en" ? "Back to top" : "Torna all’inizio della pagina");
  // Il pulsante resta nascosto durante CONTATTO e compare soltanto quando il footer entra in vista.
  function updateReturnButtonVisibility(){
    if(!siteFooter) return;
    const rect = siteFooter.getBoundingClientRect();
    const footerInView = rect.top < window.innerHeight && rect.bottom > 0;
    body.classList.toggle("contact-return-mode", footerInView);
  }
  window.addEventListener("scroll", updateReturnButtonVisibility, {passive:true});
  window.addEventListener("resize", updateReturnButtonVisibility);
  updateReturnButtonVisibility();
  if (backToTop) {
    backToTop.addEventListener("click", () => {
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({top: 0, behavior: reduceMotion ? "auto" : "smooth"});
    });
  }
  let footerIsVisible = false;
  if (siteFooter && "IntersectionObserver" in window) {
    const footerObserver = new IntersectionObserver(entries => {
      footerIsVisible = entries.some(entry => entry.isIntersecting);
      updateMenuPlacement();
      updateReturnButtonVisibility();
    }, { root:null, threshold:0.01 });
    footerObserver.observe(siteFooter);
  }

  function updateMenuPlacement(){
    const heroBottom = heroSection ? heroSection.getBoundingClientRect().bottom : 0;
    const footerTop = siteFooter ? siteFooter.getBoundingClientRect().top : Infinity;
    const footerBottom = siteFooter ? siteFooter.getBoundingClientRect().bottom : -Infinity;
    const footerIntersectsViewport = footerTop < window.innerHeight && footerBottom > 0;
    const atHero = window.scrollY < Math.max(1, (heroSection?.offsetHeight || window.innerHeight) - 80);
    const atFooter = footerIsVisible || footerIntersectsViewport;
    const floatingChapterMode = !atHero && !atFooter;

    body.classList.toggle("header-menu-mode", atHero || atFooter);
    body.classList.toggle("footer-menu-mode", atFooter);
    body.classList.toggle("chapter-float-mode", floatingChapterMode);
    updateChapterNavVisibility();

    if(menuOpen && (atHero || atFooter) && lastMenuTrigger === dockMenuToggle) lastMenuTrigger = menuToggle;
    if(menuOpen && floatingChapterMode && lastMenuTrigger === menuToggle) lastMenuTrigger = dockMenuToggle;
  }
  window.addEventListener("scroll", updateMenuPlacement, {passive:true});
  window.addEventListener("resize", updateMenuPlacement);
  window.addEventListener("scroll", updateChapterNavVisibility, {passive:true});
  window.addEventListener("resize", updateChapterNavVisibility);

  let menuOpen = false;
  function updateChapterNavVisibility(){
    if(!headerChapter) return;
    const contactAction = document.querySelector("#contactLink, .contact-link");
    const actionRect = contactAction?.getBoundingClientRect();
    const arrowRects = [...headerChapter.querySelectorAll('.chapter-arrow')].map(button => button.getBoundingClientRect());
    const overlapsContactAction = Boolean(actionRect && actionRect.width && actionRect.height && arrowRects.some(rect => rect.left < actionRect.right && rect.right > actionRect.left && rect.top < actionRect.bottom && rect.bottom > actionRect.top));
    body.classList.toggle("chapter-nav-obscured", menuOpen || overlapsContactAction);
  }
  if(menuPanel){ menuPanel.setAttribute("aria-hidden","true"); menuPanel.inert = true; }
  let lastMenuTrigger = menuToggle || dockMenuToggle;
  updateMenuPlacement();

  function syncMenuButtons(isOpen){
    [menuToggle,dockMenuToggle].forEach(button => {
      if(!button) return;
      button.setAttribute("aria-expanded",String(isOpen));
      button.classList.toggle("is-open",isOpen);
    });
    const dockLabel = dockMenuToggle?.querySelector(".dock-menu-label");
    if(dockLabel) dockLabel.textContent = isOpen ? "CHIUDI" : "MENU";
    const headerLabel = menuToggle?.querySelector(".header-menu-label");
    if(headerLabel) headerLabel.textContent = isOpen ? "CHIUDI" : "MENU";
    if(menuToggle) menuToggle.setAttribute("aria-label", isOpen ? "Chiudi menu" : "Apri menu");
  }

  function openMenu(trigger=(document.body.classList.contains("header-menu-mode") ? menuToggle : dockMenuToggle)){
    menuOpen = true;
    body.classList.add("chapter-nav-obscured");
    lastMenuTrigger = trigger || menuToggle || dockMenuToggle;
    menuPanel.classList.add("is-open");
    syncMenuButtons(true);
    menuPanel.setAttribute("aria-hidden","false");
    menuPanel.inert = false;
    if(menuLinks[0]) window.setTimeout(() => { if(menuOpen && !menuPanel.inert) menuLinks[0].focus(); },80);
    resetInactivityTimer();
  }

  function closeMenu(restoreFocus=true){
    menuOpen = false;
    updateChapterNavVisibility();
    menuPanel.classList.remove("is-open");
    syncMenuButtons(false);
    menuPanel.setAttribute("aria-hidden","true");
    menuPanel.inert = true;
    if(restoreFocus && lastMenuTrigger && typeof lastMenuTrigger.focus === "function") lastMenuTrigger.focus();
  }

  if(menuToggle){
    menuToggle.addEventListener("click",() => menuOpen ? closeMenu() : openMenu(menuToggle));
  }
  if(dockMenuToggle){
    dockMenuToggle.addEventListener("click",() => menuOpen ? closeMenu() : openMenu(dockMenuToggle));
  }

  menuLinks.forEach(link => link.addEventListener("click",() => {
    closeMenu(false);
    resetInactivityTimer();
  }));

  document.addEventListener("keydown",event => {
    if(event.key==="Escape" && menuOpen){
      closeMenu();
      return;
    }

    if(event.key==="Tab" && menuOpen && menuLinks.length){
      const first = menuLinks[0];
      const last = menuLinks[menuLinks.length-1];

      if(event.shiftKey && document.activeElement===first){
        event.preventDefault();
        last.focus();
      }else if(!event.shiftKey && document.activeElement===last){
        event.preventDefault();
        first.focus();
      }
    }
  });

  document.addEventListener("click",event => {
    if(!menuOpen) return;
    const inside = menuPanel.contains(event.target) || (menuToggle && menuToggle.contains(event.target)) || (dockMenuToggle && dockMenuToggle.contains(event.target));
    if(!inside) closeMenu(false);
  });

  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if(entry.isIntersecting){
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },{threshold:.12,rootMargin:"0px 0px -7% 0px"});
    revealElements.forEach(element => revealObserver.observe(element));
  } else {
    revealElements.forEach(element => element.classList.add("is-visible"));
  }

  // I contenuti editoriali sono statici: nessuna composizione carattere per carattere.
  // Le sezioni usano soltanto ingressi CSS sobri e rispettosi di prefers-reduced-motion.

  const worldsSection = document.getElementById("mondi");
  const worldWords = [...document.querySelectorAll(".worlds-word")];

  function clamp(value,min,max){return Math.min(Math.max(value,min),max)}

  function setActiveWorld(index){
    const safe = Math.max(0,Math.min(index,worldWords.length-1));

    worldWords.forEach((world,i) => {
      const link = world.querySelector("a");
      const active = i===safe;

      world.classList.toggle("active",active);

      if(link){
        link.tabIndex = active ? 0 : -1;
        link.setAttribute("aria-hidden",active ? "false" : "true");
      }
    });
  }

  function setupWorldDoorNavigation(){
    worldWords.forEach(world => {
      const link = world.querySelector(".world-door-link");
      if(!link) return;

      link.addEventListener("click", event => {
        const modified = event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0;
        if(modified) return;

        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if(reduced) return;

        event.preventDefault();
        link.classList.add("is-opening");

        window.setTimeout(() => {
          window.location.href = link.href;
        },360);
      });
    });
  }

  function updateWorlds(){
    if(!worldsSection || !worldWords.length) return;

    const rect = worldsSection.getBoundingClientRect();
    const scrollable = Math.max(1,worldsSection.offsetHeight-window.innerHeight);
    const progress = clamp(-rect.top/scrollable,0,1);

    let index = Math.floor(progress*worldWords.length);
    if(index>=worldWords.length) index=worldWords.length-1;

    setActiveWorld(index);
  }

  function onScroll(){
    if(!ticking){
      requestAnimationFrame(() => {
        updateWorlds();
        updateChapterProgress();
        ticking=false;
      });
      ticking=true;
    }
    resetInactivityTimer();
  }

  window.addEventListener("scroll",onScroll,{passive:true});
  window.addEventListener("resize",() => {
    updateWorlds();
    updateChapterProgress();
  },{passive:true});

  function resetInactivityTimer(){
    if(inactivityTimer) clearTimeout(inactivityTimer);
    if(pauseActive || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    inactivityTimer=setTimeout(enterPause,isHomePage ? 120000 : 30000);
  }

  function enterPause(){
    if(pauseActive || menuOpen || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    pauseActive=true;
    pauseRestoreY=window.scrollY;
    body.classList.add("is-paused");
  }

  function leavePause(){
    if(!pauseActive) return;
    pauseActive=false;
    body.classList.remove("is-paused");

    requestAnimationFrame(() => {
      window.scrollTo({top:pauseRestoreY,behavior:"auto"});
    });

    resetInactivityTimer();
  }

  ["pointerdown","touchstart","mousemove","wheel","keydown"].forEach(eventName => {
    window.addEventListener(eventName,() => {
      if(pauseActive){
        leavePause();
        return;
      }
      resetInactivityTimer();
    },{passive:true});
  });

  document.addEventListener("keydown",event => {
    const target = event.target;
    const editable =
      target instanceof HTMLInputElement ||
      target instanceof HTMLTextAreaElement ||
      target instanceof HTMLSelectElement ||
      target.isContentEditable;

    if(editable || menuOpen || event.altKey || event.ctrlKey || event.metaKey) return;

    if(event.key.toLowerCase()==="h") scrollToSection(0);
  });


  // Language: IT and EN are separate static pages (/ and /en/). The toggle only navigates
  // between routes, so no runtime text replacement is needed (and none must overwrite the HTML).
  let currentLanguage = document.documentElement.lang === "en" ? "en" : "it";
  if(languageToggle) languageToggle.addEventListener("click",() => {
    const path = window.location.pathname;
    const inEnglishRoute = /^\/en(?:\/|$)/.test(path);
    const nextPath = inEnglishRoute ? (path.replace(/^\/en(?=\/|$)/, "") || "/") : (path === "/" ? "/en/" : "/en" + path);
    window.location.assign(nextPath + window.location.search + window.location.hash);
  });

  // No analytics or visitor-tracking code is included in this site.

  // Audio ambientale: traccia fornita per il portfolio.
  const ambientAudio = new Audio();
  ambientAudio.preload = "none";
  ambientAudio.loop = true;
  ambientAudio.volume = 0.32;
  ambientAudio.src = new URL("/assets/audio/Weight_of_Intent.mp3", window.location.origin).href;
  let audioPlaying = false;

  // Annunci audio solo per gli screen reader: nessun pannello flottante o controllo volume.
  function showAudioStatus(message){
    if(!audioStatus) return;
    if(audioStatusMessage) audioStatusMessage.textContent = message;
    else audioStatus.textContent = message;
  }

  function updateAudioButton(playing){
    audioPlaying = playing;
    [audioToggle,headerAudioToggle].forEach(button => {
      if(!button) return;
      button.setAttribute("aria-pressed",String(playing));
      button.setAttribute("aria-label",playing ? (currentLanguage === "en" ? "Pause audio" : "Metti in pausa l'audio") : (currentLanguage === "en" ? "Enable audio" : "Attiva audio"));
      const label = button.querySelector(".dock-audio-label, .header-audio-label");
      if(label) label.textContent = playing ? "ON" : "AUDIO";
    });
  }

  [audioToggle,headerAudioToggle].filter(Boolean).forEach(button => {
    button.addEventListener("click",async () => {
      if(audioPlaying){
        ambientAudio.pause();
        updateAudioButton(false);
        showAudioStatus(currentLanguage === "en" ? "Audio paused" : "Audio in pausa");
        return;
      }
      try{
        await ambientAudio.play();
        updateAudioButton(true);
        showAudioStatus(currentLanguage === "en" ? "Audio on" : "Audio attivo");
      }catch(error){
        updateAudioButton(false);
        showAudioStatus(currentLanguage === "en" ? "Audio is not available right now." : "Audio non disponibile al momento.");
      }
    });
  });

  ambientAudio.addEventListener("ended",() => updateAudioButton(false));
  ambientAudio.addEventListener("error",() => {
    updateAudioButton(false);
    showAudioStatus(currentLanguage === "en" ? "Audio unavailable: you can keep browsing normally." : "Audio non disponibile: puoi continuare a navigare normalmente.");
  });
  ambientAudio.addEventListener("pause",() => {
    if(audioPlaying) updateAudioButton(false);
  });



  // La firma si anima ogni volta che il footer entra in vista. Torna su si abilita solo a firma completata.
  const signature = document.querySelector(".signature");
  let signatureCompleteTimer = null;
  function resetSignatureCompletion(){
    if(signatureCompleteTimer){clearTimeout(signatureCompleteTimer);signatureCompleteTimer=null;}
    body.classList.remove("footer-signature-complete");
  }
  function markSignatureComplete(){
    resetSignatureCompletion();
    if(window.matchMedia("(prefers-reduced-motion: reduce)").matches){
      body.classList.add("footer-signature-complete");
      return;
    }
    signatureCompleteTimer = setTimeout(() => {
      if(siteFooter && siteFooter.getBoundingClientRect().top < window.innerHeight && siteFooter.getBoundingClientRect().bottom > 0){
        body.classList.add("footer-signature-complete");
      }
      signatureCompleteTimer = null;
    }, 2350);
  }
  if(signature && siteFooter){
    if("IntersectionObserver" in window){
      const signatureObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if(entry.isIntersecting){
            resetSignatureCompletion();
            signature.classList.remove("is-signing");
            void signature.offsetWidth;
            signature.classList.add("is-signing");
            markSignatureComplete();
          }else{
            resetSignatureCompletion();
            signature.classList.remove("is-signing");
          }
        });
      },{threshold:0.35});
      signatureObserver.observe(siteFooter);
    }else{
      signature.classList.add("is-signing");
      markSignatureComplete();
    }
  }

  updateChapter(0,false);
  setActiveWorld(0);
  setupWorldDoorNavigation();

  updateWorlds();
  updateChapterProgress();
  resetInactivityTimer();

})();


// One shared clock timer updates the hero and footer without duplicate intervals.
(function initLocalClocks(){
  const formatter = new Intl.DateTimeFormat("it-IT", {timeZone:"Europe/Rome", hour:"2-digit", minute:"2-digit", second:"2-digit", hour12:false});
  document.getElementById("footerBackTop")?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" }));
  const update = () => {
    const now = formatter.format(new Date());
    ["heroClock", "footerClock"].forEach(id => { const element = document.getElementById(id); if(element) element.textContent = now; });
    const live = document.querySelector("[data-live-clock]");
    if(live) live.textContent = new Intl.DateTimeFormat(document.documentElement.lang === "en" ? "en-GB" : "it-IT", {timeZone:"Europe/Rome", hour:"2-digit", minute:"2-digit", hour12:false}).format(new Date());
  };
  update();
  window.setInterval(update, 1000);
})();
