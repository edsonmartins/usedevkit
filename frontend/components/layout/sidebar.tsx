"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/lib/stores/ui-store";
import {
  LayoutDashboard,
  Boxes,
  Key,
  Flag,
  GitCompare,
  Webhook,
  Server,
  Building,
  Shield,
  FileText,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { useAuthStore } from "@/lib/stores/auth-store";
import { Button } from "@/components/ui/button";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Applications", href: "/applications", icon: Boxes },
  { name: "Configurations", href: "/configurations", icon: Key },
  { name: "Feature Flags", href: "/feature-flags", icon: Flag },
  { name: "Secrets", href: "/secrets", icon: Key },
  { name: "Promotions", href: "/promotions", icon: GitCompare },
  { name: "Webhooks", href: "/webhooks", icon: Webhook },
  { name: "Services", href: "/services", icon: Server },
  { name: "Tenants", href: "/tenants", icon: Building },
  { name: "Roles", href: "/roles", icon: Shield },
  { name: "Audit Logs", href: "/audit", icon: FileText },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const { logout } = useAuthStore();

  return (
    <div
      className={cn(
        "flex flex-col border-r border-terminal-border bg-terminal-surface transition-all duration-300",
        sidebarCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-terminal-border px-4">
        {!sidebarCollapsed && (
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-terminal-green text-terminal-bg">
              <span className="font-mono font-bold text-lg">&gt;</span>
            </div>
            <span className="font-mono font-bold text-lg text-terminal-green">
              DevKit
            </span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="h-8 w-8 text-terminal-dim hover:text-terminal-green"
        >
          {sidebarCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-2">
        <ul className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-terminal-green/10 text-terminal-green"
                      : "text-terminal-dim hover:bg-terminal-border/50 hover:text-terminal-text",
                    sidebarCollapsed && "justify-center px-2"
                  )}
                  title={sidebarCollapsed ? item.name : undefined}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {!sidebarCollapsed && <span>{item.name}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User section */}
      <div className="border-t border-terminal-border p-2">
        <Button
          variant="ghost"
          onClick={logout}
          className={cn(
            "w-full justify-start text-terminal-dim hover:text-terminal-coral",
            sidebarCollapsed && "justify-center px-2"
          )}
          title={sidebarCollapsed ? "Logout" : undefined}
        >
          <LogOut className="h-5 w-5" />
          {!sidebarCollapsed && <span className="ml-3">Logout</span>}
        </Button>
      </div>
    </div>
  );
}
