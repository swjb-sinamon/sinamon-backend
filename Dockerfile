FROM node:12

EXPOSE 8080

COPY / /workspace
WORKDIR /workspace

RUN apt-get update && apt-get install -y libgtk2.0-0 libgtk-3-0 libnotify-dev libgconf-2-4 libnss3 libxss1\
 libasound2 libxtst6 xauth xvfb libgbm-dev
RUN yarn && yarn build

VOLUME ["/logs"]

CMD ["node", "./dist/server.js"]
