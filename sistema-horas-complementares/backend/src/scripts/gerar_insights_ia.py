import os
import sys
import time
from groq import Groq
from concurrent.futures import ThreadPoolExecutor, as_completed

# ──────────────────────────────────────────────
#  INSIGHT 1: Análise geral do curso
# ──────────────────────────────────────────────
def processar_curso_individual(client, ins_curso):
    course_id = ins_curso.get('referencia_id')
    titulo_curso = ins_curso.get('titulo', f'Curso {course_id}')
    descricao_pandas = ins_curso.get('descricao', '')
    valor_num = ins_curso.get('valor_numerico', 0)

    prompt = (
        f"Você é um Consultor Estratégico de Analytics e Gestão Acadêmica Sênior. Analise com atenção as seguintes métricas de submissão do curso '{titulo_curso}':\n"
        f"{descricao_pandas}\n\n"
        f"Sua tarefa é elaborar um diagnóstico inteligente e propor um plano de ação composto por exatamente 2 recomendações acionáveis, maduras e estratégicas para o Coordenador do curso.\n"
        f"Direcione as recomendações de forma perspicaz com base na situação real demonstrada pelas métricas:\n"
        f"- Caso haja um alto volume de submissões pendentes: sugira ações para acelerar a validação (ex: mutirões de triagem, cronograma semanal de revisões, auxílio administrativo).\n"
        f"- Caso a taxa de rejeição de certificados esteja alta: sugira ações pedagógicas ou de comunicação (ex: publicação de um manual rápido de orientações, alinhamento sobre as regras de limite com a turma, esclarecimento sobre os comprovantes aceitos).\n"
        f"- Caso a taxa de aprovação esteja ideal ou as pendências baixas: sugira ações para manter o engajamento dos alunos e incentivar novas submissões (ex: palestras de conscientização sobre horas complementares, divulgação das categorias de atividades, campanhas de envio antecipado).\n\n"
        f"REGRAS DE FORMATO CRÍTICAS E OBRIGATÓRIAS (QUALQUER DESVIO IRÁ QUEBRAR O SISTEMA):\n"
        f"1. NÃO inclua NENHUM preâmbulo, introdução, conclusão, título ou tags markdown (como asteriscos de negrito). O retorno deve conter apenas as duas recomendações.\n"
        f"2. Escreva exatamente duas recomendações. Cada recomendação deve iniciar obrigatoriamente com o prefixo '• '.\n"
        f"3. Separe as duas recomendações única e exclusivamente pela tag HTML '<br>'. Não use quebras de linha normais (\\n).\n"
        f"4. Cada recomendação deve ser formulada de maneira clara, elegante e profissional, contendo entre 10 e 20 palavras.\n\n"
        f"Exemplo de saída esperada:\n"
        f"• Implementar um mutirão semanal de validação para zerar a fila de certificados pendentes de avaliação.<br>• Divulgar um guia rápido com exemplos de comprovantes válidos para diminuir a taxa de rejeição do curso."
    )

    tentativas = 3
    tempo_espera = 2.5

    for tentativa in range(tentativas):
        try:
            completion = client.chat.completions.create(
                messages=[
                    {
                        "role": "system",
                        "content": "Você é um Analista de Dados Acadêmicos Sênior. Escreva análises executivas diretas, profissionais e sem enrolação em português do Brasil."
                    },
                    {
                        "role": "user",
                        "content": prompt,
                    }
                ],
                model="llama-3.1-8b-instant",
                temperature=0.4,
            )

            return {
                'perfil_destino': 'coordenador',
                'referencia_tipo': 'curso',
                'referencia_id': course_id,
                'tipo_insight': 'ia_generativa',
                'titulo': 'Análise Preditiva - IA',
                'descricao': completion.choices[0].message.content.strip(),
                'nivel_alerta': ins_curso.get('nivel_alerta', 'medio'),
                'valor_numerico': valor_num
            }

        except Exception as e:
            erro_str = str(e)
            if "429" in erro_str or "rate_limit" in erro_str:
                time.sleep(tempo_espera)
                tempo_espera *= 1.5
            else:
                print(f"[IA] Erro Groq no curso {course_id}: {e}")
                break

    return None


