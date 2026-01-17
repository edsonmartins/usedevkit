"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  ArrowRight,
  MoreVertical,
  Check,
  X,
  Play,
  RotateCcw,
  Clock,
  AlertCircle,
  FileText,
  Eye,
} from "lucide-react";
import { cn, formatRelativeTime } from "@/lib/utils";
import type { Promotion, PromotionStatus } from "@/lib/types/promotion";

const STATUS_CONFIG: Record<PromotionStatus, { icon: typeof Clock; color: string; label: string; bg: string }> = {
  DRAFT: { icon: FileText, color: "text-terminal-dim", label: "Draft", bg: "bg-terminal-border" },
  PENDING_APPROVAL: { icon: Clock, color: "text-yellow-400", label: "Pending Approval", bg: "bg-yellow-500/20" },
  APPROVED: { icon: Check, color: "text-terminal-green", label: "Approved", bg: "bg-terminal-green/20" },
  EXECUTING: { icon: Play, color: "text-blue-400", label: "Executing", bg: "bg-blue-500/20" },
  COMPLETED: { icon: Check, color: "text-terminal-green", label: "Completed", bg: "bg-terminal-green/20" },
  FAILED: { icon: AlertCircle, color: "text-terminal-coral", label: "Failed", bg: "bg-terminal-coral/20" },
  ROLLBACK: { icon: RotateCcw, color: "text-orange-400", label: "Rollback", bg: "bg-orange-500/20" },
  CANCELLED: { icon: X, color: "text-terminal-dim", label: "Cancelled", bg: "bg-terminal-border" },
};

interface PromotionCardProps {
  promotion: Promotion;
  onApprove?: () => void;
  onReject?: () => void;
  onExecute?: () => void;
  onRollback?: () => void;
  onCancel?: () => void;
  onDelete?: () => void;
  onView?: () => void;
  isApproving?: boolean;
  isRejecting?: boolean;
  isExecuting?: boolean;
  isRollingBack?: boolean;
  isCancelling?: boolean;
  isDeleting?: boolean;
}

export function PromotionCard({
  promotion,
  onApprove,
  onReject,
  onExecute,
  onRollback,
  onCancel,
  onDelete,
  onView,
  isApproving,
  isRejecting,
  isExecuting,
  isRollingBack,
  isCancelling,
  isDeleting,
}: PromotionCardProps) {
  const statusConfig = STATUS_CONFIG[promotion.status];
  const StatusIcon = statusConfig.icon;

  const diffCount = promotion.diffs?.length || 0;
  const addedCount = promotion.diffs?.filter((d) => d.type === "ADDED").length || 0;
  const modifiedCount = promotion.diffs?.filter((d) => d.type === "MODIFIED").length || 0;
  const deletedCount = promotion.diffs?.filter((d) => d.type === "DELETED").length || 0;

  return (
    <Card className={cn(
      "bg-terminal-surface border-terminal-border transition-all",
      promotion.status === "FAILED" && "border-terminal-coral/50",
      promotion.status === "APPROVED" && "border-terminal-green/30"
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <CardTitle className="font-mono text-base truncate">
                {promotion.name}
              </CardTitle>
              <Badge
                variant="outline"
                className={cn("font-mono text-xs", statusConfig.bg, statusConfig.color, "border-0")}
              >
                <StatusIcon className="h-3 w-3 mr-1" />
                {statusConfig.label}
              </Badge>
            </div>
            <CardDescription className="text-terminal-dim text-sm line-clamp-1">
              {promotion.description || "No description"}
            </CardDescription>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-terminal-surface border-terminal-border">
              <DropdownMenuItem
                onClick={onView}
                className="font-mono text-sm cursor-pointer"
              >
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-terminal-border" />

              {promotion.status === "PENDING_APPROVAL" && (
                <>
                  <DropdownMenuItem
                    onClick={onApprove}
                    disabled={isApproving}
                    className="font-mono text-sm text-terminal-green cursor-pointer"
                  >
                    <Check className="mr-2 h-4 w-4" />
                    {isApproving ? "Approving..." : "Approve"}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={onReject}
                    disabled={isRejecting}
                    className="font-mono text-sm text-terminal-coral cursor-pointer"
                  >
                    <X className="mr-2 h-4 w-4" />
                    {isRejecting ? "Rejecting..." : "Reject"}
                  </DropdownMenuItem>
                </>
              )}

              {promotion.status === "APPROVED" && (
                <DropdownMenuItem
                  onClick={onExecute}
                  disabled={isExecuting}
                  className="font-mono text-sm cursor-pointer"
                >
                  <Play className="mr-2 h-4 w-4" />
                  {isExecuting ? "Executing..." : "Execute"}
                </DropdownMenuItem>
              )}

              {promotion.status === "COMPLETED" && (
                <DropdownMenuItem
                  onClick={onRollback}
                  disabled={isRollingBack}
                  className="font-mono text-sm text-orange-400 cursor-pointer"
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  {isRollingBack ? "Rolling back..." : "Rollback"}
                </DropdownMenuItem>
              )}

              {["DRAFT", "PENDING_APPROVAL"].includes(promotion.status) && (
                <DropdownMenuItem
                  onClick={onCancel}
                  disabled={isCancelling}
                  className="font-mono text-sm cursor-pointer"
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </DropdownMenuItem>
              )}

              <DropdownMenuSeparator className="bg-terminal-border" />
              <DropdownMenuItem
                onClick={onDelete}
                disabled={isDeleting}
                className="font-mono text-sm text-terminal-coral cursor-pointer"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Environment Flow */}
        <div className="flex items-center gap-2 p-3 bg-terminal-bg border border-terminal-border rounded-lg">
          <div className="flex-1 text-center">
            <div className="text-xs text-terminal-dim font-mono">Source</div>
            <div className="text-sm font-mono text-terminal-text">
              {promotion.sourceEnvironmentName || "Unknown"}
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-terminal-green" />
          <div className="flex-1 text-center">
            <div className="text-xs text-terminal-dim font-mono">Target</div>
            <div className="text-sm font-mono text-terminal-text">
              {promotion.targetEnvironmentName || "Unknown"}
            </div>
          </div>
        </div>

        {/* Diff Summary */}
        <div className="flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-3">
            {diffCount > 0 ? (
              <>
                <span className={cn("flex items-center gap-1", addedCount > 0 && "text-terminal-green")}>
                  <span className="w-2 h-2 rounded-full bg-terminal-green" />
                  +{addedCount}
                </span>
                <span className={cn("flex items-center gap-1", modifiedCount > 0 && "text-blue-400")}>
                  <span className="w-2 h-2 rounded-full bg-blue-400" />
                  ~{modifiedCount}
                </span>
                <span className={cn("flex items-center gap-1", deletedCount > 0 && "text-terminal-coral")}>
                  <span className="w-2 h-2 rounded-full bg-terminal-coral" />
                  -{deletedCount}
                </span>
              </>
            ) : (
              <span className="text-terminal-dim">No changes</span>
            )}
          </div>
          <span className="text-terminal-dim">
            {diffCount} config{diffCount !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Metadata */}
        <div className="flex items-center justify-between text-xs text-terminal-dim font-mono pt-2 border-t border-terminal-border">
          <div className="flex items-center gap-3">
            {promotion.createdBy && (
              <span>Created by {promotion.createdBy}</span>
            )}
            <span>{formatRelativeTime(new Date(promotion.createdAt))}</span>
          </div>
          {promotion.errorMessage && (
            <span className="text-terminal-coral truncate max-w-[150px]">
              {promotion.errorMessage}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
