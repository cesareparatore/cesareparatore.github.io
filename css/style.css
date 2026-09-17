/* ============================================================
   CESARE PARATORE
   MOVIMENTO / CON DIREZIONE.
   MASTER STYLE SYSTEM — 2026
   ============================================================ */


/* ============================================================
   00 — TOKENS
   ============================================================ */

:root {
  --navy: #071b33;
  --navy-2: #0d2949;
  --navy-3: #173d63;

  --black: #07090c;
  --ink: #11161c;
  --muted: #66717d;

  --white: #ffffff;
  --paper: #f5f4ef;
  --paper-2: #ecebe5;
  --line: rgba(7, 27, 51, 0.15);
  --line-dark: rgba(255, 255, 255, 0.18);

  --header-height: 82px;

  --container: 1440px;
  --gutter: clamp(20px, 4vw, 72px);

  --section-space: clamp(110px, 15vw, 240px);

  --display-xl: clamp(4.5rem, 10.7vw, 11.5rem);
  --display-lg: clamp(3.5rem, 7.8vw, 8.5rem);
  --display-md: clamp(2.6rem, 5vw, 5.5rem);

  --body-lg: clamp(1.1rem, 1.55vw, 1.55rem);
  --body-md: clamp(1rem, 1.25vw, 1.2rem);

  --mono-xs: 0.65rem;
  --mono-sm: 0.72rem;

  --radius: 999px;

  --ease-out: cubic-bezier(.16, 1, .3, 1);
  --ease-in-out: cubic-bezier(.65, 0, .35, 1);
  --ease-soft: cubic-bezier(.22, 1, .36, 1);

  --fast: 220ms;
  --medium: 650ms;
  --slow: 1100ms;

  --shadow-soft: 0 30px 90px rgba(7, 27, 51, .08);
}


/* ============================================================
   01 — RESET
   ============================================================ */

*,
*::before,
*::after {
  box-sizing: border-box;
}

html {
  min-height: 100%;
  scroll-behavior: auto;
  background: var(--paper);
}

body {
  min-height: 100%;
  margin: 0;
  background: var(--paper);
  color: var(--ink);
  font-family: "Manrope", system-ui, -apple-system, BlinkMacSystemFont,
    "Segoe UI", sans-serif;
  font-weight: 500;
  line-height: 1.55;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
}

body.menu-open,
body.standby-active {
  overflow: hidden;
}

img,
svg,
video,
canvas {
  display: block;
  max-width: 100%;
}

img {
  height: auto;
}

button,
input,
textarea,
select {
  font: inherit;
}

button,
a {
  -webkit-tap-highlight-color: transparent;
}

button {
  border: 0;
}

a {
  color: inherit;
  text-decoration: none;
}

::selection {
  background: var(--navy);
  color: var(--white);
}


/* ============================================================
   02 — ACCESSIBILITY
   ============================================================ */

.skip-link {
  position: fixed;
  z-index: 10000;
  top: 12px;
  left: 12px;
  padding: 12px 18px;
  background: var(--navy);
  color: var(--white);
  font-size: .8rem;
  font-weight: 700;
  transform: translateY(-160%);
  transition: transform var(--fast) var(--ease-out);
}

.skip-link:focus {
  transform: translateY(0);
}

:focus-visible {
  outline: 2px solid var(--navy);
  outline-offset: 5px;
}

.dark-section :focus-visible,
.chapter-manifesto :focus-visible,
.chapter-contact :focus-visible {
  outline-color: var(--white);
}


/* ============================================================
   03 — TYPOGRAPHY
   ============================================================ */

.eyebrow,
.chapter-meta,
.menu-kicker,
.menu-bottom,
.hero-scroll-label,
.hero-location,
.header-index,
.direction-number,
.trace-item > span,
.territory-label,
.territory-origin span,
.territory-origin small,
.epilogue-meta,
.menu-label,
.menu-close,
.nav-number {
  font-family: "DM Mono", monospace;
  font-size: var(--mono-sm);
  line-height: 1.2;
  letter-spacing: .09em;
  text-transform: uppercase;
}

.eyebrow {
  margin: 0 0 26px;
  color: var(--muted);
}

.display-title {
  max-width: 1100px;
  margin: 0;
  color: var(--navy);
  font-size: var(--display-lg);
  font-weight: 800;
  line-height: .9;
  letter-spacing: -.065em;
  text-wrap: balance;
}

.section-lead {
  max-width: 680px;
  margin: 42px 0 0;
  font-size: var(--body-lg);
  line-height: 1.35;
  letter-spacing: -.02em;
}

.section-lead strong {
  color: var(--navy);
}

.body-copy {
  font-size: var(--body-md);
  line-height: 1.75;
  letter-spacing: -.01em;
}

.body-copy p {
  max-width: 760px;
  margin: 0 0 1.6em;
}

.body-copy strong {
  color: var(--navy);
  font-weight: 800;
}


/* ============================================================
   04 — GLOBAL LAYOUT
   ============================================================ */

.chapter {
  position: relative;
  isolation: isolate;
  overflow: clip;
}

.section-inner,
.manifesto-frame {
  width: min(calc(100% - (var(--gutter) * 2)), var(--container));
  margin-inline: auto;
}

.section-inner {
  position: relative;
  min-height: 100%;
}

.chapter-meta {
  position: absolute;
  z-index: 8;
  top: clamp(30px, 5vw, 72px);
  left: 0;
  display: flex;
  gap: 16px;
  color: var(--muted);
}

.chapter-meta span:first-child {
  color: var(--navy);
}

[data-reveal] {
  opacity: 1;
  transform: none;
}

html.js.reveal-ready [data-reveal] {
  opacity: 0;
  transform: translate3d(0, 34px, 0);
  transition:
    opacity 900ms var(--ease-out),
    transform 1100ms var(--ease-out);
}

html.js.reveal-ready [data-reveal].is-visible {
  opacity: 1;
  transform: translate3d(0, 0, 0);
}

html.js.reveal-ready [data-reveal][data-delay="1"] {
  transition-delay: 90ms;
}

