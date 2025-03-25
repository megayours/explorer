import { Block } from "../entities/Block/Block";
import type { RpcUrl } from "../../models/RPC";
import type { Transaction } from "../entities/Transaction/Transaction";

export interface BlockchainOperationResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface IBlockchainAdapter {
  // Basic blockchain operations
  getLatestBlock(): Promise<BlockchainOperationResult<number>>;
  getBlockByNumber(blockNumber: number): Promise<BlockchainOperationResult<any>>;
  
  // RPC management
  addRpcUrl(url: string): Promise<BlockchainOperationResult<RpcUrl>>;
  getRpcUrls(): Promise<BlockchainOperationResult<RpcUrl[]>>;
  
  // Block tracking
  trackBlock(blockNumber: number): Promise<BlockchainOperationResult<Block>>;
} 