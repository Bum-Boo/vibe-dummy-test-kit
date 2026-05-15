# Stage 07: 안전하지 않은 파일 업로드

## 1. 이 단계에서 배우는 것

이 단계는 파일 업로드가 왜 조심해야 하는 기능인지 배웁니다. 파일 업로드는 사용자가 만든 데이터를 서버 파일 시스템이나 object storage에 저장하는 기능입니다. 사용자가 보내는 파일 이름, 크기, 형식, 저장 위치를 그대로 믿으면 문제가 생길 수 있습니다.

## 2. 정상 기능 설명

AI 포트폴리오 SaaS에서 사용자는 프로젝트 이미지나 포트폴리오에 사용할 파일을 업로드할 수 있습니다. 정상적인 앱은 파일이 너무 크지 않은지, 허용된 형식인지, 저장 위치가 안전한지 확인한 뒤 파일을 저장합니다.

## 3. 취약한 부분 설명

Stage 07의 취약한 업로드 route는 원본 파일 이름을 그대로 사용하고, 공개 디렉터리에 파일을 저장합니다.

```ts
const file = formData.get("file");
const filename = file.name;
await writeFile(`./public/uploads/${filename}`, buffer);
```

또한 확장자만 확인하고 MIME type은 확인하지 않습니다. 파일 크기 제한도 없습니다. SVG도 허용하지만 별도 정리나 제한이 없습니다.

## 4. 왜 위험한가

원본 파일 이름은 사용자가 보낸 값입니다. 서버가 직접 만든 안전한 이름이 아닙니다. 같은 이름으로 덮어쓰기, 이상한 문자 처리, 경로 처리 실수 같은 문제가 생길 수 있습니다.

`public/uploads` 같은 경로는 브라우저에서 바로 접근할 수 있습니다. 업로드가 끝나자마자 공개 URL이 생기면, 검토나 권한 확인 전에 다른 사람이 파일에 접근할 수 있습니다.

확장자만 보는 것도 부족합니다. 파일 이름은 쉽게 바꿀 수 있기 때문입니다. MIME type, 파일 크기, 저장 위치, 공개 여부를 함께 통제해야 합니다.

## 5. 직접 확인하는 방법

로컬 코드에서 취약한 저장 패턴을 확인합니다.

```sh
rg "public/uploads|file.name|writeFile" stages/stage-07-file-upload
```

안전한 대비 예시도 함께 확인합니다.

```sh
rg "randomUUID|allowedMimeTypes|maxUploadBytes|privateStorageRoot" stages/stage-07-file-upload
```

이 확인은 로컬 파일만 읽습니다. 실제 악성 파일이나 외부 서비스를 사용하지 않습니다.

## 6. BTS_sec로 스캔하는 방법

BTS_sec가 설치되어 있으면 실제 스캔을 실행합니다.

```sh
make scan STAGE=07
pnpm compare -- --stage 07
```

BTS_sec가 아직 없으면 scaffold 리포트를 생성합니다.

```sh
pnpm scan -- --stage stage-07-file-upload
pnpm compare -- --stage 07
```

## 7. 리포트에서 봐야 할 문장

리포트는 다음 내용을 설명해야 합니다.

- 원본 파일 이름을 그대로 사용하는 위험
- `public/uploads`처럼 공개되는 위치에 저장하는 위험
- 파일 크기 제한이 없는 문제
- MIME type 검증이 없는 문제
- SVG를 제한 없이 허용하는 위험
- 안전한 handler는 false positive로 잡히면 안 된다는 점

다음처럼 말하면 안 됩니다.

- 파일 업로드는 확장자만 확인하면 충분하다고 설명하기
- 실제 악성 payload를 실행하라고 안내하기

## 8. 수정 방향

서버가 파일 이름을 새로 만들고, 크기와 형식을 제한하고, 공개 디렉터리 밖에 저장합니다.

취약한 방향:

```ts
const filename = file.name;
await writeFile(`./public/uploads/${filename}`, buffer);
return { publicUrl: `/uploads/${filename}` };
```

안전한 방향:

```ts
if (file.size > maxUploadBytes) throw new Error("file too large");
if (!allowedMimeTypes.has(file.type)) throw new Error("unsupported MIME type");
if (!allowedExtensions.has(extension)) throw new Error("unsupported extension");

const serverFilename = `${randomUUID()}${extension}`;
await writeFile(join(privateStorageRoot, serverFilename), buffer);
return { objectKey: serverFilename };
```

MinIO를 사용할 때도 object를 기본 비공개로 두고, 서버가 권한을 확인한 뒤 접근을 중계하는 방식이 더 안전합니다.

## 9. 수정 후 재스캔

안전한 업로드 방식으로 바꾼 뒤 다시 스캔합니다.

```sh
make scan STAGE=07
pnpm compare -- --stage 07
```

업로드 기능이 그대로 동작하면서 Critical/High 파일 업로드 문제가 사라졌는지 확인합니다.

## 10. 핵심 요약

- 사용자가 보낸 파일 이름을 저장 경로로 그대로 쓰지 않습니다.
- 공개 디렉터리에 바로 저장하면 검토와 권한 확인을 우회할 수 있습니다.
- 안전한 업로드는 크기 제한, MIME allowlist, 확장자 allowlist, 서버 생성 파일 이름, 비공개 저장소를 함께 사용합니다.
