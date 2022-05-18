import { ADDRESS_ZERO, NATIVE_ADDRESS, STABLE_POOL_ADDRESSES } from '../constants'
import {
  Approval,
  Burn as BurnEvent,
  Mint as MintEvent,
  Swap as SwapEvent,
  Sync,
  Transfer,
} from '../../generated/templates/ConstantProductPool/ConstantProductPool'
import { BigDecimal, BigInt, log } from '@graphprotocol/graph-ts'
import { Burn, Mint, Swap, TokenPrice, WhitelistedToken, TokenPricePool } from '../../generated/schema'
import {
  createWhitelistedPool,
  createWhitelistedToken,
  getConstantProductPool,
  getConstantProductPoolAsset,
  getConstantProductPoolKpi,
  getNativeTokenPrice,
  getOrCreateConstantProductPoolFactory,
  getOrCreateLiquidityPosition,
  getOrCreateToken,
  getOrCreateTokenPrice,
  getOrCreateTransaction,
  getOrCreateUser,
  getRebase,
  getTokenKpi,
  getTokenPrice,
  toAmount,
  updatePoolDaySnapshot,
  updatePoolHourSnapshot,
  updateTokenDaySnapshot,
  updateTokenPrice,
} from '../functions'

import { CONSTANT_PRODUCT_PREFIX } from '../constants/id'

export function onMint(event: MintEvent): void {
  // log.debug('[ConstantProduct] onMint...', [])

  const recipient = event.params.recipient.toHex()
  getOrCreateUser(recipient)

  const factory = getOrCreateConstantProductPoolFactory()
  factory.transactionCount = factory.transactionCount.plus(BigInt.fromI32(1))

  const poolAddress = event.address.toHex()

  const poolKpi = getConstantProductPoolKpi(poolAddress)

  const asset0 = getConstantProductPoolAsset(poolAddress.concat(':asset:0'))

  const asset1 = getConstantProductPoolAsset(poolAddress.concat(':asset:1'))

  const token0 = getOrCreateToken(asset0.token)

  const amount0 = event.params.amount0.divDecimal(
    BigInt.fromI32(10)
      .pow(token0.decimals.toI32() as u8)
      .toBigDecimal()
  )

  const token0Kpi = getTokenKpi(asset0.token)
  token0Kpi.liquidity = token0Kpi.liquidity.plus(amount0)
  token0Kpi.transactionCount = token0Kpi.transactionCount.plus(BigInt.fromI32(1))

  const token1 = getOrCreateToken(asset1.token)

  const amount1 = event.params.amount1.divDecimal(
    BigInt.fromI32(10)
      .pow(token1.decimals.toI32() as u8)
      .toBigDecimal()
  )

  const token1Kpi = getTokenKpi(asset1.token)
  token1Kpi.liquidity = token1Kpi.liquidity.plus(amount1)
  token1Kpi.transactionCount = token1Kpi.transactionCount.plus(BigInt.fromI32(1))

  const transaction = getOrCreateTransaction(event)

  const mint = new Mint(createMintId(transaction.id, poolKpi.transactionCount))

  mint.transaction = transaction.id
  mint.pool = poolAddress
  mint.token0 = asset0.token
  mint.token1 = asset1.token
  mint.amount0 = amount0
  mint.amount1 = amount1
  mint.recipient = event.params.recipient
  mint.sender = event.params.sender
  mint.origin = event.transaction.from

  mint.logIndex = event.logIndex

  poolKpi.transactionCount = poolKpi.transactionCount.plus(BigInt.fromI32(1))
  poolKpi.save()

  factory.save()
  token0.save()
  token1.save()
  token0Kpi.save()
  token1Kpi.save()
  mint.save()

  getOrCreateLiquidityPosition(poolAddress.concat(':').concat(recipient))

  const nativePrice = getNativeTokenPrice()
  updatePoolDaySnapshot(event.block.timestamp, poolKpi)
  updatePoolHourSnapshot(event.block.timestamp, poolKpi)
  updateTokenDaySnapshot(event.block.timestamp, token0, token0Kpi, nativePrice)
  updateTokenDaySnapshot(event.block.timestamp, token1, token1Kpi, nativePrice)
}

