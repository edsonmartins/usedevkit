import type { Metadata } from 'next';
import { JetBrains_Mono, Space_Grotesk } from 'next/font/google';
import './globals.css';

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
});

const space = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'DevKit - The Swiss Army Knife for Developers',
  description: 'Gerencie configurações, secrets e feature flags com segurança enterprise. Open source, auto-hospedado, criptografia AES-256. Setup em 5 minutos.',
  keywords: ['config management', 'secrets management', 'feature flags', 'open source', 'spring boot', 'vault alternative'],
  openGraph: {
    title: 'DevKit - The Swiss Army Knife for Developers',
    description: 'Solução open source para gerenciar configurações e secrets',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="dark">
      <body className={`${jetbrains.variable} ${space.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
