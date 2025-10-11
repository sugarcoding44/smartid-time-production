import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Toaster } from '@/components/ui/sonner'
import { ThemeProvider } from '@/contexts/theme-context'
import { TranslationProvider } from '@/contexts/translation-context'
import { AuthProvider } from '@/contexts/auth-context'
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SmartID - Cloud Enterprise Software",
  description: "Free cloud-based enterprise software for corporate and educational institutions. Manage attendance with facial recognition, run cashless cafeterias, and enable e-wallet transactions.",
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
  other: {
    'color-scheme': 'light dark',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <ThemeProvider>
          <TranslationProvider>
            <AuthProvider>
              {children}
              <Toaster richColors position="bottom-right" />
            </AuthProvider>
          </TranslationProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
