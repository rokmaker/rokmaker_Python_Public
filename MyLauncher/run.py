import sys
import os
import webview
import threading
import time
from app import create_app

# --- [ PyInstaller의 모든 빌드 방식을 위한 궁극의 경로 해결 코드 ] ---
if getattr(sys, 'frozen', False):
    # .exe로 실행될 때 (빌드된 상태)
    if hasattr(sys, '_MEIPASS'):
        # --onefile 로 빌드된 경우, 데이터는 임시 폴더(_MEIPASS)에 압축 해제됨
        application_path = sys._MEIPASS
    else:
        # --onedir 로 빌드된 경우, 실행 파일과 데이터는 같은 폴더에 있음
        application_path = os.path.dirname(sys.executable)
else:
    # .py 스크립트로 실행될 때
    application_path = os.path.dirname(os.path.abspath(__file__))

# 현재 작업 경로를 실제 데이터 파일들이 있는 경로로 강제 변경
os.chdir(application_path)
# --- [ 여기까지 ] ---


# Flask 앱 인스턴스 생성 (이 아래는 이전과 동일)
app = create_app()

def run_flask():
    """Flask 앱을 별도의 스레드에서 실행하는 함수"""
    app.run(host='127.0.0.1', port=5000, threaded=True)

if __name__ == '__main__':
    flask_thread = threading.Thread(target=run_flask, daemon=True)
    flask_thread.start()
    
    time.sleep(1)

    config = app.config['LAUNCHER_CONFIG'].get('window', {})
    
    webview.create_window(
        title=config.get('title', 'MyLauncher'),
        url="http://127.0.0.1:5000",
        width=config.get('width', 800),
        height=config.get('height', 600),
        resizable=True
    )
    
    webview.start(debug=True) # 최종 배포 시에는 debug=False 로 변경