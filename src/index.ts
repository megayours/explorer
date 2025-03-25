import { Elysia } from 'elysia';

import { statusRoutes } from './routes/statusRoutes';
import { blockchainRoutes } from './routes/blockchainRoutes';

const app = new Elysia()
  .use(statusRoutes)
  .use(blockchainRoutes)
  .listen(3000);

console.log(`🦊 Server is running at ${app.server?.hostname}:${app.server?.port}`);

// Handle shutdown
process.on('SIGINT', async () => {
  process.exit(0);
}); 