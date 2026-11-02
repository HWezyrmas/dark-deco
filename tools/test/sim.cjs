// Balance simulator: plays full runs with bots and prints result and damage shares.
// Usage: node tools/test/sim.cjs <runs> <seconds> '{"warden":"berserk","lamp":"heal"}' [port]
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const [N,sec,specs]=[+process.argv[2],+process.argv[3],JSON.parse(process.argv[4])];
for(let r=0;r<N;r++){const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:3});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://localhost:8767/index.html?local');await p.evaluate(()=>{localStorage.setItem('dd_intro_seen','1');localStorage.setItem('dd_prologue_done','1')});await p.reload();await p.waitForTimeout(3000);await p.mouse.click(195,300);await p.waitForTimeout(2500);
await p.click('#bSolo');await p.evaluate(s=>{const cb=document.getElementById('tutChk');if(cb)cb.checked=false;cb&&cb.dispatchEvent(new Event('change'))},0);
await p.click(`.specrow.cur .spec[data-s="${specs.warden}"]`);await p.click(`#lMate .spec[data-s="${specs.lamp}"]`);await p.click('#bStart');await p.waitForTimeout(1500);
const o=await p.evaluate(s=>__dd.sim(s),sec);console.log('RUN',r,JSON.stringify({T:o.T,lv:o.level,end:o.end,boss:o.boss,downs:o.downs,hp:o.hp}).slice(0,160));console.log('  dmg',o.dmg.slice(0,6).join(', '),errs.slice(0,2));await p.close()}await b.close()})();