html.js.reveal-ready [data-reveal][data-delay="2"] {
  transition-delay: 180ms;
}

html.js.reveal-ready [data-reveal][data-delay="3"] {
  transition-delay: 270ms;
}


/* ============================================================
   05 — LOADER
   ============================================================ */

.site-loader {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: grid;
  place-items: center;
  background: var(--paper);
  color: var(--navy);
  transition:
    opacity 900ms var(--ease-in-out),
    visibility 900ms var(--ease-in-out);
}

.site-loader.is-hidden {
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
}

.loader-inner {
  width: min(440px, calc(100% - 48px));
}

.loader-brand {
  display: flex;
  justify-content: center;
  margin-bottom: 34px;
}

.loader-mark {
  width: 72px;
  height: 72px;
  object-fit: contain;
}

.loader-copy {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  color: var(--navy);
  font-family: "DM Mono", monospace;
  font-size: .65rem;
  letter-spacing: .08em;
  text-transform: uppercase;
}

.loader-line {
  position: relative;
  width: 100%;
  height: 1px;
  margin-top: 22px;
  overflow: hidden;
  background: rgba(7, 27, 51, .14);
}

.loader-line i {
  position: absolute;
  inset: 0 auto 0 0;
  width: 0;
  background: var(--navy);
  animation: loaderProgress 2.7s var(--ease-in-out) forwards;
}

@keyframes loaderProgress {
  to {
    width: 100%;
  }
}


/* ============================================================
   06 — HEADER
   ============================================================ */

.site-header {
  position: fixed;
  z-index: 500;
  top: 0;
  left: 0;
  width: 100%;
  height: var(--header-height);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding:
    0
    max(var(--gutter), env(safe-area-inset-right))
    0
    max(var(--gutter), env(safe-area-inset-left));
  background: rgba(245, 244, 239, .86);
  border-bottom: 1px solid transparent;
  backdrop-filter: blur(18px) saturate(120%);
  -webkit-backdrop-filter: blur(18px) saturate(120%);
  transition:
    background var(--medium) var(--ease-out),
    border-color var(--medium) var(--ease-out),
    transform var(--medium) var(--ease-out);
}

.site-header.is-scrolled {
  background: rgba(245, 244, 239, .94);
  border-color: var(--line);
}

.site-header.is-hidden {
  transform: translateY(-100%);
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 13px;
  min-width: 0;
}

.brand img {
  width: 42px;
  height: 42px;
  flex: 0 0 auto;
  object-fit: contain;
}

.brand-name {
  color: var(--navy);
  font-family: "DM Mono", monospace;
  font-size: .62rem;
  line-height: 1.1;
  letter-spacing: .07em;
}

.header-right {
  display: flex;
  align-items: center;
  gap: clamp(24px, 3vw, 50px);
}

.header-index {
  display: flex;
  align-items: center;
  gap: 7px;
  color: var(--navy);
}

.index-current {
  min-width: 1.4em;
  font-weight: 500;
}

.index-separator {
  opacity: .35;
}

.index-total {
  opacity: .4;
}

.menu-toggle {
  display: inline-flex;
  align-items: center;
  gap: 14px;
  padding: 8px 0;
  background: transparent;
  color: var(--navy);
  cursor: pointer;
}

.menu-label {
  font-size: .62rem;
}

.menu-icon {
  position: relative;
  width: 28px;
  height: 18px;
}

.menu-icon i {
  position: absolute;
  left: 0;
  width: 100%;
  height: 1px;
  background: currentColor;
  transform-origin: center;
  transition:
    transform var(--medium) var(--ease-out),
    top var(--medium) var(--ease-out);
}

.menu-icon i:first-child {
  top: 5px;
}

.menu-icon i:last-child {
  top: 13px;
}

.menu-toggle[aria-expanded="true"] .menu-icon i:first-child {
  top: 9px;
  transform: rotate(45deg);
}

.menu-toggle[aria-expanded="true"] .menu-icon i:last-child {
  top: 9px;
  transform: rotate(-45deg);
}


/* ============================================================
   07 — FULLSCREEN MENU
   ============================================================ */

.site-menu {
  position: fixed;
  inset: 0;
  z-index: 450;
  visibility: hidden;
  pointer-events: none;
}

.site-menu.is-open {
  visibility: visible;
  pointer-events: auto;
}

.menu-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(7, 27, 51, .35);
  opacity: 0;
  transition: opacity 700ms var(--ease-out);
}

.site-menu.is-open .menu-backdrop {
  opacity: 1;
}

.menu-panel {
  position: absolute;
  inset: 0 0 0 auto;
  width: min(760px, 100%);
  display: flex;
  flex-direction: column;
  padding:
    calc(var(--header-height) + 30px)
    max(var(--gutter), env(safe-area-inset-right))
    max(28px, env(safe-area-inset-bottom))
    max(var(--gutter), env(safe-area-inset-left));
  background: var(--paper);
  transform: translateX(100%);
  transition: transform 900ms var(--ease-out);
}

.site-menu.is-open .menu-panel {
  transform: translateX(0);
}

.menu-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: clamp(45px, 7vh, 80px);
}

.menu-close {
  display: inline-flex;
  align-items: center;
  gap: 14px;
  padding: 8px 0;
  background: transparent;
  color: var(--navy);
  cursor: pointer;
}

.menu-close i {
  position: relative;
  width: 25px;
  height: 18px;
}

.menu-close i::before,
.menu-close i::after {
  content: "";
  position: absolute;
  top: 50%;
  left: 0;
  width: 100%;
  height: 1px;
  background: currentColor;
}

.menu-close i::before {
  transform: rotate(45deg);
}

.menu-close i::after {
  transform: rotate(-45deg);
}

.primary-nav {
  display: grid;
  gap: 2px;
  overflow: auto;
  scrollbar-width: none;
}

.primary-nav::-webkit-scrollbar {
  display: none;
}

.primary-nav a {
  display: grid;
  grid-template-columns: 46px 1fr;
  align-items: baseline;
  gap: 18px;
  padding: 8px 0;
  color: var(--navy);
  transition:
    color var(--fast) ease,
    transform var(--medium) var(--ease-out);
}

