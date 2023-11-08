import NodeCache from 'node-cache'

const cacheConfig = {
  cacheableMethods: [
    'web3_clientVersion',
    'web3_sha3',
    'net_version',
    'net_peerCount',
    'net_listening',
    'eth_chainId',
    'eth_protocolVersion',
    'eth_syncing',
    'eth_mining',
    'eth_hashrate',
    'eth_gasPrice',
    'eth_accounts',
    'eth_blockNumber',
    'eth_getBalance',
    'eth_getStorageAt',
    'eth_getTransactionCount',
    'eth_getBlockTransactionCountByHash',
    'eth_getBlockTransactionCountByNumber',
    'eth_getUncleCountByBlockHash',
    'eth_getUncleCountByBlockNumber',
    'eth_getCode',
    'eth_sendRawTransaction',
    'eth_call',
    'eth_estimateGas',
    'eth_getBlockByHash',
    'eth_getBlockByNumber',
    'eth_getTransactionByHash',
    'eth_getTransactionByBlockHashAndIndex',
    'eth_getTransactionByBlockNumberAndIndex',
    'eth_getTransactionReceipt',
    'eth_pendingTransactions',
    'eth_getUncleByBlockHashAndIndex',
    'eth_getUncleByBlockNumberAndIndex',
    'eth_getLogs',
    'eth_getWork',
    'eth_submitWork',
    'eth_submitHashrate',
    'eth_getProof',
    'eth_feeHistory',
  ],
  cacheTtl: parseInt(process.env.CACHE_TTL) || 604800,
  staleTtl: parseInt(process.env.STALE_TTL) || 60,
  shortTtl: process.env.SHORT_TTL ? parseInt(process.env.SHORT_TTL): 2,
  cache: new NodeCache({
    // stdTTL: parseInt(process.env.STD_TTL) || 60 * 5, //5 minutes
    checkperiod: parseInt(process.env.CACHE_PERIOD) || 30, // 1 minute
  }),
}

export default cacheConfig
