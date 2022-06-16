import { Address, BigDecimal, BigInt, ByteArray, Bytes, crypto, ethereum } from '@graphprotocol/graph-ts'

export function getCreate2Address(from: Bytes, salt: Bytes, initCodeHash: Bytes): Bytes {
  return Bytes.fromHexString(
    Bytes.fromByteArray(
      crypto.keccak256(
        Bytes.fromHexString(
          '0xff' + from.toHexString().slice(2) + salt.toHexString().slice(2) + initCodeHash.toHexString().slice(2)
        )
      )
    )
      .toHexString()
      .slice(26)
  ) as Bytes
}

export const NULL_CALL_RESULT_VALUE = '0x0000000000000000000000000000000000000000000000000000000000000001'

export const BIG_INT_ZERO = BigInt.fromI32(0)

export const BIG_DECIMAL_ZERO = BigDecimal.fromString('0')

export const BIG_DECIMAL_ONE = BigDecimal.fromString('1')

export const BIG_INT_ONE = BigInt.fromI32(1)

export const ADDRESS_ZERO = Address.fromString('0x0000000000000000000000000000000000000000')

export const FACTORY_ADDRESS = Address.fromString('{{ legacy.factory.address }}')

export const PRE_BRIDGE_NATIVE_ADDRESS = '{{ native.preBridge.address }}'
export const POST_BRIDGE_NATIVE_ADDRESS = '{{ native.postBridge.address }}'

export const PRE_BRIDGE_WHITELISTED_TOKEN_ADDRESSES: string[] = '{{ whitelistedTokenAddresses.preBridge }}'.split(',')

export const PRE_BRIDGE_STABLE_TOKEN_ADDRESSES: string[] = '{{ stableTokenAddresses.preBridge }}'.split(',')

export const POST_BRIDGE_WHITELISTED_TOKEN_ADDRESSES: string[] = '{{ whitelistedTokenAddresses.postBridge }}'.split(',')

export const POST_BRIDGE_STABLE_TOKEN_ADDRESSES: string[] = '{{ stableTokenAddresses.postBridge }}'.split(',')

export const BRIDGE_SWAP_BLOCK = BigInt.fromString('{{ bridgeSwapBlock }}')

export const PRE_BRIDGE_STABLE_POOL_ADDRESSES: string[] = PRE_BRIDGE_STABLE_TOKEN_ADDRESSES.map<string>((address: string) => {
  const tokens: string[] = [address, PRE_BRIDGE_NATIVE_ADDRESS].sort()
  return getCreate2Address(
    Bytes.fromByteArray(Bytes.fromHexString('{{ legacy.factory.address }}')),
    Bytes.fromByteArray(crypto.keccak256(ByteArray.fromHexString('0x' + tokens[0].slice(2) + tokens[1].slice(2)))),
    Bytes.fromByteArray(Bytes.fromHexString('{{ legacy.factory.initCodeHash }}'))
  ).toHex()
})

export const POST_BRIDGE_STABLE_POOL_ADDRESSES: string[] = POST_BRIDGE_STABLE_TOKEN_ADDRESSES.map<string>((address: string) => {
  const tokens: string[] = [address, POST_BRIDGE_NATIVE_ADDRESS].sort()
  return getCreate2Address(
    Bytes.fromByteArray(Bytes.fromHexString('{{ legacy.factory.address }}')),
    Bytes.fromByteArray(crypto.keccak256(ByteArray.fromHexString('0x' + tokens[0].slice(2) + tokens[1].slice(2)))),
    Bytes.fromByteArray(Bytes.fromHexString('{{ legacy.factory.initCodeHash }}'))
  ).toHex()
})

// Minimum liqudiity threshold in native currency
export const MINIMUM_NATIVE_LIQUIDITY = BigDecimal.fromString('{{ minimumNativeLiquidity }}')

// export const STABLE_POOL_ADDRESSES: string[] = '{{ stablePoolAddresses }}'.split(',')

// minimum liquidity required to count towards tracked volume for pairs with small # of Lps
export const MINIMUM_USD_THRESHOLD_NEW_PAIRS = BigDecimal.fromString(
  '{{ minimum_usd_threshold_new_pairs }}{{^minimum_usd_threshold_new_pairs}}3000{{/minimum_usd_threshold_new_pairs}}'
)
export * from './time'
