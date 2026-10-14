'use strict';
// ゲームボーイ風ドット描画の共通ヘルパー（KITTY FLAP / KITTY MERGE）
(function(root){
const P={};
// map: 文字列配列。'.' は透明、それ以外は palette の色
P.map=function(g,map,pal,x,y,px){for(let r=0;r<map.length;r++)for(let c=0;c<map[r].length;c++){const k=map[r][c];if(k==='.'||!pal[k])continue;g.fillStyle=pal[k];g.fillRect(Math.round(x+c*px),Math.round(y+r*px),Math.ceil(px),Math.ceil(px))}};
// 中心 (cx,cy) にマップを置く
P.mapC=function(g,map,pal,cx,cy,px){P.map(g,map,pal,cx-map[0].length*px/2,cy-map.length*px/2,px)};
// ドットの円（セル単位で塗る）
P.disc=function(g,cx,cy,r,fill,edge,cell){cell=cell||Math.max(3,Math.round(r/6));const n=Math.ceil(r/cell);for(let i=-n;i<n;i++)for(let j=-n;j<n;j++){const px=(i+.5)*cell,py=(j+.5)*cell,d=Math.hypot(px,py);if(d>r)continue;g.fillStyle=edge&&d>r-cell*1.1?edge:fill;g.fillRect(Math.round(cx+i*cell),Math.round(cy+j*cell),cell,cell)}};
P.text=function(g,t,x,y,size,color,align){g.save();g.font=`bold ${size}px "Courier New",monospace`;g.textAlign=align||'center';g.textBaseline='middle';g.fillStyle=color;g.fillText(t,x,y);g.restore()};
root.KittyPixel=P;
})(typeof window!=='undefined'?window:globalThis);
