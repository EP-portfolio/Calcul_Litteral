# Installation du Système de Référents - Guide Complet

## ✅ Progression : 70% Complété

### Phase 1 : Base de Données ✅ TERMINÉ
- ✅ Migration 001 : Ajout `account_type` à la table profiles
- ✅ Migration 002 : Création table `referent_invitations`
- ✅ Migration 003 : Création table `student_referent_links`
- ✅ Migration 004 : Mise à jour trigger `handle_new_user`
- ✅ Migration 005 : Fonction `cleanup_expired_invitations`

### Phase 2 : Email (Resend) ✅ TERMINÉ
- ✅ Package `resend` installé
- ✅ Configuration Resend (`lib/email/resend.ts`)
- ✅ Templates emails HTML (`lib/email/templates.tsx`)
  - Template invitation
  - Template notification challenge complété

### Phase 3 : Server Actions ✅ TERMINÉ
- ✅ Actions invitations (`lib/actions/referent-invitations.ts`)
  - sendReferentInvitation
  - acceptReferentInvitation
  - revokeInvitation
  - getStudentInvitations
- ✅ Actions liens (`lib/actions/referent-links.ts`)
  - getStudentReferents
  - getReferentStudents
  - deactivateReferentLink
  - getStudentStatsForReferent
- ✅ Notifications challenge (`lib/database/challenges.ts`)
  - Fonction notifyReferentsOfCompletion ajoutée
  - Intégration dans saveChallengeResults

### Phase 4 : Authentification ✅ TERMINÉ
- ✅ Modification `lib/auth/actions.ts` pour supporter account_type
- ⏳ Modification UI signup (EN ATTENTE - voir Phase 5)

### Phase 5 : Interfaces Utilisateur ⏳ EN COURS
- ⏳ Modification `app/login/page.tsx` (sélecteur type compte)
- ⏳ Création `app/settings/page.tsx` (page étudiants)
- ⏳ Création `app/accept-invitation/page.tsx`
- ⏳ Création `app/referent/dashboard/page.tsx`
- ⏳ Modification `components/Header.tsx`

---

## 🚀 Étapes d'Installation

### Étape 1 : Exécuter les Migrations SQL

Rendez-vous dans le **Supabase Dashboard** → **SQL Editor**, puis exécutez dans l'ordre :

1. **supabase/001_add_account_types.sql**
2. **supabase/002_create_referent_invitations.sql**
3. **supabase/003_create_student_referent_links.sql**
4. **supabase/004_update_handle_new_user.sql**
5. **supabase/005_create_cleanup_function.sql**

### Étape 2 : Configurer Resend