export function onBurn(event: BurnEvent): void {
  // log.debug('[ConstantProduct] onBurn...', [])

  const sender = event.params.sender.toHex()
  getOrCreateUser(sender)

  const factory = getOrCreateConstantProductPoolFactory()
  factory.transactionCount = factory.transactionCount.plus(BigInt.fromI32(1))

  const poolAddress = event.address.toHex()
  const poolKpi = getConstantProductPoolKpi(poolAddress)
  const asset0 = getConstantProductPoolAsset(poolAddress.concat(':asset:0'))
  const asset1 = getConstantProductPoolAsset(poolAddress.concat(':asset:1'))

  const token0 = getOrCreateToken(asset0.token)
  const amount0 = event.params.amount0.divDecimal(
    BigInt.fromI32(10)
      .pow(token0.decimals.toI32() as u8)
      .toBigDecimal()
  )

  const token0Kpi = getTokenKpi(asset0.token)
  token0Kpi.liquidity = token0Kpi.liquidity.minus(amount0)
  token0Kpi.transactionCount = token0Kpi.transactionCount.plus(BigInt.fromI32(1))

  const token1 = getOrCreateToken(asset1.token)

  const amount1 = event.params.amount1.divDecimal(
    BigInt.fromI32(10)
      .pow(token1.decimals.toI32() as u8)
      .toBigDecimal()
  )

  const token1Kpi = getTokenKpi(asset1.token)
  token1Kpi.liquidity = token1Kpi.liquidity.minus(amount1)
  token1Kpi.transactionCount = token1Kpi.transactionCount.plus(BigInt.fromI32(1))

  const transaction = getOrCreateTransaction(event)

  const burn = new Burn(createBurnId(transaction.id, poolKpi.transactionCount))

  burn.transaction = transaction.id
  burn.pool = poolAddress
  burn.token0 = asset0.token
  burn.token1 = asset1.token
  burn.amount0 = amount0
  burn.amount1 = amount1
  burn.recipient = event.params.recipient
  burn.sender = event.params.sender
  burn.origin = event.transaction.from
  burn.logIndex = event.logIndex

  poolKpi.transactionCount = poolKpi.transactionCount.plus(BigInt.fromI32(1))
  poolKpi.save()

  factory.save()
  token0.save()
  token1.save()
  token0Kpi.save()
  token1Kpi.save()
  burn.save()

  getOrCreateLiquidityPosition(poolAddress.concat(':').concat(sender))

  const nativePrice = getNativeTokenPrice()
  updatePoolDaySnapshot(event.block.timestamp, poolKpi)
  updatePoolHourSnapshot(event.block.timestamp, poolKpi)
  updateTokenDaySnapshot(event.block.timestamp, token0, token0Kpi, nativePrice)
  updateTokenDaySnapshot(event.block.timestamp, token1, token1Kpi, nativePrice)
}

