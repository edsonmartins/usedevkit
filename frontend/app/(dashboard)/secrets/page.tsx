"use client";

import { useState } from "react";
import { Plus, Search, Filter, Shield, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSecrets, useSecretStats } from "@/lib/hooks/use-secrets";
import { useApplications } from "@/lib/hooks/use-applications";
import { SecretCard } from "@/components/secrets/secret-card";
import { SecretForm } from "@/components/secrets/secret-form";
import type { SecretMetadata, SecretStatus, SecretType } from "@/lib/types/secret";

export default function SecretsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<SecretStatus | "ALL">("ALL");
  const [typeFilter, setTypeFilter] = useState<SecretType | "ALL">("ALL");
  const [selectedApplication, setSelectedApplication] = useState<string>("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedSecret, setSelectedSecret] = useState<SecretMetadata | undefined>(undefined);

  const { applications } = useApplications();
  const { data: stats } = useSecretStats();

  // Get secrets for selected application or all
  const appSecrets = useSecrets(selectedApplication === "all" ? "" : selectedApplication);

  // For demo purposes, combine all secrets when "all" is selected
  const allSecrets = selectedApplication === "all"
    ? ([] as SecretMetadata[]) // In real app, fetch all secrets
    : appSecrets.secrets;

  // Filter secrets
  const filteredSecrets = allSecrets.filter((secret) => {
    const matchesSearch = secret.key.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || secret.status === statusFilter;
    const matchesType = typeFilter === "ALL" || secret.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleCreate = () => {
    setSelectedSecret(undefined);
    if (selectedApplication === "all") {
      // Show error to select an application first
      return;
    }
    setShowCreateDialog(true);
  };

  const handleEdit = (secret: SecretMetadata) => {
    setSelectedSecret(secret);
    setShowCreateDialog(true);
  };

  const handleReveal = (secret: SecretMetadata) => {
    // In real app, call API to reveal secret
    console.log("Reveal:", secret.key);
  };

  const statsData = stats || { total: 0, active: 0, rotationPending: 0, expired: 0 };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-terminal-text">
            <span className="text-terminal-green">./</span>secrets
          </h1>
          <p className="text-terminal-dim mt-1">
            Manage encrypted secrets and rotation schedules
          </p>
        </div>
        <Button
          onClick={handleCreate}
          className="font-mono"
          disabled={selectedApplication === "all"}
        >
          <Plus className="mr-2 h-4 w-4" />
          New Secret
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="bg-terminal-surface border-terminal-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-terminal-dim text-sm font-mono">Total Secrets</div>
                <div className="text-2xl font-mono font-bold text-terminal-text mt-1">
                  {statsData.total}
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
                <div className="text-terminal-dim text-sm font-mono">Active</div>
                <div className="text-2xl font-mono font-bold text-terminal-green mt-1">
                  {statsData.active}
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
                <div className="text-terminal-dim text-sm font-mono">Rotation Pending</div>
                <div className="text-2xl font-mono font-bold text-yellow-400 mt-1">
                  {statsData.rotationPending}
                </div>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-400/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-terminal-surface border-terminal-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-terminal-dim text-sm font-mono">Expired</div>
                <div className="text-2xl font-mono font-bold text-terminal-coral mt-1">
                  {statsData.expired}
                </div>
              </div>
              <AlertTriangle className="h-8 w-8 text-terminal-coral/50" />
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
            placeholder="Search secrets..."
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
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as SecretStatus | "ALL")}>
          <SelectTrigger className="w-full sm:w-[150px] font-mono border-terminal-border bg-terminal-surface">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-terminal-surface border-terminal-border">
            <SelectItem value="ALL" className="font-mono">All Status</SelectItem>
            <SelectItem value="ACTIVE" className="font-mono">Active</SelectItem>
            <SelectItem value="ROTATION_PENDING" className="font-mono">Rotation Pending</SelectItem>
            <SelectItem value="EXPIRED" className="font-mono">Expired</SelectItem>
            <SelectItem value="DEACTIVATED" className="font-mono">Deactivated</SelectItem>
          </SelectContent>
        </Select>

        {/* Type Filter */}
        <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as SecretType | "ALL")}>
          <SelectTrigger className="w-full sm:w-[150px] font-mono border-terminal-border bg-terminal-surface">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-terminal-surface border-terminal-border">
            <SelectItem value="ALL" className="font-mono">All Types</SelectItem>
            <SelectItem value="API_KEY" className="font-mono">API Key</SelectItem>
            <SelectItem value="PASSWORD" className="font-mono">Password</SelectItem>
            <SelectItem value="CERTIFICATE" className="font-mono">Certificate</SelectItem>
            <SelectItem value="TOKEN" className="font-mono">Token</SelectItem>
            <SelectItem value="DATABASE_URL" className="font-mono">Database URL</SelectItem>
            <SelectItem value="OTHER" className="font-mono">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Empty State */}
      {selectedApplication === "all" ? (
        <Card className="bg-terminal-surface border-terminal-border">
          <CardContent className="py-16">
            <div className="text-center text-terminal-dim font-mono">
              <Shield className="h-12 w-12 mx-auto mb-4 text-terminal-green/50" />
              <p className="mb-4">Select an application to view its secrets</p>
            </div>
          </CardContent>
        </Card>
      ) : filteredSecrets.length === 0 ? (
        <Card className="bg-terminal-surface border-terminal-border">
          <CardContent className="py-16">
            <div className="text-center">
              <div className="font-mono text-terminal-dim mb-4">
                <span className="text-terminal-green">$</span> No secrets found
              </div>
              <p className="text-terminal-dim text-sm mb-6">
                Get started by creating your first secret
              </p>
              <Button
                onClick={handleCreate}
                variant="outline"
                className="font-mono border-terminal-green/50 text-terminal-green hover:bg-terminal-green/10"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Secret
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Secrets Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSecrets.map((secret) => (
            <SecretCard
              key={secret.id}
              secret={secret}
              onReveal={() => handleReveal(secret)}
              onRotate={() => appSecrets.rotate({ id: secret.id })}
              onEdit={() => handleEdit(secret)}
              onDeactivate={() => appSecrets.deactivate(secret.id)}
              onDelete={() => appSecrets.delete(secret.id)}
              isRotating={appSecrets.isRotating}
              isDeactivating={appSecrets.isDeactivating}
              isDeleting={appSecrets.isDeleting}
            />
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <SecretForm
        open={showCreateDialog}
        onClose={() => {
          setShowCreateDialog(false);
          setSelectedSecret(undefined);
        }}
        onSubmit={(data) => {
          if (selectedSecret) {
            appSecrets.update({ id: selectedSecret.id, data });
          } else {
            appSecrets.create(data as Parameters<typeof appSecrets.create>[0]);
          }
        }}
        secret={selectedSecret}
        applicationId={selectedApplication === "all" ? "" : selectedApplication}
        isSubmitting={appSecrets.isCreating || appSecrets.isUpdating}
      />
    </div>
  );
}
