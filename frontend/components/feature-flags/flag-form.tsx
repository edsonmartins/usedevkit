"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { X, Plus, Target, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
import type { FeatureFlag, CreateFeatureFlagDto, FlagType } from "@/lib/types/feature-flag";

const flagSchema = z.object({
  key: z.string().min(1, "Key is required").max(100, "Key must be less than 100 characters")
    .regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/, "Key must start with letter or underscore"),
  name: z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  description: z.string().max(500).optional(),
  type: z.enum(["BOOLEAN", "STRING", "NUMBER", "JSON"]),
  enabled: z.boolean(),
  defaultValue: z.string().min(1, "Default value is required"),
  rolloutPercentage: z.number().min(0).max(100).optional(),
});

type FlagForm = z.infer<typeof flagSchema>;

interface FlagVariant {
  id: string;
  name: string;
  value: string;
  description?: string;
  rolloutPercentage: number;
}

interface TargetingRule {
  id: string;
  type: "USER_ID" | "USER_ATTRIBUTE" | "IP_ADDRESS" | "CUSTOM";
  attribute?: string;
  operator: "EQUALS" | "CONTAINS" | "REGEX" | "IN" | "GT" | "LT";
  values: string[];
  variantId?: string;
  enabled: boolean;
}

interface FlagFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateFeatureFlagDto) => void;
  flag?: FeatureFlag;
  applicationId: string;
  isSubmitting?: boolean;
}

const TYPE_EXAMPLES: Record<FlagType, { value: string; description: string }> = {
  BOOLEAN: { value: "true", description: "true or false" },
  STRING: { value: "value", description: "Any text string" },
  NUMBER: { value: "42", description: "Numeric value" },
  JSON: { value: '{"key": "value"}', description: "Valid JSON object" },
};