.primary-nav a:hover {
  transform: translateX(12px);
}

.nav-number {
  color: var(--muted);
  font-size: .62rem;
}

.nav-label {
  font-size: clamp(1.8rem, 4vw, 3.6rem);
  font-weight: 700;
  line-height: 1;
  letter-spacing: -.055em;
}

.menu-contact {
  margin-top: auto;
  padding-top: 40px;
  border-top: 1px solid var(--line);
}

.menu-contact a {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 12px;
  color: var(--navy);
  font-size: clamp(1.4rem, 2.4vw, 2.2rem);
  font-weight: 800;
  letter-spacing: -.045em;
}

.menu-contact a span {
  font-size: .8em;
  transition: transform var(--medium) var(--ease-out);
}

.menu-contact a:hover span {
  transform: translate(5px, -5px);
}

.menu-bottom {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  margin-top: 28px;
  color: var(--muted);
  font-size: .6rem;
}


/* ============================================================
   08 — SCROLL PROGRESS
   ============================================================ */

.scroll-progress {
  position: fixed;
  z-index: 490;
  top: var(--header-height);
  right: 0;
  width: 2px;
  height: calc(100vh - var(--header-height));
  background: rgba(7, 27, 51, .08);
}

.scroll-progress i {
  display: block;
  width: 100%;
  height: 0;
  background: var(--navy);
  transform-origin: top;
}


/* ============================================================
   09 — HERO
   ============================================================ */

.chapter-hero {
  min-height: 100svh;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding:
    calc(var(--header-height) + 60px)
    var(--gutter)
    70px;
  background: var(--paper);
}

.chapter-grid {
  position: absolute;
  inset: 0;
  z-index: -3;
  opacity: .48;
  background-image:
    linear-gradient(
      to right,
      rgba(7, 27, 51, .055) 1px,
      transparent 1px
    ),
    linear-gradient(
      to bottom,
      rgba(7, 27, 51, .055) 1px,
      transparent 1px
    );
  background-size:
    clamp(70px, 9vw, 150px)
    clamp(70px, 9vw, 150px);
  mask-image: linear-gradient(
    to bottom,
    transparent,
    black 18%,
    black 78%,
    transparent
  );
}

.hero-atmosphere {
  position: absolute;
  inset: 0;
  z-index: -2;
  pointer-events: none;
}

.hero-orbit {
  position: absolute;
  border: 1px solid rgba(7, 27, 51, .13);
  border-radius: 50%;
  transform: translate3d(
    var(--hero-x, 0),
    var(--hero-y, 0),
    0
  );
  transition: transform 1.2s var(--ease-out);
}

.hero-orbit-a {
  width: min(60vw, 780px);
  aspect-ratio: 1;
  top: 12%;
  right: -12%;
}

.hero-orbit-b {
  width: min(42vw, 560px);
  aspect-ratio: 1;
  top: 27%;
  right: 0;
}

.hero-orbit-c {
  width: min(25vw, 340px);
  aspect-ratio: 1;
  top: 38%;
  right: 8%;
}

.hero-node {
  position: absolute;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--navy);
}

.hero-node-a {
  top: 22%;
  right: 20%;
}

.hero-node-b {
  top: 55%;
  right: 8%;
}

.hero-node-c {
  top: 69%;
  right: 28%;
}

.hero-content {
  width: min(1250px, 100%);
  margin-inline: auto;
  padding-top: 5vh;
}

.hero-title {
  margin: 0;
  color: var(--navy);
  font-size: var(--display-xl);
  font-weight: 800;
  line-height: .82;
  letter-spacing: -.085em;
  text-wrap: balance;
}

.hero-title span {
  display: inline-block;
  margin-left: clamp(10px, 7vw, 110px);
  font-weight: 500;
}

.hero-intro {
  width: min(530px, 80%);
  margin:
    clamp(45px, 7vw, 90px)
    0
    0
    auto;
  font-size: clamp(1.05rem, 1.6vw, 1.45rem);
  line-height: 1.4;
  letter-spacing: -.025em;
}

.hero-intro p {
  margin: 0 0 4px;
}

.hero-intro p:last-child {
  color: var(--muted);
}

.hero-bottom {
  position: absolute;
  right: var(--gutter);
  bottom: max(28px, env(safe-area-inset-bottom));
  left: var(--gutter);
  display: grid;
  grid-template-columns: 100px 1fr auto;
  align-items: center;
  gap: 20px;
}

.hero-scroll-label,
.hero-location {
  color: var(--muted);
  font-size: .6rem;
}

.hero-scroll-line {
  position: relative;
  width: 100%;
  height: 1px;
  background: var(--line);
  overflow: hidden;
}

.hero-scroll-line i {
  position: absolute;
  inset: 0 auto 0 0;
  width: 18%;
  background: var(--navy);
  animation: heroLine 2.8s var(--ease-in-out) infinite;
}

@keyframes heroLine {
  0% {
    transform: translateX(-120%);
  }

  50% {
    transform: translateX(450%);
  }

  100% {
    transform: translateX(700%);
  }
}


/* ============================================================
   10 — CENTRO
   ============================================================ */

.chapter-center {
  min-height: 100svh;
  padding:
    clamp(150px, 18vw, 270px)
    0;
  background: var(--white);
}

.center-layout {
  display: grid;
  grid-template-columns: minmax(120px, .35fr) minmax(0, 1fr);
  gap: clamp(50px, 8vw, 150px);
  align-items: start;
}

.center-marker {
  position: sticky;
  top: 30%;
  display: grid;
  place-items: center;
  width: clamp(90px, 11vw, 150px);
  aspect-ratio: 1;
  border: 1px solid var(--line);
  border-radius: 50%;
  color: var(--navy);
  font-family: "DM Mono", monospace;
  font-size: .8rem;
}

.center-marker::before,
.center-marker::after {
  content: "";
  position: absolute;
  border: 1px solid var(--line);
  border-radius: 50%;
}

.center-marker::before {
  inset: 12%;
}

.center-marker::after {
  inset: -15%;
  opacity: .4;
}

