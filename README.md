# webhello

Simple hello world fullstack with opentelemetry using:
- react front end
- java spring boot backend
- aspire as Otel collector

## Getting started
To run frontend:

    cd frontend/
    npm install
    npm start

To start the backend:
First if you don't have the open telemetry agent you need install it via:
    
    curl -L -o opentelemetry-javaagent.jar https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases/latest/download/opentelemetry-javaagent.jar

Then you can use it via:

    $env:JAVA_TOOL_OPTIONS = "-javaagent:opentelemetry-javaagent.jar"
    mvn spring-boot:run


To run Aspire dashboard:

        docker compose up

This will start the dashboard on localhost:18888