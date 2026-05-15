# Stage 04: Broken Access Control / IDOR

## 1. 이 단계에서 배우는 것

이 단계는 IDOR를 배웁니다. IDOR는 Insecure Direct Object Reference의 줄임말입니다. 쉽게 말하면 "URL이나 요청에 들어 있는 ID만 바꾸면 다른 사람의 데이터를 볼 수 있는 문제"입니다.

보안에서 중요한 점은 로그인 여부만 확인하는 것이 아니라, 로그인한 사용자가 그 특정 객체를 볼 권한이 있는지도 확인하는 것입니다.

## 2. 정상 기능 설명

AI 포트폴리오 SaaS에서 사용자는 자신의 프로젝트와 주문 내역을 볼 수 있습니다. Alice는 Alice의 프로젝트를 보고, Bob은 Bob의 프로젝트를 봐야 합니다.

안전한 예시는 `GET /api/my/projects`입니다. 이 route는 현재 세션의 사용자 ID를 읽고 `findProjectsByOwnerId(session.user.id)`로 Alice의 프로젝트만 조회합니다.

## 3. 취약한 부분 설명

Stage 04의 취약한 route는 URL의 `:id` 값만 믿고 데이터를 조회합니다.

- `GET /api/projects/:id`
- `GET /api/orders/:id`
- `DELETE /api/projects/:id`

취약한 패턴은 다음과 같습니다.

```ts
const id = req.params.id;
const project = findProjectById(id);
```

여기에는 `ownerId`, `userId`, `orgId` 같은 소유권 조건이 없습니다.

## 4. 왜 위험한가

Alice가 로그인한 상태에서 자신의 프로젝트를 봅니다.

```text
/api/projects/project-alice
```

그런데 URL의 ID를 Bob의 프로젝트 ID로 바꾸면 어떻게 될까요?

```text
/api/projects/project-bob
```

서버가 `project-bob`만 찾고 "이 프로젝트의 ownerId가 Alice인가?"를 확인하지 않으면 Alice가 Bob의 프로젝트를 볼 수 있습니다. 삭제 route라면 다른 사람의 데이터를 지울 수도 있습니다. 이 단계의 삭제는 로컬 데모 데이터에서만 일어납니다.

## 5. 직접 확인하는 방법

로컬 데모 스크립트로 안전하게 확인할 수 있습니다.

```sh
pnpm exec tsx stages/stage-04-access-control/src/manual-demo.ts
```

확인할 점:

- 취약한 route에서는 Alice가 Bob의 프로젝트 ID를 요청할 수 있습니다.
- 안전한 `GET /api/my/projects` route는 Alice의 프로젝트만 보여줍니다.

외부 사이트나 실제 사용자 데이터는 사용하지 않습니다.

## 6. BTS_sec로 스캔하는 방법

BTS_sec가 설치되어 있으면 실제 스캔을 실행합니다.

```sh
make scan STAGE=04
pnpm compare -- --stage 04
```

BTS_sec가 아직 없으면 scaffold 리포트로 대시보드 흐름을 확인합니다.

```sh
pnpm scan -- --stage stage-04-access-control
pnpm compare -- --stage 04
```

## 7. 리포트에서 봐야 할 문장

리포트는 다음 표현을 포함해야 합니다.

- object-level authorization
- ownership check
- route parameter ID
- changing the URL parameter

다음 설명은 나오면 안 됩니다.

- SQL injection

이 문제는 SQL 문장을 조작하는 문제가 아닙니다. 객체를 조회하거나 삭제할 때 소유권 검사가 빠진 접근 제어 문제입니다.

## 8. 수정 방향

객체 ID와 현재 사용자 ID를 함께 조건으로 사용합니다.

취약한 방향:

```ts
const project = findProjectById(req.params.id);
```

안전한 방향:

```ts
const session = getCurrentSession(req);
const project = findProjectByIdForUser(req.params.id, session.user.id);
```

회사나 팀 단위 데이터라면 `ownerId` 대신 `orgId`를 함께 확인할 수 있습니다.

```ts
const order = findOrderByIdForOrg(req.params.id, session.user.orgId);
```

## 9. 수정 후 재스캔

소유권 조건을 추가한 뒤 다시 스캔합니다.

```sh
make scan STAGE=04
pnpm compare -- --stage 04
```

안전한 route인 `GET /api/my/projects`가 취약점으로 잘못 보고되지 않는지도 함께 봅니다. 이 단계는 BTS_sec의 false positive 확인에도 중요합니다.

## 10. 핵심 요약

- 로그인은 "누구인지" 확인하는 것이고, 권한 검사는 "이 객체를 봐도 되는지" 확인하는 것입니다.
- URL의 ID만 믿고 데이터를 조회하면 다른 사람의 데이터를 볼 수 있습니다.
- 조회, 수정, 삭제 모두 `ownerId`, `userId`, `orgId` 같은 소유권 조건을 함께 확인해야 합니다.
