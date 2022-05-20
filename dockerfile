FROM node:16.6.1-alpine3.14

WORKDIR /home/node

COPY . .

RUN yarn add

CMD [ "yarn", "start" ]