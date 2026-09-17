/* =========================================================
   CESARE PARATORE
   MOVIMENTO / CON DIREZIONE.
   HOME — MASTER CSS 17/09/2026
========================================================= */


/* =========================================================
   01. DESIGN TOKENS
========================================================= */

:root {
  --navy: #071b33;
  --navy-2: #0b2441;
  --navy-3: #12375d;
  --navy-4: #1b4a76;

  --black: #05070a;
  --ink: #10161d;
  --muted: #687482;

  --white: #ffffff;
  --paper: #f5f4ef;
  --paper-2: #ebeae4;

  --line: rgba(7, 27, 51, 0.14);
  --line-strong: rgba(7, 27, 51, 0.28);
  --line-light: rgba(255, 255, 255, 0.14);
  --line-bright: rgba(255, 255, 255, 0.28);

  --header-height: 84px;
  --container: 1480px;
  --gutter: clamp(22px, 4vw, 76px);

  --section-space: clamp(120px, 15vw, 250px);

  --display-xl: clamp(4.5rem, 11.2vw, 12rem);
  --display-lg: clamp(3.6rem, 8vw, 8.8rem);
  --display-md: clamp(2.7rem, 5.4vw, 5.8rem);
  --display-sm: clamp(2rem, 3.6vw, 4rem);

  --body-xl: clamp(1.35rem, 2vw, 2rem);
  --body-lg: clamp(1.08rem, 1.5vw, 1.45rem);
  --body-md: clamp(0.98rem, 1.2vw, 1.18rem);
  --body-sm: clamp(0.86rem, 1vw, 1rem);

  --mono-xs: 0.62rem;
  --mono-sm: 0.7rem;
  --mono-md: 0.78rem;

  --radius: 999px;

  --ease-out: cubic-bezier(.16, 1, .3, 1);
  --ease-soft: cubic-bezier(.22, 1, .36, 1);
  --ease-in-out: cubic-bezier(.65, 0, .35, 1);

  --fast: 220ms;
  --medium: 650ms;
  --slow: 1100ms;

  --shadow-soft: 0 30px 100px rgba(7, 27, 51, .08);
  --shadow-deep: 0 50px 150px rgba(0, 0, 0, .22);

  --header-blur: blur(18px);
}


/* =========================================================
   02. RESET
========================================================= */

*,
*::before,
*::after {
  box-sizing: border-box;
}

html {
  margin: 0;
  padding: 0;
  background: var(--paper);
  color: var(--ink);
  scroll-behavior: auto;
  scroll-padding-top: var(--header-height);
  -webkit-text-size-adjust: 100%;
}

body {
  margin: 0;
  min-width: 320px;
  overflow-x: hidden;
  background: var(--paper);
  color: var(--ink);
  font-family: "Manrope", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  font-weight: 500;
  line-height: 1.55;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
}

body.menu-open,
body.standby-active {
  overflow: hidden;
}

img {
  display: block;
  max-width: 100%;
}

button,
a {
  -webkit-tap-highlight-color: transparent;
}

button {
  font: inherit;
}

a {
  color: inherit;
  text-decoration: none;
}

::selection {
  background: var(--navy);
  color: var(--white);
}


/* =========================================================
   03. GLOBAL ACCESSIBILITY
========================================================= */

:focus-visible {
  outline: 2px solid var(--navy-3);
  outline-offset: 5px;
}

button:focus-visible,
a:focus-visible {
  outline: 2px solid currentColor;
}

[aria-hidden="true"] {
  pointer-events: none;
}


/* =========================================================
   04. SITE LOADER
========================================================= */

.site-loader {
  position: fixed;
  inset: 0;
  z-index: 10000;

  display: grid;
  place-items: center;

  background: var(--navy);

  opacity: 1;
  visibility: visible;

  transition:
    opacity 700ms var(--ease-out),
    visibility 700ms linear;
}

.site-loader.is-hidden {
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
}

.site-loader__inner {
  position: relative;

  display: grid;
  place-items: center;

  width: 150px;
  height: 150px;
}

.site-loader__inner img {
  width: 104px;
  height: 104px;
  object-fit: contain;

  filter: none;

  animation: loader-breathe 1800ms var(--ease-in-out) infinite;
}

.site-loader__line {
  position: absolute;
  left: 50%;
  bottom: -24px;

  width: 72px;
  height: 1px;

  background: rgba(255, 255, 255, .32);

  transform: translateX(-50%);
  overflow: hidden;
}

.site-loader__line::after {
  content: "";
  position: absolute;
  inset: 0;

  background: var(--white);

  transform: translateX(-100%);
  animation: loader-line 1500ms var(--ease-out) infinite;
}

