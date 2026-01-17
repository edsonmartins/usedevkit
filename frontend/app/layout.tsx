import type { Metadata } from "next";
import { JetBrains_Mono, Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { QueryProvider } from "@/lib/providers/query-provider";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "DevKit - Configuration Management",
  description: "Centralized configuration and secrets management platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark" suppressHydrationWarning>
      <body
        className={`${jetbrainsMono.variable} ${inter.variable} font-mono antialiased`}
      >
        <QueryProvider>
          {children}
          <Toaster
            position="top-right"
            theme="dark"
            toastOptions={{
              style: {
                background: "hsl(180, 3%, 14%)",
                border: "1px solid hsl(180, 3%, 22%)",
                color: "hsl(180, 3%, 85%)",
                fontFamily: "JetBrains Mono, monospace",
              },
              classNames: {
                success: "border-terminal-green/50",
                error: "border-terminal-coral/50",
                warning: "border-terminal-yellow/50",
                info: "border-terminal-blue/50",
              },
            }}
          />
        </QueryProvider>
      </body>
    </html>
  );
}
