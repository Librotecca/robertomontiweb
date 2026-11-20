/* Home — concept "Pochi secondi". Un solo orologio: il ticker di GSAP. */
(function(){
  var d=document, root=d.documentElement;
  function $(s,c){return (c||d).querySelector(s)}
  function $$(s,c){return [].slice.call((c||d).querySelectorAll(s))}
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine=matchMedia('(hover:hover) and (pointer:fine)').matches;
  var G=window.gsap, ST=window.ScrollTrigger, SP=window.SplitText;
  var motion=!!(G&&ST)&&!reduce;
  var WA='https://wa.me/393456101591';
  if(G&&ST){G.registerPlugin(ST);if(SP)G.registerPlugin(SP);G.defaults({ease:'expo.out',duration:.9})}

  /* ---------- il cronometro: da quanto sei sulla pagina ---------- */
  var cBigS=$('[data-big-s]'), cBigC=$('[data-big-c]'), cBigT=$('[data-big-t]'), cBig=$('[data-clock="big"]'), cUnit=$('[data-clock-unit]'), cShort=$('[data-clock="short"]'), cLong=$('[data-clock="long"]'), sweep=$('#sweep');
  var last={}, heroOn=true;
  function p2(n){return (n<10?'0':'')+n}
  function put(el,k,v){if(el&&last[k]!==v){last[k]=v;el.textContent=v}}
  function comma(ms){return (ms/1000).toFixed(1).replace('.',',')}
  function clock(){
    var ms=performance.now(), s=ms/1000, S=Math.floor(s), m=Math.floor(S/60), mmss=p2(m)+':'+p2(S%60);
    put(cShort,'short',mmss); put(cLong,'long',mmss);
    if(!heroOn)return;
    if(S<60){put(cBigS,'bs',p2(S));put(cBigT,'bt',reduce?'':String(Math.floor(s*10)%10));if(reduce&&cBigC&&!last.c){last.c=1;cBigC.hidden=true}put(cUnit,'unit','s')}
    else{put(cBigS,'bs',m+':'+p2(S%60));put(cBigT,'bt','');if(cBigC&&last.c!==2){last.c=2;cBigC.hidden=true}put(cUnit,'unit','min')}
    if(sweep&&!reduce)sweep.style.transform='scaleX('+((ms%1000)/1000).toFixed(3)+')';
  }
  if(G)G.ticker.add(clock); else setInterval(clock,100);
  clock();
  if('IntersectionObserver' in window){
    new IntersectionObserver(function(es){heroOn=es[0].isIntersecting},{threshold:0}).observe($('.hero'));
  }

  /* ---------- parziali: a che punto del cronometro arrivi a ogni sezione ---------- */
  if('IntersectionObserver' in window){
    var lapIO=new IntersectionObserver(function(es){es.forEach(function(en){
      if(!en.isIntersecting)return; lapIO.unobserve(en.target);
      var S=Math.floor(performance.now()/1000), t=p2(Math.floor(S/60))+':'+p2(S%60);
      $$('[data-lap="'+en.target.id+'"]').forEach(function(el){el.textContent=el.hasAttribute('data-lap-head')?'parziale '+t:t;el.classList.add('is-set');
        if(motion&&el.hasAttribute('data-lap-head'))G.from(el,{autoAlpha:0,x:-10,duration:.6})});
      if(motion){var dot=$('.nav-time i');if(dot)G.fromTo(dot,{scale:3},{scale:1,duration:.7,overwrite:true})}
    })},{rootMargin:'0px 0px -40% 0px'});
    ['principio','lavori','servizi','metodo','contatti'].forEach(function(id){var el=d.getElementById(id);if(el)lapIO.observe(el)});
  }

  /* ---------- scroll morbido ---------- */
  var lenis=null;
  if(motion&&window.Lenis){
    try{
      lenis=new Lenis({lerp:.085,smoothWheel:true});
      lenis.on('scroll',ST.update);
      G.ticker.add(function(t){lenis.raf(t*1000)});
      G.ticker.lagSmoothing(0);
    }catch(e){lenis=null}
  }
  function go(target,off){
    if(lenis)lenis.scrollTo(target,{offset:off||0,duration:1.3});
    else{
      var y=typeof target==='number'?target:target.getBoundingClientRect().top+scrollY+(off||0);
      scrollTo({top:y,behavior:reduce?'auto':'smooth'});
    }
  }

  /* ---------- menu telefono ---------- */
  var nav=$('#nav'), mb=$('#menuBtn'), sheet=$('#sheet');
  function menu(open){
    if((mb.getAttribute('aria-expanded')==='true')===open)return;
    mb.setAttribute('aria-expanded',open?'true':'false');mb.lastElementChild.textContent=open?'Chiudi':'Menu';
    nav.classList.toggle('is-open',open);
    if(open){
      sheet.hidden=false; if(lenis)lenis.stop(); d.body.style.overflow='hidden';
      if(motion){G.fromTo(sheet,{clipPath:'inset(0% 0% 100% 0%)'},{clipPath:'inset(0% 0% 0% 0%)',duration:.7,ease:'expo.inOut'});
        G.from($$('nav a',sheet),{yPercent:60,autoAlpha:0,stagger:.07,duration:.7,delay:.25})}
      var f=$('nav a',sheet); if(f)f.focus();
    }else{
      d.body.style.overflow=''; if(lenis)lenis.start();
      if(motion)G.to(sheet,{clipPath:'inset(0% 0% 100% 0%)',duration:.5,ease:'expo.inOut',onComplete:function(){sheet.hidden=true}});
      else sheet.hidden=true;
    }
  }
  mb.addEventListener('click',function(){menu(mb.getAttribute('aria-expanded')!=='true')});
  d.addEventListener('keydown',function(e){
    if(e.key==='Escape'&&mb.getAttribute('aria-expanded')==='true'){menu(false);mb.focus()}
    if(e.key==='Tab'&&mb.getAttribute('aria-expanded')==='true'){
      var f=[mb].concat($$('a',sheet)), i=f.indexOf(d.activeElement);
      if(e.shiftKey&&i<=0){e.preventDefault();f[f.length-1].focus()}
      else if(!e.shiftKey&&i===f.length-1){e.preventDefault();f[0].focus()}
    }
  });

  /* ---------- link interni ---------- */
  d.addEventListener('click',function(e){
    var a=e.target.closest('a[href^="#"]'); if(!a)return;
    var id=a.getAttribute('href').slice(1), el=d.getElementById(id); if(!el)return;
    e.preventDefault(); menu(false);
    if(id==='top'){go(0);return}
    go(el,el.hasAttribute('data-case')||id==='lavori'?0:-64);
    if(history.replaceState)history.replaceState(null,'','#'+id);
  });

  /* ---------- ingresso dell'hero: tre risposte, ognuna con il suo tempo ---------- */
  var checks=$$('[data-check]');
  function mark(row){
    var out=$('[data-said]',row);
    row.classList.add('is-said');
    if(out){out.textContent='';var pre=d.createElement('span');pre.className='c-pre';pre.textContent='sullo schermo ';out.appendChild(pre);out.appendChild(d.createTextNode(motion?'in '+comma(performance.now())+' s':'subito'))}
    if(motion)G.fromTo($('.c-t i',row),{scale:0},{scale:1,duration:.5});
  }
  if(motion){
    var tl=G.timeline({defaults:{ease:'expo.out'}});
    tl.from('h1 .l>span',{yPercent:114,duration:1.05,stagger:.09},0)
      .from('.hero-kicker',{autoAlpha:0,y:10,duration:.6},.1)
      .from('.chrono',{autoAlpha:0,duration:.7},.3);
    checks.forEach(function(row,i){
      tl.from(row,{autoAlpha:0,y:20,duration:.55,onComplete:function(){mark(row)}},.5+i*.3);
    });
    tl.from('.hero-foot',{autoAlpha:0,y:16,duration:.8},1.25);
  }
  else checks.forEach(function(row){mark(row)});
  root.classList.add('has-motion');

  /* ---------- nome gigante: largo quanto la pagina ---------- */
  var giant=$('#giant'), gspan=giant&&giant.firstElementChild, gbox=0, gfont='';
  function fit(force){
    if(!gspan)return;
    var box=giant.clientWidth, fam=d.fonts&&d.fonts.check?String(d.fonts.check('800 100px Archivo')):'';
    if(!force&&box===gbox&&fam===gfont)return;
    gbox=box; gfont=fam;
    giant.style.fontSize='100px';
    var w=gspan.getBoundingClientRect().width;
    if(w>10)giant.style.fontSize=(100*box/w*.992).toFixed(2)+'px'; else giant.style.fontSize='';
  }
  fit(true); addEventListener('resize',function(){fit()}); addEventListener('load',function(){fit(true)});
  if(d.fonts&&d.fonts.load)d.fonts.load('800 100px Archivo').then(function(){fit(true);if(ST)ST.refresh()},function(){});

  /* ---------- modulo: compone il testo per WhatsApp nel browser, da qui non parte nulla ---------- */
  var form=$('#form'), status=$('#status'), fbtn=$('#f-btn');
  function bad(el,on){el.closest('.field').classList.toggle('bad',on);el.setAttribute('aria-invalid',on?'true':'false')}
  form.addEventListener('submit',function(e){
    e.preventDefault();
    var nome=form.elements.nome, msg=form.elements.messaggio, ok=true;
    [nome,msg].forEach(function(el){var b=!el.value.trim();bad(el,b);if(b&&ok){el.focus();ok=false}});
    if(!ok)return;
    var att=form.elements.attivita.value.trim();
    var t='Ciao Roberto, sono '+nome.value.trim()+(att?' ('+att+')':'')+'.\n'+'Mi serve: '+form.elements.tipo.value+'.\n\n'+msg.value.trim();
    var url=WA+'?text='+encodeURIComponent(t);
    var mail='mailto:info@robertomontiweb.it?subject='+encodeURIComponent('Richiesta dal sito')+'&body='+encodeURIComponent(t);
    status.textContent='';
    var p=d.createElement('p');
    p.appendChild(d.createTextNode('Messaggio preparato. Si apre WhatsApp con il testo già scritto: arriva solo quando premi invia nell\'app. Se WhatsApp non si è aperto, '));
    var a1=d.createElement('a');a1.href=url;a1.target='_blank';a1.rel='noopener';a1.className='tl';a1.textContent='aprilo da qui';
    var a2=d.createElement('a');a2.href=mail;a2.className='tl';a2.textContent='mandalo per email';
    p.appendChild(a1);p.appendChild(d.createTextNode(' oppure '));p.appendChild(a2);p.appendChild(d.createTextNode(' (info@robertomontiweb.it).'));
    status.appendChild(p);status.classList.add('is-on');
    try{window.open(url,'_blank','noopener')}catch(err){}
  });
  form.addEventListener('input',function(e){if(e.target.closest('.field.bad')&&e.target.value.trim())bad(e.target,false)});
  fbtn.disabled=false;

  /* Senza GSAP o con movimento ridotto: tutto visibile, fine. */
  var bar=$('#barCta');
  if(!(G&&ST)){return}

  /* ---------- nav: sfondo dopo l'hero, si nasconde scendendo e torna salendo ---------- */
  var contact=$('#contatti');
  ST.create({start:0,end:'max',onUpdate:function(self){
    var y=self.scroll();
    nav.classList.toggle('is-solid',y>24);
    nav.classList.toggle('is-hidden',self.direction===1&&y>innerHeight*.9);
    var cr=contact.getBoundingClientRect();
    bar.classList.toggle('is-on',self.direction===-1&&y>innerHeight*.7&&cr.top>innerHeight*.9);
  }});

  if(!motion){return}

  /* ---------- titoli di sezione: righe che salgono dietro una maschera ---------- */
  if(SP){
    $$('[data-split]').forEach(function(el){
      SP.create(el,{type:'lines',mask:'lines',autoSplit:true,linesClass:'ln',onSplit:function(s){
        return G.from(s.lines,{yPercent:112,duration:1.1,stagger:.09,scrollTrigger:{trigger:el,start:'top 88%',once:true}});
      }});
    });
  }

  /* ---------- blocchi: entrano a gruppi, in ordine di lettura ---------- */
  var rv=$$('[data-rv]');
  G.set(rv,{autoAlpha:0,y:28});
  ST.batch(rv,{start:'top 90%',once:true,onEnter:function(b){G.to(b,{autoAlpha:1,y:0,duration:.9,stagger:.08,overwrite:true})}});

  /* ---------- il principio: le parole si accendono con lo scroll ---------- */
  var say=$('#say');
  if(SP&&say){
    SP.create(say,{type:'words',autoSplit:true,onSplit:function(s){
      return G.fromTo(s.words,{opacity:.2},{opacity:1,ease:'none',stagger:.12,duration:.3,
        scrollTrigger:{trigger:say,start:'top 88%',end:'bottom 72%',scrub:.4}});
    }});
  }

  /* ---------- hero: i telefoni si alzano e ruotano in 3D con lo scroll ---------- */
  var phs=$$('#strip .ph');
  if(phs.length){
    G.from(phs,{autoAlpha:0,y:150,rotateX:-34,duration:1.2,stagger:.08,ease:'expo.out',delay:1.0,clearProps:'opacity,visibility'});
    phs.forEach(function(p,i){
      G.fromTo(p,{yPercent:0,rotateX:16,rotateY:(i-2.5)*-3.5,z:0},{yPercent:-(26+(i%3)*16),rotateX:0,rotateY:0,z:40,ease:'none',immediateRender:false,
        scrollTrigger:{trigger:'#strip',start:'top bottom',end:'bottom top',scrub:.7}});
    });
  }

  /* ---------- lavori: scena 3D, le schermate volano dentro e fuori mentre il testo scorre ---------- */
  var mm=G.matchMedia(), work=$('.work');
  mm.add('(min-width: 960px)',function(){
    var cases=$$('[data-case]'), shots=$$('[data-shot]'), N=cases.length, cnt=$('#cnt'), ticks=$$('#ticks i'), ghost=$('#ghost'), cur=-1, centers=[];
    var parts=shots.map(function(s){return {el:s,inn:$('.shot-in',s),glare:$('.glare',s),tint:s.getAttribute('data-tint')}});
    root.classList.add('has-stage');
    function ease3(x){return x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2}
    function measure(){centers=cases.map(function(c){var r=c.getBoundingClientRect();return r.top+scrollY+r.height/2})}
    function render(){
      if(!centers.length)return;
      var y=scrollY+innerHeight/2, P, H=.22;
      if(y<=centers[0])P=Math.max(-1,(y-centers[0])/(innerHeight*.75));
      else if(y>=centers[N-1])P=N-1;
      else{for(var i=0;i<N-1;i++){if(y<centers[i+1]){P=i+(y-centers[i])/(centers[i+1]-centers[i]);break}}}
      var a=G.utils.clamp(0,N-1,Math.round(P));
      for(var n=0;n<N;n++){
        var p=parts[n], t=P-n, at=Math.abs(t);
        if(at>=1.04){p.el.style.visibility='hidden';continue}
        p.el.style.visibility='visible';
        var k=at<=H?0:ease3(Math.min(1,(at-H)/(1-H))), tx,ty,tz,rx,ry,rz;
        if(t<0){tx=k*12;ty=k*46;tz=-k*1500;rx=k*36;ry=-k*30;rz=k*5}
        else{tx=-k*10;ty=-k*44;tz=-k*1700;rx=-k*28;ry=k*34;rz=-k*7}
        var sc=1-k*.3, op=t>0?G.utils.clamp(0,1,1-(k-.35)/.45):(k<.72?1:1-(k-.72)/.28);
        p.inn.style.transform='translate3d('+tx.toFixed(2)+'vw,'+ty.toFixed(2)+'vh,'+tz.toFixed(0)+'px) rotateX('+rx.toFixed(2)+'deg) rotateY('+ry.toFixed(2)+'deg) rotateZ('+rz.toFixed(2)+'deg) scale('+sc.toFixed(3)+')';
        p.inn.style.setProperty('--op',op.toFixed(3));
        p.inn.style.setProperty('--pz',(70+k*150).toFixed(0)+'px');
        if(p.glare)p.glare.style.setProperty('--gx',(t*190).toFixed(1)+'%');
      }
      if(ghost)ghost.style.setProperty('--p',G.utils.clamp(0,N-1,P).toFixed(3));
      if(a!==cur){cur=a;cnt.textContent='0'+(a+1);ticks.forEach(function(el,i){el.classList.toggle('on',i===a)});if(inCases)work.style.setProperty('--tint',parts[a].tint)}
    }
    var inCases=false;
    var st=ST.create({trigger:'#cases',start:'top 75%',end:'bottom 45%',onRefresh:function(){measure();render()},onUpdate:render,
      onToggle:function(self){inCases=self.isActive;if(inCases&&cur>-1)work.style.setProperty('--tint',parts[cur].tint);else work.style.removeProperty('--tint')}});
    var st2=ST.create({trigger:'#cases',start:'top bottom',end:'bottom top',onUpdate:render});
    cases.forEach(function(c,i){
      var page=$('[data-page]',shots[i]);
      if(page)G.fromTo(page,{yPercent:0},{yPercent:-33.2,ease:'none',scrollTrigger:{trigger:c,start:'top 30%',end:'bottom 25%',scrub:.8}});
      G.from([].slice.call(c.children),{autoAlpha:0,y:26,duration:.8,stagger:.07,scrollTrigger:{trigger:c,start:'top 62%',once:true}});
    });
    measure();render();ST.refresh();
    return function(){root.classList.remove('has-stage');work.style.removeProperty('--tint');parts.forEach(function(p){p.el.style.visibility='';p.inn.style.transform='';p.inn.style.removeProperty('--op')})};
  });
  mm.add('(max-width: 959px)',function(){
    $$('[data-case]').forEach(function(c){
      var kids=[].slice.call(c.children).filter(function(el){return !el.classList.contains('case-fig')}), fig=$('.case-fig',c);
      G.from(kids,{autoAlpha:0,y:22,duration:.8,stagger:.06,scrollTrigger:{trigger:c,start:'top 84%',once:true}});
      if(fig)G.fromTo(fig,{rotateX:26,y:46,scale:.9,autoAlpha:.4,transformPerspective:900},{rotateX:0,y:0,scale:1,autoAlpha:1,ease:'none',scrollTrigger:{trigger:fig,start:'top 96%',end:'top 52%',scrub:.6}});
    });
  });

  /* ---------- elenco progetti: righe che entrano, anteprima che segue il cursore ---------- */
  var rows=$$('.ix'), lis=$$('.index li');
  G.set(lis,{autoAlpha:0,y:24});
  ST.batch(lis,{start:'top 94%',once:true,onEnter:function(b){G.to(b,{autoAlpha:1,y:0,duration:.8,stagger:.07})}});
  var peek=$('#peek');
  if(fine&&peek){
    var pim=$('img',peek), px=G.quickTo(peek,'x',{duration:.55,ease:'power3.out'}), py=G.quickTo(peek,'y',{duration:.55,ease:'power3.out'}), pr=G.quickTo(peek,'rotate',{duration:.8,ease:'power3.out'}), lx=0, mx=0, my=0, on=false;
    rows.forEach(function(r){var i=new Image();i.src=r.getAttribute('data-preview')});
    function show(e){
      if(innerWidth<960)return;
      var src=e.currentTarget.getAttribute('data-preview'); if(pim.getAttribute('src')!==src)pim.setAttribute('src',src);
      if(!on){on=true;G.set(peek,{x:mx+28,y:my-peek.offsetHeight-18});G.fromTo(peek,{clipPath:'inset(100% 0% 0% 0%)'},{clipPath:'inset(0% 0% 0% 0%)',autoAlpha:1,duration:.6,overwrite:'auto'})}
    }
    function hide(){if(!on)return;on=false;G.to(peek,{autoAlpha:0,clipPath:'inset(0% 0% 100% 0%)',duration:.4,overwrite:'auto'})}
    rows.forEach(function(r){r.addEventListener('pointerenter',show)});
    $('#index').addEventListener('pointerleave',hide);
    addEventListener('pointermove',function(e){
      mx=e.clientX;my=e.clientY; if(!on)return;
      px(Math.min(mx+28,innerWidth-peek.offsetWidth-16));py(Math.max(16,my-peek.offsetHeight-18));pr(G.utils.clamp(-8,8,(mx-lx)*.5));lx=mx;
    },{passive:true});
    ST.create({start:0,end:'max',onUpdate:function(){if(on&&!$('#index').contains(d.elementFromPoint(mx,my)))hide()}});
  }

  /* ---------- metodo: la scala graduata si riempie, i passaggi scattano ---------- */
  var ruler=$('#ruler'), steps=$$('.step');
  if(ruler){
    mm.add('(min-width: 1100px)',function(){
      G.set(steps,{autoAlpha:.45});
      var t=G.timeline({scrollTrigger:{trigger:ruler,start:'top 86%',end:'top 48%',scrub:.5}});
      t.fromTo('#scaleFill',{scaleX:0},{scaleX:1,ease:'none',duration:4},0);
      steps.forEach(function(s,i){
        t.to(s,{autoAlpha:1,duration:.5,ease:'none',onStart:function(){s.classList.add('on')},onReverseComplete:function(){s.classList.remove('on')}},i+.02);
      });
      return function(){G.set(steps,{clearProps:'all'});steps.forEach(function(s){s.classList.remove('on')})};
    });
    mm.add('(max-width: 1099px)',function(){
      G.set(steps,{autoAlpha:0,y:24});
      ST.batch(steps,{start:'top 90%',once:true,onEnter:function(b){G.to(b,{autoAlpha:1,y:0,duration:.8,stagger:.08});b.forEach(function(s){s.classList.add('on')})}});
    });
  }

  /* ---------- contatti: le righe e il modulo entrano insieme ---------- */
  G.from('.laps li',{autoAlpha:0,y:26,duration:.8,stagger:.07,scrollTrigger:{trigger:'.laps',start:'top 82%',once:true}});
  G.from(['.contact .lead','.c-list li'],{autoAlpha:0,y:22,duration:.8,stagger:.06,scrollTrigger:{trigger:'.c-left',start:'top 78%',once:true}});
  G.from('#form',{clipPath:'inset(0% 0% 100% 0%)',duration:1.2,ease:'expo.inOut',scrollTrigger:{trigger:'#form',start:'top 85%',once:true},clearProps:'clipPath'});

  /* ---------- footer: il nome sale lettera per lettera ---------- */
  if(SP&&giant){
    var gs=SP.create(gspan,{type:'chars',mask:'chars'});
    G.from(gs.chars,{yPercent:108,duration:1.1,stagger:.035,scrollTrigger:{trigger:giant,start:'top 96%',once:true}});
  }

  addEventListener('load',function(){ST.refresh()});
})();
