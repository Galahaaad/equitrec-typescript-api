import express from 'express';
import { pool } from '../config/database';
import authRoutes from './auth';
import clubRoutes from './clubs';
import cavalierRoutes from './cavaliers';
import fichesNotationController from './fichesNotation';
import epreuveRoutes from './epreuves';
import competitionRoutes from './competitions';
import jugeRoutes from './judges';
import qrRoutes from './qr';
import caracteristiqueRoutes from './caracteristiques';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/clubs', clubRoutes);
router.use('/cavaliers', cavalierRoutes);
router.use('/fiches-notation', fichesNotationController);
router.use('/epreuves', epreuveRoutes);
router.use('/competitions', competitionRoutes);
router.use('/judges', jugeRoutes);
router.use('/qr', qrRoutes);
router.use('/caracteristiques', caracteristiqueRoutes);

router.get('/health', async (req, res) => {
    try {
        const dbResult = await pool.query('SELECT NOW()');

        res.json({
            status: 'OK',
            timestamp: new Date().toISOString(),
            database: 'Connected',
            dbTimestamp: dbResult.rows[0].now,
        });
    } catch (error) {
        res.status(500).json({
            status: 'ERROR',
            timestamp: new Date().toISOString(),
            database: 'Disconnected',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});

router.get('/', (req, res) => {
    res.json({
        message: 'Bienvenue sur l\'API equitrec!',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
    });
});

export default router;
