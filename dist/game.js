(function(){
"use strict";
const {Engine,World,Bodies,Body,Events,Composite,Sleeping}=Matter;
const {LEVELS,MATERIALS,TOOLS,starsFor}=window.BlindSpotData;
const canvas=document.getElementById("game"),ctx=canvas.getContext("2d");
const W=canvas.width,H=canvas.height,GROUND=650,ANCHOR={x:190,y:535},tool=TOOLS["street-stone"];
const el=id=>document.getElementById(id);
const screens=["menu","levels","how","result"];
let engine=null,levelIndex=-1,level=null,projectile=null,shotsUsed=0,cameras=[],blocks=[],particles=[];
let dragging=false,launched=false,shotFrames=0,quietFrames=0,resultPending=false,resultTimer=0,shake=0,flash=0;
const storage={
  get(key){try{return window.localStorage?window.localStorage.getItem(key):null}catch(_){return null}},
  set(key,value){try{if(window.localStorage)window.localStorage.setItem(key,value)}catch(_){/* Progress is optional; gameplay must never depend on storage access. */}}
};
let mute=storage.get("blindspot-mute")==="1",progress=loadProgress(),audio=null,lastTime=performance.now();

function loadProgress(){try{return JSON.parse(storage.get("blindspot-progress"))||{unlocked:1,stars:{}}}catch(_){return{unlocked:1,stars:{}}}}
function saveProgress(){storage.set("blindspot-progress",JSON.stringify(progress))}
function showScreen(id){screens.forEach(s=>el(s).classList.toggle("active",s===id));el("hud").classList.toggle("hidden",id!==null)}
function toast(message){const t=el("toast");t.textContent=message;t.classList.add("show");clearTimeout(t._timer);t._timer=setTimeout(()=>t.classList.remove("show"),1500)}

class Sound{
  constructor(){this.ctx=null}
  wake(){if(mute)return;this.ctx=this.ctx||new (window.AudioContext||window.webkitAudioContext)();if(this.ctx.state==="suspended")this.ctx.resume()}
  tone(freq,duration=.1,type="square",gain=.07,slide=0){if(mute)return;this.wake();const now=this.ctx.currentTime,o=this.ctx.createOscillator(),g=this.ctx.createGain();o.type=type;o.frequency.setValueAtTime(freq,now);if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(30,freq+slide),now+duration);g.gain.setValueAtTime(gain,now);g.gain.exponentialRampToValueAtTime(.001,now+duration);o.connect(g).connect(this.ctx.destination);o.start(now);o.stop(now+duration)}
  launch(){this.tone(180,.16,"triangle",.09,240)}
  wood(){this.tone(105,.08,"square",.055,-35)}
  glass(){this.tone(920,.13,"sine",.05,-500);setTimeout(()=>this.tone(1320,.08,"sine",.03,-700),35)}
  camera(){this.tone(520,.08,"sawtooth",.06,-320);setTimeout(()=>this.tone(90,.18,"square",.07,-40),45)}
  win(){[330,440,660].forEach((f,i)=>setTimeout(()=>this.tone(f,.22,"triangle",.07,80),i*100))}
  fail(){this.tone(150,.35,"sawtooth",.05,-70)}
}
audio=new Sound();

function makeBlock(def){
  const m=MATERIALS[def.material],body=Bodies.rectangle(def.x,def.y,def.w,def.h,{isStatic:!!def.static,density:m.density,friction:m.friction,restitution:m.restitution,angle:def.angle||0,chamfer:{radius:def.material==="heavy"?4:1},label:"block"});
  body.game={kind:"block",material:def.material,w:def.w,h:def.h,broken:false};blocks.push(body);World.add(engine.world,body);return body;
}
function makeCamera(def){
  const body=Bodies.rectangle(def.x,def.y,54,34,{density:.0022,friction:.8,restitution:.1,angle:def.angle||0,chamfer:{radius:6},label:"camera"});
  body.game={kind:"camera",disabled:false,startX:def.x,startY:def.y,fallFrames:0};cameras.push(body);World.add(engine.world,body);return body;
}
function makeProjectile(){
  // Calculate dynamic mass and inertia before parking the stone in the sling.
  // A Matter body created static has no finite values to restore on release.
  projectile=Bodies.circle(ANCHOR.x,ANCHOR.y,tool.radius,{density:tool.density,friction:.78,frictionAir:tool.airFriction,restitution:.32,label:"projectile"});
  projectile.game={kind:"projectile"};World.add(engine.world,projectile);Body.setStatic(projectile,true);launched=false;dragging=false;shotFrames=0;quietFrames=0;
}
function startLevel(index){
  levelIndex=index;level=LEVELS[index];engine=Engine.create({enableSleeping:true});engine.gravity.y=1;engine.gravity.scale=.001;
  cameras=[];blocks=[];particles=[];shotsUsed=0;resultPending=false;resultTimer=0;shake=0;flash=0;
  World.add(engine.world,[Bodies.rectangle(W/2,GROUND+35,W+200,70,{isStatic:true,label:"ground",friction:.95}),Bodies.rectangle(-35,H/2,70,H*2,{isStatic:true}),Bodies.rectangle(W+35,H/2,70,H*2,{isStatic:true})]);
  level.blocks.forEach(makeBlock);level.cameras.forEach(makeCamera);makeProjectile();bindCollisions();updateHUD();showScreen(null);toast(level.hint);audio.wake();
}
function bindCollisions(){Events.on(engine,"collisionStart",event=>{
  event.pairs.forEach(pair=>{
    const a=pair.bodyA,b=pair.bodyB,ga=a.game,gb=b.game;
    if(!ga&&!gb)return;
    const rv=Math.hypot(a.velocity.x-b.velocity.x,a.velocity.y-b.velocity.y);
    if(rv>2.1){shake=Math.min(10,shake+rv*.35);burst(pair.collision.supports[0]||{x:(a.position.x+b.position.x)/2,y:(a.position.y+b.position.y)/2},rv>6?9:4,"#f6f0db")}
    [a,b].forEach(body=>{
      const g=body.game;if(!g)return;
      if(g.kind==="block"&&!g.broken&&rv>MATERIALS[g.material].breakSpeed)breakBlock(body);
      if(g.kind==="camera"&&!g.disabled&&rv>3.15)disableCamera(body,"IMPACT");
    });
  });
})}
function breakBlock(body){
  if(body.game.broken||body.isStatic)return;body.game.broken=true;const mat=body.game.material,pos={...body.position};
  World.remove(engine.world,body);blocks=blocks.filter(b=>b!==body);burst(pos,mat==="glass"?22:13,mat==="glass"?"#93f5ff":"#e7a35a");
  mat==="glass"?audio.glass():audio.wood();flash=Math.max(flash,mat==="glass"?.12:.05);
  const count=mat==="glass"?5:3;
  for(let i=0;i<count;i++){const w=mat==="glass"?Math.max(5,body.game.w/count-3):Math.max(8,body.game.w/count-3),h=Math.max(5,body.game.h*.28);const chip=Bodies.rectangle(pos.x+(i-count/2)*w*.65,pos.y,w,h,{density:MATERIALS[mat].density*.7,friction:.5,restitution:.15,angle:body.angle+(i-count/2)*.1,label:"debris"});chip.game={kind:"debris",material:mat,w,h,life:360};Body.setVelocity(chip,{x:body.velocity.x+(i-count/2)*.45,y:body.velocity.y-1-Math.random()});World.add(engine.world,chip);blocks.push(chip)}
}
function disableCamera(body,reason){
  if(body.game.disabled)return;body.game.disabled=true;body.game.reason=reason;body.collisionFilter.group=0;burst(body.position,24,"#ff5c59");burst(body.position,12,"#d8ff3e");shake=10;flash=.18;audio.camera();updateHUD();
  if(cameras.every(c=>c.game.disabled))queueResult(true);
}
function burst(pos,count,color){for(let i=0;i<count;i++){const a=Math.random()*Math.PI*2,s=1+Math.random()*5;particles.push({x:pos.x,y:pos.y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-1,life:25+Math.random()*30,max:55,color,size:2+Math.random()*4})}}

function updateHUD(){if(!level)return;el("levelLabel").textContent=`${String(levelIndex+1).padStart(2,"0")} · ${level.name.toUpperCase()}`;el("hintLabel").textContent=level.hint;el("cameraCount").textContent=cameras.filter(c=>!c.game.disabled).length;el("shotCount").textContent=Math.max(0,level.shots-shotsUsed);el("muteBtn").textContent=mute?"×":"♪";el("muteBtn").setAttribute("aria-label",mute?"Unmute sound":"Mute sound")}

function pointerPos(e){const r=canvas.getBoundingClientRect(),p=e.touches?e.touches[0]:e;return{x:(p.clientX-r.left)*W/r.width,y:(p.clientY-r.top)*H/r.height}}
function onDown(e){if(!level||launched||resultPending||shotsUsed>=level.shots)return;audio.wake();const p=pointerPos(e);if(Math.hypot(p.x-projectile.position.x,p.y-projectile.position.y)<50){dragging=true;e.preventDefault()}}
function onMove(e){if(!dragging)return;e.preventDefault();const p=pointerPos(e),dx=p.x-ANCHOR.x,dy=p.y-ANCHOR.y,d=Math.hypot(dx,dy)||1,limit=Math.min(tool.maxPull,d);let x=ANCHOR.x+dx/d*limit,y=ANCHOR.y+dy/d*limit;x=Math.min(x,ANCHOR.x+30);Body.setPosition(projectile,{x,y})}
function onUp(e){
  if(!dragging)return;dragging=false;
  const dx=ANCHOR.x-projectile.position.x,dy=ANCHOR.y-projectile.position.y,pull=Math.hypot(dx,dy);
  if(pull<12){Body.setPosition(projectile,ANCHOR);return}
  Body.setStatic(projectile,false);Sleeping.set(projectile,false);Body.setVelocity(projectile,{x:dx*tool.power,y:dy*tool.power});
  const valid=[projectile.mass,projectile.position.x,projectile.position.y,projectile.velocity.x,projectile.velocity.y].every(Number.isFinite);
  if(!valid){World.remove(engine.world,projectile);projectile=null;makeProjectile();toast("Stone reset — try that pull again.");return}
  launched=true;shotsUsed++;shotFrames=0;quietFrames=0;audio.launch();updateHUD();e.preventDefault();
}

function step(){
  if(!engine)return;Engine.update(engine,1000/60);
  blocks.forEach(b=>{if(b.game&&b.game.life!==undefined&&--b.game.life<=0){World.remove(engine.world,b)}});blocks=blocks.filter(b=>!b.game||b.game.life===undefined||b.game.life>0);
  cameras.forEach(c=>{if(c.game.disabled)return;const fallen=c.position.y>c.game.startY+45||Math.abs(normalizeAngle(c.angle))>.72;if(fallen)c.game.fallFrames++;else c.game.fallFrames=0;if(c.game.fallFrames>18)disableCamera(c,"FALL")});
  particles.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.vy+=.18;p.vx*=.98;p.life--});particles=particles.filter(p=>p.life>0);
  if(launched&&!resultPending){shotFrames++;const active=Composite.allBodies(engine.world).filter(b=>!b.isStatic&&b!==projectile&&!b.game?.disabled);const maxMotion=Math.max(projectile.speed||0,...active.map(b=>Math.max(b.speed,Math.abs(b.angularVelocity)*40)));
    if(shotFrames>45&&maxMotion<.28)quietFrames++;else quietFrames=0;
    if(quietFrames>48||shotFrames>520||projectile.position.x>W+80||projectile.position.y>H+100){finishShot()}
  }
  if(resultPending&&--resultTimer<=0)showResult(cameras.every(c=>c.game.disabled));
  shake*=.84;flash*=.83;
}
function finishShot(){
  if(!launched)return;if(projectile)World.remove(engine.world,projectile);projectile=null;launched=false;
  if(cameras.every(c=>c.game.disabled)){queueResult(true);return}
  if(shotsUsed>=level.shots){queueResult(false);return}
  setTimeout(()=>{if(level&&!resultPending&&!projectile)makeProjectile()},180)
}
function queueResult(win){if(resultPending)return;resultPending=true;resultTimer=win?42:28;if(win)audio.win();else audio.fail()}
function showResult(win){
  const used=shotsUsed;if(win){const stars=starsFor(level,used),old=progress.stars[levelIndex]||0;progress.stars[levelIndex]=Math.max(old,stars);progress.unlocked=Math.max(progress.unlocked,Math.min(LEVELS.length,levelIndex+2));saveProgress();el("resultEyebrow").textContent=level.finale?"REGION 1 OFFLINE":"INSTALLATION OFFLINE";el("resultTitle").textContent=level.finale?"Starter City can breathe.":"Blind spot created.";el("resultStars").innerHTML="★".repeat(stars)+`<span class="empty">${"★".repeat(3-stars)}</span>`;el("resultDetail").textContent=`${used} stone${used===1?"":"s"} used · ${stars===3?"Clean shot target met.":stars===2?"Efficient. One cleaner route remains.":"Complete. Replay for fewer shots."}`;el("nextBtn").textContent=levelIndex===LEVELS.length-1?"REGION COMPLETE":"NEXT LEVEL →";el("nextBtn").disabled=false}else{el("resultEyebrow").textContent="STILL WATCHING";el("resultTitle").textContent="Out of stones.";el("resultStars").innerHTML='<span class="empty">★★★</span>';el("resultDetail").textContent=`${cameras.filter(c=>!c.game.disabled).length} camera${cameras.filter(c=>!c.game.disabled).length===1?"":"s"} remain. Try a support instead of the lens.`;el("nextBtn").textContent="RETRY →"}
  showScreen("result");renderLevelGrid();
}
function normalizeAngle(a){while(a>Math.PI)a-=Math.PI*2;while(a< -Math.PI)a+=Math.PI*2;return a}

