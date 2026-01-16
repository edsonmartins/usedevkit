package com.devkit.shared.domain;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Component;

/**
 * Wrapper around Spring's ApplicationEventPublisher for domain events.
 */
@Component
public class SpringEventPublisher {

    private final ApplicationEventPublisher publisher;

    public SpringEventPublisher(ApplicationEventPublisher publisher) {
        this.publisher = publisher;
    }

    /**
     * Publish a domain event.
     * @param event the event to publish
     */
    public void publish(Object event) {
        publisher.publishEvent(event);
    }
}
