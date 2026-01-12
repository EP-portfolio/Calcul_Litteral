-- ========================================
-- FIX: Politiques RLS pour les vues statistiques (Version 2)
-- ========================================
-- Version corrigée qui gère les cas où les objets existent déjà

-- Supprimer les anciennes fonctions si elles existent
DROP FUNCTION IF EXISTS public.get_user_stats();
DROP FUNCTION IF EXISTS public.get_user_recent_activity();

-- Recréer les vues proprement
DROP VIEW IF EXISTS public.user_stats CASCADE;
CREATE VIEW public.user_stats AS
SELECT
  ea.user_id,
  ea.competence,
  ea.difficulty,
  COUNT(*) as total_attempts,
  SUM(CASE WHEN ea.is_correct THEN 1 ELSE 0 END) as correct_attempts,
  ROUND(100.0 * SUM(CASE WHEN ea.is_correct THEN 1 ELSE 0 END) / COUNT(*), 2) as success_rate,
  AVG(ea.time_spent) as avg_time_spent
FROM public.exercise_attempts ea
GROUP BY ea.user_id, ea.competence, ea.difficulty;

DROP VIEW IF EXISTS public.user_recent_activity CASCADE;
CREATE VIEW public.user_recent_activity AS
SELECT
  ea.user_id,
  DATE(ea.attempted_at) as activity_date,
  COUNT(*) as exercises_done,
  SUM(CASE WHEN ea.is_correct THEN 1 ELSE 0 END) as correct_count
FROM public.exercise_attempts ea
WHERE ea.attempted_at >= NOW() - INTERVAL '30 days'
GROUP BY ea.user_id, DATE(ea.attempted_at)
ORDER BY activity_date DESC;

-- Créer les fonctions RPC pour accéder aux vues avec RLS
CREATE FUNCTION public.get_user_stats()
RETURNS TABLE (
  user_id UUID,
  competence TEXT,
  difficulty TEXT,
  total_attempts BIGINT,
  correct_attempts BIGINT,
  success_rate NUMERIC,
  avg_time_spent NUMERIC
)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT
    user_id,
    competence,
    difficulty,
    total_attempts,
    correct_attempts,
    success_rate,
    avg_time_spent
  FROM user_stats
  WHERE user_id = auth.uid();
$$;

CREATE FUNCTION public.get_user_recent_activity()
RETURNS TABLE (
  user_id UUID,
  activity_date DATE,
  exercises_done BIGINT,
  correct_count BIGINT
)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT
    user_id,
    activity_date,
    exercises_done,
    correct_count
  FROM user_recent_activity
  WHERE user_id = auth.uid()
  ORDER BY activity_date DESC;
$$;

-- Donner les permissions d'exécution aux utilisateurs authentifiés
GRANT EXECUTE ON FUNCTION public.get_user_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_recent_activity() TO authenticated;

-- Confirmation
SELECT 'Configuration terminée avec succès!' as status;
