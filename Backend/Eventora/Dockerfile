# Build stage
FROM gradle:8.7-jdk21 AS builder
WORKDIR /app

COPY gradlew ./
COPY gradle/wrapper/gradle-wrapper.jar gradle/wrapper/
COPY gradle/wrapper/gradle-wrapper.properties gradle/wrapper/
COPY settings.gradle* build.gradle* gradle.properties* ./

RUN chmod +x ./gradlew
RUN --mount=type=cache,target=/home/gradle/.gradle ./gradlew --no-daemon help

COPY src ./src

RUN ./gradlew clean bootJar -x test --no-daemon

# Runtime stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
RUN addgroup -S spring && adduser -S spring -G spring
USER spring
COPY --from=builder /app/build/libs/*.jar app.jar

EXPOSE 8080
ENV SPRING_PROFILES_ACTIVE=dev
ENV JAVA_OPTS="-Xms256m -Xmx512m"
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
