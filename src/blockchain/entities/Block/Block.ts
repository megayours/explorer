import type { Transaction } from "../Transaction/Transaction";

/**
 * Abstract base class for blockchain blocks
 */
export abstract class Block {
  protected rawData: any;
  public chainId: string;
  public height: number;
  public id?: number;
  public timestamp: number;
  
  constructor(rawData: any, chainId: string) {
    this.rawData = rawData;
    this.chainId = rawData.blockchainId || 0;
    this.height = rawData.height || 0;
    this.chainId = chainId;
    this.height = this.height;
    this.id = rawData.id;
    this.timestamp = rawData.timestamp || 0;
  }
  
  abstract get hash(): string;
  
  /**
   * Returns the raw block data as received from the blockchain
   */
  getRawData(): any {
    return this.rawData;
  }

  abstract isValid(): boolean;

  abstract getTransactions(): Transaction[];

  abstract save(): Promise<boolean>;
}