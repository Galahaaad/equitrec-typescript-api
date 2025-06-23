import app from './app';
import config from './config';
import { connectDatabase, closeDatabase } from './config/database';

const startServer = async () => {
    try {
        await connectDatabase();

        const server = app.listen(config.port, () => {
            console.log(`🚀 Serveur equitrec démarré sur le port ${config.port}`);
            console.log(`🌍 Environnement: ${config.nodeEnv}`);
            console.log(`📍 URL locale: http://localhost:${config.port}`);
        });

        const gracefulShutdown = async (signal: string) => {
            console.log(`\n📡 Signal ${signal} reçu, arrêt en cours...`);

            server.close(async () => {
                console.log('🔌 Serveur HTTP fermé');
                await closeDatabase();
                process.exit(0);
            });
        };

        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    } catch (error) {
        console.error('❌ Impossible de démarrer le serveur:', error);
        process.exit(1);
    }
};

startServer();
