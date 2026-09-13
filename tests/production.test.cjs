/* These tests load the SHIPPED physics/controller scripts, not a reimplementation. */
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const Matter=require('../dist/vendor/matter.min.js');
function core(){const c={Matter,console};vm.createContext(c);for(const f of ['game-data.js','physics.js'])vm.runInContext(fs.readFileSync('dist/'+f,'utf8'),c);return c}
const c=core(),{Simulation}=c.BlindSpotPhysics,{LEVELS,starsFor}=c.BlindSpotData;
const solutions=JSON.parse(fs.readFileSync('tests/solutions.json','utf8'));
let checks=0;const ok=(v,label)=>{assert.ok(v,label);checks++};
for(let i=0;i<LEVELS.length;i++){
  let wins=0;const s=new Simulation(LEVELS[i],e=>{if(e.type==='win')wins++});
  for(let n=0;n<300;n++)s.step();ok(s.shotsUsed===0&&s.remaining===LEVELS[i].cameras.length,`L${i+1}: no free pre-shot destruction`);
  for(const [dx,dy,tool] of solutions[i].shots){if(tool)ok(s.selectTool(tool),"available tool selected");s.aim(220-dx,490+dy);ok(s.launch(),`L${i+1}: launch accepted`);ok(Number.isFinite(s.projectile.mass)&&s.projectile.mass>0,'finite dynamic mass');for(let n=0;n<1800&&s.state==='flying';n++)s.step();ok(Number.isFinite(s.projectile.position.x),'no invalid physics');}
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
    set innerHTML(value){this._html=value;if(this.id==='levelGrid'){this.children=Array.from({length:(value.match(/data-level=/g)||[]).length},(_,i)=>{const n=new Node('card'+i);n.dataset.level=i;n.querySelector=()=>new Node('thumb');return n})}}
    get innerHTML(){return this._html} querySelectorAll(){return this.children}
  }
  const ids={};for(const match of fs.readFileSync('dist/index.html','utf8').matchAll(/id="([^"]+)"/g))ids[match[1]]=new Node(match[1]);ids.angleInput.value='18';ids.powerInput.value='90';ids.angleInput.tagName=ids.powerInput.tagName='INPUT';
  const document=new Node('document');document.getElementById=id=>ids[id];document.hidden=false;
  const window=new Node('window');window.requestAnimationFrame=fn=>{raf=fn};window.matchMedia=()=>({matches:false});Object.defineProperty(window,'localStorage',{get(){if(denied)throw Error('Denied');return{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)}}});
  class Image{constructor(){this.complete=false;this.naturalWidth=0}}
  const ctx={window,document,Matter,console,Image,performance:{now:()=>now}};vm.createContext(ctx);
  window.Matter=Matter;window.BlindSpotAssets={atlas:''};for(const f of ['game-data.js','physics.js','rebel-rig.js','rebel-skin.js','renderer.js','game.js'])vm.runInContext(fs.readFileSync('dist/'+f,'utf8'),ctx);
  return{ctx,ids,store,state:()=>window.__blindSpot.getState(),tick(seconds=1,fps=60){const count=Math.round(seconds*fps);for(let n=0;n<count;n++){now+=1000/fps;raf(now)}},click:id=>ids[id].onclick(),key:key=>window.fire('keydown',{key}),drag(dx,dy){const p=(x,y)=>({clientX:offsetX+x/1280*width,clientY:offsetY+y/720*height,pointerId:1,button:0});ids.game.fire('pointerdown',p(220,490));ids.game.fire('pointermove',p(220-dx,490+dy));ids.game.fire('pointerup',p(220-dx,490+dy))}};
}
for(const dimensions of [{},{width:640,height:360,offsetX:50,offsetY:125},{width:1920,height:1080}]){
 const h=harness({...dimensions,denied:true});h.click('playBtn');ok(h.state().screen===null&&h.state().state==='ready','title play works without storage');h.drag(55,25);ok(h.state().shotsUsed===1,'pointer release consumes exactly one');h.tick(9);ok(h.state().state==='won'&&h.state().screen==='result','real pointer path wins at scaled canvas sizes');h.click('retryBtn');ok(h.state().state==='ready'&&h.state().shotsUsed===0,'restart completely resets state');h.key('m');ok(h.ids.muteBtn.textContent==='SOUND OFF','mute safe without storage');
}
const h=harness();h.click('playBtn');h.drag(95,30);h.tick(.5);h.click('pauseBtn');const paused=h.state().projectile.x;h.tick(4);ok(h.state().projectile.x===paused,'pause freezes moving projectile');h.click('resumeBtn');h.tick(.5);ok(h.state().projectile.x!==paused,'resume restores motion');h.click('restartBtn');h.click('aimBtn');ok(h.state().state==='aiming','fine aim activates guide');h.key('Escape');ok(h.state().shotsUsed===0&&h.state().state==='ready','Esc cancels aim');
const fpsStates=[30,60,200].map(fps=>{const h=harness();h.click('playBtn');h.tick(1/fps,fps);h.drag(95,30);h.tick(1,fps);return h.state().projectile});ok(Math.abs(fpsStates[0].x-fpsStates[2].x)<.1,'30 and 200Hz render clocks give same physics position');
const saved=harness();saved.click('playBtn');saved.drag(55,25);saved.tick(9);const resumed=harness({saved:Object.fromEntries(saved.store)});ok(resumed.state().progress.stars[0]===3,'best stars persist across page startup');
const bad=harness({saved:{'blindspot-overhaul-progress':'{"stars":"bad","last":999}'}});ok(bad.state().progress.last===67,'corrupt save values are bounded');
const single=fs.readFileSync('dist/blind-spot-standalone.html','utf8');ok(!/<script src=|<link rel="stylesheet"/.test(single),'offline dependency embedding');
console.log(`PASS: ${checks} assertions across exact production physics, real pointer handlers, scaled canvases, trajectories, pause, restart, failure, stars, storage, and refresh rates.`);
// Physical regressions for the revised contact and fragment model.
const fracture=new Simulation(LEVELS[1]);const beam=fracture.blocks.find(b=>!b.isStatic&&b.game.w>b.game.h);
Matter.Body.setVelocity(beam,{x:4,y:2});Matter.Body.setAngularVelocity(beam,.04);
const mass=beam.mass,px=mass*beam.velocity.x,py=mass*beam.velocity.y;
fracture.breakBody(beam);const chips=fracture.blocks.filter(b=>b.game.kind==='debris');
ok(chips.length===2,'fracture produces two physical pieces');
ok(Math.abs(chips.reduce((v,b)=>v+b.mass,0)-mass)<1e-8,'fracture preserves load-bearing mass');
ok(Math.abs(chips.reduce((v,b)=>v+b.mass*b.velocity.x,0)-px)<1e-8&&Math.abs(chips.reduce((v,b)=>v+b.mass*b.velocity.y,0)-py)<1e-8,'fracture conserves linear momentum');
ok(chips.every(b=>b.angularVelocity===beam.angularVelocity),'fragments inherit parent spin');
const load=new Simulation(LEVELS[4]);load.armed=true;load.state='flying';
const weight=load.blocks.find(b=>b.game.material==='heavy'),height=weight.position.y;
for(const b of [...load.blocks])if(b.game.material==='glass'||b.game.material==='wood'){load.breakBody(b)}
for(const b of load.blocks.filter(b=>b.game.kind==='debris'))Matter.Body.setPosition(b,{x:400,y:650});
for(let n=0;n<180;n++)load.step();
ok(weight.position.y>height+40,'removing support transfers heavy load into collapse');
for(const aim of [[55,25],[115,15],[60,95]]){
 const s=new Simulation(LEVELS[0]);s.aim(220-aim[0],490+aim[1]);const g=s.openingGuide();
 ok(!('hit' in g),'opening guide exposes no impact prediction');
 ok(g.points.length<=25&&g.points.length>2,'opening guide is time-bounded');
 ok(g.points.every(p=>Math.hypot(p.x-g.points[0].x,p.y-g.points[0].y)<=340),'opening guide is distance-bounded');
}
// Tiny fast fragments cannot have the same destructive authority as concrete.
function cameraImpact(mass){const s=new Simulation(LEVELS[0]);s.armed=true;const cam=s.cameras[0],chip=Matter.Bodies.rectangle(cam.position.x-30,cam.position.y,8,8);chip.game={kind:'debris'};Matter.Body.setMass(chip,mass);Matter.Body.setVelocity(chip,{x:3,y:0});s.collisions({pairs:[{bodyA:cam,bodyB:chip,collision:{normal:{x:1,y:0},supports:[cam.position]}}]});return cam.game.disabled}
ok(!cameraImpact(.05)&&cameraImpact(20),'impact strength respects debris mass');
console.log(`PASS: ${checks} total assertions including fracture, support collapse, weighted impacts, and limited aiming.`);
// Expansion mechanics and campaign continuity.
const oldSave=harness({saved:{'blindspot-overhaul-progress':JSON.stringify({stars:[3,2,1,0,0,0,0,0],last:2})}});
ok(oldSave.state().progress.stars.length===120&&oldSave.state().progress.stars[0]===3&&oldSave.state().progress.stars[8]===0,'old eight-level saves expand without losing stars');
for(let region=1;region<4;region++){
 const ui=harness();ui.click('selectBtn');ui.ids.regionSelect.value=String(region);ui.ids.regionSelect.onchange();ui.ids.levelGrid.children[0].onclick();
 ok(ui.state().index===region*20,'region picker starts the correct level');
 const [dx,dy]=solutions[region*20].shots[0];ui.drag(dx,dy);ui.tick(18);
 ok(ui.state().state==='won','new tool wins via production pointer controller');
 ui.click('nextBtn');ok(ui.state().index===region*20+1,'new region next-level progression');
}
const paint=new Simulation(LEVELS[20]);paint.armed=true;const lens=paint.cameras[0];const rock=Matter.Bodies.circle(lens.position.x-30,lens.position.y,19);rock.game={kind:'stone',tool:'street-stone'};Matter.Body.setVelocity(rock,{x:15,y:0});
paint.collisions({pairs:[{bodyA:lens,bodyB:rock,collision:{normal:{x:1,y:0},supports:[lens.position]}}]});ok(!lens.game.disabled,'armored lens resists direct impact');
paint.projectile.game.tool='paint-can';paint.activateTool(paint.projectile,lens,lens.position);ok(lens.game.disabled,'paint bypasses armored lens');
const network=new Simulation(LEVELS[41]);network.activateTool(network.projectile,network.cameras[0],network.cameras[0].position);ok(network.remaining===1,'EMP no longer reaches a remote matching circuit');
const separate=new Simulation(LEVELS[42]);separate.activateTool(separate.projectile,separate.cameras[0],separate.cameras[0].position);ok(separate.remaining===1,'EMP does not jump to an unrelated remote circuit');
const crane=new Simulation(LEVELS[60]);const craneBeam=crane.blocks[0];crane.state='flying';crane.armed=true;crane.activateTool(crane.projectile,craneBeam,craneBeam.position);ok(crane.hooks.length===1,'hook creates physical pulling constraint');for(let n=0;n<200&&crane.state==='flying';n++)crane.step();ok(crane.hooks.length===0,'pull constraint releases after its time window');
const near=new Simulation(LEVELS[0]);near.aim(120,520);const visible=near.openingGuide();ok(visible.points.at(-1).x-visible.points[0].x>280,'extended guide visibly reaches beyond sling');
console.log(`PASS: ${checks} campaign assertions across 120 levels and four tools.`);
const wet=new Simulation(LEVELS[20]);wet.splatter(wet.cameras[0].position,145);
ok(wet.cameras[0].game.paint.length>0,'paint coats camera lenses');ok(wet.blocks[0].game.paint.length>0,'paint coats fixed surfaces');ok(wet.paintGround.length>0,'near-ground paint leaves a puddle');
const marked=new Simulation(LEVELS[1]);const markedBeam=marked.blocks.find(b=>!b.isStatic);marked.splatter(markedBeam.position,145);marked.breakBody(markedBeam);ok(marked.blocks.filter(b=>b.game.kind==='debris').every(b=>b.game.paint?.length>0),'paint is retained by broken fragments');
for(let n=0;n<20;n++)wet.splatter(wet.cameras[0].position,145);ok(wet.cameras[0].game.paint.length<=30&&wet.paintGround.length<=16,'paint marks have bounded storage');
const visual=harness();const renderer=new visual.ctx.window.BlindSpotRenderer.Renderer(visual.ids.game);let paintCalls=0;renderer.paintSurface=()=>paintCalls++;renderer.block(wet.blocks[0]);renderer.camera(wet.cameras[0]);ok(paintCalls===2,'both structural and camera rendering draw surface paint');
renderer.event({type:'paint',x:800,y:500,destinations:[{x:820,y:560}],radius:145});ok(renderer.paintDrops.length>50,'paint creates a visible spray');renderer.animate(1);ok(renderer.paintDrops.length===0,'airborne spray expires');renderer.reset();ok(renderer.paintDrops.length===0&&renderer.electric.length===0,'restart clears transient tool effects');
const inspect=harness();inspect.click('playBtn');inspect.drag(55,25);inspect.tick(9);inspect.click('inspectBtn');ok(inspect.state().screen===null&&inspect.state().state==='won','inspect aftermath preserves won state');inspect.tick(2);ok(inspect.state().shotsUsed===1,'inspection does not launch or rescore');
console.log(`PASS: ${checks} assertions including persistent surface paint and aftermath inspection.`);

