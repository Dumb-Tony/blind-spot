const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict'),Matter=require('../dist/vendor/matter.min.js');
const c={Matter,console};vm.createContext(c);for(const f of ['game-data','physics'])vm.runInContext(fs.readFileSync('dist/'+f+'.js','utf8'),c);
const {Simulation}=c.BlindSpotPhysics,{LEVELS,B,C}=c.BlindSpotData;
const level=(blocks,cameras=[{...C(1300,580),bolted:true}])=>({tool:'emp-puck',shots:2,stars:[1,2],blocks,cameras});
const tick=(s,n)=>{for(let i=0;i<n;i++)s.step()};
let bursts=0;const chain=new Simulation(level([B(700,600,36,40,'cell'),B(840,600,36,40,'cell'),B(1060,600,36,40,'cell')]),e=>{if(e.type==='blast')bursts++});
chain.aim(150,520);chain.launch();const first=chain.blocks[0],second=chain.blocks[1],far=chain.blocks[2];chain.chargeCell(first);chain.chargeCell(first);tick(chain,25);
assert.equal(bursts,2,'nearby cells chain once each');assert(second.game.broken&&!far.game.broken,'chain stops at a gap beyond burst range');assert.equal(chain.cameras[0].game.disabled,false,'far bolted lens is preserved');
const emp=new Simulation(level([B(700,600,36,40,'cell'),B(950,600,36,40,'cell')]));emp.activateTool(emp.projectile,emp.blocks[0],{x:610,y:600});assert(emp.blocks[0].game.fuse!==undefined&&emp.blocks[1].game.fuse===undefined,'EMP charges only a cell in its existing close range');
const hinged=new Simulation(LEVELS[8]),beam=hinged.blocks.find(b=>b.game.hinge),pivot={...beam.position};hinged.armed=true;hinged.state='flying';
for(const b of [...hinged.blocks])if(!b.isStatic&&!b.game.hinge){Matter.Composite.remove(hinged.engine.world,b);hinged.blocks=hinged.blocks.filter(v=>v!==b)}
Matter.Body.setAngularVelocity(beam,.08);tick(hinged,30);assert(Math.hypot(beam.position.x-pivot.x,beam.position.y-pivot.y)<2,'hinge stays attached to its visible hub');assert(Math.abs(beam.angle)>.15,'hinged platform rotates under an off-center impulse');
const weighted=new Simulation(LEVELS[8]),brace=weighted.blocks.find(b=>b.game.material==='glass'&&b.position.x<800),deck=weighted.blocks.find(b=>b.game.hinge);
Matter.Composite.remove(weighted.engine.world,brace);weighted.blocks=weighted.blocks.filter(b=>b!==brace);weighted.armed=true;weighted.state='flying';tick(weighted,240);
assert(Math.abs(deck.angle)>.25&&weighted.cameras[0].game.disabled,'removing the loaded end brace tips the deck through gravity alone');
for(const l of LEVELS.filter(l=>l.contraption)){
 const s=new Simulation(l);assert(s.cameras.every((b,i)=>Math.hypot(b.position.x-l.cameras[i].x,b.position.y-l.cameras[i].y)<25),l.name+': stable starting cameras');
 s.aim(205,480);s.launch();tick(s,1200);assert(Matter.Composite.allBodies(s.engine.world).every(b=>[b.position.x,b.position.y,b.angle].every(Number.isFinite)),l.name+': a missed shot has finite physics');
 assert(!s.blocks.some(b=>b.game.fuse!==undefined&&!b.game.broken),'no charged cells left hanging after a miss');
}
console.log('PASS contraptions: bounded cell chains, close EMP activation, fixed armor, attached moving hinges, all 24 stable layouts and missed-shot stress.');
