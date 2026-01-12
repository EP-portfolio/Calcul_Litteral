'use client'

import Link from 'next/link'

export default function ChallengesPage() {
  // TEST: Données hardcodées DIRECTEMENT dans le JSX, sans state, sans types complexes
  const challenges = [
    {
      competence: 'developpement',
      difficulty: 'facile',
      title: 'Développement - Facile',
      description: 'Test',
      color: 'from-blue-500 to-blue-600',
    },
  ]

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="container mx-auto max-w-7xl">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Challenges - Test Extrême
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Version ultra-simplifiée avec données hardcodées
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {challenges.map((challenge, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden"
            >
              <div className={`bg-gradient-to-r ${challenge.color} p-4 text-white`}>
                <h3 className="text-lg font-bold">{challenge.title}</h3>
              </div>

              <div className="p-4">
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                  {challenge.description}
                </p>

                <Link
                  href={`/challenges/${challenge.competence}/${challenge.difficulty}`}
                  className={`block w-full text-center py-3 px-4 rounded-lg font-medium transition-colors bg-gradient-to-r ${challenge.color} text-white hover:opacity-90`}
                >
                  Commencer
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
