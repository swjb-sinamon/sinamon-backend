FROM node:12

EXPOSE 8080

COPY / /workspace
WORKDIR /workspace

RUN apt update -y && apt upgrade -y && apt install vim -y

RUN yarn
RUN yarn build

VOLUME ["/logs"]

CMD ["node", "./dist/server.js"]
