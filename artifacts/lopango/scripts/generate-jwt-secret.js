const crypto = require('crypto');

// Générer une clé JWT sécurisée de 64 caractères
const generateJWTSecret = () => {
  return crypto.randomBytes(32).toString('hex');
};

const secret = generateJWTSecret();
console.log('Nouvelle clé JWT générée :');
console.log(`COLLECTOR_JWT_SECRET=${secret}`);
console.log('\nCopiez cette ligne dans votre fichier .env.local');