import { sql } from 'bun';
import type { RpcUrl } from '../../models/RPC';
import type { BlockchainOperationResult, IBlockchainAdapter } from './IBlockchainAdapter';
import { BlockchainType } from '../../models/Blockchain';
import { BlockFactory } from '../entities/Block/BlockFactory';
import type { Block } from '../entities/Block/Block';


export class EvmBlockchainAdapter implements IBlockchainAdapter {
  private blockchainId: number;
  private chainId: string;

  constructor(blockchainId: number, chainId: string) {
    this.blockchainId = blockchainId;
    this.chainId = chainId;
  }

  async getLatestBlock(): Promise<BlockchainOperationResult<number>> {
    try {
      // In a real implementation, this would query an EVM node using the RPC
      // For now, we'll return a mock result
      return {
        success: true,
        data: Math.floor(Date.now() / 1000) // Mock block number
      };
    } catch (error) {
      console.error('Error fetching latest block from EVM chain:', error);
      return {
        success: false,
        error: 'Failed to fetch latest block'
      };
    }
  }

  async getLatestSyncedBlock(): Promise<BlockchainOperationResult<number>> {
    throw new Error('Not implemented');
  }

  async getBlockByNumber(blockNumber: number): Promise<BlockchainOperationResult<any>> {
    try {
      
      throw new Error('Not implemented');
      
      // return {
      //   success: true,
      //   data: block
      // };
    } catch (error) {
      console.error(`Error fetching block ${blockNumber} from EVM chain:`, error);
      return {
        success: false,
        error: `Failed to fetch block ${blockNumber}`
      };
    }
  }

  async addRpcUrl(url: string): Promise<BlockchainOperationResult<RpcUrl>> {
    try {
      // Check if RPC URL already exists
      const existing = await sql`
        SELECT * FROM rpc_urls 
        WHERE blockchain_id = ${this.blockchainId} AND url = ${url}
      `;
      
      if (existing.length > 0) {
        return {
          success: false,
          error: 'RPC URL already exists for this blockchain'
        };
      }
      
      // Insert new RPC URL
      const result = await sql`
        INSERT INTO rpc_urls (blockchain_id, url)
        VALUES (${this.blockchainId}, ${url})
        RETURNING id, blockchain_id, url
      `;
      
      return {
        success: true,
        data: result[0] as RpcUrl
      };
    } catch (error) {
      console.error('Error adding RPC URL for EVM chain:', error);
      return {
        success: false,
        error: 'Failed to add RPC URL'
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
      console.error('Error fetching RPC URLs for EVM chain:', error);
      return {
        success: false,
        error: 'Failed to fetch RPC URLs'
      };
    }
  }

  async trackBlock(blockNumber: number): Promise<BlockchainOperationResult<Block>> {
    try {
      // Insert new block record
      const result = await sql`
        INSERT INTO blocks (blockchain_id, block_number)
        VALUES (${this.blockchainId}, ${blockNumber})
        RETURNING id, blockchain_id, block_number, created_at
      `;
      
      return {
        success: true,
        data: result[0] as Block
      };
    } catch (error) {
      console.error('Error tracking block for EVM chain:', error);
      return {
        success: false,
        error: 'Failed to track block'
      };
    }
  }
} 