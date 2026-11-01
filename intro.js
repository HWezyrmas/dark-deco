// ===== Dark Deco intro cinematic: six painted scenes, camera moves, parallax cutouts, fog, embers, lightning, captions =====
(function(){
const SEEN='dd_intro_seen',$=id=>document.getElementById(id);let seen=false;try{seen=localStorage.getItem(SEEN)==='1'}catch(_){}
const REDUCE=matchMedia('(prefers-reduced-motion: reduce)').matches;
const root=document.createElement('div');root.id='intro';root.innerHTML=`<div id="iStage"><div class="iL" id="iA"></div><div class="iL" id="iB"></div><canvas id="iFx"></canvas><div id="iFlash"></div><div id="iCap"></div><div id="iVig"></div></div>
<div id="iStart"><div class="iSt">Dark Deco</div><button id="iGo">Tap to begin</button><small>Sound on</small></div><button id="iSkip">Skip</button>`;document.body.appendChild(root);
const A=$('iA'),B=$('iB'),cap=$('iCap'),fl=$('iFlash'),cv=$('iFx'),g=cv.getContext('2d');let W=0,H=0,parts=[],mode='',running=false,timers=[];
function size(){const r=$('iStage').getBoundingClientRect();W=r.width;H=r.height;cv.width=Math.round(W*.75);cv.height=Math.round(H*.75);g.setTransform(.75,0,0,.75,0,0)}
// a layer = a plate (cover) plus optional cutouts placed with a transform; scenes cross-fade between two layer slots
let slot=0;function layer(){slot^=1;return slot?A:B}
function img(src,cls){const i=new Image();i.src='intro/'+src;i.className=cls||'';i.alt='';i.decoding='async';return i}
const pre=['p1.jpg','p2.jpg','c2.webp','p3.jpg','c3.webp','p4.jpg','c4.webp','c5.webp','p6.jpg','c6.webp'].map(s=>{const i=new Image();i.src='intro/'+s;return i});
function after(ms,f){timers.push(setTimeout(f,ms))}
function anim(el,frames,o){return el.animate(frames,Object.assign({fill:'forwards',easing:'cubic-bezier(.25,.6,.3,1)'},o))}
function caption(t,dl=700){cap.classList.remove('on');after(dl,()=>{cap.textContent=t;void cap.offsetWidth;cap.classList.add('on')})}
function flash(a=1,ms=500){anim(fl,[{opacity:a},{opacity:0}],{duration:ms,easing:'ease-out'})}
function shake(px=10,ms=500){anim($('iStage'),[{transform:'translate(0,0)'},{transform:`translate(${px}px,${-px*.6}px)`},{transform:`translate(${-px*.8}px,${px*.5}px)`},{transform:`translate(${px*.5}px,${px*.4}px)`},{transform:'translate(0,0)'}],{duration:ms,easing:'linear',fill:'none'})}
function sfx(k){try{window.__ddIntroSfx&&window.__ddIntroSfx(k)}catch(_){}}
function show(L,parts2,dur,fromS=1.12,toS=1,origin='50% 60%'){const prev=L===A?B:A;L.innerHTML='';for(const p of parts2)L.appendChild(p);L.style.transformOrigin=origin;
  anim(L,[{opacity:0},{opacity:1}],{duration:900,easing:'ease'});anim(L,[{transform:`scale(${fromS})`},{transform:`scale(${toS})`}],{duration:dur,easing:'linear'});anim(prev,[{opacity:getComputedStyle(prev).opacity},{opacity:0}],{duration:900,easing:'ease'});return L}
const SC=[
 {d:6000,f(){mode='gold';const L=layer();show(L,[img('p1.jpg','plate')],6800,1.22,1.04,'50% 70%');caption('Once, the city of Lumen never slept.',900)}},
 {d:6400,f(){mode='smoke';const L=layer(),fo=img('c2.webp','cut');show(L,[img('p2.jpg','plate'),fo],7000,1.04,1.12,'60% 40%');fo.style.filter='brightness(.55) saturate(.9)';
   anim(fo,[{transform:'translateY(48%) scale(1.02)'},{transform:'translateY(6%) scale(1)'}],{duration:4200,delay:500,easing:'cubic-bezier(.3,.5,.2,1)'});after(2600,()=>{flash(.8,600);shake(14,700);sfx('thunder');fo.style.filter='brightness(1)'});caption('Then the Foreman came, and his furnaces swallowed the sky.',900)}},
 {d:6000,f(){mode='ash';const L=layer(),lp=img('c3.webp','cut');show(L,[img('p3.jpg','plate'),lp],6600,1.06,1.16,'30% 55%');lp.style.transformOrigin='50% 100%';lp.style.transform='translateX(30%) scale(1.06)';
   anim(lp,[{transform:'translateX(34%) scale(1.06)'},{transform:'translateX(26%) scale(1.1)'}],{duration:6000,easing:'linear'});
   const fk=[0,1,.35,1,.2,.9,.1,.6,.05,.25];fk.forEach((v,i)=>after(1600+i*230,()=>{lp.style.filter=`brightness(${.35+v*.75})`;if(i===fk.length-1){lp.style.filter='brightness(.32) saturate(.7)';sfx('fizz')}}));caption('One by one, the lights went out.',900)}},
 {d:5600,f(){mode='dark';const L=layer(),gl=img('c4.webp','cut');show(L,[img('p4.jpg','plate'),gl],6200,1.18,1.06,'50% 60%');gl.style.transformOrigin='50% 97%';
   anim(gl,[{transform:'translateY(-20%) scale(.48)',filter:'brightness(.2)'},{transform:'translateY(-20%) scale(.5)',filter:'brightness(1.15)'}],{duration:3000,delay:600});after(1700,()=>{mode='lantern';sfx('chime')});caption('All but one.',1200)}},
 {d:5600,f(){mode='lantern';const L=slot?A:B;const gl=L.querySelector('.cut'),wd=img('c5.webp','cut');wd.style.transformOrigin='50% 95%';wd.style.opacity='0';L.appendChild(wd);
   anim(L,[{transform:getComputedStyle(L).transform},{transform:'scale(1.02)'}],{duration:5600,easing:'linear'});
   if(gl)anim(gl,[{transform:'translateY(-20%) scale(.5)'},{transform:'translate(24%,-20%) scale(.47)'}],{duration:1200,delay:700});
   after(1000,()=>{wd.style.opacity='1';anim(wd,[{transform:'translate(-22%,-100%) scale(.52)'},{transform:'translate(-22%,-18%) scale(.52)'}],{duration:380,easing:'cubic-bezier(.55,0,1,.45)'});after(380,()=>{flash(1,450);shake(18,600);sfx('boom');burst()})});
   caption('And the one who would not let it fall.',1900)}},
 {d:6200,f(){mode='eyes';const L=layer(),du=img('c6.webp','cut');show(L,[img('p6.jpg','plate'),du],6800,1.2,1.05,'50% 62%');du.style.transformOrigin='50% 97%';
   anim(du,[{transform:'translateY(-22%) scale(.62)',opacity:0},{transform:'translateY(-23%) scale(.64)',opacity:1}],{duration:1600,delay:300});after(2900,()=>{flash(.6,500);sfx('thunder')});caption('Twelve minutes to dawn. Hold the roof.',1000)}},
];
// particles per mood
function spawn(){const n=mode==='gold'?2:mode==='lantern'?3:mode==='eyes'?2:1;for(let i=0;i<n;i++){
  if(mode==='gold'||mode==='lantern')parts.push({x:mode==='lantern'?W*(.45+Math.random()*.2):Math.random()*W,y:mode==='lantern'?H*.55:H*(.6+Math.random()*.4),vx:(Math.random()-.5)*12,vy:-14-Math.random()*26,l:2.5+Math.random()*2,m:0,r:1+Math.random()*1.8,c:'255,200,110'});
  else if(mode==='smoke'||mode==='ash')parts.push({x:Math.random()*W,y:-10,vx:6+Math.random()*10,vy:12+Math.random()*16,l:5,m:0,r:.8+Math.random()*1.2,c:mode==='smoke'?'255,120,70':'190,170,220'});
  else parts.push({x:Math.random()*W,y:H*(.5+Math.random()*.5),vx:(Math.random()-.5)*8,vy:-6-Math.random()*8,l:3,m:0,r:1+Math.random(),c:'200,140,255'})}}
function burst(){for(let i=0;i<70;i++){const a=Math.PI+Math.random()*Math.PI,s=80+Math.random()*260;parts.push({x:W*.3,y:H*.62,vx:Math.cos(a)*s,vy:Math.sin(a)*s*.7,l:.8+Math.random()*.7,m:0,r:1.5+Math.random()*2,c:Math.random()<.5?'255,210,140':'127,240,255',g:300})}}
let last=0;function loop(t){if(!running)return;requestAnimationFrame(loop);const dt=Math.min(.05,(t-last)/1000||0);last=t;if(!REDUCE&&parts.length<160)spawn();
  g.clearRect(0,0,W,H);g.globalCompositeOperation='lighter';for(const p of parts){p.m+=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;if(p.g)p.vy+=p.g*dt;const a=Math.max(0,1-p.m/p.l)*Math.min(1,p.m*3);g.fillStyle=`rgba(${p.c},${a})`;g.beginPath();g.arc(p.x,p.y,p.r,0,7);g.fill()}
  parts=parts.filter(p=>p.m<p.l&&p.y>-20&&p.y<H+20);g.globalCompositeOperation='source-over'}
function finish(skip){if(!root.classList.contains('on'))return;try{localStorage.setItem(SEEN,'1')}catch(_){}timers.forEach(clearTimeout);timers=[];cap.classList.remove('on');
  root.classList.add('out');document.body.classList.remove('inintro');setTimeout(()=>{running=false;root.classList.remove('on','out','playing');A.innerHTML=B.innerHTML='';parts=[]},900);
  if(window.__ddTitleOpen)window.__ddTitleOpen()}
function play(){root.classList.add('playing');document.body.classList.add('inintro');size();running=true;last=performance.now();requestAnimationFrame(loop);sfx('music');let t=0;
  SC.forEach((s,i)=>{after(t,()=>s.f());t+=s.d});after(t,()=>finish(false))}
function open(){root.classList.add('on');document.body.classList.add('inintro');size()}
$('iGo').addEventListener('click',()=>{sfx('unlock');play()});$('iSkip').addEventListener('click',()=>finish(true));
addEventListener('resize',()=>{if(running)size()});
window.__ddIntro=()=>{open();sfx('unlock');play()};
if(!seen)open();
})();
