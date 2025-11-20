FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine

RUN apk add --no-cache gettext

COPY --from=build /app/dist/cosmic-racer-ng/browser /usr/share/nginx/html

COPY nginx.conf.template /etc/nginx/templates/default.conf.template

EXPOSE 8080

CMD sh -c "export PORT=\${PORT:-8080} && envsubst '\$PORT' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"
