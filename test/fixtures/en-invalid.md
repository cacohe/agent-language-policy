# Payment Retry Implementation Plan

This design adds bounded retries to payment requests and separates retryable failures from permanent failures. Reviewers must confirm the risk, timeout budget, and duplicate-charge protection before implementation starts.

Use `createPayment()` for the request and retry `ECONNRESET` according to the configured backoff policy.

