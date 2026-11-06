// Two-phone co-op test over the local link (?local uses a BroadcastChannel between two pages of the same browser).
// Usage: node tools/test/coop.cjs <outDir> [port]
const {chromium}=require('playwright');(async()=>{const O=process.argv[2]||require('path').join(__dirname,'out');require('fs').mkdirSync(O,{recursive:true});const PORT=process.argv[3]||8767,U=`http://localhost:${PORT}/index.html?local`;
const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,hasTouch:true,isMobile:true});
const H=await ctx.newPage(),G=await ctx.newPage();const errs={H:[],G:[]};H.on('pageerror',e=>errs.H.push(e.message));G.on('pageerror',e=>errs.G.push(e.message));
const miss=new Set();for(const p of [H,G])p.on('response',r=>{if(r.status()>=400)miss.add(r.status()+' '+r.url().replace(/^https?:\/\/[^/]+/,''))});
const log=(...a)=>console.log(...a);const run=async ms=>{const t=Date.now();while(Date.now()-t<ms){if(process.env.DBG)console.log('  run',JSON.stringify(await H.evaluate(()=>[__dd.mode,__dd.LV&&[__dd.LV.id,__dd.LV.kind,__dd.LV.picked],__dd.T.toFixed(1),DLG.blocking(),document.getElementById('dlgT').textContent.slice(0,30),!!__dd.boss,__dd.DIV&&__dd.DIV.ph])),JSON.stringify(await G.evaluate(()=>[__dd.mode,__dd.LV&&[__dd.LV.id,__dd.LV.picked],document.querySelectorAll('.pick').length])));for(const p of [H,G])await p.evaluate(()=>{if(window.DLG&&DLG.blocking())DLG.advance();if(__dd.LV){const b=document.querySelector('.pick');b&&b.click()}for(const c of __dd.chars)if(c.hp<c.max*.5)c.hp=c.max});await new Promise(r=>setTimeout(r,250))}};const drain=async(p,max=40)=>{for(let i=0;i<max;i++){const b=await p.evaluate(()=>window.DLG&&DLG.blocking());if(!b)return i;await p.tap('body',{position:{x:195,y:420}});await new Promise(r=>setTimeout(r,350))}return -1};const W=ms=>new Promise(r=>setTimeout(r,ms));
for(const p of [H,G]){await p.goto(U);await p.evaluate(()=>{localStorage.clear();localStorage.setItem('dd_intro_seen','1')});await p.reload();await p.waitForTimeout(2500);await p.tap('#title');}
await W(2600);await H.tap('#bHost');await W(800);const code=await H.evaluate(()=>__dd.code);log('code',code);
await G.fill('#code',code);await G.tap('#bJoin');await W(1500);
const lob=async p=>p.evaluate(()=>[__dd.mode,document.getElementById('lStatus')?.textContent||document.getElementById('lobStatus')?.textContent,document.getElementById('bStart').disabled,document.getElementById('bStart').textContent]);
log('lobby H',await lob(H),'G',await lob(G));
await H.screenshot({path:O+'/c_lobbyH.png'});await G.screenshot({path:O+'/c_lobbyG.png'});
await H.tap('#bStart');await W(2500);
const st=async p=>p.evaluate(()=>{const d=document.getElementById('dlg');return{mode:__dd.mode,dlg:d.hidden?'':(d.classList.contains('bark')?'(bark) ':'')+document.getElementById('dlgT').textContent.slice(0,40),story:__dd.STORY.on?__dd.STORY.step+'/'+__dd.STORY.phase:'off',obj:document.getElementById('obj').hidden?'':document.getElementById('obj').textContent,chars:__dd.chars.map(c=>c.cls[0]+Math.round(c.x)+','+Math.round(c.y)+':'+c.state).join(' ')}});
log('start H',await st(H));log('start G',await st(G));await G.screenshot({path:O+'/c_proG.png'});
// dialogue: tap on the guest first (should not advance the host), then on the host
const t0=await st(H);await G.tap('body',{position:{x:195,y:420}});await W(600);log('after guest tap H',(await st(H)).dlg,'| G',(await st(G)).dlg);
log('guest drained in',await drain(G));await W(300);
log('after host taps H',await st(H));log('G',await st(G));
// step 0: both walk to the lamp
await H.evaluate(()=>{const w=__dd.WP;if(w){const c=__dd.chars[0];c.x=w[0];c.y=w[1]}});await W(2500);log('lamp lit? H',await st(H));log('drain G',await drain(G),'H blocking',await H.evaluate(()=>DLG.blocking()));
// skip the rest of the prologue
await H.evaluate(()=>{const S=__dd.STORY;S.step=7;S.phase=0;S.cb=null});await W(1500);log('host drained in',await drain(H));
await W(1500);log('after prologue H',await st(H));log('G',await st(G));
// level-up on both
await H.evaluate(()=>{__dd.xp=20});await W(1500);
const pk=async p=>p.evaluate(()=>[__dd.mode,!!__dd.LV,document.querySelectorAll('.pick').length]);log('levelup H',await pk(H),'G',await pk(G));await W(1500);log('card text H',await H.evaluate(()=>[...document.querySelectorAll('.pick')].map(b=>b.innerText.replace(/\s+/g,' ').slice(0,40))),'G',await G.evaluate(()=>[...document.querySelectorAll('.pick')].map(b=>b.innerText.replace(/\s+/g,' ').slice(0,40))));log('b3 G',await G.evaluate(()=>[document.getElementById('b3').hidden,document.body.className]));await H.screenshot({path:O+'/c_lvH.png'});await G.screenshot({path:O+'/c_lvG.png'});
for(const p of [H,G]){await p.evaluate(()=>{const b=document.querySelector('.pick');b&&b.click()});await W(500)}
await W(1500);log('after picks H',await pk(H),'G',await pk(G));
// guest phone goes to sleep and comes back
const vis=(p,h)=>p.evaluate(h=>{Object.defineProperty(document,'hidden',{value:h,configurable:true});document.dispatchEvent(new Event('visibilitychange'))},h);
await vis(G,true);await W(400);const ta=await H.evaluate(()=>__dd.T);await W(1500);log('away: host T moved',(await H.evaluate(()=>__dd.T))-ta,'overlay H',await H.evaluate(()=>!document.getElementById('away').hidden));
await vis(G,false);await W(800);const tb=await H.evaluate(()=>__dd.T);await W(1000);log('back: host T moved',((await H.evaluate(()=>__dd.T))-tb).toFixed(2),'overlay H',await H.evaluate(()=>!document.getElementById('away').hidden));
// keep both alive
const god=()=>H.evaluate(()=>{for(const c of __dd.chars){c.hp=c.max}});
// guest moves and uses skills
await G.keyboard.down('d');await W(800);await G.keyboard.up('d');await G.keyboard.press('q');await W(400);await G.keyboard.press('e');await W(400);await G.keyboard.press('r');await W(800);
log('btns G',await G.evaluate(()=>['b1','b2','b3','bM'].map(i=>{const e=document.getElementById(i),r=e.getBoundingClientRect();return i+':'+e.hidden+':'+getComputedStyle(e).display+':'+Math.round(r.x)+','+Math.round(r.y)+','+Math.round(r.width)})));await G.screenshot({path:O+'/c_playG.png'});log('guest moved H',(await st(H)).chars,'G',(await st(G)).chars);
// The Divide
await H.evaluate(()=>{__dd.T=288});for(let i=0;i<20;i++){await god();await W(250);await H.evaluate(()=>{if(__dd.LV){const b=document.querySelector('.pick');b&&b.click()}});await G.evaluate(()=>{if(__dd.LV){const b=document.querySelector('.pick');b&&b.click()}})}
log('divide H',await st(H),await H.evaluate(()=>__dd.DIVON));log('divide G',await st(G),await G.evaluate(()=>[__dd.DIVON,document.getElementById('bM').hidden]));
await G.screenshot({path:O+'/c_divG.png'});
// guest tries to walk across the burning bridge
await G.evaluate(()=>{});await G.keyboard.down('a');await W(2500);await G.keyboard.up('a');log('guest pushed west G',(await st(G)).chars,'H',(await st(H)).chars);
await G.keyboard.press('g');await W(800);log('echoes H',await H.evaluate(()=>__dd.echoes.length),'G',await G.evaluate(()=>__dd.echoes.length));await G.screenshot({path:O+'/c_echoG.png'});
await H.evaluate(()=>{__dd.T=__dd.DIV.end+.1});await W(1500);log('divide over H',await st(H),'G',await st(G));log('G dbg',await G.evaluate(()=>({DIVON:__dd.DIVON,sides:__dd.chars.map(c=>c.side),me:__dd.chars.find(c=>c.idx===1).state,mode:__dd.mode,blocking:DLG.blocking()})));await G.keyboard.down('a');await W(1000);await G.keyboard.up('a');log('G after a',(await st(G)).chars,'H',(await st(H)).chars);
// reunite: guest steps next to the host
await G.evaluate(()=>{const h=__dd.chars.find(c=>c.idx===0),g=__dd.chars.find(c=>c.idx===1);g.x=h.x+20;g.y=h.y});await W(1200);
for(let i=0;i<40;i++){await god();const [hx,hy,gx,gy]=await G.evaluate(()=>{const h=__dd.chars.find(c=>c.idx===0),g=__dd.chars.find(c=>c.idx===1);return[h.x,h.y,g.x,g.y]});const dx=hx-gx,dy=hy-gy;if(Math.hypot(dx,dy)<40)break;
  for(const k of ['a','d','w','s'])await G.keyboard.up(k);if(Math.abs(dx)>8)await G.keyboard.down(dx>0?'d':'a');if(Math.abs(dy)>8)await G.keyboard.down(dy>0?'s':'w');await W(300)}
