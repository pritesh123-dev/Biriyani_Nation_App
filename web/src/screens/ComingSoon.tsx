import React, { Suspense, lazy, useEffect, useRef, useState } from 'react';
import storyImg from '../assets/photos/story-wide.webp';
import cardChicken from '../assets/photos/card-chicken.webp';
import cardMutton from '../assets/photos/card-mutton.webp';
import cardEgg from '../assets/photos/card-egg.webp';
import cardPaneer from '../assets/photos/card-paneer.webp';
import cardVeg from '../assets/photos/card-veg.webp';
import plateChicken from '../assets/plates/plate-chicken.webp';
import plateMutton from '../assets/plates/plate-mutton.webp';
import plateEgg from '../assets/plates/plate-egg.webp';
import plateHyderabadi from '../assets/plates/plate-hyderabadi.webp';
import plateVeg from '../assets/plates/plate-veg.webp';
import {
  SOCIAL, IconArrow, IconArrowUR, IconPlay, IconCheck, IconFlame, IconBowl, IconLeaf, IconLayers,
  IconSeal, IconClock, IconStar, IconHeart, IconGift, IconLock, BrandInstagram, BrandYoutube, BrandFacebook,
} from '../components/icons';

// three.js (floating spices) is only downloaded when the hero actually renders
const SpiceScene = lazy(() => import('../components/SpiceScene'));

const PLATES = [
  { name: 'Hyderabadi Chicken Dum Biryani', img: plateChicken, veg: false },
  { name: 'Mutton Zafrani Dum Biryani', img: plateMutton, veg: false },
  { name: 'Egg Dum Biryani', img: plateEgg, veg: false },
  { name: 'Hyderabadi Dum Biryani', img: plateHyderabadi, veg: false },
  { name: 'Veg Dum Biryani', img: plateVeg, veg: true },
];

function hasWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

const STEPS = [
  { n: '01', title: 'Marinate', icon: <IconLeaf size={22} />, text: 'Meat and paneer rest in thick yogurt and hand-ground whole spices until every fibre is flavoured.' },
  { n: '02', title: 'Layer', icon: <IconLayers size={22} />, text: 'Aged long-grain basmati, saffron milk, crisp fried onions, mint and pure desi ghee — layer by layer.' },
  { n: '03', title: 'Seal', icon: <IconSeal size={22} />, text: 'Each handi is sealed shut with a ring of dough, trapping every bit of steam and aroma inside.' },
  { n: '04', title: 'Dum', icon: <IconFlame size={22} />, text: '45 minutes on a gentle flame. No shortcuts, no essences — the handi is opened only when it’s ready.' },
];

const DISHES = [
  { name: 'Chicken Dum Biryani', img: cardChicken, veg: false, text: 'Bone-in chicken and saffron rice, slow-cooked on dum in a sealed handi.' },
  { name: 'Mutton Zafrani Biryani', img: cardMutton, veg: false, text: 'Tender mutton layered with zafrani rice and caramelised onions.' },
  { name: 'Egg Dum Biryani', img: cardEgg, veg: false, text: 'Masala-roasted eggs tucked into fragrant long-grain basmati.' },
  { name: 'Paneer Tikka Biryani', img: cardPaneer, veg: true, text: 'Char-grilled paneer tikka with mint, saffron rice and ghee.' },
  { name: 'Aloo Dum Biryani', img: cardVeg, veg: true, text: 'Spiced potatoes and garden vegetables dum-cooked with aromatic basmati.' },
];

const SOCIALS = [
  { name: 'Instagram', handle: '@zayrabiryani', url: SOCIAL.instagram, icon: <BrandInstagram size={30} />, cta: 'Follow us', text: 'Behind-the-scenes dum handis, daily reels and launch-day giveaways.' },
  { name: 'YouTube', handle: '@Zayra-Biryani', url: SOCIAL.youtube, icon: <BrandYoutube size={32} />, cta: 'Subscribe', text: 'Watch our slow dum-cooking, spice blends and kitchen stories.' },
  { name: 'Facebook', handle: 'Zayra Biryani', url: SOCIAL.facebook, icon: <BrandFacebook size={30} />, cta: 'Connect', text: 'Join our Bhubaneswar foodie circle for launch dates, events and catering.' },
];

