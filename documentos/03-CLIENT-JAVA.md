# ConfigHub - SDK Java

## 📦 Estrutura do Projeto

```
sdk-java/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/confighub/sdk/
│   │   │       ├── ConfigHubClient.java
│   │   │       ├── ConfigHubClientBuilder.java
│   │   │       ├── ConfigCache.java
│   │   │       ├── model/
│   │   │       │   ├── Configuration.java
│   │   │       │   ├── Secret.java
│   │   │       │   └── ConfigResponse.java
│   │   │       ├── exception/
│   │   │       │   ├── ConfigHubException.java
│   │   │       │   └── AuthenticationException.java
│   │   │       └── http/
│   │   │           ├── HttpClient.java
│   │   │           └── RetryPolicy.java
│   │   └── resources/
│   │       └── META-INF/
│   │           └── services/
│   └── test/
│       └── java/
│           └── com/confighub/sdk/
├── pom.xml
└── README.md
```

---

## 📦 pom.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
         https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    
    <groupId>com.confighub</groupId>
    <artifactId>confighub-sdk-java</artifactId>
    <version>1.0.0</version>
    <packaging>jar</packaging>
    
    <name>ConfigHub Java SDK</name>
    <description>Java client library for ConfigHub</description>
    <url>https://github.com/confighub/confighub</url>
    
    <licenses>
        <license>
            <name>MIT License</name>
            <url>https://opensource.org/licenses/MIT</url>
        </license>
    </licenses>
    
    <properties>
        <java.version>17</java.version>
        <maven.compiler.source>17</maven.compiler.source>
        <maven.compiler.target>17</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    </properties>
    
    <dependencies>
        <!-- OkHttp for HTTP client -->
        <dependency>
            <groupId>com.squareup.okhttp3</groupId>
            <artifactId>okhttp</artifactId>
            <version>4.12.0</version>
        </dependency>
        
        <!-- Jackson for JSON -->
        <dependency>
            <groupId>com.fasterxml.jackson.core</groupId>
            <artifactId>jackson-databind</artifactId>
            <version>2.16.1</version>
        </dependency>
        
        <dependency>
            <groupId>com.fasterxml.jackson.datatype</groupId>
            <artifactId>jackson-datatype-jsr310</artifactId>
            <version>2.16.1</version>
        </dependency>
        
        <!-- Caffeine for caching -->
        <dependency>
            <groupId>com.github.ben-manes.caffeine</groupId>
            <artifactId>caffeine</artifactId>
            <version>3.1.8</version>
        </dependency>
        
        <!-- SLF4J -->
        <dependency>
            <groupId>org.slf4j</groupId>
            <artifactId>slf4j-api</artifactId>
            <version>2.0.9</version>
        </dependency>
        
        <!-- Testing -->
        <dependency>
            <groupId>org.junit.jupiter</groupId>
            <artifactId>junit-jupiter</artifactId>
            <version>5.10.1</version>
            <scope>test</scope>
        </dependency>
        
        <dependency>
            <groupId>org.mockito</groupId>
            <artifactId>mockito-core</artifactId>
            <version>5.8.0</version>
            <scope>test</scope>
        </dependency>
    </dependencies>
    
    <build>
        <plugins>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-compiler-plugin</artifactId>
                <version>3.11.0</version>
            </plugin>
            
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-source-plugin</artifactId>
                <version>3.3.0</version>
                <executions>
                    <execution>
                        <id>attach-sources</id>
                        <goals>
                            <goal>jar</goal>
                        </goals>
                    </execution>
                </executions>
            </plugin>
            
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-javadoc-plugin</artifactId>
                <version>3.6.3</version>
                <executions>
                    <execution>
                        <id>attach-javadocs</id>
                        <goals>
                            <goal>jar</goal>
                        </goals>
                    </execution>
                </executions>
            </plugin>
        </plugins>
    </build>
</project>
```

---

## 🎯 ConfigHubClient.java

```java
package com.confighub.sdk;

import com.confighub.sdk.exception.ConfigHubException;
import com.confighub.sdk.model.Configuration;
import com.confighub.sdk.model.ConfigResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import okhttp3.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.TimeUnit;

/**
 * Main client for interacting with ConfigHub API
 */
public class ConfigHubClient implements AutoCloseable {
    
    private static final Logger log = LoggerFactory.getLogger(ConfigHubClient.class);
    private static final MediaType JSON = MediaType.get("application/json; charset=utf-8");
    
    private final String baseUrl;
    private final String apiKey;
    private final OkHttpClient httpClient;
    private final ObjectMapper objectMapper;
    private final ConfigCache cache;
    private final boolean cacheEnabled;
    
