import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Link, NavLink, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';
import QRCode from 'qrcode';
import { EVENTS, type GucEvent } from './data/events';
import { ARCHIVE as DEMO_ARCHIVE } from './data/archive';
import { SITE } from './config';
import { supabase, supabaseConfigured } from './lib/supabase';
import './styles.css';

function usePageMeta(title: string, description: string) {
  useEffect(() => {
    document.title = title;
    const el = document.querySelector('meta[name="description"]') || document.createElement('meta');
    el.setAttribute('name', 'description');
    el.setAttribute('content', description);
    document.head.appendChild(el);
    window.scrollTo(0, 0);
  }, [title, description]);
}

function AmbientBackground(){return <div className="ambient-art" aria-hidden="true"><span className="ambient-grid"/><span className="ambient-noise"/><span className="ambient-scanline"/><span className="ambient-orbit orbit-1"/><span className="ambient-orbit orbit-2"/><span className="ambient-orbit orbit-3"/><span className="ambient-orbit orbit-4"/><span className="ambient-blob blob-1"/><span className="ambient-blob blob-2"/><span className="ambient-blob blob-3"/><span className="ambient-cross cross-1"/><span className="ambient-cross cross-2"/><span className="ambient-star star-1">âœ¦</span><span className="ambient-star star-2">âœ§</span><span className="ambient-star star-3">âœ¦</span><span className="ambient-ring-core"/><span className="ambient-diamond"/></div>}

function CustomCursor(){
  const root=useRef<HTMLDivElement|null>(null);
  useEffect(()=>{
    if(!window.matchMedia('(pointer:fine)').matches) return;
    const el=root.current; if(!el) return;
    const html=document.documentElement;
    let raf=0, x=0, y=0, nextX=0, nextY=0;
    const render=()=>{
      x=nextX; y=nextY;
      el.style.transform=`translate3d(${x}px,${y}px,0)`;
      raf=0;
    };
    const move=(e:MouseEvent)=>{
      nextX=e.clientX; nextY=e.clientY;
      html.style.setProperty('--mouse-x',((e.clientX/window.innerWidth-.5)*2).toFixed(3));
      html.style.setProperty('--mouse-y',((e.clientY/window.innerHeight-.5)*2).toFixed(3));
      if(!raf) raf=requestAnimationFrame(render);
      const target=e.target instanceof Element ? e.target : null;
      html.classList.toggle('cursor-hover', !!target?.closest('a,button,input,textarea,select,[role=button]'));
    };
    const down=()=>html.classList.add('cursor-pressed');
    const up=()=>html.classList.remove('cursor-pressed');
    window.addEventListener('mousemove',move,{passive:true});
    window.addEventListener('mousedown',down,{passive:true});
    window.addEventListener('mouseup',up,{passive:true});
    return()=>{
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove',move);
      window.removeEventListener('mousedown',down);
      window.removeEventListener('mouseup',up);
      html.classList.remove('cursor-hover','cursor-pressed');
    };
  },[]);
  return <div ref={root} className="cursor-system" aria-hidden="true"><div className="cursor-ring"/><div className="cursor-dot"/><div className="cursor-crosshair"/></div>
}

function ScrollParallax(){
  useEffect(()=>{
    const root=document.documentElement;
    let raf=0;
    const updateScroll=()=>{
      root.style.setProperty('--scroll-y',`${window.scrollY}px`);
      raf=0;
    };
    const onScroll=()=>{if(!raf) raf=requestAnimationFrame(updateScroll)};
    window.addEventListener('scroll',onScroll,{passive:true});
    updateScroll();
    return()=>{window.removeEventListener('scroll',onScroll);cancelAnimationFrame(raf)};
  },[]);
  return null;
}

function Particles() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let raf = 0;
    let particles: {x:number;y:number;vx:number;vy:number;r:number}[] = [];
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const coarse = window.matchMedia('(pointer:coarse)');
    const fpsInterval = 1000/30;
    let lastFrame=0;
    const resize = () => {
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = '100%'; canvas.style.height = '100%';
      ctx.setTransform(dpr,0,0,dpr,0,0);
      const count = motion.matches ? 0 : Math.min(coarse.matches ? 20 : 42, Math.floor(window.innerWidth / 28));
      particles = Array.from({length: count}, () => ({ x: Math.random()*innerWidth, y: Math.random()*innerHeight, vx:(Math.random()-.5)*.18, vy:(Math.random()-.5)*.18, r:Math.random()*1.3+.35 }));
    };
    resize(); window.addEventListener('resize', resize, {passive:true});
    const tick = (now:number) => {
      if(now-lastFrame<fpsInterval){raf=requestAnimationFrame(tick);return;}
      lastFrame=now;
      ctx.clearRect(0,0,innerWidth,innerHeight);
      for(let i=0;i<particles.length;i++){
        const p=particles[i];
        p.x += p.vx; p.y += p.vy;
        if(p.x<0||p.x>innerWidth)p.vx*=-1; if(p.y<0||p.y>innerHeight)p.vy*=-1;
        ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fillStyle='rgba(255,75,150,.42)'; ctx.fill();
        for(let j=i+1;j<particles.length;j++){
          const q=particles[j], dx=p.x-q.x, dy=p.y-q.y, d2=dx*dx+dy*dy;
          if(d2<6400){const alpha=.07*(1-Math.sqrt(d2)/80);ctx.strokeStyle=`rgba(255,45,95,${alpha})`;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);ctx.stroke();}
        }
      }
      raf=requestAnimationFrame(tick);
    };
    raf=requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas className="particles" ref={canvasRef} aria-hidden="true" />;
}

