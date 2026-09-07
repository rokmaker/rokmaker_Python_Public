'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {webcrypto} = require('node:crypto');
const data = require('./data.js');
const rules = require('./engine.js');
const ids = (weapon, profile='all') => rules.gemsFor(data, weapon, profile).map(g=>g.id);
assert.equal(data.ascendancies.length, 22);
assert.equal(new Set(data.gems.map(g=>g.id)).size, 201);
assert.equal(data.gems.filter(g=>!g.origin).length, 182);
assert.equal(data.gems.filter(g=>g.origin==='unique-weapon').length, 19);
assert(!data.ascendancies.some(a=>['Duelist','Shadow','Templar','Marauder'].includes(a.classId)));
assert(!data.ascendancies.some(a=>a.id==='Abyssal_Lich'));
assert(ids('bow').includes('Lightning_Arrow'));
assert(!ids('crossbow').includes('Lightning_Arrow'));
assert(ids('crossbow').includes('Explosive_Grenade'));
assert(!ids('bow').includes('Explosive_Grenade'));
assert(ids('mace-shield').includes('Shield_Charge'));
assert(!ids('wand-shield').includes('Shield_Wall'));
assert(!ids('spear-buckler').includes('Shield_Wall'));
assert(!ids('two-hand-mace').includes('Shield_Charge'));
assert(ids('two-hand-mace').includes('Supercharged_Slam'));
assert(!ids('mace-shield').includes('Supercharged_Slam'));
assert(ids('mace-shield').includes('Rolling_Slam'));
assert(ids('quarterstaff').includes('Ice_Strike'));
assert(!ids('staff').includes('Ice_Strike'));
assert(ids('staff').includes('Spark'));
assert(!ids('bow').includes('Spark'));
assert(!ids('bow').includes('Shockwave_Totem'));
assert(!ids('wand-focus').includes('Shockwave_Totem'));
assert(ids('talisman-bear').includes('Furious_Slam'));
assert(!ids('talisman-werewolf').includes('Furious_Slam'));
assert(!ids('talisman-bear').includes('Spark'));
assert(!ids('talisman-bear').includes('Shockwave_Totem'));
assert(ids('talisman-wyvern').includes('Flame_Breath'));
assert(!ids('bow','attack').includes('Spark'));
assert(!ids('bow','caster').includes('Spark'));
assert(!ids('bow','caster').includes('Lightning_Arrow'));
for (const profile of ['all','attack','caster']) assert(!ids('crossbow',profile).includes('Ball_Lightning'));
assert(ids('crossbow').includes('unique:Requiem'));
assert(ids('crossbow','attack').includes('unique:Gemini_Surge'));
assert(!ids('bow').includes('unique:Requiem'));
assert(ids('wand-sceptre').includes('unique:Azmerian_Wolf'));
assert(!ids('wand-focus').includes('unique:Azmerian_Wolf'));
assert(ids('talisman-bear').includes('unique:Molten_Crash'));
assert(!ids('talisman-wyvern').includes('unique:Molten_Crash'));
assert(ids('talisman-wyvern').includes('unique:Cackling_Companions'));
for (const weapon of data.weapons) for (const gem of rules.gemsFor(data,weapon.id)) {
  if (gem.origin) {
    assert(gem.weaponIds.includes(weapon.id));
    assert(gem.requiredItem.name && gem.requiredItem.source && gem.notes.length);
  } else assert(gem.groups.some(group=>weapon.gemGroups.includes(group)));
}
assert.throws(()=>rules.randomIndex(0));
// The first value must be rejected for a three-item pool, the second selects item 2.
let draws = 0;
assert.equal(rules.randomIndex(3,{getRandomValues(a){a[0]=draws++===0?4294967295:2;}}),2);
assert.equal(draws,2);
let combinations = 0;
for (const profile of ['all','attack','caster']) {
  for (const asc of data.ascendancies) {
    const start = rules.choose(data,rules.newSession(profile),asc.id);
    for (const weapon of rules.candidates(data,start)) {
      const armed = rules.choose(data,start,weapon.id);
      const gems = rules.candidates(data,armed);
      assert(gems.length > 0);
      for (const gem of gems) {
        const done = rules.choose(data,armed,gem.id);
        assert.deepEqual(rules.restore(data,JSON.parse(JSON.stringify(done))),done);
        assert.equal(rules.candidates(data,done).length,0);
        assert.deepEqual(rules.rewind(done,1).picks,[asc.id]);
        combinations++;
      }
      const invalid = data.gems.find(g=>!gems.includes(g));
      if (invalid) assert.throws(()=>rules.choose(data,armed,invalid.id));
    }
  }
}
assert.throws(()=>rules.restore(data,{profile:'all',picks:['Titan','staff','Ice_Strike']}));
assert.throws(()=>rules.restore(data,{profile:'unknown',picks:[]}));
assert.throws(()=>rules.restore(data,{profile:'all',picks:['Titan','bow','Spark','extra']}));

