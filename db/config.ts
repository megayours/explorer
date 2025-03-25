// Load environment variables
import { env } from "process";

export const dbConfig = {
  host: env.DB_HOST || 'localhost',
  port: Number(env.DB_PORT) || 5432,
  database: env.DB_NAME || 'blockchain_db',
  user: env.DB_USER || 'postgres',
  password: env.DB_PASSWORD || '',
}; 