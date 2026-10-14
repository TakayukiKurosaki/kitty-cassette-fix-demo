'use strict';
// BUNNY COIN DASH: 画面上のスティック/ボタン → Godot のキー入力 (WASD / Space / Shift) に変換
(function(){
const KEYS={w:['KeyW','w',87],a:['KeyA','a',65],s:['KeyS','s',83],d:['KeyD','d',68],jump:['Space',' ',32],dash:['ShiftLeft','Shift',16]};
const down={};
function send(k,on){if(!!down[k]===on)return;down[k]=on;const [code,key,keyCode]=KEYS[k];
 const ev=new KeyboardEvent(on?'keydown':'keyup',{code,key,keyCode,which:keyCode,bubbles:true,cancelable:true});
 (document.getElementById('canvas')||window).dispatchEvent(ev)}
window.bunnyInput=send;
const coarse=matchMedia('(pointer:coarse)').matches||'ontouchstart' in window||innerWidth<820;
if(coarse||/[?&]touch/.test(location.search))document.documentElement.classList.add('show-touch');
const ui=document.createElement('div');ui.id='bunny-touch';
ui.innerHTML='<div id="bunny-pad"><div id="bunny-knob"></div></div><div class="bunny-btn" id="bunny-dash">DASH</div><div class="bunny-btn" id="bunny-jump">JUMP</div>';
document.body.appendChild(ui);
const bar=document.createElement('div');bar.id='bunny-bar';bar.innerHTML='<a href="../" title="カセット選択に戻る">← 戻る</a>';document.body.appendChild(bar);
const pad=ui.querySelector('#bunny-pad'),knob=ui.querySelector('#bunny-knob');let pid=null;
function stick(e){const r=pad.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;let dx=e.clientX-cx,dy=e.clientY-cy;const R=r.width/2,l=Math.hypot(dx,dy);if(l>R){dx*=R/l;dy*=R/l}
 knob.style.transform=`translate(${dx}px,${dy}px)`;const t=R*.28;send('a',dx<-t);send('d',dx>t);send('w',dy<-t);send('s',dy>t)}
function release(){pid=null;knob.style.transform='';['w','a','s','d'].forEach(k=>send(k,false))}
pad.addEventListener('pointerdown',e=>{e.preventDefault();pid=e.pointerId;pad.setPointerCapture(e.pointerId);stick(e)});
pad.addEventListener('pointermove',e=>{if(e.pointerId===pid)stick(e)});
['pointerup','pointercancel','lostpointercapture'].forEach(t=>pad.addEventListener(t,e=>{if(e.pointerId===pid)release()}));
for(const [id,k] of [['bunny-jump','jump'],['bunny-dash','dash']]){const b=ui.querySelector('#'+id);
 b.addEventListener('pointerdown',e=>{e.preventDefault();b.setPointerCapture(e.pointerId);b.classList.add('on');send(k,true)});
 ['pointerup','pointercancel','lostpointercapture'].forEach(t=>b.addEventListener(t,()=>{b.classList.remove('on');send(k,false)}))}
addEventListener('blur',()=>{release();send('jump',false);send('dash',false)});
document.addEventListener('contextmenu',e=>e.preventDefault());
})();