// Expanded inventory and bounded EMP regression tests.
ok(LEVELS.length===120&&c.BlindSpotData.REGIONS.every(r=>r.levels===20),'six regions of twenty');
ok(new Set(LEVELS.map(l=>l.id)).size===120,'stable unique level identities');
const migrated=harness({saved:{'blindspot-overhaul-progress':JSON.stringify({stars:Array.from({length:32},(_,i)=>i%4),last:25})}});
ok(migrated.state().progress.last===61&&migrated.state().progress.stars[41]===1,'32-level save maps by original identity');
const mixed=new Simulation(LEVELS[80]);ok(mixed.selectTool('paint-can'),'mixed tool can be selected');mixed.aim(150,520);mixed.cancel();ok(mixed.inventory['paint-can']===3,'cancel preserves supplies');mixed.aim(150,520);mixed.launch();ok(mixed.inventory['paint-can']===2&&!mixed.selectTool('street-stone'),'launch consumes selected tool and disallows switching in flight');
const pulseLevel={...LEVELS[40],blocks:[],cameras:[{x:750,y:599,circuit:'A'},{x:900,y:599,circuit:'A'},{x:1050,y:599,circuit:'A'}]};
const pulse=new Simulation(pulseLevel);pulse.activateTool(pulse.projectile,pulse.cameras[0],pulse.cameras[0].position);ok(pulse.remaining===1&&!pulse.cameras[2].game.disabled,'EMP jumps once without recursive chain');
const outside=new Simulation(pulseLevel);outside.activateTool(outside.projectile,outside.cameras[0],{x:outside.cameras[0].position.x-100,y:outside.cameras[0].position.y});ok(outside.remaining===3,'100-pixel miss is outside EMP reach');
const inside=new Simulation(pulseLevel);inside.activateTool(inside.projectile,inside.cameras[0],{x:inside.cameras[0].position.x-90,y:inside.cameras[0].position.y});ok(inside.remaining===1,'90-pixel hit pulses and jumps once');
const selector=harness();selector.click('selectBtn');selector.ids.regionSelect.value='5';selector.ids.regionSelect.onchange();ok(selector.ids.levelGrid.children.length===20,'twenty actual menu cards');selector.ids.levelGrid.children[0].onclick();selector.ids.toolSelect.value='paint-can';selector.ids.toolSelect.onchange();ok(selector.state().tool==='paint-can','production selector changes active tool');selector.drag(55,25);ok(selector.state().inventory['paint-can']===2,'pointer shot spends selected inventory');
console.log('PASS: '+checks+' total production assertions for v0.8.');

