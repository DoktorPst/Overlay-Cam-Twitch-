/* ══════════════════════════════════════════════════
   CAM OVERLAY — JS FINAL
   - Tout opaque
   - Barre unique qui switch follow/sub
   - Stats toujours visibles (randoms si vide)
   - Badge LIVE
   - Shimmer nametag
   - Timer de stream
   - Dernier raid dans rotation
   - Flash coins sur event
══════════════════════════════════════════════════ */
'use strict';

let FD={}, si=0, ri=0, goalMode='follow', goalTimer=null;
let stimer=null, soctimer=null, ptimer=null;
let followers=null, streamStart=Date.now();

const live={
  follow: null, sub: null, bits: null, don: null, raid: null,
};

// Valeurs par défaut amusantes si rien de reçu
const RAND_FOLLOW = ['TenebrousKnight','VoidWalker99','BloodRaven','ShadowDancer','IronForge','CrimsonMage','DarkStalker','GhostRider42'];
const RAND_SUB    = ['AbyssalGamer','NightShade88','ChaosMaster','DemonHunter','ArcaneWitch','StormBreaker'];
const RAND_BITS   = ['500 bits','1000 bits','200 bits','750 bits','300 bits'];
const RAND_DON    = ['5.00€','10.00€','2.50€','20.00€'];
const RAND_RAID   = ['Un clan ami','Des guerriers inconnus','Une armée errante'];
const pick = arr => arr[Math.floor(Math.random()*arr.length)];

const fd   = k=>FD[k];
const $    = id=>document.getElementById(id);
const sv   = (k,v)=>document.documentElement.style.setProperty(k,v);
const rand  = (a,b)=>Math.random()*(b-a)+a;
const rint  = (a,b)=>Math.floor(rand(a,b+1));
const num   = (v,d)=>{const n=parseInt(v);return isNaN(n)?d:n;};
const fmtN  = n=>(n??0).toLocaleString('fr-FR');

// Valeur affichée : live si dispo, sinon random
const getFollow=()=>live.follow||(pick(RAND_FOLLOW));
const getSub   =()=>live.sub   ||(pick(RAND_SUB));
const getBits  =()=>live.bits  ||(pick(RAND_BITS));
const getDon   =()=>live.don   ||(pick(RAND_DON));
const getRaid  =()=>live.raid  ||(pick(RAND_RAID));

/* ─── Formats ─── */
const SIZES = {
  '16:9': {w:640, h:360, cs:52, bw:3},
  '1:1':  {w:480, h:480, cs:52, bw:3},
};

/* ─── Logos réseaux ─── */
const LOGO={
  twitch:    c=>`<svg viewBox="0 0 24 24"><path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z" fill="${c}"/></svg>`,
  youtube:   c=>`<svg viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" fill="${c}"/></svg>`,
  twitter:   c=>`<svg viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.631L18.244 2.25z" fill="${c}"/></svg>`,
  tiktok:    c=>`<svg viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" fill="${c}"/></svg>`,
  discord:   c=>`<svg viewBox="0 0 24 24"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057.1 18.079.11 18.1.132 18.115a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.1.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" fill="${c}"/></svg>`,
  instagram: c=>`<svg viewBox="0 0 24 24"><path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12c0 3.259.014 3.668.072 4.948.058 1.283.276 2.153.574 2.916.306.789.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24c3.259 0 3.668-.014 4.948-.072 1.277-.058 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947 0-3.259-.014-3.667-.072-4.947-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" fill="${c}"/></svg>`,
};
const PCOL={twitch:'#9146ff',youtube:'#ff0000',twitter:'#1DA1F2',tiktok:'#ff0050',discord:'#5865F2',instagram:'#E4405F'};
const PNAME={twitch:'Twitch',youtube:'YouTube',twitter:'X / Twitter',tiktok:'TikTok',discord:'Discord',instagram:'Instagram'};

