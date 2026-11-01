// ===== Dark Deco intro cinematic: six painted scenes, camera moves, parallax cutouts, fog, embers, lightning, captions =====
(function(){
const SEEN='dd_intro_seen',$=id=>document.getElementById(id);let seen=false;try{seen=localStorage.getItem(SEEN)==='1'}catch(_){}
const REDUCE=matchMedia('(prefers-reduced-motion: reduce)').matches;
const root=document.createElement('div');root.id='intro';root.innerHTML=`<div id="iStage"><div class="iL" id="iA"></div><div class="iL" id="iB"></div><canvas id="iFx"></canvas><div id="iFlash"></div><div id="iCap"></div><div id="iVig"></div><div class="lb t"></div><div class="lb b"></div><div id="iGrain"></div></div>
<div id="iStart"><div class="iSt">Dark Deco</div><button id="iGo">Tap to begin</button><small>Sound on</small></div><button id="iSkip">Skip</button>`;document.body.appendChild(root);
const A=$('iA'),B=$('iB'),cap=$('iCap'),fl=$('iFlash'),cv=$('iFx'),g=cv.getContext('2d');let W=0,H=0,parts=[],mode='',running=false,timers=[];
function size(){const r=$('iStage').getBoundingClientRect();W=r.width;H=r.height;cv.width=Math.round(W*.75);cv.height=Math.round(H*.75);g.setTransform(.75,0,0,.75,0,0)}
// a layer = a plate (cover) plus optional cutouts placed with a transform; scenes cross-fade between two layer slots
let slot=0;function layer(){slot^=1;return slot?A:B}
function img(src,cls){const i=new Image();i.src='intro/'+src;i.className=cls||'';i.alt='';i.decoding='async';return i}
const pre=['p1.jpg','p2.jpg','p3.jpg','p4.jpg'].map(s=>{const i=new Image();i.src='intro/'+s;return i});
function after(ms,f){timers.push(setTimeout(f,ms))}
function anim(el,frames,o){return el.animate(frames,Object.assign({fill:'forwards',easing:'cubic-bezier(.25,.6,.3,1)'},o))}
function caption(t,dl=700){cap.classList.remove('on');after(dl,()=>{cap.textContent=t;void cap.offsetWidth;cap.classList.add('on')})}
function flash(a=1,ms=500){anim(fl,[{opacity:a},{opacity:0}],{duration:ms,easing:'ease-out'})}
function shake(px=10,ms=500){anim($('iStage'),[{transform:'translate(0,0)'},{transform:`translate(${px}px,${-px*.6}px)`},{transform:`translate(${-px*.8}px,${px*.5}px)`},{transform:`translate(${px*.5}px,${px*.4}px)`},{transform:'translate(0,0)'}],{duration:ms,easing:'linear',fill:'none'})}
function sfx(k){try{window.__ddIntroSfx&&window.__ddIntroSfx(k)}catch(_){}}
function show(L,parts2,dur,fromS=1.12,toS=1,origin='50% 60%'){const prev=L===A?B:A;L.innerHTML='';for(const p of parts2)L.appendChild(p);L.style.transformOrigin=origin;L.style.zIndex=2;prev.style.zIndex=1;
  anim(L,[{opacity:0,filter:'brightness(.4) blur(4px)'},{opacity:1,filter:'brightness(1) blur(0px)'}],{duration:1800,easing:'ease-in-out'});anim(L,[{transform:`scale(${fromS})`},{transform:`scale(${toS})`}],{duration:dur,easing:'cubic-bezier(.35,.1,.3,1)'});anim(prev,[{opacity:1},{opacity:0}],{duration:1800,delay:200,easing:'ease-in-out'});return L}
const SC=[
 {d:7000,f(){mode='gold';const L=layer();show(L,[img('p1.jpg','plate')],8200,1.28,1.06,'50% 75%');caption('Lumen. The city of a thousand lamps.',1200)}},
 {d:8200,f(){mode='smoke';const L=layer();show(L,[img('p2.jpg','plate')],9200,1.04,1.2,'62% 42%');cap.classList.remove('on');
   after(1500,()=>{flash(.75,700);shake(10,700);sfx('thunder')});after(2300,()=>{if(window.DLG)DLG.play([['foreman','Burn bright, little city.'],['foreman:laugh','My furnaces are hungry.']],{bark:true,cine:true})})}},
 {d:7000,f(){mode='ash';const L=layer();show(L,[img('p3.jpg','plate')],8200,1.08,1.22,'30% 60%');caption('One by one, the lamps went out.',1300);
   [2600,3000,3500,4300].forEach((t,i)=>after(t,()=>{flash(.12+i*.04,260);sfx('fizz')}))}},
 {d:7400,f(){mode='lantern';const L=layer();show(L,[img('p4.jpg','plate')],8600,1.3,1.08,'52% 76%');caption('Until only one still burned.',1300)}},
];

// particles per mood
function spawn(){const n=mode==='gold'?2:mode==='lantern'?3:mode==='eyes'?2:1;for(let i=0;i<n;i++){
  if(mode==='gold'||mode==='lantern')parts.push({x:mode==='lantern'?W*(.45+Math.random()*.2):Math.random()*W,y:mode==='lantern'?H*.74:H*(.6+Math.random()*.4),vx:(Math.random()-.5)*12,vy:-14-Math.random()*26,l:2.5+Math.random()*2,m:0,r:1+Math.random()*1.8,c:'255,200,110'});
  else if(mode==='smoke'||mode==='ash')parts.push({x:Math.random()*W,y:-10,vx:6+Math.random()*10,vy:12+Math.random()*16,l:5,m:0,r:.8+Math.random()*1.2,c:mode==='smoke'?'255,120,70':'190,170,220'});
  else parts.push({x:Math.random()*W,y:H*(.5+Math.random()*.5),vx:(Math.random()-.5)*8,vy:-6-Math.random()*8,l:3,m:0,r:1+Math.random(),c:'200,140,255'})}}
function burst(){for(let i=0;i<70;i++){const a=Math.PI+Math.random()*Math.PI,s=80+Math.random()*260;parts.push({x:W*.3,y:H*.62,vx:Math.cos(a)*s,vy:Math.sin(a)*s*.7,l:.8+Math.random()*.7,m:0,r:1.5+Math.random()*2,c:Math.random()<.5?'255,210,140':'127,240,255',g:300})}}
let last=0;function loop(t){if(!running)return;requestAnimationFrame(loop);const dt=Math.min(.05,(t-last)/1000||0);last=t;if(!REDUCE&&parts.length<160)spawn();
  g.clearRect(0,0,W,H);g.globalCompositeOperation='lighter';for(const p of parts){p.m+=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;if(p.g)p.vy+=p.g*dt;const a=Math.max(0,1-p.m/p.l)*Math.min(1,p.m*3);g.fillStyle=`rgba(${p.c},${a})`;g.beginPath();g.arc(p.x,p.y,p.r,0,7);g.fill()}
  parts=parts.filter(p=>p.m<p.l&&p.y>-20&&p.y<H+20);g.globalCompositeOperation='source-over'}
function finish(skip){if(!root.classList.contains('on'))return;if(window.DLG)DLG.clear();try{localStorage.setItem(SEEN,'1')}catch(_){}timers.forEach(clearTimeout);timers=[];cap.classList.remove('on');
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
