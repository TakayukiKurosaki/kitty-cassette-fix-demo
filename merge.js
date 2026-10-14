'use strict';
// KITTY MERGE: 箱に落として、同じもの同士がくっつくと次の段階へ。あふれたらゲームオーバー。
// 前半はテスト可能な純ロジック＋自作の円物理（KittyMergeCore）、後半がDOM/描画。
(function(root){
const W=600,H=600,L=130,RT=470,BOTTOM=566,TOPLINE=150,DROP_Y=104,GRAV=1500;
// 段階チェーン（オリジナル）: 音符→肉球→おさかな→毛糸玉→ねこ顔→ハート→星→レコード
const STAGES=[{id:'note',name:'おんぷ',r:16,color:'#ffe58a'},{id:'paw',name:'にくきゅう',r:22,color:'#ffc4dd'},{id:'fish',name:'おさかな',r:29,color:'#a9dcf0'},{id:'yarn',name:'けいとだま',r:37,color:'#c9b6f2'},{id:'cat',name:'ねこ',r:46,color:'#fff4e2'},{id:'heart',name:'ハート',r:56,color:'#ff8fc4'},{id:'star',name:'スター',r:67,color:'#ffd65a'},{id:'record',name:'レコード',r:79,color:'#4a3a52'}];
const MAX=STAGES.length-1,DROPPABLE=4;
function points(stage){return (stage+1)*(stage+2)/2}
function create(rand=Math.random){const s={rand,mode:'playing',items:[],t:0,score:0,cursor:W/2,cool:0,overT:0,merges:0,maxStage:0,nextId:1};s.current=pick(s);s.next=pick(s);return s}
function pick(s){return Math.floor(s.rand()*DROPPABLE)}
function clampX(s,x,stage=s.current){const r=STAGES[stage].r;return Math.max(L+r,Math.min(RT-r,x))}
function add(s,stage,x,y,vy=0){const it={id:s.nextId++,st:stage,r:STAGES[stage].r,x,y,vx:0,vy,age:0};s.items.push(it);return it}
function drop(s){if(s.mode!=='playing'||s.cool>0)return null;const it=add(s,s.current,clampX(s,s.cursor),DROP_Y,80);s.current=s.next;s.next=pick(s);s.cool=.55;return it}
function collide(a,b){const dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy)||.0001,o=a.r+b.r-d;if(o<=0)return false;const nx=dx/d,ny=dy/d,ma=a.r*a.r,mb=b.r*b.r,ia=mb/(ma+mb),ib=ma/(ma+mb);
 a.x-=nx*o*ia;a.y-=ny*o*ia;b.x+=nx*o*ib;b.y+=ny*o*ib;const rv=(b.vx-a.vx)*nx+(b.vy-a.vy)*ny;if(rv<0){const j=-(1.15)*rv;a.vx-=j*nx*ia;a.vy-=j*ny*ia;b.vx+=j*nx*ib;b.vy+=j*ny*ib}return true}
function walls(it){if(it.x-it.r<L){it.x=L+it.r;if(it.vx<0)it.vx*=-.2}if(it.x+it.r>RT){it.x=RT-it.r;if(it.vx>0)it.vx*=-.2}if(it.y+it.r>BOTTOM){it.y=BOTTOM-it.r;if(it.vy>0)it.vy*=-.15;it.vx*=.96}}
// 同じ段階の2つが触れたら、中点に次の段階を1つ生成（最終段階同士は消えてボーナス）
function merges(s,ev){const gone=new Set();for(let i=0;i<s.items.length;i++){const a=s.items[i];if(gone.has(a.id))continue;for(let j=i+1;j<s.items.length;j++){const b=s.items[j];if(gone.has(b.id)||a.st!==b.st)continue;if(Math.hypot(a.x-b.x,a.y-b.y)<=a.r+b.r+1.5){gone.add(a.id);gone.add(b.id);const st=a.st;if(st<MAX){const n=add(s,st+1,(a.x+b.x)/2,(a.y+b.y)/2,-80);n.age=1;s.maxStage=Math.max(s.maxStage,st+1);s.score+=points(st+1);ev.push({type:'merge',stage:st+1,x:n.x,y:n.y})}else{s.score+=100;ev.push({type:'bonus',x:(a.x+b.x)/2,y:(a.y+b.y)/2})}s.merges++;break}}}if(gone.size)s.items=s.items.filter(it=>!gone.has(it.id))}
function step(s,dt){const ev=[];if(s.mode!=='playing')return ev;dt=Math.min(.033,Math.max(0,dt));s.t+=dt;s.cool=Math.max(0,s.cool-dt);const sub=3,h=dt/sub;
 for(let k=0;k<sub;k++){for(const it of s.items){it.vy+=GRAV*h;it.vx*=.999;it.x+=it.vx*h;it.y+=it.vy*h;it.age+=h}for(let n=0;n<4;n++){for(let i=0;i<s.items.length;i++)for(let j=i+1;j<s.items.length;j++)collide(s.items[i],s.items[j]);for(const it of s.items)walls(it)}merges(s,ev)}
 const high=s.items.some(it=>it.age>1.2&&it.y-it.r<TOPLINE&&Math.abs(it.vy)<120);s.overT=high?s.overT+dt:0;if(s.overT>1.4){s.mode='over';ev.push({type:'over'})}return ev}
root.KittyMergeCore={W,H,L,RT,BOTTOM,TOPLINE,DROP_Y,STAGES,MAX,create,drop,step,add,collide,merges,points,clampX};
})(typeof window!=='undefined'?window:globalThis);

