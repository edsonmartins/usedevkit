"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Plus, Upload, Download, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useApplication } from "@/lib/hooks/use-applications";
import { useApplicationEnvironments } from "@/lib/hooks/use-applications";
import { useConfigurations, useConfigurationVersions } from "@/lib/hooks/use-configurations";
import { useUIStore } from "@/lib/stores/ui-store";
import { toast } from "sonner";
import { EnvironmentSelector } from "@/components/applications/environment-selector";
import { ConfigTable } from "@/components/configurations/config-table";
import { ConfigEditor } from "@/components/configurations/config-editor";
import { ConfigHistory } from "@/components/configurations/config-history";
import type { Configuration, UpdateConfigurationDto, CreateConfigurationDto } from "@/lib/types/configuration";

export default function ConfigurationsPage() {
  const router = useRouter();
  const params = useParams();
  const applicationId = params.id as string;

  const { data: application, isLoading: appLoading } = useApplication(applicationId);
  const { environments, isLoading: envsLoading } = useApplicationEnvironments(applicationId);

  const { setSelectedApplication, setSelectedEnvironment: setStoreEnvironment } = useUIStore();

  // State for environment selection
  const [selectedEnvironmentId, setSelectedEnvironmentId] = useState<string | null>(null);
  const [selectedEnvName, setSelectedEnvName] = useState<string>("");

  // State for dialogs
  const [showEditor, setShowEditor] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState<Configuration | undefined>(undefined);
  const [configForHistory, setConfigForHistory] = useState<Configuration | null>(null);

  // Load configurations for selected environment
  const {
    configurations,
    configMap,
    isLoading: configsLoading,
    create,
    isCreating,
    update,
    isUpdating,
    delete: deleteConfig,
    isDeleting,
    bulkUpsert,
  } = useConfigurations(selectedEnvironmentId || "", applicationId);

  const {
    versions,
    isLoading: versionsLoading,
    rollback,
    isRollingBack,
  } = useConfigurationVersions(configForHistory?.id || "", showHistory);

  // Set initial environment from store or first available
  useEffect(() => {
    if (environments.length > 0 && !selectedEnvironmentId) {
      const firstEnv = environments[0];
      setSelectedEnvironmentId(firstEnv.id);
      setSelectedEnvName(firstEnv.name);
      setStoreEnvironment(firstEnv.name);
    }
  }, [environments, selectedEnvironmentId, setStoreEnvironment]);

  // Update store when environment changes
  const handleEnvironmentChange = (envId: string, envName: string) => {
    setSelectedEnvironmentId(envId);
    setSelectedEnvName(envName);
    setStoreEnvironment(envName);
  };

  // CRUD handlers
  const handleCreate = () => {
    setSelectedConfig(undefined);
    setShowEditor(true);
  };

  const handleEdit = (config: Configuration) => {
    setSelectedConfig(config);
    setShowEditor(true);
  };

  const handleDelete = (config: Configuration) => {
    deleteConfig(config.id);
  };

  const handleViewHistory = (config: Configuration) => {
    setConfigForHistory(config);
    setShowHistory(true);
  };

  const handleSubmit = (data: unknown) => {
    if (selectedConfig) {
      update({ id: selectedConfig.id, data: data as UpdateConfigurationDto });
    } else {
      const configData = data as Omit<CreateConfigurationDto, "applicationId" | "environmentId">;
      create({
        ...configData,
        applicationId,
        environmentId: selectedEnvironmentId!,
      });
    }
  };

  const handleRollback = (version: number, reason?: string) => {
    if (configForHistory) {
      rollback({ version, reason });
      setShowHistory(false);
      setConfigForHistory(null);
    }
  };

  // Export configurations
  const handleExport = () => {
    const envVars = Object.entries(configMap)
      .map(([key, value]) => `${key}=${value}`)
      .join("\n");

    const blob = new Blob([envVars], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${application?.name}-${selectedEnvName}.env`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Configurations exported");
  };

  // Import configurations (basic .env file parsing)
  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".env";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const text = await file.text();
      const lines = text.split("\n");
      const configs: Array<{
        key: string;
        value: string;
        type: string;
        sensitive?: boolean;
      }> = [];

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;

        const [key, ...valueParts] = trimmed.split("=");
        const value = valueParts.join("=");

        if (key && value) {
          configs.push({
            key: key.trim(),
            value,
            type: "STRING",
            sensitive: key.toLowerCase().includes("secret") ||
                     key.toLowerCase().includes("password") ||
                     key.toLowerCase().includes("key"),
          });
        }
      }

      if (configs.length > 0 && selectedEnvironmentId) {
        bulkUpsert(configs);
      }
    };
    input.click();
  };

  if (appLoading || envsLoading) {
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push(`/applications/${applicationId}`)}
          className="text-terminal-dim hover:text-terminal-green"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl font-bold text-terminal-text font-mono">
              <span className="text-terminal-green">./</span>{application.name}
              <span className="text-terminal-dim">/configurations</span>
            </h1>
            {selectedEnvName && (
              <Badge variant="outline" className="font-mono text-xs border-terminal-green/50 text-terminal-green">
                {selectedEnvName}
              </Badge>
            )}
          </div>
          <p className="text-terminal-dim text-sm mt-1">
            Manage environment configurations and feature flags
          </p>
        </div>
      </div>

      {/* Environment Selector */}
      <Card className="bg-terminal-surface border-terminal-border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-mono text-lg">Environment</CardTitle>
              <CardDescription className="text-terminal-dim">
                Select an environment to manage its configurations
              </CardDescription>
            </div>
            <EnvironmentSelector
              applicationId={applicationId}
              environments={environments}
              selectedEnvironmentId={selectedEnvironmentId}
              onEnvironmentChange={handleEnvironmentChange}
            />
          </div>
        </CardHeader>
      </Card>

      {/* Content */}
      {selectedEnvironmentId ? (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <Card className="bg-terminal-surface border-terminal-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-mono text-terminal-dim">Total</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-mono font-bold text-terminal-text">
                  {configurations.length}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-terminal-surface border-terminal-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-mono text-terminal-dim">Sensitive</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-mono font-bold text-terminal-coral">
                  {configurations.filter((c) => c.sensitive).length}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-terminal-surface border-terminal-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-mono text-terminal-dim">Strings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-mono font-bold text-terminal-text">
                  {configurations.filter((c) => c.type === "STRING").length}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-terminal-surface border-terminal-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-mono text-terminal-dim">JSON</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-mono font-bold text-purple-400">
                  {configurations.filter((c) => c.type === "JSON").length}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button onClick={handleCreate} className="font-mono" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Configuration
              </Button>
              <Button
                variant="outline"
                onClick={handleImport}
                className="font-mono border-terminal-border"
                size="sm"
              >
                <Upload className="mr-2 h-4 w-4" />
                Import
              </Button>
              <Button
                variant="outline"
                onClick={handleExport}
                className="font-mono border-terminal-border"
                size="sm"
                disabled={configurations.length === 0}
              >
                <Download className="mr-2 h-4 w-4" />
                Export .env
              </Button>
            </div>
            <Button
              variant="outline"
              className="font-mono border-terminal-border"
              size="sm"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>

          {/* Table */}
          <ConfigTable
            configurations={configurations}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onViewHistory={handleViewHistory}
            isLoading={configsLoading}
          />
        </>
      ) : (
        <Card className="bg-terminal-surface border-terminal-border">
          <CardContent className="py-16">
            <div className="text-center text-terminal-dim font-mono">
              <span className="text-terminal-green">$</span> Select an environment to view configurations
            </div>
          </CardContent>
        </Card>
      )}

      {/* Editor Dialog */}
      <ConfigEditor
        open={showEditor}
        onClose={() => {
          setShowEditor(false);
          setSelectedConfig(undefined);
        }}
        onSubmit={handleSubmit}
        configuration={selectedConfig}
        applicationId={applicationId}
        environmentId={selectedEnvironmentId || ""}
        isSubmitting={isCreating || isUpdating}
      />

      {/* History Dialog */}
      <ConfigHistory
        open={showHistory}
        onClose={() => {
          setShowHistory(false);
          setConfigForHistory(null);
        }}
        configuration={configForHistory}
        versions={versions}
        onRollback={handleRollback}
        isRollingBack={isRollingBack}
      />
    </div>
  );
}
