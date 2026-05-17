# STARFIRE — Document Technique Complet
> Livrable pour Claude Chat — État du projet au 17 mai 2026  
> Repo : `flozer-games/jeux-Flozer.github.io` (branch `main`)

---

## 1. STRUCTURE DES FICHIERS

```
Starfire/V1/
├── Starfire.html        → HTML, CSS, scaling responsive
├── starfire-config.js   → Ships, Maps, Weapons, Bonuses, DIFF_SETTINGS, QUOTES
├── starfire-game.js     → Moteur complet du jeu (2 500+ lignes)
```

Le jeu tourne entièrement dans le navigateur, aucun serveur requis.  
Scores sauvegardés sur **Supabase** (online) ou **localStorage** (fallback).

---

## 2. CANVAS & SCALING

| Paramètre | Valeur |
|-----------|--------|
| Canvas W | 640 px |
| Canvas H | 840 px |
| Élément `#wrap` | `640×840px`, `overflow:hidden`, `clip-path:inset(0)` |
| Scaling CSS | `transform:scale()` calculé depuis `window.innerWidth/Height` |

```js
function scaleGame(){
  var vw=window.innerWidth, vh=window.innerHeight;
  var scale=Math.min(vw/640, vh/840)*0.97;
  var scaledW=640*scale, scaledH=840*scale;
  wrap.style.transform='scale('+scale+')';
  wrap.style.left=Math.round((vw-scaledW)/2)+'px';
  wrap.style.top=Math.round((vh-scaledH)/2)+'px';
}
```

`isMobile = window.matchMedia('(pointer:coarse)').matches` → active le joystick virtuel.

---

## 3. VARIABLES GLOBALES CLÉS

```js
const W=640, H=840;
let difficulty = 'normal';   // 'easy' | 'normal' | 'hard'
let currentWorld = 0;        // index map actuelle (0–4)
let chosenMap = MAPS[0];     // objet map actuelle
let chosenShip = SHIPS[0];   // objet vaisseau choisi
let wave = 1;                // vague actuelle
let score = 0;
let lives = 3;
let GS = 'menu';             // état jeu : 'menu'|'playing'|'pause'|'gameover'|'roulette'|'transition'|'victory'
let sensitivity = 1.0;       // multiplicateur vitesse joueur (0.5–2.0)
let inputMode = 'keyboard';  // 'keyboard' | 'gamepad'
let mpMode = false;          // multijoueur P2P actif
```

---

## 4. ÉTATS DU JEU (GS)

| État | Description |
|------|-------------|
| `'menu'` | Écran principal avec score/contrôles |
| `'playing'` | Partie en cours, boucle RAF active |
| `'pause'` | Jeu en pause (ESC ou bouton pause) |
| `'gameover'` | Fin de partie, affiche score + pseudo |
| `'roulette'` | Machine à sous arme (toutes les 5 vagues) |
| `'transition'` | Écran entre deux maps |
| `'victory'` | Victoire (tous secteurs libérés — mode EASY seulement) |

---

## 5. MAPS (currentWorld 0 à 4)

Définies dans `starfire-config.js`, tableau `MAPS[]`.

| Index | ID | Nom | Ambiance | Particularité |
|-------|----|-----|----------|---------------|
| 0 | verge | SYSTÈME SOLAIRE | Espace profond | 9 planètes, nébuleuses bleues |
| 1 | aralis | ARALIS DUNES | Désert binaire | 2 soleils, tempêtes de sable (`dust:true`) |
| 2 | krynos | KRYNOS FROSTBELT | Anneau glaciaire | Géant gelé, cristaux (`iceShards:true`) |
| 3 | pyron | PYRON CRADLE | Forge volcanique | Planète magma, braises (`embers:true`) |
| 4 | nyxar | NYXAR VEIL | Voile nébulaire | Nébuleuses violettes denses |

Chaque map a : `sky`, `starHues`, `bgKind`, `suns[]`, `planets[]`, `nebulas[]`, `bholes[]`, et des effets spéciaux optionnels.

**Les maps = DÉCOR UNIQUEMENT.** La difficulté ne varie pas selon la map.  
`currentWorld` détermine la piste musicale (`map0` à `map4`) et les effets visuels.

---

## 6. VAISSEAUX (SHIPS)

Définis dans `starfire-config.js`, tableau `SHIPS[]`. Tous ont les mêmes stats de base (équilibrés).

