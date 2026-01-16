# ConfigHub - Frontend Next.js 16

## 🎨 Estrutura do Projeto

```
frontend/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── applications/
│   │   │   ├── page.tsx
│   │   │   ├── [id]/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── environments/
│   │   │   │   │   └── [envName]/
│   │   │   │   │       └── page.tsx
│   │   │   │   └── settings/
│   │   │   │       └── page.tsx
│   │   │   └── new/
│   │   │       └── page.tsx
│   │   ├── secrets/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   ├── audit/
│   │   │   └── page.tsx
│   │   └── settings/
│   │       └── page.tsx
│   ├── api/
│   │   └── [...confighub]/
│   │       └── route.ts
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── ui/                    # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── table.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── card.tsx
│   │   └── ...
│   ├── layout/
│   │   ├── header.tsx
│   │   ├── sidebar.tsx
│   │   └── main-layout.tsx
│   ├── applications/
│   │   ├── application-card.tsx
│   │   ├── application-form.tsx
│   │   └── environment-selector.tsx
│   ├── configurations/
│   │   ├── config-table.tsx
│   │   ├── config-form.tsx
│   │   ├── config-editor.tsx
│   │   └── config-history.tsx
│   ├── secrets/
│   │   ├── secret-card.tsx
│   │   ├── secret-form.tsx
│   │   └── rotation-status.tsx
│   └── audit/
│       ├── audit-table.tsx
│       └── audit-filters.tsx
├── lib/
│   ├── api/
│   │   ├── client.ts
│   │   ├── applications.ts
│   │   ├── configurations.ts
│   │   ├── secrets.ts
│   │   └── audit.ts
│   ├── hooks/
│   │   ├── use-applications.ts
│   │   ├── use-configurations.ts
│   │   └── use-auth.ts
│   ├── stores/
│   │   ├── auth-store.ts
│   │   └── ui-store.ts
│   ├── utils/
│   │   ├── encryption.ts
│   │   ├── validators.ts
│   │   └── formatters.ts
│   └── types/
│       ├── application.ts
│       ├── configuration.ts
│       └── api.ts
├── public/
│   └── logo.svg
├── .env.local
├── next.config.js
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

---

## 📦 package.json

```json
{
  "name": "confighub-frontend",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "next": "^15.1.3",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@tanstack/react-query": "^5.17.19",
    "@tanstack/react-table": "^8.11.2",
    "zustand": "^4.4.7",
    "react-hook-form": "^7.49.3",
    "zod": "^3.22.4",
    "@hookform/resolvers": "^3.3.4",
    "axios": "^1.6.5",
    "date-fns": "^3.0.6",
    "lucide-react": "^0.303.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0",
    "recharts": "^2.10.3",
    "sonner": "^1.3.1"
  },
  "devDependencies": {
    "typescript": "^5.3.3",
    "@types/node": "^20.10.6",
    "@types/react": "^18.2.46",
    "@types/react-dom": "^18.2.18",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.33",
    "tailwindcss": "^3.4.0",
    "eslint": "^8.56.0",
    "eslint-config-next": "^15.1.3"
  }
}
```

---

## ⚙️ next.config.js

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  
  async rewrites() {
    return [
      {
        source: '/api/backend/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL}/:path*`,
      },
    ];
  },
  
  // Environment variables expostas ao cliente
  env: {
    API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
};

module.exports = nextConfig;
```

---

## 🎨 tailwind.config.ts

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
```

---

## 🔐 API Client

### lib/api/client.ts

