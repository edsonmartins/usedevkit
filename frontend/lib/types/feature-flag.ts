export type FlagType = "BOOLEAN" | "STRING" | "NUMBER" | "JSON";

export type FlagStatus = "ACTIVE" | "INACTIVE" | "ARCHIVED";

export interface FlagVariant {
  id: string;
  name: string;
  value: string;
  description?: string;
  rolloutPercentage: number;
}

export interface TargetingRule {
  id: string;
  type: "USER_ID" | "USER_ATTRIBUTE" | "IP_ADDRESS" | "CUSTOM";
  attribute?: string;
  operator: "EQUALS" | "CONTAINS" | "REGEX" | "IN" | "GT" | "LT";
  values: string[];
  variantId?: string;
  enabled: boolean;
}

export interface FeatureFlag {
  id: string;
  key: string;
  name: string;
  description?: string;
  type: FlagType;
  status: FlagStatus;
  enabled: boolean;
  defaultValue: string;
  applicationId: string;
  variants?: FlagVariant[];
  targetingRules?: TargetingRule[];
  rolloutPercentage?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFeatureFlagDto {
  key: string;
  name: string;
  description?: string;
  type: FlagType;
  enabled: boolean;
  defaultValue: string;
  applicationId: string;
  variants?: Omit<FlagVariant, "id">[];
  targetingRules?: Omit<TargetingRule, "id">[];
  rolloutPercentage?: number;
}

export interface UpdateFeatureFlagDto {
  name?: string;
  description?: string;
  enabled?: boolean;
  defaultValue?: string;
  variants?: Omit<FlagVariant, "id">[];
  targetingRules?: Omit<TargetingRule, "id">[];
  rolloutPercentage?: number;
}

export interface FlagEvaluation {
  flagKey: string;
  enabled: boolean;
  value: string;
  variant?: string;
  reason: string;
}
