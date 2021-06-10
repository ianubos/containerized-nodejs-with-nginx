FROM node:15

WORKDIR /home/node/nodejs

USER root

RUN mkdir -p ./node_modules && chown -R node:node ./

COPY ./nodejs/package*.json ./

RUN npm install

USER node

COPY --chown=node:node ./nodejs .

EXPOSE 4000

CMD ["node", "index.js"]