export function onSync(event: Sync): void {
  // log.debug('[ConstantProduct] onSync...... event.reserve0: {} event.reserve1: {}', [
  //   event.params.reserve0.toString(),
  //   event.params.reserve1.toString(),
  // ])

  const poolAddress = event.address.toHex()
  const poolKpi = getConstantProductPoolKpi(poolAddress)

  const asset0 = getConstantProductPoolAsset(poolAddress.concat(':asset:0'))
  const asset1 = getConstantProductPoolAsset(poolAddress.concat(':asset:1'))

  const token0 = getOrCreateToken(asset0.token)
  const token1 = getOrCreateToken(asset1.token)

  const token0Kpi = getTokenKpi(asset0.token)
  const token1Kpi = getTokenKpi(asset1.token)

  // reset liquidity amounts
  token0Kpi.liquidity = token0Kpi.liquidity.minus(asset0.reserve)
  token1Kpi.liquidity = token1Kpi.liquidity.minus(asset1.reserve)

  const rebase0 = getRebase(asset0.token)
  const rebase1 = getRebase(asset1.token)

  const reserve0 = toAmount(event.params.reserve0, rebase0).div(
    BigInt.fromI32(10)
      .pow(token0.decimals.toI32() as u8)
      .toBigDecimal()
  )
  const reserve1 = toAmount(event.params.reserve1, rebase1).div(
    BigInt.fromI32(10)
      .pow(token1.decimals.toI32() as u8)
      .toBigDecimal()
  )

  asset0.reserve = reserve0
  asset1.reserve = reserve1

  if (asset1.reserve.notEqual(BigDecimal.fromString('0'))) {
    asset0.price = asset0.reserve.div(asset1.reserve)
  }

  if (asset0.reserve.notEqual(BigDecimal.fromString('0'))) {
    asset1.price = asset1.reserve.div(asset0.reserve)
  }

  asset0.save()
  asset1.save()

  let nativePrice: TokenPrice
  let token0Price: TokenPrice
  let token1Price: TokenPrice

  // const assets = [asset0, asset1]

  // for (let i = 0; i < assets.length; i++) {
  //   const whitelisted = WhitelistedToken.load(assets[i].token)
  //   if (whitelisted && assets[Math.abs(i - 1) as i32].toHex() !== NATIVE_ADDRESS) {
  //     const address = assets[Math.abs(i - 1) as i32].token

  //     // Check if a relation is already defined between the token to price and pool
  //     if (TokenPricePool.load(address.concat(':').concat(poolAddress)) !== null) {
  //       continue
  //     }

  //     const tokenPrice = getOrCreateTokenPrice(address)

  //     const whitelistedPool = createWhitelistedPool(
  //       tokenPrice.token.concat(':').concat(tokenPrice.whitelistedPoolCount.toString())
  //     )
  //     whitelistedPool.pool = poolAddress
  //     whitelistedPool.price = tokenPrice.id
  //     whitelistedPool.save()

  //     tokenPrice.whitelistedPoolCount = tokenPrice.whitelistedPoolCount.plus(BigInt.fromI32(1))
  //     tokenPrice.save()

  //     createWhitelistedToken(address)

  //     // Define relationship so we don't add it again here
  //     const tokenPricePool = new TokenPricePool(tokenPrice.token.concat(':').concat(poolAddress))
  //     tokenPricePool.save()
  //   }
  // }

  // If the pool is one in which we want to update the native price
  if (STABLE_POOL_ADDRESSES.includes(poolAddress)) {
    if (token0.id == NATIVE_ADDRESS) {
      token0Price = updateTokenPrice(token0)
      token1Price = updateTokenPrice(token1)
      nativePrice = token0Price
    } else {
      token1Price = updateTokenPrice(token1)
      token0Price = updateTokenPrice(token0)
      nativePrice = token1Price
    }
  } else {
    // Avoid making this call unless neccasary
    nativePrice = getOrCreateTokenPrice(NATIVE_ADDRESS)
    token0Price = updateTokenPrice(token0)
    token1Price = updateTokenPrice(token1)
  }

  poolKpi.liquidityNative = asset0.reserve
    .times(token0Price.derivedNative)
    .plus(asset1.reserve.times(token1Price.derivedNative))
  poolKpi.liquidityUSD = poolKpi.liquidityNative.times(nativePrice.derivedUSD)
  poolKpi.save()

  token0Kpi.liquidity = token0Kpi.liquidity.plus(reserve0)
  token0Kpi.liquidityNative = token0Kpi.liquidityNative.plus(reserve0.times(token0Price.derivedNative))
  token0Kpi.liquidityUSD = token0Kpi.liquidityUSD.plus(token0Kpi.liquidityNative.times(nativePrice.derivedUSD))
  token0Kpi.save()

  token1Kpi.liquidity = token1Kpi.liquidity.plus(reserve1)
  token1Kpi.liquidityNative = token1Kpi.liquidityNative.plus(reserve1.times(token1Price.derivedNative))
  token1Kpi.liquidityUSD = token1Kpi.liquidityUSD.plus(token1Kpi.liquidityNative.times(nativePrice.derivedUSD))
  token1Kpi.save()
}

