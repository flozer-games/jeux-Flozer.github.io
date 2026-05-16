// ═══════════════════════════════════════════════════════════════════
// STARFIRE — Ships, Maps, Weapons configuration
// ═══════════════════════════════════════════════════════════════════

// ── SHIPS ──────────────────────────────────────────────────────────
const SHIPS = [
  {
    id:'raptor', name:'RAPTOR', class:'Intercepteur',
    desc:'Chasseur solitaire des confins. Rapide, précis, implacable. | ⚡ SUPERNOVA DASH',
    speed:3.5, lives:3, fireRate:16, hue:'#44d8ff',
    stats:{VIT:3, BLI:3, FEU:3},
    palette:{hull:'#1a4860',hullHi:'#2a6a8e',hullDk:'#0e2a40',wing:'#2da0d0',wingHi:'#5dc8ff',cock:'#0a2030',cockHi:'#88e8ff',accent:'#44d8ff',thrust:'rgba(80,210,255,'},
  },
  {
    id:'sentinel', name:'SENTINEL', class:'Croiseur d\'assaut',
    desc:'Gardien des lignes de front. Ni trop rapide, ni trop lent — juste parfait. | ⚡ STORM LOCK',
    speed:3.5, lives:3, fireRate:16, hue:'#9d4dff',
    stats:{VIT:3, BLI:3, FEU:3},
    palette:{hull:'#2a1a4a',hullHi:'#3d2a6e',hullDk:'#110a22',wing:'#6a2abf',wingHi:'#9d4dff',cock:'#110a22',cockHi:'#cc88ff',accent:'#9d4dff',thrust:'rgba(157,77,255,'},
  },
  {
    id:'titan', name:'TITAN', class:'Cuirassé',
    desc:'Forteresse volante. Même vitesse, même feu — mais une présence qui intimide. | ⚡ RICOCHET FURY',
    speed:3.5, lives:3, fireRate:16, hue:'#ffaa44',
    stats:{VIT:3, BLI:3, FEU:3},
    palette:{hull:'#5a3818',hullHi:'#8a5828',hullDk:'#2a1808',wing:'#a86028',wingHi:'#d88848',cock:'#1a0a02',cockHi:'#ffcc88',accent:'#ffaa44',thrust:'rgba(255,170,68,'},
  },
];

