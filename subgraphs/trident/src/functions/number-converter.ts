import { BigDecimal, BigInt } from '@graphprotocol/graph-ts'
import { Token } from '../../generated/schema'
import { BIG_DECIMAL_ONE, BIG_DECIMAL_ZERO, BIG_INT_ONE, BIG_INT_TWO, BIG_INT_ZERO, Q192 } from '../constants'

export function convertTokenToDecimal(tokenAmount: BigInt, exchangeDecimals: BigInt): BigDecimal {
  if (exchangeDecimals == BigInt.fromI32(0)) {
    return tokenAmount.toBigDecimal()
  }
  return tokenAmount.toBigDecimal().div(exponentToBigDecimal(exchangeDecimals))
}

function exponentToBigDecimal(decimals: BigInt): BigDecimal {
  let bd = BigDecimal.fromString('1')
  for (let i = BigInt.fromI32(0); i.lt(decimals as BigInt); i = i.plus(BigInt.fromI32(1))) {
    bd = bd.times(BigDecimal.fromString('10'))
  }
  return bd
}


export function safeDiv(amount0: BigDecimal, amount1: BigDecimal): BigDecimal {
  if (amount1.equals(BIG_DECIMAL_ZERO)) {
    return BIG_DECIMAL_ZERO
  } else {
    return amount0.div(amount1)
  }
}


export function sqrtPriceX96ToTokenPrices(sqrtPriceX96: BigInt, token0: Token, token1: Token): BigDecimal[] {
  let num = sqrtPriceX96.times(sqrtPriceX96).toBigDecimal()
  let denom = BigDecimal.fromString(Q192.toString())
  let price1 = num
    .div(denom)
    .times(exponentToBigDecimal(token0.decimals))
    .div(exponentToBigDecimal(token1.decimals))

  let price0 = safeDiv(BigDecimal.fromString('1'), price1)
  return [price0, price1]
}



export function bigDecimalExponated(value: BigDecimal, power: BigInt): BigDecimal {
  if (power.equals(BIG_INT_ZERO)) {
    return BIG_DECIMAL_ONE
  }

  let negativePower = power.lt(BIG_INT_ZERO)
  let evenPower = BIG_DECIMAL_ZERO.plus(value)
  let powerAbs = power.abs()
  let oddPower = BIG_DECIMAL_ONE

  while (powerAbs.lt(BIG_INT_ONE)) {
    if (powerAbs.mod(BIG_INT_TWO) == BIG_INT_ZERO) {
      evenPower = evenPower.times(evenPower)
      powerAbs = powerAbs.div(BIG_INT_TWO)
    } else {
      oddPower = evenPower.times(oddPower)
      evenPower = evenPower.times(evenPower)
      powerAbs = powerAbs.minus(BIG_INT_ONE).div(BIG_INT_TWO)
    }
  }

  let result = evenPower.times(oddPower)

  if (negativePower) {
    result = safeDiv(BIG_DECIMAL_ONE, result)
  }

  return result
}