for(const l of LEVELS){const settled=new Simulation(l);ok(settled.cameras.every((cam,i)=>Math.hypot(cam.position.x-l.cameras[i].x,cam.position.y-l.cameras[i].y)<25),l.name+': initial layout is stable');}
const mounted=new Simulation(LEVELS[80]),fixedLens=mounted.cameras.find(cam=>cam.game.bolted);ok(fixedLens.isStatic&&fixedLens.game.shield,'armored mixed-tool pod is visibly bolted and fixed');mounted.projectile.game.tool='grapple';mounted.activateTool(mounted.projectile,fixedLens,fixedLens.position);ok(mounted.hooks.length===0&&!fixedLens.game.disabled,'hook cannot move bolted armored pod');mounted.projectile.game.tool='paint-can';mounted.activateTool(mounted.projectile,fixedLens,fixedLens.position);ok(fixedLens.game.disabled,'paint disables bolted armor');
const emptyTool=new Simulation(LEVELS[80]);emptyTool.inventory['paint-can']=0;ok(!emptyTool.selectTool('paint-can'),'empty inventory cannot be selected');emptyTool.inventory['street-stone']=0;emptyTool.inventory['paint-can']=1;emptyTool.finishShot();ok(emptyTool.tool.id==='paint-can','next available tool loads when current supply is empty');emptyTool.inventory['paint-can']=0;emptyTool.finishShot();ok(emptyTool.state==='lost','total supply exhaustion ends attempt');
console.log('PASS: '+checks+' final assertions, all 120 levels and inventory / EMP / stability checks.');

