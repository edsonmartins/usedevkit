"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ChevronLeft, ChevronRight, Check, ArrowRight, Eye, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { CreatePromotionDto, PromotionDiff } from "@/lib/types/promotion";
import type { Environment, Application } from "@/lib/types/application";

const promotionSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  description: z.string().max(500, "Description must be less than 500 characters").optional(),
  sourceEnvironmentId: z.string().min(1, "Source environment is required"),
  targetEnvironmentId: z.string().min(1, "Target environment is required"),
});

type PromotionForm = z.infer<typeof promotionSchema>;

type Step = "environments" | "review" | "confirm";

interface PromotionWizardProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreatePromotionDto) => void;
  application: Application;
  environments: Environment[];
  diffs?: PromotionDiff[];
  isLoadingDiffs?: boolean;
  isSubmitting?: boolean;
}

const STEPS: { id: Step; title: string; description: string }[] = [
  { id: "environments", title: "Select Environments", description: "Choose source and target" },
  { id: "review", title: "Review Changes", description: "Preview configuration differences" },
  { id: "confirm", title: "Confirm", description: "Review and create promotion" },
];

export function PromotionWizard({
  open,
  onClose,
  onSubmit,
  application,
  environments,
  diffs = [],
  isLoadingDiffs = false,
  isSubmitting = false,
}: PromotionWizardProps) {
  const [currentStep, setCurrentStep] = useState<Step>("environments");
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<PromotionForm>({
    resolver: zodResolver(promotionSchema),
    defaultValues: {
      name: "",
      description: "",
      sourceEnvironmentId: "",
      targetEnvironmentId: "",
    },
  });

  const stepIndex = STEPS.findIndex((s) => s.id === currentStep);
  const selectedSourceName = environments.find((e) => e.id === selectedSource)?.name;
  const selectedTargetName = environments.find((e) => e.id === selectedTarget)?.name;

  const canProceedToReview = selectedSource && selectedTarget && selectedSource !== selectedTarget;

  const handleNext = () => {
    if (currentStep === "environments" && canProceedToReview) {
      setValue("sourceEnvironmentId", selectedSource!);
      setValue("targetEnvironmentId", selectedTarget!);
      setCurrentStep("review");
    } else if (currentStep === "review") {
      setCurrentStep("confirm");
    }
  };

  const handleBack = () => {
    if (currentStep === "review") {
      setCurrentStep("environments");
    } else if (currentStep === "confirm") {
      setCurrentStep("review");
    }
  };

  const handleFormSubmit = (data: PromotionForm) => {
    onSubmit({
      ...data,
      applicationId: application.id,
      sourceEnvironmentId: selectedSource!,
      targetEnvironmentId: selectedTarget!,
    });
  };

  const resetWizard = () => {
    reset();
    setSelectedSource(null);
    setSelectedTarget(null);
    setCurrentStep("environments");
  };

  return (
    <Dialog open={open} onOpenChange={(open) => {
      if (!open) {
        resetWizard();
        onClose();
      }
    }}>
      <DialogContent className="sm:max-w-[600px] bg-terminal-surface border-terminal-border">
        <DialogHeader>
          <DialogTitle className="font-mono text-xl text-terminal-text">
            Create Promotion
          </DialogTitle>
          <DialogDescription className="text-terminal-dim">
            Promote configurations from {application.name}
          </DialogDescription>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="space-y-4 py-4">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center font-mono text-sm border-2 transition-colors",
                      index <= stepIndex
                        ? "bg-terminal-green border-terminal-green text-terminal-bg"
                        : "bg-terminal-bg border-terminal-border text-terminal-dim"
                    )}
                  >
                    {index < stepIndex ? <Check className="h-4 w-4" /> : index + 1}
                  </div>
                  <div className="text-xs mt-1 font-mono text-center hidden sm:block">
                    <div className={cn(
                      "w-20",
                      index <= stepIndex ? "text-terminal-text" : "text-terminal-dim"
                    )}>
                      {step.title}
                    </div>
                  </div>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={cn(
                      "flex-1 h-0.5 mx-2 transition-colors",
                      index < stepIndex ? "bg-terminal-green" : "bg-terminal-border"
                    )}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="h-1 bg-terminal-border rounded-full overflow-hidden">
            <div
              className="h-full bg-terminal-green transition-all"
              style={{ width: `${((stepIndex + 1) / STEPS.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div className="min-h-[300px]">
          {/* Step 1: Select Environments */}
          {currentStep === "environments" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-terminal-text">Source Environment</Label>
                  <Select value={selectedSource || ""} onValueChange={setSelectedSource}>
                    <SelectTrigger className="font-mono border-terminal-border bg-terminal-surface">
                      <SelectValue placeholder="Select source..." />
                    </SelectTrigger>
                    <SelectContent className="bg-terminal-surface border-terminal-border">
                      {environments.map((env) => (
                        <SelectItem key={env.id} value={env.id} className="font-mono">
                          {env.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-terminal-dim">
                    Environment to promote from
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-terminal-text">Target Environment</Label>
                  <Select value={selectedTarget || ""} onValueChange={setSelectedTarget}>
                    <SelectTrigger className="font-mono border-terminal-border bg-terminal-surface">
                      <SelectValue placeholder="Select target..." />
                    </SelectTrigger>
                    <SelectContent className="bg-terminal-surface border-terminal-border">
                      {environments.map((env) => (
                        <SelectItem key={env.id} value={env.id} className="font-mono">
                          {env.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-terminal-dim">
                    Environment to promote to
                  </p>
                </div>
              </div>

              {/* Preview Arrow */}
              {selectedSource && selectedTarget && (
                <div className="flex items-center justify-center py-4">
                  <div className="flex items-center gap-4 p-4 bg-terminal-bg border border-terminal-border rounded-lg">
                    <Badge variant="outline" className="font-mono text-sm bg-terminal-green/20 text-terminal-green">
                      {selectedSourceName}
                    </Badge>
                    <ArrowRight className="h-5 w-5 text-terminal-green" />
                    <Badge variant="outline" className="font-mono text-sm bg-blue-500/20 text-blue-400">
                      {selectedTargetName}
                    </Badge>
                  </div>
                </div>
              )}

              {/* Name & Description */}
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-terminal-text">
                    <span className="text-terminal-green">$</span> Promotion Name
                  </Label>
                  <Input
                    id="name"
                    placeholder={`Promote to ${selectedTargetName || "target"}`}
                    className={cn("font-mono", errors.name && "border-terminal-coral")}
                    {...register("name")}
                  />
                  {errors.name && (
                    <p className="text-xs text-terminal-coral">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-terminal-text">
                    Description <span className="text-terminal-dim">(optional)</span>
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="What changes are included in this promotion?"
                    rows={2}
                    className="font-mono text-sm resize-none"
                    {...register("description")}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Review Changes */}
          {currentStep === "review" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-terminal-bg border border-terminal-border rounded-lg">
                <span className="text-sm font-mono text-terminal-dim">Comparing</span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-mono text-xs bg-terminal-green/20 text-terminal-green">
                    {selectedSourceName}
                  </Badge>
                  <ArrowRight className="h-4 w-4 text-terminal-green" />
                  <Badge variant="outline" className="font-mono text-xs bg-blue-500/20 text-blue-400">
                    {selectedTargetName}
                  </Badge>
                </div>
              </div>

              {isLoadingDiffs ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-terminal-green" />
                </div>
              ) : diffs.length === 0 ? (
                <div className="text-center py-8 border border-terminal-border border-dashed rounded-lg">
                  <Check className="h-8 w-8 mx-auto text-terminal-green mb-2" />
                  <p className="text-terminal-dim font-mono">
                    No configuration differences
                  </p>
                  <p className="text-sm text-terminal-dim mt-1">
                    These environments are in sync
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {diffs.slice(0, 10).map((diff, index) => (
                    <div
                      key={index}
                      className={cn(
                        "p-2 border rounded text-sm font-mono",
                        diff.type === "ADDED" && "bg-terminal-green/5 border-terminal-green/20",
                        diff.type === "MODIFIED" && "bg-blue-500/5 border-blue-500/20",
                        diff.type === "DELETED" && "bg-terminal-coral/5 border-terminal-coral/20"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <code className={cn(
                          "text-xs",
                          diff.type === "ADDED" && "text-terminal-green",
                          diff.type === "MODIFIED" && "text-blue-400",
                          diff.type === "DELETED" && "text-terminal-coral"
                        )}>
                          {diff.key}
                        </code>
                        <Badge variant="outline" className={cn(
                          "text-xs",
                          diff.type === "ADDED" && "bg-terminal-green/20 text-terminal-green border-0",
                          diff.type === "MODIFIED" && "bg-blue-500/20 text-blue-400 border-0",
                          diff.type === "DELETED" && "bg-terminal-coral/20 text-terminal-coral border-0"
                        )}>
                          {diff.type}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {diffs.length > 10 && (
                    <p className="text-xs text-terminal-dim font-mono text-center py-2">
                      ...and {diffs.length - 10} more changes
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Confirm */}
          {currentStep === "confirm" && (
            <div className="space-y-4">
              <div className="p-4 bg-terminal-green/10 border border-terminal-green/30 rounded-lg">
                <h3 className="font-mono text-sm text-terminal-green mb-2">Ready to create promotion</h3>
                <p className="text-xs text-terminal-dim">
                  This will create a promotion request that can be approved and executed.
                </p>
              </div>

              <div className="space-y-2 text-sm font-mono">
                <div className="flex justify-between">
                  <span className="text-terminal-dim">Name:</span>
                  <span className="text-terminal-text">{watch("name")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-terminal-dim">Source:</span>
                  <span className="text-terminal-green">{selectedSourceName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-terminal-dim">Target:</span>
                  <span className="text-blue-400">{selectedTargetName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-terminal-dim">Changes:</span>
                  <span className="text-terminal-text">{diffs.length} configuration(s)</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between border-t border-terminal-border pt-4">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === "environments"}
            className="border-terminal-border"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>

          {currentStep === "confirm" ? (
            <form onSubmit={handleSubmit(handleFormSubmit)}>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="font-mono bg-terminal-green/20 text-terminal-green hover:bg-terminal-green/30"
              >
                {isSubmitting ? (
                  <span className="animate-pulse">Creating...</span>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Create Promotion
                  </>
                )}
              </Button>
            </form>
          ) : (
            <Button
              onClick={handleNext}
              disabled={
                (currentStep === "environments" && !canProceedToReview) ||
                (currentStep === "review" && isLoadingDiffs)
              }
              className="font-mono"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
