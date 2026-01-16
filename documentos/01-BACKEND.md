# ConfigHub - Backend Spring Boot

## 🏗️ Estrutura do Projeto

```
backend/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/confighub/
│   │   │       ├── ConfigHubApplication.java
│   │   │       ├── config/
│   │   │       │   ├── SecurityConfig.java
│   │   │       │   ├── EncryptionConfig.java
│   │   │       │   └── CorsConfig.java
│   │   │       ├── controller/
│   │   │       │   ├── ApplicationController.java
│   │   │       │   ├── ConfigurationController.java
│   │   │       │   ├── SecretController.java
│   │   │       │   ├── AuthController.java
│   │   │       │   └── AuditController.java
│   │   │       ├── service/
│   │   │       │   ├── ApplicationService.java
│   │   │       │   ├── ConfigurationService.java
│   │   │       │   ├── EncryptionService.java
│   │   │       │   ├── AuthService.java
│   │   │       │   └── AuditService.java
│   │   │       ├── repository/
│   │   │       │   ├── ApplicationRepository.java
│   │   │       │   ├── ConfigurationRepository.java
│   │   │       │   ├── SecretRepository.java
│   │   │       │   ├── ApiKeyRepository.java
│   │   │       │   └── AuditLogRepository.java
│   │   │       ├── model/
│   │   │       │   ├── Application.java
│   │   │       │   ├── Environment.java
│   │   │       │   ├── Configuration.java
│   │   │       │   ├── Secret.java
│   │   │       │   ├── ApiKey.java
│   │   │       │   ├── Team.java
│   │   │       │   └── AuditLog.java
│   │   │       ├── dto/
│   │   │       │   ├── request/
│   │   │       │   └── response/
│   │   │       ├── security/
│   │   │       │   ├── JwtTokenProvider.java
│   │   │       │   ├── JwtAuthenticationFilter.java
│   │   │       │   └── ApiKeyAuthenticationFilter.java
│   │   │       ├── exception/
│   │   │       │   ├── GlobalExceptionHandler.java
│   │   │       │   └── custom/
│   │   │       └── util/
│   │   │           ├── EncryptionUtil.java
│   │   │           └── ValidationUtil.java
│   │   └── resources/
│   │       ├── application.yml
│   │       ├── application-dev.yml
│   │       ├── application-prod.yml
│   │       └── db/
│   │           └── migration/
│   │               ├── V1__initial_schema.sql
│   │               ├── V2__add_audit_tables.sql
│   │               └── V3__add_indexes.sql
│   └── test/
│       └── java/
│           └── com/confighub/
├── pom.xml
├── Dockerfile
└── README.md
```

---

## 📦 pom.xml - Dependências

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
         https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.2.1</version>
        <relativePath/>
    </parent>
    
    <groupId>com.confighub</groupId>
    <artifactId>confighub-backend</artifactId>
    <version>1.0.0</version>
    <name>ConfigHub Backend</name>
    <description>Centralized configuration management service</description>
    
    <properties>
        <java.version>17</java.version>
        <bouncycastle.version>1.77</bouncycastle.version>
    </properties>
    
    <dependencies>
        <!-- Spring Boot Starters -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>
        
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-security</artifactId>
        </dependency>
        
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-validation</artifactId>
        </dependency>
        
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-actuator</artifactId>
        </dependency>
        
        <!-- Database -->
        <dependency>
            <groupId>org.postgresql</groupId>
            <artifactId>postgresql</artifactId>
            <scope>runtime</scope>
        </dependency>
        
        <dependency>
            <groupId>org.flywaydb</groupId>
            <artifactId>flyway-core</artifactId>
        </dependency>
        
        <!-- Security & Encryption -->
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-api</artifactId>
            <version>0.12.3</version>
        </dependency>
        
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-impl</artifactId>
            <version>0.12.3</version>
            <scope>runtime</scope>
        </dependency>
        
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-jackson</artifactId>
            <version>0.12.3</version>
            <scope>runtime</scope>
        </dependency>
        
        <dependency>
            <groupId>org.bouncycastle</groupId>
            <artifactId>bcprov-jdk18on</artifactId>
            <version>${bouncycastle.version}</version>
        </dependency>
        
        <dependency>
            <groupId>org.bouncycastle</groupId>
            <artifactId>bcpkix-jdk18on</artifactId>
            <version>${bouncycastle.version}</version>
        </dependency>
        
        <!-- Utilities -->
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>
        
        <dependency>
            <groupId>org.springdoc</groupId>
            <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
            <version>2.3.0</version>
        </dependency>
        
        <!-- Testing -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
        
        <dependency>
            <groupId>org.springframework.security</groupId>
            <artifactId>spring-security-test</artifactId>
            <scope>test</scope>
        </dependency>
        
        <dependency>
            <groupId>com.h2database</groupId>
            <artifactId>h2</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>
    
    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
                <configuration>
                    <excludes>
                        <exclude>
                            <groupId>org.projectlombok</groupId>
                            <artifactId>lombok</artifactId>
                        </exclude>
                    </excludes>
                </configuration>
            </plugin>
        </plugins>
    </build>
