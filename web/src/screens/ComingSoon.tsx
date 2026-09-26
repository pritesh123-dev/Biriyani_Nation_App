import React, { useState } from 'react';
import heroImg from '../assets/hero-biriyani.jpg';

export default function ComingSoon() {
  const [phone, setPhone] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const socialLinks = [
    {
      name: 'Instagram',
      handle: '@zayrabiryani',
      desc: 'Behind-the-scenes dum handis, daily reels & launch giveaways.',
      url: 'https://www.instagram.com/zayrabiryani/',
      color: '#E1306C',
      bgGradient: 'linear-gradient(135deg, rgba(225,48,108,0.18), rgba(131,58,180,0.18))',
      border: 'rgba(225,48,108,0.3)',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
        </svg>
      ),
      actionText: 'Follow on Instagram →',
    },
    {
      name: 'YouTube',
      handle: '@Zayra-Biryani',
      desc: 'Watch our slow dum-cooking methods, spice blends & kitchen stories.',
      url: 'https://www.youtube.com/@Zayra-Biryani',
      color: '#FF0000',
      bgGradient: 'linear-gradient(135deg, rgba(255,0,0,0.18), rgba(200,20,20,0.1))',
      border: 'rgba(255,0,0,0.3)',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
          <polygon points="10 15 15 12 10 9 10 15" fill="currentColor" />
        </svg>
      ),
      actionText: 'Subscribe on YouTube →',
    },
    {
      name: 'Facebook',
      handle: 'Zayra Biryani',
      desc: 'Join our Bhubaneswar foodie circle for events, launch dates & catering.',
      url: 'https://www.facebook.com/people/Zayra-Biryani/61594579809671/',
      color: '#1877F2',
      bgGradient: 'linear-gradient(135deg, rgba(24,119,242,0.18), rgba(15,80,180,0.12))',
      border: 'rgba(24,119,242,0.3)',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
        </svg>
      ),
      actionText: 'Connect on Facebook →',
    },
  ];

  const handleNotify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.trim().length < 10) return;
    setSubmitted(true);
  };

  return (
    <div style={{ maxWidth: 1120, margin: '0 auto', padding: 'clamp(24px, 4vw, 56px) clamp(16px, 3vw, 32px) 80px' }}>
      
      {/* ── HERO BANNER ── */}
      <section style={{ textAlign: 'center', marginBottom: 52, position: 'relative' }}>
        
        {/* Glow ambient circle */}
        <div style={{
          position: 'absolute',
          top: '-40px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'clamp(280px, 60vw, 540px)',
          height: '240px',
          background: 'radial-gradient(circle, rgba(227,174,78,0.22) 0%, rgba(227,174,78,0) 70%)',
          pointerEvents: 'none',
          zIndex: 0,
        }} />

        {/* Status indicator badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 9,
          padding: '8px 20px',
          borderRadius: 'var(--r-pill)',
          background: 'rgba(227,174,78,0.12)',
          border: '1px solid rgba(227,174,78,0.38)',
          backdropFilter: 'blur(10px)',
          marginBottom: 24,
          position: 'relative',
          zIndex: 1,
        }}>
          <span style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: 'var(--gold)',
            boxShadow: '0 0 12px var(--gold)',
            animation: 'pulseDot 2s infinite',
          }} />
          <span style={{
            font: '700 12px/1 var(--sans)',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'var(--gold-soft)',
          }}>
            📍 Opening Soon in Bhubaneswar
          </span>
        </div>

        {/* Grand Headline */}
        <h1 style={{
          font: '400 clamp(38px, 6.2vw, 70px)/1.06 var(--serif)',
          color: 'var(--text)',
          margin: '0 auto 20px',
          maxWidth: 840,
          position: 'relative',
          zIndex: 1,
        }}>
          Authentic Dum Biryani,<br />
          Crafted for <span style={{
            background: 'linear-gradient(135deg, var(--gold-soft), var(--gold))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>Bhubaneswar</span>.
        </h1>

        {/* Subtitle */}
        <p style={{
          font: '500 clamp(15px, 1.8vw, 17px)/1.65 var(--sans)',
          color: 'var(--text-70)',
          maxWidth: 640,
          margin: '0 auto 32px',
          position: 'relative',
          zIndex: 1,
        }}>
          Sealed under dough in heavy handis, slow-cooked for 45 minutes with aged basmati, 
          pure ghee, and aromatic spices. Our kitchen is getting ready for counter pickup & pre-orders.
        </p>

        {/* Notice badge stating ordering will open soon */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 10,
          padding: '10px 22px',
          borderRadius: 'var(--r-lg)',
          background: 'rgba(26,20,13,0.85)',
          border: '1px solid rgba(227,174,78,0.25)',
          color: 'var(--text-85)',
          font: '600 13px/1.4 var(--sans)',
          marginBottom: 32,
        }}>
          <span style={{ color: 'var(--gold)' }}>⏳</span>
          <span>Online ordering will go live on grand opening day. Follow our pages for the launch date!</span>
        </div>

        {/* Action Social Buttons */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 14,
          flexWrap: 'wrap',
          position: 'relative',
          zIndex: 1,
        }}>
          <a
            href="https://www.instagram.com/zayrabiryani/"
            target="_blank"
            rel="noopener noreferrer"
            className="gold-btn"
            style={{ padding: '0 28px', height: 50, fontSize: 14.5 }}
          >
            Follow on Instagram
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M7 17L17 7M17 7H7M17 7V17" />
            </svg>
          </a>

          <a
            href="https://www.youtube.com/@Zayra-Biryani"
            target="_blank"
            rel="noopener noreferrer"
            className="ghost-btn"
            style={{ padding: '0 24px', height: 50, display: 'inline-flex', alignItems: 'center', gap: 8 }}
          >
            Subscribe on YouTube
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M7 17L17 7M17 7H7M17 7V17" />
            </svg>
          </a>
        </div>
      </section>

      {/* ── PHOTO SHOWCASE HERO ── */}
      <div style={{
        position: 'relative',
        borderRadius: 'var(--r-xxl)',
        overflow: 'hidden',
        border: '1px solid rgba(227,174,78,0.25)',
        background: 'var(--card)',
        marginBottom: 56,
        boxShadow: '0 24px 60px rgba(0,0,0,0.6)',
      }}>
        <img
          src={heroImg}
          alt="Zayra Biryani Bhubaneswar"
          style={{ width: '100%', maxHeight: 420, objectFit: 'cover', display: 'block' }}
        />
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(0deg, rgba(11,9,6,0.95) 0%, rgba(11,9,6,0.4) 50%, rgba(11,9,6,0.1) 100%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: 'clamp(20px, 3.5vw, 36px)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <span className="eyebrow-gold" style={{ display: 'block', marginBottom: 6 }}>
                Zayra Biryani · Cloud Kitchen
              </span>
              <h2 style={{ font: '400 clamp(24px, 3vw, 36px)/1.1 var(--serif)', color: 'var(--text)', margin: 0 }}>
                Dough-Sealed Handi Dum
              </h2>
            </div>
            <div style={{
              background: 'rgba(11,9,6,0.85)',
              border: '1px solid rgba(227,174,78,0.3)',
              borderRadius: 'var(--r-md)',
              padding: '10px 16px',
              backdropFilter: 'blur(8px)',
            }}>
              <span style={{ font: '600 12px/1 var(--sans)', color: 'var(--gold-soft)', display: 'block' }}>
                📍 Bhubaneswar, Odisha
              </span>
              <span style={{ font: '500 11px/1.4 var(--sans)', color: 'var(--text-45)', display: 'block', marginTop: 4 }}>
                Patia Square · Counter Pickup & Pre-orders
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── SOCIAL COMMUNITY SPOTLIGHT ── */}
      <section style={{ marginBottom: 56 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <span className="eyebrow-gold" style={{ letterSpacing: '0.2em' }}>Connect With Us</span>
          <h2 style={{ font: '400 clamp(26px, 3.5vw, 38px)/1.15 var(--serif)', color: 'var(--text)', margin: '8px 0' }}>
            Follow Our Official Channels
          </h2>
          <p style={{ font: '500 14px var(--sans)', color: 'var(--text-55)', maxWidth: 520, margin: '0 auto' }}>
            Stay updated with launch dates, kitchen behind-the-scenes, food trials, and inaugural launch offers.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
          gap: 18,
        }}>
          {socialLinks.map((item) => (
            <a
              key={item.name}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="card"
              style={{
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                textDecoration: 'none',
                background: item.bgGradient,
                borderColor: item.border,
                transition: 'transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = `0 16px 36px ${item.border}`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div style={{
                    width: 44,
                    height: 44,
                    borderRadius: 'var(--r-md)',
                    background: 'rgba(0,0,0,0.4)',
                    border: `1px solid ${item.border}`,
                    color: item.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    {item.icon}
                  </div>
                  <span style={{
                    font: '700 11px var(--sans)',
                    color: item.color,
                    background: 'rgba(0,0,0,0.5)',
                    padding: '4px 10px',
                    borderRadius: 'var(--r-pill)',
                    border: `1px solid ${item.border}`,
                  }}>
                    {item.name}
                  </span>
                </div>

                <h3 style={{ font: '700 18px var(--sans)', color: 'var(--text)', margin: '0 0 6px' }}>
                  {item.handle}
                </h3>
                <p style={{ font: '500 13px/1.55 var(--sans)', color: 'var(--text-70)', margin: 0 }}>
                  {item.desc}
                </p>
              </div>

              <div style={{
                marginTop: 20,
                paddingTop: 14,
                borderTop: '1px solid rgba(246,238,225,0.08)',
                font: '700 12.5px var(--sans)',
                color: 'var(--gold-soft)',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}>
                {item.actionText}
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* ── EARLY ACCESS / VIP NOTIFY ── */}
      <section style={{
        background: 'linear-gradient(135deg, rgba(227,174,78,0.12), rgba(26,20,13,0.95))',
        border: '1px solid rgba(227,174,78,0.3)',
        borderRadius: 'var(--r-xxl)',
        padding: 'clamp(28px, 4vw, 44px)',
        marginBottom: 56,
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ maxWidth: 620, margin: '0 auto', textAlign: 'center' }}>
          <span className="eyebrow-gold">Inaugural Launch Perk</span>
          <h2 style={{ font: '400 clamp(26px, 3.5vw, 36px)/1.15 var(--serif)', color: 'var(--text)', margin: '8px 0 12px' }}>
            Be the First to Taste in Bhubaneswar
          </h2>
          <p style={{ font: '500 14px/1.6 var(--sans)', color: 'var(--text-70)', marginBottom: 28 }}>
            Drop your mobile number to receive an exclusive VIP invite on opening day, 
            along with <strong>₹100 launch voucher</strong> and surprise opening-day Biryani Coins.
          </p>

          {submitted ? (
            <div style={{
              background: 'rgba(78,154,107,0.15)',
              border: '1px solid rgba(78,154,107,0.4)',
              borderRadius: 'var(--r-lg)',
              padding: '18px 24px',
              color: '#8FD3A6',
              font: '600 14px var(--sans)',
            }}>
              ✨ Thank you! You are on our Bhubaneswar VIP list. We will message you on launch day!
            </div>
          ) : (
            <form onSubmit={handleNotify} style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
              <input
                type="tel"
                placeholder="Enter your 10-digit mobile number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                maxLength={13}
                style={{
                  flex: '1 1 260px',
                  maxWidth: 360,
                  height: 50,
                  background: 'rgba(11,9,6,0.85)',
                  border: '1px solid var(--gold-line-50)',
                  borderRadius: 'var(--r-lg)',
                  padding: '0 16px',
                  color: 'var(--text)',
                  font: '600 14px var(--sans)',
                }}
              />
              <button
                type="submit"
                className="gold-btn"
                style={{ height: 50, padding: '0 24px', flex: 'none', fontSize: 13.5 }}
              >
                Get Launch Invite
              </button>
            </form>
          )}

          <div style={{ marginTop: 20, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
            <span style={{ font: '500 12px var(--sans)', color: 'var(--text-45)' }}>
              🔒 No spam. Only official launch notification & voucher.
            </span>
          </div>
        </div>
      </section>

      {/* ── KITCHEN CRAFT & HIGHLIGHTS ── */}
      <section style={{ marginBottom: 32 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <span className="eyebrow-gold">What Makes Zayra Special</span>
          <h2 style={{ font: '400 clamp(24px, 3vw, 34px)/1.15 var(--serif)', color: 'var(--text)', margin: '6px 0 0' }}>
            The Bhubaneswar Dum Kitchen
          </h2>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 16,
        }}>
          <div className="card" style={{ padding: '24px' }}>
            <div style={{ fontSize: 28, marginBottom: 12 }}>🏺</div>
            <h3 style={{ font: '700 16px var(--sans)', color: 'var(--text)', margin: '0 0 8px' }}>
              Dough-Sealed Handis
            </h3>
            <p style={{ font: '500 13px/1.6 var(--sans)', color: 'var(--text-55)', margin: 0 }}>
              Every single pot is covered with a dough seal, trapping steam and essential spice aromatics inside during slow cooking.
            </p>
          </div>

          <div className="card" style={{ padding: '24px' }}>
            <div style={{ fontSize: 28, marginBottom: 12 }}>🌾</div>
            <h3 style={{ font: '700 16px var(--sans)', color: 'var(--text)', margin: '0 0 8px' }}>
              Aged Basmati & Desi Ghee
            </h3>
            <p style={{ font: '500 13px/1.6 var(--sans)', color: 'var(--text-55)', margin: 0 }}>
              Extra-long grains that stay separate, fragrant, and light on the stomach without greasy food coloring or artificial essences.
            </p>
          </div>

          <div className="card" style={{ padding: '24px' }}>
            <div style={{ fontSize: 28, marginBottom: 12 }}>⚡</div>
            <h3 style={{ font: '700 16px var(--sans)', color: 'var(--text)', margin: '0 0 8px' }}>
              Pre-Order & Hot Pickup
            </h3>
            <p style={{ font: '500 13px/1.6 var(--sans)', color: 'var(--text-55)', margin: 0 }}>
              Once open, order from your phone, get a 4-letter pickup code, and collect your steaming hot handi right from our counter in minutes.
            </p>
          </div>

          <div className="card" style={{ padding: '24px' }}>
            <div style={{ fontSize: 28, marginBottom: 12 }}>🪙</div>
            <h3 style={{ font: '700 16px var(--sans)', color: 'var(--text)', margin: '0 0 8px' }}>
              Biryani Coins Program
            </h3>
            <p style={{ font: '500 13px/1.6 var(--sans)', color: 'var(--text-55)', margin: 0 }}>
              Earn coins on every single order. Collect 200 coins and get a full Mini Dum Handi free on the house.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}
