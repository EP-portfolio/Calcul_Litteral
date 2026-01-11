# Prompt Ralph Wiggum - Calcul Littéral

Tu développes une application web Next.js permettant à un élève français de 3ème de s'entraîner au calcul littéral (développement, réduction, factorisation).

## Contexte technique
- Stack : Next.js 14+ (App Router), TypeScript, Tailwind CSS
- Déploiement cible : Vercel (gratuit)
- Pas de base de données (tout côté client, localStorage pour persistance session)

## Exigences d'accessibilité (PRIORITÉ HAUTE)
- WCAG 2.1 niveau AA minimum
- Navigation clavier complète
- Lecteur d'écran compatible (ARIA labels sur les maths)
- Contraste suffisant (4.5:1 texte, 3:1 éléments UI)
- Tailles de police ajustables
- Mode sombre/clair
- Skip links et landmarks HTML5

## Processus de travail
1. Lis TODO.md et identifie la prochaine tâche non cochée
2. Implémente cette tâche
3. Exécute les tests/lint pertinents
4. Si erreur, corrige avant de continuer
5. Coche la tâche dans TODO.md : `- [x]`
6. Commite avec message descriptif
7. Passe à la tâche suivante

## Règles mathématiques niveau 3ème
- Développement : (a+b)(c+d), k(a+b), identités remarquables
- Réduction : regrouper termes semblables
- Factorisation : facteur commun, identités remarquables
- Coefficients : entiers entre -10 et 10
- Variables : x, y principalement

## Quand tu es bloqué
Si après 3 tentatives une tâche ne passe pas :
1. Documente le problème dans un fichier BLOCKED.md
2. Output <promise>BLOCKED</promise>

## Quand tout est terminé
Quand TOUTES les tâches sont cochées ET tous les critères de succès sont validés :
Output <promise>COMPLETE</promise>