</project>
```

---

## ⚙️ application.yml

```yaml
spring:
  application:
    name: confighub
  
  datasource:
    url: jdbc:postgresql://${DB_HOST:localhost}:${DB_PORT:5432}/${DB_NAME:confighub}
    username: ${DB_USER:confighub}
    password: ${DB_PASSWORD:confighub123}
    driver-class-name: org.postgresql.Driver
    hikari:
      maximum-pool-size: 10
      minimum-idle: 5
      connection-timeout: 30000
  
  jpa:
    hibernate:
      ddl-auto: validate
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
        format_sql: true
    show-sql: false
  
  flyway:
    enabled: true
    baseline-on-migrate: true
    locations: classpath:db/migration

server:
  port: 8080
  compression:
    enabled: true
  error:
    include-message: always
    include-binding-errors: always

# ConfigHub Settings
confighub:
  security:
    jwt:
      secret: ${JWT_SECRET:your-secret-key-change-in-production-minimum-256-bits}
      expiration: 900000  # 15 minutes
      refresh-expiration: 604800000  # 7 days
    
    encryption:
      master-key: ${MASTER_KEY:your-master-encryption-key-change-in-production-32-bytes}
      algorithm: AES/GCM/NoPadding
      key-size: 256
  
  audit:
    enabled: true
    retention-days: 90
  
  rate-limit:
    enabled: true
    max-requests-per-minute: 100

# Actuator
management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics,prometheus
  endpoint:
    health:
      show-details: when-authorized

# Logging
logging:
  level:
    com.confighub: INFO
    org.springframework.security: DEBUG
    org.hibernate.SQL: DEBUG
  pattern:
    console: "%d{yyyy-MM-dd HH:mm:ss} - %msg%n"
