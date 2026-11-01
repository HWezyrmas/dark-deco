// ===== Dark Deco title screen: layered painted key art, camera push-in, lightning reveal, logo sweep, rain, embers, parallax =====
(function(){
const $=id=>document.getElementById(id),root=$('title'),stage=$('tStage'),back=$('tBack'),front=$('tFront'),bg=back.getContext('2d'),fg=front.getContext('2d');
const L={sky:$('tSky'),fogB:$('tFogB'),towers:$('tTowers'),heroes:$('tHeroes'),fogF:$('tFogF')};
let W=0,H=0,DPR=1,t0=performance.now(),tapped=false,flash=0,bolt=null,par={x:0,y:0},parT={x:0,y:0},drops=[],embers=[],sparks=[],menuK=0,menuT=0,run=true;
const REDUCE=matchMedia('(prefers-reduced-motion: reduce)').matches;
function size(){const r=stage.getBoundingClientRect();W=r.width;H=r.height;DPR=Math.min(2,devicePixelRatio||1);for(const c of [back,front]){c.width=Math.round(W*DPR);c.height=Math.round(H*DPR)}bg.setTransform(DPR,0,0,DPR,0,0);fg.setTransform(DPR,0,0,DPR,0,0)}
addEventListener('resize',size);size();
for(let i=0;i<110;i++)drops.push({x:Math.random(),y:Math.random(),v:.9+Math.random()*.8,l:8+Math.random()*14});
// heroes image is width-fitted and bottom-anchored: the lantern sits at ~ (0.905, 0.43) of the 1024x1536 picture
function lantern(){const hr=L.heroes.getBoundingClientRect(),sr=stage.getBoundingClientRect();const ih=hr.width*1.5;return[hr.left-sr.left+hr.width*.884,hr.bottom-sr.top-ih+ih*.45]}
function ease(k){k=Math.max(0,Math.min(1,k));return 1-Math.pow(1-k,3)}
function mkBolt(){const x=W*(.25+Math.random()*.5);let y=0,px=x;const pts=[[px,0]];while(y<H*.55){y+=H*.04+Math.random()*H*.04;px+=(Math.random()-.5)*W*.12;pts.push([px,y])}return{pts,t:0}}
function frame(now){requestAnimationFrame(frame);if(!document.body.classList.contains('intitle')){run=false;return}run=true;
  {const r=stage.getBoundingClientRect();if(Math.abs(r.width-W)>1||Math.abs(r.height-H)>1)size()}
  const t=(now-t0)/1000,dt=1/60;
  par.x+=(parT.x-par.x)*.06;par.y+=(parT.y-par.y)*.06;
  menuK+=((tapped?1:0)-menuK)*.05;
  // camera push-in: each layer settles from a bigger scale; deeper layers move less with parallax
  const push=REDUCE?1:ease(t/9),hk=REDUCE?1:ease((t-.5)/3.5),mk=menuK;
  const set=(el,s,dx,dy)=>{el.style.transform=`translate3d(${dx}px,${dy}px,0) scale(${s})`};
  set(L.sky,1.22-.16*push,par.x*-6,par.y*-4-mk*H*.03);
  set(L.fogB,1,par.x*-10,par.y*-6-mk*H*.05);
  set(L.towers,1.42-.32*push,par.x*-16,par.y*-8+(1-push)*H*.06-mk*H*.08);
  set(L.heroes,(1.12-.12*hk)*(1-.15*mk),par.x*-26,par.y*-12+(1-hk)*H*.14-mk*H*.21);
  set(L.fogF,1,par.x*-34,par.y*-14);
  // lightning reveal at 2.3s, then now and then
  if(!REDUCE&&((t>2.3&&!root.dataset.lit)||(t>8&&Math.random()<.0025))){root.dataset.lit=1;flash=1;bolt=mkBolt();if(tapped&&window.__ddTitleSfx)window.__ddTitleSfx('thunder')}
  flash=Math.max(0,flash-dt*2.2);
  const heroLight=t<2.3?.18+.12*ease(t/2.3):1;L.heroes.style.filter=`brightness(${(heroLight+flash*.9).toFixed(3)}) saturate(${(.7+.3*Math.min(1,heroLight)).toFixed(2)})`;
  L.towers.style.filter=`brightness(${(.55+.45*push+flash*.6+(Math.random()<.03?-.15:0)).toFixed(3)})`;
  $('tFlash').style.opacity=(flash*.55).toFixed(3);
  // back canvas: searchlights and the bolt (behind towers)
  bg.clearRect(0,0,W,H);bg.globalCompositeOperation='lighter';
  for(const [ox,sp,ph] of [[.18,.35,0],[.82,.28,2]]){const a=-Math.PI/2+Math.sin(t*sp+ph)*.45,x0=W*ox,y0=H*.78-mk*H*.05,len=H*1.1;const g=bg.createLinearGradient(x0,y0,x0+Math.cos(a)*len,y0+Math.sin(a)*len);g.addColorStop(0,'rgba(255,226,170,.16)');g.addColorStop(1,'rgba(255,226,170,0)');bg.fillStyle=g;bg.beginPath();bg.moveTo(x0,y0);bg.lineTo(x0+Math.cos(a-.07)*len,y0+Math.sin(a-.07)*len);bg.lineTo(x0+Math.cos(a+.07)*len,y0+Math.sin(a+.07)*len);bg.closePath();bg.fill()}
  if(bolt){bolt.t+=dt;const a=Math.max(0,1-bolt.t/.35);if(a<=0)bolt=null;else{for(const [w,c] of [[7,'rgba(190,150,255,'+a*.5+')'],[2.5,'rgba(255,255,255,'+a+')']]){bg.strokeStyle=c;bg.lineWidth=w;bg.beginPath();bolt.pts.forEach((p,i)=>i?bg.lineTo(p[0],p[1]):bg.moveTo(p[0],p[1]));bg.stroke()}}}
  bg.globalCompositeOperation='source-over';
  // front canvas: rain, lantern embers, tap sparks
  fg.clearRect(0,0,W,H);fg.strokeStyle='rgba(190,200,255,.22)';fg.lineWidth=1;fg.beginPath();
  for(const d of drops){d.y+=d.v*dt*1.1;d.x-=dt*.08;if(d.y>1.05){d.y=-.05;d.x=Math.random()*1.1}if(d.x<-.05)d.x+=1.1;const x=d.x*W,y=d.y*H;fg.moveTo(x,y);fg.lineTo(x-d.l*.25,y+d.l)}fg.stroke();
  const [lx,ly]=lantern();if(t>1.2&&embers.length<70&&Math.random()<.5)embers.push({x:lx+(Math.random()-.5)*10,y:ly+(Math.random()-.5)*8,vx:(Math.random()-.5)*14-6,vy:-18-Math.random()*26,l:1.6+Math.random()*1.6,m:0});
  fg.globalCompositeOperation='lighter';
  for(const e of [...embers,...sparks]){e.m+=dt;e.x+=e.vx*dt;e.y+=e.vy*dt;e.vx+=Math.sin(t*3+e.y*.05)*dt*10;if(e.g)e.vy+=e.g*dt;const a=Math.max(0,1-e.m/e.l),r=e.r||1.6;fg.fillStyle=`rgba(${e.c||'255,190,90'},${a})`;fg.beginPath();fg.arc(e.x,e.y,r*(.6+a*.6),0,7);fg.fill()}
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
  if(!tapped){tapped=true;document.body.classList.add('titled');if(window.__ddTitleSfx)window.__ddTitleSfx('open');
    try{if(window.DeviceOrientationEvent&&DeviceOrientationEvent.requestPermission)DeviceOrientationEvent.requestPermission().then(s=>{if(s==='granted')addEventListener('deviceorientation',tilt)}).catch(()=>{});else addEventListener('deviceorientation',tilt)}catch(_){}}});
// skip straight to the menu state when coming back from a game
window.__ddTitleReady=()=>{tapped=true;menuK=1;document.body.classList.add('titled')};
})();