# ──────────────────────────────────────────────
#  INSIGHT 2: Análise do último período
# ──────────────────────────────────────────────
def processar_ultimo_periodo(client, course_id, titulo_curso, resumo_periodo, numero_semestre):
    prompt = (
        f"Você é um Especialista em Análise Acadêmica. Analise os dados do {numero_semestre}º período do curso '{titulo_curso}':\n"
        f"{resumo_periodo}\n\n"
        f"Com base nesses dados do último período, elabore exatamente 3 insights diagnósticos e acionáveis para o Coordenador:\n"
        f"- Sobre o risco de conclusão: quantos alunos estão em risco de não cumprir a carga horária mínima.\n"
        f"- Sobre a média de horas: se está adequada para o estágio do curso ou se requer intervenção urgente.\n"
        f"- Sobre ação imediata: uma ação concreta e específica que o coordenador deve tomar agora.\n\n"
        f"REGRAS DE FORMATO CRÍTICAS E OBRIGATÓRIAS:\n"
        f"1. NÃO inclua preâmbulos, títulos, markdown (asteriscos, hashtags) ou conclusões.\n"
        f"2. Escreva exatamente 3 itens. Cada um deve iniciar com '• '.\n"
        f"3. Separe os 3 itens exclusivamente com '<br>'. Não use quebras de linha normais.\n"
        f"4. Cada item deve ter entre 12 e 25 palavras. Seja direto e profissional.\n\n"
        f"Exemplo:\n"
        f"• 18 dos 24 alunos do {numero_semestre}º período estão em risco crítico de não atingir a carga mínima exigida.<br>"
        f"• A média de 31% das horas acumuladas indica necessidade urgente de campanhas de envio de certificados.<br>"
        f"• Agendar reunião coletiva com alunos do {numero_semestre}º período até o fim do mês para orientar sobre prazos."
    )

    tentativas = 3
    tempo_espera = 2.5

    for tentativa in range(tentativas):
        try:
            completion = client.chat.completions.create(
                messages=[
                    {
                        "role": "system",
                        "content": "Você é um Analista Acadêmico Sênior especializado em gestão de conclusão de curso. Escreva em português do Brasil de forma direta e executiva."
                    },
                    {
                        "role": "user",
                        "content": prompt,
                    }
                ],
                model="llama-3.1-8b-instant",
                temperature=0.35,
            )

            return {
                'perfil_destino': 'coordenador',
                'referencia_tipo': 'periodo_final',
                'referencia_id': course_id,
                'tipo_insight': 'ia_periodo_final',
                'titulo': f'Análise do {numero_semestre}º Período - IA',
                'descricao': completion.choices[0].message.content.strip(),
                'nivel_alerta': 'alto',
                'valor_numerico': numero_semestre
            }

        except Exception as e:
            erro_str = str(e)
            if "429" in erro_str or "rate_limit" in erro_str:
                time.sleep(tempo_espera)
                tempo_espera *= 1.5
            else:
                print(f"[IA] Erro Groq no insight de período {course_id}: {e}")
                break

    return None


def gerar_e_salvar_insights_ia(lista_insights_cursos):
    api_key = os.environ.get("GROQ_API_KEY")
    if not api_key:
        print("[IA] Aviso: GROQ_API_KEY não encontrada.")
        return []

    client = Groq(api_key=api_key)
    novos_insights_ia = []

    # Filtra os cursos enviados
    insights_curso_pandas = [i for i in lista_insights_cursos if i.get('referencia_tipo') == 'curso']
    if not insights_curso_pandas:
        return []

    # Se veio apenas 1 curso (chamada direta do botão da tela do coordenador)
    if len(insights_curso_pandas) == 1:
        resultado = processar_curso_individual(client, insights_curso_pandas[0])
        if resultado:
            novos_insights_ia.append(resultado)
        return novos_insights_ia

    # Se vierem vários cursos, roda em lote em background usando poucas threads
    print(f"\n[IA] Processando lote de {len(insights_curso_pandas)} cursos em paralelo...")
    with ThreadPoolExecutor(max_workers=2) as executor:
        futuros = {
            executor.submit(processar_curso_individual, client, curso): curso
            for curso in insights_curso_pandas
        }
        for futuro in as_completed(futuros):
            resultado = futuro.result()
            if resultado:
                novos_insights_ia.append(resultado)
                print(f"[IA] Insight concluído para o curso ID: {resultado['referencia_id']}")

    return novos_insights_ia