function drawBackground(){
  const grad=ctx.createLinearGradient(0,0,0,H);grad.addColorStop(0,"#253b7e");grad.addColorStop(.56,"#314f8b");grad.addColorStop(1,"#182647");ctx.fillStyle=grad;ctx.fillRect(0,0,W,H);
  ctx.fillStyle="#ffe26c";ctx.beginPath();ctx.arc(1090,125,58,0,Math.PI*2);ctx.fill();
  ctx.globalAlpha=.16;ctx.fillStyle="#fff";for(let i=0;i<9;i++)ctx.fillRect(0,95+i*37,W,2);ctx.globalAlpha=1;
  const skyline=[0,120,235,370,515,650,760,900,1030,1160,1280],heights=[220,290,190,250,330,210,280,195,310,235];
  ctx.fillStyle="#172451";for(let i=0;i<heights.length;i++){const x=skyline[i],w=skyline[i+1]-x-7,y=GROUND-heights[i];ctx.fillRect(x,y,w,heights[i]);ctx.fillStyle="#d8ff3e22";for(let wx=x+18;wx<x+w-8;wx+=28)for(let wy=y+24;wy<GROUND-15;wy+=34)ctx.fillRect(wx,wy,10,15);ctx.fillStyle="#172451"}
  ctx.fillStyle="#0f1834";ctx.fillRect(0,GROUND,W,H-GROUND);ctx.fillStyle="#293969";ctx.fillRect(0,GROUND,W,7);ctx.fillStyle="#ffffff12";for(let x=0;x<W;x+=80)ctx.fillRect(x,682,45,4);
  ctx.save();ctx.translate(610,155);ctx.rotate(-.04);ctx.fillStyle="#101934cc";roundRect(-190,-34,380,68,8,true);ctx.fillStyle="#f6f0db";ctx.font="900 20px Arial";ctx.textAlign="center";ctx.fillText(level?.finale?"OMNIPEEK REGIONAL RELAY":"PRIVACY IS VERY SUSPICIOUS",0,-2);ctx.fillStyle="#ff5c59";ctx.font="bold 12px Arial";ctx.fillText("MINISTRY OF APPROPRIATE BEHAVIOR",0,20);ctx.restore();
}
function drawRebel(){
  const x=92,y=608;ctx.save();ctx.lineCap="round";ctx.strokeStyle="#10152d";ctx.lineWidth=10;ctx.beginPath();ctx.moveTo(x,y-55);ctx.lineTo(x-8,y-20);ctx.lineTo(x-20,y);ctx.moveTo(x-8,y-20);ctx.lineTo(x+10,y);ctx.stroke();ctx.fillStyle="#d8ff3e";ctx.beginPath();ctx.arc(x,y-79,18,0,Math.PI*2);ctx.fill();ctx.strokeStyle="#11162d";ctx.lineWidth=5;ctx.stroke();ctx.fillStyle="#ff5c59";ctx.beginPath();ctx.moveTo(x-18,y-69);ctx.lineTo(x+18,y-69);ctx.lineTo(x+12,y-45);ctx.lineTo(x-14,y-48);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle="#10152d";ctx.fillRect(x-10,y-85,5,5);ctx.fillRect(x+4,y-85,5,5);ctx.strokeStyle="#d8ff3e";ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(x-16,y-50);ctx.lineTo(x+13,y-34);ctx.stroke();ctx.restore();
}
function drawSling(back=true){ctx.save();ctx.strokeStyle=back?"#392617":"#785039";ctx.lineWidth=back?12:8;ctx.lineCap="round";if(back){ctx.beginPath();ctx.moveTo(ANCHOR.x-16,GROUND);ctx.lineTo(ANCHOR.x-11,ANCHOR.y-5);ctx.moveTo(ANCHOR.x+18,GROUND);ctx.lineTo(ANCHOR.x+13,ANCHOR.y-5);ctx.stroke()}if(projectile&&!launched){ctx.strokeStyle="#edbf75";ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(ANCHOR.x+(back?13:-11),ANCHOR.y-4);ctx.lineTo(projectile.position.x,projectile.position.y);ctx.stroke()}ctx.restore()}
function drawBlock(b){const g=b.game;if(!g)return;ctx.save();ctx.translate(b.position.x,b.position.y);ctx.rotate(b.angle);const w=g.w,h=g.h,m=MATERIALS[g.material]||MATERIALS.wood;ctx.fillStyle=m.color;ctx.strokeStyle=m.stroke;ctx.lineWidth=3;roundRect(-w/2,-h/2,w,h,g.material==="heavy"?5:2,true,true);if(g.material==="wood"){ctx.strokeStyle="#723f2b88";ctx.lineWidth=2;for(let y=-h/2+9;y<h/2;y+=13){ctx.beginPath();ctx.moveTo(-w/2+5,y);ctx.quadraticCurveTo(0,y+4,w/2-5,y);ctx.stroke()}}else if(g.material==="glass"){ctx.fillStyle="#ffffff45";ctx.beginPath();ctx.moveTo(-w*.35,-h*.42);ctx.lineTo(-w*.02,-h*.42);ctx.lineTo(-w*.32,h*.42);ctx.lineTo(-w*.46,h*.42);ctx.closePath();ctx.fill()}else if(g.material==="heavy"){ctx.strokeStyle="#a9b7cf55";ctx.beginPath();ctx.moveTo(-w/2+8,-h/2+8);ctx.lineTo(w/2-8,h/2-8);ctx.stroke()}ctx.restore()}
function drawCamera(c){const dead=c.game.disabled;ctx.save();ctx.translate(c.position.x,c.position.y);ctx.rotate(c.angle);ctx.fillStyle=dead?"#33394c":"#eef1e8";ctx.strokeStyle="#10152d";ctx.lineWidth=4;roundRect(-27,-17,54,34,7,true,true);ctx.fillStyle=dead?"#15192a":"#ff5c59";ctx.beginPath();ctx.arc(10,0,10,0,Math.PI*2);ctx.fill();ctx.stroke();if(!dead){ctx.fillStyle="#ffaca7";ctx.beginPath();ctx.arc(13,-3,3,0,Math.PI*2);ctx.fill()}else{ctx.strokeStyle="#ff5c59";ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(4,-6);ctx.lineTo(16,6);ctx.moveTo(16,-6);ctx.lineTo(4,6);ctx.stroke()}ctx.fillStyle="#10152d";ctx.fillRect(-34,-7,9,14);ctx.strokeStyle="#10152d";ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(-9,17);ctx.lineTo(-14,28);ctx.stroke();ctx.restore()}
function drawProjectile(){if(!projectile)return;ctx.save();ctx.translate(projectile.position.x,projectile.position.y);ctx.rotate(projectile.angle);ctx.fillStyle="#343b51";ctx.strokeStyle="#0e1327";ctx.lineWidth=4;ctx.beginPath();ctx.arc(0,0,tool.radius,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.strokeStyle="#ff5c59";ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(-14,-3);ctx.lineTo(14,5);ctx.stroke();ctx.fillStyle="#f6f0db";ctx.font="900 9px Arial";ctx.textAlign="center";ctx.fillText("NO!",0,3);ctx.restore()}
function drawGuide(){if(!dragging||!projectile)return;const dx=ANCHOR.x-projectile.position.x,dy=ANCHOR.y-projectile.position.y;if(Math.hypot(dx,dy)<12)return;let x=ANCHOR.x,y=ANCHOR.y,vx=dx*tool.power,vy=dy*tool.power;ctx.save();for(let i=0;i<38;i++){vx*=1-tool.airFriction;vy=vy*(1-tool.airFriction)+.278;x+=vx;y+=vy;if(i%3===0){ctx.globalAlpha=Math.max(.12,1-i/42);ctx.fillStyle=i<15?"#d8ff3e":"#f6f0db";ctx.beginPath();ctx.arc(x,y,5-i*.055,0,Math.PI*2);ctx.fill()}if(y>GROUND||x>W)break}ctx.restore()}
function roundRect(x,y,w,h,r,fill,stroke){ctx.beginPath();ctx.roundRect(x,y,w,h,r);if(fill)ctx.fill();if(stroke)ctx.stroke()}
function render(){ctx.save();if(shake>.2)ctx.translate((Math.random()-.5)*shake,(Math.random()-.5)*shake);drawBackground();drawRebel();drawSling(true);blocks.forEach(drawBlock);cameras.forEach(drawCamera);drawGuide();drawProjectile();drawSling(false);particles.forEach(p=>{ctx.globalAlpha=Math.max(0,p.life/p.max);ctx.fillStyle=p.color;ctx.fillRect(p.x-p.size/2,p.y-p.size/2,p.size,p.size)});ctx.globalAlpha=1;if(flash>.01){ctx.fillStyle=`rgba(255,255,255,${flash})`;ctx.fillRect(0,0,W,H)}ctx.restore()}
function loop(now){const elapsed=Math.min(50,now-lastTime);lastTime=now;if(level&&elapsed>0)step();render();requestAnimationFrame(loop)}

function renderLevelGrid(){el("levelGrid").innerHTML=LEVELS.map((l,i)=>{const unlocked=i<progress.unlocked,best=progress.stars[i]||0;return `<button class="level-card" data-level="${i}" ${unlocked?"":"disabled"} aria-label="${unlocked?`Play level ${i+1}, ${l.name}`:`Level ${i+1} locked`}"><span class="num">${String(i+1).padStart(2,"0")}</span><b>${l.name.toUpperCase()}</b><span class="card-stars">${"★".repeat(best)}${"☆".repeat(3-best)}</span>${unlocked?"":'<span class="lock">LOCKED</span>'}</button>`}).join("");el("levelGrid").querySelectorAll("button:not(:disabled)").forEach(b=>b.onclick=()=>startLevel(+b.dataset.level))}
function openLevels(){renderLevelGrid();showScreen("levels")}
function toggleMute(){mute=!mute;storage.set("blindspot-mute",mute?"1":"0");updateHUD();toast(mute?"Sound muted":"Sound on");if(!mute)audio.wake()}

canvas.addEventListener("mousedown",onDown);canvas.addEventListener("mousemove",onMove);window.addEventListener("mouseup",onUp);
canvas.addEventListener("touchstart",onDown,{passive:false});canvas.addEventListener("touchmove",onMove,{passive:false});window.addEventListener("touchend",onUp,{passive:false});
el("playBtn").onclick=openLevels;el("levelsBack").onclick=()=>showScreen("menu");el("backBtn").onclick=openLevels;el("restartBtn").onclick=()=>startLevel(levelIndex);el("muteBtn").onclick=toggleMute;
el("howBtn").onclick=()=>showScreen("how");el("howClose").onclick=()=>showScreen("menu");el("howPlay").onclick=openLevels;el("retryBtn").onclick=()=>startLevel(levelIndex);el("resultLevels").onclick=openLevels;el("nextBtn").onclick=()=>{if(el("resultEyebrow").textContent==="STILL WATCHING")startLevel(levelIndex);else if(levelIndex<LEVELS.length-1)startLevel(levelIndex+1);else openLevels()};
window.addEventListener("keydown",e=>{if(e.key.toLowerCase()==="r"&&levelIndex>=0)startLevel(levelIndex);if(e.key.toLowerCase()==="m")toggleMute();if(e.key==="Escape"){if(el("menu").classList.contains("active"))return;if(!el("hud").classList.contains("hidden"))openLevels();else showScreen("menu")}});
window.addEventListener("blur",()=>{dragging=false;if(projectile&&!launched)Body.setPosition(projectile,ANCHOR)});
window.__blindSpot={startLevel,getState:()=>({levelIndex,shotsUsed,shotsRemaining:level?level.shots-shotsUsed:0,camerasRemaining:cameras.filter(c=>!c.game.disabled).length,resultPending,unlocked:progress.unlocked}),starsFor,LEVELS,forceDisableAll:()=>cameras.forEach(c=>disableCamera(c,"TEST"))};
showScreen("menu");renderLevelGrid();requestAnimationFrame(loop);
})();
