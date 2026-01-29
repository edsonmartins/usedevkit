"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Network, Server, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DependencyGraph, ServiceDependencyNode, ServiceStatus } from "@/lib/types/service";

const STATUS_COLORS: Record<ServiceStatus, string> = {
  HEALTHY: "bg-terminal-green",
  DEGRADED: "bg-yellow-400",
  UNHEALTHY: "bg-terminal-coral",
  UNKNOWN: "bg-terminal-dim",
};

interface DependencyGraphProps {
  graph: DependencyGraph | null | undefined;
  isLoading?: boolean;
}

export function DependencyGraph({ graph, isLoading }: DependencyGraphProps) {
  const nodePositions = useMemo(() => {
    if (!graph || graph.nodes.length === 0) {
      return { positions: new Map<string, { x: number; y: number; layer: number }>(), layers: [] as ServiceDependencyNode[][] };
    }

    const positions = new Map<string, { x: number; y: number; layer: number }>();
    const layers: ServiceDependencyNode[][] = [];
    const processed = new Set<string>();
    const inDegree = new Map<string, number>();

    // Calculate in-degrees
    graph.nodes.forEach((node) => {
      inDegree.set(node.id, 0);
    });
    graph.edges.forEach((edge) => {
      inDegree.set(edge.to, (inDegree.get(edge.to) || 0) + 1);
    });

    // Topological sort to create layers
    const queue = graph.nodes.filter((node) => (inDegree.get(node.id) || 0) === 0);
    let layerIndex = 0;

    while (queue.length > 0) {
      const layer = [...queue];
      layers.push(layer);
      queue.length = 0;

      layer.forEach((node) => {
        processed.add(node.id);
        const outgoingEdges = graph.edges.filter((e) => e.from === node.id);
        outgoingEdges.forEach((edge) => {
          if (!processed.has(edge.to)) {
            inDegree.set(edge.to, (inDegree.get(edge.to) || 0) - 1);
            if (inDegree.get(edge.to) === 0) {
              queue.push(graph.nodes.find((n) => n.id === edge.to)!);
            }
          }
        });
      });

      layerIndex++;
    }

    // Calculate positions
    const maxLayerWidth = Math.max(...layers.map((l) => l.length));
    const layerSpacing = 200;
    const nodeSpacing = 100;

    layers.forEach((layer, layerIdx) => {
      const startX = ((maxLayerWidth - layer.length) * nodeSpacing) / 2;
      layer.forEach((node, nodeIdx) => {
        positions.set(node.id, {
          x: startX + nodeIdx * nodeSpacing,
          y: layerIdx * layerSpacing,
          layer: layerIdx,
        });
      });
    });

    return { positions, layers };
  }, [graph]);

  if (isLoading) {
    return (
      <Card className="bg-terminal-surface border-terminal-border">
        <CardHeader className="pb-3">
          <CardTitle className="font-mono text-sm text-terminal-text flex items-center gap-2">
            <Network className="h-4 w-4 text-terminal-green" />
            Dependency Graph
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-terminal-dim font-mono text-sm">
            Loading graph...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!graph || graph.nodes.length === 0) {
    return (
      <Card className="bg-terminal-surface border-terminal-border">
        <CardHeader className="pb-3">
          <CardTitle className="font-mono text-sm text-terminal-text flex items-center gap-2">
            <Network className="h-4 w-4 text-terminal-green" />
            Dependency Graph
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-terminal-dim font-mono text-sm">
            No dependencies found
          </div>
        </CardContent>
      </Card>
    );
  }

  const { positions, layers } = nodePositions;

  return (
    <Card className="bg-terminal-surface border-terminal-border">
      <CardHeader className="pb-3">
        <CardTitle className="font-mono text-sm text-terminal-text flex items-center gap-2">
          <Network className="h-4 w-4 text-terminal-green" />
          Dependency Graph
        </CardTitle>
      </CardHeader>

      <CardContent>
        {/* Legend */}
        <div className="flex items-center gap-4 mb-4 pb-3 border-b border-terminal-border">
          <div className="flex items-center gap-1 text-xs text-terminal-dim">
            <div className="w-2 h-2 rounded-full bg-terminal-green" />
            Healthy
          </div>
          <div className="flex items-center gap-1 text-xs text-terminal-dim">
            <div className="w-2 h-2 rounded-full bg-yellow-400" />
            Degraded
          </div>
          <div className="flex items-center gap-1 text-xs text-terminal-dim">
            <div className="w-2 h-2 rounded-full bg-terminal-coral" />
            Unhealthy
          </div>
          <div className="flex items-center gap-1 text-xs text-terminal-dim">
            <ArrowRight className="h-3 w-3" />
            Depends on
          </div>
        </div>

        {/* Graph visualization */}
        <div className="overflow-x-auto">
          <div
            className="relative min-w-max"
            style={{
              height: `${(layers.length * 200) + 50}px`,
              width: `${Math.max(600, (Math.max(...layers.map((l) => l.length)) * 100) + 100)}px`,
            }}
          >
            {/* Edges (SVG) */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              style={{ zIndex: 1 }}
            >
              {graph.edges.map((edge, idx) => {
                const from = positions.get(edge.from);
                const to = positions.get(edge.to);
                if (!from || !to) return null;

                return (
                  <g key={idx}>
                    <line
                      x1={from.x + 50}
                      y1={from.y + 25}
                      x2={to.x + 50}
                      y2={to.y + 25}
                      stroke="#3a3a3a"
                      strokeWidth="2"
                      markerEnd="url(#arrowhead)"
                    />
                  </g>
                );
              })}
              <defs>
                <marker
                  id="arrowhead"
                  markerWidth="10"
                  markerHeight="7"
                  refX="9"
                  refY="3.5"
                  orient="auto"
                >
                  <polygon points="0 0, 10 3.5, 0 7" fill="#3a3a3a" />
                </marker>
              </defs>
            </svg>

            {/* Nodes */}
            {graph.nodes.map((node) => {
              const pos = positions.get(node.id);
              if (!pos) return null;

              return (
                <div
                  key={node.id}
                  className="absolute p-2 bg-terminal-surface border border-terminal-border rounded-lg transition-colors hover:border-terminal-green/50"
                  style={{
                    left: pos.x,
                    top: pos.y,
                    width: "100px",
                    zIndex: 2,
                  }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      className={cn("w-2 h-2 rounded-full", STATUS_COLORS[node.status])}
                    />
                    <span className="text-xs font-mono truncate flex-1">{node.name}</span>
                  </div>
                  <Badge variant="outline" className="font-mono text-[10px] bg-terminal-bg border-terminal-border w-full justify-center">
                    {node.type}
                  </Badge>
                </div>
              );
            })}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-4 pt-3 border-t border-terminal-border flex items-center justify-between text-xs text-terminal-dim font-mono">
          <span>{graph.nodes.length} services</span>
          <span>{graph.edges.length} dependencies</span>
          <span>{layers.length} layers</span>
        </div>
      </CardContent>
    </Card>
  );
}

interface DependencyGraphDialogProps {
  open: boolean;
  onClose: () => void;
  graph: DependencyGraph | null | undefined;
  isLoading?: boolean;
}

export function DependencyGraphDialog({
  open,
  onClose,
  graph,
  isLoading,
}: DependencyGraphDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] bg-terminal-surface border-terminal-border">
        <DialogHeader>
          <DialogTitle className="font-mono text-lg text-terminal-text flex items-center gap-2">
            <Network className="h-5 w-5 text-terminal-green" />
            Service Dependency Graph
          </DialogTitle>
          <DialogDescription className="text-terminal-dim">
            Visual representation of service dependencies
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <DependencyGraph graph={graph} isLoading={isLoading} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