export function onSwap(event: SwapEvent): void {
  // log.debug('[ConstantProduct] onSwap...', [])

  const tokenInAddress = event.params.tokenIn.toHex()
  const tokenOutAddress = event.params.tokenOut.toHex()
  const factory = getOrCreateConstantProductPoolFactory()
  factory.transactionCount = factory.transactionCount.plus(BigInt.fromI32(1))
  factory.save()

  const poolAddress = event.address.toHex()

  const pool = getConstantProductPool(poolAddress)
  const tokenIn = getOrCreateToken(tokenInAddress)
  const tokenInPrice = getTokenPrice(tokenInAddress)

  const tokenInKpi = getTokenKpi(tokenInAddress)
  tokenInKpi.transactionCount = tokenInKpi.transactionCount.plus(BigInt.fromI32(1))
  tokenInKpi.save()

  const tokenOut = getOrCreateToken(tokenOutAddress)
  const tokenOutPrice = getTokenPrice(tokenOutAddress)

  const tokenOutKpi = getTokenKpi(tokenOutAddress)
  tokenOutKpi.transactionCount = tokenOutKpi.transactionCount.plus(BigInt.fromI32(1))
  tokenOutKpi.save()

  const transaction = getOrCreateTransaction(event)

  const poolKpi = getConstantProductPoolKpi(poolAddress)

  const amountIn = event.params.amountIn.divDecimal(
    BigInt.fromI32(10)
      .pow(tokenIn.decimals.toI32() as u8)
      .toBigDecimal()
  )

  const amountOut = event.params.amountOut.divDecimal(
    BigInt.fromI32(10)
      .pow(tokenOut.decimals.toI32() as u8)
      .toBigDecimal()
  )

  const swap = new Swap(createSwapId(transaction.id, poolKpi.transactionCount))
  swap.transaction = transaction.id
  swap.pool = poolAddress
  swap.tokenIn = tokenIn.id
  swap.tokenOut = tokenOut.id
  swap.amountIn = amountIn
  swap.amountOut = amountOut
  swap.recipient = event.params.recipient
  swap.origin = event.transaction.from
  swap.logIndex = event.logIndex
  swap.save()

  const volumeNative = amountIn.times(tokenInPrice.derivedNative).plus(amountOut.times(tokenOutPrice.derivedNative))
  const volumeUSD = amountIn.times(tokenInPrice.derivedUSD).plus(amountOut.times(tokenOutPrice.derivedUSD))

  const feesNative = volumeNative.times(pool.swapFee.divDecimal(BigDecimal.fromString('10000')))
  const feesUSD = volumeUSD.times(pool.swapFee.divDecimal(BigDecimal.fromString('10000')))

  poolKpi.volumeNative = poolKpi.volumeNative.plus(volumeNative)
  poolKpi.volumeUSD = poolKpi.volumeUSD.plus(volumeUSD)
  poolKpi.feesNative = poolKpi.feesNative.plus(feesNative)
  poolKpi.feesUSD = poolKpi.feesUSD.plus(feesUSD)
  poolKpi.transactionCount = poolKpi.transactionCount.plus(BigInt.fromI32(1))
  poolKpi.save()

  const nativePrice = getNativeTokenPrice()
  const poolDaySnapshot = updatePoolDaySnapshot(event.block.timestamp, poolKpi)
  const poolHourSnapshot = updatePoolHourSnapshot(event.block.timestamp, poolKpi)

  poolDaySnapshot.volumeNative = poolDaySnapshot.volumeNative.plus(volumeNative)
  poolDaySnapshot.volumeUSD = poolDaySnapshot.volumeUSD.plus(volumeUSD)
  poolDaySnapshot.feesNative = poolDaySnapshot.feesNative.plus(feesNative)
  poolDaySnapshot.feesUSD = poolDaySnapshot.feesUSD.plus(feesUSD)
  poolDaySnapshot.save()

  poolHourSnapshot.volumeNative = poolHourSnapshot.volumeNative.plus(volumeNative)
  poolHourSnapshot.volumeUSD = poolHourSnapshot.volumeUSD.plus(volumeUSD)
  poolHourSnapshot.feesNative = poolHourSnapshot.feesNative.plus(feesNative)
  poolHourSnapshot.feesUSD = poolHourSnapshot.feesUSD.plus(feesUSD)
  poolHourSnapshot.save()

  updateTokenDaySnapshot(event.block.timestamp, tokenIn, tokenInKpi, nativePrice)
  updateTokenDaySnapshot(event.block.timestamp, tokenOut, tokenOutKpi, nativePrice)
}

