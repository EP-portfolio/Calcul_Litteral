-- ========================================
-- DIAGNOSTIC: Vérifier les données utilisateur
-- ========================================
-- Exécutez ces requêtes pour diagnostiquer le problème

-- 1. Vérifier votre ID utilisateur
SELECT
  auth.uid() as mon_user_id,
  email
FROM auth.users
WHERE id = auth.uid();

-- 2. Vérifier les challenges complétés
SELECT
  id,
  challenge_id,
  score,
  total_exercises,
  time_spent,
  status,
  completed_at,
  created_at
FROM user_challenge_progress
WHERE user_id = auth.uid()
ORDER BY completed_at DESC;

-- 3. Vérifier les tentatives d'exercices
SELECT
  id,
  competence,
  difficulty,
  is_correct,
  time_spent,
  attempted_at
FROM exercise_attempts
WHERE user_id = auth.uid()
ORDER BY attempted_at DESC
LIMIT 20;

-- 4. Tester la fonction get_user_stats()
SELECT * FROM get_user_stats();

-- 5. Tester la fonction get_user_recent_activity()
SELECT * FROM get_user_recent_activity();

-- 6. Voir les challenges disponibles
SELECT id, title, competence, difficulty FROM challenges LIMIT 10;

-- 7. Compter les données
SELECT
  (SELECT COUNT(*) FROM user_challenge_progress WHERE user_id = auth.uid()) as challenges_count,
  (SELECT COUNT(*) FROM exercise_attempts WHERE user_id = auth.uid()) as attempts_count;
