FROM node:18-alpine3.15
ENV PORT 8080
EXPOSE 8080

WORKDIR /app
COPY . .

# Install dependencies
RUN npm install
RUN npm run build && npm prune --production

# Run
CMD [ "node", "dist/index.js" ]