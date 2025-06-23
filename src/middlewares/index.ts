import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import config from '../config';

export const setupMiddlewares = (app: express.Application): void => {
    app.use(helmet());

    app.use(cors({
        origin: config.nodeEnv === 'production'
            ? ['https://yourdomain.com'] // prévision : prod
            : ['http://localhost:3000', 'http://localhost:3001'],
        credentials: true,
    }));

    app.use(express.json({ limit: '10mb' }));

    app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    if (config.nodeEnv === 'development') {
        app.use((req, res, next) => {
            console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
            next();
        });
    }
};
