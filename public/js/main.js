
(function(){
  var d=document, root=d.documentElement;
  var reduce=matchMedia('(prefers-reduced-motion: reduce)');
  var WA='https://wa.me/393456101591';
  function $(s,c){return (c||d).querySelector(s)}
  function $$(s,c){return [].slice.call((c||d).querySelectorAll(s))}
  function clamp(v,a,b){return Math.max(a,Math.min(b,v))}

  /* ---- slower, smoother scrolling ---- */
  var lenis=null;
  if(window.Lenis&&!reduce.matches){
    try{
      lenis=new Lenis({lerp:.07,wheelMultiplier:.72,smoothWheel:true});
      (function raf(t){lenis.raf(t);requestAnimationFrame(raf)})(performance.now());
    }catch(e){lenis=null}
  }
  function go(y,fast){
    y=Math.max(0,Math.round(y));
    if(lenis)lenis.scrollTo(y,{duration:fast?1:1.6});
    else scrollTo({top:y,behavior:reduce.matches?'auto':'smooth'});
  }

  /* ---- clock: Bologna local time ---- */
  var ck=$('#clock');
  function tick(){try{ck.textContent=new Intl.DateTimeFormat('it-IT',{hour:'2-digit',minute:'2-digit',timeZone:'Europe/Rome'}).format(new Date())}catch(e){}}
  tick(); setInterval(tick,20000);

  /* ---- menu ---- */
  var mb=$('#menuBtn'), sheet=$('#sheet');
  function menu(open){
    mb.setAttribute('aria-expanded',open?'true':'false');mb.lastElementChild.textContent=open?'Chiudi':'Menu';
    sheet.classList.toggle('is-open',open);sheet.setAttribute('aria-hidden',open?'false':'true');
    d.body.style.overflow=open?'hidden':''; if(lenis){open?lenis.stop():lenis.start()}
  }
  mb.addEventListener('click',function(){menu(mb.getAttribute('aria-expanded')!=='true')});
  d.addEventListener('keydown',function(e){if(e.key==='Escape')menu(false)});

  /* ---- work: 3D scene ---- */
  var work=$('.work'), scene=$('#scene'), pin=$('#pin'), ghost=$('#ghost'), cnt=$('#cnt'), ticks=$('#ticks');
  var wks=$$('.wk'), N=wks.length, is3d=false, step=0, sceneTop=0, vh=innerHeight, active=-1, small=false;
  var parts=wks.map(function(w){return {el:w,info:$('.wk-info',w),card:$('.wk-card',w),view:$('.view',w),page:$('.page',w),phone:$('.phone',w),glare:$('.glare',w),tint:w.getAttribute('data-tint'),pap:w.classList.contains('wk--pap')}});
  wks.forEach(function(w,i){
    var b=d.createElement('button');b.type='button';
    b.setAttribute('aria-label','Lavoro '+(i+1)+': '+$('h3',w).textContent);
    b.addEventListener('click',function(){go(sceneTop+i*step,true)});
    ticks.appendChild(b);
  });
  var tickBtns=$$('button',ticks);
  function ease(x){return x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2}
  function measure(){
    vh=innerHeight; small=innerWidth<960;
    parts.forEach(function(p){
      if(p.pap||!p.view)return;
      p.card.style.setProperty('--shift',Math.max(0,p.page.offsetHeight-p.view.clientHeight)+'px');
    });
    if(is3d){
      step=Math.round(vh*(small?1.45:.92));
      scene.style.height=((N-1)*step+pin.offsetHeight+Math.round(vh*.25))+'px';
      sceneTop=scene.getBoundingClientRect().top+scrollY;
    }else{scene.style.height=''}
  }
  function set3d(on){
    if(on===is3d)return; is3d=on; work.classList.toggle('is-3d',on); active=-1;
    if(!on){parts.forEach(function(p){p.el.classList.remove('is-live','is-active');p.card.style.transform='';p.card.style.removeProperty('--op');p.info.style.transform=p.info.style.opacity='';p.card.style.removeProperty('--pan')});pin.style.removeProperty('--tint')}
    measure();
  }
  function renderScene(y){
    var P=(y-sceneTop)/step;
    if(P<0)P=Math.max(-1,(y-sceneTop)/vh);           /* the first work flies in as the scene arrives */
    P=Math.min(P,N-1);
    var a=clamp(Math.round(P),0,N-1), H=small?.34:.2;
    for(var i=0;i<N;i++){
      var p=parts[i], t=P-i, at=Math.abs(t);
      if(at>=1.04){if(p.live){p.live=false;p.el.classList.remove('is-live','is-active')}continue}
      if(!p.live){p.live=true;p.el.classList.add('is-live')}
      p.el.classList.toggle('is-active',i===a);
      var k=at<=H?0:ease(Math.min(1,(at-H)/(1-H)));
      var tx,ty,tz,rx,ry,rz;
      if(small){
        if(t<0){tx=0;ty=-k*4;tz=-k*1100;rx=k*18;ry=0;rz=0}
        else{tx=0;ty=-k*22;tz=-k*700;rx=-k*16;ry=0;rz=0}
      }
      else if(t<0){tx=k*16;ty=k*48;tz=-k*1500;rx=k*36;ry=-k*30;rz=k*5}
      else{tx=-k*22;ty=-k*46;tz=-k*1700;rx=-k*28;ry=k*36;rz=-k*7}
      var sc=1-k*.3, op=t>0?clamp(1-(k-.4)/.45,0,1):(k<.72?1:1-(k-.72)/.28);
      p.card.style.transform='translate3d('+tx.toFixed(2)+'vw,'+ty.toFixed(2)+'vh,'+tz.toFixed(0)+'px) rotateX('+rx.toFixed(2)+'deg) rotateY('+ry.toFixed(2)+'deg) rotateZ('+rz.toFixed(2)+'deg) scale('+sc.toFixed(3)+')';
      p.card.style.setProperty('--op',op.toFixed(3));
      p.card.style.setProperty('--pz',(70+k*150).toFixed(0)+'px');
      p.card.style.setProperty('--pan',clamp((t+H)/(2*H),0,1).toFixed(3));
      if(p.glare)p.glare.style.setProperty('--gx',(t*190).toFixed(1)+'%');
      var io=clamp(1-at/(small?.5:.42),0,1);
      p.info.style.opacity=io.toFixed(3);
      p.info.style.transform='translate3d(0,'+(-t*70).toFixed(1)+'px,0)';
    }
    ghost.style.setProperty('--p',clamp(P,0,N-1).toFixed(3));
    if(a!==active){
      active=a; pin.style.setProperty('--tint',parts[a].tint);
      cnt.textContent=(a<9?'0':'')+(a+1);
      tickBtns.forEach(function(b,i){b.setAttribute('aria-current',i===a?'true':'false')});
    }
  }

  /* ---- statement: words light up with the scroll ---- */
  var say=$('#say'), words=[];
  (function(){
    var out=d.createDocumentFragment();
    [].slice.call(say.childNodes).forEach(function(n){
      var key=n.nodeType===1;
      (n.textContent||'').split(/(\s+)/).forEach(function(t){
        if(!t)return;
        if(/^\s+$/.test(t)){out.appendChild(d.createTextNode(' '));return}
        var s=d.createElement('span');s.className='w'+(key?' k':'');s.textContent=t;out.appendChild(s);words.push(s);
      });
    });
    say.textContent='';say.appendChild(out);
  })();

  /* ---- footer name: set to the full width, letters rise ---- */
  var giant=$('#giant');
  (function(){
    var txt=giant.textContent;giant.textContent='';
    txt.split('').forEach(function(c,i){
      if(c===' '){giant.appendChild(d.createTextNode(' '));return}
      var b=d.createElement('b');b.textContent=c;b.style.setProperty('--i',i);if(c==='.')b.className='dot';giant.appendChild(b);
    });
  })();
  function fit(){ /* size is set in CSS from the measured width of the name */ }

  /* ---- one scroll loop for everything that follows the scroll ---- */
  var nav=$('#nav'), bar=$('#barCta'), hero=$('.hero'), heroTop=$('#heroTop'), contact=$('#contatti'), prog=$('#prog');
  var phs=$$('#strip .ph'), mq=$('#mq'), mqRows=$$('.mq-row');
  var ticking=false;
  function onScroll(){
    ticking=false;
    var y=scrollY, max=root.scrollHeight-innerHeight;
    nav.classList.toggle('is-pill',y>40);
    prog.style.transform='scaleX('+(max>0?clamp(y/max,0,1):0).toFixed(4)+')';
    var cr=contact.getBoundingClientRect();
    var inScene=is3d&&y>sceneTop-vh*.5&&y<sceneTop+scene.offsetHeight-vh*.6;
    bar.classList.toggle('is-on',y>hero.offsetHeight*.7&&cr.top>vh*.6&&!inScene);
    if(!reduce.matches){
      if(y<hero.offsetHeight){
        phs.forEach(function(p,i){p.style.setProperty('--py',(-y*(.1+(i%3)*.11)).toFixed(1)+'px')});
        heroTop.style.transform='translate3d(0,'+(y*.16).toFixed(1)+'px,0)';
        heroTop.style.opacity=clamp(1-y/(hero.offsetHeight*.75),0,1).toFixed(3);
      }
      var r=say.getBoundingClientRect();
      var n=Math.round(clamp((vh*.86-r.top)/(r.height+vh*.42),0,1)*words.length);
      for(var i=0;i<words.length;i++)words[i].classList.toggle('on',i<n);
      var mr=mq.getBoundingClientRect();
      if(mr.top<vh&&mr.bottom>0){
        var off=(mr.top+mr.height/2-vh/2);
        mqRows.forEach(function(row){var dir=+row.getAttribute('data-dir');row.style.transform='translate3d('+(dir*off*.32-(dir<0?0:innerWidth*.55)).toFixed(1)+'px,0,0)'});
      }
    }
    if(is3d)renderScene(y);
  }
  function req(){if(!ticking){ticking=true;requestAnimationFrame(onScroll)}}
  addEventListener('scroll',req,{passive:true});
  if(lenis)lenis.on('scroll',req);
  function relayout(){set3d(!reduce.matches&&innerWidth>=960);measure();fit();onScroll()}
  addEventListener('resize',relayout);
  relayout();
  addEventListener('load',relayout);
  if(d.fonts&&d.fonts.ready)d.fonts.ready.then(relayout);

  /* ---- in-page links: slow glide, and works are places inside the scene ---- */
  d.addEventListener('click',function(e){
    var a=e.target.closest('a[href^="#"]'); if(!a)return;
    var id=a.getAttribute('href').slice(1), el=d.getElementById(id); if(!el)return;
    e.preventDefault(); menu(false);
    var wi=wks.indexOf(el);
    if(wi>-1&&is3d){go(sceneTop+wi*step);return}
    if(id==='top'){go(0);return}
    go(el.getBoundingClientRect().top+scrollY-(id==='lavori'||id==='patto'?0:70));
  });

  /* ---- reveals ---- */
  $$('h2[data-rv]').forEach(function(h){var s=d.createElement('span');s.className='h2i';while(h.firstChild)s.appendChild(h.firstChild);h.appendChild(s)});
  var rv=$$('[data-rv]').concat([giant]);
  if('IntersectionObserver' in window&&!reduce.matches){
    var io=new IntersectionObserver(function(es){es.forEach(function(en){if(en.isIntersecting){en.target.classList.add('in');io.unobserve(en.target)}})},{rootMargin:'0px 0px -8% 0px',threshold:.08});
    rv.forEach(function(el){io.observe(el)});
  }else{rv.forEach(function(el){el.classList.add('in')})}

  /* ---- services: a preview of the example follows the pointer ---- */
  var peek=$('#peek');
  if(matchMedia('(hover:hover) and (pointer:fine)').matches&&!reduce.matches){
    var px=0,py=0,tx=0,ty=0,run=false,cur='';
    function loop(){px+=(tx-px)*.16;py+=(ty-py)*.16;peek.style.transform='translate3d('+px+'px,'+py+'px,0)';if(run)requestAnimationFrame(loop)}
    $$('.row[data-peek]').forEach(function(row){
      row.addEventListener('pointerenter',function(e){
        if(innerWidth<960)return;
        if(cur)peek.classList.remove(cur);cur=row.getAttribute('data-peek');peek.classList.add(cur,'is-on');
        tx=px=e.clientX+26;ty=py=e.clientY-190;run=true;loop();
      });
      row.addEventListener('pointermove',function(e){tx=Math.min(e.clientX+26,innerWidth-296);ty=e.clientY-190});
      row.addEventListener('pointerleave',function(){peek.classList.remove('is-on');run=false});
    });
  }

  /* ---- form: composes the WhatsApp text in the browser; nothing is sent from this site ---- */
  var form=$('#form'), status=$('#status'), fbtn=$('#f-btn');
  function bad(el,on){el.closest('.field').classList.toggle('bad',on);el.setAttribute('aria-invalid',on?'true':'false')}
  form.addEventListener('submit',function(e){
    e.preventDefault();
    var nome=form.elements.nome, msg=form.elements.messaggio, ok=true;
    [nome,msg].forEach(function(el){var b=!el.value.trim();bad(el,b);if(b&&ok){el.focus();ok=false}});
    if(!ok)return;
    var att=form.elements.attivita.value.trim();
    var t='Ciao Roberto, sono '+nome.value.trim()+(att?' ('+att+')':'')+'.\n'+
          'Mi serve: '+form.elements.tipo.value+'.\n\n'+msg.value.trim();
    var url=WA+'?text='+encodeURIComponent(t);
    var mail='mailto:info@robertomontiweb.it?subject='+encodeURIComponent('Richiesta dal sito')+'&body='+encodeURIComponent(t);
    status.textContent='';
    var p=d.createElement('p');
    p.appendChild(d.createTextNode('Messaggio preparato. Si apre WhatsApp con il testo già scritto: arriva solo quando premi invia nell\'app. Se WhatsApp non si è aperto, '));
    var a1=d.createElement('a');a1.href=url;a1.target='_blank';a1.rel='noopener';a1.textContent='aprilo da qui';
    var a2=d.createElement('a');a2.href=mail;a2.textContent='mandalo per email';
    p.appendChild(a1);p.appendChild(d.createTextNode(' oppure '));p.appendChild(a2);p.appendChild(d.createTextNode('.'));
    status.appendChild(p);status.classList.add('is-on');
    window.open(url,'_blank','noopener');
  });
  form.addEventListener('input',function(e){if(e.target.closest('.field.bad')&&e.target.value.trim())bad(e.target,false)});
  fbtn.disabled=false;
})();
