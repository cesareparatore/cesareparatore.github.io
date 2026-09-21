/* =========================================================
   CESARE PARATORE — HOME
   SCRIPT.JS
   VERSIONE 1.0
========================================================= */

(() => {
    "use strict";


    /* =====================================================
       01 — DOM
    ====================================================== */

    const body = document.body;

    const loader = document.getElementById("loader");

    const standby = document.getElementById("standby");

    const menuToggle = document.getElementById("menu-toggle");
    const menuClose = document.getElementById("menu-close");
    const globalMenu = document.getElementById("global-menu");

    const pageTurn = document.getElementById("page-turn");
    const pageTurnTitle = document.getElementById("page-turn-title");

    const pageTurnPrev = document.getElementById("page-turn-prev");
    const pageTurnNext = document.getElementById("page-turn-next");

    const pageTurnPrevNumber =
        document.getElementById("page-turn-prev-number");

    const pageTurnNextNumber =
        document.getElementById("page-turn-next-number");

    const pageTurnProgress =
        document.getElementById("page-turn-progress");

    const pageTurnMarker =
        document.getElementById("page-turn-marker");

    const sections = [
        ...document.querySelectorAll(
            ".story-section[data-section]"
        )
    ];


    /* =====================================================
       02 — STATE
    ====================================================== */

    let currentIndex = 0;

    let isMenuOpen = false;
    let isStandby = false;

    let inactivityTimer = null;

    let standbyReturnPosition = 0;

    let loaderCompleted = false;

    let isScrollingProgrammatically = false;

    let scrollTimeout = null;

    const STANDBY_DELAY = 40000;

    const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    );


    /* =====================================================
       03 — UTILITIES
    ====================================================== */

    const clamp = (value, min, max) => {
        return Math.min(Math.max(value, min), max);
    };


    const getSectionTop = (section) => {
        const rect = section.getBoundingClientRect();

        return (
            rect.top +
            window.scrollY -
            getNavigationOffset()
        );
    };


    const getNavigationOffset = () => {
        const header = document.getElementById("site-header");

        const headerHeight =
            header?.offsetHeight || 0;

        const pageTurnHeight =
            pageTurn?.offsetHeight || 0;

        return headerHeight + pageTurnHeight;
    };


    const getSectionIndexFromElement = (section) => {
        return sections.indexOf(section);
    };


    /* =====================================================
       04 — LOADER
    ====================================================== */

    const finishLoader = () => {

        if (loaderCompleted) {
            return;
        }

        loaderCompleted = true;

        const minimumLoaderTime =
            reducedMotion.matches ? 400 : 2600;

        window.setTimeout(() => {

            if (!loader) {
                body.classList.remove("is-loading");
                return;
            }

            loader.classList.add("is-hidden");

            body.classList.remove("is-loading");

            window.setTimeout(() => {
                loader.setAttribute("aria-hidden", "true");
            }, 1000);

            resetInactivityTimer();

        }, minimumLoaderTime);
    };


    /*
     * Il loader non deve aspettare indefinitamente
     * eventuali asset secondari.
     *
     * Il browser ha già iniziato a caricare il documento
     * e il CSS gestisce la sequenza visiva.
     */

    if (document.readyState === "complete") {
        finishLoader();
    } else {
        window.addEventListener(
            "load",
            finishLoader,
            { once: true }
        );
    }


    /* =====================================================
       05 — GLOBAL MENU
    ====================================================== */

    const openMenu = () => {

        if (isStandby) {
            return;
        }

        isMenuOpen = true;

        globalMenu.classList.add("is-open");

        globalMenu.setAttribute(
            "aria-hidden",
            "false"
        );

        menuToggle.setAttribute(
            "aria-expanded",
            "true"
        );

        menuToggle.setAttribute(
            "aria-label",
            "Chiudi menu"
        );

        body.classList.add("menu-is-open");

        clearInactivityTimer();

        window.setTimeout(() => {
            menuClose?.focus();
        }, 150);
    };


    const closeMenu = ({
        restoreFocus = true,
        restartTimer = true
    } = {}) => {

        isMenuOpen = false;

        globalMenu.classList.remove("is-open");

        globalMenu.setAttribute(
            "aria-hidden",
            "true"
        );

        menuToggle.setAttribute(
            "aria-expanded",
            "false"
        );

        menuToggle.setAttribute(
            "aria-label",
            "Apri menu"
        );

        body.classList.remove("menu-is-open");

        if (restoreFocus) {
            menuToggle.focus();
        }

        if (restartTimer) {
            resetInactivityTimer();
        }
    };


    menuToggle?.addEventListener(
        "click",
        () => {

            if (isMenuOpen) {
                closeMenu();
            } else {
                openMenu();
            }
        }
    );


    menuClose?.addEventListener(
        "click",
        () => {
            closeMenu();
        }
    );


    /* =====================================================
       06 — MENU LINK
    ====================================================== */

    const menuLinks = [
        ...document.querySelectorAll(
            ".global-navigation a"
        )
    ];

    menuLinks.forEach((link) => {

        link.addEventListener(
            "click",
            () => {
                closeMenu({
                    restoreFocus: false,
                    restartTimer: false
                });
            }
        );

    });


    /* =====================================================
       07 — PAGE TURN
    ====================================================== */

    const updatePageTurn = (index) => {

        if (!sections.length) {
            return;
        }

        currentIndex = clamp(
            index,
            0,
            sections.length - 1
        );

        const currentSection =
            sections[currentIndex];

        const currentTitle =
            currentSection.dataset.title ||
            currentSection.id ||
            "";

        pageTurnTitle.textContent =
            currentTitle;


        /* Previous */

        const hasPrevious =
            currentIndex > 0;

        pageTurnPrev.disabled =
            !hasPrevious;

        pageTurnPrevNumber.textContent =
            hasPrevious
                ? String(currentIndex).padStart(2, "0")
                : "00";


        /* Next */

        const hasNext =
            currentIndex < sections.length - 1;

        pageTurnNext.disabled =
            !hasNext;

        pageTurnNextNumber.textContent =
            hasNext
                ? String(currentIndex + 2).padStart(2, "0")
                : "00";


        /* Narrative progress */

        const denominator =
            Math.max(sections.length - 1, 1);

        const progress =
            (currentIndex / denominator) * 100;

        pageTurnProgress.style.width =
            `${progress}%`;

        pageTurnMarker.style.left =
            `${progress}%`;
    };


    /* =====================================================
       08 — SECTION NAVIGATION
    ====================================================== */

    const goToSection = (
        index,
        {
            updateState = true
        } = {}
    ) => {

        if (!sections.length) {
            return;
        }

        const targetIndex = clamp(
            index,
            0,
            sections.length - 1
        );

        const targetSection =
            sections[targetIndex];

        if (!targetSection) {
            return;
        }

        if (updateState) {
            updatePageTurn(targetIndex);
        }

        isScrollingProgrammatically = true;

        const targetTop =
            getSectionTop(targetSection);

        window.scrollTo({
            top: Math.max(targetTop, 0),
            behavior: reducedMotion.matches
                ? "auto"
                : "smooth"
        });

        window.clearTimeout(scrollTimeout);

        scrollTimeout = window.setTimeout(
            () => {
                isScrollingProgrammatically = false;
                resetInactivityTimer();
            },
            reducedMotion.matches ? 100 : 1000
        );
    };


    pageTurnPrev?.addEventListener(
        "click",
        () => {

            if (currentIndex <= 0) {
                return;
            }

            goToSection(
                currentIndex - 1
            );
        }
    );


    pageTurnNext?.addEventListener(
        "click",
        () => {

            if (
                currentIndex >=
                sections.length - 1
            ) {
                return;
            }

            goToSection(
                currentIndex + 1
            );
        }
    );


    /* =====================================================
       09 — INTERSECTION OBSERVER
    ====================================================== */

    const sectionObserver =
        new IntersectionObserver(
            (entries) => {

                if (isScrollingProgrammatically) {
                    return;
                }

                const visibleEntries =
                    entries
                        .filter(
                            (entry) =>
                                entry.isIntersecting
                        )
                        .sort(
                            (a, b) =>
                                b.intersectionRatio -
                                a.intersectionRatio
                        );

                if (!visibleEntries.length) {
                    return;
                }

                const section =
                    visibleEntries[0].target;

                const index =
                    getSectionIndexFromElement(
                        section
                    );

                if (index !== -1) {
                    updatePageTurn(index);
                }
            },
            {
                root: null,

                threshold: [
                    0.2,
                    0.35,
                    0.5,
                    0.65,
                    0.8
                ],

                rootMargin:
                    "-15% 0px -20% 0px"
            }
        );


    sections.forEach((section) => {
        sectionObserver.observe(section);
    });


    /* =====================================================
       10 — INITIAL PAGE TURN
    ====================================================== */

    updatePageTurn(0);


    /* =====================================================
       11 — KEYBOARD NAVIGATION
    ====================================================== */

    document.addEventListener(
        "keydown",
        (event) => {

            /*
             * ESC
             */

            if (event.key === "Escape") {

                if (isMenuOpen) {
                    closeMenu();
                    return;
                }

                if (isStandby) {
                    exitStandby();
                    return;
                }
            }


            /*
             * Non intercettare le frecce mentre l'utente
             * sta scrivendo in un input o textarea.
             */

            const activeElement =
                document.activeElement;

            const isTyping =
                activeElement &&
                (
                    activeElement.tagName === "INPUT" ||
                    activeElement.tagName === "TEXTAREA" ||
                    activeElement.isContentEditable
                );

            if (isTyping) {
                return;
            }


            /*
             * Page Turn con frecce
             */

            if (
                event.key === "ArrowRight" ||
                event.key === "PageDown"
            ) {

                event.preventDefault();

                if (!isStandby && !isMenuOpen) {
                    goToSection(
                        currentIndex + 1
                    );
                }

                return;
            }


            if (
                event.key === "ArrowLeft" ||
                event.key === "PageUp"
            ) {

                event.preventDefault();

                if (!isStandby && !isMenuOpen) {
                    goToSection(
                        currentIndex - 1
                    );
                }

                return;
            }
        }
    );


    /* =====================================================
       12 — STANDBY TIMER
    ====================================================== */

    const clearInactivityTimer = () => {

        if (inactivityTimer !== null) {

            window.clearTimeout(
                inactivityTimer
            );

            inactivityTimer = null;
        }
    };


    const resetInactivityTimer = () => {

        clearInactivityTimer();

        if (
            !loaderCompleted ||
            isStandby ||
            isMenuOpen
        ) {
            return;
        }

        inactivityTimer =
            window.setTimeout(
                enterStandby,
                STANDBY_DELAY
            );
    };


    /* =====================================================
       13 — ENTER STANDBY
    ====================================================== */

    const enterStandby = () => {

        if (
            isStandby ||
            isMenuOpen ||
            !loaderCompleted
        ) {
            return;
        }

        standbyReturnPosition =
            window.scrollY;

        isStandby = true;

        standby.classList.add(
            "is-active"
        );

        standby.setAttribute(
            "aria-hidden",
            "false"
        );

        clearInactivityTimer();

        /*
         * Il Page Turn e il contenuto rimangono nello stato
         * originale dietro allo standby.
         */
    };


    /* =====================================================
       14 — EXIT STANDBY
    ====================================================== */

    const exitStandby = () => {

        if (!isStandby) {
            return;
        }

        isStandby = false;

        standby.classList.remove(
            "is-active"
        );

        standby.setAttribute(
            "aria-hidden",
            "true"
        );

        /*
         * Il ritorno deve mantenere esattamente la posizione
         * narrativa precedente.
         */

        window.requestAnimationFrame(() => {

            window.scrollTo({
                top: standbyReturnPosition,
                behavior: reducedMotion.matches
                    ? "auto"
                    : "smooth"
            });

            resetInactivityTimer();
        });
    };


    /* =====================================================
       15 — USER ACTIVITY
    ====================================================== */

    const activityEvents = [
        "mousemove",
        "mousedown",
        "pointerdown",
        "touchstart",
        "wheel",
        "scroll",
        "keydown"
    ];


    activityEvents.forEach((eventName) => {

        window.addEventListener(
            eventName,
            () => {

                /*
                 * Qualsiasi interazione risveglia lo standby.
                 */

                if (isStandby) {
                    exitStandby();
                    return;
                }

                /*
                 * L'interazione normale resetta il timer,
                 * tranne durante lo scroll continuo.
                 */

                if (eventName !== "scroll") {
                    resetInactivityTimer();
                }
            },
            {
                passive:
                    eventName !== "keydown"
            }
        );

    });


    /* =====================================================
       16 — SCROLL ACTIVITY
    ====================================================== */

    let scrollActivityTimer = null;

    window.addEventListener(
        "scroll",
        () => {

            if (isStandby) {
                return;
            }

            window.clearTimeout(
                scrollActivityTimer
            );

            scrollActivityTimer =
                window.setTimeout(
                    () => {
                        resetInactivityTimer();
                    },
                    250
                );
        },
        {
            passive: true
        }
    );


    /* =====================================================
       17 — TOUCH / POINTER
    ====================================================== */

    standby?.addEventListener(
        "pointerdown",
        () => {
            exitStandby();
        }
    );


    standby?.addEventListener(
        "touchstart",
        () => {
            exitStandby();
        },
        {
            passive: true
        }
    );


    /* =====================================================
       18 — MENU OUTSIDE CLICK
    ====================================================== */

    globalMenu?.addEventListener(
        "click",
        (event) => {

            if (
                event.target === globalMenu
            ) {
                closeMenu();
            }
        }
    );


    /* =====================================================
       19 — RESIZE
    ====================================================== */

    let resizeTimer = null;

    window.addEventListener(
        "resize",
        () => {

            window.clearTimeout(
                resizeTimer
            );

            resizeTimer =
                window.setTimeout(
                    () => {

                        /*
                         * Ricalcola la posizione della sezione
                         * attiva senza cambiare la narrazione.
                         */

                        updatePageTurn(
                            currentIndex
                        );

                    },
                    150
                );
        }
    );


    /* =====================================================
       20 — VISIBILITY CHANGE
    ====================================================== */

    document.addEventListener(
        "visibilitychange",
        () => {

            if (document.hidden) {

                clearInactivityTimer();

                return;
            }

            /*
             * Quando l'utente torna alla scheda,
             * ripartiamo con un nuovo periodo di quiete.
             */

            if (!isStandby && !isMenuOpen) {
                resetInactivityTimer();
            }
        }
    );


    /* =====================================================
       21 — INITIALIZATION
    ====================================================== */

    const initialize = () => {

        updatePageTurn(0);

        /*
         * Evita che il browser mantenga una posizione
         * precedente durante un reload.
         */

        if ("scrollRestoration" in history) {
            history.scrollRestoration = "manual";
        }

        window.scrollTo({
            top: 0,
            left: 0,
            behavior: "auto"
        });

    };


    initialize();


    /* =====================================================
       22 — DEBUG HOOK
       Disattivato di default.
    ====================================================== */

    /*
     * Per eventuale sviluppo futuro:
     *
     * window.CesareHome = {
     *     goToSection,
     *     enterStandby,
     *     exitStandby,
     *     openMenu,
     *     closeMenu
     * };
     */

})();