/* ─── Icônes stats ─── */
function isvg(t,c){
  const m={
    heart:`<svg viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="${c}"/></svg>`,
    star: `<svg viewBox="0 0 24 24"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" fill="${c}"/></svg>`,
    diam: `<svg viewBox="0 0 24 24"><path d="M19 3H5L2 9l10 12L22 9z" fill="${c}"/></svg>`,
    euro: `<svg viewBox="0 0 24 24"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z" fill="${c}"/></svg>`,
    peop: `<svg viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" fill="${c}"/></svg>`,
    trop: `<svg viewBox="0 0 24 24"><path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2z" fill="${c}"/></svg>`,
    sword:`<svg viewBox="0 0 24 24"><path d="M6.92 5H5L3 7l4 4-2 2-1-1-1 1 4 4 1-1-1-1 2-2 4 4 2-2-7.08-11zm12.49.51L18 4l-5 5 1 1 5-5-1-1 1.41 1.41zM14 16l-4-4-5 5 4 4z" fill="${c}"/></svg>`,
    clock:`<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm.5 5v6l4.75 2.85-.75 1.24L11 13.5V7h1.5z" fill="${c}"/></svg>`,
  };
  return (m[t]||m.peop).replace(/\${c}/g,c);
}

/* ─── Couleurs événements ─── */
const EVC={follow:'#ff0055',sub:'#9900ff',resub:'#aa33ff',gift:'#ff8800',giftbomb:'#ff5500',bits:'#4488ff',don:'#ffaa00',raid:'#ff4400'};
const EVL={
  follow:   ['NOUVEAU FOLLOW !','BIENVENUE !','UN NOUVEAU ARRIVE !'],
  sub:      ['NOUVEAU ABONNÉ !','PACTE DE SANG !','DANS LES RANGS !'],
  resub:    ['RÉABONNEMENT !','TOUJOURS LÀ !','FIDÈLE AU POSTE !'],
  gift:     ['DON D\'ABONNEMENT !','CADEAU !','GÉNÉREUX !'],
  giftbomb: ['BOMBE DE DONS !','EXPLOSION !','INCROYABLE !'],
  bits:     ['BITS !','FRAGMENTS D\'ÂME !','MERCI !'],
  don:      ['DONATION !','MERCI !','GÉNÉREUX !'],
  raid:     ['RAID !!!','LES LÉGIONS ARRIVENT !','RAID EN COURS !'],
};

/* ══════════════════════════════════════════════════
   TIMER DE STREAM
══════════════════════════════════════════════════ */
function getStreamTime(){
  const s=Math.floor((Date.now()-streamStart)/1000);
  const h=Math.floor(s/3600), m=Math.floor((s%3600)/60), sec=s%60;
  return h>0 ? `${h}h ${String(m).padStart(2,'0')}m` : `${m}m ${String(sec).padStart(2,'0')}s`;
}

/* ══════════════════════════════════════════════════
   BARRE OBJECTIF UNIQUE (switch follow ↔ sub)
══════════════════════════════════════════════════ */
function hasFollowGoal(){ return num(fd('followGoalTarget'),0)>0; }
function hasSubGoal()   { return num(fd('subGoalTarget'),0)>0;   }

function renderGoalBar(mode){
  const wrap=$('goal-bar-wrap'); if(!wrap) return;
  const fill=$('gb-fill'),counter=$('gb-counter'),pct=$('gb-pct'),lbl=$('gb-label'),icon=$('gb-icon');

  if(mode==='follow'){
    const target=num(fd('followGoalTarget'),0);
    if(!target){ switchGoalMode('sub'); return; }
    const cur=followers!==null?followers:num(fd('followerCount'),0);
    const p=Math.min(100,Math.round(cur/target*100));
    wrap.className='show follow';
    if(icon)    icon.textContent='♥';
    if(lbl)     lbl.textContent='Objectif Followers';
    if(counter) counter.textContent=`${fmtN(cur)} / ${fmtN(target)}`;
    if(fill)    fill.style.width=p+'%';
    if(pct)     pct.textContent=p+'%';
  } else {
    const target=num(fd('subGoalTarget'),0);
    if(!target){ switchGoalMode('follow'); return; }
    const cur=num(fd('subGoalCurrent'),0);
    const p=Math.min(100,Math.round(cur/target*100));
    wrap.className='show sub';
    if(icon)    icon.textContent='★';
    if(lbl)     lbl.textContent='Objectif Abonnements';
    if(counter) counter.textContent=`${cur} / ${target}`;
    if(fill)    fill.style.width=p+'%';
    if(pct)     pct.textContent=p+'%';
  }
  $('cam-root')?.classList.add('has-goal');
}

