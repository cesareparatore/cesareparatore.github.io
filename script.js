const chapters = [
  { id: "01", title: "IL MOVIMENTO È SOLO L'INIZIO." },
  { id: "02", title: "LA DOMANDA È CAMBIATA." },
  { id: "03", title: "UNA STRADA NON ERA ABBASTANZA." },
  { id: "04", title: "POI HO CAPITO CHE NON ERANO CINQUE STRADE." },
  { id: "05", title: "A QUEL PUNTO, MI SONO FERMATO." },
  { id: "06", title: "OGGI SO ANCHE DA DOVE PARTO." },
  { id: "07", title: "LA BASE È QUI. LA DIREZIONE, NO." },
  { id: "08", title: "ORA QUESTA DIREZIONE PRENDE FORMA." },
  { id: "09", title: "FORSE È QUI CHE LA STORIA CAMBIA." },
  { id: "10", title: "PARTIAMO DA QUELLO." }
];

const state = {
  chapter: 1,
  chapterProgress: 0,
  globalProgress: 0,
  scrollDirection: 1,
  reducedMotion: false,
  menuOpen: false,
  idle: false,
  loaderComplete: false
};

const root = document.documentElement;

const progressCurrent = document.getElementById("progress-current");
const progressFill = document.getElementById("progress-fill");
const progressPoint = document.getElementById("progress-point");

const previousSection = document.getElementById("previous-section");
const previousSectionLabel = document.getElementById("previous-section-label");

const nextSection = document.getElementById("next-section");
const nextSectionLabel = document.getElementById("next-section-label");

const sections = chapters
  .map((chapter) => document.getElementById(chapter.id))
  .filter(Boolean);


/* ---------------------------------------------------------
   UTILS
--------------------------------------------------------- */

const clamp = (value, min = 0, max = 1) => {
  return Math.min(max, Math.max(min, value));
};


/* ---------------------------------------------------------
   ACTIVE CHAPTER
--------------------------------------------------------- */

function getActiveChapter() {
  if (!sections.length) return 1;

  /*
   * The active chapter is the section whose visual center
   * is closest to the viewport center.
   *
   * This works correctly with sticky cinematic sections,
   * normal sections and direct hash navigation.
   */
  const viewportCenter = window.innerHeight * 0.5;

  let closestIndex = 0;
  let closestDistance = Infinity;

  sections.forEach((section, index) => {
    const rect = section.getBoundingClientRect();

    /*
     * A sticky chapter occupies the viewport, so its center
     * remains close to the viewport center.
     */
    const sectionCenter = rect.top + rect.height * 0.5;
    const distance = Math.abs(sectionCenter - viewportCenter);

    if (distance < closestDistance) {
      closestDistance = distance;
      closestIndex = index;
    }
  });

  return closestIndex + 1;
}


/* ---------------------------------------------------------
   CHAPTER PROGRESS
--------------------------------------------------------- */

function getChapterProgress(chapterIndex) {
  const section = sections[chapterIndex - 1];

  if (!section) return 0;

  const rect = section.getBoundingClientRect();

  /*
   * Progress through the section.
   * For sticky stages this represents the portion of the
   * section's scroll duration already consumed.
   */
  const scrollableDistance = Math.max(
    1,
    rect.height - window.innerHeight
  );

  const progress = -rect.top / scrollableDistance;

  return clamp(progress);
}


/* ---------------------------------------------------------
   GLOBAL PROGRESS
--------------------------------------------------------- */

function getGlobalProgress() {
  const maxScroll =
    document.documentElement.scrollHeight - window.innerHeight;

  if (maxScroll <= 0) return 0;

  return clamp(window.scrollY / maxScroll);
}


/* ---------------------------------------------------------
   EXPERIENCE STATE
--------------------------------------------------------- */

function resolveExperience() {
  const previousScrollY = state.scrollY || window.scrollY;

  state.scrollDirection =
    window.scrollY >= previousScrollY ? 1 : -1;

  state.scrollY = window.scrollY;

  state.chapter = getActiveChapter();
  state.chapterProgress = getChapterProgress(state.chapter);
  state.globalProgress = getGlobalProgress();
}


/* ---------------------------------------------------------
   HEADER
--------------------------------------------------------- */

