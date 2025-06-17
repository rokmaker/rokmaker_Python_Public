# app/core/executor.py (최종 버전)

import subprocess
import sys

def launch_program(path):
    """주어진 경로의 프로그램을 실행합니다."""
    print(f"실행 시도: {path}")
    
    # Windows에서만 creationflags 옵션을 사용
    if sys.platform == 'win32':
        # DETACHED_PROCESS 플래그는 부모 프로세스(우리 런처)의 콘솔에 묶이지 않고
        # 완전히 새로운 독립 프로세스로 실행하게 만들어 줌.
        # GUI 앱에서 다른 GUI 앱을 띄울 때의 정석적인 방법.
        creationflags = subprocess.DETACHED_PROCESS
        
        try:
            subprocess.Popen(path, creationflags=creationflags)
            return True, f"{path} 실행 성공"
        except Exception as e:
            error_msg = f"오류: 프로그램을 실행하는 중 문제가 발생했습니다. ({e})"
            print(error_msg)
            return False, error_msg
    else:
        # macOS, Linux 등 다른 OS에서는 이 옵션 없이 실행
        try:
            subprocess.Popen(path)
            return True, f"{path} 실행 성공"
        except Exception as e:
            error_msg = f"오류: 프로그램을 실행하는 중 문제가 발생했습니다. ({e})"
            print(error_msg)
            return False, error_msg