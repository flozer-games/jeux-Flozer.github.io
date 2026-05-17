// ═══════════════════════════════════════════════════════════════════
// STARFIRE — Engine
// ═══════════════════════════════════════════════════════════════════
const cv=document.getElementById('c'),ctx=cv.getContext('2d');
const cmEl=document.getElementById('cm'),cmx=cmEl.getContext('2d');
// H calculé par l'HTML avant le chargement du moteur (voir _gameH dans Starfire.html)
// isMobile = pointeur principal imprecis (doigt) → active le joystick virtuel
const isMobile=window.matchMedia('(pointer:coarse)').matches;
const W=640,H=840;
let joystick={active:false,id:null,baseX:0,baseY:0,dx:0,dy:0};
let gpIndex=null,gpRT=false,gpStart=false;
let inputMode='keyboard'; // 'keyboard' | 'gamepad'
let sensitivity=1.0; // multiplicateur de vitesse joueur (0.5 – 2.0)
let difficulty='normal'; // 'easy' | 'normal' | 'hard'
const OVel=document.getElementById('ov');
const BBel=document.getElementById('bbar'),BBIel=document.getElementById('bbi'),BNel=document.getElementById('bname');
const BLel=document.getElementById('blog');
const ROVel=document.getElementById('rov');

// ============================================================
//  STARFIRE — AUDIO SYSTEM v2 — 8 pistes distinctes
// ============================================================
let AC=null, MAST=null, masterVolume=0.0125;
let musicOn=false, musInt=null, musStep=0, musNext=0;
let activeNodes=[], currentTrackName=null;
function initAC(){
  if(AC)return;
  AC=new(window.AudioContext||window.webkitAudioContext)();
  MAST=AC.createGain();
  MAST.gain.value=masterVolume;
  MAST.connect(AC.destination);
}
// Note simple
function n(freq,t,dur,vol,wave='sine',det=0){
  if(!AC||!MAST)return;
  const o=AC.createOscillator(),g=AC.createGain();
  o.type=wave; o.frequency.value=freq;
  if(det) o.detune.value=det;
  o.connect(g); g.connect(MAST);
  g.gain.setValueAtTime(0.001,t);
  g.gain.linearRampToValueAtTime(vol,t+0.02);
  g.gain.setValueAtTime(vol*.7,t+dur*.7);
  g.gain.exponentialRampToValueAtTime(0.001,t+dur);
  o.start(t); o.stop(t+dur+0.05);
  activeNodes.push(o);
  o.onended=()=>{const i=activeNodes.indexOf(o);if(i>-1)activeNodes.splice(i,1);};
}
// Kick drum
function kk(t){
  if(!AC||!MAST)return;
  const o=AC.createOscillator(),g=AC.createGain();
  o.type='sine';
  o.frequency.setValueAtTime(160,t);
  o.frequency.exponentialRampToValueAtTime(35,t+0.15);
  o.connect(g); g.connect(MAST);
  g.gain.setValueAtTime(0.9,t);
  g.gain.exponentialRampToValueAtTime(0.001,t+0.22);
  o.start(t); o.stop(t+0.25);
  activeNodes.push(o);
}
// Hihat
function hh(t,vol=0.25,dur=0.03){
  if(!AC||!MAST)return;
  const buf=AC.createBuffer(1,Math.floor(AC.sampleRate*.08),AC.sampleRate);
  const d=buf.getChannelData(0); for(let i=0;i<d.length;i++) d[i]=Math.random()*2-1;
  const src=AC.createBufferSource(),g=AC.createGain(),f=AC.createBiquadFilter();
  f.type='highpass'; f.frequency.value=9000;
  src.buffer=buf; src.connect(f); f.connect(g); g.connect(MAST);
  g.gain.setValueAtTime(vol,t);
  g.gain.exponentialRampToValueAtTime(0.001,t+dur);
  src.start(t); src.stop(t+dur+0.01);
  activeNodes.push(src);
}
// Snare
function sn(t){
  if(!AC||!MAST)return;
  const buf=AC.createBuffer(1,Math.floor(AC.sampleRate*.12),AC.sampleRate);
  const d=buf.getChannelData(0); for(let i=0;i<d.length;i++) d[i]=Math.random()*2-1;
  const src=AC.createBufferSource(),g=AC.createGain(),f=AC.createBiquadFilter();
  f.type='bandpass'; f.frequency.value=900; f.Q.value=0.8;
  src.buffer=buf; src.connect(f); f.connect(g); g.connect(MAST);
  g.gain.setValueAtTime(0.55,t);
  g.gain.exponentialRampToValueAtTime(0.001,t+0.1);
  src.start(t); src.stop(t+0.15);
  activeNodes.push(src);
}
// ---- 8 PISTES ----
const TRACKS={
  // PISTE 1 — MENU : héroïque, Ré majeur, 140 BPM, sawtooth driving
  menu:{stepDur:60/140/4, steps:32,
    tick(s,t){const sd=this.stepDur;
      if([0,8,16,24].includes(s)) kk(t);
      if([4,12,20,28].includes(s)) sn(t);
      if(s%2===0) hh(t,0.18,0.03);
      const bass=[73.42,null,null,null,73.42,null,null,null,110,null,null,null,92.50,null,null,null,
                  73.42,null,null,null,73.42,null,null,null,110,null,null,null,98,null,null,null];
      if(bass[s]) n(bass[s],t,sd*3,0.12,'sawtooth');
      const mel=[null,null,293.66,null,null,null,369.99,null,null,null,440,null,null,null,587.33,null,
                 null,null,440,null,null,null,369.99,null,null,null,293.66,null,null,null,329.63,null];
      if(mel[s]) n(mel[s],t,sd*1.8,0.07,'square');
      if(s===0)[293.66,369.99,440].forEach(f=>n(f,t,sd*2,0.04,'sawtooth'));
      if(s===16)[261.63,329.63,392].forEach(f=>n(f,t,sd*2,0.04,'sawtooth'));
    }},
  // PISTE 2 — MAP 0 : espace profond, 70 BPM, triangle+sine, ambiant rythmé
  map0:{stepDur:60/70/4, steps:32,
    tick(s,t){const sd=this.stepDur;
      // Kick discret sur les temps forts
      if(s===0||s===16) kk(t);
      if(s===8||s===24) hh(t,0.18,0.025);
      if(s%4===2) hh(t,0.10,0.012);
      // Basse grave audible en triangle
      const bass=[55,null,null,null,55,null,65.41,null,55,null,null,null,49,null,null,null,
                  55,null,null,null,55,null,73.42,null,65.41,null,null,null,55,null,null,null];
      if(bass[s]) n(bass[s],t,sd*3,0.22,'triangle');
      // Mélodie spatiale en sine
      const mel=[null,null,null,null,220,null,null,null,null,null,246.94,null,null,null,null,null,
                 null,null,null,null,261.63,null,null,null,null,null,220,null,null,null,null,null];
      if(mel[s]) n(mel[s],t,sd*2.5,0.09,'sine');
      // Nappe de fond
      if(s===0)[110,138.59,164.81].forEach(f=>n(f,t,sd*8,0.06,'sine'));
      if(s===16)[98,123.47,146.83].forEach(f=>n(f,t,sd*8,0.06,'sine'));
    }},
  // PISTE 3 — MAP 1 : désert exotique, 105 BPM, square, Sol mineur groove
  map1:{stepDur:60/105/4, steps:32,
    tick(s,t){const sd=this.stepDur;
      if([0,16].includes(s)) kk(t);
      if(s%8===0) hh(t,0.28,0.06);
      if(s%4===2) hh(t,0.14,0.03);
      const bass=[98,null,null,null,98,null,116.54,null,98,null,null,null,146.83,null,null,null,
                  116.54,null,null,null,116.54,null,98,null,146.83,null,null,null,174.61,null,null,null];
      if(bass[s]) n(bass[s],t,sd*3.5,0.10,'square');
      const mel=[196,null,233.08,null,261.63,null,293.66,null,311.13,null,293.66,null,261.63,null,233.08,null,
                 196,null,174.61,null,196,null,233.08,null,261.63,null,233.08,null,196,null,null,null];
      if(mel[s]) n(mel[s],t,sd*1.5,0.06,'square');
    }},
  // PISTE 4 — MAP 2 : cristal glacé, 155 BPM, sine très aigu, Mi majeur
  map2:{stepDur:60/155/4, steps:32,
    tick(s,t){const sd=this.stepDur;
      if(s%2===0) hh(t,0.16,0.022);
      if(s%8===4) hh(t,0.26,0.04);
      const bass=[82.41,null,null,null,null,null,null,null,123.47,null,null,null,null,null,null,null,
                  82.41,null,null,null,null,null,null,null,103.83,null,null,null,null,null,null,null];
      if(bass[s]) n(bass[s],t,sd*8,0.07,'triangle');
      const mel=[659.26,null,739.99,null,830.61,null,987.77,null,1318.51,null,987.77,null,830.61,null,739.99,null,
                 659.26,null,587.33,null,659.26,null,739.99,null,830.61,null,739.99,null,659.26,null,587.33,null];
      if(mel[s]) n(mel[s],t,sd*1.2,0.05,'sine');
      if(s%8===0) n(1318.51,t,sd*4,0.03,'sine');
    }},
  // PISTE 5 — MAP 3 : lave industrielle, 115 BPM, sawtooth grave, Do mineur lourd
  map3:{stepDur:60/115/4, steps:32,
    tick(s,t){const sd=this.stepDur;
      if(s%8===0) kk(t);
      if(s%8===4) sn(t);
      if(s%4===0) hh(t,0.14,0.05);
      const bass=[65.41,null,null,65.41,null,null,65.41,null,98,null,null,null,null,null,null,null,
                  77.78,null,null,77.78,null,null,77.78,null,65.41,null,null,null,58.27,null,null,null];
      if(bass[s]) n(bass[s],t,sd*2.5,0.15,'sawtooth',10);
      const mel=[null,null,261.63,null,null,null,233.08,null,null,null,207.65,null,null,null,196,null,
                 null,null,174.61,null,null,null,155.56,null,null,null,138.59,null,null,null,130.81,null];
      if(mel[s]) n(mel[s],t,sd*2,0.08,'sawtooth');
    }},
  // PISTE 6 — MAP 4 : chaos total, 175 BPM, dissonant, rythme syncopé
  map4:{stepDur:60/175/4, steps:32,
    tick(s,t){const sd=this.stepDur;
      if([0,5,8,11,16,21,24,29].includes(s)) kk(t);
      if([4,12,20,28].includes(s)) sn(t);
      if(s%2===0) hh(t,0.20,0.02);
      const bass=[58.27,null,null,null,61.74,null,null,null,65.41,null,null,null,69.30,null,null,null,
                  65.41,null,null,null,61.74,null,null,null,58.27,null,null,null,54.97,null,null,null];
      if(bass[s]) n(bass[s],t,sd*3,0.13,'sawtooth',20);
      const mel=[185,null,174.61,null,164.81,null,174.61,null,185,null,195.99,null,207.65,null,195.99,null,
                 185,null,174.61,null,155.56,null,164.81,null,155.56,null,146.83,null,155.56,null,164.81,null];
      if(mel[s]) n(mel[s],t,sd*0.8,0.07,'sine');
      if([0,16].includes(s))[185,195.99,246.94].forEach(f=>n(f,t,sd,0.05,'sawtooth'));
    }},
  // PISTE 7 — BOSS : intensité maximale, 200 BPM, tout en percussion + stabs
  boss:{stepDur:60/200/4, steps:32,
    tick(s,t){const sd=this.stepDur;
      if(s%4===0) kk(t);
      if(s%8===4) sn(t);
      if(s%4===2) sn(t);
      hh(t,0.28,0.018);
      if(s%4===0) n(82.41,t,sd*1.5,0.18,'sawtooth',30);
      if(s%8===6) n(98,t,sd,0.15,'sawtooth');
      if([0,3,8,11,16,19,24,27].includes(s))
        [164.81,207.65,246.94].forEach(f=>n(f,t,sd*.6,0.06,'sawtooth'));
    }},
  // PISTE 8 — VICTOIRE : fanfare Ré majeur montante, 120 BPM, triomphante
  victory:{stepDur:60/120/4, steps:32,
    tick(s,t){const sd=this.stepDur;
      const fan=[293.66,null,369.99,null,440,null,null,null,587.33,null,null,null,null,null,null,null,
                 587.33,null,440,null,369.99,null,440,null,587.33,null,739.99,null,880,null,null,null];
      if(fan[s]) n(fan[s],t,sd*3,0.12,'sawtooth');
      if(s===0)[293.66,369.99,440].forEach(f=>n(f,t,sd*4,0.05,'sawtooth'));
      if(s===8)[440,587.33,739.99].forEach(f=>n(f,t,sd*4,0.05,'sawtooth'));
      if(s===16)[440,587.33,739.99].forEach(f=>n(f,t,sd*4,0.07,'sawtooth'));
      if(s===24)[587.33,739.99,880].forEach(f=>n(f,t,sd*8,0.08,'sawtooth'));
      if(s%8===0&&s<24) kk(t);
      if(s===28) kk(t);
    }},
};
// ---- MOTEUR DE LECTURE ----
function musicTick(){
  if(!AC||!musicOn||!currentTrackName)return;
  const track=TRACKS[currentTrackName];
  // Si l'onglet était en arrière-plan, AC.currentTime a avancé sans nous —
  // on resynchronise plutôt que de rejouer tous les ticks manqués d'un coup
  if(musNext < AC.currentTime - 0.5) musNext = AC.currentTime + 0.05;
  while(musNext<AC.currentTime+0.25){
    track.tick(musStep%track.steps, musNext);
    musNext+=track.stepDur;
    musStep++;
  }
}
function playTrack(name){
  stopMusic();
  if(!AC) initAC();
  if(AC.state==='suspended') AC.resume();
  currentTrackName=name;
  musicOn=true; musStep=0;
  musNext=AC.currentTime+0.1;
  // Restaure le gain AVANT de lancer l'interval pour que les premières notes sortent au bon volume
  MAST.gain.cancelScheduledValues(AC.currentTime);
  MAST.gain.setValueAtTime(masterVolume,AC.currentTime);
  musInt=setInterval(musicTick,40);
}
function stopMusic(){
  musicOn=false;
  if(musInt){clearInterval(musInt);musInt=null;}
  if(AC&&MAST){
    MAST.gain.cancelScheduledValues(AC.currentTime);
    MAST.gain.setValueAtTime(0,AC.currentTime);
  }
  activeNodes.forEach(o=>{try{o.stop(0);o.disconnect();}catch(e){}});
  activeNodes=[];
}
function playGameOverCrash(){
  if(!AC||!MAST)return;
  // Restaure le gain que stopMusic() a mis à 0
  MAST.gain.cancelScheduledValues(AC.currentTime);
  MAST.gain.setValueAtTime(masterVolume,AC.currentTime);
  const t=AC.currentTime;
  // Explosion grave descendante
  const o1=AC.createOscillator(),g1=AC.createGain();
  o1.type='sawtooth';
  o1.frequency.setValueAtTime(180,t);
  o1.frequency.exponentialRampToValueAtTime(25,t+1.8);
  o1.connect(g1);g1.connect(MAST);
  g1.gain.setValueAtTime(0.6,t);
  g1.gain.exponentialRampToValueAtTime(0.001,t+1.8);
  o1.start(t);o1.stop(t+1.9);
  // Bruit de débris
  const bufLen=Math.floor(AC.sampleRate*1.2);
  const buf=AC.createBuffer(1,bufLen,AC.sampleRate);
  const data=buf.getChannelData(0);
  for(let i=0;i<bufLen;i++)data[i]=(Math.random()*2-1)*(1-i/bufLen);
  const noise=AC.createBufferSource(),gn=AC.createGain();
  const filt=AC.createBiquadFilter();
  filt.type='lowpass';filt.frequency.value=800;
  noise.buffer=buf;
  noise.connect(filt);filt.connect(gn);gn.connect(MAST);
  gn.gain.setValueAtTime(0.5,t);
  gn.gain.exponentialRampToValueAtTime(0.001,t+1.2);
  noise.start(t);noise.stop(t+1.3);
  // Tonalité métal brisé
  [320,410,275].forEach((freq,i)=>{
    const o=AC.createOscillator(),g=AC.createGain();
    o.type='triangle';
    o.frequency.value=freq;
    o.connect(g);g.connect(MAST);
    g.gain.setValueAtTime(0,t+i*0.08);
    g.gain.linearRampToValueAtTime(0.25,t+i*0.08+0.05);
    g.gain.exponentialRampToValueAtTime(0.001,t+i*0.08+0.6);
    o.start(t+i*0.08);o.stop(t+i*0.08+0.7);
  });
}
function playHitPlayer(){
  if(!AC||!MAST)return;
  MAST.gain.cancelScheduledValues(AC.currentTime);
  MAST.gain.setValueAtTime(masterVolume,AC.currentTime);
  const t=AC.currentTime;
  // Son grave distordu (impact douloureux)
  const o=AC.createOscillator(),g=AC.createGain();
  o.type='sawtooth';
  o.frequency.setValueAtTime(220,t);
  o.frequency.exponentialRampToValueAtTime(60,t+0.3);
  o.connect(g);g.connect(MAST);
  g.gain.setValueAtTime(0.5,t);
  g.gain.exponentialRampToValueAtTime(0.001,t+0.35);
  o.start(t);o.stop(t+0.4);
  // Bruit court crackle
  const bufLen=Math.floor(AC.sampleRate*0.15);
  const buf=AC.createBuffer(1,bufLen,AC.sampleRate);
  const data=buf.getChannelData(0);
  for(let i=0;i<bufLen;i++)data[i]=(Math.random()*2-1)*(1-i/bufLen);
  const ns=AC.createBufferSource(),gn=AC.createGain();
  ns.buffer=buf;ns.connect(gn);gn.connect(MAST);
  gn.gain.setValueAtTime(0.3,t);
  gn.gain.exponentialRampToValueAtTime(0.001,t+0.15);
  ns.start(t);ns.stop(t+0.2);
}
function playEnemyKill(){
  if(!AC||!MAST)return;
  const t=AC.currentTime;
  // Pop/ding satisfaisant
  const o=AC.createOscillator(),g=AC.createGain();
  o.type='triangle';
  o.frequency.setValueAtTime(880,t);
  o.frequency.exponentialRampToValueAtTime(440,t+0.12);
  o.connect(g);g.connect(MAST);
  g.gain.setValueAtTime(0.25,t);
  g.gain.exponentialRampToValueAtTime(0.001,t+0.15);
  o.start(t);o.stop(t+0.18);
}
function adjustVolume(delta,targetId='volDisplay'){
  masterVolume=Math.min(1,Math.max(0,masterVolume+delta));
  if(MAST) MAST.gain.setValueAtTime(masterVolume,AC.currentTime);
  const d=document.getElementById(targetId);
  if(d) d.textContent=Math.round(masterVolume*400)+'%';
}

function boop(f,d,v=.13,t='square',dc=.28){
  if(!AC||!MAST)return;const o=AC.createOscillator(),g=AC.createGain();
  o.type=t;o.frequency.value=f;o.connect(g);g.connect(MAST);
  g.gain.setValueAtTime(v,AC.currentTime);g.gain.exponentialRampToValueAtTime(0.001,AC.currentTime+dc);
  o.start();o.stop(AC.currentTime+d);
}
function nzz(d=.15,v=.12,fq=300){
  if(!AC||!MAST)return;const buf=AC.createBuffer(1,AC.sampleRate*d,AC.sampleRate),data=buf.getChannelData(0);
  for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1);
  const s=AC.createBufferSource(),g=AC.createGain(),f=AC.createBiquadFilter();
  f.type='bandpass';f.frequency.value=fq;s.buffer=buf;s.connect(f);f.connect(g);g.connect(MAST);
  g.gain.setValueAtTime(v,AC.currentTime);g.gain.exponentialRampToValueAtTime(0.001,AC.currentTime+d);s.start();
}
const snd={
  expl:()=>{nzz(.2,.18);boop(85,.16,.13,'sawtooth',.16);},
  bigE:()=>{nzz(.38,.28,200);boop(55,.28,.22,'sawtooth',.28);},
  bonus:()=>{boop(440,.06,.1,'sine',.06);setTimeout(()=>boop(660,.1,.1,'sine',.1),65);},
  pHit:()=>{nzz(.16,.22);boop(155,.14,.17,'sawtooth',.14);},
  win:()=>{boop(440,.1,.1,'sine',.1);setTimeout(()=>boop(550,.1,.1,'sine',.1),130);setTimeout(()=>boop(660,.2,.1,'sine',.2),260);},
  over:()=>{boop(220,.3,.16,'sawtooth',.3);setTimeout(()=>boop(180,.3,.16,'sawtooth',.3),340);setTimeout(()=>boop(110,.6,.16,'sawtooth',.6),680);},
  ding:()=>boop(880,.05,.08,'sine',.05),
  sel:()=>{boop(620,.06,.09,'sine',.06);setTimeout(()=>boop(880,.08,.07,'sine',.08),60);},
};

// ── STATE ──────────────────────────────────────────────────────────
let keys={},FN=0,GS='menu',RAF=null;
let currentWorld=0;

// ── STORAGE WRAPPER (window.storage en artifact, localStorage en fallback) ──
const Store={
  async get(k){
    try{if(typeof window.storage!=='undefined'){return await window.storage.get(k);}}catch(e){}
    try{const v=localStorage.getItem(k);if(v!==null)return{value:v};throw new Error('nf');}catch(e){throw e;}
  },
  async set(k,v){
    let ok=false;
    try{if(typeof window.storage!=='undefined'){await window.storage.set(k,v);ok=true;}}catch(e){}
    if(!ok)try{localStorage.setItem(k,v);}catch(e){}
  }
};
let stars,planets,bholes,comets,particlesBg;
let player,bullets,enemies,particles,bonuses,floats,boss;
let score,lives,wave,fTimer,eTimer,wTimer,bSpawned,bDefeated,bbTimer,laserT,rouletteQueued,rouletteDelay,squadTimer;
let chosenShip=SHIPS[1], chosenMap=MAPS[0], curQuote=QUOTES[0];
let parallaxOffset=0,bgScrollY=0,isBW=false;
// ── SCREEN SHAKE ───────────────────────────────────────────────────
let shakeAmt=0,shakeDur=0,shakeX=0,shakeY=0;
function shake(amt,dur){shakeAmt=Math.max(shakeAmt,amt);shakeDur=Math.max(shakeDur,dur);}
// ── COMBO ──────────────────────────────────────────────────────────
let combo=0,comboTimer=0;
const COMBO_MAX=12,COMBO_DECAY=180;
// ── POUVOIR UNIQUE ──────────────────────────────────────────────────
let powerBar=0,powerActive=false,powerUsedCount=0,powerFragsSpawned=0;
let powerBubbles=[];
// ── MULTIPLAYER ────────────────────────────────────────────────────
let mpMode=false,mpPeer=null,mpConn=null,mpHosted=false;
let mpOpponentScore=0,mpOpponentWave=0,mpOpponentAlive=true;
let mpRoomCode='';
const POWER_FRAGS={
  raptor:  {col:'#22d3ee',label:'FRAGMENT CYAN',  glow:'#22d3ee'},
  sentinel:{col:'#9d4dff',label:'FRAGMENT VIOLET',glow:'#9d4dff'},
  titan:   {col:'#ff6b00',label:'FRAGMENT FOUDRE',glow:'#ff6b00'},
};
const POWER_MAX_USES=[1,2,2,3,3];
const FRAGS_NEEDED=3;
function getPwCfg(key){return POWER_FRAGS[key]||POWER_FRAGS.raptor;}

function logB(t){const b=BD.find(x=>x.type===t),d=document.createElement('div');d.className='bl';d.style.color=b.color;d.textContent=b.label;BLel.appendChild(d);setTimeout(()=>d.remove(),2300);}

// ── SUPABASE CLIENT ────────────────────────────────────────────────
const sbReady=typeof SUPABASE_URL==='string'&&SUPABASE_URL.startsWith('https://');
const sb=sbReady&&window.supabase?window.supabase.createClient(SUPABASE_URL,SUPABASE_ANON_KEY):null;
window._sbClient=sb;

// ── HIGH SCORES ────────────────────────────────────────────────────
async function saveScore(s,w,sh,mp,ps,wd){
  const entry={pseudo:(ps||'ANONYME').toUpperCase().slice(0,10),score:s,wave:w,ship:sh,map:mp,world:wd||1,difficulty,date:new Date().toLocaleDateString('fr-FR')};
  if(sb){
    try{await sb.from('scores').insert(entry);}catch(e){console.warn('Supabase insert failed',e);}
  } else {
    try{let arr=[];try{const r=await Store.get('starfire:scores');if(r)arr=JSON.parse(r.value);}catch(e){}
    arr.push(entry);arr.sort((a,b)=>b.score-a.score);
    await Store.set('starfire:scores',JSON.stringify(arr.slice(0,50)));}catch(e){}
  }
  // Meilleur score local (toujours, indépendamment de Supabase)
  try{
    let lb=null;try{const r=await Store.get('starfire:localbest');if(r)lb=JSON.parse(r.value);}catch(e){}
    if(!lb||s>lb.score)await Store.set('starfire:localbest',JSON.stringify({score:s,wave:w,map:mp,pseudo:(ps||'ANONYME').toUpperCase().slice(0,10)}));
  }catch(e){}
}
async function loadAllScores(){
  // Onglet ANCIENS : uniquement les scores où difficulty IS NULL
  if(sb){
    try{
      const{data,error}=await sb.from('scores').select('*').is('difficulty',null).order('score',{ascending:false}).limit(15);
      if(!error&&data)return data;
    }catch(e){console.warn('Supabase loadAll failed',e);}
  }
  try{const r=await Store.get('starfire:scores');if(r)return JSON.parse(r.value).filter(s=>!s.difficulty).slice(0,15);}catch(e){}
  return[];
}
async function loadScores(diffName){
  if(sb){
    try{
      let q=sb.from('scores').select('*').order('score',{ascending:false}).limit(15);
      if(diffName)q=q.eq('difficulty',diffName);
      const{data,error}=await q;
      if(!error&&data)return data;
    }catch(e){console.warn('Supabase select failed',e);}
  }
  try{const r=await Store.get('starfire:scores');if(r){
    let arr=JSON.parse(r.value);
    if(diffName)arr=arr.filter(s=>s.difficulty===diffName);
    return arr.slice(0,15);
  }}catch(e){}
  return[];
}
async function loadTopScore(){
  if(sb){
    try{const{data,error}=await sb.from('scores').select('pseudo,score,map').order('score',{ascending:false}).limit(1);
    if(!error&&data&&data[0])return data[0];}catch(e){}
  }
  try{const r=await Store.get('starfire:scores');if(r){const arr=JSON.parse(r.value);if(arr&&arr[0])return arr[0];}
  }catch(e){}
  return null;
}
async function loadLocalBest(){
  try{const r=await Store.get('starfire:localbest');if(r)return JSON.parse(r.value);}catch(e){}
  return null;
}

// ── MENU SCREENS ───────────────────────────────────────────────────
let menuStarsAnim=null;
function startMenuBg(){
  cancelAnimationFrame(menuStarsAnim);
  const ms=Array.from({length:120},()=>({x:Math.random()*W,y:Math.random()*H,s:Math.random()*1.6+.3,sp:Math.random()*.7+.15,b:Math.random()}));
  // distant nebula
  function tick(){
    cmx.fillStyle='rgba(0,0,8,.35)';cmx.fillRect(0,0,W,H);
    cmx.save();
    const g=cmx.createRadialGradient(W/2,H*.32,30,W/2,H*.32,300);
    g.addColorStop(0,'rgba(60,90,180,.08)');g.addColorStop(1,'rgba(0,0,0,0)');
    cmx.fillStyle=g;cmx.fillRect(0,0,W,H);
    cmx.restore();
    ms.forEach(s=>{s.y+=s.sp;if(s.y>H){s.y=0;s.x=Math.random()*W;}cmx.fillStyle=`rgba(255,240,200,${.25+s.b*.7})`;cmx.fillRect(s.x,s.y,s.s,s.s);});
    menuStarsAnim=requestAnimationFrame(tick);
  }
  tick();
}
function stopMenuBg(){cancelAnimationFrame(menuStarsAnim);menuStarsAnim=null;cmx.clearRect(0,0,W,H);}

