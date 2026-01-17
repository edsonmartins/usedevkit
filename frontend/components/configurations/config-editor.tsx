"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { X, Eye, EyeOff } from "lucide-react";
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
import type { Configuration, CreateConfigurationDto, UpdateConfigurationDto, ConfigType } from "@/lib/types/configuration";

const configurationSchema = z.object({
  key: z.string().min(1, "Key is required").max(255, "Key must be less than 255 characters")
    .regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/, "Key must start with letter or underscore and contain only letters, numbers, and underscores"),
  value: z.string().min(1, "Value is required"),
  type: z.enum(["STRING", "INTEGER", "BOOLEAN", "JSON", "DOUBLE"]),
  sensitive: z.boolean().optional(),
  description: z.string().max(500, "Description must be less than 500 characters").optional(),
});

type ConfigurationForm = z.infer<typeof configurationSchema>;

interface ConfigEditorProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateConfigurationDto | UpdateConfigurationDto) => void;
  configuration?: Configuration;
  applicationId: string;
  environmentId: string;
  isSubmitting?: boolean;
}

const TYPE_EXAMPLES: Record<ConfigType, { value: string; description: string }> = {
  STRING: { value: "my-value", description: "Plain text string" },
  INTEGER: { value: "42", description: "Whole number" },
  BOOLEAN: { value: "true", description: "true or false" },
  JSON: { value: '{"key": "value"}', description: "Valid JSON object or array" },
  DOUBLE: { value: "3.14", description: "Decimal number" },
};

