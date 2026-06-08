# nested-entry-monorepo (CASE 2)

`frontend` / `backend` 이름이 아니고, **여러 깊이에 `package.json`이 존재**할 때 진입점/의존성 파일이 올바르게 인식되는지 확인하는 샘플입니다.

## 폴더 구조

```
nested-entry-monorepo/
├── client-ui/                              # web (얕은 경로, package.json 없음)
│   ├── index.html
│   ├── app.js
│   └── styles.css
├── workspace/services/api-server/          # WAS 실제 진입점 (깊은 경로)
│   ├── package.json                        # 실제 start 스크립트
│   └── src/
│       ├── server.js                       # entry 파일
│       ├── routes.js
│       └── store.js
├── packages/shared-lib/                    # 공유 코드 + decoy package.json
│   ├── package.json                        # decoy (의존성 루트 아님)
│   └── src/index.js
└── tools/maintenance/helper/package.json   # decoy (depth 4)
```

## decoy `package.json`이 왜 필요한가?

일반적인 `frontend/package.json` + `backend/package.json` 구조에서는 **루트 후보가 딱 두 개**라서, 도구가 잘못 고를 여지가 적습니다.

이 샘플은 그보다 까다로운 CASE 2를 재현합니다.

| 경로 | 역할 |
|------|------|
| `client-ui/` | 웹 루트이지만 **`package.json`이 없음** (정적 HTML만) |
| `workspace/services/api-server/package.json` | **실제 WAS 진입점** (`npm start` → `src/server.js`) |
| `packages/shared-lib/package.json` | 공유 라이브러리 폴더에 있는 **가짜 루트** — 코드는 있지만 start 스크립트 없음 |
| `tools/maintenance/helper/package.json` | 깊이 4에 있는 **또 다른 가짜 루트** |

도구가 단순히 “가장 가까운 `package.json`”이나 “첫 번째로 찾은 `package.json`”을 루트로 잡으면, 실제 서버 진입점(`workspace/services/api-server`) 대신 `packages/`나 `tools/` 쪽을 잘못 선택할 수 있습니다.

decoy는 **의도적인 함정**입니다. 올바른 도구라면:

- WAS 진입점 → `workspace/services/api-server/package.json`
- 웹 루트 → `client-ui/index.html` (또는 `client-ui/`)
- `packages/shared-lib/package.json` → 의존성 설치 루트가 **아님**

을 구분해야 합니다.

## 기능

### 백엔드 (`workspace/services/api-server`)

- `GET /health` — 헬스체크 (shared-lib 사용)
- `GET /api/items` — 할 일 목록
- `POST /api/items` — 항목 추가 (`{ "title": "..." }`)
- `PATCH /api/items/:id/toggle` — 완료 토글
- `DELETE /api/items/:id` — 항목 삭제

### 프론트 (`client-ui`)

- API 연결 상태 표시
- 할 일 추가 / 완료 토글 / 삭제
- `package.json` 없이 정적 파일만으로 동작

## 실행

```bash
# 1. API 서버 (진입점: workspace/services/api-server)
cd workspace/services/api-server
npm start

# 2. 프론트 (별도 터미널, 정적 서버 아무거나)
cd client-ui
npx --yes serve .
# 또는 index.html을 Live Server 등으로 열기
```

프론트는 기본적으로 `http://localhost:3000` API에 연결합니다. 포트가 다르면 `client-ui/index.html` 앞에 스크립트로 `window.API_BASE`를 설정하세요.

## 검증 포인트

1. **WAS 진입점**이 `workspace/services/api-server`로 잡히는가?
2. **웹 루트**가 `client-ui`로 잡히는가?
3. `packages/shared-lib/package.json`이나 `tools/.../package.json`을 루트로 **오인하지 않는가?**
