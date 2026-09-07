// Exercise application state transitions without a browser or third-party packages.
const vm = require('node:vm');
const fs = require('node:fs');
const assert = require('node:assert/strict');
const {webcrypto} = require('node:crypto');
class Element {
  constructor(){this.children=[];this.style={};this.value='';this.textContent='';}
  append(...children){this.children.push(...children);}
  replaceChildren(...children){this.children=children;}
  get options(){return this.children;}
  setCustomValidity(value){this.validationMessage=value;}
  reportValidity(){}
  animate(){return {finished:Promise.resolve(),cancel(){}};}
}
const elements = new Map();
const storage = new Map();
const context = vm.createContext({crypto:webcrypto,structuredClone,console,Date,Blob,URL,setTimeout,
  document:{getElementById(id){if(!elements.has(id))elements.set(id,new Element());return elements.get(id);},createElement(){return new Element();},createTextNode(text){return {textContent:text};},querySelectorAll(){return [...elements.values()];}},
  localStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)},matchMedia:()=>({matches:true}),confirm:()=>true,alert:()=>{}});
const source = fs.readFileSync('app.js','utf8');
vm.runInContext(source,context);
const run = code=>vm.runInContext(code,context);
(async()=>{
  assert.equal(run('preset().rounds.length'),3);
  for(let i=0;i<3;i++){
    await run('spin()');
    assert.equal(run('round().items.includes(results[roundIndex])'),true);
    assert.equal(run('spinning'),false);
    if(i<2)run("$('next').onclick()");
  }
  assert.equal(run('state.history.length'),1);
  await run('spin()');
  assert.equal(run('state.history.length'),1);
  run("$('next').onclick()");
  assert.equal(run('results.length'),0);
  elements.get('items').value=' A \nB\nA\n\n';
  run("$('items').oninput()");
  assert.equal(run('round().items.join(",")'),'A,B');
  run("$('add-round').onclick()");
  assert.equal(run('preset().rounds.length'),4);
  assert.equal(run("$('spin').disabled"),true);
  run("$('round-name').value='도전';$('round-name').oninput();$('up').onclick()");
  assert.equal(run('preset().rounds[2].name'),'도전');
  run("$('duplicate').onclick()");
  assert.equal(run('state.presets.length'),2);
  run("$('round-name').value='복사본';$('round-name').oninput()");
  assert.equal(run('state.presets[0].rounds[0].name'),'음식');
  assert.throws(()=>run('validate({version:1,presets:[]})'));
  assert.throws(()=>run('validate({version:1,presets:[{name:"bad",rounds:[{name:"r",items:[2]}]}]})'));
  assert.equal(run('validate(JSON.parse(JSON.stringify({version:1,presets:state.presets}))).length'),2);
  assert.equal(JSON.parse(storage.get('round-slot-v1')).history.length,1);
  assert.equal(run('Array.from({length:1000},()=>randomIndex(7)).every(n=>n>=0&&n<7)'),true);
  console.log('PASS: round progression, valid winners, single history record, reset, deduplication, empty candidates, reorder, independent preset copy, JSON validation, backup round-trip, storage, random bounds.');
})().catch(e=>{console.error(e);process.exitCode=1;});
