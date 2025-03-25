import { Elysia, t } from 'elysia';
import { sql } from "bun";


// Initialize database connection
// Bun automatically reads from DATABASE_URL or BUN_DATABASE_URL environment variables
await sql.connect();

// Type validation schema for blockchain
const blockchainSchema = t.Object({
  type: t.Enum({ evm: 'evm', megachain: 'megachain' }),
  name: t.String(),
  chain_id: t.String()
});

const app = new Elysia()
  .get('/api/status', () => {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development'
    };
  })
  .post('/api/blockchains', 
    async ({ body }) => {
      try {
        // Check if blockchain with same type and chain_id already exists
        const existing = await sql`
          SELECT * FROM blockchains 
          WHERE type = ${body.type} AND chain_id = ${body.chain_id}
        `;
        
        if (existing.rows.length > 0) {
          return {
            success: false,
            error: 'Blockchain with this type and chain_id already exists'
          };
        }
        
        // Insert new blockchain
        const result = await sql`
          INSERT INTO blockchains (type, name, chain_id)
          VALUES (${body.type}, ${body.name}, ${body.chain_id})
          RETURNING id, type, name, chain_id
        `;
        
        return {
          success: true,
          blockchain: result.rows[0]
        };
      } catch (error) {
        console.error('Error registering blockchain:', error);
        return {
          success: false,
          error: 'Failed to register blockchain'
        };
      }
    },
    {
      body: blockchainSchema
    }
  )
  .get('/api/blockchains', async () => {
    try {
      const result = await sql`SELECT * FROM blockchains ORDER BY id`;
      return {
        success: true,
        blockchains: result.rows
      };
    } catch (error) {
      console.error('Error fetching blockchains:', error);
      return {
        success: false,
        error: 'Failed to fetch blockchains'
      };
    }
  })
  .listen(3000);

console.log(`🦊 Server is running at ${app.server?.hostname}:${app.server?.port}`);

// Handle shutdown
process.on('SIGINT', async () => {
  await sql.close();
  process.exit(0);
});