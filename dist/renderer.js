(function(global){
  'use strict';
  const {WORLD,MATERIALS,TOOLS,REGIONS,REBELS}=global.BlindSpotData;
  const TAU=Math.PI*2;
  function rr(ctx,x,y,w,h,r=5){ctx.beginPath();if(ctx.roundRect)ctx.roundRect(x,y,w,h,r);else ctx.rect(x,y,w,h)}
  function circle(ctx,x,y,r,color){ctx.fillStyle=color;ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fill()}
  class Renderer{
    constructor(canvas){this.canvas=canvas;this.ctx=canvas.getContext('2d');this.art=new Image();this.art.src=global.BlindSpotAssets.atlas;this.materialArt=new Image();this.materialArt.src=global.BlindSpotAssets.materials||'';this.rebels=new Image();this.rebels.src=global.BlindSpotAssets.rebels||'';this.painted=new Image();this.paintedTexture=null;this.painted.onload=()=>{this.paintedTexture=global.BlindSpotPaintedSkin.prepare(this.painted)};this.painted.src=global.BlindSpotAssets.painted||'';this.particles=[];this.dust=[];this.paintDrops=[];this.electric=[];this.labels=[];this.rings=[];this.shake=0;this.recoil=0;this.time=0;this.reduceMotion=false;this.guide=null;this.hitFlash=0;this.toastTime=0;this.onArt=null;this.shotAge=99;this.readyAge=1;this.releasePoint={...WORLD.anchor};this.art.onload=()=>this.drawHero()}
    drawHero(){const canvas=document.getElementById('heroArt');if(!canvas||!this.art.complete)return;const c=canvas.getContext('2d');c.drawImage(this.art,0,0,768,1024,0,0,768,1024)}
    materialTexture(c,material,w,h,seed){
      // A fixed world scale and body-local coordinates keep grain attached during a collapse.
      const atlas=this.materialArt,tile={wood:0,heavy:1,steel:2,cell:3}[material];
      if(tile===undefined||!atlas.complete||!atlas.naturalWidth)return;
      const side=atlas.naturalWidth/2,sourceX=(tile%2)*side,sourceY=Math.floor(tile/2)*side,size=192;
      c.save();c.beginPath();c.rect(-w/2,-h/2,w,h);c.clip();
      if(material==='wood'&&h>w){c.rotate(Math.PI/2);[w,h]=[h,w];}
      const ox=seed%117,oy=(seed*7)%113;
      for(let y=-h/2-oy;y<h/2;y+=size)for(let x=-w/2-ox;x<w/2;x+=size){
        // Inset the source crop by two pixels to prevent neighboring atlas tiles bleeding in.
        c.drawImage(atlas,sourceX+2,sourceY+2,side-4,side-4,x,y,size,size);
      }
      c.restore();
    }
    reset(){this.particles=[];this.dust=[];this.paintDrops=[];this.electric=[];this.labels=[];this.rings=[];this.shake=0;this.recoil=0;this.guide=null;this.hitFlash=0;this.shotAge=99;this.readyAge=0;this.rebelPose=null;this.poseStamp=-1;this.releasePoint={...WORLD.anchor}}
    event(e){
      if(e.type==='charge'){this.rings.push({x:e.x,y:e.y,life:.5,color:'#ffe884',radius:45});}
      if(e.type==='blast'){this.burst(e.x,e.y,48,'#ffd47d',9);this.burst(e.x,e.y,28,'#e4794e',6);this.rings.push({x:e.x,y:e.y,life:1,color:'#ffdf91',radius:e.radius});this.labels.push({x:e.x,y:e.y-40,life:1.2,text:'POWER BURST',color:'#ffe6a6'});this.shake=Math.max(this.shake,9);}
      if(e.type==='ability'&&e.tool==='emp-puck')this.electric.push({x:e.x,y:e.y,targets:e.affected||[],age:0});
      if(e.type==='paint')this.paintBurst(e);
      if(e.type==='camera'&&e.reason==='LENS PAINTED'){this.shake=Math.max(this.shake,4);return}
      if(e.type==='ability'&&e.tool!=='paint-can'){this.burst(e.x,e.y,42,e.color,7);this.rings.push({x:e.x,y:e.y,life:1,color:e.color,radius:e.radius});}
      if(e.type==='ready')this.readyAge=0;
      if(e.type==='launch'){this.shotAge=0;this.releasePoint={x:e.x??220,y:e.y??490};this.recoil=1;this.burst(220,490,12,'#fff2b8',3)}
      if(e.type==='impact'&&e.strength>3){if(e.y>570){this.dust.push({x:e.x,y:Math.min(615,e.y),age:0,size:Math.min(35,e.strength*2)});this.dust=this.dust.slice(-24);}this.shake=Math.max(this.shake,Math.min(8,e.strength*.4));this.burst(e.x,e.y,Math.min(16,e.strength),'#ffe7b0',3)}
      if(e.type==='break'){const count=e.material==='glass'?26:20;this.burst(e.x,e.y,count,MATERIALS[e.material].color,e.material==='heavy'?2:5);for(const p of this.particles.slice(-count))p.material=e.material;if(e.material==='heavy')this.dust.push({x:e.x,y:e.y,age:0,size:55});this.rings.push({x:e.x,y:e.y,life:.35,color:e.material==='glass'?'#a7faff':'#ffd27e'});this.shake=Math.max(this.shake,5)}
      if(e.type==='camera'){this.burst(e.x,e.y,28,'#ff7b59',6);this.burst(e.x,e.y,14,'#e3ff79',5);this.labels.push({x:e.x,y:e.y-46,life:1.6,text:e.combo>1?`${e.combo}× CHAIN!`:e.reason,color:e.combo>1?'#e3ff79':'#fff2c9'});this.rings.push({x:e.x,y:e.y,life:.6,color:'#ff8867'});this.shake=10;this.hitFlash=.12}
      if(e.type==='win')for(let x=250;x<1200;x+=140)this.burst(x,180,22,['#ff8969','#d9ff63','#79e9ec'][Math.floor(x/140)%3],5);
    }
    paintBurst(e){
      const destinations=[...e.destinations];
      for(let i=0;i<72;i++){const a=i*2.399,r=35+(i*37%110);destinations.push({x:e.x+Math.cos(a)*r,y:Math.min(620,e.y+Math.sin(a)*r)})}
      destinations.forEach((p,i)=>{this.paintDrops.push({x:e.x,y:e.y,tx:p.x,ty:p.y,age:0,duration:.2+(i%7)*.035,size:3+i%5,seed:i})});
      this.paintDrops=this.paintDrops.slice(-220);
    }
    paintSurface(c,marks,w,h){
      if(!marks?.length)return;c.save();c.beginPath();c.rect(-w/2,-h/2,w,h);c.clip();
      for(const mark of marks)this.paintMark(c,mark);c.restore();
    }
    paintMark(c,p,flat=false){
      if(p.born===undefined)p.born=this.time;const age=Math.max(0,this.time-p.born),grow=Math.min(1,.35+age*4);
      c.save();c.translate(p.x,p.y);if(flat)c.scale(1,.14);c.globalAlpha=.96;
      c.fillStyle='#d827a0';c.beginPath();
      for(let i=0;i<=28;i++){const a=i/28*TAU,r=p.r*grow*(.78+.13*Math.sin(i*2.7+p.seed)+.09*Math.cos(i*4.1+p.seed));i?c.lineTo(Math.cos(a)*r,Math.sin(a)*r):c.moveTo(Math.cos(a)*r,Math.sin(a)*r)}c.closePath();c.fill();
      circle(c,-p.r*.15,-p.r*.13,p.r*.55*grow,'#f45bcc');
      for(let i=0;i<7;i++){const a=i*2.399+p.seed,r=p.r*(.9+(i%3)*.22)*grow;circle(c,Math.cos(a)*r,Math.sin(a)*r,2+i%3,'#ee42bb')}
      if(!flat){c.strokeStyle='#ee42bb';c.lineCap='round';for(let i=0;i<3;i++){const x=(i-1)*p.r*.43,len=(9+(p.seed+i*7)%19)*Math.min(1,age*.65);c.lineWidth=3+i%2;c.beginPath();c.moveTo(x,p.r*.2);c.lineTo(x,p.r*.2+len);c.stroke();circle(c,x,p.r*.2+len,c.lineWidth*.6,'#f45bcc')}}
      c.strokeStyle='#ffb6ee';c.lineWidth=2;c.beginPath();c.moveTo(-p.r*.4,-p.r*.2);c.lineTo(-p.r*.1,-p.r*.35);c.stroke();c.restore();
    }
    burst(x,y,count,color,speed){for(let i=0;i<count;i++){const a=Math.random()*TAU,s=Math.random()*speed+1;this.particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-2,life:.35+Math.random()*.7,color,size:2+Math.random()*4,angle:Math.random()*TAU})}if(this.particles.length>420)this.particles.splice(0,this.particles.length-420)}
    animate(dt){for(const d of this.dust)d.age+=dt;this.dust=this.dust.filter(d=>d.age<.65);this.poseDt=dt;this.shotAge+=dt;this.readyAge+=dt;this.time+=dt;for(const e of this.electric)e.age+=dt;this.electric=this.electric.filter(e=>e.age<1.3);for(const p of this.paintDrops)p.age+=dt;this.paintDrops=this.paintDrops.filter(p=>p.age<p.duration);this.shake*=Math.pow(.001,dt);this.recoil=Math.max(0,this.recoil-dt*3);this.hitFlash=Math.max(0,this.hitFlash-dt);for(const p of this.particles){p.x+=p.vx*dt*60;p.y+=p.vy*dt*60;p.vy+=dt*13;p.life-=dt;p.angle+=dt*3}this.particles=this.particles.filter(p=>p.life>0);for(const l of this.labels){l.life-=dt;l.y-=dt*21}this.labels=this.labels.filter(l=>l.life>0);this.rings.forEach(r=>r.life-=dt);this.rings=this.rings.filter(r=>r.life>0)}
    background(sim){
      const c=this.ctx,region=sim?.level.region||0,theme=[['#f2b289','#17374b','#e8c38e'],['#bd83ba','#34264a','#f6a6d9'],['#659da9','#132b48','#73e8f0'],['#d39b6d','#243344','#edc388'],['#b87c85','#303751','#ffb497'],['#8187bb','#242b50','#bba5f6']][region];
      const sky=c.createLinearGradient(0,0,0,620);sky.addColorStop(0,theme[0]);sky.addColorStop(1,theme[1]);c.fillStyle=sky;c.fillRect(0,0,1280,720);
      if(this.art.complete&&this.art.naturalWidth){c.save();c.globalAlpha=.7;c.drawImage(this.art,768,120,768,650,0,0,1280,620);c.restore()}
      const atmosphere=c.createLinearGradient(0,90,0,620);atmosphere.addColorStop(0,theme[1]+'38');atmosphere.addColorStop(.55,theme[1]+'60');atmosphere.addColorStop(1,'#101c368f');c.fillStyle=atmosphere;c.fillRect(0,0,1280,620);
      // Low-contrast district architecture sits behind every collidable object.
      c.save();c.globalAlpha=.24;c.strokeStyle=theme[2];c.lineWidth=2;
      if(region===2||region===5){for(let x=440;x<1200;x+=240){c.beginPath();c.moveTo(x,350);c.lineTo(x,205);c.moveTo(x-30,238);c.lineTo(x+30,238);c.moveTo(x-19,220);c.lineTo(x+19,220);c.stroke();circle(c,x,203,3,theme[2])}}
      if(region===3||region===4){for(let x=470;x<1250;x+=270){c.beginPath();c.moveTo(x,560);c.lineTo(x,290);c.lineTo(x+160,320);c.lineTo(x,330);c.moveTo(x+135,317);c.lineTo(x+135,405);c.stroke()}}
      if(region===1){for(let i=0;i<7;i++){c.fillStyle=['#d583b5','#64bab9','#d8ba72'][i%3];c.beginPath();c.arc(530+i*104,368,38,Math.PI,0);c.fill()}}
      c.restore();
      // Roof edge, expansion joints and warm rim light anchor the actors and structures.
      const ground=c.createLinearGradient(0,620,0,720);ground.addColorStop(0,'#334659');ground.addColorStop(.15,'#1b2a40');ground.addColorStop(1,'#101a2e');c.fillStyle=ground;c.fillRect(0,620,1280,100);c.fillStyle=theme[2];c.fillRect(0,620,1280,2);c.fillStyle='#718392';c.fillRect(0,622,1280,5);c.fillStyle='#0b152a';c.fillRect(0,629,1280,3);
      c.strokeStyle='#a2b3c21a';c.lineWidth=1;for(let x=-40;x<1280;x+=100){c.beginPath();c.moveTo(x,632);c.lineTo(x+35,720);c.stroke()}c.fillStyle='#bac1b54d';for(let x=32;x<1280;x+=116)c.fillRect(x,623,5,2);
      c.fillStyle='#102238b3';rr(c,76,611,213,9,3);c.fill();c.strokeStyle=theme[2]+'90';c.lineWidth=2;c.beginPath();c.moveTo(86,617);c.lineTo(109,617);c.moveTo(258,617);c.lineTo(281,617);c.stroke();
      // A restrained district placard leaves the high-arc play space legible.
      c.save();c.translate(462,142);c.rotate(-.025);c.fillStyle='#101e32db';rr(c,-98,-27,235,65,7);c.fill();c.fillStyle=theme[2];c.fillRect(-98,-18,3,37);c.textAlign='left';c.font='900 10px system-ui';c.fillText('MINISTRY / SURVEILLANCE DIVISION',-83,-8);c.fillStyle='#f5eddb';c.font='900 17px system-ui';c.fillText(REGIONS[region].name.toUpperCase(),-83,16);c.restore();
    }
    rebel(sim,front=false){
      const rig=global.BlindSpotRebelRig;let p=this.rebelPose;if(!front||!p){p=rig.stabilize(rig.pose(sim,this.shotAge,this.releasePoint,this.time,this.reduceMotion,this.readyAge),p,this.poseDt||1/60,sim?.state==='aiming'||this.shotAge<.04);this.rebelPose=p;}if(this.paintedTexture)global.BlindSpotPaintedSkin.draw(this.ctx,p,this.paintedTexture,front);else rig.draw(this.ctx,p,this.time,this.reduceMotion,front);
      if(!front&&sim?.state==='ready'){const c=this.ctx;c.textAlign='center';c.font='900 11px system-ui';c.fillStyle='#fff1d8';c.fillText('PULL TO AIM',265,423)}
    }
    sling(sim,front=false){
      if(sim&&sim.tool.id!=='street-stone'){if(!front)this.launcher(sim);return}
      const c=this.ctx,a=WORLD.anchor;let pos=a;if(sim&&['ready','aiming'].includes(sim.state))pos=sim.projectile.position;else if(this.shotAge<.35&&!this.reduceMotion)pos={x:a.x+Math.sin(this.shotAge*65)*Math.exp(-this.shotAge*12)*22,y:a.y};
      c.lineCap='round';
      if(!front){c.strokeStyle='#182035';c.lineWidth=23;c.beginPath();c.moveTo(a.x,617);c.lineTo(a.x,534);c.moveTo(a.x,548);c.lineTo(a.x-24,481);c.moveTo(a.x,548);c.lineTo(a.x+24,481);c.stroke();c.strokeStyle='#b68452';c.lineWidth=12;c.stroke();c.strokeStyle='#e6ba75';c.lineWidth=3;c.beginPath();c.moveTo(a.x+3,595);c.lineTo(a.x+3,543);c.stroke();c.strokeStyle='#78e7e1';c.lineWidth=9;c.beginPath();c.moveTo(a.x-9,574);c.lineTo(a.x+9,574);c.stroke()}
      c.strokeStyle=front?'#ffe4a4':'#784d3d';c.lineWidth=front?6:8;c.beginPath();c.moveTo(a.x+(front?-24:24),481);c.lineTo(pos.x,pos.y);c.stroke();
    }
    launcher(sim){
      const c=this.ctx,tool=sim.tool.id,accent=TOOLS[tool].color,a=WORLD.anchor,v=sim.launchVelocity(),tilt=['ready','aiming'].includes(sim.state)?Math.atan2(v.y,v.x):-.3;
      c.save();c.strokeStyle='#182339';c.lineWidth=12;c.beginPath();c.moveTo(196,616);c.lineTo(220,545);c.lineTo(248,616);c.stroke();c.fillStyle='#31445c';rr(c,200,530,40,28,6);c.fill();
      if(tool==='grapple'){circle(c,219,561,26,'#172339');for(let r=8;r<25;r+=5){c.strokeStyle='#d4ac62';c.lineWidth=3;c.beginPath();c.arc(219,561,r,0,TAU);c.stroke()}c.strokeStyle='#ffd275';c.beginPath();c.moveTo(220,550);c.lineTo(a.x,a.y);c.stroke()}
      if(tool==='paint-can'){c.fillStyle='#ef42b7';rr(c,182,557,20,45,5);c.fill();c.strokeStyle='#b8c7d3';c.lineWidth=4;c.beginPath();c.moveTo(192,557);c.lineTo(201,518);c.stroke()}
      if(sim.state==='aiming'){const p=sim.projectile.position;c.strokeStyle=tool==='paint-can'?'#a7bac5':accent;c.lineWidth=tool==='paint-can'?5:2;c.setLineDash(tool==='emp-puck'?[4,5]:[]);c.beginPath();c.moveTo(a.x-20,a.y+5);c.lineTo(p.x,p.y);c.stroke();c.setLineDash([])}
      c.translate(a.x,a.y);c.rotate(tilt);c.fillStyle='#25354d';c.strokeStyle='#111c2e';c.lineWidth=4;rr(c,-28,-23,64,46,7);c.fill();c.stroke();
      if(tool==='paint-can'){c.fillStyle='#8ba7b7';rr(c,15,-25,34,50,5);c.fill();c.fillStyle=accent;rr(c,40,-28,9,56,3);c.fill();c.fillStyle='#172339';c.fillRect(44,-18,5,36)}
      if(tool==='emp-puck'){for(let x=-15;x<=35;x+=12){c.strokeStyle=accent;c.lineWidth=5;c.beginPath();c.moveTo(x,-24);c.lineTo(x,24);c.stroke()}circle(c,-13,0,8,'#d9ffff')}
      if(tool==='grapple'){c.fillStyle='#ffd275';c.fillRect(-23,-16,40,8);c.fillRect(-23,8,40,8);c.fillStyle='#9daebe';c.fillRect(11,-8,42,16)}
      c.restore();
    }
    block(b,ctx=this.ctx){
      const c=ctx,g=b.game,m=MATERIALS[g.material];if(!m)return;
      this.surfaceSeeds??=new WeakMap();
      if(!this.surfaceSeeds.has(g))this.surfaceSeeds.set(g,Math.abs(Math.round(b.position.x*13+b.position.y*29+g.w*7)));
      const seed=this.surfaceSeeds.get(g),w=g.w,h=g.h,glass=g.material==='glass',debris=g.kind==='debris';
      c.save();c.translate(b.position.x,b.position.y);c.rotate(b.angle);
      const shape=()=>{if(g.outline){c.beginPath();g.outline.forEach((v,i)=>i?c.lineTo(v.x,v.y):c.moveTo(v.x,v.y));c.closePath();}else rr(c,-w/2,-h/2,w,h,glass?1:2);};
      c.shadowColor=glass?'transparent':'#07122555';c.shadowBlur=4;c.shadowOffsetX=2;c.shadowOffsetY=3;
      c.fillStyle=glass?'#6adce938':m.color;shape();c.fill();
      c.shadowColor='transparent';c.shadowBlur=0;c.shadowOffsetX=0;c.shadowOffsetY=0;
      c.save();shape();c.clip();this.materialTexture(c,g.material,w,h,seed);
      if(g.material==='wood'){
        // Grain follows the long axis, including upright posts. End cuts cross it.
        c.save();let length=w,thickness=h;if(h>w){c.rotate(Math.PI/2);length=h;thickness=w;}
        c.strokeStyle='#76412566';c.lineWidth=.8;
        for(let y=-thickness/2+4;y<thickness/2;y+=6){c.beginPath();c.moveTo(-length/2,y);c.bezierCurveTo(-length*.15,y-2,length*.17,y+3,length/2,y+1);c.stroke();}
        c.fillStyle='#f2c37a88';c.fillRect(-length/2,-thickness/2,4,thickness);c.fillRect(length/2-4,-thickness/2,4,thickness);
        c.strokeStyle='#734126';c.lineWidth=1;for(let y=-thickness/2+3;y<thickness/2;y+=4){c.beginPath();c.moveTo(-length/2,y);c.lineTo(-length/2+3,y+2);c.moveTo(length/2-3,y);c.lineTo(length/2,y+2);c.stroke();}
        if(!debris&&length>55){for(const x of [-length/2+9,length/2-9]){circle(c,x,0,2.5,'#603c2b');circle(c,x-.5,-.6,1,'#dcc9a3');}}
        c.restore();
      }
      if(glass){
        const sheen=c.createLinearGradient(-w/2,-h/2,w/2,h/2);sheen.addColorStop(0,'#b8ffff38');sheen.addColorStop(.45,'#b8ffff08');sheen.addColorStop(1,'#19b9d548');c.fillStyle=sheen;c.fillRect(-w/2,-h/2,w,h);
        c.save();c.beginPath();c.rect(-w/2+2,-h/2+2,w-4,h-4);c.clip();
        c.strokeStyle='#e7ffff68';c.lineWidth=7;c.beginPath();c.moveTo(-w*.4,-h/2);c.lineTo(w*.1,h/2);c.stroke();c.lineWidth=2;c.beginPath();c.moveTo(-w*.4+10,-h/2);c.lineTo(w*.1+10,h/2);c.stroke();c.restore();
        if(!debris){c.strokeStyle='#e0ffffb0';c.lineWidth=1;c.strokeRect(-w/2+3,-h/2+3,w-6,h-6);}
        if(g.hp<g.maxHP){c.strokeStyle='#f0ffff';c.lineWidth=1.1;c.beginPath();c.moveTo(-w*.12,-h*.1);c.lineTo(-w*.35,h*.25);c.moveTo(-w*.12,-h*.1);c.lineTo(w*.3,-h*.35);c.moveTo(-w*.12,-h*.1);c.lineTo(w*.32,h*.2);c.stroke();}
      }
      if(g.material==='heavy'){
        // Cast concrete: irregular edge spalls, exposed aggregate and a broad chalky lip.
        c.fillStyle='#d2d0bd66';c.fillRect(-w/2+2,-h/2+2,w-4,3);
        for(let i=0;i<Math.min(36,Math.ceil(w*h/130));i++){const x=-w/2+3+(seed+i*47)%Math.max(1,w-6),y=-h/2+3+(seed*3+i*23)%Math.max(1,h-6);c.fillStyle=i%3?'#303d4960':'#e4dccc88';c.beginPath();c.moveTo(x-2,y);c.lineTo(x,y-1.5);c.lineTo(x+2.5,y+1);c.lineTo(x-.5,y+2);c.fill();}
        c.fillStyle='#374553';for(let x=-w/2+11;x<w/2;x+=31){c.beginPath();c.moveTo(x,h/2);c.lineTo(x+3,h/2-3);c.lineTo(x+8,h/2-1);c.lineTo(x+10,h/2);c.fill();}
      }
      if(g.material==='steel'){
        // Machined plate ribs, welded edge and screw heads distinguish fixed steel.
        c.strokeStyle='#bbcad12b';c.lineWidth=1;for(let y=-h/2+8;y<h/2-3;y+=13){c.beginPath();c.moveTo(-w/2+3,y);c.lineTo(w/2-3,y);c.stroke();}
        c.strokeStyle='#080f2399';c.lineWidth=3;c.strokeRect(-w/2+4,-h/2+4,w-8,h-8);
        c.strokeStyle='#edbf58';c.lineWidth=3;for(let x=-w/2+5;x<w/2-3;x+=13){c.beginPath();c.moveTo(x,h/2-3);c.lineTo(Math.min(x+5,w/2-3),h/2-8);c.stroke();}
        for(const x of [-w/2+7,w/2-7])for(const y of [-h/2+7,h/2-7]){circle(c,x,y,3.1,'#172432');circle(c,x-.4,y-.5,2.1,'#a6b7c8');c.strokeStyle='#344352';c.lineWidth=1;c.beginPath();c.moveTo(x-1.3,y+.5);c.lineTo(x+1.1,y-1);c.stroke();}
      }
      if(g.material==='cell'){
        c.fillStyle='#172a3bd9';rr(c,-w*.27,-h*.35,w*.54,h*.7,3);c.fill();
        c.strokeStyle='#6b361e';c.lineWidth=1;for(let y=-h/2+8;y<h/2-5;y+=5){c.beginPath();c.moveTo(-w/2+3,y);c.lineTo(-w/2+7,y);c.moveTo(w/2-7,y);c.lineTo(w/2-3,y);c.stroke();}
        c.fillStyle=g.fuse===undefined?'#ffc85f':'#fff5c4';c.beginPath();c.moveTo(2,-13);c.lineTo(-7,2);c.lineTo(0,2);c.lineTo(-3,13);c.lineTo(9,-3);c.lineTo(2,-3);c.closePath();c.fill();
      }
      if(!glass){c.strokeStyle='#ffedcc66';c.lineWidth=1;c.beginPath();c.moveTo(-w/2+2,h/2-2);c.lineTo(-w/2+2,-h/2+2);c.lineTo(w/2-2,-h/2+2);c.stroke();}
      c.restore();c.strokeStyle=glass?'#b2f8f0':m.stroke;c.lineWidth=debris?1:glass?1.5:2;shape();c.stroke();
      if(g.material==='cell'){c.fillStyle='#ffe1a0';c.fillRect(-9,-h/2-3,6,3);c.fillRect(4,-h/2-3,6,3);}
      if(g.hinge){circle(c,0,0,12,'#17283d');circle(c,0,0,8,'#e8c37d');circle(c,0,0,3,'#6d7280');c.strokeStyle='#fff0c3';c.lineWidth=2;c.beginPath();c.arc(0,0,16,-.7,1.2);c.stroke();}
      if(!glass&&g.hp<g.maxHP&&Number.isFinite(g.maxHP)){c.save();shape();c.clip();c.strokeStyle='#372c34';c.lineWidth=1.2+1.6*(1-Math.max(0,g.hp/g.maxHP));c.beginPath();c.moveTo(-w*.28,-h/2);c.lineTo(w*.05,-h*.12);c.lineTo(-w*.1,h*.05);c.lineTo(w*.23,h/2);c.stroke();if(g.hp/g.maxHP<.6){c.lineWidth=1.2;c.beginPath();c.moveTo(w*.05,-h*.12);c.lineTo(w*.3,-h*.24);c.lineTo(w/2,-h*.1);c.moveTo(-w*.1,h*.05);c.lineTo(-w*.3,h*.2);c.lineTo(-w/2,h*.13);c.stroke();}c.restore();}
      c.save();shape();c.clip();this.paintSurface(c,g.paint,w,h);c.restore();c.restore();
    }
    camera(b,ctx=this.ctx){const c=ctx,g=b.game,dead=g.disabled;c.save();c.translate(b.position.x,b.position.y);c.rotate(b.angle);if(!dead){c.fillStyle='#ff604616';c.beginPath();c.moveTo(-23,0);c.lineTo(-110,-34);c.lineTo(-110,34);c.closePath();c.fill()}
      c.fillStyle='#121d31';rr(c,-27,-21,54,42,8);c.fill();c.fillStyle=dead?'#5b6573':'#fff2d8';rr(c,-25,-19,50,37,7);c.fill();c.strokeStyle='#142238';c.lineWidth=3;c.stroke();c.fillStyle=dead?'#26344a':'#ff6c51';rr(c,-22,-13,30,26,6);c.fill();circle(c,-6,0,10,'#142238');circle(c,-6,0,6,dead?'#46556b':'#ff674d');if(!dead){circle(c,-8,-2,2.5,'#ffecc6');circle(c,17,-10,2,Math.sin(this.time*4+b.id)>.1?'#ff7757':'#6a3d35')}else{c.strokeStyle='#92e8cd';c.lineWidth=2;c.beginPath();c.moveTo(-12,-5);c.lineTo(-1,6);c.moveTo(-1,-5);c.lineTo(-12,6);c.stroke()}
      if(g.bolted){c.fillStyle='#a7b6c6';c.fillRect(-23,19,46,5);circle(c,-19,21,3,'#fff');circle(c,19,21,3,'#fff')}if(g.shield&&!dead){c.strokeStyle='#f577d0';c.lineWidth=4;c.strokeRect(-29,-24,58,48)}if(g.circuit&&!dead){c.fillStyle=g.circuit==='A'?'#65eaf2':'#f7c46f';c.font='bold 14px system-ui';c.textAlign='center';c.fillText(g.circuit,0,-29)}
      c.fillStyle='#172339';c.fillRect(13,2,7,3);c.fillRect(13,8,7,3);if(g.disabledBy==='emp-puck'){c.strokeStyle='#65eaf2';c.lineWidth=3;c.beginPath();c.moveTo(-14,-9);c.lineTo(-4,-2);c.lineTo(-11,2);c.lineTo(1,11);c.stroke();circle(c,17,-10,2,'#436879')}this.paintSurface(c,g.paint,52,38);c.restore();
    }
    stone(b,loaded=false){const c=this.ctx;c.save();c.translate(b.position.x,b.position.y);c.rotate(b.angle);if(loaded){c.strokeStyle='#d9ff6377';c.lineWidth=2;c.beginPath();c.arc(0,0,27+(this.reduceMotion?0:Math.sin(this.time*4)*3),0,TAU);c.stroke()}
      if(b.game?.tool==='paint-can'){
        c.strokeStyle='#172339';c.lineWidth=3;c.fillStyle=b.game.spent?'#9f819c':'#dce4ee';rr(c,-14,-15,28,32,4);c.fill();c.stroke();c.fillStyle='#ee42bb';c.fillRect(-12,-5,24,17);circle(c,0,3,6,'#ffb6ee');c.strokeStyle='#9faec1';c.lineWidth=3;c.beginPath();c.arc(0,-8,17,Math.PI,TAU);c.stroke();c.fillStyle='#8d9dac';rr(c,b.game.spent?2:-15,b.game.spent?-23:-18,30,5,2);c.fill();c.restore();return;
      }
      if(b.game?.tool==='emp-puck'){c.scale(1,.68);circle(c,0,0,21,'#102339');c.strokeStyle=b.game.spent?'#4b6b7e':'#65eaf2';c.lineWidth=5;c.beginPath();c.arc(0,0,16,0,TAU);c.stroke();circle(c,0,0,7,b.game.spent?'#34566b':'#e3ffff');c.restore();return}
      if(b.game?.tool==='grapple'){c.strokeStyle='#182339';c.lineWidth=9;c.beginPath();c.moveTo(-19,0);c.lineTo(16,0);c.moveTo(8,-16);c.lineTo(19,-9);c.lineTo(22,0);c.lineTo(19,9);c.lineTo(8,16);c.stroke();c.strokeStyle='#d5e3ed';c.lineWidth=5;c.stroke();circle(c,-16,0,5,'#ffd275');c.restore();return}
      circle(c,0,0,19,'#182339');circle(c,-1,-2,16,'#7f91ac');c.fillStyle='#b6c4d5';c.beginPath();c.moveTo(-10,-7);c.lineTo(0,-13);c.lineTo(8,-7);c.lineTo(3,-2);c.closePath();c.fill();c.strokeStyle=b.game?.color||'#ff8568';c.lineWidth=6;c.beginPath();c.moveTo(-14,-5);c.lineTo(15,7);c.stroke();c.restore();
    }
    draw(sim){const c=this.ctx;c.save();c.clearRect(0,0,1280,720);if(this.shake>.15&&!this.reduceMotion)c.translate((Math.random()-.5)*this.shake,(Math.random()-.5)*this.shake);this.background(sim);this.rebel(sim);this.sling(sim);
      if(sim){
        for(const mark of sim.paintGround||[])this.paintMark(c,mark,true);
        // A faint previous arc makes adjusting a missed shot intuitive.
        c.lineWidth=2;c.strokeStyle='#f6e3bd35';c.setLineDash([3,8]);c.beginPath();sim.lastTrail.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));c.stroke();c.setLineDash([]);
        c.lineWidth=3;for(const cable of [...sim.cables,...sim.hooks.map(h=>h.constraint)]){const end=global.Matter.Constraint.pointBWorld(cable);c.strokeStyle=sim.cables.includes(cable)?'#c6d0dc':'#ffd275';c.beginPath();c.moveTo(sim.cables.includes(cable)?cable.pointA.x:WORLD.anchor.x,sim.cables.includes(cable)?cable.pointA.y:WORLD.anchor.y);c.lineTo(end.x,end.y);c.stroke()}
        for(const circuit of ['A','B']){const nodes=sim.cameras.filter(b=>b.game.circuit===circuit&&!b.game.disabled);c.strokeStyle=circuit==='A'?'#65eaf280':'#f7c46f80';c.setLineDash([5,7]);c.beginPath();nodes.forEach((b,i)=>{for(const a of nodes.slice(i+1))if(Math.hypot(a.position.x-b.position.x,a.position.y-b.position.y)<=TOOLS['emp-puck'].linkRange){c.moveTo(b.position.x,b.position.y);c.lineTo(a.position.x,a.position.y)}});c.stroke();c.setLineDash([])}
        sim.blocks.forEach(b=>this.block(b));sim.cameras.filter(b=>!b.game.removed).forEach(b=>this.camera(b));sim.stones.forEach(b=>this.stone(b));
        if(['ready','aiming'].includes(sim.state))this.stone(sim.projectile,true);
        if(sim.state==='aiming'&&this.guide){const {points}=this.guide;points.forEach((p,i)=>{if(i===0)return;const fade=Math.min(1,(1-i/(points.length-1))*2);circle(c,p.x,p.y,3+fade,`rgba(231,255,158,${fade*.95})`)});
          const v=sim.launchVelocity(),power=Math.min(100,Math.round(Math.hypot(v.x,v.y)/(118*.23)*100));c.fillStyle='#10172bf0';rr(c,145,349,150,42,9);c.fill();c.fillStyle='#d9ff63';c.font='900 16px system-ui';c.textAlign='center';c.fillText(`${power}% POWER`,220,375);
        }
        if(sim.state==='flying'){const last=sim.trail.slice(-26),tool=sim.tool.id;
          if(tool==='grapple'&&!sim.projectile.game.spent){c.strokeStyle='#dfba72';c.lineWidth=2;c.beginPath();c.moveTo(WORLD.anchor.x,WORLD.anchor.y);c.lineTo(sim.projectile.position.x,sim.projectile.position.y);c.stroke()}
          else last.forEach((p,i)=>{c.globalAlpha=i/30;circle(c,p.x,p.y,tool==='paint-can'?3:2.5*(i/26),TOOLS[tool].color||'#ffde90');if(tool==='emp-puck'&&i%3===0){c.strokeStyle='#65eaf2';c.lineWidth=1.5;c.beginPath();c.moveTo(p.x-5,p.y-6);c.lineTo(p.x+2,p.y);c.lineTo(p.x-3,p.y+5);c.stroke()}});c.globalAlpha=1;
        }
        this.sling(sim,true);this.rebel(sim,true);

      }
      for(const e of this.electric){c.save();c.globalAlpha=Math.max(0,1-e.age/1.3);c.strokeStyle='#a2ffff';c.lineWidth=3;for(const target of e.targets){const end=target.position;c.beginPath();c.moveTo(e.x,e.y);for(let i=1;i<12;i++){const t=i/12,jitter=Math.sin(i*13+Math.floor(this.time*16))*11;c.lineTo(e.x+(end.x-e.x)*t,e.y+(end.y-e.y)*t+jitter)}c.lineTo(end.x,end.y);c.stroke()}c.restore()}
      for(const p of this.paintDrops){const t=Math.min(1,p.age/p.duration),x=p.x+(p.tx-p.x)*t,y=p.y+(p.ty-p.y)*t-40*Math.sin(t*Math.PI);c.save();c.translate(x,y);c.rotate(Math.atan2(p.ty-p.y,p.tx-p.x));c.scale(1.6,1);circle(c,0,0,p.size*(1-t*.25),'#ed39b5');circle(c,-1,-1,p.size*.35,'#ffb0ea');c.restore()}
      for(const d of this.dust){c.save();c.globalAlpha=(1-d.age/.65)*.24;c.translate(d.x,d.y-d.age*12);c.scale(1,.35);circle(c,0,0,d.size*(.3+d.age*2),'#d6cab0');c.restore();}
      for(const p of this.particles){c.save();c.globalAlpha=Math.min(1,p.life*3);c.translate(p.x,p.y);c.rotate(p.angle);c.fillStyle=p.color;if(p.material==='glass'){c.beginPath();c.moveTo(-p.size,-p.size*.6);c.lineTo(p.size,0);c.lineTo(0,p.size);c.closePath();c.fill();}else if(p.material==='wood'){c.fillRect(-p.size*1.5,-p.size*.2,p.size*3,p.size*.4);}else{c.fillRect(-p.size/2,-p.size/2,p.size,p.size);}c.restore()}
      for(const r of this.rings){c.globalAlpha=Math.min(1,r.life*2);c.strokeStyle=r.color;c.lineWidth=3;c.beginPath();c.arc(r.x,r.y,(1-r.life)*(r.radius||65),0,TAU);c.stroke()}c.globalAlpha=1;
      for(const l of this.labels){c.save();c.globalAlpha=Math.min(1,l.life*2);c.font='1000 21px system-ui';c.textAlign='center';c.lineWidth=5;c.strokeStyle='#142039';c.strokeText(l.text,l.x,l.y);c.fillStyle=l.color;c.fillText(l.text,l.x,l.y);c.restore()}
      c.restore();
    }
    thumbnail(canvas,level){const c=canvas.getContext('2d');canvas.width=360;canvas.height=145;c.fillStyle='#101b30';c.fillRect(0,0,360,145);c.save();c.translate(-170,0);c.scale(.43,.22);c.fillStyle='#50667e';c.fillRect(400,620,1000,10);level.blocks.forEach(d=>this.block({position:{x:d.x,y:d.y},angle:0,game:{...d,kind:'block',hp:Infinity,maxHP:Infinity}},c));level.cameras.forEach(d=>this.camera({position:{x:d.x,y:d.y},angle:0,game:{...d,disabled:false}},c));c.restore()}
  }
  global.BlindSpotRenderer={Renderer};
})(window);
