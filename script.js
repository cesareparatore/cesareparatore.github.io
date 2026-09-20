(() => {

"use strict";


/*
==========================================================
CESARE PARATORE
MOVIMENTO / DIREZIONE

FINAL EXPERIENCE ENGINE 10/10
==========================================================
*/


const CONFIG = {

 loader:{
  min:700,
  max:2200
 },

 motion:{
  cursorLerp:.18,
  trajectoryLerp:.08
 },

 reveal:{
  threshold:.15
 },

 standby:{
  delay:45000,
  minWidth:700
 },

 navigation:{
  offset:20
 }

};




const STATE = {

 activeSection:0,

 menuOpen:false,

 standby:false,

 reduced:false,

 raf:null,

 pointer:{
  x:innerWidth/2,
  y:innerHeight/2
 },

 cursor:{
  x:innerWidth/2,
  y:innerHeight/2
 },

 trajectory:{
  current:0,
  target:0
 }

};





const $ = selector =>
document.querySelector(selector);


const $$ = selector =>
[...document.querySelectorAll(selector)];





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



progressFill:
$("#progress-fill"),


progressPoint:
$("#progress-point"),


progressLabel:
$("#progress-current"),



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
MOTION SETTINGS
==========================================================
*/


function initMotion(){


const media =
window.matchMedia(
"(prefers-reduced-motion: reduce)"
);



function update(){


STATE.reduced =
media.matches;



DOM.html.classList.toggle(
"reduced-motion",
STATE.reduced
);



}



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


if(!DOM.loader)
return;



const start =
performance.now();



let completed=false;



function finish(){


if(completed)
return;



completed=true;



const elapsed =
performance.now()-start;



const delay =
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



},delay);



}



window.addEventListener(
"load",
finish,
{
once:true
}
);



setTimeout(
finish,
CONFIG.loader.max
);



}








/*
==========================================================
REVEAL SYSTEM
==========================================================
*/


function initReveal(){



if(
STATE.reduced ||
!("IntersectionObserver" in window)
){


DOM.reveals.forEach(
element=>
element.classList.add(
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
CONFIG.reveal.threshold,

rootMargin:
"0px 0px -10% 0px"

}

);




DOM.reveals.forEach(
element=>
observer.observe(element)
);



}







/*
==========================================================
SECTION TRACKING
==========================================================
*/


function updateSection(){



let current =
STATE.activeSection;



let distance =
Infinity;



DOM.sections.forEach(
(section,index)=>{



const rect =
section.getBoundingClientRect();



const center =
Math.abs(
rect.top +
rect.height/2 -
innerHeight*.5
);



if(center < distance){


distance=center;

current=index;


}



});



if(current !== STATE.activeSection){


STATE.activeSection=current;


updateProgress();



}



}






function updateProgress(){



const section =
DOM.sections[
STATE.activeSection
];



if(!section)
return;



const total =
DOM.sections.length;



const progress =
total<=1
?
0
:
STATE.activeSection/(total-1);




if(DOM.progressFill)

DOM.progressFill.style.width =
`${progress*100}%`;



if(DOM.progressPoint)

DOM.progressPoint.style.left =
`${progress*100}%`;




if(DOM.progressLabel)

DOM.progressLabel.textContent =
section.dataset.sectionTitle || "";



}







/*
==========================================================
NAVIGATION
==========================================================
*/


function scrollToSection(index){



const target =
DOM.sections[index];



if(!target)
return;



const offset =
DOM.header?.offsetHeight || 0;



window.scrollTo({

top:
target.offsetTop -
offset -
CONFIG.navigation.offset,


behavior:
STATE.reduced
?
"auto"
:
"smooth"

});



}






DOM.sections.forEach(
(section,index)=>{


section.addEventListener(
"click",
()=>{

if(section.dataset.navigate)
scrollToSection(index);

}

);


});
// ==========================================================
// MENU SYSTEM
// ==========================================================


function openMenu(){


if(!DOM.menu)
return;



STATE.menuOpen=true;



DOM.menu.classList.add(
"is-open"
);



DOM.menu.setAttribute(
"aria-hidden",
"false"
);



DOM.menuButton?.setAttribute(
"aria-expanded",
"true"
);



DOM.body.classList.add(
"is-menu-open"
);



}



function closeMenu(){



if(!DOM.menu)
return;



STATE.menuOpen=false;



DOM.menu.classList.remove(
"is-open"
);



DOM.menu.setAttribute(
"aria-hidden",
"true"
);



DOM.menuButton?.setAttribute(
"aria-expanded",
"false"
);



DOM.body.classList.remove(
"is-menu-open"
);



}




function initMenu(){



if(!DOM.menuButton)
return;



DOM.menuButton.addEventListener(
"click",
()=>{


STATE.menuOpen
?
closeMenu()
:
openMenu();



});



DOM.menuLinks.forEach(
link=>{


link.addEventListener(
"click",
()=>{


closeMenu();


});



});



document.addEventListener(
"keydown",
event=>{


if(event.key==="Escape" && STATE.menuOpen){

closeMenu();

}



});



}







// ==========================================================
// CURSOR SYSTEM
// ==========================================================


function initCursor(){



if(
STATE.reduced ||
!DOM.cursor ||
!window.matchMedia("(pointer:fine)").matches
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
"mouseenter",
()=>{


DOM.cursor.classList.add(
"is-hovering"
);



});



element.addEventListener(
"mouseleave",
()=>{


DOM.cursor.classList.remove(
"is-hovering"
);



});



});




