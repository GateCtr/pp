const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function seedAgent() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log("Seeding agent collecteur...");
    
    // Insert a test agent
    const result = await pool.query(`
      INSERT INTO agents_collecteurs (nom, telephone, code_acces, actif)
      VALUES ($1, $2, $3, $4)
      RETURNING id, nom, code_acces
    `, ['Agent Test', '+243810000000', 'AGT-123456', true]);
    
    const agent = result.rows[0];
    
    console.log("Agent créé avec succès:");
    console.log(`- ID: ${agent.id}`);
    console.log(`- Nom: ${agent.nom}`);
    console.log(`- Code d'accès: ${agent.code_acces}`);
    console.log("\nVous pouvez maintenant vous connecter avec le code: AGT-123456");
    
  } catch (error) {
    console.error("Erreur lors de la création de l'agent:", error);
  } finally {
    await pool.end();
  }
}

seedAgent();