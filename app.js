// Reading transitions never hide content until an observer has actually fired.
(() => {
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const header=document.querySelector('.header');
 const hero=document.querySelector('.hero');
 if(!reduced.matches&&hero.animate){for(const [selector,delay]of [['.eyebrow',0],['h1',70],['.hero-bottom',140],['.hero-art',120]])hero.querySelector(selector).animate(selector==='.hero-art'?[{opacity:0},{opacity:1}]:[{opacity:0,transform:'translateY(18px)'},{opacity:1,transform:'translateY(0)'}],{duration:950,delay,easing:'cubic-bezier(.16,1,.3,1)',fill:'backwards'});}
 let progressFrame=0;
 function updateReading(){progressFrame=0;const range=document.documentElement.scrollHeight-innerHeight;header.style.setProperty('--reading-progress',String(range>0?scrollY/range:0));header.classList.toggle('is-scrolled',scrollY>25);hero.style.setProperty('--hero-scroll',reduced.matches?'0':String(Math.max(0,Math.min(1,scrollY/(hero.offsetHeight+90)))));}
 addEventListener('scroll',()=>{if(!progressFrame)progressFrame=requestAnimationFrame(updateReading);},{passive:true});updateReading();
 if('IntersectionObserver'in window){
  const observer=new IntersectionObserver(entries=>{for(const entry of entries){if(!entry.isIntersecting)continue;observer.unobserve(entry.target);if(!reduced.matches&&entry.target.animate)entry.target.animate([{opacity:0,transform:'translateY(22px)'},{opacity:1,transform:'translateY(0)'}],{duration:680,easing:'cubic-bezier(.2,.75,.2,1)'});}},{threshold:.06,rootMargin:'0px 0px -35px 0px'});
  document.querySelectorAll('.legacy-reveal').forEach(el=>observer.observe(el));
  const navLinks=[...document.querySelectorAll('.header nav a')];
  const sections=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting){for(const link of navLinks){if(link.getAttribute('href')==='#'+e.target.id)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');}}},{rootMargin:'-15% 0px -65% 0px'});
  navLinks.forEach(a=>{const section=document.querySelector(a.getAttribute('href'));if(section)sections.observe(section);});
 }
 document.querySelectorAll('.case-feature details').forEach(details=>{
  const summary=details.querySelector('summary');let animation=null;let desiredOpen=details.open;
  summary.addEventListener('click',event=>{
   if(reduced.matches||!details.animate)return;
   event.preventDefault();if(!animation)desiredOpen=details.open;desiredOpen=!desiredOpen;const start=details.getBoundingClientRect().height;animation?.cancel();
   details.open=true;details.style.height='auto';const end=desiredOpen?details.getBoundingClientRect().height:summary.getBoundingClientRect().height;
   animation=details.animate([{height:start+'px'},{height:end+'px'}],{duration:360,easing:'cubic-bezier(.2,.75,.2,1)'});
   animation.onfinish=()=>{details.open=desiredOpen;details.style.height='';animation=null;};
  });
 });
 reduced.addEventListener('change',()=>{if(reduced.matches)document.getAnimations().forEach(a=>{try{a.finish();}catch{a.cancel();}});});
})();


// Four direction-specific stories share the camera, not their content.
(() => {
 const track=document.querySelector('.cinema-track'),scene=track?.querySelector('.automation-cinema');if(!scene)return;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)'),compact=matchMedia('(max-width:900px)');
 const kindTabs=[...document.querySelectorAll('.kind-tabs [data-kind]')],buttons=[...scene.querySelectorAll('[data-scene]')],chapters=[...scene.querySelectorAll('[data-chapter]')];
 const profiles={
 docs:{label:'ДОКУМЕНТЫ / ОТ ДАННЫХ ДО СОГЛАСОВАНИЯ',copy:[['01 / ВХОДЯЩИЕ ДАННЫЕ','Всё начинается<br> с обычной задачи.','Сообщение в чате. Реквизиты в файле. Данные в таблице. Собираем их в единый процесс подготовки документов.'],['02 / РАБОТА СИСТЕМЫ','Данные связаны.<br> Правила учтены.','Система подставляет реквизиты, применяет согласованный шаблон и проверяет обязательные поля.'],['03 / ГОТОВЫЙ РЕЗУЛЬТАТ','Остаётся проверить.<br> И подтвердить.','Договор, приложение или акт подготовлены. Сотрудник проверяет важное и принимает решение.']],camera:{left:560,width:220,top:96,end:430,zoom:1.92,rx:9,ry:-11,rz:-2,extraX:10,extraY:-12,extraZ:-2,pan:.16}},
 office:{label:'ПРОЕКТНЫЙ ОФИС / ИЗ ЧАТА В ВАШУ CRM',copy:[['01 / ПОРУЧЕНИЕ','Поручение приходит<br> в рабочий чат.','Фиксируем задачу из переписки, чтобы она не потерялась среди сообщений. Система разбирает, что нужно сделать.'],['02 / РАСПРЕДЕЛЕНИЕ','У задачи появляются<br> ответственный и срок.','Бот предлагает параметры поручения. Сотрудник проверяет и подтверждает исполнителя, содержание и дату.'],['03 / ВАША CRM','Поручение —<br> в рабочей системе.','После подтверждения задача передаётся в CRM. Команда видит исполнителей, сроки и статусы. ЮДжайл — один из реализованных примеров.']],camera:{left:540,width:250,top:96,end:430,zoom:1.72,rx:5,ry:9,rz:2,extraX:10,extraY:-24,extraZ:-5,pan:.17}},
 finance:{label:'ФИНАНСЫ / 1С, СВЕРКИ И АНАЛИТИКА',copy:[['01 / ИСХОДНЫЕ ДАННЫЕ','1С. Таблицы.<br> Платёжный календарь.','Платёжный календарь, таблицы и справочники 1С. Подключаем нужные данные, чтобы не переносить их вручную.'],['02 / СВЕРКА','Сверяем данные.<br> Готовим черновики.','Система сопоставляет реквизиты, проверяет условия и готовит данные для проверки сотрудником.'],['03 / ФИНАНСОВЫЙ РЕЗУЛЬТАТ','Финансы —<br> в понятной сводке.','Сотрудник получает подготовленные данные и черновики. Важные действия выполняются после подтверждения.']],camera:{left:530,width:260,top:96,end:430,zoom:1.7,rx:17,ry:-5,rz:-1,extraX:9,extraY:-10,extraZ:3,pan:.17}},
 content:{label:'КОНТЕНТ / ОТ СЦЕНАРИЯ ДО ПУБЛИКАЦИИ',copy:[['01 / ИДЕЯ И СЦЕНАРИЙ','Начинаем с вашей<br> темы и аудитории.','Разрабатываем идею, сюжет и визуальный стиль. Ролик, мультфильм или дизайн — под задачу заказчика.'],['02 / ПРОИЗВОДСТВО','Сцены. Анимация.<br> Озвучка и монтаж.','Создаём визуальные сцены и персонажей, готовим звук и собираем материалы в единый ролик.'],['03 / ГОТОВЫЙ КОНТЕНТ','От сценария —<br> до публикации.','Готовый материал проходит согласование. Адаптируем формат под площадку и организуем итоговую публикацию.']],camera:{left:520,width:280,top:115,end:445,zoom:1.65,rx:4,ry:-8,rz:-3,extraX:7,extraY:17,extraZ:6,pan:.14}}
 };
 const clamp=x=>Math.max(0,Math.min(1,x)),smooth=(a,b,x)=>{const t=clamp((x-a)/(b-a));return t*t*(3-2*t);};
 const playButton=scene.querySelector('.cinema-play');
 let kind='docs',value=0,currentStage=-1,scrollFrame=0,tween=0,swap=null,revision=0,resetting=false,resetFrame=0,replayFrame=0,replayAllowed=false,explicitPlay=false,firstMobilePlay=false,playElapsed=0,pausedReplay=false,stageEffects=[];
 function sceneTop(){return compact.matches||reduced.matches?0:parseFloat(getComputedStyle(scene).top)||178;}
 function setProgress(p,forcedStage){
  value=clamp(p);const width=scene.clientWidth,height=scene.clientHeight,c=profiles[kind].camera;
  const fit=Math.min(.96,width*.70/820,Math.max(.42,(height-340)/460));
  const explode=smooth(.18,.43,value)*(1-smooth(.55,.76,value)),focus=smooth(.62,.94,value),verify=smooth(.12,.57,value);
  const finalScale=Math.min(fit*c.zoom,(height*.86-90)/(c.end-c.top));
  const scale=fit*(1+.02*explode)+(finalScale-fit)*focus;
  const x=width*c.pan*explode+(width*.23-(c.left+c.width/2-410)*finalScale)*focus;
  const y=-35*explode+(-height*.48+(230-c.top)*finalScale)*focus;
  const vars={'--scene-p':value.toFixed(4),'--result-bloom':smooth(.65,.96,value).toFixed(4),'--camera-x':x.toFixed(2)+'px','--camera-y':y.toFixed(2)+'px','--camera-scale':scale.toFixed(4),'--camera-rx':(c.rx+c.extraX*explode-c.rx*focus).toFixed(2)+'deg','--camera-ry':(c.ry+c.extraY*explode-c.ry*focus).toFixed(2)+'deg','--camera-rz':(c.rz+c.extraZ*explode-c.rz*focus).toFixed(2)+'deg','--explode':explode.toFixed(4),'--focus':focus.toFixed(4),'--verify':verify.toFixed(4),'--shell-alpha':Math.max(0,1-.65*explode-focus).toFixed(4)};
  for(const [name,v]of Object.entries(vars))scene.style.setProperty(name,v);
  const stage=forcedStage??(value<.27?0:value<.73?1:2);
  if(stage!==currentStage){currentStage=stage;scene.dataset.stage=String(stage);buttons.forEach((b,i)=>b.setAttribute('aria-pressed',String(i===stage)));chapters.forEach((c,i)=>{c.classList.toggle('is-current',i===stage);c.setAttribute('aria-hidden',String(i!==stage));});animateStage(stage);}
 }
 function writeKind(next){kind=next;scene.dataset.kind=next;scene.setAttribute('aria-labelledby','kind-'+next);scene.querySelector('.workspace').classList.add('bespoke-motion');scene.querySelector('.workspace').innerHTML=document.getElementById('profile-'+next).innerHTML;scene.querySelector('.cinema-topline>span').textContent=profiles[next].label;chapters.forEach((chapter,i)=>{const copy=profiles[next].copy[i];chapter.querySelector('.cinema-kicker').textContent=copy[0];chapter.querySelector('h3').innerHTML=copy[1];chapter.querySelector('p').textContent=copy[2];});setProgress(value,currentStage<0?0:currentStage);}
 // Reset both the timeline and its scroll position; resetting only the frame
 // would let the next scroll event restore the previous direction's ending.
 function instantScroll(top){
  const root=document.documentElement,previous=root.style.scrollBehavior;
  root.style.scrollBehavior='auto';
  try{scrollTo({top,behavior:'instant'});}
  catch{scrollTo({top,behavior:'auto'});}
  finally{root.style.scrollBehavior=previous;}
 }
 function stopPlayback(){
  stopReplay(false);
  cancelAnimationFrame(tween);tween=0;
  cancelAnimationFrame(scrollFrame);scrollFrame=0;
  cancelAnimationFrame(resetFrame);resetFrame=0;
  if(!compact.matches&&!reduced.matches)instantScroll(scrollY);
 }
 function updateHint(){const playing=Boolean(replayFrame);scene.querySelector('.cinema-hint').textContent=playing?'15 СЕКУНД · МОЖНО ПОСТАВИТЬ НА ПАУЗУ':pausedReplay?'ПАУЗА · ЧИТАЙТЕ В СВОЁМ ТЕМПЕ':compact.matches||reduced.matches?'ВЫБЕРИТЕ ЭТАП ИЛИ ЗАПУСТИТЕ ПРОСМОТР':'ПРОКРУТИТЕ ИЛИ ЗАПУСТИТЕ ПРОСМОТР';playButton.textContent=playing?'Ⅱ Пауза':pausedReplay?'▶ Продолжить':'▶ Смотреть с начала';playButton.setAttribute('aria-label',playing?'Приостановить сценарий':pausedReplay?'Продолжить сценарий':'Посмотреть сценарий с начала');}
 function stopReplay(cancelPending=true){if(pausedReplay)stageEffects.forEach(a=>{if(a.playState==='paused')a.finish();});if(cancelPending)replayAllowed=false;cancelAnimationFrame(replayFrame);replayFrame=0;pausedReplay=false;updateHint();}
 function playFromStart(rev,resume=false){
  if((reduced.matches&&!explicitPlay)||!replayAllowed)return;
  const offset=resume?playElapsed:0;pausedReplay=false;
  const began=performance.now()+(resume?0:420)-offset;
  const play=now=>{
   replayFrame=0;
   if(rev!==revision||resetting||(reduced.matches&&!explicitPlay)||!replayAllowed){updateHint();return;}
   playElapsed=Math.max(0,now-began);
   // Reading holds between short camera moves: Three 4.2-second reading holds with two 1.2-second camera moves.
   const progress=playElapsed<4200?0:playElapsed<5400?.5*smooth(4200,5400,playElapsed):playElapsed<9600?.5:playElapsed<10800?.5+.5*smooth(9600,10800,playElapsed):1;
   if(!compact.matches&&!reduced.matches){
    const start=scrollY+track.getBoundingClientRect().top-sceneTop();
    const range=track.offsetHeight-scene.offsetHeight;
    instantScroll(Math.max(0,start+range*progress));
   }
   setProgress(progress);
   if(playElapsed<15000)replayFrame=requestAnimationFrame(play);else replayAllowed=false;
   updateHint();
  };
  replayFrame=requestAnimationFrame(play);updateHint();
 }
 function animateStage(stage){
  stageEffects.forEach(a=>a.cancel());stageEffects=[];
  scene.querySelectorAll('[data-motion]').forEach(el=>el.setAttribute('aria-hidden',String(Number(el.dataset.motion)!==stage)));
  if(reduced.matches)return;
  const active=scene.querySelector('[data-motion="'+stage+'"]');if(!active)return;
  const entries={docs:[{opacity:0,translate:'0 30px'},{opacity:1,translate:'0 0'}],office:[{opacity:0,translate:'35px 0'},{opacity:1,translate:'0 0'}],finance:[{opacity:0,clipPath:'inset(0 100% 0 0)'},{opacity:1,clipPath:'inset(0 0% 0 0)'}],content:[{opacity:0,scale:'.92',translate:'0 20px'},{opacity:1,scale:'1',translate:'0 0'}]};
  active.querySelectorAll('[data-fx]').forEach((el,i)=>stageEffects.push(el.animate(entries[kind],{duration:1100,delay:250+i*230,easing:'cubic-bezier(.16,1,.3,1)',fill:'backwards'})));
  active.querySelectorAll('[data-draw]').forEach((path,i)=>{const length=path.getTotalLength();stageEffects.push(path.animate([{strokeDasharray:`${length} ${length}`,strokeDashoffset:length},{strokeDasharray:`${length} ${length}`,strokeDashoffset:0}],{duration:2500,delay:300+i*250,easing:'cubic-bezier(.2,.7,.2,1)',fill:'backwards'}));});
  const moving=active.querySelector('.moving-task');if(moving)stageEffects.push(moving.animate([{translate:'-100% 0',rotate:'-4deg'},{translate:'0 0',rotate:'0deg'}],{duration:1900,delay:700,easing:'cubic-bezier(.16,1,.3,1)',fill:'backwards'}));
  const playhead=active.querySelector('[data-playhead]');if(playhead)stageEffects.push(playhead.animate([{left:'21%',opacity:0},{opacity:1,offset:.05},{opacity:1,offset:.94},{left:'89%',opacity:0}],{duration:3000,delay:500,easing:'linear'}));
 }
 function restartKind(next,rev){
  if(rev!==revision)return;
  stopPlayback();
  if(!compact.matches&&!reduced.matches){
   const start=Math.max(0,scrollY+track.getBoundingClientRect().top-sceneTop());
   if(scrollY>start)instantScroll(start);
  }
  value=0;currentStage=-1;
  writeKind(next);
  if(compact.matches){const top=scrollY+scene.getBoundingClientRect().top-document.querySelector('.header').offsetHeight-12;scrollTo({top:Math.max(0,top),behavior:reduced.matches?'auto':'smooth'});}
  resetFrame=requestAnimationFrame(()=>{
   resetFrame=0;
   if(rev!==revision)return;
   resetting=false;
   fromScroll();
   playFromStart(rev);
  });
 }
 function selectKind(tab,focus=false,manual=false){
  const next=tab.dataset.kind;if(focus)tab.focus({preventScroll:true});
  kindTabs.forEach(t=>{const active=t===tab;t.setAttribute('aria-selected',String(active));t.tabIndex=active?0:-1;});
  const rev=++revision;resetting=true;swap?.cancel();stopPlayback();replayAllowed=true;explicitPlay=manual;firstMobilePlay=true;
  if(next===kind||reduced.matches||!scene.animate){restartKind(next,rev);return;}
  const visual=scene.querySelector('.workspace-camera');
  swap=visual.animate([{opacity:1,translate:'0 0'},{opacity:0,translate:'0 8px'}],{duration:160,easing:'ease-in',fill:'forwards'});
  swap.finished.then(()=>{
   if(rev!==revision)return;
   restartKind(next,rev);swap.cancel();
   swap=visual.animate([{opacity:0,transform:'translateY(18px) scale(.97)'},{opacity:1,transform:'translateY(0) scale(1)'}],{duration:700,easing:'cubic-bezier(.16,1,.3,1)'});
  }).catch(()=>{});
 }
 kindTabs.forEach((tab,i)=>{tab.addEventListener('click',()=>selectKind(tab));tab.addEventListener('keydown',e=>{let next;if(e.key==='ArrowRight')next=(i+1)%4;if(e.key==='ArrowLeft')next=(i+3)%4;if(e.key==='Home')next=0;if(e.key==='End')next=3;if(next!==undefined){e.preventDefault();selectKind(kindTabs[next],true);}});});
 // Hand the timeline back at its current frame as soon as the visitor interacts.
 for(const event of ['wheel','touchstart','pointerdown'])addEventListener(event,e=>{if(!compact.matches&&!e.target.closest?.('.cinema-play'))stopReplay();},{passive:true,capture:true});
 playButton.addEventListener('click',()=>{if(replayFrame){stopReplay();pausedReplay=true;stageEffects.forEach(a=>{if(a.playState==='running')a.pause();});updateHint();return;}if(pausedReplay){explicitPlay=true;replayAllowed=true;stageEffects.forEach(a=>{if(a.playState==='paused')a.play();});playFromStart(revision,true);return;}selectKind(kindTabs.find(tab=>tab.dataset.kind===kind),false,true);});
 addEventListener('keydown',event=>{if(!event.target.closest?.('.cinema-play')&&['ArrowUp','ArrowDown','PageUp','PageDown','Home','End',' '].includes(event.key))stopReplay();},{capture:true});
 function fromScroll(){scrollFrame=0;if(resetting||compact.matches||reduced.matches)return;const range=track.offsetHeight-scene.offsetHeight;if(range>0)setProgress((sceneTop()-track.getBoundingClientRect().top)/range);}
 addEventListener('scroll',()=>{if(!scrollFrame&&!resetting)scrollFrame=requestAnimationFrame(fromScroll);},{passive:true});
 buttons.forEach((button,index)=>button.addEventListener('click',()=>{if(resetting)return;stopReplay();const target=index/2;if(!compact.matches&&!reduced.matches){scrollTo({top:scrollY+track.getBoundingClientRect().top-sceneTop()+target*(track.offsetHeight-scene.offsetHeight),behavior:'smooth'});return;}cancelAnimationFrame(tween);if(reduced.matches){setProgress(target,index);return;}const start=value,began=performance.now();const animate=now=>{tween=0;const p=clamp((now-began)/700),ease=1-Math.pow(1-p,3);setProgress(start+(target-start)*ease,index);if(p<1)tween=requestAnimationFrame(animate);};tween=requestAnimationFrame(animate);}));
 function resize(){if(reduced.matches)stopReplay();updateHint();if(compact.matches||reduced.matches)setProgress(value);else fromScroll();}
 compact.addEventListener('change',resize);reduced.addEventListener('change',resize);new ResizeObserver(resize).observe(track);writeKind('docs');resize();
 // Mobile has no scroll timeline: start the first story when its visual enters
 // the screen, and let touch scrolling continue without cancelling playback.
 if('IntersectionObserver'in window){const entrance=new IntersectionObserver(entries=>{for(const entry of entries){if(entry.isIntersecting&&entry.intersectionRatio>=.5&&compact.matches&&!reduced.matches&&!firstMobilePlay){firstMobilePlay=true;replayAllowed=true;value=0;currentStage=-1;setProgress(0,0);playFromStart(revision);}}},{threshold:.5});entrance.observe(scene.querySelector('.cinema-visual'));}
})();