function switchGoalMode(forceTo){
  const hasFol=hasFollowGoal(), hasSub=hasSubGoal();
  if(!hasFol&&!hasSub){ $('goal-bar-wrap')?.classList.remove('show'); $('cam-root')?.classList.remove('has-goal'); return; }
  if(!hasFol){ goalMode='sub'; }
  else if(!hasSub){ goalMode='follow'; }
  else { goalMode = forceTo || (goalMode==='follow'?'sub':'follow'); }
  const wrap=$('goal-bar-wrap'); if(!wrap) return;
  wrap.classList.add('switching');
  setTimeout(()=>{ renderGoalBar(goalMode); wrap.classList.remove('switching'); },300);
}

function startGoalSwitcher(){
  clearInterval(goalTimer);
  if(!hasFollowGoal()&&!hasSubGoal()) return;
  renderGoalBar(goalMode);
  if(hasFollowGoal()&&hasSubGoal()){
    const sec=num(fd('goalSwitchInterval'),8);
    goalTimer=setInterval(()=>switchGoalMode(),sec*1000);
  }
}

/* ══════════════════════════════════════════════════
   STATS BANDE
══════════════════════════════════════════════════ */
function buildStatItems(){
  const f=followers!==null?fmtN(followers):(fd('followerCount')||'—');
  return [
    {icon:'heart',color:'#ff0055',label:'Dernier Follow',   value:getFollow()},
    {icon:'star', color:'#9900ff',label:'Dernier Abonné',    value:getSub()   },
    {icon:'peop', color:'#00ccff',label:'Followers',          value:f          },
    {icon:'diam', color:'#4488ff',label:'Derniers Bits',      value:getBits()  },
    {icon:'euro', color:'#ffaa00',label:'Dernière Donation',  value:getDon()   },
    {icon:'sword',color:'#ff4400',label:'Dernier Raid',       value:getRaid()  },
    {icon:'clock',color:'#88ccff',label:'Durée du stream',    value:getStreamTime(),live:true},
    ...(fd('topSubName')?[{icon:'trop',color:'#c8922a',label:'Top Supporter',value:fd('topSubName')}]:[]),
  ];
}

function buildSocItems(){
  const items=[];
  for(let i=1;i<=6;i++){
    if(fd(`social${i}Enabled`)===false) continue;
    const p=fd(`social${i}Platform`)||'twitch';
    const n=fd(`social${i}Name`)||'';
    if(n) items.push({platform:p,name:n});
  }
  return items;
}

/* ─── Affichage stat ─── */
function applyStatItem(item){
  const icon=$('stat-icon'),lbl=$('stat-label'),val=$('stat-value'); if(!icon) return;
  // Si stat live (timer), rafraîchit la valeur
  if(item.live) item.value=getStreamTime();
  icon.innerHTML=isvg(item.icon,item.color);
  icon.style.borderColor=item.color;
  icon.style.boxShadow=`0 0 10px ${item.color}`;
  lbl.textContent=item.label; lbl.style.color=item.color;
  val.textContent=item.value; val.style.color=item.color;
  val.style.textShadow=`0 0 10px ${item.color}`;
}
function applySocItem(item){
  const logo=$('soc-logo'),lbl=$('soc-label'),val=$('soc-value'); if(!logo) return;
  const col=PCOL[item.platform]||'#9146ff';
  logo.innerHTML=(LOGO[item.platform]||LOGO.twitch)(col);
  logo.style.borderColor=col; logo.style.boxShadow=`0 0 10px ${col}`;
  lbl.textContent=PNAME[item.platform]||item.platform; lbl.style.color=col;
  val.textContent=item.name; val.style.color=col; val.style.textShadow=`0 0 10px ${col}`;
}

let statItems=[], socItems=[];

function swap(side){
  const elId=side==='stat'?'band-left':'band-right';
  const el=$(elId); if(!el) return;
  el.classList.add('fout');
  setTimeout(()=>{
    if(side==='stat'){
      si=(si+1)%statItems.length;
      applyStatItem(statItems[si]);
      updateDots('stat-dots',si,statItems.length);
    } else {
      if(!socItems.length) return;
      ri=(ri+1)%socItems.length;
      applySocItem(socItems[ri]);
      updateDots('soc-dots',ri,socItems.length);
    }
    el.classList.remove('fout'); el.classList.add('fin');
    setTimeout(()=>el.classList.remove('fin'),260);
  },260);
}

