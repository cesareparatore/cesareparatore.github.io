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

  if(window.matchMedia("(prefers-reduced-motion: reduce)").matches){
    screen.remove();
    window.dispatchEvent(new Event("sitePreloaderFinished"));
    return;
  }
  if(document.readyState === "complete") finish();
  else window.addEventListener("load", finish, {once:true});
  // Never allow a stalled external or local resource to trap the visitor behind the intro.
  window.setTimeout(finish, 2500);
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
  const isHomePage = body.dataset.pageLabel === "GUARDA";
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
    if(window.matchMedia("(prefers-reduced-motion: reduce)").matches){
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
      headerChapter.classList.add("is-changing");
      if(chapterLabelTimer) window.clearTimeout(chapterLabelTimer);
      chapterLabelTimer = window.setTimeout(() => {
        chapterLabel.textContent = current.label;
        headerChapter.classList.remove("is-changing");
      },120);
    }else{
      chapterLabel.textContent = current.label;
    }

    chapterPrev.disabled = safe === 0;

    if(safe === sections.length-1){
      chapterNext.innerHTML = '<svg class="direction-arrow-icon" aria-hidden="true" focusable="false" viewBox="0 0 16 16"><path d="M6 3 1.5 7.5 6 12M2 7.5h7a4 4 0 0 1 0 8h-1"/></svg>';
      chapterNext.setAttribute("aria-label","Torna all'inizio");
    }else{
      chapterNext.innerHTML = '<svg class="direction-arrow-icon" aria-hidden="true" focusable="false" viewBox="0 0 16 16"><path d="M2.5 8h11M9 3.5 13.5 8 9 12.5"/></svg>';
      chapterNext.setAttribute("aria-label","Capitolo successivo");
    }

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

  chapterPrev?.addEventListener("click",() => {
    if(currentSectionIndex>0) scrollToSection(currentSectionIndex-1);
  });

  chapterNext?.addEventListener("click",() => {
    if(currentSectionIndex===sections.length-1){
      const footer = document.querySelector(".site-footer");
      if(footer){
        footer.scrollIntoView({
          behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
          block:"start"
        });
      }
    }else{
      scrollToSection(currentSectionIndex+1);
    }
  });

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

    if(menuOpen && (atHero || atFooter) && lastMenuTrigger === dockMenuToggle) lastMenuTrigger = menuToggle;
    if(menuOpen && floatingChapterMode && lastMenuTrigger === menuToggle) lastMenuTrigger = dockMenuToggle;
  }
  window.addEventListener("scroll", updateMenuPlacement, {passive:true});
  window.addEventListener("resize", updateMenuPlacement);

  let menuOpen = false;
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

  // Un solo ritmo di scrittura per TUTTE le sezioni: intervallo costante tra ogni carattere.
  // Titoli, paragrafi e link condividono la stessa sequenza e la stessa temporizzazione.
  const WRITING_CHARACTER_INTERVAL = 0.04;
  const writingCopies = [...document.querySelectorAll(".writing-copy")];
  writingCopies.forEach(copy => {
    const section = copy.closest(".chapter-section") || copy;
    const targets = [...copy.querySelectorAll("[data-reveal]")];
    let characterIndex = 0;

    const wrapTextNodes = node => {
      [...node.childNodes].forEach(child => {
        if(child.nodeType === Node.TEXT_NODE && child.nodeValue){
          // Keep each text run inside one wrapper so flex links do not treat every character as a separate item.
          const group = document.createElement("span");
          group.className = "writing-char-group";
          for(const character of child.nodeValue){
            const span = document.createElement("span");
            span.className = "writing-char";
            span.style.setProperty("--char-delay", `${characterIndex * WRITING_CHARACTER_INTERVAL}s`);
            span.textContent = character;
            group.appendChild(span);
            characterIndex++;
          }
          child.replaceWith(group);
        }else if(child.nodeType === Node.ELEMENT_NODE && !child.classList.contains("writing-char")){
          wrapTextNodes(child);
        }
      });
    };

    targets.forEach(element => {
      const accessibleText = element.textContent.trim();
      // Keep paragraph and heading text exposed to assistive technology; label only links.
      if(element.matches("a")) element.setAttribute("aria-label",accessibleText.replace(/\s*[↗→]\s*$/,""));
      wrapTextNodes(element);
    });

    // Il CTA resta nel flusso di scrittura: i suoi caratteri compaiono dopo il testo precedente.

    if("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches){
      let writingTimer = null;
      const writingObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if(entry.isIntersecting){
            if(writingTimer) window.clearTimeout(writingTimer);
            copy.classList.remove("is-writing");
            void copy.offsetWidth;
            // GUARDA parte solo quando il sipario ha finito davvero di aprirsi.
            const beginWriting = () => {
              writingTimer = window.setTimeout(() => {
                if(section.getBoundingClientRect().bottom > 0 && section.getBoundingClientRect().top < window.innerHeight){
                  copy.classList.add("is-writing");
                  copy.dispatchEvent(new Event("territoryWritingStarted"));
                }
              }, copy.classList.contains("hero-writing-copy") ? 260 : 0);
            };
            if(copy.classList.contains("hero-writing-copy") && !body.classList.contains("hero-intro-open")) {
              window.addEventListener("heroIntroOpened", beginWriting, {once:true});
            } else beginWriting();
          }else{
            if(writingTimer) window.clearTimeout(writingTimer);
            copy.classList.remove("is-writing");
          }
        });
      },{threshold:0.3});
      writingObserver.observe(section);
    }else{
      copy.classList.add("is-writing");
    }
  });

  // Reveal the scroll prompt after GUARDA finishes, with a fail-safe so it can never remain hidden.
  (() => {
    const heroCopy = document.querySelector(".hero-writing-copy");
    const heroBottom = document.querySelector(".hero-bottomline");
    const heroTitle = document.querySelector(".hero-title[data-reveal]");
    if (!heroCopy || !heroBottom || !heroTitle) return;

    let revealed = false;
    let startedAt = 0;
    const reveal = () => {
      if (revealed) return;
      revealed = true;
      heroBottom.classList.add("is-scroll-visible");
    };
    const check = () => {
      if (revealed) return;
      if (!startedAt && document.body.classList.contains("hero-intro-open")) startedAt = Date.now();
      const chars = [...heroTitle.querySelectorAll(".writing-char")];
      if (startedAt && heroCopy.classList.contains("is-writing") && chars.length) {
        const lastDelay = chars.reduce((max, char) => Math.max(max, parseFloat(char.style.getPropertyValue("--char-delay")) || 0), 0);
        // Keep the deliberate pause after the final character, then reveal the cue.
        if (Date.now() - startedAt >= lastDelay * 1000 + 900) return reveal();
      }
      // Fail-safe for missing character spans or interrupted animation scripts.
      if (startedAt && Date.now() - startedAt >= 9000) return reveal();
      window.setTimeout(check, 100);
    };
    heroBottom.classList.remove("is-scroll-visible");
    check();
  })();

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


  // Language switcher for the complete home page.
  let currentLanguage = document.documentElement.lang === "en" ? "en" : "it";
  const languageStrings = {
    en: {
      "a.skip-link":"Skip to content", ".pause-label":"PAUSE", ".header-menu-label":"MENU", ".hero-title":"LOOK<span class=\"hero-dot\">.</span>", ".hero-kicker":"CESARE PARATORE", ".hero-edition":"PARTINICO, ITALY",
      ".menu-list .menu-item:nth-child(1) .menu-link":"About me", ".menu-list .menu-item:nth-child(2) .menu-link":"Sport Manager",
      ".menu-list .menu-item:nth-child(3) .menu-link":"Kinesiologist", ".menu-list .menu-item:nth-child(4) .menu-link":"Running Coach",
      ".menu-list .menu-item:nth-child(5) .menu-link":"Trainer", ".menu-list .menu-item:nth-child(6) .menu-link":"Web Designer",
      ".menu-list .menu-item:nth-child(7) .menu-link":"Where I am", ".menu-list .menu-item:nth-child(8) .menu-link":"Contact",
      "#chapterPrev":"Previous chapter", "#chapterNext":"Next chapter", ".story-intro":"The curiosity to understand. The desire to build.",
      ".story-copy p:nth-of-type(2)":"I have always needed to understand how things work. At fourteen, I opened up my first computer to discover its logic; today, that same curiosity guides how I approach problems, ideas and projects.",
      ".story-copy p:nth-of-type(3)":"Over time, I have explored different worlds, from sport to teaching and programming. Different experiences, connected by one common thread: turning complexity into something clear, concrete and useful.",
      ".story-signature-line":"Understanding complex things, making them simple, and building solutions that really work.",
      ".story-more":"Discover who I am <svg class='link-arrow-icon' aria-hidden='true' focusable='false' viewBox='0 0 16 16'><path d='M5 11 11 5M5.5 5H11v5.5'/></svg>", ".worlds-word[data-world='sport-manager'] .world-door-cta":"OPEN", ".worlds-word[data-world='chinesiologo'] .world-door-cta":"OPEN", ".worlds-word[data-world='chinesiologo'] .world-word-label":"KINESIOLOGIST", ".worlds-word[data-world='formatore'] .world-word-label":"TRAINER",
      ".worlds-word[data-world='running-coach'] .world-door-cta":"OPEN", ".worlds-word[data-world='formatore'] .world-door-cta":"OPEN", ".worlds-word[data-world='web-designer'] .world-door-cta":"OPEN",
      ".principle-title":"PURPOSE<span class=\"principle-title-dot\">.</span>", ".principle-copy p:nth-child(1)":"It is not about everything I can do.", ".principle-copy p:nth-child(2)":"It is about where you want to go.",
      ".principle-copy p:nth-child(3)":"From there, everything changes:<br>what I look at,<br>what I choose,<br>what I connect.", ".principle-copy p:nth-child(4)":"Because there is no one-size-fits-all path.", ".principle-emphasis":"There is the one that works for you.",
      ".territory-kicker":"PARTINICO · WESTERN SICILY", ".territory-title":"HERE<span class=\"territory-title-dot\">.</span>", ".territory-copy p:nth-of-type(1)":"Partinico is my starting point, between Palermo and Trapani.", ".territory-copy p:nth-of-type(2)":"From here, I work with people, ideas and projects across five fields, with the same attention. In person when possible. Online when useful.", ".territory-coverage-intro":"Towns in the reference area", ".territory-coverage-list":"Partinico and the towns identified across the provinces of Palermo and Trapani: Borgetto, Giardinello, Montelepre, Trappeto, Balestrate, Terrasini, Cinisi, Torretta, San Giuseppe Jato, San Cipirello, Piana degli Albanesi, Altofonte, Camporeale, Carini, Monreale, Alcamo and Castellammare del Golfo.", ".territory-coverage-note":"This is a reference area, not a list of additional offices or guaranteed in-person availability. Meeting location and format are agreed before an appointment.", ".territory-next-step":"Discover where I work <svg class='link-arrow-icon' aria-hidden='true' focusable='false' viewBox='0 0 16 16'><path d='M5 11 11 5M5.5 5H11v5.5'/></svg>", ".territory-emphasis":"A place is a starting point, not a boundary.",
      ".territory-caption":"Partinico · Western Sicily", ".territory-map-note":"Stadio Comunale “G. La Franca” is a reference for some local activities, not a professional studio or public-facing business address. Meeting locations are agreed according to the service.", ".contact-overline span:nth-child(2)":"THE NEXT STEP", ".contact-title":"LET’S TALK<span class=\"contact-title-dot\">.</span>", ".contact-lead":"The first step is understanding what you want to make possible.", ".contact-closer":"Let’s see how far we can go together.", "#contactLink":"<span>Message me on WhatsApp</span><span class=\"contact-link-arrow\" aria-hidden=\"true\"><svg class='link-arrow-icon' aria-hidden='true' focusable='false' viewBox='0 0 16 16'><path d='M5 11 11 5M5.5 5H11v5.5'/></svg></span>",
      ".back-to-top-label":"BACK TO TOP", ".footer-privacy":"Privacy <svg class='link-arrow-icon' aria-hidden='true' focusable='false' viewBox='0 0 16 16'><path d='M5 11 11 5M5.5 5H11v5.5'/></svg>"
    },
    it: {
      "a.skip-link":"Salta al contenuto", ".pause-label":"PAUSA", ".hero-title":"GUARDA<span class=\"hero-dot\">.</span>", ".hero-kicker":"CESARE PARATORE", ".hero-edition":"PARTINICO, IT",
      ".menu-list .menu-item:nth-child(1) .menu-link":"Chi sono", ".menu-list .menu-item:nth-child(2) .menu-link":"Sport Manager",
      ".menu-list .menu-item:nth-child(3) .menu-link":"Chinesiologo", ".menu-list .menu-item:nth-child(4) .menu-link":"Running Coach",
      ".menu-list .menu-item:nth-child(5) .menu-link":"Formatore", ".menu-list .menu-item:nth-child(6) .menu-link":"Web Designer",
      ".menu-list .menu-item:nth-child(7) .menu-link":"Dove sono", ".menu-list .menu-item:nth-child(8) .menu-link":"Contatti",
      ".story-intro":"La curiosità di capire. Il desiderio di costruire.",
      ".story-copy p:nth-of-type(2)":"Ho sempre avuto bisogno di capire come funzionano le cose. A quattordici anni aprivo il mio primo computer per scoprirne la logica; oggi quella stessa curiosità guida il mio modo di affrontare problemi, idee e progetti.",
      ".story-copy p:nth-of-type(3)":"Nel tempo ho esplorato mondi diversi, dallo sport all’insegnamento, fino alla programmazione. Esperienze differenti, unite da un unico filo conduttore: trasformare la complessità in qualcosa di chiaro, concreto e utile.",
      ".story-signature-line":"Capire le cose complesse, renderle semplici e costruire soluzioni che funzionano davvero.", ".story-more":"Scopri chi sono <svg class='link-arrow-icon' aria-hidden='true' focusable='false' viewBox='0 0 16 16'><path d='M5 11 11 5M5.5 5H11v5.5'/></svg>",
      ".worlds-word[data-world='sport-manager'] .world-door-cta":"APRI", ".worlds-word[data-world='chinesiologo'] .world-door-cta":"APRI", ".worlds-word[data-world='chinesiologo'] .world-word-label":"CHINESIOLOGO", ".worlds-word[data-world='formatore'] .world-word-label":"FORMATORE", ".worlds-word[data-world='running-coach'] .world-door-cta":"APRI", ".worlds-word[data-world='formatore'] .world-door-cta":"APRI", ".worlds-word[data-world='web-designer'] .world-door-cta":"APRI",
      ".principle-title":"OBIETTIVO<span class=\"principle-title-dot\">.</span>", ".principle-copy p:nth-child(1)":"Il punto non è tutto ciò che so fare.", ".principle-copy p:nth-child(2)":"Il punto è dove vuoi arrivare.", ".principle-copy p:nth-child(3)":"Da lì cambia tutto:<br>ciò che guardo,<br>ciò che scelgo,<br>ciò che metto in relazione.", ".principle-copy p:nth-child(4)":"Perché non esiste una strada uguale per tutti.", ".principle-emphasis":"Esiste quella che serve a te.",
      ".territory-kicker":"PARTINICO · SICILIA OCCIDENTALE", ".territory-title":"QUI<span class=\"territory-title-dot\">.</span>", ".territory-copy p:nth-of-type(1)":"Partinico è il mio punto di partenza, tra Palermo e Trapani.", ".territory-copy p:nth-of-type(2)":"Da qui incontro persone, idee e progetti in cinque ambiti diversi, con la stessa attenzione. In presenza a Partinico e nell’area tra Palermo e Trapani, secondo il servizio e la disponibilità concordata. Online, quando serve.", ".territory-coverage-intro":"Comuni del bacino di riferimento", ".territory-coverage-list":"Partinico e comuni indicati tra le province di Palermo e Trapani: Borgetto, Giardinello, Montelepre, Trappeto, Balestrate, Terrasini, Cinisi, Torretta, San Giuseppe Jato, San Cipirello, Piana degli Albanesi, Altofonte, Camporeale, Carini, Monreale, Alcamo e Castellammare del Golfo.", ".territory-coverage-note":"L’elenco descrive il bacino di riferimento, non sedi secondarie o disponibilità garantite. Il luogo dell’incontro e la modalità si concordano prima dell’appuntamento.", ".territory-next-step":"Scopri dove opero <span aria-hidden='true'><svg class='link-arrow-icon' aria-hidden='true' focusable='false' viewBox='0 0 16 16'><path d='M5 11 11 5M5.5 5H11v5.5'/></svg></span>", ".territory-emphasis":"Il luogo è un punto di partenza, non un confine.", ".territory-caption":"Partinico · Sicilia occidentale", ".territory-map-note":"Lo Stadio Comunale “G. La Franca” è un riferimento per alcune attività sul territorio: non è uno studio professionale né una sede aperta al pubblico. Il luogo dell’incontro si concorda in base al servizio.", ".contact-overline span:nth-child(2)":"IL PROSSIMO PASSO", ".contact-title":"PARLIAMONE<span class=\"contact-title-dot\">.</span>", ".contact-lead":"Il primo passo è capire cosa vuoi rendere possibile.", ".contact-closer":"Vediamo fin dove possiamo arrivare insieme.", "#contactLink":"<span>Scrivimi su WhatsApp</span><span class=\"contact-link-arrow\" aria-hidden=\"true\"><svg class='link-arrow-icon' aria-hidden='true' focusable='false' viewBox='0 0 16 16'><path d='M5 11 11 5M5.5 5H11v5.5'/></svg></span>", ".back-to-top-label":"TORNA SU", ".footer-privacy":"Privacy <svg class='link-arrow-icon' aria-hidden='true' focusable='false' viewBox='0 0 16 16'><path d='M5 11 11 5M5.5 5H11v5.5'/></svg>"
    }
  };
  const originalMarkup = new Map();
  Object.keys(languageStrings.it).forEach(selector => {
    const element = document.querySelector(selector);
    if(element) originalMarkup.set(selector, element.innerHTML);
  });
  const chapterLabels = {it:["GUARDA","STORIA","OGGI","PRINCIPIO","DOVE SONO","CONTATTO"],en:["LOOK","STORY","TODAY","PURPOSE","LOCATION","CONTACT"]};
  function setLanguage(language){
    currentLanguage = language === "en" ? "en" : "it";
    document.documentElement.lang = currentLanguage;
    if(isHomePage){
      document.title = currentLanguage === "en" ? "Cesare Paratore | Sport, movement, training and web in Partinico" : "Cesare Paratore | Sport Manager e Chinesiologo a Partinico";
      const descriptions = {
        it: "Cesare Paratore, Sport Manager e Chinesiologo a Partinico. Attività motoria, running coaching, formazione e progetti digitali; modalità concordate in base al servizio.",
        en: "Cesare Paratore is a Sport Manager and Kinesiologist based in Partinico, Sicily. Services include movement, running coaching, training and digital projects, with arrangements depending on the service."
      };
      const description = descriptions[currentLanguage];
      const localeMeta = document.querySelector("meta[property=\"og:locale\"]");
      if(localeMeta) localeMeta.setAttribute("content", currentLanguage === "en" ? "en_US" : "it_IT");
      [
        ["meta[name=\"description\"]", "content"],
        ["meta[property=\"og:description\"]", "content"],
        ["meta[name=\"twitter:description\"]", "content"]
      ].forEach(([selector, attribute]) => { const meta = document.querySelector(selector); if(meta) meta.setAttribute(attribute, description); });
      const socialTitle = document.querySelector("meta[property=\"og:title\"]");
      const twitterTitle = document.querySelector("meta[name=\"twitter:title\"]");
      const localizedTitle = currentLanguage === "en" ? document.title : "Cesare Paratore | Sport Manager e Chinesiologo a Partinico";
      if(socialTitle) socialTitle.setAttribute("content", localizedTitle);
      if(twitterTitle) twitterTitle.setAttribute("content", localizedTitle);
    }
    if(languageToggle){languageToggle.setAttribute("aria-pressed",String(currentLanguage === "en"));languageToggle.setAttribute("aria-label",currentLanguage === "en" ? "Switch language to Italian" : "Switch language to English");}
    Object.keys(languageStrings.it).forEach(selector => {
      const element = document.querySelector(selector);
      if(!element) return;
      const value = currentLanguage === "it" ? originalMarkup.get(selector) : languageStrings.en[selector];
      if(value !== undefined && value !== null) element.innerHTML = value;
    });
    const heroCopy = document.querySelector("[data-hero-copy]");
    const heroScroll = document.querySelector("[data-hero-scroll]");
    if(heroCopy) heroCopy.textContent = currentLanguage === "en" ? "Sport Manager and Kinesiologist in Partinico. Movement, running coaching, training and digital projects." : "Sport Manager e Chinesiologo a Partinico. Attività motoria, running coaching, formazione e progetti digitali.";
    if(heroScroll) heroScroll.textContent = currentLanguage === "en" ? "SCROLL TO EXPLORE" : "SCORRI PER ESPLORARE";
    // Translation replaces HTML nodes; rebuild the character spans so English uses the same typewriter effect.
    const writingInterval = 0.04;
    document.querySelectorAll(".writing-copy").forEach(copy => {
      copy.querySelectorAll(".writing-char").forEach(span => span.replaceWith(document.createTextNode(span.textContent || "")));
      copy.querySelectorAll(".writing-char-group").forEach(group => group.replaceWith(document.createTextNode(group.textContent || "")));
      let charIndex = 0;
      const wrapTextNodes = node => {
        [...node.childNodes].forEach(child => {
          if(child.nodeType === Node.TEXT_NODE && child.nodeValue) {
            const group = document.createElement("span");
            group.className = "writing-char-group";
            for(const character of child.nodeValue) {
              const span = document.createElement("span");
              span.className = "writing-char";
              span.style.setProperty("--char-delay", `${charIndex * writingInterval}s`);
              span.textContent = character;
              group.appendChild(span);
              charIndex++;
            }
            child.replaceWith(group);
          } else if(child.nodeType === Node.ELEMENT_NODE && !child.classList.contains("writing-char")) wrapTextNodes(child);
        });
      };
      copy.querySelectorAll("[data-reveal]").forEach(target => {
        const accessibleText = target.textContent.trim();
        // Do not put aria-label on generic paragraphs: preserve their text as normal accessible content.
        if(target.matches("a")) target.setAttribute("aria-label", accessibleText.replace(/\s*[↗→]\s*$/, ""));
        wrapTextNodes(target);
      });
      const section = copy.closest(".chapter-section") || copy;
      copy.classList.remove("is-writing");
      if(section.getBoundingClientRect().bottom > 0 && section.getBoundingClientRect().top < window.innerHeight) {
        requestAnimationFrame(() => copy.classList.add("is-writing"));
      }
    });
    sections.forEach((section,index) => { section.label = chapterLabels[currentLanguage][index]; });
    if(chapterLabel) chapterLabel.textContent = chapterLabels[currentLanguage][currentSectionIndex] || chapterLabels[currentLanguage][0];
    if(chapterPrev) chapterPrev.setAttribute("aria-label",currentLanguage === "en" ? "Previous chapter" : "Capitolo precedente");
    if(chapterNext) chapterNext.setAttribute("aria-label",currentLanguage === "en" ? (currentSectionIndex === sections.length-1 ? "Back to top" : "Next chapter") : (currentSectionIndex === sections.length-1 ? "Torna all'inizio" : "Capitolo successivo"));
    const topButton = document.getElementById("backToTop");
    if(topButton){topButton.setAttribute("aria-label",currentLanguage === "en" ? "Back to the top of the page" : "Torna all'inizio della pagina");topButton.title = currentLanguage === "en" ? "Back to top" : "Torna all'inizio";}
    document.querySelectorAll(".world-door-link").forEach(link => { const world = link.closest(".worlds-word")?.dataset.world; const names = currentLanguage === "en" ? {"sport-manager":"Sport Manager","chinesiologo":"Kinesiologist","running-coach":"Running Coach","formatore":"Trainer","web-designer":"Web Designer"} : {"sport-manager":"Sport Manager","chinesiologo":"Chinesiologo","running-coach":"Running Coach","formatore":"Formatore","web-designer":"Web Designer"}; link.setAttribute("aria-label",(currentLanguage === "en" ? "Open " : "Apri ") + (names[world] || "")); });
    updateAudioButton(audioPlaying);
  }
  if(languageToggle) languageToggle.addEventListener("click",() => {
    const path = window.location.pathname;
    const inEnglishRoute = /^\/en(?:\/|$)/.test(path);
    const nextPath = inEnglishRoute ? (path.replace(/^\/en(?=\/|$)/, "") || "/") : (path === "/" ? "/en/" : "/en" + path);
    window.location.assign(nextPath + window.location.search + window.location.hash);
  });

  // Optional analytics hook: emits only if a separate, already-loaded gtag exists.
  // This site package does not load an analytics library itself.
  document.querySelectorAll("[data-analytics-event]").forEach(element => {
    element.addEventListener("click", () => {
      if(typeof window.gtag !== "function") return;
      window.gtag("event", element.dataset.analyticsEvent, {
        event_category: element.dataset.analyticsCategory || "contact",
        event_label: element.dataset.analyticsLabel || "homepage_cta"
      });
    });
  });

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
        showAudioStatus(currentLanguage === "en" ? "Audio file not available at assets/audio/Weight_of_Intent.mp3." : "File audio non disponibile in assets/audio/Weight_of_Intent.mp3.");
      }
    });
  });

  ambientAudio.addEventListener("ended",() => updateAudioButton(false));
  ambientAudio.addEventListener("error",() => {
    updateAudioButton(false);
    showAudioStatus("Audio non disponibile: puoi continuare a navigare normalmente.");
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

  // Apply the current route's language after audio state and all helpers are initialized.
  setLanguage(currentLanguage);
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
  const update = () => {
    const now = formatter.format(new Date());
    ["heroClock", "footerClock"].forEach(id => { const element = document.getElementById(id); if(element) element.textContent = now; });
    const live = document.querySelector("[data-live-clock]");
    if(live) live.textContent = new Intl.DateTimeFormat(document.documentElement.lang === "en" ? "en-GB" : "it-IT", {timeZone:"Europe/Rome", hour:"2-digit", minute:"2-digit", hour12:false}).format(new Date());
  };
  update();
  window.setInterval(update, 1000);
})();
