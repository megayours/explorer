import { EvmBlockchainAdapter } from '../adapters/EvmBlockchainAdapter';
import { BlockchainType } from '../../models/Blockchain';
import type { IBlockchainAdapter } from '../adapters/IBlockchainAdapter';
import { MegachainAdapter } from '../adapters/MegachainAdapter';
import type { Blockchain } from '../../models/Blockchain';

export class BlockchainFactory {
  static createAdapter(blockchain: Blockchain): IBlockchainAdapter {
    if (!blockchain.id) {
      throw new Error('Blockchain ID is required');
    }

    switch (blockchain.type) {
      case BlockchainType.EVM:
        return new EvmBlockchainAdapter(blockchain.id, blockchain.chain_id);
      
      case BlockchainType.MEGACHAIN:
        return new MegachainAdapter(blockchain.id, blockchain.chain_id);
      
      default:
        throw new Error(`Unsupported blockchain type: ${blockchain.type}`);
    }
  }
} 