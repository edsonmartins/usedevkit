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
import { Shield, Plus, Search, Filter, Trash2, Lock } from "lucide-react";
import { RoleCard } from "@/components/roles/role-card";
import { RoleForm, CloneRoleDialog } from "@/components/roles/role-form";
import { UserRoles, PermissionChecker } from "@/components/roles/user-roles";
import { useRoles } from "@/lib/hooks/use-roles";
import { cn } from "@/lib/utils";
import type { Role } from "@/lib/types/role";

export default function RolesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"ALL" | "SYSTEM" | "CUSTOM">("ALL");
  const [showForm, setShowForm] = useState(false);
  const [showClone, setShowClone] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | undefined>();
  const [cloningRole, setCloningRole] = useState<Role | undefined>();
  const [roleToDelete, setRoleToDelete] = useState<Role | undefined>();

  const { roles, customRoles, systemRoles, isLoading, create, update, delete: deleteRole, clone, isCreating, isDeleting, isCloning } = useRoles();

  const filteredRoles = roles.filter((role) => {
    const matchesSearch = role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      role.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "ALL" ||
      (typeFilter === "SYSTEM" && role.isSystemRole) ||
      (typeFilter === "CUSTOM" && !role.isSystemRole);
    return matchesSearch && matchesType;
  });

  const handleEdit = (role: Role) => {
    setEditingRole(role);
    setShowForm(true);
  };

  const handleDelete = (role: Role) => {
    setRoleToDelete(role);
  };

  const confirmDelete = () => {
    if (roleToDelete) {
      deleteRole(roleToDelete.id);
      setRoleToDelete(undefined);
    }
  };

  const handleClone = (role: Role) => {
    setCloningRole(role);
    setShowClone(true);
  };

  const handleCloneSubmit = (name: string) => {
    if (cloningRole) {
      clone({ id: cloningRole.id, name });
      setShowClone(false);
      setCloningRole(undefined);
    }
  };

  const handleFormSubmit = (data: any) => {
    if (editingRole) {
      update({ id: editingRole.id, data });
    } else {
      create(data);
    }
    setShowForm(false);
    setEditingRole(undefined);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingRole(undefined);
  };

  // Mock user roles data - in a real app, this would come from an API
  const mockUserRoles = [
    {
      id: "1",
      userId: "user1",
      userName: "John Doe",
      userEmail: "john@example.com",
      roleId: "role1",
      roleName: "Admin",
      grantedAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    },
    {
      id: "2",
      userId: "user2",
      userName: "Jane Smith",
      userEmail: "jane@example.com",
      roleId: "role2",
      roleName: "Member",
      grantedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-mono font-bold text-terminal-text flex items-center gap-2">
            <Shield className="h-6 w-6 text-terminal-green" />
            Roles & Permissions
          </h1>
          <p className="text-terminal-dim font-mono text-sm mt-1">
            Manage custom roles and their permissions
          </p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="font-mono bg-terminal-green text-terminal-bg hover:bg-terminal-green/90"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Role
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-terminal-surface border border-terminal-border rounded-lg">
          <div className="text-2xl font-mono font-bold text-terminal-text">
            {roles.length}
          </div>
          <div className="text-xs text-terminal-dim font-mono mt-1">Total Roles</div>
        </div>
        <div className="p-4 bg-terminal-surface border border-terminal-border rounded-lg">
          <div className="text-2xl font-mono font-bold text-terminal-dim">
            {systemRoles.length}
          </div>
          <div className="text-xs text-terminal-dim font-mono mt-1">System Roles</div>
        </div>
        <div className="p-4 bg-terminal-surface border border-terminal-border rounded-lg">
          <div className="text-2xl font-mono font-bold text-terminal-green">
            {customRoles.length}
          </div>
          <div className="text-xs text-terminal-dim font-mono mt-1">Custom Roles</div>
        </div>
        <div className="p-4 bg-terminal-surface border border-terminal-border rounded-lg">
          <div className="text-2xl font-mono font-bold text-terminal-text">
            {roles.reduce((acc, r) => acc + r.permissions.length, 0)}
          </div>
          <div className="text-xs text-terminal-dim font-mono mt-1">Total Permissions</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-terminal-dim" />
          <Input
            placeholder="Search by name or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 font-mono bg-terminal-surface border-terminal-border"
          />
        </div>
        <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as "ALL" | "SYSTEM" | "CUSTOM")}>
          <SelectTrigger className="w-[160px] font-mono bg-terminal-surface border-terminal-border">
            <Filter className="h-4 w-4 mr-2 text-terminal-dim" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-terminal-surface border-terminal-border">
            <SelectItem value="ALL">All Roles</SelectItem>
            <SelectItem value="SYSTEM">System Roles</SelectItem>
            <SelectItem value="CUSTOM">Custom Roles</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Roles List */}
      {isLoading ? (
        <div className="text-center py-12 text-terminal-dim font-mono">
          Loading roles...
        </div>
      ) : filteredRoles.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-terminal-border rounded-lg">
          <Shield className="h-12 w-12 text-terminal-dim mx-auto mb-4" />
          <p className="text-terminal-dim font-mono">
            {searchQuery || typeFilter !== "ALL"
              ? "No roles match your filters"
              : "No roles yet"}
          </p>
          {!searchQuery && typeFilter === "ALL" && (
            <Button
              onClick={() => setShowForm(true)}
              variant="outline"
              className="mt-4 font-mono border-terminal-green text-terminal-green hover:bg-terminal-green/10"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create First Role
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredRoles.map((role) => (
            <RoleCard
              key={role.id}
              role={role}
              onEdit={() => handleEdit(role)}
              onDelete={() => handleDelete(role)}
              onClone={() => handleClone(role)}
              isDeleting={isDeleting}
              isCloning={isCloning}
            />
          ))}
        </div>
      )}

      {/* Create/Edit Form Dialog */}
      <RoleForm
        open={showForm}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        role={editingRole}
        isSubmitting={isCreating}
      />

      {/* Clone Dialog */}
      <CloneRoleDialog
        open={showClone}
        onClose={() => {
          setShowClone(false);
          setCloningRole(undefined);
        }}
        onSubmit={handleCloneSubmit}
        role={cloningRole!}
        isCloning={isCloning}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!roleToDelete} onOpenChange={() => setRoleToDelete(undefined)}>
        <DialogContent className="bg-terminal-surface border-terminal-border">
          <DialogHeader>
            <DialogTitle className="font-mono text-terminal-text flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-terminal-coral" />
              Delete Role
            </DialogTitle>
            <DialogDescription className="text-terminal-dim font-mono">
              Are you sure you want to delete this role? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {roleToDelete && (
            <div className="py-4 space-y-2">
              <div className="text-sm font-mono text-terminal-text">
                <span className="text-terminal-dim">Name:</span> {roleToDelete.name}
              </div>
              <div className="text-sm font-mono text-terminal-text">
                <span className="text-terminal-dim">Permissions:</span> {roleToDelete.permissions.length}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRoleToDelete(undefined)}
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

      {/* Permission Checker Tool */}
      <div className="mt-8">
        <h2 className="text-lg font-mono font-bold text-terminal-text flex items-center gap-2 mb-4">
          <Lock className="h-5 w-5 text-terminal-green" />
          Tools
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <PermissionChecker userId="current-user" tenantId="current-tenant" />
          <UserRoles
            roles={roles}
            userRoles={mockUserRoles}
          />
        </div>
      </div>
    </div>
  );
}
