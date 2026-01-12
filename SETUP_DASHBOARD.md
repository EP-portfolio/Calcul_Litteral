# Configuration Dashboard - Statistiques et Activités

## Problème

Les statistiques du dashboard ne s'affichent pas car les vues SQL nécessitent des politiques RLS spéciales.

## Solution

Exécuter le script SQL dans Supabase pour créer des fonctions RPC qui permettent d'accéder aux statistiques.

## Étapes à suivre

### 1. Accéder au SQL Editor dans Supabase

1. Allez sur https://supabase.com/dashboard
2. Sélectionnez votre projet "Calcul Littéral"
3. Dans le menu de gauche, cliquez sur **SQL Editor**

### 2. Exécuter le script de correction

1. Cliquez sur **"New query"**
2. Copiez tout le contenu du fichier `supabase/fix-views-rls.sql`
3. Collez-le dans l'éditeur SQL
4. Cliquez sur **"Run"** en bas à droite

### 3. Vérifier que tout fonctionne

Après avoir exécuté le script, vous devriez voir :
```
Success. No rows returned
```

### 4. Tester le dashboard

1. Déployez les changements : `git add -A && git commit -m "Fix: Dashboard statistics" && git push`
2. Attendez le déploiement Vercel (2-3 minutes)
3. Complétez un nouveau challenge
4. Retournez sur le dashboard
5. Les statistiques devraient maintenant s'afficher !

## Ce que fait le script

Le script crée deux fonctions SQL spéciales :

1. **`get_user_stats()`** : Retourne les statistiques par compétence/difficulté
   - Nombre total de tentatives
   - Nombre de réponses correctes
   - Taux de réussite
   - Temps moyen par exercice

2. **`get_user_recent_activity()`** : Retourne l'activité des 30 derniers jours
   - Date
   - Nombre d'exercices effectués
   - Nombre de réponses correctes

Ces fonctions utilisent `SECURITY DEFINER` pour contourner les restrictions RLS sur les vues, tout en vérifiant que l'utilisateur accède uniquement à ses propres données via `auth.uid()`.

## Vérification des données

Pour vérifier que les données sont bien enregistrées, vous pouvez exécuter cette requête dans le SQL Editor :

```sql
-- Voir tous vos challenges complétés
SELECT * FROM user_challenge_progress WHERE user_id = auth.uid();

-- Voir toutes vos tentatives d'exercices
SELECT * FROM exercise_attempts WHERE user_id = auth.uid() ORDER BY attempted_at DESC;

-- Tester la fonction de statistiques
SELECT * FROM get_user_stats();

-- Tester la fonction d'activité récente
SELECT * FROM get_user_recent_activity();
```

## En cas de problème

Si les statistiques ne s'affichent toujours pas :

1. Vérifiez que vous avez bien complété au moins un challenge APRÈS avoir exécuté le script
2. Vérifiez la console du navigateur (F12) pour voir s'il y a des erreurs
3. Exécutez les requêtes de vérification ci-dessus dans le SQL Editor

## Support

Si le problème persiste, vérifiez :
- Les logs Supabase : Dashboard > Logs
- Les logs Vercel : Dashboard Vercel > Logs
- La console du navigateur pour les erreurs JavaScript
