-- ========================================
-- Fix complet : Trigger + RLS
-- ========================================

-- 1. Vérifier que la table profiles existe
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Activer RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. SUPPRIMER toutes les anciennes politiques
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;

-- 4. Créer les NOUVELLES politiques (plus permissives pour l'inscription)
CREATE POLICY "Enable read for users based on user_id"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Enable insert for authenticated users"
  ON public.profiles FOR INSERT
  WITH CHECK (true);  -- Permet l'insertion par le trigger

CREATE POLICY "Enable update for users based on user_id"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- 5. Supprimer et recréer le trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- 6. Créer la fonction avec SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Log pour debugging
  RAISE LOG 'Creating profile for user: %', NEW.id;

  INSERT INTO public.profiles (id, email, full_name, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NOW(),
    NOW()
  );

  RAISE LOG 'Profile created successfully for user: %', NEW.id;
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    RAISE LOG 'ERROR creating profile for %: %', NEW.id, SQLERRM;
    RETURN NEW; -- Continue même en cas d'erreur pour ne pas bloquer l'inscription
END;
$$;

-- 7. Créer le trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 8. Créer les profils manquants pour les utilisateurs existants
DO $$
DECLARE
  user_record RECORD;
  profile_count INTEGER;
BEGIN
  FOR user_record IN SELECT * FROM auth.users LOOP
    -- Vérifier si le profil existe
    SELECT COUNT(*) INTO profile_count
    FROM public.profiles
    WHERE id = user_record.id;

    IF profile_count = 0 THEN
      INSERT INTO public.profiles (id, email, full_name, created_at, updated_at)
      VALUES (
        user_record.id,
        user_record.email,
        COALESCE(user_record.raw_user_meta_data->>'full_name', ''),
        user_record.created_at,
        NOW()
      );
      RAISE NOTICE 'Created profile for user: %', user_record.email;
    END IF;
  END LOOP;
END $$;

-- 9. Vérifier le résultat
SELECT
  (SELECT COUNT(*) FROM auth.users) as total_users,
  (SELECT COUNT(*) FROM public.profiles) as total_profiles,
  CASE
    WHEN (SELECT COUNT(*) FROM auth.users) = (SELECT COUNT(*) FROM public.profiles)
    THEN '✅ OK - Tous les users ont un profil'
    ELSE '❌ ERREUR - Nombre différent'
  END as status;
