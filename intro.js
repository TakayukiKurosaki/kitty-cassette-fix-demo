'use strict';
// Shared cassette boot intro. playCassetteIntro({title}) -> Promise resolved when the game should be visible.
(function(){
// fix版: 差し込むカセットを一覧のカセットと同じデザイン・縦横比にする（一覧のDOMを複製して縮小）。

// 本体画像(handheld_back.png 840x1280)の実測: 上端の見える縁 y=37, カセット収納くぼみの下端 y≈304
window.KITTY_TOP=37/1280;window.KITTY_SLOT_BOTTOM=304/1280;
// カセットを「くぼみの下端より下は本体の中」に見せるクリップ窓で包む。off=窓の上方向の余白(px)
window.kittySlot=function(el,backH){let w=el.parentElement;if(!w.classList.contains('kitty-slot')){w=document.createElement('div');w.className='kitty-slot';el.parentElement.insertBefore(w,el);w.appendChild(el)}const off=Math.ceil(backH*1.2+60);Object.assign(w.style,{position:'absolute',left:'0',right:'0',top:-off+'px',height:(off+backH*window.KITTY_SLOT_BOTTOM)+'px',overflow:'hidden',pointerEvents:'none',zIndex:'1'});return {wrap:w,off}};
window.KITTY_CART_HTML={"catch": "<div class=\"cartridge pink-cartridge\"><div class=\"cart-ridges\"></div><div class=\"cart-label catch-label\"><span>UNI / VOL.01</span><div class=\"catch-art\">♡<i>✦</i><b>♡</b></div><strong>KITTY<br>CATCH</strong><small>A LITTLE SWEET CHAOS</small></div><div class=\"cart-base\">▥ ▥ ▥ ▥ ▥</div></div>", "flap": "<div class=\"cartridge flap-cartridge\"><div class=\"cart-ridges\"></div><div class=\"cart-label flap-label\"><span>UNI / VOL.04</span><svg viewBox=\"0 0 240 160\" aria-hidden=\"true\" shape-rendering=\"crispEdges\"><rect x=\"0\" y=\"0\" width=\"240\" height=\"160\" fill=\"#3a2a4a\"/><g fill=\"#5a4466\"><rect x=\"18\" y=\"0\" width=\"34\" height=\"46\"/><rect x=\"18\" y=\"112\" width=\"34\" height=\"48\"/><rect x=\"188\" y=\"0\" width=\"34\" height=\"70\"/><rect x=\"188\" y=\"134\" width=\"34\" height=\"26\"/></g><g fill=\"#ffb6d9\"><rect x=\"14\" y=\"40\" width=\"42\" height=\"8\"/><rect x=\"14\" y=\"110\" width=\"42\" height=\"8\"/><rect x=\"184\" y=\"64\" width=\"42\" height=\"8\"/><rect x=\"184\" y=\"132\" width=\"42\" height=\"8\"/></g><g fill=\"#2b1b30\"><rect x=\"27\" y=\"10\" width=\"16\" height=\"16\"/><rect x=\"27\" y=\"124\" width=\"16\" height=\"16\"/><rect x=\"197\" y=\"22\" width=\"16\" height=\"16\"/></g><g transform=\"translate(92 54)\"><g fill=\"#2b1b30\"><rect x=\"0\" y=\"0\" width=\"8\" height=\"8\"/><rect x=\"48\" y=\"0\" width=\"8\" height=\"8\"/><rect x=\"0\" y=\"8\" width=\"56\" height=\"40\"/></g><g fill=\"#fff8fb\"><rect x=\"4\" y=\"12\" width=\"48\" height=\"32\"/><rect x=\"4\" y=\"8\" width=\"8\" height=\"4\"/><rect x=\"44\" y=\"8\" width=\"8\" height=\"4\"/></g><g fill=\"#2b1b30\"><rect x=\"14\" y=\"20\" width=\"6\" height=\"8\"/><rect x=\"36\" y=\"20\" width=\"6\" height=\"8\"/><rect x=\"25\" y=\"32\" width=\"6\" height=\"4\"/></g><g fill=\"#ff8fc4\"><rect x=\"8\" y=\"30\" width=\"6\" height=\"4\"/><rect x=\"42\" y=\"30\" width=\"6\" height=\"4\"/></g><g fill=\"#ffd4ea\"><rect x=\"-18\" y=\"6\" width=\"16\" height=\"10\"/><rect x=\"58\" y=\"6\" width=\"16\" height=\"10\"/><rect x=\"-14\" y=\"2\" width=\"8\" height=\"4\"/><rect x=\"62\" y=\"2\" width=\"8\" height=\"4\"/></g></g><g fill=\"#ffe58a\"><rect x=\"150\" y=\"30\" width=\"6\" height=\"22\"/><rect x=\"142\" y=\"46\" width=\"10\" height=\"8\"/><rect x=\"156\" y=\"30\" width=\"10\" height=\"5\"/><rect x=\"66\" y=\"112\" width=\"5\" height=\"18\"/><rect x=\"59\" y=\"126\" width=\"9\" height=\"7\"/></g><g fill=\"#fde9f3\"><rect x=\"70\" y=\"20\" width=\"4\" height=\"4\"/><rect x=\"170\" y=\"110\" width=\"4\" height=\"4\"/><rect x=\"120\" y=\"128\" width=\"4\" height=\"4\"/></g></svg><strong>KITTY<br>FLAP</strong><small>ONE TAP ON THE BEAT</small></div><div class=\"cart-base\">▥ ▥ ▥ ▥ ▥</div></div>", "merge": "<div class=\"cartridge merge-cartridge\"><div class=\"cart-ridges\"></div><div class=\"cart-label merge-label\"><span>UNI / VOL.05</span><svg viewBox=\"0 0 240 160\" aria-hidden=\"true\" shape-rendering=\"crispEdges\"><rect x=\"58\" y=\"34\" width=\"124\" height=\"118\" fill=\"#fff8fb\"/><g fill=\"#5a4466\"><rect x=\"50\" y=\"34\" width=\"8\" height=\"126\"/><rect x=\"182\" y=\"34\" width=\"8\" height=\"126\"/><rect x=\"50\" y=\"152\" width=\"140\" height=\"8\"/></g><g fill=\"#ff8fc4\"><rect x=\"58\" y=\"50\" width=\"10\" height=\"3\"/><rect x=\"76\" y=\"50\" width=\"10\" height=\"3\"/><rect x=\"94\" y=\"50\" width=\"10\" height=\"3\"/><rect x=\"112\" y=\"50\" width=\"10\" height=\"3\"/><rect x=\"130\" y=\"50\" width=\"10\" height=\"3\"/><rect x=\"148\" y=\"50\" width=\"10\" height=\"3\"/><rect x=\"166\" y=\"50\" width=\"10\" height=\"3\"/></g><circle cx=\"94\" cy=\"128\" r=\"24\" fill=\"#ffd65a\" stroke=\"#2b1b30\" stroke-width=\"4\"/><path d=\"M94 112 l5 11 12 1 -9 8 3 12 -11 -6 -11 6 3 -12 -9 -8 12 -1z\" fill=\"#8a5a00\"/><circle cx=\"145\" cy=\"132\" r=\"20\" fill=\"#fff4e2\" stroke=\"#2b1b30\" stroke-width=\"4\"/><path d=\"M131 122 l4 -10 6 7 M159 122 l-4 -10 -6 7\" fill=\"#2b1b30\"/><rect x=\"137\" y=\"128\" width=\"4\" height=\"5\" fill=\"#2b1b30\"/><rect x=\"150\" y=\"128\" width=\"4\" height=\"5\" fill=\"#2b1b30\"/><circle cx=\"160\" cy=\"98\" r=\"14\" fill=\"#c9b6f2\" stroke=\"#2b1b30\" stroke-width=\"3\"/><path d=\"M150 92 q10 6 20 0 M149 101 q11 6 22 0\" stroke=\"#5b3fa0\" stroke-width=\"2\" fill=\"none\"/><circle cx=\"120\" cy=\"96\" r=\"10\" fill=\"#ffc4dd\" stroke=\"#2b1b30\" stroke-width=\"3\"/><circle cx=\"120\" cy=\"99\" r=\"3.5\" fill=\"#b4386f\"/><circle cx=\"115\" cy=\"93\" r=\"1.6\" fill=\"#b4386f\"/><circle cx=\"125\" cy=\"93\" r=\"1.6\" fill=\"#b4386f\"/><circle cx=\"104\" cy=\"16\" r=\"9\" fill=\"#ffe58a\" stroke=\"#2b1b30\" stroke-width=\"3\"/><rect x=\"103\" y=\"8\" width=\"3\" height=\"10\" fill=\"#6b4b12\"/><circle cx=\"102\" cy=\"19\" r=\"2.6\" fill=\"#6b4b12\"/><circle cx=\"136\" cy=\"16\" r=\"9\" fill=\"#ffe58a\" stroke=\"#2b1b30\" stroke-width=\"3\"/><rect x=\"135\" y=\"8\" width=\"3\" height=\"10\" fill=\"#6b4b12\"/><circle cx=\"134\" cy=\"19\" r=\"2.6\" fill=\"#6b4b12\"/><path d=\"M114 16 h10 M120 12 l4 4 -4 4\" stroke=\"#fde9f3\" stroke-width=\"3\" fill=\"none\"/><g fill=\"#ffb6d9\"><rect x=\"20\" y=\"40\" width=\"6\" height=\"6\"/><rect x=\"210\" y=\"70\" width=\"6\" height=\"6\"/><rect x=\"24\" y=\"120\" width=\"4\" height=\"4\"/></g></svg><strong>KITTY<br>MERGE</strong><small>DROP · MATCH · GROW</small></div><div class=\"cart-base\">▥ ▥ ▥ ▥ ▥</div></div>"};
window.kittyCartSource=function(game){
 const listed=document.querySelector('[data-game="'+game+'"] .cartridge');if(listed&&listed.getBoundingClientRect().width)return listed;
 const T=window.KITTY_CART_HTML||{};if(!T[game])return null;
 // catch.html には一覧が無いので、一覧と同じCSS構造で不可視の計測用コピーを置く
 const m=document.createElement('section');m.className='library';m.setAttribute('aria-hidden','true');
 m.style.cssText='display:block;position:absolute;left:0;right:0;top:0;visibility:hidden;pointer-events:none';
 m.innerHTML='<div class="cartridges"><div class="cartridge-card">'+T[game]+'</div><div class="cartridge-card"></div></div>';
 (document.querySelector('main')||document.body).appendChild(m);window.__kittyMeasure=m;return m.querySelector('.cartridge');
};
window.kittyCloneCart=function(host,game,slotW,src,rect){
 src=src||window.kittyCartSource(game);if(!src||!host)return false;
 const r=rect&&rect.width?rect:src.getBoundingClientRect();if(!(r.width>0&&r.height>0))return false;
 const k=slotW/r.width,c=src.cloneNode(true);
 c.querySelectorAll('[id]').forEach(e=>e.removeAttribute('id'));
 c.style.cssText='position:absolute;left:0;top:0;margin:0;max-width:none;outline:none;width:'+r.width+'px;height:'+r.height+'px;transform:scale('+k+');transform-origin:0 0';
 host.replaceChildren(c);host.classList.add('cloned');host.style.width=slotW+'px';host.style.height=(r.height*k)+'px';host.dataset.ar=(r.width/r.height).toFixed(3);
 window.__kittyMeasure?.remove();window.__kittyMeasure=null;return true;
};
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
  try{const sw=parseFloat(stage.style.width);const sh=parseFloat(stage.style.height);if(window.kittyCloneCart(cart,/SURVIVOR/.test(title)?'survivor':/FLAP/.test(title)?'flap':/MERGE/.test(title)?'merge':'catch',sw*.6)){const slot=window.kittySlot(cart,sh);cart.style.left=(sw*.2)+'px';cart.style.top=(slot.off+sh*window.KITTY_TOP)+'px'}}catch(e){/* 複製できなければ従来のカセット表示のまま */}
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
