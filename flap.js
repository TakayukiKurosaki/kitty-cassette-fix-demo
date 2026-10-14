'use strict';
// KITTY FLAP: タップでふわっと上昇、スピーカータワーのすき間をくぐる30秒ラン。
// 前半はテスト可能な純ロジック（KittyFlapCore）、後半がDOM/描画。
(function(root){
const W=600,H=600,GROUND=560,CAT_X=170,R=17,TOWER=66,GRAV=1450,FLAP_V=-430,SPEED=200,DURATION=30;
function create(rand=Math.random){return {rand,mode:'ready',y:280,vy:0,t:0,score:0,towers:[],spawn:.6,flapT:0,cleared:false}}
function gapSize(s){return Math.max(150,190-s.t*1.3)}
function addTower(s){const gap=gapSize(s),top=110+s.rand()*(GROUND-110-gap-60);s.towers.push({x:W+TOWER,top,gap,passed:false})}
function flap(s){if(s.mode==='ready')s.mode='playing';if(s.mode!=='playing')return false;s.vy=FLAP_V;s.flapT=.18;return true}
// 円と矩形の当たり判定
function circleRect(cx,cy,r,x,y,w,h){const nx=Math.max(x,Math.min(cx,x+w)),ny=Math.max(y,Math.min(cy,y+h));return (cx-nx)**2+(cy-ny)**2<r*r}
function hits(s){if(s.y+R>=GROUND)return true;for(const t of s.towers){if(circleRect(CAT_X,s.y,R-3,t.x,0,TOWER,t.top)||circleRect(CAT_X,s.y,R-3,t.x,t.top+t.gap,TOWER,GROUND-t.top-t.gap))return true}return false}
function step(s,dt){if(s.mode!=='playing')return [];const ev=[];dt=Math.min(.05,Math.max(0,dt));s.t+=dt;s.flapT=Math.max(0,s.flapT-dt);s.vy=Math.min(620,s.vy+GRAV*dt);s.y+=s.vy*dt;if(s.y-R<0){s.y=R;s.vy=Math.max(0,s.vy)}
 s.spawn-=dt;if(s.spawn<=0&&s.t<DURATION-1.2){addTower(s);s.spawn=Math.max(1.05,1.5-s.t*.012)}
 const sp=SPEED+s.t*3;for(const t of s.towers){t.x-=sp*dt;if(!t.passed&&t.x+TOWER<CAT_X-R){t.passed=true;s.score++;ev.push('pass')}}s.towers=s.towers.filter(t=>t.x>-TOWER-10);
 if(hits(s)){s.mode='over';s.y=Math.min(s.y,GROUND-R);ev.push('hit')}else if(s.t>=DURATION){s.mode='over';s.cleared=true;s.score+=5;ev.push('clear')}
 return ev}
root.KittyFlapCore={W,H,GROUND,CAT_X,R,TOWER,DURATION,create,flap,step,hits,circleRect,addTower,gapSize};
})(typeof window!=='undefined'?window:globalThis);

