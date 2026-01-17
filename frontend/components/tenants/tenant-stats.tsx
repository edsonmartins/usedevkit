"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Users, CheckCircle, Ban, XCircle, Clock, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TenantStats } from "@/lib/types/tenant";

interface TenantStatsProps {
  stats: TenantStats | null | undefined;
  isLoading?: boolean;
}

export function TenantStats({ stats, isLoading }: TenantStatsProps) {
  if (isLoading) {
    return (
      <Card className="bg-terminal-surface border-terminal-border">
        <CardHeader className="pb-3">
          <CardTitle className="font-mono text-sm text-terminal-text flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-terminal-green" />
            Tenant Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-terminal-dim font-mono text-sm">
            Loading stats...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return null;
  }

  const statusBreakdown = [
    { label: "Active", value: stats.activeTenants, color: "bg-terminal-green", text: "text-terminal-green" },
    { label: "Trial", value: stats.trialTenants, color: "bg-blue-500", text: "text-blue-400" },
    { label: "Suspended", value: stats.suspendedTenants, color: "bg-yellow-500", text: "text-yellow-400" },
    { label: "Cancelled", value: stats.cancelledTenants, color: "bg-terminal-coral", text: "text-terminal-coral" },
  ];

  const planBreakdown = [
    { label: "Free", value: stats.tenantsByPlan.FREE, color: "bg-terminal-dim" },
    { label: "Starter", value: stats.tenantsByPlan.STARTER, color: "bg-blue-500" },
    { label: "Pro", value: stats.tenantsByPlan.PRO, color: "bg-purple-500" },
    { label: "Enterprise", value: stats.tenantsByPlan.ENTERPRISE, color: "bg-terminal-green" },
  ];

  const totalPlanRevenue = Object.entries(stats.tenantsByPlan).reduce((acc, [plan, count]) => {
    const monthlyPrices: Record<string, number> = {
      FREE: 0,
      STARTER: 29,
      PRO: 99,
      ENTERPRISE: 499,
    };
    return acc + (count * monthlyPrices[plan]);
  }, 0);

  return (
    <Card className="bg-terminal-surface border-terminal-border">
      <CardHeader className="pb-3">
        <CardTitle className="font-mono text-sm text-terminal-text flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-terminal-green" />
          Tenant Statistics
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Total */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-terminal-bg border border-terminal-border rounded-lg">
            <div className="flex items-center gap-2 text-terminal-dim mb-1">
              <Building2 className="h-4 w-4" />
              <span className="text-xs font-mono">Total Tenants</span>
            </div>
            <div className="text-2xl font-mono font-bold text-terminal-text">
              {stats.totalTenants}
            </div>
          </div>
          <div className="p-3 bg-terminal-bg border border-terminal-border rounded-lg">
            <div className="flex items-center gap-2 text-terminal-dim mb-1">
              <Users className="h-4 w-4" />
              <span className="text-xs font-mono">Active Users</span>
            </div>
            <div className="text-2xl font-mono font-bold text-terminal-text">
              {stats.activeTenants}
            </div>
          </div>
        </div>

        {/* Status Breakdown */}
        <div className="space-y-2">
          <div className="text-xs text-terminal-dim font-mono">Status Breakdown</div>
          <div className="space-y-1">
            {statusBreakdown.map((item) => (
              <div key={item.label} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className={cn("w-2 h-2 rounded-full", item.color)} />
                  <span className="text-terminal-dim">{item.label}</span>
                </div>
                <span className={cn("font-mono font-bold", item.text)}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Plan Breakdown */}
        <div className="space-y-2">
          <div className="text-xs text-terminal-dim font-mono">Plan Distribution</div>
          <div className="space-y-2">
            {planBreakdown.map((item) => {
              const percentage = stats.totalTenants > 0
                ? Math.round((item.value / stats.totalTenants) * 100)
                : 0;

              return (
                <div key={item.label} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-terminal-dim">{item.label}</span>
                    <span className="font-mono">{item.value} ({percentage}%)</span>
                  </div>
                  <div className="h-1.5 bg-terminal-bg rounded-full overflow-hidden">
                    <div
                      className={cn("h-full", item.color)}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Estimated MRR */}
        <div className="p-3 bg-terminal-green/10 border border-terminal-green/30 rounded-lg">
          <div className="text-xs text-terminal-green font-mono mb-1">Estimated Monthly Revenue</div>
          <div className="text-xl font-mono font-bold text-terminal-green">
            ${totalPlanRevenue.toLocaleString()}/month
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
