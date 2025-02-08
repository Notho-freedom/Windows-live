import os
import re

def replace_stroke_color_in_directory(directory_path):
    # Parcours des fichiers dans le répertoire
    for filename in os.listdir(directory_path):
        if filename.endswith(".svg"):  # Vérifier si le fichier est un fichier SVG
            file_path = os.path.join(directory_path, filename)
            with open(file_path, "r") as file:
                svg_content = file.read()

            # Remplacer la couleur de la ligne
            modified_svg_content = re.sub(r'stroke="#e60540"', r'stroke="#FFFFFF"', svg_content)
            modified_svg_content = re.sub(r'fill="currentColor"', r'fill="none" stroke="#FFFFFF"', modified_svg_content)

            # Réécrire le contenu modifié dans le fichier
            with open(file_path, "w") as file:
                file.write(modified_svg_content)
                print(f"{filename} ..modiffied!")

# Utilisation de la fonction avec le répertoire cible
directory_path = "."
replace_stroke_color_in_directory(directory_path)
