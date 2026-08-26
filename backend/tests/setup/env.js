/**
 * Charge les variables d'environnement de test AVANT que Jest n'installe le
 * framework de test (setupFiles s'exécute plus tôt que setupFilesAfterEnv).
 * Ceci garantit que src/config/database.js utilise bien SQLite en mémoire
 * lorsqu'il est require() pour la première fois par les modèles/l'app.
 */
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../.env.test') });
