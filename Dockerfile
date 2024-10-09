FROM --platform=linux/amd64,linux/arm node:20.18

COPY --chown=node:node src/ /home/node/app/src
COPY --chown=node:node package.json /home/node/app/
COPY --chown=node:node package-lock.json /home/node/app/
COPY --chown=node:node tsconfig.json /home/node/app/
COPY --chown=node:node connector.sh /home/node/app/
COPY --chown=node:node env.defaults /home/node/app/

WORKDIR /home/node/app

RUN chown -R node:node /home/node/app \
    && npm ci \
    && npm run dist \
    && rm -rf /home/node/app/src

USER node

ENTRYPOINT [ "/home/node/app/connector.sh" ]

