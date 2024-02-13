import tkinter as tk
from tkinter import filedialog, simpledialog
import os
from PIL import ImageGrab
import tkinterdnd2 as tkdnd
import shutil
import configparser

current_directory = os.path.dirname(os.path.abspath(__file__))

CONFIG_FILE = os.path.join(current_directory, 'config.ini')

def save_config(folder_path, selected_folder):
    config = configparser.ConfigParser()
    config['Settings'] = {'FolderPath': folder_path, 'SelectedFolder': selected_folder}
    with open(CONFIG_FILE, 'w') as configfile:
        config.write(configfile)

def load_config():
    config = configparser.ConfigParser()

    # 'config.ini' 파일이 존재하지 않을 경우 처리
    if os.path.exists(CONFIG_FILE):
        config.read(CONFIG_FILE)
        folder_path = config['Settings'].get('FolderPath', '')
        selected_folder = config['Settings'].get('SelectedFolder', '')
    else:
        folder_path = 'Please select a folder.'
        selected_folder = 'Select a folder...'

    folder_path_var = tk.StringVar(app)
    folder_path_var.set(folder_path)

    return folder_path, selected_folder

def on_closing():
    folder_path = folder_path_var.get()
    selected_folder = dropdown_var.get() if dropdown_var.get() else options[0]  # 옵션메뉴의 초기값 사용
    save_config(folder_path, selected_folder)
    app.destroy()

def run_app():
    global app, dropdown_var, folder_path_var, listbox, dropdown_menu, options
    app = tkdnd.TkinterDnD.Tk()
    app.title("Simple Clipboard Program")
    app.minsize(width=300, height=400)

    def select_folder():
        folder_path = filedialog.askdirectory()
        if folder_path:
            folder_path = os.path.normpath(folder_path)  # 경로 정규화
            folder_path_var.set(folder_path)  # folder_path_var를 업데이트하여 Label에 표시
            update_options(folder_path)

    def update_options(folder_path):
        subfolders = [f.name for f in os.scandir(folder_path) if f.is_dir()]
        dropdown_var.set('')  # 초기화
        menu = dropdown_menu["menu"]
        menu.delete(0, "end")
        for folder in subfolders:
            menu.add_command(label=folder, command=lambda value=folder: dropdown_var.set(value))

    def update_listbox(subfolder):
        full_folder_path = os.path.join(folder_path_var.get(), subfolder)
        listbox.delete(0, tk.END)
        if os.path.isdir(full_folder_path):
            for file in os.listdir(full_folder_path):
                if os.path.isfile(os.path.join(full_folder_path, file)):
                    listbox.insert(tk.END, file)

    def open_file(event):
        try:
            selected_file = listbox.get(listbox.curselection())
            full_folder_path = os.path.join(folder_path_var.get(), dropdown_var.get())
            file_path = os.path.join(full_folder_path, selected_file)
            file_path = os.path.normpath(file_path)

            if os.path.isfile(file_path):
                os.startfile(file_path)
        except Exception as e:
            print(f"Error opening file: {e}")

    def drop(event):
        file_paths = app.tk.splitlist(event.data)
        selected_folder = dropdown_var.get()

        for file_path in file_paths:
            if os.path.isfile(file_path):
                folder_path = os.path.join(folder_path_var.get(), selected_folder)
                if not os.path.exists(folder_path):
                    os.makedirs(folder_path)

                target_path = os.path.join(folder_path, os.path.basename(file_path))
                shutil.copy(file_path, target_path)

        update_listbox(selected_folder)
        print(f"Files copied to {folder_path}")

    def refresh():
        current_folder = folder_path_var.get()
        if os.path.isdir(current_folder):
            update_options(current_folder)

    def folder_open():
        selected_subfolder = dropdown_var.get()
        full_path = os.path.join(folder_path_var.get(), selected_subfolder)
        if os.path.isdir(full_path):
            os.startfile(full_path)

    def paste_clipboard_image():
        try:
            image = ImageGrab.grabclipboard()
            if image:
                folder_path = os.path.join(folder_path_var.get(), dropdown_var.get())
                if not os.path.exists(folder_path):
                    os.makedirs(folder_path)

                file_name = simpledialog.askstring("Save Image", "Enter file name:", initialvalue="clipboard_image")
                if not file_name:
                    print("No file name provided.")
                    return

                file_path = os.path.join(folder_path, f"{file_name}.png")
                image.save(file_path, 'PNG')
                update_listbox(dropdown_var.get())
                print(f"Image saved to {file_path}")
            else:
                print("No image in clipboard.")
        except Exception as e:
            print(f"Error: {e}")
    
    def update_folder_path(new_folder_path):
        folder_path_var.set(new_folder_path)

    folder_path, selected_folder = load_config()
    
    top_frame = tk.Frame(app)
    top_frame.pack(padx=20, pady=10)

    select_button = tk.Button(top_frame, text="Select folder", command=select_folder)
    refresh_button = tk.Button(top_frame, text="Refresh", command=refresh)
    open_button = tk.Button(top_frame, text="Folder open", command=folder_open)

    select_button.pack(side=tk.LEFT, padx=5, pady=3)
    refresh_button.pack(side=tk.LEFT, padx=5, pady=3)
    open_button.pack(side=tk.LEFT, padx=5, pady=3)

    folder_path_var = tk.StringVar(app)

    text_field = tk.Label(app, width=27, textvariable=folder_path_var)
    text_field.pack(pady=3)

    options = ["Select a folder..."]
    dropdown_var = tk.StringVar(app)
    dropdown_var.set(options[0])
    dropdown_var.trace("w", lambda *args, **kwargs: update_listbox(dropdown_var.get()))
    dropdown_menu = tk.OptionMenu(app, dropdown_var, *options)
    dropdown_menu.config(width=21)
    dropdown_menu.pack(pady=3)

    paste_image_button = tk.Button(app, text="Clipboard image paste", command=paste_clipboard_image)
    paste_image_button.config(width=25)
    paste_image_button.pack(pady=3)

    listbox_frame = tk.Frame(app)
    listbox_frame.pack(fill=tk.BOTH, expand=True, padx=20, pady=10)

    listbox = tk.Listbox(listbox_frame, width=25, height=10)
    listbox.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
    listbox.bind("<Double-1>", open_file)
    listbox.drop_target_register(tkdnd.DND_FILES)
    listbox.dnd_bind('<<Drop>>', drop)

    scrollbar = tk.Scrollbar(listbox_frame, orient="vertical", command=listbox.yview)
    scrollbar.pack(side=tk.RIGHT, fill=tk.Y)

    listbox.config(yscrollcommand=scrollbar.set)

    update_folder_path(folder_path)
    dropdown_var.set(selected_folder)
    update_listbox(selected_folder)

    app.protocol("WM_DELETE_WINDOW", on_closing)

    app.mainloop()

run_app()
