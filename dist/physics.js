/* Shared production simulation. Tests instantiate this exact class. */
(function(global){
  'use strict';
  const {Engine,Composite,Bodies,Body,Events,Sleeping,Query,Constraint,Common}=global.Matter;
  const {WORLD,TOOLS,MATERIALS,starsFor}=global.BlindSpotData;
  const TOOL=TOOLS['street-stone'],DT=WORLD.step/2;
  const angle=a=>Math.atan2(Math.sin(a),Math.cos(a));
  function stone(x,y,tool=TOOL){return Bodies.circle(x,y,tool.radius,{density:tool.density,friction:.8,frictionAir:tool.airFriction,restitution:.23,sleepThreshold:35,label:'stone'});}
  class Simulation{
    constructor(level,onEvent=()=>{}){
      Common._seed=[...String(level.id||level.name)].reduce((n,ch)=>(n*31+ch.charCodeAt(0))%233280,17);
      this.level=level;this.inventory=level.arsenal?{...level.arsenal}:null;this.tool=TOOLS[level.tool||'street-stone'];this.cables=[];this.hooks=[];this.hinges=[];this.foams=[];this.onEvent=onEvent;this.engine=Engine.create({enableSleeping:true,positionIterations:8,velocityIterations:8});
      this.engine.gravity.scale=WORLD.gravity;this.blocks=[];this.cameras=[];this.stones=[];this.pendingBreak=new Set();this.shotsUsed=0;this.time=0;this.shotTime=0;this.quiet=0;this.state='setup';this.lastHit=-100;this.combo=0;this.bestCombo=0;this.breaks=0;this.trail=[];this.lastTrail=[];this.armed=false;
      this.add(Bodies.rectangle(640,660,4000,80,{isStatic:true,friction:.85,label:'ground'}));
      level.blocks.forEach(d=>{
        const m=MATERIALS[d.material],b=Bodies.rectangle(d.x,d.y,d.w,d.h,{isStatic:!!d.fixed,density:m.density,friction:m.friction,restitution:m.restitution,chamfer:{radius:2},sleepThreshold:45});
        b.game={kind:'block',material:d.material,w:d.w,h:d.h,hp:m.hp,maxHP:m.hp,hinge:!!d.hinge};this.blocks.push(b);this.add(b);
        if(d.pivotGroup)b.collisionFilter.group=-d.pivotGroup;
        if(d.hinge){const hinge=Constraint.create({pointA:{x:d.x,y:d.y},bodyB:b,pointB:{x:0,y:0},length:0,stiffness:1,damping:.18});this.hinges.push(hinge);Composite.add(this.engine.world,hinge)}
        if(d.suspended){for(const side of [-1,1]){const cable=Constraint.create({pointA:{x:d.x+side*d.w*.35,y:d.y-d.suspended},bodyB:b,pointB:{x:side*d.w*.35,y:0},length:d.suspended,stiffness:.85,damping:.08});this.cables.push(cable);Composite.add(this.engine.world,cable)}}
      });
      level.cameras.forEach(d=>{const b=Bodies.rectangle(d.x,d.y,52,38,{isStatic:!!d.bolted,density:.002,friction:.8,restitution:.1,chamfer:{radius:5},sleepThreshold:40});b.game={kind:'camera',disabled:false,fallTime:0,shield:!!d.shield,bolted:!!d.bolted,circuit:d.circuit||null};this.cameras.push(b);this.add(b)});
      for(let n=0;n<180;n++)Engine.update(this.engine,DT);
      this.cameras.forEach(b=>{b.game.mount={...b.position};b.game.mountAngle=b.angle});
      Events.on(this.engine,'collisionStart',e=>this.collisions(e));this.state='ready';this.load();
    }
    add(b){Composite.add(this.engine.world,b);return b}
    get remaining(){return this.cameras.filter(c=>!c.game.disabled).length}
    get shotsLeft(){return this.level.shots-this.shotsUsed}
    emit(type,body,extra={}){this.onEvent({type,x:body?.position.x,y:body?.position.y,...extra})}
    load(){this.projectile=stone(WORLD.anchor.x,WORLD.anchor.y,this.tool);this.projectile.game={kind:'stone',tool:this.tool.id||'street-stone',spent:false,color:this.tool.color};Body.setStatic(this.projectile,true);this.add(this.projectile);this.state='ready';this.emit('ready')}
    selectTool(id){
      if(!['ready','aiming'].includes(this.state)||!this.inventory||!(this.inventory[id]>0)||!TOOLS[id])return false;
      Composite.remove(this.engine.world,this.projectile);this.tool=TOOLS[id];this.load();return true;
    }
    aim(x,y){
      if(this.state!=='ready'&&this.state!=='aiming')return false;
      let dx=Math.min(-3,x-WORLD.anchor.x),dy=Math.max(-35,Math.min(118,y-WORLD.anchor.y));
      const length=Math.hypot(dx,dy),scale=Math.min(1,this.tool.maxPull/length);dx*=scale;dy*=scale;
      this.state='aiming';Body.setPosition(this.projectile,{x:WORLD.anchor.x+dx,y:WORLD.anchor.y+dy});return true;
    }
    cancel(){if(this.state==='aiming'){Body.setPosition(this.projectile,WORLD.anchor);this.state='ready'}}
    launch(){
      if(this.state!=='aiming')return false;
      const v=this.launchVelocity();if(Math.hypot(v.x,v.y)<2.5){this.cancel();return false}
      this.wakeWorld();Body.setStatic(this.projectile,false);Sleeping.set(this.projectile,false);Body.setVelocity(this.projectile,v);
      if(this.inventory)this.inventory[this.tool.id]--;
      this.state='flying';this.armed=true;this.shotsUsed++;this.stones.push(this.projectile);this.shotTime=0;this.quiet=0;this.lastTrail=this.trail;this.trail=[];this.emit('launch',this.projectile);return true;
    }
    wakeWorld(){
      // Sleeping is useful only during initial seating. Once play starts, all dynamic
      // bodies integrate gravity, including an entire stack whose support moves away.
      this.engine.enableSleeping=false;
      for(const b of Composite.allBodies(this.engine.world))if(!b.isStatic&&b.isSleeping)Sleeping.set(b,false);
    }
    launchVelocity(){return{x:(WORLD.anchor.x-this.projectile.position.x)*this.tool.power,y:(WORLD.anchor.y-this.projectile.position.y)*this.tool.power}}
    predict(stopAtHit=true){
      if(!['aiming','ready'].includes(this.state))return{points:[],hit:null};
      const e=Engine.create();e.gravity.scale=WORLD.gravity;
      const p=stone(this.projectile.position.x,this.projectile.position.y,this.tool);Composite.add(e.world,p);Body.setVelocity(p,this.launchVelocity());
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
      // Only the opening 0.8 seconds / 340 pixels. Never query future targets.
      const e=Engine.create();e.gravity.scale=WORLD.gravity;
      const p=stone(this.projectile.position.x,this.projectile.position.y,this.tool);
      Composite.add(e.world,p);Body.setVelocity(p,this.launchVelocity());
      const points=[{...p.position}];let distance=0,previous={...p.position};
      for(let i=0;i<96;i++){
        Engine.update(e,DT);distance+=Math.hypot(p.position.x-previous.x,p.position.y-previous.y);previous={...p.position};
        if(distance>340)break;if(i%4===3)points.push({...p.position});
      }
      Engine.clear(e);return{points};
    }
    collisions(event){
      if(!this.armed)return;
      for(const pair of event.pairs){
        for(const [projectile,target] of [[pair.bodyA,pair.bodyB],[pair.bodyB,pair.bodyA]])if(projectile.game?.kind==='stone'&&!projectile.isStatic&&!projectile.game.spent)this.activateTool(projectile,target,pair.collision.supports[0]||projectile.position);
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
          if(g.kind==='camera'&&!g.shield&&relative*Math.sqrt(massFactor)>2.2){this.disable(target,other.game?.kind==='stone'?'DIRECT HIT':'CHAIN REACTION');continue}
          if((g.kind==='block'||g.kind==='debris')&&!target.isStatic&&Number.isFinite(g.hp)){const m=MATERIALS[g.material];if(relative>m.threshold){g.hp-=(relative-m.threshold)*10*massFactor*(other.game?.kind==='stone'?1.2:1);this.emit('crack',target,{material:g.material});if(g.hp<=0)this.pendingBreak.add(target)}}
        }
      }
    }
    activateTool(projectile,target,point){
      const id=projectile.game.tool;if(id==='street-stone')return;projectile.game.spent=true;
      if(id==='paint-can'||id==='emp-puck'){
        const radius=id==='paint-can'?145:TOOLS['emp-puck'].pulseRadius;
        if(id==='emp-puck')for(const b of this.blocks)if(b.game.material==='cell'&&Math.hypot(b.position.x-point.x,b.position.y-point.y)<radius)this.chargeCell(b);
        if(id==='paint-can')this.splatter(point,radius);
        const near=this.cameras.filter(c=>!c.game.disabled&&Math.hypot(c.position.x-point.x,c.position.y-point.y)<radius);
        const linked=new Set();
        // One hop only: no map-wide shutdown, and no recursive daisy chain.
        if(id==='emp-puck')for(const source of near){const neighbor=this.cameras.filter(c=>!c.game.disabled&&!near.includes(c)&&c.game.circuit&&c.game.circuit===source.game.circuit&&Math.hypot(c.position.x-source.position.x,c.position.y-source.position.y)<=TOOLS[id].linkRange).sort((a,b)=>Math.hypot(a.position.x-source.position.x,a.position.y-source.position.y)-Math.hypot(b.position.x-source.position.x,b.position.y-source.position.y))[0];if(neighbor)linked.add(neighbor)}

        const affected=[];
        for(const c of this.cameras)if(near.includes(c)||linked.has(c)){c.game.disabledBy=id;affected.push(c);this.disable(c,id==='paint-can'?'LENS PAINTED':'NETWORK OFFLINE')}
        this.emit('ability',{position:point},{tool:id,radius,color:this.tool.color,affected});
      }
      if(id==='grapple'){
        // Cable Cutter: release one nearby support rather than attaching a
        // temporary pulling rope. Keeping the old id preserves saved routes.
        const attached=[...this.cables,...this.hinges].filter(c=>c.bodyA===target||c.bodyB===target);
        let cut=attached.sort((a,b)=>{
          const pa=a.bodyB?Constraint.pointBWorld(a):a.pointA,pb=b.bodyB?Constraint.pointBWorld(b):b.pointA;
          return Math.hypot(pa.x-point.x,pa.y-point.y)-Math.hypot(pb.x-point.x,pb.y-point.y);
        })[0];
        if(cut){Composite.remove(this.engine.world,cut);this.cables=this.cables.filter(c=>c!==cut);this.hinges=this.hinges.filter(c=>c!==cut);if(target&&!target.isStatic)Sleeping.set(target,false)}
        const g=target.game;
        if(g&&(g.kind==='block'||g.kind==='debris')&&!target.isStatic){
          if(g.material==='glass')this.pendingBreak.add(target);
          else if(g.material==='wood'){g.hp-=58;if(g.hp<=0)this.pendingBreak.add(target)}
          else if(g.material==='heavy'){g.hp-=24;if(g.hp<=0)this.pendingBreak.add(target)}
        }
        if(target.isStatic)Body.setVelocity(projectile,{x:-projectile.velocity.x*.72,y:projectile.velocity.y-1.2});
        else Body.setVelocity(projectile,{x:projectile.velocity.x*.88,y:projectile.velocity.y*.88});
        const affected=[];for(const c of this.cameras)if(!c.game.disabled&&!c.game.bolted&&Math.hypot(c.position.x-point.x,c.position.y-point.y)<92){this.disable(c,'MOUNT CUT');affected.push(c)}
        this.emit('ability',{position:point},{tool:id,radius:92,color:this.tool.color,cut:!!cut,affected});
      }
      if(id==='breach-charge'){
        const radius=TOOLS[id].blastRadius,affected=[];
        for(const b of [...this.blocks,...this.cameras]){const dx=b.position.x-point.x,dy=b.position.y-point.y,d=Math.max(18,Math.hypot(dx,dy));if(d>radius)continue;
          if(b.game.kind==='camera'){if(!b.game.disabled){affected.push(b);this.disable(b,'FOCUSED BLAST')}}
          else if(!b.isStatic&&Number.isFinite(b.game.hp)){b.game.hp-=Math.max(28,(radius-d)*1.15);if(b.game.hp<=0)this.pendingBreak.add(b);Body.applyForce(b,b.position,{x:dx/d*.028,y:dy/d*.028-.012})}
        }
        this.emit('ability',{position:point},{tool:id,radius,color:this.tool.color,affected});
      }
      if(id==='foam-pod'){
        const radius=TOOLS[id].foamRadius,foam=Bodies.polygon(point.x,point.y+18,8,52,{density:.0012,friction:.95,restitution:.02,chamfer:{radius:12},sleepThreshold:55});
        foam.game={kind:'foam',tool:id,w:104,h:104};this.foams.push(foam);this.add(foam);Body.setVelocity(foam,{x:0,y:-2.4});
        for(const b of [...this.blocks,...this.cameras])if(!b.isStatic){const dx=b.position.x-point.x,dy=b.position.y-point.y,d=Math.max(25,Math.hypot(dx,dy));if(d<radius)Body.applyForce(b,b.position,{x:dx/d*.008,y:-.026*(1-d/radius)})}
        this.emit('ability',{position:point},{tool:id,radius,color:this.tool.color,affected:[]});
      }
      if(id==='magnet-puck'){
        const radius=TOOLS[id].magnetRadius,affected=[];
        for(const b of [...this.blocks,...this.cameras]){if(b.isStatic)continue;const dx=point.x-b.position.x,dy=point.y-b.position.y,d=Math.max(28,Math.hypot(dx,dy));if(d>=radius)continue;
          const force=(1-d/radius)*.032,metal=b.game.kind==='camera'||b.game.material==='heavy'?1.35:1;
          Body.applyForce(b,b.position,{x:dx/d*force*metal,y:dy/d*force*metal});Sleeping.set(b,false);affected.push(b);
        }
        this.emit('ability',{position:point},{tool:id,radius,color:this.tool.color,affected});
      }
      if(id==='airburst'){
        const radius=TOOLS[id].burstRadius,affected=[];
        for(const b of [...this.blocks,...this.cameras]){if(b.isStatic)continue;const dx=b.position.x-point.x,dy=b.position.y-point.y,d=Math.max(24,Math.hypot(dx,dy));if(d>=radius)continue;
          const force=(1-d/radius)*.038;Body.applyForce(b,b.position,{x:dx/d*force,y:dy/d*force-.006});Sleeping.set(b,false);affected.push(b);
        }
        this.emit('ability',{position:point},{tool:id,radius,color:this.tool.color,affected});
      }
    }
    splatter(point,radius){
      // Surface-local marks stay attached when a painted object moves or rotates.
      const destinations=[];
      for(const b of [...this.blocks,...this.cameras]){
        const g=b.game,w=g.w||52,h=g.h||38,cos=Math.cos(b.angle),sin=Math.sin(b.angle);
        const dx=point.x-b.position.x,dy=point.y-b.position.y;
        const x=Math.max(-w/2,Math.min(w/2,dx*cos+dy*sin)),y=Math.max(-h/2,Math.min(h/2,-dx*sin+dy*cos));
        const wx=b.position.x+x*cos-y*sin,wy=b.position.y+x*sin+y*cos;
        if(Math.hypot(wx-point.x,wy-point.y)>radius)continue;
        g.paint=g.paint||[];
        const lens=g.kind==='camera'&&Math.hypot(dx,dy)<radius;
        for(let i=0;i<5;i++){
          const a=i*2.399+this.shotsUsed,r=i===0?0:8+i*4;
          g.paint.push({x:lens?-6+Math.cos(a)*r*.4:x+Math.cos(a)*r,y:lens?Math.sin(a)*r*.35:y+Math.sin(a)*r,r:lens?19:12+i*2,seed:i+this.shotsUsed*7});
        }
        g.paint=g.paint.slice(-30);destinations.push({x:wx,y:wy});
      }
      this.paintGround=this.paintGround||[];
      if(point.y+radius>=WORLD.ground){this.paintGround.push({x:point.x,y:WORLD.ground,r:55,seed:this.shotsUsed});this.paintGround=this.paintGround.slice(-16);destinations.push({x:point.x,y:WORLD.ground})}
      this.emit('paint',{position:point},{destinations,radius});
    }
    chargeCell(b){if(!b.game.broken&&b.game.fuse===undefined){b.game.fuse=this.time+.18;this.emit('charge',b)}}
    detonate(b){
      if(b.game.broken)return;b.game.broken=true;this.breaks++;const center={...b.position};
      Composite.remove(this.engine.world,b);this.blocks=this.blocks.filter(v=>v!==b);this.emit('blast',b,{radius:175});
      // Finite local impulse: distant towers and fixed armor still need their own shot.
      for(const target of Composite.allBodies(this.engine.world)){
        if(target.isStatic)continue;const dx=target.position.x-center.x,dy=target.position.y-center.y,d=Math.hypot(dx,dy);if(d>=175)continue;
        const falloff=1-d/175,impulse=8*falloff,normal=d>1?{x:dx/d,y:dy/d}:{x:0,y:-1};
        Body.setVelocity(target,{x:target.velocity.x+normal.x*impulse,y:target.velocity.y+normal.y*impulse-2*falloff});Sleeping.set(target,false);
        const g=target.game;if(g?.kind==='camera'&&!g.shield&&d<105)this.disable(target,'POWER SURGE');
        if(g?.kind==='block'&&!g.broken){if(g.material==='cell')this.chargeCell(target);else if(Number.isFinite(g.hp)){g.hp-=65*falloff;if(g.hp<=0)this.pendingBreak.add(target)}}
      }
    }
    breakBody(b){
      if(b.isStatic)return;
      if(b.game.material==='cell'&&b.game.kind==='block'){this.chargeCell(b);return}
      if(b.game.broken)return;b.game.broken=true;this.breaks++;
      Composite.remove(this.engine.world,b);this.blocks=this.blocks.filter(v=>v!==b);this.emit('break',b,{material:b.game.material,w:b.game.w,h:b.game.h,angle:b.angle});
      // A sleeping stack must respond immediately when its supporting body changes.
      for(const nearby of Composite.allBodies(this.engine.world)){
        if(!nearby.isStatic&&nearby.bounds.max.x>b.bounds.min.x-8&&nearby.bounds.min.x<b.bounds.max.x+8&&nearby.bounds.max.y>b.bounds.min.y-8&&nearby.bounds.min.y<b.bounds.max.y+8)Sleeping.set(nearby,false);
      }
      // Convex pieces tile the original footprint. No radial explosion: fragments
      // inherit the parent's linear and rotational velocity and conserve its mass.
      const g=b.game,w=g.w,h=g.h,material=g.material,depth=(g.depth||0)+1;
      const horizontal=w>=h,L=horizontal?w:h,T=horizontal?h:w;
      const local=(x,y)=>horizontal?{x,y}:{x:y,y:x};
      const pieces=[];
      if(material==='glass'){
        const columns=Math.max(2,Math.min(5,Math.ceil(L/45))),rows=T>55?2:1;
        for(let row=0;row<rows;row++)for(let col=0;col<columns;col++){
          const x=-L/2+L*col/columns,y=-T/2+T*row/rows,dx=L/columns,dy=T/rows;
          const a=local(x,y),b=local(x+dx,y),c=local(x+dx,y+dy),d=local(x,y+dy);
          if((col+row)%2)pieces.push([a,b,d],[b,c,d]);else pieces.push([a,b,c],[a,c,d]);
        }
      }else{
        // Offset fracture junctions make wood tear into long splinters and stone
        // crumble into chunky, irregular wedges rather than two clean halves.
        const cx=L*(material==='wood'?.09:-.07),cy=T*.08;
        const center=local(cx,cy),a=local(-L/2,-T/2),b=local(L/2,-T/2),c=local(L/2,T/2),d=local(-L/2,T/2);
        if(material==='wood')pieces.push([a,local(L*.17,-T/2),center,d],[local(L*.17,-T/2),b,center],[b,c,center],[c,d,center]);
        else pieces.push([a,local(0,-T/2),center,d],[local(0,-T/2),b,center],[b,local(L/2,T*.17),center],[local(L/2,T*.17),c,center],[c,d,center]);
      }
      const area=points=>Math.abs(points.reduce((sum,v,i)=>{const next=points[(i+1)%points.length];return sum+v.x*next.y-next.x*v.y},0))/2;
      // Refracturing a polygon must not create matter outside its existing outline.
      const clip=(subject,outline)=>{
        let result=subject;const signed=outline.reduce((s,v,i)=>{const n=outline[(i+1)%outline.length];return s+v.x*n.y-n.x*v.y},0),sign=Math.sign(signed)||1;
        for(let i=0;i<outline.length&&result.length;i++){
          const a=outline[i],b=outline[(i+1)%outline.length],input=result;result=[];
          const side=p=>sign*((b.x-a.x)*(p.y-a.y)-(b.y-a.y)*(p.x-a.x));
          for(let j=0;j<input.length;j++){const p=input[j],q=input[(j+1)%input.length],sp=side(p),sq=side(q);
            if(sp>=-1e-7)result.push(p);if((sp>0&&sq<0)||(sp<0&&sq>0)){const t=sp/(sp-sq);result.push({x:p.x+(q.x-p.x)*t,y:p.y+(q.y-p.y)*t});}
          }
        }return result;
      };
      const polygons=pieces.map(points=>global.Matter.Vertices.hull(g.outline?clip(points,g.outline):points)).filter(points=>points.length>=3&&area(points)>2);
      const total=polygons.reduce((sum,points)=>sum+area(points),0);
      for(const points of polygons){
        const centroid=global.Matter.Vertices.centre(points),cos=Math.cos(b.angle),sin=Math.sin(b.angle);
        const x=b.position.x+centroid.x*cos-centroid.y*sin,y=b.position.y+centroid.x*sin+centroid.y*cos;
        const chip=Bodies.rectangle(x,y,10,10,{friction:MATERIALS[material].friction,restitution:material==='glass'?.12:.05,sleepThreshold:45});
        Body.setVertices(chip,points);
        Body.setAngle(chip,b.angle);Body.setMass(chip,b.mass*area(points)/total);
        const outline=points.map(v=>({x:v.x-centroid.x,y:v.y-centroid.y}));
        const cw=2*Math.max(...outline.map(v=>Math.abs(v.x))),ch=2*Math.max(...outline.map(v=>Math.abs(v.y)));
        const canCrumble=material!=='glass'&&depth<2&&area(points)>450&&this.blocks.length<180;
        chip.game={kind:'debris',material,w:cw,h:ch,outline,depth,hp:canCrumble?(material==='heavy'?90:28):Infinity,maxHP:canCrumble?(material==='heavy'?90:28):Infinity};
        if(g.paint)chip.game.paint=g.paint.map(p=>({...p,x:p.x-centroid.x,y:p.y-centroid.y}));
        Body.setVelocity(chip,{x:b.velocity.x-b.angularVelocity*(y-b.position.y),y:b.velocity.y+b.angularVelocity*(x-b.position.x)});
        Body.setAngularVelocity(chip,b.angularVelocity);this.blocks.push(chip);this.add(chip);
      }
      // Constraints attached to a destroyed beam must not retain ghost supports.
      for(const list of [this.cables,this.hinges])for(let i=list.length-1;i>=0;i--)if(list[i].bodyA===b||list[i].bodyB===b){Composite.remove(this.engine.world,list[i]);list.splice(i,1);}
      for(let i=this.hooks.length-1;i>=0;i--)if(this.hooks[i].constraint.bodyB===b){Composite.remove(this.engine.world,this.hooks[i].constraint);this.hooks.splice(i,1);}
    }

    disable(b,reason){if(b.game.disabled)return;b.game.disabled=true;this.combo=this.time-this.lastHit<1.8?this.combo+1:1;this.lastHit=this.time;this.bestCombo=Math.max(this.bestCombo,this.combo);this.emit('camera',b,{reason,combo:this.combo})}
    step(){
      if(!this.armed)return;
      if(this.engine.enableSleeping)this.wakeWorld();
      const inFlight=this.state==='flying',terminal=this.state==='won'||this.state==='lost';
      for(let i=0;i<2;i++){
        Engine.update(this.engine,DT);
        for(const cable of [...this.cables]){const end=Constraint.pointBWorld(cable);const strain=Math.hypot(end.x-cable.pointA.x,end.y-cable.pointA.y)-cable.length;cable.overload=strain>.55?(cable.overload||0)+DT/1000:0;if(!this.blocks.includes(cable.bodyB)||cable.overload>.12){Composite.remove(this.engine.world,cable);this.cables=this.cables.filter(c=>c!==cable);Sleeping.set(cable.bodyB,false)}}
        for(const hook of [...this.hooks])if(this.time>hook.until){Composite.remove(this.engine.world,hook.constraint);this.hooks=this.hooks.filter(h=>h!==hook)}
        for(const b of [...this.blocks])if(b.game.fuse!==undefined&&this.time>=b.game.fuse)this.detonate(b);
        for(const b of this.pendingBreak)this.breakBody(b);this.pendingBreak.clear();this.time+=DT/1000;if(inFlight)this.shotTime+=DT/1000;
        for(const c of this.cameras){if(c.game.disabled)continue;const tilted=Math.abs(angle(c.angle-c.game.mountAngle))>.85,fallen=c.position.y-c.game.mount.y>48;c.game.fallTime=tilted||fallen?c.game.fallTime+DT/1000:0;if(c.game.fallTime>.3||c.position.y>780||c.position.x>1420||c.position.x< -120)this.disable(c,'MOUNT BROKEN')}
        for(const b of Composite.allBodies(this.engine.world))if(!b.isStatic&&(b.position.y>850||b.position.x>1480||b.position.x< -180)){
          Composite.remove(this.engine.world,b);this.blocks=this.blocks.filter(v=>v!==b);this.stones=this.stones.filter(v=>v!==b);
          // Keep disabled camera records for scoring, but never draw a removed body.
          if(b.game?.kind==='camera')b.game.removed=true;
        }
      }
      if(inFlight&&this.projectile&&this.shotTime<5)this.trail.push({...this.projectile.position});if(this.trail.length>160)this.trail.shift();
      const bodies=Composite.allBodies(this.engine.world).filter(b=>!b.isStatic);
      const moving=bodies.some(b=>!b.isSleeping&&(b.speed>.38||Math.abs(b.angularVelocity)>.018));this.quiet=moving?0:this.quiet+1/60;
      if(terminal)return;
      if(this.remaining===0){if(this.shotTime>.65&&this.time-this.lastHit>1.5&&(this.quiet>.45||this.time-this.lastHit>3.5)){this.state='won';this.emit('win',null,{stars:starsFor(this.level,this.shotsUsed)})}return}
      if(inFlight&&this.shotTime>1.1&&(this.quiet>.85||(this.shotTime>14&&this.shotsLeft>0)))this.finishShot();
    }
    finishShot(){
      if(this.remaining===0){this.state='won';this.emit('win',null,{stars:starsFor(this.level,this.shotsUsed)});return}
      if(!this.shotsLeft||(this.inventory&&!Object.values(this.inventory).some(n=>n>0))){this.state='lost';this.emit('lose');return}if(this.inventory&&!this.inventory[this.tool.id])this.tool=TOOLS[Object.keys(this.inventory).find(id=>this.inventory[id]>0)];this.load();
    }
    snapshot(){const dynamic=Composite.allBodies(this.engine.world).filter(b=>!b.isStatic);return{physics:{dynamicBodies:dynamic.length,sleepingBodies:dynamic.filter(b=>b.isSleeping).length,movingBodies:dynamic.filter(b=>b.speed>.38||Math.abs(b.angularVelocity)>.018).length},tool:this.tool.id,inventory:this.inventory?{...this.inventory}:null,state:this.state,shotsUsed:this.shotsUsed,shotsLeft:this.shotsLeft,remaining:this.remaining,time:this.time,projectile:this.projectile?{x:this.projectile.position.x,y:this.projectile.position.y,mass:this.projectile.mass}:null}}
  }
  global.BlindSpotPhysics={Simulation,stone,DT};
})(typeof window!=='undefined'?window:globalThis);