function Layout({children}:{children:React.ReactNode}) {
  const [open,setOpen]=useState(false);
  const location=useLocation();
  useEffect(()=>setOpen(false),[location.pathname]);
  const nav=[['/','Home'],['/events','Events'],['/donate','Donate'],['/join','Join Us'],['/archive','Archives'],['/about','About Us']];
  return <div className="app-shell"><AmbientBackground/><Particles/><CustomCursor/><ScrollParallax/><header className="site-header"><div className="wrap nav-wrap"><Link className="brand" to="/"><span className="brand-mark"><i>G</i><b>U</b><em>C</em><span className="brand-spark">âœ¦</span></span><span className="brand-copy"><strong>GUC</strong><small>Girl Up Conquistadors</small></span><span className="brand-arrow">â†—</span></Link><button className={`menu-btn ${open?'is-open':''}`} onClick={()=>setOpen(v=>!v)} aria-expanded={open} aria-label={open?'Close menu':'Open menu'}><span/><span/><span/><b className="menu-pulse"/></button><nav className={open?'nav open':'nav'}>{nav.map(([href,label])=><NavLink key={href} to={href} end={href==='/' } className={({isActive})=>isActive?'active':''}>{label}</NavLink>)}</nav><Link className="header-cta" to="/donate"><span className="cta-pulse"/> <span>Back the mission</span><b>â†—</b></Link></div></header>{children}<footer className="footer"><div className="wrap footer-grid"><div><div className="footer-brand">GUC<span> / Girl Up Conquistadors</span></div><p>Youth-led action for girls who deserve access, agency, safety, and a future built on their terms.</p></div><div><h4>Navigate</h4><Link to="/about">About</Link><Link to="/events">Events</Link><Link to="/archive">Archive</Link><Link to="/join">Join Us</Link></div><div><h4>Contact</h4><a href={`mailto:${SITE.email}`}>{SITE.email}</a><a href={`tel:${SITE.phone}`}>{SITE.phone}</a><span>{SITE.locationAddress}</span></div></div><div className="wrap footer-bottom"><span>Â© {new Date().getFullYear()} Girl Up Conquistadors</span><span>Configure contact + donation details before launch.</span></div></footer></div>
}

function SectionHeader({eyebrow,title,copy}:{eyebrow:string;title:string;copy:string}){return <div className="section-header"><span className="eyebrow">{eyebrow}</span><h2>{title}</h2><p>{copy}</p></div>}

function Home(){
  usePageMeta('Home | Girl Up Conquistadors',SITE.description);
  const heroRef=useRef<HTMLElement|null>(null);
  useEffect(()=>{
    const hero=heroRef.current; if(!hero) return;
    const onMove=(e:PointerEvent)=>{
      const r=hero.getBoundingClientRect();
      hero.style.setProperty('--reveal-x',`${e.clientX-r.left}px`);
      hero.style.setProperty('--reveal-y',`${e.clientY-r.top}px`);
      hero.style.setProperty('--hero-move-x',`${((e.clientX-r.left)/r.width-.5)*2}`);
      hero.style.setProperty('--hero-move-y',`${((e.clientY-r.top)/r.height-.5)*2}`);
    };
    hero.addEventListener('pointermove',onMove,{passive:true});
    return()=>hero.removeEventListener('pointermove',onMove);
  },[]);
  return <><main><section ref={heroRef} className="hero home-hero-reveal"><div className="hero-reveal-art"/><div className="hero-orb orb-a"/><div className="hero-orb orb-b"/><div className="hero-slab slab-a"/><div className="hero-slab slab-b"/><div className="hero-rings"/><div className="hero-wordmark">GUC//01</div><div className="wrap hero-inner"><div className="hero-copy"><span className="kicker">YOUTH-LED â€¢ IMPACT-DRIVEN â€¢ UNAPOLOGETIC</span><h1>Make room.<br/><em>Take space.</em><br/>Move the future.</h1><p>{SITE.tagline} We build practical pathways for girls and young women to learn, lead, organise, and change the rooms around them.</p><div className="hero-actions"><Link to="/join" className="btn btn-primary">Join the movement â†—</Link><Link to="/about" className="btn btn-ghost">Our story</Link></div><div className="micro-proof"><span>01 / education</span><span>02 / leadership</span><span>03 / community</span></div></div><div className="hero-card" data-parallax="0.08"><div className="hero-card-line"><span>FIELD NOTE 026</span><span>LIVE / ACTION</span></div><div className="hero-card-number">+<span>18</span></div><p>community actions scheduled across the next two quarters.</p><div className="scanline"/></div></div></section>
<section className="marquee"><div>EDUCATION <b>âœ¦</b> LEADERSHIP <b>âœ¦</b> SAFETY <b>âœ¦</b> DIGNITY <b>âœ¦</b> OPPORTUNITY <b>âœ¦</b> EDUCATION <b>âœ¦</b></div></section>
<section className="section"><div className="wrap stats-grid"><div className="stat"><strong>04</strong><span>core programme tracks</span></div><div className="stat"><strong>12+</strong><span>community partners, growing</span></div><div className="stat"><strong>1</strong><span>standard: girls deserve more</span></div></div></section>
<section className="section section-tight"><div className="wrap split"><SectionHeader eyebrow="01 / WHY GUC" title="Not charity theatre. Capacity, confidence, and collective action." copy="We focus on tangible interventions that let girls build skills, access resources, and become decision-makers in their own communities."/><div className="manifesto"><div><span>A</span><h3>Agency</h3><p>Tools to speak, decide, negotiate, and lead.</p></div><div><span>B</span><h3>Access</h3><p>Education, mentors, information, and opportunity.</p></div><div><span>C</span><h3>Action</h3><p>Campaigns that move from conversation to measurable change.</p></div></div></div></section>
<section className="section dark-band"><div className="wrap"><SectionHeader eyebrow="02 / NEXT ON THE GRID" title="Upcoming events" copy="Real dates. Real rooms. Real work. Click an event to inspect the details."/><div className="event-strip">{EVENTS.slice(0,3).map(ev=><EventCard key={ev.id} ev={ev}/>)}</div><Link className="text-link" to="/events">View the full calendar â†’</Link></div></section>
<section className="section"><div className="wrap callout"><div><span className="eyebrow">03 / JOIN THE CREW</span><h2>Bring curiosity. Leave impact.</h2></div><Link to="/join" className="btn btn-primary">Apply to join â†—</Link></div></section>
</main></>}

