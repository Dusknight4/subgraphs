import { Address, BigInt, Bytes } from '@graphprotocol/graph-ts'
import { assert, clearStore, test } from 'matchstick-as/assembly/index'
import { Started as AuctionCreatedEvent } from '../generated/AuctionMaker/AuctionMaker'
import { BID_TOKEN_ADDRESS } from '../src/constants'
import { onAuctionCreated, onBid } from '../src/mappings/auction-maker'
import { createAuctionCreatedEvent, createBidEvent, createTokenMock } from './mocks'

const ALICE = Address.fromString('0x00000000000000000000000000000000000a71ce')
const BOB = Address.fromString('0x0000000000000000000000000000000000000b0b')
const REWARD_TOKEN = Address.fromString('0x0000000000000000000000000000000000000001')
const AMOUNT = BigInt.fromString('1337')
const REWARD_AMOUNT = BigInt.fromString('420')
let auctionCreationEvent: AuctionCreatedEvent
const AUCTION_ID = REWARD_TOKEN.toHex().concat(':0')

function setup(): void {
  createTokenMock(REWARD_TOKEN.toHex(), BigInt.fromString('18'), 'Wrapped Ether', 'WETH')
  createTokenMock(BID_TOKEN_ADDRESS.toHex(), BigInt.fromString('18'), 'Sushi Token', 'SUSHI')
  auctionCreationEvent = createAuctionCreatedEvent(REWARD_TOKEN, ALICE, AMOUNT, REWARD_AMOUNT)
  onAuctionCreated(auctionCreationEvent)
}

function cleanup(): void {
  clearStore()
}

test('Bid is created on auction creation event', () => {
  setup()
  const bidId = auctionCreationEvent.transaction.hash.toHex()

  assert.entityCount('Bid', 1)
  assert.fieldEquals('Bid', bidId, 'id', bidId)
  assert.fieldEquals('Bid', bidId, 'user', ALICE.toHex())
  assert.fieldEquals('Bid', bidId, 'auction', AUCTION_ID)
  assert.fieldEquals('Bid', bidId, 'amount', AMOUNT.toString())
  assert.fieldEquals('Bid', bidId, 'rewardToken', REWARD_TOKEN.toHex())
  assert.fieldEquals('Bid', bidId, 'bidToken', BID_TOKEN_ADDRESS.toHex())
  assert.fieldEquals('Bid', bidId, 'txHash', auctionCreationEvent.transaction.hash.toHex())
  assert.fieldEquals('Bid', bidId, 'createdAtBlock', auctionCreationEvent.block.number.toString())
  assert.fieldEquals('Bid', bidId, 'createdAtTimestamp', auctionCreationEvent.block.timestamp.toString())
  cleanup()
})

test('Bid is created on bid event', () => {
  setup()
  let bidEvent = createBidEvent(REWARD_TOKEN, BOB, AMOUNT)
  let bidId = '0x0000000000000000000000000000000000000002'
  bidEvent.transaction.hash = Address.fromString(bidId) as Bytes

  assert.entityCount('Bid', 1)

  onBid(bidEvent)
  assert.entityCount('Bid', 2)
  assert.fieldEquals('Bid', bidId, 'id', bidId)
  assert.fieldEquals('Bid', bidId, 'user', BOB.toHex())
  assert.fieldEquals('Bid', bidId, 'amount', AMOUNT.toString())
  assert.fieldEquals('Bid', bidId, 'auction', AUCTION_ID)
  assert.fieldEquals('Bid', bidId, 'rewardToken', REWARD_TOKEN.toHex())
  assert.fieldEquals('Bid', bidId, 'bidToken', BID_TOKEN_ADDRESS.toHex())
  assert.fieldEquals('Bid', bidId, 'txHash', bidEvent.transaction.hash.toHex())
  assert.fieldEquals('Bid', bidId, 'createdAtBlock', bidEvent.block.number.toString())
  assert.fieldEquals('Bid', bidId, 'createdAtTimestamp', bidEvent.block.timestamp.toString())

  cleanup()
})
