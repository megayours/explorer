import { sql } from 'bun';
import { Block } from './Block';
import { MegachainTransaction } from '../Transaction/MegachainTransaction';
import { Witness } from '../Witness/Witness';
import { encryption } from 'postchain-client';
import type { Transaction } from '../Transaction/Transaction';

export class MegachainBlock extends Block {
  public rid: Buffer;
  public prevBlockRid: Buffer;
  public witness: Buffer;
  public transactions: MegachainTransaction[];
  public witnesses: Witness[];

  constructor(rawData: any, chainId: string) {
    super(rawData, chainId);
    console.log('MegachainBlock', rawData);
    
    // Convert hex RID to Buffer if it's a string
    this.rid = typeof rawData.rid === 'string' 
        ? Buffer.from(rawData.rid, 'hex')
        : rawData.rid;
    this.prevBlockRid = typeof rawData.prevBlockRID === 'string'
        ? Buffer.from(rawData.prevBlockRID, 'hex')
        : rawData.prevBlockRID;
    this.witness = typeof rawData.witness === 'string' 
        ? Buffer.from(rawData.witness, 'hex')
        : rawData.witness;
    this.transactions = [];

    for (const tx of rawData.transactions) {
        this.transactions.push(new MegachainTransaction(tx));
    }

    this.witnesses = []
    for (const witness of rawData.witnesses) {
        this.witnesses.push(new Witness(witness));
    }
  }
  
  get number(): number {
    return this.rawData.blockNumber;
  }
  
  
  get hash(): string {
    return this.rawData.blockIdentifier;
  }

  /**
     * Parse the witness data to extract signatures and corresponding public keys
     * Returns structured data without matching to witnesses array
     */
  public parseWitnessData(): Array<{pubKeyData: Buffer, signatureData: Buffer}> | null {
    if (!this.witness) {
        console.log("Block has no witness data");
        return null;
    }

    try {
        const signatureEntries: Array<{pubKeyData: Buffer, signatureData: Buffer}> = [];
        
        // First 4 bytes is the signature count
        const signatureCount = this.witness.readUInt32BE(0);
        let offset = 4; // Start after signature count
        
        // console.log(`Parsing ${signatureCount} signatures`);
        
        for (let i = 0; i < signatureCount; i++) {
            // Read public key size (should be 33 bytes for secp256k1)
            const pubKeySize = this.witness.readUInt32BE(offset);
            offset += 4;
            
            // console.log(`Signature ${i + 1} - Public key size: ${pubKeySize}`);
            
            // Read public key as Buffer
            const pubKeyData = this.witness.slice(offset, offset + pubKeySize);
            offset += pubKeySize;
            
            // Read signature size (should be 64 bytes for secp256k1)
            const signatureSize = this.witness.readUInt32BE(offset);
            offset += 4;

            // console.log(`Signature ${i + 1} - Signature size: ${signatureSize}`);
            
            // Read signature as Buffer
            const signatureData = this.witness.slice(offset, offset + signatureSize);
            offset += signatureSize;
            
            // console.log(`Signature ${i + 1} - Public key: ${pubKeyData.toString('hex')}`);
            // console.log(`Signature ${i + 1} - Signature: ${signatureData.toString('hex')}`);
            
            signatureEntries.push({
                pubKeyData,
                signatureData
            });
        }
        
        return signatureEntries;
    } catch (error) {
        console.error("Error parsing witness data:", error);
        return null;
    }
  }

  isValid(): boolean {
    const signatures = this.parseWitnessData();
    
    if (!signatures || signatures.length === 0) {
        console.log("No valid signatures to verify");
        return false;
    }
    
    // Make sure RID is 32 bytes
    if (this.rid.length !== 32) {
        console.error("Block RID must be 32 bytes, got:", this.rid.length);
        return false;
    }
    
    
    // Verify each signature matches the block RID
    for (const { pubKeyData, signatureData } of signatures) {
        try {
            // Verify signature size requirements
            if (pubKeyData.length !== 33) {
                console.error("Public key must be 33 bytes, got:", pubKeyData.length);
                continue;
            }
            if (signatureData.length !== 64) {
                console.error("Signature must be 64 bytes, got:", signatureData.length);
                continue;
            }
            
            const isValid = encryption.checkDigestSignature(
                this.rid,  // Use Buffer directly
                pubKeyData,
                signatureData
            );
            
            if (!isValid) {
                console.log("❌ Invalid signature found");
                return false;
            }
        } catch (error) {
            console.error("Error verifying signature:", error);
            return false;
        }
    }
    
    // All signatures are valid
    console.log("✅ All signatures are valid");
    return true;
  }

  getTransactions(): Transaction[] {
    return this.transactions;
  }

  async save() {
    try {
      console.log('Saving block', this.chainId, this.height, this.timestamp);
      await sql.begin(async (tx: any) => {
        // Save the block
        await tx`
          INSERT INTO megachain_blocks (blockchain_id, rid, prev_block_rid, height, timestamp, witness)
          VALUES (
            (SELECT id from blockchains where chain_id = ${this.chainId} AND type = 'megachain'), 
            ${this.rid}, 
            ${this.prevBlockRid}, 
            ${this.height}, 
            ${this.timestamp}, 
            ${this.witness}
          )
        `;
        
        // Save witnesses
        for (const witness of this.witnesses) {
          console.log("Witness", witness.publicKey);
          await tx`
            INSERT INTO megachain_witnesses (block_id, pub_key)
            VALUES (
              (SELECT id FROM megachain_blocks WHERE rid = ${this.rid}),
              ${witness.publicKey}
            )
          `;
        }
        
        // Save transactions
        for (const transaction of this.transactions) {
          await tx`
            INSERT INTO megachain_transactions (id, block_id, block_hash)
            VALUES ( 
              ${transaction.id}, 
              (SELECT id FROM megachain_blocks WHERE rid = ${this.rid}),
              ${transaction.hash}
            )
          `;
        }
      });
      
      return true;
    } catch (error) {
      console.error("Error saving block data:", error);
      throw error; // Re-throw to allow caller to handle
    }
  }
  
  // Add more Megachain-specific getters/methods here
} 