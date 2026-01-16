# ConfigHub - Arquitetura Geral

## 🎯 Visão Geral

**ConfigHub** é uma solução open-source para gerenciamento centralizado de configurações e secrets, desenvolvida para o ecossistema brasileiro de desenvolvimento.

### Diferenciais
- 🔐 **Criptografia end-to-end** com AES-256-GCM
- 🚀 **Setup em minutos** comparado a Vault
- 🇧🇷 **Documentação em português**
- 📦 **SDKs nativos** para Java, TypeScript e Flutter
- 🎨 **Interface moderna** em Next.js 16
- 🔧 **CLI poderoso** para automação
- 🐳 **Docker-ready** para deploy simples

---

## 🏗️ Arquitetura de Alto Nível

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENTES                                  │
├──────────────┬──────────────┬──────────────┬────────────────┤
│   Java SDK   │  TS/JS SDK   │ Flutter SDK  │   CLI Tool     │
└──────┬───────┴──────┬───────┴──────┬───────┴────────┬───────┘
       │              │              │                │
       └──────────────┴──────────────┴────────────────┘
                            │
                    ┌───────▼────────┐
                    │   API Gateway   │
                    │  (Spring Boot)  │
                    └───────┬────────┘
                            │
       ┌────────────────────┼────────────────────┐
       │                    │                    │
┌──────▼─────┐    ┌────────▼────────┐   ┌──────▼──────┐
│   Auth     │    │   Config Core   │   │   Audit     │
│  Service   │    │    Service      │   │  Service    │
└──────┬─────┘    └────────┬────────┘   └──────┬──────┘
       │                   │                    │
       └───────────────────┼────────────────────┘
                           │
                  ┌────────▼────────┐
                  │   PostgreSQL    │
                  │  + Encryption   │
                  └─────────────────┘
```

---

## 📊 Modelo de Dados

### Entidades Principais

**1. Application (Aplicação)**
- Representa cada sistema (VendaX, Mentors, etc)
- Possui múltiplos ambientes
- API Keys para autenticação

**2. Environment (Ambiente)**
- dev, staging, production
- Herança de configurações
- Políticas de acesso específicas

**3. Configuration (Configuração)**
- Chave-valor criptografado
- Versionamento completo
- Metadados (tipo, sensível, etc)

**4. Secret (Segredo)**
- Valores altamente sensíveis
- Rotação automática
- Logs de acesso

**5. Team (Equipe)**
- Controle de acesso (RBAC)
- Permissões granulares
- Auditoria de ações

---

## 🔒 Modelo de Segurança

### Camadas de Criptografia

```
┌─────────────────────────────────────────┐
│  1. TLS/SSL (transporte)                │
├─────────────────────────────────────────┤
│  2. JWT Token (autenticação)            │
├─────────────────────────────────────────┤
│  3. AES-256-GCM (dados em repouso)      │
├─────────────────────────────────────────┤
│  4. Master Key (HSM ou env)             │
└─────────────────────────────────────────┘
```

### Fluxo de Autenticação

1. Cliente envia **API Key**
2. Backend valida e gera **JWT** (15min)
3. Refresh token (7 dias)
4. Rate limiting por cliente
5. Auditoria de todos os acessos

---

## 🗂️ Estrutura do Repositório

```
confighub/
├── backend/                    # Spring Boot API
│   ├── src/
│   ├── Dockerfile
│   └── pom.xml
│
├── frontend/                   # Next.js 16 Admin
│   ├── app/
│   ├── components/
│   └── package.json
│
├── sdks/
│   ├── java/                  # Cliente Java
│   ├── typescript/            # Cliente TS/JS
│   └── flutter/               # Cliente Flutter
│
├── cli/                       # Command Line Tool
│   ├── src/
│   └── Cargo.toml (Rust)
│
├── docker/
│   ├── docker-compose.yml
│   └── nginx.conf
│
├── docs/                      # Documentação
│   ├── getting-started.md
│   ├── api-reference.md
│   └── deployment.md
│
└── examples/                  # Exemplos de uso
    ├── spring-boot-app/
    ├── react-app/
    └── flutter-app/