// Animate the work itself once it comes into view, without moving reading surfaces.
(() => {
 const reduced=matchMedia('(prefers-reduced-motion:reduce)');
 if(!('IntersectionObserver'in window))return;
 const ease='cubic-bezier(.2,.7,.2,1)';
 const observer=new IntersectionObserver(entries=>{for(const entry of entries){if(!entry.isIntersecting||entry.intersectionRatio<.35)continue;observer.unobserve(entry.target);if(reduced.matches)continue;
  const panel=entry.target;
  if(panel.matches('.market-visual'))panel.querySelectorAll('svg path').forEach((path,i)=>{if(i===0)return;const length=path.getTotalLength();path.animate([{strokeDasharray:`${length} ${length}`,strokeDashoffset:length},{strokeDasharray:`${length} ${length}`,strokeDashoffset:0}],{duration:1800,delay:(i-1)*230,easing:ease,fill:'backwards'});});
  if(panel.matches('.production-timeline')){panel.querySelectorAll('i').forEach((bar,i)=>bar.animate([{opacity:0,transform:'scaleX(.1)'},{opacity:1,transform:'scaleX(1)'}],{duration:650,delay:i*110,easing:ease,fill:'backwards'}));const playhead=panel.querySelector('b');playhead.animate([{opacity:0,transform:'translateX(0)'},{opacity:1,offset:.08},{opacity:1,offset:.9},{opacity:0,transform:`translateX(${panel.clientWidth-2}px)`}],{duration:3000,delay:450,easing:'linear'});}
 }},{threshold:.35});document.querySelectorAll('.market-visual,.production-timeline').forEach(el=>observer.observe(el));
})();

