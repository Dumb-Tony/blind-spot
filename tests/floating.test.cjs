// Regression fixtures exercise real Matter bodies and the shipped simulation.
const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict'),Matter=require('../dist/vendor/matter.min.js');
const c={Matter,console};vm.createContext(c);for(const f of ['game-data','physics'])vm.runInContext(fs.readFileSync('dist/'+f+'.js','utf8'),c);
const {Simulation}=c.BlindSpotPhysics;
const fixture={tool:'street-stone',shots:3,stars:[1,2],blocks:[{x:800,y:590,w:160,h:60,material:'wood'},{x:800,y:540,w:100,h:40,material:'heavy'}],cameras:[{x:800,y:501}]};
const tick=(s,n)=>{for(let i=0;i<n;i++)s.step()};
for(const moveBase of [false,true]){
 const s=new Simulation(fixture),base=s.blocks[0],top=s.blocks[1],cam=s.cameras[0];for(const b of [base,top,cam])Matter.Sleeping.set(b,true);
 if(moveBase)Matter.Body.setPosition(base,{x:450,y:590});else{Matter.Composite.remove(s.engine.world,base);s.blocks.shift()}
 s.armed=true;s.state='flying';tick(s,240);
 assert(top.position.y>590&&cam.position.y>550,'entire unsupported sleeping stack falls when support is removed or slides away');
 assert(!top.isSleeping&&!cam.isSleeping&&cam.game.disabled,'camera follows collapse and scores');
}
for(const state of ['ready','aiming','won','lost']){
 let events=0;const s=new Simulation(fixture,()=>events++);s.aim(150,520);s.launch();s.state=state;const b=s.blocks[1];Matter.Body.setPosition(b,{x:450,y:260});Matter.Body.setVelocity(b,{x:0,y:2});tick(s,45);assert(b.position.y>400,state+': gravity continues');assert(s.shotsUsed===1,'settling does not spend tools');
}
const timed=new Simulation(fixture);timed.aim(150,520);timed.launch();timed.shotTime=14.1;const top=timed.blocks[1];Matter.Body.setPosition(top,{x:450,y:260});Matter.Body.setVelocity(top,{x:0,y:2});timed.step();assert(timed.state==='ready');tick(timed,45);assert(top.position.y>400,'next tool loading does not freeze a falling body');
const last=new Simulation({...fixture,shots:1});last.aim(150,520);last.launch();last.shotTime=14.1;Matter.Body.setPosition(last.blocks[1],{x:450,y:260});Matter.Body.setVelocity(last.blocks[1],{x:0,y:2});last.step();assert(last.state==='flying','final throw waits for moving structures beyond timeout');
const untouched=new Simulation(fixture),before=JSON.stringify(untouched.blocks.map(b=>b.position));tick(untouched,600);assert(JSON.stringify(untouched.blocks.map(b=>b.position))===before,'pre-launch layout remains stable');
const cleanup=new Simulation(fixture);cleanup.aim(150,520);cleanup.launch();const block=cleanup.blocks[0],cam=cleanup.cameras[0];Matter.Body.setPosition(block,{x:1550,y:300});Matter.Body.setPosition(cam,{x:1550,y:250});cleanup.step();assert(!cleanup.blocks.includes(block)&&cam.game.removed&&cam.game.disabled,'off-world bodies leave both physics and drawing lists');
console.log('PASS floating regressions: removed/sliding supports, all play states, timeout, final-shot settling, initial stability and cleanup.');
