// ═══════════════════════════════════════════════════════════════════
// STARFIRE — Ships, Maps, Weapons configuration
// ═══════════════════════════════════════════════════════════════════

// ── SUPABASE ────────────────────────────────────────────────────────
// Remplace ces deux valeurs par celles de ton projet Supabase
// (Settings → API dans le dashboard Supabase)
const SUPABASE_URL     = 'https://sfuslwevoqbmbsqqneay.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmdXNsd2V2b3FibWJzcXFuZWF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg5NDE1NTUsImV4cCI6MjA5NDUxNzU1NX0.SJfK4_qSQz3FZxj5Lv-n1GmGvNA1z8wsA40BX7breWI';

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
  {type:'rapid',color:'#fa0',label:'⚡ TIR RAPIDE',dur:240},
  {type:'multi',color:'#0ff',label:'✦ TRIPLE TIR',dur:210},
  {type:'shield',color:'#4f4',label:'🛡 BOUCLIER',dur:300},
  {type:'speed',color:'#f4f',label:'💨 VITESSE',dur:180},
  {type:'bomb',color:'#f80',label:'💥 BOMBE !',dur:0},
  {type:'wMissile',color:'#88ff44',label:'🚀 MISSILES',dur:180,weapon:'missile'},
  {type:'wMinigun',color:'#ff8800',label:'🔫 MINIGUN',dur:180,weapon:'minigun'},
  {type:'wLaser',color:'#ff44ff',label:'🔮 LASER',dur:180,weapon:'laser'},
  {type:'supernova',color:'#ffe040',label:'❤ VIE BONUS !',dur:0,super:true},
];

