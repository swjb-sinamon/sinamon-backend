FROM node:12

EXPOSE 8080

COPY / /workspace
WORKDIR /workspace

RUN apt-get update -y && apt-get upgrade -y && apt-get install vim -y

RUN yarn
RUN yarn build

VOLUME ["/logs"]

CMD ["node", "./dist/server.js"]
