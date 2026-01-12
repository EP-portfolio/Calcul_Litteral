'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Difficulty, Competence } from '@/types/database'
import { getChallengeTitle, getChallengeDescription } from '@/lib/challengeGenerator'
import { useRouter } from 'next/navigation'
import { getAllUserProgress } from '@/lib/database/challenges'

interface ChallengeCardData {
  competence: Competence
  difficulty: Difficulty
  title: string
  description: string
  isCompleted: boolean
  score: number | null
}

export default function ChallengesPage() {
  // ÉTAPE 1: Imports + Types - Données toujours hardcodées
  const challenges = [
    { title: 'Développement - Facile', color: 'from-blue-500 to-blue-600' },
    { title: 'Développement - Moyen', color: 'from-blue-500 to-blue-600' },
    { title: 'Développement - Difficile', color: 'from-blue-500 to-blue-600' },
  ]

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="container mx-auto max-w-7xl">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          TEST ÉTAPE 1 - Imports + Types
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Imports ajoutés, données toujours hardcodées
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
                <p className="text-gray-600 dark:text-gray-400 text-sm">Test étape 1</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
