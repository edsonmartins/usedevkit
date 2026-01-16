# DevKit - Brand Guidelines

## 🎨 Identidade Visual

### **Nome do Produto**
- **Nome Oficial:** DevKit
- **Tagline:** "The Swiss Army Knife for Developers"
- **Domínio Principal:** usedevkit.com
- **Pronúncia:** "Dev Kit" (duas palavras ao falar)

### **Uso do Nome**
✅ **Correto:**
- DevKit (com D e K maiúsculos)
- "Use DevKit para gerenciar configs"
- "O DevKit simplifica desenvolvimento"

❌ **Incorreto:**
- devkit (tudo minúsculo, exceto em código)
- DevKit (K não é maiúsculo no meio)
- Dev Kit (separado, exceto ao falar)
- DEVKIT (tudo maiúsculo, exceto em constantes)

### **Em Código**
```bash
# CLI e packages
devkit login
npm install @devkit/sdk
import { DevKitClient } from '@devkit/sdk'
```

---

## 🎨 Logo & Identidade

### **Conceito do Logo**
```
   ┌──────────────┐
   │  🔧 🔨 🪛   │
   │   DevKit     │
   │  ⚙️  🔩 🗜️  │
   └──────────────┘
```

**Elementos:**
- Caixa de ferramentas estilizada
- Ferramentas representando diferentes features
- Design limpo e moderno
- Pode ser monocromático ou colorido

**Variações:**
1. **Logo Completo:** Ícone + texto "DevKit"
2. **Logo Mark:** Apenas o ícone (para favicon, avatares)
3. **Wordmark:** Apenas "DevKit" tipográfico

---

## 🎨 Paleta de Cores

### **Cores Principais**

**Primary (Azul Tech):**
- `#2563EB` - Blue 600
- Uso: Botões principais, links, highlights
- Representa: Tecnologia, confiabilidade

**Secondary (Verde Sucesso):**
- `#10B981` - Green 500
- Uso: Status positivo, confirmações
- Representa: Sucesso, go-live

**Accent (Laranja Energia):**
- `#F59E0B` - Amber 500
- Uso: CTAs importantes, badges
- Representa: Ação, energia

### **Cores Neutras**

**Background:**
- Light: `#FFFFFF` - White
- Dark: `#0F172A` - Slate 900

**Surface:**
- Light: `#F8FAFC` - Slate 50
- Dark: `#1E293B` - Slate 800

**Text:**
- Primary: `#0F172A` - Slate 900
- Secondary: `#64748B` - Slate 500
- Inverted: `#F1F5F9` - Slate 100

### **Cores Semânticas**

- **Success:** `#10B981` - Green 500
- **Warning:** `#F59E0B` - Amber 500
- **Error:** `#EF4444` - Red 500
- **Info:** `#06B6D4` - Cyan 500

---

## 🔤 Tipografia

### **Font Stack**

**Primary (Interface):**
- Font Family: `Inter, system-ui, -apple-system, sans-serif`
- Uso: Interface, corpo de texto, botões

**Monospace (Código):**
- Font Family: `'Fira Code', 'JetBrains Mono', monospace`
- Uso: Blocos de código, terminal, CLI examples

### **Tamanhos e Pesos**

**Headings:**
- H1: 48px / 56px line-height, Bold (700)
- H2: 36px / 44px line-height, Bold (700)
- H3: 30px / 36px line-height, Semibold (600)
- H4: 24px / 32px line-height, Semibold (600)

**Body:**
- Large: 18px / 28px line-height, Regular (400)
- Base: 16px / 24px line-height, Regular (400)
- Small: 14px / 20px line-height, Regular (400)
- XSmall: 12px / 16px line-height, Medium (500)

---

## 📐 Espaçamento e Grid

### **Spacing Scale**
```
4px   → 0.25rem (tight)
8px   → 0.5rem  (xs)
12px  → 0.75rem (sm)
16px  → 1rem    (base)
24px  → 1.5rem  (md)
32px  → 2rem    (lg)
48px  → 3rem    (xl)
64px  → 4rem    (2xl)
```

### **Breakpoints**
- Mobile: `< 640px`
- Tablet: `640px - 1024px`
- Desktop: `> 1024px`

---

## 🎭 Tom e Voz

### **Personalidade da Marca**

**DevKit é:**
- 🎯 **Direto:** Sem enrolação, objetivo
- 🤝 **Amigável:** Tom conversacional, não robótico
- 💪 **Confiante:** Sabemos o que fazemos
- 🧠 **Inteligente:** Para desenvolvedores, por desenvolvedores
- 🇧🇷 **Brasileiro:** Orgulho das raízes, visão global

**DevKit NÃO é:**
- ❌ Corporativo formal demais
- ❌ Infantil ou não profissional
- ❌ Arrogante ou pretensioso
- ❌ Confuso ou vago

### **Exemplos de Tom**

**✅ Bom:**
> "DevKit simplifica seu workflow. Setup em 5 minutos, zero configuração complexa."

**❌ Ruim:**
> "O DevKit é uma solução enterprise-grade que facilita a governança de configurações através de paradigmas modernos..."

**✅ Bom:**
> "Esqueceu de rotacionar aquela senha? DevKit rotaciona automaticamente."

