FROM node:18-alpine3.15
ENV PORT 8080
ENV CONTAINERIZED true
EXPOSE 8080

WORKDIR /app
COPY . .

# Install dependencies
RUN npm install
RUN npm run build && npm prune --production

# Install prisma
RUN npm run prisma:generate

# Run
CMD [ "node", "dist/index.js" ]