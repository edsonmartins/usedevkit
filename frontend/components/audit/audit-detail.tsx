"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { FileText, User, Clock, Globe, Monitor } from "lucide-react";
import { cn, formatRelativeTime } from "@/lib/utils";
import type { AuditLog } from "@/lib/types/audit";
import { ACTION_CATEGORIES } from "@/lib/types/audit";

interface AuditDetailProps {
  log: AuditLog | null;
  open: boolean;
  onClose: () => void;
}

export function AuditDetail({ log, open, onClose }: AuditDetailProps) {
  if (!log) return null;

  const category = Object.values(ACTION_CATEGORIES).find((cat) =>
    cat.actions.includes(log.action)
  );

  const formatActionLabel = (action: string): string => {
    return action
      .split("_")
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(" ");
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-terminal-surface border-terminal-border">
        <DialogHeader>
          <DialogTitle className="font-mono text-lg text-terminal-text flex items-center gap-2">
            <FileText className="h-5 w-5 text-terminal-green" />
            Audit Log Details
          </DialogTitle>
          <DialogDescription className="text-terminal-dim">
            Detailed information about this audit event
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Action */}
          <div className="flex items-center gap-3 p-3 bg-terminal-bg border border-terminal-border rounded-lg">
            <Badge
              variant="outline"
              className={cn(
                "font-mono text-sm",
                category?.color || "bg-terminal-bg text-terminal-dim",
                "border-0"
              )}
            >
              {formatActionLabel(log.action)}
            </Badge>
            <div className="text-xs text-terminal-dim font-mono">
              {log.entityType}
              {log.entityId && ` • ${log.entityId}`}
            </div>
          </div>

          {/* User Info */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-terminal-dim text-xs font-mono">
              <User className="h-3 w-3" />
              Performed By
            </div>
            <div className="p-3 bg-terminal-bg border border-terminal-border rounded-lg">
              <div className="font-mono text-sm text-terminal-text">{log.userName}</div>
              <div className="text-xs text-terminal-dim font-mono">{log.userEmail}</div>
              <div className="text-[10px] text-terminal-dim font-mono mt-1">ID: {log.userId}</div>
            </div>
          </div>

          {/* Entity Info */}
          {log.entityName && (
            <div className="space-y-2">
              <div className="text-terminal-dim text-xs font-mono">Entity</div>
              <div className="p-3 bg-terminal-bg border border-terminal-border rounded-lg font-mono text-sm text-terminal-text">
                {log.entityName}
              </div>
            </div>
          )}

          {/* Changes */}
          {log.changes && Object.keys(log.changes).length > 0 && (
            <div className="space-y-2">
              <div className="text-terminal-dim text-xs font-mono">Changes</div>
              <div className="space-y-1">
                {Object.entries(log.changes).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex items-center gap-2 p-2 bg-terminal-bg border border-terminal-border rounded text-xs font-mono"
                  >
                    <span className="text-terminal-dim w-1/3">{key}:</span>
                    <div className="flex-1 flex items-center gap-2">
                      {value.from !== undefined && (
                        <>
                          <span className="text-terminal-coral line-through">
                            {JSON.stringify(value.from)}
                          </span>
                          <span className="text-terminal-dim">→</span>
                        </>
                      )}
                      {value.to !== undefined && (
                        <span className="text-terminal-green">
                          {JSON.stringify(value.to)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Metadata */}
          {log.metadata && Object.keys(log.metadata).length > 0 && (
            <div className="space-y-2">
              <div className="text-terminal-dim text-xs font-mono">Metadata</div>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(log.metadata).map(([key, value]) => (
                  <div
                    key={key}
                    className="p-2 bg-terminal-bg border border-terminal-border rounded text-xs"
                  >
                    <div className="text-terminal-dim font-mono mb-1">{key}</div>
                    <div className="font-mono text-terminal-text break-all">
                      {typeof value === "string" ? value : JSON.stringify(value, null, 2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Request Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-terminal-dim text-xs font-mono">
                <Clock className="h-3 w-3" />
                Timestamp
              </div>
              <div className="text-sm font-mono text-terminal-text">
                {new Date(log.timestamp).toLocaleString()}
              </div>
              <div className="text-xs text-terminal-dim font-mono">
                {formatRelativeTime(new Date(log.timestamp))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-terminal-dim text-xs font-mono">
                <Globe className="h-3 w-3" />
                IP Address
              </div>
              <div className="text-sm font-mono text-terminal-text">
                {log.ipAddress || "N/A"}
              </div>
            </div>
          </div>

          {/* User Agent */}
          {log.userAgent && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-terminal-dim text-xs font-mono">
                <Monitor className="h-3 w-3" />
                User Agent
              </div>
              <div className="p-3 bg-terminal-bg border border-terminal-border rounded-lg">
                <div className="text-xs font-mono text-terminal-text break-all">
                  {log.userAgent}
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