// ── MAPS ───────────────────────────────────────────────────────────
const MAPS = [
  { // MAP 1 — SYSTÈME SOLAIRE
    id:'verge', name:'SYSTÈME SOLAIRE', tag:'Notre système',
    desc:'Aux confins du système solaire. Défendez la Terre contre l\'invasion.',
    sky:['#000208','#040a1f','#000208'],
    starHues:['#ffffff','#cfe4ff','#ffe6c4'],
    bgKind:'verge',
    suns:[
      {x:-40,y:110,r:110,col:'#ffcc20',glow:'rgba(255,200,60,.45)',sp:0.003},
    ],
    planets:[
      {x:400,y:68,  r:14,base:'#9a8878',hi:'#d8c8b4',sh:'#2a2018',ring:false,sp:.018,bands:false},
      {x:88, y:340, r:24,base:'#c89820',hi:'#fffce0',sh:'#604808',ring:false,sp:.014,bands:false},
      {x:420,y:580, r:30,base:'#0848b0',hi:'#b8e8ff',sh:'#041838',ring:false,sp:.010,bands:false,icecap:true},
      {x:466,y:556, r:10,base:'#989080',hi:'#d8d0c8',sh:'#303028',ring:false,sp:.010,bands:false},
      {x:95, y:820, r:22,base:'#c84828',hi:'#ff9878',sh:'#380800',ring:false,sp:.008,bands:false},
      {x:370,y:1120,r:64,base:'#a86830',hi:'#f8e8c8',sh:'#503010',ring:false,sp:.006,bands:true,bandCol:'rgba(180,100,40,.38)'},
      {x:155,y:1450,r:46,base:'#b08828',hi:'#fdf0cc',sh:'#604010',ring:true, sp:.005,bands:true,bandCol:'rgba(200,160,50,.32)',rc:'rgba(232,192,64,.48)',ra:.45},
      {x:468,y:1750,r:26,base:'#189898',hi:'#d8ffff',sh:'#043838',ring:true, sp:.004,bands:false,rc:'rgba(128,232,232,.38)',ra:.35},
      {x:80, y:2050,r:20,base:'#0828a0',hi:'#90b8ff',sh:'#020c30',ring:false,sp:.003,bands:false},
    ],
    bholes:[],
    nebulas:[
      {x:0,y:0,   w:540,h:400,col1:'rgba(40,60,140,.08)', col2:'rgba(0,0,0,0)',blur:true},
      {x:0,y:1200,w:540,h:400,col1:'rgba(60,40,100,.07)', col2:'rgba(0,0,0,0)',blur:true},
    ],
  },
  { // MAP 2 — ARALIS DUNES
    id:'aralis', name:'ARALIS DUNES', tag:'Désert binaire',
    desc:'Monde désertique sous deux soleils. Tempêtes de sable en haute altitude.',
    sky:['#000208','#040a1f','#000208'],
    starHues:['#ffffff','#cfe4ff','#ffe6c4'],
    bgKind:'aralis',
    suns:[
      {x:80, y:120,r:34,col:'#ffe8a0',glow:'rgba(255,200,100,.4)', sp:0.008},
      {x:160,y:220,r:22,col:'#ffb070',glow:'rgba(255,140,80,.35)',  sp:0.005},
    ],
    planets:[
      {x:380,y:200, r:50,base:'#d4943a',hi:'#f0c878',sh:'#8a5010',ring:true, sp:.038,bands:true,bandCol:'rgba(200,120,40,.3)', rc:'rgba(212,148,58,.5)', ra:.32,sandstorm:true},
      {x:80, y:520, r:28,base:'#b07020',hi:'#e0a850',sh:'#6a3808',ring:false,sp:.042,bands:true,bandCol:'rgba(180,100,30,.28)',sandstorm:true},
      {x:400,y:860, r:18,base:'#c88830',hi:'#e8b060',sh:'#704010',ring:false,sp:.05, bands:true,bandCol:'rgba(160,90,20,.25)', sandstorm:true},
      {x:120,y:1200,r:35,base:'#d08030',hi:'#f0c060',sh:'#7a4010',ring:true, sp:.032,bands:true,bandCol:'rgba(190,110,30,.28)',rc:'rgba(200,130,50,.4)', ra:.28,sandstorm:true},
      {x:380,y:1560,r:22,base:'#a06020',hi:'#d09040',sh:'#5a2808',ring:false,sp:.044,bands:true,bandCol:'rgba(160,90,25,.26)', sandstorm:true},
      {x:100,y:1900,r:40,base:'#c87828',hi:'#f0b848',sh:'#7a4010',ring:true, sp:.028,bands:true,bandCol:'rgba(185,105,28,.3)', rc:'rgba(210,140,50,.42)',ra:.38,sandstorm:true},
    ],
    bholes:[],
    nebulas:[
      {x:0,y:300, w:540,h:400,col1:'rgba(180,100,40,.08)',col2:'rgba(0,0,0,0)',blur:true},
      {x:0,y:1100,w:540,h:400,col1:'rgba(160,80,20,.07)', col2:'rgba(0,0,0,0)',blur:true},
    ],
    dust:true,
  },
  { // MAP 3 — KRYNOS FROSTBELT
    id:'krynos', name:'KRYNOS FROSTBELT', tag:'Anneau glaciaire',
    desc:'Ceinture de glace en orbite d\'un géant gelé. Visibilité réduite.',
    sky:['#000208','#040a1f','#000208'],
    starHues:['#ffffff','#cfe4ff','#ffe6c4'],
    bgKind:'krynos',
    bigPlanet:{x:270,y:-180,r:280,base:'#3a7aaa',hi:'#bce0f4',sh:'#1a3a58',ring:true,rc:'rgba(188,224,244,.5)',ra:.18,sp:.035,bands:true,bandCol:'rgba(220,240,255,.18)',icecap:true},
    planets:[
      {x:420,y:280, r:22,base:'#285878',hi:'#d0f0ff',sh:'#0a2030',ring:false,sp:.028,bands:true,bandCol:'rgba(160,208,240,.2)', icecap:true},
      {x:80, y:580, r:32,base:'#1e4868',hi:'#c0e8f8',sh:'#081828',ring:false,sp:.032,bands:true,bandCol:'rgba(136,192,232,.18)',icecap:true},
      {x:400,y:900, r:18,base:'#2a5878',hi:'#b8e0f4',sh:'#0e2840',ring:false,sp:.038,bands:true,bandCol:'rgba(150,200,235,.2)', icecap:true},
      {x:110,y:1220,r:40,base:'#1a4060',hi:'#a8d8f0',sh:'#060e20',ring:true, sp:.025,bands:true,bandCol:'rgba(130,185,225,.18)',rc:'rgba(170,220,245,.4)',ra:.28,icecap:true},
      {x:390,y:1580,r:24,base:'#224868',hi:'#c8e8f8',sh:'#081828',ring:false,sp:.030,bands:true,bandCol:'rgba(140,195,232,.2)', icecap:true},
      {x:130,y:1920,r:36,base:'#183858',hi:'#b0d8f0',sh:'#040e1a',ring:true, sp:.022,bands:true,bandCol:'rgba(125,180,220,.18)',rc:'rgba(160,215,242,.38)',ra:.32,icecap:true},
    ],
    bholes:[],
    nebulas:[
      {x:0,y:200, w:540,h:500,col1:'rgba(100,160,220,.07)',col2:'rgba(0,0,0,0)',blur:true},
      {x:0,y:1000,w:540,h:400,col1:'rgba(80,140,200,.06)', col2:'rgba(0,0,0,0)',blur:true},
    ],
    iceShards:true,
  },
  { // MAP 4 — PYRON CRADLE
    id:'pyron', name:'PYRON CRADLE', tag:'Forge volcanique',
    desc:'Orbite basse au-dessus d\'un monde de magma. Pluie de cendres.',
    sky:['#000208','#040a1f','#000208'],
    starHues:['#ffffff','#cfe4ff','#ffe6c4'],
    bgKind:'pyron',
    bigPlanet:{x:270,y:2200,r:380,base:'#cc2008',hi:'#ff6020',sh:'#600800',cracks:true,sp:.06},
    planets:[
      {x:100,y:180, r:28,base:'#aa2008',hi:'#ff7030',sh:'#580600',ring:false,sp:.044,cracks:true},
      {x:400,y:460, r:18,base:'#991800',hi:'#ff5818',sh:'#480400',ring:false,sp:.050,cracks:true},
      {x:130,y:740, r:38,base:'#bb2408',hi:'#ff6828',sh:'#600800',ring:false,sp:.038,cracks:true},
      {x:390,y:1060,r:22,base:'#a01800',hi:'#ff4810',sh:'#400400',ring:false,sp:.046,cracks:true},
      {x:100,y:1380,r:32,base:'#b82008',hi:'#ff6020',sh:'#580600',ring:false,sp:.040,cracks:true},
      {x:410,y:1700,r:16,base:'#981400',hi:'#ff4010',sh:'#3a0200',ring:false,sp:.052,cracks:true},
    ],
    bholes:[],
    nebulas:[
      {x:0,y:0,   w:540,h:300,col1:'rgba(100,20,5,.1)',  col2:'rgba(0,0,0,0)',blur:true},
      {x:0,y:700, w:540,h:400,col1:'rgba(200,50,10,.12)',col2:'rgba(0,0,0,0)',blur:true},
      {x:0,y:1400,w:540,h:400,col1:'rgba(180,40,8,.1)',  col2:'rgba(0,0,0,0)',blur:true},
    ],
    embers:true,
  },
  { // MAP 5 — NYXAR VEIL
    id:'nyxar', name:'NYXAR VEIL', tag:'Voile nébulaire',
    desc:'Brume violacée chargée d\'orages magnétiques. Couloirs stellaires denses.',
    sky:['#000208','#040a1f','#000208'],
    starHues:['#ffffff','#cfe4ff','#ffe6c4'],
    bgKind:'nyxar',
    planets:[
      {x:380,y:160, r:32,base:'#5010a0',hi:'#b060e0',sh:'#200850',ring:true, sp:.030,lightning:false,rc:'rgba(180,100,255,.45)',ra:.42},
      {x:90, y:460, r:24,base:'#801080',hi:'#c840b0',sh:'#300830',ring:false,sp:.040,lightning:false},
      {x:400,y:760, r:18,base:'#401080',hi:'#8040c0',sh:'#180430',ring:false,sp:.048,lightning:false},
      {x:110,y:1060,r:38,base:'#601090',hi:'#a050d0',sh:'#280640',ring:true, sp:.026,lightning:false,rc:'rgba(160,80,240,.4)', ra:.38},
      {x:390,y:1380,r:22,base:'#701080',hi:'#b040b0',sh:'#280630',ring:false,sp:.036,lightning:false},
      {x:120,y:1700,r:30,base:'#500890',hi:'#9040c8',sh:'#200438',ring:true, sp:.028,lightning:false,rc:'rgba(150,70,230,.38)',ra:.35},
    ],
    bholes:[],
    nebulas:[
      {x:0,  y:0,   w:540,h:700,col1:'rgba(96,16,176,.12)', col2:'rgba(40,8,96,.06)',blur:true},
      {x:80, y:500, w:400,h:400,col1:'rgba(160,32,140,.1)',  col2:'rgba(0,0,0,0)',   blur:true},
      {x:0,  y:1100,w:540,h:500,col1:'rgba(80,10,160,.1)',   col2:'rgba(0,0,0,0)',   blur:true},
      {x:60, y:1500,w:420,h:400,col1:'rgba(140,28,120,.09)', col2:'rgba(0,0,0,0)',   blur:true},
    ],
    lightning:false,
  },
];

