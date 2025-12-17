const test = require('brittle')
const BucketRateLimiter = require('../')
const Signal = require('signal-promise')

test('consumes capacity immediately then waits for refill', async function (t) {
  const rateLimiter = new BucketRateLimiter(2, 100)
  t.teardown(() => {
    rateLimiter.destroy()
  })

  t.is(rateLimiter.tryAcquire(), true)
  t.is(rateLimiter.tryAcquire(), true)
  t.is(rateLimiter.tryAcquire(), false)

  // Refill happens at 100ms
  await new Promise((resolve) => setTimeout(resolve, 110))

  t.is(rateLimiter.tryAcquire(), true)
  t.is(rateLimiter.tryAcquire(), false)

  // Refill happens at 100ms
  await new Promise((resolve) => setTimeout(resolve, 210))

  t.is(rateLimiter.tryAcquire(), true)
  t.is(rateLimiter.tryAcquire(), true)
})

test('refill does not exceed capacity across many intervals', async function (t) {
  const rateLimiter = new BucketRateLimiter(2, 100)
  t.teardown(() => {
    rateLimiter.destroy()
  })

  // Drain initial capacity
  t.is(rateLimiter.tryAcquire(), true)
  t.is(rateLimiter.tryAcquire(), true)

  // Advance many intervals; tokens should cap at capacity (2)
  await new Promise((resolve) => setTimeout(resolve, 300))

  t.is(rateLimiter.tryAcquire(), true)
  t.is(rateLimiter.tryAcquire(), true)
  t.is(rateLimiter.tryAcquire(), false)
})

test('queued execution aborts when abort rejects while waiting', async function (t) {
  const rateLimiter = new BucketRateLimiter(1, 200)

  // Occupy the only token
  rateLimiter.wait()

  const abortSignal = new Signal()

  // This execution should queue and abort before any refill
  const queued = rateLimiter.wait({ abort: abortSignal.wait() }).then(() => {
    t.fail('queued fn should not run')
  })

  setTimeout(() => abortSignal.notify(new Error('ABORTED_TEST_WAITING')), 50)

  await t.exception(queued, /ABORTED_TEST_WAITING/)

  rateLimiter.destroy()
})

test('running execution abort signal during execution does not advance token availability', async function (t) {
  const rateLimiter = new BucketRateLimiter(1, 1000)

  const abortSignal = new Signal()

  // Start a long-running task and "abort" during execution
  const longRunning = rateLimiter.wait({ abort: abortSignal.wait() }).then(async () => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    return 'long'
  })

  let queuedFinished = false
  rateLimiter.wait().then(async () => {
    queuedFinished = true
  })

  // Abort while longRunning is in progress; it should not cancel it
  setTimeout(() => abortSignal.notify(new Error('ABORTED_TEST_RUNNING')), 50)

  // Before first refill, queued should not have progressed
  await new Promise((resolve) => setTimeout(resolve, 400))
  t.is(queuedFinished, false, 'no refill yet, queued should still be waiting')

  t.is(await longRunning, 'long', 'long running task should complete unaffected by abort')

  // After the first refill interval elapses, queued should proceed
  await new Promise((resolve) => setTimeout(resolve, 700))
  t.is(queuedFinished, true, 'queued runs after next refill, not due to abort')

  rateLimiter.destroy()
})

function eventFlush() {
  return new Promise((resolve) => setImmediate(resolve))
}
