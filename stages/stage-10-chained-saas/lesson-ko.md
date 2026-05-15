# Stage 10: 연결된 현실적인 SaaS 취약점

## 1. 이 단계에서 배우는 것

이 단계는 작은 실수 여러 개가 함께 있을 때 전체 위험이 크게 커지는 과정을 배웁니다. Stage 10은 AI 포트폴리오 빌더 SaaS를 흉내 내며, 프론트엔드 설정, 접근 제어, AI 출력, 파일 업로드, 관리자 기능, CORS, API 응답 문제가 서로 연결되는 모습을 보여줍니다.

모든 키와 데이터는 로컬 학습용 가짜 값입니다. 실제 외부 서비스에 연결하지 않습니다.

## 2. 정상 기능 설명

정상적인 AI 포트폴리오 SaaS는 다음 기능을 제공합니다.

- Alice, Bob, Admin으로 데모 로그인
- 프로젝트 생성, 목록, 상세 보기
- 이미지 업로드
- AI가 작성한 포트폴리오 설명 생성
- 공개 포트폴리오 페이지
- 관리자 대시보드
- plan이나 billing 같은 요금제 필드

사용자는 자기 프로젝트만 보고, 업로드 파일은 안전하게 저장되고, AI 결과는 신뢰하지 않은 텍스트처럼 다루어져야 합니다.

## 3. 취약한 부분 설명

Stage 10은 다음 문제를 의도적으로 함께 넣었습니다.

- 브라우저 접근 가능 코드에 서비스 역할 키처럼 보이는 가짜 값이 있음
- 프로젝트 상세 route가 `ownerId`나 `orgId`를 확인하지 않음
- AI가 만든 HTML을 그대로 신뢰하고 렌더링함
- 업로드 파일을 약한 검증으로 공개 위치에 저장함
- 관리자 화면이 프론트엔드 조건이나 사용자가 보낸 role 값을 믿음
- CORS 또는 reverse proxy 설정이 너무 넓음
- 사용자 API가 password hash, refresh token, billing ID 같은 내부 필드를 많이 반환함

## 4. 왜 위험한가

각 문제를 따로 보면 "나중에 고치면 되겠지"라고 생각하기 쉽습니다. 하지만 실제 서비스에서는 문제가 연결됩니다.

예를 들어 사용자가 URL의 프로젝트 ID를 바꾸어 다른 사람의 프로젝트를 볼 수 있고, 그 프로젝트의 AI 생성 HTML이나 공개 업로드 파일이 다른 사용자에게도 보일 수 있습니다. 동시에 브라우저 코드에 권한 있어 보이는 값이 있고 API가 내부 필드를 많이 반환하면, 리포트의 전체 위험은 Critical로 올라갈 수 있습니다.

보안은 체크리스트 한 줄이 아닙니다. 인증, 권한, 데이터 노출, 콘텐츠 렌더링, 업로드, 서버 설정이 함께 맞아야 합니다.

## 5. 직접 확인하는 방법

로컬 코드에서 연결된 문제를 확인합니다.

```sh
rg "NEXT_PUBLIC_PORTFOLIO_SERVICE_ROLE_KEY|findProjectById|aiDescriptionHtml|public/uploads|isAdmin|origin: \"\\*\"|passwordHash" stages/stage-10-chained-saas
```

각 기능은 로컬 데모 데이터만 사용합니다. 실제 키, 실제 결제, 실제 AI API, 외부 도메인은 사용하지 않습니다.

## 6. BTS_sec로 스캔하는 방법

BTS_sec가 설치되어 있으면 실제 스캔을 실행합니다.

```sh
make scan STAGE=10
pnpm compare -- --stage 10
```

BTS_sec가 아직 없으면 scaffold 리포트를 생성합니다.

```sh
pnpm scan -- --stage stage-10-chained-saas
pnpm compare -- --stage 10
```

## 7. 리포트에서 봐야 할 문장

Stage 10 리포트는 개별 finding 목록만 보여주면 부족합니다. executive summary가 여러 문제가 어떻게 연결되는지 설명해야 합니다.

포함되어야 할 내용:

- 여러 문제가 합쳐져 cross-user data exposure와 stored content injection 위험을 만든다는 점
- 사용자가 ID를 바꾸어 다른 사용자의 프로젝트에 접근할 수 있다는 점
- AI 생성 콘텐츠가 신뢰된 HTML처럼 렌더링된다는 점
- 업로드 파일이 충분한 검증 없이 공개 호스팅된다는 점
- 브라우저 접근 가능 코드에 권한 있어 보이는 값이 있다는 점
- 전체 위험이 Critical이라는 점

다음처럼 말하면 안 됩니다.

- 각 finding을 서로 관련 없는 작은 문제로만 설명하기
- 실제 외부 공격을 실행하라고 안내하기
- 가짜 키를 실제 유효한 키라고 단정하기

## 8. 수정 방향

우선순위는 사용자가 보낸 값을 신뢰하지 않는 방향입니다.

1. 서버에서 프로젝트 소유권을 확인합니다.
2. 프론트엔드에서 권한 있는 키처럼 보이는 값을 제거합니다.
3. AI 출력은 HTML이 아니라 텍스트로 저장하거나 sanitizer를 거칩니다.
4. 업로드는 크기 제한, MIME allowlist, 서버 생성 파일 이름, 비공개 저장소를 사용합니다.
5. 관리자 API는 서버 세션의 role을 확인합니다.
6. API 응답은 공개 DTO만 반환합니다.
7. CORS와 reverse proxy 설정을 필요한 local origin으로 제한합니다.

## 9. 수정 후 재스캔

Stage 11은 Stage 10 기능을 유지하면서 위 문제를 완화한 버전입니다. Stage 10을 스캔한 뒤 Stage 11도 스캔해 차이를 확인합니다.

```sh
make scan STAGE=10
pnpm compare -- --stage 10
make scan STAGE=11
pnpm compare -- --stage 11
```

Stage 11에서는 Critical과 High가 0이어야 합니다.

## 10. 핵심 요약

- 작은 실수 여러 개가 연결되면 전체 사고로 이어질 수 있습니다.
- BTS_sec 리포트는 개별 finding뿐 아니라 연결된 공격 흐름을 함께 읽어야 합니다.
- 우선순위는 권한 검사, 비밀값 제거, 안전한 렌더링, 안전한 업로드, 과도한 API 응답 축소입니다.
