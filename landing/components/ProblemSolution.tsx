'use client';

import { motion } from 'framer-motion';
import { X, Check, AlertTriangle } from 'lucide-react';

const problems = [
  { text: 'Arquivos .env espalhados por todo lado', icon: 'file' },
  { text: 'Senhas vazadas no Git (de novo!)', icon: 'leak' },
  { text: '"Funciona na minha máquina"', icon: 'machine' },
  { text: 'Configurações desatualizadas em produção', icon: 'sync' },
  { text: 'Zero auditoria de mudanças', icon: 'audit' },
  { text: 'Onboarding de devs leva horas', icon: 'time' },
];

const solutions = [
  { text: 'Configurações centralizadas e criptografadas', icon: 'central' },
  { text: 'Auditoria completa de todas as mudanças', icon: 'audit-full' },
  { text: 'Multi-ambiente (dev, staging, prod)', icon: 'env' },
  { text: 'Onboarding instantâneo com CLI', icon: 'cli' },
  { text: 'Versionamento automático', icon: 'version' },
  { text: 'Interface web moderna', icon: 'ui' },
];

export default function ProblemSolution() {
  return (
    <section className="relative py-32 px-4 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-10" />
      <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-glow-coral opacity-10 blur-3xl -translate-y-1/2" />

      <div className="relative max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-terminal-surface border border-terminal-border rounded-full text-sm mb-6">
            <AlertTriangle className="w-4 h-4 text-terminal-coral" />
            <span className="text-terminal-dim">O Problema Real</span>
          </div>

          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Você Conhece Esse
            <span className="text-terminal-coral glow-coral"> Pesadelo?</span>
          </h2>

          <p className="text-xl text-terminal-dim max-w-2xl mx-auto">
            Gerenciar configurações não precisa ser complicado
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Problems */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="relative h-full">
              {/* Glowing border effect */}
              <div className="absolute -inset-0.5 bg-gradient-to-br from-terminal-coral/20 to-transparent rounded-xl blur-sm" />

              <div className="relative bg-terminal-surface border border-terminal-coral/30 rounded-xl p-8">
                <h3 className="font-display text-2xl font-bold text-terminal-coral mb-8 flex items-center gap-3">
                  <X className="w-6 h-6" />
                  O Problema
                </h3>

                <ul className="space-y-4">
                  {problems.map((item, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start gap-3 group"
                    >
                      <span className="flex-shrink-0 w-6 h-6 rounded bg-terminal-coral/10 border border-terminal-coral/30 flex items-center justify-center mt-0.5 group-hover:bg-terminal-coral/20 transition-colors">
                        <X className="w-3 h-3 text-terminal-coral" />
                      </span>
                      <span className="text-terminal-text group-hover:text-terminal-coral transition-colors">
                        {item.text}
                      </span>
                    </motion.li>
                  ))}
                </ul>

                {/* Code decoration */}
                <div className="mt-8 pt-6 border-t border-terminal-border">
                  <code className="text-xs text-terminal-dim">
                    <span className="text-terminal-coral">$</span> git push<br />
                    <span className="text-terminal-coral">error:</span> API_KEY found in commit
                  </code>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Solutions */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="relative h-full">
              {/* Glowing border effect */}
              <div className="absolute -inset-0.5 bg-gradient-to-br from-terminal-green/20 to-transparent rounded-xl blur-sm" />

              <div className="relative bg-terminal-surface border border-terminal-green/30 rounded-xl p-8">
                <h3 className="font-display text-2xl font-bold text-terminal-green mb-8 flex items-center gap-3">
                  <Check className="w-6 h-6" />
                  A Solução DevKit
                </h3>

                <ul className="space-y-4">
                  {solutions.map((item, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: 10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start gap-3 group"
                    >
                      <span className="flex-shrink-0 w-6 h-6 rounded bg-terminal-green/10 border border-terminal-green/30 flex items-center justify-center mt-0.5 group-hover:bg-terminal-green/20 transition-colors">
                        <Check className="w-3 h-3 text-terminal-green" />
                      </span>
                      <span className="text-terminal-text group-hover:text-terminal-green transition-colors">
                        {item.text}
                      </span>
                    </motion.li>
                  ))}
                </ul>

                {/* Code decoration */}
                <div className="mt-8 pt-6 border-t border-terminal-border">
                  <code className="text-xs text-terminal-dim">
                    <span className="text-terminal-green">$</span> devkit config set prod API_KEY<br />
                    <span className="text-terminal-green">✓</span> Encrypted and saved
                  </code>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <p className="text-terminal-dim mb-6">
            Mais de <span className="text-terminal-text font-bold">500 desenvolvedores</span> já abandonaram o pesadelo
          </p>
          <a
            href="https://github.com/devkit/devkit"
            target="_blank"
            className="inline-flex items-center gap-2 px-6 py-3 bg-terminal-surface border border-terminal-green text-terminal-green rounded hover:bg-terminal-green hover:text-terminal-bg transition-all font-semibold"
          >
            Junte-se a eles →
          </a>
        </motion.div>
      </div>
    </section>
  );
}
