'use strict';
// Design: docs/20261014_155205_flap_merge_design.md, PART A.
(function(root){
  const W=600,H=600,GROUND_Y=556,CAT_X=180,CAT_R=15,TOWER_W=70,DURATION=30,CLEAR_BONUS=5;
  const GRAVITY=1500,FLAP_V=-430,MAX_FALL=640;
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  function create(rand=Math.random){return {rand,mode:'ready',y:270,vy:0,t:0,score:0,towers:[],spawn:.6,flapT:0,cleared:false}}
  function flap(s){
    if(s.mode==='ready')s.mode='playing';
    if(s.mode!=='playing')return false;
    s.vy=FLAP_V;s.flapT=.18;return true;
  }
  function circleRect(cx,cy,r,x,y,w,h){return (cx-clamp(cx,x,x+w))**2+(cy-clamp(cy,y,y+h))**2<r*r}
  function gapSize(s){return Math.max(150,195-s.t*1.4)}
  function addTower(s){
    const gap=gapSize(s),top=100+s.rand()*(GROUND_Y-100-gap-60);
    s.towers.push({x:W+TOWER_W,top,gap,passed:false});
  }
  function hits(s){
    return s.y+CAT_R>=GROUND_Y || s.towers.some(t=>
      circleRect(CAT_X,s.y,CAT_R,t.x,0,TOWER_W,t.top) ||
      circleRect(CAT_X,s.y,CAT_R,t.x,t.top+t.gap,TOWER_W,GROUND_Y-t.top-t.gap));
  }
  function step(s,dt){
    const ev=[];if(s.mode!=='playing')return ev;
    // Common section 0.10 takes precedence over A4's 0.05 pseudocode.
    dt=Number.isFinite(dt)?clamp(dt,0,.04):0;
    s.t+=dt;s.flapT=Math.max(0,s.flapT-dt);
    s.vy=Math.min(MAX_FALL,s.vy+GRAVITY*dt);s.y+=s.vy*dt;
    if(s.y<CAT_R){s.y=CAT_R;s.vy=Math.max(0,s.vy)}
    s.spawn-=dt;
    if(s.spawn<=0 && s.t<DURATION-1.2){addTower(s);s.spawn=Math.max(1.05,1.5-s.t*.012)}
    for(const t of s.towers){
      t.x-=(210+s.t*3.5)*dt;
      if(!t.passed && t.x+TOWER_W<CAT_X-CAT_R){t.passed=true;s.score++;ev.push('pass')}
    }
    s.towers=s.towers.filter(t=>t.x>-TOWER_W-10);
    if(hits(s)){s.mode='over';s.y=Math.min(s.y,GROUND_Y-CAT_R);ev.push('hit')}
    else if(s.t>=DURATION){s.mode='over';s.cleared=true;s.score+=CLEAR_BONUS;ev.push('clear')}
    return ev;
  }
  root.KittyFlapCore={W,H,GROUND_Y,CAT_X,CAT_R,TOWER_W,DURATION,CLEAR_BONUS,create,flap,step,hits,circleRect,addTower,gapSize};
})(typeof window==='undefined'?globalThis:window);