async function showMenu(){
  GS='menu';
  stopMusic();destroyJoystick();
  if(AC){ playTrack('menu'); }
  else{
    const _m=()=>{
      document.removeEventListener('pointerdown',_m);
      document.removeEventListener('keydown',_m);
      initAC(); playTrack('menu');
    };
    document.addEventListener('pointerdown',_m,{once:true});
    document.addEventListener('keydown',_m,{once:true});
  }
  startMenuBg();
  const pb=document.getElementById('pbtn');if(pb)pb.style.display='none';
  curQuote=QUOTES[Math.floor(Math.random()*QUOTES.length)];
  // top score : placeholder immédiat, chargé en arrière-plan
  const loadingPlaceholder=`<small style="opacity:.4;font-size:11px;letter-spacing:3px;">— chargement —</small>`;
  // charge le vrai top score + meilleur local en arrière-plan sans bloquer le rendu
  Promise.all([loadTopScore(), loadLocalBest()]).then(([top, local])=>{
    const el=document.getElementById('top-score-peek');
    if(el&&top){
      const mapLabel=top.map?`<span style="color:#9944cc;font-size:11px;letter-spacing:2px;"> · ${top.map}</span>`:'';
      el.innerHTML=`<b>★ ${top.pseudo||'PILOTE'} — ${Number(top.score).toLocaleString()}</b>${mapLabel}`;
    } else if(el)el.innerHTML=`<small style="opacity:.5;">&nbsp;</small>`;
    const elL=document.getElementById('local-score-peek');
    if(elL&&local){
      const mapL=local.map?`<span style="color:#c97a20;font-size:11px;letter-spacing:1px;"> · ${local.map}</span>`:'';
      elL.innerHTML=`<b style="color:#ff9a2e;">◈ ${local.pseudo||'MOI'} — ${Number(local.score).toLocaleString()}</b>${mapL}`;
    } else if(elL)elL.innerHTML=`<small style="opacity:.5;">Pas encore de score</small>`;
  }).catch(()=>{});
  // hero ship svg (selected)
  const sh=chosenShip,p=sh.palette;
  const heroSvg=`<svg viewBox="-50 -42 100 84">
    <defs><radialGradient id="hg" cx="50%" cy="40%" r="60%"><stop offset="0%" stop-color="${p.hullHi}"/><stop offset="60%" stop-color="${p.hull}"/><stop offset="100%" stop-color="${p.hullDk}"/></radialGradient></defs>
    <ellipse cx="0" cy="34" rx="14" ry="4" fill="${p.accent}" opacity=".55"><animate attributeName="opacity" values=".4;.9;.4" dur="0.4s" repeatCount="indefinite"/></ellipse>
    <ellipse cx="0" cy="40" rx="6" ry="9" fill="${p.accent}" opacity=".7"><animate attributeName="ry" values="6;14;6" dur="0.35s" repeatCount="indefinite"/></ellipse>
    <path d="M -14 4 L -34 24 L -36 30 L -18 25 L -13 12 Z" fill="${p.wing}"/>
    <path d="M 14 4 L 34 24 L 36 30 L 18 25 L 13 12 Z" fill="${p.wing}"/>
    <path d="M 0 -32 L 14 -14 L 16 13 L 12 27 L -12 27 L -16 13 L -14 -14 Z" fill="url(#hg)"/>
    <path d="M 0 -32 L 7 -14 L 8 13 L 0 9 L -8 13 L -7 -14 Z" fill="${p.wingHi}" opacity=".75"/>
    <ellipse cx="0" cy="-9" rx="6" ry="11" fill="${p.cock}"/>
    <ellipse cx="0" cy="-10" rx="4" ry="8" fill="${p.cockHi}"/>
    <rect x="-1" y="-4" width="2" height="14" fill="${p.accent}"/>
  </svg>`;
  OVel.innerHTML=`
    <div class="scan"></div>
    <div class="menu-shell cpt" style="gap:20px;padding-bottom:40px;">
      <div class="tag-strip"><span><i></i>SECTEUR ZÉTA-9</span><span><i></i>HYPERSPACE STABLE</span><span><i></i>HOSTILES DÉTECTÉS</span></div>
      <div style="position:relative;margin-top:6px;">
        <span class="menu-side l"></span><span class="menu-side r"></span>
        <div class="title" style="font-size:44px;letter-spacing:6px;">STARFIRE</div>
      </div>
      <div class="hero-ship" style="width:110px;height:72px;margin:0;">
        <div class="hero-ring"></div><div class="hero-ring r2"></div>
        <div class="hero-orbit"><i></i></div><div class="hero-orbit b"><i></i></div>
        ${heroSvg}
      </div>
      <div class="brackets" style="font-size:11px;letter-spacing:3px;">TRANSMISSION REÇUE</div>
      <div class="btn-row" style="gap:6px;">
        <button class="sb" id="bs">⚡ COMMENCER</button>
        <button onclick="showCampaign()" class="sb" style="background:linear-gradient(180deg,rgba(0,40,60,.9),rgba(0,15,30,.95));border-color:#00e5ff;color:#00e5ff;width:70%;padding:10px 28px;font-size:18px;box-shadow:0 0 12px rgba(0,200,255,.25) inset;">📖 CAMPAGNE</button>
        <button class="sb alt" id="bmp" style="letter-spacing:3px;padding:10px 28px;font-size:16px;">⚔ MULTIJOUEUR</button>
        <div style="display:flex;gap:8px;">
          <button class="sb alt" id="bsc" style="font-size:13px;letter-spacing:3px;padding:9px 22px;">⟡ Scores</button>
          <button class="sb alt" id="bcr" style="font-size:13px;letter-spacing:3px;padding:9px 22px;">✦ Crédits</button>
        </div>
      </div>
      <div style="display:flex;flex-direction:column;align-items:center;gap:2px;width:100%;margin:10px 0;">
        <small style="font-family:'Courier New',monospace;font-size:10px;letter-spacing:3px;color:#4a70aa;text-transform:uppercase;font-weight:bold;">— Meilleur Score Mondial —</small>
        <span id="top-score-peek" style="font-family:'Courier New',monospace;font-size:13px;letter-spacing:1px;color:#ffd87a;text-align:center;display:block;width:100%;">${loadingPlaceholder}</span>
        <div style="width:60%;height:1px;background:linear-gradient(90deg,transparent,#330055,transparent);margin:3px 0;"></div>
        <small style="font-family:'Courier New',monospace;font-size:10px;letter-spacing:3px;color:#4a70aa;text-transform:uppercase;font-weight:bold;">— Mon Meilleur Score —</small>
        <span id="local-score-peek" style="font-family:'Courier New',monospace;font-size:15px;letter-spacing:1px;color:#ff9a2e;text-align:center;display:block;width:100%;">${loadingPlaceholder}</span>
      </div>
      <div style="margin:10px 0;display:flex;flex-direction:column;align-items:center;gap:5px;">
        <div style="font-family:'VT323','Courier New',monospace;font-size:12px;letter-spacing:4px;color:#9944cc;text-transform:uppercase;">— Contrôles —</div>
        <div style="display:flex;gap:8px;">
          <button id="btn-mode-kb" onclick="setInputMode('keyboard')" style="font-family:'VT323','Courier New',monospace;font-size:16px;letter-spacing:2px;padding:7px 18px;border-radius:3px;cursor:pointer;transition:all .15s;
            ${inputMode==='keyboard'?'background:linear-gradient(180deg,rgba(0,80,60,.9),rgba(0,30,20,.95));color:#00ff88;border:2px solid #00ff88;box-shadow:0 0 14px rgba(0,255,136,.35);':'background:rgba(0,0,0,.5);color:#9944cc;border:2px solid #330044;'}">
            ⌨ CLAVIER</button>
          <button id="btn-mode-gp" onclick="setInputMode('gamepad')" style="font-family:'VT323','Courier New',monospace;font-size:16px;letter-spacing:2px;padding:7px 18px;border-radius:3px;cursor:pointer;transition:all .15s;
            ${inputMode==='gamepad'?'background:linear-gradient(180deg,rgba(0,80,60,.9),rgba(0,30,20,.95));color:#00ff88;border:2px solid #00ff88;box-shadow:0 0 14px rgba(0,255,136,.35);':'background:rgba(0,0,0,.5);color:#9944cc;border:2px solid #330044;'}">
            🎮 MANETTE</button>
        </div>
        <div style="display:flex;align-items:center;gap:16px;">
          <div style="font-family:'VT323','Courier New',monospace;font-size:12px;letter-spacing:2px;${gpIndex!==null?'color:#7dff9e;text-shadow:0 0 8px #7dff9e;':'color:#550077;'}">
            ${gpIndex!==null?'● CONNECTÉE':'○ AUCUNE MANETTE'}
          </div>
          <div style="width:1px;height:20px;background:#330044;"></div>
          <div style="display:flex;align-items:center;gap:7px;">
            <span style="font-family:'VT323','Courier New',monospace;font-size:11px;letter-spacing:3px;color:#660088;text-transform:uppercase;">Sensibilité</span>
            <button onclick="adjustSensitivity(-0.25)" style="background:rgba(30,0,40,.9);color:#ff00cc;border:1px solid #660088;border-radius:4px;padding:1px 10px;font-family:'VT323','Courier New',monospace;font-size:17px;cursor:pointer;">−</button>
            <span class="sens-display" style="color:#ff00cc;font-family:'VT323','Courier New',monospace;font-size:15px;min-width:52px;text-align:center;text-shadow:0 0 8px rgba(255,0,200,.5);">🎯 ${Math.round(sensitivity*100)}%</span>
            <button onclick="adjustSensitivity(0.25)" style="background:rgba(30,0,40,.9);color:#ff00cc;border:1px solid #660088;border-radius:4px;padding:1px 10px;font-family:'VT323','Courier New',monospace;font-size:17px;cursor:pointer;">+</button>
          </div>
        </div>
      </div>
    </div>
    <div style="position:absolute;bottom:10px;left:0;right:0;display:flex;justify-content:space-between;align-items:center;padding:0 14px;">
      <div style="font-family:'VT323','Courier New',monospace;font-size:12px;letter-spacing:3px;color:rgba(255,255,255,.2);"><span style="color:#ff8800;font-weight:bold;">CREATORS</span> <b style="color:#cc66ff;font-weight:normal;text-shadow:0 0 6px #aa44dd;">FLOZER</b> <span style="color:#ff8800;font-weight:bold;">&</span> <b style="color:#aa44cc;font-weight:normal;text-shadow:0 0 6px #882299;">CLAUDE</b></div>
      <div style="display:flex;align-items:center;gap:6px;">
        <button onclick="adjustVolume(-0.0125,'volDisplayMenu')" style="background:rgba(30,0,40,.9);color:#00e5ff;border:1px solid #0099cc;border-radius:4px;padding:2px 9px;font-family:'VT323','Courier New',monospace;font-size:16px;cursor:pointer;">−</button>
        <span style="color:#00e5ff;font-family:'VT323','Courier New',monospace;font-size:14px;">🔊</span>
        <span id="volDisplayMenu" style="color:#00e5ff;font-family:'VT323','Courier New',monospace;font-size:14px;min-width:38px;text-align:center;">${Math.round(masterVolume*400)}%</span>
        <button onclick="adjustVolume(0.0125,'volDisplayMenu')" style="background:rgba(30,0,40,.9);color:#00e5ff;border:1px solid #0099cc;border-radius:4px;padding:2px 9px;font-family:'VT323','Courier New',monospace;font-size:16px;cursor:pointer;">+</button>
      </div>
    </div>
    `;
  OVel.style.display='flex';
  document.getElementById('bs').onclick=()=>{snd.sel&&snd.sel();showShipPick();};
  document.getElementById('bmp').onclick=()=>{snd.sel&&snd.sel();showMPMenu();};
  document.getElementById('bsc').onclick=()=>showScores();
  document.getElementById('bcr').onclick=()=>showCredits();
}

function adjustSensitivity(delta){
  sensitivity=Math.round(Math.min(2.0,Math.max(0.5,sensitivity+delta))*4)/4;
  document.querySelectorAll('.sens-display').forEach(el=>el.textContent=`🎯 ${Math.round(sensitivity*100)}%`);
}

function setInputMode(mode){
  inputMode=mode;
  // Met à jour visuellement les deux boutons sans redessiner tout le menu
  const kb=document.getElementById('btn-mode-kb');
  const gp=document.getElementById('btn-mode-gp');
  if(!kb||!gp)return;
  const activeStyle='background:linear-gradient(180deg,rgba(0,80,60,.9),rgba(0,30,20,.95));color:#00ff88;border:2px solid #00ff88;box-shadow:0 0 14px rgba(0,255,136,.35);';
  const inactiveStyle='background:rgba(0,0,0,.5);color:#9944cc;border:2px solid #330044;box-shadow:none;';
  kb.style.cssText+=mode==='keyboard'?activeStyle:inactiveStyle;
  gp.style.cssText+=mode==='gamepad'?activeStyle:inactiveStyle;
}

function showCredits(){
  OVel.innerHTML=`
    <div class="pick-title">CRÉDITS</div>
    <div class="pick-sub">— Une œuvre originale —</div>
    <div style="font-size:12px;color:#9ec3ff;text-align:center;line-height:1.9;letter-spacing:1px;max-width:340px;">
      Conception de STARFIRE<br>
      <span style="color:#ffd87a;letter-spacing:3px;">VOUS</span><br>
      <span style="color:#ffd87a;letter-spacing:3px;">et Claude</span>
      <span style="font-size:0.95em;color:#ffffff99;">· AI, Code &amp; Design ·</span><br><br>
      Engin & rendu spatial<br>
      <span style="color:#ffd87a;letter-spacing:3px;">CANEVAS HTML</span><br><br>
      Bande-son procédurale<br>
      <span style="color:#ffd87a;letter-spacing:3px;">WEB AUDIO</span>
    </div>
    <div style="height:8px;"></div>
    <button class="sb back" id="bbk">← RETOUR</button>`;
  document.getElementById('bbk').onclick=()=>showMenu();
}

// ── MODE CAMPAGNE ─────────────────────────────────────────────────
let campaignMode = false;
let campaignMission = null;
let campaignDifficulty = 'normal';

function showCampaign(){
  const progress = getCampaignProgress();
  OVel.style.display = 'flex';
  OVel.innerHTML = `
    <div style="width:100%;max-width:560px;padding:16px;
      box-sizing:border-box;font-family:'VT323','Courier New',monospace;
      color:#fff;overflow-y:auto;max-height:820px;">

      <div style="text-align:center;margin-bottom:20px;">
        <div style="font-size:24px;color:#ffd87a;letter-spacing:4px;
          text-shadow:0 0 12px rgba(255,200,80,.8);">
          📖 MODE CAMPAGNE
        </div>
        <div style="font-size:15px;color:#00e5ff;letter-spacing:3px;margin-top:6px;">
          LA QUÊTE DU ZYONITE
        </div>
        <div style="font-size:13px;color:#ffffff55;margin-top:6px;">
          ${progress.completedMissions.length} / 15 missions complétées
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:20px;">
        ${CAMPAIGN_MISSIONS.map(m => {
          const unlocked  = m.id <= progress.unlockedMission;
          const completed = progress.completedMissions.includes(m.id);
          const isCurrent = m.id === progress.unlockedMission;
          const borderCol = completed ? '#22c55e' : isCurrent ? '#ffd87a' : '#444';
          const bgCol     = completed ? 'rgba(20,60,20,.8)' : isCurrent ? 'rgba(50,30,0,.8)' : 'rgba(10,10,10,.8)';
          const icon      = completed ? '✅' : isCurrent ? '⚡' : unlocked ? '🔓' : '🔒';
          return `
          <div onclick="${unlocked ? `showMissionBriefing(${m.id - 1})` : ''}"
            style="background:${bgCol};border:1px solid ${borderCol};
              border-radius:4px;padding:10px 8px;text-align:center;
              cursor:${unlocked ? 'pointer' : 'default'};
              opacity:${unlocked ? 1 : 0.4};transition:all .15s;"
            onmouseover="if(${unlocked})this.style.transform='translateY(-2px)'"
            onmouseout="this.style.transform='translateY(0)'">
            <div style="font-size:11px;color:${borderCol};letter-spacing:1px;">
              ${icon} M${m.id < 10 ? '0' + m.id : m.id}
            </div>
            <div style="font-size:12px;color:${unlocked ? '#fff' : '#666'};
              margin-top:4px;line-height:1.3;letter-spacing:0.5px;">
              ${m.title}
            </div>
          </div>`;
        }).join('')}
      </div>

      <button onclick="showMenu()" style="
        width:100%;padding:12px;background:transparent;
        color:#9944cc;border:1px solid #660088;border-radius:3px;
        font-family:'VT323','Courier New',monospace;
        font-size:17px;letter-spacing:3px;cursor:pointer;">
        ← RETOUR MENU
      </button>
    </div>`;
}

function showMissionBriefing(idx){
  const m = CAMPAIGN_MISSIONS[idx];
  if(!m) return;
  campaignMission = m;

  const crewMembers = m.briefing.crew
    .map(id => CREW.find(c => c.id === id))
    .filter(Boolean);

  const objIcons = { survive:'🛡', boss:'💥', score:'⭐' };

  OVel.style.display = 'flex';
  OVel.innerHTML = `
    <div style="width:100%;max-width:560px;padding:20px;
      box-sizing:border-box;font-family:'VT323','Courier New',monospace;
      color:#fff;overflow-y:auto;max-height:820px;">

      <div style="background:rgba(0,0,0,.6);border:1px solid #cc00ff;
        border-radius:4px;padding:14px;margin-bottom:14px;">
        <div style="font-size:13px;color:#cc00ff;letter-spacing:2px;">
          📍 ${m.briefing.location}
        </div>
        <div style="font-size:20px;color:#ffd87a;letter-spacing:3px;margin-top:6px;
          text-shadow:0 0 10px rgba(255,200,80,.7);">
          MISSION ${m.id < 10 ? '0'+m.id : m.id} — ${m.title}
        </div>
      </div>

      <div style="background:rgba(0,0,0,.5);border:1px solid #333;
        border-radius:4px;padding:12px;margin-bottom:12px;">
        <div style="font-size:12px;color:#ffffff55;letter-spacing:2px;margin-bottom:8px;">
          ÉQUIPAGE PRÉSENT
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          ${crewMembers.map(c => `
            <div style="border:1px solid ${c.col}44;border-radius:3px;
              padding:5px 10px;font-size:14px;color:${c.col};">
              ${c.emoji} ${c.name.split(' ').filter(w=>!['Capitaine','Dr.'].includes(w))[0]}
            </div>`).join('')}
        </div>
      </div>

      <div style="background:rgba(0,0,0,.5);border:1px solid #333;
        border-radius:4px;padding:14px;margin-bottom:12px;line-height:2;">
        ${m.briefing.text.map(line => `
          <div style="font-size:15px;color:#e0e0ff;margin-bottom:4px;">
            ${line.replace(/^([A-ZÀÉÈÊËÎÏÔÙÛÜ\-]+(?:\s[A-ZÀÉÈÊËÎÏÔÙÛÜ\-]+)?) :/,
              '<span style="color:#ff8c00;font-weight:bold;text-shadow:0 0 8px rgba(255,140,0,.7);">$1</span> :')}
          </div>`).join('')}
      </div>

      <div style="background:rgba(255,200,0,.08);border:1px solid #ffd87a44;
        border-radius:4px;padding:12px;margin-bottom:14px;">
        <div style="font-size:12px;color:#ffffff55;letter-spacing:2px;">
          OBJECTIF
        </div>
        <div style="font-size:19px;color:#ffd87a;margin-top:4px;letter-spacing:2px;">
          ${objIcons[m.objectiveType]} ${m.objectiveLabel}
        </div>
      </div>

      <div style="display:flex;gap:10px;">
        <button onclick="showCampaign()" style="
          flex:1;padding:12px;background:transparent;
          color:#9944cc;border:1px solid #660088;border-radius:3px;
          font-family:'VT323','Courier New',monospace;
          font-size:16px;letter-spacing:2px;cursor:pointer;">
          ← MISSIONS
        </button>
        <button onclick="showCampaignDifficulty()" style="
          flex:2;padding:12px;
          background:linear-gradient(180deg,rgba(50,0,60,.9),rgba(15,0,25,.95));
          color:#ffd87a;border:2px solid #ff00cc;border-radius:3px;
          font-family:'VT323','Courier New',monospace;
          font-size:18px;letter-spacing:3px;cursor:pointer;
          box-shadow:0 0 16px rgba(255,0,200,.25);">
          ⚡ CHOISIR DIFFICULTÉ
        </button>
      </div>
    </div>`;
}

function showCampaignDifficulty(){
  OVel.style.display = 'flex';
  OVel.innerHTML = `
    <div style="width:100%;max-width:480px;padding:24px;
      box-sizing:border-box;font-family:'VT323','Courier New',monospace;
      color:#fff;">

      <div style="text-align:center;margin-bottom:24px;">
        <div style="font-size:20px;color:#ffd87a;letter-spacing:4px;">
          ⚡ DIFFICULTÉ
        </div>
        <div style="font-size:14px;color:#ffffff55;margin-top:6px;letter-spacing:1px;">
          ${campaignMission.title}
        </div>
      </div>

      <div style="display:flex;flex-direction:column;gap:12px;margin-bottom:24px;">

        <div onclick="selectCampaignDifficulty('easy')" style="
          padding:18px;cursor:pointer;border-radius:4px;
          background:linear-gradient(180deg,rgba(20,80,20,.9),rgba(10,40,10,.95));
          border:2px solid #4ade80;transition:all .15s;"
          onmouseover="this.style.transform='translateY(-2px)'"
          onmouseout="this.style.transform='translateY(0)'">
          <div style="font-size:18px;color:#4ade80;letter-spacing:4px;">
            ★ FACILE
          </div>
          <div style="font-size:14px;color:#86efac;margin-top:6px;letter-spacing:1px;">
            Ennemis lents · Peu de tirs · Idéal pour découvrir
          </div>
        </div>

        <div onclick="selectCampaignDifficulty('normal')" style="
          padding:18px;cursor:pointer;border-radius:4px;
          background:linear-gradient(180deg,rgba(30,50,100,.9),rgba(15,25,65,.95));
          border:2px solid #60a5fa;transition:all .15s;"
          onmouseover="this.style.transform='translateY(-2px)'"
          onmouseout="this.style.transform='translateY(0)'">
          <div style="font-size:18px;color:#60a5fa;letter-spacing:4px;">
            ★★ NORMAL
          </div>
          <div style="font-size:14px;color:#93c5fd;margin-top:6px;letter-spacing:1px;">
            Équilibré · Progressif · L'expérience recommandée
          </div>
        </div>

        <div onclick="selectCampaignDifficulty('hard')" style="
          padding:18px;cursor:pointer;border-radius:4px;
          background:linear-gradient(180deg,rgba(90,15,15,.9),rgba(50,5,5,.95));
          border:2px solid #f87171;transition:all .15s;"
          onmouseover="this.style.transform='translateY(-2px)'"
          onmouseout="this.style.transform='translateY(0)'">
          <div style="font-size:18px;color:#f87171;letter-spacing:4px;">
            ★★★ DIFFICILE
          </div>
          <div style="font-size:14px;color:#fca5a5;margin-top:6px;letter-spacing:1px;">
            Ennemis rapides · Tirs denses · Pour les pilotes aguerris
          </div>
        </div>

      </div>

      <button onclick="showMissionBriefing(${campaignMission.id - 1})" style="
        width:100%;padding:12px;background:transparent;
        color:#9944cc;border:1px solid #660088;border-radius:3px;
        font-family:'VT323','Courier New',monospace;
        font-size:16px;letter-spacing:2px;cursor:pointer;">
        ← RETOUR BRIEFING
      </button>
    </div>`;
}

function selectCampaignDifficulty(diff){
  campaignDifficulty = diff;
  showCampaignShipSelect();
}

function showCampaignShipSelect(){
  OVel.style.display = 'flex';
  OVel.innerHTML = `
    <div style="width:100%;max-width:480px;padding:20px;
      box-sizing:border-box;font-family:'VT323','Courier New',monospace;
      color:#fff;overflow-y:auto;max-height:820px;">

      <div style="text-align:center;margin-bottom:20px;">
        <div style="font-size:20px;color:#ffd87a;letter-spacing:4px;">
          CHOISIS TON VAISSEAU
        </div>
        <div style="font-size:14px;color:#ffffff55;margin-top:6px;">
          ${campaignMission.title}
        </div>
      </div>

      <div style="display:flex;flex-direction:column;gap:12px;margin-bottom:20px;">
        ${SHIPS.map(ship => `
          <div onclick="selectCampaignShip('${ship.id}')"
            style="background:rgba(25,0,35,.88);border:1px solid #550077;
              border-radius:4px;padding:14px;cursor:pointer;
              transition:all .15s;display:flex;align-items:center;gap:14px;"
            onmouseover="this.style.borderColor='${ship.hue}';this.style.transform='translateY(-2px)'"
            onmouseout="this.style.borderColor='#550077';this.style.transform='translateY(0)'">
            <div style="font-size:32px;">🚀</div>
            <div style="flex:1;">
              <div style="font-size:18px;color:${ship.hue};letter-spacing:3px;">
                ${ship.name}
              </div>
              <div style="font-size:13px;color:#cc88ff;letter-spacing:1px;margin-top:2px;">
                ${ship.class}
              </div>
              <div style="font-size:13px;color:#ffffff88;margin-top:4px;line-height:1.4;">
                ${ship.desc}
              </div>
            </div>
          </div>`).join('')}
      </div>

      <button onclick="showCampaignDifficulty()" style="
        width:100%;padding:12px;background:transparent;
        color:#9944cc;border:1px solid #660088;border-radius:3px;
        font-family:'VT323','Courier New',monospace;
        font-size:16px;letter-spacing:2px;cursor:pointer;">
        ← RETOUR DIFFICULTÉ
      </button>
    </div>`;
}

function selectCampaignShip(shipId){
  chosenShip = SHIPS.find(s => s.id === shipId);
  startCampaignMission();
}

function startCampaignMission(){
  if(!campaignMission) return;

  // Applique la map de la mission
  const campMap = CAMPAIGN_MAPS.find(m => m.id === campaignMission.map);
  if(campMap) chosenMap = campMap;

  // Applique la difficulté choisie par le joueur
  difficulty = campaignDifficulty;

  // Configure les vagues selon l'objectif
  if(campaignMission.objectiveType === 'survive'){
    WORLD_WAVES[difficulty] = [
      campaignMission.objectiveValue,
      campaignMission.objectiveValue,
      campaignMission.objectiveValue,
      campaignMission.objectiveValue,
      campaignMission.objectiveValue,
    ];
  } else {
    WORLD_WAVES[difficulty] = [Infinity, Infinity, Infinity, Infinity, Infinity];
  }

  // Active le mode campagne et lance le jeu
  campaignMode = true;
  startGame();
}

function checkCampaignObjective(){
  if(!campaignMode || !campaignMission || GS !== 'playing') return;
  const m = campaignMission;
  let success = false;

  if(m.objectiveType === 'score'   && score >= m.objectiveValue) success = true;
  if(m.objectiveType === 'survive' && wave >= m.objectiveValue && !boss) success = true;
  if(m.objectiveType === 'boss'    && bDefeated) success = true;

  if(success){
    campaignMode = false; // stoppe la vérification immédiatement
    campaignMissionSuccess();
  }
}

