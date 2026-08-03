# Build stage
FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

# Fix possible non-executable binaries inside some Docker FS layers
# (tsc/vite entrypoints are sometimes copied with non-exec perms)
RUN chmod -R a+rx node_modules/.bin || true
RUN chmod +x node_modules/.bin/tsc || true
RUN chmod +x node_modules/.bin/tsc.cmd 2>/dev/null || true
RUN chmod +x node_modules/.bin/vite || true

COPY . .
RUN npm run build

# Production serve stage (using Nginx)
FROM nginx:stable-alpine

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

