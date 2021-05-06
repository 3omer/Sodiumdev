FROM node:14-alpine
WORKDIR /user/app
COPY ["package.json", "npm-shrinkwrap.json" ] .
RUN yarn install --production
COPY . .
CMD ["node", "index.js"]