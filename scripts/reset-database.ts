import { sql } from "bun";

async function resetDatabase() {
  try {
    console.log("🗑️ Dropping existing tables...");
    
    // Drop tables with CASCADE to handle dependencies
    await sql`DROP TABLE IF EXISTS rpc_urls CASCADE`;
    await sql`DROP TABLE IF EXISTS megachain_transactions CASCADE`;
    await sql`DROP TABLE IF EXISTS megachain_witnesses CASCADE`;
    await sql`DROP TABLE IF EXISTS blocks CASCADE`;
    await sql`DROP TABLE IF EXISTS megachain_blocks CASCADE`;
    await sql`DROP TABLE IF EXISTS blockchains CASCADE`;
    
    console.log("✅ Tables dropped successfully");
    
    // Re-run the database setup
    console.log("🔄 Re-initializing database...");
    await import("../db/setup");
    
    console.log("✨ Database reset and re-initialized successfully!");
  } catch (error) {
    console.error("Error resetting database:", error);
    process.exit(1);
  }
}

// Run the reset function
resetDatabase(); 