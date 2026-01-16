package com.devkit.applications.domain;

import com.devkit.applications.domain.vo.ApplicationId;
import org.springframework.stereotype.Component;

/**
 * Mapper for converting ApplicationEntity to/from DTOs.
 */
@Component
class ApplicationMapper {

    ApplicationResult toApplicationResult(ApplicationEntity entity) {
        return new ApplicationResult(
                entity.getId().id(),
                entity.getName(),
                entity.getDescription(),
                entity.getOwnerEmail(),
                entity.isActive(),
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }
}
