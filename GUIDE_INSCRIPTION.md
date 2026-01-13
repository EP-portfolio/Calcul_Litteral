# Guide d'Inscription - Calcul Littéral

## ✅ Modifications Effectuées

### 1. Validation de Mot de Passe Fort

Le système exige maintenant un mot de passe **très sécurisé** lors de l'inscription.

#### Critères du Mot de Passe

✓ **Au moins 12 caractères** (minimum absolu)
✓ **Une lettre minuscule** (a-z)
✓ **Une lettre majuscule** (A-Z)
✓ **Un chiffre** (0-9)
✓ **Un caractère spécial** (@, #, $, !, %, etc.)

#### Exemples de Mots de Passe Valides

- `MonMotDePasse123!`
- `Calcul@Litteral2024`
- `Etudiant#Secure99`
- `Prof$Math2024!`

#### Exemples de Mots de Passe Invalides

- `password123` (pas de majuscule ni caractère spécial)
- `PASSWORD123` (pas de minuscule ni caractère spécial)
- `MotDePasse` (pas de chiffre ni caractère spécial)
- `Pass123!` (moins de 12 caractères)

#### Indicateur Visuel

Lors de l'inscription, un **indicateur de force** s'affiche en temps réel :

- 🔴 **Faible** : Le mot de passe ne respecte pas tous les critères
- 🟠 **Moyen** : Le mot de passe respecte la plupart des critères
- 🟢 **Fort** : Le mot de passe respecte tous les critères

Chaque critère respecté devient **vert** dans la liste de validation.

Le bouton "S'inscrire" est **désactivé** tant que tous les critères ne sont pas respectés.

### 2. Choix du Type de Compte

Lors de l'inscription (onglet **"Inscription"**, pas "Connexion"), deux options sont proposées :

#### Option 1 : Élève 📚
- Pour les étudiants qui veulent pratiquer le calcul littéral
- Peuvent inviter des référents
- Accèdent à la page `/settings` pour gérer leurs référents
- Voient le bouton "Paramètres" dans le menu

#### Option 2 : Référent 👥
- Pour les parents, enseignants, tuteurs
- Reçoivent des invitations d'élèves
- Accèdent au dashboard référent `/referent/dashboard`
- Voient le bouton "Mes étudiants" dans le menu

## 🚀 Comment S'inscrire

### Étape 1 : Accéder à l'Inscription

1. Allez sur [https://calcul-litteral.vercel.app/login](https://calcul-litteral.vercel.app/login)
2. **Cliquez sur l'onglet "Inscription"** (à droite de "Connexion")

⚠️ **Important** : Le choix du type de compte n'apparaît que sur l'onglet **"Inscription"**

### Étape 2 : Remplir le Formulaire

1. **Nom complet** : Votre nom et prénom
2. **Type de compte** : Cliquez sur "Élève" ou "Référent"
   - Par défaut : "Élève" est sélectionné
   - Les cartes changent de couleur quand sélectionnées
3. **Email** : Votre adresse email valide
4. **Mot de passe** : Entrez un mot de passe fort
   - Observez l'indicateur de force
   - Vérifiez que tous les critères sont verts

### Étape 3 : Valider

1. Cliquez sur **"S'inscrire"**
   - Le bouton est grisé si le mot de passe n'est pas valide
2. Attendez la redirection automatique

### Étape 4 : Après l'Inscription

**Si vous êtes Élève :**
- Redirection vers `/dashboard`
- Vous verrez une **bannière violette** vous invitant à inviter un référent
- Cliquez sur "Inviter un référent" ou allez dans Paramètres

**Si vous êtes Référent :**
- Redirection vers `/referent/dashboard`
- Vous devez attendre qu'un élève vous envoie une invitation par email

## 🔐 Sécurité du Mot de Passe

### Pourquoi 12 Caractères ?

- Protège contre les attaques par force brute
- Temps estimé pour casser un mot de passe de 12 caractères avec tous les critères : **plusieurs millénaires**
- Recommandation internationale des standards de sécurité (NIST, OWASP)

### Conseils pour un Bon Mot de Passe

✅ **À FAIRE** :
- Utiliser une phrase secrète : `JadoreLeMath2024!`
- Combiner des mots sans rapport : `Soleil#Voiture92`
- Utiliser un gestionnaire de mots de passe (Bitwarden, 1Password)

❌ **À ÉVITER** :
- Informations personnelles (date de naissance, nom)
- Mots du dictionnaire simples
- Séquences logiques (123456, abcdef)
- Réutiliser le même mot de passe partout

## 🐛 Problèmes Fréquents

### "Je ne vois pas le choix Élève/Référent"

**Solution** : Vous êtes probablement sur l'onglet "Connexion". Cliquez sur l'onglet **"Inscription"** en haut du formulaire.

### "Le bouton S'inscrire est grisé"

**Solution** : Votre mot de passe ne respecte pas tous les critères. Vérifiez que toutes les lignes de la liste de validation sont vertes.

### "Mon mot de passe est refusé"

**Solution** : Vérifiez que vous avez :
- Au moins 12 caractères
- Une majuscule
- Une minuscule
- Un chiffre
- Un caractère spécial (@, #, $, !, %, &, *, etc.)

### "Je me suis inscrit mais ne peux pas inviter de référent"

**Solution** : Vous vous êtes probablement inscrit comme "Référent" au lieu d'"Élève". Les référents ne peuvent pas inviter d'autres référents. Vous devez :
1. Vous déconnecter
2. Créer un nouveau compte avec le type "Élève"

## 📊 Résumé

| Fonctionnalité | Description |
|---|---|
| **Mot de passe fort** | Minimum 12 caractères, majuscule, minuscule, chiffre, caractère spécial |
| **Indicateur visuel** | Barre de progression verte/orange/rouge |
| **Validation temps réel** | Les critères deviennent verts au fur et à mesure |
| **Choix du type** | Élève ou Référent (lors de l'inscription uniquement) |
| **Sélection visuelle** | Cartes avec icônes et changement de couleur |

## 🔄 Déploiement

Pour que ces changements soient visibles en production sur Vercel :

1. Committez les modifications
2. Pushez vers GitHub/GitLab
3. Vercel redéploie automatiquement
4. Attendez 2-3 minutes pour le déploiement
5. Videz le cache du navigateur (Ctrl+Shift+R)

Ou redéployez manuellement sur Vercel Dashboard.
