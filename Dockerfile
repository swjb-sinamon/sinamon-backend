FROM node:12

EXPOSE 8080

COPY / /workspace
WORKDIR /workspace

RUN yarn && yarn build

VOLUME ["/logs"]

CMD ["node", "./dist/server.js"]
