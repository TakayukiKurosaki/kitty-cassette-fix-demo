// Original vector artwork, rendered on canvas without external image dependencies.
export function drawCreature(c,name,x,y,scale=3,flip=1,flash=false,time=0){
 c.save();c.translate(x,y);c.scale(flip*scale/3,scale/3);c.lineJoin='round';c.lineCap='round';
 const oval=(x,y,rx,ry,fill,stroke)=>{c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=1.4;c.stroke()}};
 const path=(pts,fill,stroke)=>{c.beginPath();pts(c);c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=1.5;c.stroke()}};
 const ink='#423448';
 if(name==='cat'){
  c.strokeStyle='#e9b9cb';c.lineWidth=6;c.beginPath();c.moveTo(8,11);c.bezierCurveTo(25,15,26,-2,18,2);c.stroke();
  oval(-7,15,6,4,'#f1d7d6',ink);oval(7,15,6,4,'#f1d7d6',ink);oval(0,7,11,11,flash?'#fff':'#ffbdd4',ink);oval(0,8,6,7,'#fff4e6');
  path(g=>{g.moveTo(-14,0);g.quadraticCurveTo(-19,-9,-15,-24);g.lineTo(-4,-16);g.quadraticCurveTo(0,-18,5,-16);g.lineTo(16,-24);g.quadraticCurveTo(20,-8,15,1);g.quadraticCurveTo(13,13,0,12);g.quadraticCurveTo(-13,12,-14,0)},flash?'#fff':'#fff5e7',ink);
  path(g=>{g.moveTo(-13,-19);g.lineTo(-11,-9);g.lineTo(-6,-14)},'#f5a6c5');path(g=>{g.moveTo(14,-19);g.lineTo(12,-9);g.lineTo(7,-14)},'#f5a6c5');
  oval(-6,-2,2.4,3.8,ink);oval(7,-2,2.4,3.8,ink);oval(-5.4,-3.5,.7,1,'#fff');oval(7.6,-3.5,.7,1,'#fff');oval(-11,4,3.5,1.7,'#f4b2c9');oval(12,4,3.5,1.7,'#f4b2c9');
  path(g=>{g.moveTo(-2,3);g.lineTo(2,3);g.lineTo(0,5)},'#bd6b8e');c.beginPath();c.moveTo(-4,6);c.quadraticCurveTo(-1,8,0,5);c.quadraticCurveTo(2,8,5,6);c.strokeStyle=ink;c.lineWidth=1;c.stroke();
  oval(0,15,2.3,2.3,'#e9b456',ink);
 }else if(name==='bat'){
  const wing=Math.sin(time*12)*4;
  path(g=>{g.moveTo(-4,0);g.quadraticCurveTo(-15,-17-wing,-25,-8-wing);g.lineTo(-21,4);g.quadraticCurveTo(-12,-2,-8,9);g.closePath()},'#9985c8',ink);
  path(g=>{g.moveTo(4,0);g.quadraticCurveTo(15,-17-wing,25,-8-wing);g.lineTo(21,4);g.quadraticCurveTo(12,-2,8,9);g.closePath()},'#9985c8',ink);oval(0,0,9,12,flash?'#fff':'#c5b8e4',ink);oval(-3,-2,2,3,'#463449');oval(4,-2,2,3,'#463449');
 }else if(name==='tank'){
  oval(0,13,19,5,'#12252477');oval(-10,11,7,5,'#819c6d',ink);oval(11,11,7,5,'#819c6d',ink);oval(0,-1,19,17,flash?'#fff':'#abc88c',ink);oval(-5,-7,10,5,'#d2e3ad');oval(-7,1,3,4,ink);oval(7,1,3,4,ink);c.strokeStyle=ink;c.lineWidth=2;c.beginPath();c.moveTo(-5,9);c.lineTo(5,9);c.stroke();
 }else{
  const boss=name==='boss',fill=boss?'#bd789e':'#a694cc';
  oval(0,15,15,4,'#12252466');path(g=>{g.moveTo(-14,12);g.bezierCurveTo(-21,-20,19,-25,16,11);g.lineTo(10,7);g.lineTo(5,13);g.lineTo(0,9);g.lineTo(-7,14);g.lineTo(-10,10);g.closePath()},flash?'#fff':fill,ink);
  oval(-5,-7,7,4,boss?'#e4a9cb':'#d2c6ed');oval(-5,-1,3,4,'#fff6e7');oval(7,-1,3,4,'#fff6e7');oval(-4,0,1.5,2,ink);oval(6,0,1.5,2,ink);oval(1,6,3,2.5,ink);
  if(boss)path(g=>{g.moveTo(-13,-16);g.lineTo(-16,-28);g.lineTo(-5,-23);g.lineTo(0,-32);g.lineTo(5,-23);g.lineTo(16,-28);g.lineTo(13,-16);g.closePath()},'#edd184',ink);
 }
 c.restore();
}
export function drawGarden(c,w,h,camX,camY){
 c.fillStyle='#24413f';c.fillRect(0,0,w,h);const size=88;
 for(let yy=Math.floor(camY/size)-1;yy<Math.ceil((camY+h)/size)+1;yy++)for(let xx=Math.floor(camX/size)-1;xx<Math.ceil((camX+w)/size)+1;xx++){
  const seed=Math.abs((xx*374761+yy*668265)^((xx+yy)*31)),x=xx*size-camX,y=yy*size-camY;
  c.fillStyle=seed%2?'#294944':'#2a4842';c.beginPath();c.ellipse(x+43,y+40,30+seed%14,16+seed%9,seed%4,0,7);c.fill();
  for(let k=0;k<3;k++){const gx=x+(seed*(k+3)%77),gy=y+(seed*(k+7)%71);c.strokeStyle=k===1?'#537566':'#3c6254';c.lineWidth=1.2;c.beginPath();c.moveTo(gx-3,gy-2);c.quadraticCurveTo(gx,gy,gx,gy+6);c.quadraticCurveTo(gx+1,gy,gx+4,gy-4);c.stroke()}
  if(seed%11===0){c.fillStyle='#19312f55';c.beginPath();c.ellipse(x+35,y+52,15,7,0,0,7);c.fill();c.fillStyle='#728278';c.beginPath();c.ellipse(x+32,y+47,12,8,-.25,0,7);c.fill();c.fillStyle='#8c9c8b';c.beginPath();c.ellipse(x+29,y+44,7,3,-.25,0,7);c.fill()}
  if(seed%7===0){for(let i=0;i<5;i++){const a=i*Math.PI*2/5;c.fillStyle='#d9a8b7';c.beginPath();c.ellipse(x+65+Math.cos(a)*3,y+20+Math.sin(a)*3,2.5,2.5,0,0,7);c.fill()}c.fillStyle='#f4dda0';c.beginPath();c.arc(x+65,y+20,1.8,0,7);c.fill()}
 }
}
