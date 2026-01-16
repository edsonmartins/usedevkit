# ConfigHub - Dynamic Configuration Module

## 🎯 Visão Geral

Dynamic Configuration permite que aplicações **atualizem configurações em tempo real** sem restart, habilitando:
- Hot reload de configs críticas
- Tuning de performance em produção
- Ajustes durante incidentes
- Experimentação sem downtime
- Resposta rápida a mudanças de carga

**Problema que resolve:**
Hoje, mudar um timeout ou rate limit requer redeploy (5-15 minutos de downtime).

**Com Dynamic Config:**
Muda na interface → Apps atualizam em segundos → Zero downtime

---

## 🏗️ Arquitetura

```
┌──────────────────────────────────────────┐
│         Application                       │
│                                          │
│  @DynamicConfig("api.timeout")          │
│  private int timeout;                    │
│  // Auto-atualiza!                      │
└──────────────┬───────────────────────────┘
               │
     ┌─────────▼──────────┐
     │  Config Watcher     │
     │  (Polling/SSE)      │
     └─────────┬──────────┘
               │
     ┌─────────▼──────────┐
     │  ConfigHub API      │
     │  /configs/watch     │
     └─────────┬──────────┘
               │
     ┌─────────▼──────────┐
     │  Change Events      │
     │  (WebSocket/SSE)    │
     └────────────────────┘
```

---

## 🗃️ Modelo de Dados

### ConfigurationVersion Entity

```java
@Entity
@Table(name = "configuration_versions")
public class ConfigurationVersion {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @ManyToOne
    @JoinColumn(name = "configuration_id")
    private Configuration configuration;
    
    @Column(nullable = false)
    private Integer version;
    
    @Column(columnDefinition = "TEXT")
    private String encryptedValue;
    
    @Column
    private String encryptionIv;
    
    @Column(nullable = false)
    private Boolean active = false; // Versão ativa
    
    @CreatedDate
    private LocalDateTime createdAt;
    
    private String createdBy;
    
    @Column(length = 500)
    private String changeReason;
}
```

### ConfigChangeEvent Entity

```java
@Entity
@Table(name = "config_change_events")
public class ConfigChangeEvent {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @ManyToOne
    private Application application;
    
    @ManyToOne
    private Environment environment;
    
    @Column(nullable = false)
    private String configKey;
    
    @Column(columnDefinition = "TEXT")
    private String oldValue;
    
    @Column(columnDefinition = "TEXT")
    private String newValue;
    
    @Enumerated(EnumType.STRING)
    private ChangeType changeType; // UPDATE, CREATE, DELETE
    
    @CreatedDate
    private LocalDateTime timestamp;
    
    private String changedBy;
    
    @Column
    private Boolean notified = false; // Clients foram notificados?
}
```

### DynamicConfigMetadata Entity

```java
@Entity
@Table(name = "dynamic_config_metadata")
public class DynamicConfigMetadata {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @OneToOne
    private Configuration configuration;
    
    @Column(nullable = false)
    private Boolean hotReloadEnabled = true; // Permite hot reload?
    
    @Column
    private Integer minRefreshIntervalSeconds = 30; // Mínimo 30s entre updates
    
    @Column
    private Boolean requiresRestart = false; // Se true, só aplica no restart
    
    @Column(columnDefinition = "TEXT")
    private String validationRules; // JSON com validações
    
    @Column
    private Integer rollbackTimeoutMinutes = 5; // Auto-rollback se falhar
    
    @Column
    private Boolean canary = false; // Aplicar em canary primeiro?
}
```

---

## 🔌 API Endpoints

### Watch/Poll API

```http
# Long polling - mantém conexão até haver mudança
GET /api/v1/configs/watch?app={appId}&env={envName}&version={currentVersion}

Response (quando houver mudança):
{
  "version": 124,
  "changes": [
    {
      "key": "api.rateLimit",
      "oldValue": "100",
      "newValue": "150",
      "changeType": "UPDATE",
      "timestamp": "2026-01-12T10:30:00Z"
    }
  ],
  "fullConfig": {
    "api.rateLimit": "150",
    "api.timeout": "30000",
    // ... todas as configs
  }
}

# Server-Sent Events (SSE) - stream contínuo
GET /api/v1/configs/stream?app={appId}&env={envName}

# WebSocket
WS /api/v1/configs/ws?app={appId}&env={envName}
```