export function FlagForm({
  open,
  onClose,
  onSubmit,
  flag,
  applicationId,
  isSubmitting,
}: FlagFormProps) {
  const [variants, setVariants] = useState<FlagVariant[]>([]);
  const [rules, setRules] = useState<TargetingRule[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FlagForm>({
    resolver: zodResolver(flagSchema),
    defaultValues: {
      key: flag?.key || "",
      name: flag?.name || "",
      description: flag?.description || "",
      type: flag?.type || "BOOLEAN",
      enabled: flag?.enabled ?? true,
      defaultValue: flag?.defaultValue || "",
      rolloutPercentage: flag?.rolloutPercentage ?? 100,
    },
  });

  const selectedType = watch("type") || "BOOLEAN";
  const enabled = watch("enabled") ?? true;
  const rolloutPercent = watch("rolloutPercentage") ?? 100;

  useEffect(() => {
    if (open) {
      reset({
        key: flag?.key || "",
        name: flag?.name || "",
        description: flag?.description || "",
        type: flag?.type || "BOOLEAN",
        enabled: flag?.enabled ?? true,
        defaultValue: flag?.defaultValue || "",
        rolloutPercentage: flag?.rolloutPercentage ?? 100,
      });
      setVariants(flag?.variants?.map((v, i) => ({ ...v, id: v.id || `temp-${i}` })) || []);
      setRules(flag?.targetingRules?.map((r, i) => ({ ...r, id: r.id || `temp-${i}` })) || []);
      setShowAdvanced(!!flag?.variants?.length || !!flag?.targetingRules?.length);
    }
  }, [open, flag, reset]);

  const addVariant = () => {
    setVariants([...variants, {
      id: `temp-${Date.now()}`,
      name: `Variant ${variants.length + 1}`,
      value: "",
      rolloutPercentage: 0,
    }]);
  };

  const updateVariant = (id: string, field: keyof FlagVariant, value: string | number) => {
    setVariants(variants.map((v) => v.id === id ? { ...v, [field]: value } : v));
  };

  const removeVariant = (id: string) => {
    setVariants(variants.filter((v) => v.id !== id));
  };

  const addRule = () => {
    setRules([...rules, {
      id: `temp-${Date.now()}`,
      type: "USER_ATTRIBUTE",
      attribute: "",
      operator: "EQUALS",
      values: [],
      enabled: true,
    }]);
  };

  const updateRule = (id: string, field: keyof TargetingRule, value: unknown) => {
    setRules(rules.map((r) => r.id === id ? { ...r, [field]: value } : r));
  };

  const removeRule = (id: string) => {
    setRules(rules.filter((r) => r.id !== id));
  };

  const onFormSubmit = (data: FlagForm) => {
    onSubmit({
      ...data,
      applicationId,
      variants: variants.map(({ id, ...v }) => v),
      targetingRules: rules.map(({ id, ...r }) => r),
    } as CreateFeatureFlagDto);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-terminal-surface border-terminal-border max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-mono text-xl text-terminal-text">
            {flag ? "Edit Feature Flag" : "New Feature Flag"}
          </DialogTitle>
          <DialogDescription className="text-terminal-dim">
            {flag ? "Update flag configuration" : "Create a new feature flag for your application"}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4 space-y-6">
          <form id="flag-form" onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
            {/* Key & Name */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="key" className="text-terminal-text">
                  <span className="text-terminal-green">$</span> Key
                </Label>
                <Input
                  id="key"
                  placeholder="feature.new_dashboard"
                  className={cn("font-mono text-sm", errors.key && "border-terminal-coral")}
                  {...register("key")}
                  disabled={!!flag}
                />
                {errors.key && (
                  <p className="text-xs text-terminal-coral">{errors.key.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="name" className="text-terminal-text">Name</Label>
                <Input
                  id="name"
                  placeholder="New Dashboard"
                  className={cn(errors.name && "border-terminal-coral")}
                  {...register("name")}
                />
                {errors.name && (
                  <p className="text-xs text-terminal-coral">{errors.name.message}</p>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-terminal-text">
                Description <span className="text-terminal-dim">(optional)</span>
              </Label>
              <Textarea
                id="description"
                placeholder="What does this flag control?"
                rows={2}
                className="font-mono text-sm resize-none"
                {...register("description")}
              />
            </div>

            {/* Type & Default Value */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type" className="text-terminal-text">Type</Label>
                <Select
                  value={selectedType}
                  onValueChange={(value) => setValue("type", value as FlagType)}
                  disabled={!!flag}
                >
                  <SelectTrigger className="font-mono border-terminal-border bg-terminal-surface">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-terminal-surface border-terminal-border">
                    <SelectItem value="BOOLEAN" className="font-mono">BOOLEAN</SelectItem>
                    <SelectItem value="STRING" className="font-mono">STRING</SelectItem>
                    <SelectItem value="NUMBER" className="font-mono">NUMBER</SelectItem>
                    <SelectItem value="JSON" className="font-mono">JSON</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-terminal-dim">{TYPE_EXAMPLES[selectedType].description}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="defaultValue" className="text-terminal-text">Default Value</Label>
                {selectedType === "BOOLEAN" ? (
                  <div className="flex items-center h-10 px-3 border border-terminal-border rounded-md bg-terminal-surface">
                    <Switch
                      checked={watch("defaultValue") === "true"}
                      onCheckedChange={(checked) => setValue("defaultValue", checked ? "true" : "false")}
                    />
                    <span className="ml-3 text-sm font-mono">
                      {watch("defaultValue") === "true" ? "true" : "false"}
                    </span>
                  </div>
                ) : (
                  <Input
                    id="defaultValue"
                    placeholder={TYPE_EXAMPLES[selectedType].value}
                    className={cn("font-mono text-sm", errors.defaultValue && "border-terminal-coral")}
                    {...register("defaultValue")}
                  />
                )}
              </div>
            </div>

            {/* Enabled & Rollout */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 border border-terminal-border rounded-lg bg-terminal-bg">
                <div>
                  <Label htmlFor="enabled" className="text-terminal-text">Enabled</Label>
                  <p className="text-xs text-terminal-dim">Flag is active</p>
                </div>
                <Switch
                  id="enabled"
                  checked={enabled}
                  onCheckedChange={(checked) => setValue("enabled", checked)}
                />
              </div>

              <div className="p-3 border border-terminal-border rounded-lg bg-terminal-bg">
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-terminal-text">Rollout</Label>
                  <span className="text-sm font-mono text-terminal-green">{rolloutPercent}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={rolloutPercent}
                  onChange={(e) => setValue("rolloutPercentage", parseInt(e.target.value))}
                  className="w-full h-2 bg-terminal-border rounded-lg appearance-none cursor-pointer accent-terminal-green"
                />
              </div>
            </div>

            {/* Advanced Options */}
            <div className="space-y-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full font-mono border-terminal-border"
              >
                {showAdvanced ? "Hide" : "Show"} Advanced Options
              </Button>

              {showAdvanced && (
                <div className="space-y-4 p-4 border border-terminal-border rounded-lg bg-terminal-bg">
                  {/* Variants */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-terminal-text flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Variants
                      </Label>
                      <Button
                        type="button"
                        size="sm"
                        onClick={addVariant}
                        className="font-mono text-xs"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add Variant
                      </Button>
                    </div>
                    {variants.length === 0 ? (
                      <p className="text-xs text-terminal-dim">No variants configured</p>
                    ) : (
                      <div className="space-y-2">
                        {variants.map((variant) => (
                          <div key={variant.id} className="p-3 bg-terminal-surface border border-terminal-border rounded">
                            <div className="flex items-center justify-between mb-2">
                              <Input
                                placeholder="Variant name"
                                value={variant.name}
                                onChange={(e) => updateVariant(variant.id, "name", e.target.value)}
                                className="font-mono text-sm flex-1 mr-2"
                              />
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                onClick={() => removeVariant(variant.id)}
                                className="h-6 w-6 p-0 text-terminal-coral"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <Input
                                placeholder="Value"
                                value={variant.value}
                                onChange={(e) => updateVariant(variant.id, "value", e.target.value)}
                                className="font-mono text-sm"
                              />
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-terminal-dim">Rollout:</span>
                                <Input
                                  type="number"
                                  min={0}
                                  max={100}
                                  value={variant.rolloutPercentage}
                                  onChange={(e) => updateVariant(variant.id, "rolloutPercentage", parseInt(e.target.value) || 0)}
                                  className="font-mono text-sm w-16"
                                />
                                <span className="text-xs">%</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Targeting Rules */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-terminal-text flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Targeting Rules
                      </Label>
                      <Button
                        type="button"
                        size="sm"
                        onClick={addRule}
                        className="font-mono text-xs"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add Rule
                      </Button>
                    </div>
                    {rules.length === 0 ? (
                      <p className="text-xs text-terminal-dim">No targeting rules configured</p>
                    ) : (
                      <div className="space-y-2">
                        {rules.map((rule) => (
                          <div key={rule.id} className="p-3 bg-terminal-surface border border-terminal-border rounded">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {rule.type}
                                </Badge>
                                {rule.attribute && (
                                  <span className="text-xs font-mono text-terminal-dim">
                                    {rule.attribute}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1">
                                <Switch
                                  checked={rule.enabled}
                                  onCheckedChange={(checked) => updateRule(rule.id, "enabled", checked)}
                                  className="scale-75"
                                />
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => removeRule(rule.id)}
                                  className="h-6 w-6 p-0 text-terminal-coral"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                              <Select
                                value={rule.operator}
                                onValueChange={(value) => updateRule(rule.id, "operator", value)}
                              >
                                <SelectTrigger className="font-mono text-xs h-8">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-terminal-surface border-terminal-border">
                                  <SelectItem value="EQUALS" className="font-mono text-xs">EQUALS</SelectItem>
                                  <SelectItem value="CONTAINS" className="font-mono text-xs">CONTAINS</SelectItem>
                                  <SelectItem value="IN" className="font-mono text-xs">IN</SelectItem>
                                  <SelectItem value="REGEX" className="font-mono text-xs">REGEX</SelectItem>
                                </SelectContent>
                              </Select>
                              <Input
                                placeholder="Values (comma separated)"
                                value={rule.values.join(",")}
                                onChange={(e) => updateRule(rule.id, "values", e.target.value.split(","))}
                                className="font-mono text-xs h-8"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </form>
        </div>

        <DialogFooter className="border-t border-terminal-border pt-4">
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
            form="flag-form"
            disabled={isSubmitting}
            className="font-mono"
          >
            {isSubmitting ? (
              <span className="animate-pulse">Saving...</span>
            ) : (
              <>
                <span className="text-terminal-bg">&gt;</span> {flag ? "Update" : "Create"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
