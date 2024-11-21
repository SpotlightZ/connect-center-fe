# FILEPATH: Dockerfile
FROM --platform=linux/amd64 nginx:mainline-alpine3.18-slim
EXPOSE 80:80
COPY dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