### Management API

```http
# Update config with hot reload
PUT /api/v1/configs/{configId}
{
  "value": "150",
  "hotReload": true,
  "changeReason": "Increased rate limit due to higher traffic"
}

# Rollback to previous version
POST /api/v1/configs/{configId}/rollback
{
  "version": 122
}

# Preview change impact
POST /api/v1/configs/{configId}/preview
{
  "value": "150"
}

Response:
{
  "affectedInstances": 15,
  "estimatedPropagationTime": "15s",
  "risks": [
    "High value may cause resource exhaustion"
  ]
}
```

---

## 💻 SDK Implementation

### Java SDK with Hot Reload

```java
@Configuration
public class DynamicConfigSupport {
    
    @Bean
    public DynamicConfigManager dynamicConfigManager(
            ConfigHubClient configHub,
            ApplicationContext context) {
        
        DynamicConfigManager manager = new DynamicConfigManager(configHub);
        
        // Start watching for changes
        manager.startWatching("vendax", "production", (changes) -> {
            // Apply changes
            for (ConfigChange change : changes) {
                applyChange(change, context);
            }
        });
        
        return manager;
    }
    
    private void applyChange(ConfigChange change, ApplicationContext context) {
        // Find beans with @DynamicConfig
        Map<String, Object> beans = context.getBeansWithAnnotation(Component.class);
        
        for (Object bean : beans.values()) {
            Field[] fields = bean.getClass().getDeclaredFields();
            
            for (Field field : fields) {
                DynamicConfig annotation = field.getAnnotation(DynamicConfig.class);
                
                if (annotation != null && annotation.value().equals(change.getKey())) {
                    // Update field value
                    field.setAccessible(true);
                    Object newValue = convertValue(change.getNewValue(), field.getType());
                    field.set(bean, newValue);
                    
                    // Trigger callback if exists
                    triggerChangeCallback(bean, change);
                }
            }
        }
    }
}

// Custom annotation
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.FIELD)
public @interface DynamicConfig {
    String value(); // Config key
    String defaultValue() default "";
    Class<? extends ConfigChangeListener> onChange() default NoOpListener.class;
}

// Usage in application
@Service
public class RateLimitService {
    
    @DynamicConfig(value = "api.rateLimit", onChange = RateLimitChanged.class)
    private int rateLimit = 100;
    
    @DynamicConfig("api.timeout")
    private int timeout = 30000;
    
    public boolean allowRequest(String userId) {
        // Uses current value of rateLimit (auto-updated!)
        return rateLimiter.tryAcquire(userId, rateLimit);
    }
    
    // Callback when config changes
    public static class RateLimitChanged implements ConfigChangeListener {
        @Override
        public void onChanged(Object bean, ConfigChange change) {
            RateLimitService service = (RateLimitService) bean;
            service.resetRateLimiter();
            log.info("Rate limit updated: {} -> {}", 
                change.getOldValue(), change.getNewValue());
        }
    }
}
```

### TypeScript SDK with Hot Reload