function campaignMissionSuccess(){
  if(!campaignMission) return;
  const m = campaignMission;
  campaignMode = false;
  GS = 'victory';
  cancelAnimationFrame(RAF);
  snd.win&&snd.win();
  playTrack('victory');
  let progress = {unlockedMission: m.id+1, completedMissions:[]};
  try { progress = completeMission(m.id); } catch(e){ console.warn('[CAMPAGNE] save error:', e); }
  startMenuBg();

  OVel.style.display = 'flex';
  OVel.innerHTML = `
    <div style="text-align:center;font-family:'VT323','Courier New',monospace;
      color:#fff;padding:30px;width:100%;max-width:480px;box-sizing:border-box;">

      <div style="font-size:32px;color:#ffd87a;letter-spacing:4px;margin-bottom:10px;
        text-shadow:0 0 20px rgba(255,200,80,.9);">
        ✅ MISSION ACCOMPLIE
      </div>

      <div style="font-size:18px;color:#22c55e;letter-spacing:2px;margin-bottom:20px;">
        ${m.title}
      </div>

      <div style="font-size:14px;color:#ffffff55;margin-bottom:6px;">
        SCORE FINAL
      </div>
      <div style="font-size:40px;color:#ffd87a;margin-bottom:20px;">
        ${score.toLocaleString()}
      </div>

      ${m.id < 15 ? `
        <div style="font-size:15px;color:#00e5ff;letter-spacing:2px;margin-bottom:24px;">
          ⚡ MISSION ${m.id + 1} DÉBLOQUÉE !
        </div>` : `
        <div style="font-size:20px;color:#ffd87a;letter-spacing:3px;margin-bottom:24px;
          text-shadow:0 0 12px rgba(255,200,80,.8);">
          🏆 CAMPAGNE TERMINÉE !<br>
          <span style="font-size:15px;color:#22c55e;">Veltara est sauvée !</span>
        </div>`}

      <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">
        <button onclick="showMissionBriefing(${m.id - 1})" style="
          padding:12px 20px;background:transparent;color:#9944cc;
          border:1px solid #660088;border-radius:3px;
          font-family:'VT323','Courier New',monospace;
          font-size:16px;letter-spacing:2px;cursor:pointer;">
          🔄 REJOUER
        </button>
        ${m.id < 15 ? `
        <button onclick="showMissionBriefing(${m.id})" style="
          padding:12px 20px;
          background:linear-gradient(180deg,rgba(50,0,60,.9),rgba(15,0,25,.95));
          color:#ffd87a;border:2px solid #ff00cc;border-radius:3px;
          font-family:'VT323','Courier New',monospace;
          font-size:16px;letter-spacing:2px;cursor:pointer;
          box-shadow:0 0 16px rgba(255,0,200,.25);">
          ⚡ MISSION SUIVANTE
        </button>` : ''}
        <button onclick="showCampaign()" style="
          padding:12px 20px;background:transparent;color:#00e5ff;
          border:1px solid #0099cc;border-radius:3px;
          font-family:'VT323','Courier New',monospace;
          font-size:16px;letter-spacing:2px;cursor:pointer;">
          📋 MISSIONS
        </button>
      </div>
    </div>`;
}

// ── MULTIPLAYER FUNCTIONS ──────────────────────────────────────────
function initMultiplayer(onId,peerId){
  if(mpPeer){try{mpPeer.destroy();}catch(e){}}
  mpPeer=new Peer(peerId||undefined,{debug:0});
  mpPeer.on('open',id=>{mpRoomCode=id;if(onId)onId(id);});
  mpPeer.on('error',e=>{console.warn('PeerJS:',e);});
}
function setupMPConn(conn){
  mpConn=conn;
  conn.on('open',()=>{
    try{conn.send({type:'ready'});}catch(e){}
    showMPWaiting(mpHosted);
  });
  conn.on('data',d=>{
    if(d.type==='ready'){showMPWaiting(mpHosted);}
    if(d.type==='start'){mpMode=true;startMPGame();}
    if(d.type==='score'){mpOpponentScore=d.score;mpOpponentWave=d.wave;}
    if(d.type==='gameover'){mpOpponentAlive=false;checkMPVictory();}
  });
  conn.on('close',()=>{if(GS==='playing'&&mpMode){mpOpponentAlive=false;checkMPVictory();}});
}
function mpSendScore(){
  if(mpConn&&mpConn.open)try{mpConn.send({type:'score',score,wave});}catch(e){}
}
function mpSendGameOver(){
  if(mpConn&&mpConn.open)try{mpConn.send({type:'gameover',score,wave});}catch(e){}
}
function checkMPVictory(){
  if(!mpOpponentAlive&&GS==='playing')showMPVictory();
}
function startMPGame(){
  mpOpponentScore=0;mpOpponentWave=0;mpOpponentAlive=true;
  startGame();
}
function showMPMenu(){
  OVel.innerHTML=`
    <div class="pick-title">⚔ MULTIJOUEUR</div>
    <div class="pick-sub">— PeerJS · Chacun chez soi —</div>
    <div style="height:16px;"></div>
    <div class="btn-row">
      <button class="sb" id="bmpCreate">📡 CRÉER UNE PARTIE</button>
      <button class="sb alt" id="bmpJoin">🔗 REJOINDRE</button>
      <button class="sb back" id="bmpBack">← RETOUR</button>
    </div>`;
  OVel.style.display='flex';
  document.getElementById('bmpCreate').onclick=()=>showMPCreate();
  document.getElementById('bmpJoin').onclick=()=>showMPJoin();
  document.getElementById('bmpBack').onclick=()=>showMenu();
}
function showMPCreate(){
  mpHosted=true;
  const code=Math.floor(100000+Math.random()*900000).toString();
  OVel.innerHTML=`
    <div class="pick-title">📡 CRÉER</div>
    <div class="pick-sub">— Dicte ce code à ton adversaire —</div>
    <div style="height:12px;"></div>
    <div style="font-family:'Courier New',monospace;font-size:10px;color:#7a98c4;letter-spacing:3px;margin-bottom:6px;">TON CODE DE SALLE</div>
    <div id="mpCode" style="font-family:'Courier New',monospace;font-weight:900;font-size:38px;color:#ffd87a;letter-spacing:10px;padding:10px 20px;border:1px solid #5b8acc;border-radius:2px;margin-bottom:10px;background:rgba(15,28,55,.85);text-align:center;">${code}</div>
    <div id="mpStatus" style="font-size:10px;color:#5b8acc;letter-spacing:2px;margin-bottom:14px;">⏳ Enregistrement en cours…</div>
    <button class="sb back" id="bmpBack2">← RETOUR</button>`;
  OVel.style.display='flex';
  document.getElementById('bmpBack2').onclick=()=>{if(mpPeer)try{mpPeer.destroy();}catch(e){}mpPeer=null;mpConn=null;showMPMenu();};
  initMultiplayer(()=>{
    const s=document.getElementById('mpStatus');
    if(s)s.textContent='⏳ En attente d\'un adversaire…';
  },code);
  mpPeer.on('connection',conn=>{setupMPConn(conn);});
}
function showMPJoin(){
  mpHosted=false;
  OVel.innerHTML=`
    <div class="pick-title">🔗 REJOINDRE</div>
    <div class="pick-sub">— Code de l'hôte —</div>
    <div style="height:14px;"></div>
    <input id="mpCodeIn" type="tel" maxlength="6" pattern="[0-9]*" placeholder="_ _ _ _ _ _"
      style="font-family:'Courier New',monospace;font-weight:900;font-size:32px;letter-spacing:10px;color:#ffd87a;background:rgba(15,28,55,.85);border:1px solid #5b8acc;border-radius:2px;padding:10px 14px;text-align:center;width:260px;outline:none;margin-bottom:12px;"/>
    <div class="btn-row">
      <button class="sb" id="bmpConnect">⚡ CONNECTER</button>
      <button class="sb back" id="bmpBack3">← RETOUR</button>
    </div>`;
  OVel.style.display='flex';
  const inp=document.getElementById('mpCodeIn');inp.focus();
  const doJoin=()=>joinMP(inp.value.trim());
  document.getElementById('bmpConnect').onclick=doJoin;
  inp.addEventListener('keydown',e=>{if(e.key==='Enter')doJoin();});
  document.getElementById('bmpBack3').onclick=()=>showMPMenu();
}
function joinMP(code){
  if(!code)return;
  OVel.innerHTML=`<div style="font-family:'Courier New',monospace;color:#7af;font-size:13px;letter-spacing:3px;padding:30px;">⏳ CONNEXION EN COURS…</div>`;
  initMultiplayer(()=>{
    const conn=mpPeer.connect(code,{reliable:true});
    setupMPConn(conn);
    conn.on('error',e=>{
      OVel.innerHTML=`<div style="color:#f66;font-family:'Courier New',monospace;font-size:13px;letter-spacing:2px;text-align:center;padding:30px;">❌ ÉCHEC DE CONNEXION<br><small style="font-size:10px;color:#888;">${e}</small></div>`;
      setTimeout(()=>showMPJoin(),2500);
    });
  });
}
function showMPWaiting(isHost){
  OVel.innerHTML=`
    <div class="pick-title" style="color:#44ff88;">✓ CONNECTÉ !</div>
    <div class="pick-sub">— Adversaire prêt —</div>
    <div style="height:14px;"></div>
    <div style="font-family:'Courier New',monospace;font-size:10px;color:#7a98c4;letter-spacing:3px;margin-bottom:14px;">${isHost?'VOUS ÊTES HÔTE':'VOUS ÊTES INVITÉ'} · MODE P2P</div>
    <button class="sb" id="bmpStart">⚔ LANCER LA BATAILLE</button>
    <button class="sb back" id="bmpBack4" style="margin-top:8px;">← ANNULER</button>`;
  OVel.style.display='flex';
  document.getElementById('bmpStart').onclick=()=>{
    mpMode=true;
    if(mpConn&&mpConn.open)try{mpConn.send({type:'start'});}catch(e){}
    startMPGame();
  };
  document.getElementById('bmpBack4').onclick=()=>{
    mpMode=false;
    if(mpPeer)try{mpPeer.destroy();}catch(e){}
    mpPeer=null;mpConn=null;showMenu();
  };
}
function showMPVictory(){
  const fs=score,fw=wave,os=mpOpponentScore,ow=mpOpponentWave;
  GS='victory';cancelAnimationFrame(RAF);stopMusic();snd.win&&snd.win();
  OVel.innerHTML=`
    <div class="scan"></div>
    <div class="title" style="font-size:42px;color:#ffd87a;animation:titleGlow 2s ease-in-out infinite;">VICTOIRE !</div>
    <div class="subtitle" style="color:#44ff88;letter-spacing:6px;">ADVERSAIRE VAINCU</div>
    <div style="height:12px;"></div>
    <div style="display:flex;gap:32px;justify-content:center;align-items:flex-end;margin-bottom:10px;">
      <div style="text-align:center;">
        <div style="font-family:'Courier New',monospace;font-size:9px;color:#7a98c4;letter-spacing:2px;margin-bottom:4px;">VOUS</div>
        <div style="font-family:'Courier New',monospace;font-size:28px;color:#ffd87a;font-weight:700;">${fs.toLocaleString()}</div>
        <div style="font-size:9px;color:#9ec3ff;letter-spacing:2px;">VAGUE ${fw}</div>
      </div>
      <div style="font-family:'Courier New',monospace;font-size:20px;color:#5b8acc;align-self:center;">VS</div>
      <div style="text-align:center;opacity:.65;">
        <div style="font-family:'Courier New',monospace;font-size:9px;color:#7a98c4;letter-spacing:2px;margin-bottom:4px;">ADVERSAIRE</div>
        <div style="font-family:'Courier New',monospace;font-size:28px;color:#ff6868;font-weight:700;">${os.toLocaleString()}</div>
        <div style="font-size:9px;color:#9ec3ff;letter-spacing:2px;">VAGUE ${ow}</div>
      </div>
    </div>
    <div style="display:flex;gap:8px;margin-top:8px;">
      <button class="sb" id="bmpReplay">↻ REJOUER</button>
      <button class="sb alt" id="bmpMn">← MENU</button>
    </div>`;
  OVel.style.display='flex';startMenuBg();
  document.getElementById('bmpReplay').onclick=()=>{mpMode=false;if(mpPeer)try{mpPeer.destroy();}catch(e){}mpPeer=null;mpConn=null;showMPMenu();};
  document.getElementById('bmpMn').onclick=()=>{mpMode=false;if(mpPeer)try{mpPeer.destroy();}catch(e){}mpPeer=null;mpConn=null;showMenu();};
}

async function showScores(diffIdx){
  if(diffIdx===undefined)diffIdx=0;
  const DIFFS=[
    {key:'easy',   label:'FACILE',    stars:'★',   col:'#4ade80'},
    {key:'normal', label:'NORMAL',    stars:'★★',  col:'#60a5fa'},
    {key:'hard',   label:'DIFFICILE', stars:'★★★', col:'#f87171'},
    {key:null,     label:'ANCIENS',   stars:'📜',  col:'#e2a84b'},
  ];
  const cur=DIFFS[diffIdx];

  const renderShell=(bodyHtml)=>{
    const tabs=DIFFS.map((d,i)=>{
      const active=i===diffIdx;
      return `<button onclick="showScores(${i})" style="
        font-family:'VT323','Courier New',monospace;font-size:14px;letter-spacing:1px;
        padding:7px 14px;border-radius:3px 3px 0 0;cursor:pointer;white-space:nowrap;
        border:1px solid ${active?d.col:'#440055'};border-bottom:${active?'1px solid #0a001a':'1px solid #440055'};
        background:${active?'rgba(40,0,55,.95)':'rgba(15,0,22,.7)'};
        color:${active?d.col:'#9944cc'};
        ${active?`text-shadow:0 0 8px ${d.col}66;margin-bottom:-1px;position:relative;z-index:2;`:''}
        transition:all .12s;">
        ${d.stars} ${d.label}
      </button>`;
    }).join('');
    return `
      <div class="pick-title" style="font-size:15px;margin-bottom:6px;">⟡ MEILLEURS SCORES ⟡</div>
      <div style="font-family:'VT323',monospace;font-size:13px;letter-spacing:3px;color:${sb?'#00e5ff':'#9944cc'};margin-bottom:10px;">
        ${sb?'🌐 TOP 15 MONDIAL':'💾 SCORES LOCAUX'}
      </div>
      <div style="display:flex;gap:3px;justify-content:center;width:520px;padding-bottom:0;border-bottom:1px solid #440055;margin-bottom:0;">
        ${tabs}
      </div>
      <div style="width:520px;background:rgba(8,0,18,.92);border:1px solid #440055;border-top:none;border-radius:0 0 4px 4px;min-height:280px;display:flex;flex-direction:column;">
        <div id="sc-body" style="padding:8px;flex:1;">${bodyHtml}</div>
      </div>
      <button class="sb back" id="bbk" style="margin-top:12px;">← RETOUR</button>`;
  };

  OVel.innerHTML=renderShell(`<div style="color:#9944cc;font-family:'Courier New',monospace;font-size:12px;letter-spacing:4px;padding:40px;text-align:center;">⟳ CHARGEMENT…</div>`);
  OVel.style.display='flex';
  document.getElementById('bbk').onclick=()=>showMenu();

  // Onglet ANCIENS : tous les scores sans filtre de difficulte
  const sc=cur.key===null ? await loadAllScores() : await loadScores(cur.key);
  const medal=['🥇','🥈','🥉'];

  // Raccourcit le nom de map pour gagner de la place
  const shortMap=m=>(m||'').replace('SYSTEME SOLAIRE','SOLAIRE').replace('ARALIS DUNES','ARALIS').replace('KRYNOS FROSTBELT','KRYNOS').replace('PYRON CRADLE','PYRON').replace('NYXAR VEIL','NYXAR');

  const rows=sc.length===0
    ?`<tr><td colspan="6" style="color:#444;padding:28px;text-align:center;letter-spacing:2px;font-size:12px;font-family:'Courier New',monospace;">— Aucune entrée ${cur.key===null?'disponible':('en '+cur.label)} —</td></tr>`
    :sc.map((s,i)=>{
      const rank=medal[i]||`<span style="color:#9944cc;">${String(i+1).padStart(2,'0')}</span>`;
      const bg=i===0?'rgba(255,200,50,.06)':i===1?'rgba(180,180,180,.04)':i===2?'rgba(180,100,30,.05)':'';
      return `<tr style="border-bottom:1px solid rgba(80,0,120,.25);background:${bg};">
        <td style="text-align:center;padding:5px 3px;font-size:13px;width:30px;">${rank}</td>
        <td style="color:#ffe8a0;padding:5px 5px;font-family:'VT323',monospace;font-size:17px;letter-spacing:2px;">${(s.pseudo||'—').toUpperCase().slice(0,10)}</td>
        <td style="color:#00e5ff;text-align:right;padding:5px 5px;font-family:'Courier New',monospace;font-size:11px;font-weight:bold;">${Number(s.score).toLocaleString()}</td>
        <td style="color:#cc88ff;text-align:center;padding:5px 3px;font-size:11px;white-space:nowrap;">V${s.wave}</td>
        <td style="color:#9944cc;text-align:center;padding:5px 3px;font-size:10px;white-space:nowrap;letter-spacing:1px;">${shortMap(s.map)||'—'}</td>
        <td style="color:#445566;text-align:center;font-size:10px;padding:5px 3px;white-space:nowrap;">${s.date||''}</td>
      </tr>`;
    }).join('');

  const table=`
    <table style="border-collapse:collapse;width:100%;font-family:'Courier New',monospace;font-size:11px;">
      <thead><tr style="border-bottom:1px solid #330044;">
        <th style="color:#550077;padding:4px 3px;font-size:9px;letter-spacing:2px;width:30px;">#</th>
        <th style="color:#550077;text-align:left;padding:4px 5px;font-size:9px;letter-spacing:2px;">PILOTE</th>
        <th style="color:#550077;text-align:right;padding:4px 5px;font-size:9px;letter-spacing:2px;">SCORE</th>
        <th style="color:#550077;padding:4px 3px;font-size:9px;letter-spacing:2px;">VAGUE</th>
        <th style="color:#550077;padding:4px 3px;font-size:9px;letter-spacing:2px;">MAP</th>
        <th style="color:#550077;padding:4px 3px;font-size:9px;letter-spacing:2px;">DATE</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>`;

  OVel.innerHTML=renderShell(table);
  document.getElementById('bbk').onclick=()=>showMenu();
}

// ── SHIP SELECTION ─────────────────────────────────────────────────
function shipThumb(s){
  const p=s.palette;
  return `<svg viewBox="-50 -42 100 84" width="100%" height="100%">
    <defs><radialGradient id="g_${s.id}" cx="50%" cy="40%" r="60%"><stop offset="0%" stop-color="${p.hullHi}"/><stop offset="60%" stop-color="${p.hull}"/><stop offset="100%" stop-color="${p.hullDk}"/></radialGradient></defs>
    <ellipse cx="0" cy="6" rx="46" ry="14" fill="${p.hue||p.accent}" opacity=".08"/>
    <!-- wings -->
    <path d="M -14 4 L -34 24 L -36 30 L -18 25 L -13 12 Z" fill="${p.wing}" opacity=".95"/>
    <path d="M 14 4 L 34 24 L 36 30 L 18 25 L 13 12 Z" fill="${p.wing}" opacity=".95"/>
    <path d="M -14 11 L -28 24 L -19 21 L -13 12 Z" fill="${p.hullDk}"/>
    <path d="M 14 11 L 28 24 L 19 21 L 13 12 Z" fill="${p.hullDk}"/>
    <!-- hull -->
    <path d="M 0 -32 L 14 -14 L 16 13 L 12 27 L -12 27 L -16 13 L -14 -14 Z" fill="url(#g_${s.id})"/>
    <path d="M 0 -32 L 7 -14 L 8 13 L 0 9 L -8 13 L -7 -14 Z" fill="${p.wingHi}" opacity=".75"/>
    <!-- cockpit -->
    <ellipse cx="0" cy="-9" rx="6" ry="11" fill="${p.cock}"/>
    <ellipse cx="0" cy="-10" rx="4" ry="8" fill="${p.cockHi}"/>
    <!-- accent stripe -->
    <rect x="-1" y="-4" width="2" height="14" fill="${p.accent}" opacity=".9"/>
    <!-- engine glow -->
    <ellipse cx="0" cy="30" rx="8" ry="3" fill="${p.accent}" opacity=".5"/>
  </svg>`;
}
function statBars(stats,shipKey){
  const map={VIT:'Vitesse',BLI:'Blindage',FEU:'Cadence'};
  const pw=shipKey?(POWER_LABELS[shipKey]||null):null;
  return Object.entries(stats).map(([k,v])=>{
    const b=Array.from({length:5},(_,i)=>i<v?'<span style="color:#ffd87a;">▰</span>':'<span style="color:#3a4a6a;">▱</span>').join('');
    return `<span class="stat" title="${map[k]}"><b>${k}</b> ${b}</span>`;
  }).join('');
}
const POWER_LABELS={
  raptor:  {name:'SUPERNOVA DASH', nameHtml:'SUPERNOVA<br>DASH',  col:'#22d3ee'},
  sentinel:{name:'STORM LOCK',     nameHtml:'STORM LOCK',         col:'#9d4dff'},
  titan:   {name:'RICOCHET FURY',  nameHtml:'RICOCHET<br>FURY',   col:'#ff6b00'},
};
function showShipPick(){
  GS='menu';
  let selIdx=SHIPS.findIndex(s=>s.id===chosenShip.id);if(selIdx<0)selIdx=1;
  const cards=SHIPS.map((s,i)=>`
    <div class="card${i===selIdx?' sel':''}" data-idx="${i}" style="overflow:hidden;word-break:break-word;max-width:100%;">
      <div class="thumb" style="background:radial-gradient(ellipse at 50% 60%,rgba(${parseInt(s.hue.slice(1,3),16)},${parseInt(s.hue.slice(3,5),16)},${parseInt(s.hue.slice(5,7),16)},.18) 0%,rgba(0,0,8,.6) 100%);">${shipThumb(s)}</div>
      <div class="card-name">${s.name}</div>
      <div style="font-size:9px;color:${s.hue};letter-spacing:2px;text-transform:uppercase;margin-top:3px;">${s.class}</div>
      <div style="color:#ff6868;font-size:13px;letter-spacing:4px;margin-top:5px;text-shadow:0 0 6px rgba(255,80,80,.5);">${'♥'.repeat(s.lives)}</div>
      <div class="card-desc">${(()=>{const p=s.desc.split(' | ');return p[0];})()}</div>
      ${(()=>{const p=s.desc.split(' | ');return p[1]?`<div style="margin-top:8px;font-family:'Courier New',monospace;font-size:10px;color:${s.hue};letter-spacing:2px;text-shadow:0 0 8px ${s.hue},0 0 16px ${s.hue}88;word-break:break-word;white-space:normal;line-height:1.6;">${p[1]}</div>`:'';})()}
    </div>`);
  OVel.innerHTML=`
    <div class="pick-title">Choisis ton vaisseau, Camarade !</div>
    <div class="pick-sub">5 secteurs — Bonne chance, pilote.</div>
    <div style="height:10px;"></div>
    <div id="ship-grid" style="width:420px;">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">${cards[0]}${cards[1]}</div>
      <div style="display:flex;justify-content:center;margin-top:10px;"><div style="width:calc(50% - 5px);">${cards[2]}</div></div>
    </div>
    <div style="display:flex;flex-direction:column;align-items:center;gap:12px;margin-top:18px;width:100%;">
      <button id="bnx" style="width:80%;padding:14px;font-family:'Courier New',monospace;font-size:13px;letter-spacing:2px;cursor:pointer;background:linear-gradient(#ff6b00,#cc4400);color:#fff;border:none;border-radius:8px;box-shadow:0 4px 15px rgba(255,107,0,0.4);">⚡ LANCEMENT</button>
      <button id="bbk" style="width:80%;padding:12px;font-family:'Courier New',monospace;font-size:11px;letter-spacing:2px;cursor:pointer;background:transparent;color:#4fc3f7;border:2px solid #4fc3f7;border-radius:8px;">← MENU</button>
    </div>`;
  const grid=document.getElementById('ship-grid');
  grid.querySelectorAll('.card').forEach(c=>{
    c.onclick=()=>{
      grid.querySelectorAll('.card').forEach(x=>x.classList.remove('sel'));
      c.classList.add('sel');
      selIdx=parseInt(c.dataset.idx);chosenShip=SHIPS[selIdx];snd.sel&&snd.sel();
    };
  });
  document.getElementById('bbk').onclick=()=>showMenu();
  document.getElementById('bnx').onclick=()=>{chosenShip=SHIPS[selIdx];snd.sel&&snd.sel();showDifficultySelect();};
}


// ── DIFFICULTY SELECTION ───────────────────────────────────────────
function showDifficultySelect(){
  GS='menu';
  OVel.style.display='flex';
  OVel.innerHTML=`
    <div class="scan"></div>
    <div style="display:flex;flex-direction:column;align-items:center;gap:16px;padding:20px;width:100%;max-width:460px;">
      <div style="font-family:'Courier New',monospace;font-size:28px;color:#ffd87a;letter-spacing:6px;text-align:center;margin-bottom:8px;text-shadow:0 0 18px rgba(255,210,80,.4);">DIFFICULTÉ</div>

      <div onclick="selectDiff('easy')" class="diff-card" style="width:100%;padding:18px;cursor:pointer;border-radius:6px;background:linear-gradient(180deg,rgba(20,80,20,.9),rgba(10,40,10,.95));border:2px solid #4ade80;text-align:center;transition:all .15s;">
        <div style="font-family:'Courier New',monospace;font-size:15px;color:#4ade80;letter-spacing:4px;margin-bottom:8px;">★ FACILE</div>
        <div style="font-family:'Courier New',monospace;font-size:11px;color:#86efac;letter-spacing:1px;line-height:1.8;">Ennemis lents · Peu de tirs · Idéal pour découvrir</div>
      </div>

      <div onclick="selectDiff('normal')" class="diff-card" style="width:100%;padding:18px;cursor:pointer;border-radius:6px;background:linear-gradient(180deg,rgba(30,50,100,.9),rgba(15,25,65,.95));border:2px solid #60a5fa;text-align:center;transition:all .15s;">
        <div style="font-family:'Courier New',monospace;font-size:15px;color:#60a5fa;letter-spacing:4px;margin-bottom:8px;">★★ NORMAL</div>
        <div style="font-family:'Courier New',monospace;font-size:11px;color:#93c5fd;letter-spacing:1px;line-height:1.8;">Équilibré · Progressif · L'expérience recommandée</div>
      </div>

      <div onclick="selectDiff('hard')" class="diff-card" style="width:100%;padding:18px;cursor:pointer;border-radius:6px;background:linear-gradient(180deg,rgba(90,15,15,.9),rgba(50,5,5,.95));border:2px solid #f87171;text-align:center;transition:all .15s;">
        <div style="font-family:'Courier New',monospace;font-size:15px;color:#f87171;letter-spacing:4px;margin-bottom:8px;">★★★ DIFFICILE</div>
        <div style="font-family:'Courier New',monospace;font-size:11px;color:#fca5a5;letter-spacing:1px;line-height:1.8;">Ennemis rapides · Tirs denses · Pour les pilotes aguerris</div>
      </div>

      <div onclick="showGamepadControls()" style="width:100%;padding:16px;cursor:pointer;border-radius:6px;background:linear-gradient(180deg,rgba(30,30,60,.9),rgba(15,15,40,.95));border:2px solid #ffffff33;text-align:center;transition:all .15s;">
        <div style="font-family:'Courier New',monospace;font-size:15px;color:#ffffff88;letter-spacing:4px;margin-bottom:6px;">🎮 COMMANDES MANETTE</div>
        <div style="font-family:'Courier New',monospace;font-size:11px;color:#ffffff44;letter-spacing:1px;">Voir les contrôles Xbox / PlayStation</div>
      </div>

      <button onclick="showShipPick()" style="margin-top:4px;background:transparent;color:#7a98c4;border:1px solid #3d5a8a;border-radius:4px;padding:10px 24px;font-family:'Courier New',monospace;font-size:11px;letter-spacing:2px;cursor:pointer;">← VAISSEAU</button>
    </div>`;
}
function selectDiff(d){
  difficulty=d;
  snd.sel&&snd.sel();
  showMapPick();
}
function showGamepadControls(){
  OVel.style.display='flex';
  OVel.innerHTML=`
    <div style="background:#0a0218;border:2px solid #ffffff33;border-radius:16px;
      padding:28px;max-width:420px;width:90%;color:#fff;font-family:'Courier New',monospace;
      text-align:center;">
      <div style="font-size:18px;color:#fff;letter-spacing:4px;margin-bottom:20px;">🎮 COMMANDES MANETTE</div>
      <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:24px;">
        <div style="display:flex;justify-content:space-between;align-items:center;background:rgba(255,255,255,.06);border-radius:8px;padding:12px 16px;">
          <span style="font-size:13px;color:#ffffff88;letter-spacing:2px;">DÉPLACEMENT</span>
          <span style="font-size:13px;color:#ffd87a;letter-spacing:1px;">🕹 STICK GAUCHE</span>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;background:rgba(255,255,255,.06);border-radius:8px;padding:12px 16px;">
          <span style="font-size:13px;color:#ffffff88;letter-spacing:2px;">TIR</span>
          <span style="font-size:13px;color:#ffd87a;letter-spacing:1px;">🔫 GÂCHETTE RT</span>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;background:rgba(255,255,255,.06);border-radius:8px;padding:12px 16px;">
          <span style="font-size:13px;color:#ffffff88;letter-spacing:2px;">PAUSE</span>
          <span style="font-size:13px;color:#ffd87a;letter-spacing:1px;">⏸ START / MENU</span>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;background:rgba(255,255,255,.06);border-radius:8px;padding:12px 16px;">
          <span style="font-size:13px;color:#ffffff88;letter-spacing:2px;">VALIDER</span>
          <span style="font-size:13px;color:#ffd87a;letter-spacing:1px;">🔘 BOUTON A</span>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;background:rgba(255,255,255,.06);border-radius:8px;padding:12px 16px;">
          <span style="font-size:13px;color:#ffffff88;letter-spacing:2px;">NAVIGATION MENUS</span>
          <span style="font-size:13px;color:#ffd87a;letter-spacing:1px;">✚ CROIX DIR.</span>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;background:rgba(255,255,255,.06);border-radius:8px;padding:12px 16px;">
          <span style="font-size:13px;color:#ffffff88;letter-spacing:2px;">POUVOIR</span>
          <span style="font-size:13px;color:#4ade80;letter-spacing:1px;">⚡ AUTOMATIQUE</span>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;background:rgba(255,255,255,.06);border-radius:8px;padding:12px 16px;">
          <span style="font-size:13px;color:#ffffff88;letter-spacing:2px;">TIR (MOBILE)</span>
          <span style="font-size:13px;color:#4ade80;letter-spacing:1px;">⚡ AUTOMATIQUE</span>
        </div>
      </div>
      <div style="font-size:10px;color:#ffffff33;letter-spacing:1px;margin-bottom:16px;">Compatible Xbox · PlayStation · Manettes génériques</div>
      <button onclick="showDifficultySelect()" style="width:100%;padding:12px;background:transparent;color:#ffffff55;border:1px solid #ffffff22;border-radius:8px;font-family:'Courier New',monospace;font-size:11px;letter-spacing:2px;cursor:pointer;">← RETOUR</button>
    </div>`;
}

