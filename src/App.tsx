import { useState, useEffect } from 'react';
import { AnimatedLogo, SQUARES } from './components/AnimatedLogo';

type Lang = 'fr' | 'en';
type Status = 'idle' | 'loading' | 'success' | 'duplicate' | 'error';

const TEXTS = {
  fr: {
    placeholder: 'votre adresse email',
    submit: 'Rejoindre',
    success: 'Inscrit.',
    duplicate: 'Déjà inscrit.',
    error: 'Erreur.',
    selectLabel: "Qu'est-ce qui te définit le plus ?",
  },
  en: {
    placeholder: 'your email address',
    submit: 'Join',
    success: 'Registered.',
    duplicate: 'Already registered.',
    error: 'Error.',
    selectLabel: 'What defines you the most?',
  },
};

function detectLanguage(): Lang {
  try {
    if (typeof window !== 'undefined' && typeof navigator !== 'undefined') {
      const lang = (navigator.languages && navigator.languages[0]) || navigator.language || '';
      return lang.toLowerCase().startsWith('fr') ? 'fr' : 'en';
    }
  } catch {
    // fallback
  }
  return 'en';
}

export function App() {
  const [lang, setLang] = useState<Lang>(detectLanguage);
  const [email, setEmail] = useState('');
  const [roleIndex, setRoleIndex] = useState<number>(-1);
  const [status, setStatus] = useState<Status>('idle');

  useEffect(() => {
    setLang(detectLanguage());
  }, []);

  const t = TEXTS[lang];
  const activeSquare = roleIndex >= 0 ? SQUARES[roleIndex] : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || roleIndex < 0 || status === 'loading') return;

    setStatus('loading');
    const selectedRole = SQUARES[roleIndex].role;

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), role: selectedRole, lang }),
      });

      if (res.status === 409) {
        setStatus('duplicate');
      } else if (res.ok) {
        setStatus('success');
        setEmail('');
        setRoleIndex(-1);
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }

    setTimeout(() => {
      setStatus((s) => (s === 'loading' ? 'idle' : s));
    }, 4000);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0a0a0a',
        color: '#ffffff',
        fontFamily: "'Montserrat', sans-serif",
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '32px 40px',
        boxSizing: 'border-box',
      }}
    >
      {/* ── Top Bar ── */}
      <header style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
        <div style={{ display: 'flex', gap: 16 }}>
          {(['fr', 'en'] as Lang[]).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: 11,
                fontWeight: lang === l ? 700 : 400,
                color: lang === l ? '#ffffff' : 'rgba(255,255,255,0.25)',
                fontFamily: "'Montserrat', sans-serif",
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                padding: 0,
              }}
            >
              {l}
            </button>
          ))}
        </div>
      </header>

      {/* ── Center Content ── */}
      <main
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          maxWidth: 420,
          margin: '0 auto',
        }}
      >
        {/* Logo */}
        <div style={{ marginBottom: 36 }}>
          <AnimatedLogo
            size={190}
            forcedColorIndex={roleIndex}
            onSelectColorIndex={(i) => setRoleIndex(i)}
          />
        </div>

        {/* Question — make the selection clearer */}
        <p
          style={{
            marginBottom: 14,
            fontSize: 10,
            fontFamily: "'Montserrat', sans-serif",
            fontWeight: 500,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.5)',
            textAlign: 'center',
          }}
        >
          {t.selectLabel}
        </p>

        {/* Minimalist Role Selector */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: 14,
            marginBottom: 36,
            width: '100%',
          }}
        >
          {SQUARES.map((sq, i) => {
            const isSelected = roleIndex === i;
            return (
              <button
                key={sq.id}
                type="button"
                onClick={() => setRoleIndex(i)}
                style={{
                  position: 'relative',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px 0',
                  fontSize: 11,
                  fontFamily: "'Montserrat', sans-serif",
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  borderBottom: isSelected ? `1.5px solid ${sq.color}` : '1.5px solid transparent',
                }}
              >
                {/* Invisible bold sizer: the button always reserves the width of its
                    bold state, so selecting it can never reflow the row (fixes the
                    mobile text jump in French, where labels are longest). */}
                <span aria-hidden="true" style={{ visibility: 'hidden', fontWeight: 700 }}>
                  {sq.label[lang]}
                </span>
                <span
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'block',
                    textAlign: 'center',
                    padding: '4px 0',
                    fontWeight: isSelected ? 700 : 400,
                    color: isSelected ? sq.color : 'rgba(255,255,255,0.3)',
                  }}
                >
                  {sq.label[lang]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Minimalist Email Input */}
        <form
          onSubmit={handleSubmit}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            borderBottom: `1px solid ${
              activeSquare ? activeSquare.color : 'rgba(255,255,255,0.2)'
            }`,
            paddingBottom: 8,
          }}
        >
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t.placeholder}
            required
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#ffffff',
              fontSize: 13,
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 400,
              letterSpacing: '0.04em',
            }}
          />

          <button
            type="submit"
            disabled={!email || roleIndex < 0 || status === 'loading'}
            style={{
              background: 'none',
              border: 'none',
              cursor: email && roleIndex >= 0 ? 'pointer' : 'default',
              fontSize: 11,
              fontWeight: 600,
              fontFamily: "'Montserrat', sans-serif",
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color:
                email && roleIndex >= 0
                  ? activeSquare
                    ? activeSquare.color
                    : '#ffffff'
                  : 'rgba(255,255,255,0.2)',
              padding: '0 0 0 16px',
            }}
          >
            {status === 'loading' ? '…' : t.submit}
          </button>
        </form>

        {/* Minimal Feedback */}
        {status !== 'idle' && status !== 'loading' && (
          <p
            style={{
              marginTop: 18,
              fontSize: 11,
              fontFamily: "'Montserrat', sans-serif",
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color:
                status === 'success'
                  ? '#479558'
                  : status === 'duplicate'
                  ? '#e58440'
                  : '#d03736',
            }}
          >
            {t[status]}
          </p>
        )}
      </main>

      {/* ── Footer ── */}
      <footer
        style={{
          display: 'flex',
          justifyContent: 'center',
          fontSize: 10,
          color: 'rgba(255,255,255,0.15)',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
        }}
      >
        ALLWONE
      </footer>
    </div>
  );
}

export default App;
