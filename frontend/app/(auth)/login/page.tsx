"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Terminal, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/lib/stores/auth-store";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const loginSchema = z.object({
  apiKey: z.string().min(1, "API Key is required").min(10, "Invalid API Key format"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();
  const [showTerminal, setShowTerminal] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      await login(data.apiKey);
      toast.success("Authenticated successfully");
      router.push("/");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Authentication failed");
    }
  };

  return (
    <div className="space-y-8">
      {/* Logo/Title */}
      <div className="flex flex-col items-center space-y-4 text-center">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-terminal-green text-terminal-bg">
            <Terminal className="h-6 w-6" />
          </div>
          <div className="text-left">
            <h1 className="font-display font-bold text-2xl text-terminal-green">
              DevKit
            </h1>
            <p className="text-xs text-terminal-dim">Configuration Management</p>
          </div>
        </div>
      </div>

      {/* Login Card */}
      <Card className="border-terminal-border bg-terminal-surface">
        <CardHeader className="space-y-1">
          <CardTitle className="font-mono text-xl text-terminal-text">
            Authenticate
          </CardTitle>
          <CardDescription className="text-terminal-dim">
            Enter your API Key to access the DevKit console
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="apiKey" className="text-terminal-text">
                <span className="text-terminal-green">$</span> API Key
              </Label>
              <div className="relative">
                <Input
                  id="apiKey"
                  type={showTerminal ? "text" : "password"}
                  placeholder="dk_xxxxxxxxxxxxxxxxxxxx"
                  className={cn(
                    "font-mono pr-10",
                    errors.apiKey && "border-terminal-coral"
                  )}
                  {...register("apiKey")}
                />
                <button
                  type="button"
                  onClick={() => setShowTerminal(!showTerminal)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-terminal-dim hover:text-terminal-green transition-colors"
                >
                  <Lock className="h-4 w-4" />
                </button>
              </div>
              {errors.apiKey && (
                <p className="text-xs text-terminal-coral">
                  <span className="text-terminal-green">error:</span> {errors.apiKey.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full font-mono"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="animate-pulse">Connecting...</span>
                </>
              ) : (
                <>
                  <span className="text-terminal-green">&gt;</span> Connect
                </>
              )}
            </Button>
          </form>

          {/* Help text */}
          <div className="mt-6 pt-6 border-t border-terminal-border">
            <p className="text-xs text-terminal-dim font-mono">
              <span className="text-terminal-green">#</span> Don't have an API Key?
            </p>
            <p className="text-xs text-terminal-dim font-mono mt-1">
              Contact your administrator or create a new application.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="text-center">
        <p className="text-xs text-terminal-dim font-mono">
          <span className="text-terminal-green">v1.0.0</span> •{" "}
          <a href="#" className="hover:text-terminal-green hover-underline">
            Documentation
          </a>{" "}
          •{" "}
          <a href="#" className="hover:text-terminal-green hover-underline">
            GitHub
          </a>
        </p>
      </div>
    </div>
  );
}