.center-copy {
  max-width: 1000px;
}

.lead-question {
  max-width: 850px;
  margin:
    clamp(50px, 8vw, 100px)
    0
    clamp(55px, 8vw, 100px);
  color: var(--navy);
  font-size: clamp(2rem, 4vw, 4.4rem);
  font-weight: 700;
  line-height: .98;
  letter-spacing: -.065em;
}


/* ============================================================
   11 — FIVE DIRECTIONS
   ============================================================ */

.chapter-directions {
  min-height: 100svh;
  padding:
    clamp(150px, 18vw, 250px)
    0
    clamp(120px, 15vw, 220px);
  background: var(--paper);
}

.directions-header {
  max-width: 1050px;
  margin-left: min(17vw, 230px);
}

.directions-system {
  position: relative;
  min-height: 780px;
  margin-top: clamp(90px, 12vw, 160px);
}

.directions-core {
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 4;
  display: grid;
  place-items: center;
  width: clamp(120px, 13vw, 180px);
  aspect-ratio: 1;
  border-radius: 50%;
  background: var(--navy);
  color: var(--white);
  transform: translate(-50%, -50%);
  box-shadow:
    0 0 0 1px rgba(7, 27, 51, .1),
    0 0 0 28px rgba(7, 27, 51, .025);
}

.directions-core::before,
.directions-core::after {
  content: "";
  position: absolute;
  border: 1px solid rgba(7, 27, 51, .16);
  border-radius: 50%;
}

.directions-core::before {
  inset: -65%;
}

.directions-core::after {
  inset: -125%;
  opacity: .5;
}

.directions-core img {
  width: 34%;
  height: 34%;
  object-fit: contain;
  filter: brightness(0) invert(1);
}

.directions-core span {
  position: absolute;
  bottom: 18%;
  font-family: "DM Mono", monospace;
  font-size: .55rem;
  letter-spacing: .12em;
}

.direction-item {
  position: absolute;
  z-index: 5;
  width: min(260px, 23vw);
  padding: 18px;
  border-top: 1px solid var(--navy);
  transition:
    transform 700ms var(--ease-out),
    opacity 400ms ease;
}

.direction-item::before {
  content: "";
  position: absolute;
  top: -4px;
  left: 0;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--navy);
}

.direction-item:hover {
  transform: translateY(-8px);
}

.direction-item h3 {
  margin: 14px 0 12px;
  color: var(--navy);
  font-size: clamp(1.1rem, 1.8vw, 1.65rem);
  font-weight: 800;
  letter-spacing: -.04em;
}

.direction-item p {
  margin: 0;
  color: var(--muted);
  font-size: .92rem;
  line-height: 1.55;
}

.direction-01 {
  top: 5%;
  left: 0;
}

.direction-02 {
  top: 10%;
  right: 0;
}

.direction-03 {
  right: 2%;
  bottom: 4%;
}

.direction-04 {
  bottom: 2%;
  left: 16%;
}

.direction-05 {
  top: 43%;
  left: 4%;
}

.directions-footer {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 30px;
  margin-top: 50px;
  margin-left: min(17vw, 230px);
}

.directions-footer p {
  max-width: 400px;
  margin: 0;
  font-size: clamp(1.2rem, 2vw, 2rem);
  line-height: 1.1;
  letter-spacing: -.04em;
}

.directions-footer strong {
  color: var(--navy);
  font-size: clamp(3rem, 7vw, 7rem);
  line-height: .8;
  letter-spacing: -.08em;
}


/* ============================================================
   12 — PERSONA
   ============================================================ */

.chapter-person {
  min-height: 100svh;
  padding:
    clamp(160px, 19vw, 280px)
    0;
  background: var(--white);
}

.person-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(300px, .85fr);
  gap: clamp(70px, 10vw, 170px);
}

.person-header {
  padding-left: min(8vw, 120px);
}

.display-question {
  max-width: 780px;
  margin:
    clamp(50px, 7vw, 100px)
    0
    0;
  font-size: clamp(1.6rem, 3vw, 3rem);
  line-height: 1.05;
  letter-spacing: -.055em;
}

.person-copy {
  padding-top: clamp(100px, 14vw, 190px);
}


/* ============================================================
   13 — MANIFESTO
   ============================================================ */

.chapter-manifesto {
  min-height: 100svh;
  background: var(--navy);
  color: var(--white);
}

.manifesto-frame {
  min-height: 100svh;
  display: flex;
  align-items: center;
  padding:
    clamp(150px, 17vw, 240px)
    0;
}

.chapter-manifesto .chapter-meta {
  color: rgba(255,255,255,.48);
}

.chapter-manifesto .chapter-meta span:first-child {
  color: var(--white);
}

.manifesto-content {
  width: min(1050px, 100%);
  margin-left: min(9vw, 140px);
}

.chapter-manifesto .eyebrow {
  color: rgba(255,255,255,.5);
}

.manifesto-title {
  margin: 0;
  color: var(--white);
  font-size: var(--display-xl);
  font-weight: 800;
  line-height: .82;
  letter-spacing: -.085em;
}

.manifesto-large {
  margin:
    clamp(40px, 6vw, 70px)
    0;
  color: rgba(255,255,255,.72);
  font-size: clamp(2rem, 4vw, 4.5rem);
  line-height: .95;
  letter-spacing: -.065em;
}

.manifesto-body {
  max-width: 720px;
  color: rgba(255,255,255,.74);
}

.manifesto-body strong {
  color: var(--white);
}

.manifesto-quote {
  max-width: 850px;
  margin:
    clamp(70px, 10vw, 140px)
    0
    0;
  padding-left: 28px;
  border-left: 1px solid rgba(255,255,255,.5);
  color: var(--white);
  font-size: clamp(1.8rem, 3.4vw, 3.8rem);
  font-weight: 600;
  line-height: 1;
  letter-spacing: -.06em;
}


/* ============================================================
   14 — TRACCE
   ============================================================ */

.chapter-traces {
  min-height: 100svh;
  padding:
    clamp(150px, 18vw, 260px)
    0;
  background: var(--paper);
}