(function(){
if(typeof document==='undefined')return;const $=id=>document.getElementById(id),c=$('game');if(!c||!document.body.classList.contains('flap-mode'))return;
const F=window.KittyFlapCore,PX=window.KittyPixel,g=c.getContext('2d');
let s=F.create(),best=0,last=0,sound=false,audio,overAt=0,S=1,OX=0,OY=0,parts=[];
try{const v=Number(localStorage.getItem('kitty-flap-best'));best=Number.isFinite(v)&&v>=0?Math.floor(v):0}catch{}$('best').textContent=best;
function tone(f,d=.08){if(!sound)return;try{audio??=new(window.AudioContext||window.webkitAudioContext)();audio.resume();const o=audio.createOscillator(),v=audio.createGain();o.type='square';o.frequency.value=f;o.connect(v);v.connect(audio.destination);v.gain.setValueAtTime(.03,audio.currentTime);v.gain.exponentialRampToValueAtTime(.001,audio.currentTime+d);o.start();o.stop(audio.currentTime+d)}catch{}}
function fit(){const v=$('viewport'),dpr=Math.min(2,window.devicePixelRatio||1),cw=v.clientWidth,ch=v.clientHeight;if(!(cw>0&&ch>0))return;const pw=Math.round(cw*dpr),ph=Math.round(ch*dpr);if(c.width!==pw||c.height!==ph){c.width=pw;c.height=ph}S=Math.min(pw/F.W,ph/F.H);OX=(pw-F.W*S)/2;OY=(ph-F.H*S)/2}
function hud(){$('score').textContent=String(s.score).padStart(4,'0');$('time').textContent=Math.max(0,F.DURATION-s.t).toFixed(1);$('combo').textContent=s.mode==='ready'?'TAP TO FLAP':s.mode==='playing'?'FLY HIGH!':s.cleared?'ENCORE!':'OOPS!'}
function start(){s=F.create();s.mode='playing';s.vy=F.create().vy;F.flap(s);parts=[];$('overlay').style.display='none';$('pausebox').hidden=true;$('pause').disabled=false;$('status').textContent='PLAYING';hud();tone(660);window.__flap=s}
function finish(){$('status').textContent=s.cleared?'CLEAR':'GAME OVER';$('pause').disabled=true;overAt=performance.now();if(s.score>best){best=s.score;try{localStorage.setItem('kitty-flap-best',best)}catch{}}$('best').textContent=best;
 $('overlabel').textContent=s.cleared?'30 SEC CLEAR / ENCORE +5':'GAME OVER / YOUR RESULT';$('overtitle').innerHTML=`${s.score} GATES`;$('overtext').innerHTML=s.cleared?'30秒とびきった！<br>アンコールでもう一回。':'タワーにぶつかっちゃった。<br>タップでもう一回！';$('start').innerHTML='PLAY AGAIN <span>↗</span>';$('overlay').style.display='flex';tone(s.cleared?990:150,.25)}
function pause(){if(s.mode==='playing'){s.mode='paused';$('status').textContent='PAUSED';$('pausebox').hidden=false}else if(s.mode==='paused'){s.mode='playing';$('status').textContent='PLAYING';$('pausebox').hidden=true}}
function press(){if(s.mode==='over'){if(performance.now()-overAt>450)start();return}if(s.mode==='ready'){start();return}if(F.flap(s)){tone(520,.05);for(let i=0;i<4;i++)parts.push({x:F.CAT_X-10,y:s.y+12,vx:-60-Math.random()*60,vy:30+Math.random()*50,l:.5})}}
c.addEventListener('pointerdown',e=>{e.preventDefault();press()});
$('overlay').addEventListener('pointerdown',e=>{if(e.target.closest('button'))return;e.preventDefault();press()});
window.addEventListener('keydown',e=>{if([' ','ArrowUp','Escape','w'].includes(e.key)){e.preventDefault();if(e.repeat)return;if(e.key==='Escape')pause();else if(s.mode!=='paused')press()}});
window.addEventListener('blur',()=>{if(s.mode==='playing')pause()});document.addEventListener('visibilitychange',()=>{if(document.hidden&&s.mode==='playing')pause()});
$('start').onclick=start;$('pause').onclick=pause;$('resume').onclick=pause;$('sound').onclick=()=>{sound=!sound;$('sound').textContent=sound?'SOUND ON':'SOUND OFF';$('sound').setAttribute('aria-pressed',sound);tone(700)};
const CAT=['..k......k..','.kpk....kpk.','.kwwkkkkwwk.','kwwwwwwwwwwk','kwkwwwwwwkwk','kwwwwppwwwwk','kpwwwwwwwwpk','.kwwwkkwwwk.','..kkwwwwkk..','....kkkk....'],CATPAL={k:'#2b1b30',w:'#fff8fb',p:'#ff8fc4'};
const WING=['.ww.','wwww','.ww.'],NOTE=['..kk','..kk','..k.','..k.','kkk.','kkk.'];
function tower(t,y0,h,up){const x=t.x,body='#5a4466',face='#8b6f99';g.fillStyle=body;g.fillRect(x,y0,F.TOWER,h);g.fillStyle=face;for(let yy=up?y0+h-70:y0+10;up?yy>y0:yy<y0+h;yy+=up?-78:78){g.fillRect(x+8,yy,F.TOWER-16,60);PX.disc(g,x+F.TOWER/2,yy+22,15,'#2b1b30','#ffb6d9',3);PX.disc(g,x+F.TOWER/2,yy+48,7,'#2b1b30','#ffe58a',3)}g.fillStyle='#ffb6d9';g.fillRect(x-6,up?y0+h-12:y0,F.TOWER+12,12)}
function draw(){fit();g.setTransform(1,0,0,1,0,0);g.fillStyle='#24152a';g.fillRect(0,0,c.width,c.height);g.setTransform(S,0,0,S,OX,OY);g.imageSmoothingEnabled=false;g.save();g.beginPath();g.rect(0,0,F.W,F.H);g.clip();
 g.fillStyle='#fde9f3';g.fillRect(0,0,F.W,F.H);g.fillStyle='#f6d3e6';for(let i=0;i<12;i++){const x=((i*97-s.t*40)%700+700)%700-50;PX.map(g,NOTE,{k:'#efc0da'},x,60+(i*53)%260,5)}
 for(const t of s.towers){tower(t,0,t.top,true);tower(t,t.top+t.gap,F.GROUND-t.top-t.gap,false)}
 g.fillStyle='#8fd0b4';g.fillRect(0,F.GROUND,F.W,F.H-F.GROUND);g.fillStyle='#6db394';for(let x=-(s.t*230%24);x<F.W;x+=24)g.fillRect(x,F.GROUND,12,6);
 for(const p of parts){g.globalAlpha=Math.max(0,p.l*2);g.fillStyle='#ff8fc4';g.fillRect(p.x,p.y,5,5)}g.globalAlpha=1;
 g.save();g.translate(F.CAT_X,s.y);g.rotate(Math.max(-.45,Math.min(.6,s.vy/900)));PX.mapC(g,CAT,CATPAL,0,0,4.2);PX.map(g,WING,{w:'#ffd4ea'},-26,s.flapT>0?-14:-2,5);PX.map(g,WING,{w:'#ffd4ea'},12,s.flapT>0?-14:-2,5);g.restore();
 if(s.mode==='playing')PX.text(g,String(s.score),F.W/2,70,48,'#5a4466');
 g.restore()}
function frame(ts){const dt=Math.min(.04,(ts-last)/1000||0);last=ts;if(s.mode==='playing'){const ev=F.step(s,dt);if(ev.includes('pass'))tone(880,.05);if(s.mode==='over')finish()}for(const p of parts){p.x+=p.vx*dt;p.y+=p.vy*dt;p.l-=dt}parts=parts.filter(p=>p.l>0);hud();draw();requestAnimationFrame(frame)}
window.__flap=s;window.__flapApi={state:()=>window.__flap,press};
requestAnimationFrame(frame);
})();
