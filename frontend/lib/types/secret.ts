export type SecretType = "API_KEY" | "PASSWORD" | "CERTIFICATE" | "TOKEN" | "DATABASE_URL" | "OTHER";

export type SecretStatus = "ACTIVE" | "EXPIRED" | "ROTATION_PENDING" | "DEACTIVATED";

export interface Secret {
  id: string;
  key: string;
  value: string; // Always encrypted, only shown decrypted on demand
  type: SecretType;
  status: SecretStatus;
  description?: string;
  applicationId: string;
  rotationDays?: number;
  lastRotatedAt?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SecretRotationHistory {
  id: string;
  secretId: string;
  rotatedAt: string;
  rotatedBy?: string;
  previousValuePrefix: string;
  reason?: string;
}

export interface CreateSecretDto {
  key: string;
  value: string;
  type: SecretType;
  description?: string;
  applicationId: string;
  rotationDays?: number;
}

export interface UpdateSecretDto {
  value?: string;
  description?: string;
  rotationDays?: number;
}

export interface SecretMetadata {
  id: string;
  key: string;
  type: SecretType;
  status: SecretStatus;
  description?: string;
  rotationDays?: number;
  lastRotatedAt?: string;
  expiresAt?: string;
  daysUntilExpiration?: number;
  createdAt: string;
  updatedAt: string;
}

export interface SecretStats {
  total: number;
  active: number;
  rotationPending: number;
  expired: number;
}