@keyframes loader-breathe {
  0%,
  100% {
    transform: scale(.94);
    opacity: .82;
  }

  50% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes loader-line {
  to {
    transform: translateX(100%);
  }
}


/* =========================================================
   05. PAGE TRANSITION
========================================================= */

.page-transition {
  position: fixed;
  inset: 0;
  z-index: 9990;

  pointer-events: none;

  background: var(--navy);

  clip-path: inset(0 100% 0 0);

  transition:
    clip-path 900ms var(--ease-in-out);
}

.page-transition__line {
  position: absolute;
  top: 50%;
  left: 0;

  width: 100%;
  height: 1px;

  background: rgba(255, 255, 255, .22);

  transform: scaleX(0);
  transform-origin: left center;

  transition: transform 700ms var(--ease-out);
}

.page-transition.is-active {
  clip-path: inset(0 0 0 0);
}

.page-transition.is-active .page-transition__line {
  transform: scaleX(1);
}


/* =========================================================
   06. HEADER
========================================================= */

.site-header {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 9000;

  display: flex;
  align-items: center;
  justify-content: space-between;

  width: 100%;
  height: var(--header-height);

  padding:
    10px
    var(--gutter);

  color: var(--white);

  mix-blend-mode: normal;

  transition:
    transform 700ms var(--ease-out),
    background 500ms var(--ease-out),
    backdrop-filter 500ms var(--ease-out);
}

.site-header.is-hidden {
  transform: translateY(-110%);
}

.site-header.is-scrolled {
  background: rgba(7, 27, 51, .72);
  backdrop-filter: var(--header-blur);
  -webkit-backdrop-filter: var(--header-blur);
}

.site-brand {
  display: inline-flex;
  align-items: center;
  gap: 14px;

  min-width: 0;
}

.site-brand__mark {
  display: grid;
  place-items: center;

  width: 62px;
  height: 62px;

  flex: 0 0 62px;
}

.site-brand__mark img {
  width: 62px;
  height: 62px;

  object-fit: contain;

  filter: none;
}

.site-brand__copy {
  display: flex;
  flex-direction: column;
  gap: 2px;

  min-width: 0;
}

.site-brand__copy strong {
  font-size: .78rem;
  font-weight: 800;
  letter-spacing: .13em;
  line-height: 1;
  white-space: nowrap;
}

.site-brand__copy span {
  font-family: "DM Mono", monospace;
  font-size: var(--mono-xs);
  font-weight: 400;
  letter-spacing: .08em;
  opacity: .72;
  white-space: nowrap;
}

.site-header__meta {
  display: flex;
  align-items: center;
  gap: 26px;
}

.section-index {
  display: inline-flex;
  align-items: center;
  gap: 7px;

  font-family: "DM Mono", monospace;
  font-size: var(--mono-sm);
  letter-spacing: .08em;

  white-space: nowrap;
}

.section-index__current {
  opacity: 1;
}

.section-index__separator {
  opacity: .35;
}

.section-index__total {
  opacity: .45;
}


/* =========================================================
   07. MENU TOGGLE
========================================================= */

.menu-toggle {
  position: relative;

  display: inline-flex;
  align-items: center;
  gap: 12px;

  padding: 8px 0;

  border: 0;
  background: transparent;
  color: inherit;

  cursor: pointer;

  font-family: "DM Mono", monospace;
  font-size: var(--mono-sm);
  letter-spacing: .08em;
}

.menu-toggle__label {
  position: relative;
}

.menu-toggle__icon {
  position: relative;

  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 5px;

  width: 23px;
  height: 23px;
}

.menu-toggle__icon i {
  display: block;

  width: 23px;
  height: 1px;

  background: currentColor;

  transform-origin: center;

  transition:
    transform 500ms var(--ease-out),
    opacity 300ms ease;
}

.menu-toggle[aria-expanded="true"] .menu-toggle__icon i:first-child {
  transform: translateY(3px) rotate(45deg);
}

.menu-toggle[aria-expanded="true"] .menu-toggle__icon i:last-child {
  transform: translateY(-3px) rotate(-45deg);
}


/* =========================================================
   08. FULLSCREEN MENU
========================================================= */

.site-menu {
  position: fixed;
  inset: 0;
  z-index: 8500;

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

  background: rgba(3, 8, 14, .7);

  opacity: 0;

  transition: opacity 700ms var(--ease-out);
}

.site-menu.is-open .menu-backdrop {
  opacity: 1;
}

.menu-panel {
  position: absolute;
  inset: 0;

  display: flex;
  flex-direction: column;

  padding:
    calc(var(--header-height) + 34px)
    var(--gutter)
    28px;

  overflow-y: auto;

  background:
    radial-gradient(
      circle at 80% 20%,
      rgba(28, 78, 120, .2),
      transparent 30%
    ),
    var(--navy);

  color: var(--white);

  clip-path: inset(0 0 100% 0);

  transition:
    clip-path 900ms var(--ease-in-out);
}

.site-menu.is-open .menu-panel {
  clip-path: inset(0 0 0 0);
}

.menu-panel::before {
  content: "";

  position: absolute;
  inset: 0;

  opacity: .24;

  background-image:
    linear-gradient(
      rgba(255,255,255,.05) 1px,
      transparent 1px
    ),
    linear-gradient(
      90deg,
      rgba(255,255,255,.05) 1px,
      transparent 1px
    );

  background-size: 80px 80px;

  pointer-events: none;
}

.menu-panel__top,
.menu-navigation,
.menu-panel__bottom {
  position: relative;
  z-index: 1;
}

.menu-panel__top {
  display: flex;
  justify-content: space-between;

  padding-bottom: 25px;

  border-bottom: 1px solid var(--line-light);

  font-family: "DM Mono", monospace;
  font-size: var(--mono-xs);
  letter-spacing: .09em;
  text-transform: uppercase;

  opacity: .72;
}

.menu-navigation {
  display: flex;
  flex-direction: column;

  margin: 30px 0 auto;
}

.menu-navigation a {
  display: grid;
  grid-template-columns:
    minmax(38px, 5vw)
    1fr
    40px;
  align-items: center;

  gap: 18px;

  min-height: clamp(55px, 7vh, 78px);

  border-bottom: 1px solid var(--line-light);

  transition:
    padding-left 500ms var(--ease-out),
    color 300ms ease,
    border-color 300ms ease;
}

.menu-navigation a:hover {
  padding-left: 14px;
  color: rgba(255,255,255,.72);
  border-color: rgba(255,255,255,.36);
}

.menu-navigation__number {
  font-family: "DM Mono", monospace;
  font-size: var(--mono-sm);
  opacity: .42;
}

.menu-navigation__title {
  font-size: clamp(1.3rem, 2.8vw, 3rem);
  font-weight: 700;
  letter-spacing: -.045em;
  line-height: 1;
}

.menu-navigation__arrow {
  justify-self: end;

  font-size: 1.3rem;

  opacity: .35;

  transform: translate(-5px, 5px);

  transition:
    transform 450ms var(--ease-out),
    opacity 300ms ease;
}

.menu-navigation a:hover .menu-navigation__arrow {
  opacity: 1;
  transform: translate(0, 0);
}

.menu-panel__bottom {
  display: flex;
  justify-content: space-between;
  gap: 20px;

  padding-top: 25px;

  border-top: 1px solid var(--line-light);

  font-family: "DM Mono", monospace;
  font-size: var(--mono-xs);
  letter-spacing: .08em;

  opacity: .58;
}


/* =========================================================
   09. MOBILE SECTION NAV
========================================================= */

.mobile-section-nav {
  position: fixed;
  left: 50%;
  bottom: 18px;
  z-index: 7000;

  width: min(calc(100% - 28px), 460px);

  transform: translateX(-50%);

  display: none;
}

.mobile-section-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;

  width: 100%;

  padding: 14px 17px;

  border: 1px solid rgba(255,255,255,.2);
  border-radius: var(--radius);

  background: rgba(7,27,51,.82);
  color: var(--white);

  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);

  cursor: pointer;

  box-shadow: 0 12px 45px rgba(0,0,0,.18);
}

.mobile-section-trigger__index {
  font-family: "DM Mono", monospace;
  font-size: var(--mono-xs);
  opacity: .58;
}

.mobile-section-trigger__title {
  flex: 1;

  margin-left: 14px;

  text-align: left;

  font-size: .75rem;
  font-weight: 700;
  letter-spacing: .08em;
}

.mobile-section-trigger__icon {
  font-size: 1.1rem;

  transition: transform 400ms var(--ease-out);
}

.mobile-section-trigger[aria-expanded="true"]
.mobile-section-trigger__icon {
  transform: rotate(45deg);
}

.mobile-section-list {
  position: absolute;
  left: 0;
  right: 0;
  bottom: calc(100% + 8px);

  display: flex;
  flex-direction: column;

  max-height: 65vh;
  overflow-y: auto;

  padding: 8px;

  border: 1px solid rgba(255,255,255,.14);
  border-radius: 18px;

  background: rgba(7,27,51,.95);

  backdrop-filter: blur(22px);
  -webkit-backdrop-filter: blur(22px);

  opacity: 0;
  visibility: hidden;
  transform: translateY(10px);

  transition:
    opacity 300ms ease,
    visibility 300ms ease,
    transform 450ms var(--ease-out);
}

