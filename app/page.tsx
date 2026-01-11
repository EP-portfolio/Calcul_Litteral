import Link from 'next/link'

export default function Home() {
  const exerciseTypes = [
    {
      title: 'Développement',
      description: 'Développez et réduisez des expressions comme (a+b)(c+d) ou k(a+b)',
      href: '/developpement',
      color: 'bg-blue-500 hover:bg-blue-600',
    },
    {
      title: 'Réduction',
      description: 'Réduisez des expressions en regroupant les termes semblables',
      href: '/reduction',
      color: 'bg-green-500 hover:bg-green-600',
    },
    {
      title: 'Factorisation',
      description: 'Factorisez des expressions en trouvant le facteur commun',
      href: '/factorisation',
      color: 'bg-purple-500 hover:bg-purple-600',
    },
    {
      title: 'Mode Mixte',
      description: 'Exercices variés mélangeant les trois types',
      href: '/mixte',
      color: 'bg-orange-500 hover:bg-orange-600',
    },
  ]

  return (
    <div className="max-w-6xl mx-auto">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Bienvenue sur Calcul Littéral
        </h1>
        <p className="text-xl text-gray-700 dark:text-gray-300 mb-2">
          Application d&apos;entraînement pour les élèves de 3ème
        </p>
        <p className="text-gray-700 dark:text-gray-300">
          Choisissez un type d&apos;exercice pour commencer
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {exerciseTypes.map((type) => (
          <Link
            key={type.href}
            href={type.href}
            className={`${type.color} text-white rounded-lg p-6 shadow-lg transition-all transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-blue-500`}
          >
            <article>
              <h2 className="text-2xl font-bold mb-3">{type.title}</h2>
              <p className="text-white/90">{type.description}</p>
            </article>
          </Link>
        ))}
      </div>

      <section className="mt-12 bg-blue-50 dark:bg-blue-950 rounded-lg p-6 border-2 border-blue-300 dark:border-blue-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Comment ça marche ?
        </h2>
        <ol className="list-decimal list-inside space-y-2 text-gray-800 dark:text-gray-200">
          <li>Choisissez un type d&apos;exercice ou le mode mixte</li>
          <li>Sélectionnez votre niveau de difficulté (facile, moyen, difficile)</li>
          <li>Résolvez l&apos;exercice et entrez votre réponse</li>
          <li>Utilisez ^ pour les exposants (ex: x^2 pour x²) et les variables x et y</li>
          <li>Vérifiez votre réponse et consultez l&apos;explication si nécessaire</li>
        </ol>
      </section>
    </div>
  )
}