// ── WEAPONS ────────────────────────────────────────────────────────
const WP = {
  default:{name:'CANON',icon:'🔵',col:'#ffe040'},
  missile:{name:'MISSILE',icon:'🚀',col:'#88ff44'},
  minigun:{name:'MINIGUN',icon:'🔫',col:'#ff8800'},
  laser:{name:'LASER',icon:'🔮',col:'#ff44ff'},
};
const WPOOL = ['missile','missile','missile','missile','minigun','minigun','minigun','minigun','laser','laser'];

// ── BONUSES ────────────────────────────────────────────────────────
const BD = [
  {type:'rapid',color:'#fa0',label:'⚡ TIR RAPIDE',dur:390},
  {type:'multi',color:'#0ff',label:'✦ TRIPLE TIR',dur:345},
  {type:'shield',color:'#4f4',label:'🛡 BOUCLIER',dur:487},
  {type:'speed',color:'#f4f',label:'💨 VITESSE',dur:292},
  {type:'bomb',color:'#f80',label:'💥 BOMBE !',dur:0},
  {type:'wMissile',color:'#88ff44',label:'🚀 MISSILES',dur:300,weapon:'missile'},
  {type:'wMinigun',color:'#ff8800',label:'🔫 MINIGUN',dur:300,weapon:'minigun'},
  {type:'wLaser',color:'#ff44ff',label:'🔮 LASER',dur:300,weapon:'laser'},
  {type:'supernova',color:'#ffe040',label:'❤ VIE BONUS !',dur:0,super:true},
];