// The pose contacts are checked against actual physics coordinates, including extreme pulls.
const rig=visual.ctx.window.BlindSpotRebelRig;
for(const tool of Object.keys(c.BlindSpotData.TOOLS))for(const pull of [[3,-35],[118,0],[3,118],[80,80]]){
 const actor=new Simulation({...LEVELS[0],tool});actor.aim(220-pull[0],490+pull[1]);const pose=rig.pose(actor,99,{x:220,y:490},2,false);
 ok(Math.hypot(pose.hand.x-actor.projectile.position.x,pose.hand.y-actor.projectile.position.y)<1e-9,'animated hand tracks the actual pulled tool');
 ok(pose.feet.every(f=>f.y===614),'feet remain planted through every aiming angle');
 const joint=rig.elbow(pose.shoulder,pose.palm);ok(Number.isFinite(joint.x)&&Number.isFinite(joint.y),'arm joints remain finite at extreme pulls');
 renderer.rebel(actor);renderer.rebel(actor,true);
}
const actor=new Simulation(LEVELS[0]);actor.aim(135,545);const release={...actor.projectile.position};actor.launch();
const beginning=rig.pose(actor,0,release,1,false),follow=rig.pose(actor,.22,release,1,false),recovered=rig.pose(actor,1,release,1,false);
ok(beginning.hand.x===release.x&&beginning.hand.y===release.y,'release begins at the real grip point');ok(follow.hand.x>220&&recovered.hand.x===220,'follow-through reaches forward then returns');
const still1=rig.pose(actor,99,release,1,true),still2=rig.pose(actor,99,release,3,true);ok(still1.shoulder.y===still2.shoulder.y,'reduced motion removes idle breathing');
renderer.event({type:'launch',x:release.x,y:release.y});ok(renderer.shotAge===0&&renderer.releasePoint.x===release.x,'launch event starts animation at contact');renderer.animate(.2);ok(renderer.shotAge===.2,'animation advances on the rendering clock');renderer.reset();ok(renderer.shotAge===99&&renderer.readyAge===0,'restart clears follow-through and starts reach');
console.log('PASS: '+checks+' final assertions including all four animated rebel rigs.');

