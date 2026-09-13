const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),Matter=require('../dist/vendor/matter.min.js');
const scope={Matter,console};vm.createContext(scope);for(const f of ['game-data','physics'])vm.runInContext(fs.readFileSync('dist/'+f+'.js','utf8'),scope);
const {Simulation}=scope.BlindSpotPhysics;
for(const material of ['glass','wood','heavy'])for(const vertical of [false,true]){
 const s=new Simulation({tool:'street-stone',shots:3,stars:[1,2],blocks:[{x:800,y:480,w:vertical?40:160,h:vertical?160:40,material}],cameras:[]}),b=s.blocks[0];
 Matter.Body.setAngle(b,.7);Matter.Body.setVelocity(b,{x:4,y:2});Matter.Body.setAngularVelocity(b,.025);const mass=b.mass;
 s.breakBody(b);const pieces=[...s.blocks];assert(pieces.length>2);if(material==='glass')assert(pieces.every(p=>p.vertices.length===3),'Glass forms physical triangles');
 assert(Math.abs(pieces.reduce((sum,p)=>sum+p.mass,0)-mass)<1e-8,'Conserves mass');
 for(const axis of ['x','y'])assert(Math.abs(pieces.reduce((sum,p)=>sum+p.mass*p.velocity[axis],0)-mass*b.velocity[axis])<1e-7,'Conserves linear momentum');
 assert(pieces.every(p=>Matter.Vertices.isConvex(p.vertices)),'Every fragment is convex');
 const chip=pieces.find(p=>Number.isFinite(p.game.hp));if(chip){const previous=chip.mass;s.breakBody(chip);const children=s.blocks.filter(p=>!pieces.includes(p));assert(Math.abs(children.reduce((sum,p)=>sum+p.mass,0)-previous)<1e-8);assert(children.every(p=>p.game.hp===Infinity),'Bounded secondary fragmentation');}
 s.armed=true;s.state='won';for(let i=0;i<600;i++)s.step();assert(s.blocks.every(p=>Number.isFinite(p.position.x)&&Number.isFinite(p.angle)&&!p.isSleeping),'Rubble settles with live physics');
}
console.log('PASS glass shards, wood splinters, concrete crumble, convex fragments, mass/momentum, bounded secondary fracture, settling');
const support=new Simulation({tool:'street-stone',shots:3,stars:[1,2],blocks:[{x:800,y:500,w:160,h:24,material:'wood',hinge:true},{x:900,y:600,w:80,h:40,material:'steel',fixed:true}],cameras:[]});
const beam=support.blocks[0],fixed=support.blocks[1];support.breakBody(fixed);assert(support.blocks.includes(fixed),'Fixed steel survives fracture requests');support.breakBody(beam);assert.equal(support.hinges.length,0);assert(!Matter.Composite.allConstraints(support.engine.world).some(c=>c.bodyB===beam),'Destroyed hinges leave no ghost constraints');
const concrete=new Simulation({tool:'street-stone',shots:3,stars:[1,2],blocks:[{x:800,y:600,w:90,h:32,material:'heavy'}],cameras:[]}),cap=concrete.blocks[0],rock=Matter.Bodies.circle(760,600,19,{density:.008});rock.game={kind:'stone',tool:'street-stone'};
concrete.armed=true;const hit=speed=>{Matter.Body.setVelocity(rock,{x:speed,y:0});concrete.collisions({pairs:[{bodyA:rock,bodyB:cap,collision:{normal:{x:1,y:0},supports:[cap.position]}}]});};
hit(5);assert.equal(cap.game.hp,90,'Low-speed contact does not chip concrete');hit(10);assert(cap.game.hp<90&&cap.game.hp>0,'Moderate impact leaves visible damage');hit(25);assert(concrete.pendingBreak.has(cap),'Hard impact finishes damaged concrete');
console.log('PASS fixed steel, hinge cleanup and progressive concrete impact damage');
