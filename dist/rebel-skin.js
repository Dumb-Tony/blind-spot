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
  function bone(frame,a,b,width,overlap=5){const dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy);c.save();c.translate(a.x,a.y);c.rotate(Math.atan2(dy,dx)-Math.PI/2);tile(frame,-width/2,-overlap,width,d+overlap*2);c.restore()}
  function arm(start,end,bend){const joint=global.BlindSpotRebelRig.elbow(start,end,bend);bone(cells[3],joint,end,18,5);bone(cells[2],start,joint,29,8)}
  c.save();c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';
  if(front){arm({x:p.shoulder.x-3,y:p.shoulder.y+7},p.palm,1);c.restore();return}
  c.save();c.translate(158,620);c.scale(1,.12);c.fillStyle='#08152570';c.beginPath();c.arc(0,0,61,0,Math.PI*2);c.fill();c.restore();
  for(let i=0;i<2;i++){
   const foot=p.feet[i],hip={x:p.hip.x+(i?11:-10),y:p.hip.y},knee={x:hip.x+(i?22:-16),y:583+p.squat*.4};
   const lower=cells[5],bootTop=1382,shin=[lower[0],lower[1],lower[2],bootTop-lower[1]+7],boot=[lower[0],bootTop,lower[2],lower[1]+lower[3]-bootTop];
   bone(shin,knee,{x:foot.x,y:604},26,5);const thigh=cells[4];bone([thigh[0],thigh[1]+35,thigh[2],thigh[3]-35],hip,knee,31,7);
   // Boots are drawn separately so rotating a shin cannot lift the sole off the roof.
   tile(boot,foot.x-14,598,39,22);
  }
  arm({x:p.shoulder.x+6,y:p.shoulder.y+5},p.support,-1);
  // Exclude the reference torso's hanging sleeves; animated arms replace them.
  c.save();c.translate(p.shoulder.x,p.shoulder.y);c.rotate(Math.atan2(p.hip.y-p.shoulder.y,p.hip.x-p.shoulder.x)-Math.PI/2);
  const tx=-52,ty=-19,tw=91,th=94;
  c.beginPath();c.moveTo(tx+tw*.35,ty);c.lineTo(tx+tw,ty);c.lineTo(tx+tw,ty+th);c.lineTo(tx+tw*.44,ty+th);c.lineTo(tx+tw*.44,ty+th*.43);c.lineTo(tx+tw*.32,ty+th*.30);c.lineTo(tx+tw*.35,ty+th*.30);c.closePath();c.clip();tile(cells[1],tx,ty,tw,th);c.restore();
  // Pivot the detailed portrait at the neck, retaining the rig's original head motion.
  const head=cells[0];c.save();c.translate(p.shoulder.x,p.shoulder.y-2);c.rotate(-p.tension*.12+p.recoil*.008);tile(head,-37,-64,67,68);c.restore();
  c.restore();
 }
 global.BlindSpotPaintedSkin={draw,frames,columns,prepare,matte};
})(window);
