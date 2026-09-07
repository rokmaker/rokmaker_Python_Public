'use strict';
(() => {
  const data = window.POE_DATA;
  const rules = window.PoeRules;
  const $ = id => document.getElementById(id);
  const KEY = 'poe2-exile-slot-v1';
  const titles = ['직업 · 어센던시', '무기 구성', '스킬 젬'];
  const profiles = {all:'전체 스킬 젬', attack:'공격 스킬 젬', caster:'주문 · 소환수 젬'};
  let session = rules.newSession(), view = 0, history = [], speed = 'normal', spinning = false;
  let warning = '';
  const node = (tag, text, cls) => {
    const e = document.createElement(tag);
    if (text !== undefined) e.textContent = text;
    if (cls) e.className = cls;
    return e;
  };
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const saved = JSON.parse(raw);
      if (saved.schema !== 1) throw new Error('저장 형식 변경');
      try { session = rules.restore(data, saved.session); }
      catch {
        session = rules.newSession(profiles[saved.session?.profile] ? saved.session.profile : 'all');
        for (const id of (Array.isArray(saved.session?.picks) ? saved.session.picks.slice(0, 3) : [])) {
          try { session = rules.choose(data, session, id); } catch { break; }
        }
        warning = '무기군 규칙이 변경되어 맞지 않는 선택부터 다시 뽑습니다. 완료 기록은 보존했습니다.';
      }
      view = Number.isInteger(saved.view) && saved.view >= 0 && saved.view <= Math.min(session.picks.length, 2) ? saved.view : Math.min(session.picks.length, 2);
      if (['normal','fast','instant'].includes(saved.speed)) speed = saved.speed;
      history = Array.isArray(saved.history) ? saved.history.filter(h => h && profiles[h.profile] && Array.isArray(h.picks) && h.picks.length === 3 && rules.resolve(data, h.picks).every(Boolean) && typeof h.date === 'string' && Number.isFinite(Date.parse(h.date))).slice(0, 50).map(h => {
        let legacy = h.legacy === true || saved.dataset !== data.revision;
        try { rules.restore(data, h); } catch { legacy = true; }
        return {...h, legacy};
      }) : [];
      if (warning) view = Math.min(session.picks.length, 2);
    }
  } catch {
    warning = '이전 저장 내용을 읽지 못했습니다. 새 조합으로 시작합니다.';
  }
  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify({schema:1, dataset:data.revision, session, view, speed, history}));
      $('save-note').textContent = '● 이 브라우저에 자동 저장';
    } catch { $('save-note').textContent = '자동 저장 불가 · 완성된 기록은 파일로 저장해주세요.'; }
  }
  function pool() { return rules.candidates(data, rules.rewind(session, view)); }
  function subtitle(item) { return item.requiredItem ? `고유무기 · ${item.requiredItem.name}` : item.className ? `${item.className} · ${item.en}` : item.en || ''; }
  function link(text, url) {
    const a = node('a', text); a.href = url; a.target = '_blank'; a.rel = 'noopener'; return a;
  }
  function rows(items) {
    $('reel').replaceChildren(...items.map(item => {
      const row = node('div', undefined, 'slot-row');
      row.append(node('strong', item?.name || '운명을 기다리는 중'), node('small', item ? subtitle(item) : 'EXILE SLOT'));
      return row;
    }));
  }
  function renderSteps() {
    $('steps').replaceChildren(...titles.map((title, i) => {
      const b = node('button', undefined, `step${view === i ? ' active' : ''}${session.picks[i] ? ' done' : ''}`);
      b.append(node('span', `0${i+1}${session.picks[i] ? ' · ✓' : ''}`), node('div', title));
      b.disabled = spinning || i > session.picks.length;
      b.title = '이 라운드부터 다시 추첨합니다. 이후 선택은 초기화됩니다.';
      b.onclick = () => {
        if (spinning) return;
        session = rules.rewind(session, i); view = i; save(); render();
      };
      return b;
    }));
  }
  function renderPool() {
    const candidates = pool();
    const term = $('search').value.trim().toLocaleLowerCase();
    const found = candidates.filter(i => `${i.name} ${i.en} ${i.className || ''} ${i.requiredItem?.name || ''}`.toLocaleLowerCase().includes(term));
    $('pool-total').textContent = `${found.length} / ${candidates.length}`;
    $('pool').replaceChildren(...found.map(item => {
      const row = node('div', undefined, 'candidate');
      row.append(link(item.name, item.source), node('small', subtitle(item)));
      if (item.tier) row.append(node('small', `젬 등급 ${item.tier} · ${item.requirementLabel}`));
      else if (item.requiredItem) row.append(link('필수 고유무기 정보 ↗', item.requiredItem.source), node('small', item.notes.join(' ')));
      else if (item.note) row.append(node('small', item.note));
      return row;
    }));
    if (!found.length) $('pool').append(node('p', '일치하는 후보가 없습니다.', 'muted'));
  }
  function notesFor(picks) {
    const [asc, weapon, gem] = rules.resolve(data, picks);
    if (!gem) return [];
    const notes = [weapon.note, `무기 조건: ${gem.requirementLabel}`, ...gem.notes];
    if (asc.id === 'Acolyte_of_Chayula' && gem.tags.includes('Persistent')) notes.push('정신력을 없애는 어둠 관련 전직 노드를 선택하면 유지형 젬을 사용할 수 없으므로 해당 노드는 피하세요.');
    notes.push('젬과 장비의 레벨·능력치·자원 조건을 충족해야 합니다. 전직 패시브의 세부 선택과 빌드 성능은 별도입니다.');
    return [...new Set(notes.filter(Boolean))];
  }
  function renderSummary() {
    $('summary').hidden = session.picks.length !== 3;
    if (session.picks.length !== 3) return;
    const items = rules.resolve(data, session.picks);
    $('picks').replaceChildren(...items.map((item, i) => {
      const row = node('div', undefined, 'pick');
      const name = node('div');
      name.append(node('strong', item.name), node('small', subtitle(item)));
      row.append(node('span', `0${i+1}`), name, link('정보 ↗', item.source));
      return row;
    }));
    const ul = node('ul'); notesFor(session.picks).forEach(note => ul.append(node('li', note)));
    $('conditions').replaceChildren(ul);
  }
  function renderHistory() {
    $('history-count').textContent = `${history.length} / 50`;
    $('export').disabled = !history.length || spinning;
    if (!history.length) {
      const empty = node('div', undefined, 'empty');
      empty.append(node('span', '◇'), node('div', '아직 쓰이지 않은 이야기.'), node('div', '세 라운드를 완성해보세요.'));
      $('history').replaceChildren(empty); return;
    }
    $('history').replaceChildren(...history.map(h => {
      const items = rules.resolve(data, h.picks);
      const card = node('article', undefined, 'history-card');
      card.append(node('time', new Date(h.date).toLocaleString('ko-KR')), node('b', `${items[0].className} · ${items[0].name}`), node('p', items[1].name), node('p', items[2].name), node('p', profiles[h.profile]));
      if (items[2].requiredItem) card.append(node('p', subtitle(items[2])));
      if (h.legacy) card.append(node('small', '이전 규칙으로 뽑은 기록 · 현재 후보와 다를 수 있음'));
      return card;
    }));
  }
  function render() {
    $('profile').value = session.profile; $('speed').value = speed;
    $('copy-fallback').hidden = true;
    renderSteps();
    const candidates = pool();
    const selected = candidates.find(c => c.id === session.picks[view]);
    $('round-label').textContent = `ROUND 0${view+1}`;
    $('stage-title').textContent = titles[view];
    $('pool-count').textContent = `${candidates.length} CANDIDATES`;
    rows([candidates[1], selected || candidates[0], candidates[2]]);
    $('reel').style.transform = 'translateY(0px)';
    $('spin').hidden = !!selected; $('spin').disabled = spinning || !candidates.length;
    $('next').hidden = !selected;
    $('next').textContent = session.picks.length === 3 ? '새 조합 만들기 ↻' : '다음 라운드 →';
    $('status').textContent = selected ? (session.picks.length === 3 ? '조합 완성. 아래에서 필요한 조건을 확인하세요.' : `${selected.name} 선택 완료!`) : view === 2 ? '선택한 무기와 조건이 맞는 젬 중에서 뽑습니다.' : '버튼을 눌러 이번 라운드를 시작하세요.';
    renderSummary(); renderPool(); renderHistory();
  }
  function lock(value) {
    spinning = value;
    for (const id of ['profile','speed','spin','next','new','copy','export']) $(id).disabled = value;
    renderSteps();
  }
  async function spin() {
    if (spinning || session.picks[view]) return;
    const candidates = pool();
    if (!candidates.length) return;
    const winner = candidates[rules.randomIndex(candidates.length)];
    lock(true); $('status').textContent = '운명이 움직이고 있습니다…';
    let animation;
    try {
      const strip = Array.from({length:43}, () => candidates[rules.randomIndex(candidates.length)]);
      strip[1] = winner; rows(strip);
      const start = -39 * 84;
      $('reel').style.transform = `translateY(${start}px)`;
      const duration = matchMedia('(prefers-reduced-motion: reduce)').matches || speed === 'instant' ? 0 : speed === 'fast' ? 800 : 2600;
      animation = $('reel').animate([{transform:`translateY(${start}px)`}, {transform:'translateY(0px)'}], {duration, easing:'cubic-bezier(.12,.65,.12,1)', fill:'forwards'});
      await animation.finished;
      session = rules.choose(data, session, winner.id);
      if (session.picks.length === 3 && !session.saved) {
        history.unshift({profile:session.profile, picks:[...session.picks], date:new Date().toISOString()});
        history = history.slice(0, 50); session.saved = true;
      }
      save();
    } catch {
      warning = '회전이 중단되었습니다. 다시 돌려주세요.';
    } finally {
      if (animation) animation.cancel();
      lock(false); render();
      if (warning) { $('status').textContent = warning; warning = ''; }
    }
  }
  function restart() {
    if (spinning) return;
    session = rules.newSession(session.profile); view = 0; save(); render();
  }
  function resultText(picks) {
    const items = rules.resolve(data, picks);
    return [`PoE2 조합 · 대상 ${data.targetVersion}`, `${items[0].className} / ${items[0].name}`, items[1].name, `${items[2].name} (${items[2].en})`, '', ...notesFor(picks), '', items[2].source].join('\n');
  }
  $('spin').onclick = spin;
  $('next').onclick = () => {
    if (spinning || !session.picks[view]) return;
    if (session.picks.length === 3) restart();
    else { view = session.picks.length; $('search').value = ''; save(); render(); }
  };
  $('new').onclick = restart;
  $('profile').onchange = () => {
    session = rules.newSession($('profile').value); view = 0; $('search').value = ''; save(); render();
  };
  $('speed').onchange = () => { speed = $('speed').value; save(); };
  $('search').oninput = renderPool;
  $('copy').onclick = async () => {
    if (session.picks.length !== 3 || spinning) return;
    const text = resultText(session.picks);
    try { await navigator.clipboard.writeText(text); $('status').textContent = '조합과 사용 조건을 복사했습니다.'; }
    catch { $('copy-fallback').value = text; $('copy-fallback').hidden = false; $('copy-fallback').focus(); $('copy-fallback').select(); $('status').textContent = '선택된 내용을 Ctrl+C로 복사해주세요.'; }
  };
  $('export').onclick = () => {
    if (!history.length || spinning) return;
    const payload = {app:'EXILE SLOT', targetVersion:data.targetVersion, checkedAt:data.checkedAt, records:history.map(h => ({...h, text:(h.legacy ? '이전 규칙의 기록 · 현재 후보와 다를 수 있음\n' : '') + resultText(h.picks)}))};
    const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], {type:'application/json'}));
    const a = node('a'); a.href = url; a.download = 'poe2-slot-history.json'; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  $('stats').replaceChildren(...[[data.ascendancies.length,'어센던시'],[data.weapons.length,'무기 구성'],[data.gems.filter(g=>g.enabled).length,'젬 · 부여 스킬']].map(([n,label]) => {
    const d = node('div'); d.append(node('strong', String(n)), node('span', label)); return d;
  }));
  $('data-label').textContent = `목록 확인 ${data.checkedAt} · PoE2DB 기준 · GGG 비공식 도구`;
  render();
  if (warning) { $('save-note').textContent = warning; warning = ''; }
})();
