# BTS_sec 발표자 노트

이 문서는 7분, 15분, 60분 데모를 진행할 때 발표자가 옆에 두고 볼 실전 메모입니다.

## 공통 원칙

- 항상 "로컬 전용"이라고 먼저 말합니다.
- 실제 키, 실제 계정, 실제 클라우드 서비스는 사용하지 않는다고 말합니다.
- 외부 도메인이나 임의의 공개 IP를 스캔하지 않는다고 말합니다.
- 취약점 설명은 공격 절차가 아니라 잘못된 신뢰 가정과 안전한 수정 방향에 집중합니다.
- BTS_sec가 없을 때는 scaffold fallback을 사용한다고 분명히 말합니다.

## 시작 전 체크리스트

```sh
make setup
make up
make dashboard
pnpm score
```

브라우저 탭:

- `http://localhost:3000`
- `http://localhost:3000/stages`
- `http://localhost:3000/stages/stage-04`
- `http://localhost:3000/reports/stage-04`
- `http://localhost:3000/reports/stage-11`
- `http://localhost:3000/scoreboard`

문제가 생기면:

- Docker가 없으면 code stage 중심으로 진행합니다.
- `make`가 없으면 `pnpm` 직접 명령을 사용합니다.
- BTS_sec가 없으면 `pnpm scan -- --stage ...` fallback을 사용합니다.

## BTS_sec 없음 fallback 문장

말할 문장:

"지금 환경에는 BTS_sec 바이너리가 없을 수 있습니다. 이 저장소는 데모가 끊기지 않도록 결정적인 scaffold 리포트 생성기를 제공합니다. 이 fallback은 외부 시스템을 스캔하지 않고, 로컬 stage와 expected fixture만 사용합니다."

명령:

```sh
pnpm scan -- --stage stage-04-access-control
pnpm compare -- --stage 04
```

## Stage 01 발표 포인트

핵심 메시지:

- 브라우저로 전달되는 값은 비밀이 아닙니다.
- `NEXT_PUBLIC_`은 공개되어도 되는 값에만 붙입니다.
- 실제 키가 노출되면 삭제만 하지 말고 회전해야 합니다.

명령:

```sh
rg "fake_.*for_training_only" stages/stage-01-secrets
make scan STAGE=01
make compare STAGE=01
```

fallback:

```sh
pnpm scan -- --stage stage-01-secrets
pnpm compare -- --stage 01
```

피해야 할 말:

- "이 키가 실제로 유효합니다."
- "프론트엔드 환경 변수는 숨겨집니다."

## Stage 04 발표 포인트

핵심 메시지:

- 인증은 "누구인지" 확인하는 것입니다.
- 권한 검사는 "이 객체를 봐도 되는지" 확인하는 것입니다.
- IDOR는 route parameter ID만 믿을 때 생깁니다.

명령:

```sh
pnpm exec tsx stages/stage-04-access-control/src/manual-demo.ts
make scan STAGE=04
make compare STAGE=04
```

fallback:

```sh
pnpm scan -- --stage stage-04-access-control
pnpm compare -- --stage 04
```

리포트에서 강조할 문장:

- object-level authorization
- ownership check
- route parameter ID
- changing the URL parameter

피해야 할 말:

- "SQL injection입니다."

## Stage 07 발표 포인트

핵심 메시지:

- 파일 이름은 사용자가 보낸 값입니다.
- 공개 디렉터리에 바로 저장하면 권한 확인 전에 파일이 노출될 수 있습니다.
- 확장자만 보는 검증은 부족합니다.

명령:

```sh
rg "file.name|public/uploads|allowedMimeTypes|randomUUID" stages/stage-07-file-upload
make scan STAGE=07
make compare STAGE=07
```

fallback:

```sh
pnpm scan -- --stage stage-07-file-upload
pnpm compare -- --stage 07
```

수정 방향:

- 서버 생성 파일 이름
- 크기 제한
- MIME allowlist
- 확장자 allowlist
- private storage 또는 controlled MinIO access

## Stage 10 발표 포인트

핵심 메시지:

- 작은 실수가 여러 개 연결되면 전체 위험이 Critical이 될 수 있습니다.
- executive summary가 연결된 흐름을 설명해야 합니다.
- 보안은 체크리스트 한 줄이 아니라 여러 층의 합입니다.

명령:

```sh
make scan STAGE=10
make compare STAGE=10
```

fallback:

```sh
pnpm scan -- --stage stage-10-chained-saas
pnpm compare -- --stage 10
```

강조할 연결:

- 브라우저 접근 가능 키처럼 보이는 값
- 프로젝트 IDOR
- AI HTML 직접 렌더링
- 공개 파일 업로드
- 프론트엔드-only 관리자 보호
- 과도한 API 응답

## Stage 11 발표 포인트

핵심 메시지:

- 고친 stage는 기능을 제거하지 않습니다.
- 같은 SaaS 흐름을 안전한 방식으로 유지합니다.
- scanner는 취약한 stage뿐 아니라 fixed stage에서도 검증되어야 합니다.

명령:

```sh
make scan STAGE=11
make compare STAGE=11
make score
```

fallback:

```sh
pnpm scan -- --stage stage-11-fixed
pnpm compare -- --stage 11
pnpm score
```

기대 결과:

- Critical: 0
- High: 0
- Scoreboard에서 Stage 11 PASS

## 시간별 압축 팁

7분:

- Stage 04만 깊게 보여주고 Stage 11로 닫습니다.
- Stage 01, 07, 10은 이름만 언급합니다.

15분:

- Stage 01, 04, 07, 10, 11을 각각 2-3분씩 보여줍니다.
- 각 stage마다 "문제 하나, BTS_sec 결과 하나, 수정 방향 하나"만 말합니다.

60분:

- 참가자에게 직접 명령을 실행하게 합니다.
- report quality와 false positive 얘기를 충분히 합니다.
- 마지막에는 Stage 11과 scoreboard로 마무리합니다.

## 자주 나오는 질문 답변

Q: 이건 실제 공격 실습인가요?

A: 아닙니다. 로컬 학습용 취약 패턴과 scanner benchmark입니다. 실제 외부 시스템을 대상으로 하지 않습니다.

Q: 왜 fake secret을 넣나요?

A: scanner가 secret exposure를 감지하는지 검증하기 위해서입니다. 실제 키는 절대 넣지 않습니다.

Q: Stage 11에서 Low/Info가 나와도 실패인가요?

A: 항상 실패는 아닙니다. Critical과 High가 0인지가 핵심입니다. Low/Info는 실제로 조치할 만한 제안인지 보고 판단합니다.

Q: `make scan`이 실패하면 데모를 못 하나요?

A: 아닙니다. BTS_sec 바이너리가 없을 때는 `pnpm scan -- --stage ...` fallback으로 deterministic scaffold report를 만들고 `pnpm compare -- --stage ...`로 비교 흐름을 보여줄 수 있습니다.
