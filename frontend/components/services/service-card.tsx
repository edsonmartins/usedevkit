"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreVertical,
  Server,
  Activity,
  Edit,
  Trash2,
  HeartPulse,
  Network,
  Tag,
  Clock,
  Gauge,
} from "lucide-react";
import { cn, formatRelativeTime } from "@/lib/utils";
import type { Service, ServiceStatus } from "@/lib/types/service";

const STATUS_CONFIG: Record<ServiceStatus, { color: string; bg: string; label: string; icon: string }> = {
  HEALTHY: { color: "text-terminal-green", bg: "bg-terminal-green/20", label: "Healthy", icon: "●" },
  DEGRADED: { color: "text-yellow-400", bg: "bg-yellow-500/20", label: "Degraded", icon: "◐" },
  UNHEALTHY: { color: "text-terminal-coral", bg: "bg-terminal-coral/20", label: "Unhealthy", icon: "●" },
  UNKNOWN: { color: "text-terminal-dim", bg: "bg-terminal-border", label: "Unknown", icon: "○" },
};

const TYPE_CONFIG: Record<string, { icon: typeof Server; color: string }> = {
  API: { icon: Server, color: "text-blue-400" },
  WORKER: { icon: Activity, color: "text-purple-400" },
  DATABASE: { icon: Server, color: "text-orange-400" },
  CACHE: { icon: Server, color: "text-cyan-400" },
  QUEUE: { icon: Network, color: "text-pink-400" },
  OTHER: { icon: Server, color: "text-terminal-dim" },
};

interface ServiceCardProps {
  service: Service;
  onEdit?: () => void;
  onDelete?: () => void;
  onHealthCheck?: () => void;
  isCheckingHealth?: boolean;
  isDeleting?: boolean;
}

export function ServiceCard({
  service,
  onEdit,
  onDelete,
  onHealthCheck,
  isCheckingHealth,
  isDeleting,
}: ServiceCardProps) {
  const [showDependents, setShowDependents] = useState(false);
  const statusConfig = STATUS_CONFIG[service.status];
  const typeConfig = TYPE_CONFIG[service.type] || TYPE_CONFIG.OTHER;
  const TypeIcon = typeConfig.icon;

  return (
    <Card
      className={cn(
        "bg-terminal-surface border-terminal-border transition-all",
        service.status === "HEALTHY" && "border-terminal-green/30",
        service.status === "UNHEALTHY" && "border-terminal-coral/50"
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <TypeIcon className={cn("h-4 w-4", typeConfig.color)} />
              <CardTitle className="font-mono text-base truncate">
                {service.name}
              </CardTitle>
              <Badge
                variant="outline"
                className={cn("font-mono text-xs shrink-0", statusConfig.bg, statusConfig.color, "border-0")}
              >
                <span className="mr-1">{statusConfig.icon}</span>
                {statusConfig.label}
              </Badge>
            </div>
            {service.description && (
              <p className="text-xs text-terminal-dim line-clamp-1">{service.description}</p>
            )}
            {service.url && (
              <p className="text-xs text-terminal-dim font-mono truncate mt-1">{service.url}</p>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-terminal-surface border-terminal-border">
              <DropdownMenuItem
                onClick={onHealthCheck}
                disabled={isCheckingHealth}
                className="font-mono text-sm cursor-pointer"
              >
                <HeartPulse className="mr-2 h-4 w-4" />
                {isCheckingHealth ? "Checking..." : "Health Check"}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setShowDependents(!showDependents)}
                className="font-mono text-sm cursor-pointer"
              >
                <Network className="mr-2 h-4 w-4" />
                {showDependents ? "Hide" : "Show"} Dependencies
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
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Response Time */}
        {service.responseTime !== undefined && (
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-terminal-dim flex items-center gap-1">
              <Gauge className="h-3 w-3" />
              Response Time
            </span>
            <span className={cn(
              service.responseTime < 200 ? "text-terminal-green" :
              service.responseTime < 500 ? "text-yellow-400" :
              "text-terminal-coral"
            )}>
              {service.responseTime}ms
            </span>
          </div>
        )}

        {/* Meta Info */}
        <div className="flex flex-wrap gap-2">
          {service.version && (
            <Badge variant="outline" className="font-mono text-xs bg-terminal-bg border-terminal-border">
              v{service.version}
            </Badge>
          )}
          {service.environment && (
            <Badge variant="outline" className="font-mono text-xs bg-terminal-bg border-terminal-border">
              {service.environment}
            </Badge>
          )}
          {service.team && (
            <Badge variant="outline" className="font-mono text-xs bg-terminal-bg border-terminal-border">
              {service.team}
            </Badge>
          )}
        </div>

        {/* Tags */}
        {service.tags && service.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {service.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-xs font-mono text-terminal-dim flex items-center gap-1"
              >
                <Tag className="h-3 w-3" />
                {tag}
              </span>
            ))}
            {service.tags.length > 3 && (
              <span className="text-xs text-terminal-dim">+{service.tags.length - 3}</span>
            )}
          </div>
        )}

        {/* Dependencies */}
        {showDependents && (
          <div className="space-y-2 p-3 bg-terminal-bg border border-terminal-border rounded-lg">
            <div className="text-xs text-terminal-dim font-mono">
              Dependencies ({service.dependencies.length})
            </div>
            {service.dependencies.length === 0 ? (
              <p className="text-xs text-terminal-dim">No dependencies</p>
            ) : (
              <div className="flex flex-wrap gap-1">
                {service.dependencies.map((depId) => (
                  <Badge
                    key={depId}
                    variant="outline"
                    className="font-mono text-xs bg-terminal-bg border-terminal-border"
                  >
                    {depId.slice(0, 8)}
                  </Badge>
                ))}
              </div>
            )}
            {service.dependents.length > 0 && (
              <>
                <div className="text-xs text-terminal-dim font-mono pt-2">
                  Depended by ({service.dependents.length})
                </div>
                <div className="flex flex-wrap gap-1">
                  {service.dependents.map((depId) => (
                    <Badge
                      key={depId}
                      variant="outline"
                      className="font-mono text-xs bg-terminal-bg border-terminal-border"
                    >
                      {depId.slice(0, 8)}
                    </Badge>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Last Health Check */}
        <div className="flex items-center justify-between text-xs text-terminal-dim font-mono pt-2 border-t border-terminal-border">
          {service.lastHealthCheck ? (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Last check {formatRelativeTime(new Date(service.lastHealthCheck))}
            </span>
          ) : (
            <span>Never checked</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
