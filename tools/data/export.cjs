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
  enemies:{names:ev('ENAMES'),base_hp:[34,260,40,30,1500,4200],base_hp_note:'kinds 0-3 are multiplied by pace.enemy_hp_mult (ETOUGH) at spawn',sprite_heights:[21,31,27,22,40,58],sprite_scale:num('ESZ'),hitbox_radius:[8,16,9,9,22,30]},
  ability_paths:{paths:ev('PATHS'),basics:ev('BASICS'),max_paths_per_run:num('MAXPATHS'),spec_damage_bonus:ev('SPECB'),
    rules:'A run follows at most max_paths_per_run paths. Next step of a path unlocks once the previous ability is level 2; otherwise raise the lowest. Level-up offers: next step of each started path, path starts while under the max, one card from basics/passives/mods/team. Damage +30% per level, +40% more at level 5 (evolution). Spec path abilities (not basics) multiply damage by spec_damage_bonus.'},
  pace:{pack_size_mult:num('EPACK'),enemy_hp_mult:num('ETOUGH'),enemy_speed_mult:num('EPACE'),busy_cap:55},
  feel:{view_game_px_short_side:num('ZOOMV'),hitstop_min_request:.05,hitstop_max:.07,shake_min:3.5,cast_move_mult:{cast:.8,verdict:.7,grand_verdict:.3},
    ability_fx_alpha:num('FXQ'),ability_fx_cap:70,damage_numbers_cap:14,partner_fx_alpha:num('PFA'),partner_flash_mult:.3,fx_memory_budget_mb:num('PFXMB'),
    clear_zone:'soft radial clear zone of 34 game px around your own hero: 60% of the pre-effects picture is laid back on top of effects',
    auto_quality:'below 80% of target fps for two 3 s windows: level 1 no bloom/atmosphere overlays; level 2 also fx cap 35, particles 140, damage numbers 8'},
  headsmans_throw:{charge_seconds:num('AXCH'),cooldown:8,range:'80 + 110*charge',axe_scale:'0.55 + 0.75*charge',impact_radius:'24 + 30*charge',
    pass_damage:'(45 + 120*charge) * level_mult * spec_damage_bonus',impact_damage:'(100 + 280*charge) * level_mult * spec_damage_bonus, x3 and Execute under 35%',
    flight_seconds:'0.26 + range*0.0016',lava:{radius:'impact_radius*1.05',seconds:'3.5 + 2.5*charge',dps:'(18 + 30*charge) * level_mult * spec_damage_bonus, ticks every 0.5 s',
    judgement_zone:'slowed, +30% damage taken, Executioner executes under 30%, kill gives +2 Blood Boil, Last Rites/Death Knell +10%, Iron Skin recharges 2x'}},
  pfx_manifest:JSON.parse(fs.readFileSync(path.join(__dirname,'../../pfx/manifest.json'),'utf8'))};
fs.mkdirSync(path.join(__dirname,'../../data'),{recursive:true});
for(const [k,v] of Object.entries(out))fs.writeFileSync(path.join(__dirname,'../../data',k+'.json'),JSON.stringify(v,null,1));
console.log('wrote',Object.keys(out).map(k=>'data/'+k+'.json').join(' '));
