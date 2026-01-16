'use client';

import { motion } from 'framer-motion';
import { Star, Book, Rocket, Terminal, Shield, Zap } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const terminalLines = [
  { cmd: '$ docker-compose up -d', delay: 100 },
  { output: 'Creating network "devkit_default"', delay: 300 },
  { output: 'Creating devkit-postgres ... done', delay: 500 },
  { output: 'Creating devkit-backend  ... done', delay: 700 },
  { output: 'Creating devkit-frontend ... done', delay: 900 },
  { cmd: '$ devkit apps create vendax --envs dev,prod', delay: 1500 },
  { output: '✓ Application created successfully!', delay: 1800, color: 'text-terminal-green' },
  { cmd: '$ devkit config set vendax --env prod database.url "postgresql://..."', delay: 2300 },
  { output: '✓ Configuration encrypted and saved', delay: 2600, color: 'text-terminal-green' },
  { output: '// DevKit rodando em http://localhost:3000 🚀', delay: 3100, color: 'text-terminal-dim' },
];

export default function Hero() {
  const [visibleLines, setVisibleLines] = useState<number[]>([]);

  useEffect(() => {
    terminalLines.forEach((line, index) => {
      const timeout = setTimeout(() => {
        setVisibleLines((prev) => [...prev, index]);
      }, line.delay);
      return () => clearTimeout(timeout);
    });
  }, []);

  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-20" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-glow-green opacity-30 blur-3xl" />

      {/* Floating code snippets decoration */}
      <motion.div
        animate={{ y: [0, -20, 0], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-20 left-10 hidden lg:block font-mono text-xs text-terminal-dim"
      >
        {'const config = {'}
        <br />
        {'  apiKey: process.env.API_KEY'}
        <br />
        {'}'}
      </motion.div>

      <motion.div
        animate={{ y: [0, 20, 0], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-40 right-10 hidden lg:block font-mono text-xs text-terminal-dim text-right"
      >
        {'export DATABASE_URL'}
        <br />
        {'="postgresql://..."'}
      </motion.div>

      <div className="relative max-w-7xl mx-auto px-4 pt-20 pb-32">
        {/* Header */}
        <motion.nav
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-20"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-terminal-surface border border-terminal-border rounded-lg flex items-center justify-center">
              <Terminal className="w-5 h-5 text-terminal-green" />
            </div>
            <span className="font-display font-bold text-xl">DevKit</span>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <Link href="#features" className="text-terminal-dim hover:text-terminal-text hover-underline">
              Features
            </Link>
            <Link href="#docs" className="text-terminal-dim hover:text-terminal-text hover-underline">
              Docs
            </Link>
            <Link
              href="https://github.com/devkit/devkit"
              target="_blank"
              className="flex items-center gap-2 px-4 py-2 bg-terminal-surface border border-terminal-border rounded hover:border-terminal-green transition-all"
            >
              <Star className="w-4 h-4" />
              <span>GitHub</span>
            </Link>
          </div>
        </motion.nav>

        {/* Main content */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-terminal-surface border border-terminal-border rounded-full text-sm mb-8"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-terminal-green opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-terminal-green"></span>
              </span>
              <span className="text-terminal-dim">100% Open Source</span>
              <span className="text-terminal-border">•</span>
              <span className="text-terminal-green">MIT License</span>
            </motion.div>

            {/* Headline */}
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6">
              Pare de Gerenciar
              <br />
              <span className="text-terminal-green glow-green">Configurações</span>
              <br />
              Manualmente
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-xl text-terminal-dim mb-8 max-w-lg">
              Centralize seus secrets e configurações com segurança enterprise.
              <span className="text-terminal-text"> Setup em minutos, não em horas.</span>
            </p>

            {/* Features pills */}
            <div className="flex flex-wrap gap-3 mb-10">
              {[
                { icon: Shield, text: 'AES-256' },
                { icon: Zap, text: '5 min setup' },
                { icon: Terminal, text: 'CLI Rust' },
              ].map((feature, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-terminal-surface border border-terminal-border rounded text-sm"
                >
                  <feature.icon className="w-4 h-4 text-terminal-green" />
                  <span>{feature.text}</span>
                </motion.span>
              ))}
            </div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link
                href="https://github.com/devkit/devkit"
                target="_blank"
                className="btn-primary group"
              >
                <Star className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                Star no GitHub
                <span className="absolute -top-2 -right-2 bg-terminal-coral text-white text-xs font-bold px-2 py-0.5 rounded">
                  2.5k+
                </span>
              </Link>

              <Link href="/docs" className="btn-secondary">
                <Book className="w-5 h-5" />
                Documentação
              </Link>

              <Link
                href="#quickstart"
                className="inline-flex items-center gap-2 px-6 py-3 text-terminal-text hover:text-terminal-green transition-colors font-semibold"
              >
                <Rocket className="w-5 h-5" />
                Quick Start →
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="grid grid-cols-4 gap-6 mt-16 pt-8 border-t border-terminal-border"
            >
              {[
                { value: '2.5k+', label: 'Stars' },
                { value: '10k+', label: 'Downloads' },
                { value: '500+', label: 'Devs BR' },
                { value: '100+', label: 'Empresas' },
              ].map((stat, i) => (
                <div key={i}>
                  <div className="stat-value">{stat.value}</div>
                  <div className="text-sm text-terminal-dim mt-1">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right side - Terminal */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="terminal-window">
              <div className="terminal-header">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-terminal-coral" />
                  <div className="w-3 h-3 rounded-full bg-terminal-yellow" />
                  <div className="w-3 h-3 rounded-full bg-terminal-green" />
                </div>
                <span className="text-terminal-dim text-sm ml-2">~/devkit</span>
              </div>

              <div className="p-6 font-mono text-sm min-h-[400px]">
                {terminalLines.map((line, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={visibleLines.includes(index) ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.3 }}
                    className={`mb-2 ${line.color || (line.cmd ? 'text-terminal-text' : 'text-terminal-dim')}`}
                  >
                    {line.cmd && (
                      <span>
                        <span className="text-terminal-green">→</span> {line.cmd}
                      </span>
                    )}
                    {line.output && <span className="pl-2">{line.output}</span>}
                  </motion.div>
                ))}

                {/* Blinking cursor */}
                <motion.span
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="inline-block w-2 h-4 bg-terminal-green ml-1 align-middle"
                />
              </div>
            </div>

            {/* Decorative elements */}
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -bottom-4 -right-4 w-24 h-24 bg-terminal-surface border border-terminal-border rounded flex items-center justify-center"
            >
              <div className="text-center">
                  <div className="text-2xl">🇧🇷</div>
                <div className="text-xs text-terminal-dim mt-1">DevKit</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-terminal-dim"
      >
        <span className="text-xs">Scroll to explore</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
        </motion.div>
      </motion.div>
    </section>
  );
}
