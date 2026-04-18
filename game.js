// ═══════════════════════════════════════════════════
//  DRAGON FARM Z — Full Feature Engine
//  Multiple Crops · Daily Missions · Trade · Cities
// ═══════════════════════════════════════════════════
const canvas=document.getElementById('gameCanvas');
const ctx=canvas.getContext('2d');
ctx.imageSmoothingEnabled=false;
function resizeCanvas(){canvas.width=window.innerWidth;canvas.height=window.innerHeight;}
resizeCanvas(); window.addEventListener('resize',resizeCanvas);

const TILE=48, MAP_W=32, MAP_H=24;
const T={GRASS:0,DIRT:1,WATER:2,TILLED:3,PLANTED:4,GROWING:5,READY:6,
  PATH:7,HOUSE:8,SHOP:9,TREE:10,ROCK:11,FLOWER:12,FENCE:13,WOOD_FLOOR:14,DEEP_WATER:15,SAND:16};

// ═══════════════════════════════════════════════════
//  CROP DEFINITIONS
// ═══════════════════════════════════════════════════
const CROPS = {
  carrot:  {name:'Carrot',  emoji:'🥕', seedEmoji:'🌱', color:'#FF7A00', growDays:1, sellPrice:15,  seedCost:5,   powerBonus:100, special:null,          desc:'Fast grower, reliable income'},
  tomato:  {name:'Tomato',  emoji:'🍅', seedEmoji:'🌿', color:'#e74c3c', growDays:2, sellPrice:30,  seedCost:12,  powerBonus:150, special:'regrow',       desc:'Regrows after harvest!'},
  corn:    {name:'Corn',    emoji:'🌽', seedEmoji:'🌾', color:'#f1c40f', growDays:3, sellPrice:55,  seedCost:20,  powerBonus:250, special:'powerBoost',   desc:'+250 Power Level on harvest'},
  strawberry:{name:'Strawberry',emoji:'🍓',seedEmoji:'🌱',color:'#e91e63',growDays:2,sellPrice:45,seedCost:18, powerBonus:120, special:'restoreKi',     desc:'Restores 20 Ki on harvest'},
  senzu:   {name:'Senzu',   emoji:'🫘', seedEmoji:'🌱', color:'#27ae60', growDays:5, sellPrice:150, seedCost:50,  powerBonus:300, special:'senzuCrop',    desc:'Adds 1 Senzu Bean on harvest!'},
  moonflower:{name:'Moon Flower',emoji:'🌸',seedEmoji:'🌸',color:'#9b59b6',growDays:4,sellPrice:100,seedCost:40,powerBonus:200, special:'nightOnly',    desc:'Only grows when watered at night'},
  starfruit:{name:'Star Fruit',emoji:'⭐',seedEmoji:'✨',color:'#FFD700',growDays:6,sellPrice:200, seedCost:80,  powerBonus:500, special:'powerSurge',   desc:'Rare — massive power level surge!'},
  dragonpepper:{name:'Dragon Pepper',emoji:'🌶️',seedEmoji:'🌱',color:'#c0392b',growDays:4,sellPrice:80,seedCost:30,powerBonus:200,special:'kiBlast',   desc:'Triggers Ki explosion on harvest'},
};

// ═══════════════════════════════════════════════════
//  CITY DEFINITIONS
// ═══════════════════════════════════════════════════
const CITIES = {
  home: {
    name:"Home Farm",icon:"🏡",unlocked:true,expanded:false,
    expandCost:0,expandPL:0,
    multipliers:{carrot:1,tomato:1,corn:1,strawberry:1,senzu:1,moonflower:1,starfruit:1,dragonpepper:1},
    desc:"Your starting farm",passiveIncome:0,
  },
  westcity: {
    name:"West City",icon:"🏙️",unlocked:false,expanded:false,
    expandCost:5000,expandPL:10000,
    multipliers:{carrot:1.5,tomato:2,corn:2,strawberry:1.5,senzu:1,moonflower:1,starfruit:1,dragonpepper:1.5},
    desc:"City market — Tomato & Corn sell 2×!",passiveIncome:50,
  },
  korinstower:{
    name:"Korin's Tower",icon:"🗼",unlocked:false,expanded:false,
    expandCost:15000,expandPL:20000,
    multipliers:{carrot:1,tomato:1,corn:1.5,strawberry:2,senzu:5,moonflower:3,starfruit:2,dragonpepper:1},
    desc:"Sacred tower — Senzu Beans sell 5×!",passiveIncome:150,
  },
  namek:{
    name:"Planet Namek",icon:"🌍",unlocked:false,expanded:false,
    expandCost:50000,expandPL:50000,
    multipliers:{carrot:2,tomato:2,corn:2,strawberry:2,senzu:3,moonflower:4,starfruit:10,dragonpepper:3},
    desc:"Star Fruit sells 10×! All crops premium prices",passiveIncome:500,
  },
  capsulecorp:{
    name:"Capsule Corp HQ",icon:"🏭",unlocked:false,expanded:false,
    expandCost:100000,expandPL:80000,
    multipliers:{carrot:3,tomato:3,corn:3,strawberry:3,senzu:4,moonflower:5,starfruit:8,dragonpepper:5},
    desc:"Highest volume trading hub — all at 3× minimum!",passiveIncome:1000,
  },
};

// ═══════════════════════════════════════════════════
//  DAILY MISSION TEMPLATES
// ═══════════════════════════════════════════════════
const MISSION_TEMPLATES = [
  {id:'harvest5',   text:'Harvest 5 crops',       type:'harvest', target:5,  reward:{zeni:500,  pl:200},  rewardText:'+500 Zeni +200 PL'},
  {id:'harvest10',  text:'Harvest 10 crops',      type:'harvest', target:10, reward:{zeni:1200, pl:500},  rewardText:'+1200 Zeni +500 PL'},
  {id:'water8',     text:'Water 8 crop tiles',    type:'water',   target:8,  reward:{zeni:300,  pl:100},  rewardText:'+300 Zeni +100 PL'},
  {id:'plant5',     text:'Plant 5 seeds',         type:'plant',   target:5,  reward:{zeni:200,  pl:80},   rewardText:'+200 Zeni +80 PL'},
  {id:'till6',      text:'Till 6 soil tiles',     type:'till',    target:6,  reward:{zeni:250,  pl:100},  rewardText:'+250 Zeni +100 PL'},
  {id:'talk3',      text:'Talk to all villagers', type:'talk',    target:3,  reward:{zeni:400,  pl:150},  rewardText:'+400 Zeni +150 PL'},
  {id:'earn1000',   text:'Earn 1000 Zeni today',  type:'earn',    target:1000,reward:{zeni:500, pl:200},  rewardText:'+500 Zeni +200 PL'},
  {id:'corn1',      text:'Harvest 1 Corn',        type:'harvestCrop',cropId:'corn',target:1,reward:{zeni:300,pl:150},rewardText:'+300 Zeni +150 PL'},
  {id:'senzu1',     text:'Harvest a Senzu crop',  type:'harvestCrop',cropId:'senzu',target:1,reward:{zeni:800,pl:400},rewardText:'+800 Zeni +400 PL'},
  {id:'starfruit1', text:'Harvest a Star Fruit',  type:'harvestCrop',cropId:'starfruit',target:1,reward:{zeni:1500,pl:800},rewardText:'+1500 Zeni +800 PL'},
  {id:'trade1',     text:'Complete 1 trade',      type:'trade',   target:1,  reward:{zeni:600,  pl:250},  rewardText:'+600 Zeni +250 PL'},
  {id:'fly',        text:'Fly on Nimbus today',   type:'fly',     target:1,  reward:{zeni:150,  pl:50},   rewardText:'+150 Zeni +50 PL'},
];

// ═══════════════════════════════════════════════════
//  GAME STATE
// ═══════════════════════════════════════════════════
const state = {
  day:1, hour:6, minute:0,
  gold:999999, // GOD MODE
  ki:100, maxKi:100,
  powerLevel:9001,
  senzu:3,
  ssj:false, ssj2:false,
  flyMode:false,
  tool:'nimbus',
  activeCropId:'carrot',
  // Crop inventory: { cropId: {seeds:N, harvested:N} }
  inventory:{
    carrot:{seeds:10, harvested:0},
    tomato:{seeds:3,  harvested:0},
    corn:{seeds:2,    harvested:0},
    strawberry:{seeds:2,harvested:0},
    senzu:{seeds:0,   harvested:0},
    moonflower:{seeds:0,harvested:0},
    starfruit:{seeds:0, harvested:0},
    dragonpepper:{seeds:0,harvested:0},
  },
  // Daily missions
  missions:[], missionProgress:{},
  dailyEarned:0,
  dailyTrades:0,
  dailyFlew:false,
  talkedToday:new Set(),
  // Cities
  cities: JSON.parse(JSON.stringify(CITIES)),
  // Trade history
  tradeLog:[],
  // Passive income timer
  passiveTimer:0,
};

// Generate 3 random daily missions
function generateMissions(){
  state.missions=[];
  state.missionProgress={};
  state.dailyEarned=0;
  state.dailyTrades=0;
  state.dailyFlew=false;
  state.talkedToday=new Set();
  const pool=[...MISSION_TEMPLATES];
  for(let i=pool.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];}
  state.missions=pool.slice(0,3);
  state.missions.forEach(m=>{ state.missionProgress[m.id]=0; });
  renderMissions();
}

function renderMissions(){
  const list=document.getElementById('mission-list');
  if(!list) return;
  list.innerHTML='';
  state.missions.forEach(m=>{
    const prog=Math.min(state.missionProgress[m.id]||0, m.target);
    const done=prog>=m.target;
    const pct=Math.min(100,(prog/m.target)*100);
    const div=document.createElement('div');
    div.className='mission-item'+(done?' done':'');
    div.innerHTML=done
      ?`<div class="mission-name">${m.text}</div><div class="mission-done-text">✅ COMPLETE! ${m.rewardText}</div>`
      :`<div class="mission-name">${m.text}</div>
        <div class="mission-progress"><div class="mission-bar" style="width:${pct}%"></div></div>
        <div class="mission-reward">${prog}/${m.target} · ${m.rewardText}</div>`;
    list.appendChild(div);
  });
}

function advanceMission(type, cropId=null, amount=1){
  state.missions.forEach(m=>{
    if(m.done) return;
    let matches=false;
    if(m.type===type && !m.cropId) matches=true;
    if(m.type===type && m.cropId && m.cropId===cropId) matches=true;
    if(matches){
      const prev=state.missionProgress[m.id]||0;
      state.missionProgress[m.id]=prev+amount;
      if(state.missionProgress[m.id]>=m.target && !m.done){
        m.done=true;
        state.gold+=m.reward.zeni;
        state.powerLevel+=m.reward.pl;
        showMissionToast(`🎉 MISSION DONE!\n${m.text}\n${m.rewardText}`);
        checkSSJ(); updateUI();
      }
    }
  });
  renderMissions();
}

function showMissionToast(msg){
  const t=document.getElementById('mission-toast');
  t.textContent=msg; t.classList.remove('hidden');
  setTimeout(()=>t.classList.add('hidden'),2800);
}

// ═══════════════════════════════════════════════════
//  MAP
// ═══════════════════════════════════════════════════
const map=[], farmData={};
const treePositions=new Set();

function initMap(){
  for(let y=0;y<MAP_H;y++){map[y]=[];for(let x=0;x<MAP_W;x++) map[y][x]=T.GRASS;}
  for(let y=0;y<MAP_H;y++){map[y][MAP_W-1]=T.DEEP_WATER;map[y][MAP_W-2]=T.WATER;map[y][MAP_W-3]=T.WATER;map[y][MAP_W-4]=T.SAND;}
  for(let y=6;y<16;y++) for(let x=4;x<16;x++) map[y][x]=T.DIRT;
  for(let x=0;x<MAP_W-4;x++) map[5][x]=T.PATH;
  for(let y=0;y<MAP_H;y++) map[y][1]=T.PATH;
  for(let x=1;x<MAP_W-4;x++) map[MAP_H-1][x]=T.PATH;
  for(let y=5;y<MAP_H;y++) map[y][17]=T.PATH;
  for(let y=1;y<5;y++) for(let x=2;x<6;x++) map[y][x]=T.WOOD_FLOOR;
  for(let y=1;y<5;y++) for(let x=19;x<24;x++) map[y][x]=T.WOOD_FLOOR;
  // Fence: sides only, with gates (open gaps) for player to enter/exit freely
  // Top fence row with gate in middle
  for(let x=3;x<9;x++)  map[5][x]=T.FENCE;   // left half top
  for(let x=12;x<17;x++) map[5][x]=T.FENCE;  // right half top (gap 9-11 = 3 tile gate)
  // Bottom fence row with gate
  for(let x=3;x<9;x++)  map[16][x]=T.FENCE;
  for(let x=12;x<17;x++) map[16][x]=T.FENCE;
  // Left and right side fences with gaps
  for(let y=6;y<11;y++)  map[y][3]=T.FENCE;   // left top
  for(let y=13;y<16;y++) map[y][3]=T.FENCE;   // left bottom (gap 11-12)
  for(let y=6;y<11;y++)  map[y][16]=T.FENCE;  // right top
  for(let y=13;y<16;y++) map[y][16]=T.FENCE;  // right bottom
  [[8,1],[9,1],[10,1],[11,1],[12,1],[1,7],[1,9],[1,11],[1,13],[1,15],[1,17],[1,19],
   [18,8],[18,10],[18,12],[18,14],[18,16],[18,18],[20,6],[22,7],[24,6],[26,8],[28,6],
   [5,18],[7,18],[9,19],[11,18],[13,19]].forEach(([x,y])=>{
    if(map[y]?.[x]===T.GRASS){map[y][x]=T.TREE;treePositions.add(`${x},${y}`);}
  });
  [[19,5],[21,4],[23,5],[25,4],[6,20],[10,21],[14,20]].forEach(([x,y])=>{
    if(map[y]?.[x]===T.GRASS) map[y][x]=T.ROCK;
  });
  [[8,3],[9,3],[15,3],[6,3],[7,4],[20,9],[22,11],[20,13],[22,15]].forEach(([x,y])=>{
    if(map[y]?.[x]===T.GRASS) map[y][x]=T.FLOWER;
  });
}

