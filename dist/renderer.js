(function(global){
  'use strict';
  const {WORLD,MATERIALS,TOOLS,REGIONS,REBELS}=global.BlindSpotData;
  const TAU=Math.PI*2;
  function rr(ctx,x,y,w,h,r=5){ctx.beginPath();if(ctx.roundRect)ctx.roundRect(x,y,w,h,r);else ctx.rect(x,y,w,h)}
  function circle(ctx,x,y,r,color){ctx.fillStyle=color;ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fill()}
  class Renderer{
    constructor(canvas){this.canvas=canvas;this.ctx=canvas.getContext('2d');this.art=new Image();this.art.src=global.BlindSpotAssets.atlas;this.rebels=new Image();this.rebels.src=global.BlindSpotAssets.rebels||'';this.particles=[];this.paintDrops=[];this.electric=[];this.labels=[];this.rings=[];this.shake=0;this.recoil=0;this.time=0;this.reduceMotion=false;this.guide=null;this.hitFlash=0;this.toastTime=0;this.onArt=null;this.art.onload=()=>this.drawHero()}
    drawHero(){const canvas=document.getElementById('heroArt');if(!canvas||!this.art.complete)return;const c=canvas.getContext('2d');c.drawImage(this.art,0,0,768,1024,0,0,768,1024)}
    reset(){this.particles=[];this.paintDrops=[];this.electric=[];this.labels=[];this.rings=[];this.shake=0;this.recoil=0;this.guide=null;this.hitFlash=0}
    event(e){
      if(e.type==='ability'&&e.tool==='emp-puck')this.electric.push({x:e.x,y:e.y,targets:e.affected||[],age:0});
      if(e.type==='paint')this.paintBurst(e);
      if(e.type==='camera'&&e.reason==='LENS PAINTED'){this.shake=Math.max(this.shake,4);return}
      if(e.type==='ability'&&e.tool!=='paint-can'){this.burst(e.x,e.y,42,e.color,7);this.rings.push({x:e.x,y:e.y,life:1,color:e.color,radius:e.radius});}
      if(e.type==='launch'){this.recoil=1;this.burst(220,490,12,'#fff2b8',3)}
      if(e.type==='impact'&&e.strength>3){this.shake=Math.max(this.shake,Math.min(8,e.strength*.4));this.burst(e.x,e.y,Math.min(16,e.strength),'#ffe7b0',3)}
      if(e.type==='break'){this.burst(e.x,e.y,e.material==='glass'?26:20,MATERIALS[e.material].color,5);this.rings.push({x:e.x,y:e.y,life:.35,color:e.material==='glass'?'#a7faff':'#ffd27e'});this.shake=Math.max(this.shake,5)}
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
    animate(dt){this.time+=dt;for(const e of this.electric)e.age+=dt;this.electric=this.electric.filter(e=>e.age<1.3);for(const p of this.paintDrops)p.age+=dt;this.paintDrops=this.paintDrops.filter(p=>p.age<p.duration);this.shake*=Math.pow(.001,dt);this.recoil=Math.max(0,this.recoil-dt*3);this.hitFlash=Math.max(0,this.hitFlash-dt);for(const p of this.particles){p.x+=p.vx*dt*60;p.y+=p.vy*dt*60;p.vy+=dt*13;p.life-=dt;p.angle+=dt*3}this.particles=this.particles.filter(p=>p.life>0);for(const l of this.labels){l.life-=dt;l.y-=dt*21}this.labels=this.labels.filter(l=>l.life>0);this.rings.forEach(r=>r.life-=dt);this.rings=this.rings.filter(r=>r.life>0)}
    background(sim){
      const c=this.ctx,g=c.createLinearGradient(0,0,0,620);g.addColorStop(0,'#f5aa79');g.addColorStop(.6,'#f0c298');g.addColorStop(1,'#476e86');c.fillStyle=g;c.fillRect(0,0,1280,720);
      if(this.art.complete&&this.art.naturalWidth)c.drawImage(this.art,768,120,768,650,0,0,1280,620);
      c.fillStyle=['#12233c6b','#431f526b','#083d526b','#6648205b'][sim?.level.region||0];c.fillRect(0,0,1280,620);
      // Flat, contrasting foreground keeps the physical silhouettes readable.
      c.fillStyle='#152238';c.fillRect(0,620,1280,100);c.fillStyle='#7d929a';c.fillRect(0,620,1280,6);c.fillStyle='#31445a';c.fillRect(0,628,1280,12);
      c.strokeStyle='#ffffff10';c.lineWidth=2;for(let x=0;x<1280;x+=94){c.beginPath();c.moveTo(x,643);c.lineTo(x+30,720);c.stroke()}
      c.save();c.translate(558,167);c.rotate(-.025);c.fillStyle='#102039dd';rr(c,-125,-30,250,62,4);c.fill();c.strokeStyle='#d9ff63';c.lineWidth=2;c.stroke();c.textAlign='center';c.fillStyle='#fff3dd';c.font='900 15px system-ui';c.fillText(sim?.level.finale?'MINISTRY OF LOOKING':'YOUR PRIVACY MATTERS*',0,-3);c.font='11px system-ui';c.fillStyle='#e6ae94';c.fillText(sim?.level.finale?'DEPARTMENT OF ABSOLUTELY EVERYTHING':'*to our data collection department',0,17);c.restore();
    }
    rebel(sim){
      const c=this.ctx;const rebel=REBELS[REGIONS[sim?.level.region||0].rebel];const bob=this.reduceMotion?0:Math.sin(this.time*2.5)*1.7;const recoil=this.reduceMotion?0:this.recoil;
      c.save();c.translate(74-recoil*5,619);c.rotate(-recoil*.03);c.fillStyle='#10172b';rr(c,-66,-209+bob,128,209,16);c.fill();
      if(rebel.portrait!==undefined&&this.rebels.complete&&this.rebels.naturalWidth)c.drawImage(this.rebels,rebel.portrait*512,0,512,1024,-54,-220+bob,108,210);else if(this.art.complete&&this.art.naturalWidth)c.drawImage(this.art,0,0,768,1024,-72,-210+bob,144,192);
      c.fillStyle='#d9ff63';rr(c,-41,-22,84,22,4);c.fill();c.textAlign='center';c.fillStyle='#152238';c.font='900 12px system-ui';c.fillText(rebel.name.toUpperCase(),1,-6);c.restore();
      if(sim?.state==='ready'){
        c.textAlign='center';c.font='900 13px system-ui';c.fillStyle='#fff1d8';c.fillText('PULL BACK',220,426);c.font='16px system-ui';c.fillText('↙',206,450);
      }
    }
    sling(sim,front=false){
      if(sim&&sim.level.tool!=='street-stone'){if(!front)this.launcher(sim);return}
      const c=this.ctx,a=WORLD.anchor;let pos=a;if(sim&&['ready','aiming'].includes(sim.state))pos=sim.projectile.position;
      c.lineCap='round';
      if(!front){c.strokeStyle='#182035';c.lineWidth=23;c.beginPath();c.moveTo(a.x,617);c.lineTo(a.x,534);c.moveTo(a.x,548);c.lineTo(a.x-24,481);c.moveTo(a.x,548);c.lineTo(a.x+24,481);c.stroke();c.strokeStyle='#b68452';c.lineWidth=12;c.stroke();c.strokeStyle='#e6ba75';c.lineWidth=3;c.beginPath();c.moveTo(a.x+3,595);c.lineTo(a.x+3,543);c.stroke();c.strokeStyle='#78e7e1';c.lineWidth=9;c.beginPath();c.moveTo(a.x-9,574);c.lineTo(a.x+9,574);c.stroke()}
      c.strokeStyle=front?'#ffe4a4':'#784d3d';c.lineWidth=front?6:8;c.beginPath();c.moveTo(a.x+(front?-24:24),481);c.lineTo(pos.x,pos.y);c.stroke();
    }
    launcher(sim){
      const c=this.ctx,tool=sim.level.tool,accent=TOOLS[tool].color,a=WORLD.anchor,v=sim.launchVelocity(),tilt=['ready','aiming'].includes(sim.state)?Math.atan2(v.y,v.x):-.3;
      c.save();c.strokeStyle='#182339';c.lineWidth=12;c.beginPath();c.moveTo(196,616);c.lineTo(220,545);c.lineTo(248,616);c.stroke();c.fillStyle='#31445c';rr(c,200,530,40,28,6);c.fill();
      if(tool==='grapple'){circle(c,219,561,26,'#172339');for(let r=8;r<25;r+=5){c.strokeStyle='#d4ac62';c.lineWidth=3;c.beginPath();c.arc(219,561,r,0,TAU);c.stroke()}c.strokeStyle='#ffd275';c.beginPath();c.moveTo(220,550);c.lineTo(a.x,a.y);c.stroke()}
      if(tool==='paint-can'){c.fillStyle='#ef42b7';rr(c,182,557,20,45,5);c.fill();c.strokeStyle='#b8c7d3';c.lineWidth=4;c.beginPath();c.moveTo(192,557);c.lineTo(201,518);c.stroke()}
      c.translate(a.x,a.y);c.rotate(tilt);c.fillStyle='#25354d';c.strokeStyle='#111c2e';c.lineWidth=4;rr(c,-28,-23,64,46,7);c.fill();c.stroke();
      if(tool==='paint-can'){c.fillStyle='#8ba7b7';rr(c,15,-25,34,50,5);c.fill();c.fillStyle=accent;rr(c,40,-28,9,56,3);c.fill();c.fillStyle='#172339';c.fillRect(44,-18,5,36)}
      if(tool==='emp-puck'){for(let x=-15;x<=35;x+=12){c.strokeStyle=accent;c.lineWidth=5;c.beginPath();c.moveTo(x,-24);c.lineTo(x,24);c.stroke()}circle(c,-13,0,8,'#d9ffff')}
      if(tool==='grapple'){c.fillStyle='#ffd275';c.fillRect(-23,-16,40,8);c.fillRect(-23,8,40,8);c.fillStyle='#9daebe';c.fillRect(11,-8,42,16)}
      c.restore();
    }
    block(b,ctx=this.ctx){const c=ctx,g=b.game,m=MATERIALS[g.material];if(!m)return;c.save();c.translate(b.position.x,b.position.y);c.rotate(b.angle);const w=g.w,h=g.h;c.fillStyle=m.color;c.strokeStyle=m.stroke;c.lineWidth=g.kind==='debris'?1.5:3;rr(c,-w/2,-h/2,w,h,3);c.fill();c.stroke();
      if(g.material==='wood'){c.strokeStyle='#73442d80';c.lineWidth=1.7;for(let y=-h/2+7;y<h/2-3;y+=15){c.beginPath();c.moveTo(-w/2+5,y);c.lineTo(w/2-5,y+3);c.stroke()}c.fillStyle='#503a32';for(const x of [-w/2+6,w/2-6])for(const y of [-h/2+6,h/2-6])c.fillRect(x-1,y-1,2,2)}
      if(g.material==='glass'){c.fillStyle='#efffff70';c.beginPath();c.moveTo(-w*.42,-h*.42);c.lineTo(-w*.1,-h*.42);c.lineTo(w*.42,h*.42);c.lineTo(w*.1,h*.42);c.closePath();c.fill();c.strokeStyle='#ffffffad';c.lineWidth=1;c.strokeRect(-w/2+4,-h/2+4,w-8,h-8)}
      if(g.material==='heavy'){c.fillStyle='#a7b6cf';c.fillRect(-w/2+5,-h/2+5,w-10,4);c.fillStyle='#3d4e69';for(let x=-w/2+8;x<w/2;x+=24)c.fillRect(x,h/2-9,7,3)}
      if(g.material==='steel'){c.strokeStyle='#efce72';c.lineWidth=5;for(let x=-w/2+6;x<w/2-3;x+=14){c.beginPath();c.moveTo(x,h/2-6);c.lineTo(Math.min(x+7,w/2-3),h/2-13);c.stroke()}c.fillStyle='#a6b7c8';for(const x of [-w/2+6,w/2-6]){circle(c,x,-h/2+6,2,'#a6b7c8')}}
      if(g.hp<g.maxHP&&Number.isFinite(g.maxHP)){c.strokeStyle='#372c34';c.lineWidth=2.5;c.beginPath();c.moveTo(-w*.28,-h/2);c.lineTo(w*.05,-h*.12);c.lineTo(-w*.1,h*.05);c.lineTo(w*.23,h/2);c.stroke()}
      this.paintSurface(c,g.paint,w,h);c.restore();
    }
    camera(b,ctx=this.ctx){const c=ctx,g=b.game,dead=g.disabled;c.save();c.translate(b.position.x,b.position.y);c.rotate(b.angle);if(!dead){c.fillStyle='#ff604616';c.beginPath();c.moveTo(-23,0);c.lineTo(-110,-34);c.lineTo(-110,34);c.closePath();c.fill()}
      c.fillStyle='#121d31';rr(c,-27,-21,54,42,8);c.fill();c.fillStyle=dead?'#5b6573':'#fff2d8';rr(c,-25,-19,50,37,7);c.fill();c.strokeStyle='#142238';c.lineWidth=3;c.stroke();c.fillStyle=dead?'#26344a':'#ff6c51';rr(c,-22,-13,30,26,6);c.fill();circle(c,-6,0,10,'#142238');circle(c,-6,0,6,dead?'#46556b':'#ff674d');if(!dead){circle(c,-8,-2,2.5,'#ffecc6');circle(c,17,-10,2,Math.sin(this.time*4+b.id)>.1?'#ff7757':'#6a3d35')}else{c.strokeStyle='#92e8cd';c.lineWidth=2;c.beginPath();c.moveTo(-12,-5);c.lineTo(-1,6);c.moveTo(-1,-5);c.lineTo(-12,6);c.stroke()}
      if(g.shield&&!dead){c.strokeStyle='#f577d0';c.lineWidth=4;c.strokeRect(-29,-24,58,48)}if(g.circuit&&!dead){c.fillStyle=g.circuit==='A'?'#65eaf2':'#f7c46f';c.font='bold 14px system-ui';c.textAlign='center';c.fillText(g.circuit,0,-29)}
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
        for(const circuit of ['A','B']){const nodes=sim.cameras.filter(b=>b.game.circuit===circuit&&!b.game.disabled);c.strokeStyle=circuit==='A'?'#65eaf280':'#f7c46f80';c.setLineDash([5,7]);c.beginPath();nodes.forEach((b,i)=>i?c.lineTo(b.position.x,b.position.y):c.moveTo(b.position.x,b.position.y));c.stroke();c.setLineDash([])}
        sim.blocks.forEach(b=>this.block(b));sim.cameras.forEach(b=>this.camera(b));sim.stones.forEach(b=>this.stone(b));
        if(['ready','aiming'].includes(sim.state))this.stone(sim.projectile,true);
        if(sim.state==='aiming'&&this.guide){const {points}=this.guide;points.forEach((p,i)=>{if(i===0)return;const fade=Math.min(1,(1-i/(points.length-1))*2);circle(c,p.x,p.y,3+fade,`rgba(231,255,158,${fade*.95})`)});
          const v=sim.launchVelocity(),power=Math.min(100,Math.round(Math.hypot(v.x,v.y)/(118*.23)*100));c.fillStyle='#10172bf0';rr(c,145,349,150,42,9);c.fill();c.fillStyle='#d9ff63';c.font='900 16px system-ui';c.textAlign='center';c.fillText(`${power}% POWER`,220,375);
        }
        if(sim.state==='flying'){const last=sim.trail.slice(-26),tool=sim.level.tool;
          if(tool==='grapple'&&!sim.projectile.game.spent){c.strokeStyle='#dfba72';c.lineWidth=2;c.beginPath();c.moveTo(WORLD.anchor.x,WORLD.anchor.y);c.lineTo(sim.projectile.position.x,sim.projectile.position.y);c.stroke()}
          else last.forEach((p,i)=>{c.globalAlpha=i/30;circle(c,p.x,p.y,tool==='paint-can'?3:2.5*(i/26),TOOLS[tool].color||'#ffde90');if(tool==='emp-puck'&&i%3===0){c.strokeStyle='#65eaf2';c.lineWidth=1.5;c.beginPath();c.moveTo(p.x-5,p.y-6);c.lineTo(p.x+2,p.y);c.lineTo(p.x-3,p.y+5);c.stroke()}});c.globalAlpha=1;
        }
        this.sling(sim,true);
        c.fillStyle='#102039e8';rr(c,360,636,600,25,5);c.fill();c.textAlign='center';c.font='900 12px system-ui';c.fillStyle='#ffe596';c.fillText(`★★★  ${sim.level.stars[0]} STONE${sim.level.stars[0]>1?'S':''} OR FEWER     ·     ★★  ${sim.level.stars[1]} OR FEWER     ·     ★  CLEAR THE LEVEL`,660,653);
      }
      for(const e of this.electric){c.save();c.globalAlpha=Math.max(0,1-e.age/1.3);c.strokeStyle='#a2ffff';c.lineWidth=3;for(const target of e.targets){const end=target.position;c.beginPath();c.moveTo(e.x,e.y);for(let i=1;i<12;i++){const t=i/12,jitter=Math.sin(i*13+Math.floor(this.time*16))*11;c.lineTo(e.x+(end.x-e.x)*t,e.y+(end.y-e.y)*t+jitter)}c.lineTo(end.x,end.y);c.stroke()}c.restore()}
      for(const p of this.paintDrops){const t=Math.min(1,p.age/p.duration),x=p.x+(p.tx-p.x)*t,y=p.y+(p.ty-p.y)*t-40*Math.sin(t*Math.PI);c.save();c.translate(x,y);c.rotate(Math.atan2(p.ty-p.y,p.tx-p.x));c.scale(1.6,1);circle(c,0,0,p.size*(1-t*.25),'#ed39b5');circle(c,-1,-1,p.size*.35,'#ffb0ea');c.restore()}
      for(const p of this.particles){c.save();c.globalAlpha=Math.min(1,p.life*3);c.translate(p.x,p.y);c.rotate(p.angle);c.fillStyle=p.color;c.fillRect(-p.size/2,-p.size/2,p.size,p.size);c.restore()}
      for(const r of this.rings){c.globalAlpha=Math.min(1,r.life*2);c.strokeStyle=r.color;c.lineWidth=3;c.beginPath();c.arc(r.x,r.y,(1-r.life)*(r.radius||65),0,TAU);c.stroke()}c.globalAlpha=1;
      for(const l of this.labels){c.save();c.globalAlpha=Math.min(1,l.life*2);c.font='1000 21px system-ui';c.textAlign='center';c.lineWidth=5;c.strokeStyle='#142039';c.strokeText(l.text,l.x,l.y);c.fillStyle=l.color;c.fillText(l.text,l.x,l.y);c.restore()}
      c.restore();
    }
    thumbnail(canvas,level){const c=canvas.getContext('2d');canvas.width=360;canvas.height=145;c.fillStyle='#101b30';c.fillRect(0,0,360,145);c.save();c.translate(-170,0);c.scale(.43,.22);c.fillStyle='#50667e';c.fillRect(400,620,1000,10);level.blocks.forEach(d=>this.block({position:{x:d.x,y:d.y},angle:0,game:{...d,kind:'block',hp:Infinity,maxHP:Infinity}},c));level.cameras.forEach(d=>this.camera({position:{x:d.x,y:d.y},angle:0,game:{...d,disabled:false}},c));c.restore()}
  }
  global.BlindSpotRenderer={Renderer};
})(window);
