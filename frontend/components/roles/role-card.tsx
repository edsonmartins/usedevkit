"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreVertical,
  Shield,
  Edit,
  Trash2,
  Copy,
  Users,
  Lock,
  Check,
} from "lucide-react";
import { cn, formatRelativeTime } from "@/lib/utils";
import type { Role } from "@/lib/types/role";

interface RoleCardProps {
  role: Role;
  onEdit?: () => void;
  onDelete?: () => void;
  onClone?: () => void;
  onManageUsers?: () => void;
  isDeleting?: boolean;
  isCloning?: boolean;
}

export function RoleCard({
  role,
  onEdit,
  onDelete,
  onClone,
  onManageUsers,
  isDeleting,
  isCloning,
}: RoleCardProps) {
  const [showPermissions, setShowPermissions] = useState(false);

  // Group permissions by category for display
  const getCategoryLabel = (permission: string): string => {
    const resource = permission.split(".")[0];
    const labels: Record<string, string> = {
      application: "Applications",
      configuration: "Configurations",
      secret: "Secrets",
      feature_flag: "Feature Flags",
      promotion: "Promotions",
      webhook: "Webhooks",
      service: "Services",
      tenant: "Tenants",
      role: "Roles",
      user: "Users",
      admin: "Admin",
    };
    return labels[resource] || resource;
  };

  const groupedPermissions = role.permissions.reduce((acc, perm) => {
    const category = getCategoryLabel(perm);
    if (!acc[category]) acc[category] = [];
    acc[category].push(perm);
    return acc;
  }, {} as Record<string, string[]>);

  const getActionLabel = (permission: string): string => {
    const action = permission.split(".")[1];
    const labels: Record<string, string> = {
      view: "View",
      create: "Create",
      update: "Update",
      delete: "Delete",
      activate: "Activate",
      deactivate: "Deactivate",
      rollback: "Rollback",
      history: "History",
      rotate: "Rotate",
      decrypt: "Decrypt",
      toggle: "Toggle",
      execute: "Execute",
      approve: "Approve",
      test: "Test",
      register: "Register",
      manage_users: "Manage Users",
      upgrade: "Upgrade",
      assign: "Assign",
      system: "System",
      audit: "Audit",
    };
    return labels[action] || action;
  };

  return (
    <Card
      className={cn(
        "bg-terminal-surface border-terminal-border transition-all",
        role.isSystemRole && "border-terminal-dim/50"
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Shield className={cn(
                "h-4 w-4",
                role.isSystemRole ? "text-terminal-dim" : "text-terminal-green"
              )} />
              <CardTitle className="font-mono text-base truncate">
                {role.name}
              </CardTitle>
              {role.isSystemRole && (
                <Badge variant="outline" className="font-mono text-xs bg-terminal-bg border-terminal-border text-terminal-dim">
                  System
                </Badge>
              )}
            </div>
            {role.description && (
              <p className="text-xs text-terminal-dim line-clamp-2">{role.description}</p>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-terminal-surface border-terminal-border">
              <DropdownMenuItem
                onClick={() => setShowPermissions(!showPermissions)}
                className="font-mono text-sm cursor-pointer"
              >
                <Lock className="mr-2 h-4 w-4" />
                {showPermissions ? "Hide" : "Show"} Permissions
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={onManageUsers}
                className="font-mono text-sm cursor-pointer"
              >
                <Users className="mr-2 h-4 w-4" />
                Manage Users
              </DropdownMenuItem>
              {!role.isSystemRole && (
                <>
                  <DropdownMenuItem
                    onClick={onClone}
                    disabled={isCloning}
                    className="font-mono text-sm cursor-pointer"
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    {isCloning ? "Cloning..." : "Clone"}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-terminal-border" />
                  <DropdownMenuItem
                    onClick={onEdit}
                    className="font-mono text-sm cursor-pointer"
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={onDelete}
                    disabled={isDeleting}
                    className="font-mono text-sm text-terminal-coral cursor-pointer"
                  >
                    {isDeleting ? "Deleting..." : (
                      <>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </>
                    )}
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Permission Count */}
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-terminal-dim flex items-center gap-1">
            <Lock className="h-3 w-3" />
            Permissions
          </span>
          <span className="text-terminal-text">{role.permissions.length}</span>
        </div>

        {/* Permissions by Category */}
        {showPermissions && (
          <div className="space-y-2 p-3 bg-terminal-bg border border-terminal-border rounded-lg max-h-[300px] overflow-y-auto">
            <div className="text-xs text-terminal-dim font-mono mb-2">
              Permission Categories
            </div>
            {Object.entries(groupedPermissions).map(([category, perms]) => (
              <div key={category} className="space-y-1">
                <div className="text-xs font-mono text-terminal-green">{category}</div>
                <div className="flex flex-wrap gap-1">
                  {perms.map((perm) => (
                    <Badge
                      key={perm}
                      variant="outline"
                      className="font-mono text-[10px] bg-terminal-surface border-terminal-border"
                    >
                      {getActionLabel(perm)}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-terminal-dim font-mono pt-2 border-t border-terminal-border">
          <span>
            {role.isSystemRole ? "System role" : "Custom role"}
          </span>
          <span>
            Created {formatRelativeTime(new Date(role.createdAt))}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