.mobile-section-list.is-open {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.mobile-section-list a {
  padding: 13px 12px;

  border-bottom: 1px solid rgba(255,255,255,.08);

  color: var(--white);

  font-family: "DM Mono", monospace;
  font-size: .68rem;
  letter-spacing: .05em;
}

.mobile-section-list a:last-child {
  border-bottom: 0;
}


/* =========================================================
   10. SCROLL PROGRESS
========================================================= */

.scroll-progress {
  position: fixed;
  top: 0;
  right: 0;
  z-index: 9100;

  width: 2px;
  height: 100vh;

  background: rgba(255,255,255,.06);

  pointer-events: none;
}

.scroll-progress span {
  display: block;

  width: 100%;
  height: 0;

  background: rgba(255,255,255,.72);

  transform-origin: top;
}


/* =========================================================
   11. CHAPTER BASE
========================================================= */

.chapter {
  position: relative;

  min-height: 100svh;

  overflow: clip;

  background: var(--paper);
}

.chapter:nth-of-type(even) {
  background: var(--paper-2);
}

.chapter__inner {
  position: relative;
  z-index: 2;

  width: min(100%, var(--container));

  margin-inline: auto;

  padding:
    calc(var(--header-height) + 80px)
    var(--gutter)
    var(--section-space);
}

.chapter__meta {
  display: flex;
  justify-content: space-between;

  margin-bottom: clamp(50px, 8vw, 115px);

  color: var(--muted);

  font-family: "DM Mono", monospace;
  font-size: var(--mono-xs);
  letter-spacing: .1em;
  text-transform: uppercase;
}

.chapter__meta span:last-child {
  text-align: right;
}

.eyebrow {
  margin: 0 0 22px;

  color: var(--muted);

  font-family: "DM Mono", monospace;
  font-size: var(--mono-xs);
  font-weight: 400;
  letter-spacing: .12em;
  text-transform: uppercase;
}

.chapter h1,
.chapter h2,
.chapter h3,
.epilogue h2 {
  margin: 0;

  font-weight: 800;
  letter-spacing: -.065em;
  line-height: .91;
}

.chapter p {
  margin: 0;
}


/* =========================================================
   12. HERO
========================================================= */

.chapter--hero {
  min-height: 100svh;

  background:
    radial-gradient(
      circle at 80% 42%,
      rgba(23,61,99,.95),
      transparent 35%
    ),
    linear-gradient(
      120deg,
      var(--navy),
      var(--navy-2)
    );

  color: var(--white);
}

.chapter--hero .chapter__inner {
  min-height: 100svh;

  display: flex;
  flex-direction: column;
}

.chapter--hero .chapter__meta {
  color: rgba(255,255,255,.54);
}

.hero-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.04fr) minmax(360px, .96fr);
  gap: clamp(40px, 7vw, 120px);

  align-items: center;

  flex: 1;
}

.hero-copy {
  position: relative;
  z-index: 3;
}

.hero-title {
  display: flex;
  flex-direction: column;

  font-size: var(--display-xl);
}

.hero-title span:last-child {
  margin-left: clamp(20px, 5vw, 90px);
}

.hero-intro {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 25px;

  max-width: 700px;

  margin-top: clamp(40px, 6vw, 80px);

  color: rgba(255,255,255,.72);

  font-size: var(--body-lg);
  line-height: 1.4;
}

.visual-field {
  position: relative;

  isolation: isolate;

  overflow: hidden;

  min-height: 500px;

  border: 1px solid var(--line);

  background:
    radial-gradient(
      circle at 50% 50%,
      rgba(23,61,99,.13),
      transparent 50%
    );
}

.chapter--hero .visual-field {
  min-height: min(65vh, 720px);

  border-color: rgba(255,255,255,.1);

  background:
    radial-gradient(
      circle at 50% 50%,
      rgba(53,111,165,.25),
      transparent 38%
    );
}

.visual-grid {
  position: absolute;
  inset: 0;

  background-image:
    linear-gradient(
      rgba(255,255,255,.07) 1px,
      transparent 1px
    ),
    linear-gradient(
      90deg,
      rgba(255,255,255,.07) 1px,
      transparent 1px
    );

  background-size: 65px 65px;

  mask-image: linear-gradient(
    to bottom,
    transparent,
    black 20%,
    black 80%,
    transparent
  );

  opacity: .42;
}

.visual-line,
.visual-orbit,
.visual-point,
.visual-crosshair,
.visual-logo-anchor {
  position: absolute;
}

.visual-line {
  height: 1px;

  background: currentColor;

  opacity: .28;

  transform-origin: left center;
}

.chapter--hero .visual-line {
  color: rgba(255,255,255,.65);
}

.visual-line--one {
  top: 25%;
  left: -10%;
  width: 125%;

  transform: rotate(-17deg);
}

.visual-line--two {
  top: 58%;
  left: -10%;
  width: 125%;

  transform: rotate(11deg);
}

.visual-line--three {
  top: 76%;
  left: 10%;
  width: 100%;

  transform: rotate(-5deg);
}

.visual-orbit {
  border: 1px solid currentColor;
  border-radius: 50%;

  color: var(--navy-3);

  opacity: .32;
}

.chapter--hero .visual-orbit {
  color: rgba(255,255,255,.65);
}

.visual-orbit--one {
  width: 52%;
  aspect-ratio: 1;
  top: 22%;
  left: 23%;
}

.visual-orbit--two {
  width: 76%;
  aspect-ratio: 1;
  top: 12%;
  left: 12%;

  transform: rotate(25deg) scaleY(.54);
}

.visual-orbit--three {
  width: 92%;
  aspect-ratio: 1;
  top: 4%;
  left: 4%;

  transform: rotate(-34deg) scaleY(.38);
}

.visual-point {
  width: 8px;
  height: 8px;

  border-radius: 50%;

  background: currentColor;

  color: var(--navy);
  box-shadow: 0 0 25px currentColor;
}

.chapter--hero .visual-point {
  color: var(--white);
}

.visual-point--one {
  top: 29%;
  left: 68%;
}

.visual-point--two {
  top: 69%;
  left: 31%;
}

.visual-crosshair {
  top: 50%;
  left: 50%;

  width: 34px;
  height: 34px;

  border: 1px solid currentColor;
  border-radius: 50%;

  color: rgba(255,255,255,.42);

  transform: translate(-50%, -50%);
}

.visual-crosshair::before,
.visual-crosshair::after {
  content: "";

  position: absolute;

  background: currentColor;
}

.visual-crosshair::before {
  top: 50%;
  left: -14px;

  width: 62px;
  height: 1px;

  transform: translateY(-50%);
}

.visual-crosshair::after {
  left: 50%;
  top: -14px;

  width: 1px;
  height: 62px;

  transform: translateX(-50%);
}

.visual-logo-anchor {
  top: 50%;
  left: 50%;

  display: grid;
  place-items: center;

  width: 210px;
  height: 210px;

  border-radius: 50%;

  background: rgba(255,255,255,.035);

  transform: translate(-50%, -50%);

  animation: visual-breathe 7s var(--ease-in-out) infinite;
}

.visual-logo-anchor img {
  width: 170px;
  height: 170px;

  object-fit: contain;

  filter: none;
}

.hero-body {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: clamp(30px, 8vw, 150px);

  max-width: 980px;

  margin-top: clamp(70px, 9vw, 130px);

  color: rgba(255,255,255,.72);

  font-size: var(--body-lg);
}

.hero-body p {
  max-width: 580px;
}

