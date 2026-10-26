# GR Star — application Android

Application React Native qui ouvre simplement le jeu
(https://christophejean13008.github.io/gr/gr.html) dans une WebView plein écran.

- Le code de l'appli est dans `App.tsx` (adresse du jeu : constante `URL_JEU`).
- Tant que le site est à jour, l'appli l'est aussi : pas besoin de recompiler pour les mises à jour du jeu.

## Compilation

Automatique avec GitHub Actions (`.github/workflows/android.yml`) à chaque modification du dossier `app/`,
ou à la main : onglet **Actions → App Android → Run workflow**.

Les fichiers se téléchargent en bas de la page du build (rubrique **Artifacts**) :
- `grstar-N.apk` : à installer directement sur un téléphone Android ;
- `grstar-N.aab` : à envoyer sur le Play Store.

## Clé de publication (Play Store)

Sans clé, l'appli est signée avec une clé de test : parfait pour essayer, mais refusé par le Play Store.
Pour signer avec ta clé, ajoute dans **Settings → Secrets and variables → Actions** du dépôt :

| Secret | Contenu |
|---|---|
| `ANDROID_KEYSTORE_BASE64` | le fichier `.keystore` encodé en base64 |
| `ANDROID_KEYSTORE_PASSWORD` | mot de passe du keystore |
| `ANDROID_KEY_ALIAS` | alias de la clé |
| `ANDROID_KEY_PASSWORD` | mot de passe de la clé (si différent) |

⚠️ Garde le fichier `.keystore` et ses mots de passe en lieu sûr : sans eux, plus de mise à jour possible sur le Play Store.