(function(){
if(typeof document==='undefined')return;const $=id=>document.getElementById(id),c=$('game');if(!c||!document.body.classList.contains('merge-mode'))return;
const M=window.KittyMergeCore,PX=window.KittyPixel,g=c.getContext('2d');
let s=null,best=0,last=0,sound=false,audio,S=1,OX=0,OY=0,fx=[],keys={};
try{const v=Number(localStorage.getItem('kitty-merge-best'));best=Number.isFinite(v)&&v>=0?Math.floor(v):0}catch{}$('best').textContent=best;
function tone(f,d=.08){if(!sound)return;try{audio??=new(window.AudioContext||window.webkitAudioContext)();audio.resume();const o=audio.createOscillator(),v=audio.createGain();o.type='square';o.frequency.value=f;o.connect(v);v.connect(audio.destination);v.gain.setValueAtTime(.03,audio.currentTime);v.gain.exponentialRampToValueAtTime(.001,audio.currentTime+d);o.start();o.stop(audio.currentTime+d)}catch{}}
function fit(){const v=$('viewport'),dpr=Math.min(2,window.devicePixelRatio||1),cw=v.clientWidth,ch=v.clientHeight;if(!(cw>0&&ch>0))return;const pw=Math.round(cw*dpr),ph=Math.round(ch*dpr);if(c.width!==pw||c.height!==ph){c.width=pw;c.height=ph}S=Math.min(pw/M.W,ph/M.H);OX=(pw-M.W*S)/2;OY=(ph-M.H*S)/2}
function hud(){$('score').textContent=String(s?s.score:0).padStart(4,'0');$('time').textContent=s?M.STAGES[s.next].name:'—';$('combo').textContent=!s?'DROP & MERGE':s.overT>0?'あふれそう！':'MAX: '+M.STAGES[s.maxStage].name}
function start(){s=M.create();fx=[];$('overlay').style.display='none';$('pausebox').hidden=true;$('pause').disabled=false;$('status').textContent='PLAYING';hud();tone(660);window.__merge=s}
function finish(){$('status').textContent='GAME OVER';$('pause').disabled=true;if(s.score>best){best=s.score;try{localStorage.setItem('kitty-merge-best',best)}catch{}}$('best').textContent=best;$('overlabel').textContent='BOX FULL / YOUR RESULT';$('overtitle').innerHTML=`${s.score} POINTS`;$('overtext').innerHTML=`いちばん大きいのは「${M.STAGES[s.maxStage].name}」。<br>もう一回、レコードを目指そう！`;$('start').innerHTML='PLAY AGAIN <span>↗</span>';$('overlay').style.display='flex';tone(150,.3)}
function pause(){if(!s)return;if(s.mode==='playing'){s.mode='paused';$('status').textContent='PAUSED';$('pausebox').hidden=false}else if(s.mode==='paused'){s.mode='playing';$('status').textContent='PLAYING';$('pausebox').hidden=true}}
function toWorld(e){const r=c.getBoundingClientRect();return ((e.clientX-r.left)/r.width*c.width-OX)/S}
let held=false;
c.addEventListener('pointerdown',e=>{e.preventDefault();if(!s||s.mode!=='playing')return;held=true;c.setPointerCapture(e.pointerId);s.cursor=toWorld(e)});
c.addEventListener('pointermove',e=>{if(s&&s.mode==='playing'&&(held||e.pointerType==='mouse'))s.cursor=toWorld(e)});
c.addEventListener('pointerup',e=>{if(!s||!held)return;held=false;s.cursor=toWorld(e);if(M.drop(s))tone(420,.05)});
window.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight',' ','ArrowDown','Escape'].includes(e.key)){e.preventDefault();keys[e.key]=true;if(e.repeat)return;if(e.key==='Escape')pause();else if((e.key===' '||e.key==='ArrowDown')&&s&&s.mode==='playing'){if(M.drop(s))tone(420,.05)}else if(e.key===' '&&(!s||s.mode==='over'))start()}});
window.addEventListener('keyup',e=>keys[e.key]=false);window.addEventListener('blur',()=>{keys={};if(s&&s.mode==='playing')pause()});document.addEventListener('visibilitychange',()=>{if(document.hidden&&s&&s.mode==='playing')pause()});
$('start').onclick=start;$('pause').onclick=pause;$('resume').onclick=pause;$('sound').onclick=()=>{sound=!sound;$('sound').textContent=sound?'SOUND ON':'SOUND OFF';$('sound').setAttribute('aria-pressed',sound);tone(700)};
const K='#2b1b30',ICONS={note:['...kk...','...k.k..','...k..k.','...k....','.kkk....','kkkk....','.kk.....','........'],paw:['.k....k.','kk.kk.kk','...kk...','........','..kkkk..','.kkkkkk.','.kkkkkk.','..k..k..'],fish:['........','..kkk..k','.kkkkkkk','kk.kkkk.','kkkkkkk.','.kkkkkkk','..kkk..k','........'],yarn:['..kkkk..','.k.k..k.','k.k..k.k','kk..k..k','k..k..kk','k.k..k.k','.k..k.k.','..kkkk.k'],cat:['k......k','kk....kk','kkkkkkkk','k.kkkk.k','kkkkkkkk','kk.kk.kk','.kkkkkk.','..kkkk..'],heart:['........','.kk..kk.','kkkkkkkk','kkkkkkkk','.kkkkkk.','..kkkk..','...kk...','........'],star:['...kk...','...kk...','kkkkkkkk','.kkkkkk.','..kkkk..','.kkkkkk.','.kk..kk.','k......k'],record:['..kkkk..','.k....k.','k..kk..k','k.k..k.k','k.k..k.k','k..kk..k','.k....k.','..kkkk..']};
const INK={note:'#6b4b12',paw:'#b4386f',fish:'#1f6f8f',yarn:'#5b3fa0',cat:K,heart:'#fff2f8',star:'#8a5a00',record:'#ffb6d9'};
function item(it,alpha=1){const st=M.STAGES[it.st];g.globalAlpha=alpha;PX.disc(g,it.x,it.y,it.r,st.color,'#2b1b30',Math.max(3,Math.round(it.r/7)));const px=Math.max(2,it.r/6.2);PX.mapC(g,ICONS[st.id],{k:INK[st.id]},it.x,it.y,px);if(st.id==='cat'){g.fillStyle='#ff8fc4';g.fillRect(it.x-it.r*.55,it.y+it.r*.1,px*1.5,px);g.fillRect(it.x+it.r*.55-px*1.5,it.y+it.r*.1,px*1.5,px)}g.globalAlpha=1}
function draw(){fit();g.setTransform(1,0,0,1,0,0);g.fillStyle='#24152a';g.fillRect(0,0,c.width,c.height);g.setTransform(S,0,0,S,OX,OY);g.imageSmoothingEnabled=false;g.save();g.beginPath();g.rect(0,0,M.W,M.H);g.clip();
 g.fillStyle='#fde9f3';g.fillRect(0,0,M.W,M.H);g.fillStyle='#f6d3e6';for(let y=0;y<M.H;y+=24)for(let x=(y/24%2)*12;x<M.W;x+=24)g.fillRect(x,y,4,4);
 // 箱
 g.fillStyle='#fff8fb';g.fillRect(M.L,M.TOPLINE-30,M.RT-M.L,M.BOTTOM-M.TOPLINE+30);g.fillStyle='#5a4466';g.fillRect(M.L-14,M.TOPLINE-30,14,M.BOTTOM-M.TOPLINE+44);g.fillRect(M.RT,M.TOPLINE-30,14,M.BOTTOM-M.TOPLINE+44);g.fillRect(M.L-14,M.BOTTOM,M.RT-M.L+28,14);
 const warn=s&&s.overT>0;g.fillStyle=warn?(Math.floor(performance.now()/150)%2?'#ff4f8f':'#ffb6d9'):'#ffb6d9';for(let x=M.L;x<M.RT;x+=16)g.fillRect(x,M.TOPLINE-2,9,4);
 if(s){if(s.mode==='playing'){const x=M.clampX(s,s.cursor);g.fillStyle='#e8c9da';for(let y=M.DROP_Y+20;y<M.BOTTOM;y+=14)g.fillRect(x-1,y,3,7);item({x,y:M.DROP_Y,st:s.current,r:M.STAGES[s.current].r},s.cool>0?.45:1)}
  for(const it of s.items)item(it);
  PX.text(g,'NEXT',540,40,14,'#5a4466');item({x:540,y:84,st:s.next,r:M.STAGES[s.next].r});
  PX.text(g,'CHAIN',62,40,14,'#5a4466');M.STAGES.forEach((st,i)=>item({x:62,y:70+i*36,st:i,r:13},i<=s.maxStage?1:.3))}
 for(const f of fx){g.globalAlpha=Math.max(0,f.l);PX.text(g,f.t,f.x,f.y,22,'#b4386f');g.globalAlpha=1}
 g.restore()}
function frame(ts){const dt=Math.min(.033,(ts-last)/1000||0);last=ts;if(s&&s.mode==='playing'){if(keys.ArrowLeft)s.cursor=M.clampX(s,s.cursor)-360*dt;if(keys.ArrowRight)s.cursor=M.clampX(s,s.cursor)+360*dt;for(const e of M.step(s,dt)){if(e.type==='merge'){fx.push({t:'+'+M.points(e.stage),x:e.x,y:e.y,l:1});tone(500+e.stage*90,.09)}if(e.type==='bonus')fx.push({t:'+100!',x:e.x,y:e.y,l:1.4})}if(s.mode==='over')finish()}for(const f of fx){f.y-=40*dt;f.l-=dt}fx=fx.filter(f=>f.l>0);hud();draw();requestAnimationFrame(frame)}
window.__mergeApi={state:()=>s,start,drop:()=>s&&M.drop(s),setCursor:x=>{if(s)s.cursor=x}};
hud();requestAnimationFrame(frame);
})();