function buildDots(elId,count){
  const el=$(elId); if(!el) return; el.innerHTML='';
  for(let i=0;i<Math.min(count,12);i++){const d=document.createElement('div');d.className='dot';d.dataset.i=i;el.appendChild(d);}
}
function updateDots(elId,cur,total){
  document.querySelectorAll(`#${elId} .dot`).forEach(d=>{d.classList.toggle('on',parseInt(d.dataset.i)===cur%Math.min(total,12));});
}

function startRotation(){
  clearInterval(stimer); clearInterval(soctimer);
  statItems=buildStatItems(); socItems=buildSocItems();
  buildDots('stat-dots',statItems.length); buildDots('soc-dots',socItems.length);
  si=0; ri=0;
  applyStatItem(statItems[0]); updateDots('stat-dots',0,statItems.length);
  if(socItems.length){ applySocItem(socItems[0]); updateDots('soc-dots',0,socItems.length); }
  else {
    const l=$('soc-logo'),lb=$('soc-label'),v=$('soc-value');
    if(l) l.innerHTML=`<svg viewBox="0 0 24 24"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z" fill="#c8922a"/></svg>`;
    if(lb){lb.textContent='Nos Réseaux';lb.style.color='#c8922a';}
    if(v){v.textContent='Ajouter des réseaux';v.style.color='#c8922a';}
  }
  const sec=num(fd('rotInterval'),5);
  stimer=setInterval(()=>{statItems=buildStatItems();swap('stat');},sec*1000);
  if(socItems.length>1) soctimer=setInterval(()=>swap('soc'),num(fd('socRotInterval'),sec)*1000);
}

/* ══════════════════════════════════════════════════
   EFFETS ÉVÉNEMENTS
══════════════════════════════════════════════════ */
function getIntensity(evType){
  const g=fd('effectIntensity')||'med';
  if(g==='off') return 'off';
  if(['raid','giftbomb','sub'].includes(evType)){
    if(g==='low') return 'med';
    if(g==='med') return 'high';
    return 'high';
  }
  return g;
}

function triggerEffects(evType,name){
  const col=EVC[evType]||'#ffffff';
  const intensity=getIntensity(evType);
  if(intensity==='off') return;
  const dur={low:.6,med:.9,high:1.5}[intensity]||.9;
  sv('--ev',col); sv('--ev-dur',dur+'s');
  fire('ev-flood','on',dur*1000);
  if(intensity!=='low'&&fd('effectWave')!==false) fire('ev-wave','on',dur*1000+200);
  fire('ev-border','on',dur*1000);
  if(intensity!=='low'&&fd('effectRings')!==false) fire('ev-rings','on',dur*1000+300);
  if(fd('effectText')!==false) showEvText(evType,name,intensity,dur*1000+400);
  if(intensity==='high'&&fd('effectLightning')!==false) fire('ev-lightning','on',600);
  if(fd('showParticles')!==false) burstParticles(col,{low:6,med:14,high:28}[intensity]||10);
  // Flash coins
  flashCorners(col);
}

function fire(id,cls,durationMs){
  const el=$(id); if(!el) return;
  el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls);
  setTimeout(()=>el.classList.remove(cls),durationMs+200);
}

function flashCorners(col){
  sv('--ev',col);
  document.querySelectorAll('.cc').forEach(c=>{
    c.classList.add('ev-flash');
    setTimeout(()=>c.classList.remove('ev-flash'),700);
  });
}

function showEvText(evType,name,intensity,clearMs){
  const el=$('ev-text'); if(!el) return;
  const labels=EVL[evType]||['EVENT !'];
  const sz={low:'sz-low',med:'sz-med',high:'sz-high'}[intensity]||'sz-med';
  el.innerHTML=`<div class="ev-type">${pick(labels)}</div><div class="ev-name ${sz}">${name||''}</div>`;
  el.classList.remove('on'); void el.offsetWidth; el.classList.add('on');
  setTimeout(()=>{el.classList.remove('on');el.innerHTML='';},clearMs);
}