export function onApproval(event: Approval): void {
  // log.debug('[ConstantProduct] onApproval...', [])
}

export function onTransfer(event: Transfer): void {
  // ignore initial transfers for first adds
  if (event.params.recipient == ADDRESS_ZERO && event.params.amount.equals(BigInt.fromI32(1000))) {
    log.debug('Initial transfer, ignore...', [])
    return
  }

  const amount = event.params.amount.divDecimal(BigDecimal.fromString('1e18'))
  const sender = event.params.sender.toHex()
  const recipient = event.params.recipient.toHex()

  getOrCreateUser(sender)
  getOrCreateUser(recipient)

  const poolAddress = event.address.toHex()
  const poolKpi = getConstantProductPoolKpi(poolAddress)

  const liquidity = event.params.amount.divDecimal(BigDecimal.fromString('1e18'))

  // If sender is black hole, we're mintin'
  if (event.params.sender == ADDRESS_ZERO) {
    poolKpi.liquidity = poolKpi.liquidity.plus(liquidity)
  }

  // If recipient is black hole we're burnin'
  if (event.params.recipient == ADDRESS_ZERO) {
    poolKpi.liquidity = poolKpi.liquidity.minus(liquidity)
  }

  poolKpi.save()

  // Increment factory count
  const factory = getOrCreateConstantProductPoolFactory()
  factory.transactionCount = factory.transactionCount.plus(BigInt.fromI32(1))
  factory.save()

  const senderLiquidityPosition = getOrCreateLiquidityPosition(poolAddress.concat(':').concat(sender))
  const recipientLiquidityPosition = getOrCreateLiquidityPosition(poolAddress.concat(':').concat(recipient))

  if (event.params.sender != ADDRESS_ZERO && sender != poolAddress) {
    senderLiquidityPosition.balance = senderLiquidityPosition.balance.minus(amount)
    senderLiquidityPosition.save()
  }

  if (event.params.recipient != ADDRESS_ZERO && recipient != poolAddress) {
    recipientLiquidityPosition.balance = recipientLiquidityPosition.balance.plus(amount)
    recipientLiquidityPosition.save()
  }
}

export function createMintId(transactionId: string, poolKpiTransactionCount: BigInt): string {
  return createId(transactionId, poolKpiTransactionCount)
}

export function createBurnId(transactionId: string, poolKpiTransactionCount: BigInt): string {
  return createId(transactionId, poolKpiTransactionCount)
}

export function createSwapId(transactionId: string, poolKpiTransactionCount: BigInt): string {
  return createId(transactionId, poolKpiTransactionCount)
}

function createId(transactionId: string, poolKpiTransactionCount: BigInt): string {
  return CONSTANT_PRODUCT_PREFIX + transactionId + ':' + poolKpiTransactionCount.toString()
}