**❌ Ruim:**
> "A rotação automática de credenciais é implementada através de nosso sistema de scheduling avançado..."

---

## 📝 Copywriting Guidelines

### **Títulos e Headlines**

**Fórmula:** Benefício + Como

**Exemplos:**
- ✅ "Deploy features sem medo - com feature flags"
- ✅ "Pare de gerenciar configs manualmente"
- ✅ "Secrets seguros, finalmente"

### **CTAs (Call to Action)**

**Diretos e Acionáveis:**
- ✅ "Começar agora"
- ✅ "Ver documentação"
- ✅ "Experimentar grátis"
- ❌ "Clique aqui"
- ❌ "Saiba mais"

### **Mensagens de Erro**

**Clara + Solução:**
- ✅ "API key inválida. Gere uma nova em Settings → API Keys"
- ❌ "Error 401: Unauthorized"

### **Documentação**

**Estrutura:**
1. O que é
2. Por que usar
3. Como usar (código)
4. Casos de uso reais

---

## 🖼️ Assets Visuais

### **Screenshots**

**Regras:**
- Sempre usar dados realistas (não "foo", "bar")
- Dark mode quando possível
- Highlight da feature sendo demonstrada
- Tamanho: 1200x800px mínimo

### **Diagramas**

**Estilo:**
- Limpo, minimalista
- Cores da paleta oficial
- Fonte: Inter
- Export SVG quando possível

---

## 🌐 Presença Digital

### **Domínios**
- Principal: usedevkit.com
- Docs: docs.usedevkit.com
- Blog: blog.usedevkit.com
- API: api.usedevkit.com

### **Social Media**

**Usernames:**
- GitHub: @devkit
- Twitter: @usedevkit
- Discord: discord.gg/devkit
- LinkedIn: /company/usedevkit

**Avatar:**
- Logo mark (apenas ícone)
- Background: Primary blue
- 512x512px mínimo

**Banner:**
- Logo + Tagline
- 1500x500px (Twitter)
- Background gradient blue → cyan

---

## 📱 Aplicação em Produtos

### **Interface Web**

```tsx
// Botão Primary
<button className="bg-blue-600 text-white px-6 py-3 rounded-lg 
                   font-semibold hover:bg-blue-700 transition-all">
  Começar Agora
</button>

// Card
<div className="bg-white rounded-xl p-6 shadow-sm 
                hover:shadow-lg transition-all">
  {content}
</div>
```

### **CLI**

```bash
# Cores no terminal
✓ Success (verde)
⚠ Warning (amarelo)
✗ Error (vermelho)
ℹ Info (azul)

# Formatação
$ devkit command
  ↳ Explicação do que aconteceu
```

---

## 🎯 Mensagens-Chave

### **Elevator Pitch (30 segundos)**
> "DevKit é a plataforma open-source que centraliza configurações, secrets e feature flags. Pense em Vault + LaunchDarkly, mas mais simples e self-hosted. Setup em 5 minutos, grátis para sempre."

### **Value Propositions**

1. **Setup Rápido**
   - "5 minutos do clone ao deploy"
   - "Docker Compose incluído"

2. **Developer Experience**
   - "Interface moderna, não CLI dos anos 90"
   - "SDKs nativos, não HTTP puro"

3. **Open Source**
   - "100% grátis, MIT license"
   - "Sem vendor lock-in"

4. **Made in Brazil**
   - "Docs em português"
   - "Suporte da comunidade BR"

---

## ✅ Checklist de Branding

### **Para Qualquer Conteúdo:**
- [ ] Usa "DevKit" (não "devkit" ou "DevKIT")
- [ ] Tom conversacional e direto
- [ ] Cores da paleta oficial
- [ ] Tipografia Inter/Fira Code
- [ ] Benefício claro para o desenvolvedor
- [ ] CTA acionável
- [ ] Exemplos de código reais
- [ ] Links para usedevkit.com

---

## 📊 Métricas de Brand

**Tracking:**
- Brand awareness (menções online)
- GitHub stars growth
- usedevkit.com traffic
- Social media followers
- Community size (Discord)

**Goals (12 meses):**
- [ ] 5k+ GitHub stars
- [ ] 1k+ Discord members
- [ ] 50k+ website visits/mês
- [ ] 100+ blog posts/mentions

---

## 🚫 O Que Evitar

**Visual:**
- ❌ Gradientes chamativos demais
- ❌ Animações excessivas
- ❌ Clipart ou ícones genéricos
- ❌ Comic Sans (óbvio!)

**Textual:**
- ❌ Jargão excessivo
- ❌ Promessas impossíveis
- ❌ Comparações negativas diretas
- ❌ Linguagem excludente

**Comportamental:**
- ❌ Spam em comunidades
- ❌ Fake social proof
- ❌ Respostas automáticas/robóticas

---

## 📞 Contato Brand

**Para dúvidas sobre branding:**
- Email: brand@usedevkit.com
- Slack: #branding
- Responsável: Marketing Lead

---

**DevKit Brand Guidelines v1.0**
*Última atualização: Janeiro 2025*

Made with ❤️ in Brazil 🇧🇷
