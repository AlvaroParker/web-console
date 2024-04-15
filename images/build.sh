#!/bin/bash
set -e

docker build -t customrust:latest -f rust.Dockerfile .
docker build -t custompython:latest -f python.Dockerfile .
docker build -t customc:latest -f gcc.Dockerfile .
docker build -t customcpp:latest -f gpp.Dockerfile .
docker build -t customts:latest -f ts.Dockerfile .
docker build -t customgo:latest -f go.Dockerfile .