```

---

## 🚀 Stack Tecnológico

### Backend
- **Framework:** Spring Boot 3.2+
- **Linguagem:** Java 17
- **Database:** PostgreSQL 15+
- **Cache:** Redis (opcional)
- **Security:** Spring Security + JWT
- **Criptografia:** Bouncy Castle

### Frontend
- **Framework:** Next.js 16 (App Router)
- **UI Library:** shadcn/ui + Tailwind CSS
- **State:** Zustand
- **Forms:** React Hook Form + Zod
- **API Client:** TanStack Query

### CLI
- **Linguagem:** Rust (performance + binário único)
- **Framework:** clap + tokio
- **Alternativa:** Go (se preferir)

### SDKs
- **Java:** Maven/Gradle package
- **TypeScript:** NPM package
- **Flutter:** Pub package

---

## 📈 Roadmap

### v1.0 - MVP (4-6 semanas)
- ✅ Backend core com APIs REST
- ✅ Criptografia AES-256
- ✅ Interface admin básica
- ✅ SDK Java
- ✅ CLI básico
- ✅ Docker compose

### v1.1 - SDKs (2-3 semanas)
- ✅ SDK TypeScript completo
- ✅ SDK Flutter completo
- ✅ Documentação completa

### v1.2 - Features Avançadas (4 semanas)
- ⬜ Rotação automática de secrets
- ⬜ Integração com Git (backup)
- ⬜ Webhooks para mudanças
- ⬜ Importação de .env files
- ⬜ CLI com autocomplete

### v2.0 - Enterprise (futuro)
- ⬜ Suporte a HSM
- ⬜ Multi-tenancy
- ⬜ LDAP/SSO integration
- ⬜ Kubernetes operator
- ⬜ Terraform provider

---

## 🎯 Casos de Uso

### 1. VendaX.ai (Seu caso)
```bash
# Desenvolvedor puxa configs
confighub pull vendax --env=dev

# CI/CD injeta em runtime
export $(confighub export vendax --env=prod)
```

### 2. Time de Desenvolvimento
```bash
# Novo dev na equipe
confighub login
confighub apps list
confighub pull mentors-ipaas --env=dev
```

### 3. DevOps/SRE
```bash
# Rotação de senha do banco
confighub secret rotate database.password --app=vendax

# Auditoria
confighub audit --app=vendax --last=7d
```

---

## 🔐 Princípios de Segurança

1. **Zero-Knowledge Encryption**
   - Master key nunca sai do servidor
   - Dados sempre criptografados em repouso

2. **Least Privilege**
   - Acesso baseado em roles
   - Permissões granulares por app/env

3. **Audit Everything**
   - Logs de todos os acessos
   - Retention configurável

4. **Immutable History**
   - Versionamento de todas as mudanças
   - Rollback para qualquer versão

5. **Defense in Depth**
   - Múltiplas camadas de segurança
   - Fail-secure design

---

## 📝 Próximos Documentos

1. **01-BACKEND.md** - Implementação Spring Boot completa
2. **02-FRONTEND.md** - Interface Next.js 16
3. **03-CLIENT-JAVA.md** - SDK Java
4. **04-CLIENT-TYPESCRIPT.md** - SDK TypeScript/JavaScript
5. **05-CLIENT-FLUTTER.md** - SDK Flutter
6. **06-CLI.md** - Command Line Interface
7. **07-DEPLOYMENT.md** - Guia de deploy (Docker, K8s)
8. **08-SECURITY.md** - Detalhamento de segurança
9. **09-API.md** - Documentação completa da API
10. **10-CONTRIBUTING.md** - Guia para contribuidores

---

## 🤝 Filosofia Open Source

Este projeto será **MIT Licensed** para máxima adoção:

- ✅ Uso comercial permitido
- ✅ Modificação permitida
- ✅ Distribuição permitida
- ✅ Uso privado permitido

### Comunidade
- GitHub Discussions para suporte
- Discord para chat em tempo real
- Contribuições bem-vindas
- Code of Conduct

---

**Preparado por:** EDSON @ IntegrAllTech  
**Data:** Janeiro 2025  
**Versão:** 1.0.0