.traces-header {
  max-width: 1000px;
  margin-left: min(12vw, 180px);
}

.trace-line {
  position: relative;
  width: calc(100% - min(12vw, 180px));
  height: 1px;
  margin:
    clamp(100px, 13vw, 180px)
    0
    70px
    min(12vw, 180px);
  background: var(--line);
}

.trace-progress {
  position: absolute;
  inset: 0 auto 0 0;
  width: 35%;
  background: var(--navy);
  transform-origin: left;
}

.trace-list {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 20px;
  margin-left: min(12vw, 180px);
}

.trace-item {
  position: relative;
  min-height: 220px;
  padding-top: 22px;
  border-top: 1px solid var(--navy);
}

.trace-item::before {
  content: "";
  position: absolute;
  top: -4px;
  left: 0;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--navy);
}

.trace-item h3 {
  margin: 22px 0 14px;
  color: var(--navy);
  font-size: 1.15rem;
  letter-spacing: -.03em;
}

.trace-item p {
  margin: 0;
  color: var(--muted);
  font-size: .9rem;
  line-height: 1.55;
}

.traces-conclusion {
  max-width: 760px;
  margin:
    100px
    0
    0
    auto;
  font-size: clamp(1.2rem, 2vw, 1.9rem);
  line-height: 1.25;
  letter-spacing: -.035em;
}

.traces-conclusion p {
  margin: 0 0 1.5em;
}

.traces-conclusion strong {
  display: block;
  color: var(--navy);
}


/* ============================================================
   15 — TERRITORIO
   ============================================================ */

.chapter-territory {
  min-height: 100svh;
  padding:
    clamp(150px, 18vw, 260px)
    0;
  background: var(--white);
}

.territory-background {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.territory-grid {
  position: absolute;
  inset: 0;
  opacity: .35;
  background-image:
    linear-gradient(
      to right,
      rgba(7,27,51,.045) 1px,
      transparent 1px
    ),
    linear-gradient(
      to bottom,
      rgba(7,27,51,.045) 1px,
      transparent 1px
    );
  background-size: 120px 120px;
}

.territory-orbit {
  position: absolute;
  border: 1px solid rgba(7,27,51,.09);
  border-radius: 50%;
}

.territory-orbit-a {
  width: 60vw;
  max-width: 900px;
  aspect-ratio: 1;
  top: 8%;
  right: -25%;
}

.territory-orbit-b {
  width: 35vw;
  max-width: 500px;
  aspect-ratio: 1;
  top: 28%;
  right: -3%;
}

.territory-point {
  position: absolute;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--navy);
}

.territory-point-a {
  top: 25%;
  right: 22%;
}

.territory-point-b {
  top: 55%;
  right: 12%;
}

.territory-point-c {
  top: 68%;
  right: 32%;
}

.territory-layout {
  display: grid;
  grid-template-columns: 150px minmax(0, 1fr) 200px;
  gap: clamp(40px, 6vw, 100px);
}

.territory-label {
  padding-top: 10px;
  color: var(--muted);
}

.territory-label span {
  display: block;
  margin-bottom: 5px;
}

.territory-copy {
  max-width: 900px;
}

.territory-origin {
  align-self: end;
  padding-bottom: 5px;
  color: var(--navy);
}

.territory-origin strong {
  display: block;
  margin-top: 12px;
  font-size: clamp(1.5rem, 2.5vw, 2.4rem);
  letter-spacing: -.055em;
}

.territory-origin small {
  display: block;
  margin-top: 6px;
  color: var(--muted);
}

.territory-footer {
  margin:
    clamp(80px, 10vw, 130px)
    0
    0
    min(20vw, 300px);
  font-size: clamp(1.6rem, 3vw, 3.2rem);
  line-height: 1;
  letter-spacing: -.055em;
}

.territory-footer strong {
  display: block;
  color: var(--navy);
}


/* ============================================================
   16 — VISITOR
   ============================================================ */

.chapter-visitor {
  min-height: 100svh;
  padding:
    clamp(150px, 18vw, 260px)
    0;
  background: var(--paper);
}

.visitor-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(300px, .9fr);
  gap: clamp(70px, 11vw, 180px);
}

.visitor-header {
  padding-left: min(6vw, 90px);
}

.visitor-copy {
  padding-top: clamp(80px, 12vw, 160px);
}

.visitor-prompt {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 25px;
  margin:
    clamp(90px, 12vw, 150px)
    0
    0
    min(6vw, 90px);
}

.visitor-prompt span {
  color: var(--navy);
  font-size: clamp(1.5rem, 3vw, 3rem);
  font-weight: 800;
  letter-spacing: -.065em;
}


/* ============================================================
   17 — YOUR DIRECTION
   ============================================================ */

.chapter-your-direction {
  min-height: 100svh;
  padding:
    clamp(150px, 18vw, 260px)
    0;
  background: var(--white);
}

.your-direction-header {
  max-width: 1000px;
  margin-left: min(10vw, 150px);
}

.direction-doors {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  margin:
    clamp(80px, 11vw, 140px)
    0
    0
    min(10vw, 150px);
  border-top: 1px solid var(--line);
  border-bottom: 1px solid var(--line);
}

.direction-door {
  position: relative;
  min-height: 260px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 22px 18px;
  border-right: 1px solid var(--line);
  overflow: hidden;
  transition:
    background 650ms var(--ease-out),
    color 500ms var(--ease-out);
}

.direction-door:first-child {
  border-left: 1px solid var(--line);
}

.direction-door::after {
  content: "";
  position: absolute;
  inset: auto 0 0;
  height: 0;
  background: var(--navy);
  transition: height 650ms var(--ease-out);
  z-index: -1;
}

.direction-door:hover {
  color: var(--white);
}

.direction-door:hover::after {
  height: 100%;
}

.direction-door > span {
  font-family: "DM Mono", monospace;
  font-size: .65rem;
  opacity: .6;
}

.direction-door strong {
  font-size: clamp(1.15rem, 2vw, 2rem);
  line-height: .95;
  letter-spacing: -.055em;
}

.direction-door i {
  align-self: flex-end;
  font-size: 1.5rem;
  font-style: normal;
  transition: transform 600ms var(--ease-out);
}

