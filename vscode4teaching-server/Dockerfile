FROM openjdk:8-jdk-alpine
COPY ./target/vscode4teaching-server-1.0.16.jar /app/vscode4teaching-server-1.0.16.jar
COPY ./docker/waitDB.sh /app/waitDB.sh
EXPOSE 8080
RUN ["chmod", "+x", "/app/waitDB.sh"]
CMD ["/app/waitDB.sh"]