# Atelier Local

Studio pour créer, montrer et livrer des sites à des commerces de proximité. Tout tient dans le navigateur : pas de serveur, pas d’abonnement pour faire tourner l’outil. Les sites exportés sont des fichiers statiques.

## Lancer en local

```bash
npm install
npm run dev
```

L’application écoute sur [http://127.0.0.1:43123/atelier-studio/](http://127.0.0.1:43123/atelier-studio/). Le chemin `/atelier-studio/` est celui du site GitHub Pages.

```bash
npm test
npm run build
```

## Utiliser le studio

1. Créez un projet. Le modèle (restaurant, salon, artisan, landing, boutique, application…) n’est qu’un point de départ.
2. Dans l’éditeur, cliquez un titre, un bouton ou une image. Double-cliquez un texte pour l’écrire. Le panneau de droite change la variante, les couleurs, la taille, l’alignement, et distingue ordinateur, tablette et mobile.
3. Passez une section en canevas libre pour poser des textes, images, boutons, formes, conteneurs et grilles. Glissez-les, redimensionnez-les, tournez-les. Maj+clic ou le rectangle de sélection en prend plusieurs ; alignez-les ou groupez-les. Les positions tablette et mobile sont indépendantes. Le ZIP reprend exactement ces positions.
4. Réordonnez les sections en les glissant dans Calques. Ajoutez-en depuis la bibliothèque (plus de vingt-cinq types, chacun avec plusieurs variantes).
5. Le panneau Animation choisit le déclencheur (chargement, apparition, survol, clic, défilement), l’effet (fondu, glissement, zoom, flou, rotation, 3D, lettres, mots, masque, décalage, parallaxe, bandeau, dégradé) et les réglages, y compris un ressort. Rejouer montre le mouvement. On peut le couper sur mobile. Les visiteurs qui ont demandé moins d’animation voient l’état final.
6. Changez l’univers graphique sans perdre les textes.
7. Exportez un ZIP. Le fichier `LISEZMOI.txt` à l’intérieur explique la mise en ligne. Les animations partent avec le site, sans bibliothèque payante. Le ressort est calculé image par image (raideur, amortissement, masse) dans le JavaScript du ZIP. S’il est demandé moins de mouvement, l’animation est ignorée.

Une image se recadre dans l’inspecteur (formats 1:1, 4:5, 16:9, 3:2, 2:3 ou libre). Le point focal se règle séparément pour l’ordinateur, la tablette et le mobile : le CSS exporté contient le même `object-position`.

Une police woff2, woff, ttf ou otf s’importe dans le style du site, après confirmation des droits. Elle est stockée dans IndexedDB et recopiée dans le ZIP avec une règle `@font-face`.

## Studio Vidéo

Studio Vidéo est une seconde application, ouverte depuis le bouton du même nom. Elle a sa liste de films et sa propre base IndexedDB (`atelier-video`), distincte des sites.

Dix modèles prêts (boutique, promo, produit, avis, menu, événement, immobilier, coach, beauté, artisan) couvrent les formats 9:16, 1:1 et 16:9. On remplace les textes, les images et les clips vidéo (MP4, WebM, MOV). La timeline a des pistes image, vidéo, forme et texte : on déplace un plan, on le raccourcit par les bords, on le coupe à la tête de lecture. Ken Burns, fondu, glissement, zoom et masque restent dans le modèle. Trois musiques CC0 sont fournies, un fichier audio peut les remplacer, le volume et le fondu se règlent, et le son d’un clip peut être coupé.

On peut aussi reprendre le nom, les couleurs et le logo d’un site déjà créé. L’aperçu est en direct, avec annuler et rétablir. L’enregistrement est automatique.

L’export affiche une barre de progression et passe par l’enregistreur du navigateur : MP4 quand il est proposé, sinon WebM. ffmpeg.wasm n’est pas inclus, sa licence est GPL. Aucune API vidéo payante.

Les avis livrés avec un modèle sont des **exemples à remplacer**. Ils ne sont pas présentés comme de vrais clients.

Les projets, prospects, devis et images sont dans **IndexedDB**. Une sauvegarde JSON se trouve dans Réglages. Les projets ne passent pas par `localStorage`.

## Espace admin et synchronisation

Sans configuration, l’atelier reste entièrement local. Pour relier plusieurs appareils, ouvrez **Admin** (`#/admin`).

1. Créez un projet gratuit sur [Supabase](https://supabase.com).
2. Dans le SQL Editor, collez `supabase/setup.sql` et exécutez-le une fois. Le guide détaillé est dans `supabase/LISEZMOI.md`.
3. Activez la connexion par e-mail. Ajoutez comme adresses de retour, sans dièse :
   - `http://127.0.0.1:43123/atelier-studio/`
   - `https://bienvenuesurlej.github.io/atelier-studio/`
4. Copiez l’adresse du projet et la clé **anon** (jamais la clé service_role). Collez-les dans Espace admin : elles restent dans ce navigateur, aucun rebuild n’est nécessaire. On peut aussi les mettre dans `.env` sous `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` avant `npm run build`.

La connexion accepte un mot de passe ou un lien magique. Le lien ramène à la racine du site avec `?code=`, puis la navigation reprend dans le hash. Chaque compte ne lit que ses lignes (RLS) et ses fichiers, rangés dans son dossier du bucket privé `atelier-files`.

IndexedDB reste le cache. Hors ligne, le travail continue et part à la reconnexion. Pour un même projet, prospect ou film, la date la plus récente gagne. Une suppression reste, sauf si l’autre appareil a modifié l’élément après coup. Les réglages du studio suivent la dernière édition. Le pastille en bas à gauche indique l’état.

## Déployer le studio gratuitement

Le studio est un site statique (`npm run build`, dossier `dist`). `vite.config.ts` fixe `base` à `/atelier-studio/`, le chemin du dépôt public [bienvenuesurleJ/atelier-studio](https://github.com/bienvenuesurleJ/atelier-studio).

### GitHub Pages

Le workflow `.github/workflows/pages.yml` lance les tests, construit l’application et déploie `dist` avec GitHub Actions. L’adresse prévue est [https://bienvenuesurleJ.github.io/atelier-studio/](https://bienvenuesurleJ.github.io/atelier-studio/).

La navigation du studio est déjà dans le hash (`#/projets`, `#/projet/…`, `#/video`). Un fichier `404.html` renvoie les autres chemins vers `/atelier-studio/#…`. Les feuilles, scripts et le favicon passent par la base Vite.

Les sites clients exportés en ZIP ont leur propre manifeste et service worker, en chemins relatifs (`./`, `./sw.js`, `start_url: "./"`). Ils se déploient à la racine de leur hébergement, pas sous `/atelier-studio/`.

Dans le dépôt GitHub : **Settings → Pages → Build and deployment → Source : GitHub Actions**. Sans ce choix, le workflow ne peut pas publier.

Aucune clé n’est requise, et aucune n’est dans le dépôt.

### Autre hébergeur, à la racine du domaine

- **Cloudflare Pages** ou **Netlify** : avant le build, remettez `base` à `'/'` dans `vite.config.ts`, puis publiez `dist`. Sur Netlify, [Netlify Drop](https://app.netlify.com/drop) accepte le dossier.

## Livrer le site d’un client, gratuitement

1. Exportez le ZIP et décompressez-le.
2. Déposez le dossier sur Netlify Drop, Cloudflare Pages ou GitHub Pages.
3. Envoyez l’adresse `https://…` au prospect. Ce n’est pas une adresse de votre ordinateur, et le prospect n’ouvre pas le studio.

### Nom de domaine

L’hébergement ci-dessus est gratuit. Le nom de domaine se paie chez un registrar (souvent 10 à 15 € par an) et doit rester **au nom du client**.

Chez Netlify ou Cloudflare Pages, ajoutez le domaine, puis créez chez le registrar l’enregistrement indiqué (souvent un CNAME, ou les serveurs DNS de Cloudflare). Le site continue d’être servi par l’hébergeur gratuit.

## Ce qui marche sans serveur, et ce qui n’est pas simulé

| Besoin | Dans l’export | Limite |
| --- | --- | --- |
| Formulaire | `mailto`, ou Formspree / URL si vous la collez | Aucun message n’est stocké par Atelier |
| Commande | WhatsApp, e-mail, ou lien de paiement collé | Le site ne dit jamais qu’un paiement a réussi |
| Panier | Totaux, taxe et port saisis dans le studio | Pas de stock, pas d’historique |
| Rendez-vous | Demande par e-mail | Aucun agenda n’est bloqué |
| Carte | Google Maps sans clé, à partir de l’adresse | Nécessite une connexion chez le visiteur |
| Fidélité | Tampons dans le navigateur de l’appareil | Pas de synchronisation entre téléphones |
| PWA | Manifeste, icônes, service worker | Pas de notifications push |
| Avis Google, stats, comptes clients | Non inclus | Il faudrait un service externe |

Stripe Checkout avec webhooks, les commandes centralisées et la synchro d’agenda demandent un backend et des clés **hors du navigateur**. L’écran Réglages le détaille. Rien de tout cela n’est imité.

## Trouver les premiers clients

1. Choisissez une rue et un métier.
2. Notez vingt commerces dont le site est absent ou illisible sur téléphone.
3. Préparez une démo **à leur nom** avant de passer.
4. Montrez-la sur votre téléphone, puis envoyez le lien le jour même.
5. Proposez une création (souvent quelques centaines d’euros, le calculateur est dans Activité) et, si vous voulez, un entretien mensuel.
6. L’acompte et le nom de domaine au nom du client évitent les malentendus.
7. Les changements passent par vous : c’est le sens de l’entretien, puisque le site livré est statique.

Un message d’approche et une liste de prospection sont dans Activité. Les chiffres du tableau de bord viennent uniquement de ce que vous avez saisi.

## Architecture

- `src/domain` : projet versionné, styles, sections, connecteurs.
- `src/export` : le même modèle produit l’aperçu et le ZIP (HTML, CSS, JavaScript, SEO, PWA).
- `src/studio` : tableau de bord, projets, éditeur, activité, réglages.
- `src/storage` : IndexedDB et sauvegarde JSON.
- `src/sync` : compte Supabase, fusion et fichiers. Le SQL est dans `supabase/setup.sql`.
- `src/video` : Studio Vidéo, base IndexedDB séparée, timeline et export.
- `.github/workflows/pages.yml` : publication GitHub Pages.

Les animations du site exporté sont du CSS et du JavaScript sans dépendance payante. Elles respectent `prefers-reduced-motion`. L’interface du studio, elle, utilise Motion et dnd-kit, et son thème ne suit pas celui du site client.
