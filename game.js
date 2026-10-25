(()=>{
'use strict';
/* =====================================================================
   Dark Deco co-op — host-authoritative survivors-like.
   Host simulates enemies, damage, weapons, XP and level-ups.
   Each device moves its own character; effects are replicated as events.
   ===================================================================== */
const LOCAL=/[?&]local/.test(location.search);
const FAST=/[?&]fast/.test(location.search); // testing: accelerated clock
const cv=document.getElementById('c'),ctx=cv.getContext('2d');
const $=id=>document.getElementById(id);
const TAU=Math.PI*2,len=Math.hypot,rnd=Math.random,clamp=(v,a,b)=>v<a?a:v>b?b:v,r1=v=>Math.round(v*10)/10,r2=v=>Math.round(v*100)/100;
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
if(matchMedia('(pointer:coarse)').matches)document.body.classList.add('touch');
function mk(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c}
function rng(s){return()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const C={ink:'#07060d',sky0:'#110d24',sky1:'#2b1b4a',roof:'#1c1a30',tile:'#25233f',face:'#141226',rib:'#0b0a18',lip:'#3a3660',
  gold:'#d6a84e',goldL:'#f2cf7a',goldD:'#7d6232',cyan:'#4ff0ff',pink:'#ff4fd8',amber:'#ffc861',red:'#ff2a5c',heal:'#7dff9a'};
const RUN=720,ELITE_T=[240,480],BOSS_T=660,EVENTS=[{t:120,k:'muse'},{t:330,k:'broker'},{t:420,k:'muse'},{t:570,k:'broker'}];
let evDone=[],dangerDone=[];

/* ================= canvases ================= */
let W=0,H=0,DPR=1,PX=3,lw=0,lh=0;
const LOW=mk(1,1),EM=mk(1,1),B1=mk(1,1),b1=B1.getContext('2d'),B2=mk(1,1),b2=B2.getContext('2d');let lg=LOW.getContext('2d'),eg=EM.getContext('2d');
function resize(){W=innerWidth;H=innerHeight;DPR=Math.min(2,window.devicePixelRatio||1);cv.width=Math.round(W*DPR);cv.height=Math.round(H*DPR);
  {const s=Math.max(2,Math.round(Math.min(W,H)*DPR/300));PX=s/DPR}lw=Math.ceil(W/PX);lh=Math.ceil(H/PX);LOW.width=EM.width=lw;LOW.height=EM.height=lh;
  B1.width=Math.ceil(lw/2);B1.height=Math.ceil(lh/2);B2.width=Math.ceil(lw/5);B2.height=Math.ceil(lh/5);lg.imageSmoothingEnabled=eg.imageSmoothingEnabled=false}
addEventListener('resize',resize);resize();

/* ================= world ================= */
const ROOFS=[{x:0,y:0,w:440,h:250,med:1},{x:520,y:40,w:240,h:180}];
const BRIDGE={x:440,y:115,w:80,h:28};
const WALK=[...ROOFS,BRIDGE],FACE=120;
function walkable(x,y){for(const r of WALK)if(x>r.x+4&&x<r.x+r.w-4&&y>r.y+6&&y<r.y+r.h-3)return true;return false}
{const R=rng(5);for(const r of ROOFS){r.win=[];for(let x=r.x+3;x<r.x+r.w-3;x+=6)for(let y=8;y<FACE-24;y+=7)if(R()<.12)r.win.push([x,y,R()<.6?C.cyan:C.pink,.3+R()*.6])}}
const PROPS=[{k:'pylon',x:10,y:12,c:C.cyan},{k:'pylon',x:430,y:12,c:C.pink},{k:'pylon',x:10,y:246,c:C.pink},{k:'pylon',x:430,y:246,c:C.cyan},
  {k:'pylon',x:530,y:48,c:C.cyan},{k:'pylon',x:750,y:216,c:C.pink},{k:'vent',x:60,y:60},{k:'vent',x:380,y:200},{k:'vent',x:690,y:80}];
const TOW=[[],[]];{const R=rng(9);for(let L=0;L<2;L++){for(let i=0;i<(L?30:46);i++)TOW[L].push({x:-600+R()*2100,w:(L?26:14)+R()*(L?36:22),h:(L?90:60)+R()*(L?140:90),steps:1+(R()*3|0),ant:R()<.4,seed:R()*1000|0,neon:R()<.5?C.cyan:C.pink});TOW[L].sort((a,b)=>a.h-b.h)}}

/* ================= audio ================= */
let AC=null,master=null,noiseBuf=null,muted=false;const lastSnd={};
function audioInit(){if(AC){try{AC.resume()}catch(_){}return}try{AC=new (window.AudioContext||window.webkitAudioContext)();const comp=AC.createDynamicsCompressor();comp.threshold.value=-16;comp.ratio.value=8;comp.attack.value=.002;comp.release.value=.15;
  master=AC.createGain();master.gain.value=.55;master.connect(comp);comp.connect(AC.destination);
  noiseBuf=AC.createBuffer(1,AC.sampleRate,AC.sampleRate);const d=noiseBuf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=rnd()*2-1}catch(_){AC=null}}
function env(g,t0,a,dur,peak){g.gain.setValueAtTime(0.0001,t0);g.gain.exponentialRampToValueAtTime(peak,t0+a);g.gain.exponentialRampToValueAtTime(0.0001,t0+dur)}
function nz(dur,f0,f1,q,peak,type='bandpass',dl=0){if(!AC||muted)return;const t0=AC.currentTime+dl;const s=AC.createBufferSource();s.buffer=noiseBuf;const f=AC.createBiquadFilter();f.type=type;f.Q.value=q;f.frequency.setValueAtTime(f0,t0);f.frequency.exponentialRampToValueAtTime(Math.max(20,f1),t0+dur);const g=AC.createGain();env(g,t0,.004,dur,peak);s.connect(f);f.connect(g);g.connect(master);s.start(t0,rnd()*.5);s.stop(t0+dur+.02)}
function tn(f0,f1,dur,type,peak,dl=0,a=.004){if(!AC||muted)return;const t0=AC.currentTime+dl;const o=AC.createOscillator();o.type=type;o.frequency.setValueAtTime(f0,t0);if(f1!==f0)o.frequency.exponentialRampToValueAtTime(Math.max(20,f1),t0+dur);const g=AC.createGain();env(g,t0,a,dur,peak);o.connect(g);g.connect(master);o.start(t0);o.stop(t0+dur+.02)}
function ok(k,gap){const n=performance.now();if(lastSnd[k]&&n-lastSnd[k]<gap)return false;lastSnd[k]=n;return true}
const SFX={
  swoosh(h){if(!ok('sw',40))return;nz(h?.28:.17,h?300:700,h?2200:3200,.9,h?.5:.32)},
  hit(h){if(!ok('hit',28))return;const p=1+(rnd()-.5)*.3;tn(170*p,55,h?.2:.11,'sine',h?.9:.6);nz(.07,2600*p,700,1.2,h?.5:.3,'lowpass')},
  crit(){if(!ok('crit',60))return;tn(1500,1500,.08,'square',.1);tn(2250,2250,.12,'triangle',.08,.02)},
  kill(){if(!ok('kill',35))return;nz(.14,1100,160,2,.35,'lowpass');tn(340,70,.12,'triangle',.25)},
  dash(){nz(.28,250,2000,.7,.45);tn(90,45,.2,'sine',.5)},
  charge(){nz(.35,400,3500,3,.12);tn(110,330,.35,'sawtooth',.06)},
  boom(){tn(75,30,.6,'sine',1);nz(.5,1600,80,.7,.6,'lowpass');[523,659,784].forEach((f,i)=>tn(f,f,.9,'sine',.07,.04*i,.02))},
  flare(){[660,880,1320,1760,2640].forEach((f,i)=>tn(f,f*1.003,.8,'triangle',.11,.045*i,.005));nz(.6,4000,9000,.5,.12,'highpass')},
  heal(){if(!ok('heal',80))return;tn(1200,1900,.22,'sine',.12)},
  step(){tn(900,1800,.16,'triangle',.18);tn(2400,2400,.2,'sine',.06,.06)},
  twirl(){if(!ok('tw',60))return;nz(.2,1200,2600,1.5,.18);tn(1500,1500,.12,'sine',.05)},
  spawn(){if(!ok('sp',300))return;tn(70,45,.35,'sawtooth',.06);nz(.3,300,120,2,.08,'lowpass')},
  spin(){if(!ok('spin',110))return;nz(.16,500,1800,1.2,.28);tn(220,180,.1,'sawtooth',.04)},
  roar(){tn(120,60,.5,'sawtooth',.14);nz(.45,600,200,1,.4,'lowpass');tn(240,110,.4,'square',.05,.05)},
  exec(){if(!ok('ex',80))return;tn(90,40,.3,'sine',1);nz(.12,3000,400,1,.5);tn(1800,900,.1,'square',.08)},
  slam(){if(!ok('slam',60))return;tn(60,28,.5,'sine',1);nz(.35,900,60,.8,.7,'lowpass')},
  ouch(){if(!ok('ouch',150))return;tn(300,140,.15,'square',.12);nz(.08,1800,500,1,.2)},
  gem(){if(!ok('gem',45))return;tn(1800+rnd()*400,2600,.06,'sine',.05)},
  level(){[523,659,784,1046].forEach((f,i)=>tn(f,f,.35,'triangle',.12,.07*i,.005))},
  pick(){tn(880,1320,.15,'triangle',.15)},
  blast(){if(!ok('bl',80))return;tn(90,35,.45,'sine',.9);nz(.4,2400,100,.6,.6,'lowpass')},
  bolt(){if(!ok('bolt',55))return;const p=1+(rnd()-.5)*.2;tn(1500*p,800*p,.07,'triangle',.07);tn(2400*p,2400*p,.04,'sine',.03)},
  zap(){if(!ok('zap',70))return;nz(.12,5000,1500,4,.2);tn(2400,600,.1,'square',.06)},
  shot(){if(!ok('shot',90))return;nz(.08,3000,800,1,.25);tn(500,200,.08,'square',.06)},
  warn(){[220,208,196].forEach((f,i)=>tn(f,f,.4,'sawtooth',.08,.18*i,.02))},
  down(){tn(400,90,.8,'triangle',.3)},
  revive(){[392,523,659,784].forEach((f,i)=>tn(f,f,.5,'sine',.12,.06*i,.01))},
  tick(){tn(900,1200,.05,'square',.04)},
  land(i){tn(520+i*160,780+i*200,.12,'triangle',.16);nz(.08,3000,1200,1,.12)},
  win(){[523,659,784,1046,1318].forEach((f,i)=>tn(f,f,.9,'triangle',.13,.12*i,.01))},
};

/* ================= content: weapons, mods, stats, pairs ================= */
const WDEF={
  cleave:{cls:'warden',name:'Fury Strikes',desc:'A fast 3-hit combo; the third hit heals you. Enemies under 25% health are Executed for triple damage. Every hit builds Rage.',evo:'Rampage',evoD:'Every finisher unleashes 4 extra lightning-fast strikes.'},
  whirl:{cls:'warden',name:'Whirlwind',desc:'Spends 30 Rage to spin through everything around you, then you become Enraged: attacks 30% faster for 4 seconds.',evo:'Maelstrom',evoD:'Spins longer and drags enemies into the blades.'},
  slam:{cls:'warden',name:'Thunder Clap',desc:'A shockwave that launches crowds of 5+ enemies.',evo:'Fault Line',evoD:'Leaves a burning crack that keeps hurting.'},
  shield:{cls:'warden',name:'Hurled Axe',desc:'Hurls a spare axe; it bounces between 3 enemies.',evo:'Axe Storm',evoD:'The axe bounces 7 times.'},
  riposte:{cls:'warden',name:'Riposte',desc:'When you are hit, strike back all around you.',evo:'Iron Answer',evoD:'Each riposte also heals you 6.'},
  beam:{cls:'lamp',name:'Light Bolts',desc:'Fires bolts of lantern light at the nearest enemy, faster the longer you keep shooting. Bolts that fly through your partner heal them.',evo:'Sunthread',evoD:'Bolts fire faster and pierce through 3 enemies.'},
  prism:{cls:'lamp',name:'Prism',desc:'Each bolt that hits splits into a smaller bolt toward another enemy.',evo:'Kaleidoscope',evoD:'Splits into 4 bolts.'},
  lighthouse:{cls:'lamp',name:'Lighthouse',desc:'A beam slowly sweeps around you like a lighthouse.',evo:'Twin Lights',evoD:'Two beams sweep around you.'},
  flies:{cls:'lamp',name:'Fireflies',desc:'Fireflies orbit you and burn what they touch.',evo:'Halo',evoD:'A ring of 6 bright fireflies.'},
  moths:{cls:'lamp',name:'Moth Swarm',desc:'Releases homing moths at enemies farther away.',evo:'Night Bloom',evoD:'Six moths, and each hit spawns another.'},
  chain:{cls:'lamp',name:'Spark Chain',desc:'Light jumps between 4 nearby enemies.',evo:'Storm Lantern',evoD:'Jumps 9 times and stuns.'},
};
const WBASE={cleave:{cd:.85},whirl:{cd:1.5},slam:{cd:5},shield:{cd:4},riposte:{cd:2},twirl:{cd:.62},flies:{cd:0},moths:{cd:2.5},candle:{cd:4},chain:{cd:3},beam:{cd:0},prism:{cd:0},lighthouse:{cd:0}};
const MODS={
  mirror:{cls:'warden',name:'Mirror Dome',desc:'The Dome reflects bullets back as your own.'},
  longwatch:{cls:'warden',name:'Long Watch',desc:'The Dome lasts 2 seconds longer.'},
  firebash:{cls:'warden',name:'Burning Leap',desc:'Heroic Leap lands in a ring of fire that keeps burning.'},
  quickbash:{cls:'warden',name:'Quick Leap',desc:'Heroic Leap recharges 1.5 seconds faster.'},
  dawn:{cls:'lamp',name:'Second Dawn',desc:'The Solar Lance revives a fallen partner it touches.'},
  brightflare:{cls:'lamp',name:'Bright Lance',desc:'The Solar Lance is 40% wider and its power-up lasts 8 seconds.'},
  twinstep:{cls:'lamp',name:'Twin Step',desc:'Step\'s light heals twice as much and lasts longer.'},
  quickstep:{cls:'lamp',name:'Light Feet',desc:'Step recharges 1.5 seconds faster.'},
};
const STATS={hp:{name:'Iron Will',desc:'+20% max health, and heal 20 now.'},dmg:{name:'Sharpened',desc:'+15% damage on everything.'},spd:{name:'Quick Feet',desc:'+10% movement speed.'},cdr:{name:'Clockwork',desc:'Automatic attacks recharge 8% faster.'},mag:{name:'Lodestone',desc:'Pull in gems from 50% farther away.'}};
const PAIRS={
  litsteel:{name:'Lit Steel',desc:'While the Lamplighter\'s light powers him up, the Warden\'s hits set enemies on fire.'},
  ward:{name:'Lantern Ward',desc:'Inside the Dome, all healing is doubled and the Dome lasts 1 second longer.'},
  bond:{name:'Bond of Light',desc:'Your Bond fills twice as fast, and close together you heal three times faster.'},
};
const CL={
  warden:{name:'Warden',color:C.cyan,spd:56,hp:140,s1:'Leap',s2:'Dome',cd1:5,cd2:12,start:'cleave'},
  lamp:{name:'Lamplighter',color:C.amber,spd:68,hp:90,s1:'Step',s2:'Lance',cd1:4,cd2:11,start:'beam'},
};
const WCOL={cleave:'#bff9ff',whirl:'#7fd7ff',slam:'#6fb0ff',shield:'#f2cf7a',riposte:'#ffffff',twirl:'#ffc861',flies:'#d8ff6a',moths:'#ff8fd0',candle:'#ff9a3c',chain:'#fff07a',beam:'#fff0a8',prism:'#c9a0ff',lighthouse:'#ffe08a',lance:'#fff0a8'};
function wCount(id,lv){if(lv<1)return 0;if(id==='twirl')return lv>=5?7:2+lv;if(id==='moths')return lv>=5?6:3+Math.floor((lv-1)/2);if(id==='candle')return lv>=5?3:lv>=3?2:1;if(id==='chain')return lv>=5?9:3+lv;if(id==='flies')return lv>=5?6:2+(lv>=2)+(lv>=4);if(id==='shield')return lv>=5?7:3+Math.floor((lv-1)/2);if(id==='prism')return lv>=5?4:1+Math.floor((lv-1)/2);if(id==='lighthouse')return lv>=5?2:1;return 0}
const UNIT={prism:'split bolts',lighthouse:'beams',twirl:'sparks',moths:'moths',candle:'candles',chain:'jumps',flies:'fireflies',shield:'bounces'};
function upText(id,lv){const n0=wCount(id,lv-1),n1=wCount(id,lv),p=[];if(UNIT[id]&&n1>n0)p.push(n0+' → '+n1+' '+UNIT[id]);p.push('+25% damage');if(['cleave','whirl','slam','twirl','flies','candle'].includes(id))p.push('bigger');p.push('faster');return p.join(' · ')}
function lvm(w){return{d:1+.25*(w.lv-1)+(w.lv>=5?.25:0),c:1-.07*(w.lv-1),a:1+.08*(w.lv-1)}}
function cd1Max(c){return CL[c.cls].cd1-(c.mods.has('quickbash')||c.mods.has('quickstep')?1.5:0)}
function cd2Max(c){return CL[c.cls].cd2}

/* ================= characters ================= */
const S=64,FX=32,FY=56;
function mkChar(idx,cls,x,y){const D=CL[cls],SZ=S;const c={idx,cls,x,y,tx:x,ty:y,px:x,py:y,vx:0,vy:0,f:1,walk:0,moving:false,t:rnd()*10,atk:0,atkDur:.3,adir:0,heavy:false,swing:0,struck:false,flung:false,
  dash:0,dx:0,dy:0,mx:1,my:0,sq:0,cd1:0,cd2:0,hit:0,inv:0,pow:0,cast:null,pose:0,blink:0,sw:0,swv:0,lantern:[44,22],hitSet:null,
  hp:D.hp,max:D.hp,state:'ok',down:0,rev:0,out:0,weapons:cls==='warden'?[{id:'cleave',lv:1,cd:0},{id:'whirl',lv:1,cd:0}]:[{id:D.start,lv:1,cd:0}],rage:0,rT:0,enr:0,ww:0,bs:0,z:0,leap:null,leapT:0,mods:new Set(),st:{dmg:1,spd:1,cdr:0,mag:1,hpm:1},fireT:0,
  spr:mk(SZ,SZ),sem:mk(SZ,SZ),fin:mk(SZ,SZ),tint:mk(SZ,SZ),ol:mk(SZ,SZ)};c.g=c.spr.getContext('2d');c.m=c.sem.getContext('2d');return c}

/* ================= state ================= */
let mode='menu',isHost=true,solo=false,ME=0,chars=[];
let en=[],parts=[],slashes=[],ghosts=[],decals=[],waves=[],pools=[],proj=[],rays=[],dn=[],bolts=[],eb=[],gems=[],zones=[],later=[],dome=null;
let tAll=0,hitstop=0,eid=0,T=0,kills=0,level=1,xp=0,packT=1.5,bruteT=60,eliteDone=[],bossSpawned=false,boss=null,LV=null,lid=0,endState=null,teamMods=new Set();
let shk={x:0,y:0},zoom=1,flashA=0,combo=0,comboT=0,tintA=0,tintC='255,200,97',banners=[],learnQ=null,learnT=0;
let myCls='warden',mateCls=null,mateJoined=false;
const cam={x:210,y:130};
const meC=()=>chars.find(c=>c.idx===ME),mateC=()=>chars.find(c=>c.idx!==ME);
const need=l=>10+l*6+Math.floor(l*l*.15);
const hpMul=()=>1+T/240;

/* ================= effects (visual + sound; replicated host -> guest) ================= */
let fxQ=[];
const FXF={
  hit(x,y,txt,col,big,dir,scol,crit){num(x,y-6,txt,col,big);sparks(x,y,dir,crit?10:6,scol);parts.push({x,y,vx:0,vy:0,life:.07,max:.07,col:'#ffffff',em:true,star:crit?7:5});if(crit){SFX.crit();kick(rnd()-.5,rnd()-.5,3)}bumpCombo()},
  kill(x,y,big,dir){slashes.push({x,y,a:(dir??0)+Math.PI*.15,t:0,r:big?34:20,col:'#ffffff',heavy:1});puff(x,y,big?40:16,C.ink,big?110:70,.7,false,10,2);puff(x,y,big?16:7,C.red,60,.45,true);
    for(let i=0;i<(big?10:4);i++){const a=(dir??rnd()*TAU)+(rnd()-.5)*1.2,s=60+rnd()*90;parts.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s*.6-30,life:.5,max:.5,col:'#160f24',sz:3,grav:1})}
    SFX.kill();if(big){SFX.slam();kick(0,1,6);zoom=Math.max(zoom,1.04)}},
  ink(x,y,big){const pts=[];for(let i=0;i<(big?50:22);i++){const a=rnd()*TAU,r=rnd()*(big?16:8);pts.push([Math.round(Math.cos(a)*r),Math.round(Math.sin(a)*r*.5)])}decals.push({x:x|0,y:y|0,pts,life:6,ink:1});if(decals.length>60)decals.shift()},
  slash(x,y,a,r,heavy,span,col){slashes.push({x,y,a,t:0,r,col:col||C.cyan,heavy,span});SFX.swoosh(heavy===1)},
  enrage(ci){const c=chars.find(q=>q.idx===ci);if(!c)return;banners.push({c,txt:'ENRAGED',col:C.red,t:0});SFX.roar();puff(c.x,c.y-14,18,C.red,90,.5,true,20,1);waves.push({x:c.x,y:c.y,t:0,dur:.4,r:40,col:C.red,w:3});if(ci===ME)tint('255,60,90',.18)},
  storm(ci){const c=chars.find(q=>q.idx===ci);if(!c)return;banners.push({c,txt:'BLADESTORM',col:'#ffffff',t:0});SFX.roar();SFX.boom();waves.push({x:c.x,y:c.y,t:0,dur:.5,r:70,col:C.cyan,w:4});flashA=Math.max(flashA,.15);if(ci===ME)kick(0,1,4)},
  twirl(ci,lv){const c=chars.find(q=>q.idx===ci);if(c)slashes.push({twirl:1,c,t:0,lv:lv||1});SFX.twirl()},
  wave(x,y,dur,r,col,w,t0){waves.push({x,y,t:t0||0,dur,r,col,w})},
  crack(x,y,col){const lines=[];for(let i=0;i<9;i++){let a=i/9*TAU+rnd()*.4,px=0,py=0;const seg=[];for(let k=0;k<5;k++){a+=(rnd()-.5)*.8;px+=Math.cos(a)*(4+rnd()*4);py+=Math.sin(a)*(2+rnd()*2);seg.push([Math.round(px),Math.round(py)])}lines.push(seg)}decals.push({x,y,lines,life:3,col})},
  puff(x,y,n,col,sp,life,em,up,sz){puff(x,y,n,col,sp,life,em,up,sz)},
  star(x,y,col){for(let i=0;i<14;i++){const a=i/14*TAU,s=70+rnd()*30;parts.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s*.6,life:.35,max:.35,col,em:true,streak:1})}},
  num(x,y,txt,col,big){num(x,y,txt,col,big)},
  sfx(n,a){SFX[n]&&SFX[n](a)},
  big(fl,zm,hs,ky){flashA=Math.max(flashA,fl);zoom=Math.max(zoom,Math.min(zm,1.04));hitstop=Math.max(hitstop,Math.min(hs,.06));kick(0,1,ky*.6)},
  hs(t){hitstop=Math.max(hitstop,Math.min(t,.04))},
  shake(dx,dy,m,who){if(who===undefined||who===null||who===ME)kick(dx,dy,m)},
  rays(x,y){rays.push({x,y,t:0})},
  heal(ci){const o=chars.find(q=>q.idx===ci);if(!o)return;SFX.heal();for(let i=0;i<8;i++)parts.push({x:o.x+(rnd()-.5)*14,y:o.y-10-rnd()*12,vx:0,vy:-20-rnd()*14,life:1,max:1,col:C.heal,em:true,plus:1})},
  ghost(ci,x,y,f,life,col){const c=chars.find(q=>q.idx===ci);if(c)ghosts.push({c,x,y,f,life,col})},
  ouch(ci,dmg,dx,dy,brute){const c=chars.find(q=>q.idx===ci);if(!c)return;c.hit=.18;c.sq=-.25;num(c.x,c.y-40,'-'+dmg,'#ff5a7a',.9);SFX.ouch();puff(c.x,c.y-14,8,'#ffffff',40,.3,true);if(ci===ME){kick(dx,dy,brute?8:2.5);flashA=Math.max(flashA,.12);if(brute)zoom=Math.max(zoom,1.03)}},
  msg(t){say(t)},
  danger(big,sub){const rep=(' '+(big==='BOSS'?'BOSS INCOMING!!':'DANGER!!')).repeat(24);$('dBand1').textContent=rep;$('dBand2').textContent=rep;$('dBig').textContent=big;$('danger').classList.add('on');SFX.warn();flashA=Math.max(flashA,.15);setTimeout(()=>$('danger').classList.remove('on'),2600);if(sub)setTimeout(()=>say(sub,2),2600)},
  msgP(ci,mine,theirs){say(ci===ME?mine:theirs,2)},
  bolt(pts,lv){bolts.push({pts,t:0,lv:lv||1});for(let i=2;i+1<pts.length;i+=2)for(let k=0;k<4;k++){const a=rnd()*TAU,sp=50+rnd()*60;parts.push({x:pts[i],y:pts[i+1],vx:Math.cos(a)*sp,vy:Math.sin(a)*sp*.6,life:.22,max:.22,col:WCOL.chain,em:true,streak:1})}},
  wfire(ci,id){const c=chars.find(q=>q.idx===ci);if(!c)return;if(ci===ME){const el=document.querySelector('.kw[data-w="'+id+'"]');if(el){el.classList.add('fire');setTimeout(()=>el.classList.remove('fire'),110)}}
    if(!['cleave','twirl','riposte'].includes(id)){waves.push({x:c.x,y:c.y,t:0,dur:.32,r:20,col:WCOL[id],w:2});for(let i=0;i<6;i++){const a=rnd()*TAU;parts.push({x:c.x+Math.cos(a)*8,y:c.y-16+Math.sin(a)*6,vx:Math.cos(a)*40,vy:Math.sin(a)*30-20,life:.35,max:.35,col:WCOL[id],em:true})}}},
  learn(ci,tag,name,desc,col){const c=chars.find(q=>q.idx===ci);if(c)banners.push({c,txt:name.toUpperCase(),col,t:0});if(ci===ME)learnQ={tag,name,desc,col}},
  tint(col,a){tint(col,a)},
  rekindle(x,y){waves.push({x,y,t:0,dur:.6,r:110,col:C.gold,w:5},{x,y,t:-.1,dur:.75,r:150,col:'#fff1c4',w:2});FXF.star(x,y-12,C.gold);puff(x,y-10,30,C.gold,140,.7,true,20,1);
    flashA=Math.max(flashA,.35);zoom=Math.max(zoom,1.06);kick(0,1,6);SFX.revive();SFX.boom();for(const c of chars)banners.push({c,txt:'REKINDLED',col:C.gold,t:0});say('Together again',2)},
  gem(){SFX.gem()},
  shot(ci){const c=chars.find(q=>q.idx===ci);if(c)c.shootT=.3;SFX.bolt()},
  pop(x,y,small){for(let i=0;i<(small?4:7)&&parts.length<500;i++){const a=rnd()*TAU,s=40+rnd()*70;parts.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s*.6-30,life:.3,max:.3,col:i%2?'#fff1c4':'#ff9ccf',em:true,grav:1})}parts.push({x,y,vx:0,vy:0,life:.1,max:.1,col:'#ffffff',em:true,star:small?3:5})},
  recoil(ci,dx,dy,m){const c=chars.find(q=>q.idx===ci);if(c){c.rx=-dx*m;c.ry=-dy*m*.6}},
  starburst(x,y){for(let i=0;i<18&&parts.length<500;i++){const a=i/18*TAU+rnd()*.2,s=60+rnd()*60;parts.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s*.62,life:.5,max:.5,col:i%3===0?'#ffffff':i%3===1?'#ff6fb4':C.amber,em:true,star:i%3===0?4:3})}
    for(let i=0;i<4;i++){const a=i/4*TAU+Math.PI/4;parts.push({x:x+Math.cos(a)*14,y:y+Math.sin(a)*9,vx:0,vy:-8,life:.7,max:.7,col:'#ff9ccf',em:true,star:6})}
    waves.push({x,y:y+14,t:0,dur:.35,r:34,col:'#ff6fb4',w:2})},
};
function tint(col,a){tintC=col;tintA=Math.max(tintA,a)}
function emit(k,...a){FXF[k](...a);if(isHost&&!solo&&mateJoined)fxQ.push([k,a.map(v=>typeof v==='number'?r1(v):v)])}
function local(k,...a){FXF[k](...a)}

/* ================= input ================= */
const keys={},edge={s1:false,s2:false,swap:false};let joy=null;
addEventListener('keydown',e=>{if(e.target&&e.target.tagName==='INPUT')return;const k=e.key.toLowerCase();keys[k]=true;if(['tab',' ','arrowup','arrowdown','arrowleft','arrowright'].includes(k))e.preventDefault();if(e.repeat)return;
  if(mode==='pick'&&['1','2','3'].includes(k)){const b=document.querySelectorAll('.pick')[+k-1];b&&b.click();return}
  if(k==='q'||k===' '||k==='shift')edge.s1=true;if(k==='e')edge.s2=true;if(k==='tab')edge.swap=true});
addEventListener('keyup',e=>{keys[e.key.toLowerCase()]=false});
cv.addEventListener('pointerdown',e=>{audioInit();if(e.pointerType==='mouse'){document.body.classList.remove('touch');setHud();if(e.button===0)edge.s1=true;if(e.button===2)edge.s2=true;return}
  if(!document.body.classList.contains('touch')){document.body.classList.add('touch');setHud()}if(!joy){joy={id:e.pointerId,ox:e.clientX,oy:e.clientY,x:e.clientX,y:e.clientY};try{cv.setPointerCapture(e.pointerId)}catch(_){}}});
cv.addEventListener('pointermove',e=>{if(joy&&e.pointerId===joy.id){joy.x=e.clientX;joy.y=e.clientY}});
const endJ=e=>{if(joy&&e.pointerId===joy.id)joy=null};cv.addEventListener('pointerup',endJ);cv.addEventListener('pointercancel',endJ);
cv.addEventListener('contextmenu',e=>e.preventDefault());
let aimDrag=null,mouseW=null;
{const b=$('b2');b.addEventListener('pointerdown',e=>{const me2=chars.find(c=>c.idx===ME);if(!me2||me2.cls!=='lamp'||mode!=='play')return;e.preventDefault();e.stopImmediatePropagation();audioInit();const r=b.getBoundingClientRect();aimDrag={id:e.pointerId,ox:r.left+r.width/2,oy:r.top+r.height/2,x:e.clientX,y:e.clientY};b.classList.add('held');try{b.setPointerCapture(e.pointerId)}catch(_){}} ,true);
 b.addEventListener('pointermove',e=>{if(aimDrag&&e.pointerId===aimDrag.id){aimDrag.x=e.clientX;aimDrag.y=e.clientY}});
 const end=e=>{if(!aimDrag||e.pointerId!==aimDrag.id)return;const dx=aimDrag.x-aimDrag.ox,dy=aimDrag.y-aimDrag.oy;edge.s2=true;edge.aim=len(dx,dy)>18?[dx,dy]:null;aimDrag=null;b.classList.remove('held')};
 b.addEventListener('pointerup',end);b.addEventListener('pointercancel',end)}
