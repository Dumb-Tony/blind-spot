const fs=require("fs"),vm=require("vm"),assert=require("assert");
const context={window:{}};vm.createContext(context);vm.runInContext(fs.readFileSync("dist/game-data.js","utf8"),context);
const {LEVELS,MATERIALS,REGIONS,REBELS,TOOLS,starsFor}=context.window.BlindSpotData;
assert.strictEqual(LEVELS.length,8,"Region 1 must contain eight levels");
assert.strictEqual(REGIONS[0].levels,LEVELS.length,"Region count must match level data");
assert.ok(REBELS.mara&&TOOLS["street-stone"],"Starter rebel and tool must exist");
assert.deepStrictEqual(Object.keys(MATERIALS),["wood","glass","heavy","steel"]);
LEVELS.forEach((level,i)=>{
  assert.ok(level.name&&level.hint,`Level ${i+1} needs readable labels`);
  assert.ok(level.shots>=level.stars[1],`Level ${i+1} must permit its 2-star threshold`);
  assert.ok(level.stars[0]<level.stars[1],`Level ${i+1} star thresholds must be ordered`);
  assert.ok(level.cameras.length>0,`Level ${i+1} needs a target`);
  assert.strictEqual(starsFor(level,level.stars[0]),3);
  assert.strictEqual(starsFor(level,level.stars[1]),2);
  assert.strictEqual(starsFor(level,level.shots),level.shots<=level.stars[1]?2:1);
  level.blocks.forEach(b=>assert.ok(MATERIALS[b.material],`Level ${i+1} has unknown material`));
});
assert.ok(LEVELS.at(-1).finale,"Final level must be the Region finale");
console.log("PASS: 8 levels, registries, material references, star scoring, and finale data validated.");
