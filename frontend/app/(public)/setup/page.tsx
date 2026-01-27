"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Terminal, Copy, Check, ArrowRight, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const setupSchema = z.object({
  organizationName: z.string().min(2, "Organization name must be at least 2 characters"),
  adminEmail: z.string().email("Invalid email format"),
  applicationName: z.string().min(2, "Application name must be at least 2 characters"),
});

type SetupForm = z.infer<typeof setupSchema>;

interface BootstrapResponse {
  tenantId: string;
  tenantName: string;
  applicationId: string;
  applicationName: string;
  apiKey: string;
  message: string;
}

export default function SetupPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SetupForm>({
    resolver: zodResolver(setupSchema),
    defaultValues: {
      organizationName: "",
      adminEmail: "",
      applicationName: "My Application",
    },
  });

  const onSubmit = async (data: SetupForm) => {
    setIsSubmitting(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace("/api/v1", "") || "http://localhost:8080";
      const response = await fetch(`${apiUrl}/api/v1/bootstrap`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Setup failed");
      }

      const result: BootstrapResponse = await response.json();
      setApiKey(result.apiKey);
      toast.success("Setup completed successfully!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Setup failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyApiKey = async () => {
    if (apiKey) {
      await navigator.clipboard.writeText(apiKey);
      setCopied(true);
      toast.success("API Key copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const goToLogin = () => {
    router.push("/login");
  };

  // Show API Key result screen
  if (apiKey) {
    return (
      <div className="w-full max-w-lg space-y-8">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-terminal-green text-terminal-bg">
            <Check className="h-8 w-8" />
          </div>
          <h1 className="font-mono font-bold text-2xl text-terminal-green">
            Setup Complete!
          </h1>
          <p className="text-terminal-dim">
            Your DevKit instance is ready. Save your API key below.
          </p>
        </div>

        <Card className="border-terminal-border bg-terminal-surface">
          <CardHeader>
            <CardTitle className="font-mono text-lg text-terminal-text flex items-center gap-2">
              <Key className="h-5 w-5 text-terminal-yellow" />
              Your API Key
            </CardTitle>
            <CardDescription className="text-terminal-coral">
              Save this key now! It will only be shown once.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <div className="p-4 bg-terminal-bg border border-terminal-border rounded-lg font-mono text-sm break-all">
                <code className="text-terminal-green">{apiKey}</code>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="absolute top-2 right-2"
                onClick={copyApiKey}
              >
                {copied ? (
                  <Check className="h-4 w-4 text-terminal-green" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>

            <div className="p-3 bg-terminal-yellow/10 border border-terminal-yellow/30 rounded-lg">
              <p className="text-xs text-terminal-yellow font-mono">
                <strong>Important:</strong> Copy this API key and store it safely.
                You will need it to log in. This key cannot be recovered.
              </p>
            </div>

            <Button
              className="w-full font-mono"
              onClick={goToLogin}
            >
              <span className="text-terminal-green mr-2">$</span>
              Go to Login
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show setup form
  return (
    <div className="w-full max-w-lg space-y-8">
      <div className="flex flex-col items-center space-y-4 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-terminal-green text-terminal-bg">
          <Terminal className="h-6 w-6" />
        </div>
        <div>
          <h1 className="font-mono font-bold text-2xl text-terminal-green">
            Welcome to DevKit
          </h1>
          <p className="text-terminal-dim mt-1">
            Let's set up your instance
          </p>
        </div>
      </div>

      <Card className="border-terminal-border bg-terminal-surface">
        <CardHeader>
          <CardTitle className="font-mono text-xl text-terminal-text">
            Initial Setup
          </CardTitle>
          <CardDescription className="text-terminal-dim">
            Create your organization and first application
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="organizationName" className="text-terminal-text">
                <span className="text-terminal-green">$</span> Organization Name
              </Label>
              <Input
                id="organizationName"
                placeholder="My Company"
                className={cn(
                  "font-mono",
                  errors.organizationName && "border-terminal-coral"
                )}
                {...register("organizationName")}
              />
              {errors.organizationName && (
                <p className="text-xs text-terminal-coral">
                  {errors.organizationName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="adminEmail" className="text-terminal-text">
                <span className="text-terminal-green">$</span> Admin Email
              </Label>
              <Input
                id="adminEmail"
                type="email"
                placeholder="admin@company.com"
                className={cn(
                  "font-mono",
                  errors.adminEmail && "border-terminal-coral"
                )}
                {...register("adminEmail")}
              />
              {errors.adminEmail && (
                <p className="text-xs text-terminal-coral">
                  {errors.adminEmail.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="applicationName" className="text-terminal-text">
                <span className="text-terminal-green">$</span> Application Name
              </Label>
              <Input
                id="applicationName"
                placeholder="My Application"
                className={cn(
                  "font-mono",
                  errors.applicationName && "border-terminal-coral"
                )}
                {...register("applicationName")}
              />
              {errors.applicationName && (
                <p className="text-xs text-terminal-coral">
                  {errors.applicationName.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full font-mono"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="animate-pulse">Setting up...</span>
              ) : (
                <>
                  <span className="text-terminal-green mr-2">$</span>
                  Complete Setup
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <p className="text-center text-xs text-terminal-dim font-mono">
        This setup wizard will only appear once.
      </p>
    </div>
  );
}
