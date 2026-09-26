import React, { useState } from 'react';
import heroBgImg from '../assets/hero-biriyani.jpg';
import heroBannerImg from '../assets/zayra-hero-banner.png';

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
      {/* ── 1. HERO SECTION WITH SUBTLE BIRYANI BACKGROUND (Screenshot 2 Match) ── */}
      <section style={{
        position: 'relative',
        overflow: 'hidden',
        padding: 'clamp(48px, 7vw, 84px) clamp(16px, 3.5vw, 40px) clamp(40px, 5vw, 64px)',
        textAlign: 'center',
      }}>
        {/* Subtle Biryani Handi Background with Warm Overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url(${heroBgImg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.12,
          filter: 'grayscale(30%)',
          pointerEvents: 'none',
          zIndex: 0,
        }} />

        {/* Soft gradient wash */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(242, 240, 235, 0.82) 0%, rgba(242, 240, 235, 0.96) 100%)',
          pointerEvents: 'none',
          zIndex: 1,
        }} />

        <div style={{ position: 'relative', zIndex: 2, maxWidth: 920, margin: '0 auto' }}>
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
            font: '600 clamp(38px, 6vw, 68px)/1.12 var(--sans)',
            letterSpacing: '-0.025em',
            color: 'var(--green-starbucks)',
            margin: '0 auto 20px',
            maxWidth: 840,
          }}>
            Authentic Dum Biryani,<br />
            <span style={{ color: 'var(--green-house)' }}>Crafted for Bhubaneswar.</span>
          </h1>

          {/* Subtitle */}
          <p style={{
            font: '400 clamp(16px, 1.8vw, 19px)/1.65 var(--sans)',
            color: 'var(--text-black-soft)',
            maxWidth: 680,
            margin: '0 auto 30px',
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
            font: '600 clamp(12.5px, 1.5vw, 14px)/1.4 var(--sans)',
            marginBottom: 34,
            maxWidth: '100%',
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
              style={{ padding: '0 26px', height: 48, fontSize: 15 }}
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
              style={{ padding: '0 26px', height: 48, fontSize: 15 }}
            >
              Subscribe on YouTube
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M7 17L17 7M17 7H7M17 7V17" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* ── 2. HERO PAGE CENTERPIECE BANNER (Image 3 Showcase) ── */}
      <section style={{
        maxWidth: 1240,
        margin: '0 auto 64px',
        padding: '0 clamp(16px, 3.5vw, 40px)',
      }}>
        <div style={{
          borderRadius: 'var(--r-card)',
          overflow: 'hidden',
          boxShadow: '0 16px 40px rgba(0, 0, 0, 0.16)',
          border: '1px solid rgba(0, 0, 0, 0.08)',
          background: '#000000',
          position: 'relative',
        }}>
          <img
            src={heroBannerImg}
            alt="Zayra Biryani - More Than Biryani, A Better Story"
            style={{
              width: '100%',
              height: 'auto',
              maxHeight: '560px',
              objectFit: 'cover',
              display: 'block',
            }}
          />
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
            Authentic Hyderabadi Dum
          </span>
          <h2 style={{
            font: '600 clamp(26px, 3.5vw, 36px)/1.2 var(--sans)',
            letterSpacing: '-0.02em',
            color: 'var(--text-black)',
            margin: 0,
          }}>
            The Zayra Biryani Standards
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

      {/* ── 4. OFFICIAL SOCIAL COMMUNITY ── */}
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

      {/* ── 5. VIP LAUNCH PERK BAND ── */}
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

      {/* ── 6. FLOATING FRAP CIRCULAR CTA ── */}
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
