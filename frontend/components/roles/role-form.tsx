"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Shield, Check, Lock, Layout, Server, Key, Flag, Building, Users as UsersIcon, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Role, CreateRoleDto, Permission } from "@/lib/types/role";
import { PERMISSION_CATEGORIES, SYSTEM_ROLES } from "@/lib/types/role";

const roleSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  description: z.string().max(500).optional(),
});

type RoleForm = z.infer<typeof roleSchema>;

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  applications: Layout,
  configurations: Settings,
  secrets: Key,
  feature_flags: Flag,
  promotions: Settings,
  webhooks: Settings,
  services: Server,
  tenants: Building,
  rbac: Shield,
  users: UsersIcon,
  admin: Lock,
};

interface RoleFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateRoleDto & { tenantId?: string }) => void;
  role?: Role;
  isSubmitting?: boolean;
}

export function RoleForm({
  open,
  onClose,
  onSubmit,
  role,
  isSubmitting,
}: RoleFormProps) {
  const [selectedPermissions, setSelectedPermissions] = useState<Permission[]>(role?.permissions || []);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RoleForm>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      name: role?.name || "",
      description: role?.description || "",
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        name: role?.name || "",
        description: role?.description || "",
      });
      setSelectedPermissions(role?.permissions || []);
      // Expand all categories by default for new roles
      if (!role) {
        setExpandedCategories(new Set(Object.keys(PERMISSION_CATEGORIES)));
      }
    }
  }, [open, role, reset]);

  const togglePermission = (permission: Permission) => {
    if (selectedPermissions.includes(permission)) {
      setSelectedPermissions(selectedPermissions.filter((p) => p !== permission));
    } else {
      setSelectedPermissions([...selectedPermissions, permission]);
    }
  };

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const selectAllInCategory = (category: string) => {
    const catPermissions = PERMISSION_CATEGORIES[category].permissions;
    const allSelected = catPermissions.every((p) => selectedPermissions.includes(p));

    if (allSelected) {
      setSelectedPermissions(selectedPermissions.filter((p) => !catPermissions.includes(p)));
    } else {
      setSelectedPermissions([...new Set([...selectedPermissions, ...catPermissions])]);
    }
  };

  const loadFromPreset = (presetName: string) => {
    const preset = SYSTEM_ROLES[presetName as keyof typeof SYSTEM_ROLES];
    if (preset) {
      setSelectedPermissions(preset.permissions);
    }
  };

  const onFormSubmit = (data: RoleForm) => {
    if (selectedPermissions.length === 0) {
      return;
    }
    onSubmit({
      ...data,
      permissions: selectedPermissions,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] bg-terminal-surface border-terminal-border max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-mono text-xl text-terminal-text flex items-center gap-2">
            <Shield className="h-5 w-5 text-terminal-green" />
            {role ? "Edit Role" : "New Role"}
          </DialogTitle>
          <DialogDescription className="text-terminal-dim">
            {role ? "Update role and permissions" : "Create a custom role with specific permissions"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-terminal-text">
              <span className="text-terminal-green">$</span> Role Name
            </Label>
            <Input
              id="name"
              placeholder="Developer"
              className={cn("font-mono", errors.name && "border-terminal-coral")}
              {...register("name")}
            />
            {errors.name && (
              <p className="text-xs text-terminal-coral">{errors.name.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-terminal-text">
              Description
            </Label>
            <Textarea
              id="description"
              placeholder="What does this role do?"
              rows={2}
              className="font-mono text-sm resize-none"
              {...register("description")}
            />
          </div>

          {/* Load from Preset */}
          {!role && (
            <div className="space-y-2">
              <Label className="text-terminal-text">Load from Preset</Label>
              <div className="flex gap-2">
                {Object.keys(SYSTEM_ROLES).map((preset) => (
                  <Button
                    key={preset}
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => loadFromPreset(preset)}
                    className="font-mono text-xs border-terminal-border"
                  >
                    {preset}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Permissions */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-terminal-text">Permissions</Label>
              <span className="text-xs text-terminal-dim">{selectedPermissions.length} selected</span>
            </div>

            <div className="space-y-2 p-3 bg-terminal-bg border border-terminal-border rounded-lg max-h-[300px] overflow-y-auto">
              {Object.entries(PERMISSION_CATEGORIES).map(([key, category]) => {
                const Icon = CATEGORY_ICONS[key] || Lock;
                const isExpanded = expandedCategories.has(key);
                const catPermissions = category.permissions;
                const allSelected = catPermissions.every((p) => selectedPermissions.includes(p));
                const someSelected = catPermissions.some((p) => selectedPermissions.includes(p));

                return (
                  <div key={key} className="border border-terminal-border rounded overflow-hidden">
                    {/* Category Header */}
                    <div
                      onClick={() => toggleCategory(key)}
                      className="flex items-center justify-between p-2 bg-terminal-surface cursor-pointer hover:bg-terminal-border/50"
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-terminal-dim" />
                        <span className="font-mono text-sm">{category.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-terminal-dim">
                          {catPermissions.filter((p) => selectedPermissions.includes(p)).length}/{catPermissions.length}
                        </span>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            selectAllInCategory(key);
                          }}
                        >
                          <Check className={cn(
                            "h-3 w-3",
                            allSelected ? "text-terminal-green" : someSelected ? "text-yellow-400" : "text-terminal-dim"
                          )} />
                        </Button>
                      </div>
                    </div>

                    {/* Permissions */}
                    {isExpanded && (
                      <div className="p-2 space-y-1 bg-terminal-bg">
                        {category.permissions.map((permission) => (
                          <div
                            key={permission}
                            onClick={() => togglePermission(permission)}
                            className={cn(
                              "flex items-center justify-between p-2 rounded cursor-pointer transition-colors",
                              "hover:bg-terminal-border/50",
                              selectedPermissions.includes(permission) && "bg-terminal-green/10"
                            )}
                          >
                            <span className="font-mono text-xs">{permission}</span>
                            {selectedPermissions.includes(permission) && (
                              <Check className="h-3 w-3 text-terminal-green" />
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Permissions Summary */}
          {selectedPermissions.length > 0 && (
            <div className="space-y-2">
              <Label className="text-terminal-text">Selected Permissions</Label>
              <div className="flex flex-wrap gap-1 p-3 bg-terminal-bg border border-terminal-border rounded-lg max-h-[100px] overflow-y-auto">
                {selectedPermissions.map((permission) => (
                  <Badge
                    key={permission}
                    variant="outline"
                    className="font-mono text-[10px] bg-terminal-surface border-terminal-green text-terminal-green"
                  >
                    {permission}
                    <button
                      type="button"
                      onClick={() => togglePermission(permission)}
                      className="ml-1 hover:text-terminal-coral"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {selectedPermissions.length === 0 && (
            <p className="text-xs text-terminal-coral">Select at least one permission</p>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t border-terminal-border">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-terminal-border"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || selectedPermissions.length === 0}
              className="font-mono"
            >
              {isSubmitting ? (
                <span className="animate-pulse">Saving...</span>
              ) : (
                <>
                  <span className="text-terminal-bg">&gt;</span>{" "}
                  {role ? "Update" : "Create"}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Clone Role Dialog Component
interface CloneRoleDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (name: string) => void;
  role: Role;
  isCloning?: boolean;
}

export function CloneRoleDialog({
  open,
  onClose,
  onSubmit,
  role,
  isCloning,
}: CloneRoleDialogProps) {
  const [name, setName] = useState("");

  useEffect(() => {
    if (open && role) {
      setName(`${role.name} (Copy)`);
    }
  }, [open, role]);

  if (!role) {
    return null;
  }

  const handleSubmit = () => {
    if (name.trim()) {
      onSubmit(name.trim());
      setName("");
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px] bg-terminal-surface border-terminal-border">
        <DialogHeader>
          <DialogTitle className="font-mono text-lg text-terminal-text flex items-center gap-2">
            <Shield className="h-5 w-5 text-terminal-green" />
            Clone Role
          </DialogTitle>
          <DialogDescription className="text-terminal-dim">
            Create a copy of {role.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="cloneName" className="text-terminal-text">
              <span className="text-terminal-green">$</span> New Role Name
            </Label>
            <Input
              id="cloneName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Role Name"
              className="font-mono"
            />
          </div>

          <div className="p-3 bg-terminal-bg border border-terminal-border rounded-lg">
            <div className="text-xs text-terminal-dim mb-1">This will copy:</div>
            <div className="text-sm font-mono text-terminal-text">{role.permissions.length} permissions</div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-terminal-border"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!name.trim() || isCloning}
            className="font-mono"
          >
            {isCloning ? (
              <span className="animate-pulse">Cloning...</span>
            ) : (
              <>
                <span className="text-terminal-bg">&gt;</span> Clone
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