def salvar_insights_no_postgres(resultados):
    """
    Função dedicada a persistir o insight sob demanda direto no banco
    """
    try:
        import psycopg2
        import psycopg2.extensions

        psycopg2.extensions.register_type(psycopg2.extensions.UNICODE)
        psycopg2.extensions.register_type(psycopg2.extensions.UNICODEARRAY)

        DATABASE_URL = os.environ.get("DATABASE_URL")
        if not DATABASE_URL:
            raise ValueError("[Python] Erro crítico: A variável DATABASE_URL não foi fornecida pelo sistema.")

        conexao = psycopg2.connect(DATABASE_URL)
        conexao.set_client_encoding('UTF8')
        cursor = conexao.cursor()

        query_delete = """
            DELETE FROM insights
            WHERE referencia_tipo = %s AND referencia_id = %s;
        """

        query_insert = """
            INSERT INTO insights (perfil_destino, referencia_tipo, referencia_id, tipo_insight, titulo, descricao, nivel_alerta, valor_numerico, data_geracao)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, NOW());
        """

        for r in resultados:
            desc_texto = str(r['descricao'])
            cursor.execute(query_delete, (r['referencia_tipo'], r['referencia_id']))
            cursor.execute(query_insert, (
                r['perfil_destino'],
                r['referencia_tipo'],
                r['referencia_id'],
                r['tipo_insight'],
                r['titulo'],
                desc_texto,
                r['nivel_alerta'],
                r['valor_numerico']
            ))
        conexao.commit()
        cursor.close()
        conexao.close()
        print("[Python] Sucesso: Dados gravados com sucesso no banco.")

    except Exception as e:
        try:
            erro_msg = str(e)
        except UnicodeDecodeError:
            erro_msg = repr(e)

        print(f"[Python] Erro ao gravar dados no banco: {erro_msg}")


if __name__ == "__main__":
    if sys.stdout.encoding != 'utf-8':
        import io
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
        sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

    # Valores padrão de contingência
    id_arg           = 1
    titulo_arg       = "Curso ID 1"
    descricao_arg    = "Metricas de submissoes pendentes e analise de carga de validacao corrente."
    resumo_periodo   = ""
    numero_semestre  = 1

    if len(sys.argv) > 3:
        try:
            id_arg        = int(sys.argv[1])
            titulo_arg    = sys.argv[2]
            descricao_arg = sys.argv[3]
            print(f"[Python] Executando atualizacao sob demanda para o curso ID: {id_arg}")
        except ValueError:
            print(f"[Python] Aviso: Falha ao converter argumentos. Usando padrões de contingência.")

    # Recebe dados do último período (argumentos 4 e 5, opcionais)
    if len(sys.argv) > 4:
        resumo_periodo = sys.argv[4]
    if len(sys.argv) > 5:
        try:
            numero_semestre = int(sys.argv[5])
        except ValueError:
            numero_semestre = 1

    dados_reais_curso = [{
        "referencia_tipo": "curso",
        "referencia_id": id_arg,
        "titulo": titulo_arg,
        "descricao": descricao_arg,
        "nivel_alerta": "medio",
        "valor_numerico": 0
    }]

    resultados = gerar_e_salvar_insights_ia(dados_reais_curso)

    # Gera também o insight do último período, se os dados foram fornecidos
    if resumo_periodo:
        print(f"[Python] Gerando insight do {numero_semestre}º período...")
        try:
            api_key = os.environ.get("GROQ_API_KEY")
            if api_key:
                client = Groq(api_key=api_key)
                resultado_periodo = processar_ultimo_periodo(
                    client, id_arg, titulo_arg, resumo_periodo, numero_semestre
                )
                if resultado_periodo:
                    resultados.append(resultado_periodo)
                    print(f"[Python] Insight do {numero_semestre}º período gerado com sucesso.")
        except Exception as e:
            print(f"[Python] Erro ao gerar insight do período: {e}")

    if resultados:
        salvar_insights_no_postgres(resultados)
        print("[Python] Fluxo encerrado.")