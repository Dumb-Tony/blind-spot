const fs=require("fs"),vm=require("vm"),assert=require("assert"),Matter=require("../dist/vendor/matter.min.js");

class ClassList{
  constructor(classes=[]){this.items=new Set(classes)}
  toggle(name,on){on?this.items.add(name):this.items.delete(name)}
  contains(name){return this.items.has(name)}
  add(name){this.items.add(name)}
  remove(name){this.items.delete(name)}
}
function node(classes=[]){return{classList:new ClassList(classes),textContent:"",innerHTML:"",disabled:false,dataset:{},style:{},setAttribute(){},addEventListener(){},querySelectorAll(){return[]}}}
const ids={game:node(),hud:node(["hidden"]),menu:node(["screen","active"]),levels:node(["screen"]),how:node(["screen"]),result:node(["screen"]),toast:node(),levelGrid:node()};
["backBtn","levelLabel","hintLabel","cameraCount","shotCount","restartBtn","muteBtn","playBtn","howBtn","levelsBack","howClose","howPlay","resultEyebrow","resultTitle","resultStars","resultDetail","retryBtn","nextBtn","resultLevels"].forEach(id=>ids[id]=node());
ids.game.width=1280;ids.game.height=720;ids.game.getContext=()=>new Proxy({createLinearGradient:()=>({addColorStop(){}}),measureText:()=>({width:10})},{get:(o,k)=>k in o?o[k]:(()=>{})});
ids.game.getBoundingClientRect=()=>({x:0,y:0,left:0,top:0,width:1280,height:720});
const context={Matter,console,setTimeout,clearTimeout,performance:{now:()=>0},requestAnimationFrame(){},document:{getElementById:id=>ids[id]},window:{addEventListener(){}}};
context.window.window=context.window;context.window.document=context.document;context.window.Matter=Matter;context.window.performance=context.performance;context.window.requestAnimationFrame=context.requestAnimationFrame;
Object.defineProperty(context.window,"localStorage",{get(){throw new Error("Storage access denied")}});
vm.createContext(context);
vm.runInContext(fs.readFileSync("dist/game-data.js","utf8"),context);
context.BlindSpotData=context.window.BlindSpotData;
vm.runInContext(fs.readFileSync("dist/game.js","utf8"),context);
assert.strictEqual(typeof ids.playBtn.onclick,"function","PLAY handler must attach even when storage is blocked");
ids.playBtn.onclick();
assert.ok(ids.levels.classList.contains("active"),"PLAY must open level select");
assert.ok(!ids.menu.classList.contains("active"),"Title screen must close");
console.log("PASS: blocked localStorage cannot freeze the title screen; PLAY opens level select.");
