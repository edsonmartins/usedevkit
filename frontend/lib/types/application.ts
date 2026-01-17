// Application types
export interface Application {
  id: string;
  name: string;
  description?: string;
  active: boolean;
  environments: Environment[];
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  teamId?: string;
}

export interface Environment {
  id: string;
  name: string;
  description?: string;
  applicationId: string;
  createdAt: string;
  createdBy?: string;
}

export interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  keyHash: string;
  active: boolean;
  expiresAt?: string;
  lastUsedAt?: string;
  createdAt: string;
  applicationId: string;
}

// Request types
export interface CreateApplicationDto {
  name: string;
  description?: string;
  environments: EnvironmentCreateDto[];
}

export interface EnvironmentCreateDto {
  name: string;
  description?: string;
}

export interface UpdateApplicationDto {
  name?: string;
  description?: string;
  active?: boolean;
}

export interface CreateApiKeyDto {
  name: string;
  expiresIn?: number; // days
}

// Response types
export interface ApplicationStats {
  totalConfigurations: number;
  totalSecrets: number;
  totalFeatureFlags: number;
  environments: {
    name: string;
    configurations: number;
    secrets: number;
  }[];
}