.chapter__footer {
  display: flex;
  justify-content: space-between;

  margin-top: auto;
  padding-top: 50px;

  color: rgba(255,255,255,.42);

  font-family: "DM Mono", monospace;
  font-size: var(--mono-xs);
  letter-spacing: .08em;
}

@keyframes visual-breathe {
  0%,
  100% {
    transform: translate(-50%, -50%) scale(.96);
  }

  50% {
    transform: translate(-50%, -50%) scale(1.02);
  }
}


/* =========================================================
   13. EDITORIAL SPLIT
========================================================= */

.editorial-split {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(340px, .72fr);
  gap: clamp(50px, 9vw, 150px);

  align-items: center;
}

.editorial-copy h2 {
  max-width: 900px;

  font-size: var(--display-md);
}

.question {
  max-width: 720px;

  margin-top: clamp(40px, 5vw, 70px) !important;

  font-size: var(--body-xl);
  font-weight: 700;
  letter-spacing: -.035em;
  line-height: 1.25;
}

.editorial-body {
  max-width: 850px;

  margin-top: clamp(70px, 9vw, 130px);

  font-size: var(--body-lg);
  line-height: 1.55;
}

.editorial-body p + p {
  margin-top: 2em;
}

.editorial-body strong {
  font-weight: 800;
}


/* =========================================================
   14. CENTER VISUAL
========================================================= */

.visual-field--center {
  min-height: 560px;
}

.visual-field--center .visual-grid {
  background-image:
    linear-gradient(
      var(--line) 1px,
      transparent 1px
    ),
    linear-gradient(
      90deg,
      var(--line) 1px,
      transparent 1px
    );
}

.visual-field--center .visual-crosshair {
  color: var(--navy-3);
}

.visual-line--vertical {
  top: 0;
  left: 50%;

  width: 1px;
  height: 100%;

  background: var(--line);
}

.visual-line--horizontal {
  top: 50%;
  left: 0;

  width: 100%;
  height: 1px;

  background: var(--line);
}


/* =========================================================
   15. FIVE DIRECTIONS
========================================================= */

.section-heading {
  max-width: 1050px;
}

.section-heading h2 {
  font-size: var(--display-md);
}

.section-lead {
  max-width: 720px;

  margin-top: 45px !important;

  font-size: var(--body-xl);
  line-height: 1.3;
}

.section-lead strong {
  font-weight: 800;
}

.directions-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.18fr) minmax(330px, .82fr);
  gap: clamp(55px, 8vw, 120px);

  margin-top: clamp(70px, 10vw, 140px);

  align-items: start;
}

.directions-list {
  border-top: 1px solid var(--line-strong);
}

.direction-item {
  display: grid;
  grid-template-columns: 46px minmax(0, 1fr) 35px;
  gap: 18px;
  align-items: start;

  padding: 27px 0;

  border-bottom: 1px solid var(--line);

  cursor: default;

  transition:
    padding-left 500ms var(--ease-out),
    border-color 400ms ease;
}

.direction-item:hover,
.direction-item.is-active {
  padding-left: 14px;

  border-color: var(--navy-3);
}

.direction-item__number {
  padding-top: 5px;

  color: var(--muted);

  font-family: "DM Mono", monospace;
  font-size: var(--mono-xs);
}

.direction-item__content h3 {
  font-size: clamp(1.35rem, 2.5vw, 2.35rem);
  line-height: 1;
}

.direction-item__content p {
  max-width: 650px;

  margin-top: 16px;

  color: var(--muted);

  font-size: var(--body-md);
}

.direction-item__arrow {
  padding-top: 3px;

  color: var(--muted);

  font-size: 1.15rem;

  opacity: .45;

  transform: translate(-5px, 5px);

  transition:
    transform 450ms var(--ease-out),
    opacity 300ms ease;
}

.direction-item:hover .direction-item__arrow,
.direction-item.is-active .direction-item__arrow {
  opacity: 1;
  transform: translate(0, 0);
}

.directions-visual {
  position: sticky;
  top: calc(var(--header-height) + 40px);

  min-height: 620px;

  background:
    radial-gradient(
      circle at center,
      rgba(23,61,99,.12),
      transparent 52%
    );
}

.directions-core {
  position: absolute;
  top: 50%;
  left: 50%;

  display: grid;
  place-items: center;

  width: 240px;
  height: 240px;

  border-radius: 50%;

  transform: translate(-50%, -50%);
}

.directions-core__halo {
  position: absolute;
  inset: 0;

  border: 1px solid var(--line-strong);
  border-radius: 50%;

  animation: halo-pulse 6s var(--ease-in-out) infinite;
}

.directions-core img {
  position: relative;
  z-index: 2;

  width: 190px;
  height: 190px;

  object-fit: contain;

  filter: none;
}

@keyframes halo-pulse {
  0%,
  100% {
    transform: scale(.94);
    opacity: .5;
  }

  50% {
    transform: scale(1.06);
    opacity: 1;
  }
}

.directions-end {
  display: flex;
  flex-direction: column;
  align-items: flex-end;

  margin-top: 70px;

  font-family: "DM Mono", monospace;
  font-size: var(--mono-sm);
  letter-spacing: .08em;
}

.directions-end strong {
  margin-top: 7px;

  font-family: "Manrope", sans-serif;
  font-size: clamp(1.1rem, 2vw, 1.8rem);
  letter-spacing: -.04em;
}


/* =========================================================
   16. PERSON
========================================================= */

.manifesto-heading {
  max-width: 1200px;
}

.manifesto-heading h2 {
  font-size: var(--display-md);
}

.manifesto-large {
  margin-top: clamp(55px, 7vw, 100px) !important;

  font-size: clamp(2.4rem, 5vw, 5.5rem);
  line-height: .98;
  letter-spacing: -.065em;
}

.manifesto-large strong {
  font-weight: 800;
}

.person-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(300px, .58fr);
  gap: clamp(60px, 10vw, 170px);

  align-items: center;

  margin-top: var(--section-space);
}

.visual-field--person {
  min-height: 600px;
  border: 0;
  background: transparent;
}

.visual-field--person::before {
  content: "";

  position: absolute;
  left: 18%;
  top: 0;

  width: 1px;
  height: 100%;

  background: var(--line);
}

.visual-field--person .visual-line--trajectory {
  top: 52%;
  left: -5%;

  width: 115%;

  color: var(--navy-3);

  transform: rotate(-21deg);
}

.visual-point--start {
  top: 74%;
  left: 15%;
}

.visual-point--mid {
  top: 46%;
  left: 53%;
}

.visual-point--end {
  top: 20%;
  left: 88%;
}


/* =========================================================
   17. MANIFESTO
========================================================= */

.chapter--manifesto {
  background:
    radial-gradient(
      circle at 75% 40%,
      rgba(23,61,99,.08),
      transparent 34%
    ),
    var(--paper-2);
}

.manifesto-stage {
  min-height: 80svh;

  display: flex;
  flex-direction: column;
  justify-content: center;
}

.manifesto-title {
  display: flex;
  flex-direction: column;

  max-width: 1250px;

  margin-top: 40px;
}

.manifesto-title span,
.manifesto-title strong {
  display: block;

  font-size: clamp(3.8rem, 9vw, 10rem);
  line-height: .87;
}

