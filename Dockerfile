FROM node:22-alpine AS dependencies

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS build

WORKDIR /app
ARG VITE_APP_NAME=CoachOS
ARG VITE_APP_ENV=production
ARG VITE_AUTH_API_URL=/auth-api
ARG VITE_ATHLETE_API_URL=/athlete-api
ARG VITE_AI_REVIEW_API_URL=/ai-review-api
ARG VITE_MEDIA_API_URL=/media-api
ENV VITE_APP_NAME=$VITE_APP_NAME \
    VITE_APP_ENV=$VITE_APP_ENV \
    VITE_AUTH_API_URL=$VITE_AUTH_API_URL \
    VITE_ATHLETE_API_URL=$VITE_ATHLETE_API_URL \
    VITE_AI_REVIEW_API_URL=$VITE_AI_REVIEW_API_URL \
    VITE_MEDIA_API_URL=$VITE_MEDIA_API_URL

COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM nginxinc/nginx-unprivileged:1.27-alpine AS runtime

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

USER 101:101
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD ["wget", "-q", "-O", "/dev/null", "http://127.0.0.1:8080/health/live"]
CMD ["nginx", "-g", "daemon off;"]
