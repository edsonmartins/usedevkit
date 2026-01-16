# ConfigHub Landing Page - Código Completo

## 📁 Estrutura

```
landing/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── Hero.tsx
│   ├── ProblemSolution.tsx
│   ├── Features.tsx
│   ├── HowItWorks.tsx
│   ├── CodeExamples.tsx
│   ├── UseCases.tsx
│   ├── Comparison.tsx
│   ├── OpenSource.tsx
│   ├── Testimonials.tsx
│   ├── Pricing.tsx
│   ├── FinalCTA.tsx
│   └── Footer.tsx
├── package.json
└── tailwind.config.ts
```

---

## 📦 package.json

```json
{
  "name": "confighub-landing",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "next": "^15.1.3",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "lucide-react": "^0.303.0",
    "framer-motion": "^11.0.3",
    "react-syntax-highlighter": "^15.5.0"
  },
  "devDependencies": {
    "@types/node": "^20.10.6",
    "@types/react": "^18.2.46",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.33",
    "tailwindcss": "^3.4.0",
    "typescript": "^5.3.3"
  }
}
```

---

## 🎨 app/layout.tsx

```tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ConfigHub - Gerenciamento de Configurações Open Source',
  description: 'Gerencie configurações e secrets com segurança enterprise. Open source, auto-hospedado, criptografia AES-256. Setup em 5 minutos.',
  keywords: ['config management', 'secrets management', 'open source', 'spring boot', 'vault alternative'],
  openGraph: {
    title: 'ConfigHub - Configurações Centralizadas',
    description: 'Solução open source para gerenciar configurações',
    images: ['/og-image.png'],
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
```

---

## 📄 app/page.tsx

```tsx
import Hero from '@/components/Hero';
import ProblemSolution from '@/components/ProblemSolution';
import Features from '@/components/Features';
import HowItWorks from '@/components/HowItWorks';
import CodeExamples from '@/components/CodeExamples';
import UseCases from '@/components/UseCases';
import Comparison from '@/components/Comparison';
import OpenSource from '@/components/OpenSource';
import Testimonials from '@/components/Testimonials';
import Pricing from '@/components/Pricing';
import FinalCTA from '@/components/FinalCTA';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Hero />
      <ProblemSolution />
      <Features />
      <HowItWorks />
      <CodeExamples />
      <UseCases />
      <Comparison />
      <OpenSource />
      <Testimonials />
      <Pricing />
      <FinalCTA />
      <Footer />
    </main>
  );
}
```

---

## 🎨 app/globals.css

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --foreground-rgb: 0, 0, 0;
  --background-start-rgb: 214, 219, 220;
  --background-end-rgb: 255, 255, 255;
}

@media (prefers-color-scheme: dark) {
  :root {
    --foreground-rgb: 255, 255, 255;
    --background-start-rgb: 0, 0, 0;
    --background-end-rgb: 0, 0, 0;
  }
}

body {
  color: rgb(var(--foreground-rgb));
}

@layer utilities {
  .text-balance {
    text-wrap: balance;
  }
}

/* Smooth scroll */
html {
  scroll-behavior: smooth;
}

/* Code block styles */
.code-block {
  @apply rounded-lg overflow-hidden;
}

/* Gradient text */
.gradient-text {
  @apply bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent;
}
```

---

## 🦸 components/Hero.tsx

```tsx
'use client';

import { motion } from 'framer-motion';
import { Star, Book, Rocket, Github } from 'lucide-react';
import Link from 'next/link';