```

---

## 🗃️ Modelos de Dados

### Application.java

```java
package com.confighub.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "applications", indexes = {
    @Index(name = "idx_app_name", columnList = "name"),
    @Index(name = "idx_app_active", columnList = "active")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Application {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @Column(nullable = false, unique = true, length = 100)
    private String name;
    
    @Column(length = 500)
    private String description;
    
    @Column(nullable = false)
    @Builder.Default
    private Boolean active = true;
    
    @OneToMany(mappedBy = "application", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private Set<Environment> environments = new HashSet<>();
    
    @OneToMany(mappedBy = "application", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private Set<ApiKey> apiKeys = new HashSet<>();
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_id")
    private Team team;
    
    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;
    
    @Column(length = 100)
    private String createdBy;
}
```

### Environment.java

```java
package com.confighub.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "environments", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"application_id", "name"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Environment {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @Column(nullable = false, length = 50)
    private String name; // dev, staging, production
    
    @Column(length = 500)
    private String description;
    
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "application_id", nullable = false)
    private Application application;
    
    @OneToMany(mappedBy = "environment", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private Set<Configuration> configurations = new HashSet<>();
    
    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(length = 100)
    private String createdBy;
}
```

### Configuration.java

```java
package com.confighub.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "configurations", indexes = {
    @Index(name = "idx_config_key", columnList = "config_key"),
    @Index(name = "idx_config_env", columnList = "environment_id")
}, uniqueConstraints = {
    @UniqueConstraint(columnNames = {"environment_id", "config_key"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Configuration {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @Column(name = "config_key", nullable = false, length = 200)
    private String key;
    
    @Column(name = "encrypted_value", columnDefinition = "TEXT")
    private String encryptedValue;
    
    @Column(name = "encryption_iv", length = 64)
    private String encryptionIv; // Initialization Vector para AES-GCM
    
    @Column(nullable = false)
    @Builder.Default
    private Boolean sensitive = false;
    
    @Column(length = 50)
    private String type; // string, int, boolean, json
    
    @Column(length = 1000)
    private String description;
    
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "environment_id", nullable = false)
    private Environment environment;
    
    @Column(nullable = false)
    @Builder.Default
    private Integer version = 1;
    
    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;
    
    @Column(length = 100)
    private String updatedBy;
}
```

### Secret.java

```java
package com.confighub.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "secrets", indexes = {
    @Index(name = "idx_secret_app", columnList = "application_id"),
    @Index(name = "idx_secret_rotation", columnList = "next_rotation_date")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Secret {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @Column(nullable = false, length = 200)
    private String name;
    
    @Column(columnDefinition = "TEXT")
    private String encryptedValue;
    
    @Column(length = 64)
    private String encryptionIv;
    
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "application_id", nullable = false)
    private Application application;
    
    @Column(length = 50)
    private String secretType; // database_password, api_key, certificate, etc
    
    @Column
    private Integer rotationDays; // null = sem rotação automática
    
    @Column
    private LocalDateTime nextRotationDate;
    
    @Column
    private LocalDateTime lastRotationDate;
    
    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;
    
    @Column(length = 100)
    private String updatedBy;
}
```

### ApiKey.java

```java
package com.confighub.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "api_keys", indexes = {
    @Index(name = "idx_apikey_hash", columnList = "key_hash", unique = true),
    @Index(name = "idx_apikey_active", columnList = "active")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApiKey {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @Column(nullable = false, unique = true, length = 100)
    private String name;
    
    @Column(name = "key_hash", nullable = false, unique = true, length = 64)
    private String keyHash; // SHA-256 hash da chave
    
    @Column(name = "key_prefix", length = 10)
    private String keyPrefix; // Primeiros 8 chars para identificação
    
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "application_id", nullable = false)
    private Application application;
    
    @Column(nullable = false)
    @Builder.Default
    private Boolean active = true;
    
    @Column
    private LocalDateTime expiresAt;
    
    @Column
    private LocalDateTime lastUsedAt;
    
    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(length = 100)
    private String createdBy;
}
```

### AuditLog.java

```java
package com.confighub.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "audit_logs", indexes = {
    @Index(name = "idx_audit_timestamp", columnList = "timestamp"),
    @Index(name = "idx_audit_user", columnList = "user_id"),
    @Index(name = "idx_audit_entity", columnList = "entity_type, entity_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @Column(length = 50)
    private String userId;
    
    @Column(length = 100)
    private String username;
    
    @Column(nullable = false, length = 50)
    private String action; // CREATE, READ, UPDATE, DELETE, LOGIN
    
    @Column(nullable = false, length = 50)
    private String entityType; // Configuration, Secret, ApiKey
    
    @Column(length = 100)
    private String entityId;
    
    @Column(columnDefinition = "TEXT")
    private String details; // JSON com detalhes da ação
    
    @Column(length = 45)
    private String ipAddress;
    
    @Column(length = 500)
    private String userAgent;
    
    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime timestamp;
    
    @Column(nullable = false)
    @Builder.Default
    private Boolean success = true;
}
```

### Team.java

```java
package com.confighub.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "teams")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Team {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @Column(nullable = false, unique = true, length = 100)
    private String name;
    
    @Column(length = 500)
    private String description;
    
    @OneToMany(mappedBy = "team", cascade = CascadeType.ALL)
    @Builder.Default
    private Set<Application> applications = new HashSet<>();
    
    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
```

---

## 🔐 EncryptionService.java

```java
package com.confighub.service;

import lombok.extern.slf4j.Slf4j;
import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.security.Security;
import java.util.Base64;

@Service
@Slf4j
public class EncryptionService {
    
    private static final int GCM_IV_LENGTH = 12;
    private static final int GCM_TAG_LENGTH = 128;
    private static final String ALGORITHM = "AES/GCM/NoPadding";
    
    private final SecretKey masterKey;
    private final SecureRandom secureRandom;
    
    public EncryptionService(@Value("${confighub.security.encryption.master-key}") String masterKeyString) {
        Security.addProvider(new BouncyCastleProvider());
        
        // Derivar chave de 256 bits do master key
        byte[] keyBytes = masterKeyString.getBytes(StandardCharsets.UTF_8);
        byte[] key = new byte[32]; // 256 bits
        System.arraycopy(keyBytes, 0, key, 0, Math.min(keyBytes.length, 32));
        
        this.masterKey = new SecretKeySpec(key, "AES");
        this.secureRandom = new SecureRandom();
        
        log.info("Encryption service initialized with AES-256-GCM");
    }
    
    /**
     * Encrypts a value using AES-256-GCM
     * @param plaintext The value to encrypt
     * @return EncryptedData with encrypted value and IV
     */
    public EncryptedData encrypt(String plaintext) {
        try {
            // Gerar IV aleatório
            byte[] iv = new byte[GCM_IV_LENGTH];
            secureRandom.nextBytes(iv);
            
            // Configurar cipher
            Cipher cipher = Cipher.getInstance(ALGORITHM, "BC");
            GCMParameterSpec parameterSpec = new GCMParameterSpec(GCM_TAG_LENGTH, iv);
            cipher.init(Cipher.ENCRYPT_MODE, masterKey, parameterSpec);
            
            // Encriptar
            byte[] ciphertext = cipher.doFinal(plaintext.getBytes(StandardCharsets.UTF_8));
            
            return EncryptedData.builder()
                .encryptedValue(Base64.getEncoder().encodeToString(ciphertext))
                .iv(Base64.getEncoder().encodeToString(iv))
                .build();
                
        } catch (Exception e) {
            log.error("Encryption failed", e);
            throw new RuntimeException("Failed to encrypt data", e);
        }
    }
    
    /**
     * Decrypts a value using AES-256-GCM
     * @param encryptedValue The encrypted value (Base64)
     * @param ivBase64 The initialization vector (Base64)
     * @return The decrypted plaintext
     */
    public String decrypt(String encryptedValue, String ivBase64) {
        try {
            byte[] iv = Base64.getDecoder().decode(ivBase64);
            byte[] ciphertext = Base64.getDecoder().decode(encryptedValue);
            
            Cipher cipher = Cipher.getInstance(ALGORITHM, "BC");
            GCMParameterSpec parameterSpec = new GCMParameterSpec(GCM_TAG_LENGTH, iv);
            cipher.init(Cipher.DECRYPT_MODE, masterKey, parameterSpec);
            
            byte[] plaintext = cipher.doFinal(ciphertext);
            return new String(plaintext, StandardCharsets.UTF_8);
            
        } catch (Exception e) {
            log.error("Decryption failed", e);
            throw new RuntimeException("Failed to decrypt data", e);
        }
    }
    
    @lombok.Data
    @lombok.Builder
    public static class EncryptedData {
        private String encryptedValue;
        private String iv;
    }
}
```

---

## 🔑 JwtTokenProvider.java

```java
package com.confighub.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Component
@Slf4j
public class JwtTokenProvider {
    
    private final SecretKey key;
    private final long jwtExpiration;
    private final long refreshExpiration;
    
    public JwtTokenProvider(
            @Value("${confighub.security.jwt.secret}") String secret,
            @Value("${confighub.security.jwt.expiration}") long jwtExpiration,
            @Value("${confighub.security.jwt.refresh-expiration}") long refreshExpiration) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.jwtExpiration = jwtExpiration;
        this.refreshExpiration = refreshExpiration;
    }
    
    public String generateToken(String apiKeyId, String applicationId) {
        return generateToken(apiKeyId, applicationId, jwtExpiration);
    }
    
    public String generateRefreshToken(String apiKeyId, String applicationId) {
        return generateToken(apiKeyId, applicationId, refreshExpiration);
    }
    
    private String generateToken(String apiKeyId, String applicationId, long expiration) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("apiKeyId", apiKeyId);
        claims.put("applicationId", applicationId);
        claims.put("type", expiration == jwtExpiration ? "access" : "refresh");
        
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expiration);
        
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(apiKeyId)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }
    
    public Claims extractClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
    
    public String getApiKeyId(String token) {
        return extractClaims(token).get("apiKeyId", String.class);
    }
    
    public String getApplicationId(String token) {
        return extractClaims(token).get("applicationId", String.class);
    }
    
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            log.error("Invalid JWT token: {}", e.getMessage());
            return false;
        }
    }
}
```

---

## 🛡️ SecurityConfig.java

```java
package com.confighub.config;

import com.confighub.security.ApiKeyAuthenticationFilter;
import com.confighub.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {
    
    private final JwtAuthenticationFilter jwtAuthFilter;
    private final ApiKeyAuthenticationFilter apiKeyAuthFilter;
    
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configure(http))
                .sessionManagement(session -> 
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Public endpoints
                        .requestMatchers("/api/v1/auth/**").permitAll()
                        .requestMatchers("/actuator/health").permitAll()
                        .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()
                        
                        // API endpoints - require authentication
                        .requestMatchers("/api/v1/**").authenticated()
                        
                        .anyRequest().authenticated()
                )
                .addFilterBefore(apiKeyAuthFilter, UsernamePasswordAuthenticationFilter.class)
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }
    
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
```

---

## 📡 ConfigurationController.java (Exemplo)

```java
package com.confighub.controller;

