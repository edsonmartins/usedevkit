'use client';

import { motion } from 'framer-motion';
import { Check, X, Minus } from 'lucide-react';

type Feature = {
  name: string;
  devkit: 'yes' | 'no' | 'partial';
  vault: 'yes' | 'no' | 'partial';
  springCloud: 'yes' | 'no' | 'partial';
  doppler: 'yes' | 'no' | 'partial';
};

const features: Feature[] = [
  { name: 'Preço', devkit: 'yes', vault: 'yes', springCloud: 'yes', doppler: 'no' },
  { name: 'Setup', devkit: 'yes', vault: 'no', springCloud: 'partial', doppler: 'yes' },
  { name: 'Interface Web', devkit: 'yes', vault: 'partial', springCloud: 'no', doppler: 'yes' },
  { name: 'Self-hosted', devkit: 'yes', vault: 'yes', springCloud: 'yes', doppler: 'no' },
  { name: 'Multi-tenant', devkit: 'partial', vault: 'yes', springCloud: 'no', doppler: 'yes' },
  { name: 'Auditoria', devkit: 'yes', vault: 'yes', springCloud: 'partial', doppler: 'yes' },
  { name: 'Docs PT-BR', devkit: 'yes', vault: 'no', springCloud: 'no', doppler: 'no' },
  { name: 'CLI Nativo', devkit: 'yes', vault: 'yes', springCloud: 'no', doppler: 'yes' },
  { name: 'Open Source', devkit: 'yes', vault: 'yes', springCloud: 'yes', doppler: 'no' },
];

const products = [
  { name: 'DevKit', highlight: true, price: 'Grátis' },
  { name: 'Vault', highlight: false },
  { name: 'Spring Cloud', highlight: false },
  { name: 'Doppler', highlight: false },
];

const statusIcons = {
  yes: <Check className="w-5 h-5 text-terminal-green" />,
  no: <X className="w-5 h-5 text-terminal-coral" />,
  partial: <Minus className="w-5 h-5 text-terminal-yellow" />,
};

export default function Comparison() {
  return (
    <section className="relative py-32 px-4 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-terminal-surface" />
      <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-5" />

      <div className="relative max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Como{" "}
            <span className="text-terminal-green glow-green">Comparamos</span>
          </h2>

          <p className="text-xl text-terminal-dim max-w-2xl mx-auto">
            Veja porque DevKit é a escolha certa para seu time
          </p>
        </motion.div>

        {/* Comparison Table */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="overflow-x-auto"
        >
          <table className="w-full min-w-[600px]">
            {/* Header */}
            <thead>
              <tr className="border-b border-terminal-border">
                <th className="text-left py-4 px-4 font-display font-bold text-terminal-text">
                  Feature
                </th>
                {products.map((product, i) => (
                  <th
                    key={i}
                    className={`py-4 px-4 font-display font-bold ${
                      product.highlight
                        ? 'text-terminal-green bg-terminal-green/5'
                        : 'text-terminal-dim'
                    }`}
                  >
                    {product.name}
                    {product.price && (
                      <div className="text-xs font-normal mt-1">{product.price}</div>
                    )}
                  </th>
                ))}
              </tr>
            </thead>

            {/* Body */}
            <tbody>
              {features.map((feature, i) => (
                <tr
                  key={i}
                  className="border-b border-terminal-border/50 hover:bg-terminal-bg/50 transition-colors"
                >
                  <td className="py-4 px-4 text-terminal-text">{feature.name}</td>
                  <td className={`py-4 px-4 text-center ${i === 0 ? 'bg-terminal-green/5' : ''}`}>
                    {statusIcons[feature.devkit]}
                  </td>
                  <td className="py-4 px-4 text-center">{statusIcons[feature.vault]}</td>
                  <td className="py-4 px-4 text-center">{statusIcons[feature.springCloud]}</td>
                  <td className="py-4 px-4 text-center">{statusIcons[feature.doppler]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        {/* Legend */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-terminal-dim"
        >
          <span className="flex items-center gap-2">
            <Check className="w-4 h-4 text-terminal-green" />
            Incluído
          </span>
          <span className="flex items-center gap-2">
            <Minus className="w-4 h-4 text-terminal-yellow" />
            Parcial/Limitado
          </span>
          <span className="flex items-center gap-2">
            <X className="w-4 h-4 text-terminal-coral" />
            Não disponível
          </span>
        </motion.div>
      </div>
    </section>
  );
}
