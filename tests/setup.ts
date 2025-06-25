import { Pool } from 'pg';

// Configuration pour la base de données de test
export const testDbConfig = {
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME_TEST || 'equitrec_test',
  password: process.env.DB_PASSWORD || 'password',
  port: parseInt(process.env.DB_PORT || '5432'),
};

export const testPool = new Pool(testDbConfig);

// Configuration globale pour les tests
beforeAll(async () => {
  // Connexion à la base de test
  try {
    await testPool.connect();
    console.log('Connected to test database');
  } catch (error) {
    console.error('Failed to connect to test database:', error);
    throw error;
  }
});

afterAll(async () => {
  // Fermeture de la connexion
  await testPool.end();
  console.log('Test database connection closed');
});

// Helper pour nettoyer les tables entre les tests
export const cleanupTables = async (tables: string[]) => {
  const client = await testPool.connect();
  try {
    await client.query('BEGIN');
    for (const table of tables) {
      await client.query(`DELETE FROM ${table}`);
    }
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};