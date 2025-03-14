FROM nginx:latest
WORKDIR /usr/share/nginx/html
EXPOSE 80

RUN rm -rf ./*

COPY . .

CMD ["nginx", "-g", "daemon off;"]
