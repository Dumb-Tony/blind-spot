/* These tests load the SHIPPED physics/controller scripts, not a reimplementation. */
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const Matter=require('../dist/vendor/matter.min.js');
function core(){const c={Matter,console};vm.createContext(c);for(const f of ['game-data.js','physics.js'])vm.runInContext(fs.readFileSync('dist/'+f,'utf8'),c);return c}
const c=core(),{Simulation}=c.BlindSpotPhysics,{LEVELS,starsFor}=c.BlindSpotData;
const solutions=JSON.parse(fs.readFileSync('tests/solutions.json','utf8'));
let checks=0;const ok=(v,label)=>{assert.ok(v,label);checks++};
for(let i=0;i<8;i++){
  let wins=0;const s=new Simulation(LEVELS[i],e=>{if(e.type==='win')wins++});
  for(let n=0;n<300;n++)s.step();ok(s.shotsUsed===0&&s.remaining===LEVELS[i].cameras.length,`L${i+1}: no free pre-shot destruction`);
  for(const [dx,dy] of solutions[i].shots){s.aim(220-dx,490+dy);ok(s.launch(),`L${i+1}: launch accepted`);ok(Number.isFinite(s.projectile.mass)&&s.projectile.mass>0,'finite dynamic mass');for(let n=0;n<600&&s.state==='flying';n++)s.step();ok(Number.isFinite(s.projectile.position.x),'no invalid physics');}
  ok(s.state==='won'&&s.remaining===0,`L${i+1}: production solver clears all cameras`);ok(s.shotsUsed<=LEVELS[i].stars[0],`L${i+1}: three stars attainable`);for(let n=0;n<300;n++)s.step();ok(wins===1,'win event exactly once');
  console.log(`PASS level ${i+1}: ${LEVELS[i].name}, ${s.shotsUsed} shot(s), ${s.breaks} broken blocks`);
  for(const [used,expected] of [[LEVELS[i].stars[0],3],[LEVELS[i].stars[1],2],[LEVELS[i].shots,1]])ok(starsFor(LEVELS[i],used)===expected,'scoring boundary');
}
const missed=new Simulation(LEVELS[0]);while(missed.state!=='lost'){missed.aim(203,485);missed.launch();for(let n=0;n<600&&missed.state==='flying';n++)missed.step()}
ok(missed.shotsUsed===3&&missed.remaining===1,'misses consume allowance and produce failure');
const cancelled=new Simulation(LEVELS[0]);cancelled.aim(140,525);cancelled.cancel();ok(cancelled.shotsUsed===0&&cancelled.state==='ready','cancel does not cost a shot');cancelled.aim(219,490);ok(!cancelled.launch()&&cancelled.shotsUsed===0,'tiny drag cancels');
const guide=new Simulation(LEVELS[0]);guide.aim(130,520);const predicted=guide.predict(false);guide.launch();for(let n=0;n<18;n++){guide.step();const p=predicted.samples[n*2+1];ok(Math.hypot(p.x-guide.projectile.position.x,p.y-guide.projectile.position.y)<.001,'trajectory matches actual released body')}

