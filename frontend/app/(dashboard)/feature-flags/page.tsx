"use client";

import { useState } from "react";
import { Plus, Search, Filter, ToggleLeft, ToggleRight, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFeatureFlags } from "@/lib/hooks/use-feature-flags";
import { useApplications } from "@/lib/hooks/use-applications";
import { FlagCard } from "@/components/feature-flags/flag-card";
import { FlagForm } from "@/components/feature-flags/flag-form";
import { FlagTestDialog } from "@/components/feature-flags/flag-test-dialog";
import type { FeatureFlag, FlagType } from "@/lib/types/feature-flag";
import { toast } from "sonner";
import { cn, copyToClipboard } from "@/lib/utils";

export default function FeatureFlagsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ENABLED" | "DISABLED">("ALL");
  const [typeFilter, setTypeFilter] = useState<FlagType | "ALL">("ALL");
  const [selectedApplication, setSelectedApplication] = useState<string>("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedFlag, setSelectedFlag] = useState<FeatureFlag | undefined>(undefined);
  const [testFlag, setTestFlag] = useState<FeatureFlag | null>(null);

  const { applications } = useApplications();

  const appFlags = useFeatureFlags(selectedApplication === "all" ? "" : selectedApplication);

  // Filter flags
  const filteredFlags = appFlags.flags.filter((flag) => {
    const matchesSearch =
      flag.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      flag.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "ENABLED" && flag.enabled) ||
      (statusFilter === "DISABLED" && !flag.enabled);
    const matchesType = typeFilter === "ALL" || flag.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleCreate = () => {
    setSelectedFlag(undefined);
    if (selectedApplication === "all") {
      toast.error("Please select an application first");
      return;
    }
    setShowCreateDialog(true);
  };

  const handleEdit = (flag: FeatureFlag) => {
    setSelectedFlag(flag);
    setShowCreateDialog(true);
  };

  const handleCopyKey = async (flag: FeatureFlag) => {
    await copyToClipboard(flag.key);
    toast.success("Flag key copied to clipboard");
  };

  const handleToggle = async (id: string, enabled: boolean) => {
    if (enabled) {
      appFlags.enable(id);
    } else {
      appFlags.disable(id);
    }
  };

  // Stats
  const totalFlags = filteredFlags.length;
  const enabledFlags = filteredFlags.filter((f) => f.enabled).length;
  const disabledFlags = totalFlags - enabledFlags;
  const withVariants = filteredFlags.filter((f) => f.variants && f.variants.length > 0).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-terminal-text">
            <span className="text-terminal-green">./</span>feature-flags
          </h1>
          <p className="text-terminal-dim mt-1">
            Manage feature flags and rollouts
          </p>
        </div>
        <Button onClick={handleCreate} className="font-mono">
          <Plus className="mr-2 h-4 w-4" />
          New Flag
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="bg-terminal-surface border-terminal-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-terminal-dim text-sm font-mono">Total Flags</div>
                <div className="text-2xl font-mono font-bold text-terminal-text mt-1">
                  {totalFlags}
                </div>
              </div>
              <Shield className="h-8 w-8 text-terminal-green/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-terminal-surface border-terminal-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-terminal-dim text-sm font-mono">Enabled</div>
                <div className="text-2xl font-mono font-bold text-terminal-green mt-1">
                  {enabledFlags}
                </div>
              </div>
              <ToggleRight className="h-8 w-8 text-terminal-green/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-terminal-surface border-terminal-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-terminal-dim text-sm font-mono">Disabled</div>
                <div className="text-2xl font-mono font-bold text-terminal-dim mt-1">
                  {disabledFlags}
                </div>
              </div>
              <ToggleLeft className="h-8 w-8 text-terminal-dim/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-terminal-surface border-terminal-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-terminal-dim text-sm font-mono">With Variants</div>
                <div className="text-2xl font-mono font-bold text-purple-400 mt-1">
                  {withVariants}
                </div>
              </div>
              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-terminal-green to-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-terminal-dim" />
          <Input
            placeholder="Search flags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 font-mono border-terminal-border bg-terminal-surface"
          />
        </div>

        {/* Application Filter */}
        <Select value={selectedApplication} onValueChange={setSelectedApplication}>
          <SelectTrigger className="w-full sm:w-[200px] font-mono border-terminal-border bg-terminal-surface">
            <SelectValue placeholder="All Applications" />
          </SelectTrigger>
          <SelectContent className="bg-terminal-surface border-terminal-border">
            <SelectItem value="all" className="font-mono">All Applications</SelectItem>
            {applications.map((app) => (
              <SelectItem key={app.id} value={app.id} className="font-mono">
                {app.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Status Filter */}
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as "ALL" | "ENABLED" | "DISABLED")}>
          <SelectTrigger className="w-full sm:w-[150px] font-mono border-terminal-border bg-terminal-surface">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-terminal-surface border-terminal-border">
            <SelectItem value="ALL" className="font-mono">All Status</SelectItem>
            <SelectItem value="ENABLED" className="font-mono">Enabled</SelectItem>
            <SelectItem value="DISABLED" className="font-mono">Disabled</SelectItem>
          </SelectContent>
        </Select>

        {/* Type Filter */}
        <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as FlagType | "ALL")}>
          <SelectTrigger className="w-full sm:w-[150px] font-mono border-terminal-border bg-terminal-surface">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-terminal-surface border-terminal-border">
            <SelectItem value="ALL" className="font-mono">All Types</SelectItem>
            <SelectItem value="BOOLEAN" className="font-mono">Boolean</SelectItem>
            <SelectItem value="STRING" className="font-mono">String</SelectItem>
            <SelectItem value="NUMBER" className="font-mono">Number</SelectItem>
            <SelectItem value="JSON" className="font-mono">JSON</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Empty State */}
      {selectedApplication === "all" ? (
        <Card className="bg-terminal-surface border-terminal-border">
          <CardContent className="py-16">
            <div className="text-center text-terminal-dim font-mono">
              <Shield className="h-12 w-12 mx-auto mb-4 text-terminal-green/50" />
              <p className="mb-4">Select an application to view its feature flags</p>
            </div>
          </CardContent>
        </Card>
      ) : filteredFlags.length === 0 ? (
        <Card className="bg-terminal-surface border-terminal-border">
          <CardContent className="py-16">
            <div className="text-center">
              <div className="font-mono text-terminal-dim mb-4">
                <span className="text-terminal-green">$</span> No feature flags found
              </div>
              <p className="text-terminal-dim text-sm mb-6">
                Get started by creating your first feature flag
              </p>
              <Button
                onClick={handleCreate}
                variant="outline"
                className="font-mono border-terminal-green/50 text-terminal-green hover:bg-terminal-green/10"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Flag
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Flags Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFlags.map((flag) => (
            <FlagCard
              key={flag.id}
              flag={flag}
              onToggle={handleToggle}
              onEdit={() => handleEdit(flag)}
              onCopyKey={() => handleCopyKey(flag)}
              onTest={() => setTestFlag(flag)}
              onDelete={() => appFlags.delete(flag.id)}
              onArchive={() => appFlags.archive(flag.id)}
              isToggling={appFlags.isEnabling || appFlags.isDisabling}
              isDeleting={appFlags.isDeleting}
            />
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <FlagForm
        open={showCreateDialog}
        onClose={() => {
          setShowCreateDialog(false);
          setSelectedFlag(undefined);
        }}
        onSubmit={(data) => {
          if (selectedFlag) {
            appFlags.update({ id: selectedFlag.id, data });
          } else {
            appFlags.create(data as Parameters<typeof appFlags.create>[0]);
          }
        }}
        flag={selectedFlag}
        applicationId={selectedApplication === "all" ? "" : selectedApplication}
        isSubmitting={appFlags.isCreating || appFlags.isUpdating}
      />

      {/* Test Dialog */}
      <FlagTestDialog
        open={!!testFlag}
        onClose={() => setTestFlag(null)}
        flag={testFlag}
      />
    </div>
  );
}
