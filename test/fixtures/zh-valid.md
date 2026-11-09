# 支付重试实施计划

这个方案为支付请求增加有限次数的重试，并明确区分可重试错误和永久错误。开发人员需要先确认风险、超时预算以及重复扣款防护是否符合业务要求。

使用 `createPayment()` 发起请求；如果收到 `ECONNRESET`，按照退避策略再次调用。

```javascript
await createPayment({ idempotencyKey });
```

验证命令为 `npm test`，原始错误信息保持英文。

