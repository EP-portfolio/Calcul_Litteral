'use client'

export default function ChallengesPage() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="container mx-auto max-w-7xl">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Test - Page Challenges Minimale
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Si vous voyez ceci SANS erreur #438, le problème vient du contenu de la page originale.
        </p>
        <p className="text-gray-600 dark:text-gray-400 mt-4">
          Si l&apos;erreur PERSISTE, le problème vient d&apos;ailleurs (layout, middleware, ou
          Next.js).
        </p>
      </div>
    </main>
  )
}
