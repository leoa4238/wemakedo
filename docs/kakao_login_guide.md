# 카카오 로그인 설정 가이드 (Kakao Login Setup Guide)

카카오 로그인을 작동시키기 위해 **Kakao Developers**와 **Supabase** 대시보드에서 설정이 필요합니다.
이미 코드 구현은 완료되어 있으므로, 이 설정만 마치면 바로 로그인이 가능합니다!

## 1단계: Kakao Developers 설정

1.  [Kakao Developers](https://developers.kakao.com/)에 접속하여 **로그인** 후 **'내 애플리케이션' -> '애플리케이션 추가하기'**를 클릭합니다.
    -   앱 이름: (예: 직장인 소모임)
    -   사업자명: (본인 이름)
2.  생성된 앱으로 들어와서 **'요약 정보'** 메뉴를 확인합니다.
    -   **[REST API 키]**를 복사해둡니다. (나중에 Supabase에서 Client ID로 사용)
3.  좌측 메뉴 **'플랫폼'** -> **'Web 플랫폼 등록'** 클릭.
    -   사이트 도메인 등록:
        -   `http://localhost:3000`
        -   `https://iwaihuxtgscsuhrtamep.supabase.co`
    -   저장.
4.  좌측 메뉴 **'카카오 로그인'** 클릭.
    -   활성화 설정 상태를 **'ON'**으로 변경.
    -   **'Redirect URI 등록'** 클릭 -> 아래 주소 입력 후 저장:
        -   `https://iwaihuxtgscsuhrtamep.supabase.co/auth/v1/callback`
5.  좌측 메뉴 **'카카오 로그인' -> '보안'** 클릭.
    -   **Client Secret** 코드 생성 버튼 클릭 -> 생성.
    -   활성화 상태를 **'사용함'**으로 변경.
    -   **[Client Secret 코드]**를 복사해둡니다. (나중에 Supabase에서 사용)
6.  좌측 메뉴 **'동의항목'** 클릭.
    -   **닉네임 (profile_nickname)**: 필수 동의
    -   **프로필 사진 (profile_image)**: 필수 동의 (선택 사항이지만 UI상 필요)
    -   **이메일 (account_email)**: 선택 동의 (권장)
    -   설정 후 저장.

## 2단계: Supabase 대시보드 설정

1.  Supabase 프로젝트 대시보드로 이동합니다.
2.  좌측 메뉴 **'Authentication' -> 'Providers'** 클릭.
3.  **'Kakao'**를 찾아서 클릭.
4.  설정 입력:
    -   **Enable Kakao**: 켜기 (Enable)
    -   **REST API Key (Client ID)**: 아까 복사한 **[REST API 키]** 붙여넣기.
    -   **Client Secret Code**: 아까 복사한 **[Client Secret 코드]** 붙여넣기.
5.  **Save** 버튼 클릭.

---

## 3단계: 테스트

설정이 완료되었다면:
1.  로컬 서버(`http://localhost:3000/login`)로 접속합니다.
2.  **'카카오 로그인'** 버튼을 클릭합니다.
3.  카카오 동의 화면이 뜨고, 로그인 후 메인 화면으로 돌아오면 성공입니다! 🎉
