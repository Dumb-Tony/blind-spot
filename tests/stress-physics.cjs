const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict'),Matter=require('../dist/vendor/matter.min.js');const c={Matter};vm.createContext(c);for(const f of ['game-data','physics'])vm.runInContext(fs.readFileSync('dist/'+f+'.js','utf8'),c);
let runs=0;const unresolved=[];
for(const [i,l] of c.BlindSpotData.LEVELS.entries())for(const [dx,dy] of [[17,-5],[65,65],[110,0]]){
 const s=new c.BlindSpotPhysics.Simulation({...l,shots:1});s.aim(220-dx,490+dy);assert(s.launch());let n=0;
 for(;n<2400&&s.state==='flying';n++){s.step();if(n%30===0)assert(Matter.Composite.allBodies(s.engine.world).every(b=>[b.position.x,b.position.y,b.angle,b.velocity.x,b.velocity.y].every(Number.isFinite)&&(b.isStatic||!b.isSleeping)),l.name+': valid awake bodies');}
 if(s.state==='flying')unresolved.push({level:i+1,pull:[dx,dy],physics:s.snapshot().physics});runs++;
}
console.log(JSON.stringify({runs,unresolved},null,2));assert(!unresolved.length,'every final shot resolves after motion settles');
