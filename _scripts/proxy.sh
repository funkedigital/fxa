#!/bin/bash -ex

docker run --rm --name proxy -p 80:80 nginx