```typescript
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

class ApiClient {
  private client: AxiosInstance;
  
  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    // Request interceptor para adicionar token
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
    
    // Response interceptor para refresh token
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          try {
            const refreshToken = this.getRefreshToken();
            if (refreshToken) {
              const response = await this.client.post('/auth/refresh', {
                refreshToken,
              });
              
              const { accessToken } = response.data;
              this.setToken(accessToken);
              
              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
              return this.client(originalRequest);
            }
          } catch (refreshError) {
            this.clearAuth();
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }
        
        return Promise.reject(error);
      }
    );
  }
  
  private getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('accessToken');
    }
    return null;
  }
  
  private getRefreshToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('refreshToken');
    }
    return null;
  }
  
  private setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', token);
    }
  }
  
  private clearAuth(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  }
  
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }
  
  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }
  
  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }
  
  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }
}

export const apiClient = new ApiClient();
```

### lib/api/applications.ts

```typescript
import { apiClient } from './client';
import type { Application, CreateApplicationDto } from '@/lib/types/application';

export const applicationsApi = {
  getAll: () => 
    apiClient.get<Application[]>('/applications'),
  
  getById: (id: string) => 
    apiClient.get<Application>(`/applications/${id}`),
  
  create: (data: CreateApplicationDto) => 
    apiClient.post<Application>('/applications', data),
  
  update: (id: string, data: Partial<CreateApplicationDto>) => 
    apiClient.put<Application>(`/applications/${id}`, data),
  
  delete: (id: string) => 
    apiClient.delete<void>(`/applications/${id}`),
  
  createApiKey: (appId: string, name: string) => 
    apiClient.post<{ apiKey: string; id: string }>(
      `/applications/${appId}/api-keys`,
      { name }
    ),
};
```

### lib/api/configurations.ts

```typescript
import { apiClient } from './client';
import type { Configuration, CreateConfigDto } from '@/lib/types/configuration';

export const configurationsApi = {
  getForEnvironment: (appId: string, envName: string, includeValues = false) =>
    apiClient.get<Record<string, any>>(
      `/configurations/app/${appId}/env/${envName}`,
      { params: { includeValues } }
    ),
  
  create: (data: CreateConfigDto) =>
    apiClient.post<Configuration>('/configurations', data),
  
  update: (id: string, data: Partial<CreateConfigDto>) =>
    apiClient.put<Configuration>(`/configurations/${id}`, data),
  
  delete: (id: string) =>
    apiClient.delete<void>(`/configurations/${id}`),
  
  getHistory: (id: string) =>
    apiClient.get<Configuration[]>(`/configurations/${id}/history`),
};
```

---

## 🎯 Types

### lib/types/application.ts

```typescript
export interface Application {
  id: string;
  name: string;
  description?: string;
  active: boolean;
  environments: Environment[];
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export interface Environment {
  id: string;
  name: string;
  description?: string;
  applicationId: string;
  createdAt: string;
  createdBy?: string;
}

export interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  active: boolean;
  expiresAt?: string;
  lastUsedAt?: string;
  createdAt: string;
}

export interface CreateApplicationDto {
  name: string;
  description?: string;
  environments: string[]; // ['dev', 'staging', 'production']
}
```

### lib/types/configuration.ts

```typescript
export interface Configuration {
  id: string;
  key: string;
  encryptedValue?: string;
  sensitive: boolean;
  type: 'string' | 'int' | 'boolean' | 'json';
  description?: string;
  environmentId: string;
  version: number;
  createdAt: string;
  updatedAt: string;
  updatedBy?: string;
}

export interface CreateConfigDto {
  key: string;
  value: string;
  sensitive: boolean;
  type: 'string' | 'int' | 'boolean' | 'json';
  description?: string;
  environmentId: string;
}
```

---

## 🪝 Custom Hooks

### lib/hooks/use-applications.ts

