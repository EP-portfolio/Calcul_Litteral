# Architecture Application Mobile - Calcul Littéral

## Vue d'ensemble

Application mobile (iOS/Android) avec Next.js + Capacitor permettant deux types de comptes :
- **Élève** : Effectue des challenges, génère un code de liaison
- **Référent** (parent/tuteur) : Suit plusieurs élèves via codes, reçoit notifications push

---

## 1. Solution technique retenue : Capacitor

### Pourquoi Capacitor ?
- ✅ Réutilise 95% du code Next.js existant
- ✅ Accès natif aux APIs (notifications, caméra, etc.)
- ✅ Build iOS + Android depuis la même codebase
- ✅ Performances proches du natif
- ✅ Maintenance simplifiée (1 codebase = 3 plateformes)

### Alternatives écartées
- ❌ **React Native** : Réécriture complète du code (~400h)
- ❌ **PWA seule** : Notifications push limitées sur iOS

---

## 2. Architecture base de données

### 2.1 Modifications table `profiles`

```sql
-- Ajout colonnes pour système de rôles
ALTER TABLE public.profiles
ADD COLUMN account_type TEXT DEFAULT 'student' CHECK (account_type IN ('student', 'referent')),
ADD COLUMN student_code TEXT UNIQUE,
ADD COLUMN fcm_token TEXT, -- Token Firebase Cloud Messaging
ADD COLUMN code_generated_at TIMESTAMPTZ;

-- Index pour recherche rapide par code
CREATE INDEX idx_profiles_student_code ON public.profiles(student_code) WHERE student_code IS NOT NULL;
CREATE INDEX idx_profiles_fcm_token ON public.profiles(fcm_token) WHERE fcm_token IS NOT NULL;

-- Fonction pour générer code étudiant unique (6 caractères alphanumériques)
CREATE OR REPLACE FUNCTION generate_student_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    -- Générer code 6 caractères (majuscules + chiffres)
    new_code := UPPER(substring(md5(random()::text || clock_timestamp()::text) from 1 for 6));

    -- Vérifier unicité
    SELECT EXISTS(SELECT 1 FROM public.profiles WHERE student_code = new_code) INTO code_exists;

    EXIT WHEN NOT code_exists;
  END LOOP;

  RETURN new_code;
END;
$$;
```

### 2.2 Table de liaison élève-référent

```sql
CREATE TABLE public.student_referent_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  referent_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  linked_at TIMESTAMPTZ DEFAULT NOW(),
  notification_enabled BOOLEAN DEFAULT TRUE,

  -- Un référent peut suivre plusieurs élèves, un élève peut avoir plusieurs référents
  UNIQUE(student_id, referent_id)
);

-- RLS policies
ALTER TABLE public.student_referent_links ENABLE ROW LEVEL SECURITY;

-- Les élèves voient leurs propres liens
CREATE POLICY "Students can view their own links"
ON public.student_referent_links
FOR SELECT
USING (student_id = auth.uid());

-- Les référents voient leurs propres liens
CREATE POLICY "Referents can view their own links"
ON public.student_referent_links
FOR SELECT
USING (referent_id = auth.uid());

-- Les référents peuvent créer des liens en entrant le code élève
CREATE POLICY "Referents can create links"
ON public.student_referent_links
FOR INSERT
WITH CHECK (referent_id = auth.uid());

-- Les deux parties peuvent supprimer le lien
CREATE POLICY "Both parties can delete links"
ON public.student_referent_links
FOR DELETE
USING (student_id = auth.uid() OR referent_id = auth.uid());

-- Index pour performances
CREATE INDEX idx_links_student ON public.student_referent_links(student_id);
CREATE INDEX idx_links_referent ON public.student_referent_links(referent_id);
```

### 2.3 Table notifications

```sql
CREATE TABLE public.push_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('challenge_completed', 'achievement_unlocked')),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  data JSONB, -- Données supplémentaires (score, competence, etc.)
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ,

  -- Index pour requêtes fréquentes
  INDEX idx_notifications_recipient (recipient_id, sent_at DESC),
  INDEX idx_notifications_unread (recipient_id, read_at) WHERE read_at IS NULL
);

-- RLS
ALTER TABLE public.push_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
ON public.push_notifications
FOR SELECT
USING (recipient_id = auth.uid());

CREATE POLICY "Users can mark notifications as read"
ON public.push_notifications
FOR UPDATE
USING (recipient_id = auth.uid());
```

