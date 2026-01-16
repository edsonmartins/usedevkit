'use client';

import { motion } from 'framer-motion';
import { Star, Book, MessageCircle, Rocket, Github } from 'lucide-react';
import Link from 'next/link';

const stats = [
  { value: '2.5k+', label: 'GitHub Stars' },
  { value: '10k+', label: 'Downloads' },
  { value: '500+', label: 'Devs BR' },
  { value: '100+', label: 'Empresas' },
];

const ctas = [
  {
    icon: Star,
    title: 'Star no GitHub',
    description: 'Mostre seu apoio e ajude o projeto crescer',
    href: 'https://github.com/devkit/devkit',
    primary: true,
  },
  {
    icon: Book,
    title: 'Ler Documentação',
    description: 'Guia completo de instalação e uso',
    href: '/docs',
    primary: false,
  },
  {
    icon: MessageCircle,
    title: 'Discord Community',
    description: 'Tire dúvidas e converse com a comunidade',
    href: 'https://discord.gg/devkit',
    primary: false,
  },
  {
    icon: Rocket,
    title: 'Quick Start',
    description: 'Configure em 5 minutos',
    href: '#quickstart',
    primary: false,
  },
];

export default function FinalCTA() {
  return (
    <section className="relative py-32 px-4 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-terminal-bg to-terminal-surface" />
      <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-5" />

      {/* Animated glow */}
      <motion.div
        animate={{
          opacity: [0.2, 0.4, 0.2],
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-glow-green blur-3xl"
      />

      <div className="relative max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Pronto para assumir o
            <span className="text-terminal-green glow-green"> controle?</span>
          </h2>

          <p className="text-xl text-terminal-dim max-w-2xl mx-auto">
            Junte-se a centenas de desenvolvedores que já simplificaram suas configurações
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16 max-w-3xl mx-auto"
        >
          {stats.map((stat, i) => (
            <div key={i} className="text-center">
              <div className="font-display text-4xl md:text-5xl font-bold text-terminal-green glow-green">
                {stat.value}
              </div>
              <div className="text-sm text-terminal-dim mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* CTA Cards */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-12">
          {ctas.map((cta, i) => (
            <motion.a
              key={i}
              href={cta.href}
              target={cta.href.startsWith('http') ? '_blank' : undefined}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`relative p-6 rounded-lg border transition-all duration-300 group ${
                cta.primary
                  ? 'bg-terminal-green/10 border-terminal-green hover:bg-terminal-green/20'
                  : 'bg-terminal-surface border-terminal-border hover:border-terminal-green/50'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg ${cta.primary ? 'bg-terminal-green text-terminal-bg' : 'bg-terminal-bg border border-terminal-border'}`}>
                  <cta.icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className={`font-display font-bold text-lg mb-1 ${cta.primary ? 'text-terminal-green' : 'text-terminal-text group-hover:text-terminal-green transition-colors'}`}>
                    {cta.title}
                  </h3>
                  <p className="text-terminal-dim text-sm">{cta.description}</p>
                </div>
              </div>
            </motion.a>
          ))}
        </div>

        {/* Final message */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-terminal-surface border border-terminal-border rounded-full">
            <span className="text-terminal-dim">Made with</span>
            <span className="text-terminal-coral">❤️</span>
            <span className="text-terminal-dim">in Brazil</span>
            <span className="text-xl">🇧🇷</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
