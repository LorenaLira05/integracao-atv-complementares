
import os
import re

dir_path = r"c:\Users\Lorena Lira\o-retorno-dos-reposit-rios-Main\teste\frontend\pages"

html_files = [f for f in os.listdir(dir_path) if f.endswith('.html')]

for filename in html_files:
    file_path = os.path.join(dir_path, filename)
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Remove inline style color from h1
    new_content = re.sub(r'(<h1[^>]*?style="[^"]*?)color:\s*[^;"]+;?\s*([^"]*?")', r'\1\2', content)
    # Remove empty styles
    new_content = re.sub(r'style="\s*"', '', new_content)
    
    if new_content != content:
        print(f"Cleaning inline h1 colors in {filename}...")
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
