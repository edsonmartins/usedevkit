# DevKit 🔧

<div align="center">

**The Swiss Army Knife for Developers**

Plataforma open-source de gerenciamento centralizado de configurações, secrets e feature flags.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Java](https://img.shields.io/badge/Java-17+-orange.svg)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2+-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![Next.js](https://img.shields.io/badge/Next.js-16-black.svg)](https://nextjs.org/)

[Website](https://usedevkit.com) · [Documentação](docs/) · [Quick Start](#-quick-start) · [Discord](https://discord.gg/devkit)

</div>

---

## 🎯 O Problema

Desenvolvedores enfrentam diariamente:
- ❌ Configurações espalhadas em arquivos `.env`
- ❌ Secrets vazados no Git
- ❌ Redeploy necessário para mudar configs
- ❌ Falta de auditoria e versionamento
- ❌ Feature flags implementados manualmente
- ❌ Onboarding lento de novos desenvolvedores

## ✨ A Solução: DevKit

**DevKit** é uma solução **open-source brasileira** que centraliza tudo que sua aplicação precisa:

### **Configurações & Secrets**
- 🔐 Criptografia AES-256-GCM em repouso
- 🌍 Multi-ambiente (dev, staging, production)
- 🔄 Versionamento completo
- 📜 Auditoria imutável
- 🔥 Hot reload sem restart

### **Feature Flags & A/B Testing**
- 🚩 Deploy features para % de usuários
- 🧪 A/B testing nativo
- 🎯 Targeting rules (segments, geo, etc)
- 📊 Analytics em tempo real
- ⚡ Rollback instantâneo

### **Developer Experience**
- 🚀 Setup em 5 minutos (vs horas no Vault)
- 📊 Interface moderna em Next.js 16
- 🔧 SDKs nativos (Java, TypeScript, Flutter)
- 💻 CLI poderoso
- 🇧🇷 Documentação em português
- 🆓 100% grátis e open-source (MIT)

---

## 🚀 Quick Start

### Com Docker (Recomendado)

```bash
# Clone o repositório
git clone https://github.com/devkit/devkit.git
cd devkit

# Configure variáveis de ambiente
cp .env.example .env
# Edite .env com suas chaves de segurança

# Inicie todos os serviços
docker-compose up -d

# Acesse a interface
open http://localhost:3000
```

### Primeiro Uso

```bash
# Instale o CLI
curl -sSL https://get.usedevkit.com | bash

# Login
devkit login --url http://localhost:8080 --api-key sua-api-key

# Crie sua primeira aplicação
devkit apps create my-app --envs dev,staging,prod

# Adicione configurações
devkit config set my-app --env dev database.url "postgresql://..."

# Use no código
```

**Java:**
```java
@Service
public class MyService {
    @Autowired
    private DevKitClient devkit;
    
    public void doSomething() {
        String dbUrl = devkit.getConfig("my-app", "dev", "database.url");
    }
}
```

**TypeScript:**
```typescript
import { DevKitClient } from '@devkit/sdk';

const client = new DevKitClient({
  baseUrl: 'http://localhost:8080',
  apiKey: process.env.DEVKIT_API_KEY!,
});

const dbUrl = await client.getConfig('my-app', 'dev', 'database.url');
```

**Flutter:**
```dart
final client = DevKitClient(
  DevKitOptions(
    baseUrl: 'http://localhost:8080',
    apiKey: Platform.environment['DEVKIT_API_KEY']!,
  ),
);

final dbUrl = await client.getConfig('my-app', 'dev', 'database.url');
```

---

## 🌟 Features

### ✅ **Configurações Centralizadas**
- Gerenciamento de configs em múltiplos ambientes
- Versionamento automático
- Hot reload sem restart de aplicações
- Validação de schemas
- Import/export de .env files

### 🔐 **Secrets Management**
- Criptografia AES-256-GCM
- Rotação automática de secrets
- Integração com AWS/GCP/Azure Key Vaults
- Acesso auditado
- Compliance LGPD/GDPR ready

### 🚩 **Feature Flags**
- Toggle features sem redeploy
- Gradual rollout (5% → 25% → 50% → 100%)
- A/B testing com variants
- Targeting por usuário/segmento/geo
- Analytics e métricas

### 🎨 **Interface Moderna**
- Dashboard intuitivo
- Live editing de configs
- Propagation tracking
- Audit logs visual
- Dark mode

### 🔧 **SDKs & Integração**
- Java/Spring Boot
- TypeScript/JavaScript (Node + Browser)
- Flutter/Dart
- CLI em Rust (rápido!)
- REST API completa

### 📊 **DevOps Ready**
- Docker Compose incluído
- Kubernetes manifests
- CI/CD integration
- Prometheus metrics
- Backup automático

---

## 📖 Documentação

- [Arquitetura](docs/00-ARCHITECTURE.md)
- [Backend (Spring Boot)](docs/01-BACKEND.md)
- [Frontend (Next.js)](docs/02-FRONTEND.md)
- [SDK Java](docs/03-CLIENT-JAVA.md)
- [SDK TypeScript](docs/04-CLIENT-TYPESCRIPT.md)
- [SDK Flutter](docs/05-CLIENT-FLUTTER.md)
- [CLI](docs/06-CLI.md)
- [Deployment](docs/07-DEPLOYMENT.md)
- [Contribuindo](docs/08-CONTRIBUTING.md)

### Features Avançadas
- [Feature Flags](docs/12-FEATURE-FLAGS.md)
- [Dynamic Configuration](docs/13-DYNAMIC-CONFIG.md)
- [Roadmap Completo](docs/22-ROADMAP-COMPLETE.md)

---

## 🆚 DevKit vs Alternativas

| Feature | DevKit | Vault | Doppler | Spring Cloud Config |
|---------|--------|-------|---------|-------------------|
| **Setup** | ⚡ 5 min | 🐌 Horas | ⚡ 5 min | 🟡 30 min |
| **Preço** | 🆓 Grátis | 💰💰💰 | 💰 Pago | 🆓 Grátis |
| **Interface** | ✅ Moderna | ⚠️ Básica | ✅ Boa | ❌ Nenhuma |
| **Feature Flags** | ✅ | ❌ | ✅ | ❌ |
| **Hot Reload** | ✅ | ❌ | ✅ | ⚠️ Limitado |
| **Self-hosted** | ✅ | ✅ | ❌ SaaS | ✅ |
| **Docs PT-BR** | ✅ | ❌ | ❌ | ❌ |
| **Open Source** | ✅ MIT | ✅ MPL | ❌ | ✅ Apache |

**DevKit** = Melhor de Vault (segurança) + Doppler (UX) + LaunchDarkly (feature flags)

---

## 🎯 Casos de Uso

### **Startups & Scale-ups**
- Setup rápido sem DevOps dedicado
- Grátis e open-source
- Escala conforme você cresce

### **Empresas Médias**
- Multi-projeto e multi-time
- Auditoria para compliance
- Self-hosted para controle total

### **Agências de Desenvolvimento**
- Um DevKit para todos os clientes
- Isolamento completo por projeto
- Facilita onboarding de clientes

---

## 🛣️ Roadmap

### **v1.0 - Core** (MVP - 8 semanas)
- ✅ Configurações centralizadas
- ✅ Secrets management
- ✅ Feature flags básicos
- ✅ Hot reload
- ✅ 3 SDKs (Java, TS, Flutter)
- ✅ Interface web
- ✅ CLI

### **v1.5 - Developer Portal** (8 semanas)
- 🔜 Service Catalog
- 🔜 Environment Promotion
- 🔜 Webhooks & Notifications
- 🔜 Templates & Blueprints
- 🔜 Secrets rotation manual

### **v2.0 - Enterprise** (10 semanas)
- 🔜 Feature flags avançados (A/B testing)
- 🔜 Database migrations
- 🔜 API Gateway lite
- 🔜 Compliance dashboard
- 🔜 Auto-rotation de secrets
- 🔜 Multi-tenancy

### **v3.0 - AI & Scale**
- 🔮 AI-powered suggestions
- 🔮 SaaS multi-tenant
- 🔮 Terraform provider
- 🔮 Kubernetes operator

---

## 💻 Tecnologias

**Backend:**
- Spring Boot 3.2
- Java 17
- PostgreSQL 15
- Redis

**Frontend:**
- Next.js 16
- React 19
- Tailwind CSS
- shadcn/ui

**SDKs:**
- Java (Maven)
- TypeScript (NPM)
- Flutter (Pub)

**CLI:**
- Rust

**Infra:**
- Docker
- Kubernetes
- Nginx

---

## 🤝 Contribuindo

DevKit é open-source e aceita contribuições!

1. Fork o projeto
2. Crie sua feature branch (`git checkout -b feature/amazing`)
3. Commit suas mudanças (`git commit -m 'Add amazing feature'`)
4. Push para a branch (`git push origin feature/amazing`)
5. Abra um Pull Request

Veja [CONTRIBUTING.md](CONTRIBUTING.md) para mais detalhes.

---

## 📄 Licença

DevKit é licenciado sob a **MIT License**. Veja [LICENSE](LICENSE) para mais informações.

Isso significa:
- ✅ Uso comercial permitido
- ✅ Modificações permitidas
- ✅ Distribuição permitida
- ✅ Uso privado permitido

---

## 🌟 Apoie o Projeto

Se DevKit te ajudou, considere:
- ⭐ Dar uma star no GitHub
- 🐦 Compartilhar no Twitter
- 💬 Entrar no Discord
- 📝 Escrever sobre sua experiência
- 🤝 Contribuir com código

---

## 🔗 Links

- **Website:** https://usedevkit.com
- **Documentação:** https://docs.usedevkit.com
- **GitHub:** https://github.com/devkit/devkit
- **Discord:** https://discord.gg/devkit
- **Twitter:** [@usedevkit](https://twitter.com/usedevkit)

---

## 📞 Suporte

- 📧 Email: support@usedevkit.com
- 💬 Discord: https://discord.gg/devkit
- 🐛 Issues: https://github.com/devkit/devkit/issues

---

<div align="center">

**Made with ❤️ in Brazil 🇧🇷**

DevKit © 2025 · [MIT License](LICENSE)

</div>
