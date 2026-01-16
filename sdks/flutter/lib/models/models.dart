class Configuration {
  final String id;
  final String key;
  final String value;
  final String type;
  final String? description;
  final String environmentId;
  final int versionNumber;
  final DateTime createdAt;
  final DateTime updatedAt;

  Configuration({
    required this.id,
    required this.key,
    required this.value,
    required this.type,
    this.description,
    required this.environmentId,
    required this.versionNumber,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Configuration.fromJson(Map<String, dynamic> json) {
    return Configuration(
      id: json['id'] as String,
      key: json['key'] as String,
      value: json['value'] as String,
      type: json['type'] as String,
      description: json['description'] as String?,
      environmentId: json['environmentId'] as String,
      versionNumber: json['versionNumber'] as int,
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
    );
  }
}

class Secret {
  final String id;
  final String key;
  final String decryptedValue;
  final String? description;
  final String applicationId;
  final String? environmentId;
  final String rotationPolicy;
  final DateTime? lastRotationDate;
  final DateTime? nextRotationDate;
  final bool isActive;
  final int versionNumber;
  final DateTime createdAt;
  final DateTime updatedAt;

  Secret({
    required this.id,
    required this.key,
    required this.decryptedValue,
    this.description,
    required this.applicationId,
    this.environmentId,
    required this.rotationPolicy,
    this.lastRotationDate,
    this.nextRotationDate,
    required this.isActive,
    required this.versionNumber,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Secret.fromJson(Map<String, dynamic> json) {
    return Secret(
      id: json['id'] as String,
      key: json['key'] as String,
      decryptedValue: json['decryptedValue'] as String,
      description: json['description'] as String?,
      applicationId: json['applicationId'] as String,
      environmentId: json['environmentId'] as String?,
      rotationPolicy: json['rotationPolicy'] as String,
      lastRotationDate: json['lastRotationDate'] != null
          ? DateTime.parse(json['lastRotationDate'] as String)
          : null,
      nextRotationDate: json['nextRotationDate'] != null
          ? DateTime.parse(json['nextRotationDate'] as String)
          : null,
      isActive: json['isActive'] as bool,
      versionNumber: json['versionNumber'] as int,
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
    );
  }
}

class FeatureFlag {
  final String id;
  final String key;
  final String name;
  final String? description;
  final String status;
  final String rolloutStrategy;
  final int? rolloutPercentage;
  final String applicationId;
  final DateTime createdAt;
  final DateTime updatedAt;

  FeatureFlag({
    required this.id,
    required this.key,
    required this.name,
    this.description,
    required this.status,
    required this.rolloutStrategy,
    this.rolloutPercentage,
    required this.applicationId,
    required this.createdAt,
    required this.updatedAt,
  });

  factory FeatureFlag.fromJson(Map<String, dynamic> json) {
    return FeatureFlag(
      id: json['id'] as String,
      key: json['key'] as String,
      name: json['name'] as String,
      description: json['description'] as String?,
      status: json['status'] as String,
      rolloutStrategy: json['rolloutStrategy'] as String,
      rolloutPercentage: json['rolloutPercentage'] as int?,
      applicationId: json['applicationId'] as String,
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
    );
  }
}

class FeatureFlagEvaluation {
  final bool enabled;
  final String? variantKey;
  final String reason;

  FeatureFlagEvaluation({
    required this.enabled,
    this.variantKey,
    required this.reason,
  });

  factory FeatureFlagEvaluation.fromJson(Map<String, dynamic> json) {
    return FeatureFlagEvaluation(
      enabled: json['enabled'] as bool,
      variantKey: json['variantKey'] as String?,
      reason: json['reason'] as String,
    );
  }
}
