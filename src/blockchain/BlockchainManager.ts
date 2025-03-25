import type { IBlockchainAdapter } from './adapters/IBlockchainAdapter';
import { BlockchainRepository } from '../repositories/BlockchainRepository';
import { BlockchainFactory } from './factory/BlockchainFactory';

export class BlockchainManager {
  private blockchainRepository: BlockchainRepository;
  
  constructor(blockchainRepository: BlockchainRepository) {
    this.blockchainRepository = blockchainRepository;
  }
  
  async getAdapter(type: string, chainId: string): Promise<IBlockchainAdapter | null> {
    try {
      // Get the blockchain from repository
      const blockchain = await this.blockchainRepository.findByTypeAndChainId(type, chainId);
      
      if (!blockchain) {
        return null;
      }
      
      // Create and return the appropriate adapter
      return BlockchainFactory.createAdapter(blockchain);
    } catch (error) {
      console.error('Error creating blockchain adapter:', error);
      return null;
    }
  }
}

// Create a singleton instance with the repository
import blockchainRepository from '../repositories/BlockchainRepository';
export default new BlockchainManager(blockchainRepository); 