| ID | Nom | Classe | Pouvoir spécial | Couleur accent |
|----|-----|--------|-----------------|----------------|
| raptor | RAPTOR | Intercepteur | ⚡ SUPERNOVA DASH | Cyan `#44d8ff` |
| sentinel | SENTINEL | Croiseur d'assaut | ⚡ STORM LOCK | Violet `#9d4dff` |
| titan | TITAN | Cuirassé | ⚡ RICOCHET FURY | Orange `#ffaa44` |

Stats communes : `speed:3.5`, `lives:3`, `fireRate:16`.

### Pouvoirs spéciaux
- **RAPTOR — SUPERNOVA DASH** : rush vers le haut, invincible, bulles destructrices (105 frames)
- **SENTINEL — STORM LOCK** : tire des missiles guidés sur les 3 ennemis les plus proches (6s)
- **TITAN — RICOCHET FURY** : tir latéral rebondissant (3 rebonds max, 6s)

Activation : touche `E` / bouton `Y` manette. Nécessite 3 fragments de pouvoir.  
**Post-pouvoir : bouclier automatique de 10s.**

---

## 7. SYSTÈME DE DIFFICULTÉ

### DIFF_SETTINGS (dans starfire-game.js)

```js
const DIFF_SETTINGS = {
  easy: {
    hpMult:    [0.8, 0.8, 0.8, 0.8, 0.8],
    spMult:    [0.7, 0.7, 0.7, 0.7, 0.7],
    bulletSpd: [1.0, 1.0, 1.0, 1.0, 1.0],
    maxE:      [5,   5,   5,   5,   5  ],
    spawnRate: [110, 110, 110, 110, 110],
    bossHp:    [60,  60,  60,  60,  60 ],
  },
  normal: {
    hpMult:    [1.0, 1.0, 1.0, 1.0, 1.0],
    spMult:    [1.0, 1.0, 1.0, 1.0, 1.0],
    bulletSpd: [1.4, 1.4, 1.4, 1.4, 1.4],
    maxE:      [9,   9,   9,   9,   9  ],
    spawnRate: [80,  80,  80,  80,  80 ],
    bossHp:    [150, 150, 150, 150, 150],
  },
  hard: {
    hpMult:    [1.2, 1.2, 1.2, 1.2, 1.2],
    spMult:    [1.3, 1.3, 1.3, 1.3, 1.3],
    bulletSpd: [1.8, 1.8, 1.8, 1.8, 1.8],
    maxE:      [12,  12,  12,  12,  12 ],
    spawnRate: [65,  65,  65,  65,  65 ],
    bossHp:    [200, 200, 200, 200, 200],
  },
};
```

Tableau de 5 valeurs (une par map), toutes identiques → pas de progression par map.

### Limites de vagues (WORLD_WAVES)
```js
const WORLD_WAVES = {
  easy:   [Infinity, Infinity, Infinity, Infinity, Infinity],
  normal: [Infinity, Infinity, Infinity, Infinity, Infinity],
  hard:   [Infinity, Infinity, Infinity, Infinity, Infinity],
};
```
Toutes infinies — on joue indéfiniment. La transition de map est désactivée (modes infinis).

---

## 8. ENNEMIS

### Types

| Type | Couleur | Vitesse | PV | Score | Apparaît |
|------|---------|---------|-----|-------|----------|
| basic | Rouge `#f55` | 1.0×spMult | 1×hpMult | 10 | Dès le début |
| fast | Orange `#fa0` | Fixe par diff (easy:1.26 / normal:1.5 / hard:1.8) | 1 (fixe) | 20 | Vague ≥3 ou map ≥1 |
| zigzag | Cyan `#0ff` | 1.2×spMult | 2×hpMult | 30 | Vague ≥3 ou map ≥1 |
| hunter | Rose `#ff2288` | 1.3×spMult | 2×hpMult | 35 | Vague ≥4 ou map ≥1 |
| tank | Violet `#b06ef0` | 0.55×spMult | 3×hpMult | 50 | Vague ≥6 ou map ≥2 |
| grid | Formation 7×3 | Fixe 2.2 | 3×hpMult | 80 | Vague multiple de 10 (boss wave) |

### Patterns de tir (eShoot)
- **basic** : 1 tir droit vers le bas
- **fast** : 1 tir droit
- **tank** : 3 tirs simultanés (vx: -1.4 / 0 / +1.4)
- **hunter** : 3 tirs en éventail (vx: -0.8 / 0 / +0.8)
- **zigzag** : 1 tir droit
- **grid** : 1 tir droit, max 3 tireurs par formation (en FACILE)

Cadences (sr = frames entre tirs) : basic:300, fast:215, tank:260, hunter:170, zigzag:155

### Formation grille
Spawn à chaque vague multiple de 5 (pas boss wave) : `wave%5===0 && wave%10!==0`  
7 colonnes × 3 lignes, vitesse fixe 2.2 vers le bas.

