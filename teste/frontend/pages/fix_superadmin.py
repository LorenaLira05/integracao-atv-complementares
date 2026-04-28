
import os
import re

dir_path = r"c:\Users\Lorena Lira\o-retorno-dos-reposit-rios-Main\teste\frontend\pages"

html_files = [f for f in os.listdir(dir_path) if f.endswith('.html')]

for filename in html_files:
    file_path = os.path.join(dir_path, filename)
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Check for superadmin sidebar usage
    if 'sidebar-dark' in content:
         # Replace specific parts if needed (example logic)
         pass

print("Superadmin fix script restored.")
