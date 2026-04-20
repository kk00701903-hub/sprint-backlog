# GitHub Pages 배포 가이드

## 📋 사전 체크리스트

### ✅ 빌드 검증 결과
| 항목 | 상태 |
|---|---|
| `next build` (루트 배포) | ✅ 성공 |
| `next build` (basePath `/repo-name`) | ✅ 성공 |
| TypeScript 타입 검사 | ✅ 오류 없음 |
| ESLint | ✅ 오류 없음 |
| 정적 페이지 생성 (output: export) | ✅ `dist/` 완성 |
| `.nojekyll` 파일 | ✅ `dist/.nojekyll` 존재 |
| `localStorage` SSR 가드 | ✅ `typeof window` 체크 적용 |
| GitHub Actions workflow | ✅ `.github/workflows/deploy.yml` |

### 📦 빌드 산출물
- **총 크기**: 약 1.9 MB
- **메인 페이지**: 125 kB (First Load JS 213 kB)
- **basePath 자동 설정**: 저장소 이름으로 자동 적용

---

## 🚀 배포 단계

### Step 1. GitHub 저장소 생성

GitHub에서 새 저장소를 만듭니다.
- **권장 저장소 이름**: `fass-sprint-backlog`
- **배포 URL**: `https://{계정명}.github.io/fass-sprint-backlog/`
- Public / Private 모두 가능 (Pages는 Public 저장소에서 무료)

### Step 2. 로컬 프로젝트 Git 초기화 및 Push

```bash
# 프로젝트 폴더로 이동
cd fass_backlog_next

# git 초기화 (이미 되어 있으면 생략)
git init
git add .
git commit -m "feat: FaSS Platform 스프린트 백로그 초기 배포"

# 원격 저장소 연결
git remote add origin https://github.com/{계정명}/fass-sprint-backlog.git

# main 브랜치로 push
git branch -M main
git push -u origin main
```

### Step 3. GitHub Pages 설정

1. GitHub 저장소 페이지 이동
2. **Settings** 탭 클릭
3. 왼쪽 메뉴 **Pages** 클릭
4. **Source** → **GitHub Actions** 선택 (⚠️ `Deploy from a branch` 아님!)
5. 저장

### Step 4. 자동 배포 확인

- `main` 브랜치에 push하면 **Actions** 탭에서 워크플로우 자동 실행
- 약 **2~3분** 후 배포 완료
- 배포 URL: `https://{계정명}.github.io/{저장소명}/`

---

## ⚙️ 워크플로우 동작 방식

```yaml
# .github/workflows/deploy.yml 핵심 로직
- npm ci                                          # 의존성 설치
- NEXT_PUBLIC_BASE_PATH=/{저장소명} npm run build  # basePath 자동 주입
- touch ./dist/.nojekyll                          # Jekyll 처리 방지
- actions/upload-pages-artifact (dist/ 업로드)
- actions/deploy-pages (GitHub Pages 배포)
```

**basePath 자동화**: `${{ github.event.repository.name }}`로 저장소명을 자동 감지하여
`/fass-sprint-backlog` 형태의 경로를 `next.config.mjs`에 주입합니다.

---

## 🔧 트러블슈팅

### ❓ 페이지가 흰 화면으로 뜨는 경우
→ **Settings > Pages > Source** 가 `GitHub Actions`인지 확인

### ❓ Assets(CSS/JS)가 404 오류인 경우
→ `basePath`가 잘못 설정된 것. Actions 로그에서 `NEXT_PUBLIC_BASE_PATH` 값 확인

### ❓ Actions 탭에 워크플로우가 없는 경우
→ `.github/workflows/deploy.yml` 파일이 push됐는지 확인

### ❓ Pages 탭에서 GitHub Actions 옵션이 안 보이는 경우
→ 저장소 Settings > Actions > General에서 Actions가 활성화됐는지 확인

---

## 📁 배포 제외 파일 (.gitignore)

| 항목 | 이유 |
|---|---|
| `node_modules/` | CI에서 `npm ci`로 설치 |
| `dist/` | CI에서 빌드 생성 |
| `.next/` | 로컬 Next.js 캐시 |
| `.env*.local` | 환경변수 보안 |

---

## 📊 프로젝트 정보

| 항목 | 내용 |
|---|---|
| 스프린트 수 | 21개 (주요 17개 + 추가과제 4개) |
| 프레임워크 | Next.js 14 (Static Export) |
| 빌드 출력 | `dist/` |
| 배포 방식 | GitHub Actions → GitHub Pages |
| Node.js 버전 | 20 LTS |
