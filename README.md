# 이미지 리사이징 서비스 (여권 사진 413x531)

React + Vite + TypeScript + Tailwind 기반의 간단한 이미지 리사이징 프론트엔드입니다. 이미지를 업로드하면 백엔드가 413x531(여권 사진 규격)로 변환한 URL을 반환하며, 프론트는 그 URL을 그대로 표시합니다.

## ✨ 기술 스택

- **Framework**: [React](https://react.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Linting**: [ESLint](https://eslint.org/)
- **Formatting**: [Prettier](https://prettier.io/)

## 📦 폴더 구조 (요약)

- `src/App.tsx`: 메인 UI. 업로드/미리보기/결과 URL 표시
- `src/api/http.ts`: Axios 인스턴스 설정 (`baseURL`, 타임아웃 등)
- `src/api/upload.ts`: 업로드 API 호출 (`POST /upload`)
- `public/favicon.svg`: 커스텀 파비콘
- `index.html`: 문서 메타, 파비콘 연결, 루트 마운트

## 🔌 백엔드 연동

- Axios 기본 경로는 `src/api/http.ts`에서 설정합니다.
  - 기본값: `http://localhost:3000/api`
  - 리버스 프록시 사용 시 `'/api'`로 교체해도 됩니다.
- 업로드 엔드포인트: `POST /upload`
  - 폼 필드명: `image` (백엔드 multer 설정과 일치해야 함)
  - 응답 예시 (`src/api/upload.ts`의 `UploadResponse`):
    - `optimizedUrl`: 최종 변환 이미지 URL (예: `...?type=u&w=413&h=531&quality=100`)

## ⚙️ 프론트 동작 요약

- 최대 용량: 40MB (`App.tsx`의 `MAX_SIZE`)
- 지원 형식: JPG, PNG, WebP (브라우저 HEIC 미지원)
- 업로드 즉시:
  - 로컬 미리보기 표시 (FileReader)
  - API 호출 → 백엔드가 준 `optimizedUrl` 그대로 사용
- UI:
  - 결과 URL 입력창은 항상 표시 (업로드 전엔 플레이스홀더/복사 비활성화)
  - 이미지 우클릭으로 저장 안내 문구 제공
  - 업로드 중 `file` 입력 비활성화 처리

## 🚀 시작하기

### 요구 사항

- [Node.js](https://nodejs.org/)와 [Yarn](https://yarnpkg.com/) 설치

### 설치

```bash
yarn install
```

### 개발 서버 실행

```bash
yarn dev
```

브라우저에서 개발 서버 주소(일반적으로 `http://localhost:5173`)로 접속하세요.

### 프로덕션 빌드

```bash
yarn build
yarn preview
```

## 🖼 파비콘

- 커스텀 아이콘: `public/favicon.svg`
- `index.html`에서 `/favicon.svg`로 연결됨

## ✍️ 참고

- 문구와 메타: `index.html`은 한국어(`lang="ko"`), 타이틀/설명도 서비스 목적에 맞게 설정됨
- 사이즈 규격: 여권 사진 413x531으로 변환 (서버에서 생성한 URL을 그대로 사용)

## 🧪 스크립트

- `yarn dev`: 개발 서버 실행
- `yarn build`: 프로덕션 빌드 생성
- `yarn preview`: 빌드 결과 로컬 미리보기
- `yarn lint`: ESLint 실행
- `yarn format`: Prettier 포맷팅
