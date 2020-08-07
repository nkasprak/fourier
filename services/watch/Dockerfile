FROM node:latest

WORKDIR /opt/project

RUN apt-get update 

RUN npm install -g webpack
RUN npm install -g webpack-cli

ENTRYPOINT npx webpack