    ConfigHubClient(String baseUrl, String apiKey, Duration timeout, 
                    boolean cacheEnabled, Duration cacheTtl) {
        this.baseUrl = baseUrl.endsWith("/") ? baseUrl : baseUrl + "/";
        this.apiKey = apiKey;
        this.cacheEnabled = cacheEnabled;
        
        this.httpClient = new OkHttpClient.Builder()
                .connectTimeout(timeout)
                .readTimeout(timeout)
                .writeTimeout(timeout)
                .addInterceptor(chain -> {
                    Request original = chain.request();
                    Request request = original.newBuilder()
                            .header("X-API-Key", apiKey)
                            .header("User-Agent", "ConfigHub-Java-SDK/1.0.0")
                            .build();
                    return chain.proceed(request);
                })
                .build();
        
        this.objectMapper = new ObjectMapper()
                .registerModule(new JavaTimeModule());
        
        this.cache = cacheEnabled ? new ConfigCache(cacheTtl) : null;
        
        log.info("ConfigHub client initialized for {}", baseUrl);
    }
    
    /**
     * Get all configurations for an application and environment
     * 
     * @param appName Application name
     * @param environment Environment name (dev, staging, production)
     * @return Map of configuration key-value pairs
     * @throws ConfigHubException if request fails
     */
    public Map<String, Object> getConfigurations(String appName, String environment) 
            throws ConfigHubException {
        return getConfigurations(appName, environment, true);
    }
    
    /**
     * Get configurations with option to include encrypted values
     * 
     * @param appName Application name
     * @param environment Environment name
     * @param includeValues Whether to include decrypted values
     * @return Map of configurations
     * @throws ConfigHubException if request fails
     */
    public Map<String, Object> getConfigurations(String appName, String environment, 
                                                  boolean includeValues) 
            throws ConfigHubException {
        
        String cacheKey = String.format("%s:%s:%b", appName, environment, includeValues);
        
        // Check cache first
        if (cacheEnabled && cache != null) {
            Map<String, Object> cached = cache.get(cacheKey);
            if (cached != null) {
                log.debug("Cache hit for {}", cacheKey);
                return cached;
            }
        }
        
        String url = String.format("%sapi/v1/configurations/app/%s/env/%s?includeValues=%b",
                baseUrl, appName, environment, includeValues);
        
        Request request = new Request.Builder()
                .url(url)
                .get()
                .build();
        
        try (Response response = httpClient.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                throw new ConfigHubException(
                        String.format("Failed to fetch configurations: %s", response.message()));
            }
            
            String body = response.body().string();
            @SuppressWarnings("unchecked")
            Map<String, Object> configs = objectMapper.readValue(body, Map.class);
            
            // Cache the result
            if (cacheEnabled && cache != null) {
                cache.put(cacheKey, configs);
            }
            
            log.info("Retrieved {} configurations for {}:{}", 
                    configs.size(), appName, environment);
            
            return configs;
            
        } catch (IOException e) {
            throw new ConfigHubException("Failed to fetch configurations", e);
        }
    }
    
    /**
     * Get a single configuration value
     * 
     * @param appName Application name
     * @param environment Environment name
     * @param key Configuration key
     * @return Configuration value or null if not found
     * @throws ConfigHubException if request fails
     */
    public String getConfig(String appName, String environment, String key) 
            throws ConfigHubException {
        Map<String, Object> configs = getConfigurations(appName, environment, true);
        Object value = configs.get(key);
        return value != null ? value.toString() : null;
    }
    
    /**
     * Get a configuration with type conversion
     * 
     * @param appName Application name
     * @param environment Environment name
     * @param key Configuration key
     * @param defaultValue Default value if not found
     * @return Configuration value or default
     */
    public String getConfig(String appName, String environment, String key, String defaultValue) {
        try {
            String value = getConfig(appName, environment, key);
            return value != null ? value : defaultValue;
        } catch (ConfigHubException e) {
            log.warn("Failed to get config {}:{}, using default", key, e.getMessage());
            return defaultValue;
        }
    }
    
    /**
     * Get integer configuration
     */
    public Integer getIntConfig(String appName, String environment, String key, Integer defaultValue) {
        String value = getConfig(appName, environment, key, null);
        if (value == null) return defaultValue;
        
        try {
            return Integer.parseInt(value);
        } catch (NumberFormatException e) {
            log.warn("Config {} is not a valid integer, using default", key);
            return defaultValue;
        }
    }
    
    /**
     * Get boolean configuration
     */
    public Boolean getBooleanConfig(String appName, String environment, String key, Boolean defaultValue) {
        String value = getConfig(appName, environment, key, null);
        return value != null ? Boolean.parseBoolean(value) : defaultValue;
    }
    
    /**
     * Refresh cache for specific app/environment
     */
    public void refreshCache(String appName, String environment) throws ConfigHubException {
        if (cache != null) {
            String cacheKey = String.format("%s:%s:true", appName, environment);
            cache.invalidate(cacheKey);
            getConfigurations(appName, environment, true);
        }
    }
    
    /**
     * Clear all cached configurations
     */
    public void clearCache() {
        if (cache != null) {
            cache.invalidateAll();
            log.info("Cache cleared");
        }
    }
    
    @Override
    public void close() {
        httpClient.dispatcher().executorService().shutdown();
        httpClient.connectionPool().evictAll();
        if (cache != null) {
            cache.invalidateAll();
        }
        log.info("ConfigHub client closed");
    }
}
```

---

## 🏗️ ConfigHubClientBuilder.java

```java
package com.confighub.sdk;

