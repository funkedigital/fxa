#!/bin/bash -ex

docker run --network="host" --rm --name proxy -v ~/fxa/_scripts/configs/nginx.conf:/etc/nginx/nginx.conf:ro -p 80:80 nginx
