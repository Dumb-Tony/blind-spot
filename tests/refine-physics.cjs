const fs=require('fs'),vm=require('vm'),Matter=require('../dist/vendor/matter.min.js');
const ctx={Matter,console};vm.createContext(ctx);for(const f of ['game-data','physics'])vm.runInContext(fs.readFileSync('dist/'+f+'.js','utf8'),ctx);
const i=+process.argv[2],l=ctx.BlindSpotData.LEVELS[i],Simulation=ctx.BlindSpotPhysics.Simulation;
function play(seq){const s=new Simulation(l);for(const [x,y,t] of seq){if(t&&!s.selectTool(t))return s;s.aim(220-x,490+y);s.launch();for(let n=0;n<1800&&s.state==='flying';n++)s.step();if(s.state==='won')break;}return s;}
let beam=[{seq:[],score:0}],win=null;
for(let depth=0;depth<l.stars[0]&&!win;depth++){
 const next=[];
 for(const prior of beam){const before=play(prior.seq);for(const t of l.arsenal?Object.keys(l.arsenal).filter(t=>before.inventory[t]):[null]){
 for(let x=35;x<=115&&!win;x+=5)for(let y=-10;y<=110&&!win;y+=5){if(Math.hypot(x,y)>118)continue;const seq=[...prior.seq,t?[x,y,t]:[x,y]],s=play(seq);if(s.state==='won'){win=seq;break;}
 const score=(l.cameras.length-s.remaining)*1000+s.cameras.filter(c=>!c.game.disabled).reduce((v,c)=>v+Math.min(60,Math.abs(c.position.x-c.game.mount.x)*.1),0)+s.breaks;
 next.push({seq,score});
 }}if(win)break;}
 next.sort((a,b)=>b.score-a.score);beam=[];for(const p of next){if(beam.every(b=>Math.abs(b.score-p.score)>.05))beam.push(p);if(beam.length>=16)break;}console.log('depth',depth+1,'best',beam[0], 'win',win);
}
if(win){const row={id:l.id,level:i+1,name:l.name,won:true,remaining:0,shots:win,stars:3};fs.writeFileSync('tests/solutions-refined-'+i+'.json',JSON.stringify(row,null,2));}else process.exitCode=1;
