export type TenantPlan = "FREE" | "STARTER" | "PRO" | "ENTERPRISE";
export type TenantStatus = "ACTIVE" | "SUSPENDED" | "CANCELLED" | "TRIAL";

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  plan: TenantPlan;
  status: TenantStatus;
  logo?: string;
  description?: string;
  billingEmail?: string;
  technicalEmail?: string;

  // Limits and usage
  limits: TenantLimits;
  usage: TenantUsage;

  // Subscription details
  trialEndsAt?: string;
  subscriptionEndsAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TenantLimits {
  maxApplications: number;
  maxConfigurations: number;
  maxSecrets: number;
  maxUsers: number;
  maxWebhooks: number;
  maxFeatureFlags: number;
}

export interface TenantUsage {
  applications: number;
  configurations: number;
  secrets: number;
  users: number;
  webhooks: number;
  featureFlags: number;
}

export interface CreateTenantDto {
  name: string;
  slug?: string;
  plan?: TenantPlan;
  description?: string;
  billingEmail?: string;
  technicalEmail?: string;
}

export interface UpdateTenantDto {
  name?: string;
  description?: string;
  billingEmail?: string;
  technicalEmail?: string;
  logo?: string;
}

export interface UpgradeTenantDto {
  plan: TenantPlan;
  billingEmail?: string;
  paymentMethodId?: string;
}

export interface TenantStats {
  totalTenants: number;
  activeTenants: number;
  trialTenants: number;
  suspendedTenants: number;
  cancelledTenants: number;
  tenantsByPlan: Record<TenantPlan, number>;
}

export interface TenantUser {
  id: string;
  tenantId: string;
  userId: string;
  email: string;
  name: string;
  role: TenantUserRole;
  joinedAt: string;
  invitedBy?: string;
}

export type TenantUserRole = "OWNER" | "ADMIN" | "MEMBER" | "VIEWER";

export interface InviteUserDto {
  email: string;
  role: TenantUserRole;
}

export const PLAN_CONFIG: Record<TenantPlan, {
  name: string;
  maxApplications: number;
  maxConfigurations: number;
  maxSecrets: number;
  maxUsers: number;
  maxWebhooks: number;
  maxFeatureFlags: number;
  price: string;
  features: string[];
}> = {
  FREE: {
    name: "Free",
    maxApplications: 1,
    maxConfigurations: 50,
    maxSecrets: 10,
    maxUsers: 1,
    maxWebhooks: 3,
    maxFeatureFlags: 5,
    price: "$0/month",
    features: ["1 Application", "50 Configurations", "10 Secrets", "1 User", "Basic Support"],
  },
  STARTER: {
    name: "Starter",
    maxApplications: 3,
    maxConfigurations: 200,
    maxSecrets: 50,
    maxUsers: 5,
    maxWebhooks: 10,
    maxFeatureFlags: 20,
    price: "$29/month",
    features: ["3 Applications", "200 Configurations", "50 Secrets", "5 Users", "Email Support"],
  },
  PRO: {
    name: "Pro",
    maxApplications: 10,
    maxConfigurations: 1000,
    maxSecrets: 200,
    maxUsers: 20,
    maxWebhooks: 50,
    maxFeatureFlags: 100,
    price: "$99/month",
    features: ["10 Applications", "1000 Configurations", "200 Secrets", "20 Users", "Priority Support"],
  },
  ENTERPRISE: {
    name: "Enterprise",
    maxApplications: -1, // unlimited
    maxConfigurations: -1,
    maxSecrets: -1,
    maxUsers: -1,
    maxWebhooks: -1,
    maxFeatureFlags: -1,
    price: "Custom",
    features: ["Unlimited Everything", "SSO/SAML", "Dedicated Support", "SLA Guarantee", "Custom Integrations"],
  },
};
