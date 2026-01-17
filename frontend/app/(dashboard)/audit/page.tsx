"use client";

import { useState } from "react";
import { FileText, Activity } from "lucide-react";
import { AuditTable, AuditPagination } from "@/components/audit/audit-table";
import { AuditFilters } from "@/components/audit/audit-filters";
import { AuditDetail } from "@/components/audit/audit-detail";
import { useAuditLogs, useAuditStats } from "@/lib/hooks/use-audit";
import type { AuditLogFilter, AuditLog } from "@/lib/types/audit";

export default function AuditPage() {
  const [filters, setFilters] = useState<AuditLogFilter>({ limit: 50 });
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  const { logs, total, page, limit, totalPages, isLoading, refetch, export: exportLogs, isExporting } = useAuditLogs(filters);
  const { data: stats } = useAuditStats(filters.startDate, filters.endDate);

  const handlePageChange = (newPage: number) => {
    setFilters({ ...filters, page: newPage });
  };

  const handleExport = (format: "csv" | "json") => {
    exportLogs({ format });
  };

  const handleRowClick = (log: AuditLog) => {
    setSelectedLog(log);
    setShowDetail(true);
  };

  // Calculate stats for display
  const activityByHour = logs.reduce((acc, log) => {
    const hour = new Date(log.timestamp).getHours();
    acc[hour] = (acc[hour] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  const maxActivity = Math.max(...Object.values(activityByHour), 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-mono font-bold text-terminal-text flex items-center gap-2">
            <FileText className="h-6 w-6 text-terminal-green" />
            Audit Logs
          </h1>
          <p className="text-terminal-dim font-mono text-sm mt-1">
            System activity and audit trail
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-terminal-surface border border-terminal-border rounded-lg">
          <div className="text-2xl font-mono font-bold text-terminal-text">
            {stats?.total ?? total}
          </div>
          <div className="text-xs text-terminal-dim font-mono mt-1">Total Events</div>
        </div>
        <div className="p-4 bg-terminal-surface border border-terminal-border rounded-lg">
          <div className="text-2xl font-mono font-bold text-terminal-green">
            {stats?.today ?? 0}
          </div>
          <div className="text-xs text-terminal-dim font-mono mt-1">Today</div>
        </div>
        <div className="p-4 bg-terminal-surface border border-terminal-border rounded-lg">
          <div className="text-2xl font-mono font-bold text-terminal-blue-400">
            {stats?.thisWeek ?? 0}
          </div>
          <div className="text-xs text-terminal-dim font-mono mt-1">This Week</div>
        </div>
        <div className="p-4 bg-terminal-surface border border-terminal-border rounded-lg">
          <div className="text-2xl font-mono font-bold text-terminal-purple-400">
            {stats?.thisMonth ?? 0}
          </div>
          <div className="text-xs text-terminal-dim font-mono mt-1">This Month</div>
        </div>
      </div>

      {/* Activity Chart (Simple bar visualization) */}
      {Object.keys(activityByHour).length > 0 && (
        <div className="p-4 bg-terminal-surface border border-terminal-border rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="h-4 w-4 text-terminal-green" />
            <span className="text-sm font-mono text-terminal-text">Activity (last 50 events)</span>
          </div>
          <div className="flex items-end gap-1 h-16">
            {Array.from({ length: 24 }, (_, i) => {
              const count = activityByHour[i] || 0;
              const height = (count / maxActivity) * 100;
              return (
                <div
                  key={i}
                  className="flex-1 bg-terminal-green/50 hover:bg-terminal-green transition-colors rounded-t"
                  style={{ height: `${Math.max(height, 5)}%` }}
                  title={`${i}:00 - ${count} events`}
                />
              );
            })}
          </div>
          <div className="flex justify-between text-[10px] text-terminal-dim font-mono mt-1">
            <span>00:00</span>
            <span>06:00</span>
            <span>12:00</span>
            <span>18:00</span>
            <span>23:00</span>
          </div>
        </div>
      )}

      {/* Filters */}
      <AuditFilters
        filters={filters}
        onFiltersChange={setFilters}
        onExport={handleExport}
        isExporting={isExporting}
      />

      {/* Audit Table */}
      <AuditTable
        logs={logs}
        isLoading={isLoading}
        onRowClick={handleRowClick}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <AuditPagination
          currentPage={page}
          totalPages={totalPages}
          total={total}
          limit={limit}
          onPageChange={handlePageChange}
        />
      )}

      {/* Detail Dialog */}
      <AuditDetail
        log={selectedLog}
        open={showDetail}
        onClose={() => {
          setShowDetail(false);
          setSelectedLog(null);
        }}
      />
    </div>
  );
}
