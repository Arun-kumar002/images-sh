docker ps
docker ps -a
docker images
docker image ls
docker image rm image_id

sudo docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' 530143e7e52e