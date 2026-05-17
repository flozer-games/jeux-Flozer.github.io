# STARFIRE — Fiche Systeme de Difficulte x Maps

## Les 5 Maps (currentWorld 0 a 4)

| # | ID | Nom | Ambiance | Particularite visuelle |
|---|---|---|---|---|
| 0 | verge | SYSTEME SOLAIRE | Notre systeme | 9 planetes, nebuleuses bleues |
| 1 | aralis | ARALIS DUNES | Desert binaire | 2 soleils, tempetes de sable (dust) |
| 2 | krynos | KRYNOS FROSTBELT | Anneau glaciaire | Geant gele, cristaux (iceShards) |
| 3 | pyron | PYRON CRADLE | Forge volcanique | Planete magma geante, braises (embers) |
| 4 | nyxar | NYXAR VEIL | Voile nebulaire | Nebuleuses violettes denses |

---

## DIFF_SETTINGS — Valeurs actuelles

Chaque parametre est un tableau de 5 valeurs (une par map).
ATTENTION : toutes les valeurs sont identiques — la difficulte ne varie pas selon la map.

### FACILE (easy)

| Parametre | Map 0 | Map 1 | Map 2 | Map 3 | Map 4 |
|---|---|---|---|---|---|
| hpMult (vie ennemis) | 1.0 | 1.0 | 1.0 | 1.0 | 1.0 |
| spMult (vitesse ennemis) | 0.7 | 0.7 | 0.7 | 0.7 | 0.7 |
| bulletSpd (vitesse tirs) | 1.0 | 1.0 | 1.0 | 1.0 | 1.0 |
| maxE (ennemis max ecran) | 5 | 5 | 5 | 5 | 5 |
| spawnRate (frames entre spawns) | 90 | 90 | 90 | 90 | 90 |
| bossHp | 60 | 60 | 60 | 60 | 60 |
| Limite de vagues | 50 | 50 | 50 | 50 | 50 |
| Tireurs grille max | 3 | 3 | 3 | 3 | 3 |

### NORMAL (normal)

| Parametre | Valeur (identique toutes maps) |
|---|---|
| hpMult | 1.3 |
| spMult | 1.0 |
| bulletSpd | 1.8 |
| maxE | 9 |
| spawnRate | 65 frames |
| bossHp | 200 |
| Limite de vagues | Infini |

### DIFFICILE (hard)

| Parametre | Valeur (identique toutes maps) |
|---|---|
| hpMult | 1.5 |
| spMult | 1.3 |
| bulletSpd | 2.4 |
| maxE | 12 |
| spawnRate | 52 frames |
| bossHp | 350 |
| Limite de vagues | Infini |

---

## Types d'ennemis

| Type | Vitesse base | HP base | Score | Deverrouille a |
|---|---|---|---|---|
| basic | 1.0 x spMult | 1 x hpMult | 10 | Des le debut |
| fast | 1.8 x spMult | 1 (fixe) | 20 | Vague >= 3 OU map >= 2 |
| zigzag | 1.2 x spMult | 2 x hpMult | 30 | Vague >= 3 OU map >= 2 |
| hunter | 1.3 x spMult | 2 x hpMult | 35 | Vague >= 4 OU map >= 2 |
| tank | 0.55 x spMult | 3 x hpMult | 50 | Vague >= 6 OU map >= 3 |
| grid (formation 7x3) | fixe 2.2 | 3 x hpMult | 80 | Vague multiple de 10 (boss wave) |

Boss : apparait a chaque vague multiple de 10
Score boss = 500 + vague x 200

---

## Comportement des tirs ennemis (eShoot)

| Type | Pattern de tir |
|---|---|
| basic | 1 tir droit, vitesse bulletSpd |
| fast | 1 tir droit, vitesse bulletSpd |
| tank | 3 tirs simultanees (-1.4 / 0 / +1.4 vx) |
| hunter | 3 tirs en eventail (-0.8 / 0 / +0.8 vx) |
| grid | 1 tir droit, max 3 tireurs par formation (en FACILE) |

---

## Ce qui NE change PAS selon la map (points d'attention)

1. Toutes les valeurs dans DIFF_SETTINGS sont plates (meme valeur map 0 a 4)
2. Les ennemis se deverrouillent par vague OU par numero de map — une fois
   deverrouilles ils restent dans le pool pour toutes les maps suivantes
3. En FACILE : limite a 50 vagues par map, max 3 tireurs en formation grille
4. En NORMAL / DIFFICILE : vagues infinies

---

## Idees d'amelioration possibles

- Ajouter une progression par map dans DIFF_SETTINGS (ex: hpMult croissant)
- Augmenter maxE et reduire spawnRate au fil des maps
- Ajouter des types d'ennemis exclusifs a certaines maps
- Introduire un modificateur de difficulte lie a la map (ex: Pyron = +20% bulletSpd)

---

## Etat du code (starfire-game.js)

```js
const DIFF_SETTINGS = {
  easy: {
    hpMult:    [1.0, 1.0, 1.0, 1.0, 1.0],
    spMult:    [0.7, 0.7, 0.7, 0.7, 0.7],
    bulletSpd: [1.0, 1.0, 1.0, 1.0, 1.0],
    maxE:      [5,   5,   5,   5,   5  ],
    spawnRate: [90,  90,  90,  90,  90 ],
    bossHp:    [60,  60,  60,  60,  60 ],
  },
  normal: {
    hpMult:    [1.3, 1.3, 1.3, 1.3, 1.3],
    spMult:    [1.0, 1.0, 1.0, 1.0, 1.0],
    bulletSpd: [1.8, 1.8, 1.8, 1.8, 1.8],
    maxE:      [9,   9,   9,   9,   9  ],
    spawnRate: [65,  65,  65,  65,  65 ],
    bossHp:    [200, 200, 200, 200, 200],
  },
  hard: {
    hpMult:    [1.5, 1.5, 1.5, 1.5, 1.5],
    spMult:    [1.3, 1.3, 1.3, 1.3, 1.3],
    bulletSpd: [2.4, 2.4, 2.4, 2.4, 2.4],
    maxE:      [12,  12,  12,  12,  12 ],
    spawnRate: [52,  52,  52,  52,  52 ],
    bossHp:    [350, 350, 350, 350, 350],
  },
};

const WORLD_WAVES = {
  easy:   [50, 50, 50, 50, 50],
  normal: [Infinity, Infinity, Infinity, Infinity, Infinity],
  hard:   [Infinity, Infinity, Infinity, Infinity, Infinity],
};
```

---

Fichier genere depuis le projet STARFIRE — V1
Repo : flozer-games/jeux-Flozer.github.io (branch main)
