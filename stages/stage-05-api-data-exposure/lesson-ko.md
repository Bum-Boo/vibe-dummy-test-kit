# Stage 05: API 데이터 노출과 Mass Assignment

이 단계는 API가 너무 많은 데이터를 응답하거나, 사용자가 보낸 요청 본문을 그대로 업데이트에 사용하는 문제를 보여줍니다.

## 너무 많은 필드를 반환하면 왜 위험한가요?

프론트엔드가 화면에 보여줄 데이터는 보통 일부 필드뿐입니다. 예를 들어 사용자 프로필 화면에는 이름, 이메일, 플랜 정도만 필요할 수 있습니다.

하지만 서버가 내부 사용자 객체 전체를 그대로 반환하면 다음 같은 값이 같이 나갈 수 있습니다.

- `passwordHash`
- `refreshToken`
- `internalMemo`
- `billingCustomerId`

이 값들은 화면에 보이지 않더라도 브라우저 개발자 도구나 네트워크 탭에서 확인할 수 있습니다. API 응답은 사용자에게 전달되는 데이터이므로, 민감한 필드는 응답 전에 제거해야 합니다.

## Mass Assignment란 무엇인가요?

Mass assignment는 사용자가 보낸 객체를 그대로 데이터베이스 업데이트에 넘기는 문제입니다.

취약한 예:

```ts
updateUserDirectly(session.user.id, req.body);
```

프론트엔드 폼에는 `displayName`만 있어도, 사용자는 요청을 직접 바꿔서 다음 필드를 보낼 수 있습니다.

```json
{
  "displayName": "Alice",
  "role": "admin",
  "plan": "enterprise",
  "credit": 999999,
  "isAdmin": true,
  "emailVerified": true
}
```

서버가 `req.body`를 그대로 믿으면 사용자가 자기 권한이나 결제 상태를 바꿀 수 있습니다.

## 안전한 수정 전/후

수정 전:

```ts
const updatedUser = updateUserDirectly(session.user.id, req.body);
```

수정 후:

```ts
const allowedChanges = {
  displayName: String(req.body.displayName ?? ""),
  portfolioTitle: String(req.body.portfolioTitle ?? "")
};

const updatedUser = updateUserWithAllowlist(session.user.id, allowedChanges);
```

핵심은 "클라이언트가 보낸 모든 필드"가 아니라 "서버가 허용한 필드"만 업데이트하는 것입니다.

## 안전한 응답 만들기

사용자 객체 전체를 반환하지 말고 공개용 응답 모양을 따로 만듭니다.

```ts
return {
  id: user.id,
  email: user.email,
  displayName: user.displayName,
  portfolioTitle: user.portfolioTitle,
  plan: user.plan
};
```

이렇게 하면 `passwordHash`나 `refreshToken` 같은 내부 필드가 실수로 응답에 섞일 가능성이 줄어듭니다.

