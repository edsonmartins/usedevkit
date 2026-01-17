"use client";

import { useUIStore } from "@/lib/stores/ui-store";
import { useAuthStore } from "@/lib/stores/auth-store";
import { Menu, Bell, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { selectedApplication, selectedEnvironment } = useUIStore();
  const { apiKey } = useAuthStore();

  // Format API key for display
  const formatApiKey = (key: string | null) => {
    if (!key) return "Not authenticated";
    if (key.length <= 12) return key;
    return `${key.slice(0, 8)}...${key.slice(-4)}`;
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-terminal-border bg-terminal-surface px-4">
      <div className="flex items-center gap-4">
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden text-terminal-dim hover:text-terminal-green"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Context breadcrumbs */}
        <div className="flex items-center gap-2 text-sm">
          {selectedApplication && (
            <>
              <span className="text-terminal-dim">Application:</span>
              <Badge variant="secondary" className="font-mono">
                {selectedApplication}
              </Badge>
            </>
          )}
          {selectedEnvironment && (
            <>
              <span className="text-terminal-dim">Environment:</span>
              <Badge variant="outline" className="font-mono border-terminal-green/50 text-terminal-green">
                {selectedEnvironment}
              </Badge>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="text-terminal-dim hover:text-terminal-green relative"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-terminal-green opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-terminal-green"></span>
          </span>
        </Button>

        {/* API Key indicator */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 border-terminal-border font-mono text-xs"
            >
              <span className="text-terminal-green">$</span>
              {formatApiKey(apiKey)}
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-mono">
              <span className="text-terminal-green">root@devkit:~$</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-terminal-border" />
            <DropdownMenuItem className="font-mono text-sm cursor-pointer">
              API Key: {formatApiKey(apiKey)}
            </DropdownMenuItem>
            <DropdownMenuItem className="font-mono text-sm text-terminal-green cursor-pointer">
              Status: Connected
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-terminal-border" />
            <DropdownMenuItem className="font-mono text-sm text-terminal-dim cursor-pointer">
              v1.0.0
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
