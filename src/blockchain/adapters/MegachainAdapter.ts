import { sql } from 'bun';
import { Block } from '../entities/Block/Block';
import type { RpcUrl } from '../../models/RPC';
import type { BlockchainOperationResult, IBlockchainAdapter } from './IBlockchainAdapter';
import { BlockFactory } from '../entities/Block/BlockFactory';
import { BlockchainType } from '../../models/Blockchain';
export class MegachainAdapter implements IBlockchainAdapter {
  private blockchainId: number;
  private chainId: string;

  constructor(blockchainId: number, chainId: string) {
    this.blockchainId = blockchainId;
    this.chainId = chainId;
  }

  async getLatestBlock(): Promise<BlockchainOperationResult<number>> {
    try {
      // Megachain-specific implementation for getting latest block
      // This would differ from EVM in real implementation
      return {
        success: true,
        data: Math.floor(Date.now() / 1000) - 100 // Mock different logic
      };
    } catch (error) {
      console.error('Error fetching latest block from Megachain:', error);
      return {
        success: false,
        error: 'Failed to fetch latest block from Megachain'
      };
    }
  }

  async getBlockByNumber(blockNumber: number): Promise<BlockchainOperationResult<any>> {
    try {
      // Megachain-specific block structure and retrieval logic
      return {
        success: true,
        data: {
          blockNumber: blockNumber,
          timeCreated: new Date().toISOString(),
          blockIdentifier: `mega-${blockNumber}-${this.chainId}`,
          // Megachain-specific block properties would be here
        }
      };
    } catch (error) {
      console.error(`Error fetching block ${blockNumber} from Megachain:`, error);
      return {
        success: false,
        error: `Failed to fetch Megachain block ${blockNumber}`
      };
    }
  }

  async addRpcUrl(url: string): Promise<BlockchainOperationResult<RpcUrl>> {
    try {
      console.log(`[MegachainAdapter] Adding RPC URL: ${url} for blockchain ID: ${this.blockchainId}`);
      
      // Check if RPC URL already exists
      const existing = await sql`
        SELECT * FROM rpc_urls 
        WHERE blockchain_id = ${this.blockchainId} AND url = ${url}
      `;
      
      console.log(`[MegachainAdapter] Existing RPC check result:`, existing);
      
      if (existing.length > 0) {
        return {
          success: false,
          error: 'RPC URL already exists for this Megachain'
        };
      }
      
      // Insert new RPC URL
      console.log(`[MegachainAdapter] Inserting new RPC URL`);
      const result = await sql`
        INSERT INTO rpc_urls (blockchain_id, url)
        VALUES (${this.blockchainId}, ${url})
        RETURNING id, blockchain_id, url
      `;
      
      console.log(`[MegachainAdapter] Insert result:`, result);
      
      return {
        success: true,
        data: result[0] as RpcUrl
      };
    } catch (error: any) {
      console.error('[MegachainAdapter] Error adding RPC URL:', error);
      return {
        success: false,
        error: `Failed to add Megachain RPC URL: ${error.message || 'Unknown error'}`
      };
    }
  }

  async getRpcUrls(): Promise<BlockchainOperationResult<RpcUrl[]>> {
    try {
      // Get all RPC URLs for this blockchain
      const rpcUrls = await sql`
        SELECT * FROM rpc_urls
        WHERE blockchain_id = ${this.blockchainId}
        ORDER BY id
      `;
      
      return {
        success: true,
        data: rpcUrls as RpcUrl[]
      };
    } catch (error) {
      console.error('Error fetching RPC URLs for Megachain:', error);
      return {
        success: false,
        error: 'Failed to fetch Megachain RPC URLs'
      };
    }
  }

  async trackBlock(blockNumber: number): Promise<BlockchainOperationResult<Block>> {
    try {
      // Insert new block record with Megachain-specific validation
      if (blockNumber < 0) {
        return {
          success: false,
          error: 'Megachain blocks cannot have negative numbers'
        };
      }
      
      console.log('Tracking block', blockNumber);
      // TODO: Implement the actual RPC call
      // 1. Get RPC URLs for this blockchain
      const rpcUrlsResult = await this.getRpcUrls();
      
      if (!rpcUrlsResult.success || !rpcUrlsResult.data || rpcUrlsResult.data.length === 0) {
        return {
          success: false,
          error: 'No RPC URLs available for this blockchain'
        };
      }
      
      // 2. Try each RPC URL until we get a successful response
      const url = rpcUrlsResult.data[0]?.url; // Use optional chaining
      
      const response = await fetch(`${url}/blocks/${this.chainId}/height/${blockNumber}`);
      const blockData = await response.json();

      console.log('Block data:', blockData);
      
      
      // 4. Create a Block entity from the raw data
      const block = BlockFactory.createBlock(BlockchainType.MEGACHAIN, blockData, this.chainId);
      const isValid = block.isValid();
      console.log('Block is valid:', isValid);

      if (!isValid) {
        return {
          success: false,
          error: 'Block is invalid'
        };
      }

      console.log("Transactions:", block.getTransactions());
      
      const status = await block.save();

      if (!status) {
        return {
          success: false,
          error: 'Failed to save block'
        };
      }
      
      return {
        success: true,
        data: block as unknown as Block
      };
    } catch (error) {
      console.error('Error tracking block for Megachain:', error);
      return {
        success: false,
        error: 'Failed to track Megachain block'
      };
    }
  }
} 