package com.devkit.webhooks.domain;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * Configuration for secret rotation notifications.
 */
@Component
@ConfigurationProperties(prefix = "devkit.notifications.secret-rotation")
public class SecretRotationNotificationProperties {

    private boolean enabled = false;
    private String channel = "email";
    private String recipient = "";

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public String getChannel() {
        return channel;
    }

    public void setChannel(String channel) {
        this.channel = channel;
    }

    public String getRecipient() {
        return recipient;
    }

    public void setRecipient(String recipient) {
        this.recipient = recipient;
    }
}
