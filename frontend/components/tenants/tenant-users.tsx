"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Mail,
  Plus,
  Trash2,
  Crown,
  Shield,
  User,
  Eye,
  X,
} from "lucide-react";
import { cn, formatRelativeTime } from "@/lib/utils";
import type { Tenant, TenantUser, TenantUserRole } from "@/lib/types/tenant";

const ROLE_CONFIG: Record<TenantUserRole, { icon: typeof Crown; color: string; bg: string; label: string }> = {
  OWNER: { icon: Crown, color: "text-terminal-green", bg: "bg-terminal-green/20", label: "Owner" },
  ADMIN: { icon: Shield, color: "text-purple-400", bg: "bg-purple-500/20", label: "Admin" },
  MEMBER: { icon: User, color: "text-blue-400", bg: "bg-blue-500/20", label: "Member" },
  VIEWER: { icon: Eye, color: "text-terminal-dim", bg: "bg-terminal-border", label: "Viewer" },
};

interface TenantUsersProps {
  tenant: Tenant;
  users: TenantUser[];
  isLoading?: boolean;
  onInvite?: (email: string, role: TenantUserRole) => void;
  onRemove?: (userId: string) => void;
  onRoleChange?: (userId: string, role: TenantUserRole) => void;
  isInviting?: boolean;
  isRemoving?: boolean;
}

export function TenantUsers({
  tenant,
  users,
  isLoading,
  onInvite,
  onRemove,
  onRoleChange,
  isInviting,
  isRemoving,
}: TenantUsersProps) {
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<TenantUserRole>("MEMBER");

  const handleInvite = () => {
    if (inviteEmail && onInvite) {
      onInvite(inviteEmail, inviteRole);
      setInviteEmail("");
      setInviteRole("MEMBER");
      setShowInvite(false);
    }
  };

  return (
    <>
      <Card className="bg-terminal-surface border-terminal-border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="font-mono text-sm text-terminal-text flex items-center gap-2">
              <Users className="h-4 w-4 text-terminal-green" />
              Team Members
            </CardTitle>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowInvite(true)}
              className="h-7 px-2 text-xs font-mono border-terminal-green text-terminal-green hover:bg-terminal-green/10"
            >
              <Plus className="h-3 w-3 mr-1" />
              Invite
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="text-center py-4 text-terminal-dim font-mono text-sm">
              Loading users...
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-6 text-terminal-dim">
              <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-xs font-mono">No team members yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {users.map((user) => {
                const roleConfig = ROLE_CONFIG[user.role];
                const RoleIcon = roleConfig.icon;

                return (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 bg-terminal-bg border border-terminal-border rounded-lg"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-terminal-border flex items-center justify-center">
                        <span className="text-xs font-mono font-bold text-terminal-text">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-mono text-sm truncate">{user.name}</div>
                        <div className="flex items-center gap-1 text-xs text-terminal-dim">
                          <Mail className="h-3 w-3" />
                          <span className="truncate">{user.email}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={cn("font-mono text-xs", roleConfig.bg, roleConfig.color, "border-0")}
                      >
                        <RoleIcon className="h-3 w-3 mr-1" />
                        {roleConfig.label}
                      </Badge>

                      {onRoleChange && user.role !== "OWNER" && (
                        <Select
                          value={user.role}
                          onValueChange={(v) => onRoleChange(user.userId, v as TenantUserRole)}
                        >
                          <SelectTrigger className="h-7 w-20 font-mono text-xs bg-terminal-surface border-terminal-border" />
                          <SelectContent className="bg-terminal-surface border-terminal-border">
                            <SelectItem value="ADMIN">Admin</SelectItem>
                            <SelectItem value="MEMBER">Member</SelectItem>
                            <SelectItem value="VIEWER">Viewer</SelectItem>
                          </SelectContent>
                        </Select>
                      )}

                      {onRemove && user.role !== "OWNER" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onRemove(user.userId)}
                          disabled={isRemoving}
                          className="h-7 w-7 p-0 text-terminal-coral hover:text-terminal-coral hover:bg-terminal-coral/10"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Usage */}
          <div className="mt-4 pt-3 border-t border-terminal-border">
            <div className="flex items-center justify-between text-xs">
              <span className="text-terminal-dim font-mono">Users</span>
              <span className="font-mono text-terminal-text">
                {users.length} / {tenant.limits.maxUsers === -1 ? "∞" : tenant.limits.maxUsers}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invite Dialog */}
      <Dialog open={showInvite} onOpenChange={setShowInvite}>
        <DialogContent className="sm:max-w-[400px] bg-terminal-surface border-terminal-border">
          <DialogHeader>
            <DialogTitle className="font-mono text-lg text-terminal-text flex items-center gap-2">
              <Mail className="h-5 w-5 text-terminal-green" />
              Invite Team Member
            </DialogTitle>
            <DialogDescription className="text-terminal-dim">
              Invite a user to join {tenant.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="inviteEmail" className="text-terminal-text">
                <span className="text-terminal-green">$</span> Email Address
              </Label>
              <Input
                id="inviteEmail"
                type="email"
                placeholder="colleague@example.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="font-mono"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="inviteRole" className="text-terminal-text">
                Role
              </Label>
              <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as TenantUserRole)}>
                <SelectTrigger className="bg-terminal-surface border-terminal-border font-mono">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-terminal-surface border-terminal-border">
                  <SelectItem value="ADMIN">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-purple-400" />
                      <span>Admin</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="MEMBER">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-blue-400" />
                      <span>Member</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="VIEWER">
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-terminal-dim" />
                      <span>Viewer</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setShowInvite(false)}
              className="border-terminal-border"
            >
              Cancel
            </Button>
            <Button
              onClick={handleInvite}
              disabled={!inviteEmail || isInviting}
              className="font-mono"
            >
              {isInviting ? (
                <span className="animate-pulse">Inviting...</span>
              ) : (
                <>
                  <span className="text-terminal-bg">&gt;</span> Invite
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
