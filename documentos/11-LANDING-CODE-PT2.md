# ConfigHub Landing Page - Componentes (Parte 2)

## 🔄 components/HowItWorks.tsx

```tsx
'use client';

import { motion } from 'framer-motion';

const steps = [
  {
    number: '01',
    title: 'Deploy',
    code: `git clone https://github.com/confighub/confighub
docker-compose up -d
# Pronto! ConfigHub em http://localhost:3000`,
  },
  {
    number: '02',
    title: 'Criar Aplicação',
    code: `confighub apps create my-app --envs dev,prod
confighub config set my-app --env prod \\
  database.url "postgresql://..."`,
  },
  {
    number: '03',
    title: 'Usar no Código',
    code: `// Java
String dbUrl = configHub.getConfig(
  "my-app", "prod", "database.url"
);`,
  },
];

export default function HowItWorks() {
  return (
    <section className="py-24 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Como Funciona
          </h2>
          <p className="text-xl text-slate-600">
            3 passos simples para começar
          </p>
        </motion.div>

        <div className="space-y-12">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex flex-col md:flex-row gap-8 items-center"
            >
              <div className="md:w-1/3">
                <div className="text-6xl font-bold text-blue-100 mb-4">
                  {step.number}
                </div>
                <h3 className="text-2xl font-bold text-slate-900">
                  {step.title}
                </h3>
              </div>
              <div className="md:w-2/3">
                <div className="bg-slate-900 rounded-lg p-6 font-mono text-sm text-green-400 overflow-x-auto">
                  <pre>{step.code}</pre>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

---

## 💻 components/CodeExamples.tsx

```tsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const examples = {
  java: {
    lang: 'Java/Spring Boot',
    code: `@Service
public class MyService {
    private final ConfigHubClient configHub;
    
    public void doSomething() {
        String apiKey = configHub.getConfig(
            "my-app", "prod", "api.key"
        );
        // Use apiKey...
    }
}`,
  },
  typescript: {
    lang: 'TypeScript/Node.js',
    code: `const client = new ConfigHubClient({
  baseUrl: 'https://config.company.com',
  apiKey: process.env.CONFIGHUB_API_KEY,
});

const apiKey = await client.getConfig(
  'my-app', 'prod', 'api.key'
);`,
  },
  flutter: {
    lang: 'Flutter/Dart',
    code: `final client = ConfigHubClient(
  ConfigHubOptions(
    baseUrl: 'https://config.company.com',
    apiKey: Platform.environment['CONFIGHUB_API_KEY']!,
  ),
);

final apiKey = await client.getConfig(
  'my-app', 'prod', 'api.key'
);`,
  },
  cli: {
    lang: 'CLI',
    code: `# Pull todas as configs
confighub pull my-app --env prod

# Export como variáveis de ambiente
export $(confighub export my-app --env prod)

# Auditoria
confighub audit --app my-app --days 30`,
  },
};

export default function CodeExamples() {
  const [activeTab, setActiveTab] = useState<keyof typeof examples>('java');

  return (
    <section className="py-24 px-4 bg-slate-50">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Exemplos de Código
          </h2>
          <p className="text-xl text-slate-600">
            Escolha sua linguagem favorita
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {Object.entries(examples).map(([key, { lang }]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as keyof typeof examples)}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === key
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white text-slate-700 hover:bg-slate-100'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>

        {/* Code display */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl overflow-hidden shadow-2xl"
        >
          <SyntaxHighlighter
            language={activeTab === 'cli' ? 'bash' : activeTab === 'flutter' ? 'dart' : activeTab}
            style={vscDarkPlus}
            customStyle={{
              padding: '2rem',
              fontSize: '0.95rem',
              margin: 0,
            }}
          >
            {examples[activeTab].code}
          </SyntaxHighlighter>
        </motion.div>
      </div>
    </section>
  );
}
```

---

## 📊 components/Comparison.tsx

```tsx
'use client';

import { motion } from 'framer-motion';
import { Check, X, Minus } from 'lucide-react';

const data = [
  {
    feature: 'Preço',
    confighub: { type: 'good', text: '🆓 Grátis' },
    vault: { type: 'bad', text: '💰💰💰' },
    spring: { type: 'good', text: '🆓 Grátis' },
    doppler: { type: 'medium', text: '💰 Pago' },
  },
  {
    feature: 'Setup',
    confighub: { type: 'good', text: '⚡ 5 min' },
    vault: { type: 'bad', text: '🐌 Horas' },
    spring: { type: 'medium', text: '🟡 30 min' },
    doppler: { type: 'good', text: '⚡ 5 min' },
  },
  {
    feature: 'Interface',
    confighub: { type: 'good', text: 'Moderna' },
    vault: { type: 'medium', text: 'Básica' },
    spring: { type: 'bad', text: 'CLI only' },
    doppler: { type: 'good', text: 'Boa' },
  },
  {
    feature: 'Self-hosted',
    confighub: { type: 'good', text: 'Sim' },
    vault: { type: 'good', text: 'Sim' },
    spring: { type: 'good', text: 'Sim' },
    doppler: { type: 'bad', text: 'Não' },
  },
  {
    feature: 'Auditoria',
    confighub: { type: 'good', text: 'Completa' },
    vault: { type: 'good', text: 'Completa' },
    spring: { type: 'medium', text: 'Básica' },
    doppler: { type: 'good', text: 'Completa' },
  },
  {
    feature: 'Docs PT-BR',
    confighub: { type: 'good', text: 'Sim' },
    vault: { type: 'bad', text: 'Não' },
    spring: { type: 'bad', text: 'Não' },
    doppler: { type: 'bad', text: 'Não' },
  },
];

const Icon = ({ type }: { type: 'good' | 'medium' | 'bad' }) => {
  if (type === 'good') return <Check className="h-5 w-5 text-green-500" />;
  if (type === 'bad') return <X className="h-5 w-5 text-red-500" />;
  return <Minus className="h-5 w-5 text-yellow-500" />;
};

export default function Comparison() {
  return (
    <section className="py-24 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Por Que ConfigHub?
          </h2>
          <p className="text-xl text-slate-600">
            Comparação honesta com as alternativas
          </p>
        </motion.div>

        <div className="overflow-x-auto">
          <table className="w-full bg-white rounded-xl shadow-lg overflow-hidden">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                  Feature
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-blue-600 bg-blue-50">
                  ConfigHub
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-slate-600">
                  Vault
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-slate-600">
                  Spring Cloud
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-slate-600">
                  Doppler
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, index) => (
                <tr
                  key={index}
                  className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                >
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">
                    {row.feature}
                  </td>
                  <td className="px-6 py-4 text-center bg-blue-50">
                    <div className="flex items-center justify-center gap-2">
                      <Icon type={row.confighub.type} />
                      <span className="text-sm text-slate-900">
                        {row.confighub.text}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Icon type={row.vault.type} />
                      <span className="text-sm text-slate-700">
                        {row.vault.text}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Icon type={row.spring.type} />
                      <span className="text-sm text-slate-700">
                        {row.spring.text}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Icon type={row.doppler.type} />
                      <span className="text-sm text-slate-700">
                        {row.doppler.text}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
```

---

## 💎 components/Pricing.tsx

```tsx
'use client';

import { motion } from 'framer-motion';
import { Check, Star } from 'lucide-react';
import Link from 'next/link';

const features = [
  'Todas as features',
  'Updates gratuitos',
  'Comunidade ativa',
  'Sem limites',
  'Uso comercial OK',
  'Auto-hospedado',
  'Código-fonte incluído',
  'MIT License',
];

export default function Pricing() {
  return (
    <section className="py-24 px-4 bg-gradient-to-br from-blue-50 to-cyan-50">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Quanto Custa?
          </h2>
          <p className="text-xl text-slate-600">
            Spoiler: Nada. É 100% gratuito.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-white rounded-3xl shadow-2xl overflow-hidden border-4 border-blue-500"
        >
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-8 px-8 text-center">
            <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-2 mb-4">
              <Star className="h-4 w-4" />
              <span className="text-sm font-medium">Open Source</span>
            </div>
            <h3 className="text-4xl font-bold mb-2">100% Grátis</h3>
            <p className="text-lg text-blue-100">Para sempre. Sem pegadinhas.</p>
          </div>

          <div className="p-8">
            <ul className="space-y-4 mb-8">
              {features.map((feature, index) => (
                <li key={index} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <Check className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-slate-700">{feature}</span>
                </li>
              ))}
            </ul>

            <Link
              href="https://github.com/confighub/confighub"
              className="block w-full text-center py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold text-lg hover:shadow-lg transition-all hover:scale-105"
            >
              ⭐ Começar Agora - É Grátis!
            </Link>

            <p className="text-center text-sm text-slate-500 mt-6">
              MIT License • Sem restrições • Sem surpresas
            </p>
          </div>
        </motion.div>

        {/* Enterprise support */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 text-center bg-white rounded-xl p-8 shadow-lg"
        >
          <h4 className="text-xl font-bold text-slate-900 mb-2">
            Precisa de Suporte Enterprise?
          </h4>
          <p className="text-slate-600 mb-4">
            Oferecemos consultoria, SLA garantido e features customizadas
          </p>
          <Link
            href="/enterprise"
            className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700"
          >
            Falar com a equipe →
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
```

---

## 🚀 components/FinalCTA.tsx

```tsx
'use client';

import { motion } from 'framer-motion';
import { Star, Book, MessageCircle, Rocket } from 'lucide-react';
import Link from 'next/link';

export default function FinalCTA() {
  return (
    <section className="py-24 px-4 bg-gradient-to-br from-slate-900 to-blue-900 text-white">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Pronto para Tomar Controle
            <br />
            das Suas Configurações?
          </h2>
          <p className="text-xl text-blue-200 mb-12">
            Junte-se a centenas de desenvolvedores que já simplificaram seu workflow
          </p>

          <div className="grid sm:grid-cols-2 gap-6 mb-12">
            <Link
              href="https://github.com/confighub/confighub"
              target="_blank"
              className="group bg-white text-slate-900 rounded-xl p-6 hover:shadow-2xl transition-all hover:scale-105"
            >
              <Star className="h-8 w-8 text-yellow-500 mb-3 mx-auto" />
              <h3 className="font-bold text-lg mb-2">⭐ Star no GitHub</h3>
              <p className="text-sm text-slate-600">
                Ajude o projeto e fique por dentro das atualizações
              </p>
              <div className="mt-4 text-blue-600 font-semibold">
                2.5k+ stars →
              </div>
            </Link>

            <Link
              href="/docs"
              className="group bg-blue-800 rounded-xl p-6 hover:bg-blue-700 transition-all hover:scale-105"
            >
              <Book className="h-8 w-8 mb-3 mx-auto" />
              <h3 className="font-bold text-lg mb-2">📖 Documentação</h3>
              <p className="text-sm text-blue-200">
                Guias completos, exemplos e referência da API
              </p>
              <div className="mt-4 font-semibold">
                Ler agora →
              </div>
            </Link>

            <Link
              href="https://discord.gg/confighub"
              className="group bg-blue-800 rounded-xl p-6 hover:bg-blue-700 transition-all hover:scale-105"
            >
              <MessageCircle className="h-8 w-8 mb-3 mx-auto" />
              <h3 className="font-bold text-lg mb-2">💬 Discord Community</h3>
              <p className="text-sm text-blue-200">
                Tire dúvidas, compartilhe ideias e conheça outros devs
              </p>
              <div className="mt-4 font-semibold">
                Entrar agora →
              </div>
            </Link>

            <Link
              href="/quickstart"
              className="group bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl p-6 hover:shadow-2xl transition-all hover:scale-105"
            >
              <Rocket className="h-8 w-8 mb-3 mx-auto" />
              <h3 className="font-bold text-lg mb-2">🚀 Deploy Agora</h3>
              <p className="text-sm text-blue-100">
                5 minutos para ter o ConfigHub rodando
              </p>
              <div className="mt-4 font-semibold">
                Quick Start →
              </div>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 border-t border-blue-800 pt-8">
            <div>
              <div className="text-3xl font-bold text-cyan-400">2.5k+</div>
              <div className="text-sm text-blue-300">GitHub Stars</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-cyan-400">10k+</div>
              <div className="text-sm text-blue-300">Downloads</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-cyan-400">500+</div>
              <div className="text-sm text-blue-300">Devs BR</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-cyan-400">100+</div>
              <div className="text-sm text-blue-300">Empresas</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
```

---

## 📝 components/Footer.tsx

```tsx
import Link from 'next/link';
import { Github, Twitter, MessageCircle } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-bold text-white mb-4">ConfigHub</h3>
            <p className="text-sm mb-4">
              Gerenciamento de configurações open source para equipes modernas.
            </p>
            <div className="flex gap-4">
              <Link
                href="https://github.com/confighub/confighub"
                className="hover:text-white transition-colors"
              >
                <Github className="h-5 w-5" />
              </Link>
              <Link
                href="https://twitter.com/confighub"
                className="hover:text-white transition-colors"
              >
                <Twitter className="h-5 w-5" />
              </Link>
              <Link
                href="https://discord.gg/confighub"
                className="hover:text-white transition-colors"
              >
                <MessageCircle className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold text-white mb-4">Produto</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/features" className="hover:text-white">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/docs" className="hover:text-white">
                  Documentação
                </Link>
              </li>
              <li>
                <Link href="/roadmap" className="hover:text-white">
                  Roadmap
                </Link>
              </li>
              <li>
                <Link href="/changelog" className="hover:text-white">
                  Changelog
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold text-white mb-4">Recursos</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/quickstart" className="hover:text-white">
                  Quick Start
                </Link>
              </li>
              <li>
                <Link href="/examples" className="hover:text-white">
                  Exemplos
                </Link>
              </li>
              <li>
                <Link href="/api" className="hover:text-white">
                  API Reference
                </Link>
              </li>
              <li>
                <Link href="/sdks" className="hover:text-white">
                  SDKs
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-white mb-4">Empresa</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="hover:text-white">
                  Sobre
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white">
                  Contato
                </Link>
              </li>
              <li>
                <Link href="/enterprise" className="hover:text-white">
                  Enterprise
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white">
                  Privacidade
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center text-sm">
          <p>© 2025 ConfigHub. MIT Licensed.</p>
          <p className="text-slate-500">
            Made with ☕ in Brazil 🇧🇷
          </p>
        </div>
      </div>
    </footer>
  );
}
```

---

## 🎯 Próximos Passos

1. **Instalar dependências:**
   ```bash
   npm install
   ```

2. **Rodar em desenvolvimento:**
   ```bash
   npm run dev
   ```

3. **Build para produção:**
   ```bash
   npm run build
   npm start
   ```

4. **Deploy:**
   - Vercel (recomendado para Next.js)
   - Netlify
   - Self-hosted

---

**Resultado:** Landing page completa, moderna e otimizada para conversão!
