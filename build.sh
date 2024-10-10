#!/usr/bin/env sh

docker build --platform=linux/amd64 -t spinoco/connector:latest -t spinoco/connector:$1 .