export function ConfigEditor({
  open,
  onClose,
  onSubmit,
  configuration,
  applicationId,
  environmentId,
  isSubmitting,
}: ConfigEditorProps) {
  const [previewValue, setPreviewValue] = useState("");
  const [showSecret, setShowSecret] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ConfigurationForm>({
    resolver: zodResolver(configurationSchema),
    defaultValues: {
      key: configuration?.key || "",
      value: configuration?.value || "",
      type: configuration?.type || "STRING",
      sensitive: configuration?.sensitive || false,
      description: configuration?.description || "",
    },
  });

  const selectedType = watch("type") || "STRING";
  const currentValue = watch("value") || "";
  const isSensitive = watch("sensitive") || false;

  useEffect(() => {
    if (open) {
      reset({
        key: configuration?.key || "",
        value: configuration?.value || "",
        type: configuration?.type || "STRING",
        sensitive: configuration?.sensitive || false,
        description: configuration?.description || "",
      });
      setShowSecret(false);
    }
  }, [open, configuration, reset]);

  useEffect(() => {
    // Validate JSON type
    if (selectedType === "JSON" && currentValue) {
      try {
        JSON.parse(currentValue);
        setPreviewValue("Valid JSON");
      } catch {
        setPreviewValue("Invalid JSON");
      }
    } else if (selectedType === "INTEGER" && currentValue) {
      setPreviewValue(/^\d+$/.test(currentValue) ? "Valid integer" : "Invalid integer");
    } else if (selectedType === "DOUBLE" && currentValue) {
      setPreviewValue(/^\d+\.\d+$|^\d+$/.test(currentValue) ? "Valid number" : "Invalid number");
    } else if (selectedType === "BOOLEAN" && currentValue) {
      setPreviewValue(["true", "false"].includes(currentValue.toLowerCase()) ? "Valid boolean" : "Invalid boolean");
    } else {
      setPreviewValue("");
    }
  }, [currentValue, selectedType]);

  const onFormSubmit = (data: ConfigurationForm) => {
    if (configuration) {
      // Update mode
      onSubmit({
        value: data.value,
        type: data.type,
        sensitive: data.sensitive,
        description: data.description,
      } as UpdateConfigurationDto);
    } else {
      // Create mode
      onSubmit({
        ...data,
        applicationId,
        environmentId,
      } as CreateConfigurationDto);
    }
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] bg-terminal-surface border-terminal-border">
        <DialogHeader>
          <DialogTitle className="font-mono text-xl text-terminal-text">
            {configuration ? "Edit Configuration" : "New Configuration"}
          </DialogTitle>
          <DialogDescription className="text-terminal-dim">
            {configuration
              ? `Update ${configuration.key} configuration`
              : "Add a new configuration to this environment"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          {/* Key */}
          <div className="space-y-2">
            <Label htmlFor="key" className="text-terminal-text">
              <span className="text-terminal-green">$</span> Key
            </Label>
            <Input
              id="key"
              placeholder="API_ENDPOINT"
              className={cn("font-mono", errors.key && "border-terminal-coral")}
              {...register("key")}
              disabled={!!configuration}
            />
            {errors.key && (
              <p className="text-xs text-terminal-coral">{errors.key.message}</p>
            )}
          </div>

          {/* Type Selector */}
          <div className="space-y-2">
            <Label htmlFor="type" className="text-terminal-text">
              Type
            </Label>
            <Select
              value={selectedType}
              onValueChange={(value) => setValue("type", value as ConfigType)}
              disabled={!!configuration}
            >
              <SelectTrigger className="font-mono border-terminal-border bg-terminal-surface">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-terminal-surface border-terminal-border">
                <SelectItem value="STRING" className="font-mono">STRING</SelectItem>
                <SelectItem value="INTEGER" className="font-mono">INTEGER</SelectItem>
                <SelectItem value="DOUBLE" className="font-mono">DOUBLE</SelectItem>
                <SelectItem value="BOOLEAN" className="font-mono">BOOLEAN</SelectItem>
                <SelectItem value="JSON" className="font-mono">JSON</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-terminal-dim">{TYPE_EXAMPLES[selectedType].description}</p>
          </div>

          {/* Value */}
          <div className="space-y-2">
            <Label htmlFor="value" className="text-terminal-text">
              Value
            </Label>
            {selectedType === "JSON" ? (
              <Textarea
                id="value"
                placeholder={TYPE_EXAMPLES[selectedType].value}
                rows={4}
                className={cn(
                  "font-mono text-sm resize-none",
                  errors.value && "border-terminal-coral",
                  previewValue === "Invalid JSON" && "border-terminal-coral"
                )}
                {...register("value")}
              />
            ) : (
              <div className="relative">
                <Input
                  id="value"
                  type={isSensitive && !showSecret ? "password" : "text"}
                  placeholder={TYPE_EXAMPLES[selectedType].value}
                  className={cn(
                    "font-mono pr-10",
                    errors.value && "border-terminal-coral"
                  )}
                  {...register("value")}
                />
                {isSensitive && (
                  <button
                    type="button"
                    onClick={() => setShowSecret(!showSecret)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-terminal-dim hover:text-terminal-text"
                  >
                    {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                )}
              </div>
            )}
            {previewValue && (
              <p className={cn(
                "text-xs",
                previewValue.startsWith("Invalid") ? "text-terminal-coral" : "text-terminal-green"
              )}>
                {previewValue}
              </p>
            )}
            {errors.value && (
              <p className="text-xs text-terminal-coral">{errors.value.message}</p>
            )}
          </div>

          {/* Sensitive Toggle */}
          <div className="flex items-center justify-between p-3 border border-terminal-border rounded-lg">
            <div>
              <Label htmlFor="sensitive" className="text-terminal-text">
                Sensitive / Secret
              </Label>
              <p className="text-xs text-terminal-dim">
                Mask value in UI and encrypt in storage
              </p>
            </div>
            <Switch
              id="sensitive"
              checked={isSensitive}
              onCheckedChange={(checked) => setValue("sensitive", checked)}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-terminal-text">
              Description <span className="text-terminal-dim">(optional)</span>
            </Label>
            <Textarea
              id="description"
              placeholder="Brief description of this configuration..."
              rows={2}
              className="font-mono text-sm resize-none"
              {...register("description")}
            />
            {errors.description && (
              <p className="text-xs text-terminal-coral">{errors.description.message}</p>
            )}
          </div>

          {/* Environment Info */}
          <div className="p-3 bg-terminal-bg border border-terminal-border rounded-lg">
            <div className="text-xs text-terminal-dim font-mono">
              <span className="text-terminal-green">env:</span> {environmentId}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-terminal-border text-terminal-text hover:bg-terminal-border/50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || previewValue.startsWith("Invalid")}
              className="font-mono"
            >
              {isSubmitting ? (
                <span className="animate-pulse">Saving...</span>
              ) : (
                <>
                  <span className="text-terminal-bg">&gt;</span>{" "}
                  {configuration ? "Update" : "Create"}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
