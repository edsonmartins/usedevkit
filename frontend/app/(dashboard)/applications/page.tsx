"use client";

import { useState } from "react";
import { Plus, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ApplicationCard } from "@/components/applications/application-card";
import { ApplicationForm } from "@/components/applications/application-form";
import { useApplications } from "@/lib/hooks/use-applications";
import type { CreateApplicationDto } from "@/lib/types/application";
import { useUIStore } from "@/lib/stores/ui-store";

export default function ApplicationsPage() {
  const { setCreateModalOpen } = useUIStore();
  const {
    applications,
    isLoading,
    create,
    isCreating,
    delete: deleteApp,
    isDeleting,
    activate,
    isActivating,
    deactivate,
    isDeactivating,
  } = useApplications();

  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Filter applications by search query
  const filteredApplications = applications.filter((app) =>
    app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (app.description?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Separate active and inactive
  const activeApps = filteredApplications.filter((a) => a.active);
  const inactiveApps = filteredApplications.filter((a) => !a.active);

  const handleCreate = (data: CreateApplicationDto) => {
    create(data);
    setShowCreateDialog(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-terminal-dim font-mono">
          <span className="text-terminal-green">$</span> Loading applications...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-terminal-text">
            <span className="text-terminal-green">./</span>applications
          </h1>
          <p className="text-terminal-dim mt-1">
            Manage your applications and their configurations
          </p>
        </div>

        <Button
          onClick={() => setShowCreateDialog(true)}
          className="font-mono"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Application
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="border border-terminal-border rounded-lg p-4 bg-terminal-surface">
          <div className="text-terminal-dim text-sm font-mono">Total</div>
          <div className="text-2xl font-mono font-bold text-terminal-text mt-1">
            {applications.length}
          </div>
        </div>
        <div className="border border-terminal-border rounded-lg p-4 bg-terminal-surface">
          <div className="text-terminal-dim text-sm font-mono">Active</div>
          <div className="text-2xl font-mono font-bold text-terminal-green mt-1">
            {activeApps.length}
          </div>
        </div>
        <div className="border border-terminal-border rounded-lg p-4 bg-terminal-surface">
          <div className="text-terminal-dim text-sm font-mono">Inactive</div>
          <div className="text-2xl font-mono font-bold text-terminal-dim mt-1">
            {inactiveApps.length}
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-terminal-dim" />
          <Input
            placeholder="Search applications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 font-mono border-terminal-border bg-terminal-surface"
          />
        </div>
      </div>

      {/* Empty state */}
      {applications.length === 0 ? (
        <div className="text-center py-16 border border-terminal-border border-dashed rounded-lg">
          <div className="font-mono text-terminal-dim mb-4">
            <span className="text-terminal-green">$</span> No applications found
          </div>
          <p className="text-terminal-dim text-sm mb-6">
            Get started by creating your first application
          </p>
          <Button
            onClick={() => setShowCreateDialog(true)}
            variant="outline"
            className="font-mono border-terminal-green/50 text-terminal-green hover:bg-terminal-green/10"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Application
          </Button>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Active applications */}
          {activeApps.length > 0 && (
            <div>
              <h2 className="font-mono text-sm font-semibold text-terminal-green mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-terminal-green"></span>
                Active ({activeApps.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeApps.map((app) => (
                  <ApplicationCard
                    key={app.id}
                    application={app}
                    onActivate={activate}
                    onDeactivate={deactivate}
                    onDelete={deleteApp}
                    isActivating={isActivating}
                    isDeactivating={isDeactivating}
                    isDeleting={isDeleting}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Inactive applications */}
          {inactiveApps.length > 0 && (
            <div>
              <h2 className="font-mono text-sm font-semibold text-terminal-dim mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-terminal-dim"></span>
                Inactive ({inactiveApps.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {inactiveApps.map((app) => (
                  <ApplicationCard
                    key={app.id}
                    application={app}
                    onActivate={activate}
                    onDeactivate={deactivate}
                    onDelete={deleteApp}
                    isActivating={isActivating}
                    isDeactivating={isDeactivating}
                    isDeleting={isDeleting}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create dialog */}
      <ApplicationForm
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onSubmit={handleCreate}
        isSubmitting={isCreating}
      />
    </div>
  );
}
