# Instructions Projet

## Suivi de consommation - OBLIGATOIRE

À la fin de CHAQUE réponse, affiche un récapitulatif de consommation :
```
📊 Consommation : [X] tokens | [Y] tool uses | [Z]s
```

## Recherche dans le code - OBLIGATOIRE

Pour TOUTE recherche dans le codebase, exécute la commande mgrep via bash :
```bash
mgrep "ta recherche ici"
```

NE JAMAIS utiliser :
- L'outil Explore
- L'outil Search/Grep intégré
- Ripgrep (rg)

mgrep est déjà installé et indexé. Il retourne les fichiers pertinents avec leurs numéros de ligne.

### Exemples
```bash
mgrep "authentication"
mgrep "where is user validation"
mgrep "database connection"
```

Utilise toujours mgrep en premier pour localiser le code, puis lis les fichiers trouvés.