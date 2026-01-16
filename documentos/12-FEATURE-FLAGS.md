# ConfigHub - Feature Flags Module

## 🎯 Visão Geral

Feature Flags (ou Feature Toggles) permite controlar funcionalidades em produção sem redeploy, habilitando:
- Deploy contínuo com segurança
- A/B testing nativo
- Rollout gradual de features
- Kill switch instantâneo
- Testes em produção

---

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────┐
│           Application Code                   │
│  if (featureFlags.isEnabled("new-ui")) { }  │
└─────────────────┬───────────────────────────┘
                  │
        ┌─────────▼──────────┐
        │   SDK Client        │
        │   (with cache)      │
        └─────────┬──────────┘
                  │
        ┌─────────▼──────────┐
        │   ConfigHub API     │
        │   /features/*       │
        └─────────┬──────────┘
                  │
    ┌─────────────┴─────────────┐
    │                           │
┌───▼────┐              ┌──────▼──────┐
│ Flags  │              │ Evaluations │
│ Table  │              │   Table     │
└────────┘              └─────────────┘
```

---

## 🗃️ Modelo de Dados

### FeatureFlag Entity

```java
@Entity
@Table(name = "feature_flags")
public class FeatureFlag {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @Column(nullable = false, unique = true)
    private String key; // "new-checkout", "ai-recommendations"
    
    @Column(nullable = false)
    private String name; // "New Checkout Flow"
    
    @Column(length = 1000)
    private String description;
    
    @ManyToOne
    @JoinColumn(name = "application_id")
    private Application application;
    
    @ManyToOne
    @JoinColumn(name = "environment_id")
    private Environment environment;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FeatureFlagStatus status; // ENABLED, DISABLED, CONDITIONAL
    
    @Enumerated(EnumType.STRING)
    private RolloutStrategy rolloutStrategy; // ALL, PERCENTAGE, USER_SEGMENT, GRADUAL
    
    @Column
    private Integer rolloutPercentage; // 0-100
    
    @Column(columnDefinition = "TEXT")
    private String targetingRules; // JSON com regras
    
    @Column
    private LocalDateTime startDate;
    
    @Column
    private LocalDateTime endDate;
    
    @Column(nullable = false)
    private Boolean archived = false;
    
    @Column
    private String tags; // "experiment,frontend,critical"
    
    @CreatedDate
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    private LocalDateTime updatedAt;
    
    private String createdBy;
    private String updatedBy;
}

public enum FeatureFlagStatus {
    ENABLED,    // Ligado para todos
    DISABLED,   // Desligado para todos
    CONDITIONAL // Baseado em regras
}

public enum RolloutStrategy {
    ALL,           // Todos os usuários
    PERCENTAGE,    // X% aleatório
    USER_SEGMENT,  // Grupos específicos (beta_users, internal)
    GRADUAL,       // Aumento gradual (5% → 25% → 50% → 100%)
    SCHEDULED      // Por data/hora
}
```

### FeatureFlagEvaluation Entity (Analytics)

```java
@Entity
@Table(name = "feature_flag_evaluations")
public class FeatureFlagEvaluation {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @ManyToOne
    private FeatureFlag featureFlag;
    
    @Column(nullable = false)
    private String userId;
    
    @Column
    private String sessionId;
    
    @Column(nullable = false)
    private Boolean enabled; // Resultado da avaliação
    
    @Column
    private String reason; // "percentage", "user_segment", "rule_match"
    
    @Column
    private String ipAddress;
    
    @Column
    private String userAgent;
    
    @CreatedDate
    private LocalDateTime evaluatedAt;
}
```

### Targeting Rules (JSON)

```json
{
  "rules": [
    {
      "type": "user_segment",
      "segments": ["beta_users", "internal_team"],
      "enabled": true
    },
    {
      "type": "percentage",
      "value": 25,
      "sticky": true // Mesmo usuário sempre no mesmo grupo
    },
    {
      "type": "user_attribute",
      "attribute": "plan",
      "operator": "equals",
      "value": "premium",
      "enabled": true
    },
    {
      "type": "geo",
      "countries": ["BR", "US"],
      "enabled": true
    },
    {
      "type": "time_window",
      "start": "2026-01-15T00:00:00Z",
      "end": "2026-01-30T23:59:59Z",
      "enabled": true
    }
  ],
  "operator": "OR" // OR, AND
}
```

---

## 🔌 API Endpoints

### Management API (Admin)

```http
# List all flags
GET /api/v1/features?app={appId}&env={envName}

# Get single flag
GET /api/v1/features/{flagKey}

# Create flag
POST /api/v1/features
{
  "key": "new-checkout",
  "name": "New Checkout Flow",
  "description": "Redesigned checkout with one-click purchase",
  "applicationId": "uuid",
  "environmentId": "uuid",
  "status": "CONDITIONAL",
  "rolloutStrategy": "PERCENTAGE",
  "rolloutPercentage": 25,
  "tags": ["frontend", "experiment"]
}

# Update flag
PUT /api/v1/features/{flagKey}

# Toggle flag (quick enable/disable)
POST /api/v1/features/{flagKey}/toggle
{
  "status": "ENABLED"
}

# Delete flag
DELETE /api/v1/features/{flagKey}

# Update rollout percentage (gradual rollout)
POST /api/v1/features/{flagKey}/rollout
{
  "percentage": 50
}
```

### Evaluation API (Client SDK)

```http
# Evaluate single flag
GET /api/v1/features/{flagKey}/evaluate?userId={userId}&attributes={json}

Response:
{
  "enabled": true,
  "reason": "percentage_match",
  "variant": "variant_a" // Para A/B tests
}

# Evaluate multiple flags (bulk)
POST /api/v1/features/evaluate
{
  "userId": "user_123",
  "sessionId": "session_456",
  "attributes": {
    "plan": "premium",
    "country": "BR",
    "signupDate": "2025-01-01"
  },
  "flags": ["new-checkout", "ai-recommendations", "dark-mode"]
}

Response:
{
  "evaluations": {
    "new-checkout": {
      "enabled": true,
      "reason": "user_segment"
    },
    "ai-recommendations": {
      "enabled": false,
      "reason": "disabled"
    },
    "dark-mode": {
      "enabled": true,
      "reason": "enabled_for_all"
    }
  }
}
```

### Analytics API

```http
# Get flag statistics
GET /api/v1/features/{flagKey}/stats?period=7d

Response:
{
  "totalEvaluations": 15000,
  "uniqueUsers": 3500,
  "enabledCount": 875,
  "disabledCount": 2625,
  "enabledPercentage": 25.0,
  "breakdown": {
    "by_reason": {
      "percentage_match": 875,
      "outside_percentage": 2625
    },
    "by_day": [
      { "date": "2026-01-10", "evaluations": 2100, "enabled": 125 },
      { "date": "2026-01-11", "evaluations": 2200, "enabled": 130 }
    ]
  }
}
```

---

## 💻 SDK Implementation

### Java SDK

```java
public class FeatureFlagClient {
    private final ConfigHubClient configHub;
    private final Cache<String, Boolean> cache;
    
    public boolean isEnabled(String flagKey, String userId) {
        return isEnabled(flagKey, userId, Collections.emptyMap());
    }
    
    public boolean isEnabled(
            String flagKey, 
            String userId, 
            Map<String, Object> attributes) {
        
        // Check cache first
        String cacheKey = buildCacheKey(flagKey, userId);
        Boolean cached = cache.get(cacheKey);
        if (cached != null) {
            return cached;
        }
        
        // Evaluate via API
        FeatureFlagEvaluation result = evaluateFlag(flagKey, userId, attributes);
        
        // Cache result
        cache.put(cacheKey, result.isEnabled());
        
        return result.isEnabled();
    }
    
    // Variant support (A/B testing)
    public String getVariant(String flagKey, String userId) {
        FeatureFlagEvaluation result = evaluateFlag(flagKey, userId, null);
        return result.getVariant(); // "variant_a", "variant_b", "control"
    }
    
    // Check multiple flags at once (efficient)
    public Map<String, Boolean> evaluateAll(
            String userId, 
            List<String> flagKeys,
            Map<String, Object> attributes) {
        // Bulk API call
        return configHub.evaluateFlags(userId, flagKeys, attributes);
    }
}

// Usage
@Service
public class CheckoutService {
    @Autowired
    private FeatureFlagClient featureFlags;
    
    public CheckoutResponse processCheckout(String userId, Cart cart) {
        if (featureFlags.isEnabled("new-checkout", userId)) {
            return newCheckoutFlow(cart);
        } else {
            return legacyCheckoutFlow(cart);
        }
    }
    
    // A/B testing
    public RecommendationsResponse getRecommendations(String userId) {
        String variant = featureFlags.getVariant("ai-recommendations", userId);
        
        switch (variant) {
            case "variant_a":
                return mlModelA.predict(userId);
            case "variant_b":
                return mlModelB.predict(userId);
            default:
                return fallbackRecommendations(userId);
        }
    }
}
```

### TypeScript SDK

```typescript
class FeatureFlagClient {
  private cache = new Map<string, boolean>();
  private cacheTTL = 60000; // 1 minute
  
  async isEnabled(
    flagKey: string,
    userId: string,
    attributes?: Record<string, any>
  ): Promise<boolean> {
    const cacheKey = `${flagKey}:${userId}`;
    
    // Check cache
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }
    
    // Evaluate
    const result = await this.evaluate(flagKey, userId, attributes);
    
    // Cache
    this.cache.set(cacheKey, result.enabled);
    setTimeout(() => this.cache.delete(cacheKey), this.cacheTTL);
    
    return result.enabled;
  }
  
  async getVariant(flagKey: string, userId: string): Promise<string> {
    const result = await this.evaluate(flagKey, userId);
    return result.variant || 'control';
  }
  
  // React hook
  useFeatureFlag(flagKey: string, userId: string): boolean {
    const [enabled, setEnabled] = useState(false);
    
    useEffect(() => {
      this.isEnabled(flagKey, userId).then(setEnabled);
    }, [flagKey, userId]);
    
    return enabled;
  }
}

// Usage in React
function CheckoutPage({ userId }) {
  const newCheckoutEnabled = useFeatureFlag('new-checkout', userId);
  
  if (newCheckoutEnabled) {
    return <NewCheckout />;
  }
  
  return <LegacyCheckout />;
}

// Usage in Node.js
app.get('/api/products', async (req, res) => {
  const userId = req.user.id;
  
  if (await featureFlags.isEnabled('ai-recommendations', userId)) {
    const recommendations = await mlService.getRecommendations(userId);
    return res.json(recommendations);
  }
  
  res.json({ recommendations: [] });
});
```

### Flutter SDK

```dart
class FeatureFlagClient {
  final ConfigHubClient _client;
  final Map<String, bool> _cache = {};
  
  Future<bool> isEnabled(
    String flagKey, 
    String userId, {
    Map<String, dynamic>? attributes,
  }) async {
    final cacheKey = '$flagKey:$userId';
    
    // Check cache
    if (_cache.containsKey(cacheKey)) {
      return _cache[cacheKey]!;
    }
    
    // Evaluate
    final result = await _evaluate(flagKey, userId, attributes);
    
    // Cache
    _cache[cacheKey] = result.enabled;
    
    return result.enabled;
  }
  
  Future<String> getVariant(String flagKey, String userId) async {
    final result = await _evaluate(flagKey, userId);
    return result.variant ?? 'control';
  }
}

// Usage in Flutter
class CheckoutScreen extends StatelessWidget {
  final FeatureFlagClient featureFlags;
  final String userId;
  
  @override
  Widget build(BuildContext context) {
    return FutureBuilder<bool>(
      future: featureFlags.isEnabled('new-checkout', userId),
      builder: (context, snapshot) {
        if (snapshot.hasData && snapshot.data!) {
          return NewCheckoutWidget();
        }
        return LegacyCheckoutWidget();
      },
    );
  }
}
```

---

## 🎨 Interface Web (Next.js)

### Feature Flags Dashboard

```typescript
// components/FeatureFlagsTable.tsx
export function FeatureFlagsTable() {
  const { flags, loading } = useFeatureFlags();
  
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Feature</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Rollout</TableHead>
          <TableHead>Users</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {flags.map((flag) => (
          <TableRow key={flag.id}>
            <TableCell>
              <div>
                <div className="font-medium">{flag.name}</div>
                <div className="text-sm text-gray-500">{flag.key}</div>
              </div>
            </TableCell>
            <TableCell>
              <StatusBadge status={flag.status} />
            </TableCell>
            <TableCell>
              {flag.rolloutStrategy === 'PERCENTAGE' && (
                <div className="flex items-center gap-2">
                  <Progress value={flag.rolloutPercentage} />
                  <span className="text-sm">{flag.rolloutPercentage}%</span>
                </div>
              )}
            </TableCell>
            <TableCell>
              <div className="text-sm">
                <div>{flag.stats.uniqueUsers.toLocaleString()}</div>
                <div className="text-gray-500">
                  {flag.stats.enabledCount} enabled
                </div>
              </div>
            </TableCell>
            <TableCell>
              <FeatureFlagActions flag={flag} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

### Gradual Rollout Control

```typescript
// components/GradualRollout.tsx
export function GradualRollout({ flag }: { flag: FeatureFlag }) {
  const [percentage, setPercentage] = useState(flag.rolloutPercentage);
  const { updateRollout } = useFeatureFlagMutations();
  
  const handleRollout = async (newPercentage: number) => {
    await updateRollout(flag.id, newPercentage);
    setPercentage(newPercentage);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <span>Rollout Percentage</span>
        <span className="font-bold">{percentage}%</span>
      </div>
      
      <Slider
        value={[percentage]}
        onValueChange={([value]) => setPercentage(value)}
        onValueCommit={([value]) => handleRollout(value)}
        max={100}
        step={5}
      />
      
      <div className="flex gap-2">
        <Button onClick={() => handleRollout(0)} variant="outline" size="sm">
          0%
        </Button>
        <Button onClick={() => handleRollout(25)} variant="outline" size="sm">
          25%
        </Button>
        <Button onClick={() => handleRollout(50)} variant="outline" size="sm">
          50%
        </Button>
        <Button onClick={() => handleRollout(100)} variant="outline" size="sm">
          100%
        </Button>
      </div>
      
      <Alert>
        <AlertDescription>
          Currently enabled for approximately{' '}
          {Math.round((flag.stats.uniqueUsers * percentage) / 100)} users
        </AlertDescription>
      </Alert>
    </div>
  );
}
```

---

## 📊 Casos de Uso - VendaX

### 1. Rollout Gradual de Nova UI

```java
// No VendaX - testar novo dashboard aos poucos
if (featureFlags.isEnabled("new-dashboard", userId)) {
    return renderNewDashboard();
}
return renderLegacyDashboard();
```

**Estratégia:**
- Dia 1: 5% dos usuários (beta testers internos)
- Dia 3: 25% (se métricas OK)
- Dia 7: 50%
- Dia 14: 100%

### 2. A/B Test de Modelos de IA

```java
String variant = featureFlags.getVariant("ai-model-test", userId);

switch (variant) {
    case "gpt4":
        return openAIService.chat(prompt, "gpt-4");
    case "claude":
        return anthropicService.chat(prompt, "claude-3");
    default: // control
        return openAIService.chat(prompt, "gpt-3.5");
}
```

**Métricas acompanhadas:**
- Taxa de conversão
- Satisfação do usuário
- Custo por requisição
- Tempo de resposta

### 3. Kill Switch para Features Caras

```java
// Se custo de IA estourar, desliga temporariamente
if (featureFlags.isEnabled("ai-recommendations", userId)) {
    return mlService.getRecommendations(userId);
}
return fallbackRecommendations();
```

**Benefício:**
- Desliga feature via interface (sem redeploy)
- Economiza custos imediatamente
- Religa quando orçamento normalizar

---

## 🎯 Priorização

**Fase 1 (MVP - 2 semanas):**
- ✅ Modelo de dados básico
- ✅ API de management
- ✅ Toggle simples (ENABLED/DISABLED)
- ✅ Interface para criar/editar flags
- ✅ SDK Java básico

**Fase 2 (3 semanas):**
- ✅ Percentage rollout
- ✅ User segments
- ✅ Gradual rollout interface
- ✅ SDK TypeScript e Flutter
- ✅ Evaluation analytics

**Fase 3 (4 semanas):**
- ✅ A/B testing (variants)
- ✅ Targeting rules avançadas
- ✅ Scheduled flags
- ✅ Dashboard de métricas
- ✅ Webhooks on flag change

---

## 📈 Métricas de Sucesso

- Número de flags ativos
- Média de avaliações por segundo
- Latência de avaliação (< 10ms)
- Taxa de cache hit (> 90%)
- Deploys sem downtime (100%)

---

**Próximo:** 13-DYNAMIC-CONFIG.md
