# 生产阶段
FROM docker.1ms.run/nginx:alpine

COPY web.starfiread.com.pem /etc/nginx/ssl/web.starfiread.com.pem
COPY web.starfiread.com.key /etc/nginx/ssl/web.starfiread.com.key
# 复制构建产物到Nginx
COPY dist/ /usr/share/nginx/html
# 复制自定义Nginx配置
COPY nginx.conf /etc/nginx/conf.d/default.conf
# 暴露端口
EXPOSE 80 443
# 启动Nginx
CMD ["nginx", "-g", "daemon off;"]
