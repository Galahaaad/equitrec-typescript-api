import bcrypt from 'bcryptjs';
import { pool } from '../config/database';

const hashExistingPasswords = async () => {
    try {
        console.log('🔄 Mise à jour des mots de passe...');

        const users = await pool.query('SELECT idutilisateur, password FROM utilisateur');

        for (const user of users.rows) {
            const hashedPassword = await bcrypt.hash(user.password, 10);

            await pool.query(
                'UPDATE utilisateur SET password = $1 WHERE idutilisateur = $2',
                [hashedPassword, user.idutilisateur]
            );

            console.log(`✅ User ID ${user.idutilisateur} - Password hashé`);
        }

        console.log('🎉 Tous les mots de passe ont été hashés !');
    } catch (error) {
        console.error('❌ Erreur :', error);
    } finally {
        process.exit(0);
    }
};

if (require.main === module) {
    hashExistingPasswords();
}
