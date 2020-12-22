FROM node:7.5-slim

COPY server.js /server.js

RUN npm install

COPY . /

CMD node /server.js
