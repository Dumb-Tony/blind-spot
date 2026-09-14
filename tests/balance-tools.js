(function(root){
 const jitter=[[0,0],[-4,0],[4,0],[0,-4],[0,4],[-4,-4],[4,4],[-4,4],[4,-4]];
 function play(level,shots,offset=[0,0],missFirst=false){const s=new root.BlindSpotPhysics.Simulation(level);const sequence=missFirst?[[17,-5],...shots]:shots;
  for(const [x,y,t] of sequence){if(s.shotsLeft<=0)break;if(t&&!s.selectTool(t))break;s.aim(220-x-offset[0],490+y+offset[1]);if(!s.launch())break;for(let n=0;n<1800&&s.state==='flying';n++)s.step();if(s.state==='won')break;}
  return {won:s.state==='won',remaining:s.remaining,used:s.shotsUsed};
 }
 function tolerance(level,shots){return jitter.reduce((sum,offset)=>sum+Number(play(level,shots,offset).won),0);}
 function scan(level){const wins=[],starts=[],grid=[];let trials=0,oneShotWins=0;
  for(let x=35;x<=115;x+=10)for(let y=5;y<=85;y+=10){if(Math.hypot(x,y)>118)continue;trials++;const shot=[x,y];grid.push(shot);let result=play(level,[shot]);starts.push({shot,remaining:result.remaining});if(result.won){oneShotWins++;wins.push({shots:[shot],used:1});}else{const seq=[shot,shot,shot].slice(0,Math.min(3,level.stars[0]));result=play(level,seq);if(result.won)wins.push({shots:seq.slice(0,result.used),used:result.used});}}
  wins.sort((a,b)=>a.used-b.used);const families=[];
  for(const row of wins){if(families.some(f=>Math.hypot(f.shots[0][0]-row.shots[0][0],f.shots[0][1]-row.shots[0][1])<15))continue;const nearby=tolerance(level,row.shots);if(nearby>=7){families.push({...row,nearby,trials:9,missRecovery:play(level,row.shots,[0,0],true).won});if(families.length===3)break;}}
  // Multi-target puzzles should allow aiming at a different surviving structure.
  if(families.length<2){starts.sort((a,b)=>a.remaining-b.remaining);
   for(const start of starts.slice(0,24)){if(families.some(f=>Math.hypot(f.shots[0][0]-start.shot[0],f.shots[0][1]-start.shot[1])<15))continue;let seq=[start.shot],found=false;
    for(let n=1;n<Math.min(4,level.stars[0])&&!found;n++){let best=null;for(const shot of grid){const attempt=[...seq,shot],r=play(level,attempt);if(r.won){const nearby=tolerance(level,attempt);if(nearby>=7){families.push({shots:attempt,used:r.used,nearby,trials:9,missRecovery:play(level,attempt,[0,0],true).won});found=true;break;}}else if(!best||r.remaining<best.remaining)best={shots:attempt,remaining:r.remaining};}if(best)seq=best.shots;else break;}
    if(families.length>=3)break;
   }
  }
  return {trials,oneShotWins,winningStarts:wins.length,families};
 }
 root.BlindSpotBalance={play,tolerance,scan,jitter};
})(typeof window==='undefined'?globalThis:window);
