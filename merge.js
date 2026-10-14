'use strict';
// Design: docs/20261014_155205_flap_merge_design.md, PART B.
(function(root){
  const W=600,H=600,L=132,RT=468,BOTTOM=566,TOPLINE=150,DROP_Y=100;
  const STAGES=[
    {id:'note',name:'おんぷ',r:16,color:'#ffe58a'},
    {id:'paw',name:'にくきゅう',r:22,color:'#ffc4dd'},
    {id:'fish',name:'おさかな',r:29,color:'#a9dcf0'},
    {id:'yarn',name:'けいとだま',r:37,color:'#c9b6f2'},
    {id:'cat',name:'ねこ',r:46,color:'#fff4e2'},
    {id:'heart',name:'ハート',r:56,color:'#ff8fc4'},
    {id:'star',name:'スター',r:67,color:'#ffd65a'},
    {id:'record',name:'レコード',r:79,color:'#4a3a52'}
  ];
  const MAX=STAGES.length-1,GRAVITY=1500,SUBSTEPS=3,SOLVER_ITERS=4;
  function pick(s){return Math.floor(s.rand()*4)}
  function create(rand=Math.random){
    const s={rand,mode:'playing',items:[],t:0,score:0,cursor:W/2,cool:0,overT:0,merges:0,maxStage:0,nextId:1};
    s.current=pick(s);s.next=pick(s);return s;
  }
  function clampX(s,x,stage=s.current){const r=STAGES[stage].r;return Math.max(L+r,Math.min(RT-r,x))}
  function add(s,stage,x,y,vy=0){
    const it={id:s.nextId++,st:stage,r:STAGES[stage].r,x,y,vx:0,vy,age:0};s.items.push(it);return it;
  }
  function drop(s){
    if(s.mode!=='playing' || s.cool>0)return null;
    const it=add(s,s.current,clampX(s,s.cursor),DROP_Y,80);
    s.current=s.next;s.next=pick(s);s.cool=.5;return it;
  }
  function collide(a,b){
    const dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy),o=a.r+b.r-d;
    if(o<=0)return false;
    // Coincident centres need a nonzero normal; dividing zero deltas by epsilon
    // would leave them permanently interpenetrating.
    const nx=d>0?dx/d:1,ny=d>0?dy/d:0;
    const ma=a.r*a.r,mb=b.r*b.r,ia=mb/(ma+mb),ib=ma/(ma+mb);
    a.x-=nx*o*ia;a.y-=ny*o*ia;b.x+=nx*o*ib;b.y+=ny*o*ib;
    const rv=(b.vx-a.vx)*nx+(b.vy-a.vy)*ny;
    if(rv<0){const j=-1.15*rv;a.vx-=j*nx*ia;a.vy-=j*ny*ia;b.vx+=j*nx*ib;b.vy+=j*ny*ib}
    return true;
  }
  function walls(it){
    if(it.x-it.r<L){it.x=L+it.r;if(it.vx<0)it.vx*= -.2}
    if(it.x+it.r>RT){it.x=RT-it.r;if(it.vx>0)it.vx*= -.2}
    if(it.y+it.r>BOTTOM){it.y=BOTTOM-it.r;if(it.vy>0)it.vy*= -.15;it.vx*=.96}
  }
  function points(stage){return (stage+1)*(stage+2)/2}
  function merges(s,ev){
    const gone=new Set(),n=s.items.length;
    // Snapshot length excludes new items from this merge pass.
    for(let i=0;i<n;i++){
      const a=s.items[i];if(gone.has(a.id))continue;
      for(let j=i+1;j<n;j++){
        const b=s.items[j];if(gone.has(b.id)||a.st!==b.st)continue;
        if(Math.hypot(a.x-b.x,a.y-b.y)>a.r+b.r+1.5)continue;
        gone.add(a.id);gone.add(b.id);
        const x=(a.x+b.x)/2,y=(a.y+b.y)/2;
        if(a.st<MAX){
          const stage=a.st+1,it=add(s,stage,x,y,-80);it.age=1;
          // A larger newborn must also fit inside the case in this substep.
          walls(it);s.maxStage=Math.max(s.maxStage,stage);s.score+=points(stage);
          ev.push({type:'merge',stage,x,y});
        }else{s.score+=100;ev.push({type:'bonus',x,y})}
        s.merges++;break;
      }
    }
    if(gone.size)s.items=s.items.filter(it=>!gone.has(it.id));
  }
  function step(s,dt){
    const ev=[];if(s.mode!=='playing')return ev;
    dt=Number.isFinite(dt)?Math.max(0,Math.min(.033,dt)):0;
    s.t+=dt;s.cool=Math.max(0,s.cool-dt);const h=dt/SUBSTEPS;
    for(let k=0;k<SUBSTEPS;k++){
      for(const it of s.items){it.vy+=GRAVITY*h;it.vx*=.999;it.x+=it.vx*h;it.y+=it.vy*h;it.age+=h}
      for(let n=0;n<SOLVER_ITERS;n++){
        for(let i=0;i<s.items.length;i++)for(let j=i+1;j<s.items.length;j++)collide(s.items[i],s.items[j]);
        for(const it of s.items)walls(it);
      }
      merges(s,ev);
    }
    const high=s.items.some(it=>it.age>1.2 && it.y-it.r<TOPLINE && Math.abs(it.vy)<120);
    s.overT=high?s.overT+dt:0;
    if(s.overT>1.3){s.mode='over';ev.push({type:'over'})}
    return ev;
  }
  root.KittyMergeCore={W,H,L,RT,BOTTOM,TOPLINE,DROP_Y,STAGES,MAX,create,pick,drop,step,add,collide,walls,merges,points,clampX};
})(typeof window==='undefined'?globalThis:window);

