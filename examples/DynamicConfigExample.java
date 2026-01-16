package com.example;

import com.devkit.sdk.*;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Complete example of Dynamic Configuration usage.
 * Demonstrates hot reload for rate limiting, feature flags, and cache settings.
 */
public class DynamicConfigExample {

    public static void main(String[] args) {
        // Initialize hot reload client
        HotReloadConfigClient config = new DevKitClientBuilder()
            .baseUrl("https://api.usedevkit.com")
            .apiKey("your-api-key-here")
            .buildHotReload("production", 5000); // Poll every 5 seconds

        // Application state backed by dynamic configs
        AtomicInteger rateLimit = new AtomicInteger(1000);
        AtomicBoolean newCheckoutFlow = new AtomicBoolean(false);
        AtomicLong cacheTtl = new AtomicLong(300);

        // Start hot reload with automatic updates
        config.start(configs -> {
            System.out.println("⚡ Configuration update received!");

            // Update rate limit
            String rateLimitStr = configs.get("rate.limit.api");
            if (rateLimitStr != null) {
                try {
                    int newLimit = Integer.parseInt(rateLimitStr);
                    rateLimit.set(newLimit);
                    System.out.println("  ✓ Rate limit: " + newLimit + " req/min");
                } catch (NumberFormatException e) {
                    System.err.println("  ✗ Invalid rate limit: " + rateLimitStr);
                }
            }

            // Update feature flag
            String checkoutFlow = configs.get("feature.new_checkout");
            if (checkoutFlow != null) {
                boolean enabled = Boolean.parseBoolean(checkoutFlow);
                newCheckoutFlow.set(enabled);
                System.out.println("  ✓ New checkout flow: " + (enabled ? "ENABLED" : "DISABLED"));
            }

            // Update cache TTL
            String cacheTtlStr = configs.get("cache.ttl.seconds");
            if (cacheTtlStr != null) {
                try {
                    long newTtl = Long.parseLong(cacheTtlStr);
                    cacheTtl.set(newTtl);
                    System.out.println("  ✓ Cache TTL: " + newTtl + " seconds");
                } catch (NumberFormatException e) {
                    System.err.println("  ✗ Invalid cache TTL: " + cacheTtlStr);
                }
            }
        });

        // Simulate application startup
        System.out.println("\n🚀 Application started with hot reload enabled");
        System.out.println("Current configurations:");
        System.out.println("  - Rate Limit: " + rateLimit.get() + " req/min");
        System.out.println("  - New Checkout: " + newCheckoutFlow.get());
        System.out.println("  - Cache TTL: " + cacheTtl.get() + "s");

        // Simulate API requests with rate limiting
        System.out.println("\n📊 Simulating API traffic...");
        simulateApiTraffic(config, rateLimit, newCheckoutFlow, cacheTtl);

        // Graceful shutdown
        Runtime.getRuntime().addShutdownHook(new Thread(() -> {
            System.out.println("\n🛑 Shutting down hot reload client...");
            config.stop();
            System.out.println("✓ Shutdown complete");
        }));

        // Keep application running
        try {
            Thread.sleep(60000); // Run for 1 minute
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }

    private static void simulateApiTraffic(
            HotReloadConfigClient config,
            AtomicInteger rateLimit,
            AtomicBoolean newCheckoutFlow,
            AtomicLong cacheTtl) {

        for (int i = 1; i <= 100; i++) {
            // Simulate API request
            handleApiRequest(i, rateLimit, newCheckoutFlow, cacheTtl);

            try {
                Thread.sleep(100); // 10 requests per second
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                break;
            }

            // Show config status every 10 requests
            if (i % 10 == 0) {
                System.out.println(String.format(
                    "  Processed %d requests | Last update: %s",
                    i,
                    config.getLastUpdate()
                ));
            }
        }
    }

    private static void handleApiRequest(
            int requestId,
            AtomicInteger rateLimit,
            AtomicBoolean newCheckoutFlow,
            AtomicLong cacheTtl) {

        // Simulate rate limiting check
        if (requestId % 100 == 0) {
            System.out.println(String.format(
                "  [Req #%d] Rate limit: %d req/min | Checkout: %s | Cache TTL: %ds",
                requestId,
                rateLimit.get(),
                newCheckoutFlow.get() ? "NEW" : "OLD",
                cacheTtl.get()
            ));
        }
    }
}
