# Résumé Projet Mobile - Calcul Littéral

## 🎯 Objectif

Transformer l'application web Calcul Littéral en application mobile (iOS + Android) avec système de suivi parent-élève et notifications push.

---

## 💡 Proposition de valeur

### Problème résolu
Les référents (parents/tuteurs) veulent être notifiés immédiatement quand leur élève termine un challenge, sans coûts SMS récurrents élevés.

### Solution
Application mobile native avec:
- **2 types de comptes** : Élève et Référent
- **Système de liaison par code** : Un code unique par élève
- **Notifications push gratuites** : Via Firebase Cloud Messaging
- **Suivi multi-élèves** : Un référent peut suivre plusieurs élèves

---

## 📊 Comparaison solutions

| Critère | SMS (Twilio) | App Mobile (Capacitor) |
|---------|--------------|-------------------------|
| **Coût première année** | 720€ (60€/mois) | 124€ (stores) |
| **Coût années suivantes** | 720€/an | 99€/an |
| **Délai notification** | Instantané | Instantané |
| **Taux de réception** | ~98% | ~95% (si app installée) |
| **Expérience utilisateur** | SMS basique | Interface riche, historique |
| **Évolutivité** | Coût linéaire avec nb élèves | Coût fixe |
| **ROI sur 3 ans** | -2160€ | -322€ |

**Économie sur 3 ans : 1838€**

---

## 🏗️ Architecture technique

### Stack retenu : Capacitor

**Pourquoi Capacitor ?**
- ✅ Réutilise 95% du code Next.js existant
- ✅ Accès aux APIs natives (notifications, caméra)
- ✅ Build iOS + Android depuis une seule codebase
- ✅ Maintenance simplifiée (pas de duplication code)
- ✅ Performances proches du natif

**Alternatives écartées**
- ❌ React Native : Réécriture complète (~400h)
- ❌ PWA seule : Notifications push limitées sur iOS

### Services externes

| Service | Usage | Coût |
|---------|-------|------|
| **Supabase** | Base de données, auth (déjà utilisé) | Gratuit (plan actuel) |
| **Firebase Cloud Messaging** | Envoi notifications push | Gratuit (<10M/mois) |
| **Apple Developer** | Publication App Store | 99€/an |
| **Google Play Console** | Publication Play Store | 25€ unique |

---

## 🎨 Fonctionnalités par rôle

### Compte Élève

1. **Génération code de liaison**
   - Code unique 6 caractères (ex: A3K9L2)
   - QR code pour partage facile
   - Partage via SMS/email/copie

2. **Gestion référents**
   - Liste référents liés
   - Option délier un référent
   - Nombre illimité de référents

3. **Utilisation normale**
   - Sélection et complétion challenges
   - Statistiques personnelles
   - Historique exercices

### Compte Référent

1. **Ajout élèves**
   - Saisie code 6 caractères
   - Scan QR code (caméra native)
   - Confirmation visuelle

2. **Dashboard multi-élèves**
   - Liste élèves suivis
   - Dernière activité par élève
   - Aperçu statistiques rapides

3. **Vue détails élève**
   - Historique complet challenges
   - Graphiques progression
   - Statistiques par compétence/difficulté
   - Points forts/faibles

4. **Notifications push**
   - Réception immédiate fin challenge
   - Format : "[Prénom] a terminé [Développement - Facile] : 8/10"
   - Clic → Détails challenge élève
   - Option activer/désactiver par élève

---

## 🗄️ Base de données - Modifications

### 1. Table `profiles` (existante - ajout colonnes)

```sql
ALTER TABLE profiles ADD COLUMN:
- account_type: 'student' | 'referent'
- student_code: Code unique 6 caractères (NULL si référent)
- fcm_token: Token Firebase pour notifications push
- code_generated_at: Date génération code
```

### 2. Table `student_referent_links` (nouvelle)

```sql
Colonnes:
- student_id: FK → profiles
- referent_id: FK → profiles
- linked_at: Date liaison
- notification_enabled: Activer/désactiver notifs

Contrainte: UNIQUE(student_id, referent_id)
RLS: Chacun voit ses propres liens
```