```typescript
class DynamicConfigManager {
  private configs = new Map<string, any>();
  private listeners = new Map<string, Set<ConfigListener>>();
  private eventSource?: EventSource;
  
  async start(appName: string, environment: string) {
    // Initial load
    const configs = await this.loadConfigs(appName, environment);
    this.configs = new Map(Object.entries(configs));
    
    // Start SSE stream
    const url = `${this.baseUrl}/configs/stream?app=${appName}&env=${environment}`;
    this.eventSource = new EventSource(url, {
      headers: { 'X-API-Key': this.apiKey }
    });
    
    this.eventSource.onmessage = (event) => {
      const change: ConfigChange = JSON.parse(event.data);
      this.applyChange(change);
    };
    
    this.eventSource.onerror = () => {
      // Reconnect logic
      setTimeout(() => this.start(appName, environment), 5000);
    };
  }
  
  private applyChange(change: ConfigChange) {
    const oldValue = this.configs.get(change.key);
    this.configs.set(change.key, change.newValue);
    
    // Notify listeners
    const listeners = this.listeners.get(change.key);
    if (listeners) {
      listeners.forEach(listener => {
        listener(change.newValue, oldValue);
      });
    }
  }
  
  get<T = any>(key: string): T {
    return this.configs.get(key);
  }
  
  // Subscribe to changes
  watch<T = any>(key: string, callback: (newValue: T, oldValue?: T) => void) {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    
    this.listeners.get(key)!.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.listeners.get(key)?.delete(callback);
    };
  }
  
  stop() {
    this.eventSource?.close();
  }
}

// React Hook
function useDynamicConfig<T = any>(key: string, defaultValue: T): T {
  const [value, setValue] = useState<T>(
    dynamicConfigManager.get(key) ?? defaultValue
  );
  
  useEffect(() => {
    const unsubscribe = dynamicConfigManager.watch(key, (newValue) => {
      setValue(newValue);
    });
    
    return unsubscribe;
  }, [key]);
  
  return value;
}

// Usage
function RateLimitedButton() {
  const maxRequests = useDynamicConfig('api.maxRequests', 100);
  
  return (
    <button disabled={requestCount >= maxRequests}>
      Make Request ({requestCount}/{maxRequests})
    </button>
  );
}

// Node.js Express middleware
app.use((req, res, next) => {
  const rateLimit = dynamicConfigManager.get('api.rateLimit');
  
  if (requestCount > rateLimit) {
    return res.status(429).json({ error: 'Rate limit exceeded' });
  }
  
  next();
});

// Watch for changes
dynamicConfigManager.watch('api.rateLimit', (newLimit, oldLimit) => {
  console.log(`Rate limit changed: ${oldLimit} -> ${newLimit}`);
  rateLimiter.setLimit(newLimit);
});
```

---

## 🎨 Interface Web

### Live Config Editor

```typescript
// components/LiveConfigEditor.tsx
export function LiveConfigEditor({ config }: { config: Configuration }) {
  const [value, setValue] = useState(config.value);
  const [updating, setUpdating] = useState(false);
  const { updateConfig } = useConfigMutations();
  
  const handleUpdate = async () => {
    setUpdating(true);
    
    try {
      await updateConfig(config.id, {
        value,
        hotReload: true,
        changeReason: 'Manual update via UI'
      });
      
      toast.success('Config updated! Propagating to instances...');
      
      // Show live propagation
      showPropagationStatus(config.id);
      
    } catch (error) {
      toast.error('Failed to update config');
    } finally {
      setUpdating(false);
    }
  };
  
  const showPropagationStatus = (configId: string) => {
    const eventSource = new EventSource(
      `/api/v1/configs/${configId}/propagation-status`
    );
    
    eventSource.onmessage = (event) => {
      const status = JSON.parse(event.data);
      // Update UI with propagation progress
      updatePropagationUI(status);
    };
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">{config.key}</h3>
          <p className="text-sm text-gray-500">{config.description}</p>
        </div>
        
        {config.metadata.hotReloadEnabled && (
          <Badge variant="success">
            <Zap className="h-3 w-3 mr-1" />
            Hot Reload
          </Badge>
        )}
      </div>
      
      <div className="flex gap-2">
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="flex-1"
        />
        
        <Button 
          onClick={handleUpdate}
          disabled={updating || value === config.value}
        >
          {updating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Updating...
            </>
          ) : (
            'Update'
          )}
        </Button>
      </div>
      
      <ConfigVersionHistory configId={config.id} />
    </div>
  );
}

// components/PropagationStatus.tsx
export function PropagationStatus({ configId }: { configId: string }) {
  const [status, setStatus] = useState<PropagationStatus | null>(null);
  
  useEffect(() => {
    const eventSource = new EventSource(
      `/api/v1/configs/${configId}/propagation-status`
    );
    
    eventSource.onmessage = (event) => {
      setStatus(JSON.parse(event.data));
    };
    
    return () => eventSource.close();
  }, [configId]);
  
  if (!status) return null;
  
  const percentage = (status.updated / status.total) * 100;
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span>Propagation Progress</span>
        <span>{status.updated} / {status.total} instances</span>
      </div>
      
      <Progress value={percentage} />
      
      {percentage === 100 && (
        <Alert variant="success">
          <Check className="h-4 w-4" />
          <AlertDescription>
            Successfully propagated to all instances in {status.duration}s
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
```

