export enum BlockchainType {
  EVM = 'evm',
  MEGACHAIN = 'megachain'
}

export interface Blockchain {
  id?: number;
  type: BlockchainType;
  name: string;
  chain_id: string;
}

export interface BlockchainCreateDto {
  type: BlockchainType;
  name: string;
  chain_id: string;
}

export interface BlockchainResponse {
  success: boolean;
  blockchain?: Blockchain;
  blockchains?: Blockchain[];
  error?: string;
} 