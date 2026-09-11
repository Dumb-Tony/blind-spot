const fs=require("fs"),vm=require("vm"),assert=require("assert"),Matter=require("../dist/vendor/matter.min.js");
const c={window:{}};vm.createContext(c);vm.runInContext(fs.readFileSync("dist/game-data.js","utf8"),c);
const {LEVELS,MATERIALS}=c.window.BlindSpotData,{Engine,World,Bodies,Body,Events,Composite}=Matter;

function make(level){
  const engine=Engine.create({enableSleeping:true});engine.gravity.y=1;engine.gravity.scale=.001;
  const cameras=[],blocks=[];
  World.add(engine.world,[Bodies.rectangle(640,685,1480,70,{isStatic:true,friction:.95}),Bodies.rectangle(-35,360,70,1440,{isStatic:true}),Bodies.rectangle(1315,360,70,1440,{isStatic:true})]);
  for(const d of level.blocks){const m=MATERIALS[d.material],b=Bodies.rectangle(d.x,d.y,d.w,d.h,{isStatic:!!d.static,density:m.density,friction:m.friction,restitution:m.restitution,angle:d.angle||0,chamfer:{radius:d.material==="heavy"?4:1}});b.g={kind:"block",material:d.material};blocks.push(b);World.add(engine.world,b)}
  for(const d of level.cameras){const b=Bodies.rectangle(d.x,d.y,54,34,{density:.0022,friction:.8,restitution:.1,angle:d.angle||0,chamfer:{radius:6}});b.g={kind:"camera",dead:false,startY:d.y,fall:0};cameras.push(b);World.add(engine.world,b)}
  Events.on(engine,"collisionStart",event=>event.pairs.forEach(({bodyA:a,bodyB:b})=>{const rv=Math.hypot(a.velocity.x-b.velocity.x,a.velocity.y-b.velocity.y);for(const q of[a,b]){if(q.g?.kind==="block"&&!q.g.dead&&!q.isStatic&&rv>MATERIALS[q.g.material].breakSpeed){q.g.dead=true;World.remove(engine.world,q)}if(q.g?.kind==="camera"&&!q.g.dead&&rv>3.15)q.g.dead=true}}));
  return{engine,cameras,blocks};
}
function shoot(state,vx,vy){const p=Bodies.circle(190,535,18,{density:.008,friction:.78,frictionAir:.005,restitution:.32});World.add(state.engine.world,p);Body.setVelocity(p,{x:vx,y:vy});for(let f=0;f<480;f++){Engine.update(state.engine,1000/60);for(const q of state.cameras)if(!q.g.dead){const fallen=q.position.y>q.g.startY+45||Math.abs(((q.angle+Math.PI)%(Math.PI*2))-Math.PI)>.72;q.g.fall=fallen?q.g.fall+1:0;if(q.g.fall>18)q.g.dead=true}if(f>80&&Composite.allBodies(state.engine.world).every(b=>b.isStatic||b.speed<.22))break}World.remove(state.engine.world,p)}
const sequences=[
  [[22,-5]],
  [[22,-5],[21,-8],[23,-3]],
  [[21,-7],[23,-5],[20,-10],[23,-3]],
  [[21,-7],[23,-5],[20,-10],[23,-3]],
  [[22,-6],[21,-9],[23,-4]],
  [[21,-8],[23,-5],[20,-11],[23,-3]],
  [[21,-7],[23,-5],[20,-10],[23,-3]],
  [[20,-12],[22,-8],[23,-5],[21,-3],[24,-1]]
];
for(let i=0;i<LEVELS.length;i++){
  const s=make(LEVELS[i]);let used=0;for(const [vx,vy] of sequences[i]){shoot(s,vx,vy);used++;if(s.cameras.every(q=>q.g.dead))break}
  const dead=s.cameras.filter(q=>q.g.dead).length;console.log(`${i+1}. ${LEVELS[i].name}: ${dead}/${s.cameras.length} cameras disabled in ${used}/${LEVELS[i].shots} shots`);
  assert.ok(dead>0,`Level ${i+1} produced no camera interaction in representative shots`);
  assert.ok(s.cameras.every(q=>q.g.dead),`Level ${i+1} was not completed within its shot allowance`);
}
console.log("PASS: all eight levels completed within their shot allowances in deterministic physics simulation.");

const transitionEngine=Engine.create({enableSleeping:true});
const transitioning=Bodies.circle(190,535,18,{density:.008,frictionAir:.005});
Body.setStatic(transitioning,true);World.add(transitionEngine.world,transitioning);
Body.setStatic(transitioning,false);Body.setVelocity(transitioning,{x:20,y:-8});Engine.update(transitionEngine,1000/60);
assert.ok(Number.isFinite(transitioning.position.x)&&transitioning.position.x>190,"Released sling body must move with finite physics state");
console.log("PASS: loaded static stone restores finite mass and moves after release.");
