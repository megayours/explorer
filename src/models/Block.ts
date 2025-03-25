export interface Block {
  id?: number;
  blockchain_id: number;
  block_number: number;
  created_at?: string;
}

export interface AddBlockDto {
  block_number: number;
}

export interface BlockResponse {
  success: boolean;
  block?: Block;
  error?: string;
} 