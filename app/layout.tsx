import type { Metadata } from 'next'
import './globals.css'

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
      <body>{children}</body>
    </html>
  )
}
