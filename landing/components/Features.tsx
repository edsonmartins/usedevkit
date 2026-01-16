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
    description: 'Criptografia AES-256-GCM, TLS/SSL, RBAC granular',
    command: 'devkit encrypt',
    color: 'blue',
  },
  {
    icon: Zap,
    title: 'Setup Rápido',
    description: 'Docker Compose incluído, 5 minutos do clone ao deploy',
    command: 'docker-compose up',
    color: 'yellow',
  },
  {
    icon: Code2,
    title: 'SDKs Nativos',
    description: 'Java, TypeScript, Flutter, CLI em Rust',
    command: 'npm install @devkit/sdk',
    color: 'purple',
  },
  {
    icon: Globe,
    title: 'Multi-Ambiente',
    description: 'Dev, Staging, Production com herança e rollback',
    command: '--env prod',
    color: 'green',
  },
  {
    icon: LayoutDashboard,
    title: 'Interface Moderna',
    description: 'Next.js + React, dark mode, mobile responsive',
    command: 'localhost:3000',
    color: 'pink',
  },
  {
    icon: Wrench,
    title: 'Developer Experience',
    description: 'Auto-complete CLI, type-safe clients, hot reload',
    command: 'devkit --help',
    color: 'orange',
  },
  {
    icon: FileText,
    title: 'Auditoria Total',
    description: 'Quem mudou o quê e quando, logs imutáveis',
    command: 'devkit audit',
    color: 'indigo',
  },
  {
    icon: GitBranch,
    title: 'Versionamento',
    description: 'Rollback com 1 comando, diff entre versões',
    command: 'devkit rollback',
    color: 'cyan',
  },
  {
    icon: MapPin,
    title: 'Feito no Brasil',
    description: 'Documentação em português, comunidade BR ativa',
    command: '🇧🇷',
    color: 'green',
  },
];

const colorMap = {
  blue: 'text-terminal-blue',
  yellow: 'text-terminal-yellow',
  purple: 'text-terminal-purple',
  green: 'text-terminal-green',
  pink: 'text-pink-400',
  orange: 'text-terminal-coral',
  indigo: 'text-indigo-400',
  cyan: 'text-cyan-400',
};

export default function Features() {
  return (
    <section id="features" className="relative py-32 px-4 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-terminal-bg" />
      <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-10" />

      {/* Glow effect */}
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-glow-green opacity-20 blur-3xl" />

      <div className="relative max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Tudo que Você
            <span className="text-terminal-green glow-green"> Precisa</span>
          </h2>

          <p className="text-xl text-terminal-dim max-w-2xl mx-auto">
            Features enterprise em uma solução open source
          </p>

          {/* Command line decoration */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-8 inline-flex items-center gap-4 px-6 py-3 bg-terminal-surface border border-terminal-border rounded-lg"
          >
            <span className="text-terminal-green">$</span>
            <span className="text-terminal-text">devkit features --all</span>
            <span className="text-terminal-dim"># 9 features enabled</span>
          </motion.div>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="group relative"
            >
              {/* Card */}
              <div className="relative h-full bg-terminal-surface border border-terminal-border rounded-lg p-6 transition-all duration-300 group-hover:border-terminal-green/50">
                {/* Icon */}
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded bg-terminal-bg border border-terminal-border flex items-center justify-center group-hover:border-${feature.color}-500 transition-colors`}>
                    <feature.icon className={`w-6 h-6 ${colorMap[feature.color as keyof typeof colorMap]}`} />
                  </div>
                  <code className="text-xs text-terminal-dim font-mono">
                    {feature.command}
                  </code>
                </div>

                {/* Content */}
                <h3 className="font-display text-lg font-bold text-terminal-text mb-2 group-hover:text-terminal-green transition-colors">
                  {feature.title}
                </h3>
                <p className="text-terminal-dim text-sm leading-relaxed">
                  {feature.description}
                </p>

                {/* Decorative corner */}
                <div className="absolute top-0 right-0 w-8 h-8 overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-terminal-green/10 to-transparent transform rotate-45 translate-x-8 -translate-y-8 group-hover:from-terminal-green/20 transition-all" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom statement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 text-center"
        >
          <div className="inline-block px-6 py-3 bg-terminal-surface border border-terminal-border rounded-lg">
            <span className="text-terminal-dim">E mais:</span>
            <span className="text-terminal-green ml-2">Feature Flags • Dynamic Config • Webhooks</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
