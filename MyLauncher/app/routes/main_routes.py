# app/routes/main_routes.py

from flask import Blueprint, render_template, current_app, jsonify, request
from ..core import executor

main_bp = Blueprint('main', __name__)

@main_bp.route('/')
def index():
    """메인 페이지를 렌더링합니다."""
    # 앱 설정에서 config 정보를 가져옴
    config = current_app.config['LAUNCHER_CONFIG']
    shortcuts = config.get('shortcuts', [])
    
    # 수정 전: return render_template('main.html', shortcuts=shortcuts)
    
    # 수정 후: config=config 를 추가해서 HTML에게 전체 설정 정보를 넘겨줌
    return render_template('main.html', config=config, shortcuts=shortcuts)

@main_bp.route('/api/launch', methods=['POST'])
def launch():
    """바로가기 실행 API"""
    data = request.get_json()
    shortcut_id = data.get('id')

    if not shortcut_id:
        return jsonify({'status': 'error', 'message': 'ID가 필요합니다.'}), 400

    # 설정에서 전체 바로가기 목록을 가져옴
    shortcuts = current_app.config['LAUNCHER_CONFIG'].get('shortcuts', [])
    
    # 요청받은 ID와 일치하는 바로가기를 찾음
    target_shortcut = next((s for s in shortcuts if s.get('id') == shortcut_id), None)

    if not target_shortcut:
        return jsonify({'status': 'error', 'message': '해당 ID의 바로가기를 찾을 수 없습니다.'}), 404

    path = target_shortcut.get('path')
    success, message = executor.launch_program(path)

    if success:
        return jsonify({'status': 'success', 'message': message})
    else:
        return jsonify({'status': 'error', 'message': message}), 500