'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import ThemeToggle from './ThemeToggle'

export default function Header() {
  const pathname = usePathname()

  const navItems = [
    { href: '/', label: 'Accueil' },
    { href: '/developpement', label: 'Développement' },
    { href: '/reduction', label: 'Réduction' },
    { href: '/factorisation', label: 'Factorisation' },
    { href: '/mixte', label: 'Mode Mixte' },
  ]

  return (
    <header className="bg-blue-600 dark:bg-blue-800 text-white shadow-md" role="banner">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h1 className="text-2xl font-bold">
            <Link
              href="/"
              className="hover:underline focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600 dark:focus:ring-offset-blue-800 rounded"
            >
              Calcul Littéral - 3ème
            </Link>
          </h1>

          <div className="flex items-center gap-6">
            <nav aria-label="Navigation principale" role="navigation">
              <ul className="flex space-x-6">
                {navItems.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={`px-3 py-2 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-white ${
                          isActive
                            ? 'bg-blue-800 dark:bg-blue-900 font-semibold'
                            : 'hover:bg-blue-700 dark:hover:bg-blue-900'
                        }`}
                        aria-current={isActive ? 'page' : undefined}
                      >
                        {item.label}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </nav>

            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  )
}
