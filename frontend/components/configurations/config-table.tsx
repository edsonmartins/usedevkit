"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, MoreVertical, Eye, EyeOff, Edit, Trash2, History, Copy } from "lucide-react";
import { cn, copyToClipboard } from "@/lib/utils";
import { toast } from "sonner";
import type { Configuration, ConfigType } from "@/lib/types/configuration";

interface ConfigTableProps {
  configurations: Configuration[];
  onEdit: (config: Configuration) => void;
  onDelete: (config: Configuration) => void;
  onViewHistory: (config: Configuration) => void;
  isLoading?: boolean;
}

const TYPE_COLORS: Record<ConfigType, string> = {
  STRING: "bg-terminal-border text-terminal-dim",
  INTEGER: "bg-blue-500/20 text-blue-400",
  BOOLEAN: "bg-terminal-green/20 text-terminal-green",
  JSON: "bg-purple-500/20 text-purple-400",
  DOUBLE: "bg-cyan-500/20 text-cyan-400",
};

export function ConfigTable({
  configurations,
  onEdit,
  onDelete,
  onViewHistory,
  isLoading,
}: ConfigTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});

  const filteredConfigs = configurations.filter((config) =>
    config.key.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleSecretVisibility = (id: string) => {
    setShowSecrets((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopy = async (key: string, value: string) => {
    await copyToClipboard(`${key}=${value}`);
    toast.success("Configuration copied to clipboard");
  };

  const maskValue = (value: string) => {
    if (value.length <= 8) return "•".repeat(value.length);
    return value.slice(0, 4) + "•".repeat(value.length - 8) + value.slice(-4);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-terminal-dim font-mono">
          <span className="text-terminal-green">$</span> Loading configurations...
        </div>
      </div>
    );
  }

  if (configurations.length === 0) {
    return (
      <div className="text-center py-16 border border-terminal-border border-dashed rounded-lg">
        <div className="font-mono text-terminal-dim mb-4">
          <span className="text-terminal-green">$</span> No configurations found
        </div>
        <p className="text-terminal-dim text-sm">
          Add your first configuration to get started
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-terminal-dim" />
        <Input
          placeholder="Search configurations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 font-mono border-terminal-border bg-terminal-surface"
        />
      </div>

      {/* Table */}
      <div className="border border-terminal-border rounded-lg overflow-hidden bg-terminal-surface">
        <Table>
          <TableHeader>
            <TableRow className="border-terminal-border hover:bg-transparent">
              <TableHead>Key</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredConfigs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-terminal-dim py-8">
                  No configurations match your search
                </TableCell>
              </TableRow>
            ) : (
              filteredConfigs.map((config) => (
                <TableRow
                  key={config.id}
                  className={cn(
                    "border-terminal-border",
                    config.sensitive && "bg-terminal-coral/5"
                  )}
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <code className="text-terminal-green">{config.key}</code>
                      {config.sensitive && (
                        <Badge variant="outline" className="text-xs border-terminal-coral/50 text-terminal-coral">
                          <EyeOff className="h-3 w-3 mr-1" />
                          Secret
                        </Badge>
                      )}
                    </div>
                    {config.description && (
                      <div className="text-xs text-terminal-dim mt-1">{config.description}</div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <code
                        className={cn(
                          "text-sm",
                          config.sensitive && !showSecrets[config.id] && "text-terminal-dim"
                        )}
                      >
                        {config.sensitive && !showSecrets[config.id]
                          ? maskValue(config.value)
                          : config.value.length > 50
                            ? config.value.slice(0, 50) + "..."
                            : config.value}
                      </code>
                      {config.sensitive && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => toggleSecretVisibility(config.id)}
                        >
                          {showSecrets[config.id] ? (
                            <Eye className="h-3 w-3" />
                          ) : (
                            <EyeOff className="h-3 w-3" />
                          )}
                        </Button>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={cn("font-mono text-xs", TYPE_COLORS[config.type])}>
                      {config.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-terminal-surface border-terminal-border">
                        <DropdownMenuItem
                          onClick={() => handleCopy(config.key, config.value)}
                          className="font-mono text-sm cursor-pointer"
                        >
                          <Copy className="mr-2 h-4 w-4" />
                          Copy
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onEdit(config)}
                          className="font-mono text-sm cursor-pointer"
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onViewHistory(config)}
                          className="font-mono text-sm cursor-pointer"
                        >
                          <History className="mr-2 h-4 w-4" />
                          History
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-terminal-border" />
                        <DropdownMenuItem
                          onClick={() => onDelete(config)}
                          className="font-mono text-sm text-terminal-coral cursor-pointer"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination footer */}
      <div className="flex items-center justify-between text-sm text-terminal-dim font-mono">
        <div>
          Showing {filteredConfigs.length} of {configurations.length} configurations
        </div>
        <div>v{configurations[0]?.version || 1}</div>
      </div>
    </div>
  );
}
