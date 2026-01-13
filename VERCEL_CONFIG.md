# Configuration Vercel - Variables d'Environnement

## ⚠️ Configuration OBLIGATOIRE

Pour que les emails contiennent les bons liens vers votre application, vous DEVEZ configurer ces variables d'environnement sur Vercel.

## 📋 Étapes de Configuration

### 1. Accéder aux Variables d'Environnement

1. Allez sur [vercel.com/dashboard](https://vercel.com/dashboard)
2. Sélectionnez votre projet **Calcul_Litteral**
3. Allez dans **Settings** (onglet en haut)
4. Dans le menu de gauche, cliquez sur **Environment Variables**

### 2. Ajouter les Variables

Ajoutez ces 3 variables pour **tous les environnements** (Production, Preview, Development) :

#### Variable 1 : RESEND_API_KEY
```
Name: RESEND_API_KEY
Value: re_votre_cle_api_resend
Environments: ✅ Production  ✅ Preview  ✅ Development
```

#### Variable 2 : RESEND_FROM_EMAIL
```
Name: RESEND_FROM_EMAIL
Value: onboarding@resend.dev
Environments: ✅ Production  ✅ Preview  ✅ Development
```

#### Variable 3 : NEXT_PUBLIC_SITE_URL
```
Name: NEXT_PUBLIC_SITE_URL
Value: https://calcul-litteral.vercel.app
Environments: ✅ Production  ✅ Preview  ✅ Development
```

> **💡 Important** : La variable `NEXT_PUBLIC_SITE_URL` doit correspondre exactement à votre URL de production Vercel.

### 3. Redéployer

Après avoir ajouté les variables :

1. Allez dans l'onglet **Deployments**
2. Trouvez le dernier déploiement
3. Cliquez sur `...` (trois points) → **Redeploy**
4. Confirmez le redéploiement

> **⚠️ Les variables ne s'appliquent qu'aux NOUVEAUX déploiements** - c'est pourquoi vous devez redéployer.

### 4. Vérifier la Configuration

Après le redéploiement, testez :

1. Créez un nouveau compte étudiant
2. Envoyez une invitation depuis `/settings`
3. Vérifiez l'email reçu
4. **Le lien doit pointer vers** : `https://calcul-litteral.vercel.app/accept-invitation?token=...`

Si le lien pointe toujours vers `localhost`, c'est que la variable n'a pas été prise en compte → redéployez à nouveau.

## 🔧 Troubleshooting

### Le lien pointe toujours vers localhost

**Causes possibles** :
1. Variable d'environnement non ajoutée sur Vercel
2. Variable ajoutée mais pas redéployé
3. Typo dans le nom de la variable (doit être exactement `NEXT_PUBLIC_SITE_URL`)

**Solution** :
1. Vérifiez que la variable existe dans Settings → Environment Variables
2. Vérifiez le nom exact : `NEXT_PUBLIC_SITE_URL` (avec underscores)
3. Redéployez l'application
4. Attendez la fin du déploiement (statut "Ready")
5. Testez à nouveau

### Comment obtenir mon URL Vercel exacte ?

1. Allez sur votre projet Vercel
2. L'URL est affichée en haut : `calcul-litteral.vercel.app`
3. Ou dans **Settings** → **Domains**

### Développement local

Pour le développement local, créez un fichier `.env.local` :

```env
RESEND_API_KEY=re_votre_cle_api_resend
RESEND_FROM_EMAIL=onboarding@resend.dev
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## ✅ Checklist

- [ ] Variables ajoutées sur Vercel (Settings → Environment Variables)
- [ ] Les 3 environnements cochés (Production, Preview, Development)
- [ ] Application redéployée après ajout des variables
- [ ] Déploiement terminé (statut "Ready")
- [ ] Test d'invitation envoyé
- [ ] Lien dans l'email pointe vers `https://calcul-litteral.vercel.app`

## 📞 Support

Si les liens pointent toujours vers localhost après ces étapes :
1. Vérifiez les logs de déploiement Vercel
2. Vérifiez que `NEXT_PUBLIC_SITE_URL` est bien présent dans les variables
3. Essayez de supprimer et ré-ajouter la variable
4. Forcez un nouveau build : Settings → General → "Clear Build Cache & Redeploy"
