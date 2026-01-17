"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreVertical,
  Building2,
  Edit,
  Trash2,
  Users,
  Ban,
  CheckCircle,
  ArrowUp,
  Key,
  Mail,
  Settings,
} from "lucide-react";
import { cn, formatRelativeTime } from "@/lib/utils";
import type { Tenant, TenantPlan, TenantStatus } from "@/lib/types/tenant";
import { PLAN_CONFIG } from "@/lib/types/tenant";

const STATUS_CONFIG: Record<TenantStatus, { color: string; bg: string; label: string }> = {
  ACTIVE: { color: "text-terminal-green", bg: "bg-terminal-green/20", label: "Active" },
  SUSPENDED: { color: "text-terminal-coral", bg: "bg-terminal-coral/20", label: "Suspended" },
  CANCELLED: { color: "text-terminal-dim", bg: "bg-terminal-border", label: "Cancelled" },
  TRIAL: { color: "text-blue-400", bg: "bg-blue-500/20", label: "Trial" },
};

const PLAN_COLORS: Record<TenantPlan, string> = {
  FREE: "text-terminal-dim",
  STARTER: "text-blue-400",
  PRO: "text-purple-400",
  ENTERPRISE: "text-terminal-green",
};

interface TenantCardProps {
  tenant: Tenant;
  onEdit?: () => void;
  onDelete?: () => void;
  onUpgrade?: () => void;
  onSuspend?: () => void;
  onActivate?: () => void;
  onManageUsers?: () => void;
  onSettings?: () => void;
  isDeleting?: boolean;
  isSuspending?: boolean;
  isActivating?: boolean;
}