import java.time.Duration;

/**
 * Builder for ConfigHubClient
 */
public class ConfigHubClientBuilder {
    
    private String baseUrl;
    private String apiKey;
    private Duration timeout = Duration.ofSeconds(30);
    private boolean cacheEnabled = true;
    private Duration cacheTtl = Duration.ofMinutes(5);
    
    /**
     * Set the ConfigHub server URL
     */
    public ConfigHubClientBuilder baseUrl(String baseUrl) {
        this.baseUrl = baseUrl;
        return this;
    }
    
    /**
     * Set the API key for authentication
     */
    public ConfigHubClientBuilder apiKey(String apiKey) {
        this.apiKey = apiKey;
        return this;
    }
    
    /**
     * Set HTTP timeout
     */
    public ConfigHubClientBuilder timeout(Duration timeout) {
        this.timeout = timeout;
        return this;
    }
    
    /**
     * Enable or disable caching
     */
    public ConfigHubClientBuilder cacheEnabled(boolean enabled) {
        this.cacheEnabled = enabled;
        return this;
    }
    
    /**
     * Set cache TTL (time to live)
     */
    public ConfigHubClientBuilder cacheTtl(Duration ttl) {
        this.cacheTtl = ttl;
        return this;
    }
    
    /**
     * Build the ConfigHubClient
     */
    public ConfigHubClient build() {
        if (baseUrl == null || baseUrl.isEmpty()) {
            throw new IllegalArgumentException("Base URL is required");
        }
        if (apiKey == null || apiKey.isEmpty()) {
            throw new IllegalArgumentException("API Key is required");
        }
        
        return new ConfigHubClient(baseUrl, apiKey, timeout, cacheEnabled, cacheTtl);
    }
}
```

---

## 💾 ConfigCache.java

```java
package com.confighub.sdk;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;

import java.time.Duration;
import java.util.Map;

/**
 * Cache for configuration values
 */
class ConfigCache {
    
    private final Cache<String, Map<String, Object>> cache;
    
    ConfigCache(Duration ttl) {
        this.cache = Caffeine.newBuilder()
                .expireAfterWrite(ttl)
                .maximumSize(1000)
                .recordStats()
                .build();
    }
    
    Map<String, Object> get(String key) {
        return cache.getIfPresent(key);
    }
    
    void put(String key, Map<String, Object> value) {
        cache.put(key, value);
    }
    
    void invalidate(String key) {
        cache.invalidate(key);
    }
    
    void invalidateAll() {
        cache.invalidateAll();
    }
}
```

---

## 🔧 Spring Boot Integration

### ConfigHubAutoConfiguration.java

```java
package com.confighub.sdk.spring;

import com.confighub.sdk.ConfigHubClient;
import com.confighub.sdk.ConfigHubClientBuilder;
import org.springframework.boot.autoconfigure.condition.ConditionalOnClass;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;

@Configuration
@ConditionalOnClass(ConfigHubClient.class)
@EnableConfigurationProperties(ConfigHubProperties.class)
public class ConfigHubAutoConfiguration {
    
    @Bean
    @ConditionalOnMissingBean
    public ConfigHubClient configHubClient(ConfigHubProperties properties) {
        return new ConfigHubClientBuilder()
                .baseUrl(properties.getBaseUrl())
                .apiKey(properties.getApiKey())
                .timeout(Duration.ofSeconds(properties.getTimeoutSeconds()))
                .cacheEnabled(properties.isCacheEnabled())
                .cacheTtl(Duration.ofMinutes(properties.getCacheTtlMinutes()))
                .build();
    }
}
```

### ConfigHubProperties.java

```java
package com.confighub.sdk.spring;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "confighub")
public class ConfigHubProperties {
    
    private String baseUrl;
    private String apiKey;
    private int timeoutSeconds = 30;
    private boolean cacheEnabled = true;
    private int cacheTtlMinutes = 5;
    
    // Getters and Setters
    public String getBaseUrl() { return baseUrl; }
    public void setBaseUrl(String baseUrl) { this.baseUrl = baseUrl; }
    
