import { BlockchainType } from '../../../models/Blockchain';
import { Block } from './Block';
import { EvmBlock } from './EvmBlock';
import { MegachainBlock } from './MegachainBlock';

export class BlockFactory {
  static createBlock(blockchainType: BlockchainType, rawData: any, blockchainId: string): Block {
    switch (blockchainType) {
      case BlockchainType.EVM:
        return new EvmBlock(rawData, blockchainId);
      
      case BlockchainType.MEGACHAIN:
        return new MegachainBlock(rawData, blockchainId);
      
      default:
        throw new Error(`Unsupported blockchain type: ${blockchainType}`);
    }
  }
} 