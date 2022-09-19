import { Address, BigInt } from '@graphprotocol/graph-ts'
import { assert, clearStore, test } from 'matchstick-as'
import { CreateStream as CreateStreamEvent } from '../generated/FuroStream/FuroStream'
import { CreateVesting as CreateVestingEvent } from '../generated/FuroVesting/FuroVesting'
import { BENTOBOX_ADDRESS, WEEK, YEAR } from '../src/constants'
import { getOrCreateRebase } from '../src/functions'
import { onCreateStream } from '../src/mappings/stream'
import { onCreateVesting } from '../src/mappings/vesting'
import { createStreamEvent, createTokenMock, createTotalsMock, createVestingEvent } from './mocks'

const WETH_ADDRESS = Address.fromString('0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2')
const TOKEN_NAME = 'Wrapped Ether'
const TOKEN_DECIMALS = BigInt.fromString('18')
const TOKEN_SYMBOL = 'WETH'
const SENDER = Address.fromString('0x00000000000000000000000000000000000a71ce')
const RECIEVER = Address.fromString('0x0000000000000000000000000000000000000b0b')
const STREAM_ID = BigInt.fromString('1001')
const AMOUNT = BigInt.fromString('1000000')
const START_TIME = BigInt.fromString('1648297495') // 	Sat Mar 26 2022 12:24:55 GMT+0000
const END_TIME = BigInt.fromString('1650972295') // 	Tue Apr 26 2022 11:24:55 GMT+0000, One month later
const VESTING_ID = BigInt.fromString('1')
const CLIFF_AMOUNT = BigInt.fromString('100000000')
const STEPS_AMOUNT = BigInt.fromString('10000000')
const CLIFF_DURATION = BigInt.fromU32(YEAR)
const biweekly = 2 * WEEK
const STEP_DURATION = BigInt.fromU32(biweekly)
const STEPS = BigInt.fromU32(26)
const TOTAL_AMOUNT = CLIFF_AMOUNT.plus(STEPS.times(STEPS_AMOUNT)) // 100000000 + (26 * 10000000) = 360000000


let streamEvent: CreateStreamEvent
let vestingEvent: CreateVestingEvent

function vestingSetup(): void {
  cleanup()

  createTotalsMock(BENTOBOX_ADDRESS, WETH_ADDRESS, TOTAL_AMOUNT, TOTAL_AMOUNT)
  getOrCreateRebase(WETH_ADDRESS.toHex())

  vestingEvent = createVestingEvent(
    VESTING_ID,
    WETH_ADDRESS,
    SENDER,
    RECIEVER,
    START_TIME,
    CLIFF_DURATION,
    STEP_DURATION,
    STEPS,
    CLIFF_AMOUNT,
    STEPS_AMOUNT,
    true
  )
  createTokenMock(WETH_ADDRESS.toHex(), TOKEN_DECIMALS, TOKEN_NAME, TOKEN_SYMBOL)
  onCreateVesting(vestingEvent)
}

function streamSetup(): void {
  cleanup()

  createTotalsMock(BENTOBOX_ADDRESS, WETH_ADDRESS, AMOUNT, AMOUNT)
  getOrCreateRebase(WETH_ADDRESS.toHex())

  streamEvent = createStreamEvent(STREAM_ID, SENDER, RECIEVER, WETH_ADDRESS, AMOUNT, START_TIME, END_TIME, true)
  createTokenMock(WETH_ADDRESS.toHex(), TOKEN_DECIMALS, TOKEN_NAME, TOKEN_SYMBOL)
  onCreateStream(streamEvent)
}

function cleanup(): void {
  clearStore()
}

test('Token is created on stream creation event', () => {
  streamSetup()

  assert.entityCount('Token', 1)
  assert.fieldEquals('Token', WETH_ADDRESS.toHex(), 'id', WETH_ADDRESS.toHex())
  assert.fieldEquals('Token', WETH_ADDRESS.toHex(), 'decimals', TOKEN_DECIMALS.toString())
  assert.fieldEquals('Token', WETH_ADDRESS.toHex(), 'name', TOKEN_NAME)
  assert.fieldEquals('Token', WETH_ADDRESS.toHex(), 'symbol', TOKEN_SYMBOL)
  assert.fieldEquals('Token', WETH_ADDRESS.toHex(), 'createdAtBlock', streamEvent.block.number.toString())
  assert.fieldEquals('Token', WETH_ADDRESS.toHex(), 'createdAtTimestamp', streamEvent.block.timestamp.toString())

  cleanup()
})

test('Token is created on vesting creation event', () => {
  vestingSetup()

  assert.entityCount('Token', 1)
  assert.fieldEquals('Token', WETH_ADDRESS.toHex(), 'id', WETH_ADDRESS.toHex())
  assert.fieldEquals('Token', WETH_ADDRESS.toHex(), 'decimals', TOKEN_DECIMALS.toString())
  assert.fieldEquals('Token', WETH_ADDRESS.toHex(), 'name', TOKEN_NAME)
  assert.fieldEquals('Token', WETH_ADDRESS.toHex(), 'symbol', TOKEN_SYMBOL)
  assert.fieldEquals('Token', WETH_ADDRESS.toHex(), 'createdAtBlock', vestingEvent.block.number.toString())
  assert.fieldEquals('Token', WETH_ADDRESS.toHex(), 'createdAtTimestamp', vestingEvent.block.timestamp.toString())

  cleanup()
})
