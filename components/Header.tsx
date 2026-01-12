'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import ThemeToggle from './ThemeToggle'
import UserProfile from './UserProfile'
import MobileMenu from './MobileMenu'

export default function Header() {
  const pathname = usePathname()

  const navItems = [
    { href: '/', label: 'Accueil' },
    { href: '/developpement', label: 'Développement' },
    { href: '/reduction', label: 'Réduction' },
    { href: '/factorisation', label: 'Factorisation' },
    { href: '/mixte', label: 'Mode Mixte' },
    { href: '/challenges', label: 'Challenges' },
  ]

  return (
    <header className="bg-blue-600 dark:bg-blue-800 text-white shadow-md relative" role="banner">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MobileMenu navItems={navItems} />
            <h1 className="text-xl md:text-2xl font-bold">
              <Link
                href="/"
                className="hover:underline focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600 dark:focus:ring-offset-blue-800 rounded"
              >
                Calcul Littéral
              </Link>
            </h1>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <nav aria-label="Navigation principale" role="navigation" className="hidden md:block">
              <ul className="flex space-x-2 lg:space-x-4">
                {navItems.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={`px-2 lg:px-3 py-2 rounded text-sm lg:text-base transition-colors focus:outline-none focus:ring-2 focus:ring-white ${
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
            <UserProfile />
          </div>
        </div>
      </div>
    </header>
  )
}
