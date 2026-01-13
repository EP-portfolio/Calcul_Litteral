'use client'

import { useState } from 'react'
import { login, signup, signInWithGoogle } from '@/lib/auth/actions'
import Link from 'next/link'

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [password, setPassword] = useState('')
  const [passwordStrength, setPasswordStrength] = useState<number>(0)

  const calculatePasswordStrength = (pwd: string): number => {
    let strength = 0
    if (pwd.length >= 12) strength += 1
    if (pwd.length >= 16) strength += 1
    if (/[a-z]/.test(pwd)) strength += 1
    if (/[A-Z]/.test(pwd)) strength += 1
    if (/[0-9]/.test(pwd)) strength += 1
    if (/[^a-zA-Z0-9]/.test(pwd)) strength += 1
    return strength
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const pwd = e.target.value
    setPassword(pwd)
    if (!isLogin) {
      setPasswordStrength(calculatePasswordStrength(pwd))
    }
  }

  const handleTabSwitch = (loginMode: boolean) => {
    setIsLogin(loginMode)
    setPassword('')
    setPasswordStrength(0)
    setError(null)
  }

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 2) return 'bg-red-500'
    if (passwordStrength <= 4) return 'bg-orange-500'
    return 'bg-green-500'
  }

  const getPasswordStrengthLabel = () => {
    if (passwordStrength <= 2) return 'Faible'
    if (passwordStrength <= 4) return 'Moyen'
    return 'Fort'
  }

  const isPasswordValid = () => {
    if (isLogin) return true
    return (
      password.length >= 12 &&
      /[a-z]/.test(password) &&
      /[A-Z]/.test(password) &&
      /[0-9]/.test(password) &&
      /[^a-zA-Z0-9]/.test(password)
    )
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const formData = new FormData(e.currentTarget)

    try {
      const result = isLogin ? await login(formData) : await signup(formData)
      if (result && 'error' in result) {
        setError(result.error)
      }
    } catch (err) {
      setError('Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setLoading(true)
    try {
      await signInWithGoogle()
    } catch (err) {
      setError('Erreur lors de la connexion avec Google')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 px-4">
      <div className="max-w-md w-full">
        {/* Logo et titre */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Calcul Littéral</h1>
          <p className="text-gray-600 dark:text-gray-300">Entraînez-vous et suivez vos progrès</p>
        </div>

        {/* Carte de connexion */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          {/* Boutons de basculement */}
          <div className="flex gap-2 mb-6 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
            <button
              onClick={() => handleTabSwitch(true)}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                isLogin
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow'
                  : 'text-gray-600 dark:text-gray-300'
              }`}
              type="button"
            >
              Connexion
            </button>
            <button
              onClick={() => handleTabSwitch(false)}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                !isLogin
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow'
                  : 'text-gray-600 dark:text-gray-300'
              }`}
              type="button"
            >
              Inscription
            </button>
          </div>

          {/* Message d'erreur */}
          {error && (
            <div
              className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm"
              role="alert"
            >
              {error}
            </div>
          )}

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div>
                  <label
                    htmlFor="full_name"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Nom complet
                  </label>
                  <input
                    id="full_name"
                    name="full_name"
                    type="text"
                    required={!isLogin}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Votre nom"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Type de compte
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="relative flex flex-col items-center p-4 border-2 border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition-colors has-[:checked]:border-blue-600 has-[:checked]:bg-blue-50 dark:has-[:checked]:bg-blue-900/20">
                      <input
                        type="radio"
                        name="account_type"
                        value="student"
                        defaultChecked
                        className="sr-only peer"
                      />
                      <div className="w-12 h-12 mb-2 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center peer-checked:bg-blue-600 peer-checked:text-white transition-colors">
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                          />
                        </svg>
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        Élève
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 text-center mt-1">
                        Pour pratiquer
                      </span>
                    </label>

                    <label className="relative flex flex-col items-center p-4 border-2 border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-purple-500 dark:hover:border-purple-400 transition-colors has-[:checked]:border-purple-600 has-[:checked]:bg-purple-50 dark:has-[:checked]:bg-purple-900/20">
                      <input
                        type="radio"
                        name="account_type"
                        value="referent"
                        className="sr-only peer"
                      />
                      <div className="w-12 h-12 mb-2 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center peer-checked:bg-purple-600 peer-checked:text-white transition-colors">
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                          />
                        </svg>
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        Référent
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 text-center mt-1">
                        Parent, tuteur
                      </span>
                    </label>
                  </div>
                </div>
              </>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="votre@email.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Mot de passe
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={handlePasswordChange}
                required
                autoComplete={isLogin ? 'current-password' : 'new-password'}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="••••••••"
                minLength={isLogin ? 6 : 12}
                pattern={
                  isLogin
                    ? undefined
                    : '(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^a-zA-Z0-9]).{12,}'
                }
                title={
                  isLogin
                    ? undefined
                    : 'Le mot de passe doit contenir au moins 12 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial'
                }
              />
              {!isLogin && (
                <>
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        Force du mot de passe
                      </span>
                      <span
                        className={`text-xs font-medium ${
                          passwordStrength <= 2
                            ? 'text-red-600'
                            : passwordStrength <= 4
                              ? 'text-orange-600'
                              : 'text-green-600'
                        }`}
                      >
                        {password ? getPasswordStrengthLabel() : ''}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                        style={{ width: `${(passwordStrength / 6) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="mt-2 space-y-1">
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold">
                      Le mot de passe doit contenir :
                    </p>
                    <ul className="text-xs text-gray-500 dark:text-gray-400 space-y-0.5">
                      <li className={password.length >= 12 ? 'text-green-600' : ''}>
                        ✓ Au moins 12 caractères
                      </li>
                      <li className={/[a-z]/.test(password) ? 'text-green-600' : ''}>
                        ✓ Une lettre minuscule
                      </li>
                      <li className={/[A-Z]/.test(password) ? 'text-green-600' : ''}>
                        ✓ Une lettre majuscule
                      </li>
                      <li className={/[0-9]/.test(password) ? 'text-green-600' : ''}>
                        ✓ Un chiffre
                      </li>
                      <li className={/[^a-zA-Z0-9]/.test(password) ? 'text-green-600' : ''}>
                        ✓ Un caractère spécial (@, #, $, etc.)
                      </li>
                    </ul>
                  </div>
                </>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || (!isLogin && !isPasswordValid())}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors focus:ring-4 focus:ring-blue-300"
            >
              {loading ? 'Chargement...' : isLogin ? 'Se connecter' : "S'inscrire"}
            </button>
            {!isLogin && !isPasswordValid() && password.length > 0 && (
              <p className="text-xs text-red-600 dark:text-red-400 text-center">
                Veuillez respecter tous les critères du mot de passe
              </p>
            )}
          </form>

          {/* Séparateur */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                Ou continuer avec
              </span>
            </div>
          </div>

          {/* Bouton Google */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            type="button"
            className="w-full flex items-center justify-center gap-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium py-3 px-4 rounded-lg transition-colors focus:ring-4 focus:ring-gray-200"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continuer avec Google
          </button>
        </div>

        {/* Lien retour */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            ← Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    </div>
  )
}
