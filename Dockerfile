FROM node:21.6.0

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

WORKDIR /home/node/app

COPY --chown=node:node package.json ./
COPY --chown=node:node tsconfig.json ./
COPY --chown=node:node webpack.dist.js ./
COPY --chown=node:node src/ ./src/

USER node

RUN npm install
RUN npm run dist

RUN rm -rf node_modules; rm -rf src; rm tsconfig.json; rm webpack.dist.js; rm package.json; rm package-lock.json

CMD [ "node", "dist/bundle.js" ]

