# 🚀 Guide de déploiement Vercel

## Méthode 1 : Via l'interface Vercel (Recommandée)

### Étape 1 : Connecter le projet

1. Allez sur [https://vercel.com](https://vercel.com)
2. Connectez-vous avec votre compte GitHub
3. Cliquez sur **"Add New..."** → **"Project"**
4. Trouvez votre repo **"Calcul_Litteral"** dans la liste
5. Cliquez sur **"Import"**

### Étape 2 : Configurer les variables d'environnement ⚠️ IMPORTANT

**AVANT de cliquer "Deploy"**, configurez les variables :

1. Dépliez **"Environment Variables"**
2. Ajoutez ces 2 variables :

```
Name: NEXT_PUBLIC_SUPABASE_URL
Value: https://pacubcliweknjxrprdep.supabase.co
```

```
Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhY3ViY2xpd2Vrbmp4cnByZGVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgxNDk2MDUsImV4cCI6MjA4MzcyNTYwNX0.B4VsiDJGNC9QQ3NCE6V6MzlmSrRpCp8q524KRBxZKnw
```

3. **Important** : Cochez les 3 environnements (Production, Preview, Development)

### Étape 3 : Déployer

1. Cliquez sur **"Deploy"**
2. Attendez 2-3 minutes
3. ✅ Votre app sera accessible sur une URL du type : `https://calcul-litteral-xxx.vercel.app`

---

## Méthode 2 : Via le CLI Vercel

### Installation du CLI

```bash
npm install -g vercel
```

### Déploiement

```bash
# Login
vercel login

# Premier déploiement (preview)
vercel

# Déploiement en production
vercel --prod
```

### Configuration des variables d'environnement via CLI

```bash
# Ajouter les variables
vercel env add NEXT_PUBLIC_SUPABASE_URL production
# Entrez : https://pacubcliweknjxrprdep.supabase.co

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
# Entrez votre anon key

# Redéployer pour prendre en compte les variables
vercel --prod
```

---

## Étape 4 : Configurer l'URL de callback pour Google OAuth (Optionnel)

Si vous utilisez Google OAuth :

1. Allez dans **Supabase** → **Authentication** → **URL Configuration**
2. Ajoutez votre URL Vercel dans **"Redirect URLs"** :
   ```
   https://votre-app.vercel.app/auth/callback
   ```

3. Dans **Google Cloud Console** (si OAuth configuré) :
   - Ajoutez l'URL autorisée : `https://votre-app.vercel.app`

---

## ✅ Vérification post-déploiement

Une fois déployé, testez :

1. ✅ Page d'accueil : `https://votre-app.vercel.app/`
2. ✅ Page login : `https://votre-app.vercel.app/login`
3. ✅ Créer un compte
4. ✅ Se connecter
5. ✅ Accéder au dashboard : `https://votre-app.vercel.app/dashboard`
6. ✅ Lancer un challenge : `https://votre-app.vercel.app/challenges`

---

## 🐛 En cas de problème

### Erreur 500 ou variables non définies

1. Vérifiez dans Vercel → **Settings** → **Environment Variables**
2. Les 2 variables doivent être présentes pour les 3 environnements
3. Si vous les ajoutez après le premier déploiement, redéployez :
   - Vercel Dashboard → **Deployments** → **...** (menu) → **Redeploy**

### Erreur d'authentification

Vérifiez que le schéma SQL complet a été exécuté dans Supabase :
- `supabase/schema.sql`
- `supabase/fix-rls-and-trigger.sql`

---

## 📝 Notes importantes

- ⚠️ **Ne committez JAMAIS le fichier `.env.local`** (déjà dans .gitignore)
- ✅ Les variables sont stockées de manière sécurisée dans Vercel
- ✅ Chaque push sur `main` déclenche un redéploiement automatique
- ✅ Les preview deployments sont créés automatiquement pour les PRs

---

## 🔗 Liens utiles

- Votre repo : https://github.com/EP-portfolio/Calcul_Litteral
- Vercel Dashboard : https://vercel.com/dashboard
- Supabase Dashboard : https://supabase.com/dashboard
