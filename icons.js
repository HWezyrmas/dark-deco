/* Pixel-art skill icons, drawn once at startup into 32x32 canvases and exported as data URLs. */
(()=>{
'use strict';
const S=32;
const P={ink:'#140c22',white:'#ffffff',cream:'#fff1c4',gold:'#f2cf7a',goldD:'#b8862e',cyan:'#4ff0ff',cyanD:'#1e8fa8',steel:'#c9d6f0',steelD:'#6a7aa8',amber:'#ffc861',amberD:'#c97a1e',pink:'#ff8fd0',pinkD:'#b4458f',violet:'#c9a0ff',violetD:'#6a47b0',lime:'#d8ff6a',limeD:'#6fa820',red:'#ff4a6a',redD:'#9a1a3a',green:'#7dff9a',greenD:'#2a9a52',orange:'#ff9a3c',blue:'#6fb0ff',blueD:'#2a4fa8',brown:'#8a6a3a'};
function mk(){const c=document.createElement('canvas');c.width=c.height=S;return c}
function api(g){
  const px=(x,y,w=1,h=1,c)=>{g.fillStyle=c;g.fillRect(Math.round(x),Math.round(y),w,h)};
  const circ=(cx,cy,r,c)=>{g.fillStyle=c;for(let dy=-r;dy<=r;dy++){const w=Math.floor(Math.sqrt(r*r-dy*dy+r*.5));g.fillRect(cx-w,cy+dy,w*2+1,1)}};
  const ring=(cx,cy,r,c,t=1)=>{for(let a=0;a<360;a+=3){const rad=a*Math.PI/180;for(let k=0;k<t;k++)px(cx+Math.cos(rad)*(r-k),cy+Math.sin(rad)*(r-k),1,1,c)}};
  const arc=(cx,cy,r,a0,a1,c,t=1)=>{for(let a=a0;a<=a1;a+=2){const rad=a*Math.PI/180;for(let k=0;k<t;k++)px(cx+Math.cos(rad)*(r-k),cy+Math.sin(rad)*(r-k),1,1,c)}};
  const line=(x0,y0,x1,y1,c,t=1)=>{const n=Math.max(Math.abs(x1-x0),Math.abs(y1-y0))||1;for(let i=0;i<=n;i++){const x=x0+(x1-x0)*i/n,y=y0+(y1-y0)*i/n;px(x-(t>>1),y-(t>>1),t,t,c)}};
  const tri=(pts,c)=>{g.fillStyle=c;g.beginPath();g.moveTo(pts[0],pts[1]);for(let i=2;i<pts.length;i+=2)g.lineTo(pts[i],pts[i+1]);g.closePath();g.fill()};
  return{px,circ,ring,arc,line,tri}}
function outline(c){const o=mk(),g=o.getContext('2d');const t=mk(),tg=t.getContext('2d');tg.drawImage(c,0,0);tg.globalCompositeOperation='source-in';tg.fillStyle=P.ink;tg.fillRect(0,0,S,S);
  for(const [a,b] of [[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[1,1],[-1,1],[1,-1]])g.drawImage(t,a,b);g.drawImage(c,0,0);return o}
const D={
  cleave(d){d.line(8,25,23,8,P.steel,3);d.line(9,25,23,9,P.white,1);d.line(6,21,12,27,P.gold,2);d.px(5,26,3,3,P.goldD);d.arc(16,18,13,200,320,P.cyan,2)},
  whirl(d){d.arc(16,16,12,0,250,P.blue,3);d.tri([27,8,30,17,21,15],P.blue);d.arc(16,16,6,180,430,P.cyan,2);d.circ(16,16,2,P.white)},
  slam(d){d.circ(16,12,7,P.steel);d.px(10,6,12,3,P.steelD);d.px(12,17,8,4,P.steel);for(const [a,b] of [[16,22],[10,25],[22,25]])d.line(16,22,a+(a-16)*.5,b+4,P.cyan,1);d.line(16,22,16,30,P.cyan,1);d.line(16,24,6,29,P.cyan,1);d.line(16,24,26,29,P.cyan,1)},
  shield(d){d.circ(16,16,12,P.gold);d.circ(16,16,10,P.blueD);d.ring(16,16,6,P.cyan,2);d.circ(16,16,2,P.gold);for(let i=0;i<8;i++){const a=i*Math.PI/4;d.px(16+Math.cos(a)*8.5,16+Math.sin(a)*8.5,1,1,P.goldD)}},
  riposte(d){d.line(6,26,25,7,P.steel,2);d.line(26,26,7,7,P.steel,2);d.px(4,24,5,2,P.gold);d.px(23,24,5,2,P.gold);d.ring(16,16,13,P.white,1)},
  beam(d){d.line(4,24,28,8,P.amber,5);d.line(4,24,28,8,P.cream,2);d.px(3,21,7,8,P.brown);d.px(4,22,5,6,P.amber);d.px(5,23,3,4,P.white);d.circ(28,8,3,P.white)},
  prism(d){d.tri([16,4,28,26,4,26],P.violet);d.tri([16,9,24,24,8,24],'#e6d6ff');d.line(2,14,12,16,P.cream,1);d.line(20,17,30,10,P.red,1);d.line(20,19,30,19,P.lime,1);d.line(20,21,30,28,P.blue,1)},
  lighthouse(d){d.tri([12,28,20,28,18,10,14,10],P.cream);d.px(13,17,6,2,P.red);d.px(13,23,7,2,P.red);d.px(12,6,8,4,P.goldD);d.px(14,7,4,2,P.white);d.tri([16,8,2,2,2,13],'rgba(255,224,138,.8)');d.tri([16,8,30,2,30,13],'rgba(255,224,138,.8)')},
  flies(d){for(const [x,y] of [[9,10],[22,8],[15,22],[25,21]]){d.circ(x,y,3,P.lime);d.px(x-1,y-1,2,2,P.white);d.px(x-3,y-3,2,1,'#eaffd0');d.px(x+2,y-3,2,1,'#eaffd0')}d.arc(16,16,12,0,360,P.limeD,1)},
  moths(d){d.tri([16,12,4,5,6,18],P.pink);d.tri([16,12,28,5,26,18],P.pink);d.tri([16,15,7,24,13,27],P.pinkD);d.tri([16,15,25,24,19,27],P.pinkD);d.px(15,8,2,18,P.white);d.px(13,6,1,3,P.white);d.px(18,6,1,3,P.white);d.circ(9,10,1,P.white);d.circ(23,10,1,P.white)},
  chain(d){d.tri([19,2,8,17,15,17,11,30,25,12,17,12,22,2],'#fff07a');d.tri([18,5,11,15,16,15],P.white);for(const [x,y] of [[5,7],[27,22],[6,26]])d.circ(x,y,1,'#fff07a')},
  mirror(d){d.arc(16,22,13,180,360,P.cyan,2);d.px(4,22,25,2,P.cyanD);d.line(28,4,18,14,P.red,2);d.line(18,14,26,20,P.cyan,2);d.circ(18,14,2,P.white)},
  longwatch(d){d.arc(16,20,12,180,360,P.cyan,2);d.px(4,20,25,2,P.cyanD);d.px(11,6,10,2,P.gold);d.px(11,15,10,2,P.gold);d.tri([12,8,20,8,16,12],P.cream);d.tri([16,12,12,15,20,15],P.cream)},
  firebash(d){d.circ(18,14,7,P.steel);d.ring(18,14,7,P.gold);for(let i=0;i<4;i++)d.tri([2+i*3,30,6+i*3,18-i*2,9+i*3,30],i%2?P.orange:P.red);d.line(4,14,10,14,P.white,1);d.line(3,18,9,18,P.white,1)},
  quickbash(d){d.circ(18,16,8,P.steel);d.ring(18,16,8,P.gold);for(const y of [9,14,19,24])d.line(2,y,9,y,P.cyan,1);d.ring(18,16,4,P.cyan)},
  dawn(d){d.circ(16,20,8,P.amber);d.px(4,20,25,10,'rgba(0,0,0,0)');for(let i=0;i<7;i++){const a=Math.PI+i*Math.PI/6;d.line(16+Math.cos(a)*10,20+Math.sin(a)*10,16+Math.cos(a)*14,20+Math.sin(a)*14,P.gold,1)}d.px(3,20,26,2,P.goldD);d.tri([16,23,12,29,20,29],P.green);d.px(15,25,2,6,P.green)},
  brightflare(d){d.line(3,16,29,16,P.cream,7);d.line(3,16,29,16,P.white,3);d.px(3,10,3,13,P.amber);d.tri([29,9,32,16,29,23],P.amber)},
  twinstep(d){for(const [x,y] of [[8,20],[20,9]]){d.circ(x,y,4,P.amber);d.px(x-2,y+3,4,3,P.amber);d.px(x-1,y-1,2,2,P.white)}d.circ(25,25,3,P.green);d.px(24,22,2,6,P.white);d.px(22,24,6,2,P.white)},
  quickstep(d){d.px(14,8,8,14,P.violetD);d.px(14,20,12,5,P.violetD);d.px(15,9,4,12,P.violet);for(const y of [10,15,20])d.line(2,y,10,y,P.amber,1);d.circ(26,8,2,P.white)},
  hp(d){d.circ(11,13,6,P.red);d.circ(21,13,6,P.red);d.tri([5,15,27,15,16,28],P.red);d.circ(10,11,2,'#ffb0c0');d.px(13,13,6,2,P.white);d.px(15,11,2,6,P.white)},
  dmg(d){d.line(6,26,24,8,P.steel,3);d.line(7,26,24,9,P.white,1);d.px(4,23,6,2,P.gold);d.px(6,26,2,4,P.goldD);d.tri([24,4,30,4,30,10],P.red);d.px(25,8,6,2,P.white)},
  spd(d){d.px(12,10,8,12,P.blueD);d.px(12,19,14,6,P.blueD);d.px(13,11,4,10,P.blue);d.px(12,24,14,2,P.white);for(const y of [12,16,20])d.line(2,y,9,y,P.white,1);d.tri([18,6,24,6,20,12],P.gold)},
  cdr(d){d.circ(16,17,11,P.gold);d.circ(16,17,9,P.cream);d.px(15,10,2,8,P.ink);d.px(16,16,6,2,P.ink);d.px(13,3,6,3,P.goldD);for(let i=0;i<12;i++){const a=i*Math.PI/6;d.px(16+Math.cos(a)*7.5,17+Math.sin(a)*7.5,1,1,P.goldD)}},
  mag(d){d.arc(16,14,9,180,360,P.red,5);d.px(7,14,5,10,P.red);d.px(20,14,5,10,P.red);d.px(7,22,5,3,P.steel);d.px(20,22,5,3,P.steel);for(const [x,y] of [[6,29],[16,28],[26,29]]){d.px(x,y,2,2,'#8a7cff')}},
  litsteel(d){d.line(6,26,24,8,P.steel,3);d.px(4,23,6,2,P.gold);for(let i=0;i<3;i++)d.tri([16+i*4,22-i*4,20+i*4,8-i*4,24+i*4,20-i*4],i%2?P.orange:P.amber);d.circ(26,26,3,P.amber)},
  ward(d){d.arc(16,22,13,180,360,P.cyan,2);d.px(4,22,25,2,P.cyanD);d.px(14,8,4,12,P.green);d.px(10,12,12,4,P.green);d.px(15,9,2,10,P.white);d.px(11,13,10,2,P.white)},
  bond(d){d.circ(9,14,5,P.amber);d.circ(23,14,5,P.cyan);d.line(13,14,19,14,P.gold,2);for(const x of [11,16,21])d.px(x,20,2,2,P.green);d.tri([12,22,20,22,16,28],P.red)},
  g_maxhp(d){d.circ(11,13,6,P.red);d.circ(21,13,6,P.red);d.tri([5,15,27,15,16,28],P.red);d.px(8,11,16,6,P.white);d.px(9,12,14,4,P.red);d.px(10,13,2,2,P.white);d.px(14,13,2,2,P.white);d.px(18,13,4,2,P.white)},
  g_heal(d){d.circ(11,13,6,P.red);d.circ(21,13,6,P.red);d.tri([5,15,27,15,16,28],P.red);d.circ(10,11,2,'#ffb0c0');d.circ(25,6,4,P.green);d.px(24,3,2,7,P.white);d.px(22,5,7,2,P.white)},
  g_power(d){d.circ(16,16,10,P.amber);d.circ(16,16,6,P.cream);for(let i=0;i<8;i++){const a=i*Math.PI/4;d.line(16+Math.cos(a)*11,16+Math.sin(a)*11,16+Math.cos(a)*15,16+Math.sin(a)*15,P.gold,2)}d.circ(16,16,2,P.white)},
  b_pact(d){d.px(6,6,20,22,P.cream);d.px(6,6,20,2,P.goldD);for(const y of [11,15,19])d.px(9,y,14,1,P.steelD);d.circ(20,24,4,P.red);d.px(19,23,2,2,P.white);d.line(4,30,14,22,P.ink,1)},
  b_decline(d){d.circ(16,16,11,P.steelD);d.circ(16,16,9,'#2a2440');d.line(10,10,22,22,P.red,3);d.line(22,10,10,22,P.red,3)},
};
const out={};
for(const [k,fn] of Object.entries(D)){const c=mk(),g=c.getContext('2d');fn(api(g));out[k]=outline(c).toDataURL()}
window.DD_ICONS=out;
})();
