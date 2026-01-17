"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { TestTube, Check, X, User, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FeatureFlag } from "@/lib/types/feature-flag";

interface FlagTestDialogProps {
  open: boolean;
  onClose: () => void;
  flag: FeatureFlag | null;
}

interface TestContext {
  userId?: string;
  attributes?: Record<string, string>;
  ipAddress?: string;
}

export function FlagTestDialog({ open, onClose, flag }: FlagTestDialogProps) {
  const [context, setContext] = useState<TestContext>({});
  const [result, setResult] = useState<{
    enabled: boolean;
    value: string;
    variant?: string;
    reason: string;
  } | null>(null);
  const [testing, setTesting] = useState(false);

  const handleTest = async () => {
    if (!flag) return;

    setTesting(true);
    // Simulate evaluation - in real app, call the evaluate API
    setTimeout(() => {
      const isEnabled = flag.enabled;
      setResult({
        enabled: isEnabled,
        value: flag.defaultValue,
        variant: flag.variants?.[0]?.name,
        reason: isEnabled ? "Flag is enabled" : "Flag is disabled",
      });
      setTesting(false);
    }, 500);
  };

  const reset = () => {
    setContext({});
    setResult(null);
  };

  return (
    <Dialog open={open} onOpenChange={(open) => {
      if (!open) {
        reset();
        onClose();
      }
    }}>
      <DialogContent className="sm:max-w-[500px] bg-terminal-surface border-terminal-border">
        <DialogHeader>
          <DialogTitle className="font-mono text-xl text-terminal-text flex items-center gap-2">
            <TestTube className="h-5 w-5 text-terminal-green" />
            Test Flag
          </DialogTitle>
          <DialogDescription className="text-terminal-dim font-mono">
            {flag?.key}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Test Context */}
          <div className="space-y-3 p-4 bg-terminal-bg border border-terminal-border rounded-lg">
            <div className="flex items-center gap-2 text-sm font-mono text-terminal-dim">
              <User className="h-4 w-4" />
              Test Context
            </div>

            <div className="space-y-2">
              <Label htmlFor="userId" className="text-terminal-text text-xs">User ID</Label>
              <Input
                id="userId"
                placeholder="user_123"
                value={context.userId || ""}
                onChange={(e) => setContext({ ...context, userId: e.target.value })}
                className="font-mono text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ip" className="text-terminal-text text-xs">IP Address</Label>
              <Input
                id="ip"
                placeholder="192.168.1.1"
                value={context.ipAddress || ""}
                onChange={(e) => setContext({ ...context, ipAddress: e.target.value })}
                className="font-mono text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-terminal-text text-xs">Custom Attributes</Label>
              <div className="space-y-1">
                <Input
                  placeholder="key=value"
                  className="font-mono text-xs h-8 border-terminal-border bg-terminal-surface"
                  onChange={(e) => {
                    const [key, value] = e.target.value.split("=");
                    if (key && value) {
                      setContext({
                        ...context,
                        attributes: { ...context.attributes, [key]: value }
                      });
                    }
                  }}
                />
              </div>
            </div>
          </div>

          {/* Test Button */}
          <Button
            onClick={handleTest}
            disabled={testing || !flag}
            className="w-full font-mono"
          >
            {testing ? (
              <span className="animate-pulse">Testing...</span>
            ) : (
              <>
                <TestTube className="mr-2 h-4 w-4" />
                Run Evaluation
              </>
            )}
          </Button>

          {/* Result */}
          {result && (
            <div className={cn(
              "p-4 border rounded-lg",
              result.enabled ? "bg-terminal-green/10 border-terminal-green/30" : "bg-terminal-coral/10 border-terminal-coral/30"
            )}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {result.enabled ? (
                    <Check className="h-5 w-5 text-terminal-green" />
                  ) : (
                    <X className="h-5 w-5 text-terminal-coral" />
                  )}
                  <span className="font-mono font-bold">
                    {result.enabled ? "ENABLED" : "DISABLED"}
                  </span>
                </div>
                <Badge variant="outline" className={cn(
                  "font-mono text-xs",
                  result.enabled ? "border-terminal-green/50 text-terminal-green" : "border-terminal-coral/50 text-terminal-coral"
                )}>
                  {result.variant || "Default"}
                </Badge>
              </div>

              <div className="space-y-2 text-sm font-mono">
                <div className="flex justify-between">
                  <span className="text-terminal-dim">Value:</span>
                  <span className={cn("font-mono", result.enabled ? "text-terminal-green" : "text-terminal-dim")}>
                    {result.value}
                  </span>
                </div>
                <div className="text-xs text-terminal-dim">
                  Reason: {result.reason}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="p-3 bg-terminal-bg border border-terminal-border rounded-lg">
          <div className="flex items-start gap-2">
            <Settings className="h-4 w-4 text-terminal-dim mt-0.5" />
            <p className="text-xs text-terminal-dim">
              This simulates how the flag would evaluate for a specific user context.
              Rollout percentages are applied randomly during evaluation.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