```typescript
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { applicationsApi } from '@/lib/api/applications';
import type { CreateApplicationDto } from '@/lib/types/application';
import { toast } from 'sonner';

export function useApplications() {
  const queryClient = useQueryClient();
  
  const { data: applications, isLoading } = useQuery({
    queryKey: ['applications'],
    queryFn: applicationsApi.getAll,
  });
  
  const createMutation = useMutation({
    mutationFn: (data: CreateApplicationDto) => applicationsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      toast.success('Application created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create application');
    },
  });
  
  const deleteMutation = useMutation({
    mutationFn: (id: string) => applicationsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      toast.success('Application deleted');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete application');
    },
  });
  
  return {
    applications,
    isLoading,
    create: createMutation.mutate,
    isCreating: createMutation.isPending,
    delete: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
  };
}

export function useApplication(id: string) {
  return useQuery({
    queryKey: ['applications', id],
    queryFn: () => applicationsApi.getById(id),
    enabled: !!id,
  });
}
```

### lib/hooks/use-configurations.ts

```typescript
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { configurationsApi } from '@/lib/api/configurations';
import type { CreateConfigDto } from '@/lib/types/configuration';
import { toast } from 'sonner';

export function useConfigurations(appId: string, envName: string, includeValues = false) {
  const queryClient = useQueryClient();
  
  const { data: configurations, isLoading } = useQuery({
    queryKey: ['configurations', appId, envName, includeValues],
    queryFn: () => configurationsApi.getForEnvironment(appId, envName, includeValues),
    enabled: !!appId && !!envName,
  });
  
  const createMutation = useMutation({
    mutationFn: (data: CreateConfigDto) => configurationsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['configurations', appId, envName] 
      });
      toast.success('Configuration saved');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to save configuration');
    },
  });
  
  const deleteMutation = useMutation({
    mutationFn: (id: string) => configurationsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['configurations', appId, envName] 
      });
      toast.success('Configuration deleted');
    },
  });
  
  return {
    configurations,
    isLoading,
    create: createMutation.mutate,
    isCreating: createMutation.isPending,
    delete: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
  };
}
```

---

## 🎨 Main Layout

### app/(dashboard)/layout.tsx

```typescript
import { Header } from '@/components/layout/header';
import { Sidebar } from '@/components/layout/sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
```

### components/layout/sidebar.tsx

```typescript
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Boxes,
  Key,
  FileText,
  Settings,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Applications', href: '/applications', icon: Boxes },
  { name: 'Secrets', href: '/secrets', icon: Key },
  { name: 'Audit Logs', href: '/audit', icon: FileText },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  
  return (
    <div className="hidden md:flex md:w-64 md:flex-col">
      <div className="flex flex-col flex-grow border-r border-gray-200 bg-white overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-4 h-16 border-b">
          <h1 className="text-xl font-bold">ConfigHub</h1>
        </div>
        
        <nav className="flex-1 px-2 py-4 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'group flex items-center px-3 py-2 text-sm font-medium rounded-md',
                  isActive
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                <item.icon
                  className={cn(
                    'mr-3 h-5 w-5 flex-shrink-0',
                    isActive ? 'text-gray-900' : 'text-gray-400 group-hover:text-gray-500'
                  )}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
```

---

## 📄 Applications Page

### app/(dashboard)/applications/page.tsx

```typescript
'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ApplicationCard } from '@/components/applications/application-card';
import { ApplicationForm } from '@/components/applications/application-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useApplications } from '@/lib/hooks/use-applications';

export default function ApplicationsPage() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { applications, isLoading } = useApplications();
  
  if (isLoading) {
    return <div>Loading applications...</div>;
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Applications</h1>
          <p className="text-gray-500 mt-1">
            Manage your applications and environments
          </p>
        </div>
        
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Application
        </Button>
      </div>
      
      {applications && applications.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900">No applications</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating a new application.
          </p>
          <Button className="mt-4" onClick={() => setShowCreateDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Application
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {applications?.map((app) => (
            <ApplicationCard key={app.id} application={app} />
          ))}
        </div>
      )}
      
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create Application</DialogTitle>
          </DialogHeader>
          <ApplicationForm onClose={() => setShowCreateDialog(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
```

### components/applications/application-card.tsx

