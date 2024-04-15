FROM golang:1.22

WORKDIR /app

CMD ["go", "run", "main.go"]
