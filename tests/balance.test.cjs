const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert');
const context={Matter:require('../dist/vendor/matter.min.js'),console};
vm.createContext(context);
for(const file of ['dist/game-data.js','dist/physics.js','tests/balance-tools.js'])vm.runInContext(fs.readFileSync(file,'utf8'),context);
const rows=JSON.parse(fs.readFileSync('tests/balance-routes.json','utf8'));
assert.equal(rows.length,8,'all eight opening levels have balance fixtures');
for(const row of rows){
  const level=context.BlindSpotData.LEVELS[row.level-1];
  assert.ok(level.shots>=level.stars[0]+3,`${level.name} allows three cleanup throws`);
  assert.ok(row.families.length>=3,`${level.name} has three distinct winning approaches`);
  for(const family of row.families){
    assert.ok(family.nearby>=7,`${level.name} route tolerates at least seven of nine nearby aims`);
    assert.ok(context.BlindSpotBalance.play(level,family.shots,[0,0],true).won,`${level.name} route recovers after a weak first throw`);
  }
}
console.log('PASS: opening balance fixtures cover three tolerant, recoverable approaches per level.');
