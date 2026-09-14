/* Articulated, code-native gameplay characters. Portrait illustrations remain in menus. */
(function(global){
 'use strict';
 const palettes={
  'street-stone':{name:'MARA',jacket:'#ed775d',shade:'#a94043',pants:'#293a59',skin:'#dda076',hair:'#382c34',accent:'#d9ef74',kind:'scarf'},
  'paint-can':{name:'INEZ',jacket:'#8864aa',shade:'#4e375f',pants:'#429498',skin:'#bd8057',hair:'#292631',accent:'#f05ea9',kind:'bun'},
  'emp-puck':{name:'DEX',jacket:'#397e83',shade:'#24505c',pants:'#35404b',skin:'#e3ad7b',hair:'#684534',accent:'#6debf0',kind:'goggles'},
  grapple:{name:'JUNE',jacket:'#dfa443',shade:'#96642e',pants:'#344765',skin:'#ca8c5f',hair:'#272833',accent:'#ffdb89',kind:'mechanic'}
 };
 const mix=(a,b,t)=>({x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t}),smooth=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t)};
 // Two-link inverse kinematics: contact points are derived from the actual pulled body.
 function elbow(a,b,bend=1){const dx=b.x-a.x,dy=b.y-a.y,d=Math.max(.001,Math.hypot(dx,dy)),length=Math.max(48,d*.515),h=Math.sqrt(Math.max(0,length*length-d*d/4));return{x:(a.x+b.x)/2-dy/d*h*bend,y:(a.y+b.y)/2+dx/d*h*bend}}
 function pose(sim,age,release,time,reduced,readyAge=1){
  const aiming=sim?.state==='aiming',tool=sim?.tool.id||'street-stone',a={x:220,y:490};
  const pulled=aiming?sim.projectile.position:age<.65?release:a;
  const tension=Math.min(1,Math.hypot(pulled.x-a.x,pulled.y-a.y)/118)*(aiming?1:Math.max(0,1-age/.45));
  const load=aiming?1:1-smooth(age/.5),horizontal=Math.max(0,a.x-pulled.x)/118*load,vertical=Math.max(0,pulled.y-a.y)/118*load;
  const reach=vertical*(1-horizontal)*24;
  const squat=(Math.max(0,pulled.y-525)*.20+Math.max(0,pulled.y-570)*.25*(1-horizontal))*load,recoil=age<.55?Math.sin(Math.min(1,age/.55)*Math.PI)*5:0;
  const hip={x:152-horizontal*13+reach*.4,y:551+squat},shoulder={x:163-horizontal*24+reach+recoil,y:489+squat+(reduced?0:Math.sin(time*2)*.7)};
  let hand=aiming?{...sim.projectile.position}:{...a};
  if(!aiming&&age<.85){const t=smooth(age/.22);hand=mix(release,{x:244,y:473},t);if(age>.22)hand=mix(hand,a,smooth((age-.22)/.63))}
  if(!aiming&&age>=.85&&readyAge<.35)hand=mix({x:175,y:548},a,smooth(readyAge/.35));
  if(sim?.state==='won'&&age>=.85)hand={x:184,y:529};
  const support=tool==='street-stone'?{x:196,y:507}:{x:203,y:515};
  return{tool,phase:aiming?'aim':age<.65?'release':'ready',hip,shoulder,head:{x:shoulder.x-10,y:shoulder.y-39},hand,support,palm:{x:hand.x-15,y:hand.y+6},feet:[{x:117,y:614},{x:183,y:614}],tension,recoil,squat};
 }
 function draw(c,p,time,reduced,front=false){
  const s=palettes[p.tool],ink='#172437';
  const line=(points,color,width)=>{c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.lineJoin='round';c.beginPath();points.forEach((v,i)=>i?c.lineTo(v.x,v.y):c.moveTo(v.x,v.y));c.stroke()};
  const poly=(points,color,stroke=ink)=>{c.fillStyle=color;c.strokeStyle=stroke;c.lineWidth=2.5;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();if(stroke)c.stroke()};
  const dot=(x,y,r,color)=>{c.fillStyle=color;c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fill()};
  function arm(start,end,bend,near){const joint=elbow(start,end,bend);line([start,joint,end],ink,19);line([start,joint],near?s.jacket:s.shade,14);line([joint,end],s.skin,10);line([start,mix(start,joint,.75)],near?s.jacket:s.shade,16);line([mix(start,joint,.75),joint],s.shade,13);dot(end.x,end.y,7,ink);dot(end.x+2,end.y-1,5,s.skin);line([{x:end.x+1,y:end.y+3},{x:end.x+8,y:end.y+1}],s.skin,4);}
  c.save();
  if(front){arm({x:p.shoulder.x-3,y:p.shoulder.y+7},p.palm,1,true);c.restore();return}
  // Contact shadows stay on the same plane as the physics ground.
  c.save();c.translate(158,620);c.scale(1,.12);dot(0,0,61,'#08152570');c.restore();
  for(let i=0;i<2;i++){const foot=p.feet[i],hip={x:p.hip.x+(i?11:-10),y:p.hip.y},knee={x:hip.x+(i?22:-16),y:583+p.squat*.4};line([hip,knee,{x:foot.x,y:foot.y-7}],ink,24);line([hip,knee,{x:foot.x,y:foot.y-7}],s.pants,18);line([{x:knee.x-4,y:knee.y-4},{x:knee.x+5,y:knee.y-1}],'#9ab2bc55',2);poly([[foot.x-12,601],[foot.x+7,603],[foot.x+9,608],[foot.x+21,610],[foot.x+22,618],[foot.x-13,618]],i?'#354353':'#293440');line([{x:foot.x-11,y:616},{x:foot.x+21,y:616}],'#c1bba9',3);for(let n=0;n<3;n++)line([{x:foot.x-3,y:606+n*2},{x:foot.x+6,y:607+n*2}],'#c2bba5',1);}
  arm({x:p.shoulder.x+6,y:p.shoulder.y+5},p.support,1,false);
  const x=p.shoulder.x,y=p.shoulder.y,h=p.hip;
  // Satchel/backpack, fitted jacket, seams and tool-specific workwear.
  poly([[x-30,y+8],[x-17,y+3],[h.x-13,h.y-1],[h.x-32,h.y-6]],'#273c4c');
  poly([[x-17,y-4],[x+16,y],[h.x+23,h.y-4],[h.x+13,h.y+9],[h.x-22,h.y+5],[x-24,y+15]],s.jacket);
  poly([[x-17,y+9],[x-5,y+21],[h.x-5,h.y+5],[h.x-21,h.y+4]],s.shade,null);
  line([{x:x+7,y:y+9},{x:h.x+6,y:h.y+3}],'#f6dfba80',2);
  line([{x:h.x-20,y:h.y+2},{x:h.x+21,y:h.y+3}],ink,6);dot(h.x+6,h.y+3,3,'#ded3a5');
  if(s.kind==='mechanic'){poly([[x-5,y+19],[x+17,y+19],[h.x+15,h.y-2],[h.x-9,h.y-3]],s.pants);line([{x:x-4,y:y+1},{x:x-2,y:y+20}],'#27354b',5);dot(x+1,y+23,2,'#d7c197');line([{x:h.x+18,y:h.y+9},{x:h.x+17,y:h.y+25}],'#bfc9ca',4);}
  if(s.kind==='goggles'){poly([[x-19,y-2],[x-27,y-12],[x-6,y-17],[x+15,y-7],[x+8,y+5]],s.shade);line([{x:x-7,y:y+5},{x:x-9,y:y+24}],'#e4cda2',1.5);}
  if(s.kind==='bun'){for(let i=0;i<7;i++)dot(h.x-11+(i*13%31),h.y-18+(i*11%24),2.5,['#f47cae','#8fe1be','#ffd373'][i%3]);}
  const head=p.head;
  line([{x:head.x+3,y:head.y+21},{x:x,y:y+3}],ink,15);line([{x:head.x+3,y:head.y+21},{x:x,y:y+3}],s.skin,10);
  c.save();c.translate(head.x,head.y);c.rotate(-p.tension*.12+p.recoil*.008);
  if(s.kind==='bun'||s.kind==='mechanic'){dot(-16,-26,12,s.hair);dot(-24,-20,8,s.hair);line([{x:-18,y:-19},{x:-8,y:-22}],'#80706c',2);}
  poly([[-16,-12],[-3,-20],[13,-13],[18,-2],[25,3],[19,7],[18,19],[7,25],[-6,21],[-14,10]],s.skin);
  poly([[-17,7],[-23,-6],[-16,-22],[3,-25],[18,-16],[15,-9],[3,-13],[-4,-2],[-11,2],[-10,12]],s.hair);
  line([{x:-18,y:-11},{x:-8,y:-20},{x:6,y:-20}],'#b997694d',2);
  dot(-7,8,5,s.skin);line([{x:-7,y:6},{x:-4,y:10}],'#88533f',1.5);
  const blink=!reduced&&Math.sin(time*.9)>.997;
  line([{x:10,y:-3},{x:17,y:-2}],ink,2);if(!blink){dot(14,2,2,ink);dot(14.7,1.4,.7,'#fff3d9')}else line([{x:11,y:2},{x:17,y:2}],ink,1.5);
  line([{x:14,y:15},{x:19,y:14}],'#8c4c40',1.5);
  if(s.kind==='goggles'){dot(12,1,10,ink);dot(12,1,7,'#4cb8c8');dot(10,-1,3,'#d7ffff');line([{x:-15,y:0},{x:4,y:1}],ink,4)}
  if(s.kind==='mechanic'){line([{x:-12,y:-18},{x:12,y:-15}],'#b8a380',5);dot(0,-17,6,ink);dot(0,-17,4,'#81a7b6')}
  if(s.kind==='bun'){c.strokeStyle='#ffd37d';c.lineWidth=2;c.beginPath();c.arc(-6,14,6,0,Math.PI*1.7);c.stroke()}
  c.restore();
  if(s.kind==='scarf'||s.kind==='bun'){const flutter=reduced?0:Math.sin(time*5)*4+p.recoil;poly([[x-5,y-5],[x-27,y-4],[x-48-flutter,y+14],[x-25,y+12],[x-12,y+9]],s.accent);line([{x:x-13,y:y-4},{x:x+10,y:y+2}],s.accent,10);}
  c.restore();
 }
 // Smooth the torso as one connected mass while keeping the aiming hand exact.
 function stabilize(p,previous,dt,trackHand=true){
  if(!previous||previous.tool!==p.tool)return p;
  const t=1-Math.exp(-Math.max(0,dt)*16),out={...p};
  for(const k of ['hip','shoulder'])out[k]=mix(previous[k],p[k],t);
  out.head={x:out.shoulder.x-10,y:out.shoulder.y-39};
  for(const k of ['squat','tension','recoil'])out[k]=previous[k]+(p[k]-previous[k])*t;
  if(!trackHand){out.hand=mix(previous.hand,p.hand,t);out.palm={x:out.hand.x-15,y:out.hand.y+6};}
  return out;
 }
 global.BlindSpotRebelRig={pose,draw,elbow,palettes,stabilize};
})(window);
