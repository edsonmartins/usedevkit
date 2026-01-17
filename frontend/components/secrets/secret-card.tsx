"use client";

import { useState } from "react";
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
import { Eye, EyeOff, MoreVertical, RotateCcw, ShieldAlert, ShieldCheck, Clock, AlertTriangle } from "lucide-react";
import { cn, formatRelativeTime } from "@/lib/utils";
import type { SecretMetadata, SecretStatus, SecretType } from "@/lib/types/secret";

const STATUS_CONFIG: Record<SecretStatus, { icon: typeof ShieldCheck; color: string; label: string }> = {
  ACTIVE: { icon: ShieldCheck, color: "text-terminal-green", label: "Active" },
  EXPIRED: { icon: AlertTriangle, color: "text-terminal-coral", label: "Expired" },
  ROTATION_PENDING: { icon: Clock, color: "text-yellow-400", label: "Rotation Pending" },
  DEACTIVATED: { icon: ShieldAlert, color: "text-terminal-dim", label: "Deactivated" },
};

const TYPE_COLORS: Record<SecretType, string> = {
  API_KEY: "bg-blue-500/20 text-blue-400 border-blue-500/50",
  PASSWORD: "bg-purple-500/20 text-purple-400 border-purple-500/50",
  CERTIFICATE: "bg-cyan-500/20 text-cyan-400 border-cyan-500/50",
  TOKEN: "bg-green-500/20 text-green-400 border-green-500/50",
  DATABASE_URL: "bg-orange-500/20 text-orange-400 border-orange-500/50",
  OTHER: "bg-terminal-border text-terminal-dim border-terminal-border",
};

interface SecretCardProps {
  secret: SecretMetadata;
  onReveal?: () => void;
  onRotate?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onDeactivate?: () => void;
  isRotating?: boolean;
  isDeleting?: boolean;
  isDeactivating?: boolean;
}

export function SecretCard({
  secret,
  onReveal,
  onRotate,
  onEdit,
  onDelete,
  onDeactivate,
  isRotating,
  isDeleting,
  isDeactivating,
}: SecretCardProps) {
  const [revealed, setRevealed] = useState(false);

  const statusConfig = STATUS_CONFIG[secret.status];
  const StatusIcon = statusConfig.icon;

  const daysUntilExpiration = secret.daysUntilExpiration;
  const isExpiringSoon = daysUntilExpiration !== undefined && daysUntilExpiration <= 7 && daysUntilExpiration >= 0;

  const handleReveal = () => {
    if (!revealed) {
      setRevealed(true);
      onReveal?.();
    }
  };

  const handleConceal = () => {
    setRevealed(false);
  };

  return (
    <Card
      className={cn(
        "bg-terminal-surface border-terminal-border transition-all hover:border-terminal-green/50",
        secret.status === "EXPIRED" && "border-terminal-coral/50",
        isExpiringSoon && "border-yellow-500/50",
        revealed && "ring-1 ring-terminal-green/50"
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <CardTitle className="font-mono text-base truncate">
                {secret.key}
              </CardTitle>
              <Badge
                variant="outline"
                className={cn("font-mono text-xs", TYPE_COLORS[secret.type])}
              >
                {secret.type}
              </Badge>
            </div>
            {secret.description && (
              <CardDescription className="text-terminal-dim text-sm line-clamp-1">
                {secret.description}
              </CardDescription>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Status Badge */}
            <div
              className={cn(
                "flex items-center gap-1 text-xs font-mono",
                statusConfig.color
              )}
            >
              <StatusIcon className="h-3 w-3" />
              <span>{statusConfig.label}</span>
            </div>

            {/* Actions Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-terminal-surface border-terminal-border">
                {secret.status === "ACTIVE" && (
                  <>
                    <DropdownMenuItem
                      onClick={onEdit}
                      className="font-mono text-sm cursor-pointer"
                    >
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={onRotate}
                      disabled={isRotating}
                      className="font-mono text-sm cursor-pointer"
                    >
                      <RotateCcw className="mr-2 h-4 w-4" />
                      {isRotating ? "Rotating..." : "Rotate"}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-terminal-border" />
                    <DropdownMenuItem
                      onClick={onDeactivate}
                      disabled={isDeactivating}
                      className="font-mono text-sm text-terminal-coral cursor-pointer"
                    >
                      {isDeactivating ? "Deactivating..." : "Deactivate"}
                    </DropdownMenuItem>
                  </>
                )}
                {secret.status === "DEACTIVATED" && (
                  <DropdownMenuItem
                    onClick={onDelete}
                    disabled={isDeleting}
                    className="font-mono text-sm text-terminal-coral cursor-pointer"
                  >
                    {isDeleting ? "Deleting..." : "Delete Permanently"}
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Value Display */}
        <div className="flex items-center gap-2 p-2 bg-terminal-bg border border-terminal-border rounded-lg">
          <code
            className={cn(
              "flex-1 font-mono text-sm truncate",
              revealed ? "text-terminal-green" : "text-terminal-dim"
            )}
          >
            {revealed ? secret.key + "=****************" : "••••••••••••••••"}
          </code>
          <Button
            size="sm"
            variant="ghost"
            onClick={revealed ? handleConceal : handleReveal}
            className="h-7 w-7 p-0"
          >
            {revealed ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>

        {/* Metadata */}
        <div className="flex items-center justify-between text-xs text-terminal-dim font-mono">
          <div className="flex items-center gap-3">
            {secret.lastRotatedAt && (
              <span>
                Last rotated: {formatRelativeTime(new Date(secret.lastRotatedAt))}
              </span>
            )}
            {secret.rotationDays && (
              <span>
                Rotation: {secret.rotationDays}d
              </span>
            )}
          </div>
          {isExpiringSoon && (
            <Badge variant="outline" className="text-yellow-400 border-yellow-400/50">
              Expires in {daysUntilExpiration}d
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
