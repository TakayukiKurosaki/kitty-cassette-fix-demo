// Full document navigation also stops the game loop, sound and pending boot timers.
function returnToCollection(){ window.location.replace('./'); }
document.querySelectorAll('.collection-back').forEach(link=>link.addEventListener('click',event=>{event.preventDefault();returnToCollection()}));
document.getElementById('libraryback').onclick=returnToCollection;
window.addEventListener('popstate',returnToCollection);
if(document.body.classList.contains('catch-mode')){
 const field=document.getElementById('game'),viewport=document.getElementById('viewport');
 const fit=()=>viewport.style.setProperty('--catch-side',Math.min(viewport.clientWidth,viewport.clientHeight)+'px');
 new ResizeObserver(fit).observe(viewport);fit();
 document.getElementById('fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.querySelector('.device').requestFullscreen()}catch{document.getElementById('status').textContent='全画面非対応'}};
}