// ── MAP SELECTION ──────────────────────────────────────────────────
function mapThumb(m){
  const sky=`linear-gradient(180deg,${m.sky[0]} 0%,${m.sky[1]} 50%,${m.sky[2]} 100%)`;
  let extra='';
  if(m.id==='verge')extra=`<circle cx="60" cy="32" r="10" fill="#3a6abc"/><circle cx="58" cy="30" r="4" fill="#5a8acc" opacity=".7"/><circle cx="22" cy="55" r="5" fill="#bb4422"/><circle cx="40" cy="14" r="2.5" fill="#cccccc"/>`;
  else if(m.id==='aralis')extra=`<circle cx="22" cy="14" r="6" fill="#ffd88a"/><circle cx="32" cy="22" r="4" fill="#ff9a6a" opacity=".85"/><ellipse cx="50" cy="78" rx="50" ry="22" fill="#c8853a"/>`;
  else if(m.id==='krynos')extra=`<circle cx="50" cy="-2" r="32" fill="#7ab4d8"/><ellipse cx="50" cy="-2" rx="40" ry="6" fill="rgba(220,235,255,.55)"/><circle cx="22" cy="55" r="3" fill="#bcd4e8"/><circle cx="78" cy="40" r="2" fill="#fff"/>`;
  else if(m.id==='pyron')extra=`<ellipse cx="50" cy="78" rx="60" ry="34" fill="#aa2a08"/><ellipse cx="50" cy="78" rx="50" ry="28" fill="#ff5a18" opacity=".6"/><circle cx="38" cy="60" r="1.5" fill="#ffaa44"/><circle cx="62" cy="55" r="1" fill="#ff7722"/>`;
  else if(m.id==='nyxar')extra=`<rect x="0" y="0" width="100" height="80" fill="rgba(120,40,200,.35)"/><circle cx="72" cy="22" r="9" fill="#7a3abf"/><circle cx="22" cy="58" r="6" fill="#bb40a0"/><circle cx="50" cy="32" r="1" fill="#fff"/><circle cx="38" cy="18" r="1" fill="#fff"/>`;
  return `<svg viewBox="0 0 100 80" width="100%" height="100%" preserveAspectRatio="none" style="background:${sky}">${extra}</svg>`;
}
function showMapPick(){
  GS='menu';
  let selIdx=MAPS.findIndex(m=>m.id===chosenMap.id);if(selIdx<0)selIdx=0;
  const cards=MAPS.map((m,i)=>`
    <div class="card${i===selIdx?' sel':''}" data-idx="${i}" style="padding:14px;min-height:160px;display:flex;flex-direction:column;justify-content:space-between;">
      <div class="thumb" style="height:86px;">${mapThumb(m)}</div>
      <div class="card-name" style="font-size:13px;margin-top:10px;">${m.name}</div>
      <div style="font-size:10px;color:#9ec3ff;letter-spacing:2px;text-transform:uppercase;margin-top:5px;">${m.tag}</div>
      <div class="card-desc" style="font-size:10px;line-height:1.5;margin-top:8px;overflow:hidden;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;">${m.desc}</div>
    </div>`).join('');
  OVel.innerHTML=`
    <div style="width:100%;max-width:540px;box-sizing:border-box;padding:10px 8px;overflow-y:auto;overflow-x:hidden;display:flex;flex-direction:column;align-items:center;gap:8px;">
    <div class="pick-title">CAP SUR…</div>
    <div class="pick-sub" style="margin-bottom:4px;">Étape 3 / 3</div>
    <div class="grid g5" id="map-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:10px;width:100%;box-sizing:border-box;padding:0 8px;">${cards}</div>
    <div style="display:flex;gap:14px;margin-top:14px;">
      <button class="sb back" id="bbk" style="padding:12px 28px;">← VAISSEAU</button>
      <button class="sb" id="blz" style="padding:12px 36px;">⚡ LANCEMENT</button>
    </div>
    </div>`;
  const grid=document.getElementById('map-grid');
  grid.querySelectorAll('.card').forEach(c=>{
    c.onclick=()=>{
      grid.querySelectorAll('.card').forEach(x=>x.classList.remove('sel'));
      c.classList.add('sel');
      selIdx=parseInt(c.dataset.idx);chosenMap=MAPS[selIdx];snd.sel&&snd.sel();
    };
  });
  document.getElementById('bbk').onclick=()=>showShipPick();
  document.getElementById('blz').onclick=()=>{chosenMap=MAPS[selIdx];startGame();};
}

// ── BACKGROUND (per map) ───────────────────────────────────────────
function initBg(){
  const m=chosenMap;
  planets=(m.planets||[]).map(p=>({...p}));
  bholes=(m.bholes||[]).map(b=>({...b}));
  comets=[];particlesBg=[];bgScrollY=0;
  m._bp=m.bigPlanet?{...m.bigPlanet}:null;
  m._suns=m.suns?m.suns.map(s=>({...s})):null;
}
function drawPlanet(p){
  ctx.save();

  // Lueur atmosphérique externe
  const glow=ctx.createRadialGradient(p.x,p.y,p.r*.8,p.x,p.y,p.r*1.4);
  glow.addColorStop(0,p.base+'40');glow.addColorStop(1,p.base+'00');
  ctx.beginPath();ctx.arc(p.x,p.y,p.r*1.4,0,Math.PI*2);ctx.fillStyle=glow;ctx.fill();

  // Corps principal avec gradient radial 3D
  const grad=ctx.createRadialGradient(p.x-p.r*.3,p.y-p.r*.3,p.r*.05,p.x,p.y,p.r);
  grad.addColorStop(0,p.hi);grad.addColorStop(.5,p.base);grad.addColorStop(1,p.sh);
  ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fillStyle=grad;ctx.fill();

  // Bandes horizontales (si bands:true)
  if(p.bands){
    ctx.globalAlpha=.28;
    for(let i=-3;i<=3;i++){
      const by=p.y+i*(p.r/3.5),bh=p.r/5;
      const bw=Math.sqrt(Math.max(0,p.r*p.r-(by-p.y)*(by-p.y)));
      if(bw<2)continue;
      ctx.beginPath();ctx.ellipse(p.x,by,bw,bh*.4,0,0,Math.PI*2);
      ctx.fillStyle=p.bandCol||p.base+'66';ctx.fill();
    }
    ctx.globalAlpha=1;
  }

  // Calotte polaire (si icecap:true)
  if(p.icecap){
    const capW=Math.sqrt(Math.max(0,p.r*p.r-(p.r*.75)*(p.r*.75)));
    ctx.beginPath();ctx.ellipse(p.x,p.y-p.r*.75,capW,p.r*.18,0,0,Math.PI*2);
    ctx.fillStyle='#e8f8ff';ctx.globalAlpha=.65;ctx.fill();ctx.globalAlpha=1;
  }

  // Crevasses incandescentes (si cracks:true)
  if(p.cracks){
    const cr=[[-0.3,-0.4,0.1,0.2],[0.1,-0.3,0.3,0.1],[-0.2,0.1,-0.1,0.4],[0.2,-0.2,0.4,0.3],[-0.4,0.2,-0.2,0.4],[0.0,-0.5,0.2,-0.2]];
    cr.forEach(([x1,y1,x2,y2])=>{
      const ax=p.x+x1*p.r,ay=p.y+y1*p.r,bx=p.x+x2*p.r,by2=p.y+y2*p.r;
      if(Math.hypot(ax-p.x,ay-p.y)>p.r||Math.hypot(bx-p.x,by2-p.y)>p.r)return;
      ctx.globalAlpha=.65;ctx.strokeStyle='#ff8030';ctx.lineWidth=1.2;
      ctx.beginPath();ctx.moveTo(ax,ay);ctx.lineTo(bx,by2);ctx.stroke();
      ctx.globalAlpha=.4;ctx.strokeStyle='#ffb040';ctx.lineWidth=.5;
      ctx.beginPath();ctx.moveTo(ax,ay);ctx.lineTo(bx,by2);ctx.stroke();
    });
    ctx.globalAlpha=1;

    // Couronne de feu
    const fireColors=['#ff4000','#ff6010','#ff8020','#ffaa30','#ff3000'];
    const t=Date.now();
    for(let i=0;i<12;i++){
      const angle=(i/12)*Math.PI*2+t*0.0008;
      const dist=p.r*(1.05+0.12*Math.sin(t*0.003+i));
      const size=p.r*(0.12+0.08*Math.random());
      const fx=p.x+Math.cos(angle)*dist,fy=p.y+Math.sin(angle)*dist;
      const flameGrad=ctx.createRadialGradient(fx,fy,0,fx,fy,size);
      flameGrad.addColorStop(0,'#ffdd60');
      flameGrad.addColorStop(0.4,fireColors[i%fireColors.length]);
      flameGrad.addColorStop(1,'rgba(255,40,0,0)');
      ctx.beginPath();ctx.arc(fx,fy,size,0,Math.PI*2);
      ctx.fillStyle=flameGrad;ctx.globalAlpha=0.7+0.3*Math.sin(t*0.005+i);ctx.fill();
    }
    ctx.globalAlpha=1;

    // Halo de chaleur
    const heatGrad=ctx.createRadialGradient(p.x,p.y,p.r,p.x,p.y,p.r*1.5);
    heatGrad.addColorStop(0,'rgba(255,80,0,0.25)');heatGrad.addColorStop(1,'rgba(255,40,0,0)');
    ctx.beginPath();ctx.arc(p.x,p.y,p.r*1.5,0,Math.PI*2);ctx.fillStyle=heatGrad;ctx.fill();
  }

  // Nuages et éclairs (si lightning:true — Nyxar)
  if(p.lightning){
    const t=Date.now();

    // Nuages tourbillonnants
    for(let i=0;i<6;i++){
      const angle=(i/6)*Math.PI*2+t*0.0005;
      const dist=p.r*(1.08+0.06*Math.sin(t*0.002+i));
      const cx2=p.x+Math.cos(angle)*dist,cy2=p.y+Math.sin(angle)*dist;
      const cloudSize=p.r*(0.25+0.1*Math.sin(t*0.003+i*1.3));
      const cloudGrad=ctx.createRadialGradient(cx2,cy2,0,cx2,cy2,cloudSize);
      cloudGrad.addColorStop(0,'rgba(160,60,220,0.5)');
      cloudGrad.addColorStop(0.5,'rgba(100,20,180,0.3)');
      cloudGrad.addColorStop(1,'rgba(80,0,160,0)');
      ctx.beginPath();ctx.arc(cx2,cy2,cloudSize,0,Math.PI*2);ctx.fillStyle=cloudGrad;ctx.fill();
    }

    // Éclairs entre les nuages (flashs aléatoires)
    if(Math.sin(t*0.007)>0.7){
      const a1=Math.random()*Math.PI*2,a2=a1+(Math.random()-.5)*1.5;
      ctx.save();
      ctx.strokeStyle='#e0a0ff';ctx.lineWidth=1;ctx.globalAlpha=0.8;
      ctx.shadowColor='#c060ff';ctx.shadowBlur=8;
      ctx.beginPath();
      ctx.moveTo(p.x+Math.cos(a1)*p.r*1.1,p.y+Math.sin(a1)*p.r*1.1);
      ctx.lineTo(p.x+Math.cos((a1+a2)/2)*p.r*0.7+(Math.random()-.5)*10,p.y+Math.sin((a1+a2)/2)*p.r*0.7+(Math.random()-.5)*10);
      ctx.lineTo(p.x+Math.cos(a2)*p.r*1.3,p.y+Math.sin(a2)*p.r*1.3);
      ctx.stroke();
      ctx.restore();
    }

    // Halo électrique
    const elecGrad=ctx.createRadialGradient(p.x,p.y,p.r,p.x,p.y,p.r*1.6);
    elecGrad.addColorStop(0,'rgba(140,40,220,0.2)');elecGrad.addColorStop(1,'rgba(80,0,160,0)');
    ctx.beginPath();ctx.arc(p.x,p.y,p.r*1.6,0,Math.PI*2);ctx.fillStyle=elecGrad;ctx.fill();
  }

  // Tempête de sable tourbillonnante (si sandstorm:true — Aralis)
  if(p.sandstorm){
    const t=Date.now();
    // 3 bandes de sable elliptiques à des inclinaisons différentes
    const bands=[
      {tilt:.28, dist:1.18, w:.13, speed:.00035, alpha:.32},
      {tilt:.52, dist:1.32, w:.10, speed:-.00022, alpha:.22},
      {tilt:.15, dist:1.48, w:.08, speed:.00018, alpha:.16},
    ];
    ctx.save();
    bands.forEach(b=>{
      const angle=t*b.speed;
      const rx=p.r*b.dist, ry=p.r*b.w;
      // Gradient le long de l'ellipse pour simuler la densité de sable
      const sg=ctx.createRadialGradient(p.x,p.y,rx*.6,p.x,p.y,rx*1.1);
      sg.addColorStop(0,`rgba(210,140,50,${b.alpha})`);
      sg.addColorStop(.5,`rgba(190,110,30,${b.alpha*.7})`);
      sg.addColorStop(1,'rgba(160,80,20,0)');
      ctx.fillStyle=sg;
      ctx.save();
      ctx.translate(p.x,p.y);ctx.rotate(angle);
      ctx.scale(1, ry/rx);
      ctx.beginPath();ctx.arc(0,0,rx,0,Math.PI*2);
      ctx.restore();
      // Dessine l'ellipse inclinée avec stroke pour l'effet de traîne
      ctx.globalAlpha=b.alpha;
      ctx.strokeStyle=`rgba(220,150,60,${b.alpha})`;
      ctx.lineWidth=p.r*b.w*2;
      ctx.save();
      ctx.translate(p.x,p.y);ctx.rotate(angle);
      ctx.beginPath();ctx.ellipse(0,0,rx,p.r*b.w,b.tilt,0,Math.PI*2);
      ctx.stroke();
      ctx.restore();
    });
    // Particules de sable — petits arcs rapides
    for(let i=0;i<8;i++){
      const a=((t*0.0006+i/8)*Math.PI*2)%(Math.PI*2);
      const dist=p.r*(1.15+.28*(i%3)/3);
      const px2=p.x+Math.cos(a)*dist, py2=p.y+Math.sin(a)*dist*.45;
      const sr2=p.r*(.04+.02*(i%2));
      ctx.globalAlpha=.28+.18*Math.sin(t*.002+i);
      ctx.fillStyle='rgba(230,160,70,.9)';
      ctx.beginPath();ctx.arc(px2,py2,sr2,0,Math.PI*2);ctx.fill();
    }
    ctx.globalAlpha=1;
    ctx.restore();
  }

  // Highlight brillant (effet 3D)
  const hl=ctx.createRadialGradient(p.x-p.r*.35,p.y-p.r*.35,0,p.x-p.r*.35,p.y-p.r*.35,p.r*.55);
  hl.addColorStop(0,'rgba(255,255,255,0.28)');hl.addColorStop(1,'rgba(255,255,255,0)');
  ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fillStyle=hl;ctx.fill();

  // Anneau (si ring:true)
  if(p.ring){
    ctx.save();
    ctx.globalAlpha=.55;ctx.strokeStyle=p.rc||p.base+'88';ctx.lineWidth=p.r*.12;
    ctx.beginPath();ctx.ellipse(p.x,p.y,p.r*(1.6+(p.ra||.3)),p.r*.18,0,0,Math.PI*2);ctx.stroke();
    ctx.globalAlpha=.25;ctx.lineWidth=p.r*.06;
    ctx.beginPath();ctx.ellipse(p.x,p.y,p.r*(1.9+(p.ra||.3)),p.r*.22,0,0,Math.PI*2);ctx.stroke();
    ctx.restore();
  }

  // Ombre portée côté droit bas
  const shadow=ctx.createRadialGradient(p.x+p.r*.2,p.y+p.r*.2,p.r*.3,p.x,p.y,p.r);
  shadow.addColorStop(0,'rgba(0,0,0,0)');shadow.addColorStop(1,'rgba(0,0,0,0.45)');
  ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fillStyle=shadow;ctx.fill();

  ctx.restore();
}

