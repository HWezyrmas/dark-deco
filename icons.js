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

  guillotine(d){d.line(16,3,16,15,P.brown,2);d.px(14,2,4,2,P.gold);d.tri([5,15,27,15,24,27,8,27],P.steel);d.tri([7,16,25,16,23,21,9,21],P.white);d.px(8,25,16,2,P.cyan);d.line(4,29,28,29,P.cyan,1);d.px(15,17,2,2,P.gold)},
  vortex(d){d.arc(16,17,13,200,520,P.cyan,2);d.arc(16,17,8,0,300,P.blue,2);d.arc(16,17,4,90,400,P.white,1);d.line(25,6,29,10,P.steel,2);d.px(26,4,3,3,P.white);d.line(5,24,9,28,P.steel,2);d.px(3,27,3,3,P.white)},
  grip(d){d.px(8,10,17,13,P.cyan);for(let i=0;i<4;i++)d.circ(10+i*4,10,2,P.steelD);for(let i=0;i<4;i++)d.px(9+i*4,8,3,2,P.white);d.px(5,14,5,6,P.cyan);d.px(6,15,3,3,P.white);d.px(14,23,5,7,P.cyanD);d.line(4,29,28,29,P.cyan,1)},
  carnage(d){d.circ(16,16,6,P.red);d.circ(16,16,3,P.white);for(let i=0;i<8;i++){const a=i/8*Math.PI*2;d.line(16+Math.cos(a)*8,16+Math.sin(a)*8,16+Math.cos(a)*14,16+Math.sin(a)*14,i%2?P.red:P.orange,2)}},
  constellation(d){const p=[[6,22],[12,9],[20,14],[26,6],[24,24]];for(let i=0;i<p.length-1;i++)d.line(p[i][0],p[i][1],p[i+1][0],p[i+1][1],P.pinkD,1);d.line(20,14,24,24,P.pinkD,1);for(const [x,y] of p){d.px(x-2,y,5,1,P.pink);d.px(x,y-2,1,5,P.pink);d.px(x,y,1,1,P.white)}},
  aurora(d){const c=[P.green,P.cyan,P.violet,P.pink];for(let x=3;x<29;x++){const t=6+Math.round(Math.sin(x*.5)*3);d.px(x,t,1,12+Math.round(Math.sin(x*.3)*3),c[Math.floor(x/7)%4])}d.line(3,28,28,28,P.cyanD,1)},
  rose(d){const c=[P.red,P.amber,P.green,P.cyan,P.violet,P.pink];for(let i=0;i<12;i++){const a0=i/12*Math.PI*2,a1=(i+1)/12*Math.PI*2;d.tri([16,16,16+Math.cos(a0)*12,16+Math.sin(a0)*12,16+Math.cos(a1)*12,16+Math.sin(a1)*12],c[i%6])}d.ring(16,16,12,P.gold,2);d.circ(16,16,3,P.gold);d.px(16,16,1,1,P.white)},
  wisp(d){d.line(4,22,12,16,P.amberD,3);d.line(8,24,16,18,P.amber,2);d.px(14,12,9,6,P.amber);d.px(21,10,5,5,P.cream);d.px(21,7,2,3,P.amber);d.px(24,7,2,3,P.amber);d.px(24,12,1,1,P.ink);d.px(5,20,3,3,P.white);d.px(3,26,2,2,P.pink);d.px(9,28,2,2,P.amber)},
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

  ravager(d){d.ring(16,16,11,P.cyanD,1);d.arc(16,16,11,200,340,P.cyan,2);d.line(9,23,21,11,P.brown,2);d.tri([19,7,27,13,21,17],P.steel);d.line(21,9,26,14,P.white,1);d.circ(16,16,2,P.cyan)},
  blood(d){d.line(8,26,20,10,P.brown,2);d.tri([17,6,27,12,21,17],P.red);d.line(19,8,26,13,'#ffb0c0',1);for(const [x,y] of [[10,12],[7,17],[13,7]])d.circ(x,y,2,P.redD);d.circ(25,25,3,P.red);d.px(24,24,2,2,'#ffb0c0')},
  charge(d){for(let i=0;i<3;i++)d.line(3,12+i*5,12,12+i*5,P.cyanD,1);d.circ(19,14,5,P.cyan);d.px(15,18,9,8,P.cyan);d.px(14,25,3,4,P.cyanD);d.px(21,25,3,4,P.cyanD);d.px(20,12,2,2,P.white);d.tri([24,10,29,7,26,13],P.white)},
  earth(d){d.px(3,22,26,6,P.steelD);for(const [x,h] of [[7,8],[12,12],[17,9],[22,13],[27,7]])d.tri([x-3,22,x,22-h,x+3,22],P.blueD);d.line(4,24,28,24,P.cyan,1);d.line(10,26,16,23,P.cyan,1);d.px(11,9,2,2,P.white);d.px(21,8,2,2,P.white)},
  hook(d){for(let i=0;i<7;i++)d.px(4+i*2.4,26-i*2.4,2,2,i%2?P.steel:P.steelD);d.arc(22,12,6,-60,180,P.gold,2);d.tri([16,12,19,16,14,17],P.gold);d.circ(27,7,2,P.red)},
  banner(d){d.px(9,4,2,26,P.brown);d.px(8,3,4,2,P.gold);d.tri([11,6,27,6,22,13],P.cyanD);d.tri([11,13,27,13,22,6],P.cyanD);d.px(11,6,13,7,P.cyan);d.px(11,6,13,1,P.gold);for(const x of [14,18])d.px(x,8,2,3,P.gold);d.px(6,28,8,2,P.ink)},
  shout(d){d.circ(10,16,6,P.steelD);d.px(13,14,4,4,P.ink);for(let i=0;i<3;i++)d.arc(15,16,6+i*5,-50,50,i===1?P.red:P.white,2)},
  starfall(d){for(const [x,y,s] of [[22,8,4],[11,14,3],[20,22,3]]){d.line(x+3,y-6,x,y,P.cream,1);d.circ(x,y,s-1,P.amber);d.px(x-s,y,s*2+1,1,P.white);d.px(x,y-s,1,s*2+1,P.white)}d.px(4,28,24,2,P.violetD)},
  lanterns(d){for(const [x,y] of [[10,10],[21,16]]){d.px(x-4,y-5,9,11,P.red);d.px(x-3,y-4,7,9,P.pink);d.px(x-1,y-2,3,5,P.cream);d.px(x-4,y-6,9,1,P.gold);d.px(x-4,y+6,9,1,P.gold);d.px(x,y+7,1,3,P.cream)}},
  garden(d){for(const [x,y,c] of [[10,12,P.pink],[21,10,P.amber],[16,21,P.pink]]){for(let i=0;i<5;i++){const a=i/5*Math.PI*2;d.circ(x+Math.cos(a)*3,y+Math.sin(a)*3,1,c)}d.circ(x,y,1,P.gold);d.line(x,y+3,x,y+8,P.greenD,1)}d.px(4,28,24,2,P.greenD)},
  halo(d){d.ring(16,16,12,P.gold,2);d.ring(16,16,7,P.amber,1);d.circ(16,16,3,P.cream);for(let i=0;i<8;i++){const a=i*Math.PI/4;d.px(16+Math.cos(a)*14,16+Math.sin(a)*14,2,2,P.white)}},
  candle(d){d.px(12,12,8,16,P.cream);d.px(18,12,2,16,'#d9c9a8');d.px(10,26,12,3,P.gold);d.tri([16,3,13,10,19,10],P.orange);d.px(15,6,2,4,P.white);d.ring(16,21,13,P.orange,1)},
  kite(d){d.tri([16,3,25,13,16,23],P.amber);d.tri([16,3,7,13,16,23],P.orange);d.line(16,3,16,23,P.pink,1);d.line(7,13,25,13,P.pink,1);for(let i=0;i<4;i++)d.px(13-i*2,25+i,3,1,i%2?P.pink:P.amber)},
  p_might(d){d.px(8,14,16,8,P.red);d.px(6,12,6,12,P.redD);d.px(20,10,6,8,P.red);d.px(22,6,4,6,P.redD);d.px(10,16,10,2,'#ffb0c0')},
  p_haste(d){d.ring(16,17,11,P.blue,2);d.line(16,17,16,9,P.white,2);d.line(16,17,22,20,P.white,1);d.px(14,3,5,3,P.blue);for(let i=0;i<3;i++)d.line(2,12+i*5,6,12+i*5,P.cyan,1)},
  p_reach(d){d.ring(16,16,12,P.violet,1);d.ring(16,16,7,P.violetD,1);for(const [a,b] of [[16,2],[16,30],[2,16],[30,16]])d.line(16,16,a,b,P.violet,1);d.circ(16,16,2,P.white)},
  p_dur(d){d.tri([8,4,24,4,16,16],P.amber);d.tri([8,28,24,28,16,16],P.amberD);d.px(7,3,18,2,P.gold);d.px(7,27,18,2,P.gold);d.px(15,13,2,6,P.cream)},
  p_volley(d){for(let i=0;i<3;i++){const y=8+i*8;d.line(4,y,22,y,P.brown,1);d.tri([22,y-3,28,y,22,y+3],P.orange);d.px(4,y-2,3,5,P.cream)}},
  p_lode(d){d.arc(16,18,10,180,360,P.red,4);d.px(6,18,4,8,P.red);d.px(22,18,4,8,P.blue);d.px(6,24,4,3,P.steel);d.px(22,24,4,3,P.steel);for(const [x,y] of [[16,7],[11,4],[21,4]])d.px(x,y,2,2,P.violet)},
  p_armor(d){d.tri([6,6,26,6,16,28],P.steelD);d.tri([9,8,23,8,16,24],P.steel);d.px(15,8,2,15,P.white);d.px(7,5,18,2,P.gold)},
  p_regen(d){d.circ(16,16,11,P.greenD);d.px(13,8,6,16,P.green);d.px(8,13,16,6,P.green);d.px(14,9,4,14,P.white);d.px(9,14,14,4,P.white)},
  ember(d){d.arc(16,16,11,0,260,P.blue,3);for(const [x,y] of [[24,9],[9,22],[20,24],[11,9]])d.circ(x,y,2,P.orange);d.circ(16,16,3,P.amber);d.px(15,15,2,2,P.white)},
  rod(d){d.circ(16,22,6,P.steelD);d.px(10,26,12,3,P.cyan);d.line(16,2,12,10,P.chain||'#fff07a',2);d.line(12,10,19,12,'#fff07a',2);d.line(19,12,14,20,'#fff07a',2)},
  pax(d){d.line(6,26,18,12,P.brown,2);d.tri([15,8,25,13,19,18],P.steel);for(const [x,y,c] of [[25,22,P.red],[28,16,P.amber],[22,27,P.violet],[12,26,P.green]])d.circ(x,y,1,c)},
  sanct(d){d.px(9,4,2,24,P.brown);d.px(11,6,12,7,P.cyan);d.px(11,6,12,1,P.gold);for(const [x,y] of [[18,22],[24,25],[13,26]]){d.circ(x,y,2,P.pink);d.px(x,y,1,1,P.gold)}d.px(20,16,3,1,P.green);d.px(21,15,1,3,P.green)},
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

/* painted icon sheet overrides the drawn icons */
(()=>{const v='1';const ks='cleave whirl slam shield riposte ravager blood charge earth hook banner shout beam prism lighthouse flies moths chain starfall lanterns garden halo candle kite p_might p_haste p_reach p_dur p_volley p_lode p_armor p_regen ember rod pax sanct litsteel ward bond mirror longwatch firebash quickbash dawn brightflare twinstep quickstep hp dmg spd cdr g_maxhp g_heal g_power b_pact b_decline chest'.split(' ');const o=window.DD_ICONS=window.DD_ICONS||{};for(const k of ks){o[k]='icons/'+k+'.png?v='+v;const im=new Image();im.src=o[k]}o.mag=o.p_lode;})();