```typescript
'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Application } from '@/lib/types/application';
import { Settings, ChevronRight } from 'lucide-react';

interface ApplicationCardProps {
  application: Application;
}

export function ApplicationCard({ application }: ApplicationCardProps) {
  const router = useRouter();
  
  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-shadow"
      onClick={() => router.push(`/applications/${application.id}`)}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-medium">
          {application.name}
        </CardTitle>
        <ChevronRight className="h-5 w-5 text-gray-400" />
      </CardHeader>
      
      <CardContent>
        {application.description && (
          <p className="text-sm text-gray-500 mb-4">
            {application.description}
          </p>
        )}
        
        <div className="flex flex-wrap gap-2">
          {application.environments.map((env) => (
            <Badge key={env.id} variant="secondary">
              {env.name}
            </Badge>
          ))}
        </div>
        
        <div className="mt-4 flex items-center text-sm text-gray-500">
          <Settings className="mr-1 h-4 w-4" />
          {application.active ? 'Active' : 'Inactive'}
        </div>
      </CardContent>
    </Card>
  );
}
```

---

## 🔧 Configuration Editor

### components/configurations/config-editor.tsx

```typescript
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Eye, EyeOff, Save } from 'lucide-react';
import type { CreateConfigDto } from '@/lib/types/configuration';

interface ConfigEditorProps {
  environmentId: string;
  onSave: (config: CreateConfigDto) => void;
  isSaving?: boolean;
}

export function ConfigEditor({ environmentId, onSave, isSaving }: ConfigEditorProps) {
  const [config, setConfig] = useState<CreateConfigDto>({
    key: '',
    value: '',
    sensitive: false,
    type: 'string',
    description: '',
    environmentId,
  });
  
  const [showValue, setShowValue] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(config);
    
    // Reset form
    setConfig({
      key: '',
      value: '',
      sensitive: false,
      type: 'string',
      description: '',
      environmentId,
    });
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="key">Key *</Label>
          <Input
            id="key"
            placeholder="DATABASE_URL"
            value={config.key}
            onChange={(e) => setConfig({ ...config, key: e.target.value })}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="type">Type</Label>
          <Select
            value={config.type}
            onValueChange={(value: any) => setConfig({ ...config, type: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="string">String</SelectItem>
              <SelectItem value="int">Integer</SelectItem>
              <SelectItem value="boolean">Boolean</SelectItem>
              <SelectItem value="json">JSON</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="value">Value *</Label>
        <div className="relative">
          <Input
            id="value"
            type={config.sensitive && !showValue ? 'password' : 'text'}
            placeholder="Enter configuration value"
            value={config.value}
            onChange={(e) => setConfig({ ...config, value: e.target.value })}
            required
          />
          {config.sensitive && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full"
              onClick={() => setShowValue(!showValue)}
            >
              {showValue ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          )}
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Optional description"
          value={config.description}
          onChange={(e) => setConfig({ ...config, description: e.target.value })}
        />
      </div>
      
      <div className="flex items-center space-x-2">
        <Switch
          id="sensitive"
          checked={config.sensitive}
          onCheckedChange={(checked) => setConfig({ ...config, sensitive: checked })}
        />
        <Label htmlFor="sensitive">Mark as sensitive (encrypted)</Label>
      </div>
      
      <Button type="submit" disabled={isSaving} className="w-full">
        <Save className="mr-2 h-4 w-4" />
        {isSaving ? 'Saving...' : 'Save Configuration'}
      </Button>
    </form>
  );
}
```

---

## 🐳 Dockerfile

```dockerfile
FROM node:20-alpine AS base

# Dependencies
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Runner
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

---

## 🎯 Próximos Passos

1. Implementar componentes shadcn/ui restantes
2. Adicionar dark mode
3. Implementar gráficos com Recharts
4. Adicionar testes com Vitest
5. Melhorar acessibilidade (a11y)

**Continuar para:** 03-CLIENT-JAVA.md
