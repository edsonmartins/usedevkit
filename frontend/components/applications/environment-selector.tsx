"use client";

import { Check, ChevronDown, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Environment } from "@/lib/types/application";

interface EnvironmentSelectorProps {
  applicationId: string;
  environments: Environment[];
  selectedEnvironmentId: string | null;
  onEnvironmentChange: (envId: string, envName: string) => void;
}

export function EnvironmentSelector({
  applicationId,
  environments,
  selectedEnvironmentId,
  onEnvironmentChange,
}: EnvironmentSelectorProps) {
  const selectedEnv = environments.find((e) => e.id === selectedEnvironmentId);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "font-mono text-sm border-terminal-border bg-terminal-surface",
            selectedEnv && "border-terminal-green/50 text-terminal-green"
          )}
        >
          {selectedEnv ? (
            <>
              <span className="text-terminal-green">$</span> {selectedEnv.name}
            </>
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" />
              Select Environment
            </>
          )}
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48 bg-terminal-surface border-terminal-border">
        {environments.map((env) => (
          <DropdownMenuItem
            key={env.id}
            onClick={() => onEnvironmentChange(env.id, env.name)}
            className={cn(
              "font-mono text-sm cursor-pointer",
              selectedEnvironmentId === env.id && "bg-terminal-green/10 text-terminal-green"
            )}
          >
            <span className="text-terminal-dim mr-2">$</span>
            {env.name}
            {selectedEnvironmentId === env.id && (
              <Check className="ml-auto h-4 w-4 text-terminal-green" />
            )}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator className="bg-terminal-border" />
        <DropdownMenuItem className="font-mono text-sm text-terminal-green cursor-pointer">
          <Plus className="mr-2 h-4 w-4" />
          New Environment
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
