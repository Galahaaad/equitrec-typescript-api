import express from 'express';
import { setupMiddlewares } from './middlewares';
import routes from './routes';
import config from './config';

const app = express();

setupMiddlewares(app);

app.use('/api/v1', routes);

app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.method} ${req.originalUrl} non trouvée`,
        timestamp: new Date().toISOString(),
    });
});

app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('❌ Erreur globale:', error);

    res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Erreur interne du serveur',
        ...(config.nodeEnv === 'development' && { stack: error.stack }),
    });
});

export default app;
