# Relier Atelier Local à Supabase

Tout se fait dans le navigateur. Vous n’avez rien à installer sur un serveur. Le fichier à coller est `setup.sql`, à côté de ce guide.

## 1. Créer le projet gratuit

1. Ouvrez [https://supabase.com](https://supabase.com) et créez un compte.
2. **New project**. Choisissez un nom, un mot de passe de base (gardez-le, il ne va pas dans l’atelier) et une région proche.
3. Attendez que le projet soit prêt.

## 2. Coller le SQL

1. Dans le projet : **SQL Editor** → **New query**.
2. Ouvrez `supabase/setup.sql`, copiez tout le fichier, collez-le dans l’éditeur.
3. **Run**. Vous devez voir un succès, sans erreur rouge.
4. On peut relancer le même fichier : il ne recrée pas ce qui existe déjà.

Cela crée les tables `documents` et `files`, les règles qui limitent chaque ligne à `auth.uid()`, les dates `updated_at`, le bucket privé `atelier-files` (50 Mo par fichier) et les règles du stockage : un compte ne lit que le dossier à son identifiant.

## 3. Activer l’e-mail

1. **Authentication** → **Sign In / Providers** → **Email** : activé.
2. Le mot de passe et le lien magique utilisent ce même fournisseur.
3. **Confirm email** : laissez-le activé si vous voulez qu’une adresse soit vérifiée avant la première connexion. Décochez-le seulement pour un essai immédiat.

## 4. Adresses de retour

**Authentication** → **URL Configuration**.

- **Site URL** : `https://bienvenuesurlej.github.io/atelier-studio/`
- **Redirect URLs**, une par ligne, sans `#` :
  - `https://bienvenuesurlej.github.io/atelier-studio/`
  - `http://127.0.0.1:43123/atelier-studio/`

Le nom du compte s’écrit `bienvenuesurleJ`, mais le navigateur met l’hôte en minuscules. Copiez plutôt l’adresse affichée dans Espace admin : c’est celle que le lien magique doit pouvoir ouvrir.

L’atelier navigue avec le dièse (`#/admin`, `#/video`). Le lien magique, lui, revient sur l’adresse ci-dessus avec `?code=`. Ne mettez pas `#/admin` dans ces champs.

## 5. Copier l’adresse et la clé anon

**Project Settings** → **API** (ou **Data API**).

- **Project URL**, du type `https://xxxx.supabase.co`
- **anon public** key, une longue chaîne qui commence par `eyJ`

La clé **service_role** est secrète. Ne la collez nulle part dans l’atelier, ni dans un fichier du dépôt. L’écran la refuse si vous la confondez avec la clé anon.

## 6. Les saisir dans l’atelier

1. Ouvrez l’atelier, puis **Admin** (ou l’adresse `#/admin`).
2. Collez l’adresse du projet et la clé anon.
3. **Enregistrer ici**.

Ces deux valeurs restent dans ce navigateur. Il n’y a pas besoin de recompiler ni de redeployer. Sur un autre appareil, ouvrez aussi Espace admin et collez les mêmes valeurs.

Variante pour un build : copiez `.env.example` vers `.env` et remplissez `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY`, puis `npm run build`. Ce que vous enregistrez dans Espace admin prime sur ces variables.

## 7. Créer le compte

Dans Espace admin : e-mail et mot de passe, **Créer un compte**, ou **Recevoir un lien**. Ouvrez le message sur le même appareil. Ensuite les projets, films, prospects, devis, plans, réglages et fichiers partent vers ce compte et reviennent sur les autres appareils connectés.

Le pastille en bas à gauche dit `Cet appareil` tant que rien n’est configuré, puis `Synchronisé`, `Hors ligne` ou `À vérifier`.
