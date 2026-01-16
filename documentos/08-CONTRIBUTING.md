# Contributing to ConfigHub

Obrigado por considerar contribuir com o ConfigHub! 🎉

## 📋 Índice

- [Código de Conduta](#código-de-conduta)
- [Como Posso Contribuir?](#como-posso-contribuir)
- [Desenvolvimento Local](#desenvolvimento-local)
- [Processo de Pull Request](#processo-de-pull-request)
- [Guia de Estilo](#guia-de-estilo)
- [Testes](#testes)

---

## 📜 Código de Conduta

Este projeto adere ao [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). Ao participar, você está concordando em manter este código.

---

## 🤝 Como Posso Contribuir?

### Reportando Bugs

Antes de criar um issue de bug, por favor:

1. Verifique se o bug já não foi reportado
2. Use o template de issue de bug
3. Inclua o máximo de detalhes possível:
   - Versão do ConfigHub
   - Sistema operacional
   - Passos para reproduzir
   - Comportamento esperado vs. atual
   - Screenshots se aplicável

### Sugerindo Melhorias

Usamos GitHub Issues para rastrear sugestões de features. Ao criar uma sugestão:

1. Use um título claro e descritivo
2. Forneça uma descrição detalhada da feature
3. Explique por que essa feature seria útil
4. Inclua exemplos de uso se possível

### Contribuindo com Código

1. Fork o repositório
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

---

## 💻 Desenvolvimento Local

### Pré-requisitos

**Backend:**
- Java 17+
- Maven 3.8+
- PostgreSQL 15+

**Frontend:**
- Node.js 20+
- npm ou yarn

**CLI:**
- Rust 1.70+

### Setup

```bash
# Clone o repositório
git clone https://github.com/confighub/confighub.git
cd confighub

# Backend
cd backend
cp src/main/resources/application-dev.yml.example src/main/resources/application-dev.yml
# Edite as configurações conforme necessário
mvn clean install
mvn spring-boot:run

# Frontend (em outro terminal)
cd frontend
npm install
cp .env.local.example .env.local
# Edite as variáveis de ambiente
npm run dev

# CLI (em outro terminal)
cd cli
cargo build
cargo run -- --help
```

### Banco de Dados Local

```bash
# Usando Docker
docker run --name confighub-postgres \
  -e POSTGRES_DB=confighub \
  -e POSTGRES_USER=confighub \
  -e POSTGRES_PASSWORD=confighub123 \
  -p 5432:5432 \
  -d postgres:15-alpine

# Ou usando docker-compose
docker-compose up -d postgres
```

---

## 🔄 Processo de Pull Request

### Antes de Submeter

1. ✅ Seu código compila sem erros
2. ✅ Todos os testes passam
3. ✅ Você adicionou testes para novas features
4. ✅ Você atualizou a documentação se necessário
5. ✅ Seu código segue o guia de estilo do projeto
6. ✅ Você fez squash de commits desnecessários

### Template de PR

```markdown
## Descrição
[Descrição clara do que foi mudado e por quê]

## Tipo de Mudança
- [ ] Bug fix
- [ ] Nova feature
- [ ] Breaking change
- [ ] Documentação

## Checklist
- [ ] Meu código segue o guia de estilo
- [ ] Revisei meu próprio código
- [ ] Comentei código em áreas complexas
- [ ] Atualizei a documentação
- [ ] Minhas mudanças não geram novos warnings
- [ ] Adicionei testes que provam meu fix/feature
- [ ] Testes unitários passam localmente
- [ ] Mudanças dependentes foram mergeadas

## Screenshots (se aplicável)
[Adicione screenshots aqui]
```

### Processo de Review

1. Ao menos 1 aprovação de um mantenedor
2. Todas as conversações resolvidas
3. CI/CD passando
4. Branch atualizada com main

---

## 🎨 Guia de Estilo

### Java (Backend)

```java
// Bom ✅
public class ConfigurationService {
    private final ConfigurationRepository repository;
    private final EncryptionService encryptionService;
    
    public ConfigurationService(
            ConfigurationRepository repository,
            EncryptionService encryptionService) {
        this.repository = repository;
        this.encryptionService = encryptionService;
    }
    
    public Map<String, Object> getConfigurations(
            String appName, 
            String environment) {
        // Implementação
    }
}

// Ruim ❌
public class ConfigurationService {
    @Autowired
    private ConfigurationRepository repository;
    
    public Map<String,Object> getConfigurations(String appName,String environment) {
        // Implementação
    }
}
```

**Convenções:**
- Use constructor injection, não field injection
- Nomes de variáveis em camelCase
- Constantes em UPPER_SNAKE_CASE
- Sempre use `{...}` em blocos if/for/while

### TypeScript (Frontend)

```typescript
// Bom ✅
interface ConfigHubOptions {
  baseUrl: string;
  apiKey: string;
  timeout?: number;
}

export class ConfigHubClient {
  constructor(private options: ConfigHubOptions) {}

  async getConfigurations(
    appName: string,
    environment: string
  ): Promise<ConfigMap> {
    // Implementação
  }
}

// Ruim ❌
export class ConfigHubClient {
  constructor(options: any) {
    this.options = options;
  }

  async getConfigurations(appName, environment) {
    // Implementação
  }
}
```

**Convenções:**
- Sempre use tipos explícitos
- Prefira `interface` sobre `type` quando possível
- Use arrow functions para callbacks
- Nomes de arquivos em kebab-case

### Rust (CLI)

```rust
// Bom ✅
pub struct ConfigHubClient {
    base_url: String,
    api_key: String,
}

impl ConfigHubClient {
    pub fn new(base_url: String, api_key: String) -> Result<Self> {
        Ok(Self { base_url, api_key })
    }

    pub async fn get_configurations(
        &self,
        app_name: &str,
        environment: &str,
    ) -> Result<HashMap<String, Value>> {
        // Implementação
    }
}

// Ruim ❌
pub struct ConfigHubClient {
    pub base_url: String,
    pub api_key: String,
}

impl ConfigHubClient {
    pub async fn get_configurations(&self, app_name: &str, environment: &str) -> HashMap<String, Value> {
        // Implementação
    }
}
```

**Convenções:**
- Use `Result<T>` para funções que podem falhar
- Campos privados por padrão
- Docstrings para funções públicas
- snake_case para funções e variáveis

---

## 🧪 Testes

### Backend (Java)

```java
@SpringBootTest
class ConfigurationServiceTest {
    
    @Autowired
    private ConfigurationService service;
    
    @MockBean
    private ConfigurationRepository repository;
    
    @Test
    void shouldGetConfigurations() {
        // Given
        when(repository.findByAppAndEnv("vendax", "dev"))
            .thenReturn(List.of(/* configs */));
        
        // When
        Map<String, Object> result = service.getConfigurations("vendax", "dev");
        
        // Then
        assertThat(result).isNotEmpty();
        assertThat(result).containsKey("database.url");
    }
}
```

**Executar testes:**
```bash
mvn test
mvn verify  # Inclui testes de integração
```

### Frontend (TypeScript)

```typescript
import { describe, it, expect } from 'vitest';
import { ConfigHubClient } from '../src/client';

describe('ConfigHubClient', () => {
  it('should fetch configurations', async () => {
    const client = new ConfigHubClient({
      baseUrl: 'http://localhost:8080',
      apiKey: 'test-key',
    });

    const configs = await client.getConfigurations('test-app', 'dev');
    expect(configs).toBeDefined();
  });
});
```

**Executar testes:**
```bash
npm test
npm run test:coverage
```

### CLI (Rust)

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_get_configurations() {
        let client = ConfigHubClient::new(
            "http://localhost:8080".to_string(),
            "test-key".to_string(),
        ).unwrap();

        let configs = client
            .get_configurations("test-app", "dev")
            .await
            .unwrap();

        assert!(!configs.is_empty());
    }
}
```

**Executar testes:**
```bash
cargo test
cargo test -- --nocapture  # Com output
```

---

## 📝 Commit Messages

Seguimos o [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Tipos:**
- `feat`: Nova feature
- `fix`: Bug fix
- `docs`: Documentação
- `style`: Formatação
- `refactor`: Refatoração
- `test`: Testes
- `chore`: Tarefas de manutenção

**Exemplos:**

```bash
feat(backend): add configuration versioning
fix(cli): resolve authentication timeout issue
docs(readme): update installation instructions
test(frontend): add tests for ConfigProvider
```

---

## 🏷️ Versionamento

Usamos [Semantic Versioning](https://semver.org/):

- **MAJOR**: Mudanças incompatíveis na API
- **MINOR**: Novas features compatíveis
- **PATCH**: Bug fixes compatíveis

Exemplo: `1.2.3` → `MAJOR.MINOR.PATCH`

---

## 🎯 Roadmap

Veja nosso [ROADMAP.md](ROADMAP.md) para features planejadas.

---

## 📮 Contato

- GitHub Issues: Para bugs e features
- GitHub Discussions: Para perguntas gerais
- Discord: [Link do servidor]
- Email: team@confighub.io

---

## 📄 Licença

Ao contribuir, você concorda que suas contribuições serão licenciadas sob a MIT License.

---

**Obrigado por contribuir! 🚀**
