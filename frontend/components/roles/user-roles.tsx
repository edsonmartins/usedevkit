"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  Shield,
  Plus,
  Trash2,
  UserMinus,
  Crown,
} from "lucide-react";
import { cn, formatRelativeTime } from "@/lib/utils";
import type { Role } from "@/lib/types/role";

interface UserRole {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  roleId: string;
  roleName: string;
  grantedAt: string;
  expiresAt?: string;
}

interface UserRolesProps {
  roles: Role[];
  userRoles: UserRole[];
  onGrant?: (userId: string, roleId: string, expiresAt?: string) => void;
  onRevoke?: (userId: string, roleId: string) => void;
  isGranting?: boolean;
  isRevoking?: boolean;
}

export function UserRoles({
  roles,
  userRoles,
  onGrant,
  onRevoke,
  isGranting,
  isRevoking,
}: UserRolesProps) {
  const [showGrant, setShowGrant] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedRoleId, setSelectedRoleId] = useState("");

  // This is a simplified component - in a real app, you'd have a user selector
  // For now, showing users who already have roles
  const usersWithRoles = userRoles.reduce((acc, ur) => {
    if (!acc[ur.userId]) {
      acc[ur.userId] = {
        id: ur.userId,
        name: ur.userName,
        email: ur.userEmail,
        roles: [],
      };
    }
    acc[ur.userId].roles.push(ur);
    return acc;
  }, {} as Record<string, { id: string; name: string; email: string; roles: UserRole[] }>);

  const customRoles = roles.filter((r) => !r.isSystemRole);

  return (
    <>
      <Card className="bg-terminal-surface border-terminal-border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="font-mono text-sm text-terminal-text flex items-center gap-2">
              <Users className="h-4 w-4 text-terminal-green" />
              User Roles
            </CardTitle>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowGrant(true)}
              className="h-7 px-2 text-xs font-mono border-terminal-green text-terminal-green hover:bg-terminal-green/10"
            >
              <Plus className="h-3 w-3 mr-1" />
              Grant Role
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {Object.keys(usersWithRoles).length === 0 ? (
            <div className="text-center py-6 text-terminal-dim">
              <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-xs font-mono">No users with roles yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {Object.values(usersWithRoles).map((user) => (
                <div
                  key={user.id}
                  className="p-3 bg-terminal-bg border border-terminal-border rounded-lg"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-terminal-border flex items-center justify-center">
                        <span className="text-xs font-mono font-bold text-terminal-text">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="font-mono text-sm">{user.name}</div>
                        <div className="text-xs text-terminal-dim">{user.email}</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {user.roles.map((ur) => (
                      <Badge
                        key={`${ur.userId}-${ur.roleId}`}
                        variant="outline"
                        className={cn(
                          "font-mono text-xs bg-terminal-surface border-terminal-border",
                          ur.roleName === "OWNER" && "border-terminal-green text-terminal-green",
                          ur.roleName === "ADMIN" && "border-purple-500 text-purple-400"
                        )}
                      >
                        <Shield className="h-3 w-3 mr-1" />
                        {ur.roleName}
                        {onRevoke && ur.roleName !== "OWNER" && (
                          <button
                            onClick={() => onRevoke(ur.userId, ur.roleId)}
                            disabled={isRevoking}
                            className="ml-1 hover:text-terminal-coral"
                          >
                            <UserMinus className="h-3 w-3" />
                          </button>
                        )}
                      </Badge>
                    ))}
                  </div>

                  {user.roles.some((r) => r.expiresAt) && (
                    <div className="mt-2 text-xs text-terminal-dim">
                      Expires {formatRelativeTime(new Date(user.roles.find((r) => r.expiresAt)!.expiresAt!))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Grant Role Dialog */}
      <Dialog open={showGrant} onOpenChange={setShowGrant}>
        <DialogContent className="sm:max-w-[400px] bg-terminal-surface border-terminal-border">
          <DialogHeader>
            <DialogTitle className="font-mono text-lg text-terminal-text flex items-center gap-2">
              <Shield className="h-5 w-5 text-terminal-green" />
              Grant Role
            </DialogTitle>
            <DialogDescription className="text-terminal-dim">
              Assign a role to a user
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm text-terminal-text">User</label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger className="bg-terminal-surface border-terminal-border font-mono">
                  <SelectValue placeholder="Select user..." />
                </SelectTrigger>
                <SelectContent className="bg-terminal-surface border-terminal-border">
                  {Object.values(usersWithRoles).map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-terminal-text">Role</label>
              <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
                <SelectTrigger className="bg-terminal-surface border-terminal-border font-mono">
                  <SelectValue placeholder="Select role..." />
                </SelectTrigger>
                <SelectContent className="bg-terminal-surface border-terminal-border">
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      <div className="flex items-center gap-2">
                        <Shield className={cn(
                          "h-3 w-3",
                          role.isSystemRole ? "text-terminal-dim" : "text-terminal-green"
                        )} />
                        <span>{role.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setShowGrant(false)}
              className="border-terminal-border"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (selectedUserId && selectedRoleId && onGrant) {
                  onGrant(selectedUserId, selectedRoleId);
                  setSelectedUserId("");
                  setSelectedRoleId("");
                  setShowGrant(false);
                }
              }}
              disabled={!selectedUserId || !selectedRoleId || isGranting}
              className="font-mono"
            >
              {isGranting ? (
                <span className="animate-pulse">Granting...</span>
              ) : (
                <>
                  <span className="text-terminal-bg">&gt;</span> Grant
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Permission Checker Component (for testing/debugging)
interface PermissionCheckerProps {
  userId: string;
  tenantId: string;
}

export function PermissionChecker({ userId, tenantId }: PermissionCheckerProps) {
  const [permission, setPermission] = useState("");
  const [result, setResult] = useState<boolean | null>(null);

  // This would use the usePermissionCheck hook in a real implementation
  const checkPermission = () => {
    // Placeholder for actual permission check
    setResult(true);
  };

  return (
    <Card className="bg-terminal-surface border-terminal-border">
      <CardHeader className="pb-3">
        <CardTitle className="font-mono text-sm text-terminal-text flex items-center gap-2">
          <Shield className="h-4 w-4 text-terminal-green" />
          Permission Checker
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm text-terminal-text">Permission</label>
          <input
            type="text"
            value={permission}
            onChange={(e) => setPermission(e.target.value)}
            placeholder="e.g., application.create"
            className="w-full font-mono text-sm p-2 bg-terminal-bg border border-terminal-border rounded"
          />
        </div>

        <Button
          onClick={checkPermission}
          disabled={!permission}
          className="w-full font-mono"
        >
          Check Permission
        </Button>

        {result !== null && (
          <div className={cn(
            "p-3 rounded-lg text-center font-mono text-sm",
            result
              ? "bg-terminal-green/20 text-terminal-green"
              : "bg-terminal-coral/20 text-terminal-coral"
          )}>
            {result ? "✓ Permission Granted" : "✗ Permission Denied"}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
