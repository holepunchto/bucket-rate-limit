# bucket-rate-limit

A lightweight, bucket-based rate limiter for Node.js that controls request frequency with minimal overhead.

Uses a token bucket: you start with `capacity` tokens and regain 1 token every `intervalMs` until the bucket is full again. Call `wait()` to block until a token is available.

## Install

```bash
npm i bucket-rate-limit
```

## API

- `new BucketRateLimiter({ capacity, intervalMs })`
  - **capacity**: maximum number of tokens (burst size)
  - **intervalMs**: milliseconds per token refill (refills 1 token each interval)
- `await limiter.wait({ abortSignalPromise })` - Wait until a token is available. Returns immediately if the capacity is available.
  - **abortSignalPromise** (optional): a promise that rejects to abort waiting
- `limiter.destroy()`: stop refilling and abort any pending waits

## License

Apache-2.0