cv.addEventListener('pointermove',e=>{if(e.pointerType==='mouse'){mouseW={x:e.clientX,y:e.clientY,t:performance.now()}}});
function mouseAim(c){if(!mouseW||document.body.classList.contains('touch'))return null;const wx=cam.x+(mouseW.x-W/2)/PX,wy=cam.y+(mouseW.y-H/2)/PX;const [sx,sy]=lanternPos(c);return[wx-sx,wy-sy]}
for(const [id,k] of [['b1','s1'],['b2','s2']]){const b=$(id);b.addEventListener('pointerdown',e=>{e.preventDefault();audioInit();b.classList.add('held');edge[k]=true});const u=()=>b.classList.remove('held');b.addEventListener('pointerup',u);b.addEventListener('pointercancel',u);b.addEventListener('pointerleave',u)}
$('swap').addEventListener('click',()=>{edge.swap=true;$('swap').blur()});
$('mute').addEventListener('click',()=>{muted=!muted;$('mute').textContent=muted?'Muted':'Sound';$('mute').setAttribute('aria-pressed',muted);$('mute').blur()});
$('leave').addEventListener('click',()=>{netClose();go('menu');menuStatus('')});
function readMove(){let ix=0,iy=0;if(keys.a||keys.arrowleft)ix--;if(keys.d||keys.arrowright)ix++;if(keys.w||keys.arrowup)iy--;if(keys.s||keys.arrowdown)iy++;
  if(joy){const dx=joy.x-joy.ox,dy=joy.y-joy.oy,l=len(dx,dy);if(l>8){const m=Math.min(1,l/46);ix=dx/l*m;iy=dy/l*m}}const l=len(ix,iy);if(l>1){ix/=l;iy/=l}return[ix,iy]}

/* ================= network ================= */
let peer=null,conn=null,bc=null,roomCode='',lastRecv=0,connTimer=null;
const ALPHA='ABCDEFGHJKMNPQRSTUVWXYZ23456789';
function genCode(){let s='';for(let i=0;i<4;i++)s+=ALPHA[Math.floor(Math.random()*ALPHA.length)];return s}
function send(o){try{if(LOCAL){bc&&bc.postMessage({from:isHost?'h':'g',o})}else if(conn&&conn.open)conn.send(o)}catch(_){}}
function netClose(){try{conn&&conn.close()}catch(_){}try{peer&&peer.destroy()}catch(_){}try{bc&&bc.close()}catch(_){}conn=null;peer=null;bc=null;mateJoined=false;clearTimeout(connTimer)}
function hostNet(){isHost=true;solo=false;roomCode=genCode();
  if(LOCAL){bc=new BroadcastChannel('dd3-'+roomCode);bc.onmessage=ev=>{if(ev.data.from==='g')onData(ev.data.o)};showCode();return}
  if(typeof Peer==='undefined'){menuStatus('Networking failed to load. Reload the page.','err');return}
  menuStatus('Opening a room…');peer=new Peer('ddeco-'+roomCode.toLowerCase(),{debug:1});
  peer.on('open',()=>showCode());
  peer.on('error',e=>{if(e.type==='unavailable-id'){peer.destroy();hostNet()}else if(mode==='lobby'&&!mateJoined)lobStatus('Connection problem ('+e.type+'). Try hosting again.','err');else if(mode==='menu')menuStatus('Could not open a room ('+e.type+').','err')});
  peer.on('connection',c=>{if(conn&&conn.open){c.close();return}conn=c;c.on('open',()=>{lastRecv=performance.now();onPartnerJoin()});c.on('data',onData);c.on('close',onPartnerLeft);c.on('error',onPartnerLeft)});
  peer.on('disconnected',()=>{try{peer.reconnect()}catch(_){}})}
function joinNet(code){isHost=false;solo=false;roomCode=code;
  if(LOCAL){bc=new BroadcastChannel('dd3-'+code);bc.onmessage=ev=>{if(ev.data.from==='h')onData(ev.data.o)};send({t:'hello'});return}
  if(typeof Peer==='undefined'){menuStatus('Networking failed to load. Reload the page.','err');return}
  menuStatus('Connecting…');peer=new Peer({debug:1});
  peer.on('open',()=>{conn=peer.connect('ddeco-'+code.toLowerCase(),{reliable:true,serialization:'json'});
    conn.on('open',()=>{clearTimeout(connTimer);lastRecv=performance.now();send({t:'hello'})});conn.on('data',onData);conn.on('close',onHostLeft);conn.on('error',onHostLeft)});
  peer.on('error',e=>{clearTimeout(connTimer);if(e.type==='peer-unavailable')menuStatus('No game with that code. Check the letters.','err');else menuStatus('Could not connect ('+e.type+').','err');netClose()});
  connTimer=setTimeout(()=>{if(!conn||!conn.open){menuStatus('Could not reach your partner. Try again, or both on the same Wi-Fi.','err');netClose()}},15000)}
function onPartnerJoin(){mateJoined=true;lobStatus('Partner joined','ok');sendLobby();updLobby()}
function onPartnerLeft(){if(!mateJoined)return;mateJoined=false;conn=null;mateCls=null;
  if(mode==='play'||mode==='pick'||mode==='end'){chars=chars.filter(c=>c.idx===0);say('Partner left');if(LV){LV=null;if(mode==='pick')go('play')}}else{lobStatus('Partner left. Waiting for someone to join','err');updLobby()}}
function onHostLeft(){if(mode==='menu')return;netClose();go('menu');menuStatus('The host left the game.','err')}
function sendLobby(){send({t:'lobby',h:myCls,g:mateCls})}
function onData(m){lastRecv=performance.now();
  switch(m.t){
    case 'hello':if(isHost&&LOCAL)onPartnerJoin();break;
    case 'pick':if(isHost){mateCls=m.c;sendLobby();updLobby()}break;
    case 'lobby':if(!isHost){if(mode==='menu')enterLobby();mateCls=m.h;if(m.g)myCls=m.g;else{myCls=m.h==='warden'?'lamp':'warden';send({t:'pick',c:myCls})}updLobby()}break;
    case 'start':if(!isHost)startGuest(m);break;
    case 'i':if(isHost)onGuestInput(m);break;
    case 'pk':if(isHost&&LV&&m.id===LV.id)applyPick(1,m.i);break;
    case 's':if(!isHost)onSnap(m);break;
  }}

/* ================= screens ================= */
function go(m){mode=m;if(m!=='play'&&m!=='pick')$('sSkills').hidden=true;$('sMenu').hidden=m!=='menu';$('sLobby').hidden=m!=='lobby';$('sLevel').hidden=m!=='pick';$('sEnd').hidden=m!=='end';$('hud').hidden=!(m==='play'||m==='pick');document.body.classList.toggle('playing',m==='play');if(m!=='play')$('combo').classList.remove('on');if(m==='menu'||m==='lobby')$('boss').hidden=true}
function menuStatus(t,c){const s=$('menuStatus');s.textContent=t||'';s.className='status'+(c?' '+c:'')}
function lobStatus(t,c){const s=$('lobStatus');s.textContent=t;s.className='status'+(c?' '+c:'')}
function showCode(){menuStatus('');enterLobby();$('roomCode').textContent=roomCode;lobStatus('Waiting for your partner to join');updLobby()}
function enterLobby(){go('lobby');$('lobEyebrow').textContent=isHost?(solo?'Practice with a bot':'Room code · share it with your partner'):'Joined room';$('roomCode').hidden=solo;$('roomCode').textContent=roomCode;
  if(!isHost)lobStatus('Connected. The host starts the game','ok');if(solo)lobStatus('A bot plays the other class','ok')}
function updLobby(){document.querySelectorAll('.cls').forEach(b=>{b.setAttribute('aria-pressed',b.dataset.c===myCls);b.classList.toggle('mate',b.dataset.c===mateCls)});
  $('pickMe').textContent='You: '+CL[myCls].name;$('pickMate').textContent=solo?'Bot: '+CL[myCls==='warden'?'lamp':'warden'].name:((isHost&&!mateJoined)?'':'Partner: '+(mateCls?CL[mateCls].name:'choosing…'));
  $('bStart').hidden=!isHost;$('bStart').disabled=!(solo||(mateJoined&&mateCls))}
document.querySelectorAll('.cls').forEach(b=>b.addEventListener('click',()=>{audioInit();myCls=b.dataset.c;if(isHost)sendLobby();else send({t:'pick',c:myCls});updLobby()}));
$('bHost').addEventListener('click',()=>{audioInit();netClose();myCls='warden';hostNet()});
$('bJoin').addEventListener('click',()=>{audioInit();const c=$('code').value.trim().toUpperCase();if(c.length!==4){menuStatus('Enter the 4-letter code from the host.','err');return}netClose();myCls='lamp';joinNet(c)});
$('code').addEventListener('keydown',e=>{if(e.key==='Enter')$('bJoin').click()});
$('bSolo').addEventListener('click',()=>{audioInit();netClose();isHost=true;solo=true;myCls='warden';enterLobby();updLobby()});
$('bStart').addEventListener('click',()=>{audioInit();startHost()});
$('bLeave').addEventListener('click',()=>{netClose();go('menu');menuStatus('')});
$('bAgain').addEventListener('click',()=>{if(isHost)startHost()});
$('bEndLeave').addEventListener('click',()=>{netClose();go('menu');menuStatus('')});

let wakeLock=null;async function wake(){try{wakeLock=await navigator.wakeLock.request('screen')}catch(_){}}
function resetWorld(){en=[];parts=[];slashes=[];ghosts=[];decals=[];waves=[];pools=[];proj=[];rays=[];dn=[];bolts=[];eb=[];gems=[];zones=[];later=[];dome=null;eid=0;packT=1.5;bruteT=60;combo=0;fxQ=[];
  T=0;kills=0;level=1;xp=0;eliteDone=[];evDone=[];dangerDone=[];bossSpawned=false;boss=null;LV=null;endState=null;teamMods=new Set();$('boss').hidden=true}
function startHost(){ME=0;resetWorld();const other=myCls==='warden'?'lamp':'warden';
  chars=[mkChar(0,myCls,200,140)];if(solo)chars.push(mkChar(1,other,176,148));else if(mateJoined&&mateCls)chars.push(mkChar(1,mateCls,176,148));
  for(let i=0;i<6;i++)en.push(newE(0,140+rnd()*160,80+rnd()*110,i*.05));
  cam.x=chars[0].x;cam.y=chars[0].y;go('play');setHud();wake();if(!solo&&chars.length>1)send({t:'start',h:myCls,g:mateCls})}
function startGuest(m){ME=1;resetWorld();myCls=m.g;mateCls=m.h;chars=[mkChar(0,m.h,200,140),mkChar(1,m.g,176,148)];cam.x=chars[1].x;cam.y=chars[1].y;go('play');setHud();wake()}
function openSkills(){const c=meC();if(!c)return;const I=window.DD_ICONS||{};
  $('skW').innerHTML=c.weapons.map(w=>{const d=WDEF[w.id];const ev=w.lv>=5;return`<div class="ski" style="--wc:${ev?C.gold:WCOL[w.id]}"><img src="${I[w.id]||''}" alt=""><div class="t"><b>${ev?'★ '+d.evo:d.name}</b><span>Level ${w.lv}${ev?' · evolved':''}. ${ev?d.evoD:d.desc}</span></div></div>`}).join('');
  const rows=[...c.mods].map(k=>`<div class="ski" style="--wc:${C.cyan}"><img src="${I[k]||''}" alt=""><div class="t"><b>${MODS[k].name}</b><span>${MODS[k].desc}</span></div></div>`);
  rows.push(...[...teamMods].map(k=>`<div class="ski" style="--wc:${C.pink}"><img src="${I[k]||''}" alt=""><div class="t"><b>${PAIRS[k].name}</b><span>Pair card. ${PAIRS[k].desc}</span></div></div>`));
  const st=[];if(c.st.dmg>1.001)st.push('+'+Math.round((c.st.dmg-1)*100)+'% damage');if(c.st.spd>1.001)st.push('+'+Math.round((c.st.spd-1)*100)+'% speed');if(c.st.cdr>.001)st.push(Math.round(c.st.cdr*100)+'% faster attacks');if(c.st.mag>1.001)st.push('+'+Math.round((c.st.mag-1)*100)+'% gem reach');st.push(Math.round(c.max)+' max health');
  rows.push(`<div class="ski" style="--wc:${C.heal}"><img src="${I.hp||''}" alt=""><div class="t"><b>Stats</b><span>${st.join(' · ')}</span></div></div>`);
  $('skM').innerHTML=rows.join('');$('skNote').textContent=solo?'':'The game keeps running while this is open.';$('sSkills').hidden=false}
$('skillsBtn').addEventListener('click',()=>{openSkills();$('skillsBtn').blur()});$('skillsBtn2').addEventListener('click',openSkills);$('skillsClose').addEventListener('click',()=>{$('sSkills').hidden=true});
function setHud(){const c=meC();if(!c)return;
  $('track').querySelectorAll('i').forEach(n=>n.remove());for(const [t,cl] of [[ELITE_T[0],''],[ELITE_T[1],''],[BOSS_T,'boss']]){const i=document.createElement('i');i.className=cl;i.style.left=(t/RUN*100)+'%';i.dataset.t=t;$('track').appendChild(i)}const D=CL[c.cls],t=document.body.classList.contains('touch');$('name').textContent=D.name;$('name').style.color=D.color;
  const m=mateC();$('rowMate').hidden=!m;if(m){$('mateName').textContent=CL[m.cls].name;$('mateName').style.color=CL[m.cls].color}
  $('swap').hidden=!solo;$('b1').textContent=D.s1.toUpperCase();$('b2').textContent=D.s2.toUpperCase();$('n1').textContent=(t?'':'Q · ')+D.s1;$('n2').textContent=(t?'':'E · ')+D.s2;$('cd1').style.color=$('cd2').style.color=D.color;kitKey=''}
let msgT=0;function say(t,d=1.8){$('msg').textContent=t;$('msg').style.opacity=1;msgT=d}
let kitKey='';
function hud(){const me=meC();if(!me)return;
  $('hpMe').style.width=clamp(me.hp/me.max,0,1)*100+'%';$('hpMeT').textContent=me.state==='ok'?Math.ceil(me.hp)+'/'+Math.round(me.max):(me.state==='down'?'DOWN':'OUT');$('rowMe').classList.toggle('down',me.state!=='ok');
  const m=mateC();if(m){$('hpMate').style.width=clamp(m.hp/m.max,0,1)*100+'%';$('rowMate').classList.toggle('down',m.state!=='ok')}
  $('trackF').style.width=clamp(T/RUN,0,1)*100+'%';$('track').querySelectorAll('i').forEach(n=>n.classList.toggle('done',T>=+n.dataset.t));
  $('bondW').hidden=chars.length<2;$('bondF').style.width=(bond*100)+'%';$('bondW').classList.toggle('low',bond<.3);$('bondW').classList.toggle('full',bond>.95);
  $('xpfill').style.width=clamp(xp/need(level),0,1)*100+'%';$('lvl').textContent='LV '+level;
  const tt=Math.floor(T);$('timer').textContent=String(Math.floor(tt/60)).padStart(2,'0')+':'+String(tt%60).padStart(2,'0');$('timer').style.color=T>=BOSS_T?'#ff8aa5':'';
  const k=me.weapons.map(w=>w.id+w.lv).join(',');if(k!==kitKey){kitKey=k;$('kit').innerHTML=me.weapons.map(w=>`<span class="kw${w.lv>=5?' evo':''}" data-w="${w.id}" style="--wc:${w.lv>=5?C.gold:WCOL[w.id]}"><span>${(w.lv>=5?'★ '+WDEF[w.id].evo:WDEF[w.id].name).toUpperCase()}</span><span class="pp">${[1,2,3,4,5].map(i=>`<i class="${i<=w.lv?'on':''}"></i>`).join('')}</span><span class="cdb"><b></b></span></span>`).join('')}
  for(const w of me.weapons){const el=document.querySelector('.kw[data-w="'+w.id+'"] .cdb b');if(el)el.style.width=((isHost?wFrac(w):(w.fr??1))*100)+'%'}
  if(boss&&!boss.dead){$('boss').hidden=false;$('bossHp').style.width=clamp(boss.hp/boss.max,0,1)*100+'%'}else $('boss').hidden=true;
  if(me.cls==='warden'){$('rowRage').hidden=false;const rg=clamp((me.rage||0)/100,0,1);$('rageB').style.width=rg*100+'%';const full=rg>=1&&!(me.bs>0);$('rowRage').classList.toggle('full',full);$('rowRage').classList.toggle('enr',me.enr>0||me.bs>0);
    const lab=full?'STORM':'LEAP';if($('b1').textContent!==lab){$('b1').textContent=lab;$('n1').textContent=(document.body.classList.contains('touch')?'':'Q · ')+(full?'Bladestorm':'Leap')}$('b1').classList.toggle('storm',full)}else $('rowRage').hidden=true;
  const p1=(me.cls==='warden'&&me.rage>=100)?1:1-me.cd1/cd1Max(me),p2=1-me.cd2/cd2Max(me);$('b1').style.setProperty('--p',p1);$('b2').style.setProperty('--p',p2);$('f1').style.width=p1*100+'%';$('f2').style.width=p2*100+'%'}

/* ================= feedback helpers ================= */
function kick(dx,dy,m){if(RM)return;shk.x+=dx*m;shk.y+=dy*m}
function puff(x,y,n,col,sp=40,life=.5,em=false,up=0,sz=1){for(let i=0;i<n&&parts.length<500;i++){const a=rnd()*TAU,s=sp*(.3+rnd());parts.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s*.6-up,life:life*(.5+rnd()*.7),max:life,col,em,sz})}}
function sparks(x,y,dir,n,col){for(let i=0;i<n&&parts.length<500;i++){const a=dir+(rnd()-.5)*1.6,s=90+rnd()*140,arc=i%2===0;parts.push({x,y,vx:Math.cos(a)*s*(arc?.6:1),vy:Math.sin(a)*s*.62-(arc?70:0),life:arc?.35:.18+rnd()*.15,max:arc?.35:.3,col,em:true,streak:arc?0:1,grav:arc?1:0,sz:arc?1:undefined})}
  for(let i=0;i<3&&parts.length<500;i++){const a=dir+(rnd()-.5)*.35,s=240+rnd()*120;parts.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s*.62,life:.16,max:.16,col:'#ffffff',em:true,streak:1})}}
function num(x,y,txt,col,big=1){if(dn.length>40)dn.shift();dn.push({x:x+(rnd()-.5)*8,y,txt,col,big,t:0,vx:(rnd()-.5)*34})}
function bumpCombo(){combo++;comboT=2.2;const e=$('cnum');e.textContent=combo;e.classList.remove('pop');void e.offsetWidth;e.classList.add('pop');$('combo').classList.toggle('on',combo>=5)}
function alive(e){return !e.dead&&e.spawn<=0}
function nearestEnemy(p,range,skip){let b=null,bd=range;for(const e of en){if(!alive(e)||(skip&&skip.has(e)))continue;const d=len(e.x-p.x,(e.y-p.y)*1.4);if(d<bd){bd=d;b=e}}return b}
function countNear(c,r){let n=0;for(const e of en)if(alive(e)&&len(e.x-c.x,(e.y-c.y)*1.4)<r)n++;return n}
function inDome(x,y){if(!dome)return false;const dx=(x-dome.x)/40,dy=(y-dome.y)/18;return dx*dx+dy*dy<1}
function healP(c,amt,show=true){if(c.state!=='ok')return;if(teamMods.has('ward')&&inDome(c.x,c.y))amt*=2;const before=c.hp;c.hp=Math.min(c.max,c.hp+amt);const got=c.hp-before;if(show&&got>=1)emit('num',c.x,c.y-42,'+'+Math.round(got),C.heal,.9)}

/* ================= host: damage ================= */
function hitE(e,base,src,o={}){if(!alive(e))return false;
  const crit=o.crit??(rnd()<.15);let a=Math.round(base*(src?src.st.dmg:1)*(src&&src.pow>0?1.5:1)*(src&&chars.length>1?1+.25*bond:1)*(.85+rnd()*.3));if(crit)a*=2;
  e.hp-=a;e.hit=.1;e.sq=.4;if(o.frz)e.frz=Math.max(e.frz||0,o.frz);const kr=e.kind>=4?0:e.kind===1?.35:1;e.kx+=(o.kx||0)*kr;e.ky+=(o.ky||0)*kr;if(o.up&&e.kind!==1&&e.kind<4)e.vz=Math.max(e.vz,o.up);if(o.stun)e.stun=Math.max(e.stun||0,o.stun);
  if(src&&src.cls==='warden'&&((src.pow>0&&teamMods.has('litsteel'))||src.lit>0))e.burn=Math.max(e.burn||0,2);
  const dir=o.dir??Math.atan2(e.y-(src?src.y:e.y),e.x-(src?src.x:e.x));const big=e.kind===1?14:e.kind===4?26:e.kind===5?40:0;
  if(o.quiet){e.acc=(e.acc||0)+a;e.accW=o.w;e.accY=big;if(rnd()<.3)emit('puff',e.x,e.y-8-e.z,2,o.col||'#ffffff',50,.2,true,0,1)}else emit('hit',e.x,e.y-8-e.z-big,o.exec?a+' EXECUTE':crit?a+'!':String(a),o.exec?'#ff3a5c':crit?'#ffd84a':(o.w?WCOL[o.w]:(src&&src.pow>0?'#ffe7a8':'#ffffff')),o.exec?1.7:crit?1.6:(o.w&&src&&src.cls==='lamp'?1.15:1),dir,o.col||'#ffffff',crit?1:0);
  if(e.hp<=0)killE(e,dir);return true}
function killE(e,dir){e.dead=true;kills++;const big=e.kind===1||e.kind>=4;emit('kill',e.x,e.y-6-e.z,big?1:0,dir);emit('ink',e.x,e.y,big?1:0);
  const v=[1,6,2,2,30,0][e.kind];for(let i=0;i<(e.kind===4?6:1);i++)if(v)gems.push({x:e.x+(i?(rnd()-.5)*20:0),y:e.y+(i?(rnd()-.5)*10:0),v:e.kind===4?5:v,vx:0,vy:0,hold:.3});
  if(e.kind===3)bomberBlast(e,true);
  if(e.kind===5){emit('big',.7,1.1,.15,10);emit('sfx','win');emit('msg','The Foreman falls');later.push({t:2.2,f:()=>endRun(true)})}}

/* ================= skills ================= */
let evQ=[];
function skill1(c,remote){if(c.state!=='ok')return;
  if(c.cls==='warden'){if(remote||c.cast||c.leap)return;
    if(c.rage>=100&&!(c.bs>0)){c.bs=2.5;if(isHost)startStorm(c);else{evQ.push(['bs']);c.rage=0;local('storm',c.idx)}return}
    if(c.cd1>0||c.bs>0)return;c.cd1=cd1Max(c);startLeap(c);return}
  if(!remote){if(c.cd1>0||c.cast)return;c.cd1=cd1Max(c)}
  if(!remote){const fx0=c.x,fy0=c.y;let dx=c.mx||c.f,dy=c.my||0;const l=len(dx,dy)||1;dx/=l;dy/=l;SFX.step();FXF.star(c.x,c.y-14,C.amber);
    let nx=c.x,ny=c.y;for(let s=46;s>0;s-=2){const tx=c.x+dx*s,ty=c.y+dy*s;if(walkable(tx,ty)){nx=tx;ny=ty;break}}
    for(let i=0;i<5;i++)ghosts.push({c,x:c.x+(nx-c.x)*i/5,y:c.y+(ny-c.y)*i/5,f:c.f,life:.2+i*.04,col:C.amber});
    c.x=nx;c.y=ny;c.tx=nx;c.ty=ny;c.sq=.3;FXF.star(c.x,c.y-14,C.amber);FXF.starburst(c.x,c.y-14);
    if(!isHost){evQ.push(['step',r1(fx0),r1(fy0),r1(c.x),r1(c.y)]);return}
    if(mateJoined){fxQ.push(['star',[r1(fx0),r1(fy0-14),C.amber]]);fxQ.push(['star',[r1(c.x),r1(c.y-14),C.amber]]);fxQ.push(['starburst',[r1(c.x),r1(c.y-14)]]);fxQ.push(['sfx',['step']])}
    stepEffect(c,fx0,fy0)}}
function startLeap(c){let dx=c.mx||c.f,dy=c.my||0;const l=len(dx,dy)||1;dx/=l;dy/=l;let x1=c.x,y1=c.y;
  for(let s=76;s>8;s-=3){const tx=c.x+dx*s,ty=c.y+dy*s*.8;if(walkable(tx,ty)){x1=tx;y1=ty;break}}
  c.leap={t:0,dur:.52,x0:c.x,y0:c.y,x1,y1};c.f=dx>=0?1:-1;c.sq=-.25;SFX.dash();FXF.puff(c.x,c.y,10,'#3a3660',50,.4,false,10,2);
  if(!isHost){evQ.push(['leap',r1(x1),r1(y1)]);return}
  if(mateJoined)fxQ.push(['sfx',['dash']]);hostLeap(c,x1,y1)}
function hostLeap(c,x1,y1){c.leapT=.54;later.push({t:.52,f:()=>leapLand(c,x1,y1)})}
function leapLand(c,x,y){if(c.state!=='ok')return;const L=lvm(c.weapons.find(w=>w.id==='cleave')||{lv:1}),R=44;
  emit('sfx','slam');emit('wave',x,y,.4,R*1.4,C.cyan,4,0);emit('wave',x,y,.5,R*1.9,'#ffffff',2,-.06);emit('crack',x,y,C.cyan);emit('puff',x,y,22,'#3a3660',90,.5,false,30,2);emit('puff',x,y,12,C.cyan,110,.4,true,10,1);emit('shake',0,1,7,c.idx);emit('hs',.03);
  let n=0;for(const e of en){if(!alive(e))continue;const dx=e.x-x,dy=e.y-y,d=len(dx,dy*1.4)||1;if(d<R+rad(e)*.4){n++;hitE(e,26*L.d,c,{w:'cleave',kx:dx/d*240,ky:dy/d*170,up:150,col:C.cyan,dir:Math.atan2(dy,dx),frz:.08})}}
  addRage(c,15+Math.min(10,n*2));if(c.mods.has('firebash'))zones.push({x,y,r:34,life:3,tick:0,dmg:7,src:c,col:'#ff7a3a'})}
function startStorm(c){c.bs=2.5;c.bsTick=0;c.rage=0;c.ww=0;c.atk=0;emit('storm',c.idx)}
function addRage(c,v){if(c.cls!=='warden')return;c.rage=Math.min(100,(c.rage||0)+v);c.rT=0}
function updFury(c,dt){if(c.cls!=='warden')return;c.leapT-=dt;c.rT+=dt;if(c.rT>3&&!(c.bs>0))c.rage=Math.max(0,c.rage-dt*6);
  if(c.enr>0)c.enr-=dt;
  const cw=c.weapons.find(w=>w.id==='cleave')||{lv:1},L=lvm(cw);
  if(c.ww>0){c.ww-=dt;c.wwTick-=dt;if(c.wwTick<=0){c.wwTick=.15;emit('sfx','spin');spinHit(c,c.wwR,c.wwD,c.wwP,'whirl')}
    if(c.ww<=0){c.ww=0;c.enr=4;emit('enrage',c.idx)}}
  if(c.bs>0){c.bs-=dt;c.bsTick=(c.bsTick||0)-dt;if(c.bsTick<=0){c.bsTick=.12;emit('sfx','spin');spinHit(c,54,16*L.d,true,'cleave')}if(c.bs<=0){c.bs=0;c.enr=4;emit('enrage',c.idx)}}}
function spinHit(c,R,dmg,pull,w){let n=0;for(const e of en){if(!alive(e))continue;const dx=e.x-c.x,dy=e.y-c.y,d=len(dx,dy*1.4)||1;if(d<R+rad(e)*.4){n++;hitE(e,dmg,c,{w,quiet:1,kx:dx/d*(pull?-70:150),ky:dy/d*(pull?-50:100),col:C.cyan,dir:Math.atan2(dy,dx),frz:.05})}}
  if(n){emit('sfx','hit',0);emit('shake',rnd()-.5,rnd()-.5,1.2,c.idx);if(w==='whirl')addRage(c,Math.min(4,n))}}
function stepEffect(c,fx0,fy0){const tw=c.mods.has('twinstep');pools.push({x:fx0,y:fy0,life:tw?4.5:3,pw:tw?2:1});for(const e of en)if(alive(e)&&len(e.x-c.x,(e.y-c.y)*1.4)<26)hitE(e,10,c,{kx:(e.x-c.x)*4,ky:(e.y-c.y)*4,col:C.amber})}
function autoAim(c){const p=partnerOf(c),[sx,sy]=lanternPos(c);let best=null,bs=-1;
  for(let i=0;i<32;i++){const a=i/32*TAU,dx=Math.cos(a),dy=Math.sin(a);let sc2=0;
    for(const e of en){if(!alive(e))continue;const px=e.x-sx,py=(e.y-8-e.z)-sy,al=px*dx+py*dy,pp=Math.abs(px*dy-py*dx);if(al>0&&al<270&&pp<15+rad(e)*.6)sc2+=e.kind>=4?5:e.kind===1?3:1}
    if(p&&p.state!=='out'){const px=p.x-sx,py=(p.y-12)-sy,al=px*dx+py*dy,pp=Math.abs(px*dy-py*dx);if(al>0&&al<270&&pp<20)sc2+=p.state==='down'&&c.mods.has('dawn')?20:p.hp<p.max*.85?8:3}
    if(dome){const px=dome.x-sx,py=(dome.y-14)-sy,al=px*dx+py*dy,pp=Math.abs(px*dy-py*dx);if(al>0&&al<270&&pp<36)sc2+=6}
    if(sc2>bs){bs=sc2;best=[dx,dy]}}
  return bs>0?best:dirOf(c)}
function skill2(c,remote,aim){if(c.state!=='ok')return;if(!remote){if(c.cd2>0||c.cast)return;c.cd2=cd2Max(c)}
  if(c.cls==='lamp'){let A=aim&&len(aim[0],aim[1])>.1?aim:null;if(!A)A=autoAim(c);const l=len(A[0],A[1])||1;c.aim=[A[0]/l,A[1]/l];if(A[0])c.f=A[0]>0?1:-1}
  if(!isHost){evQ.push(['s2',...(c.aim?c.aim.map(r2):[])]);c.cast={k:c.cls==='warden'?'dome':'lance',t:0,dur:c.cls==='warden'?.32:.35};SFX.charge();return}
  if(c.cast)return;c.cast={k:c.cls==='warden'?'dome':'lance',t:0,dur:c.cls==='warden'?.32:.35};if(remote)local('sfx','charge');else emit('sfx','charge')}
function release(c){
  if(c.cast.k==='dome'){dome={x:c.x,y:c.y,t:0,life:4.5+(c.mods.has('longwatch')?2:0)+(teamMods.has('ward')?1:0),sanct:0,owner:c};emit('sfx','boom');emit('big',.45,1.07,.06,7);
    emit('wave',c.x,c.y,.5,80,C.cyan,4,0);emit('wave',c.x,c.y,.6,110,'#ffffff',2,-.08);emit('crack',c.x,c.y,C.cyan);emit('puff',c.x,c.y,26,C.cyan,120,.6,true,20,1);
    for(const e of en){if(!alive(e))continue;const dx=e.x-c.x,dy=e.y-c.y,d=len(dx,dy*1.4)||1;if(d<70)hitE(e,20,c,{kx:dx/d*260,ky:dy/d*170,up:90,col:C.cyan,dir:Math.atan2(dy,dx)})}}
  else{const D=c.aim||dirOf(c);c.aim=null;c.lance={x:c.x,y:c.y,dx:D[0],dy:D[1],t:0,dur:1.2,tick:0,healed:false,refr:false,wide:c.mods.has('brightflare')?1.4:1};c.ch=1.2;c.pow=Math.max(c.pow,1.5);{const [lx,ly]=lanternPos(c);emit('starburst',lx,ly)}emit('recoil',c.idx,D[0],D[1],4);emit('sfx','flare');emit('sfx','boom');emit('big',.3,1.06,.05,5);emit('tint','255,220,140',.3)}
  c.cast=null;c.pose=.3}

