import type { Transaction } from '../Transaction/Transaction';
import { Block } from './Block';
import { sql } from '../../../database/db';

export class EvmBlock extends Block {
  constructor(rawData: any, blockchainId: string) {
    super(rawData, blockchainId);
  }
  
  get number(): number {
    return parseInt(this.rawData.number, 16);
  }
  
  get hash(): string {
    return this.rawData.hash;
  }
  
  get parentHash(): string {
    return this.rawData.parentHash;
  }
  
  get nonce(): string {
    return this.rawData.nonce;
  }
  
  get transactions(): string[] {
    return this.rawData.transactions;
  }

  isValid(): boolean {
    throw new Error('Not implemented'); 
  }

  getTransactions(): Transaction[] {
    throw new Error('Not implemented');
  }
  
  async save(): Promise<boolean> {
    throw new Error('Not implemented');
  }
  
  // Add more EVM-specific getters/methods here
} 