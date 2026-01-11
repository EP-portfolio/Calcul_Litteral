# Calcul Littéral - Application d'Entraînement

Application web Next.js permettant aux élèves de 3ème de s'entraîner au calcul littéral (développement, réduction, factorisation).

## Fonctionnalités

- ✅ **Exercices de Développement** : Développer et réduire des expressions (a+b)(c+d), k(a+b), identités remarquables
- ✅ **Exercices de Réduction** : Réduire des expressions en regroupant les termes semblables
- ✅ **Exercices de Factorisation** : Factoriser des expressions en trouvant le facteur commun
- ✅ **Mode Mixte** : Exercices variés mélangeant les trois types
- ✅ **3 Niveaux de Difficulté** : Facile, Moyen, Difficile
- ✅ **Thème Clair/Sombre** : Mode sombre avec préférence système
- ✅ **Accessibilité WCAG 2.1 AA** : Navigation clavier, ARIA labels, skip links, contraste élevé
- ✅ **Moteur Mathématique** : Génération et vérification automatique des réponses
- ✅ **Tests Unitaires** : Coverage > 80%

## Stack Technique

- **Framework** : Next.js 14+ (App Router)
- **Language** : TypeScript
- **Styling** : Tailwind CSS
- **Tests** : Jest + Testing Library
- **Linting** : ESLint + Prettier avec règles d'accessibilité (jsx-a11y)

## Prérequis

- Node.js 18+
- npm ou pnpm

## Installation

```bash
# Cloner le repository
git clone <votre-repo-url>
cd calcul-litteral

# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000)

## Scripts Disponibles

```bash
# Développement
npm run dev          # Démarrer le serveur de développement

# Production
npm run build        # Build de production
npm run start        # Démarrer le serveur de production

# Qualité du code
npm run lint         # Vérifier le linting
npm test             # Lancer les tests unitaires
npm test -- --coverage  # Tests avec coverage
```

## Déploiement sur Vercel

### Méthode 1 : Via le CLI Vercel (Recommandé)

```bash
# Installer Vercel CLI
npm install -g vercel

# Déployer
vercel

# Déployer en production
vercel --prod
```

### Méthode 2 : Via l'interface Vercel

1. Créer un compte sur [vercel.com](https://vercel.com)
2. Cliquer sur "New Project"
3. Importer votre repository Git
4. Vercel détectera automatiquement Next.js
5. Cliquer sur "Deploy"

### Configuration Vercel

Aucune configuration particulière n'est nécessaire. Vercel détecte automatiquement :
- Framework : Next.js
- Build Command : `npm run build`
- Output Directory : `.next`
- Install Command : `npm install`

## Structure du Projet

```
calcul-litteral/
├── app/                    # Pages Next.js (App Router)
│   ├── developpement/     # Page développement
│   ├── reduction/         # Page réduction
│   ├── factorisation/     # Page factorisation
│   ├── mixte/             # Page mode mixte
│   ├── layout.tsx         # Layout principal
│   └── page.tsx           # Page d'accueil
├── components/            # Composants React
│   ├── Header.tsx         # Navigation principale
│   ├── ExerciseCard.tsx   # Carte d'exercice
│   ├── MathInput.tsx      # Champ de saisie mathématique
│   ├── Feedback.tsx       # Feedback de réponse
│   ├── ThemeProvider.tsx  # Provider de thème
│   └── ThemeToggle.tsx    # Toggle thème sombre/clair
├── lib/                   # Logique métier
│   ├── mathGenerator.ts   # Générateur d'exercices
│   ├── mathOperations.ts  # Opérations mathématiques
│   ├── mathComparator.ts  # Comparaison d'expressions
│   └── __tests__/         # Tests unitaires
├── types/                 # Types TypeScript
│   └── math.ts            # Types mathématiques
└── ...
```

## Tests

```bash
# Lancer tous les tests
npm test

# Tests avec coverage
npm test -- --coverage

# Tests en mode watch
npm test -- --watch
```

**Coverage actuel** : > 90% (branches, functions, lines, statements)

## Accessibilité

L'application respecte les normes **WCAG 2.1 niveau AA** :

- ✅ Navigation clavier complète (Tab, Enter, Esc)
- ✅ Skip links pour accès rapide au contenu
- ✅ ARIA labels sur tous les éléments interactifs
- ✅ Landmarks HTML5 (header, nav, main, footer)
- ✅ Contraste de couleurs conforme (4.5:1 texte, 3:1 UI)
- ✅ Focus visible sur tous les éléments
- ✅ Lecteurs d'écran compatibles

## Support Navigateurs

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Opera 76+

## Licence

MIT

## Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push sur la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## Contact

Pour toute question ou suggestion, ouvrir une issue sur le repository.
