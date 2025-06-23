import { Pool, PoolConfig } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const poolConfig: PoolConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
};

export const pool = new Pool(poolConfig);

export const connectDatabase = async (): Promise<void> => {
    try {
        const client = await pool.connect();
        console.log('✅ Connexion à PostgreSQL établie avec succès');

        const result = await client.query('SELECT NOW()');
        console.log(`📅 Timestamp serveur DB: ${result.rows[0].now}`);

        client.release();
    } catch (error) {
        console.error('❌ Erreur de connexion à PostgreSQL:', error);
        process.exit(1);
    }
};

export const closeDatabase = async (): Promise<void> => {
    try {
        await pool.end();
        console.log('🔐 Connexions PostgreSQL fermées proprement');
    } catch (error) {
        console.error('❌ Erreur lors de la fermeture des connexions:', error);
    }
};
