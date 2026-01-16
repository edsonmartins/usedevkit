'use client';

import { motion } from 'framer-motion';
import { Copy, Check, FileCode, Braces } from 'lucide-react';
import { useState } from 'react';

type Language = 'java' | 'typescript' | 'flutter' | 'cli';

const codeExamples = {
  java: `@Service
public class PaymentService {
    private final DevKitClient devkit;

    public PaymentService(DevKitClient devkit) {
        this.devkit = devkit;
    }

    public void processPayment(String orderId) {
        // Fetch config securely
        String stripeKey = devkit.getConfig(
            "payment-app",
            "prod",
            "stripe.secret_key"
        );

        // Process payment...
        Stripe.apiKey = stripeKey;
        // ...
    }
}`,
  typescript: `import { DevKitClient } from '@devkit/sdk';

const client = new DevKitClient({
  baseUrl: 'https://devkit.company.com',
  apiKey: process.env.DEVKIT_API_KEY,
});

async function processPayment(orderId: string) {
  // Fetch config securely
  const stripeKey = await client.getConfig(
    'payment-app',
    'prod',
    'stripe.secret_key'
  );

  // Process payment...
  const stripe = new Stripe(stripeKey);
  // ...
}`,
  flutter: `import 'package:devkit/devkit.dart';

final client = DevKitClient(
  DevKitOptions(
    baseUrl: 'https://devkit.company.com',
    apiKey: Platform.environment['DEVKIT_API_KEY']!,
  ),
);

Future<void> processPayment(String orderId) async {
  // Fetch config securely
  final stripeKey = await client.getConfig(
    'payment-app',
    'prod',
    'stripe.secret_key',
  );

  // Process payment...
  final stripe = Stripe(stripeKey);
  // ...
}`,
  cli: `# Pull all configs for production
$ devkit pull payment-app --env prod

# Export as environment variables
$ export $(devkit export payment-app --env prod)

# Use in your application
$ echo $STRIPE_SECRET_KEY
sk_live_...

# View audit trail
$ devkit audit payment-app --days 30

# Rollback to previous version
$ devkit rollback payment-app --env prod --version 42`,
};

const languages = [
  { id: 'java' as Language, name: 'Java', icon: Braces },
  { id: 'typescript' as Language, name: 'TypeScript', icon: FileCode },
  { id: 'flutter' as Language, name: 'Flutter', icon: FileCode },
  { id: 'cli' as Language, name: 'CLI', icon: FileCode },
];

export default function CodeExamples() {
  const [activeLang, setActiveLang] = useState<Language>('java');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(codeExamples[activeLang]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="relative py-32 px-4 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-terminal-bg" />
      <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-10" />

      <div className="relative max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            SDKs para
            <span className="text-terminal-green glow-green"> Qualquer Stack</span>
          </h2>

          <p className="text-xl text-terminal-dim max-w-2xl mx-auto">
            Clientes type-safe para suas linguagens favoritas
          </p>
        </motion.div>

        {/* Language tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-3 mb-8"
        >
          {languages.map((lang) => (
            <button
              key={lang.id}
              onClick={() => setActiveLang(lang.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded font-mono text-sm transition-all ${
                activeLang === lang.id
                  ? 'bg-terminal-green text-terminal-bg'
                  : 'bg-terminal-surface border border-terminal-border text-terminal-dim hover:text-terminal-text hover:border-terminal-green'
              }`}
            >
              <lang.icon className="w-4 h-4" />
              {lang.name}
            </button>
          ))}
        </motion.div>

        {/* Code block */}
        <motion.div
          key={activeLang}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="terminal-window"
        >
          <div className="terminal-header">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-terminal-coral" />
              <div className="w-3 h-3 rounded-full bg-terminal-yellow" />
              <div className="w-3 h-3 rounded-full bg-terminal-green" />
            </div>
            <span className="text-terminal-dim text-sm ml-2">
              {activeLang}.{activeLang === 'cli' ? 'sh' : activeLang === 'typescript' ? 'ts' : activeLang === 'flutter' ? 'dart' : 'java'}
            </span>
            <button
              onClick={handleCopy}
              className="ml-auto flex items-center gap-2 px-3 py-1 text-xs text-terminal-dim hover:text-terminal-green transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-terminal-green" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy
                </>
              )}
            </button>
          </div>

          <div className="p-6 font-mono text-sm overflow-x-auto">
            <pre className="text-terminal-text">
              {codeExamples[activeLang].split('\n').map((line, i) => {
                const isComment = line.trim().startsWith('//');
                const isString = line.includes('"') && !line.includes('//');
                const isKeyword = /^(import|from|const|final|public|class|private|void|String|int|async|function)/.test(line.trim());

                return (
                  <div key={i} className={isComment ? 'text-terminal-dim' : ''}>
                    {isComment ? line : (
                      <span>
                        {isKeyword && (
                          <span className="text-terminal-purple">{line.split(/\s/)[0]}</span>
                        )}
                        {!isKeyword && line}
                      </span>
                    )}
                  </div>
                );
              })}
            </pre>
          </div>
        </motion.div>

        {/* Install commands */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-8 grid md:grid-cols-3 gap-4"
        >
          {[
            { lang: 'Java', cmd: 'implementation "com.devkit:devkit-sdk:1.0.0"' },
            { lang: 'TypeScript', cmd: 'npm install @devkit/sdk' },
            { lang: 'Flutter', cmd: 'flutter pub add devkit' },
          ].map((item, i) => (
            <div
              key={i}
              className="bg-terminal-surface border border-terminal-border rounded-lg p-4 font-mono text-sm"
            >
              <div className="text-terminal-dim text-xs mb-2"># {item.lang}</div>
              <div className="text-terminal-text">{item.cmd}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