function renderHeader() {
  const index = state.chapter - 1;
  const current = chapters[index];

  if (!current) return;

  /*
   * CURRENT CHAPTER TITLE
   */
  progressCurrent.textContent = current.title;

  /*
   * PREVIOUS
   */
  if (index > 0) {
    const previous = chapters[index - 1];

    previousSection.href = `#${previous.id}`;
    previousSectionLabel.textContent = previous.id;

    previousSection.classList.remove("is-disabled");
    previousSection.setAttribute(
      "aria-label",
      `Vai alla sezione ${previous.id}`
    );
    previousSection.setAttribute("aria-hidden", "false");
    previousSection.removeAttribute("tabindex");
  } else {
    previousSection.href = "#01";
    previousSectionLabel.textContent = "";

    previousSection.classList.add("is-disabled");
    previousSection.setAttribute(
      "aria-label",
      "Nessuna sezione precedente"
    );
    previousSection.setAttribute("aria-hidden", "true");
    previousSection.setAttribute("tabindex", "-1");
  }

  /*
   * NEXT
   */
  if (index < chapters.length - 1) {
    const next = chapters[index + 1];

    nextSection.href = `#${next.id}`;
    nextSectionLabel.textContent = next.id;

    nextSection.classList.remove("is-disabled");
    nextSection.setAttribute(
      "aria-label",
      `Vai alla sezione ${next.id}`
    );
    nextSection.setAttribute("aria-hidden", "false");
    nextSection.removeAttribute("tabindex");
  } else {
    nextSection.href = "#10";
    nextSectionLabel.textContent = "";

    nextSection.classList.add("is-disabled");
    nextSection.setAttribute(
      "aria-label",
      "Nessuna sezione successiva"
    );
    nextSection.setAttribute("aria-hidden", "true");
    nextSection.setAttribute("tabindex", "-1");
  }

  /*
   * WOW BAR
   */
  const percentage = state.globalProgress * 100;

  progressFill.style.width = `${percentage}%`;
  progressPoint.style.left = `${percentage}%`;

  root.style.setProperty(
    "--chapter-progress",
    state.chapterProgress
  );

  root.style.setProperty(
    "--global-progress",
    state.globalProgress
  );
}


/* ---------------------------------------------------------
   SINGLE FRAME
--------------------------------------------------------- */

let frameRequested = false;

function renderExperience() {
  frameRequested = false;

  resolveExperience();
  renderHeader();

  /*
   * Everything else in the experience should read the same
   * state object from here.
   */
  renderChapterMotion();
}


/* ---------------------------------------------------------
   RAF
--------------------------------------------------------- */

function requestExperienceFrame() {
  if (frameRequested) return;

  frameRequested = true;

  requestAnimationFrame(renderExperience);
}


/* ---------------------------------------------------------
   CHAPTER MOTION
--------------------------------------------------------- */

function renderChapterMotion() {
  root.style.setProperty(
    "--chapter-progress",
    state.chapterProgress
  );

  root.style.setProperty(
    "--global-progress",
    state.globalProgress
  );
}


/* ---------------------------------------------------------
   SCROLL
--------------------------------------------------------- */

window.addEventListener(
  "scroll",
  requestExperienceFrame,
  { passive: true }
);


/* ---------------------------------------------------------
   RESIZE
--------------------------------------------------------- */

window.addEventListener(
  "resize",
  requestExperienceFrame,
  { passive: true }
);


/* ---------------------------------------------------------
   HASH / DIRECT NAVIGATION
--------------------------------------------------------- */

function navigateToChapter(id) {
  const target = document.getElementById(id);

  if (!target) return;

  const headerHeight =
    parseFloat(
      getComputedStyle(root)
        .getPropertyValue("--header-height")
    ) || 0;

  const targetTop =
    window.scrollY +
    target.getBoundingClientRect().top -
    headerHeight;

  window.scrollTo({
    top: Math.max(0, targetTop),
    behavior: state.reducedMotion
      ? "auto"
      : "smooth"
  });
}

document.addEventListener("click", (event) => {
  const link = event.target.closest(
    'a[href^="#0"], a[href="#01"], a[href="#02"], a[href="#03"], a[href="#04"], a[href="#05"], a[href="#06"], a[href="#07"], a[href="#08"], a[href="#09"], a[href="#10"]'
  );

  if (!link) return;

  const id = link.getAttribute("href").slice(1);
  const target = document.getElementById(id);

  if (!target) return;

  event.preventDefault();

  navigateToChapter(id);

  history.pushState(null, "", `#${id}`);
});


/* ---------------------------------------------------------
   INITIALIZATION
--------------------------------------------------------- */

function initializeExperience() {
  resolveExperience();
  renderHeader();
  renderChapterMotion();
}

if (document.readyState === "loading") {
  document.addEventListener(
    "DOMContentLoaded",
    initializeExperience,
    { once: true }
  );
} else {
  initializeExperience();
}
