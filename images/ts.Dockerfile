
FROM node:18

WORKDIR /app

RUN npm i -g typescript ts-node

CMD ["ts-node", "index.ts"]
