"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, X, Server, Zap } from "lucide-react";
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
import type { Service, CreateServiceDto, ServiceType, HealthCheckType } from "@/lib/types/service";

const serviceSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  type: z.enum(["API", "WORKER", "DATABASE", "CACHE", "QUEUE", "OTHER"]),
  description: z.string().max(500).optional(),
  url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  healthCheckUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  healthCheckType: z.enum(["HTTP", "TCP", "COMMAND"]).optional(),
  healthCheckInterval: z.number().min(10).max(3600).optional(),
  version: z.string().max(50).optional(),
  environment: z.string().max(50).optional(),
  team: z.string().max(100).optional(),
});

type ServiceForm = z.infer<typeof serviceSchema>;

const ENVIRONMENTS = ["development", "staging", "production", "testing"];
const TEAMS = ["platform", "backend", "frontend", "data", "devops", "security"];

interface ServiceFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateServiceDto) => void;
  service?: Service;
  isSubmitting?: boolean;
  allServices?: Service[];
}

export function ServiceForm({
  open,
  onClose,
  onSubmit,
  service,
  isSubmitting,
  allServices = [],
}: ServiceFormProps) {
  const [tags, setTags] = useState<string[]>(service?.tags || []);
  const [tagInput, setTagInput] = useState("");
  const [selectedDependencies, setSelectedDependencies] = useState<string[]>(
    service?.dependencies || []
  );
  const [metadata, setMetadata] = useState<Record<string, string>>(service?.metadata || {});

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm<ServiceForm>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: service?.name || "",
      type: service?.type || "API",
      description: service?.description || "",
      url: service?.url || "",
      healthCheckUrl: service?.healthCheckUrl || "",
      healthCheckType: service?.healthCheckType || "HTTP",
      healthCheckInterval: service?.healthCheckInterval || 60,
      version: service?.version || "",
      environment: service?.environment || "",
      team: service?.team || "",
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        name: service?.name || "",
        type: service?.type || "API",
        description: service?.description || "",
        url: service?.url || "",
        healthCheckUrl: service?.healthCheckUrl || "",
        healthCheckType: service?.healthCheckType || "HTTP",
        healthCheckInterval: service?.healthCheckInterval || 60,
        version: service?.version || "",
        environment: service?.environment || "",
        team: service?.team || "",
      });
      setTags(service?.tags || []);
      setSelectedDependencies(service?.dependencies || []);
      setMetadata(service?.metadata || {});
    }
  }, [open, service, reset]);

  const addTag = () => {
    if (tagInput && !tags.includes(tagInput)) {
      setTags([...tags, tagInput]);
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const toggleDependency = (serviceId: string) => {
    if (selectedDependencies.includes(serviceId)) {
      setSelectedDependencies(selectedDependencies.filter((id) => id !== serviceId));
    } else {
      setSelectedDependencies([...selectedDependencies, serviceId]);
    }
  };

  const addMetadata = () => {
    const key = prompt("Enter metadata key:");
    if (key && !metadata[key]) {
      const value = prompt("Enter metadata value:");
      if (value !== null) {
        setMetadata({ ...metadata, [key]: value });
      }
    }
  };

  const removeMetadata = (key: string) => {
    const newMetadata = { ...metadata };
    delete newMetadata[key];
    setMetadata(newMetadata);
  };

  const onFormSubmit = (data: ServiceForm) => {
    onSubmit({
      ...data,
      url: data.url || undefined,
      healthCheckUrl: data.healthCheckUrl || undefined,
      tags: tags.length > 0 ? tags : undefined,
      dependencies: selectedDependencies.length > 0 ? selectedDependencies : undefined,
      metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
    });
  };

  const availableServices = allServices.filter((s) => s.id !== service?.id);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-terminal-surface border-terminal-border max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-mono text-xl text-terminal-text flex items-center gap-2">
            <Server className="h-5 w-5 text-terminal-green" />
            {service ? "Edit Service" : "Register Service"}
          </DialogTitle>
          <DialogDescription className="text-terminal-dim">
            Register a new service in the service catalog
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-terminal-text">
              <span className="text-terminal-green">$</span> Service Name
            </Label>
            <Input
              id="name"
              placeholder="user-api"
              className={cn("font-mono", errors.name && "border-terminal-coral")}
              {...register("name")}
            />
            {errors.name && (
              <p className="text-xs text-terminal-coral">{errors.name.message}</p>
            )}
          </div>

          {/* Type & Environment */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type" className="text-terminal-text">
                <span className="text-terminal-green">$</span> Type
              </Label>
              <Select
                value={watch("type")}
                onValueChange={(v) => setValue("type", v as ServiceType)}
              >
                <SelectTrigger className="bg-terminal-surface border-terminal-border font-mono">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-terminal-surface border-terminal-border">
                  <SelectItem value="API">API</SelectItem>
                  <SelectItem value="WORKER">Worker</SelectItem>
                  <SelectItem value="DATABASE">Database</SelectItem>
                  <SelectItem value="CACHE">Cache</SelectItem>
                  <SelectItem value="QUEUE">Queue</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="environment" className="text-terminal-text">
                Environment
              </Label>
              <Select
                value={watch("environment")}
                onValueChange={(v) => setValue("environment", v)}
              >
                <SelectTrigger className="bg-terminal-surface border-terminal-border font-mono">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent className="bg-terminal-surface border-terminal-border">
                  {ENVIRONMENTS.map((env) => (
                    <SelectItem key={env} value={env}>
                      {env}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* URL */}
          <div className="space-y-2">
            <Label htmlFor="url" className="text-terminal-text">
              <span className="text-terminal-green">$</span> Service URL
            </Label>
            <Input
              id="url"
              placeholder="https://api.example.com"
              className={cn("font-mono text-sm", errors.url && "border-terminal-coral")}
              {...register("url")}
            />
            {errors.url && (
              <p className="text-xs text-terminal-coral">{errors.url.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-terminal-text">
              Description
            </Label>
            <Textarea
              id="description"
              placeholder="What does this service do?"
              rows={2}
              className="font-mono text-sm resize-none"
              {...register("description")}
            />
          </div>

          {/* Health Check Configuration */}
          <div className="space-y-3 p-3 bg-terminal-bg border border-terminal-border rounded-lg">
            <div className="flex items-center gap-2 text-sm font-mono text-terminal-text">
              <Zap className="h-4 w-4 text-terminal-green" />
              Health Check Configuration
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="healthCheckUrl" className="text-terminal-dim text-xs">
                  Health Check URL
                </Label>
                <Input
                  id="healthCheckUrl"
                  placeholder="https://api.example.com/health"
                  className="font-mono text-sm"
                  {...register("healthCheckUrl")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="healthCheckInterval" className="text-terminal-dim text-xs">
                  Interval (seconds)
                </Label>
                <Input
                  id="healthCheckInterval"
                  type="number"
                  min="10"
                  max="3600"
                  className="font-mono text-sm"
                  {...register("healthCheckInterval", { valueAsNumber: true })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="healthCheckType" className="text-terminal-dim text-xs">
                Check Type
              </Label>
              <Select
                value={watch("healthCheckType")}
                onValueChange={(v) => setValue("healthCheckType", v as HealthCheckType)}
              >
                <SelectTrigger className="bg-terminal-surface border-terminal-border font-mono text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-terminal-surface border-terminal-border">
                  <SelectItem value="HTTP">HTTP</SelectItem>
                  <SelectItem value="TCP">TCP</SelectItem>
                  <SelectItem value="COMMAND">Command</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Version & Team */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="version" className="text-terminal-text">
                Version
              </Label>
              <Input
                id="version"
                placeholder="1.0.0"
                className="font-mono text-sm"
                {...register("version")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="team" className="text-terminal-text">
                Team
              </Label>
              <Select
                value={watch("team")}
                onValueChange={(v) => setValue("team", v)}
              >
                <SelectTrigger className="bg-terminal-surface border-terminal-border font-mono text-sm">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent className="bg-terminal-surface border-terminal-border">
                  {TEAMS.map((team) => (
                    <SelectItem key={team} value={team}>
                      {team}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-terminal-text">Tags</Label>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={addTag}
                className="h-7 px-2 text-xs font-mono border-terminal-border"
              >
                <Plus className="h-3 w-3 mr-1" />
                Add Tag
              </Button>
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Enter tag..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                className="font-mono text-sm"
              />
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="font-mono text-xs bg-terminal-bg border-terminal-border"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:text-terminal-coral"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Dependencies */}
          {availableServices.length > 0 && (
            <div className="space-y-2">
              <Label className="text-terminal-text">Dependencies</Label>
              <div className="space-y-1 p-3 bg-terminal-bg border border-terminal-border rounded-lg max-h-[150px] overflow-y-auto">
                {availableServices.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => toggleDependency(s.id)}
                    className={cn(
                      "flex items-center justify-between p-2 rounded cursor-pointer transition-colors",
                      "hover:bg-terminal-border/50",
                      selectedDependencies.includes(s.id) && "bg-terminal-green/10"
                    )}
                  >
                    <span className="font-mono text-sm">{s.name}</span>
                    <span className="text-xs text-terminal-dim">{s.type}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-terminal-text">Metadata</Label>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={addMetadata}
                className="h-7 px-2 text-xs font-mono border-terminal-border"
              >
                <Plus className="h-3 w-3 mr-1" />
                Add
              </Button>
            </div>
            {Object.keys(metadata).length === 0 ? (
              <p className="text-xs text-terminal-dim p-3 bg-terminal-bg border border-dashed rounded text-center">
                No custom metadata
              </p>
            ) : (
              <div className="space-y-1">
                {Object.entries(metadata).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between p-2 bg-terminal-bg border border-terminal-border rounded"
                  >
                    <div className="font-mono text-sm">
                      <span className="text-terminal-green">{key}:</span> {value}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeMetadata(key)}
                      className="text-terminal-coral hover:text-terminal-coral/80"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t border-terminal-border">
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
                  {service ? "Update" : "Register"}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
