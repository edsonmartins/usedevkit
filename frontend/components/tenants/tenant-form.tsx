"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Building2, Check } from "lucide-react";
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
  DialogFooter,
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
import type { Tenant, CreateTenantDto, TenantPlan } from "@/lib/types/tenant";
import { PLAN_CONFIG } from "@/lib/types/tenant";

const tenantSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  slug: z.string().min(2, "Slug must be at least 2 characters").max(50).regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens").optional(),
  plan: z.enum(["FREE", "STARTER", "PRO", "ENTERPRISE"]).optional(),
  description: z.string().max(500).optional(),
  billingEmail: z.string().email("Must be a valid email").optional().or(z.literal("")),
  technicalEmail: z.string().email("Must be a valid email").optional().or(z.literal("")),
});

type TenantForm = z.infer<typeof tenantSchema>;

interface TenantFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTenantDto) => void;
  tenant?: Tenant;
  isSubmitting?: boolean;
}

export function TenantForm({
  open,
  onClose,
  onSubmit,
  tenant,
  isSubmitting,
}: TenantFormProps) {
  const [selectedPlan, setSelectedPlan] = useState<TenantPlan>(tenant?.plan || "FREE");

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm<TenantForm>({
    resolver: zodResolver(tenantSchema),
    defaultValues: {
      name: tenant?.name || "",
      slug: tenant?.slug || "",
      plan: tenant?.plan || "FREE",
      description: tenant?.description || "",
      billingEmail: tenant?.billingEmail || "",
      technicalEmail: tenant?.technicalEmail || "",
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        name: tenant?.name || "",
        slug: tenant?.slug || "",
        plan: tenant?.plan || "FREE",
        description: tenant?.description || "",
        billingEmail: tenant?.billingEmail || "",
        technicalEmail: tenant?.technicalEmail || "",
      });
      setSelectedPlan(tenant?.plan || "FREE");
    }
  }, [open, tenant, reset]);

  const onFormSubmit = (data: TenantForm) => {
    onSubmit({
      ...data,
      slug: data.slug || undefined,
      plan: data.plan || undefined,
      billingEmail: data.billingEmail || undefined,
      technicalEmail: data.technicalEmail || undefined,
    });
  };

  // Auto-generate slug from name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    if (!tenant) { // Only auto-generate for new tenants
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
      setValue("slug", slug);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-terminal-surface border-terminal-border">
        <DialogHeader>
          <DialogTitle className="font-mono text-xl text-terminal-text flex items-center gap-2">
            <Building2 className="h-5 w-5 text-terminal-green" />
            {tenant ? "Edit Tenant" : "New Tenant"}
          </DialogTitle>
          <DialogDescription className="text-terminal-dim">
            {tenant ? "Update tenant information" : "Create a new tenant"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-terminal-text">
              <span className="text-terminal-green">$</span> Tenant Name
            </Label>
            <Input
              id="name"
              placeholder="Acme Corp"
              className={cn("font-mono", errors.name && "border-terminal-coral")}
              {...register("name")}
              onChange={(e) => {
                register("name").onChange(e);
                handleNameChange(e);
              }}
            />
            {errors.name && (
              <p className="text-xs text-terminal-coral">{errors.name.message}</p>
            )}
          </div>

          {/* Slug */}
          <div className="space-y-2">
            <Label htmlFor="slug" className="text-terminal-text">
              <span className="text-terminal-green">$</span> Slug
            </Label>
            <div className="flex items-center gap-2">
              <span className="text-terminal-dim font-mono text-sm">@</span>
              <Input
                id="slug"
                placeholder="acme-corp"
                className={cn("font-mono text-sm", errors.slug && "border-terminal-coral")}
                {...register("slug")}
              />
            </div>
            {errors.slug && (
              <p className="text-xs text-terminal-coral">{errors.slug.message}</p>
            )}
            <p className="text-xs text-terminal-dim">
              Used in URLs: https://devkit.app/@{watch("slug") || "slug"}
            </p>
          </div>

          {/* Plan Selection */}
          <div className="space-y-2">
            <Label className="text-terminal-text">Plan</Label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(PLAN_CONFIG) as TenantPlan[]).map((plan) => {
                const config = PLAN_CONFIG[plan];
                const isSelected = selectedPlan === plan;

                return (
                  <div
                    key={plan}
                    onClick={() => {
                      setSelectedPlan(plan);
                      setValue("plan", plan);
                    }}
                    className={cn(
                      "p-3 border rounded-lg cursor-pointer transition-all",
                      "hover:border-terminal-green/50",
                      isSelected
                        ? "border-terminal-green bg-terminal-green/10"
                        : "border-terminal-border bg-terminal-bg"
                    )}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={cn(
                        "font-mono text-sm font-bold",
                        isSelected ? "text-terminal-green" : "text-terminal-text"
                      )}>
                        {config.name}
                      </span>
                      {isSelected && (
                        <Check className="h-4 w-4 text-terminal-green" />
                      )}
                    </div>
                    <div className={cn(
                      "text-xs font-mono",
                      isSelected ? "text-terminal-green" : "text-terminal-dim"
                    )}>
                      {config.price}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Plan Features Preview */}
          <div className="p-3 bg-terminal-bg border border-terminal-border rounded-lg">
            <div className="text-xs text-terminal-dim font-mono mb-2">
              Plan Features ({PLAN_CONFIG[selectedPlan].name})
            </div>
            <div className="grid grid-cols-2 gap-1">
              {PLAN_CONFIG[selectedPlan].features.map((feature) => (
                <div key={feature} className="flex items-center gap-2 text-xs">
                  <Check className="h-3 w-3 text-terminal-green shrink-0" />
                  <span className="text-terminal-text">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-terminal-text">
              Description
            </Label>
            <Textarea
              id="description"
              placeholder="What is this tenant for?"
              rows={2}
              className="font-mono text-sm resize-none"
              {...register("description")}
            />
          </div>

          {/* Emails */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="billingEmail" className="text-terminal-text">
                Billing Email
              </Label>
              <Input
                id="billingEmail"
                type="email"
                placeholder="billing@example.com"
                className={cn("font-mono text-sm", errors.billingEmail && "border-terminal-coral")}
                {...register("billingEmail")}
              />
              {errors.billingEmail && (
                <p className="text-xs text-terminal-coral">{errors.billingEmail.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="technicalEmail" className="text-terminal-text">
                Technical Email
              </Label>
              <Input
                id="technicalEmail"
                type="email"
                placeholder="tech@example.com"
                className={cn("font-mono text-sm", errors.technicalEmail && "border-terminal-coral")}
                {...register("technicalEmail")}
              />
              {errors.technicalEmail && (
                <p className="text-xs text-terminal-coral">{errors.technicalEmail.message}</p>
              )}
            </div>
          </div>

          <DialogFooter className="flex justify-end gap-2 pt-4 border-t border-terminal-border">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-terminal-border"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="font-mono"
            >
              {isSubmitting ? (
                <span className="animate-pulse">Saving...</span>
              ) : (
                <>
                  <span className="text-terminal-bg">&gt;</span>{" "}
                  {tenant ? "Update" : "Create"}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Upgrade Dialog Component
interface UpgradeDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { plan: TenantPlan; billingEmail?: string }) => void;
  tenant: Tenant;
  isSubmitting?: boolean;
}

export function TenantUpgradeDialog({
  open,
  onClose,
  onSubmit,
  tenant,
  isSubmitting,
}: UpgradeDialogProps) {
  const [selectedPlan, setSelectedPlan] = useState<TenantPlan>(tenant?.plan || "FREE");
  const [billingEmail, setBillingEmail] = useState(tenant?.billingEmail || "");

  useEffect(() => {
    if (open && tenant) {
      setSelectedPlan(tenant.plan || "FREE");
      setBillingEmail(tenant.billingEmail || "");
    }
  }, [open, tenant]);

  // Don't render if tenant is not provided
  if (!tenant) {
    return null;
  }

  const handleSubmit = () => {
    onSubmit({
      plan: selectedPlan,
      billingEmail: billingEmail || undefined,
    });
  };

  const availablePlans = (Object.keys(PLAN_CONFIG) as TenantPlan[]).filter(
    (plan) => plan !== "FREE"
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-terminal-surface border-terminal-border">
        <DialogHeader>
          <DialogTitle className="font-mono text-xl text-terminal-text flex items-center gap-2">
            <Building2 className="h-5 w-5 text-terminal-green" />
            Upgrade Tenant
          </DialogTitle>
          <DialogDescription className="text-terminal-dim">
            Upgrade {tenant.name} to a higher plan
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Current Plan */}
          <div className="p-3 bg-terminal-bg border border-terminal-border rounded-lg">
            <div className="text-xs text-terminal-dim font-mono">Current Plan</div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-lg font-bold text-terminal-text">
                {PLAN_CONFIG[tenant.plan].name}
              </span>
              <span className="text-terminal-green font-mono">
                {PLAN_CONFIG[tenant.plan].price}
              </span>
            </div>
          </div>

          {/* Plan Selection */}
          <div className="space-y-2">
            <Label className="text-terminal-text">Select New Plan</Label>
            <div className="space-y-2">
              {availablePlans.map((plan) => {
                const config = PLAN_CONFIG[plan];
                const isSelected = selectedPlan === plan;
                const isDowngrade = plan === "STARTER" && tenant.plan === "PRO";

                return (
                  <div
                    key={plan}
                    onClick={() => !isDowngrade && setSelectedPlan(plan)}
                    className={cn(
                      "p-3 border rounded-lg cursor-pointer transition-all",
                      isDowngrade ? "opacity-50 cursor-not-allowed" : "hover:border-terminal-green/50",
                      isSelected
                        ? "border-terminal-green bg-terminal-green/10"
                        : "border-terminal-border bg-terminal-bg"
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={cn(
                        "font-mono text-sm font-bold",
                        isSelected ? "text-terminal-green" : "text-terminal-text"
                      )}>
                        {config.name}
                      </span>
                      {isSelected && (
                        <Check className="h-4 w-4 text-terminal-green" />
                      )}
                    </div>
                    <div className={cn(
                      "font-mono text-xs mb-2",
                      isSelected ? "text-terminal-green" : "text-terminal-dim"
                    )}>
                      {config.price}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {config.features.slice(0, 3).map((feature) => (
                        <Badge
                          key={feature}
                          variant="outline"
                          className="text-[10px] font-mono bg-terminal-bg border-terminal-border"
                        >
                          {feature}
                        </Badge>
                      ))}
                      {config.features.length > 3 && (
                        <Badge variant="outline" className="text-[10px] font-mono bg-terminal-bg border-terminal-border">
                          +{config.features.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Billing Email */}
          <div className="space-y-2">
            <Label htmlFor="upgradeBillingEmail" className="text-terminal-text">
              Billing Email
            </Label>
            <Input
              id="upgradeBillingEmail"
              type="email"
              placeholder="billing@example.com"
              value={billingEmail}
              onChange={(e) => setBillingEmail(e.target.value)}
              className="font-mono text-sm"
            />
          </div>
        </div>

        <DialogFooter className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="border-terminal-border"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || selectedPlan === tenant.plan}
            className="font-mono"
          >
            {isSubmitting ? (
              <span className="animate-pulse">Processing...</span>
            ) : (
              <>
                <span className="text-terminal-bg">&gt;</span> Upgrade
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