import com.confighub.dto.request.ConfigurationRequest;
import com.confighub.dto.response.ConfigurationResponse;
import com.confighub.service.ConfigurationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/configurations")
@RequiredArgsConstructor
@Tag(name = "Configurations", description = "Configuration management endpoints")
@SecurityRequirement(name = "bearerAuth")
public class ConfigurationController {
    
    private final ConfigurationService configurationService;
    
    @GetMapping("/app/{appId}/env/{envName}")
    @Operation(summary = "Get all configurations for an environment")
    public ResponseEntity<Map<String, Object>> getConfigurations(
            @PathVariable UUID appId,
            @PathVariable String envName,
            @RequestParam(defaultValue = "false") boolean includeValues) {
        
        Map<String, Object> configs = configurationService
                .getConfigurationsForEnvironment(appId, envName, includeValues);
        return ResponseEntity.ok(configs);
    }
    
    @PostMapping
    @Operation(summary = "Create or update configuration")
    public ResponseEntity<ConfigurationResponse> createConfiguration(
            @Valid @RequestBody ConfigurationRequest request) {
        
        ConfigurationResponse response = configurationService.createOrUpdate(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    @DeleteMapping("/{configId}")
    @Operation(summary = "Delete configuration")
    public ResponseEntity<Void> deleteConfiguration(@PathVariable UUID configId) {
        configurationService.delete(configId);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/{configId}/history")
    @Operation(summary = "Get configuration version history")
    public ResponseEntity<List<ConfigurationResponse>> getHistory(@PathVariable UUID configId) {
        List<ConfigurationResponse> history = configurationService.getHistory(configId);
        return ResponseEntity.ok(history);
    }
}
```

---

## 🗄️ Migration SQL (V1__initial_schema.sql)

```sql
-- Applications table
CREATE TABLE applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(500),
    active BOOLEAN NOT NULL DEFAULT true,
    team_id UUID,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100)
);

CREATE INDEX idx_app_name ON applications(name);
CREATE INDEX idx_app_active ON applications(active);

-- Environments table
CREATE TABLE environments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL,
    description VARCHAR(500),
    application_id UUID NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    CONSTRAINT fk_env_application FOREIGN KEY (application_id) 
        REFERENCES applications(id) ON DELETE CASCADE,
    CONSTRAINT uk_env_app_name UNIQUE (application_id, name)
);

