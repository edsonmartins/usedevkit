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
  ToggleLeft,
  ToggleRight,
  Users,
  Target,
  Copy,
  Edit,
  Trash2,
  Archive,
  TestTube,
} from "lucide-react";
import { cn, formatRelativeTime } from "@/lib/utils";
import type { FeatureFlag, FlagType } from "@/lib/types/feature-flag";

const TYPE_COLORS: Record<FlagType, string> = {
  BOOLEAN: "bg-green-500/20 text-green-400 border-green-500/50",
  STRING: "bg-blue-500/20 text-blue-400 border-blue-500/50",
  NUMBER: "bg-purple-500/20 text-purple-400 border-purple-500/50",
  JSON: "bg-orange-500/20 text-orange-400 border-orange-500/50",
};

interface FlagCardProps {
  flag: FeatureFlag;
  onToggle: (id: string, enabled: boolean) => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onArchive?: () => void;
  onCopyKey?: () => void;
  onTest?: () => void;
  isToggling?: boolean;
  isDeleting?: boolean;
}

export function FlagCard({
  flag,
  onToggle,
  onEdit,
  onDelete,
  onArchive,
  onCopyKey,
  onTest,
  isToggling,
  isDeleting,
}: FlagCardProps) {
  const [showVariants, setShowVariants] = useState(false);

  const rolloutPercent = flag.rolloutPercentage || (flag.enabled ? 100 : 0);
  const hasVariants = flag.variants && flag.variants.length > 0;
  const hasRules = flag.targetingRules && flag.targetingRules.length > 0;

  const getRolloutColor = () => {
    if (rolloutPercent === 0) return "bg-terminal-dim";
    if (rolloutPercent < 25) return "bg-terminal-coral";
    if (rolloutPercent < 50) return "bg-yellow-500";
    if (rolloutPercent < 75) return "bg-blue-500";
    return "bg-terminal-green";
  };

  return (
    <Card
      className={cn(
        "bg-terminal-surface border-terminal-border transition-all overflow-hidden",
        flag.enabled ? "border-terminal-green/30" : "border-terminal-border",
        !flag.enabled && "opacity-75"
      )}
    >
      {/* Status Bar */}
      <div className={cn(
        "h-1 w-full transition-all",
        flag.enabled ? "bg-terminal-green" : "bg-terminal-dim"
      )} />

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <CardTitle className="font-mono text-base truncate">
                {flag.name}
              </CardTitle>
              <Badge
                variant="outline"
                className={cn("font-mono text-xs shrink-0", TYPE_COLORS[flag.type])}
              >
                {flag.type}
              </Badge>
              {flag.enabled && (
                <Badge variant="outline" className="font-mono text-xs shrink-0 bg-terminal-green/20 text-terminal-green border-terminal-green/50">
                  <ToggleRight className="h-3 w-3 mr-1" />
                  ON
                </Badge>
              )}
            </div>
            <CardDescription className="text-terminal-dim text-sm font-mono truncate">
              {flag.key}
            </CardDescription>
            {flag.description && (
              <p className="text-xs text-terminal-dim mt-1 line-clamp-1">{flag.description}</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Toggle */}
            <Switch
              checked={flag.enabled}
              onCheckedChange={(checked) => onToggle(flag.id, checked)}
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
                  onClick={onCopyKey}
                  className="font-mono text-sm cursor-pointer"
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Key
                </DropdownMenuItem>
                {hasVariants && (
                  <DropdownMenuItem
                    onClick={() => setShowVariants(!showVariants)}
                    className="font-mono text-sm cursor-pointer"
                  >
                    <Users className="mr-2 h-4 w-4" />
                    {showVariants ? "Hide" : "Show"} Variants
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={onTest}
                  className="font-mono text-sm cursor-pointer"
                >
                  <TestTube className="mr-2 h-4 w-4" />
                  Test Flag
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
                  onClick={onArchive}
                  className="font-mono text-sm cursor-pointer"
                >
                  <Archive className="mr-2 h-4 w-4" />
                  Archive
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
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Rollout Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-terminal-dim">Rollout</span>
            <span className={cn(
              "font-bold",
              rolloutPercent === 0 ? "text-terminal-dim" : "text-terminal-green"
            )}>
              {rolloutPercent}%
            </span>
          </div>
          <div className="h-2 bg-terminal-bg rounded-full overflow-hidden border border-terminal-border">
            <div
              className={cn("h-full transition-all duration-300", getRolloutColor())}
              style={{ width: `${rolloutPercent}%` }}
            />
          </div>
        </div>

        {/* Variants Section */}
        {hasVariants && showVariants && (
          <div className="space-y-2 p-3 bg-terminal-bg rounded-lg border border-terminal-border">
            <div className="text-xs font-mono text-terminal-dim flex items-center gap-1">
              <Users className="h-3 w-3" />
              Variants ({flag.variants!.length})
            </div>
            <div className="space-y-1">
              {flag.variants!.map((variant) => (
                <div
                  key={variant.id}
                  className="flex items-center justify-between p-2 bg-terminal-surface rounded border border-terminal-border"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-terminal-green" />
                    <span className="text-sm font-mono">{variant.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-terminal-dim font-mono">{variant.value}</span>
                    <Badge variant="outline" className="text-xs">
                      {variant.rolloutPercentage}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="flex items-center gap-3 text-xs text-terminal-dim font-mono">
          {hasRules && (
            <div className="flex items-center gap-1">
              <Target className="h-3 w-3" />
              <span>{flag.targetingRules!.length} rules</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <span>Created {formatRelativeTime(new Date(flag.createdAt))}</span>
          </div>
        </div>

        {/* Default Value Preview */}
        {flag.type !== "BOOLEAN" && (
          <div className="p-2 bg-terminal-bg border border-terminal-border rounded">
            <div className="text-xs text-terminal-dim font-mono mb-1">Default Value</div>
            <code className="text-xs text-terminal-green truncate block">
              {flag.defaultValue.length > 30 ? flag.defaultValue.slice(0, 30) + "..." : flag.defaultValue}
            </code>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
