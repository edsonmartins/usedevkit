"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Eye, EyeOff, RefreshCw, Shield } from "lucide-react";
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
import type { SecretMetadata, CreateSecretDto, SecretType } from "@/lib/types/secret";

const secretSchema = z.object({
  key: z.string().min(1, "Key is required").max(255, "Key must be less than 255 characters")
    .regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/, "Key must start with letter or underscore and contain only letters, numbers, and underscores"),
  value: z.string().min(1, "Value is required"),
  type: z.enum(["API_KEY", "PASSWORD", "CERTIFICATE", "TOKEN", "DATABASE_URL", "OTHER"]),
  description: z.string().max(500, "Description must be less than 500 characters").optional(),
  rotationDays: z.number().min(1).max(365).optional(),
});

type SecretForm = z.infer<typeof secretSchema>;

const TYPE_DESCRIPTIONS: Record<SecretType, string> = {
  API_KEY: "External service API key or access token",
  PASSWORD: "User or service password",
  CERTIFICATE: "SSL/TLS certificate or key file",
  TOKEN: "Authentication token (JWT, OAuth, etc.)",
  DATABASE_URL: "Database connection string or URL",
  OTHER: "Any other type of secret",
};

const ROTATION_PRESETS = [30, 60, 90, 180, 365];

interface SecretFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateSecretDto | { value: string; description?: string; rotationDays?: number }) => void;
  secret?: SecretMetadata;
  applicationId: string;
  isSubmitting?: boolean;
}

