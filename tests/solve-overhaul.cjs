const fs=require('node:fs'),vm=require('node:vm');
const ctx={console,Matter:require('../dist/vendor/matter.min.js')};vm.createContext(ctx);
for(const file of ['game-data.js','physics.js'])vm.runInContext(fs.readFileSync('dist/'+file,'utf8'),ctx);
const {Simulation}=ctx.BlindSpotPhysics,{LEVELS,WORLD}=ctx.BlindSpotData;
function play(seq,level){const s=new Simulation(level);for(const [dx,dy] of seq){s.aim(WORLD.anchor.x-dx,WORLD.anchor.y+dy);s.launch();let n=0;while(s.state==='flying'&&n++<600)s.step();if(s.state==='won')break}return s}
const candidates=[];for(let dx=55;dx<=117;dx+=5)for(let dy=-15;dy<=100;dy+=5)if(Math.hypot(dx,dy)<=118)candidates.push([dx,dy]);
const output=[];
for(let i=0;i<8;i++){
  const l=LEVELS[i];let seq=[],best=null;
  for(let shot=0;shot<l.shots;shot++){
    let round=null;
    for(const c of candidates){const attempt=[...seq,c],s=play(attempt,l);const score=(l.cameras.length-s.remaining)*1000+s.breaks*2+s.cameras.filter(c=>!c.game.disabled).reduce((v,c)=>v+Math.min(30,Math.abs(c.position.x-c.game.mount.x)*.1),0);if(!round||score>round.score)round={score,seq:attempt,s};if(s.state==='won')break}
    seq=round.seq;best=round.s;if(best.state==='won')break;
  }
  const initial=new Simulation(l);const shifts=initial.cameras.map((c,k)=>Math.hypot(c.position.x-l.cameras[k].x,c.position.y-l.cameras[k].y));
  const row={level:i+1,name:l.name,won:best.state==='won',remaining:best.remaining,shots:seq,stars:ctx.BlindSpotData.starsFor(l,seq.length),initialCameraShift:shifts.map(n=>+n.toFixed(1))};output.push(row);console.log(JSON.stringify(row));
}
if(process.argv.includes('--save'))fs.writeFileSync('tests/solutions.json',JSON.stringify(output,null,2));
if(output.some(r=>!r.won))process.exitCode=1;
