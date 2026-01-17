"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RefreshCw, CheckCircle, XCircle, Clock, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { cn, formatRelativeTime } from "@/lib/utils";
import type { WebhookDelivery } from "@/lib/types/webhook";

interface DeliveriesListProps {
  deliveries: WebhookDelivery[];
  isLoading?: boolean;
  onRetry?: (deliveryId: string) => void;
  isRetrying?: boolean;
}

const STATUS_CONFIG: Record<string, { icon: typeof CheckCircle; color: string; bg: string }> = {
  SUCCESS: { icon: CheckCircle, color: "text-terminal-green", bg: "bg-terminal-green/20" },
  FAILED: { icon: XCircle, color: "text-terminal-coral", bg: "bg-terminal-coral/20" },
  PENDING: { icon: Clock, color: "text-yellow-400", bg: "bg-yellow-500/20" },
  RETRYING: { icon: RefreshCw, color: "text-blue-400", bg: "bg-blue-500/20" },
};

export function DeliveriesList({
  deliveries,
  isLoading,
  onRetry,
  isRetrying,
}: DeliveriesListProps) {
  const [expandedDelivery, setExpandedDelivery] = useState<string | null>(null);
  const [showRequest, setShowRequest] = useState(false);

  const delivery = expandedDelivery ? deliveries.find((d) => d.id === expandedDelivery) : null;

  return (
    <Dialog open={!!expandedDelivery} onOpenChange={() => setExpandedDelivery(null)}>
      <DialogContent className="sm:max-w-[600px] bg-terminal-surface border-terminal-border">
        <DialogHeader>
          <DialogTitle className="font-mono text-lg text-terminal-text flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-terminal-green" />
            Delivery History
          </DialogTitle>
          <DialogDescription className="text-terminal-dim">
            Webhook delivery attempts and results
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {isLoading ? (
            <div className="text-center py-8 text-terminal-dim font-mono">
              Loading deliveries...
            </div>
          ) : deliveries.length === 0 ? (
            <div className="text-center py-8 text-terminal-dim font-mono">
              No deliveries yet
            </div>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {deliveries.map((del) => {
                const config = STATUS_CONFIG[del.status] || STATUS_CONFIG.PENDING;
                const StatusIcon = config.icon;

                return (
                  <div
                    key={del.id}
                    className={cn(
                      "p-3 border rounded-lg cursor-pointer transition-colors",
                      "border-terminal-border hover:border-terminal-green/50 bg-terminal-surface"
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge
                            variant="outline"
                            className={cn("text-xs font-mono", config.bg, config.color, "border-0")}
                          >
                            <StatusIcon className={cn("h-3 w-3 mr-1", del.status === "RETRYING" && "animate-spin")} />
                            {del.status}
                          </Badge>
                          <span className="text-xs text-terminal-dim font-mono">
                            Attempt {del.attempt} of {del.maxAttempts}
                          </span>
                        </div>
                        <div className="text-xs text-terminal-dim font-mono truncate">
                          {del.eventType.replace(/_/g, " ").toLowerCase()}
                        </div>
                      </div>
                      <div className="text-xs text-terminal-dim font-mono">
                        {formatRelativeTime(new Date(del.createdAt))}
                      </div>
                    </div>

                    {/* Details */}
                    <div className="mt-2 space-y-1 text-xs font-mono">
                      {del.statusCode && (
                        <div className="flex justify-between">
                          <span className="text-terminal-dim">Status:</span>
                          <span className={cn(
                            del.statusCode >= 200 && del.statusCode < 300 ? "text-terminal-green" : "text-terminal-coral"
                          )}>
                            {del.statusCode}
                          </span>
                        </div>
                      )}
                      {del.completedAt && (
                        <div className="flex justify-between">
                          <span className="text-terminal-dim">Completed:</span>
                          <span className="text-terminal-text">
                            {formatRelativeTime(new Date(del.completedAt))}
                          </span>
                        </div>
                      )}
                      {del.nextRetryAt && del.status === "FAILED" && (
                        <div className="flex justify-between">
                          <span className="text-terminal-dim">Next retry:</span>
                          <span className="text-yellow-400">
                            {formatRelativeTime(new Date(del.nextRetryAt))}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    {del.status === "FAILED" && onRetry && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onRetry(del.id)}
                        disabled={isRetrying}
                        className="mt-2 font-mono text-xs border-terminal-green/50 text-terminal-green hover:bg-terminal-green/10"
                      >
                        <RefreshCw className={cn("h-3 w-3 mr-1", isRetrying && "animate-spin")} />
                        Retry
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