---

## 3. Flux utilisateur détaillé

### 3.1 Flux Élève

```
1. Inscription/Connexion
   └─> Sélection type compte : "Élève"
   └─> Profil créé avec account_type='student'

2. Génération code de liaison
   └─> Bouton "Partager mon code" dans Paramètres
   └─> Code 6 caractères généré (ex: A3K9L2)
   └─> Affichage QR code + code texte
   └─> Partage par email/SMS/copie

3. Utilisation normale
   └─> Sélection challenge
   └─> Complétion exercices
   └─> Sauvegarde résultats
   └─> Trigger notification aux référents liés

4. Gestion référents
   └─> Liste référents connectés
   └─> Option délier un référent
```

### 3.2 Flux Référent

```
1. Inscription/Connexion
   └─> Sélection type compte : "Référent"
   └─> Profil créé avec account_type='referent'

2. Ajout d'un élève
   └─> Bouton "Ajouter un élève"
   └─> Saisie code 6 caractères OU scan QR code
   └─> Vérification code dans DB
   └─> Création lien dans student_referent_links
   └─> Confirmation visuelle

3. Dashboard référent
   └─> Liste élèves suivis (nom, avatar)
   └─> Dernière activité par élève
   └─> Statistiques globales
   └─> Bouton "Voir détails" par élève

4. Réception notifications
   └─> Push notification quand élève termine challenge
   └─> Format : "[Prénom] a terminé [Développement - Facile] : 8/10"
   └─> Clic notification → Détails challenge élève

5. Vue détails élève
   └─> Historique challenges
   └─> Graphiques progression
   └─> Statistiques par compétence
   └─> Points forts/faibles
```

---

## 4. API Server Actions

### 4.1 Gestion compte élève

```typescript
// lib/database/student.ts
'use server'

import { createClient } from '@/lib/supabase/server'

/**
 * Génère un code unique pour l'élève connecté
 */
export async function generateStudentCode() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non authentifié' }

  // Vérifier que c'est bien un élève
  const { data: profile } = await supabase
    .from('profiles')
    .select('account_type, student_code')
    .eq('id', user.id)
    .single()

  if (profile?.account_type !== 'student') {
    return { error: 'Seuls les élèves peuvent générer un code' }
  }

  // Si code existe déjà, le retourner
  if (profile.student_code) {
    return { code: profile.student_code }
  }

  // Générer nouveau code via fonction SQL
  const { data, error } = await supabase.rpc('generate_student_code')

  if (error || !data) {
    return { error: 'Erreur génération code' }
  }

  // Mettre à jour profil
  const { error: updateError } = await supabase
    .from('profiles')
    .update({
      student_code: data,
      code_generated_at: new Date().toISOString()
    })
    .eq('id', user.id)

  if (updateError) {
    return { error: 'Erreur sauvegarde code' }
  }

  return { code: data }
}

/**
 * Récupère la liste des référents liés à l'élève
 */
export async function getLinkedReferents() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('student_referent_links')
    .select(`
      id,
      linked_at,
      notification_enabled,
      referent:profiles!referent_id (
        id,
        full_name,
        email
      )
    `)
    .eq('student_id', user.id)

  if (error) {
    console.error('Erreur récupération référents:', error)
    return []
  }

  return JSON.parse(JSON.stringify(data || []))
}

/**
 * Délier un référent
 */
export async function unlinkReferent(referentId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non authentifié' }

  const { error } = await supabase
    .from('student_referent_links')
    .delete()
    .eq('student_id', user.id)
    .eq('referent_id', referentId)

  if (error) {
    return { error: 'Erreur suppression lien' }
  }

  return { success: true }
}
```

### 4.2 Gestion compte référent