.direction-door:hover i {
  transform: translate(5px, -5px);
}

.your-direction-copy {
  max-width: 700px;
  margin:
    90px
    0
    0
    min(22vw, 330px);
}

.your-direction-question {
  max-width: 1000px;
  margin:
    110px
    0
    0
    auto;
  text-align: right;
}

.direction-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px 24px;
}

.direction-list span {
  color: var(--muted);
  font-size: clamp(1rem, 1.4vw, 1.4rem);
}

.your-direction-question p {
  margin: 45px 0 8px;
  color: var(--muted);
}

.your-direction-question > strong {
  color: var(--navy);
  font-size: clamp(3rem, 8vw, 8.5rem);
  font-weight: 800;
  line-height: .8;
  letter-spacing: -.085em;
}


/* ============================================================
   18 — CONTACT
   ============================================================ */

.chapter-contact {
  min-height: 100svh;
  padding:
    clamp(150px, 18vw, 260px)
    0;
  background: var(--navy);
  color: var(--white);
}

.chapter-contact .chapter-meta {
  color: rgba(255,255,255,.45);
}

.chapter-contact .chapter-meta span:first-child {
  color: var(--white);
}

.contact-field {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.contact-line {
  position: absolute;
  display: block;
  height: 1px;
  background: rgba(255,255,255,.1);
  transform-origin: left center;
}

.contact-line-a {
  width: 65%;
  top: 37%;
  left: 20%;
  transform: rotate(-13deg);
}

.contact-line-b {
  width: 50%;
  top: 65%;
  right: -2%;
  transform: rotate(18deg);
}

.contact-point {
  position: absolute;
  top: 37%;
  left: 20%;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--white);
  box-shadow: 0 0 0 12px rgba(255,255,255,.06);
}

.contact-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(280px, .9fr);
  column-gap: clamp(70px, 10vw, 160px);
  align-items: start;
}

.contact-header {
  padding-left: min(6vw, 90px);
}

.chapter-contact .eyebrow {
  color: rgba(255,255,255,.48);
}

.contact-title {
  margin: 0;
  color: var(--white);
  font-size: var(--display-xl);
  font-weight: 800;
  line-height: .82;
  letter-spacing: -.085em;
}

.contact-copy {
  padding-top: clamp(100px, 14vw, 180px);
  color: rgba(255,255,255,.7);
}

.contact-copy strong {
  color: var(--white);
}

.contact-cta {
  grid-column: 1 / -1;
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  width: min(850px, 100%);
  margin:
    clamp(100px, 13vw, 170px)
    0
    0
    min(6vw, 90px);
  padding: 26px 0;
  border-top: 1px solid rgba(255,255,255,.32);
  border-bottom: 1px solid rgba(255,255,255,.32);
  color: var(--white);
}

.contact-cta span {
  font-size: clamp(2rem, 5vw, 5rem);
  font-weight: 800;
  line-height: .9;
  letter-spacing: -.07em;
}

.contact-cta i {
  font-size: clamp(2rem, 4vw, 4rem);
  font-style: normal;
  transition: transform 650ms var(--ease-out);
}

.contact-cta:hover i {
  transform: translate(8px, -8px);
}


/* ============================================================
   19 — EPILOGUE
   ============================================================ */

.epilogue {
  background: var(--white);
  color: var(--navy);
}

.epilogue-inner {
  width: min(calc(100% - (var(--gutter) * 2)), var(--container));
  min-height: 60vh;
  margin-inline: auto;
  padding:
    clamp(90px, 12vw, 170px)
    0
    40px;
  display: grid;
  grid-template-columns: 130px 1fr auto;
  gap: clamp(40px, 6vw, 100px);
  align-items: start;
}

.epilogue-mark img {
  width: 64px;
  height: 64px;
  object-fit: contain;
}

.epilogue-name {
  margin: 0 0 30px;
  font-family: "DM Mono", monospace;
  font-size: .7rem;
  letter-spacing: .08em;
}

.epilogue-copy h2 {
  margin: 0;
  font-size: clamp(3rem, 7vw, 8rem);
  line-height: .82;
  letter-spacing: -.08em;
}

.epilogue-fields {
  max-width: 600px;
  margin: 40px 0 0;
  color: var(--muted);
  font-size: .9rem;
}

.epilogue-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: space-between;
  min-height: 250px;
  color: var(--muted);
  font-size: .6rem;
}

.epilogue-meta a {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  color: var(--navy);
}

.epilogue-meta a i {
  font-size: 1rem;
  font-style: normal;
}


/* ============================================================
   20 — NOSCRIPT
   ============================================================ */

.noscript-message {
  position: fixed;
  z-index: 10000;
  right: 20px;
  bottom: 20px;
  left: 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 12px 25px;
  padding: 16px 20px;
  background: var(--navy);
  color: var(--white);
  font-size: .8rem;
}


/* ============================================================
   21 — HOVER / POINTER POLISH
   ============================================================ */

@media (pointer: fine) {

  .brand img {
    transition: transform 800ms var(--ease-out);
  }

  .brand:hover img {
    transform: rotate(-8deg) scale(1.04);
  }

  .menu-toggle:hover .menu-icon i:first-child {
    transform: translateX(-4px);
  }

  .menu-toggle:hover .menu-icon i:last-child {
    transform: translateX(4px);
  }

}


/* ============================================================
   22 — TABLET
   ============================================================ */

@media (max-width: 1100px) {

  :root {
    --gutter: clamp(24px, 5vw, 50px);
  }

  .directions-header,
  .directions-footer {
    margin-left: 0;
  }

  .directions-system {
    min-height: 700px;
  }

  .direction-item {
    width: 210px;
  }

  .territory-layout {
    grid-template-columns: 100px minmax(0, 1fr);
  }

  .territory-origin {
    display: none;
  }

  .direction-doors {
    margin-left: 0;
  }

  .your-direction-header {
    margin-left: 0;
  }

  .your-direction-copy {
    margin-left: 10%;
  }

  .your-direction-question {
    margin-left: 0;
  }

  .epilogue-inner {
    grid-template-columns: 100px 1fr;
  }

  .epilogue-meta {
    grid-column: 2;
    min-height: auto;
    flex-direction: row;
    align-items: center;
  }

}