---

## 📊 Casos de Uso - VendaX

### 1. Ajustar Rate Limit Durante Pico

**Cenário:** Black Friday, tráfego 10x maior que normal

```typescript
// Operador aumenta via interface
api.rateLimit: 100 -> 1000

// Todas as instâncias do VendaX atualizam em ~15s
// Zero downtime
// Zero reclamações de 429 Too Many Requests
```

### 2. Tuning de IA em Produção

**Cenário:** Modelo GPT-4 está muito lento

```java
// Trocar modelo dinamicamente
@DynamicConfig("ai.model")
private String model = "gpt-4";

// Operador muda: gpt-4 -> gpt-3.5-turbo
// Todas as próximas requisições usam novo modelo
// Performance melhora instantaneamente
```

### 3. Circuit Breaker Dinâmico

**Cenário:** Serviço externo instável

```typescript
// config: external.api.circuitBreaker.threshold
const threshold = useDynamicConfig('external.api.circuitBreaker.threshold', 50);

if (errorRate > threshold) {
  openCircuit(); // Para de chamar API externa
}

// Operador ajusta threshold dinamicamente
// 50 -> 30 (mais sensível)
// 50 -> 80 (menos sensível)
```

### 4. Feature Toggle Temporário

```java
// Desabilitar feature cara temporariamente
@DynamicConfig("features.aiRecommendations.enabled")
private boolean aiRecommendationsEnabled = true;

if (aiRecommendationsEnabled) {
    return mlService.getRecommendations(userId);
}
return fallbackRecommendations();

// Durante incidente de custo:
// Operador desabilita via UI
// Custos param imediatamente
```

---

## 🛡️ Segurança & Validação

### Validation Rules

```json
{
  "key": "api.rateLimit",
  "validations": [
    {
      "type": "range",
      "min": 10,
      "max": 10000,
      "message": "Rate limit must be between 10 and 10000"
    },
    {
      "type": "custom",
      "function": "validateRateLimit",
      "message": "Invalid rate limit value"
    }
  ]
}
```

### Auto-Rollback

```java
@Service
public class ConfigRollbackService {
    
    @Scheduled(fixedDelay = 60000) // Check every minute
    public void checkForFailedChanges() {
        List<ConfigChange> recentChanges = findRecentChanges();
        
        for (ConfigChange change : recentChanges) {
            HealthMetrics metrics = getHealthMetrics(change.getApplication());
            
            if (metrics.errorRateIncreasedSignificantly()) {
                // Auto-rollback
                rollbackConfig(change);
                
                notifyOps(String.format(
                    "Auto-rollback: %s caused error rate spike",
                    change.getConfigKey()
                ));
            }
        }
    }
}
```

---

## 🎯 Priorização

**Fase 1 (MVP - 2 semanas):**
- ✅ Long polling API
- ✅ Basic hot reload SDK (Java)
- ✅ Interface para edição live
- ✅ Version history

**Fase 2 (3 semanas):**
- ✅ Server-Sent Events (SSE)
- ✅ TypeScript SDK hot reload
- ✅ Propagation status tracking
- ✅ Validation rules

**Fase 3 (4 semanas):**
- ✅ WebSocket support
- ✅ Auto-rollback on errors
- ✅ Canary deployments
- ✅ A/B testing integration

---

**Próximo:** 13-SECRETS-ROTATION.md