-- Configurations table
CREATE TABLE configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    config_key VARCHAR(200) NOT NULL,
    encrypted_value TEXT,
    encryption_iv VARCHAR(64),
    sensitive BOOLEAN NOT NULL DEFAULT false,
    type VARCHAR(50),
    description VARCHAR(1000),
    environment_id UUID NOT NULL,
    version INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(100),
    CONSTRAINT fk_config_environment FOREIGN KEY (environment_id) 
        REFERENCES environments(id) ON DELETE CASCADE,
    CONSTRAINT uk_config_env_key UNIQUE (environment_id, config_key)
);

CREATE INDEX idx_config_key ON configurations(config_key);
CREATE INDEX idx_config_env ON configurations(environment_id);

-- Secrets table
CREATE TABLE secrets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    encrypted_value TEXT,
    encryption_iv VARCHAR(64),
    application_id UUID NOT NULL,
    secret_type VARCHAR(50),
    rotation_days INTEGER,
    next_rotation_date TIMESTAMP,
    last_rotation_date TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(100),
    CONSTRAINT fk_secret_application FOREIGN KEY (application_id) 
        REFERENCES applications(id) ON DELETE CASCADE
);

CREATE INDEX idx_secret_app ON secrets(application_id);
CREATE INDEX idx_secret_rotation ON secrets(next_rotation_date);