.manifesto-title span:nth-child(2) {
  margin-left: clamp(25px, 8vw, 150px);
}

.manifesto-title span:nth-child(3) {
  margin-top: .12em;
}

.manifesto-title strong {
  margin-left: clamp(45px, 14vw, 250px);

  color: var(--navy);
}

.manifesto-body {
  max-width: 720px;

  margin-top: clamp(60px, 8vw, 110px);

  font-size: var(--body-lg);
}

.manifesto-body p + p {
  margin-top: 1.8em;
}

.manifesto-statement {
  display: flex;
  flex-direction: column;

  margin-top: clamp(90px, 12vw, 180px);

  font-size: clamp(1.8rem, 4vw, 4.6rem);
  letter-spacing: -.055em;
  line-height: .98;
}

.manifesto-statement strong {
  margin-left: clamp(20px, 7vw, 120px);
}


/* =========================================================
   18. TRACES
========================================================= */

.traces-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(300px, .7fr);
  gap: clamp(55px, 9vw, 140px);

  margin-top: clamp(70px, 10vw, 140px);
}

.trace-list {
  border-top: 1px solid var(--line-strong);
}

.trace-row {
  display: grid;
  grid-template-columns: 45px minmax(140px, .5fr) minmax(0, 1fr);
  gap: 20px;
  align-items: baseline;

  padding: 27px 0;

  border-bottom: 1px solid var(--line);

  transition:
    padding-left 450ms var(--ease-out),
    background 350ms ease;
}

.trace-row:hover {
  padding-left: 12px;
}

.trace-row__number {
  color: var(--muted);

  font-family: "DM Mono", monospace;
  font-size: var(--mono-xs);
}

.trace-row__title {
  font-size: clamp(1.15rem, 2vw, 1.8rem);
  font-weight: 800;
  letter-spacing: -.04em;
}

.trace-row__text {
  color: var(--muted);

  font-size: var(--body-sm);
}

.visual-field--traces {
  min-height: 570px;

  border: 0;
  background: transparent;
}

.trace-path {
  position: absolute;

  width: 120%;
  height: 1px;

  background: var(--navy-3);

  opacity: .32;

  transform-origin: left center;
}

.trace-path--one {
  top: 27%;
  left: -10%;
  transform: rotate(-24deg);
}

.trace-path--two {
  top: 49%;
  left: -5%;
  transform: rotate(12deg);
}

.trace-path--three {
  top: 71%;
  left: -15%;
  transform: rotate(-8deg);
}

.traces-closing {
  max-width: 900px;

  margin-top: clamp(80px, 11vw, 160px);

  font-size: var(--body-lg);
}

.traces-closing strong {
  display: block;

  margin-top: 35px;

  font-size: clamp(2rem, 4vw, 4.4rem);
  letter-spacing: -.055em;
  line-height: 1;
}


/* =========================================================
   19. TERRITORY / POINT ZERO
========================================================= */

.chapter--territory {
  background:
    radial-gradient(
      circle at 75% 45%,
      rgba(23,61,99,.12),
      transparent 34%
    ),
    var(--paper);
}

.territory-stage {
  display: grid;
  grid-template-columns: minmax(0, .95fr) minmax(330px, .75fr);
  gap: clamp(50px, 8vw, 130px);

  align-items: center;
}

.territory-copy h2 {
  font-size: var(--display-md);
}

.territory-origin {
  margin-top: 55px !important;

  font-size: clamp(2rem, 4vw, 4.5rem);
  font-weight: 800;
  letter-spacing: -.06em;
}

.visual-field--territory {
  min-height: 620px;

  border: 0;
  background: transparent;
}

.visual-field--territory .visual-grid {
  background-image:
    linear-gradient(var(--line) 1px, transparent 1px),
    linear-gradient(90deg, var(--line) 1px, transparent 1px);

  opacity: .55;
}

.origin-point {
  position: absolute;
  top: 50%;
  left: 50%;

  width: 18px;
  height: 18px;

  border: 1px solid var(--navy);
  border-radius: 50%;

  background: var(--paper);

  box-shadow:
    0 0 0 10px rgba(7,27,51,.05),
    0 0 0 25px rgba(7,27,51,.035);

  transform: translate(-50%, -50%);
}

.origin-path {
  position: absolute;

  width: 130%;
  height: 1px;

  background: var(--navy-3);

  transform-origin: left center;
}

.origin-path--one {
  left: 50%;
  top: 50%;

  transform: rotate(-31deg);
}

.origin-path--two {
  left: 50%;
  top: 50%;

  transform: rotate(21deg);
}

.territory-body {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 30px;

  max-width: 1000px;

  margin-top: var(--section-space);

  font-size: var(--body-lg);
}

.territory-body p:last-child {
  grid-column: 2;
}

.territory-closing {
  display: flex;
  flex-direction: column;

  margin-top: 100px;

  font-family: "DM Mono", monospace;
  font-size: var(--mono-sm);
  letter-spacing: .08em;
}

.territory-closing strong {
  margin-top: 10px;

  font-family: "Manrope", sans-serif;
  font-size: clamp(2rem, 4vw, 4rem);
  letter-spacing: -.06em;
}


/* =========================================================
   20. VISITOR
========================================================= */

.chapter--visitor {
  background: var(--navy);
  color: var(--white);
}

.chapter--visitor .chapter__meta,
.chapter--visitor .eyebrow {
  color: rgba(255,255,255,.48);
}

.visitor-stage {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(320px, .75fr);
  gap: clamp(50px, 9vw, 140px);

  align-items: center;
}

.visitor-copy h2 {
  font-size: var(--display-md);
}

.visitor-lead {
  margin-top: 45px !important;

  font-size: var(--body-xl);
  color: rgba(255,255,255,.7);
}

.visual-field--visitor {
  min-height: 570px;

  border-color: rgba(255,255,255,.1);

  background:
    radial-gradient(
      circle at center,
      rgba(53,111,165,.2),
      transparent 55%
    );
}

.visual-field--visitor .visual-line {
  color: rgba(255,255,255,.5);
}

.visual-field--visitor .visual-orbit {
  color: rgba(255,255,255,.55);
}

.visual-field--visitor .visual-point {
  color: var(--white);
}

.visitor-body {
  max-width: 850px;

  margin-top: var(--section-space);

  color: rgba(255,255,255,.74);

  font-size: var(--body-lg);
}

.visitor-body p + p {
  margin-top: 1.8em;
}

.visitor-body strong {
  display: block;

  margin-top: 45px;

  color: var(--white);

  font-size: clamp(2.3rem, 5vw, 5rem);
  letter-spacing: -.065em;
  line-height: .95;
}


/* =========================================================
   21. YOUR DIRECTION
========================================================= */

.direction-doors {
  display: grid;

  margin-top: clamp(65px, 9vw, 120px);

  border-top: 1px solid var(--line-strong);
}

.direction-door {
  display: grid;
  grid-template-columns: 50px 1fr 40px;
  align-items: center;
  gap: 20px;

  padding: clamp(20px, 3vw, 35px) 0;

  border-bottom: 1px solid var(--line);

  transition:
    padding-left 500ms var(--ease-out),
    border-color 400ms ease;
}

