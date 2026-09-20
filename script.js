```javascript
"use strict";

/*
==========================================================
 CESARE PARATORE
 MOVIMENTO / DIREZIONE

 SCRIPT.JS DEFINITIVO 10/10
 PARTE 1/2

 CORE EXPERIENCE ENGINE

 - Loader
 - Motion System
 - Navigation
 - Progress
 - Reveal
 - Menu
 - Accessibility
 - Scroll Intelligence
==========================================================
*/


const CONFIG = {

    loader: {
        min: 700,
        max: 2200,
        hideDelay: 700
    },


    scroll: {
        offset: 18,
        smooth: true,
        threshold: .52
    },


    reveal: {
        threshold: .15,
        rootMargin: "0px 0px -10% 0px"
    },


    motion: {
        cursorLerp: .18,
        trajectoryLerp: .09,
        drift:18
    },


    standby: {
        delay:45000,
        minWidth:700
    }

};





const STATE = {

    loaded:false,

    section:0,

    menu:false,

    reduced:false,

    standby:false,


    pointer:{
        x:window.innerWidth/2,
        y:window.innerHeight/2
    },


    cursor:{
        x:window.innerWidth/2,
        y:window.innerHeight/2
    },


    trajectory:{
        current:0,
        target:0
    },


    menuReturn:null,

    standbyReturn:null,

    raf:null

};





const $ = selector =>
document.querySelector(selector);



const $$ = selector =>
[
...document.querySelectorAll(selector)
];





const DOM = {


    html:
    document.documentElement,


    body:
    document.body,


    loader:
    $(".page-loader"),


    header:
    $(".site-header"),


    menu:
    $(".site-menu"),


    menuButton:
    $(".menu-trigger"),


    menuLinks:
    $$(".site-menu-nav a"),


    sections:
    $$(".home-section"),


    reveals:
    $$(".reveal"),


    progress:
    $(".progress-fill"),


    progressPoint:
    $(".progress-point"),


    progressLabel:
    $("#progress-current"),


    prev:
    $("#previous-section"),


    next:
    $("#next-section"),


    cursor:
    $(".custom-cursor"),


    cursorDot:
    $(".custom-cursor-dot"),


    cursorRing:
    $(".custom-cursor-ring"),


    standby:
    $(".standby-screen"),


    wake:
    $(".standby-wake")

};





/*
==========================================================
 UTILITY
==========================================================
*/


const clamp = (value,min,max)=>
Math.min(
Math.max(value,min),
max
);



const lerp = (a,b,t)=>
a+(b-a)*t;



const sectionNumber = i =>
String(i+1).padStart(2,"0");





function reducedMotion(){

    const media =
    window.matchMedia(
    "(prefers-reduced-motion: reduce)"
    );


    const update = ()=>{

        STATE.reduced =
        media.matches;


        DOM.html.classList.toggle(
            "reduced-motion",
            STATE.reduced
        );

    };


    update();


    media.addEventListener(
        "change",
        update
    );

}





/*
==========================================================
 LOADER
==========================================================
*/


function initLoader(){


    if(!DOM.loader){

        STATE.loaded=true;
        return;

    }


    const start =
    performance.now();


    let finished=false;



    const finish=()=>{


        if(finished)
        return;


        finished=true;


        const elapsed =
        performance.now()-start;



        const wait =
        Math.max(
            0,
            CONFIG.loader.min-elapsed
        );



        setTimeout(()=>{


            STATE.loaded=true;


            DOM.loader.classList.add(
                "is-hidden"
            );



            setTimeout(()=>{


                DOM.loader.remove();


            },CONFIG.loader.hideDelay);



        },wait);


    };



    window.addEventListener(
        "load",
        finish,
        {once:true}
    );



    setTimeout(
        finish,
        CONFIG.loader.max
    );


}





/*
==========================================================
 NAVIGATION
==========================================================
*/


function updateNavigation(){


    const active =
    DOM.sections[STATE.section];


    if(!active)
    return;



    const total =
    DOM.sections.length;



    const progress =
    total<=1
    ?0
    :
    STATE.section/(total-1);



    DOM.progress?.style.setProperty(
        "width",
        `${progress*100}%`
    );



    DOM.progressPoint?.style.setProperty(
        "left",
        `${progress*100}%`
    );



    if(DOM.progressLabel){

        DOM.progressLabel.textContent =
        active.dataset.sectionTitle || "";

    }


}





function detectSection(){


    let current =
    STATE.section;


    let closest =
    Infinity;



    DOM.sections.forEach(
    (section,index)=>{


        const rect =
        section.getBoundingClientRect();



        if(
        rect.bottom < 0 ||
        rect.top > innerHeight
        )
        return;



        const distance =
        Math.abs(
        rect.top+
        rect.height/2-
        innerHeight*.5
        );



        if(distance<closest){

            closest=distance;
            current=index;

        }


    });



    if(current!==STATE.section){

        STATE.section=current;
        updateNavigation();

    }


}





function goToSection(index){


    const section =
    DOM.sections[index];


    if(!section)
    return;



    const offset =
    DOM.header?.offsetHeight || 0;



    const y =
    section.offsetTop-
    offset-
    CONFIG.scroll.offset;



    window.scrollTo({

        top:y,

        behavior:
        STATE.reduced
        ?
        "auto"
        :
        "smooth"

    });


}






/*
==========================================================
 REVEAL ENGINE
==========================================================
*/


function initReveal(){


    if(
    STATE.reduced ||
    !("IntersectionObserver" in window)
    ){

        DOM.reveals.forEach(
        el=>
        el.classList.add(
        "is-visible"
        )
        );


        return;

    }



    const observer =
    new IntersectionObserver(

    entries=>{


        entries.forEach(
        entry=>{


            if(!entry.isIntersecting)
            return;



            entry.target.classList.add(
                "is-visible"
            );



            observer.unobserve(
                entry.target
            );


        });


    },


    {

        threshold:
        CONFIG.reveal.threshold,


        rootMargin:
        CONFIG.reveal.rootMargin

    });



    DOM.reveals.forEach(
    element=>
    observer.observe(element)
    );


}





/*
==========================================================
 MENU
==========================================================
*/


function initMenu(){


    if(!DOM.menuButton ||
       !DOM.menu)
    return;



    const open=()=>{


        STATE.menu=true;


        STATE.menuReturn =
        document.activeElement;



        DOM.menu.classList.add(
            "is-open"
        );


        DOM.menu.setAttribute(
            "aria-hidden",
            "false"
        );


        DOM.body.classList.add(
            "is-menu-open"
        );


        DOM.menuLinks[0]?.focus();


    };





    const close=()=>{


        STATE.menu=false;


        DOM.menu.classList.remove(
            "is-open"
        );


        DOM.menu.setAttribute(
            "aria-hidden",
            "true"
        );


        DOM.body.classList.remove(
            "is-menu-open"
        );


        STATE.menuReturn?.focus();


    };




    DOM.menuButton.addEventListener(
        "click",
        ()=>{
            STATE.menu
            ?
            close()
            :
            open();
        }
    );



    DOM.menuLinks.forEach(
    link=>
    link.addEventListener(
        "click",
        close
    ));



    document.addEventListener(
        "keydown",
        event=>{


            if(
            event.key==="Escape" &&
            STATE.menu
            ){

                close();

            }


        }
    );


}
```
```javascript
/*
==========================================================
 CESARE PARATORE
 MOVIMENTO / DIREZIONE

 SCRIPT.JS DEFINITIVO 10/10
 PARTE 2/2

 PREMIUM INTERACTION ENGINE

 - Cursor
 - Magnetic Motion
 - Narrative Trajectory
 - Standby Experience
 - Performance Loop
 - Resize
 - Final Boot
==========================================================
*/



/*
==========================================================
 CURSOR PREMIUM
==========================================================
*/


function initCursor(){


    if(
        STATE.reduced ||
        !DOM.cursor ||
        !DOM.cursorDot ||
        !DOM.cursorRing ||
        !matchMedia("(pointer:fine)").matches
    )
    return;



    window.addEventListener(
        "pointermove",
        event=>{


            STATE.pointer.x =
            event.clientX;


            STATE.pointer.y =
            event.clientY;



            DOM.cursor.classList.add(
                "is-visible"
            );


        },
        {
            passive:true
        }
    );



    $$("a,button").forEach(
    element=>{


        element.addEventListener(
            "pointerenter",
            ()=>{

                DOM.cursor.classList.add(
                    "is-hovering"
                );

            }
        );



        element.addEventListener(
            "pointerleave",
            ()=>{

                DOM.cursor.classList.remove(
                    "is-hovering"
                );

            }
        );


    });



    window.addEventListener(
        "pointerleave",
        ()=>{

            DOM.cursor.classList.remove(
                "is-visible"
            );

        }
    );


}





function updateCursor(){


    if(
        !DOM.cursor ||
        STATE.reduced
    )
    return;



    STATE.cursor.x =
    lerp(
        STATE.cursor.x,
        STATE.pointer.x,
        CONFIG.motion.cursorLerp
    );


    STATE.cursor.y =
    lerp(
        STATE.cursor.y,
        STATE.pointer.y,
        CONFIG.motion.cursorLerp
    );



    DOM.cursorDot.style.transform =
    `
    translate3d(
        ${STATE.pointer.x}px,
        ${STATE.pointer.y}px,
        0
    )
    translate(-50%,-50%)
    `;



    DOM.cursorRing.style.transform =
    `
    translate3d(
        ${STATE.cursor.x}px,
        ${STATE.cursor.y}px,
        0
    )
    translate(-50%,-50%)
    `;


}





/*
==========================================================
 MAGNETIC ELEMENTS
==========================================================
*/


function initMagnetic(){


    if(
        STATE.reduced ||
        !matchMedia("(pointer:fine)").matches
    )
    return;



    $$(".magnetic").forEach(
    element=>{


        element.addEventListener(
            "pointermove",
            event=>{


                const rect =
                element.getBoundingClientRect();



                const x =
                event.clientX -
                (
                    rect.left+
                    rect.width/2
                );



                const y =
                event.clientY -
                (
                    rect.top+
                    rect.height/2
                );



                const strength=.12;



                element.style.transform =
                `
                translate(
                ${x*strength}px,
                ${y*strength}px
                )
                `;


            }
        );



        element.addEventListener(
            "pointerleave",
            ()=>{


                element.style.transform =
                "";

            }
        );


    });


}





/*
==========================================================
 NARRATIVE TRAJECTORY
==========================================================
*/


function updateTrajectory(){


    if(DOM.sections.length<2)
    return;



    const first =
    DOM.sections[0];


    const last =
    DOM.sections[
        DOM.sections.length-1
    ];



    const start =
    first.offsetTop;



    const end =
    last.offsetTop+
    last.offsetHeight-
    innerHeight;



    const progress =
    (scrollY-start)/
    (end-start);



    STATE.trajectory.target =
    clamp(
        progress,
        0,
        1
    );



}





function animateTrajectory(){


    STATE.trajectory.current =
    lerp(
        STATE.trajectory.current,
        STATE.trajectory.target,
        CONFIG.motion.trajectoryLerp
    );



    DOM.html.style.setProperty(
        "--trajectory-progress",
        STATE.trajectory.current
    );



}





/*
==========================================================
 STANDBY CINEMATIC MODE
==========================================================
*/


function initStandby(){


    if(!DOM.standby)
    return;



    let timer;



    const reset=()=>{


        clearTimeout(timer);



        if(
            STATE.reduced ||
            innerWidth <
            CONFIG.standby.minWidth
        )
        return;



        timer =
        setTimeout(
        ()=>{


            if(
                STATE.menu ||
                document.hidden
            )
            return;



            STATE.standby=true;



            DOM.standby.classList.add(
                "is-active"
            );


            DOM.body.classList.add(
                "is-standby"
            );


        },
        CONFIG.standby.delay);



    };





    [
        "mousemove",
        "scroll",
        "wheel",
        "touchstart"
    ]
    .forEach(
    event=>

        window.addEventListener(
            event,
            ()=>{


                if(STATE.standby){

                    closeStandby();

                }


                reset();


            },
            {
                passive:true
            }
        )
    );





    DOM.wake?.addEventListener(
        "click",
        closeStandby
    );



    reset();


}





function closeStandby(){


    STATE.standby=false;


    DOM.standby?.classList.remove(
        "is-active"
    );


    DOM.body.classList.remove(
        "is-standby"
    );


}





/*
==========================================================
 KEYBOARD NAVIGATION
==========================================================
*/


function initKeyboard(){


    document.addEventListener(
        "keydown",
        event=>{


            if(
                STATE.menu ||
                STATE.standby
            )
            return;



            if(
                event.key==="PageDown"
            ){

                event.preventDefault();


                goToSection(
                    clamp(
                        STATE.section+1,
                        0,
                        DOM.sections.length-1
                    )
                );


            }



            if(
                event.key==="PageUp"
            ){

                event.preventDefault();


                goToSection(
                    clamp(
                        STATE.section-1,
                        0,
                        DOM.sections.length-1
                    )
                );


            }


        }
    );


}





/*
==========================================================
 RESIZE
==========================================================
*/


function initResize(){


    let timer;



    window.addEventListener(
        "resize",
        ()=>{


            clearTimeout(timer);



            timer =
            setTimeout(
            ()=>{


                detectSection();

                updateTrajectory();


            },
            160);



        },
        {
            passive:true
        }
    );


}





/*
==========================================================
 SCROLL ENGINE
==========================================================
*/


function initScroll(){


    let ticking=false;



    window.addEventListener(
        "scroll",
        ()=>{


            if(ticking)
            return;



            ticking=true;



            requestAnimationFrame(
            ()=>{


                detectSection();


                updateTrajectory();


                ticking=false;


            });


        },
        {
            passive:true
        }
    );


}





/*
==========================================================
 MAIN LOOP
==========================================================
*/


function loop(){


    updateCursor();


    animateTrajectory();


    STATE.raf =
    requestAnimationFrame(
        loop
    );


}





/*
==========================================================
 BOOT
==========================================================
*/


function init(){


    reducedMotion();


    initLoader();


    initReveal();


    initMenu();


    initCursor();


    initMagnetic();


    initStandby();


    initKeyboard();


    initScroll();


    initResize();



    detectSection();


    updateNavigation();


    updateTrajectory();



    loop();


}




if(
document.readyState==="loading"
){

    document.addEventListener(
        "DOMContentLoaded",
        init,
        {
            once:true
        }
    );


}
else{

    init();

}
```
