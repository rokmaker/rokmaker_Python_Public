/* Pure rules and session state, shared by the browser and automated tests. */
(function(root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.PoeRules = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  'use strict';
  function randomIndex(length, cryptoSource = globalThis.crypto) {
    if (!Number.isInteger(length) || length < 1 || length > 4294967296) throw new Error('추첨할 후보가 없습니다.');
    const buffer = new Uint32Array(1);
    const limit = Math.floor(4294967296 / length) * length;
    do { cryptoSource.getRandomValues(buffer); } while (buffer[0] >= limit);
    return buffer[0] % length;
  }
  function eligible(gem, weapon, profile = 'all') {
    if (!gem.enabled || !weapon) return false;
    if (gem.origin === 'unique-weapon') {
      if (!gem.weaponIds.includes(weapon.id)) return false;
    } else if (!gem.groups.some(group => weapon.gemGroups.includes(group))) return false;
    if (profile === 'attack' && !gem.tags.includes('Attack')) return false;
    if (profile === 'caster' && !gem.tags.includes('Spell') && !gem.tags.includes('Minion')) return false;
    if (gem.requires.length && !gem.requires.some(requirement => weapon.supports.includes(requirement))) return false;
    if (gem.form && weapon.form !== gem.form) return false;
    // A talisman keeps its active weapon set shapeshifted; do not admit human-form skills.
    if (weapon.form && gem.form !== weapon.form && !gem.allowShapeshifted) return false;
    return true;
  }
  function gemsFor(data, weaponId, profile = 'all') {
    const weapon = data.weapons.find(w => w.id === weaponId);
    return data.gems.filter(g => eligible(g, weapon, profile));
  }
  function weaponsFor(data, profile = 'all') {
    return data.weapons.filter(w => gemsFor(data, w.id, profile).length > 0);
  }
  function newSession(profile = 'all') {
    return {profile, picks: [], saved: false};
  }
  function candidates(data, session) {
    if (session.picks.length === 0) return data.ascendancies;
    if (session.picks.length === 1) return weaponsFor(data, session.profile);
    if (session.picks.length === 2) return gemsFor(data, session.picks[1], session.profile);
    return [];
  }
  function choose(data, session, id) {
    if (!candidates(data, session).some(c => c.id === id)) throw new Error('현재 라운드에서 선택할 수 없는 후보입니다.');
    return {...session, picks: [...session.picks, id], saved: false};
  }
  function rewind(session, index) {
    if (!Number.isInteger(index) || index < 0 || index > session.picks.length) throw new Error('잘못된 라운드입니다.');
    return {...session, picks: session.picks.slice(0, index), saved: false};
  }
  function restore(data, input) {
    if (!input || !['all','attack','caster'].includes(input.profile) || !Array.isArray(input.picks) || input.picks.length > 3) throw new Error('저장된 조합 형식이 올바르지 않습니다.');
    let session = newSession(input.profile);
    for (const id of input.picks) session = choose(data, session, id);
    session.saved = input.saved === true && session.picks.length === 3;
    return session;
  }
  function resolve(data, picks) {
    return [data.ascendancies.find(a => a.id === picks[0]), data.weapons.find(w => w.id === picks[1]), data.gems.find(g => g.id === picks[2])];
  }
  return {randomIndex, eligible, gemsFor, weaponsFor, newSession, candidates, choose, rewind, restore, resolve};
});
