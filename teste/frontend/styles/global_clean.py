
import os
import re

dir_path = r"c:\Users\Lorena Lira\o-retorno-dos-reposit-rios-Main\teste\frontend\styles"

css_files = [f for f in os.listdir(dir_path) if f.endswith('.css') and f != 'sidebar.css']

for filename in css_files:
    file_path = os.path.join(dir_path, filename)
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Remove .cabecalho-topo definitions
        new_content = re.sub(r'(?s)\.cabecalho-topo\s*\{.*?\}', '', content)
        # Remove .titulo-portal definitions
        new_content = re.sub(r'(?s)\.titulo-portal\s*\{.*?\}', '', new_content)
        
        if new_content != content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
    except Exception as e:
        print(f"Erro em {filename}: {e}")