.direction-door:hover,
.direction-door.is-active {
  padding-left: 16px;

  border-color: var(--navy-3);
}

.direction-door span {
  color: var(--muted);

  font-family: "DM Mono", monospace;
  font-size: var(--mono-xs);
}

.direction-door strong {
  font-size: clamp(1.5rem, 3vw, 3.1rem);
  letter-spacing: -.055em;
  line-height: 1;
}

.direction-door i {
  justify-self: end;

  color: var(--muted);

  font-size: 1.3rem;
  font-style: normal;

  opacity: .4;

  transform: translate(-5px, 5px);

  transition:
    transform 450ms var(--ease-out),
    opacity 300ms ease;
}

.direction-door:hover i {
  opacity: 1;
  transform: translate(0, 0);
}

.your-direction-copy {
  max-width: 850px;

  margin-top: var(--section-space);

  font-size: var(--body-lg);
}

.your-direction-copy p + p {
  margin-top: 1.8em;
}

.your-direction-question {
  display: flex;
  flex-direction: column;
  align-items: flex-end;

  margin-top: var(--section-space);

  text-align: right;

  font-family: "DM Mono", monospace;
  font-size: var(--mono-sm);
  letter-spacing: .08em;
}

.your-direction-question strong {
  margin-top: 8px;

  font-family: "Manrope", sans-serif;
  font-size: 1.2rem;
  letter-spacing: -.03em;
}

.your-direction-question h3 {
  margin-top: 35px;

  font-family: "Manrope", sans-serif;
  font-size: clamp(3.5rem, 10vw, 10rem);
  letter-spacing: -.08em;
}


/* =========================================================
   22. CONTACT
========================================================= */

.chapter--contact {
  background:
    radial-gradient(
      circle at 80% 35%,
      rgba(23,61,99,.1),
      transparent 35%
    ),
    var(--paper-2);
}

.contact-stage {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(320px, .72fr);
  gap: clamp(50px, 9vw, 140px);

  align-items: center;
}

.contact-copy h2 {
  font-size: var(--display-lg);
}

.contact-lead {
  margin-top: 50px !important;

  font-size: var(--body-xl);
}

.visual-field--contact {
  min-height: 560px;

  border: 0;
  background: transparent;
}

.visual-logo-anchor--small {
  width: 170px;
  height: 170px;
}

.visual-logo-anchor--small img {
  width: 140px;
  height: 140px;
}

.contact-body {
  max-width: 820px;

  margin-top: var(--section-space);

  font-size: var(--body-lg);
}

.contact-body p + p {
  margin-top: 1.8em;
}

.contact-action {
  display: flex;
  justify-content: flex-start;

  margin-top: 80px;
}

.contact-cta {
  display: inline-flex;
  align-items: center;
  gap: 25px;

  padding-bottom: 13px;

  border-bottom: 1px solid var(--ink);

  font-size: clamp(2rem, 5vw, 5rem);
  font-weight: 800;
  letter-spacing: -.065em;
  line-height: .95;

  transition:
    gap 500ms var(--ease-out),
    opacity 300ms ease;
}

.contact-cta i {
  font-size: .55em;
  font-style: normal;

  transform: translateY(.1em);

  transition: transform 450ms var(--ease-out);
}

.contact-cta:hover {
  gap: 40px;
}

.contact-cta:hover i {
  transform: translate(.2em, -.2em);
}


/* =========================================================
   23. EPILOGUE
========================================================= */

.epilogue {
  position: relative;

  overflow: hidden;

  background: var(--navy);
  color: var(--white);
}

.epilogue__inner {
  width: min(100%, var(--container));

  margin-inline: auto;

  padding:
    clamp(100px, 14vw, 220px)
    var(--gutter);

  display: grid;
  grid-template-columns: 180px minmax(0, 1fr);
  gap: clamp(40px, 7vw, 100px);

  align-items: center;
}

.epilogue-mark img {
  width: 170px;
  height: 170px;

  object-fit: contain;

  filter: none;
}

.epilogue-copy h2 {
  font-size: clamp(2.4rem, 6vw, 6.5rem);
}

.epilogue-copy > p:last-child {
  margin-top: 30px;

  color: rgba(255,255,255,.5);

  font-family: "DM Mono", monospace;
  font-size: var(--mono-xs);
  letter-spacing: .08em;
}

.epilogue-line {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;

  height: 1px;

  background: rgba(255,255,255,.16);
}


/* =========================================================
   24. FOOTER
========================================================= */

.site-footer {
  background: var(--navy);
  color: var(--white);
}

.site-footer__inner {
  width: min(100%, var(--container));

  margin-inline: auto;

  padding:
    34px
    var(--gutter)
    38px;

  display: grid;
  grid-template-columns: 1fr 1fr 1fr;

  align-items: center;

  border-top: 1px solid rgba(255,255,255,.12);
}

.site-footer__logo img {
  width: 126px;
  height: 126px;

  object-fit: contain;

  filter: none;
}

.site-footer__identity {
  text-align: center;

  font-family: "DM Mono", monospace;
  font-size: var(--mono-xs);
  letter-spacing: .09em;

  opacity: .68;
}

.site-footer__copyright {
  justify-self: end;

  font-family: "DM Mono", monospace;
  font-size: var(--mono-xs);
  letter-spacing: .08em;

  opacity: .48;
}


/* =========================================================
   25. REVEAL SYSTEM
========================================================= */

html.js.reveal-ready [data-reveal] {
  opacity: 0;
  transform: translateY(35px);

  transition:
    opacity 900ms var(--ease-out),
    transform 1100ms var(--ease-out);
}

html.js.reveal-ready [data-reveal].is-visible {
  opacity: 1;
  transform: translateY(0);
}

html.js.reveal-ready
.direction-item[data-reveal].is-visible:nth-child(2),
html.js.reveal-ready
.direction-door[data-reveal].is-visible:nth-child(2) {
  transition-delay: 70ms;
}

html.js.reveal-ready
.direction-item[data-reveal].is-visible:nth-child(3),
html.js.reveal-ready
.direction-door[data-reveal].is-visible:nth-child(3) {
  transition-delay: 120ms;
}

html.js.reveal-ready
.direction-item[data-reveal].is-visible:nth-child(4),
html.js.reveal-ready
.direction-door[data-reveal].is-visible:nth-child(4) {
  transition-delay: 170ms;
}

html.js.reveal-ready
.direction-item[data-reveal].is-visible:nth-child(5),
html.js.reveal-ready
.direction-door[data-reveal].is-visible:nth-child(5) {
  transition-delay: 220ms;
}


/* =========================================================
   26. MAGNETIC / CURSOR
========================================================= */

.cp-cursor {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 12000;

  width: 9px;
  height: 9px;

  border-radius: 50%;

  background: var(--white);

  mix-blend-mode: difference;

  pointer-events: none;

  opacity: 0;

  transform: translate3d(-50%, -50%, 0);

  transition:
    width 300ms var(--ease-out),
    height 300ms var(--ease-out),
    opacity 300ms ease;
}

body.cursor-ready .cp-cursor {
  opacity: .9;
}