export default function Hero() {
  return (
    <section className="relative overflow-hidden pt-20 pb-32 px-4">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-cyan-50 -z-10" />
      
      {/* Grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] -z-10" />

      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-8"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            100% Open Source • MIT License
          </motion.div>

          {/* Main headline */}
          <h1 className="text-5xl md:text-7xl font-bold text-slate-900 mb-6 leading-tight">
            Pare de Gerenciar
            <br />
            <span className="gradient-text">
              Configurações Manualmente
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-slate-600 mb-4 max-w-3xl mx-auto">
            ConfigHub centraliza seus secrets e configurações com{' '}
            <span className="font-semibold text-slate-900">segurança enterprise</span>
          </p>

          {/* Features list */}
          <div className="flex flex-wrap justify-center gap-4 text-sm text-slate-600 mb-12">
            <span className="flex items-center gap-1">
              ✅ Auto-hospedado
            </span>
            <span className="flex items-center gap-1">
              ✅ Criptografia AES-256
            </span>
            <span className="flex items-center gap-1">
              ✅ SDKs prontos
            </span>
            <span className="flex items-center gap-1">
              ✅ Setup em 5 minutos
            </span>
          </div>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Link
              href="https://github.com/confighub/confighub"
              target="_blank"
              className="group relative inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105"
            >
              <Star className="h-5 w-5" />
              Star no GitHub
              <span className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full">
                2.5k+
              </span>
            </Link>

            <Link
              href="/docs"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-slate-700 rounded-lg font-semibold text-lg border-2 border-slate-200 hover:border-blue-600 hover:text-blue-600 transition-all"
            >
              <Book className="h-5 w-5" />
              Ver Documentação
            </Link>

            <Link
              href="/quickstart"
              className="inline-flex items-center gap-2 px-8 py-4 text-slate-700 font-semibold hover:text-blue-600 transition-all"
            >
              <Rocket className="h-5 w-5" />
              Quick Start →
            </Link>
          </div>

          {/* Terminal preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="max-w-4xl mx-auto"
          >
            <div className="bg-slate-900 rounded-xl shadow-2xl overflow-hidden">
              {/* Terminal header */}
              <div className="flex items-center gap-2 px-4 py-3 bg-slate-800 border-b border-slate-700">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <span className="text-slate-400 text-sm ml-2">terminal</span>
              </div>

              {/* Terminal content */}
              <div className="p-6 font-mono text-sm">
                <div className="text-green-400">$ docker-compose up -d</div>
                <div className="text-slate-400 mt-2">
                  Creating confighub-postgres ... done
                  <br />
                  Creating confighub-backend ... done
                  <br />
                  Creating confighub-frontend ... done
                </div>
                <div className="text-green-400 mt-4">
                  $ confighub apps create vendax --envs dev,prod
                </div>
                <div className="text-blue-400 mt-2">✓ Application created successfully!</div>
                <div className="text-green-400 mt-4">
                  $ confighub config set vendax --env prod database.url "..."
                </div>
                <div className="text-blue-400 mt-2">✓ Configuration saved</div>
                <div className="text-slate-400 mt-6">
                  <span className="text-slate-500">// Pronto! ConfigHub rodando 🚀</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto"
          >
            <div>
              <div className="text-3xl font-bold text-slate-900">2.5k+</div>
              <div className="text-sm text-slate-600">GitHub Stars</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-slate-900">10k+</div>
              <div className="text-sm text-slate-600">Downloads</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-slate-900">500+</div>
              <div className="text-sm text-slate-600">Devs Brasileiros</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-slate-900">100+</div>
              <div className="text-sm text-slate-600">Empresas</div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
```

---

## ❌ components/ProblemSolution.tsx

```tsx
'use client';

import { motion } from 'framer-motion';
import { X, Check } from 'lucide-react';

const problems = [
  'Arquivos .env espalhados por todo lado',
  'Senhas vazadas no Git (de novo!)',
  '"Funciona na minha máquina"',
  'Configurações desatualizadas em produção',
  'Zero auditoria de mudanças',
  'Onboarding de devs leva horas',
];

const solutions = [
  'Configurações centralizadas e criptografadas',
  'Auditoria completa de todas as mudanças',
  'Multi-ambiente (dev, staging, prod)',
  'Onboarding instantâneo com CLI',
  'Versionamento automático',
  'Interface web moderna',
];

export default function ProblemSolution() {
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
            Você Conhece Esse Pesadelo?
          </h2>
          <p className="text-xl text-slate-600">
            Gerenciar configurações não precisa ser complicado
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Problems */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="bg-red-50 rounded-2xl p-8 border-2 border-red-100">
              <h3 className="text-2xl font-bold text-red-900 mb-6 flex items-center gap-2">
                <X className="h-6 w-6" />
                O Problema
              </h3>
              <ul className="space-y-4">
                {problems.map((problem, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <X className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-700">{problem}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Solutions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="bg-green-50 rounded-2xl p-8 border-2 border-green-100">
              <h3 className="text-2xl font-bold text-green-900 mb-6 flex items-center gap-2">
                <Check className="h-6 w-6" />
                A Solução
              </h3>
              <ul className="space-y-4">
                {solutions.map((solution, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-700">{solution}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
```

---

## ✨ components/Features.tsx

```tsx
'use client';

import { motion } from 'framer-motion';
import {
  Lock,
  Zap,
  Code2,
  Globe,
  LayoutDashboard,
  Wrench,
  FileText,
  GitBranch,
  MapPin,
} from 'lucide-react';

const features = [
  {
    icon: Lock,
    title: 'Segurança Enterprise',
    description: 'Criptografia AES-256-GCM, TLS/SSL, RBAC granular e auditoria completa',
    color: 'blue',
  },
  {
    icon: Zap,
    title: 'Setup Rápido',
    description: 'Docker Compose incluído, Kubernetes ready, 5 minutos do clone ao deploy',
    color: 'yellow',
  },
  {
    icon: Code2,
    title: 'SDKs Nativos',
    description: 'Java/Spring Boot, TypeScript/JavaScript, Flutter/Dart, CLI em Rust',
    color: 'purple',
  },
  {
    icon: Globe,
    title: 'Multi-Ambiente',
    description: 'Dev, Staging, Production com herança e rollback instantâneo',
    color: 'green',
  },
  {
    icon: LayoutDashboard,
    title: 'Interface Moderna',
    description: 'Next.js 16 + React, design intuitivo, dark mode, mobile responsive',
    color: 'pink',
  },
  {
    icon: Wrench,
    title: 'Developer Experience',
    description: 'Auto-complete no CLI, type-safe clients, hot reload configs',
    color: 'orange',
  },
  {
    icon: FileText,
    title: 'Auditoria Total',
    description: 'Quem mudou o quê e quando, logs imutáveis, compliance ready',
    color: 'indigo',
  },
  {
    icon: GitBranch,
    title: 'Versionamento',
    description: 'Todas as mudanças versionadas, rollback com 1 comando, histórico completo',
    color: 'cyan',
  },
  {
    icon: MapPin,
    title: 'Feito no Brasil',
    description: 'Documentação em português, suporte da comunidade BR, cases brasileiros',
    color: 'green',
  },
];

export default function Features() {
  return (
    <section className="py-24 px-4 bg-slate-50">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Tudo que Você Precisa
          </h2>
          <p className="text-xl text-slate-600">
            Features enterprise em uma solução open source
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1"
            >
              <div className={`w-12 h-12 rounded-lg bg-${feature.color}-100 flex items-center justify-center mb-4`}>
                <feature.icon className={`h-6 w-6 text-${feature.color}-600`} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-slate-600">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

---

Devido ao limite de caracteres, vou criar um arquivo separado com os componentes restantes (HowItWorks, CodeExamples, etc).

Quer que eu continue com os demais componentes da landing page?
