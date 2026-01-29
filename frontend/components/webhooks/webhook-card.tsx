"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreVertical,
  Globe,
  TestTube,
  Trash2,
  Edit,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
} from "lucide-react";
import { cn, formatRelativeTime } from "@/lib/utils";
import type { Webhook, WebhookStatus } from "@/lib/types/webhook";

const STATUS_CONFIG: Record<WebhookStatus, { icon: typeof CheckCircle; color: string; label: string; bg: string }> = {
  ACTIVE: { icon: CheckCircle, color: "text-terminal-green", label: "Active", bg: "bg-terminal-green/20" },
  INACTIVE: { icon: XCircle, color: "text-terminal-dim", label: "Inactive", bg: "bg-terminal-border" },
  FAILED: { icon: XCircle, color: "text-terminal-coral", label: "Failed", bg: "bg-terminal-coral/20" },
};

const EVENT_COLORS: Record<string, string> = {
  CONFIGURATION_CREATED: "bg-green-500/20 text-green-400",
  CONFIGURATION_UPDATED: "bg-blue-500/20 text-blue-400",
  CONFIGURATION_DELETED: "bg-red-500/20 text-red-400",
  SECRET_ROTATED: "bg-purple-500/20 text-purple-400",
  SECRET_ROTATION_FAILED: "bg-red-500/20 text-red-400",
  SECRET_EXPIRED: "bg-yellow-500/20 text-yellow-400",
  PROMOTION_COMPLETED: "bg-emerald-500/20 text-emerald-400",
  PROMOTION_FAILED: "bg-pink-500/20 text-pink-400",
};

interface WebhookCardProps {
  webhook: Webhook;
  onToggle?: (id: string, active: boolean) => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onTest?: () => void;
  onViewDeliveries?: () => void;
  isToggling?: boolean;
  isDeleting?: boolean;
}

export function WebhookCard({
  webhook,
  onToggle,
  onEdit,
  onDelete,
  onTest,
  onViewDeliveries,
  isToggling,
  isDeleting,
}: WebhookCardProps) {
  const [showEvents, setShowEvents] = useState(false);

  const statusConfig = STATUS_CONFIG[webhook.status];
  const StatusIcon = statusConfig.icon;

  const successRate = webhook.successCount + webhook.failureCount > 0
    ? Math.round((webhook.successCount / (webhook.successCount + webhook.failureCount)) * 100)
    : 100;

  return (
    <Card
      className={cn(
        "bg-terminal-surface border-terminal-border transition-all",
        webhook.status === "ACTIVE" && "border-terminal-green/30"
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Globe className="h-4 w-4 text-terminal-dim" />
              <CardTitle className="font-mono text-base truncate">
                {webhook.name}
              </CardTitle>
              <Badge
                variant="outline"
                className={cn("font-mono text-xs shrink-0", statusConfig.bg, statusConfig.color, "border-0")}
              >
                <StatusIcon className="h-3 w-3 mr-1" />
                {statusConfig.label}
              </Badge>
            </div>
            <CardDescription className="text-terminal-dim text-sm font-mono truncate">
              {webhook.url}
            </CardDescription>
            {webhook.description && (
              <p className="text-xs text-terminal-dim mt-1 line-clamp-1">{webhook.description}</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Toggle */}
            <Switch
              checked={webhook.status === "ACTIVE"}
              onCheckedChange={(checked) => onToggle?.(webhook.id, checked)}
              disabled={isToggling}
              className={cn(
                "data-[state=checked]:bg-terminal-green",
                "data-[state=unchecked]:bg-terminal-dim"
              )}
            />

            {/* Actions Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-terminal-surface border-terminal-border">
                <DropdownMenuItem
                  onClick={onTest}
                  className="font-mono text-sm cursor-pointer"
                >
                  <TestTube className="mr-2 h-4 w-4" />
                  Test Webhook
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setShowEvents(!showEvents)}
                  className="font-mono text-sm cursor-pointer"
                >
                  <Zap className="mr-2 h-4 w-4" />
                  {showEvents ? "Hide" : "Show"} Events
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={onViewDeliveries}
                  className="font-mono text-sm cursor-pointer"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  View Deliveries
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-terminal-border" />
                <DropdownMenuItem
                  onClick={onEdit}
                  className="font-mono text-sm cursor-pointer"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-terminal-border" />
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
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Stats */}
        <div className="flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-3">
            <span className="text-terminal-dim">
              {webhook.successCount} success / {webhook.failureCount} failed
            </span>
            <span className={cn(
              "font-bold",
              successRate >= 80 ? "text-terminal-green" : successRate >= 50 ? "text-yellow-400" : "text-terminal-coral"
            )}>
              {successRate}% success
            </span>
          </div>
        </div>

        {/* Events */}
        {showEvents && (
          <div className="space-y-2 p-3 bg-terminal-bg border border-terminal-border rounded-lg">
            <div className="text-xs text-terminal-dim font-mono">Events ({webhook.events.length})</div>
            <div className="flex flex-wrap gap-1">
              {webhook.events.map((event) => (
                <Badge
                  key={event}
                  variant="outline"
                  className={cn("font-mono text-xs", EVENT_COLORS[event] || "bg-terminal-border text-terminal-dim", "border-0")}
                >
                  {event.replace(/_/g, " ").toLowerCase()}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Last Triggered */}
        <div className="flex items-center justify-between text-xs text-terminal-dim font-mono pt-2 border-t border-terminal-border">
          {webhook.lastTriggeredAt ? (
            <span>Last triggered {formatRelativeTime(new Date(webhook.lastTriggeredAt))}</span>
          ) : (
            <span>Never triggered</span>
          )}
          {webhook.lastFailureAt && (
            <span className="text-terminal-coral">
              Last failed {formatRelativeTime(new Date(webhook.lastFailureAt))}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
