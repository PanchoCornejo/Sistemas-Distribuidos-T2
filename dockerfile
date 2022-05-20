FROM node:16.6.1-alpine3.14 as build-deps
WORKDIR /usr/src/app
COPY . .
RUN yarn build
CMD [ "sudo docker-compose exec kafka /opt/bitnami/kafka/bin/kafka-topics.sh --create --topic quickstart-events --bootstrap-server localhost:9092" ]
CMD [ "sudo docker-compose exec kafka /opt/bitnami/kafka/bin/kafka-topics.sh --create --topic bloqueo --bootstrap-server localhost:9092" ]
CMD [ "yarn", "start:productor" ]
CMD [ "yarn", "start:productor" ]