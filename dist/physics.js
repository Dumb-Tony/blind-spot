/* Shared production simulation. Tests instantiate this exact class. */
(function(global){
  'use strict';
  const {Engine,Composite,Bodies,Body,Events,Sleeping,Query}=global.Matter;
  const {WORLD,TOOLS,MATERIALS,starsFor}=global.BlindSpotData;
  const TOOL=TOOLS['street-stone'],DT=WORLD.step/2;
  const angle=a=>Math.atan2(Math.sin(a),Math.cos(a));
  function stone(x,y){return Bodies.circle(x,y,TOOL.radius,{density:TOOL.density,friction:.8,frictionAir:TOOL.airFriction,restitution:.23,sleepThreshold:35,label:'stone'});}
  class Simulation{
    constructor(level,onEvent=()=>{}){
      this.level=level;this.onEvent=onEvent;this.engine=Engine.create({enableSleeping:true,positionIterations:8,velocityIterations:8});
      this.engine.gravity.scale=WORLD.gravity;this.blocks=[];this.cameras=[];this.stones=[];this.pendingBreak=new Set();this.shotsUsed=0;this.time=0;this.shotTime=0;this.quiet=0;this.state='setup';this.lastHit=-100;this.combo=0;this.bestCombo=0;this.breaks=0;this.trail=[];this.lastTrail=[];this.armed=false;
      this.add(Bodies.rectangle(640,660,4000,80,{isStatic:true,friction:.85,label:'ground'}));
      level.blocks.forEach(d=>{
        const m=MATERIALS[d.material],b=Bodies.rectangle(d.x,d.y,d.w,d.h,{isStatic:!!d.fixed,density:m.density,friction:m.friction,restitution:m.restitution,chamfer:{radius:2},sleepThreshold:45});
        b.game={kind:'block',material:d.material,w:d.w,h:d.h,hp:m.hp,maxHP:m.hp};this.blocks.push(b);this.add(b);
      });
      level.cameras.forEach(d=>{const b=Bodies.rectangle(d.x,d.y,52,38,{density:.002,friction:.8,restitution:.1,chamfer:{radius:5},sleepThreshold:40});b.game={kind:'camera',disabled:false,fallTime:0};this.cameras.push(b);this.add(b)});
      for(let n=0;n<180;n++)Engine.update(this.engine,DT);
      this.cameras.forEach(b=>{b.game.mount={...b.position};b.game.mountAngle=b.angle});
      Events.on(this.engine,'collisionStart',e=>this.collisions(e));this.state='ready';this.load();
    }
    add(b){Composite.add(this.engine.world,b);return b}
    get remaining(){return this.cameras.filter(c=>!c.game.disabled).length}
    get shotsLeft(){return this.level.shots-this.shotsUsed}
    emit(type,body,extra={}){this.onEvent({type,x:body?.position.x,y:body?.position.y,...extra})}
    load(){this.projectile=stone(WORLD.anchor.x,WORLD.anchor.y);this.projectile.game={kind:'stone'};Body.setStatic(this.projectile,true);this.add(this.projectile);this.state='ready';this.emit('ready')}
    aim(x,y){
      if(this.state!=='ready'&&this.state!=='aiming')return false;
      let dx=Math.min(-3,x-WORLD.anchor.x),dy=Math.max(-35,Math.min(118,y-WORLD.anchor.y));
      const length=Math.hypot(dx,dy),scale=Math.min(1,TOOL.maxPull/length);dx*=scale;dy*=scale;
      this.state='aiming';Body.setPosition(this.projectile,{x:WORLD.anchor.x+dx,y:WORLD.anchor.y+dy});return true;
    }
    cancel(){if(this.state==='aiming'){Body.setPosition(this.projectile,WORLD.anchor);this.state='ready'}}
    launch(){
      if(this.state!=='aiming')return false;
      const v=this.launchVelocity();if(Math.hypot(v.x,v.y)<2.5){this.cancel();return false}
      Body.setStatic(this.projectile,false);Sleeping.set(this.projectile,false);Body.setVelocity(this.projectile,v);
      this.state='flying';this.armed=true;this.shotsUsed++;this.stones.push(this.projectile);this.shotTime=0;this.quiet=0;this.lastTrail=this.trail;this.trail=[];this.emit('launch');return true;
    }
    launchVelocity(){return{x:(WORLD.anchor.x-this.projectile.position.x)*TOOL.power,y:(WORLD.anchor.y-this.projectile.position.y)*TOOL.power}}
    predict(stopAtHit=true){
      if(!['aiming','ready'].includes(this.state))return{points:[],hit:null};
      const e=Engine.create();e.gravity.scale=WORLD.gravity;
      const p=stone(this.projectile.position.x,this.projectile.position.y);Composite.add(e.world,p);Body.setVelocity(p,this.launchVelocity());
      const targets=Composite.allBodies(this.engine.world).filter(b=>b!==this.projectile&&!b.game?.disabled);
      const points=[{...p.position}],samples=[];let hit=null;
      for(let n=0;n<260;n++){
        Engine.update(e,DT);samples.push({...p.position});if(n%4===3)points.push({...p.position});
        if(stopAtHit){const collisions=Query.collides(p,targets);if(collisions.length){hit={...p.position,kind:(collisions[0].bodyA===p?collisions[0].bodyB:collisions[0].bodyA).game?.kind||'ground'};break}}
        if(p.position.y>740||p.position.x>1380||p.position.y< -550)break;
      }
      Engine.clear(e);return{points,samples,hit};
    }
    openingGuide(){
      // Only the opening 0.4 seconds / 180 pixels. Never query future targets.
      const e=Engine.create();e.gravity.scale=WORLD.gravity;
      const p=stone(this.projectile.position.x,this.projectile.position.y);
      Composite.add(e.world,p);Body.setVelocity(p,this.launchVelocity());
      const points=[{...p.position}];let distance=0,previous={...p.position};
      for(let i=0;i<48;i++){
        Engine.update(e,DT);distance+=Math.hypot(p.position.x-previous.x,p.position.y-previous.y);previous={...p.position};
        if(distance>180)break;if(i%4===3)points.push({...p.position});
      }
      Engine.clear(e);return{points};
    }
    collisions(event){
      if(!this.armed)return;
      for(const pair of event.pairs){
        const a=pair.bodyA,b=pair.bodyB,n=pair.collision.normal;
        const pos=pair.collision.supports[0]||a.position;
        // Contact velocity includes rotation: a falling beam's tip carries an impact.
        const velocityAt=body=>({x:body.velocity.x-body.angularVelocity*(pos.y-body.position.y),y:body.velocity.y+body.angularVelocity*(pos.x-body.position.x)});
        const av=velocityAt(a),bv=velocityAt(b);
        const relative=Math.abs((av.x-bv.x)*n.x+(av.y-bv.y)*n.y);
        if(relative<1.3)continue;
        this.emit('impact',{position:pos},{strength:relative});
        for(const [target,other] of [[a,b],[b,a]]){
          const g=target.game;if(!g||g.disabled||g.broken)continue;
          const massFactor=other.isStatic?1:Math.max(.15,Math.min(2.4,other.mass/(target.mass+other.mass)*2));
          if(g.kind==='camera'&&relative*Math.sqrt(massFactor)>2.2){this.disable(target,other.game?.kind==='stone'?'DIRECT HIT':'CHAIN REACTION');continue}
          if(g.kind==='block'&&!target.isStatic){const m=MATERIALS[g.material];if(relative>m.threshold){g.hp-=(relative-m.threshold)*10*massFactor*(other.game?.kind==='stone'?1.2:1);this.emit('crack',target,{material:g.material});if(g.hp<=0)this.pendingBreak.add(target)}}
        }
      }
    }
    breakBody(b){
      if(b.game.broken)return;b.game.broken=true;this.breaks++;
      Composite.remove(this.engine.world,b);this.blocks=this.blocks.filter(v=>v!==b);this.emit('break',b,{material:b.game.material,w:b.game.w,h:b.game.h,angle:b.angle});
      // A sleeping stack must respond immediately when its supporting body changes.
      for(const nearby of Composite.allBodies(this.engine.world)){
        if(!nearby.isStatic&&nearby.bounds.max.x>b.bounds.min.x-8&&nearby.bounds.min.x<b.bounds.max.x+8&&nearby.bounds.max.y>b.bounds.min.y-8&&nearby.bounds.min.y<b.bounds.max.y+8)Sleeping.set(nearby,false);
      }
      const horizontal=b.game.w>b.game.h;
      for(let i=0;i<2;i++){
        const w=horizontal?b.game.w*.49:b.game.w,h=horizontal?b.game.h:b.game.h*.49;
        const offset=(i?1:-1)*(horizontal?b.game.w:b.game.h)*.25;
        const x=b.position.x+Math.cos(b.angle+(horizontal?0:Math.PI/2))*offset,y=b.position.y+Math.sin(b.angle+(horizontal?0:Math.PI/2))*offset;
        const chip=Bodies.rectangle(x,y,w,h,{angle:b.angle,friction:MATERIALS[b.game.material].friction,restitution:.08,sleepThreshold:45});
        Body.setMass(chip,b.mass/2);
        chip.game={kind:'debris',material:b.game.material,w,h};
        Body.setVelocity(chip,{x:b.velocity.x-b.angularVelocity*(y-b.position.y),y:b.velocity.y+b.angularVelocity*(x-b.position.x)});
        Body.setAngularVelocity(chip,b.angularVelocity);this.blocks.push(chip);this.add(chip);
      }
    }
    disable(b,reason){if(b.game.disabled)return;b.game.disabled=true;this.combo=this.time-this.lastHit<1.8?this.combo+1:1;this.lastHit=this.time;this.bestCombo=Math.max(this.bestCombo,this.combo);this.emit('camera',b,{reason,combo:this.combo})}
    step(){
      if(['won','lost','ready','aiming'].includes(this.state))return;
      for(let i=0;i<2;i++){
        Engine.update(this.engine,DT);for(const b of this.pendingBreak)this.breakBody(b);this.pendingBreak.clear();this.time+=DT/1000;this.shotTime+=DT/1000;
        for(const c of this.cameras){if(c.game.disabled)continue;const tilted=Math.abs(angle(c.angle-c.game.mountAngle))>.85,fallen=c.position.y-c.game.mount.y>48;c.game.fallTime=tilted||fallen?c.game.fallTime+DT/1000:0;if(c.game.fallTime>.3||c.position.y>780||c.position.x>1420||c.position.x< -120)this.disable(c,'MOUNT BROKEN')}
        for(const b of Composite.allBodies(this.engine.world))if(!b.isStatic&&(b.position.y>850||b.position.x>1480||b.position.x< -180))Composite.remove(this.engine.world,b);
      }
      if(this.projectile&&this.shotTime<5)this.trail.push({...this.projectile.position});if(this.trail.length>160)this.trail.shift();
      const bodies=Composite.allBodies(this.engine.world).filter(b=>!b.isStatic);
      const moving=bodies.some(b=>!b.isSleeping&&(b.speed>.38||Math.abs(b.angularVelocity)>.018));this.quiet=moving?0:this.quiet+1/60;
      if(this.remaining===0&&this.shotTime>.65&&(this.quiet>.45||this.time-this.lastHit>3.5)){this.state='won';this.emit('win',null,{stars:starsFor(this.level,this.shotsUsed)});return}
      if(this.shotTime>1.1&&(this.quiet>.85||this.shotTime>14))this.finishShot();
    }
    finishShot(){
      if(this.remaining===0){this.state='won';this.emit('win',null,{stars:starsFor(this.level,this.shotsUsed)});return}
      if(!this.shotsLeft){this.state='lost';this.emit('lose');return}this.load();
    }
    snapshot(){return{state:this.state,shotsUsed:this.shotsUsed,shotsLeft:this.shotsLeft,remaining:this.remaining,time:this.time,projectile:this.projectile?{x:this.projectile.position.x,y:this.projectile.position.y,mass:this.projectile.mass}:null}}
  }
  global.BlindSpotPhysics={Simulation,stone,DT};
})(typeof window!=='undefined'?window:globalThis);
