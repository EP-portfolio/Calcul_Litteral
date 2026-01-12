'use server'

import { createClient } from '@/lib/supabase/server'
import { Difficulty, Competence } from '@/types/database'

export interface ChallengeResult {
  competence: Competence
  difficulty: Difficulty
  score: number
  totalExercises: number
  timeSpent: number
  exercises: Array<{
    question: string // String sérialisée de l'expression
    userAnswer: string
    isCorrect: boolean
    timeSpent: number
  }>
}

/**
 * Sauvegarde les résultats d'un challenge complété
 */
export async function saveChallengeResults(result: ChallengeResult) {
  console.log(
    '🔵 [SAVE] Début sauvegarde:',
    result.competence,
    result.difficulty,
    'Score:',
    result.score
  )
  const supabase = await createClient()

  // Récupérer l'utilisateur
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    console.error('❌ [SAVE] Utilisateur non authentifié')
    return { error: 'Utilisateur non authentifié' }
  }

  console.log('✅ [SAVE] User ID:', user.id)

  try {
    // 1. Récupérer le challenge dans la table challenges (doit être pré-créé)
    console.log('🔍 [SAVE] Recherche challenge:', result.competence, result.difficulty)
    const { data: existingChallenge, error: fetchError } = await supabase
      .from('challenges')
      .select('id')
      .eq('competence', result.competence)
      .eq('difficulty', result.difficulty)
      .limit(1)
      .single()

    if (fetchError || !existingChallenge) {
      console.error('❌ [SAVE] Challenge non trouvé. Il doit être pré-créé dans la base:', {
        competence: result.competence,
        difficulty: result.difficulty,
        error: fetchError,
      })
      return {
        error: `Challenge ${result.competence}-${result.difficulty} non trouvé. Veuillez contacter l'administrateur.`,
      }
    }

    const challengeId = (existingChallenge as any).id
    console.log('✅ [SAVE] Challenge trouvé, ID:', challengeId)

    // 2. Créer ou mettre à jour le progrès utilisateur
    const { data: progressData, error: progressError } = await supabase
      .from('user_challenge_progress')
      .upsert(
        {
          user_id: user.id,
          challenge_id: challengeId,
          score: result.score,
          total_exercises: result.totalExercises,
          time_spent: result.timeSpent,
          completed_at: new Date().toISOString(),
          status: 'completed',
        } as any,
        {
          onConflict: 'user_id,challenge_id',
        }
      )
      .select('id')
      .single()

    if (progressError || !progressData) {
      console.error('❌ [SAVE] Erreur sauvegarde progrès:', progressError)
      return { error: 'Erreur lors de la sauvegarde du progrès' }
    }

    console.log('✅ [SAVE] Progrès enregistré, ID:', (progressData as any).id)

    // 3. Sauvegarder les tentatives individuelles
    const attempts = result.exercises.map((exercise) => ({
      user_id: user.id,
      progress_id: (progressData as any).id,
      competence: result.competence,
      difficulty: result.difficulty,
      exercise_data: exercise.question,
      user_answer: exercise.userAnswer,
      is_correct: exercise.isCorrect,
      time_spent: exercise.timeSpent,
    }))

    const { error: attemptsError } = await supabase
      .from('exercise_attempts')
      .insert(attempts as any)

    if (attemptsError) {
      console.error('❌ [SAVE] Erreur sauvegarde tentatives:', attemptsError)
      // On continue même si les tentatives ne sont pas sauvegardées
    } else {
      console.log('✅ [SAVE] Tentatives enregistrées:', attempts.length)
    }

    console.log('🎉 [SAVE] Sauvegarde terminée avec succès!')
    return { success: true, progressId: (progressData as any).id }
  } catch (error) {
    console.error('Erreur sauvegarde résultats:', error)
    return { error: 'Erreur lors de la sauvegarde' }
  }
}

/**
 * Récupère le progrès d'un utilisateur pour un challenge spécifique
 */
export async function getChallengeProgress(competence: Competence, difficulty: Difficulty) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data: challenge } = await supabase
    .from('challenges')
    .select('id')
    .eq('competence', competence)
    .eq('difficulty', difficulty)
    .limit(1)
    .single()

  if (!challenge) {
    return null
  }

  const { data: progress, error: progressError } = await supabase
    .from('user_challenge_progress')
    .select('*')
    .eq('user_id', user.id)
    .eq('challenge_id', (challenge as any).id)
    .eq('status', 'completed')
    .order('completed_at', { ascending: false })
    .limit(1)
    .single()

  if (progressError || !progress) {
    return null
  }

  // Sérialiser complètement pour éviter l'erreur React #438
  return JSON.parse(JSON.stringify(progress))
}

/**
 * Récupère tous les progrès d'un utilisateur
 */
export async function getAllUserProgress() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return []
  }

  const { data: progress, error } = await supabase
    .from('user_challenge_progress')
    .select(
      `
      *,
      challenges (
        competence,
        difficulty,
        title
      )
    `
    )
    .eq('user_id', user.id)
    .eq('status', 'completed')
    .order('completed_at', { ascending: false })

  if (error) {
    console.error('Erreur récupération progrès:', error)
    return []
  }

  if (!progress) {
    return []
  }

  // CRUCIAL: Sérialisation JSON complète pour convertir tous les Date en strings
  return JSON.parse(JSON.stringify(progress))
}

/**
 * Récupère les statistiques globales d'un utilisateur
 */
export async function getUserStats() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  // Utiliser la fonction SQL RPC au lieu de la vue directement
  const { data: stats, error: statsError } = await supabase.rpc('get_user_stats')

  if (statsError) {
    console.error('Erreur récupération stats:', statsError)
  }

  const { data: completedChallenges } = await supabase
    .from('user_challenge_progress')
    .select('id', { count: 'exact' })
    .eq('user_id', user.id)
    .eq('status', 'completed')

  const result = {
    stats: stats || [],
    totalChallengesCompleted: completedChallenges?.length || 0,
  }

  // Sérialiser complètement pour éviter l'erreur React #438
  return JSON.parse(JSON.stringify(result))
}

/**
 * Récupère l'activité récente d'un utilisateur
 */
export async function getUserRecentActivity() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return []
  }

  // Utiliser la fonction SQL RPC au lieu de la vue directement
  const { data: activity, error: activityError } = await supabase.rpc('get_user_recent_activity')

  if (activityError) {
    console.error('Erreur récupération activité:', activityError)
    return []
  }

  if (!activity) {
    return []
  }

  // Sérialiser complètement pour éviter l'erreur React #438
  return JSON.parse(JSON.stringify(activity))
}
