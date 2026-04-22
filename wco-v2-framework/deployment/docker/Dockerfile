FROM node:18-slim
WORKDIR /usr/src/app
COPY . .
RUN npm ci --only=production || true
EXPOSE 3000
CMD ["node", "wco-v2-framework/node/bootstrap.js"]
