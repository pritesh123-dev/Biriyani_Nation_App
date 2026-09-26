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
      color: '#00754A',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
        </svg>
      ),
      badgeText: 'Follow us',
    },
    {
      name: 'YouTube',
      handle: '@Zayra-Biryani',
      desc: 'Watch our slow dum-cooking methods, spice blends & kitchen stories.',
      url: 'https://www.youtube.com/@Zayra-Biryani',
      color: '#00754A',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
          <polygon points="10 15 15 12 10 9 10 15" fill="currentColor" />
        </svg>
      ),
      badgeText: 'Subscribe',
    },
    {
      name: 'Facebook',
      handle: 'Zayra Biryani',
      desc: 'Join our Bhubaneswar foodie circle for events, launch dates & catering.',
      url: 'https://www.facebook.com/people/Zayra-Biryani/61594579809671/',
      color: '#00754A',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
        </svg>
      ),
      badgeText: 'Connect',
    },
  ];

  const handleNotify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.trim().length < 10) return;
    setSubmitted(true);
  };

  return (
    <div>
      {/* ── 1. WARM CREAM HERO (DESIGN.md Section 1 Standard) ── */}
      <section style={{
        padding: 'clamp(40px, 6vw, 72px) clamp(16px, 3.5vw, 40px) 48px',
        maxWidth: 1240,
        margin: '0 auto',
        textAlign: 'center',
      }}>
        {/* Status indicator badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '6px 18px',
          borderRadius: 'var(--r-pill)',
          background: 'var(--green-light)',
          color: 'var(--green-starbucks)',
          marginBottom: 24,
        }}>
          <span style={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            background: 'var(--green-accent)',
            animation: 'pulseDot 2s infinite',
          }} />
          <span style={{ font: '700 12.5px/1 var(--sans)', letterSpacing: '-0.01em' }}>
            Opening Soon in Bhubaneswar
          </span>
        </div>

        {/* Primary Heading */}
        <h1 style={{
          font: '600 clamp(36px, 5.5vw, 64px)/1.15 var(--sans)',
          letterSpacing: '-0.02em',
          color: 'var(--green-starbucks)',
          margin: '0 auto 18px',
          maxWidth: 820,
        }}>
          Authentic Dum Biryani,<br />
          <span style={{ color: 'var(--green-house)' }}>Crafted for Bhubaneswar.</span>
        </h1>

        {/* Subtitle */}
        <p style={{
          font: '400 clamp(16px, 1.8vw, 19px)/1.65 var(--sans)',
          color: 'var(--text-black-soft)',
          maxWidth: 640,
          margin: '0 auto 28px',
          letterSpacing: '-0.01em',
        }}>
          Sealed under dough in heavy handis, slow-cooked for 45 minutes with aged basmati, 
          pure ghee, and aromatic spices. Fresh, piping hot pickup from our Bhubaneswar kitchen.
        </p>

        {/* Informational Store Status Card */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 10,
          padding: '12px 24px',
          borderRadius: 'var(--r-card)',
          background: '#ffffff',
          boxShadow: 'var(--shadow-card)',
          color: 'var(--text-black)',
          font: '600 13.5px/1.4 var(--sans)',
          marginBottom: 32,
        }}>
          <span style={{ color: 'var(--green-accent)', fontSize: 16 }}>⏳</span>
          <span>Online ordering will go live on grand opening day. Follow our pages for the launch date!</span>
        </div>

        {/* Dual 50px Full-Pill CTAs */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 14,
          flexWrap: 'wrap',
        }}>
          <a
            href="https://www.instagram.com/zayrabiryani/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary-green"
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
            className="btn-outlined-green"
          >
            Subscribe on YouTube
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M7 17L17 7M17 7H7M17 7V17" />
            </svg>
          </a>
        </div>
      </section>

      {/* ── 2. HOUSE GREEN FEATURE BAND (DESIGN.md Section 4 & 9 Standard) ── */}
      <section style={{
        background: 'var(--green-house)',
        color: 'var(--text-white)',
        padding: 'clamp(48px, 6vw, 72px) clamp(16px, 3.5vw, 40px)',
        margin: '16px 0 56px',
      }}>
        <div style={{
          maxWidth: 1240,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 'clamp(32px, 5vw, 64px)',
          alignItems: 'center',
        }}>
          {/* Left Column: Headline + Copy + Inverted Buttons */}
          <div>
            <span style={{
              font: '700 12px/1 var(--sans)',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--gold)',
              display: 'block',
              marginBottom: 12,
            }}>
              The Bhubaneswar Cloud Kitchen
            </span>
            <h2 style={{
              font: '600 clamp(28px, 4vw, 44px)/1.15 var(--sans)',
              letterSpacing: '-0.02em',
              color: '#ffffff',
              margin: '0 0 18px',
            }}>
              Dough-Sealed Dum Cooking.<br />Zero Compromise.
            </h2>
            <p style={{
              font: '400 clamp(15px, 1.6vw, 17px)/1.65 var(--sans)',
              color: 'var(--text-white-soft)',
              margin: '0 0 28px',
            }}>
              Nothing sits pre-cooked. Every single pot is layered with aged long-grain basmati, 
              marinated cuts, and sealed under fresh dough to lock in the aroma for 45 minutes of slow dum.
            </p>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <a
                href="https://www.instagram.com/zayrabiryani/"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-inverted-white"
              >
                Explore Reels & BTS
              </a>
              <a
                href="https://www.facebook.com/people/Zayra-Biryani/61594579809671/"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outlined-white"
              >
                Join Community
              </a>
            </div>
          </div>

          {/* Right Column: Photography Card */}
          <div style={{
            borderRadius: 'var(--r-card)',
            overflow: 'hidden',
            boxShadow: '0 12px 32px rgba(0,0,0,0.3)',
            background: '#000000',
            position: 'relative',
          }}>
            <img
              src={heroImg}
              alt="Zayra Biryani Bhubaneswar"
              style={{ width: '100%', maxHeight: 380, objectFit: 'cover', display: 'block' }}
            />
            <div style={{
              position: 'absolute',
              bottom: 16,
              left: 16,
              background: 'rgba(30, 57, 50, 0.92)',
              backdropFilter: 'blur(8px)',
              padding: '8px 16px',
              borderRadius: 'var(--r-pill)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: '#ffffff',
              font: '700 12px var(--sans)',
            }}>
              📍 Bhubaneswar · Counter Pickup
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. CRAFT HIGHLIGHTS (DESIGN.md 12px Cards with Whisper Shadows) ── */}
      <section style={{
        maxWidth: 1240,
        margin: '0 auto 64px',
        padding: '0 clamp(16px, 3.5vw, 40px)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <span style={{
            font: '700 11.5px/1 var(--sans)',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--green-starbucks)',
            display: 'block',
            marginBottom: 8,
          }}>
            Pure Retail Kitchen Craft
          </span>
          <h2 style={{
            font: '600 clamp(26px, 3.5vw, 36px)/1.2 var(--sans)',
            letterSpacing: '-0.02em',
            color: 'var(--text-black)',
            margin: 0,
          }}>
            Why Zayra Biryani Tastes Different
          </h2>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: 20,
        }}>
          <div className="card-standard" style={{ padding: '28px' }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 'var(--r-pill)',
              background: 'var(--green-light)',
              color: 'var(--green-starbucks)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 20,
              marginBottom: 16,
            }}>
              🏺
            </div>
            <h3 style={{ font: '600 18px var(--sans)', color: 'var(--text-black)', margin: '0 0 8px' }}>
              Dough-Sealed Handis
            </h3>
            <p style={{ font: '400 14px/1.6 var(--sans)', color: 'var(--text-black-soft)', margin: 0 }}>
              Every single handi is sealed with dough, locking essential spice aromatics and steam inside.
            </p>
          </div>

          <div className="card-standard" style={{ padding: '28px' }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 'var(--r-pill)',
              background: 'var(--green-light)',
              color: 'var(--green-starbucks)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 20,
              marginBottom: 16,
            }}>
              🌾
            </div>
            <h3 style={{ font: '600 18px var(--sans)', color: 'var(--text-black)', margin: '0 0 8px' }}>
              Aged Basmati & Pure Ghee
            </h3>
            <p style={{ font: '400 14px/1.6 var(--sans)', color: 'var(--text-black-soft)', margin: 0 }}>
              Extra-long fragrant grains that stay separate and light, cooked in pure desi ghee without artificial essences.
            </p>
          </div>

          <div className="card-standard" style={{ padding: '28px' }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 'var(--r-pill)',
              background: 'var(--green-light)',
              color: 'var(--green-starbucks)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 20,
              marginBottom: 16,
            }}>
              ⚡
            </div>
            <h3 style={{ font: '600 18px var(--sans)', color: 'var(--text-black)', margin: '0 0 8px' }}>
              Pre-Order & Hot Pickup
            </h3>
            <p style={{ font: '400 14px/1.6 var(--sans)', color: 'var(--text-black-soft)', margin: 0 }}>
              Order ahead when we launch, receive a pickup code, and collect your steaming hot handi right on arrival.
            </p>
          </div>

          <div className="card-standard" style={{ padding: '28px' }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 'var(--r-pill)',
              background: 'var(--gold-lightest)',
              color: 'var(--gold)',
              border: '1px solid var(--gold)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 20,
              marginBottom: 16,
            }}>
              ★
            </div>
            <h3 style={{ font: '600 18px var(--sans)', color: 'var(--text-black)', margin: '0 0 8px' }}>
              Biryani Coins Rewards
            </h3>
            <p style={{ font: '400 14px/1.6 var(--sans)', color: 'var(--text-black-soft)', margin: 0 }}>
              Earn coins on every order. Redeem 200 coins for a complimentary Mini Dum Handi on the house.
            </p>
          </div>
        </div>
      </section>

      {/* ── 4. OFFICIAL SOCIAL COMMUNITY (DESIGN.md 3-Up Cards) ── */}
      <section style={{
        maxWidth: 1240,
        margin: '0 auto 64px',
        padding: '0 clamp(16px, 3.5vw, 40px)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <span style={{
            font: '700 11.5px/1 var(--sans)',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--green-starbucks)',
            display: 'block',
            marginBottom: 8,
          }}>
            Official Pages
          </span>
          <h2 style={{
            font: '600 clamp(26px, 3.5vw, 36px)/1.2 var(--sans)',
            letterSpacing: '-0.02em',
            color: 'var(--text-black)',
            margin: 0,
          }}>
            Join the Zayra Biryani Community
          </h2>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
          gap: 20,
        }}>
          {socialLinks.map((item) => (
            <a
              key={item.name}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="card-standard"
              style={{
                padding: '28px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                textDecoration: 'none',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div style={{
                    width: 44,
                    height: 44,
                    borderRadius: 'var(--r-card)',
                    background: 'var(--green-light)',
                    color: item.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    {item.icon}
                  </div>
                  <span style={{
                    font: '700 12px var(--sans)',
                    color: 'var(--green-starbucks)',
                    background: 'var(--green-light)',
                    padding: '4px 12px',
                    borderRadius: 'var(--r-pill)',
                  }}>
                    {item.name}
                  </span>
                </div>

                <h3 style={{ font: '700 18px var(--sans)', color: 'var(--text-black)', margin: '0 0 6px' }}>
                  {item.handle}
                </h3>
                <p style={{ font: '400 14px/1.55 var(--sans)', color: 'var(--text-black-soft)', margin: 0 }}>
                  {item.desc}
                </p>
              </div>

              <div style={{
                marginTop: 20,
                paddingTop: 14,
                borderTop: '1px solid rgba(0,0,0,0.06)',
                font: '700 13px var(--sans)',
                color: 'var(--green-accent)',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}>
                {item.badgeText} →
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* ── 5. VIP LAUNCH PERK BAND (DESIGN.md Gold Lightest #faf6ee Wash) ── */}
      <section style={{
        maxWidth: 1240,
        margin: '0 auto 80px',
        padding: '0 clamp(16px, 3.5vw, 40px)',
      }}>
        <div style={{
          background: 'var(--gold-lightest)',
          border: '1px solid rgba(203, 162, 88, 0.4)',
          borderRadius: 'var(--r-card)',
          boxShadow: 'var(--shadow-card)',
          padding: 'clamp(32px, 5vw, 56px)',
          textAlign: 'center',
        }}>
          <div style={{ maxWidth: 640, margin: '0 auto' }}>
            <span className="pill-gold-badge" style={{ marginBottom: 14 }}>
              ★ Inaugural Launch Perk
            </span>
            <h2 style={{
              font: '600 clamp(26px, 3.5vw, 36px)/1.2 var(--sans)',
              letterSpacing: '-0.02em',
              color: 'var(--text-black)',
              margin: '8px 0 12px',
            }}>
              Be the First to Taste in Bhubaneswar
            </h2>
            <p style={{
              font: '400 15px/1.65 var(--sans)',
              color: 'var(--text-black-soft)',
              marginBottom: 28,
            }}>
              Enter your mobile number to receive an opening day VIP invite, 
              a <strong>₹100 inaugural voucher</strong>, and early-bird Biryani Coins.
            </p>

            {submitted ? (
              <div style={{
                background: 'var(--green-light)',
                border: '1px solid var(--green-accent)',
                borderRadius: 'var(--r-pill)',
                padding: '16px 28px',
                color: 'var(--green-starbucks)',
                font: '700 14px var(--sans)',
              }}>
                ✨ Thank you! You are on our Bhubaneswar VIP list. We will notify you on launch day!
              </div>
            ) : (
              <form onSubmit={handleNotify} style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
                <input
                  type="tel"
                  placeholder="Enter 10-digit mobile number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  maxLength={13}
                  style={{
                    flex: '1 1 260px',
                    maxWidth: 360,
                    height: 48,
                    background: '#ffffff',
                    border: '1px solid var(--input-border)',
                    borderRadius: 'var(--r-pill)',
                    padding: '0 20px',
                    color: 'var(--text-black)',
                    font: '600 14.5px var(--sans)',
                    outline: 'none',
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--green-accent)')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--input-border)')}
                />
                <button
                  type="submit"
                  className="btn-primary-green"
                  style={{ height: 48, padding: '0 28px' }}
                >
                  Get Launch Invite
                </button>
              </form>
            )}

            <div style={{ marginTop: 18, font: '400 12px var(--sans)', color: 'var(--text-black-soft)' }}>
              🔒 No spam. Only official opening day invite and voucher.
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. FLOATING FRAP CIRCULAR ORDER CTA (DESIGN.md Section 4 & 9) ── */}
      <a
        href="https://www.instagram.com/zayrabiryani/"
        target="_blank"
        rel="noopener noreferrer"
        className="frap-floating-btn"
        title="Follow Zayra Biryani on Instagram"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
        </svg>
      </a>
    </div>
  );
}