.cp-cursor.is-hovering {
  width: 34px;
  height: 34px;

  opacity: .75;
}

[data-magnetic] {
  transition:
    transform 500ms var(--ease-out);
}


/* =========================================================
   27. STANDBY — FULLSCREEN LOCK SCREEN
========================================================= */

.standby-screen {
  position: fixed;
  inset: 0;
  z-index: 11000;

  display: grid;
  place-items: center;

  visibility: hidden;
  opacity: 0;

  pointer-events: none;

  background:
    radial-gradient(
      circle at 50% 48%,
      rgba(18,55,93,.5),
      transparent 28%
    ),
    var(--navy);

  color: var(--white);

  transition:
    opacity 900ms var(--ease-out),
    visibility 900ms linear;
}

body.standby-active .standby-screen {
  visibility: visible;
  opacity: 1;

  pointer-events: auto;
}

.standby-screen::before {
  content: "";

  position: absolute;
  inset: 0;

  opacity: .22;

  background-image:
    linear-gradient(
      rgba(255,255,255,.045) 1px,
      transparent 1px
    ),
    linear-gradient(
      90deg,
      rgba(255,255,255,.045) 1px,
      transparent 1px
    );

  background-size: 75px 75px;
}

.standby-screen__inner {
  position: relative;
  z-index: 2;

  display: flex;
  flex-direction: column;
  align-items: center;

  text-align: center;
}

.standby-screen__mark {
  position: relative;

  display: grid;
  place-items: center;

  width: clamp(190px, 23vw, 300px);
  aspect-ratio: 1;

  border-radius: 50%;

  /*
     IMPORTANTE:
     il cerchio è chiaro perché il logo originale
     è navy e non deve essere modificato.
  */
  background: rgba(255,255,255,.94);

  box-shadow:
    0 0 0 1px rgba(255,255,255,.22),
    0 0 90px rgba(255,255,255,.08);

  animation: standby-pulse 6s var(--ease-in-out) infinite;
}

.standby-screen__mark::before,
.standby-screen__mark::after {
  content: "";

  position: absolute;

  border: 1px solid rgba(255,255,255,.15);
  border-radius: 50%;
}

.standby-screen__mark::before {
  inset: -28px;
}

.standby-screen__mark::after {
  inset: -58px;
  opacity: .5;
}

.standby-screen__mark img {
  width: 62%;
  height: 62%;

  object-fit: contain;

  filter: none;
}

.standby-screen__title {
  margin-top: 70px;

  font-family: "DM Mono", monospace;
  font-size: var(--mono-sm);
  letter-spacing: .16em;
}

.standby-screen__subtitle {
  margin-top: 12px;

  color: rgba(255,255,255,.45);

  font-size: .8rem;
}

.standby-screen__wake {
  margin-top: 40px;

  padding: 12px 20px;

  border: 1px solid rgba(255,255,255,.2);
  border-radius: var(--radius);

  background: transparent;
  color: var(--white);

  font-family: "DM Mono", monospace;
  font-size: var(--mono-xs);
  letter-spacing: .08em;

  cursor: pointer;

  transition:
    background 300ms ease,
    color 300ms ease,
    border-color 300ms ease;
}

.standby-screen__wake:hover {
  background: var(--white);
  color: var(--navy);
  border-color: var(--white);
}

@keyframes standby-pulse {
  0%,
  100% {
    transform: scale(.985);
  }

  50% {
    transform: scale(1.015);
  }
}


/* =========================================================
   28. STANDBY BODY LOCK
========================================================= */

body.standby-active > *:not(.standby-screen) {
  pointer-events: none;
}

body.standby-active .standby-screen {
  pointer-events: auto;
}


/* =========================================================
   29. NOSCRIPT
========================================================= */

.noscript-message {
  position: fixed;
  inset: auto 0 0;
  z-index: 20000;

  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;

  padding: 15px 20px;

  background: var(--navy);
  color: var(--white);

  font-family: "DM Mono", monospace;
  font-size: .68rem;
  letter-spacing: .04em;
}

.noscript-message strong {
  white-space: nowrap;
}


/* =========================================================
   30. REDUCED MOTION
========================================================= */

@media (prefers-reduced-motion: reduce) {

  html {
    scroll-behavior: auto;
  }

  *,
  *::before,
  *::after {
    animation-duration: .01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: .01ms !important;
  }

  html.js.reveal-ready [data-reveal] {
    opacity: 1;
    transform: none;
  }

  .page-transition {
    display: none;
  }

  .cp-cursor {
    display: none;
  }

}


/* =========================================================
   31. TABLET
========================================================= */

@media (max-width: 1050px) {

  :root {
    --header-height: 78px;
  }

  .hero-grid,
  .editorial-split,
  .directions-layout,
  .person-layout,
  .traces-layout,
  .territory-stage,
  .visitor-stage,
  .contact-stage {
    grid-template-columns: minmax(0, 1fr);
  }

  .hero-grid {
    gap: 70px;
  }

  .chapter--hero .visual-field,
  .visual-field--center,
  .directions-visual,
  .visual-field--person,
  .visual-field--traces,
  .visual-field--territory,
  .visual-field--visitor,
  .visual-field--contact {
    position: relative;
    top: auto;

    min-height: 430px;
  }

  .directions-visual {
    order: -1;
  }

  .person-layout .visual-field,
  .traces-layout .visual-field {
    order: -1;
  }

  .territory-stage .visual-field,
  .visitor-stage .visual-field,
  .contact-stage .visual-field {
    order: -1;
  }

  .hero-body {
    gap: 40px;
  }

  .territory-body {
    grid-template-columns: 1fr;
  }

  .territory-body p:last-child {
    grid-column: auto;
  }

  .site-footer__inner {
    grid-template-columns: 1fr auto 1fr;
  }

}


/* =========================================================
   32. MOBILE
========================================================= */

