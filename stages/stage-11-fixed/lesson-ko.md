# Stage 11: 수정된 현실적인 SaaS

## 1. 이 단계에서 배우는 것

이 단계는 Stage 10의 기능을 유지하면서 취약점을 줄이는 방법을 배웁니다. 목표는 기능을 없애는 것이 아니라, 같은 기능을 더 안전한 방식으로 구현하는 것입니다.

또한 수정된 코드도 다시 스캔해야 한다는 점을 배웁니다. "고쳤다"고 생각해도 새 기능이나 리팩터링 과정에서 비슷한 실수가 다시 들어갈 수 있습니다.

## 2. 정상 기능 설명

Stage 11도 Stage 10과 같은 AI 포트폴리오 빌더 SaaS 흐름을 유지합니다.

- Alice, Bob, Admin 데모 로그인
- 프로젝트 생성, 목록, 상세 보기
- 이미지 업로드
- AI 포트폴리오 설명 생성
- 공개 포트폴리오 페이지
- 관리자 대시보드
- plan과 billing 같은 필드

차이는 이 기능들이 안전한 기본값으로 동작한다는 점입니다.

## 3. 취약한 부분 설명

Stage 11은 취약한 부분을 남겨두는 단계가 아닙니다. Stage 10에서 의도적으로 넣었던 문제를 제거하거나 완화한 fixed stage입니다.

주요 변경점:

- 브라우저 접근 가능 코드에서 권한 있는 키처럼 보이는 값을 제거함
- 권한 있는 작업을 서버 route로 옮김
- 프로젝트 접근에 `ownerId` 또는 `orgId` 확인을 추가함
- AI 생성 HTML을 직접 렌더링하지 않음
- 업로드에 크기 제한, MIME allowlist, 확장자 allowlist, 서버 생성 파일 이름을 적용함
- 파일을 공개 web root 밖에 저장함
- 관리자 권한을 서버에서 확인함
- API 응답에서 내부 필드를 제거함
- CORS와 보안 헤더를 더 안전하게 설정함
- AI endpoint에 입력 길이와 호출 횟수 제한을 둠
- 로그에서 민감한 값을 남기지 않음

## 4. 왜 위험한가

Stage 11 자체의 목표는 위험을 줄이는 것입니다. 하지만 fixed stage가 중요한 이유는 따로 있습니다.

스캐너가 취약한 코드만 잘 찾는 것으로는 충분하지 않습니다. 안전한 코드에 대해 Critical이나 High를 계속 보고하면 개발자가 리포트를 신뢰하기 어렵습니다. 그래서 Stage 11은 BTS_sec가 수정 검증과 false positive 제어를 잘하는지 확인하는 기준점입니다.

## 5. 직접 확인하는 방법

Stage 10과 Stage 11 코드를 비교해 안전한 패턴을 확인합니다.

```sh
rg "findProjectById|findProjectByIdForUser|public/uploads|privateStorageRoot|escapeHtml|allowedMimeTypes" stages/stage-10-chained-saas stages/stage-11-fixed
```

Stage 11에서는 기능이 사라진 것이 아니라 안전한 helper와 제한 조건으로 바뀐 것을 확인합니다.

## 6. BTS_sec로 스캔하는 방법

BTS_sec가 설치되어 있으면 실제 스캔을 실행합니다.

```sh
make scan STAGE=11
pnpm compare -- --stage 11
```

BTS_sec가 아직 없으면 scaffold 리포트를 생성합니다.

```sh
pnpm scan -- --stage stage-11-fixed
pnpm compare -- --stage 11
```

## 7. 리포트에서 봐야 할 문장

Stage 11의 expected result는 다음과 같습니다.

- Critical: 0
- High: 0
- Medium: 0 또는 아주 적은 수
- Low/Info: 실제로 조치할 만한 제안이면 허용

리포트는 Stage 10의 chain을 그대로 반복하면 안 됩니다. 만약 Critical/High가 남아 있다면 실제 취약점인지, 스캐너 오탐인지, expected 파일이 오래된 것인지 확인해야 합니다.

## 8. 수정 방향

Stage 11의 안전한 패턴은 다음과 같습니다.

프로젝트 조회:

```ts
const project = findProjectByIdForUser(req.params.id, user.id);
```

AI 출력:

```ts
const html = `<p>${escapeHtml(project.aiDescriptionText)}</p>`;
```

파일 업로드:

```ts
if (!allowedMimeTypes.has(file.type)) throw new Error("unsupported MIME type");
const serverFilename = `${randomUUID()}${extension}`;
await writeFile(join(privateStorageRoot, serverFilename), buffer);
```

관리자 기능:

```ts
const session = getServerSession(req);
if (session.user.role !== "admin") throw new Error("forbidden");
```

## 9. 수정 후 재스캔

수정된 stage도 계속 재스캔합니다.

```sh
make scan STAGE=11
pnpm compare -- --stage 11
pnpm score
```

새 기능을 추가한 뒤 Stage 11에서 Critical/High가 다시 나타나면 우선순위를 높여 확인합니다.

## 10. 핵심 요약

- 보안 수정은 기능 삭제가 아니라 안전한 방식으로 같은 기능을 유지하는 것입니다.
- fixed stage도 계속 스캔해야 오탐과 회귀를 확인할 수 있습니다.
- Low/Info는 남을 수 있지만 Critical/High는 없어야 합니다.