/* ================= host: weapons ================= */
function wFrac(w){if(w.id==='flies'||!WBASE[w.id].cd)return 1;const b=(w.id==='cleave'?.85:WBASE[w.id].cd)*lvm(w).c;return clamp(1-w.cd/b,0,1)}
function cdRate(c){return (1/(1-Math.min(.5,c.st.cdr)))*(c.pow>0?1.5:1)*(c.enr>0?1.3:1)*(chars.length>1?1+.2*bond:1)}
function runWeapons(c,dt){const rate=cdRate(c);
  for(const w of c.weapons){const L=lvm(w),evo=w.lv>=5;
    if(w.id==='cleave'||w.id==='twirl'){meleeAuto(c,w,dt,rate);continue}
    if(w.id==='flies'||w.id==='beam'||w.id==='prism'||w.id==='lighthouse')continue; // handled separately
    if(w.id==='riposte'){w.cd-=dt;continue}
    w.cd-=dt*rate;if(w.cd>0)continue;const base=WBASE[w.id].cd*L.c;
    if(w.id==='whirl'){if(c.ww>0||c.bs>0||c.rage<30||c.leapT>0)continue;const R=46*L.a;if(countNear(c,R+6)<2)continue;w.cd=base;fired(c,w);c.rage-=30;c.ww=evo?1.5:1.05;c.wwR=R;c.wwD=11*L.d;c.wwP=evo;c.wwTick=0;c.atk=0;emit('sfx','roar');emit('wave',c.x,c.y,.3,R,C.cyan,3,0)}
    else if(w.id==='slam'){const R=60*L.a;if(countNear(c,R)<5)continue;w.cd=base;fired(c,w);emit('sfx','slam');emit('wave',c.x,c.y,.45,R*1.2,C.cyan,4,0);emit('crack',c.x,c.y,C.cyan);emit('shake',0,1,6,c.idx);emit('puff',c.x,c.y,18,'#3a3660',80,.5,false,30,2);
      for(const e of en){if(!alive(e))continue;const dx=e.x-c.x,dy=e.y-c.y,d=len(dx,dy*1.4)||1;if(d<R)hitE(e,34*L.d,c,{w:'slam',kx:dx/d*200,ky:dy/d*140,up:130,col:C.cyan,dir:Math.atan2(dy,dx)})}
      if(evo)zones.push({x:c.x,y:c.y,r:R*.7,life:3,tick:0,dmg:8*L.d,src:c,col:C.cyan})}
    else if(w.id==='shield'){const t=nearestEnemy(c,150);if(!t)continue;w.cd=base;fired(c,w);proj.push({k:'shield',x:c.x,y:c.y-12,tgt:t,bounce:wCount('shield',w.lv),lv:w.lv,hit:new Set(),dmg:22*L.d,src:c,life:4});emit('sfx','swoosh',0)}
    else if(w.id==='moths'){const t=nearestEnemy(c,200);if(!t)continue;w.cd=base;fired(c,w);const n=wCount('moths',w.lv);for(let i=0;i<n;i++){const a=rnd()*TAU;proj.push({k:'moth',x:c.x,y:c.y-14,vx:Math.cos(a)*90,vy:Math.sin(a)*60,life:2.2,tgt:null,dmg:10*L.d,src:c,bloom:evo,lv:w.lv})}emit('sfx','twirl')}
    else if(w.id==='candle'){const t=nearestEnemy(c,160);if(!t)continue;w.cd=base;fired(c,w);const targets=[t];{const sk=new Set([t]);for(let i=0;i<wCount('candle',w.lv)-1;i++){const n2=nearestEnemy(t,120,sk);if(n2){sk.add(n2);targets.push(n2)}}}
      for(const tt of targets)proj.push({k:'candle',x:tt.x+(rnd()-.5)*6,y:tt.y,fuse:1,dmg:30*L.d,r:34*L.a,src:c,lv:w.lv})}
    else if(w.id==='chain'){const t=nearestEnemy(c,140);if(!t)continue;w.cd=base;fired(c,w);const n=wCount('chain',w.lv),sk=new Set();let cur=t,pts=[r1(c.x),r1(c.y-16)];
      for(let i=0;i<n&&cur;i++){sk.add(cur);pts.push(r1(cur.x),r1(cur.y-8-cur.z));hitE(cur,14*L.d,c,{col:WCOL.chain,w:'chain',stun:evo?.8:0,crit:rnd()<.12});cur=nearestEnemy(cur,60,sk)}
      emit('bolt',pts,w.lv);emit('sfx','zap')}
  }
  // fireflies orbit
  const fw=c.weapons.find(w=>w.id==='flies');if(fw){const L=lvm(fw),evo=fw.lv>=5,n=wCount('flies',fw.lv),R=(evo?30:24)*L.a;c.flyPos=[];c.flyLv=fw.lv;
    for(let i=0;i<n;i++){const a=tAll*2.6+i*TAU/n,x=c.x+Math.cos(a)*R,y=c.y-10+Math.sin(a)*R*.55;c.flyPos.push([x,y]);
      for(const e of en){if(!alive(e))continue;if(len(e.x-x,(e.y-8-y)*1.3)<(evo?9:7)&&(e.flyT||0)<=0){e.flyT=.35;hitE(e,7*L.d,c,{col:WCOL.flies,w:'flies',crit:rnd()<.08,kx:(e.x-c.x)*1.5,ky:(e.y-c.y)*1.5})}}}}else c.flyPos=null;beamWeapons(c,dt)}
function partnerOf(c){return chars.find(q=>q!==c)}
function distSeg(px,py,x1,y1,x2,y2){const dx=x2-x1,dy=y2-y1,l2=dx*dx+dy*dy||1;let t=((px-x1)*dx+(py-y1)*dy)/l2;t=clamp(t,0,1);return len(px-(x1+t*dx),py-(y1+t*dy))}
function lanternPos(c){return[c.x+((c.lantern?c.lantern[0]:44)-FX)*c.f,c.y+(c.lantern?c.lantern[1]:22)-FY]}
function beamWeapons(c,dt){c.beams=[];const rate=cdRate(c);
  const bw=c.weapons.find(w=>w.id==='beam');
  if(bw){const L=lvm(bw),evo=bw.lv>=5,R=95*L.a;
    if(!c.bT||!alive(c.bT)||len(c.bT.x-c.x,(c.bT.y-c.y)*1.4)>R+24){const n=nearestEnemy(c,R);if(n!==c.bT){c.bT=n;c.heat=c.bT&&c.heat>0?c.heat*.6:0}}
    if(c.bT){const t=c.bT,[sx,sy]=lanternPos(c);c.heat=Math.min(1,(c.heat||0)+dt*rate*.45);c.f=t.x>=c.x?1:-1;
      c.shotCd=(c.shotCd||0)-dt*rate*(1+c.heat*.8)*(evo?1.3:1);
      if(c.shotCd<=0){c.shotCd=.32;const tx=t.x,ty=t.y-8-t.z,dx=tx-sx,dy=ty-sy,d=len(dx,dy)||1,sp=270;
        proj.push({k:'lbolt',x:sx,y:sy,vx:dx/d*sp,vy:dy/d*sp,a:Math.atan2(dy,dx),life:.75,tgt:t,dmg:7*L.d*(1+c.heat*.4),src:c,heat:c.heat,pierce:evo?3:0,hit:new Set(),lv:bw.lv,healed:false});
        emit('shot',c.idx)}}
    else c.heat=Math.max(0,(c.heat||0)-dt*1.5)}
  const lh=c.weapons.find(w=>w.id==='lighthouse');
  if(lh){const L2=lvm(lh),n=wCount('lighthouse',lh.lv),ln=85*L2.a;c.lhA=(c.lhA||0)+dt*1.5;c.lhTick=(c.lhTick||0)-dt;const tk=c.lhTick<=0;if(tk)c.lhTick=.22;
    for(let i=0;i<n;i++){const a=c.lhA+i*Math.PI,ex=c.x+Math.cos(a)*ln,ey=c.y-12+Math.sin(a)*ln*.6;c.beams.push([c.x,c.y-14,ex,ey,.55,2]);
      if(tk)for(const e of en){if(!alive(e))continue;if(distSeg(e.x,e.y-8,c.x,c.y-14,ex,ey)<9)hitE(e,9*L2.d,c,{quiet:1,w:'lighthouse',col:WCOL.lighthouse,crit:false})}}}}
function updLance(c,dt){const Ln=c.lance;Ln.t+=dt;Ln.x=c.x;Ln.y=c.y;if(Ln.t>=Ln.dur||c.state!=='ok'){c.lance=null;c.ch=0;return}
  const LEN=270,wd=13*Ln.wide,[sx0,sy0]=lanternPos(c),sx=sx0,sy=sy0;Ln.sx=sx;Ln.sy=sy;Ln.tick-=dt;
  if(Ln.tick<=0){Ln.tick=.1;if(rnd()<.35)emit('shake',Ln.dx,Ln.dy,.8,c.idx);
    for(const e of en){if(!alive(e))continue;const px=e.x-sx,py=(e.y-8-e.z)-sy,along=px*Ln.dx+py*Ln.dy,perp=Math.abs(px*Ln.dy-py*Ln.dx);if(along>0&&along<LEN&&perp<wd+rad(e)*.6)hitE(e,15,c,{quiet:1,w:'lance',kx:Ln.dx*110,ky:Ln.dy*80,col:WCOL.lance,crit:false})}
    if(Ln.refr&&dome){for(let i=0;i<6;i++){const a=i/6*TAU+Ln.t*1.2,rx=Math.cos(a),ry=Math.sin(a)*.6,cx=dome.x,cy=dome.y-14;for(const e of en){if(!alive(e))continue;const px=e.x-cx,py=(e.y-8)-cy,along=px*rx+py*ry,perp=Math.abs(px*ry-py*rx);if(along>0&&along<150&&perp<9)hitE(e,12,c,{quiet:1,w:'lance',col:WCOL.lance,crit:false})}}}}
  const p=partnerOf(c);if(p&&!Ln.healed){const px=p.x-sx,py=(p.y-12)-sy,along=px*Ln.dx+py*Ln.dy,perp=Math.abs(px*Ln.dy-py*Ln.dx);
    if(along>0&&along<LEN&&perp<wd+8){if(p.state==='down'&&c.mods.has('dawn'))revive(p,c);if(p.state==='ok'){Ln.healed=true;p.pow=c.mods.has('brightflare')?8:5;healP(p,p.max*.3);emit('heal',p.idx);emit('learn',p.idx,'Solar Lance','Empowered','Healed and hitting harder for a few seconds',C.amber);emit('sfx','flare');emit('tint','255,215,130',.3)}}}
  if(dome&&!Ln.refr){const px=dome.x-sx,py=(dome.y-14)-sy,along=px*Ln.dx+py*Ln.dy,perp=Math.abs(px*Ln.dy-py*Ln.dx);if(along>0&&along<LEN&&perp<36){Ln.refr=true;emit('num',dome.x,dome.y-52,'PRISM DOME','#ffd84a',1.4);emit('sfx','boom');emit('big',.3,1.05,.04,6)}}}
function dirOf(c){let dx=c.mx,dy=c.my;if(!dx&&!dy){dx=c.f;dy=0}const l=len(dx,dy)||1;return[dx/l,dy/l]}
function fired(c,w){emit('wfire',c.idx,w.id)}
function whirl(c,R,dmg,pull){emit('slash',c.x,c.y-12,0,R,1,TAU,C.cyan);emit('wave',c.x,c.y,.3,R,C.cyan,2,0);let n=0;
  for(const e of en){if(!alive(e))continue;const dx=e.x-c.x,dy=e.y-c.y,d=len(dx,dy*1.4)||1;if(d<R+3){n++;hitE(e,dmg,c,{w:'whirl',kx:dx/d*(pull?-120:160),ky:dy/d*(pull?-80:110),col:C.cyan,dir:Math.atan2(dy,dx)})}}
  if(n){emit('sfx','hit',1);emit('shake',0,1,1.5,c.idx)}}
function meleeAuto(c,w,dt,rate){const L=lvm(w),evo=w.lv>=5;w.cd-=dt*rate;if(c.cls==='warden'&&(c.ww>0||c.bs>0||c.leapT>0)){c.atk=0;return}
  if(c.atk>0){c.atk-=dt;const p=1-c.atk/c.atkDur;
    if(c.cls==='warden'){const at=c.heavy===1?.4:.32;if(!c.struck&&p>=at){c.struck=true;furyHit(c,w,c.heavy,c.adir)}}
    else{if(!c.struck&&p>=.4){c.struck=true;let n=0;for(const e of en){if(!alive(e))continue;const dx=e.x-c.x,dy=(e.y-c.y)*1.4,d=len(dx,dy)||1;if(d<28*L.a){if(hitE(e,14*L.d,c,{kx:dx/d*120,ky:dy/d*80,col:WCOL.twirl,w:'twirl',dir:Math.atan2(dy,dx)}))n++}}if(n){emit('sfx','hit',0)}}
      if(c.struck&&!c.flung&&p>=.85){c.flung=true;const n=wCount('twirl',w.lv);for(let i=0;i<n;i++){const a=c.adir+(i-(n-1)/2)*(evo?.6:.5);proj.push({k:'mote',x:c.x+Math.cos(a)*10,y:c.y-14,vx:Math.cos(a)*120,vy:Math.sin(a)*80,life:.9,tgt:null,dmg:9*L.d,src:c,lv:w.lv})}}}
    return}
  const t=nearestEnemy(c,c.cls==='warden'?40*L.a:28*L.a);
  if(t&&w.cd<=0&&c.dash<=0){c.adir=Math.atan2((t.y-c.y)*1.4,t.x-c.x);c.f=t.x>=c.x?1:-1;c.struck=false;c.flung=false;
    if(c.cls==='warden'){if(tAll-(c.lastSw||0)>1.3)c.swing=0;c.lastSw=tAll;c.swing++;const st=(c.swing-1)%3;c.heavy=st===2?1:st===1?2:0;c.atkDur=c.heavy===1?.36:.24;w.cd=(c.heavy===1?.62:.3)*L.c;fired(c,w)}else{c.atkDur=.42;w.cd=.62*L.c;emit('twirl',c.idx,w.lv);fired(c,w)}
    c.atk=c.atkDur}}
function furyHit(c,w,kind,ad){const L=lvm(w),evo=w.lv>=5,fin=kind===1,rap=kind===3;let n=0,ex=false,rg=0;const R=(fin?46:rap?40:40)*L.a;
  emit('slash',c.x+Math.cos(ad)*4,c.y-12,ad,R,rap?(rnd()<.5?0:2):kind,0,fin?'#ffffff':C.cyan);
  for(const e of en){if(!alive(e))continue;const dx=e.x-c.x,dy=(e.y-c.y)*1.4,d=len(dx,dy)||1;
    if(d<R+(e.kind===1||e.kind>=4?10:3)&&Math.cos(Math.atan2(dy,dx)-ad)>(fin?-.35:-.1)){const exe=e.kind!==5&&e.hp<e.max*.25;if(exe)ex=true;
      if(hitE(e,(fin?30:rap?11:16)*L.d*(exe?3:1),c,{w:'cleave',exec:exe,kx:dx/d*(fin?230:120),ky:dy/d*(fin?160:80),up:fin?120:0,col:fin?'#ffffff':C.cyan,dir:Math.atan2(dy,dx),frz:fin?.1:.06})){n++;rg+=fin?7:5}}}
  addRage(c,Math.min(15,rg));
  if(fin){const hx=c.x+Math.cos(ad)*14,hy=c.y+Math.sin(ad)*6;emit('wave',hx,hy,.32,40,C.cyan,3,0);emit('crack',hx,hy,C.cyan);emit('puff',hx,c.y,10,'#3a3660',60,.4,false,20,2);if(n){healP(c,c.max*.02);emit('shake',Math.cos(ad),.6,4,c.idx)}
    if(evo)for(let i=0;i<4;i++)later.push({t:.07+i*.07,f:()=>{if(c.state!=='ok'||c.ww>0||c.bs>0)return;const t=nearestEnemy(c,48*L.a),a2=t?Math.atan2((t.y-c.y)*1.4,t.x-c.x):ad+(rnd()-.5);furyHit(c,w,3,a2)}})}
  if(ex)emit('sfx','exec');
  if(n){emit('sfx','hit',fin?1:0);emit('shake',Math.cos(ad),Math.sin(ad),Math.min(2.5,(fin?1.6:.8)+n*.25),c.idx);emit('recoil',c.idx,Math.cos(ad),Math.sin(ad)/1.4,fin?3:1.5);if(fin&&tAll-(c.lastHs||0)>.3){c.lastHs=tAll;emit('hs',.035)}}}
function updProj(dt){
  for(const p of proj){p.life=(p.life??9)-dt;
    if(p.k==='mote'||p.k==='moth'){if(!p.tgt||!alive(p.tgt))p.tgt=nearestEnemy(p,p.k==='moth'?220:140);if(p.tgt){const dx=p.tgt.x-p.x,dy=p.tgt.y-10-p.tgt.z-p.y,d=len(dx,dy)||1;p.vx+=dx/d*900*dt;p.vy+=dy/d*900*dt;const v=len(p.vx,p.vy),mx=p.k==='moth'?170:220;if(v>mx){p.vx*=mx/v;p.vy*=mx/v}
        if(d<6){hitE(p.tgt,p.dmg,p.src,{kx:p.vx*.5,ky:p.vy*.5,col:p.k==='moth'?WCOL.moths:WCOL.twirl,w:p.k==='moth'?'moths':'twirl',crit:rnd()<.1});if(p.bloom&&!p.child){const a=rnd()*TAU;proj.push({k:'moth',x:p.x,y:p.y,vx:Math.cos(a)*90,vy:Math.sin(a)*60,life:1.6,tgt:null,dmg:p.dmg*.7,src:p.src,child:1,lv:p.lv})}p.life=0}}
      p.x+=p.vx*dt;p.y+=p.vy*dt}
    else if(p.k==='shield'){if(!p.tgt||!alive(p.tgt))p.tgt=nearestEnemy(p,120,p.hit);if(!p.tgt){p.life=0;continue}const dx=p.tgt.x-p.x,dy=p.tgt.y-10-p.y,d=len(dx,dy)||1,sp=260;p.x+=dx/d*sp*dt;p.y+=dy/d*sp*dt;
      if(d<8){p.hit.add(p.tgt);hitE(p.tgt,p.dmg,p.src,{w:'shield',kx:dx/d*140,ky:dy/d*100,col:C.cyan});emit('sfx','hit',0);p.bounce--;p.tgt=p.bounce>0?nearestEnemy(p,110,p.hit):null;if(!p.tgt)p.life=0}}
    else if(p.k==='lbolt'){if(p.tgt&&alive(p.tgt)&&!p.child){const dx=p.tgt.x-p.x,dy=p.tgt.y-8-p.tgt.z-p.y,d=len(dx,dy)||1,v=len(p.vx,p.vy);p.vx+=(dx/d*v-p.vx)*Math.min(1,dt*7);p.vy+=(dy/d*v-p.vy)*Math.min(1,dt*7)}
      p.x+=p.vx*dt;p.y+=p.vy*dt;p.a=Math.atan2(p.vy,p.vx);
      const mate=partnerOf(p.src);if(mate&&mate.state==='ok'&&!p.healed&&len(mate.x-p.x,(mate.y-12-p.y)*1.3)<10){p.healed=true;healP(mate,2.2*(1+bond),false);mate.lit=1.2;emit('heal',mate.idx)}
      for(const e of en){if(!alive(e)||p.hit.has(e))continue;if(len(e.x-p.x,(e.y-8-e.z-p.y)*1.3)<5+rad(e)*.5){p.hit.add(e);hitE(e,p.dmg,p.src,{w:p.child?'prism':'beam',col:WCOL.beam,kx:p.vx*.25,ky:p.vy*.2,crit:rnd()<.08,dir:p.a});emit('pop',p.x,p.y,p.child?1:0);
          const pw=!p.child&&p.src.weapons.find(w=>w.id==='prism');if(pw){const n=wCount('prism',pw.lv),sk=new Set(p.hit);for(let i=0;i<n;i++){const e2=nearestEnemy(e,70,sk);if(!e2)break;sk.add(e2);const dx=e2.x-p.x,dy=e2.y-8-e2.z-p.y,d=len(dx,dy)||1;proj.push({k:'lbolt',x:p.x,y:p.y,vx:dx/d*240,vy:dy/d*240,a:Math.atan2(dy,dx),life:.4,tgt:e2,dmg:p.dmg*.6*lvm(pw).d,src:p.src,heat:.2,pierce:0,hit:new Set([e]),lv:1,child:1,healed:true})}}
          if(p.pierce>0)p.pierce--;else{p.life=0;break}}}}
    else if(p.k==='blade'||p.k==='refl'){p.x+=p.vx*dt;p.y+=p.vy*dt;for(const e of en){if(!alive(e)||p.hit.has(e))continue;if(len(e.x-p.x,(e.y-8-p.y)*1.3)<(p.k==='blade'?14:7)){p.hit.add(e);hitE(e,p.dmg,p.src,{kx:p.vx*.6,ky:p.vy*.6,col:C.cyan});if(p.k==='refl'){p.life=0;break}}}}
    else if(p.k==='candle'){p.fuse-=dt;if(p.fuse<=0){p.life=0;emit('sfx','blast');emit('wave',p.x,p.y,.4,p.r*1.3,WCOL.candle,5,0);emit('puff',p.x,p.y-6,22,WCOL.candle,100,.5,true,20,1);emit('star',p.x,p.y-6,'#ffd0a0');emit('shake',0,1,3,p.src.idx);
        for(const e of en){if(!alive(e))continue;const dx=e.x-p.x,dy=e.y-p.y,d=len(dx,dy*1.4)||1;if(d<p.r)hitE(e,p.dmg,p.src,{kx:dx/d*180,ky:dy/d*120,up:90,col:WCOL.candle,w:'candle',dir:Math.atan2(dy,dx)})}}}}
  proj=proj.filter(p=>p.life>0);
  for(const z of zones){z.life-=dt;z.tick-=dt;if(z.tick<=0){z.tick=.4;for(const e of en){if(!alive(e))continue;if(len(e.x-z.x,(e.y-z.y)*2)<z.r)hitE(e,z.dmg,z.src,{col:z.col===C.cyan?C.cyan:'#ff7a3a',crit:false})}}}
  zones=zones.filter(z=>z.life>0)}

/* ================= host: players ================= */
function hurtP(c,dmg,sx,sy,heavy){if(c.state!=='ok'||c.dash>0||c.inv>0||c.fall||c.leapT>0||c.bs>0)return;addRage(c,8);if(inDome(c.x,c.y))dmg*=.7;
  c.hp-=dmg;c.inv=.45;const dx=c.x-sx,dy=c.y-sy,d=len(dx,dy)||1;emit('ouch',c.idx,Math.round(dmg),-dx/d,-dy/d,heavy?1:0);
  const rp=c.weapons.find(w=>w.id==='riposte');if(rp&&rp.cd<=0){const L=lvm(rp);rp.cd=WBASE.riposte.cd*L.c;emit('slash',c.x,c.y-12,0,36*L.a,1,TAU,'#ffffff');
    for(const e of en){if(!alive(e))continue;const ex=e.x-c.x,ey=e.y-c.y,ed=len(ex,ey*1.4)||1;if(ed<38*L.a)hitE(e,30*L.d,c,{kx:ex/ed*200,ky:ey/ed*140,col:C.cyan,dir:Math.atan2(ey,ex)})}if(rp.lv>=5)healP(c,6)}
  if(c.hp<=0){c.hp=0;c.state='down';c.down=20;c.rev=0;c.cast=null;emit('sfx','down');emit('msgP',c.idx,'You are down','Partner down! Stand beside them')}}
function revive(c,by){c.state='ok';c.hp=Math.round(c.max*.5);c.inv=1.5;c.rev=0;c.down=0;c.out=0;emit('sfx','revive');emit('star',c.x,c.y-14,C.heal);emit('heal',c.idx);emit('msgP',c.idx,'Back on your feet','Revived!')}
function updPlayers(dt){
  for(const c of chars){c.inv-=dt;
    if(c.state==='down'){c.down-=dt;const o=chars.find(q=>q!==c&&q.state==='ok');
      if(o&&len(o.x-c.x,(o.y-c.y)*1.4)<30){c.rev+=dt*(inDome(c.x,c.y)?2:1);if(c.rev>=2.5)revive(c,o)}else c.rev=Math.max(0,c.rev-dt*.5);
      if(c.state==='down'&&c.down<=0){c.state='out';c.out=20;emit('msgP',c.idx,'Out for 20 seconds','Partner out for 20 seconds')}}
    else if(c.state==='out'){c.out-=dt;if(c.out<=0){const o=chars.find(q=>q!==c&&q.state==='ok');if(o){c.x=o.x+12;c.y=o.y;c.tx=c.x;c.ty=c.y;c.tp=(c.tp||0)+1}revive(c,o)}}}
  // tether
  if(chars.length>1){const [a,b]=chars;const close=a.state==='ok'&&b.state==='ok'&&len(a.x-b.x,(a.y-b.y)*1.4)<75,bm=teamMods.has('bond')?2:1;
    bond=close?Math.min(1,bond+dt*.7*bm):Math.max(0,bond-dt*.18);if(bond<.3&&!apart){apart=true;emit('msg','Apart, your bond fades')}if(apart&&close&&bond>.55){apart=false;rekindle(a,b)}
    if(close){const r=(1+2*bond)*(teamMods.has('bond')?3:1)*dt;for(const c of chars){c.tetherAcc=(c.tetherAcc||0)+r;if(c.tetherAcc>=1){c.tetherAcc-=1;healP(c,1,false)}}}tether=close?1:0}else{bond=0;tether=0}
  for(const p of pools){p.life-=dt;for(const c of chars)if(c.state==='ok'&&len(c.x-p.x,(c.y-p.y)*2)<26){p.hb=(p.hb||0)-dt;if(p.hb<=0){p.hb=.5;healP(c,3*(p.pw||1))}}}pools=pools.filter(p=>p.life>0);
  if(chars.every(c=>c.state!=='ok')&&!endState)endRun(false)}
let tether=0,bond=1,apart=false;
function rekindle(a,b){const mx=(a.x+b.x)/2,my=(a.y+b.y)/2;emit('rekindle',mx,my);for(const c of chars){healP(c,20);c.pow=Math.max(c.pow,3)}
  for(const e of en){if(!alive(e))continue;const dx=e.x-mx,dy=e.y-my,d=len(dx,dy*1.4)||1;if(d<85)hitE(e,30,a,{kx:dx/d*230,ky:dy/d*160,up:80,col:C.gold,crit:false})}}

/* ================= host: enemies ================= */
const EK=['shadow','brute','gunman','bomber','elite','boss'];
function newE(kind,x,y,delay=0){const hp=[34,260,40,30,1800,9000][kind]*hpMul()*(kind>=4&&chars.length>1?1.4:1);
  return{id:++eid,kind,x,y,rx:x,ry:y,z:0,vz:0,kx:0,ky:0,hp,max:hp,hit:0,sq:0,spawn:(kind===1||kind>=4?1.2:.7)+delay,t:rnd()*5,f:1,dead:false,atkT:0,st:0,stt:0,ax:0,ay:1,cd:1.5+rnd()*1.5,strafe:rnd()<.5?1:-1,stun:0,burn:0,burnT:0,flyT:0,phase:0}}
function spawnPack(){const tgt=chars.filter(c=>c.state==='ok')[0]||chars[0];let px,py,tries=0;do{const a=rnd()*TAU,r=80+rnd()*50;px=tgt.x+Math.cos(a)*r;py=tgt.y+Math.sin(a)*r*.7;tries++}while(!walkable(px,py)&&tries<30);if(!walkable(px,py))return;
  const n=Math.min(12,5+Math.floor(T/100)+(rnd()*3|0));let guns=en.filter(e=>e.kind===2).length;const gunCap=3+Math.floor(T/120);for(let i=0;i<n;i++){const x=px+(rnd()-.5)*34,y=py+(rnd()-.5)*22;if(!walkable(x,y))continue;let k=0;const r=rnd();
    if(T>120&&r<.1+T/4000&&guns<gunCap){k=2;guns++}else if(T>300&&r<.3+T/4000)k=3;en.push(newE(k,x,y,i*.07))}emit('sfx','spawn')}
function spawnAt(kind,near){let x,y,tries=0;do{const a=rnd()*TAU,r=90+rnd()*40;x=near.x+Math.cos(a)*r;y=near.y+Math.sin(a)*r*.7;tries++}while(!walkable(x,y)&&tries<40);if(!walkable(x,y)){x=220;y=125}const e=newE(kind,x,y);en.push(e);return e}
function targetFor(e){let tgt=null,bd=1e9;for(const c of chars){if(c.state!=='ok')continue;const d=len(c.x-e.x,c.y-e.y);if(d<bd){bd=d;tgt=c}}return tgt}
function bomberBlast(e,killed){emit('sfx','blast');emit('wave',e.x,e.y,.4,46,C.red,4,0);emit('puff',e.x,e.y-6,24,'#ff7a3a',100,.5,true,20,1);emit('big',.15,1.02,.02,4);
  if(!killed)for(const c of chars){if(len(c.x-e.x,(c.y-e.y)*1.4)<32)hurtP(c,22,e.x,e.y,true)}
  for(const o of en){if(o===e||!alive(o))continue;const dx=o.x-e.x,dy=o.y-e.y,d=len(dx,dy*1.4)||1;if(d<34)hitE(o,40,null,{kx:dx/d*160,ky:dy/d*110,col:'#ff7a3a',crit:false})}
  if(!killed){e.dead=true;emit('ink',e.x,e.y,0)}}
