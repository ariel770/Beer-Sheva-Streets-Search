FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm config set strict-ssl false
RUN npm install

COPY . .

RUN npm run build

EXPOSE 4000

CMD ["npm", "start"]
