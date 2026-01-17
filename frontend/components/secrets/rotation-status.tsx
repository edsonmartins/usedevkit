"use client";

import { useState } from "react";
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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Clock, AlertTriangle, CheckCircle, RotateCcw, History } from "lucide-react";
import { cn, formatRelativeTime } from "@/lib/utils";
import { toast } from "sonner";
import type { SecretRotationHistory } from "@/lib/types/secret";

interface RotationStatusProps {
  lastRotatedAt?: string;
  rotationDays?: number;
  expiresAt?: string;
  daysUntilExpiration?: number;
  status: string;
  onRotate?: (reason?: string) => void;
  isRotating?: boolean;
}

export function RotationStatus({
  lastRotatedAt,
  rotationDays,
  expiresAt,
  daysUntilExpiration,
  status,
  onRotate,
  isRotating,
}: RotationStatusProps) {
  const [showHistory, setShowHistory] = useState(false);
  const [showRotateDialog, setShowRotateDialog] = useState(false);
  const [rotationReason, setRotationReason] = useState("");

  const isExpiringSoon = daysUntilExpiration !== undefined && daysUntilExpiration <= 7 && daysUntilExpiration >= 0;
  const isExpired = status === "EXPIRED";

  const getStatusColor = () => {
    if (isExpired) return "text-terminal-coral";
    if (isExpiringSoon) return "text-yellow-400";
    return "text-terminal-green";
  };

  const getStatusIcon = () => {
    if (isExpired) return AlertTriangle;
    if (isExpiringSoon) return Clock;
    return CheckCircle;
  };

  const StatusIcon = getStatusIcon();

  const handleRotate = () => {
    onRotate?.(rotationReason || undefined);
    setShowRotateDialog(false);
    setRotationReason("");
    toast.success("Secret rotation initiated");
  };

  return (
    <>
      <Card className="bg-terminal-surface border-terminal-border">
        <CardHeader className="pb-3">
          <CardTitle className="font-mono text-sm text-terminal-dim flex items-center gap-2">
            <RotateCcw className="h-4 w-4" />
            Rotation Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Status Indicator */}
          <div className={cn("flex items-center gap-2", getStatusColor())}>
            <StatusIcon className="h-4 w-4" />
            <span className="font-mono text-sm">
              {isExpired ? "Expired" : isExpiringSoon ? "Expiring Soon" : "Healthy"}
            </span>
          </div>

          {/* Rotation Details */}
          <div className="space-y-2 text-xs font-mono text-terminal-dim">
            {lastRotatedAt && (
              <div className="flex justify-between">
                <span>Last rotated:</span>
                <span className="text-terminal-text">
                  {formatRelativeTime(new Date(lastRotatedAt))}
                </span>
              </div>
            )}
            {rotationDays && (
              <div className="flex justify-between">
                <span>Rotation period:</span>
                <span className="text-terminal-text">{rotationDays} days</span>
              </div>
            )}
            {expiresAt && (
              <div className="flex justify-between">
                <span>Expires:</span>
                <span className={cn(
                  "text-terminal-text",
                  isExpiringSoon && "text-yellow-400",
                  isExpired && "text-terminal-coral"
                )}>
                  {new Date(expiresAt).toLocaleDateString()}
                </span>
              </div>
            )}
            {daysUntilExpiration !== undefined && daysUntilExpiration >= 0 && (
              <div className="flex justify-between">
                <span>Days until expiration:</span>
                <span className={cn(
                  "font-bold",
                  isExpiringSoon && "text-yellow-400",
                  isExpired && "text-terminal-coral"
                )}>
                  {daysUntilExpiration} days
                </span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowRotateDialog(true)}
              disabled={isRotating}
              className="flex-1 font-mono text-xs border-terminal-green/50 text-terminal-green hover:bg-terminal-green/10"
            >
              <RotateCcw className="mr-1 h-3 w-3" />
              {isRotating ? "Rotating..." : "Rotate Now"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Rotate Dialog */}
      <Dialog open={showRotateDialog} onOpenChange={setShowRotateDialog}>
        <DialogContent className="sm:max-w-[400px] bg-terminal-surface border-terminal-border">
          <DialogHeader>
            <DialogTitle className="font-mono text-lg text-terminal-text">
              Rotate Secret
            </DialogTitle>
            <DialogDescription className="text-terminal-dim">
              Generate a new value for this secret
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason" className="text-terminal-text">
                Reason <span className="text-terminal-dim">(optional)</span>
              </Label>
              <Input
                id="reason"
                placeholder="Scheduled rotation"
                className="font-mono"
                value={rotationReason}
                onChange={(e) => setRotationReason(e.target.value)}
              />
            </div>

            <div className="p-3 bg-terminal-coral/10 border border-terminal-coral/30 rounded-lg">
              <p className="text-xs text-terminal-coral">
                <span className="font-bold">Warning:</span> The old secret value will be permanently
                replaced. Make sure all services are updated before rotating.
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowRotateDialog(false)}
                className="border-terminal-border"
              >
                Cancel
              </Button>
              <Button
                onClick={handleRotate}
                disabled={isRotating}
                className="font-mono bg-terminal-green/20 text-terminal-green hover:bg-terminal-green/30"
              >
                Confirm Rotation
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

interface RotationHistoryProps {
  history: SecretRotationHistory[];
}

export function RotationHistory({ history }: RotationHistoryProps) {
  const [showDialog, setShowDialog] = useState(false);

  return (
    <>
      <Card className="bg-terminal-surface border-terminal-border">
        <CardHeader className="pb-3">
          <CardTitle className="font-mono text-sm text-terminal-dim flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="h-4 w-4" />
              Rotation History
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowDialog(true)}
              className="text-xs text-terminal-green hover:text-terminal-green/80"
            >
              View All ({history.length})
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <div className="text-xs text-terminal-dim font-mono py-2">
              No rotation history
            </div>
          ) : (
            <div className="space-y-2">
              {history.slice(0, 3).map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-2 bg-terminal-bg rounded border border-terminal-border"
                >
                  <div className="text-xs font-mono text-terminal-dim">
                    {formatRelativeTime(new Date(entry.rotatedAt))}
                  </div>
                  {entry.reason && (
                    <div className="text-xs text-terminal-text truncate max-w-[150px]">
                      {entry.reason}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Full History Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[500px] bg-terminal-surface border-terminal-border max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="font-mono text-lg text-terminal-text">
              Rotation History
            </DialogTitle>
            <DialogDescription className="text-terminal-dim">
              Complete history of secret rotations
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto py-4 space-y-2">
            {history.map((entry, index) => (
              <div
                key={entry.id}
                className="p-3 bg-terminal-bg border border-terminal-border rounded-lg"
              >
                <div className="flex items-start justify-between mb-1">
                  <div className="font-mono text-sm text-terminal-text">
                    #{history.length - index}
                  </div>
                  <div className="text-xs text-terminal-dim">
                    {formatRelativeTime(new Date(entry.rotatedAt))}
                  </div>
                </div>
                {entry.reason && (
                  <div className="text-xs text-terminal-dim mt-1">
                    Reason: {entry.reason}
                  </div>
                )}
                <div className="text-xs text-terminal-dim mt-1 font-mono">
                  Previous: {entry.previousValuePrefix}...
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