(function(){
  if(typeof document==='undefined')return;
  const c=document.getElementById('game');
  if(!c || !document.body.classList.contains('flap-mode'))return;
  const F=window.KittyFlapCore,P=window.KittyPixel,g=c.getContext('2d'),$=id=>document.getElementById(id);
  const KEY='kitty-flap-best',RETRY_LOCK=.45;
  let s=F.create(),best=0,S=1,OX=0,OY=0,last=0,overAt=0,keys={},fx=[],sound=false,audio;
  try{const v=Number(localStorage.getItem(KEY));best=Number.isFinite(v)&&v>=0?Math.floor(v):0}catch{}
  $('best').textContent=best;
  window.__flap=s;window.__flapApi={state:()=>window.__flap,press};
  function fitCanvas(){
    const v=$('viewport'),dpr=Math.min(2,window.devicePixelRatio||1);
    if(!(v.clientWidth>0 && v.clientHeight>0))return;
    const pw=Math.round(v.clientWidth*dpr),ph=Math.round(v.clientHeight*dpr);
    if(c.width!==pw || c.height!==ph){c.width=pw;c.height=ph}
    S=Math.min(pw/600,ph/600);OX=(pw-600*S)/2;OY=(ph-600*S)/2;g.imageSmoothingEnabled=false;
  }
  function tone(freq){
    if(!sound)return;
    try{
      audio??=new(window.AudioContext||window.webkitAudioContext)();audio.resume().catch(()=>{});
      const o=audio.createOscillator(),v=audio.createGain();o.type='square';o.frequency.value=freq;
      o.connect(v);v.connect(audio.destination);v.gain.setValueAtTime(.03,audio.currentTime);
      v.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.12);o.start();o.stop(audio.currentTime+.12);
    }catch{}
  }
  function burst(color){for(let i=0;i<9;i++)fx.push({x:F.CAT_X,y:s.y,vx:-30-Math.random()*110,vy:(Math.random()-.5)*160,life:.45,color})}
  function start(){
    if(document.body.classList.contains('intro-active'))return;
    if(s.mode==='over' && performance.now()-overAt<=RETRY_LOCK*1000)return;
    s=F.create();F.flap(s);window.__flap=s;keys={};fx=[];
    $('overlay').style.display='none';$('pausebox').hidden=true;$('pause').disabled=false;
    $('status').textContent='PLAYING';$('start').blur();hud();tone(600);
  }
  function press(){
    if(document.body.classList.contains('intro-active'))return;
    if(s.mode==='ready' || s.mode==='over'){start();return}
    if(F.flap(s)){tone(520);burst('#ff8fc4')}
  }
  function pause(){
    if(s.mode==='playing'){s.mode='paused';keys={};$('pausebox').hidden=false;$('status').textContent='PAUSED'}
    else if(s.mode==='paused'){s.mode='playing';$('pausebox').hidden=true;$('status').textContent='PLAYING'}
  }
  function finish(){
    overAt=performance.now();keys={};$('status').textContent=s.cleared?'CLEAR':'GAME OVER';$('pause').disabled=true;
    if(s.score>best){best=s.score;try{localStorage.setItem(KEY,best)}catch{}}
    $('best').textContent=best;$('overlabel').textContent=s.cleared?'30 SEC CLEAR / ENCORE +5':'GAME OVER / YOUR RESULT';
    $('overtitle').textContent=`${s.score} GATES`;
    $('overtext').innerHTML=s.cleared?'30秒クリア！ ボーナス +5<br>タップでもう一度、アンコール。':'タップで、もう一度。<br>スピーカーのすき間を目指そう！';
    $('start').textContent='PLAY AGAIN ↗';$('overlay').style.display='flex';tone(s.cleared?880:140);burst(s.cleared?'#ffe58a':'#8b6f99');
  }
  function hud(){
    $('score').textContent=String(s.score).padStart(4,'0');$('time').textContent=Math.max(0,F.DURATION-s.t).toFixed(1);
    $('combo').textContent=s.mode==='over'?(s.cleared?'ENCORE!':'OOPS!'):s.mode==='ready'?'TAP TO FLAP':'FLY HIGH!';
  }
  c.addEventListener('pointerdown',e=>{e.preventDefault();press()});
  $('overlay').addEventListener('pointerdown',e=>{if(e.target.closest('button'))return;e.preventDefault();press()});
  window.addEventListener('keydown',e=>{
    if(document.body.classList.contains('intro-active'))return;
    if(![' ','ArrowUp','w','W','Escape'].includes(e.key))return;
    // Leave focused controls to their native keyboard activation.
    if(e.key===' ' && e.target?.closest?.('button,a'))return;
    e.preventDefault();if(e.repeat)return;keys[e.key]=true;
    if(e.key==='Escape')pause();else press();
  });
  window.addEventListener('keyup',e=>{delete keys[e.key]});
  window.addEventListener('blur',()=>{keys={};if(s.mode==='playing')pause()});
  document.addEventListener('visibilitychange',()=>{if(document.hidden && s.mode==='playing')pause()});
  $('start').onclick=()=>{start();$('start').blur()};$('pause').onclick=pause;$('resume').onclick=pause;
  $('sound').onclick=()=>{sound=!sound;$('sound').textContent=sound?'SOUND ON':'♪ SOUND OFF';$('sound').setAttribute('aria-pressed',String(sound));tone(700)};
  const CAT=['..k......k..','.kpk....kpk.','.kwwkkkkwwk.','kwwwwwwwwwwk','kwkwwwwwwkwk','kwwwwppwwwwk','kpwwwwwwwwpk','.kwwwkkwwwk.','..kkwwwwkk..','....kkkk....'];
  const WING=['.ww.','wwww','..ww'],NOTE=['..kkkk','..k..k','..k...','..k...','kkk...','kk....'];
  function stack(x,y,h,upper){
    g.save();g.beginPath();g.rect(x-6,y,F.TOWER_W+12,h);g.clip();
    g.fillStyle='#5a4466';g.fillRect(x,y,F.TOWER_W,h);
    for(let cy=upper?y+h-42:y+42;upper?cy>y-78:cy<y+h+78;cy+=upper?-78:78){
      g.fillStyle='#8b6f99';g.fillRect(x+6,cy-34,F.TOWER_W-12,68);
      P.disc(g,x+35,cy-10,15,'#2b1b30','#ffb6d9',3);
      P.disc(g,x+35,cy+19,7,'#2b1b30','#ffe58a',3);
      g.fillStyle='#2b1b30';g.fillRect(x+10,cy-29,4,4);g.fillRect(x+56,cy+25,4,4);
    }
    g.fillStyle='#ffb6d9';g.fillRect(x-6,upper?y+h-12:y,F.TOWER_W+12,12);g.restore();
  }
  function draw(){
    fitCanvas();g.setTransform(1,0,0,1,0,0);g.fillStyle='#24152a';g.fillRect(0,0,c.width,c.height);
    g.setTransform(S,0,0,S,OX,OY);g.save();g.beginPath();g.rect(0,0,600,600);g.clip();
    g.fillStyle='#fde9f3';g.fillRect(0,0,600,600);
    for(let i=0;i<15;i++)P.map(g,NOTE,{k:'#efc0da'},((i*137-s.t*22)%700+700)%700-50,45+(i*83)%460,4);
    for(const t of s.towers){stack(t.x,0,t.top,true);stack(t.x,t.top+t.gap,F.GROUND_Y-t.top-t.gap,false)}
    g.fillStyle='#8fd0b4';g.fillRect(0,F.GROUND_Y,600,44);g.fillStyle='#6db394';
    for(let x=-40;x<640;x+=24)g.fillRect(x-(s.t*80)%24,F.GROUND_Y+6,12,8);
    g.save();g.translate(F.CAT_X,s.y);g.rotate(Math.max(-.45,Math.min(.6,s.vy/900)));
    P.mapC(g,WING,{w:'#ffd4ea'},-32,s.flapT>0?-17:0,4.2);
    P.mapC(g,WING,{w:'#ffd4ea'},32,s.flapT>0?-17:0,4.2);
    P.mapC(g,CAT,{k:'#2b1b30',w:'#fff8fb',p:'#ff8fc4'},0,0,4.2);g.restore();
    // Keep the central score readable even when an amp passes behind it.
    g.fillStyle='#fff8fb';g.fillRect(268,16,64,64);P.text(g,s.score,300,48,44);
    for(const p of fx){g.globalAlpha=Math.max(0,p.life/.45);g.fillStyle=p.color;g.fillRect(p.x,p.y,5,5)}
    g.globalAlpha=1;g.restore();
  }
  function frame(ts){
    const dt=Math.max(0,Math.min(.04,(ts-last)/1000||0));last=ts;
    if(s.mode==='playing'){
      for(const ev of F.step(s,dt))if(ev==='pass'){tone(800);burst('#ffe58a')}
      if(s.mode==='over')finish();
    }
    for(const p of fx){p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt}fx=fx.filter(p=>p.life>0);
    hud();draw();requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