for(const k of ['a','d','w','s'])await G.keyboard.up(k);await W(800);log('reunited? H',await H.evaluate(()=>[__dd.DIV,__dd.chars.map(c=>c.pow>0)]));
// boss and win
await H.evaluate(()=>{__dd.T=659});await run(4000);log('boss H',await H.evaluate(()=>({boss:!!__dd.boss,T:__dd.T,mode:__dd.mode,LV:!!__dd.LV,blk:DLG.blocking(),end:__dd.end,DIV:__dd.DIV,LVk:__dd.LV&&{kind:__dd.LV.kind,picked:__dd.LV.picked,n:Object.keys(__dd.LV.offers||{})},picks:document.querySelectorAll('.pick').length,btns:[...document.querySelectorAll('#sLevel button')].map(b=>b.id||b.className).slice(0,8)})));log('G LV',await G.evaluate(()=>__dd.LV&&{id:__dd.LV.id,picked:__dd.LV.picked,kind:__dd.LV.kind}),'H LV id',await H.evaluate(()=>__dd.LV&&__dd.LV.id));await H.screenshot({path:O+'/c_stuckH.png'});await G.screenshot({path:O+'/c_stuckG.png'});await G.screenshot({path:O+'/c_bossG.png'});
for(let i=0;i<20;i++){await god();await H.evaluate(()=>{if(__dd.LV){const b=document.querySelector('.pick');b&&b.click()}});await G.evaluate(()=>{if(__dd.LV){const b=document.querySelector('.pick');b&&b.click()}});await W(200)}
await H.evaluate(()=>{__dd.T=719.5;if(__dd.boss)__dd.boss.hp=1});await run(5000);log('end H',await H.evaluate(()=>[__dd.mode,JSON.stringify(__dd.end)]),'G',await G.evaluate(()=>[__dd.mode,JSON.stringify(__dd.end)]));
await G.screenshot({path:O+'/c_endG.png'});await H.tap('#bAgain');await W(3000);await run(3000);log('again H',await st(H),'G',await st(G));await G.screenshot({path:O+'/c_againG.png'});
log('ERRORS',JSON.stringify(errs));log('MISSING',[...miss].join('\n'));await b.close()})();
