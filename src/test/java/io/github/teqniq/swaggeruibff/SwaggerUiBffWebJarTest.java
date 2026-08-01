package io.github.teqniq.swaggeruibff;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import org.junit.jupiter.api.Test;

class SwaggerUiBffWebJarTest {

    private static final String RESOURCE_ROOT = "META-INF/resources/webjars/swagger-ui/5.17.14/";

    @Test
    void exposesSwaggerUiResourcesUsingStandardWebJarPath() {
        assertNotNull(resource("swagger-ui-bundle.js"));
        assertNotNull(resource("swagger-ui.css"));
        assertNotNull(resource("swagger-initializer.js"));
    }

    @Test
    void overridesIndexPageForTheBffWebJar() throws IOException {
        try (InputStream inputStream = resource("index.html")) {
            assertNotNull(inputStream);
            String html = new String(inputStream.readAllBytes(), StandardCharsets.UTF_8);
            assertTrue(html.contains("<title>Swagger UI BFF</title>"));
            assertTrue(html.contains("./swagger-ui-bundle.js"));
        }
    }

    private InputStream resource(String fileName) {
        return Thread.currentThread()
                .getContextClassLoader()
                .getResourceAsStream(RESOURCE_ROOT + fileName);
    }
}