// Minimal DOM/canvas adapter; all input handlers and rAF code are production.
function harness({denied=false,saved=null,width=1280,height=720,offsetX=0,offsetY=0}={}){
  const store=new Map(saved?Object.entries(saved):[]);let raf=null,now=0;
  const draw=new Proxy({createLinearGradient:()=>({addColorStop(){}})},{get:(o,k)=>o[k]||(()=>{})});
  class Node{
    constructor(id){this.id=id;this.listeners={};this.classes=new Set(id==='menu'?['active']:[]);this.classList={toggle:(n,b)=>b?this.classes.add(n):this.classes.delete(n),add:n=>this.classes.add(n),remove:n=>this.classes.delete(n),contains:n=>this.classes.has(n)};this.hidden=false;this.value='';this.width=1280;this.height=720;this.dataset={};this.textContent='';this._html='';this.children=[];this.tagName='DIV'}
    addEventListener(type,fn){(this.listeners[type]??=[]).push(fn)}
    fire(type,event={}){for(const fn of this.listeners[type]||[])fn({preventDefault(){},target:this,...event})}
    setAttribute(name,value){this[name]=value}
    getContext(){return draw} getBoundingClientRect(){return{left:offsetX,top:offsetY,width,height}}
    setPointerCapture(){} releasePointerCapture(){} focus(){}
    set innerHTML(value){this._html=value;if(this.id==='levelGrid'){this.children=Array.from({length:8},(_,i)=>{const n=new Node('card'+i);n.dataset.level=i;n.querySelector=()=>new Node('thumb');return n})}}
    get innerHTML(){return this._html} querySelectorAll(){return this.children}
  }
  const ids={};for(const match of fs.readFileSync('dist/index.html','utf8').matchAll(/id="([^"]+)"/g))ids[match[1]]=new Node(match[1]);ids.angleInput.value='18';ids.powerInput.value='90';ids.angleInput.tagName=ids.powerInput.tagName='INPUT';
  const document=new Node('document');document.getElementById=id=>ids[id];document.hidden=false;
  const window=new Node('window');window.requestAnimationFrame=fn=>{raf=fn};window.matchMedia=()=>({matches:false});Object.defineProperty(window,'localStorage',{get(){if(denied)throw Error('Denied');return{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)}}});
  class Image{constructor(){this.complete=false;this.naturalWidth=0}}
  const ctx={window,document,Matter,console,Image,performance:{now:()=>now}};vm.createContext(ctx);
  window.Matter=Matter;window.BlindSpotAssets={atlas:''};for(const f of ['game-data.js','physics.js','renderer.js','game.js'])vm.runInContext(fs.readFileSync('dist/'+f,'utf8'),ctx);
  return{ctx,ids,store,state:()=>window.__blindSpot.getState(),tick(seconds=1,fps=60){const count=Math.round(seconds*fps);for(let n=0;n<count;n++){now+=1000/fps;raf(now)}},click:id=>ids[id].onclick(),key:key=>window.fire('keydown',{key}),drag(dx,dy){const p=(x,y)=>({clientX:offsetX+x/1280*width,clientY:offsetY+y/720*height,pointerId:1,button:0});ids.game.fire('pointerdown',p(220,490));ids.game.fire('pointermove',p(220-dx,490+dy));ids.game.fire('pointerup',p(220-dx,490+dy))}};
}
for(const dimensions of [{},{width:640,height:360,offsetX:50,offsetY:125},{width:1920,height:1080}]){
 const h=harness({...dimensions,denied:true});h.click('playBtn');ok(h.state().screen===null&&h.state().state==='ready','title play works without storage');h.drag(55,25);ok(h.state().shotsUsed===1,'pointer release consumes exactly one');h.tick(9);ok(h.state().state==='won'&&h.state().screen==='result','real pointer path wins at scaled canvas sizes');h.click('retryBtn');ok(h.state().state==='ready'&&h.state().shotsUsed===0,'restart completely resets state');h.key('m');ok(h.ids.muteBtn.textContent==='SOUND OFF','mute safe without storage');
}
const h=harness();h.click('playBtn');h.drag(95,30);h.tick(.5);h.click('pauseBtn');const paused=h.state().projectile.x;h.tick(4);ok(h.state().projectile.x===paused,'pause freezes moving projectile');h.click('resumeBtn');h.tick(.5);ok(h.state().projectile.x!==paused,'resume restores motion');h.click('restartBtn');h.click('aimBtn');ok(h.state().state==='aiming','fine aim activates guide');h.key('Escape');ok(h.state().shotsUsed===0&&h.state().state==='ready','Esc cancels aim');
const fpsStates=[30,60,200].map(fps=>{const h=harness();h.click('playBtn');h.tick(1/fps,fps);h.drag(95,30);h.tick(1,fps);return h.state().projectile});ok(Math.abs(fpsStates[0].x-fpsStates[2].x)<.1,'30 and 200Hz render clocks give same physics position');
const saved=harness();saved.click('playBtn');saved.drag(55,25);saved.tick(9);const resumed=harness({saved:Object.fromEntries(saved.store)});ok(resumed.state().progress.stars[0]===3,'best stars persist across page startup');
const bad=harness({saved:{'blindspot-overhaul-progress':'{"stars":"bad","last":999}'}});ok(bad.state().progress.last===7,'corrupt save values are bounded');
const single=fs.readFileSync('dist/blind-spot-standalone.html','utf8');ok(!/<script src=|<link rel="stylesheet"/.test(single),'offline dependency embedding');
console.log(`PASS: ${checks} assertions across exact production physics, real pointer handlers, scaled canvases, trajectories, pause, restart, failure, stars, storage, and refresh rates.`);