function drawBg(){
  ctx.shadowBlur=0;ctx.shadowColor='transparent';ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
  // Fond plein OBLIGATOIRE — couvre tout le canvas avant tout dessin
  ctx.fillStyle='#000010';ctx.fillRect(0,0,W,H);
  const m=chosenMap;
  // sky
  const sg=ctx.createLinearGradient(0,0,0,H);
  sg.addColorStop(0,m.sky[0]);sg.addColorStop(.5,m.sky[1]);sg.addColorStop(1,m.sky[2]);
  ctx.fillStyle=sg;ctx.fillRect(0,0,W,H);
  // nebulas — défilement parallaxe très lent (couche la plus éloignée)
  if(m.nebulas){m.nebulas.forEach(n=>{
    const ny=n.y+(bgScrollY*0.30)%(H+n.h);
    const g=ctx.createRadialGradient(n.x+n.w/2,ny+n.h/2,10,n.x+n.w/2,ny+n.h/2,Math.max(n.w,n.h)*.6);
    g.addColorStop(0,n.col1);g.addColorStop(1,n.col2);ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(n.x+n.w/2,ny+n.h/2,n.w/2,n.h/2,0,0,Math.PI*2);ctx.fill();
  });}
  // suns (aralis) — utilise la copie animée m._suns
  const _suns=m._suns||m.suns;
  if(_suns){_suns.forEach(s=>{
    const g=ctx.createRadialGradient(s.x,s.y,s.r*.4,s.x,s.y,s.r*3);
    g.addColorStop(0,s.glow);g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(s.x,s.y,s.r*3,0,Math.PI*2);ctx.fill();
    ctx.fillStyle=s.col;ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='rgba(255,255,255,.5)';ctx.beginPath();ctx.arc(s.x-s.r*.3,s.y-s.r*.3,s.r*.4,0,Math.PI*2);ctx.fill();
  });}
  // big planet (massive)
  if(m._bp) drawPlanet(m._bp);
  // black holes (verge)
  bholes.forEach(bh=>{
    const gr=ctx.createRadialGradient(bh.x,bh.y,bh.r*.5,bh.x,bh.y,bh.r*3.3);
    gr.addColorStop(0,'rgba(0,0,0,1)');gr.addColorStop(.42,'rgba(75,0,115,.28)');gr.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=gr;ctx.beginPath();ctx.arc(bh.x,bh.y,bh.r*3.3,0,Math.PI*2);ctx.fill();
    ctx.save();ctx.globalAlpha=.48+Math.sin(FN*.022)*.12;
    ctx.strokeStyle='rgba(190,110,255,.68)';ctx.lineWidth=2.5;ctx.beginPath();ctx.ellipse(bh.x,bh.y,bh.r*2.3,bh.r*.55,.26,0,Math.PI*2);ctx.stroke();
    ctx.strokeStyle='rgba(255,175,90,.3)';ctx.lineWidth=1.2;ctx.beginPath();ctx.ellipse(bh.x,bh.y,bh.r*1.65,bh.r*.38,.26,0,Math.PI*2);ctx.stroke();
    ctx.restore();ctx.fillStyle='#000';ctx.beginPath();ctx.arc(bh.x,bh.y,bh.r,0,Math.PI*2);ctx.fill();
  });
  // small planets
  planets.forEach(p=>drawPlanet(p));

  // Lune — suit la Terre (planets[2] de la map verge = Système Solaire)
  if(m.id==='verge'&&planets[2]){
    const earth=planets[2];
    const moonX=earth.x+48, moonY=earth.y-14;
    ctx.save();
    // Orbite subtile
    ctx.strokeStyle='rgba(255,255,255,0.1)';ctx.lineWidth=0.5;
    ctx.beginPath();ctx.ellipse(earth.x,earth.y,52,14,0,0,Math.PI*2);ctx.stroke();
    // Corps de la lune
    const mg=ctx.createRadialGradient(moonX-3,moonY-3,1,moonX,moonY,10);
    mg.addColorStop(0,'#d8d0c8');mg.addColorStop(0.5,'#989080');mg.addColorStop(1,'#303028');
    ctx.beginPath();ctx.arc(moonX,moonY,10,0,Math.PI*2);ctx.fillStyle=mg;ctx.fill();
    // Cratères
    ctx.fillStyle='rgba(100,90,80,0.45)';
    ctx.beginPath();ctx.arc(moonX+3,moonY-2,3,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.arc(moonX-3,moonY+3,2,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.arc(moonX+2,moonY+3,1.5,0,Math.PI*2);ctx.fill();
    // Highlight
    const mhl=ctx.createRadialGradient(moonX-3,moonY-3,0,moonX-3,moonY-3,7);
    mhl.addColorStop(0,'rgba(255,255,255,0.28)');mhl.addColorStop(1,'rgba(255,255,255,0)');
    ctx.beginPath();ctx.arc(moonX,moonY,10,0,Math.PI*2);ctx.fillStyle=mhl;ctx.fill();
    ctx.restore();
  }
  // map-specific particles
  particlesBg.forEach(p=>{
    ctx.save();ctx.globalAlpha=p.a;ctx.fillStyle=p.col||'#fff';
    if(p.k==='ice'){
      ctx.translate(p.x,p.y);ctx.rotate(p.rot);
      const ig=ctx.createLinearGradient(0,-p.r*1.8,0,p.r*.6);
      ig.addColorStop(0,'rgba(255,255,255,.95)');ig.addColorStop(.4,'rgba(190,235,255,.85)');ig.addColorStop(1,'rgba(100,190,240,.3)');
      ctx.shadowBlur=8;ctx.shadowColor='rgba(160,220,255,.8)';
      ctx.fillStyle=ig;ctx.beginPath();ctx.moveTo(0,-p.r*1.8);ctx.lineTo(p.r*.38,0);ctx.lineTo(0,p.r*.6);ctx.lineTo(-p.r*.38,0);ctx.closePath();ctx.fill();
      ctx.fillStyle='rgba(255,255,255,.45)';ctx.beginPath();ctx.moveTo(0,-p.r*1.8);ctx.lineTo(p.r*.12,-p.r*.5);ctx.lineTo(0,-p.r*.2);ctx.lineTo(-p.r*.12,-p.r*.5);ctx.closePath();ctx.fill();
    }
    else if(p.k==='ember'){ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill();ctx.shadowBlur=8;ctx.shadowColor=p.col;ctx.fill();}
    else if(p.k==='dust'){ctx.fillRect(p.x,p.y,p.r,p.r*.6);}
    else if(p.k==='spark'){ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill();}
    // ── DÉCORS MAP 2 : rochers de sable ──
    else if(p.k==='sandrock'){
      ctx.translate(p.x,p.y);ctx.rotate(p.rot||0);
      const rg=ctx.createRadialGradient(-p.r*.25,-p.r*.25,0,0,0,p.r);
      rg.addColorStop(0,'#daa060');rg.addColorStop(.6,'#a06030');rg.addColorStop(1,'#603818');
      ctx.fillStyle=rg;ctx.beginPath();ctx.ellipse(0,0,p.r,p.r*.62,0,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='rgba(80,40,10,.3)';ctx.beginPath();ctx.ellipse(p.r*.1,p.r*.1,p.r*.55,p.r*.35,0,0,Math.PI*2);ctx.fill();
    }
    // ── DÉCORS MAP 3 : cristaux de glace ──
    else if(p.k==='icerock'){
      ctx.translate(p.x,p.y);ctx.rotate(p.rot||0);
      ctx.shadowBlur=14;ctx.shadowColor='rgba(140,220,255,.9)';
      // Corps principal — cristal hexagonal allongé
      const irg=ctx.createLinearGradient(-p.r,0,p.r,p.r*.5);
      irg.addColorStop(0,'rgba(220,248,255,.92)');irg.addColorStop(.5,'rgba(160,220,250,.78)');irg.addColorStop(1,'rgba(100,180,240,.55)');
      ctx.fillStyle=irg;
      ctx.beginPath();ctx.moveTo(0,-p.r);ctx.lineTo(p.r*.55,-p.r*.4);ctx.lineTo(p.r*.55,p.r*.4);ctx.lineTo(0,p.r);ctx.lineTo(-p.r*.55,p.r*.4);ctx.lineTo(-p.r*.55,-p.r*.4);ctx.closePath();ctx.fill();
      // Reflet central
      ctx.fillStyle='rgba(255,255,255,.5)';ctx.beginPath();ctx.moveTo(-p.r*.08,-p.r*.85);ctx.lineTo(p.r*.14,-p.r*.3);ctx.lineTo(-p.r*.14,-p.r*.3);ctx.closePath();ctx.fill();
      // Ligne de clivage
      ctx.strokeStyle='rgba(200,240,255,.4)';ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(0,-p.r);ctx.lineTo(0,p.r);ctx.stroke();
    }
    // ── DÉCORS MAP 4 : nuages de cendres ──
    else if(p.k==='ashcloud'){
      ctx.translate(p.x,p.y);
      ctx.fillStyle=`rgba(28,14,8,${p.a*.9})`;
      ctx.beginPath();ctx.ellipse(-p.r*.38,0,p.r*.62,p.r*.38,0,0,Math.PI*2);ctx.fill();
      ctx.beginPath();ctx.ellipse(p.r*.28,p.r*.08,p.r*.5,p.r*.32,0,0,Math.PI*2);ctx.fill();
      ctx.beginPath();ctx.ellipse(0,-p.r*.18,p.r*.44,p.r*.28,0,0,Math.PI*2);ctx.fill();
      ctx.globalAlpha=p.a*.28;ctx.fillStyle='#cc3300';ctx.beginPath();ctx.ellipse(0,0,p.r*.22,p.r*.14,0,0,Math.PI*2);ctx.fill();
    }
    // ── DÉCORS MAP 5 : nœuds d'énergie ──
    else if(p.k==='energynode'){
      ctx.translate(p.x,p.y);
      const pulse=Math.sin(FN*.07+p.phase||0)*p.r*.5;
      const rg2=ctx.createRadialGradient(0,0,0,0,0,p.r+pulse+9);
      rg2.addColorStop(0,'rgba(210,130,255,1)');rg2.addColorStop(.35,`rgba(120,40,200,${p.a})`);rg2.addColorStop(1,'rgba(70,10,140,0)');
      ctx.fillStyle=rg2;ctx.beginPath();ctx.arc(0,0,p.r+pulse+9,0,Math.PI*2);ctx.fill();
      ctx.globalAlpha=.9;ctx.fillStyle='rgba(240,200,255,.95)';ctx.beginPath();ctx.arc(0,0,p.r*.38,0,Math.PI*2);ctx.fill();
    }
    ctx.restore();
  });
  // lightning (nyxar)
  if(m.lightning&&Math.random()<.005){
    const x1=Math.random()*W,x2=x1+(Math.random()-.5)*180;
    ctx.save();ctx.globalAlpha=.7;ctx.strokeStyle='rgba(220,180,255,.9)';ctx.lineWidth=1.5;ctx.shadowBlur=14;ctx.shadowColor='#cc88ff';
    ctx.beginPath();ctx.moveTo(x1,0);let cx=x1,cy=0;for(let i=0;i<6;i++){cx+=(Math.random()-.5)*40;cy+=H/6;ctx.lineTo(cx,cy);}ctx.stroke();ctx.restore();
  }
  // comets (verge only)
  comets.forEach(c=>{
    const ang=Math.atan2(c.vy,c.vx);
    const gr=ctx.createLinearGradient(c.x,c.y,c.x-Math.cos(ang)*c.tail,c.y-Math.sin(ang)*c.tail);
    gr.addColorStop(0,'rgba(255,255,255,.9)');gr.addColorStop(.5,'rgba(140,215,255,.32)');gr.addColorStop(1,'rgba(0,0,0,0)');
    ctx.strokeStyle=gr;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(c.x,c.y);ctx.lineTo(c.x-Math.cos(ang)*c.tail,c.y-Math.sin(ang)*c.tail);ctx.stroke();
    ctx.fillStyle='rgba(255,255,255,.92)';ctx.beginPath();ctx.arc(c.x,c.y,c.r,0,Math.PI*2);ctx.fill();
  });
}
function updBg(){
  const m=chosenMap;
  const px=Math.max(0.5,parallaxOffset*1.8);
  bgScrollY+=px*1.2;
  // petites planètes et trous noirs — plus rapides qu'avant
  planets.forEach(p=>{p.y+=p.sp*px*4.8;if(p.y>H+p.r+65)p.y=-p.r-65;});
  bholes.forEach(b=>{b.y+=b.sp*px*4.2;if(b.y>H+b.r+65)b.y=-b.r-65;});
  // grosse planète : scroll lent avec wrap
  if(m._bp){m._bp.y+=m._bp.sp*px*2.0;if(m._bp.y>H+m._bp.r+80)m._bp.y=-m._bp.r-80;}
  // soleils (Aralis) : scroll très lent
  if(m._suns)m._suns.forEach(s=>{s.y+=(s.sp!==undefined?s.sp:px*0.85);if(s.y>H+s.r*3+60)s.y=-(s.r*3+60);});
  if(m.id==='verge'){
    if(Math.random()<.004){const fl=Math.random()<.5;comets.push({x:fl?-22:W+22,y:Math.random()*H*.58,vx:fl?2.8+Math.random()*3.5:-(2.8+Math.random()*3.5),vy:1.4+Math.random()*2.4,r:2,tail:42+Math.random()*58});}
    comets.forEach(c=>{c.x+=c.vx;c.y+=c.vy;});comets=comets.filter(c=>c.y<H+75&&c.x>-95&&c.x<W+95);
  }
  // map-specific particles
  if(m.dust&&particlesBg.length<60&&Math.random()<.5){particlesBg.push({k:'dust',x:Math.random()*W,y:-4,vx:-1.5-Math.random()*1.5,vy:.4+Math.random()*.6,r:1+Math.random()*2,a:.15+Math.random()*.3,col:'#d8a86a'});}
  if(m.iceShards&&particlesBg.length<40&&Math.random()<.3){particlesBg.push({k:'ice',x:Math.random()*W,y:-4,vx:(Math.random()-.5)*.6,vy:.6+Math.random()*1.2,r:2+Math.random()*4,a:.4+Math.random()*.5,col:'rgba(220,240,255,.85)',rot:Math.random()*Math.PI,vrot:(Math.random()-.5)*.04});}
  if(m.embers&&particlesBg.length<55&&Math.random()<.4){particlesBg.push({k:'ember',x:Math.random()*W,y:H+4,vx:(Math.random()-.5)*.5,vy:-.5-Math.random()*1.4,r:1+Math.random()*2,a:.5+Math.random()*.4,col:Math.random()<.5?'#ff7733':'#ffaa44'});}
  if(m.id==='nyxar'&&particlesBg.length<35&&Math.random()<.25){particlesBg.push({k:'spark',x:Math.random()*W,y:Math.random()*H,vx:0,vy:.2,r:.6+Math.random()*1.2,a:.3+Math.random()*.5,col:'rgba(220,180,255,.9)',life:60+Math.random()*40});}
  // ── DÉCORS SUPPLÉMENTAIRES map 2-5 (subtils) ──
  if(m.id==='aralis'&&particlesBg.filter(p=>p.k==='sandrock').length<4&&Math.random()<.006)
    particlesBg.push({k:'sandrock',x:Math.random()*W,y:-28,vx:(Math.random()-.5)*.3,vy:.38+Math.random()*.42,r:7+Math.random()*13,a:.26+Math.random()*.18,rot:Math.random()*Math.PI,vrot:(Math.random()-.5)*.007});
  if(m.id==='krynos'&&particlesBg.filter(p=>p.k==='icerock').length<4&&Math.random()<.005)
    particlesBg.push({k:'icerock',x:Math.random()*W,y:-28,vx:(Math.random()-.5)*.4,vy:.32+Math.random()*.48,r:8+Math.random()*13,a:.3+Math.random()*.22,rot:Math.random()*Math.PI,vrot:(Math.random()-.5)*.014});
  if(m.id==='pyron'&&particlesBg.filter(p=>p.k==='ashcloud').length<3&&Math.random()<.004)
    particlesBg.push({k:'ashcloud',x:Math.random()*W,y:-36,vx:(Math.random()-.5)*.45,vy:.28+Math.random()*.4,r:14+Math.random()*15,a:.18+Math.random()*.14});
  if(m.id==='nyxar'&&particlesBg.filter(p=>p.k==='energynode').length<5&&Math.random()<.007)
    particlesBg.push({k:'energynode',x:Math.random()*W,y:-18,vx:(Math.random()-.5)*.18,vy:.14+Math.random()*.22,r:3+Math.random()*5,a:.72+Math.random()*.22,phase:Math.random()*Math.PI*2});
  particlesBg.forEach(p=>{p.x+=p.vx;p.y+=p.vy;if(p.rot!==undefined)p.rot+=p.vrot;if(p.k==='ember')p.a*=.992;if(p.life)p.life--;});
  particlesBg=particlesBg.filter(p=>p.y<H+12&&p.y>-20&&p.x>-20&&p.x<W+20&&p.a>.05&&(p.life===undefined||p.life>0));
}

// ── INIT GAME ──────────────────────────────────────────────────────
function initStars(){
  const hueArr=chosenMap.starHues;
  stars=Array.from({length:145},()=>({x:Math.random()*W,y:Math.random()*H,s:Math.random()*1.7+.3,sp:Math.random()*1.1+.4,b:Math.random(),col:hueArr[Math.floor(Math.random()*hueArr.length)]}));
}
function init(){
  chosenMap=MAPS[currentWorld];
  const sh=chosenShip;
  initStars();
  initBg();
  player={x:W/2,y:H-100,speed:sh.speed,weapon:'default',wTimer:0,iframes:0,bonuses:{rapid:0,multi:0,shield:0,speed:0},fireRate:sh.fireRate,palette:sh.palette,vy:0};
  bullets=[];enemies=[];particles=[];bonuses=[];floats=[];powerBubbles=[];
  score=0;lives=sh.lives;wave=1;FN=0;fTimer=0;eTimer=0;wTimer=0;bbTimer=0;laserT=0;
  bSpawned=false;bDefeated=true;boss=null;rouletteQueued=false;rouletteDelay=0;
  BBel.style.display='none';
  combo=0;comboTimer=0;shakeAmt=0;shakeDur=0;shakeX=0;shakeY=0;squadTimer=0;
  powerBar=0;powerActive=false;powerUsedCount=0;powerFragsSpawned=0;
}

// ── DAMAGE ─────────────────────────────────────────────────────────
function dmgPlayer(){
  if(player.invincible)return false;
  if(player.iframes>0)return false;
  if(player.bonuses.shield>0){player.bonuses.shield=0;expl(player.x,player.y,'#4f4',14);return false;}
  lives--;snd.pHit();playHitPlayer();expl(player.x,player.y,'#f44',22);
  if(lives<=0){if(campaignMode)campaignMode=false;endGame();return true;}
  player.iframes=120;return false;
}

// ── PLAYER & ENEMY DRAWS ───────────────────────────────────────────
function drawPlayer(x,y,sh){
  const p=player.palette;
  ctx.save();ctx.translate(x,y);
  const fl=.18+Math.sin(FN*.24)*.09;
  ctx.fillStyle=p.thrust+'.48)';ctx.beginPath();ctx.moveTo(-12,27);ctx.lineTo(12,27);ctx.lineTo(0,27+fl*66);ctx.closePath();ctx.fill();
  ctx.fillStyle=p.thrust+'.18)';ctx.beginPath();ctx.moveTo(-6,27);ctx.lineTo(6,27);ctx.lineTo(0,27+fl*38);ctx.closePath();ctx.fill();
  ctx.fillStyle=p.hullDk;ctx.beginPath();ctx.moveTo(-14,4);ctx.lineTo(-30,24);ctx.lineTo(-32,30);ctx.lineTo(-16,25);ctx.lineTo(-11,12);ctx.closePath();ctx.fill();
  ctx.fillStyle=p.hull;ctx.beginPath();ctx.moveTo(-14,11);ctx.lineTo(-26,24);ctx.lineTo(-17,21);ctx.lineTo(-11,12);ctx.closePath();ctx.fill();
  ctx.fillStyle=p.hullDk;ctx.beginPath();ctx.moveTo(14,4);ctx.lineTo(30,24);ctx.lineTo(32,30);ctx.lineTo(16,25);ctx.lineTo(11,12);ctx.closePath();ctx.fill();
  ctx.fillStyle=p.hull;ctx.beginPath();ctx.moveTo(14,11);ctx.lineTo(26,24);ctx.lineTo(17,21);ctx.lineTo(11,12);ctx.closePath();ctx.fill();
  ctx.fillStyle=p.wing;ctx.beginPath();ctx.moveTo(0,-30);ctx.lineTo(13,-14);ctx.lineTo(15,13);ctx.lineTo(11,27);ctx.lineTo(-11,27);ctx.lineTo(-15,13);ctx.lineTo(-13,-14);ctx.closePath();ctx.fill();
  ctx.fillStyle=p.wingHi;ctx.beginPath();ctx.moveTo(0,-30);ctx.lineTo(7,-14);ctx.lineTo(8,13);ctx.lineTo(0,9);ctx.lineTo(-8,13);ctx.lineTo(-7,-14);ctx.closePath();ctx.fill();
  ctx.fillStyle=p.accent;ctx.fillRect(-18,-5,4,21);ctx.fillRect(14,-5,4,21);
  ctx.fillStyle=p.cock;ctx.beginPath();ctx.ellipse(0,-8,9,14,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle=p.cockHi;ctx.beginPath();ctx.ellipse(0,-9,6,11,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='rgba(255,255,255,.3)';ctx.beginPath();ctx.ellipse(-2,-13,2.5,5,-.3,0,Math.PI*2);ctx.fill();
  // ── ARMES VISIBLES ─────────────────────────────────────────────
  const w=player.weapon;
  if(w==='missile'){
    // pods de missiles verts sur les ailes
    ctx.fillStyle='#1a3a08';ctx.fillRect(-22,-2,7,16);ctx.fillRect(15,-2,7,16);
    ctx.fillStyle='#88ff44';ctx.fillRect(-21,-1,5,4);ctx.fillRect(16,-1,5,4);
    ctx.fillStyle='#44aa22';ctx.fillRect(-22,12,7,3);ctx.fillRect(15,12,7,3);
    // têtes de missile dépassant
    ctx.fillStyle='#aaffaa';ctx.beginPath();ctx.moveTo(-18.5,-6);ctx.lineTo(-21,-2);ctx.lineTo(-16,-2);ctx.closePath();ctx.fill();
    ctx.beginPath();ctx.moveTo(18.5,-6);ctx.lineTo(21,-2);ctx.lineTo(16,-2);ctx.closePath();ctx.fill();
    ctx.fillStyle='rgba(136,255,68,'+(.4+Math.sin(FN*.3)*.3)+')';ctx.beginPath();ctx.arc(-18.5,15,2.5,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(18.5,15,2.5,0,Math.PI*2);ctx.fill();
  } else if(w==='minigun'){
    // canons mitrailleuses sous les ailes (gatling)
    ctx.fillStyle='#3a2010';ctx.fillRect(-23,4,8,18);ctx.fillRect(15,4,8,18);
    for(let i=0;i<3;i++){
      ctx.fillStyle='#1a0a04';ctx.fillRect(-22+i*2.5,8,1.6,14);ctx.fillRect(16+i*2.5,8,1.6,14);
    }
    ctx.fillStyle='#ff8800';ctx.fillRect(-23,2,8,3);ctx.fillRect(15,2,8,3);
    // étincelle de tir
    if(FN%4<2){ctx.fillStyle='rgba(255,200,80,.85)';ctx.beginPath();ctx.arc(-19,22,3,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(19,22,3,0,Math.PI*2);ctx.fill();}
  } else if(w==='laser'){
    // émetteur cristal sur le nez
    const lp=.5+Math.sin(FN*.25)*.3;
    ctx.save();ctx.shadowBlur=10;ctx.shadowColor='#ff44ff';
    ctx.fillStyle='#3a0a3a';ctx.fillRect(-4,-26,8,10);
    ctx.fillStyle='#ff44ff';ctx.beginPath();ctx.moveTo(0,-32);ctx.lineTo(4,-22);ctx.lineTo(-4,-22);ctx.closePath();ctx.fill();
    ctx.fillStyle=`rgba(255,200,255,${lp})`;ctx.beginPath();ctx.arc(0,-26,2.2,0,Math.PI*2);ctx.fill();
    ctx.restore();
    // rails latéraux roses
    ctx.fillStyle='rgba(255,68,255,.7)';ctx.fillRect(-19,2,2,12);ctx.fillRect(17,2,2,12);
  }
  if(sh){ctx.save();ctx.globalAlpha=.22+Math.sin(FN*.12)*.13;ctx.strokeStyle='#4f4';ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(0,0,33,37,0,0,Math.PI*2);ctx.stroke();ctx.restore();}
  ctx.restore();
}
function dEB(x,y){ctx.save();ctx.translate(x,y);ctx.rotate(Math.PI);ctx.fillStyle='#c44';ctx.beginPath();ctx.moveTo(0,-22);ctx.lineTo(14,8);ctx.lineTo(9,18);ctx.lineTo(-9,18);ctx.lineTo(-14,8);ctx.closePath();ctx.fill();ctx.fillStyle='#a33';ctx.beginPath();ctx.moveTo(-8,4);ctx.lineTo(-22,16);ctx.lineTo(-18,18);ctx.lineTo(-8,12);ctx.closePath();ctx.fill();ctx.beginPath();ctx.moveTo(8,4);ctx.lineTo(22,16);ctx.lineTo(18,18);ctx.lineTo(8,12);ctx.closePath();ctx.fill();ctx.fillStyle='#411';ctx.beginPath();ctx.ellipse(0,0,5,8,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#f55';ctx.beginPath();ctx.ellipse(0,-1,3,5,0,0,Math.PI*2);ctx.fill();ctx.restore();}
function dEF(x,y){ctx.save();ctx.translate(x,y);ctx.rotate(Math.PI);ctx.fillStyle='#e80';ctx.beginPath();ctx.moveTo(0,-26);ctx.lineTo(8,2);ctx.lineTo(6,18);ctx.lineTo(-6,18);ctx.lineTo(-8,2);ctx.closePath();ctx.fill();ctx.fillStyle='#c60';ctx.beginPath();ctx.moveTo(-6,-2);ctx.lineTo(-21,12);ctx.lineTo(-21,19);ctx.lineTo(-6,15);ctx.closePath();ctx.fill();ctx.beginPath();ctx.moveTo(6,-2);ctx.lineTo(21,12);ctx.lineTo(21,19);ctx.lineTo(6,15);ctx.closePath();ctx.fill();ctx.fillStyle='#ff8';ctx.beginPath();ctx.ellipse(0,-4,4,7,0,0,Math.PI*2);ctx.fill();ctx.restore();}
function dET(x,y,r){ctx.save();ctx.translate(x,y);ctx.rotate(Math.PI);ctx.fillStyle='#7a3abf';ctx.beginPath();ctx.moveTo(0,-28);ctx.lineTo(20,0);ctx.lineTo(20,14);ctx.lineTo(10,24);ctx.lineTo(-10,24);ctx.lineTo(-20,14);ctx.lineTo(-20,0);ctx.closePath();ctx.fill();ctx.fillStyle='#5a2a9a';ctx.fillRect(-10,-16,20,24);ctx.fillStyle='#9050d0';ctx.beginPath();ctx.moveTo(0,-28);ctx.lineTo(9,-4);ctx.lineTo(0,0);ctx.lineTo(-9,-4);ctx.closePath();ctx.fill();ctx.fillStyle='#281050';ctx.beginPath();ctx.ellipse(0,4,9,12,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#aa60f0';ctx.beginPath();ctx.ellipse(0,3,6,8,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#5a2a9a';ctx.fillRect(-20,2,7,16);ctx.fillRect(13,2,7,16);ctx.restore();ctx.fillStyle='#1a0028';ctx.fillRect(x-22,y+30,44,6);ctx.fillStyle='#aa60f0';ctx.fillRect(x-22,y+30,44*r,6);}
function dEZ(x,y){ctx.save();ctx.translate(x,y);ctx.rotate(Math.PI);ctx.fillStyle='#0bb';ctx.beginPath();ctx.moveTo(0,-22);ctx.lineTo(10,2);ctx.lineTo(9,17);ctx.lineTo(0,13);ctx.lineTo(-9,17);ctx.lineTo(-10,2);ctx.closePath();ctx.fill();ctx.fillStyle='#088';ctx.beginPath();ctx.moveTo(-8,-2);ctx.lineTo(-21,10);ctx.lineTo(-21,19);ctx.lineTo(-8,15);ctx.closePath();ctx.fill();ctx.beginPath();ctx.moveTo(8,-2);ctx.lineTo(21,10);ctx.lineTo(21,19);ctx.lineTo(8,15);ctx.closePath();ctx.fill();ctx.fillStyle='#0ff';ctx.beginPath();ctx.ellipse(0,-2,4,7,0,0,Math.PI*2);ctx.fill();ctx.restore();}
function dEH(x,y,hp,mhp){
  ctx.save();ctx.translate(x,y);ctx.rotate(Math.PI);
  const pulse=.42+Math.sin(FN*.28)*.28;
  ctx.shadowBlur=10+pulse*10;ctx.shadowColor='#ff2288';
  // ailes
  ctx.fillStyle='#aa0055';
  ctx.beginPath();ctx.moveTo(-10,0);ctx.lineTo(-22,14);ctx.lineTo(-20,20);ctx.lineTo(-10,16);ctx.closePath();ctx.fill();
  ctx.beginPath();ctx.moveTo(10,0);ctx.lineTo(22,14);ctx.lineTo(20,20);ctx.lineTo(10,16);ctx.closePath();ctx.fill();
  // fuselage
  ctx.fillStyle='#ff2288';
  ctx.beginPath();ctx.moveTo(0,-22);ctx.lineTo(12,4);ctx.lineTo(9,18);ctx.lineTo(-9,18);ctx.lineTo(-12,4);ctx.closePath();ctx.fill();
  // centre lumineux
  ctx.fillStyle='#ff88cc';ctx.beginPath();ctx.ellipse(0,-2,5,9,0,0,Math.PI*2);ctx.fill();
  // noyau pulsant
  ctx.fillStyle=`rgba(255,34,136,${pulse})`;ctx.beginPath();ctx.arc(0,0,3.5,0,Math.PI*2);ctx.fill();
  // barre de vie (si plusieurs PV)
  if(mhp>1){ctx.fillStyle='#2a0015';ctx.fillRect(-12,22,24,4);ctx.fillStyle='#ff2288';ctx.fillRect(-12,22,24*(hp/mhp),4);}
  ctx.restore();
}
function dESQ(x,y){
  ctx.save();ctx.translate(x,y);ctx.rotate(Math.PI);
  ctx.shadowBlur=8;ctx.shadowColor='#22dd66';
  ctx.fillStyle='#118844';
  ctx.beginPath();ctx.moveTo(-8,2);ctx.lineTo(-19,12);ctx.lineTo(-16,17);ctx.lineTo(-6,12);ctx.closePath();ctx.fill();
  ctx.beginPath();ctx.moveTo(8,2);ctx.lineTo(19,12);ctx.lineTo(16,17);ctx.lineTo(6,12);ctx.closePath();ctx.fill();
  ctx.fillStyle='#22dd66';
  ctx.beginPath();ctx.moveTo(0,-20);ctx.lineTo(8,2);ctx.lineTo(6,16);ctx.lineTo(-6,16);ctx.lineTo(-8,2);ctx.closePath();ctx.fill();
  ctx.fillStyle='#88ffaa';ctx.beginPath();ctx.ellipse(0,-4,3,6,0,0,Math.PI*2);ctx.fill();
  const eg=.5+Math.sin(FN*.45)*.35;
  ctx.fillStyle=`rgba(34,220,100,${eg})`;ctx.beginPath();ctx.arc(0,17,3.5,0,Math.PI*2);ctx.fill();
  ctx.restore();
}
function spawnSquad(){
  const _dsm=getDiff().spMult;const sp=((_dsm[currentWorld]??_dsm[0]))*2.0;
  const cx=90+Math.random()*(W-180);
  [-58,0,58].forEach(ox=>{
    const e={x:Math.max(26,Math.min(W-26,cx+ox)),y:-52,type:'squad',flash:0,zigDir:1,zigT:0};
    e.sp=sp;e.hp=1;e.mhp=1;e.sc=25;e.w=24;e.h=28;e.col='#22dd66';
    e.sr=99999;e.st=0; // kamikaze — pas de tir
    enemies.push(e);
  });
}
function dBoss(b){
  ctx.save();ctx.translate(b.x,b.y);ctx.rotate(Math.PI);
  const p=b.phase,ph=.38+Math.sin(FN*.16)*.3;
  ctx.fillStyle=p>=2?'#8a0000':'#6f0000';ctx.beginPath();ctx.moveTo(0,-56);ctx.lineTo(34,-22);ctx.lineTo(43,0);ctx.lineTo(41,30);ctx.lineTo(22,46);ctx.lineTo(-22,46);ctx.lineTo(-40,30);ctx.lineTo(-43,0);ctx.lineTo(-34,-22);ctx.closePath();ctx.fill();
  ctx.fillStyle='#3a0000';ctx.fillRect(-43,10,12,26);ctx.fillRect(31,10,12,26);ctx.fillStyle='#f44';ctx.fillRect(-43,32,12,6);ctx.fillRect(31,32,12,6);
  ctx.fillStyle=p>=2?'#be0000':'#9c0000';ctx.beginPath();ctx.moveTo(0,-56);ctx.lineTo(19,-20);ctx.lineTo(23,0);ctx.lineTo(19,30);ctx.lineTo(0,41);ctx.lineTo(-19,30);ctx.lineTo(-23,0);ctx.lineTo(-19,-20);ctx.closePath();ctx.fill();
  ctx.fillStyle='#1a0000';ctx.beginPath();ctx.ellipse(0,4,15,20,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle=p>=2?'#ff3333':'#ff1111';ctx.beginPath();ctx.ellipse(0,2,10,15,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle=`rgba(255,${p>=2?185:75},75,${ph})`;ctx.beginPath();ctx.ellipse(0,0,6,10,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#4e0000';ctx.beginPath();ctx.moveTo(-27,-6);ctx.lineTo(-39,12);ctx.lineTo(-31,20);ctx.lineTo(-18,5);ctx.closePath();ctx.fill();ctx.beginPath();ctx.moveTo(27,-6);ctx.lineTo(39,12);ctx.lineTo(31,20);ctx.lineTo(18,5);ctx.closePath();ctx.fill();
  const fe=.38+Math.sin(FN*.2)*.2;ctx.fillStyle=`rgba(255,75,75,${fe})`;ctx.beginPath();ctx.ellipse(-14,46,7,14,0,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(14,46,7,14,0,0,Math.PI*2);ctx.fill();
  ctx.restore();
}

// ── EFFECTS ────────────────────────────────────────────────────────
function expl(x,y,col,n=16,big=false){
  for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,sp=(big?2.6:1.2)*(1+Math.random()*3.5);particles.push({x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,life:1,dc:.025+Math.random()*.042,r:(big?2.6:1.2)*(1+Math.random()*3.2),col});}
  if(big){
    for(let i=0;i<10;i++){const a=Math.random()*Math.PI*2,sp=.4+Math.random()*2;particles.push({x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,life:1,dc:.01,r:5+Math.random()*8,col:'rgba(255,200,100,.48)'});}
    // ring waves
    particles.push({x,y,vx:0,vy:0,life:1,dc:.052,r:0,col,ring:true,ringR:3,ringMax:62});
    particles.push({x,y,vx:0,vy:0,life:.7,dc:.08,r:0,col:'rgba(255,255,255,.85)',ring:true,ringR:1,ringMax:34});
    shake(8,14);
  } else {
    shake(3,5);
  }
}
function spark(x,y,col){for(let i=0;i<7;i++){const a=Math.random()*Math.PI*2,sp=1.5+Math.random()*3.5;particles.push({x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,life:.72,dc:.1+Math.random()*.09,r:1+Math.random()*2.5,col});}}
function fSc(x,y,v,col){floats.push({x,y,val:v,col:col||'#ff0',life:1,vy:-1.4});}
function killScore(x,y,sc,col){
  combo=Math.min(COMBO_MAX,combo+1);comboTimer=COMBO_DECAY;
  const mult=combo>1?(1+(combo-1)*.25):1;
  const total=Math.round(sc*mult);
  score+=total;
  fSc(x,y,total,col);
  if(combo>=2)floats.push({x,y:y-24,val:'×'+combo,col:'#ffd87a',life:.9,vy:-2.2,big:true});
  checkCampaignObjective();
}
function spawnBonus(x,y,fc){
  // Taux fixe : 22% par ennemi tué, identique toutes difficultés et toutes maps
  const chance=fc!==undefined?fc:0.22;
  if(Math.random()>chance)return;
  // 15% des drops sont des armes — identique toutes maps
  const isWeapon=Math.random()<0.15;
  let bt;
  if(isWeapon){const wpool=BD.filter(b=>b.weapon);bt=wpool[Math.floor(Math.random()*wpool.length)];}
  // supernova exclus du pool normal — tombe uniquement après un boss
  else{const reg=BD.filter(b=>!b.weapon&&!b.super);bt=reg[Math.floor(Math.random()*reg.length)];}
  bonuses.push({x,y,type:bt.type,color:bt.color,sp:1.3,r:17,pulse:0,weapon:bt.weapon});
}

function trySpawnPowerFrag(x,y){
  if(!chosenShip)return;
  const shipKey=chosenShip.id.toLowerCase();
  const cfg=getPwCfg(shipKey);
  if(mpMode){
    // MP : fragments illimités, probabilité progressive sur 50 vagues
    const prob=0.06+(wave/50)*0.08;
    if(Math.random()<prob){
      bonuses.push({x,y,type:'powerfrag',shipKey,sp:1.8,pulse:0,r:13,color:cfg.col});
    }
    return;
  }
  const maxUses=POWER_MAX_USES[currentWorld];
  const maxFrags=maxUses*FRAGS_NEEDED;
  if(powerFragsSpawned>=maxFrags)return;
  if(powerUsedCount>=maxUses&&powerBar===0)return;
  const _wlFrag=getWaveLimit();const waveRatio=(_wlFrag===Infinity)?Math.min(wave/50,1):wave/_wlFrag;
  if(waveRatio<0.15)return;
  if(Math.random()<0.18){
    powerFragsSpawned++;
    bonuses.push({x,y,type:'powerfrag',shipKey,sp:1.8,pulse:0,r:13,color:cfg.col});
  }
}
function activatePower(){
  if(powerActive||!chosenShip)return;
  const maxUses=POWER_MAX_USES[currentWorld];
  if(powerUsedCount>=maxUses)return;
  powerBar=0;powerUsedCount++;powerActive=true;
  const shipKey=chosenShip.id.toLowerCase();
  const _pwcfg=getPwCfg(shipKey);
  const _pwlbl=POWER_LABELS[shipKey]||{name:'POUVOIR',col:'#fff'};
  floats.push({x:W/2,y:H*0.18,txt:'⚡ '+_pwlbl.name+' ⚡',col:_pwcfg.col,life:1.8,vy:-0.3,big:true,outline:true});
  if(shipKey==='raptor')powerRaptor();
  if(shipKey==='sentinel')powerSentinel();
  if(shipKey==='titan')powerTitan();
  // Message "POUVOIR EN COURS" pendant 6 secondes
  floats.push({x:W/2,y:105,txt:'⚡ POUVOIR EN COURS',t:360,col:_pwcfg.col,big:true,fixed:true,life:1,vy:0});
}
function powerRaptor(){
  player.x=W/2;player.y=H-100;
  player.invincible=true;player.powerMode='raptor';
  snd.bigE();
  const startY=H-100,targetY=-60,duration=105;let frame=0;
  const dash=setInterval(()=>{
    if(GS!=='playing'){clearInterval(dash);player.invincible=false;player.powerMode=null;powerActive=false;powerBubbles=[];return;}
    frame++;const t=frame/duration;
    player.y=startY+(targetY-startY)*t;
    // Bulle destructrice tous les 2 frames (amplifié)
    if(frame%2===0){
      powerBubbles.push({x:player.x+(Math.random()-.5)*40,y:player.y,r:0,maxR:80,life:45,type:'powerBubble'});
    }
    // Onde de choc toutes les 15 frames
    if(frame%15===0){
      powerBubbles.push({x:player.x,y:player.y,r:0,maxR:160,life:30,type:'shockwave'});
    }
    // 6 traînées cyan (amplifié)
    for(let i=0;i<6;i++){
      particles.push({x:player.x+(Math.random()-.5)*30,y:player.y+15+Math.random()*20,vx:(Math.random()-.5)*1.5,vy:4+Math.random()*3,life:0.45,dc:0.04,r:2+Math.random()*2,col:'#22d3ee'});
    }
    // Lignes warp
    for(let i=0;i<4;i++){
      particles.push({x:player.x+(Math.random()-.5)*60,y:player.y+Math.random()*40,vx:0,vy:6+Math.random()*4,life:0.3,dc:0.04,r:1,col:'#ffffff'});
    }
    if(frame%8===0){
      particles.push({x:player.x,y:player.y,ring:true,ringR:6,ringMax:55,life:1,dc:0.06,col:'#22d3ee',r:22});
    }
    if(frame>=duration){
      clearInterval(dash);
      player.y=H-80;player.invincible=false;player.powerMode=null;powerActive=false;powerBubbles=[];
      applyPostPowerShield();
    }
  },1000/60);
}
function powerSentinel(){
  const interval=40;let salves=0;const maxSalves=Math.floor(6*60/interval);
  const fire=setInterval(()=>{
    if(!powerActive||GS!=='playing'){clearInterval(fire);powerActive=false;return;}
    const targets=[...enemies].sort((a,b)=>Math.hypot(a.x-player.x,a.y-player.y)-Math.hypot(b.x-player.x,b.y-player.y)).slice(0,3);
    targets.forEach((t,i)=>{bullets.push({x:player.x+(i-1)*14,y:player.y-20,vx:0,vy:-6,col:'#9d4dff',f:1,type:'homing',target:t});});
    if(++salves>=maxSalves){clearInterval(fire);powerActive=false;applyPostPowerShield();}
  },interval*(1000/60));
}
function powerTitan(){
  const interval=8;let elapsed=0;const duration=6*60;
  const fire=setInterval(()=>{
    if(!powerActive||GS!=='playing'){clearInterval(fire);powerActive=false;return;}
    [-16,16].forEach(ox=>{bullets.push({x:player.x+ox,y:player.y-10,vx:ox*0.1,vy:-7,col:'#ff6b00',f:1,type:'bounce',bounceCount:0,maxBounce:3});});
    elapsed+=interval;
    if(elapsed>=duration){clearInterval(fire);powerActive=false;applyPostPowerShield();}
  },interval*(1000/60));
}
function applyPostPowerShield(){
  player.bonuses.shield=600; // ~10s de bouclier post-pouvoir
  floats.push({x:W/2,y:130,txt:'🛡 BOUCLIER POST-POUVOIR',col:'#4f4',life:1.8,vy:-0.3,big:true,outline:true});
}

// ── FIRE ───────────────────────────────────────────────────────────
function fireDefault(){
  const m=player.bonuses.multi>0;
  const shipCol=(chosenShip&&chosenShip.id==='sentinel')?'#9d4dff':'#ffe040';
  const col=m?'#0ff':shipCol;
  bullets.push({x:player.x-6,y:player.y-22,vx:0,vy:-12,col,f:1});
  bullets.push({x:player.x+6,y:player.y-22,vx:0,vy:-12,col,f:1});
  if(m){bullets.push({x:player.x,y:player.y-28,vx:0,vy:-13,col,f:1});bullets.push({x:player.x-10,y:player.y-18,vx:-2.2,vy:-11,col,f:1});bullets.push({x:player.x+10,y:player.y-18,vx:2.2,vy:-11,col,f:1});}
}
function fireMissile(){const ang=-Math.PI/2+(Math.random()-.5)*.3;bullets.push({x:player.x,y:player.y-26,vx:Math.cos(ang)*6,vy:Math.sin(ang)*6,col:'#88ff44',f:1,isMissile:true});}
function fireMinigun(){const sp=(Math.random()-.5)*1.8;bullets.push({x:player.x+sp*5,y:player.y-20,vx:sp*.6,vy:-9,col:'#ff8800',f:1,isMini:true});}

function bFire(){
  if(!boss)return;
  const dx=player.x-boss.x,dy=player.y-boss.y,dist=Math.hypot(dx,dy);
  const nx=dx/dist,ny=dy/dist,baseA=Math.atan2(ny,nx);
  // Vitesse des projectiles : monte avec le monde
  const spd=3.2+currentWorld*.35;
  // Nombre de projectiles : phase 1 = 4+, phase 2 = 6+ ; augmente avec le monde
  const count=boss.phase>=2
    ?(6+Math.floor(currentWorld*1.2))   // monde 1→6, monde 3→8, monde 5→10
    :(4+Math.floor(currentWorld*.5));   // monde 1→4, monde 3→5, monde 5→6
  // Dispersion régulière autour de la direction cible
  const spread=Math.PI/8;
  for(let i=0;i<count;i++){
    const a=baseA+(i-(count-1)/2)*spread;
    bullets.push({x:boss.x,y:boss.y+50,vx:Math.cos(a)*spd,vy:Math.sin(a)*spd,col:'#ff2200',f:0});
  }
}
function bombAll(){
  expl(W/2,H/2,'#f80',55,true);snd.bigE();
  enemies.forEach(e=>{score+=e.sc;fSc(e.x,e.y,e.sc,e.col);expl(e.x,e.y,e.col,20,true);});
  enemies=[];if(boss)boss.hp=Math.max(1,Math.floor(boss.hp*.45));
}

// ── SYSTÈME DE DIFFICULTÉ ──────────────────────────────────────────
const DIFF_SETTINGS={
  easy:{
    hpMult:    [0.8, 0.8, 0.8, 0.8, 0.8],
    spMult:    [0.7, 0.7, 0.7, 0.7, 0.7],
    bulletSpd: [1.0, 1.0, 1.0, 1.0, 1.0],
    maxE:      [5,   5,   5,   5,   5  ],
    spawnRate: [110, 110, 110, 110, 110],
    bossHp:    [60,  60,  60,  60,  60 ],
  },
  normal:{
    hpMult:    [1.0, 1.0, 1.0, 1.0, 1.0],
    spMult:    [1.0, 1.0, 1.0, 1.0, 1.0],
    bulletSpd: [1.4, 1.4, 1.4, 1.4, 1.4],
    maxE:      [8,   8,   8,   8,   8  ],
    spawnRate: [80,  80,  80,  80,  80 ],
    bossHp:    [150, 150, 150, 150, 150],
  },
  hard:{
    hpMult:    [1.2, 1.2, 1.2, 1.2, 1.2],
    spMult:    [1.3, 1.3, 1.3, 1.3, 1.3],
    bulletSpd: [1.8, 1.8, 1.8, 1.8, 1.8],
    maxE:      [10,  10,  10,  10,  10 ],
    spawnRate: [71,  71,  71,  71,  71 ],
    bossHp:    [200, 200, 200, 200, 200],
  },
};
function getDiff(){return DIFF_SETTINGS[difficulty]||DIFF_SETTINGS.normal;}
function getWaveLimit(){return(WORLD_WAVES[difficulty]||WORLD_WAVES.normal)[currentWorld];}

// ── ENEMY ──────────────────────────────────────────────────────────
function spawnEnemy(){
  const pool=['basic'];
  if(wave>=3||currentWorld>=1)pool.push('fast','zigzag');
  if(wave>=6||currentWorld>=2)pool.push('tank');
  if(wave>=4||currentWorld>=1)pool.push('hunter');
  const t=pool[Math.floor(Math.random()*pool.length)];
  const e={x:38+Math.random()*(W-76),y:-66,type:t,zigDir:Math.random()<.5?1:-1,zigT:0,flash:0};
  const df=getDiff();
  const sm=df.spMult[currentWorld]??df.spMult[df.spMult.length-1];
  const hm=df.hpMult[currentWorld]??df.hpMult[df.hpMult.length-1];
  if(t==='basic'){e.sp=1.0*sm;e.hp=Math.max(1,Math.round(1*hm));e.mhp=e.hp;e.sc=10;e.w=32;e.h=36;e.col='#f55';e.sr=300;e.st=Math.random()*150;}
  else if(t==='fast'){const _fsp={easy:1.26,normal:1.5,hard:1.8}[difficulty]||1.5;e.sp=_fsp;e.hp=1;e.mhp=1;e.sc=20;e.w=26;e.h=32;e.col='#fa0';e.sr=215;e.st=Math.random()*120;}
  else if(t==='tank'){e.sp=0.55*sm;e.hp=Math.max(2,Math.round(3*hm));e.mhp=e.hp;e.sc=50;e.w=46;e.h=50;e.col='#b06ef0';e.sr=260;e.st=Math.random()*130;}
  else if(t==='hunter'){e.sp=1.3*sm;e.hp=Math.max(1,Math.round(2*hm));e.mhp=e.hp;e.sc=35;e.w=28;e.h=34;e.col='#ff2288';e.sr=170;e.st=Math.random()*90;}
  else{e.sp=1.2*sm;e.hp=Math.max(1,Math.round(2*hm));e.mhp=e.hp;e.sc=30;e.w=34;e.h=36;e.col='#0ff';e.sr=155;e.st=Math.random()*75;}
  enemies.push(e);
}
function eShoot(e){
  const _d=getDiff();const spd=_d.bulletSpd[currentWorld]??_d.bulletSpd[_d.bulletSpd.length-1];
  if(e.type==='grid')   bullets.push({x:e.x,y:e.y+12,vx:0,vy:spd,col:'#ff4444',f:0});
  else if(e.type==='basic')  bullets.push({x:e.x,y:e.y+20,vx:0,vy:spd,col:'#ff2200',f:0});
  else if(e.type==='fast')  bullets.push({x:e.x,y:e.y,vx:0,vy:spd,col:'#ffcc00',f:0});
  else if(e.type==='tank')  [-1.4,0,1.4].forEach(ox=>bullets.push({x:e.x,y:e.y+22,vx:ox,vy:spd,col:'#dd00ff',f:0}));
  else if(e.type==='hunter'){
    bullets.push({x:e.x,y:e.y,vx:0,vy:spd,col:'#ff0066',f:0});
    bullets.push({x:e.x,y:e.y,vx:-0.8,vy:spd,col:'#ff44aa',f:0});
    bullets.push({x:e.x,y:e.y,vx:0.8,vy:spd,col:'#ff44aa',f:0});
  }
  else bullets.push({x:e.x,y:e.y,vx:0,vy:spd,col:'#00ffee',f:0});
}
function spawnGridFormation(){
  const cols=7,rows=3,spacingX=W/(cols+1),spacingY=38,startY=-120,groupVy=2.2;
  const group={vy:groupVy,active:true};
  const hm=getDiff().hpMult[currentWorld]??1;
  const maxFire=difficulty==='easy'?3:Infinity; // facile : 3 tireurs max
  let fireCount=0;
  for(let row=0;row<rows;row++){
    for(let col=0;col<cols;col++){
      const idx=row*cols+col;
      const cf=idx%3===0&&fireCount<maxFire;
      if(cf)fireCount++;
      enemies.push({type:'grid',x:spacingX*(col+1),y:startY-row*spacingY,sp:groupVy,
        vx:0,vy:groupVy,hp:Math.max(1,Math.floor(3*hm)),mhp:Math.max(1,Math.floor(3*hm)),
        sc:80,w:22,h:22,group,isGrid:true,canFire:cf,
        sr:cf?200:0,st:60+col*14,flash:0,zigDir:1,zigT:0});
    }
  }
}
function spawnBoss(){
  const df=getDiff();const mhp=df.bossHp[currentWorld]??df.bossHp[df.bossHp.length-1];
  boss={x:W/2,y:-95,tY:118,hp:mhp,mhp,sp:.9,dir:1,phase:1,ft:0,sc:500+wave*200};
  bSpawned=true;bDefeated=false;bbTimer=0;
  BBel.style.display='flex';BNel.textContent=`⚠ BOSS — VAGUE ${wave}`;BBIel.style.width='100%';
  playTrack('boss');
}
function bossDefeatedFn(){
  score+=boss.sc;fSc(boss.x,boss.y,boss.sc,'#f80');
  expl(boss.x,boss.y,'#f44',72,true);expl(boss.x-26,boss.y-12,'#f80',36,true);expl(boss.x+26,boss.y+12,'#ff0',36,true);
  snd.bigE();snd.win();
  // SUPERNOVA — vie bonus automatique (pas de collectible : évite la perte lors de la transition)
  setTimeout(()=>{
    lives++;
    expl(player.x,player.y,'#ffe040',30,true);
    snd.win();
    score+=500;
    fSc(player.x,player.y-20,500,'#ffe040');
    logB('supernova');
  },600);
  bDefeated=true;boss=null;BBel.style.display='none';bSpawned=false;bbTimer=0;
  // Bouclier de 3 secondes offert automatiquement après la mort du boss
  if(player){player.bonuses.shield=180;logB('shield');}
  // Reprend la musique de la map 2s après la mort du boss (laisse la fanfare snd.win() finir)
  setTimeout(()=>playTrack('map'+currentWorld), 2000);
  checkCampaignObjective();
  advanceWave();
}
function advanceWave(){
  wave++; wTimer=0; score+=wave*50;
  if(wave>0 && wave%5===0 && wave%10!==0) spawnGridFormation();

  // Vérification objectif campagne
  if(campaignMode){
    checkCampaignObjective();
    return; // stoppe tout le reste — campagne gère sa propre fin
  }

  // Mode normal — vérification limite de vagues
  const wLimit = getWaveLimit();
  if(wLimit !== Infinity && wave > wLimit){
    if(currentWorld < MAPS.length - 1){ showWorldTransition(); }
    else { showVictory(); }
  }
}

function showWorldTransition(){
  GS='transition';cancelAnimationFrame(RAF);
  currentWorld++;
  chosenMap=MAPS[currentWorld];
  wave=1;wTimer=0;eTimer=0;fTimer=0;
  enemies=[];bonuses=[];bullets=[];particles=[];floats=[];powerBubbles=[];
  bSpawned=false;bDefeated=true;boss=null;rouletteQueued=false;rouletteDelay=0;
  BBel.style.display='none';
  combo=0;comboTimer=0;shakeAmt=0;shakeDur=0;shakeX=0;shakeY=0;squadTimer=0;
  powerBar=0;powerActive=false;powerUsedCount=0;powerFragsSpawned=0;
  // Réinitialiser l'arme du joueur au défaut
  if(player){player.weapon='default';player.wTimer=0;player.bonuses={rapid:0,multi:0,shield:0,speed:0};}
  // Cacher le bouton pause pendant la transition
  const pb=document.getElementById('pbtn');if(pb)pb.style.display='none';
  initBg();
  initStars();
  snd.win&&snd.win();
  OVel.innerHTML=`
    <div class="scan"></div>
    <div style="text-align:center;width:100%;padding:40px 44px;display:flex;flex-direction:column;align-items:center;gap:30px;">

      <div class="title" style="font-size:34px;color:#44ff88;text-shadow:0 0 22px rgba(60,255,130,.75),0 2px 0 #004422;letter-spacing:10px;">SECTEUR LIBÉRÉ !</div>

      <div style="width:340px;height:1px;background:linear-gradient(90deg,transparent,rgba(80,255,150,.55),transparent);"></div>

      <div style="font-family:'Courier New',monospace;font-size:12px;letter-spacing:9px;color:#c8deff;text-transform:uppercase;">— Prochain secteur —</div>

      <div style="display:flex;flex-direction:column;align-items:center;gap:14px;">
        <div style="font-family:'Courier New',monospace;font-size:20px;color:#ffd87a;letter-spacing:10px;">${chosenMap.name}</div>
        <div style="font-family:'Courier New',monospace;font-size:12px;color:#a8ccff;letter-spacing:6px;text-transform:uppercase;">${chosenMap.tag}</div>
      </div>

      <div style="font-family:'Courier New',monospace;font-size:12px;color:#b8d0ec;line-height:2.2;max-width:360px;letter-spacing:2px;">${chosenMap.desc}</div>

      <div style="font-family:'Courier New',monospace;font-size:13px;color:#ffd87a;letter-spacing:4px;background:rgba(255,216,122,.08);padding:14px 32px;border-radius:2px;border:1px solid rgba(255,216,122,.22);">SECTEUR ${currentWorld+1} / ${MAPS.length}${getWaveLimit()===Infinity?' &nbsp;·&nbsp; VAGUES INFINIES':' &nbsp;·&nbsp; '+getWaveLimit()+' VAGUES'}</div>

      <button class="sb" id="btnW" style="min-width:260px;">→ ENTRER DANS LE SECTEUR</button>

    </div>`;
  OVel.style.display='flex';
  document.getElementById('btnW').onclick=()=>{
    OVel.style.display='none';
    const pb2=document.getElementById('pbtn');if(pb2)pb2.style.display='block';
    playTrack('map'+currentWorld);
    GS='playing';RAF=requestAnimationFrame(loop);
  };
}

function showVictory(){
  GS='victory';cancelAnimationFrame(RAF);snd.win&&snd.win();playTrack('victory');
  OVel.innerHTML=`
    <div class="scan"></div>
    <div class="title" style="font-size:44px;color:#ffd87a;animation:titleGlow 2s ease-in-out infinite;">VICTOIRE</div>
    <div class="subtitle" style="color:#4f4;letter-spacing:6px;">TOUS LES SECTEURS LIBÉRÉS</div>
    <div style="height:8px;"></div>
    <div style="font-family:'Courier New',monospace;font-size:28px;color:#ffd87a;letter-spacing:4px;">${score.toLocaleString()}</div>
    <div style="font-size:11px;color:#7a98c4;letter-spacing:3px;">5 SECTEURS · 125 VAGUES · <b style="color:#fff4b8;">${chosenShip.name}</b></div>
    <div style="height:10px;"></div>
    <div style="display:flex;gap:10px;">
      <button class="sb alt" id="brp">↻ REJOUER</button>
      <button class="sb alt" id="bmn">← MENU</button>
    </div>`;
  OVel.style.display='flex';startMenuBg();
  document.getElementById('brp').onclick=()=>{saveScore(score,wave,chosenShip.name,chosenMap.name,'VICTOR',currentWorld+1);startGame();};
  document.getElementById('bmn').onclick=()=>{saveScore(score,wave,chosenShip.name,chosenMap.name,'VICTOR',currentWorld+1);showMenu();};
}

// ── LASER ──────────────────────────────────────────────────────────
function processLaser(){
  laserT++;if(laserT<6)return;laserT=0;
  const bx=player.x,bw=14;
  for(let j=enemies.length-1;j>=0;j--){
    const e=enemies[j];
    if(Math.abs(e.x-bx)<bw+e.w/2&&e.y<player.y){
      e.hp=0;spark(e.x,e.y,'#ff44ff');e.flash=8;
      if(e.hp<=0){killScore(e.x,e.y,e.sc,e.col);expl(e.x,e.y,e.col,20,true);snd.expl();playEnemyKill();spawnBonus(e.x,e.y);trySpawnPowerFrag(e.x,e.y);enemies.splice(j,1);}break;
    }
  }
  if(boss&&!bDefeated&&Math.abs(boss.x-bx)<bw+52){
    boss.hp-=3;spark(boss.x,boss.y,'#ff44ff');if(boss.hp<=0)bossDefeatedFn();
  }
}

// ── ROULETTE ───────────────────────────────────────────────────────
function showRoulette(){
  GS='roulette';
  const ITEM_H=70;
  const reelsEl=document.getElementById('reels-el'),rresEl=document.getElementById('rres'),rbtnEl=document.getElementById('btn-roul');
  document.getElementById('rwave').textContent=`Vague ${wave} — Nouvelle arme disponible !`;
  reelsEl.innerHTML='';rresEl.textContent='— SPIN EN COURS —';rresEl.style.color='#aaa';rresEl.style.fontSize='14px';rbtnEl.style.display='none';
  ROVel.style.display='flex';
  function pickW(){const r=Math.random();return r<.4?'missile':r<.8?'minigun':'laser';}
  const results=[pickW(),pickW(),pickW()];
  const reelDatas=[];
  for(let ri=0;ri<3;ri++){
    const rw=document.createElement('div');rw.className='reel-wrap';
    const hl=document.createElement('div');hl.className='reel-hl';rw.appendChild(hl);
    const strip=document.createElement('div');strip.className='reel-strip';
    const items=[];for(let rep=0;rep<8;rep++)WPOOL.forEach(w=>items.push(w));
    items.forEach(w=>{const wp=WP[w],cell=document.createElement('div');cell.className='reel-item';cell.innerHTML=`<span style="font-size:26px">${wp.icon}</span><span style="color:${wp.col}">${wp.name}</span>`;strip.appendChild(cell);});
    rw.appendChild(strip);reelsEl.appendChild(rw);
    const startPos=(20+Math.floor(Math.random()*WPOOL.length))*ITEM_H;
    strip.style.transform=`translateY(-${startPos}px)`;
    reelDatas.push({strip,items,pos:startPos,speed:9,stopped:false,result:results[ri]});
  }
  let animId;
  function animR(){reelDatas.forEach(r=>{if(!r.stopped){r.pos+=r.speed;if(r.pos>(r.items.length-3)*ITEM_H)r.pos=ITEM_H*15;r.strip.style.transform=`translateY(-${r.pos}px)`;}});if(reelDatas.some(r=>!r.stopped))animId=requestAnimationFrame(animR);}
  animId=requestAnimationFrame(animR);
  function stopReel(ri){
    cancelAnimationFrame(animId);const r=reelDatas[ri];
    const curCenter=Math.floor(r.pos/ITEM_H)+1;let targetIdx=curCenter;
    for(let k=curCenter+2;k<curCenter+r.items.length;k++){if(r.items[k%r.items.length]===r.result){targetIdx=k;break;}}
    const targetPos=(targetIdx-1)*ITEM_H;r.speed=0;r.stopped=true;
    r.strip.style.transition='transform .45s cubic-bezier(.17,.67,.3,1)';r.strip.style.transform=`translateY(-${targetPos}px)`;r.pos=targetPos;
    snd.ding();if(reelDatas.some(r2=>!r2.stopped))animId=requestAnimationFrame(animR);
    if(reelDatas.every(r2=>r2.stopped)){
      const finalW=results[1];const wp=WP[finalW];
      setTimeout(()=>{
        rresEl.textContent=`🎰 ARME OBTENUE : ${wp.icon} ${wp.name} !`;rresEl.style.color=wp.col;rresEl.style.fontSize='15px';
        rbtnEl.style.display='block';rbtnEl.onclick=()=>{ROVel.style.display='none';player.weapon=finalW;player.wTimer=5*60;GS='playing';RAF=requestAnimationFrame(loop);};
      },400);
    }
  }
  setTimeout(()=>stopReel(0),1400);setTimeout(()=>stopReel(1),2500);setTimeout(()=>stopReel(2),3500);
}

// ── UPDATE ─────────────────────────────────────────────────────────
function update(){
  FN++;
  if(mpMode&&FN%120===0)mpSendScore();
  if(comboTimer>0){comboTimer--;if(comboTimer===0)combo=0;}
  if(rouletteQueued){rouletteDelay--;if(rouletteDelay<=0){rouletteQueued=false;showRoulette();return;}}
  if(player.weapon!=='default'&&player.wTimer>0){player.wTimer--;if(player.wTimer===0)player.weapon='default';}
  if(player.iframes>0)player.iframes--;

  const spd=player.speed*sensitivity+(player.bonuses.speed>0?1.5:0);
  if((keys['ArrowLeft']||keys['a']||keys['A']||keys['q']||keys['Q'])&&player.x-22>0)player.x-=spd;
  if((keys['ArrowRight']||keys['d']||keys['D'])&&player.x+22<W)player.x+=spd;
  // Mouvement vertical avec inertie marquée : haut = boost, bas = freinage
  const upK=keys['ArrowUp']||keys['w']||keys['W']||keys['z']||keys['Z'];
  const dnK=keys['ArrowDown']||keys['s']||keys['S'];
  if(upK)player.vy-=.55;
  else if(dnK)player.vy+=.45;
  else player.vy*=.93;
  player.vy=Math.max(-spd*1.6,Math.min(spd*1.2,player.vy));
  player.y+=player.vy;
  if(player.y<60){player.y=60;player.vy=0;}
  if(player.y>H-32){player.y=H-32;player.vy=0;}
  // Mouvement mobile via joystick virtuel
  if(isMobile&&joystick.active){
    player.x=Math.max(22,Math.min(W-22,player.x+joystick.dx*spd*1.4));
    player.y=Math.max(60,Math.min(H-32,player.y+joystick.dy*spd*1.4));
    player.vy=0; // annule l'inertie clavier quand le joystick est actif
  }
  // ── GAMEPAD ───────────────────────────────────────────────────────
  if(gpIndex!==null){
    const gp=navigator.getGamepads()[gpIndex];
    if(gp){
      const dead=0.15;
      // Stick gauche (axes 0/1) ou stick droit (axes 2/3) → mouvement
      const ax0=gp.axes[0]??0, ay0=gp.axes[1]??0;
      const ax2=gp.axes[2]??0, ay2=gp.axes[3]??0;
      const ax=Math.abs(ax0)>dead?ax0:(Math.abs(ax2)>dead?ax2:0);
      const ay=Math.abs(ay0)>dead?ay0:(Math.abs(ay2)>dead?ay2:0);
      // D-pad (boutons 12-15) en complément des sticks
      const dpL=!!(gp.buttons[14]?.pressed), dpR=!!(gp.buttons[15]?.pressed);
      const dpU=!!(gp.buttons[12]?.pressed), dpD=!!(gp.buttons[13]?.pressed);
      const mx=ax!==0?ax:(dpL?-1:dpR?1:0);
      const my=ay!==0?ay:(dpU?-1:dpD?1:0);
      if(mx!==0)player.x=Math.max(22,Math.min(W-22,player.x+mx*spd*1.4));
      if(my!==0){player.y=Math.max(60,Math.min(H-32,player.y+my*spd*1.4));player.vy=0;}
      // RT (axe 5 ou bouton 7) → tir ; bouton A (0) = tir aussi
      gpRT=((gp.axes[5]??-1)>0.1)||!!(gp.buttons[7]?.pressed)||!!(gp.buttons[0]?.pressed);
      // Bouton START (9) → pause
      const startNow=!!(gp.buttons[9]?.pressed);
      if(startNow&&!gpStart){if(GS==='playing'||GS==='pause')togglePause();}
      gpStart=startNow;
    }else{gpRT=false;gpStart=false;}
  }else{gpRT=false;}
  // Parallax piloté par les ennemis : leur vitesse moyenne donne le défilement
  // Parallaxe fixe — même vitesse sur toutes les maps et tous les modes
  parallaxOffset=1.0;

  const baseFr=player.fireRate||18;
  const frMap={default:player.bonuses.rapid>0?Math.max(6,baseFr-10):baseFr,missile:30,minigun:3,laser:9999};
  const fr=frMap[player.weapon]||baseFr;
  if(fTimer<fr)fTimer++;
  if(fTimer>=fr){
    if(player.weapon==='default')fireDefault();
    else if(player.weapon==='missile')fireMissile();
    else if(player.weapon==='minigun')fireMinigun();
    fTimer=0;
  }
  if(player.weapon==='laser')processLaser();
  for(const k in player.bonuses)if(player.bonuses[k]>0)player.bonuses[k]--;

  stars.forEach(s=>{s.y+=s.sp*(1.2+parallaxOffset*3.0);if(s.y>H){s.y=0;s.x=Math.random()*W;}});
  updBg();

  const _df=getDiff();const maxE=_df.maxE[currentWorld]??_df.maxE[_df.maxE.length-1];const sr=_df.spawnRate[currentWorld]??_df.spawnRate[_df.spawnRate.length-1];
  isBW=wave>0&&wave%10===0;
  if(!boss||bDefeated){
    if(enemies.length<maxE&&eTimer++>=sr){spawnEnemy();eTimer=0;}
    // Squad : formation de 3 vaisseaux foncant tout droit
    if(wave>=3||currentWorld>=1){
      squadTimer++;
      const sqInterval=Math.max(260,400-wave*12-currentWorld*30);
      if(squadTimer>=sqInterval&&!enemies.some(e=>e.type==='squad')){spawnSquad();squadTimer=0;}
    }
  }

  enemies.forEach(e=>{
    if(e.isGrid){e.y+=e.group.vy;}else{e.y+=e.sp;}
    if(e.type==='zigzag'){if(e.sp<7.5)e.sp+=.004;e.zigT++;if(e.zigT%54===0)e.zigDir*=-1;e.x+=e.zigDir*2.5;}
    if(e.type==='hunter'&&e.y>0){const hx=player.x-e.x;e.x+=Math.sign(hx)*Math.min(Math.abs(hx)*.042,e.sp*.55);}
    if(e.flash>0)e.flash--;
    if(!e.isGrid)e.x=Math.max(22,Math.min(W-22,e.x));
    if(!(e.isGrid&&!e.canFire)){e.st++;if(e.st>=e.sr&&e.y>20&&e.y<H-55){eShoot(e);e.st=0;}}
  });

  if(boss&&!bDefeated){
    if(boss.y<boss.tY)boss.y+=1.9;
    boss.x+=boss.sp*boss.dir;if(boss.x>W-66||boss.x<66)boss.dir*=-1;
    if(boss.hp<boss.mhp*.4&&boss.phase===1){boss.phase=2;boss.sp=1.4;expl(boss.x,boss.y,'#f44',38,true);snd.bigE();}
    const fi=boss.phase>=2?Math.max(50,95-currentWorld*10):Math.max(88,150-currentWorld*12);if(boss.ft++>=fi){bFire();boss.ft=0;}
    if(boss.hp!==boss._lastHp){boss._lastHp=boss.hp;const _r=boss.hp/boss.mhp;BBIel.style.width=(_r*100)+'%';BBIel.style.background=_r>.5?'#f44':_r>.25?'#fa0':'#ff0';}
    bbTimer++;const bI=Math.max(160,280-wave*12);
    if(bbTimer>=bI){spawnBonus(50+Math.random()*(W-100),-18,1);bbTimer=0;}
  }

  bullets.forEach(b=>{
    b.x+=b.vx;b.y+=b.vy;
    // Traînée de particules pour les tirs ennemis
    if(!b.f){
      particles.push({x:b.x+(Math.random()-.5)*3,y:b.y+(Math.random()-.5)*3,
        vx:(Math.random()-.5)*.6,vy:(Math.random()-.5)*.6,
        life:.55,dc:.10,r:2.5+Math.random()*1.5,col:b.col});
    }
    if(b.isMissile&&!b.dead&&(enemies.length>0||(boss&&!bDefeated))){
      let best=null,bestD=Infinity;
      enemies.forEach(e=>{const d=Math.hypot(e.x-b.x,e.y-b.y);if(d<bestD){bestD=d;best={x:e.x,y:e.y};}});
      if(boss&&!bDefeated){const d=Math.hypot(boss.x-b.x,boss.y-b.y);if(d<bestD){bestD=d;best={x:boss.x,y:boss.y};}}
      if(best){const ta=Math.atan2(best.y-b.y,best.x-b.x),ca=Math.atan2(b.vy,b.vx);let da=ta-ca;while(da>Math.PI)da-=Math.PI*2;while(da<-Math.PI)da+=Math.PI*2;const na=ca+Math.sign(da)*Math.min(Math.abs(da),.12);const sp=Math.hypot(b.vx,b.vy);b.vx=Math.cos(na)*sp;b.vy=Math.sin(na)*sp;}
    }
    if(b.type==='homing'&&b.target&&enemies.includes(b.target)){
      const dx=b.target.x-b.x,dy=b.target.y-b.y,dist=Math.hypot(dx,dy)||1;
      b.vx+=(dx/dist)*0.8;b.vy+=(dy/dist)*0.8;
      const spd=Math.hypot(b.vx,b.vy);if(spd>8){b.vx=b.vx/spd*8;b.vy=b.vy/spd*8;}
    }
  });
  bullets=bullets.filter(b=>!b.dead&&b.y>-42&&b.y<H+42&&b.x>-42&&b.x<W+42);

  for(let i=bullets.length-1;i>=0;i--){
    const b=bullets[i];if(!b.f)continue;let hit=false;
    if(boss&&!bDefeated&&Math.abs(b.x-boss.x)<53&&Math.abs(b.y-boss.y)<49){
      const dmg=b.isMissile?3:b.type==='homing'?2:1;boss.hp-=dmg;hit=true;spark(b.x,b.y,'#f88');shake(3,5);if(boss.hp<=0)bossDefeatedFn();
    }
    if(!hit){
      for(let j=enemies.length-1;j>=0;j--){
        const e=enemies[j];
        if(Math.abs(b.x-e.x)<e.w*.45&&Math.abs(b.y-e.y)<e.h*.45){
          const isBonus=b.isMissile||b.isMini||b.type==='homing'||b.type==='bounce';
          if(e.isGrid||isBonus){e.hp=0;}else{e.hp-=1;}
          spark(b.x,b.y,b.col||e.col);e.flash=8;
          if(e.hp<=0){killScore(e.x,e.y,e.sc,e.col);expl(e.x,e.y,e.col,20,true);snd.expl();playEnemyKill();spawnBonus(e.x,e.y);trySpawnPowerFrag(e.x,e.y);enemies.splice(j,1);}
          if(b.type==='bounce'&&b.bounceCount<b.maxBounce){
            const pool=enemies.filter(en=>en!==e);
            const next=pool.sort((a,c)=>Math.hypot(a.x-b.x,a.y-b.y)-Math.hypot(c.x-b.x,c.y-b.y))[0];
            if(next){const ddx=next.x-b.x,ddy=next.y-b.y,d=Math.hypot(ddx,ddy)||1;b.vx=(ddx/d)*7;b.vy=(ddy/d)*7;b.bounceCount++;}
            else hit=true;
          } else {hit=true;}
          break;
        }
      }
    }
    if(hit)bullets.splice(i,1);
  }

  for(let i=bullets.length-1;i>=0;i--){
    const b=bullets[i];if(b.f)continue;
    if(Math.abs(b.x-player.x)<20&&Math.abs(b.y-player.y)<26){bullets.splice(i,1);if(dmgPlayer())return;}
  }
  for(let j=enemies.length-1;j>=0;j--){
    const e=enemies[j];if(e.y>H+42){enemies.splice(j,1);continue;}
    if(Math.abs(e.x-player.x)<24&&Math.abs(e.y-player.y)<28){expl(e.x,e.y,e.col,22,true);snd.expl();enemies.splice(j,1);if(dmgPlayer())return;}
  }
  if(boss&&!bDefeated&&Math.abs(boss.x-player.x)<38&&Math.abs(boss.y-player.y)<54){if(dmgPlayer())return;}

  bonuses.forEach(b=>{b.y+=b.sp;b.pulse=(b.pulse+.09)%(Math.PI*2);});
  for(let i=bonuses.length-1;i>=0;i--){
    const b=bonuses[i];if(b.y>H+22){bonuses.splice(i,1);continue;}
    if(b.type==='powerfrag'&&Math.abs(b.x-player.x)<24&&Math.abs(b.y-player.y)<24){
      powerBar=Math.min(1,powerBar+1/FRAGS_NEEDED);snd.bonus();
      floats.push({x:player.x,y:player.y-30,val:'⚡ FRAGMENT',col:b.color,life:1,vy:-1.8,big:true});
      expl(b.x,b.y,b.color,14,false);bonuses.splice(i,1);
      if(powerBar>=1)activatePower();
      continue;
    }
    if(Math.abs(b.x-player.x)<24&&Math.abs(b.y-player.y)<24){
      logB(b.type);snd.bonus();const def=BD.find(x=>x.type===b.type);
      // affiche le nom du bonus collecté au centre
      if(def)floats.push({x:W/2,y:H-85,val:def.label,col:def.color,life:1.3,vy:-0.2,big:true,outline:true});
      if(b.type==='bomb')bombAll();
      else if(def.super){
        // Bonus du boss : vie supplémentaire
        lives++;expl(player.x,player.y,'#ffe040',30,true);
        snd.win();score+=500;fSc(player.x,player.y-20,500,'#ffe040');
      }
      else if(def.weapon){player.weapon=def.weapon;player.wTimer=def.dur;}
      else player.bonuses[b.type]=def.dur;
      expl(b.x,b.y,b.color,b.super?40:14,b.super);bonuses.splice(i,1);
    }
  }
  floats.forEach(f=>{if(f.fixed){if(f.t>0)f.t--;else f.life=0;}else{f.y+=f.vy;f.life-=.018;}});floats=floats.filter(f=>f.life>0);
  particles.forEach(p=>{if(p.ring){p.ringR=Math.min(p.ringMax,p.ringR+4);}else{p.x+=p.vx;p.y+=p.vy;p.vx*=.93;p.vy*=.93;}p.life-=p.dc;});
  particles=particles.filter(p=>p.life>0);
  // ── Bulles pouvoir Raptor ──────────────────────────────────────────
  powerBubbles.forEach(b=>{
    b.r+=b.maxR/b.life;b.life--;
    enemies=enemies.filter(e=>{
      if(Math.hypot(e.x-b.x,e.y-b.y)<b.r+16){
        killScore(e.x,e.y,e.sc||50,'#22d3ee');expl(e.x,e.y,'#22d3ee',8,false);playEnemyKill();return false;
      }
      return true;
    });
  });
  powerBubbles=powerBubbles.filter(b=>b.life>0);

  wTimer++;
  if(isBW){if(bDefeated&&!bSpawned&&!rouletteQueued&&wTimer>100)spawnBoss();}
  else{const wEnd=600;if(!rouletteQueued&&wTimer>wEnd)advanceWave();}
}

// ── DRAW ───────────────────────────────────────────────────────────
function draw(){
  ctx.shadowBlur=0;ctx.shadowColor='transparent';ctx.globalAlpha=1;
  ctx.setTransform(1,0,0,1,0,0);
  // ── screen shake ────────────────────────────────────────────────
  if(shakeDur>0){shakeDur--;shakeX=(Math.random()-.5)*shakeAmt;shakeY=(Math.random()-.5)*shakeAmt;shakeAmt*=.85;}else{shakeX=0;shakeY=0;}
  ctx.save();if(shakeX||shakeY)ctx.translate(Math.round(shakeX),Math.round(shakeY));
  ctx.fillStyle='#00020f';ctx.fillRect(0,0,W,H);
  drawBg();
  stars.forEach(s=>{ctx.fillStyle=s.col;ctx.globalAlpha=.28+s.b*.72;ctx.fillRect(s.x,s.y,s.s,s.s);ctx.globalAlpha=1;});

  if(player.weapon==='laser'){
    let beamTop=44;const bx=player.x,bw=14;
    enemies.forEach(e=>{if(Math.abs(e.x-bx)<bw+e.w/2&&e.y<player.y&&e.y>beamTop)beamTop=e.y;});
    if(boss&&!bDefeated&&Math.abs(boss.x-bx)<bw+52)beamTop=Math.max(beamTop,boss.y);
    ctx.save();ctx.globalAlpha=.55+Math.sin(FN*.3)*.25;ctx.shadowBlur=22;ctx.shadowColor='#ff44ff';
    ctx.strokeStyle='rgba(255,170,255,.65)';ctx.lineWidth=10;ctx.beginPath();ctx.moveTo(bx,player.y-28);ctx.lineTo(bx,beamTop);ctx.stroke();
    ctx.strokeStyle='#fff';ctx.lineWidth=3;ctx.shadowBlur=10;ctx.shadowColor='#ff88ff';ctx.beginPath();ctx.moveTo(bx,player.y-28);ctx.lineTo(bx,beamTop);ctx.stroke();
    ctx.restore();
  }

  particles.forEach(p=>{ctx.save();ctx.globalAlpha=Math.max(0,p.life);if(p.ring){ctx.strokeStyle=p.col;ctx.lineWidth=2+p.life*2.5;ctx.shadowBlur=16;ctx.shadowColor=p.col;ctx.beginPath();ctx.arc(p.x,p.y,p.ringR,0,Math.PI*2);ctx.stroke();}else{ctx.fillStyle=p.col;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill();}ctx.restore();});
  bonuses.forEach(b=>{
    ctx.save();
    if(b.type==='powerfrag'){
      const cfg=getPwCfg(b.shipKey);
      const t=Date.now();
      const pulse=0.7+0.3*Math.sin(t*0.008);
      const spin=(t*0.003)%(Math.PI*2);
      ctx.save();
      ctx.translate(b.x,b.y);
      ctx.rotate(spin);
      // Halo extérieur large
      ctx.shadowColor=cfg.glow;
      ctx.shadowBlur=40*pulse;
      // Anneau de lumière externe
      ctx.beginPath();ctx.arc(0,0,20,0,Math.PI*2);
      ctx.strokeStyle=cfg.col+'66';ctx.lineWidth=2*pulse;ctx.stroke();
      ctx.shadowBlur=0;
      // Étoile à 6 branches — opaque et lumineuse
      ctx.shadowColor=cfg.glow;ctx.shadowBlur=30*pulse;
      ctx.beginPath();
      for(let i=0;i<6;i++){
        const angle=(i*Math.PI/3);
        const r1=14,r2=6;
        ctx.lineTo(Math.cos(angle)*r1,Math.sin(angle)*r1);
        ctx.lineTo(Math.cos(angle+Math.PI/6)*r2,Math.sin(angle+Math.PI/6)*r2);
      }
      ctx.closePath();
      ctx.fillStyle=cfg.col+'dd';ctx.fill();
      ctx.strokeStyle='#ffffff';ctx.lineWidth=1.5;ctx.stroke();
      ctx.shadowBlur=0;
      // Reflet blanc brillant sur l'étoile
      ctx.beginPath();
      for(let i=0;i<6;i++){
        const angle=(i*Math.PI/3);
        ctx.lineTo(Math.cos(angle)*8,Math.sin(angle)*8);
        ctx.lineTo(Math.cos(angle+Math.PI/6)*3,Math.sin(angle+Math.PI/6)*3);
      }
      ctx.closePath();
      ctx.fillStyle='rgba(255,255,255,0.35)';ctx.fill();
      // Carré intérieur contra-rotatif
      ctx.rotate(-spin*2);
      ctx.shadowColor='#fff';ctx.shadowBlur=12;
      ctx.beginPath();ctx.rect(-5,-5,10,10);
      ctx.fillStyle=cfg.col;ctx.fill();
      ctx.strokeStyle='rgba(255,255,255,0.8)';ctx.lineWidth=1;ctx.stroke();
      ctx.shadowBlur=0;
      // Point central blanc éclatant
      ctx.beginPath();ctx.arc(0,0,3,0,Math.PI*2);
      ctx.fillStyle='#ffffff';ctx.shadowColor='#fff';ctx.shadowBlur=10;ctx.fill();
      ctx.shadowBlur=0;
      // Orbite pointillée
      ctx.rotate(spin);
      ctx.setLineDash([3,5]);
      ctx.beginPath();ctx.arc(0,0,17,0,Math.PI*2);
      ctx.strokeStyle=cfg.col+'bb';ctx.lineWidth=1.2;ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();return;
    }
    if(b.super){
      // halo doré pulsant
      const gp=ctx.createRadialGradient(b.x,b.y,4,b.x,b.y,28+Math.sin(b.pulse)*5);
      gp.addColorStop(0,'rgba(255,240,120,.7)');gp.addColorStop(.5,'rgba(255,180,60,.3)');gp.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle=gp;ctx.beginPath();ctx.arc(b.x,b.y,32,0,Math.PI*2);ctx.fill();
      // étoile dorée
      ctx.shadowBlur=14;ctx.shadowColor='#ffe040';ctx.fillStyle='#ffe040';
      ctx.beginPath();for(let k=0;k<10;k++){const ang=k*Math.PI/5-Math.PI/2,r=k%2?6:14;ctx.lineTo(b.x+Math.cos(ang)*r,b.y+Math.sin(ang)*r);}ctx.closePath();ctx.fill();
      ctx.restore();return;
    }
    ctx.shadowBlur=22+Math.sin(b.pulse)*10;ctx.shadowColor=b.color;
    const br=b.r+Math.sin(b.pulse)*3;
    // outer halo ring
    ctx.strokeStyle=b.color;ctx.lineWidth=1.5;ctx.globalAlpha=.3+Math.sin(b.pulse)*.2;
    ctx.beginPath();ctx.arc(b.x,b.y,br+9,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1;
    // body
    ctx.fillStyle='rgba(0,0,0,.72)';ctx.strokeStyle=b.color;ctx.lineWidth=2.5;
    ctx.beginPath();ctx.arc(b.x,b.y,br,0,Math.PI*2);ctx.fill();ctx.stroke();
    // icon
    ctx.fillStyle=b.color;ctx.font='bold 14px "Courier New"';ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText({rapid:'⚡',multi:'✦',shield:'🛡',speed:'»',bomb:'💥',wMissile:'🚀',wMinigun:'🔫',wLaser:'🔮'}[b.type]||'?',b.x,b.y);
    // label tag above bonus
    const bDef=BD.find(x=>x.type===b.type);
    if(bDef){
      const lbl=bDef.label;ctx.shadowBlur=8;ctx.shadowColor=b.color;
      ctx.font='bold 11px "Courier New"';
      const tw=ctx.measureText(lbl).width;
      ctx.fillStyle='rgba(0,0,0,.78)';ctx.fillRect(b.x-tw/2-4,b.y-br-20,tw+8,14);
      ctx.strokeStyle=b.color;ctx.lineWidth=1;ctx.strokeRect(b.x-tw/2-4,b.y-br-20,tw+8,14);
      ctx.fillStyle=b.color;ctx.textAlign='center';ctx.textBaseline='middle';
      ctx.fillText(lbl,b.x,b.y-br-13);
    }
    ctx.restore();
  });
  enemies.forEach(e=>{
    if(e.type==='basic')dEB(e.x,e.y);
    else if(e.type==='fast')dEF(e.x,e.y);
    else if(e.type==='tank')dET(e.x,e.y,e.hp/e.mhp);
    else if(e.type==='hunter')dEH(e.x,e.y,e.hp,e.mhp);
    else if(e.type==='squad')dESQ(e.x,e.y);
    else if(e.type==='grid'){
      const gx=e.x,gy=e.y;
      ctx.save();
      ctx.strokeStyle='#ff4444';ctx.lineWidth=1.5;
      // Corps hexagonal
      ctx.beginPath();ctx.moveTo(gx,gy-14);ctx.lineTo(gx+10,gy-6);ctx.lineTo(gx+10,gy+6);ctx.lineTo(gx,gy+14);ctx.lineTo(gx-10,gy+6);ctx.lineTo(gx-10,gy-6);ctx.closePath();
      ctx.fillStyle='#dc2626';ctx.fill();ctx.stroke();
      // Aile gauche
      ctx.beginPath();ctx.moveTo(gx-10,gy-4);ctx.lineTo(gx-22,gy-8);ctx.lineTo(gx-22,gy+8);ctx.lineTo(gx-10,gy+4);ctx.closePath();
      ctx.fillStyle='#991b1b';ctx.fill();ctx.stroke();
      // Aile droite
      ctx.beginPath();ctx.moveTo(gx+10,gy-4);ctx.lineTo(gx+22,gy-8);ctx.lineTo(gx+22,gy+8);ctx.lineTo(gx+10,gy+4);ctx.closePath();
      ctx.fill();ctx.stroke();
      // Centre lumineux
      ctx.shadowColor='#ff4444';ctx.shadowBlur=8;
      ctx.beginPath();ctx.arc(gx,gy,5,0,Math.PI*2);ctx.fillStyle='#fca5a5';ctx.fill();
      ctx.beginPath();ctx.arc(gx,gy,2.5,0,Math.PI*2);ctx.fillStyle='#fff';ctx.fill();
      ctx.restore();
    }
    else dEZ(e.x,e.y);
    if(e.flash>0){ctx.save();ctx.globalAlpha=e.flash/8*.65;ctx.fillStyle='#fff';ctx.beginPath();ctx.ellipse(e.x,e.y,e.w*.55,e.h*.55,0,0,Math.PI*2);ctx.fill();ctx.restore();}
  });
  if(boss&&!bDefeated)dBoss(boss);

  // ── Bulles pouvoir Raptor ────────────────────────────────────────
  powerBubbles.forEach(b=>{
    const alpha=b.life/40;
    ctx.save();
    ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,Math.PI*2);
    ctx.strokeStyle=`rgba(34,211,238,${alpha*.9})`;ctx.lineWidth=2.5;ctx.stroke();
    ctx.fillStyle=`rgba(34,211,238,${alpha*.08})`;ctx.fill();
    for(let i=0;i<4;i++){
      const angle=(i/4)*Math.PI*2+b.life*.1;
      const bx2=b.x+Math.cos(angle)*(b.r*.6),by2=b.y+Math.sin(angle)*(b.r*.6);
      ctx.beginPath();ctx.arc(bx2,by2,3,0,Math.PI*2);
      ctx.fillStyle=`rgba(34,211,238,${alpha*.7})`;ctx.fill();
    }
    ctx.restore();
  });

  bullets.forEach(b=>{if(b.f)return;
    const ang=Math.atan2(b.vy,b.vx)+Math.PI/2;
    ctx.save();ctx.translate(b.x,b.y);ctx.rotate(ang);
    // Halo externe large
    ctx.shadowBlur=28;ctx.shadowColor=b.col;
    ctx.beginPath();ctx.ellipse(0,0,6,10,0,0,Math.PI*2);
    ctx.fillStyle=b.col;ctx.fill();
    // Outline blanc semi-transparent
    ctx.shadowBlur=0;
    ctx.beginPath();ctx.ellipse(0,0,6,10,0,0,Math.PI*2);
    ctx.strokeStyle='rgba(255,255,255,.55)';ctx.lineWidth=1.2;ctx.stroke();
    // Core blanc brillant
    ctx.beginPath();ctx.ellipse(0,0,2.5,5,0,0,Math.PI*2);
    ctx.fillStyle='#ffffff';ctx.fill();
    ctx.restore();
  });
  function drawMissileShape(vx,vy){
    const ang=Math.atan2(vy,vx);
    ctx.translate(0,0);ctx.rotate(ang+Math.PI/2);
    ctx.beginPath();if(ctx.roundRect)ctx.roundRect(-3,-14,6,20,2);else ctx.rect(-3,-14,6,20);
    ctx.fillStyle='#ffb800';ctx.fill();
    ctx.beginPath();ctx.moveTo(-3,-14);ctx.lineTo(0,-20);ctx.lineTo(3,-14);
    ctx.fillStyle='#ff6b00';ctx.fill();
    ctx.beginPath();ctx.moveTo(-3,4);ctx.lineTo(-7,9);ctx.lineTo(-3,6);ctx.fillStyle='#cc4400';ctx.fill();
    ctx.beginPath();ctx.moveTo(3,4);ctx.lineTo(7,9);ctx.lineTo(3,6);ctx.fillStyle='#cc4400';ctx.fill();
    const fl=0.7+0.3*Math.random();
    ctx.beginPath();ctx.moveTo(-2,6);ctx.lineTo(0,12+5*fl);ctx.lineTo(2,6);
    ctx.fillStyle=`rgba(255,200,0,${fl})`;ctx.fill();
  }
  bullets.forEach(b=>{if(!b.f)return;
    ctx.save();ctx.shadowBlur=7;ctx.shadowColor=b.col;ctx.fillStyle=b.col;
    if(b.type==='homing'||b.isMissile){
      ctx.translate(b.x,b.y);drawMissileShape(b.vx,b.vy);
    }
    else {
      const ang=Math.atan2(b.vy,b.vx)+Math.PI/2;
      const rw=b.isMini?2:3.5,rh=b.isMini?5:9;
      ctx.translate(b.x,b.y);ctx.rotate(ang);
      // Halo
      ctx.shadowBlur=20;ctx.shadowColor=b.col;
      ctx.beginPath();ctx.ellipse(0,0,rw,rh,0,0,Math.PI*2);
      ctx.fillStyle=b.col;ctx.fill();
      // Outline
      ctx.shadowBlur=0;
      ctx.beginPath();ctx.ellipse(0,0,rw,rh,0,0,Math.PI*2);
      ctx.strokeStyle='rgba(255,255,255,.5)';ctx.lineWidth=1;ctx.stroke();
      // Core blanc
      ctx.beginPath();ctx.ellipse(0,0,rw*.5,rh*.5,0,0,Math.PI*2);
      ctx.fillStyle='#ffffff';ctx.fill();
    }
    ctx.restore();
  });

  ctx.save();
  if(player.iframes>0){
    ctx.shadowBlur=14;ctx.shadowColor='#ff8800';
    ctx.strokeStyle=`rgba(255,140,0,${.5+Math.sin(FN*.6)*.3})`;ctx.lineWidth=2.5;
    ctx.beginPath();ctx.ellipse(player.x,player.y,36,41,0,0,Math.PI*2);ctx.stroke();ctx.shadowBlur=0;
    ctx.globalAlpha=FN%8<4?.3:1;
  }
  drawPlayer(player.x,player.y,player.bonuses.shield>0);
  ctx.restore();

  floats.forEach(f=>{
    if(f.fixed){
      const alpha=Math.min(1,f.t/30);
      ctx.save();
      ctx.globalAlpha=alpha;
      ctx.font='bold 13px "Courier New"';ctx.textAlign='center';ctx.textBaseline='middle';
      ctx.shadowBlur=14;ctx.shadowColor=f.col;
      ctx.strokeStyle='#000';ctx.lineWidth=3;
      ctx.strokeText(f.txt||f.val,f.x,f.y);
      ctx.fillStyle=f.col;ctx.fillText(f.txt||f.val,f.x,f.y);
      ctx.shadowBlur=0;
      ctx.restore();
      return;
    }
    ctx.save();ctx.globalAlpha=f.life;
    const fs=f.outline?13:(f.big?13:10);
    ctx.font=`bold ${fs}px "Courier New"`;ctx.textAlign='center';ctx.textBaseline='middle';
    if(f.big||f.outline){ctx.shadowBlur=16;ctx.shadowColor=f.col;}
    const txt=f.txt||(f.big?f.val:('+'+f.val));
    if(f.outline){ctx.strokeStyle='#000';ctx.lineWidth=3;ctx.strokeText(txt,f.x,f.y);}
    ctx.fillStyle=f.col;ctx.fillText(txt,f.x,f.y);
    ctx.restore();
  });

  // HUD
  ctx.fillStyle='rgba(0,0,20,.72)';ctx.fillRect(0,0,W,40);
  const _dCol={easy:'#4ade80',normal:'#60a5fa',hard:'#f87171'};const _dLbl={easy:'★ FACILE',normal:'★★ NORMAL',hard:'★★★ DIFFICILE'};
  // LEFT: score
  ctx.fillStyle='#cc88ff';ctx.font='bold 14px "Courier New"';
  ctx.textAlign='left';ctx.fillText('SCORE '+score,8,18);
  // CENTER ROW 1: map name (yellow) + wave (white) same line
  ctx.font='bold 11px "Courier New"';
  const _mStr=chosenMap?.name||'';const _wl=getWaveLimit();const _vStr='  VAGUE '+((_wl===Infinity)?wave:wave+'/'+_wl);
  const _mW=ctx.measureText(_mStr).width;const _vW=ctx.measureText(_vStr).width;
  const _cx=W/2-(_mW+_vW)/2;
  ctx.textAlign='left';
  ctx.fillStyle='#ffd87a';ctx.fillText(_mStr,_cx,18);
  ctx.fillStyle='#ffffff';ctx.fillText(_vStr,_cx+_mW,18);
  // CENTER ROW 2: difficulty
  ctx.font='bold 8px "Courier New"';ctx.fillStyle=_dCol[difficulty]||'#fff';ctx.textAlign='center';ctx.fillText(_dLbl[difficulty]||'',W/2,31);
  // RIGHT: hearts
  ctx.font='bold 18px "Courier New"';ctx.fillStyle='#ff4444';ctx.shadowColor='#ff0000';ctx.shadowBlur=10;ctx.textAlign='right';ctx.fillText('♥'.repeat(lives),W-8,18);ctx.shadowBlur=0;
  // ── MP OPPONENT HUD ────────────────────────────────────────────────
  if(mpMode){
    ctx.fillStyle='rgba(255,100,100,.18)';ctx.fillRect(0,42,W,18);
    ctx.font='bold 11px "Courier New"';ctx.textAlign='left';
    ctx.fillStyle='#ff8888';ctx.fillText('⚔ ADV',8,53);
    ctx.fillStyle='#ffaaaa';ctx.textAlign='center';ctx.fillText(mpOpponentScore.toLocaleString()+' · W'+mpOpponentWave,W/2,53);
    ctx.fillStyle=mpOpponentAlive?'#88ff88':'#ff6868';
    ctx.textAlign='right';ctx.fillText(mpOpponentAlive?'● EN VIE':'✖ MORT',W-8,53);
  }
  // ── POWER BAR ──────────────────────────────────────────────────────
  if(chosenShip){
    const _sk=chosenShip.id.toLowerCase(),_cfg=getPwCfg(_sk);
    const _maxU=POWER_MAX_USES[currentWorld],_bx=8,_by=72,_bw=120,_bh=10;
    ctx.fillStyle='#ffffff22';ctx.fillRect(_bx,_by,_bw,_bh);
    ctx.fillStyle=_cfg.col;ctx.shadowColor=_cfg.glow;ctx.shadowBlur=powerBar>0?8:0;
    ctx.fillRect(_bx,_by,_bw*powerBar,_bh);ctx.shadowBlur=0;
    ctx.font='bold 11px "Courier New"';ctx.fillStyle='#ffffff88';ctx.textAlign='left';
    ctx.fillText('⚡ POUVOIR '+powerUsedCount+'/'+_maxU,_bx,_by-4);
    if(powerBar>=1){
      const _p=0.6+0.4*Math.sin(Date.now()*0.01);
      ctx.font='bold 13px "Courier New"';ctx.fillStyle=`rgba(255,215,0,${_p})`;
      ctx.fillText('PRÊT !',_bx+_bw+6,_by+8);
    }
  }
  // ── HUD BAS : arme H-38 · bonus actifs H-72 ─────────────────────
  if(player.weapon!=='default'&&player.wTimer>0){
    const wp=WP[player.weapon],secs=Math.ceil(player.wTimer/60);
    ctx.fillStyle='rgba(0,0,0,.55)';ctx.fillRect(W/2-80,H-54,160,22);
    ctx.fillStyle=wp.col;ctx.font='bold 12px "Courier New"';ctx.textAlign='center';ctx.fillText(`${wp.icon} ${wp.name}  ${secs}s`,W/2,H-38);
    ctx.fillStyle='#111';ctx.fillRect(W/2-60,H-26,120,4);ctx.fillStyle=wp.col;ctx.fillRect(W/2-26,H-26,120*(player.wTimer/Math.max(300,player.wTimer)),4);
  }
  // ── BONUS ACTIFS avec timer ───────────────────────────────────────
  {
    const BINFO=[
      {key:'rapid',icon:'⚡',col:'#fa0',max:240},
      {key:'multi',icon:'✦',col:'#0ff',max:210},
      {key:'shield',icon:'🛡',col:'#4f4',max:300},
      {key:'speed',icon:'💨',col:'#f4f',max:180},
    ].filter(b=>player.bonuses[b.key]>0);
    if(BINFO.length>0){
      const cW=58,cH=20,gap=6;
      const totalW=BINFO.length*(cW+gap)-gap;
      let cx=Math.round(W/2-totalW/2);
      const cy=H-78;
      BINFO.forEach(b=>{
        const rem=player.bonuses[b.key],secs=Math.ceil(rem/60),ratio=rem/b.max;
        ctx.fillStyle='rgba(0,0,0,.6)';ctx.fillRect(cx,cy,cW,cH);
        ctx.font='bold 10px "Courier New"';ctx.fillStyle=b.col;ctx.textAlign='center';
        ctx.fillText(b.icon+' '+secs+'s',cx+cW/2,cy+13);
        ctx.fillStyle='#1a1a1a';ctx.fillRect(cx,cy+cH,cW,3);
        ctx.fillStyle=b.col;ctx.fillRect(cx,cy+cH,Math.round(cW*ratio),3);
        cx+=cW+gap;
      });
    }
  }
  if(isBW&&bDefeated&&!bSpawned&&!rouletteQueued&&wTimer>20&&wTimer<100){
    ctx.save();ctx.globalAlpha=.5+Math.sin(FN*.2)*.5;ctx.fillStyle='#f44';ctx.font='bold 10px "Courier New"';ctx.textAlign='center';ctx.fillText('⚠  BOSS IMMINENT  ⚠',W/2,H/2);ctx.restore();
  }
  if(!isBW&&!rouletteQueued){
    const wEnd=600;
    if(wTimer>wEnd-50){
      ctx.save();ctx.globalAlpha=.4+Math.sin(FN*.3)*.4;ctx.fillStyle='#7af';ctx.font='bold 10px "Courier New"';ctx.textAlign='center';
      const _wlMsg=getWaveLimit();const msg=(_wlMsg!==Infinity&&wave>=_wlMsg)?(currentWorld<MAPS.length-1?`— SECTEUR ${currentWorld+2} EN APPROCHE —`:'— VICTOIRE IMMINENTE —'):`— VAGUE ${wave+1} EN APPROCHE —`;
      ctx.fillText(msg,W/2,H/2);ctx.restore();
    }
  }
  if(rouletteQueued&&rouletteDelay<60){
    ctx.save();ctx.globalAlpha=.5+Math.sin(FN*.3)*.5;ctx.fillStyle='#fa0';ctx.font='bold 10px "Courier New"';ctx.textAlign='center';ctx.fillText('🎰  NOUVELLE ARME !  🎰',W/2,H/2+30);ctx.restore();
  }
  // ── COMBO HUD ────────────────────────────────────────────────────
  if(combo>=2&&comboTimer>0){
    const ca=Math.min(1,comboTimer/50);
    ctx.save();ctx.globalAlpha=ca;ctx.textAlign='center';
    ctx.font='bold 15px "Courier New"';
    ctx.strokeStyle='#000';ctx.lineWidth=3;ctx.strokeText('COMBO ×'+combo,W/2,75);
    const comboCol=combo>=8?'#ff2bd6':combo>=5?'#ff6b00':'#FFD700';
    ctx.fillStyle=comboCol;ctx.fillText('COMBO ×'+combo,W/2,75);
    ctx.restore();
  }
  ctx.restore(); // screen shake
}

function loop(){if(GS!=='playing')return;update();draw();RAF=requestAnimationFrame(loop);}

// ── PAUSE SYSTEM ───────────────────────────────────────────────────
const ABANDON_MSGS=[
  "Même ton vaisseau a demandé une mutation côté alien. Logique.",
  "Les ennemis ont commandé une pizza pour fêter ça. T'étais leur boss final.",
  "Abandon confirmé. Ton copilote imaginaire démissionne aussi par solidarité.",
  "T'as rendu ton badge de pilote plus vite que la lumière. Chapeau quand même, pilote.",
  "ALERTE : pilote en fuite détecté. Les astéroïdes te regardent avec mépris.",
  "Mission abandonnée. L'univers entier te regardait. Il a changé de chaîne.",
  "Courage, fuyons ! Le grand classique de l'histoire spatiale. Au moins t'as du style.",
  "Ton score a été effacé… non, en fait il est juste trop court pour être affiché.",
];
function togglePause(){
  if(GS==='playing'){
    GS='pause';cancelAnimationFrame(RAF);
    const _wlPause=getWaveLimit();const wv=_wlPause===Infinity?'∞':_wlPause;
    OVel.innerHTML=`
      <div class="scan"></div>
      <div style="font-family:'Courier New',monospace;font-size:14px;letter-spacing:10px;color:#7ab8ff;text-shadow:0 0 12px rgba(122,184,255,.5);">MISSION EN PAUSE</div>
      <div style="font-size:68px;line-height:1;margin:18px 0 14px;">⏸</div>
      <div style="font-family:'Courier New',monospace;font-size:15px;color:#d0e8ff;letter-spacing:4px;text-shadow:0 0 8px rgba(180,210,255,.4);">S${currentWorld+1} · VAGUE ${wave}/${wv}</div>
      <div style="font-family:'Courier New',monospace;font-size:22px;color:#ffd87a;letter-spacing:5px;margin-top:6px;text-shadow:0 0 14px rgba(255,210,80,.5);">${score.toLocaleString()} pts</div>
      <div style="width:320px;height:1px;background:linear-gradient(90deg,transparent,rgba(122,184,255,.4),transparent);margin:30px 0 20px;"></div>
      <div style="display:flex;flex-direction:column;align-items:center;gap:18px;width:100%;">
        <button class="sb" id="pres" style="min-width:280px;font-size:15px;letter-spacing:5px;padding:15px 36px;">▶ REPRENDRE LA MISSION</button>
        <button class="sb alt" id="pabd" style="min-width:280px;font-size:13px;letter-spacing:4px;padding:11px 28px;color:#ff8888;border-color:#883333;">🏳 ABANDONNER</button>
      </div>
      <div style="width:320px;height:1px;background:linear-gradient(90deg,transparent,rgba(122,184,255,.2),transparent);margin:28px 0 12px;"></div>
      <div style="display:flex;align-items:center;gap:14px;justify-content:center;">
        <button onclick="adjustVolume(-0.0125,'volDisplay')" style="background:#1a1a2e;color:#fff;border:1px solid #4fc3f7;border-radius:6px;padding:5px 14px;font-size:15px;cursor:pointer;">−</button>
        <span id="volDisplay" style="color:#4fc3f7;font-family:'Courier New',monospace;font-size:13px;min-width:50px;text-align:center;">🔊 ${Math.round(masterVolume*400)}%</span>
        <button onclick="adjustVolume(0.0125,'volDisplay')" style="background:#1a1a2e;color:#fff;border:1px solid #4fc3f7;border-radius:6px;padding:5px 14px;font-size:15px;cursor:pointer;">+</button>
      </div>
      <div style="display:flex;align-items:center;gap:14px;justify-content:center;margin-top:10px;">
        <button onclick="adjustSensitivity(-0.25)" style="background:#1a1a2e;color:#fff;border:1px solid #ff00cc;border-radius:6px;padding:5px 14px;font-size:15px;cursor:pointer;">−</button>
        <span class="sens-display" style="color:#ff00cc;font-family:'Courier New',monospace;font-size:13px;min-width:80px;text-align:center;">🎯 ${Math.round(sensitivity*100)}%</span>
        <button onclick="adjustSensitivity(0.25)" style="background:#1a1a2e;color:#fff;border:1px solid #ff00cc;border-radius:6px;padding:5px 14px;font-size:15px;cursor:pointer;">+</button>
      </div>`;
    OVel.style.display='flex';
    document.getElementById('pres').onclick=()=>resumeGame();
    document.getElementById('pabd').onclick=()=>abandonGame();
  } else if(GS==='pause'){
    resumeGame();
  }
}
function resumeGame(){
  OVel.style.display='none';GS='playing';cancelAnimationFrame(RAF);RAF=requestAnimationFrame(loop);
}
function abandonGame(){
  GS='dead';stopMusic();
  const msg=ABANDON_MSGS[Math.floor(Math.random()*ABANDON_MSGS.length)];
  OVel.innerHTML=`
    <div class="scan"></div>
    <div class="title" style="font-size:42px;color:#ffd87a;">🏳 ABANDON</div>
    <div style="width:280px;height:1px;background:linear-gradient(90deg,transparent,rgba(255,216,122,.35),transparent);margin:22px 0 28px;"></div>
    <div style="font-family:'Courier New',monospace;font-size:15px;color:#d8e8ff;line-height:1.9;max-width:420px;padding:0 30px;text-align:center;letter-spacing:1px;">${msg}</div>
    <div style="width:280px;height:1px;background:linear-gradient(90deg,transparent,rgba(122,184,255,.25),transparent);margin:32px 0 20px;"></div>
    <div style="font-family:'Courier New',monospace;font-size:12px;color:#5b8acc;letter-spacing:4px;">— Retour au menu dans 6 secondes —</div>`;
  OVel.style.display='flex';startMenuBg();
  const pb=document.getElementById('pbtn');if(pb)pb.style.display='none';
  setTimeout(()=>showMenu(),6000);
}

async function endGame(){
  GS='dead';cancelAnimationFrame(RAF);stopMusic();playGameOverCrash();snd.over();
  destroyJoystick();
  if(mpMode)mpSendGameOver();
  const pb=document.getElementById('pbtn');if(pb)pb.style.display='none';
  const finalScore=score,finalWave=wave,finalShip=chosenShip.name,finalMap=chosenMap.name,finalWorld=currentWorld+1;
  // ── ÉCRAN GAME OVER arcade ──────────────────────────────────────────
  OVel.style.display='flex';
  OVel.innerHTML=`
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;width:100%;height:100%;background:rgba(0,0,0,0.85);">
      <div style="font-family:'Courier New',monospace;font-size:38px;color:#ff2bd6;text-shadow:0 0 30px #ff2bd6,0 0 60px #ff2bd6,0 0 90px #9d4dff;letter-spacing:6px;animation:goBlink 0.6s infinite alternate;">GAME OVER</div>
      <div style="font-family:'Courier New',monospace;font-size:11px;color:#ffffff55;margin-top:22px;letter-spacing:3px;">INSEREZ UNE PIECE...</div>
    </div>
    <style>@keyframes goBlink{from{opacity:1;transform:scale(1);}to{opacity:0.6;transform:scale(1.06);}}</style>`;
  // récupère pseudo précédent (pendant les 3s d'affichage)
  let lastPseudo='';try{const r=await Store.get('starfire:pseudo');if(r)lastPseudo=r.value||'';}catch(e){}
  setTimeout(()=>{
    OVel.innerHTML=`
      <div class="title" style="font-size:36px;color:#ff6666;text-shadow:0 0 18px rgba(255,80,80,.5);">VAINCU</div>
      <div class="subtitle" style="color:#ff8888;">Mais l'écho résonne encore…</div>
      <div style="height:6px;"></div>
      <div style="font-family:'Courier New',monospace;font-size:28px;color:#ffd87a;letter-spacing:4px;">${finalScore.toLocaleString()}</div>
      <div style="font-size:11px;color:#7a98c4;letter-spacing:3px;">SECTEUR <b style="color:#fff4b8;font-weight:900;">${finalWorld}</b> · VAGUE <b style="color:#fff4b8;font-weight:900;">${finalWave}</b> · <b style="color:#fff4b8;font-weight:900;">${finalShip.toUpperCase()}</b></div>
      <div style="height:8px;"></div>
      <div style="font-family:'Courier New',monospace;font-size:10px;color:#9ec3ff;letter-spacing:3px;">PSEUDO DU PILOTE</div>
      <input id="pseudo" type="text" maxlength="10" value="${lastPseudo.replace(/"/g,'')}" placeholder="ANONYME"
        style="font-family:'Courier New',monospace;font-weight:700;font-size:18px;letter-spacing:4px;color:#ffd87a;background:rgba(15,28,55,.85);border:1px solid #5b8acc;border-radius:2px;padding:8px 14px;text-align:center;width:240px;text-transform:uppercase;outline:none;"/>
      <div style="display:flex;gap:8px;margin-top:6px;">
        <button class="sb" id="bsv">💾 ENREGISTRER</button>
      </div>
      <div style="display:flex;gap:8px;margin-top:4px;">
        <button class="sb alt" id="brp">↻ REJOUER</button>
        <button class="sb alt" id="bmn">← MENU</button>
      </div>`;
    OVel.style.display='flex';startMenuBg();
    const inp=document.getElementById('pseudo');inp.focus();inp.select();
    let saved=false;
    async function doSave(){
      if(saved)return;saved=true;
      const pseudo=(inp.value||'ANONYME').trim().toUpperCase().slice(0,10)||'ANONYME';
      try{await Store.set('starfire:pseudo',pseudo);}catch(e){}
      await saveScore(finalScore,finalWave,finalShip,finalMap,pseudo,finalWorld);
      const btn=document.getElementById('bsv');if(btn){btn.textContent='✓ ENREGISTRÉ';btn.disabled=true;btn.style.opacity=.6;}
    }
    document.getElementById('bsv').onclick=doSave;
    inp.addEventListener('keydown',e=>{if(e.key==='Enter')doSave();});
    document.getElementById('brp').onclick=async()=>{await doSave();startGame();};
    document.getElementById('bmn').onclick=async()=>{await doSave();showMenu();};
  },3000);
}
function destroyJoystick(){
  ['joystick-zone','joy-base','joy-stick'].forEach(id=>{const el=document.getElementById(id);if(el)el.remove();});
  joystick.active=false;joystick.dx=0;joystick.dy=0;
}
function createJoystick(){
  if(!isMobile)return;
  destroyJoystick(); // évite les doublons si startGame() est rappelé
  const wrap=document.getElementById('wrap');
  const zone=document.createElement('div');
  zone.id='joystick-zone';
  zone.style.cssText='position:absolute;left:0;bottom:0;width:55%;height:45%;z-index:50;touch-action:none;';
  wrap.appendChild(zone);
  const base=document.createElement('div');
  base.id='joy-base';
  base.style.cssText='position:absolute;width:100px;height:100px;border-radius:50%;border:2px solid rgba(255,255,255,0.2);background:rgba(255,255,255,0.06);display:none;transform:translate(-50%,-50%);pointer-events:none;';
  wrap.appendChild(base);
  const stick=document.createElement('div');
  stick.id='joy-stick';
  stick.style.cssText='position:absolute;width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,0.35);border:2px solid rgba(255,255,255,0.5);display:none;transform:translate(-50%,-50%);pointer-events:none;';
  wrap.appendChild(stick);
  zone.addEventListener('touchstart',e=>{
    e.preventDefault();
    const touch=e.changedTouches[0];
    const rect=wrap.getBoundingClientRect();
    const scale=W/rect.width; // coordonnées canvas réelles
    joystick.active=true;joystick.id=touch.identifier;
    joystick.baseX=(touch.clientX-rect.left)*scale;
    joystick.baseY=(touch.clientY-rect.top)*scale;
    joystick.dx=0;joystick.dy=0;
    base.style.display='block';base.style.left=joystick.baseX+'px';base.style.top=joystick.baseY+'px';
    stick.style.display='block';stick.style.left=joystick.baseX+'px';stick.style.top=joystick.baseY+'px';
  },{passive:false});
  zone.addEventListener('touchmove',e=>{
    e.preventDefault();
    const rect=wrap.getBoundingClientRect();
    const scale=W/rect.width;
    for(const touch of e.changedTouches){
      if(touch.identifier!==joystick.id)continue;
      const tx2=(touch.clientX-rect.left)*scale;
      const ty2=(touch.clientY-rect.top)*scale;
      const dx=tx2-joystick.baseX,dy=ty2-joystick.baseY;
      const dist=Math.hypot(dx,dy),maxDist=45;
      const ratio=Math.min(dist,maxDist)/(dist||1);
      joystick.dx=dx*ratio/maxDist;
      joystick.dy=dy*ratio/maxDist;
      stick.style.left=(joystick.baseX+dx*ratio)+'px';
      stick.style.top=(joystick.baseY+dy*ratio)+'px';
    }
  },{passive:false});
  const endJoy=e=>{
    for(const touch of e.changedTouches){
      if(touch.identifier!==joystick.id)continue;
      joystick.active=false;joystick.dx=0;joystick.dy=0;
      base.style.display='none';stick.style.display='none';
    }
  };
  zone.addEventListener('touchend',endJoy,{passive:false});
  zone.addEventListener('touchcancel',endJoy,{passive:false});
}

function startGame(){
  currentWorld=MAPS.findIndex(m=>m.id===chosenMap.id);
  if(currentWorld<0)currentWorld=0;
  initAC(); playTrack('map'+currentWorld);
  stopMenuBg();OVel.style.display='none';ROVel.style.display='none';
  // Crée le bouton pause si absent, injecte le style une seule fois
  if(!document.getElementById('pbtn-style')){
    const st=document.createElement('style');st.id='pbtn-style';
    st.textContent='#pbtn{position:absolute;top:50px;right:7px;z-index:15;background:rgba(0,0,20,.7);border:1px solid #3d5a8a;color:#7a98c4;cursor:pointer;font-size:15px;width:28px;height:28px;border-radius:4px;line-height:28px;text-align:center;padding:0;transition:all .15s;display:none;}#pbtn:hover{border-color:#ffd87a;color:#ffd87a;}';
    document.head.appendChild(st);
  }
  let pb=document.getElementById('pbtn');
  if(!pb){pb=document.createElement('button');pb.id='pbtn';pb.title='Pause (ESC)';pb.textContent='⏸';document.getElementById('wrap').appendChild(pb);}
  pb.style.display='block';pb.onclick=()=>togglePause();
  if(isMobile)createJoystick();
  init();GS='playing';cancelAnimationFrame(RAF);RAF=requestAnimationFrame(loop);
}

showMenu();
// ── GAMEPAD CONNEXION ─────────────────────────────────────────────
window.addEventListener('gamepadconnected',e=>{
  gpIndex=e.gamepad.index;
  // gamepadconnected est un vrai geste utilisateur → on peut init l'audio ici
  if(!AC){initAC();if(GS==='menu')playTrack('menu');}
  else if(AC.state==='suspended'){AC.resume();}
  if(GS==='menu'){showMenu();startGpNav();} // startGpNav explicite car OVel.style peut déjà être 'flex' (observer ne re-fire pas)
});
window.addEventListener('gamepaddisconnected',e=>{
  if(e.gamepad.index===gpIndex){gpIndex=null;gpRT=false;gpStart=false;}
  if(GS==='menu')showMenu();
});

// ── NAVIGATION MANETTE DANS LES MENUS ────────────────────────────
let _gpFocus=0,_gpMenuKey='';
let _gpNavUp=false,_gpNavDown=false,_gpNavA=false,_gpNavStart=false;
let _gpNavInt=null;
function startGpNav(){
  if(_gpNavInt)return; // déjà actif
  _gpNavInt=setInterval(()=>{
    if(gpIndex===null||OVel.style.display==='none')return;
    const gp=navigator.getGamepads()[gpIndex];
    if(!gp)return;
    // Init audio sur premier appui manette
    if((!AC||AC.state==='suspended')&&gp.buttons.some(b=>b.pressed)){
      if(!AC)initAC();
      if(AC)AC.resume().then(()=>{if(GS==='menu'&&!musicOn)playTrack('menu');}).catch(()=>{});
    }
    const items=[...OVel.querySelectorAll('button,.card,.diff-card,[onclick]')];
    if(!items.length)return;
    const menuKey=(items[0].id||items[0].textContent||'').slice(0,20);
    if(menuKey!==_gpMenuKey){_gpFocus=0;_gpMenuKey=menuKey;}
    _gpFocus=Math.min(_gpFocus,items.length-1);
    const up=!!(gp.buttons[12]?.pressed)||(gp.axes[1]??0)<-0.5;
    const down=!!(gp.buttons[13]?.pressed)||(gp.axes[1]??0)>0.5;
    const a=!!(gp.buttons[0]?.pressed);
    const startBtn=!!(gp.buttons[9]?.pressed);
    if(down&&!_gpNavDown){_gpFocus=(_gpFocus+1)%items.length;snd.sel&&snd.sel();}
    if(up&&!_gpNavUp){_gpFocus=(_gpFocus-1+items.length)%items.length;snd.sel&&snd.sel();}
    items.forEach((el,i)=>{
      if(i===_gpFocus){el.style.outline='3px solid #ffd87a';el.style.boxShadow='0 0 22px rgba(255,216,122,.85),0 0 44px rgba(255,216,122,.4)';}
      else{el.style.outline='';el.style.boxShadow='';}
    });
    if(a&&!_gpNavA){if(AC&&AC.state==='suspended')AC.resume();items[_gpFocus]?.click();}
    if(startBtn&&!_gpNavStart){
      const nxt=document.getElementById('bnx')||document.getElementById('blz')||document.getElementById('bs');
      if(nxt){if(AC&&AC.state==='suspended')AC.resume();nxt.click();}
    }
    _gpNavUp=up;_gpNavDown=down;_gpNavA=a;_gpNavStart=startBtn;
  },130);
}
function stopGpNav(){if(_gpNavInt){clearInterval(_gpNavInt);_gpNavInt=null;}}
// Démarre quand le menu devient visible
const _gpObs=new MutationObserver(()=>{
  if(OVel.style.display!=='none')startGpNav();else stopGpNav();
});
_gpObs.observe(OVel,{attributes:true,attributeFilter:['style']});
document.addEventListener('keydown',e=>{
  keys[e.key]=true;
  if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' ','z','Z','q','Q'].includes(e.key))e.preventDefault();
  if(e.key==='Escape'&&(GS==='playing'||GS==='pause'))togglePause();
  // TEST campagne : N = succès de mission immédiat
  if(e.key==='n'||e.key==='N'){
    if(campaignMode && campaignMission && GS==='playing'){
      campaignMode=false;
      campaignMissionSuccess();
    }
  }
});
document.addEventListener('keyup',e=>keys[e.key]=false);
let tx=null,ty=null;
const WE=document.getElementById('wrap');
// Touch swipe — uniquement sur desktop (le joystick virtuel gère tout le mouvement sur mobile)
WE.addEventListener('touchstart',e=>{
  if(isMobile)return; // le joystick couvre tous les déplacements sur mobile
  if(joystick.active)return;
  // Ne pas bloquer les taps sur boutons/cards (menu, overlay)
  if(e.target.closest('button,a,.card,.diff-card,[onclick]'))return;
  if(GS!=='playing')return;
  tx=e.touches[0].clientX;ty=e.touches[0].clientY;
  e.preventDefault();
},{passive:false});
WE.addEventListener('touchmove',e=>{
  if(joystick.active){e.preventDefault();return;}
  if(!isMobile&&GS==='playing'&&tx!==null){
    const rect=WE.getBoundingClientRect(),scale=W/rect.width;
    const dx=(e.touches[0].clientX-tx)*scale,dy=(e.touches[0].clientY-ty)*scale;
    tx=e.touches[0].clientX;ty=e.touches[0].clientY;
    player.x=Math.max(22,Math.min(W-22,player.x+dx));
    player.y=Math.max(44,Math.min(H-28,player.y+dy));
  }
  e.preventDefault();
},{passive:false});
WE.addEventListener('touchend',()=>{if(!joystick.active){tx=null;ty=null;}},{passive:false});

