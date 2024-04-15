FROM gcc:4.9

WORKDIR /app
COPY ./scripts/run.sh /app
RUN chmod +x /app/run.sh

CMD ["./run.sh"]
