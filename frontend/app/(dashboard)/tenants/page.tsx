"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Building2, Plus, Search, Filter, Trash2, Users } from "lucide-react";
import { TenantCard } from "@/components/tenants/tenant-card";
import { TenantForm, TenantUpgradeDialog } from "@/components/tenants/tenant-form";
import { TenantStats } from "@/components/tenants/tenant-stats";
import { TenantUsers } from "@/components/tenants/tenant-users";
import { useTenants, useTenantStats, useTenantUsers } from "@/lib/hooks/use-tenants";
import { cn } from "@/lib/utils";
import type { Tenant, TenantPlan, TenantStatus } from "@/lib/types/tenant";

export default function TenantsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [planFilter, setPlanFilter] = useState<TenantPlan | "ALL">("ALL");
  const [statusFilter, setStatusFilter] = useState<TenantStatus | "ALL">("ALL");
  const [showForm, setShowForm] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | undefined>();
  const [upgradingTenant, setUpgradingTenant] = useState<Tenant | undefined>();
  const [tenantToDelete, setTenantToDelete] = useState<Tenant | undefined>();
  const [selectedTenantForUsers, setSelectedTenantForUsers] = useState<Tenant | undefined>();

  const { tenants, isLoading, create, update, delete: deleteTenant, suspend, activate, upgrade, isCreating, isDeleting, isSuspending, isActivating, isUpgrading } = useTenants();
  const { data: stats } = useTenantStats();
  const { users, invite: inviteUser, remove: removeUser, updateRole, isInviting, isRemoving } = useTenantUsers(selectedTenantForUsers?.id || "");

  const filteredTenants = tenants.filter((tenant) => {
    const matchesSearch = tenant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tenant.slug.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPlan = planFilter === "ALL" || tenant.plan === planFilter;
    const matchesStatus = statusFilter === "ALL" || tenant.status === statusFilter;
    return matchesSearch && matchesPlan && matchesStatus;
  });

  const handleEdit = (tenant: Tenant) => {
    setEditingTenant(tenant);
    setShowForm(true);
  };

  const handleDelete = (tenant: Tenant) => {
    setTenantToDelete(tenant);
  };

  const confirmDelete = () => {
    if (tenantToDelete) {
      deleteTenant(tenantToDelete.id);
      setTenantToDelete(undefined);
    }
  };

  const handleUpgrade = (tenant: Tenant) => {
    setUpgradingTenant(tenant);
    setShowUpgrade(true);
  };

  const handleUpgradeSubmit = (data: { plan: TenantPlan; billingEmail?: string }) => {
    if (upgradingTenant) {
      upgrade({ id: upgradingTenant.id, data });
      setShowUpgrade(false);
      setUpgradingTenant(undefined);
    }
  };

  const handleManageUsers = (tenant: Tenant) => {
    setSelectedTenantForUsers(tenant);
  };

  const handleInviteUser = (email: string, role: string) => {
    if (selectedTenantForUsers) {
      inviteUser({ email, role: role as any });
    }
  };

  const handleRemoveUser = (userId: string) => {
    if (selectedTenantForUsers && confirm("Remove this user from the tenant?")) {
      removeUser(userId);
    }
  };

  const handleRoleChange = (userId: string, role: string) => {
    if (selectedTenantForUsers) {
      updateRole({ userId, role });
    }
  };

  const handleFormSubmit = (data: any) => {
    if (editingTenant) {
      update({ id: editingTenant.id, data });
    } else {
      create(data);
    }
    setShowForm(false);
    setEditingTenant(undefined);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingTenant(undefined);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-mono font-bold text-terminal-text flex items-center gap-2">
            <Building2 className="h-6 w-6 text-terminal-green" />
            Tenants
          </h1>
          <p className="text-terminal-dim font-mono text-sm mt-1">
            Manage tenant accounts, plans, and billing
          </p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="font-mono bg-terminal-green text-terminal-bg hover:bg-terminal-green/90"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Tenant
        </Button>
      </div>

      {/* Stats */}
      <TenantStats stats={stats} isLoading={false} />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-terminal-dim" />
          <Input
            placeholder="Search by name or slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 font-mono bg-terminal-surface border-terminal-border"
          />
        </div>
        <div className="flex gap-2">
          <Select value={planFilter} onValueChange={(v) => setPlanFilter(v as TenantPlan | "ALL")}>
            <SelectTrigger className="w-[140px] font-mono bg-terminal-surface border-terminal-border">
              <Filter className="h-4 w-4 mr-2 text-terminal-dim" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-terminal-surface border-terminal-border">
              <SelectItem value="ALL">All Plans</SelectItem>
              <SelectItem value="FREE">Free</SelectItem>
              <SelectItem value="STARTER">Starter</SelectItem>
              <SelectItem value="PRO">Pro</SelectItem>
              <SelectItem value="ENTERPRISE">Enterprise</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as TenantStatus | "ALL")}>
            <SelectTrigger className="w-[140px] font-mono bg-terminal-surface border-terminal-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-terminal-surface border-terminal-border">
              <SelectItem value="ALL">All Status</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="TRIAL">Trial</SelectItem>
              <SelectItem value="SUSPENDED">Suspended</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tenants List */}
      {isLoading ? (
        <div className="text-center py-12 text-terminal-dim font-mono">
          Loading tenants...
        </div>
      ) : filteredTenants.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-terminal-border rounded-lg">
          <Building2 className="h-12 w-12 text-terminal-dim mx-auto mb-4" />
          <p className="text-terminal-dim font-mono">
            {searchQuery || planFilter !== "ALL" || statusFilter !== "ALL"
              ? "No tenants match your filters"
              : "No tenants yet"}
          </p>
          {!searchQuery && planFilter === "ALL" && statusFilter === "ALL" && (
            <Button
              onClick={() => setShowForm(true)}
              variant="outline"
              className="mt-4 font-mono border-terminal-green text-terminal-green hover:bg-terminal-green/10"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create First Tenant
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredTenants.map((tenant) => (
            <TenantCard
              key={tenant.id}
              tenant={tenant}
              onEdit={() => handleEdit(tenant)}
              onDelete={() => handleDelete(tenant)}
              onUpgrade={() => handleUpgrade(tenant)}
              onSuspend={() => suspend(tenant.id)}
              onActivate={() => activate(tenant.id)}
              onManageUsers={() => handleManageUsers(tenant)}
              onSettings={() => handleEdit(tenant)}
              isDeleting={isDeleting}
              isSuspending={isSuspending}
              isActivating={isActivating}
            />
          ))}
        </div>
      )}

      {/* Create/Edit Form Dialog */}
      <TenantForm
        open={showForm}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        tenant={editingTenant}
        isSubmitting={isCreating}
      />

      {/* Upgrade Dialog */}
      <TenantUpgradeDialog
        open={showUpgrade}
        onClose={() => {
          setShowUpgrade(false);
          setUpgradingTenant(undefined);
        }}
        onSubmit={handleUpgradeSubmit}
        tenant={upgradingTenant!}
        isSubmitting={isUpgrading}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!tenantToDelete} onOpenChange={() => setTenantToDelete(undefined)}>
        <DialogContent className="bg-terminal-surface border-terminal-border">
          <DialogHeader>
            <DialogTitle className="font-mono text-terminal-text flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-terminal-coral" />
              Delete Tenant
            </DialogTitle>
            <DialogDescription className="text-terminal-dim font-mono">
              Are you sure you want to delete this tenant? This action cannot be undone and will delete all associated data.
            </DialogDescription>
          </DialogHeader>
          {tenantToDelete && (
            <div className="py-4 space-y-2">
              <div className="text-sm font-mono text-terminal-text">
                <span className="text-terminal-dim">Name:</span> {tenantToDelete.name}
              </div>
              <div className="text-sm font-mono text-terminal-text">
                <span className="text-terminal-dim">Slug:</span> @{tenantToDelete.slug}
              </div>
              <div className="text-sm font-mono text-terminal-text">
                <span className="text-terminal-dim">Plan:</span> {tenantToDelete.plan}
              </div>
              {tenantToDelete.usage.applications > 0 && (
                <div className="text-sm font-mono text-terminal-coral mt-2">
                  Warning: This tenant has {tenantToDelete.usage.applications} application(s) that will also be deleted.
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setTenantToDelete(undefined)}
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

      {/* Users Management Dialog */}
      <Dialog open={!!selectedTenantForUsers} onOpenChange={() => setSelectedTenantForUsers(undefined)}>
        <DialogContent className="sm:max-w-[500px] bg-terminal-surface border-terminal-border">
          <DialogHeader>
            <DialogTitle className="font-mono text-lg text-terminal-text flex items-center gap-2">
              <Users className="h-5 w-5 text-terminal-green" />
              Team Members: {selectedTenantForUsers?.name}
            </DialogTitle>
            <DialogDescription className="text-terminal-dim">
              Manage user access and roles
            </DialogDescription>
          </DialogHeader>

          {selectedTenantForUsers && (
            <div className="py-4">
              <TenantUsers
                tenant={selectedTenantForUsers}
                users={users}
                onInvite={handleInviteUser}
                onRemove={handleRemoveUser}
                onRoleChange={handleRoleChange}
                isInviting={isInviting}
                isRemoving={isRemoving}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