(function(){
  if(typeof document==='undefined')return;
  const c=document.getElementById('game');
  if(!c || !document.body.classList.contains('merge-mode'))return;
  const M=window.KittyMergeCore,P=window.KittyPixel,g=c.getContext('2d'),$=id=>document.getElementById(id),KEY='kitty-merge-best';
  let s=M.create(),mode='ready',S=1,OX=0,OY=0,last=0,best=0,keys={},held=null,fx=[],sound=false,audio;
  // The core starts playing by contract; the page waits for its START input.
  s.mode='ready';
  try{const v=Number(localStorage.getItem(KEY));best=Number.isFinite(v)&&v>=0?Math.floor(v):0}catch{}
  $('best').textContent=best;
  window.__mergeApi={state:()=>s,start,drop,setCursor};
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
  function clearInput(){keys={};held=null}
  function start(){
    if(document.body.classList.contains('intro-active'))return;
    s=M.create();mode='playing';fx=[];clearInput();
    $('overlay').style.display='none';$('pausebox').hidden=true;$('pause').disabled=false;$('status').textContent='PLAYING';$('start').blur();hud();tone(600);
  }
  function setCursor(x){if(Number.isFinite(x))s.cursor=M.clampX(s,x);return s.cursor}
  function drop(){if(mode!=='playing')return null;const it=M.drop(s);if(it)tone(340);return it}
  function pause(){
    if(mode==='playing'){mode=s.mode='paused';clearInput();$('pausebox').hidden=false;$('status').textContent='PAUSED'}
    else if(mode==='paused'){mode=s.mode='playing';$('pausebox').hidden=true;$('status').textContent='PLAYING'}
  }
  function finish(){
    mode=s.mode='over';clearInput();$('pause').disabled=true;$('status').textContent='GAME OVER';
    if(s.score>best){best=s.score;try{localStorage.setItem(KEY,best)}catch{}}
    $('best').textContent=best;$('overlabel').textContent='BOX FULL / YOUR RESULT';$('overtitle').textContent=`${s.score} POINTS`;
    $('overtext').textContent=`最大到達：${M.STAGES[s.maxStage].name}。もう一度、音楽を重ねよう！`;
    $('start').textContent='PLAY AGAIN ↗';$('overlay').style.display='flex';tone(140);
  }
  function hud(){
    $('score').textContent=String(s.score).padStart(4,'0');$('time').textContent=mode==='ready'?'—':M.STAGES[s.next].name;
    $('combo').textContent=mode==='over'?`MAX: ${M.STAGES[s.maxStage].name}`:s.overT>0?'あふれそう！':'DROP & MERGE';
  }
  function toWorld(e){fitCanvas();const r=c.getBoundingClientRect();return ((e.clientX-r.left)/r.width*c.width-OX)/S}
  c.addEventListener('pointerdown',e=>{
    if(mode!=='playing' || held!==null)return;
    e.preventDefault();held=e.pointerId;c.setPointerCapture(e.pointerId);setCursor(toWorld(e));
  });
  c.addEventListener('pointermove',e=>{if(mode==='playing' && (e.pointerId===held || e.pointerType==='mouse'))setCursor(toWorld(e))});
  c.addEventListener('pointerup',e=>{
    if(held!==e.pointerId)return;e.preventDefault();held=null;
    if(mode==='playing'){setCursor(toWorld(e));drop()}
  });
  const cancel=e=>{if(held===e.pointerId)held=null};
  c.addEventListener('pointercancel',cancel);c.addEventListener('lostpointercapture',cancel);
  window.addEventListener('keydown',e=>{
    if(document.body.classList.contains('intro-active'))return;
    if(!['ArrowLeft','ArrowRight','ArrowDown',' ','Escape'].includes(e.key))return;
    if(e.key===' ' && e.target?.closest?.('button,a'))return;
    e.preventDefault();
    if(e.key==='ArrowLeft'||e.key==='ArrowRight'){if(mode==='playing')keys[e.key]=true;return}
    if(e.repeat)return;
    if(e.key==='Escape')pause();else if(mode==='ready'||mode==='over')start();else drop();
  });
  window.addEventListener('keyup',e=>{delete keys[e.key]});
  window.addEventListener('blur',()=>{clearInput();if(mode==='playing')pause()});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){clearInput();if(mode==='playing')pause()}});
  $('start').onclick=()=>{start();$('start').blur()};$('pause').onclick=pause;$('resume').onclick=pause;
  $('sound').onclick=()=>{sound=!sound;$('sound').textContent=sound?'SOUND ON':'♪ SOUND OFF';$('sound').setAttribute('aria-pressed',String(sound));tone(700)};
  const ICONS=[
    ['...kkkk.','...k..kk','...k....','...k....','...k....','.kkk....','kkkk....','.kk.....'],
    ['.k....k.','kk.kk.kk','...kk...','........','..kkkk..','.kkkkkk.','.kkkkkk.','..k..k..'],
    ['........','...kk...','k.kkkk..','kkkkkkwk','kkkkkkkk','k.kkkk..','...kk...','........'],
    ['..kkkk..','.k...kk.','kkk.k..k','k..kk..k','k..kk..k','k.k..kkk','.kk...k.','..kkkk..'],
    ['k......k','kk....kk','kkkkkkkk','k.k..k.k','k......k','kp.kk.pk','.k....k.','..kkkk..'],
    ['.kk..kk.','kkkkkkkk','kkkkkkkk','kkkkkkkk','.kkkkkk.','..kkkk..','...kk...','........'],
    ['...kk...','...kk...','kkkkkkkk','.kkkkkk.','..kkkk..','.kkkkkk.','.kk..kk.','k......k'],
    ['..kkkk..','.k....k.','k..kk..k','k.k..k.k','k.k..k.k','k..kk..k','.k....k.','..kkkk..']
  ];
  const INK=['#6b4b12','#b4386f','#1f6f8f','#5b3fa0','#2b1b30','#fff2f8','#8a5a00','#ffb6d9'];
  function ball(st,x,y,r=M.STAGES[st].r){
    P.disc(g,x,y,r,M.STAGES[st].color,'#2b1b30',Math.max(3,Math.round(r/7)));
    P.mapC(g,ICONS[st],{k:INK[st],p:'#ff8fc4',w:'#fff8fb'},x,y,Math.max(2,r/6.2));
  }
  function draw(){
    fitCanvas();g.setTransform(1,0,0,1,0,0);g.fillStyle='#24152a';g.fillRect(0,0,c.width,c.height);
    g.setTransform(S,0,0,S,OX,OY);g.save();g.beginPath();g.rect(0,0,600,600);g.clip();
    g.fillStyle='#fde9f3';g.fillRect(0,0,600,600);g.fillStyle='#f6d3e6';
    for(let y=0;y<600;y+=24)for(let x=(y/24%2)*24;x<600;x+=48)g.fillRect(x,y,24,24);
    g.fillStyle='#fff8fb';g.fillRect(M.L,M.TOPLINE,M.RT-M.L,M.BOTTOM-M.TOPLINE);
    g.fillStyle='#5a4466';g.fillRect(M.L-14,M.TOPLINE,14,M.BOTTOM-M.TOPLINE+14);
    g.fillRect(M.RT,M.TOPLINE,14,M.BOTTOM-M.TOPLINE+14);g.fillRect(M.L,M.BOTTOM,M.RT-M.L,14);
    g.fillStyle=s.overT>0&&Math.floor(s.t*8)%2?'#ff4f8f':'#ffb6d9';
    for(let x=M.L;x<M.RT;x+=20)g.fillRect(x,M.TOPLINE-2,12,4);
    P.text(g,'CHAIN',62,30,18);P.text(g,'NEXT',531,30,18);ball(s.next,531,78,24);
    for(let st=0;st<M.STAGES.length;st++){
      g.globalAlpha=st<=s.maxStage?1:.35;ball(st,62,74+st*63,21);
      P.text(g,String(st+1),98,74+st*63,14);
    }
    g.globalAlpha=1;
    const x=M.clampX(s,s.cursor);
    g.fillStyle='#efc0da';for(let y=M.DROP_Y+M.STAGES[s.current].r+8;y<M.BOTTOM;y+=18)g.fillRect(x-1,y,3,8);
    for(const it of s.items)ball(it.st,it.x,it.y);
    if(mode!=='over'){g.globalAlpha=s.cool>0?.45:1;ball(s.current,x,M.DROP_Y);g.globalAlpha=1}
    for(const p of fx){g.globalAlpha=Math.max(0,p.life);P.text(g,p.text,p.x,p.y,25,'#b4386f')}
    g.globalAlpha=1;g.restore();
  }
  function frame(ts){
    const dt=Math.max(0,Math.min(.04,(ts-last)/1000||0));last=ts;
    if(mode==='playing'){
      setCursor(s.cursor+((keys.ArrowRight?1:0)-(keys.ArrowLeft?1:0))*360*dt);
      for(const ev of M.step(s,dt)){
        if(ev.type==='merge'||ev.type==='bonus'){
          fx.push({x:ev.x,y:ev.y,life:1,text:`+${ev.type==='bonus'?100:M.points(ev.stage)}`});tone(ev.type==='bonus'?1000:500+ev.stage*70);
        }
      }
      if(s.mode==='over')finish();
    }
    for(const p of fx){p.y-=35*dt;p.life-=dt}fx=fx.filter(p=>p.life>0);
    hud();draw();requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
