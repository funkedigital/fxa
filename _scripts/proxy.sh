#!/bin/bash -ex

docker run --network="host" --rm --name proxy -v ~/fxa/_scripts/configs/nginx.conf:/etc/nginx/nginx.conf:ro -v ~/fxa/_scripts/configs/nginx-self-signed.crt:/etc/nginx/nginx-self-signed.crt:ro -v ~/fxa/_scripts/configs/nginx-self-signed.key:/etc/nginx/nginx-self-signed.key:ro -p 80:80 -p 443:443 nginx
