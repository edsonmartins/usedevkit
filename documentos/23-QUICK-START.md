# ConfigHub - Quick Start Implementation Guide

## 🚀 Setup em 30 Minutos

Este guia vai te levar do zero a um ConfigHub funcionando em **30 minutos**.

---

## 📋 Pré-requisitos

```bash
# Verificar instalações
java --version    # >= 17
node --version    # >= 20
docker --version  # >= 24
git --version     # qualquer versão recente
```

---

## 🎯 Passo 1: Clone e Setup (5 min)

```bash
# Clone o repositório
git clone https://github.com/confighub/confighub.git
cd confighub

# Copie o .env de exemplo
cp .env.example .env

# Edite as variáveis essenciais
nano .env
```

**Variáveis obrigatórias:**
```bash
# Segurança - MUDE ESTES VALORES!
JWT_SECRET=seu-jwt-secret-minimo-256-bits-aqui
MASTER_KEY=sua-master-encryption-key-32-bytes

# Database (deixe padrão para dev local)
DB_PASSWORD=confighub123
```

---

## 🐳 Passo 2: Inicie com Docker (5 min)

```bash
# Inicie todos os serviços
docker-compose up -d

# Verifique status
docker-compose ps

# Deve ver:
# confighub-db       ... Up (5432)
# confighub-backend  ... Up (8080)
# confighub-frontend ... Up (3000)

# Veja os logs (opcional)
docker-compose logs -f backend
```

**Aguarde ~30 segundos** para tudo inicializar.

---

## ✅ Passo 3: Verifique Instalação (2 min)

Abra no navegador:

**Frontend:** http://localhost:3000
- Deve aparecer a tela de login/setup

**Backend Health:** http://localhost:8080/actuator/health
- Deve retornar: `{"status":"UP"}`

**API Docs:** http://localhost:8080/swagger-ui.html
- Documentação interativa da API

---

## 🎨 Passo 4: Setup Inicial via Interface (5 min)

1. **Acesse:** http://localhost:3000

2. **Crie conta admin:**
   - Email: seu@email.com
   - Password: senha segura
   - Click "Create Admin Account"

3. **Primeira aplicação:**
   - Name: `my-app`
   - Description: `Minha primeira aplicação`
   - Environments: `dev, staging, production`
   - Click "Create"

4. **Primeira configuração:**
   - Environment: `dev`
   - Key: `app.name`
   - Value: `My Awesome App`
   - Sensitive: `No`
   - Click "Save"

5. **Gere API Key:**
   - Settings → API Keys
   - Click "Generate New Key"
   - **COPIE E SALVE** (só aparece uma vez!)

---

## 💻 Passo 5: Use no Código (10 min)

### Java (Spring Boot)

```bash
# Adicione a dependência
# pom.xml
<dependency>
    <groupId>com.confighub</groupId>
    <artifactId>confighub-sdk-java</artifactId>
    <version>1.0.0</version>
</dependency>
```

```java
// application.yml
confighub:
  base-url: http://localhost:8080
  api-key: ${CONFIGHUB_API_KEY}

// Código
@Service
public class MyService {
    @Autowired
    private ConfigHubClient configHub;
    
    public void doSomething() {
        String appName = configHub.getConfig("my-app", "dev", "app.name");
        System.out.println("App name: " + appName);
    }
}
```

### TypeScript (Node.js)

```bash
npm install @confighub/sdk
```

```typescript
import { ConfigHubClient } from '@confighub/sdk';

const client = new ConfigHubClient({
  baseUrl: 'http://localhost:8080',
  apiKey: process.env.CONFIGHUB_API_KEY!,
});

const appName = await client.getConfig('my-app', 'dev', 'app.name');
console.log('App name:', appName);
```

### Flutter

```bash
# pubspec.yaml
dependencies:
  confighub_sdk: ^1.0.0
```

```dart
import 'package:confighub_sdk/confighub_sdk.dart';

final client = ConfigHubClient(
  ConfigHubOptions(
    baseUrl: 'http://localhost:8080',
    apiKey: Platform.environment['CONFIGHUB_API_KEY']!,
  ),
);

final appName = await client.getConfig('my-app', 'dev', 'app.name');
print('App name: $appName');
```

### CLI

```bash
# Instale o CLI
curl -sSL https://get.confighub.io | bash

# Ou com cargo
cargo install confighub

# Login
confighub login --url http://localhost:8080 --api-key sua-api-key

# Liste apps
confighub apps list

# Puxe configs
confighub pull my-app --env dev

# Export como .env
confighub pull my-app --env dev --format env --output .env
```

---

