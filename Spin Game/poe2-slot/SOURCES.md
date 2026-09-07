# 데이터 출처와 판정 기록

확인일: 2026-09-07. 대상: Path of Exile 2 0.5.5.

## 기준 자료
- [GGG 공식 0.5.5 패치 노트](https://www.pathofexile.com/forum/view-thread/4000864): 대상 패치 확인.
- [PoE2DB 영문 젬 목록](https://poe2db.tw/us/Skill_Gems): Gemcutting 56개 행의 일반 스킬 젬 182개 중복 제거.
- [PoE2DB 한글 젬 목록](https://poe2db.tw/kr/Skill_Gems): 같은 절단 목록 행의 이름을 대응시켜 한글 명칭 수록.
- [어센던시 목록](https://poe2db.tw/kr/Ascendancy_class): 기본 직업과 전직 이름 대응.
- [0.5.0 변경 이력](https://poe2db.tw/us/Version_0.5.0): 마셜 아티스트와 스피릿 워커 추가 확인.
- [부적 규칙](https://poe2db.tw/us/Talismans): 활성 무기 세트에서 동물 형태 유지, 인간형 스킬 제한 확인.

## 전용 스킬 혼입 재점검 · 2026-09-07
- 앱 182개와 새로 조회한 Gemcutting 182개의 이름을 대조: 차집합 양쪽 모두 0개.
- Manifest Weapon, Temporal Rift, Demon Form, Time Freeze, Skeletal Warrior는 앱 목록에 없음.
- Manifest Weapon의 From은 Living Weapon, Temporal Rift의 From은 Footprints in the Sand로 확인. 이 두 전직 부여 스킬은 일반 후보에 없음.
- Hand of Chayula는 From: Uncut Skill Gem Tier 9로 확인. 이름에 차율라가 있어도 해당 전직 전용이 아님.
- 증거: research/acquisition-audit.json. 앱 데이터 변경 없음. 공개 절단 목록 대조이며 0.5.5 인게임 획득 경로 전수 검증은 아님.

## 개별 젬 대조
각 젬 페이지의 요구 무기 종류를 확인했습니다. 전체 수록 항목의 이름, 젬 등급, 분류, 요구 무기, 태그와 원문 주소는 `research/gem-audit.json` 및 `data.js`에 있습니다. 원문 설명문이나 이미지/영상은 앱에 복제하지 않았습니다.

주요 확인 사례:
- [뼈 박살](https://poe2db.tw/us/Boneshatter): 한손/양손 철퇴.
- [초과 충전 강타](https://poe2db.tw/us/Supercharged_Slam): 양손 철퇴.
- [방패 돌진](https://poe2db.tw/us/Shield_Charge): 방어도가 있는 방패.
- [충격파 토템](https://poe2db.tw/us/Shockwave_Totem): 장비 조건은 무술 무기. v2에서는 Mace/Primal 절단 분류도 요구하므로 활/석궁에서 제외.
- [살상 장법](https://poe2db.tw/us/Killing_Palm): 현재 페이지의 육척봉 요구 조건 사용.
- [분개한 강타](https://poe2db.tw/us/Furious_Slam): 부적, 곰 형태.
- [피사냥개의 징표](https://poe2db.tw/us/Bloodhounds_Mark): 요구 무기 없음. 영문 이름의 아포스트로피와 URL 철자가 다름.
- [바람 독사의 광분](https://poe2db.tw/us/Wind_Serpents_Fury): 창. URL에서 아포스트로피 제거.

## 제외 및 보수적 처리
- 일반 젬은 절단 목록을 후보의 경계로 사용합니다. 전체 Skills 427개를 그대로 복사하지 않습니다.
- 고유무기의 명시적 레벨 부여 옵션에서 일반 젬과 중복되지 않는 스킬 19종 추가. 전직 부여 스킬, 보조 젬, 리그 룬 스킬과 무기 베이스 기본 스킬은 제외.
- 미출시 기본 직업과 선택 여부가 별도로 확인되지 않은 `Abyssal Lich` 항목은 제외합니다. 일반 `Lich`는 포함합니다.
- 부적 일반 젬은 해당 형태의 전용 스킬로 제한하며 고유부적 유지형 효과는 허용합니다. 인간형 일반 주문을 무기 제한이 없다는 이유만으로 부적 후보에 넣지 않습니다.
- 어센던시 선택만으로 세부 노드가 강제된다고 가정하지 않습니다. 특정 전직 노드가 자원이나 스킬 사용에 영향을 줄 수 있음을 결과에서 안내합니다.
- 현재 공개 DB 스냅샷이며, 0.5.5 클라이언트와의 항목별 전수 대조는 하지 못했습니다. 이후 데이터 업데이트 때 재검증이 필요합니다.

## 무기군 연동 수정 · v2
- 사용자 지정 Gemcutting 분류를 추가 필터로 적용. 구형 번개는 Elemental이므로 Crossbow에서 제외.
- 주문용 무기 구성은 Elemental/Occult/Primal을 묶은 앱 정책이며 게임의 강제 무기 제한이라고 주장하지 않음.
- [고유 석궁](https://poe2db.tw/kr/Crossbows): 이중 시각 → 쌍둥이 쇄도, 최후의 한탄 → 진혼곡. 석궁 후보 25개 일반 젬 + 2개 부여 스킬.
- 총 19개 추가의 스킬/아이템 개별 출처, 무기 구성, 형태, 발동 조건은 research/unique-weapon-skills.json에 보존. 일반 무기 베이스가 주는 스킬까지 전수 수록한 목록은 아님.
- 수록 무기군: 한손 철퇴 4, 양손 철퇴 1, 창 3, 활 2, 마법봉 2, 셉터 1, 지팡이 1, 부적 3, 석궁 2.
- 기존 획득 경로 감사 파일은 추가 이전의 일반 젬 182종 감사 기록으로 유지.
- 18,810개 유효 경로, 무기군 제한, 고유무기 구성/형태, 복사 조건, 이전 규칙 기록 보존 및 진행 복구 자동 검사 통과.

## 표시 및 권리
게임 명칭과 데이터의 권리는 Grinding Gear Games에 있습니다. 비공식 팬 도구이며 GGG가 제작하거나 승인한 도구가 아닙니다. 이름과 요구 조건의 출처는 PoE2DB입니다. PoE2DB는 위키 콘텐츠에 별도 표기가 없는 경우 CC BY-NC-SA 3.0을 안내합니다. 출처 링크와 데이터 확인일을 유지하세요.