// Painted artwork uses the same pose objects and replaces the fallback only after decoding.
const skin=visual.ctx.window.BlindSpotPaintedSkin;let paintedCalls=0;const paintedColumns=new Set();const paintedContext=new Proxy({drawImage(...args){paintedCalls++;paintedColumns.add(Math.floor(args[1]/256));ok(args.slice(1).every(Number.isFinite),'painted source and destination rectangles remain finite')}},{get:(o,k)=>o[k]||(()=>{})});
for(const tool of Object.keys(c.BlindSpotData.TOOLS)){const actor=new Simulation({...LEVELS[0],tool});actor.aim(102,608);const p=rig.pose(actor,99,{x:220,y:490},1,false);skin.draw(paintedContext,p,{width:1024,height:1536});skin.draw(paintedContext,p,{width:1024,height:1536},true)}
ok(paintedColumns.size===4,'painted rendering uses all four character columns');
const pixels=new Uint8ClampedArray(7*7*4);for(let i=0;i<49;i++){pixels.set([220,220,220,255],i*4)}for(let y=1;y<=5;y++)for(let x=1;x<=5;x++)pixels.set([35,23,20,255],(y*7+x)*4);pixels.set([255,255,255,255],(3*7+3)*4);skin.matte(pixels,7,7);
ok(pixels[3]===0&&pixels[(3*7+3)*4+3]===255,'neutral exterior is isolated while enclosed white highlights survive');ok(pixels[(2*7+2)*4+3]===255,'dark painted hair and linework survive isolation');
ok(fs.existsSync('dist/assets/rebel-parts-painted.png')&&fs.readFileSync('dist/blind-spot-standalone.html','utf8').includes('painted:"data:image/png;base64,'),'painted source is included in the offline game');
console.log('PASS: '+checks+' final assertions including painted sprite assembly.');