/* ============================================================
   23 — MOBILE / TOUCH
   ============================================================ */

@media (max-width: 760px) {

  :root {
    --header-height: 68px;
    --gutter: 20px;
    --display-xl: clamp(3.5rem, 17vw, 6.5rem);
    --display-lg: clamp(2.8rem, 12vw, 5rem);
  }

  body {
    font-size: 15px;
  }

  .site-header {
    padding-right: max(20px, env(safe-area-inset-right));
    padding-left: max(20px, env(safe-area-inset-left));
  }

  .brand img {
    width: 36px;
    height: 36px;
  }

  .brand-name {
    display: none;
  }

  .header-index {
    display: none;
  }

  .menu-label {
    display: none;
  }

  .menu-panel {
    width: 100%;
    padding:
      calc(var(--header-height) + 25px)
      max(20px, env(safe-area-inset-right))
      max(24px, env(safe-area-inset-bottom))
      max(20px, env(safe-area-inset-left));
  }

  .menu-top {
    margin-bottom: 35px;
  }

  .primary-nav {
    gap: 1px;
  }

  .primary-nav a {
    grid-template-columns: 34px 1fr;
    gap: 10px;
    padding: 7px 0;
  }

  .nav-label {
    font-size: clamp(1.55rem, 8vw, 2.8rem);
  }

  .menu-contact {
    padding-top: 25px;
  }

  .menu-bottom {
    font-size: .52rem;
  }

  .menu-bottom span:last-child {
    display: none;
  }

  .scroll-progress {
    display: none;
  }

  .chapter-meta {
    position: relative;
    top: auto;
    left: auto;
    margin-bottom: 60px;
  }

  .chapter-hero {
    min-height: 100svh;
    padding:
      calc(var(--header-height) + 50px)
      var(--gutter)
      80px;
  }

  .hero-content {
    padding-top: 0;
  }

  .hero-title {
    font-size: clamp(3.65rem, 17.8vw, 6.2rem);
    line-height: .82;
  }

  .hero-title span {
    margin-left: 0;
  }

  .hero-intro {
    width: 100%;
    margin-top: 55px;
    font-size: 1rem;
  }

  .hero-bottom {
    right: var(--gutter);
    bottom: 25px;
    left: var(--gutter);
    grid-template-columns: auto 1fr;
  }

  .hero-location {
    display: none;
  }

  .hero-scroll-label {
    font-size: .55rem;
  }

  .hero-orbit-a {
    width: 105vw;
    top: 27%;
    right: -65%;
  }

  .hero-orbit-b {
    width: 75vw;
    top: 39%;
    right: -30%;
  }

  .hero-orbit-c {
    width: 45vw;
    top: 49%;
    right: -5%;
  }

  .chapter-center,
  .chapter-directions,
  .chapter-person,
  .chapter-manifesto,
  .chapter-traces,
  .chapter-territory,
  .chapter-visitor,
  .chapter-your-direction,
  .chapter-contact {
    padding-top: 120px;
    padding-bottom: 120px;
  }

  .center-layout {
    display: block;
  }

  .center-marker {
    position: relative;
    top: auto;
    width: 90px;
    margin-bottom: 70px;
  }

  .lead-question {
    margin-top: 50px;
    font-size: clamp(1.8rem, 8.5vw, 3rem);
  }

  .directions-header {
    margin-left: 0;
  }

  .directions-system {
    min-height: auto;
    display: grid;
    grid-template-columns: 1fr;
    gap: 14px;
    margin-top: 70px;
    padding-top: 130px;
  }

  .directions-core {
    top: 0;
    left: 50%;
    width: 105px;
    transform: translateX(-50%);
  }

  .directions-core::before {
    inset: -40%;
  }

  .directions-core::after {
    display: none;
  }

  .direction-item,
  .direction-01,
  .direction-02,
  .direction-03,
  .direction-04,
  .direction-05 {
    position: relative;
    top: auto;
    right: auto;
    bottom: auto;
    left: auto;
    width: 100%;
    padding: 20px 0 20px 16px;
    border-top: 1px solid var(--line);
  }

  .direction-item:hover {
    transform: none;
  }

  .direction-item p {
    max-width: 430px;
  }

  .directions-footer {
    display: block;
    margin-top: 50px;
  }

  .directions-footer strong {
    display: block;
    margin-top: 30px;
    font-size: 4rem;
  }

  .person-layout,
  .visitor-layout,
  .contact-layout {
    display: block;
  }

  .person-header,
  .visitor-header,
  .contact-header {
    padding-left: 0;
  }

  .person-copy,
  .visitor-copy,
  .contact-copy {
    padding-top: 60px;
  }

  .display-question {
    margin-top: 50px;
    font-size: 1.65rem;
  }

  .manifesto-frame {
    min-height: 100svh;
    padding-top: 120px;
    padding-bottom: 120px;
  }

  .manifesto-content {
    margin-left: 0;
  }

  .manifesto-title {
    font-size: clamp(3.5rem, 17vw, 6rem);
  }

  .manifesto-quote {
    padding-left: 18px;
    font-size: 1.9rem;
  }

  .traces-header {
    margin-left: 0;
  }

  .trace-line {
    width: 100%;
    margin-left: 0;
    margin-top: 80px;
  }

  .trace-list {
    grid-template-columns: 1fr;
    margin-left: 0;
    gap: 0;
  }

  .trace-item {
    min-height: auto;
    padding: 28px 0;
    border-bottom: 1px solid var(--line);
  }

  .trace-item:last-child {
    border-bottom: 0;
  }

  .traces-conclusion {
    margin-top: 60px;
    font-size: 1.2rem;
  }

  .territory-layout {
    display: block;
  }

  .territory-label {
    margin-bottom: 60px;
  }

  .territory-background {
    opacity: .7;
  }

  .territory-orbit-a {
    width: 130vw;
    right: -80%;
  }

  .territory-orbit-b {
    width: 75vw;
    right: -30%;
  }

  .territory-footer {
    margin-left: 0;
    font-size: 1.8rem;
  }

  .visitor-prompt {
    margin-left: 0;
  }

  .visitor-prompt span {
    font-size: 1.55rem;
  }

  .direction-doors {
    grid-template-columns: 1fr;
    margin-top: 70px;
  }

  .direction-door,
  .direction-door:first-child {
    min-height: 150px;
    border-left: 1px solid var(--line);
    border-right: 1px solid var(--line);
    border-bottom: 1px solid var(--line);
  }

  .direction-door:first-child {
    border-top: 0;
  }

  .direction-door:last-child {
    border-bottom: 0;
  }

  .your-direction-copy {
    margin: 60px 0 0;
  }

  .your-direction-question {
    margin-top: 80px;
    text-align: left;
  }

  .direction-list {
    display: block;
  }

  .direction-list span {
    display: block;
    margin-bottom: 5px;
  }

  .your-direction-question p {
    margin-top: 45px;
  }

  .your-direction-question > strong {
    display: block;
    font-size: clamp(3.5rem, 16vw, 6rem);
  }

  .contact-title {
    font-size: clamp(4rem, 18vw, 6.5rem);
  }

  .contact-cta {
    width: 100%;
    margin-left: 0;
  }

  .contact-cta span {
    font-size: clamp(2.2rem, 10vw, 4rem);
  }

  .contact-field {
    opacity: .65;
  }

  .contact-line-a {
    width: 100%;
    left: -20%;
    top: 35%;
  }

  .contact-line-b {
    width: 100%;
    right: -40%;
    top: 67%;
  }

  .contact-point {
    left: 8%;
  }

  .epilogue-inner {
    min-height: auto;
    padding-top: 90px;
    padding-bottom: 30px;
    display: block;
  }

  .epilogue-mark {
    margin-bottom: 55px;
  }

  .epilogue-copy h2 {
    font-size: clamp(3rem, 15vw, 5.8rem);
  }

  .epilogue-fields {
    line-height: 1.5;
  }

  .epilogue-meta {
    margin-top: 80px;
    display: flex;
    align-items: flex-start;
    gap: 25px;
  }

}