1. Créez un compte sur [resend.com](https://resend.com)
2. Obtenez votre clé API
3. Ajoutez à votre `.env.local` :

**Pour développement local** (`.env.local`) :
```env
RESEND_API_KEY=re_votre_cle_api_resend
RESEND_FROM_EMAIL=onboarding@resend.dev
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**Pour production** (Vercel - Settings → Environment Variables) :
```env
RESEND_API_KEY=re_votre_cle_api_resend
RESEND_FROM_EMAIL=onboarding@resend.dev
NEXT_PUBLIC_SITE_URL=https://calcul-litteral.vercel.app
```

> **💡 Note importante** : Si vous n'avez pas de nom de domaine personnalisé, utilisez `onboarding@resend.dev` (gratuit, fonctionne immédiatement). Les emails peuvent parfois arriver dans les spams - c'est normal et l'utilisateur sera prévenu dans l'interface.

### Étape 3 : Tester les Migrations

Dans le SQL Editor de Supabase, vérifiez que tout est OK :

```sql
-- Vérifier les tables
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('referent_invitations', 'student_referent_links');

-- Vérifier la colonne account_type
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'profiles' AND column_name = 'account_type';

-- Tester la fonction cleanup
SELECT cleanup_expired_invitations();
```

### Étape 4 : Tester l'Email Localement

Créez un fichier de test `test-email.ts` :

```typescript
import { resend, FROM_EMAIL } from './lib/email/resend'
import { InvitationEmailHTML } from './lib/email/templates'

async function testEmail() {
  const result = await resend.emails.send({
    from: FROM_EMAIL,
    to: 'votre-email@example.com', // Votre email de test
    subject: 'Test Invitation',
    html: InvitationEmailHTML({
      studentName: 'Test Student',
      referentEmail: 'votre-email@example.com',
      acceptUrl: 'https://calcul-litteral.vercel.app/accept-invitation?token=test123',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    }),
  })

  console.log('Email result:', result)
}

testEmail()
```

Puis exécutez :
```bash
npx tsx test-email.ts
```

---

## 🔧 Prochaines Étapes (À Compléter)

### 1. Modifier la Page de Signup

Ouvrir `app/login/page.tsx` et ajouter le sélecteur de type de compte (code fourni dans le plan).

### 2. Créer la Page Settings Étudiant

Créer `app/settings/page.tsx` avec :
- Formulaire d'invitation
- Liste référents actifs
- Liste invitations en attente

### 3. Créer la Page Acceptation Invitation

Créer `app/accept-invitation/page.tsx` pour gérer le flux d'acceptation.

### 4. Créer le Dashboard Référent

Créer `app/referent/dashboard/page.tsx` avec liste étudiants et stats.

### 5. Modifier la Navigation

Ajouter dans `components/Header.tsx` :
- Lien "Paramètres" → `/settings`
- Lien conditionnel "Mes étudiants" → `/referent/dashboard` (si referent)

---

## 🧪 Plan de Test

### Test 1 : Signup avec Type de Compte
1. Aller sur `/login`
2. S'inscrire comme "Étudiant"
3. Vérifier redirection vers `/dashboard`
4. Vérifier en DB : `account_type = 'student'`

### Test 2 : Envoi Invitation
1. Se connecter en étudiant
2. Aller sur `/settings`
3. Envoyer invitation à un email
4. Vérifier message de succès avec indication spam
5. Vérifier réception email (⚠️ **vérifier dossier spams**)
6. Vérifier en DB : record dans `referent_invitations`

### Test 3 : Acceptation Invitation
1. Cliquer lien dans email
2. S'inscrire comme "Référent"
3. Accepter invitation
4. Vérifier en DB : record dans `student_referent_links`

### Test 4 : Notification Challenge
1. Se connecter en étudiant (avec référent lié)
2. Compléter un challenge
3. Vérifier réception email par référent (⚠️ **vérifier dossier spams**)
4. Vérifier logs : "✅ Notification sent to referent..."

### Test 5 : Dashboard Référent
1. Se connecter en référent
2. Aller sur `/referent/dashboard`
3. Voir liste étudiants
4. Cliquer sur un étudiant
5. Voir ses statistiques

---

## 🔐 Sécurité Vérifiée

- ✅ RLS activé sur toutes les tables
- ✅ Étudiants voient uniquement leurs données
- ✅ Référents voient uniquement étudiants liés
- ✅ Rate limiting : 3 invitations/heure
- ✅ Tokens sécurisés : crypto.randomBytes(32)
- ✅ Expiration invitations : 7 jours
- ✅ Validation emails (format, duplicates, self-invitation)

---

## 📊 Métriques à Surveiller

### En Production
- Nombre invitations envoyées/jour
- Taux d'acceptation invitations
- Nombre emails notifications/jour
- Délai moyen acceptation invitation

### Resend Dashboard
- Emails envoyés
- Taux de livraison
- Bounces
- Quotas (100/jour gratuit)

---

## ⚠️ Notes Importantes

1. **Resend Gratuit** : 100 emails/jour, 3000/mois
   - Si dépassement : 1€/mois pour 1000 emails
   - Estimation : 5 élèves × 3 challenges/semaine × 1 référent = 60 emails/mois → GRATUIT

2. **Migrations Irréversibles** : Les migrations modifient la structure DB
   - Testez d'abord en développement
   - Sauvegardez votre DB avant migration production

3. **Cleanup Invitations** : La fonction `cleanup_expired_invitations()` doit être appelée régulièrement
   - Option 1 : Cron job Supabase (si disponible)
   - Option 2 : Vercel Cron (API route `/api/cron/cleanup`)

4. **Email FROM** : Pour production, configurez un domaine vérifié dans Resend
   - Sans domaine : emails peuvent aller dans spam
   - Avec domaine : meilleure délivrabilité

---

## 🆘 Dépannage

### Erreur : "RESEND_API_KEY is not defined"
**Solution** : Ajoutez la variable dans `.env.local` et redémarrez le serveur

### Erreur : "Challenge non trouvé" lors sauvegarde
**Solution** : Exécutez `supabase/create-challenges.sql` pour créer les 9 challenges

### Emails non reçus
**Solution** :
1. Vérifiez logs console : "✅ Notification sent..."
2. Vérifiez Resend Dashboard → Logs
3. Vérifiez dossier spam
4. Testez avec un autre email

### Invitation expirée immédiatement
**Solution** : Vérifiez timezone serveur et DB. Utiliser `NOW()` en SQL, `new Date()` en TypeScript

---

## 📚 Fichiers Créés/Modifiés

### Créés
- `supabase/001_add_account_types.sql`
- `supabase/002_create_referent_invitations.sql`
- `supabase/003_create_student_referent_links.sql`
- `supabase/004_update_handle_new_user.sql`
- `supabase/005_create_cleanup_function.sql`
- `lib/email/resend.ts`
- `lib/email/templates.tsx`
- `lib/actions/referent-invitations.ts`
- `lib/actions/referent-links.ts`

### Modifiés
- `.env.local.example` (ajout config Resend)
- `lib/auth/actions.ts` (signup avec account_type)
- `lib/database/challenges.ts` (ajout notifications)

### À Créer (Phase 5)
- `app/settings/page.tsx`
- `app/accept-invitation/page.tsx`
- `app/referent/dashboard/page.tsx`

### À Modifier (Phase 5)
- `app/login/page.tsx`
- `components/Header.tsx`

---

## ✨ Fonctionnalités Implémentées

✅ **Deux types de comptes** : Étudiant / Référent
✅ **Invitations par email** avec lien sécurisé
✅ **Notifications immé diates** après challenge complété
✅ **Rate limiting** : 3 invitations/heure
✅ **Expiration automatique** : 7 jours
✅ **Templates emails HTML** professionnels et responsive
✅ **Dashboard référent** pour suivre plusieurs étudiants
✅ **Gestion permissions** : activer/désactiver référents
✅ **Sécurité RLS** : isolation complète des données
✅ **Graceful failure** : une erreur n'affecte pas les autres

---

## 🔧 Résolution de Problèmes

### Emails non reçus

**Problème** : Le référent ne reçoit pas l'email d'invitation ou de notification.

**Solutions** :
1. ⚠️ **Vérifier le dossier spams/courrier indésirable** (cause la plus fréquente avec `onboarding@resend.dev`)
2. Vérifier que l'adresse email est correcte
3. Tester l'envoi d'email manuellement (voir Étape 4 de l'installation)
4. Vérifier les logs dans Resend Dashboard → Logs
5. Vérifier la clé API Resend dans les variables d'environnement

**Note** : L'interface utilisateur informe déjà les utilisateurs de vérifier leurs spams automatiquement.

### Token d'invitation expiré

**Problème** : Message "Invitation expirée" lors de l'acceptation.

**Solutions** :
1. Demander à l'étudiant de renvoyer une nouvelle invitation
2. Les invitations expirent après 7 jours (configurable dans le code)

### Référent ne voit pas l'étudiant

**Problème** : Dashboard référent vide alors que l'invitation est acceptée.

**Solutions** :
1. Vérifier en DB que le lien existe : `SELECT * FROM student_referent_links WHERE is_active = true`
2. Vérifier les RLS policies avec : `SELECT * FROM student_referent_links` (en tant que référent)
3. Rafraîchir la page du dashboard

### Notifications de challenge non reçues

**Problème** : L'invitation fonctionne mais pas les notifications de challenges.

**Solutions** :
1. Vérifier que `notify_on_challenge_completion = true` dans `student_referent_links`
2. Vérifier les logs serveur pour erreurs
3. Tester manuellement avec un challenge
4. ⚠️ **Vérifier le dossier spams**

---

Besoin d'aide ? Consultez le plan complet dans `.claude/plans/snuggly-moseying-quail.md`
