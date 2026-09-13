// Exercise the real renderer with a decoded-atlas stand-in, recording draw operations.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
let calls=[];const context=new Proxy({createLinearGradient:()=>({addColorStop(){}})},{get:(o,k)=>o[k]||((...args)=>calls.push([k,...args])),set:(o,k,v)=>{o[k]=v;calls.push(['set',k,v]);return true;}});
class Image{constructor(){this.complete=true;this.naturalWidth=1254;}}
const window={BlindSpotAssets:{atlas:'',materials:'atlas'},BlindSpotPaintedSkin:{}};
const scope={window,Image,document:{getElementById:()=>null}};vm.createContext(scope);
for(const file of ['game-data.js','renderer.js'])vm.runInContext(fs.readFileSync('dist/'+file,'utf8'),scope);
const renderer=new window.BlindSpotRenderer.Renderer({getContext:()=>context});
for(const [material,tile] of [['wood',0],['heavy',1],['steel',2],['cell',3],['glass',null]]){
 const body={position:{x:600,y:400},angle:0,game:{material,w:30,h:130,kind:'block',hp:30,maxHP:42}};
 calls=[];renderer.block(body);const first=calls.filter(c=>c[0]==='drawImage').map(c=>c.slice(2));
 if(tile===null){assert.equal(first.length,0,'Glass must not use an opaque bitmap');assert(calls.some(c=>c[0]==='set'&&c[1]==='fillStyle'&&c[2]==='#6adce938'),'Glass retains translucent fill');}
 else {assert(first.length>0,material+' uses texture atlas');for(const [sx,sy,sw,sh] of first){assert.equal(sx,tile%2*627+2);assert.equal(sy,Math.floor(tile/2)*627+2);assert.equal(sw,623);assert.equal(sh,623);}}
 if(material==='wood')assert(calls.some(c=>c[0]==='rotate'&&c[1]===Math.PI/2),'Upright wood grain follows beam length');
 body.position={x:930,y:580};body.angle=1.6;calls=[];renderer.block(body);
 assert.deepEqual(calls.filter(c=>c[0]==='drawImage').map(c=>c.slice(2)),first,'Texture mapping stays attached when body moves');
 body.game.kind='debris';body.game.w=15;body.game.h=60;body.game.paint=[{x:0,y:0,r:5,seed:2}];calls=[];renderer.block(body);
 assert(calls.some(c=>c[0]==='set'&&c[2]==='#d827a0'),'Paint remains on top of every material');
}
console.log('PASS material atlas quadrants, translucent glass, upright grain, attached textures, painted debris');
