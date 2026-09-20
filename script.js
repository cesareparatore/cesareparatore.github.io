/* =========================================================
   CP 2026 — SCRIPT.JS
   Cesare Paratore — Movimento con direzione.
   BLOCCO 1/3
========================================================= */

(() => {

"use strict";


/* =========================================================
   CONFIG
========================================================= */

const CFG = {

  loaderMin:700,
  loaderMax:2200,

  revealThreshold:.12,

  cursorLerp:.18,

  resizeDebounce:160,

  transitionMs:620,

  trajectoryLerp:.09,

  trajectoryDrift:18,

  magneticStrength:.12,

  magneticRadius:90,

  standbyDelay:45000

};



/* =========================================================
   STATE
========================================================= */

const st = {

  loaded:false,

  menuOpen:false,

  standby:false,

  active:0,

  reduced:false,

  resizeTimer:0,

  standbyTimer:0,

  raf:0,

  menuReturn:null,

  standbyReturn:null,


  pointer:{

    x:innerWidth/2,
    y:innerHeight/2

  },


  cursor:{

    x:innerWidth/2,
    y:innerHeight/2

  },


  trajectory:{

    progress:0,

    target:0,

    drift:0,

    targetDrift:0

  }

};



/* =========================================================
   DOM HELPERS
========================================================= */

const q = selector =>
document.querySelector(selector);


const qa = selector =>
[...document.querySelectorAll(selector)];



const dom = {


  html:document.documentElement,

  body:document.body,


  loader:q(".page-loader"),

  transition:q(".page-transition"),


  header:q(".site-header"),


  cursor:q(".custom-cursor"),

  cursorDot:q(".custom-cursor-dot"),

  cursorRing:q(".custom-cursor-ring"),


  menu:q(".site-menu"),

  menuButton:q(".menu-trigger"),

  menuLinks:qa(".site-menu-nav a"),



  sections:qa(".home-section"),


  progressLabel:q("#progress-current"),

  progressFill:q("#progress-fill"),

  progressPoint:q("#progress-point"),


  previous:q("#previous-section"),

  next:q("#next-section"),



  reveals:qa(".reveal"),


  narrativeLinks:qa(".narrative-link"),



  magnetic:qa(".magnetic"),



  directionLinks:

    qa(".hero-direction[data-direction]"),


  directionNodes:

    qa(".direction-node[data-direction]"),



  networkNodes:

    qa(".network-node"),



  cta:q(".cta-wrapper"),


  contact:q(".contact-cta"),



  standby:q(".standby-screen"),

  wake:q(".standby-wake")

};



/* =========================================================
   UTILITIES
========================================================= */


const clamp = (n,min,max)=>

Math.min(Math.max(n,min),max);



const lerp = (a,b,t)=>

a+(b-a)*t;



const section = index =>

dom.sections[
 clamp(index,0,dom.sections.length-1)
];



const sectionNumber = i =>

String(i+1).padStart(2,"0");



const motionOK = () =>

!st.reduced;



const finePointer = () =>

matchMedia("(pointer:fine)").matches;



/* =========================================================
   REDUCED MOTION
========================================================= */


function motionInit(){


const media =
matchMedia("(prefers-reduced-motion: reduce)");



const apply = value => {


st.reduced=value;


dom.html.classList.toggle(
"reduced-motion",
value
);


if(value){

closeStandby();

}



resetStandby();



};



apply(media.matches);



media.addEventListener?.(
"change",
e=>apply(e.matches)
);



}



/* =========================================================
   LOADER
========================================================= */


function loaderInit(){


if(!dom.loader){

st.loaded=true;

return;

}



const start =
performance.now();



let finished=false;



const finish=()=>{


if(finished)return;


finished=true;



const delay=Math.max(

0,

CFG.loaderMin -
(performance.now()-start)

);



setTimeout(()=>{


st.loaded=true;


dom.loader.classList.add(
"is-hidden"
);



setTimeout(()=>{

dom.loader.remove();

},700);



},delay);



};



if(document.readyState==="complete")

finish();

else

window.addEventListener(
"load",
finish,
{once:true}
);



setTimeout(
finish,
CFG.loaderMax
);



}



/* =========================================================
   PAGE TRANSITION
========================================================= */


function transitionInit(){


if(!dom.transition)return;



qa('a[href]:not([target="_blank"])')
.forEach(link=>{


link.addEventListener(
"click",
event=>{


if(
st.reduced ||
event.defaultPrevented ||
event.button!==0 ||
event.metaKey ||
event.ctrlKey
)

return;



const href=
link.getAttribute("href");



if(
!href ||
href.startsWith("#") ||
href.startsWith("mailto:") ||
href.startsWith("tel:")
)

return;



let url;


try{

url=new URL(
href,
location.href
);

}

catch{

return;

}



if(
url.origin!==location.origin
)

return;



event.preventDefault();



dom.transition.classList.add(
"is-active"
);



setTimeout(
()=>location.href=url.href,
CFG.transitionMs
);



}

);



});



window.addEventListener(
"pageshow",
()=>dom.transition.classList.remove("is-active")
);



}



/* =========================================================
   MENU
========================================================= */


function menuOpen(){


if(!dom.menu || st.menuOpen)
return;



st.menuOpen=true;


st.menuReturn=
document.activeElement;



dom.menu.setAttribute(
"aria-hidden",
"false"
);



dom.body.classList.add(
"is-menu-open"
);



dom.menuButton?.setAttribute(
"aria-expanded",
"true"
);



requestAnimationFrame(()=>{

dom.menuLinks[0]?.focus({
preventScroll:true
});

});



}



function menuClose(){


if(!st.menuOpen)return;



st.menuOpen=false;



dom.menu.setAttribute(
"aria-hidden",
"true"
);



dom.body.classList.remove(
"is-menu-open"
);



dom.menuButton?.setAttribute(
"aria-expanded",
"false"
);



if(
st.menuReturn &&
document.contains(st.menuReturn)
)

st.menuReturn.focus({
preventScroll:true
});



st.menuReturn=null;


resetStandby();



}



function menuInit(){


dom.menuButton?.addEventListener(
"click",
()=>{

st.menuOpen?
menuClose():
menuOpen();

}

);



dom.menuLinks.forEach(link=>{

link.addEventListener(
"click",
menuClose
);

});



document.addEventListener(
"keydown",
e=>{


if(e.key==="Escape" && st.menuOpen){

menuClose();

}



}

);



}



/* =========================================================
   CP 2026 — SCRIPT.JS
   BLOCCO 2/3
========================================================= */


/* =========================================================
   PROGRESSO / CAPITOLI
========================================================= */


function updateProgress(index){


const current =
section(index);


if(!current)return;



st.active=index;



const total =
dom.sections.length;



const progress =
total > 1 ?
index/(total-1) :
0;



if(dom.progressLabel)

dom.progressLabel.textContent =
current.dataset.sectionTitle || "";



if(dom.progressFill)

dom.progressFill.style.width =
`${progress*100}%`;



if(dom.progressPoint)

dom.progressPoint.style.left =
`${progress*100}%`;



}



/* =========================================================
   NAVIGAZIONE SEZIONI
========================================================= */


function goToSection(index){


const target =
section(index);



if(!target)return;



const offset =
dom.header?.offsetHeight || 0;



const y =
target.offsetTop -
offset -
20;



window.scrollTo({

top:y,

behavior:
motionOK()?
"smooth":
"auto"

});



if(history.replaceState)

history.replaceState(
null,
"",
`#${target.id}`
);



}



function progressInit(){


dom.previous?.addEventListener(
"click",
e=>{

e.preventDefault();

goToSection(
Math.max(
0,
st.active-1
)
);

}

);



dom.next?.addEventListener(
"click",
e=>{

e.preventDefault();

goToSection(
Math.min(
dom.sections.length-1,
st.active+1
)
);

}

);



}



/* =========================================================
   RILEVAMENTO CAPITOLO ATTIVO
========================================================= */


function detectActive(){


if(!dom.sections.length)
return;



const middle =
innerHeight*.5;



let closest =
st.active;


let distance =
Infinity;



dom.sections.forEach(
(section,index)=>{


const rect =
section.getBoundingClientRect();



const center =
rect.top+
rect.height/2;



const diff =
Math.abs(center-middle);



if(
rect.bottom>0 &&
rect.top<innerHeight &&
diff<distance
){

distance=diff;

closest=index;

}



});



if(
closest!==st.active
)

updateProgress(closest);



}



/* =========================================================
   REVEAL CAPITOLI
========================================================= */


function revealInit(){


if(
!dom.reveals.length ||
st.reduced ||
!("IntersectionObserver" in window)
){

dom.reveals.forEach(
item=>
item.classList.add(
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



}

);



},
{

threshold:
CFG.revealThreshold,

rootMargin:
"0px 0px -10% 0px"

}

);



dom.reveals.forEach(
item=>
observer.observe(item)
);



}



/* =========================================================
   DIREZIONI HERO
========================================================= */


function directionInit(){


const toggle =
(key,state)=>{


dom.directionLinks

.filter(
item=>
item.dataset.direction===key
)

.forEach(
item=>
item.classList.toggle(
"is-active",
state
)
);



dom.directionNodes

.filter(
item=>
item.dataset.direction===key
)

.forEach(
item=>
item.classList.toggle(
"is-active",
state
)
);



};



dom.directionLinks.forEach(
link=>{


const key =
link.dataset.direction;



link.addEventListener(
"mouseenter",
()=>toggle(key,true)
);



link.addEventListener(
"mouseleave",
()=>toggle(key,false)
);



link.addEventListener(
"focus",
()=>toggle(key,true)
);



link.addEventListener(
"blur",
()=>toggle(key,false)
);



});



}



/* =========================================================
   CONNESSIONI NARRATIVE
========================================================= */


function narrativeInit(){


dom.narrativeLinks.forEach(
link=>{


const key =
link.dataset.trajectoryNode;



if(!key)return;



const targets =
qa(
`[data-node="${key}"],
[data-direction="${key}"]`
);



const activate=()=>{

targets.forEach(
item=>
item.classList.add(
"is-linked"
)
);

};



const deactivate=()=>{

targets.forEach(
item=>
item.classList.remove(
"is-linked"
)
);

};



link.addEventListener(
"mouseenter",
activate
);



link.addEventListener(
"mouseleave",
deactivate
);



link.addEventListener(
"focus",
activate
);



link.addEventListener(
"blur",
deactivate
);



});



}



/* =========================================================
   CURSORE EDITORIALE
========================================================= */


function cursorInit(){


if(
!dom.cursor ||
!finePointer() ||
st.reduced
)

return;



document.addEventListener(
"pointermove",
e=>{


st.pointer.x=e.clientX;

st.pointer.y=e.clientY;


dom.cursor.classList.add(
"is-visible"
);



},
{
passive:true
}

);



qa("a,button")
.forEach(
element=>{


element.addEventListener(
"mouseenter",
()=>dom.cursor.classList.add(
"is-hovering"
)
);



element.addEventListener(
"mouseleave",
()=>dom.cursor.classList.remove(
"is-hovering"
)
);



});



}



function cursorFrame(){


if(
!dom.cursor ||
!finePointer() ||
st.reduced
)

return false;



st.cursor.x =
lerp(
st.cursor.x,
st.pointer.x,
CFG.cursorLerp
);



st.cursor.y =
lerp(
st.cursor.y,
st.pointer.y,
CFG.cursorLerp
);



dom.cursorDot.style.transform =

`translate3d(
${st.pointer.x}px,
${st.pointer.y}px,
0
)
translate(-50%,-50%)`;



dom.cursorRing.style.transform =

`translate3d(
${st.cursor.x}px,
${st.cursor.y}px,
0
)
translate(-50%,-50%)`;



return true;



}



/* =========================================================
   MAGNETIC ELEMENTS
========================================================= */


function magneticInit(){


if(
!finePointer() ||
st.reduced
)

return;



dom.magnetic.forEach(
element=>{


element.addEventListener(
"pointermove",
event=>{


const rect =
element.getBoundingClientRect();



const dx =
event.clientX -
(rect.left+rect.width/2);



const dy =
event.clientY -
(rect.top+rect.height/2);



const distance =
Math.hypot(dx,dy);



if(
distance>CFG.magneticRadius
)

return;



const force =
CFG.magneticStrength *
(
1-distance/CFG.magneticRadius
);



element.style.setProperty(
"--magnetic-x",
`${dx*force}px`
);



element.style.setProperty(
"--magnetic-y",
`${dy*force}px`
);



},
{
passive:true
}

);



element.addEventListener(
"pointerleave",
()=>{


element.style.setProperty(
"--magnetic-x",
"0px"
);



element.style.setProperty(
"--magnetic-y",
"0px"
);



}

);



});



}



/* =========================================================
   CP 2026 — SCRIPT.JS
   Cesare Paratore — Movimento con direzione.
   BLOCCO 3/3
========================================================= */


/* =========================================================
   CTA TRAJECTORY
========================================================= */


function ctaInit(){

if(
!dom.cta ||
!dom.contact
)

return;



const activate=()=>{

dom.cta.classList.add(
"is-engaged"
);

};



const deactivate=()=>{

dom.cta.classList.remove(
"is-engaged"
);

};



dom.contact.addEventListener(
"mouseenter",
activate
);


dom.contact.addEventListener(
"mouseleave",
deactivate
);


dom.contact.addEventListener(
"focus",
activate
);


dom.contact.addEventListener(
"blur",
deactivate
);


}



/* =========================================================
   STANDBY / PAUSA CONSAPEVOLE
========================================================= */


function clearStandby(){

if(st.standbyTimer){

clearTimeout(
st.standbyTimer
);

st.standbyTimer=0;

}

}



function openStandby(){


if(
st.menuOpen ||
st.standby ||
st.reduced ||
!dom.standby ||
document.hidden ||
innerWidth<700
)

return;



st.standby=true;


st.standbyReturn =
document.activeElement;



dom.body.classList.add(
"is-standby"
);



dom.standby.classList.add(
"is-active"
);



dom.standby.setAttribute(
"aria-hidden",
"false"
);



dom.wake?.focus({
preventScroll:true
});



}



function closeStandby(){


if(
!st.standby
)

return;



st.standby=false;



dom.body.classList.remove(
"is-standby"
);



dom.standby.classList.remove(
"is-active"
);



dom.standby.setAttribute(
"aria-hidden",
"true"
);



const element =
st.standbyReturn;



st.standbyReturn=null;



if(
element &&
document.contains(element)
)

requestAnimationFrame(
()=>element.focus({
preventScroll:true
})
);



resetStandby();



}



function resetStandby(){


clearStandby();



if(
st.menuOpen ||
st.standby ||
st.reduced ||
document.hidden ||
innerWidth<700
)

return;



st.standbyTimer =
setTimeout(
openStandby,
CFG.standbyDelay
);



}



function standbyInit(){


if(!dom.standby)
return;



dom.wake?.addEventListener(
"click",
closeStandby
);



[
"pointerdown",
"wheel",
"touchstart",
"scroll"
]
.forEach(
event=>{


window.addEventListener(
event,
()=>{

if(st.standby)

closeStandby();

else

resetStandby();

},
{
passive:true
}
);


}
);



document.addEventListener(
"visibilitychange",
()=>{


if(document.hidden)

clearStandby();

else

resetStandby();



}
);



}



/* =========================================================
   TRAIETTORIA GLOBALE
   MOVIMENTO CON DIREZIONE
========================================================= */


function trajectoryUpdate(){


if(
dom.sections.length<2
)

return;



const first =
dom.sections[0];


const last =
dom.sections[
dom.sections.length-1
];



const start =
first.offsetTop;



const end =
last.offsetTop+
last.offsetHeight-
innerHeight;



const range =
end-start;



st.trajectory.target =
range<=0 ?
0 :
clamp(
(
scrollY-start
)/
range,
0,
1
);



st.trajectory.targetDrift =
st.reduced ?
0 :
Math.sin(
st.trajectory.target*
Math.PI*
2
)
*
CFG.trajectoryDrift;



}



function trajectoryFrame(){


st.trajectory.progress =
st.reduced ?
st.trajectory.target :
lerp(
st.trajectory.progress,
st.trajectory.target,
CFG.trajectoryLerp
);



st.trajectory.drift =
st.reduced ?
0 :
lerp(
st.trajectory.drift,
st.trajectory.targetDrift,
CFG.trajectoryLerp
);



dom.html.style.setProperty(
"--trajectory-drift",
`${st.trajectory.drift.toFixed(2)}px`
);



}



/* =========================================================
   RAF ENGINE
========================================================= */


function frame(){


const cursor =
cursorFrame();



trajectoryFrame();



if(
cursor ||
Math.abs(
st.trajectory.drift-
st.trajectory.targetDrift
)>.02
)

st.raf =
requestAnimationFrame(
frame
);

else

st.raf=0;



}



function wakeFrame(){


if(!st.raf)

st.raf =
requestAnimationFrame(
frame
);



}



/* =========================================================
   HASH / AVVIO SEZIONE
========================================================= */


function hashInit(){


const id =
location.hash.replace(
"#",
""
);



if(!id)
return;



const index =
dom.sections.findIndex(
section=>
section.id===id
);



if(index<0)
return;



setTimeout(
()=>goToSection(index),
st.reduced?0:300
);



}



/* =========================================================
   KEYBOARD NAVIGATION
========================================================= */


function keyboardInit(){


document.addEventListener(
"keydown",
event=>{


if(
st.menuOpen ||
st.standby
)

return;



if(
event.key!=="PageDown" &&
event.key!=="PageUp"
)

return;



event.preventDefault();



const direction =
event.key==="PageDown"
?
1
:
-1;



goToSection(
clamp(
st.active+direction,
0,
dom.sections.length-1
)
);



}

);



}



/* =========================================================
   SCROLL / RESIZE
========================================================= */


function scrollInit(){


let ticking=false;



window.addEventListener(
"scroll",
()=>{


resetStandby();


wakeFrame();



if(ticking)

return;



ticking=true;



requestAnimationFrame(
()=>{


detectActive();


trajectoryUpdate();



ticking=false;



}

);



},
{
passive:true
}

);



}



function resizeInit(){


window.addEventListener(
"resize",
()=>{


clearTimeout(
st.resizeTimer
);



st.resizeTimer =
setTimeout(
()=>{


detectActive();


trajectoryUpdate();


updateProgress(
st.active
);


resetStandby();


wakeFrame();



},
CFG.resizeDebounce
);



},
{
passive:true
}

);



}



/* =========================================================
   INITIAL STATE
========================================================= */


function initial(){


if(
!dom.sections.length
)

return;



st.active=0;



updateProgress(0);


trajectoryUpdate();


resetStandby();



}



/* =========================================================
   INIT CP 2026
========================================================= */


function init(){


motionInit();


loaderInit();


transitionInit();


menuInit();


progressInit();


revealInit();


directionInit();


narrativeInit();


cursorInit();


magneticInit();


ctaInit();


standbyInit();


hashInit();


keyboardInit();


initial();


detectActive();


trajectoryUpdate();


wakeFrame();



document.addEventListener(
"visibilitychange",
()=>{


if(document.hidden){

cancelAnimationFrame(
st.raf
);

st.raf=0;

}

else{

wakeFrame();

}


}
);



scrollInit();


resizeInit();



}



/* =========================================================
   BOOT
========================================================= */


if(
document.readyState==="loading"
)

document.addEventListener(
"DOMContentLoaded",
init,
{
once:true
}
);


else

init();



})();
