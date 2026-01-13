-- ⚠️ ATTENTION : Ce script supprime TOUS les utilisateurs et leurs données
-- À utiliser uniquement en développement/test
-- Exécutez ces requêtes dans l'ordre dans le SQL Editor de Supabase

-- 1. Supprimer les liens actifs entre étudiants et référents
DELETE FROM public.student_referent_links;

-- 2. Supprimer les invitations
DELETE FROM public.referent_invitations;

-- 3. Supprimer les tentatives d'exercices
DELETE FROM public.exercise_attempts;

-- 4. Supprimer les progrès des challenges
DELETE FROM public.user_challenge_progress;

-- 5. Supprimer les profils
DELETE FROM public.profiles;

-- 6. Supprimer les utilisateurs de l'authentification
-- ⚠️ Cette requête nécessite des permissions admin
DELETE FROM auth.users;

-- Vérification : compter les utilisateurs restants
SELECT
  (SELECT COUNT(*) FROM auth.users) as auth_users,
  (SELECT COUNT(*) FROM public.profiles) as profiles,
  (SELECT COUNT(*) FROM public.user_challenge_progress) as challenge_progress,
  (SELECT COUNT(*) FROM public.exercise_attempts) as exercise_attempts,
  (SELECT COUNT(*) FROM public.referent_invitations) as invitations,
  (SELECT COUNT(*) FROM public.student_referent_links) as links;
