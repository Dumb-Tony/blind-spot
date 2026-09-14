/* Painted skin for the existing pose rig. All motion and contact points remain in rebel-rig.js. */
(function(global){
 'use strict';
 // The generator returned RGB despite an alpha request. Isolate the texture in memory;
 // the source artwork stays unchanged. Only edge-connected neutral matte is excluded.
 function matte(data,width,height){
  const seen=new Uint8Array(width*height),queue=new Int32Array(width*height);let read=0,write=0;
  function add(i){if(seen[i])return;seen[i]=1;const n=i*4,r=data[n],g=data[n+1],b=data[n+2];if(Math.min(r,g,b)>150&&Math.max(r,g,b)-Math.min(r,g,b)<13){data[n+3]=0;queue[write++]=i}}
  for(let x=0;x<width;x++){add(x);add((height-1)*width+x)}for(let y=0;y<height;y++){add(y*width);add(y*width+width-1)}
  while(read<write){const i=queue[read++],x=i%width,y=Math.floor(i/width);if(x)add(i-1);if(x<width-1)add(i+1);if(y)add(i-width);if(y<height-1)add(i+width)}return data;
 }
 function prepare(image,makeCanvas=()=>document.createElement('canvas')){const canvas=makeCanvas();canvas.width=image.naturalWidth||image.width;canvas.height=image.naturalHeight||image.height;const c=canvas.getContext('2d',{willReadFrequently:true});c.drawImage(image,0,0);const pixels=c.getImageData(0,0,canvas.width,canvas.height);matte(pixels.data,canvas.width,canvas.height);c.putImageData(pixels,0,0);return canvas}
 const columns={'street-stone':0,'paint-can':1,'emp-puck':2,grapple:3};
 // Measured source cells, not equal-row assumptions. Values use the 1024x1536 source grid.
 const frames=[
  [[12,8,232,204],[1,214,254,278],[74,496,116,230],[101,738,82,213],[59,967,181,285],[72,1252,183,260]],
  [[284,5,219,205],[259,215,261,278],[310,498,121,235],[350,739,95,214],[307,967,172,283],[329,1253,174,261]],
  [[548,8,198,204],[521,219,245,276],[583,500,116,231],[607,739,98,217],[550,968,177,280],[560,1251,190,262]],
  [[801,6,211,206],[770,212,250,283],[834,496,125,236],[864,738,94,217],[810,968,177,281],[808,1251,187,262]]
 ];
 function draw(c,p,image,front=false){
  const col=columns[p.tool],cells=frames[col],scale=(image.naturalWidth||image.width)/1024;
  function tile(frame,x,y,w,h){const [sx,sy,sw,sh]=frame;c.drawImage(image,sx*scale,sy*scale,sw*scale,sh*scale,x,y,w,h)}
  // Wrap each painted strip in a tapered capsule. Overlap and soft edge shade make
  // the source pieces read as one turning body instead of rectangles pinned together.
  function capsule(frame,a,b,width,overlap=8,near=false){const dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy),top=width*(near?1.02:.9),bottom=width*(near?.82:.72);
   c.save();c.translate(a.x,a.y);c.rotate(Math.atan2(dy,dx)-Math.PI/2);
   c.fillStyle='#09132130';c.beginPath();c.ellipse(3,d*.53,top*.58,d*.57,0,0,Math.PI*2);c.fill();
   c.beginPath();c.moveTo(-top/2,-overlap);c.quadraticCurveTo(0,-overlap-top*.28,top/2,-overlap);c.lineTo(bottom/2,d+overlap);c.quadraticCurveTo(0,d+overlap+bottom*.28,-bottom/2,d+overlap);c.closePath();c.clip();
   tile(frame,-top/2,-overlap,top,d+overlap*2);
   c.globalAlpha=.17;c.fillStyle='#fff7de';c.beginPath();c.ellipse(-top*.2,d*.45,top*.18,d*.52,0,0,Math.PI*2);c.fill();
   c.globalAlpha=.2;c.fillStyle='#10162a';c.beginPath();c.ellipse(bottom*.35,d*.55,bottom*.25,d*.55,0,0,Math.PI*2);c.fill();c.restore();
  }
  const palette=global.BlindSpotRebelRig.palettes[p.tool];
  function seam(a,b,width,color){c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.stroke()}
  function arm(start,end,bend,near=false){const elbow=global.BlindSpotRebelRig.elbow(start,end,bend);capsule(cells[2],start,elbow,34,15,near);capsule(cells[3],elbow,end,19,12,near)}
  c.save();c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';
  if(front){arm({x:p.shoulder.x-3,y:p.shoulder.y+7},p.palm,1,true);c.restore();return}
  c.save();c.translate(158,620);c.scale(1,.12);c.fillStyle='#08152570';c.beginPath();c.arc(0,0,61,0,Math.PI*2);c.fill();c.restore();
  for(let i=0;i<2;i++){
   const foot=p.feet[i],hip={x:p.hip.x+(i?11:-10),y:p.hip.y},knee={x:hip.x+(i?22:-16),y:583+p.squat*.4};
   const lower=cells[5],bootTop=1382,shin=[lower[0],lower[1],lower[2],bootTop-lower[1]+7],boot=[lower[0],bootTop,lower[2],lower[1]+lower[3]-bootTop];
   capsule([cells[4][0],cells[4][1]+35,cells[4][2],cells[4][3]-35],hip,knee,38,16,i===1);capsule(shin,knee,{x:foot.x,y:606},30,14,i===1);
   // Boots are drawn separately so rotating a shin cannot lift the sole off the roof.
   tile(boot,foot.x-14,598,39,22);
  }
  // The bracing elbow hangs below the shoulder, rather than bending above the head.
  arm({x:p.shoulder.x+6,y:p.shoulder.y+5},p.support,1,false);
  const waist=cells[4];tile([waist[0],waist[1],waist[2],58],p.hip.x-26,p.hip.y-6,54,17);
  // One continuous garment from shoulders to pelvis, with tucked-in limb roots.
  c.save();c.translate(p.shoulder.x,p.shoulder.y);c.rotate(Math.atan2(p.hip.y-p.shoulder.y,p.hip.x-p.shoulder.x)-Math.PI/2);
  const torso=cells[1],height=Math.hypot(p.hip.x-p.shoulder.x,p.hip.y-p.shoulder.y)+24;
  c.fillStyle='#09132145';c.beginPath();c.ellipse(4,height*.48,35,height*.58,0,0,Math.PI*2);c.fill();c.fillStyle=palette.shade;c.beginPath();c.moveTo(-18,-8);c.quadraticCurveTo(-31,7,-25,34);c.lineTo(-24,height-29);c.quadraticCurveTo(0,height-24,25,height-29);c.lineTo(25,14);c.quadraticCurveTo(22,-9,8,-10);c.closePath();c.fill();
  tile([torso[0]+torso[2]*.35,torso[1],torso[2]*.63,torso[3]],-27,-17,59,height);
  c.globalAlpha=.12;c.fillStyle='#fff';c.beginPath();c.ellipse(-13,height*.36,9,height*.42,0,0,Math.PI*2);c.fill();c.globalAlpha=.16;c.fillStyle='#10162a';c.beginPath();c.ellipse(23,height*.45,13,height*.48,0,0,Math.PI*2);c.fill();c.globalAlpha=1;
  c.restore();
  // Pivot the detailed portrait at the neck, retaining the rig's original head motion.
  capsule(cells[3],{x:p.shoulder.x-3,y:p.shoulder.y-20},{x:p.shoulder.x,y:p.shoulder.y+2},14,5,true);
  const head=cells[0];c.save();c.translate(p.shoulder.x,p.shoulder.y-2);c.rotate(-p.tension*.07+p.recoil*.006);c.fillStyle='#09132145';c.beginPath();c.ellipse(2,-28,35,36,0,0,Math.PI*2);c.fill();tile(head,-34,-62,63,65);c.globalAlpha=.1;c.fillStyle='#fff';c.beginPath();c.ellipse(-16,-36,8,20,-.2,0,Math.PI*2);c.fill();c.globalAlpha=1;c.restore();
  c.restore();
 }
 global.BlindSpotPaintedSkin={draw,frames,columns,prepare,matte};
})(window);