// ── WAVE LIMITS PER WORLD ─────────────────────────────────────────
const WORLD_WAVES = {
  easy:   [Infinity, Infinity, Infinity, Infinity, Infinity],
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

// ── ÉQUIPAGE DU STARHUNTER ─────────────────────────────────────────
const CREW = [
  {
    id:'zara', name:'Capitaine ZARA VOSS', role:'Commandante',
    desc:'Pilote hors pair, sarcasme inclus. Dirige l\'équipage à la force du caractère — et du café.',
    col:'#44d8ff', emoji:'👩‍🚀',
  },
  {
    id:'keel', name:'KEEL', role:'Ingénieur en chef',
    desc:'Répare tout avec du scotch et de l\'optimisme douteux.',
    col:'#ff9800', emoji:'🔧',
  },
  {
    id:'lyra', name:'Dr. LYRA SOL', role:'Scientifique',
    desc:'Génie absolu, désastre social.',
    col:'#9d4dff', emoji:'🔬',
  },
  {
    id:'rex', name:'REX MAKO', role:'Spécialiste combat',
    desc:'Convaincu que tout problème se résout avec suffisamment de firepower.',
    col:'#ef4444', emoji:'💥',
  },
  {
    id:'nova', name:'NOVA', role:'IA de navigation',
    desc:'Intelligence artificielle avec une tendance à l\'existentialisme.',
    col:'#22d3ee', emoji:'🤖',
  },
  {
    id:'tika', name:'TIKA', role:'Médecin de bord',
    desc:'Optimiste chronique. Seul membre de l\'équipe à toujours sourire.',
    col:'#4ade80', emoji:'🌿',
  },
];

// ── MAPS EXCLUSIVES CAMPAGNE ───────────────────────────────────────
const CAMPAIGN_MAPS = [
  {
    id:'veltara', name:'SYSTÈME VELTARA', tag:'Planète mourante',
    sky:['#000208','#040a1f','#000208'],
    starHues:['#ffffff','#cfe4ff','#ffe6c4'],
    bgKind:'verge',
    planets:[
      {x:270,y:200,r:80,base:'#4a6080',hi:'#8ab0d0',sh:'#1a2838',ring:false,sp:.008,bands:true,bandCol:'rgba(100,140,180,.25)'},
      {x:420,y:450,r:18,base:'#888070',hi:'#c8b8a0',sh:'#282018',ring:false,sp:.015,bands:false},
      {x:100,y:600,r:12,base:'#606870',hi:'#a0a8b0',sh:'#202428',ring:false,sp:.022,bands:false},
    ],
    bholes:[],
    nebulas:[{x:0,y:0,w:540,h:840,col1:'rgba(80,40,20,.08)',col2:'rgba(0,0,0,0)',blur:true}],
  },
  {
    id:'border', name:'ZONE FRONTIÈRE', tag:'Espace profond',
    sky:['#000208','#040a1f','#000208'],
    starHues:['#ffffff','#cfe4ff','#ffe6c4'],
    bgKind:'verge',
    planets:[
      {x:380,y:150,r:22,base:'#804820',hi:'#c08040',sh:'#402010',ring:false,sp:.02,bands:false},
      {x:80,y:400,r:14,base:'#608060',hi:'#90b090',sh:'#203020',ring:false,sp:.028,bands:false},
    ],
    bholes:[{x:300,y:500,r:20,sp:.02}],
    nebulas:[],
  },
  {
    id:'dragor', name:'MINES DE DRAGOR', tag:'Ceinture astéroïdes',
    sky:['#000208','#040a1f','#000208'],
    starHues:['#ffffff','#cfe4ff','#ffe6c4'],
    bgKind:'verge',
    planets:[
      {x:150,y:200,r:30,base:'#706860',hi:'#a09888',sh:'#302820',ring:false,sp:.015,bands:false},
      {x:400,y:350,r:20,base:'#806050',hi:'#b09080',sh:'#402818',ring:false,sp:.02,bands:false},
      {x:250,y:600,r:16,base:'#786858',hi:'#a89888',sh:'#382818',ring:false,sp:.025,bands:false},
    ],
    bholes:[],
    nebulas:[{x:0,y:0,w:540,h:840,col1:'rgba(60,40,20,.1)',col2:'rgba(0,0,0,0)',blur:true}],
  },
  {
    id:'binary', name:'SYSTÈME BINAIRE', tag:'Deux soleils',
    sky:['#000208','#040a1f','#000208'],
    starHues:['#ffffff','#ffe6c4','#ffb070'],
    bgKind:'aralis',
    suns:[
      {x:50,y:100,r:45,col:'#ffe060',glow:'rgba(255,220,60,.5)',sp:.004},
      {x:490,y:150,r:30,col:'#ff8030',glow:'rgba(255,120,30,.4)',sp:.003},
    ],
    planets:[
      {x:270,y:350,r:28,base:'#c08040',hi:'#e0b070',sh:'#604018',ring:true,sp:.025,bands:true,bandCol:'rgba(180,110,40,.3)',rc:'rgba(200,140,60,.4)',ra:.3},
    ],
    bholes:[],
    nebulas:[{x:0,y:200,w:540,h:400,col1:'rgba(160,80,20,.07)',col2:'rgba(0,0,0,0)',blur:true}],
  },
  {
    id:'station', name:'STATION NEXUS-7', tag:'Zone commerciale',
    sky:['#000208','#040a1f','#000208'],
    starHues:['#ffffff','#cfe4ff','#ffe6c4'],
    bgKind:'verge',
    planets:[
      {x:270,y:180,r:40,base:'#2a4a6a',hi:'#4a7aaa',sh:'#0a1a28',ring:true,sp:.015,bands:false,rc:'rgba(100,160,220,.4)',ra:.4},
      {x:100,y:500,r:16,base:'#4a6a4a',hi:'#7aaa7a',sh:'#1a281a',ring:false,sp:.025,bands:false},
    ],
    bholes:[],
    nebulas:[],
  },
  {
    id:'nebula', name:'NÉBULEUSE TOXIQUE', tag:'Zone dangereuse',
    sky:['#000208','#040a1f','#000208'],
    starHues:['#ffffff','#cfe4ff','#c8ff88'],
    bgKind:'nyxar',
    planets:[
      {x:200,y:250,r:35,base:'#206040',hi:'#40b070',sh:'#082018',ring:false,sp:.018,bands:true,bandCol:'rgba(40,160,80,.25)'},
      {x:420,y:500,r:20,base:'#408040',hi:'#70c070',sh:'#182818',ring:false,sp:.025,bands:false},
    ],
    bholes:[],
    nebulas:[{x:0,y:0,w:540,h:840,col1:'rgba(20,120,40,.15)',col2:'rgba(0,60,20,.08)',blur:true}],
  },
  {
    id:'deepspace', name:'ESPACE PROFOND', tag:'Secteur inconnu',
    sky:['#000208','#040a1f','#000208'],
    starHues:['#ffffff','#cfe4ff','#ffe6c4'],
    bgKind:'verge',
    planets:[
      {x:150,y:300,r:18,base:'#3a2a5a',hi:'#6a5a8a',sh:'#120a20',ring:false,sp:.02,bands:false},
      {x:400,y:200,r:14,base:'#2a3a5a',hi:'#5a6a8a',sh:'#0a1020',ring:false,sp:.028,bands:false},
    ],
    bholes:[{x:270,y:450,r:25,sp:.018},{x:100,y:650,r:15,sp:.022}],
    nebulas:[{x:0,y:0,w:540,h:840,col1:'rgba(20,10,40,.12)',col2:'rgba(0,0,0,0)',blur:true}],
  },
  {
    id:'frost', name:'SECTEUR GIVRE', tag:'Zone glaciaire',
    sky:['#000208','#040a1f','#000208'],
    starHues:['#ffffff','#bce4ff','#cfe4ff'],
    bgKind:'krynos',
    bigPlanet:{x:270,y:-100,r:220,base:'#3a7aaa',hi:'#bce0f4',sh:'#1a3a58',ring:true,rc:'rgba(188,224,244,.5)',ra:.18,sp:.03,bands:true,bandCol:'rgba(220,240,255,.18)',icecap:true},
    planets:[
      {x:80,y:400,r:20,base:'#285878',hi:'#c0e8f8',sh:'#0a2030',ring:false,sp:.025,bands:true,bandCol:'rgba(160,208,240,.2)',icecap:true},
      {x:440,y:550,r:14,base:'#1e4868',hi:'#a8d8f0',sh:'#081828',ring:false,sp:.032,bands:false,icecap:true},
    ],
    bholes:[],
    nebulas:[],
    iceShards:true,
  },
  {
    id:'forge', name:'LA FORGE KORRAX', tag:'Usine ennemie',
    sky:['#000208','#040a1f','#000208'],
    starHues:['#ffffff','#ffe6c4','#ff8848'],
    bgKind:'pyron',
    bigPlanet:{x:270,y:1800,r:320,base:'#aa2208',hi:'#ff5518',sh:'#4a0800',cracks:true,sp:.05},
    planets:[
      {x:100,y:200,r:25,base:'#991800',hi:'#ff5018',sh:'#480400',ring:false,sp:.04,cracks:true},
      {x:420,y:350,r:16,base:'#881400',hi:'#ff3808',sh:'#380200',ring:false,sp:.048,cracks:true},
    ],
    bholes:[],
    nebulas:[{x:0,y:0,w:540,h:400,col1:'rgba(180,40,8,.12)',col2:'rgba(0,0,0,0)',blur:true}],
    embers:true,
  },
  {
    id:'signal', name:'SECTEUR OMÉGA', tag:'Signal mystérieux',
    sky:['#000208','#040a1f','#000208'],
    starHues:['#ffffff','#cfe4ff','#ffe6c4'],
    bgKind:'verge',
    planets:[
      {x:270,y:250,r:45,base:'#1a3050',hi:'#3a6090',sh:'#080e1a',ring:true,sp:.015,bands:true,bandCol:'rgba(60,100,160,.22)',rc:'rgba(80,130,200,.38)',ra:.5},
      {x:80,y:550,r:18,base:'#203040',hi:'#406080',sh:'#081018',ring:false,sp:.025,bands:false},
    ],
    bholes:[{x:450,y:400,r:22,sp:.02}],
    nebulas:[{x:0,y:0,w:540,h:840,col1:'rgba(20,40,80,.1)',col2:'rgba(0,0,0,0)',blur:true}],
  },
  {
    id:'fleet', name:'GRANDE FLOTTE', tag:'Bataille finale',
    sky:['#000208','#040a1f','#000208'],
    starHues:['#ffffff','#cfe4ff','#ffe6c4'],
    bgKind:'verge',
    planets:[
      {x:150,y:200,r:30,base:'#3a1a1a',hi:'#6a3a3a',sh:'#100808',ring:false,sp:.015,bands:false},
      {x:420,y:400,r:20,base:'#2a1a2a',hi:'#5a3a5a',sh:'#0e080e',ring:false,sp:.022,bands:false},
    ],
    bholes:[{x:270,y:350,r:18,sp:.025}],
    nebulas:[{x:0,y:0,w:540,h:840,col1:'rgba(80,20,20,.1)',col2:'rgba(0,0,0,0)',blur:true}],
  },
  {
    id:'gate', name:'PORTE DE KORRAXIS', tag:'Territoire ennemi',
    sky:['#000208','#040a1f','#000208'],
    starHues:['#ffffff','#ffc4c4','#ff8888'],
    bgKind:'nyxar',
    planets:[
      {x:270,y:180,r:60,base:'#601010',hi:'#c03030',sh:'#200808',ring:true,sp:.012,bands:true,bandCol:'rgba(180,40,40,.3)',rc:'rgba(220,60,60,.45)',ra:.45},
      {x:80,y:500,r:20,base:'#501010',hi:'#a02828',sh:'#180606',ring:false,sp:.025,bands:false},
      {x:450,y:600,r:14,base:'#401010',hi:'#802020',sh:'#100404',ring:false,sp:.032,bands:false},
    ],
    bholes:[],
    nebulas:[{x:0,y:0,w:540,h:840,col1:'rgba(120,20,20,.14)',col2:'rgba(0,0,0,0)',blur:true}],
  },
  {
    id:'korraxis', name:'KORRAXIS PRIME', tag:'Cœur de l\'empire',
    sky:['#000208','#040a1f','#000208'],
    starHues:['#ffffff','#ffc4c4','#ff8888'],
    bgKind:'pyron',
    bigPlanet:{x:270,y:2000,r:350,base:'#800808',hi:'#e02020',sh:'#300404',cracks:true,sp:.04},
    planets:[
      {x:100,y:180,r:22,base:'#701010',hi:'#c02828',sh:'#280606',ring:false,sp:.038,cracks:true},
      {x:440,y:280,r:16,base:'#601010',hi:'#a02020',sh:'#200404',ring:false,sp:.045,cracks:true},
    ],
    bholes:[],
    nebulas:[{x:0,y:0,w:540,h:500,col1:'rgba(150,20,20,.15)',col2:'rgba(0,0,0,0)',blur:true}],
    embers:true,
  },
  {
    id:'nexus', name:'NEXUS ZYONITE', tag:'Source d\'énergie infinie',
    sky:['#000208','#040a1f','#000208'],
    starHues:['#ffffff','#c4ffc4','#88ff88'],
    bgKind:'nyxar',
    planets:[
      {x:270,y:200,r:70,base:'#106040',hi:'#20d080',sh:'#041808',ring:true,sp:.01,bands:true,bandCol:'rgba(20,200,100,.25)',rc:'rgba(30,220,120,.5)',ra:.5},
      {x:80,y:500,r:22,base:'#085030',hi:'#18c070',sh:'#021408',ring:false,sp:.02,bands:false},
      {x:460,y:400,r:16,base:'#0a6040',hi:'#1ad080',sh:'#031a10',ring:false,sp:.028,bands:false},
    ],
    bholes:[],
    nebulas:[{x:0,y:0,w:540,h:840,col1:'rgba(20,120,60,.12)',col2:'rgba(0,0,0,0)',blur:true}],
  },
  {
    id:'throne', name:'TRÔNE DE KORRAX-PRIME', tag:'Confrontation finale',
    sky:['#000208','#040a1f','#000208'],
    starHues:['#ffffff','#ffc4ff','#ff88ff'],
    bgKind:'nyxar',
    planets:[
      {x:270,y:180,r:80,base:'#600060',hi:'#c000c0',sh:'#180018',ring:true,sp:.008,bands:true,bandCol:'rgba(180,0,180,.28)',rc:'rgba(220,0,220,.5)',ra:.55},
      {x:80,y:450,r:24,base:'#480048',hi:'#900090',sh:'#100010',ring:false,sp:.018,bands:false},
      {x:460,y:550,r:18,base:'#500050',hi:'#a000a0',sh:'#140014',ring:false,sp:.025,bands:false},
    ],
    bholes:[{x:420,y:250,r:20,sp:.02}],
    nebulas:[{x:0,y:0,w:540,h:840,col1:'rgba(100,0,120,.15)',col2:'rgba(60,0,80,.08)',blur:true}],
  },
];

// ── MISSIONS CAMPAGNE ──────────────────────────────────────────────
const CAMPAIGN_MISSIONS = [
  {
    id:1, title:'DÉPART D\'URGENCE',
    map:'verge',
    objectiveType:'survive', objectiveValue:10,
    objectiveLabel:'Survivre 10 vagues',
    bossWave:10,
    narrator:'nova',
    briefing:{
      location:'Système Veltara — Orbite basse',
      crew:['zara','keel','nova'],
      text:[
        'NOVA : "Capitaine, les réserves d\'énergie de Veltara sont à 3.2%. Durée de vie estimée : 47 jours."',
        'ZARA : "Compris. On décolle. Keel, le moteur tient ?"',
        'KEEL : "Techniquement oui. J\'ai scotché quelques trucs mais ça devrait aller."',
        'ZARA : "...On décolle quand même. Destination : l\'inconnu. Objectif : trouver le Zyonite."',
        'À peine sortis de l\'atmosphère, les premiers éclaireurs Korrax apparaissent sur les radars.',
      ],
    },
  },
  {
    id:2, title:'EMBUSCADE AUX PORTES',
    map:'verge',
    objectiveType:'score', objectiveValue:5000,
    objectiveLabel:'Atteindre 5 000 points',
    bossWave:null,
    narrator:'rex',
    briefing:{
      location:'Zone Frontière — Secteur Delta-7',
      crew:['zara','rex','nova'],
      text:[
        'REX : "Premier contact avec les Korrax. Mi-aliens, mi-robots, 100% antipathiques."',
        'NOVA : "Leur technologie combine biologie organique et cybernétique. Fascinant."',
        'ZARA : "Nova, c\'est pas le moment de faire de la science. Rex, à toi de jouer."',
        'REX : "Avec plaisir, Capitaine !" *sourire inquiétant*',
        'Les Korrax avaient prévu leur passage. Mauvais calcul : ils n\'avaient pas prévu Rex.',
      ],
    },
  },
  {
    id:3, title:'LES MINES DE DRAGOR',
    map:'verge',
    objectiveType:'boss', objectiveValue:null,
    objectiveLabel:'Détruire le Mineur Alpha',
    bossWave:20,
    narrator:'lyra',
    briefing:{
      location:'Ceinture astéroïdes Dragor',
      crew:['zara','lyra','keel'],
      text:[
        'LYRA : "Capitaine ! Les scanners détectent des traces de Zyonite dans cette ceinture !"',
        'ZARA : "Parfait. Problème ?"',
        'LYRA : "Un vaisseau minier Korrax de classe Alpha occupe le secteur. Il fait 4 fois notre taille."',
        'KEEL : "Génial. J\'adore les défis." *rajuste son scotch de réparation nerveusement*',
        'ZARA : "On détruit leur mineur, on récupère les échantillons. Simple."',
        'LYRA : "Rien n\'est jamais simple avec vous..."',
      ],
    },
  },
  {
    id:4, title:'TEMPÊTE BINAIRE',
    map:'aralis',
    objectiveType:'survive', objectiveValue:15,
    objectiveLabel:'Survivre 15 vagues',
    bossWave:15,
    narrator:'keel',
    briefing:{
      location:'Système HD-7734 — Étoiles binaires',
      crew:['zara','keel','tika'],
      text:[
        'KEEL : "Bonne nouvelle : j\'ai réparé le refroidissement. Mauvaise : on traverse deux soleils."',
        'TIKA : "Comme une excursion tropicale !" *rires*',
        'ZARA : "La crème solaire n\'aide pas contre 8 000 degrés, Tika."',
        'NOVA : "Signal hostile détecté. Beaucoup de signaux. Très beaucoup."',
        'ZARA : "\'Très beaucoup\' c\'est pas un nombre, Nova."',
        'NOVA : "Je l\'évalue à : trop."',
      ],
    },
  },
  {
    id:5, title:'LE MARCHÉ SPATIAL',
    map:'aralis',
    objectiveType:'score', objectiveValue:8000,
    objectiveLabel:'Atteindre 8 000 points',
    bossWave:null,
    narrator:'zara',
    briefing:{
      location:'Station Nexus-7 — Zone neutre',
      crew:['zara','lyra','rex'],
      text:[
        'ZARA : "Station commerciale neutre. On se ravitaille, on récupère des infos, et on repart."',
        'NOVA : "Probabilité que ça se passe sans incident : 12%."',
        'REX : "J\'aime ces cotes."',
        'LYRA : "Des Korrax infiltrés ! Partout !"',
        'ZARA : "Lyra. Moins de maths, plus de tirs."',
        'LYRA : "...C\'est la chose la plus belle qu\'on m\'ait jamais dite."',
      ],
    },
  },
  {
    id:6, title:'NÉBULEUSE TOXIQUE',
    map:'aralis',
    objectiveType:'survive', objectiveValue:20,
    objectiveLabel:'Survivre 20 vagues',
    bossWave:20,
    narrator:'tika',
    briefing:{
      location:'Nébuleuse Veridian — Zone Z-99',
      crew:['zara','tika','nova'],
      text:[
        'TIKA : "Oh ! Cette nébuleuse est magnifique ! Ces teintes de vert..."',
        'NOVA : "Composée à 40% de méthane, 30% de soufre. Toxicité : létale."',
        'TIKA : "...Toujours magnifique."',
        'KEEL : "J\'ai renforcé les boucliers. Enfin... j\'ai mis plus de scotch."',
        'NOVA : "Le scotch n\'est pas un matériau d\'ingénierie certifié."',
        'KEEL : "Et pourtant ça marche."',
      ],
    },
  },
  {
    id:7, title:'LE TRAQUEUR',
    map:'krynos',
    objectiveType:'boss', objectiveValue:null,
    objectiveLabel:'Détruire le Chasseur Korrax',
    bossWave:18,
    narrator:'nova',
    briefing:{
      location:'Espace profond — Coordonnées inconnues',
      crew:['zara','rex','nova'],
      text:[
        'NOVA : "Un vaisseau Korrax nous suit depuis 3 secteurs."',
        'REX : "Depuis combien de temps tu le savais ?"',
        'NOVA : "72 heures. Je ne voulais pas créer de panique inutile."',
        'ZARA : "NOVA !"',
        'NOVA : "Résultat de ma simulation : panique inutile."',
        'ZARA : "On fait demi-tour. Si quelqu\'un nous chasse, c\'est nous qui l\'attendons."',
        'REX : "C\'est maintenant que j\'aime mon métier."',
      ],
    },
  },
  {
    id:8, title:'CEINTURE DE GIVRE',
    map:'krynos',
    objectiveType:'score', objectiveValue:12000,
    objectiveLabel:'Atteindre 12 000 points',
    bossWave:null,
    narrator:'lyra',
    briefing:{
      location:'Secteur Krynos — Anneau glaciaire',
      crew:['zara','lyra','keel'],
      text:[
        'LYRA : "Des cristaux de Zyonite pur dans cette ceinture de glace !"',
        'KEEL : "Et la température est de -200°. J\'aurais dû emporter mon pull."',
        'REX : "On peut juste tout faire exploser et prendre les cristaux ?"',
        'LYRA : "NON ! Une explosion et on n\'a plus de cristaux, plus de vaisseau, plus nous."',
        'ZARA : "On avance prudemment. Tout le monde loin des boutons rouges."',
        'REX : *regarde ses mains*',
        'ZARA : "Rex."',
      ],
    },
  },
  {
    id:9, title:'LA FORGE INFERNALE',
    map:'krynos',
    objectiveType:'boss', objectiveValue:null,
    objectiveLabel:'Détruire le Contremaître Korrax',
    bossWave:22,
    narrator:'rex',
    briefing:{
      location:'Pyron-VII — Usine de fabrication Korrax',
      crew:['zara','rex','tika'],
      text:[
        'REX : "C\'est là qu\'ils fabriquent leurs robots. On détruit l\'usine, on les ralentit."',
        'TIKA : "Tous ces pauvres robots qui n\'auront jamais vu le jour..." *soupir*',
        'REX : "Tika, ils essaient de nous tuer."',
        'TIKA : "Je sais ! Mais quand même."',
        'NOVA : "Température extérieure : 600 degrés. Je signale ça pour info."',
        'KEEL : "Mon scotch va fondre..."',
      ],
    },
  },
  {
    id:10, title:'LE SIGNAL MYSTÉRIEUX',
    map:'pyron',
    objectiveType:'score', objectiveValue:15000,
    objectiveLabel:'Atteindre 15 000 points',
    bossWave:null,
    narrator:'nova',
    briefing:{
      location:'Secteur Oméga — Zone non cartographiée',
      crew:['zara','nova','lyra'],
      text:[
        'NOVA : "Un signal de source inconnue. Fréquence identique aux émissions Zyonite théoriques."',
        'LYRA : "C\'est peut-être une ancienne civilisation qui a trouvé le Zyonite !"',
        'NOVA : "Probabilité que ce soit un piège Korrax : 94.7%."',
        'ZARA : "Et tu nous envoies quand même là-bas ?"',
        'NOVA : "Les 5.3% restants pourraient sauver Veltara."',
        'REX : *déjà dans son siège de combat* "J\'espère que c\'est un piège."',
      ],
    },
  },
  {
    id:11, title:'FLOTTE D\'INVASION',
    map:'pyron',
    objectiveType:'survive', objectiveValue:30,
    objectiveLabel:'Survivre 30 vagues',
    bossWave:30,
    narrator:'zara',
    briefing:{
      location:'Carrefour galactique — Secteur Néant',
      crew:['zara','rex','keel'],
      text:[
        'NOVA : "Capitaine. J\'ai trouvé la flotte principale Korrax."',
        'ZARA : "Combien de vaisseaux ?"',
        'NOVA : "Oui."',
        'ZARA : "...C\'est pas un nombre, Nova."',
        'NOVA : "Disons que \'beaucoup\' serait une sous-estimation flatteuse."',
        'ZARA : "Ils nous bloquent la route vers le Zyonite. On passe à travers."',
        'REX : "ENFIN ! Je commençais à m\'ennuyer."',
      ],
    },
  },
  {
    id:12, title:'LE GARDIEN DES PORTES',
    map:'pyron',
    objectiveType:'boss', objectiveValue:null,
    objectiveLabel:'Détruire le Gardien Suprême',
    bossWave:25,
    narrator:'lyra',
    briefing:{
      location:'Porte de Korraxis — Frontière impériale',
      crew:['zara','lyra','nova'],
      text:[
        'LYRA : "Nous y sommes. La porte du territoire Korrax. Derrière : le Zyonite."',
        'NOVA : "Et le Gardien Suprême. Il n\'a jamais été vaincu."',
        'ZARA : "Première fois à tout."',
        'TIKA : "Vous êtes tous merveilleux, au cas où..." *regards inquiets*',
        'ZARA : "On rentre tous à la maison. Je te le promets."',
        'REX : "Et maintenant, on casse cette porte."',
      ],
    },
  },
  {
    id:13, title:'CŒUR DE L\'EMPIRE',
    map:'nyxar',
    objectiveType:'score', objectiveValue:20000,
    objectiveLabel:'Atteindre 20 000 points',
    bossWave:null,
    narrator:'keel',
    briefing:{
      location:'Korraxis Prime — Orbite haute',
      crew:['zara','keel','rex'],
      text:[
        'KEEL : "On est au centre de leur empire. On est complètement fous."',
        'REX : "Non, on est courageux. Nuance."',
        'KEEL : "La nuance c\'est qu\'on rentre à la maison ou non."',
        'NOVA : "Chaque vaisseau Korrax dans 40 000 km est en route vers nous."',
        'ZARA : "On attire leur attention pendant que Lyra localise le Zyonite."',
        'LYRA : *via comm* "L\'énergie de ce nexus pourrait alimenter Veltara des millénaires !"',
      ],
    },
  },
  {
    id:14, title:'LA SOURCE',
    map:'nyxar',
    objectiveType:'survive', objectiveValue:40,
    objectiveLabel:'Survivre 40 vagues',
    bossWave:40,
    narrator:'nova',
    briefing:{
      location:'Nexus Zyonite — Coordonnées secrètes',
      crew:['zara','lyra','nova'],
      text:[
        'LYRA : *voix tremblante* "C\'est lui. Le Nexus Zyonite. Une sphère d\'énergie pure."',
        'NOVA : "Magnifique. Et entourée par la totalité des forces Korrax restantes."',
        'ZARA : "Quelqu\'un protège le Zyonite."',
        'NOVA : "Un signal de commandement provient du centre. Rang : Suprême Commandant."',
        'REX : *sifflement* "Le grand patron en personne."',
        'ZARA : "Alors c\'est lui qu\'on va voir."',
      ],
    },
  },
  {
    id:15, title:'CONFRONTATION FINALE',
    map:'nyxar',
    objectiveType:'boss', objectiveValue:null,
    objectiveLabel:'Vaincre KORRAX-PRIME',
    bossWave:1, isFinalBoss:true,
    narrator:'zara',
    briefing:{
      location:'Trône de Korrax-Prime — Nexus Central',
      crew:['zara','rex','lyra','keel','tika','nova'],
      text:[
        'KORRAX-PRIME : "Petits humains. Vous avez survécu jusqu\'ici. Impressionnant. Inutile."',
        'ZARA : "Vous gardez pour vous seul une énergie qui pourrait sauver des millions de vies."',
        'KORRAX-PRIME : "Cette énergie me rendra immortel. Vos vies ne m\'intéressent pas."',
        'REX : "J\'ai une réponse à ça." *charge ses armes*',
        'TIKA : "On est tous là, Capitaine. Ensemble."',
        'NOVA : "Probabilité de victoire : 50.0001%. Je préfère ça à moins de 50%."',
        'ZARA : "Pour Veltara. STARHUNTER — ATTAQUE !"',
      ],
    },
  },
];

// ── SAUVEGARDE CAMPAGNE — 3 SLOTS ─────────────────────────────────
const CAMPAIGN_SLOTS = ['easy', 'normal', 'hard'];

function getCampaignSlot(diff){
  try {
    const raw = localStorage.getItem('sf_campaign_' + diff);
    return raw ? JSON.parse(raw) : null;
  } catch(e) { return null; }
}

function saveCampaignSlot(diff, progress){
  try {
    localStorage.setItem('sf_campaign_' + diff, JSON.stringify(progress));
  } catch(e) {}
  try {
    const sb = window._sbClient || null;
    if(sb && typeof sb.from === 'function'){
      sb.from('campaign_progress').upsert({
        player_name: typeof playerName !== 'undefined' ? playerName : 'PILOTE',
        difficulty: diff,
        unlocked_mission: progress.unlockedMission,
        completed_missions: progress.completedMissions,
        updated_at: new Date().toISOString(),
      }).then(()=>{}).catch(()=>{});
    }
  } catch(e) {}
}

function resetCampaignSlot(diff){
  try { localStorage.removeItem('sf_campaign_' + diff); } catch(e) {}
}

function completeMission(missionId){
  const diff = typeof campaignDifficulty !== 'undefined' ? campaignDifficulty : 'normal';
  const slot = getCampaignSlot(diff) || { unlockedMission:1, completedMissions:[] };
  if(!slot.completedMissions.includes(missionId)){
    slot.completedMissions.push(missionId);
  }
  if(slot.unlockedMission <= missionId){
    slot.unlockedMission = missionId + 1;
  }
  saveCampaignSlot(diff, slot);
  return slot;
}
