import { Address, BigDecimal, BigInt } from '@graphprotocol/graph-ts'
import { Pair, Token } from '../generated/schema'
import { Factory as FactoryContract } from '../generated/templates/Pair/Factory'
import {
  BIG_DECIMAL_ONE,
  BIG_DECIMAL_ZERO,
  BRIDGE_SWAP_BLOCK,
  FACTORY_ADDRESS,
  MINIMUM_NATIVE_LIQUIDITY,
  NATIVE_ADDRESS,
  POST_BRIDGE_STABLE_POOL_ADDRESSES,
  PRE_BRIDGE_STABLE_POOL_ADDRESSES,
} from './constants'
import { getOrCreateToken } from './functions'

// export const uniswapFactoryContract = FactoryContract.bind(Address.fromString("0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f"))

export const factoryContract = FactoryContract.bind(FACTORY_ADDRESS)

// // Native token price, WETH on mainnet.
// export function getNativeTokenPrice(): TokenPrice {
//   return getOrCreateTokenPrice(NATIVE_ADDRESS)
// }

export function getNativePriceInUSD(blockNumber: BigInt): BigDecimal {
  // 1. Generate list of stable pairs
  // Cont. until getCreate2Address is available we'll just have to use a configured stable pool list instead
  // 2. Loop over the stable pool addresses
  // 3. Fetch stable assets of pairs from database
  // 4. If assets don't exist or threshold is not reached, continue
  // 5. Total the native side of the reserves
  // 6. Add stable "reserve", and stable "price" into array, and incrememnt count.
  // 7. Finally, loop over the count and calculated a weighted price.

  let count = 0

  let weightdPrice = BigDecimal.fromString('0')

  let nativeReserve = BigDecimal.fromString('0')

  let stablePrices: BigDecimal[] = []

  let nativeReserves: BigDecimal[] = []

  let stablePoolAddresses = blockNumber.lt(BRIDGE_SWAP_BLOCK)
    ? PRE_BRIDGE_STABLE_POOL_ADDRESSES
    : POST_BRIDGE_STABLE_POOL_ADDRESSES

  for (let i = 0; i < stablePoolAddresses.length; i++) {
    const address = stablePoolAddresses[i]

    const stablePool = Pair.load(address)
    if (stablePool === null) {
      continue
    }

    if (
      (stablePool.token0 == NATIVE_ADDRESS && stablePool.reserve0.lt(MINIMUM_NATIVE_LIQUIDITY)) ||
      (stablePool.token1 == NATIVE_ADDRESS && stablePool.reserve1.lt(MINIMUM_NATIVE_LIQUIDITY))
    ) {
      continue
    }

    const stableFirst = stablePoolAddresses.includes(stablePool.token0)

    nativeReserve = nativeReserve.plus(!stableFirst ? stablePool.reserve0 : stablePool.reserve1)

    nativeReserves.push(!stableFirst ? stablePool.reserve0 : stablePool.reserve1)

    stablePrices.push(stableFirst ? stablePool.token0Price : stablePool.token1Price)

    count = count + 1
  }

  if (count > 0) {
    for (let j = 0; j < count; j++) {
      const price = stablePrices[j]
      const weight = nativeReserves[j].div(nativeReserve)
      weightdPrice = weightdPrice.plus(price.times(weight))
    }
  }

  return weightdPrice
}

export function findEthPerToken(token: Token): BigDecimal {
  if (token.id == NATIVE_ADDRESS) {
    return BIG_DECIMAL_ONE
  }

  const whitelist = token.whitelistPairs

  let mostReseveEth = BIG_DECIMAL_ZERO
  let currentPrice = BIG_DECIMAL_ZERO

  for (let i = 0; i < whitelist.length; ++i) {
    const pairAddress = whitelist[i]
    const pair = Pair.load(pairAddress)
    if (pair === null) {
      continue // Not created yet
    }

    if (pair.token0 == token.id && pair.reserveETH.gt(MINIMUM_NATIVE_LIQUIDITY) && pair.reserveETH.gt(mostReseveEth)) {
      const token1 = getOrCreateToken(pair.token1)
      if (token1.decimalsSuccess) {
        mostReseveEth = pair.reserveETH
        currentPrice = pair.token1Price.times(token1.derivedETH as BigDecimal)
      }
    }

    if (pair.token1 == token.id && pair.reserveETH.gt(MINIMUM_NATIVE_LIQUIDITY) && pair.reserveETH.gt(mostReseveEth)) {
      const token0 = getOrCreateToken(pair.token0)
      if (token0.decimalsSuccess) {
        mostReseveEth = pair.reserveETH
        currentPrice = pair.token0Price.times(token0.derivedETH as BigDecimal)
      }
    }
  }

  return currentPrice
}
