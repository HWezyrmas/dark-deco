// ===== Dark Deco title screen: layered painted key art, camera push-in, lightning reveal, logo sweep, rain, embers, parallax =====
(function(){
const $=id=>document.getElementById(id),root=$('title'),stage=$('tStage'),back=$('tBack'),front=$('tFront'),mid=$('tMid'),bg=back.getContext('2d'),fg=front.getContext('2d'),mg=mid.getContext('2d');
const L={sky:$('tSky'),fogB:$('tFogB'),towers:$('tTowers'),heroes:$('tHeroes'),fogF:$('tFogF')};
let W=0,H=0,DPR=1,t0=performance.now(),tapped=false,flash=0,bolt=null,par={x:0,y:0},parT={x:0,y:0},drops=[],embers=[],sparks=[],menuK=0,menuT=0,run=true;
const REDUCE=matchMedia('(prefers-reduced-motion: reduce)').matches;
function size(){const r=stage.getBoundingClientRect();W=r.width;H=r.height;DPR=Math.min(2,devicePixelRatio||1);for(const c of [back,front,mid]){c.width=Math.round(W*DPR);c.height=Math.round(H*DPR)}bg.setTransform(DPR,0,0,DPR,0,0);fg.setTransform(DPR,0,0,DPR,0,0);mg.setTransform(DPR,0,0,DPR,0,0)}
addEventListener('resize',size);size();
for(let i=0;i<110;i++)drops.push({x:Math.random(),y:Math.random(),v:.9+Math.random()*.8,l:8+Math.random()*14});
// heroes image is width-fitted and bottom-anchored: the lantern sits at ~ (0.905, 0.43) of the 1024x1536 picture
function lantern(){const hr=L.heroes.getBoundingClientRect(),sr=stage.getBoundingClientRect();const ih=hr.width*1.5;return[hr.left-sr.left+hr.width*.884,hr.bottom-sr.top-ih+ih*.45]}
function ease(k){k=Math.max(0,Math.min(1,k));return 1-Math.pow(1-k,3)}
// branching lightning: a main channel with forks; to = optional strike point (a tower spire)
function mkBranch(x,y,ex,ey,depth,out){const pts=[[x,y]],n=10+((Math.random()*6)|0);for(let i=1;i<=n;i++){const k=i/n,jit=(1-k*.6)*W*.07*(depth?0.6:1);pts.push([x+(ex-x)*k+(Math.random()-.5)*jit,y+(ey-y)*k+(Math.random()-.5)*H*.012])}pts[n]=[ex,ey];out.push({pts,w:depth?.5:1});
  if(depth<2)for(let i=2;i<n-2;i++)if(Math.random()<(depth?.15:.32)){const [px,py]=pts[i],a=Math.atan2(ey-y,ex-x)+(Math.random()<.5?-1:1)*(.5+Math.random()*.6),L=H*(.06+Math.random()*.14)*(depth?.5:1);mkBranch(px,py,px+Math.cos(a)*L,py+Math.sin(a)*L,depth+1,out)}}
function mkStrike(to){const out=[];const ex=to?to[0]:W*(.2+Math.random()*.6),ey=to?to[1]:H*(.45+Math.random()*.15);mkBranch(ex+(Math.random()-.5)*W*.3,-10,ex,ey,0,out);return{segs:out,t:0,to,cx:ex,cy:H*(.08+Math.random()*.2),re:Math.random()<.6?.09:-1}}
function spires(){const r=L.towers.getBoundingClientRect(),sr=stage.getBoundingClientRect();return[[r.left-sr.left+r.width*.145,r.top-sr.top+r.height*.03],[r.left-sr.left+r.width*.855,r.top-sr.top+r.height*.03]]}
function heroGround(){const hr=L.heroes.getBoundingClientRect(),sr=stage.getBoundingClientRect(),ih=hr.width*1.5;return[hr.left-sr.left+hr.width*.5,hr.bottom-sr.top-ih+ih*.79,hr.width/W]}
let strikes=[],arcs=[],bif=null;
function bifrost(){bif={t:0};flash=Math.max(flash,.8);if(window.__ddTitleSfx)window.__ddTitleSfx('bifrost')}
function hsl(h,l,a){return`hsla(${h%360},100%,${l}%,${a})`}
function drawBifrost(g,t){if(!bif)return;bif.t+=1/60;const T2=bif.t,[gx,gy,sc]=heroGround(),dur=2.4;if(T2>dur+2.5){bif=null;return}
  const grow=Math.min(1,T2/.22),fade=T2<dur?1:Math.max(0,1-(T2-dur)/.6),wd=(T2<.3?60:34+Math.sin(T2*22)*3)*sc*(T2<dur?1:Math.max(.05,1-(T2-dur)/.6)),top=-20,bot=top+(gy-top)*grow;g.globalCompositeOperation='lighter';
  if(fade>0){// outer prismatic glow
    const gr=g.createLinearGradient(gx-wd*3,0,gx+wd*3,0);for(let i=0;i<=12;i++){const k=i/12;gr.addColorStop(k,hsl(t*120+k*360,60,(.5-Math.abs(k-.5))*.5*fade))}g.fillStyle=gr;g.fillRect(gx-wd*3,top,wd*6,bot-top);
    // rainbow bands scrolling down the column
    const bh=26;for(let y=top-((T2*900)%bh);y<bot;y+=bh/2){const k=(y-top)/(bot-top+1),h=(y*1.6+t*400)%360,w2=wd*(.85+.15*Math.sin(y*.05+t*9));g.fillStyle=hsl(h,62,.32*fade);g.fillRect(gx-w2,y,w2*2,bh/2+1)}
    // spiral streaks wrapping the beam
    g.lineWidth=2;for(let s2=0;s2<6;s2++){g.strokeStyle=hsl(t*200+s2*60,75,.75*fade);g.beginPath();for(let y=top;y<bot;y+=6){const ph=y*.045-T2*28+s2*1.05,x=gx+Math.sin(ph)*wd*1.05,front=Math.cos(ph)>0;if(!front){g.moveTo(x,y);continue}g.lineTo(x,y)}g.stroke()}
    // white-hot core
    const cg=g.createLinearGradient(gx-wd*.5,0,gx+wd*.5,0);cg.addColorStop(0,'rgba(255,255,255,0)');cg.addColorStop(.5,`rgba(255,255,255,${.95*fade})`);cg.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=cg;g.fillRect(gx-wd*.5,top,wd,bot-top);
    // impact burst
    if(grow>=1){const ir=wd*(3+Math.sin(t*14)*.3),ig=g.createRadialGradient(gx,gy,0,gx,gy,ir);ig.addColorStop(0,`rgba(255,255,255,${.9*fade})`);ig.addColorStop(.4,hsl(t*300,65,.5*fade));ig.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=ig;g.beginPath();g.ellipse(gx,gy,ir*1.6,ir*.45,0,0,7);g.fill()}}
  // Bifrost rune seal burned into the rooftop: concentric rings of rainbow glyph dashes, spinning, lingering after the beam
  if(T2>.22){const k=Math.min(1,(T2-.22)/.4),la=Math.min(1,(dur+2.5-T2)/1.2),R=W*.42*sc*k;g.save();g.translate(gx,gy);g.scale(1,.24);
    for(const [rr,n,dir,lw] of [[1,48,1,3],[.78,36,-1,2],[.56,24,1,2],[.34,12,-1,3]]){for(let i=0;i<n;i++){const a0=i/n*Math.PI*2+dir*T2*.9,a1=a0+(Math.PI*2/n)*(i%3?0.55:0.3);g.strokeStyle=hsl(i/n*360+t*90,68,.85*la);g.lineWidth=lw*4;g.beginPath();g.arc(0,0,R*rr,a0,a1);g.stroke()}}
    g.strokeStyle=`rgba(255,255,255,${.6*la})`;g.lineWidth=5;g.beginPath();g.arc(0,0,R*1.04,0,7);g.stroke();g.restore()}
  // rainbow shards thrown out from the impact
  if(T2>.2&&T2<1.4&&shards.length<160)for(let i=0;i<4;i++){const a=Math.random()*7,s=60+Math.random()*220;shards.push({x:gx,y:gy,vx:Math.cos(a)*s,vy:Math.sin(a)*s*.35-80-Math.random()*120,g:260,l:.8+Math.random()*.8,m:0,h:Math.random()*360})}
  g.globalCompositeOperation='source-over'}
let shards=[];
function mkBolt(){const x=W*(.25+Math.random()*.5);let y=0,px=x;const pts=[[px,0]];while(y<H*.55){y+=H*.04+Math.random()*H*.04;px+=(Math.random()-.5)*W*.12;pts.push([px,y])}return{pts,t:0}}
function frame(now){requestAnimationFrame(frame);if(!document.body.classList.contains('intitle')){run=false;return}run=true;
  {const r=stage.getBoundingClientRect();if(Math.abs(r.width-W)>1||Math.abs(r.height-H)>1)size()}
  const t=(now-t0)/1000,dt=1/60;
  par.x+=(parT.x-par.x)*.06;par.y+=(parT.y-par.y)*.06;
  menuK+=((tapped&&!(bif&&bif.t<1.6)?1:0)-menuK)*.05;
  // camera push-in: each layer settles from a bigger scale; deeper layers move less with parallax
  const push=REDUCE?1:ease(t/9),hk=REDUCE?1:ease((t-.5)/3.5),mk=menuK;
  const set=(el,s,dx,dy)=>{el.style.transform=`translate3d(${dx}px,${dy}px,0) scale(${s})`};
  set(L.sky,1.22-.16*push,par.x*-6,par.y*-4-mk*H*.03);
  set(L.fogB,1,par.x*-10,par.y*-6-mk*H*.05);
  set(L.towers,1.42-.32*push,par.x*-16,par.y*-8+(1-push)*H*.06-mk*H*.08);
  set(L.heroes,(1.12-.12*hk)*(1-.15*mk),par.x*-26,par.y*-12+(1-hk)*H*.14-mk*H*.21);
  set(L.fogF,1,par.x*-34,par.y*-14);
  // lightning reveal at 2.3s, then now and then
  if(!REDUCE&&((t>2.3&&!root.dataset.lit)||(t>7&&Math.random()<.004))){const first=!root.dataset.lit;root.dataset.lit=1;flash=1;const sp=spires(),hitSpire=!first&&Math.random()<.45,to=hitSpire?sp[(Math.random()*2)|0]:null;strikes.push(mkStrike(to));if(!first&&Math.random()<.3)strikes.push(mkStrike(null));
    if(to)for(let i=0;i<5;i++)arcs.push({x:to[0],y:to[1],t:-i*.05,l:.7+Math.random()*.6});if(tapped&&window.__ddTitleSfx)window.__ddTitleSfx('thunder')}
  else if(!REDUCE&&t>5&&Math.random()<.006){const [sx,sy]=[W*(.1+Math.random()*.8),H*(.05+Math.random()*.25)];strikes.push({segs:[],t:0,cx:sx,cy:sy,sheet:1});flash=Math.max(flash,.25)}
  flash=Math.max(0,flash-dt*2.2);if(!REDUCE&&tapped&&!bif&&Math.random()<.0009)bifrost();
  const heroLight=t<2.3?.18+.12*ease(t/2.3):1;L.heroes.style.filter=`brightness(${(heroLight+flash*.9).toFixed(3)}) saturate(${(.7+.3*Math.min(1,heroLight)).toFixed(2)})`;
  L.towers.style.filter=`brightness(${(.55+.45*push+flash*.6+(Math.random()<.03?-.15:0)).toFixed(3)})`;
  $('tFlash').style.opacity=(flash*.55).toFixed(3);
  // back canvas: searchlights and the bolt (behind towers)
  bg.clearRect(0,0,W,H);bg.globalCompositeOperation='lighter';
  for(const [ox,sp,ph] of [[.18,.35,0],[.82,.28,2]]){const a=-Math.PI/2+Math.sin(t*sp+ph)*.45,x0=W*ox,y0=H*.78-mk*H*.05,len=H*1.1;const g=bg.createLinearGradient(x0,y0,x0+Math.cos(a)*len,y0+Math.sin(a)*len);g.addColorStop(0,'rgba(255,226,170,.16)');g.addColorStop(1,'rgba(255,226,170,0)');bg.fillStyle=g;bg.beginPath();bg.moveTo(x0,y0);bg.lineTo(x0+Math.cos(a-.07)*len,y0+Math.sin(a-.07)*len);bg.lineTo(x0+Math.cos(a+.07)*len,y0+Math.sin(a+.07)*len);bg.closePath();bg.fill()}
  // cloud glow behind each strike (sheet lightning), then the forked bolts with a re-strike flicker
  bg.globalCompositeOperation='lighter';
  for(const s of strikes){s.t+=dt;const a=Math.max(0,1-s.t/(s.sheet?.5:.55))*(s.sheet?.6:1)*(s.t<.04||(s.re>0&&s.t>s.re&&s.t<s.re+.05)?1:s.t<.12?.45:.8);if(a<=0)continue;
    const cr=W*(s.sheet?.35:.45),cg=bg.createRadialGradient(s.cx,s.cy,0,s.cx,s.cy,cr);cg.addColorStop(0,`rgba(220,200,255,${.55*a})`);cg.addColorStop(1,'rgba(120,80,255,0)');bg.fillStyle=cg;bg.fillRect(s.cx-cr,s.cy-cr,cr*2,cr*2);
    for(const sg of s.segs)for(const [w,c] of [[10*sg.w,`rgba(150,110,255,${a*.35})`],[4*sg.w,`rgba(205,185,255,${a*.7})`],[1.6*sg.w,`rgba(255,255,255,${a})`]]){bg.strokeStyle=c;bg.lineWidth=w;bg.lineJoin='round';bg.beginPath();sg.pts.forEach((p,i)=>i?bg.lineTo(p[0],p[1]):bg.moveTo(p[0],p[1]));bg.stroke()}}
  strikes=strikes.filter(s=>s.t<.6);bg.globalCompositeOperation='source-over';
  bg.globalCompositeOperation='source-over';
  mg.clearRect(0,0,W,H);mg.globalCompositeOperation='lighter';
  for(const a of arcs){a.t+=dt;if(a.t<0||a.t>a.l)continue;const k=1-a.t/a.l;let x=a.x,y=a.y;mg.strokeStyle=`rgba(200,180,255,${k})`;mg.lineWidth=1.5;mg.beginPath();mg.moveTo(x,y);for(let i=0;i<7;i++){x+=(Math.random()-.5)*16;y+=4+Math.random()*10;mg.lineTo(x,y)}mg.stroke();const sg=mg.createRadialGradient(a.x,a.y,0,a.x,a.y,24);sg.addColorStop(0,`rgba(230,215,255,${.8*k})`);sg.addColorStop(1,'rgba(120,80,255,0)');mg.fillStyle=sg;mg.fillRect(a.x-24,a.y-24,48,48)}
  arcs=arcs.filter(a=>a.t<a.l);mg.globalCompositeOperation='source-over';
  drawBifrost(mg,t);
  // front canvas: rain, lantern embers, tap sparks
  fg.clearRect(0,0,W,H);fg.strokeStyle='rgba(190,200,255,.22)';fg.lineWidth=1;fg.beginPath();
  for(const d of drops){d.y+=d.v*dt*1.1;d.x-=dt*.08;if(d.y>1.05){d.y=-.05;d.x=Math.random()*1.1}if(d.x<-.05)d.x+=1.1;const x=d.x*W,y=d.y*H;fg.moveTo(x,y);fg.lineTo(x-d.l*.25,y+d.l)}fg.stroke();
  const [lx,ly]=lantern();if(t>1.2&&embers.length<70&&Math.random()<.5)embers.push({x:lx+(Math.random()-.5)*10,y:ly+(Math.random()-.5)*8,vx:(Math.random()-.5)*14-6,vy:-18-Math.random()*26,l:1.6+Math.random()*1.6,m:0});
  fg.globalCompositeOperation='lighter';
  for(const e of [...embers,...sparks]){e.m+=dt;e.x+=e.vx*dt;e.y+=e.vy*dt;e.vx+=Math.sin(t*3+e.y*.05)*dt*10;if(e.g)e.vy+=e.g*dt;const a=Math.max(0,1-e.m/e.l),r=e.r||1.6;fg.fillStyle=`rgba(${e.c||'255,190,90'},${a})`;fg.beginPath();fg.arc(e.x,e.y,r*(.6+a*.6),0,7);fg.fill()}
  for(const e of shards){e.m+=dt;e.x+=e.vx*dt;e.y+=e.vy*dt;e.vy+=e.g*dt;const a=Math.max(0,1-e.m/e.l);fg.fillStyle=`hsla(${(e.h+t*200)%360},100%,70%,${a})`;fg.save();fg.translate(e.x,e.y);fg.rotate(e.m*12);fg.fillRect(-3,-1,6,2);fg.restore()}
  shards=shards.filter(e=>e.m<e.l);
  embers=embers.filter(e=>e.m<e.l);sparks=sparks.filter(e=>e.m<e.l);
  const gl=fg.createRadialGradient(lx,ly,0,lx,ly,70);gl.addColorStop(0,`rgba(255,190,100,${(.22+.06*Math.sin(t*7)).toFixed(3)})`);gl.addColorStop(1,'rgba(255,190,100,0)');fg.fillStyle=gl;fg.fillRect(lx-70,ly-70,140,140);
  fg.globalCompositeOperation='source-over'}
requestAnimationFrame(frame);
// interaction: drag / mouse / tilt parallax, tap for sparks, first tap opens the menu
function pt(e){const r=stage.getBoundingClientRect();return[(e.clientX-r.left)/r.width*2-1,(e.clientY-r.top)/r.height*2-1]}
addEventListener('pointermove',e=>{if(!run)return;const [x,y]=pt(e);parT.x=Math.max(-1,Math.min(1,x));parT.y=Math.max(-1,Math.min(1,y))},{passive:true});
function tilt(e){if(!run||e.gamma==null)return;parT.x=Math.max(-1,Math.min(1,e.gamma/25));parT.y=Math.max(-1,Math.min(1,(e.beta-45)/25))}
function burst(x,y,c){for(let i=0;i<26;i++){const a=Math.random()*7,s=40+Math.random()*120;sparks.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-30,g:140,l:.5+Math.random()*.6,m:0,r:1.3+Math.random()*1.4,c})}}
root.addEventListener('pointerdown',e=>{const r=stage.getBoundingClientRect();if(tapped&&window.__ddTitleSfx)window.__ddTitleSfx('spark');burst(e.clientX-r.left,e.clientY-r.top,Math.random()<.5?'255,200,120':'140,230,255');
  if(!tapped){tapped=true;document.body.classList.add('titled');if(window.__ddTitleSfx)window.__ddTitleSfx('open');if(!REDUCE){document.body.classList.add('bifo');setTimeout(bifrost,150);setTimeout(()=>document.body.classList.remove('bifo'),4000)}
    try{if(window.DeviceOrientationEvent&&DeviceOrientationEvent.requestPermission)DeviceOrientationEvent.requestPermission().then(s=>{if(s==='granted')addEventListener('deviceorientation',tilt)}).catch(()=>{});else addEventListener('deviceorientation',tilt)}catch(_){}}});
// skip straight to the menu state when coming back from a game
window.__ddTitleReady=()=>{tapped=true;menuK=1;document.body.classList.add('titled')};
})();
