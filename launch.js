'use strict';
let launching=false;
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function launch(game){
 if(launching)return;launching=true;
 window.history.pushState({game},'', '#'+game);
 const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
 const cart=document.getElementById('insertcartridge'),boot=document.getElementById('boot'),home=document.getElementById('home'),text=document.getElementById('boottext');
 document.getElementById('library').hidden=true;home.hidden=true;boot.hidden=false;
 cart.querySelector('strong').textContent=game==='survivor'?'KITTY SURVIVOR':'KITTY CATCH';
 document.body.classList.remove('library-mode');document.body.classList.add('boot-mode');
 window.fitKittyLayout?.();
 window.scrollTo({top:0,behavior:'instant'});
 const caption=document.getElementById('sequencecaption');
 caption.textContent='本体を裏返しています';
 await delay(reduced?80:550);document.body.classList.add('show-back');
 await delay(reduced?80:1000);caption.textContent='カセットを差し込みます';document.body.classList.add('inserting');
 await delay(reduced?80:1300);caption.textContent='カセットをセットしました';text.textContent='CASSETTE LOADED';
 await delay(reduced?80:450);document.body.classList.remove('show-back');caption.textContent='電源を入れています';
 await delay(reduced?80:1100);text.textContent='WELCOME TO YOUR WORLD';
 await delay(reduced?80:650);document.body.classList.add('expanding');window.fitKittyLayout?.();caption.textContent='ゲーム画面を拡大しています';
 await delay(reduced?80:1100);document.body.classList.remove('boot-mode','inserting');document.body.classList.add('game-mode');caption.textContent='';
 if(game==='catch'){location.replace('catch.html?nointro');return}
 boot.hidden=true;home.hidden=false;window.fitKittyLayout?.();
 window.scrollTo({top:0,behavior:'instant'});document.getElementById('play').focus({preventScroll:true});
}
document.querySelectorAll('[data-game]').forEach(button=>button.addEventListener('click',()=>launch(button.dataset.game)));
// fix版: 差し込み演出はオリジナル版（本体を裏返す→カセット差し込み→拡大）を使用。
if(location.hash==='#catch')location.replace('catch.html');else if(location.hash==='#survivor')launch('survivor');
