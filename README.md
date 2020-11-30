# sinamon-backend

> 수원정보과학고등학교 인트라넷 프로젝트. 백엔드


## 🚀 시작하기

### `yarn start`

- 개발 모드 시작

### `yarn build`

- 백엔드 빌드

### `yarn start:production`

- 프로덕션 모드 시작

### `yarn lint`

- ESLint 검사

## 🐳 Docker

### Docker Build

```bash
docker build . --tag sinamon-backend
````

## ⚙ 환경변수

```env
# 데이터베이스 정보
DATABASE_HOST=
DATABASE_PORT=
DATABASE_USERNAME=
DATABASE_PASSWORD=
DATABASE_DB=

# 프론트엔드 주소
FRONTEND_HOST=

# 로그인 세션 Secret Key
SESSION_SECRET=

# QRCode Secret Key
QR_SECRET=

# 암호화 SALT ROUNDS
BCRYPT_SALT_ROUNDS=

# 날씨, 미세먼지 API KEY
OPENWEATHER_API_KEY=
DUST_API_KEY=

# Redis 정보
REDIS_HOST=
REDIS_PORT=
```

## 📑 Commit Convention

- [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/)
