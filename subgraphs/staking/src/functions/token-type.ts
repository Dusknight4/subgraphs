import { Address, log } from '@graphprotocol/graph-ts'
import { KashiPair } from '../../generated/Staking/KashiPair'
import { ConstantProductPool } from '../../generated/Staking/ConstantProductPool'
import { ERC20 } from '../../generated/Staking/ERC20'
import { Pair } from '../../generated/Staking/Pair'
import {
  ADDRESS_ZERO,
  KASHI,
  KASHI_MEDIUM_RISK,
  LEGACY,
  SUSHISWAP_LP_TOKEN,
  SUSHI_LP_TOKEN,
  TOKEN,
  TRIDENT,
} from '../constants/index'
import { getTokenSymbol, Name, Symbol } from './token'

export class PairInfo {
  symbol: Symbol
  assets: string[]
}

export function getTokenType(name: string): string {
  if (name == SUSHI_LP_TOKEN) return TRIDENT
  else if (name == SUSHISWAP_LP_TOKEN) return LEGACY
  else if (name.startsWith(KASHI_MEDIUM_RISK)) return KASHI
  else return TOKEN
}

export function getPairInfo(name: Name, tokenAddress: Address): PairInfo {
  const tokenType = getTokenType(name.value)
  if (tokenType === TRIDENT) {
    return createLegacyPairSymbol(tokenAddress)
  } else if (tokenType === LEGACY) {
    return createTridentPairSymbol(tokenAddress)
  } else if (tokenType === KASHI) {
    return createKashiPairSymbol(tokenAddress)
  } else {
    return { symbol: { success: false, value: '???' }, assets: [] }
  }
}

function createLegacyPairSymbol(tokenAddress: Address): PairInfo {
  const contract = Pair.bind(tokenAddress)
  const token0Address = contract.try_token0()
  const token1Address = contract.try_token1()
  if (!token0Address.reverted && !token1Address.reverted) {
    return {
      symbol: getTokensSymbol(token0Address.value, token1Address.value),
      assets: [token0Address.value.toHex(), token1Address.value.toHex()],
    }
  } else {
    return { symbol: { success: false, value: '???' }, assets: [] }
  }
}

function createTridentPairSymbol(tokenAddress: Address): PairInfo {
  const contract = ConstantProductPool.bind(tokenAddress)
  const token0Address = contract.try_token0()
  const token1Address = contract.try_token1()
  if (!token0Address.reverted && !token1Address.reverted) {
    return {
      symbol: getTokensSymbol(token0Address.value, token1Address.value),
      assets: [token0Address.value.toHex(), token1Address.value.toHex()],
    }
  } else {
    return { symbol: { success: false, value: '???' }, assets: [] }
  }
}

function createKashiPairSymbol(tokenAddress: Address): PairInfo {
  const contract = KashiPair.bind(tokenAddress)
  const token0Address = contract.try_asset()
  const token1Address = contract.try_collateral()
  if (
    !token0Address.reverted &&
    token0Address.value != ADDRESS_ZERO &&
    !token1Address.reverted &&
    token1Address.value != ADDRESS_ZERO
  ) {
    return {
      symbol: getTokensSymbol(token0Address.value, token1Address.value),
      assets: [token0Address.value.toHex(), token1Address.value.toHex()],
    }
  } else {
    return { symbol: { success: false, value: '???' }, assets: [] }
  }
}

function getTokensSymbol(token0Address: Address, token1Address: Address): Symbol {
  const token0Contract = ERC20.bind(token0Address)
  const token1Contract = ERC20.bind(token1Address)
  const token0Symbol = getTokenSymbol(token0Contract)
  const token1Symbol = getTokenSymbol(token1Contract)

  return token0Symbol.success && token1Symbol.success
    ? { success: true, value: token0Symbol.value.concat('/').concat(token1Symbol.value) }
    : { success: false, value: '???' }
}
