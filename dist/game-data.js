(function(global){
  'use strict';
  const B=(x,y,w,h,material='wood',fixed=false)=>({x,y,w,h,material,fixed});
  const C=(x,y)=>({x,y});
  const tower=(x,height=130,width=140,mat='wood')=>[B(x-width/2+12,620-height/2,24,height,mat),B(x+width/2-12,620-height/2,24,height,mat),B(x,620-height-10,width+28,20)];
  const LEVELS=[
    {name:'First blind spot',district:'THE CORNER',lesson:'Meet the sling',hint:'Grab the glowing stone. Pull left and slightly down, then release.',tip:'A flatter arc reaches the low camera. The fading dots show only the start; judge the rest of the throw.',shots:3,stars:[1,2],blocks:[B(830,604,170,32,'steel',true)],cameras:[C(830,568)]},
    {name:'Knee-jerk reaction',district:'MARKET STREET',lesson:'Break the supports',hint:'Orange wood breaks. Aim at a leg and let the camera fall.',tip:'Hit the left support just below the platform. A falling camera also goes offline.',shots:3,stars:[1,2],blocks:tower(860,140),cameras:[C(860,440)]},
    {name:'Glass houses',district:'THE ARCADE',lesson:'Shatter a shield',hint:'Cyan glass will not stop a good idea.',tip:'Aim through the cyan pane. The stone keeps some momentum after it shatters.',shots:3,stars:[1,2],blocks:[B(770,535,18,170,'glass'),B(860,610,160,20,'steel',true)],cameras:[C(860,580)]},
    {name:'Double take',district:'TWIN COURTS',lesson:'Two towers, one opportunity',hint:'Take down both cameras. Try carrying your shot through the first tower.',tip:'A low, powerful shot can break both sets of supports. Two clean hits also work.',shots:4,stars:[2,3],blocks:[...tower(750,110,110),...tower(1030,180,130)],cameras:[C(750,470),C(1030,400)]},
    {name:'Heavy paperwork',district:'RECORDS OFFICE',lesson:'Let the weight do the work',hint:'Blue-gray blocks do not break. They do fall. Loudly.',tip:'The weight sits on glass. Knock that support away and it drops onto the lower camera.',shots:3,stars:[1,2],blocks:[B(865,530,22,180,'glass'),B(995,530,22,180),B(930,430,180,20),B(930,398,96,44,'heavy')],cameras:[C(930,600),C(930,356)]},
    {name:'Overprotective',district:'CIVIC SQUARE',lesson:'Go over the wall',hint:'Dark steel stays put. Arc over it to reach the fragile roof.',tip:'Pull farther down for a high arc. Judge the height carefully: the opening guide does not reveal contact.',shots:4,stars:[2,3],blocks:[B(720,530,36,180,'steel',true),B(860,550,24,140),B(1060,550,24,140),B(960,470,240,20,'glass')],cameras:[C(885,600),C(1035,600),C(960,440)]},
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

  Object.assign(TOOLS,{
    'paint-can':{...TOOLS['street-stone'],id:'paint-can',name:'Paint Can',color:'#f577d0',density:.006},
    'emp-puck':{...TOOLS['street-stone'],id:'emp-puck',name:'EMP Puck',color:'#65eaf2',density:.007},
    grapple:{...TOOLS['street-stone'],id:'grapple',name:'Pull Hook',color:'#ffd275',density:.01}
  });
  Object.assign(REBELS,{
    inez:{name:'Inez',role:'Muralist. Makes privacy visible.',tool:'paint-can',portrait:0},
    dex:{name:'Dex',role:'Tinkerer. Unplugs the city.',tool:'emp-puck',portrait:1},
    june:{name:'June',role:'Mechanic. Pulls the system apart.',tool:'grapple',portrait:2}
  });
  REGIONS[0].color='#d9ff63';REGIONS[0].start=0;
  REGIONS.push(
    {id:'color-quarter',name:'Color Quarter',rebel:'inez',tool:'paint-can',start:8,levels:8,color:'#f577d0',description:'Paint bursts coat armored lenses. Get close; splash finishes the job.'},
    {id:'signal-heights',name:'Signal Heights',rebel:'dex',tool:'emp-puck',start:16,levels:8,color:'#65eaf2',description:'EMP pulses jump through matching circuits. Find the reachable node.'},
    {id:'iron-docks',name:'Iron Docks',rebel:'june',tool:'grapple',start:24,levels:8,color:'#ffd275',description:'Hooks latch on impact and pull left. Swing beams and tear suspension cables.'}
  );
  LEVELS.forEach(l=>{l.region=0;l.tool='street-stone'});
  const shelf=(x,y,w=140,material='steel')=>B(x,y,w,20,material,material==='steel');
  const shield=(x,y)=>({...C(x,y),shield:true});
  const node=(x,y,circuit)=>({...C(x,y),circuit});
  const suspended=(x,y,w=170,length=160)=>({...B(x,y,w,22,'heavy'),suspended:length});
  const add=(region,name,lesson,blocks,cameras,tip)=>{const r=REGIONS[region],n=LEVELS.length-r.start;LEVELS.push({name,district:r.name.toUpperCase(),region,tool:r.tool,lesson,blocks,cameras,tip,hint:n===0?r.description:tip,shots:4,stars:[2,3],finale:n===7})};
  add(1,'Fresh coat','Meet Inez and the paint can',[shelf(820,605)],[shield(820,576)],'Land a paint can beside the armored lens. The burst reaches beyond direct contact.');
  add(1,'Two for a splash','Catch a nearby pair',[shelf(845,590,230)],[shield(790,561),shield(900,561)],'Aim between the lenses to paint both with one burst.');
  add(1,'Above the awning','Splash from above',[shelf(890,600,200),B(755,555,26,130,'steel',true)],[shield(840,571),shield(940,571)],'A higher throw clears the awning. Paint bursts on first contact.');
  add(1,'Wet floor','Use a low splash',[shelf(840,605,130),shelf(1090,605,140)],[shield(840,576),shield(1090,576)],'Two separated pods need two carefully placed splashes.');
  add(1,'Gallery wall','Burst against glass',[B(800,540,20,160,'glass'),shelf(900,600,190)],[shield(860,571),shield(945,571)],'The glass is a splash surface. An impact close to the lenses coats them.');
  add(1,'Color falls','Collapse and coat',[...tower(880,140,160),shelf(1080,605,120)],[shield(840,451),shield(920,451),shield(1080,576)],'Paint the upper pair, then finish the far lens.');
  add(1,'Undercoat','Reach around a barrier',[B(760,565,30,110,'steel',true),shelf(870,595,180),shelf(1100,570,110)],[shield(835,566),shield(910,566),shield(1100,541)],'An armored hood stops the stone, but a nearby paint burst covers the lens.');
  add(1,'A different picture','Color Quarter finale',[...tower(865,165,180),B(1060,540,20,160,'glass'),shelf(1125,600,120)],[shield(815,426),shield(915,426),shield(1080,571),shield(1160,571)],'Two clusters, two splashes. Paint the skyline.');
  add(2,'Pull the plug','Meet Dex and the EMP',[shelf(800,605)],[node(800,576,'A')],'The puck releases an EMP on first contact. Land within pulse range.');
  add(2,'Shared password','One node drops a circuit',[shelf(760,600),shelf(1090,535)],[node(760,571,'A'),node(1090,506,'A')],'Matching cyan wires share a circuit. Pulse the closer camera.');
  add(2,'Separate channels','Find both circuits',[shelf(780,605),shelf(1100,590)],[node(780,576,'A'),node(1100,561,'B')],'Different wire colors mean separate circuits. Each needs its own pulse.');
  add(2,'Signal booster','Reach a low node',[shelf(785,605),...tower(1070,230,150)],[node(785,576,'A'),node(1030,361,'A'),node(1110,361,'A')],'The low node links to both rooftop cameras.');
  add(2,'Firewall','Arc over steel',[B(700,555,30,130,'steel',true),shelf(845,600),shelf(1110,480)],[node(845,571,'A'),node(1110,451,'A')],'A pulse is short-range, even when its network reaches across the level.');
  add(2,'Cross talk','Two neighboring networks',[shelf(820,600,200),shelf(1120,550,140)],[node(775,571,'A'),node(875,571,'B'),node(1080,521,'A'),node(1160,521,'B')],'Catch both near nodes in the same pulse to shut down both networks.');
  add(2,'Dead zone','Break into the cluster',[B(775,535,20,170,'glass'),...tower(885,120,170),shelf(1140,590)],[node(850,471,'A'),node(930,471,'B'),node(1140,561,'B')],'Pulse between the elevated nodes, or take separate shots.');
  add(2,'Radio silence','Signal Heights finale',[shelf(760,605),...tower(1000,200,180),shelf(1170,595,90)],[node(760,576,'A'),node(950,391,'A'),node(1040,391,'B'),node(1170,566,'B')],'Reach one node of each circuit. Every linked camera follows.');
  add(3,'Loose ends','Meet June and the pull hook',[suspended(850,520)],[C(850,490)],'Hit the hanging beam. The hook pulls left for a moment and tears strained cables.');
  add(3,'Swing shift','Tip a hanging platform',[suspended(880,480,230)],[C(825,450),C(935,450)],'An off-center hook twists the platform and dumps both cameras.');
  add(3,'Falling inventory','Drop a weight',[suspended(870,430,180),shelf(870,610,180)],[C(870,580),C(870,400)],'Pull the hanging weight down onto the ground camera.');
  add(3,'Two cranes','Choose each anchor',[suspended(775,510,135),suspended(1080,450,160)],[C(775,480),C(1080,420)],'Each crane is independent. Pull one beam, then the other.');
  add(3,'Dock dominoes','Use suspended mass',[suspended(820,430,220),...tower(1060,120,130)],[C(820,400),C(1060,470)],'Swing the hanging beam into the neighboring tower, or clean up with a second hook.');
  add(3,'Load bearing','Pull out a leg',[...tower(865,165,180),B(865,423,130,24,'heavy'),suspended(1100,510,145)],[C(865,390),C(1100,480)],'A hook also grips wood. Drag a support out from beneath the heavy cap.');
  add(3,'Longshore','Three on a beam',[suspended(950,490,320)],[C(840,460),C(950,460),C(1060,460)],'Aim away from the center to twist the long beam.');
  add(3,'The last crane','Iron Docks finale',[suspended(820,415,210),suspended(1090,505,210),shelf(960,610,160)],[C(775,385),C(875,385),C(1090,475),C(960,580)],'Drop the cranes, then finish anything still watching.');
  global.BlindSpotData={B,C,LEVELS,MATERIALS,TOOLS,REBELS,REGIONS,WORLD,starsFor};
})(typeof window!=='undefined'?window:globalThis);