-- API Keys table
CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    key_hash VARCHAR(64) NOT NULL UNIQUE,
    key_prefix VARCHAR(10),
    application_id UUID NOT NULL,
    active BOOLEAN NOT NULL DEFAULT true,
    expires_at TIMESTAMP,
    last_used_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    CONSTRAINT fk_apikey_application FOREIGN KEY (application_id) 
        REFERENCES applications(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX idx_apikey_hash ON api_keys(key_hash);
CREATE INDEX idx_apikey_active ON api_keys(active);

-- Teams table
CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Audit Logs table
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(50),
    username VARCHAR(100),
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(100),
    details TEXT,
    ip_address VARCHAR(45),
    user_agent VARCHAR(500),
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    success BOOLEAN NOT NULL DEFAULT true
);

CREATE INDEX idx_audit_timestamp ON audit_logs(timestamp);
CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);

-- Add foreign key for teams
ALTER TABLE applications 
ADD CONSTRAINT fk_app_team FOREIGN KEY (team_id) 
    REFERENCES teams(id) ON DELETE SET NULL;
```

---

## 🐳 Dockerfile

```dockerfile
FROM eclipse-temurin:17-jdk-alpine AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN apk add --no-cache maven
RUN mvn clean package -DskipTests

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

# Create non-root user
RUN addgroup -S confighub && adduser -S confighub -G confighub
USER confighub

EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["java", "-jar", "app.jar"]
```

---

## 🚀 Próximos Passos

1. Implementar services completos (ConfigurationService, etc)
2. Implementar DTOs de request/response
3. Adicionar testes unitários e de integração
4. Configurar CI/CD pipeline
5. Documentação OpenAPI/Swagger completa

**Continuar para:** 02-FRONTEND.md
