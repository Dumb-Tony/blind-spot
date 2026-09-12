/* Browser controller: input, fixed-step clock, audio, menus, and local progress. */
(function(){
  'use strict';
  const {LEVELS,WORLD,TOOLS,starsFor}=window.BlindSpotData,{Simulation}=window.BlindSpotPhysics;
  const $=id=>document.getElementById(id),canvas=$('game'),view=new window.BlindSpotRenderer.Renderer(canvas),tool=TOOLS['street-stone'];
  const storage={get(key){try{return window.localStorage.getItem(key)}catch(_){return null}},set(key,value){try{window.localStorage.setItem(key,value);return true}catch(_){return false}}};
  function loadProgress(){try{const data=JSON.parse(storage.get('blindspot-overhaul-progress'));if(!data||typeof data!=='object')throw 0;return{stars:Array.from({length:8},(_,i)=>Math.max(0,Math.min(3,Number(data.stars?.[i])||0))),last:Math.max(0,Math.min(7,Number(data.last)||0))}}catch(_){return{stars:Array(8).fill(0),last:0}}}
  let progress=loadProgress(),muted=storage.get('blindspot-mute')==='1',motion=storage.get('blindspot-motion')!=='0',sim=null,index=0,screen='menu',helpReturn='menu',dragId=null,fineAim=false,elapsed=0,lastNow=null,clock=0,lastSound=-9,resultShown=false,angle=18,power=90;
  if(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)motion=false;
  const sounds={ctx:null,wake(){try{if(muted)return false;const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return false;this.ctx=this.ctx||new Audio();if(this.ctx.state==='suspended')this.ctx.resume().catch(()=>{});return true}catch(_){return false}},tone(f,d=.12,type='triangle',amp=.06,delay=0){if(!this.wake())return;try{const t=this.ctx.currentTime+delay,o=this.ctx.createOscillator(),g=this.ctx.createGain();o.type=type;o.frequency.setValueAtTime(f,t);o.frequency.exponentialRampToValueAtTime(Math.max(35,f*.45),t+d);g.gain.setValueAtTime(amp,t);g.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(g);g.connect(this.ctx.destination);o.start(t);o.stop(t+d)}catch(_){}},noise(d=.12,amp=.06){if(!this.wake())return;try{const len=Math.ceil(this.ctx.sampleRate*d),buffer=this.ctx.createBuffer(1,len,this.ctx.sampleRate),data=buffer.getChannelData(0);for(let i=0;i<len;i++)data[i]=(Math.random()*2-1)*(1-i/len);const s=this.ctx.createBufferSource(),g=this.ctx.createGain();s.buffer=buffer;g.gain.value=amp;s.connect(g);g.connect(this.ctx.destination);s.start()}catch(_){}}};
  function toast(text){$('toast').textContent=text;$('toast').classList.add('show');toast.until=clock+3.6}
  function changeScreen(next){
    screen=next;['menu','levels','how','pause','result'].forEach(id=>$(id).classList.toggle('active',id===next));const playing=next===null;$('hud').hidden=!playing;$('playFooter').hidden=!playing;$('aimPanel').hidden=!(playing&&fineAim);elapsed=0;lastNow=null;
    if(!playing){cancelDrag();sim?.cancel()}if(next==='levels')renderLevels();if(playing)canvas.focus({preventScroll:true});
  }
  function event(e){
    view.event(e);
    if(e.type==='launch'){sounds.tone(260,.15,'triangle',.09);sounds.noise(.08,.03);fineAim=false;$('aimPanel').hidden=true;$('aimBtn').setAttribute('aria-expanded','false')}
    if(e.type==='break'&&clock-lastSound>.04){lastSound=clock;if(e.material==='glass'){sounds.tone(1600,.1,'sine',.03);sounds.tone(2250,.16,'sine',.02,.03)}else{sounds.noise(.1,.065);sounds.tone(100,.09,'triangle',.08)}}
    if(e.type==='impact'&&e.strength>3&&clock-lastSound>.12){lastSound=clock;sounds.tone(85,.1,'triangle',.04)}
    if(e.type==='camera'){sounds.tone(560,.15,'sawtooth',.025);sounds.tone(180,.18,'square',.018,.08)}
    if(e.type==='win'||e.type==='lose')finish(e);
  }
  function startLevel(i){cancelDrag();index=i;resultShown=false;fineAim=false;view.reset();sim=new Simulation(LEVELS[i],event);progress.last=i;storage.set('blindspot-overhaul-progress',JSON.stringify(progress));changeScreen(null);sounds.wake();updateHUD()}
  function updateHUD(){if(!sim)return;const l=sim.level;$('district').textContent=`${String(index+1).padStart(2,'0')} / ${l.district}`;$('levelLabel').textContent=l.name;$('cameraCount').textContent=sim.remaining;$('shotCount').textContent=sim.shotsLeft;
    $('stateLabel').textContent=sim.state==='aiming'?'RELEASE TO THROW · ESC TO CANCEL':sim.state==='flying'?(sim.remaining===0?'ALL CAMERAS OFFLINE · LET IT FALL':'LET THE CHAOS SETTLE…'):'READY WHEN YOU ARE';$('hintLabel').textContent=sim.state==='flying'?'The next stone loads automatically when the action settles.':l.hint;
    $('aimBtn').disabled=!['ready','aiming'].includes(sim.state);$('fireBtn').disabled=!['ready','aiming'].includes(sim.state);
  }
  function finish(e){if(resultShown)return;resultShown=true;const win=e.type==='win',l=sim.level,stars=win?starsFor(l,sim.shotsUsed):0;
    if(win){progress.stars[index]=Math.max(progress.stars[index],stars);const saved=storage.set('blindspot-overhaul-progress',JSON.stringify(progress));if(!saved)toast('This browser cannot save progress. Your session still works.');[330,440,660,880].forEach((f,i)=>sounds.tone(f,.3,'triangle',.055,i*.1))}else sounds.tone(140,.4,'triangle',.055);
    $('resultEyebrow').textContent=win?(l.finale?'REGION 1 · OFFLINE':'INSTALLATION · OFFLINE'):'NOT QUITE A BLIND SPOT';$('resultTitle').textContent=win?(l.finale?'The city can breathe.':stars===3?'Beautifully unobserved.':'Privacy restored.'):'Still watching.';
    $('resultStars').innerHTML='★'.repeat(stars)+`<span class="empty">${'★'.repeat(3-stars)}</span>`;$('resultStars').setAttribute('aria-label',`${stars} of 3 stars`);
    $('resultDetail').textContent=win?`${sim.shotsUsed} stone${sim.shotsUsed===1?'':'s'} used. ${stars===3?'Three-star target met!':`Try ${l.stars[0]} or fewer for three stars.`}`:`${sim.remaining} camera${sim.remaining===1?'':'s'} remain. ${l.tip}`;
    $('resultStats').innerHTML=`<span><b>${sim.shotsUsed}</b>STONES</span><span><b>${sim.breaks}</b>BLOCKS BROKEN</span><span><b>${sim.bestCombo}×</b>BEST CHAIN</span>`;
    $('nextBtn').textContent=win?(index===7?'BACK TO STARTER CITY →':'NEXT INSTALLATION →'):'TRY AGAIN →';changeScreen('result');
  }
  function renderLevels(){const total=progress.stars.reduce((a,b)=>a+b,0);$('regionProgress').textContent=`${total} / 24 stars · ${progress.stars.filter(s=>s>0).length} / 8 installations offline`;
    $('levelGrid').innerHTML=LEVELS.map((l,i)=>`<button class="level-card" data-level="${i}" aria-label="Play level ${i+1}: ${l.name}. ${progress.stars[i]} stars."><canvas width="360" height="145"></canvas><span class="num">${String(i+1).padStart(2,'0')}</span><b>${l.name}</b><small>${l.lesson}</small><span class="card-stars">${'★'.repeat(progress.stars[i])}${'☆'.repeat(3-progress.stars[i])}</span></button>`).join('');
    $('levelGrid').querySelectorAll('.level-card').forEach((b,i)=>{view.thumbnail(b.querySelector('canvas'),LEVELS[i]);b.onclick=()=>startLevel(i)});
  }
  function worldPoint(e){const rect=canvas.getBoundingClientRect();return{x:(e.clientX-rect.left)*WORLD.width/rect.width,y:(e.clientY-rect.top)*WORLD.height/rect.height}}
  function updateGuide(){view.guide=sim?.openingGuide();updateHUD()}
  function cancelDrag(){if(dragId!==null){try{canvas.releasePointerCapture(dragId)}catch(_){}dragId=null}sim?.cancel();view.guide=null}
  function down(e){if(screen!==null||!sim||sim.state!=='ready'||(e.button!==undefined&&e.button!==0))return;const p=worldPoint(e);if(Math.hypot(p.x-WORLD.anchor.x,p.y-WORLD.anchor.y)>85){toast('Grab the glowing stone beside Mara to aim.');return}sounds.wake();dragId=e.pointerId;canvas.setPointerCapture(e.pointerId);sim.aim(p.x,p.y);updateGuide();e.preventDefault()}
  function move(e){if(dragId!==e.pointerId)return;const p=worldPoint(e);sim.aim(p.x,p.y);updateGuide();e.preventDefault()}
  function up(e){if(dragId!==e.pointerId)return;dragId=null;try{canvas.releasePointerCapture(e.pointerId)}catch(_){}sim.launch();view.guide=null;updateHUD();e.preventDefault()}
  function sliderAim(){if(!sim||screen!==null||!['ready','aiming'].includes(sim.state))return;angle=Number($('angleInput').value);power=Number($('powerInput').value);const rad=angle*Math.PI/180,d=tool.maxPull*power/100;sim.aim(WORLD.anchor.x-Math.cos(rad)*d,WORLD.anchor.y+Math.sin(rad)*d);$('angleValue').textContent=`${angle}°`;$('powerValue').textContent=`${power}%`;updateGuide()}
  function toggleMute(){muted=!muted;storage.set('blindspot-mute',muted?'1':'0');$('muteBtn').textContent=muted?'SOUND OFF':'SOUND ON';$('muteBtn').setAttribute('aria-label',muted?'Enable sound':'Mute sound');if(!muted)sounds.wake()}
  function pause(){if(screen===null){cancelDrag();changeScreen('pause')}else if(screen==='pause')changeScreen(null)}
  function frame(now){
    const dt=lastNow===null?0:Math.min(.1,(now-lastNow)/1000);lastNow=now;clock+=dt;
    if(screen===null&&sim){elapsed+=dt;while(elapsed>=1/60){sim.step();elapsed-=1/60;if(screen!==null){elapsed=0;break}}view.animate(dt);updateHUD()}else if(screen==='menu'||screen==='result')view.animate(dt);
    view.reduceMotion=!motion;view.draw(sim);if(toast.until<clock)$('toast').classList.remove('show');window.requestAnimationFrame(frame);
  }
  canvas.addEventListener('pointerdown',down);canvas.addEventListener('pointermove',move);canvas.addEventListener('pointerup',up);canvas.addEventListener('pointercancel',cancelDrag);canvas.addEventListener('lostpointercapture',()=>{if(dragId!==null)cancelDrag()});canvas.addEventListener('contextmenu',e=>{e.preventDefault();cancelDrag()});
  $('playBtn').onclick=()=>startLevel(progress.last);$('selectBtn').onclick=()=>changeScreen('levels');$('levelsBack').onclick=()=>changeScreen('menu');$('howBtn').onclick=()=>{helpReturn='menu';changeScreen('how')};$('howClose').onclick=()=>changeScreen(helpReturn);
  $('pauseBtn').onclick=pause;$('resumeBtn').onclick=()=>changeScreen(null);$('restartBtn').onclick=$('pauseRestart').onclick=$('retryBtn').onclick=()=>startLevel(index);$('pauseLevels').onclick=$('resultLevels').onclick=()=>changeScreen('levels');$('pauseHelp').onclick=()=>{helpReturn='pause';changeScreen('how')};
  $('nextBtn').onclick=()=>{if(sim.state==='lost')startLevel(index);else if(index===7)changeScreen('levels');else startLevel(index+1)};
  $('hintBtn').onclick=()=>toast(sim.level.tip);$('aimBtn').onclick=()=>{fineAim=!fineAim;$('aimPanel').hidden=!fineAim;$('aimBtn').setAttribute('aria-expanded',String(fineAim));if(fineAim)sliderAim();else cancelDrag()};$('angleInput').oninput=$('powerInput').oninput=sliderAim;$('fireBtn').onclick=()=>{sliderAim();sim.launch();view.guide=null};
  $('muteBtn').onclick=toggleMute;$('muteBtn').textContent=muted?'SOUND OFF':'SOUND ON';$('motionBtn').onclick=()=>{motion=!motion;storage.set('blindspot-motion',motion?'1':'0');$('motionBtn').textContent=motion?'SHAKE ON':'SHAKE OFF';$('motionBtn').setAttribute('aria-pressed',String(!motion))};$('motionBtn').textContent=motion?'SHAKE ON':'SHAKE OFF';
  $('fullscreenBtn').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else if($('app').requestFullscreen)await $('app').requestFullscreen();else toast('Fullscreen is unavailable here; try opening the game in its own tab.')}catch(_){toast('Open the game in its own browser tab for fullscreen.')}};
  window.addEventListener('keydown',e=>{
    const k=e.key.toLowerCase();if(k==='m'){toggleMute();return}if(k==='escape'){e.preventDefault();if(sim?.state==='aiming'){cancelDrag();fineAim=false;$('aimPanel').hidden=true}else if(screen==='how')changeScreen(helpReturn);else if(screen==='levels')changeScreen('menu');else pause();return}
    if(screen!==null)return;if(k==='r'){startLevel(index);return}if(e.target?.tagName==='INPUT')return;
    if(['arrowleft','arrowright','arrowup','arrowdown',' '].includes(k)){e.preventDefault();if(!['ready','aiming'].includes(sim.state))return;if(k===' ') {if(sim.state==='ready')sliderAim();sim.launch();view.guide=null;return}if(k==='arrowup')angle=Math.min(78,angle+2);if(k==='arrowdown')angle=Math.max(-8,angle-2);if(k==='arrowright')power=Math.min(100,power+3);if(k==='arrowleft')power=Math.max(25,power-3);$('angleInput').value=angle;$('powerInput').value=power;sliderAim()}
  });
  window.addEventListener('blur',()=>{if(screen===null)pause()});document.addEventListener('visibilitychange',()=>{if(document.hidden&&screen===null)pause()});
  // Read-only state for smoke tests; all actions still go through real input handlers.
  window.__blindSpot={getState:()=>({screen,index,progress:JSON.parse(JSON.stringify(progress)),...(sim?sim.snapshot():{})})};
  view.drawHero();window.requestAnimationFrame(frame);
})();