function updEnemies(dt){
  for(const e of en){e.t+=dt;e.hit-=dt;e.sq*=Math.pow(.002,dt);e.atkT-=dt;e.flyT-=dt;e.stun-=dt;e.accT=(e.accT||0)-dt;if(e.acc>0&&e.accT<=0){emit('hit',e.x,e.y-8-e.z-(e.accY||0),String(Math.round(e.acc)),WCOL[e.accW]||'#ffffff',e.accW==='lance'?1.35:1.15,-Math.PI/2,WCOL[e.accW]||'#ffffff',0);e.acc=0;e.accT=.3}
    if(e.spawn>0){e.spawn-=dt;continue}
    if(e.frz>0){e.frz-=dt;continue}
    if(e.burn>0){e.burn-=dt;e.burnT-=dt;if(e.burnT<=0){e.burnT=.4;hitE(e,5,null,{col:'#ff7a3a',crit:false})}if(e.dead)continue}
    if(e.z>0||e.vz>0){e.vz-=420*dt;e.z+=e.vz*dt;if(e.z<=0){e.z=0;e.vz=e.vz<-120?-e.vz*.35:0}}
    e.x+=e.kx*dt;e.y+=e.ky*dt;const fr=Math.pow(.015,dt);e.kx*=fr;e.ky*=fr;
    if(!walkable(e.x,e.y)){e.x=clamp(e.x,6,754);if(!walkable(e.x,e.y)){e.x-=e.kx*dt*2;e.y-=e.ky*dt*2;e.kx*=-.3;e.ky*=-.3}if(!walkable(e.x,e.y)){e.x=clamp(e.x,8,750);e.y=clamp(e.y,12,244)}}
    if(dome&&inDome(e.x,e.y)&&e.kind<5){const dx=e.x-dome.x,dy=e.y-dome.y,d=len(dx,dy)||1;e.kx=dx/d*140;e.ky=dy/d*90;if(dome.sanct>0&&(e.burnT||0)<=0){hitE(e,8,null,{col:C.amber,crit:false});e.burnT=.3}}
    const tgt=targetFor(e);if(!tgt||e.hit>0||e.z>0||e.stun>0){if(e.st===1||e.st===3)e.stt-=dt;continue}
    const dx=tgt.x-e.x,dy=tgt.y-e.y,d=len(dx,dy)||1,ux=dx/d,uy=dy/d;e.f=dx>0?1:-1;
    const mv=(sp,vx,vy)=>{const nx=e.x+vx*sp*dt,ny=e.y+vy*sp*.8*dt;if(walkable(nx,ny)&&!(e.kind<5&&inDome(nx,ny))){e.x=nx;e.y=ny}};
    if(e.kind===0||e.kind===1){mv(e.kind?20:30,ux,uy);const reach=e.kind?16:8;if(d<reach&&e.atkT<=0&&!inDome(tgt.x,tgt.y)){e.atkT=e.kind?1.4:.9;hurtP(tgt,e.kind?20:6,e.x,e.y,e.kind===1);e.kx=-ux*60;e.ky=-uy*40}}
    else if(e.kind===2){ // gunman
      if(e.st===0){let m=0;if(d<80)m=-1;else if(d>130)m=1;mv(34,ux*m-uy*e.strafe*.6,uy*m+ux*e.strafe*.6);if(rnd()<dt*.4)e.strafe*=-1;e.cd-=dt;if(e.cd<=0&&d<240){e.st=1;e.stt=.75}}
      else if(e.st===1){e.stt-=dt;if(e.stt>.25){e.ax=ux;e.ay=uy}if(e.stt<=0){const a=Math.atan2(e.ay,e.ax);for(const o of[-.16,0,.16])eb.push({x:e.x+e.ax*8,y:e.y-10,vx:Math.cos(a+o)*150,vy:Math.sin(a+o)*150*.8,life:2.4});emit('sfx','shot');e.st=0;e.cd=2.4+rnd()*1.2}}}
    else if(e.kind===3){ // bomber
      if(e.st===0){mv(46,ux,uy);if(d<22){e.st=2;e.stt=.9;emit('sfx','charge')}}
      else{e.stt-=dt;if(e.stt<=0)bomberBlast(e,false)}}
    else{ // elite / boss
      const big=e.kind===5;
      if(e.st===0){mv(big?16:18,ux,uy);if(d<(big?24:18)&&e.atkT<=0){e.atkT=1.2;hurtP(tgt,big?26:20,e.x,e.y,true)}e.cd-=dt;
        if(e.cd<=0){const r=rnd();if(big&&r<.3){e.st=4;e.stt=.85;e.ax=ux;e.ay=uy;emit('sfx','warn')}else if(big&&r<.5){e.st=0;e.cd=4;for(let i=0;i<2;i++)spawnPack();for(let i=0;i<2;i++)spawnAt(2,e);emit('msg','The Foreman calls the shadows');emit('sfx','warn');emit('big',.1,1.03,0,4)}
          else{e.st=3;e.stt=big?.9:1.05;e.ax=tgt.x;e.ay=tgt.y;emit('sfx','charge')}}}
      else if(e.st===3){e.stt-=dt;if(e.stt<=0){const R=big?44:36;emit('sfx','slam');emit('wave',e.ax,e.ay,.45,R*1.3,C.red,4,0);emit('crack',e.ax,e.ay,C.red);emit('big',.12,1.04,.04,7);for(const c of chars)if(len(c.x-e.ax,(c.y-e.ay)*1.6)<R)hurtP(c,big?30:24,e.ax,e.ay,true);e.st=0;e.cd=big?2.2:3.2}}
      else if(e.st===4){e.stt-=dt;if(e.stt<=0){e.st=5;e.stt=.7}}
      else if(e.st===5){e.stt-=dt;const nx=e.x+e.ax*260*dt,ny=e.y+e.ay*210*dt;if(walkable(nx,ny)){e.x=nx;e.y=ny}else e.stt=0;if(rnd()<.6)emit('puff',e.x,e.y,2,'#3a3660',40,.4,false,10,2);
        for(const c of chars)if(len(c.x-e.x,(c.y-e.y)*1.4)<26)hurtP(c,28,e.x,e.y,true);if(e.stt<=0){e.st=0;e.cd=1.8}}}}
  // separation
  for(let i=0;i<en.length;i++){const a=en[i];if(!alive(a))continue;for(let j=i+1;j<en.length;j++){const b=en[j];if(!alive(b))continue;const dx=b.x-a.x,dy=b.y-a.y,d=len(dx,dy),m=Math.max(rad(a),rad(b));if(d<m&&d>0){const p=(m-d)/2/d,wa=a.kind>=4?.1:1,wb=b.kind>=4?.1:1;a.x-=dx*p*wa;a.y-=dy*p*wa;b.x+=dx*p*wb;b.y+=dy*p*wb}}}
  en=en.filter(e=>!e.dead);
  // enemy bullets
  for(const b of eb){b.x+=b.vx*dt;b.y+=b.vy*dt;b.life-=dt;
    if(dome&&inDome(b.x,b.y+10)){b.life=0;emit('puff',b.x,b.y,5,C.cyan,50,.3,true,0,1);const ow=dome.owner;if(ow&&ow.mods.has('mirror'))proj.push({k:'refl',x:b.x,y:b.y,vx:-b.vx*1.5,vy:-b.vy*1.5,life:1.2,hit:new Set(),dmg:25,src:ow});continue}
    for(const c of chars){if(c.state!=='ok')continue;if(len(c.x-b.x,(c.y-12-b.y)*1.3)<8){b.life=0;hurtP(c,8,b.x,b.y,false);break}}
    if(!walkable(b.x,b.y+10)&&b.life<2)b.life=Math.min(b.life,.2)}
  eb=eb.filter(b=>b.life>0)}
function rad(e){return [8,16,9,9,22,30][e.kind]}

/* ================= host: run flow ================= */
function hostStep(dt){
  T+=dt;for(const l of later)l.t-=dt;const due=later.filter(l=>l.t<=0);later=later.filter(l=>l.t>0);for(const l of due)l.f();
  for(const c of chars){if(c.idx!==ME){c.hit-=dt;c.pow-=dt;c.pose-=dt;if(solo){c.cd1=Math.max(0,c.cd1-dt);c.cd2=Math.max(0,c.cd2-dt)}}
    if(c.state!=='ok'){c.cast=null;c.atk=0;c.beams=[];c.lance=null;c.ch=0;c.ww=0;c.bs=0;continue}
    if(c.lance)updLance(c,dt);if(c.ch>0){c.ch-=dt;c.beams=[];c.lit=Math.max(0,(c.lit||0)-dt);continue}c.lit=Math.max(0,(c.lit||0)-dt);
    if(c.cast){c.beams=[];c.cast.t+=dt;if(c.cast.t>=c.cast.dur)release(c)}else runWeapons(c,dt);updFury(c,dt);
    if(c.dash>0&&c.hitSet)for(const e of en){if(!alive(e)||c.hitSet.has(e))continue;if(len(e.x-c.x,(e.y-c.y)*1.4)<16+rad(e)*.5){c.hitSet.add(e);hitE(e,30,c,{kx:c.dx*240,ky:c.dy*170,up:130,col:C.cyan,dir:Math.atan2(c.dy,c.dx)});emit('sfx','hit',1);emit('shake',c.dx,c.dy,2.5,c.idx)}}
    if(c.fireT>0&&c.dash>0){c.fireT-=dt;if(rnd()<.5)zones.push({x:c.x,y:c.y,r:12,life:2.5,tick:0,dmg:6,src:c,col:'#ff7a3a'})}}
  updPlayers(dt);
  // spawns
  const busy=en.length;packT-=dt;if(packT<=0&&busy<70){packT=Math.max(1.1,2.4-T/400)*(bossSpawned?1.6:1);spawnPack()}
  if(T>60){bruteT-=dt;if(bruteT<=0){bruteT=Math.max(10,20-T/60);spawnAt(1,chars[0])}}
  for(let i=0;i<EVENTS.length;i++){const ev=EVENTS[i];if(T>=ev.t&&!evDone[i]&&!LV&&!endState){evDone[i]=1;startLevel(ev.k);return}}
  for(let i=0;i<ELITE_T.length;i++)if(T>=ELITE_T[i]-3&&!dangerDone[i]){dangerDone[i]=1;emit('danger','DANGER','A Gatekeeper is coming')}
  if(T>=BOSS_T-3&&!dangerDone[9]){dangerDone[9]=1;emit('danger','BOSS','The Foreman approaches')}
  for(let i=0;i<ELITE_T.length;i++)if(T>=ELITE_T[i]&&!eliteDone[i]){eliteDone[i]=1;const n=i+1;for(let k=0;k<n;k++)spawnAt(4,chars[k%chars.length]);emit('msg',n>1?'Two Gatekeepers rise':'A Gatekeeper rises');emit('sfx','warn')}
  if(T>=BOSS_T&&!bossSpawned){bossSpawned=true;boss=spawnAt(5,chars[0]);emit('msg','THE FOREMAN');emit('sfx','warn');emit('big',.3,1.06,0,10)}
  updEnemies(dt);updProj(dt);
  if(dome){dome.t+=dt;if(dome.sanct>0)dome.sanct-=dt;if(dome.t>=dome.life){emit('puff',dome.x,dome.y-14,24,C.cyan,70,.5,true,0,1);dome=null}}
  // gems
  for(const g of gems){g.hold-=dt;let best=null,bd=1e9;for(const c of chars){if(c.state!=='ok')continue;const d=len(c.x-g.x,c.y-g.y);if(d<bd){bd=d;best=c}}
    if(best&&g.hold<=0&&(bd<36*best.st.mag||g.pull)){g.pull=1;const dx=best.x-g.x,dy=best.y-6-g.y,d=len(dx,dy)||1;const sp=60+(g.sp=(g.sp||0)+dt*400);g.x+=dx/d*Math.min(sp,320)*dt;g.y+=dy/d*Math.min(sp,320)*dt;if(d<6){g.got=1;xp+=g.v;emit('gem')}}}
  gems=gems.filter(g=>!g.got);if(gems.length>160){const extra=gems.splice(0,gems.length-160);for(const g of extra)xp+=g.v}
  if(!LV&&xp>=need(level)&&!endState)startLevel()}
function endRun(win){if(endState)return;endState={win,T:Math.floor(T),level,kills};showEnd()}
function showEnd(){const s=endState;go('end');$('endEye').textContent=s.win?'The city breathes again':'The fog wins tonight';$('endTitle').textContent=s.win?'Rooftops cleared':'Lost to the fog';
  const tt=s.T;$('endStats').innerHTML=`<span>Time</span><b>${String(Math.floor(tt/60)).padStart(2,'0')}:${String(tt%60).padStart(2,'0')}</b><span>Level</span><b>${s.level}</b><span>Shadows cleared</span><b>${s.kills}</b>`;
  $('bAgain').hidden=!isHost;$('endNote').textContent=isHost?'':'Waiting for the host to start another run.';if(s.win)SFX.win()}

/* ================= level-ups ================= */
function genOffers(c){const pool=[];
  const own=new Map(c.weapons.map(w=>[w.id,w]));
  for(const [k,d] of Object.entries(WDEF)){if(d.cls!==c.cls)continue;const w=own.get(k);
    if(w){if(w.lv<5)pool.push({id:'w:'+k,t:w.lv===4?'evo':'up',wt:3})}else if(c.weapons.length<4)pool.push({id:'w:'+k,t:'new',wt:2.6})}
  for(const [k,d] of Object.entries(MODS))if(d.cls===c.cls&&!c.mods.has(k))pool.push({id:'m:'+k,t:'mod',wt:1.1});
  for(const k of Object.keys(STATS))if(!(k==='cdr'&&c.st.cdr>=.48))pool.push({id:'s:'+k,t:'stat',wt:.9});
  if(chars.length>1)for(const k of Object.keys(PAIRS))if(!teamMods.has(k))pool.push({id:'p:'+k,t:'pair',wt:.55});
  const out=[];while(out.length<3&&pool.length){let sum=pool.reduce((a,p)=>a+p.wt,0),r=rnd()*sum,i=0;for(;i<pool.length;i++){r-=pool[i].wt;if(r<=0)break}out.push(pool.splice(Math.min(i,pool.length-1),1)[0])}
  return out.map(o=>cardInfo(c,o))}
function cardInfo(c,o){const [kind,k]=o.id.split(':');
  if(kind==='w'){const d=WDEF[k],w=c.weapons.find(x=>x.id===k);if(!w)return{id:o.id,t:'new',tag:'New attack',name:d.name,desc:d.desc};
    if(w.lv===4)return{id:o.id,t:'evo',tag:'Evolution',name:d.evo,desc:d.evoD};return{id:o.id,t:'up',tag:'Level '+(w.lv+1),name:d.name,desc:upText(k,w.lv+1)}}
  if(kind==='m')return{id:o.id,t:'mod',tag:'Skill change',name:MODS[k].name,desc:MODS[k].desc};
  if(kind==='s')return{id:o.id,t:'stat',tag:'Stat',name:STATS[k].name,desc:STATS[k].desc};
  return{id:o.id,t:'pair',tag:'Pair · both of you',name:PAIRS[k].name,desc:PAIRS[k].desc}}
function applyCard(c,id){const [kind,k]=id.split(':');
  if(kind==='w'){const w=c.weapons.find(x=>x.id===k);if(w)w.lv=Math.min(5,w.lv+1);else c.weapons.push({id:k,lv:1,cd:.5})}
  else if(kind==='m')c.mods.add(k);
  else if(kind==='s'){if(k==='hp'){const add=c.max*.2;c.max+=add;c.hp+=add+20;c.hp=Math.min(c.hp,c.max)}else if(k==='dmg')c.st.dmg+=.15;else if(k==='spd')c.st.spd+=.1;else if(k==='cdr')c.st.cdr=Math.min(.5,c.st.cdr+.08);else if(k==='mag')c.st.mag+=.5}
  else if(kind==='g'){if(k==='maxhp'){const add=c.max*.25;c.max+=add;c.hp+=add}else if(k==='heal')c.hp=Math.min(c.max,c.hp+c.max*.6);else if(k==='power')c.st.dmg+=.12}
  else if(kind==='b'){if(k==='pact'){c.max*=.8;c.hp=Math.min(c.hp,c.max);const w3=id.split(':')[2];const w=c.weapons.find(x=>x.id===w3);if(w)w.lv=Math.min(5,w.lv+2);else c.st.dmg+=.3}}
  else teamMods.add(k)}
function museOffers(){const all=[{id:'g:maxhp',t:'gift',tag:'Gift',name:'Strong Heart',desc:'+25% max health.'},{id:'g:heal',t:'gift',tag:'Gift',name:'Restoration',desc:'Restore 60% of your health now.'},{id:'g:power',t:'gift',tag:'Gift',name:'Spotlight',desc:'+12% damage for the rest of the run.'}];
  all.sort(()=>rnd()-.5);return all.slice(0,2)}
function brokerOffers(c){const own=c.weapons.filter(w=>w.lv<5);let r;
  if(own.length){const w=own[(rnd()*own.length)|0],to=Math.min(5,w.lv+2);r={id:'b:pact:'+w.id,t:'pact',tag:'Pact',name:WDEF[w.id].name+' +2',desc:(to>=5?'Jumps straight to its evolution, '+WDEF[w.id].evo+'.':'Two levels at once, to level '+to+'.')+' <span class="cost">Costs 20% max health</span>'}}
  else r={id:'b:pact:none',t:'pact',tag:'Pact',name:'Blood Edge',desc:'+30% damage. <span class="cost">Costs 20% max health</span>'};
  return[r,{id:'b:decline',t:'none',tag:'Pass',name:'Walk away',desc:'Keep your health. No deal.'}]}
function startLevel(kind){kind=kind||'lvl';LV={id:++lid,kind,offers:{},picked:{},names:{}};for(const c of chars)LV.offers[c.idx]=kind==='muse'?museOffers():kind==='broker'?brokerOffers(c):genOffers(c);emit('sfx','level');emit('big',.25,1.03,0,0);
  showOffers();if(solo){const b=chars.find(c=>c.idx!==ME);if(b)setTimeout(()=>{if(LV&&!LV.picked[b.idx]){const o=LV.offers[b.idx];applyPick(b.idx,kind==='broker'?0:(rnd()*o.length)|0)}},1700)}}
function oldStartLevelUnused(){LV={id:++lid,offers:{},picked:{},names:{}};for(const c of chars)LV.offers[c.idx]=genOffers(c);emit('sfx','level');emit('big',.25,1.03,0,0);
  showOffers();if(solo){const b=chars.find(c=>c.idx!==ME);if(b)later.push({t:0,f:()=>{}}),setTimeout(()=>{if(LV&&!LV.picked[b.idx]){const o=LV.offers[b.idx];applyPick(b.idx,(rnd()*o.length)|0)}},700)}}
function applyPick(ci,i){if(!LV||LV.picked[ci])return;const c=chars.find(q=>q.idx===ci),card=LV.offers[ci]&&LV.offers[ci][i];if(!c||!card)return;applyCard(c,card.id);LV.picked[ci]=1;LV.names[ci]=card.name;{const [kd,kk,k3]=card.id.split(':');const col=kd==='w'?WCOL[kk]:kd==='m'?C.cyan:kd==='p'?C.pink:kd==='b'?'#ff6a7e':kd==='g'?'#ff9ad5':C.heal;const wid=kd==='w'?kk:kd==='b'?k3:null;if(wid){const w=c.weapons.find(x=>x.id===wid);if(w)w.cd=0}const tag=card.t==='new'?'New attack learned':card.t==='evo'?'Evolved':card.tag;if(card.id!=='b:decline')emit('learn',ci,tag,card.name,card.desc.replace(/<[^>]+>/g,''),col)}
  if(ci===ME)SFX.pick();showOffers();
  if(chars.every(q=>LV.picked[q.idx])){if(LV.kind==='lvl'||!LV.kind){xp-=need(level);level++}LV=null;closeLevel();setHud();if(xp>=need(level))later.push({t:.4,f:()=>{if(!LV&&!endState)startLevel()}})}}
let shownLV=-1,cerT=[];
const RAR={up:'common',stat:'common',new:'rare',mod:'epic',pair:'legend',evo:'legend',gift:'gift',pact:'pact',none:'none'};
function iconFor(id){const p=id.split(':');const key=p[0]==='g'?'g_'+p[1]:p[0]==='b'?(p[1]==='decline'?'b_decline':'b_pact'):p[1];return (window.DD_ICONS||{})[key]||''}
function closeLevel(){for(const t of cerT){clearTimeout(t);clearInterval(t)}cerT=[];$('sLevel').classList.remove('go','dim');if(mode==='pick')go('play')}
function showOffers(){if(!LV){closeLevel();return}const mine=LV.offers[ME];if(!mine)return;
  if(mode!=='pick')go('pick');const box=$('offers'),sl=$('sLevel');
  if(shownLV!==LV.id){shownLV=LV.id;for(const t of cerT){clearTimeout(t);clearInterval(t)}cerT=[];
    const kind=LV.kind||'lvl',ban=$('lvlBan');ban.className='lvban'+(kind==='muse'?' muse':kind==='broker'?' broker':'');
    ban.textContent=kind==='muse'?'The Muse sings':kind==='broker'?'The Broker deals':'Level Up';
    $('lvlSub').innerHTML=kind==='muse'?'She offers you a gift. Choose one.':kind==='broker'?'Make a deal? Lose <b>20% max health</b> to get:':'Level '+(level+1)+' · choose a new skill';
    sl.classList.remove('go','dim');void sl.offsetWidth;sl.classList.add('dim');cerT.push(setTimeout(()=>sl.classList.add('go'),140));
    box.className='offers';box.innerHTML='';const icons=Object.values(window.DD_ICONS||{});
    mine.forEach((cd,i)=>{const r=RAR[cd.t]||'common',b=document.createElement('button');b.className='pick r-'+r+' rolling';b.disabled=true;
      b.innerHTML=`<span class="pillar"></span><span class="rar">${cd.tag}</span><span class="nm">${cd.name}</span><span class="ic"><img alt=""></span><span class="d">${cd.desc}</span>`;
      const img=b.querySelector('img');let k=(i*7)%Math.max(1,icons.length);img.src=icons[k]||'';
      cerT.push(setTimeout(()=>{b.classList.add('show');SFX.tick();const roll=setInterval(()=>{img.src=icons[(k++)%icons.length]||''},65);cerT.push(roll);
        cerT.push(setTimeout(()=>{clearInterval(roll);img.src=iconFor(cd.id);b.classList.remove('rolling');b.classList.add('landed');SFX.land(i)},420+i*240))},300+i*120));
      cerT.push(setTimeout(()=>{b.classList.add('open');b.disabled=false;if(i===0)b.focus({preventScroll:true})},300+mine.length*120+420+mine.length*240+80));
      b.addEventListener('click',()=>{if(LV&&LV.picked&&LV.picked[ME])return;audioInit();b.classList.add('chosen');box.classList.add('locked');if(isHost)applyPick(ME,i);else{send({t:'pk',id:LV.id,i});LV.picked=LV.picked||{};LV.picked[ME]=1;SFX.pick();showOffers()}});box.appendChild(b)})}
  const m=mateC();let t='';if(m){const nm=solo?'Bot':'Partner';t=LV.picked&&LV.picked[m.idx]?nm+' chose '+(LV.names&&LV.names[m.idx]||'an upgrade'):nm+' is choosing…'}
  if(LV.picked&&LV.picked[ME]&&!(m&&LV.picked[m.idx]))t=(m?((solo?'Bot':'Partner')+' is choosing…'):'');$('mateChoice').textContent=t}

/* ================= movement (each device moves its own character) ================= */
function tryMove(c,dx,dy){if(walkable(c.x+dx,c.y))c.x+=dx;if(walkable(c.x,c.y+dy))c.y+=dy}
function moveChar(c,ix,iy,dt){const D=CL[c.cls];
  if(c.state!=='ok'){c.vx=c.vy=0;c.moving=false;c.dash=0;c.leap=null;c.z=0;return}
  if(c.leap){const Lp=c.leap;Lp.t+=dt;const k=Math.min(1,Lp.t/Lp.dur),e2=1-(1-k)*(1-k);c.x=Lp.x0+(Lp.x1-Lp.x0)*e2;c.y=Lp.y0+(Lp.y1-Lp.y0)*e2;c.z=Math.sin(Math.PI*k)*32;c.moving=true;c.vx=c.vy=0;
    if(rnd()<.8)parts.push({x:c.x+(rnd()-.5)*8,y:c.y-c.z-10-rnd()*14,vx:-(Lp.x1-Lp.x0)*.6,vy:-(Lp.y1-Lp.y0)*.6,life:.22,max:.22,col:C.cyan,em:true,streak:1});
    if(k>=1){c.leap=null;c.z=0;c.sq=.4;c.tx=c.x;c.ty=c.y}return}
  if(c.cast||c.ch>0){c.vx*=.8;c.vy*=.8;c.moving=false;return}
  if(c.dash>0){c.dash-=dt;tryMove(c,c.dx*260*dt,c.dy*230*dt);c.moving=true;if(c.dash<=0){c.sq=.25;puff(c.x,c.y,8,'#3a3660',40,.4,false,10,2)}return}
  const sp=D.spd*c.st.spd*(c.bs>0?.8:c.ww>0?.9:1),k=1;c.vx+=(ix*sp-c.vx)*k;c.vy+=(iy*sp*.85-c.vy)*k;tryMove(c,c.vx*dt,c.vy*dt);
  c.moving=len(ix,iy)>.15;if(Math.abs(ix)>.15&&c.atk<=0)c.f=ix>0?1:-1;if(c.moving){c.mx=ix;c.my=iy}}
function bot(c,dt){if(c.state!=='ok'){moveChar(c,0,0,dt);return}const lead=meC();let tx=lead.x-lead.f*20,ty=lead.y+6;
  if(lead.state==='down'){tx=lead.x+8;ty=lead.y}else if(dome){tx=dome.x+(c.cls==='lamp'?-12:12);ty=dome.y+3}
  const dx=tx-c.x,dy=ty-c.y,d=len(dx,dy);let ix=0,iy=0;if(d>6){ix=dx/d;iy=dy/d;if(d<22){ix*=.5;iy*=.5}}moveChar(c,ix,iy,dt);
  if(c.cd2<=0&&!c.cast){if(c.cls==='lamp'&&(countNear(c,160)>=7||dome||lead.hp<lead.max*.45)){skill2(c,false,autoAim(c))}
    else if(c.cls==='warden'&&(countNear(c,60)>=9||(lead.hp<lead.max*.35&&lead.state==='ok')))skill2(c)}
  if(c.cls==='warden'&&c.rage>=100&&countNear(c,60)>=6)skill1(c);
  else if(c.cd1<=0&&c.cls==='warden'&&countNear(c,70)>=5&&rnd()<dt*1.5){let bx=0,by=0,nn=0;for(const e of en)if(alive(e)&&len(e.x-c.x,e.y-c.y)<90){bx+=e.x;by+=e.y;nn++}if(nn){c.mx=bx/nn-c.x;c.my=by/nn-c.y;skill1(c)}}}

/* ================= sync ================= */
let snapT=0,inT=0;
const PK={mote:0,moth:1,shield:2,blade:3,candle:4,refl:5,lbolt:6};
function snapshot(){
  const PR=proj.map(p=>[PK[p.k],r1(p.x),r1(p.y),p.k==='blade'||p.k==='lbolt'?r2(p.a):p.k==='candle'?r2(p.fuse):0,p.k==='lbolt'?(p.child?0:Math.round(1+p.heat*4)):(p.lv||1)]);
  for(const c of chars)if(c.flyPos)for(const f of c.flyPos)PR.push([9,r1(f[0]),r1(f[1]),0,c.flyLv||1]);
  send({t:'s',T:r1(T),lv:level,xp:r1(xp),k:kills,tth:tether,bd:r2(bond),BM:chars.flatMap(c=>(c.beams||[]).map(b=>b.map(r1))),LA:chars.filter(c=>c.lance).map(c=>{const L=c.lance;return[r1(L.sx||c.x),r1(L.sy||c.y),r2(L.dx),r2(L.dy),r2(L.t),r2(L.dur),L.refr?1:0,L.wide]}),
    C:chars.map(c=>[c.ch>0?r2(c.ch):0,r2(c.aim?c.aim[0]:(c.mx||0)),r2(c.aim?c.aim[1]:(c.my||0)),c.idx,r1(c.x),r1(c.y),c.f,r2(Math.max(0,c.atk)),r2(c.atkDur),c.heavy|0,r2(c.adir),r2(Math.max(0,c.pow)),c.cast?(c.cast.k==='dome'?1:2):0,c.cast?r2(c.cast.t):0,c.cast?r2(c.cast.dur):0,c.dash>0?1:0,r2(Math.max(0,c.hit)),r1(c.hp),r1(c.max),c.state,r2(c.rev),r1(c.down),c.tp||0,Math.round(c.rage||0),r2(Math.max(0,c.enr||0)),r2(Math.max(0,c.ww||0)),r2(Math.max(0,c.bs||0)),r1(c.z||0)]),
    K:chars.map(c=>[c.idx,c.weapons.map(w=>[w.id,w.lv,r2(wFrac(w))]),[...c.mods],c.st.spd,r2(c.st.dmg),r2(c.st.cdr),r2(c.st.mag)]),
    E:en.map(e=>[e.id,e.kind,r1(e.x),r1(e.y),r1(e.z),r2(Math.max(0,e.hp)/e.max),e.hit>0?1:0,r2(Math.max(0,e.spawn)),e.f,r2(e.sq),e.st,r2(e.stt),r1(e.ax),r1(e.ay),e.burn>0?1:0]),
    B:eb.map(b=>[r1(b.x),r1(b.y),Math.round(b.vx),Math.round(b.vy)]),PR,G:gems.map(g=>[r1(g.x),r1(g.y),g.v>=5?1:0]),Z:zones.map(z=>[r1(z.x),r1(z.y),r1(z.r),z.col===C.cyan?0:1]),
    D:dome?[r1(dome.x),r1(dome.y),r2(dome.t),r2(dome.life),r2(Math.max(0,dome.sanct))]:0,PL:pools.map(p=>[r1(p.x),r1(p.y),r2(p.life)]),
    LV:LV?{id:LV.id,k:LV.kind,o:LV.offers[1],p:LV.picked,n:LV.names}:0,TM:[...teamMods],END:endState||0,fx:fxQ});fxQ=[]}
function onGuestInput(m){const c=chars.find(q=>q.idx===1);if(!c)return;
  if(!c.cast&&c.state==='ok'){c.tx=m.x;c.ty=m.y;pushHist(c,m.x,m.y)}if(c.atk<=0)c.f=m.f;c.moving=!!m.mv;c.mx=m.mx;c.my=m.my;c.dash=m.da?.1:0;c.z=m.z||0;
  for(const ev of m.ev){if(c.state!=='ok')break;if(ev[0]==='leap'){local('sfx','dash');hostLeap(c,ev[1],ev[2])}else if(ev[0]==='bs'){if(c.rage>=95)startStorm(c);else c.bs=0}else if(ev[0]==='step'){local('star',ev[1],ev[2]-14,C.amber);local('star',ev[3],ev[4]-14,C.amber);local('starburst',ev[3],ev[4]-14);local('sfx','step');stepEffect(c,ev[1],ev[2])}else if(ev[0]==='s2'){skill2(c,true,ev.length>2?[ev[1],ev[2]]:null)}}}
let PRg=[],flyG=[],beamsG=[],lancesG=[];
function onSnap(s){T=s.T;level=s.lv;xp=s.xp;kills=s.k;tether=s.tth;bond=s.bd??bond;beamsG=s.BM||[];lancesG=(s.LA||[]).map(a=>({sx:a[0],sy:a[1],dx:a[2],dy:a[3],t:a[4],dur:a[5],refr:a[6],wide:a[7]}));
  for(const q of s.C){const [ch,amx,amy,idx,x,y,f,atk,atkDur,heavy,adir,pow,ck,ct,cd,da,hit,hp,max,state,rev,down,tp,rage,enr,ww,bs,cz]=q;const c=chars.find(z=>z.idx===idx);if(!c)continue;
    c.atk=atk;c.atkDur=atkDur;c.heavy=heavy;c.rage=rage||0;c.enr=enr||0;c.ww=ww||0;if(idx!==ME){c.bs=bs||0;c.z=cz||0}else if(bs>0&&!(c.bs>0))c.bs=bs;c.adir=adir;c.pow=pow;if(idx!==ME||ck||!c.cast||c.cast.t>.7)c.cast=ck?{k:ck===1?'dome':'lance',t:ct,dur:cd}:null;c.ch=ch;if(idx!==ME){c.mx=amx;c.my=amy;c.aim=ck===2?[amx,amy]:null}if(atk>0)c.f=f;c.hp=hp;c.max=max;c.state=state;c.rev=rev;c.down=down;
    if(idx!==ME){c.tx=x;c.ty=y;pushHist(c,x,y);c.f=f;c.dash=da?.1:0;c.hit=Math.max(c.hit,hit)}else if(tp!==(c.tp||0)){c.tp=tp;c.x=x;c.y=y}}
  for(const [idx,ws,mods,spd,dmg,cdr,mag] of s.K){const c=chars.find(z=>z.idx===idx);if(!c)continue;c.weapons=ws.map(([id,lv,fr])=>({id,lv,cd:0,fr}));c.mods=new Set(mods);c.st.spd=spd;c.st.dmg=dmg??1;c.st.cdr=cdr??0;c.st.mag=mag??1}
  const seen=new Set();for(const q of s.E){const [id,kind,x,y,z,hpf,hit,spawn,f,sq,st,stt,ax,ay,burn]=q;seen.add(id);let e=en.find(z=>z.id===id);if(!e){e=newE(kind,x,y);e.id=id;en.push(e)}
    e.tx=x;e.ty=y;pushHist(e,x,y);e.z=z;e.hp=hpf*e.max;e.hit=hit?.1:0;e.spawn=spawn;e.f=f;e.sq=sq;e.st=st;e.stt=stt;e.ax=ax;e.ay=ay;e.burn=burn}
  en=en.filter(e=>seen.has(e.id));boss=en.find(e=>e.kind===5)||null;
  eb=s.B.map(b=>({x:b[0],y:b[1],vx:b[2],vy:b[3]}));
  proj=[];flyG=[];const kinds=Object.keys(PK);for(const p of s.PR){if(p[0]===9)flyG.push([p[1],p[2],p[4]]);else proj.push({k:kinds[p[0]],x:p[1],y:p[2],a:p[3],fuse:p[3],lv:p[4]})}
  gems=s.G.map(g=>({x:g[0],y:g[1],v:g[2]?5:1}));zones=s.Z.map(z=>({x:z[0],y:z[1],r:z[2],col:z[3]?'#ff7a3a':C.cyan}));
  dome=s.D?{x:s.D[0],y:s.D[1],t:s.D[2],life:s.D[3],sanct:s.D[4]}:null;pools=s.PL.map(p=>({x:p[0],y:p[1],life:p[2]}));
  for(const [k,a] of s.fx)if(FXF[k])FXF[k](...a);
  if(s.TM)teamMods=new Set(s.TM);if(s.LV){if(!LV||LV.id!==s.LV.id){LV={id:s.LV.id,kind:s.LV.k,offers:{1:s.LV.o},picked:{},names:{}};SFX.level()}LV.names=s.LV.n||{};for(const k in s.LV.p)LV.picked[k]=1;if(mode!=='end')showOffers()}
  else if(LV){LV=null;if(mode==='pick')go('play');setHud()}
  if(s.END&&!endState){endState=s.END;showEnd()}else if(!s.END&&endState){endState=null;go('play')}}