```typescript
// lib/database/referent.ts
'use server'

import { createClient } from '@/lib/supabase/server'

/**
 * Lier un élève via son code
 */
export async function linkStudent(studentCode: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non authentifié' }

  // Vérifier que c'est bien un référent
  const { data: profile } = await supabase
    .from('profiles')
    .select('account_type')
    .eq('id', user.id)
    .single()

  if (profile?.account_type !== 'referent') {
    return { error: 'Seuls les référents peuvent lier des élèves' }
  }

  // Trouver l'élève avec ce code
  const { data: student, error: studentError } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .eq('student_code', studentCode.toUpperCase())
    .eq('account_type', 'student')
    .single()

  if (studentError || !student) {
    return { error: 'Code invalide ou élève introuvable' }
  }

  // Vérifier que le lien n'existe pas déjà
  const { data: existingLink } = await supabase
    .from('student_referent_links')
    .select('id')
    .eq('student_id', student.id)
    .eq('referent_id', user.id)
    .single()

  if (existingLink) {
    return { error: 'Cet élève est déjà lié à votre compte' }
  }

  // Créer le lien
  const { error: linkError } = await supabase
    .from('student_referent_links')
    .insert({
      student_id: student.id,
      referent_id: user.id
    })

  if (linkError) {
    return { error: 'Erreur création lien' }
  }

  return {
    success: true,
    student: JSON.parse(JSON.stringify(student))
  }
}

/**
 * Récupère tous les élèves suivis par le référent
 */
export async function getLinkedStudents() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('student_referent_links')
    .select(`
      id,
      linked_at,
      notification_enabled,
      student:profiles!student_id (
        id,
        full_name,
        email,
        avatar_url,
        created_at
      )
    `)
    .eq('referent_id', user.id)
    .order('linked_at', { ascending: false })

  if (error) {
    console.error('Erreur récupération élèves:', error)
    return []
  }

  return JSON.parse(JSON.stringify(data || []))
}

/**
 * Récupère les statistiques d'un élève spécifique
 */
export async function getStudentStats(studentId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Vérifier que le référent a bien accès à cet élève
  const { data: link } = await supabase
    .from('student_referent_links')
    .select('id')
    .eq('referent_id', user.id)
    .eq('student_id', studentId)
    .single()

  if (!link) {
    return { error: 'Accès non autorisé' }
  }

  // Récupérer les progrès de l'élève
  const { data: progress } = await supabase
    .from('user_challenge_progress')
    .select(`
      *,
      challenges (
        competence,
        difficulty,
        title
      )
    `)
    .eq('user_id', studentId)
    .eq('status', 'completed')
    .order('completed_at', { ascending: false })

  return JSON.parse(JSON.stringify(progress || []))
}

/**
 * Activer/désactiver notifications pour un élève
 */
export async function toggleStudentNotifications(studentId: string, enabled: boolean) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non authentifié' }

  const { error } = await supabase
    .from('student_referent_links')
    .update({ notification_enabled: enabled })
    .eq('referent_id', user.id)
    .eq('student_id', studentId)

  if (error) {
    return { error: 'Erreur mise à jour paramètre' }
  }

  return { success: true }
}
```

### 4.3 Système de notifications

```typescript
// lib/notifications/push.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import admin from 'firebase-admin'

// Initialiser Firebase Admin (à faire au démarrage)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  })
}

/**
 * Envoyer notification push aux référents d'un élève
 * À appeler après completion d'un challenge
 */
export async function notifyReferents(studentId: string, challengeData: {
  competence: string
  difficulty: string
  score: number
  totalExercises: number
}) {
  const supabase = await createClient()

  // Récupérer info élève
  const { data: student } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', studentId)
    .single()

  if (!student) return

  // Récupérer référents avec notifications activées
  const { data: links } = await supabase
    .from('student_referent_links')
    .select(`
      referent_id,
      referent:profiles!referent_id (
        fcm_token
      )
    `)
    .eq('student_id', studentId)
    .eq('notification_enabled', true)

  if (!links || links.length === 0) return

  // Formater compétence pour affichage
  const competenceLabel = {
    developpement: 'Développement',
    reduction: 'Réduction',
    factorisation: 'Factorisation'
  }[challengeData.competence]

  const difficultyLabel = {
    facile: 'Facile',
    moyen: 'Moyen',
    difficile: 'Difficile'
  }[challengeData.difficulty]

  const title = `${student.full_name} a terminé un challenge !`
  const body = `${competenceLabel} - ${difficultyLabel} : ${challengeData.score}/${challengeData.totalExercises}`

  // Envoyer notification à chaque référent
  const notifications = links
    .filter(link => link.referent?.fcm_token)
    .map(async (link) => {
      try {
        // Envoyer via FCM
        await admin.messaging().send({
          token: link.referent.fcm_token,
          notification: {
            title,
            body,
          },
          data: {
            type: 'challenge_completed',
            studentId,
            competence: challengeData.competence,
            difficulty: challengeData.difficulty,
            score: challengeData.score.toString(),
          },
          android: {
            priority: 'high',
            notification: {
              sound: 'default',
              channelId: 'challenge_notifications',
            },
          },
          apns: {
            payload: {
              aps: {
                sound: 'default',
                badge: 1,
              },
            },
          },
        })

        // Sauvegarder dans DB pour historique
        await supabase.from('push_notifications').insert({
          recipient_id: link.referent_id,
          student_id: studentId,
          notification_type: 'challenge_completed',
          title,
          body,
          data: challengeData,
        })

        return { success: true, referentId: link.referent_id }
      } catch (error) {
        console.error('Erreur envoi notification:', error)
        return { success: false, referentId: link.referent_id, error }
      }
    })

  const results = await Promise.all(notifications)
  console.log('Notifications envoyées:', results)

  return results
}

/**
 * Enregistrer le token FCM d'un utilisateur
 */
export async function registerFCMToken(token: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non authentifié' }

  const { error } = await supabase
    .from('profiles')
    .update({ fcm_token: token })
    .eq('id', user.id)

  if (error) {
    return { error: 'Erreur enregistrement token' }
  }

  return { success: true }
}
```

