#!/bin/sh
until nc -z -v -w30 db 3306
do
  echo "Waiting for database connection..."
  sleep 5
done
java -jar /app/vscode4teaching-server-0.1.0-SNAPSHOT.jar