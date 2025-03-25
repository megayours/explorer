import { sql } from 'bun';
import type { Blockchain } from '../models/Blockchain';

export class BlockchainRepository {
  async findByTypeAndChainId(type: string, chainId: string): Promise<Blockchain | null> {
    try {
      const blockchains = await sql`
        SELECT * FROM blockchains 
        WHERE type = ${type} AND chain_id = ${chainId}
      `;
      
      if (blockchains.length === 0) {
        return null;
      }
      
      return blockchains[0] as Blockchain;
    } catch (error) {
      console.error('Error finding blockchain:', error);
      return null;
    }
  }
  
  // Other data access methods...
}

export default new BlockchainRepository(); 