FROM gcc:4.9

WORKDIR /app
COPY ./scripts/runcpp.sh /app
RUN chmod +x /app/runcpp.sh

CMD ["./runcpp.sh"]
