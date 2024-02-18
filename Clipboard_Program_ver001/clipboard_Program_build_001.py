import tkinter as tk
from tkinter import filedialog, simpledialog
import os
from PIL import ImageGrab
import tkinterdnd2 as tkdnd
import shutil
import configparser



# CONFIG_FILE = os.path.join(current_directory, 'config.ini')

# def save_config(folder_path, selected_folder):
#     config = configparser.ConfigParser()
#     config['Settings'] = {'FolderPath': folder_path, 'SelectedFolder': selected_folder}
#     with open(CONFIG_FILE, 'w') as configfile:
#         config.write(configfile)

# def load_config():
#     config = configparser.ConfigParser()

#     # 'config.ini' 파일이 존재하지 않을 경우 처리
#     if os.path.exists(CONFIG_FILE):
#         config.read(CONFIG_FILE)
#         folder_path = config['Settings'].get('FolderPath', '')
#         selected_folder = config['Settings'].get('SelectedFolder', '')
#     else:
#         folder_path = 'Please select a folder.'
#         selected_folder = 'Select a folder...'

#     folder_path_var = tk.StringVar(app)
#     folder_path_var.set(folder_path)

    # return folder_path, selected_folder




class ROKMAKER_BABO():
    # def load_config(app):
    #     config = configparser.ConfigParser()
    #     # 'config.ini' 파일이 존재하지 않을 경우 처리
    #     if os.path.exists(CONFIG_FILE):
    #         config.read(CONFIG_FILE)
    #         folder_path = config['Settings'].get('FolderPath', '')
    #         selected_folder = config['Settings'].get('SelectedFolder', '')
    #     else:
    #         folder_path = 'Please select a folder.'
    #         selected_folder = 'Select a folder...'
    #     # folder_path_var = tk.StringVar(app)
    #     # folder_path_var.set(folder_path)
    #     return folder_path, selected_folder
    
    def save_config(self):
        # config = configparser.ConfigParser()
        self.config['Settings'] = {'FolderPath': self.folder_path, 'SelectedFolder': self.selected_folder}
        with open(self.CONFIG_FILE, 'w') as configfile:
            self.config.write(configfile)
    
    def on_closing(self):
        folder_path = self.get_fpv()
        selected_folder = self.get_dv() if self.get_dv() else self.options[0]  # 옵션메뉴의 초기값 사용
        self.save_config(folder_path, selected_folder)
        self.app.destroy()

    def __init__(self):
        self.current_directory = os.path.dirname(os.path.abspath(__file__))
        self.CONFIG_FILE = os.path.join(self.current_directory, 'config.ini')
        assert os.path.exists(self.CONFIG_FILE), 'Select a folder'

        self.app = tkdnd.TkinterDnD.Tk()
        self.app.title("Simple Clipboard Program")
        self.app.minsize(width=300, height=400)

        self.config = configparser.ConfigParser().read(self.CONFIG_FILE)
        self.folder_path_var = tk.StringVar(self.app).set(self.folder_path)
        self.folder_path = self.config['Settings'].get('FolderPath','')
        self.select_folder = self.config['Settings'].get('SelectedFolder','')
        
        self.dropdown_var = tk.StringVar(self.app)
        
        self.listbox_frame = tk.Frame(self.app)
        self.listbox = tk.Listbox(self.listbox_frame, width=25, height=10)
        self.options = ['Select a Folder']
        self.dropdown_menu = tk.OptionMenu(self.app, self.dropdown_var, *self.options)
        
        
