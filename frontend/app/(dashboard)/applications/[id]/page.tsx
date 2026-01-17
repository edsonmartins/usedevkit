"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Plus, Key, Settings as SettingsIcon, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useApplication } from "@/lib/hooks/use-applications";
import { useApplicationEnvironments } from "@/lib/hooks/use-applications";
import { useUIStore } from "@/lib/stores/ui-store";
import { cn, formatRelativeTime, copyToClipboard } from "@/lib/utils";
import { toast } from "sonner";
import { EnvironmentSelector } from "@/components/applications/environment-selector";
import { EncryptionKeyManager } from "@/components/applications/encryption-key-manager";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ApplicationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const applicationId = params.id as string;

  const { data: application, isLoading } = useApplication(applicationId);
  const {
    environments,
    create: createEnv,
    isCreating: isCreatingEnv,
  } = useApplicationEnvironments(applicationId);

  const { setSelectedApplication, setSelectedEnvironment } = useUIStore();

  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
  const [newApiKey, setNewApiKey] = useState<{ key: string; prefix: string } | null>(null);
  const [apiKeyName, setApiKeyName] = useState("");
  const [selectedEnvironmentId, setSelectedEnvironmentId] = useState<string | null>(null);

  // Update selected application in store
  useEffect(() => {
    if (application) {
      setSelectedApplication(application.name);
    }
  }, [application, setSelectedApplication]);

  // Set initial environment
  useEffect(() => {
    if (environments.length > 0 && !selectedEnvironmentId) {
      setSelectedEnvironmentId(environments[0].id);
    }
  }, [environments, selectedEnvironmentId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-terminal-dim font-mono">
          <span className="text-terminal-green">$</span> Loading...
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-terminal-coral font-mono">
          Application not found
        </div>
      </div>
    );
  }

  const handleCreateApiKey = async () => {
    if (!apiKeyName) return;

    try {
      // TODO: Implement API key creation endpoint
      // This feature is not yet implemented - requires backend API endpoint
      toast.error(
        "API Key creation is not yet implemented. " +
        "Please contact your administrator to create API keys."
      );
    } catch (error) {
      console.error("Failed to create API key:", error);
      toast.error(
        error instanceof Error
          ? `Failed to create API Key: ${error.message}`
          : "Failed to create API Key"
      );
    }
  };

  const handleCopyApiKey = async () => {
    if (newApiKey) {
      await copyToClipboard(newApiKey.key);
      toast.success("API Key copied to clipboard");
    }
  };

  const handleEnvironmentChange = (envId: string, envName: string) => {
    setSelectedEnvironmentId(envId);
    setSelectedEnvironment(envName);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/applications")}
          className="text-terminal-dim hover:text-terminal-green"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl font-bold text-terminal-text font-mono">
              <span className="text-terminal-green">./</span>{application.name}
            </h1>
            <Badge
              variant={application.active ? "success" : "secondary"}
              className="font-mono text-xs"
            >
              {application.active ? "Active" : "Inactive"}
            </Badge>
          </div>
          {application.description && (
            <p className="text-terminal-dim text-sm mt-1">{application.description}</p>
          )}
        </div>
      </div>

      {/* Environment Selector */}
      <div className="flex items-center gap-4">
        <span className="text-terminal-dim text-sm font-mono">Environment:</span>
        <EnvironmentSelector
          applicationId={applicationId}
          environments={environments}
          selectedEnvironmentId={selectedEnvironmentId}
          onEnvironmentChange={handleEnvironmentChange}
        />
      </div>

      {/* Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-terminal-surface border border-terminal-border">
          <TabsTrigger value="overview" className="data-[state=active]:bg-terminal-border/50">
            Overview
          </TabsTrigger>
          <TabsTrigger value="encryption" className="data-[state=active]:bg-terminal-border/50">
            <Key className="mr-2 h-4 w-4" />
            Encryption
          </TabsTrigger>
          <TabsTrigger value="keys" className="data-[state=active]:bg-terminal-border/50">
            API Keys
          </TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:bg-terminal-border/50">
            Settings
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-terminal-surface border-terminal-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-mono text-terminal-dim">Configurations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-mono font-bold text-terminal-text">0</div>
              </CardContent>
            </Card>
            <Card className="bg-terminal-surface border-terminal-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-mono text-terminal-dim">Secrets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-mono font-bold text-terminal-text">0</div>
              </CardContent>
            </Card>
            <Card className="bg-terminal-surface border-terminal-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-mono text-terminal-dim">Feature Flags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-mono font-bold text-terminal-text">0</div>
              </CardContent>
            </Card>
          </div>

          {/* Environments */}
          <Card className="bg-terminal-surface border-terminal-border">
            <CardHeader>
              <CardTitle className="font-mono text-lg">Environments</CardTitle>
              <CardDescription className="text-terminal-dim">
                Configure environments for this application
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {environments.map((env) => (
                  <div
                    key={env.id}
                    className="border border-terminal-border rounded-lg p-4 hover:border-terminal-green/50 transition-colors cursor-pointer"
                    onClick={() => {
                      setSelectedEnvironment(env.name);
                      router.push(`/applications/${applicationId}/configurations`);
                    }}
                  >
                    <div className="font-mono font-medium text-terminal-text">{env.name}</div>
                    {env.description && (
                      <div className="text-xs text-terminal-dim mt-1">{env.description}</div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Encryption Key Tab */}
        <TabsContent value="encryption" className="space-y-6">
          <EncryptionKeyManager
            applicationId={applicationId}
            applicationName={application.name}
          />
        </TabsContent>

        {/* API Keys Tab */}
        <TabsContent value="keys" className="space-y-6">
          <Card className="bg-terminal-surface border-terminal-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="font-mono text-lg">API Keys</CardTitle>
                  <CardDescription className="text-terminal-dim">
                    Manage API keys for this application
                  </CardDescription>
                </div>
                <Button
                  onClick={() => setShowApiKeyDialog(true)}
                  className="font-mono"
                  size="sm"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Generate Key
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-terminal-dim font-mono">
                <span className="text-terminal-green">$</span> No API keys found
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card className="bg-terminal-surface border-terminal-border">
            <CardHeader>
              <CardTitle className="font-mono text-lg text-terminal-coral flex items-center gap-2">
                <Trash2 className="h-5 w-5" />
                Danger Zone
              </CardTitle>
              <CardDescription className="text-terminal-dim">
                Irreversible actions for this application
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 border border-terminal-border rounded-lg">
                <div>
                  <div className="font-mono font-medium text-terminal-text">Delete Application</div>
                  <div className="text-sm text-terminal-dim mt-1">
                    Permanently delete this application and all its data
                  </div>
                </div>
                <Button
                  variant="destructive"
                  className="font-mono bg-terminal-coral/20 text-terminal-coral border-terminal-coral/50 hover:bg-terminal-coral/30"
                  size="sm"
                >
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* API Key Dialog */}
      <Dialog open={showApiKeyDialog} onOpenChange={setShowApiKeyDialog}>
        <DialogContent className="sm:max-w-[500px] bg-terminal-surface border-terminal-border">
          <DialogHeader>
            <DialogTitle className="font-mono text-xl text-terminal-text">
              Generate API Key
            </DialogTitle>
            <DialogDescription className="text-terminal-dim">
              Create a new API key for this application
            </DialogDescription>
          </DialogHeader>

          {!newApiKey ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="apiKeyName" className="text-terminal-text">
                  <span className="text-terminal-green">$</span> Key Name
                </Label>
                <Input
                  id="apiKeyName"
                  placeholder="Production Key"
                  className="font-mono"
                  value={apiKeyName}
                  onChange={(e) => setApiKeyName(e.target.value)}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowApiKeyDialog(false)}
                  className="border-terminal-border"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateApiKey}
                  disabled={!apiKeyName || isCreatingEnv}
                  className="font-mono"
                >
                  {isCreatingEnv ? "Generating..." : "Generate"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-terminal-bg border border-terminal-border rounded-lg">
                <div className="text-xs text-terminal-dim mb-2">Your API Key</div>
                <div className="flex items-center gap-2">
                  <code className="flex-1 font-mono text-sm text-terminal-green break-all">
                    {newApiKey.key}
                  </code>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCopyApiKey}
                    className="border-terminal-border flex-shrink-0"
                  >
                    Copy
                  </Button>
                </div>
                <div className="text-xs text-terminal-coral mt-3">
                  Save this key now. You won't be able to see it again!
                </div>
              </div>
              <div className="flex justify-end">
                <Button
                  onClick={() => {
                    setNewApiKey(null);
                    setShowApiKeyDialog(false);
                    setApiKeyName("");
                  }}
                  className="font-mono"
                >
                  Done
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
