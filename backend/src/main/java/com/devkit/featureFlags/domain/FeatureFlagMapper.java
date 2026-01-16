package com.devkit.featureFlags.domain;

import org.springframework.stereotype.Component;

/**
 * Mapper for converting FeatureFlagEntity to/from DTOs.
 */
@Component
class FeatureFlagMapper {

    FeatureFlagResult toFeatureFlagResult(FeatureFlagEntity entity) {
        return FeatureFlagResult.from(entity);
    }
}
