import json
import os

# run.py에서 chdir로 작업 경로를 고정했기 때문에, 이제 이 단순한 경로로 파일을 찾을 수 있음.
CONFIG_PATH = 'config/config.json'


def get_config():
    """config.json 파일을 읽어서 파이썬 딕셔너리로 반환합니다."""
    try:
        # utf-8 인코딩으로 파일을 여는 것은 아주 좋은 습관
        with open(CONFIG_PATH, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        # --- [ 바로 이 부분! ] ---
        # 한글 메시지 대신 영어 메시지로 변경해서 인코딩 에러를 원천 차단
        abs_path = os.path.abspath(CONFIG_PATH)
        print(f"ERROR: Config file not found at {abs_path}")
        return None
    except json.JSONDecodeError:
        print(f"ERROR: Could not decode config.json. Check for syntax errors.")
        return None