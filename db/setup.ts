import { sql } from "bun";

// Initialize database connection
// Bun automatically reads from DATABASE_URL or BUN_DATABASE_URL environment variables
await sql.connect();

async function setupDatabase() {
  try {
    console.log("🔄 Setting up database...");
    console.log("🔄 Creating blockchains table...");
    // Create blockchains table
    await sql`CREATE TABLE IF NOT EXISTS blockchains (
      id SERIAL PRIMARY KEY,
      type TEXT NOT NULL CHECK (type IN ('evm', 'megachain')),
      name TEXT NOT NULL,
      chain_id TEXT NOT NULL,
      UNIQUE (type, chain_id)
    )`;

    console.log("🔄 Creating megachain_blocks table...");
    await sql`CREATE TABLE IF NOT EXISTS megachain_blocks (
      id SERIAL PRIMARY KEY,
      blockchain_id INTEGER NOT NULL,
      rid BYTEA NOT NULL UNIQUE,
      prev_block_rid TEXT NOT NULL,
      height BIGINT NOT NULL,
      timestamp BIGINT NOT NULL,
      witness BYTEA NOT NULL,
      UNIQUE(blockchain_id, height, rid),
      FOREIGN KEY(blockchain_id) REFERENCES blockchains(id) ON DELETE CASCADE
    )`;

    console.log("🔄 Creating megachain_transactions table...");
    await sql`CREATE TABLE IF NOT EXISTS megachain_transactions (
      id SERIAL PRIMARY KEY,
      block_id INTEGER NOT NULL,
      block_hash BYTEA NOT NULL,
      FOREIGN KEY(block_id) REFERENCES megachain_blocks(id) ON DELETE CASCADE
    )`;

    console.log("🔄 Creating megachain_witnesses table...");
    await sql`CREATE TABLE IF NOT EXISTS megachain_witnesses (
      id SERIAL PRIMARY KEY,
      block_id INTEGER NOT NULL,
      pub_key BYTEA NOT NULL,
      FOREIGN KEY(block_id) REFERENCES megachain_blocks(id) ON DELETE CASCADE
    )`;

    console.log("🔄 Creating rpc_urls table...");
    await sql`CREATE TABLE IF NOT EXISTS rpc_urls (
      id SERIAL PRIMARY KEY,
      blockchain_id INTEGER NOT NULL,
      url TEXT NOT NULL,
      FOREIGN KEY (blockchain_id) REFERENCES blockchains(id) ON DELETE CASCADE,
      UNIQUE(blockchain_id, url)
    )`;
    
    console.log("Database setup completed successfully");
  } catch (error) {
    console.error("Error setting up database:", error);
  } finally {
    await sql.close();
  }
}

await setupDatabase(); 