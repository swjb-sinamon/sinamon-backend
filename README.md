# sinamon-backend

![Nodejs](https://img.shields.io/badge/node.js%20-%2343853D.svg?logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript%20-%23007ACC.svg?logo=typescript&logoColor=white)
![Express](https://img.shields.io/badge/express.js%20-%23404d59.svg)
[![CodeFactor](https://www.codefactor.io/repository/github/swjb-sinamon/sinamon-backend/badge)](https://www.codefactor.io/repository/github/swjb-sinamon/sinamon-backend)

## 🐳 Docker

### Docker Build

```bash
docker build . --tag sinamon-backend
```

### Deploy with Docker

1. 수정과 서버에 접속합니다.
2. `deploy-backend.sh` 스크립트를 실행합니다.

## ⚙ 환경변수

```shell
cp .env.example .env
```

- 수정과 백엔드 문서 참고

## ✨ 기여하기

- [수정과 컨벤션에 대해 알아보기](https://www.notion.so/430ec87ea80e469a8bcbdb26142cc32c)

## 안내사항

해당 코드에는 [컴시간 알리미](http://컴시간학생.kr) 를 파싱하는 코드가 포함되어 있습니다. 해당 코드를 사용하여 생기는 문제에 대하여 수정과는 책임을 지지 않습니다. 컴시간측으로 가는 부하를 줄이기 위해 일정 시간(4시간 이상)마다 파싱하는 방식으로 작동됩니다.