// ── WAVE LIMITS PER WORLD ─────────────────────────────────────────
const WORLD_WAVES = {
  easy:   [50, 50, 50, 50, 50],
  normal: [Infinity, Infinity, Infinity, Infinity, Infinity],
  hard:   [Infinity, Infinity, Infinity, Infinity, Infinity],
};

// ── EPIC QUOTES (originales, pas tirées d'œuvres existantes) ───────
const QUOTES = [
  {t:"Les étoiles ne tombent pas. Ce sont les pilotes qui montent les chercher.", a:"Codex de l'Ordre Stellaire"},
  {t:"Ce que tu crains dans le vide, c'est seulement l'écho de ton propre courage.", a:"Méditations d'un veilleur d'orbite"},
  {t:"Une seule trajectoire. Mille destins. Choisis avec soin.", a:"Manuel du Pilote, Chant III"},
  {t:"Le silence du cosmos n'est pas vide — il attend ta réponse.", a:"Anonyme, IIIᵉ siècle galactique"},
  {t:"Les héros ne brillent pas plus que les étoiles. Ils brillent plus longtemps.", a:"Sentence des Forges de Pyron"},
  {t:"Voler n'est pas fuir. C'est défier la gravité de tous les doutes.", a:"Préceptes de l'Académie Stellaire"},
];