function EventCard({ev}:{ev:GucEvent}){const date=new Date(ev.date+'T12:00:00');return <div className="event-card"><div className="event-date"><span>{date.toLocaleDateString('en-IN',{month:'short'})}</span><strong>{date.getDate()}</strong><span>{date.getFullYear()}</span></div><div><span className="tag">{ev.category}</span><h3>{ev.title}</h3><p>{ev.overview}</p><small>{ev.location}</small></div></div>}

function About(){usePageMeta('About | Girl Up Conquistadors','Mission, history, values, and contact location for Girl Up Conquistadors.');return <main className="page"><div className="wrap page-hero"><span className="eyebrow">ABOUT / GUC</span><h1>We believe girls are not a â€œfuture constituencyâ€. They are the present.</h1><p>GUC exists to turn that premise into infrastructure: skills, peer networks, mentors, safe spaces, and community-led action.</p></div><section className="section"><div className="wrap split"><SectionHeader eyebrow="MISSION" title="Build power that lasts beyond one campaign." copy="Our work connects learning with action. A workshop should lead somewhere. A campaign should leave skills behind. And every programme should make it easier for girls to claim space in rooms that were not designed with them in mind."/><div className="big-quote">â€œThe objective is not to create louder girls. It is to create girls who know they do not need permission.â€</div></div></section><section className="section dark-band"><div className="wrap"><SectionHeader eyebrow="HISTORY / A LIVING TIMELINE" title="From a small circle to a civic platform." copy="Use the timeline below as the editable narrative of GUC's growth."/><div className="timeline"><Timeline year="01" title="The first circle" text="A small group begins by pooling skills, contacts, and a willingness to do the unglamorous work."/><Timeline year="02" title="Programmes emerge" text="Education, leadership, safety, and community action become repeatable programme tracks."/><Timeline year="03" title="Community network" text="Partners, mentors, volunteers, and young organisers turn individual efforts into a wider network."/><Timeline year="04" title="The next chapter" text="GUC scales the archive, event programme, and volunteer base without losing the human core."/></div></div></section><section className="section"><div className="wrap"><SectionHeader eyebrow="LOCATION" title="Meetings happen somewhere. Configure the exact pin before launch." copy="The embedded map below is deliberately a placeholder so a real address is never fabricated."/><div className="map-placeholder"><div className="map-grid"/><div className="map-pin">âœ¦</div><div className="map-label"><strong>{SITE.locationLabel}</strong><span>{SITE.locationAddress}</span></div></div></div></section><section className="section"><div className="wrap cards-3"><Info title="Dignity first" text="People are not programme outputs. Every interaction should respect autonomy, privacy, and choice."/><Info title="Youth-led" text="Young people help set priorities, run activities, and shape what gets built next."/><Info title="Evidence + imagination" text="We value measurement, but we refuse to confuse neat dashboards with actual change."/></div></section></main>}
function Timeline({year,title,text}:{year:string;title:string;text:string}){return <div className="timeline-item"><span>{year}</span><div><h3>{title}</h3><p>{text}</p></div></div>}
function Info({title,text}:{title:string;text:string}){return <article className="info-card"><span className="card-num">Ã—</span><h3>{title}</h3><p>{text}</p></article>}
function Join() {
  usePageMeta(
    'Join Us | Girl Up Conquistadors',
    'Apply to volunteer or contribute your skills to Girl Up Conquistadors.'
  );

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError('');
    setStatus('loading');

    // Capture the form element before the async request.
    // React's event target may no longer be available after await.
    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const r = await fetch('/api/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(Object.fromEntries(formData.entries())),
      });

      const data = await r.json().catch(() => ({}));

      if (!r.ok) {
        throw new Error(
          data.error || 'We could not send your application.'
        );
      }

      // Reset the captured form safely after a successful submission.
      form.reset();
      setStatus('success');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Something went wrong. Please try again.'
      );
      setStatus('error');
    }
  };

  return (
    <main className="page">
      <div className="wrap page-hero compact">
        <span className="eyebrow">JOIN / GUC</span>

        <h1>
          Bring a skill. Bring a question. Bring a point of view.
        </h1>

        <p>
          Tell us where you want to plug in. The form is wired for a Vercel
          serverless email endpoint.
        </p>
      </div>

      <section className="section">
        <div className="wrap form-layout">
          <form
            className="guc-form"
            onSubmit={submit}
            noValidate
          >
            <div className="form-row">
              <Field
                label="Full name"
                name="name"
                required
              />

              <Field
                label="Email"
                name="email"
                type="email"
                required
              />

              <Field
                label="Phone"
                name="phone"
                required
              />
            </div>

            <div className="form-row">
              <Field
                label="Age / date of birth"
                name="dob"
                required
              />

              <Field
                label="City"
                name="city"
                required
              />

              <Field
                label="Student / occupation"
                name="occupation"
                required
              />
            </div>

            <div className="form-row">
              <label>
                <span>Areas of interest</span>

                <select name="interest" required>
                  <option value="">Choose one</option>
                  <option>Education</option>
                  <option>Leadership</option>
                  <option>Health & dignity</option>
                  <option>Campaigns</option>
                  <option>Media & design</option>
                  <option>Operations</option>
                  <option>Fundraising</option>
                </select>
              </label>

              <label>
                <span>Availability</span>

                <select name="availability" required>
                  <option value="">Choose one</option>
                  <option>2â€“4 hrs / month</option>
                  <option>5â€“8 hrs / month</option>
                  <option>8+ hrs / month</option>
                  <option>Project based</option>
                </select>
              </label>
            </div>

            <label>
              <span>Relevant experience</span>

              <textarea
                name="experience"
                rows={4}
                placeholder="A few lines about what you have built, organised, studied, or learned."
                required
              />
            </label>

            <label>
              <span>Why do you want to join?</span>

              <textarea
                name="why"
                rows={5}
                required
              />
            </label>

            <label
              className="honeypot"
              aria-hidden="true"
            >
              <span>Website</span>

              <input
                name="website"
                tabIndex={-1}
                autoComplete="off"
              />
            </label>

            <label className="check">
              <input
                type="checkbox"
                name="consent"
                value="yes"
                required
              />

              <span>
                I agree that GUC may contact me regarding volunteering and
                programme opportunities.
              </span>
            </label>

            {status === 'error' && (
              <div
                className="alert error"
                role="alert"
              >
                {error}
              </div>
            )}

            {status === 'success' && (
              <div
                className="alert success"
                role="status"
              >
                Application sent. The inbox has been notified.
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary wide"
              disabled={status === 'loading'}
            >
              {status === 'loading'
                ? 'Sendingâ€¦'
                : 'Submit application â†—'}
            </button>

            <small className="form-note">
              Destination email is configured by{' '}
              <code>CONTACT_EMAIL</code> on Vercel. Never put that secret in
              client-side code.
            </small>
          </form>

          <aside className="side-note">
            <span className="eyebrow">WHAT HAPPENS NEXT</span>

            <ol>
              <li>We read your application.</li>
              <li>We match interests to current work.</li>
              <li>We get in touch using the details you provided.</li>
            </ol>

            <div className="contact-block">
              <span>Email</span>

              <a href={`mailto:${SITE.email}`}>
                {SITE.email}
              </a>

              <span>Phone</span>

              <a href={`tel:${SITE.phone}`}>
                {SITE.phone}
              </a>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
function Field({label,name,type='text',required=false}:{label:string;name:string;type?:string;required?:boolean}){return <label><span>{label}{required?' *':''}</span><input name={name} type={type} required={required}/></label>}

function EventsPage(){usePageMeta('Events | Girl Up Conquistadors','Interactive calendar of Girl Up Conquistadors planned events.');const [cursor,setCursor]=useState(new Date());const [selected,setSelected]=useState<GucEvent|null>(null);const y=cursor.getFullYear(),m=cursor.getMonth();const monthName=cursor.toLocaleDateString('en-IN',{month:'long',year:'numeric'});const first=new Date(y,m,1).getDay();const days=new Date(y,m+1,0).getDate();const cells=Array.from({length:Math.ceil((first+days)/7)*7},(_,i)=>{const d=i-first+1;return d>0&&d<=days?d:null});const map=useMemo(()=>new Map(EVENTS.map(e=>[e.date,e])),[]);return <main className="page"><div className="wrap page-hero compact"><span className="eyebrow">EVENT GRID / CALENDAR</span><h1>Dates with intent.</h1><p>Choose a day with an event marker. A compact detail window gives the overview and tentative location.</p></div><section className="section"><div className="wrap calendar-shell"><div className="calendar-head"><button className="icon-btn" onClick={()=>setCursor(new Date(y,m-1,1))} aria-label="Previous month">â€¹</button><h2>{monthName}</h2><div className="calendar-head-actions"><button className="ghost-btn" onClick={()=>setCursor(new Date())}>Today</button><button className="icon-btn" onClick={()=>setCursor(new Date(y,m+1,1))} aria-label="Next month">â€º</button></div></div><div className="week-row">{['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d=><span key={d}>{d}</span>)}</div><div className="calendar-grid">{cells.map((day,i)=>{const dateStr=day?`${y}-${String(m+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`:'';const ev=day?map.get(dateStr):undefined;return <button key={i} className={day?'day-cell':'day-cell empty'} disabled={!day} onClick={()=>ev&&setSelected(ev)}>{day&&<><span className="day-num">{day}</span>{ev&&<span className="event-dot"/>}{ev&&<span className="day-title">{ev.title}</span>}</>}</button>})}</div></div></section>{selected&&<Modal onClose={()=>setSelected(null)}><EventModal ev={selected}/></Modal>}</main>}
function EventModal({ev}:{ev:GucEvent}){const d=new Date(ev.date+'T12:00:00');return <div className="modal-event"><span className="eyebrow">{ev.category}</span><h2>{ev.title}</h2><div className="modal-meta"><span>{d.toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</span><span>{ev.location}</span></div><p>{ev.overview}</p></div>}
function Modal({children,onClose}:{children:React.ReactNode;onClose:()=>void}){return <div className="modal-backdrop" onMouseDown={e=>{if(e.currentTarget===e.target)onClose()}}><div className="modal"><button className="modal-close" onClick={onClose} aria-label="Close">Ã—</button>{children}</div></div>}

function Donate(){usePageMeta('Donate | Girl Up Conquistadors','Support Girl Up Conquistadors through UPI or bank transfer.');const [qr,setQr]=useState('');const [copied,setCopied]=useState('');useEffect(()=>{QRCode.toDataURL(SITE.donation.upiUri,{margin:2,width:480,errorCorrectionLevel:'H'}).then(setQr);},[]);const copy=async(v:string,key:string)=>{await navigator.clipboard?.writeText(v);setCopied(key);setTimeout(()=>setCopied(''),1800)};return <main className="page"><div className="wrap page-hero compact"><span className="eyebrow">DONATE / FUND THE WORK</span><h1>Make the next action possible.</h1><p>Every contribution helps fund programme materials, venue access, dignity supplies, transport, documentation, and the boring infrastructure that turns ideas into work.</p></div><section className="section"><div className="wrap donate-layout"><div className="qr-card"><div className="qr-frame"><div className="qr-grid"/>{qr&&<img src={qr} alt="Donation QR code"/>}<span className="qr-corner top-left"/><span className="qr-corner top-right"/><span className="qr-corner bottom-left"/><span className="qr-corner bottom-right"/></div><div className="qr-caption"><span>SCAN / PAY</span><strong>{SITE.donation.upiId}</strong></div><button className="copy-btn" onClick={()=>copy(SITE.donation.upiId,'upi')}>{copied==='upi'?'Copied âœ“':'Copy UPI ID'}</button></div><div className="bank-card"><span className="eyebrow">BANK TRANSFER</span><h2>Direct support, no theatre.</h2><BankLine label="Account name" value={SITE.donation.accountName}/><BankLine label="Bank" value={SITE.donation.bankName}/><BankLine label="Account number" value={SITE.donation.accountNumber} copy={()=>copy(SITE.donation.accountNumber,'account')}/><BankLine label="IFSC" value={SITE.donation.ifsc} copy={()=>copy(SITE.donation.ifsc,'ifsc')}/><BankLine label="Branch" value={SITE.donation.branch}/>{copied==='account'||copied==='ifsc'?<div className="copy-toast">Copied.</div>:null}<div className="alert warning">These are configuration values. Replace them with the NGO's verified donation details before launch.</div></div></div></section></main>}
function BankLine({label,value,copy}:{label:string;value:string;copy?:()=>void}){return <div className="bank-line"><span>{label}</span><div><strong>{value}</strong>{copy&&<button onClick={copy} className="mini-copy">copy</button>}</div></div>}

type ArchiveImage={id:string;src:string;alt:string};
type ArchiveYear={year:string;months:{month:string;events:{id:string;name:string;images:ArchiveImage[]}[]}[]};
type ArchiveRow={id:string;year:number;month:number;event_name:string;storage_path:string;public_url:string;caption:string|null};

function Archive(){
  usePageMeta('Archive | Girl Up Conquistadors','Browse the Girl Up Conquistadors digital archive by year, month, and event.');
  const [years,setYears]=useState<ArchiveYear[]>([]);
  const [loading,setLoading]=useState(true);
  const [loadError,setLoadError]=useState('');
  const [year,setYear]=useState<string|null>(null);
  const [month,setMonth]=useState<{year:string;month:string}|null>(null);
  const [event,setEvent]=useState<{year:string;month:string;event:string}|null>(null);
  const [lightbox,setLightbox]=useState<string|null>(null);

  useEffect(()=>{
    let alive=true;
    const load=async()=>{
      setLoading(true);
      setLoadError('');

      if(!supabaseConfigured||!supabase){
        if(alive){
          setYears(DEMO_ARCHIVE);
          setLoading(false);
          setLoadError('Supabase is not configured in this deployment. Showing the built-in preview.');
        }
        return;
      }

      const {data,error}=await supabase
        .from('archive_images')
        .select('id,year,month,event_name,storage_path,public_url,caption,created_at')
        .order('year',{ascending:false})
        .order('month',{ascending:false})
        .order('created_at',{ascending:true});

      if(error){
        if(alive){
          setYears([]);
          setLoading(false);
          setLoadError(`Could not load the live archive: ${error.message}`);
        }
        return;
      }

      const grouped=new Map<string,ArchiveYear>();

      for(const row of (data||[])){
        const ys=String(row.year);
        const ms=new Date(2000,Number(row.month)-1,1).toLocaleDateString('en-IN',{month:'long'});

        let y=grouped.get(ys);
        if(!y){
          y={year:ys,months:[]};
          grouped.set(ys,y);
        }

        let m=y.months.find(v=>v.month===ms);
        if(!m){
          m={month:ms,events:[]};
          y.months.push(m);
        }

        const id=row.event_name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g,'-')
          .replace(/(^-|-$)/g,'');

        let ev=m.events.find(v=>v.id===id);
        if(!ev){
          ev={id,name:row.event_name,images:[]};
          m.events.push(ev);
        }

        let src=String(row.public_url||'');
        if(!src && row.storage_path){
          src=supabase.storage.from('guc-archive').getPublicUrl(row.storage_path).data.publicUrl;
        }

        if(src){
          ev.images.push({
            id:String(row.id),
            src,
            alt:row.caption||`${row.event_name} archive image`
          });
        }
      }

      const live=Array.from(grouped.values()).sort((a,b)=>Number(b.year)-Number(a.year));

      if(alive){
        setYears(live);
        setLoading(false);
      }
    };

    load();
    return()=>{alive=false};
  },[]);

  if(loading){
    return <main className="page"><div className="wrap page-hero compact">
      <span className="eyebrow">ARCHIVE / LOADING</span>
      <h1>Opening the filing cabinet.</h1>
      <p>Fetching the live archive.</p>
    </div></main>;
  }

  if(event){
    const y=years.find(v=>v.year===event.year);
    const mo=y?.months.find(v=>v.month===event.month);
    const ev=mo?.events.find(v=>v.id===event.event);

    return <main className="page">
      <div className="wrap page-hero compact">
        <span className="eyebrow">ARCHIVE / EVENT</span>
        <h1>{ev?.name||'Event'}</h1>
        <p><button className="crumb-btn" onClick={()=>setEvent(null)}>â† Back to {event.month}</button></p>
      </div>
      <section className="section">
        <div className="wrap">
          {loadError&&<div className="alert warning">{loadError}</div>}
          <div className="archive-photo-grid">
            {ev?.images.length
              ? ev.images.map(img=><button key={img.id} className="archive-photo" onClick={()=>setLightbox(img.src)}>
                  <img src={img.src} alt={img.alt} loading="lazy"/>
                  <span>VIEW</span>
                </button>)
              : <EmptyState text="No photos have been added to this event yet."/>
            }
          </div>
        </div>
      </section>
      {lightbox&&<Modal onClose={()=>setLightbox(null)}><img className="lightbox-img" src={lightbox} alt="Archive enlargement"/></Modal>}
    </main>
  }

  if(month){
    const y=years.find(v=>v.year===month.year);
    const mo=y?.months.find(v=>v.month===month.month);

    return <main className="page">
      <div className="wrap page-hero compact">
        <span className="eyebrow">ARCHIVE / {month.year}</span>
        <h1>{month.month}</h1>
        <p><button className="crumb-btn" onClick={()=>setMonth(null)}>â† Back to {month.year}</button></p>
      </div>
      <section className="section">
        <div className="wrap archive-folders">
          {mo?.events.map(ev=><button key={ev.id} className="folder-card" onClick={()=>setEvent({year:month.year,month:month.month,event:ev.id})}>
            <span className="folder-tab"/>
            <span className="folder-icon">â–±</span>
            <strong>{ev.name}</strong>
            <small>{ev.images.length} image{ev.images.length===1?'':'s'}</small>
          </button>)}
          {!mo?.events.length&&<EmptyState text="No events have been filed for this month."/>}
        </div>
      </section>
    </main>
  }

  const currentYear=year&&years.find(y=>y.year===year);

  return <main className="page">
    <div className="wrap page-hero compact">
      <span className="eyebrow">ARCHIVE / MEMORY AS INFRASTRUCTURE</span>
      <h1>Every campaign leaves a trail.</h1>
      <p>Browse the archive like a filing cabinet from the future. Years â†’ months â†’ events â†’ images.</p>
    </div>

    <section className="section">
      <div className="wrap">
        {loadError&&<div className="alert warning">{loadError}</div>}
        {!years.length&&!loadError&&<EmptyState text="No archive images have been uploaded yet."/>}
        {!!years.length&&<div className="archive-folders">
          {year===null
            ? years.map(y=><button key={y.year} className="folder-card year" onClick={()=>{setYear(y.year);setMonth(null)}}>
                <span className="folder-tab"/>
                <span className="folder-icon">â–±</span>
                <strong>{y.year}</strong>
                <small>{y.months.length} month{y.months.length===1?'':'s'} filed</small>
              </button>)
            : <>
                <div className="archive-back">
                  <button className="crumb-btn" onClick={()=>setYear(null)}>â† All years</button>
                </div>
                {currentYear?.months.map(mo=><button key={mo.month} className="folder-card" onClick={()=>setMonth({year,month:mo.month})}>
                  <span className="folder-tab"/>
                  <span className="folder-icon">â–±</span>
                  <strong>{mo.month}</strong>
                  <small>{mo.events.length} event{mo.events.length===1?'':'s'}</small>
                </button>)}
              </>
          }
        </div>}
      </div>
    </section>

    <section className="section">
      <div className="wrap callout">
        <div>
          <span className="eyebrow">ARCHIVE ADMIN</span>
          <h2>Photos live outside Vercel.</h2>
          <p>Uploads and event metadata are managed from the private admin panel.</p>
        </div>
        <Link to="/admin" className="btn btn-primary">Open admin â†—</Link>
      </div>
    </section>
  </main>
}
function ArchiveUploader(){
  const [year,setYear]=useState(String(new Date().getFullYear())),[month,setMonth]=useState(String(new Date().getMonth()+1)),[eventName,setEventName]=useState(''),[caption,setCaption]=useState(''),[files,setFiles]=useState<File[]>([]),[msg,setMsg]=useState(''),[busy,setBusy]=useState(false);

  const upload=async()=>{
    if(!supabaseConfigured||!supabase)throw new Error('Supabase is not configured.');
    if(!eventName.trim())throw new Error('Enter an event name.');
    if(!files.length)throw new Error('Choose at least one image.');
    setBusy(true);setMsg('');
    try{
      for(const file of files){
        if(!/image\/(jpeg|png|webp)/.test(file.type))throw new Error(`${file.name}: use JPG, PNG, or WebP.`);
        if(file.size>10*1024*1024)throw new Error(`${file.name}: max size is 10 MB.`);
        const safeName=file.name.replace(/[^a-zA-Z0-9._-]/g,'-');
        const path=`archive/${year}/${String(month).padStart(2,'0')}/${crypto.randomUUID()}-${safeName}`;
        const {error:storageError}=await supabase.storage.from('guc-archive').upload(path,file,{cacheControl:'31536000',upsert:false,contentType:file.type});
        if(storageError)throw storageError;
        const {data}=supabase.storage.from('guc-archive').getPublicUrl(path);
        const {error:rowError}=await supabase.from('archive_images').insert({year:Number(year),month:Number(month),event_name:eventName.trim(),storage_path:path,public_url:data.publicUrl,caption:caption.trim()||null});
        if(rowError){await supabase.storage.from('guc-archive').remove([path]);throw rowError;}
      }
      setFiles([]);setCaption('');setMsg('Archive upload complete. The public archive will use these images.');
    }catch(e){setMsg(e instanceof Error?e.message:'Upload failed.')}finally{setBusy(false)}
  };

  return <div className="uploader"><div className="form-row"><Field label="Year" name="archive-year" value={year} onChange={e=>setYear(e.target.value)}/><label><span>Month</span><select value={month} onChange={e=>setMonth(e.target.value)}>{Array.from({length:12},(_,i)=><option key={i+1} value={i+1}>{new Date(2000,i,1).toLocaleDateString('en-IN',{month:'long'})}</option>)}</select></label></div><label><span>Event name</span><input value={eventName} onChange={e=>setEventName(e.target.value)} placeholder="e.g. Community Kickoff"/></label><label><span>Caption (optional)</span><input value={caption} onChange={e=>setCaption(e.target.value)} placeholder="Short description for all uploaded images"/></label><label className="dropzone"><input type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={e=>setFiles(Array.from(e.target.files||[]))}/><span>DROP IMAGES OR CLICK</span><small>JPG / PNG / WEBP â€¢ 10 MB MAX</small></label>{files.length>0&&<div className="file-list">{files.map(f=><span key={f.name}>{f.name}</span>)}</div>}<button className="btn btn-primary" onClick={upload} disabled={busy}>{busy?'Uploadingâ€¦':'Upload to archive'}</button>{msg&&<div className="alert">{msg}</div>}</div>
}

function Admin(){
  usePageMeta('Admin | Girl Up Conquistadors','Private archive administration for Girl Up Conquistadors.');
  const [session,setSession]=useState<any>(null),[email,setEmail]=useState(''),[password,setPassword]=useState(''),[status,setStatus]=useState(''),[rows,setRows]=useState<ArchiveRow[]>([]),[busy,setBusy]=useState(false);

  const refresh=async()=>{
    if(!supabase)return;
    const {data,error}=await supabase.from('archive_images').select('id,year,month,event_name,storage_path,public_url,caption,created_at').order('year',{ascending:false}).order('month',{ascending:false}).order('created_at',{ascending:false});
    if(error)setStatus(error.message);else setRows((data||[]) as ArchiveRow[])
  };

  useEffect(()=>{
    if(!supabaseConfigured||!supabase){setStatus('Supabase is not configured.');return;}
    supabase.auth.getSession().then(({data})=>setSession(data.session));
    const {data}=supabase.auth.onAuthStateChange((_event,s)=>setSession(s));
    return()=>data.subscription.unsubscribe()
  },[]);

  useEffect(()=>{if(session)refresh()},[session]);

  const login=async()=>{
    if(!supabase)return;
    setBusy(true);setStatus('');
    const {data,error}=await supabase.auth.signInWithPassword({email,password});
    if(error)setStatus(error.message);else setSession(data.session);
    setBusy(false)
  };

  const logout=async()=>{if(supabase)await supabase.auth.signOut();setSession(null)};

  const remove=async(row:ArchiveRow)=>{
    if(!supabase||!confirm(`Delete ${row.event_name} / ${row.id}?`))return;
    setBusy(true);setStatus('');
    const {error:storageError}=await supabase.storage.from('guc-archive').remove([row.storage_path]);
    if(storageError){setStatus(storageError.message);setBusy(false);return}
    const {error}=await supabase.from('archive_images').delete().eq('id',row.id);
    setStatus(error?error.message:'Image deleted.');
    if(!error)await refresh();
    setBusy(false)
  };

  if(!supabaseConfigured||!supabase)return <main className="page"><div className="wrap page-hero compact"><span className="eyebrow">ADMIN / SETUP</span><h1>Supabase is not connected.</h1><p>Set the Vite Supabase environment variables in Vercel before using archive administration.</p></div></main>;

  if(!session)return <main className="page"><div className="wrap page-hero compact"><span className="eyebrow">ADMIN / PRIVATE</span><h1>Archive control room.</h1><p>Sign in with the Supabase admin account you created. This page does not create users.</p></div><section className="section"><div className="wrap form-layout"><div className="guc-form"><label><span>Email</span><input value={email} onChange={e=>setEmail(e.target.value)} type="email" autoComplete="username"/></label><label><span>Password</span><input value={password} onChange={e=>setPassword(e.target.value)} type="password" autoComplete="current-password"/></label>{status&&<div className="alert error">{status}</div>}<button className="btn btn-primary wide" onClick={login} disabled={busy}>{busy?'Signing inâ€¦':'Sign in â†—'}</button></div></div></section></main>;

  return <main className="page"><div className="wrap page-hero compact"><span className="eyebrow">ADMIN / ARCHIVE</span><h1>File the work.</h1><p>Upload images, assign them to a year/month/event, and remove mistakes without redeploying the site.</p><button className="crumb-btn" onClick={logout}>Log out</button></div><section className="section"><div className="wrap upload-panel"><div><span className="eyebrow">NEW ENTRY</span><h2>Send photos to Supabase.</h2><p>Each image gets a stable storage path and one metadata row. Public visitors only receive the archive rows and public image URLs.</p></div><ArchiveUploader/></div></section><section className="section"><div className="wrap"><div className="section-header"><span className="eyebrow">CURRENT FILES / {rows.length}</span><h2>Archive inventory</h2><p>Delete from here when an upload is wrong. Because apparently we still need a trash can for the internet.</p></div><div className="admin-list">{rows.map(row=><article key={row.id} className="admin-row"><img src={row.public_url} alt={row.caption||row.event_name}/><div><strong>{row.event_name}</strong><span>{row.year} / {new Date(2000,row.month-1,1).toLocaleDateString('en-IN',{month:'long'})}</span><small>{row.caption||'No caption'}</small></div><button className="ghost-btn" onClick={()=>remove(row)} disabled={busy}>Delete</button></article>)}{!rows.length&&<EmptyState text="No live archive images yet."/>}</div></div></section></main>
}

function EmptyState({text}:{text:string}){return <div className="empty-state"><span>âˆ…</span><h3>Nothing filed yet</h3><p>{text}</p></div>}
function NotFound(){usePageMeta('404 | Girl Up Conquistadors','Page not found.');return <main className="page notfound"><div className="wrap"><span className="eyebrow">404 / SIGNAL LOST</span><h1>That page wandered off.</h1><p>The link exists only in the great bureaucratic afterlife of broken URLs.</p><Link className="btn btn-primary" to="/">Return home â†—</Link></div></main>}

class ErrorBoundary extends React.Component<{children:React.ReactNode},{hasError:boolean}>{
  state={hasError:false};
  static getDerivedStateFromError(){return {hasError:true};}
  render(){return this.state.hasError?<main className="page notfound"><div className="wrap"><span className="eyebrow">SYSTEM / RECOVERABLE ERROR</span><h1>Something broke.</h1><p>The page hit an unexpected error. Reloading the page should restore the interface.</p><button className="btn btn-primary" onClick={()=>location.reload()}>Reload â†»</button></div></main>:this.props.children;}
}

function App(){return <Layout><Routes><Route path="/" element={<Home/>}/><Route path="/about" element={<About/>}/><Route path="/join" element={<Join/>}/><Route path="/events" element={<EventsPage/>}/><Route path="/donate" element={<Donate/>}/><Route path="/archive" element={<Archive/>}/><Route path="/admin" element={<Admin/>}/><Route path="*" element={<NotFound/>}/></Routes></Layout>}

createRoot(document.getElementById('root')!).render(<React.StrictMode><BrowserRouter><ErrorBoundary><App/></ErrorBoundary></BrowserRouter></React.StrictMode>);



