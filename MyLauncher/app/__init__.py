# app/__init__.py (진짜, 진짜 최종 완성본)

from flask import Flask
from .core.config_manager import get_config

# --- [ 가장 중요한 수정! ] ---
# 함수 안에 있던 Blueprint import를 파일 최상단으로 이동
# 이렇게 해야 PyInstaller가 이 파일을 놓치지 않고 빌드에 포함시킴
from .routes.main_routes import main_bp


def create_app():
    """Flask 애플리케이션 인스턴스를 생성하고 설정합니다."""
    
    app = Flask(__name__, 
                template_folder='app/templates', 
                static_folder='app/static')

    # 설정 파일 로드
    config = get_config()
    if not config:
        raise RuntimeError("Could not load configuration file. Application cannot start.")
    
    app.config['LAUNCHER_CONFIG'] = config

    # --- [ 이 위치에서 위로 이동함 ] ---
    # 이제 main_bp는 항상 인식됨
    app.register_blueprint(main_bp)
    
    return app