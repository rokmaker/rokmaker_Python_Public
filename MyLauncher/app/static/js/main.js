// HTML 문서가 모두 로드되었을 때 아래 코드를 실행
document.addEventListener('DOMContentLoaded', () => {
    
    // 클래스가 'shortcut-block'인 모든 요소를 선택
    const shortcutBlocks = document.querySelectorAll('.shortcut-block');

    // 선택된 각 블록에 대해 클릭 이벤트를 추가
    shortcutBlocks.forEach(block => {
        block.addEventListener('click', () => {
            // 클릭된 블록의 data-id 속성 값을 가져옴 (예: 'unique_id_1')
            const shortcutId = block.dataset.id;

            // id가 없으면 아무 작업도 하지 않음
            if (!shortcutId) {
                console.error('클릭된 블록에 data-id 속성이 없습니다.');
                return;
            }

            console.log(`[프론트엔드] 클릭 감지! ID: ${shortcutId}, 백엔드에 실행 요청...`);

            // Fetch API를 사용해 백엔드의 '/api/launch' 주소로 POST 요청을 보냄
            fetch('/api/launch', {
                method: 'POST',
                headers: {
                    // 우리가 보내는 데이터가 JSON 형식임을 알려줌
                    'Content-Type': 'application/json',
                },
                // 보낼 데이터를 JSON 문자열로 변환 ( { "id": "unique_id_1" } )
                body: JSON.stringify({ id: shortcutId }),
            })
            .then(response => response.json()) // 백엔드 응답을 JSON으로 파싱
            .then(data => {
                // 백엔드로부터 받은 응답을 개발자 콘솔에 출력
                console.log('[프론트엔드] 백엔드 응답:', data);
            })
            .catch(error => {
                // 요청 중 네트워크 오류 등이 발생하면 콘솔에 에러 출력
                console.error('[프론트엔드] 요청 실패:', error);
            });
        });
    });
});