require('./floating.test.cjs');

const aftermath=harness();aftermath.click('playBtn');aftermath.drag(55,25);aftermath.tick(9);const resultTime=aftermath.state().time;aftermath.tick(1);ok(aftermath.state().screen==='result'&&aftermath.state().time>resultTime+.9,'result screen continues the production physics clock');console.log('PASS all production and floating regression checks.');

require('./contraptions.test.cjs');
const startPose=rig.pose(null,99,{x:220,y:490},1,true);
const aimActor=new Simulation(LEVELS[0]);aimActor.aim(102,570);const targetPose=rig.pose(aimActor,99,{x:220,y:490},1,true);
const eased=rig.stabilize(targetPose,startPose,1/60);
ok(eased.shoulder.x>targetPose.shoulder.x&&eased.shoulder.x<startPose.shoulder.x,'posture eases into a sudden pull');
ok(eased.hand.x===targetPose.hand.x&&eased.hand.y===targetPose.hand.y,'smoothing preserves exact aiming contact');
const settleAt=fps=>{let p=startPose;for(let i=0;i<fps;i++)p=rig.stabilize(targetPose,p,1/fps);return p};
ok(Math.abs(settleAt(30).shoulder.x-settleAt(144).shoulder.x)<1e-8,'body smoothing is independent of rendering rate');
console.log('PASS: '+checks+' assertions plus floating and contraption fixtures.');
require('./stress-physics.cjs');
const fractional=harness({height:719.984375});fractional.click('playBtn');
for(const [type,x,y] of [['pointerdown',220,490],['pointermove',185,535],['pointerup',185,535]])fractional.ids.game.fire(type,{clientX:x,clientY:y,pointerId:1,button:0});
ok(fractional.state().projectile.x===185&&fractional.state().projectile.y===535,'fractional canvas height does not perturb an identical visible drag');
console.log('PASS final: '+checks+' assertions plus mechanics and 360 stress runs.');