export function SecretForm({
  open,
  onClose,
  onSubmit,
  secret,
  applicationId,
  isSubmitting,
}: SecretFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [generatePassword, setGeneratePassword] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<SecretForm>({
    resolver: zodResolver(secretSchema),
    defaultValues: {
      key: secret?.key || "",
      value: "",
      type: secret?.type || "OTHER",
      description: secret?.description || "",
      rotationDays: secret?.rotationDays || 90,
    },
  });

  const selectedType = watch("type") || "OTHER";
  const currentValue = watch("value") || "";
  const rotationDays = watch("rotationDays") || 90;

  useEffect(() => {
    if (open) {
      reset({
        key: secret?.key || "",
        value: "",
        type: secret?.type || "OTHER",
        description: secret?.description || "",
        rotationDays: secret?.rotationDays || 90,
      });
      setShowPassword(false);
    }
  }, [open, secret, reset]);

  const handleGeneratePassword = () => {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    const password = Array.from({ length: 32 }, () =>
      charset[Math.floor(Math.random() * charset.length)]
    ).join("");
    setValue("value", password);
    setShowPassword(true);
  };

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 12) strength++;
    if (password.length >= 20) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    return strength;
  };

  const strength = getPasswordStrength(currentValue);
  const strengthColors = ["text-terminal-coral", "text-yellow-400", "text-terminal-green", "text-terminal-green", "text-terminal-green"];
  const strengthLabels = ["Weak", "Fair", "Good", "Strong", "Excellent"];

  const onFormSubmit = (data: SecretForm) => {
    if (secret) {
      // Update mode - only send value and description
      onSubmit({
        value: data.value,
        description: data.description,
        rotationDays: data.rotationDays,
      });
    } else {
      // Create mode
      onSubmit({
        ...data,
        applicationId,
      } as CreateSecretDto);
    }
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] bg-terminal-surface border-terminal-border">
        <DialogHeader>
          <DialogTitle className="font-mono text-xl text-terminal-text flex items-center gap-2">
            <Shield className="h-5 w-5 text-terminal-green" />
            {secret ? "Update Secret" : "New Secret"}
          </DialogTitle>
          <DialogDescription className="text-terminal-dim">
            {secret
              ? `Update ${secret.key} secret value or configuration`
              : "Add a new encrypted secret to this application"}
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
              placeholder="DATABASE_PASSWORD"
              className={cn("font-mono", errors.key && "border-terminal-coral")}
              {...register("key")}
              disabled={!!secret}
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
              onValueChange={(value) => setValue("type", value as SecretType)}
              disabled={!!secret}
            >
              <SelectTrigger className="font-mono border-terminal-border bg-terminal-surface">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-terminal-surface border-terminal-border">
                <SelectItem value="API_KEY" className="font-mono">API_KEY</SelectItem>
                <SelectItem value="PASSWORD" className="font-mono">PASSWORD</SelectItem>
                <SelectItem value="CERTIFICATE" className="font-mono">CERTIFICATE</SelectItem>
                <SelectItem value="TOKEN" className="font-mono">TOKEN</SelectItem>
                <SelectItem value="DATABASE_URL" className="font-mono">DATABASE_URL</SelectItem>
                <SelectItem value="OTHER" className="font-mono">OTHER</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-terminal-dim">{TYPE_DESCRIPTIONS[selectedType]}</p>
          </div>

          {/* Value */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="value" className="text-terminal-text">
                Value
              </Label>
              {selectedType === "PASSWORD" && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleGeneratePassword}
                  className="text-xs text-terminal-green hover:text-terminal-green/80 h-6"
                >
                  <RefreshCw className="mr-1 h-3 w-3" />
                  Generate
                </Button>
              )}
            </div>
            <div className="relative">
              <Input
                id="value"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••••••"
                className={cn(
                  "font-mono pr-20",
                  errors.value && "border-terminal-coral"
                )}
                {...register("value")}
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {selectedType === "PASSWORD" && currentValue && (
                  <Badge
                    variant="outline"
                    className={cn("text-xs", strengthColors[strength - 1] || "text-terminal-dim")}
                  >
                    {strengthLabels[strength - 1] || "None"}
                  </Badge>
                )}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-terminal-dim hover:text-terminal-text p-1"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            {errors.value && (
              <p className="text-xs text-terminal-coral">{errors.value.message}</p>
            )}
          </div>

          {/* Rotation Days */}
          <div className="space-y-2">
            <Label htmlFor="rotationDays" className="text-terminal-text">
              Auto-Rotation Period
            </Label>
            <div className="flex items-center gap-2">
              <div className="flex-1 flex gap-1">
                {ROTATION_PRESETS.map((days) => (
                  <button
                    key={days}
                    type="button"
                    onClick={() => setValue("rotationDays", days)}
                    className={cn(
                      "flex-1 py-1 px-2 text-xs font-mono rounded border transition-colors",
                      rotationDays === days
                        ? "bg-terminal-green/20 text-terminal-green border-terminal-green/50"
                        : "bg-terminal-bg border-terminal-border text-terminal-dim hover:border-terminal-green/50"
                    )}
                  >
                    {days}d
                  </button>
                ))}
              </div>
              <Input
                type="number"
                min={1}
                max={365}
                className="w-20 font-mono text-center"
                {...register("rotationDays", { valueAsNumber: true })}
              />
            </div>
            <p className="text-xs text-terminal-dim">
              Secret will be flagged for rotation every {rotationDays} days
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-terminal-text">
              Description <span className="text-terminal-dim">(optional)</span>
            </Label>
            <Textarea
              id="description"
              placeholder="What is this secret used for?"
              rows={2}
              className="font-mono text-sm resize-none"
              {...register("description")}
            />
            {errors.description && (
              <p className="text-xs text-terminal-coral">{errors.description.message}</p>
            )}
          </div>

          {/* Warning */}
          <div className="p-3 bg-terminal-coral/10 border border-terminal-coral/30 rounded-lg">
            <p className="text-xs text-terminal-coral font-mono">
              <span className="font-bold">Warning:</span> Secrets are encrypted at rest.
              Once created, the value cannot be retrieved in plain text.
            </p>
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
              disabled={isSubmitting || !currentValue}
              className="font-mono"
            >
              {isSubmitting ? (
                <span className="animate-pulse">Saving...</span>
              ) : (
                <>
                  <span className="text-terminal-bg">&gt;</span>{" "}
                  {secret ? "Update" : "Create"}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
