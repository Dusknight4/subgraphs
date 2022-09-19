import { BigInt } from '@graphprotocol/graph-ts'
import { FeeSender } from '../../generated/schema'
import { Transfer as SushiTransferEvent } from '../../generated/sushi/sushi'
import { BIG_INT_ZERO } from '../constants'

export function getOrCreateFeeSender(event: SushiTransferEvent): FeeSender {
  const id = event.params.from.toHex()
  let feeSender = FeeSender.load(id)

  if (feeSender === null) {
    feeSender = new FeeSender(id)
    feeSender.totalFeeSent = BigInt.fromU32(0)
    feeSender.createdAtBlock = event.block.number
    feeSender.createdAtTimestamp = event.block.timestamp
    feeSender.modifiedAtBlock = event.block.number
    feeSender.modifiedAtTimestamp = event.block.timestamp
    feeSender.totalFeeSent = BIG_INT_ZERO
    feeSender.save()
    return feeSender
  }

  return feeSender as FeeSender
}
