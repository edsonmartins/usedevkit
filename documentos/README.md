# ConfigHub 🔐

<div align="center">

![ConfigHub Logo](docs/images/logo.png)

**Gerenciamento centralizado de configurações e secrets para equipes modernas**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Java](https://img.shields.io/badge/Java-17+-orange.svg)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2+-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![Next.js](https://img.shields.io/badge/Next.js-16-black.svg)](https://nextjs.org/)

[Documentação](docs/) · [Instalação](#-instalação) · [Demo](https://demo.confighub.io) · [Contribuir](CONTRIBUTING.md)

</div>

---

## 🎯 O Problema

Desenvolvedores enfrentam diariamente:
- ❌ Configurações espalhadas em arquivos `.env`
- ❌ Secrets vazados no Git
- ❌ Dificuldade em gerenciar múltiplos ambientes
- ❌ Falta de auditoria e versionamento
- ❌ Configurações fragmentadas entre times

## ✨ A Solução: ConfigHub

ConfigHub é uma solução **open-source brasileira** que centraliza suas configurações e secrets com:

- 🔐 **Criptografia end-to-end** (AES-256-GCM)
- 🚀 **Setup em minutos** (não em horas como Vault)
- 🌍 **Multi-ambiente** (dev, staging, production)
- 📊 **Interface moderna** em Next.js 16
- 🔧 **SDKs nativos** para Java, TypeScript e Flutter
- 💻 **CLI poderoso** para automação
- 📜 **Auditoria completa** de todas as mudanças
- 🔄 **Versionamento** de configurações
- 🇧🇷 **Documentação em português**

---

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                       Clientes                               │
├────────────┬──────────────┬─────────────┬───────────────────┤
│  Java SDK  │  TS/JS SDK   │ Flutter SDK │   CLI Tool        │
└─────┬──────┴──────┬───────┴──────┬──────┴──────┬────────────┘
      │             │              │             │
      └─────────────┴──────────────┴─────────────┘
                         │
              ┌──────────▼──────────┐
              │  Next.js Frontend   │
              └──────────┬──────────┘
                         │
              ┌──────────▼──────────┐
              │  Spring Boot API    │
              └──────────┬──────────┘
                         │
              ┌──────────▼──────────┐
              │  PostgreSQL + AES   │
              └─────────────────────┘
```

---

## 🚀 Instalação

### Docker Compose (Recomendado)

```bash
# Clone o repositório
git clone https://github.com/confighub/confighub.git
cd confighub

# Configure as variáveis de ambiente
cp .env.example .env
# Edite o .env com suas configurações

# Inicie os serviços
docker-compose up -d

# Acesse a interface
# Frontend: http://localhost:3000
# API: http://localhost:8080
```

### Kubernetes

```bash
# Aplique os manifestos
kubectl apply -f k8s/

# Verifique o status
kubectl get pods -n confighub
```

Veja o [Guia de Deployment](docs/07-DEPLOYMENT.md) completo.

---

## 📚 Quick Start

### 1. Criar uma Aplicação

Via interface web ou CLI:

```bash
confighub login --url https://config.company.com --api-key <sua-chave>
confighub apps create vendax --description "VendaX Platform" --envs dev,staging,prod
```

### 2. Adicionar Configurações

```bash
confighub config set vendax --env dev database.url "postgresql://localhost:5432/vendax"
confighub config set vendax --env prod api.key "sk_prod_xxx" --sensitive
```

### 3. Usar nas Aplicações

#### Java / Spring Boot

```xml
<dependency>
    <groupId>com.confighub</groupId>
    <artifactId>confighub-sdk-java</artifactId>
    <version>1.0.0</version>
</dependency>
```

```java
ConfigHubClient client = new ConfigHubClientBuilder()
    .baseUrl("https://config.company.com")
    .apiKey(System.getenv("CONFIGHUB_API_KEY"))
    .build();

String dbUrl = client.getConfig("vendax", "production", "database.url");
```

#### TypeScript / Node.js

```bash
npm install @confighub/sdk
```

```typescript
import { ConfigHubClient } from '@confighub/sdk';

const client = new ConfigHubClient({
  baseUrl: 'https://config.company.com',
  apiKey: process.env.CONFIGHUB_API_KEY!,
});

const dbUrl = await client.getConfig('vendax', 'production', 'database.url');
```

#### Flutter

```yaml
dependencies:
  confighub_sdk: ^1.0.0
```

```dart
final client = ConfigHubClient(
  ConfigHubOptions(
    baseUrl: 'https://config.company.com',
    apiKey: Platform.environment['CONFIGHUB_API_KEY']!,
  ),
);

final dbUrl = await client.getConfig('vendax', 'production', 'database.url');
```

---

## 📖 Documentação

1. [**Arquitetura Geral**](docs/00-ARCHITECTURE.md) - Visão completa do sistema
2. [**Backend Spring Boot**](docs/01-BACKEND.md) - API e serviços
3. [**Frontend Next.js**](docs/02-FRONTEND.md) - Interface administrativa
4. [**SDK Java**](docs/03-CLIENT-JAVA.md) - Cliente Java
5. [**SDK TypeScript**](docs/04-CLIENT-TYPESCRIPT.md) - Cliente TS/JS
6. [**SDK Flutter**](docs/05-CLIENT-FLUTTER.md) - Cliente Flutter/Dart
7. [**CLI Tool**](docs/06-CLI.md) - Command Line Interface
8. [**Deployment**](docs/07-DEPLOYMENT.md) - Guia de produção
9. [**Contributing**](docs/08-CONTRIBUTING.md) - Como contribuir

---

## 🎯 Casos de Uso

### 1. Desenvolvedores

```bash
# Novo dev no time? Simples:
confighub pull vendax --env dev --format env --output .env
```

### 2. DevOps/SRE

```bash
# Rotação de senhas
confighub config set vendax --env prod database.password "new_secure_password" --sensitive

# Auditoria
confighub audit --app vendax --days 30
```

### 3. CI/CD

```yaml
# GitHub Actions
- name: Load Config
  run: |
    export $(confighub export vendax --env production)
    ./deploy.sh
```

---

## 🔐 Segurança

ConfigHub leva segurança a sério:

- ✅ **Criptografia em repouso** (AES-256-GCM)
- ✅ **TLS/SSL** em todas as comunicações
- ✅ **JWT** para autenticação
- ✅ **RBAC** para controle de acesso
- ✅ **Auditoria completa** de todas as ações
- ✅ **Rate limiting** para proteção contra ataques
- ✅ **Versionamento** de todas as mudanças

Veja [Security Best Practices](docs/SECURITY.md).

---

## 🌟 Features

### Atual (v1.0)

- ✅ Backend REST API completo
- ✅ Interface administrativa moderna
- ✅ Criptografia AES-256
- ✅ SDK Java
- ✅ SDK TypeScript
- ✅ SDK Flutter
- ✅ CLI funcional
- ✅ Docker Compose
- ✅ Kubernetes manifests
- ✅ Auditoria básica

### Roadmap (v1.1+)

- ⬜ Rotação automática de secrets
- ⬜ Integração com Git (backup)
- ⬜ Webhooks para mudanças
- ⬜ Import/export de `.env` files
- ⬜ Suporte a HSM
- ⬜ Multi-tenancy
- ⬜ LDAP/SSO integration
- ⬜ Terraform provider
- ⬜ Kubernetes operator

---

## 🤝 Contribuindo

Adoramos contribuições! Veja nosso [Guia de Contribuição](CONTRIBUTING.md).

**Como ajudar:**
- 🐛 Reportar bugs
- 💡 Sugerir features
- 📝 Melhorar documentação
- 🔧 Enviar Pull Requests

---

## 📊 Comparação

| Feature | ConfigHub | Vault | Spring Cloud Config |
|---------|-----------|-------|---------------------|
| Setup Time | ⚡ Minutos | 🐌 Horas | 🟡 Médio |
| Interface Web | ✅ Moderna | ❌ Básica | ❌ Não tem |
| Criptografia | ✅ AES-256 | ✅ | ⚠️ Opcional |
| Multi-tenant | 🔜 v1.2 | ✅ | ❌ |
| Auditoria | ✅ | ✅ | ⚠️ Básica |
| SDKs Nativos | ✅ 3+ | ✅ | ✅ Java |
| CLI | ✅ Rust | ✅ Go | ❌ |
| Open Source | ✅ MIT | ✅ MPL | ✅ Apache |
| Docs em PT-BR | ✅ | ❌ | ❌ |

---

## 📜 Licença

Este projeto está licenciado sob a **MIT License** - veja [LICENSE](LICENSE) para detalhes.

---

## 🙏 Agradecimentos

ConfigHub foi criado com ❤️ por desenvolvedores brasileiros que enfrentam os mesmos desafios de configuração todos os dias.

Agradecimentos especiais a:
- [Spring Boot](https://spring.io/projects/spring-boot)
- [Next.js](https://nextjs.org/)
- [Bouncy Castle](https://www.bouncycastle.org/)
- E toda a comunidade open-source

---

## 📮 Contato

- 🐛 **Issues**: [GitHub Issues](https://github.com/confighub/confighub/issues)
- 💬 **Discussões**: [GitHub Discussions](https://github.com/confighub/confighub/discussions)
- 🌐 **Website**: [confighub.io](https://confighub.io)
- 📧 **Email**: team@confighub.io

---

<div align="center">

**⭐ Se você gostou do ConfigHub, considere dar uma estrela no GitHub! ⭐**

Made with ☕ in Brazil 🇧🇷

</div>
