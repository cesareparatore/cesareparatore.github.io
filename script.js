(() => {
"use strict";


/* =========================================================
   DOM
   ========================================================= */


const root =
  document.documentElement;

const body =
  document.body;


const loader =
  document.getElementById("loader");


const menu =
  document.getElementById("menu-overlay");


const menuTrigger =
  document.getElementById("menu-trigger");


const menuClose =
  document.getElementById("menu-close");


const menuTriggerLine =
  document.querySelector(
    ".menu-trigger__line"
  );


const menuTriggerText =
  document.querySelector(
    ".menu-trigger__text"
  );


const progressFill =
  document.getElementById(
    "progress-fill"
  );


const progressPoint =
  document.getElementById(
    "progress-point"
  );


const progressCurrent =
  document.getElementById(
    "progress-current"
  );


const progressPrevious =
  document.getElementById(
    "progress-previous"
  );


const progressNext =
  document.getElementById(
    "progress-next"
  );


const idleScreen =
  document.getElementById(
    "idle-screen"
  );


const scenes = [

  document.getElementById(
    "cover"
  ),

  ...Array.from(
    document.querySelectorAll(
      ".chapter"
    )
  )

].filter(Boolean);



const menuLinks =
  Array.from(
    document.querySelectorAll(
      "[data-menu-link]"
    )
  );



const reducedMotion =
  window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );



const coarsePointer =
  window.matchMedia(
    "(pointer: coarse)"
  );




/* =========================================================
   STATE
   ========================================================= */


const state = {


  currentIndex:0,


  currentProgress:0,


  targetProgress:0,


  menuOpen:false,


  idle:false,


  loaderDone:false,


  rafId:0,


  scrollDirty:false,


  resizeDirty:false,


  lastInteraction:
    performance.now()


};



let loadFinished =
  document.readyState === "complete";




/* =========================================================
   HELPERS
   ========================================================= */


const clamp = (
  value,
  min = 0,
  max = 1
) =>

Math.min(
  max,
  Math.max(
    min,
    value
  )
);



const lerp = (
  a,
  b,
  amount
) =>

a + (b - a) * amount;



const easeOut = (
  value
) =>

1 -
Math.pow(
  1 - clamp(value),
  3
);




/* =========================================================
   SCENE PROGRESS
   ========================================================= */


const sceneProgress =
(scene) => {


  const rect =
    scene.getBoundingClientRect();



  const travel =
    Math.max(
      1,
      scene.offsetHeight -
      window.innerHeight
    );



  return clamp(
    -rect.top / travel
  );


};





function getCurrentScene(){


  const viewportCenter =
    window.innerHeight / 2;



  let bestIndex = 0;

  let bestDistance =
    Infinity;



  scenes.forEach(
    (scene,index)=>{


      const rect =
        scene.getBoundingClientRect();



      const sceneCenter =
        rect.top +
        rect.height / 2;



      const distance =
        Math.abs(
          sceneCenter -
          viewportCenter
        );



      if(
        distance <
        bestDistance
      ){

        bestDistance =
          distance;


        bestIndex =
          index;

      }


    }
  );



  return bestIndex;


}





function getSceneProgress(index){


  if(index === 0){


    const rect =
      scenes[0]
      .getBoundingClientRect();



    return clamp(
      -rect.top /
      Math.max(
        1,
        window.innerHeight
      )
    );


  }



  return sceneProgress(
    scenes[index]
  );


}





function updateStateFromScroll(){


  const nextIndex =
    getCurrentScene();



  const nextProgress =
    getSceneProgress(
      nextIndex
    );



  state.currentIndex =
    nextIndex;



  state.targetProgress =
    nextProgress;


}




/* =========================================================
   GLOBAL JOURNEY PROGRESS
   ========================================================= */


function getJourneyProgress(){


  const scrollTop =
    window.scrollY ||
    window.pageYOffset;



  const maxScroll =
    Math.max(
      1,
      document.documentElement
      .scrollHeight -
      window.innerHeight
    );



  return clamp(
    scrollTop /
    maxScroll
  );


}






/* =========================================================
   RENDER
   ========================================================= */


function render(){


  const index =
    state.currentIndex;



  const progress =
    state.currentProgress;



  const journeyProgress =
    getJourneyProgress();




  root.style.setProperty(
    "--chapter-progress",
    progress.toFixed(4)
  );


  const easedProgress =
    easeOut(progress);



  root.style.setProperty(
    "--trajectory-progress",
    easedProgress.toFixed(4)
  );


  root.style.setProperty(
    "--convergence-progress",
    easedProgress.toFixed(4)
  );


  root.style.setProperty(
    "--encounter-progress",
    easedProgress.toFixed(4)
  );


  root.style.setProperty(
    "--final-progress",
    easedProgress.toFixed(4)
  );


  root.style.setProperty(
    "--journey-progress",
    journeyProgress.toFixed(4)
  );



  if(progressFill){

    progressFill.style.width =
      `${journeyProgress * 100}%`;

  }



  if(progressPoint){

    progressPoint.style.left =
      `${journeyProgress * 100}%`;

  }



  updateHeaderLabel(
    index
  );



  state.scrollDirty =
    false;


  state.resizeDirty =
    false;


  state.rafId =
    0;


}
/* =========================================================
   HEADER LABEL
   ========================================================= */


function getSceneTitle(index){


  if(index === 0){

    return "COVER";

  }


  const scene =
    scenes[index];


  return (
    scene?.dataset.title ||
    String(index)
    .padStart(2,"0")
  );


}





function setHeaderItem(
  element,
  value
){


  if(!element){

    return;

  }



  if(!value){


    element.textContent =
      "";


    element.classList.add(
      "is-empty"
    );


    return;


  }



  element.textContent =
    value;


  element.classList.remove(
    "is-empty"
  );


}





function updateHeaderLabel(
  index
){


  setHeaderItem(
    progressCurrent,
    getSceneTitle(index)
  );



  setHeaderItem(
    progressPrevious,
    index > 0
      ? getSceneTitle(index - 1)
      : ""
  );



  setHeaderItem(
    progressNext,
    index < scenes.length - 1
      ? getSceneTitle(index + 1)
      : ""
  );


}






/* =========================================================
   RAF
   ========================================================= */


function requestRender(){


  if(state.rafId){

    return;

  }



  state.rafId =
    requestAnimationFrame(
      frame
    );


}





function frame(){


  if(
    state.scrollDirty ||
    state.resizeDirty
  ){

    updateStateFromScroll();

  }



  const target =
    state.targetProgress;



  if(
    reducedMotion.matches
  ){


    state.currentProgress =
      target;


  }else{


    state.currentProgress =
      lerp(
        state.currentProgress,
        target,
        .13
      );


  }





  render();




  const difference =
    Math.abs(
      state.currentProgress -
      target
    );




  if(
    state.scrollDirty ||
    state.resizeDirty ||
    difference > .0005
  ){


    state.rafId =
      requestAnimationFrame(
        frame
      );


  }else{


    state.rafId =
      0;


  }


}







/* =========================================================
   SCROLL / RESIZE
   ========================================================= */


function onScroll(){


  state.scrollDirty =
    true;


  registerInteraction();


  requestRender();


}





function onResize(){


  state.resizeDirty =
    true;


  requestRender();


}






/* =========================================================
   NAVIGATION
   ========================================================= */


function goToScene(
  index
){


  const targetIndex =
    clamp(
      index,
      0,
      scenes.length - 1
    );



  const target =
    scenes[targetIndex];



  if(!target){

    return;

  }



  closeMenu(false);



  target.scrollIntoView({

    behavior:
      reducedMotion.matches
      ? "auto"
      : "smooth",


    block:"start"

  });


}





function goNext(){


  goToScene(
    state.currentIndex + 1
  );


}





function goPrevious(){


  goToScene(
    state.currentIndex - 1
  );


}







/* =========================================================
   MENU
   ========================================================= */


function openMenu(){


  if(!menu){

    return;

  }



  state.menuOpen =
    true;



  menu.classList.add(
    "is-open"
  );



  menu.setAttribute(
    "aria-hidden",
    "false"
  );



  menuTrigger?.setAttribute(
    "aria-expanded",
    "true"
  );



  if(menuTriggerText){


    menuTriggerText.textContent =
      "CHIUDI";


  }



  menuTriggerLine?.classList.add(
    "is-open"
  );



  body.classList.add(
    "menu-open"
  );



  window.setTimeout(()=>{


    menuClose?.focus();


  },50);



}





function closeMenu(
  returnFocus = true
){


  if(!menu){

    return;

  }



  state.menuOpen =
    false;



  menu.classList.remove(
    "is-open"
  );



  menu.setAttribute(
    "aria-hidden",
    "true"
  );



  menuTrigger?.setAttribute(
    "aria-expanded",
    "false"
  );



  if(menuTriggerText){


    menuTriggerText.textContent =
      "MENU";


  }



  menuTriggerLine?.classList.remove(
    "is-open"
  );



  body.classList.remove(
    "menu-open"
  );



  if(
    returnFocus &&
    document.activeElement !==
    menuTrigger
  ){


    menuTrigger?.focus();


  }


}





menuTrigger?.addEventListener(
  "click",
  ()=>{


    state.menuOpen
      ? closeMenu()
      : openMenu();


  }
);





menuClose?.addEventListener(
  "click",
  ()=>{

    closeMenu();

  }
);





menuLinks.forEach(
  (link)=>{


    link.addEventListener(
      "click",
      ()=>{


        const index =
          Number(
            link.dataset.menuLink
          );



        closeMenu(false);


        goToScene(index);



      }
    );


  }
);






/* =========================================================
   KEYBOARD NAVIGATION
   ========================================================= */


document.addEventListener(
  "keydown",
  (event)=>{


    if(
      event.key === "Escape"
    ){


      if(state.menuOpen){

        closeMenu();

        return;

      }



      if(state.idle){

        closeIdle();

        return;

      }


    }





    if(state.menuOpen){

      return;

    }





    if(
      event.key === "ArrowDown"
    ){


      event.preventDefault();


      goNext();


    }





    if(
      event.key === "ArrowUp"
    ){


      event.preventDefault();


      goPrevious();


    }


  }
);






/* =========================================================
   MENU FOCUS TRAP
   ========================================================= */


document.addEventListener(
  "keydown",
  (event)=>{


    if(
      !state.menuOpen ||
      event.key !== "Tab"
    ){

      return;

    }




    const focusable =
      menu.querySelectorAll(
        'a[href], button:not([disabled])'
      );



    if(!focusable.length){

      return;

    }




    const first =
      focusable[0];


    const last =
      focusable[
        focusable.length - 1
      ];




    if(
      event.shiftKey &&
      document.activeElement === first
    ){


      event.preventDefault();

      last.focus();


    }




    if(
      !event.shiftKey &&
      document.activeElement === last
    ){


      event.preventDefault();

      first.focus();


    }


  }
);
/* =========================================================
   MAGNETIC INTERACTION
   ========================================================= */


function setupMagnetic(){


  if(
    coarsePointer.matches ||
    reducedMotion.matches
  ){

    return;

  }




  document
  .querySelectorAll(
    ".magnetic"
  )
  .forEach(
    (element)=>{


      element.addEventListener(
        "pointermove",
        (event)=>{


          const rect =
            element.getBoundingClientRect();



          const x =
            event.clientX -
            rect.left -
            rect.width / 2;



          const y =
            event.clientY -
            rect.top -
            rect.height / 2;



          const strength =
            .12;



          element.style.setProperty(
            "--mx",
            `${x * strength}px`
          );



          element.style.setProperty(
            "--my",
            `${y * strength}px`
          );


        }
      );




      element.addEventListener(
        "pointerleave",
        ()=>{


          element.style.setProperty(
            "--mx",
            "0px"
          );


          element.style.setProperty(
            "--my",
            "0px"
          );


        }
      );


    }
  );


}







/* =========================================================
   IDLE SCREEN
   ========================================================= */


const IDLE_DELAY =
  45000;



let idleTimer = 0;





function registerInteraction(){


  state.lastInteraction =
    performance.now();



  if(state.idle){

    closeIdle();

  }



  resetIdleTimer();


}





function resetIdleTimer(){


  window.clearTimeout(
    idleTimer
  );



  if(
    state.menuOpen ||
    document.visibilityState !==
    "visible"
  ){

    return;

  }



  idleTimer =
    window.setTimeout(
      showIdle,
      IDLE_DELAY
    );


}





function showIdle(){


  if(
    state.menuOpen ||
    document.visibilityState !==
    "visible"
  ){

    return;

  }



  state.idle =
    true;



  idleScreen?.classList.add(
    "is-visible"
  );



  idleScreen?.setAttribute(
    "aria-hidden",
    "false"
  );



  body.classList.add(
    "idle-open"
  );


}





function closeIdle(){


  state.idle =
    false;



  idleScreen?.classList.remove(
    "is-visible"
  );



  idleScreen?.setAttribute(
    "aria-hidden",
    "true"
  );



  body.classList.remove(
    "idle-open"
  );



  resetIdleTimer();


}







/* =========================================================
   LOADER
   ========================================================= */


function finishLoader(){


  if(state.loaderDone){

    return;

  }



  state.loaderDone =
    true;




  if(!loader){

    return;

  }




  const delay =
    reducedMotion.matches
    ? 150
    : 700;




  window.setTimeout(
    ()=>{


      loader.classList.add(
        "is-hidden"
      );


    },
    delay
  );


}





function initLoader(){


  if(
    document.readyState ===
    "complete"
  ){

    loadFinished =
      true;

  }




  if(loadFinished){


    finishLoader();



  }else{


    window.addEventListener(
      "load",
      ()=>{


        loadFinished =
          true;


        finishLoader();


      },
      {
        once:true
      }
    );



    window.setTimeout(
      finishLoader,
      7000
    );


  }


}







/* =========================================================
   VISIBILITY
   ========================================================= */


document.addEventListener(
  "visibilitychange",
  ()=>{


    if(
      document.visibilityState ===
      "visible"
    ){


      registerInteraction();

      requestRender();



    }else{


      window.clearTimeout(
        idleTimer
      );


    }


  }
);







/* =========================================================
   INTERACTION TRACKING
   ========================================================= */


[
  "pointerdown",
  "pointermove",
  "touchstart",
  "keydown",
  "wheel"
]
.forEach(
  (eventName)=>{


    document.addEventListener(
      eventName,
      registerInteraction,
      {
        passive:true
      }
    );


  }
);







/* =========================================================
   HASH NAVIGATION
   ========================================================= */


function syncInitialHash(){


  const hash =
    window.location.hash;



  if(!hash){

    return;

  }



  const target =
    document.querySelector(
      hash
    );



  if(!target){

    return;

  }




  window.requestAnimationFrame(
    ()=>{


      target.scrollIntoView({

        behavior:"auto",

        block:"start"

      });



      state.scrollDirty =
        true;



      requestRender();


    }
  );


}





window.addEventListener(
  "hashchange",
  ()=>{


    const target =
      document.querySelector(
        window.location.hash
      );



    if(!target){

      return;

    }



    target.scrollIntoView({

      behavior:
        reducedMotion.matches
        ? "auto"
        : "smooth",


      block:"start"

    });


  }
);







/* =========================================================
   INTERSECTION OBSERVER
   ========================================================= */


const observer =
"IntersectionObserver" in window

?

new IntersectionObserver(

(entries)=>{


entries.forEach(
(entry)=>{


entry.target.classList.toggle(

"is-near",

entry.isIntersecting

);


}

);


},

{

rootMargin:
"20% 0px 20% 0px",

threshold:0

}

)

:

null;





if(observer){


  scenes.forEach(
    (scene)=>{


      observer.observe(
        scene
      );


    }
  );


}







/* =========================================================
   INIT
   ========================================================= */


function init(){


  updateStateFromScroll();



  state.currentProgress =
    state.targetProgress;



  render();



  setupMagnetic();



  initLoader();



  syncInitialHash();



  resetIdleTimer();




  window.addEventListener(
    "scroll",
    onScroll,
    {
      passive:true
    }
  );




  window.addEventListener(
    "resize",
    onResize,
    {
      passive:true
    }
  );




  requestRender();


}





if(
  document.readyState ===
  "loading"
){


  document.addEventListener(
    "DOMContentLoaded",
    init,
    {
      once:true
    }
  );


}else{


  init();


}


})();