// ═══════════════════════════════════════════════════
//  PLAYER & NPCS
// ═══════════════════════════════════════════════════
const player={x:7*TILE,y:9*TILE,vx:0,vy:0,speed:2.8,flySpeed:5,width:32,height:40,
  dir:'down',animFrame:0,animTimer:0,nimbusTimer:0,_lastToolUse:0};

const NPCS=[
  // Zenko — the cheerful warrior buddy, stays near the river
  {id:'krillin',name:'Zenko',color:'#f0c060',
   x:25*TILE,y:18*TILE,
   wanderBounds:{x1:22*TILE,y1:16*TILE,x2:27*TILE,y2:22*TILE},
   dialogues:[
     "Zenko here! Been meditating by the river all morning.",
     "Always carry Ki-Berries on you. Ran out once mid-battle. Bad idea.",
     "Dark energy spotted near the eastern cliffs. Stay sharp!",
     "Farming with life energy is the most powerful thing I have ever seen.",
     "FLASH BLIND! ...just kidding. Do not worry about your crops.",
   ],
   dialogueIndex:0,vx:0,vy:0,wanderTimer:0,animFrame:0,animTimer:0},

  // Lyra — the inventor shopkeeper, stays near her shop building
  {id:'bulma',name:'Lyra',color:'#60a0f0',
   x:21*TILE,y:5*TILE,
   wanderBounds:{x1:19*TILE,y1:4*TILE,x2:25*TILE,y2:7*TILE},
   dialogues:[
     "Lyra here! Welcome to my depot. Walk up and press E to shop.",
     "Your energy reading is insane! The soil literally glows around you.",
     "I built a Harvest Scanner — detects ripe crops from 3 fields away.",
     "My partner thinks farming is beneath a warrior. I disagreed. Loudly.",
     "Star Fruit traded to the outer colonies sells for 10 times the price!",
   ],
   dialogueIndex:0,vx:0,vy:0,wanderTimer:0,animFrame:0,animTimer:0},

  // Elder Torr — the ancient guide, wandering teacher, rich tutorials
  {id:'roshi',name:'Elder Torr',color:'#80c080',
   x:3*TILE,y:20*TILE,
   wanderBounds:{x1:2*TILE,y1:17*TILE,x2:7*TILE,y2:23*TILE},
   // Rich tutorial dialogues — cycles through teaching the player everything
   dialogues:[
     "Ah, a young farmer. Listen well. Press T to till the soil, then S to plant a seed. Water it with G. Sleep with SPACE to grow it. Then H to harvest. That is the full cycle of life.",
     "You see those 8 crop types? Press S once to select the Seed tool, then press S again to cycle through Carrot, Tomato, Corn, Strawberry and more. Or use keys 1 through 8 for quick select.",
     "The Tomato is special — it REGROWS after harvest. No replanting needed. Plant once, harvest forever. That is wisdom worth more than gold.",
     "Moon Flower is the rarest of all. It only grows if you water it at NIGHT — after 8pm. Come back when the stars are out. Patience, young one.",
     "Press F to summon the Golden Cloud and fly above everything. On windy days, fly faster. On storm days, stay grounded — lightning is no friend to a cloud rider.",
     "Each morning brings new weather. Rain waters your crops for free. Aurora gives you 500 Power Level for no effort. Full Moon nights are dangerous — the ancient beast stirs.",
     "Talk to Lyra near the blue building — press E when you see her shop icon. She sells seeds and you can sell your harvest there too. Always sell to the highest bidder.",
     "Press R to open Trade Routes. Once you unlock West City, your Tomato and Corn sell at 2 times the price. Unlock Korin Tower and Senzu crops sell at 5 times. Namek gives you 10 times for Star Fruit.",
     "Complete your three Daily Missions each day. They reset every morning. The rewards stack your Power Level fast. At 15000 Power Level you transform — and the world trembles.",
     "I have farmed for 200 years. The secret? Harvest every crop that is ready before sleeping. Never let a ripe crop sit overnight. Every missed harvest is Zeni left on the ground.",
   ],
   dialogueIndex:0,vx:0,vy:0,wanderTimer:0,animFrame:0,animTimer:0},
];

const particles=[];
function spawnParticles(x,y,color,count=8,emoji=null){
  for(let i=0;i<count;i++){
    const angle=(Math.PI*2*i)/count+Math.random()*0.5,speed=1.5+Math.random()*2.5;
    particles.push({x,y,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed-1.5,
      life:1,decay:0.018+Math.random()*0.02,color,size:4+Math.random()*6,emoji});
  }
}

// ═══════════════════════════════════════════════════
//  PIXEL ART RENDERERS
// ═══════════════════════════════════════════════════
function px(x,y,w,h,color){ctx.fillStyle=color;ctx.fillRect(x,y,w,h);}