### 3. Table `push_notifications` (nouvelle)

```sql
Colonnes:
- recipient_id: FK → profiles (référent)
- student_id: FK → profiles
- notification_type: 'challenge_completed' | 'achievement_unlocked'
- title: Titre notification
- body: Contenu notification
- data: JSONB (score, compétence, etc.)
- sent_at: Date envoi
- read_at: Date lecture (NULL si non lu)

Usage: Historique notifications pour interface app
```

---

## 🔐 Sécurité et permissions

### Politique RLS (Row Level Security)

**Élèves** :
- ✅ Peuvent voir leurs propres liens
- ✅ Peuvent délier leurs référents
- ❌ Ne peuvent PAS voir les données autres élèves

**Référents** :
- ✅ Peuvent voir leurs propres liens
- ✅ Peuvent voir statistiques élèves liés uniquement
- ✅ Peuvent créer liens (avec code valide)
- ❌ Ne peuvent PAS accéder aux élèves non liés

### Génération codes

- Code 6 caractères alphanumériques majuscules
- Fonction SQL avec garantie d'unicité
- Exemple : A3K9L2, X7M4P1, etc.
- Collision impossible (36^6 = 2 milliards combinaisons)

---

## 🚀 Roadmap implémentation

### Phase 1 : Backend (2-3 jours)
```
- Créer migrations SQL
- Fonction génération codes uniques
- Server Actions gestion liaisons
- Tests API
```

### Phase 2 : Interface élève (2 jours)
```
- Sélection type compte à inscription
- Page paramètres avec code/QR
- Liste référents liés
- Partage code
```

### Phase 3 : Interface référent (3 jours)
```
- Dashboard liste élèves
- Page ajout élève (saisie code)
- Page détails élève avec stats
- Paramètres notifications
```

### Phase 4 : Notifications push (3-4 jours)
```
- Setup projet Firebase
- Server Action envoi notifications
- Modification saveChallengeResults (trigger)
- Tests réception
```

### Phase 5 : Capacitor (4-5 jours)
```
- Installation Capacitor + plugins
- Configuration iOS/Android
- Adaptation layout mobile (safe areas)
- Push notifications natives
- Scanner QR code caméra
- Tests émulateurs
```

### Phase 6 : Tests et déploiement (3-4 jours)
```
- Tests flux complets élève/référent
- Tests notifications iOS/Android
- Corrections bugs
- Assets App Store (icônes, screenshots)
- Soumission Apple + Google
```

**Durée totale estimée : 17-21 jours**

---

## 💰 Budget détaillé

### Coûts de développement
- Développeur (17-21 jours) : Selon taux horaire/journalier
- Design assets (icônes app, screenshots) : ~200-300€ si externe

### Coûts première année
| Poste | Montant | Fréquence |
|-------|---------|-----------|
| Apple Developer Program | 99€ | Annuel |
| Google Play Console | 25€ | Unique |
| Firebase Cloud Messaging | 0€ | Gratuit (<10M) |
| Supabase | 0€ | Plan actuel |
| **TOTAL** | **124€** | **Première année** |

### Coûts années suivantes
| Poste | Montant | Fréquence |
|-------|---------|-----------|
| Apple Developer Program | 99€ | Annuel |
| Firebase Cloud Messaging | 0-10€ | Mensuel (si >10M) |
| **TOTAL** | **99€** | **Par an** |

### Comparaison avec SMS sur 5 ans

| Année | SMS (100 élèves) | App Mobile | Économie |
|-------|------------------|------------|----------|
| An 1 | 720€ | 124€ | +596€ |
| An 2 | 720€ | 99€ | +621€ |
| An 3 | 720€ | 99€ | +621€ |
| An 4 | 720€ | 99€ | +621€ |
| An 5 | 720€ | 99€ | +621€ |
| **Total 5 ans** | **3600€** | **520€** | **3080€** |

**ROI : L'app mobile s'autofinance dès la première année**

---

## 📱 Expérience utilisateur

### Flux Élève (première utilisation)

