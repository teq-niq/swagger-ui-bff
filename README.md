# swagger-ui-bff

Build manager for the custom Swagger UI BFF WebJar consumed by bff-demos.

## What this project does

- Downloads upstream Swagger UI for the configured version.
- Overlays local BFF extension sources from swagger-ui-my-bff-extn.
- Runs npm install and npm build on the assembled Swagger UI workspace.
- Packages the built dist output as a WebJar-style Maven jar.

The produced artifact is consumed by bff-demos so the apps serve Swagger UI from classpath resources at the app origin.

## Coordinates used by consumers

- groupId: io.github.teq-niq
- artifactId: swagger-ui-bff
- version: 5.32.8-bff-1.0.0-SNAPSHOT

## Prerequisites

- Java 24+
- Maven 3.9+
- Internet access for downloading upstream swagger-ui tag archive and npm dependencies

Node/npm are managed by frontend-maven-plugin during the build.


