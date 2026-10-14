'use strict';
// Shared cassette boot intro. playCassetteIntro({title}) -> Promise resolved when the game should be visible.
(function(){
const wait=ms=>new Promise(r=>setTimeout(r,ms));
window.playCassetteIntro=function({title='KITTY CATCH'}={}){
 return new Promise(resolve=>{
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root=document.createElement('div');root.id='cassette-intro';root.setAttribute('role','presentation');
  root.innerHTML=`<div class="ci-camera"><div class="ci-stage"><div class="ci-body"><div class="ci-face ci-front"><div class="ci-led"></div><div class="ci-screen"><div class="ci-logo">UNI <span>♡</span></div><div class="ci-boottext"></div></div></div><div class="ci-face ci-back"><div class="ci-cart"><b>UNI</b><strong></strong><small style="font-size:clamp(6px,1.1vmin,9px);letter-spacing:2px">GAME CASSETTE</small></div><div class="ci-pocket"></div></div></div></div></div><p class="ci-caption" aria-live="polite"></p><p class="ci-skip">タップ / キーでスキップ</p>`;
  document.body.appendChild(root);
  const q=s=>root.querySelector(s),cam=q('.ci-camera'),stage=q('.ci-stage'),body=q('.ci-body'),cart=q('.ci-cart'),screen=q('.ci-screen'),led=q('.ci-led'),cap=q('.ci-caption');
  cart.querySelector('strong').textContent=title;q('.ci-boottext').textContent=title+' / LOADING';
  let finished=false,zoomed=false;
  function layout(){ // handheld sized to fit viewport, with room above for the cassette drop
   const vw=innerWidth,vh=innerHeight,h=Math.min(vh*.68,vw*.8*1280/840,640),w=h*840/1280;
   Object.assign(stage.style,{width:w+'px',height:h+'px',left:(vw-w)/2+'px',top:(vh-h)/2+h*.06+'px'});
   if(zoomed)zoomTransform();
  }
  function zoomTransform(){
   const vw=innerWidth,vh=innerHeight,sw=parseFloat(stage.style.width)*.452,sh=parseFloat(stage.style.height)*.262;
   const sx=parseFloat(stage.style.left)+parseFloat(stage.style.width)*.274,sy=parseFloat(stage.style.top)+parseFloat(stage.style.height)*.144;
   const k=Math.max(vw/sw,vh/sh)*1.04;
   cam.style.transform=`translate(${vw/2-(sx+sw/2)*k}px,${vh/2-(sy+sh/2)*k}px) scale(${k})`;
  }
  layout();addEventListener('resize',layout);
  function finish(){if(finished)return;finished=true;removeEventListener('resize',layout);root.classList.add('done');document.body.classList.remove('intro-active');resolve();setTimeout(()=>root.remove(),500)}
  const skip=e=>{e?.preventDefault?.();finish()};
  root.addEventListener('pointerdown',skip);addEventListener('keydown',function k(e){if(finished){removeEventListener('keydown',k);return}removeEventListener('keydown',k);skip(e)});
  (async()=>{
   if(reduced){screen.classList.add('on','boot');led.classList.add('on');await wait(700);return finish()}
   cap.textContent='本体を裏返しています';await wait(250);body.classList.add('back');await wait(650);   // 0.9s
   cap.textContent='カセットを差し込みます';cart.classList.add('drop');await wait(300);cart.classList.add('in');cart.classList.remove('drop');await wait(800); // 2.0s
   cap.textContent='表に戻して電源オン';body.classList.remove('back');await wait(650); // 2.65s
   led.classList.add('on');screen.classList.add('flicker');await wait(350);screen.classList.add('on','boot');await wait(900); // 3.9s
   if(finished)return;root.classList.add('zooming');zoomed=true;cam.classList.add('zoom');zoomTransform();await wait(1250); // 5.15s
   finish();
  })();
 });
};
})();
