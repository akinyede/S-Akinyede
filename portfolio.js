/* Progressive enhancement only. No accounts, trackers, third-party scripts, or score uploads. */
'use strict';
(() => {
 const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
 const root=document.documentElement, media=matchMedia('(prefers-reduced-motion: reduce)');
 const read=k=>{try{return localStorage.getItem(k)}catch{return null}}, save=(k,v)=>{try{localStorage.setItem(k,v)}catch{}};
 let manual=read('sa-motion-reduced')==='true', reduced=false;
 const motion=$('#motion-toggle');
 function applyMotion(){reduced=media.matches||manual;root.dataset.motion=reduced?'reduced':'full';if(motion){motion.setAttribute('aria-pressed',String(reduced));motion.textContent=media.matches?'Motion reduced':'Reduce motion';motion.disabled=media.matches;}if(reduced){document.getAnimations().forEach(a=>a.cancel());document.dispatchEvent(new Event('sa-stop-motion'));}}
 motion?.addEventListener('click',()=>{manual=!manual;save('sa-motion-reduced',String(manual));applyMotion()});media.addEventListener('change',applyMotion);applyMotion();
 function animate(el){if(!reduced&&el?.animate)el.animate([{opacity:.5,transform:'translateY(5px)'},{opacity:1,transform:'translateY(0)'}],{duration:240,easing:'ease-out'});}
 const menu=$('.menu-toggle'), nav=$('#navigation');
 function closeMenu(){nav?.classList.remove('open');menu?.setAttribute('aria-expanded','false');if(menu)menu.textContent='Menu';}
 menu?.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));menu.textContent=open?'Close':'Menu';nav?.classList.toggle('open',open);});
 nav?.addEventListener('click',e=>{if(e.target.closest('a'))closeMenu()});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&nav?.classList.contains('open')){closeMenu();menu.focus();}});
 document.addEventListener('click',e=>{if(!e.target.closest('.header-inner'))closeMenu()});
 if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){if(!reduced)e.target.classList.add('arrive');observer.unobserve(e.target)}}),{threshold:.08});$$('.reveal').forEach(el=>observer.observe(el));}
 const perspectives={
 umkc:{date:'Since 2021',place:'Kansas City',heading:'My work at UMKC.',note:'I joined UMKC as a research assistant in 2021. I later taught computer science and built the RIAT screening prototype.'},
 earlier:{date:'Before UMKC',place:'Infrastructure projects',heading:'Working with public utilities.',note:'At Tohl, I worked on GIS and asset-management systems for public infrastructure, including Lagos Water Corporation.'}
 };
 $$('[data-perspective]').forEach(button=>button.addEventListener('click',()=>{
 const state=perspectives[button.dataset.perspective];if(!state)return;
 $$('[data-perspective]').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
 $('.career-note').dataset.active=button.dataset.perspective;
 $('#career-date').textContent=state.date;$('#career-place').textContent=state.place;
 $('#career-heading').textContent=state.heading;$('#perspective-note').textContent=state.note;
 animate($('.career-content'));
 }));
 $('#copy-email')?.addEventListener('click',async()=>{const status=$('#copy-status'),email='oluwashayomi@gmail.com';try{await navigator.clipboard.writeText(email);status.textContent='Email copied.'}catch{status.textContent=email;}});
 // Six static, source-grounded panels remain readable without JavaScript.
 const views=$$('.detail-view'), viewIds=views.map(x=>x.id);
 const names={riat:'RIAT',crosssense:'CrossSense',simulator:'Process Simulator',experience:'Experience',publications:'Publications',credentials:'Credentials'};
 function route(initial=false){if(!views.length)return;const id=viewIds.includes(location.hash.slice(1))?location.hash.slice(1):'riat';views.forEach(v=>v.hidden=v.id!==id);$$('.explore-nav nav a').forEach(a=>{if(a.hash==='#'+id)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current')});document.title=names[id]+' | Samuel Akinyede';document.dispatchEvent(new Event('sa-stop-motion'));if(!initial){const h=$('h1',$('#'+id));h.tabIndex=-1;h.focus({preventScroll:true});window.scrollTo({top:0,behavior:'instant'});animate($('#'+id));}}
 if(views.length){route(true);window.addEventListener('hashchange',()=>route(false));}
 const tours={"riat": [["Collect the participant details.", "The workflow begins with an intake form."], ["Search the screening records.", "I integrated 276,433 federal screening rows. The figure counts rows, not unique organizations or people."], ["Work through the outcome.", "The prototype uses three-level outcome logic. This example shows the sequence only; it does not screen anyone."], ["Keep a report of the result.", "The prototype produces a PDF report. It also records completion times and provides an administrative view for validation."]], "simulator": [["How much can be recovered?", "Recovery is one quantity the simulator examines. A process with higher recovery still needs to be considered alongside its cost and environmental impact."], ["What would the process cost?", "I included capital and operating costs, with net present value and internal rate of return calculations."], ["Which assumptions matter most?", "Sensitivity and Monte Carlo analysis let the simulator explore changes in its assumptions. This page is an illustration rather than a running simulation."]]};
 $$('[data-walkthrough]').forEach(box=>{let current=0;const data=tours[box.dataset.walkthrough],buttons=$$('[data-step]',box);function select(i){current=i;buttons.forEach((b,j)=>b.setAttribute('aria-pressed',String(i===j)));$('.walk-detail h3',box).textContent=data[i][0];$('.walk-detail p',box).textContent=data[i][1];animate($('.walk-detail',box));}buttons.forEach(b=>b.addEventListener('click',()=>select(Number(b.dataset.step))));$('[data-walk-next]',box)?.addEventListener('click',()=>select((current+1)%data.length));});
 // Source-reported publication status. No live metadata or inferred acceptance.
 function filterPubs(filter){let count=0;$$('[data-pub]').forEach(p=>{p.hidden=filter!=='all'&&p.dataset.pub!==filter;if(!p.hidden)count++});$$('[data-pub-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.pubFilter===filter)));if($('#pub-count'))$('#pub-count').textContent=`${count} ${count===1?'entry':'entries'} · ${filter==='manuscript'?'manuscript statuses follow my résumé':filter==='published'?'published papers':'all entries'}`;}
 $$('[data-pub-filter]').forEach(b=>b.addEventListener('click',()=>filterPubs(b.dataset.pubFilter)));if($('#pub-count'))filterPubs('published');
 if($('#noise')){
  const noise=$('#noise'),context=$('#context'),view=$('#signal-view'),path=$('#signal-line'),rawpath=$('#raw-trace'),play=$('#signal-play');let phase=0,frame=0,running=false,start=0,last=0;
  function draw(){const raw=Array.from({length:141},(_,i)=>{const x=i/140;return Math.max(24,Math.min(164,101+20*Math.sin(x*22+phase)+(Number(noise.value)/100)*(25*Math.sin(x*134+phase*2)+12*Math.sin(x*219-phase))-(context.value==='shifted'?66/(1+Math.exp(-(x-.56)*18)):0)))});const smooth=raw.map((_,i)=>{const a=raw.slice(Math.max(0,i-4),Math.min(raw.length,i+5));return a.reduce((s,v)=>s+v,0)/a.length});const toPath=a=>a.map((y,i)=>`${i?'L':'M'}${(25+i*530/140).toFixed(2)} ${y.toFixed(2)}`).join(' ');path.setAttribute('d',toPath(view.value==='raw'?raw:smooth));rawpath.setAttribute('d',toPath(raw));rawpath.style.opacity=view.value==='raw'?'0':'1';}
  function update(){draw();$('#noise-value').textContent=noise.value+' / 100';$('#signal-note').textContent=context.value==='shifted'?'Notice how the trace shifts. Smoothing changes the fluctuations, not the unfamiliar setting.':view.value==='smoothed'?'The dashed line is the original trace. The solid one shows a moving average; a smoother line can still be wrong.':'Move the slider to add noise to the drawing. What would you trust about this signal?';$('#signal-desc').textContent=`Synthetic ${view.value} signal, noise ${noise.value}/100 drawing units, ${context.value} context. Not measured data.`;}
  function stop(){running=false;cancelAnimationFrame(frame);play.textContent='Play signal ▶';play.setAttribute('aria-pressed','false');}
  function tick(t){if(!running)return;if(reduced||document.hidden||t-start>8000){stop();return;}phase+=(last?Math.min(t-last,50):0)*.001;last=t;draw();frame=requestAnimationFrame(tick);}
  play.addEventListener('click',()=>{if(running){stop();return;}if(reduced){phase+=.7;draw();$('#signal-note').textContent='The signal moved forward one frame. Continuous motion is off.';return;}running=true;start=performance.now();last=0;play.textContent='Pause signal Ⅱ';play.setAttribute('aria-pressed','true');frame=requestAnimationFrame(tick);});
  noise.addEventListener('input',update);context.addEventListener('change',update);view.addEventListener('change',update);document.addEventListener('sa-stop-motion',stop);document.addEventListener('visibilitychange',()=>{if(document.hidden)stop()});if('IntersectionObserver'in window)new IntersectionObserver(es=>{if(es.some(e=>!e.isIntersecting))stop()}).observe($('.signal-lab'));update();
 }
 $('#print-resume')?.addEventListener('click',()=>window.print());
 // Preserve shared links from earlier versions of the portfolio.
 if(document.body.classList.contains('home-page')){const h=location.hash;const dest={'#play':'lab.html','#read-crosssense':'explore.html#crosssense','#read-proximity':'explore.html#crosssense','#read-vision':'explore.html#crosssense','#about':'index.html#profile'}[h];if(dest)location.replace(dest);}
 document.documentElement.dataset.portfolio='ready';
})();