// The approach is a quiet relay: one visible card blooms at a time.
(() => {
 const reduced=matchMedia('(prefers-reduced-motion:reduce)'),cards=[...document.querySelectorAll('.approach-list li')],toggle=document.querySelector('.sequence-toggle');if(!cards.length||!('IntersectionObserver'in window))return;
 const visible=new Set();let timer=0,last=-1,paused=false,effects=[];
 function stop(clear=true){clearTimeout(timer);timer=0;if(clear){effects.forEach(a=>a.cancel());effects=[];cards.forEach(card=>card.classList.remove('is-blooming'));}}
 function next(){timer=0;if(paused||reduced.matches||document.hidden||!visible.size)return;const available=cards.map((card,i)=>({card,i})).filter(({card})=>visible.has(card));const item=available.find(item=>item.i>last)||available[0];last=item.i;effects.forEach(a=>a.cancel());effects=[];cards.forEach(card=>card.classList.toggle('is-blooming',card===item.card));
  item.card.querySelectorAll('.step-draw').forEach(path=>{const length=path.getTotalLength();effects.push(path.animate([{strokeDasharray:`${length} ${length}`,strokeDashoffset:length},{strokeDasharray:`${length} ${length}`,strokeDashoffset:0}],{duration:1200,delay:180,easing:'cubic-bezier(.2,.7,.2,1)',fill:'backwards'}));});
  item.card.querySelectorAll('.step-detail').forEach(el=>effects.push(el.animate(item.i===0?[{translate:'-12px -5px',opacity:.5},{translate:'4px 2px',opacity:1,offset:.65},{translate:'0 0',opacity:1}]:[{scale:'.65',opacity:.3},{scale:'1.12',opacity:1,offset:.65},{scale:'1',opacity:1}],{duration:1400,delay:180,easing:'cubic-bezier(.16,1,.3,1)'})));
  timer=setTimeout(next,2200);
 }
 const observer=new IntersectionObserver(entries=>{for(const entry of entries){if(entry.isIntersecting&&entry.intersectionRatio>=.25)visible.add(entry.target);else visible.delete(entry.target);}if(!visible.size)stop();else if(!timer&&!paused&&!reduced.matches)next();},{threshold:.25});cards.forEach(card=>observer.observe(card));
 toggle?.addEventListener('click',()=>{paused=!paused;toggle.textContent=paused?'▶ Продолжить':'Ⅱ Пауза анимации';toggle.setAttribute('aria-pressed',String(!paused));if(paused){stop(false);effects.forEach(a=>{if(a.playState==='running')a.pause();});}else{effects.forEach(a=>{if(a.playState==='paused')a.play();});timer=setTimeout(next,2200);}});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();else if(!paused)next();});reduced.addEventListener('change',()=>{stop();if(toggle)toggle.hidden=reduced.matches;if(!reduced.matches&&!paused)next();});if(toggle)toggle.hidden=reduced.matches;
})();

