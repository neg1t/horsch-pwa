FROM node:20 AS builder

WORKDIR /app

COPY . ./

RUN yarn install --frozen-lockfile

RUN yarn run lint
RUN yarn run ts:check
RUN yarn run test
RUN yarn run build

FROM nginx:1.19.0
WORKDIR /usr/share/nginx/html
RUN rm -rf ./*
COPY --from=builder /app/dist .
ENTRYPOINT ["nginx", "-g", "daemon off;"]