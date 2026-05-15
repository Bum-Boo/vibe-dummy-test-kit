# Stage 01: 노출된 비밀값

## 1. 이 단계에서 배우는 것

이 단계는 "비밀값"이 코드, 문서, 빌드 결과물, CI 설정에 들어가면 왜 위험한지 배웁니다. 비밀값은 서비스 역할 키, 결제 API 키, JWT 서명 키, 데이터베이스 접속 문자열처럼 다른 사람이 알면 안 되는 값을 말합니다.

이 저장소의 값은 모두 `fake_*_for_training_only` 형태의 가짜 학습용 값입니다. 실제 서비스에 연결되지 않습니다.

## 2. 정상 기능 설명

일반적인 SaaS 앱은 외부 서비스와 연결하기 위해 설정값을 사용합니다. 예를 들어 데이터베이스 URL, 결제 서비스 키, AI 서비스 키, 인증 토큰 서명 키가 필요할 수 있습니다. 정상적인 앱에서는 이런 값이 서버 안에서만 사용되고 브라우저나 공개 문서에는 보이지 않아야 합니다.

## 3. 취약한 부분 설명

Stage 01은 가짜 비밀값을 여러 위치에 일부러 넣었습니다.

- `.env.local`
- `README.md`
- `src/lib/supabase.ts`
- `docker-compose.yml`
- `.github/workflows/deploy.yml`
- `dist/static/main.js`

특히 `NEXT_PUBLIC_`로 시작하는 환경 변수는 Next.js에서 브라우저 번들에 포함될 수 있습니다. 이름에 `PUBLIC`이 들어가면 사용자에게 보여도 되는 값에만 써야 합니다. 서비스 역할 키처럼 권한이 큰 값에 붙이면 안 됩니다.

## 4. 왜 위험한가

프론트엔드 코드는 사용자의 브라우저로 전달됩니다. 개발자 도구, 네트워크 탭, 빌드된 자바스크립트 파일을 보면 값이 노출될 수 있습니다. README나 CI 파일에 들어간 값도 저장소 접근 권한이 있는 사람이 쉽게 복사할 수 있습니다.

실제 프로젝트에서 키가 노출되면 단순히 파일에서 지우는 것으로 끝나지 않습니다. 이미 누군가 봤을 수 있으므로 해당 키를 폐기하고 새 키로 교체해야 합니다. 이 과정을 키 회전이라고 합니다.

## 5. 직접 확인하는 방법

로컬 파일에서 가짜 비밀값이 어디에 있는지 확인합니다.

```sh
rg "fake_.*for_training_only" stages/stage-01-secrets
```

빌드 결과물에도 값이 들어갈 수 있다는 점을 확인합니다.

```sh
rg "NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY|OPENAI_API_KEY|JWT_SECRET" stages/stage-01-secrets
```

이 명령은 로컬 저장소만 읽습니다. 외부 서비스에 연결하지 않습니다.

## 6. BTS_sec로 스캔하는 방법

BTS_sec가 설치되어 있으면 실제 스캔을 실행합니다.

```sh
make scan STAGE=01
pnpm compare -- --stage 01
```

BTS_sec가 아직 없으면 scaffold 리포트를 생성해 대시보드와 비교 흐름을 확인할 수 있습니다.

```sh
pnpm scan -- --stage stage-01-secrets
pnpm compare -- --stage 01
```

## 7. 리포트에서 봐야 할 문장

리포트는 다음 내용을 설명해야 합니다.

- `NEXT_PUBLIC_` 값은 브라우저에서 볼 수 있다는 점
- 서비스 역할 키처럼 보이는 값이 프론트엔드 접근 가능 코드에 있다는 점
- README, CI workflow, 빌드된 static JS에 비밀값처럼 보이는 문자열이 있다는 점
- 실제 프로젝트라면 노출된 키를 회전해야 한다는 점

다음처럼 말하면 안 됩니다.

- 이 값들이 실제로 유효한 키라고 단정하기
- SQL injection 문제라고 설명하기
- 프론트엔드에서 숨겨진 변수는 사용자에게 절대 보이지 않는다고 설명하기

## 8. 수정 방향

권한이 큰 값은 서버 전용 환경 변수로 옮깁니다. 브라우저에는 공개되어도 되는 anon key, 공개 URL, 기능 플래그 정도만 전달합니다.

취약한 방향:

```ts
export const serviceRoleKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;
```

안전한 방향:

```ts
// 서버 route handler 안에서만 읽습니다.
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
```

문서에는 실제 키 대신 이름만 적습니다.

```md
SUPABASE_SERVICE_ROLE_KEY=<set this locally, never commit real values>
```

## 9. 수정 후 재스캔

비밀값을 제거하거나 서버 전용 위치로 옮긴 뒤 같은 명령으로 다시 스캔합니다.

```sh
make scan STAGE=01
pnpm compare -- --stage 01
```

실제 프로젝트라면 코드 수정과 별도로 노출된 키를 서비스 제공자 콘솔에서 폐기하고 새 키로 바꾸어야 합니다.

## 10. 핵심 요약

- 브라우저로 전달되는 값은 비밀이 아닙니다.
- `NEXT_PUBLIC_`, 빌드 결과물, README, CI 파일에 권한 있는 키를 넣지 않습니다.
- 실제 키가 노출되면 파일 삭제가 아니라 키 회전까지 해야 합니다.
