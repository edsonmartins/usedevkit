'use client';

import { motion } from 'framer-motion';
import { Github, Twitter, MessageCircle, Linkedin, Heart } from 'lucide-react';
import Link from 'next/link';

const footerSections = [
  {
    title: 'Produto',
    links: [
      { label: 'Features', href: '#features' },
      { label: 'Documentação', href: '/docs' },
      { label: 'Changelog', href: '/changelog' },
      { label: 'Roadmap', href: '/roadmap' },
    ],
  },
  {
    title: 'Recursos',
    links: [
      { label: 'Quick Start', href: '#quickstart' },
      { label: 'Exemplos', href: '/examples' },
      { label: 'API Reference', href: '/api' },
      { label: 'SDKs', href: '/sdks' },
    ],
  },
  {
    title: 'Comunidade',
    links: [
      { label: 'GitHub', href: 'https://github.com/devkit/devkit', external: true },
      { label: 'Discord', href: 'https://discord.gg/devkit', external: true },
      { label: 'Twitter', href: 'https://twitter.com/usedevkit', external: true },
      { label: 'Blog', href: '/blog' },
    ],
  },
  {
    title: 'Empresa',
    links: [
      { label: 'Sobre', href: '/about' },
      { label: 'Contato', href: '/contact' },
      { label: 'Enterprise', href: '/enterprise' },
      { label: 'Privacidade', href: '/privacy' },
    ],
  },
];

const socialLinks = [
  { icon: Github, href: 'https://github.com/devkit/devkit', label: 'GitHub' },
  { icon: MessageCircle, href: 'https://discord.gg/devkit', label: 'Discord' },
  { icon: Twitter, href: 'https://twitter.com/usedevkit', label: 'Twitter' },
  { icon: Linkedin, href: 'https://linkedin.com/company/devkit', label: 'LinkedIn' },
];

export default function Footer() {
  return (
    <footer className="relative border-t border-terminal-border">
      {/* Background */}
      <div className="absolute inset-0 bg-terminal-surface" />

      <div className="relative">
        {/* Main footer */}
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
            {/* Brand column */}
            <div className="col-span-2">
              <Link href="/" className="inline-flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-terminal-bg border border-terminal-border rounded-lg flex items-center justify-center">
                  <span className="text-terminal-green font-mono font-bold">DK</span>
                </div>
                <span className="font-display font-bold text-xl">DevKit</span>
              </Link>
              <p className="text-terminal-dim text-sm mb-4 max-w-xs">
                The Swiss Army Knife for Developers. Gerencie configurações, secrets e feature flags em um só lugar.
              </p>
              <div className="text-xs text-terminal-dim">
                MIT License • Open Source
              </div>
            </div>

            {/* Links sections */}
            {footerSections.map((section, i) => (
              <div key={i}>
                <h4 className="font-display font-bold text-terminal-text mb-4">{section.title}</h4>
                <ul className="space-y-2">
                  {section.links.map((link, j) => (
                    <li key={j}>
                      <Link
                        href={link.href}
                        target={link.external ? '_blank' : undefined}
                        className="text-sm text-terminal-dim hover:text-terminal-green transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-terminal-border">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              {/* Copyright */}
              <div className="flex items-center gap-2 text-sm text-terminal-dim">
                <span>© 2025 DevKit</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  Made with <Heart className="w-3 h-3 text-terminal-coral" /> in Brazil 🇧🇷
                </span>
              </div>

              {/* Social links */}
              <div className="flex items-center gap-4">
                {socialLinks.map((social, i) => (
                  <a
                    key={i}
                    href={social.href}
                    target="_blank"
                    aria-label={social.label}
                    className="p-2 text-terminal-dim hover:text-terminal-green transition-colors"
                  >
                    <social.icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
