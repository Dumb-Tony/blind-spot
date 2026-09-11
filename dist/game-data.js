(function(global){
  'use strict';
  const B=(x,y,w,h,material='wood',fixed=false)=>({x,y,w,h,material,fixed});
  const C=(x,y)=>({x,y});
  const tower=(x,height=130,width=140,mat='wood')=>[B(x-width/2+12,620-height/2,24,height,mat),B(x+width/2-12,620-height/2,24,height,mat),B(x,620-height-10,width+28,20)];
  const LEVELS=[
    {name:'First blind spot',district:'THE CORNER',lesson:'Meet the sling',hint:'Grab the glowing stone. Pull left and slightly down, then release.',tip:'A flatter arc reaches the low camera. The large ring marks your first impact.',shots:3,stars:[1,2],blocks:[B(830,604,170,32,'steel',true)],cameras:[C(830,568)]},
    {name:'Knee-jerk reaction',district:'MARKET STREET',lesson:'Break the supports',hint:'Orange wood breaks. Aim at a leg and let the camera fall.',tip:'Hit the left support just below the platform. A falling camera also goes offline.',shots:3,stars:[1,2],blocks:tower(860,140),cameras:[C(860,440)]},
    {name:'Glass houses',district:'THE ARCADE',lesson:'Shatter a shield',hint:'Cyan glass will not stop a good idea.',tip:'Aim through the cyan pane. The stone keeps some momentum after it shatters.',shots:3,stars:[1,2],blocks:[B(770,535,18,170,'glass'),B(860,610,160,20,'steel',true)],cameras:[C(860,580)]},
    {name:'Double take',district:'TWIN COURTS',lesson:'Two towers, one opportunity',hint:'Take down both cameras. Try carrying your shot through the first tower.',tip:'A low, powerful shot can break both sets of supports. Two clean hits also work.',shots:4,stars:[2,3],blocks:[...tower(750,110,110),...tower(1030,180,130)],cameras:[C(750,470),C(1030,400)]},
    {name:'Heavy paperwork',district:'RECORDS OFFICE',lesson:'Let the weight do the work',hint:'Blue-gray blocks do not break. They do fall. Loudly.',tip:'The weight sits on glass. Knock that support away and it drops onto the lower camera.',shots:3,stars:[1,2],blocks:[B(865,530,22,180,'glass'),B(995,530,22,180),B(930,430,180,20),B(930,398,96,44,'heavy')],cameras:[C(930,600),C(930,356)]},
    {name:'Overprotective',district:'CIVIC SQUARE',lesson:'Go over the wall',hint:'Dark steel stays put. Arc over it to reach the fragile roof.',tip:'Pull farther down for a high arc. You can see the guide stop if the wall blocks you.',shots:4,stars:[2,3],blocks:[B(720,530,36,180,'steel',true),B(860,550,24,140),B(1060,550,24,140),B(960,470,240,20,'glass')],cameras:[C(885,600),C(1035,600),C(960,440)]},
    {name:'Domino department',district:'PAPER TRAIL',lesson:'Make the whole row wobble',hint:'One hit. Several very bad construction decisions.',tip:'Aim at the first narrow tower. The heavy cap can carry the collapse to the next one.',shots:4,stars:[2,3],blocks:[...tower(760,180,100),B(760,408,92,24,'heavy'),...tower(930,140,100),B(930,448,92,24,'heavy'),...tower(1100,100,100)],cameras:[C(760,376),C(930,416),C(1100,480)]},
    {name:'The Ministry of Looking',district:'REGION FINALE',lesson:'Shut the relay down',hint:'Four cameras. Wood, glass, and a very top-heavy ego.',tip:'Remove the glass legs on the left, then clean up the far camera. Gravity handles the paperwork.',shots:5,stars:[2,4],finale:true,blocks:[...tower(880,150,220,'glass'),B(820,380,24,160),B(940,380,24,160),B(880,290,190,20),B(880,255,100,50,'heavy'),...tower(1130,95,110)],cameras:[C(805,600),C(960,430),C(880,210),C(1130,485)]}
  ];
  const MATERIALS={
    wood:{density:.002,friction:.65,restitution:.12,hp:42,threshold:2.5,color:'#e3a258',stroke:'#573830',name:'Wood · breaks'},
    glass:{density:.001,friction:.55,restitution:.05,hp:14,threshold:1.5,color:'#67e5ec',stroke:'#bffaff',name:'Glass · shatters'},
    heavy:{density:.006,friction:.65,restitution:.08,hp:Infinity,threshold:Infinity,color:'#7486a6',stroke:'#2a3550',name:'Concrete · falls'},
    steel:{density:.008,friction:.9,restitution:.04,hp:Infinity,threshold:Infinity,color:'#29364b',stroke:'#91a4b6',name:'Steel · fixed'}
  };
  const TOOLS={'street-stone':{name:'Street Stone',radius:19,density:.008,airFriction:.0015,maxPull:118,power:.23}};
  const WORLD={width:1280,height:720,ground:620,anchor:{x:220,y:490},step:1000/60,gravity:.001};
  const REBELS={mara:{name:'Mara',role:'Courier. Skater. Camera critic.',tool:'street-stone'}};
  const REGIONS=[{id:'starter-city',name:'Starter City',rebel:'mara',tool:'street-stone',levels:8}];
  const starsFor=(level,used)=>used<=level.stars[0]?3:used<=level.stars[1]?2:1;
  global.BlindSpotData={B,C,LEVELS,MATERIALS,TOOLS,REBELS,REGIONS,WORLD,starsFor};
})(typeof window!=='undefined'?window:globalThis);
