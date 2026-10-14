'use strict';
(function(root){
  function map(g, rows, pal, x, y, px){
    rows.forEach((row,j)=>Array.from(row).forEach((ch,i)=>{
      if(ch==='.' || !pal[ch]) return;
      g.fillStyle=pal[ch];
      g.fillRect(Math.round(x+i*px),Math.round(y+j*px),Math.ceil(px),Math.ceil(px));
    }));
  }
  function mapC(g, rows, pal, cx, cy, px){map(g,rows,pal,cx-rows[0].length*px/2,cy-rows.length*px/2,px)}
  function disc(g,cx,cy,r,fill,edge,cell=Math.max(3,Math.round(r/6))){
    if(!(r>0 && cell>0)) return;
    for(let y=-r;y<r;y+=cell) for(let x=-r;x<r;x+=cell){
      const d=Math.hypot(x+cell/2,y+cell/2);
      if(d>r) continue;
      g.fillStyle=d>r-cell*1.1?edge:fill;
      g.fillRect(Math.round(cx+x),Math.round(cy+y),Math.ceil(cell),Math.ceil(cell));
    }
  }
  function text(g,t,x,y,size=20,color='#2b1b30',align='center'){
    g.font=`bold ${size}px "Courier New",monospace`;
    g.fillStyle=color;g.textAlign=align;g.textBaseline='middle';g.fillText(String(t),x,y);
  }
  root.KittyPixel={map,mapC,disc,text};
})(typeof window==='undefined'?globalThis:window);
