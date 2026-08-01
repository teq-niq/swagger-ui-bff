# swagger-ui-bff

Custom Swagger UI BFF WebJar that keeps the standard Swagger UI WebJar resource layout so existing consumers can keep resolving `/webjars/swagger-ui/<version>/...` assets.

## Usage

Add the custom WebJar instead of the upstream Swagger UI WebJar:

```xml
<dependency>
  <groupId>io.github.teqniq</groupId>
  <artifactId>swagger-ui-bff</artifactId>
  <version>5.17.14</version>
</dependency>
```

The packaged resources stay available under the standard Swagger UI path:

- `/webjars/swagger-ui/5.17.14/index.html`
- `/webjars/swagger-ui/5.17.14/swagger-ui-bundle.js`

## Build

```bash
mvn test
mvn package
```
