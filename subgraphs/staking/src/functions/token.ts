import { Address, BigInt, log } from '@graphprotocol/graph-ts'
import { Token } from '../../generated/schema'
import { ERC20 } from '../../generated/Staking/ERC20'
import { NameBytes32 } from '../../generated/Staking/NameBytes32'
import { SymbolBytes32 } from '../../generated/Staking/SymbolBytes32'
import { getPairInfo, getTokenType } from './token-type'

export function getOrCreateToken(id: string): Token {
  let token = Token.load(id)

  if (token === null) {
    token = new Token(id)
    const contract = ERC20.bind(Address.fromString(id))

    const decimals = getTokenDecimals(contract)
    const name = getTokenName(contract)
    let symbol = getTokenSymbol(contract)

    if (name.success) {
      token.type = getTokenType(name.value)
      const pairInfo = getPairInfo(name, Address.fromString(id))
      if (pairInfo.symbol.success) {
        symbol = pairInfo.symbol
        token.assets = pairInfo.assets
      }
    }

    token.name = name.value
    token.nameSuccess = name.success
    token.symbol = symbol.value
    token.symbolSuccess = symbol.success
    token.decimals = decimals.value
    token.decimalsSuccess = decimals.success
    token.save()
  }

  return token as Token
}

export class Symbol {
  success: boolean
  value: string
}

export function getTokenSymbol(contract: ERC20): Symbol {
  const symbol = contract.try_symbol()

  if (!symbol.reverted) {
    return { success: true, value: symbol.value.toString() }
  }

  const symbolBytes32Contract = SymbolBytes32.bind(contract._address)

  const symbolBytes32 = symbolBytes32Contract.try_symbol()

  if (
    !symbolBytes32.reverted &&
    symbolBytes32.value.toHex() != '0x0000000000000000000000000000000000000000000000000000000000000001'
  ) {
    return { success: true, value: symbolBytes32.value.toString() }
  }

  return { success: false, value: '???' }
}

export class Name {
  success: boolean
  value: string
}

export function getTokenName(contract: ERC20): Name {
  const name = contract.try_name()

  if (!name.reverted) {
    return { success: true, value: name.value.toString() }
  }

  const nameBytes32Contract = NameBytes32.bind(contract._address)

  const nameBytes32 = nameBytes32Contract.try_name()

  if (
    !nameBytes32.reverted &&
    nameBytes32.value.toHex() != '0x0000000000000000000000000000000000000000000000000000000000000001'
  ) {
    return { success: true, value: nameBytes32.value.toString() }
  }

  return { success: false, value: '???' }
}

class Decimal {
  success: boolean
  value: BigInt
}

export function getTokenDecimals(contract: ERC20): Decimal {
  const decimals = contract.try_decimals()

  if (!decimals.reverted) {
    return { success: true, value: BigInt.fromI32(decimals.value as i32) }
  }

  return { success: false, value: BigInt.fromI32(18) }
}
