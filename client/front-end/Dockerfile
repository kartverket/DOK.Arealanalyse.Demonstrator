FROM node:22-alpine AS build
WORKDIR /app
COPY . .
RUN corepack enable && corepack prepare yarn@4.18.1 \
    && yarn install --immutable \
    && yarn build

FROM nginx:latest
COPY --from=build /app/dist /usr/share/nginx/html
# nginx-imaget lager /etc/nginx/conf.d/default.conf fra malen med envsubst ved oppstart
COPY nginx.conf.template /etc/nginx/templates/default.conf.template

ENV FILE_SHARE_ENABLED=false

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
