(() => {
"use strict";

/*
==========================================================
CESARE PARATORE
A DIRECTION IS BORN FROM A POINT
FINAL EXPERIENCE ENGINE
==========================================================
*/


const CONFIG = {

 loader: {
  min:700,
  max:2200
 },

 scroll:{
  threshold:.55,
  smooth:true
 },

 reveal:{
  threshold:.15
 },

 motion:{
  lerp:.08,
  drift:18
 },

 standby:{
  delay:45000,
  minWidth:700
 },

 cursor:{
  enabled:true
 }

};



const STATE = {

 section:0,

 reduced:false,

 menu:false,

 standby:false,

 pointer:{
  x:0,
  y:0
 },

 cursor:{
  x:0,
  y:0
 },

 trajectory:{
  value:0,
  target:0
 }

};



const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];



const DOM = {

 body:document.body,

 html:document.documentElement,

 loader:$(".page-loader"),

 menu:$(".site-menu"),

 menuButton:$(".menu-trigger"),

 sections:$$(".home-section"),

 reveals:$$(".reveal"),

 cursor:$(".custom-cursor"),

 cursorDot:$(".custom-cursor-dot"),

 cursorRing:$(".custom-cursor-ring"),

 progress:$(".progress-fill"),

 progressPoint:$(".progress-point"),

 progressLabel:$("#progress-current"),

 standby:$(".standby-screen"),

 wake:$(".standby-wake"),

 trajectories:$$("[data-trajectory]")

};



/*
----------------------------------------------------------
MOTION
----------------------------------------------------------
*/


function motion(){

 const media =
 matchMedia("(prefers-reduced-motion:reduce)");

 const update = () => {

  STATE.reduced = media.matches;

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
----------------------------------------------------------
LOADER
----------------------------------------------------------
*/


function loader(){

 if(!DOM.loader)
 return;


 const start = performance.now();


 function finish(){

  const elapsed =
  performance.now()-start;


  const wait =
  Math.max(
   0,
   CONFIG.loader.min-elapsed
  );


  setTimeout(()=>{

   DOM.loader.classList.add(
    "is-hidden"
   );


   setTimeout(()=>{
    DOM.loader.remove();
   },700);


  },wait);


 }


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
----------------------------------------------------------
SECTIONS
----------------------------------------------------------
*/


function currentSection(){

 let index=0;

 let distance=Infinity;


 DOM.sections.forEach((section,i)=>{

  const box =
  section.getBoundingClientRect();


  const center =
  Math.abs(
   box.top + box.height/2 -
   innerHeight*.5
  );


  if(center<distance){

   distance=center;
   index=i;

  }


 });


 if(index!==STATE.section){

  STATE.section=index;

  updateNavigation();

 }

}



function updateNavigation(){

 const section =
 DOM.sections[STATE.section];


 if(!section)
 return;


 const total =
 DOM.sections.length;


 const progress =
 total<=1
 ?0
 :STATE.section/(total-1);



 if(DOM.progress)
 DOM.progress.style.width =
 `${progress*100}%`;


 if(DOM.progressPoint)
 DOM.progressPoint.style.left =
 `${progress*100}%`;


 if(DOM.progressLabel)

 DOM.progressLabel.textContent =
 section.dataset.sectionTitle || "";


}



/*
----------------------------------------------------------
SMOOTH NAVIGATION
----------------------------------------------------------
*/


function navigate(index){

 const target =
 DOM.sections[index];


 if(!target)
 return;


 const offset =
 $(".site-header")?.offsetHeight || 0;


 window.scrollTo({

  top:
  target.offsetTop-offset,

  behavior:
  STATE.reduced
  ?"auto"
  :"smooth"

 });


}



/*
----------------------------------------------------------
REVEAL SYSTEM
----------------------------------------------------------
*/


function reveal(){

 if(
 STATE.reduced ||
 !("IntersectionObserver" in window)
 ){

  DOM.reveals.forEach(
   el=>el.classList.add(
    "is-visible"
   )
  );

  return;

 }


 const observer =
 new IntersectionObserver(
 entries=>{

  entries.forEach(entry=>{

   if(
   entry.isIntersecting
   ){

    entry.target.classList.add(
     "is-visible"
    );

    observer.unobserve(
     entry.target
    );

   }

  });


 },
 {
 threshold:
 CONFIG.reveal.threshold
 });


 DOM.reveals.forEach(
 el=>observer.observe(el)
 );

}



/*
----------------------------------------------------------
CURSOR
----------------------------------------------------------
*/


function cursor(){

 if(
 STATE.reduced ||
 !DOM.cursor ||
 !matchMedia("(pointer:fine)").matches
 )
 return;



 window.addEventListener(
 "pointermove",
 e=>{

  STATE.pointer.x=e.clientX;
  STATE.pointer.y=e.clientY;

  DOM.cursor.classList.add(
   "is-visible"
  );

 });


 $$("a,button").forEach(el=>{

  el.addEventListener(
   "mouseenter",
   ()=>DOM.cursor.classList.add(
    "is-hovering"
   )
  );


  el.addEventListener(
   "mouseleave",
   ()=>DOM.cursor.classList.remove(
    "is-hovering"
   )
  );

 });


}



/*
----------------------------------------------------------
TRAJECTORY
----------------------------------------------------------
*/


function trajectory(){

 const first =
 DOM.sections[0];

 const last =
 DOM.sections.at(-1);


 if(!first || !last)
 return;


 const start =
 first.offsetTop;


 const end =
 last.offsetTop +
 last.offsetHeight -
 innerHeight;


 STATE.trajectory.target =
 Math.max(
  0,
  Math.min(
   1,
   (scrollY-start)/(end-start)
  )
 );


}



function animate(){

 STATE.trajectory.value +=
 (
 STATE.trajectory.target -
 STATE.trajectory.value
 )
 *
 CONFIG.motion.lerp;



 DOM.html.style.setProperty(

 "--trajectory-progress",

 STATE.trajectory.value

 );



 if(
 DOM.cursor &&
 !STATE.reduced
 ){

  STATE.cursor.x +=
  (
  STATE.pointer.x-
  STATE.cursor.x
  )*.18;


  STATE.cursor.y +=
  (
  STATE.pointer.y-
  STATE.cursor.y
  )*.18;


  DOM.cursorDot.style.transform =
  `translate(${STATE.pointer.x}px,${STATE.pointer.y}px)`;


  DOM.cursorRing.style.transform =
  `translate(${STATE.cursor.x}px,${STATE.cursor.y}px)`;

 }


 requestAnimationFrame(
  animate
 );

}



/*
----------------------------------------------------------
MENU
----------------------------------------------------------
*/


function menu(){

 if(!DOM.menuButton)
 return;


 DOM.menuButton.onclick=()=>{

  STATE.menu=!STATE.menu;


  DOM.menu.classList.toggle(
   "is-open",
   STATE.menu
  );


  DOM.body.classList.toggle(
   "is-menu-open",
   STATE.menu
  );


 };


}



/*
----------------------------------------------------------
STANDBY MOMENT
----------------------------------------------------------
*/


function standby(){

 if(!DOM.standby)
 return;


 let timer;


 function reset(){

  clearTimeout(timer);


  if(
  STATE.reduced ||
  innerWidth<CONFIG.standby.minWidth
  )
  return;


  timer=setTimeout(()=>{

   DOM.standby.classList.add(
    "is-active"
   );

  },
  CONFIG.standby.delay);


 }


 [
 "mousemove",
 "scroll",
 "wheel",
 "touchstart"
 ]
 .forEach(
 e=>window.addEventListener(
 e,
 reset,
 {passive:true}
 )
 );


 DOM.wake?.addEventListener(
 "click",
 ()=>DOM.standby.classList.remove(
  "is-active"
 )
 );


 reset();

}



/*
----------------------------------------------------------
INIT
----------------------------------------------------------
*/


function init(){

 motion();

 loader();

 reveal();

 cursor();

 menu();

 standby();


 window.addEventListener(
 "scroll",
 ()=>{

  currentSection();

  trajectory();

 },
 {
 passive:true
 });


 trajectory();

 currentSection();


 animate();

}



document.readyState==="loading"

?

document.addEventListener(
"DOMContentLoaded",
init,
{once:true}
)

:

init();



})();
