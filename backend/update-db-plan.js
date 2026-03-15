const { Client } = require('pg');
require('dotenv').config();

// Extrair os dados da string de conexão do Prisma 
const connectionString = process.env.DATABASE_URL;

const run = async () => {
    const client = new Client({
        connectionString: connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('--- Conectado ao Supabase ---');

        console.log('Adicionando coluna "plan" à tabela de usuários...');
        // Verifica se a coluna já existe antes de tentar adicionar para evitar erro
        await client.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                               WHERE table_name='users' AND column_name='plan') THEN
                    ALTER TABLE users ADD COLUMN plan TEXT DEFAULT 'free';
                END IF;
            END
            $$;
        `);

        console.log('✅ Base de dados atualizada com sucesso!');
    } catch (err) {
        console.error('❌ Erro inesperado:', err.message);
    } finally {
        await client.end();
    }
};

run();
