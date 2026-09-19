(() => {
  "use strict";

  const CFG = {
    loaderMin: 700,
    loaderMax: 2200,
    revealThreshold: 0.12,
    cursorLerp: 0.18,
    resizeDebounce: 160,
    navOffset: 18,
    transitionMs: 620,
    trajectoryLerp: 0.09,
    trajectoryDrift: 18,
    magneticStrength: 0.12,
    magneticRadius: 90,
    standbyDelay: 45000
  };

  const st = {
    loaded: false,
    menuOpen: false,
    standby: false,
    active: 0,
    reduced: false,
    resizeTimer: 0,
    standbyTimer: 0,
    raf: 0,
    menuReturn: null,
    standbyReturn: null,
    pointer: { x: innerWidth / 2, y: innerHeight / 2 },
    cursor: { x: innerWidth / 2, y: innerHeight / 2 },
    traj: { p: 0, tp: 0, d: 0, td: 0 }
  };

  const q = s => document.querySelector(s);
  const qa = s => [...document.querySelectorAll(s)];
  const dom = {
    html: document.documentElement,
    body: document.body,
    loader: q(".page-loader"),
    transition: q(".page-transition"),
    cursor: q(".custom-cursor"),
    dot: q(".custom-cursor-dot"),
    ring: q(".custom-cursor-ring"),
    header: q(".site-header"),
    menu: q(".site-menu"),
    menuBtn: q(".menu-trigger"),
    menuLinks: qa(".site-menu-nav a"),
    label: q("#progress-current"),
    fill: q("#progress-fill"),
    point: q("#progress-point"),
    prev: q("#previous-section"),
    prevLabel: q("#previous-section-label"),
    next: q("#next-section"),
    nextLabel: q("#next-section-label"),
    sections: qa(".home-section"),
    reveals: qa(".reveal"),
    links: qa(".narrative-link"),
    magnetic: qa(".magnetic"),
    transitionLinks: qa('a[href]:not([target="_blank"])'),
    standby: q(".standby-screen"),
    wake: q(".standby-wake"),
    cta: q(".cta-trajectory"),
    contact: q(".contact-cta"),
    dirLinks: qa(".hero-direction[data-direction]"),
    dirNodes: qa(".direction-node[data-direction]")
  };

  const clamp = (n, a, b) => Math.min(Math.max(n, a), b);
  const lerp = (a, b, t) => a + (b - a) * t;
  const secNum = i => String(i + 1).padStart(2, "0");
  const fine = () => matchMedia("(pointer:fine)").matches;
  const motionOK = () => !st.reduced;
  const section = i => dom.sections[clamp(i, 0, dom.sections.length - 1)] || null;

  function focusables(root) {
    return [...root.querySelectorAll('a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])')]
      .filter(el => !el.hidden && el.offsetParent !== null);
  }

  function setInert(el, value) {
    if (!el) return;
    if ("inert" in el) el.inert = value;
    else value ? el.setAttribute("inert", "") : el.removeAttribute("inert");
  }

  function motionInit() {
    const mq = matchMedia("(prefers-reduced-motion: reduce)");
    const apply = reduced => {
      st.reduced = reduced;
      dom.html.classList.toggle("reduced-motion", reduced);
      if (reduced) closeStandby();
      resetStandby();
    };
    apply(mq.matches);
    mq.addEventListener?.("change", e => apply(e.matches));
  }

  function loaderInit() {
    if (!dom.loader) { st.loaded = true; return; }
    const started = performance.now();
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      const wait = Math.max(0, CFG.loaderMin - (performance.now() - started));
      setTimeout(() => {
        st.loaded = true;
        dom.loader.classList.add("is-hidden");
        setTimeout(() => dom.loader?.remove(), 700);
      }, wait);
    };
    if (document.readyState === "complete") finish();
    else window.addEventListener("load", finish, { once: true });
    setTimeout(finish, CFG.loaderMax);
  }

  function pageTransitionsInit() {
    if (!dom.transition) return;
    dom.transitionLinks.forEach(link => link.addEventListener("click", e => {
      if (st.reduced || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const href = link.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:") || link.hasAttribute("download")) return;
      let url;
      try { url = new URL(href, location.href); } catch { return; }
      if (url.origin !== location.origin || url.pathname === location.pathname && url.search === location.search && url.hash) return;
      e.preventDefault();
      dom.transition.classList.add("is-active");
      setTimeout(() => { location.href = url.href; }, CFG.transitionMs);
    }));
    window.addEventListener("pageshow", () => dom.transition.classList.remove("is-active"));
  }

  function menuOpen() {
    if (!dom.menu || st.menuOpen) return;
    clearStandby();
    st.menuReturn = document.activeElement;
    st.menuOpen = true;
    dom.menu.setAttribute("aria-hidden", "false");
    dom.menuBtn?.setAttribute("aria-expanded", "true");
    dom.menuBtn?.setAttribute("aria-label", "Chiudi menu");
    dom.body.classList.add("is-menu-open");
    setInert(dom.menu, false);
    requestAnimationFrame(() => dom.menuLinks[0]?.focus({ preventScroll: true }));
  }

  function menuClose(restore = true) {
    if (!dom.menu || !st.menuOpen) return;
    st.menuOpen = false;
    dom.menu.setAttribute("aria-hidden", "true");
    dom.menuBtn?.setAttribute("aria-expanded", "false");
    dom.menuBtn?.setAttribute("aria-label", "Apri menu");
    dom.body.classList.remove("is-menu-open");
    setInert(dom.menu, true);
    if (restore) {
      const el = st.menuReturn;
      if (el && document.contains(el) && typeof el.focus === "function") el.focus({ preventScroll: true });
      else dom.menuBtn?.focus({ preventScroll: true });
    }
    st.menuReturn = null;
    resetStandby();
  }

  function menuInit() {
    dom.menuBtn?.addEventListener("click", () => st.menuOpen ? menuClose() : menuOpen());
    dom.menuLinks.forEach(a => a.addEventListener("click", () => menuClose(false)));
    dom.menu?.addEventListener("click", e => { if (e.target === dom.menu) menuClose(); });
    document.addEventListener("keydown", e => {
      if (e.key === "Escape") {
        if (st.menuOpen) { e.preventDefault(); menuClose(); return; }
        if (st.standby) { e.preventDefault(); closeStandby(); }
      }
      if (e.key !== "Tab" || !st.menuOpen) return;
      const els = focusables(dom.menu);
      if (!els.length) return;
      const first = els[0], last = els[els.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  }

  function wowUpdate(i) {
    const s = section(i);
    if (!s) return;
    st.active = i;
    const total = dom.sections.length;
    const p = total > 1 ? i / (total - 1) : 0;
    if (dom.label) dom.label.textContent = s.dataset.sectionTitle || "";
    if (dom.fill) dom.fill.style.width = `${p * 100}%`;
    if (dom.point) dom.point.style.left = `${p * 100}%`;
    const first = i === 0, last = i === total - 1;
    dom.prev?.classList.toggle("is-disabled", first);
    dom.prev?.setAttribute("aria-hidden", String(first));
    first ? dom.prev?.setAttribute("tabindex", "-1") : dom.prev?.removeAttribute("tabindex");
    if (!first) { dom.prev.href = `#${secNum(i - 1)}`; dom.prev.setAttribute("aria-label", `Vai alla sezione ${secNum(i - 1)}`); dom.prevLabel.textContent = secNum(i - 1); }
    else dom.prevLabel.textContent = "";
    if (last) { dom.next.href = "#01"; dom.next.setAttribute("aria-label", "Torna all'inizio"); dom.nextLabel.textContent = "01"; dom.next.querySelector(".section-jump-arrow").textContent = "↑"; }
    else { dom.next.href = `#${secNum(i + 1)}`; dom.next.setAttribute("aria-label", `Vai alla sezione ${secNum(i + 1)}`); dom.nextLabel.textContent = secNum(i + 1); dom.next.querySelector(".section-jump-arrow").textContent = "→"; }
  }

  function goTo(i, updateHash = true) {
    const s = section(i);
    if (!s) return;
    const y = window.scrollY + s.getBoundingClientRect().top - (dom.header?.offsetHeight || 0) - CFG.navOffset;
    window.scrollTo({ top: Math.max(0, y), behavior: motionOK() ? "smooth" : "auto" });
    if (updateHash && history.replaceState) history.replaceState(null, "", `#${s.id}`);
    if (updateHash) s.setAttribute("tabindex", "-1");
  }

  function wowInit() {
    dom.prev?.addEventListener("click", e => { e.preventDefault(); if (st.active > 0) goTo(st.active - 1); });
    dom.next?.addEventListener("click", e => { e.preventDefault(); goTo(st.active === dom.sections.length - 1 ? 0 : st.active + 1); });
  }

  function activeDetect() {
    if (!dom.sections.length) return;
    const ref = innerHeight * .52;
    let best = st.active, dist = Infinity;
    dom.sections.forEach((s, i) => {
      const r = s.getBoundingClientRect();
      if (r.bottom <= 0 || r.top >= innerHeight) return;
      const d = Math.abs(r.top + r.height / 2 - ref);
      if (d < dist) { dist = d; best = i; }
    });
    if (best !== st.active) wowUpdate(best);
  }

  function revealInit() {
    if (!dom.reveals.length || st.reduced || !("IntersectionObserver" in window)) {
      dom.reveals.forEach(el => el.classList.add("is-visible"));
      return;
    }
    const io = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      io.unobserve(entry.target);
    }), { threshold: CFG.revealThreshold, rootMargin: "0px 0px -8% 0px" });
    dom.reveals.forEach(el => io.observe(el));
  }

  function directionInit() {
    const set = (key, on) => {
      dom.dirLinks.filter(x => x.dataset.direction === key).forEach(x => x.classList.toggle("is-active", on));
      dom.dirNodes.filter(x => x.dataset.direction === key).forEach(x => x.classList.toggle("is-active", on));
    };
    dom.dirLinks.forEach(a => {
      const key = a.dataset.direction;
      a.addEventListener("pointerenter", () => set(key, true));
      a.addEventListener("pointerleave", () => set(key, false));
      a.addEventListener("focusin", () => set(key, true));
      a.addEventListener("focusout", () => set(key, false));
    });
  }

  function narrativeInit() {
    dom.links.forEach(a => {
      const key = a.dataset.trajectoryNode;
      if (!key) return;
      const els = qa(`[data-node="${CSS.escape(key)}"], [data-direction="${CSS.escape(key)}"]`);
      const on = () => els.forEach(el => el.classList.add("is-linked"));
      const off = () => els.forEach(el => el.classList.remove("is-linked"));
      a.addEventListener("pointerenter", on); a.addEventListener("pointerleave", off);
      a.addEventListener("focusin", on); a.addEventListener("focusout", off);
    });
  }

  function cursorInit() {
    if (!dom.cursor || !dom.dot || !dom.ring || !fine() || st.reduced) return;
    document.addEventListener("pointermove", e => { st.pointer.x = e.clientX; st.pointer.y = e.clientY; dom.cursor.classList.add("is-visible"); }, { passive: true });
    qa("a,button").forEach(el => {
      el.addEventListener("pointerenter", () => dom.cursor.classList.add("is-hovering"));
      el.addEventListener("pointerleave", () => dom.cursor.classList.remove("is-hovering"));
    });
    window.addEventListener("pointerleave", () => dom.cursor.classList.remove("is-visible", "is-hovering"));
  }

  function cursorFrame() {
    if (!dom.cursor || !dom.dot || !dom.ring || !fine() || st.reduced) return false;
    st.cursor.x = lerp(st.cursor.x, st.pointer.x, CFG.cursorLerp);
    st.cursor.y = lerp(st.cursor.y, st.pointer.y, CFG.cursorLerp);
    dom.dot.style.transform = `translate3d(${st.pointer.x}px,${st.pointer.y}px,0) translate(-50%,-50%)`;
    dom.ring.style.transform = `translate3d(${st.cursor.x}px,${st.cursor.y}px,0) translate(-50%,-50%)`;
    return true;
  }

  function magneticInit() {
    if (!fine() || st.reduced) return;
    dom.magnetic.forEach(el => {
      el.addEventListener("pointermove", e => {
        const r = el.getBoundingClientRect(), dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2), d = Math.hypot(dx, dy);
        if (d > CFG.magneticRadius) return;
        const k = CFG.magneticStrength * (1 - d / CFG.magneticRadius);
        el.style.setProperty("--magnetic-x", `${dx * k}px`); el.style.setProperty("--magnetic-y", `${dy * k}px`);
      }, { passive: true });
      el.addEventListener("pointerleave", () => { el.style.setProperty("--magnetic-x", "0px"); el.style.setProperty("--magnetic-y", "0px"); });
    });
  }

  function ctaInit() {
    if (!dom.cta || !dom.contact) return;
    const on = () => dom.cta.classList.add("is-engaged"), off = () => dom.cta.classList.remove("is-engaged");
    dom.contact.addEventListener("pointerenter", on); dom.contact.addEventListener("pointerleave", off); dom.contact.addEventListener("focusin", on); dom.contact.addEventListener("focusout", off);
  }

  function clearStandby() { if (st.standbyTimer) { clearTimeout(st.standbyTimer); st.standbyTimer = 0; } }
  function openStandby() {
    if (st.menuOpen || st.standby || st.reduced || !dom.standby || document.hidden || innerWidth < 700) return;
    st.standby = true; st.standbyReturn = document.activeElement; clearStandby();
    dom.body.classList.add("is-standby"); dom.standby.classList.add("is-active"); dom.standby.setAttribute("aria-hidden", "false"); setInert(dom.standby, false);
    dom.wake?.focus({ preventScroll: true });
  }
  function closeStandby() {
    if (!st.standby || !dom.standby) return;
    st.standby = false; dom.body.classList.remove("is-standby"); dom.standby.classList.remove("is-active"); dom.standby.setAttribute("aria-hidden", "true"); setInert(dom.standby, true);
    const el = st.standbyReturn; st.standbyReturn = null;
    if (el && document.contains(el) && typeof el.focus === "function") requestAnimationFrame(() => el.focus({ preventScroll: true }));
    resetStandby();
  }
  function resetStandby() {
    clearStandby();
    if (st.menuOpen || st.standby || st.reduced || document.hidden || innerWidth < 700) return;
    st.standbyTimer = setTimeout(openStandby, CFG.standbyDelay);
  }
  function standbyInit() {
    if (!dom.standby) return;
    setInert(dom.standby, true);
    dom.wake?.addEventListener("click", closeStandby);
    dom.standby.addEventListener("keydown", e => {
      if (!st.standby || e.key !== "Tab") return;
      e.preventDefault(); dom.wake?.focus({ preventScroll: true });
    });
    ["pointerdown","wheel","touchstart","scroll"].forEach(type => window.addEventListener(type, () => st.standby ? closeStandby() : resetStandby(), { passive: true }));
    document.addEventListener("visibilitychange", () => document.hidden ? clearStandby() : resetStandby());
  }

  function trajectoryTargets() {
    if (dom.sections.length < 2) return;
    const first = dom.sections[0].getBoundingClientRect(), last = dom.sections.at(-1).getBoundingClientRect();
    const start = first.top + scrollY, end = last.bottom + scrollY - innerHeight, range = end - start;
    st.traj.tp = range <= 0 ? 0 : clamp((scrollY - start) / range, 0, 1);
    st.traj.td = st.reduced ? 0 : Math.sin(st.traj.tp * Math.PI * 2) * CFG.trajectoryDrift;
  }
  function trajectoryFrame() {
    st.traj.p = st.reduced ? st.traj.tp : lerp(st.traj.p, st.traj.tp, CFG.trajectoryLerp);
    st.traj.d = st.reduced ? 0 : lerp(st.traj.d, st.traj.td, CFG.trajectoryLerp);
    dom.html.style.setProperty("--trajectory-drift", `${st.traj.d.toFixed(2)}px`);
  }

  function raf() {
    const cursorActive = cursorFrame();
    trajectoryFrame();
    if (cursorActive || Math.abs(st.traj.d - st.traj.td) > 0.02) st.raf = requestAnimationFrame(raf);
    else st.raf = 0;
  }
  function wakeRaf() { if (!st.raf) st.raf = requestAnimationFrame(raf); }

  function hashInit() {
    const raw = location.hash.slice(1);
    const i = dom.sections.findIndex(s => s.id === raw);
    if (i < 0) return;
    setTimeout(() => goTo(i, false), st.reduced ? 0 : 300);
  }

  function keyboardInit() {
    document.addEventListener("keydown", e => {
      if (st.menuOpen || st.standby || !dom.sections.length) return;
      if (e.key !== "PageDown" && e.key !== "PageUp") return;
      e.preventDefault(); goTo(clamp(st.active + (e.key === "PageDown" ? 1 : -1), 0, dom.sections.length - 1));
    });
  }

  function scrollInit() {
    let ticking = false;
    window.addEventListener("scroll", () => {
      resetStandby(); wakeRaf();
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => { activeDetect(); trajectoryTargets(); ticking = false; });
    }, { passive: true });
  }

  function resizeInit() {
    window.addEventListener("resize", () => {
      clearTimeout(st.resizeTimer);
      st.resizeTimer = setTimeout(() => { activeDetect(); trajectoryTargets(); wowUpdate(st.active); resetStandby(); wakeRaf(); }, CFG.resizeDebounce);
    }, { passive: true });
  }

  function setInitial() {
    if (!dom.sections.length) return;
    st.active = 0; wowUpdate(0); trajectoryTargets(); resetStandby();
  }

  function init() {
    motionInit(); loaderInit(); pageTransitionsInit(); menuInit(); wowInit(); revealInit(); directionInit(); narrativeInit(); cursorInit(); magneticInit(); ctaInit(); standbyInit(); hashInit(); keyboardInit(); setInitial(); activeDetect(); trajectoryTargets(); wakeRaf();
    document.addEventListener("visibilitychange", () => { if (document.hidden && st.raf) { cancelAnimationFrame(st.raf); st.raf = 0; } else if (!document.hidden) wakeRaf(); });
    scrollInit(); resizeInit();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
