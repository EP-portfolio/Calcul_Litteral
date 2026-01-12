-- ========================================
-- Création des 9 challenges de base
-- ========================================
-- Ce script crée les 9 challenges nécessaires (3 compétences × 3 difficultés)

-- Supprimer les challenges existants si présents (optionnel)
-- DELETE FROM public.challenges;

-- Insérer les 9 challenges
INSERT INTO public.challenges (title, description, competence, difficulty, exercises) VALUES
-- Développement
('Développement - Facile', 'Développez et réduisez des expressions simples comme k(a+b)', 'developpement', 'facile', '[]'::jsonb),
('Développement - Moyen', 'Développez des expressions du type (a+b)(c+d)', 'developpement', 'moyen', '[]'::jsonb),
('Développement - Difficile', 'Développez des expressions avancées avec identités remarquables et signes négatifs', 'developpement', 'difficile', '[]'::jsonb),

-- Réduction
('Réduction - Facile', 'Réduisez des expressions simples en regroupant les termes semblables', 'reduction', 'facile', '[]'::jsonb),
('Réduction - Moyen', 'Réduisez des expressions avec plusieurs termes et variables', 'reduction', 'moyen', '[]'::jsonb),
('Réduction - Difficile', 'Réduisez des expressions complexes avec termes de différents degrés', 'reduction', 'difficile', '[]'::jsonb),

-- Factorisation
('Factorisation - Facile', 'Factorisez des expressions simples en trouvant le facteur commun', 'factorisation', 'facile', '[]'::jsonb),
('Factorisation - Moyen', 'Factorisez des expressions avec plusieurs termes', 'factorisation', 'moyen', '[]'::jsonb),
('Factorisation - Difficile', 'Factorisez des expressions complexes', 'factorisation', 'difficile', '[]'::jsonb)

ON CONFLICT DO NOTHING;

-- Vérifier que les 9 challenges ont été créés
SELECT
  competence,
  difficulty,
  title,
  id
FROM public.challenges
ORDER BY
  CASE competence
    WHEN 'developpement' THEN 1
    WHEN 'reduction' THEN 2
    WHEN 'factorisation' THEN 3
  END,
  CASE difficulty
    WHEN 'facile' THEN 1
    WHEN 'moyen' THEN 2
    WHEN 'difficile' THEN 3
  END;

-- Confirmation
SELECT
  COUNT(*) as total_challenges,
  'Challenges créés avec succès! Vous devriez voir 9 challenges.' as message
FROM public.challenges;
