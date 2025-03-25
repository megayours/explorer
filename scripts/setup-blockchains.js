#!/usr/bin/env node

const API_BASE_URL = 'http://localhost:3000/api';

// Define the blockchains to create
const blockchains = [
  {
    type: 'evm',
    name: 'Ethereum',
    chain_id: '1',
    rpcs: [
      'https://eth-mainnet.g.alchemy.com/v2/Qia5gQ6aYsMpkmAkEFfNye0zGRHGn609',
      'https://alpha-orbital-dew.quiknode.pro/bb3a8e9a5f9a804f48d0382a7b47c8b55f3b0828/',
    ]
  },
  {
    type: 'evm',
    name: 'BNB',
    chain_id: '56',
    rpcs: [
      'https://bsc-dataseed.binance.org',
      'https://bsc-dataseed1.defibit.io'
    ]
  },
  {
    type: 'megachain',
    name: 'Megachain',
    chain_id: 'DB90CD3F2D3B725286C8B79C50498AEF8B9521A85E263EC90B0B0BA291ECD4D7',
    rpcs: [
      'https://node0.testnet.chromia.com:7740'
    ]
  }
];

async function createBlockchain(blockchain) {
  try {
    console.log(`Creating blockchain: ${blockchain.name} (${blockchain.type}-${blockchain.chain_id})...`);
    
    const response = await fetch(`${API_BASE_URL}/blockchain`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type: blockchain.type,
        name: blockchain.name,
        chain_id: blockchain.chain_id
      })
    });
    
    const result = await response.json();
    
    if (!result.success) {
      console.error(`Failed to create blockchain ${blockchain.name}:`, result.error);
      return false;
    }
    
    console.log(`✅ Successfully created blockchain: ${blockchain.name}`);
    return true;
  } catch (error) {
    console.error(`Error creating blockchain ${blockchain.name}:`, error.message);
    return false;
  }
}

async function addRpcUrl(blockchain, url) {
  try {
    console.log(`Adding RPC URL for ${blockchain.name}: ${url}...`);
    
    const response = await fetch(`${API_BASE_URL}/blockchain/type/${blockchain.type}/id/${blockchain.chain_id}/rpc`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        url: url
      })
    });
    
    const result = await response.json();
    console.log(`RPC URL addition response:`, result);
    
    if (!result.success) {
      console.error(`Failed to add RPC URL for ${blockchain.name}:`, result.error);
      return false;
    }
    
    console.log(`✅ Successfully added RPC URL for ${blockchain.name}: ${url}`);
    return true;
  } catch (error) {
    console.error(`Error adding RPC URL for ${blockchain.name}:`, error.message, error.stack);
    return false;
  }
}

async function setupBlockchains() {
  console.log('🚀 Starting blockchain setup...');
  
  for (const blockchain of blockchains) {
    // First create the blockchain
    const created = await createBlockchain(blockchain);
    
    // If created successfully or it already exists, add the RPC URLs
    if (created || true) { // Continue even if creation "failed" (might be because it already exists)
      for (const rpcUrl of blockchain.rpcs) {
        await addRpcUrl(blockchain, rpcUrl);
      }
    }
  }
  
  console.log('✨ Blockchain setup completed!');
}

// Run the setup function
setupBlockchains().catch(err => {
  console.error('Setup failed:', err);
  process.exit(1);
}); 