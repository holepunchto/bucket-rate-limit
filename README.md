# Bucket Rate Limit

A lightweight, bucket-based rate limiter for Node.js that controls request frequency with minimal overhead.

Uses a token bucket: you start with `capacity` tokens and regain 1 token every `intervalMs` until the bucket is full again. Call `wait()` to block until a token is available.

## Install

```bash
npm i bucket-rate-limit
```

## API

#### `const limiter = new BucketRateLimiter(capacity, intervalMs)`

Create a new rate limiter, with parameters:
  - `capacity`: maximum number of tokens (burst size)
  - `intervalMs`: milliseconds per token refill (refills 1 token each .interval)

For example:
- `capacity = 1` and `intervalMs = 200` allows 5 requests per second, and no burstiness.
- `capacity = 10` and `intervalMs = 200` allows bursts up to 10 requests, but still limits long-term throughput to 5 requests per second.
- `capacity = 10` and `intervalMs = 1000` also allows bursts up to 10 requests, but long-term throughput of just 1 request per second.

#### `await limiter.wait({ abortSignalPromise } = {})`
Wait until a token is available. Returns immediately if the capacity is available.

Optional **abortSignalPromise**: a promise that aborts waiting when it rejects. Default is to not support aborting (so it will keep waiting until a token is available).

#### `limiter.destroy()`

Destroy the rate limiter: stops refilling the bucket and aborts any pending waits.

## License

Apache-2.0
