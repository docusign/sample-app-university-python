FROM --platform=linux/amd64 node:20.14 AS base

ARG REACT_APP_API_BASE_URL
ENV REACT_APP_API_BASE_URL=$REACT_APP_API_BASE_URL

WORKDIR /app
COPY .env ./
COPY ./client/package.json ./client/yarn.lock ./
RUN npm install

COPY ./client/ .

RUN npm run build

# Run stage
FROM --platform=linux/amd64 nginx:1.23-alpine
COPY --from=base /app/build /var/www/app
COPY ./client/nginx/conf/ /etc/nginx/conf.d
EXPOSE 80 443