---

## 9. BOSS

- Spawn à chaque **vague multiple de 10**
- HP : `DIFF_SETTINGS[difficulty].bossHp[currentWorld]`
- Score : `500 + wave×200`
- 2 phases (phase 2 quand HP < 50%)
- Tirs : éventail dirigé vers le joueur
  - Phase 1 : `4 + floor(currentWorld×0.5)` projectiles
  - Phase 2 : `6 + floor(currentWorld×1.2)` projectiles
  - Vitesse : `3.2 + currentWorld×0.35`
- À la mort : +1 vie, +500 pts, bouclier 3s, musique reprend après 2s

---

## 10. ARMES & BONUS

### Armes (WP)
```js
const WP = {
  default: {name:'CANON',   icon:'🔵', col:'#ffe040'},
  missile: {name:'MISSILE', icon:'🚀', col:'#88ff44'},
  minigun: {name:'MINIGUN', icon:'🔫', col:'#ff8800'},
  laser:   {name:'LASER',   icon:'🔮', col:'#ff44ff'},
};
```

### Roulette d'armes
- Déclenchée toutes les **5 vagues** (hors boss wave)
- Machine à sous 3 rouleaux — arme gagnante = rouleau central
- Durée arme : 3 minutes (180s = 10 800 frames)

### Pool bonus (BD)
```js
const BD = [
  {type:'rapid',  color:'#fa0',    label:'⚡ TIR RAPIDE',   dur:240},  // ~4s
  {type:'multi',  color:'#0ff',    label:'✦ TRIPLE TIR',    dur:210},  // ~3.5s
  {type:'shield', color:'#4f4',    label:'🛡 BOUCLIER',     dur:300},  // ~5s
  {type:'speed',  color:'#f4f',    label:'💨 VITESSE',      dur:180},  // ~3s
  {type:'bomb',   color:'#f80',    label:'💥 BOMBE !',      dur:0},    // instantané
  {type:'wMissile',color:'#88ff44',label:'🚀 MISSILES',    dur:180, weapon:'missile'},
  {type:'wMinigun',color:'#ff8800',label:'🔫 MINIGUN',     dur:180, weapon:'minigun'},
  {type:'wLaser', color:'#ff44ff', label:'🔮 LASER',       dur:180, weapon:'laser'},
  {type:'supernova',color:'#ffe040',label:'❤ VIE BONUS !', dur:0, super:true},
];
```

