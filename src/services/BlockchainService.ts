import { sql } from 'bun';
import blockchainManager from '../blockchain/BlockchainManager';
import type { Blockchain, BlockchainCreateDto, BlockchainResponse } from '../models/Blockchain';
import type { Block } from '../blockchain/entities/Block/Block';
// Add RPC URL interfaces
interface AddRpcUrlDto {
  url: string;
}

interface RpcUrlResponse {
  success: boolean;
  rpcUrl?: {
    id: number;
    blockchain_id: number;
    url: string;
  };
  rpcUrls?: Array<{
    id: number;
    blockchain_id: number;
    url: string;
  }>;
  error?: string;
}

interface BlockResponse {
  success: boolean;
  block?: Block;
  error?: string;
}

export class BlockchainService {
  async create(data: BlockchainCreateDto): Promise<BlockchainResponse> {
    try {
      const existing = await sql`
        SELECT * FROM blockchains 
        WHERE type = ${data.type} AND chain_id = ${data.chain_id}
      `;
      
      console.log("EXISTING (raw):", existing);
      console.log("EXISTING type:", typeof existing);
      if (!existing) {
        console.error("Query returned undefined result");
        return {
          success: false,
          error: 'Database query failed'
        };
      }
      
      if (!Array.isArray(existing)) {
        console.error("Query result is not an array:", existing);
        return {
          success: false,
          error: 'Unexpected database response format'
        };
      }

      if (existing.length > 0) {
        return {
          success: false,
          error: 'Blockchain with this type and chain_id already exists'
        };
      }
      
      // Insert new blockchain
      const result = await sql`
        INSERT INTO blockchains (type, name, chain_id)
        VALUES (${data.type}, ${data.name}, ${data.chain_id})
        RETURNING id, type, name, chain_id
      `;
      
      return {
        success: true,
        blockchain: result[0] as Blockchain
      };
    } catch (error) {
      console.error('Error registering blockchain:', error);
      return {
        success: false,
        error: 'Failed to register blockchain'
      };
    }
  }

  async findAll(): Promise<BlockchainResponse> {
    try {
      const blockchains = await sql`
        SELECT * FROM blockchains ORDER BY id
      `;
      
      return {
        success: true,
        blockchains
      };
    } catch (error) {
      console.error('Error fetching blockchains:', error);
      return {
        success: false,
        error: 'Failed to fetch blockchains'
      };
    }
  }

  async findBlockchainByTypeAndChainId(type: string, chainId: string): Promise<Blockchain | null> {
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

  async addRpcUrl(type: string, chainId: string, url: string): Promise<RpcUrlResponse> {
    try {
      const adapter = await blockchainManager.getAdapter(type, chainId);
      
      if (!adapter) {
        return {
          success: false,
          error: 'Blockchain not found'
        };
      }
      
      const result = await adapter.addRpcUrl(url);
      
      if (!result.success) {
        return {
          success: false,
          error: result.error
        };
      }
      
      return {
        success: true,
        rpcUrl: result.data
      };
    } catch (error) {
      console.error('Error adding RPC URL:', error);
      return {
        success: false,
        error: 'Failed to add RPC URL'
      };
    }
  }

  async getRpcUrls(type: string, chainId: string): Promise<RpcUrlResponse> {
    try {
      const adapter = await blockchainManager.getAdapter(type, chainId);
      
      if (!adapter) {
        return {
          success: false,
          error: 'Blockchain not found'
        };
      }
      
      const result = await adapter.getRpcUrls();
      
      if (!result.success) {
        return {
          success: false,
          error: result.error
        };
      }
      
      return {
        success: true,
        rpcUrls: result.data
      };
    } catch (error) {
      console.error('Error fetching RPC URLs:', error);
      return {
        success: false,
        error: 'Failed to fetch RPC URLs'
      };
    }
  }

  async addBlock(type: string, chainId: string, height: number): Promise<BlockResponse> {
    try {
      const adapter = await blockchainManager.getAdapter(type, chainId);
      
      if (!adapter) {
        return {
          success: false,
          error: 'Blockchain not found'
        };
      }
      
      const result = await adapter.trackBlock(height);

      
      if (!result.success) {
        return {
          success: false,
          error: result.error
        };
      }
      
      return {
        success: true,
        block: result.data
      };
    } catch (error) {
      console.error('Error adding block:', error);
      return {
        success: false,
        error: 'Failed to add block'
      };
    }
  }

  async getBlockByNumber(type: string, chainId: string, height: number): Promise<BlockResponse> {
    try {
      const adapter = await blockchainManager.getAdapter(type, chainId);

      if (!adapter) {
        return {
          success: false,
          error: 'Blockchain not found'
        };
      }

      // TODO Get the block by height
      throw new Error('Not implemented');
    } catch (error) {
      console.error('Error getting block by number:', error);
      return {
        success: false,
        error: 'Failed to get block by number'
      };
    }
  }

  async getLatestBlock(type: string, chainId: string): Promise<{ success: boolean; blockNumber?: number; error?: string }> {
    try {
      const adapter = await blockchainManager.getAdapter(type, chainId);
      
      if (!adapter) {
        return {
          success: false,
          error: 'Blockchain not found'
        };
      }
      
      const result = await adapter.getLatestBlock();
      
      if (!result.success) {
        return {
          success: false,
          error: result.error
        };
      }
      
      return {
        success: true,
        blockNumber: result.data
      };
    } catch (error) {
      console.error('Error getting latest block:', error);
      return {
        success: false,
        error: 'Failed to get latest block'
      };
    }
  }

  async getLatestSyncedBlock(type: string, chainId: string): Promise<{ success: boolean; height: number; error?: string }> {
    try {
      const adapter = await blockchainManager.getAdapter(type, chainId);
      
      if (!adapter) {
        return {
          success: false,
          height: 0,
          error: 'Blockchain not found'
        };
      }
      
      const result = await adapter.getLatestSyncedBlock();
      
      if (!result.success) {
        return {
          success: false,
          height: 0,
          error: result.error
        };
      }
      
      return {
        success: true,
        height: result.data || 0
      };
    } catch (error) {
      console.error('Error getting latest synced block:', error);
      return {
        success: false,
        height: 0,
        error: 'Failed to get latest synced block'
      };
    }
  } 
}

export default new BlockchainService(); 