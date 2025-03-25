import { Elysia, t } from 'elysia';
import blockchainService from '../services/BlockchainService';
import { BlockchainType } from '../models/Blockchain';

// Validation schema for blockchain
const blockchainSchema = t.Object({
  type: t.Enum({ evm: BlockchainType.EVM, megachain: BlockchainType.MEGACHAIN }),
  name: t.String(),
  chain_id: t.String()
});

const rpcUrlSchema = t.Object({
  url: t.String()
});

const blockchainParamsSchema = t.Object({
  type: t.String(),
  chainId: t.String()
});

const blockHeightSchema = t.Object({
  type: t.String(),
  chainId: t.String(),
  height: t.Number()
});

const blockNumberSchema = t.Object({
  height: t.Number()
});

export const blockchainRoutes = new Elysia()
  .post('/api/blockchain', 
    async ({ body }) => {
      return await blockchainService.create(body);
    },
    {
      body: blockchainSchema
    }
  )
  .get('/api/blockchain', async () => {
    return await blockchainService.findAll();
  })
  .post('/api/blockchain/type/:type/id/:chainId/rpc', 
    async ({ body, params }) => {
      return await blockchainService.addRpcUrl(params.type, params.chainId, body.url);
    },
    {
      body: rpcUrlSchema,
      params: blockchainParamsSchema
    }
  )
  .get('/api/blockchain/type/:type/id/:chainId/rpc', async ({ params }) => {
    return await blockchainService.getRpcUrls(params.type, params.chainId);
  },
  {
    params: blockchainParamsSchema
  }
)
.get('api/blockchain/type/:type/id/:chainId/block/:height',
  async ({ params }) => {
    return await blockchainService.getBlockByNumber(params.type, params.chainId, params.height);
  },
  {
    params: blockHeightSchema
  }
)
.post('/api/blockchain/type/:type/id/:chainId/block', 
  async ({ body, params }) => {
    return await blockchainService.addBlock(params.type, params.chainId, body.height);
  },
  {
    body: blockNumberSchema,
    params: blockchainParamsSchema
  }
)
.get('/api/blockchain/type/:type/id/:chainId/latest-block', 
  async ({ params }) => {
    return await blockchainService.getLatestBlock(params.type, params.chainId);
  }, {
    params: blockchainParamsSchema
  }
)
.get('/api/blockchain/type/:type/id/:chainId/latest-synced-block', 
  async ({ params }) => {
    return await blockchainService.getLatestSyncedBlock(params.type, params.chainId);
  }, {
  params: blockchainParamsSchema
}); 
