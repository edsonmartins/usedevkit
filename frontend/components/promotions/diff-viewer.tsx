"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, ArrowRight, Search, CheckCircle, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PromotionDiff } from "@/lib/types/promotion";
import type { Environment } from "@/lib/types/application";

interface DiffViewerProps {
  diffs: PromotionDiff[];
  sourceEnvironment: Environment;
  targetEnvironment: Environment;
  onCreatePromotion?: () => void;
  isLoading?: boolean;
}

export function DiffViewer({
  diffs,
  sourceEnvironment,
  targetEnvironment,
  onCreatePromotion,
  isLoading,
}: DiffViewerProps) {
  const [filter, setFilter] = useState<"ALL" | "ADDED" | "MODIFIED" | "DELETED">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredDiffs = diffs.filter((diff) => {
    const matchesFilter = filter === "ALL" || diff.type === filter;
    const matchesSearch = diff.key.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const addedCount = diffs.filter((d) => d.type === "ADDED").length;
  const modifiedCount = diffs.filter((d) => d.type === "MODIFIED").length;
  const deletedCount = diffs.filter((d) => d.type === "DELETED").length;

  const getDiffRow = (diff: PromotionDiff) => {
    switch (diff.type) {
      case "ADDED":
        return (
          <div className="p-3 bg-terminal-green/5 border border-terminal-green/20 rounded-lg">
            <div className="flex items-center justify-between mb-1">
              <code className="text-sm font-mono text-terminal-green">{diff.key}</code>
              <Badge variant="outline" className="text-xs bg-terminal-green/20 text-terminal-green border-0">
                ADDED
              </Badge>
            </div>
            <div className="text-xs text-terminal-dim font-mono">
              New value: <span className="text-terminal-green">{diff.newValue}</span>
            </div>
          </div>
        );
      case "MODIFIED":
        return (
          <div className="p-3 bg-blue-500/5 border border-blue-500/20 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <code className="text-sm font-mono text-blue-400">{diff.key}</code>
              <Badge variant="outline" className="text-xs bg-blue-500/20 text-blue-400 border-0">
                MODIFIED
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2 bg-terminal-bg rounded">
                <div className="text-terminal-dim mb-1">Old:</div>
                <span className="text-terminal-coral line-through">{diff.oldValue}</span>
              </div>
              <div className="p-2 bg-terminal-bg rounded">
                <div className="text-terminal-dim mb-1">New:</div>
                <span className="text-terminal-green">{diff.newValue}</span>
              </div>
            </div>
          </div>
        );
      case "DELETED":
        return (
          <div className="p-3 bg-terminal-coral/5 border border-terminal-coral/20 rounded-lg">
            <div className="flex items-center justify-between mb-1">
              <code className="text-sm font-mono text-terminal-coral">{diff.key}</code>
              <Badge variant="outline" className="text-xs bg-terminal-coral/20 text-terminal-coral border-0">
                DELETED
              </Badge>
            </div>
            <div className="text-xs text-terminal-dim font-mono">
              Previous value: <span className="text-terminal-coral">{diff.oldValue}</span>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="font-mono text-sm text-terminal-dim">
            <span className="text-terminal-green">{sourceEnvironment.name}</span>
          </div>
          <ArrowRight className="h-4 w-4 text-terminal-dim" />
          <div className="font-mono text-sm text-terminal-dim">
            <span className="text-blue-400">{targetEnvironment.name}</span>
          </div>
        </div>
        {onCreatePromotion && diffs.length > 0 && (
          <Button onClick={onCreatePromotion} className="font-mono" size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Create Promotion
          </Button>
        )}
      </div>

      {/* Summary Stats */}
      <div className="flex items-center gap-4 p-4 bg-terminal-bg border border-terminal-border rounded-lg">
        <div className="flex items-center gap-2">
          <span className="text-sm text-terminal-dim font-mono">Total:</span>
          <Badge variant="outline" className="font-mono text-sm">
            {diffs.length}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-terminal-green" />
          <span className="text-sm text-terminal-green font-mono">+{addedCount}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-400" />
          <span className="text-sm text-blue-400 font-mono">~{modifiedCount}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-terminal-coral" />
          <span className="text-sm text-terminal-coral font-mono">-{deletedCount}</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-terminal-dim" />
          <Input
            placeholder="Search configurations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 font-mono border-terminal-border bg-terminal-surface"
          />
        </div>
        <Select value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
          <SelectTrigger className="w-[150px] font-mono border-terminal-border bg-terminal-surface">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-terminal-surface border-terminal-border">
            <SelectItem value="ALL" className="font-mono">All Changes</SelectItem>
            <SelectItem value="ADDED" className="font-mono">Added</SelectItem>
            <SelectItem value="MODIFIED" className="font-mono">Modified</SelectItem>
            <SelectItem value="DELETED" className="font-mono">Deleted</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Diff List */}
      {isLoading ? (
        <div className="text-center py-8 text-terminal-dim font-mono">
          <span className="text-terminal-green">$</span> Loading diffs...
        </div>
      ) : filteredDiffs.length === 0 ? (
        <div className="text-center py-8 border border-terminal-border border-dashed rounded-lg">
          {searchQuery || filter !== "ALL" ? (
            <p className="text-terminal-dim font-mono">
              No changes match your filters
            </p>
          ) : (
            <div className="space-y-2">
              <CheckCircle className="h-8 w-8 mx-auto text-terminal-green" />
              <p className="text-terminal-dim font-mono">
                Environments are in sync
              </p>
              <p className="text-sm text-terminal-dim">
                No configuration differences found
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredDiffs.map((diff, index) => (
            <div key={`${diff.key}-${index}`}>
              {getDiffRow(diff)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
