'use client';

import { motion } from 'framer-motion';
import { Check, Infinity, Heart, Code } from 'lucide-react';

export default function Pricing() {
  return (
    <section className="relative py-32 px-4 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-terminal-bg" />
      <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-10" />

      {/* Glow effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-glow-green opacity-20 blur-3xl" />

      <div className="relative max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            100%
            <span className="text-terminal-green glow-green"> Gratuito</span>
          </h2>

          <p className="text-xl text-terminal-dim">
            Sem limites. Sem cartão de crédito. Sem pegadinhas.
          </p>
        </motion.div>

        {/* Pricing Card */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          {/* Glow border */}
          <div className="absolute -inset-1 bg-gradient-to-br from-terminal-green via-terminal-blue to-terminal-coral rounded-xl blur-sm opacity-50 animate-pulse" />

          <div className="relative bg-terminal-surface border border-terminal-green/30 rounded-xl p-8 md:p-12">
            {/* Badge */}
            <div className="flex justify-center mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-terminal-green/10 border border-terminal-green/30 rounded-full text-terminal-green text-sm font-semibold">
                <Infinity className="w-4 h-4" />
                Open Source Forever
              </div>
            </div>

            {/* Price */}
            <div className="text-center mb-8">
              <div className="font-display text-6xl md:text-7xl font-bold text-terminal-green glow-green mb-2">
                $0
              </div>
              <div className="text-terminal-dim">para sempre</div>
            </div>

            {/* Features */}
            <div className="grid md:grid-cols-2 gap-4 mb-8 max-w-2xl mx-auto">
              {[
                { icon: Check, text: 'Todas as features incluídas' },
                { icon: Check, text: 'Updates gratuitos para sempre' },
                { icon: Check, text: 'Comunidade ativa no Discord' },
                { icon: Check, text: 'Sem limites de uso' },
                { icon: Check, text: 'Uso comercial permitido' },
                { icon: Check, text: 'MIT License' },
                { icon: Code, text: 'Código fonte aberto' },
                { icon: Heart, text: 'Feito com 💚 pela comunidade' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <item.icon className={`w-5 h-5 ${item.icon === Check ? 'text-terminal-green' : 'text-terminal-blue'}`} />
                  <span className="text-terminal-text">{item.text}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="text-center">
              <a
                href="https://github.com/edsonmartins/usedevkit"
                target="_blank"
                className="inline-flex items-center gap-3 px-8 py-4 bg-terminal-green text-terminal-bg font-bold text-lg rounded hover:scale-105 transition-transform"
              >
                Começar Gratuitamente →
              </a>
            </div>
          </div>
        </motion.div>

        {/* Enterprise note */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <p className="text-terminal-dim text-sm">
            Precisa de suporte enterprise?{' '}
            <a href="mailto:enterprise@usedevkit.com" className="text-terminal-green hover:underline">
              Entre em contato
            </a>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