/* ============================================================
   24 — SMALL PHONES
   ============================================================ */

@media (max-width: 390px) {

  .hero-title {
    font-size: 3.35rem;
  }

  .display-title {
    font-size: 2.65rem;
  }

  .chapter-meta {
    font-size: .58rem;
  }

  .body-copy {
    font-size: .96rem;
  }

  .manifesto-title {
    font-size: 3.3rem;
  }

  .contact-title {
    font-size: 3.55rem;
  }

}


/* ============================================================
   25 — LANDSCAPE PHONES
   ============================================================ */

@media (max-height: 560px) and (orientation: landscape) {

  :root {
    --header-height: 62px;
  }

  .chapter-hero {
    min-height: 680px;
  }

  .hero-intro {
    margin-top: 30px;
  }

  .hero-bottom {
    bottom: 15px;
  }

  .menu-panel {
    padding-top: 80px;
  }

  .primary-nav {
    grid-template-columns: repeat(2, 1fr);
  }

}


/* ============================================================
   26 — REDUCED MOTION
   ============================================================ */

@media (prefers-reduced-motion: reduce) {

  html {
    scroll-behavior: auto;
  }

  *,
  *::before,
  *::after {
    animation-duration: .001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: .001ms !important;
    scroll-behavior: auto !important;
  }

  html.js.reveal-ready [data-reveal] {
    opacity: 1;
    transform: none;
  }

  .hero-orbit {
    transform: none !important;
  }

}


/* ============================================================
   27 — NO HOVER / TOUCH
   ============================================================ */

@media (hover: none) {

  .direction-item:hover {
    transform: none;
  }

  .primary-nav a:hover {
    transform: none;
  }

  .direction-door:hover {
    color: inherit;
  }

  .direction-door:hover::after {
    height: 0;
  }

  .contact-cta:hover i {
    transform: none;
  }

}


/* ============================================================
   28 — HIGH CONTRAST
   ============================================================ */

@media (forced-colors: active) {

  .site-header,
  .site-menu,
  .menu-panel,
  .chapter,
  .epilogue {
    border-color: CanvasText;
  }

  .hero-orbit,
  .territory-orbit,
  .directions-core::before,
  .directions-core::after {
    border-color: CanvasText;
  }

}


/* ============================================================
   29 — PRINT
   ============================================================ */

@media print {

  *,
  *::before,
  *::after {
    color: #000 !important;
    background: transparent !important;
    box-shadow: none !important;
    text-shadow: none !important;
  }

  body {
    overflow: visible !important;
  }

  .site-header,
  .site-menu,
  .site-loader,
  .scroll-progress,
  .hero-atmosphere,
  .chapter-grid,
  .territory-background,
  .contact-field,
  .hero-bottom {
    display: none !important;
  }

  .chapter {
    min-height: auto !important;
    overflow: visible !important;
    page-break-inside: avoid;
    padding: 70px 0 !important;
  }

  .chapter-meta {
    position: static;
    margin-bottom: 25px;
  }

  .section-inner,
  .manifesto-frame,
  .epilogue-inner {
    width: 100%;
    max-width: none;
  }

  html.js.reveal-ready [data-reveal] {
    opacity: 1 !important;
    transform: none !important;
  }

  a[href]::after {
    content: " (" attr(href) ")";
    font-size: .75em;
  }

}


/* ============================================================
   30 — FALLBACKS
   ============================================================ */

@supports not (height: 100svh) {

  .chapter-hero,
  .chapter-center,
  .chapter-directions,
  .chapter-person,
  .chapter-manifesto,
  .chapter-traces,
  .chapter-territory,
  .chapter-visitor,
  .chapter-your-direction,
  .chapter-contact {
    min-height: 100vh;
  }

}

@supports not (backdrop-filter: blur(10px)) {

  .site-header {
    background: var(--paper);
  }

}

@supports not (overflow: clip) {

  .chapter {
    overflow: hidden;
  }

}
