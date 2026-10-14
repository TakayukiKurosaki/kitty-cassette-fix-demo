'use strict';
// Design: docs/20261014_155205_flap_merge_design.md, PART B.
// Rendering revision: docs/20261014_merge_realistic_render_design.md (2026-10-14).
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
    const it={id:s.nextId++,st:stage,r:STAGES[stage].r,x,y,vx:0,vy,age:0,angle:0,spin:0};s.items.push(it);return it;
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
    // Render-only rolling: never feeds back into linear physics.
    for(const it of s.items){
      const target=it.y+it.r>=BOTTOM-.5?it.vx/it.r:it.x-it.r<=L+.5?-it.vy/it.r:it.x+it.r>=RT-.5?it.vy/it.r:it.spin*.985;
      it.spin+=(target-it.spin)*.25;
      if(!Number.isFinite(it.spin))it.spin=0;
      it.angle+=it.spin*dt;
      if(it.angle>Math.PI)it.angle-=2*Math.PI;else if(it.angle<-Math.PI)it.angle+=2*Math.PI;
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
  const M=window.KittyMergeCore,g=c.getContext('2d'),$=id=>document.getElementById(id),KEY='kitty-merge-best';
  let s=M.create(),mode='ready',S=1,OX=0,OY=0,last=0,best=0,keys={},held=null,fx=[],sound=false,audio;
  const FIXED=1/120,MAX_STEPS=6,DPR_CAP=3,RETRY_LOCK=.45,TAU=Math.PI*2,MAX_PARTICLES=160;
  let acc=0,clock=0,alpha=0,previewX=300,animT=0,overAt=-1e9;
  let spritesDirty=true,containerDirty=true,containerBack=null,containerFront=null,shadowSprite=null,assetScale=0,pcursor=0;
  const sprites=new Map(),prevPos=new Map(),prevVy=new Map(),popAnim=new Map(),squash=new Map();
  const pool=Array.from({length:MAX_PARTICLES},()=>({active:false,x:0,y:0,vx:0,vy:0,life:0,max:1,size:3,col:'#fff'}));
  // The core starts playing by contract; the page waits for its START input.
  s.mode='ready';
  try{const v=Number(localStorage.getItem(KEY));best=Number.isFinite(v)&&v>=0?Math.floor(v):0}catch{}
  $('best').textContent=best;
  window.__mergeApi={state:()=>s,start,drop,setCursor};
  function fitCanvas(){
    const v=$('viewport'),dpr=Math.min(DPR_CAP,window.devicePixelRatio||1);
    if(!(v.clientWidth>0 && v.clientHeight>0))return;
    const pw=Math.round(v.clientWidth*dpr),ph=Math.round(v.clientHeight*dpr);
    if(c.width!==pw || c.height!==ph){c.width=pw;c.height=ph;spritesDirty=containerDirty=true}
    S=Math.min(pw/600,ph/600);OX=(pw-600*S)/2;OY=(ph-600*S)/2;
    if(!assetScale || Math.abs(S/assetScale-1)>.01)spritesDirty=containerDirty=true;
    g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';
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
    acc=alpha=0;previewX=s.cursor;prevPos.clear();prevVy.clear();popAnim.clear();squash.clear();
    for(const p of pool)p.active=false;
    $('overlay').style.display='none';$('pausebox').hidden=true;$('pause').disabled=false;$('status').textContent='PLAYING';$('start').blur();hud();tone(600);
  }
  function setCursor(x){if(Number.isFinite(x))s.cursor=M.clampX(s,x);return s.cursor}
  function drop(){if(mode!=='playing')return null;const it=M.drop(s);if(it)tone(340);return it}
  function pause(){
    if(mode==='playing'){mode=s.mode='paused';clearInput();$('pausebox').hidden=false;$('status').textContent='PAUSED'}
    else if(mode==='paused'){mode=s.mode='playing';$('pausebox').hidden=true;$('status').textContent='PLAYING'}
  }
  function finish(){
    overAt=clock;acc=0;prevPos.clear();
    mode=s.mode='over';clearInput();$('pause').disabled=true;$('status').textContent='GAME OVER';
    if(s.score>best){best=s.score;try{localStorage.setItem(KEY,best)}catch{}}
    $('best').textContent=best;$('overlabel').textContent='BOX FULL / YOUR RESULT';$('overtitle').textContent=`${s.score} POINTS`;
    $('overtext').textContent=`最大到達：${M.STAGES[s.maxStage].name}。もう一度、音楽を重ねよう！`;
    $('start').textContent='PLAY AGAIN ↗';$('overlay').style.display='flex';tone(140);
  }
  function hud(){
    $('score').textContent=String(s.score).padStart(4,'0');$('time').textContent=(mode==='ready'||mode==='over')?'—':M.STAGES[s.next].name;
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
    if(e.key==='Escape')pause();else if(mode==='ready')start();else if(mode==='over')requestRetry();else drop();
  });
  window.addEventListener('keyup',e=>{delete keys[e.key]});
  window.addEventListener('blur',()=>{clearInput();if(mode==='playing')pause()});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){clearInput();if(mode==='playing')pause()}});
  function requestRetry(){if(clock-overAt>=RETRY_LOCK*1000)start()}
  $('start').onclick=()=>{if(mode==='over')requestRetry();else start();$('start').blur()};$('pause').onclick=pause;$('resume').onclick=pause;
  $('sound').onclick=()=>{sound=!sound;$('sound').textContent=sound?'SOUND ON':'♪ SOUND OFF';$('sound').setAttribute('aria-pressed',String(sound));tone(700)};
  // All lighting and textures are baked here, never in the frame renderer.
  function makeCanvas(w,h){
    if(typeof document.createElement!=='function')return null;
    const cv=document.createElement('canvas');cv.width=Math.max(1,Math.ceil(w));cv.height=Math.max(1,Math.ceil(h));return cv;
  }
  function circle(o,x,y,r,col){o.beginPath();o.arc(x,y,r,0,TAU);if(col)o.fillStyle=col;o.fill()}
  function line(o,x,y,xx,yy,col,w=1){o.strokeStyle=col;o.lineWidth=w;o.beginPath();o.moveTo(x,y);o.lineTo(xx,yy);o.stroke()}
  function radial(o,x,y,r,stops){
    const a=o.createRadialGradient(x,y,0,0,0,r);
    stops.forEach(([at,col])=>a.addColorStop(at,col));return a;
  }
  function linear(o,x,y,xx,yy,stops){
    const a=o.createLinearGradient(x,y,xx,yy);stops.forEach(([at,col])=>a.addColorStop(at,col));return a;
  }
  function ellipse(o,x,y,rx,ry,col,angle=0){o.beginPath();o.ellipse(x,y,rx,ry,angle,0,TAU);o.fillStyle=col;o.fill()}
  function polygon(o,pts,col){
    o.beginPath();pts.forEach(([x,y],i)=>i?o.lineTo(x,y):o.moveTo(x,y));o.closePath();o.fillStyle=col;o.fill();
  }
  function heart(o,x,y,r,col){
    o.beginPath();o.moveTo(x,y+r*.7);o.bezierCurveTo(x-r*1.3,y-r*.1,x-r*.65,y-r*1.2,x,y-r*.5);
    o.bezierCurveTo(x+r*.65,y-r*1.2,x+r*1.3,y-r*.1,x,y+r*.7);o.fillStyle=col;o.fill();
  }
  const MATERIALS=[
    ['#fff6cf','#ffe58a','#e3b94e','#b98a2e',.85,'#fff2bf'],
    ['#ffe3ef','#ffc4dd','#e79ab9','#c97aa0',.35,'#ffd9e9'],
    ['#e3f5fc','#a9dcf0','#6fb6d6','#4f94b8',.8,'#d4eef8'],
    ['#e8dffb','#c9b6f2','#a088d6','#7e64bd',.45,'#ddd0f7'],
    ['#fffaf2','#fff4e2','#ecd4b4','#d2b48c',.4,'#fff7ee'],
    ['#ffc9e2','#ff8fc4','#e85fa0','#c73f82',.9,'#ffb3d6'],
    ['#fff0b0','#ffd65a','#e0a92e','#b8821f',.95,'#ffe9a0'],
    ['#6a5a74','#4a3a52','#2f2838','#211b2a',.6,'#7a6a86']
  ];
  function bakeSprite(st,R){
    const pad=Math.max(6,R*.22),cv=makeCanvas(2*(R+pad)*S,2*(R+pad)*S);
    if(!cv)return null;
    const o=cv.getContext('2d');if(!o)return null;
    o.setTransform(S,0,0,S,cv.width/2,cv.height/2);
    const [hi,base,sh,deep,k,rim]=MATERIALS[st];
    const rg=o.createRadialGradient(-.35*R,-.42*R,.08*R,0,0,R*1.02);
    [[0,hi],[.45,base],[.82,sh],[1,deep]].forEach(([a,b])=>rg.addColorStop(a,b));
    circle(o,0,0,R,rg);
    o.save();o.beginPath();o.arc(0,0,R,0,TAU);o.clip();
    // Normalized motif coordinates make CHAIN, NEXT and physical sprites identical.
    o.scale(R,R);
    if(st===0){
      o.fillStyle=linear(o,-.4,0,.2,0,[[0,'#ffffff00'],[.5,'#ffffff59'],[1,'#ffffff00']]);o.fillRect(-.4,-1,.6,2);
      ellipse(o,-.18,.22,.22,.16,'#7a5a16',-.35);line(o,.02,.2,.02,-.55,'#7a5a16',.10);
      o.beginPath();o.moveTo(.02,-.55);o.quadraticCurveTo(.65,-.35,.22,-.05);o.quadraticCurveTo(.42,-.3,.02,-.3);o.fillStyle='#7a5a16';o.fill();
      circle(o,-.23,.16,.045,'#fff6cf');
    }else if(st===1){
      for(let i=0;i<160;i++)circle(o,Math.random()*2-1,Math.random()*2-1,.012,i%2?'#ffffff0d':'#b478960f');
      o.beginPath();o.moveTo(-.34,.3);o.bezierCurveTo(-.4,.05,-.1,-.22,0,-.18);
      o.bezierCurveTo(.1,-.22,.4,.05,.34,.3);o.bezierCurveTo(.2,.48,-.2,.48,-.34,.3);o.fillStyle='#d46f98';o.fill();
      for(let i=0;i<4;i++){const x=(i-1.5)*.26,y=-.3-Math.sin((i+.5)*Math.PI/4)*.17;
        ellipse(o,x,y,.12,.15,'#d46f98',(i-1.5)*.2);ellipse(o,x-.02,y-.07,.07,.025,'#ffd9e9');}
    }else if(st===2){
      o.lineWidth=.018;
      for(let row=0;row<10;row++)for(let col=0;col<10;col++){
        o.beginPath();o.arc(-1+col*.24+(row%2)*.12,-1+row*.22,.16,0,Math.PI);
        o.strokeStyle=row%2?'#bfe6f4':'#9fd3ea';o.stroke();
        o.beginPath();o.arc(-1+col*.24+(row%2)*.12,-1+row*.22-.018,.16,0,Math.PI);
        o.strokeStyle='#ffffff80';o.lineWidth=.009;o.stroke();o.lineWidth=.018;
      }
      polygon(o,[[-.35,0],[-.8,-.32],[-.8,.32]],'#8fcbe4');
      circle(o,.4,-.1,.14,'#fff');circle(o,.44,-.1,.075,'#1f3f50');circle(o,.42,-.13,.027,'#fff');
      o.beginPath();o.arc(.3,.05,.3,2.2,3.8);o.strokeStyle='#1f3f5066';o.lineWidth=.035;o.stroke();
    }else if(st===3){
      for(let family=0;family<2;family++){o.save();o.rotate(family*1.22);
        for(let i=-3;i<=3;i++)for(const [dx,col,w] of [[0,'#9a83d4',.085],[-.025,'#b7a0ec',.065],[-.045,'#e8dffb',.018]]){
          o.beginPath();o.moveTo(i*.2+dx,-1.1);o.quadraticCurveTo(i*.4+.6+dx,0,i*.2+dx,1.1);o.strokeStyle=col;o.lineWidth=w;o.stroke();
        }o.restore();
      }
    }else if(st===4){
      for(let i=0;i<120;i++){const a=i*TAU/120;line(o,Math.cos(a)*.81,Math.sin(a)*.81,Math.cos(a),Math.sin(a),i%2?'#fff8ec99':'#ecd6ba80',.015)}
      for(const side of [-1,1]){
        polygon(o,[[side*.25,-.6],[side*.76,-.91],[side*.8,-.3]],'#ecd4b4');
        polygon(o,[[side*.4,-.58],[side*.69,-.78],[side*.69,-.37]],'#ffb6d9');
        ellipse(o,side*.32,-.05,.13,.095,'#2b1b30');circle(o,side*.32-.025,-.08,.032,'#fff');
        ellipse(o,side*.53,.24,.16,.075,'#ffc4ddb3');
        for(let j=0;j<3;j++)line(o,side*.5,.12+j*.1,side*.9,.05+j*.18,'#785a5080',.018);
      }
      polygon(o,[[-.09,.13],[.09,.13],[0,.23]],'#d98cae');
      o.beginPath();o.moveTo(-.2,.28);o.quadraticCurveTo(-.1,.43,0,.23);o.quadraticCurveTo(.1,.43,.2,.28);o.strokeStyle='#785a50';o.lineWidth=.025;o.stroke();
    }else if(st===5){
      heart(o,0,.08,.8,'#e85fa0');heart(o,-.025,.015,.75,'#ffd3e8');heart(o,.005,.065,.69,'#ff8fc4');
      heart(o,-.28,-.3,.19,'#ffffffbf');
    }else if(st===6){
      const pts=Array.from({length:10},(_,i)=>{const a=-Math.PI/2+i*Math.PI/5,r=i%2?.35:.78;return [Math.cos(a)*r,Math.sin(a)*r]});
      for(let i=0;i<10;i++)polygon(o,[[0,0],pts[i],pts[(i+1)%10]],i%2?'#e0a92e':'#fff0b0');
      o.beginPath();pts.forEach(([x,y],i)=>i?o.lineTo(x,y):o.moveTo(x,y));o.closePath();o.strokeStyle='#b8821f';o.lineWidth=.025;o.stroke();
      for(let i=0;i<10;i+=2){const [x,y]=pts[i];line(o,x-.08,y,x+.08,y,'#fff',.018);line(o,x,y-.08,x,y+.08,'#fff',.018);circle(o,x,y,.022,'#fff')}
    }else{
      for(let r=.34,i=0;r<.98;r+=.025,i++){o.beginPath();o.arc(0,0,r,0,TAU);o.strokeStyle=i%2?'#14101a8c':'#5a4e6a59';o.lineWidth=.012;o.stroke()}
      for(const a of [-.9,2.3,2.65]){o.beginPath();o.moveTo(0,0);o.arc(0,0,.94,a,a+.12);o.closePath();o.fillStyle='#ffffff2e';o.fill()}
      circle(o,0,0,.3,'#ff8fc4');o.beginPath();o.arc(0,0,.28,0,TAU);o.strokeStyle='#fff2f8';o.lineWidth=.012;o.stroke();
      line(o,-.13,-.12,.12,-.12,'#b4386f',.025);line(o,-.1,.13,.15,.13,'#b4386f',.025);circle(o,0,0,.05,'#2b1b30');
      o.beginPath();o.arc(0,0,.84,-1.3,-.25);o.strokeStyle='#ffffff80';o.lineWidth=.016;o.stroke();
    }
    o.restore();
    // Common specular and rim, clipped to the sphere.
    o.save();o.beginPath();o.arc(0,0,R,0,TAU);o.clip();
    const spec=o.createRadialGradient(-.33*R,-.4*R,0,-.33*R,-.4*R,.3*R);
    spec.addColorStop(0,'rgba(255,255,255,'+k+')');spec.addColorStop(1,'#ffffff00');
    circle(o,-.33*R,-.4*R,.3*R,spec);
    o.beginPath();o.arc(0,0,.94*R,.15*Math.PI,.95*Math.PI);o.strokeStyle=rim;o.globalAlpha=.5;o.lineWidth=.1*R;o.stroke();o.restore();
    o.beginPath();o.lineWidth=Math.max(1.2,R*.04);o.arc(0,0,R-o.lineWidth/2,0,TAU);o.strokeStyle='#2b1b30aa';o.stroke();
    if(st===3)for(let i=0;i<8;i++){const a=i*TAU/8;line(o,Math.cos(a)*R*.96,Math.sin(a)*R*.96,Math.cos(a+.04)*R*1.045,Math.sin(a+.04)*R*1.045,'#d8c8f8',.6)}
    return {canvas:cv,pad,rq:S};
  }
  function bakeContainer(front){
    const cv=makeCanvas(c.width,c.height);if(!cv)return null;
    const o=cv.getContext('2d');if(!o)return null;
    o.setTransform(S,0,0,S,OX,OY);
    const {L,RT,TOPLINE:T,BOTTOM:B}=M;
    if(!front){
      o.fillStyle=linear(o,0,0,0,600,[[0,'#f3dcea'],[1,'#e9c9dd']]);o.fillRect(0,0,600,600);
      o.fillStyle=linear(o,0,T,0,B,[[0,'#b07a46'],[1,'#8a5a30']]);o.fillRect(L,T,RT-L,B-T);
      for(let x=L;x<RT;x+=67){line(o,x,T,x,B,'#6e4522',1.5);line(o,x+2,T,x+2,B,'#c7955c')}
      for(let i=0;i<32;i++){const x=L+5+i*10;o.beginPath();o.moveTo(x,T);o.quadraticCurveTo(x+12,310,x-2,B);o.strokeStyle=i%2?'#50321e1f':'#d2aa781a';o.lineWidth=1;o.stroke()}
      for(const [x,y,w,h,xx,yy] of [[L,T,25,B-T,L+25,T],[RT-25,T,25,B-T,RT-25,T],[L,T,RT-L,28,L,T+28],[L,B-25,RT-L,25,L,B-25]]){
        const sx=x===RT-25?RT:x,sy=y===B-25?B:y;
        o.fillStyle=linear(o,sx,sy,xx,yy,[[0,'#28190f59'],[1,'#28190f00']]);o.fillRect(x,y,w,h);
      }
      for(const [x,y,w,h] of [[L-14,T,14,B-T+14],[RT,T,14,B-T+14],[L,B,RT-L,14]]){
        o.fillStyle='#8a5a30';o.fillRect(x,y,w,h);line(o,x,y,x+w,y,'#d9a86a',3);line(o,x,y,x,y+h,'#d9a86a',2);line(o,x+w,y,x+w,y+h,'#5e3c1f',2);line(o,x,y+h,x+w,y+h,'#5e3c1f',3);
      }
      line(o,L,T-3,RT,T-3,'#f08a6e',1);line(o,L,T-1,RT,T-1,'#e2563b',3);line(o,L,T+1,RT,T+1,'#a8371f',1);
      for(let x=L+8;x<RT;x+=20)line(o,x,T-3,x,T+3,'#a8371f',1);
      for(let y=B+5;y<B+14;y+=4)line(o,L,y,RT,y,'#50321e30');
    }else{
      o.fillStyle=linear(o,0,B,0,B-12,[[0,'#1e120a40'],[1,'#1e120a00']]);o.fillRect(L,B-12,RT-L,12);
      line(o,L,B,RT,B,'#d9a86a',2);
      for(const x of [L,RT])line(o,x,T+3,x,B,'#d9a86a80',2);
      o.fillStyle=radial(o,-100,-100,760,[[0,'#140c1200'],[.55,'#140c1200'],[1,'#140c1226']]);o.fillRect(0,0,600,600);
    }
    return cv;
  }
  function ensureAssets(){
    if(spritesDirty){
      sprites.clear();
      for(let st=0;st<8;st++)for(const r of [M.STAGES[st].r,21,24])sprites.set(st+':'+r,bakeSprite(st,r));
      if(!shadowSprite){shadowSprite=makeCanvas(128,128);if(shadowSprite){const o=shadowSprite.getContext('2d');if(o){o.translate(64,64);circle(o,0,0,64,radial(o,0,0,64,[[0,'#1e12186b'],[1,'#1e121800']]))}else shadowSprite=null}}
      spritesDirty=false;assetScale=S;
    }
    if(containerDirty){containerBack=bakeContainer(false);containerFront=bakeContainer(true);containerDirty=false}
  }
  function ball(st,x,y,r=M.STAGES[st].r,angle=0,sx=1,sy=1){
    const spr=sprites.get(st+':'+r);if(!spr?.canvas)return;
    const half=r+spr.pad;g.save();g.translate(x,y);g.rotate(angle);g.scale(sx,sy);g.drawImage(spr.canvas,-half,-half,half*2,half*2);g.restore();
  }
  function text(str,x,y,size=18,col='#5a354e'){
    g.font='600 '+size+'px system-ui, sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillStyle=col;g.fillText(str,x,y);
  }
  function snapshotPrev(){
    prevPos.clear();prevVy.clear();
    for(const it of s.items){prevPos.set(it.id,{x:it.x,y:it.y,angle:it.angle});prevVy.set(it.id,it.vy)}
  }
  function detectImpacts(){
    for(const it of s.items){const pv=prevVy.get(it.id)??it.vy;
      if(pv>260 && it.vy<=pv*.6){const q=squash.get(it.id);squash.set(it.id,{q:Math.max(q?.q||0,Math.min(.32,pv/2000)),v:0})}
    }
    for(const id of squash.keys())if(!s.items.some(it=>it.id===id))squash.delete(id);
  }
  function spawnParticle(x,y,col,size,vx,vy,life){
    for(let i=0;i<MAX_PARTICLES;i++){const idx=(pcursor+i)%MAX_PARTICLES,p=pool[idx];
      if(!p.active){p.active=true;p.x=x;p.y=y;p.col=col;p.size=size;p.vx=vx;p.vy=vy;p.life=life;p.max=life;pcursor=(idx+1)%MAX_PARTICLES;return}}
  }
  function handleEvents(evs){
    for(const ev of evs){
      if(ev.type!=='merge' && ev.type!=='bonus')continue;
      const bonus=ev.type==='bonus',col=bonus?'#ffd65a':M.STAGES[ev.stage].color;
      fx.push({x:ev.x,y:ev.y,life:1,vy:-38,col,text:'+'+(bonus?100:M.points(ev.stage))});tone(bonus?1000:500+ev.stage*70);
      if(!bonus){let bestItem=null,d=Infinity;for(const it of s.items)if(it.st===ev.stage && !prevPos.has(it.id) && !popAnim.has(it.id)){
        const dd=Math.hypot(it.x-ev.x,it.y-ev.y);if(dd<d){d=dd;bestItem=it}
      }if(bestItem)popAnim.set(bestItem.id,.28)}
      const cnt=Math.min(bonus?24:10+ev.stage*2,28);
      for(let i=0;i<cnt;i++){const a=i/cnt*TAU+Math.random()*.5,sp=120+Math.random()*(bonus?260:180);
        spawnParticle(ev.x,ev.y,i%3?col:'#fff8fb',2+Math.random()*3,Math.cos(a)*sp,Math.sin(a)*sp-80,.5+Math.random()*.4)}
    }
  }
  function updateVisuals(dt){
    // Substep the spring too, so slow frames cannot destabilize its explicit integration.
    for(const q of squash.values()){let left=dt;while(left>0){const h=Math.min(FIXED,left);q.v+=(-520*q.q-2*Math.sqrt(520)*.7*q.v)*h;q.q+=q.v*h;left-=h}
      if(Math.abs(q.q)<.001 && Math.abs(q.v)<.001)q.q=q.v=0;
    }
    for(const [id,t] of popAnim){if(t<=dt || !s.items.some(it=>it.id===id))popAnim.delete(id);else popAnim.set(id,t-dt)}
    for(const p of pool)if(p.active){p.vy+=900*dt;p.vx*=Math.pow(.98,dt*60);p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;if(p.life<=0)p.active=false}
    for(const p of fx){p.y+=p.vy*dt;p.life-=dt*1.1}fx=fx.filter(p=>p.life>0);
  }
  function angleDelta(a,b){let d=(b-a+Math.PI)%TAU-Math.PI;if(d<-Math.PI)d+=TAU;return d}
  function draw(a){
    fitCanvas();ensureAssets();g.setTransform(1,0,0,1,0,0);g.fillStyle='#24152a';g.fillRect(0,0,c.width,c.height);
    if(containerBack)g.drawImage(containerBack,0,0);
    g.setTransform(S,0,0,S,OX,OY);g.save();g.beginPath();g.rect(0,0,600,600);g.clip();
    text('CHAIN',62,30);text('NEXT',531,30);
    if(mode!=='over')ball(s.next,531,78,24);else text('—',531,78,24);
    for(let st=0;st<8;st++){g.globalAlpha=st<=s.maxStage?1:.35;ball(st,62,74+st*63,21);text(String(st+1),98,74+st*63,14)}g.globalAlpha=1;
    if(s.overT>0){g.fillStyle=Math.floor(animT*8)%2?'#ff5a3c':'#ffd0c4';g.globalAlpha=.5;g.fillRect(M.L,M.TOPLINE-4,M.RT-M.L,5);g.globalAlpha=1}
    if(shadowSprite)for(const it of s.items){
      const p=mode==='playing'?prevPos.get(it.id):null,x=p?p.x+(it.x-p.x)*a:it.x,y=p?p.y+(it.y-p.y)*a:it.y;
      g.drawImage(shadowSprite,x-it.r*1.15,y+it.r*.65,it.r*2.3,it.r*.65);
    }
    for(const it of s.items){
      const p=mode==='playing'?prevPos.get(it.id):null,x=p?p.x+(it.x-p.x)*a:it.x,y=p?p.y+(it.y-p.y)*a:it.y,angle=p?p.angle+angleDelta(p.angle,it.angle)*a:it.angle;
      const q=squash.get(it.id)?.q||0,stretch=Math.min(.14,Math.max(0,(it.vy-500)/4000));
      let ps=1;
      if(popAnim.has(it.id)){const t=1-popAnim.get(it.id)/.28,u=t-1;ps=.3+.7*(1+2.70158*u*u*u+1.70158*u*u)}
      ball(it.st,x,y+it.r*q*.5,it.r,angle,(1+q)*(1-stretch)*ps,(1-q)*(1+stretch)*ps);
    }
    if(mode!=='over'){
      const r=M.STAGES[s.current].r;let landingY=M.BOTTOM;
      for(const it of s.items)if(Math.abs(it.x-previewX)<it.r+r)landingY=Math.min(landingY,it.y-it.r);
      const from=M.DROP_Y+r+6;landingY=Math.max(from,landingY);
      g.setLineDash([6,10]);line(g,previewX,from,previewX,landingY,'rgba(226,86,59,0.5)',2);g.setLineDash([]);
      ellipse(g,previewX,landingY,12,3,'#e2563b66');
      g.globalAlpha=s.cool>0?.5:1;ball(s.current,previewX,M.DROP_Y+Math.sin(animT*3)*1.5);g.globalAlpha=1;
      if(s.cool>0){g.beginPath();g.arc(previewX,M.DROP_Y,r+5,-Math.PI/2,-Math.PI/2+TAU*s.cool/.5);g.strokeStyle='#e2563b';g.lineWidth=2;g.stroke()}
    }
    for(const p of pool)if(p.active){g.globalAlpha=Math.max(0,p.life/p.max);circle(g,p.x,p.y,p.size,p.col)}
    for(const p of fx){g.globalAlpha=Math.max(0,p.life);text(p.text,p.x,p.y,25,p.col)}
    g.globalAlpha=1;g.restore();
    g.setTransform(1,0,0,1,0,0);if(containerFront)g.drawImage(containerFront,0,0);
  }
  function frame(ts){
    const dt=Math.max(0,Math.min(.1,(ts-last)/1000||0));last=ts;clock=ts;animT+=dt;
    if(mode==='playing'){
      setCursor(s.cursor+((keys.ArrowRight?1:0)-(keys.ArrowLeft?1:0))*360*dt);
      acc+=dt;let n=0;
      while(acc>=FIXED && n<MAX_STEPS && s.mode==='playing'){
        snapshotPrev();handleEvents(M.step(s,FIXED));detectImpacts();acc-=FIXED;n++;
      }
      if(n===MAX_STEPS)acc=0;alpha=acc/FIXED;
      if(s.mode==='over')finish();
    }else alpha=0;
    previewX+=(M.clampX(s,s.cursor)-previewX)*(1-Math.exp(-dt/.06));
    updateVisuals(dt);hud();draw(alpha);requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