---

## 5. Modifications interface utilisateur

### 5.1 Sélection type compte à l'inscription

```typescript
// app/(auth)/register/page.tsx - Ajout sélection rôle

const [accountType, setAccountType] = useState<'student' | 'referent'>('student')

// Dans le formulaire :
<div className="space-y-4 mb-6">
  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
    Je suis :
  </label>
  <div className="grid grid-cols-2 gap-4">
    <button
      type="button"
      onClick={() => setAccountType('student')}
      className={`p-4 border-2 rounded-lg transition-colors ${
        accountType === 'student'
          ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
          : 'border-gray-300 dark:border-gray-600'
      }`}
    >
      <div className="text-4xl mb-2">🎓</div>
      <div className="font-medium">Élève</div>
      <div className="text-xs text-gray-600 dark:text-gray-400">
        Je veux m'entraîner en maths
      </div>
    </button>

    <button
      type="button"
      onClick={() => setAccountType('referent')}
      className={`p-4 border-2 rounded-lg transition-colors ${
        accountType === 'referent'
          ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
          : 'border-gray-300 dark:border-gray-600'
      }`}
    >
      <div className="text-4xl mb-2">👨‍👩‍👧‍👦</div>
      <div className="font-medium">Référent</div>
      <div className="text-xs text-gray-600 dark:text-gray-400">
        Je veux suivre des élèves
      </div>
    </button>
  </div>
</div>

// Puis lors de la création du profil :
await supabase.from('profiles').insert({
  id: user.id,
  full_name: formData.fullName,
  email: formData.email,
  account_type: accountType, // 'student' ou 'referent'
})
```

### 5.2 Page paramètres élève - Génération code

```typescript
// app/(app)/settings/student/page.tsx

'use client'

import { useState, useEffect } from 'react'
import { generateStudentCode, getLinkedReferents } from '@/lib/database/student'
import QRCode from 'qrcode'

export default function StudentSettings() {
  const [code, setCode] = useState<string | null>(null)
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('')
  const [referents, setReferents] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    const result = await generateStudentCode()
    if (result.code) {
      setCode(result.code)
      // Générer QR code
      const qr = await QRCode.toDataURL(result.code)
      setQrCodeUrl(qr)
    }

    const refs = await getLinkedReferents()
    setReferents(refs)
  }

  async function shareCode() {
    if (!code) return

    if (navigator.share) {
      await navigator.share({
        title: 'Mon code élève Calcul Littéral',
        text: `Mon code de liaison : ${code}`,
      })
    } else {
      await navigator.clipboard.writeText(code)
      alert('Code copié !')
    }
  }

  return (
    <div className="container mx-auto max-w-2xl p-4">
      <h1 className="text-2xl font-bold mb-6">Paramètres élève</h1>

      {/* Code de liaison */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Mon code de liaison</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Partagez ce code avec un parent ou tuteur pour qu'il puisse suivre votre progression.
        </p>

        {code ? (
          <div className="space-y-4">
            {/* Code texte */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center">
              <div className="text-3xl font-mono font-bold text-blue-600 dark:text-blue-400 tracking-wider">
                {code}
              </div>
            </div>

            {/* QR Code */}
            <div className="flex justify-center">
              <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48" />
            </div>

            {/* Bouton partage */}
            <button
              onClick={shareCode}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              📤 Partager mon code
            </button>
          </div>
        ) : (
          <div className="animate-pulse">Chargement...</div>
        )}
      </div>

      {/* Liste référents liés */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Référents liés ({referents.length})</h2>

        {referents.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Aucun référent lié pour le moment.
          </p>
        ) : (
          <div className="space-y-3">
            {referents.map((link) => (
              <div key={link.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <div className="font-medium">{link.referent.full_name}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {link.referent.email}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-500">
                    Lié le {new Date(link.linked_at).toLocaleDateString('fr-FR')}
                  </div>
                </div>
                <button
                  onClick={() => handleUnlink(link.referent.id)}
                  className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                >
                  Délier
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
```

