import { Address } from '@graphprotocol/graph-ts'

export const ADDRESS_ZERO = Address.fromString('0x0000000000000000000000000000000000000000')

export const ACCESS_CONTROLS_ADDRESS = Address.fromString('{{ miso.accessControls.address }}')

export * from './roles'