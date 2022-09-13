const NATIVE_ADDRESS = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
const WBTC_ADDRESS = '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599'
const DAI_ADDRESS = '0x6b175474e89094c44da98b954eedeac495271d0f'
const USDC_ADDRESS = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'
const OHM_ADDRESS = '0x383518188c0c6d7730d91b2c03a03c837814a899'
const USDT_ADDRESS = '0xdac17f958d2ee523a2206206994597c13d831ec7'
const TUSD_ADDRESS = '0x0000000000085d4780b73119b644ae5ecd22b376'
const CDAI_ADDRESS = '0x5d3a536e4d6dbd6114cc1ead35777bab948e3643'
const SUSD_ADDRESS = '0x57ab1ec28d129707052df4df418d58a2d46d5f51'
const LINK_ADDRESS = '0x514910771af9ca656af840dff83e8264ecf986ca'
const YFI_ADDRESS = '0x0bc529c00c6401aef6d220be8c6ea1667f6ad93e'
const XSUSHI_ADDRESS = '0x8798249c2e607446efb7ad49ec89dd1865ff4272'
const USDP_ADDRESS = '0x1456688345527be1f37e9e627da0837d6f08c925'
const BAC_ADDRESS = '0x3449fc1cd036255ba1eb19d65ff4ba2b8903a69a'
const CREAM_ADDRESS = '0x2ba592f78db6436527729929aaf6c908497cb200'
const FXS_ADDRESS = '0x3432b6a60d23ca0dfca7761b7ab56459d9c964d0'
const ALPHA_ADDRESS = '0xa1faa113cbe53436df28ff0aee54275c13b40975'
const PWING_ADDRESS = '0xdb0f18081b505a7de20b18ac41856bcb4ba86a1a'
const UMA_ADDRESS = '0x04fa0d235c4abf4bcf4787af4cf447de572ef828'
const RUNE_ADDRESS = '0x3155ba85d5f96b2d030a4966af206230e46849cb'
const NFTX_ADDRESS = '0x87d73e916d7057945c9bcd8cdd94e42a6f47f776'
const STETH_ADDRESS = '0xdfe66b14d37c77f4e9b180ceb433d1b164f0281d'
const DOUGH_ADDRESS = '0xad32a8e6220741182940c5abf610bde99e737b2d'
const LFBTC_ADDRESS = '0xafce9b78d409bf74980cacf610afb851bf02f257'
const SUSHI_ADDRESS = '0x6b3595068778dd592e39a122f4f5a5cf09c90fe2'
const APE_ADDRESS = '0x4d224452801aced8b2f0aebe155379bb5d594381'
const ANGLE_ADDRESS = '0x31429d1856ad1377a8a0079410b297e1a9e214c2'
const CRV_ADDRESS = '0xd533a949740bb3306d119cc777fa900ba034cd52'
const INV_ADDRESS = '0x41d5d79431a913c4ae7d69a668ecdfe5ff9dfb68'
const PRIMATE_ADDRESS = '0x46e98ffe40e408ba6412beb670507e083c8b95ff'
const MIM_ADDRESS = '0x99d8a9c45b2eca8864373a26d1459e3dff1e17f3'
const FRAX_ADDRESS = '0x853d955acef822db058eb8505911ed77f175b99e'
const UST_ADDRESS = '0xa47c8bf37f92abed4a126bda807a7b7498661acd'

module.exports = {
  network: 'mainnet',
  sushi: { address: '0x6b3595068778dd592e39a122f4f5a5cf09c90fe2' },
  weth: { address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2' },
  wbtc: { address: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599' },
  bentobox: {
    address: '0xf5bce5077908a1b7370b9ae04adc565ebd643966',
    startBlock: 12094175,
  },
  kashi: {
    medium: '0x2cba6ab6574646badc84f0544d05059e57a5dc42',
  },
  blocks: {
    address: '0x6e38A457C722C6011B2dfa06d49240e797844d66',
    startBlock: 49880,
  },
  miso: {
    accessControls: { address: '0xc35dadb65012ec5796536bd9864ed8773abc74c4', startBlock: 14598164 },
    market: { address: '0x281bd3a3f96ae7c96049493a7ba9449df2c5b0fe', startBlock: 14598240 },
  },
  legacy: {
    graft: {
      base: 'QmbrFGyug7rrAVLKwRx7U8VVjKT4vaMVtwPHnypFTGC9G4',
      block: 15526858
    },
    native: { address: NATIVE_ADDRESS },
    whitelistedTokenAddresses: [
      // IMPORTANT! The native address must be included for pricing to start
      NATIVE_ADDRESS,
      WBTC_ADDRESS,
      DAI_ADDRESS,
      USDC_ADDRESS,
      OHM_ADDRESS,
      USDT_ADDRESS,
      TUSD_ADDRESS,
      CDAI_ADDRESS,
      SUSD_ADDRESS,
      LINK_ADDRESS,
      YFI_ADDRESS,
      XSUSHI_ADDRESS,
      USDP_ADDRESS,
      BAC_ADDRESS,
      CREAM_ADDRESS,
      FXS_ADDRESS,
      ALPHA_ADDRESS,
      PWING_ADDRESS,
      UMA_ADDRESS,
      RUNE_ADDRESS,
      NFTX_ADDRESS,
      STETH_ADDRESS,
      DOUGH_ADDRESS,
      LFBTC_ADDRESS,
      SUSHI_ADDRESS,
      APE_ADDRESS,
      ANGLE_ADDRESS,
      CRV_ADDRESS,
      INV_ADDRESS,
      PRIMATE_ADDRESS,
      MIM_ADDRESS,
      FRAX_ADDRESS,
    ],
    stableTokenAddresses: [
      USDC_ADDRESS,
      USDT_ADDRESS,
      DAI_ADDRESS,
      MIM_ADDRESS,
      FRAX_ADDRESS,
      UST_ADDRESS,
      USDP_ADDRESS,
      SUSD_ADDRESS,
      TUSD_ADDRESS,
    ],
    minimumNativeLiquidity: 3,
    minimum_usd_threshold_new_pairs: '3000',
    factory: {
      address: '0xc0aee478e3658e2610c5f7a4a2e1777ce9e4f2ac',
      initCodeHash: '0xe18a34eb0e04b04f7a0ac29a6e80748dca96319b42c54d679cb821dca90c6303',
      startBlock: 10794229,
    },
  },
  sushi: {
    address: '0x6b3595068778dd592e39a122f4f5a5cf09c90fe2',
    startBlock: 10750000,
  },
  xSushi: {
    address: '0x8798249c2e607446efb7ad49ec89dd1865ff4272',
    startBlock: 10801571,
  },
  furo: {
    stream: { address: '0x4ab2fc6e258a0ca7175d05ff10c5cf798a672cae', startBlock: 14857212 },
    vesting: { address: '0x0689640d190b10765f09310fcfe9c670ede4e25b', startBlock: 14857245 },
  },
  auctionMaker: { address: '0x0000000000000000000000000000000000000000', startBlock: 0 },
  staking: { address: '0x0000000000000000000000000000000000000000', startBlock: 0 },
  blocks: {
    address: '0x0000000000000000000000000000000000000000',
    startBlock: 0,
  },
}
