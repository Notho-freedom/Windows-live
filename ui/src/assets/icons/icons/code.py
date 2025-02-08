import os
import re

def rename_files(directory_path):
    for filename in os.listdir(directory_path):
        if os.path.isfile(os.path.join(directory_path, filename)):
            new_filename = re.sub(r'^(file_type_|folder_type_|default_)', '', filename)
            try:
                os.rename(os.path.join(directory_path, filename), os.path.join(directory_path, new_filename))
                print(f"{new_filename} ...modiffied!")
            except:
                new_filename = re.sub(r'^(type_)', '', filename)
                try:
                    os.rename(os.path.join(directory_path, filename), os.path.join(directory_path, new_filename))
                    print(f"{new_filename} ...modiffied!")
                except:
                    print(f"{new_filename} ...Error!")

# Utilisation de la fonction avec le répertoire cible
directory_path = "."
rename_files(directory_path)
