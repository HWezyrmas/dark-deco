// Single-device sweep: menus, guide pages, intro, practice runs per spec, skills screen, loss and replay, leave. Prints errors and saves screenshots.
// Usage: node tools/test/sweep.cjs <outDir> [port]
const {chromium}=require('playwright');(async()=>{const O=process.argv[2]||require('path').join(__dirname,'out');require('fs').mkdirSync(O,{recursive:true});const PORT=process.argv[3]||8767,U=`http://localhost:${PORT}/index.html?local`;
const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:2,hasTouch:true,isMobile:true});const errs=[];p.on('pageerror',e=>errs.push(e.message));
const miss=new Set();p.on('response',r=>{if(r.status()>=400&&!/googleapis|gstatic/.test(r.url()))miss.add(r.status()+' '+r.url().replace(/^https?:\/\/[^/]+/,''))});
const clear=async(n=12)=>{for(let i=0;i<n;i++){const busy=await p.evaluate(()=>{let b=false;if(window.DLG&&DLG.blocking()){DLG.advance();b=true}if(__dd.LV){const x=document.querySelector('.pick:not(.chosen)');x&&x.click();b=true}return b});if(!busy)return;await p.waitForTimeout(400)}};const W=ms=>p.waitForTimeout(ms),log=(...a)=>console.log(...a),shot=n=>p.screenshot({path:`${O}/sw_${n}.png`});
await p.goto(U);await p.evaluate(()=>localStorage.clear());await p.reload();await W(1500);await shot('intro0');
await p.tap('#iSkip');await W(2500);await shot('title');await p.tap('#title');await W(2600);await shot('menu');
// guide
await p.tap('#bGuide');await W(800);const pages=await p.evaluate(()=>document.querySelectorAll('#mag .pg').length);log('guide pages',pages);
for(let i=0;i<pages;i++){await shot('guide'+i);await p.tap('#magNext').catch(()=>{});await W(450)}
const back=await p.evaluate(()=>[...document.querySelectorAll('#sGuide button')].map(b=>b.id||b.textContent.trim()).slice(0,6));log('guide buttons',back);
await p.evaluate(()=>{const b=[...document.querySelectorAll('#sGuide button')].find(b=>/close|back|×|done/i.test(b.id+b.textContent+b.getAttribute('aria-label')));b&&b.click()});await W(600);log('after guide',await p.evaluate(()=>__dd.mode));
// intro replay
await p.tap('#bIntro').catch(e=>log('no intro btn',e.message.slice(0,60)));await W(1200);await p.tap('#iGo').catch(()=>{});await W(3000);await shot('intro1');await p.tap('#iSkip').catch(()=>{});await W(2500);
await p.tap('#title').catch(()=>{});await W(2000);
for(const [cls,sp,alone] of [['warden','berserk',0],['warden','exec',1],['lamp','heal',0],['lamp','fire',1]]){
  await p.tap('#bSolo');await W(500);if(cls==='lamp')await p.tap('.htab[data-c="lamp"]');await p.tap(`.specrow.cur .spec[data-s="${sp}"]`);if(alone)await p.tap('#botTg');
  await p.evaluate(()=>{const c=document.getElementById('tutChk');if(c&&c.checked)c.click()});await p.tap('#bStart');await W(2000);
  await p.evaluate(()=>{for(const c of __dd.chars)c.hp=c.max=9999});
  for(const k of ['q','e','r','q']){await p.keyboard.press(k);await W(500)}
  await p.keyboard.down('d');await W(900);await p.keyboard.up('d');await p.keyboard.down('w');await W(700);await p.keyboard.up('w');
  await p.evaluate(()=>{__dd.xp=20});await W(1200);await shot('lv_'+sp);await clear();await W(800);
  await p.tap('#skillsBtn').catch(()=>{});await W(700);await shot('skills_'+sp);await p.tap('#skillsClose').catch(()=>{});await W(500);
  await p.evaluate(()=>{__dd.T=118});await W(1500);await clear();await W(800);
  await shot('play_'+sp);log(sp,alone?'alone':'bot','mode',await p.evaluate(()=>__dd.mode),'chars',await p.evaluate(()=>__dd.chars.length));
  // lose
  await p.evaluate(()=>{for(const c of __dd.chars){c.max=10;c.hp=0;c.state='out';c.out=99}});await clear();await W(2500);log('  end',await p.evaluate(()=>[__dd.mode,__dd.end&&__dd.end.win]));await shot('end_'+sp);
  await p.tap('#bEndLeave').catch(e=>log('no leave',e.message.slice(0,50)));await W(1500);log('  after leave',await p.evaluate(()=>__dd.mode));
  await p.tap('#title').catch(()=>{});await W(1500);
}
log('ERRORS',JSON.stringify(errs));log('MISSING',[...miss].join(' '));await b.close()})();
