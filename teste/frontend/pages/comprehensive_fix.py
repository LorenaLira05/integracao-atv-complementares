
import os
import re

dir_path = r"c:\Users\Lorena Lira\o-retorno-dos-reposit-rios-Main\teste\frontend\pages"

html_files = [f for f in os.listdir(dir_path) if f.endswith('.html')]

header_html = """
            <header class="cabecalho-topo">
                <div>
                    <span class="titulo-portal">Portal do Coordenador</span>
                </div>
            </header>"""

for filename in html_files:
    file_path = os.path.join(dir_path, filename)
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Only target pages with sidebar (management pages)
    if 'sidebar-dark' in content:
        # Check if cabecalho-topo is missing
        if 'cabecalho-topo' not in content:
            # Insert after <main class="conteudo-principal">
            if '<main class="conteudo-principal">' in content:
                print(f"Fixing {filename}...")
                content = content.replace('<main class="conteudo-principal">', '<main class="conteudo-principal">' + header_html)
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(content)
            elif '<main class=\'conteudo-principal\'>' in content:
                 print(f"Fixing {filename} (single quote)...")
                 content = content.replace('<main class=\'conteudo-principal\'>', '<main class=\'conteudo-principal\'>' + header_html)
                 with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(content)
