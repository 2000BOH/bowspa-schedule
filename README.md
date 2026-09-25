# Bowspa Schedule

GitHub, Vercel, Turso 연결을 확인하기 위한 시작 프로젝트입니다. **현재 일정 조회/편집 앱은 아닙니다.** 기존 저장소가 비어 있어 실제 업무 화면은 아직 구현되지 않았습니다.

## 구성

- `index.html`: 배포 상태 페이지
- `api/health.js`: 서버에서 Turso의 `schedules` 테이블에 읽기 쿼리를 보내는 상태 검사. 일정 행이나 토큰은 응답하지 않습니다.
- `package.json`: Turso libSQL 클라이언트 의존성

## Vercel 설정

1. GitHub 저장소 `2000BOH/bowspa-schedule`을 Vercel 프로젝트로 가져옵니다. Framework Preset은 `Other`, Root Directory는 `.`입니다.
2. 프로젝트의 Environment Variables에 아래 두 값을 Production, Preview, Development 대상으로 등록합니다.
   - `TURSO_DATABASE_URL` = `libsql://bowspa-schedule-2000boh.aws-ap-northeast-1.turso.io`
   - `TURSO_AUTH_TOKEN` = Turso에서 해당 DB에 발급한 **읽기 전용** 토큰 (GitHub에 커밋하지 말 것)
3. 배포 후 `/api/health`가 HTTP 200 및 `status: connected`를 반환하고 홈 화면에 'Turso 데이터베이스 연결 정상'이 보이면 연결 성공입니다.

이 토큰은 1년 만료로 발급되었습니다. 만료되거나 노출되면 Turso에서 새 토큰을 만들고 Vercel 환경 변수 값을 교체한 뒤 재배포하세요.

## 보안과 다음 단계

- 이 저장소는 공개되어 있습니다. 토큰은 Vercel 서버 환경 변수에만 저장합니다.
- 현재 토큰은 읽기 전용이며 공개 API에서 일정 데이터나 행 수를 반환하지 않습니다.
- 실제 일정 조회/수정 기능을 만들 때는 먼저 사용자 인증과 권한을 설계하고, 수정용 토큰을 서버 측에서만 사용하세요. 공개 쓰기 API를 만들지 마세요.
- 기존 앱 코드가 따로 있다면 이 저장소에 합치거나 해당 저장소를 알려주세요. 일정 화면의 요구사항과 접근 권한을 정한 다음 기능을 구현할 수 있습니다.
