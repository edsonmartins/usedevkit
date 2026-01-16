'use client';

import { motion } from 'framer-motion';
import { Download, Upload, Play, ArrowRight } from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: Download,
    title: 'Deploy',
    description: 'Clone e rode com Docker Compose',
    code: 'git clone https://github.com/devkit/devkit\ncd devkit\ndocker-compose up -d',
    language: 'bash',
  },
  {
    number: '02',
    icon: Upload,
    title: 'Configure',
    description: 'Crie sua app e adicione configs',
    code: 'devkit apps create my-app --envs dev,prod\ndevkit config set my-app --env prod database.url "..."\ndevkit config set my-app --env prod api.key "..."\n✓ All configs encrypted',
    language: 'bash',
  },
  {
    number: '03',
    icon: Play,
    title: 'Use',
    description: 'Integre com seu código em minutos',
    code: '// Java\nString dbUrl = devkit.getConfig("my-app", "prod", "database.url");\n\n// TypeScript\nconst dbUrl = await client.getConfig(\'my-app\', \'prod\', \'database.url\');\n\n// Flutter\nfinal dbUrl = await client.getConfig(\'my-app\', \'prod\', \'database.url\');',
    language: 'java',
  },
];

export default function HowItWorks() {
  return (
    <section className="relative py-32 px-4 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-terminal-surface" />
      <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-5" />

      <div className="relative max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            3 Passos para
            <span className="text-terminal-green glow-green"> Liberdade</span>
          </h2>

          <p className="text-xl text-terminal-dim max-w-2xl mx-auto">
            Do clone ao deploy em menos de 5 minutos
          </p>
        </motion.div>

        {/* Steps */}
        <div className="space-y-8 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className="relative"
            >
              {/* Step number */}
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-terminal-bg border-2 border-terminal-green rounded flex items-center justify-center font-display font-bold text-terminal-green text-sm">
                {step.number}
              </div>

              {/* Card */}
              <div className="bg-terminal-bg border border-terminal-border rounded-lg p-6 pt-8 h-full">
                {/* Icon + Title */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-terminal-green/10 border border-terminal-green/30 rounded flex items-center justify-center">
                    <step.icon className="w-5 h-5 text-terminal-green" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-terminal-text">
                    {step.title}
                  </h3>
                </div>

                {/* Description */}
                <p className="text-terminal-dim mb-4">{step.description}</p>

                {/* Code block */}
                <div className="bg-terminal-surface border border-terminal-border rounded p-4 font-mono text-xs overflow-x-auto">
                  <div className="flex items-center gap-2 mb-2 pb-2 border-b border-terminal-border">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-terminal-coral" />
                      <div className="w-2 h-2 rounded-full bg-terminal-yellow" />
                      <div className="w-2 h-2 rounded-full bg-terminal-green" />
                    </div>
                    <span className="text-terminal-dim text-xs">{step.language}</span>
                  </div>
                  <pre className="text-terminal-dim whitespace-pre-wrap">
                    <code>
                      {step.code.split('\n').map((line, i) => (
                        <div key={i}>
                          {line.startsWith('//') || line.startsWith('✓') ? (
                            <span className={line.startsWith('//') ? 'text-terminal-dim' : 'text-terminal-green'}>
                              {line}
                            </span>
                          ) : line.startsWith('git') || line.startsWith('devkit') || line.startsWith('cd') ? (
                            <span>
                              <span className="text-terminal-green">$</span>{' '}
                              <span className="text-terminal-text">{line}</span>
                            </span>
                          ) : (
                            <span className="text-terminal-purple">{line}</span>
                          )}
                        </div>
                      ))}
                    </code>
                  </pre>
                </div>
              </div>

              {/* Arrow (desktop) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:flex absolute top-1/2 -right-4 -translate-y-1/2 z-10">
                  <ArrowRight className="w-8 h-8 text-terminal-border" />
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <a
            href="https://github.com/devkit/devkit"
            target="_blank"
            className="inline-flex items-center gap-3 px-8 py-4 bg-terminal-green text-terminal-bg font-bold rounded hover:scale-105 transition-transform"
          >
            Começar Agora →
          </a>
        </motion.div>
      </div>
    </section>
  );
}
