// ===== Dialogue: portrait, name plate, typewriter text. 'block' lines freeze the game and wait for a tap; barks play over the action and move on by themselves =====
(function(){
const WHO={lamp:{name:'Lamplighter',col:'#ffc861'},warden:{name:'Warden',col:'#7fd7ff'},foreman:{name:'The Foreman',col:'#ff6a4a',right:1},narr:{name:'',col:'#e8dcc4'}};
const el=document.createElement('div');el.id='dlg';el.hidden=true;
el.innerHTML='<div class="dpf"><img id="dlgP" alt=""></div><div class="dtx"><b id="dlgN"></b><p id="dlgT"></p><i class="dnx" aria-hidden="true"></i></div>';document.body.appendChild(el);
const P=el.querySelector('#dlgP'),N=el.querySelector('#dlgN'),Tx=el.querySelector('#dlgT');
let Q=[],cur=null,o={},full='',shown=0,acc=0,raf=0,hold=0,lastT=0,done=null;
P.onerror=()=>{const b=P.dataset.base;if(b&&P.src.indexOf(b)<0)P.src=b};
function show(line){cur=line;const [whoM,text]=line,[who,mood]=whoM.split(':'),W=WHO[who]||WHO.narr;el.hidden=false;el.className=(o.bark?'bark ':'')+(W.right?'right ':'')+(who==='narr'?'narr ':'')+'in';void el.offsetWidth;
  if(who!=='narr'){const base='portraits/'+who+'.webp?v=3';P.dataset.base=base;P.src=mood?'portraits/'+who+'_'+mood+'.webp?v=3':base}
  N.textContent=W.name;el.style.setProperty('--wc',W.col);full=text;shown=0;acc=0;hold=0;Tx.textContent='';el.classList.remove('ready')}
function tick(t){raf=requestAnimationFrame(tick);const dt=Math.min(.1,(t-lastT)/1000||0);lastT=t;if(!cur)return;
  if(shown<full.length){acc+=dt*(o.bark?42:38);const n=Math.min(full.length,Math.floor(acc));if(n>shown){if(window.__ddBlip&&n%3===0)window.__ddBlip(cur[0].split(':')[0]);shown=n;Tx.textContent=full.slice(0,shown)}if(shown>=full.length)el.classList.add('ready')}
  else{hold+=dt;if(o.bark&&hold>1.4+full.length*.025)next()}}
function next(){if(!cur)return;if(shown<full.length){shown=full.length;Tx.textContent=full;el.classList.add('ready');return}
  if(Q.length){show(Q.shift());return}cur=null;el.classList.add('outro');setTimeout(()=>{if(!cur){el.hidden=true;el.className=''}},250);const d=done;done=null;o={};if(d)d()}
// tap anywhere advances a blocking line
document.addEventListener('pointerdown',e=>{if(!cur||o.bark)return;if(e.target.closest('#iSkip,#leave,#mute,#skills'))return;e.preventDefault();e.stopPropagation();next()},true);
document.addEventListener('keydown',e=>{if(cur&&!o.bark&&(e.key===' '||e.key==='Enter'||e.key==='e'||e.key==='q')){e.preventDefault();e.stopPropagation();next()}},true);
window.DLG={play(lines,opts={},cb){if(cur&&!o.bark&&opts.bark)return false;Q=lines.slice(1);o=opts;done=cb||null;show(lines[0]);if(!raf){lastT=performance.now();raf=requestAnimationFrame(tick)}return true},
  blocking(){return !!cur&&!o.bark},busy(){return !!cur},clear(){Q=[];cur=null;done=null;o={};el.hidden=true}};
})();