@media (max-width: 760px) {

  :root {
    --header-height: 70px;
    --gutter: 18px;
    --section-space: 110px;
  }

  body {
    font-size: 15px;
  }

  .site-header {
    padding-inline: 18px;
  }

  .site-brand {
    gap: 10px;
  }

  .site-brand__mark,
  .site-brand__mark img {
    width: 48px;
    height: 48px;
  }

  .site-brand__copy strong {
    font-size: .65rem;
    letter-spacing: .1em;
  }

  .site-brand__copy span {
    font-size: .52rem;
  }

  .site-header__meta {
    gap: 13px;
  }

  .section-index {
    font-size: .58rem;
  }

  .menu-toggle {
    font-size: .6rem;
  }

  .mobile-section-nav {
    display: block;
  }

  .scroll-progress {
    width: 1px;
  }

  .chapter__inner {
    padding-top: calc(var(--header-height) + 58px);
  }

  .chapter__meta {
    margin-bottom: 55px;
  }

  .hero-grid {
    gap: 55px;
  }

  .hero-title {
    font-size: clamp(3.7rem, 16vw, 7rem);
  }

  .hero-title span:last-child {
    margin-left: 20px;
  }

  .hero-intro,
  .hero-body {
    grid-template-columns: 1fr;
  }

  .hero-intro {
    gap: 12px;
  }

  .hero-body {
    gap: 25px;
  }

  .chapter--hero .visual-field,
  .visual-field--center,
  .directions-visual,
  .visual-field--person,
  .visual-field--traces,
  .visual-field--territory,
  .visual-field--visitor,
  .visual-field--contact {
    min-height: 330px;
  }

  .visual-logo-anchor {
    width: 150px;
    height: 150px;
  }

  .visual-logo-anchor img {
    width: 125px;
    height: 125px;
  }

  .directions-core {
    width: 170px;
    height: 170px;
  }

  .directions-core img {
    width: 140px;
    height: 140px;
  }

  .section-heading h2,
  .editorial-copy h2,
  .visitor-copy h2,
  .contact-copy h2,
  .territory-copy h2 {
    font-size: clamp(2.7rem, 12vw, 5rem);
  }

  .section-lead {
    margin-top: 30px !important;
  }

  .direction-item {
    grid-template-columns: 32px minmax(0, 1fr) 25px;
    gap: 10px;

    padding: 22px 0;
  }

  .direction-item__content p {
    margin-top: 12px;

    font-size: .93rem;
  }

  .manifesto-large {
    font-size: clamp(2.1rem, 10vw, 4rem);
  }

  .manifesto-title span,
  .manifesto-title strong {
    font-size: clamp(3.3rem, 15vw, 7rem);
  }

  .manifesto-title span:nth-child(2) {
    margin-left: 18px;
  }

  .manifesto-title strong {
    margin-left: 30px;
  }

  .trace-row {
    grid-template-columns: 30px 1fr;
    gap: 8px;
  }

  .trace-row__text {
    grid-column: 2;
  }

  .territory-origin {
    font-size: clamp(2.2rem, 11vw, 4.5rem);
  }

  .your-direction-question {
    align-items: flex-start;
    text-align: left;
  }

  .your-direction-question h3 {
    font-size: clamp(3.8rem, 18vw, 8rem);
  }

  .contact-cta {
    font-size: clamp(2.4rem, 12vw, 5rem);
  }

  .epilogue__inner {
    grid-template-columns: 1fr;

    gap: 35px;
  }

  .epilogue-mark img {
    width: 135px;
    height: 135px;
  }

  .epilogue-copy h2 {
    font-size: clamp(2.3rem, 10vw, 5rem);
  }

  .site-footer__inner {
    grid-template-columns: 1fr;

    gap: 25px;

    padding-top: 30px;
    padding-bottom: 95px;
  }

  .site-footer__identity {
    text-align: left;
  }

  .site-footer__copyright {
    justify-self: start;
  }

  .site-footer__logo img {
    width: 92px;
    height: 92px;
  }

  .menu-panel {
    padding:
      calc(var(--header-height) + 25px)
      18px
      25px;
  }

  .menu-navigation {
    margin-top: 20px;
  }

  .menu-navigation a {
    grid-template-columns: 34px 1fr 25px;
    gap: 10px;

    min-height: 58px;
  }

  .menu-navigation__title {
    font-size: clamp(1.05rem, 5vw, 1.55rem);
  }

  .menu-panel__bottom {
    flex-direction: column;
    gap: 8px;
  }

  .standby-screen__title {
    margin-top: 50px;
  }

  .standby-screen__mark {
    width: min(64vw, 250px);
  }

}


/* =========================================================
   33. VERY SMALL SCREENS
========================================================= */

@media (max-width: 420px) {

  .site-brand__copy {
    display: none;
  }

  .site-header {
    height: 64px;
  }

  .site-brand__mark,
  .site-brand__mark img {
    width: 45px;
    height: 45px;
  }

  .hero-title {
    font-size: clamp(3.25rem, 17vw, 5rem);
  }

  .chapter__meta {
    font-size: .56rem;
  }

  .visual-field {
    min-height: 285px !important;
  }

  .mobile-section-trigger {
    padding: 12px 14px;
  }

  .mobile-section-trigger__title {
    font-size: .66rem;
  }

}


/* =========================================================
   34. HIGH CONTRAST
========================================================= */

@media (prefers-contrast: more) {

  :root {
    --line: rgba(7, 27, 51, .32);
    --line-strong: rgba(7, 27, 51, .55);
    --muted: #4e5965;
  }

  .visual-grid {
    opacity: .75;
  }

  .site-footer__identity,
  .site-footer__copyright {
    opacity: 1;
  }

}


/* =========================================================
   35. PRINT
========================================================= */

@media print {

  *,
  *::before,
  *::after {
    color: #000 !important;
    background: transparent !important;
    box-shadow: none !important;
    text-shadow: none !important;
  }

  .site-header,
  .site-menu,
  .mobile-section-nav,
  .scroll-progress,
  .site-loader,
  .page-transition,
  .cp-cursor,
  .standby-screen {
    display: none !important;
  }

  .chapter,
  .epilogue,
  .site-footer {
    min-height: auto !important;
    overflow: visible !important;
  }

  .chapter__inner,
  .epilogue__inner,
  .site-footer__inner {
    padding: 40px 0 !important;
  }

  .visual-field,
  .visual-grid,
  .visual-line,
  .visual-orbit,
  .visual-point,
  .visual-crosshair {
    display: none !important;
  }

  html.js.reveal-ready [data-reveal] {
    opacity: 1 !important;
    transform: none !important;
  }

}


/* =========================================================
   36. FALLBACK — JS FAILURE
========================================================= */

html:not(.js) .site-loader {
  display: none;
}

html:not(.js) [data-reveal] {
  opacity: 1;
  transform: none;
}

html:not(.js) .page-transition,
html:not(.js) .mobile-section-nav {
  display: none;
}


/* =========================================================
   37. UTILITY STATES
========================================================= */

.is-page-leaving {
  overflow: hidden;
}

.is-page-leaving main,
.is-page-leaving .site-footer {
  opacity: .65;
}

body.menu-open .site-header {
  z-index: 9001;
}


/* =========================================================
   38. VISUAL DEPTH
========================================================= */

.visual-field::after {
  content: "";

  position: absolute;
  inset: 0;

  background:
    radial-gradient(
      circle at 50% 50%,
      transparent 35%,
      rgba(7,27,51,.035) 100%
    );

  pointer-events: none;
}

.chapter--hero .visual-field::after,
.chapter--visitor .visual-field::after {
  background:
    radial-gradient(
      circle at 50% 50%,
      transparent 30%,
      rgba(0,0,0,.16) 100%
    );
}


/* =========================================================
   39. INTERACTION STATES
========================================================= */

.direction-item,
.direction-door,
.trace-row,
.menu-navigation a,
.contact-cta {
  will-change: transform;
}

.direction-item::after,
.direction-door::after {
  content: "";

  position: absolute;

  pointer-events: none;
}

.direction-item,
.direction-door {
  position: relative;
}


/* =========================================================
   40. FINAL LOGO RULE
   Il logo originale NON viene mai alterato.
========================================================= */

.site-brand__mark img,
.site-loader__inner img,
.directions-core img,
.visual-logo-anchor img,
.epilogue-mark img,
.site-footer__logo img,
.standby-screen__mark img {
  filter: none !important;
  mix-blend-mode: normal !important;
}
