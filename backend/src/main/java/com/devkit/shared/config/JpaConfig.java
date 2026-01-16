package com.devkit.shared.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

/**
 * JPA Configuration.
 * Enables JPA Auditing for automatic timestamp management.
 */
@Configuration
@EnableJpaAuditing
public class JpaConfig {
}
