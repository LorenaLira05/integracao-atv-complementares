/**
 * Script: criar_coord_teste.js
 * 
 * Cria (ou reseta) um coordenador de teste que SEMPRE
 * começa com last_login_at = NULL (ativando tela de primeiro acesso).
 * 
 * Uso:
 *   node src/scripts/criar_coord_teste.js
 */

const bcrypt = require('bcryptjs');
const pool   = require('../config/database');

const COORD_TESTE = {
    nome:  'Coordenador Teste',
    email: 'coord.teste@senac.com',
    senha: '123456',        // Senha que deve ser usada no login
};

async function run() {
    console.log('\n Iniciando configuração do coordenador de teste...\n');

    try {
        const senhaHash = await bcrypt.hash(COORD_TESTE.senha, 10);

        // 1) Verifica se já existe
        const existe = await pool.query(
            `SELECT id FROM users WHERE email = $1`,
            [COORD_TESTE.email]
        );

        let userId;

        if (existe.rows.length > 0) {
            // Usuário já existe → reseta para estado de "primeiro acesso"
            userId = existe.rows[0].id;

            await pool.query(
                `UPDATE users
                 SET password_hash = $1,
                     last_login_at = NULL,
                     updated_at    = NOW()
                 WHERE id = $2`,
                [senhaHash, userId]
            );

            console.log(` Usuário encontrado e RESETADO para primeiro acesso.`);
            console.log(`   ID: ${userId}`);
        } else {
            // Usuário não existe → cria do zero
            const novo = await pool.query(
                `INSERT INTO users (full_name, email, password_hash, status, last_login_at)
                 VALUES ($1, $2, $3, 'active', NULL)
                 RETURNING id`,
                [COORD_TESTE.nome, COORD_TESTE.email, senhaHash]
            );

            userId = novo.rows[0].id;

            // Busca o ID da role 'coordinator'
            const role = await pool.query(
                `SELECT id FROM roles WHERE name = 'coordinator'`
            );

            if (role.rows.length === 0) {
                throw new Error("Role 'coordinator' não encontrada na tabela roles.");
            }

            // Vincula a role
            await pool.query(
                `INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)`,
                [userId, role.rows[0].id]
            );

            console.log(` Coordenador de teste CRIADO com sucesso!`);
            console.log(`   ID: ${userId}`);
        }

        console.log(`\n Dados de acesso:`);
        console.log(`  Nome:  ${COORD_TESTE.nome}`);
        console.log(` Email: ${COORD_TESTE.email}`);
        console.log(` Senha: ${COORD_TESTE.senha}`);
        console.log(` Vínculo com curso: Nenhum (apenas para teste de primeiro acesso)\n`);
        console.log(` Acesse: http://localhost:3001/pages/index.html`);
        console.log(`   Selecione "COORDENADOR", faça login e a tela de primeiro acesso será exibida.\n`);

    } catch (err) {
        console.error('Erro:', err.message);
    } finally {
        await pool.end();
    }
}

run();