# def run_app():
#     global app, dropdown_var, folder_path_var, listbox, dropdown_menu, options
#     app = tkdnd.TkinterDnD.Tk()
#     app.title("Simple Clipboard Program")
#     app.minsize(width=300, height=400)
    def get_fpv(self):
        return self.folder_path_var.get()
    def get_dv(self):
        return self.dropdown_var.get()
    
    def select_folder(self):
        folder_path = filedialog.askdirectory()
        if folder_path:
            folder_path = os.path.normpath(folder_path)  # 경로 정규화
            self.folder_path_var.set(folder_path)  # folder_path_var를 업데이트하여 Label에 표시
            self.update_options(folder_path)

    def update_options(self, folder_path):
        subfolders = [f.name for f in os.scandir(folder_path) if f.is_dir()]
        self.dropdown_var.set('')  # 초기화
        menu = self.dropdown_menu["menu"]
        menu.delete(0, "end")
        for folder in subfolders:
            menu.add_command(label=folder, command=lambda value=folder: self.dropdown_var.set(value))

    def update_listbox(self, subfolder):
        full_folder_path = os.path.join(self.get_fpv, subfolder)
        self.listbox.delete(0, tk.END)
        if os.path.isdir(full_folder_path):
            for file in os.listdir(full_folder_path):
                if os.path.isfile(os.path.join(full_folder_path, file)):
                    self.listbox.insert(tk.END, file)

    def open_file(self):
        try:
            selected_file = self.listbox.get(self.listbox.curselection())
            # full_folder_path = os.path.join(self.folder_path_var.get(), dropdown_var.get())
            # self로 선언했으니 재선언 필요 없음
            file_path = os.path.normpath(os.path.join(self.full_flder_path, selected_file))
            # file_path = os.path.normpath(file_path)

            if os.path.isfile(file_path):
                os.startfile(file_path)
        except Exception as e:
            print(f"Error opening file: {e}")

    def drop(self, event):
        file_paths = self.app.tk.splitlist(event.data)
        selected_folder = self.get_dv()

        for file_path in file_paths:
            if os.path.isfile(file_path):
                folder_path = os.path.join(self.get_fpv, selected_folder)
                if not os.path.exists(folder_path):
                    os.makedirs(folder_path)

                target_path = os.path.join(folder_path, os.path.basename(file_path))
                shutil.copy(file_path, target_path)

        self.update_listbox(selected_folder)
        print(f"Files copied to {folder_path}")

    def refresh(self):
        current_folder = self.get_fpv
        if os.path.isdir(current_folder):
            self.update_options(current_folder)

    def folder_open(self):
        full_path = os.path.join(self.get_fpv(), self.get_dv())
        if os.path.isdir(full_path):
            os.startfile(full_path)

    def paste_clipboard_image(self):
        try:
            image = ImageGrab.grabclipboard()
            if image:
                folder_path = os.path.join(self.get_fpv(), self.get_dv())
                if not os.path.exists(folder_path):
                    os.makedirs(folder_path)

                file_name = simpledialog.askstring("Save Image", "Enter file name:", initialvalue="clipboard_image")
                if not file_name:
                    print("No file name provided.")
                    return

                file_path = os.path.join(folder_path, f"{file_name}.png")
                image.save(file_path, 'PNG')
                self.update_listbox(self.get_dv())
                print(f"Image saved to {file_path}")
            else:
                print("No image in clipboard.")
        except Exception as e:
            print(f"Error: {e}")
    
    def update_folder_path(self, new_folder_path):
        self.folder_path_var.set(new_folder_path)

    def do(self):
        # folder_path, selected_folder = load_config()
        
        top_frame = tk.Frame(self.app)
        top_frame.pack(padx=20, pady=10)

        select_button = tk.Button(top_frame, text="Select folder", command=self.select_folder)
        refresh_button = tk.Button(top_frame, text="Refresh", command=self.refresh)
        open_button = tk.Button(top_frame, text="Folder open", command=self.folder_open)

        select_button.pack(side=tk.LEFT, padx=5, pady=3)
        refresh_button.pack(side=tk.LEFT, padx=5, pady=3)
        open_button.pack(side=tk.LEFT, padx=5, pady=3)

        # folder_path_var = tk.StringVar(app)

        text_field = tk.Label(self.app, width=27, textvariable=self.folder_path_var)
        text_field.pack(pady=3)

        # options = ["Select a folder..."]
        # dropdown_var = tk.StringVar(self.app)
        self.dropdown_var.set(self.options[0])
        self.dropdown_var.trace("w", lambda *args, **kwargs: self.update_listbox(self.get_dv()))
        dropdown_menu = tk.OptionMenu(self.app, self.dropdown_var, *self.options)
        dropdown_menu.config(width=21)
        dropdown_menu.pack(pady=3)

        paste_image_button = tk.Button(self.app, text="Clipboard image paste", command=self.paste_clipboard_image)
        paste_image_button.config(width=25)
        paste_image_button.pack(pady=3)

        listbox_frame = tk.Frame(self.app)
        listbox_frame.pack(fill=tk.BOTH, expand=True, padx=20, pady=10)

        listbox = tk.Listbox(listbox_frame, width=25, height=10)
        listbox.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        listbox.bind("<Double-1>", self.open_file)
        listbox.drop_target_register(tkdnd.DND_FILES)
        listbox.dnd_bind('<<Drop>>', self.drop)

        scrollbar = tk.Scrollbar(listbox_frame, orient="vertical", command=listbox.yview)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)

        listbox.config(yscrollcommand=scrollbar.set)

        self.update_folder_path(self.folder_path)
        self.dropdown_var.set(self.selected_folder)
        self.update_listbox(self.selected_folder)

        self.app.protocol("WM_DELETE_WINDOW", self.on_closing)

        self.app.mainloop()

# run_app()

def main():
    rokmaker = ROKMAKER_BABO()
    rokmaker.do()

if __name__ == '__main__':
    main()