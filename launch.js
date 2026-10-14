'use strict';
let launching=false;
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function launch(game){
 if(launching)return;launching=true;
 window.history.pushState({game},'', '#'+game);
 const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
 const cart=document.getElementById('insertcartridge'),boot=document.getElementById('boot'),home=document.getElementById('home'),text=document.getElementById('boottext');
 const src=window.kittyCartSource?.(game),srcRect=src?.getBoundingClientRect();
 document.getElementById('library').hidden=true;home.hidden=true;boot.hidden=false;
 cart.querySelector('strong').textContent=game==='survivor'?'KITTY SURVIVOR':game==='bunny'?'BUNNY COIN DASH':game==='flap'?'KITTY FLAP':game==='merge'?'KITTY MERGE':'KITTY CATCH';
 document.body.classList.remove('library-mode');document.body.classList.add('boot-mode');
 window.fitKittyLayout?.();
 if(window.kittyCloneCart){const t=cart.parentElement,tw=(document.querySelector('.console-turntable')||t).getBoundingClientRect().width;let ins=document.getElementById('insertclone');if(!ins){ins=document.createElement('div');ins.id='insertclone';ins.className='kitty-insert';ins.setAttribute('aria-hidden','true');t.appendChild(ins)}if(tw&&window.kittyCloneCart(ins,game,tw*.6,src,srcRect)){const h=parseFloat(ins.style.height),th=(document.querySelector('.console-turntable')||t).getBoundingClientRect().height||1,slot=window.kittySlot(ins,th);ins.style.setProperty('--cart-from',(slot.off-h-40)+'px');ins.style.setProperty('--cart-to',(slot.off+th*window.KITTY_TOP)+'px');cart.classList.add('replaced')}}
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
 if(game==='bunny'){location.replace('rabbit/');return}
 if(game==='flap'||game==='merge'){location.replace(game+'.html?nointro');return}
 boot.hidden=true;home.hidden=false;window.fitKittyLayout?.();
 window.scrollTo({top:0,behavior:'instant'});document.getElementById('play').focus({preventScroll:true});
}
document.querySelectorAll('[data-game]').forEach(button=>button.addEventListener('click',()=>launch(button.dataset.game)));
// fix版: 差し込み演出はオリジナル版（本体を裏返す→カセット差し込み→拡大）を使用。
if(location.hash==='#catch')location.replace('catch.html');else if(location.hash==='#bunny')location.replace('rabbit/');else if(location.hash==='#flap'||location.hash==='#merge')location.replace(location.hash.slice(1)+'.html');else if(location.hash==='#survivor')launch('survivor');
