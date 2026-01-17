"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, ArrowRight, RotateCcw } from "lucide-react";
import { cn, formatRelativeTime } from "@/lib/utils";
import { toast } from "sonner";
import type { Configuration, ConfigurationVersion, ConfigType } from "@/lib/types/configuration";

const TYPE_COLORS: Record<string, string> = {
  STRING: "bg-terminal-border text-terminal-dim",
  INTEGER: "bg-blue-500/20 text-blue-400",
  BOOLEAN: "bg-terminal-green/20 text-terminal-green",
  JSON: "bg-purple-500/20 text-purple-400",
  DOUBLE: "bg-cyan-500/20 text-cyan-400",
};

interface ConfigHistoryProps {
  open: boolean;
  onClose: () => void;
  configuration: Configuration | null;
  versions: ConfigurationVersion[];
  onRollback: (version: number, reason?: string) => void;
  isRollingBack?: boolean;
}

export function ConfigHistory({
  open,
  onClose,
  configuration,
  versions,
  onRollback,
  isRollingBack,
}: ConfigHistoryProps) {
  const [selectedVersion, setSelectedVersion] = useState<number | null>(null);
  const [rollbackReason, setRollbackReason] = useState("");
  const [showRollbackForm, setShowRollbackForm] = useState(false);

  const handleRollbackClick = (version: number) => {
    setSelectedVersion(version);
    setShowRollbackForm(true);
  };

  const handleConfirmRollback = () => {
    if (selectedVersion !== null) {
      onRollback(selectedVersion, rollbackReason || `Rollback to version ${selectedVersion}`);
      setShowRollbackForm(false);
      setSelectedVersion(null);
      setRollbackReason("");
    }
  };

  const getDiffIndicator = (oldValue: string, newValue: string) => {
    if (oldValue === newValue) {
      return <span className="text-terminal-dim">No change</span>;
    }
    return (
      <div className="flex items-center gap-2 text-xs">
        <span className="text-terminal-coral line-through">{oldValue.slice(0, 30)}{oldValue.length > 30 ? "..." : ""}</span>
        <ArrowRight className="h-3 w-3 text-terminal-green" />
        <span className="text-terminal-green">{newValue.slice(0, 30)}{newValue.length > 30 ? "..." : ""}</span>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-terminal-surface border-terminal-border max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-mono text-xl text-terminal-text">
            Configuration History
          </DialogTitle>
          <DialogDescription className="text-terminal-dim font-mono">
            {configuration?.key}
          </DialogDescription>
        </DialogHeader>

        {showRollbackForm ? (
          <div className="space-y-4 py-4">
            <div className="p-4 bg-terminal-bg border border-terminal-border rounded-lg">
              <div className="text-sm font-mono text-terminal-text mb-2">
                Rollback to version <span className="text-terminal-green">v{selectedVersion}</span>
              </div>
              <div className="text-xs text-terminal-dim">
                This will create a new version with the value from version {selectedVersion}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason" className="text-terminal-text">
                Reason <span className="text-terminal-dim">(optional)</span>
              </Label>
              <Input
                id="reason"
                placeholder="Why are you rolling back?"
                className="font-mono"
                value={rollbackReason}
                onChange={(e) => setRollbackReason(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowRollbackForm(false);
                  setSelectedVersion(null);
                  setRollbackReason("");
                }}
                className="border-terminal-border"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmRollback}
                disabled={isRollingBack}
                className="font-mono bg-terminal-green/20 text-terminal-green hover:bg-terminal-green/30"
              >
                {isRollingBack ? (
                  <span className="animate-pulse">Rolling back...</span>
                ) : (
                  <>
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Confirm Rollback
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto py-4">
            {versions.length === 0 ? (
              <div className="text-center py-8 text-terminal-dim font-mono">
                <span className="text-terminal-green">$</span> No history available
              </div>
            ) : (
              <div className="space-y-2">
                {versions.map((version, index) => {
                  const prevVersion = versions[index + 1];
                  const isCurrent = index === 0;

                  return (
                    <div
                      key={version.id}
                      className={cn(
                        "p-4 border border-terminal-border rounded-lg",
                        isCurrent ? "bg-terminal-green/5 border-terminal-green/30" : "bg-terminal-bg",
                        selectedVersion === version.version && "ring-1 ring-terminal-green"
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge
                              variant={isCurrent ? "default" : "outline"}
                              className={cn(
                                "font-mono text-xs",
                                isCurrent
                                  ? "bg-terminal-green/20 text-terminal-green border-terminal-green/50"
                                  : "bg-terminal-border text-terminal-dim"
                              )}
                            >
                              v{version.version}
                              {isCurrent && " (current)"}
                            </Badge>
                            <Badge
                              className={cn("font-mono text-xs", TYPE_COLORS[version.type])}
                            >
                              {version.type}
                            </Badge>
                          </div>

                          <div className="font-mono text-sm text-terminal-text mb-2">
                            <span className="text-terminal-dim">value:</span>{" "}
                            <code className="bg-terminal-border/30 px-2 py-0.5 rounded">
                              {version.value.length > 60
                                ? version.value.slice(0, 60) + "..."
                                : version.value}
                            </code>
                          </div>

                          {prevVersion && (
                            <div className="mb-2">
                              {getDiffIndicator(prevVersion.value, version.value)}
                            </div>
                          )}

                          <div className="flex items-center gap-4 text-xs text-terminal-dim">
                            <span>
                              {formatRelativeTime(new Date(version.createdAt))}
                            </span>
                            {version.createdBy && (
                              <span>by {version.createdBy}</span>
                            )}
                            {version.changeReason && (
                              <span className="text-terminal-text">
                                "{version.changeReason}"
                              </span>
                            )}
                          </div>
                        </div>

                        {!isCurrent && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRollbackClick(version.version)}
                            className="font-mono border-terminal-green/50 text-terminal-green hover:bg-terminal-green/10 ml-4 flex-shrink-0"
                          >
                            <RotateCcw className="mr-1 h-3 w-3" />
                            Rollback
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