// Choreography for every content block: reading surfaces remain still afterwards.
(() => {
 const reduce=matchMedia('(prefers-reduced-motion:reduce)');if(!('IntersectionObserver'in window))return;
 const ease='cubic-bezier(.16,1,.3,1)',rise=[{opacity:0,translate:'0 28px'},{opacity:1,translate:'0 0'}];
 const show=(el,frames=rise,delay=0,duration=1000)=>{if(el&&!reduce.matches)el.animate(frames,{duration,delay,easing:ease,fill:'backwards'});};
 const callbacks=new Map();const watch=(selector,callback)=>document.querySelectorAll(selector).forEach(el=>callbacks.set(el,callback));
 watch('.pain .split',el=>{show(el.querySelector('h2'));});
 watch('.automation-explainer',el=>{show(el.querySelector('h3'),[{opacity:0,clipPath:'inset(0 0 100% 0)'},{opacity:1,clipPath:'inset(0 0 0% 0)'}]);});
 watch('.section-heading,.process-stories-heading',el=>{show(el.querySelector('h2'),[{opacity:0,translate:'0 36px'},{opacity:1,translate:'0 0'}]);show(el.querySelector('p'),rise,170);});
 watch('.direction-grid article',el=>show(el,[{opacity:0,translate:'0 35px',scale:'.97'},{opacity:1,translate:'0 0',scale:'1'}]));
 watch('.case-feature .case-left',el=>show(el,[{opacity:0,translate:'-28px 0'},{opacity:1,translate:'0 0'}]));watch('.case-feature .case-right',el=>show(el,[{opacity:0,translate:'32px 0',scale:'.96'},{opacity:1,translate:'0 0',scale:'1'}],0,1200));watch('.case-explanation>div',el=>show(el));
 watch('.file-flow',el=>el.querySelectorAll('[data-file]').forEach((file,i)=>show(file,[{opacity:0,translate:i<2?'-15px 10px':'0 18px',rotate:i<2?'-6deg':'0deg'},{opacity:1,translate:'0 0',rotate:'0deg'}],i*350,1400)));
 watch('#case-rosatom .case-right',el=>el.querySelectorAll('.metric-pair>div,.big-metric').forEach((metric,i)=>show(metric,[{opacity:0,translate:'0 18px'},{opacity:1,translate:'0 0'}],i*250,1200)));
 watch('.process-story .story-title,.story-outcome',el=>show(el));watch('.story-capabilities li',el=>show(el,[{opacity:0,translate:'24px 0'},{opacity:1,translate:'0 0'}]));
 watch('.crm-statement',el=>{show(el.querySelector('h3'));show(el.querySelector('p'),rise,180);});
 watch('.integration-map',el=>{el.querySelectorAll('[data-node]').forEach((node,i)=>show(node,[{opacity:0,scale:'.8'},{opacity:1,scale:'1'}],i*150,1100));if(!reduce.matches)el.querySelectorAll('[data-connection]').forEach(path=>{const length=path.getTotalLength();path.animate([{strokeDasharray:`${length} ${length}`,strokeDashoffset:length},{strokeDasharray:`${length} ${length}`,strokeDashoffset:0}],{duration:2200,delay:300,easing:ease,fill:'backwards'});});});
 watch('.closing',el=>{show(el.querySelector('h2'),[{opacity:0,translate:'0 35px',scale:'.96'},{opacity:1,translate:'0 0',scale:'1'}],0,1300);show(el.querySelector('a'),rise,350);});
 watch('.pain-list>div',el=>show(el,[{opacity:0,translate:'32px 0'},{opacity:1,translate:'0 0'}]));watch('.explainer-copy p',el=>show(el));watch('.crm-methods',el=>el.querySelectorAll('span').forEach((chip,i)=>show(chip,[{opacity:0,translate:'0 16px',scale:'.9'},{opacity:1,translate:'0 0',scale:'1'}],i*140)));
 const observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting&&entry.intersectionRatio>=.12){observer.unobserve(entry.target);callbacks.get(entry.target)?.(entry.target);}},{threshold:.12,rootMargin:'0px 0px -25px 0px'});callbacks.forEach((_,el)=>observer.observe(el));
 const pain=document.querySelector('.pain');let origin=pain.getBoundingClientRect().top+scrollY,raf=0;
 function unfold(){raf=0;if(reduce.matches){pain.style.removeProperty('--unfold');return;}const p=Math.max(0,Math.min(1,(innerHeight*.95-(origin-scrollY))/(innerHeight*.7)));pain.style.setProperty('--unfold',String(p));}
 addEventListener('scroll',()=>{if(!raf)raf=requestAnimationFrame(unfold);},{passive:true});addEventListener('resize',()=>{origin=pain.getBoundingClientRect().top+scrollY;unfold();});reduce.addEventListener('change',unfold);unfold();
})();
