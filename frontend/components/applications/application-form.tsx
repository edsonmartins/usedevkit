"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { X, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Application, CreateApplicationDto } from "@/lib/types/application";

const applicationSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  description: z.string().max(500, "Description must be less than 500 characters").optional(),
  environments: z.array(z.object({
    name: z.string().min(1, "Environment name is required"),
  })).min(1, "At least one environment is required"),
});

type ApplicationForm = z.infer<typeof applicationSchema>;

interface ApplicationFormProps {
  application?: Application;
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateApplicationDto) => void;
  isSubmitting?: boolean;
}

const DEFAULT_ENVIRONMENTS = ["dev", "staging", "production"];

export function ApplicationForm({
  application,
  open,
  onClose,
  onSubmit,
  isSubmitting,
}: ApplicationFormProps) {
  const [envInput, setEnvInput] = useState("");
  const [environments, setEnvironments] = useState<string[]>(
    application?.environments?.map((e) => e.name) || DEFAULT_ENVIRONMENTS
  );

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ApplicationForm>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      name: application?.name || "",
      description: application?.description || "",
      environments: environments.map((name) => ({ name })),
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        name: application?.name || "",
        description: application?.description || "",
        environments: environments.map((name) => ({ name })),
      });
    }
  }, [open, application, reset, environments]);

  const handleAddEnvironment = () => {
    if (envInput && !environments.includes(envInput)) {
      const newEnvs = [...environments, envInput];
      setEnvironments(newEnvs);
      setValue("environments", newEnvs.map((name) => ({ name })));
      setEnvInput("");
    }
  };

  const handleRemoveEnvironment = (env: string) => {
    const newEnvs = environments.filter((e) => e !== env);
    if (newEnvs.length > 0) {
      setEnvironments(newEnvs);
      setValue("environments", newEnvs.map((name) => ({ name })));
    }
  };

  const handleQuickAddDefaults = () => {
    const newEnvs = [...new Set([...environments, ...DEFAULT_ENVIRONMENTS])];
    setEnvironments(newEnvs);
    setValue("environments", newEnvs.map((name) => ({ name })));
  };

  const onFormSubmit = (data: ApplicationForm) => {
    onSubmit({
      ...data,
      environments: environments.map((name) => ({ name })),
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-terminal-surface border-terminal-border">
        <DialogHeader>
          <DialogTitle className="font-mono text-xl text-terminal-text">
            {application ? "Edit Application" : "Create Application"}
          </DialogTitle>
          <DialogDescription className="text-terminal-dim">
            {application
              ? "Update application details and environments"
              : "Create a new application with its environments"}
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
              placeholder="my-awesome-app"
              className={cn("font-mono", errors.name && "border-terminal-coral")}
              {...register("name")}
            />
            {errors.name && (
              <p className="text-xs text-terminal-coral">{errors.name.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-terminal-text">
              Description <span className="text-terminal-dim">(optional)</span>
            </Label>
            <Textarea
              id="description"
              placeholder="Brief description of your application..."
              rows={3}
              className={cn("font-mono resize-none", errors.description && "border-terminal-coral")}
              {...register("description")}
            />
            {errors.description && (
              <p className="text-xs text-terminal-coral">{errors.description.message}</p>
            )}
          </div>

          {/* Environments */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-terminal-text">
                <span className="text-terminal-green">$</span> Environments
              </Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleQuickAddDefaults}
                className="text-xs text-terminal-green hover:text-terminal-green/80"
              >
                + Add defaults
              </Button>
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="Environment name (e.g., dev)"
                className={cn("font-mono flex-1", errors.environments && "border-terminal-coral")}
                value={envInput}
                onChange={(e) => setEnvInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddEnvironment();
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleAddEnvironment}
                className="border-terminal-border text-terminal-green hover:bg-terminal-green/10"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {errors.environments && (
              <p className="text-xs text-terminal-coral">{errors.environments.message}</p>
            )}

            <div className="flex flex-wrap gap-2">
              {environments.map((env) => (
                <Badge
                  key={env}
                  variant="secondary"
                  className="font-mono text-xs border-terminal-border"
                >
                  {env}
                  <button
                    type="button"
                    onClick={() => handleRemoveEnvironment(env)}
                    className="ml-1 hover:text-terminal-coral"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
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
              disabled={isSubmitting}
              className="font-mono"
            >
              {isSubmitting ? (
                <>
                  <span className="animate-pulse">Saving...</span>
                </>
              ) : (
                <>
                  <span className="text-terminal-bg">&gt;</span>{" "}
                  {application ? "Update" : "Create"}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