// Run real UI handlers in a small DOM harness; this does not claim visual/browser verification.
class Element {
  constructor(){this.children=[];this.style={};this.value='';this.hidden=false;this.disabled=false;this.textContent='';}
  append(...children){this.children.push(...children);}
  replaceChildren(...children){this.children=children;}
  focus(){} select(){} click(){}
  animate(){return {finished:Promise.resolve(),cancel(){}};}
}
const html = fs.readFileSync(path.join(__dirname,'index.html'),'utf8');
const elementIds = [...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
assert.equal(new Set(elementIds).size,elementIds.length);
function mount(storage, storageError=false) {
  const elements = new Map(elementIds.map(id=>[id,new Element()]));
  const context = vm.createContext({console,Date,Blob,URL,setTimeout,crypto:webcrypto,
    navigator:{clipboard:{writeText:async()=>{throw Error('Clipboard unavailable');}}},
    matchMedia:()=>({matches:true}),
    document:{getElementById(id){assert(elements.has(id),`Missing HTML element ${id}`);return elements.get(id);},createElement(){return new Element();}},
    localStorage:{getItem:k=>storage.get(k),setItem(k,v){if(storageError)throw Error('Storage unavailable');storage.set(k,v);}}
  });
  context.window=context;
  for(const file of ['data.js','engine.js','app.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,file),'utf8'),context,{filename:file});
  return elements;
}
async function runUI() {
  const key = 'poe2-exile-slot-v1';
  const oldSession = {profile:'all',picks:['Oracle','crossbow','Ball_Lightning'],saved:true};
  const legacyStorage = new Map([[key,JSON.stringify({schema:1,dataset:'old',session:oldSession,view:2,history:[{...oldSession,date:'2026-09-07T00:00:00Z'}]})]]);
  let legacyUI=mount(legacyStorage);
  assert(legacyUI.get('summary').hidden);
  assert.equal(legacyUI.get('stage-title').textContent,'스킬 젬');
  assert.equal(legacyUI.get('history').children.length,1);
  assert(legacyUI.get('history').children[0].children.some(c=>c.textContent.includes('이전 규칙')));
  await legacyUI.get('spin').onclick();
  const migrated=JSON.parse(legacyStorage.get(key));
  assert.equal(migrated.history.length,2);
  assert.equal(migrated.history[1].picks[2],'Ball_Lightning');
  assert.notEqual(migrated.session.picks[2],'Ball_Lightning');
  const uniqueSession={profile:'all',picks:['Oracle','crossbow','unique:Requiem'],saved:true};
  const uniqueUI=mount(new Map([[key,JSON.stringify({schema:1,dataset:data.revision,session:uniqueSession,view:2,history:[]})]]));
  await uniqueUI.get('copy').onclick();
  assert(uniqueUI.get('copy-fallback').value.includes('최후의 한탄'));
  assert(uniqueUI.get('copy-fallback').value.includes('고뇌'));
  const storage = new Map([['round-slot-v1','GENERIC APP DATA']]);
  let ui = mount(storage);
  assert.equal(ui.get('stage-title').textContent,'직업 · 어센던시');
  assert(ui.get('steps').children[1].disabled);
  const spinning = ui.get('spin').onclick();
  assert(ui.get('profile').disabled);
  assert(ui.get('new').disabled);
  await spinning;
  assert(!ui.get('profile').disabled);
  assert.equal(JSON.parse(storage.get('poe2-exile-slot-v1')).session.picks.length,1);
  ui = mount(storage);
  assert(ui.get('spin').hidden);
  ui.get('next').onclick();
  assert.equal(ui.get('stage-title').textContent,'무기 구성');
  await ui.get('spin').onclick();
  ui.get('next').onclick();
  assert.equal(ui.get('stage-title').textContent,'스킬 젬');
  await ui.get('spin').onclick();
  assert(!ui.get('summary').hidden);
  assert.equal(ui.get('history').children.length,1);
  assert.equal(JSON.parse(storage.get('poe2-exile-slot-v1')).history.length,1);
  await ui.get('spin').onclick();
  ui = mount(storage);
  assert.equal(ui.get('history').children.length,1);
  assert(!ui.get('summary').hidden);
  await ui.get('copy').onclick();
  assert(!ui.get('copy-fallback').hidden);
  ui.get('steps').children[1].onclick();
  const reset = JSON.parse(storage.get('poe2-exile-slot-v1'));
  assert.equal(reset.session.picks.length,1);
  assert.equal(reset.history.length,1);
  assert(ui.get('summary').hidden);
  ui.get('profile').value='attack';ui.get('profile').onchange();
  assert.equal(JSON.parse(storage.get('poe2-exile-slot-v1')).session.picks.length,0);
  assert.equal(storage.get('round-slot-v1'),'GENERIC APP DATA');
  ui=mount(new Map([['poe2-exile-slot-v1','{bad']]));
  assert(ui.get('save-note').textContent.includes('읽지 못'));
  ui=mount(new Map(),true);await ui.get('spin').onclick();
  assert(ui.get('save-note').textContent.includes('자동 저장 불가'));
  assert(!ui.get('profile').disabled);
  console.log(`PASS: ${combinations.toLocaleString()} valid profile/ascendancy/weapon/gem paths; explicit weapon, shield, form and spell rules; rejected invalid paths; rewind and restore; UI progression, locking, saved history, clipboard fallback, corrupted storage, storage failure, generic app isolation.`);
}
runUI().catch(error=>{console.error(error);process.exitCode=1;});
