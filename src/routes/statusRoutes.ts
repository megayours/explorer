import { Elysia } from 'elysia';

export const statusRoutes = new Elysia()
  .get('/api/status', () => {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development'
    };
  }); 