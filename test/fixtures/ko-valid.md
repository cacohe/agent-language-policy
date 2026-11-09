# 결제 재시도 구현 계획

이 설계는 결제 요청에 제한된 재시도를 추가하고 재시도 가능한 오류와 영구 오류를 구분합니다. 개발자는 위험, 시간 제한 및 중복 결제 방지 방식이 요구사항에 맞는지 확인해야 합니다.

요청은 `createPayment()`로 시작하며 `ECONNRESET` 오류가 발생하면 지정된 지연 정책에 따라 다시 호출합니다.

```javascript
await createPayment({ idempotencyKey });
```

검증 명령은 `npm test`이며 원본 오류 메시지는 영어로 유지합니다.

