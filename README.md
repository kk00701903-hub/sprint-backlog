# FaSS Platform — 스프린트 백로그

> (주)제때 차세대 웹프레임워크 **FaSS Platform** 개발 표준 가이드라인 기반 스프린트 관리 대시보드

[![Deploy to GitHub Pages](https://github.com/{YOUR_USERNAME}/fass-sprint-backlog/actions/workflows/deploy.yml/badge.svg)](https://github.com/{YOUR_USERNAME}/fass-sprint-backlog/actions/workflows/deploy.yml)

---

## 🚀 GitHub Pages 배포 방법

### 1. 저장소 생성 및 push

```bash
# 원격 저장소 연결 (저장소 이름: fass-sprint-backlog 권장)
git remote add origin https://github.com/{계정명}/fass-sprint-backlog.git
git push -u origin main
```

### 2. GitHub Pages 활성화

1. GitHub 저장소 → **Settings** → **Pages**
2. **Source**: `GitHub Actions` 선택
3. main 브랜치에 push 시 자동 배포

### 3. 배포 URL

```
https://{계정명}.github.io/fass-sprint-backlog/
```

> **저장소 이름이 다른 경우** → Actions 워크플로우가 자동으로 `basePath`를 맞춰줍니다.

---

## 기술 스택

| 분류 | 기술 |
|---|---|
| 프레임워크 | Next.js 14 (App Router, Static Export) |
| 언어 | TypeScript 5 |
| 스타일 | Tailwind CSS 3 |
| 상태 관리 | Zustand 5 |
| 서버 상태 | TanStack Query v5 |
| HTTP | Axios |
| 애니메이션 | Framer Motion |
| 아이콘 | Lucide React |
| 폰트 | Noto Sans KR · Inter · JetBrains Mono |
| 배포 | GitHub Pages (Actions 자동 배포) |

---

## 프로젝트 구조

```
fass_backlog_next/
├── .github/
│   └── workflows/
│       └── deploy.yml      # GitHub Actions 자동 배포
├── app/
│   ├── layout.tsx          # 루트 레이아웃
│   ├── page.tsx            # 메인 백로그 페이지
│   └── globals.css         # 글로벌 스타일 + CSS 변수
├── components/
│   ├── Badges.tsx          # StatusBadge / PriorityBadge / ApprovalBadge
│   ├── FilterBar.tsx       # 필터 (상태·우선순위·Phase·검색)
│   ├── SaveBar.tsx         # 하단 플로팅 저장 바
│   ├── SidebarNav.tsx      # 좌측 Phase별 내비게이션
│   ├── SprintCard.tsx      # 스프린트 카드 (그리드 뷰)
│   ├── SprintDetailPanel.tsx # 스프린트 상세 패널
│   ├── SprintGrid.tsx      # 스프린트 목록 (그리드/리스트)
│   └── StatsHeader.tsx     # 전체 통계 헤더
├── data/
│   └── index.ts            # 21개 스프린트 데이터 (주요 17개 + 추가과제 4개)
├── hooks/
│   └── useSprintFilter.ts  # 필터·저장·진행률 훅
├── lib/
│   ├── index.ts            # 타입 정의
│   ├── motion.ts           # Framer Motion 프리셋
│   └── utils.ts            # cn() 유틸
├── public/
│   └── .nojekyll           # GitHub Pages Jekyll 처리 방지
├── next.config.mjs         # basePath / assetPrefix 자동 설정
├── tailwind.config.ts      # FaSS 디자인 토큰
└── tsconfig.json
```

---

## 로컬 개발

```bash
# 의존성 설치
npm install

# 개발 서버 (http://localhost:3000)
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 결과 확인
npx serve dist
```

---

## 주요 기능

### 📋 스프린트 백로그 (총 21개 — 주요 17개 + 추가과제 4개)

| 구분 | Phase | 스프린트 |
|---|---|---|
| **주요** | Phase 0 | 개발환경·공통인프라 |
| **주요** | Phase 1 | 인증/보안·SSO·권한관리 |
| **주요** | Phase 2 | 공통프레임워크·상태관리·멀티컴퍼니·UI컴포넌트·비즈니스컴포넌트·데이터보안·APIM·AI연동 |
| **주요** | Phase 3 | 외부인터페이스·CDC·명명규칙·SSR/RSC |
| 🔶 **추가과제** | — | MSA 전환 로드맵·표준 라이브러리 골든셋·SCA 도입·BI 대시보드 |

### 🔄 상태 관리

- **진행 상태**: TODO → 진행 중 → 완료 (클릭 순환, 하위→상위 자동 연동)
- **승인 상태**: 승인 → 보류 → 반려 (스프린트·스토리·태스크 개별)
- **localStorage 영구 저장**: 새로고침 후에도 유지

---

## 브랜치 전략

```
main          ← 운영 (GitHub Pages 자동 배포)
develop       ← 통합 개발
feature/xxx   ← 기능 개발
hotfix/xxx    ← 긴급 수정
```

---

## 라이선스

(주)제때 내부 개발 전용

## 팀

| 역할 | 이름 |
|---|---|
| PL | 기충영 |
| PE | 심지훈, 김희찬, 송민준, 이지상, 오준열 |