    public String getApiKey() { return apiKey; }
    public void setApiKey(String apiKey) { this.apiKey = apiKey; }
    
    public int getTimeoutSeconds() { return timeoutSeconds; }
    public void setTimeoutSeconds(int timeoutSeconds) { this.timeoutSeconds = timeoutSeconds; }
    
    public boolean isCacheEnabled() { return cacheEnabled; }
    public void setCacheEnabled(boolean cacheEnabled) { this.cacheEnabled = cacheEnabled; }
    
    public int getCacheTtlMinutes() { return cacheTtlMinutes; }
    public void setCacheTtlMinutes(int cacheTtlMinutes) { this.cacheTtlMinutes = cacheTtlMinutes; }
}
```

---

## 📚 Usage Examples

### Basic Usage

```java
import com.confighub.sdk.ConfigHubClient;
import com.confighub.sdk.ConfigHubClientBuilder;

public class Example {
    public static void main(String[] args) {
        // Create client
        try (ConfigHubClient client = new ConfigHubClientBuilder()
                .baseUrl("https://config.yourcompany.com")
                .apiKey("your-api-key")
                .build()) {
            
            // Get all configurations
            Map<String, Object> configs = client.getConfigurations("vendax", "production");
            
            // Get specific config
            String dbUrl = client.getConfig("vendax", "production", "database.url");
            
            // Get with default value
            Integer maxConnections = client.getIntConfig(
                "vendax", "production", "database.maxConnections", 10
            );
            
            // Use configurations
            System.out.println("Database URL: " + dbUrl);
            System.out.println("Max Connections: " + maxConnections);
            
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
```

### Spring Boot Integration

```yaml
# application.yml
confighub:
  base-url: https://config.yourcompany.com
  api-key: ${CONFIGHUB_API_KEY}
  cache-enabled: true
  cache-ttl-minutes: 5
  timeout-seconds: 30
```

```java
@Service
public class MyService {
    
    private final ConfigHubClient configHub;
    
    @Autowired
    public MyService(ConfigHubClient configHub) {
        this.configHub = configHub;
    }
    
    public void doSomething() {
        String apiEndpoint = configHub.getConfig(
            "my-app", "production", "external.api.endpoint"
        );
        
        // Use the configuration
        callExternalApi(apiEndpoint);
    }
}
```

### Environment-specific Configuration

```java
@Configuration
public class DatabaseConfig {
    
    @Autowired
    private ConfigHubClient configHub;
    
    @Value("${spring.application.name}")
    private String appName;
    
    @Value("${spring.profiles.active}")
    private String environment;
    
    @Bean
    public DataSource dataSource() {
        String url = configHub.getConfig(appName, environment, "database.url");
        String username = configHub.getConfig(appName, environment, "database.username");
        String password = configHub.getConfig(appName, environment, "database.password");
        
        HikariConfig config = new HikariConfig();
        config.setJdbcUrl(url);
        config.setUsername(username);
        config.setPassword(password);
        
        return new HikariDataSource(config);
    }
}
```

---

## 🧪 Testing

```java
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class ConfigHubClientTest {
    
    @Test
    void testGetConfiguration() {
        ConfigHubClient client = new ConfigHubClientBuilder()
                .baseUrl("http://localhost:8080")
                .apiKey("test-api-key")
                .cacheEnabled(false)
                .build();
        
        Map<String, Object> configs = client.getConfigurations("test-app", "dev");
        assertNotNull(configs);
        
        client.close();
    }
    
    @Test
    void testCaching() {
        ConfigHubClient client = new ConfigHubClientBuilder()
                .baseUrl("http://localhost:8080")
                .apiKey("test-api-key")
                .cacheEnabled(true)
                .build();
        
        // First call - should hit API
        client.getConfigurations("test-app", "dev");
        
        // Second call - should use cache
        client.getConfigurations("test-app", "dev");
        
        client.close();
    }
}
```

---

## 📦 Publishing to Maven Central

### settings.xml
```xml
<settings>
  <servers>
    <server>
      <id>ossrh</id>
      <username>${env.MAVEN_USERNAME}</username>
      <password>${env.MAVEN_PASSWORD}</password>
    </server>
  </servers>
</settings>
```

### Deploy Command
```bash
mvn clean deploy -P release
```

---

## 🚀 Installation

### Maven
```xml
<dependency>
    <groupId>com.confighub</groupId>
    <artifactId>confighub-sdk-java</artifactId>
    <version>1.0.0</version>
</dependency>
```

### Gradle
```groovy
implementation 'com.confighub:confighub-sdk-java:1.0.0'
```

**Continuar para:** 04-CLIENT-TYPESCRIPT.md
