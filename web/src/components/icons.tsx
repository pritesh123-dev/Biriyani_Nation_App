type P = { size?: number };
const base = (size: number) => ({
  width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
  strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true,
});

export const SOCIAL = {
  instagram: 'https://www.instagram.com/zayrabiryani/',
  youtube: 'https://www.youtube.com/@Zayra-Biryani',
  facebook: 'https://www.facebook.com/people/Zayra-Biryani/61594579809671/',
};

export const IconInstagram = ({ size = 20 }: P) => (
  <svg {...base(size)}><rect width="20" height="20" x="2" y="2" rx="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>
);
export const IconYoutube = ({ size = 20 }: P) => (
  <svg {...base(size)}><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" /><polygon points="10 15 15 12 10 9 10 15" fill="currentColor" /></svg>
);
export const IconFacebook = ({ size = 20 }: P) => (
  <svg {...base(size)}><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
);
export const IconArrow = ({ size = 18 }: P) => (
  <svg {...base(size)} strokeWidth={2.2}><path d="M5 12h14M13 6l6 6-6 6" /></svg>
);
export const IconArrowUR = ({ size = 16 }: P) => (
  <svg {...base(size)} strokeWidth={2.2}><path d="M7 17 17 7M8 7h9v9" /></svg>
);
export const IconPlay = ({ size = 16 }: P) => (
  <svg {...base(size)}><circle cx="12" cy="12" r="10" /><polygon points="10 8 16 12 10 16 10 8" fill="currentColor" /></svg>
);
export const IconCheck = ({ size = 16 }: P) => (
  <svg {...base(size)} strokeWidth={2.6}><path d="M20 6 9 17l-5-5" /></svg>
);
export const IconFlame = ({ size = 20 }: P) => (
  <svg {...base(size)}><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5z" /></svg>
);
export const IconBowl = ({ size = 20 }: P) => (
  <svg {...base(size)}><path d="M3 11h18a9 9 0 0 1-18 0Z" /><path d="M8 7c0-1 1-1.5 1-3M12 7c0-1 1-1.5 1-3M16 7c0-1 1-1.5 1-3" /></svg>
);
export const IconLeaf = ({ size = 20 }: P) => (
  <svg {...base(size)}><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" /><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" /></svg>
);
export const IconLayers = ({ size = 20 }: P) => (
  <svg {...base(size)}><path d="m12 2 10 5-10 5L2 7l10-5Z" /><path d="m2 17 10 5 10-5M2 12l10 5 10-5" /></svg>
);
export const IconSeal = ({ size = 20 }: P) => (
  <svg {...base(size)}><ellipse cx="12" cy="7" rx="9" ry="3" /><path d="M3 7v4c0 4 4 8 9 8s9-4 9-8V7" /><path d="M6 8.8c2 .8 4 1.2 6 1.2s4-.4 6-1.2" strokeDasharray="1.5 2.5" /></svg>
);
export const IconClock = ({ size = 20 }: P) => (
  <svg {...base(size)}><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
);
export const IconStar = ({ size = 20 }: P) => (
  <svg {...base(size)}><path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
);
export const IconHeart = ({ size = 20 }: P) => (
  <svg {...base(size)}><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /></svg>
);
export const IconGift = ({ size = 16 }: P) => (
  <svg {...base(size)}><rect x="3" y="8" width="18" height="4" rx="1" /><path d="M12 8v13M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7M7.5 8a2.5 2.5 0 0 1 0-5C11 3 12 8 12 8s1-5 4.5-5a2.5 2.5 0 0 1 0 5" /></svg>
);
export const IconLock = ({ size = 14 }: P) => (
  <svg {...base(size)}><rect width="18" height="11" x="3" y="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
);

/* ── Official brand-coloured marks (used where users must instantly recognise the platform) ── */
export const BrandInstagram = ({ size = 22 }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
    <defs>
      <radialGradient id="ig-grad" cx="30%" cy="107%" r="150%">
        <stop offset="0" stopColor="#fdf497" />
        <stop offset="0.05" stopColor="#fdf497" />
        <stop offset="0.45" stopColor="#fd5949" />
        <stop offset="0.6" stopColor="#d6249f" />
        <stop offset="0.9" stopColor="#285AEB" />
      </radialGradient>
    </defs>
    <rect x="1" y="1" width="22" height="22" rx="6.5" fill="url(#ig-grad)" />
    <rect x="5.5" y="5.5" width="13" height="13" rx="4" fill="none" stroke="#fff" strokeWidth="1.8" />
    <circle cx="12" cy="12" r="3.1" fill="none" stroke="#fff" strokeWidth="1.8" />
    <circle cx="16.1" cy="7.9" r="1" fill="#fff" />
  </svg>
);
export const BrandYoutube = ({ size = 22 }: P) => (
  <svg width={size} height={size * 0.75} viewBox="0 0 28 20" aria-hidden="true">
    <path d="M27.4 3.1A3.5 3.5 0 0 0 24.9.6C22.7 0 14 0 14 0S5.3 0 3.1.6A3.5 3.5 0 0 0 .6 3.1C0 5.3 0 10 0 10s0 4.7.6 6.9a3.5 3.5 0 0 0 2.5 2.5C5.3 20 14 20 14 20s8.7 0 10.9-.6a3.5 3.5 0 0 0 2.5-2.5c.6-2.2.6-6.9.6-6.9s0-4.7-.6-6.9Z" fill="#FF0000" />
    <path d="M11.2 14.3 18.4 10l-7.2-4.3v8.6Z" fill="#fff" />
  </svg>
);
export const BrandFacebook = ({ size = 22 }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="12" r="11.5" fill="#1877F2" />
    <path d="M13.4 24v-8.4h2.8l.5-3.3h-3.3v-2.1c0-.9.5-1.8 1.9-1.8h1.5V5.6s-1.3-.2-2.6-.2c-2.7 0-4.4 1.6-4.4 4.6v2.3H7v3.3h2.8V24h3.6Z" fill="#fff" />
  </svg>
);
