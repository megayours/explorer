export interface RpcUrl {
  id: number;
  blockchain_id: number;
  url: string;
  created_at?: string;
}

export interface AddRpcUrlDto {
  url: string;
}

export interface RpcUrlResponse {
  success: boolean;
  rpcUrl?: RpcUrl;
  rpcUrls?: RpcUrl[];
  error?: string;
} 