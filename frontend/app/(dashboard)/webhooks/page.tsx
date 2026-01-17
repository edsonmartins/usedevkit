"use client";

import { useState } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Globe, Plus, Search, Filter, Trash2 } from "lucide-react";
import { WebhookCard } from "@/components/webhooks/webhook-card";
import { WebhookForm } from "@/components/webhooks/webhook-form";
import { DeliveriesList } from "@/components/webhooks/deliveries-list";
import { useWebhooks, useWebhookDeliveries, useWebhookTest, useWebhookStats } from "@/lib/hooks/use-webhooks";
import { useApplications } from "@/lib/hooks/use-applications";
import { cn } from "@/lib/utils";
import type { Webhook, WebhookStatus } from "@/lib/types/webhook";

export default function WebhooksPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<WebhookStatus | "ALL">("ALL");
  const [applicationFilter, setApplicationFilter] = useState<string>("ALL");
  const [showForm, setShowForm] = useState(false);
  const [editingWebhook, setEditingWebhook] = useState<Webhook | undefined>();
  const [selectedWebhookForDeliveries, setSelectedWebhookForDeliveries] = useState<string | null>(null);
  const [webhookToDelete, setWebhookToDelete] = useState<Webhook | undefined>();

  const { webhooks, isLoading, create, update, delete: deleteWebhook, activate, deactivate, isCreating, isDeleting, isActivating, isDeactivating } = useWebhooks();
  const { data: stats } = useWebhookStats();
  const { applications } = useApplications();
  const { mutate: testWebhook } = useWebhookTest();
  const { deliveries, isLoading: isLoadingDeliveries, retry, isRetrying } = useWebhookDeliveries(selectedWebhookForDeliveries || "");

  const filteredWebhooks = webhooks.filter((webhook) => {
    const matchesSearch = webhook.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      webhook.url.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || webhook.status === statusFilter;
    const matchesApplication = applicationFilter === "ALL" || webhook.applicationId === applicationFilter;
    return matchesSearch && matchesStatus && matchesApplication;
  });

  const handleToggle = (id: string, active: boolean) => {
    if (active) {
      activate(id);
    } else {
      deactivate(id);
    }
  };

  const handleEdit = (webhook: Webhook) => {
    setEditingWebhook(webhook);
    setShowForm(true);
  };

  const handleDelete = (webhook: Webhook) => {
    setWebhookToDelete(webhook);
  };

  const confirmDelete = () => {
    if (webhookToDelete) {
      deleteWebhook(webhookToDelete.id);
      setWebhookToDelete(undefined);
    }
  };

  const handleTest = (webhook: Webhook) => {
    testWebhook(webhook.id);
  };

  const handleViewDeliveries = (webhook: Webhook) => {
    setSelectedWebhookForDeliveries(webhook.id);
  };

  const handleFormSubmit = (data: any) => {
    if (editingWebhook) {
      update({ id: editingWebhook.id, data });
    } else {
      create(data);
    }
    setShowForm(false);
    setEditingWebhook(undefined);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingWebhook(undefined);
  };

  const STAT_CARDS = [
    { label: "Total", value: stats?.total ?? 0, color: "text-terminal-text" },
    { label: "Active", value: stats?.active ?? 0, color: "text-terminal-green" },
    { label: "Inactive", value: stats?.inactive ?? 0, color: "text-terminal-dim" },
    { label: "Failed", value: stats?.failed ?? 0, color: "text-terminal-coral" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-mono font-bold text-terminal-text flex items-center gap-2">
            <Globe className="h-6 w-6 text-terminal-green" />
            Webhooks
          </h1>
          <p className="text-terminal-dim font-mono text-sm mt-1">
            Configure HTTP webhooks for event notifications
          </p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="font-mono bg-terminal-green text-terminal-bg hover:bg-terminal-green/90"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Webhook
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {STAT_CARDS.map((stat) => (
          <div
            key={stat.label}
            className="p-4 bg-terminal-surface border border-terminal-border rounded-lg"
          >
            <div className="text-2xl font-mono font-bold {stat.color}">
              {stat.value}
            </div>
            <div className="text-xs text-terminal-dim font-mono mt-1">
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-terminal-dim" />
          <Input
            placeholder="Search by name or URL..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 font-mono bg-terminal-surface border-terminal-border"
          />
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as WebhookStatus | "ALL")}>
            <SelectTrigger className="w-[140px] font-mono bg-terminal-surface border-terminal-border">
              <Filter className="h-4 w-4 mr-2 text-terminal-dim" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-terminal-surface border-terminal-border">
              <SelectItem value="ALL">All Status</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="INACTIVE">Inactive</SelectItem>
              <SelectItem value="FAILED">Failed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={applicationFilter} onValueChange={setApplicationFilter}>
            <SelectTrigger className="w-[160px] font-mono bg-terminal-surface border-terminal-border">
              <SelectValue placeholder="Application" />
            </SelectTrigger>
            <SelectContent className="bg-terminal-surface border-terminal-border">
              <SelectItem value="ALL">All Apps</SelectItem>
              {applications.map((app) => (
                <SelectItem key={app.id} value={app.id}>{app.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Webhooks List */}
      {isLoading ? (
        <div className="text-center py-12 text-terminal-dim font-mono">
          Loading webhooks...
        </div>
      ) : filteredWebhooks.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-terminal-border rounded-lg">
          <Globe className="h-12 w-12 text-terminal-dim mx-auto mb-4" />
          <p className="text-terminal-dim font-mono">
            {searchQuery || statusFilter !== "ALL" || applicationFilter !== "ALL"
              ? "No webhooks match your filters"
              : "No webhooks configured yet"}
          </p>
          {!searchQuery && statusFilter === "ALL" && applicationFilter === "ALL" && (
            <Button
              onClick={() => setShowForm(true)}
              variant="outline"
              className="mt-4 font-mono border-terminal-green text-terminal-green hover:bg-terminal-green/10"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create First Webhook
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredWebhooks.map((webhook) => (
            <WebhookCard
              key={webhook.id}
              webhook={webhook}
              onToggle={handleToggle}
              onEdit={() => handleEdit(webhook)}
              onDelete={() => handleDelete(webhook)}
              onTest={() => handleTest(webhook)}
              onViewDeliveries={() => handleViewDeliveries(webhook)}
              isToggling={isActivating || isDeactivating}
              isDeleting={isDeleting}
            />
          ))}
        </div>
      )}

      {/* Create/Edit Form Dialog */}
      <WebhookForm
        open={showForm}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        webhook={editingWebhook}
        isSubmitting={isCreating}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!webhookToDelete} onOpenChange={() => setWebhookToDelete(undefined)}>
        <DialogContent className="bg-terminal-surface border-terminal-border">
          <DialogHeader>
            <DialogTitle className="font-mono text-terminal-text flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-terminal-coral" />
              Delete Webhook
            </DialogTitle>
            <DialogDescription className="text-terminal-dim font-mono">
              Are you sure you want to delete this webhook? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {webhookToDelete && (
            <div className="py-4 space-y-2">
              <div className="text-sm font-mono text-terminal-text">
                <span className="text-terminal-dim">Name:</span> {webhookToDelete.name}
              </div>
              <div className="text-sm font-mono text-terminal-text">
                <span className="text-terminal-dim">URL:</span> {webhookToDelete.url}
              </div>
              <div className="text-sm font-mono text-terminal-text">
                <span className="text-terminal-dim">Events:</span> {webhookToDelete.events.length}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setWebhookToDelete(undefined)}
              className="font-mono border-terminal-border"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={isDeleting}
              className="font-mono bg-terminal-coral text-white hover:bg-terminal-coral/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Deliveries List Dialog */}
      <DeliveriesList
        deliveries={deliveries}
        isLoading={isLoadingDeliveries}
        onRetry={retry}
        isRetrying={isRetrying}
      />
    </div>
  );
}
