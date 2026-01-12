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
  const supabase = await createClient()

  // Récupérer l'utilisateur
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Utilisateur non authentifié' }
  }

  try {
    // 1. Créer ou récupérer le challenge dans la table challenges
    const { data: existingChallenge, error: fetchError } = await supabase
      .from('challenges')
      .select('id')
      .eq('competence', result.competence)
      .eq('difficulty', result.difficulty)
      .limit(1)
      .single()

    let challengeId: string

    if (fetchError || !existingChallenge) {
      // Créer le challenge s'il n'existe pas
      const { data: newChallenge, error: insertError } = await supabase
        .from('challenges')
        .insert({
          title: `Challenge ${result.competence} - ${result.difficulty}`,
          description: `5 exercices de ${result.competence} niveau ${result.difficulty}`,
          competence: result.competence,
          difficulty: result.difficulty,
          exercises: result.exercises.map((e) => e.question),
        } as any)
        .select('id')
        .single()

      if (insertError || !newChallenge) {
        console.error('Erreur création challenge:', insertError)
        return { error: 'Erreur lors de la création du challenge' }
      }

      challengeId = (newChallenge as any).id
    } else {
      challengeId = (existingChallenge as any).id
    }

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
      console.error('Erreur sauvegarde progrès:', progressError)
      return { error: 'Erreur lors de la sauvegarde du progrès' }
    }

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
      console.error('Erreur sauvegarde tentatives:', attemptsError)
      // On continue même si les tentatives ne sont pas sauvegardées
    }

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

  // Sérialiser complètement pour éviter l'erreur React #438
  // JSON.parse(JSON.stringify()) force la conversion de tous les objets Date en strings
  if (!progress) {
    return []
  }

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

  // Récupérer depuis la vue user_stats
  const { data: stats } = await supabase.from('user_stats').select('*').eq('user_id', user.id)

  // Récupérer le nombre de challenges complétés
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

  const { data: activity } = await supabase
    .from('user_recent_activity')
    .select('*')
    .eq('user_id', user.id)
    .order('activity_date', { ascending: false })
    .limit(30)

  // Sérialiser complètement pour éviter l'erreur React #438
  if (!activity) {
    return []
  }

  return JSON.parse(JSON.stringify(activity))
}