window.addEventListener(
"mouseleave",
()=>{


DOM.cursor.classList.remove(
"is-visible"
);


});



}







// ==========================================================
// TRAJECTORY ENGINE
// ==========================================================


function updateTrajectory(){



if(DOM.sections.length < 2)
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
last.offsetTop +
last.offsetHeight -
innerHeight;



const range =
end-start;



STATE.trajectory.target =
range<=0
?
0
:
Math.min(
1,
Math.max(
0,
(scrollY-start)/range
)

);



}




function animate(){



STATE.trajectory.current +=
(
STATE.trajectory.target -
STATE.trajectory.current
)
*
CONFIG.motion.trajectoryLerp;



DOM.html.style.setProperty(
"--trajectory-progress",
STATE.trajectory.current
);





if(
DOM.cursor &&
!STATE.reduced
){



STATE.cursor.x +=
(
STATE.pointer.x -
STATE.cursor.x
)
*
CONFIG.motion.cursorLerp;



STATE.cursor.y +=
(
STATE.pointer.y -
STATE.cursor.y
)
*
CONFIG.motion.cursorLerp;



if(DOM.cursorDot)

DOM.cursorDot.style.transform =
`
translate3d(
${STATE.pointer.x}px,
${STATE.pointer.y}px,
0
)
translate(-50%,-50%)
`;



if(DOM.cursorRing)

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



STATE.raf =
requestAnimationFrame(
animate
);



}







// ==========================================================
// STANDBY EXPERIENCE
// ==========================================================


function initStandby(){



if(!DOM.standby)
return;



let timer;



function reset(){



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
STATE.menuOpen ||
document.hidden
)

return;



STATE.standby=true;



DOM.standby.classList.add(
"is-active"
);



DOM.standby.setAttribute(
"aria-hidden",
"false"
);



},
CONFIG.standby.delay
);



}



[
"mousemove",
"scroll",
"wheel",
"touchstart"
]
.forEach(
event=>{


window.addEventListener(
event,
reset,
{
passive:true
}
);



});





DOM.wake?.addEventListener(
"click",
()=>{


STATE.standby=false;



DOM.standby.classList.remove(
"is-active"
);



DOM.standby.setAttribute(
"aria-hidden",
"true"
);



reset();



});



reset();



}







// ==========================================================
// EVENTS
// ==========================================================


function initEvents(){



let ticking=false;



window.addEventListener(
"scroll",
()=>{


if(ticking)
return;



ticking=true;



requestAnimationFrame(
()=>{


updateSection();

updateTrajectory();


ticking=false;



}

);



},
{
passive:true
}

);





window.addEventListener(
"resize",
()=>{


updateSection();

updateTrajectory();



});





document.addEventListener(
"keydown",
event=>{


if(
STATE.menuOpen ||
STATE.standby
)

return;



if(event.key==="PageDown"){

event.preventDefault();



scrollToSection(
Math.min(
STATE.activeSection+1,
DOM.sections.length-1
)

);

}



if(event.key==="PageUp"){

event.preventDefault();



scrollToSection(
Math.max(
STATE.activeSection-1,
0
)

);

}



});



}







// ==========================================================
// HASH NAVIGATION
// ==========================================================


function initHash(){



const hash =
location.hash.replace("#","");



if(!hash)
return;



const target =
document.getElementById(hash);



if(!target)
return;



setTimeout(
()=>{


window.scrollTo({

top:
target.offsetTop -
(DOM.header?.offsetHeight || 0),


behavior:
STATE.reduced
?
"auto"
:
"smooth"

});


},
400
);



}







// ==========================================================
// FINAL INITIALIZATION
// ==========================================================


function init(){



initMotion();


initLoader();


initReveal();


initMenu();


initCursor();


initStandby();


initEvents();


initHash();



updateSection();


updateTrajectory();



animate();



}





if(
document.readyState === "loading"
)

{


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



})();
