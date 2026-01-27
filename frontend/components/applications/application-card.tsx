"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Settings, ChevronRight, Power, PowerOff } from "lucide-react";
import { cn, formatRelativeTime } from "@/lib/utils";
import type { Application } from "@/lib/types/application";

interface ApplicationCardProps {
  application: Application;
  onActivate?: (id: string) => void;
  onDeactivate?: (id: string) => void;
  onDelete?: (id: string) => void;
  isActivating?: boolean;
  isDeactivating?: boolean;
  isDeleting?: boolean;
}

export function ApplicationCard({
  application,
  onActivate,
  onDeactivate,
  onDelete,
  isActivating,
  isDeactivating,
  isDeleting,
}: ApplicationCardProps) {
  const router = useRouter();

  const statusColor = application.active
    ? "text-terminal-green border-terminal-green/50 bg-terminal-green/10"
    : "text-terminal-dim border-terminal-dim/30 bg-terminal-surface";

  const statusText = application.active ? "Active" : "Inactive";

  return (
    <Card
      className="group hover:border-terminal-green/50 transition-all cursor-pointer"
      onClick={() => router.push(`/applications/${application.id}`)}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="font-mono text-lg text-terminal-text group-hover:text-terminal-green transition-colors">
          {application.name}
        </CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-terminal-dim hover:text-terminal-green"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => router.push(`/applications/${application.id}`)}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-terminal-border" />
            {application.active ? (
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onDeactivate?.(application.id);
                }}
                disabled={isDeactivating}
              >
                <PowerOff className="mr-2 h-4 w-4 text-terminal-dim" />
                Deactivate
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onActivate?.(application.id);
                }}
                disabled={isActivating}
              >
                <Power className="mr-2 h-4 w-4 text-terminal-green" />
                Activate
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator className="bg-terminal-border" />
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.(application.id);
              }}
              disabled={isDeleting}
              className="text-terminal-coral focus:text-terminal-coral"
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>

      <CardContent>
        {application.description && (
          <p className="text-sm text-terminal-dim mb-4 line-clamp-2">
            {application.description}
          </p>
        )}

        {application.environments && application.environments.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {application.environments.map((env) => (
              <Badge
                key={env.id}
                variant="outline"
                className="font-mono text-xs border-terminal-border/50"
              >
                {env.name}
              </Badge>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-terminal-dim">Status:</span>
            <Badge variant="outline" className={cn("text-xs", statusColor)}>
              {statusText}
            </Badge>
          </div>

          <div className="flex items-center text-terminal-dim text-xs">
            <span>Updated {formatRelativeTime(application.updatedAt)}</span>
            <ChevronRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
