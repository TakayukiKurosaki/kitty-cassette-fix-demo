'use strict';
// Fit against the visible browser area, including mobile address bars.
function fitKittyLayout(){
 const root=document.documentElement,device=document.querySelector('.device');
 const header=document.querySelector('header'),main=document.querySelector('main');
 if(!device||!header||!main)return;
 const height=window.visualViewport?.height||window.innerHeight;
 const safeBottom=parseFloat(getComputedStyle(root).getPropertyValue('--safe-bottom'))||0;
 const bottomSpace=Math.max(16,safeBottom)+8;
 const scrollY=window.scrollY||0;
 const headerBottom=header.getBoundingClientRect().bottom+scrollY;
 const mainStyle=getComputedStyle(main);
 const innerWidth=main.clientWidth-(parseFloat(mainStyle.paddingLeft)||0)-(parseFloat(mainStyle.paddingRight)||0);
 // Reserve the space above the handheld for the cartridge, and below for its caption.
 const bootHeight=Math.max(0,Math.min(500,(height-headerBottom-bottomSpace-80)/1.32,innerWidth*1280/840));
 root.style.setProperty('--boot-width',`${bootHeight*840/1280}px`);
 root.style.setProperty('--boot-top-gap',`${bootHeight*.32+20}px`);
 const deviceTop= device.getBoundingClientRect().top+scrollY;
 const gameHeight=Math.max(0,Math.min(820,height-(document.fullscreenElement?0:deviceTop)-bottomSpace));
 const expansionHeight=Math.max(0,Math.min(650,height-headerBottom-bottomSpace-36));
 root.style.setProperty('--game-device-height',`${gameHeight}px`);
 root.style.setProperty('--expansion-height',`${expansionHeight}px`);
}
window.fitKittyLayout=fitKittyLayout;
window.addEventListener('resize',fitKittyLayout);
window.visualViewport?.addEventListener('resize',fitKittyLayout);
document.addEventListener('fullscreenchange',fitKittyLayout);
// Header wrapping and browser font loading must use the same calculation.
const layoutObserver=new ResizeObserver(fitKittyLayout);
for(const selector of ['header','.headline']){
 const element=document.querySelector(selector);if(element)layoutObserver.observe(element);
}
document.fonts?.ready.then(fitKittyLayout);
fitKittyLayout();
if(document.body.classList.contains('game-mode'))window.scrollTo({top:0,behavior:'instant'});