function interp(h,t){if(!h||!h.length)return null;if(t<=h[0][0])return h[0];for(let i=h.length-1;i>=0;i--){if(h[i][0]<=t){if(i===h.length-1)return h[i];const a=h[i],b=h[i+1],k=(t-a[0])/((b[0]-a[0])||1);return[t,a[1]+(b[1]-a[1])*k,a[2]+(b[2]-a[2])*k]}}return h[0]}
function pushHist(o,x,y){const now=performance.now();if(!o.hist)o.hist=[];const l=o.hist[o.hist.length-1];if(l&&len(l[1]-x,l[2]-y)>90)o.hist=[];o.hist.push([now,x,y]);if(o.hist.length>6)o.hist.shift()}
const IDELAY=100;
function guestStep(dt){const now=performance.now();for(const e of en){if(e.tx===undefined)continue;const p=interp(e.hist,now-IDELAY);if(p){e.x=p[1];e.y=p[2]}else{const k=Math.min(1,dt*14);e.x+=(e.tx-e.x)*k;e.y+=(e.ty-e.y)*k}e.t+=dt;e.hit-=dt;if(e.spawn>0)e.spawn-=dt;if(e.st)e.stt-=dt}
  for(const c of chars){if(c.atk>0)c.atk-=dt;if(c.cast)c.cast.t+=dt;c.pow-=dt;if(c.idx!==ME)c.hit-=dt;if(c.ww>0)c.ww-=dt;if(c.bs>0)c.bs-=dt;if(c.enr>0)c.enr-=dt}
  for(const b of eb){b.x+=b.vx*dt;b.y+=b.vy*dt}
  if(dome)dome.t+=dt}

/* ================= main update ================= */
function update(dt){tAll+=dt;if(msgT>0){msgT-=dt;if(msgT<=0)$('msg').style.opacity=0}
  for(const d of dn)d.t+=dt;dn=dn.filter(d=>d.t<.8);for(const b of banners)b.t+=dt;banners=banners.filter(b=>b.t<2.4);tintA=Math.max(0,tintA-dt*1.2);
  if(learnQ&&mode==='play'){const q=learnQ;learnQ=null;$('learnT').textContent=q.tag.toUpperCase();$('learnN').textContent=q.name;$('learnN').style.color=q.col;$('learnD').textContent=q.desc;$('learn').classList.add('on');learnT=3}
  if(learnT>0){learnT-=dt;if(learnT<=0)$('learn').classList.remove('on')}
  const paused=!!LV||!!endState;
  const me=meC();if(!me)return;
  if(hitstop>0&&!paused){hitstop-=dt;const [hx,hy]=readMove();moveChar(me,hx,hy,dt);cam.x=me.x;cam.y=me.y-16;render();return}
  if(edge.swap&&solo&&!paused){ME=1-ME;setHud()}
  if(!paused){if(edge.s1)skill1(me);if(edge.s2){if(solo&&me.cls==='lamp'){const m2=mateC();if(m2&&m2.cd2<=0&&!dome&&!m2.cast&&m2.state==='ok'&&len(m2.x-me.x,m2.y-me.y)<70)skill2(m2)}skill2(me,false,me.cls==='lamp'?(edge.aim||mouseAim(me)):null)}}edge.aim=null;
  edge.s1=edge.s2=edge.swap=false;
  if(!paused){const [ix,iy]=readMove();moveChar(me,ix,iy,dt);me.cd1=Math.max(0,me.cd1-dt);me.cd2=Math.max(0,me.cd2-dt);me.hit-=dt;me.pose-=dt;if(isHost)me.pow-=dt;
    if(solo){const b=mateC();if(b)bot(b,dt)}
    if(isHost)hostStep(FAST?dt*1:dt);else guestStep(dt)}
  else if(isHost&&LV){for(const l of later)l.t-=dt;const due=later.filter(l=>l.t<=0);later=later.filter(l=>l.t>0);for(const l of due)l.f()}
  // shared visuals
  for(const c of chars){c.t+=dt;if(c.shootT>0)c.shootT-=dt;if(c.landT>0)c.landT-=dt;c.sq*=Math.pow(.0004,dt);if(c.rx){const k=Math.pow(.0005,dt);c.rx*=k;c.ry*=k;if(Math.abs(c.rx)<.05)c.rx=c.ry=0}if(c.blink>0)c.blink-=dt;else if(rnd()<dt*.35)c.blink=.12;
    const remote=!(c.idx===ME||(solo&&isHost));
    if(remote){const p=interp(c.hist,performance.now()-IDELAY);if(p&&!(c.lance)){c.x=p[1];c.y=p[2]}else{const k=Math.min(1,dt*16);c.x+=(c.tx-c.x)*k;c.y+=(c.ty-c.y)*k}if(len(c.tx-c.x,c.ty-c.y)>120){c.x=c.tx;c.y=c.ty;c.hist=[]}const sp=len(c.x-c.px,c.y-c.py)/Math.max(dt,1e-3);c.moving=sp>8;c.vx=(c.x-c.px)/Math.max(dt,1e-3)}
    if(c.moving&&!paused){const w0=c.walk;c.walk+=dt*(c.cls==='lamp'?2.2:1.9);if(c.cls==='lamp'&&Math.floor(c.walk)!==Math.floor(w0)){c.sq=-.2;puff(c.x,c.y,3,'#3a3660',22,.3,false,4,1);for(let i=0;i<3&&parts.length<500;i++){const a=-Math.PI/2+(rnd()-.5)*2;parts.push({x:c.x+(rnd()-.5)*8,y:c.y-2,vx:Math.cos(a)*30,vy:Math.sin(a)*30,life:.45,max:.45,col:rnd()<.5?'#ff6fb4':C.amber,em:true,star:3})}}}c.px=c.x;c.py=c.y;if(c.cls==='lamp'&&!paused){updHair(c,dt);lampWhimsy(c,dt)}
    if(c.dash>0&&rnd()<.9)ghosts.push({c,x:c.x,y:c.y,f:c.f,life:.2,col:C.cyan});
    if(c.moving&&rnd()<dt*6)parts.push({x:c.x-c.f*3,y:c.y,vx:-c.f*8,vy:-6,life:.35,max:.35,col:'#3a3660',sz:1});
    c.swv+=(-c.sw*40-c.vx*.06-c.swv*3)*dt;c.sw+=c.swv*dt;
    if(c.cast&&rnd()<.9){const col=c.cls==='warden'?C.cyan:C.amber,a=rnd()*TAU,r=34+rnd()*12;parts.push({x:c.x+Math.cos(a)*r,y:c.y-14+Math.sin(a)*r*.6,vx:-Math.cos(a)*r*2.6,vy:-Math.sin(a)*r*1.6,life:.36,max:.36,col,em:true,streak:1})}
    if(c.state==='down'&&rnd()<dt*4)parts.push({x:c.x+(rnd()-.5)*10,y:c.y-4,vx:0,vy:-10,life:.6,max:.6,col:C.red,em:true})}
  if(!paused){
    if(dome&&dome.sanct>0&&rnd()<.35)parts.push({x:dome.x+(rnd()-.5)*70,y:dome.y-rnd()*30,vx:0,vy:-22,life:.5,max:.5,col:C.amber,em:true});
    for(const p of pools)if(rnd()<dt*14)parts.push({x:p.x+(rnd()-.5)*30,y:p.y+(rnd()-.5)*10,vx:0,vy:-16,life:.7,max:.7,col:C.amber,em:true});
    for(const p of proj){if((p.k==='mote'||p.k==='moth')&&rnd()<.8)parts.push({x:p.x,y:p.y,vx:0,vy:0,life:.2,max:.2,col:C.amber,em:true});if(p.k==='blade'&&rnd()<.8)parts.push({x:p.x,y:p.y,vx:0,vy:0,life:.15,max:.15,col:C.cyan,em:true})}
    for(const z of zones)if(rnd()<dt*12)parts.push({x:z.x+(rnd()-.5)*z.r*2,y:z.y+(rnd()-.5)*z.r*.8,vx:0,vy:-24,life:.45,max:.45,col:z.col===C.cyan?C.cyan:'#ff7a3a',em:true});
    for(const e of en)if(e.burn&&rnd()<dt*8)parts.push({x:e.x+(rnd()-.5)*8,y:e.y-6-e.z,vx:0,vy:-26,life:.4,max:.4,col:rnd()<.5?C.amber:'#ff7a3a',em:true});
    for(const p of parts){p.x+=p.vx*dt;p.y+=p.vy*dt;if(p.grav)p.vy+=260*dt;else{p.vx*=Math.pow(.05,dt);if(!p.plus)p.vy*=Math.pow(.05,dt)}p.life-=dt}parts=parts.filter(p=>p.life>0);
    for(const g of ghosts)g.life-=dt;ghosts=ghosts.filter(g=>g.life>0);
    for(const s of slashes)s.t+=dt;slashes=slashes.filter(s=>s.t<(s.twirl?.42:s.heavy===1?.34:.26));
    for(const d of decals)d.life-=dt;decals=decals.filter(d=>d.life>0);
    for(const w of waves)w.t+=dt;waves=waves.filter(w=>w.t<w.dur);
    for(const r of rays)r.t+=dt;rays=rays.filter(r=>r.t<.7);
    for(const b of bolts)b.t+=dt;bolts=bolts.filter(b=>b.t<.2);
    if(rnd()<dt*3)parts.push({x:cam.x+(rnd()-.5)*lw,y:cam.y+lh/2,vx:(rnd()-.5)*4,vy:-8-rnd()*8,life:6,max:6,col:rnd()<.5?C.cyan:C.pink,em:true,dust:1})}
  comboT-=dt;if(comboT<=0&&combo){combo=0;$('combo').classList.remove('on')}
  {const tx=me.x,ty=me.y-16,d=len(tx-cam.x,ty-cam.y);if(d>18){const k=Math.min(1,dt*14);cam.x+=(tx-cam.x)*k;cam.y+=(ty-cam.y)*k}else{cam.x=tx;cam.y=ty}}
  const sd=Math.pow(.0008,dt);shk.x*=sd;shk.y*=sd;zoom=1+(zoom-1)*Math.pow(.004,dt);flashA=Math.max(0,flashA-dt*3.5);
  hud();
  if(!solo){if(isHost&&mateJoined){snapT-=dt;if(snapT<=0){snapT=1/30;snapshot()}}
    else if(!isHost){inT-=dt;if(inT<=0||evQ.length){inT=1/30;send({t:'i',x:r1(me.x),y:r1(me.y),f:me.f,mv:me.moving?1:0,mx:r2(me.mx),my:r2(me.my),da:me.dash>0?1:0,z:r1(me.z||0),ev:evQ});evQ=[]}}
    const stale=(mateJoined||!isHost)&&performance.now()-lastRecv>2500;$('net').textContent=stale?'Connection weak':''}
  render()}

/* ================= pixel helpers + character art ================= */
function R(g,x,y,w,h,c){g.fillStyle=c;g.fillRect(Math.round(x),Math.round(y),w,h)}
function line(g,x0,y0,x1,y1,c){x0=Math.round(x0);y0=Math.round(y0);x1=Math.round(x1);y1=Math.round(y1);g.fillStyle=c;let dx=Math.abs(x1-x0),sx=x0<x1?1:-1,dy=-Math.abs(y1-y0),sy=y0<y1?1:-1,err=dx+dy;for(let i=0;i<160;i++){g.fillRect(x0,y0,1,1);if(x0===x1&&y0===y1)break;const e2=2*err;if(e2>=dy){err+=dy;x0+=sx}if(e2<=dx){err+=dx;y0+=sy}}}
function circ(g,cx,cy,r,col){g.fillStyle=col;for(let dy=-r;dy<=r;dy++){const w=Math.floor(Math.sqrt(r*r-dy*dy+r*.6));g.fillRect(Math.round(cx)-w,Math.round(cy)+dy,w*2+1,1)}}
const WHEAD_G=[".........oo.........", "........ohco........", ".......ohhco........", ".......ohhcHo.......", ".....oohhhcHo.......", ".....oohhhcHho......", "....ooohhhcHhhooo...", "...okKKhhhhhhhKKkoo.", "..okKKKkkkkkkkkkklko", "..oKKkkkkkkkkkkkkklo", "..oKKkkkkkkkkkkkkklo", ".oKKkkkkkooKkkkkkooo", ".oKKKkkkkkoooooooooo", ".olKKkkkkeCcckeeCcco", ".gKKKkkkkkmmkkkkmmko", ".oKKKkkkkkkkkKKKkkko", ".oKKKkkkbbbbbbbbbbbo", "..oKKkkbbrwwwwwwrbbo", "..oKKbbbbbrrrrrrbbo.", "..oKKbbbbbrrrrrrbbo.", "...oKbbbbbbbbbbbbo..", "....ooobbbbbbbbbo...", ".......oobbbbooo....", ".........obgo.......", ".........oboo......."],WHEAD_P={"o": "#0c0910", "h": "#17121f", "H": "#2e2644", "c": "#4ff0ff", "C": "#c8fbff", "k": "#b07650", "K": "#7a4a30", "l": "#dca472", "e": "#120c18", "m": "#d0246e", "g": "#ffc861", "w": "#e8e0d0", "r": "#3a1418", "b": "#1e1626"};let WHEADS=null,WHEAD_EM=null,WHEAD_EMB=null;
function wardenHead(back){if(!WHEADS){const mkH=(bk)=>{const cv=mk(20,25),g=cv.getContext('2d');WHEAD_G.forEach((row,y)=>{for(let x=0;x<row.length;x++){let ch=row[x];if(ch==='.')continue;
      if(bk&&y>=10&&x>=6&&ch!=='o'&&ch!=='g'){ch=y>=15?'K':'k'}if(bk&&y>=10&&y<=11&&x>=7&&ch==='o'&&x<17)ch='k';g.fillStyle=WHEAD_P[ch];g.fillRect(x,y,1,1)}});return cv};
    WHEADS=[mkH(false),mkH(true)];const em=bk=>{const cv=mk(20,25),e=cv.getContext('2d');WHEAD_G.forEach((row,y)=>{for(let x=0;x<row.length;x++){const ch=row[x];if(ch==='c'||ch==='C'){if(bk&&y>=10)continue;e.fillStyle=ch==='C'?'#ffffff':'#4ff0ff';e.fillRect(x,y,1,1)}}});return cv};WHEAD_EM=em(false);WHEAD_EMB=em(true)}
  return WHEADS[back?1:0]}
function drawWarden(c){const g=c.g,m=c.m;g.clearRect(0,0,S,S);m.clearRect(0,0,S,S);
  const mv=c.moving||c.dash>0||!!c.leap,wp=c.walk*TAU,s1=mv?Math.sin(wp):0;const bob=mv?-Math.round(Math.abs(Math.cos(wp))*1.5):(Math.sin(c.t*2.6)>.3?1:0);
  let ang=1.0,ang2=2.1,lean=0;
  if(c.ww>0||c.bs>0){ang=(tAll*(c.bs>0?26:20))%TAU;ang2=ang+Math.PI}
  else if(c.atk>0){const p=1-c.atk/c.atkDur,hv=c.heavy===1,rv=c.heavy===2,at=hv?.4:.32;let s;
    if(p<at){const k=p/at;s=hv?-1.0-k*1.9:-.6-k*1.8;lean=hv?-3:-1}else{const k=Math.min(1,(p-at)/.12);s=(hv?-2.7:-2.4)+k*(hv?4.3:3.6);lean=hv?3:2}
    if(rv){ang2=s;ang=-.5}else if(hv){ang=s;ang2=s-.4}else ang=s}
  if(c.cast){ang=-1.6;ang2=-1.95;lean=-1}else if(c.pose>0){ang=-1.2;ang2=-1.7}
  if(c.leap||(c.z||0)>2){ang=-2.3;ang2=-1.1;lean=1}else if(c.dash>0){ang=.25;lean=3}
  const active=c.ww>0||c.bs>0||c.atk>0||c.cast||c.pose>0||c.leap||(c.z||0)>2||c.dash>0,sway=mv?s1*.18:Math.sin(c.t*2.6)*.05;
  const aF=active?ang:.6+sway,xF=active?ang:-.6+sway*.5,aB=active?ang2:.45-sway,xB=active?ang2:-.15-sway*.5;
  const spin=c.ww>0||c.bs>0;c.wph=tAll*(c.bs>0?17:12);const back=spin&&Math.sin(c.wph)<0;
  const y0=bob,L=lean,hx=y=>Math.round((39-y)*.3);
  const SK='#b07650',SKD='#7a4a30',SKL='#dca472',HAIR='#141019',NV='#1d2036',NVL='#30365a',NVD='#10111d',MAG='#d0246e',MAGD='#7a1446',ST='#3c425c',STL='#6a7392',GO=C.gold,GD=C.goldD,GL=C.goldL,CY=C.cyan;
  const glow=(x,y,w,h)=>{R(g,x,y,w,h,CY);R(m,x,y,w,h,CY)};
  const axe=(hx,hy,a,front)=>{const ca=Math.cos(a),sa=Math.sin(a),nx=-sa,ny=ca,P=(d,k,col)=>R(g,hx+ca*d+nx*k,hy+sa*d+ny*k,1,1,col);
    for(let d=-3;d<=14;d++){P(d,0,front?'#4a2c1c':'#2e1c12');P(d,-1,front?'#2e1c12':'#1e120c')}
    for(const d of [-3,1,6])P(d,0,GO);P(3,0,MAG);P(4,0,MAG);P(3,-1,MAGD);
    const wd=[2,4,6,7,7,7,6,4,2];for(let i=0;i<wd.length;i++){const d=7+i,w=wd[i];for(let k=1;k<=w;k++)P(d,k,k===w?(front?'#e9fdff':'#9fdfe8'):(k===3&&i>1&&i<7)?(front?GD:'#6a5320'):front?(k<3?STL:ST):(k<3?ST:NVD));
      R(m,hx+ca*d+nx*w,hy+sa*d+ny*w,1,1,front?'rgba(79,240,255,1)':'rgba(79,240,255,.55)');if(front)R(m,hx+ca*d+nx*(w+1),hy+sa*d+ny*(w+1),1,1,'rgba(79,240,255,.45)')}
    for(let d=9;d<=12;d++){P(d,-1,front?ST:NVD);P(d,-2,front?STL:ST)}P(10,-3,front?'#c9d6ee':STL);P(15,0,front?STL:ST);P(16,0,front?'#c9d6ee':STL);P(11,4,front?CY:'#2a8a94');if(front)R(m,hx+ca*11+nx*4,hy+sa*11+ny*4,1,1,CY)};
  const arm=(sx,sy,a,front,xa)=>{const ca=Math.cos(a),sa=Math.sin(a),ex=sx+ca*8,ey=sy+sa*8,col=front?SK:SKD;
    for(const [ox,oy] of [[0,0],[1,0],[0,1],[1,1],[-1,0]])line(g,sx+ox,sy+oy,ex+ox,ey+oy,col);if(front){line(g,sx,sy-1,sx+ca*4,sy+sa*4-1,SKL);R(g,sx+ca*2+1,sy+sa*2,1,1,CY);R(m,sx+ca*2+1,sy+sa*2,1,1,CY)}
    for(const [ox,oy] of [[0,0],[1,0],[0,1],[1,1],[-1,0]])line(g,sx+ca*5+ox,sy+sa*5+oy,ex+ox,ey+oy,front?NV:NVD);R(g,sx+ca*5,sy+sa*5,2,1,front?GO:GD);R(g,sx+ca*7,sy+sa*7,2,1,front?MAG:MAGD);
    axe(ex,ey,xa??a,front);R(g,ex-1,ey-1,3,3,front?SK:SKD);R(g,ex-1,ey-1,3,1,front?SKL:SK)};
  const paul=(x,y,front)=>{const b=front?NV:NVD,l=front?NVL:NV;R(g,x+1,y,8,1,b);R(g,x,y+1,10,5,b);R(g,x+1,y+6,8,1,b);R(g,x+1,y+1,8,1,l);R(g,x,y+5,10,1,front?GO:GD);R(g,x+4,y+1,2,5,front?GO:GD);R(g,x+4,y+3,2,1,front?CY:'#2a8a94');
    R(g,x+1,y-1,8,1,front?CY:'#2a8a94');if(front){R(m,x+1,y-1,8,1,CY);R(m,x+4,y+3,2,1,CY)}R(g,x+2,y-3,1,2,front?STL:ST);R(g,x+7,y-3,1,2,front?STL:ST);R(g,x+2,y-4,1,1,'#c9d6ee');R(g,x+7,y-4,1,1,'#c9d6ee')};

  // legs: armored greaves + boots
  const lx1=Math.round(s1*3),lx2=-lx1,lf1=mv&&s1>0?-Math.round(s1*2):0,lf2=mv&&s1<0?Math.round(s1*2):0;
  const leg=(x,lf,front)=>{const h=9+lf-(y0<0?y0:0);R(g,x,46+y0,6,h,front?NV:NVD);R(g,x,48+y0,6,1,front?MAG:MAGD);R(g,x+1,46+y0,4,2,front?GO:GD);R(g,x+2,47+y0,2,1,front?CY:'#2a8a94');if(front)R(m,x+2,47+y0,2,1,CY);
    R(g,x-1,53+lf,8,3,front?NVD:'#0a0b14');R(g,x-1,53+lf,8,1,front?GO:GD);R(g,x+5,55+lf,2,1,front?GL:GD)};
  leg(26+lx2,lf2,false);leg(33+lx1,lf1,true);
  // kilt: navy plates with gold edges + magenta tabard
  for(let i=0;i<5;i++){const x=24+L+i*3+(i>2?1:0);R(g,x,43+y0,3,5+(i%2),NV);R(g,x,43+y0,1,5+(i%2),NVL);R(g,x,47+y0+(i%2),3,1,GD)}
  R(g,30+L,43+y0,5,8,MAG);R(g,30+L,43+y0,1,8,MAGD);R(g,31+L,45+y0,3,1,GO);R(g,32+L,46+y0,1,2,GO);R(g,31+L,49+y0,3,1,GO);R(g,30+L,51+y0,5,1,MAGD);
  // belt + sunburst buckle
  R(g,24+L,40+y0,17,3,NV);R(g,24+L,40+y0,17,1,GD);R(g,24+L,42+y0,17,1,GD);R(g,26+L,41+y0,1,1,MAG);R(g,38+L,41+y0,1,1,MAG);
  R(g,30+L,39+y0,5,5,GO);R(g,31+L,39+y0,3,1,GL);R(g,29+L,40+y0,1,3,GD);R(g,35+L,40+y0,1,3,GD);glow(32+L,41+y0,1,1);R(g,31+L,41+y0,1,1,GD);R(g,33+L,41+y0,1,1,GD);
  // bare torso with neon tattoos
  for(let r=0;r<13;r++){const w=19-Math.floor(r*.4),x=Math.round(32.5+L-w/2)+hx(27+r);R(g,x,27+r+y0,w,1,SK);R(g,x,27+r+y0,2,1,SKD);R(g,x+w-1,27+r+y0,1,1,SKL)}
  if(!back){R(g,28+L+2,32+y0,4,1,SKD);R(g,34+L+2,32+y0,4,1,SKD);R(g,32+L+1,34+y0,1,6,SKD);R(g,30+L+1,36+y0,5,1,SKD);R(g,30+L,38+y0,5,1,SKD);R(g,29+L+2,30+y0,3,1,SKL);R(g,35+L+2,30+y0,2,1,SKL);
  for(const [x,y] of [[26,28],[27,29],[28,30],[38,28],[37,29],[36,30],[27,33],[27,34],[27,35],[38,33],[38,34],[38,35]]){R(g,x+L+hx(y),y+y0,1,1,CY);R(m,x+L+hx(y),y+y0,1,1,'rgba(79,240,255,.4)')}
  glow(32+L+2,30+y0,1,3);glow(31+L+2,31+y0,3,1);R(g,34+L,31+y0,1,1,'#eafcff')}else{R(g,32+L+1,29+y0,1,10,SKD);R(g,28+L+2,31+y0,3,1,SKD);R(g,35+L+2,31+y0,3,1,SKD)}
  // back arm reaches forward across the chest (front arm swaps behind when he's turned away mid-spin)
  if(back)arm(42+L,31+y0,aF,false,xF);else arm(29+L,31+y0,aB,false,xB);
  // head (hand-pixeled), hunched forward
  g.drawImage(wardenHead(back),25+L,4+y0);if(!back)m.drawImage(WHEAD_EM,25+L,4+y0);else m.drawImage(WHEAD_EMB,25+L,4+y0);
  // pauldrons
  paul(20+L,27+y0,false);paul(37+L,26+y0,true);
  // front arm + axe
  if(back)arm(27+L,31+y0,aB,true,xB);else arm(42+L,31+y0,aF,true,xF)}
function lampWhimsy(c,dt){c.twl=Math.max(0,(c.twl||0)-dt);c.wink=Math.max(0,(c.wink||0)-dt);
  if(!c.moving&&c.atk<=0&&!c.cast&&c.state==='ok'){c.idleT=(c.idleT||0)+dt;if(c.idleT>4+((c.idx*1.7)%2)){c.idleT=0;if(rnd()<.6){c.twl=.5;for(let i=0;i<10&&parts.length<500;i++){const a=rnd()*TAU;parts.push({x:c.x+Math.cos(a)*10,y:c.y-16+Math.sin(a)*8,vx:Math.cos(a)*40,vy:Math.sin(a)*25-15,life:.6,max:.6,col:i%2?'#ff6fb4':C.amber,em:true,star:3})}}else c.wink=.45}}else c.idleT=0;
  const tx=c.x-c.f*12+Math.sin(c.t*1.7)*7,ty=c.y-40+Math.sin(c.t*3.1)*3;if(!c.moth)c.moth={x:tx,y:ty};const k=Math.min(1,dt*4);c.moth.x+=(tx-c.moth.x)*k;c.moth.y+=(ty-c.moth.y)*k;
  if(rnd()<dt*6&&parts.length<500)parts.push({x:c.moth.x,y:c.moth.y+1,vx:(rnd()-.5)*6,vy:8,life:.5,max:.5,col:rnd()<.5?'#ff9ccf':'#fff1c4',em:true})}
function lampHop(c){if(!c.moving)return{y0:Math.sin(c.t*3.2)>0?1:0,air:0};const ph=c.walk%1,h=Math.sin(ph*Math.PI);return{y0:-Math.round(h*5),air:h,ph}}
function updHair(c,dt){const hop=lampHop(c),ax=26,ay=26+hop.y0;
  if(!c.hair||c.hairF!==c.f){c.hair=c.hair?c.hair.map(p=>({x:64-p.x,y:p.y,px:64-p.px,py:p.py})):Array.from({length:9},(_,i)=>({x:ax-i*.6,y:ay+i*3,px:ax-i*.6,py:ay+i*3}));c.hairF=c.f}
  const mvx=(c.x-(c.hpx??c.x))*c.f;c.hpx=c.x;dt=Math.min(dt,.05);const H=c.hair;H[0].x=ax;H[0].y=ay;H[0].px=ax;H[0].py=ay;
  for(let i=1;i<H.length;i++){const p=H[i],vx=(p.x-p.px)*.86,vy=(p.y-p.py)*.86;p.px=p.x;p.py=p.y;p.x+=vx-mvx*.11*(i/H.length)-60*dt*dt;p.y+=vy+900*dt*dt}
  for(let k=0;k<3;k++)for(let i=1;i<H.length;i++){const a=H[i-1],p=H[i],dx=p.x-a.x,dy=p.y-a.y,d=Math.hypot(dx,dy)||1,L=3;const f=(d-L)/d;p.x-=dx*f;p.y-=dy*f;if(p.x>a.x+2.5)p.x=a.x+2.5;if(p.y<a.y-2.5)p.y=a.y-2.5;if(p.y>55)p.y=55}}
const LAMP=window.DD_LAMP||null,LIMG=new Image(),LEM=new Image();if(LAMP){LIMG.src=LAMP.img;LEM.src=LAMP.em}
function drawLampArt(c){const g=c.g,m=c.m,Z=c.spr.width;g.clearRect(0,0,Z,Z);m.clearRect(0,0,Z,Z);
  const mv=c.moving,hop=lampHop(c),y0=hop.y0*2,tw=c.atk>0?1-c.atk/c.atkDur:-1,air=hop.air>.35,ff=mv?(hop.ph<.5?1:-1):0;
  const ops=[],D=(n,x,y,rot,ctx,img)=>{const p=LAMP[n],r=p.r;if(!ctx)ops.push([n,x,y,rot]);ctx=ctx||g;ctx.save();ctx.translate(Math.round(x),Math.round(y));if(rot)ctx.rotate(rot);ctx.drawImage(img||LIMG,r[0],r[1],r[2],r[3],-Math.round(p.pv[0]),-Math.round(p.pv[1]),r[2],r[3]);ctx.restore()};
  const A=n=>LAMP[n].at;
  if(!c.hair)updHair(c,0);const H=c.hair,ang=(a,b)=>clamp(Math.atan2(b.y-a.y,b.x-a.x)-Math.PI/2,-1.3,1.3);
  const hA=ang(H[0],H[3]),hB=ang(H[3],H[7]),La=A('hairB')[1]-A('hairA')[1],ax=A('hairA')[0],ay=A('hairA')[1]+y0;
  D('hairB',ax-Math.sin(hA)*La,ay+Math.cos(hA)*La,hB);D('hairA',ax,ay,hA);D('hair1',A('hair1')[0],A('hair1')[1]+y0);
  const swing=mv?Math.sin(c.walk*TAU)*.35:Math.sin(c.t*2)*.05;
  D('arm_b',A('arm_b')[0],A('arm_b')[1]+y0,swing);
  D('leg_b',A('leg_b')[0]-ff*2,A('leg_b')[1]+y0+(air?-2:0));D('leg_a',A('leg_a')[0]+ff*2,A('leg_a')[1]+y0+(air?-4:0));
  D('body',A('body')[0],A('body')[1]+y0);
  const hb=Math.sin(c.t*2.2)*.03;D('head',A('head')[0],A('head')[1]+y0,hb);
  if(c.blink>0||c.state==='down'||c.wink>0){const p=LAMP.head,hx=A('head')[0]-p.pv[0],hy=A('head')[1]+y0-p.pv[1];for(const e of (c.blink>0||c.state==='down')?[LAMP.eyeL,LAMP.eyeR]:[LAMP.eyeR]){g.fillStyle=LAMP.skin;g.fillRect(Math.round(hx+e[0]-3),Math.round(hy+e[1]-3),6,6);g.fillStyle='#3a1a10';g.fillRect(Math.round(hx+e[0]-3),Math.round(hy+e[1]+1),6,1)}}
  // staff + lantern
  let px=A('pole')[0]-4,py=A('pole')[1]+y0-2,pr=clamp(c.sw,-.8,.8)*.08;
  if(tw>=0){pr=tw*TAU*1.15}else if(c.cast||c.pose>0||c.ch>0){py-=12;pr=-.25}
  const hk=[A('lantern')[0]-A('pole')[0],A('lantern')[1]-A('pole')[1]],cr=Math.cos(pr),sr=Math.sin(pr),lx=px+hk[0]*cr-hk[1]*sr,ly=py+hk[0]*sr+hk[1]*cr,lr=tw>=0?pr:clamp(c.sw,-.8,.8)*.7;
  D('pole',px,py,pr);D('lantern',lx,ly,lr);m.globalAlpha=.75;D('lantern',lx,ly,lr,m);m.globalAlpha=1;
  const lc=[lx-Math.sin(lr)*18,ly+Math.cos(lr)*18];c.lantern=[lc[0]/2,lc[1]/2];
  D('arm_a',A('arm_a')[0],A('arm_a')[1]+y0,tw>=0?-.4:(c.cast||c.pose>0||c.ch>0)?-.35:swing*.4);
  if(LEM.complete&&LEM.naturalWidth){m.globalAlpha=.7;for(const o of ops)D(o[0],o[1],o[2],o[3],m,LEM);m.globalAlpha=1}}
