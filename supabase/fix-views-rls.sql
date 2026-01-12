-- ========================================
-- FIX: Politiques RLS pour les vues statistiques
-- ========================================
-- Les vues doivent avoir leurs propres politiques RLS pour que les utilisateurs puissent y accéder

-- Activer RLS sur les vues
ALTER VIEW public.user_stats SET (security_invoker = on);
ALTER VIEW public.user_recent_activity SET (security_invoker = on);

-- Alternative : Utiliser des fonctions SECURITY DEFINER pour contourner RLS sur les vues
-- Ces fonctions s'exécutent avec les privilèges du propriétaire de la fonction

-- Fonction pour récupérer les statistiques de l'utilisateur connecté
CREATE OR REPLACE FUNCTION public.get_user_stats()
RETURNS SETOF user_stats
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT *
  FROM user_stats
  WHERE user_id = auth.uid();
$$;

-- Fonction pour récupérer l'activité récente de l'utilisateur connecté
CREATE OR REPLACE FUNCTION public.get_user_recent_activity()
RETURNS SETOF user_recent_activity
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT *
  FROM user_recent_activity
  WHERE user_id = auth.uid()
  ORDER BY activity_date DESC;
$$;

-- Donner les permissions d'exécution à tous les utilisateurs authentifiés
GRANT EXECUTE ON FUNCTION public.get_user_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_recent_activity() TO authenticated;

-- Vérifier que les vues existent et recréer si nécessaire
DROP VIEW IF EXISTS public.user_stats CASCADE;
CREATE OR REPLACE VIEW public.user_stats AS
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
CREATE OR REPLACE VIEW public.user_recent_activity AS
SELECT
  ea.user_id,
  DATE(ea.attempted_at) as activity_date,
  COUNT(*) as exercises_done,
  SUM(CASE WHEN ea.is_correct THEN 1 ELSE 0 END) as correct_count
FROM public.exercise_attempts ea
WHERE ea.attempted_at >= NOW() - INTERVAL '30 days'
GROUP BY ea.user_id, DATE(ea.attempted_at)
ORDER BY activity_date DESC;
