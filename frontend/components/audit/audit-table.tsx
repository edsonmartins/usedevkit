"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, FileText, Eye } from "lucide-react";
import { cn, formatRelativeTime } from "@/lib/utils";
import type { AuditLog } from "@/lib/types/audit";
import { ACTION_CATEGORIES } from "@/lib/types/audit";

interface AuditTableProps {
  logs: AuditLog[];
  isLoading?: boolean;
  onRowClick?: (log: AuditLog) => void;
}

export function AuditTable({ logs, isLoading, onRowClick }: AuditTableProps) {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const getCategoryForAction = (action: string) => {
    return Object.entries(ACTION_CATEGORIES).find(([_, cat]) =>
      cat.actions.includes(action as any)
    )?.[1];
  };

  const formatActionLabel = (action: string): string => {
    return action
      .split("_")
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(" ");
  };

  if (isLoading) {
    return (
      <Card className="bg-terminal-surface border-terminal-border">
        <CardContent className="p-8">
          <div className="text-center text-terminal-dim font-mono">
            Loading audit logs...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (logs.length === 0) {
    return (
      <Card className="bg-terminal-surface border-terminal-border">
        <CardContent className="p-8">
          <div className="text-center text-terminal-dim">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="font-mono">No audit logs found</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-terminal-surface border-terminal-border">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-terminal-border">
              <tr className="text-left">
                <th className="p-3 font-mono text-xs text-terminal-dim">Timestamp</th>
                <th className="p-3 font-mono text-xs text-terminal-dim">Action</th>
                <th className="p-3 font-mono text-xs text-terminal-dim">Entity</th>
                <th className="p-3 font-mono text-xs text-terminal-dim">User</th>
                <th className="p-3 font-mono text-xs text-terminal-dim">IP Address</th>
                <th className="p-3 font-mono text-xs text-terminal-dim w-20"></th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => {
                const category = getCategoryForAction(log.action);
                const isExpanded = expandedRow === log.id;

                return (
                  <>
                    <tr
                      key={log.id}
                      onClick={() => onRowClick ? onRowClick(log) : setExpandedRow(isExpanded ? null : log.id)}
                      className={cn(
                        "border-b border-terminal-border cursor-pointer transition-colors",
                        "hover:bg-terminal-border/30"
                      )}
                    >
                      <td className="p-3">
                        <div className="font-mono text-xs text-terminal-text">
                          {formatRelativeTime(new Date(log.timestamp))}
                        </div>
                        <div className="text-[10px] text-terminal-dim font-mono">
                          {new Date(log.timestamp).toLocaleString()}
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge
                          variant="outline"
                          className={cn(
                            "font-mono text-xs",
                            category?.color || "bg-terminal-bg text-terminal-dim",
                            "border-0"
                          )}
                        >
                          {formatActionLabel(log.action)}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div className="font-mono text-sm text-terminal-text">
                          {log.entityName || log.entityId || "-"}
                        </div>
                        <div className="text-[10px] text-terminal-dim font-mono uppercase">
                          {log.entityType}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="font-mono text-sm text-terminal-text">
                          {log.userName}
                        </div>
                        <div className="text-[10px] text-terminal-dim font-mono">
                          {log.userEmail}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="font-mono text-xs text-terminal-dim">
                          {log.ipAddress || "-"}
                        </div>
                      </td>
                      <td className="p-3">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            onRowClick ? onRowClick(log) : setExpandedRow(isExpanded ? null : log.id);
                          }}
                        >
                          <Eye className="h-3 w-3 text-terminal-dim" />
                        </Button>
                      </td>
                    </tr>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <tr className="bg-terminal-bg">
                        <td colSpan={6} className="p-4">
                          <div className="space-y-3">
                            {/* Changes */}
                            {log.changes && Object.keys(log.changes).length > 0 && (
                              <div>
                                <div className="text-xs font-mono text-terminal-dim mb-2">Changes</div>
                                <div className="space-y-1">
                                  {Object.entries(log.changes).map(([key, value]) => (
                                    <div key={key} className="flex items-center gap-2 text-xs font-mono bg-terminal-surface p-2 rounded">
                                      <span className="text-terminal-dim">{key}:</span>
                                      {value.from !== undefined && (
                                        <span className="text-terminal-coral line-through">
                                          {JSON.stringify(value.from)}
                                        </span>
                                      )}
                                      {value.from !== undefined && value.to !== undefined && (
                                        <span className="text-terminal-dim">→</span>
                                      )}
                                      {value.to !== undefined && (
                                        <span className="text-terminal-green">
                                          {JSON.stringify(value.to)}
                                        </span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Metadata */}
                            {log.metadata && Object.keys(log.metadata).length > 0 && (
                              <div>
                                <div className="text-xs font-mono text-terminal-dim mb-2">Metadata</div>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                  {Object.entries(log.metadata).map(([key, value]) => (
                                    <div key={key} className="bg-terminal-surface p-2 rounded font-mono">
                                      <span className="text-terminal-dim">{key}:</span>{" "}
                                      <span className="text-terminal-text">
                                        {JSON.stringify(value)}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* User Agent */}
                            {log.userAgent && (
                              <div className="text-xs">
                                <span className="text-terminal-dim font-mono">User Agent:</span>{" "}
                                <span className="text-terminal-text font-mono truncate block">
                                  {log.userAgent}
                                </span>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

// Pagination Component
interface AuditPaginationProps {
  currentPage: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
}

export function AuditPagination({
  currentPage,
  totalPages,
  total,
  limit,
  onPageChange,
}: AuditPaginationProps) {
  const startItem = currentPage * limit + 1;
  const endItem = Math.min((currentPage + 1) * limit, total);

  return (
    <div className="flex items-center justify-between">
      <div className="text-xs text-terminal-dim font-mono">
        Showing {startItem} to {endItem} of {total} entries
      </div>

      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 0}
          className="h-8 px-3 font-mono border-terminal-border"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </Button>

        <div className="flex items-center gap-1">
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum;
            if (totalPages <= 5) {
              pageNum = i;
            } else if (currentPage < 3) {
              pageNum = i;
            } else if (currentPage >= totalPages - 3) {
              pageNum = totalPages - 5 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }

            return (
              <Button
                key={pageNum}
                size="sm"
                variant={pageNum === currentPage ? "default" : "outline"}
                onClick={() => onPageChange(pageNum)}
                className={cn(
                  "h-8 w-8 p-0 font-mono text-xs",
                  pageNum === currentPage
                    ? "bg-terminal-green text-terminal-bg"
                    : "border-terminal-border"
                )}
              >
                {pageNum + 1}
              </Button>
            );
          })}
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages - 1}
          className="h-8 px-3 font-mono border-terminal-border"
        >
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
