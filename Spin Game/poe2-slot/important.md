# 재개 시 핵심

- 이 프로젝트는 PoE2 전용. 상위 Round Slot은 범용 완전 무작위 앱으로 유지.
- 독립 실행: 실행.bat → index.html. 부모 폴더 코드/리소스 의존성 없음.
- 데이터: 2026-09-07 PoE2DB 절단 목록 182개 젬, 8개 기본 직업/22개 전직, 15개 무기 구성. 추가: 고유무기 부여 스킬 19종, 총 201종. 대상 0.5.5, 인게임 전수 검증은 아님.
- 엔진은 직업/전직 → 무기 구성 → 조건에 맞는 젬 순. 직업 테마에 따른 임의 무기 제한 금지.
- 부적에 일반 주문을 허용하면 안 됨: 활성 무기 세트에서 동물 형태 유지. 같은 형태 전용 젬과 확인된 고유부적 유지형 스킬만 허용.
- 버클러와 방어도 방패 구분. 육척봉과 주문용 지팡이 구분. 몰려오는 강타는 한손/양손 철퇴 모두, 초과 충전 강타는 양손만.
- 앞 라운드 재추첨 시 뒤 선택 초기화. 기록은 유지. localStorage 키 poe2-exile-slot-v1.
- 일반 앱 키 round-slot-v1에 접근하지 않음. 양쪽 별도 실행 가능.
- node test.cjs: 18,810개 경로, 명시적 장비 조건, 상태 전환, 저장 복원, 오류 처리를 검사.
- 실제 브라우저 화면 검증은 미완료. 이전 file URL 차단을 우회하지 않았음.
- 무기군 분류 + 장비 조건을 모두 검사. 석궁에 Ball_Lightning 금지. 주문용 무기는 Elemental/Occult/Primal 중 장비/형태 조건을 통과한 항목.
- 고유무기는 origin, weaponIds, requiredItem, 발동 안내 필수. research/unique-weapon-skills.json 수정 후 node research/sync-unique.cjs로 반영. 일반 베이스 부여 스킬은 현재 확장 범위 밖.
- revision v2: 과거 기록을 legacy 표시로 보존하고 부적합한 진행만 유효한 접두 선택까지 복구.
- 데이터 교체 시 research/gem-audit.json, data.js, SOURCES.md를 함께 갱신하고 테스트 실행. revision 변경은 저장 세션 호환성을 다시 판단해야 함.
