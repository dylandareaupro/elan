# Images d'exercices

**Comment ça marche** — `ExerciseVisual` (`src/components/ui.tsx`) cherche l'image dans cet ordre :

1. `public/assets/exercises/<slug>.png` — le fichier dédié à l'exercice (**dépose-le ici, il s'affiche tout seul, sans toucher au code**)
2. photo « officielle » par mot-clé (`photoForName` dans `src/lib/engine.ts`)
3. dessin line-art (fallback automatique si aucune image)

Le `<slug>` est le nom de l'exercice en minuscules, sans accents, espaces → tirets.
Ex : « Leg Raises » → `leg-raises.png`, « World's Greatest » → `world-s-greatest.png`.

**Format conseillé** (cohérent avec les images existantes) : PNG cutout **sans fond**
(transparent), sujet centré, cadrage carré-ish, une seule personne, style illustratif.

## Fichiers attendus

### ✅ Déjà présents (fichier exact)
- `bicycle-crunch.png` — Bicycle Crunch
- `burpees.png` — Burpees

### 🟡 Couverts par une photo générique (dépose le fichier dédié pour l'améliorer)
- `planche.png` — Planche *(sinon → plank.png)*
- `crunchs.png` — Crunchs *(sinon → crunch.png)*
- `mountain-climbers.png` — Mountain Climbers *(sinon → mountain-climber.png)*
- `gainage-lateral-d.png` — Gainage Latéral D *(sinon → side-plank.png)*
- `gainage-lateral-g.png` — Gainage Latéral G *(sinon → side-plank.png)*
- `hollow-hold.png` — Hollow Hold *(sinon → plank.png, pas idéal)*

### ❌ Manquants (actuellement en line-art) — 26
- `leg-raises.png` — Leg Raises
- `russian-twists.png` — Russian Twists
- `squats.png` — Squats
- `fentes-alternees.png` — Fentes alternées
- `pont-fessier.png` — Pont fessier
- `donkey-kicks.png` — Donkey Kicks
- `hip-thrust.png` — Hip Thrust
- `fire-hydrants.png` — Fire Hydrants
- `superman.png` — Superman
- `bird-dog.png` — Bird-Dog
- `y-t-w.png` — Y-T-W
- `pont-dorsal.png` — Pont dorsal
- `cobra.png` — Cobra
- `fentes.png` — Fentes
- `chaise-murale.png` — Chaise murale
- `mollets-debout.png` — Mollets debout
- `squat-saute.png` — Squat sauté
- `jumping-jacks.png` — Jumping Jacks
- `montees-de-genoux.png` — Montées de genoux
- `talons-fesses.png` — Talons-fesses
- `pompes.png` — Pompes
- `cat-cow.png` — Cat-Cow
- `rotation-des-hanches.png` — Rotation des hanches
- `world-s-greatest.png` — World's Greatest
- `etirement-chaine-post.png` — Étirement chaîne post.
- `cercles-d-epaules.png` — Cercles d'épaules
