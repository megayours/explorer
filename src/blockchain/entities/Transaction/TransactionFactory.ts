import { BlockchainType } from '../../../models/Blockchain';
import { MegachainTransaction } from './MegachainTransaction';
import { Transaction } from './Transaction';
export class TransactionFactory {
  static createTransaction(blockchainType: BlockchainType, rawData: any): Transaction {
    switch (blockchainType) {
      case BlockchainType.MEGACHAIN:
        return new MegachainTransaction(rawData);
      default:
        throw new Error(`Unsupported blockchain type for transaction: ${blockchainType}`);
    }
  }
}