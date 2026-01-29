"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, X, Globe, Zap, Trash2, Check } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import type { Webhook, CreateWebhookDto, WebhookEvent, WebhookHeaders } from "@/lib/types/webhook";

const webhookSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  url: z.string().url("Must be a valid URL"),
  description: z.string().max(500).optional(),
});

type WebhookForm = z.infer<typeof webhookSchema>;

const ALL_EVENTS: WebhookEvent[] = [
  "CONFIGURATION_CREATED",
  "CONFIGURATION_UPDATED",
  "CONFIGURATION_DELETED",
  "SECRET_ROTATED",
  "SECRET_ROTATION_FAILED",
  "SECRET_EXPIRED",
  "PROMOTION_COMPLETED",
  "PROMOTION_FAILED",
];

const EVENT_DESCRIPTIONS: Record<WebhookEvent, string> = {
  CONFIGURATION_CREATED: "When a new configuration is created",
  CONFIGURATION_UPDATED: "When a configuration is updated",
  CONFIGURATION_DELETED: "When a configuration is deleted",
  SECRET_ROTATED: "When a secret is rotated",
  SECRET_ROTATION_FAILED: "When a secret rotation fails",
  SECRET_EXPIRED: "When a secret expires",
  PROMOTION_COMPLETED: "When a promotion completes successfully",
  PROMOTION_FAILED: "When a promotion fails",
};

interface WebhookFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateWebhookDto) => void;
  webhook?: Webhook;
  applicationId?: string;
  isSubmitting?: boolean;
}

export function WebhookForm({
  open,
  onClose,
  onSubmit,
  webhook,
  applicationId,
  isSubmitting,
}: WebhookFormProps) {
  const [selectedEvents, setSelectedEvents] = useState<WebhookEvent[]>(webhook?.events || []);
  const [headers, setHeaders] = useState<WebhookHeaders>(webhook?.headers || {});

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<WebhookForm>({
    resolver: zodResolver(webhookSchema),
    defaultValues: {
      name: webhook?.name || "",
      url: webhook?.url || "",
      description: webhook?.description || "",
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        name: webhook?.name || "",
        url: webhook?.url || "",
        description: webhook?.description || "",
      });
      setSelectedEvents(webhook?.events || []);
      setHeaders(webhook?.headers || {});
    }
  }, [open, webhook, reset]);

  const toggleEvent = (event: WebhookEvent) => {
    if (selectedEvents.includes(event)) {
      setSelectedEvents(selectedEvents.filter((e) => e !== event));
    } else {
      setSelectedEvents([...selectedEvents, event]);
    }
  };

  const addHeader = () => {
    setHeaders({ ...headers, [`header_${Object.keys(headers).length + 1}`]: "" });
  };

  const updateHeader = (key: string, value: string) => {
    setHeaders({ ...headers, [key]: value });
  };

  const removeHeader = (key: string) => {
    const newHeaders = { ...headers };
    delete newHeaders[key];
    setHeaders(newHeaders);
  };

  const onFormSubmit = (data: WebhookForm) => {
    if (selectedEvents.length === 0) {
      return;
    }
    onSubmit({
      ...data,
      events: selectedEvents,
      headers: Object.keys(headers).length > 0 ? headers : undefined,
      applicationId,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] bg-terminal-surface border-terminal-border">
        <DialogHeader>
          <DialogTitle className="font-mono text-xl text-terminal-text flex items-center gap-2">
            <Globe className="h-5 w-5 text-terminal-green" />
            {webhook ? "Edit Webhook" : "New Webhook"}
          </DialogTitle>
          <DialogDescription className="text-terminal-dim">
            Configure HTTP webhook for event notifications
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-terminal-text">
              <span className="text-terminal-green">$</span> Name
            </Label>
            <Input
              id="name"
              placeholder="Production Alerts"
              className={cn("font-mono", errors.name && "border-terminal-coral")}
              {...register("name")}
            />
            {errors.name && (
              <p className="text-xs text-terminal-coral">{errors.name.message}</p>
            )}
          </div>

          {/* URL */}
          <div className="space-y-2">
            <Label htmlFor="url" className="text-terminal-text">
              <span className="text-terminal-green">$</span> Endpoint URL
            </Label>
            <Input
              id="url"
              placeholder="https://your-site.com/webhook"
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
              Description <span className="text-terminal-dim">(optional)</span>
            </Label>
            <Textarea
              id="description"
              placeholder="What does this webhook notify?"
              rows={2}
              className="font-mono text-sm resize-none"
              {...register("description")}
            />
          </div>

          {/* Events */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-terminal-text flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Events
              </Label>
              <span className="text-xs text-terminal-dim">{selectedEvents.length} selected</span>
            </div>
            <div className="space-y-1 p-3 bg-terminal-bg border border-terminal-border rounded-lg max-h-[200px] overflow-y-auto">
              {ALL_EVENTS.map((event) => (
                <div
                  key={event}
                  onClick={() => toggleEvent(event)}
                  className={cn(
                    "flex items-center justify-between p-2 rounded cursor-pointer transition-colors",
                    "hover:bg-terminal-border/50",
                    selectedEvents.includes(event) && "bg-terminal-green/10"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "w-4 h-4 rounded border flex items-center justify-center",
                      selectedEvents.includes(event)
                        ? "bg-terminal-green border-terminal-green"
                        : "border-terminal-border"
                    )}>
                      {selectedEvents.includes(event) && <Check className="h-3 w-3 text-terminal-bg" />}
                    </div>
                    <div>
                      <div className="text-sm font-mono">{event.replace(/_/g, " ").toLowerCase()}</div>
                      <div className="text-xs text-terminal-dim">{EVENT_DESCRIPTIONS[event]}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {selectedEvents.length === 0 && (
              <p className="text-xs text-terminal-coral">Select at least one event</p>
            )}
          </div>

          {/* Custom Headers */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-terminal-text">Custom Headers</Label>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={addHeader}
                className="h-7 px-2 text-xs font-mono border-terminal-border"
              >
                <Plus className="h-3 w-3 mr-1" />
                Add Header
              </Button>
            </div>
            {Object.entries(headers).length === 0 ? (
              <p className="text-xs text-terminal-dim p-3 bg-terminal-bg border border-dashed rounded text-center">
                No custom headers
              </p>
            ) : (
              <div className="space-y-2">
                {Object.entries(headers).map(([key, value], index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      placeholder="Header name"
                      value={key}
                      onChange={(e) => {
                        const newHeaders = { ...headers };
                        delete newHeaders[key];
                        newHeaders[e.target.value] = value;
                        setHeaders(newHeaders);
                      }}
                      className="font-mono text-sm flex-1"
                    />
                    <span className="text-terminal-dim">:</span>
                    <Input
                      placeholder="Value"
                      value={value}
                      onChange={(e) => updateHeader(key, e.target.value)}
                      className="font-mono text-sm flex-1"
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => removeHeader(key)}
                      className="h-8 w-8 p-0 text-terminal-coral hover:text-terminal-coral/80"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
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
              disabled={isSubmitting || selectedEvents.length === 0}
              className="font-mono"
            >
              {isSubmitting ? (
                <span className="animate-pulse">Saving...</span>
              ) : (
                <>
                  <span className="text-terminal-bg">&gt;</span>{" "}
                  {webhook ? "Update" : "Create"}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
