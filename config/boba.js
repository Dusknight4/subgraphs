const NATIVE_ADDRESS = '0xdeaddeaddeaddeaddeaddeaddeaddeaddead0000' // WETH
const BOBA_ADDRESS = '0xa18bf3994c0cc6e3b63ac420308e5383f53120d7'
const WBTC_ADDRESS = '0xdc0486f8bf31DF57a952bcd3c1d3e166e3d9eC8b'
const SUSHI_ADDRESS = '0x5ffccc55c0d2fd6d3ac32c26c020b3267e933f1b'
const USDT_ADDRESS = '0x5de1677344d3cb0d7d465c10b72a8f60699c062d'
const DAI_ADDRESS = '0xf74195bb8a5cf652411867c5c2c5b8c2a402be35'
const USDC_ADDRESS = '0x66a2a913e447d6b4bf33efbec43aaef87890fbbc'
const FRAX_ADDRESS = '0xAb2AF3A98D229b7dAeD7305Bb88aD0BA2c42f9cA'
const UST_ADDRESS = '0xe5ef1407928ebce28a6f1a0759251b7187fea726'
const BUSD_ADDRESS = '0x352f2fdf653a194b42e3311f869237c66309b69e'


module.exports = {
  network: 'boba',
  native: { address: NATIVE_ADDRESS },
  sushi: { address: SUSHI_ADDRESS },
  weth: { address: NATIVE_ADDRESS },
  wbtc: { address: WBTC_ADDRESS },
  legacy: {
    native: { address: NATIVE_ADDRESS },
    whitelistedTokenAddresses: [
      // IMPORTANT! Native should be included here
      NATIVE_ADDRESS,
      BOBA_ADDRESS,
      WBTC_ADDRESS,
      USDT_ADDRESS,
      DAI_ADDRESS,
      USDC_ADDRESS,
      FRAX_ADDRESS,
      UST_ADDRESS,
      SUSHI_ADDRESS,
      BUSD_ADDRESS
    ],
    stableTokenAddresses: [
      USDT_ADDRESS,
      DAI_ADDRESS,
      USDC_ADDRESS,
      FRAX_ADDRESS,
      UST_ADDRESS,
      BUSD_ADDRESS
    ],
    minimumNativeLiquidity: 3,
    factory: {
      address: '0xc35DADB65012eC5796536bD9864eD8773aBc74C4',
      initCodeHash: '0xe18a34eb0e04b04f7a0ac29a6e80748dca96319b42c54d679cb821dca90c6303',
      startBlock: 822561,
    },
  },
  blocks: {
    address: '0xc35DADB65012eC5796536bD9864eD8773aBc74C4',
    startBlock: 822561,
  },
}