const LHEAD_G=[".........oooooo.........", "......oooHHHHHHooo......", "....ooHHHLLLLLHHHHoo....", "...oHHLLSSLLLHHHLLLHH...", "..oggHLLLLHHHHHHHLLLHo..", "..oHGgHHHLLLHHHkHHHLLHo.", ".ogHHgHHLLHHHkkkkHHHHHo.", ".oHHHHHLLHHkkkkkkkHHHHho", ".ohHHHLHHHkkkkkkkkkHHHho", ".ohHHHHkHkkkkkkkkkkkHHho", "ohhHHkkkoookkkkoookkHhho", "ohhHkkkowweekkowweekkhho", "ohhHkkkeweeekkeweeekkhho", "ohHHkkkeeiiekkeeiiekkHho", "ohHkkkkeiaaekkeiaaekkHho", "ohHkkkkkaaakkkkaaakkkHho", ".ohHkbbkkkkknkkkkkkbKHo.", ".ohHkkkkkkkmkkmkkkkKKho.", ".ohhHkkkkkkkmtkkkkKKHho.", "..ohHKKkkkkkkkkkKKKHHo..", "...oHHhooKKkkKKoohHHh...", "...oHHo..oKkkKo..oHHo...", "....Ho....oKKo...ohHo...", "....o......oo.....oo...."],LHEAD_P={"o": "#1e0f0c", "h": "#45200f", "H": "#6a3519", "L": "#94542a", "S": "#c9884a", "k": "#ecb48e", "K": "#c98466", "b": "#f2878e", "e": "#22100a", "i": "#7a3e14", "a": "#e8a040", "w": "#ffffff", "m": "#8a2a34", "t": "#ff8aa0", "g": "#ffd27a", "G": "#b8862a", "n": "#c88a6c"};let LHEADS=null,LHEAD_EM=null;
function lampHead(v){if(!LHEADS){LHEADS=[0,1,2].map(k=>{const cv=mk(24,24),g=cv.getContext('2d');LHEAD_G.forEach((row,y)=>{for(let x=0;x<row.length;x++){let ch=row[x];if(ch==='.')continue;
      const eyeL=x>=7&&x<=11,eyeR=x>=14&&x<=18;if(y>=10&&y<=15&&((k===1&&(eyeL||eyeR))||(k===2&&eyeR))){ch=y===13&&(eyeL?x>7&&x<11:x>14&&x<18)?'e':y===15&&(x===8||x===12||x===15||x===19)?'k':'k'}g.fillStyle=LHEAD_P[ch];g.fillRect(x,y,1,1)}});return cv});
    LHEAD_EM=mk(24,24);const e=LHEAD_EM.getContext('2d');e.fillStyle='rgba(255,180,80,.55)';LHEAD_G.forEach((row,y)=>{for(let x=0;x<row.length;x++)if(row[x]==='a')e.fillRect(x,y,1,1)})}
  return LHEADS[v]}
function drawLamp(c){const g=c.g,m=c.m;g.clearRect(0,0,S,S);m.clearRect(0,0,S,S);
  const mv=c.moving,hop=lampHop(c),y0=hop.y0,tw=c.atk>0?1-c.atk/c.atkDur:-1;
  const HR='#5a2e1a',HD='#2a120c',HL='#7a4224',HH='#a0603a',SK='#e6ae90',SKS='#a8705e',LV='#4a2c6e',LVD='#33204e',LVK='#1e1232',LVL='#6a4896',PK='#ff4f9a',PKD='#9a2060',WH='#c9bdd6',WHD='#7e7290',NEON='#ff6fb4',GO=C.gold,GD=C.goldD;
  // long wavy back hair (physics chain)
  if(!c.hair)updHair(c,0);const Hh=c.hair,rad=i=>Math.max(2,Math.round(5.2-i*.36));
  for(let i=Hh.length-1;i>=1;i--){const p=Hh[i];circ(g,p.x,p.y,rad(i)+1,HD)}
  for(let i=Hh.length-1;i>=1;i--){const p=Hh[i],r=rad(i),wv=Math.round(Math.sin(i*1.7+c.t*2)*.8);circ(g,p.x+wv,p.y,r,i%2?HR:HL)}
  for(let i=1;i<Hh.length-1;i++){const a=Hh[i],b=Hh[i+1],o=i%2?1:-1;line(g,a.x+o,a.y,b.x+o,b.y,HH);line(g,a.x-o*2,a.y+1,b.x-o*2,b.y+1,HD)}
  {const t=Hh[Hh.length-1],t2=Hh[Hh.length-2];R(g,t.x-2,t.y+2,2,1,HR);R(g,t.x+1,t.y+2,1,1,HR);R(g,t2.x-3,t2.y+1,1,2,HL)}
  // back arm (puff sleeve)
  circ(g,25,39+y0,3,LVD);R(g,23,38+y0,2,1,LV);R(g,24,42+y0,3,1,WHD);R(g,24,43+y0,2,2,SKS);R(g,24,45+y0,2,1,SKS);
  // legs: socks + mary janes, tucked while airborne
  const air=hop.air>.35,ff=mv?(hop.ph<.5?1:-1):0;
  const leg=(x,dy,front)=>{R(g,x+1,50+y0+dy,3,3,front?SK:SKS);R(g,x+1,52+y0+dy,3,2,front?WH:WHD);R(g,x,54+y0+dy,5,2,front?'#3a1e2a':'#2a1520');R(g,x+1,54+y0+dy,3,1,front?'#5a2e3e':'#3a1e2a');R(g,x+3,54+y0+dy,1,1,GO)};
  leg(27-ff,air?-1:0,false);leg(33+ff,air?-2:0,true);
  // skirt
  for(let y=44;y<=52;y++){const hw=6+Math.floor((y-44)*.75)+(air&&y>49?1:0),yy=y+y0;R(g,32-hw,yy,hw*2+1,1,y>=51?PK:LV);R(g,32-hw,yy,1,1,y>=51?PKD:LVD);R(g,32+hw,yy,1,1,y>=51?PKD:LVK);if(y<51&&y%3===0)R(g,29,yy,1,1,LVD),R(g,35,yy,1,1,LVL)}
  {const hw=6+6+(air?1:0);R(g,32-hw,53+y0,hw*2+1,1,LVK);for(let i=-hw+3;i<hw-1;i+=6){R(g,32+i,50+y0,1,1,GO)}R(m,32-hw+1,52+y0,hw*2-1,1,'rgba(255,79,154,.55)');R(m,32-hw+1,51+y0,hw*2-1,1,'rgba(255,79,154,.3)')}
  R(g,30,47+y0,1,1,GO);R(g,35,46+y0,1,1,GO);
  // bodice, collar, bow, belt
  R(g,27,38+y0,11,6,LV);R(g,27,38+y0,1,6,LVD);R(g,37,38+y0,1,6,LVK);R(g,32,40+y0,1,1,GO);R(g,32,42+y0,1,1,GO);R(g,29,39+y0,1,4,LVL);
  R(g,28,37+y0,9,2,WH);R(g,28,38+y0,2,1,WHD);R(g,35,38+y0,2,1,WHD);
  R(g,30,38+y0,2,2,PK);R(g,34,38+y0,2,2,PK);R(m,30,38+y0,6,2,'rgba(255,79,154,.5)');R(g,32,38+y0,2,2,PKD);R(g,31,40+y0,1,2,PK);R(g,34,40+y0,1,2,PK);
  R(g,26,43+y0,13,2,'#3a2030');R(g,31,43+y0,3,2,GO);R(g,32,43+y0,1,1,'#fff1c4');R(g,24,43+y0,3,2,PK);R(g,23,45+y0,2,2,PKD);
  c.hiHead=false;g.drawImage(lampHead(c.state==='down'||c.blink>0?1:c.wink>0?2:0),23,15+y0);m.drawImage(LHEAD_EM,23,15+y0);
  // front arm, staff, lantern
  const hx=39,hy=45+y0;circ(g,39,39+y0,3,LV);R(g,38,37+y0,2,1,LVL);R(g,41,40+y0,1,2,LVD);R(g,38,42+y0,3,1,WH);R(g,38,43+y0,2,2,SK);let lx2,ly2;
  if(tw>=0){const a=-1.57+tw*TAU*1.15;lx2=32+Math.cos(a)*18;ly2=38+Math.sin(a)*10;line(g,hx,hy,lx2,ly2,'#5a3420');line(g,hx+1,hy,lx2+1,ly2,'#3a2014')}
  else{const top=c.cast||c.pose>0||c.ch>0?[36,6]:[41,15+y0],dx=top[0]-hx,dy=top[1]-hy,d=Math.hypot(dx,dy)||1;
    line(g,hx-dx/d*7,hy-dy/d*7,top[0],top[1],'#5a3420');line(g,hx-dx/d*7+1,hy-dy/d*7,top[0]+1,top[1],'#3a2014');R(g,hx-dx/d*7,hy-dy/d*7,2,1,GO);
    for(const k of [.35,.8])R(g,hx+dx*k,hy+dy*k,2,1,GO);R(g,top[0]-1,top[1]+3,1,3,PK);R(g,top[0]-2,top[1]+5,1,2,PKD);
    R(g,top[0],top[1]-1,2,1,GO);R(g,top[0]+1,top[1]-2,3,1,GO);R(g,top[0]+4,top[1]-1,1,2,GO);R(g,top[0]+3,top[1]+1,1,1,C.goldL);
    const sw=clamp(c.sw,-.8,.8);lx2=top[0]+4+Math.sin(sw)*4;ly2=top[1]+5+Math.cos(sw);line(g,top[0]+4,top[1]+1,lx2,ly2-3,C.goldD)}
  R(g,lx2-1,ly2-3,3,1,GO);R(g,lx2-2,ly2-2,5,1,GO);R(g,lx2-2,ly2-1,5,5,'#6a4a20');R(g,lx2-1,ly2-1,3,4,C.amber);R(g,lx2,ly2,1,2,'#fff1c4');R(g,lx2-2,ly2+4,5,1,GO);R(g,lx2,ly2+5,1,1,GO);
  R(m,lx2-1,ly2-1,3,4,'#fff1c4');R(m,lx2-2,ly2-2,5,6,'rgba(255,200,97,.55)');c.lantern=[lx2,ly2+1];
  R(g,hx-1,hy-1,3,2,SK);R(g,hx-1,hy,1,1,SKS)}
function tintOf(c,col){const t=c.tint.getContext('2d'),Z=c.tint.width;t.globalCompositeOperation='source-over';const ZH=c.tint.height;t.clearRect(0,0,Z,ZH);t.drawImage(c.spr,0,0);t.globalCompositeOperation='source-in';t.fillStyle=col;t.fillRect(0,0,Z,ZH);t.globalCompositeOperation='source-over';return c.tint}
function buildFin(c,outline){const f=c.fin.getContext('2d'),k=c.fin.width/S;f.clearRect(0,0,c.fin.width,c.fin.height);const t=tintOf(c,outline);for(const [a,b] of [[-1,0],[1,0],[0,-1],[0,1]])f.drawImage(t,a*k,b*k);f.drawImage(c.spr,0,0);return c.fin}
function blit(g,img,x,y,f,sx=1,sy=1,alpha=1,rot=0){g.save();g.globalAlpha=alpha;g.translate(Math.round(x),Math.round(y));if(rot)g.rotate(rot);const k=img.k||img.width/S;g.scale(f*sx/k,sy/k);g.drawImage(img,-(img.fx||FX)*k,-(img.fy||FY)*k);g.restore()}

/* ================= render ================= */
let ox=0,oy=0;
let SKY=null;
function buildSky(){SKY=[0,1].map(L=>{const c=mk(2300,470),g=c.getContext('2d'),ce=mk(2300,470),ge=ce.getContext('2d');
  for(const t of TOW[L]){const x=Math.round(t.x+700),top=Math.round(300-t.h);g.fillStyle=L?'#120e24':'#1b1636';g.fillRect(x,top,t.w|0,470-top);
    let sw=t.w|0;for(let s2=0;s2<t.steps;s2++){sw=Math.max(2,sw-((t.w/4)|0));g.fillRect(x+(((t.w|0)-sw)>>1),top-(s2+1)*5,sw,5)}
    if(t.ant)g.fillRect(x+((t.w/2)|0),top-t.steps*5-9,1,9);
    const Rr=rng(t.seed);for(let wy=top+4;wy<470;wy+=L?6:5)for(let wx=x+2;wx<x+t.w-2;wx+=L?4:3)if(Rr()<(L?.06:.04)){g.fillStyle=Rr()<.55?'rgba(255,214,140,.45)':(Rr()<.5?'rgba(79,240,255,.5)':'rgba(255,79,216,.5)');g.fillRect(wx,wy,1,L?2:1)}
    if(L&&t.seed%3===0){const hh=Math.min(26,t.h/3)|0;g.fillStyle=t.neon;g.fillRect(x+2,top+8,1,hh);ge.globalAlpha=.7;ge.fillStyle=t.neon;ge.fillRect(x+2,top+8,1,hh);ge.globalAlpha=1}}
  return{c,ce}})}
function bg(){if(!SKY)buildSky();const gr=lg.createLinearGradient(0,0,0,lh);gr.addColorStop(0,C.sky0);gr.addColorStop(.7,'#1d1438');gr.addColorStop(1,C.sky1);lg.fillStyle=gr;lg.fillRect(0,0,lw,lh);
  for(let L=0;L<2;L++){const par=L?.45:.22,base=lh+(L?20:-10)-(cam.y*par*.3),sx=Math.round(-700-cam.x*par),sy=Math.round(base-300);
    lg.drawImage(SKY[L].c,sx,sy);eg.drawImage(SKY[L].ce,sx,sy);
    for(const t of TOW[L]){if(!t.ant||Math.sin(tAll*2+t.seed)<=0)continue;const x=Math.round(t.x-cam.x*par);if(x<-4||x>lw+4)continue;eg.fillStyle=t.neon;eg.fillRect(x+((t.w/2)|0),Math.round(base-t.h)-t.steps*5-10,1,1)}
    const fg=lg.createLinearGradient(0,lh*.35,0,lh);fg.addColorStop(0,'rgba(90,63,143,0)');fg.addColorStop(1,L?'rgba(90,63,143,.35)':'rgba(90,63,143,.45)');lg.fillStyle=fg;lg.fillRect(0,0,lw,lh)}}
let STW=null,STE=null;const STX=20,STY=24;
function staticWorld(){
  for(const r of ROOFS){const x=r.x+ox,y=r.y+r.h+oy;const gr=lg.createLinearGradient(0,y,0,y+FACE);gr.addColorStop(0,C.face);gr.addColorStop(.7,'rgba(20,18,38,.85)');gr.addColorStop(1,'rgba(29,20,56,0)');lg.fillStyle=gr;lg.fillRect(x,y,r.w,FACE);
    lg.fillStyle=C.rib;for(let i=4;i<r.w;i+=6)lg.fillRect(x+i,y+6,1,FACE-26);lg.fillStyle=C.lip;lg.fillRect(x,y,r.w,2);lg.fillStyle=C.gold;lg.fillRect(x,y+2,r.w,1);lg.fillStyle=C.goldD;lg.fillRect(x+3,y+4,r.w-6,1);
    for(let i=0;i<r.w;i+=12){lg.fillRect(x+i+4,y+5,4,1);lg.fillRect(x+i+5,y+6,2,1)}
    for(const w of r.win){const fade=1-w[1]/FACE;lg.globalAlpha=w[3]*fade;lg.fillStyle=w[2];lg.fillRect(x+w[0],y+w[1],1,3);eg.globalAlpha=w[3]*fade*.7;eg.fillStyle=w[2];eg.fillRect(x+w[0],y+w[1],1,3)}lg.globalAlpha=eg.globalAlpha=1;
  }
  {const b=BRIDGE,x=b.x+ox,y=b.y+oy;lg.fillStyle='#211f38';lg.fillRect(x,y,b.w,b.h);lg.fillStyle=C.face;lg.fillRect(x,y+b.h,b.w,16);lg.fillStyle=C.gold;lg.fillRect(x,y+b.h,b.w,1);
    lg.fillStyle=C.sky1;for(let i=6;i<b.w-8;i+=18){lg.fillRect(x+i,y+b.h+7,12,9);lg.fillRect(x+i+1,y+b.h+6,10,1)}lg.fillStyle=C.lip;lg.fillRect(x,y,b.w,1);lg.fillRect(x,y+b.h-1,b.w,1);
    for(let i=4;i<b.w;i+=8){lg.fillStyle=C.goldD;lg.fillRect(x+i,y+13,3,1);lg.fillRect(x+i+1,y+12,1,1);lg.fillRect(x+i+1,y+14,1,1)}}
  for(const r of ROOFS){const x=r.x+ox,y=r.y+oy;lg.fillStyle=C.roof;lg.fillRect(x,y,r.w,r.h);lg.fillStyle=C.tile;for(let i=12;i<r.w;i+=16)lg.fillRect(x+i,y,1,r.h);for(let j=10;j<r.h;j+=12)lg.fillRect(x,y+j,r.w,1);
    lg.fillStyle=C.goldD;lg.fillRect(x+6,y+8,r.w-12,1);lg.fillRect(x+6,y+r.h-6,r.w-12,1);lg.fillRect(x+6,y+8,1,r.h-14);lg.fillRect(x+r.w-7,y+8,1,r.h-14);
    for(const [cx,cy,sx,sy] of [[x+6,y+8,1,1],[x+r.w-7,y+8,-1,1],[x+6,y+r.h-6,1,-1],[x+r.w-7,y+r.h-6,-1,-1]]){lg.fillRect(cx,cy,sx*8,sy);lg.fillRect(cx,cy,sx,sy*6);lg.fillRect(cx+sx*2,cy+sy*2,sx*4,sy);lg.fillRect(cx+sx*2,cy+sy*2,sx,sy*3)}
    if(r.med){const cx=x+r.w/2,cy=y+r.h/2+4;lg.strokeStyle=C.goldD;lg.lineWidth=1;lg.beginPath();lg.ellipse(cx,cy,30,15,0,0,TAU);lg.stroke();lg.beginPath();lg.ellipse(cx,cy,19,9,0,0,TAU);lg.stroke();
      for(let i=0;i<24;i++){const a=i/24*TAU,ra=34,rb=i%2?48:60;line(lg,cx+Math.cos(a)*ra,cy+Math.sin(a)*ra*.5,cx+Math.cos(a)*rb,cy+Math.sin(a)*rb*.5,'rgba(125,98,50,.55)')}lg.fillStyle='rgba(214,168,78,.35)';lg.fillRect(cx-2,cy-1,5,3)}
    lg.fillStyle='#2a2846';lg.fillRect(x,y-8,r.w,8);lg.fillStyle=C.gold;lg.fillRect(x,y-9,r.w,1);lg.fillStyle='#1f1d36';for(let i=3;i<r.w;i+=10)lg.fillRect(x+i,y-6,6,4);lg.fillStyle=C.lip;lg.fillRect(x,y-8,1,r.h+8);lg.fillRect(x+r.w-1,y-8,1,r.h+8)}
  {const r=ROOFS[0],x=r.x+ox,y=r.y+r.h+oy,sx=x+r.w-36,sy=y+14;lg.fillStyle='#0b0a18';lg.fillRect(sx-2,sy-2,7,46)}}
function buildStatic(){STW=mk(820,430);STE=mk(820,430);const sl=lg,se=eg,a=ox,b=oy;lg=STW.getContext('2d');eg=STE.getContext('2d');ox=STX;oy=STY;staticWorld();lg=sl;eg=se;ox=a;oy=b}
function world(){
  if(!STW)buildStatic();lg.drawImage(STW,ox-STX,oy-STY);eg.drawImage(STE,ox-STX,oy-STY);
  {const r=ROOFS[0],x=r.x+ox,y=r.y+r.h+oy,sx=x+r.w-36,sy=y+14;const on=Math.sin(tAll*3)>-.85;for(let i=0;i<6;i++){lg.fillStyle=on?C.pink:'#5a2a50';lg.fillRect(sx,sy+i*7,3,5);if(on){eg.fillStyle=C.pink;eg.fillRect(sx,sy+i*7,3,5)}}}
  for(const d of decals){const a=Math.min(1,d.life/1.5);if(d.ink){lg.globalAlpha=a*.85;lg.fillStyle='#08060f';for(const p of d.pts)lg.fillRect(d.x+p[0]+ox,d.y+p[1]+oy,2,1);lg.fillStyle='rgba(255,42,92,.6)';lg.fillRect(d.x+ox,d.y+oy,1,1)}
    else{for(const seg of d.lines){let px=d.x+ox,py=d.y+oy;for(const [sx,sy] of seg){lg.globalAlpha=a*.9;line(lg,px,py,d.x+ox+sx,d.y+oy+sy,'#0a0916');eg.globalAlpha=a*.5;line(eg,px,py,d.x+ox+sx,d.y+oy+sy,d.col);px=d.x+ox+sx;py=d.y+oy+sy}}}}lg.globalAlpha=eg.globalAlpha=1;
  for(const z of zones){const col=z.col;lg.globalAlpha=.18;lg.fillStyle=col;lg.beginPath();lg.ellipse(z.x+ox,z.y+oy,z.r,z.r*.45,0,0,TAU);lg.fill();eg.globalAlpha=.4+.15*Math.sin(tAll*12);eg.strokeStyle=col;eg.beginPath();eg.ellipse(z.x+ox,z.y+oy,z.r,z.r*.45,0,0,TAU);eg.stroke();lg.globalAlpha=eg.globalAlpha=1}
  for(const p of pools){const a=Math.min(1,p.life)*(.5+.15*Math.sin(tAll*8));lg.globalAlpha=a*.35;lg.fillStyle=C.amber;lg.beginPath();lg.ellipse(p.x+ox,p.y+oy,26,11,0,0,TAU);lg.fill();eg.globalAlpha=a*.7;eg.strokeStyle=C.amber;eg.beginPath();eg.ellipse(p.x+ox,p.y+oy,26,11,0,0,TAU);eg.stroke();for(let i=0;i<8;i++){const an=i/8*TAU+tAll*1.5;eg.fillStyle='#fff1c4';eg.fillRect(Math.round(p.x+ox+Math.cos(an)*26),Math.round(p.y+oy+Math.sin(an)*11),1,1)}lg.globalAlpha=eg.globalAlpha=1}
  if(dome){const s=domeScale(),col=dome.sanct>0?C.amber:C.cyan;lg.globalAlpha=.16;lg.fillStyle=col;lg.beginPath();lg.ellipse(dome.x+ox,dome.y+oy,40*s,18*s,0,0,TAU);lg.fill();lg.globalAlpha=1;eg.globalAlpha=.6;eg.strokeStyle=col;eg.beginPath();eg.ellipse(dome.x+ox,dome.y+oy,40*s,18*s,0,0,TAU);eg.stroke();eg.globalAlpha=1}
  // enemy ground telegraphs
  for(const e of en){if(e.spawn>0)continue;const p=e.st===3?clamp(1-e.stt/(e.kind===5?.9:1.05),0,1):0;
    if(e.st===2){const pr=clamp(1-e.stt/.9,0,1),bl=Math.sin(tAll*30)>0;eg.globalAlpha=.4+.5*pr;eg.strokeStyle=C.red;eg.beginPath();eg.ellipse(e.x+ox,e.y+oy,32,14,0,0,TAU);eg.stroke();lg.globalAlpha=(bl?.25:.12)*(.5+pr);lg.fillStyle=C.red;lg.beginPath();lg.ellipse(e.x+ox,e.y+oy,32*pr,14*pr,0,0,TAU);lg.fill()}
    if(e.st===3){const Rr=e.kind===5?44:36;eg.globalAlpha=.8;eg.strokeStyle=C.red;eg.beginPath();eg.ellipse(e.ax+ox,e.ay+oy,Rr,Rr*.45,0,0,TAU);eg.stroke();lg.globalAlpha=.2+.25*p;lg.fillStyle=C.red;lg.beginPath();lg.ellipse(e.ax+ox,e.ay+oy,Rr*p,Rr*.45*p,0,0,TAU);lg.fill()}
    if(e.st===4){const pr=clamp(1-e.stt/.85,0,1);lg.save();lg.translate(e.x+ox,e.y+oy);lg.rotate(Math.atan2(e.ay*.8,e.ax));lg.globalAlpha=.15+.3*pr;lg.fillStyle=C.red;lg.fillRect(0,-12,180,24);eg.globalAlpha=.6+.4*pr;eg.save();eg.translate(e.x+ox,e.y+oy);eg.rotate(Math.atan2(e.ay*.8,e.ax));eg.strokeStyle=C.red;eg.strokeRect(0,-12,180,24);eg.restore();lg.restore()}}
  lg.globalAlpha=eg.globalAlpha=1;
  // tether
  if(chars.length>1&&chars.every(c=>c.state!=='out')){const [a,b]=chars;const ax=a.x+ox,ay=a.y-10+oy,bx=b.x+ox,by=b.y-10+oy;
    if(tether){const col=bond>.7?C.gold:C.heal;eg.globalAlpha=.25+.55*bond+.1*Math.sin(tAll*6);eg.strokeStyle=col;eg.lineWidth=1+Math.round(bond*2);eg.beginPath();eg.moveTo(ax,ay);eg.lineTo(bx,by);eg.stroke();eg.lineWidth=1;
      lg.globalAlpha=.3+.5*bond;lg.strokeStyle='#fff6d8';lg.beginPath();lg.moveTo(ax,ay);lg.lineTo(bx,by);lg.stroke();
      const n=3+Math.round(bond*4);for(let i=0;i<n;i++){const k=((tAll*.6+i/n)%1);const px=ax+(bx-ax)*k,py=ay+(by-ay)*k+Math.sin(tAll*8+i)*1.5;eg.globalAlpha=.9;eg.fillStyle=col;eg.fillRect(Math.round(px)-1,Math.round(py)-1,3,3);lg.globalAlpha=1;lg.fillStyle='#ffffff';lg.fillRect(Math.round(px),Math.round(py),1,1)}}
    else{eg.globalAlpha=.18;eg.setLineDash([1,4]);eg.strokeStyle='#6f86c8';eg.beginPath();eg.moveTo(ax,ay);eg.lineTo(bx,by);eg.stroke();eg.setLineDash([])}
    lg.globalAlpha=eg.globalAlpha=1}
  // gems
  for(const g of gems){const x=Math.round(g.x+ox),y=Math.round(g.y+oy+Math.sin(tAll*4+g.x)*1),big=g.v>=5;const col=big?C.pink:'#8a7cff';lg.fillStyle=col;lg.fillRect(x-1,y-2,big?4:3,big?5:4);lg.fillStyle='#ffffff';lg.fillRect(x,y-2,1,1);eg.fillStyle=col;eg.fillRect(x-1,y-2,big?4:3,big?5:4)}
  for(const w of waves){if(w.t<0)continue;const p=w.t/w.dur,e=1-Math.pow(1-p,3),rr=w.r*e;for(const [g,lwid,al] of [[eg,w.w*(1-p)+1,1-p],[lg,1,(1-p)*.8]]){g.globalAlpha=al;g.strokeStyle=g===lg?'#ffffff':w.col;g.lineWidth=lwid;g.beginPath();g.ellipse(w.x+ox,w.y+oy,rr,rr*.45,0,0,TAU);g.stroke()}}lg.globalAlpha=eg.globalAlpha=1;lg.lineWidth=eg.lineWidth=1}
function domeScale(){if(!dome)return 0;const t=dome.t;if(t<.22){const k=t/.22;return k*(1.2-.2*k)}if(dome.life-t<.3)return Math.max(0,(dome.life-t)/.3);return 1+.03*Math.sin(tAll*6)}
function drawProp(p){const x=p.x+ox,y=p.y+oy;
  if(p.k==='pylon'){lg.fillStyle='rgba(0,0,0,.4)';lg.fillRect(x-2,y,5,1);lg.fillStyle='#2a2846';lg.fillRect(x-1,y-16,3,16);lg.fillStyle=C.gold;lg.fillRect(x-2,y-17,5,1);lg.fillRect(x-1,y-2,3,1);const on=Math.sin(tAll*1.7+p.x)>-.9;lg.fillStyle=on?p.c:'#333';lg.fillRect(x-1,y-21,3,4);lg.fillStyle=C.gold;lg.fillRect(x,y-23,1,2);if(on){eg.fillStyle=p.c;eg.fillRect(x-1,y-21,3,4)}}
  else{lg.fillStyle='rgba(0,0,0,.35)';lg.fillRect(x-8,y,17,2);lg.fillStyle='#24223c';lg.fillRect(x-8,y-9,17,9);lg.fillStyle='#2e2c4c';lg.fillRect(x-6,y-12,13,3);lg.fillRect(x-4,y-14,9,2);lg.fillStyle=C.goldD;lg.fillRect(x-8,y-9,17,1);lg.fillStyle='#16152a';for(let i=-6;i<7;i+=3)lg.fillRect(x+i,y-7,2,6)}}
