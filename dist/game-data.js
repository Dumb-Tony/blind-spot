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
    {name:'Heavy paperwork',district:'RECORDS OFFICE',lesson:'Let the weight do the work',hint:'Concrete carries weight, cracks under hard hits, and crumbles into rubble.',tip:'The weight sits on glass. Knock that support away and it drops onto the lower camera.',shots:3,stars:[1,2],blocks:[B(865,530,22,180,'glass'),B(995,530,22,180),B(930,430,180,20),B(930,398,96,44,'heavy')],cameras:[C(930,600),C(930,356)]},
    {name:'Overprotective',district:'CIVIC SQUARE',lesson:'Go over the wall',hint:'Dark steel stays put. Arc over it to reach the fragile roof.',tip:'Pull farther down for a high arc. Judge the height carefully: the opening guide does not reveal contact.',shots:4,stars:[2,3],blocks:[B(720,530,36,180,'steel',true),B(860,550,24,140),B(1060,550,24,140),B(960,470,240,20,'glass')],cameras:[C(885,600),C(1035,600),C(960,440)]},
    {name:'Domino department',district:'PAPER TRAIL',lesson:'Make the whole row wobble',hint:'One hit. Several very bad construction decisions.',tip:'Aim at the first narrow tower. The heavy cap can carry the collapse to the next one.',shots:4,stars:[2,3],blocks:[...tower(760,180,100),B(760,408,92,24,'heavy'),...tower(930,140,100),B(930,448,92,24,'heavy'),...tower(1100,100,100)],cameras:[C(760,376),C(930,416),C(1100,480)]},
    {name:'The Ministry of Looking',district:'REGION FINALE',lesson:'Shut the relay down',hint:'Four cameras. Wood, glass, and a very top-heavy ego.',tip:'Remove the glass legs on the left, then clean up the far camera. Gravity handles the paperwork.',shots:5,stars:[2,4],finale:true,blocks:[...tower(880,150,220,'glass'),B(820,380,24,160),B(940,380,24,160),B(880,290,190,20),B(880,255,100,50,'heavy'),...tower(1130,95,110)],cameras:[C(805,600),C(960,430),C(880,210),C(1130,485)]}
  ];
  const MATERIALS={
    wood:{density:.002,friction:.65,restitution:.12,hp:42,threshold:2.5,color:'#e3a258',stroke:'#573830',name:'Wood · breaks'},
    glass:{density:.001,friction:.55,restitution:.05,hp:14,threshold:1.5,color:'#67e5ec',stroke:'#bffaff',name:'Glass · shatters'},
    heavy:{density:.006,friction:.65,restitution:.08,hp:90,threshold:5.5,color:'#7486a6',stroke:'#2a3550',name:'Concrete · crumbles'},
    steel:{density:.008,friction:.9,restitution:.04,hp:Infinity,threshold:Infinity,color:'#29364b',stroke:'#91a4b6',name:'Steel · fixed'}
  };
  MATERIALS.cell={density:.003,friction:.7,restitution:.08,hp:18,threshold:2.2,color:'#d9773f',stroke:'#ffdc87',name:'Power cell · chain burst'};
  const TOOLS={'street-stone':{name:'Street Stone',radius:19,density:.008,airFriction:.0015,maxPull:118,power:.23}};
  const WORLD={width:1280,height:720,ground:620,anchor:{x:220,y:490},step:1000/60,gravity:.001};
  const REBELS={mara:{name:'Mara',role:'Courier. Skater. Camera critic.',tool:'street-stone'}};
  const REGIONS=[{id:'starter-city',name:'Starter City',rebel:'mara',tool:'street-stone',levels:8}];
  const starsFor=(level,used)=>used<=level.stars[0]?3:used<=level.stars[1]?2:1;

  Object.assign(TOOLS,{
    'paint-can':{...TOOLS['street-stone'],id:'paint-can',name:'Paint Can',color:'#f577d0',density:.006},
    'emp-puck':{...TOOLS['street-stone'],id:'emp-puck',name:'EMP Puck',color:'#65eaf2',density:.007},
    grapple:{...TOOLS['street-stone'],id:'grapple',name:'Cable Cutter',color:'#ffd275',density:.0065}
  });
  Object.assign(REBELS,{
    inez:{name:'Inez',role:'Muralist. Makes privacy visible.',tool:'paint-can',portrait:0},
    dex:{name:'Dex',role:'Tinkerer. Unplugs the city.',tool:'emp-puck',portrait:1},
    june:{name:'June',role:'Mechanic. Cuts the system loose.',tool:'grapple',portrait:2}
  });
  REGIONS[0].color='#d9ff63';REGIONS[0].start=0;
  REGIONS.push(
    {id:'color-quarter',name:'Color Quarter',rebel:'inez',tool:'paint-can',start:8,levels:8,color:'#f577d0',description:'Paint bursts coat armored lenses. Get close; splash finishes the job.'},
    {id:'signal-heights',name:'Signal Heights',rebel:'dex',tool:'emp-puck',start:16,levels:8,color:'#65eaf2',description:'EMP pulses jump through matching circuits. Find the reachable node.'},
    {id:'iron-docks',name:'Iron Docks',rebel:'june',tool:'grapple',start:24,levels:8,color:'#ffd275',description:'June’s spinning cutter severs cables, hinges, glass, and wooden joints. Steel sends it ricocheting.'}
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
  add(3,'Loose ends','Meet June and the cable cutter',[suspended(850,520)],[C(850,490)],'Clip either suspension cable by striking the hanging beam. The loose side drops immediately.');
  add(3,'Swing shift','Tip a hanging platform',[suspended(880,480,230)],[C(825,450),C(935,450)],'An off-center hook twists the platform and dumps both cameras.');
  add(3,'Falling inventory','Drop a weight',[suspended(870,430,180),shelf(870,610,180)],[C(870,580),C(870,400)],'Pull the hanging weight down onto the ground camera.');
  add(3,'Two cranes','Choose each anchor',[suspended(775,510,135),suspended(1080,450,160)],[C(775,480),C(1080,420)],'Each crane is independent. Pull one beam, then the other.');
  add(3,'Dock dominoes','Use suspended mass',[suspended(820,430,220),...tower(1060,120,130)],[C(820,400),C(1060,470)],'Swing the hanging beam into the neighboring tower, or clean up with a second hook.');
  add(3,'Load bearing','Pull out a leg',[...tower(865,165,180),B(865,423,130,24,'heavy'),suspended(1100,510,145)],[C(865,390),C(1100,480)],'A hook also grips wood. Drag a support out from beneath the heavy cap.');
  add(3,'Longshore','Three on a beam',[suspended(950,490,320)],[C(840,460),C(950,460),C(1060,460)],'Aim away from the center to twist the long beam.');
  add(3,'The last crane','Iron Docks finale',[suspended(820,415,210),suspended(1090,505,210),shelf(960,610,160)],[C(775,385),C(875,385),C(1090,475),C(960,580)],'Drop the cranes, then finish anything still watching.');
  // Stable identities keep the original 32 installations and their saved stars intact.
  const legacy=LEVELS.splice(0);legacy.forEach((l,i)=>{l.id=`legacy-${i}`;l.finale=false});
  TOOLS['street-stone'].id='street-stone';
  TOOLS['emp-puck'].pulseRadius=95;TOOLS['emp-puck'].linkRange=190;
  REGIONS[2].description='Land close: the 95-pixel pulse reaches only one nearby circuit neighbor.';
  REGIONS.push(
    {id:'junction-yard',name:'Junction Yard',rebel:'mara',tool:'street-stone',color:'#ffab88',description:'Mara and Inez team up. Break supports, then coat the armored survivors.'},
    {id:'central-works',name:'Central Works',rebel:'june',tool:'grapple',color:'#baa4ff',description:'The whole crew. Choose your tools, open a route, and bring the city down.'}
  );
  const titles=[
    ['Side street','Freight steps','Balancing act','Split courtyard','Glass arcade','Dead weight','Upper offices','Long division','Civic scaffolds','The leaning archive','Last supports','City hall'],
    ['Back alley mural','Raised canvas','Paint balcony','Separated studios','The conservatory','Concrete canvas','Over the gallery','Private collection','Exhibition halls','Paint the district','Final exhibition','The grand mural'],
    ['Local access','Short connection','Air gap','Rooftop routers','Broken signal','Relay weight','Switchboard','Cold storage','Network islands','Uplink terraces','Final broadcast','The exchange'],
    ['Cargo lane','Loading stairs','Tipping point','Twin gantries','Fragile freight','Counterweights','Dock offices','Cargo islands','Dry dock','Crane avenue','Terminal weight','Port authority'],
    ['Fresh partnership','Two approaches','Open the shutters','Shared canvas','Divide the work','Art delivery','The glass market','Upper gallery','Paint and rubble','Courtyard crew','Crossover','Private balconies','Narrow passage','Freight murals','The tall order','Museum annex','Separate wings','Office avalanche','The last commission','Junction takeover'],
    ['Crew call','Signal and steel','Hooked on color','Different angles','First operation','Heavy relay','The outer works','Lifting privacy','Switching tactics','Crew quarters','Factory windows','Load and signal','The high route','Four departments','Freight exchange','The inner works','Communications court','Tower committee','Final preparations','The central blackout']
  ];
  // Authored structural vocabulary, composed deterministically into escalating districts.
  // Each stage adds span, height, targets or a second structural task; no random puzzles.
  function installation(region,stage){
    const titleIndex=stage;stage+=region<4?8:0;
    const mixed=region>=4, tier=Math.floor(stage/4), motif=stage%4;
    const count=2+Math.floor((stage+(mixed?2:0))/5), blocks=[],cameras=[];
    const left=690-tier*8,right=1040+tier*25,spacing=(right-left)/(count-1);
    const primary=REGIONS[region].tool;
    for(let j=0;j<count;j++){
      const x=left+j*spacing, height=90+tier*24+((j+motif)%3)*35;
      const width=Math.min(144,spacing-18), mat=(j+stage)%3===0?'glass':'wood';
      // Alternate independent towers, hanging loads, two-storey frames and fixed paint pods.
      const hanging=(region===3||region===5)&&j%2===0&&motif!==2;
      const armored=(region===1)||(mixed&&j===count-1);
      if(armored&&j===count-1){blocks.push(shelf(x,620-height,width));cameras.push({...shield(x,591-height),bolted:mixed});}
      else if(hanging){blocks.push(suspended(x,620-height,width,110+tier*10));cameras.push(C(x,590-height));}
      else {
        blocks.push(...tower(x,height,width,mat));
        let top=620-height-20;
        if(tier>=1&&(j+motif)%2===0){blocks.push(B(x,top-13,width*.64,26,'heavy'));top-=26;}
        if(tier>=2&&j===1){const upper=65+tier*8;blocks.push(B(x-width*.3,top-upper/2,18,upper,'glass'),B(x+width*.3,top-upper/2,18,upper),B(x,top-upper-8,width,16));top-=upper+16;}
        cameras.push({...C(x,top-19),shield:armored,circuit:region===2||region===5?(Math.floor(j/2)%2?'B':'A'):undefined});
      }
      if(tier>=2&&j===0)cameras.push({...C(x+width*.22,599),circuit:region===2?'B':undefined});
    }
    if(motif===1)blocks.push(B(590,570,22,100,'glass'));
    if(motif===2)blocks.push(B(600,572-tier*6,24,96+tier*12,'steel',true));
    if(motif===3&&tier>=1){const x=left-85;blocks.push(B(x,600,20,40,'glass'),B(x,565,88,30,'heavy'));}
    const tip=mixed?'Choose a tool before throwing. Break the exposed legs; save paint for the armored lens on the far platform.':region===1?'Paint the upper lenses or break their supports. Separate towers need separate splashes.':region===2?'Get the puck within 95 pixels. Circuit jumps stop after one neighbor within 190 pixels. Falling mounts still count.':region===3?'Cut a suspended beam near one end, slice a hinge, or carve through a wooden leg. Let the released weight finish the collapse.':'Aim at glass and narrow legs. Heavy caps and falling beams carry the destruction onward.';
    const shots=cameras.length+3, arsenal=mixed?(region===4?{'street-stone':cameras.length+1,'paint-can':3}:{grapple:3,'street-stone':3,'paint-can':3,'emp-puck':3}):undefined;
    return{id:`${REGIONS[region].id}-${stage+1}`,name:titles[region][titleIndex],district:REGIONS[region].name.toUpperCase(),region,tool:primary,arsenal,lesson:`${['Supports & timing','Separated targets','Stacked loads','Multiple approaches','District finale'][tier]} · ${cameras.length} cameras`,hint:tip,tip,shots,stars:[cameras.length+1,cameras.length+2],blocks,cameras,difficulty:stage+1};
  }
  REGIONS.forEach((r,region)=>{
    r.start=LEVELS.length;r.levels=20;
    if(region<4){const original=legacy.slice(region*8,region*8+8);if(region===2)original.forEach(l=>{l.hint=l.tip='Land within 95 pixels of a camera. Only one matching neighbor within 190 pixels can follow. Use another shot for distant nodes.';l.shots=6;l.stars=[4,5]});LEVELS.push(...original);}
    for(let stage=0;stage<(region<4?12:20);stage++)LEVELS.push(installation(region,stage));
    LEVELS.at(-1).finale=true;
  });
  // Reference pars calibrated against reproducible launches; two spare throws remain.
  const PAR={"starter-city-9":2,"starter-city-10":2,"starter-city-11":3,"starter-city-12":2,"starter-city-13":2,"starter-city-14":2,"starter-city-15":2,"starter-city-16":2,"starter-city-17":6,"starter-city-18":2,"starter-city-19":2,"starter-city-20":2,"color-quarter-9":3,"color-quarter-10":3,"color-quarter-11":3,"color-quarter-12":4,"color-quarter-13":3,"color-quarter-14":6,"color-quarter-15":4,"color-quarter-16":3,"color-quarter-17":3,"color-quarter-18":3,"color-quarter-19":4,"color-quarter-20":3,"legacy-16":2,"legacy-17":2,"legacy-18":2,"legacy-19":2,"legacy-20":2,"legacy-21":2,"legacy-22":2,"legacy-23":2,"signal-heights-9":2,"signal-heights-10":3,"signal-heights-11":2,"signal-heights-12":2,"signal-heights-13":2,"signal-heights-14":2,"signal-heights-15":3,"signal-heights-16":2,"signal-heights-17":2,"signal-heights-18":2,"signal-heights-19":3,"signal-heights-20":3,"iron-docks-9":2,"iron-docks-10":2,"iron-docks-11":2,"iron-docks-12":3,"iron-docks-13":2,"iron-docks-14":2,"iron-docks-15":3,"iron-docks-16":2,"iron-docks-17":3,"iron-docks-18":2,"iron-docks-19":2,"iron-docks-20":3,"junction-yard-1":2,"junction-yard-2":2,"junction-yard-3":2,"junction-yard-4":2,"junction-yard-5":2,"junction-yard-6":2,"junction-yard-7":2,"junction-yard-8":2,"junction-yard-9":3,"junction-yard-10":4,"junction-yard-11":3,"junction-yard-12":3,"junction-yard-13":3,"junction-yard-14":3,"junction-yard-15":3,"junction-yard-16":2,"junction-yard-17":3,"junction-yard-18":3,"junction-yard-19":9,"junction-yard-20":3,"central-works-1":2,"central-works-2":2,"central-works-3":2,"central-works-4":2,"central-works-5":2,"central-works-6":2,"central-works-7":2,"central-works-8":2,"central-works-9":2,"central-works-10":2,"central-works-11":3,"central-works-12":3,"central-works-13":4,"central-works-14":2,"central-works-15":3,"central-works-16":2,"central-works-17":2,"central-works-18":3,"central-works-19":5,"central-works-20":2};
  LEVELS.forEach(l=>{if(PAR[l.id]){l.stars=[PAR[l.id],PAR[l.id]+1];l.shots=Math.max(PAR[l.id]+2,l.cameras.length)}});

  // Four authored contraption puzzles per district. Stable IDs retain saved progress.
  const cell=(x,y)=>B(x,y,36,40,'cell');
  function rocker(x,y,w,group){return [
    {...B(x,(y+620)/2,24,620-y,'steel',true),pivotGroup:group},
    {...B(x,y,w,20,'heavy'),hinge:true,pivotGroup:group},
    B(x-w*.38,(y+630)/2,18,610-y,'glass'),B(x+w*.38,(y+630)/2,18,610-y,'wood')
  ];}
  const contraptionNames=[
    ['Balance of power','Battery basement','Counterweight court','The tipping point'],
    ['Tilted canvas','Neon spill','Gallery pendulum','Color in motion'],
    ['Live balance','Short circuit','Stored energy','Cascade protocol'],
    ['Pivot shift','Boiler room','Crane exchange','Dockside demolition'],
    ['Shared leverage','Paint the fuse','Transfer station','Coordinated chaos'],
    ['Fulcrum protocol','Power reservoir','The exchange','Citywide blind spot']
  ];
  for(let region=0;region<6;region++)for(let pattern=0;pattern<4;pattern++){
    const slot=[8,11,15,19][pattern],l=LEVELS[region*20+slot],group=region*4+pattern+1;
    const lift=region*5;let blocks=[],cameras=[];
    if(pattern===0){
      blocks=[...rocker(835,505-lift,290,group),B(755,482-lift,60,26,'heavy'),...tower(1120,150+lift,110,'glass')];
      cameras=[C(755,450-lift),C(915,476-lift),C(1120,430-lift)];
    }else if(pattern===1){
      blocks=[cell(755,600),...tower(845,145+lift,150,'glass'),B(845,435-lift,90,30,'heavy'),...tower(1090,215+lift,160),cell(1040,600)];
      cameras=[C(845,401-lift),C(1090,365-lift),C(950,600)];
      if(region===2||region===5)blocks.push(cell(890,600));
    }else if(pattern===2){
      blocks=[...rocker(810,510-lift,290,group),B(715,479-lift,60,42,'heavy'),...tower(1090,200+lift,180,'glass'),suspended(1090,305-lift,160,95),cell(1005,600)];
      cameras=[C(890,481-lift),C(1040,380-lift),C(1140,380-lift),C(1090,275-lift)];
    }else{
      blocks=[cell(670,600),...tower(760,130,120,'glass'),...rocker(1020,470-lift,310,group),B(1095,434-lift,60,50,'heavy'),cell(865,600),B(1195,580,70,80,'steel',true)];
      cameras=[C(760,450),C(910,441-lift),C(1095,389-lift),C(970,600),C(1195,521)];
      if(region===0||region===3){blocks.push(cell(720,450));cameras[0]=C(795,450);}
    }
    if(region===1)cameras=cameras.map(c=>({...c,shield:true}));
    if(region===2)cameras=cameras.map((c,i)=>({...c,circuit:i%2?'B':'A'}));
    if(region>=4){if(pattern!==3){blocks.push(B(1220,600,80,40,'steel',true));cameras.push(C(1220,561));}const last=cameras.at(-1);last.shield=true;last.bolted=true;}
    const tip=pattern===0?'The round hub is a hinge. Break an end brace or hit off-center to tip the deck and spill its cameras.':pattern===1?'Orange power cells burst after a hard impact or a close EMP. Use their short-range shove to bring down the neighboring frame.':pattern===2?'Pull or break the outer brace to shift the counterweight. The crane and the distant tower offer a second route.':'Chain the power cells into the left frame, then tip the hinged deck. Save a precise tool for the far camera.';
    Object.assign(l,{name:contraptionNames[region][pattern],blocks,cameras,lesson:['Hinged platforms','Power-cell chain reactions','Counterweight transfer','Contraption finale'][pattern],hint:tip,tip,contraption:true,shots:pattern===3?7:6,stars:pattern===3?[5,6]:[4,5]});
    if(region>=4){l.arsenal=region===4?{'street-stone':5,'paint-can':4}:{'street-stone':3,'paint-can':3,'emp-puck':3,grapple:3};l.hint+=' The bolted pink lens needs paint'+(region===5?' or a close EMP':'')+'.';}
    const par=[[1,2,2,3],[2,2,2,3],[2,2,2,3],[1,3,2,2],[3,3,3,4],[2,2,3,3]][region][pattern];
    l.stars=[par,par+1];l.shots=Math.max(par+2,cameras.length);
  }
  // The opening district teaches broad structural targets before demanding precision.
  // Keep stable level identities and saved stars while opening alternate attack paths.
  const opening=[
    {blocks:tower(770,90,250),cameras:[C(770,491)],par:2,tip:'Hit the camera, the wide wooden platform, or either leg. A second throw still earns three stars.'},
    {blocks:tower(820,160,230),cameras:[C(820,421)],par:2,tip:'Break either leg, strike the broad deck, or reach the camera directly. Use a cleanup throw if it stays upright.'},
    {blocks:[B(710,535,18,170,'glass'),...tower(830,75,210,'glass')],cameras:[C(830,506)],par:2,tip:'Shatter the front pane and carry through, break a glass leg, or arc onto the wooden deck.'},
    {blocks:[...tower(720,110,160),...tower(990,150,190)],cameras:[C(720,471),C(990,431)],par:3,tip:'A low shot can sweep the legs; a higher shot hits the decks. You can take the towers separately and still earn three stars.'},
    {blocks:[B(785,530,22,180,'glass'),B(915,530,22,180),B(850,430,180,20),B(850,398,96,44,'heavy')],cameras:[C(850,600),C(850,356)],par:3,tip:'Drop the concrete by breaking either support, or hit the upper camera and finish underneath. Three throws can earn three stars.'},
    {blocks:[B(660,580,36,80,'steel',true),B(800,550,24,140),B(1000,550,24,140),B(900,470,240,20,'glass')],cameras:[C(845,440),C(900,440),C(955,440)],par:3,tip:'Clear the low wall to hit either leg, shatter the broad glass roof, or hit the cameras directly. The whole row shares one fragile platform.'},
    {par:3,tip:'Sweep through the legs, topple the weighted caps, or take the towers separately. Three throws still earn three stars.'},
    {blocks:[...tower(810,190,190,'glass'),B(810,395,180,30,'heavy'),...tower(1060,150,190)],cameras:[C(770,361),C(850,361),C(1020,431),C(1100,431)],par:4,tip:'Two pairs share two broad platforms. Break the glass legs, topple the concrete cap, or take the decks separately; four throws can earn three stars.'}
  ];
  opening.forEach((d,i)=>{const l=LEVELS[i];if(d.blocks)l.blocks=d.blocks;if(d.cameras)l.cameras=d.cameras;l.stars=[d.par,d.par+1];l.shots=d.par+3;l.tip=l.hint=d.tip;});
  for(let i=8;i<20;i++){const l=LEVELS[i];if(l.stars[0]<3)l.stars=[l.stars[0]+1,l.stars[0]+2];l.shots=Math.max(l.shots,l.stars[0]+3);}
  // Larger close-range impact surfaces introduce splash tools without extending EMP range.
  for(const i of [20,21,40,41]){const l=LEVELS[i],c=l.cameras[0],x=i===21?(c.x+l.cameras[1].x)/2:c.x-45;l.blocks.push(B(x,c.y-19,18,76,'glass'));l.hint=l.tip='Hit the glass beside the lens, the shelf, or the camera itself. Nearby impact points can activate your tool.';}
  for(const r of REGIONS)for(let n=0;n<4;n++){const l=LEVELS[r.start+n];l.shots=Math.max(l.shots,l.stars[0]+3);if(l.arsenal)for(const tool of Object.keys(l.arsenal))l.arsenal[tool]++;}

  // Expansion districts append stable identities after the original 120 installations.
  Object.assign(TOOLS,{
    'breach-charge':{...TOOLS['street-stone'],id:'breach-charge',name:'Breach Charge',color:'#ff704f',density:.009,blastRadius:125},
    'foam-pod':{...TOOLS['street-stone'],id:'foam-pod',name:'Foam Pod',color:'#a7ff88',density:.0045,foamRadius:105}
  });
  Object.assign(REBELS,{
    sol:{name:'Sol',role:'Demolition runner. Opens the hard way.',tool:'breach-charge'},
    niko:{name:'Niko',role:'Street builder. Turns gaps into leverage.',tool:'foam-pod'}
  });
  const expansion=[
    {id:'redline-ward',name:'Redline Ward',rebel:'sol',tool:'breach-charge',color:'#ff704f',description:'Sol’s charge sticks on impact, then drives a focused blast through clustered supports.'},
    {id:'overgrowth',name:'Overgrowth',rebel:'niko',tool:'foam-pod',color:'#a7ff88',description:'Niko’s foam blooms into a physical wedge that lifts beams and changes the structure.'}
  ];
  const expansionNames=[
    ['First breach','Knock twice','Load-bearing lie','Glass fuse','Split foundation','Hard corner','Pressure line','The red stair','Crossbeam','Controlled fall','Bunker windows','Three weak points','Concrete ladder','Blast corridor','Deep supports','Demolition clock','Outer wall','Redline offices','Fault cascade','Ward blackout'],
    ['First bloom','Lift the edge','Soft landing','Growing concern','Wedge issue','Under pressure','Green scaffold','Foam and glass','Raised argument','Root access','Over the barrier','Expanding plans','Garden offices','Lift bridge','Packed tight','Living leverage','Upper canopy','New foundations','City greenhouse','Overgrowth finale']
  ];
  function expansionLevel(region,stage){
    const r=REGIONS[region],tier=Math.floor(stage/4),motif=stage%4,count=2+Math.floor(stage/5),blocks=[],cameras=[];
    const left=720-tier*12,right=1040+tier*20,spacing=count===1?0:(right-left)/(count-1);
    for(let j=0;j<count;j++){
      const x=left+j*spacing,height=95+tier*24+((j+motif)%3)*24,width=Math.min(150,spacing-16||150),mat=(j+stage)%3===0?'glass':'wood';
      if(motif===1&&j===0){blocks.push(suspended(x,620-height,width,90+tier*12));cameras.push(C(x,590-height));}
      else {blocks.push(...tower(x,height,width,mat));if(tier>1&&(j+motif)%2===0)blocks.push(B(x,620-height-38,width*.65,32,'heavy'));cameras.push(C(x,581-height-(tier>1&&(j+motif)%2===0?32:0)));}
    }
    if(motif===2)blocks.push(B(625,555,28,130,'steel',true));
    if(motif===3){blocks.push(B(545,590,20,60,'glass'),B(615,590,20,60,'wood'),B(580,545,104,30,'heavy'));cameras.push(C(580,510));}
    if(region===6&&tier>=2)cameras[Math.min(1,cameras.length-1)].shield=true;
    const par=Math.max(2,Math.ceil(cameras.length*.7)),arsenal=region===7?{'foam-pod':par+1,'breach-charge':2,'street-stone':2}:undefined;
    const tip=region===6?'Stick the charge to a support or clustered camera mount. The blast is powerful but local; use the structure to carry it.':'Bloom foam beneath a beam or weight to lift it. Use the new angle, or switch tools when a direct break is cleaner.';
    return{id:`${r.id}-${stage+1}`,name:expansionNames[region-6][stage],district:r.name.toUpperCase(),region,tool:r.tool,arsenal,lesson:`${['New tool','Separated structures','Layered loads','Compound routes','District finale'][tier]} · ${cameras.length} cameras`,hint:stage===0?r.description:tip,tip,shots:par+3,stars:[par,par+1],blocks,cameras,difficulty:21+stage,finale:stage===19};
  }
  for(const r of expansion){r.start=LEVELS.length;r.levels=20;REGIONS.push(r);const region=REGIONS.length-1;for(let stage=0;stage<20;stage++)LEVELS.push(expansionLevel(region,stage));}

  // New crews append after the established 160 installations. The legacy
  // grapple id is retained internally so existing solutions and saves migrate.
  Object.assign(TOOLS,{
    'magnet-puck':{...TOOLS['street-stone'],id:'magnet-puck',name:'Magnet Puck',color:'#8bb8ff',density:.008,magnetRadius:175},
    'airburst':{...TOOLS['street-stone'],id:'airburst',name:'Airburst Capsule',color:'#ff9de1',density:.0048,burstRadius:165}
  });
  Object.assign(REBELS,{
    vale:{name:'Vale',role:'Salvage pilot. Makes metal move.',tool:'magnet-puck'},
    tess:{name:'Tess',role:'Rooftop runner. Weaponizes open air.',tool:'airburst'}
  });
  const nextRegions=[
    {id:'magnet-mile',name:'Magnet Mile',rebel:'vale',tool:'magnet-puck',color:'#8bb8ff',description:'Vale’s puck drags loose beams, concrete, and cameras toward its landing point. Fixed steel anchors the reaction.'},
    {id:'updraft',name:'Updraft',rebel:'tess',tool:'airburst',color:'#ff9de1',description:'Tess’s capsule releases a broad pressure wave. It moves structures without simply breaking everything it touches.'}
  ];
  const nextNames=[
    ['First attraction','Loose change','Metal meeting','Salvage rights','Heavy draw','Crossed lines','Blue shift','Freight magnet','Anchor point','Moving parts','Scrap balcony','Polar offices','Concrete compass','Cargo cluster','The long pull','Foundry floor','Split attraction','Magnetic field','Salvage skyline','Mile blackout'],
    ['First gust','Open window','Push comes down','Loose roof','Crosswind','Pressure drop','Pink horizon','Air pocket','Lift and separate','Draft offices','Wide blast','Falling weather','Vent stack','Storm door','Pressure court','High front','Split current','Rooftop warning','Last forecast','Updraft finale']
  ];
  function nextLevel(region,stage){
    const r=REGIONS[region],tier=Math.floor(stage/4),motif=stage%4,count=2+Math.floor(stage/5),blocks=[],cameras=[];
    const left=700-tier*10,right=1050+tier*18,spacing=(right-left)/Math.max(1,count-1);
    for(let j=0;j<count;j++){
      const x=left+j*spacing,height=100+tier*22+((j+motif)%3)*28,width=Math.min(145,spacing-18),mat=(j+stage)%3===0?'glass':j%2?'heavy':'wood';
      if((motif===1||motif===3)&&j===0){blocks.push(suspended(x,620-height,width,95+tier*10));cameras.push(C(x,590-height));}
      else {blocks.push(...tower(x,height,width,mat));if(tier>1&&j%2===0)blocks.push(B(x,620-height-37,width*.7,30,'heavy'));cameras.push(C(x,581-height-(tier>1&&j%2===0?30:0)));}
    }
    if(motif===2)blocks.push(B(610,555,26,130,'steel',true));
    const par=Math.max(2,Math.ceil(cameras.length*.75));
    const arsenal=region===9?{'airburst':par+2,'magnet-puck':2,'grapple':2,'street-stone':2}:undefined;
    const tip=region===8?'Land beside loose structure. The magnetic snap gathers moving beams, weights, and unbolted cameras; fixed steel remains an anchor.':'Burst beside a platform or weight. The pressure wave shoves every loose object away, so placement decides the direction of collapse.';
    return{id:`${r.id}-${stage+1}`,name:nextNames[region-8][stage],district:r.name.toUpperCase(),region,tool:r.tool,arsenal,lesson:`${['New force','Separated structures','Layered loads','Compound routes','District finale'][tier]} · ${cameras.length} cameras`,hint:stage===0?r.description:tip,tip,shots:par+4,stars:[par+1,par+2],blocks,cameras,difficulty:41+stage,finale:stage===19};
  }
  for(const r of nextRegions){r.start=LEVELS.length;r.levels=20;REGIONS.push(r);const region=REGIONS.length-1;for(let stage=0;stage<20;stage++)LEVELS.push(nextLevel(region,stage));}
  // Cutter stages allow a direct cleanup route as well as a chain-reaction
  // solution; the player is never forced into one exact cable strike.
  for(const l of LEVELS.filter(l=>l.region===3)){l.shots=Math.max(l.shots,l.cameras.length+4);l.stars=[Math.max(l.stars[0],l.cameras.length+1),Math.max(l.stars[1],l.cameras.length+2)];}
  global.BlindSpotData={B,C,LEVELS,MATERIALS,TOOLS,REBELS,REGIONS,WORLD,starsFor};
})(typeof window!=='undefined'?window:globalThis);