### Taux de drop
- **22% par ennemi tué** (fixe, toutes maps/difficultés)
- **15% des drops** = arme (parmi wMissile, wMinigun, wLaser)
- **Supernova (vie)** : uniquement après mort du boss (automatique)
- **Bombe** : pool normal, instantanée (détruit tous les ennemis à l'écran, boss HP ÷2)

### Bonus de vitesse
`const spd = player.speed * sensitivity + (player.bonuses.speed > 0 ? 1.5 : 0);`  
→ Boost **fixe +1.5** indépendant de la sensibilité.

---

## 11. SYSTÈME DE SCORE

- Score par ennemi tué × multiplicateur combo
- **Combo** : s'incrémente à chaque kill, se réinitialise après 60 frames sans kill
- `COMBO_MAX` défini dans le code
- Multiplicateur : `1 + (combo-1) × 0.25`
- +`wave×50` à chaque nouvelle vague
- Affiché en float animé au-dessus des kills

---

## 12. FRAGMENTS DE POUVOIR

- Collectibles qui tombent à 18% de chance par ennemi tué (après vague ≥15%)
- 3 fragments nécessaires (`FRAGS_NEEDED=3`) pour charger la barre
- `POWER_MAX_USES[currentWorld]` = nombre d'utilisations max par map
- HUD : barre de pouvoir en bas à gauche

---

## 13. CONTRÔLES

### Clavier
| Touche | Action |
|--------|--------|
| `←↑↓→` ou `WASD/ZQSD` | Déplacement |
| `E` | Activer pouvoir spécial |
| `ESC` | Pause |

### Manette (Gamepad API)
| Input | Action |
|-------|--------|
| Stick gauche / D-pad | Déplacement |
| Bouton `A` ou `RT` | Tir (automatique normalement) |
| Bouton `START` (9) | Pause |
| Bouton `Y` | Activer pouvoir |

Tir = automatique (basé sur `fTimer >= fr`).

### Mobile
- Joystick virtuel en bas à gauche (détecté via `pointer:coarse`)
- Bouton pouvoir en bas à droite

---

## 14. AUDIO

8 pistes distinctes générées procéduralement (Web Audio API) :

| Piste | Contexte | BPM |
|-------|----------|-----|
| `menu` | Menu principal | 140 |
| `map0` | SYSTÈME SOLAIRE | 70 |
| `map1` | ARALIS DUNES | 105 |
| `map2` | KRYNOS FROSTBELT | 155 |
| `map3` | PYRON CRADLE | 115 |
| `map4` | NYXAR VEIL | 175 |
| `boss` | Combat boss | 200 |
| `victory` | Victoire | 120 |

Volume maître : `masterVolume` (défaut `0.0125`), réglable via boutons `−/+` dans le menu.

---

## 15. SCORES & LEADERBOARD

### Supabase
```js
const SUPABASE_URL = 'https://sfuslwevoqbmbsqqneay.supabase.co';
// Table : scores
// Colonnes : pseudo, score, wave, ship, map, world, difficulty, date
```

> ⚠️ La colonne `difficulty` (text, nullable) doit être ajoutée manuellement dans le dashboard Supabase.

### Fonctions

```js
// Sauvegarde un score (Supabase + local best)
async function saveScore(s, w, sh, mp, ps, wd)

// Charge top 15 par difficulté (filtré par difficulty = key, ou tous si colonne absente)
async function loadScores(diffName)  // diffName = 'easy'|'normal'|'hard'

// Charge tous les scores sans filtre (onglet ANCIENS)
async function loadAllScores()       // filtre difficulty IS NULL

// Charge le meilleur score global toutes difficultés
async function loadTopScore()

// Charge le meilleur score local du joueur (localStorage starfire:localbest)
async function loadLocalBest()
```

### Écran Scores (showScores)
4 onglets :
- **★ FACILE** → `eq('difficulty','easy')`
- **★★ NORMAL** → `eq('difficulty','normal')`
- **★★★ DIFFICILE** → `eq('difficulty','hard')`
- **📜 ANCIENS** → `is('difficulty', null)` (scores pré-refactor)

Top 15 par onglet, colonnes : `#`, `PILOTE`, `SCORE`, `VAGUE`, `MAP`, `DATE`.

---

## 16. MENU PRINCIPAL

Sections (de haut en bas) :
1. **Tag strip** : "SECTEUR ZÉTA-9 / HYPERSPACE STABLE / HOSTILES DÉTECTÉS"
2. **Titre** STARFIRE + vaisseau héro animé
3. **"TRANSMISSION REÇUE"**
4. **Boutons** : ⚡ COMMENCER / ⚔ MULTIJOUEUR / ⟡ SCORES / ✦ CRÉDITS
5. **Peek scores** :
   - `— MEILLEUR SCORE MONDIAL —` (jaune, 11px)
   - `— MON MEILLEUR SCORE —` (orange `#ff9a2e`, 15px + map)
6. **Contrôles** : CLAVIER / MANETTE + statut manette + SENSIBILITÉ
7. **Barre du bas** : `CREATORS FLOZER & CLAUDE` + volume

---

## 17. FLOW DE JEU

```
showMenu()
  └─> showShipPick()           → sélection vaisseau
      └─> showDiffPick()        → sélection difficulté (FACILE/NORMAL/DIFFICILE)
          └─> showMapPick()      → sélection map (5 maps)
              └─> startGame()    → initialise et lance la boucle
                  └─> loop()     → RAF : update() + draw()
                      ├─> wave complete → advanceWave()
                      │   ├─> wave%5 → spawnGridFormation()
                      │   ├─> wave%10 → spawnBoss()
                      │   └─> wave%5 non boss → rouletteQueued (showRoulette)
                      ├─> boss mort → bossDefeatedFn() → advanceWave()
                      └─> lives=0 → showGameOver()
                          └─> saveScore() → showMenu() ou startGame()
```

---

## 18. MULTIJOUEUR (P2P)

- Basé sur **PeerJS** (WebRTC)
- Mode `mpMode = true` quand connecté
- `mpPeer`, `mpConn` = objets PeerJS
- Synchronisation score tous les 120 frames (`mpSendScore()`)
- Fragments de pouvoir illimités en MP (probabilité progressive)
- Interface : `showMPMenu()` → génère un ID / entre un ID adverse

---

## 19. STRUCTURE HTML (Starfire.html)

```html
<div id="wrap">           <!-- conteneur scalé 640×840 -->
  <canvas id="c">         <!-- jeu principal -->
  <canvas id="cm">        <!-- particules/HUD overlay -->
  <div id="ov">           <!-- overlay menus (flex centré) -->
  <div id="rov">          <!-- overlay roulette -->
  <div id="bbar">         <!-- barre de vie boss -->
  <div id="blog">         <!-- log bonus (chips animées) -->
  <div id="pbtn">         <!-- bouton pause in-game -->
</div>
```

### Classes CSS importantes
| Classe | Usage |
|--------|-------|
| `.sb` | Bouton standard (néon violet/rose) |
| `.sb.alt` | Bouton alternatif (cyan) |
| `.sb.back` | Bouton retour |
| `.peek` | Zone score dans le menu |
| `.menu-shell` | Conteneur principal menu (flex column centré) |
| `.cpt` | Mode compact (H<800px) — réduit les espacements |
| `.tag-strip` | Bande d'info en haut du menu |
| `.title` | Titre STARFIRE (VT323, néon) |
| `.brackets` | "TRANSMISSION REÇUE" avec tirets décoratifs |
| `.hero-ship` | Vaisseau animé au menu |

Fonts : `VT323` (pixel rétro), `Press Start 2P` (titres), `Courier New` (monospace).

---

## 20. HUD IN-GAME

Dessiné sur canvas `cm` dans `drawHUD()` :
- **Vies** : icônes vaisseaux en haut à gauche
- **Score** : en haut au centre
- **Vague** : sous le score
- **Arme active** + timer : en haut à droite
- **Bonus actifs** (chips avec barre de progression) : 4 bonus max affichés à `H-78`
  - `⚡ TIR RAPIDE`, `✦ TRIPLE TIR`, `🛡 BOUCLIER`, `💨 VITESSE`
- **Barre de pouvoir** : en bas à gauche (3 segments)
- **Combo** : affiché en float quand combo ≥ 2

---

## 21. POUR AJOUTER UN NOUVEAU MODE

### Ce qu'il faut modifier

1. **`showDiffPick()`** — Ajouter un bouton pour le nouveau mode
2. **`difficulty`** — Ajouter la nouvelle valeur (ex: `'endless'`, `'blitz'`, etc.)
3. **`DIFF_SETTINGS`** — Ajouter une entrée avec les 5 valeurs par map
4. **`WORLD_WAVES`** — Définir la limite de vagues
5. **`startGame()`** — Gérer l'initialisation spécifique si besoin
6. **`loadScores() / showScores()`** — Ajouter un onglet dans le leaderboard

### Points d'entrée clés

```js
// Récupérer les paramètres de difficulté en cours
function getDiff(){ return DIFF_SETTINGS[difficulty] || DIFF_SETTINGS.normal; }
function getWaveLimit(){ return (WORLD_WAVES[difficulty]||WORLD_WAVES.normal)[currentWorld]; }

// Spawn ennemi — utilise getDiff() pour les multiplicateurs
function spawnEnemy(){ ... }

// Spawn boss — utilise getDiff().bossHp
function spawnBoss(){ ... }

// Score sauvegardé avec difficulty en champ
async function saveScore(s,w,sh,mp,ps,wd){
  const entry={..., difficulty, ...};
}
```

### Idées de modes possibles
- **BLITZ** : vagues très rapides, ennemis fragiles, chrono 5 minutes
- **SURVIE** : ennemis de plus en plus forts, pas de boss, pas de limite
- **BOSS RUSH** : seulement des boss, enchaînés sans vagues normales
- **COOPÉRATIF** : extension du mode multijoueur existant (déjà partiel)
- **ENDLESS+** : comme normal mais avec progression de difficulté par vague (hpMult++, spawnRate-- tous les 10 vagues)

---

## 22. DONNÉES TECHNIQUES IMPORTANTES

### Framerate
- RAF (requestAnimationFrame) — cible 60fps
- Toutes les durées sont en frames (60fps = 1s)

### Coordonnées
- Origine `(0,0)` = coin haut-gauche
- `player.x`, `player.y` = centre du vaisseau
- Ennemis spawent à `y=-66`, sortent du jeu à `y>H+60`

### Parallaxe
`parallaxOffset = 1.0` — fixe sur toutes les maps.

### Limites joueur
```js
if(player.y < 60)  player.y = 60;   // Ne monte pas au-delà du HUD
if(player.y > H-32) player.y = H-32; // Ne sort pas par le bas
if(player.x < 22)  player.x = 22;
if(player.x > W-22) player.x = W-22;
```

### Invincibilité
- `player.iframes` : frames d'invincibilité après un hit
- `player.invincible` : bool (pendant pouvoir RAPTOR)
- `player.bonuses.shield > 0` : bouclier actif (absorbe 1 hit)

---

*Document généré depuis le projet STARFIRE V1 — Creators : FLOZER & CLAUDE*
