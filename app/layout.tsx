import type { Metadata } from 'next'
import './globals.css'
import Header from '@/components/Header'
import SkipLink from '@/components/SkipLink'
import { ThemeProvider } from '@/components/ThemeProvider'

export const metadata: Metadata = {
  title: 'Calcul Littéral - Entraînement 3ème',
  description: "Application d'entraînement au calcul littéral pour élèves de 3ème",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr">
      <body className="min-h-screen flex flex-col bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors">
        <ThemeProvider>
          <SkipLink />
          <Header />
          <main id="main-content" className="flex-1 container mx-auto px-4 py-8" role="main">
            {children}
          </main>
          <footer className="bg-gray-100 dark:bg-gray-800 py-4 mt-auto" role="contentinfo">
            <div className="container mx-auto px-4 text-center text-gray-600 dark:text-gray-400 text-sm">
              <p>Application d&apos;entraînement au calcul littéral - Niveau 3ème</p>
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  )
}
