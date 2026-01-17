"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
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
import { Filter, X, Calendar, Download, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AuditLogFilter, AuditAction, AuditEntityType } from "@/lib/types/audit";
import { ACTION_CATEGORIES } from "@/lib/types/audit";

interface AuditFiltersProps {
  filters: AuditLogFilter;
  onFiltersChange: (filters: AuditLogFilter) => void;
  onExport?: (format: "csv" | "json") => void;
  isExporting?: boolean;
}

export function AuditFilters({ filters, onFiltersChange, onExport, isExporting }: AuditFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const updateFilter = (key: keyof AuditLogFilter, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value,
      page: 0, // Reset to first page when filters change
    });
  };

  const clearFilters = () => {
    onFiltersChange({ limit: 50 });
  };

  const hasActiveFilters = !!(
    filters.userId ||
    filters.action ||
    filters.entityType ||
    filters.entityId ||
    filters.startDate ||
    filters.endDate
  );

  const actionOptions = Object.values(ACTION_CATEGORIES).flatMap((cat) =>
    cat.actions.map((action) => ({
      value: action,
      label: action.split("_").map((word) => word.charAt(0) + word.slice(1).toLowerCase()).join(" "),
      category: cat.label,
    }))
  );

  const entityTypeOptions: { value: AuditEntityType; label: string }[] = [
    { value: "USER", label: "User" },
    { value: "APPLICATION", label: "Application" },
    { value: "CONFIGURATION", label: "Configuration" },
    { value: "SECRET", label: "Secret" },
    { value: "FEATURE_FLAG", label: "Feature Flag" },
    { value: "PROMOTION", label: "Promotion" },
    { value: "WEBHOOK", label: "Webhook" },
    { value: "SERVICE", label: "Service" },
    { value: "TENANT", label: "Tenant" },
    { value: "ROLE", label: "Role" },
    { value: "API_KEY", label: "API Key" },
    { value: "SYSTEM", label: "System" },
  ];

  const dateRangePresets = [
    { label: "Last 24 hours", value: 24 },
    { label: "Last 7 days", value: 24 * 7 },
    { label: "Last 30 days", value: 24 * 30 },
    { label: "Last 90 days", value: 24 * 90 },
  ];

  const setDateRange = (hours: number) => {
    const end = new Date();
    const start = new Date(end.getTime() - hours * 60 * 60 * 1000);
    onFiltersChange({
      ...filters,
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      page: 0,
    });
  };

  return (
    <Card className="bg-terminal-surface border-terminal-border">
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-terminal-green" />
            <span className="font-mono text-sm text-terminal-text">Filters</span>
            {hasActiveFilters && (
              <Badge variant="outline" className="bg-terminal-green/20 text-terminal-green border-0">
                Active
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {onExport && (
              <>
                <Select
                  value=""
                  onValueChange={(v) => onExport(v as "csv" | "json")}
                  disabled={isExporting}
                >
                  <SelectTrigger className="h-8 w-32 font-mono text-xs bg-terminal-surface border-terminal-border">
                    <Download className="h-3 w-3 mr-2" />
                    <SelectValue placeholder="Export" />
                  </SelectTrigger>
                  <SelectContent className="bg-terminal-surface border-terminal-border">
                    <SelectItem value="csv">Export as CSV</SelectItem>
                    <SelectItem value="json">Export as JSON</SelectItem>
                  </SelectContent>
                </Select>
              </>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-8 px-2 font-mono text-xs"
            >
              {isExpanded ? "Collapse" : "Expand"}
            </Button>
            {hasActiveFilters && (
              <Button
                size="sm"
                variant="ghost"
                onClick={clearFilters}
                className="h-8 px-2 font-mono text-xs text-terminal-coral hover:text-terminal-coral"
              >
                <X className="h-3 w-3 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Filters */}
        {isExpanded && (
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-terminal-dim" />
              <Input
                placeholder="Search by entity ID..."
                value={filters.entityId || ""}
                onChange={(e) => updateFilter("entityId", e.target.value || undefined)}
                className="pl-10 font-mono text-sm bg-terminal-bg border-terminal-border"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Entity Type */}
              <div className="space-y-2">
                <Label className="text-terminal-text text-xs">Entity Type</Label>
                <Select
                  value={filters.entityType || ""}
                  onValueChange={(v) => updateFilter("entityType", v || undefined)}
                >
                  <SelectTrigger className="bg-terminal-surface border-terminal-border font-mono text-sm">
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent className="bg-terminal-surface border-terminal-border">
                    <SelectItem value="">All types</SelectItem>
                    {entityTypeOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Action */}
              <div className="space-y-2">
                <Label className="text-terminal-text text-xs">Action</Label>
                <Select
                  value={filters.action || ""}
                  onValueChange={(v) => updateFilter("action", v || undefined)}
                >
                  <SelectTrigger className="bg-terminal-surface border-terminal-border font-mono text-sm">
                    <SelectValue placeholder="All actions" />
                  </SelectTrigger>
                  <SelectContent className="bg-terminal-surface border-terminal-border max-h-[300px]">
                    <SelectItem value="">All actions</SelectItem>
                    {Object.entries(ACTION_CATEGORIES).map(([key, cat]) => (
                      <div key={key}>
                        <div className="px-2 py-1 text-xs text-terminal-dim font-mono sticky top-0 bg-terminal-surface">
                          {cat.label}
                        </div>
                        {cat.actions.map((action) => (
                          <SelectItem key={action} value={action} className="font-mono text-xs">
                            {action.split("_").map((word) => word.charAt(0) + word.slice(1).toLowerCase()).join(" ")}
                          </SelectItem>
                        ))}
                      </div>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* User ID */}
              <div className="space-y-2">
                <Label className="text-terminal-text text-xs">User ID</Label>
                <Input
                  placeholder="Enter user ID..."
                  value={filters.userId || ""}
                  onChange={(e) => updateFilter("userId", e.target.value || undefined)}
                  className="font-mono text-sm bg-terminal-bg border-terminal-border"
                />
              </div>

              {/* Date Range */}
              <div className="space-y-2">
                <Label className="text-terminal-text text-xs flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Date Range
                </Label>
                <div className="flex gap-1">
                  {dateRangePresets.map((preset) => (
                    <Button
                      key={preset.value}
                      size="sm"
                      variant="outline"
                      onClick={() => setDateRange(preset.value)}
                      className="flex-1 font-mono text-[10px] border-terminal-border h-8"
                    >
                      {preset.label}
                    </Button>
                  ))}
                </div>
                {filters.startDate && (
                  <div className="flex gap-2 mt-1">
                    <Input
                      type="datetime-local"
                      value={filters.startDate.slice(0, 16)}
                      onChange={(e) => updateFilter("startDate", new Date(e.target.value).toISOString())}
                      className="font-mono text-xs bg-terminal-bg border-terminal-border"
                    />
                    <Input
                      type="datetime-local"
                      value={filters.endDate?.slice(0, 16) || ""}
                      onChange={(e) => updateFilter("endDate", new Date(e.target.value).toISOString())}
                      className="font-mono text-xs bg-terminal-bg border-terminal-border"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
