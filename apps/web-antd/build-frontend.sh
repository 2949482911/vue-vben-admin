#sh

docker rmi frontend-service xinghuo-registry.cn-beijing.cr.aliyuncs.com/rta/frontend-service

docker build -f Dockerfile --platform linux/amd64 -t frontend-service:latest .

docker tag frontend-service xinghuo-registry.cn-beijing.cr.aliyuncs.com/rta/frontend-service:latest

docker push xinghuo-registry.cn-beijing.cr.aliyuncs.com/rta/frontend-service:latest