/* ── Particules ── */
function spawnParticle(){
  if(fd('showParticles')===false) return;
  const c=$('cam-particles'); if(!c) return;
  const cyber=(fd('theme')||'diablo')==='cyber';
  const cols=cyber?['#00ffcc','#0055ff','#ff00aa','#fff']:['#c8922a','#8b0000','#ff6b00','#f0c060','#fff'];
  const fmt=fd('camFormat')||'16:9', s=SIZES[fmt]||SIZES['16:9'];
  const el=document.createElement('div'); el.className='cp';
  const sz=rand(2,5),dur=rand(3,7),col=cols[rint(0,cols.length-1)];
  const x=rand(4,s.w-4),y=rand(4,s.h-4),dx=rand(-70,70),dy=-rand(40,160),dx2=rand(-30,30),dy2=-rand(20,80),op=rand(.3,.85);
  el.style.cssText=`width:${sz}px;height:${sz}px;left:${x}px;top:${y}px;background-color:${col};box-shadow:0 0 ${sz*2.2}px ${col};--dx:${dx}px;--dy:${dy}px;--dx2:${dx2}px;--dy2:${dy2}px;--op:${op};animation-duration:${dur}s;animation-delay:${rand(0,.4)}s;`;
  c.appendChild(el); el.addEventListener('animationend',()=>{try{el.remove();}catch(e){}});
}
function burstParticles(col,n){
  const c=$('cam-particles'); if(!c) return;
  const fmt=fd('camFormat')||'16:9', s=SIZES[fmt]||SIZES['16:9'];
  for(let i=0;i<n;i++) setTimeout(()=>{
    const el=document.createElement('div');el.className='cp';
    const sz=rand(3,9),dur=rand(1,2.6),x=rand(0,s.w),y=rand(0,s.h),dx=rand(-130,130),dy=rand(-150,-30);
    el.style.cssText=`width:${sz}px;height:${sz}px;left:${x}px;top:${y}px;background-color:${col};box-shadow:0 0 ${sz*2.8}px ${col};--dx:${dx}px;--dy:${dy}px;--dx2:${dx*.3}px;--dy2:${dy*.4}px;--op:.95;animation-duration:${dur}s;`;
    c.appendChild(el);el.addEventListener('animationend',()=>{try{el.remove();}catch(e){}});
  },i*30);
}
function startParticles(){
  clearInterval(ptimer);
  if(fd('showParticles')===false) return;
  const d=num(fd('particleDensity'),3);
  ptimer=setInterval(spawnParticle,Math.max(80,600/d));
  spawnParticle(); spawnParticle();
}

/* ══ COINS ══ */
function buildCorners(){
  const cyber=(fd('theme')||'diablo')==='cyber';
  document.querySelectorAll('.cc').forEach(c=>{c.innerHTML=cyber?ccCyber():ccDiablo();});
}
const ccDiablo=()=>`<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
  <polyline points="57,3 3,3 3,57" fill="none" stroke="var(--p)" stroke-width="2.5" stroke-linecap="square"/>
  <polyline points="57,8 8,8 8,57" fill="none" stroke="var(--s)" stroke-width="1.2" stroke-linecap="square" opacity=".6"/>
  <circle cx="3" cy="3" r="5" fill="var(--bg)" stroke="var(--p)" stroke-width="1.5"/>
  <circle cx="3" cy="3" r="2.5" fill="var(--s)"/>
  <circle cx="3" cy="3" r="1.1" fill="var(--ac)"/>
  <polygon points="55,3 57,1 59,3 57,5" fill="var(--p)"/>
  <polygon points="3,55 1,57 3,59 5,57" fill="var(--p)"/>
  <polygon points="31,3 33,1 35,3 33,5" fill="var(--s)" opacity=".7"/>
  <line x1="8" y1="8" x2="20" y2="20" stroke="var(--p)" stroke-width=".8" opacity=".5"/>
  <polygon points="20,20 16,26 26,16" fill="var(--p)" opacity=".45"/>
</svg>`;
const ccCyber=()=>`<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
  <polyline points="57,3 3,3 3,57" fill="none" stroke="var(--p)" stroke-width="2"/>
  <line x1="57" y1="3" x2="40" y2="3" stroke="var(--ac)" stroke-width="1.5" opacity=".6"/>
  <line x1="3" y1="40" x2="3" y2="57" stroke="var(--s)" stroke-width="1.5" opacity=".6"/>
  <rect x="0" y="0" width="8" height="8" fill="var(--p)"/>
  <rect x="1" y="1" width="6" height="6" fill="var(--bg)"/>
  <rect x="2.5" y="2.5" width="3" height="3" fill="var(--ac)"/>
  <rect x="26" y="1" width="8" height="4" fill="var(--s)" opacity=".45"/>
</svg>`;

