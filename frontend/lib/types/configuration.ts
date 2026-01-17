import type { Environment } from "./application";

export type ConfigType = "STRING" | "INTEGER" | "BOOLEAN" | "JSON" | "DOUBLE";

export interface Configuration {
  id: string;
  key: string;
  value: string;
  type: ConfigType;
  sensitive: boolean;
  description?: string;
  applicationId: string;
  environmentId: string;
  environment?: Environment;
  createdAt: string;
  updatedAt: string;
  version: number;
}

export interface ConfigurationVersion {
  id: string;
  configurationId: string;
  version: number;
  value: string;
  type: ConfigType;
  description?: string;
  createdAt: string;
  createdBy?: string;
  changeReason?: string;
}

export interface CreateConfigurationDto {
  key: string;
  value: string;
  type: ConfigType;
  sensitive?: boolean;
  description?: string;
  applicationId: string;
  environmentId: string;
}

export interface UpdateConfigurationDto {
  value: string;
  type?: ConfigType;
  sensitive?: boolean;
  description?: string;
}

export interface ConfigDiff {
  key: string;
  oldValue: string;
  newValue: string;
  type: ConfigType;
}

export interface BulkConfigUploadDto {
  environmentId: string;
  configurations: Array<{
    key: string;
    value: string;
    type?: ConfigType;
    sensitive?: boolean;
    description?: string;
  }>;
}