export function TenantCard({
  tenant,
  onEdit,
  onDelete,
  onUpgrade,
  onSuspend,
  onActivate,
  onManageUsers,
  onSettings,
  isDeleting,
  isSuspending,
  isActivating,
}: TenantCardProps) {
  const [showUsage, setShowUsage] = useState(false);
  const statusConfig = STATUS_CONFIG[tenant.status];
  const planConfig = PLAN_CONFIG[tenant.plan];

  // Calculate usage percentages
  const usagePercentages = {
    applications: (tenant.usage.applications / tenant.limits.maxApplications) * 100,
    configurations: (tenant.usage.configurations / tenant.limits.maxConfigurations) * 100,
    secrets: (tenant.usage.secrets / tenant.limits.maxSecrets) * 100,
    users: (tenant.usage.users / tenant.limits.maxUsers) * 100,
    webhooks: (tenant.usage.webhooks / tenant.limits.maxWebhooks) * 100,
    featureFlags: (tenant.usage.featureFlags / tenant.limits.maxFeatureFlags) * 100,
  };

  const isUnlimited = (value: number) => value === -1;

  return (
    <Card
      className={cn(
        "bg-terminal-surface border-terminal-border transition-all",
        tenant.status === "ACTIVE" && tenant.plan === "ENTERPRISE" && "border-terminal-green/50"
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Building2 className="h-4 w-4 text-terminal-dim" />
              <CardTitle className="font-mono text-base truncate">
                {tenant.name}
              </CardTitle>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge
                variant="outline"
                className={cn("font-mono text-xs", statusConfig.bg, statusConfig.color, "border-0")}
              >
                {statusConfig.label}
              </Badge>
              <Badge
                variant="outline"
                className={cn("font-mono text-xs", PLAN_COLORS[tenant.plan], "border-0")}
              >
                {planConfig.name}
              </Badge>
              <span className="text-xs text-terminal-green font-mono">
                {planConfig.price}
              </span>
            </div>
            <p className="text-xs text-terminal-dim mt-1">
              @{tenant.slug}
            </p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-terminal-surface border-terminal-border">
              <DropdownMenuItem
                onClick={() => setShowUsage(!showUsage)}
                className="font-mono text-sm cursor-pointer"
              >
                <Key className="mr-2 h-4 w-4" />
                {showUsage ? "Hide" : "Show"} Usage
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={onManageUsers}
                className="font-mono text-sm cursor-pointer"
              >
                <Users className="mr-2 h-4 w-4" />
                Manage Users
              </DropdownMenuItem>
              {tenant.plan !== "ENTERPRISE" && (
                <DropdownMenuItem
                  onClick={onUpgrade}
                  className="font-mono text-sm cursor-pointer"
                >
                  <ArrowUp className="mr-2 h-4 w-4" />
                  Upgrade Plan
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={onSettings}
                className="font-mono text-sm cursor-pointer"
              >
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-terminal-border" />
              {tenant.status === "ACTIVE" ? (
                <DropdownMenuItem
                  onClick={onSuspend}
                  disabled={isSuspending}
                  className="font-mono text-sm text-yellow-400 cursor-pointer"
                >
                  <Ban className="mr-2 h-4 w-4" />
                  {isSuspending ? "Suspending..." : "Suspend"}
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  onClick={onActivate}
                  disabled={isActivating}
                  className="font-mono text-sm text-terminal-green cursor-pointer"
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  {isActivating ? "Activating..." : "Activate"}
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator className="bg-terminal-border" />
              <DropdownMenuItem
                onClick={onEdit}
                className="font-mono text-sm cursor-pointer"
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={onDelete}
                disabled={isDeleting}
                className="font-mono text-sm text-terminal-coral cursor-pointer"
              >
                {isDeleting ? "Deleting..." : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </>
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Contact Info */}
        <div className="space-y-1 text-xs">
          {tenant.billingEmail && (
            <div className="flex items-center gap-2 text-terminal-dim">
              <Mail className="h-3 w-3" />
              <span className="font-mono truncate">{tenant.billingEmail}</span>
            </div>
          )}
          {tenant.technicalEmail && tenant.technicalEmail !== tenant.billingEmail && (
            <div className="flex items-center gap-2 text-terminal-dim">
              <Mail className="h-3 w-3" />
              <span className="font-mono truncate">{tenant.technicalEmail}</span>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 bg-terminal-bg rounded">
            <div className="text-lg font-mono font-bold text-terminal-text">
              {tenant.usage.applications}
            </div>
            <div className="text-[10px] text-terminal-dim">Apps</div>
          </div>
          <div className="p-2 bg-terminal-bg rounded">
            <div className="text-lg font-mono font-bold text-terminal-text">
              {tenant.usage.users}
            </div>
            <div className="text-[10px] text-terminal-dim">Users</div>
          </div>
          <div className="p-2 bg-terminal-bg rounded">
            <div className="text-lg font-mono font-bold text-terminal-text">
              {tenant.usage.configurations}
            </div>
            <div className="text-[10px] text-terminal-dim">Configs</div>
          </div>
        </div>

        {/* Usage Details */}
        {showUsage && (
          <div className="space-y-2 p-3 bg-terminal-bg border border-terminal-border rounded-lg">
            <div className="text-xs text-terminal-dim font-mono">Resource Usage</div>

            {[
              { key: "applications", label: "Applications", used: tenant.usage.applications, limit: tenant.limits.maxApplications },
              { key: "configurations", label: "Configurations", used: tenant.usage.configurations, limit: tenant.limits.maxConfigurations },
              { key: "secrets", label: "Secrets", used: tenant.usage.secrets, limit: tenant.limits.maxSecrets },
              { key: "users", label: "Users", used: tenant.usage.users, limit: tenant.limits.maxUsers },
              { key: "webhooks", label: "Webhooks", used: tenant.usage.webhooks, limit: tenant.limits.maxWebhooks },
              { key: "featureFlags", label: "Feature Flags", used: tenant.usage.featureFlags, limit: tenant.limits.maxFeatureFlags },
            ].map((item) => {
              const percentage = isUnlimited(item.limit) ? 0 : usagePercentages[item.key as keyof typeof usagePercentages];
              const isNearLimit = !isUnlimited(item.limit) && percentage >= 80;
              const isOverLimit = !isUnlimited(item.limit) && percentage >= 100;

              return (
                <div key={item.key} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-terminal-dim">{item.label}</span>
                    <span className={cn(
                      "font-mono",
                      isOverLimit ? "text-terminal-coral" :
                      isNearLimit ? "text-yellow-400" :
                      "text-terminal-text"
                    )}>
                      {item.used} / {isUnlimited(item.limit) ? "∞" : item.limit}
                    </span>
                  </div>
                  {!isUnlimited(item.limit) && (
                    <Progress
                      value={Math.min(percentage, 100)}
                      className="h-1"
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Trial/S Subscription Info */}
        {tenant.status === "TRIAL" && tenant.trialEndsAt && (
          <div className="p-2 bg-blue-500/10 border border-blue-500/30 rounded text-xs">
            <div className="text-blue-400 font-mono">
              Trial ends {formatRelativeTime(new Date(tenant.trialEndsAt))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-terminal-dim font-mono pt-2 border-t border-terminal-border">
          <span>Created {formatRelativeTime(new Date(tenant.createdAt))}</span>
          <span>Updated {formatRelativeTime(new Date(tenant.updatedAt))}</span>
        </div>
      </CardContent>
    </Card>
  );
}