function blob(x,yb,sc,sq,body,rows){for(const [rw,dy] of rows){const ww=Math.round(rw*sc*(1+sq*.4)),hh=sc*(1-sq*.3);lg.fillStyle=body;lg.fillRect(x-(ww>>1),yb+Math.round(dy*hh),ww,Math.max(1,Math.ceil(hh)))}}
const ROWS={shadow:[[4,-11],[8,-10],[10,-9],[10,-8],[10,-7],[10,-6],[10,-5],[8,-4],[10,-3],[10,-2]],gun:[[3,-17],[5,-16],[5,-15],[4,-14],[6,-13],[6,-12],[6,-11],[6,-10],[6,-9],[6,-8],[6,-7],[7,-6],[7,-5],[8,-4],[8,-3],[8,-2]],bomb:[[4,-11],[8,-10],[10,-9],[12,-8],[12,-7],[12,-6],[12,-5],[12,-4],[10,-3],[8,-2]]};
function drawEnemy(e){const x=Math.round(e.x+ox)+(e.hit>0.04?(Math.floor(tAll*60)%2?1:-1):0),y=Math.round(e.y+oy),z=Math.round(e.z);const kind=e.kind,big=kind===1||kind>=4;
  if(e.spawn>0){const k=clamp(1-e.spawn/(big?1.2:.7),0,1),s=kind===5?3:kind===4?2.2:big?2:1;lg.fillStyle='rgba(8,6,15,'+(.4+.5*k)+')';lg.beginPath();lg.ellipse(x,y,(3+6*k)*s,(1+2*k)*s,0,0,TAU);lg.fill();for(let i=0;i<3*s;i++)lg.fillRect(x-3*s+i*3,y-Math.round(k*7*s*Math.abs(Math.sin(tAll*9+i))),1,Math.round(k*7*s));if(rnd()<.3){eg.fillStyle=C.red;eg.fillRect(x+(rnd()*6|0)-3,y-2,1,1)}return}
  const w=Math.sin(e.t*10)>0?1:0,sq=e.sq||0,hitc=e.hit>0;const body=hitc?'#ffffff':'#0a0812',edge=hitc?'#ffffff':'#3a2560';const sc=kind===5?3.2:kind===4?2.4:kind===1?2:1;
  lg.fillStyle='rgba(0,0,0,.45)';lg.fillRect(x-5*sc,y,11*sc,2);
  const yb=y-z-w;
  if(kind===4||kind===5){eg.globalAlpha=.35+.15*Math.sin(tAll*4);eg.strokeStyle=kind===5?C.red:'#9a5cff';eg.beginPath();eg.ellipse(x,y,14*sc*.7,5*sc*.7,0,0,TAU);eg.stroke();eg.globalAlpha=1}
  if(kind===2){blob(x,yb,1,sq,body,ROWS.gun);lg.fillStyle=edge;lg.fillRect(x-5,yb-17,10,1);lg.fillStyle=body;lg.fillRect(x-3,yb-20,6,3);// fedora
    const gx=e.st===1?e.ax:e.f,gy=e.st===1?e.ay:0;line(lg,x,yb-9,x+gx*8,yb-9+gy*5,hitc?'#fff':'#5b616d');const ex=x+(e.f>0?0:-2);lg.fillStyle=C.red;lg.fillRect(ex,yb-14,1,1);lg.fillRect(ex+2,yb-14,1,1);eg.fillStyle=C.red;eg.fillRect(ex,yb-14,1,1);eg.fillRect(ex+2,yb-14,1,1)}
  else if(kind===3){const fl=e.st===2&&Math.sin(tAll*30)>0;blob(x,yb,1,sq,fl?'#5a0f22':body,ROWS.bomb);lg.fillStyle=edge;lg.fillRect(x-2,yb-12,4,1);lg.fillStyle='#8a6a3a';lg.fillRect(x,yb-15,1,3);const sp=e.st===2?'#ffffff':'#ff7a3a';lg.fillStyle=sp;lg.fillRect(x,yb-16,1,1);eg.fillStyle=sp;eg.fillRect(x-1,yb-17,3,3);
    lg.fillStyle=C.red;lg.fillRect(x-2,yb-7,1,2);lg.fillRect(x+2,yb-7,1,2);eg.fillStyle=C.red;eg.fillRect(x-2,yb-7,1,2);eg.fillRect(x+2,yb-7,1,2)}
  else{blob(x,yb,sc,sq,body,ROWS.shadow);lg.fillStyle=edge;lg.fillRect(x-2*sc,yb-12*sc,4*sc,1);
    if(big){lg.fillStyle=hitc?'#fff':'#2a1c40';const hs=sc/2;lg.fillRect(x-9*hs,yb-26*hs,2*hs,4*hs);lg.fillRect(x-10*hs,yb-28*hs,1*hs,2*hs);lg.fillRect(x+7*hs,yb-26*hs,2*hs,4*hs);lg.fillRect(x+9*hs,yb-28*hs,1*hs,2*hs)}
    if(kind>=4){lg.fillStyle=C.gold;const cw=Math.round(8*sc);for(let i=0;i<5;i++)lg.fillRect(x-cw/2+i*cw/4,yb-12*sc-3-(i%2?2:4),2,(i%2?2:4));lg.fillRect(x-cw/2,yb-12*sc-2,cw+2,2)}
    lg.fillStyle=body;for(let i=-4*sc;i<=4*sc;i+=2)lg.fillRect(x+i,yb-1+w,1,1+((i+Math.round(e.t*8))&1));
    const ex=x+(e.f>0?0:-3*sc);lg.fillStyle=C.red;eg.fillStyle=C.red;const ew=Math.max(1,Math.round(sc)),eh=2*ew;
    lg.fillRect(ex,yb-8*sc,ew,eh);lg.fillRect(ex+3*sc,yb-8*sc,ew,eh);eg.fillRect(ex,yb-8*sc,ew,eh);eg.fillRect(ex+3*sc,yb-8*sc,ew,eh);if(kind===5){lg.fillRect(ex+1.5*sc,yb-10*sc,ew,eh);eg.fillRect(ex+1.5*sc,yb-10*sc,ew,eh)}}
  if(e.burn){eg.fillStyle='#ff7a3a';eg.fillRect(x-1,yb-14*Math.min(sc,1.5),2,2)}
  if(kind===1||kind===4){const bw=kind===4?36:24,p=Math.max(0,e.hp/e.max),top=yb-(kind===4?38:34);lg.fillStyle='#0a0812';lg.fillRect(x-bw/2-1,top,bw+2,3);lg.fillStyle=C.red;lg.fillRect(x-bw/2,top+1,Math.round(bw*p),1);eg.fillStyle=C.red;eg.fillRect(x-bw/2,top+1,Math.round(bw*p),1)}
  if(kind===2&&e.st===1){const lock=e.stt<=.25;eg.globalAlpha=lock?.95:.45;eg.strokeStyle=C.red;if(!lock)eg.setLineDash([4,4]);eg.beginPath();eg.moveTo(x,yb-9);eg.lineTo(x+e.ax*240,yb-9+e.ay*190);eg.stroke();eg.setLineDash([]);eg.globalAlpha=1}}
let hiQ=[];
function queueHead(c,x,y,F,sx,sy,al,rot){if(!c.hc)c.hc=mk(S*2,S*2);const h=c.hc.getContext('2d');h.clearRect(0,0,S*2,S*2);
  const hop=lampHop(c),p=LAMP.head,r=p.r,hx=69,hy=76+hop.y0*2,hb=Math.sin(c.t*2.2)*.03;h.save();h.translate(hx,hy);h.rotate(hb);h.drawImage(LIMG,r[0],r[1],r[2],r[3],-Math.round(p.pv[0]),-Math.round(p.pv[1]),r[2],r[3]);
  const lids=(c.blink>0||c.state==='down')?[LAMP.eyeL,LAMP.eyeR]:c.wink>0?[LAMP.eyeR]:[];for(const e of lids){const ex=e[0]-p.pv[0],ey=e[1]-p.pv[1];h.fillStyle=LAMP.skin;h.fillRect(Math.round(ex-3),Math.round(ey-3),6,6);h.fillStyle='#3a1a10';h.fillRect(Math.round(ex-3),Math.round(ey+1),6,1)}
  h.restore();if(c.hit>0){h.globalCompositeOperation='source-atop';h.fillStyle='rgba(255,255,255,.85)';h.fillRect(0,0,S*2,S*2);h.globalCompositeOperation='source-over'}
  hiQ.push([c.hc,x,y,F,sx,sy,al,rot]);hiQ.ys=c.y}
function hblit(c,img,x,y,f,sx=1,sy=1,al=1,rot=0){if(c.spr.width<=S||c.spr.k===1){if(img===c.fin)c._fb=[x,y,f,sx,sy,al,rot,tAll];return blit(lg,img,x,y,f,sx,sy,al,rot)}c.snaps=c.snaps||[];const i=c.snapN++;let s=c.snaps[i];if(!s){s=mk(img.width,img.height);c.snaps[i]=s}const sg=s.getContext('2d');sg.clearRect(0,0,s.width,s.height);sg.drawImage(img,0,0);hiQ.push([s,x,y,f,sx,sy,al,rot]);hiQ.ys=c.y}
/* ---- sprite sheets: drop PNG strips into sprites/<warden|lamp>/<anim>.png and they replace the drawn characters ---- */
const SPR={warden:{},lamp:{}},SPR_ANIMS={warden:['idle','walk','attack1','attack2','attack3','spin','leap','cast','hurt','down'],lamp:['idle','walk','shoot','cast','twirl','hurt','down']};
function prepSheet(im){const fh=im.height,n=Math.max(1,Math.round(im.width/fh)),out=[];
  for(let i=0;i<n;i++){const f=mk(S,S),g=f.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(im,i*fh,0,fh,fh,0,0,S,S);
    const e=mk(S,S),eg2=e.getContext('2d'),d=g.getImageData(0,0,S,S),ed=eg2.createImageData(S,S);let lx=0,ly=0,ln=0;
    for(let p=0;p<S*S;p++){const r=d.data[p*4],gg=d.data[p*4+1],b=d.data[p*4+2],a=d.data[p*4+3];if(a<128)continue;const mx=Math.max(r,gg,b),mn=Math.min(r,gg,b),v=mx/255,s=mx?(mx-mn)/mx:0;
      if(v>.78&&s>.45){ed.data[p*4]=r;ed.data[p*4+1]=gg;ed.data[p*4+2]=b;ed.data[p*4+3]=200}
      if(v>.85&&r>200&&gg>120&&b<140&&r>=gg){lx+=p%S;ly+=(p/S)|0;ln++}}
    eg2.putImageData(ed,0,0);out.push({c:f,e,lan:ln>=2?[lx/ln,ly/ln]:null})}
  return out}
const ROTS=['east','south-east','south','south-west','west','north-west','north','north-east'],TW=84,TALL=80,TFX=42,TFY=72;
const SPR_SCALE={lamp:.8};let PREP_CLS='';
function prepTall(im,sx=0,sw=im.width,sh=im.height){const ks=SPR_SCALE[PREP_CLS]||1;const t=mk(sw,sh),tg=t.getContext('2d');tg.drawImage(im,sx,0,sw,sh,0,0,sw,sh);const d=tg.getImageData(0,0,sw,sh).data;let bot=sh-1;
  for(let y=sh-1;y>=0;y--){let any=false;for(let x=0;x<sw;x++)if(d[(y*sw+x)*4+3]>100){any=true;break}if(any){bot=y;break}}
  const f=mk(TW,TALL),g=f.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(t,0,0,sw,sh,Math.round(TFX-sw*ks/2),Math.round(TFY-1-bot*ks),Math.round(sw*ks),Math.round(sh*ks));
  const e=mk(TW,TALL),eg2=e.getContext('2d'),fd=g.getImageData(0,0,TW,TALL),ed=eg2.createImageData(TW,TALL);let lx=0,ly=0,ln=0;
  for(let p=0;p<TW*TALL;p++){const r=fd.data[p*4],gg=fd.data[p*4+1],b=fd.data[p*4+2],a=fd.data[p*4+3];if(a<128)continue;const mx=Math.max(r,gg,b),mn=Math.min(r,gg,b),v=mx/255,s=mx?(mx-mn)/mx:0;
    if(v>.7&&s>.45){ed.data[p*4]=r;ed.data[p*4+1]=gg;ed.data[p*4+2]=b;ed.data[p*4+3]=170}if(v>.85&&r>200&&gg>120&&b<140&&r>=gg){lx+=p%TW;ly+=(p/TW)|0;ln++}}
  eg2.putImageData(ed,0,0);return{c:f,e,lan:ln>=2?[lx/ln-(TFX-FX),ly/ln-(TFY-FY)]:null,tall:1}}
function stripFrames(im){const fh=im.height,n=Math.max(1,Math.round(im.width/fh)),o=[];for(let i=0;i<n;i++)o.push(prepTall(im,i*fh,fh,fh));return o}
(function loadWalks(){for(const cls of ['warden','lamp']){const arr=[];let got=0;ROTS.forEach((d,i)=>{const im=new Image();im.onload=()=>{PREP_CLS=cls;arr[i]=stripFrames(im);SPR[cls].walk8=arr};im.onerror=()=>{};im.src='sprites/'+cls+'/walk/'+d+'.png'})}})();
(function loadDirAnims(){for(const [cls,names] of [['warden',['attack','attack2','attack3','spin','hurt','down','leap','cast']],['lamp',['shoot','cast','hurt','down','twirl']]])for(const nm of names)ROTS.forEach((d,i)=>{const im=new Image();im.onload=()=>{PREP_CLS=cls;const s=SPR[cls];(s[nm+'8']=s[nm+'8']||[])[i]=stripFrames(im)};im.onerror=()=>{};im.src='sprites/'+cls+'/'+nm+'/'+d+'.png'})})();
// pick a direction's frames; missing directions borrow the mirrored or nearest one
function dirFrames(arr,di){if(!arr)return null;if(arr[di])return{fr:arr[di],flip:1};const mir=(12-di)%8;if(arr[mir])return{fr:arr[mir],flip:-1};
  for(let k=1;k<4;k++)for(const d of [(di+k)%8,(di+8-k)%8]){if(arr[d])return{fr:arr[d],flip:1};const m=(12-d)%8;if(arr[m])return{fr:arr[m],flip:-1}}return null}
(function loadRots(){for(const cls of ['warden','lamp'])for(const [dir,key] of [['rot','rot'],['spinrot','spinRot']]){const arr=[];let got=0;ROTS.forEach((d,i)=>{const im=new Image();im.onload=()=>{PREP_CLS=cls;arr[i]=prepTall(im);if(++got===8)SPR[cls][key]=arr};im.onerror=()=>{};im.src='sprites/'+cls+'/'+dir+'/'+d+'.png'})}})();
function dirIdx(dx,dy){return(Math.round(Math.atan2(dy,dx)/(Math.PI/4))+8)%8}
(function loadSprites(){for(const cls in SPR_ANIMS)for(const a of SPR_ANIMS[cls]){const im=new Image();im.onload=()=>{SPR[cls][a]=prepSheet(im)};im.onerror=()=>{};im.src='sprites/'+cls+'/'+a+'.png'}})();
function spriteFor(c){const set=SPR[c.cls];if(set&&set.rot&&!set.idle){
    if(c.cls==='warden'&&(c.ww>0||c.bs>0)){c.sprAnim='spin';return(set.spinRot||set.rot)[Math.floor(tAll*(c.bs>0?24:18))%8]}
    const mov=c.moving&&(Math.abs(c.mx)>.2||Math.abs(c.my)>.2);
    if(mov)c.dirI=dirIdx(c.mx,c.my*1.2);else if(c.atk>0)c.dirI=dirIdx(Math.cos(c.adir),Math.sin(c.adir)/1.4);else if(c.cls==='lamp'&&(c.shootT>0||c.cast||c.ch>0)){const A=c.aim;c.dirI=A&&(c.cast||c.ch>0)?dirIdx(A[0],A[1]):(c.f>0?0:4)}
    else if(c.dirI===undefined)c.dirI=c.f>0?0:4;
    if(c.dirI===undefined)c.dirI=0;c.sprAnim=c.state==='down'?'downRot':'rot';c.sprFlip=1;
    // Lamplighter: shoot frames while firing in place; Lance holds the release frame
    if(c.cls==='lamp'&&c.state==='ok'&&set.shoot8&&!c.moving&&(c.shootT>0||c.cast||c.ch>0)){const df=dirFrames(set.shoot8,c.dirI);if(df){const fr=df.fr,n=fr.length;let i;
      if(c.cast)i=Math.min(n-2,Math.floor(clamp(c.cast.t/c.cast.dur,0,1)*(n-1)));else if(c.ch>0)i=n-2;else i=Math.min(n-1,2+Math.floor(clamp(1-c.shootT/.3,0,1)*(n-2)));
      c.sprAnim='shoot8';c.sprFlip=df.flip;return fr[i]}}
    // casting (Dome): raise the axes over the cast, hold the roar briefly after
    if(c.state==='ok'&&set.cast8&&(c.cast||c.pose>0)){const df=dirFrames(set.cast8,c.dirI);if(df){const fr=df.fr,n=fr.length,p=c.cast?clamp(c.cast.t/c.cast.dur,0,1)*.75:.75+.25*clamp(1-c.pose/.3,0,1);c.sprAnim='cast8';c.sprFlip=df.flip;return fr[Math.min(n-1,Math.floor(p*n))]}}
    // Heroic Leap: crouch, axes raised overhead in the air, double-slam frames on landing
    if(c.cls==='warden'&&c.state==='ok'){const air=(c.z||0)>1.5;if(air)c.wasAir=true;else if(c.wasAir){c.wasAir=false;c.landT=.3}
      const ls=set.leap8||set.attack38;if(ls&&(air||c.landT>0)){const df=dirFrames(ls,c.dirI);if(df){const fr=df.fr,n=fr.length;let i;
        if(set.leap8){const p=c.leap?clamp(c.leap.t/c.leap.dur,0,1):air?.5:1;i=Math.min(n-1,Math.floor(p*n))}
        else i=air?(c.leap&&c.leap.t<.08?2:n-3):(c.landT>.11?n-2:n-1);
        c.sprAnim='leap8';c.sprFlip=df.flip;return fr[i]}}}
    const atkSet=c.heavy===2?(set.attack28||set.attack8):c.heavy===1?(set.attack38||set.attack8):set.attack8;if(c.cls==='warden'&&c.atk>0&&c.state==='ok'&&atkSet){const di=dirIdx(Math.cos(c.adir),Math.sin(c.adir)/1.4),df=dirFrames(atkSet,di);if(df){c.dirI=di;const fr=df.fr,n=fr.length,p=clamp(1-c.atk/c.atkDur,0,1),at=c.heavy===1?.4:.32;
      const i=p<at?Math.min(n-3,1+Math.floor(p/at*(n-3))):Math.min(n-1,n-2+((p-at)/(1-at)>.35?1:0));c.sprAnim='attack8';c.sprFlip=df.flip;return fr[i]}}if(set.walk8&&c.moving&&c.state==='ok'&&!c.leap){const df=dirFrames(set.walk8,c.dirI);if(df){const fr=df.fr;c.sprAnim='walk8';c.sprFlip=df.flip;return fr[Math.floor(((c.walk*(c.cls==='lamp'?.5:.66))%1)*fr.length)]}}return set.rot[c.dirI]}
  if(!set||!set.idle)return null;let a='idle',p=null;
  if(c.state==='down'){a='down';p=1}
  else if(c.cls==='warden'){if(c.ww>0||c.bs>0)a='spin';else if(c.leap||(c.z||0)>2){a='leap';p=c.leap?clamp(c.leap.t/c.leap.dur,0,1):.5}else if(c.cast||c.pose>0){a='cast';p=c.cast?clamp(c.cast.t/c.cast.dur,0,1):1}
    else if(c.atk>0){a=c.heavy===1?'attack3':c.heavy===2?'attack2':'attack1';p=clamp(1-c.atk/c.atkDur,0,1)}else if(c.hit>0){a='hurt';p=clamp(1-c.hit/.18,0,1)}else if(c.moving)a='walk'}
  else{if(c.cast||c.ch>0){a='cast';p=c.cast?clamp(c.cast.t/c.cast.dur,0,1)*.5:.5+.5*clamp(1-c.ch/1.2,0,1)}else if(c.twl>0){a='twirl';p=clamp(1-c.twl/.5,0,1)}else if(c.hit>0){a='hurt';p=clamp(1-c.hit/.18,0,1)}else if(c.moving)a='walk';else if(c.shootT>0){a='shoot';p=clamp(1-c.shootT/.25,0,1)}}
  let fr=set[a];if(!fr){fr=set.idle;a='idle';p=null}const n=fr.length;let i;
  if(p!==null)i=Math.min(n-1,Math.floor(p*n));else if(a==='walk')i=Math.floor(((c.cls==='lamp'?c.walk/2:c.walk)%1)*n);else i=Math.floor(c.t*(a==='spin'?14:8))%n;
  c.sprAnim=a;return fr[i]}
function drawChar(c){c.snapN=0;if(c.state==='out')return;const sp=spriteFor(c);
  if(sp&&sp.tall&&c.spr.height!==TALL){for(const k of ['spr','sem','fin','tint','ol']){c[k]=mk(TW,TALL);c[k].fy=TFY;c[k].fx=TFX;c[k].k=1}c.g=c.spr.getContext('2d');c.m=c.sem.getContext('2d')}
  if(sp){const H=c.spr.height,Wd=c.spr.width;c.g.clearRect(0,0,Wd,H);c.g.drawImage(sp.c,0,0);c.m.clearRect(0,0,Wd,H);c.m.drawImage(sp.e,0,0);if(c.cls==='lamp')c.lantern=sp.lan||[44,22];c.hiHead=false}
  else if(c.cls==='warden')drawWarden(c);else if(c.spr.width>S&&LIMG.complete&&LIMG.naturalWidth)drawLampArt(c);else drawLamp(c);
  const sheetSpin=sp&&c.sprAnim==='spin',sheetTwirl=sp&&c.sprAnim==='twirl',rotSpr=sp&&(c.sprAnim==='shoot8'||c.sprAnim==='leap8'||c.sprAnim==='cast8'||c.sprAnim==='rot'||c.sprAnim==='spin'||c.sprAnim==='downRot'||c.sprAnim==='walk8'||c.sprAnim==='attack8');
  let sx=1,sy=1,rot=0;if(c.dash>0){sx=1.3;sy=.82}else if(c.sq){sx=1-c.sq;sy=1+c.sq}if(c.cast){const k=clamp(c.cast.t/c.cast.dur,0,1);sx=1+k*.12;sy=1-k*.12;if(c.cls==='lamp')rot=-c.f*.22*k}
  let x=c.x+ox+(c.rx||0),y0=c.y+oy,zz=Math.round(c.z||0),y=y0-zz+(c.ry||0),F=rotSpr?(c.sprFlip||1):(sheetSpin||sheetTwirl)?c.f:(c.cls==='warden'&&(c.ww>0||c.bs>0))?(Math.cos(c.wph||0)>=0?1:-1):(c.ww>0||c.bs>0||c.twl>0)?(Math.floor(tAll*(c.bs>0?18:14))%2?1:-1):c.f;if(!sheetSpin&&c.cls==='warden'&&(c.ww>0||c.bs>0))sx*=Math.max(.3,Math.abs(Math.cos(c.wph||0)));if(zz>2){sx*=1.1;sy*=1.1}if(rotSpr&&c.state==='ok'){if(c.moving&&!c.leap&&c.sprAnim!=='walk8')y-=Math.round(Math.abs(Math.sin(c.walk*TAU))*(c.cls==='lamp'?4:2));if(c.atk>0&&c.sprAnim!=='attack8'){const p=1-c.atk/c.atkDur;rot=Math.sin(p*Math.PI)*(c.heavy===1?.18:.1)*(Math.cos(c.adir)>=0?1:-1)}}lg.fillStyle='rgba(0,0,0,.45)';lg.beginPath();lg.ellipse(Math.round(x),Math.round(y0),(c.cls==='warden'?10:8)*(1-zz/60),3,0,0,TAU);lg.fill();if(c.state==='ok'){eg.globalAlpha=c.idx===ME?.85:.5;eg.strokeStyle=CL[c.cls].color;eg.beginPath();eg.ellipse(Math.round(x),Math.round(y0)+1,c.cls==='warden'?13:11,5,0,0,TAU);eg.stroke();eg.globalAlpha=1}
  if(c.state==='down'){rot=sp&&c.sprAnim==='down'?0:(rotSpr?1.3:c.f*1.3);sx=1;sy=1}
  const inv=c.inv>0&&c.state==='ok'&&Math.floor(tAll*20)%2;
  const fin=buildFin(c,c.pow>0?C.amber:c.enr>0||c.bs>0?C.red:'#05040a');if(c.hiHead&&c.cls==='lamp')queueHead(c,x,y-(c.state==='down'?4:0),F,sx,sy,c.state==='down'?.7:inv?.55:1,rot);hblit(c,fin,x,y-(c.state==='down'?4:0),F,sx,sy,c.state==='down'?.7:inv?.55:1,rot);if(c.state!=='down')blit(eg,c.sem,x,y,F,sx,sy);
  if((c.pow>0||c.enr>0||c.bs>0)&&c.state==='ok'){const o=c.ol.getContext('2d');o.clearRect(0,0,c.ol.width,c.ol.height);o.drawImage(fin,0,0);o.globalCompositeOperation='destination-out';o.drawImage(c.spr,0,0);o.globalCompositeOperation='source-over';blit(eg,c.ol,x,y,F,sx,sy,.6+.2*Math.sin(tAll*8))}
  if(c.cast){blit(eg,tintOf(c,c.cls==='warden'?C.cyan:C.amber),x,y,F,sx,sy,clamp(c.cast.t/c.cast.dur,0,1)*.5)}
  if(c.hit>0)hblit(c,tintOf(c,'#ffffff'),x,y,F,sx,sy,.9,rot);
  if(c.state==='down'){const rx=Math.round(x),ry=Math.round(y);lg.strokeStyle='rgba(255,42,92,.7)';lg.beginPath();lg.ellipse(rx,ry,30,13,0,0,TAU);lg.stroke();
    eg.strokeStyle=C.red;eg.lineWidth=2;eg.beginPath();eg.arc(rx,ry-26,6,-Math.PI/2,-Math.PI/2+TAU*clamp(c.down/20,0,1));eg.stroke();
    if(c.rev>0){eg.strokeStyle=C.heal;eg.beginPath();eg.ellipse(rx,ry,30,13,0,-Math.PI/2,-Math.PI/2+TAU*clamp(c.rev/2.5,0,1));eg.stroke()}eg.lineWidth=1}
  if(c.idx===ME&&c.state==='ok'){const col=CL[c.cls].color,yy=Math.round(y-(c.spr.height>S?64:c.cls==='warden'?48:42)+Math.sin(tAll*4));lg.fillStyle=col;lg.fillRect(Math.round(x)-1,yy,3,1);lg.fillRect(Math.round(x),yy+1,1,1);eg.fillStyle=col;eg.fillRect(Math.round(x)-1,yy,3,1)}}
function crescent(g,cx,cy,r0,rr,a0,a1,col,al){const n=24;g.globalAlpha=al;g.fillStyle=col;g.beginPath();for(let i=0;i<=n;i++){const a=a0+(a1-a0)*i/n;g.lineTo(cx+Math.cos(a)*rr,cy+Math.sin(a)*rr*.62)}for(let i=n;i>=0;i--){const t=i/n,a=a0+(a1-a0)*t,ri=rr-(rr-r0)*Math.sin(Math.PI*t);g.lineTo(cx+Math.cos(a)*ri,cy+Math.sin(a)*ri*.62)}g.closePath();g.fill();g.globalAlpha=1}
function effects(){
  for(const gh of ghosts){const t=tintOf(gh.c,gh.col);blit(lg,t,gh.x+ox,gh.y+oy,gh.f,1,1,gh.life/.25*.45);blit(eg,t,gh.x+ox,gh.y+oy,gh.f,1,1,gh.life/.25*.5)}
  for(const s of slashes){
    if(s.twirl){const c=s.c,lv=s.lv||1,p=s.t/.42,a=-1.57+p*TAU*1.15,cx=c.x+ox,cy=c.y-18+oy,rr=22*(1+.08*(lv-1));const rings=[[eg,WCOL.twirl,5+lv,1-p*.5,rr],[eg,'#fff1c4',2,1-p*.4,rr],[lg,'#fff6d8',2,1-p,rr]];if(lv>=5)rings.push([eg,C.gold,3,1-p,rr*1.45],[lg,'#fff6d8',1,1-p,rr*1.45]);for(const [g,col,w,al,r0] of rings){g.globalAlpha=al;g.strokeStyle=col;g.lineWidth=w;g.save();g.translate(cx,cy);g.scale(1,.56);g.beginPath();g.arc(0,0,r0,a-2.6,a);g.stroke();g.restore()}
      if(rnd()<.7){const lx=c.x+Math.cos(a)*rr,ly=c.y-18+Math.sin(a)*rr*.56;parts.push({x:lx,y:ly,vx:(rnd()-.5)*30,vy:-10-rnd()*20,life:.4,max:.4,col:rnd()<.5?WCOL.twirl:'#fff1c4',em:true})}lg.globalAlpha=eg.globalAlpha=1;lg.lineWidth=eg.lineWidth=1;continue}
    const full=s.span&&s.span>3,hv=s.heavy===1,rv=s.heavy===2,dur=hv?.34:.26,sweep=Math.min(1,s.t/(full?.12:.07)),fade=s.t<.07?1:1-(s.t-.07)/(dur-.07);const span=(s.span||(hv?3.2:2.7))*sweep*(rv?-1:1),a0=full?s.a+tAll*3:rv?s.a+1.35:s.a-(hv?1.6:1.35),cx=s.x+ox,cy=s.y+oy;
    crescent(eg,cx,cy,s.r*.35,s.r*1.08,a0,a0+span,s.col,.95*fade);crescent(eg,cx,cy,s.r*.2,s.r*1.2,a0-.15,a0+span*.85,s.col,.35*fade);crescent(lg,cx,cy,s.r*.72,s.r,a0+span*.15,a0+span,'#f2fdff',fade);crescent(lg,cx,cy,s.r*.55,s.r*.9,a0,a0+span*.6,s.col===C.cyan?'rgba(79,240,255,.5)':'rgba(255,255,255,.4)',fade*.8)}
  for(const c of chars){if(c.state!=='ok'||!(c.ww>0||c.bs>0))continue;const st=c.bs>0,R=st?54:(c.wwR||46),cx=c.x+ox,cy=c.y-10+oy,a=tAll*(st?22:16);
    for(let i=0;i<(st?3:2);i++){const b=a+i*TAU/(st?3:2);crescent(eg,cx,cy,R*.55,R*1.02,b,b+1.6,C.cyan,st?.5:.45);crescent(lg,cx,cy,R*.86,R,b+.6,b+1.6,'#f2fdff',.75);if(st)crescent(eg,cx,cy,R*.8,R*.95,b+.9,b+1.6,C.red,.35)}
    eg.globalAlpha=.35;eg.strokeStyle=st?C.red:C.cyan;eg.lineWidth=2;eg.beginPath();eg.ellipse(Math.round(cx),Math.round(c.y+oy),R,R*.42,0,0,TAU);eg.stroke();eg.lineWidth=1;eg.globalAlpha=1;
    if(rnd()<.9){const pa=rnd()*TAU;parts.push({x:c.x+Math.cos(pa)*R,y:c.y-10+Math.sin(pa)*R*.62,vx:-Math.sin(pa)*120,vy:Math.cos(pa)*70,life:.2,max:.2,col:st?'#ffffff':C.cyan,em:true,streak:1})}}
  if(dome){const s=domeScale(),col=dome.sanct>0?C.amber:C.cyan,x=dome.x+ox,y=dome.y+oy,rx=40*s,ry=36*s;
    lg.globalAlpha=.08;lg.fillStyle=col;lg.beginPath();lg.ellipse(x,y,rx,ry,0,Math.PI,TAU);lg.ellipse(x,y,rx,18*s,0,0,Math.PI);lg.fill();lg.globalAlpha=1;
    eg.strokeStyle=col;eg.globalAlpha=.85;eg.beginPath();eg.ellipse(x,y,rx,ry,0,Math.PI,TAU);eg.stroke();eg.globalAlpha=.3;const rot=(tAll*.6)%1;for(let k=0;k<4;k++){const kk=Math.cos(((k/4+rot)%1)*Math.PI);eg.beginPath();eg.ellipse(x,y,Math.abs(rx*kk),ry,0,Math.PI,TAU);eg.stroke()}
    for(const h of [.35,.7]){eg.beginPath();eg.ellipse(x,y-ry*h,rx*Math.sqrt(1-h*h),18*s*Math.sqrt(1-h*h)*.6,0,Math.PI,TAU);eg.stroke()}
    eg.globalAlpha=.9;eg.fillStyle=col;eg.fillRect(Math.round(x)-1,Math.round(y-ry)-2,3,2);eg.globalAlpha=1;
    if(dome.sanct>0)for(let i=0;i<10;i++){const a=i/10*TAU+tAll*.8;line(eg,x+Math.cos(a)*rx*.3,y-ry*.4+Math.sin(a)*ry*.15,x+Math.cos(a)*rx*1.25,y-ry*.4+Math.sin(a)*ry*.5,'rgba(255,200,97,.35)')}}
  for(const r of rays){const p=r.t/.7,x=r.x+ox,y=r.y+oy;eg.globalAlpha=(1-p)*.55;eg.fillStyle=C.amber;for(let i=0;i<12;i++){const a=i/12*TAU+p*.6,L=40+p*120;eg.beginPath();eg.moveTo(x,y);eg.lineTo(x+Math.cos(a-.08)*L,y+Math.sin(a-.08)*L*.7);eg.lineTo(x+Math.cos(a+.08)*L,y+Math.sin(a+.08)*L*.7);eg.fill()}eg.globalAlpha=1;circ(eg,x,y,Math.round(6*(1-p))+1,'rgba(255,241,196,'+(1-p)+')')}
  for(const c of chars){if(c.cls!=='lamp'||!c.moth||c.state==='out')continue;const x=Math.round(c.moth.x+ox),y=Math.round(c.moth.y+oy),up=Math.sin(tAll*26)>0;lg.fillStyle='#fff1c4';lg.fillRect(x,y-1,1,3);lg.fillStyle='#ff9ccf';if(up){lg.fillRect(x-3,y-3,3,2);lg.fillRect(x+1,y-3,3,2)}else{lg.fillRect(x-3,y,3,2);lg.fillRect(x+1,y,3,2)}eg.fillStyle='rgba(255,111,180,.8)';eg.fillRect(x-3,y-2,7,4);eg.fillStyle='#fff1c4';eg.fillRect(x,y-1,1,2)}
  drawBeamsAndLances();
  // projectiles
  for(const p of proj){const x=Math.round(p.x+ox),y=Math.round(p.y+oy);
    if(p.k==='mote'){const lv=p.lv||1;circ(eg,x,y,3+(lv>=3?1:0)+(lv>=5?1:0),WCOL.twirl);circ(lg,x,y,lv>=3?2:1,'#fff6d8');lg.fillStyle='#ffffff';lg.fillRect(x,y,1,1)}
    else if(p.k==='moth'){const up=Math.sin(tAll*28+p.x)>0,ws=(p.lv||1)>=5?4:3;lg.fillStyle='#ffd3ec';if(up){lg.fillRect(x-ws,y-3,ws,3);lg.fillRect(x+1,y-3,ws,3)}else{lg.fillRect(x-ws,y,ws,2);lg.fillRect(x+1,y,ws,2)}lg.fillStyle='#ffffff';lg.fillRect(x,y-2,1,4);eg.fillStyle=WCOL.moths;eg.fillRect(x-ws-1,y-3,ws*2+3,5)}
    else if(p.k==='shield'){const a=tAll*22,ca=Math.cos(a),sa=Math.sin(a);line(lg,x-ca*5,y-sa*5,x+ca*5,y+sa*5,'#6a4a30');for(let k=1;k<=4;k++){R(lg,x+ca*4-sa*k,y+sa*4+ca*k,2,1,k===4?'#f2fbff':'#9aa8c4')}R(eg,x+ca*4-sa*4,y+sa*4+ca*4,2,2,C.cyan);circ(eg,x,y,4,'rgba(79,240,255,.35)')}
    else if(p.k==='blade'){crescent(eg,x,y,6,14,p.a-1.2,p.a+1.2,C.cyan,.9);crescent(lg,x,y,10,13,p.a-1,p.a+1,'#f2fdff',.9)}
    else if(p.k==='lbolt'){const a=p.a||0,ca=Math.cos(a),sa=Math.sin(a),chd=p.child||p.lv===0,h=chd?0:(p.heat!==undefined?p.heat*4:(p.lv||1)-1),Ln=5+h*1.5,r=chd?1:2+(h>2?1:0);
      for(let i=0;i<Ln;i++){const k=i/Ln;eg.globalAlpha=(1-k)*.8;eg.fillStyle=i<2?'#fff1c4':(i%2?C.amber:'#ff9ccf');eg.fillRect(Math.round(x-ca*i)-1,Math.round(y-sa*i)-1,2,2)}eg.globalAlpha=1;
      circ(eg,x,y,r+1,'rgba(255,200,97,.8)');circ(lg,x,y,r,'#fff1c4');lg.fillStyle='#ffffff';lg.fillRect(x,y,1,1)}
    else if(p.k==='refl'){lg.fillStyle=C.cyan;lg.fillRect(x-1,y-1,3,3);eg.fillStyle=C.cyan;eg.fillRect(x-2,y-2,5,5)}
    else if(p.k==='candle'){lg.fillStyle='rgba(0,0,0,.4)';lg.fillRect(x-3,y,7,2);lg.fillStyle='#f3e6c8';lg.fillRect(x-2,y-9,4,9);lg.fillStyle='#d9c9a8';lg.fillRect(x+1,y-9,1,9);lg.fillStyle=C.gold;lg.fillRect(x-3,y-1,7,2);const fl=Math.sin(tAll*25)>0;lg.fillStyle=fl?'#ffffff':'#fff1c4';lg.fillRect(x-1,y-13,2,3);lg.fillStyle=WCOL.candle;lg.fillRect(x-1,y-11,2,1);circ(eg,x,y-12,3,WCOL.candle);
      const pr=clamp(1-(p.fuse??1),0,1),rr=34*(1+.08*((p.lv||1)-1));eg.globalAlpha=.5+.4*pr;eg.strokeStyle=WCOL.candle;eg.lineWidth=2;eg.beginPath();eg.ellipse(x,y,rr,rr*.45,0,0,TAU);eg.stroke();eg.lineWidth=1;lg.globalAlpha=.18*pr+.05;lg.fillStyle=WCOL.candle;lg.beginPath();lg.ellipse(x,y,rr*pr,rr*.45*pr,0,0,TAU);lg.fill();lg.globalAlpha=eg.globalAlpha=1}}
  for(const c of chars){const fp=isHost?c.flyPos:null;if(fp)for(const f of fp)drawFly(f[0],f[1],c.flyLv)}if(!isHost)for(const f of flyG)drawFly(f[0],f[1],f[2]);
  for(const b of eb){const x=Math.round(b.x+ox),y=Math.round(b.y+oy);lg.fillStyle=C.red;lg.fillRect(x-1,y-1,3,3);lg.fillStyle='#fff';lg.fillRect(x,y,1,1);eg.fillStyle=C.red;eg.fillRect(x-2,y-2,5,5)}
  for(const bl of bolts){const pts=bl.pts,a=1-bl.t/.2,col=(bl.lv||1)>=5?'#ffffff':WCOL.chain;for(let i=0;i+3<pts.length;i+=2){let px=pts[i]+ox,py=pts[i+1]+oy;const tx=pts[i+2]+ox,ty=pts[i+3]+oy;for(let s=1;s<=5;s++){const nx=px+(tx-px)/(6-s)+(s<5?(rnd()-.5)*8:0),ny=py+(ty-py)/(6-s)+(s<5?(rnd()-.5)*8:0);eg.globalAlpha=a;for(const [ax,ay] of [[0,0],[1,0],[0,1],[-1,0]])line(eg,px+ax,py+ay,nx+ax,ny+ay,WCOL.chain);lg.globalAlpha=a;line(lg,px,py,nx,ny,'#ffffff');if(s===3&&rnd()<.6){const bx=nx+(rnd()-.5)*14,by=ny+(rnd()-.5)*10;eg.globalAlpha=a*.7;line(eg,nx,ny,bx,by,col)}px=nx;py=ny}
      eg.globalAlpha=a;circ(eg,tx,ty,4,col);lg.globalAlpha=a;lg.fillStyle='#ffffff';lg.fillRect(tx-1,ty-1,3,3)}}lg.globalAlpha=eg.globalAlpha=1;
  for(const p of parts){const a=Math.max(0,p.life/p.max),x=Math.round(p.x+ox),y=Math.round(p.y+oy),g=p.em?eg:lg;g.globalAlpha=p.dust?Math.min(1,a*2)*.5:a;g.fillStyle=p.col;
    if(p.star){const s=Math.round(p.star*a)+1;g.fillRect(x-s,y,s*2+1,1);g.fillRect(x,y-s,1,s*2+1);lg.globalAlpha=a;lg.fillStyle='#fff';lg.fillRect(x-1,y-1,3,3)}
    else if(p.streak){line(g,x,y,x-p.vx*.035,y-p.vy*.035,p.col);lg.globalAlpha=a;lg.fillStyle='#fff';lg.fillRect(x,y,1,1)}
    else if(p.plus){g.fillRect(x-1,y,3,1);g.fillRect(x,y-1,1,3);lg.globalAlpha=a;lg.fillStyle='#e9ffe9';lg.fillRect(x,y,1,1)}
    else{const s=p.sz||1;g.fillRect(x,y,s,s);if(p.em){lg.globalAlpha=a;lg.fillStyle=p.col;lg.fillRect(x,y,1,1)}}}
  lg.globalAlpha=eg.globalAlpha=1}
