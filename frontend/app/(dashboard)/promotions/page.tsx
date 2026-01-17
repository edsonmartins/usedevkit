"use client";

import { useState } from "react";
import { Plus, Filter, ArrowRight, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePromotions, usePromotionStats, usePromotionDiff } from "@/lib/hooks/use-promotions";
import { useApplications, useApplicationEnvironments } from "@/lib/hooks/use-applications";
import { PromotionCard } from "@/components/promotions/promotion-card";
import { PromotionWizard } from "@/components/promotions/promotion-wizard";
import type { Promotion, PromotionStatus } from "@/lib/types/promotion";
import type { Environment } from "@/lib/types/application";

export default function PromotionsPage() {
  const [statusFilter, setStatusFilter] = useState<PromotionStatus | "ALL">("ALL");
  const [selectedApplication, setSelectedApplication] = useState<string>("all");
  const [showWizard, setShowWizard] = useState(false);
  const [sourceEnv, setSourceEnv] = useState<string | null>(null);
  const [targetEnv, setTargetEnv] = useState<string | null>(null);

  const { applications } = useApplications();
  const { environments } = useApplicationEnvironments(selectedApplication === "all" ? "" : selectedApplication);

  const { promotions, isLoading, create, approve, reject, execute, rollback, cancel, delete: deletePromotion, isApproving, isRejecting, isExecuting, isRollingBack, isCancelling, isDeleting, isCreating } = usePromotions(selectedApplication === "all" ? undefined : selectedApplication);
  const { data: stats } = usePromotionStats();

  // Get diffs for preview
  const { data: diffs, isLoading: isLoadingDiffs } = usePromotionDiff(
    sourceEnv || "",
    targetEnv || "",
    !!sourceEnv && !!targetEnv
  );

  // Filter promotions
  const filteredPromotions = promotions.filter((promo) => {
    return statusFilter === "ALL" || promo.status === statusFilter;
  });

  const handleCreatePromotion = () => {
    if (selectedApplication === "all") {
      return;
    }
    setShowWizard(true);
  };

  const statsData = stats || { total: 0, pending: 0, approved: 0, completed: 0, failed: 0 };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-terminal-text">
            <span className="text-terminal-green">./</span>promotions
          </h1>
          <p className="text-terminal-dim mt-1">
            Promote configurations between environments
          </p>
        </div>
        <Button onClick={handleCreatePromotion} className="font-mono">
          <Plus className="mr-2 h-4 w-4" />
          New Promotion
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
        <Card className="bg-terminal-surface border-terminal-border">
          <CardContent className="p-4">
            <div className="text-terminal-dim text-sm font-mono">Total</div>
            <div className="text-2xl font-mono font-bold text-terminal-text mt-1">
              {statsData.total}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-terminal-surface border-terminal-border">
          <CardContent className="p-4">
            <div className="text-terminal-dim text-sm font-mono">Pending</div>
            <div className="text-2xl font-mono font-bold text-yellow-400 mt-1">
              {statsData.pending}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-terminal-surface border-terminal-border">
          <CardContent className="p-4">
            <div className="text-terminal-dim text-sm font-mono">Approved</div>
            <div className="text-2xl font-mono font-bold text-terminal-green mt-1">
              {statsData.approved}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-terminal-surface border-terminal-border">
          <CardContent className="p-4">
            <div className="text-terminal-dim text-sm font-mono">Completed</div>
            <div className="text-2xl font-mono font-bold text-blue-400 mt-1">
              {statsData.completed}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-terminal-surface border-terminal-border">
          <CardContent className="p-4">
            <div className="text-terminal-dim text-sm font-mono">Failed</div>
            <div className="text-2xl font-mono font-bold text-terminal-coral mt-1">
              {statsData.failed}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Select value={selectedApplication} onValueChange={setSelectedApplication}>
          <SelectTrigger className="sm:w-[200px] font-mono border-terminal-border bg-terminal-surface">
            <SelectValue placeholder="All Applications" />
          </SelectTrigger>
          <SelectContent className="bg-terminal-surface border-terminal-border">
            <SelectItem value="all" className="font-mono">All Applications</SelectItem>
            {applications.map((app) => (
              <SelectItem key={app.id} value={app.id} className="font-mono">
                {app.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as PromotionStatus | "ALL")}>
          <SelectTrigger className="sm:w-[180px] font-mono border-terminal-border bg-terminal-surface">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-terminal-surface border-terminal-border">
            <SelectItem value="ALL" className="font-mono">All Status</SelectItem>
            <SelectItem value="DRAFT" className="font-mono">Draft</SelectItem>
            <SelectItem value="PENDING_APPROVAL" className="font-mono">Pending Approval</SelectItem>
            <SelectItem value="APPROVED" className="font-mono">Approved</SelectItem>
            <SelectItem value="EXECUTING" className="font-mono">Executing</SelectItem>
            <SelectItem value="COMPLETED" className="font-mono">Completed</SelectItem>
            <SelectItem value="FAILED" className="font-mono">Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Empty State */}
      {selectedApplication === "all" ? (
        <Card className="bg-terminal-surface border-terminal-border">
          <CardContent className="py-16">
            <div className="text-center text-terminal-dim font-mono">
              <History className="h-12 w-12 mx-auto mb-4 text-terminal-green/50" />
              <p className="mb-4">Select an application to view its promotions</p>
            </div>
          </CardContent>
        </Card>
      ) : filteredPromotions.length === 0 ? (
        <Card className="bg-terminal-surface border-terminal-border">
          <CardContent className="py-16">
            <div className="text-center">
              <div className="font-mono text-terminal-dim mb-4">
                <span className="text-terminal-green">$</span> No promotions found
              </div>
              <p className="text-terminal-dim text-sm mb-6">
                Create your first promotion to move configurations between environments
              </p>
              <Button
                onClick={handleCreatePromotion}
                variant="outline"
                className="font-mono border-terminal-green/50 text-terminal-green hover:bg-terminal-green/10"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Promotion
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Promotions Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPromotions.map((promo) => (
            <PromotionCard
              key={promo.id}
              promotion={promo}
              onApprove={() => approve({ id: promo.id })}
              onReject={() => reject({ id: promo.id })}
              onExecute={() => execute(promo.id)}
              onRollback={() => rollback(promo.id)}
              onCancel={() => cancel(promo.id)}
              onDelete={() => deletePromotion(promo.id)}
              isApproving={isApproving}
              isRejecting={isRejecting}
              isExecuting={isExecuting}
              isRollingBack={isRollingBack}
              isCancelling={isCancelling}
              isDeleting={isDeleting}
            />
          ))}
        </div>
      )}

      {/* Wizard Dialog */}
      {selectedApplication !== "all" && (
        <PromotionWizard
          open={showWizard}
          onClose={() => setShowWizard(false)}
          onSubmit={(data) => {
            create(data as typeof data);
            setShowWizard(false);
          }}
          application={applications.find((a) => a.id === selectedApplication)!}
          environments={environments}
          diffs={diffs || []}
          isLoadingDiffs={isLoadingDiffs}
          isSubmitting={isCreating}
        />
      )}
    </div>
  );
}
