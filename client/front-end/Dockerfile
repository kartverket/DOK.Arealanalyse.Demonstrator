FROM node:22-alpine AS build
WORKDIR /app
COPY . .
RUN corepack enable && corepack prepare yarn@4.9.2 \
    && yarn install --immutable \
    && yarn build
	
FROM nginx:1.27.3-alpine-slim
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
