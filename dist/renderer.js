(function(global){
  'use strict';
  const {WORLD,MATERIALS,TOOLS}=global.BlindSpotData;
  const TAU=Math.PI*2;
  function rr(ctx,x,y,w,h,r=5){ctx.beginPath();if(ctx.roundRect)ctx.roundRect(x,y,w,h,r);else ctx.rect(x,y,w,h)}
  function circle(ctx,x,y,r,color){ctx.fillStyle=color;ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fill()}
  class Renderer{
    constructor(canvas){this.canvas=canvas;this.ctx=canvas.getContext('2d');this.art=new Image();this.art.src=global.BlindSpotAssets.atlas;this.particles=[];this.labels=[];this.rings=[];this.shake=0;this.recoil=0;this.time=0;this.reduceMotion=false;this.guide=null;this.hitFlash=0;this.toastTime=0;this.onArt=null;this.art.onload=()=>this.drawHero()}
    drawHero(){const canvas=document.getElementById('heroArt');if(!canvas||!this.art.complete)return;const c=canvas.getContext('2d');c.drawImage(this.art,0,0,768,1024,0,0,768,1024)}
    reset(){this.particles=[];this.labels=[];this.rings=[];this.shake=0;this.recoil=0;this.guide=null;this.hitFlash=0}
    event(e){
      if(e.type==='launch'){this.recoil=1;this.burst(220,490,12,'#fff2b8',3)}
      if(e.type==='impact'&&e.strength>3){this.shake=Math.max(this.shake,Math.min(8,e.strength*.4));this.burst(e.x,e.y,Math.min(16,e.strength),'#ffe7b0',3)}
      if(e.type==='break'){this.burst(e.x,e.y,e.material==='glass'?26:20,MATERIALS[e.material].color,5);this.rings.push({x:e.x,y:e.y,life:.35,color:e.material==='glass'?'#a7faff':'#ffd27e'});this.shake=Math.max(this.shake,5)}
      if(e.type==='camera'){this.burst(e.x,e.y,28,'#ff7b59',6);this.burst(e.x,e.y,14,'#e3ff79',5);this.labels.push({x:e.x,y:e.y-46,life:1.6,text:e.combo>1?`${e.combo}× CHAIN!`:e.reason,color:e.combo>1?'#e3ff79':'#fff2c9'});this.rings.push({x:e.x,y:e.y,life:.6,color:'#ff8867'});this.shake=10;this.hitFlash=.12}
      if(e.type==='win')for(let x=250;x<1200;x+=140)this.burst(x,180,22,['#ff8969','#d9ff63','#79e9ec'][Math.floor(x/140)%3],5);
    }
    burst(x,y,count,color,speed){for(let i=0;i<count;i++){const a=Math.random()*TAU,s=Math.random()*speed+1;this.particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-2,life:.35+Math.random()*.7,color,size:2+Math.random()*4,angle:Math.random()*TAU})}if(this.particles.length>420)this.particles.splice(0,this.particles.length-420)}
    animate(dt){this.time+=dt;this.shake*=Math.pow(.001,dt);this.recoil=Math.max(0,this.recoil-dt*3);this.hitFlash=Math.max(0,this.hitFlash-dt);for(const p of this.particles){p.x+=p.vx*dt*60;p.y+=p.vy*dt*60;p.vy+=dt*13;p.life-=dt;p.angle+=dt*3}this.particles=this.particles.filter(p=>p.life>0);for(const l of this.labels){l.life-=dt;l.y-=dt*21}this.labels=this.labels.filter(l=>l.life>0);this.rings.forEach(r=>r.life-=dt);this.rings=this.rings.filter(r=>r.life>0)}
    background(sim){
      const c=this.ctx,g=c.createLinearGradient(0,0,0,620);g.addColorStop(0,'#f5aa79');g.addColorStop(.6,'#f0c298');g.addColorStop(1,'#476e86');c.fillStyle=g;c.fillRect(0,0,1280,720);
      if(this.art.complete&&this.art.naturalWidth)c.drawImage(this.art,768,120,768,650,0,0,1280,620);
      c.fillStyle='#12233c6b';c.fillRect(0,0,1280,620);
      // Flat, contrasting foreground keeps the physical silhouettes readable.
      c.fillStyle='#152238';c.fillRect(0,620,1280,100);c.fillStyle='#7d929a';c.fillRect(0,620,1280,6);c.fillStyle='#31445a';c.fillRect(0,628,1280,12);
      c.strokeStyle='#ffffff10';c.lineWidth=2;for(let x=0;x<1280;x+=94){c.beginPath();c.moveTo(x,643);c.lineTo(x+30,720);c.stroke()}
      c.save();c.translate(558,167);c.rotate(-.025);c.fillStyle='#102039dd';rr(c,-125,-30,250,62,4);c.fill();c.strokeStyle='#d9ff63';c.lineWidth=2;c.stroke();c.textAlign='center';c.fillStyle='#fff3dd';c.font='900 15px system-ui';c.fillText(sim?.level.finale?'MINISTRY OF LOOKING':'YOUR PRIVACY MATTERS*',0,-3);c.font='11px system-ui';c.fillStyle='#e6ae94';c.fillText(sim?.level.finale?'DEPARTMENT OF ABSOLUTELY EVERYTHING':'*to our data collection department',0,17);c.restore();
    }
    rebel(sim){
      const c=this.ctx;const bob=this.reduceMotion?0:Math.sin(this.time*2.5)*1.7;const recoil=this.reduceMotion?0:this.recoil;
      c.save();c.translate(74-recoil*5,619);c.rotate(-recoil*.03);c.fillStyle='#10172b';rr(c,-66,-209+bob,128,209,16);c.fill();
      if(this.art.complete&&this.art.naturalWidth)c.drawImage(this.art,0,0,768,1024,-72,-210+bob,144,192);
      c.fillStyle='#d9ff63';rr(c,-41,-22,84,22,4);c.fill();c.textAlign='center';c.fillStyle='#152238';c.font='900 12px system-ui';c.fillText('MARA',1,-6);c.restore();
      if(sim?.state==='ready'){
        c.textAlign='center';c.font='900 13px system-ui';c.fillStyle='#fff1d8';c.fillText('PULL BACK',220,426);c.font='16px system-ui';c.fillText('↙',206,450);
      }
    }
    sling(sim,front=false){
      const c=this.ctx,a=WORLD.anchor;let pos=a;if(sim&&['ready','aiming'].includes(sim.state))pos=sim.projectile.position;
      c.lineCap='round';
      if(!front){c.strokeStyle='#182035';c.lineWidth=23;c.beginPath();c.moveTo(a.x,617);c.lineTo(a.x,534);c.moveTo(a.x,548);c.lineTo(a.x-24,481);c.moveTo(a.x,548);c.lineTo(a.x+24,481);c.stroke();c.strokeStyle='#b68452';c.lineWidth=12;c.stroke();c.strokeStyle='#e6ba75';c.lineWidth=3;c.beginPath();c.moveTo(a.x+3,595);c.lineTo(a.x+3,543);c.stroke();c.strokeStyle='#78e7e1';c.lineWidth=9;c.beginPath();c.moveTo(a.x-9,574);c.lineTo(a.x+9,574);c.stroke()}
      c.strokeStyle=front?'#ffe4a4':'#784d3d';c.lineWidth=front?6:8;c.beginPath();c.moveTo(a.x+(front?-24:24),481);c.lineTo(pos.x,pos.y);c.stroke();
    }
    block(b,ctx=this.ctx){const c=ctx,g=b.game,m=MATERIALS[g.material];if(!m)return;c.save();c.translate(b.position.x,b.position.y);c.rotate(b.angle);const w=g.w,h=g.h;c.fillStyle=m.color;c.strokeStyle=m.stroke;c.lineWidth=g.kind==='debris'?1.5:3;rr(c,-w/2,-h/2,w,h,3);c.fill();c.stroke();
      if(g.material==='wood'){c.strokeStyle='#73442d80';c.lineWidth=1.7;for(let y=-h/2+7;y<h/2-3;y+=15){c.beginPath();c.moveTo(-w/2+5,y);c.lineTo(w/2-5,y+3);c.stroke()}c.fillStyle='#503a32';for(const x of [-w/2+6,w/2-6])for(const y of [-h/2+6,h/2-6])c.fillRect(x-1,y-1,2,2)}
      if(g.material==='glass'){c.fillStyle='#efffff70';c.beginPath();c.moveTo(-w*.42,-h*.42);c.lineTo(-w*.1,-h*.42);c.lineTo(w*.42,h*.42);c.lineTo(w*.1,h*.42);c.closePath();c.fill();c.strokeStyle='#ffffffad';c.lineWidth=1;c.strokeRect(-w/2+4,-h/2+4,w-8,h-8)}
      if(g.material==='heavy'){c.fillStyle='#a7b6cf';c.fillRect(-w/2+5,-h/2+5,w-10,4);c.fillStyle='#3d4e69';for(let x=-w/2+8;x<w/2;x+=24)c.fillRect(x,h/2-9,7,3)}
      if(g.material==='steel'){c.strokeStyle='#efce72';c.lineWidth=5;for(let x=-w/2+6;x<w/2-3;x+=14){c.beginPath();c.moveTo(x,h/2-6);c.lineTo(Math.min(x+7,w/2-3),h/2-13);c.stroke()}c.fillStyle='#a6b7c8';for(const x of [-w/2+6,w/2-6]){circle(c,x,-h/2+6,2,'#a6b7c8')}}
      if(g.hp<g.maxHP&&Number.isFinite(g.maxHP)){c.strokeStyle='#372c34';c.lineWidth=2.5;c.beginPath();c.moveTo(-w*.28,-h/2);c.lineTo(w*.05,-h*.12);c.lineTo(-w*.1,h*.05);c.lineTo(w*.23,h/2);c.stroke()}
      c.restore();
    }
    camera(b,ctx=this.ctx){const c=ctx,g=b.game,dead=g.disabled;c.save();c.translate(b.position.x,b.position.y);c.rotate(b.angle);if(!dead){c.fillStyle='#ff604616';c.beginPath();c.moveTo(-23,0);c.lineTo(-110,-34);c.lineTo(-110,34);c.closePath();c.fill()}
      c.fillStyle='#121d31';rr(c,-27,-21,54,42,8);c.fill();c.fillStyle=dead?'#5b6573':'#fff2d8';rr(c,-25,-19,50,37,7);c.fill();c.strokeStyle='#142238';c.lineWidth=3;c.stroke();c.fillStyle=dead?'#26344a':'#ff6c51';rr(c,-22,-13,30,26,6);c.fill();circle(c,-6,0,10,'#142238');circle(c,-6,0,6,dead?'#46556b':'#ff674d');if(!dead){circle(c,-8,-2,2.5,'#ffecc6');circle(c,17,-10,2,Math.sin(this.time*4+b.id)>.1?'#ff7757':'#6a3d35')}else{c.strokeStyle='#92e8cd';c.lineWidth=2;c.beginPath();c.moveTo(-12,-5);c.lineTo(-1,6);c.moveTo(-1,-5);c.lineTo(-12,6);c.stroke()}
      c.fillStyle='#172339';c.fillRect(13,2,7,3);c.fillRect(13,8,7,3);c.restore();
    }
    stone(b,loaded=false){const c=this.ctx;c.save();c.translate(b.position.x,b.position.y);c.rotate(b.angle);if(loaded){c.strokeStyle='#d9ff6377';c.lineWidth=2;c.beginPath();c.arc(0,0,27+(this.reduceMotion?0:Math.sin(this.time*4)*3),0,TAU);c.stroke()}
      circle(c,0,0,19,'#182339');circle(c,-1,-2,16,'#7f91ac');c.fillStyle='#b6c4d5';c.beginPath();c.moveTo(-10,-7);c.lineTo(0,-13);c.lineTo(8,-7);c.lineTo(3,-2);c.closePath();c.fill();c.strokeStyle='#ff8568';c.lineWidth=6;c.beginPath();c.moveTo(-14,-5);c.lineTo(15,7);c.stroke();c.restore();
    }
    draw(sim){const c=this.ctx;c.save();c.clearRect(0,0,1280,720);if(this.shake>.15&&!this.reduceMotion)c.translate((Math.random()-.5)*this.shake,(Math.random()-.5)*this.shake);this.background(sim);this.rebel(sim);this.sling(sim);
      if(sim){
        // A faint previous arc makes adjusting a missed shot intuitive.
        c.lineWidth=2;c.strokeStyle='#f6e3bd35';c.setLineDash([3,8]);c.beginPath();sim.lastTrail.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));c.stroke();c.setLineDash([]);
        sim.blocks.forEach(b=>this.block(b));sim.cameras.forEach(b=>this.camera(b));sim.stones.forEach(b=>this.stone(b));
        if(['ready','aiming'].includes(sim.state))this.stone(sim.projectile,true);
        if(sim.state==='aiming'&&this.guide){const {points,hit}=this.guide;points.forEach((p,i)=>{if(i===0)return;circle(c,p.x,p.y,3.4,`rgba(231,255,158,${Math.max(.3,1-i/85)})`)});if(hit){c.strokeStyle=hit.kind==='camera'?'#ff9170':'#e4ff8b';c.lineWidth=3;c.beginPath();c.arc(hit.x,hit.y,23,0,TAU);c.stroke();c.textAlign='center';c.font='900 12px system-ui';c.fillStyle=c.strokeStyle;c.fillText('FIRST IMPACT',hit.x,hit.y-32)}
          const v=sim.launchVelocity(),power=Math.min(100,Math.round(Math.hypot(v.x,v.y)/(118*.23)*100));c.fillStyle='#10172bf0';rr(c,145,349,150,42,9);c.fill();c.fillStyle='#d9ff63';c.font='900 16px system-ui';c.textAlign='center';c.fillText(`${power}% POWER`,220,375);
        }
        if(sim.state==='flying'){const last=sim.trail.slice(-26);last.forEach((p,i)=>circle(c,p.x,p.y,2.5*(i/26),`rgba(255,222,144,${i/45})`))}
        this.sling(sim,true);
        c.fillStyle='#102039e8';rr(c,360,636,600,25,5);c.fill();c.textAlign='center';c.font='900 12px system-ui';c.fillStyle='#ffe596';c.fillText(`★★★  ${sim.level.stars[0]} STONE${sim.level.stars[0]>1?'S':''} OR FEWER     ·     ★★  ${sim.level.stars[1]} OR FEWER     ·     ★  CLEAR THE LEVEL`,660,653);
      }
      for(const p of this.particles){c.save();c.globalAlpha=Math.min(1,p.life*3);c.translate(p.x,p.y);c.rotate(p.angle);c.fillStyle=p.color;c.fillRect(-p.size/2,-p.size/2,p.size,p.size);c.restore()}
      for(const r of this.rings){c.globalAlpha=Math.min(1,r.life*2);c.strokeStyle=r.color;c.lineWidth=3;c.beginPath();c.arc(r.x,r.y,(1-r.life)*65,0,TAU);c.stroke()}c.globalAlpha=1;
      for(const l of this.labels){c.save();c.globalAlpha=Math.min(1,l.life*2);c.font='1000 21px system-ui';c.textAlign='center';c.lineWidth=5;c.strokeStyle='#142039';c.strokeText(l.text,l.x,l.y);c.fillStyle=l.color;c.fillText(l.text,l.x,l.y);c.restore()}
      c.restore();
    }
    thumbnail(canvas,level){const c=canvas.getContext('2d');canvas.width=360;canvas.height=145;c.fillStyle='#101b30';c.fillRect(0,0,360,145);c.save();c.translate(-170,0);c.scale(.43,.22);c.fillStyle='#50667e';c.fillRect(400,620,1000,10);level.blocks.forEach(d=>this.block({position:{x:d.x,y:d.y},angle:0,game:{...d,kind:'block',hp:Infinity,maxHP:Infinity}},c));level.cameras.forEach(d=>this.camera({position:{x:d.x,y:d.y},angle:0,game:{disabled:false}},c));c.restore()}
  }
  global.BlindSpotRenderer={Renderer};
})(window);