## 🎓 Passo 6: Experimente Feature Flags (3 min)

### Via Interface

1. Navegue para **Feature Flags**
2. Click "New Feature Flag"
3. Preencha:
   - Key: `new-ui`
   - Name: `New UI Design`
   - Status: `Conditional`
   - Rollout: `Percentage`
   - Percentage: `25%`
4. Save

### No Código

```java
// Java
if (featureFlags.isEnabled("new-ui", userId)) {
    return renderNewUI();
}
return renderOldUI();
```

```typescript
// TypeScript
if (await featureFlags.isEnabled('new-ui', userId)) {
  return <NewUI />;
}
return <OldUI />;
```

---

## 🔧 Comandos Úteis

### Docker

```bash
# Ver logs
docker-compose logs -f [backend|frontend|postgres]

# Restart serviço
docker-compose restart backend

# Parar tudo
docker-compose down

# Limpar volumes (CUIDADO: apaga dados!)
docker-compose down -v

# Rebuild após mudanças no código
docker-compose up -d --build
```

### Database

```bash
# Conectar ao PostgreSQL
docker exec -it confighub-db psql -U confighub

# Queries úteis
SELECT * FROM applications;
SELECT * FROM configurations;
SELECT * FROM feature_flags;
```

### Logs

```bash
# Backend logs
docker-compose logs -f backend | grep ERROR

# Ver últimas 100 linhas
docker-compose logs --tail=100 backend
```

---

## 🐛 Troubleshooting

### Backend não inicia

```bash
# Verifique logs
docker-compose logs backend

# Problemas comuns:
# 1. Porta 8080 em uso
sudo lsof -i :8080

# 2. PostgreSQL não ready
docker-compose restart postgres
sleep 10
docker-compose restart backend
```

### Frontend não conecta ao Backend

```bash
# Verifique NEXT_PUBLIC_API_URL
docker-compose exec frontend env | grep NEXT_PUBLIC

# Deve ser: NEXT_PUBLIC_API_URL=http://localhost:8080
```

### "Unauthorized" nos SDKs

```bash
# Verifique API Key
# 1. Está copiada corretamente?
# 2. Está na variável de ambiente?
echo $CONFIGHUB_API_KEY

# 3. Gere nova key se necessário
```

---

## 🎯 Próximos Passos

Agora que você tem ConfigHub rodando:

1. **Explore a interface:**
   - Crie mais ambientes
   - Adicione secrets
   - Teste feature flags

2. **Integre em projeto real:**
   - Migre um .env file
   - Adicione SDK na aplicação
   - Configure CI/CD

3. **Aprenda recursos avançados:**
   - Dynamic config (hot reload)
   - A/B testing
   - Secrets rotation

4. **Deploy em produção:**
   - Veja [07-DEPLOYMENT.md](./07-DEPLOYMENT.md)
   - Configure HTTPS
   - Setup backup

---

## 📚 Recursos

- **Documentação:** http://localhost:3000/docs
- **API Docs:** http://localhost:8080/swagger-ui.html
- **GitHub:** https://github.com/confighub/confighub
- **Discord:** https://discord.gg/confighub
- **Exemplos:** https://github.com/confighub/examples

---

## 🆘 Precisa de Ajuda?

- 🐛 **Bug?** Abra issue no GitHub
- 💬 **Dúvida?** Pergunte no Discord
- 📧 **Email:** support@confighub.io

---

## ✅ Checklist de Sucesso

- [ ] Docker Compose rodando
- [ ] Frontend acessível (localhost:3000)
- [ ] Backend health OK (localhost:8080/actuator/health)
- [ ] Conta admin criada
- [ ] Primeira aplicação criada
- [ ] API Key gerada e salva
- [ ] SDK testado em código
- [ ] Feature flag criado
- [ ] CLI instalado e configurado

**Parabéns! 🎉 Você tem ConfigHub funcionando!**

---

## 🚀 Template para Primeiro Projeto

```bash
# Script completo para setup rápido
#!/bin/bash

# 1. Clone
git clone https://github.com/confighub/confighub.git
cd confighub

# 2. Configure
cp .env.example .env
# EDITE .env com seus valores!

# 3. Inicie
docker-compose up -d

# 4. Aguarde
echo "Aguardando serviços iniciarem..."
sleep 30

# 5. Verifique
curl http://localhost:8080/actuator/health

# 6. Abra navegador
echo "Abra http://localhost:3000"
```

**Salve como `quick-start.sh` e execute:**
```bash
chmod +x quick-start.sh
./quick-start.sh
```

---

**ConfigHub está pronto para uso! 🔥**