function drawGrassTile(x,y,seed){
  px(x,y,TILE,TILE,'#5a8a3c');
  const v=seed%4;
  if(v===0){px(x+2,y+2,20,18,'#62963f');px(x+26,y+18,18,16,'#507a35');}
  else if(v===1){px(x+8,y+4,28,20,'#5f9140');px(x+2,y+24,16,14,'#4d7532');}
  else if(v===2){px(x+4,y+8,22,28,'#639642');px(x+28,y+4,14,22,'#507a35');}
  else{px(x+10,y+10,28,28,'#5e8e3e');}
  const b1=(seed*13)%(TILE-14),b2=(seed*7+11)%(TILE-14);
  px(x+b1+2,y+4,2,7,'#3d6e26');px(x+b2+2,y+22,2,7,'#3d6e26');
  px(x,y,TILE,1,'rgba(0,0,0,0.05)');
}
function drawDirtTile(x,y){
  px(x,y,TILE,TILE,'#8B6340');px(x+3,y+3,14,10,'#7a5632');px(x+22,y+8,18,12,'#9a6e4a');
  px(x+8,y+28,22,12,'#7d5836');px(x+16,y+12,3,2,'#6a4828');px(x+36,y+36,4,3,'#6a4828');
}
function drawWaterTile(x,y,t,deep){
  const base=deep?'#1a5a8a':'#2272b0',mid=deep?'#1e6699':'#2a82c8';
  px(x,y,TILE,TILE,base);px(x+2,y+2,TILE-4,TILE-4,mid);
  [[4,6,20,4],[10,18,18,4],[6,32,22,4]].forEach(([ox,oy,ow,oh],i)=>{
    const alpha=0.25+Math.sin(t/400+i*0.8)*0.15;
    ctx.fillStyle=`rgba(255,255,255,${alpha})`;ctx.fillRect(x+ox,y+oy,ow,oh);
  });
}
function drawTilledTile(x,y){
  px(x,y,TILE,TILE,'#5c3a1e');
  for(let r=0;r<4;r++){const ry=y+4+r*10;px(x+2,ry,TILE-4,6,'#4a2e12');px(x+2,ry+1,TILE-4,2,'#3d2410');}
}
function drawPathTile(x,y){
  px(x,y,TILE,TILE,'#b89a70');px(x+1,y+1,22,22,'#c8aa80');px(x+24,y+1,22,22,'#bea070');
  px(x+1,y+24,22,22,'#bca070');px(x+24,y+24,22,22,'#c4a878');
  px(x,y+23,TILE,2,'#a08860');px(x+23,y,2,TILE,'#a08860');
}
function drawFence(x,y){
  drawGrassTile(x,y,(x+y)%7);
  px(x+4,y+8,6,32,'#c8a870');px(x+38,y+8,6,32,'#c8a870');
  px(x+4,y+8,6,4,'#e0c090');px(x+38,y+8,6,4,'#e0c090');
  px(x+8,y+14,32,5,'#d4b07a');px(x+8,y+28,32,5,'#d4b07a');
  px(x+8,y+14,32,2,'#e8c890');px(x+8,y+28,32,2,'#e8c890');
}
function drawWoodFloor(x,y){
  const p=['#8B6340','#7a5530','#9a7050'];
  for(let i=0;i<3;i++){px(x,y+i*16,TILE,15,p[i%3]);px(x+1,y+i*16+1,TILE-2,3,'#a87848');px(x,y+i*16+14,TILE,2,'#5a3818');}
  px(x+TILE/2,y,2,TILE,'rgba(0,0,0,0.07)');
}
function drawSandTile(x,y){
  px(x,y,TILE,TILE,'#d4b870');px(x+6,y+4,16,12,'#dcc478');px(x+28,y+18,14,10,'#ccb068');px(x+10,y+30,20,12,'#d8be74');
}
function drawFlowerTile(x,y,t){
  drawGrassTile(x,y,(x+y)%5);
  const bob=Math.sin(t/800+(x+y)*0.3)*1.5;
  px(x+TILE/2-1,y+TILE/2+bob,2,10,'#2d6e1e');
  const fc=['#FF6BA8','#FFD700','#FF8C42','#C084FC'][Math.floor((x+y)/TILE)%4];
  ctx.fillStyle=fc;
  [[-6,-6],[0,-8],[6,-6],[8,0],[6,6],[0,8],[-6,6],[-8,0]].forEach(([dx,dy2])=>{
    ctx.beginPath();ctx.ellipse(x+TILE/2+dx,y+TILE/2-4+dy2+bob,4,3,Math.atan2(dy2,dx),0,Math.PI*2);ctx.fill();
  });
  px(x+TILE/2-3,y+TILE/2-7+bob,6,6,'#FFD700');px(x+TILE/2-2,y+TILE/2-6+bob,4,4,'#FFA500');
}
function drawTree(x,y){
  ctx.fillStyle='rgba(0,0,0,0.18)';ctx.beginPath();ctx.ellipse(x+TILE+6,y+TILE*2-6,26,9,0,0,Math.PI*2);ctx.fill();
  px(x+TILE-8,y+TILE+10,18,30,'#5c3a18');px(x+TILE-6,y+TILE+10,4,30,'#6e4822');px(x+TILE+8,y+TILE+10,4,30,'#4a2e10');
  [['#2d6e1e',32,22],['#3a8a26',28,20],['#48a030',24,18],['#56ba3a',18,14]].forEach(([c,rx,ry],i)=>{
    ctx.fillStyle=c;ctx.beginPath();ctx.ellipse(x+TILE,y+TILE+6-i*10,rx,ry,0,0,Math.PI*2);ctx.fill();
  });
}
function drawRock(x,y){
  ctx.fillStyle='rgba(0,0,0,0.22)';ctx.beginPath();ctx.ellipse(x+TILE/2+4,y+TILE-6,18,6,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#7a7a80';ctx.beginPath();ctx.ellipse(x+TILE/2,y+TILE/2+2,18,14,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#909098';ctx.beginPath();ctx.ellipse(x+TILE/2-2,y+TILE/2,16,12,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#b0b0b8';ctx.beginPath();ctx.ellipse(x+TILE/2-5,y+TILE/2-4,7,5,-0.5,0,Math.PI*2);ctx.fill();
}

// Multi-crop draw
function drawCrop(x,y,cropId,stage,t){
  drawTilledTile(x,y);
  const crop=CROPS[cropId]||CROPS.carrot;
  if(stage===1){
    // Sprout
    px(x+TILE/2-1,y+TILE-14,2,8,'#3d8a20');
    ctx.fillStyle='#4aaa28';ctx.beginPath();ctx.ellipse(x+TILE/2+4,y+TILE-18,5,4,0.5,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.ellipse(x+TILE/2-4,y+TILE-20,5,4,-0.5,0,Math.PI*2);ctx.fill();
  } else if(stage===2){
    // Growing
    px(x+TILE/2-1,y+TILE-22,2,16,'#3d8a20');
    ctx.fillStyle='#56c232';
    [[5,-28,6,4,0.4],[-5,-30,6,4,-0.4],[3,-22,5,3,0.3]].forEach(([dx,dy2,rx,ry,rot])=>{
      ctx.beginPath();ctx.ellipse(x+TILE/2+dx,y+TILE+dy2,rx,ry,rot,0,Math.PI*2);ctx.fill();
    });
  } else if(stage===3){
    // Ready - show crop emoji
    px(x+TILE/2-1,y+TILE-28,2,18,'#3d8a20');
    ctx.font='22px serif';ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText(crop.emoji,x+TILE/2,y+TILE/2-4);
    // Sparkle
    const sp=(t/200+(x+y)/100)%1;
    ctx.fillStyle=`rgba(255,220,0,${0.6+sp*0.4})`;
    ctx.beginPath();ctx.arc(x+TILE-10+Math.cos(t/300)*3,y+6+Math.sin(t/300)*3,3+sp*2,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='rgba(255,255,255,0.8)';
    ctx.beginPath();ctx.arc(x+TILE-10+Math.cos(t/300)*3,y+6+Math.sin(t/300)*3,1.5,0,Math.PI*2);ctx.fill();
  }
}

function drawHouseBuilding(bx,by){
  const x=bx-cam.x,y=by-cam.y,w=TILE*4,h=TILE*3;
  ctx.fillStyle='rgba(0,0,0,0.18)';ctx.fillRect(x+8,y+h,w-4,12);
  px(x,y+h-8,w,16,'#8B7355');px(x,y+16,w,h-16,'#e8d4a0');px(x+2,y+18,w-4,h-20,'#f0dca8');
  px(x,y+16,w,6,'#8B6340');px(x,y+h-14,w,6,'#8B6340');
  ctx.fillStyle='#c0392b';ctx.beginPath();ctx.moveTo(x-10,y+18);ctx.lineTo(x+w/2,y-22);ctx.lineTo(x+w+10,y+18);ctx.closePath();ctx.fill();
  ctx.fillStyle='#e74c3c';ctx.beginPath();ctx.moveTo(x-6,y+18);ctx.lineTo(x+w/2,y-14);ctx.lineTo(x+8,y+18);ctx.closePath();ctx.fill();
  px(x+w/2-2,y-22,4,26,'#922b21');px(x+w-52,y-12,16,30,'#922b21');px(x+w-54,y-16,20,6,'#7b241c');
  px(x+w/2-12,y+h-40,24,40,'#6B4226');px(x+w/2-10,y+h-38,20,38,'#7d4e2e');
  px(x+w/2-10,y+h-38,20,8,'#8B5E3C');px(x+w/2+4,y+h-18,4,4,'#FFD700');
  [x+14,x+w-46].forEach(wx=>{
    px(wx,y+h-72,30,28,'#87CEEB');px(wx+2,y+h-70,12,24,'#a8dff0');
    px(wx,y+h-58,30,3,'#8B6340');px(wx+14,y+h-72,3,28,'#8B6340');
  });
  ctx.fillStyle='rgba(0,0,0,0.55)';ctx.fillRect(x+w/2-32,y+h-94,64,15);
  ctx.fillStyle='#FFD700';ctx.font='7px "Press Start 2P"';ctx.textAlign='center';ctx.fillText("GOKU'S FARM",x+w/2,y+h-83);
}

function drawShopBuilding(bx,by){
  const x=bx-cam.x,y=by-cam.y,w=TILE*5,h=TILE*3;
  ctx.fillStyle='rgba(0,0,0,0.18)';ctx.fillRect(x+8,y+h,w-4,12);
  px(x,y+20,w,h-20,'#1a237e');px(x+2,y+22,w-4,h-24,'#283593');
  px(x+w/2-42,y+28,84,54,'#0d47a1');
  ctx.fillStyle='#FFD700';ctx.font='bold 8px "Press Start 2P"';ctx.textAlign='center';
  ctx.fillText('CAPSULE',x+w/2,y+52);ctx.fillText('CORP',x+w/2,y+64);
  ctx.fillStyle='#FFD700';ctx.beginPath();ctx.arc(x+w/2,y+82,10,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#0d47a1';ctx.font='bold 10px sans-serif';ctx.fillText('CC',x+w/2,y+86);
  ctx.fillStyle='#FFD700';ctx.beginPath();ctx.moveTo(x-6,y+22);ctx.lineTo(x+w/2,y-12);ctx.lineTo(x+w+6,y+22);ctx.closePath();ctx.fill();
  ctx.fillStyle='#FFC107';ctx.beginPath();ctx.moveTo(x-4,y+22);ctx.lineTo(x+16,y+22);ctx.lineTo(x+w/2,y-4);ctx.closePath();ctx.fill();
  px(x+w/2-14,y+h-44,28,44,'#0a1a6e');px(x+w/2-12,y+h-42,24,42,'#1565C0');
  ctx.fillStyle=Math.floor(Date.now()/500)%2?'#00FF00':'#004400';
  ctx.beginPath();ctx.arc(x+w/2+8,y+h-22,3,0,Math.PI*2);ctx.fill();
  [x+12,x+w-52].forEach(wx=>{
    px(wx,y+h-76,34,28,'#1565C0');ctx.fillStyle='rgba(100,181,246,0.8)';ctx.fillRect(wx+2,y+h-74,30,24);
    px(wx,y+h-62,34,3,'#FFD700');px(wx+16,y+h-76,3,28,'#FFD700');
  });
  ctx.fillStyle='rgba(0,0,0,0.65)';ctx.fillRect(x+w/2-44,y+h-114,88,16);
  ctx.fillStyle='#00E5FF';ctx.font='6px "Press Start 2P"';ctx.textAlign='center';ctx.fillText("BULMA'S SHOP",x+w/2,y+h-103);
}

// ═══════════════════════════════════════════════════
//  INPUT
// ═══════════════════════════════════════════════════
const keys={};
window.addEventListener('keydown',e=>{keys[e.key.toLowerCase()]=true;handleAction(e.key.toLowerCase());});
window.addEventListener('keyup',e=>{keys[e.key.toLowerCase()]=false;});

function cycleCrop(dir=1){
  const ids=Object.keys(CROPS);
  const cur=ids.indexOf(state.activeCropId);
  state.activeCropId=ids[(cur+dir+ids.length)%ids.length];
  const crop=CROPS[state.activeCropId];
  const inv=state.inventory[state.activeCropId];
  renderSeedSelector();
  showMessage(`🌱 ${crop.emoji} ${crop.name} selected! (Seeds: ${inv.seeds}) — press S again to cycle`);
}

function handleAction(key){
  if(key==='e'){talkToNearbyNPC();return;}
  if(key==='r'){openTradeModal();return;}
  // S = select seed tool OR cycle crop if seed already active
  if(key==='s'){
    if(state.tool==='seed'){cycleCrop(1);}
    else{setTool('seed');}
    return;
  }
  const tm={f:'nimbus',t:'till',g:'water',h:'harvest'}; // W=move up, G=water
  if(tm[key]){setTool(tm[key]);return;}
  if(key===' '){nextDay();return;}
  if(key==='x'){useTool();return;}
  if(key==='z'&&state.senzu>0){
    state.senzu--;state.ki=state.maxKi;
    showMessage("🫘 Senzu Bean eaten! KI fully restored!");
    spawnParticles(player.x+16,player.y+20,'#39FF14',12,'✨');updateUI();
  }
  const cropKeys=['1','2','3','4','5','6','7','8'];
  const cropIds=Object.keys(CROPS);
  if(cropKeys.includes(key)){
    const idx=parseInt(key)-1;
    if(cropIds[idx]){state.activeCropId=cropIds[idx];renderSeedSelector();showMessage(`🌱 Active seed: ${CROPS[state.activeCropId].name}`);}
  }
}

function setTool(tool){
  state.tool=tool;
  document.querySelectorAll('.tool-btn').forEach(b=>b.classList.remove('active'));
  document.getElementById('tool-'+tool)?.classList.add('active');
  if(tool==='nimbus'){
    state.flyMode=!state.flyMode;player.speed=state.flyMode?player.flySpeed:2.8;
    if(state.flyMode){advanceMission('fly');state.dailyFlew=true;}
    showMessage(state.flyMode?"☁️ Nimbus activated! Soaring!":"☁️ Landed safely.");
  }
}

document.querySelectorAll('.tool-btn').forEach(btn=>btn.addEventListener('click',()=>setTool(btn.id.replace('tool-',''))));
document.getElementById('dialogue-close').addEventListener('click',()=>document.getElementById('dialogue-box').classList.add('hidden'));

// ═══════════════════════════════════════════════════
//  CAMERA
// ═══════════════════════════════════════════════════
const cam={x:0,y:0};
function updateCamera(){
  const tx=Math.max(0,Math.min(player.x-canvas.width/2+player.width/2,MAP_W*TILE-canvas.width));
  const ty=Math.max(0,Math.min(player.y-canvas.height/2+player.height/2,MAP_H*TILE-canvas.height));
  cam.x+=(tx-cam.x)*0.1;cam.y+=(ty-cam.y)*0.1;
}

// ═══════════════════════════════════════════════════
//  COLLISION & TOOL USE
// ═══════════════════════════════════════════════════
function isSolid(tx,ty){
  if(tx<0||ty<0||tx>=MAP_W||ty>=MAP_H) return true;
  if(state.flyMode) return false;
  const t=map[ty][tx];
  return t===T.WATER||t===T.DEEP_WATER||t===T.ROCK||t===T.FENCE||t===T.TREE||t===T.WOOD_FLOOR;
}

function getTileInFront(){
  const cx=player.x+player.width/2,cy=player.y+player.height/2;
  const off={down:[0,28],up:[0,-20],left:[-28,0],right:[28,0]};
  const[ox,oy]=off[player.dir];
  const tx=Math.floor((cx+ox)/TILE),ty=Math.floor((cy+oy)/TILE);
  return{tx,ty,tile:map[ty]?.[tx],key:`${tx},${ty}`};
}

function useTool(){
  const{tx,ty,tile,key}=getTileInFront();
  const cropId=state.activeCropId;
  const crop=CROPS[cropId];
  switch(state.tool){
    case 'till':
      if(tile===T.DIRT||tile===T.GRASS){
        map[ty][tx]=T.TILLED;farmData[key]={stage:0,watered:false,growTimer:0,cropId:null,daysToGrow:0};
        state.powerLevel+=50;showMessage("⚡ Ki-Tilled!");
        spawnParticles(tx*TILE+TILE/2,ty*TILE+TILE/2,'#8B6340',10);triggerKiBlast();
        advanceMission('till');updateUI();
      } break;
    case 'water':
      if((tile===T.PLANTED||tile===T.GROWING)&&farmData[key]){
        if(!farmData[key].watered){
          // Night check for moonflower
          if(farmData[key].cropId==='moonflower'&&state.hour>=6&&state.hour<20){
            showMessage("🌸 Moon Flower only grows when watered at night!");return;
          }
          farmData[key].watered=true;
          showMessage("💧 KAMEHAMEHA WATER BLAST!");
          spawnParticles(tx*TILE+TILE/2,ty*TILE+TILE/2,'#00BFFF',16,'💧');
          triggerKiBlast('water');advanceMission('water');updateUI();
        } else showMessage("💦 Already watered today!");
      } else showMessage("💧 Plant seeds first!");
      break;
    case 'seed':
      if(tile===T.TILLED){
        const inv=state.inventory[cropId];
        if(inv&&inv.seeds>0){
          map[ty][tx]=T.PLANTED;
          farmData[key]={stage:1,watered:false,growTimer:0,cropId,daysToGrow:crop.growDays};
          inv.seeds--;showMessage(`${crop.seedEmoji} ${crop.name} seed planted!`);
          spawnParticles(tx*TILE+TILE/2,ty*TILE+TILE/2,'#39FF14',6,crop.seedEmoji);
          advanceMission('plant');updateUI();renderSeedSelector();renderInventoryBar();
        } else {
          showMessage(`No ${crop.name} seeds! Buy from Bulma's shop.`);
        }
      } else showMessage("🌱 Till soil first!");
      break;
    case 'harvest':
      if(tile===T.READY&&farmData[key]){
        const fCropId=farmData[key].cropId||'carrot';
        const fCrop=CROPS[fCropId]||CROPS.carrot;
        const base=fCrop.sellPrice;
        const earned=Math.floor(base*0.8+Math.random()*base*0.4);
        // Regrow check
        if(fCrop.special==='regrow'){
          map[ty][tx]=T.PLANTED;
          farmData[key]={stage:1,watered:false,growTimer:0,cropId:fCropId,daysToGrow:fCrop.growDays};
          showMessage(`${fCrop.emoji} ${fCrop.name} harvested! Regrows automatically!`);
        } else {
          map[ty][tx]=T.TILLED;
          farmData[key]={stage:0,watered:false,growTimer:0,cropId:null,daysToGrow:0};
        }
        state.inventory[fCropId].harvested++;
        state.gold+=earned;state.dailyEarned+=earned;
        state.powerLevel+=fCrop.powerBonus;
        advanceMission('harvest');
        advanceMission('harvestCrop',fCropId);
        advanceMission('earn',null,earned);
        // Specials
        handleCropSpecial(fCrop,tx,ty);
        showMessage(`${fCrop.emoji} Harvested ${fCrop.name}! +${earned} Zeni +${fCrop.powerBonus} PL`);
        spawnParticles(tx*TILE+TILE/2,ty*TILE+TILE/2,'#FFD700',14,fCrop.emoji);
        checkSSJ();updateUI();renderInventoryBar();
      } else showMessage("🌾 Nothing ready here!");
      break;
  }
}

function handleCropSpecial(crop,tx,ty){
  switch(crop.special){
    case 'powerBoost':
      state.powerLevel+=500;showMessage(`🌽 CORN POWER BOOST! +500 Power Level!`);
      spawnParticles(tx*TILE+TILE/2,ty*TILE+TILE/2,'#FFD700',20,'⚡');break;
    case 'restoreKi':
      state.ki=Math.min(state.maxKi,state.ki+20);showMessage(`🍓 Strawberry Ki Restore! +20 Ki!`);
      spawnParticles(tx*TILE+TILE/2,ty*TILE+TILE/2,'#00BFFF',12,'💧');break;
    case 'senzuCrop':
      state.senzu++;showMessage(`🫘 SENZU BEAN HARVESTED! +1 Senzu Bean!`);
      spawnParticles(tx*TILE+TILE/2,ty*TILE+TILE/2,'#39FF14',20,'🫘');break;
    case 'powerSurge':
      state.powerLevel+=2000;showMessage(`⭐ STAR FRUIT POWER SURGE! +2000 Power Level!`);
      document.getElementById('transform-flash').classList.remove('hidden');
      setTimeout(()=>document.getElementById('transform-flash').classList.add('hidden'),800);
      spawnParticles(tx*TILE+TILE/2,ty*TILE+TILE/2,'#FFD700',30,'⭐');break;
    case 'kiBlast':
      triggerKiBlast();state.powerLevel+=300;showMessage(`🌶️ DRAGON PEPPER KI EXPLOSION! +300 PL!`);
      spawnParticles(tx*TILE+TILE/2,ty*TILE+TILE/2,'#FF3333',20,'🔥');break;
  }
}

// ═══════════════════════════════════════════════════
//  SHOP
// ═══════════════════════════════════════════════════
function buildShopUI(){
  // Seeds tab
  const seedsDiv=document.getElementById('shop-items-seeds');
  seedsDiv.innerHTML='';
  Object.entries(CROPS).forEach(([id,crop])=>{
    const div=document.createElement('div');div.className='shop-item';
    div.innerHTML=`<div class="shop-item-icon">${crop.seedEmoji}</div>
      <div class="shop-item-info"><div class="shop-item-name">${crop.name} Seeds ×5</div>
      <div class="shop-item-desc">${crop.desc} · Grows in ${crop.growDays} day(s)</div></div>
      <div class="shop-item-right"><div class="shop-item-cost">${crop.seedCost} Zeni</div>
      <button class="shop-buy-btn" data-buy="seed" data-crop="${id}" data-cost="${crop.seedCost}">BUY ×5</button></div>`;
    seedsDiv.appendChild(div);
  });
  // Items tab
  const itemsDiv=document.getElementById('shop-items-items');
  itemsDiv.innerHTML=`
    <div class="shop-item"><div class="shop-item-icon">🫘</div>
      <div class="shop-item-info"><div class="shop-item-name">Senzu Bean ×1</div><div class="shop-item-desc">Restores full Ki instantly</div></div>
      <div class="shop-item-right"><div class="shop-item-cost">30 Zeni</div>
      <button class="shop-buy-btn" data-buy="senzu" data-qty="1" data-cost="30">BUY</button></div></div>
    <div class="shop-item"><div class="shop-item-icon">🫘</div>
      <div class="shop-item-info"><div class="shop-item-name">Senzu Pack ×3</div><div class="shop-item-desc">Save 15 Zeni vs buying solo</div></div>
      <div class="shop-item-right"><div class="shop-item-cost">75 Zeni</div>
      <button class="shop-buy-btn" data-buy="senzu" data-qty="3" data-cost="75">BUY</button></div></div>`;
  // Sell tab
  const sellDiv=document.getElementById('shop-items-sell');
  sellDiv.innerHTML='';
  Object.entries(CROPS).forEach(([id,crop])=>{
    const qty=state.inventory[id]?.harvested||0;
    const div=document.createElement('div');div.className='shop-item';
    div.innerHTML=`<div class="shop-item-icon">${crop.emoji}</div>
      <div class="shop-item-info"><div class="shop-item-name">${crop.name} (Have: ${qty})</div>
      <div class="shop-item-desc">Base price: ${crop.sellPrice} Zeni each</div></div>
      <div class="shop-item-right"><div class="shop-item-cost">+${crop.sellPrice}/each</div>
      <button class="shop-buy-btn sell" data-buy="sell" data-crop="${id}" ${qty===0?'disabled':''}>SELL ALL</button></div>`;
    sellDiv.appendChild(div);
  });
  // Wire buttons
  document.querySelectorAll('.shop-buy-btn').forEach(btn=>{
    btn.addEventListener('click',handleShopBuy);
  });
  // Tabs
  document.querySelectorAll('.shop-tab').forEach(tab=>{
    tab.addEventListener('click',()=>{
      document.querySelectorAll('.shop-tab').forEach(t=>t.classList.remove('active'));
      document.querySelectorAll('.shop-tab-content').forEach(t=>t.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById('shop-items-'+tab.dataset.tab).classList.add('active');
    });
  });
}

function handleShopBuy(e){
  const btn=e.currentTarget;
  const type=btn.dataset.buy,cost=parseInt(btn.dataset.cost)||0;
  if(type==='seed'){
    const cid=btn.dataset.crop;
    // state.gold-=cost; // GOD MODE - free
    state.inventory[cid].seeds+=5;
    shopFeedback(`✅ Got 5 ${CROPS[cid].name} seeds!`);
    spawnParticles(player.x+16,player.y+20,'#39FF14',8,CROPS[cid].seedEmoji);
    buildShopUI();
  } else if(type==='senzu'){
    const qty=parseInt(btn.dataset.qty);
    // state.gold-=cost; // GOD MODE
    state.senzu+=qty;
    shopFeedback(`✅ Got ${qty} Senzu Bean(s)! Total: ${state.senzu}`);
  } else if(type==='sell'){
    const cid=btn.dataset.crop;
    const qty=state.inventory[cid].harvested;
    if(qty<=0){shopFeedback("Nothing to sell!","#FF3333");return;}
    const earned=qty*CROPS[cid].sellPrice;
    state.gold+=earned;state.dailyEarned+=earned;
    state.inventory[cid].harvested=0;
    advanceMission('earn',null,earned);
    shopFeedback(`✅ Sold ${qty} ${CROPS[cid].name} for ${earned} Zeni!`);
    spawnParticles(player.x+16,player.y+20,'#FFD700',12,'⭐');
    buildShopUI();
  }
  updateUI();renderInventoryBar();renderSeedSelector();
  document.getElementById('shop-gold-val').textContent=state.gold.toLocaleString();
}

function shopFeedback(msg,color='#39FF14'){
  const el=document.getElementById('shop-feedback');
  el.textContent=msg;el.style.color=color;
  setTimeout(()=>el.textContent='',2500);
}

function openShop(){
  buildShopUI();
  document.getElementById('shop-gold-val').textContent=state.gold.toLocaleString();
  document.getElementById('shop-modal').classList.remove('hidden');
}
document.getElementById('shop-close').addEventListener('click',()=>document.getElementById('shop-modal').classList.add('hidden'));

// ═══════════════════════════════════════════════════
//  TRADE MODAL
// ═══════════════════════════════════════════════════
function openTradeModal(){
  buildTradeUI();
  document.getElementById('trade-modal').classList.remove('hidden');
}
document.getElementById('trade-close').addEventListener('click',()=>document.getElementById('trade-modal').classList.add('hidden'));

function buildTradeUI(){
  const cityList=document.getElementById('city-list');
  cityList.innerHTML='';
  Object.entries(state.cities).forEach(([id,city])=>{
    if(id==='home') return;
    const div=document.createElement('div');
    div.className='city-card '+(city.unlocked?'unlocked':'locked');
    // Price tags
    const topCrops=Object.entries(city.multipliers)
      .filter(([,m])=>m>1).sort((a,b)=>b[1]-a[1]).slice(0,3);
    const priceTags=topCrops.map(([cid,m])=>`<span class="city-price-tag">${CROPS[cid].emoji} <span class="mult">${m}×</span></span>`).join('');
    const canExpand=!city.expanded&&state.powerLevel>=city.expandPL&&state.gold>=city.expandCost;
    const expandLabel=city.expanded?'✅ Expanded':canExpand?`Expand (${city.expandCost.toLocaleString()} Zeni)`:`🔒 Need PL ${city.expandPL.toLocaleString()}`;
    div.innerHTML=`
      <div class="city-top"><div class="city-icon">${city.icon}</div>
        <div><div class="city-name">${city.name}</div>
        <div class="city-status">${city.unlocked?(city.expanded?`✅ Your farm here! +${city.passiveIncome} Zeni/day`:'Trade route open'):'🔒 Locked'}</div></div></div>
      <div class="city-prices">${priceTags}</div>
      <div class="city-actions">
        ${city.unlocked?`<button class="city-btn" data-city="${id}" data-action="nimbus">☁️ Fly on Nimbus</button><button class="city-btn" data-city="${id}" data-action="trade" style="background:linear-gradient(135deg,#27ae60,#1e8449)">📦 Instant Trade</button>`:`<button class="city-btn" data-city="${id}" data-action="unlock" ${state.gold<city.expandCost||state.powerLevel<city.expandPL?'disabled':''}>🔓 Unlock (${city.expandCost.toLocaleString()} Zeni)</button>`}
        ${city.unlocked&&!city.expanded?`<button class="city-btn expand" data-city="${id}" data-action="expand" ${canExpand?'':'disabled'}>${expandLabel}</button>`:''}
      </div>`;
    cityList.appendChild(div);
  });
  // Inventory
  const invList=document.getElementById('trade-inv-list');
  invList.innerHTML='';
  Object.entries(state.inventory).forEach(([id,inv])=>{
    if(inv.harvested>0){
      const crop=CROPS[id];
      const slot=document.createElement('div');slot.className='trade-crop-slot';
      slot.innerHTML=`<div class="tcs-icon">${crop.emoji}</div><div class="tcs-name">${crop.name}</div><div class="tcs-qty">×${inv.harvested}</div>`;
      invList.appendChild(slot);
    }
  });
  if(invList.children.length===0) invList.innerHTML='<div style="font-size:6px;color:#666;">No harvested crops. Go harvest some!</div>';
  // Wire buttons
  document.querySelectorAll('.city-btn').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const cid=btn.dataset.city,action=btn.dataset.action;
      if(action==='unlock') unlockCity(cid);
      else if(action==='trade') tradeWithCity(cid);
      else if(action==='expand') expandToCity(cid);
      else if(action==='nimbus'){document.getElementById('trade-modal').classList.add('hidden');weather.nimbusTravel={target:cid,progress:0};showMessage('☁️ Goku jumps on Nimbus!');}
    });
  });
}

function unlockCity(cityId){
  const city=state.cities[cityId];
  if(state.gold<city.expandCost){tradeFeedback("Not enough Zeni!","#FF3333");return;}
  if(state.powerLevel<city.expandPL){tradeFeedback(`Need Power Level ${city.expandPL.toLocaleString()}!`,"#FF3333");return;}
  state.gold-=city.expandCost;
  city.unlocked=true;
  tradeFeedback(`✅ ${city.name} trade route opened!`);
  showMessage(`🚀 New trade route to ${city.name}!`);
  spawnParticles(player.x+16,player.y+20,'#FFD700',20,'🚀');
  updateUI();buildTradeUI();
}

function expandToCity(cityId){
  const city=state.cities[cityId];
  if(!city.unlocked){tradeFeedback("Unlock this city first!");return;}
  if(state.gold<city.expandCost){tradeFeedback("Not enough Zeni!","#FF3333");return;}
  if(state.powerLevel<city.expandPL){tradeFeedback(`Need Power Level ${city.expandPL.toLocaleString()}!`,"#FF3333");return;}
  state.gold-=city.expandCost;
  city.expanded=true;
  tradeFeedback(`✅ Farm expanded to ${city.name}! Now earning +${city.passiveIncome} Zeni/day`);
  showMessage(`🏭 Expanded to ${city.name}! Passive income: +${city.passiveIncome}/day`);
  spawnParticles(player.x+16,player.y+20,'#9b59b6',20,'🏭');
  updateUI();buildTradeUI();
}

function tradeWithCity(cityId){
  const city=state.cities[cityId];
  if(!city.unlocked){tradeFeedback("Unlock this city first!");return;}
  let totalEarned=0;let itemsSold=[];
  Object.entries(state.inventory).forEach(([id,inv])=>{
    if(inv.harvested>0){
      const crop=CROPS[id];
      const mult=city.multipliers[id]||1;
      const earned=Math.floor(inv.harvested*crop.sellPrice*mult);
      totalEarned+=earned;
      itemsSold.push(`${crop.emoji}×${inv.harvested} @ ${mult}×`);
      inv.harvested=0;
    }
  });
  if(totalEarned===0){tradeFeedback("Nothing to trade! Harvest some crops first.","#FF3333");return;}
  state.gold+=totalEarned;state.dailyEarned+=totalEarned;state.dailyTrades++;
  advanceMission('earn',null,totalEarned);advanceMission('trade');
  state.tradeLog.unshift({city:city.name,earned:totalEarned,day:state.day});
  tradeFeedback(`✅ Sold to ${city.name}: ${itemsSold.join(', ')} = +${totalEarned.toLocaleString()} Zeni!`);
  showMessage(`🚀 Trade complete! +${totalEarned.toLocaleString()} Zeni from ${city.name}!`);
  spawnParticles(player.x+16,player.y+20,'#FFD700',20,'💰');
  updateUI();renderInventoryBar();buildTradeUI();
}

function tradeFeedback(msg,color='#39FF14'){
  const el=document.getElementById('trade-feedback');
  el.textContent=msg;el.style.color=color;
  setTimeout(()=>el.textContent='',3000);
}

// ═══════════════════════════════════════════════════
//  NPC TALK
// ═══════════════════════════════════════════════════
function talkToNearbyNPC(){
  let closest=null,closestDist=Infinity;
  NPCS.forEach(npc=>{
    const dx=(npc.x+TILE/2)-(player.x+16),dy=(npc.y+TILE/2)-(player.y+20);
    const dist=Math.sqrt(dx*dx+dy*dy);
    if(dist<120&&dist<closestDist){closestDist=dist;closest=npc;}
  });
  if(closest){
    if(closest.id==='bulma'){openShop();return;}
    if(!state.talkedToday.has(closest.id)){
      state.talkedToday.add(closest.id);
      advanceMission('talk');
    }
    const line=closest.dialogues[closest.dialogueIndex%closest.dialogues.length];
    closest.dialogueIndex++;
    document.getElementById('dialogue-portrait').textContent=closest.id==='krillin'?'⚡':closest.id==='roshi'?'📜':'🐢';
    document.getElementById('dialogue-text').innerHTML=`<strong style="color:#FFD700">${closest.name}:</strong><br><br>${line}`;
    document.getElementById('dialogue-box').classList.remove('hidden');
  } else showMessage("💬 No one nearby! Walk up to a character.");
}

// ═══════════════════════════════════════════════════
//  GAME MECHANICS
// ═══════════════════════════════════════════════════
function growCrops(){
  Object.keys(farmData).forEach(key=>{
    const fd=farmData[key];
    if(!fd.cropId) return;
    const crop=CROPS[fd.cropId];
    if(!crop) return;
    if(fd.watered&&fd.stage<3){
      fd.growTimer++;
      const needed=Math.ceil(crop.growDays/2)||1;
      if(fd.growTimer>=needed){
        fd.stage++;fd.growTimer=0;
        const[x,y]=key.split(',').map(Number);
        if(fd.stage===1) map[y][x]=T.PLANTED;
        else if(fd.stage===2) map[y][x]=T.GROWING;
        else if(fd.stage===3) map[y][x]=T.READY;
      }
      fd.watered=false;
    }
  });
}

function collectPassiveIncome(){
  let total=0;
  Object.values(state.cities).forEach(city=>{
    if(city.expanded&&city.passiveIncome>0) total+=city.passiveIncome;
  });
  if(total>0){
    state.gold+=total;
    showMessage(`🏭 Passive income collected: +${total} Zeni from expanded cities!`);
    spawnParticles(player.x+16,player.y+20,'#FFD700',10,'💰');
  }
}

function nextDay(){
  growCrops();
  collectPassiveIncome();
  state.day++;state.hour=6;state.minute=0;
  state.ki=Math.min(state.maxKi,state.ki+40);
  player.flySpeed=state.ssj2?8:5; // reset wind bonus
  generateMissions();
  if(typeof rollWeather!=='undefined') rollWeather();
  spawnParticles(player.x+16,player.y+20,'#FFD700',20,'⭐');
  updateUI();
}

function checkSSJ(){
  if(state.powerLevel>=15000&&!state.ssj){
    state.ssj=true;state.maxKi=150;state.ki=150;
    showMessage("⚡ SUPER SAIYAN! Golden hair! Max Ki → 150!");
    document.getElementById('transform-flash').classList.remove('hidden');
    setTimeout(()=>document.getElementById('transform-flash').classList.add('hidden'),1000);updateUI();
  }
  if(state.powerLevel>=25000&&!state.ssj2){
    state.ssj2=true;state.maxKi=200;state.ki=200;player.flySpeed=8;
    showMessage("⚡⚡ SUPER SAIYAN 2! Lightning crackles! Nimbus faster!");
    document.getElementById('transform-flash').classList.remove('hidden');
    setTimeout(()=>document.getElementById('transform-flash').classList.add('hidden'),1500);updateUI();
  }
}

// ═══════════════════════════════════════════════════
//  UI RENDERING
// ═══════════════════════════════════════════════════
function renderSeedSelector(){
  const container=document.getElementById('seed-options');
  container.innerHTML='';
  Object.entries(CROPS).forEach(([id,crop],i)=>{
    const inv=state.inventory[id];
    const div=document.createElement('div');
    div.className='seed-opt'+(state.activeCropId===id?' active':'');
    div.title=`${crop.name} (Key ${i+1})`;
    div.innerHTML=`${crop.seedEmoji}<span class="seed-count">${inv.seeds}</span>`;
    div.addEventListener('click',()=>{state.activeCropId=id;renderSeedSelector();showMessage(`🌱 Active: ${crop.name}`);});
    container.appendChild(div);
  });
}

function renderInventoryBar(){
  const bar=document.getElementById('inv-crops-display');
  bar.innerHTML='';
  Object.entries(state.inventory).forEach(([id,inv])=>{
    if(inv.seeds>0||inv.harvested>0){
      const crop=CROPS[id];
      const slot=document.createElement('div');slot.className='inv-crop-slot';
      slot.innerHTML=`${crop.emoji}<span>🌱${inv.seeds} / 🧺${inv.harvested}</span>`;
      bar.appendChild(slot);
    }
  });
}

let msgTimeout;
function showMessage(text){
  const mb=document.getElementById('message-box');
  mb.textContent=text;mb.classList.remove('hidden');
  clearTimeout(msgTimeout);msgTimeout=setTimeout(()=>mb.classList.add('hidden'),3200);
}

function updateUI(){
  document.getElementById('day-count').textContent=state.day;
  document.getElementById('gold').textContent=state.gold.toLocaleString();
  document.getElementById('ki-bar').style.width=(state.ki/state.maxKi*100)+'%';
  document.getElementById('ki-value').textContent=`${state.ki}/${state.maxKi}`;
  document.getElementById('power-level').textContent=state.powerLevel.toLocaleString();
  document.getElementById('senzu-count').textContent=state.senzu;
  const h=state.hour,m=state.minute.toString().padStart(2,'0');
  document.getElementById('time-display').textContent=`${h}:${m} ${h<12?'AM':'PM'}`;
  // Saga name
  const sagas=[
    [0,'Saiyan Saga'],[10000,'Namek Saga'],[20000,'Cell Saga'],[30000,'Buu Saga'],[50000,'Tournament of Power']
  ];
  let saga='Saiyan Saga';
  sagas.forEach(([pl,name])=>{if(state.powerLevel>=pl)saga=name;});
  document.getElementById('saga-name').textContent=saga;
  if(state.ssj){
    document.getElementById('power-level').style.color='#FFD700';
    document.getElementById('power-level').style.textShadow='0 0 20px #FFD700,0 0 40px #FF6B00';
  }
  renderSeedSelector();renderInventoryBar();renderMissions();
}

function triggerKiBlast(type='ki'){
  const o=document.getElementById('ki-blast-overlay');
  o.classList.remove('blast');void o.offsetWidth;
  o.style.background=type==='water'?'radial-gradient(circle at center,rgba(0,191,255,0.5),transparent 70%)':'radial-gradient(circle at center,rgba(255,200,0,0.4),transparent 70%)';
  o.classList.add('blast');setTimeout(()=>o.classList.remove('blast'),500);
}

// ═══════════════════════════════════════════════════
//  DRAW PLAYER
// ═══════════════════════════════════════════════════
function drawPlayer(t){
  const sx=player.x-cam.x, sy=player.y-cam.y;
  const moving=Math.abs(player.vx)>0.1||Math.abs(player.vy)>0.1;
  if(moving){player.animTimer++;if(player.animTimer>8){player.animTimer=0;player.animFrame=(player.animFrame+1)%4;}}
  else player.animFrame=0;
  const legSwing=moving?Math.sin(player.animFrame/4*Math.PI*2)*5:0;
  const bodyBob=moving?Math.abs(Math.sin(player.animFrame/4*Math.PI*2))*2:0;
  const by=sy+bodyBob, cx=sx+16;

  // Nimbus cloud
  if(state.flyMode){
    player.nimbusTimer+=0.04;
    const bob=Math.sin(player.nimbusTimer)*4, ny=sy+player.height+10+bob;
    ctx.fillStyle='rgba(255,200,0,0.95)';ctx.beginPath();ctx.ellipse(cx,ny,30,12,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='rgba(255,240,140,0.8)';
    ctx.beginPath();ctx.ellipse(cx-14,ny-4,14,9,0,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.ellipse(cx+14,ny-4,14,9,0,0,Math.PI*2);ctx.fill();
    if(Math.abs(player.vx)>1||Math.abs(player.vy)>1){
      for(let i=1;i<5;i++){ctx.fillStyle=`rgba(255,210,60,${0.2-i*0.04})`;ctx.beginPath();ctx.ellipse(cx-player.vx*i*5,ny-player.vy*i*3,30-i*4,12-i*2,0,0,Math.PI*2);ctx.fill();}
    }
  }
  // Ground shadow
  ctx.fillStyle='rgba(0,0,0,0.22)';ctx.beginPath();ctx.ellipse(cx,sy+player.height+2,14,5,0,0,Math.PI*2);ctx.fill();
  // SSJ aura
  if(state.ssj){
    const aR=26+Math.sin(t/150)*3;
    const g=ctx.createRadialGradient(cx,by+20,2,cx,by+20,aR);
    g.addColorStop(0,'rgba(255,220,0,0.5)');g.addColorStop(0.6,'rgba(255,140,0,0.2)');g.addColorStop(1,'transparent');
    ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(cx,by+20,aR+6,aR+10,0,0,Math.PI*2);ctx.fill();
    for(let i=0;i<5;i++){const wa=t/180+i*(Math.PI*2/5);ctx.fillStyle=`rgba(255,230,0,${0.25+Math.sin(t/80+i)*0.15})`;ctx.beginPath();ctx.ellipse(cx+Math.cos(wa)*20,by+18+Math.sin(wa)*12,3,7,wa,0,Math.PI*2);ctx.fill();}
  }
  // Legs
  const lLegY=by+player.height-18+legSwing, rLegY=by+player.height-18-legSwing;
  ctx.fillStyle='#2a2a4a';
  ctx.beginPath();ctx.ellipse(sx+10,lLegY+7,5,8,0,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.ellipse(sx+22,rLegY+7,5,8,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#1a1a3a';
  ctx.beginPath();ctx.ellipse(sx+10,lLegY+15,7,5,0,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.ellipse(sx+22,rLegY+15,7,5,0,0,Math.PI*2);ctx.fill();
  // Body gi
  ctx.fillStyle='#FF6B00';ctx.beginPath();ctx.ellipse(cx,by+20,13,11,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#FF8C30';ctx.beginPath();ctx.ellipse(cx,by+16,9,6,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#1a1a1a';ctx.beginPath();ctx.ellipse(cx,by+26,13,4,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#FFD700';ctx.beginPath();ctx.ellipse(cx,by+26,4,3,0,0,Math.PI*2);ctx.fill();
  // Arms
  const as=moving?legSwing*0.7:0;
  ctx.fillStyle='#FF6B00';
  ctx.beginPath();ctx.ellipse(sx+3,by+19+as,5,9,0.25,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.ellipse(sx+29,by+19-as,5,9,-0.25,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#f5c39a';
  ctx.beginPath();ctx.ellipse(sx+2,by+28+as,5,4,0,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.ellipse(sx+30,by+28-as,5,4,0,0,Math.PI*2);ctx.fill();
  // Head
  ctx.fillStyle='#f5c39a';ctx.beginPath();ctx.ellipse(cx,by+8,11,12,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#f8d0a8';ctx.beginPath();ctx.ellipse(cx-3,by+5,6,5,0,0,Math.PI*2);ctx.fill();
  // Face
  if(player.dir!=='up'){
    const ec=state.ssj?'#39FF14':'#1a1a2a';
    ctx.fillStyle=ec;ctx.beginPath();ctx.ellipse(cx-4,by+7,2.5,3,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#fff';ctx.beginPath();ctx.ellipse(cx-3,by+6,1,1.5,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle=ec;ctx.beginPath();ctx.ellipse(cx+4,by+7,2.5,3,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#fff';ctx.beginPath();ctx.ellipse(cx+5,by+6,1,1.5,0,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle='#1a1a1a';ctx.lineWidth=1.5;
    ctx.beginPath();ctx.moveTo(cx-7,by+4);ctx.lineTo(cx-1,by+5);ctx.stroke();
    ctx.beginPath();ctx.moveTo(cx+7,by+4);ctx.lineTo(cx+1,by+5);ctx.stroke();
    ctx.strokeStyle='#b07050';ctx.lineWidth=1.2;
    ctx.beginPath();ctx.arc(cx,by+11,3,0.15,Math.PI-0.15);ctx.stroke();
  }
  // Hair bezier spikes
  const hc=(state.ssj||state.ssj2)?'#FFD700':'#1a1a1a';
  if(state.ssj){ctx.shadowColor='#FFD700';ctx.shadowBlur=16;}
  ctx.fillStyle=hc;
  ctx.beginPath();ctx.ellipse(cx,by+2,11,7,0,Math.PI,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.ellipse(cx-10,by+5,4,6,0.4,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.ellipse(cx+10,by+5,4,6,-0.4,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle=hc;ctx.lineWidth=5;ctx.lineCap='round';
  [[cx-8,by+1,cx-14,by-15],[cx-2,by-2,cx-3,by-19],[cx+3,by-1,cx+7,by-17],[cx+9,by+2,cx+15,by-12]].forEach(([x1,y1,cpx,cpy])=>{
    ctx.beginPath();ctx.moveTo(x1,y1);ctx.quadraticCurveTo(cpx,cpy,cpx+(x1-cx)*0.3,cpy+5);ctx.stroke();
  });
  ctx.shadowBlur=0;ctx.lineCap='butt';
  if(state.ssj2){
    ctx.strokeStyle='rgba(255,230,0,0.85)';ctx.lineWidth=1.5;
    for(let i=0;i<4;i++){const lx=cx-10+Math.random()*20,ly=by-8+Math.random()*10;ctx.beginPath();ctx.moveTo(lx,ly);ctx.lineTo(lx+4,ly+5);ctx.lineTo(lx-2,ly+11);ctx.stroke();}
  }
  // Tool icon
  const te={till:'⚡',water:'💧',seed:CROPS[state.activeCropId]?.seedEmoji||'🌱',harvest:'🌾',nimbus:'☁️',trade:'🚀'};
  ctx.font='14px serif';ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillText(te[state.tool]||'',cx,by-18);
}
function drawNPC(npc,t){
  const sx=npc.x-cam.x,sy=npc.y-cam.y;
  if(sx<-80||sx>canvas.width+80||sy<-80||sy>canvas.height+80) return;
  const moving=Math.abs(npc.vx)>0.05||Math.abs(npc.vy)>0.05;
  npc.animTimer++;if(npc.animTimer>10){npc.animTimer=0;npc.animFrame=(npc.animFrame+1)%4;}
  const legSwing=moving?Math.sin(npc.animFrame/4*Math.PI*2)*4:0;
  // Shadow
  ctx.fillStyle='rgba(0,0,0,0.18)';ctx.beginPath();ctx.ellipse(sx+TILE/2,sy+TILE-4,13,5,0,0,Math.PI*2);ctx.fill();
  // Legs — rounded
  ctx.fillStyle='#44445a';
  ctx.beginPath();ctx.ellipse(sx+14,sy+TILE-10+legSwing,4,7,0,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.ellipse(sx+26,sy+TILE-10-legSwing,4,7,0,0,Math.PI*2);ctx.fill();
  // Body — rounded pill
  ctx.fillStyle=npc.color;
  ctx.beginPath();ctx.ellipse(sx+TILE/2,sy+TILE-28,11,12,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='rgba(255,255,255,0.35)';
  ctx.beginPath();ctx.ellipse(sx+TILE/2-2,sy+TILE-33,6,5,0,0,Math.PI*2);ctx.fill();
  // Arms — small rounded
  ctx.fillStyle=npc.color;
  ctx.beginPath();ctx.ellipse(sx+8,sy+TILE-26,4,7,0.3,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.ellipse(sx+32,sy+TILE-26,4,7,-0.3,0,Math.PI*2);ctx.fill();
  // Head — smooth oval
  ctx.fillStyle='#f5c39a';
  ctx.beginPath();ctx.ellipse(sx+TILE/2,sy+TILE-46,11,12,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#f8d0a8';
  ctx.beginPath();ctx.ellipse(sx+TILE/2-3,sy+TILE-49,6,5,0,0,Math.PI*2);ctx.fill();
  // Eyes
  ctx.fillStyle='#1a1a2a';
  ctx.beginPath();ctx.ellipse(sx+TILE/2-4,sy+TILE-47,2,2.5,0,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.ellipse(sx+TILE/2+4,sy+TILE-47,2,2.5,0,0,Math.PI*2);ctx.fill();
  if(npc.id==='krillin'){
    // Zenko — bald shiny head, red headband
    px(sx+8,sy+TILE-50,24,6,'#f5c39a');
    px(sx+6,sy+TILE-47,28,4,'#e74c3c'); // red headband
    ctx.fillStyle='rgba(255,255,255,0.3)';ctx.beginPath();ctx.ellipse(sx+14,sy+TILE-48,4,3,0,0,Math.PI*2);ctx.fill(); // shine
  } else if(npc.id==='bulma'){
    // Lyra — bright teal hair, goggles on forehead
    px(sx+6,sy+TILE-54,28,12,'#00bcd4');
    px(sx+6,sy+TILE-52,6,18,'#00bcd4');
    px(sx+28,sy+TILE-52,6,16,'#00bcd4');
    px(sx+8,sy+TILE-56,10,5,'#4dd0e1'); // highlight
    // Goggles
    px(sx+9,sy+TILE-44,12,5,'#333');px(sx+10,sy+TILE-43,4,3,'#00e5ff');px(sx+16,sy+TILE-43,4,3,'#00e5ff');
  } else {
    // Elder Torr — UNIQUE: giant sage hat, long white beard, glowing staff
    // Huge conical hat
    ctx.fillStyle='#2c3e50';
    ctx.beginPath();ctx.moveTo(sx+TILE/2,sy+TILE-82);ctx.lineTo(sx+2,sy+TILE-52);ctx.lineTo(sx+TILE-2,sy+TILE-52);ctx.closePath();ctx.fill();
    ctx.fillStyle='#34495e';
    ctx.beginPath();ctx.moveTo(sx+TILE/2,sy+TILE-80);ctx.lineTo(sx+8,sy+TILE-54);ctx.lineTo(sx+TILE/2-4,sy+TILE-54);ctx.closePath();ctx.fill();
    // Hat brim
    px(sx+1,sy+TILE-54,TILE-2,6,'#1a252f');
    // Star on hat
    ctx.fillStyle='#FFD700';ctx.font='9px serif';ctx.textAlign='center';ctx.fillText('★',sx+TILE/2,sy+TILE-64);
    // Long white beard
    ctx.fillStyle='#ecf0f1';
    ctx.beginPath();ctx.moveTo(sx+11,sy+TILE-34);ctx.lineTo(sx+8,sy+TILE-10);ctx.lineTo(sx+TILE/2,sy+TILE-6);ctx.lineTo(sx+TILE-8,sy+TILE-10);ctx.lineTo(sx+TILE-11,sy+TILE-34);ctx.closePath();ctx.fill();
    ctx.fillStyle='#bdc3c7';px(sx+12,sy+TILE-30,4,16,'#bdc3c7');px(sx+20,sy+TILE-28,4,18,'#bdc3c7');px(sx+28,sy+TILE-30,4,14,'#bdc3c7');
    // Staff — tall glowing stick on left
    px(sx-6,sy+TILE-70,4,70,'#795548');px(sx-7,sy+TILE-72,6,4,'#5d4037');
    // Staff orb — glowing
    const orbPulse=0.6+Math.sin(t/400)*0.4;
    ctx.fillStyle=`rgba(100,200,255,${orbPulse})`;ctx.beginPath();ctx.arc(sx-4,sy+TILE-76,7,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='rgba(200,240,255,0.9)';ctx.beginPath();ctx.arc(sx-4,sy+TILE-76,4,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='rgba(255,255,255,0.95)';ctx.beginPath();ctx.arc(sx-6,sy+TILE-78,2,0,Math.PI*2);ctx.fill();
    // Glow ring around orb
    ctx.strokeStyle=`rgba(100,200,255,${orbPulse*0.5})`;ctx.lineWidth=2;ctx.beginPath();ctx.arc(sx-4,sy+TILE-76,10,0,Math.PI*2);ctx.stroke();
    // Scroll in right hand
    px(sx+TILE+2,sy+TILE-40,6,20,'#f5deb3');px(sx+TILE+2,sy+TILE-42,6,4,'#8B4513');px(sx+TILE+2,sy+TILE-22,6,4,'#8B4513');
    // Robe — long dark green
    px(sx+4,sy+TILE-30,TILE-8,30,'#1a5c2a');px(sx+6,sy+TILE-30,4,26,'#2d7a3a');
  }
  // Name tag
  ctx.fillStyle='rgba(0,0,0,0.6)';const nw=npc.name.length*5+14;ctx.fillRect(sx+TILE/2-nw/2,sy-20,nw,14);
  ctx.fillStyle=npc.id==='bulma'?'#00E5FF':npc.id==='roshi'?'#a8e6cf':'#FFD700';
  ctx.font='6px "Press Start 2P"';ctx.textAlign='center';ctx.fillText(npc.name,sx+TILE/2,sy-10);
  // Proximity prompt
  const dist=Math.sqrt((player.x+16-(npc.x+TILE/2))**2+(player.y+20-(npc.y+TILE/2))**2);
  if(dist<120){
    const pulse=0.6+Math.sin(t/200)*0.4;
    ctx.fillStyle=`rgba(255,255,255,${pulse})`;ctx.beginPath();ctx.arc(sx+TILE/2,sy-30,9,0,Math.PI*2);ctx.fill();
    ctx.font='11px serif';ctx.fillStyle='#333';
    ctx.fillText(npc.id==='bulma'?'🛒':npc.id==='roshi'?'📜':'💬',sx+TILE/2,sy-26);
    // Elder Torr floats a tip above his head
    if(npc.id==='roshi'){
      ctx.fillStyle='rgba(0,0,0,0.7)';ctx.fillRect(sx+TILE/2-50,sy-50,100,16);
      ctx.fillStyle='#a8e6cf';ctx.font='5px "Press Start 2P"';ctx.textAlign='center';
      ctx.fillText('📜 Press E for wisdom',sx+TILE/2,sy-40);
    }
  }
}

function drawMap(t){
  const startTX=Math.max(0,Math.floor(cam.x/TILE)),startTY=Math.max(0,Math.floor(cam.y/TILE));
  const endTX=Math.min(MAP_W,startTX+Math.ceil(canvas.width/TILE)+3),endTY=Math.min(MAP_H,startTY+Math.ceil(canvas.height/TILE)+3);
  for(let ty=startTY;ty<endTY;ty++){
    for(let tx=startTX;tx<endTX;tx++){
      const sx=tx*TILE-cam.x,sy=ty*TILE-cam.y,tile=map[ty][tx],seed=(tx*MAP_H+ty)*31337%100;
      switch(tile){
        case T.GRASS:drawGrassTile(sx,sy,seed);break;
        case T.DIRT:drawDirtTile(sx,sy);break;
        case T.WATER:drawWaterTile(sx,sy,t,false);break;
        case T.DEEP_WATER:drawWaterTile(sx,sy,t,true);break;
        case T.SAND:drawSandTile(sx,sy);break;
        case T.TILLED:drawTilledTile(sx,sy);break;
        case T.PATH:drawPathTile(sx,sy);break;
        case T.FENCE:drawFence(sx,sy);break;
        case T.WOOD_FLOOR:drawWoodFloor(sx,sy);break;
        case T.FLOWER:drawFlowerTile(sx,sy,t);break;
        case T.PLANTED:{const fd=farmData[`${tx},${ty}`];drawCrop(sx,sy,fd?.cropId||'carrot',1,t);break;}
        case T.GROWING:{const fd=farmData[`${tx},${ty}`];drawCrop(sx,sy,fd?.cropId||'carrot',2,t);break;}
        case T.READY:{const fd=farmData[`${tx},${ty}`];drawCrop(sx,sy,fd?.cropId||'carrot',3,t);break;}
        case T.ROCK:drawGrassTile(sx,sy,seed);drawRock(sx,sy);break;
        case T.TREE:case T.HOUSE:case T.SHOP:drawGrassTile(sx,sy,seed);break;
      }
    }
  }
  if(2*TILE-cam.x>-TILE*5&&2*TILE-cam.x<canvas.width+TILE) drawHouseBuilding(2*TILE,1*TILE);
  if(19*TILE-cam.x>-TILE*6&&19*TILE-cam.x<canvas.width+TILE) drawShopBuilding(19*TILE,1*TILE);
  treePositions.forEach(key=>{
    const[tx,ty]=key.split(',').map(Number);const sx=tx*TILE-cam.x,sy=ty*TILE-cam.y;
    if(sx>-TILE*2&&sx<canvas.width+TILE&&sy>-TILE*3&&sy<canvas.height+TILE) drawTree(sx,sy);
  });
}

function drawSandTile(x,y){px(x,y,TILE,TILE,'#d4b870');px(x+6,y+4,16,12,'#dcc478');px(x+28,y+18,14,10,'#ccb068');px(x+10,y+30,20,12,'#d8be74');}

function movePlayer(){
  let dx=0,dy=0;const spd=state.flyMode?player.flySpeed:player.speed;
  if(keys['arrowleft']||keys['a']){dx=-spd;player.dir='left';}
  if(keys['arrowright']||keys['d']){dx=spd;player.dir='right';}
  if(keys['arrowup']||keys['w']){dy=-spd;player.dir='up';}
  if(keys['arrowdown']){dy=spd;player.dir='down';}
  if(dx!==0&&dy!==0){dx*=0.707;dy*=0.707;}
  player.vx=dx;player.vy=dy;
  const nx=player.x+dx,tL=Math.floor(nx/TILE),tR=Math.floor((nx+player.width-2)/TILE);
  const tT=Math.floor((player.y+player.height/2)/TILE),tB=Math.floor((player.y+player.height-2)/TILE);
  if(!isSolid(tL,tT)&&!isSolid(tL,tB)&&!isSolid(tR,tT)&&!isSolid(tR,tB))
    player.x=Math.max(0,Math.min(MAP_W*TILE-player.width,nx));
  const ny=player.y+dy,tLy=Math.floor(player.x/TILE),tRy=Math.floor((player.x+player.width-2)/TILE);
  const tTy=Math.floor((ny+player.height/2)/TILE),tBy=Math.floor((ny+player.height-2)/TILE);
  if(!isSolid(tLy,tTy)&&!isSolid(tLy,tBy)&&!isSolid(tRy,tTy)&&!isSolid(tRy,tBy))
    player.y=Math.max(0,Math.min(MAP_H*TILE-player.height,ny));
  if((dx!==0||dy!==0)&&state.tool!=='nimbus'&&state.tool!=='talk'&&state.tool!=='trade'){
    const now=Math.floor(Date.now()/350);
    if(now!==player._lastToolUse){player._lastToolUse=now;useTool();}
  }
}

function npcIsSolid(tx,ty){
  if(tx<0||ty<0||tx>=MAP_W||ty>=MAP_H) return true;
  const t=map[ty][tx];
  return t===T.WATER||t===T.DEEP_WATER||t===T.ROCK||t===T.FENCE||
         t===T.TREE||t===T.WOOD_FLOOR||t===T.HOUSE||t===T.SHOP||t===T.DIRT;
}

function updateNPCs(){
  NPCS.forEach(npc=>{
    npc.wanderTimer++;
    if(npc.wanderTimer>200){
      npc.wanderTimer=0;
      // Pick direction, weighted toward standing still
      const dirs=[[0.3,0],[-0.3,0],[0,0.3],[0,-0.3],[0,0],[0,0],[0,0],[0,0]];
      const d=dirs[Math.floor(Math.random()*dirs.length)];
      npc.vx=d[0]; npc.vy=d[1];
    }
    // Bounds from NPC definition
    const b=npc.wanderBounds;
    const nx=npc.x+npc.vx, ny=npc.y+npc.vy;
    // Check bounds
    const inBounds = b
      ? nx>=b.x1&&nx<=b.x2&&ny>=b.y1&&ny<=b.y2
      : nx>=TILE&&nx<=(MAP_W-3)*TILE&&ny>=TILE&&ny<=(MAP_H-3)*TILE;
    // Check solid tiles
    const tx=Math.floor(nx/TILE), ty=Math.floor(ny/TILE);
    const solid=npcIsSolid(tx,ty)||npcIsSolid(tx+1,ty)||npcIsSolid(tx,ty+1);
    if(inBounds&&!solid){
      npc.x=nx; npc.y=ny;
    } else {
      // Bounce — reverse and stop
      npc.vx=0; npc.vy=0; npc.wanderTimer=180;
    }
  });
}

let lastTimeTick=Date.now();
function updateTime(){
  const now=Date.now();
  if(now-lastTimeTick>2000){
    lastTimeTick=now;state.minute+=10;
    if(state.minute>=60){state.minute=0;state.hour++;}
    if(state.hour>=22) showMessage("🌙 Getting late! Press SPACE to sleep and advance the day.");
    if(state.ki<state.maxKi) state.ki=Math.min(state.maxKi,state.ki+2);
    updateUI();
  }
}

function drawSky(){
  const h=state.hour,now2=Date.now();
  const w=(typeof weather!=="undefined")?weather.current:{id:"sunny",name:"☀️ Sunny",c1:"#4a9fd4",c2:"#87CEEB"};
  let c1=w.c1||"#4a9fd4",c2=w.c2||"#87CEEB";
  if(h<6||h>21){c1='#020818';c2='#0a1030';}
  else if(h<8&&w.id==='sunny'){c1='#FF6B35';c2='#FFD700';}
  else if(h>18&&h<=21&&w.id==='sunny'){c1='#FF8C00';c2='#FF6B35';}
  const g=ctx.createLinearGradient(0,0,0,canvas.height*0.3);g.addColorStop(0,c1);g.addColorStop(1,c2);
  ctx.fillStyle=g;ctx.fillRect(0,0,canvas.width,canvas.height);
  if(h<6||h>20){for(let i=0;i<80;i++){ctx.globalAlpha=Math.sin(now2/600+i)*0.4+0.5;ctx.fillStyle='#fff';ctx.fillRect((i*137.5+80)%canvas.width,(i*97.3+40)%(canvas.height*0.28),i%3===0?2:1,i%3===0?2:1);}ctx.globalAlpha=1;}
  if(w.id==='fullmoon'||h>20||h<5){const mx=canvas.width*0.75,my=60;const gm=ctx.createRadialGradient(mx,my,2,mx,my,40);gm.addColorStop(0,'rgba(255,240,180,0.95)');gm.addColorStop(0.5,'rgba(230,220,160,0.7)');gm.addColorStop(1,'transparent');ctx.fillStyle=gm;ctx.beginPath();ctx.arc(mx,my,40,0,Math.PI*2);ctx.fill();}
  if(w.id==='cloudy'||w.id==='rain'||w.id==='storm'){
    const col=w.id==='storm'?'rgba(40,40,50,0.9)':' rgba(200,210,220,0.85)';
    [0,1,2,3,4].forEach(i=>{const cx=((now2/((i+1)*800)+i*350))%(canvas.width+200)-100,cy=20+i*22,cr=50+i*15;ctx.fillStyle=col;ctx.beginPath();ctx.ellipse(cx,cy,cr,cr*0.55,0,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(cx-cr*0.5,cy+5,cr*0.65,cr*0.4,0,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(cx+cr*0.5,cy+5,cr*0.65,cr*0.4,0,0,Math.PI*2);ctx.fill();});
  }
  if(w.id==='windy'){ctx.strokeStyle='rgba(255,255,255,0.18)';ctx.lineWidth=1.5;for(let i=0;i<12;i++){const lx=((now2/3+i*180))%(canvas.width+200)-200;ctx.beginPath();ctx.moveTo(lx,30+i*20);ctx.lineTo(lx+80,32+i*20);ctx.stroke();}}
  if(w.id==='aurora'){['#9b59b6','#2980b9','#27ae60','#f39c12'].forEach((col,i)=>{const ag=ctx.createLinearGradient(0,0,0,canvas.height*0.4);ag.addColorStop(0,'transparent');ag.addColorStop(0.3+Math.sin(now2/1000+i)*0.1,col+'77');ag.addColorStop(1,'transparent');ctx.fillStyle=ag;const wx=Math.sin(now2/800+i*0.8)*80+canvas.width*(0.15+i*0.18);ctx.beginPath();ctx.moveTo(wx,0);ctx.quadraticCurveTo(wx+60,canvas.height*0.2,wx,canvas.height*0.4);ctx.quadraticCurveTo(wx-60,canvas.height*0.2,wx,0);ctx.fill();});}
  if((w.id==='rain'||w.id==='storm')&&weather.rainDrops){ctx.strokeStyle='rgba(150,190,255,0.5)';ctx.lineWidth=1.5;weather.rainDrops.forEach(d=>{ctx.beginPath();ctx.moveTo(d.x,d.y);ctx.lineTo(d.x+2,d.y+d.len);ctx.stroke();d.y+=d.speed;d.x+=1.5;if(d.y>canvas.height){d.y=-20;d.x=Math.random()*canvas.width;}});}
  if(w.id==='storm'){weather.lightningTimer++;if(weather.lightningTimer>80&&Math.random()<0.025){weather.lightningTimer=0;ctx.strokeStyle='rgba(255,255,200,0.95)';ctx.lineWidth=2;const lx=Math.random()*canvas.width;let ly=0;ctx.beginPath();ctx.moveTo(lx,0);while(ly<canvas.height*0.45){ly+=25+Math.random()*35;ctx.lineTo(lx+(Math.random()-0.5)*50,ly);}ctx.stroke();ctx.fillStyle='rgba(255,255,200,0.1)';ctx.fillRect(0,0,canvas.width,canvas.height);}}
  ctx.fillStyle='rgba(0,0,0,0.5)';ctx.fillRect(canvas.width/2-65,4,130,18);ctx.fillStyle='#fff';ctx.font='7px "Press Start 2P"';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(w.name,canvas.width/2,13);
  if(weather&&weather.nimbusTravel) drawNimbusTravel();
}

function drawNimbusTravel(){
  const nt=weather.nimbusTravel,t2=Date.now();nt.progress+=0.005;
  ctx.fillStyle='rgba(5,5,25,0.75)';ctx.fillRect(0,0,canvas.width,canvas.height);
  for(let i=0;i<120;i++){const sx=((i*173+t2*3)%canvas.width),sy=((i*97)%canvas.height);ctx.fillStyle=`rgba(255,255,255,${0.2+Math.sin(t2/200+i)*0.3})`;ctx.fillRect(sx,sy,i%5===0?3:1,i%5===0?1:2);}
  const cx2=canvas.width*0.15+nt.progress*(canvas.width*0.7),cy2=canvas.height*0.38+Math.sin(t2/350)*18;
  for(let i=5;i>0;i--){ctx.fillStyle=`rgba(255,200,0,${0.08*i})`;ctx.beginPath();ctx.ellipse(cx2-i*28,cy2,28-i*2,10-i,0,0,Math.PI*2);ctx.fill();}
  ctx.fillStyle='rgba(255,200,0,0.95)';ctx.beginPath();ctx.ellipse(cx2,cy2,32,13,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='rgba(255,230,100,0.8)';ctx.beginPath();ctx.ellipse(cx2-14,cy2-3,16,9,0,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(cx2+14,cy2-3,16,9,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#FF6B00';ctx.fillRect(cx2-8,cy2-40,18,14);ctx.fillStyle='#f5c39a';ctx.fillRect(cx2-6,cy2-54,16,16);
  ctx.fillStyle='#1a1a1a';[[cx2-6,cy2-54,6,12],[cx2,cy2-52,6,14],[cx2+4,cy2-50,5,10]].forEach(([hx,hy,hw,hh])=>{ctx.beginPath();ctx.moveTo(hx,hy+hh);ctx.lineTo(hx+hw/2,hy);ctx.lineTo(hx+hw,hy+hh);ctx.closePath();ctx.fill();});
  const dest=state.cities[nt.target];ctx.fillStyle='rgba(0,0,0,0.6)';ctx.fillRect(canvas.width/2-150,canvas.height*0.54,300,52);
  ctx.fillStyle='#FFD700';ctx.font='9px "Press Start 2P"';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(`${dest.icon} ${dest.name}`,canvas.width/2,canvas.height*0.558);
  ctx.fillStyle='#aaa';ctx.font='6px "Press Start 2P"';ctx.fillText(dest.desc,canvas.width/2,canvas.height*0.578);
  const bw=280,bx=(canvas.width-bw)/2,by=canvas.height*0.65;
  ctx.fillStyle='rgba(0,0,0,0.6)';ctx.fillRect(bx-2,by-2,bw+4,20);ctx.fillStyle='#222';ctx.fillRect(bx,by,bw,16);
  const pg=ctx.createLinearGradient(bx,by,bx+bw,by);pg.addColorStop(0,'#FFD700');pg.addColorStop(1,'#FF6B00');ctx.fillStyle=pg;ctx.fillRect(bx,by,bw*Math.min(nt.progress,1),16);
  ctx.fillStyle='#fff';ctx.font='6px "Press Start 2P"';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(`☁️ Flying to ${dest.name}... ${Math.floor(Math.min(nt.progress,1)*100)}%`,canvas.width/2,by+8);
  if(nt.progress>=1){weather.nimbusTravel=null;setTimeout(()=>{openTradeModal();showMessage(`☁️ Arrived at ${dest.name}!`);},300);}
}

function drawParticles(){
  particles.forEach(p=>{ctx.save();ctx.globalAlpha=p.life;
    if(p.emoji){ctx.font=`${p.size*1.5}px serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(p.emoji,p.x-cam.x,p.y-cam.y);}
    else{ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(p.x-cam.x,p.y-cam.y,p.size/2,0,Math.PI*2);ctx.fill();}
    ctx.restore();});
}

function gameLoop(){
  const t=Date.now();ctx.clearRect(0,0,canvas.width,canvas.height);
  drawSky();updateCamera();drawMap(t);
  NPCS.forEach(npc=>drawNPC(npc,t));drawPlayer(t);drawParticles();
  for(let i=particles.length-1;i>=0;i--){const p=particles[i];p.x+=p.vx;p.y+=p.vy;p.vy+=0.06;p.life-=p.decay;if(p.life<=0) particles.splice(i,1);}
  movePlayer();updateNPCs();updateTime();
  requestAnimationFrame(gameLoop);
}

// ═══════════════════════════════════════════════════
//  WEATHER SYSTEM — appended
// ═══════════════════════════════════════════════════
const WEATHERS=[
  {id:'sunny',    name:'☀️ Sunny',     chance:40,c1:'#4a9fd4',c2:'#87CEEB'},
  {id:'cloudy',   name:'☁️ Cloudy',    chance:20,c1:'#6a8a9a',c2:'#9ab0ba'},
  {id:'rain',     name:'🌧️ Rainy',     chance:15,c1:'#2a4a5a',c2:'#4a6a7a'},
  {id:'storm',    name:'⛈️ Storm',     chance:8, c1:'#1a2a3a',c2:'#2a3a4a'},
  {id:'fullmoon', name:'🌕 Full Moon', chance:5, c1:'#050a1a',c2:'#0a1530'},
  {id:'windy',    name:'🌬️ Windy',     chance:7, c1:'#5a9aaa',c2:'#8abaca'},
  {id:'aurora',   name:'✨ Ki Aurora', chance:5, c1:'#0a0a2a',c2:'#1a0a3a'},
];
const weather={current:WEATHERS[0],rainDrops:[],lightningTimer:0,nimbusTravel:null};

function rollWeather(){
  const total=WEATHERS.reduce((s,w)=>s+w.chance,0);let r=Math.random()*total;
  for(const w of WEATHERS){r-=w.chance;if(r<=0){weather.current=w;break;}}
  if(weather.current.id==='rain'){
    Object.keys(farmData).forEach(k=>{if(farmData[k].stage>0&&farmData[k].stage<3)farmData[k].watered=true;});
    showMessage("🌧️ It's raining! All crops auto-watered!");
  } else if(weather.current.id==='windy'){
    player.flySpeed=9;showMessage("🌬️ Windy! Nimbus is much faster today!");
  } else if(weather.current.id==='aurora'){
    state.powerLevel+=500;spawnParticles(player.x+16,player.y+20,'#9b59b6',20,'✨');
    showMessage("✨ Ki Aurora! +500 Power Level from the energy in the air!");
  } else if(weather.current.id==='fullmoon'){
    showMessage("🌕 FULL MOON TONIGHT! The Great Ape stirs within you...");
  } else if(weather.current.id==='storm'){
    showMessage("⛈️ Lightning storm! Nimbus travel is dangerous today!");
  } else {
    showMessage(`${weather.current.name} today!`);
  }
  weather.rainDrops=[];
  for(let i=0;i<130;i++) weather.rainDrops.push({x:Math.random()*window.innerWidth,y:Math.random()*window.innerHeight,speed:6+Math.random()*4,len:10+Math.random()*8});
}

// ═══════════════════════════════════════════════════
//  TOUCH CONTROLS — Virtual Joystick + Action Buttons
// ═══════════════════════════════════════════════════

const touch = {
  active: false,
  id: null,
  startX: 0, startY: 0,
  dx: 0, dy: 0,
  maxRadius: 46,
};

function initTouchControls() {
  // Show touch UI on touch devices
  const isTouchDevice = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
  const touchUI = document.getElementById('touch-controls');
  if (isTouchDevice) {
    touchUI.style.display = 'flex';
    // Push toolbar up a bit so it doesn't overlap
    const toolbar = document.getElementById('toolbar');
    if (toolbar) toolbar.style.bottom = '230px';
    const inventoryBar = document.getElementById('inventory-bar');
    if (inventoryBar) inventoryBar.style.display = 'none'; // hidden on mobile, shown in touch bar
    const hint = document.getElementById('controls-hint');
    if (hint) hint.style.display = 'none';
    const missionPanel = document.getElementById('mission-panel');
    if (missionPanel) { missionPanel.style.right = '4px'; missionPanel.style.top = '56px'; missionPanel.style.width = '170px'; }
  }

  // ── JOYSTICK ──
  const base = document.getElementById('joystick-base');
  const knob = document.getElementById('joystick-knob');

  function joystickStart(e) {
    e.preventDefault();
    const t = e.changedTouches ? e.changedTouches[0] : e;
    touch.active = true;
    touch.id = t.identifier;
    touch.startX = t.clientX;
    touch.startY = t.clientY;
    touch.dx = 0; touch.dy = 0;
  }

  function joystickMove(e) {
    e.preventDefault();
    if (!touch.active) return;
    let t = null;
    if (e.changedTouches) {
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === touch.id) { t = e.changedTouches[i]; break; }
      }
    } else { t = e; }
    if (!t) return;
    const rawDx = t.clientX - touch.startX;
    const rawDy = t.clientY - touch.startY;
    const dist = Math.sqrt(rawDx * rawDx + rawDy * rawDy);
    const clamped = Math.min(dist, touch.maxRadius);
    const angle = Math.atan2(rawDy, rawDx);
    touch.dx = Math.cos(angle) * (clamped / touch.maxRadius);
    touch.dy = Math.sin(angle) * (clamped / touch.maxRadius);
    // Move knob visually
    const kx = Math.cos(angle) * Math.min(dist, touch.maxRadius);
    const ky = Math.sin(angle) * Math.min(dist, touch.maxRadius);
    knob.style.transform = `translate(${kx}px, ${ky}px)`;
  }

  function joystickEnd(e) {
    touch.active = false;
    touch.dx = 0; touch.dy = 0;
    knob.style.transform = 'translate(0,0)';
  }

  base.addEventListener('touchstart',  joystickStart, { passive: false });
  base.addEventListener('touchmove',   joystickMove,  { passive: false });
  base.addEventListener('touchend',    joystickEnd,   { passive: false });
  base.addEventListener('touchcancel', joystickEnd,   { passive: false });
  // Mouse fallback for desktop testing
  base.addEventListener('mousedown',  joystickStart);
  window.addEventListener('mousemove', e => { if (touch.active) joystickMove(e); });
  window.addEventListener('mouseup',  joystickEnd);

  // ── ACTION BUTTONS ──
  function addTouchBtn(id, action) {
    const btn = document.getElementById(id);
    if (!btn) return;
    btn.addEventListener('touchstart', e => { e.preventDefault(); action(); }, { passive: false });
    btn.addEventListener('click', action); // fallback for mouse
  }

  addTouchBtn('tb-nimbus',  () => setTool('nimbus'));
  addTouchBtn('tb-sleep',   () => nextDay());
  addTouchBtn('tb-trade',   () => openTradeModal());
  addTouchBtn('tb-senzu',   () => {
    if (state.senzu > 0) {
      state.senzu--; state.ki = state.maxKi;
      showMessage("🫘 Senzu Bean eaten! KI fully restored!");
      spawnParticles(player.x+16, player.y+20, '#39FF14', 12, '✨');
      updateUI();
    } else { showMessage("🫘 No Senzu Beans! Buy from Bulma."); }
  });
  addTouchBtn('tb-till',    () => { setTool('till');    useTool(); });
  addTouchBtn('tb-water',   () => { setTool('water');   useTool(); });
  addTouchBtn('tb-seed',    () => {
    if (state.tool === 'seed') { cycleCrop(1); }
    else { setTool('seed'); }
  });
  addTouchBtn('tb-harvest', () => { setTool('harvest'); useTool(); });
  addTouchBtn('tb-talk',    () => talkToNearbyNPC());

  // Keep touch active tool highlight in sync
  const origSetTool = setTool;
  // Patch tool buttons to also highlight touch buttons
  function syncTouchHighlight(tool) {
    document.querySelectorAll('.touch-btn').forEach(b => b.classList.remove('tool-active'));
    const map = { nimbus:'tb-nimbus', till:'tb-till', water:'tb-water', seed:'tb-seed', harvest:'tb-harvest' };
    const tb = document.getElementById(map[tool]);
    if (tb) tb.classList.add('tool-active');
  }

  // Monkey-patch setTool to sync highlights
  const _setTool = setTool;
  window.setTool = function(tool) {
    _setTool(tool);
    syncTouchHighlight(tool);
  };
  syncTouchHighlight('nimbus');
}

// ── INJECT TOUCH MOVEMENT INTO movePlayer ──
// Store original movePlayer, extend it with joystick
const _origMovePlayer = movePlayer;
window.movePlayer = function() {
  // Apply joystick to keys object so existing collision logic works
  if (touch.active && (Math.abs(touch.dx) > 0.1 || Math.abs(touch.dy) > 0.1)) {
    const spd = state.flyMode ? player.flySpeed : player.speed;
    const dx = touch.dx * spd;
    const dy = touch.dy * spd;
    player.vx = dx; player.vy = dy;
    // Direction
    if (Math.abs(dx) > Math.abs(dy)) { player.dir = dx > 0 ? 'right' : 'left'; }
    else { player.dir = dy > 0 ? 'down' : 'up'; }
    // Animate
    player.animTimer++;
    if (player.animTimer > 8) { player.animTimer = 0; player.animFrame = (player.animFrame + 1) % 4; }
    // Move with collision
    const nx = player.x + dx;
    const tL = Math.floor(nx/TILE), tR = Math.floor((nx+player.width-2)/TILE);
    const tT = Math.floor((player.y+player.height/2)/TILE), tB = Math.floor((player.y+player.height-2)/TILE);
    if (!isSolid(tL,tT) && !isSolid(tL,tB) && !isSolid(tR,tT) && !isSolid(tR,tB))
      player.x = Math.max(0, Math.min(MAP_W*TILE - player.width, nx));
    const ny = player.y + dy;
    const tLy = Math.floor(player.x/TILE), tRy = Math.floor((player.x+player.width-2)/TILE);
    const tTy = Math.floor((ny+player.height/2)/TILE), tBy = Math.floor((ny+player.height-2)/TILE);
    if (!isSolid(tLy,tTy) && !isSolid(tLy,tBy) && !isSolid(tRy,tTy) && !isSolid(tRy,tBy))
      player.y = Math.max(0, Math.min(MAP_H*TILE - player.height, ny));
    // Auto-use tool while moving with joystick
    if (state.tool !== 'nimbus' && state.tool !== 'talk' && state.tool !== 'trade') {
      const now = Math.floor(Date.now() / 400);
      if (now !== player._lastToolUse) { player._lastToolUse = now; useTool(); }
    }
  } else {
    _origMovePlayer();
  }
};

// ═══════════════════════════════════════════════════
//  INIT — must run AFTER all definitions
// ═══════════════════════════════════════════════════
initMap();
generateMissions();
rollWeather();
updateUI();
initTouchControls();
showMessage("🌾 WASD=Move · S=Seed · 1-8=Crop · T=Till · G=Water · H=Harvest · F=Nimbus · E=Talk · R=Trade · Space=Sleep");
gameLoop();
