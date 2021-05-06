FROM node:14-alpine
WORKDIR /usr/app
COPY package.json npm-shrinkwrap.json ./
RUN npm ci --production
COPY . .
CMD ["node", "index.js"]