const MARQUEE = ['Slow cooked', 'Richly spiced', 'Premium ingredients', 'Made fresh', 'Dough-sealed handis', 'Opening soon in Bhubaneswar'];

export default function ComingSoon() {
  const [webgl] = useState(hasWebGL);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const plateRef = useRef<HTMLDivElement>(null);

  // auto-advance the hero dish showcase
  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(() => setActive((a) => (a + 1) % PLATES.length), 4500);
    return () => window.clearInterval(id);
  }, [paused]);

  // 3D tilt of the plate following the pointer
  const onStageMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = plateRef.current;
    if (!el || e.pointerType !== 'mouse') return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty('--ry', `${x * 16}deg`);
    el.style.setProperty('--rx', `${-y * 16}deg`);
  };
  const onStageLeave = () => {
    plateRef.current?.style.setProperty('--ry', '0deg');
    plateRef.current?.style.setProperty('--rx', '0deg');
    setPaused(false);
  };
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // scroll reveal + 3D tilt for cards
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      }),
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' },
    );
    els.forEach((el) => io.observe(el));
    // safety net: anything already scrolled past (fast flings, busy main thread) gets revealed too
    let rafId = 0;
    const sweep = () => {
      rafId = 0;
      const limit = window.innerHeight * 0.92;
      els.forEach((el) => {
        if (!el.classList.contains('in') && el.getBoundingClientRect().top < limit) {
          el.classList.add('in');
          io.unobserve(el);
        }
      });
    };
    const onScroll = () => { if (!rafId) rafId = requestAnimationFrame(sweep); };
    window.addEventListener('scroll', onScroll, { passive: true });

    const tilts = Array.from(document.querySelectorAll<HTMLElement>('.tilt'));
    const move = (e: PointerEvent) => {
      const el = e.currentTarget as HTMLElement;
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      el.style.setProperty('--ry', `${x * 10}deg`);
      el.style.setProperty('--rx', `${-y * 10}deg`);
    };
    const leave = (e: PointerEvent) => {
      const el = e.currentTarget as HTMLElement;
      el.style.setProperty('--ry', '0deg');
      el.style.setProperty('--rx', '0deg');
    };
    tilts.forEach((el) => {
      el.addEventListener('pointermove', move);
      el.addEventListener('pointerleave', leave);
    });
    return () => {
      io.disconnect();
      window.removeEventListener('scroll', onScroll);
      if (rafId) cancelAnimationFrame(rafId);
      tilts.forEach((el) => {
        el.removeEventListener('pointermove', move);
        el.removeEventListener('pointerleave', leave);
      });
    };
  }, []);

  const handleNotify = (e: React.FormEvent) => {
    e.preventDefault();
    const digits = phone.replace(/\D/g, '').slice(-10);
    if (!/^[6-9]\d{9}$/.test(digits)) {
      setError('Please enter a valid 10-digit Indian mobile number.');
      return;
    }
    setError('');
    setSubmitted(true);
  };

  return (
    <>
      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero-card">
          <div className="hero-bgword" aria-hidden="true">Biryani</div>

          <div className="hero-copy">
            <div className="badge-live rise-in">
              <span className="dot" /> Opening soon · Bhubaneswar
            </div>
            <h1 className="rise-in" style={{ '--d': '0.1s' } as React.CSSProperties}>
              More than biryani.<br />
              <em>A better story.</em>
            </h1>
            <p className="hero-lead rise-in" style={{ '--d': '0.2s' } as React.CSSProperties}>
              Sealed under dough in traditional handis and slow-cooked for 45 minutes with aged basmati,
              pure desi ghee and hand-ground spices. Our Bhubaneswar kitchen opens its doors very soon.
            </p>
            <div className="hero-ctas rise-in" style={{ '--d': '0.3s' } as React.CSSProperties}>
              <a className="btn btn-gold" href="#invite">
                Get launch invite <IconArrow />
              </a>
              <a className="btn btn-ghost-light" href={SOCIAL.youtube} target="_blank" rel="noopener noreferrer">
                <IconPlay size={18} /> Watch us cook
              </a>
            </div>
            <div className="hero-stats rise-in" style={{ '--d': '0.4s' } as React.CSSProperties}>
              <div><b>45 min</b><span>Slow dum<br />on low flame</span></div>
              <div><b>100%</b><span>Pure desi<br />ghee</span></div>
              <div><b>5</b><span>Signature<br />handis</span></div>
            </div>
          </div>

          <div className="hero-stage" onPointerMove={onStageMove} onPointerEnter={() => setPaused(true)} onPointerLeave={onStageLeave}>
            <div className="hero-orb" />
            <div className="hero-ring" />

            <div className="plate-wrap" ref={plateRef}>
              <div className="plate-float">
                {PLATES.map((p, i) => (
                  <img
                    key={p.name}
                    src={p.img}
                    alt={i === active ? p.name : ''}
                    className={`plate${i === active ? ' on' : ''}`}
                    draggable={false}
                    fetchPriority={i === 0 ? 'high' : 'low'}
                  />
                ))}
              </div>
            </div>

            {webgl ? (
              <Suspense fallback={null}>
                <SpiceScene className="hero-canvas" />
              </Suspense>
            ) : null}

            <div className="chip-float chip-a">
              <div className="ci"><IconSeal size={20} /></div>
              <div><b>Dough-sealed</b><span>Every single handi</span></div>
            </div>

            <div className="plate-caption" aria-live="polite">
              <span className={`veg-tag ${PLATES[active].veg ? 'veg' : 'nonveg'}`}><i />{PLATES[active].veg ? 'Veg' : 'Non-veg'}</span>
              <b key={active}>{PLATES[active].name}</b>
            </div>

            <div className="plate-dots" role="tablist" aria-label="Choose a biryani">
              {PLATES.map((p, i) => (
                <button
                  key={p.name}
                  role="tab"
                  aria-selected={i === active}
                  aria-label={p.name}
                  className={i === active ? 'on' : ''}
                  onClick={() => { setActive(i); setPaused(true); }}
                />
              ))}
            </div>
          </div>

          <a href="#craft" className="scroll-cue" aria-label="Scroll to our craft">
            <i /> Scroll
          </a>
        </div>
      </section>

      {/* ── MARQUEE ── */}
      <div className="marquee" aria-hidden="true">
        <div className="marquee-track">
          {[...MARQUEE, ...MARQUEE, ...MARQUEE, ...MARQUEE].map((t, i) => <span key={i}>{t}</span>)}
        </div>
      </div>

      {/* ── CRAFT ── */}
      <section className="section" id="craft">
        <div className="wrap">
          <div className="sec-head">
            <div data-reveal>
              <span className="eyebrow-new">The Zayra way</span>
              <h2 className="h2">Four steps.<br /><em>Zero shortcuts.</em></h2>
            </div>
            <p data-reveal style={{ '--d': '0.1s' } as React.CSSProperties}>
              Real dum biryani can’t be rushed. This is the slow, old-school process behind every handi that leaves our kitchen.
            </p>
          </div>
          <div className="steps">
            {STEPS.map((s, i) => (
              <article key={s.n} className="step tilt" data-reveal style={{ '--d': `${i * 0.08}s` } as React.CSSProperties}>
                <div className="step-num">{s.n}</div>
                <div className="step-icon">{s.icon}</div>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── MENU PREVIEW ── */}
      <section className="section menu-sec" id="menu">
        <div className="wrap">
          <div className="sec-head">
            <div data-reveal>
              <span className="eyebrow-new">First on the menu</span>
              <h2 className="h2">Five handis,<br /><em>ready for launch.</em></h2>
            </div>
            <p data-reveal style={{ '--d': '0.1s' } as React.CSSProperties}>
              Veg and non-veg, each one dum-cooked to order. Online ordering opens on launch day.
            </p>
          </div>
          <div className="dishes">
            {DISHES.map((d, i) => (
              <article key={d.name} className="dish tilt" data-reveal style={{ '--d': `${i * 0.07}s` } as React.CSSProperties}>
                <div className="dish-img">
                  <span className={`veg-tag ${d.veg ? 'veg' : 'nonveg'}`}><i />{d.veg ? 'Veg' : 'Non-veg'}</span>
                  <img src={d.img} alt={d.name} loading="lazy" />
                </div>
                <div className="dish-body">
                  <h3>{d.name}</h3>
                  <p>{d.text}</p>
                  <div className="dish-soon">Coming soon</div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── STORY ── */}
      <section className="section story-sec" id="story">
        <div className="wrap">
          <div className="sec-head">
            <div data-reveal>
              <span className="eyebrow-new">Our story</span>
              <h2 className="h2">Hyderabad’s soul,<br /><em>cooked in Bhubaneswar.</em></h2>
            </div>
            <p data-reveal style={{ '--d': '0.1s' } as React.CSSProperties}>
              Zayra started with a simple belief: biryani deserves patience. We brought the Hyderabadi
              dum tradition home to Odisha — the sealed handi, the slow flame, the hand-ground spices — so
              every order tastes like it came from a family kitchen.
            </p>
          </div>
          <div className="story-frame" data-reveal="zoom">
            <div className="frame">
              <img src={storyImg} alt="Hyderabadi dum biryani served with mirchi ka salan, raita and salad" loading="lazy" width={2000} height={800} />
            </div>
          </div>
          <div className="pillars">
            {[
              { t: 'Slow cooked', i: <IconClock size={19} /> },
              { t: 'Richly spiced', i: <IconFlame size={19} /> },
              { t: 'Premium ingredients', i: <IconStar size={19} /> },
              { t: 'Made fresh', i: <IconHeart size={19} /> },
            ].map((p, i) => (
              <div className="pillar" key={p.t} data-reveal style={{ '--d': `${i * 0.06}s` } as React.CSSProperties}>
                <span>{p.i}</span>{p.t}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LAUNCH INVITE ── */}
      <section id="invite" style={{ scrollMarginTop: 76 }}>
        <div className="wrap">
          <div className="invite" data-reveal="zoom">
            <div>
              <span className="eyebrow-new">Inaugural launch perk</span>
              <h2 className="h2">First taste,<br /><em>first in line.</em></h2>
              <p className="invite-lead">Join the opening-day list for our Bhubaneswar kitchen and unlock:</p>
              <ul className="perks">
                <li><span><IconGift /></span> ₹100 inaugural voucher</li>
                <li><span><IconStar size={15} /></span> VIP invite for opening day</li>
                <li><span><IconBowl size={16} /></span> Early-bird Biryani Coins</li>
              </ul>
            </div>

            <div className="invite-card">
              {submitted ? (
                <div className="success" role="status">
                  <div className="tick"><IconCheck size={28} /></div>
                  <h3>You’re on the list!</h3>
                  <p style={{ margin: 0, color: 'var(--ink-soft)' }}>We’ll message you on launch day with your VIP invite and voucher.</p>
                </div>
              ) : (
                <form onSubmit={handleNotify} noValidate>
                  <h3>Get your launch invite</h3>
                  <p>Drop your number — we’ll only message you about opening day.</p>
                  <label className="phone-field">
                    <b>+91</b>
                    <input
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel-national"
                      placeholder="Mobile number"
                      aria-label="Mobile number"
                      value={phone}
                      maxLength={14}
                      onChange={(e) => { setPhone(e.target.value); if (error) setError(''); }}
                    />
                  </label>
                  {error ? <div className="err" role="alert">{error}</div> : null}
                  <button type="submit" className="btn btn-emerald">
                    Reserve my invite <IconArrow />
                  </button>
                  <div className="fine"><IconLock /> No spam. Only the opening-day invite and voucher.</div>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── COMMUNITY ── */}
      <section className="section" id="community" style={{ paddingBottom: 0 }}>
        <div className="wrap">
          <div className="sec-head">
            <div data-reveal>
              <span className="eyebrow-new">Official pages</span>
              <h2 className="h2">Join the <em>Zayra</em> circle.</h2>
            </div>
            <p data-reveal style={{ '--d': '0.1s' } as React.CSSProperties}>
              Launch dates, sneak peeks from the kitchen and giveaways — follow along so you don’t miss opening day.
            </p>
          </div>
          <div className="socials">
            {SOCIALS.map((s, i) => (
              <a key={s.name} href={s.url} target="_blank" rel="noopener noreferrer" className="social tilt" data-reveal style={{ '--d': `${i * 0.08}s` } as React.CSSProperties}>
                <div className="s-ic">{s.icon}</div>
                <h3>{s.handle}</h3>
                <p>{s.text}</p>
                <span className="go">{s.cta} on {s.name} <IconArrowUR /></span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <a href={SOCIAL.instagram} target="_blank" rel="noopener noreferrer" className="fab" aria-label="Follow Zayra Biryani on Instagram">
        <BrandInstagram size={30} />
      </a>
    </>
  );
}
