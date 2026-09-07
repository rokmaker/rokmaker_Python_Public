'use strict';
const $ = id => document.getElementById(id);
const KEY = 'round-slot-v1';
const uid = () => crypto.randomUUID();
const cleanItems = text => [...new Set(text.split(/\r?\n/).map(s => s.trim()).filter(Boolean))];
const sample = () => ({id:uid(), name:'오늘의 요리 챌린지', rounds:[
  {name:'음식', items:['파스타','볶음밥','떡볶이','샌드위치','카레','피자']},
  {name:'요리도구', items:['프라이팬','냄비','에어프라이어','전자레인지']},
  {name:'재료', items:['감자','버섯','치즈','달걀','두부','새우']}
]});
function validate(data) {
  if (!data || data.version !== 1 || !Array.isArray(data.presets) || !data.presets.length || data.presets.length > 100) throw Error('프리셋 형식이 올바르지 않습니다.');
  const str = (s,n) => typeof s === 'string' && s.length <= n;
  data.presets.forEach(p => {
    if (!str(p.name,80) || !Array.isArray(p.rounds) || !p.rounds.length || p.rounds.length > 100) throw Error('프리셋 이름 또는 라운드 구성을 확인해주세요.');
    p.rounds.forEach(r => { if (!str(r.name,80) || !Array.isArray(r.items) || r.items.length > 1000 || r.items.some(i => !str(i,200))) throw Error('후보는 라운드당 1,000개, 항목당 200자까지 가능합니다.'); });
  });
  return data.presets.map(p => ({id:uid(),name:p.name,rounds:p.rounds.map(r => ({name:r.name,items:cleanItems(r.items.join('\n'))}))}));
}
let state = {version:1,presets:[sample()],selected:0,history:[]};
let storageWarning = '';
try {
  const raw = localStorage.getItem(KEY);
  if(raw){const data = JSON.parse(raw);const presets = validate(data);state = {version:1,presets,selected:Number.isInteger(data.selected)&&data.selected>=0&&data.selected<presets.length?data.selected:0,history:Array.isArray(data.history)?data.history.filter(h=>h&&typeof h.name==='string'&&typeof h.date==='string'&&Array.isArray(h.results)&&h.results.every(r=>r&&typeof r.name==='string'&&typeof r.value==='string')).slice(0,50):[]};}
} catch {storageWarning = '저장 데이터를 읽지 못했습니다. 파일 백업을 이용해주세요.';}
let roundIndex = 0, results = [], spinning = false, recorded = false;
const preset = () => state.presets[state.selected];
const round = () => preset().rounds[roundIndex];
function save(){try{localStorage.setItem(KEY,JSON.stringify(state));$('save-status').textContent='● 이 브라우저에 자동 저장';}catch{$('save-status').textContent='저장 불가 · 내보내기로 백업해주세요.';}}
function el(tag,text,cls){const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e;}
function reset(){results=[];recorded=false;}
function render(){
  $('presets').replaceChildren(...state.presets.map((p,i)=>{const o=el('option',p.name||'이름 없는 프리셋');o.value=i;return o;}));$('presets').value=state.selected;
  $('preset-name').value=preset().name;$('round-name').value=round().name;$('items').value=round().items.join('\n');$('items').setCustomValidity('');
  renderRounds();renderStage();renderHistory();
}
function renderRounds(){
  $('round-list').replaceChildren(...preset().rounds.map((r,i)=>{const b=el('button',undefined,'round-row'+(i===roundIndex?' active':''));b.append(el('b',String(i+1).padStart(2,'0')),el('span',r.name||'이름 없는 라운드'),el('em',`${r.items.length}개`));b.disabled=spinning;b.onclick=()=>{roundIndex=i;render();};return b;}));
  $('count').textContent=`· ${round().items.length}개`;$('up').disabled=roundIndex===0;$('down').disabled=roundIndex===preset().rounds.length-1;$('delete-round').disabled=preset().rounds.length===1;
}
function reelRows(items){$('reel').replaceChildren(...items.map(item=>el('div',item,'slot-item')));}
function renderStage(){
  $('round-badge').textContent=`ROUND ${String(roundIndex+1).padStart(2,'0')}`;$('progress').textContent=`${roundIndex+1} / ${preset().rounds.length}`;$('active-title').textContent=round().name||'이름 없는 라운드';
  const r=round().items;reelRows([r[1]||'·',results[roundIndex]??r[0]??'후보를 추가해주세요',r[2]||'·']);$('reel').style.transform='translateY(0px)';
  const done=results[roundIndex]!==undefined;const all=preset().rounds.every((_,i)=>results[i]!==undefined);
  $('spin').hidden=done;$('spin').disabled=!r.length;$('next').hidden=!done;$('next').textContent=all?'새 조합 만들기 ↻':'다음 미완료 라운드 →';
  $('status').textContent=all?'조합 완성! 최근 기록에 저장했어요.':done?`선택된 항목: ${results[roundIndex]}`:r.length?'준비가 되면 돌리기 버튼을 눌러주세요.':'왼쪽에서 후보를 한 개 이상 입력해주세요.';
  $('result-progress').textContent=`${results.filter(v=>v!==undefined).length} / ${preset().rounds.length}`;
  $('results').replaceChildren(...preset().rounds.map((r,i)=>{const d=el('div',undefined,'result '+(results[i]!==undefined?'done':'pending'));d.append(el('small',`${String(i+1).padStart(2,'0')} · ${r.name||'라운드'}`),el('strong',results[i]??'아직 기다리는 중'));return d;}));
}
function renderHistory(){
  if(!state.history.length){const d=el('div',undefined,'empty');d.append(el('i','✧'),el('div','어떤 조합이 탄생할까요?'),el('div','첫 번째 기록을 만들어보세요.'));$('history').replaceChildren(d);return;}
  $('history').replaceChildren(...state.history.map(h=>{const d=el('article',undefined,'history-card');d.append(el('b',h.name),el('time',new Date(h.date).toLocaleString('ko-KR')));h.results.forEach(r=>{const p=el('p');p.append(el('span',r.name+' · '),document.createTextNode(r.value));d.append(p);});return d;}));
}
// Rejection sampling avoids modulo bias in the random selection.
function randomIndex(n){const a=new Uint32Array(1),limit=Math.floor(4294967296/n)*n;do{crypto.getRandomValues(a);}while(a[0]>=limit);return a[0]%n;}
function lock(value){spinning=value;document.querySelectorAll('button,input,textarea,select').forEach(e=>e.disabled=value);if(!value){$('delete-preset').disabled=state.presets.length===1;renderRounds();}}
async function spin(){
  if($('items').validationMessage){$('items').reportValidity();return;}
  if(spinning||!round().items.length||results[roundIndex]!==undefined)return;
  const items=round().items,winner=items[randomIndex(items.length)];lock(true);$('status').textContent='두근두근, 고르는 중…';
  const rows=Array.from({length:45},()=>items[randomIndex(items.length)]);rows[1]=winner;
  // Move the strip downward and stop with row 1 inside the center window.
  reelRows(rows);const from=-40*80;$('reel').style.transform=`translateY(${from}px)`;
  try{const animation=$('reel').animate([{transform:`translateY(${from}px)`},{transform:'translateY(0px)'}],{duration:matchMedia('(prefers-reduced-motion: reduce)').matches?100:2700,easing:'cubic-bezier(.12,.65,.12,1)',fill:'forwards'});await animation.finished;$('reel').style.transform='translateY(0px)';animation.cancel();
    results[roundIndex]=winner;
    if(!recorded&&preset().rounds.every((_,i)=>results[i]!==undefined)){state.history.unshift({name:preset().name,date:new Date().toISOString(),results:preset().rounds.map((r,i)=>({name:r.name,value:results[i]}))});state.history=state.history.slice(0,50);recorded=true;save();}
  }catch{$('status').textContent='회전이 중단되었습니다. 다시 돌려주세요.';}finally{lock(false);renderStage();renderHistory();}
}
function edit(){reset();save();renderRounds();renderStage();}
$('spin').onclick=spin;
$('next').onclick=()=>{const i=preset().rounds.findIndex((_,i)=>results[i]===undefined);if(i<0){reset();roundIndex=0;}else roundIndex=i;render();};
$('restart').onclick=()=>{reset();roundIndex=0;render();};
$('presets').onchange=()=>{state.selected=Number($('presets').value);roundIndex=0;reset();save();render();};
$('preset-name').oninput=()=>{preset().name=$('preset-name').value;save();$('presets').options[state.selected].textContent=preset().name||'이름 없는 프리셋';};
$('round-name').oninput=()=>{round().name=$('round-name').value;edit();};
$('items').oninput=()=>{const values=cleanItems($('items').value);if(values.length>1000||values.some(s=>s.length>200)){$('items').setCustomValidity('후보는 1,000개까지, 항목당 200자까지 입력해주세요.');$('items').reportValidity();return;}$('items').setCustomValidity('');round().items=values;edit();};
$('add-round').onclick=()=>{if(preset().rounds.length>=100)return alert('라운드는 최대 100개입니다.');preset().rounds.push({name:`라운드 ${preset().rounds.length+1}`,items:[]});roundIndex=preset().rounds.length-1;reset();save();render();};
$('delete-round').onclick=()=>{if(preset().rounds.length===1)return;if(!confirm('이 라운드를 삭제할까요?'))return;preset().rounds.splice(roundIndex,1);roundIndex=Math.min(roundIndex,preset().rounds.length-1);reset();save();render();};
function move(delta){const rounds=preset().rounds,next=roundIndex+delta;if(next<0||next>=rounds.length)return;[rounds[roundIndex],rounds[next]]=[rounds[next],rounds[roundIndex]];roundIndex=next;reset();save();render();}
$('up').onclick=()=>move(-1);$('down').onclick=()=>move(1);
function addPreset(p){if(state.presets.length>=100)return alert('프리셋은 최대 100개입니다.');state.presets.push(p);state.selected=state.presets.length-1;roundIndex=0;reset();save();render();}
$('add-preset').onclick=()=>addPreset({id:uid(),name:'새 프리셋',rounds:[{name:'첫 번째 라운드',items:['선택 A','선택 B','선택 C']}]});
$('duplicate').onclick=()=>addPreset({...structuredClone(preset()),id:uid(),name:(preset().name+' (복사)').slice(0,80)});
$('delete-preset').onclick=()=>{if(state.presets.length===1)return alert('프리셋은 하나 이상 필요합니다.');if(!confirm(`“${preset().name}” 프리셋을 삭제할까요?`))return;state.presets.splice(state.selected,1);state.selected=0;roundIndex=0;reset();save();render();};
$('clear-history').onclick=()=>{if(!state.history.length||!confirm('최근 기록을 모두 비울까요?'))return;state.history=[];save();renderHistory();};
$('export').onclick=()=>{const url=URL.createObjectURL(new Blob([JSON.stringify({version:1,presets:state.presets},null,2)],{type:'application/json'}));const a=el('a');a.href=url;a.download='round-slot-presets.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
$('import').onclick=()=>$('file').click();
$('file').onchange=async()=>{const f=$('file').files[0];if(!f)return;try{if(f.size>5*1024*1024)throw Error('5MB 이하의 파일을 선택해주세요.');const incoming=validate(JSON.parse(await f.text()));if(state.presets.length+incoming.length>100)throw Error('합계 100개까지 가져올 수 있습니다.');state.selected=state.presets.length;state.presets.push(...incoming);roundIndex=0;reset();save();render();}catch(e){alert('가져오기 실패: '+e.message);}finally{$('file').value='';}};
render();if(storageWarning)$('save-status').textContent=storageWarning;
