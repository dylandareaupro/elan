# Ventre plat — Coach fitness (PWA)

Application de fitness à domicile **en français, sans compte, 100 % locale**. Un coach
décris ton objectif, il génère un **programme sur mesure** que l'app exécute (timer,
voix, tours, suivi). Implémentation réelle du prototype Claude Design, en **PWA installable**.

> Stack : **Vite + React + TypeScript + vite-plugin-pwa**. Coach **offline-first** (génération
> de plan locale, sans clé API). Direction artistique : indigo + orange + menthe, display
> Archivo, corps Hanken Grotesk, vraies photos d'exercices détourées.

## Démarrer

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # typecheck + bundle de prod (dist/)
npm run preview      # sert le build de prod (teste le service worker / PWA)
```

## Ce qu'il y a dedans

- **Onboarding** — profil (prénom · âge · taille · poids · sexe · niveau · fréquence,
  pré-rempli 30/180/70) → barre d'objectif champ libre + **tags multi-sélection** combinables
  (Ventre plat + Abdos visibles…) → **coach multi-tours** (questions de clarification +
  réponses rapides) → carte programme → Adopter.
- **7 écrans** : Accueil, Programmes, Workout (timer réel + photo de l'exo), Repos (anneau de
  respiration), Terminé (carte partageable), Progrès (anneau + filtres 7/30/90 j + courbe),
  Profil.
- **Barre d'onglets** sombre avec bouton central orange « Démarrer ».
- **Coach 3 modes** : Nouveau · Modifier · Conseils.
- **Moteur réel** : timer, voix FR (`speechSynthesis`), bips (Web Audio), vibrations,
  progression auto (5 séances/semaine → semaine suivante), tout persisté en `localStorage`.
- **Apparence** réglable dans Profil : palette (Clair/Crème/Brume), illustrations
  (Photo/Line art), calendrier (Pills/Heatmap).

## Architecture

```
src/
  lib/engine.ts              données, palettes, stockage, génération de plan, coach local
  components/
    Icon.tsx, ExerciseFigure.tsx   icônes ligne + silhouettes line-art animées
    ImageSlot.tsx            slot photo drag-drop / clic, persisté (localStorage)
    IOSDevice.tsx            cadre iPhone (status bar, dynamic island, home indicator)
    ui.tsx                   kit UI (cartes, anneaux, charts, pills, BottomNav…)
    coach/Coach.tsx          onboarding, chat, sheet, aperçu de plan
  screens (dans App.tsx)     Accueil / Programmes / Workout / Repos / Terminé / Progrès / Profil
  App.tsx                    état global, logique timer, montage
public/assets/exercises/*    7 photos d'exercices détourées (officielles, par titre)
public/assets/coach.png      avatar du coach
```

## Coach IA — état actuel

Le coach tourne **entièrement en local** (`engine.localCoachTurn`) : il détecte les zones
depuis le texte, pose 1–2 questions, puis compose un plan (exercices + 4 semaines
progressives calibrées au niveau). Aucune clé, jamais cassé, fonctionne hors-ligne.

**Brancher une vraie IA plus tard** : exposer une fonction serverless (ex. Vercel
`/api/coach`) qui garde `ANTHROPIC_API_KEY` côté serveur et appelle `claude-opus-4-8` avec le
système défini dans le prototype, puis remplacer l'appel dans `coach/Coach.tsx` (`callCoach`)
— en gardant `localCoachTurn` comme repli hors-ligne.

## Pistes

- Export image réel de la carte de fin (canvas → story).
- Édition/suppression de programmes.
- Plein écran sans le cadre iPhone (le cadre reproduit la maquette ; à retirer pour un
  rendu edge-to-edge sur device).
