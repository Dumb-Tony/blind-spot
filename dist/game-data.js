(function(global){
  "use strict";
  const B=(x,y,w,h,material="wood",angle=0,staticBody=false)=>({x,y,w,h,material,angle,static:staticBody});
  const C=(x,y,angle=0)=>({x,y,angle});
  const LEVELS=[
    {name:"Say Cheese",hint:"Pull back, follow the dots, release.",shots:3,stars:[1,2],blocks:[B(1010,615,180,28,"steel",0,true)],cameras:[C(1010,580)]},
    {name:"Weak at the Knees",hint:"The camera is tough. Its support is not.",shots:3,stars:[1,2],blocks:[B(1000,570,32,150),B(1000,486,170,24)],cameras:[C(1000,451)]},
    {name:"Double Exposure",hint:"Two lenses, one connected structure.",shots:4,stars:[2,3],blocks:[B(930,574,30,145),B(1070,574,30,145),B(1000,495,210,24),B(1000,610,250,22,"heavy")],cameras:[C(930,460),C(1070,460)]},
    {name:"Glass Policy",hint:"Cyan glass is fragile. Make an opening.",shots:4,stars:[2,3],blocks:[B(930,535,22,190,"glass"),B(1015,615,220,24,"steel",0,true),B(1015,578,160,24,"wood")],cameras:[C(1035,542)]},
    {name:"Leaning Argument",hint:"A low hit can make a tall point.",shots:3,stars:[1,2],blocks:[B(1010,585,28,130),B(1080,585,28,130),B(1045,510,150,22),B(1045,470,110,34,"heavy")],cameras:[C(1045,430)]},
    {name:"Paperwork Cascade",hint:"Drop the blue-gray paperwork.",shots:4,stars:[2,3],blocks:[B(940,565,26,145),B(1040,565,26,145),B(990,485,150,22),B(990,448,70,48,"heavy"),B(1125,615,110,24,"steel",0,true)],cameras:[C(990,406),C(1125,578)]},
    {name:"Privacy Wall",hint:"Armor is an invitation to look elsewhere.",shots:4,stars:[2,3],blocks:[B(895,520,34,250,"heavy"),B(1010,590,200,24,"wood"),B(955,545,24,90,"wood"),B(1065,545,24,90,"wood"),B(1010,493,150,20,"glass")],cameras:[C(1010,457),C(1060,555)]},
    {name:"OmniPeek Relay",hint:"Finale: break supports and let gravity file the appeal.",shots:5,stars:[2,4],finale:true,blocks:[B(885,578,30,145),B(1085,578,30,145),B(985,495,250,24),B(985,455,80,48,"heavy"),B(925,405,24,150,"wood",-.12),B(1045,405,24,150,"wood",.12),B(985,328,210,22),B(985,287,110,20,"glass"),B(1165,615,120,24,"steel",0,true)],cameras:[C(925,460),C(1045,460),C(955,252),C(1165,578)]}
  ];
  const MATERIALS={
    wood:{density:.0017,friction:.72,restitution:.12,breakSpeed:7.2,color:"#da8a43",stroke:"#6d3725"},
    glass:{density:.0007,friction:.35,restitution:.06,breakSpeed:3.6,color:"#62dce8",stroke:"#d5fbff"},
    heavy:{density:.006,friction:.8,restitution:.05,breakSpeed:999,color:"#697a9c",stroke:"#273553"},
    steel:{density:.008,friction:.9,restitution:.04,breakSpeed:999,color:"#283651",stroke:"#9bacca"}
  };
  const REGIONS=[{id:"starter-city",name:"Starter City",rebel:"Mara",tool:"street-stone",levels:LEVELS.length}];
  const REBELS={mara:{name:"Mara",role:"Student courier",color:"#d8ff3e"}};
  const TOOLS={"street-stone":{name:"Street Stone",radius:18,density:.008,airFriction:.005,maxPull:125,power:.19}};
  function starsFor(level,shotsUsed){return shotsUsed<=level.stars[0]?3:shotsUsed<=level.stars[1]?2:1}
  global.BlindSpotData={B,C,LEVELS,MATERIALS,REGIONS,REBELS,TOOLS,starsFor};
})(window);