### 5.3 Page dashboard référent

```typescript
// app/(app)/dashboard/referent/page.tsx

'use client'

import { useState, useEffect } from 'react'
import { getLinkedStudents } from '@/lib/database/referent'
import Link from 'next/link'

export default function ReferentDashboard() {
  const [students, setStudents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStudents()
  }, [])

  async function loadStudents() {
    setLoading(true)
    const data = await getLinkedStudents()
    setStudents(data)
    setLoading(false)
  }

  if (loading) {
    return <div>Chargement...</div>
  }

  return (
    <div className="container mx-auto max-w-4xl p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Mes élèves</h1>
        <Link
          href="/dashboard/referent/add-student"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          ➕ Ajouter un élève
        </Link>
      </div>

      {students.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center">
          <div className="text-6xl mb-4">👨‍👩‍👧‍👦</div>
          <h2 className="text-xl font-semibold mb-2">Aucun élève suivi</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Commencez par ajouter un élève en entrant son code de liaison.
          </p>
          <Link
            href="/dashboard/referent/add-student"
            className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Ajouter mon premier élève
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {students.map((link) => (
            <Link
              key={link.id}
              href={`/dashboard/referent/student/${link.student.id}`}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-xl">
                    {link.student.avatar_url ? (
                      <img src={link.student.avatar_url} className="w-full h-full rounded-full" />
                    ) : (
                      '🎓'
                    )}
                  </div>
                  <div>
                    <div className="font-semibold text-lg">{link.student.full_name}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Suivi depuis {new Date(link.linked_at).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                </div>

                {/* Badge notifications */}
                <div className={`px-2 py-1 rounded text-xs ${
                  link.notification_enabled
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}>
                  {link.notification_enabled ? '🔔 Actif' : '🔕 Muet'}
                </div>
              </div>

              {/* Aperçu stats (à compléter avec données réelles) */}
              <div className="grid grid-cols-3 gap-2 text-center text-sm">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded p-2">
                  <div className="font-bold text-blue-600 dark:text-blue-400">--</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Challenges</div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 rounded p-2">
                  <div className="font-bold text-green-600 dark:text-green-400">--%</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Réussite</div>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded p-2">
                  <div className="font-bold text-purple-600 dark:text-purple-400">--j</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Dernier</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
```

### 5.4 Page ajout élève (scan code)

```typescript
// app/(app)/dashboard/referent/add-student/page.tsx

'use client'

import { useState } from 'react'
import { linkStudent } from '@/lib/database/referent'
import { useRouter } from 'next/navigation'

export default function AddStudentPage() {
  const router = useRouter()
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await linkStudent(code.trim().toUpperCase())

    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    // Succès
    router.push('/dashboard/referent')
  }

  return (
    <div className="container mx-auto max-w-md p-4">
      <h1 className="text-2xl font-bold mb-6">Ajouter un élève</h1>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Code de liaison de l'élève
          </label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="A3K9L2"
            maxLength={6}
            className="w-full px-4 py-3 border rounded-lg text-center text-2xl font-mono tracking-wider uppercase"
            required
          />
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Entrez le code à 6 caractères fourni par l'élève
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-red-700 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || code.length !== 6}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
        >
          {loading ? 'Vérification...' : 'Ajouter l\'élève'}
        </button>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">ou</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => alert('Scanner QR code (à implémenter avec capacitor)')}
          className="w-full py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg font-medium transition-colors"
        >
          📷 Scanner un QR code
        </button>
      </form>
    </div>
  )
}
```

---

## 6. Intégration Capacitor

### 6.1 Installation et configuration

```bash
# Installation Capacitor
npm install @capacitor/core @capacitor/cli
npm install @capacitor/ios @capacitor/android

