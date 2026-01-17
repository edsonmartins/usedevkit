"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { HeartPulse, Activity, Clock, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn, formatRelativeTime } from "@/lib/utils";
import type { Service, HealthCheckResult, ServiceStatus } from "@/lib/types/service";

interface HealthIndicatorProps {
  service: Service;
  healthResults?: HealthCheckResult[];
  onTriggerCheck?: () => void;
  isChecking?: boolean;
}

const STATUS_CONFIG: Record<ServiceStatus, { color: string; bg: string; icon: string }> = {
  HEALTHY: { color: "text-terminal-green", bg: "bg-terminal-green/20", icon: "✓" },
  DEGRADED: { color: "text-yellow-400", bg: "bg-yellow-500/20", icon: "⚠" },
  UNHEALTHY: { color: "text-terminal-coral", bg: "bg-terminal-coral/20", icon: "✗" },
  UNKNOWN: { color: "text-terminal-dim", bg: "bg-terminal-border", icon: "?" },
};

export function HealthIndicator({
  service,
  healthResults = [],
  onTriggerCheck,
  isChecking = false,
}: HealthIndicatorProps) {
  const statusConfig = STATUS_CONFIG[service.status];
  const recentResults = healthResults.slice(0, 10);

  // Calculate health percentage
  const healthyCount = healthResults.filter((r) => r.status === "UP").length;
  const degradedCount = healthResults.filter((r) => r.status === "DEGRADED").length;
  const healthPercentage = healthResults.length > 0
    ? Math.round((healthyCount / healthResults.length) * 100)
    : 0;

  return (
    <Card className="bg-terminal-surface border-terminal-border">
      <CardHeader className="pb-3">
        <CardTitle className="font-mono text-sm text-terminal-text flex items-center gap-2">
          <HeartPulse className="h-4 w-4 text-terminal-green" />
          Health Status
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Current Status */}
        <div className="flex items-center justify-between">
          <Badge
            variant="outline"
            className={cn("font-mono text-sm", statusConfig.bg, statusConfig.color, "border-0")}
          >
            <span className="mr-2">{statusConfig.icon}</span>
            {service.status}
          </Badge>
          {onTriggerCheck && (
            <Button
              size="sm"
              variant="outline"
              onClick={onTriggerCheck}
              disabled={isChecking}
              className="font-mono text-xs border-terminal-green/50 text-terminal-green hover:bg-terminal-green/10"
            >
              <Activity className={cn("h-3 w-3 mr-1", isChecking && "animate-pulse")} />
              {isChecking ? "Checking..." : "Check Now"}
            </Button>
          )}
        </div>

        {/* Response Time */}
        {service.responseTime !== undefined && (
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-terminal-dim">Response Time</span>
            <span className={cn(
              service.responseTime < 200 ? "text-terminal-green" :
              service.responseTime < 500 ? "text-yellow-400" :
              "text-terminal-coral"
            )}>
              {service.responseTime}ms
            </span>
          </div>
        )}

        {/* Health Percentage */}
        {healthResults.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-terminal-dim">Uptime (last {healthResults.length} checks)</span>
              <span className={cn(
                healthPercentage >= 90 ? "text-terminal-green" :
                healthPercentage >= 70 ? "text-yellow-400" :
                "text-terminal-coral"
              )}>
                {healthPercentage}%
              </span>
            </div>
            <div className="h-2 bg-terminal-bg rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full transition-all",
                  healthPercentage >= 90 ? "bg-terminal-green" :
                  healthPercentage >= 70 ? "bg-yellow-400" :
                  "bg-terminal-coral"
                )}
                style={{ width: `${healthPercentage}%` }}
              />
            </div>
          </div>
        )}

        {/* Last Check */}
        <div className="flex items-center justify-between text-xs text-terminal-dim font-mono">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Last check
          </span>
          <span>
            {service.lastHealthCheck
              ? formatRelativeTime(new Date(service.lastHealthCheck))
              : "Never"}
          </span>
        </div>

        {/* Recent Results */}
        {recentResults.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-terminal-border">
            <div className="text-xs text-terminal-dim font-mono">Recent Checks</div>
            <div className="space-y-1 max-h-[120px] overflow-y-auto">
              {recentResults.map((result, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-terminal-bg border border-terminal-border rounded text-xs"
                >
                  <div className="flex items-center gap-2">
                    {result.status === "UP" ? (
                      <TrendingUp className="h-3 w-3 text-terminal-green" />
                    ) : result.status === "DEGRADED" ? (
                      <Minus className="h-3 w-3 text-yellow-400" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-terminal-coral" />
                    )}
                    <span className={cn(
                      "font-mono",
                      result.status === "UP" ? "text-terminal-green" :
                      result.status === "DEGRADED" ? "text-yellow-400" :
                      "text-terminal-coral"
                    )}>
                      {result.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-terminal-dim">
                    {result.responseTime !== undefined && (
                      <span>{result.responseTime}ms</span>
                    )}
                    <span className="font-mono">
                      {formatRelativeTime(new Date(result.timestamp))}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface HealthResultsDialogProps {
  open: boolean;
  onClose: () => void;
  service: Service;
  healthResults?: HealthCheckResult[];
  onTriggerCheck?: () => void;
  isChecking?: boolean;
}

export function HealthResultsDialog({
  open,
  onClose,
  service,
  healthResults = [],
  onTriggerCheck,
  isChecking = false,
}: HealthResultsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-terminal-surface border-terminal-border">
        <DialogHeader>
          <DialogTitle className="font-mono text-lg text-terminal-text flex items-center gap-2">
            <HeartPulse className="h-5 w-5 text-terminal-green" />
            Health History: {service.name}
          </DialogTitle>
          <DialogDescription className="text-terminal-dim">
            Historical health check results
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {onTriggerCheck && (
            <div className="flex justify-end">
              <Button
                size="sm"
                variant="outline"
                onClick={onTriggerCheck}
                disabled={isChecking}
                className="font-mono text-xs border-terminal-green/50 text-terminal-green hover:bg-terminal-green/10"
              >
                <Activity className={cn("h-3 w-3 mr-1", isChecking && "animate-pulse")} />
                {isChecking ? "Checking..." : "Trigger Health Check"}
              </Button>
            </div>
          )}

          {healthResults.length === 0 ? (
            <div className="text-center py-8 text-terminal-dim font-mono">
              No health check results yet
            </div>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {healthResults.map((result, index) => (
                <div
                  key={index}
                  className="p-3 bg-terminal-bg border border-terminal-border rounded-lg"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {result.status === "UP" ? (
                        <TrendingUp className="h-4 w-4 text-terminal-green" />
                      ) : result.status === "DEGRADED" ? (
                        <Minus className="h-4 w-4 text-yellow-400" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-terminal-coral" />
                      )}
                      <span className={cn(
                        "font-mono text-sm",
                        result.status === "UP" ? "text-terminal-green" :
                        result.status === "DEGRADED" ? "text-yellow-400" :
                        "text-terminal-coral"
                      )}>
                        {result.status}
                      </span>
                    </div>
                    <span className="text-xs text-terminal-dim font-mono">
                      {formatRelativeTime(new Date(result.timestamp))}
                    </span>
                  </div>
                  {result.responseTime !== undefined && (
                    <div className="text-xs text-terminal-dim font-mono">
                      Response: {result.responseTime}ms
                    </div>
                  )}
                  {result.message && (
                    <div className="text-xs text-terminal-dim mt-1">{result.message}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
