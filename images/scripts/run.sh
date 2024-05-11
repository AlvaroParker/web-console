#! /bin/sh
set -e

gcc -Wall -Wextra -Wpedantic -o /app/main /app/main.c
/app/main
