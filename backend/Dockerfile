# Stage 1: Build the application using Maven
FROM maven:3.9.6-eclipse-temurin-21-alpine AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy the pom.xml and download project dependencies first (for faster rebuilds)
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy the actual source code into the container and build it
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Create a minimal, lightweight runtime image
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Copy the built jar from the builder stage (stage 1) to the runtime image
COPY --from=builder /app/target/*.jar app.jar

# Expose the default internal port
EXPOSE 8080

# Specify the command to run the application
# Note: Render dynamically injects a specific $PORT variable when it hosts your app.
# The server.port flag ensures Spring Boot automatically binds to Render's required port.
CMD ["sh", "-c", "java -Djava.security.egd=file:/dev/./urandom -jar app.jar --server.port=${PORT:-8080}"]
