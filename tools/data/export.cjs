// Exports the game's data tables from game.js into data/*.json for the Godot port.
// usage: node tools/data/export.cjs   (run from the repo root)
const fs=require('fs'),path=require('path');
const src=fs.readFileSync(path.join(__dirname,'../../game.js'),'utf8');
function literal(name){const i=src.search(new RegExp('(const|,)\\s*'+name+'=[\\{\\[]'));if(i<0)throw new Error('not found '+name);
  let j=src.indexOf('=',i)+1;const open=src[j],close=open==='{'?'}':']';let d=0,q=null;
  for(let k=j;k<src.length;k++){const ch=src[k];if(q){if(ch==='\\'){k++;continue}if(ch===q)q=null;continue}if(ch==="'"||ch==='"'||ch==='`'){q=ch;continue}
    if(ch===open)d++;else if(ch===close){d--;if(!d)return src.slice(j,k+1)}}}
const C=new Function('return '+literal('C'))();
const ev=n=>new Function('C','return '+literal(n))(C);
const num=n=>{const m=src.match(new RegExp('\\b'+n+'=([0-9.]+)'));return m?+m[1]:null};
const out={
  meta:{run_seconds:num('RUN'),beat_seconds:num('BEAT'),boss_time:num('BOSS_T'),blood_boil_max:num('BB_MAX'),grand_verdict_cast:num('GV_DUR'),
    elite_times:ev('ELITE_T'),divide_times:ev('DIV_T'),divide_seconds:num('DIV_DUR'),events:ev('EVENTS'),
    xp_formula:'need(level) = 9 + 7*level + floor(0.4*level^2)',enemy_hp_scale:'1 + T/240 + (T/560)^2',enemy_damage_scale:'1 + T/540'},
  colors:C,classes:ev('CL'),spec_names:ev('SPECN'),spec_kits:ev('SPUI'),
  abilities:ev('WDEF'),ability_base:ev('WBASE'),ability_colors:ev('WCOL'),passives:ev('PAS'),mods:ev('MODS'),stat_cards:ev('STATS'),team_cards:ev('PAIRS'),duos:ev('DUOS'),
  enemies:{names:ev('ENAMES'),base_hp:[34,260,40,30,1500,4200],sprite_heights:[21,31,27,22,40,58]},
  pfx_manifest:JSON.parse(fs.readFileSync(path.join(__dirname,'../../pfx/manifest.json'),'utf8'))};
fs.mkdirSync(path.join(__dirname,'../../data'),{recursive:true});
for(const [k,v] of Object.entries(out))fs.writeFileSync(path.join(__dirname,'../../data',k+'.json'),JSON.stringify(v,null,1));
console.log('wrote',Object.keys(out).map(k=>'data/'+k+'.json').join(' '));
