export interface Configuration {
  id: string;
  key: string;
  value: string;
  type: string;
  description: string | null;
  environmentId: string;
  versionNumber: number;
  createdAt: string;
  updatedAt: string;
}

export interface Secret {
  id: string;
  key: string;
  decryptedValue: string;
  description: string | null;
  applicationId: string;
  environmentId: string | null;
  rotationPolicy: string;
  lastRotationDate: string | null;
  nextRotationDate: string | null;
  isActive: boolean;
  versionNumber: number;
  createdAt: string;
  updatedAt: string;
}

export interface FeatureFlag {
  id: string;
  key: string;
  name: string;
  description: string | null;
  status: string;
  rolloutStrategy: string;
  rolloutPercentage: number | null;
  applicationId: string;
  createdAt: string;
  updatedAt: string;
}

export interface FeatureFlagEvaluation {
  enabled: boolean;
  variantKey: string | null;
  reason: string;
}

export interface DevKitOptions {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
  cacheExpireAfter?: number;
  enableCache?: boolean;
}