function beamLine(x1,y1,x2,y2,w,colO,colI,al){eg.globalAlpha=al;eg.strokeStyle=colO;eg.lineWidth=w;eg.lineCap='round';eg.beginPath();eg.moveTo(x1,y1);eg.lineTo(x2,y2);eg.stroke();eg.lineWidth=1;eg.lineCap='butt';
  lg.globalAlpha=al;lg.strokeStyle=colI;lg.lineWidth=Math.max(1,Math.round(w/3));lg.beginPath();lg.moveTo(x1,y1);lg.lineTo(x2,y2);lg.stroke();lg.lineWidth=1;lg.globalAlpha=eg.globalAlpha=1}
function heatCol(h){const r=255,g=Math.round(190+65*h),b=Math.round(90+160*h);return`rgb(${r},${g},${b})`}
function drawBeamsAndLances(){
  const list=isHost?chars.flatMap(c=>c.beams||[]):beamsG;
  for(const bm of list){const [x1,y1,x2,y2,h,k]=bm;const X1=x1+ox,Y1=y1+oy,X2=x2+ox,Y2=y2+oy;const jit=(rnd()-.5);
    if(k===0){const w=3+h*5;beamLine(X1,Y1,X2,Y2+jit,w+3,heatCol(h*.6),'#ffffff',.35);beamLine(X1,Y1,X2,Y2+jit,w,heatCol(h),'#ffffff',.95);circ(eg,X2,Y2,Math.round(3+h*5),heatCol(h));lg.fillStyle='#ffffff';lg.fillRect(Math.round(X2)-1,Math.round(Y2)-1,3,3);
      if(rnd()<.6+h*.4){const a=rnd()*TAU,sp=40+rnd()*60+h*60;parts.push({x:x2,y:y2,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp*.6,life:.2,max:.2,col:heatCol(h),em:true,streak:1})}
      if(rnd()<.35){const k2=rnd();parts.push({x:x1+(x2-x1)*k2,y:y1+(y2-y1)*k2,vx:(rnd()-.5)*10,vy:-12,life:.3,max:.3,col:'#fff1c4',em:true})}
      if(rnd()<.3&&parts.length<480){const k2=rnd();parts.push({x:x1+(x2-x1)*k2+(rnd()-.5)*6,y:y1+(y2-y1)*k2+(rnd()-.5)*4,vx:(rnd()-.5)*14,vy:-18-rnd()*10,life:.45,max:.45,col:rnd()<.6?'#ff6fb4':'#fff1c4',em:true,star:2})}
      if(rnd()<.12+h*.15)parts.push({x:x2+(rnd()-.5)*8,y:y2+(rnd()-.5)*6,vx:0,vy:-10,life:.35,max:.35,col:'#ff9ccf',em:true,star:4})}
    else if(k===1){beamLine(X1,Y1,X2,Y2,3,WCOL.prism,'#f4e8ff',.85);circ(eg,X2,Y2,3,WCOL.prism)}
    else{const g=eg.createLinearGradient(X1,Y1,X2,Y2);g.addColorStop(0,'rgba(255,224,138,.9)');g.addColorStop(1,'rgba(255,224,138,0)');eg.globalAlpha=1;eg.strokeStyle=g;eg.lineWidth=5;eg.beginPath();eg.moveTo(X1,Y1);eg.lineTo(X2,Y2);eg.stroke();eg.lineWidth=1;lg.globalAlpha=.6;lg.strokeStyle='#fff6d8';lg.beginPath();lg.moveTo(X1,Y1);lg.lineTo(X1+(X2-X1)*.7,Y1+(Y2-Y1)*.7);lg.stroke();lg.globalAlpha=1}}
  const lances=isHost?chars.filter(c=>c.lance).map(c=>c.lance):lancesG;
  for(const Ln of lances){const sx=(Ln.sx??Ln.x)+ox,sy=(Ln.sy??Ln.y)+oy,LEN=270,p=Ln.t/Ln.dur,grow=Math.min(1,Ln.t/.08),fade=p>.85?1-(p-.85)/.15:1,wd=13*(Ln.wide||1)*grow*(1+.08*Math.sin(tAll*40));const ex=sx+Ln.dx*LEN,ey=sy+Ln.dy*LEN,nx=-Ln.dy,ny=Ln.dx;
    for(const [g,w,col,al] of [[eg,wd*1.7,'rgba(255,200,97,.5)',fade],[eg,wd,'#fff0a8',fade],[lg,wd*.45,'#ffffff',fade]]){g.globalAlpha=al;g.fillStyle=col;g.beginPath();g.moveTo(sx+nx*w*.4,sy+ny*w*.4);g.lineTo(ex+nx*w,ey+ny*w);g.lineTo(ex-nx*w,ey-ny*w);g.lineTo(sx-nx*w*.4,sy-ny*w*.4);g.closePath();g.fill()}
    circ(eg,sx,sy,Math.round(wd*.9),'#fff6d8');lg.globalAlpha=1;
    for(let i=0;i<3;i++){const k=rnd(),off=(rnd()-.5)*wd*1.6;parts.push({x:sx-ox+Ln.dx*LEN*k+nx*off,y:sy-oy+Ln.dy*LEN*k+ny*off,vx:Ln.dx*160,vy:Ln.dy*110,life:.25,max:.25,col:rnd()<.5?'#fff0a8':C.amber,em:true,streak:1})}
    for(let i=0;i<2&&parts.length<480;i++){const k=rnd(),off=(rnd()-.5)*wd*2.4;parts.push({x:sx-ox+Ln.dx*LEN*k+nx*off,y:sy-oy+Ln.dy*LEN*k+ny*off,vx:(rnd()-.5)*20,vy:-20,life:.5,max:.5,col:rnd()<.6?'#ff6fb4':'#ffffff',em:true,star:3})}
    if(Ln.refr&&dome){const cx=dome.x+ox,cy=dome.y-14+oy,RB=['#ff4f6a','#ffa040','#ffe760','#5fe08a','#4fb8ff','#a46bff'];
      // rainbow halo bands shimmering across the dome
      for(let i=0;i<6;i++){eg.globalAlpha=fade*(.28+.12*Math.sin(tAll*6+i));eg.strokeStyle=RB[i];eg.lineWidth=2;eg.beginPath();eg.ellipse(Math.round(cx),Math.round(cy+14),30-i*3.2,26-i*3,0,Math.PI,TAU);eg.stroke()}eg.lineWidth=1;eg.globalAlpha=1;
      // dispersion fan where the lance enters
      const ex0=cx-Ln.dx*34,ey0=cy-Ln.dy*20;for(let i=0;i<6;i++){const sp=(i-2.5)*.07,ca=Math.cos(sp),sa=Math.sin(sp),dx=Ln.dx*ca-Ln.dy*sa,dy=Ln.dx*sa+Ln.dy*ca;beamLine(ex0,ey0,ex0+dx*40,ey0+dy*28,2,RB[i],RB[i],fade*.8)}
      // refracted beams, one per colour of the spectrum
      for(let i=0;i<6;i++){const a=i/6*TAU+Ln.t*1.2;beamLine(cx,cy,cx+Math.cos(a)*150,cy+Math.sin(a)*90,6,RB[i],'#ffffff',fade*.95)}
      circ(eg,cx,cy,8,'#ffffff');
      for(let i=0;i<3&&parts.length<500;i++){const a=rnd()*TAU,r=rnd()*34;parts.push({x:dome.x+Math.cos(a)*r,y:dome.y-14+Math.sin(a)*r*.7,vx:Math.cos(a)*20,vy:-18-rnd()*12,life:.5,max:.5,col:RB[(rnd()*6)|0],em:true,star:rnd()<.4?3:0})}}
    eg.globalAlpha=lg.globalAlpha=1}
  // Lance drag preview
  if(aimDrag){const me2=meC(),dx0=aimDrag.x-aimDrag.ox,dy0=aimDrag.y-aimDrag.oy,l0=len(dx0,dy0);if(me2&&l0>18){const dx=dx0/l0,dy=dy0/l0,[lx,ly]=lanternPos(me2),sx=lx+ox,sy=ly+oy,wd=13*(me2.mods.has('brightflare')?1.4:1);
    lg.globalAlpha=.16;lg.fillStyle=C.amber;lg.beginPath();lg.moveTo(sx-dy*wd,sy+dx*wd);lg.lineTo(sx+dx*270-dy*wd,sy+dy*270+dx*wd);lg.lineTo(sx+dx*270+dy*wd,sy+dy*270-dx*wd);lg.lineTo(sx+dy*wd,sy-dx*wd);lg.closePath();lg.fill();
    eg.globalAlpha=.8;eg.strokeStyle=C.amber;eg.beginPath();eg.moveTo(sx-dy*wd,sy+dx*wd);eg.lineTo(sx+dx*270-dy*wd,sy+dy*270+dx*wd);eg.moveTo(sx+dy*wd,sy-dx*wd);eg.lineTo(sx+dx*270+dy*wd,sy+dy*270-dx*wd);eg.stroke();lg.globalAlpha=eg.globalAlpha=1;
    const p=mateC();if(p&&p.state!=='out'){const px=p.x-lx,py=(p.y-12)-ly,al=px*dx+py*dy,pp=Math.abs(px*dy-py*dx);aimDrag.thru=al>0&&al<270&&pp<wd+8}}else if(aimDrag)aimDrag.thru=false}
  // Lance aim line while charging
  for(const c of chars){if(!(c.cast&&c.cast.k==='lance'))continue;const A=c.aim||dirOf(c);let dx=A[0],dy=A[1];const [lx,ly]=lanternPos(c),sx=lx+ox,sy=ly+oy,k=clamp(c.cast.t/c.cast.dur,0,1);
    eg.globalAlpha=.4+.5*k;eg.strokeStyle=C.amber;eg.setLineDash([4,4]);eg.lineDashOffset=-tAll*30;eg.beginPath();eg.moveTo(sx,sy);eg.lineTo(sx+dx*270,sy+dy*270);eg.stroke();eg.setLineDash([]);eg.lineDashOffset=0;
    eg.globalAlpha=k;eg.lineWidth=1;eg.beginPath();eg.moveTo(sx+(-dy)*13*k,sy+dx*13*k);eg.lineTo(sx+dx*270+(-dy)*13*k,sy+dy*270+dx*13*k);eg.moveTo(sx-(-dy)*13*k,sy-dx*13*k);eg.lineTo(sx+dx*270-(-dy)*13*k,sy+dy*270-dx*13*k);eg.stroke();eg.globalAlpha=1}
}
function drawFly(fx,fy,lv=1){const x=Math.round(fx+ox),y=Math.round(fy+oy),evo=lv>=5;circ(eg,x,y,evo?5:3+(lv>=3?1:0),WCOL.flies);const wg=Math.sin(tAll*40+fx)>0;lg.fillStyle='rgba(230,255,200,.8)';lg.fillRect(x-2,y-(wg?2:1),2,1);lg.fillRect(x+1,y-(wg?2:1),2,1);lg.fillStyle=evo?'#ffffff':'#f4ffcf';lg.fillRect(x-1,y-1,evo?3:2,evo?3:2);lg.fillStyle=WCOL.flies;lg.fillRect(x,y+1,1,1);if(rnd()<.3)parts.push({x:fx,y:fy,vx:0,vy:4,life:.3,max:.3,col:WCOL.flies,em:true})}
const LSPR={};function lightSpr(col){let c=LSPR[col];if(c)return c;c=mk(64,64);const g=c.getContext('2d'),gr=g.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,col.replace('A',1));gr.addColorStop(1,col.replace('A',0));g.fillStyle=gr;g.fillRect(0,0,64,64);LSPR[col]=c;return c}
function render(){
  ox=Math.round(lw/2)-Math.round(cam.x)+Math.round(shk.x);oy=Math.round(lh/2)-Math.round(cam.y)+Math.round(shk.y);
  eg.clearRect(0,0,lw,lh);hiQ=[];bg();world();
  const inGame=mode==='play'||mode==='pick'||mode==='end';
  if(inGame){const list=[];for(const p of PROPS)list.push({y:p.y,d:()=>drawProp(p)});for(const e of en)list.push({y:e.y,d:()=>drawEnemy(e)});for(const c of chars)list.push({y:c.y,d:()=>drawChar(c)});list.sort((a,b)=>a.y-b.y);for(const o of list)o.d();effects()}
  else for(const p of PROPS)drawProp(p);
  ctx.setTransform(1,0,0,1,0,0);ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;ctx.imageSmoothingEnabled=false;
  const DW=lw*PX*DPR*zoom,DH=lh*PX*DPR*zoom,DX=(W*DPR-DW)/2,DY=(H*DPR-DH)/2;ctx.fillStyle='#0d0b1c';ctx.fillRect(0,0,W*DPR,H*DPR);ctx.drawImage(LOW,DX,DY,DW,DH);
  b1.clearRect(0,0,B1.width,B1.height);b1.imageSmoothingEnabled=true;b1.drawImage(EM,0,0,B1.width,B1.height);b2.clearRect(0,0,B2.width,B2.height);b2.imageSmoothingEnabled=true;b2.drawImage(B1,0,0,B2.width,B2.height);
  ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.4;ctx.drawImage(EM,DX,DY,DW,DH);ctx.imageSmoothingEnabled=true;ctx.globalAlpha=.6;ctx.drawImage(B1,DX,DY,DW,DH);ctx.globalAlpha=.55;ctx.drawImage(B2,DX,DY,DW,DH);
  const sc=PX*DPR*zoom,L=(wx,wy,r,col,a)=>{if(a<=.003||r<=0)return;const x=DX+(wx+ox)*sc,y=DY+(wy+oy)*sc,Rr=r*sc;ctx.globalAlpha=Math.min(1,a);ctx.drawImage(lightSpr(col),x-Rr,y-Rr,Rr*2,Rr*2);ctx.globalAlpha=1};
  if(inGame){for(const c of chars){if(c.state==='out')continue;const bk=chars.length>1?.55+.45*bond:1;if(c.cls==='lamp'&&c.lantern)L(c.x+(c.lantern[0]-FX)*c.f,c.y+c.lantern[1]-FY,44*bk,'rgba(255,190,90,A)',.13*bk);if(chars.length>1&&bond>.5)L(c.x,c.y-12,34,'rgba(255,215,120,A)',.2*bond);if(c.lance)L(c.x+c.lance.dx*120,c.y-16+c.lance.dy*120,150,'rgba(255,230,160,A)',.25);if(c.cls==='warden')L(c.x+4*c.f,c.y-34,16,'rgba(79,240,255,A)',.22);if(c.cast)L(c.x,c.y-16,40*clamp(c.cast.t/c.cast.dur,0,1)+10,c.cls==='warden'?'rgba(79,240,255,A)':'rgba(255,200,97,A)',.35)}
    if(dome)L(dome.x,dome.y-14,60*domeScale(),dome.sanct>0?'rgba(255,200,97,A)':'rgba(79,240,255,A)',.2);for(const p of pools)L(p.x,p.y,26,'rgba(255,200,97,A)',.22*Math.min(1,p.life));
    for(const w of waves)if(w.t>0&&w.t<.15)L(w.x,w.y,w.r*.6,w.col===C.amber?'rgba(255,200,97,A)':w.col===C.red?'rgba(255,42,92,A)':'rgba(79,240,255,A)',.25*(1-w.t/.15))}
  for(const p of PROPS)if(p.k==='pylon')L(p.x,p.y-19,28,p.c===C.cyan?'rgba(79,240,255,A)':'rgba(255,79,216,A)',.15);
  ctx.globalAlpha=1;for(let i=0;i<2;i++){const a=-Math.PI/2+Math.sin(tAll*.3+i*2.1)*.55,bx=(i?.85:.15)*W*DPR,by=H*DPR*1.05,Ln=Math.max(W,H)*1.6*DPR;const g=ctx.createLinearGradient(bx,by,bx+Math.cos(a)*Ln,by+Math.sin(a)*Ln);g.addColorStop(0,'rgba(180,170,255,.09)');g.addColorStop(1,'rgba(180,170,255,0)');ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(bx,by);ctx.lineTo(bx+Math.cos(a-.06)*Ln,by+Math.sin(a-.06)*Ln);ctx.lineTo(bx+Math.cos(a+.06)*Ln,by+Math.sin(a+.06)*Ln);ctx.fill()}
  ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;
  if(hiQ.length){ctx.save();ctx.imageSmoothingEnabled=false;ctx.setTransform(sc,0,0,sc,DX,DY);for(const q of hiQ)blit(ctx,...q);for(const o of chars){if(o.hiHead||o.state==='out'||!o._fb||o._fb[7]!==tAll||!(o.y>hiQ.ys))continue;const art=chars.find(q=>q.hiHead);if(art&&Math.abs(o.x-art.x)<34&&Math.abs(o.y-art.y)<40)blit(ctx,o.fin,...o._fb.slice(0,7))}ctx.restore();hiQ=[]}
  const me=meC(),lowHp=inGame&&me&&me.state==='ok'&&me.hp/me.max<.3;
  const vg=ctx.createRadialGradient(W*DPR/2,H*DPR/2,Math.min(W,H)*DPR*.35,W*DPR/2,H*DPR/2,Math.max(W,H)*DPR*.75);vg.addColorStop(0,'rgba(5,3,12,0)');vg.addColorStop(1,lowHp?'rgba(90,6,24,'+(.55+.15*Math.sin(tAll*6))+')':'rgba(5,3,12,.6)');ctx.fillStyle=vg;ctx.fillRect(0,0,W*DPR,H*DPR);
  if(inGame&&chars.length>1&&bond<.4){ctx.fillStyle='rgba(18,28,70,'+((.4-bond)*.9)+')';ctx.fillRect(0,0,W*DPR,H*DPR)}
  if(flashA>0){ctx.fillStyle='rgba(255,250,235,'+flashA*.5+')';ctx.fillRect(0,0,W*DPR,H*DPR)}if(tintA>0){ctx.fillStyle='rgba('+tintC+','+tintA*.35+')';ctx.fillRect(0,0,W*DPR,H*DPR)}
  if(inGame){
    const mate=mateC();if(mate&&mate.state!=='out'){const sx=DX+(mate.x+ox)*sc,sy=DY+(mate.y-14+oy)*sc,m=30*DPR;if(sx<m||sx>W*DPR-m||sy<m*3||sy>H*DPR-m){const cx=clamp(sx,m,W*DPR-m),cy=clamp(sy,m*3,H*DPR-m*2),a=Math.atan2(sy-H*DPR/2,sx-W*DPR/2);ctx.save();ctx.translate(cx,cy);ctx.rotate(a);ctx.fillStyle=mate.state==='down'?C.red:CL[mate.cls].color;ctx.beginPath();ctx.moveTo(12*DPR,0);ctx.lineTo(-6*DPR,-8*DPR);ctx.lineTo(-2*DPR,0);ctx.lineTo(-6*DPR,8*DPR);ctx.closePath();ctx.fill();ctx.restore()}}
    ctx.textAlign='center';ctx.textBaseline='middle';ctx.lineJoin='round';
    if(aimDrag&&aimDrag.thru){const p=mateC();if(p){const x=DX+(p.x+ox)*sc,y=DY+(p.y-70+oy)*sc;ctx.font=Math.round(9*DPR)+'px "Press Start 2P",monospace';ctx.lineWidth=4*DPR;ctx.strokeStyle='#120a22';ctx.strokeText('EMPOWER',x,y);ctx.fillStyle=C.amber;ctx.fillText('EMPOWER',x,y)}}
    for(const c of chars){if(c.state==='out')continue;const bw=40*DPR,bh=5*DPR,x=DX+(c.x+ox)*sc,y=DY+(c.y-(c.spr.height>S?66:c.cls==='warden'||c.hiHead?54:48)+oy)*sc;const p=clamp(c.hp/c.max,0,1);
      ctx.fillStyle='rgba(10,8,22,.85)';ctx.fillRect(x-bw/2-DPR,y-DPR,bw+2*DPR,bh+2*DPR);ctx.fillStyle=c.state==='down'?C.red:p<.3?'#ff6a5a':'#5fe08a';ctx.fillRect(x-bw/2,y,bw*p,bh);
      ctx.font=Math.round(7*DPR)+'px "Press Start 2P",monospace';ctx.lineWidth=3*DPR;ctx.strokeStyle='#120a22';const tx=c.state==='down'?'DOWN':String(Math.ceil(c.hp));ctx.strokeText(tx,x,y-5*DPR);ctx.fillStyle='#ffffff';ctx.fillText(tx,x,y-5*DPR)}
    for(const e of en){if(e.kind<4||e.dead||e.spawn>0)continue;const sx=DX+(e.x+ox)*sc,sy=DY+(e.y-20+oy)*sc,m=34*DPR;if(sx>m&&sx<W*DPR-m&&sy>m*3&&sy<H*DPR-m)continue;const cx=clamp(sx,m,W*DPR-m),cy=clamp(sy,m*3,H*DPR-m*2),a=Math.atan2(sy-H*DPR/2,sx-W*DPR/2),k=1+.15*Math.sin(tAll*8);
      ctx.save();ctx.translate(cx,cy);ctx.rotate(a);ctx.scale(k,k);ctx.fillStyle=e.kind===5?'#ff2a5c':'#c779ff';ctx.beginPath();ctx.moveTo(16*DPR,0);ctx.lineTo(-8*DPR,-11*DPR);ctx.lineTo(-3*DPR,0);ctx.lineTo(-8*DPR,11*DPR);ctx.closePath();ctx.fill();ctx.restore();
      ctx.font=Math.round(7*DPR)+'px "Press Start 2P",monospace';ctx.fillStyle='#ffffff';ctx.fillText(e.kind===5?'BOSS':'ELITE',cx-Math.cos(a)*22*DPR,cy-Math.sin(a)*22*DPR)}
    for(const b of banners){const p=b.t/2.4,a=p<.8?1:1-(p-.8)/.2,pop=b.t<.15?1.5-b.t/.15*.5:1;const x=DX+(b.c.x+ox)*sc,y=DY+(b.c.y-58-p*10+oy)*sc,fs=Math.round(DPR*Math.max(10,PX*3.6)*pop);ctx.font=fs+'px "Press Start 2P",monospace';ctx.globalAlpha=a;ctx.lineWidth=Math.max(3,fs*.35);ctx.strokeStyle='#120a22';ctx.strokeText(b.txt,x,y);ctx.fillStyle=b.col;ctx.fillText(b.txt,x,y)}ctx.globalAlpha=1;
    if(mode==='play')for(const d of dn){const p=d.t/.8,pop=d.t<.1?1.7-d.t/.1*.7:1,a=p<.65?1:1-(p-.65)/.35,rise=(1-Math.pow(1-p,2))*22-p*p*8;const x=DX+(d.x+(d.vx||0)*p+ox)*sc,y=DY+(d.y-rise+oy)*sc,fs=Math.round(DPR*Math.max(11,PX*4.2)*d.big*pop);
      ctx.font=fs+'px "Press Start 2P",monospace';ctx.globalAlpha=a;ctx.lineWidth=Math.max(3,fs*.32);ctx.strokeStyle='#120a22';ctx.strokeText(d.txt,x,y);ctx.fillStyle=d.col;ctx.fillText(d.txt,x,y)}ctx.globalAlpha=1;
    if(joy&&mode==='play'){ctx.setTransform(DPR,0,0,DPR,0,0);const R0=54,dx=joy.x-joy.ox,dy=joy.y-joy.oy,l=Math.min(R0,len(dx,dy)),a=Math.atan2(dy,dx),me2=meC(),jc=me2?CL[me2.cls].color:'#d9d4f0';
      ctx.fillStyle='rgba(13,11,28,.35)';ctx.beginPath();ctx.arc(joy.ox,joy.oy,R0,0,TAU);ctx.fill();ctx.strokeStyle='rgba(217,212,240,.4)';ctx.lineWidth=2;ctx.stroke();
      if(l>8){ctx.strokeStyle=jc;ctx.lineWidth=5;ctx.lineCap='round';ctx.beginPath();ctx.arc(joy.ox,joy.oy,R0,a-.6,a+.6);ctx.stroke();ctx.lineCap='butt'}
      ctx.fillStyle=jc;ctx.globalAlpha=.85;ctx.beginPath();ctx.arc(joy.ox+Math.cos(a)*l,joy.oy+Math.sin(a)*l,22,0,TAU);ctx.fill();ctx.globalAlpha=1;ctx.strokeStyle='#ffffff';ctx.lineWidth=2;ctx.stroke()}}
}
let last=performance.now();
function frame(now){const dt=Math.min(.05,(now-last)/1000)*(FAST?4:1);last=now;
  if(mode==='play'||mode==='pick'||mode==='end'){if(mode==='end'){tAll+=dt;if(isHost&&mateJoined){snapT-=dt;if(snapT<=0){snapT=.2;snapshot()}}render()}else update(Math.min(dt,FAST?.08:.05))}
  else{tAll+=dt;cam.x=220+Math.sin(tAll*.12)*160;cam.y=120+Math.cos(tAll*.09)*60;render()}
  requestAnimationFrame(frame)}
go('menu');requestAnimationFrame(frame);
window.__dd={get chars(){return chars},get en(){return en},get mode(){return mode},get code(){return roomCode},get dome(){return dome},get combo(){return combo},get T(){return T},set T(v){T=v},get level(){return level},get xp(){return xp},set xp(v){xp=v},get LV(){return LV},get end(){return endState},get gems(){return gems},get kills(){return kills},applyCard,startLevel,spawnAt,get boss(){return boss}};
})();
