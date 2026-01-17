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
import { Server, Plus, Search, Filter, Trash2, Network } from "lucide-react";
import { ServiceCard } from "@/components/services/service-card";
import { ServiceForm } from "@/components/services/service-form";
import { DependencyGraph, DependencyGraphDialog } from "@/components/services/dependency-graph";
import { useServices, useServiceHealthCheck, useServiceHealthStats, useDependencyGraph, useServiceHealthResults } from "@/lib/hooks/use-services";
import { cn } from "@/lib/utils";
import type { Service, ServiceType, ServiceStatus } from "@/lib/types/service";

export default function ServicesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<ServiceType | "ALL">("ALL");
  const [statusFilter, setStatusFilter] = useState<ServiceStatus | "ALL">("ALL");
  const [environmentFilter, setEnvironmentFilter] = useState<string>("ALL");
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState<Service | undefined>();
  const [serviceToDelete, setServiceToDelete] = useState<Service | undefined>();
  const [showGraph, setShowGraph] = useState(false);
  const [selectedServiceForHealth, setSelectedServiceForHealth] = useState<Service | null>(null);

  const { services, isLoading, create, update, delete: deleteService, deactivate, isCreating, isDeleting, isDeactivating } = useServices();
  const { data: stats } = useServiceHealthStats();
  const { data: graph } = useDependencyGraph();
  const { mutate: triggerHealthCheck, isPending: isCheckingHealth } = useServiceHealthCheck();
  const { data: healthResults } = useServiceHealthResults(selectedServiceForHealth?.id || "");

  // Get unique environments from services
  const environments = Array.from(new Set(services.map((s) => s.environment).filter(Boolean)));

  const filteredServices = services.filter((service) => {
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.url?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "ALL" || service.type === typeFilter;
    const matchesStatus = statusFilter === "ALL" || service.status === statusFilter;
    const matchesEnvironment = environmentFilter === "ALL" || service.environment === environmentFilter;
    return matchesSearch && matchesType && matchesStatus && matchesEnvironment;
  });

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setShowForm(true);
  };

  const handleDelete = (service: Service) => {
    setServiceToDelete(service);
  };

  const confirmDelete = () => {
    if (serviceToDelete) {
      deleteService(serviceToDelete.id);
      setServiceToDelete(undefined);
    }
  };

  const handleHealthCheck = (service: Service) => {
    triggerHealthCheck(service.id);
  };

  const handleFormSubmit = (data: any) => {
    if (editingService) {
      update({ id: editingService.id, data });
    } else {
      create(data);
    }
    setShowForm(false);
    setEditingService(undefined);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingService(undefined);
  };

  const STAT_CARDS = [
    { label: "Total", value: stats?.total ?? 0, color: "text-terminal-text" },
    { label: "Healthy", value: stats?.healthy ?? 0, color: "text-terminal-green" },
    { label: "Degraded", value: stats?.degraded ?? 0, color: "text-yellow-400" },
    { label: "Unhealthy", value: stats?.unhealthy ?? 0, color: "text-terminal-coral" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-mono font-bold text-terminal-text flex items-center gap-2">
            <Server className="h-6 w-6 text-terminal-green" />
            Services Catalog
          </h1>
          <p className="text-terminal-dim font-mono text-sm mt-1">
            Register and monitor services, dependencies, and health
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowGraph(true)}
            className="font-mono border-terminal-border"
          >
            <Network className="h-4 w-4 mr-2" />
            View Graph
          </Button>
          <Button
            onClick={() => setShowForm(true)}
            className="font-mono bg-terminal-green text-terminal-bg hover:bg-terminal-green/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Register Service
          </Button>
        </div>
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

      {/* Dependency Graph (collapsed view) */}
      <DependencyGraph graph={graph} isLoading={false} />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-terminal-dim" />
          <Input
            placeholder="Search by name, description, or URL..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 font-mono bg-terminal-surface border-terminal-border"
          />
        </div>
        <div className="flex gap-2">
          <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as ServiceType | "ALL")}>
            <SelectTrigger className="w-[140px] font-mono bg-terminal-surface border-terminal-border">
              <Filter className="h-4 w-4 mr-2 text-terminal-dim" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-terminal-surface border-terminal-border">
              <SelectItem value="ALL">All Types</SelectItem>
              <SelectItem value="API">API</SelectItem>
              <SelectItem value="WORKER">Worker</SelectItem>
              <SelectItem value="DATABASE">Database</SelectItem>
              <SelectItem value="CACHE">Cache</SelectItem>
              <SelectItem value="QUEUE">Queue</SelectItem>
              <SelectItem value="OTHER">Other</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as ServiceStatus | "ALL")}>
            <SelectTrigger className="w-[140px] font-mono bg-terminal-surface border-terminal-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-terminal-surface border-terminal-border">
              <SelectItem value="ALL">All Status</SelectItem>
              <SelectItem value="HEALTHY">Healthy</SelectItem>
              <SelectItem value="DEGRADED">Degraded</SelectItem>
              <SelectItem value="UNHEALTHY">Unhealthy</SelectItem>
              <SelectItem value="UNKNOWN">Unknown</SelectItem>
            </SelectContent>
          </Select>
          <Select value={environmentFilter} onValueChange={setEnvironmentFilter}>
            <SelectTrigger className="w-[140px] font-mono bg-terminal-surface border-terminal-border">
              <SelectValue placeholder="Environment" />
            </SelectTrigger>
            <SelectContent className="bg-terminal-surface border-terminal-border">
              <SelectItem value="ALL">All Env</SelectItem>
              {environments.map((env) => (
                <SelectItem key={env} value={env || ""}>{env || "None"}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Services List */}
      {isLoading ? (
        <div className="text-center py-12 text-terminal-dim font-mono">
          Loading services...
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-terminal-border rounded-lg">
          <Server className="h-12 w-12 text-terminal-dim mx-auto mb-4" />
          <p className="text-terminal-dim font-mono">
            {searchQuery || typeFilter !== "ALL" || statusFilter !== "ALL" || environmentFilter !== "ALL"
              ? "No services match your filters"
              : "No services registered yet"}
          </p>
          {!searchQuery && typeFilter === "ALL" && statusFilter === "ALL" && environmentFilter === "ALL" && (
            <Button
              onClick={() => setShowForm(true)}
              variant="outline"
              className="mt-4 font-mono border-terminal-green text-terminal-green hover:bg-terminal-green/10"
            >
              <Plus className="h-4 w-4 mr-2" />
              Register First Service
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredServices.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onEdit={() => handleEdit(service)}
              onDelete={() => handleDelete(service)}
              onHealthCheck={() => handleHealthCheck(service)}
              isCheckingHealth={isCheckingHealth}
              isDeleting={isDeleting}
            />
          ))}
        </div>
      )}

      {/* Create/Edit Form Dialog */}
      <ServiceForm
        open={showForm}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        service={editingService}
        isSubmitting={isCreating}
        allServices={services}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!serviceToDelete} onOpenChange={() => setServiceToDelete(undefined)}>
        <DialogContent className="bg-terminal-surface border-terminal-border">
          <DialogHeader>
            <DialogTitle className="font-mono text-terminal-text flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-terminal-coral" />
              Delete Service
            </DialogTitle>
            <DialogDescription className="text-terminal-dim font-mono">
              Are you sure you want to delete this service? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {serviceToDelete && (
            <div className="py-4 space-y-2">
              <div className="text-sm font-mono text-terminal-text">
                <span className="text-terminal-dim">Name:</span> {serviceToDelete.name}
              </div>
              <div className="text-sm font-mono text-terminal-text">
                <span className="text-terminal-dim">Type:</span> {serviceToDelete.type}
              </div>
              {serviceToDelete.url && (
                <div className="text-sm font-mono text-terminal-text">
                  <span className="text-terminal-dim">URL:</span> {serviceToDelete.url}
                </div>
              )}
              {serviceToDelete.dependencies.length > 0 && (
                <div className="text-sm font-mono text-terminal-text">
                  <span className="text-terminal-dim">Dependencies:</span> {serviceToDelete.dependencies.length}
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setServiceToDelete(undefined)}
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

      {/* Dependency Graph Dialog */}
      <DependencyGraphDialog
        open={showGraph}
        onClose={() => setShowGraph(false)}
        graph={graph}
        isLoading={false}
      />
    </div>
  );
}