# Initialiser Capacitor
npx cap init "Calcul Littéral" "com.calculitteral.app"

# Ajouter plateformes
npx cap add ios
npx cap add android

# Plugins nécessaires
npm install @capacitor/push-notifications
npm install @capacitor/app
npm install @capacitor/splash-screen
npm install @capacitor/status-bar
```

### 6.2 Configuration Firebase

```typescript
// lib/firebase/config.ts

import { initializeApp } from 'firebase/app'
import { getMessaging, getToken, onMessage } from 'firebase/messaging'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)
const messaging = getMessaging(app)

export { messaging, getToken, onMessage }
```

### 6.3 Gestion notifications côté client

```typescript
// lib/notifications/client.ts

import { PushNotifications } from '@capacitor/push-notifications'
import { registerFCMToken } from '@/lib/notifications/push'

export async function initializePushNotifications() {
  // Demander permission
  const permission = await PushNotifications.requestPermissions()

  if (permission.receive === 'granted') {
    await PushNotifications.register()
  }

  // Écouter les événements
  PushNotifications.addListener('registration', async (token) => {
    console.log('FCM Token:', token.value)
    // Enregistrer en DB
    await registerFCMToken(token.value)
  })

  PushNotifications.addListener('pushNotificationReceived', (notification) => {
    console.log('Notification reçue:', notification)
    // Afficher notification locale si app au premier plan
  })

  PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
    console.log('Notification cliquée:', notification)
    // Naviguer vers page appropriée
    const data = notification.notification.data
    if (data.type === 'challenge_completed' && data.studentId) {
      window.location.href = `/dashboard/referent/student/${data.studentId}`
    }
  })
}
```

---

## 7. Roadmap implémentation

### Phase 1 : Backend (2-3 jours)
- [ ] Créer migrations SQL (profiles, student_referent_links, push_notifications)
- [ ] Implémenter Server Actions (student.ts, referent.ts)
- [ ] Tester génération codes uniques
- [ ] Tester liaisons élève-référent

### Phase 2 : Interface élève (2 jours)
- [ ] Ajouter sélection type compte à inscription
- [ ] Page paramètres élève avec code + QR
- [ ] Liste référents liés
- [ ] Tests utilisateur

### Phase 3 : Interface référent (3 jours)
- [ ] Dashboard référent (liste élèves)
- [ ] Page ajout élève (saisie code)
- [ ] Page détails élève avec stats
- [ ] Paramètres notifications par élève

### Phase 4 : Notifications push (3-4 jours)
- [ ] Setup Firebase projet
- [ ] Implémenter Server Action envoi notifications
- [ ] Modifier saveChallengeResults pour trigger notifications
- [ ] Tester réception notifications

### Phase 5 : Capacitor (4-5 jours)
- [ ] Installer et configurer Capacitor
- [ ] Adapter layout pour mobile (safe areas)
- [ ] Implémenter push notifications natives
- [ ] Scanner QR code avec caméra
- [ ] Tests sur émulateurs iOS/Android

### Phase 6 : Tests et déploiement (3-4 jours)
- [ ] Tests complets flux élève
- [ ] Tests complets flux référent
- [ ] Tests notifications (iOS et Android)
- [ ] Corrections bugs
- [ ] Préparation assets App Store (icônes, screenshots)
- [ ] Soumission App Store + Google Play

---

## 8. Estimation totale

**Temps développement** : 17-21 jours

**Coûts première année** :
- Apple Developer : 99€
- Google Play : 25€ (unique)
- Firebase (gratuit jusqu'à 10M envois/mois)
- **Total : 124€**

**Coûts années suivantes** :
- Apple Developer : 99€/an
- Firebase : gratuit (ou ~5-10€/mois si >10M notifs)

---

## 9. Alternatives considérées

| Solution | Avantages | Inconvénients | Coût |
|----------|-----------|---------------|------|
| **SMS Twilio** | Réception garantie | 60€/mois (100 élèves) | 720€/an |
| **SMS OVH** | Prix FR compétitifs | Moins flexible que Twilio | ~50€/mois |
| **Push notifications** | Gratuit, instantané | Nécessite app installée | 124€/an (stores) |
| **Email** | Gratuit | Pas assez immédiat | 0€ |

**Décision** : Push notifications via app mobile = meilleur rapport qualité/prix/expérience utilisateur.
