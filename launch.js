'use strict';
// fix版: 起動演出は intro.js の共通シーケンス（裏返す→差し込む→表へ→電源→画面へズーム）に一本化。
let launching=false;
async function launch(game){
 if(launching)return;launching=true;
 if(game==='catch'){location.href='catch.html';return}   // catch.html 側で同じ起動演出を再生
 window.history.pushState({game},'','#'+game);
 const boot=document.getElementById('boot'),home=document.getElementById('home');
 document.getElementById('library').hidden=true;boot.hidden=true;home.hidden=false;
 document.body.classList.remove('library-mode');document.body.classList.add('game-mode','intro-active');
 window.fitKittyLayout?.();window.scrollTo({top:0,behavior:'instant'});
 await playCassetteIntro({title:'KITTY SURVIVOR'});
 window.fitKittyLayout?.();document.getElementById('play').focus({preventScroll:true});
}
document.querySelectorAll('[data-game]').forEach(button=>button.addEventListener('click',()=>launch(button.dataset.game)));
if(location.hash==='#catch')location.replace('catch.html');else if(location.hash==='#survivor')launch('survivor');
