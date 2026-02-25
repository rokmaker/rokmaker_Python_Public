import json
import os
from datetime import datetime

TODO_FILE = "todos.json"

def load_todos():
    """저장된 할일 불러오기"""
    if os.path.exists(TODO_FILE):
        with open(TODO_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return []

def save_todos(todos):
    """할일 저장하기"""
    with open(TODO_FILE, 'w', encoding='utf-8') as f:
        json.dump(todos, f, ensure_ascii=False, indent=2)

def show_todos(todos):
    """할일 목록 보기"""
    if not todos:
        print("\n할 일이 없어요! ✨")
        return
    
    print("\n" + "="*50)
    print("�� TODO LIST")
    print("="*50)
    
    for i, todo in enumerate(todos, 1):
        status = "✅" if todo['done'] else "⬜"
        priority = "��" if todo.get('priority') == 'high' else ""
        print(f"{i}. {status} {priority} {todo['task']}")
        if todo.get('created'):
            print(f"   생성: {todo['created']}")
    print("="*50)

def add_todo(todos):
    """할일 추가"""
    task = input("\n할 일: ").strip()
    if not task:
        print("입력된 내용이 없어요!")
        return
    
    priority = input("우선순위 (high/normal): ").strip().lower()
    if priority not in ['high', 'normal']:
        priority = 'normal'
    
    new_todo = {
            'task': task,
        'done': False,
        'priority': priority,
        'created': datetime.now().strftime("%Y-%m-%d %H:%M")
    }
    
    todos.append(new_todo)
    save_todos(todos)
    print(f"✅ 추가됨: {task}")

def toggle_todo(todos):
    """할일 완료/미완료 토글"""
    show_todos(todos)
    try:
        index = int(input("\n완료 처리할 번호: ")) - 1
        if 0 <= index < len(todos):
            todos[index]['done'] = not todos[index]['done']
            save_todos(todos)
            status = "완료" if todos[index]['done'] else "미완료"
            print(f"✅ {status}로 변경됨")
        else:
            print("잘못된 번호!")
    except ValueError:
        print("숫자를 입력해주세요!")

def delete_todo(todos):
    """할일 삭제"""
    show_todos(todos)
    try:
        index = int(input("\n삭제할 번호: ")) - 1
        if 0 <= index < len(todos):
            removed = todos.pop(index)
            save_todos(todos)
            print(f"❌ 삭제됨: {removed['task']}")
        else:
            print("잘못된 번호!")
    except ValueError:
        print("숫자를 입력해주세요!")

def clear_done(todos):
    """완료된 항목 일괄 삭제"""
    before = len(todos)
    todos[:] = [t for t in todos if not t['done']]
    save_todos(todos)
    removed = before - len(todos)
    print(f"��️  완료된 {removed}개 항목 삭제됨")

def main():
    """메인 루프"""
    todos = load_todos()
    
    while True:
        print("\n" + "-"*50)
        print("1:목록  2:추가  3:완료  4:삭제  5:완료항목정리  0:종료")
        print("-"*50)
        
        choice = input("선택: ").strip()
        
        if choice == '1':
            show_todos(todos)
        elif choice == '2':
            add_todo(todos)
        elif choice == '3':
            toggle_todo(todos)
        elif choice == '4':
            delete_todo(todos)
        elif choice == '5':
            clear_done(todos)
        elif choice == '0':
            print("�� 안녕!")
            break
        else:
            print("잘못된 선택!")

if __name__ == "__main__":
    main()