```
1. Téléchargement app (App Store / Play Store)
2. Inscription → Sélection "Je suis élève"
3. Accès challenges (utilisation normale)
4. [Optionnel] Paramètres → "Partager mon code"
5. Code affiché + QR code
6. Partage par SMS/email au parent
```

### Flux Référent (première utilisation)

```
1. Téléchargement app
2. Inscription → Sélection "Je suis référent"
3. Dashboard vide → "Ajouter un élève"
4. Saisie code reçu de l'élève (ou scan QR)
5. Confirmation "Élève ajouté : [Prénom]"
6. Dashboard affiche carte élève
7. Activation automatique notifications push
```

### Notification type

```
🔔 [11h23] Calcul Littéral

Lucas a terminé un challenge !
Développement - Facile : 8/10

[Cliquer pour voir détails]
```

---

## 🎯 Indicateurs de succès

### Métriques techniques
- ✅ Temps de build < 2 min
- ✅ Taille app < 50 MB
- ✅ Délai notification < 5 secondes
- ✅ Taux de livraison notifications > 95%

### Métriques utilisateur
- ✅ Taux d'installation référents > 70%
- ✅ Nombre moyen élèves par référent : 1-3
- ✅ Taux d'activation notifications : 80%
- ✅ Note App Store / Play Store > 4.5/5

### Métriques business
- ✅ Réduction coût notifications : -83% vs SMS
- ✅ Engagement référents (retour régulier) : +50%
- ✅ Satisfaction utilisateurs (NPS) : > 50

---

## ⚠️ Risques et mitigation

| Risque | Impact | Probabilité | Mitigation |
|--------|--------|-------------|------------|
| **Référents n'installent pas l'app** | Élevé | Moyen | Email onboarding explicatif, tutoriel vidéo |
| **Problèmes soumission App Store** | Moyen | Faible | Suivre guidelines Apple, tests pré-soumission |
| **Bugs notifications iOS** | Moyen | Moyen | Tests exhaustifs sur devices réels, fallback email |
| **Code 6 caractères perdus** | Faible | Moyen | Fonction régénération code dans paramètres |
| **Dépassement quota Firebase** | Faible | Très faible | Monitoring usage, migration plan payant si besoin |

---

## 🔄 Évolutions futures possibles

### Phase 2 (post-lancement)
- **Gamification** : Badges, niveaux, récompenses
- **Classements** : Entre élèves d'un même référent
- **Mode hors-ligne** : Challenges sans connexion
- **Export PDF** : Rapports de progression

### Phase 3 (long terme)
- **Compte professeur** : Gestion classe entière
- **Statistiques avancées** : IA détection difficultés
- **Contenus additionnels** : Plus de compétences mathématiques
- **Intégration LMS** : Pronote, ENT, etc.

---

## 📞 Prochaines étapes

### Décision requise
☐ Valider l'approche app mobile vs SMS
☐ Confirmer budget développement
☐ Définir planning de développement

### Actions immédiates (si validation)
1. Créer projet Firebase
2. Commencer migrations SQL (Phase 1)
3. Designer icônes app (1024×1024 iOS, adaptative Android)
4. Préparer comptes Apple Developer + Google Play

### Documents de référence
- `ARCHITECTURE_MOBILE.md` : Spécifications techniques complètes
- `SECURITY_AUDIT.md` : Audit sécurité existant (95/100)
- `supabase/` : Scripts SQL existants

---

## 📋 Checklist validation projet

**Technique**
- [x] Architecture définie
- [x] Stack technique choisie
- [x] Base de données planifiée
- [x] Sécurité vérifiée
- [x] Services externes identifiés

**Business**
- [x] Problème client identifié
- [x] Solution proposée
- [x] Budget calculé
- [x] ROI démontré
- [x] Risques évalués

**Planning**
- [x] Roadmap détaillée
- [x] Estimation temps réaliste
- [x] Dépendances identifiées
- [ ] Équipe disponible
- [ ] Dates de livraison fixées

---

**Document créé le** : 2026-01-13
**Statut** : Proposition technique complète
**Contact** : Claude Code (assistant technique)
