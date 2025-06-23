import dotenv from 'dotenv';

dotenv.config();

interface Config {
    port: number;
    nodeEnv: string;
    database: {
        host: string;
        port: number;
        name: string;
        user: string;
        password: string;
        ssl: boolean;
    };
    jwt: {
        secret: string;
    };
}

const config: Config = {
    port: parseInt(process.env.PORT || '3001'),
    nodeEnv: process.env.NODE_ENV || 'development',
    database: {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        name: process.env.DB_NAME || '',
        user: process.env.DB_USER || '',
        password: process.env.DB_PASSWORD || '',
        ssl: process.env.DB_SSL === 'true',
    },
    jwt: {
        secret: process.env.JWT_SECRET || '',
    },
};

const requiredEnvVars = [
    'DB_NAME',
    'DB_USER',
    'DB_PASSWORD',
    'JWT_SECRET'
];

for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        console.error(`❌ Variable d'environnement manquante: ${envVar}`);
        process.exit(1);
    }
}

export default config;