/* ══ BADGE LIVE ══ */
function updateLiveBadge(){
  const badge=$('live-badge');
  if(!badge) return;
  badge.classList.toggle('show', fd('showLiveBadge')!==false);
}

/* ══ APPLY ALL ══ */
function applyAll(){
  const root=$('cam-root');
  const theme=fd('theme')||'diablo';
  root.classList.toggle('cyber', theme==='cyber');
  root.classList.toggle('glitch', fd('glitchEffect')===true);
  sv('--scan', fd('scanlines')?'block':'none');
  sv('--gop',  (num(fd('glowIntensity'),90)/100)+'');
  const fmt=fd('camFormat')||'16:9', s=SIZES[fmt]||SIZES['16:9'];
  sv('--cw',s.w+'px'); sv('--ch',s.h+'px'); sv('--cs',s.cs+'px'); sv('--bw',s.bw+'px');
  root.classList.toggle('band-bottom', (fd('bandPos')||'top')==='bottom');
  const nt=$('cam-nametext'); if(nt) nt.textContent=fd('channelName')||'Paglorieux';
  const tag=$('cam-nametag'),tp=fd('channelTagPos')||'auto';
  if(tag&&tp!=='auto'){tag.style.top=tp==='top'?'9px':'auto';tag.style.bottom=tp==='bottom'?'9px':'auto';}
  buildCorners();
  updateLiveBadge();
  startGoalSwitcher();
  startParticles();
}

/* ══ SE LISTENERS ══ */
window.addEventListener('onWidgetLoad',function(obj){
  FD=obj?.detail?.fieldData||{};
  streamStart=Date.now();
  const data=obj?.detail?.session?.data||{};
  try{
    const tot=data['follower-total']?.count??null;
    if(tot!==null) followers=parseInt(tot);
    const lf=data['follower-latest'];   if(lf?.name) live.follow=lf.name;
    const ls=data['subscriber-latest']; if(ls?.name) live.sub=ls.name;
    const lb=data['cheer-latest'];      if(lb?.name) live.bits=`${lb.name} • ${lb.amount} bits`;
    const ld=data['tip-latest'];        if(ld?.name) live.don=`${ld.name} • ${parseFloat(ld.amount||0).toFixed(2)}€`;
  }catch(e){}
  applyAll();
  startRotation();
});

window.addEventListener('onEventReceived',function(obj){
  if(!obj?.detail) return;
  const{listener:L,event:E}=obj.detail; if(!E) return;
  if(L==='follower-latest'){
    live.follow=E.name||'—';
    if(followers!==null) followers++;
    renderGoalBar(goalMode);
    triggerEffects('follow',E.name);
  } else if(L==='subscriber-latest'){
    live.sub=E.gifted?`${E.name} • ${E.sender||'?'}`:(E.name||'—');
    triggerEffects(E.gifted?'gift':parseInt(E.months||0)>1?'resub':'sub',E.name);
  } else if(L==='communityGiftPurchase-latest'){
    triggerEffects('giftbomb',`${E.amount} abonnements de ${E.name}`);
  } else if(L==='cheer-latest'){
    live.bits=`${E.name||'—'} • ${E.amount} bits`;
    triggerEffects('bits',`${E.amount} bits de ${E.name}`);
  } else if(L==='tip-latest'){
    live.don=`${E.name||'—'} • ${parseFloat(E.amount||0).toFixed(2)}€`;
    triggerEffects('don',`${parseFloat(E.amount||0).toFixed(2)}€ de ${E.name}`);
  } else if(L==='raid-latest'){
    live.raid=`${E.name} (${E.raiders||0})`;
    triggerEffects('raid',`${E.name} • ${E.raiders||0} viewers`);
  }
});

window.addEventListener('onSessionUpdate',function(obj){
  try{
    const data=obj?.detail?.session||{};
    const tot=data['follower-total']?.count??null;
    if(tot!==null){ followers=parseInt(tot); renderGoalBar(goalMode); }
  }catch(e){}
});
