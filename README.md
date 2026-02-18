# 직장인 소모임/커뮤니티 서비스 (Gathering App)

직장인들을 위한 오프라인 소모임 및 커뮤니티 웹 애플리케이션 MVP입니다.
사용자는 관심사 기반의 모임을 개설하고, 위치 기반으로 주변 모임을 탐색하여 참여할 수 있습니다.

![Project Status](https://img.shields.io/badge/status-MVP_Completed-success)

## 🚀 주요 기능 (Key Features)

*   **인증 (Authentication)**
    *   소셜 로그인 (Kakao, Google)
    *   이메일 회원가입 및 로그인
    *   회원가입 시 프로필 자동 생성

*   **모임 (Gatherings)**
    *   모임 개설 (제목, 내용, 일시, 정원, 이미지 등)
    *   모임 목록 조회 & 상세 조회
    *   모임 참여하기 (Join) / 참여 현황 확인

*   **위치 기반 (Location-Based)**
    *   **주소 검색:** 모임 생성 시 'Daum 우편번호 서비스'를 이용한 주소 검색
    *   **자동 좌표 변환:** 주소 선택 시 OpenStreetMap API를 통해 위도/경도 자동 저장
    *   **내 주변 모임 찾기:** 현재 위치를 기준으로 가까운 순서대로 모임 정렬

*   **커뮤니티 (Community) - [NEW]**
    *   **참여 승인 시스템:** 호스트 승인 후 참여 확정 (승인/거절/취소 관리)
    *   **댓글 (Comments):** 모임 상세 페이지에서 문의/기대평 남기기
    *   **찜하기 (Likes):** 관심 있는 모임 즐겨찾기 (하트 버튼)

*   **탐색 및 관리 (Discovery & Management) - [NEW]**
    *   **검색 & 필터:** 키워드 검색, 카테고리별 모아보기, 모집 상태 필터
    *   **지도 보기:** 지도 상에서 내 주변 모임 위치 확인 (Map View)
    *   **마이페이지:** 내가 만든 모임, 참여한 모임, 찜한 모임 통합 관리
    *   **모임 관리:** 호스트의 모임 삭제 및 참여자 관리 기능

*   **UI/UX**
    *   모바일 친화적인 반응형 디자인
    *   다크 모드 지원 (시스템 설정 따름)

## 🛠 기술 스택 (Tech Stack)

*   **Framework:** Next.js 14+ (App Router)
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS, Shadcn UI
*   **Backend / DB:** Supabase (PostgreSQL, Auth)
*   **Deployment:** Vercel (Recommended)
*   **External APIs:**
    *   OpenStreetMap (Nominatim) - Geocoding
    *   Daum Postcode - 주소 검색

## 🏁실행 방법 (Getting Started)

### 1. 프로젝트 클론 및 패키지 설치
```bash
git clone https://github.com/leoa4238/wemakedo.git
cd wemakedo
npm install
```

### 2. 환경 변수 설정 (.env.local)
프로젝트 루트에 `.env.local` 파일을 생성하고 Supabase 키를 입력합니다.

```env
NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

### 3. 데이터베이스 설정 (Supabase)
Supabase SQL Editor에서 `migrations/` 폴더 내의 스크립트를 순서대로 실행하거나, 아래 내용을 적용해야 합니다.

1.  **초기 스키마 및 트리거 (필수):** `migrations/fix_user_creation.sql`
    *   *참고:* `schema.sql`은 전체 스키마 참조용입니다.
2.  **위치 기능 컬럼 추가:** `migrations/add_location_columns.sql`
3.  **커뮤니티 기능 추가:** `migrations/add_community_features.sql`
4.  **참여 승인 시스템:** `migrations/add_approval_system.sql`
5.  **모임 삭제 정책(선택):** `migrations/fix_delete_policy.sql`

### 4. 개발 서버 실행
```bash
npm run dev
```
브라우저에서 `http://localhost:3000` 접속.

## 📁 프로젝트 구조

```
├── app/                  # Next.js App Router (Pages & API)
│   ├── gatherings/       # 모임 관련 페이지 & 액션
│   ├── login/            # 로그인 페이지 & 액션
│   ├── signup/           # 회원가입 페이지
│   └── page.tsx          # 메인 페이지
├── components/           # 재사용 가능한 UI 컴포넌트
│   ├── ui/               # Shadcn UI 컴포넌트
│   └── ...
├── lib/                  # 유틸리티 함수
├── migrations/           # DB 마이그레이션 SQL 스크립트
├── types/                # TypeScript 타입 정의 (DB Schema 등)
└── utils/                # Supabase 클라이언트 설정
```

## 📝 라이선스
MIT License
