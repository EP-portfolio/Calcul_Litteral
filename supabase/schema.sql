-- ========================================
-- Schéma Base de Données - Calcul Littéral
-- ========================================

-- Table pour les profils utilisateurs (extension de auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table pour les challenges prédéfinis
CREATE TABLE IF NOT EXISTS public.challenges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('facile', 'moyen', 'difficile')),
  competence TEXT NOT NULL CHECK (competence IN ('developpement', 'reduction', 'factorisation')),
  exercises JSONB NOT NULL, -- Stocke les 5 exercices du challenge
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table pour le progrès des challenges par utilisateur
CREATE TABLE IF NOT EXISTS public.user_challenge_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  challenge_id UUID REFERENCES public.challenges(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  score INTEGER DEFAULT 0,
  total_exercises INTEGER DEFAULT 5,
  time_spent INTEGER, -- en secondes
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
  UNIQUE(user_id, challenge_id)
);

-- Table pour l'historique des tentatives d'exercices
CREATE TABLE IF NOT EXISTS public.exercise_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  progress_id UUID REFERENCES public.user_challenge_progress(id) ON DELETE CASCADE,
  competence TEXT NOT NULL CHECK (competence IN ('developpement', 'reduction', 'factorisation')),
  difficulty TEXT NOT NULL CHECK (difficulty IN ('facile', 'moyen', 'difficile')),
  exercise_data JSONB NOT NULL, -- Question et réponse attendue
  user_answer TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  time_spent INTEGER, -- en secondes
  attempted_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- Index pour optimiser les requêtes
-- ========================================
CREATE INDEX IF NOT EXISTS idx_user_challenge_progress_user_id ON public.user_challenge_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_challenge_progress_status ON public.user_challenge_progress(status);
CREATE INDEX IF NOT EXISTS idx_exercise_attempts_user_id ON public.exercise_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_exercise_attempts_progress_id ON public.exercise_attempts(progress_id);
CREATE INDEX IF NOT EXISTS idx_exercise_attempts_competence ON public.exercise_attempts(competence);
CREATE INDEX IF NOT EXISTS idx_exercise_attempts_attempted_at ON public.exercise_attempts(attempted_at);

-- ========================================
-- RLS (Row Level Security)
-- ========================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_challenge_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_attempts ENABLE ROW LEVEL SECURITY;

-- Politiques RLS : les utilisateurs ne peuvent voir que leurs propres données

-- Profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Challenges (lecture publique, écriture admin seulement)
DROP POLICY IF EXISTS "Anyone can view challenges" ON public.challenges;
CREATE POLICY "Anyone can view challenges"
  ON public.challenges FOR SELECT
  USING (true);

-- User Challenge Progress
DROP POLICY IF EXISTS "Users can view own progress" ON public.user_challenge_progress;
CREATE POLICY "Users can view own progress"
  ON public.user_challenge_progress FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own progress" ON public.user_challenge_progress;
CREATE POLICY "Users can insert own progress"
  ON public.user_challenge_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own progress" ON public.user_challenge_progress;
CREATE POLICY "Users can update own progress"
  ON public.user_challenge_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- Exercise Attempts
DROP POLICY IF EXISTS "Users can view own attempts" ON public.exercise_attempts;
CREATE POLICY "Users can view own attempts"
  ON public.exercise_attempts FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own attempts" ON public.exercise_attempts;
CREATE POLICY "Users can insert own attempts"
  ON public.exercise_attempts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ========================================
-- Fonctions et Triggers
-- ========================================

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Fonction pour créer automatiquement un profil lors de l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ========================================
-- Vues utiles pour les statistiques
-- ========================================

-- Vue : Statistiques globales par utilisateur
CREATE OR REPLACE VIEW user_stats AS
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

-- Vue : Progression récente (30 derniers jours)
CREATE OR REPLACE VIEW user_recent_activity AS
SELECT
  ea.user_id,
  DATE(ea.attempted_at) as activity_date,
  COUNT(*) as exercises_done,
  SUM(CASE WHEN ea.is_correct THEN 1 ELSE 0 END) as correct_count
FROM public.exercise_attempts ea
WHERE ea.attempted_at >= NOW() - INTERVAL '30 days'
GROUP BY ea.user_id, DATE(ea.attempted_at)
ORDER BY activity_date DESC;
