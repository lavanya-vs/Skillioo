import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";

/* ─── THEME ─────────────────────────────────────────────── */
const T = {
  bg: "#0f1117",
  card: "#16181f",
  surface: "#1e2130",
  border: "rgba(255,255,255,.08)",
  accent: "#4f8ef7",
  violet: "#7c3aed",
  emerald: "#10b981",
  rose: "#f43f5e",
  amber: "#f59e0b",
  text: "#f0f2f8",
  muted: "#6b7a99",
  subtle: "#252836",
};

/* ─── HELPERS ────────────────────────────────────────────── */
const validateEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

const PW_CHECKS = [
  { label: "At least 8 characters", fn: (p) => p.length >= 8 },
  { label: "Uppercase letter (A–Z)", fn: (p) => /[A-Z]/.test(p) },
  { label: "Lowercase letter (a–z)", fn: (p) => /[a-z]/.test(p) },
  { label: "Number (0–9)", fn: (p) => /[0-9]/.test(p) },
  { label: "Special character (!@#…)", fn: (p) => /[^A-Za-z0-9]/.test(p) },
];
const PW_LABELS = ["", "Very Weak", "Weak", "Fair", "Strong", "Very Strong"];
const PW_COLORS = ["", T.rose, T.amber, "#eab308", T.emerald, "#16a34a"];

function getStrength(p) {
  const score = PW_CHECKS.filter((c) => c.fn(p)).length;
  return { score, label: PW_LABELS[score] || "", color: PW_COLORS[score] || T.border };
}

/* ─── GLOBAL STYLES (injected once) ─────────────────────── */
const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,400;0,500;0,600;1,400&family=JetBrains+Mono:wght@400;600&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: 'DM Sans', sans-serif;
  background: ${T.bg};
  color: ${T.text};
  min-height: 100vh;
  -webkit-font-smoothing: antialiased;
}

::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: ${T.bg}; }
::-webkit-scrollbar-thumb { background: ${T.surface}; border-radius: 99px; }

@keyframes floatY   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
@keyframes floatY2  { 0%,100%{transform:translateY(0) rotate(-12deg)} 50%{transform:translateY(-8px) rotate(-8deg)} }
@keyframes twinkle  { 0%,100%{opacity:.25;transform:scale(1)} 50%{opacity:1;transform:scale(1.4)} }
@keyframes spin     { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
@keyframes fadeUp   { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
@keyframes pulse    { 0%,100%{opacity:1} 50%{opacity:.55} }
@keyframes slideIn  { from{opacity:0;transform:translateX(18px)} to{opacity:1;transform:translateX(0)} }
@keyframes popIn    { from{opacity:0;transform:scale(.9)} to{opacity:1;transform:scale(1)} }
@keyframes brainPulse { 0%,100%{transform:scale(1);filter:drop-shadow(0 0 4px #4f8ef788)} 50%{transform:scale(1.12);filter:drop-shadow(0 0 14px #4f8ef7cc)} }
@keyframes orbitDot { from{transform:rotate(0deg) translateX(22px) rotate(0deg)} to{transform:rotate(360deg) translateX(22px) rotate(-360deg)} }
@keyframes barGrow  { from{height:4px} to{height:var(--h)} }
@keyframes typeCursor { 0%,100%{opacity:1} 50%{opacity:0} }
@keyframes progressFill { from{width:0%} to{width:var(--w)} }
@keyframes loginFloat { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-6px)} }
@keyframes checkPop { 0%{transform:scale(0)} 60%{transform:scale(1.3)} 100%{transform:scale(1)} }
@keyframes screenGlow { 0%,100%{box-shadow:0 0 0 0 rgba(79,142,247,0)} 50%{box-shadow:0 0 24px 4px rgba(79,142,247,.22)} }
@keyframes dotBlink    { 0%,100%{opacity:.3} 50%{opacity:1} }
@keyframes waddleX    { 0%,100%{transform:translateX(0) rotate(-3deg)} 50%{transform:translateX(6px) rotate(3deg)} }
@keyframes duckBob    { 0%,100%{transform:translateY(0) rotate(-2deg)} 50%{transform:translateY(-8px) rotate(2deg)} }
@keyframes wingFlap   { 0%,100%{transform:rotate(0deg)} 50%{transform:rotate(-25deg)} }
@keyframes ripple     { 0%{transform:scale(1);opacity:.6} 100%{transform:scale(2.2);opacity:0} }
@keyframes glowPulse  { 0%,100%{box-shadow:0 0 12px rgba(79,142,247,.3)} 50%{box-shadow:0 0 32px rgba(79,142,247,.7)} }
@keyframes float3d    { 0%,100%{transform:translateY(0) scale(1)} 33%{transform:translateY(-10px) scale(1.02)} 66%{transform:translateY(-5px) scale(.99)} }
@keyframes shimmer    { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
@keyframes cardPop    { 0%{opacity:0;transform:scale(.92) translateY(14px)} 100%{opacity:1;transform:scale(1) translateY(0)} }
@keyframes slideRight { 0%{opacity:0;transform:translateX(-20px)} 100%{opacity:1;transform:translateX(0)} }
@keyframes bounceIn   { 0%{transform:scale(0)} 60%{transform:scale(1.15)} 80%{transform:scale(.95)} 100%{transform:scale(1)} }
@keyframes gradShift  { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
@keyframes tickerScroll { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
@keyframes countUp    { 0%{opacity:0;transform:translateY(8px)} 100%{opacity:1;transform:translateY(0)} }
@keyframes duckWalk   { 0%,100%{transform:translateY(0) rotate(-4deg)} 25%{transform:translateY(-5px) rotate(0deg)} 50%{transform:translateY(0) rotate(4deg)} 75%{transform:translateY(-3px) rotate(0deg)} }
@keyframes featherFall { 0%{opacity:0;transform:translateY(-10px) rotate(0deg)} 60%{opacity:1} 100%{opacity:0;transform:translateY(40px) rotate(180deg)} }
@keyframes heartBeat  { 0%,100%{transform:scale(1)} 14%{transform:scale(1.15)} 28%{transform:scale(1)} 42%{transform:scale(1.1)} 70%{transform:scale(1)} }
@keyframes rainbowBorder { 0%{border-color:#4f8ef7} 25%{border-color:#7c3aed} 50%{border-color:#10b981} 75%{border-color:#f59e0b} 100%{border-color:#4f8ef7} }
@keyframes sparkleRotate { 0%{transform:rotate(0deg) scale(1)} 50%{transform:rotate(180deg) scale(1.2)} 100%{transform:rotate(360deg) scale(1)} }
@keyframes morphBlob  { 0%,100%{border-radius:60% 40% 30% 70%/60% 30% 70% 40%} 50%{border-radius:30% 60% 70% 40%/50% 60% 30% 60%} }

.fade-up    { animation: fadeUp .45s ease both; }
.card-pop   { animation: cardPop .4s cubic-bezier(.34,1.56,.64,1) both; }
.slide-right{ animation: slideRight .35s ease both; }
.bounce-in  { animation: bounceIn .5s cubic-bezier(.34,1.56,.64,1) both; }
.duck-walk  { animation: duckWalk .6s ease-in-out infinite; }
.glow-pulse { animation: glowPulse 2s ease-in-out infinite; }
.float-3d   { animation: float3d 4s ease-in-out infinite; }
.slide-in { animation: slideIn .35s ease both; }
.pop-in   { animation: popIn .4s cubic-bezier(.34,1.56,.64,1) both; }

.float-book   { animation: floatY  3.2s ease-in-out infinite; }
.float-pencil { animation: floatY2 2.6s ease-in-out infinite; }
.twinkle1     { animation: twinkle 1.9s ease-in-out infinite; }
.twinkle2     { animation: twinkle 2.5s ease-in-out infinite .7s; }
.twinkle3     { animation: twinkle 2.1s ease-in-out infinite 1.2s; }
.login-float  { animation: loginFloat 3s ease-in-out infinite; }
.screen-glow  { animation: screenGlow 3s ease-in-out infinite; }

input, textarea, select { font-family: 'DM Sans', sans-serif; }

/* ── Extra animations ── */
@keyframes timerPulse  { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.04);opacity:.85} }
@keyframes ringPop     { 0%{transform:scale(.8);opacity:0} 70%{transform:scale(1.1)} 100%{transform:scale(1);opacity:1} }
@keyframes waveFloat   { 0%,100%{transform:translateY(0) scaleX(1)} 33%{transform:translateY(-6px) scaleX(1.02)} 66%{transform:translateY(-3px) scaleX(.98)} }
@keyframes musicNote   { 0%{opacity:0;transform:translateY(0) scale(.8)} 30%{opacity:1} 100%{opacity:0;transform:translateY(-38px) scale(1.2) rotate(15deg)} }
@keyframes breathe     { 0%,100%{transform:scale(1)} 50%{transform:scale(1.07)} }
@keyframes barDance    { 0%,100%{transform:scaleY(.4)} 50%{transform:scaleY(1)} }
@keyframes miniPop     { 0%{transform:scale(0) translateY(20px);opacity:0} 80%{transform:scale(1.06) translateY(-2px)} 100%{transform:scale(1) translateY(0);opacity:1} }
@keyframes slideUp     { 0%{opacity:0;transform:translateY(22px)} 100%{opacity:1;transform:translateY(0)} }
@keyframes toastIn     { 0%{opacity:0;transform:translateX(60px)} 100%{opacity:1;transform:translateX(0)} }
@keyframes rotateSlow  { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
@keyframes neonGlow    { 0%,100%{text-shadow:0 0 4px currentColor,0 0 8px currentColor} 50%{text-shadow:0 0 12px currentColor,0 0 24px currentColor,0 0 40px currentColor} }
@keyframes borderFlow  { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
@keyframes wiggle      { 0%,100%{transform:rotate(0deg)} 25%{transform:rotate(-8deg)} 75%{transform:rotate(8deg)} }
@keyframes dropIn      { 0%{opacity:0;transform:translateY(-16px) scale(.96)} 100%{opacity:1;transform:translateY(0) scale(1)} }

/* Utility classes */
.anim-pop    { animation: ringPop .5s cubic-bezier(.34,1.56,.64,1) both; }
.anim-up     { animation: slideUp .4s ease both; }
.anim-breathe{ animation: breathe 3s ease-in-out infinite; }
.anim-wiggle { animation: wiggle .4s ease; }
@keyframes glare { 0% { transform: translateX(-150%) skewX(-25deg); } 100% { transform: translateX(150%) skewX(-25deg); } }

.premium-btn {
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  background: linear-gradient(135deg, #ff80b5, #f59e0b, #7c3aed, #4f8ef7);
  background-size: 300% 300%;
  animation: gradShift 8s ease infinite;
  box-shadow: 0 8px 24px -8px rgba(255, 128, 181, 0.5), 0 0 16px rgba(124, 58, 237, 0.3);
}

.premium-btn::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 60%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.25),
    transparent
  );
  animation: glare 3.5s infinite linear;
  pointer-events: none;
}

.premium-btn:hover {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 12px 32px -8px rgba(124, 58, 237, 0.6), 0 0 24px rgba(124, 58, 237, 0.4);
}

.premium-btn:active {
  transform: translateY(0) scale(0.98);
}

`;

function injectStyles() {
  if (document.getElementById("skillio-styles")) return;
  const s = document.createElement("style");
  s.id = "skillio-styles";
  s.textContent = GLOBAL_CSS;
  document.head.appendChild(s);
}

/* ─── SPINNER ────────────────────────────────────────────── */
function Spinner({ size = 18, color = T.accent }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ animation: "spin .8s linear infinite", flexShrink: 0 }}>
      <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="3" strokeOpacity=".25" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke={color} strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

/* ─── AVATAR ─────────────────────────────────────────────── */
function Ava({ name = "", size = 40 }) {
  const initials = name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", flexShrink: 0,
      background: `linear-gradient(135deg,${T.accent},${T.violet})`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.36, fontWeight: 700, color: "#fff", fontFamily: "'Syne',sans-serif",
    }}>{initials || "?"}</div>
  );
}

/* ─── INPUT ──────────────────────────────────────────────── */
function Inp({ label, icon, placeholder, value, onChange, error, hint, eye, type = "text" }) {
  const [show, setShow] = useState(false);
  const inputType = eye ? (show ? "text" : "password") : type;
  return (
    <div style={{ marginBottom: 16 }}>
      {label && (
        <div style={{ fontSize: 11, fontWeight: 700, color: T.muted, letterSpacing: ".07em", textTransform: "uppercase", marginBottom: 6, fontFamily: "'JetBrains Mono',monospace" }}>
          {icon && <span style={{ marginRight: 5 }}>{icon}</span>}{label}
        </div>
      )}
      <div style={{ position: "relative" }}>
        <input
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          style={{
            width: "100%", padding: eye ? "11px 42px 11px 14px" : "11px 14px",
            borderRadius: 10, border: `1.5px solid ${error ? T.rose : T.border}`,
            background: T.surface, color: T.text, fontSize: 14, outline: "none",
            transition: "border-color .2s, background .2s",
          }}
          onFocus={(e) => { e.target.style.borderColor = error ? T.rose : T.accent; e.target.style.background = T.card; }}
          onBlur={(e) => { e.target.style.borderColor = error ? T.rose : T.border; e.target.style.background = T.surface; }}
        />
        {eye && (
          <button onClick={() => setShow(!show)} style={{
            position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
            background: "none", border: "none", cursor: "pointer", fontSize: 15, color: T.muted,
          }}>{show ? "🙈" : "👁"}</button>
        )}
      </div>
      {error && <div style={{ fontSize: 11, color: T.rose, marginTop: 5 }}>⚠ {error}</div>}
      {hint && !error && <div style={{ fontSize: 11, color: T.muted, marginTop: 4 }}>{hint}</div>}
    </div>
  );
}

/* ─── BUTTON ─────────────────────────────────────────────── */
function Btn({ children, onClick, fullWidth, variant = "primary", style: sx = {}, disabled }) {
  const base = {
    padding: fullWidth ? "13px" : "11px 20px",
    width: fullWidth ? "100%" : "auto",
    borderRadius: 11, fontSize: 14, fontWeight: 700, cursor: disabled ? "default" : "pointer",
    transition: "opacity .2s, transform .15s", border: "none",
    fontFamily: "'DM Sans',sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
    ...sx,
  };
  if (variant === "ghost") return (
    <button onClick={onClick} disabled={disabled} style={{ ...base, background: "transparent", border: `1.5px solid ${T.border}`, color: T.muted }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = T.accent; e.currentTarget.style.color = T.accent; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.muted; }}
    >{children}</button>
  );
  return (
    <button onClick={onClick} disabled={disabled} style={{ ...base, background: `linear-gradient(135deg,${T.accent},${T.violet})`, color: "#fff", opacity: disabled ? .6 : 1 }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.opacity = ".88"; }}
      onMouseLeave={e => { e.currentTarget.style.opacity = disabled ? ".6" : "1"; }}
      onMouseDown={e => { if (!disabled) e.currentTarget.style.transform = "scale(.97)"; }}
      onMouseUp={e => { e.currentTarget.style.transform = "scale(1)"; }}
    >{children}</button>
  );
}

/* ─── STRENGTH BAR ───────────────────────────────────────── */
function StrengthBar({ password }) {
  if (!password) return null;
  const s = getStrength(password);
  return (
    <div style={{ marginTop: -8, marginBottom: 14 }}>
      <div style={{ display: "flex", gap: 4, marginBottom: 6 }}>
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} style={{ flex: 1, height: 3, borderRadius: 99, background: i <= s.score ? s.color : T.subtle, transition: "background .3s" }} />
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
        <span style={{ fontSize: 11, color: s.color, fontFamily: "'JetBrains Mono',monospace", fontWeight: 700 }}>{s.label}</span>
        <span style={{ fontSize: 11, color: T.muted }}>{s.score}/5</span>
      </div>
      {PW_CHECKS.map(c => (
        <div key={c.label} style={{ display: "flex", gap: 7, alignItems: "center", fontSize: 11, marginBottom: 3 }}>
          <span style={{ color: c.fn(password) ? T.emerald : T.muted, transition: "color .2s" }}>{c.fn(password) ? "✓" : "○"}</span>
          <span style={{ color: c.fn(password) ? T.emerald : T.muted, transition: "color .2s" }}>{c.label}</span>
        </div>
      ))}
    </div>
  );
}

/* ─── FEATURE CARDS ──────────────────────────────────────── */
function FeatureCardBrain() {
  return (
    <div className="fade-up" style={{ flex: 1, background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: "18px 16px", overflow: "hidden", position: "relative" }}>
      <div style={{ position: "relative", width: 44, height: 44, marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width="44" height="44" viewBox="0 0 44 44" style={{ animation: "brainPulse 2.5s ease-in-out infinite", position: "absolute" }}>
          <circle cx="22" cy="22" r="18" fill={"rgba(79,142,247,.15)"} stroke={"#4f8ef7"} strokeWidth="1.2" strokeOpacity=".5" />
          <circle cx="22" cy="22" r="9" fill={"rgba(79,142,247,.2)"} stroke={"#4f8ef7"} strokeWidth="1" strokeOpacity=".6" />
          <circle cx="22" cy="22" r="4" fill={"#4f8ef7"} fillOpacity=".95" />
          <circle cx="22" cy="22" r="1.5" fill="#fff" />
          <line x1="22" y1="4" x2="22" y2="13" stroke={"#4f8ef7"} strokeWidth="1" strokeOpacity=".4" />
          <line x1="22" y1="31" x2="22" y2="40" stroke={"#4f8ef7"} strokeWidth="1" strokeOpacity=".4" />
          <line x1="4" y1="22" x2="13" y2="22" stroke={"#4f8ef7"} strokeWidth="1" strokeOpacity=".4" />
          <line x1="31" y1="22" x2="40" y2="22" stroke={"#4f8ef7"} strokeWidth="1" strokeOpacity=".4" />
        </svg>
        <div style={{ position: "absolute", width: 8, height: 8, borderRadius: "50%", background: "#7c3aed", animation: "orbitDot 2.2s linear infinite", transformOrigin: "0 0", top: "50%", left: "50%", marginTop: -4, marginLeft: -4 }} />
      </div>
      <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 14, color: T.text, marginBottom: 3 }}>AI Tutor</div>
      <div style={{ fontSize: 11, color: T.muted, lineHeight: 1.55 }}>Adapts to your pace in real-time</div>
    </div>
  );
}

function FeatureCardBars() {
  const bars = [
    { h: 14, c: "#6b7a99" },
    { h: 22, c: "#4f8ef7" },
    { h: 30, c: "#4f8ef7" },
    { h: 18, c: "#7c3aed" },
    { h: 36, c: "#10b981" },
  ];
  return (
    <div className="fade-up" style={{ animationDelay: ".1s", flex: 1, background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: "18px 16px", overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 40, marginBottom: 10 }}>
        {bars.map((b, i) => (
          <div key={i} style={{ flex: 1, borderRadius: "3px 3px 0 0", background: b.c, opacity: .85, height: b.h, animation: `barGrow 1.1s ${i * .14 + .2}s ease both` }} />
        ))}
      </div>
      <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 14, color: T.text, marginBottom: 3 }}>Skill Tracks</div>
      <div style={{ fontSize: 11, color: T.muted, lineHeight: 1.55 }}>Visual progress, every step</div>
    </div>
  );
}

function FeatureCardCode() {
  const [frame, setFrame] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setFrame(f => (f + 1) % 4), 900);
    return () => clearInterval(t);
  }, []);
  const lines = [
    <span key={0}><span style={{ color: "#7c3aed" }}>const</span><span style={{ color: "#f0f2f8" }}> learn </span><span style={{ color: "#4f8ef7" }}>=</span><span style={{ color: "#10b981" }}> () =&gt; {"{"}</span></span>,
    <span key={1}><span style={{ color: "#6b7a99" }}>{"  "}</span><span style={{ color: "#f59e0b" }}>skill</span><span style={{ color: "#f0f2f8" }}>.</span><span style={{ color: "#4f8ef7" }}>level</span><span style={{ color: "#f0f2f8" }}> ++</span></span>,
    <span key={2}><span style={{ color: "#10b981" }}>{"// 🚀 mastered!"}</span></span>,
  ];
  return (
    <div className="fade-up" style={{ animationDelay: ".2s", flex: 1, background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: "18px 16px", overflow: "hidden" }}>
      <div style={{ background: T.subtle, borderRadius: 8, padding: "7px 9px", marginBottom: 10, fontFamily: "'JetBrains Mono',monospace", fontSize: 9.5, lineHeight: 1.75, height: 40, overflow: "hidden" }}>
        {lines.slice(0, Math.min(frame + 1, 3)).map((l, i) => (
          <div key={i}>{l}{i === Math.min(frame, 2) && <span style={{ animation: "typeCursor 1s step-end infinite", color: "#4f8ef7" }}>▌</span>}</div>
        ))}
      </div>
      <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 14, color: T.text, marginBottom: 3 }}>Live Sandbox</div>
      <div style={{ fontSize: 11, color: T.muted, lineHeight: 1.55 }}>Code & run inside the course</div>
    </div>
  );
}

/* ─── LOGIN APP ANIMATION ────────────────────────────────── */
function LoginAppAnim() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const delays = [1800, 1400, 1000, 2200];
    let idx = 0;
    function tick() {
      idx = (idx + 1) % 4;
      setStep(idx);
      setTimeout(tick, delays[idx]);
    }
    const t = setTimeout(tick, delays[0]);
    return () => clearTimeout(t);
  }, []);

  const isTyping = step === 1;
  const isChecking = step === 2;
  const isSuccess = step === 3;

  return (
    <div className="login-float" style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
      <div className="screen-glow" style={{ width: 200, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, padding: "14px 14px 16px", position: "relative", boxShadow: "0 4px 32px rgba(0,0,0,.4)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 12 }}>
          <div style={{ display: "flex", gap: 3 }}>
            {["#f43f5e", "#f59e0b", "#10b981"].map(c => <div key={c} style={{ width: 7, height: 7, borderRadius: "50%", background: c, opacity: .7 }} />)}
          </div>
          <div style={{ flex: 1, height: 14, background: T.subtle, borderRadius: 4, display: "flex", alignItems: "center", paddingLeft: 6 }}>
            <span style={{ fontSize: 8, color: T.muted, fontFamily: "'JetBrains Mono',monospace" }}>skillio.app</span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 10 }}>
          <img src="/logo.svg" alt="Skillio Logo" style={{ width: 16, height: 16, borderRadius: 4, objectFit: 'contain' }} />
          <span style={{ fontSize: 10, fontWeight: 800, fontFamily: "'Syne',sans-serif" }}>SKILLIO</span>
        </div>
        <div style={{ background: T.card, border: `1.5px solid ${isTyping ? "#4f8ef7" : T.border}`, borderRadius: 7, padding: "5px 8px", marginBottom: 6, transition: "border-color .3s" }}>
          <div style={{ fontSize: 8, color: T.muted, marginBottom: 2, fontFamily: "'JetBrains Mono',monospace" }}>EMAIL</div>
          <div style={{ fontSize: 9, color: (isTyping || isChecking || isSuccess) ? T.text : T.muted, fontFamily: "'JetBrains Mono',monospace" }}>
            {isTyping ? <><span>you@example</span><span style={{ animation: "typeCursor 1s step-end infinite", color: "#4f8ef7" }}>▌</span></> : (isChecking || isSuccess) ? "you@example.com" : "···"}
          </div>
        </div>
        <div style={{ background: T.card, border: `1.5px solid ${T.border}`, borderRadius: 7, padding: "5px 8px", marginBottom: 10 }}>
          <div style={{ fontSize: 8, color: T.muted, marginBottom: 2, fontFamily: "'JetBrains Mono',monospace" }}>PASSWORD</div>
          <div style={{ fontSize: 9, color: T.muted, letterSpacing: 2 }}>{(isChecking || isSuccess) ? "••••••••" : "••••"}</div>
        </div>
        <div style={{ background: isSuccess ? "linear-gradient(135deg,#10b981,#16a34a)" : isChecking ? "linear-gradient(135deg,#f59e0b,#d97706)" : "linear-gradient(135deg,#4f8ef7,#7c3aed)", borderRadius: 8, padding: "7px", textAlign: "center", fontSize: 10, fontWeight: 700, color: "#fff", transition: "background .4s", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
          {isChecking ? <><span style={{ animation: "spin .7s linear infinite", display: "inline-block" }}>⟳</span><span> Verifying…</span></> : isSuccess ? "✓ Welcome back!" : "Sign In →"}
        </div>
        {isSuccess && (
          <div style={{ position: "absolute", top: -10, right: -10, width: 26, height: 26, borderRadius: "50%", background: "#10b981", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, animation: "checkPop .4s cubic-bezier(.34,1.56,.64,1) both" }}>✓</div>
        )}
        <div style={{ display: "flex", justifyContent: "center", gap: 5, marginTop: 10 }}>
          {[0, 1, 2, 3].map(i => (
            <div key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: i === step ? "#4f8ef7" : T.subtle, transition: "background .3s", animation: i === step ? "dotBlink 1s ease-in-out infinite" : "none" }} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── STUDY ANIMATION SVG ────────────────────────────────── */
function StudyAnim() {
  return (
    <svg width="160" height="140" viewBox="0 0 160 140" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ position: "absolute", bottom: 32, right: 24, opacity: .6 }}>
      <g className="float-book">
        <rect x="8" y="44" width="56" height="72" rx="7" fill={T.accent} fillOpacity=".15" />
        <rect x="14" y="44" width="56" height="72" rx="7" fill={T.accent} fillOpacity=".28" />
        <rect x="14" y="56" width="32" height="3.5" rx="2" fill={T.accent} fillOpacity=".7" />
        <rect x="14" y="66" width="26" height="3" rx="2" fill={T.accent} fillOpacity=".5" />
        <rect x="14" y="76" width="30" height="3" rx="2" fill={T.accent} fillOpacity=".5" />
        <rect x="14" y="86" width="20" height="3" rx="2" fill={T.accent} fillOpacity=".4" />
        <rect x="14" y="96" width="24" height="3" rx="2" fill={T.accent} fillOpacity=".35" />
      </g>
      <g className="float-pencil" style={{ transformOrigin: "90px 30px" }}>
        <rect x="86" y="18" width="11" height="60" rx="2.5" fill={T.amber} fillOpacity=".75" />
        <polygon points="86,78 97,78 91.5,95" fill="#fcd34d" fillOpacity=".9" />
        <rect x="86" y="18" width="11" height="9" rx="2.5" fill="#9ca3af" fillOpacity=".7" />
        <rect x="87" y="79" width="9" height="5" fill={T.amber} fillOpacity=".5" />
      </g>
      <circle className="twinkle1" cx="128" cy="22" r="6" fill={T.violet} fillOpacity=".5" />
      <circle className="twinkle2" cx="24" cy="20" r="5" fill={T.accent} fillOpacity=".4" />
      <circle className="twinkle3" cx="138" cy="68" r="4" fill={T.amber} fillOpacity=".45" />
      <circle className="twinkle1" cx="70" cy="14" r="3.5" fill={T.emerald} fillOpacity=".5" style={{ animationDelay: ".4s" }} />
    </svg>
  );
}

/* ─── AUTH WRAP ──────────────────────────────────────────── */
function AuthWrap({ children }) {
  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: `radial-gradient(ellipse at 20% 50%, rgba(79,142,247,.12) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(124,58,237,.1) 0%, transparent 55%), ${T.bg}`,
      padding: "32px 16px",
    }}>
      {children}
    </div>
  );
}

/* ─── TOAST ──────────────────────────────────────────────── */
function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, []);
  const col = type === "success" ? T.emerald : type === "error" ? T.rose : T.accent;
  return (
    <div style={{
      position: "fixed", top: 24, right: 24, zIndex: 9999,
      background: T.card, border: `1px solid ${col}44`, borderRadius: 12,
      padding: "12px 18px", display: "flex", gap: 10, alignItems: "center",
      boxShadow: `0 4px 24px rgba(0,0,0,.4)`, animation: "popIn .35s ease",
      fontSize: 13, color: T.text, fontWeight: 500,
    }}>
      <span style={{ color: col, fontSize: 16 }}>{type === "success" ? "✓" : type === "error" ? "✕" : "ℹ"}</span>
      {msg}
      <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: T.muted, marginLeft: 6, fontSize: 14 }}>✕</button>
    </div>
  );
}

const featureCardsCss = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap');

  .fc-wrap {
    display: flex;
    gap: 16px;
    padding: 24px 0;
    font-family: 'Space Grotesk', sans-serif;
  }

  .fc-card {
    flex: 1;
    min-width: 0;
    background: #12121e;
    border: 1px solid #1e1e35;
    border-radius: 18px;
    padding: 24px 20px 22px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: transform 0.35s cubic-bezier(.22,1,.36,1), border-color 0.3s, box-shadow 0.35s;
    animation: fc-cardIn 0.6s cubic-bezier(.22,1,.36,1) both;
  }
  .fc-card:nth-child(1) { animation-delay: 0.05s; }
  .fc-card:nth-child(2) { animation-delay: 0.15s; }
  .fc-card:nth-child(3) { animation-delay: 0.25s; }

  .fc-card::before {
    content: '';
    position: absolute;
    inset: 0;
    opacity: 0;
    border-radius: 18px;
    transition: opacity 0.4s;
  }
  .fc-card:hover { transform: translateY(-6px); border-color: #2e2e55; box-shadow: 0 20px 60px rgba(0,0,0,0.5); }
  .fc-card:hover::before { opacity: 1; }
  .fc-card:hover .fc-title { color: #fff; }

  .fc-ai::before    { background: radial-gradient(ellipse at 50% 0%, rgba(66,99,255,0.13) 0%, transparent 70%); }
  .fc-skill::before { background: radial-gradient(ellipse at 50% 0%, rgba(155,89,255,0.13) 0%, transparent 70%); }
  .fc-sand::before  { background: radial-gradient(ellipse at 50% 0%, rgba(16,200,130,0.13) 0%, transparent 70%); }

  .fc-icon {
    width: 48px; height: 48px;
    border-radius: 14px;
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 18px;
    position: relative;
  }
  .fc-ai   .fc-icon { background: rgba(66,99,255,0.15); }
  .fc-skill .fc-icon { background: rgba(155,89,255,0.15); }
  .fc-sand  .fc-icon { background: rgba(16,200,130,0.12); }

  .fc-title { font-size: 16px; font-weight: 700; color: #e8e8f0; margin-bottom: 6px; letter-spacing: -0.3px; transition: color 0.2s; }
  .fc-desc  { font-size: 13px; color: #6b6b8a; line-height: 1.55; }
  .fc-footer { margin-top: 14px; display: flex; align-items: center; gap: 8px; }

  .fc-badge {
    display: inline-flex; align-items: center; gap: 5px;
    font-size: 11px; font-weight: 600; letter-spacing: 0.5px;
    padding: 4px 10px; border-radius: 20px;
  }
  .fc-badge-ai    { background: rgba(66,99,255,0.12);  color: #6b8fff; border: 1px solid rgba(66,99,255,0.22); }
  .fc-badge-skill { background: rgba(155,89,255,0.12); color: #b87fff; border: 1px solid rgba(155,89,255,0.22); }
  .fc-badge-sand  { background: rgba(16,200,130,0.10); color: #10c882; border: 1px solid rgba(16,200,130,0.22); }

  /* AI Tutor - ring pulse */
  .fc-ring {
    position: absolute; inset: 0; border-radius: 14px;
    border: 1.5px solid rgba(66,99,255,0.5);
    animation: fc-ringPulse 2s ease-in-out infinite;
  }
  .fc-ring2 {
    position: absolute; inset: -5px; border-radius: 19px;
    border: 1px solid rgba(66,99,255,0.2);
    animation: fc-ringPulse 2s ease-in-out infinite 0.5s;
  }
  @keyframes fc-ringPulse {
    0%,100% { opacity: 1; transform: scale(1); }
    50%      { opacity: 0.35; transform: scale(1.07); }
  }

  /* AI thinking dots */
  .fc-dots { display: flex; gap: 4px; align-items: center; }
  .fc-dot {
    width: 6px; height: 6px; border-radius: 50%; background: #4263ff;
    animation: fc-dotBounce 1.2s ease-in-out infinite;
  }
  .fc-dot:nth-child(2) { animation-delay: 0.2s; }
  .fc-dot:nth-child(3) { animation-delay: 0.4s; }
  @keyframes fc-dotBounce {
    0%,80%,100% { transform: translateY(0);   opacity: 0.4; }
    40%          { transform: translateY(-5px); opacity: 1; }
  }

  .fc-live-dot {
    width: 7px; height: 7px; border-radius: 50%; background: #4263ff;
    animation: fc-liveBlink 1.4s ease-in-out infinite;
  }
  @keyframes fc-liveBlink { 0%,100%{opacity:1} 50%{opacity:0.2} }

  /* Skill Tracks - bar chart */
  .fc-bars { display: flex; align-items: flex-end; gap: 4px; height: 28px; }
  .fc-bar {
    width: 7px; border-radius: 3px 3px 0 0; background: #9b59ff;
    animation: fc-barGrow 1.8s ease-in-out infinite;
    transform-origin: bottom;
  }
  .fc-bar:nth-child(1) { height: 10px; animation-delay: 0s; }
  .fc-bar:nth-child(2) { height: 18px; animation-delay: 0.2s; }
  .fc-bar:nth-child(3) { height: 24px; animation-delay: 0.4s; }
  .fc-bar:nth-child(4) { height: 14px; animation-delay: 0.6s; }
  @keyframes fc-barGrow {
    0%,100% { opacity: 0.5; transform: scaleY(0.7); }
    50%      { opacity: 1;   transform: scaleY(1); }
  }
  .fc-xp { font-size: 11px; font-weight: 600; color: #9b59ff; animation: fc-xpPop 2s ease-in-out infinite; }
  @keyframes fc-xpPop { 0%,100%{opacity:0.5} 60%{opacity:1} }

  /* Live Sandbox - terminal cursor */
  .fc-terminal { font-family: monospace; font-size: 10px; display: flex; flex-direction: column; gap: 3px; }
  .fc-tline     { color: #10c882; }
  .fc-tline.dim { color: rgba(16,200,130,0.35); }
  .fc-cursor {
    display: inline-block; width: 5px; height: 11px;
    background: #10c882; vertical-align: bottom;
    animation: fc-cursorBlink 1s step-end infinite;
  }
  @keyframes fc-cursorBlink { 0%,100%{opacity:1} 50%{opacity:0} }
  .fc-run-dot {
    width: 7px; height: 7px; border-radius: 50%; background: #10c882;
    animation: fc-runPulse 1.5s ease-in-out infinite;
  }
  @keyframes fc-runPulse {
    0%,100% { transform: scale(1); }
    50%      { transform: scale(1.5); opacity: 0.5; }
  }

  /* Entrance animation */
  @keyframes fc-cardIn {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`;

function FeatureCards() {
  return (
    <>
      <style>{featureCardsCss}</style>

      <div className="fc-wrap">

        {/* AI TUTOR */}
        <div className="fc-card fc-ai">
          <div className="fc-icon">
            <div className="fc-ring" />
            <div className="fc-ring2" />
            <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
              <circle cx="13" cy="11" r="6" stroke="#4263ff" strokeWidth="1.8" />
              <path d="M9 11 Q9 7 13 7 Q17 7 17 11" stroke="#4263ff" strokeWidth="1.5" fill="none" strokeLinecap="round" />
              <line x1="13" y1="17" x2="13" y2="21" stroke="#4263ff" strokeWidth="1.8" strokeLinecap="round" />
              <line x1="10" y1="20" x2="16" y2="20" stroke="#4263ff" strokeWidth="1.8" strokeLinecap="round" />
              <circle cx="11" cy="11" r="1.2" fill="#4263ff" />
              <circle cx="15" cy="11" r="1.2" fill="#4263ff" />
            </svg>
          </div>
          <div className="fc-title">AI Tutor</div>
          <div className="fc-desc">Adapts to your pace in real-time</div>
          <div className="fc-footer">
            <div className="fc-dots">
              <div className="fc-dot" />
              <div className="fc-dot" />
              <div className="fc-dot" />
            </div>
            <div className="fc-badge fc-badge-ai">
              <div className="fc-live-dot" />
              LIVE
            </div>
          </div>
        </div>

        {/* SKILL TRACKS */}
        <div className="fc-card fc-skill">
          <div className="fc-icon">
            <div className="fc-bars">
              <div className="fc-bar" />
              <div className="fc-bar" />
              <div className="fc-bar" />
              <div className="fc-bar" />
            </div>
          </div>
          <div className="fc-title">Skill Tracks</div>
          <div className="fc-desc">Visual progress, every step</div>
          <div className="fc-footer">
            <div className="fc-badge fc-badge-skill">
              <span className="fc-xp">+XP</span>
            </div>
            <span style={{ fontSize: 11, color: "#6b6b8a", fontWeight: 500 }}>
              Level up daily
            </span>
          </div>
        </div>

        {/* LIVE SANDBOX */}
        <div className="fc-card fc-sand">
          <div className="fc-icon">
            <div className="fc-terminal">
              <div className="fc-tline dim">&gt; run</div>
              <div className="fc-tline">
                OK <span className="fc-cursor" />
              </div>
            </div>
          </div>
          <div className="fc-title">Live Sandbox</div>
          <div className="fc-desc">Code &amp; run inside the course</div>
          <div className="fc-footer">
            <div className="fc-badge fc-badge-sand">
              <div className="fc-run-dot" />
              RUNNING
            </div>
          </div>
        </div>

      </div>
    </>
  );
}

function TypingHeading() {
  const [text1, setText1] = useState("");
  const [text2, setText2] = useState("");
  const [phase, setPhase] = useState("type1");
  const [cursorVisible, setCursorVisible] = useState(true);

  const full1 = "Learn smarter.";
  const full2 = "Grow faster.";

  useEffect(() => {
    let timeout;
    if (phase === "type1") {
      setCursorVisible(true);
      if (text1.length < full1.length) {
        timeout = setTimeout(() => setText1(full1.slice(0, text1.length + 1)), 80);
      } else {
        setPhase("pause1");
      }
    } else if (phase === "pause1") {
      setCursorVisible(false);
      timeout = setTimeout(() => {
        setText1("");
        setPhase("type2");
      }, 1000);
    } else if (phase === "type2") {
      setCursorVisible(true);
      if (text2.length < full2.length) {
        timeout = setTimeout(() => setText2(full2.slice(0, text2.length + 1)), 80);
      } else {
        setPhase("pause2");
      }
    } else if (phase === "pause2") {
      setCursorVisible(false);
      timeout = setTimeout(() => {
        setText2("");
        setPhase("type1");
      }, 1000);
    }
    return () => clearTimeout(timeout);
  }, [text1, text2, phase]);
  return (
    <div style={{ position: 'relative', marginBottom: 24 }}>
      <h1 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 900, fontSize: 72, lineHeight: 1.0, letterSpacing: "-.03em", maxWidth: 560, height: 160 }}>
        {phase.includes("1") && (
          <span style={{ color: "#fff", display: "block" }}>
            {text1}
            {cursorVisible && <span style={{ borderRight: "4px solid #fff", animation: "fc-cursorBlink 1s step-end infinite", marginLeft: 4 }}></span>}
          </span>
        )}
        {phase.includes("2") && (
          <span style={{ color: "#4f8ef7", display: "block" }}>
            {text2}
            {cursorVisible && <span style={{ borderRight: "4px solid #4f8ef7", animation: "fc-cursorBlink 1s step-end infinite", marginLeft: 4 }}></span>}
          </span>
        )}
      </h1>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   LOGIN PAGE
══════════════════════════════════════════════════════════ */
function LoginPage({ go, onLogin }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);
  const [remember, setRemember] = useState(false);
  const [errors, setErrors] = useState({});
  const [provider, setProvider] = useState(null);
  const [toast, setToast] = useState(null);

  const ACCOUNTS = [
    { name: "Deepa Shastry", email: "deepa@gmail.com" },
    { name: "Lavanya V S", email: "lavanya@gmail.com" },
  ];

  const validate = () => {
    const e = {};
    if (!email) e.email = "Email is required";
    else if (!validateEmail(email)) e.email = "Enter a valid email";
    if (!pass) e.pass = "Password is required";
    else if (pass.length < 8) e.pass = "Must be at least 8 characters";
    return e;
  };

  const submit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({}); setLoading(true);
    try {
      // BACKEND CALL
      const res = await fetch("http://localhost:5011/api/login", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: pass })
      });
      const data = await res.json();
      setLoading(false);
      if (!res.ok) return setErrors({ pass: data.error });
      onLogin(data.user);
    } catch (err) {
      setLoading(false);
      setErrors({ pass: "Connection failed" });
    }
  };

  const emailOk = validateEmail(email);
  const passOk = pass.length >= 8;

  return (
    <div style={{ height: "100vh", display: "flex", background: "#08090e", fontFamily: "'DM Sans',sans-serif", color: "#f0f2f8", position: "relative", overflow: "hidden" }}>
      {/* BG glow blobs */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", top: "-10%", left: "5%", width: 500, height: 500, borderRadius: "50%", background: "rgba(124,58,237,.13)", filter: "blur(120px)" }} />
        <div style={{ position: "absolute", bottom: "5%", left: "30%", width: 400, height: 400, borderRadius: "50%", background: "rgba(79,142,247,.10)", filter: "blur(100px)" }} />
        <div style={{ position: "absolute", top: "20%", right: "5%", width: 300, height: 300, borderRadius: "50%", background: "rgba(124,58,237,.08)", filter: "blur(80px)" }} />
      </div>

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {/* PROVIDER MODAL */}
      {provider && (
        <div onClick={() => setProvider(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, backdropFilter: "blur(10px)" }}>
          <div onClick={e => e.stopPropagation()} className="pop-in" style={{ background: "#13151d", border: "1px solid rgba(255,255,255,.1)", borderRadius: 20, padding: 30, width: 380 }}>
            <div style={{ textAlign: "center", marginBottom: 22 }}>
              <div style={{ fontSize: 34, marginBottom: 8 }}>{provider === "Google" ? "🔵" : "⚫"}</div>
              <h3 style={{ fontWeight: 800, fontSize: 17, marginBottom: 4, fontFamily: "'Syne',sans-serif" }}>Sign in with {provider}</h3>
              <p style={{ color: "#6b7a99", fontSize: 13 }}>Choose an account to continue</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 9, marginBottom: 14 }}>
              {ACCOUNTS.map((acc, i) => (
                <button key={i} onClick={async () => { 
                  setProvider(null); setLoading(true); 
                  try {
                    const res = await fetch("http://localhost:5011/api/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: acc.email }) });
                    const data = await res.json();
                    setLoading(false);
                    onLogin(data.user || acc);
                  } catch(e) { setLoading(false); onLogin(acc); }
                }}
                  style={{ display: "flex", gap: 13, alignItems: "center", padding: "13px 14px", borderRadius: 12, border: "1px solid rgba(255,255,255,.08)", background: "#1e2130", cursor: "pointer", color: "#f0f2f8", textAlign: "left", transition: "border-color .2s" }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = "#4f8ef7"}
                  onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,.08)"}>
                  <Ava name={acc.name} size={38} />
                  <div><div style={{ fontWeight: 600, fontSize: 14 }}>{acc.name}</div><div style={{ fontSize: 12, color: "#6b7a99" }}>{acc.email}</div></div>
                </button>
              ))}
            </div>
            <button onClick={() => { setProvider(null); go("register"); }} style={{ width: "100%", padding: 11, borderRadius: 11, border: "1px dashed rgba(255,255,255,.15)", background: "transparent", color: "#6b7a99", cursor: "pointer", fontSize: 13 }}>
              + Use another account
            </button>
          </div>
        </div>
      )}

      {/* ── ABSOLUTE TOP HEADER ── */}
      <div style={{ position: "absolute", top: 40, left: 72, right: "calc(480px + 72px)", display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <img src="/logo.svg" alt="Skillio Logo" style={{ width: 44, height: 44, borderRadius: 14, objectFit: 'contain', boxShadow: "0 0 32px rgba(124,58,237,.5)" }} />
          <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 900, fontSize: 26, letterSpacing: ".04em", textTransform: "uppercase", color: "#fff" }}>SKILLIO</span>
        </div>
        <div
          className="premium-btn"
          onClick={() => go("register")}
          style={{
            fontSize: 13, fontWeight: 700, cursor: "pointer",
            fontFamily: "'DM Sans',sans-serif",
            padding: "10px 22px", borderRadius: 99,
            color: "#fff",
            border: "none",
            zIndex: 1
          }}
        >
          Explore Courses ↗
        </div>
      </div>

      {/* ── LEFT — full viewport hero ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "120px 72px 60px 72px", position: "relative", zIndex: 1, height: "100vh", overflowY: "auto" }}>
        <div style={{ margin: "auto 0" }}>
        {/* Hero text */}
        <TypingHeading />
        <p style={{ fontSize: 18, color: "rgba(255,255,255,.55)", lineHeight: 1.75, maxWidth: 440, marginBottom: 36 }}>
          AI-powered courses designed for the modern learner. Master new skills at your own pace .
        </p>

        {/* Feature cards — 3 wide */}
        <div style={{ maxWidth: 740, marginBottom: 28, marginLeft: -12 }}>
          <FeatureCards />
        </div>

        {/* Review */}
        <div style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 16, padding: "20px 22px", maxWidth: 440, backdropFilter: "blur(8px)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
            <Ava name="Lavanya V S" size={40} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: "#f0f2f8" }}>Lavanya V S</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,.4)" }}>Full_stack· Bengaluru</div>
            </div>
            <div style={{ fontSize: 9, fontWeight: 700, padding: "3px 8px", borderRadius: 99, background: "rgba(16,185,129,.18)", color: "#10b981", fontFamily: "'JetBrains Mono',monospace", letterSpacing: ".05em" }}>✔ VERIFIED</div>
          </div>
          <div style={{ color: "#f59e0b", fontSize: 12, marginBottom: 8 }}>★★★★★</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,.5)", lineHeight: 1.7, fontStyle: "italic" }}>"Skillio completely transformed how I learn — it's like having a personal mentor available 24/7."</div>
        </div>
        </div>
      </div>

      {/* ── RIGHT — form panel ── */}
      <div style={{ width: 480, background: "rgba(255,255,255,.028)", borderLeft: "1px solid rgba(255,255,255,.07)", backdropFilter: "blur(24px)", display: "flex", flexDirection: "column", justifyContent: "flex-start", padding: "60px 44px 40px", overflowY: "auto", position: "relative", zIndex: 1, height: "100vh" }}>

        {/* Animated mini app preview */}
        <div style={{ marginBottom: 24, marginTop: "auto" }}>
          <LoginAppAnim />
        </div>

        {/* Skillio icon + Welcome back */}
        <div style={{ textAlign: "center", marginBottom: 18 }}>
          <img src="/logo.svg" alt="Skillio Logo" style={{ width: 56, height: 56, borderRadius: 16, objectFit: 'contain', margin: "0 auto 14px", boxShadow: "0 0 40px rgba(124,58,237,.5)", animation: "floatY 3s ease-in-out infinite" }} />
          <style>{`@import url('https://fonts.googleapis.com/css2?family=Pacifico&display=swap');`}</style>
          <h2 style={{ fontFamily: "'Pacifico', cursive", fontWeight: 400, fontSize: 32, letterSpacing: "-.01em", marginBottom: 6, color: "#fff" }}>Welcome back</h2>
          <p style={{ color: "rgba(255,255,255,.45)", fontSize: 14 }}>Sign in to continue your learning journey</p>
        </div>

        {/* Social buttons */}
        <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
          {[["🔵", "Google"], ["⚫", "GitHub"]].map(([ic, lb]) => (
            <button key={lb} onClick={() => setProvider(lb)}
              style={{ flex: 1, padding: "11px", borderRadius: 12, border: "1px solid rgba(255,255,255,.1)", background: "rgba(255,255,255,.05)", color: "#f0f2f8", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", gap: 8, alignItems: "center", justifyContent: "center", transition: "border-color .2s,background .2s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#4f8ef7"; e.currentTarget.style.background = "rgba(79,142,247,.12)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,.1)"; e.currentTarget.style.background = "rgba(255,255,255,.05)"; }}>
              <span style={{ fontSize: 16 }}>{ic}</span>{lb}
            </button>
          ))}
        </div>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,.08)" }} />
          <span style={{ fontSize: 11, color: "rgba(255,255,255,.3)", fontFamily: "'JetBrains Mono',monospace", letterSpacing: ".06em" }}>OR</span>
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,.08)" }} />
        </div>

        {/* Email field */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,.4)", letterSpacing: ".08em", textTransform: "uppercase", fontFamily: "'JetBrains Mono',monospace", marginBottom: 8 }}>✉ Email Address</div>
          <input type="email" placeholder="you@example.com" value={email}
            onChange={e => { setEmail(e.target.value); setErrors(r => ({ ...r, email: "" })); }}
            style={{ width: "100%", padding: "13px 16px", borderRadius: 12, border: errors.email ? "1.5px solid #f43f5e" : (emailOk && email ? "1.5px solid #4f8ef7" : "1.5px solid rgba(255,255,255,.1)"), background: "rgba(255,255,255,.05)", color: "#f0f2f8", fontSize: 14, outline: "none", transition: "border-color .2s", fontFamily: "'DM Sans',sans-serif" }}
            onFocus={e => e.target.style.background = "rgba(79,142,247,.08)"}
            onBlur={e => e.target.style.background = "rgba(255,255,255,.05)"}
          />
          {errors.email && <div style={{ fontSize: 11, color: "#f43f5e", marginTop: 4 }}>⚠ {errors.email}</div>}
          {/* Criteria Checker for Email */}
          <div style={{ display: "flex", gap: 12, marginTop: 10 }}>
            <div style={{ fontSize: 11, color: email.includes("@") ? "#10b981" : "rgba(255,255,255,.3)", display: "flex", alignItems: "center", gap: 4, transition: "color .2s" }}>
              <span style={{ fontSize: 13 }}>{email.includes("@") ? "✓" : "○"}</span> Contains @
            </div>
            <div style={{ fontSize: 11, color: email.length > 5 && email.includes(".") ? "#10b981" : "rgba(255,255,255,.3)", display: "flex", alignItems: "center", gap: 4, transition: "color .2s" }}>
              <span style={{ fontSize: 13 }}>{email.length > 5 && email.includes(".") ? "✓" : "○"}</span> Valid domain
            </div>
          </div>
        </div>

        {/* Password field */}
        <div style={{ marginBottom: 16, position: "relative" }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,.4)", letterSpacing: ".08em", textTransform: "uppercase", fontFamily: "'JetBrains Mono',monospace", marginBottom: 8 }}>🔒 Password</div>
          <div style={{ position: "relative" }}>
            <input type={remember ? "text" : "password"} placeholder="Min 8 characters" value={pass}
              onChange={e => { setPass(e.target.value); setErrors(r => ({ ...r, pass: "" })); }}
              style={{ width: "100%", padding: "13px 44px 13px 16px", borderRadius: 12, border: errors.pass ? "1.5px solid #f43f5e" : (passOk && pass ? "1.5px solid #4f8ef7" : "1.5px solid rgba(255,255,255,.1)"), background: "rgba(255,255,255,.05)", color: "#f0f2f8", fontSize: 14, outline: "none", transition: "border-color .2s", fontFamily: "'DM Sans',sans-serif" }}
              onFocus={e => e.target.style.background = "rgba(79,142,247,.08)"}
              onBlur={e => e.target.style.background = "rgba(255,255,255,.05)"}
            />
            <button onClick={() => setRemember(!remember)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "rgba(255,255,255,.4)" }}>
              {remember ? "🙈" : "👁"}
            </button>
          </div>
          {errors.pass && <div style={{ fontSize: 11, color: "#f43f5e", marginTop: 4 }}>⚠ {errors.pass}</div>}
          {/* Criteria Checker for Password */}
          <div style={{ display: "flex", gap: 12, marginTop: 10, flexWrap: "wrap" }}>
            <div style={{ fontSize: 11, color: pass.length >= 8 ? "#10b981" : "rgba(255,255,255,.3)", display: "flex", alignItems: "center", gap: 4, transition: "color .2s" }}>
              <span style={{ fontSize: 13 }}>{pass.length >= 8 ? "✓" : "○"}</span> 8+ chars
            </div>
            <div style={{ fontSize: 11, color: /[A-Z]/.test(pass) ? "#10b981" : "rgba(255,255,255,.3)", display: "flex", alignItems: "center", gap: 4, transition: "color .2s" }}>
              <span style={{ fontSize: 13 }}>{/[A-Z]/.test(pass) ? "✓" : "○"}</span> 1 Uppercase
            </div>
            <div style={{ fontSize: 11, color: /[0-9!@#$%^&*]/.test(pass) ? "#10b981" : "rgba(255,255,255,.3)", display: "flex", alignItems: "center", gap: 4, transition: "color .2s" }}>
              <span style={{ fontSize: 13 }}>{/[0-9!@#$%^&*]/.test(pass) ? "✓" : "○"}</span> Number/Symbol
            </div>
          </div>
        </div>

        {/* Forgot */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 20 }}>
          <span onClick={() => go("forgot")} style={{ fontSize: 12, color: "#4f8ef7", cursor: "pointer", fontWeight: 700 }}>Forgot password?</span>
        </div>

        {/* Sign in button */}
        <button onClick={submit} disabled={loading}
          style={{ width: "100%", padding: "14px", borderRadius: 13, background: loading ? "linear-gradient(135deg,#f59e0b,#f97316)" : "linear-gradient(270deg,#7c3aed,#4f8ef7,#7c3aed)", backgroundSize: "300% 300%", color: "#fff", border: "none", cursor: loading ? "default" : "pointer", fontSize: 15, fontWeight: 800, letterSpacing: ".01em", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 16, transition: "opacity .2s,transform .15s", boxShadow: loading ? "0 4px 24px rgba(245,158,11,.4)" : "0 4px 24px rgba(124,58,237,.4)", opacity: loading ? .9 : 1, fontFamily: "'Syne',sans-serif", animation: loading ? "none" : "gradShift 3s ease infinite" }}
          onMouseDown={e => { if (!loading) e.currentTarget.style.transform = "scale(.98)"; }}
          onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}>
          {loading ? <><Spinner color="#fff" /> Verifying…</> : "Sign In →"}
        </button>

        <p style={{ textAlign: "center", fontSize: 13, color: "rgba(255,255,255,.35)", marginBottom: 18 }}>
          No account? <span onClick={() => go("register")} style={{ color: "#4f8ef7", cursor: "pointer", fontWeight: 700 }}>Create one free</span>
        </p>

        {/* SSL */}
        <div style={{ display: "flex", justifyContent: "center", gap: 6, padding: "8px 14px", borderRadius: 99, background: "rgba(16,185,129,.06)", border: "1px solid rgba(16,185,129,.18)", marginTop: "auto", flexShrink: 0 }}>
          <span style={{ fontSize: 11 }}>🔒</span>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,.3)", fontFamily: "'JetBrains Mono',monospace" }}>Eager to grow?</span>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   REGISTER PAGE
══════════════════════════════════════════════════════════ */
function RegisterPage({ go, onLogin }) {
  const [step, setStep] = useState(1);
  const [processing, setProcessing] = useState(false);
  const [processStep, setProcessStep] = useState(0);
  const [finalDone, setFinalDone] = useState(false);

  // Step 1
  const [name, setName] = useState(""), [email, setEmail] = useState("");
  const [errors1, setErrors1] = useState({});
  // Step 2
  const [pass, setPass] = useState(""), [confirm, setConfirm] = useState(""), [agreed, setAgreed] = useState(false);
  const [errors2, setErrors2] = useState({});
  // Step 3
  const [dName, setDName] = useState(""), [dEmail, setDEmail] = useState(""), [dPass, setDPass] = useState(""), [dConfirm, setDConfirm] = useState("");
  const [errors3, setErrors3] = useState({});

  const processLabels = ["Verifying email…", "Setting up profile…", "Configuring AI tutor…", "Almost there…"];

  const goStep2 = () => {
    const e = {};
    if (!name.trim()) e.name = "Full name required";
    else if (name.trim().split(" ").length < 2) e.name = "Enter first & last name";
    if (!email) e.email = "Email is required";
    else if (!validateEmail(email)) e.email = "Enter a valid email";
    if (Object.keys(e).length) { setErrors1(e); return; }
    setErrors1({}); setStep(2);
  };

  const goStep3 = () => {
    const e = {};
    if (getStrength(pass).score < 3) e.pass = "Password too weak — meet at least 3 criteria";
    if (pass !== confirm) e.confirm = "Passwords don't match";
    if (!agreed) e.agreed = "You must agree to continue";
    if (Object.keys(e).length) { setErrors2(e); return; }
    setErrors2({}); setProcessing(true); setProcessStep(0);
    let i = 0;
    const timer = setInterval(() => {
      i++; setProcessStep(i);
      if (i >= processLabels.length) {
        clearInterval(timer);
        setTimeout(() => { setProcessing(false); setDName(name); setDEmail(email); setStep(3); }, 600);
      }
    }, 700);
  };

  const finish = async () => {
    const e = {};
    if (!dName.trim() || dName.trim().split(" ").length < 2) e.name = "First & last name required";
    if (!validateEmail(dEmail)) e.email = "Invalid email";
    if (getStrength(dPass).score < 3) e.pass = "Password too weak";
    if (dPass !== dConfirm) e.confirm = "Passwords don't match";
    if (Object.keys(e).length) { setErrors3(e); return; }
    setErrors3({}); 
    try {
      const res = await fetch("http://localhost:5011/api/register", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: dName, email: dEmail, password: dPass })
      });
      const data = await res.json();
      if (!res.ok) { setErrors3({ pass: data.error }); return; }
      setFinalDone(true);
      setTimeout(() => onLogin(data.user), 1800);
    } catch(err) {
      setErrors3({ pass: "Server connection failed" });
    }
  };

  const StepCircle = ({ n }) => {
    const done = n < step, active = n === step;
    return (
      <div style={{
        width: 30, height: 30, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 13, fontWeight: 700, flexShrink: 0, transition: "all .3s",
        background: done ? T.emerald : active ? `linear-gradient(135deg,${T.accent},${T.violet})` : T.surface,
        border: `1.5px solid ${done ? T.emerald : active ? "transparent" : T.border}`,
        color: (done || active) ? "#fff" : T.muted,
      }}>{done ? "✓" : n}</div>
    );
  };

  if (processing) return (
    <AuthWrap>
      <div className="pop-in" style={{ maxWidth: 400, width: "100%", textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 22, display: "inline-block", animation: "spin 2s linear infinite" }}>⚙️</div>
        <h2 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 19, marginBottom: 7 }}>Setting up your account</h2>
        <p style={{ color: T.muted, fontSize: 13, marginBottom: 28 }}>This takes just a moment…</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 9, textAlign: "left" }}>
          {processLabels.map((l, i) => (
            <div key={i} style={{ display: "flex", gap: 11, alignItems: "center", padding: "11px 14px", borderRadius: 10, background: i < processStep ? `${T.emerald}12` : T.surface, border: `1px solid ${i < processStep ? T.emerald + "44" : T.border}`, transition: "all .4s" }}>
              <div style={{ width: 18, height: 18, borderRadius: "50%", background: i < processStep ? T.emerald : T.subtle, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, flexShrink: 0, color: "#fff" }}>{i < processStep ? "✓" : ""}</div>
              <span style={{ fontSize: 13, color: i < processStep ? T.emerald : T.muted }}>{l}</span>
            </div>
          ))}
        </div>
      </div>
    </AuthWrap>
  );

  if (finalDone) return (
    <AuthWrap>
      <div className="pop-in" style={{ maxWidth: 400, width: "100%", textAlign: "center" }}>
        <div style={{ fontSize: 64, marginBottom: 14 }}>🎉</div>
        <h2 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 24, marginBottom: 8 }}>Welcome, {dName.split(" ")[0]}!</h2>
        <p style={{ color: T.muted, fontSize: 14, marginBottom: 24 }}>Your AI-powered learning journey starts now.</p>
        <div style={{ display: "flex", justifyContent: "center" }}><Spinner size={24} /></div>
      </div>
    </AuthWrap>
  );

  return (
    <AuthWrap>
      <div className="fade-up" style={{ maxWidth: 460, width: "100%", background: T.card, border: `1px solid ${T.border}`, borderRadius: 22, padding: "44px 40px", boxShadow: "0 8px 48px rgba(0,0,0,.4)" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ width: 50, height: 50, borderRadius: 14, background: `linear-gradient(135deg,${T.accent},${T.violet})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, margin: "0 auto 14px" }}>🚀</div>
          <h1 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 24, letterSpacing: "-.02em", marginBottom: 5 }}>Create Account</h1>
          <p style={{ color: T.muted, fontSize: 14 }}>Join thousands of AI-powered learners</p>
        </div>

        {/* Steps */}
        <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 28 }}>
          {[1, 2, 3].map((s, i) => (
            <div key={s} style={{ display: "contents" }}>
              <StepCircle n={s} />
              {i < 2 && <div style={{ flex: 1, height: 2, borderRadius: 99, background: s < step ? `linear-gradient(90deg,${T.accent},${T.violet})` : T.border, transition: "background .4s" }} />}
            </div>
          ))}
          <span style={{ fontSize: 11, color: T.muted, fontFamily: "'JetBrains Mono',monospace", flexShrink: 0 }}>Step {step}/3</span>
        </div>

        {/* STEP 1 */}
        {step === 1 && (
          <div className="slide-in">
            <Inp label="Full Name" icon="👤" placeholder="Jane Doe" value={name} onChange={e => { setName(e.target.value); setErrors1(r => ({ ...r, name: "" })); }} error={errors1.name} hint="First and last name required" />
            <Inp label="Email Address" icon="✉" placeholder="jane@example.com" value={email} onChange={e => { setEmail(e.target.value); setErrors1(r => ({ ...r, email: "" })); }} error={errors1.email} />
            <Btn fullWidth onClick={goStep2} style={{ marginBottom: 14 }}>Continue →</Btn>
            <p style={{ textAlign: "center", fontSize: 13, color: T.muted }}>Already have an account? <span onClick={() => go("login")} style={{ color: T.accent, cursor: "pointer", fontWeight: 700 }}>Sign in</span></p>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="slide-in">
            <Inp label="Password" eye icon="🔒" placeholder="Create a strong password" value={pass} onChange={e => { setPass(e.target.value); setErrors2(r => ({ ...r, pass: "" })); }} error={errors2.pass} />
            <StrengthBar password={pass} />
            <Inp label="Confirm Password" eye icon="🛡" placeholder="Repeat your password" value={confirm} onChange={e => { setConfirm(e.target.value); setErrors2(r => ({ ...r, confirm: "" })); }} error={errors2.confirm} />
            <div style={{ display: "flex", gap: 9, marginBottom: 7, alignItems: "flex-start" }}>
              <div onClick={() => setAgreed(!agreed)} style={{ width: 17, height: 17, borderRadius: 4, border: `2px solid ${agreed ? T.accent : errors2.agreed ? T.rose : T.border}`, background: agreed ? `${T.accent}25` : "transparent", cursor: "pointer", flexShrink: 0, marginTop: 2, display: "flex", alignItems: "center", justifyContent: "center", transition: "all .2s" }}>
                {agreed && <span style={{ color: T.accent, fontSize: 10, fontWeight: 900 }}>✓</span>}
              </div>
              <span style={{ fontSize: 12, color: T.muted, lineHeight: 1.6 }}>I agree to the <span style={{ color: T.accent, cursor: "pointer" }}>Terms of Service</span> and <span style={{ color: T.accent, cursor: "pointer" }}>Privacy Policy</span></span>
            </div>
            {errors2.agreed && <div style={{ fontSize: 11, color: T.rose, marginBottom: 11 }}>⚠ {errors2.agreed}</div>}
            <div style={{ display: "flex", gap: 9, marginTop: 12 }}>
              <Btn variant="ghost" onClick={() => setStep(1)}>← Back</Btn>
              <Btn fullWidth onClick={goStep3}>Verify & Continue →</Btn>
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div className="slide-in">
            <div style={{ padding: "12px 14px", borderRadius: 11, background: `${T.emerald}10`, border: `1px solid ${T.emerald}33`, marginBottom: 18, display: "flex", gap: 10, alignItems: "center" }}>
              <span style={{ fontSize: 18 }}>✉️</span>
              <div><div style={{ fontSize: 13, fontWeight: 700, color: T.emerald }}>Email verified!</div><div style={{ fontSize: 12, color: T.muted }}>Now set up your public profile</div></div>
            </div>
            <Inp label="Display Name" icon="👤" placeholder="How should we call you?" value={dName} onChange={e => { setDName(e.target.value); setErrors3(r => ({ ...r, name: "" })); }} error={errors3.name} hint="Visible to other learners" />
            <Inp label="Email (Confirm)" icon="✉" placeholder={email} value={dEmail} onChange={e => { setDEmail(e.target.value); setErrors3(r => ({ ...r, email: "" })); }} error={errors3.email} />
            <Inp label="Create Password" eye icon="🔒" placeholder="Min 8 characters" value={dPass} onChange={e => { setDPass(e.target.value); setErrors3(r => ({ ...r, pass: "" })); }} error={errors3.pass} />
            <StrengthBar password={dPass} />
            <Inp label="Confirm Password" eye icon="🛡" placeholder="Repeat password" value={dConfirm} onChange={e => { setDConfirm(e.target.value); setErrors3(r => ({ ...r, confirm: "" })); }} error={errors3.confirm} />
            <Btn fullWidth onClick={finish} style={{ marginTop: 4 }}>🚀 Create My Account</Btn>
          </div>
        )}
      </div>
    </AuthWrap>
  );
}

/* ══════════════════════════════════════════════════════════
   FORGOT PAGE
══════════════════════════════════════════════════════════ */
function ForgotPage({ go }) {
  const [email, setEmail] = useState(""), [sent, setSent] = useState(false), [error, setError] = useState(""), [loading, setLoading] = useState(false);

  const submit = () => {
    if (!validateEmail(email)) { setError("Please enter a valid email address"); return; }
    setError(""); setLoading(true);
    setTimeout(() => { setLoading(false); setSent(true); }, 1000);
  };

  return (
    <AuthWrap>
      <div className="fade-up" style={{ maxWidth: 400, width: "100%", background: T.card, border: `1px solid ${T.border}`, borderRadius: 22, padding: "44px 40px", boxShadow: "0 8px 48px rgba(0,0,0,.4)" }}>
        <div style={{ textAlign: "center", marginBottom: 26 }}>
          <div style={{ fontSize: 52, marginBottom: 14 }}>{sent ? "📬" : "🔑"}</div>
          <h1 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 22, marginBottom: 6 }}>{sent ? "Check Your Email" : "Reset Password"}</h1>
          <p style={{ color: T.muted, fontSize: 13, lineHeight: 1.7 }}>{sent ? `A reset link was sent to ${email}` : "Enter your email — we'll send a secure reset link"}</p>
        </div>

        {!sent ? (
          <>
            <Inp label="Email Address" icon="✉" placeholder="you@example.com" value={email} onChange={e => { setEmail(e.target.value); setError(""); }} error={error} />
            <Btn fullWidth onClick={submit} disabled={loading} style={{ marginBottom: 14 }}>
              {loading ? <><Spinner /> Sending…</> : "Send Reset Link →"}
            </Btn>
          </>
        ) : (
          <div style={{ padding: 18, borderRadius: 12, background: `${T.emerald}0f`, border: `1px solid ${T.emerald}33`, textAlign: "center", marginBottom: 18 }}>
            <p style={{ color: T.emerald, fontSize: 13 }}>✓ Reset link sent! Check your spam folder too.</p>
          </div>
        )}

        <button onClick={() => go("login")} style={{ display: "block", margin: "0 auto", background: "none", border: "none", color: T.muted, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>← Back to Sign In</button>
      </div>
    </AuthWrap>
  );
}

/* ══════════════════════════════════════════════════════════
   DASHBOARD — CHARTS & UTILS
══════════════════════════════════════════════════════════ */

function Sparkline({ data, color, width = 80, height = 32 }) {
  const max = Math.max(...data), min = Math.min(...data);
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / (max - min || 1)) * (height - 4) - 2;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width={width} height={height} style={{ display: "block" }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity=".9" />
    </svg>
  );
}

function DonutChart({ segments, size = 120, stroke = 14, label, sublabel }) {
  const total = segments.reduce((s, x) => s + x.v, 0);
  const r = (size - stroke) / 2, c = size / 2, circ = 2 * Math.PI * r;
  let offset = 0;
  return (
    <svg width={size} height={size} style={{ display: "block" }}>
      <circle cx={c} cy={c} r={r} fill="none" stroke="rgba(255,255,255,.06)" strokeWidth={stroke} />
      {segments.map((seg, i) => {
        const dash = (seg.v / total) * circ, gap = circ - dash;
        const el = (
          <circle key={i} cx={c} cy={c} r={r} fill="none" stroke={seg.color} strokeWidth={stroke}
            strokeDasharray={`${dash} ${gap}`} strokeLinecap="butt"
            transform={`rotate(${(offset / total) * 360 - 90} ${c} ${c})`}
            style={{ transition: "stroke-dasharray 1.2s ease" }} />
        );
        offset += seg.v; return el;
      })}
      {label && <text x={c} y={c - 6} textAnchor="middle" fill="#f0f2f8" fontSize="15" fontWeight="800" fontFamily="'Syne',sans-serif">{label}</text>}
      {sublabel && <text x={c} y={c + 12} textAnchor="middle" fill="#6b7a99" fontSize="10" fontFamily="'JetBrains Mono',monospace">{sublabel}</text>}
    </svg>
  );
}

function BarChartSVG({ data, height = 100 }) {
  const max = Math.max(...data.map(d => d.v), 1);
  const W = 260, barW = Math.floor((W - data.length * 6) / data.length);
  return (
    <svg width="100%" height={height + 24} viewBox={`0 0 ${W} ${height + 24}`} preserveAspectRatio="none">
      {data.map((d, i) => {
        const bh = Math.round((d.v / max) * (height - 8));
        const x = i * (barW + 6), y = height - bh;
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={bh} rx="3" fill={d.c} opacity=".85" />
            <text x={x + barW / 2} y={height + 14} textAnchor="middle" fill="#6b7a99" fontSize="9" fontFamily="'JetBrains Mono',monospace">{d.l}</text>
          </g>
        );
      })}
    </svg>
  );
}

function LineChartSVG({ datasets, height = 100, labels }) {
  const W = 320, allVals = datasets.flatMap(d => d.data);
  const max = Math.max(...allVals, 1), min = Math.min(...allVals, 0);
  const pts = (data) => data.map((v, i) => {
    const x = (i / (data.length - 1)) * (W - 20) + 10;
    const y = height - ((v - min) / (max - min || 1)) * (height - 16) - 8;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  return (
    <svg width="100%" height={height + 20} viewBox={`0 0 ${W} ${height + 20}`} preserveAspectRatio="none">
      {[0, 0.25, 0.5, 0.75, 1].map((t, i) => (
        <line key={i} x1={10} y1={(height - ((t * (max - min) + min - min) / (max - min || 1)) * (height - 16) - 8).toFixed(0)}
          x2={W - 10} y2={(height - ((t * (max - min) + min - min) / (max - min || 1)) * (height - 16) - 8).toFixed(0)}
          stroke="rgba(255,255,255,.05)" strokeWidth="1" />
      ))}
      {datasets.map((ds, di) => {
        const p = pts(ds.data).join(" ");
        const areaBottom = `${(W - 20 + 10).toFixed(1)},${height} 10,${height}`;
        return (
          <g key={di}>
            <polyline points={p} fill="none" stroke={ds.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            {ds.data.map((v, i) => {
              const x = (i / (ds.data.length - 1)) * (W - 20) + 10;
              const y = height - ((v - min) / (max - min || 1)) * (height - 16) - 8;
              return <circle key={i} cx={x.toFixed(1)} cy={y.toFixed(1)} r="3" fill={ds.color} />;
            })}
          </g>
        );
      })}
      {labels && labels.map((l, i) => {
        const x = (i / (labels.length - 1)) * (W - 20) + 10;
        return <text key={i} x={x.toFixed(0)} y={height + 16} textAnchor="middle" fill="#6b7a99" fontSize="9" fontFamily="'JetBrains Mono',monospace">{l}</text>;
      })}
    </svg>
  );
}

function RadarChartSVG({ data, size = 130 }) {
  const cx = size / 2, cy = size / 2, r = size / 2 - 18, n = data.length;
  const angle = (i) => (i / n) * 2 * Math.PI - Math.PI / 2;
  const gridLevels = [0.25, 0.5, 0.75, 1];
  const pts = data.map((d, i) => {
    const a = angle(i), ratio = d.v / 100;
    return { x: cx + r * ratio * Math.cos(a), y: cy + r * ratio * Math.sin(a) };
  });
  const polyPts = pts.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  return (
    <svg width={size} height={size}>
      {gridLevels.map(lv => (
        <polygon key={lv} points={data.map((_, i) => {
          const a = angle(i);
          return `${(cx + r * lv * Math.cos(a)).toFixed(1)},${(cy + r * lv * Math.sin(a)).toFixed(1)}`;
        }).join(" ")} fill="none" stroke="rgba(255,255,255,.06)" strokeWidth="1" />
      ))}
      {data.map((_, i) => (
        <line key={i} x1={cx} y1={cy} x2={(cx + r * Math.cos(angle(i))).toFixed(1)} y2={(cy + r * Math.sin(angle(i))).toFixed(1)} stroke="rgba(255,255,255,.08)" strokeWidth="1" />
      ))}
      <polygon points={polyPts} fill="rgba(79,142,247,.2)" stroke="#4f8ef7" strokeWidth="2" />
      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={p.x.toFixed(1)} cy={p.y.toFixed(1)} r="3.5" fill="#4f8ef7" />
          <text x={(cx + (r + 12) * Math.cos(angle(i))).toFixed(0)} y={(cy + (r + 12) * Math.sin(angle(i)) + 4).toFixed(0)}
            textAnchor="middle" fill="#9aa5bc" fontSize="8" fontFamily="'JetBrains Mono',monospace">{data[i].l}</text>
        </g>
      ))}
    </svg>
  );
}

function ScatterSVG({ data, W = 260, H = 120 }) {
  const xs = data.map(d => d.x), ys = data.map(d => d.y);
  const xMin = Math.min(...xs), xMax = Math.max(...xs);
  const yMin = Math.min(...ys), yMax = Math.max(...ys);
  const sx = (v) => ((v - xMin) / (xMax - xMin || 1)) * (W - 28) + 14;
  const sy = (v) => H - ((v - yMin) / (yMax - yMin || 1)) * (H - 20) - 10;
  return (
    <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
      <line x1={14} y1={H - 10} x2={W - 14} y2={H - 10} stroke="rgba(255,255,255,.08)" strokeWidth="1" />
      <line x1={14} y1={10} x2={14} y2={H - 10} stroke="rgba(255,255,255,.08)" strokeWidth="1" />
      {data.map((d, i) => (
        <circle key={i} cx={sx(d.x).toFixed(1)} cy={sy(d.y).toFixed(1)} r="5" fill={d.c || "#4f8ef7"} opacity=".8" />
      ))}
    </svg>
  );
}

function AreaChartSVG({ data, color, height = 80 }) {
  const W = 280, max = Math.max(...data, 1);
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * (W - 8) + 4;
    const y = height - ((v / max) * (height - 12)) - 4;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const areaPath = `M 4,${height} ` + pts.map((p, i) => (i === 0 ? `L ${p}` : p)).join(" L ") + ` L ${W - 4},${height} Z`;
  return (
    <svg width="100%" height={height} viewBox={`0 0 ${W} ${height}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id={`ag${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.4" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#ag${color.replace("#", "")})`} />
      <polyline points={pts.join(" ")} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── Nav item
function NavItem({ icon, label, active, onClick, badge }) {
  return (
    <div onClick={onClick} style={{
      display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 11, cursor: "pointer",
      background: active ? "linear-gradient(135deg,rgba(79,142,247,.18),rgba(124,58,237,.12))" : "transparent",
      borderLeft: active ? "2px solid #4f8ef7" : "2px solid transparent",
      color: active ? "#f0f2f8" : "#6b7a99", transition: "all .22s", marginBottom: 2,
      animation: "slideRight .3s ease both",
    }}
      onMouseEnter={e => { if (!active) { e.currentTarget.style.background = "rgba(255,255,255,.04)"; e.currentTarget.style.color = "#f0f2f8"; } }}
      onMouseLeave={e => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#6b7a99"; } }}>
      <span style={{ fontSize: 16, width: 20, textAlign: "center" }}>{icon}</span>
      <span style={{ fontSize: 13, fontWeight: active ? 700 : 500, flex: 1 }}>{label}</span>
      {badge && <div style={{ background: "#f43f5e", color: "#fff", fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 99 }}>{badge}</div>}
    </div>
  );
}

function ActivityItem({ icon, title, sub, time, color }) {
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,.05)" }}>
      <div style={{ width: 32, height: 32, borderRadius: 9, background: `${color}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0 }}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#f0f2f8", marginBottom: 2 }}>{title}</div>
        <div style={{ fontSize: 11, color: "#6b7a99", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{sub}</div>
      </div>
      <div style={{ fontSize: 10, color: "#6b7a99", fontFamily: "'JetBrains Mono',monospace", flexShrink: 0, marginTop: 2 }}>{time}</div>
    </div>
  );
}

// ── Section wrapper
function Section({ title, sub, action, children, style: sx = {} }) {
  return (
    <div style={{ background: "#16181f", border: "1px solid rgba(255,255,255,.07)", borderRadius: 16, padding: "20px", ...sx }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div>
          <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 15, color: "#f0f2f8" }}>{title}</div>
          {sub && <div style={{ fontSize: 11, color: "#6b7a99", marginTop: 2 }}>{sub}</div>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

function Pill({ label, color }) {
  return <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 99, background: `${color}22`, color, fontFamily: "'JetBrains Mono',monospace", letterSpacing: ".04em" }}>{label}</span>;
}

/* ══════════════════════════════════════════════════════════
   DASHBOARD MAIN
══════════════════════════════════════════════════════════ */

/* ── Notification Bell with Seminars dropdown ── */
function NotificationBell({ onClick, count }) {
  return (
    <div onClick={onClick} style={{ width: 40, height: 40, borderRadius: 11, background: "#16181f", border: "1px solid rgba(255,255,255,.08)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", position: "relative", transition: "border-color .2s" }}
      onMouseEnter={e => e.currentTarget.style.borderColor = "#4f8ef7"}
      onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,.08)"}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9aa5bc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
      {count > 0 && <div style={{ position: "absolute", top: 6, right: 6, width: 8, height: 8, borderRadius: "50%", background: "#f43f5e", border: "2px solid #0f1117" }} />}
    </div>
  );
}

function NotificationPanel({ onClose, onNav }) {
  const today = new Date();
  const fmt = (daysAhead) => {
    const d = new Date(today); d.setDate(d.getDate() + daysAhead);
    return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  };
  const seminars = [
    { icon: "🧠", title: "AI & Machine Learning Summit", time: "10:00 AM – 12:00 PM", date: fmt(1), tag: "Webinar", color: "#7c3aed", seats: 42 },
    { icon: "⚛️", title: "React 19 Deep Dive Workshop", time: "2:00 PM – 4:00 PM", date: fmt(2), tag: "Workshop", color: "#4f8ef7", seats: 18 },
    { icon: "🔐", title: "Ethical Hacking Masterclass", time: "11:00 AM – 1:00 PM", date: fmt(3), tag: "Live", color: "#f43f5e", seats: 67 },
    { icon: "☁️", title: "Cloud Native Architecture Talk", time: "3:30 PM – 5:00 PM", date: fmt(5), tag: "Webinar", color: "#10b981", seats: 120 },
    { icon: "📊", title: "Data Visualisation with Python", time: "9:00 AM – 11:00 AM", date: fmt(7), tag: "Workshop", color: "#f59e0b", seats: 55 },
  ];
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9998 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ position: "fixed", top: 72, right: 32, width: 380, background: "#16181f", border: "1px solid rgba(255,255,255,.1)", borderRadius: 18, boxShadow: "0 16px 48px rgba(0,0,0,.5)", overflow: "hidden", animation: "popIn .25s ease", zIndex: 9999 }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 15 }}>🔔 Upcoming Seminars</div>
            <div style={{ fontSize: 11, color: "#6b7a99", marginTop: 2 }}>Don't miss these live sessions</div>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,.06)", border: "none", color: "#9aa5bc", cursor: "pointer", width: 28, height: 28, borderRadius: 7, fontSize: 13 }}>✕</button>
        </div>
        <div style={{ maxHeight: 420, overflowY: "auto", padding: "10px 12px" }}>
          {seminars.map((s, i) => (
            <div key={i} style={{ padding: "13px 12px", borderRadius: 12, border: `1px solid ${s.color}22`, background: `${s.color}08`, marginBottom: 8, cursor: "pointer", transition: "border-color .2s,background .2s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = s.color; e.currentTarget.style.background = `${s.color}15`; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = `${s.color}22`; e.currentTarget.style.background = `${s.color}08`; }}>
              <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: `${s.color}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, flexShrink: 0 }}>{s.icon}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 3, lineHeight: 1.3 }}>{s.title}</div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                    <span style={{ fontSize: 10, color: "#9aa5bc", fontFamily: "'JetBrains Mono',monospace" }}>{s.date}</span>
                    <span style={{ fontSize: 9, color: "#6b7a99" }}>·</span>
                    <span style={{ fontSize: 10, color: "#6b7a99" }}>{s.time}</span>
                  </div>
                  <div style={{ display: "flex", gap: 6, marginTop: 6, alignItems: "center" }}>
                    <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 99, background: `${s.color}22`, color: s.color, fontFamily: "'JetBrains Mono',monospace" }}>{s.tag}</span>
                    <span style={{ fontSize: 10, color: "#6b7a99" }}>{s.seats} seats left</span>
                  </div>
                </div>
                <button style={{ padding: "5px 11px", borderRadius: 8, background: `linear-gradient(135deg,${s.color},${s.color}99)`, color: "#fff", border: "none", cursor: "pointer", fontSize: 10, fontWeight: 700, flexShrink: 0 }}>Register</button>
              </div>
            </div>
          ))}
        </div>
        <div style={{ padding: "12px 20px", borderTop: "1px solid rgba(255,255,255,.06)" }}>
          <button onClick={() => { onNav("schedule"); onClose(); }} style={{ width: "100%", padding: "9px", borderRadius: 10, border: "1px solid rgba(79,142,247,.3)", background: "rgba(79,142,247,.08)", color: "#4f8ef7", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>View Full Schedule →</button>
        </div>
      </div>
    </div>
  );
}

/* ── Profile Page ── */
function ProfilePage({ user }) {
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState(user.name);
  const [bio, setBio] = useState("Passionate full-stack developer & AI enthusiast. Learning every day on Skillio 🚀");
  const [location, setLocation] = useState("Bengaluru, India");
  const [website, setWebsite] = useState("github.com/skillio-user");
  const badges = [
    { icon: "🔥", label: "7-Day Streak", color: "#f59e0b" },
    { icon: "⚡", label: "Level 12", color: "#4f8ef7" },
    { icon: "🏆", label: "Top 5%", color: "#7c3aed" },
    { icon: "🎓", label: "3 Courses Done", color: "#10b981" },
    { icon: "🧠", label: "Quiz Master", color: "#06b6d4" },
    { icon: "🚀", label: "Early Adopter", color: "#f43f5e" },
  ];
  const stats = [
    { label: "Courses Enrolled", value: "6", color: "#4f8ef7" },
    { label: "Total XP", value: "3,840", color: "#7c3aed" },
    { label: "Quizzes Done", value: "9", color: "#10b981" },
    { label: "Study Hours", value: "24.5h", color: "#f59e0b" },
  ];
  const inp = (lbl, val, set) => (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7a99", letterSpacing: ".06em", textTransform: "uppercase", fontFamily: "'JetBrains Mono',monospace", marginBottom: 6 }}>{lbl}</div>
      {editMode
        ? <input value={val} onChange={e => set(e.target.value)} style={{ width: "100%", padding: "10px 13px", borderRadius: 10, border: "1.5px solid rgba(79,142,247,.4)", background: "#1e2130", color: "#f0f2f8", fontSize: 14, outline: "none", fontFamily: "'DM Sans',sans-serif" }} />
        : <div style={{ fontSize: 14, color: "#f0f2f8", padding: "10px 0" }}>{val}</div>
      }
    </div>
  );
  return (
    <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 20 }}>
      {/* Left card */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ background: "#16181f", border: "1px solid rgba(255,255,255,.07)", borderRadius: 16, padding: "28px 20px", textAlign: "center" }}>
          <div style={{ width: 80, height: 80, borderRadius: "50%", background: "linear-gradient(135deg,#4f8ef7,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, fontWeight: 800, color: "#fff", margin: "0 auto 14px", fontFamily: "'Syne',sans-serif" }}>
            {user.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)}
          </div>
          <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 18, marginBottom: 4 }}>{name}</div>
          <div style={{ fontSize: 12, color: "#10b981", fontWeight: 600, marginBottom: 8 }}>● Pro Learner</div>
          <div style={{ fontSize: 12, color: "#6b7a99", marginBottom: 16 }}>{user.email}</div>
          <button onClick={() => setEditMode(!editMode)} style={{ width: "100%", padding: "9px", borderRadius: 10, background: editMode ? "linear-gradient(135deg,#10b981,#16a34a)" : "linear-gradient(135deg,#4f8ef7,#7c3aed)", color: "#fff", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 700 }}>
            {editMode ? "✓ Save Profile" : "✏ Edit Profile"}
          </button>
        </div>
        <div style={{ background: "#16181f", border: "1px solid rgba(255,255,255,.07)", borderRadius: 16, padding: "18px" }}>
          <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 14, marginBottom: 14 }}>🏅 Badges</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }}>
            {badges.map((b, i) => (
              <div key={i} style={{ padding: "10px", borderRadius: 10, background: `${b.color}12`, border: `1px solid ${b.color}30`, textAlign: "center" }}>
                <div style={{ fontSize: 20, marginBottom: 4 }}>{b.icon}</div>
                <div style={{ fontSize: 10, color: b.color, fontWeight: 700, fontFamily: "'JetBrains Mono',monospace", lineHeight: 1.3 }}>{b.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Right */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ background: "#16181f", border: "1px solid rgba(255,255,255,.07)", borderRadius: 16, padding: "24px" }}>
          <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 15, marginBottom: 18 }}>👤 Personal Info</div>
          {inp("Display Name", name, setName)}
          {inp("Bio", bio, setBio)}
          {inp("Location", location, setLocation)}
          {inp("Website / GitHub", website, setWebsite)}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
          {stats.map((s, i) => (
            <div key={i} style={{ background: "#16181f", border: "1px solid rgba(255,255,255,.07)", borderRadius: 14, padding: "16px", textAlign: "center" }}>
              <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 22, color: s.color, marginBottom: 4 }}>{s.value}</div>
              <div style={{ fontSize: 10, color: "#6b7a99", fontFamily: "'JetBrains Mono',monospace", textTransform: "uppercase", letterSpacing: ".05em" }}>{s.label}</div>
            </div>
          ))}
        </div>
        <div style={{ background: "#16181f", border: "1px solid rgba(255,255,255,.07)", borderRadius: 16, padding: "20px" }}>
          <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 15, marginBottom: 14 }}>🔐 Account Settings</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { label: "Change Password", icon: "🔒", color: "#4f8ef7" },
              { label: "Two-Factor Authentication", icon: "🛡", color: "#10b981" },
              { label: "Connected Accounts", icon: "🔗", color: "#7c3aed" },
              { label: "Delete Account", icon: "⚠", color: "#f43f5e" },
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 11, border: "1px solid rgba(255,255,255,.07)", cursor: "pointer", transition: "background .2s" }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,.03)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <span style={{ fontSize: 16 }}>{item.icon}</span>
                <span style={{ flex: 1, fontSize: 13, fontWeight: 500 }}>{item.label}</span>
                <span style={{ color: item.color, fontSize: 12 }}>→</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}


/* ══════════════════════════════════════════════════════════
   SCHEDULE — FULL COMPLEX PAGE
══════════════════════════════════════════════════════════ */


/* ══════════════════════════════════════════════════════════
   ROADMAP GENERATOR
   POST http://localhost:5003/generate-roadmap
   { topic } → { topic, nodes:[{id,label,type,level,position}], edges:[{source,target,type}] }
   Renders fully dynamic react-flow graph — ZERO hardcoded data.
══════════════════════════════════════════════════════════ */
function RoadmapGenerator() {
  /* ═══════════════════════════════════════════════════
     ROADMAP GENERATOR  —  roadmap.sh visual style
     POST http://localhost:5003/generate-roadmap
     { topic } → { topic, nodes:[{id,label,type,level,position}],
                           edges:[{source,target,type}] }
     NO hardcoded data — 100% dynamic from backend.
  ═══════════════════════════════════════════════════ */
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [roadmap, setRoadmap] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 40, y: 40 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const canvasRef = useRef(null);
  const inputRef = useRef(null);

  /* ── API call ── */
  const generate = async () => {
    const t = topic.trim();
    if (!t) { inputRef.current?.focus(); return; }
    setLoading(true); setError(null); setRoadmap(null); setSelectedNode(null);
    setPan({ x: 40, y: 40 }); setZoom(1);
    try {
      const res = await fetch("http://localhost:5003/generate-roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: t }),
      });
      if (!res.ok) throw new Error(`Server ${res.status}: ${res.statusText}`);
      const data = await res.json();
      if (!data.nodes || !data.edges) throw new Error("Invalid response — missing nodes/edges.");
      const edges = data.edges.map((e, i) => ({ ...e, id: e.id || `e${i}` }));
      setRoadmap({ ...data, edges });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ── Pan / zoom ── */
  const onWheel = (e) => {
    e.preventDefault();
    setZoom(z => Math.min(2.5, Math.max(0.2, z - e.deltaY * 0.001)));
  };
  const onMD = (e) => {
    if (e.button !== 0) return;
    setDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };
  const onMM = (e) => { if (dragging) setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y }); };
  const onMU = () => setDragging(false);
  useEffect(() => {
    window.addEventListener("mouseup", onMU);
    return () => window.removeEventListener("mouseup", onMU);
  }, []);

  /* ── Node geometry ── */
  const isMain = (n) => n.type === "main";
  const nodeW = (n) => isMain(n) ? 180 : 160;
  const nodeH = (n) => isMain(n) ? 44 : 38;

  /* ── Centre of node bottom/top/left/right ── */
  const cx = (n) => n.position.x + nodeW(n) / 2;
  const cy = (n) => n.position.y + nodeH(n) / 2;
  const top = (n) => ({ x: cx(n), y: n.position.y });
  const bot = (n) => ({ x: cx(n), y: n.position.y + nodeH(n) });
  const lft = (n) => ({ x: n.position.x, y: cy(n) });
  const rgt = (n) => ({ x: n.position.x + nodeW(n), y: cy(n) });

  const getNode = (id) => roadmap?.nodes.find(n => n.id === id);

  /* ── Build SVG path between two nodes ── */
  const edgePath = (src, tgt, type) => {
    // Decide exit/entry sides by relative position
    const sdx = cx(tgt) - cx(src);
    const sdy = cy(tgt) - cy(src);
    let p1, p2;
    if (Math.abs(sdx) > Math.abs(sdy)) {
      p1 = sdx > 0 ? rgt(src) : lft(src);
      p2 = sdx > 0 ? lft(tgt) : rgt(tgt);
    } else {
      p1 = sdy > 0 ? bot(src) : top(src);
      p2 = sdy > 0 ? top(tgt) : bot(tgt);
    }
    if (type === "dotted") {
      // Straight dotted line
      return `M ${p1.x} ${p1.y} L ${p2.x} ${p2.y}`;
    }
    // Smooth cubic bezier
    const midX = (p1.x + p2.x) / 2;
    const midY = (p1.y + p2.y) / 2;
    if (Math.abs(p2.x - p1.x) > Math.abs(p2.y - p1.y)) {
      return `M ${p1.x} ${p1.y} C ${midX} ${p1.y}, ${midX} ${p2.y}, ${p2.x} ${p2.y}`;
    }
    return `M ${p1.x} ${p1.y} C ${p1.x} ${midY}, ${p2.x} ${midY}, ${p2.x} ${p2.y}`;
  };

  /* ── Canvas size ── */
  const cvW = roadmap ? Math.max(900, Math.max(...roadmap.nodes.map(n => n.position.x + nodeW(n))) + 80) : 900;
  const cvH = roadmap ? Math.max(700, Math.max(...roadmap.nodes.map(n => n.position.y + nodeH(n))) + 80) : 700;

  /* ── Level colour for badge ── */
  const lvlC = { Beginner: "#10b981", Intermediate: "#f59e0b", Advanced: "#f43f5e" };

  /* ─────────────── RENDER ─────────────── */
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0, height: "calc(100vh - 100px)", fontFamily: "'DM Sans',sans-serif", animation: "fadeUp .3s ease both" }}>

      {/* ══ SEARCH HEADER ══ */}
      <div style={{ background: "#0f1117", borderBottom: "1px solid rgba(255,255,255,.07)", padding: "18px 24px", display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", flexShrink: 0 }}>
        <div style={{ flex: 1, minWidth: 240 }}>
          <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 900, fontSize: 20, marginBottom: 2 }}>🗺️ Roadmap Generator</div>
          <div style={{ fontSize: 11, color: "#6b7a99", fontFamily: "'JetBrains Mono',monospace" }}>GET YOUR ROADMAP NOW</div>
        </div>
        <div style={{ display: "flex", gap: 10, flex: 2, minWidth: 300 }}>
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 10, background: "#1e2130", border: "1.5px solid rgba(79,142,247,.35)", borderRadius: 12, padding: "10px 16px", transition: "border-color .2s" }}
            onFocusCapture={e => e.currentTarget.style.borderColor = "#4f8ef7"}
            onBlurCapture={e => e.currentTarget.style.borderColor = "rgba(79,142,247,.35)"}>
            <span style={{ fontSize: 16, color: "#6b7a99" }}>🔍</span>
            <input ref={inputRef} value={topic} onChange={e => setTopic(e.target.value)}
              onKeyDown={e => e.key === "Enter" && generate()}
              placeholder="Enter a topic — e.g. React, DevOps, Machine Learning…"
              style={{ flex: 1, background: "none", border: "none", outline: "none", color: "#f0f2f8", fontSize: 14, fontFamily: "'DM Sans',sans-serif" }} />
            {topic && <button onClick={() => setTopic("")} style={{ background: "none", border: "none", color: "#6b7a99", cursor: "pointer", fontSize: 16, padding: 0 }}>✕</button>}
          </div>
          <button onClick={generate} disabled={loading || !topic.trim()}
            style={{
              padding: "10px 28px", borderRadius: 12, border: "none", cursor: loading || !topic.trim() ? "default" : "pointer",
              background: loading || !topic.trim() ? "rgba(255,255,255,.06)" : "linear-gradient(270deg,#4f8ef7,#7c3aed,#4f8ef7)",
              backgroundSize: "200% 200%", color: loading || !topic.trim() ? "#6b7a99" : "#fff",
              fontSize: 14, fontWeight: 800, display: "flex", alignItems: "center", gap: 8,
              fontFamily: "'Syne',sans-serif",
              boxShadow: !loading && topic.trim() ? "0 6px 24px rgba(79,142,247,.4)" : "none",
              animation: !loading && topic.trim() ? "gradShift 3s ease infinite" : "none", transition: "all .2s"
            }}>
            {loading ? <><span style={{ animation: "spin .8s linear infinite", display: "inline-block" }}>⟳</span> Generating…</> : <><span>⚡</span> Generate</>}
          </button>
        </div>
        {/* Controls + stats */}
        {roadmap && (
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
            <div style={{ fontSize: 11, color: "#6b7a99", fontFamily: "'JetBrains Mono',monospace", padding: "6px 10px", borderRadius: 8, background: "rgba(255,255,255,.05)" }}>{roadmap.nodes.length} nodes · {roadmap.edges.length} edges</div>
            {[["−", () => setZoom(z => Math.max(0.2, z - .15))], [`${Math.round(zoom * 100)}%`, () => { setZoom(1); setPan({ x: 40, y: 40 }); }], ["+", () => setZoom(z => Math.min(2.5, z + .15))]].map(([lbl, fn], i) => (
              <button key={i} onClick={fn} style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(255,255,255,.07)", border: "1px solid rgba(255,255,255,.1)", color: "#9aa5bc", cursor: "pointer", fontSize: i === 1 ? 9 : 15, fontWeight: 700, fontFamily: "'JetBrains Mono',monospace" }}>{lbl}</button>
            ))}
          </div>
        )}
      </div>

      {/* ══ CANVAS ══ */}
      <div
        onWheel={onWheel} onMouseDown={onMD} onMouseMove={onMM}
        style={{ flex: 1, position: "relative", overflow: "hidden", background: "#f0ede3", cursor: dragging ? "grabbing" : "grab" }}>

        {/* Empty state */}
        {!roadmap && !loading && !error && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 16, textAlign: "center", animation: "fadeUp .4s ease both" }}>
            <div style={{ fontSize: 64, opacity: .15 }}>🗺️</div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 20, color: "#9ca3af" }}>Enter a topic to generate your roadmap</div>
            <div style={{ fontSize: 13, color: "#9ca3af", maxWidth: 340, lineHeight: 1.7 }}>Your backend at <code style={{ fontSize: 11, color: "#6b7a99" }}>localhost:5003</code> will return nodes & edges — rendered here exactly like roadmap.sh</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", marginTop: 4 }}>
              {["Frontend", "React", "DevOps", "Machine Learning", "Python", "Cybersecurity"].map(ex => (
                <button key={ex} onClick={() => setTopic(ex)}
                  style={{ padding: "6px 14px", borderRadius: 99, background: "rgba(0,0,0,.06)", border: "1.5px solid rgba(0,0,0,.12)", color: "#555", cursor: "pointer", fontSize: 12, fontWeight: 600, transition: "all .2s" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "#f59e0b"; e.currentTarget.style.borderColor = "#f59e0b"; e.currentTarget.style.color = "#fff"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(0,0,0,.06)"; e.currentTarget.style.borderColor = "rgba(0,0,0,.12)"; e.currentTarget.style.color = "#555"; }}>
                  {ex}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 18, animation: "fadeUp .3s ease both" }}>
            <svg width="72" height="64" viewBox="0 0 120 100" style={{ animation: "duckBob 1s ease-in-out infinite", filter: "drop-shadow(0 4px 12px rgba(0,0,0,.2))" }}>
              <ellipse cx="60" cy="90" rx="38" ry="6" fill="rgba(0,0,0,.1)" />
              <ellipse cx="60" cy="78" rx="26" ry="17" fill="#f59e0b" />
              <ellipse cx="62" cy="82" rx="17" ry="11" fill="#fcd34d" />
              <ellipse cx="38" cy="75" rx="11" ry="5" fill="#d97706" transform="rotate(-15,38,75)" />
              <rect x="55" y="56" width="13" height="17" rx="6" fill="#f59e0b" />
              <circle cx="61" cy="48" r="15" fill="#10b981" />
              <circle cx="67" cy="44" r="4" fill="#fff" /><circle cx="68.5" cy="43" r="2.5" fill="#1a1a2e" /><circle cx="69.5" cy="42" r="1" fill="#fff" />
              <path d="M72 46 L82 44 L81 49 L72 48 Z" fill="#f97316" />
              <rect x="50" y="33" width="22" height="5" rx="2" fill="#1e1b4b" />
              <rect x="56" y="29" width="10" height="5" rx="1" fill="#1e1b4b" />
              <rect x="52" y="88" width="4" height="8" rx="2" fill="#d97706" />
              <rect x="62" y="88" width="4" height="8" rx="2" fill="#d97706" />
            </svg>
            <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 18, color: "#374151" }}>Building your roadmap…</div>
            <div style={{ fontSize: 12, color: "#9ca3af", fontFamily: "'JetBrains Mono',monospace" }}>GENERATING YOUR ROADMAP "{topic}"</div>
            <div style={{ display: "flex", gap: 5 }}>{[0, 1, 2].map(i => <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: "#f59e0b", animation: `dotBlink 1.2s ${i * .2}s ease-in-out infinite` }} />)}</div>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 14, textAlign: "center", animation: "fadeUp .3s ease both" }}>
            <div style={{ fontSize: 48 }}>🔌</div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 18, color: "#ef4444" }}>Backend not reachable</div>
            <div style={{ fontSize: 13, color: "#6b7a99", maxWidth: 400, lineHeight: 1.75 }}>{error}</div>
            <div style={{ padding: "10px 16px", borderRadius: 10, background: "rgba(0,0,0,.06)", border: "1px solid rgba(0,0,0,.1)", fontSize: 12, color: "#6b7a99", fontFamily: "'JetBrains Mono',monospace" }}>
              Ensure backend runs at <strong>http://localhost:5003</strong>
            </div>
            <button onClick={generate} style={{ padding: "10px 22px", borderRadius: 10, background: "#1e293b", color: "#fff", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 700 }}>🔄 Retry</button>
          </div>
        )}

        {/* ══ GRAPH (roadmap.sh style) ══ */}
        {roadmap && !loading && (
          <div ref={canvasRef}
            style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", overflow: "hidden" }}
            onClick={e => { if (e.target === canvasRef.current) setSelectedNode(null); }}>

            {/* Subtle dot grid */}
            <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", opacity: .5 }}>
              <defs>
                <pattern id="rmDots" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
                  <circle cx="1" cy="1" r="1.2" fill="rgba(0,0,0,.12)" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#rmDots)" />
            </svg>

            {/* Transformable viewport */}
            <div style={{ transform: `translate(${pan.x}px,${pan.y}px) scale(${zoom})`, transformOrigin: "0 0", position: "absolute", top: 0, left: 0, width: cvW, height: cvH }}>

              {/* ── SVG edge layer ── */}
              <svg width={cvW} height={cvH} style={{ position: "absolute", top: 0, left: 0, overflow: "visible", pointerEvents: "none" }}>
                <defs>
                  {/* Blue filled arrow for solid lines */}
                  <marker id="arrowBlue" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
                    <path d="M0,0 L0,6 L8,3 z" fill="#4a90d9" />
                  </marker>
                  {/* Purple arrow for dotted */}
                  <marker id="arrowPurple" markerWidth="7" markerHeight="7" refX="6" refY="3" orient="auto">
                    <path d="M0,0 L0,6 L7,3 z" fill="#7c3aed" />
                  </marker>
                </defs>

                {roadmap.edges.map(edge => {
                  const src = getNode(edge.source), tgt = getNode(edge.target);
                  if (!src || !tgt) return null;
                  const isDotted = edge.type === "dotted";
                  const isHL = selectedNode && (edge.source === selectedNode.id || edge.target === selectedNode.id);
                  const d = edgePath(src, tgt, edge.type);
                  return (
                    <path key={edge.id} d={d} fill="none"
                      stroke={isHL ? (isDotted ? "#7c3aed" : "#4f8ef7") : (isDotted ? "rgba(100,116,193,.7)" : "#4a90d9")}
                      strokeWidth={isHL ? 2.5 : 1.8}
                      strokeDasharray={isDotted ? "6 4" : "none"}
                      markerEnd={isDotted ? "url(#arrowPurple)" : "url(#arrowBlue)"}
                      style={{ transition: "stroke .2s,stroke-width .2s" }}
                    />
                  );
                })}
              </svg>

              {/* ── NODE LAYER ── */}
              {roadmap.nodes.map((node, ni) => {
                const main = isMain(node);
                const sel = selectedNode?.id === node.id;
                const hlEdge = selectedNode && roadmap.edges.some(e => (e.source === selectedNode.id && e.target === node.id) || (e.target === selectedNode.id && e.source === node.id));
                const hl = sel || hlEdge;

                /* roadmap.sh colours:
                   main → bright yellow fill  (#ffe44d) black text
                   sub  → light cream fill    (#fef3c7) dark text
                */
                const bgColor = main ? (sel ? "#fbbf24" : "#ffe44d") : (sel ? "#fdba74" : "#fef3c7");
                const txtColor = "#1a1a1a";
                const border = main
                  ? `2px solid ${sel ? "#d97706" : hl ? "#f59e0b" : "#f59e0b"}`
                  : `1.5px solid ${sel ? "#f59e0b" : hl ? "#f59e0b88" : "#d4a857"}`;
                const shadow = main
                  ? sel ? "0 6px 28px rgba(245,158,11,.6), 0 0 0 3px rgba(245,158,11,.2)" : "0 3px 12px rgba(245,158,11,.25)"
                  : sel ? "0 4px 18px rgba(245,158,11,.35)" : "0 1px 4px rgba(0,0,0,.12)";

                return (
                  <div key={node.id}
                    onClick={e => { e.stopPropagation(); setSelectedNode(s => s?.id === node.id ? null : node); }}
                    style={{
                      position: "absolute",
                      left: node.position.x, top: node.position.y,
                      width: nodeW(node), height: nodeH(node),
                      background: bgColor,
                      border,
                      borderRadius: main ? 10 : 8,
                      boxShadow: shadow,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      cursor: "pointer", userSelect: "none",
                      transition: "all .22s cubic-bezier(.34,1.56,.64,1)",
                      transform: sel ? "scale(1.08) translateY(-3px)" : hl ? "scale(1.03)" : "scale(1)",
                      zIndex: sel ? 20 : hl ? 10 : 1,
                      animation: `cardPop .4s ${ni * .02}s ease both`,
                    }}
                    onMouseEnter={e => { if (!sel) { e.currentTarget.style.transform = "scale(1.04) translateY(-2px)"; e.currentTarget.style.boxShadow = main ? "0 6px 22px rgba(245,158,11,.45)" : "0 4px 12px rgba(0,0,0,.2)"; } }}
                    onMouseLeave={e => { if (!sel) { e.currentTarget.style.transform = hl ? "scale(1.03)" : "scale(1)"; e.currentTarget.style.boxShadow = shadow; } }}>

                    {/* Node label */}
                    <span style={{
                      fontFamily: "'Syne',sans-serif",
                      fontWeight: main ? 800 : 600,
                      fontSize: main ? 13 : 12,
                      color: txtColor,
                      textAlign: "center",
                      padding: "0 8px",
                      lineHeight: 1.25,
                    }}>{node.label}</span>

                    {/* Level dot badge — top right */}
                    <div style={{
                      position: "absolute", top: -6, right: -6,
                      width: 14, height: 14, borderRadius: "50%",
                      background: lvlC[node.level] || "#10b981",
                      border: "2px solid #fff",
                      boxShadow: "0 1px 4px rgba(0,0,0,.25)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <svg width="7" height="7" viewBox="0 0 10 10"><path d="M2 5l2 2 4-4" stroke="#fff" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Zoom hint */}
            <div style={{ position: "absolute", bottom: 12, left: 16, fontSize: 10, color: "rgba(0,0,0,.3)", fontFamily: "'JetBrains Mono',monospace", background: "rgba(255,255,255,.7)", padding: "4px 10px", borderRadius: 7, backdropFilter: "blur(4px)", userSelect: "none" }}>
              Scroll to zoom · Drag to pan · Click node to inspect
            </div>

            {/* ── NODE DETAIL PANEL ── */}
            {selectedNode && (
              <div style={{ position: "absolute", top: 16, right: 16, width: 230, background: "#fff", border: "1.5px solid #e5e7eb", borderRadius: 16, padding: "18px", boxShadow: "0 8px 32px rgba(0,0,0,.15)", animation: "slideIn .25s ease both", zIndex: 200 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", fontFamily: "'JetBrains Mono',monospace", letterSpacing: ".06em" }}>{selectedNode.type === "main" ? "MAIN NODE" : "SUB-TOPIC"}</div>
                  <button onClick={() => setSelectedNode(null)} style={{ background: "#f3f4f6", border: "none", color: "#6b7280", cursor: "pointer", width: 22, height: 22, borderRadius: 6, fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
                </div>
                <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 14, color: "#111827", marginBottom: 10, lineHeight: 1.35 }}>{selectedNode.label}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                  {[{ l: "Level", v: selectedNode.level }, { l: "Type", v: selectedNode.type }, { l: "ID", v: selectedNode.id }].map((r, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: "1px solid #f3f4f6" }}>
                      <span style={{ fontSize: 10, color: "#9ca3af", fontFamily: "'JetBrains Mono',monospace" }}>{r.l}</span>
                      <span style={{ fontSize: 11, color: "#111827", fontWeight: 600, fontFamily: "'JetBrains Mono',monospace" }}>{r.v}</span>
                    </div>
                  ))}
                  <div style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 4 }}>
                    <div style={{ width: 12, height: 12, borderRadius: "50%", background: lvlC[selectedNode.level] || "#10b981", flexShrink: 0 }} />
                    <span style={{ fontSize: 11, fontWeight: 700, color: lvlC[selectedNode.level] || "#10b981" }}>{selectedNode.level}</span>
                  </div>
                </div>
                {/* Connected nodes */}
                {(() => {
                  const conn = roadmap.edges.filter(e => e.source === selectedNode.id || e.target === selectedNode.id);
                  if (!conn.length) return null;
                  return (
                    <div style={{ marginTop: 10, borderTop: "1px solid #f3f4f6", paddingTop: 10 }}>
                      <div style={{ fontSize: 10, color: "#9ca3af", fontFamily: "'JetBrains Mono',monospace", marginBottom: 6 }}>CONNECTIONS ({conn.length})</div>
                      {conn.slice(0, 5).map((e, i) => {
                        const other = e.source === selectedNode.id ? getNode(e.target) : getNode(e.source);
                        const dir = e.source === selectedNode.id ? "→" : "←";
                        return (
                          <div key={i} style={{ display: "flex", gap: 6, alignItems: "center", fontSize: 10, color: "#374151", marginBottom: 3 }}>
                            <span style={{ color: e.type === "dotted" ? "#7c3aed" : "#4a90d9", fontWeight: 700 }}>{dir}</span>
                            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{other?.label || "?"}</span>
                            <span style={{ color: "#d1d5db", fontSize: 9 }}>{e.type}</span>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}


function SchedulePage() {
  const today = new Date();
  const [view, setView] = useState("week"); // week | month | gantt | timetable
  const [selectedDate, setSelectedDate] = useState(new Date(today));
  const [selMonth, setSelMonth] = useState(today.getMonth());
  const [selYear, setSelYear] = useState(today.getFullYear());
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: "", type: "course", time: "09:00", duration: 45, note: "" });
  const [addedEvents, setAddedEvents] = useState([]);
  const [ganttScroll, setGanttScroll] = useState(0);
  const [ganttFilter, setGanttFilter] = useState("all");
  const [tooltip, setTooltip] = useState(null);
  const [expandedSections, setExpandedSections] = useState({ Courses: true, Quizzes: true, Seminars: true, Deadlines: true });
  const [searchQ, setSearchQ] = useState("");
  const [focusMode, setFocusMode] = useState(false);
  const [timerSec, setTimerSec] = useState(25 * 60);
  const [timerRunning, setTimerRunning] = useState(false);
  const timerRef = useRef(null);

  // ── Pomodoro timer
  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => setTimerSec(s => { if (s <= 1) { clearInterval(timerRef.current); setTimerRunning(false); return 0; } return s - 1; }), 1000);
    } else { clearInterval(timerRef.current); }
    return () => clearInterval(timerRef.current);
  }, [timerRunning]);

  const fmt2 = n => String(n).padStart(2, "0");
  const fmtTimer = s => `${fmt2(Math.floor(s / 60))}:${fmt2(s % 60)}`;
  const timerPct = timerSec / (25 * 60) * 100;

  // ── Event factory
  const mk = (dOff, h, m, title, type, color, dur, note = "") => {
    const d = new Date(today); d.setDate(today.getDate() + dOff); d.setHours(h, m, 0, 0);
    return { id: `ev${dOff}${h}${m}`, date: d, title, type, color, duration: dur, note };
  };

  // ── Rich real-time event set spread across -14d to +30d from today
  const BASE_EVENTS = [
    // ── Past (completed) ──────────────────────────────────
    mk(-14, 9, 0, "HTML & CSS – Box Model", "course", "#10b981", 45, "Completed ✓"),
    mk(-14, 11, 0, "Quiz: HTML Basics", "quiz", "#7c3aed", 20, "Score: 85%"),
    mk(-13, 10, 0, "JavaScript – ES6 Features", "course", "#4f8ef7", 60, "Completed ✓"),
    mk(-13, 14, 0, "UX Design – Wireframing", "course", "#10b981", 50, "Completed ✓"),
    mk(-12, 9, 30, "Cybersecurity – Intro to Networks", "course", "#f43f5e", 60, "Completed ✓"),
    mk(-12, 13, 0, "Quiz: JavaScript ES6", "quiz", "#7c3aed", 20, "Score: 78%"),
    mk(-11, 10, 0, "React Mastery – JSX & Components", "course", "#4f8ef7", 50, "Completed ✓"),
    mk(-11, 15, 0, "Python for AI – NumPy Basics", "course", "#7c3aed", 60, "Completed ✓"),
    mk(-10, 9, 0, "Data Analytics – Intro to Pandas", "course", "#06b6d4", 60, "Completed ✓"),
    mk(-10, 11, 0, "Cloud DevOps – Linux Fundamentals", "course", "#f59e0b", 45, "Completed ✓"),
    mk(-10, 14, 0, "Group Study: JS Fundamentals", "study", "#4f8ef7", 60, "Library session"),
    mk(-9, 10, 0, "React Mastery – Props & State", "course", "#4f8ef7", 50, "Completed ✓"),
    mk(-9, 14, 30, "Webinar: Open Source 101", "seminar", "#10b981", 90, "Attended"),
    mk(-8, 9, 0, "Python for AI – Matplotlib", "course", "#7c3aed", 60, "Completed ✓"),
    mk(-8, 11, 0, "Quiz: React Components", "quiz", "#7c3aed", 25, "Score: 72%"),
    mk(-8, 15, 0, "UX Design – User Research Methods", "course", "#10b981", 55, "Completed ✓"),
    mk(-7, 10, 0, "Cloud DevOps – Git & GitHub", "course", "#f59e0b", 60, "Completed ✓"),
    mk(-7, 13, 0, "Cybersecurity – OWASP Top 10", "course", "#f43f5e", 60, "Completed ✓"),
    mk(-7, 16, 0, "Weekly Progress Review", "review", "#9aa5bc", 15, "Week 1 done"),
    mk(-6, 9, 0, "React Mastery – Hooks Intro", "course", "#4f8ef7", 45, "Completed ✓"),
    mk(-6, 11, 0, "Data Analytics – GroupBy & Merge", "course", "#06b6d4", 60, "Completed ✓"),
    mk(-6, 14, 0, "Python for AI – Scikit-Learn", "course", "#7c3aed", 75, "Completed ✓"),
    mk(-5, 10, 0, "Cloud DevOps – Docker Setup", "course", "#f59e0b", 60, "Completed ✓"),
    mk(-5, 13, 0, "Cybersecurity – SQL Injection Lab", "course", "#f43f5e", 60, "Completed ✓"),
    mk(-5, 15, 30, "Live Talk: DevOps at Scale", "seminar", "#f59e0b", 60, "Attended"),
    mk(-4, 9, 0, "UX Design – Figma Prototyping", "course", "#10b981", 60, "Completed ✓"),
    mk(-4, 11, 0, "Quiz: Python ML Basics", "quiz", "#7c3aed", 25, "Score: 68%"),
    mk(-4, 14, 0, "React Mastery – useEffect Deep Dive", "course", "#4f8ef7", 50, "Completed ✓"),
    mk(-3, 9, 0, "Quiz: HTML/CSS", "quiz", "#7c3aed", 20, "Score: 80%"),
    mk(-3, 10, 0, "Data Analytics – Seaborn Viz", "course", "#06b6d4", 60, "Completed ✓"),
    mk(-3, 14, 0, "Python for AI – Neural Net Intro", "course", "#7c3aed", 90, "Completed ✓"),
    mk(-3, 16, 30, "Group Study: Data Science", "study", "#06b6d4", 60, "Online call"),
    mk(-2, 9, 0, "Cloud DevOps – Docker Compose", "course", "#f59e0b", 75, "Completed ✓"),
    mk(-2, 11, 0, "Cybersecurity – XSS & CSRF", "course", "#f43f5e", 60, "Completed ✓"),
    mk(-2, 14, 0, "Cybersecurity – Intro", "course", "#f43f5e", 60, "Completed ✓"),
    mk(-1, 8, 30, "React Mastery – Custom Hooks Basics", "course", "#4f8ef7", 50, "Completed ✓"),
    mk(-1, 10, 0, "React Mastery – Hooks Intro", "course", "#4f8ef7", 45, "Completed ✓"),
    mk(-1, 13, 0, "UX Design – Accessibility Principles", "course", "#10b981", 45, "Completed ✓"),
    mk(-1, 15, 0, "Quiz: Cloud Fundamentals", "quiz", "#7c3aed", 20, "Score: 74%"),
    mk(-1, 17, 0, "Weekly Progress Review", "review", "#9aa5bc", 15, "Week 2 summary"),

    // ── TODAY ──────────────────────────────────────────────
    mk(0, 8, 0, "Morning Stand-up & Planning", "review", "#9aa5bc", 15, "Plan day's learning goals"),
    mk(0, 9, 0, "React Mastery – Custom Hooks", "course", "#4f8ef7", 50, "Complete exercises 4–7"),
    mk(0, 10, 0, "React Mastery – useMemo & useCallback", "course", "#4f8ef7", 45, "Performance optimisation"),
    mk(0, 11, 0, "Quiz: JavaScript Closures", "quiz", "#7c3aed", 20, "Review MDN docs beforehand"),
    mk(0, 11, 30, "Data Analytics – Pandas Advanced", "course", "#06b6d4", 60, "GroupBy, pivot tables"),
    mk(0, 13, 30, "Lunch Break Study – JS Patterns", "study", "#4f8ef7", 30, "Design patterns reading"),
    mk(0, 14, 30, "Webinar: AI Trends 2025", "seminar", "#10b981", 90, "Link sent to email"),
    mk(0, 16, 30, "Python for AI – Backpropagation", "course", "#7c3aed", 60, "Watch 3Blue1Brown first"),
    mk(0, 18, 0, "Cybersecurity – Pen Testing Lab", "course", "#f43f5e", 45, "Lab environment needed"),

    // ── DAY +1 ──────────────────────────────────────────────
    mk(1, 8, 30, "Python for AI – CNN Architecture", "course", "#7c3aed", 60, "Neural nets chapter"),
    mk(1, 9, 30, "Python for AI – Module 5", "course", "#7c3aed", 60, "Neural nets chapter"),
    mk(1, 11, 0, "Cybersecurity – Pen Testing Advanced", "course", "#f43f5e", 50, "Metasploit intro"),
    mk(1, 12, 0, "Cloud DevOps – Docker Networking", "course", "#f59e0b", 60, "Bridge & overlay networks"),
    mk(1, 14, 0, "React 19 Workshop", "seminar", "#4f8ef7", 120, "Workshop by Vercel team"),
    mk(1, 16, 30, "UX Design – Interaction Design", "course", "#10b981", 50, "Micro-interactions"),
    mk(1, 18, 0, "Quiz: Python CNN", "quiz", "#7c3aed", 20, ""),

    // ── DAY +2 ──────────────────────────────────────────────
    mk(2, 9, 0, "UX Design – Portfolio Review", "course", "#10b981", 50, "Bring Figma link"),
    mk(2, 10, 0, "Data Analytics – Feature Engineering", "course", "#06b6d4", 60, "Kaggle dataset used"),
    mk(2, 11, 30, "React Mastery – Context API", "course", "#4f8ef7", 45, ""),
    mk(2, 12, 0, "Assignment Due: React App", "deadline", "#f43f5e", 0, "Submit via GitHub"),
    mk(2, 13, 30, "Group Study – Cloud DevOps", "study", "#f59e0b", 60, "Docker + CI/CD discussion"),
    mk(2, 15, 30, "Python for AI – LSTM Networks", "course", "#7c3aed", 75, "Time series forecasting"),
    mk(2, 17, 0, "Cybersecurity – Network Scanning", "course", "#f43f5e", 45, "Nmap practicals"),

    // ── DAY +3 ──────────────────────────────────────────────
    mk(3, 8, 0, "Morning Review: Yesterday's Notes", "review", "#9aa5bc", 20, ""),
    mk(3, 9, 0, "Cloud DevOps – CI/CD Pipelines", "course", "#f59e0b", 75, "GitHub Actions workflow"),
    mk(3, 10, 30, "Data Analytics – Matplotlib Charts", "course", "#06b6d4", 50, ""),
    mk(3, 12, 0, "Quiz: Docker Fundamentals", "quiz", "#7c3aed", 25, ""),
    mk(3, 13, 0, "Quiz: Python Basics", "quiz", "#7c3aed", 20, ""),
    mk(3, 14, 0, "React Mastery – State Management", "course", "#4f8ef7", 60, "Redux intro"),
    mk(3, 15, 30, "UX Design – Prototyping Sprint", "course", "#10b981", 60, "Figma sprint"),
    mk(3, 16, 0, "Cloud DevOps – Docker Lab", "course", "#f59e0b", 75, "Docker Desktop required"),
    mk(3, 18, 0, "Group Study: Cybersecurity CTF", "study", "#f43f5e", 90, "Online CTF event"),

    // ── DAY +4 ──────────────────────────────────────────────
    mk(4, 9, 0, "React Mastery – Redux Toolkit", "course", "#4f8ef7", 60, ""),
    mk(4, 10, 30, "Python for AI – Transfer Learning", "course", "#7c3aed", 75, "Pre-trained models"),
    mk(4, 11, 0, "Cybersecurity – OWASP Top 10", "course", "#f43f5e", 60, ""),
    mk(4, 13, 0, "Data Analytics – ML Pipeline", "course", "#06b6d4", 75, "End-to-end pipeline"),
    mk(4, 14, 0, "AI Summit Webinar", "seminar", "#7c3aed", 120, "Register link emailed"),
    mk(4, 16, 30, "Cloud DevOps – Kubernetes Intro", "course", "#f59e0b", 60, "minikube setup"),
    mk(4, 18, 0, "Quiz: React Redux", "quiz", "#7c3aed", 20, ""),

    // ── DAY +5 (Saturday) ────────────────────────────────────
    mk(5, 10, 0, "Weekly Progress Review", "review", "#9aa5bc", 15, "Self-assessment"),
    mk(5, 11, 0, "Python for AI – CNN Models", "course", "#7c3aed", 60, ""),
    mk(5, 13, 0, "UX Design – Capstone Project Work", "course", "#10b981", 90, "Final project"),
    mk(5, 14, 0, "Data Analytics – Capstone EDA", "course", "#06b6d4", 60, "Exploratory analysis"),
    mk(5, 16, 0, "Group Study: React Advanced", "study", "#4f8ef7", 60, "hooks deep dive"),

    // ── DAY +6 (Sunday) ──────────────────────────────────────
    mk(6, 11, 0, "Cloud DevOps – Kubernetes Workloads", "course", "#f59e0b", 75, ""),
    mk(6, 13, 30, "Python for AI – GANs Introduction", "course", "#7c3aed", 60, ""),
    mk(6, 15, 0, "Cybersecurity – Capture The Flag Practice", "study", "#f43f5e", 90, ""),
    mk(6, 17, 0, "Weekly Recap & Next Week Planning", "review", "#9aa5bc", 20, ""),

    // ── NEXT WEEK ─────────────────────────────────────────────
    mk(7, 9, 0, "React Mastery – Redux Saga", "course", "#4f8ef7", 60, ""),
    mk(7, 10, 30, "Data Analytics – Model Evaluation", "course", "#06b6d4", 60, "Cross-validation"),
    mk(7, 13, 0, "Python for AI – Object Detection", "course", "#7c3aed", 90, "YOLO architecture"),
    mk(7, 14, 0, "Data Science Seminar", "seminar", "#10b981", 90, ""),
    mk(7, 16, 0, "Cloud DevOps – Helm Charts", "course", "#f59e0b", 60, ""),
    mk(8, 9, 0, "UX Design – Usability Testing", "course", "#10b981", 60, ""),
    mk(8, 10, 0, "Assignment Due: Python ML", "deadline", "#f43f5e", 0, "Submit Jupyter notebook"),
    mk(8, 11, 30, "Cybersecurity – Web App Pentesting", "course", "#f43f5e", 75, "Burp Suite lab"),
    mk(8, 14, 0, "React Mastery – Server Components", "course", "#4f8ef7", 60, "Next.js integration"),
    mk(8, 16, 0, "Quiz: Kubernetes Basics", "quiz", "#7c3aed", 25, ""),
    mk(9, 9, 0, "Python for AI – Transformers Intro", "course", "#7c3aed", 90, "Attention mechanisms"),
    mk(9, 10, 30, "Cloud DevOps – Terraform", "course", "#f59e0b", 75, "Infrastructure as code"),
    mk(9, 13, 0, "Data Analytics – NLP Basics", "course", "#06b6d4", 60, ""),
    mk(9, 14, 30, "Group Study: DevOps CI/CD", "study", "#f59e0b", 60, ""),
    mk(10, 9, 0, "React Mastery – Testing with Jest", "course", "#4f8ef7", 60, "Unit & integration tests"),
    mk(10, 10, 30, "Cybersecurity – Malware Analysis", "course", "#f43f5e", 60, ""),
    mk(10, 13, 0, "UX Design – Design System", "course", "#10b981", 75, "Storybook setup"),
    mk(10, 14, 0, "Python for AI – BERT & GPT", "course", "#7c3aed", 90, ""),
    mk(10, 16, 0, "Webinar: Future of Web Dev 2025", "seminar", "#4f8ef7", 90, ""),
    mk(11, 9, 0, "Data Analytics – Time Series", "course", "#06b6d4", 75, "ARIMA models"),
    mk(11, 11, 0, "Cloud DevOps – Monitoring & Logging", "course", "#f59e0b", 60, "Prometheus + Grafana"),
    mk(11, 14, 0, "Assignment Due: UX Portfolio", "deadline", "#10b981", 0, "Submit Behance link"),
    mk(11, 15, 0, "Quiz: NLP Fundamentals", "quiz", "#7c3aed", 25, ""),
    mk(12, 9, 0, "React Mastery – Deployment & CI", "course", "#4f8ef7", 60, "Vercel + GitHub Actions"),
    mk(12, 11, 0, "Python for AI – Fine-Tuning LLMs", "course", "#7c3aed", 90, "HuggingFace pipeline"),
    mk(12, 13, 30, "Cybersecurity – Incident Response", "course", "#f43f5e", 60, ""),
    mk(12, 16, 0, "Group Study: Data Science Competition", "study", "#06b6d4", 90, "Kaggle team entry"),
    mk(13, 9, 0, "Cloud DevOps – AWS ECS & EKS", "course", "#f59e0b", 75, ""),
    mk(13, 10, 30, "UX Design – A/B Testing Methods", "course", "#10b981", 60, ""),
    mk(13, 14, 0, "Weekly Progress Review", "review", "#9aa5bc", 20, "Week 3 complete"),
    mk(14, 10, 0, "React Mastery – Capstone Project", "course", "#4f8ef7", 90, "Full app build"),
    mk(14, 14, 0, "Python for AI – Deployment with FastAPI", "course", "#7c3aed", 75, "REST API for ML model"),
    mk(15, 9, 0, "Data Analytics – Dashboard Build", "course", "#06b6d4", 90, "Plotly Dash"),
    mk(15, 11, 0, "Cybersecurity – Final CTF Challenge", "study", "#f43f5e", 120, ""),
    mk(15, 14, 0, "Assignment Due: Cloud Project", "deadline", "#f59e0b", 0, "Submit AWS architecture"),
    mk(16, 10, 0, "Cloud DevOps – Security Best Practices", "course", "#f59e0b", 60, ""),
    mk(16, 13, 0, "Quiz: Full Stack Review", "quiz", "#7c3aed", 30, ""),
    mk(17, 9, 0, "UX Design – Final Capstone Presentation", "course", "#10b981", 90, "Demo to peers"),
    mk(17, 14, 0, "AI & Future Tech Conference", "seminar", "#7c3aed", 180, "Multi-session event"),
    mk(18, 9, 0, "Python for AI – Production Deployment", "course", "#7c3aed", 75, "Docker + FastAPI"),
    mk(18, 11, 0, "React Mastery – Final Review", "course", "#4f8ef7", 60, ""),
    mk(18, 14, 0, "Assignment Due: React Capstone", "deadline", "#4f8ef7", 0, "Submit GitHub repo"),
    mk(20, 9, 0, "Full-Stack Integration Project", "course", "#4f8ef7", 120, "Connect React + FastAPI"),
    mk(20, 13, 0, "Quiz: Full-Stack Final", "quiz", "#7c3aed", 30, ""),
    mk(21, 10, 0, "Career Readiness: Portfolio Review", "review", "#9aa5bc", 60, "With mentor"),
    mk(21, 14, 0, "Mock Technical Interview", "study", "#4f8ef7", 60, "Pair programming session"),
    mk(22, 9, 0, "Data Analytics – Presentation Prep", "course", "#06b6d4", 60, ""),
    mk(22, 14, 0, "Webinar: Internship Prep 2025", "seminar", "#10b981", 90, ""),
    mk(25, 10, 0, "Cloud DevOps – Final Project Deploy", "course", "#f59e0b", 90, "Live deployment"),
    mk(25, 14, 0, "Assignment Due: All Modules", "deadline", "#f43f5e", 0, "Final submission day"),
    mk(28, 10, 0, "Course Graduation Ceremony", "seminar", "#10b981", 120, "Virtual ceremony 🎓"),
    mk(30, 9, 0, "Post-Course: Next Steps Planning", "review", "#9aa5bc", 30, "Set new learning path"),
  ];

  const events = [...BASE_EVENTS, ...addedEvents];

  const typeIcon = { course: "📚", quiz: "🧠", seminar: "🎤", deadline: "⚠️", study: "👥", review: "📋" };
  const typeLabel = { course: "Course", quiz: "Quiz", seminar: "Seminar", deadline: "Deadline", study: "Study Group", review: "Review" };

  const isSameDay = (a, b) => a.getDate() === b.getDate() && a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();

  const eventsForDay = (d) => events.filter(e => isSameDay(e.date, d));
  const filteredEvents = (d) => {
    let evs = eventsForDay(d);
    if (searchQ) evs = evs.filter(e => e.title.toLowerCase().includes(searchQ.toLowerCase()));
    return evs.sort((a, b) => a.date - b.date);
  };

  // ── Stats
  const upcoming = events.filter(e => e.date >= today && e.type !== "deadline").length;
  const deadlines = events.filter(e => e.type === "deadline" && e.date >= today).length;
  const todayCount = eventsForDay(today).length;
  const weekHours = events.filter(e => {
    const d = new Date(today); const s = new Date(today);
    s.setDate(today.getDate() - today.getDay()); d.setDate(s.getDate() + 7);
    return e.date >= s && e.date <= d && e.type === "course";
  }).reduce((sum, e) => sum + (e.duration || 0), 0);

  // ── Week planner data
  const weekStart = new Date(selectedDate);
  weekStart.setDate(selectedDate.getDate() - selectedDate.getDay());
  const weekDays = Array.from({ length: 7 }, (_, i) => { const d = new Date(weekStart); d.setDate(weekStart.getDate() + i); return d; });
  const HOURS = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
  const HOUR_H = 60;

  // ── Month calendar
  const daysInMonth = new Date(selYear, selMonth + 1, 0).getDate();
  const firstDOW = new Date(selYear, selMonth, 1).getDay();
  const monthName = new Date(selYear, selMonth).toLocaleString("default", { month: "long" });

  // ── Gantt data
  const GANTT_DAYS = 45, G_OFFSET = -7, DAY_W = 48, LABEL_W = 170, VIS = 16;
  const gDays = Array.from({ length: GANTT_DAYS }, (_, i) => { const d = new Date(today); d.setDate(today.getDate() + G_OFFSET + i); return d; });
  const maxGScroll = Math.max(0, GANTT_DAYS - VIS);
  const gVis = Math.min(Math.max(0, ganttScroll), maxGScroll);

  const statusStyle = {
    "completed": { bg: "rgba(16,185,129,.22)", border: "#10b981", text: "#10b981" },
    "in-progress": { bg: "rgba(79,142,247,.22)", border: "#4f8ef7", text: "#4f8ef7" },
    "upcoming": { bg: "rgba(255,255,255,.07)", border: "rgba(255,255,255,.18)", text: "#9aa5bc" },
    "live": { bg: "rgba(244,63,94,.2)", border: "#f43f5e", text: "#f43f5e" },
    "deadline": { bg: "rgba(245,158,11,.2)", border: "#f59e0b", text: "#f59e0b" },
  };
  const statusLabel = { "completed": "Completed", "in-progress": "In Progress", "upcoming": "Upcoming", "live": "Live Now", "deadline": "Deadline" };

  const ganttRows = [
    {
      category: "Courses", icon: "📚", color: "#4f8ef7", items: [
        {
          label: "⚛️ React Mastery", color: "#4f8ef7", sub: "72% done", blocks: [
            { s: -7, e: -3, title: "Hooks Intro", status: "completed" },
            { s: -2, e: 3, title: "Custom Hooks", status: "in-progress" },
            { s: 5, e: 12, title: "Context API & Redux", status: "upcoming" },
            { s: 14, e: 18, title: "Testing & Deploy", status: "upcoming" },
            { s: 20, e: 25, title: "Capstone Project", status: "upcoming" },
          ]
        },
        {
          label: "🐍 Python for AI", color: "#7c3aed", sub: "45% done", blocks: [
            { s: -10, e: -5, title: "NumPy & Pandas", status: "completed" },
            { s: -4, e: 3, title: "Neural Nets", status: "in-progress" },
            { s: 6, e: 12, title: "CNN & Transfer Learning", status: "upcoming" },
            { s: 13, e: 18, title: "BERT & Transformers", status: "upcoming" },
            { s: 19, e: 25, title: "LLM Fine-Tuning", status: "upcoming" },
          ]
        },
        {
          label: "🎨 UX Design Pro", color: "#10b981", sub: "100% ✓", blocks: [
            { s: -14, e: -8, title: "Research & Wireframes", status: "completed" },
            { s: -7, e: -3, title: "Prototyping", status: "completed" },
            { s: -2, e: 0, title: "Capstone", status: "completed" },
          ]
        },
        {
          label: "☁️ Cloud DevOps", color: "#f59e0b", sub: "18% done", blocks: [
            { s: -7, e: -3, title: "Git & Linux", status: "completed" },
            { s: 1, e: 6, title: "Docker", status: "in-progress" },
            { s: 7, e: 13, title: "Kubernetes", status: "upcoming" },
            { s: 14, e: 20, title: "Terraform & AWS", status: "upcoming" },
            { s: 22, e: 27, title: "Final Deployment", status: "upcoming" },
          ]
        },
        {
          label: "🔐 Cybersecurity 101", color: "#f43f5e", sub: "60% done", blocks: [
            { s: -12, e: -7, title: "Network Basics", status: "completed" },
            { s: -6, e: -1, title: "OWASP & XSS", status: "completed" },
            { s: 0, e: 5, title: "Pen Testing", status: "in-progress" },
            { s: 8, e: 14, title: "Incident Response", status: "upcoming" },
            { s: 16, e: 20, title: "CTF Challenge", status: "upcoming" },
          ]
        },
        {
          label: "📊 Data Analytics", color: "#06b6d4", sub: "33% done", blocks: [
            { s: -10, e: -5, title: "Intro to Pandas", status: "completed" },
            { s: -4, e: 3, title: "Advanced Pandas", status: "in-progress" },
            { s: 5, e: 11, title: "ML Pipeline", status: "upcoming" },
            { s: 12, e: 18, title: "NLP & Time Series", status: "upcoming" },
            { s: 20, e: 25, title: "Dashboard Capstone", status: "upcoming" },
          ]
        },
        {
          label: "🌐 Full-Stack Dev", color: "#f43f5e", sub: "0% – starts wk3", blocks: [
            { s: 18, e: 25, title: "React + FastAPI Integration", status: "upcoming" },
            { s: 26, e: 32, title: "Full Project Build", status: "upcoming" },
          ]
        },
      ]
    },
    {
      category: "Quizzes", icon: "🧠", color: "#7c3aed", items: [
        { label: "HTML & CSS", color: "#10b981", sub: "85% ✓", blocks: [{ s: -14, e: -13, title: "Quiz #1 ✓", status: "completed" }] },
        { label: "JavaScript ES6", color: "#7c3aed", sub: "78% ✓", blocks: [{ s: -12, e: -11, title: "Quiz #2 ✓", status: "completed" }] },
        { label: "React Components", color: "#4f8ef7", sub: "72% ✓", blocks: [{ s: -8, e: -7, title: "Quiz #3 ✓", status: "completed" }] },
        { label: "Python ML Basics", color: "#7c3aed", sub: "68% ✓", blocks: [{ s: -4, e: -3, title: "Quiz #4 ✓", status: "completed" }] },
        { label: "Cloud Basics", color: "#f59e0b", sub: "74% ✓", blocks: [{ s: -1, e: -1, title: "Quiz #5 ✓", status: "completed" }] },
        { label: "JS Closures", color: "#7c3aed", sub: "Today", blocks: [{ s: 0, e: 0, title: "Quiz #6 – Due", status: "live" }] },
        { label: "Docker Basics", color: "#f59e0b", sub: "In 3d", blocks: [{ s: 3, e: 3, title: "Quiz #7", status: "upcoming" }] },
        { label: "Python CNN", color: "#7c3aed", sub: "In 7d", blocks: [{ s: 7, e: 7, title: "Quiz #8", status: "upcoming" }] },
        { label: "React Redux", color: "#4f8ef7", sub: "In 10d", blocks: [{ s: 10, e: 10, title: "Quiz #9", status: "upcoming" }] },
        { label: "Kubernetes", color: "#f59e0b", sub: "In 14d", blocks: [{ s: 14, e: 14, title: "Quiz #10", status: "upcoming" }] },
        { label: "NLP Fundamentals", color: "#06b6d4", sub: "In 18d", blocks: [{ s: 18, e: 18, title: "Quiz #11", status: "upcoming" }] },
        { label: "Full-Stack Final", color: "#4f8ef7", sub: "In 22d", blocks: [{ s: 22, e: 22, title: "Quiz #12", status: "upcoming" }] },
      ]
    },
    {
      category: "Seminars", icon: "🎤", color: "#10b981", items: [
        { label: "Open Source 101", color: "#10b981", sub: "Done", blocks: [{ s: -9, e: -9, title: "Attended ✓", status: "completed" }] },
        { label: "DevOps at Scale", color: "#f59e0b", sub: "Done", blocks: [{ s: -5, e: -5, title: "Attended ✓", status: "completed" }] },
        { label: "AI Trends 2025", color: "#10b981", sub: "Today", blocks: [{ s: 0, e: 0, title: "LIVE NOW", status: "live" }] },
        { label: "React 19 Workshop", color: "#4f8ef7", sub: "In 2d", blocks: [{ s: 2, e: 2, title: "Workshop", status: "upcoming" }] },
        { label: "Cloud Architecture Talk", color: "#06b6d4", sub: "In 5d", blocks: [{ s: 5, e: 5, title: "Live Talk", status: "upcoming" }] },
        { label: "AI Summit Keynote", color: "#7c3aed", sub: "In 7d", blocks: [{ s: 7, e: 7, title: "Keynote", status: "upcoming" }] },
        { label: "Future of Web Dev 2025", color: "#4f8ef7", sub: "In 10d", blocks: [{ s: 10, e: 10, title: "Webinar", status: "upcoming" }] },
        { label: "AI & Future Tech Conf", color: "#7c3aed", sub: "In 17d", blocks: [{ s: 17, e: 17, title: "Full Day", status: "upcoming" }] },
        { label: "Internship Prep 2025", color: "#10b981", sub: "In 22d", blocks: [{ s: 22, e: 22, title: "Career Talk", status: "upcoming" }] },
        { label: "Graduation Ceremony", color: "#10b981", sub: "In 28d", blocks: [{ s: 28, e: 28, title: "🎓 Virtual", status: "upcoming" }] },
      ]
    },
    {
      category: "Deadlines", icon: "⚠️", color: "#f43f5e", items: [
        { label: "React App Submission", color: "#f43f5e", sub: "In 2d", blocks: [{ s: 2, e: 2, title: "GitHub Submit", status: "deadline" }] },
        { label: "Python ML Notebook", color: "#7c3aed", sub: "In 8d", blocks: [{ s: 8, e: 8, title: "Jupyter Due", status: "deadline" }] },
        { label: "UX Portfolio", color: "#10b981", sub: "In 11d", blocks: [{ s: 11, e: 11, title: "Behance Link", status: "deadline" }] },
        { label: "Cloud Project", color: "#f59e0b", sub: "In 15d", blocks: [{ s: 15, e: 15, title: "AWS Diagram", status: "deadline" }] },
        { label: "React Capstone", color: "#4f8ef7", sub: "In 18d", blocks: [{ s: 18, e: 18, title: "GitHub Repo", status: "deadline" }] },
        { label: "All Modules Final", color: "#f43f5e", sub: "In 25d", blocks: [{ s: 25, e: 25, title: "FINAL Submit", status: "deadline" }] },
      ]
    },
  ];

  const filteredGantt = ganttRows.map(r => ({ ...r, items: r.items.map(it => ({ ...it, blocks: it.blocks.filter(b => ganttFilter === "all" || b.status === ganttFilter) })).filter(it => ganttFilter === "all" || it.blocks.length > 0) })).filter(r => r.items.length > 0);

  // ── Add event
  const handleAddEvent = () => {
    if (!newEvent.title.trim()) return;
    const d = new Date(selectedDate);
    const [h, m] = newEvent.time.split(":").map(Number);
    d.setHours(h, m, 0, 0);
    setAddedEvents(prev => [...prev, { id: `custom${Date.now()}`, date: d, title: newEvent.title, type: newEvent.type, color: { course: "#4f8ef7", quiz: "#7c3aed", seminar: "#10b981", deadline: "#f43f5e", study: "#f59e0b", review: "#9aa5bc" }[newEvent.type], duration: Number(newEvent.duration), note: newEvent.note }]);
    setNewEvent({ title: "", type: "course", time: "09:00", duration: 45, note: "" });
    setShowAddModal(false);
  };

  // ─────────────── VIEWS ───────────────

  // ── Course pool — cycles by date number so each date gets a unique course
  const COURSE_POOL = [
    { label: "React Mastery", color: "#4f8ef7", icon: "⚛️", short: "React" },
    { label: "Python for AI", color: "#7c3aed", icon: "🐍", short: "Python" },
    { label: "UX Design", color: "#10b981", icon: "🎨", short: "UX" },
    { label: "Data Analytics", color: "#06b6d4", icon: "📊", short: "Data" },
    { label: "Cloud DevOps", color: "#f59e0b", icon: "☁️", short: "DevOps" },
    { label: "Cybersecurity", color: "#f43f5e", icon: "🔐", short: "Security" },
    { label: "Full-Stack Dev", color: "#a855f7", icon: "🌐", short: "Full-Stack" },
  ];
  // Pick featured course for a given date — cycles by date so each date differs
  const getCourseForDate = (d) => COURSE_POOL[d.getDate() % COURSE_POOL.length];

  // ── WEEK VIEW
  const renderWeek = () => (
    <div style={{ background: "#16181f", border: "1px solid rgba(255,255,255,.07)", borderRadius: 16, overflow: "hidden" }}>
      {/* ── DAY COLUMN HEADERS ── */}
      <div style={{ display: "grid", gridTemplateColumns: `64px repeat(7,1fr)`, borderBottom: "2px solid rgba(255,255,255,.08)" }}>
        {/* Corner cell */}
        <div style={{ background: "#12141b", borderRight: "1px solid rgba(255,255,255,.07)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "8px 4px", gap: 3 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#4f8ef7" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
          <span style={{ fontSize: 8, color: "#4f8ef7", fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, letterSpacing: ".06em" }}>TIME</span>
        </div>

        {weekDays.map((d, i) => {
          const isT = isSameDay(d, today);
          const isSel = isSameDay(d, selectedDate);
          const course = getCourseForDate(d);
          const dayEvs = eventsForDay(d);
          const topColors = [...new Set(dayEvs.map(e => e.color))].slice(0, 5);
          return (
            <div key={i} onClick={() => setSelectedDate(new Date(d))}
              style={{
                borderLeft: "1px solid rgba(255,255,255,.06)", cursor: "pointer", overflow: "hidden",
                borderBottom: isT ? `3px solid ${course.color}` : `3px solid transparent`
              }}>

              {/* ① COURSE BADGE — top strip */}
              <div style={{
                background: isT ? `linear-gradient(135deg,${course.color}50,${course.color}28)` : isSel ? `${course.color}22` : `${course.color}14`,
                borderBottom: `1px solid ${course.color}38`,
                padding: "7px 5px 6px",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
              }}>
                <span style={{ fontSize: 15, lineHeight: 1, flexShrink: 0 }}>{course.icon}</span>
                <div style={{ minWidth: 0, textAlign: "left" }}>
                  <div style={{
                    fontSize: 9, fontWeight: 800, color: course.color, fontFamily: "'Syne',sans-serif",
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 58, lineHeight: 1.25, letterSpacing: "-.01em"
                  }}>{course.label}</div>
                  <div style={{
                    fontSize: 7, color: `${course.color}88`, fontFamily: "'JetBrains Mono',monospace",
                    letterSpacing: ".05em", textTransform: "uppercase", lineHeight: 1.3
                  }}>Day Focus</div>
                </div>
              </div>

              {/* ② WEEKDAY LABEL */}
              <div style={{ background: isT ? "#12141b" : "#1a1c27", padding: "5px 4px 0", textAlign: "center" }}>
                <div style={{
                  fontSize: 10, fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, letterSpacing: ".08em",
                  color: isT ? course.color : "#56637a"
                }}>
                  {d.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase()}
                </div>

                {/* ③ DATE NUMBER */}
                <div style={{
                  fontFamily: "'Syne',sans-serif", fontWeight: 800,
                  fontSize: isT ? 28 : 22, lineHeight: 1,
                  color: isT ? course.color : isSel ? "#f0f2f8" : "#9aaabf",
                  padding: "1px 0 3px",
                  textShadow: isT ? `0 0 20px ${course.color}55` : "none",
                }}>
                  {d.getDate()}
                </div>

                {/* ④ MONTH (first col or boundary) */}
                {(i === 0 || d.getDate() === 1) && (
                  <div style={{ fontSize: 8, color: "#56637a", fontFamily: "'JetBrains Mono',monospace", marginBottom: 2, lineHeight: 1.3 }}>
                    {d.toLocaleDateString("en-US", { month: "short", year: "2-digit" })}
                  </div>
                )}
              </div>

              {/* ⑤ EVENT DOTS + COUNT */}
              <div style={{ background: isT ? "#12141b" : "#1a1c27", padding: "3px 4px 8px", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                {dayEvs.length > 0 && (
                  <div style={{
                    fontSize: 8, fontWeight: 700, fontFamily: "'JetBrains Mono',monospace",
                    color: isT ? course.color : "#56637a",
                    background: isT ? `${course.color}20` : "rgba(255,255,255,.05)",
                    padding: "2px 8px", borderRadius: 99, lineHeight: 1.5
                  }}>
                    {dayEvs.length} session{dayEvs.length !== 1 ? "s" : ""}
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "center", gap: 3, flexWrap: "wrap" }}>
                  {topColors.map((c, j) => (
                    <div key={j} style={{
                      width: 6, height: 6, borderRadius: "50%", background: c,
                      boxShadow: `0 0 4px ${c}88`, flexShrink: 0
                    }} />
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Time grid */}
      <div style={{ overflowY: "auto", maxHeight: 520 }}>
        {HOURS.map(h => {
          const hLabel = h < 12 ? `${h}:00 AM` : h === 12 ? "12:00 PM" : `${h - 12}:00 PM`;
          return (
            <div key={h} style={{ display: "grid", gridTemplateColumns: `64px repeat(7,1fr)`, borderBottom: "1px solid rgba(255,255,255,.03)", minHeight: HOUR_H }}>
              <div style={{ padding: "8px 8px 8px 4px", fontSize: 10, color: "#6b7a99", fontFamily: "'JetBrains Mono',monospace", textAlign: "right", borderRight: "1px solid rgba(255,255,255,.06)", display: "flex", alignItems: "flex-start", justifyContent: "flex-end", flexShrink: 0, paddingTop: 6 }}>
                {hLabel}
              </div>
              {weekDays.map((d, ci) => {
                const hEvs = filteredEvents(d).filter(e => e.date.getHours() === h);
                const isT = isSameDay(d, today);
                const course = getCourseForDate(d);
                return (
                  <div key={ci} style={{ borderLeft: "1px solid rgba(255,255,255,.04)", padding: "3px 5px", background: isT ? `${course.color}08` : "transparent", position: "relative" }}>
                    {hEvs.map((ev, j) => (
                      <div key={j}
                        style={{ background: `${ev.color}1c`, borderLeft: `3px solid ${ev.color}`, borderRadius: "0 8px 8px 0", padding: "5px 8px", marginBottom: 3, cursor: "pointer", transition: "filter .15s" }}
                        onMouseEnter={e => { e.currentTarget.style.filter = "brightness(1.15)"; setTooltip({ x: e.clientX, y: e.clientY, ev }); }}
                        onMouseLeave={e => { e.currentTarget.style.filter = "brightness(1)"; setTooltip(null); }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: ev.color, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{typeIcon[ev.type]} {ev.title}</div>
                        {ev.duration > 0 && <div style={{ fontSize: 9, color: "rgba(255,255,255,.3)", fontFamily: "'JetBrains Mono',monospace" }}>{ev.duration}m</div>}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );

  // ── MONTH VIEW
  const renderMonth = () => {
    const prevMonth = () => { let m = selMonth - 1, y = selYear; if (m < 0) { m = 11; y--; } setSelMonth(m); setSelYear(y); };
    const nextMonth = () => { let m = selMonth + 1, y = selYear; if (m > 11) { m = 0; y++; } setSelMonth(m); setSelYear(y); };
    return (
      <div style={{ background: "#16181f", border: "1px solid rgba(255,255,255,.07)", borderRadius: 16, padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <button onClick={prevMonth} style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(255,255,255,.06)", border: "none", color: "#f0f2f8", cursor: "pointer", fontSize: 16 }}>‹</button>
          <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 18 }}>{monthName} {selYear}</div>
          <button onClick={nextMonth} style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(255,255,255,.06)", border: "none", color: "#f0f2f8", cursor: "pointer", fontSize: 16 }}>›</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4, marginBottom: 8 }}>
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => <div key={d} style={{ textAlign: "center", fontSize: 10, color: "#6b7a99", fontWeight: 700, fontFamily: "'JetBrains Mono',monospace", padding: "6px 0" }}>{d}</div>)}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4 }}>
          {Array.from({ length: firstDOW }).map((_, i) => <div key={`e${i}`} />)}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const d = new Date(selYear, selMonth, day);
            const isT = isSameDay(d, today);
            const isSel = isSameDay(d, selectedDate);
            const dayEvs = eventsForDay(d);
            return (
              <div key={day} onClick={() => setSelectedDate(new Date(d))}
                style={{ minHeight: 80, padding: "6px 5px", borderRadius: 10, cursor: "pointer", border: `1px solid ${isSel ? "rgba(79,142,247,.5)" : isT ? "rgba(79,142,247,.22)" : "rgba(255,255,255,.05)"}`, background: isSel ? "rgba(79,142,247,.12)" : isT ? "rgba(79,142,247,.07)" : "#1e2130", transition: "all .2s" }}
                onMouseEnter={e => { if (!isT && !isSel) e.currentTarget.style.borderColor = "rgba(255,255,255,.15)"; }}
                onMouseLeave={e => { if (!isT && !isSel) e.currentTarget.style.borderColor = "rgba(255,255,255,.05)"; }}>
                {/* Date number row */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                  <span style={{ fontWeight: isSel || isT ? 800 : 600, fontSize: 13, color: isT || isSel ? "#4f8ef7" : "#c0c9d9", fontFamily: "'Syne',sans-serif" }}>{day}</span>
                  {dayEvs.length > 0 && <span style={{ fontSize: 8, fontWeight: 700, fontFamily: "'JetBrains Mono',monospace", color: isT ? "#4f8ef7" : "#6b7a99", background: isT ? "rgba(79,142,247,.15)" : "rgba(255,255,255,.06)", padding: "1px 5px", borderRadius: 99 }}>{dayEvs.length}</span>}
                </div>
                {/* Featured course banner */}
                {(() => {
                  const dc = getCourseForDate(d); return (
                    <div style={{ display: "flex", alignItems: "center", gap: 3, padding: "3px 5px", borderRadius: 6, background: `${dc.color}18`, border: `1px solid ${dc.color}40`, marginBottom: 3, borderLeft: `3px solid ${dc.color}` }}>
                      <span style={{ fontSize: 10, flexShrink: 0 }}>{dc.icon}</span>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 8, fontWeight: 800, color: dc.color, fontFamily: "'Syne',sans-serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 52, lineHeight: 1.2 }}>{dc.label}</div>
                        <div style={{ fontSize: 7, color: `${dc.color}80`, fontFamily: "'JetBrains Mono',monospace", letterSpacing: ".04em" }}>Day focus</div>
                      </div>
                    </div>
                  );
                })()}
                {/* Event chips */}
                {dayEvs.slice(0, 2).map((ev, j) => (
                  <div key={j} style={{ fontSize: 8, fontWeight: 700, padding: "2px 4px", borderRadius: 4, background: `${ev.color}20`, color: ev.color, marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{typeIcon[ev.type]} {ev.title.slice(0, 12)}{ev.title.length > 12 ? "…" : ""}</div>
                ))}
                {dayEvs.length > 2 && <div style={{ fontSize: 8, color: "#6b7a99", fontFamily: "'JetBrains Mono',monospace" }}>+{dayEvs.length - 2} more</div>}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // ── TIMETABLE VIEW
  const renderTimetable = () => {
    const cols = weekDays;
    return (
      <div style={{ background: "#16181f", border: "1px solid rgba(255,255,255,.07)", borderRadius: 16, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: `80px repeat(7,1fr)`, background: "#12141b", borderBottom: "2px solid rgba(255,255,255,.08)" }}>
          <div style={{ padding: "10px 8px 10px 12px", display: "flex", flexDirection: "column", justifyContent: "center", borderRight: "1px solid rgba(255,255,255,.07)" }}>
            <span style={{ fontSize: 8, color: "#4f8ef7", fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase" }}>TIME</span>
          </div>
          {cols.map((d, i) => {
            const isT = isSameDay(d, today);
            const dc = getCourseForDate(d);
            return (
              <div key={i} style={{
                borderLeft: "1px solid rgba(255,255,255,.06)", overflow: "hidden",
                borderBottom: isT ? `3px solid ${dc.color}` : `3px solid transparent`
              }}>
                {/* Course strip */}
                <div style={{ background: isT ? `linear-gradient(135deg,${dc.color}44,${dc.color}22)` : `${dc.color}14`, borderBottom: `1px solid ${dc.color}30`, padding: "6px 5px", display: "flex", alignItems: "center", gap: 5, justifyContent: "center" }}>
                  <span style={{ fontSize: 14, lineHeight: 1 }}>{dc.icon}</span>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 9, fontWeight: 800, color: dc.color, fontFamily: "'Syne',sans-serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 66, lineHeight: 1.2 }}>{dc.label}</div>
                    <div style={{ fontSize: 7, color: `${dc.color}80`, fontFamily: "'JetBrains Mono',monospace", letterSpacing: ".05em", textTransform: "uppercase" }}>Day Focus</div>
                  </div>
                </div>
                {/* Day + date */}
                <div style={{ padding: "5px 4px 7px", textAlign: "center", background: isT ? "rgba(0,0,0,.15)" : "transparent" }}>
                  <div style={{ fontSize: 9, fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, letterSpacing: ".08em", color: isT ? dc.color : "#56637a" }}>
                    {d.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase()}
                  </div>
                  <div style={{
                    fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 20, color: isT ? dc.color : "#9aaabf", lineHeight: 1, margin: "1px 0 2px",
                    textShadow: isT ? `0 0 16px ${dc.color}55` : "none"
                  }}>
                    {d.getDate()}
                  </div>
                  <div style={{ fontSize: 8, color: "#56637a", fontFamily: "'JetBrains Mono',monospace" }}>
                    {d.toLocaleDateString("en-US", { month: "short", year: "2-digit" })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ overflowY: "auto", maxHeight: 500 }}>
          {HOURS.map(h => (
            <div key={h} style={{ display: "grid", gridTemplateColumns: `80px repeat(7,1fr)`, borderBottom: "1px solid rgba(255,255,255,.04)", minHeight: 56 }}>
              <div style={{ padding: "8px 12px", fontSize: 11, color: "#6b7a99", fontFamily: "'JetBrains Mono',monospace", borderRight: "1px solid rgba(255,255,255,.06)", display: "flex", alignItems: "center" }}>
                {h < 12 ? `${h}:00 AM` : h === 12 ? "12:00 PM" : `${h - 12}:00 PM`}
              </div>
              {cols.map((d, ci) => {
                const hEvs = eventsForDay(d).filter(e => e.date.getHours() === h);
                const isT = isSameDay(d, today);
                return (
                  <div key={ci} style={{ borderLeft: "1px solid rgba(255,255,255,.04)", padding: "4px", background: isT ? "rgba(79,142,247,.02)" : "transparent" }}>
                    {hEvs.map((ev, j) => (
                      <div key={j} style={{ background: `${ev.color}18`, border: `1px solid ${ev.color}44`, borderRadius: 7, padding: "5px 8px", marginBottom: 3 }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: ev.color }}>{typeIcon[ev.type]} {ev.title.length > 16 ? ev.title.slice(0, 15) + "…" : ev.title}</div>
                        <div style={{ fontSize: 9, color: "rgba(255,255,255,.3)" }}>{ev.duration > 0 ? ev.duration + "m" : "Due"}</div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ── GANTT VIEW
  const renderGantt = () => (
    <div style={{ background: "#16181f", border: "1px solid rgba(255,255,255,.07)", borderRadius: 16, padding: 20, overflow: "hidden" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div>
          <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 14 }}>📊 Gantt / Swimlane</div>
          <div style={{ fontSize: 11, color: "#6b7a99", marginTop: 2 }}>Hover blocks for details · Collapse sections</div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          {["all", "in-progress", "upcoming", "completed", "live", "deadline"].map(f => (
            <button key={f} onClick={() => setGanttFilter(f)} style={{ padding: "4px 10px", borderRadius: 99, border: `1px solid ${ganttFilter === f ? "rgba(79,142,247,.6)" : "rgba(255,255,255,.1)"}`, background: ganttFilter === f ? "rgba(79,142,247,.18)" : "transparent", color: ganttFilter === f ? "#4f8ef7" : "#9aa5bc", fontSize: 10, fontWeight: 700, cursor: "pointer", fontFamily: "'JetBrains Mono',monospace", textTransform: "capitalize" }}>
              {f === "all" ? "All" : statusLabel[f]}
            </button>
          ))}
          <button onClick={() => setGanttScroll(Math.max(0, ganttScroll - 4))} style={{ width: 28, height: 28, borderRadius: 7, background: "rgba(255,255,255,.06)", border: "none", color: "#f0f2f8", cursor: "pointer", fontSize: 14 }}>‹</button>
          <button onClick={() => setGanttScroll(Math.min(maxGScroll, ganttScroll + 4))} style={{ width: 28, height: 28, borderRadius: 7, background: "rgba(255,255,255,.06)", border: "none", color: "#f0f2f8", cursor: "pointer", fontSize: 14 }}>›</button>
        </div>
      </div>

      <div style={{ overflowX: "hidden", borderRadius: 10, border: "1px solid rgba(255,255,255,.06)" }}>
        {/* Day header row */}
        <div style={{ display: "flex", background: "#1a1c27", borderBottom: "1px solid rgba(255,255,255,.07)" }}>
          <div style={{ width: LABEL_W, flexShrink: 0, padding: "10px 14px", fontSize: 10, fontWeight: 700, color: "#6b7a99", fontFamily: "'JetBrains Mono',monospace", borderRight: "1px solid rgba(255,255,255,.07)" }}>MODULE</div>
          {gDays.slice(gVis, gVis + VIS).map((d, i) => {
            const isT = isSameDay(d, today);
            return (
              <div key={i} style={{ width: DAY_W, flexShrink: 0, textAlign: "center", padding: "8px 2px", borderRight: "1px solid rgba(255,255,255,.04)", background: isT ? "rgba(79,142,247,.15)" : "transparent" }}>
                <div style={{ fontSize: 9, color: isT ? "#4f8ef7" : "#6b7a99", fontFamily: "'JetBrains Mono',monospace", fontWeight: isT ? 700 : 400 }}>{d.toLocaleDateString("en-US", { weekday: "short" })}</div>
                <div style={{ fontSize: 12, fontWeight: isT ? 800 : 500, color: isT ? "#4f8ef7" : "#9aa5bc" }}>{d.getDate()}</div>
                {isT && <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#4f8ef7", margin: "2px auto 0" }} />}
              </div>
            );
          })}
        </div>

        {/* Section + item rows */}
        {filteredGantt.map((sec, si) => (
          <div key={si}>
            <div onClick={() => setExpandedSections(prev => ({ ...prev, [sec.category]: !prev[sec.category] }))}
              style={{ display: "flex", background: "rgba(255,255,255,.025)", borderBottom: "1px solid rgba(255,255,255,.06)", cursor: "pointer" }}>
              <div style={{ width: LABEL_W, flexShrink: 0, padding: "8px 14px", display: "flex", alignItems: "center", gap: 7, borderRight: "1px solid rgba(255,255,255,.07)" }}>
                <span style={{ fontSize: 12 }}>{sec.icon}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: sec.color, fontFamily: "'Syne',sans-serif" }}>{sec.category}</span>
                <span style={{ marginLeft: "auto", fontSize: 11, color: "#6b7a99" }}>{expandedSections[sec.category] ? "▼" : "▶"}</span>
              </div>
              <div style={{ flex: 1, height: 34 }} />
            </div>
            {expandedSections[sec.category] && sec.items.map((item, ii) => (
              <div key={ii} style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,.04)", minHeight: 44, background: ii % 2 === 0 ? "transparent" : "rgba(255,255,255,.01)" }}>
                <div style={{ width: LABEL_W, flexShrink: 0, padding: "8px 14px", borderRight: "1px solid rgba(255,255,255,.05)", display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 7, height: 7, borderRadius: "50%", background: item.color, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: "#f0f2f8", lineHeight: 1.3 }}>{item.label}</div>
                    <div style={{ fontSize: 9, color: "#6b7a99" }}>{item.sub}</div>
                  </div>
                </div>
                <div style={{ flex: 1, display: "flex", position: "relative", alignItems: "center", minHeight: 44 }}>
                  {gDays.slice(gVis, gVis + VIS).map((_, ci) => (
                    <div key={ci} style={{ width: DAY_W, height: "100%", flexShrink: 0, borderRight: "1px solid rgba(255,255,255,.03)" }} />
                  ))}
                  {item.blocks.map((blk, bi) => {
                    const sDay = blk.s - G_OFFSET - gVis;
                    const eDay = blk.e - G_OFFSET - gVis;
                    if (eDay < 0 || sDay >= VIS) return null;
                    const cs = Math.max(0, sDay), ce = Math.min(VIS - 1, eDay);
                    const left = cs * DAY_W + 3, width = (ce - cs + 1) * DAY_W - 6;
                    if (width <= 0) return null;
                    const st = statusStyle[blk.status] || statusStyle["upcoming"];
                    return (
                      <div key={bi} onMouseEnter={e => setTooltip({ x: e.clientX, y: e.clientY, label: item.label, blk })} onMouseLeave={() => setTooltip(null)}
                        style={{ position: "absolute", left, width, height: 28, borderRadius: 6, background: st.bg, border: `1px solid ${st.border}`, display: "flex", alignItems: "center", paddingLeft: 8, cursor: "pointer", overflow: "hidden", zIndex: 1, transition: "filter .15s" }}
                        onMouseOver={e => e.currentTarget.style.filter = "brightness(1.15)"}
                        onMouseOut={e => e.currentTarget.style.filter = "brightness(1)"}>
                        <span style={{ fontSize: 10, fontWeight: 700, color: st.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{blk.title}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Gantt legend */}
      <div style={{ display: "flex", gap: 14, marginTop: 12, flexWrap: "wrap" }}>
        {[["#10b981", "rgba(16,185,129,.22)", "Completed"], ["#4f8ef7", "rgba(79,142,247,.22)", "In Progress"], ["#9aa5bc", "rgba(255,255,255,.07)", "Upcoming"], ["#f43f5e", "rgba(244,63,94,.2)", "Live Now"], ["#f59e0b", "rgba(245,158,11,.2)", "Deadline"]].map((l, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 20, height: 10, borderRadius: 3, background: l[1], border: `1px solid ${l[0]}` }} />
            <span style={{ fontSize: 10, color: "#9aa5bc" }}>{l[2]}</span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

      {/* ── TOP BAR: stats + controls ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr) 1fr", gap: 12 }}>
        {[
          { icon: "📅", label: "Today's Sessions", val: todayCount, color: "#4f8ef7" },
          { icon: "📌", label: "Upcoming Events", val: upcoming, color: "#10b981" },
          { icon: "⚠️", label: "Deadlines", val: deadlines, color: "#f43f5e" },
          { icon: "⏱", label: "Course Hrs/Week", val: `${Math.round(weekHours / 60)}h ${weekHours % 60}m`, color: "#f59e0b" },
        ].map((s, i) => (
          <div key={i} style={{ background: "#16181f", border: `1px solid ${s.color}28`, borderRadius: 14, padding: "14px 16px", display: "flex", gap: 12, alignItems: "center" }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: `${s.color}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{s.icon}</div>
            <div>
              <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 20, color: s.color }}>{s.val}</div>
              <div style={{ fontSize: 10, color: "#6b7a99", fontFamily: "'JetBrains Mono',monospace", textTransform: "uppercase", letterSpacing: ".04em" }}>{s.label}</div>
            </div>
          </div>
        ))}
        {/* Pomodoro timer card */}
        <div style={{ background: "#16181f", border: "1px solid rgba(124,58,237,.3)", borderRadius: 14, padding: "12px 14px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6 }}>
          <div style={{ fontSize: 10, color: "#7c3aed", fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, letterSpacing: ".06em" }}>🍅 FOCUS TIMER</div>
          <div style={{ position: "relative", width: 54, height: 54 }}>
            <svg width="54" height="54" viewBox="0 0 54 54">
              <circle cx="27" cy="27" r="22" fill="none" stroke="rgba(124,58,237,.15)" strokeWidth="4" />
              <circle cx="27" cy="27" r="22" fill="none" stroke="#7c3aed" strokeWidth="4"
                strokeDasharray={`${timerPct / 100 * 138.2} 138.2`} strokeLinecap="round" transform="rotate(-90 27 27)" style={{ transition: "stroke-dasharray .5s" }} />
            </svg>
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, fontFamily: "'JetBrains Mono',monospace", color: "#7c3aed" }}>{fmtTimer(timerSec)}</div>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={() => setTimerRunning(!timerRunning)} style={{ padding: "4px 10px", borderRadius: 7, background: "rgba(124,58,237,.2)", border: "1px solid rgba(124,58,237,.4)", color: "#a78bfa", fontSize: 10, fontWeight: 700, cursor: "pointer" }}>{timerRunning ? "⏸ Pause" : "▶ Start"}</button>
            <button onClick={() => { setTimerRunning(false); setTimerSec(25 * 60); }} style={{ padding: "4px 8px", borderRadius: 7, background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)", color: "#6b7a99", fontSize: 10, cursor: "pointer" }}>↺</button>
          </div>
        </div>
      </div>

      {/* ── VIEW SWITCHER + SEARCH + ADD ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 6, background: "#16181f", border: "1px solid rgba(255,255,255,.07)", borderRadius: 12, padding: 5 }}>
          {[["week", "📅 Week"], ["month", "📆 Month"], ["timetable", "📋 Timetable"], ["gantt", "📊 Gantt"]].map(([v, lbl]) => (
            <button key={v} onClick={() => setView(v)} style={{ padding: "7px 16px", borderRadius: 9, border: "none", background: view === v ? "linear-gradient(135deg,#4f8ef7,#7c3aed)" : "transparent", color: view === v ? "#fff" : "#9aa5bc", fontSize: 12, fontWeight: 700, cursor: "pointer", transition: "all .2s" }}>{lbl}</button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {/* Search */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#16181f", border: "1px solid rgba(255,255,255,.08)", borderRadius: 10, padding: "8px 14px", width: 200 }}>
            <span style={{ color: "#6b7a99", fontSize: 13 }}>🔍</span>
            <input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="Search events…" style={{ background: "none", border: "none", outline: "none", color: "#f0f2f8", fontSize: 12, width: "100%", fontFamily: "'DM Sans',sans-serif" }} />
          </div>
          {/* Nav arrows for week */}
          {(view === "week" || view === "timetable") && (
            <div style={{ display: "flex", gap: 4 }}>
              <button onClick={() => { const d = new Date(selectedDate); d.setDate(d.getDate() - 7); setSelectedDate(d); }} style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(255,255,255,.06)", border: "none", color: "#f0f2f8", cursor: "pointer", fontSize: 16 }}>‹</button>
              <button onClick={() => setSelectedDate(new Date(today))} style={{ padding: "0 10px", height: 32, borderRadius: 8, background: "rgba(79,142,247,.15)", border: "1px solid rgba(79,142,247,.3)", color: "#4f8ef7", cursor: "pointer", fontSize: 11, fontWeight: 700 }}>Today</button>
              <button onClick={() => { const d = new Date(selectedDate); d.setDate(d.getDate() + 7); setSelectedDate(d); }} style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(255,255,255,.06)", border: "none", color: "#f0f2f8", cursor: "pointer", fontSize: 16 }}>›</button>
            </div>
          )}
          {/* Add event */}
          <button onClick={() => setShowAddModal(true)} style={{ padding: "8px 18px", borderRadius: 10, background: "linear-gradient(135deg,#4f8ef7,#7c3aed)", color: "#fff", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>+ Add Event</button>
        </div>
      </div>

      {/* ── CURRENT VIEW ── */}
      {view === "week" && renderWeek()}
      {view === "month" && renderMonth()}
      {view === "timetable" && renderTimetable()}
      {view === "gantt" && renderGantt()}

      {/* ── BOTTOM ROW: Day panel + Deadlines + Reminders ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
        {/* Selected day detail */}
        <div style={{ background: "#16181f", border: "1px solid rgba(255,255,255,.07)", borderRadius: 16, padding: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div>
              <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 14 }}>📋 {selectedDate.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}</div>
              {isSameDay(selectedDate, today) && <span style={{ fontSize: 9, padding: "2px 7px", borderRadius: 99, background: "rgba(79,142,247,.18)", color: "#4f8ef7", fontFamily: "'JetBrains Mono',monospace", fontWeight: 700 }}>TODAY</span>}
            </div>
            <div style={{ fontSize: 12, color: "#6b7a99" }}>{filteredEvents(selectedDate).length} events</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 7, maxHeight: 250, overflowY: "auto" }}>
            {filteredEvents(selectedDate).length === 0
              ? <div style={{ color: "#6b7a99", fontSize: 12, textAlign: "center", padding: "20px 0" }}>No events</div>
              : filteredEvents(selectedDate).map((ev, i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "9px 10px", borderRadius: 10, background: `${ev.color}10`, border: `1px solid ${ev.color}28` }}>
                  <div style={{ fontSize: 16, flexShrink: 0 }}>{typeIcon[ev.type]}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ev.title}</div>
                    <div style={{ fontSize: 10, color: "#9aa5bc" }}>{ev.date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}{ev.duration > 0 ? ` · ${ev.duration}m` : ""}</div>
                    {ev.note && <div style={{ fontSize: 10, color: "#6b7a99", marginTop: 2, fontStyle: "italic" }}>{ev.note}</div>}
                  </div>
                  <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 99, background: `${ev.color}22`, color: ev.color, flexShrink: 0, fontFamily: "'JetBrains Mono',monospace" }}>{typeLabel[ev.type]}</span>
                </div>
              ))
            }
          </div>
        </div>

        {/* Deadline tracker */}
        <div style={{ background: "#16181f", border: "1px solid rgba(255,255,255,.07)", borderRadius: 16, padding: 18 }}>
          <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 14, marginBottom: 12 }}>⚠️ Deadline Tracker</div>
          {events.filter(e => e.type === "deadline" && e.date >= today).sort((a, b) => a.date - b.date).map((d, i) => {
            const diff = Math.ceil((d.date - today) / (1000 * 60 * 60 * 24));
            const urg = diff <= 1 ? "#f43f5e" : diff <= 3 ? "#f59e0b" : "#10b981";
            return (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "center", padding: "10px 11px", borderRadius: 10, border: `1px solid ${urg}28`, background: `${urg}08`, marginBottom: 8 }}>
                <div style={{ width: 32, height: 32, borderRadius: 9, background: `${urg}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>⚠️</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.title}</div>
                  <div style={{ fontSize: 10, color: "#9aa5bc" }}>{d.date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</div>
                </div>
                <div style={{ fontSize: 11, fontWeight: 800, color: urg, fontFamily: "'JetBrains Mono',monospace", flexShrink: 0 }}>{diff === 0 ? "Today" : diff === 1 ? "Tomorrow" : `${diff}d`}</div>
              </div>
            );
          })}
        </div>

        {/* Reminder alerts */}
        <div style={{ background: "#16181f", border: "1px solid rgba(255,255,255,.07)", borderRadius: 16, padding: 18 }}>
          <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 14, marginBottom: 12 }}>🔔 Upcoming Seminars</div>
          {events.filter(e => e.type === "seminar" && e.date >= today).sort((a, b) => a.date - b.date).slice(0, 4).map((s, i) => {
            const diff = Math.ceil((s.date - today) / (1000 * 60 * 60 * 24));
            return (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "10px 11px", borderRadius: 10, border: `1px solid ${s.color}22`, background: `${s.color}08`, marginBottom: 8 }}>
                <div style={{ fontSize: 17, flexShrink: 0 }}>🎤</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.title}</div>
                  <div style={{ fontSize: 10, color: "#9aa5bc" }}>{s.date.toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</div>
                </div>
                <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 99, background: `${s.color}22`, color: s.color, flexShrink: 0 }}>{diff === 0 ? "Today" : diff === 1 ? "Tmr" : `+${diff}d`}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── ADD EVENT MODAL ── */}
      {showAddModal && (
        <div onClick={() => setShowAddModal(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.65)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, backdropFilter: "blur(6px)" }}>
          <div onClick={e => e.stopPropagation()} style={{ background: "#16181f", border: "1px solid rgba(255,255,255,.1)", borderRadius: 20, padding: 32, width: 440, boxShadow: "0 16px 48px rgba(0,0,0,.5)", animation: "popIn .25s ease" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
              <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 18 }}>+ Add Event</div>
              <button onClick={() => setShowAddModal(false)} style={{ background: "rgba(255,255,255,.06)", border: "none", color: "#9aa5bc", cursor: "pointer", width: 30, height: 30, borderRadius: 8, fontSize: 15 }}>✕</button>
            </div>
            {[
              { lbl: "Event Title", el: <input value={newEvent.title} onChange={e => setNewEvent({ ...newEvent, title: e.target.value })} placeholder="e.g. React Mastery – Hooks" style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid rgba(79,142,247,.3)", background: "#1e2130", color: "#f0f2f8", fontSize: 13, outline: "none", fontFamily: "'DM Sans',sans-serif" }} /> },
              {
                lbl: "Type", el: (
                  <select value={newEvent.type} onChange={e => setNewEvent({ ...newEvent, type: e.target.value })} style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid rgba(79,142,247,.3)", background: "#1e2130", color: "#f0f2f8", fontSize: 13, outline: "none" }}>
                    {Object.entries(typeLabel).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                )
              },
              { lbl: "Time", el: <input type="time" value={newEvent.time} onChange={e => setNewEvent({ ...newEvent, time: e.target.value })} style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid rgba(79,142,247,.3)", background: "#1e2130", color: "#f0f2f8", fontSize: 13, outline: "none" }} /> },
              { lbl: "Duration (minutes)", el: <input type="number" value={newEvent.duration} onChange={e => setNewEvent({ ...newEvent, duration: e.target.value })} style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid rgba(79,142,247,.3)", background: "#1e2130", color: "#f0f2f8", fontSize: 13, outline: "none" }} /> },
              { lbl: "Notes", el: <input value={newEvent.note} onChange={e => setNewEvent({ ...newEvent, note: e.target.value })} placeholder="Optional note…" style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid rgba(79,142,247,.3)", background: "#1e2130", color: "#f0f2f8", fontSize: 13, outline: "none", fontFamily: "'DM Sans',sans-serif" }} /> },
            ].map(({ lbl, el }, i) => (
              <div key={i} style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7a99", fontFamily: "'JetBrains Mono',monospace", letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 6 }}>{lbl}</div>
                {el}
              </div>
            ))}
            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button onClick={() => setShowAddModal(false)} style={{ flex: 1, padding: "11px", borderRadius: 11, border: "1px solid rgba(255,255,255,.1)", background: "transparent", color: "#9aa5bc", cursor: "pointer", fontSize: 13, fontWeight: 700 }}>Cancel</button>
              <button onClick={handleAddEvent} style={{ flex: 2, padding: "11px", borderRadius: 11, background: "linear-gradient(135deg,#4f8ef7,#7c3aed)", color: "#fff", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 700 }}>Add to Schedule</button>
            </div>
          </div>
        </div>
      )}

      {/* ── TOOLTIP ── */}
      {tooltip && (
        <div style={{ position: "fixed", left: tooltip.x + 12, top: tooltip.y - 70, background: "#1e2130", border: "1px solid rgba(255,255,255,.12)", borderRadius: 12, padding: "12px 16px", zIndex: 9999, pointerEvents: "none", minWidth: 180, boxShadow: "0 8px 32px rgba(0,0,0,.5)" }}>
          {tooltip.ev
            ? <>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{typeIcon[tooltip.ev.type]} {tooltip.ev.title}</div>
              <div style={{ fontSize: 11, color: "#9aa5bc", marginBottom: 3 }}>{tooltip.ev.date.toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</div>
              {tooltip.ev.duration > 0 && <div style={{ fontSize: 11, color: "#9aa5bc", marginBottom: 3 }}>Duration: {tooltip.ev.duration} min</div>}
              {tooltip.ev.note && <div style={{ fontSize: 10, color: "#6b7a99", fontStyle: "italic" }}>{tooltip.ev.note}</div>}
            </>
            : <>
              <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 4 }}>{tooltip.label}</div>
              <div style={{ fontSize: 11, color: "#9aa5bc", marginBottom: 4 }}>{tooltip.blk.title}</div>
              <div style={{ fontSize: 10, color: statusStyle[tooltip.blk.status]?.text || "#9aa5bc", fontWeight: 700, fontFamily: "'JetBrains Mono',monospace" }}>{statusLabel[tooltip.blk.status]}</div>
            </>
          }
        </div>
      )}
    </div>
  );
}


/* ══════════════════════════════════════════════════════════
   LESSON QUIZ COMPONENT
   Props: lessonId (str), lessonTitle (str), courseColor (hex)
   Backend: POST /api/quiz/generate  { lessonId, lessonTitle }
            → { questions: [ { id, question, options:[str], answer:str, explanation:str } ] }
   Backend: POST /api/quiz/submit    { lessonId, answers:{ questionId: selectedOption } }
            → { score, total, breakdown:[{ id, correct, explanation }] }
══════════════════════════════════════════════════════════ */
function LessonQuiz({ lessonId, lessonTitle, courseColor }) {
  const C = courseColor || "#4f8ef7";

  // UI state
  const [mode, setMode] = useState("cta");      // cta | loading | quiz | result | error
  const [questions, setQuestions] = useState([]);      // filled by backend
  const [answers, setAnswers] = useState({});           // { qId: selectedOption }
  const [current, setCurrent] = useState(0);
  const [result, setResult] = useState(null);        // { score, total, breakdown }
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef(null);

  // ── TIMER per question (30s) — cleared when backend quiz arrives
  useEffect(() => {
    if (mode !== "quiz" || questions.length === 0) return;
    setTimeLeft(30);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          // auto-advance if unanswered
          if (!answers[questions[current]?.id]) {
            handleNext();
          }
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [current, mode, questions.length]);

  // ── Fetch questions from backend
  const startQuiz = async () => {
    setMode("loading");
    setAnswers({});
    setCurrent(0);
    setResult(null);
    try {
      /* ── BACKEND HOOK ──────────────────────────────────────
         Replace this fetch with your real API endpoint.
         Expected response:
         {
           questions: [
             {
               id: "q1",
               question: "What does JSX stand for?",
               options: ["JavaScript XML","Java Syntax Extension","JSON XML","None"],
               answer: "JavaScript XML",
               explanation: "JSX is a syntax extension for JavaScript..."
             },
             ...
           ]
         }
      ── END BACKEND HOOK ─────────────────────────────────── */
      const res = await fetch("/api/quiz/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId, lessonTitle }),
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      if (!data.questions || data.questions.length === 0) throw new Error("No questions returned.");
      setQuestions(data.questions);
      setMode("quiz");
    } catch (err) {
      // No backend yet — show error state, never fake questions
      setErrorMsg(err.message || "Backend not connected. Link /api/quiz/generate to start.");
      setMode("error");
    }
  };

  // ── Submit answers to backend
  const submitQuiz = async () => {
    setSubmitting(true);
    clearInterval(timerRef.current);
    try {
      /* ── BACKEND HOOK ──────────────────────────────────────
         Expected response:
         {
           score: 3,
           total: 5,
           breakdown: [
             { id: "q1", correct: true, explanation: "..." },
             ...
           ]
         }
      ── END BACKEND HOOK ─────────────────────────────────── */
      const res = await fetch("/api/quiz/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId, answers }),
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      setResult(data);
      setMode("result");
    } catch (err) {
      // ── FALLBACK: calculate locally if backend unavailable
      const score = questions.filter(q => answers[q.id] === q.answer).length;
      setResult({
        score,
        total: questions.length,
        breakdown: questions.map(q => ({
          id: q.id,
          correct: answers[q.id] === q.answer,
          selected: answers[q.id] || "Not answered",
          answer: q.answer,
          explanation: q.explanation || "",
        })),
      });
      setMode("result");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSelect = (qId, option) => setAnswers(prev => ({ ...prev, [qId]: option }));
  const handleNext = () => { if (current < questions.length - 1) setCurrent(c => c + 1); };
  const handlePrev = () => { if (current > 0) setCurrent(c => c - 1); };
  const allAnswered = questions.length > 0 && questions.every(q => answers[q.id]);
  const answeredCount = Object.keys(answers).length;
  const q = questions[current];
  const timePct = (timeLeft / 30) * 100;
  const timerColor = timeLeft > 15 ? "#10b981" : timeLeft > 7 ? "#f59e0b" : "#f43f5e";

  // ── CTA
  if (mode === "cta") return (
    <div style={{ margin: "16px 20px", borderRadius: 14, background: `linear-gradient(135deg,${C}18,rgba(124,58,237,.12))`, border: `1px solid ${C}33`, padding: "20px 22px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: 48, height: 48, borderRadius: 14, background: `linear-gradient(135deg,${C},#7c3aed)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0, boxShadow: `0 4px 20px ${C}44` }}>🤖</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 15, marginBottom: 4 }}>Take AI Quiz from this Lesson</div>
          <div style={{ fontSize: 12, color: "#6b7a99", lineHeight: 1.6 }}>Test your understanding with dynamically generated questions. Questions load from your backend API.</div>
        </div>
        <button onClick={startQuiz}
          style={{ padding: "10px 22px", borderRadius: 11, background: `linear-gradient(135deg,${C},#7c3aed)`, color: "#fff", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 800, flexShrink: 0, boxShadow: `0 4px 16px ${C}44`, whiteSpace: "nowrap" }}>
          Start Quiz →
        </button>
      </div>
      <div style={{ display: "flex", gap: 12, marginTop: 14, paddingTop: 14, borderTop: "1px solid rgba(255,255,255,.06)" }}>
        {[{ i: "🧠", l: "AI-generated" }, { i: "⏱", l: "30s per question" }, { i: "📊", l: "Instant results" }, { i: "💡", l: "Explanations" }].map((tag, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#6b7a99" }}>
            <span style={{ fontSize: 13 }}>{tag.i}</span>{tag.l}
          </div>
        ))}
      </div>
    </div>
  );

  // ── LOADING
  if (mode === "loading") return (
    <div style={{ margin: "16px 20px", borderRadius: 14, background: "#16181f", border: "1px solid rgba(255,255,255,.07)", padding: "32px", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
      <div style={{ width: 52, height: 52, borderRadius: 14, background: `linear-gradient(135deg,${C},#7c3aed)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, animation: "spin 1.5s linear infinite" }}>🤖</div>
      <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 16 }}>Generating quiz questions…</div>
      <div style={{ fontSize: 12, color: "#6b7a99", textAlign: "center", maxWidth: 280, lineHeight: 1.7 }}>Your backend is generating personalised questions for this lesson. This usually takes 2–5 seconds.</div>
      <div style={{ width: "100%", maxWidth: 240, height: 4, borderRadius: 99, background: "rgba(255,255,255,.07)", overflow: "hidden" }}>
        <div style={{ height: "100%", background: `linear-gradient(90deg,${C},#7c3aed)`, borderRadius: 99, animation: "progressFill 2s ease-in-out infinite alternate", width: "70%" }} />
      </div>
    </div>
  );

  // ── ERROR
  if (mode === "error") return (
    <div style={{ margin: "16px 20px", borderRadius: 14, background: "rgba(244,63,94,.08)", border: "1px solid rgba(244,63,94,.3)", padding: "20px 22px", display: "flex", gap: 14, alignItems: "flex-start" }}>
      <span style={{ fontSize: 24, flexShrink: 0 }}>⚠️</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4, color: "#f43f5e" }}>Failed to load quiz</div>
        <div style={{ fontSize: 12, color: "#9aa5bc", lineHeight: 1.6, marginBottom: 12 }}>{errorMsg}</div>
        <button onClick={startQuiz} style={{ padding: "7px 16px", borderRadius: 9, background: "rgba(244,63,94,.18)", border: "1px solid rgba(244,63,94,.4)", color: "#f43f5e", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>Retry</button>
      </div>
    </div>
  );

  // ── QUIZ
  if (mode === "quiz" && q) return (
    <div style={{ margin: "16px 20px", borderRadius: 14, background: "#16181f", border: `1px solid ${C}22`, overflow: "hidden" }}>
      {/* Quiz header */}
      <div style={{ padding: "14px 18px", background: "#1a1c27", borderBottom: "1px solid rgba(255,255,255,.07)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 16 }}>🤖</span>
          <div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 13 }}>AI Quiz · {lessonTitle.slice(0, 30)}{lessonTitle.length > 30 ? "…" : ""}</div>
            <div style={{ fontSize: 10, color: "#6b7a99", fontFamily: "'JetBrains Mono',monospace" }}>Question {current + 1} of {questions.length} · {answeredCount}/{questions.length} answered</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Timer ring */}
          <div style={{ position: "relative", width: 36, height: 36, flexShrink: 0 }}>
            <svg width="36" height="36" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,.07)" strokeWidth="3" />
              <circle cx="18" cy="18" r="15" fill="none" stroke={timerColor} strokeWidth="3"
                strokeDasharray={`${timePct / 100 * 94.2} 94.2`} strokeLinecap="round"
                transform="rotate(-90 18 18)" style={{ transition: "stroke-dasharray .5s,stroke .3s" }} />
            </svg>
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, fontFamily: "'JetBrains Mono',monospace", color: timerColor }}>{timeLeft}</div>
          </div>
          <button onClick={() => { clearInterval(timerRef.current); setMode("cta"); }} style={{ padding: "5px 10px", borderRadius: 8, background: "rgba(255,255,255,.05)", border: "none", color: "#6b7a99", cursor: "pointer", fontSize: 11 }}>✕ Exit</button>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 3, background: "rgba(255,255,255,.06)" }}>
        <div style={{ height: "100%", width: `${(current + 1) / questions.length * 100}%`, background: `linear-gradient(90deg,${C},#7c3aed)`, transition: "width .4s ease" }} />
      </div>

      {/* Question */}
      <div style={{ padding: "20px 18px 10px" }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: C, fontFamily: "'JetBrains Mono',monospace", letterSpacing: ".07em", marginBottom: 10 }}>QUESTION {current + 1}</div>
        <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 16, lineHeight: 1.5, color: "#f0f2f8", marginBottom: 18 }}>{q.question}</div>

        {/* Options */}
        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          {(q.options || []).map((opt, oi) => {
            const letter = ["A", "B", "C", "D"][oi];
            const selected = answers[q.id] === opt;
            return (
              <div key={oi} onClick={() => handleSelect(q.id, opt)}
                style={{
                  display: "flex", gap: 12, alignItems: "center", padding: "12px 14px", borderRadius: 11, cursor: "pointer",
                  background: selected ? `${C}20` : "rgba(255,255,255,.03)",
                  border: `1.5px solid ${selected ? C : "rgba(255,255,255,.08)"}`,
                  transition: "all .18s"
                }}
                onMouseEnter={e => { if (!selected) { e.currentTarget.style.background = "rgba(255,255,255,.06)"; e.currentTarget.style.borderColor = "rgba(255,255,255,.15)"; } }}
                onMouseLeave={e => { if (!selected) { e.currentTarget.style.background = "rgba(255,255,255,.03)"; e.currentTarget.style.borderColor = "rgba(255,255,255,.08)"; } }}
              >
                <div style={{
                  width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                  background: selected ? C : "rgba(255,255,255,.06)",
                  border: `1.5px solid ${selected ? C : "rgba(255,255,255,.1)"}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, fontWeight: 800, color: selected ? "#fff" : "#6b7a99",
                  fontFamily: "'JetBrains Mono',monospace", transition: "all .18s"
                }}>
                  {letter}
                </div>
                <span style={{ fontSize: 13, fontWeight: selected ? 600 : 400, color: selected ? "#f0f2f8" : "#c0c9d9", flex: 1 }}>{opt}</span>
                {selected && <span style={{ color: C, fontSize: 16, flexShrink: 0 }}>●</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation */}
      <div style={{ padding: "14px 18px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255,255,255,.06)", marginTop: 10 }}>
        <button onClick={handlePrev} disabled={current === 0}
          style={{ padding: "8px 18px", borderRadius: 10, background: current === 0 ? "transparent" : "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.08)", color: current === 0 ? "#3a4055" : "#9aa5bc", cursor: current === 0 ? "default" : "pointer", fontSize: 12, fontWeight: 700 }}>
          ← Prev
        </button>

        <div style={{ display: "flex", gap: 6 }}>
          {questions.map((_, i) => (
            <div key={i} onClick={() => setCurrent(i)} style={{
              width: 8, height: 8, borderRadius: "50%", cursor: "pointer",
              background: i === current ? C : answers[questions[i]?.id] ? "rgba(79,142,247,.5)" : "rgba(255,255,255,.12)",
              transition: "all .2s", transform: i === current ? "scale(1.4)" : "scale(1)"
            }} />
          ))}
        </div>

        {current < questions.length - 1 ? (
          <button onClick={handleNext}
            style={{ padding: "8px 18px", borderRadius: 10, background: `${C}22`, border: `1px solid ${C}44`, color: C, cursor: "pointer", fontSize: 12, fontWeight: 700 }}>
            Next →
          </button>
        ) : (
          <button onClick={submitQuiz} disabled={submitting}
            style={{ padding: "8px 20px", borderRadius: 10, background: allAnswered ? `linear-gradient(135deg,${C},#7c3aed)` : "rgba(255,255,255,.06)", border: "none", color: allAnswered ? "#fff" : "#6b7a99", cursor: allAnswered ? "pointer" : "default", fontSize: 12, fontWeight: 800, display: "flex", alignItems: "center", gap: 6, transition: "all .2s" }}>
            {submitting ? <><span style={{ animation: "spin .7s linear infinite", display: "inline-block" }}>⟳</span> Submitting…</> : "Submit Quiz ✓"}
          </button>
        )}
      </div>
    </div>
  );

  // ── RESULT
  if (mode === "result" && result) {
    const pct = Math.round((result.score / result.total) * 100);
    const grade = pct >= 80 ? { label: "Excellent!", color: "#10b981", icon: "🏆" } : pct >= 60 ? { label: "Good job!", color: "#4f8ef7", icon: "⚡" } : pct >= 40 ? { label: "Keep going!", color: "#f59e0b", icon: "📚" } : { label: "Needs review", color: "#f43f5e", icon: "⚠️" };
    return (
      <div style={{ margin: "16px 20px", borderRadius: 14, background: "#16181f", border: `1px solid ${C}22`, overflow: "hidden" }}>
        {/* Score header */}
        <div style={{ padding: "24px", background: `linear-gradient(135deg,${C}18,rgba(124,58,237,.1))`, textAlign: "center", borderBottom: "1px solid rgba(255,255,255,.07)" }}>
          <div style={{ fontSize: 44, marginBottom: 8 }}>{grade.icon}</div>
          <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 22, color: grade.color, marginBottom: 4 }}>{grade.label}</div>
          <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 900, fontSize: 48, color: "#f0f2f8", lineHeight: 1, marginBottom: 8 }}>{pct}<span style={{ fontSize: 24, color: "#6b7a99" }}>%</span></div>
          <div style={{ fontSize: 13, color: "#6b7a99" }}>{result.score} out of {result.total} correct</div>
          {/* Score bar */}
          <div style={{ height: 6, borderRadius: 99, background: "rgba(255,255,255,.07)", maxWidth: 240, margin: "16px auto 0", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${pct}%`, background: `linear-gradient(90deg,${grade.color},${C})`, borderRadius: 99, transition: "width 1.2s ease" }} />
          </div>
        </div>

        {/* Breakdown */}
        {result.breakdown && result.breakdown.length > 0 && (
          <div style={{ padding: "16px 18px" }}>
            <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 13, marginBottom: 12, color: "#f0f2f8" }}>Answer Review</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {result.breakdown.map((b, i) => {
                const qObj = questions.find(q => q.id === b.id) || {};
                return (
                  <div key={i} style={{ padding: "12px 14px", borderRadius: 11, background: b.correct ? "rgba(16,185,129,.08)" : "rgba(244,63,94,.08)", border: `1px solid ${b.correct ? "rgba(16,185,129,.25)" : "rgba(244,63,94,.25)"}` }}>
                    <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: b.explanation ? 8 : 0 }}>
                      <span style={{ fontSize: 14, flexShrink: 0 }}>{b.correct ? "✅" : "❌"}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: "#f0f2f8", marginBottom: 3 }}>{qObj.question || `Question ${i + 1}`}</div>
                        <div style={{ fontSize: 11, color: "#9aa5bc" }}>
                          Your answer: <span style={{ color: b.correct ? "#10b981" : "#f43f5e", fontWeight: 600 }}>{b.selected || answers[b.id] || "Not answered"}</span>
                          {!b.correct && <> · Correct: <span style={{ color: "#10b981", fontWeight: 600 }}>{b.answer || qObj.answer}</span></>}
                        </div>
                      </div>
                    </div>
                    {b.explanation && (
                      <div style={{ marginTop: 6, padding: "8px 10px", borderRadius: 8, background: "rgba(255,255,255,.04)", fontSize: 11, color: "#9aa5bc", lineHeight: 1.6 }}>
                        💡 {b.explanation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Actions */}
        <div style={{ padding: "0 18px 18px", display: "flex", gap: 10 }}>
          <button onClick={startQuiz}
            style={{ flex: 1, padding: "10px", borderRadius: 11, background: `linear-gradient(135deg,${C},#7c3aed)`, color: "#fff", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 700 }}>
            🔄 Retake Quiz
          </button>
          <button onClick={() => setMode("cta")}
            style={{ padding: "10px 18px", borderRadius: 11, background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)", color: "#9aa5bc", cursor: "pointer", fontSize: 13, fontWeight: 700 }}>
            Done
          </button>
        </div>
      </div>
    );
  }

  return null;
}

/* VideoPlayer — click thumbnail to play inline via iframe.
   youtube-nocookie.com works on localhost, Vercel, Netlify and any real domain.
   Only blocked inside Claude.ai sandbox (CSP restriction of that platform). */
function VideoPlayer({ vid, title, dur }) {
  const [playing, setPlaying] = useState(false);
  const [hovered, setHovered] = useState(false);
  return (
    <div style={{ position: "relative", width: "100%", paddingBottom: "56.25%", background: "#000", overflow: "hidden" }}>
      {playing ? (
        <iframe
          key={vid}
          src={`https://www.youtube-nocookie.com/embed/${vid}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
          title={title}
          style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      ) : (
        <div style={{ position: "absolute", inset: 0, cursor: "pointer" }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onClick={() => setPlaying(true)}>
          <img
            src={`https://img.youtube.com/vi/${vid}/maxresdefault.jpg`}
            alt={title}
            style={{ width: "100%", height: "100%", objectFit: "cover", opacity: hovered ? .92 : .78, transition: "opacity .2s,transform .3s", transform: hovered ? "scale(1.03)" : "scale(1)" }}
            onError={e => { e.target.src = `https://img.youtube.com/vi/${vid}/hqdefault.jpg`; }}
          />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,rgba(0,0,0,.88) 0%,rgba(0,0,0,.1) 55%)" }} />
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: `translate(-50%,-50%) scale(${hovered ? 1.1 : 1})`, transition: "transform .2s,box-shadow .2s", width: 76, height: 76, borderRadius: "50%", background: "#ff0000", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: hovered ? "0 6px 48px rgba(255,0,0,.85)" : "0 4px 32px rgba(255,0,0,.55)" }}>
            <div style={{ width: 0, height: 0, borderTop: "15px solid transparent", borderBottom: "15px solid transparent", borderLeft: "26px solid #fff", marginLeft: 7 }} />
          </div>
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "18px 22px" }}>
            <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 18, color: "#fff", marginBottom: 4, textShadow: "0 2px 12px rgba(0,0,0,.95)", lineHeight: 1.25 }}>{title}</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,.55)" }}>Click to play</div>
          </div>
          <div style={{ position: "absolute", top: 12, right: 14, background: "rgba(0,0,0,.8)", borderRadius: 6, padding: "4px 10px", fontSize: 11, color: "#fff", fontFamily: "'JetBrains Mono',monospace", fontWeight: 700 }}>⏱ {dur}</div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   QUIZ PAGE — Full standalone quiz experience
   Backend hooks:
     POST /api/quiz/topic-generate  { topic, difficulty, userId }
       → { questions:[{id,question,options,answer,explanation}], sessionId }
     POST /api/quiz/submit          { sessionId, answers:{qId:option} }
       → { score, total, breakdown, nextTopic, performance }
     GET  /api/quiz/history         { userId }
       → { sessions:[{date,topic,score,total,difficulty}], weakTopics, strengths }
     GET  /api/quiz/suggested-topics { userId }
       → { topics:[{name,icon,reason,difficulty}] }
══════════════════════════════════════════════════════════ */

/* Duck SVG animation — used during loading */
function DuckLoader({ msg }) {
  const [frame, setFrame] = useState(0);
  const msgs = msg ? [msg] : ["Waddling through your topic…", "Quacking open the question bank…", "Duck-diving into AI generation…", "Almost there, honk!"];
  const [mi, setMi] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setFrame(f => (f + 1) % 4), 200);
    const t2 = setInterval(() => setMi(m => (m + 1) % msgs.length), 1800);
    return () => { clearInterval(t); clearInterval(t2); };
  }, []);
  const bodyY = [0, -4, -8, -4][frame];
  const wingA = ["0", "-12", "−20", "-12"][frame];
  const legL = [2, 0, -2, 0][frame];
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20, padding: "40px 0" }}>
      {/* Duck SVG */}
      <svg width="120" height="100" viewBox="0 0 120 100" style={{ overflow: "visible" }}>
        {/* Water ripple */}
        <ellipse cx="60" cy="88" rx="44" ry="7" fill="rgba(79,142,247,.12)" stroke="rgba(79,142,247,.25)" strokeWidth="1" />
        <ellipse cx="60" cy="88" rx="30" ry="4" fill="rgba(79,142,247,.08)" stroke="rgba(79,142,247,.18)" strokeWidth="1" />
        {/* Shadow */}
        <ellipse cx="60" cy={88 + bodyY * 0.3} rx="24" ry="4" fill="rgba(0,0,0,.25)" />
        {/* Body */}
        <g transform={`translate(0,${bodyY})`}>
          {/* Main body */}
          <ellipse cx="60" cy="72" rx="28" ry="18" fill="#f59e0b" />
          {/* Belly */}
          <ellipse cx="62" cy="76" rx="18" ry="12" fill="#fcd34d" />
          {/* Wing */}
          <g transform={`rotate(${wingA},60,70)`}>
            <ellipse cx="38" cy="70" rx="12" ry="6" fill="#d97706" transform="rotate(-15,38,70)" />
          </g>
          {/* Neck */}
          <rect x="54" y="50" width="14" height="18" rx="7" fill="#f59e0b" />
          {/* Head */}
          <circle cx="61" cy="44" r="16" fill="#10b981" />
          {/* Eye */}
          <circle cx="67" cy="40" r="4" fill="#fff" />
          <circle cx="68.5" cy="39.5" r="2.5" fill="#1a1a2e" />
          <circle cx="69.5" cy="38.5" r="1" fill="#fff" />
          {/* Beak */}
          <path d="M73 44 L84 42 L83 47 L73 46 Z" fill="#f97316" />
          {/* Graduation cap */}
          <rect x="49" y="28" width="24" height="5" rx="2" fill="#1e1b4b" />
          <rect x="55" y="24" width="12" height="5" rx="1" fill="#1e1b4b" />
          <line x1="73" y1="28" x2="78" y2="36" stroke="#7c3aed" strokeWidth="2" />
          <circle cx="78" cy="36" r="2.5" fill="#7c3aed" />
          {/* Left leg */}
          <rect x={52 + legL} y="86" width="5" height="10" rx="2" fill="#d97706" />
          <path d={`M${49 + legL} 96 L${57 + legL} 96 L${56 + legL} 99 L${50 + legL} 99 Z`} fill="#d97706" />
          {/* Right leg */}
          <rect x={63 - legL} y="86" width="5" height="10" rx="2" fill="#d97706" />
          <path d={`M${60 - legL} 96 L${68 - legL} 96 L${67 - legL} 99 L${61 - legL} 99 Z`} fill="#d97706" />
        </g>
        {/* Sparkles */}
        <circle cx="20" cy="30" r="2" fill="#4f8ef7" opacity={frame % 2 === 0 ? 1 : .3} />
        <circle cx="95" cy="25" r="2.5" fill="#7c3aed" opacity={frame % 2 === 1 ? 1 : .3} />
        <circle cx="15" cy="55" r="1.5" fill="#10b981" opacity={frame % 2 === 0 ? .8 : .2} />
        <circle cx="105" cy="50" r="2" fill="#f59e0b" opacity={frame % 2 === 1 ? .8 : .2} />
      </svg>
      {/* Progress text */}
      <div style={{ textAlign: "center" }}>
        <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 18, marginBottom: 8, color: "#f0f2f8" }}>{msgs[mi]}</div>
        <div style={{ fontSize: 12, color: "#6b7a99", fontFamily: "'JetBrains Mono',monospace" }}>AI is crafting your personalised questions…</div>
      </div>
      {/* Animated bar */}
      <div style={{ width: 280, height: 5, borderRadius: 99, background: "rgba(255,255,255,.07)", overflow: "hidden" }}>
        <div style={{ height: "100%", borderRadius: 99, background: "linear-gradient(90deg,#4f8ef7,#7c3aed,#10b981)", backgroundSize: "200% 100%", animation: "progressFill 1.5s ease-in-out infinite alternate", width: "65%" }} />
      </div>
      {/* Step indicators */}
      <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
        {["Analysing topic", "Building questions", "Calibrating difficulty", "Finalising quiz"].map((s, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, opacity: mi >= i ? 1 : .3, transition: "opacity .4s" }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: mi > i ? "#10b981" : mi === i ? "#4f8ef7" : "rgba(255,255,255,.15)", boxShadow: mi === i ? "0 0 10px #4f8ef7" : "none", transition: "all .4s" }} />
            <span style={{ fontSize: 9, color: mi >= i ? "#9aa5bc" : "#3a4055", fontFamily: "'JetBrains Mono',monospace", textAlign: "center", maxWidth: 60, lineHeight: 1.3 }}>{s}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── 5 Sample MCQ questions shown ONLY as demo when backend is offline ── */
const DEMO_MCQ = [
  {
    id: "d1",
    question: "Which React hook is used to manage side effects like API calls?",
    options: ["useState", "useRef", "useEffect", "useContext"],
    answer: "useEffect",
    explanation: "useEffect runs after render and is the go-to hook for side effects such as data fetching, subscriptions, or manually changing the DOM."
  },
  {
    id: "d2",
    question: "What does the CSS property 'display: flex' primarily control?",
    options: ["Font sizing", "Layout of child elements", "Background colors", "Animation timing"],
    answer: "Layout of child elements",
    explanation: "display:flex activates the Flexbox layout model, making child elements arrange themselves along a main axis."
  },
  {
    id: "d3",
    question: "Which HTTP method is used to CREATE a new resource in a REST API?",
    options: ["GET", "PUT", "DELETE", "POST"],
    answer: "POST",
    explanation: "POST is used to submit data to create a new resource. GET retrieves, PUT updates, DELETE removes."
  },
  {
    id: "d4",
    question: "In Python, which data structure stores key-value pairs?",
    options: ["list", "tuple", "dict", "set"],
    answer: "dict",
    explanation: "A Python dict (dictionary) stores mappings of keys to values, e.g. {'name': 'Alice', 'age': 30}."
  },
  {
    id: "d5",
    question: "What does SQL's GROUP BY clause do?",
    options: ["Filters rows before grouping", "Sorts the result set", "Aggregates rows with same column values", "Joins two tables"],
    answer: "Aggregates rows with same column values",
    explanation: "GROUP BY collapses rows that share the same value in a column, enabling aggregate functions like COUNT, SUM, AVG on each group."
  },
];

/* ══════════════════════════════════════════════════════════
   AI CHAT MODULE
   Backend hooks:
     POST /api/chat/text   { message, history, userId }
       → { reply: string }
     POST /api/chat/image  FormData: file, message, userId
       → { reply: string }
     POST /api/chat/pdf    FormData: file, message, userId
       → { reply: string }
     GET  /api/chat/history?userId=...
       → { sessions:[{id,title,date,messages:[]}] }
══════════════════════════════════════════════════════════ */
function ChatModule({ user, onNewChat }) {
  const [tab, setTab] = useState("text");             // text | image | pdf
  const [messages, setMessages] = useState([]);        // current session msgs
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [imgFile, setImgFile] = useState(null);
  const [imgPreview, setImgPreview] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfName, setPdfName] = useState("");
  const [history, setHistory] = useState([]);          // past sessions from backend
  const [showHistory, setShowHistory] = useState(false);
  const [sessionId] = useState(() => "s" + Date.now());
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const imgInputRef = useRef(null);
  const pdfInputRef = useRef(null);

  /* Auto-scroll to latest message */
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  /* Load history from backend on mount */
  useEffect(() => {
    /* BACKEND HOOK: GET /api/chat/history?userId=... */
    fetch(`http://localhost:5001/history`)
      .then(r => r.json()).then(d => setHistory(Array.isArray(d) ? d : (d.sessions || []))).catch(() => { });
  }, []);

  const addMsg = (role, content, extra = {}) => setMessages(p => [...p, { role, content, ts: new Date(), ...extra }]);

  /* ── Send text message ── */
  const sendText = async () => {
    const msg = input.trim(); if (!msg || loading) return;
    addMsg("user", msg);
    setInput(""); setLoading(true);
    try {
      const res = await fetch("http://localhost:5001/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg }),
      });
      if (!res.ok) throw new Error(res.status);
      const data = await res.json();
      if (data.reply) {
        addMsg("ai", data.reply);
      } else if (Array.isArray(data.history)) {
        const mapped = data.history.map(h => ({ role: h.role === "model" ? "ai" : h.role, content: h.text || h.content || "", ts: new Date() }));
        setMessages(mapped);
      }
    } catch (e) {
      addMsg("ai", `Failed to reach backend.\n\nMake sure: node routes/chatbot.js is running on port 5001.\n\nError: ${e.message}`, { isError: true });
    } finally { setLoading(false); }
  };

  /* ── Send image ── */
  const sendImage = async () => {
    if (!imgFile || loading) return;
    const msg = input.trim() || "Explain this image";
    addMsg("user", msg, { image: imgPreview });
    setInput(""); setLoading(true);
    try {
      const fd = new FormData();
      fd.append("image", imgFile); fd.append("message", msg);
      const res = await fetch("http://localhost:5001/chat-image", { method: "POST", body: fd });
      if (!res.ok) throw new Error(res.status);
      const data = await res.json();
      addMsg("ai", data.reply || data.response || "Done.");
    } catch (e) {
      addMsg("ai", `Image chat failed.\n\nMake sure node routes/chatbot.js is running on port 5001.\n\nError: ${e.message}`, { isError: true });
    } finally { setLoading(false); setImgFile(null); setImgPreview(null); }
  };

  /* ── Send PDF ── */
  const sendPdf = async () => {
    if (!pdfFile || loading) return;
    const msg = input.trim() || "Summarise this PDF";
    addMsg("user", msg, { pdf: pdfName });
    setInput(""); setLoading(true);
    try {
      const fd = new FormData();
      fd.append("file", pdfFile); fd.append("message", msg);
      const res = await fetch("http://localhost:5001/chat-file", { method: "POST", body: fd });
      if (!res.ok) throw new Error(res.status);
      const data = await res.json();
      addMsg("ai", data.reply || data.response || "Done.");
    } catch (e) {
      addMsg("ai", `PDF chat failed.\n\nMake sure node routes/chatbot.js is running on port 5001.\n\nError: ${e.message}`, { isError: true });
    } finally { setLoading(false); setPdfFile(null); setPdfName(""); }
  };

  const handleKey = e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); tab === "text" ? sendText() : tab === "image" ? sendImage() : sendPdf(); } };

  const onImgPick = e => {
    const f = e.target.files[0]; if (!f) return;
    setImgFile(f);
    const r = new FileReader(); r.onload = ev => setImgPreview(ev.target.result); r.readAsDataURL(f);
  };
  const onPdfPick = e => { const f = e.target.files[0]; if (!f) return; setPdfFile(f); setPdfName(f.name); };

  const TABS = [
    { id: "text", icon: "💬", label: "Text Chat" },
    { id: "image", icon: "🖼️", label: "Image Chat" },
    { id: "pdf", icon: "📄", label: "PDF Chat" },
  ];

  const isEmptyChat = messages.length === 0 && !loading;

  /* ── Typing dots animation ── */
  const TypingDots = () => (
    <div style={{ display: "flex", gap: 5, alignItems: "center", padding: "14px 18px" }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: "#4f8ef7", animation: `dotBlink 1.2s ${i * .2}s ease-in-out infinite` }} />
      ))}
    </div>
  );

  return (
    <div style={{ display: "flex", height: "calc(100vh - 120px)", gap: 0, background: "#13151d", borderRadius: 18, overflow: "hidden", border: "1px solid rgba(255,255,255,.07)" }}>

      {/* ── LEFT: Chat history sidebar ── */}
      <div style={{ width: 260, background: "#0f1117", borderRight: "1px solid rgba(255,255,255,.07)", display: "flex", flexDirection: "column", flexShrink: 0 }}>
        <div style={{ padding: "16px 14px", borderBottom: "1px solid rgba(255,255,255,.07)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: "linear-gradient(135deg,#4f8ef7,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🤖</div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 14 }}>AI Chat</div>
          </div>
          <button
            onClick={() => { if (onNewChat) onNewChat(); else { setMessages([]); setInput(""); setImgFile(null); setImgPreview(null); setPdfFile(null); setPdfName(""); setTab("text"); } }}
            style={{ width: "100%", padding: "9px", borderRadius: 10, background: "linear-gradient(135deg,#4f8ef7,#7c3aed)", border: "none", color: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            ✏️ New Chat
          </button>
        </div>
        {/* History list */}
        <div style={{ flex: 1, overflowY: "auto", padding: "10px 8px" }}>
          <div style={{ fontSize: 10, color: "#6b7a99", fontFamily: "'JetBrains Mono',monospace", letterSpacing: ".06em", padding: "4px 8px", marginBottom: 6 }}>RECENT</div>
          {history.length === 0 ? (
            <div style={{ padding: "20px 12px", textAlign: "center" }}>
              <div style={{ fontSize: 28, opacity: .2, marginBottom: 8 }}>💬</div>
              <div style={{ fontSize: 11, color: "#6b7a99", lineHeight: 1.6 }}>Past conversations appear here once backend is connected</div>
              <div style={{ fontSize: 10, color: "#4f8ef7", fontFamily: "'JetBrains Mono',monospace", marginTop: 8 }}>GET /api/chat/history</div>
            </div>
          ) : history.map((s, i) => (
            <div key={i} style={{ padding: "10px 12px", borderRadius: 10, cursor: "pointer", marginBottom: 4, transition: "background .15s" }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,.05)"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#f0f2f8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 3 }}>{s.title || "Untitled chat"}</div>
              <div style={{ fontSize: 10, color: "#6b7a99", fontFamily: "'JetBrains Mono',monospace" }}>{s.date ? new Date(s.date).toLocaleDateString() : "—"}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT: Main chat area ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 0, borderBottom: "1px solid rgba(255,255,255,.07)", background: "#13151d", flexShrink: 0 }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => { setTab(t.id); setInput(""); }}
              style={{ padding: "14px 22px", border: "none", borderBottom: `2px solid ${tab === t.id ? "#4f8ef7" : "transparent"}`, background: "transparent", color: tab === t.id ? "#4f8ef7" : "#6b7a99", cursor: "pointer", fontSize: 13, fontWeight: tab === t.id ? 700 : 500, display: "flex", alignItems: "center", gap: 7, transition: "all .2s", fontFamily: "'DM Sans',sans-serif" }}>
              <span style={{ fontSize: 16 }}>{t.icon}</span>{t.label}
            </button>
          ))}
        </div>

        {/* Messages area */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px 20px", display: "flex", flexDirection: "column", gap: 4 }}>
          {/* Empty state */}
          {isEmptyChat && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, gap: 16, textAlign: "center" }}>
              <div style={{ width: 64, height: 64, borderRadius: 20, background: "linear-gradient(135deg,#4f8ef7,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, boxShadow: "0 8px 32px rgba(79,142,247,.35)" }}>
                {tab === "text" ? "💬" : tab === "image" ? "🖼️" : "📄"}
              </div>
              <div>
                <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 20, marginBottom: 6 }}>
                  {tab === "text" ? "Ask me anything"
                    : tab === "image" ? "Upload an image to analyse"
                      : "Upload a PDF to chat with it"}
                </div>
                <div style={{ fontSize: 13, color: "#6b7a99", maxWidth: 340, lineHeight: 1.7 }}>
                  {tab === "text" ? "I can help with code, concepts, debugging, explanations and more."
                    : tab === "image" ? "Share a diagram, screenshot, or any image and I'll explain it in detail."
                      : "Drop a PDF and ask questions about its content — summaries, key points, anything."}
                </div>
              </div>
              {tab === "text" && (
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", maxWidth: 440 }}>
                  {["Explain useEffect in React", "What is Big O notation?", "How does JWT auth work?", "Summarise gradient descent"].map((q, i) => (
                    <button key={i} onClick={() => { setInput(q); inputRef.current?.focus(); }}
                      style={{ padding: "7px 14px", borderRadius: 99, border: "1px solid rgba(79,142,247,.3)", background: "rgba(79,142,247,.08)", color: "#4f8ef7", cursor: "pointer", fontSize: 12, fontWeight: 600, transition: "all .2s" }}
                      onMouseEnter={e => { e.currentTarget.style.background = "rgba(79,142,247,.18)"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "rgba(79,142,247,.08)"; }}>
                      {q}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Message bubbles */}
          {messages.map((m, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: m.role === "user" ? "flex-end" : "flex-start", marginBottom: 8 }}>
              {/* Avatar + name */}
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 5, flexDirection: m.role === "user" ? "row-reverse" : "row" }}>
                <div style={{ width: 26, height: 26, borderRadius: "50%", background: m.role === "user" ? "linear-gradient(135deg,#4f8ef7,#7c3aed)" : "linear-gradient(135deg,#10b981,#059669)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                  {m.role === "user" ? (user?.name?.[0] || "U") : "AI"}
                </div>
                <span style={{ fontSize: 11, color: "#6b7a99", fontFamily: "'JetBrains Mono',monospace" }}>
                  {m.role === "user" ? (user?.name?.split(" ")[0] || "You") : "Skillio AI"} · {m.ts?.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) || ""}
                </span>
              </div>

              {/* Bubble */}
              <div style={{
                maxWidth: "75%", padding: "12px 16px", borderRadius: m.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                animation: "cardPop .3s ease both",
                background: m.role === "user" ? "linear-gradient(135deg,#4f8ef7,#7c3aed)" : m.isError ? "rgba(244,63,94,.1)" : "#1e2130",
                border: m.isError ? "1px solid rgba(244,63,94,.3)" : m.role === "user" ? "none" : "1px solid rgba(255,255,255,.07)",
                color: m.role === "user" ? "#fff" : "#f0f2f8",
                fontSize: 14, lineHeight: 1.7, wordBreak: "break-word",
                boxShadow: m.role === "user" ? "0 4px 16px rgba(79,142,247,.25)" : "none",
              }}>
                {/* Image preview in message */}
                {m.image && <img src={m.image} alt="upload" style={{ width: "100%", maxWidth: 280, borderRadius: 10, marginBottom: 8, display: "block" }} />}
                {/* PDF pill */}
                {m.pdf && <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8, padding: "6px 10px", borderRadius: 8, background: "rgba(79,142,247,.15)", border: "1px solid rgba(79,142,247,.3)", width: "fit-content" }}>
                  <span style={{ fontSize: 14 }}>📄</span>
                  <span style={{ fontSize: 12, color: "#4f8ef7", fontWeight: 600, maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.pdf}</span>
                </div>}
                {/* Text content — preserve newlines */}
                <span style={{ whiteSpace: "pre-wrap" }}>{m.content}</span>
              </div>
            </div>
          ))}

          {/* Loading / typing indicator */}
          {loading && (
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 8 }}>
              <div style={{ width: 26, height: 26, borderRadius: "50%", background: "linear-gradient(135deg,#10b981,#059669)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff" }}>AI</div>
              <div style={{ background: "#1e2130", border: "1px solid rgba(255,255,255,.07)", borderRadius: "18px 18px 18px 4px" }}>
                <TypingDots />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* ── Input area ── */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,.07)", background: "#13151d", padding: "14px 16px", flexShrink: 0 }}>
          {/* Image preview strip */}
          {imgPreview && tab === "image" && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, padding: "8px 12px", background: "rgba(255,255,255,.04)", borderRadius: 10, border: "1px solid rgba(255,255,255,.08)" }}>
              <img src={imgPreview} alt="preview" style={{ width: 44, height: 44, objectFit: "cover", borderRadius: 7, flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, color: "#f0f2f8", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{imgFile?.name}</div>
                <div style={{ fontSize: 11, color: "#6b7a99" }}>{imgFile ? (imgFile.size / 1024).toFixed(0) + "KB" : ""}</div>
              </div>
              <button onClick={() => { setImgFile(null); setImgPreview(null); }} style={{ background: "rgba(244,63,94,.15)", border: "1px solid rgba(244,63,94,.3)", color: "#f43f5e", borderRadius: 7, padding: "3px 8px", cursor: "pointer", fontSize: 12 }}>✕</button>
            </div>
          )}
          {/* PDF strip */}
          {pdfFile && tab === "pdf" && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, padding: "8px 12px", background: "rgba(79,142,247,.06)", borderRadius: 10, border: "1px solid rgba(79,142,247,.2)" }}>
              <span style={{ fontSize: 22, flexShrink: 0 }}>📄</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, color: "#4f8ef7", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{pdfName}</div>
                <div style={{ fontSize: 11, color: "#6b7a99" }}>{pdfFile ? (pdfFile.size / 1024).toFixed(0) + "KB" : ""}</div>
              </div>
              <button onClick={() => { setPdfFile(null); setPdfName(""); }} style={{ background: "rgba(244,63,94,.15)", border: "1px solid rgba(244,63,94,.3)", color: "#f43f5e", borderRadius: 7, padding: "3px 8px", cursor: "pointer", fontSize: 12 }}>✕</button>
            </div>
          )}

          {/* Upload buttons for image/pdf tabs */}
          {tab === "image" && !imgFile && (
            <button onClick={() => imgInputRef.current.click()} style={{ width: "100%", marginBottom: 10, padding: "12px", borderRadius: 11, border: "2px dashed rgba(79,142,247,.3)", background: "rgba(79,142,247,.05)", color: "#4f8ef7", cursor: "pointer", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all .2s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(79,142,247,.6)"; e.currentTarget.style.background = "rgba(79,142,247,.1)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(79,142,247,.3)"; e.currentTarget.style.background = "rgba(79,142,247,.05)"; }}>
              🖼️ Upload Image (JPG, PNG, WebP)
            </button>
          )}
          {tab === "pdf" && !pdfFile && (
            <button onClick={() => pdfInputRef.current.click()} style={{ width: "100%", marginBottom: 10, padding: "12px", borderRadius: 11, border: "2px dashed rgba(124,58,237,.3)", background: "rgba(124,58,237,.05)", color: "#a78bfa", cursor: "pointer", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all .2s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(124,58,237,.6)"; e.currentTarget.style.background = "rgba(124,58,237,.1)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(124,58,237,.3)"; e.currentTarget.style.background = "rgba(124,58,237,.05)"; }}>
              📄 Upload PDF
            </button>
          )}

          {/* Hidden file inputs */}
          <input ref={imgInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={onImgPick} />
          <input ref={pdfInputRef} type="file" accept=".pdf" style={{ display: "none" }} onChange={onPdfPick} />

          {/* Text input row */}
          <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
            <div style={{ flex: 1, background: "#1e2130", border: "1.5px solid rgba(79,142,247,.25)", borderRadius: 14, display: "flex", alignItems: "flex-end", gap: 0, overflow: "hidden", transition: "border-color .2s" }}
              onFocusCapture={e => e.currentTarget.style.borderColor = "rgba(79,142,247,.6)"}
              onBlurCapture={e => e.currentTarget.style.borderColor = "rgba(79,142,247,.25)"}>
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder={tab === "text" ? "Ask anything… (Enter to send, Shift+Enter for newline)"
                  : tab === "image" ? "Describe what you want to know about the image…"
                    : "Ask a question about the PDF…"}
                rows={1}
                style={{ flex: 1, background: "none", border: "none", outline: "none", color: "#f0f2f8", fontSize: 14, fontFamily: "'DM Sans',sans-serif", padding: "13px 14px", resize: "none", lineHeight: 1.6, maxHeight: 140, overflowY: "auto" }}
                onInput={e => { e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 140) + "px"; }}
              />
            </div>
            {/* Send button */}
            <button
              onClick={tab === "text" ? sendText : tab === "image" ? sendImage : sendPdf}
              disabled={loading || (tab === "text" ? !input.trim() : tab === "image" ? !imgFile : !pdfFile)}
              style={{ width: 46, height: 46, borderRadius: 13, background: (loading || (tab === "text" ? !input.trim() : tab === "image" ? !imgFile : !pdfFile)) ? "rgba(255,255,255,.08)" : "linear-gradient(135deg,#4f8ef7,#7c3aed)", border: "none", cursor: (loading || (tab === "text" ? !input.trim() : tab === "image" ? !imgFile : !pdfFile)) ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all .2s", boxShadow: (loading || (tab === "text" ? !input.trim() : tab === "image" ? !imgFile : !pdfFile)) ? "none" : "0 4px 16px rgba(79,142,247,.35)" }}>
              {loading
                ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ animation: "spin .8s linear infinite" }}><circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,.3)" strokeWidth="3" /><path d="M12 2a10 10 0 0 1 10 10" stroke="#fff" strokeWidth="3" strokeLinecap="round" /></svg>
                : <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M22 2L15 22 11 13 2 9l20-7z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              }
            </button>
          </div>
          <div style={{ fontSize: 10, color: "#56637a", textAlign: "center", marginTop: 8, fontFamily: "'JetBrains Mono',monospace" }}>
            Powered by Skillio AI · {tab === "text" ? "Text" : tab === "image" ? "Vision" : "PDF"} mode ·
          </div>
        </div>
      </div>
    </div>
  );
}

function QuizPage({ user }) {
  /* ── state ── */
  const [topic, setTopic] = useState("");
  const [inputTopic, setInputTopic] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [quizState, setQuizState] = useState("idle"); // idle|loading|quiz|result|history
  const [questions, setQuestions] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [answers, setAnswers] = useState({});
  const [current, setCurrent] = useState(0);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [perf, setPerf] = useState(null); // { weakTopics, strengths, avgScore }
  const [suggestedTopics, setSuggestedTopics] = useState([]);
  const [nextTopic, setNextTopic] = useState("");
  const [timeLeft, setTimeLeft] = useState(30);
  const [submitting, setSubmitting] = useState(false);
  const timerRef = useRef(null);
  const searchRef = useRef(null);

  /* ── Suggested topics (from backend, fallback UI placeholders) ── */
  /* BACKEND HOOK: GET /api/quiz/suggested-topics?userId=... */
  const FALLBACK_SUGGESTIONS = [
    { name: "React Hooks", icon: "⚛️", reason: "Based on current course", difficulty: "medium", color: "#4f8ef7" },
    { name: "Python ML", icon: "🐍", reason: "Weak area detected", difficulty: "hard", color: "#7c3aed" },
    { name: "Docker Basics", icon: "🐳", reason: "Next in roadmap", difficulty: "easy", color: "#06b6d4" },
    { name: "SQL Queries", icon: "🗄️", reason: "Frequently tested", difficulty: "medium", color: "#10b981" },
    { name: "CSS Flexbox", icon: "🎨", reason: "Quick win topic", difficulty: "easy", color: "#f59e0b" },
    { name: "REST APIs", icon: "🔗", reason: "Core skill gap", difficulty: "medium", color: "#f43f5e" },
  ];

  /* ── timer per question ── */
  useEffect(() => {
    if (quizState !== "quiz" || questions.length === 0) return;
    setTimeLeft(30);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); autoNext(); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [current, quizState, questions.length]);

  const autoNext = () => {
    if (current < questions.length - 1) setCurrent(c => c + 1);
  };

  /* ── generate quiz ── */
  const generateQuiz = async (topicOverride) => {
    const t = topicOverride || inputTopic.trim();
    if (!t) return;
    setTopic(t); setInputTopic(t);
    setQuizState("loading"); setAnswers({}); setCurrent(0); setResult(null);
    try {
      /* BACKEND HOOK: POST http://localhost:5006/generate-quiz */
      const res = await fetch("http://localhost:5006/generate-quiz", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: t, difficulty }),
      });
      if (!res.ok) throw new Error("backend");
      const data = await res.json();
      let quizQuestions = data.quiz || data.questions || [];
      if (!quizQuestions || quizQuestions.length === 0) throw new Error("No questions returned");
      quizQuestions = quizQuestions.map((q, i) => ({ id: q.id || `q${i}`, ...q }));
      setQuestions(quizQuestions); setSessionId(data.sessionId || Date.now().toString());
      setSuggestedTopics(data.suggestedNext || FALLBACK_SUGGESTIONS);
      setNextTopic(data.nextTopic || FALLBACK_SUGGESTIONS[0].name);
      setQuizState("quiz");
    } catch (err) {
      console.error(err);
      // No backend yet — go back to idle and show connection message
      setQuizState("error_gen");
    }
  };

  /* ── submit ── */
  const submitQuiz = async () => {
    setSubmitting(true); clearInterval(timerRef.current);
    const answersArray = questions.map(q => answers[q.id]);
    try {
      /* BACKEND HOOK: POST http://localhost:5006/submit-quiz */
      const res = await fetch("http://localhost:5006/submit-quiz", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: answersArray, quiz: questions, topic: topic, difficulty: difficulty }),
      });
      if (!res.ok) throw new Error("backend");
      const data = await res.json();
      setResult({ score: data.score, total: questions.length, breakdown: questions.map(q => ({ id: q.id, correct: answers[q.id] === q.answer, selected: answers[q.id] || "Not answered", answer: q.answer, explanation: q.explanation })) });
      setNextTopic(data.nextTopic); setPerf(data.performance || null);
    } catch {
      const score = questions.filter(q => answers[q.id] === q.answer).length;
      setResult({ score, total: questions.length, breakdown: questions.map(q => ({ id: q.id, correct: answers[q.id] === q.answer, selected: answers[q.id] || "Not answered", answer: q.answer, explanation: q.explanation })), nextTopic: nextTopic, performance: { avgScore: Math.round(score / questions.length * 100), weakTopics: ["Connect backend for real analytics"], strengths: ["UI working correctly"] } });
    }
    setQuizState("result"); setSubmitting(false);
  };

  const q = questions[current];
  const allAnswered = questions.length > 0 && questions.every(q => answers[q.id]);
  const timePct = (timeLeft / 30) * 100;
  const timerColor = timeLeft > 15 ? "#10b981" : timeLeft > 7 ? "#f59e0b" : "#f43f5e";
  const pct = result ? Math.round((result.score / result.total) * 100) : 0;
  const grade = pct >= 80 ? { label: "Excellent!", color: "#10b981", icon: "🏆", sub: "Outstanding performance" } : pct >= 60 ? { label: "Good Job!", color: "#4f8ef7", icon: "⚡", sub: "Above average" } : pct >= 40 ? { label: "Keep Going!", color: "#f59e0b", icon: "📚", sub: "Room to improve" } : { label: "Needs Review", color: "#f43f5e", icon: "⚠️", sub: "Focus on the basics" };

  /* ─────── IDLE / HOME ─────── */
  if (quizState === "idle") return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Duck mascot hero */}
      <div style={{ background: "linear-gradient(135deg,rgba(79,142,247,.15),rgba(124,58,237,.1))", border: "1px solid rgba(79,142,247,.25)", borderRadius: 20, padding: "32px 36px", position: "relative", overflow: "hidden" }}>
        {/* Floating duck mascot top-right */}
        <div style={{ position: "absolute", top: 16, right: 20, zIndex: 2, animation: "duckBob 2.5s ease-in-out infinite" }}>
          <svg width="72" height="64" viewBox="0 0 120 100" style={{ filter: "drop-shadow(0 6px 16px rgba(245,158,11,.4))" }}>
            <ellipse cx="60" cy="90" rx="38" ry="6" fill="rgba(79,142,247,.2)" />
            <ellipse cx="60" cy="78" rx="26" ry="17" fill="#f59e0b" />
            <ellipse cx="62" cy="82" rx="17" ry="11" fill="#fcd34d" />
            <ellipse cx="40" cy="76" rx="11" ry="5" fill="#d97706" transform="rotate(-15,40,76)" />
            <rect x="55" y="56" width="13" height="17" rx="6" fill="#f59e0b" />
            <circle cx="61" cy="48" r="15" fill="#10b981" />
            <circle cx="67" cy="44" r="4" fill="#fff" />
            <circle cx="68.5" cy="43" r="2.5" fill="#1a1a2e" />
            <circle cx="69.5" cy="42" r="1" fill="#fff" />
            <path d="M72 46 L82 44 L81 49 L72 48 Z" fill="#f97316" />
            <rect x="50" y="33" width="22" height="5" rx="2" fill="#1e1b4b" />
            <rect x="56" y="29" width="10" height="5" rx="1" fill="#1e1b4b" />
            <line x1="68" y1="33" x2="73" y2="40" stroke="#7c3aed" strokeWidth="2" />
            <circle cx="73" cy="40" r="2.5" fill="#7c3aed" />
            <rect x="52" y="88" width="4" height="8" rx="2" fill="#d97706" />
            <rect x="62" y="88" width="4" height="8" rx="2" fill="#d97706" />
            <text x="25" y="20" fontSize="12" fill="#f59e0b" style={{ animation: "fadeUp 1s ease infinite alternate" }}>✨</text>
            <text x="88" y="30" fontSize="10" fill="#7c3aed" style={{ animation: "fadeUp 1.4s ease infinite alternate" }}>⭐</text>
          </svg>
          <div style={{ textAlign: "center", fontSize: 10, color: "rgba(245,158,11,.8)", fontWeight: 700, fontFamily: "'JetBrains Mono',monospace", marginTop: -4 }}>Quiz Duck 🦆</div>
        </div>
        {/* bg blobs */}
        <div style={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, borderRadius: "50%", background: "rgba(124,58,237,.12)", filter: "blur(60px)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -30, left: 20, width: 160, height: 160, borderRadius: "50%", background: "rgba(79,142,247,.1)", filter: "blur(50px)", pointerEvents: "none" }} />

        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: "linear-gradient(135deg,#4f8ef7,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🧠</div>
            <div>
              <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 900, fontSize: 22, color: "#f0f2f8", letterSpacing: "-.02em" }}>AI Quiz Generator</div>
              
            </div>
          </div>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,.55)", marginBottom: 24, lineHeight: 1.7, maxWidth: 520 }}>Enter any topic, pick a difficulty, and the AI generates personalised questions. Your performance shapes the next suggested quiz.</p>

          {/* Search box */}
          <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
            <div
              style={{ flex: 1, minWidth: 240, display: "flex", alignItems: "center", gap: 10, background: "rgba(0,0,0,.35)", border: "1.5px solid rgba(79,142,247,.35)", borderRadius: 14, padding: "12px 18px", backdropFilter: "blur(8px)", transition: "border-color .2s" }}
              onFocusCapture={e => e.currentTarget.style.borderColor = "rgba(79,142,247,.7)"}
              onBlurCapture={e => e.currentTarget.style.borderColor = "rgba(79,142,247,.35)"}>
              <span style={{ fontSize: 18, flexShrink: 0 }}>🔍</span>
              <input
                ref={searchRef}
                value={inputTopic}
                onChange={e => setInputTopic(e.target.value)}
                onKeyDown={e => e.key === "Enter" && generateQuiz()}
                placeholder="e.g. React Hooks, Python ML, SQL Joins…"
                style={{ flex: 1, background: "none", border: "none", outline: "none", color: "#f0f2f8", fontSize: 15, fontFamily: "'DM Sans',sans-serif" }}
              />
              {inputTopic && <button onClick={() => setInputTopic("")} style={{ background: "none", border: "none", color: "#6b7a99", cursor: "pointer", fontSize: 16, flexShrink: 0 }}>✕</button>}
            </div>
            <button
              onClick={() => generateQuiz()}
              disabled={!inputTopic.trim() || quizState === "loading"}
              style={{ padding: "12px 28px", borderRadius: 14, background: inputTopic.trim() ? "linear-gradient(135deg,#4f8ef7,#7c3aed)" : "rgba(255,255,255,.08)", color: inputTopic.trim() ? "#fff" : "#6b7a99", border: "none", cursor: inputTopic.trim() ? "pointer" : "default", fontSize: 14, fontWeight: 800, flexShrink: 0, transition: "all .2s", boxShadow: inputTopic.trim() ? "0 4px 24px rgba(79,142,247,.4)" : "none", fontFamily: "'Syne',sans-serif", letterSpacing: "-.01em" }}>
              {quizState === "loading" ? "Generating..." : "Generate Quiz 🚀"}
            </button>
          </div>

          {/* Difficulty selector */}
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,.4)", fontFamily: "'JetBrains Mono',monospace", letterSpacing: ".06em", marginRight: 4 }}>DIFFICULTY:</span>
            {[{ v: "easy", label: "😌 Easy", color: "#10b981" }, { v: "medium", label: "😐 Medium", color: "#f59e0b" }, { v: "hard", label: "😈 Hard", color: "#f43f5e" }].map(d => (
              <button key={d.v} onClick={() => setDifficulty(d.v)}
                style={{ padding: "6px 16px", borderRadius: 99, border: `1.5px solid ${difficulty === d.v ? d.color : "rgba(255,255,255,.1)"}`, background: difficulty === d.v ? `${d.color}22` : "transparent", color: difficulty === d.v ? d.color : "#9aa5bc", fontSize: 12, fontWeight: 700, cursor: "pointer", transition: "all .2s", fontFamily: "'JetBrains Mono',monospace" }}>
                {d.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
        {[
          { icon: "🎯", label: "Quizzes Taken", value: "—", sub: "Backend pending", color: "#4f8ef7" },
          { icon: "📊", label: "Avg Score", value: "—", sub: "Backend pending", color: "#10b981" },
          { icon: "🔥", label: "Best Streak", value: "—", sub: "Backend pending", color: "#f59e0b" },
          { icon: "⚠️", label: "Weak Topics", value: "—", sub: "Backend pending", color: "#f43f5e" },
        ].map((s, i) => (
          <div key={i} style={{ background: "#16181f", border: `1px solid ${s.color}22`, borderRadius: 14, padding: "16px 18px", animation: `cardPop .4s ${i * .08}s ease both`, transition: "transform .2s,box-shadow .2s" }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = `0 8px 28px ${s.color}22`; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <div style={{ width: 32, height: 32, borderRadius: 9, background: `${s.color}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>{s.icon}</div>
              <span style={{ fontSize: 10, color: "#6b7a99", fontFamily: "'JetBrains Mono',monospace", textTransform: "uppercase", letterSpacing: ".05em" }}>{s.label}</span>
            </div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 26, color: s.color, marginBottom: 2 }}>{s.value}</div>
            <div style={{ fontSize: 10, color: "#6b7a99" }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Suggested topics */}
      <div style={{ background: "#16181f", border: "1px solid rgba(255,255,255,.07)", borderRadius: 16, padding: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 15, marginBottom: 2 }}>💡 Suggested Quiz Topics</div>
            <div style={{ fontSize: 11, color: "#6b7a99" }}>Based on your courses & performance · Click to start instantly</div>
          </div>
          <div style={{ fontSize: 10, color: "#4f8ef7", fontFamily: "'JetBrains Mono',monospace", background: "rgba(79,142,247,.1)", padding: "4px 10px", borderRadius: 99, border: "1px solid rgba(79,142,247,.2)" }}>AI-curated</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
          {FALLBACK_SUGGESTIONS.map((t, i) => (
            <div key={i} onClick={() => { setInputTopic(t.name); generateQuiz(t.name); }}
              style={{ background: `${t.color}0d`, border: `1px solid ${t.color}28`, borderRadius: 13, padding: "14px 16px", cursor: "pointer", transition: "all .25s", position: "relative", overflow: "hidden", animation: `cardPop .5s ${i * .07}s ease both` }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = t.color; e.currentTarget.style.background = `${t.color}1a`; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = `${t.color}28`; e.currentTarget.style.background = `${t.color}0d`; e.currentTarget.style.transform = "translateY(0)"; }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <span style={{ fontSize: 22 }}>{t.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 14, color: "#f0f2f8", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.name}</div>
                  <div style={{ fontSize: 10, color: t.color, fontFamily: "'JetBrains Mono',monospace" }}>{t.difficulty}</div>
                </div>
              </div>
              <div style={{ fontSize: 11, color: "#6b7a99", lineHeight: 1.5 }}>{t.reason}</div>
              <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: t.color, fontWeight: 700 }}>
                <span>Start →</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Performance placeholder */}
      <div style={{ background: "#16181f", border: "1px solid rgba(255,255,255,.07)", borderRadius: 16, padding: "20px" }}>
        <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 15, marginBottom: 16 }}>📈 My Performance</div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 120, flexDirection: "column", gap: 10 }}>
          <div style={{ fontSize: 40, opacity: .2 }}>📊</div>
          <div style={{ fontSize: 13, color: "#6b7a99", textAlign: "center", maxWidth: 300, lineHeight: 1.7 }}>Complete quizzes to populate your performance dashboard. Connect <code style={{ background: "rgba(79,142,247,.1)", padding: "1px 6px", borderRadius: 4, color: "#4f8ef7", fontSize: 11 }}>GET /api/quiz/history</code> for real data.</div>
        </div>
      </div>
    </div>
  );

  /* ─────── LOADING ─────── */
  if (quizState === "loading") return (
    <div style={{ background: "#16181f", border: "1px solid rgba(255,255,255,.07)", borderRadius: 20, padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, paddingBottom: 16, borderBottom: "1px solid rgba(255,255,255,.06)" }}>
        <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 15 }}>🧠 Generating Quiz</div>
        <div style={{ fontSize: 11, color: "#6b7a99", fontFamily: "'JetBrains Mono',monospace" }}>Topic: <span style={{ color: "#4f8ef7" }}>{inputTopic}</span> · <span style={{ color: { easy: "#10b981", medium: "#f59e0b", hard: "#f43f5e" }[difficulty] }}>{difficulty}</span></div>
      </div>
      <DuckLoader />
    </div>
  );

  /* ─────── BACKEND NOT CONNECTED (generate failed) ─────── */
  if (quizState === "error_gen") return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ background: "rgba(244,63,94,.06)", border: "1px solid rgba(244,63,94,.22)", borderRadius: 18, padding: "36px", display: "flex", flexDirection: "column", alignItems: "center", gap: 18, textAlign: "center" }}>
        <div style={{ fontSize: 52 }}>🔌</div>
        <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 20, color: "#f0f2f8" }}>Backend not connected yet</div>
        <div style={{ fontSize: 13, color: "#9aa5bc", maxWidth: 400, lineHeight: 1.8 }}>
          The quiz engine is ready and waiting. Once you link your backend at{" "}
          <code style={{ background: "rgba(79,142,247,.12)", padding: "2px 8px", borderRadius: 6, color: "#4f8ef7", fontSize: 12 }}>POST /api/quiz/topic-generate</code>{" "}
          questions will appear here automatically.
        </div>
        <div style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 12, padding: "16px 20px", textAlign: "left", maxWidth: 400, width: "100%" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7a99", fontFamily: "'JetBrains Mono',monospace", letterSpacing: ".06em", marginBottom: 10 }}>EXPECTED RESPONSE SHAPE</div>
          <pre style={{ fontSize: 11, color: "#a78bfa", fontFamily: "'JetBrains Mono',monospace", margin: 0, lineHeight: 1.8, overflow: "auto" }}>{`{
  "sessionId": "abc123",
  "questions": [
    {
      "id": "q1",
      "question": "...",
      "options": ["A","B","C","D"],
      "answer": "A",
      "explanation": "..."
    }
  ],
  "nextTopic": "..."
}`}</pre>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
          <button onClick={() => setQuizState("idle")} style={{ padding: "10px 22px", borderRadius: 11, background: "linear-gradient(135deg,#4f8ef7,#7c3aed)", color: "#fff", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 700 }}>← Back to Quiz Home</button>
          <button onClick={() => generateQuiz(topic)} style={{ padding: "10px 22px", borderRadius: 11, background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)", color: "#9aa5bc", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>🔄 Retry</button>
          <button onClick={() => { setQuestions(DEMO_MCQ); setSessionId("demo-" + Date.now()); setQuizState("quiz"); }} style={{ padding: "10px 22px", borderRadius: 11, background: "rgba(245,158,11,.12)", border: "1px solid rgba(245,158,11,.35)", color: "#f59e0b", cursor: "pointer", fontSize: 13, fontWeight: 700 }}>▶ Try 5 Demo Questions</button>
        </div>
      </div>
    </div>
  );

  /* ─────── QUIZ ─────── */
  if (quizState === "quiz" && q) return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Header */}
      <div style={{ background: "#16181f", border: "1px solid rgba(255,255,255,.07)", borderRadius: 16, padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => { clearInterval(timerRef.current); setQuizState("idle"); }} style={{ padding: "6px 14px", borderRadius: 9, background: "rgba(255,255,255,.06)", border: "none", color: "#9aa5bc", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>← Exit</button>
          {/* Mini walking duck */}
          <div style={{ animation: "duckWalk .7s ease-in-out infinite", fontSize: 22, lineHeight: 1 }}>🦆</div>
          <div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 15 }}>🧠 {topic}</div>
            <div style={{ fontSize: 10, color: "#6b7a99", fontFamily: "'JetBrains Mono',monospace" }}>Question {current + 1}/{questions.length} · {Object.keys(answers).length} answered · {difficulty}</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Timer ring */}
          <div style={{ position: "relative", width: 44, height: 44 }}>
            <svg width="44" height="44" viewBox="0 0 44 44">
              <circle cx="22" cy="22" r="18" fill="none" stroke="rgba(255,255,255,.07)" strokeWidth="3.5" />
              <circle cx="22" cy="22" r="18" fill="none" stroke={timerColor} strokeWidth="3.5"
                strokeDasharray={`${timePct / 100 * 113.1} 113.1`} strokeLinecap="round"
                transform="rotate(-90 22 22)" style={{ transition: "stroke-dasharray .5s,stroke .3s" }} />
            </svg>
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 900, fontFamily: "'JetBrains Mono',monospace", color: timerColor }}>{timeLeft}</div>
          </div>
          <div style={{ fontSize: 11, color: { easy: "#10b981", medium: "#f59e0b", hard: "#f43f5e" }[difficulty], fontWeight: 700, background: `${{ easy: "rgba(16,185,129,.15)", medium: "rgba(245,158,11,.15)", hard: "rgba(244,63,94,.15)" }[difficulty]}`, padding: "4px 10px", borderRadius: 99, fontFamily: "'JetBrains Mono',monospace" }}>{difficulty}</div>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 4, borderRadius: 99, background: "rgba(255,255,255,.06)", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${(current + 1) / questions.length * 100}%`, background: "linear-gradient(90deg,#4f8ef7,#7c3aed)", borderRadius: 99, transition: "width .4s ease" }} />
      </div>

      {/* Question card */}
      <div style={{ background: "#16181f", border: "1px solid rgba(255,255,255,.07)", borderRadius: 18, padding: "28px 28px 20px" }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: "#4f8ef7", fontFamily: "'JetBrains Mono',monospace", letterSpacing: ".08em", marginBottom: 14 }}>QUESTION {current + 1} OF {questions.length}</div>
        <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 19, lineHeight: 1.5, color: "#f0f2f8", marginBottom: 24 }}>{q.question}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {(Array.isArray(q.options) ? q.options : Object.values(q.options || {})).map((opt, oi) => {
            const letter = ["A", "B", "C", "D"][oi];
            const sel = answers[q.id] === letter;
            return (
              <div key={oi} onClick={() => setAnswers(p => ({ ...p, [q.id]: letter }))}
                style={{ display: "flex", gap: 14, alignItems: "center", padding: "14px 18px", borderRadius: 13, cursor: "pointer", background: sel ? "rgba(79,142,247,.14)" : "rgba(255,255,255,.03)", border: `1.5px solid ${sel ? "#4f8ef7" : "rgba(255,255,255,.07)"}`, transition: "all .18s" }}
                onMouseEnter={e => { if (!sel) { e.currentTarget.style.background = "rgba(255,255,255,.06)"; e.currentTarget.style.borderColor = "rgba(255,255,255,.18)"; } }}
                onMouseLeave={e => { if (!sel) { e.currentTarget.style.background = "rgba(255,255,255,.03)"; e.currentTarget.style.borderColor = "rgba(255,255,255,.07)"; } }}
              >
                <div style={{ width: 32, height: 32, borderRadius: 9, flexShrink: 0, background: sel ? "#4f8ef7" : "rgba(255,255,255,.07)", border: `1.5px solid ${sel ? "#4f8ef7" : "rgba(255,255,255,.12)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: sel ? "#fff" : "#6b7a99", fontFamily: "'JetBrains Mono',monospace", transition: "all .18s" }}>
                  {letter}
                </div>
                <span style={{ fontSize: 14, fontWeight: sel ? 600 : 400, color: sel ? "#f0f2f8" : "#c0c9d9", flex: 1, lineHeight: 1.4 }}>{opt}</span>
                {sel && <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#4f8ef7", flexShrink: 0 }} />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Nav */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button onClick={() => current > 0 && setCurrent(c => c - 1)} disabled={current === 0}
          style={{ padding: "10px 20px", borderRadius: 11, background: current === 0 ? "transparent" : "rgba(255,255,255,.07)", border: "1px solid rgba(255,255,255,.08)", color: current === 0 ? "#3a4055" : "#9aa5bc", cursor: current === 0 ? "default" : "pointer", fontSize: 13, fontWeight: 700 }}>
          ← Prev
        </button>
        {/* Dot nav */}
        <div style={{ display: "flex", gap: 6 }}>
          {questions.map((_, i) => (
            <div key={i} onClick={() => setCurrent(i)} style={{ width: 9, height: 9, borderRadius: "50%", cursor: "pointer", transition: "all .2s", transform: i === current ? "scale(1.5)" : "scale(1)", background: i === current ? "#4f8ef7" : answers[questions[i]?.id] ? "rgba(79,142,247,.45)" : "rgba(255,255,255,.12)" }} />
          ))}
        </div>
        {current < questions.length - 1 ? (
          <button onClick={() => setCurrent(c => c + 1)} style={{ padding: "10px 20px", borderRadius: 11, background: "rgba(79,142,247,.18)", border: "1px solid rgba(79,142,247,.35)", color: "#4f8ef7", cursor: "pointer", fontSize: 13, fontWeight: 700 }}>Next →</button>
        ) : (
          <button onClick={submitQuiz} disabled={submitting || !allAnswered}
            style={{ padding: "10px 24px", borderRadius: 11, background: allAnswered ? "linear-gradient(135deg,#4f8ef7,#7c3aed)" : "rgba(255,255,255,.06)", border: "none", color: allAnswered ? "#fff" : "#6b7a99", cursor: allAnswered ? "pointer" : "default", fontSize: 13, fontWeight: 800, display: "flex", alignItems: "center", gap: 8 }}>
            {submitting ? <><span style={{ animation: "spin .7s linear infinite", display: "inline-block" }}>⟳</span> Submitting…</> : "Submit Quiz ✓"}
          </button>
        )}
      </div>
    </div>
  );

  /* ─────── RESULT ─────── */
  if (quizState === "result" && result) return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Score hero */}
      <div style={{ background: `linear-gradient(135deg,${grade.color}14,rgba(124,58,237,.1))`, border: `1px solid ${grade.color}30`, borderRadius: 20, padding: "32px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -30, right: -30, width: 160, height: 160, borderRadius: "50%", background: `${grade.color}0a`, filter: "blur(40px)" }} />
        {/* Celebrating duck - size based on score */}
        <div style={{ display: "inline-block", marginBottom: 12, animation: pct >= 80 ? "heartBeat 1.2s ease infinite" : "duckBob 2s ease-in-out infinite" }}>
          <svg width={pct >= 80 ? 100 : 80} height={pct >= 80 ? 88 : 70} viewBox="0 0 120 100" style={{ filter: `drop-shadow(0 8px 24px ${grade.color}55)` }}>
            <ellipse cx="60" cy="90" rx="38" ry="6" fill="rgba(0,0,0,.2)" />
            <ellipse cx="60" cy="78" rx="26" ry="17" fill="#f59e0b" />
            <ellipse cx="62" cy="82" rx="17" ry="11" fill="#fcd34d" />
            {/* Wings spread if excellent */}
            {pct >= 80 && <ellipse cx="28" cy="72" rx="18" ry="7" fill="#d97706" transform="rotate(-30,28,72)" />}
            {pct >= 80 && <ellipse cx="92" cy="72" rx="18" ry="7" fill="#d97706" transform="rotate(30,92,72)" />}
            {pct < 80 && <ellipse cx="38" cy="75" rx="11" ry="5" fill="#d97706" transform="rotate(-15,38,75)" />}
            <rect x="55" y="56" width="13" height="17" rx="6" fill="#f59e0b" />
            <circle cx="61" cy="48" r="15" fill="#10b981" />
            <circle cx="67" cy="44" r="4" fill="#fff" />
            <circle cx="68.5" cy="43" r="2.5" fill="#1a1a2e" />
            <circle cx="69.5" cy="42" r="1" fill="#fff" />
            {/* Happy mouth if good score */}
            {pct >= 60
              ? <path d="M57 52 Q61 56 65 52" stroke="#f97316" strokeWidth="2" fill="none" strokeLinecap="round" />
              : <path d="M72 46 L82 44 L81 49 L72 48 Z" fill="#f97316" />
            }
            {/* Graduation cap */}
            <rect x="50" y="33" width="22" height="5" rx="2" fill="#1e1b4b" />
            <rect x="56" y="29" width="10" height="5" rx="1" fill="#1e1b4b" />
            <line x1="68" y1="33" x2="73" y2="40" stroke="#7c3aed" strokeWidth="2" />
            <circle cx="73" cy="40" r="2.5" fill="#7c3aed" />
            <rect x="52" y="88" width="4" height="8" rx="2" fill="#d97706" />
            <rect x="62" y="88" width="4" height="8" rx="2" fill="#d97706" />
            {/* Stars if excellent */}
            {pct >= 80 && <>
              <text x="10" y="30" fontSize="14" style={{ animation: "sparkleRotate 2s ease infinite" }}>⭐</text>
              <text x="95" y="25" fontSize="12" style={{ animation: "sparkleRotate 2.4s ease infinite" }}>✨</text>
              <text x="15" y="65" fontSize="10" style={{ animation: "sparkleRotate 1.8s ease infinite" }}>🌟</text>
            </>}
          </svg>
        </div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,.6)", marginBottom: 8, fontFamily: "'JetBrains Mono',monospace" }}>
          {pct >= 80 ? "🎉 Quiz Duck is proud of you!" : pct >= 60 ? "🦆 Duck says keep going!" : "🦆 Duck believes in you!"}
        </div>
        <div style={{ fontSize: 52, marginBottom: 8, animation: "countUp .6s ease both" }}>{grade.icon}</div>
        <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 900, fontSize: 52, color: "#f0f2f8", lineHeight: 1 }}>{pct}<span style={{ fontSize: 26, color: "#6b7a99" }}>%</span></div>
        <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 20, color: grade.color, marginBottom: 4 }}>{grade.label}</div>
        <div style={{ fontSize: 13, color: "#9aa5bc", marginBottom: 16 }}>{grade.sub} · {result.score}/{result.total} correct · Topic: <strong style={{ color: "#f0f2f8" }}>{topic}</strong></div>
        <div style={{ height: 6, borderRadius: 99, background: "rgba(255,255,255,.08)", maxWidth: 260, margin: "0 auto", overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${pct}%`, background: `linear-gradient(90deg,${grade.color},#4f8ef7)`, borderRadius: 99, transition: "width 1.2s ease" }} />
        </div>
      </div>

      {/* ── NEXT TOPIC RECOMMENDATION CARD — driven by quiz performance ── */}
      {(() => {
        // Derive recommendation reason from actual score
        const perfReason = pct >= 80
          ? `You scored ${pct}% — ready for the next level`
          : pct >= 60
            ? `You scored ${pct}% — one more push needed`
            : `You scored ${pct}% — reinforce fundamentals first`;
        const perfTag = pct >= 80 ? { label: "Level Up 🚀", color: "#10b981" } : pct >= 60 ? { label: "Stretch Goal ⚡", color: "#f59e0b" } : { label: "Recommended Fix 🎯", color: "#f43f5e" };
        const aiReason = result.performance?.nextTopicReason || perfReason;
        // Backend provides nextTopic; fallback derives from score
        const nt = nextTopic || (pct >= 80 ? "Advanced " + topic : "Core " + topic);
        return (
          <div style={{ background: "linear-gradient(135deg,rgba(124,58,237,.14),rgba(79,142,247,.1))", border: "1.5px solid rgba(124,58,237,.4)", borderRadius: 18, padding: "22px 24px", position: "relative", overflow: "hidden" }}>
            {/* Glow blob */}
            <div style={{ position: "absolute", top: -20, right: -20, width: 140, height: 140, borderRadius: "50%", background: "rgba(124,58,237,.15)", filter: "blur(40px)", pointerEvents: "none" }} />
            {/* AI badge */}
            <div style={{ position: "absolute", top: 14, right: 14, fontSize: 9, fontWeight: 700, color: "#7c3aed", background: "rgba(124,58,237,.2)", border: "1px solid rgba(124,58,237,.35)", padding: "3px 9px", borderRadius: 99, fontFamily: "'JetBrains Mono',monospace", letterSpacing: ".05em" }}>AI RECOMMENDED</div>

            <div style={{ display: "flex", gap: 18, alignItems: "flex-start", position: "relative", zIndex: 1 }}>
              {/* Left icon */}
              <div style={{ width: 56, height: 56, borderRadius: 16, background: "linear-gradient(135deg,#7c3aed,#4f8ef7)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0, boxShadow: "0 4px 24px rgba(124,58,237,.45)" }}>🎯</div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                  <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 900, fontSize: 11, color: "rgba(255,255,255,.45)", letterSpacing: ".08em", textTransform: "uppercase" }}>Next Recommended Topic</span>
                  <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: `${perfTag.color}22`, color: perfTag.color, fontFamily: "'JetBrains Mono',monospace", border: `1px solid ${perfTag.color}44` }}>{perfTag.label}</span>
                </div>

                {/* Topic name — big and prominent */}
                <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 900, fontSize: 22, color: "#f0f2f8", marginBottom: 6, lineHeight: 1.2 }}>{nt}</div>

                {/* Why this topic */}
                <div style={{ display: "flex", alignItems: "flex-start", gap: 6, marginBottom: 14 }}>
                  <span style={{ fontSize: 12, flexShrink: 0 }}>💬</span>
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,.55)", lineHeight: 1.6, fontStyle: "italic" }}>"{aiReason}"</span>
                </div>

                {/* Score-based reasoning pills */}
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 10px", borderRadius: 99, background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)" }}>
                    <span style={{ fontSize: 12 }}>📊</span>
                    <span style={{ fontSize: 10, color: "#9aa5bc", fontFamily: "'JetBrains Mono',monospace" }}>Your score: <strong style={{ color: grade.color }}>{pct}%</strong></span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 10px", borderRadius: 99, background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)" }}>
                    <span style={{ fontSize: 12 }}>🏷️</span>
                    <span style={{ fontSize: 10, color: "#9aa5bc", fontFamily: "'JetBrains Mono',monospace" }}>From: <strong style={{ color: "#f0f2f8" }}>{topic}</strong></span>
                  </div>
                  {result.performance?.weakTopics?.[0] && (
                    <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 10px", borderRadius: 99, background: "rgba(244,63,94,.08)", border: "1px solid rgba(244,63,94,.2)" }}>
                      <span style={{ fontSize: 12 }}>⚠️</span>
                      <span style={{ fontSize: 10, color: "#f43f5e", fontFamily: "'JetBrains Mono',monospace" }}>Weak: {result.performance.weakTopics[0]}</span>
                    </div>
                  )}
                </div>

                {/* CTA buttons */}
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {/* PRIMARY: Start next topic */}
                  <button
                    onClick={() => { setInputTopic(nt); generateQuiz(nt); }}
                    style={{ padding: "11px 24px", borderRadius: 12, background: "linear-gradient(135deg,#7c3aed,#4f8ef7)", color: "#fff", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 800, display: "flex", alignItems: "center", gap: 8, boxShadow: "0 4px 20px rgba(124,58,237,.45)", fontFamily: "'Syne',sans-serif" }}
                    onMouseEnter={e => e.currentTarget.style.opacity = ".88"}
                    onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
                    Start "{nt}" →
                  </button>

                  {/* SECONDARY: Retake current */}
                  <button onClick={() => generateQuiz(topic)}
                    style={{ padding: "11px 18px", borderRadius: 12, background: "rgba(79,142,247,.12)", border: "1px solid rgba(79,142,247,.3)", color: "#4f8ef7", cursor: "pointer", fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
                    🔄 Retake <span style={{ fontSize: 11, opacity: .7, fontFamily: "'JetBrains Mono',monospace" }}>{topic.length > 14 ? topic.slice(0, 14) + "…" : topic}</span>
                  </button>

                  {/* TERTIARY: Change topic */}
                  <button onClick={() => setQuizState("idle")}
                    style={{ padding: "11px 16px", borderRadius: 12, background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.1)", color: "#9aa5bc", cursor: "pointer", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                    🔍 Change Topic
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* My performance + breakdown split */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 16 }}>
        {/* My Performance panel */}
        <div style={{ background: "#16181f", border: "1px solid rgba(255,255,255,.07)", borderRadius: 16, padding: "20px" }}>
          <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 14, marginBottom: 14 }}>📈 My Performance</div>
          {[
            { label: "This Session", value: `${pct}%`, color: grade.color },
            { label: "Avg Score", value: result.performance?.avgScore ? `${result.performance.avgScore}%` : "—", color: "#4f8ef7" },
          ].map((s, i) => (
            <div key={i} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                <span style={{ fontSize: 12, color: "#9aa5bc" }}>{s.label}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: s.color, fontFamily: "'Syne',sans-serif" }}>{s.value}</span>
              </div>
              <div style={{ height: 4, borderRadius: 99, background: "rgba(255,255,255,.07)", overflow: "hidden" }}>
                <div style={{ height: "100%", width: s.value !== "—" ? s.value : "0%", background: s.color, borderRadius: 99, transition: "width 1s ease" }} />
              </div>
            </div>
          ))}
          <div style={{ marginTop: 14, borderTop: "1px solid rgba(255,255,255,.06)", paddingTop: 14 }}>
            <div style={{ fontSize: 11, color: "#6b7a99", marginBottom: 8 }}>⚠️ Weak areas</div>
            {(result.performance?.weakTopics || ["Connect backend for analytics"]).map((w, i) => (
              <div key={i} style={{ fontSize: 12, color: "#f43f5e", padding: "5px 10px", borderRadius: 8, background: "rgba(244,63,94,.08)", border: "1px solid rgba(244,63,94,.2)", marginBottom: 5 }}>{w}</div>
            ))}
            <div style={{ fontSize: 11, color: "#6b7a99", marginBottom: 8, marginTop: 10 }}>✅ Strengths</div>
            {(result.performance?.strengths || ["Complete more quizzes"]).map((s, i) => (
              <div key={i} style={{ fontSize: 12, color: "#10b981", padding: "5px 10px", borderRadius: 8, background: "rgba(16,185,129,.08)", border: "1px solid rgba(16,185,129,.2)", marginBottom: 5 }}>{s}</div>
            ))}
          </div>
        </div>

        {/* Answer breakdown */}
        <div style={{ background: "#16181f", border: "1px solid rgba(255,255,255,.07)", borderRadius: 16, padding: "20px", maxHeight: 480, overflowY: "auto" }}>
          <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 14, marginBottom: 14 }}>🔍 Answer Breakdown</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {(result.breakdown || []).map((b, i) => {
              const qObj = questions.find(q => q.id === b.id) || {};
              return (
                <div key={i} style={{ padding: "12px 14px", borderRadius: 12, background: b.correct ? "rgba(16,185,129,.07)" : "rgba(244,63,94,.07)", border: `1px solid ${b.correct ? "rgba(16,185,129,.2)" : "rgba(244,63,94,.2)"}` }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: b.explanation ? 7 : 0 }}>
                    <span style={{ fontSize: 14, flexShrink: 0 }}>{b.correct ? "✅" : "❌"}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "#f0f2f8", marginBottom: 3, lineHeight: 1.4 }}>{qObj.question || `Question ${i + 1}`}</div>
                      <div style={{ fontSize: 11, color: "#9aa5bc" }}>
                        Your: <span style={{ color: b.correct ? "#10b981" : "#f43f5e", fontWeight: 600 }}>{b.selected}</span>
                        {!b.correct && <> · Correct: <span style={{ color: "#10b981", fontWeight: 600 }}>{b.answer}</span></>}
                      </div>
                    </div>
                  </div>
                  {b.explanation && <div style={{ fontSize: 11, color: "#9aa5bc", lineHeight: 1.6, padding: "7px 9px", borderRadius: 8, background: "rgba(255,255,255,.04)", marginTop: 5 }}>💡 {b.explanation}</div>}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  return null;
}


/* ══════════════════════════════════════════════════════════
   SETTINGS PAGE
   Backend hooks:
     POST /api/auth/change-password  { oldPass, newPass, userId }
     POST /api/auth/enable-2fa       { userId } → { qrCode, secret }
     POST /api/auth/verify-2fa       { code, userId }
     POST /api/auth/logout-all       { userId }
     GET  /api/auth/devices          { userId } → { devices:[...] }
     DELETE /api/auth/devices/:id
     GET  /api/auth/login-history    { userId } → { events:[...] }
     POST /api/auth/export-data      { userId }
══════════════════════════════════════════════════════════ */

/* ══════════════════════════════════════════════════════════
   POMODORO FOCUS TIMER MODULE
   — Adjustable focus/break durations
   — Minimizable floating widget
   — Study music: Rain · Beach · Lo-fi · Focus (Web Audio API synth)
   — Full animations throughout
══════════════════════════════════════════════════════════ */
function PomodoroModule({ user }) {
  /* ── State ── */
  const [mode, setMode] = useState("focus");
  const [focusMins, setFocusMins] = useState(25);
  const [shortMins, setShortMins] = useState(5);
  const [longMins, setLongMins] = useState(15);
  const [secsLeft, setSecsLeft] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [session, setSession] = useState(1);
  const [completed, setCompleted] = useState(0);
  const [minimized, setMinimized] = useState(false);
  const [music, setMusic] = useState(null);
  const [musicVol, setMusicVol] = useState(0.5);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [ringAnim, setRingAnim] = useState(false);
  const [trees, setTrees] = useState([]);        // {id,type,grown,ts}
  const [showCelebration, setShowCelebration] = useState(false);
  const [newTree, setNewTree] = useState(null);
  const [elapsedSecs, setElapsedSecs] = useState(0);      // secs studied this session

  const tickRef = useRef(null);
  const audioCtx = useRef(null);
  const allNodes = useRef([]);   // ALL audio nodes (oscillators + buffer sources)
  const gainRef = useRef(null);
  const noteRef = useRef(null);

  const totalSecs = mode === "focus" ? focusMins * 60 : mode === "short" ? shortMins * 60 : longMins * 60;
  const pct = ((totalSecs - secsLeft) / totalSecs) * 100;
  const mins = String(Math.floor(secsLeft / 60)).padStart(2, "0");
  const secs = String(secsLeft % 60).padStart(2, "0");

  const MODE_META = {
    focus: { label: "Focus", color: "#4f8ef7", icon: "🎯" },
    short: { label: "Short Break", color: "#10b981", icon: "☕" },
    long: { label: "Long Break", color: "#7c3aed", icon: "🌙" },
  };
  const meta = MODE_META[mode];

  /* ── Tree types ── */
  const TREE_TYPES = [
    { id: "oak", name: "Oak", emoji: "🌳", minMins: 5, rarity: "common" },
    { id: "pine", name: "Pine", emoji: "🌲", minMins: 10, rarity: "common" },
    { id: "palm", name: "Palm", emoji: "🌴", minMins: 15, rarity: "uncommon" },
    { id: "cherry", name: "Cherry Blossom", emoji: "🌸", minMins: 20, rarity: "rare" },
    { id: "cactus", name: "Cactus", emoji: "🌵", minMins: 5, rarity: "common" },
    { id: "maple", name: "Maple", emoji: "🍁", minMins: 25, rarity: "rare" },
    { id: "bamboo", name: "Bamboo", emoji: "🎋", minMins: 15, rarity: "uncommon" },
    { id: "herb", name: "Herb", emoji: "🌿", minMins: 5, rarity: "common" },
  ];

  const pickTree = (studiedMins) => {
    const eligible = TREE_TYPES.filter(t => t.minMins <= studiedMins);
    if (!eligible.length) return TREE_TYPES[0];
    const rare = eligible.filter(t => t.rarity === "rare");
    const uncommon = eligible.filter(t => t.rarity === "uncommon");
    const r = Math.random();
    if (r < 0.15 && rare.length) return rare[Math.floor(Math.random() * rare.length)];
    if (r < 0.35 && uncommon.length) return uncommon[Math.floor(Math.random() * uncommon.length)];
    const common = eligible.filter(t => t.rarity === "common");
    return common.length ? common[Math.floor(Math.random() * common.length)] : eligible[0];
  };

  /* ── Plant tree when any session ends (user manually stops or timer finishes) ── */
  const plantTree = (studiedS) => {
    if (studiedS < 30) return; // minimum 30 seconds
    const studiedMins = Math.floor(studiedS / 60) || 1;
    const type = pickTree(studiedMins);
    const tree = { id: Date.now(), type, grown: false, ts: new Date(), mins: studiedMins };
    setTrees(prev => [...prev, tree]);
    setNewTree(tree);
    setShowCelebration(true);
    setTimeout(() => {
      setTrees(prev => prev.map(t => t.id === tree.id ? { ...t, grown: true } : t));
    }, 400);
    setTimeout(() => { setShowCelebration(false); setNewTree(null); }, 4000);
  };

  /* ── Timer tick ── */
  useEffect(() => {
    if (running) {
      tickRef.current = setInterval(() => {
        setElapsedSecs(e => e + 1);
        setSecsLeft(s => {
          if (s <= 1) {
            clearInterval(tickRef.current);
            setRunning(false);
            setRingAnim(true);
            setTimeout(() => setRingAnim(false), 2000);
            if (mode === "focus") setCompleted(c => c + 1);
            // plant tree on timer finish
            setElapsedSecs(prev => { plantTree(prev + 1); return 0; });
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } else {
      clearInterval(tickRef.current);
    }
    return () => clearInterval(tickRef.current);
  }, [running]);

  const switchMode = (m) => {
    if (running && elapsedSecs >= 30) { plantTree(elapsedSecs); }
    setMode(m); setRunning(false);
    setSecsLeft(m === "focus" ? focusMins * 60 : m === "short" ? shortMins * 60 : longMins * 60);
    setElapsedSecs(0);
  };
  const reset = () => {
    if (running && elapsedSecs >= 30) { plantTree(elapsedSecs); }
    setRunning(false);
    setSecsLeft(mode === "focus" ? focusMins * 60 : mode === "short" ? shortMins * 60 : longMins * 60);
    setElapsedSecs(0);
  };
  const toggleRun = () => {
    if (running) {
      // Pausing: if enough time studied, plant tree
      if (elapsedSecs >= 30) { plantTree(elapsedSecs); setElapsedSecs(0); }
    }
    setRunning(r => !r);
  };

  /* ═══════════════════════════════════════════════
     AUDIO ENGINE — tracks ALL nodes in allNodes[]
     so stopAudio() kills every oscillator/source
  ═══════════════════════════════════════════════ */
  const stopAudio = () => {
    clearTimeout(noteRef.current);
    // Kill every audio node we started
    allNodes.current.forEach(n => {
      try { n.stop(); } catch (e) { }
      try { n.disconnect(); } catch (e) { }
    });
    allNodes.current = [];
    // Also disconnect the gain
    try { gainRef.current?.disconnect(); } catch (e) { }
    gainRef.current = null;
    setMusicPlaying(false);
    setMusic(null);
  };

  const playMusic = (track) => {
    // If same track is playing → stop
    if (track === music && musicPlaying) { stopAudio(); return; }
    // Stop whatever is playing first
    stopAudio();

    // Resume or create AudioContext
    if (!audioCtx.current || audioCtx.current.state === "closed") {
      audioCtx.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.current.state === "suspended") audioCtx.current.resume();
    const ctx = audioCtx.current;

    // Master gain
    const masterGain = ctx.createGain();
    masterGain.gain.value = musicVol;
    masterGain.connect(ctx.destination);
    gainRef.current = masterGain;

    const registerNode = (n) => { allNodes.current.push(n); return n; };

    const makeNoise = (filterType, freq, q = 1, gainVal = 1) => {
      // 4-second looping white noise buffer
      const bufLen = ctx.sampleRate * 4;
      const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < bufLen; i++) data[i] = (Math.random() * 2 - 1);
      const src = ctx.createBufferSource();
      src.buffer = buf; src.loop = true;
      const filt = ctx.createBiquadFilter();
      filt.type = filterType;
      filt.frequency.value = freq;
      if (q) filt.Q.value = q;
      const g = ctx.createGain(); g.gain.value = gainVal;
      src.connect(filt); filt.connect(g); g.connect(masterGain);
      src.start();
      registerNode(src);
      return src;
    };

    const makeOsc = (type, freq, gainVal) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain(); g.gain.value = gainVal;
      osc.type = type; osc.frequency.value = freq;
      osc.connect(g); g.connect(masterGain);
      osc.start();
      registerNode(osc);
      return osc;
    };

    if (track === "rain") {
      // Rain: layered noise bands
      makeNoise("bandpass", 400, 0.6, 1.2);
      makeNoise("highpass", 3000, 0.3, 0.4);
      makeNoise("lowpass", 200, 1, 0.3);
    }
    else if (track === "beach") {
      // Beach: slow-sweep noise + deep sub + seagull-like tones
      makeNoise("bandpass", 180, 0.8, 1.0);
      makeNoise("lowpass", 120, 1, 0.6);
      makeOsc("sine", 55, 0.05);
      makeOsc("sine", 110, 0.02);
    }
    else if (track === "lofi") {
      // Lo-fi: chord loops + vinyl crackle
      makeNoise("lowpass", 250, 0.5, 0.25); // crackle
      const chords = [[261, 330, 392], [220, 261, 330], [174, 220, 261], [196, 247, 330]];
      const playRound = () => {
        let t = ctx.currentTime;
        chords.forEach(ch => {
          ch.forEach(f => {
            const o = ctx.createOscillator();
            const g = ctx.createGain();
            const lp = ctx.createBiquadFilter();
            lp.type = "lowpass"; lp.frequency.value = 1200;
            g.gain.setValueAtTime(0, t);
            g.gain.linearRampToValueAtTime(0.07, t + 0.15);
            g.gain.linearRampToValueAtTime(0.05, t + 1.7);
            g.gain.linearRampToValueAtTime(0, t + 2.0);
            o.type = "triangle"; o.frequency.value = f;
            o.connect(lp); lp.connect(g); g.connect(masterGain);
            o.start(t); o.stop(t + 2.2);
            registerNode(o);
          });
          t += 2.0;
        });
        noteRef.current = setTimeout(playRound, chords.length * 2000);
      };
      playRound();
    }
    else if (track === "focus") {
      // Focus: binaural beats (40Hz left/right) + 528Hz solfeggio + pink noise floor
      makeOsc("sine", 40, 0.12);
      makeOsc("sine", 40.8, 0.12);
      makeOsc("sine", 528, 0.025);
      makeOsc("sine", 174, 0.015);
      makeNoise("lowpass", 200, 1, 0.08);
    }

    setMusic(track);
    setMusicPlaying(true);
  };

  const changeVol = (v) => {
    setMusicVol(v);
    if (gainRef.current) gainRef.current.gain.value = v;
  };

  // Cleanup on unmount
  useEffect(() => () => { stopAudio(); clearTimeout(noteRef.current); }, []);

  const TRACKS = [
    { id: "rain", icon: "🌧️", label: "Rain", desc: "Gentle rainfall", color: "#4f8ef7" },
    { id: "beach", icon: "🌊", label: "Beach", desc: "Ocean waves", color: "#06b6d4" },
    { id: "lofi", icon: "🎵", label: "Lo-fi", desc: "Chill chords", color: "#7c3aed" },
    { id: "focus", icon: "🔮", label: "Focus", desc: "Binaural tones", color: "#10b981" },
  ];

  /* ── SVG Ring ── */
  const R = 90, C = 2 * Math.PI * R, dash = C * (1 - pct / 100);

  /* ─── FOREST GRID ─── */
  const ForestGrid = () => (
    <div style={{ background: "#16181f", border: "1px solid rgba(255,255,255,.07)", borderRadius: 20, padding: "20px", animation: "slideUp .4s .15s ease both" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div>
          <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 15 }}>🌳 My Forest</div>
          <div style={{ fontSize: 11, color: "#6b7a99", fontFamily: "'JetBrains Mono',monospace", marginTop: 2 }}>
            {trees.length} tree{trees.length !== 1 ? "s" : ""} · {trees.reduce((a, t) => a + (t.mins || 1), 0)}m studied
          </div>
        </div>
        {trees.length > 0 && (
          <div style={{ fontSize: 10, padding: "3px 10px", borderRadius: 99, background: "rgba(16,185,129,.15)", border: "1px solid rgba(16,185,129,.3)", color: "#10b981", fontFamily: "'JetBrains Mono',monospace", fontWeight: 700 }}>
            🌱 Forest growing
          </div>
        )}
      </div>
      {trees.length === 0 ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 0", gap: 12, textAlign: "center" }}>
          <div style={{ fontSize: 48, opacity: .25 }}>🌱</div>
          <div style={{ fontSize: 13, color: "#6b7a99", lineHeight: 1.7, maxWidth: 260 }}>Start a study session and your first tree will be planted here. Any session counts!</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {trees.slice().reverse().map((t, i) => (
            <div key={t.id}
              title={`${t.type.name} · ${t.mins || 1}m · ${t.ts?.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`}
              style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
                padding: "10px 8px", borderRadius: 12,
                background: t.id === newTree?.id ? "rgba(16,185,129,.15)" : "rgba(255,255,255,.04)",
                border: `1px solid ${t.id === newTree?.id ? "rgba(16,185,129,.4)" : "rgba(255,255,255,.07)"}`,
                transform: t.grown ? "scale(1)" : "scale(0)",
                transition: "transform .5s cubic-bezier(.34,1.56,.64,1)",
                cursor: "default",
                minWidth: 52,
              }}>
              <div style={{ fontSize: 28, lineHeight: 1, animation: t.id === newTree?.id ? "heartBeat 1s ease infinite" : "" }}>{t.type.emoji}</div>
              <div style={{ fontSize: 9, color: "#6b7a99", fontFamily: "'JetBrains Mono',monospace", textAlign: "center", lineHeight: 1.2 }}>{t.mins || 1}m</div>
              <div style={{ fontSize: 8, color: "rgba(255,255,255,.2)", fontFamily: "'JetBrains Mono',monospace" }}>{t.type.rarity === "rare" ? "✨" : "·"}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  /* ─── CELEBRATION OVERLAY ─── */
  const Celebration = () => {
    if (!showCelebration || !newTree) return null;
    return (
      <div style={{ position: "fixed", inset: 0, zIndex: 10000, pointerEvents: "none", display: "flex", alignItems: "flex-end", justifyContent: "center", paddingBottom: 80 }}>
        {/* Confetti dots */}
        {Array.from({ length: 18 }).map((_, i) => (
          <div key={i} style={{
            position: "absolute",
            left: `${10 + Math.random() * 80}%`,
            top: `${10 + Math.random() * 60}%`,
            width: 8, height: 8, borderRadius: "50%",
            background: ["#4f8ef7", "#10b981", "#f59e0b", "#7c3aed", "#f43f5e"][i % 5],
            animation: `featherFall ${.8 + Math.random() * .8}s ${Math.random() * .5}s ease-out both`,
          }} />
        ))}
        {/* Tree card */}
        <div style={{
          background: "linear-gradient(135deg,rgba(16,185,129,.2),rgba(79,142,247,.15))",
          border: "2px solid rgba(16,185,129,.5)",
          borderRadius: 20, padding: "20px 28px", textAlign: "center",
          boxShadow: "0 16px 60px rgba(16,185,129,.3)",
          animation: "ringPop .5s cubic-bezier(.34,1.56,.64,1) both",
          backdropFilter: "blur(16px)",
        }}>
          <div style={{ fontSize: 52, marginBottom: 6, animation: "heartBeat 1.2s ease infinite" }}>{newTree.type.emoji}</div>
          <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 900, fontSize: 18, color: "#10b981", marginBottom: 2 }}>Tree planted! 🌱</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,.65)" }}>{newTree.type.name} · {newTree.mins || 1} min session</div>
          {newTree.type.rarity === "rare" && <div style={{ fontSize: 11, color: "#f59e0b", marginTop: 4, fontWeight: 700 }}>✨ Rare tree!</div>}
        </div>
      </div>
    );
  };

  /* ── Minimized widget ── */
  if (minimized) return (
    <>
      <Celebration />
      <div onClick={() => setMinimized(false)}
        style={{
          position: "fixed", bottom: 24, right: 24, zIndex: 9999,
          background: "linear-gradient(135deg," + meta.color + "22,rgba(15,17,23,.95))",
          border: "1.5px solid " + meta.color + "55", borderRadius: 20,
          padding: "12px 18px", cursor: "pointer",
          boxShadow: "0 8px 40px " + meta.color + "44",
          animation: "miniPop .4s cubic-bezier(.34,1.56,.64,1) both",
          backdropFilter: "blur(16px)",
          display: "flex", alignItems: "center", gap: 12, minWidth: 160
        }}>
        <svg width="44" height="44" viewBox="0 0 44 44" style={{ flexShrink: 0 }}>
          <circle cx="22" cy="22" r="18" fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="4" />
          <circle cx="22" cy="22" r="18" fill="none" stroke={meta.color} strokeWidth="4"
            strokeDasharray={2 * Math.PI * 18} strokeDashoffset={2 * Math.PI * 18 * (1 - pct / 100)}
            strokeLinecap="round" transform="rotate(-90 22 22)"
            style={{ transition: "stroke-dashoffset .5s ease" }} />
          <text x="22" y="26" textAnchor="middle" fontSize="9" fill="#f0f2f8" fontFamily="'JetBrains Mono',monospace" fontWeight="700">{mins}:{secs}</text>
        </svg>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: meta.color, fontFamily: "'JetBrains Mono',monospace" }}>{meta.icon} {meta.label}</div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,.5)", marginTop: 1 }}>{running ? "Running…" : "Paused"} · tap to open</div>
          <div style={{ fontSize: 10, color: "#10b981", marginTop: 1 }}>🌳 {trees.length} trees</div>
        </div>
        {musicPlaying && <div style={{ fontSize: 16, animation: "musicNote 1.5s ease-in-out infinite" }}>🎵</div>}
      </div>
    </>
  );

  /* ── Full view ── */
  return (
    <>
      <Celebration />
      <div style={{ display: "flex", flexDirection: "column", gap: 16, animation: "slideUp .4s ease both" }}>

        {/* Top row: Timer + Music */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 16, alignItems: "start" }}>

          {/* ── LEFT: Timer card ── */}
          <div style={{ background: "#16181f", border: "1px solid rgba(255,255,255,.07)", borderRadius: 22, padding: "32px 28px", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -60, left: -60, width: 240, height: 240, borderRadius: "50%", background: meta.color + "0a", filter: "blur(60px)", animation: "waveFloat 7s ease-in-out infinite", pointerEvents: "none" }} />
            <div style={{ position: "absolute", bottom: -40, right: -40, width: 200, height: 200, borderRadius: "50%", background: meta.color + "07", filter: "blur(50px)", animation: "waveFloat 9s ease-in-out infinite reverse", pointerEvents: "none" }} />

            {/* Mode tabs */}
            <div style={{ display: "flex", gap: 8, marginBottom: 28, position: "relative", zIndex: 1 }}>
              {Object.entries(MODE_META).map(([k, m]) => (
                <button key={k} onClick={() => switchMode(k)}
                  style={{ flex: 1, padding: "9px 4px", borderRadius: 12, border: "1.5px solid " + (mode === k ? m.color : "rgba(255,255,255,.08)"), background: mode === k ? m.color + "20" : "transparent", color: mode === k ? m.color : "#6b7a99", fontSize: 12, fontWeight: 700, cursor: "pointer", transition: "all .2s", fontFamily: "'JetBrains Mono',monospace" }}>
                  {m.icon} {m.label}
                </button>
              ))}
            </div>

            {/* Ring */}
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 24, position: "relative", zIndex: 1 }}>
              <div style={{ position: "relative", animation: ringAnim ? "ringPop .6s cubic-bezier(.34,1.56,.64,1)" : running ? "breathe 4s ease-in-out infinite" : "none" }}>
                <svg width="220" height="220" viewBox="0 0 220 220">
                  <circle cx="110" cy="110" r={R} fill="none" stroke="rgba(255,255,255,.06)" strokeWidth="12" />
                  <circle cx="110" cy="110" r={R} fill="none" stroke={meta.color} strokeWidth="12"
                    strokeDasharray={C} strokeDashoffset={dash}
                    strokeLinecap="round" transform="rotate(-90 110 110)"
                    style={{ transition: "stroke-dashoffset .8s cubic-bezier(.4,0,.2,1)", filter: "drop-shadow(0 0 8px " + meta.color + "88)" }} />
                  {running && <circle
                    cx={110 + R * Math.cos((pct / 100 * 360 - 90) * Math.PI / 180)}
                    cy={110 + R * Math.sin((pct / 100 * 360 - 90) * Math.PI / 180)}
                    r="7" fill={meta.color} style={{ filter: "drop-shadow(0 0 6px " + meta.color + ")" }} />}
                </svg>
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 900, fontSize: 48, color: "#f0f2f8", lineHeight: 1, letterSpacing: "-2px", animation: running ? "timerPulse 2s ease-in-out infinite" : "none" }}>
                    {mins}:{secs}
                  </div>
                  <div style={{ fontSize: 12, color: meta.color, fontWeight: 700, marginTop: 4, fontFamily: "'JetBrains Mono',monospace" }}>{meta.icon} {meta.label}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,.35)", marginTop: 2 }}>
                    {elapsedSecs > 0 ? `${Math.floor(elapsedSecs / 60)}m ${elapsedSecs % 60}s studied` : `Session #${session}`}
                  </div>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div style={{ display: "flex", gap: 12, justifyContent: "center", marginBottom: 20, position: "relative", zIndex: 1 }}>
              <button onClick={reset} title="Reset (plants tree if ≥30s studied)"
                style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)", color: "#9aa5bc", fontSize: 18, cursor: "pointer", transition: "all .2s", display: "flex", alignItems: "center", justifyContent: "center" }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,.12)"}
                onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,.06)"}>↩</button>

              <button onClick={toggleRun}
                style={{ width: 72, height: 72, borderRadius: 20, background: "linear-gradient(135deg," + meta.color + "," + meta.color + "aa)", border: "none", color: "#fff", fontSize: 26, cursor: "pointer", transition: "all .2s", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 28px " + meta.color + "55", animation: running ? "none" : "glowPulse 2s ease-in-out infinite" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.08)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}>
                {running ? "⏸" : "▶"}
              </button>

              <button onClick={() => setMinimized(true)} title="Minimize"
                style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)", color: "#9aa5bc", fontSize: 16, cursor: "pointer", transition: "all .2s", display: "flex", alignItems: "center", justifyContent: "center" }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,.12)"}
                onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,.06)"}>▬</button>
            </div>

            {/* Tree hint when running */}
            {running && elapsedSecs >= 10 && (
              <div style={{ textAlign: "center", fontSize: 12, color: "#10b981", fontFamily: "'JetBrains Mono',monospace", marginBottom: 12, animation: "pulse 2s ease-in-out infinite", position: "relative", zIndex: 1 }}>
                🌱 {elapsedSecs >= 30 ? "Pause/reset to plant a tree!" : "Almost ready to plant…"}
              </div>
            )}

            {/* Session dots */}
            <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 20, position: "relative", zIndex: 1 }}>
              {[1, 2, 3, 4].map(i => {
                const filled = i <= (completed % 4) || (completed > 0 && completed % 4 === 0 && i <= 4);
                return <div key={i} style={{ width: filled ? 14 : 10, height: filled ? 14 : 10, borderRadius: "50%", background: filled ? meta.color : "rgba(255,255,255,.1)", transition: "all .4s cubic-bezier(.34,1.56,.64,1)", boxShadow: filled ? "0 0 8px " + meta.color : "" }} />;
              })}
            </div>

            {/* Duration editor */}
            <div style={{ position: "relative", zIndex: 1 }}>
              <button onClick={() => setEditMode(!editMode)}
                style={{ width: "100%", padding: "8px", borderRadius: 10, background: "rgba(255,255,255,.04)", border: "1px dashed rgba(255,255,255,.12)", color: "#6b7a99", cursor: "pointer", fontSize: 11, fontWeight: 600, fontFamily: "'JetBrains Mono',monospace", transition: "all .2s" }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,.08)"; e.currentTarget.style.color = "#f0f2f8"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,.04)"; e.currentTarget.style.color = "#6b7a99"; }}>
                ⚙️ {editMode ? "Hide" : "Adjust"} Durations
              </button>
              {editMode && (
                <div style={{ marginTop: 12, padding: "16px", background: "rgba(255,255,255,.03)", borderRadius: 14, border: "1px solid rgba(255,255,255,.07)", animation: "dropIn .3s ease both" }}>
                  {[
                    { label: "🎯 Focus", val: focusMins, set: setFocusMins, min: 1, max: 120 },
                    { label: "☕ Short Break", val: shortMins, set: setShortMins, min: 1, max: 30 },
                    { label: "🌙 Long Break", val: longMins, set: setLongMins, min: 5, max: 60 },
                  ].map((r, i) => (
                    <div key={i} style={{ marginBottom: 12 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                        <span style={{ fontSize: 12, color: "#9aa5bc" }}>{r.label}</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: "#f0f2f8", fontFamily: "'JetBrains Mono',monospace" }}>{r.val}m</span>
                      </div>
                      <input type="range" min={r.min} max={r.max} value={r.val}
                        onChange={e => { r.set(+e.target.value); if (!running) setSecsLeft(+e.target.value * 60); }}
                        style={{ width: "100%", accentColor: meta.color, cursor: "pointer" }} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Stats bar */}
            <div style={{ display: "flex", gap: 10, marginTop: 16, position: "relative", zIndex: 1 }}>
              {[
                { label: "Sessions", val: completed, icon: "🍅" },
                { label: "Focus Time", val: completed * focusMins + "m", icon: "⏱️" },
                { label: "Trees", val: trees.length + "🌳", icon: "🌲" },
              ].map((s, i) => (
                <div key={i} style={{ flex: 1, padding: "10px 6px", borderRadius: 12, background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.07)", textAlign: "center" }}>
                  <div style={{ fontSize: 14, marginBottom: 3 }}>{s.icon}</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "#f0f2f8", fontFamily: "'Syne',sans-serif" }}>{s.val}</div>
                  <div style={{ fontSize: 9, color: "#6b7a99", fontFamily: "'JetBrains Mono',monospace" }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT: Music player ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ background: "#16181f", border: "1px solid rgba(255,255,255,.07)", borderRadius: 20, padding: "22px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
                <div style={{ display: "flex", gap: 2, alignItems: "flex-end", height: 18 }}>
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} style={{ width: 3, borderRadius: 99, background: musicPlaying ? "#4f8ef7" : "rgba(255,255,255,.2)", height: musicPlaying ? 6 + i * 3 : 3, animation: musicPlaying ? `barDance ${.35 + i * .11}s ease-in-out ${i * .08}s infinite alternate` : "" }} />
                  ))}
                </div>
                <div>
                  <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 15 }}>Study Music</div>
                  <div style={{ fontSize: 11, color: "#6b7a99", fontFamily: "'JetBrains Mono',monospace" }}>
                    {musicPlaying ? `♪ ${TRACKS.find(t => t.id === music)?.label || ""} playing` : "Pick a soundscape"}
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
                {TRACKS.map(t => {
                  const active = music === t.id && musicPlaying;
                  return (
                    <button key={t.id} onClick={() => playMusic(t.id)}
                      style={{ padding: "13px 8px", borderRadius: 13, border: "1.5px solid " + (active ? t.color : "rgba(255,255,255,.1)"), background: active ? t.color + "20" : "rgba(255,255,255,.03)", cursor: "pointer", transition: "all .22s", textAlign: "center", position: "relative", overflow: "hidden" }}
                      onMouseEnter={e => { if (!active) { e.currentTarget.style.background = "rgba(255,255,255,.07)"; e.currentTarget.style.borderColor = "rgba(255,255,255,.2)"; } }}
                      onMouseLeave={e => { if (!active) { e.currentTarget.style.background = "rgba(255,255,255,.03)"; e.currentTarget.style.borderColor = "rgba(255,255,255,.1)"; } }} >
                      {active && <div style={{ position: "absolute", top: 6, right: 8, fontSize: 11, animation: "musicNote 1.8s ease-in-out infinite", color: t.color }}>♪</div>}
                      <div style={{ fontSize: 26, marginBottom: 3, animation: active ? "waveFloat 3s ease-in-out infinite" : "" }}>{t.icon}</div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: active ? t.color : "#f0f2f8" }}>{t.label}</div>
                      <div style={{ fontSize: 10, color: "#6b7a99", marginTop: 1, fontFamily: "'JetBrains Mono',monospace" }}>{t.desc}</div>
                      {active && <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg," + t.color + "," + t.color + "66)", animation: "borderFlow 2s ease infinite", backgroundSize: "200% 100%" }} />}
                    </button>
                  );
                })}
              </div>

              {/* Volume */}
              <div style={{ padding: "10px 12px", borderRadius: 11, background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.06)", marginBottom: musicPlaying ? 10 : 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
                  <span style={{ fontSize: 12, color: "#9aa5bc" }}>🔊 Volume</span>
                  <span style={{ fontSize: 11, color: "#4f8ef7", fontFamily: "'JetBrains Mono',monospace" }}>{Math.round(musicVol * 100)}%</span>
                </div>
                <input type="range" min={0} max={1} step={.01} value={musicVol}
                  onChange={e => changeVol(+e.target.value)}
                  style={{ width: "100%", accentColor: "#4f8ef7", cursor: "pointer" }} />
              </div>

              {musicPlaying && (
                <button onClick={stopAudio}
                  style={{ width: "100%", padding: "9px", borderRadius: 10, background: "rgba(244,63,94,.12)", border: "1px solid rgba(244,63,94,.3)", color: "#f43f5e", cursor: "pointer", fontSize: 12, fontWeight: 700, transition: "all .2s", display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(244,63,94,.2)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(244,63,94,.12)"; }}>
                  ⏹ Stop Music
                </button>
              )}
            </div>

            {/* Pomodoro tips */}
            <div style={{ background: "linear-gradient(135deg,rgba(79,142,247,.08),rgba(124,58,237,.06))", border: "1px solid rgba(79,142,247,.18)", borderRadius: 16, padding: "16px" }}>
              <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 13, marginBottom: 12 }}>🍅 How it works</div>
              {[
                { n: "1", t: "Start timer → study focused" },
                { n: "2", t: "Pause or finish → tree planted 🌳" },
                { n: "3", t: "Any session ≥30s earns a tree" },
                { n: "🌟", t: "Longer sessions = rarer trees!" },
              ].map((s, i) => (
                <div key={i} style={{ display: "flex", gap: 9, alignItems: "flex-start", marginBottom: 9, animation: `slideUp .4s ${i * .07}s ease both` }}>
                  <div style={{ width: 20, height: 20, borderRadius: 6, background: "rgba(79,142,247,.18)", border: "1px solid rgba(79,142,247,.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#4f8ef7", flexShrink: 0 }}>{s.n}</div>
                  <div style={{ fontSize: 12, color: "#9aa5bc", lineHeight: 1.6, paddingTop: 1 }}>{s.t}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Forest grid (full width) ── */}
        <ForestGrid />
      </div>
    </>
  );
}

function SettingsPage({ user }) {
  const [section, setSection] = useState("security");
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confPass, setConfPass] = useState("");
  const [changingPw, setChangingPw] = useState(false);
  const [pwMsg, setPwMsg] = useState(null);
  const [twoFA, setTwoFA] = useState(false);
  const [twoFALoading, setTwoFALoading] = useState(false);
  const [twoFACode, setTwoFACode] = useState("");
  const [twoFAQR, setTwoFAQR] = useState(null);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState("30");
  const [exportLoading, setExportLoading] = useState(false);
  const [logoutAllLoading, setLogoutAllLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  /* Mock device data — replaced by GET /api/auth/devices */
  const DEVICES = [
    { id: "d1", name: "Chrome · Windows 11", loc: "Bengaluru, IN", last: "Now", current: true, icon: "🖥️" },
    { id: "d2", name: "Safari · iPhone 15", loc: "Bengaluru, IN", last: "2h ago", current: false, icon: "📱" },
    { id: "d3", name: "Firefox · MacOS", loc: "Mumbai, IN", last: "3 days ago", current: false, icon: "💻" },
  ];

  /* Mock login history — replaced by GET /api/auth/login-history */
  const LOGIN_HISTORY = [
    { event: "Login", device: "Chrome · Windows", loc: "Bengaluru, IN", time: "Today 09:14", status: "success", icon: "✅" },
    { event: "Login", device: "iPhone · Safari", loc: "Bengaluru, IN", time: "Yesterday 22:31", status: "success", icon: "✅" },
    { event: "Failed Login", device: "Unknown", loc: "Lagos, NG", time: "2 days ago", status: "alert", icon: "⚠️" },
    { event: "Password Changed", device: "Chrome · Windows", loc: "Bengaluru, IN", time: "1 week ago", status: "success", icon: "🔑" },
    { event: "2FA Enabled", device: "Chrome · Windows", loc: "Bengaluru, IN", time: "2 weeks ago", status: "success", icon: "🛡️" },
  ];

  const changePw = async () => {
    if (!oldPass || !newPass || newPass !== confPass) { setPwMsg({ t: "error", m: "Passwords don't match or fields empty" }); return; }
    if (newPass.length < 8) { setPwMsg({ t: "error", m: "New password must be at least 8 characters" }); return; }
    setChangingPw(true);
    try {
      /* BACKEND HOOK: POST /api/auth/change-password */
      const r = await fetch("/api/auth/change-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ oldPass, newPass, userId: user?.email }) });
      if (!r.ok) throw new Error();
      setPwMsg({ t: "success", m: "Password changed successfully!" }); setOldPass(""); setNewPass(""); setConfPass("");
    } catch { setPwMsg({ t: "info", m: "Backend not connected — link POST /api/auth/change-password" }); }
    setChangingPw(false);
  };

  const toggle2FA = async () => {
    setTwoFALoading(true);
    try {
      /* BACKEND HOOK: POST /api/auth/enable-2fa */
      const r = await fetch("/api/auth/enable-2fa", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: user?.email }) });
      const d = await r.json();
      setTwoFAQR(d.qrCode || null); setTwoFA(!twoFA);
    } catch { showToast("Backend not connected — link POST /api/auth/enable-2fa", "error"); }
    setTwoFALoading(false);
  };

  const logoutAll = async () => {
    setLogoutAllLoading(true);
    try {
      /* BACKEND HOOK: POST /api/auth/logout-all */
      await fetch("/api/auth/logout-all", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: user?.email }) });
      showToast("All devices logged out", "success");
    } catch { showToast("Backend not connected — link POST /api/auth/logout-all", "error"); }
    setLogoutAllLoading(false);
  };

  const exportData = async () => {
    setExportLoading(true);
    try {
      /* BACKEND HOOK: POST /api/auth/export-data */
      const r = await fetch("/api/auth/export-data", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: user?.email }) });
      const d = await r.json();
      // trigger download
      const a = document.createElement("a"); a.href = d.downloadUrl || "#"; a.download = "my-data.json"; a.click();
      showToast("Data export started", "success");
    } catch { showToast("Backend not connected — link POST /api/auth/export-data", "error"); }
    setExportLoading(false);
  };

  const removeDevice = async (id) => {
    try {
      /* BACKEND HOOK: DELETE /api/auth/devices/:id */
      await fetch(`/api/auth/devices/${id}`, { method: "DELETE" });
      showToast("Device removed", "success");
    } catch { showToast("Backend not connected", "error"); }
  };

  const SECTIONS = [
    { id: "security", icon: "🔐", label: "Login & Security" },
    { id: "devices", icon: "📱", label: "Devices" },
    { id: "advanced", icon: "⚙️", label: "Advanced" },
  ];

  const Field = ({ label, value, set, type = "text", placeholder = "" }) => (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7a99", fontFamily: "'JetBrains Mono',monospace", letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 6 }}>{label}</div>
      <input type={type} value={value} onChange={e => set(e.target.value)} placeholder={placeholder}
        style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1.5px solid rgba(255,255,255,.1)", background: "#1e2130", color: "#f0f2f8", fontSize: 13, outline: "none", fontFamily: "'DM Sans',sans-serif", transition: "border-color .2s" }}
        onFocus={e => e.target.style.borderColor = "#4f8ef7"}
        onBlur={e => e.target.style.borderColor = "rgba(255,255,255,.1)"}
      />
    </div>
  );

  const Card = ({ title, sub, children }) => (
    <div style={{ background: "#16181f", border: "1px solid rgba(255,255,255,.07)", borderRadius: 16, padding: "22px 24px", marginBottom: 16 }}>
      <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 15, marginBottom: sub ? 4 : 16 }}>{title}</div>
      {sub && <div style={{ fontSize: 12, color: "#6b7a99", marginBottom: 16 }}>{sub}</div>}
      {children}
    </div>
  );

  return (
    <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 20, alignItems: "start" }}>
      {/* Toast */}
      {toast && <div style={{ position: "fixed", top: 24, right: 24, zIndex: 9999, background: "#16181f", border: `1px solid ${toast.type === "success" ? "#10b981" : toast.type === "error" ? "#f43f5e" : "rgba(255,255,255,.1)"}44`, borderRadius: 12, padding: "12px 18px", fontSize: 13, color: "#f0f2f8", boxShadow: "0 4px 24px rgba(0,0,0,.4)", animation: "popIn .3s ease", display: "flex", alignItems: "center", gap: 8 }}>
        <span>{toast.type === "success" ? "✅" : toast.type === "error" ? "❌" : "ℹ️"}</span>{toast.msg}
      </div>}

      {/* Sidebar nav */}
      <div style={{ background: "#16181f", border: "1px solid rgba(255,255,255,.07)", borderRadius: 16, overflow: "hidden" }}>
        <div style={{ padding: "18px 16px", borderBottom: "1px solid rgba(255,255,255,.07)" }}>
          <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 14 }}>⚙️ Settings</div>
          <div style={{ fontSize: 11, color: "#6b7a99", marginTop: 2 }}>{user?.email || "user@email.com"}</div>
        </div>
        {SECTIONS.map(s => (
          <div key={s.id} onClick={() => setSection(s.id)}
            style={{ display: "flex", alignItems: "center", gap: 10, padding: "13px 16px", cursor: "pointer", borderLeft: `3px solid ${section === s.id ? "#4f8ef7" : "transparent"}`, background: section === s.id ? "rgba(79,142,247,.08)" : "transparent", transition: "all .2s" }}
            onMouseEnter={e => { if (section !== s.id) e.currentTarget.style.background = "rgba(255,255,255,.03)"; }}
            onMouseLeave={e => { if (section !== s.id) e.currentTarget.style.background = "transparent"; }}>
            <span style={{ fontSize: 18 }}>{s.icon}</span>
            <span style={{ fontSize: 13, fontWeight: section === s.id ? 700 : 500, color: section === s.id ? "#f0f2f8" : "#9aa5bc" }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Content */}
      <div>
        {/* ── SECURITY ── */}
        {section === "security" && (<>
          {/* Change password */}
          <Card title="🔑 Change Password" sub="Use a strong password with at least 8 characters">
            <Field label="Current Password" value={oldPass} set={setOldPass} type="password" placeholder="Enter current password" />
            <Field label="New Password" value={newPass} set={setNewPass} type="password" placeholder="Min 8 characters" />
            <Field label="Confirm New Password" value={confPass} set={setConfPass} type="password" placeholder="Repeat new password" />
            {pwMsg && <div style={{ padding: "9px 13px", borderRadius: 9, background: pwMsg.t === "success" ? "rgba(16,185,129,.1)" : pwMsg.t === "error" ? "rgba(244,63,94,.1)" : "rgba(79,142,247,.1)", border: `1px solid ${pwMsg.t === "success" ? "rgba(16,185,129,.3)" : pwMsg.t === "error" ? "rgba(244,63,94,.3)" : "rgba(79,142,247,.3)"}`, fontSize: 12, color: pwMsg.t === "success" ? "#10b981" : pwMsg.t === "error" ? "#f43f5e" : "#4f8ef7", marginBottom: 14 }}>{pwMsg.m}</div>}
            <button onClick={changePw} disabled={changingPw} style={{ padding: "10px 24px", borderRadius: 10, background: "linear-gradient(135deg,#4f8ef7,#7c3aed)", color: "#fff", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 700, opacity: changingPw ? .7 : 1 }}>
              {changingPw ? "Changing…" : "Update Password"}
            </button>
          </Card>

          {/* Social logins */}
          <Card title="🔗 Connected Accounts" sub="Link social accounts for one-click sign-in">
            {[{ icon: "🔵", label: "Google", hint: "connect backend: POST /api/auth/google", connected: false, color: "#4285f4" },
            { icon: "⚫", label: "GitHub", hint: "connect backend: POST /api/auth/github", connected: false, color: "#333" }].map((p, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 14px", borderRadius: 12, border: "1px solid rgba(255,255,255,.07)", background: "#1e2130", marginBottom: 10 }}>
                <span style={{ fontSize: 22 }}>{p.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{p.label}</div>
                  <div style={{ fontSize: 11, color: "#6b7a99", fontFamily: "'JetBrains Mono',monospace" }}>{p.hint}</div>
                </div>
                <button style={{ padding: "6px 16px", borderRadius: 9, background: p.connected ? "rgba(244,63,94,.12)" : "rgba(79,142,247,.12)", border: `1px solid ${p.connected ? "rgba(244,63,94,.3)" : "rgba(79,142,247,.3)"}`, color: p.connected ? "#f43f5e" : "#4f8ef7", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>
                  {p.connected ? "Disconnect" : "Connect"}
                </button>
              </div>
            ))}
          </Card>

          {/* 2FA */}
          <Card title="🛡️ Two-Factor Authentication" sub="Add a second layer of protection to your account">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: twoFAQR ? 16 : 0 }}>
              <div>
                <div style={{ fontSize: 13, color: twoFA ? "#10b981" : "#9aa5bc", fontWeight: 600, marginBottom: 4 }}>{twoFA ? "✅ Enabled" : "⚪ Disabled"}</div>
                <div style={{ fontSize: 12, color: "#6b7a99" }}>Authenticator app (TOTP)</div>
              </div>
              <button onClick={toggle2FA} disabled={twoFALoading}
                style={{ padding: "8px 20px", borderRadius: 10, background: twoFA ? "rgba(244,63,94,.12)" : "linear-gradient(135deg,#10b981,#059669)", border: twoFA ? "1px solid rgba(244,63,94,.3)" : "none", color: twoFA ? "#f43f5e" : "#fff", cursor: "pointer", fontSize: 13, fontWeight: 700, opacity: twoFALoading ? .7 : 1 }}>
                {twoFALoading ? "Loading…" : twoFA ? "Disable 2FA" : "Enable 2FA"}
              </button>
            </div>
            {twoFAQR && (
              <div style={{ padding: "16px", borderRadius: 12, background: "rgba(16,185,129,.07)", border: "1px solid rgba(16,185,129,.2)" }}>
                <div style={{ fontSize: 12, color: "#10b981", marginBottom: 10, fontWeight: 600 }}>Scan QR code with your authenticator app</div>
                <div style={{ width: 120, height: 120, background: "rgba(255,255,255,.1)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10 }}>
                  <span style={{ fontSize: 11, color: "#6b7a99", textAlign: "center" }}>QR from<br />backend</span>
                </div>
                <input value={twoFACode} onChange={e => setTwoFACode(e.target.value)} placeholder="Enter 6-digit code"
                  style={{ width: "100%", maxWidth: 200, padding: "8px 12px", borderRadius: 9, border: "1px solid rgba(16,185,129,.3)", background: "#1e2130", color: "#f0f2f8", fontSize: 14, outline: "none", fontFamily: "'JetBrains Mono',monospace", marginBottom: 10 }} />
                <button onClick={() => showToast("Link POST /api/auth/verify-2fa to verify", "info")}
                  style={{ padding: "8px 18px", borderRadius: 9, background: "linear-gradient(135deg,#10b981,#059669)", color: "#fff", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 700 }}>Verify & Enable</button>
              </div>
            )}
          </Card>

          {/* Logout all */}
          <Card title="🚪 Logout All Devices" sub="End all active sessions across all your devices">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ fontSize: 13, color: "#9aa5bc", lineHeight: 1.6, maxWidth: 340 }}>You will be logged out from all browsers and devices. You'll need to sign in again everywhere.</div>
              <button onClick={logoutAll} disabled={logoutAllLoading}
                style={{ padding: "10px 22px", borderRadius: 10, background: "rgba(244,63,94,.12)", border: "1px solid rgba(244,63,94,.35)", color: "#f43f5e", cursor: "pointer", fontSize: 13, fontWeight: 700, flexShrink: 0, opacity: logoutAllLoading ? .7 : 1 }}>
                {logoutAllLoading ? "Logging out…" : "Logout All Devices"}
              </button>
            </div>
          </Card>
        </>)}

        {/* ── DEVICES ── */}
        {section === "devices" && (<>
          <Card title="📱 Active Devices" sub="Devices currently signed into your account">
            {DEVICES.map((d, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderRadius: 13, border: `1px solid ${d.current ? "rgba(79,142,247,.3)" : "rgba(255,255,255,.07)"}`, background: d.current ? "rgba(79,142,247,.06)" : "#1e2130", marginBottom: 10 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: d.current ? "rgba(79,142,247,.18)" : "rgba(255,255,255,.06)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{d.icon}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#f0f2f8" }}>{d.name}</span>
                    {d.current && <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 99, background: "rgba(79,142,247,.2)", color: "#4f8ef7", fontFamily: "'JetBrains Mono',monospace" }}>THIS DEVICE</span>}
                  </div>
                  <div style={{ fontSize: 11, color: "#6b7a99" }}>📍 {d.loc} · Last active: {d.last}</div>
                </div>
                {!d.current && (
                  <button onClick={() => removeDevice(d.id)}
                    style={{ padding: "6px 14px", borderRadius: 9, background: "rgba(244,63,94,.1)", border: "1px solid rgba(244,63,94,.3)", color: "#f43f5e", cursor: "pointer", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                    Remove
                  </button>
                )}
              </div>
            ))}
            <div style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(79,142,247,.06)", border: "1px solid rgba(79,142,247,.15)", fontSize: 12, color: "#6b7a99", marginTop: 4 }}>
              Connect <code style={{ color: "#4f8ef7", fontSize: 11 }}>GET /api/auth/devices</code> for live device data
            </div>
          </Card>

          <Card title="🕐 Last Login Info">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {[{ label: "Last Login", value: "Today · 09:14 AM", icon: "🕐" },
              { label: "Login Location", value: "Bengaluru, IN", icon: "📍" },
              { label: "Login Device", value: "Chrome · Windows 11", icon: "🖥️" },
              { label: "IP Address", value: "103.xx.xx.xx (masked)", icon: "🌐" }].map((s, i) => (
                <div key={i} style={{ padding: "13px 14px", borderRadius: 11, background: "#1e2130", border: "1px solid rgba(255,255,255,.07)" }}>
                  <div style={{ fontSize: 16, marginBottom: 6 }}>{s.icon}</div>
                  <div style={{ fontSize: 10, color: "#6b7a99", fontFamily: "'JetBrains Mono',monospace", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 4 }}>{s.label}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#f0f2f8" }}>{s.value}</div>
                </div>
              ))}
            </div>
          </Card>
        </>)}

        {/* ── ADVANCED ── */}
        {section === "advanced" && (<>
          {/* Login history */}
          <Card title="📋 Login History" sub="Recent account activity and security events">
            {LOGIN_HISTORY.map((h, i) => (
              <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "11px 0", borderBottom: i < LOGIN_HISTORY.length - 1 ? "1px solid rgba(255,255,255,.05)" : "none" }}>
                <div style={{ width: 32, height: 32, borderRadius: 9, flexShrink: 0, background: h.status === "alert" ? "rgba(244,63,94,.15)" : "rgba(16,185,129,.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>{h.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: h.status === "alert" ? "#f43f5e" : "#f0f2f8" }}>{h.event}</span>
                    <span style={{ fontSize: 10, color: "#6b7a99", fontFamily: "'JetBrains Mono',monospace" }}>{h.time}</span>
                  </div>
                  <div style={{ fontSize: 11, color: "#9aa5bc" }}>{h.device} · {h.loc}</div>
                </div>
              </div>
            ))}
            <div style={{ marginTop: 12, padding: "8px 12px", borderRadius: 9, background: "rgba(79,142,247,.06)", border: "1px solid rgba(79,142,247,.15)", fontSize: 11, color: "#6b7a99" }}>
              Connect <code style={{ color: "#4f8ef7", fontSize: 10 }}>GET /api/auth/login-history</code> for real data
            </div>
          </Card>

          {/* Suspicious alerts */}
          <Card title="⚠️ Suspicious Activity Alerts" sub="We detected 1 unusual login attempt">
            <div style={{ padding: "14px 16px", borderRadius: 12, background: "rgba(244,63,94,.07)", border: "1px solid rgba(244,63,94,.25)", marginBottom: 14 }}>
              <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <span style={{ fontSize: 20, flexShrink: 0 }}>🚨</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#f43f5e", marginBottom: 4 }}>Failed login from Lagos, Nigeria</div>
                  <div style={{ fontSize: 12, color: "#9aa5bc", marginBottom: 8 }}>2 days ago · Unknown device · IP: 197.xx.xx.xx</div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button style={{ padding: "6px 14px", borderRadius: 9, background: "rgba(244,63,94,.15)", border: "1px solid rgba(244,63,94,.35)", color: "#f43f5e", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>Block IP</button>
                    <button style={{ padding: "6px 14px", borderRadius: 9, background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)", color: "#9aa5bc", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>Dismiss</button>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Email alerts + session timeout */}
          <Card title="🔔 Notifications & Session" sub="Control how we alert you about account activity">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 0", borderBottom: "1px solid rgba(255,255,255,.06)" }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>Email alerts for new logins</div>
                <div style={{ fontSize: 11, color: "#6b7a99" }}>Get notified when someone signs in from a new device</div>
              </div>
              <div onClick={() => setEmailAlerts(!emailAlerts)} style={{ width: 44, height: 24, borderRadius: 99, background: emailAlerts ? "#4f8ef7" : "rgba(255,255,255,.15)", cursor: "pointer", position: "relative", transition: "background .2s", flexShrink: 0 }}>
                <div style={{ position: "absolute", top: 3, left: emailAlerts ? 22 : 3, width: 18, height: 18, borderRadius: "50%", background: "#fff", transition: "left .2s", boxShadow: "0 1px 4px rgba(0,0,0,.3)" }} />
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 0" }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>Session timeout</div>
                <div style={{ fontSize: 11, color: "#6b7a99" }}>Auto-logout after inactivity</div>
              </div>
              <select value={sessionTimeout} onChange={e => setSessionTimeout(e.target.value)}
                style={{ padding: "7px 12px", borderRadius: 9, border: "1px solid rgba(255,255,255,.12)", background: "#1e2130", color: "#f0f2f8", fontSize: 13, outline: "none", cursor: "pointer" }}>
                {[["15", "15 minutes"], ["30", "30 minutes"], ["60", "1 hour"], ["240", "4 hours"], ["0", "Never"]].map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
          </Card>

          {/* Data export */}
          <Card title="📦 Export My Data" sub="Download a copy of all your Skillio data">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ fontSize: 13, color: "#9aa5bc", maxWidth: 340, lineHeight: 1.6 }}>Includes your courses, quiz history, progress, messages, and account info in JSON format.</div>
              <button onClick={exportData} disabled={exportLoading}
                style={{ padding: "10px 22px", borderRadius: 10, background: "rgba(16,185,129,.12)", border: "1px solid rgba(16,185,129,.35)", color: "#10b981", cursor: "pointer", fontSize: 13, fontWeight: 700, flexShrink: 0, opacity: exportLoading ? .7 : 1 }}>
                {exportLoading ? "Preparing…" : "📥 Export Data"}
              </button>
            </div>
          </Card>
        </>)}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   EXACT SKILLIO COLOUR PALETTE (from screenshots)
   bg:        #0d0e1a  (deep navy)
   card:      #13142a / #1a1b2e
   border:    #252640
   purple:    #7c6fe0  (primary accent – button, active nav)
   violet:    #9b8ef8
   gold:      #f5a623  (streaks, XP)
   green:     #00e5a0  (quiz score)
   text:      #e2e2f0
   muted:     #6b6d8a
───────────────────────────────────────── */

const C = {
  bg: "#0d0e1a",
  card: "#13142a",
  card2: "#1a1b2e",
  border: "#252640",
  borderHover: "#3d3f6a",
  purple: "#7c6fe0",
  purpleLight: "#9b8ef8",
  purpleGrad: "linear-gradient(135deg, #7c6fe0 0%, #9b8ef8 100%)",
  gold: "#f5a623",
  green: "#00e5a0",
  text: "#e2e2f0",
  muted: "#6b6d8a",
  mutedLight: "#9496b8",
  danger: "#ff6b8a",
  dangerBg: "#1e1020",
};

/* ─── LOADING ANIMATION ─────────────────── */
const LOADING_STEPS = [
  "Analysing your learning goal…",
  "Building your 50-day roadmap…",
  "Structuring daily milestones…",
  "Optimising for your level…",
  "Almost ready…",
];

function LoadingAnimation({ goal, level }) {
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(Array(10).fill(false));

  useEffect(() => {
    const t = setInterval(() => setStep((s) => (s + 1) % LOADING_STEPS.length), 1800);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    Array.from({ length: 10 }).forEach((_, i) => {
      setTimeout(() => {
        setVisible((v) => { const n = [...v]; n[i] = true; return n; });
      }, i * 120);
    });
  }, []);

  const orbitIcons = ["📅", "⚡", "🎯", "📝", "🧠", "🚀"];

  return (
    <div style={{ textAlign: "center", padding: "64px 20px", maxWidth: "600px", margin: "0 auto" }}>
      {/* Orbiting icons around central calendar */}
      <div style={{ position: "relative", width: "140px", height: "140px", margin: "0 auto 36px" }}>
        <div style={{
          position: "absolute", inset: 0,
          background: `radial-gradient(circle, ${C.purple}28 0%, transparent 70%)`,
          borderRadius: "50%",
          animation: "pulse-glow 2s ease-in-out infinite",
        }} />
        <div style={{
          position: "absolute", inset: "28px",
          background: `linear-gradient(135deg, #1e1f3a, #252650)`,
          border: `1.5px solid ${C.purple}60`,
          borderRadius: "50%",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "32px",
          boxShadow: `0 0 32px ${C.purple}40`,
          animation: "float 3s ease-in-out infinite",
        }}>
          🗓️
        </div>
        {orbitIcons.map((icon, i) => {
          const angle = (i / 6) * 360;
          const rad = (angle * Math.PI) / 180;
          const r = 56;
          const x = 70 + r * Math.cos(rad) - 14;
          const y = 70 + r * Math.sin(rad) - 14;
          return (
            <div key={i} style={{
              position: "absolute", left: x, top: y,
              width: "28px", height: "28px",
              background: `linear-gradient(135deg, ${C.card2}, #252650)`,
              border: `1px solid ${C.purple}50`,
              borderRadius: "8px",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "13px",
              opacity: visible[i] ? 1 : 0,
              transition: "opacity 0.4s",
              boxShadow: `0 2px 8px ${C.purple}30`,
            }}>
              {icon}
            </div>
          );
        })}
      </div>

      {/* Day chips */}
      <div style={{ display: "flex", justifyContent: "center", gap: "8px", flexWrap: "wrap", marginBottom: "28px" }}>
        {Array.from({ length: 10 }, (_, i) => (
          <div key={i} style={{
            background: `linear-gradient(135deg, ${C.card2}, #1e1f3a)`,
            border: `1px solid ${C.purple}${visible[i] ? "55" : "18"}`,
            borderRadius: "20px",
            padding: "4px 12px",
            fontSize: "11px",
            color: visible[i] ? C.purpleLight : C.muted,
            fontWeight: 600,
            transition: "all 0.4s",
            opacity: visible[i] ? 1 : 0.3,
            transform: visible[i] ? "translateY(0)" : "translateY(6px)",
            letterSpacing: "0.04em",
          }}>
            Day {(i + 1) * 5}
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div style={{ height: "3px", background: C.border, borderRadius: "2px", maxWidth: "320px", margin: "0 auto 20px", overflow: "hidden" }}>
        <div style={{ height: "100%", background: C.purpleGrad, borderRadius: "2px", animation: "loading-bar 8s ease-in-out forwards" }} />
      </div>

      <p style={{ fontSize: "17px", fontWeight: 600, color: C.text, marginBottom: "8px" }}>
        {LOADING_STEPS[step]}
      </p>
      <p style={{ color: C.muted, fontSize: "13px", lineHeight: 1.7 }}>
        Crafting a personalised plan for{" "}
        <span style={{ color: C.purpleLight, fontWeight: 600 }}>{goal}</span>
        {" "}· {level} level
      </p>
    </div>
  );
}

/* ─── CUSTOM DROPDOWN ───────────────────── */
const LEVELS = [
  { value: "Beginner", icon: "🌱", desc: "Just starting out" },
  { value: "Intermediate", icon: "⚡", desc: "Some experience" },
  { value: "Advanced", icon: "🚀", desc: "Expert level" },
];

function LevelDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const selected = LEVELS.find((l) => l.value === value);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          background: C.bg,
          border: `1.5px solid ${open ? C.purple : C.border}`,
          borderRadius: "12px",
          padding: "0 18px",
          height: "52px",
          color: C.text,
          fontSize: "14px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          fontFamily: "inherit",
          fontWeight: 500,
          minWidth: "190px",
          transition: "border-color 0.2s, box-shadow 0.2s",
          boxShadow: open ? `0 0 0 3px ${C.purple}25` : "none",
          whiteSpace: "nowrap",
        }}
      >
        <span style={{ fontSize: "18px" }}>{selected?.icon}</span>
        <span style={{ flex: 1, textAlign: "left" }}>{selected?.value}</span>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s", flexShrink: 0 }}>
          <polyline points="6 9 12 15 18 9" stroke={C.muted} strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </button>

      {open && (
        <div style={{
          position: "absolute",
          top: "calc(100% + 8px)",
          left: 0,
          right: 0,
          background: "#16172e",
          border: `1.5px solid ${C.purple}50`,
          borderRadius: "14px",
          overflow: "hidden",
          zIndex: 100,
          boxShadow: `0 16px 48px rgba(0,0,0,0.6), 0 0 0 1px ${C.purple}15`,
          animation: "dropIn 0.18s ease",
        }}>
          {LEVELS.map((l) => (
            <div
              key={l.value}
              onClick={() => { onChange(l.value); setOpen(false); }}
              style={{
                padding: "13px 18px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                cursor: "pointer",
                background: l.value === value ? `${C.purple}18` : "transparent",
                borderLeft: l.value === value ? `3px solid ${C.purple}` : "3px solid transparent",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => { if (l.value !== value) e.currentTarget.style.background = `${C.purple}10`; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = l.value === value ? `${C.purple}18` : "transparent"; }}
            >
              <span style={{ fontSize: "20px" }}>{l.icon}</span>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontWeight: 600, color: l.value === value ? C.purpleLight : C.text, fontSize: "14px" }}>
                  {l.value}
                </p>
                <p style={{ margin: 0, fontSize: "11px", color: C.muted }}>{l.desc}</p>
              </div>
              {l.value === value && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <polyline points="20 6 9 17 4 12" stroke={C.purple} strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── PARSE GEMINI RESPONSE ─────────────── */
function parsePlan(raw) {
  if (Array.isArray(raw)) {
    return raw.map((item, i) => ({
      day: item.day ?? i + 1,
      title: item.title ?? item.topic ?? `Day ${i + 1}`,
      description: item.description ?? item.desc ?? item.content ?? "",
      completed: false,
    }));
  }
  if (typeof raw === "string") {
    const days = [];
    const lines = raw.split("\n").filter(Boolean);
    let current = null;
    for (const line of lines) {
      const m = line.match(/day\s*(\d+)[:\-\u2013]?\s*(.*)/i);
      if (m) {
        if (current) days.push(current);
        current = { day: parseInt(m[1]), title: m[2].trim() || `Day ${m[1]}`, description: "", completed: false };
      } else if (current && line.trim().length > 0) {
        current.description += (current.description ? " " : "") + line.trim();
      }
    }
    if (current) days.push(current);
    if (days.length > 0) return days;
    return lines.filter((l) => /^\d+\./.test(l)).map((l, i) => ({
      day: i + 1,
      title: l.replace(/^\d+\.\s*/, "").split(":")[0].trim(),
      description: l.replace(/^\d+\.\s*/, "").split(":").slice(1).join(":").trim(),
      completed: false,
    }));
  }
  return [];
}

/* ─── MAIN COMPONENT ────────────────────── */
function AdaptiveLearningPlan() {
  const [goal, setGoal] = useState("Java");
  const [level, setLevel] = useState("Beginner");
  const [plan, setPlan] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("All");

  const completedCount = plan.filter((d) => d.completed).length;
  const pct = plan.length ? Math.round((completedCount / plan.length) * 100) : 0;
  const currentDayIndex = plan.findIndex((d) => !d.completed);
  const filteredPlan = filter === "All" ? plan : filter === "Completed" ? plan.filter((d) => d.completed) : plan.filter((d) => !d.completed);

  async function generatePlan() {
    if (!goal.trim()) return;
    setLoading(true);
    setError(null);
    setPlan([]);
    try {
      const res = await fetch("http://localhost:5010/api/adaptive-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal: goal.trim(), level }),
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      const raw = data.plan ?? data.days ?? data.curriculum ?? data.result ?? data;
      const parsed = parsePlan(raw);
      if (!parsed.length) throw new Error("No plan data received from server.");
      setPlan(parsed);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function toggleComplete(idx) {
    setPlan((prev) => prev.map((d, i) => (i === idx ? { ...d, completed: !d.completed } : d)));
  }

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "'DM Sans', 'Inter', sans-serif", padding: "40px 48px", boxSizing: "border-box" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;1,700&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50%       { opacity: 1; transform: scale(1.1); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-6px); }
        }
        @keyframes loading-bar {
          0%   { width: 0%; }
          40%  { width: 60%; }
          75%  { width: 82%; }
          95%  { width: 93%; }
          100% { width: 97%; }
        }
        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .day-card:hover {
          transform: translateY(-3px) !important;
          border-color: ${C.purple}60 !important;
          box-shadow: 0 12px 40px rgba(124,111,224,0.15) !important;
        }
        .generate-btn:hover:not(:disabled) { opacity: 0.88 !important; transform: translateY(-1px) !important; box-shadow: 0 8px 32px ${C.purple}70 !important; }
        .generate-btn:active:not(:disabled) { transform: translateY(0) !important; }
        .goal-input:focus { border-color: ${C.purple} !important; box-shadow: 0 0 0 3px ${C.purple}25 !important; outline: none; }

      `}</style>

      {/* ── HEADER ── */}
      <div style={{ textAlign: "center", marginBottom: "44px" }}>
        <p style={{ letterSpacing: "0.22em", fontSize: "10px", fontWeight: 700, color: C.purple, textTransform: "uppercase", marginBottom: "14px", margin: "0 0 14px" }}>
          Adaptive Learning
        </p>
        <h1 style={{ fontSize: "clamp(2rem, 3.8vw, 3rem)", fontWeight: 700, color: C.text, lineHeight: 1.15, margin: "0 0 14px", letterSpacing: "-0.02em" }}>
          Your <span style={{ fontStyle: "italic", color: C.purpleLight }}>personalised</span> 50-day plan.
        </h1>
        <p style={{ color: C.muted, fontSize: "15px", lineHeight: 1.7, maxWidth: "440px", margin: "0 auto" }}>
          Enter a goal, choose your level — receive a structured daily curriculum tailored to you.
        </p>
      </div>

      {/* ── FORM CARD ── */}
      <div style={{
        background: `linear-gradient(135deg, ${C.card} 0%, ${C.card2} 100%)`,
        border: `1px solid ${C.border}`,
        borderRadius: "20px",
        padding: "28px 32px",
        maxWidth: "860px",
        margin: "0 auto 36px",
        boxShadow: "0 8px 48px rgba(0,0,0,0.4)",
      }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: "16px", alignItems: "end" }}>

          {/* Goal input */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label style={{ fontSize: "10px", letterSpacing: "0.16em", fontWeight: 700, color: C.muted, textTransform: "uppercase" }}>
              Learning Goal
            </label>
            <input
              className="goal-input"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && generatePlan()}
              placeholder="e.g. Java, Machine Learning, DSA…"
              style={{
                background: C.bg,
                border: `1.5px solid ${C.border}`,
                borderRadius: "12px",
                padding: "0 18px",
                height: "52px",
                color: C.text,
                fontSize: "15px",
                fontFamily: "inherit",
                width: "100%",
                boxSizing: "border-box",
                transition: "border-color 0.2s, box-shadow 0.2s",
              }}
            />
          </div>

          {/* Level dropdown */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label style={{ fontSize: "10px", letterSpacing: "0.16em", fontWeight: 700, color: C.muted, textTransform: "uppercase" }}>
              Level
            </label>
            <LevelDropdown value={level} onChange={setLevel} />
          </div>

          {/* Generate button */}
          <button
            className="generate-btn"
            onClick={generatePlan}
            disabled={loading}
            style={{
              background: loading ? "#2a2b4a" : C.purpleGrad,
              color: "#fff",
              border: "none",
              borderRadius: "12px",
              padding: "0 28px",
              height: "52px",
              fontWeight: 700,
              fontSize: "14px",
              cursor: loading ? "not-allowed" : "pointer",
              fontFamily: "inherit",
              letterSpacing: "0.02em",
              transition: "opacity 0.2s, transform 0.15s, box-shadow 0.2s",
              whiteSpace: "nowrap",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              boxShadow: loading ? "none" : `0 4px 20px ${C.purple}55`,
              alignSelf: "flex-end",
            }}
          >
            {loading ? (
              <>
                <div style={{ width: "14px", height: "14px", border: "2px solid #ffffff30", borderTop: "2px solid #fff", borderRadius: "50%", animation: "spin 0.8s linear infinite", flexShrink: 0 }} />
                Generating…
              </>
            ) : (
              <>⚡ Generate Plan</>
            )}
          </button>
        </div>
      </div>

      {/* ── PROGRESS ── */}
      {plan.length > 0 && (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: "860px", margin: "0 auto 12px" }}>
            <p style={{ margin: 0, fontSize: "15px", color: C.muted }}>
              <span style={{ fontWeight: 700, fontSize: "26px", color: C.text }}>{completedCount}</span>
              <span style={{ fontStyle: "italic", margin: "0 6px", color: C.muted }}>of</span>
              <span style={{ fontWeight: 700, fontSize: "26px", color: C.text }}>{plan.length}</span>
              <span style={{ marginLeft: "8px" }}>days completed</span>
            </p>
            <span style={{ fontWeight: 700, fontSize: "15px", color: C.purple, letterSpacing: "0.06em" }}>{pct}%</span>
          </div>
          <div style={{ height: "4px", background: C.border, borderRadius: "3px", maxWidth: "860px", margin: "0 auto 24px", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${pct}%`, background: C.purpleGrad, borderRadius: "3px", transition: "width 0.6s ease" }} />
          </div>
        </>
      )}

      {/* ── FILTERS ── */}
      {plan.length > 0 && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: "860px", margin: "0 auto 20px" }}>
          <span style={{ fontSize: "11px", color: C.muted, letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 600 }}>
            {filteredPlan.length} days shown
          </span>
          <div style={{ display: "flex", gap: "6px" }}>
            {["All", "Pending", "Completed"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  background: filter === f ? C.purpleGrad : "transparent",
                  color: filter === f ? "#fff" : C.muted,
                  border: filter === f ? "none" : `1px solid ${C.border}`,
                  borderRadius: "8px",
                  padding: "7px 16px",
                  fontSize: "13px",
                  fontWeight: filter === f ? 700 : 500,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  transition: "all 0.15s",
                  boxShadow: filter === f ? `0 2px 12px ${C.purple}40` : "none",
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── LOADING ANIMATION ── */}
      {loading && <LoadingAnimation goal={goal} level={level} />}

      {/* ── ERROR ── */}
      {error && !loading && (
        <div style={{
          background: C.dangerBg,
          border: `1px solid ${C.danger}40`,
          borderRadius: "16px",
          padding: "24px 28px",
          maxWidth: "860px",
          margin: "0 auto",
          display: "flex",
          alignItems: "flex-start",
          gap: "16px",
        }}>
          <span style={{ fontSize: "22px", flexShrink: 0 }}>⚠️</span>
          <div>
            <p style={{ margin: "0 0 6px", fontWeight: 700, color: C.danger, fontSize: "15px" }}>Failed to generate plan</p>
            <p style={{ margin: 0, color: "#9a7080", fontSize: "13px", lineHeight: 1.6 }}>{error}</p>
            <button onClick={generatePlan} style={{
              marginTop: "12px",
              background: "transparent",
              border: `1px solid ${C.danger}40`,
              color: C.danger,
              borderRadius: "8px",
              padding: "6px 16px",
              fontSize: "12px",
              cursor: "pointer",
              fontFamily: "inherit",
              fontWeight: 600,
            }}>
              Retry
            </button>
          </div>
        </div>
      )}

      {/* ── EMPTY STATE ── */}
      {!loading && !error && plan.length === 0 && (
        <div style={{ textAlign: "center", padding: "72px 20px", maxWidth: "860px", margin: "0 auto" }}>
          <div style={{
            width: "80px", height: "80px",
            background: `linear-gradient(135deg, ${C.card}, ${C.card2})`,
            border: `1px solid ${C.border}`,
            borderRadius: "24px",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "36px",
            margin: "0 auto 24px",
            boxShadow: `0 8px 32px rgba(0,0,0,0.4)`,
          }}>
            📅
          </div>
          <p style={{ fontWeight: 700, fontSize: "20px", color: C.text, margin: "0 0 10px" }}>No plan generated yet</p>
          <p style={{ color: C.muted, fontSize: "14px", lineHeight: 1.7, maxWidth: "340px", margin: "0 auto" }}>
            Enter your learning goal above and hit{" "}
            <span style={{ color: C.purpleLight, fontWeight: 600 }}>⚡ Generate Plan</span>{" "}
            to receive your personalised 50-day roadmap.
          </p>
        </div>
      )}

      {/* ── DAY CARDS ── */}
      {!loading && filteredPlan.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "18px", maxWidth: "860px", margin: "0 auto" }}>
          {filteredPlan.map((day, i) => {
            const realIdx = plan.indexOf(day);
            const isCurrent = realIdx === currentDayIndex;
            return (
              <div
                key={`${day.day}-${i}`}
                className="day-card"
                style={{
                  background: day.completed
                    ? `linear-gradient(135deg, #131d16, #111a14)`
                    : isCurrent
                      ? `linear-gradient(135deg, #1a1b30, #1e1f3c)`
                      : `linear-gradient(135deg, ${C.card}, ${C.card2})`,
                  border: `1px solid ${day.completed ? "#2a4030" : isCurrent ? `${C.purple}55` : C.border
                    }`,
                  borderRadius: "18px",
                  padding: "22px",
                  position: "relative",
                  overflow: "hidden",
                  transition: "transform 0.18s, border-color 0.18s, box-shadow 0.18s",
                  cursor: "pointer",
                  animation: "fadeUp 0.35s ease both",
                  animationDelay: `${Math.min(i * 0.04, 0.8)}s`,
                }}
              >
                {/* Purple top line for current */}
                {isCurrent && (
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: C.purpleGrad }} />
                )}
                {/* Subtle glow bg */}
                {isCurrent && (
                  <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at top, ${C.purple}08 0%, transparent 60%)`, pointerEvents: "none" }} />
                )}

                {/* Top row */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                  <div style={{
                    background: day.completed ? "#1e3a28" : isCurrent ? C.purpleGrad : `${C.purple}20`,
                    color: day.completed ? "#5ec87a" : isCurrent ? "#fff" : C.purpleLight,
                    borderRadius: "20px",
                    padding: "5px 14px",
                    fontSize: "12px",
                    fontWeight: 700,
                    letterSpacing: "0.04em",
                  }}>
                    Day {day.day}
                  </div>
                  {isCurrent && <span style={{ fontSize: "10px", letterSpacing: "0.16em", fontWeight: 700, color: C.purple, textTransform: "uppercase" }}>Current</span>}
                  {day.completed && <span style={{ fontSize: "10px", letterSpacing: "0.12em", fontWeight: 700, color: "#5ec87a", textTransform: "uppercase" }}>✓ Done</span>}
                </div>

                <p style={{ fontSize: "16px", fontWeight: 700, color: C.text, margin: "0 0 8px", lineHeight: 1.3, letterSpacing: "-0.01em" }}>
                  {day.title}
                </p>
                <p style={{ fontSize: "13px", color: C.mutedLight, lineHeight: 1.65, margin: "0 0 20px" }}>
                  {day.description || "Complete this day's tasks to progress to the next milestone."}
                </p>

                {/* Footer */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }} onClick={() => toggleComplete(realIdx)}>
                  <div style={{
                    width: "17px", height: "17px",
                    borderRadius: "5px",
                    border: day.completed ? "none" : `1.5px solid ${C.border}`,
                    background: day.completed ? "linear-gradient(135deg, #5ec87a, #3aaa5a)" : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all 0.15s",
                    flexShrink: 0,
                  }}>
                    {day.completed && (
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  <span style={{ fontSize: "12px", color: C.muted, fontWeight: 500 }}>Mark complete</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}


/* ══════════════════════════════════════════════════════════
   CODE EXECUTION VISUALIZER
══════════════════════════════════════════════════════════ */
const CV_SAMPLES = {
  fibonacci: {
    python: `def fibonacci(n):\n    a, b = 0, 1\n    result = []\n    for i in range(n):\n        result.append(a)\n        a, b = b, a + b\n    return result\n\nnums = fibonacci(7)\nprint(nums)`,
    java: `public class Fibonacci {\n    public static void main(String[] args) {\n        int n = 7;\n        int a = 0, b = 1;\n        for (int i = 0; i < n; i++) {\n            System.out.print(a + " ");\n            int temp = a + b;\n            a = b;\n            b = temp;\n        }\n    }\n}`,
  },
  loop: {
    python: `total = 0\nnumbers = [1, 2, 3, 4, 5]\n\nfor num in numbers:\n    total += num\n\naverage = total / len(numbers)\nprint(f"Sum: {total}, Average: {average}")`,
    java: `public class LoopDemo {\n    public static void main(String[] args) {\n        int total = 0;\n        int[] numbers = {1, 2, 3, 4, 5};\n        for (int num : numbers) {\n            total += num;\n        }\n        double avg = (double) total / numbers.length;\n        System.out.println("Sum: " + total + ", Avg: " + avg);\n    }\n}`,
  },
  sort: {
    python: `arr = [64, 34, 25, 12, 22, 11, 90]\nn = len(arr)\n\nfor i in range(n):\n    for j in range(0, n-i-1):\n        if arr[j] > arr[j+1]:\n            arr[j], arr[j+1] = arr[j+1], arr[j]\n\nprint("Sorted:", arr)`,
    java: `public class BubbleSort {\n    public static void main(String[] args) {\n        int[] arr = {64, 34, 25, 12, 22};\n        int n = arr.length;\n        for (int i = 0; i < n-1; i++) {\n            for (int j = 0; j < n-i-1; j++) {\n                if (arr[j] > arr[j+1]) {\n                    int temp = arr[j];\n                    arr[j] = arr[j+1];\n                    arr[j+1] = temp;\n                }\n            }\n        }\n        System.out.println("Done");\n    }\n}`,
  },
};

const CV_SPEED_MAP = { 1: 2000, 2: 1000, 3: 600, 4: 300, 5: 100 };
const cvEscHtml = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function CVCodeDisplay({ lines, activeLineIndex }) {
  return (
    <div style={{ padding: "10px 0", height: "100%", overflowY: "auto" }}>
      {lines.map((line, i) => {
        const active = i === activeLineIndex;
        return (
          <div key={i} style={{ display: "flex", alignItems: "flex-start", padding: "0 16px", background: active ? "rgba(124,108,240,0.1)" : "transparent", borderLeft: active ? "3px solid #7c6cf0" : "3px solid transparent" }}>
            <span style={{ width: 32, color: active ? "#7c6cf0" : "#606075", fontSize: 12, flexShrink: 0, paddingTop: 2, fontFamily: "JetBrains Mono, monospace", userSelect: "none" }}>{i + 1}</span>
            <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 13, color: active ? "#e8e8f0" : "#c0c0d8", whiteSpace: "pre", lineHeight: 1.8, flex: 1 }} dangerouslySetInnerHTML={{ __html: cvEscHtml(line) }} />
          </div>
        );
      })}
    </div>
  );
}

function CVEmpty({ icon, text }) {
  return (
    <div style={{ textAlign: "center", color: "#606075", fontSize: 12, padding: 40, fontFamily: "JetBrains Mono, monospace" }}>
      <div style={{ fontSize: 28, marginBottom: 8 }}>{icon}</div>{text}
    </div>
  );
}

function CVLabel({ text }) {
  return <div style={{ fontSize: 10, color: "#606075", fontFamily: "JetBrains Mono, monospace", fontWeight: 600, letterSpacing: 0.6, marginBottom: 8 }}>{text}</div>;
}

function CVStepsPanel({ steps, currentStep, onGoTo }) {
  if (!steps.length) return <CVEmpty icon="💡" text="Run your code to see execution steps" />;
  return (
    <>
      {steps.map((s, i) => {
        const active = i === currentStep;
        return (
          <div key={i} onClick={() => onGoTo(i)} style={{ background: active ? "rgba(124,108,240,0.08)" : "#1a1a28", border: `1px solid ${active ? "#7c6cf0" : "#2a2a3d"}`, borderRadius: 12, padding: "12px 14px", marginBottom: 8, cursor: "pointer", position: "relative", transition: "border-color 0.15s" }}>
            {active && <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: "linear-gradient(180deg,#7c6cf0,#9f54ea)", borderRadius: "3px 0 0 3px" }} />}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <div style={{ width: 22, height: 22, borderRadius: 6, background: active ? "#7c6cf0" : "#20202f", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, fontFamily: "JetBrains Mono, monospace", color: active ? "#fff" : "#a0a0b8", flexShrink: 0 }}>{i + 1}</div>
              <span style={{ fontSize: 10, background: "rgba(59,130,246,0.15)", color: "#3b82f6", padding: "2px 7px", borderRadius: 6, fontFamily: "JetBrains Mono, monospace", fontWeight: 500 }}>line {s.lineNumber || "?"}</span>
            </div>
            <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 11, color: "#06b6d4", marginBottom: 6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.line}</div>
            <div style={{ fontSize: 12, color: "#a0a0b8", lineHeight: 1.5 }}>{s.explanation}</div>
          </div>
        );
      })}
    </>
  );
}

function CVVarsPanel({ vars, prevVars }) {
  const keys = Object.keys(vars);
  if (!keys.length) return <CVEmpty icon="📦" text="No variables tracked yet" />;
  return (
    <>
      {keys.map((k) => {
        const prev = prevVars[k];
        const changed = prev !== undefined && JSON.stringify(prev) !== JSON.stringify(vars[k]);
        return (
          <div key={k} style={{ background: "#1a1a28", border: `1px solid ${changed ? "rgba(16,185,129,0.4)" : "#2a2a3d"}`, borderRadius: 10, padding: "10px 12px", marginBottom: 6, display: "flex", alignItems: "center", gap: 10, transition: "border-color 0.2s" }}>
            <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 12, color: "#ec4899", fontWeight: 600, minWidth: 80 }}>{k}</span>
            <span style={{ color: "#606075", fontSize: 11 }}>→</span>
            {changed && (<><span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 11, color: "#606075", textDecoration: "line-through" }}>{JSON.stringify(prev)}</span><span style={{ color: "#606075", fontSize: 11 }}>▶</span></>)}
            <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 12, color: "#10b981", fontWeight: 500, flex: 1, wordBreak: "break-all" }}>{JSON.stringify(vars[k])}</span>
          </div>
        );
      })}
    </>
  );
}

function CVOutputPanel({ finalOutput, error, rawData, showDebug, onToggleDebug }) {
  if (!finalOutput && !error) return <CVEmpty icon="📤" text="Output will appear here after execution" />;
  return (
    <>
      {error && (
        <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 12, padding: 14, marginBottom: 10 }}>
          <CVLabel text="ERROR" />
          <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 12, color: "#ef4444", lineHeight: 1.5 }}>{error}</div>
          {rawData && (
            <div style={{ marginTop: 10 }}>
              <button onClick={onToggleDebug} style={{ background: "none", border: "1px solid #2a2a3d", borderRadius: 6, padding: "4px 10px", color: "#a0a0b8", fontSize: 11, cursor: "pointer" }}>{showDebug ? "Hide" : "Show"} Raw Response</button>
              {showDebug && <pre style={{ marginTop: 8, fontFamily: "JetBrains Mono, monospace", fontSize: 11, color: "#a0a0b8", lineHeight: 1.6, overflowX: "auto", whiteSpace: "pre-wrap", wordBreak: "break-all" }}>{JSON.stringify(rawData, null, 2)}</pre>}
            </div>
          )}
        </div>
      )}
      {finalOutput && (
        <div style={{ background: "#1a1a28", border: "1px solid #2a2a3d", borderRadius: 12, padding: 14, marginBottom: 10 }}>
          <CVLabel text="FINAL OUTPUT" />
          <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 13, color: "#10b981", lineHeight: 1.6, whiteSpace: "pre-wrap", wordBreak: "break-all" }}>{finalOutput}</div>
        </div>
      )}
    </>
  );
}

function CodeVisualizer() {
  const [code, setCode] = useState(CV_SAMPLES.fibonacci.python);
  const [language, setLanguage] = useState("python");
  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [status, setStatus] = useState("idle");
  const [activeTab, setActiveTab] = useState("steps");
  const [rawData, setRawData] = useState(null);
  const [error, setError] = useState(null);
  const [finalOutput, setFinalOutput] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(2);
  const [codeLines, setCodeLines] = useState([]);
  const [showCodeDisplay, setShowCodeDisplay] = useState(false);
  const [prevVars, setPrevVars] = useState({});
  const [showDebug, setShowDebug] = useState(false);

  const playTimerRef = useRef(null);
  const currentStepRef = useRef(currentStep);
  const stepsRef = useRef(steps);
  currentStepRef.current = currentStep;
  stepsRef.current = steps;

  const stopPlay = useCallback(() => { clearTimeout(playTimerRef.current); setPlaying(false); }, []);

  const cvReset = () => {
    setSteps([]); setCurrentStep(-1); setRawData(null); setError(null);
    setFinalOutput(null); setPrevVars({}); setShowCodeDisplay(false);
    setShowDebug(false); stopPlay();
  };

  const tick = useCallback(() => {
    const next = currentStepRef.current + 1;
    if (next >= stepsRef.current.length) { stopPlay(); return; }
    setCurrentStep(next);
    playTimerRef.current = setTimeout(tick, CV_SPEED_MAP[speed]);
  }, [speed, stopPlay]);

  const togglePlay = () => {
    if (playing) { stopPlay(); return; }
    if (!steps.length) return;
    setPlaying(true);
    playTimerRef.current = setTimeout(tick, CV_SPEED_MAP[speed]);
  };

  const explainCode = async () => {
    if (!code.trim()) return;
    cvReset();
    setStatus("loading");
    try {
      const res = await fetch("http://localhost:5007/api/explain", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code, language }) });
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = await res.json();
      setRawData(data);
      const s = data.steps || [];
      setSteps(s); setFinalOutput(data.finalOutput || null); setStatus("done");
      if (s.length > 0) { setCodeLines(code.split("\n")); setShowCodeDisplay(true); setCurrentStep(0); }
    } catch (err) { setError(err.message); setStatus("error"); }
  };

  const copyJSON = () => { if (rawData) navigator.clipboard.writeText(JSON.stringify(rawData, null, 2)); };
  const downloadJSON = () => {
    if (!rawData) return;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([JSON.stringify(rawData, null, 2)], { type: "application/json" }));
    a.download = "execution_trace.json"; a.click();
  };
  const loadSample = (key) => { setCode(CV_SAMPLES[key][language] || CV_SAMPLES[key].python); cvReset(); };

  const activeLineIndex = currentStep >= 0 && steps[currentStep] ? (steps[currentStep].lineNumber || 1) - 1 : -1;
  const currentVars = currentStep >= 0 && steps[currentStep] ? steps[currentStep].variables || {} : {};

  const statusMap = {
    idle: { bg: "rgba(160,160,184,0.12)", color: "#606075", label: "IDLE" },
    loading: { bg: "rgba(245,158,11,0.15)", color: "#f59e0b", label: "ANALYZING" },
    done: { bg: "rgba(16,185,129,0.15)", color: "#10b981", label: "READY" },
    error: { bg: "rgba(239,68,68,0.15)", color: "#ef4444", label: "ERROR" },
  };
  const pill = statusMap[status];

  const ctrlBtn = (disabled) => ({ flex: 1, padding: "7px 0", background: "#1a1a28", border: "1px solid #2a2a3d", borderRadius: 8, color: disabled ? "#606075" : "#a0a0b8", fontSize: 12, cursor: disabled ? "not-allowed" : "pointer", fontFamily: "'DM Sans',sans-serif", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 5, opacity: disabled ? 0.4 : 1 });

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", height: "calc(100vh - 120px)", background: "#0e0e14", color: "#e8e8f0", fontFamily: "'DM Sans',sans-serif", fontSize: 14, overflow: "hidden", borderRadius: 16, border: "1px solid rgba(255,255,255,.07)" }}>
      {/* LEFT: EDITOR */}
      <div style={{ display: "flex", flexDirection: "column", overflow: "hidden", padding: 16 }}>
        <div style={{ background: "#14141e", border: "1px solid #2a2a3d", borderRadius: 16, flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {/* Header */}
          <div style={{ padding: "12px 16px", borderBottom: "1px solid #2a2a3d", display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
            <div style={{ display: "flex", gap: 6 }}>
              {["#ef4444", "#f59e0b", "#10b981"].map(c => <div key={c} style={{ width: 11, height: 11, borderRadius: "50%", background: c }} />)}
            </div>
            <span style={{ fontSize: 11, color: "#606075", fontFamily: "JetBrains Mono, monospace", marginLeft: 4 }}>{language === "python" ? "main.py" : "Main.java"}</span>
            <select value={language} onChange={e => { setLanguage(e.target.value); cvReset(); }} style={{ marginLeft: "auto", background: "#1a1a28", border: "1px solid #2a2a3d", borderRadius: 8, padding: "5px 10px", fontSize: 12, color: "#e8e8f0", outline: "none", cursor: "pointer" }}>
              <option value="python">Python</option>
              <option value="java">Java</option>
            </select>
            <div style={{ display: "flex", gap: 6 }}>
              {[["fibonacci", "Fibonacci"], ["loop", "Loop"], ["sort", "Bubble Sort"]].map(([key, label]) => (
                <button key={key} onClick={() => loadSample(key)} style={{ background: "#1a1a28", border: "1px solid #2a2a3d", borderRadius: 8, padding: "5px 10px", fontSize: 11, color: "#a0a0b8", cursor: "pointer" }}>{label}</button>
              ))}
            </div>
          </div>
          {/* Code area */}
          <div style={{ flex: 1, overflow: "auto", position: "relative" }}>
            {showCodeDisplay
              ? <CVCodeDisplay lines={codeLines} activeLineIndex={activeLineIndex} />
              : <textarea value={code} onChange={e => setCode(e.target.value)} spellCheck={false} placeholder="# Write or paste your code here..." style={{ width: "100%", height: "100%", background: "transparent", border: "none", outline: "none", color: "#e8e8f0", fontFamily: "JetBrains Mono, monospace", fontSize: 13, lineHeight: 1.8, padding: 16, resize: "none", tabSize: 2, boxSizing: "border-box" }} />
            }
          </div>
          {/* Footer */}
          <div style={{ padding: "10px 16px", borderTop: "1px solid #2a2a3d", display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
            <button onClick={explainCode} disabled={status === "loading"} style={{ background: "linear-gradient(135deg,#7c6cf0,#9f54ea)", color: "#fff", border: "none", borderRadius: 10, padding: "8px 22px", fontSize: 13, fontWeight: 600, cursor: status === "loading" ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 7, opacity: status === "loading" ? 0.7 : 1 }}>
              {status === "loading" ? "⏳" : "▶"} {status === "loading" ? "Analyzing..." : "Explain Code"}
            </button>
            <span style={{ fontSize: 11, fontFamily: "JetBrains Mono, monospace", padding: "4px 10px", borderRadius: 20, fontWeight: 600, background: pill.bg, color: pill.color }}>{pill.label}</span>
            {showCodeDisplay && steps.length > 0 && <span style={{ fontSize: 12, color: "#a0a0b8", fontFamily: "JetBrains Mono, monospace" }}>Step {currentStep + 1} / {steps.length}</span>}
            {showCodeDisplay && <button onClick={() => { setShowCodeDisplay(false); setCurrentStep(-1); }} style={{ marginLeft: "auto", background: "none", border: "1px solid #2a2a3d", borderRadius: 8, padding: "5px 10px", color: "#606075", fontSize: 11, cursor: "pointer" }}>✏ Edit</button>}
          </div>
        </div>
      </div>
      {/* RIGHT: PANEL */}
      <div style={{ background: "#14141e", borderLeft: "1px solid #2a2a3d", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Tabs */}
        <div style={{ display: "flex", borderBottom: "1px solid #2a2a3d", flexShrink: 0 }}>
          {[["steps", "Steps"], ["vars", "Variables"], ["output", "Output"]].map(([key, label]) => (
            <div key={key} onClick={() => setActiveTab(key)} style={{ flex: 1, padding: "11px 0", textAlign: "center", fontSize: 12, fontWeight: 600, cursor: "pointer", color: activeTab === key ? "#7c6cf0" : "#606075", borderBottom: activeTab === key ? "2px solid #7c6cf0" : "2px solid transparent", transition: "all 0.15s" }}>{label}</div>
          ))}
        </div>
        {/* Tab content */}
        <div style={{ flex: 1, overflowY: "auto", padding: 14 }}>
          {activeTab === "steps" && <CVStepsPanel steps={steps} currentStep={currentStep} onGoTo={setCurrentStep} />}
          {activeTab === "vars" && <CVVarsPanel vars={currentVars} prevVars={prevVars} />}
          {activeTab === "output" && <CVOutputPanel finalOutput={finalOutput} error={error} rawData={rawData} showDebug={showDebug} onToggleDebug={() => setShowDebug(d => !d)} />}
        </div>
        {/* Controls */}
        <div style={{ padding: "12px 14px", borderTop: "1px solid #2a2a3d", flexShrink: 0 }}>
          <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
            {[["📋 Copy JSON", copyJSON], ["⬇ Download", downloadJSON]].map(([label, fn]) => (
              <button key={label} onClick={fn} style={{ flex: 1, padding: "6px 0", background: "#1a1a28", border: "1px solid #2a2a3d", borderRadius: 8, color: "#a0a0b8", fontSize: 11, cursor: "pointer", fontWeight: 600 }}>{label}</button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
            <button style={ctrlBtn(!steps.length || currentStep <= 0)} disabled={!steps.length || currentStep <= 0} onClick={() => setCurrentStep(s => Math.max(0, s - 1))}>◀ Prev</button>
            <button disabled={!steps.length} onClick={togglePlay} style={{ ...ctrlBtn(!steps.length), background: "linear-gradient(135deg,rgba(16,185,129,0.2),rgba(6,182,212,0.15))", border: "1px solid rgba(16,185,129,0.35)", color: playing ? "#f59e0b" : "#10b981" }}>{playing ? "⏸ Pause" : "▶ Play"}</button>
            <button style={ctrlBtn(!steps.length || currentStep >= steps.length - 1)} disabled={!steps.length || currentStep >= steps.length - 1} onClick={() => setCurrentStep(s => Math.min(steps.length - 1, s + 1))}>Next ▶</button>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 11, color: "#606075", fontFamily: "JetBrains Mono, monospace", minWidth: 48 }}>Speed</span>
            <input type="range" min={1} max={5} value={speed} onChange={e => setSpeed(Number(e.target.value))} style={{ flex: 1, accentColor: "#7c6cf0", cursor: "pointer" }} />
            <span style={{ fontSize: 11, color: "#7c6cf0", fontFamily: "JetBrains Mono, monospace", minWidth: 28, textAlign: "right" }}>{speed}x</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── NAV HORIZONTAL BAR (top navbar) ── */
function NavDropdown({ navItems, activePage, setActivePage }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 2,
      overflowX: "auto", flex: 1,
      scrollbarWidth: "none", msOverflowStyle: "none",
    }}>
      <style>{`.skillio-nav-scroll::-webkit-scrollbar{display:none}`}</style>
      <div className="skillio-nav-scroll" style={{
        display: "flex", alignItems: "center", gap: 2,
        overflowX: "auto", scrollbarWidth: "none",
      }}>
        {navItems.map(item => {
          const isActive = activePage === item.key;
          return (
            <button
              key={item.key}
              onClick={() => setActivePage(item.key)}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "6px 12px", borderRadius: 9, cursor: "pointer",
                background: isActive ? "rgba(79,142,247,.18)" : "transparent",
                border: isActive ? "1px solid rgba(79,142,247,.4)" : "1px solid transparent",
                color: isActive ? "#f0f2f8" : "#6b7a99",
                fontSize: 12, fontWeight: isActive ? 700 : 500,
                fontFamily: "'DM Sans',sans-serif",
                whiteSpace: "nowrap", flexShrink: 0,
                transition: "all .18s",
                position: "relative",
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  e.currentTarget.style.background = "rgba(255,255,255,.06)";
                  e.currentTarget.style.color = "#f0f2f8";
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "#6b7a99";
                }
              }}
            >
              <span style={{ fontSize: 14 }}>{item.icon}</span>
              <span>{item.label}</span>
              {item.badge && (
                <span style={{ background: "#f43f5e", color: "#fff", fontSize: 8, fontWeight: 700, padding: "1px 5px", borderRadius: 99, lineHeight: 1.5 }}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Dashboard({ user, onLogout, startPage }) {

  const [activePage, setActivePage] = useState(startPage || "dashboard");
  const [notifOpen, setNotifOpen] = useState(false);
  const [sandboxCode, setSandboxCode] = useState(`// 🚀 Skillio Live Sandbox\nfunction greet(name) {\n  return "Hello, " + name + "! Ready to learn?";\n}\nconsole.log(greet("${(user?.name || "Learner").split(" ")[0]}"));\n`);
  const [sandboxOutput, setSandboxOutput] = useState([]);
  const [sandboxRunning, setSandboxRunning] = useState(false);
  const [activeCourse, setActiveCourse] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);
  const [completedLessons, setCompletedLessons] = useState({});
  const [chatKey, setChatKey] = useState(0); // increment to fully reset ChatModule
  const [pomodoroOpen, setPomodoroOpen] = useState(false);      // float mini on all pages
  const [pomodoroSecs, setPomodoroSecs] = useState(25 * 60);      // shared secs for float
  const [pomodoroRunning, setPomodoroRunning] = useState(false); // shared running state

  const runSandbox = () => {
    setSandboxRunning(true); setSandboxOutput([]);
    const logs = [];
    try {
      const origLog = console.log;
      console.log = (...args) => logs.push({ type: "log", msg: args.map(a => typeof a === "object" ? JSON.stringify(a) : String(a)).join(" ") });
      new Function(sandboxCode)();
      console.log = origLog;
    } catch (e) { logs.push({ type: "error", msg: e.message }); }
    setTimeout(() => { setSandboxOutput(logs); setSandboxRunning(false); }, 400);
  };

  const courses = [
    { icon: "⚛️", title: "React Mastery", progress: 72, tag: "In Progress", color: "#4f8ef7", lessons: 24, total: 34, lastLesson: "Custom Hooks Deep Dive", xp: 840 },
    { icon: "🐍", title: "Python for AI", progress: 45, tag: "In Progress", color: "#7c3aed", lessons: 14, total: 32, lastLesson: "Neural Networks Intro", xp: 510 },
    { icon: "🎨", title: "UX Design Pro", progress: 100, tag: "Completed", color: "#10b981", lessons: 28, total: 28, lastLesson: "Capstone Project", xp: 1200 },
    { icon: "☁️", title: "Cloud DevOps", progress: 18, tag: "Started", color: "#f59e0b", lessons: 5, total: 40, lastLesson: "Docker Basics", xp: 180 },
    { icon: "🔐", title: "Cybersecurity 101", progress: 60, tag: "In Progress", color: "#f43f5e", lessons: 18, total: 30, lastLesson: "Penetration Testing Intro", xp: 620 },
    { icon: "📊", title: "Data Analytics", progress: 33, tag: "In Progress", color: "#06b6d4", lessons: 10, total: 30, lastLesson: "Pandas DataFrames", xp: 310 },
  ];

  const weekData = [
    { l: "Mon", v: 42, c: "#4f8ef7" }, { l: "Tue", v: 68, c: "#10b981" }, { l: "Wed", v: 35, c: "#7c3aed" },
    { l: "Thu", v: 82, c: "#f59e0b" }, { l: "Fri", v: 55, c: "#f43f5e" }, { l: "Sat", v: 90, c: "#06b6d4" }, { l: "Sun", v: 48, c: "#4f8ef7" },
  ];
  const radarData = [{ l: "React", v: 72 }, { l: "Python", v: 45 }, { l: "UX", v: 100 }, { l: "DevOps", v: 18 }, { l: "Security", v: 60 }, { l: "Data", v: 33 }];
  const scatterData = [
    { x: 10, y: 40, c: "#4f8ef7" }, { x: 20, y: 55, c: "#7c3aed" }, { x: 30, y: 50, c: "#10b981" }, { x: 40, y: 65, c: "#f59e0b" },
    { x: 50, y: 0, c: "#f43f5e" }, { x: 60, y: 100, c: "#10b981" }, { x: 70, y: 50, c: "#4f8ef7" }, { x: 80, y: 50, c: "#7c3aed" },
    { x: 90, y: 0, c: "#f43f5e" }, { x: 35, y: 80, c: "#06b6d4" }, { x: 55, y: 70, c: "#4f8ef7" }, { x: 75, y: 90, c: "#10b981" },
  ];
  const studyArea = [10, 25, 18, 40, 35, 55, 48, 70, 65, 80, 72, 88];
  const pieData = [
    { label: "Video", v: 38, color: "#4f8ef7" }, { label: "Reading", v: 28, color: "#7c3aed" },
    { label: "Quizzes", v: 20, color: "#10b981" }, { label: "Sandbox", v: 14, color: "#f59e0b" },
  ];
  const monthLine = {
    datasets: [
      { data: [20, 35, 28, 52, 44, 66, 58, 74, 62, 80, 72, 88], color: "#4f8ef7", label: "XP" },
      { data: [60, 55, 70, 65, 80, 75, 85, 78, 90, 88, 82, 94], color: "#10b981", label: "Quiz%" },
    ],
    labels: ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"],
  };
  const activities = [
    { icon: "⚛️", title: "React Mastery", sub: "Completed: Hooks & State", time: "2m ago", color: "#4f8ef7" },
    { icon: "📝", title: "Quiz #9 Submitted", sub: "Score: 0/2 — review Java basics", time: "1h ago", color: "#f43f5e" },
    { icon: "🏆", title: "Badge Earned", sub: "7-Day Learning Streak!", time: "Today", color: "#f59e0b" },
    { icon: "🐍", title: "Python for AI", sub: "Started: Neural Networks Intro", time: "Yesterday", color: "#7c3aed" },
    { icon: "📖", title: "New Course", sub: "Enrolled: Cybersecurity 101", time: "2d ago", color: "#f43f5e" },
  ];
  const roadmapSteps = [
    { title: "HTML & CSS Foundations", done: true, color: "#10b981", desc: "Core web structure & styling" },
    { title: "JavaScript Essentials", done: true, color: "#10b981", desc: "Variables, functions, DOM" },
    { title: "React Mastery", done: false, active: true, color: "#4f8ef7", progress: 72, desc: "Components, hooks, state management" },
    { title: "Node.js & APIs", done: false, color: "#6b7a99", desc: "Server-side JS & REST APIs" },
    { title: "Databases & SQL", done: false, color: "#6b7a99", desc: "PostgreSQL, Prisma, MongoDB" },
    { title: "Cloud Deployment", done: false, color: "#6b7a99", desc: "AWS, Vercel, Docker" },
    { title: "AI & ML Integration", done: false, color: "#7c3aed", desc: "OpenAI APIs, ML pipelines" },
    { title: "Full-Stack Capstone", done: false, color: "#f59e0b", desc: "Build & deploy your portfolio project" },
  ];
  const quizHistory = [
    { label: "Q1", score: 40 }, { label: "Q2", score: 55 }, { label: "Q3", score: 50 }, { label: "Q4", score: 65 },
    { label: "Q5", score: 0 }, { label: "Q6", score: 100 }, { label: "Q7", score: 50 }, { label: "Q8", score: 50 }, { label: "Q9", score: 0 },
  ];

  const navItems = [
    { icon: "⚡", label: "Dashboard", key: "dashboard" },
    { icon: "📅", label: "Schedule", key: "schedule", badge: "3" },
    { icon: "📚", label: "Courses", key: "courses" },
    { icon: "🧠", label: "Quiz", key: "quiz", badge: "2" },
    { icon: "🤖", label: "AI Chat", key: "chat" },
    { icon: "📄", label: "Resume Recruiter", key: "resumerecruiter" },
    { icon: "⚖️", label: "Topic Compare", key: "topiccompare" },
    { icon: "🔍", label: "Code Visualizer", key: "codevis" },
    { icon: "📋", label: "Adaptive plan ", key: "plan" },
    { icon: "🍅", label: "Focus Timer", key: "pomodoro" },
    { icon: "📈", label: "Progress", key: "progress" },
    { icon: "💻", label: "Sandbox", key: "sandbox" },
    { icon: "🗺️", label: "Roadmap", key: "roadmap" },
    { icon: "👤", label: "Profile", key: "profile" },
    { icon: "⚙️", label: "Settings", key: "settings" },
  ];

  // ── KPI STAT CARDS – distinct styles per card
  const renderStatCards = () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 24 }}>
      {/* Card 1: Study Time – blue gradient bg */}
      <div style={{ background: "linear-gradient(135deg,rgba(79,142,247,.22),rgba(79,142,247,.06))", border: "1px solid rgba(79,142,247,.35)", borderRadius: 16, padding: "20px 18px 16px", position: "relative", overflow: "hidden", animation: "cardPop .4s ease both", transition: "transform .2s" }}
        onMouseEnter={e => e.currentTarget.style.transform = "translateY(-4px) scale(1.01)"}
        onMouseLeave={e => e.currentTarget.style.transform = "translateY(0) scale(1)"}>
        <div style={{ fontSize: 10, color: "rgba(79,142,247,.8)", fontFamily: "'JetBrains Mono',monospace", letterSpacing: ".08em", marginBottom: 10, textTransform: "uppercase", fontWeight: 700 }}>STUDY TIME</div>
        <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 32, color: "#4f8ef7", lineHeight: 1, marginBottom: 2 }}>24h</div>
        <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 22, color: "rgba(79,142,247,.7)", marginBottom: 8 }}>30m</div>
        <div style={{ fontSize: 12, color: "rgba(79,142,247,.6)", marginBottom: 12 }}>+3h this week</div>
        <Sparkline data={[20, 35, 28, 45, 40, 60, 52, 70, 65, 80]} color="#4f8ef7" width={100} height={32} />
        <div style={{ position: "absolute", top: -10, right: -10, width: 60, height: 60, borderRadius: "50%", background: "rgba(79,142,247,.1)" }} />
      </div>
      {/* Card 2: Quiz Score – emerald with left accent */}
      <div style={{ background: "#16181f", border: "1px solid rgba(255,255,255,.07)", borderLeft: "3px solid #10b981", borderRadius: 16, padding: "20px 18px 16px", position: "relative", overflow: "hidden" }}>
        <div style={{ fontSize: 10, color: "#6b7a99", fontFamily: "'JetBrains Mono',monospace", letterSpacing: ".08em", marginBottom: 10, textTransform: "uppercase", fontWeight: 700 }}>QUIZ SCORE</div>
        <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 38, color: "#10b981", lineHeight: 1, marginBottom: 8 }}>76%</div>
        <div style={{ fontSize: 12, color: "#10b981", marginBottom: 12 }}>↑ 8% vs last week</div>
        <Sparkline data={[60, 55, 70, 65, 80, 75, 85, 78, 90, 88]} color="#10b981" width={100} height={32} />
      </div>
      {/* Card 3: Day Streak – amber, icon prominent */}
      <div style={{ background: "#16181f", border: "1px solid rgba(245,158,11,.25)", borderRadius: 16, padding: "20px 18px 16px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 14, right: 14, fontSize: 28, opacity: .25 }}>🔥</div>
        <div style={{ fontSize: 10, color: "#6b7a99", fontFamily: "'JetBrains Mono',monospace", letterSpacing: ".08em", marginBottom: 10, textTransform: "uppercase", fontWeight: 700 }}>DAY STREAK</div>
        <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 38, color: "#f59e0b", lineHeight: 1, marginBottom: 8 }}>7d</div>
        <div style={{ fontSize: 12, color: "#f59e0b", marginBottom: 12 }}>Personal best!</div>
        <Sparkline data={[1, 3, 2, 5, 4, 7, 6, 7, 7, 7]} color="#f59e0b" width={100} height={32} />
      </div>
      {/* Card 4: Total XP – violet, pill badge */}
      <div style={{ background: "#16181f", border: "1px solid rgba(255,255,255,.07)", borderRadius: 16, padding: "20px 18px 16px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 12, right: 12, fontSize: 9, fontWeight: 700, padding: "3px 8px", borderRadius: 99, background: "rgba(124,58,237,.25)", color: "#a78bfa", fontFamily: "'JetBrains Mono',monospace" }}>LVL 12</div>
        <div style={{ fontSize: 10, color: "#6b7a99", fontFamily: "'JetBrains Mono',monospace", letterSpacing: ".08em", marginBottom: 10, textTransform: "uppercase", fontWeight: 700 }}>TOTAL XP</div>
        <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 32, color: "#7c3aed", lineHeight: 1, marginBottom: 8 }}>3,840</div>
        <div style={{ fontSize: 12, color: "#9aa5bc", marginBottom: 12 }}>+320 today</div>
        <Sparkline data={[100, 180, 140, 220, 190, 280, 240, 300, 260, 320]} color="#7c3aed" width={100} height={32} />
      </div>
    </div>
  );

  // ── COURSE COMPLETION TRACKER
  const renderCompletionTracker = () => (
    <Section title="✅ Course Completion Tracker" sub="Overall learning progress across all courses" action={<Pill label="6 Courses" color="#4f8ef7" />}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 16 }}>
        {courses.map((c, i) => (
          <div key={i} style={{ background: "#1e2130", borderRadius: 12, padding: "14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span style={{ fontSize: 18 }}>{c.icon}</span>
                <div style={{ fontSize: 12, fontWeight: 700, lineHeight: 1.3 }}>{c.title}</div>
              </div>
              <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 14, color: c.color }}>{c.progress}%</span>
            </div>
            <div style={{ height: 6, borderRadius: 99, background: "rgba(255,255,255,.07)", marginBottom: 6, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${c.progress}%`, background: `linear-gradient(90deg,${c.color},${c.color}99)`, borderRadius: 99, transition: "width 1.2s ease" }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 10, color: "#6b7a99" }}>{c.lessons}/{c.total} lessons</span>
              <Pill label={c.tag} color={c.color} />
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 16, padding: "14px 16px", borderRadius: 12, background: "rgba(79,142,247,.06)", border: "1px solid rgba(79,142,247,.15)" }}>
        {[{ label: "Completed", v: 1, color: "#10b981" }, { label: "In Progress", v: 4, color: "#4f8ef7" }, { label: "Started", v: 1, color: "#f59e0b" }].map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: s.color }} />
            <span style={{ fontSize: 12, color: "#9aa5bc" }}>{s.v} {s.label}</span>
          </div>
        ))}
        <div style={{ marginLeft: "auto", fontSize: 12, color: "#4f8ef7", fontWeight: 700 }}>Avg completion: 54.7%</div>
      </div>
    </Section>
  );

  // ── ACTIVITY TIMELINE
  const renderActivityTimeline = () => (
    <Section title="⏱ Activity Timeline" sub="Your recent learning actions">
      <div style={{ position: "relative", paddingLeft: 24 }}>
        <div style={{ position: "absolute", left: 8, top: 0, bottom: 0, width: 1.5, background: "rgba(255,255,255,.07)", borderRadius: 99 }} />
        {activities.map((a, i) => (
          <div key={i} style={{ position: "relative", marginBottom: 16 }}>
            <div style={{ position: "absolute", left: -24, top: 2, width: 14, height: 14, borderRadius: "50%", background: `${a.color}33`, border: `2px solid ${a.color}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 7 }} />
            <div style={{ background: "#1e2130", borderRadius: 11, padding: "11px 14px", border: `1px solid ${a.color}18` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{a.icon} {a.title}</div>
                <div style={{ fontSize: 10, color: "#6b7a99", fontFamily: "'JetBrains Mono',monospace" }}>{a.time}</div>
              </div>
              <div style={{ fontSize: 11, color: "#6b7a99" }}>{a.sub}</div>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );

  const renderDashboard = () => (
    <>
      {/* Welcome banner */}
      <div style={{ background: "linear-gradient(135deg,rgba(79,142,247,.15),rgba(124,58,237,.12))", border: "1px solid rgba(79,142,247,.22)", borderRadius: 18, padding: "22px 28px", marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 24, marginBottom: 6 }}>Hi, {user.name.split(" ")[0]}! 👋</h2>
          <p style={{ color: "#9aa5bc", fontSize: 14 }}>You're on a <span style={{ color: "#f59e0b", fontWeight: 700 }}>7-day streak</span> — keep it up! Your next lesson is waiting.</p>
        </div>
        <div style={{ display: "flex", gap: 16 }}>
          {[{ e: "🔥", v: "7 DAYS", c: "#f59e0b" }, { e: "⚡", v: "LVL 12", c: "#4f8ef7" }, { e: "🏆", v: "TOP 5%", c: "#7c3aed" }].map((b, i) => (
            <div key={i} style={{ textAlign: "center", padding: "10px 14px", borderRadius: 12, background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.07)" }}>
              <div style={{ fontSize: 26 }}>{b.e}</div>
              <div style={{ fontSize: 10, color: b.c, fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, marginTop: 2 }}>{b.v}</div>
            </div>
          ))}
        </div>
      </div>

      {renderStatCards()}

      {/* Row 1: Line + Bar + Radar */}
      <div style={{ display: "grid", gridTemplateColumns: "1.8fr 1.2fr 1fr", gap: 16, marginBottom: 20 }}>
        <Section title="📈 Study & Quiz Trend" sub="Monthly overview" action={<Pill label="2024" color="#4f8ef7" />}>
          <div style={{ display: "flex", gap: 14, marginBottom: 10 }}>
            {monthLine.datasets.map((ds, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 10, height: 3, borderRadius: 99, background: ds.color }} />
                <span style={{ fontSize: 10, color: "#9aa5bc", fontFamily: "'JetBrains Mono',monospace" }}>{ds.label}</span>
              </div>
            ))}
          </div>
          <LineChartSVG datasets={monthLine.datasets} height={110} labels={monthLine.labels} />
        </Section>
        <Section title="📊 Weekly Activity" sub="Minutes per day" action={<Pill label="This Week" color="#7c3aed" />}>
          <BarChartSVG data={weekData} height={100} />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10 }}>
            <div><div style={{ fontSize: 10, color: "#6b7a99" }}>Total</div><div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 16, color: "#4f8ef7" }}>420 min</div></div>
            <div style={{ textAlign: "right" }}><div style={{ fontSize: 10, color: "#6b7a99" }}>Best</div><div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 16, color: "#10b981" }}>Sat 90m</div></div>
          </div>
        </Section>
        <Section title="🎯 Skill Radar" sub="Competency map">
          <div style={{ display: "flex", justifyContent: "center" }}>
            <RadarChartSVG data={radarData} size={130} />
          </div>
        </Section>
      </div>

      {/* Row 2: Area + Donut + Scatter */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1.2fr", gap: 16, marginBottom: 20 }}>
        <Section title="🌊 XP Growth" sub="Cumulative learning progress">
          <AreaChartSVG data={studyArea} color="#4f8ef7" height={90} />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
            <span style={{ fontSize: 11, color: "#6b7a99" }}>Started Jan 1</span>
            <span style={{ fontSize: 11, color: "#4f8ef7", fontWeight: 700 }}>+760% growth</span>
          </div>
        </Section>
        <Section title="🍩 Time Split" sub="How you spend study hours">
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
            <DonutChart segments={pieData} size={110} stroke={14} label="100%" sublabel="HOURS" />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            {pieData.map((p, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: p.color, flexShrink: 0 }} />
                <span style={{ fontSize: 11, color: "#9aa5bc", flex: 1 }}>{p.label}</span>
                <span style={{ fontSize: 11, color: p.color, fontFamily: "'JetBrains Mono',monospace", fontWeight: 700 }}>{p.v}%</span>
              </div>
            ))}
          </div>
        </Section>
        <Section title="🔵 Score Scatter" sub="Distribution across sessions">
          <ScatterSVG data={scatterData} W={240} H={110} />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
            <span style={{ fontSize: 10, color: "#6b7a99" }}>Session →</span>
            <span style={{ fontSize: 10, color: "#6b7a99" }}>Score ↑</span>
          </div>
        </Section>
      </div>

      {/* Course Completion Tracker */}
      <div style={{ marginBottom: 20 }}>{renderCompletionTracker()}</div>

      {/* Row 3: Performance (empty) + Courses */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: 16, marginBottom: 20 }}>
        <Section title="🚀 My Performance" sub="Linked to Quiz module — complete quizzes to see results" action={<Pill label="Coming Soon" color="#6b7a99" />}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 200, gap: 14 }}>
            <div style={{ fontSize: 48, opacity: .25 }}>🧠</div>
            <div style={{ textAlign: "center", maxWidth: 220 }}>
              <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 15, marginBottom: 6, color: "#f0f2f8" }}>No quiz data yet</div>
              <div style={{ fontSize: 12, color: "#6b7a99", lineHeight: 1.7 }}>Your quiz performance will appear here automatically once you complete quizzes in the Quiz module.</div>
            </div>
            <button onClick={() => setActivePage("quiz")} style={{ padding: "9px 20px", borderRadius: 10, background: "linear-gradient(135deg,#4f8ef7,#7c3aed)", color: "#fff", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>Go to Quizzes →</button>
          </div>
        </Section>
        <Section title="📚 My Courses" action={<span style={{ fontSize: 11, color: "#4f8ef7", cursor: "pointer", fontWeight: 600 }} onClick={() => setActivePage("courses")}>View All →</span>}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {courses.map((c, i) => (
              <div key={i} style={{ background: "#1e2130", borderRadius: 13, padding: "14px 12px", cursor: "pointer", border: `1px solid ${c.color}22`, transition: "transform .2s,border-color .2s" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.borderColor = c.color; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.borderColor = `${c.color}22`; }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                  <span style={{ fontSize: 22 }}>{c.icon}</span>
                  <Pill label={c.tag} color={c.color} />
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2, lineHeight: 1.3 }}>{c.title}</div>
                <div style={{ fontSize: 10, color: "#6b7a99", marginBottom: 8 }}>Last: {c.lastLesson}</div>
                <div style={{ height: 3, borderRadius: 99, background: "rgba(255,255,255,.07)", marginBottom: 6 }}>
                  <div style={{ height: "100%", width: `${c.progress}%`, background: `linear-gradient(90deg,${c.color},${c.color}88)`, borderRadius: 99 }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 10, color: "#6b7a99" }}>{c.lessons}/{c.total}</span>
                  <button style={{ padding: "3px 9px", borderRadius: 7, border: `1px solid ${c.color}55`, background: `${c.color}18`, color: c.color, fontSize: 9, fontWeight: 700, cursor: "pointer" }} onClick={e => { e.stopPropagation(); setActivePage("courses"); }}>
                    {c.progress === 100 ? "Review" : "Resume →"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Section>
      </div>

      {/* Row 4: Activity Timeline + Quiz Bar + Leaderboard */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1.2fr", gap: 16, marginBottom: 20 }}>
        {renderActivityTimeline()}
        <Section title="📉 Quiz Score History" sub="Score per quiz attempt">
          <BarChartSVG data={quizHistory.map(q => ({ l: q.label, v: q.score, c: q.score >= 70 ? "#10b981" : q.score >= 40 ? "#f59e0b" : "#f43f5e" }))} height={90} />
          <div style={{ display: "flex", gap: 12, marginTop: 10 }}>
            {[{ c: "#10b981", l: "≥70%" }, { c: "#f59e0b", l: "40-69%" }, { c: "#f43f5e", l: "<40%" }].map((x, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: x.c }} />
                <span style={{ fontSize: 10, color: "#6b7a99" }}>{x.l}</span>
              </div>
            ))}
          </div>
        </Section>
        <Section title="🏅 Leaderboard" sub="Top learners this week" action={<span style={{ fontSize: 11, color: "#4f8ef7", cursor: "pointer", fontWeight: 600 }}>See All →</span>}>
          {[
            { rank: 1, name: "Lavanya", xp: "9,820", badge: "🥇", you: false },
            { rank: 2, name: "Deepa", xp: "8,540", badge: "🥈", you: false },
            { rank: 3, name: "Rahul Gupta", xp: "7,920", badge: "🥉", you: false },
            { rank: 4, name: user.name, xp: "3,840", badge: "4", you: true },
            { rank: 5, name: "Sneha Patel", xp: "3,210", badge: "5", you: false },
          ].map((l, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", borderRadius: 10, background: l.you ? "rgba(79,142,247,.1)" : "transparent", border: l.you ? "1px solid rgba(79,142,247,.25)" : "1px solid transparent", marginBottom: 4 }}>
              <div style={{ width: 20, textAlign: "center", fontSize: l.rank <= 3 ? 15 : 12, fontWeight: 700 }}>{l.badge}</div>
              <Ava name={l.name} size={28} />
              <div style={{ flex: 1, fontSize: 12, fontWeight: l.you ? 700 : 500, color: l.you ? "#4f8ef7" : "#f0f2f8" }}>{l.name}{l.you ? " (You)" : ""}</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: l.you ? "#4f8ef7" : "#6b7a99", fontFamily: "'JetBrains Mono',monospace" }}>{l.xp} XP</div>
            </div>
          ))}
        </Section>
      </div>
    </>
  );



  const renderSandbox = () => {
    /* ── LIVE SANDBOX  Python & Java via POST http://localhost:5002/run-code ── */
    const LANGS = {
      python: {
        label: "Python", icon: "🐍", color: "#3776ab", tc: "#fff", ext: ".py", snips: [
          ["Hello World", "print('Hello from Skillio!')"],
          ["User Input", "name = input('Enter your name: ')\nprint(f'Hello, {name}!')"],
          ["List Comp", "nums=[x**2 for x in range(1,6)]\nprint('Squares:',nums)"],
          ["Dict Loop", "s={'name':'Alice','score':95}\nfor k,v in s.items():\n    print(f'{k}: {v}')"],
          ["Fibonacci", "def fib(n):\n    return n if n<=1 else fib(n-1)+fib(n-2)\nfor i in range(11):\n    print(f'fib({i}) = {fib(i)}')"],
        ]
      },
      java: {
        label: "Java", icon: "☕", color: "#f89820", tc: "#fff", ext: ".java", snips: [
          ["Hello World", 'public class Main {\n  public static void main(String[] args) {\n    System.out.println("Hello from Skillio!");\n  }\n}'],
          ["User Input", 'import java.util.Scanner;\npublic class Main {\n  public static void main(String[] args) {\n    Scanner sc = new Scanner(System.in);\n    System.out.print("Enter your name: ");\n    String name = sc.nextLine();\n    System.out.println("Hello, " + name + "!");\n  }\n}'],
          ["For Loop", 'public class Main {\n  public static void main(String[] args) {\n    for(int i=1;i<=5;i++)\n      System.out.println("Line " + i);\n  }\n}'],
          ["Array Sum", 'public class Main {\n  public static void main(String[] args) {\n    int[] a = {1,2,3,4,5}; int s=0;\n    for(int x:a) s+=x;\n    System.out.println("Sum: " + s);\n  }\n}'],
          ["Fibonacci", 'public class Main {\n  static int fib(int n){return n<=1?n:fib(n-1)+fib(n-2);}\n  public static void main(String[] args){\n    for(int i=0;i<=10;i++) System.out.println("fib("+i+")="+fib(i));\n  }\n}'],
        ]
      },
    };

    const [sbLang, setSbLang] = useState("python");
    const [sbCode, setSbCode] = useState(LANGS.python.snips[0][1]);
    const [sbRunning, setSbRunning] = useState(false);
    const [sbResult, setSbResult] = useState(null);
    const [termLines, setTermLines] = useState([]);
    const [termInput, setTermInput] = useState("");
    const [needsInput, setNeedsInput] = useState(false);
    const [stdinQueue, setStdinQueue] = useState([]);
    const [aiFix, setAiFix] = useState(null);
    const termRef = useRef(null);
    const inputRef = useRef(null);
    const lang = LANGS[sbLang];

    useEffect(() => {
      if (termRef.current) termRef.current.scrollTop = termRef.current.scrollHeight;
    }, [termLines, sbRunning]);

    const addLine = (type, text) => setTermLines(prev => [...prev, { type, text, id: Date.now() + Math.random() }]);

    const codeNeedsStdin = (code) => {
      if (sbLang === "python") return /\binput\s*\(/.test(code);
      return /Scanner|readLine/.test(code);
    };

    const runCode = async (stdin) => {
      if (!sbCode.trim()) return;
      setSbRunning(true); setSbResult(null); setAiFix(null);
      setNeedsInput(false); setTermLines([]); setStdinQueue([]);
      try {
        const body = { code: sbCode, language: sbLang };
        if (stdin) body.stdin = stdin;
        const res = await fetch("http://localhost:5002/run-code", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
        if (!res.ok) throw new Error("Server error " + res.status);
        const data = await res.json();
        setSbResult(data);
        if (data.aiFix && data.aiFix.trim()) setAiFix(data.aiFix.trim());
        if (data.output) data.output.split("\n").forEach(l => addLine("output", l));
        if (data.error) data.error.split("\n").forEach(l => addLine("error", l));
        const lastOut = (data.output || "").trimEnd();
        if (/[:?]\s*$/.test(lastOut) && data.status !== "Error" && codeNeedsStdin(sbCode)) {
          setNeedsInput(true);
          setTimeout(() => inputRef.current?.focus(), 100);
        }
      } catch (err) {
        addLine("error", err.message);
        setSbResult({ status: "Error", error: err.message, output: "", aiFix: "" });
      } finally {
        setSbRunning(false);
      }
    };

    const runWithStdin = async (stdin) => {
      setSbRunning(true);
      addLine("system", "--- re-running with input ---");
      try {
        const res = await fetch("http://localhost:5002/run-code", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code: sbCode, language: sbLang, stdin }) });
        const data = await res.json();
        setSbResult(data);
        if (data.aiFix && data.aiFix.trim()) setAiFix(data.aiFix.trim());
        if (data.output) data.output.split("\n").forEach(l => addLine("output", l));
        if (data.error) data.error.split("\n").forEach(l => addLine("error", l));
        const lastOut = (data.output || "").trimEnd();
        if (/[:?]\s*$/.test(lastOut) && data.status !== "Error") {
          setNeedsInput(true); setTimeout(() => inputRef.current?.focus(), 100);
        }
      } catch (err) { addLine("error", err.message); }
      finally { setSbRunning(false); }
    };

    const submitInput = () => {
      const val = termInput.trim();
      addLine("input-echo", "> " + val);
      setTermInput("");
      const q = [...stdinQueue, val];
      setStdinQueue(q);
      setNeedsInput(false);
      runWithStdin(q.join("\n"));
    };

    /* ── Apply AI Fix: always visible on error, smart frontend fallback ── */
    const applyAiFix = () => {
      const errText = (sbResult?.error || "").toLowerCase();
      let fixedCode = null;
      let reason = "";

      // Step 1: extract real code from backend aiFix if present
      if (aiFix) {
        const blockMatch = aiFix.match(/```(?:[a-zA-Z]*\n?)([\s\S]*?)```/);
        if (blockMatch && blockMatch[1].trim().length > 5) {
          fixedCode = blockMatch[1].trim();
          reason = "Applied AI-generated fix";
        } else {
          const codeKw = ["def ", "class ", "import ", "print(", "return ", "public ", "System.out", "void "];
          const chunks = aiFix.split(/\n{2,}/);
          const chunk = chunks.find(ch => codeKw.some(k => ch.includes(k)));
          if (chunk && chunk.trim().length > 5) {
            fixedCode = chunk.trim();
            reason = "Extracted code from AI response";
          }
        }
      }

      // Step 2: frontend smart fixes when backend gave no real code
      if (!fixedCode) {
        let fixed = sbCode;

        if (errText.includes("unicodeencode") || errText.includes("charmap") || errText.includes("codec")) {
          fixed = sbCode
            .replace(/[\u{1F000}-\u{1FFFF}]/gu, "")
            .replace(/[\u2600-\u27FF]/gu, "")
            .replace(/[^\x00-\x7F]/g, "");
          if (fixed !== sbCode) { fixedCode = fixed; reason = "Removed emoji/non-ASCII characters (UnicodeEncodeError fix)"; }
        }
        else if (errText.includes("indentationerror") || errText.includes("unexpected indent")) {
          fixed = sbCode.replace(/\t/g, "    ");
          if (fixed !== sbCode) { fixedCode = fixed; reason = "Converted tabs to spaces (IndentationError fix)"; }
        }
        else if (errText.includes("nameerror") && !sbCode.includes("try:")) {
          const indented = sbCode.split("\n").map(l => "    " + l).join("\n");
          fixedCode = "try:\n" + indented + "\nexcept NameError as e:\n    print(f'NameError: {e}')";
          reason = "Wrapped in try/except (NameError fix)";
        }
        else if (errText.includes("syntaxerror") && /\bprint\s+[^(]/.test(sbCode)) {
          fixed = sbCode.replace(/\bprint\s+(.+)/g, "print($1)");
          if (fixed !== sbCode) { fixedCode = fixed; reason = "Fixed print statement (Python 2→3)"; }
        }
      }

      if (!fixedCode || fixedCode === sbCode) {
        addLine("system", "⚠️  Could not auto-fix. Edit the code manually based on the error above.");
        return;
      }

      // ✅ Update editor
      setSbCode(fixedCode);
      setSbResult(null);
      setNeedsInput(false);
      setAiFix(null);
      setTermLines([
        { type: "system", text: "✅ Fix applied: " + reason, id: Date.now() },
        { type: "system", text: "▶  Click Run to test the fixed code.", id: Date.now() + 1 },
      ]);
    };

    const isSuccess = sbResult?.status === "Success";
    const hasError = sbResult?.status === "Error" || !!sbResult?.error;

    const lineColor = (t) => t === "output" ? "#86efac" : t === "error" ? "#fca5a5" : t === "input-echo" ? "#fcd34d" : "#56637a";

    return (
      <div style={{ display: "flex", flexDirection: "column", background: "#0a0b10", borderRadius: 20, overflow: "hidden", border: "1px solid rgba(255,255,255,.07)", animation: "fadeUp .35s ease both" }}>

        {/* ── TOP BAR ── */}
        <div style={{ display: "flex", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,.08)", background: "#12141c" }}>
          <div style={{ display: "flex", gap: 6, padding: "14px 18px", borderRight: "1px solid rgba(255,255,255,.07)" }}>
            {["#f43f5e", "#f59e0b", "#10b981"].map(c => (
              <div key={c} style={{ width: 11, height: 11, borderRadius: "50%", background: c, opacity: .7 }} />
            ))}
          </div>
          {Object.entries(LANGS).map(([k, l]) => (
            <button key={k}
              onClick={() => { setSbLang(k); setSbCode(l.snips[0][1]); setSbResult(null); setTermLines([]); setAiFix(null); setNeedsInput(false); }}
              style={{ padding: "13px 22px", border: "none", borderBottom: `2.5px solid ${sbLang === k ? l.color : "transparent"}`, background: sbLang === k ? "rgba(255,255,255,.04)" : "transparent", color: sbLang === k ? l.color : "#6b7a99", cursor: "pointer", fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 8, fontFamily: "'JetBrains Mono',monospace", transition: "all .2s" }}
              onMouseEnter={e => { if (sbLang !== k) { e.currentTarget.style.color = "#f0f2f8"; } }}
              onMouseLeave={e => { if (sbLang !== k) { e.currentTarget.style.color = "#6b7a99"; } }}>
              <span style={{ fontSize: 16 }}>{l.icon}</span>{l.label}
            </button>
          ))}
          <div style={{ flex: 1, display: "flex", alignItems: "center", paddingLeft: 16, gap: 6 }}>
            <span style={{ fontSize: 11, color: "#56637a", fontFamily: "'JetBrains Mono',monospace" }}>main{lang.ext}</span>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: sbCode !== lang.snips[0][1] ? lang.color : "transparent" }} />
          </div>
          <button onClick={() => runCode()} disabled={sbRunning || !sbCode.trim()}
            style={{ margin: "8px 14px", padding: "9px 24px", borderRadius: 10, border: "none", background: sbRunning || !sbCode.trim() ? "rgba(255,255,255,.06)" : `linear-gradient(135deg,${lang.color},${lang.color}bb)`, color: sbRunning || !sbCode.trim() ? "#56637a" : lang.tc, cursor: sbRunning || !sbCode.trim() ? "default" : "pointer", fontSize: 13, fontWeight: 800, display: "flex", alignItems: "center", gap: 8, fontFamily: "'Syne',sans-serif", boxShadow: !sbRunning && sbCode.trim() ? `0 4px 20px ${lang.color}44` : "none", transition: "all .2s" }}
            onMouseEnter={e => { if (!sbRunning && sbCode.trim()) { e.currentTarget.style.transform = "translateY(-1px)"; } }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}>
            {sbRunning ? <><span style={{ animation: "spin .7s linear infinite", display: "inline-block" }}>⟳</span> Running…</> : <><span>▶</span> Run {lang.label}</>}
          </button>
        </div>

        {/* ── EDITOR + TERMINAL ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: 400 }}>

          {/* EDITOR */}
          <div style={{ display: "flex", flexDirection: "column", borderRight: "1px solid rgba(255,255,255,.07)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 16px", borderBottom: "1px solid rgba(255,255,255,.06)", background: "rgba(255,255,255,.015)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 14 }}>{lang.icon}</span>
                <span style={{ fontSize: 11, color: lang.color, fontFamily: "'JetBrains Mono',monospace", fontWeight: 700 }}>EDITOR</span>
              </div>
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                {lang.snips.map(([label, code], i) => (
                  <button key={i} onClick={() => { setSbCode(code); setSbResult(null); setTermLines([]); setAiFix(null); setNeedsInput(false); }}
                    style={{ padding: "3px 10px", borderRadius: 6, border: `1px solid ${lang.color}33`, background: sbCode === code ? `${lang.color}22` : `${lang.color}0a`, color: sbCode === code ? lang.color : `${lang.color}aa`, fontSize: 10, cursor: "pointer", fontFamily: "'JetBrains Mono',monospace", fontWeight: sbCode === code ? 700 : 400, transition: "all .15s" }}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ flex: 1, display: "flex", background: "#0d0e14" }}>
              <div style={{ padding: "16px 10px", background: "rgba(0,0,0,.3)", borderRight: "1px solid rgba(255,255,255,.04)", fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: "rgba(255,255,255,.18)", lineHeight: 1.8, userSelect: "none", minWidth: 42, textAlign: "right", flexShrink: 0 }}>
                {sbCode.split("\n").map((_, i) => <div key={i}>{i + 1}</div>)}
              </div>
              <textarea value={sbCode} onChange={e => setSbCode(e.target.value)} spellCheck={false}
                style={{ flex: 1, padding: "16px 14px", background: "transparent", border: "none", outline: "none", color: "#f0f2f8", fontFamily: "'JetBrains Mono',monospace", fontSize: 13, lineHeight: 1.8, resize: "none", minHeight: 320, caretColor: lang.color }}
                onKeyDown={e => {
                  if (e.key === "Tab") { e.preventDefault(); const s = e.target.selectionStart, en = e.target.selectionEnd, v = sbCode; setSbCode(v.substring(0, s) + "  " + v.substring(en)); requestAnimationFrame(() => { e.target.selectionStart = e.target.selectionEnd = s + 2; }); }
                  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); runCode(); }
                }}
              />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 16px", background: "rgba(0,0,0,.2)", borderTop: "1px solid rgba(255,255,255,.04)" }}>
              <span style={{ fontSize: 10, color: "#3a4055", fontFamily: "'JetBrains Mono',monospace" }}>{sbCode.split("\n").length} lines · {sbCode.length} chars</span>
              <span style={{ fontSize: 10, color: "#3a4055", fontFamily: "'JetBrains Mono',monospace" }}>{lang.label} · UTF-8</span>
            </div>
          </div>

          {/* TERMINAL */}
          <div style={{ display: "flex", flexDirection: "column", background: "#0a0b10" }}>
            {/* Terminal header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 16px", borderBottom: "1px solid rgba(255,255,255,.06)", background: "rgba(255,255,255,.015)", flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 14 }}>⬛</span>
                <span style={{ fontSize: 11, color: "#6b7a99", fontFamily: "'JetBrains Mono',monospace", fontWeight: 700 }}>TERMINAL</span>
                {sbResult && (
                  <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 99, fontFamily: "'JetBrains Mono',monospace", background: isSuccess ? "rgba(16,185,129,.15)" : "rgba(244,63,94,.15)", color: isSuccess ? "#10b981" : "#f43f5e", border: `1px solid ${isSuccess ? "rgba(16,185,129,.3)" : "rgba(244,63,94,.3)"}`, animation: "cardPop .3s ease both" }}>
                    {sbResult.status}
                  </span>
                )}
                {needsInput && (
                  <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 99, fontFamily: "'JetBrains Mono',monospace", background: "rgba(245,158,11,.18)", color: "#f59e0b", border: "1px solid rgba(245,158,11,.3)", animation: "pulse 1.5s ease-in-out infinite" }}>
                    ⌨️ INPUT
                  </span>
                )}
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                {/* ⚡ APPLY AI FIX — visible ONLY when there is an error */}
                {hasError && !sbRunning && (
                  <button onClick={applyAiFix}
                    style={{
                      padding: "6px 16px", borderRadius: 9, border: "none",
                      background: "linear-gradient(135deg,#7c3aed,#4f8ef7)",
                      color: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 800,
                      fontFamily: "'JetBrains Mono',monospace",
                      display: "flex", alignItems: "center", gap: 7,
                      boxShadow: "0 4px 18px rgba(124,58,237,.55)",
                      animation: "glowPulse 2s ease-in-out infinite",
                      transition: "all .2s",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 26px rgba(124,58,237,.75)"; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 18px rgba(124,58,237,.55)"; }}>
                    <span style={{ fontSize: 14 }}>⚡</span> Apply AI Fix
                  </button>
                )}
                {termLines.length > 0 && (
                  <button onClick={() => { setTermLines([]); setSbResult(null); setAiFix(null); setNeedsInput(false); }} style={{ fontSize: 10, color: "#3a4055", background: "none", border: "none", cursor: "pointer", fontFamily: "'JetBrains Mono',monospace" }}>Clear ✕</button>
                )}
              </div>
            </div>

            {/* Output */}
            <div ref={termRef} style={{ flex: 1, overflowY: "auto", padding: "14px 16px", fontFamily: "'JetBrains Mono',monospace", fontSize: 12, lineHeight: 1.9, background: "#090a0f" }}>
              {sbRunning && (
                <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#6b7a99" }}>
                  <div style={{ display: "flex", gap: 3, alignItems: "flex-end", height: 16 }}>
                    {[0, 1, 2, 3, 4].map(i => <div key={i} style={{ width: 3, borderRadius: 99, background: lang.color, height: 4 + i * 3, animation: `barDance ${.3 + i * .06}s ease-in-out ${i * .06}s infinite alternate` }} />)}
                  </div>
                  <span style={{ color: lang.color, fontWeight: 700 }}>Executing {lang.label}…</span>
                </div>
              )}
              {!sbRunning && termLines.length === 0 && (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 10, opacity: .25, textAlign: "center" }}>
                  <div style={{ fontSize: 32 }}>▷</div>
                  <div style={{ color: "#6b7a99", fontSize: 12 }}>Run your code to see output</div>
                </div>
              )}
              {termLines.map(line => (
                <div key={line.id} style={{ color: lineColor(line.type), marginBottom: 1, animation: "fadeUp .15s ease both" }}>
                  <span style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{line.text}</span>
                </div>
              ))}
              {/* AI Fix panel */}
              {aiFix && !sbRunning && (
                <div style={{ marginTop: 12, padding: "12px 14px", borderRadius: 10, background: "linear-gradient(135deg,rgba(124,58,237,.1),rgba(79,142,247,.07))", border: "1px solid rgba(124,58,237,.28)", animation: "slideUp .4s ease both" }}>
                  <div style={{ fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 99, background: "rgba(124,58,237,.2)", color: "#a78bfa", border: "1px solid rgba(124,58,237,.35)", display: "inline-block", marginBottom: 8 }}>🤖 AI FIX</div>
                  <div style={{ color: "#c4b5fd", fontSize: 11, lineHeight: 1.85, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{aiFix}</div>
                </div>
              )}
            </div>

            {/* STDIN input row */}
            {needsInput && !sbRunning && (
              <div style={{ borderTop: "1px solid rgba(245,158,11,.25)", background: "rgba(245,158,11,.05)", padding: "10px 14px", display: "flex", gap: 10, alignItems: "center", flexShrink: 0 }}>
                <span style={{ fontSize: 12, color: "#f59e0b", fontWeight: 700, fontFamily: "'JetBrains Mono',monospace", flexShrink: 0 }}>stdin&gt;</span>
                <input ref={inputRef} value={termInput} onChange={e => setTermInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") submitInput(); if (e.key === "Escape") { setNeedsInput(false); setTermInput(""); } }}
                  placeholder="Type input and press Enter…" autoFocus
                  style={{ flex: 1, background: "none", border: "none", outline: "none", color: "#fcd34d", fontFamily: "'JetBrains Mono',monospace", fontSize: 13, caretColor: "#f59e0b" }}
                />
                <button onClick={submitInput}
                  style={{ padding: "5px 14px", borderRadius: 8, background: "rgba(245,158,11,.2)", border: "1px solid rgba(245,158,11,.4)", color: "#f59e0b", cursor: "pointer", fontSize: 11, fontWeight: 700, fontFamily: "'JetBrains Mono',monospace" }}>
                  ↵ Send
                </button>
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", padding: "5px 16px", background: "rgba(0,0,0,.2)", borderTop: "1px solid rgba(255,255,255,.04)", flexShrink: 0 }}>
              <span style={{ fontSize: 10, color: "#3a4055", fontFamily: "'JetBrains Mono',monospace" }}>{sbResult ? "localhost:5002/run-code" : sbRunning ? "running…" : "idle"}</span>
              <span style={{ fontSize: 10, fontFamily: "'JetBrains Mono',monospace", color: isSuccess ? "#10b981" : hasError ? "#f43f5e" : "#3a4055" }}>{sbResult ? sbResult.status : "ready"}</span>
            </div>
          </div>
        </div>

        {/* BOTTOM BAR */}
        <div style={{ padding: "9px 18px", borderTop: "1px solid rgba(255,255,255,.06)", background: "rgba(0,0,0,.25)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#3a4055", fontFamily: "'JetBrains Mono',monospace" }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981", animation: "pulse 2s ease-in-out infinite" }} />
              API: <span style={{ color: "#4f8ef7" }}>localhost:5002</span>
            </div>
            <div style={{ fontSize: 11, color: "#3a4055", fontFamily: "'JetBrains Mono',monospace" }}>Ctrl+Enter to run · Tab = 2 spaces · stdin supported</div>
          </div>
          <div style={{ fontSize: 10, color: "#3a4055", fontFamily: "'JetBrains Mono',monospace" }}>🐍 Python · ☕ Java</div>
        </div>
      </div>
    );
  };
  const renderCourses = () => {
    const COURSES_DATA = [
      {
        icon: "⚛️", title: "React Mastery", color: "#4f8ef7", tag: "In Progress", xp: 840,
        lessons: [
          { id: "r1", title: "JSX & Component Basics", vid: "Tn6-PIqc4UM", dur: "12:34", desc: "Learn JSX syntax and how to build your first React component from scratch." },
          { id: "r2", title: "Props & State Fundamentals", vid: "IYvD9oBCuJI", dur: "18:22", desc: "Understand how props flow down and how state drives UI updates." },
          { id: "r3", title: "useState & useEffect Hooks", vid: "O6P86uwfdR0", dur: "24:10", desc: "Master the two most important React hooks for side effects and state." },
          { id: "r4", title: "Custom Hooks Deep Dive", vid: "6ThXsUwLWvc", dur: "21:45", desc: "Build reusable logic with your own custom hooks." },
          { id: "r5", title: "useMemo & useCallback", vid: "_AyFblegDkI", dur: "16:30", desc: "Optimise re-renders using memoisation techniques." },
          { id: "r6", title: "Context API", vid: "5LrDIWkK_Bc", dur: "19:18", desc: "Share state globally without prop-drilling using React Context." },
          { id: "r7", title: "Redux Toolkit", vid: "bbkBuqC1rU4", dur: "28:55", desc: "Manage complex global state with Redux Toolkit and slices." },
          { id: "r8", title: "React Router v6", vid: "Ul3y1LXxzdU", dur: "22:14", desc: "Client-side navigation with nested routes and loaders." },
          { id: "r9", title: "Testing with Jest & RTL", vid: "8Xwq35cPwYg", dur: "30:00", desc: "Write unit and integration tests for your React components." },
          { id: "r10", title: "Deploying to Vercel", vid: "2HBIzEx6IZA", dur: "11:22", desc: "Deploy your React app to production in minutes." },
        ]
      },
      {
        icon: "🐍", title: "Python for AI", color: "#7c3aed", tag: "In Progress", xp: 510,
        lessons: [
          { id: "p1", title: "NumPy Arrays & Operations", vid: "QUT1VHiLmmI", dur: "20:10", desc: "Work with n-dimensional arrays for numerical computing." },
          { id: "p2", title: "Pandas DataFrames", vid: "vmEHCJofslg", dur: "25:30", desc: "Load, clean, and manipulate tabular data with Pandas." },
          { id: "p3", title: "Matplotlib Visualisation", vid: "3Xc3CA655Y4", dur: "18:45", desc: "Create plots, histograms, and heatmaps for data insights." },
          { id: "p4", title: "Scikit-Learn Basics", vid: "0Lt9w8BxKbY", dur: "22:00", desc: "Train your first ML model with scikit-learn's simple API." },
          { id: "p5", title: "Neural Networks from Scratch", vid: "aircAruvnKk", dur: "35:20", desc: "Build a neural network without any framework to understand the maths." },
          { id: "p6", title: "CNN Architecture", vid: "zfiSAzpy9NM", dur: "28:14", desc: "Convolutional Neural Networks for image recognition tasks." },
          { id: "p7", title: "Transfer Learning", vid: "LsdxvjLWkIY", dur: "24:55", desc: "Fine-tune pre-trained models like ResNet and VGG." },
          { id: "p8", title: "LSTM & Sequence Models", vid: "YCzL96nL7j0", dur: "31:10", desc: "Recurrent networks for time-series and NLP data." },
          { id: "p9", title: "Transformers & Attention", vid: "4Bdc55j80l8", dur: "40:00", desc: "Understand the architecture that powers modern AI." },
          { id: "p10", title: "Deploy ML API with FastAPI", vid: "7t2alSnE2-I", dur: "26:18", desc: "Serve your model as a REST API using FastAPI and Docker." },
        ]
      },
      {
        icon: "🎨", title: "UX Design Pro", color: "#10b981", tag: "Completed", xp: 1200,
        lessons: [
          { id: "u1", title: "Design Thinking Process", vid: "a7sEoEvT8l8", dur: "14:20", desc: "The 5-stage design thinking framework explained with examples." },
          { id: "u2", title: "User Research Methods", vid: "7_sFVYfatXY", dur: "19:45", desc: "Interviews, surveys, and usability testing to understand users." },
          { id: "u3", title: "Information Architecture", vid: "Pio-kWgbBo4", dur: "16:30", desc: "Organise content and navigation for intuitive user flows." },
          { id: "u4", title: "Wireframing in Figma", vid: "FTFaQWZBqQ8", dur: "22:10", desc: "Create low-fidelity wireframes quickly in Figma." },
          { id: "u5", title: "Prototyping & Interactions", vid: "PfNMNbNFCyM", dur: "25:00", desc: "Link frames and add micro-interactions for realistic prototypes." },
          { id: "u6", title: "Design Systems", vid: "EK-pHkc5EL4", dur: "28:35", desc: "Build scalable component libraries with Figma variables." },
          { id: "u7", title: "Usability Testing", vid: "RBm3f0HVq1c", dur: "17:50", desc: "Run moderated tests and analyse results to iterate designs." },
          { id: "u8", title: "Accessibility (WCAG)", vid: "ao2TRWZE99o", dur: "20:22", desc: "Make your designs inclusive for all users." },
        ]
      },
      {
        icon: "☁️", title: "Cloud DevOps", color: "#f59e0b", tag: "Started", xp: 180,
        lessons: [
          { id: "c1", title: "Linux Command Line Basics", vid: "ZtqBQ68cfJc", dur: "16:40", desc: "Navigating files, permissions, and processes in Linux." },
          { id: "c2", title: "Git & GitHub Workflow", vid: "RGOj5yH7evk", dur: "20:15", desc: "Branching, merging, pull requests, and GitHub Actions basics." },
          { id: "c3", title: "Docker Fundamentals", vid: "fqMOX6JJhGo", dur: "24:30", desc: "Containers, images, volumes, and Docker Compose." },
          { id: "c4", title: "Docker Networking", vid: "bKFMS5C4CG0", dur: "18:00", desc: "Bridge, overlay, and host networks explained." },
          { id: "c5", title: "CI/CD with GitHub Actions", vid: "R8_veQiYBjI", dur: "22:55", desc: "Automate build, test, and deploy pipelines." },
          { id: "c6", title: "Kubernetes Intro", vid: "s_o8dwzRlu4", dur: "30:10", desc: "Pods, deployments, services, and kubectl commands." },
          { id: "c7", title: "Helm Charts", vid: "fy8SHvNZGeE", dur: "19:45", desc: "Package and deploy Kubernetes applications with Helm." },
          { id: "c8", title: "Terraform Basics", vid: "SLB_c_ayRMo", dur: "26:20", desc: "Infrastructure as code to provision cloud resources." },
          { id: "c9", title: "AWS ECS & EKS", vid: "I9VAMGEjW_o", dur: "34:00", desc: "Deploy containerised apps on Amazon's managed services." },
          { id: "c10", title: "Monitoring with Prometheus", vid: "h4Sl21AKiDg", dur: "21:35", desc: "Set up metrics collection and Grafana dashboards." },
        ]
      },
      {
        icon: "🔐", title: "Cybersecurity 101", color: "#f43f5e", tag: "In Progress", xp: 620,
        lessons: [
          { id: "s1", title: "Networking Fundamentals", vid: "qiQR5rTSshw", dur: "18:20", desc: "OSI model, TCP/IP, DNS, and how the internet works." },
          { id: "s2", title: "Linux for Hackers", vid: "lZAoFs75_cs", dur: "22:10", desc: "Essential Linux skills for security professionals." },
          { id: "s3", title: "OWASP Top 10 Explained", vid: "ravv3p3OyxI", dur: "25:45", desc: "The 10 most critical web application security risks." },
          { id: "s4", title: "SQL Injection Lab", vid: "ciNHn38EyRU", dur: "19:30", desc: "Hands-on exploitation and mitigation of SQLi vulnerabilities." },
          { id: "s5", title: "XSS & CSRF Attacks", vid: "EoaDgUgS6QA", dur: "21:15", desc: "Cross-site scripting and request forgery with real demos." },
          { id: "s6", title: "Pen Testing with Kali", vid: "3Kq1MIfTWCE", dur: "32:00", desc: "Set up Kali Linux and run your first penetration test." },
          { id: "s7", title: "Burp Suite Basics", vid: "G3hpAeoZ4ek", dur: "27:40", desc: "Intercept, modify, and replay HTTP requests." },
          { id: "s8", title: "Incident Response", vid: "Ne8F1cBL5cc", dur: "20:55", desc: "Detection, containment, and recovery from security incidents." },
        ]
      },
      {
        icon: "📊", title: "Data Analytics", color: "#06b6d4", tag: "In Progress", xp: 310,
        lessons: [
          { id: "d1", title: "Intro to Data Analytics", vid: "yZvFH7B6gKI", dur: "15:10", desc: "What data analysts do and the tools of the trade." },
          { id: "d2", title: "Pandas Advanced Operations", vid: "2uvysYbKdjM", dur: "26:30", desc: "GroupBy, pivot tables, merge, and time-series indexing." },
          { id: "d3", title: "Seaborn Visualisation", vid: "6GUZXDef2X0", dur: "20:45", desc: "Statistical plots, pair plots, and heatmaps with Seaborn." },
          { id: "d4", title: "Feature Engineering", vid: "ZbE8jZ_4h7I", dur: "24:00", desc: "Creating, selecting, and transforming features for ML." },
          { id: "d5", title: "ML Model Evaluation", vid: "LbX4X71-TFI", dur: "22:15", desc: "Cross-validation, confusion matrix, ROC curves." },
          { id: "d6", title: "NLP with spaCy", vid: "dIUTsFT2MeQ", dur: "28:40", desc: "Natural language processing pipelines for text data." },
          { id: "d7", title: "Time Series with ARIMA", vid: "e8Yw4alG16Q", dur: "30:10", desc: "Stationarity, ACF/PACF, and ARIMA model fitting." },
          { id: "d8", title: "Dashboard with Plotly Dash", vid: "hSPmj7mK6ng", dur: "25:55", desc: "Build interactive web dashboards in pure Python." },
        ]
      },
      {
        icon: "🌐", title: "Full-Stack Dev", color: "#a855f7", tag: "Not Started", xp: 0,
        lessons: [
          { id: "fs1", title: "Node.js Fundamentals", vid: "fBNz5xF-Kx4", dur: "19:40", desc: "Event loop, modules, and async patterns in Node.js." },
          { id: "fs2", title: "Express.js REST APIs", vid: "pKd0Rpw7O7k", dur: "23:15", desc: "Build robust REST APIs with Express middleware." },
          { id: "fs3", title: "MongoDB & Mongoose", vid: "ExcRbA7ogi4", dur: "26:00", desc: "NoSQL database design and querying with Mongoose ODM." },
          { id: "fs4", title: "Authentication with JWT", vid: "mbsmsi7l3r4", dur: "21:30", desc: "Secure your APIs with JSON Web Tokens and bcrypt." },
          { id: "fs5", title: "React + Node Integration", vid: "w3vs4a03er4", dur: "28:00", desc: "Connect your React frontend to an Express backend." },
          { id: "fs6", title: "Deployment with Docker", vid: "pTFZFxd5DO8", dur: "24:45", desc: "Containerise and deploy your full-stack app." },
        ]
      },
      {
        icon: "📱", title: "React Native", color: "#61dafb", tag: "Not Started", xp: 0,
        lessons: [
          { id: "rn1", title: "RN Setup & First App", vid: "0-S5a0eXPoc", dur: "18:00", desc: "Set up Expo and build your first React Native app." },
          { id: "rn2", title: "Core Components", vid: "ur6I5m2nTvk", dur: "22:30", desc: "View, Text, Image, ScrollView, and FlatList." },
          { id: "rn3", title: "Navigation with React Navigation", vid: "nQVCkqvU1uE", dur: "27:00", desc: "Stack, tab, and drawer navigators for mobile apps." },
          { id: "rn4", title: "State Management with Redux", vid: "9boMnm5X9ak", dur: "24:00", desc: "Global state for React Native with Redux Toolkit." },
          { id: "rn5", title: "Animations with Reanimated", vid: "yz9E10Dze8s", dur: "29:00", desc: "Smooth 60fps animations using Reanimated 2." },
          { id: "rn6", title: "Publishing to App Stores", vid: "oBWBDaqy-rQ", dur: "20:00", desc: "Build and publish to Google Play and Apple App Store." },
        ]
      },
      {
        icon: "🗄️", title: "SQL & Databases", color: "#f97316", tag: "Not Started", xp: 0,
        lessons: [
          { id: "sql1", title: "SQL Fundamentals", vid: "HXV3zeQKqGY", dur: "17:00", desc: "SELECT, INSERT, UPDATE, DELETE — the basics of SQL." },
          { id: "sql2", title: "Joins & Relationships", vid: "9yeOJ0ZMUYw", dur: "22:00", desc: "INNER, LEFT, RIGHT, FULL JOIN explained with examples." },
          { id: "sql3", title: "Indexes & Performance", vid: "HubezKbFL7E", dur: "19:00", desc: "Speed up queries with indexes and query planning." },
          { id: "sql4", title: "PostgreSQL Advanced", vid: "qw--VYLpxG4", dur: "25:00", desc: "Window functions, CTEs, and JSON in PostgreSQL." },
          { id: "sql5", title: "Database Design", vid: "ztHopE5Wnpc", dur: "21:00", desc: "Normalisation, ER diagrams, and schema design." },
          { id: "sql6", title: "ORM with Prisma", vid: "RebA5J-rlwg", dur: "23:00", desc: "Type-safe database access with Prisma in TypeScript." },
        ]
      },
      {
        icon: "🔷", title: "TypeScript Mastery", color: "#3178c6", tag: "Not Started", xp: 0,
        lessons: [
          { id: "ts1", title: "TypeScript Basics", vid: "BwuLxPH8IDs", dur: "15:00", desc: "Types, interfaces, and the TypeScript compiler." },
          { id: "ts2", title: "Generics & Utility Types", vid: "nViEqpgwxHE", dur: "20:00", desc: "Write reusable, type-safe code with generics." },
          { id: "ts3", title: "TypeScript with React", vid: "ydkQlJhodio", dur: "25:00", desc: "Typing props, hooks, and events in React." },
          { id: "ts4", title: "Advanced Patterns", vid: "CjZ5aKDiKFk", dur: "22:00", desc: "Conditional types, mapped types, and decorators." },
          { id: "ts5", title: "TypeScript with Node.js", vid: "1UcLoOD1lRM", dur: "19:00", desc: "Build type-safe APIs with Express and TypeScript." },
        ]
      },
      {
        icon: "⚡", title: "Next.js 14", color: "#000000", tag: "Not Started", xp: 0,
        lessons: [
          { id: "nx1", title: "App Router Fundamentals", vid: "wm5gMKuwSYk", dur: "20:00", desc: "File-based routing, layouts, and server components in Next.js 14." },
          { id: "nx2", title: "Server & Client Components", vid: "Dkx5ydvtpCA", dur: "25:00", desc: "When to use server vs client components." },
          { id: "nx3", title: "Data Fetching Patterns", vid: "vwSlYG7hFk0", dur: "22:00", desc: "fetch, caching, revalidation, and streaming." },
          { id: "nx4", title: "Route Handlers & API", vid: "wv6s5ULQZ9Y", dur: "18:00", desc: "Build API routes with the new App Router." },
          { id: "nx5", title: "Authentication with NextAuth", vid: "w2h54xz6Ndw", dur: "28:00", desc: "Add OAuth and credential auth to your Next.js app." },
          { id: "nx6", title: "Deploying to Production", vid: "2HBIzEx6IZA", dur: "16:00", desc: "Deploy to Vercel with environment variables and custom domains." },
        ]
      },
      {
        icon: "🤖", title: "Generative AI Dev", color: "#10b981", tag: "Not Started", xp: 0,
        lessons: [
          { id: "ai1", title: "OpenAI API Basics", vid: "uRQH2CFvedY", dur: "18:00", desc: "Chat completions, tokens, and prompt engineering." },
          { id: "ai2", title: "LangChain Fundamentals", vid: "lG7Uxts9SXs", dur: "24:00", desc: "Chains, agents, and memory with LangChain." },
          { id: "ai3", title: "RAG — Retrieval Augmented Generation", vid: "T-D1OfcDW1M", dur: "30:00", desc: "Ground LLM answers in your own documents." },
          { id: "ai4", title: "Vector Databases", vid: "klTvEwg3oJ4", dur: "22:00", desc: "Embeddings, similarity search, and Pinecone/Chroma." },
          { id: "ai5", title: "Fine-tuning LLMs", vid: "eC6Hd1hFvos", dur: "28:00", desc: "Customise GPT models with your own training data." },
          { id: "ai6", title: "Building AI Agents", vid: "aqSioXBtUnM", dur: "35:00", desc: "Autonomous agents with tool use and memory." },
        ]
      },
      {
        icon: "📐", title: "System Design", color: "#e879f9", tag: "Not Started", xp: 0,
        lessons: [
          { id: "sd1", title: "Scalability Fundamentals", vid: "xpDnVSmNFX0", dur: "20:00", desc: "Vertical vs horizontal scaling, load balancers, CDNs." },
          { id: "sd2", title: "Databases at Scale", vid: "W2Z7fbCLSTw", dur: "24:00", desc: "Sharding, replication, and CAP theorem." },
          { id: "sd3", title: "Caching Strategies", vid: "U3RkDLtS7uY", dur: "18:00", desc: "Redis, Memcached, cache invalidation, and CDN caching." },
          { id: "sd4", title: "Message Queues", vid: "oUJbuFMyBDk", dur: "22:00", desc: "Kafka, RabbitMQ, and async processing patterns." },
          { id: "sd5", title: "Microservices Architecture", vid: "rv4LlmLmVWk", dur: "28:00", desc: "Service decomposition, API gateways, and service mesh." },
          { id: "sd6", title: "Design Case Studies", vid: "bUHFg8CZFws", dur: "32:00", desc: "Design Twitter, Netflix, Uber step by step." },
        ]
      },
      {
        icon: "🔧", title: "Go Programming", color: "#00acd7", tag: "Not Started", xp: 0,
        lessons: [
          { id: "go1", title: "Go Basics", vid: "YS4e4q9oBaU", dur: "17:00", desc: "Variables, types, functions, and control flow in Go." },
          { id: "go2", title: "Goroutines & Channels", vid: "f6kdp27TYZs", dur: "22:00", desc: "Concurrency primitives that make Go powerful." },
          { id: "go3", title: "Building REST APIs in Go", vid: "jFfo23yIWac", dur: "25:00", desc: "HTTP server, routing, and middleware with net/http." },
          { id: "go4", title: "Go Modules & Packages", vid: "9cV1TEql-Oc", dur: "18:00", desc: "Organise your Go code with modules and packages." },
          { id: "go5", title: "Testing in Go", vid: "FjkSJ1iXKpg", dur: "20:00", desc: "Unit tests, table-driven tests, and benchmarks." },
        ]
      },
      {
        icon: "🎮", title: "Three.js & WebGL", color: "#ff6b35", tag: "Not Started", xp: 0,
        lessons: [
          { id: "tjs1", title: "Three.js Setup & Scene", vid: "Q7AOvWpIVHU", dur: "16:00", desc: "Create your first 3D scene with camera, lights, and meshes." },
          { id: "tjs2", title: "Geometries & Materials", vid: "sPereCgQnWQ", dur: "21:00", desc: "Built-in geometries, PBR materials, and textures." },
          { id: "tjs3", title: "Animations & Raycasting", vid: "pUgWfqWZWmM", dur: "24:00", desc: "Animate objects and detect mouse interactions in 3D." },
          { id: "tjs4", title: "Post-Processing Effects", vid: "oLvynr1vcy0", dur: "19:00", desc: "Bloom, depth of field, and custom shader passes." },
          { id: "tjs5", title: "3D Portfolio Project", vid: "Q7AOvWpIVHU", dur: "30:00", desc: "Build an impressive 3D portfolio page with Three.js." },
        ]
      },
    ];

    // ── State for PDF section
    const [pdfFile, setPdfFile] = useState(null);
    const [pdfName, setPdfName] = useState("");
    const [pdfLoading, setPdfLoading] = useState(false);
    const [pdfResult, setPdfResult] = useState(null); // {summary, questions:[]}
    const [pdfError, setPdfError] = useState("");
    const [pdfTab, setPdfTab] = useState("summary"); // summary | questions
    const pdfInputRef = useRef(null);

    // ── State for Courses API (port 5005)
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [courseQuiz, setCourseQuiz] = useState([]);
    const [courseNotes, setCourseNotes] = useState("");
    const [allNotes, setAllNotes] = useState([]);
    const [courseLoading, setCourseLoading] = useState(false);
    const [courseError, setCourseError] = useState(null);

    const handlePdfUpload = async (file) => {
      if (!file || file.type !== "application/pdf") { setPdfError("Please upload a valid PDF file."); return; }
      setPdfFile(file); setPdfName(file.name); setPdfLoading(true); setPdfResult(null); setPdfError("");
      try {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("http://localhost:5005/analyze-pdf", {
          method: "POST",
          body: formData
        });
        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        const data = await res.json();
        setPdfResult({ summary: data.summary || "", questions: data.questions || [] });
        setPdfLoading(false);
      } catch (err) {
        setPdfError("Failed to process PDF: " + err.message);
        setPdfLoading(false);
      }
    };

    // ── handleStartCourse: fetch quiz + notes from port 5005
    const handleStartCourse = async (lessonTitle) => {
      setSelectedCourse(lessonTitle);
      setCourseLoading(true);
      setCourseError(null);
      setCourseQuiz([]);
      setCourseNotes("");
      try {
        const [quizRes, notesRes] = await Promise.all([
          fetch("http://localhost:5005/generate-quiz", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ lessonTitle })
          }),
          fetch("http://localhost:5005/generate-notes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ lessonTitle })
          })
        ]);
        const quizData = await quizRes.json();
        const notesData = await notesRes.json();
        setCourseQuiz(quizData.quiz || []);
        setCourseNotes(notesData.notes || "");
      } catch (err) {
        setCourseError("Failed to load course data");
      } finally {
        setCourseLoading(false);
      }
    };

    // ── handleDownloadPDF
    const handleDownloadPDF = async () => {
      if (!selectedCourse) return;
      window.open(`http://localhost:5005/generate-pdf?topic=${encodeURIComponent(selectedCourse)}`, "_blank");
    };

    // ── Fetch all saved notes on mount
    useEffect(() => {
      const fetchAllNotes = async () => {
        try {
          const res = await fetch("http://localhost:5005/notes");
          const data = await res.json();
          setAllNotes(data || []);
        } catch {}
      };
      fetchAllNotes();
    }, []);

    const [pdfAnswers, setPdfAnswers] = useState({});
    const [pdfSubmitted, setPdfSubmitted] = useState(false);

    const submitPdfQuiz = () => setPdfSubmitted(true);
    const pdfScore = pdfResult ? pdfResult.questions.filter((q, i) => pdfAnswers[i] === q.answer).length : 0;

    // ── Lesson player state (hoisted here so PDF section can coexist)
    const [quizState, setQuizState] = useState({}); // {[lessonId]: {checkedBoxes, quizDone, score, notes, unlocked}}
    const [lessonState, setLessonState] = useState({}); // per-lessonId: which checkboxes checked
    const [quizAnswers, setQuizAnswers] = useState({});
    const [quizQuestions, setQuizQuestions] = useState({});
    const [quizLoading, setQuizLoading] = useState({});
    const [quizSubmitted, setQuizSubmitted] = useState({});
    const [lessonNotes, setLessonNotes] = useState({});
    const [lessonTab, setLessonTab] = useState("video"); // video | quiz | notes — hoisted to avoid conditional hook call

    const CHECKBOXES = [
      "I watched the full video",
      "I understood the key concepts",
      "I took notes on the main points",
      "I can explain this topic in my own words",
    ];

    const getLessonState = (lid) => quizState[lid] || { checkedBoxes: [], quizDone: false, score: 0, unlocked: false };

    const toggleCheckbox = (lid, idx) => {
      setQuizState(prev => {
        const s = prev[lid] || { checkedBoxes: [] };
        const boxes = s.checkedBoxes.includes(idx) ? s.checkedBoxes.filter(x => x !== idx) : [...s.checkedBoxes, idx];
        return { ...prev, [lid]: { ...s, checkedBoxes: boxes } };
      });
    };

    const allChecked = (lid) => {
      const s = getLessonState(lid);
      return CHECKBOXES.every((_, i) => s.checkedBoxes.includes(i));
    };

    const generateQuiz = async (lesson) => {
      const lid = lesson.id;
      setQuizLoading(prev => ({ ...prev, [lid]: true }));
      setQuizAnswers(prev => ({ ...prev, [lid]: {} }));
      setQuizSubmitted(prev => ({ ...prev, [lid]: false }));
      try {
        const res = await fetch("http://localhost:5005/generate-quiz", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lessonTitle: lesson.title })
        });
        const data = await res.json();
        // Transform backend format → internal UI format
        // Backend: { quiz: [{ question, options: {A,B,C,D}, answer: "A" }] }
        // UI needs: [{ q, options: ["opt A","opt B",...], answer: 0-indexed-number, explanation }]
        const letterToIndex = { A: 0, B: 1, C: 2, D: 3 };
        const questions = (data.quiz || []).map(item => ({
          q: item.question,
          options: ["A", "B", "C", "D"].map(k => item.options?.[k] ?? ""),
          answer: letterToIndex[item.answer] ?? 0,
          explanation: item.explanation || ""
        }));
        setQuizQuestions(prev => ({ ...prev, [lid]: questions }));
      } catch (e) {
        setQuizQuestions(prev => ({ ...prev, [lid]: null }));
      }
      setQuizLoading(prev => ({ ...prev, [lid]: false }));
    };

    const submitLessonQuiz = (lid) => {
      const qs = quizQuestions[lid] || [];
      const ans = quizAnswers[lid] || {};
      const score = qs.filter((q, i) => ans[i] === q.answer).length;
      setQuizState(prev => ({
        ...prev,
        // Always unlock next lesson after attempting the quiz; performance drives recommendation only
        [lid]: { ...prev[lid], quizDone: true, score, total: qs.length, unlocked: true }
      }));
      setQuizSubmitted(prev => ({ ...prev, [lid]: true }));
    };

    const isUnlocked = (courseTitle, lessonIdx) => {
      if (lessonIdx === 0) return true;
      const course = COURSES_DATA.find(c => c.title === courseTitle);
      if (!course) return false;
      const prevLesson = course.lessons[lessonIdx - 1];
      return getLessonState(prevLesson.id).unlocked;
    };

    // ── Course detail view (lesson player)
    if (activeCourse) {
      const course = COURSES_DATA.find(c => c.title === activeCourse.title) || activeCourse;
      const lessons = course.lessons || [];
      const completedCount = lessons.filter(l => getLessonState(l.id).quizDone).length;
      const pct = lessons.length ? Math.round(completedCount / lessons.length * 100) : 0;
      const C = course.color || "#4f8ef7";

      // Single lesson player
      if (activeLesson) {
        const lid = activeLesson.id;
        const ls = getLessonState(lid);
        const qs = quizQuestions[lid];
        const qAns = quizAnswers[lid] || {};
        const submitted = quizSubmitted[lid];
        const score = submitted ? (qs || []).filter((q, i) => qAns[i] === q.answer).length : 0;
        const totalQs = qs ? qs.length : (ls.total || 5);
        const pct2 = qs ? Math.round(score / totalQs * 100) : 0;
        const allBoxesChecked = allChecked(lid);
        const notes = lessonNotes[lid] || "";
        // Derive next lesson based on quiz performance
        const lessonIdx = lessons.findIndex(l => l.id === activeLesson.id);
        const nextLesson = pct2 >= 80
          ? lessons[lessonIdx + 1]           // great score → advance normally
          : pct2 >= 60
            ? lessons[lessonIdx + 1]         // good score → still advance
            : lessons[lessonIdx];            // low score → suggest redo current

        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 0, borderRadius: 18, overflow: "hidden", border: "1px solid rgba(255,255,255,.07)", animation: "fadeUp .3s ease both" }}>
            {/* Back bar */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 20px", background: "#13151d", borderBottom: "1px solid rgba(255,255,255,.07)" }}>
              <button onClick={() => setActiveLesson(null)} style={{ padding: "7px 14px", borderRadius: 9, background: "rgba(255,255,255,.06)", border: "none", color: "#9aa5bc", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>← {course.title}</button>
              <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 14, flex: 1 }}>{activeLesson.title}</div>
              <span style={{ fontSize: 11, color: "#6b7a99", fontFamily: "'JetBrains Mono',monospace" }}>⏱ {activeLesson.dur}</span>
              {ls.quizDone && <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 99, background: "rgba(16,185,129,.18)", color: "#10b981", border: "1px solid rgba(16,185,129,.3)" }}>✓ {ls.score}/{ls.total || 5} · Unlocked</span>}
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,.07)", background: "#0f1117" }}>
              {[["video", "📺 Video"], ["quiz", "🧠 AI Quiz"], ["notes", "📝 Notes"]].map(([id, lbl]) => (
                <button key={id} onClick={() => setLessonTab(id)}
                  style={{ padding: "13px 22px", border: "none", borderBottom: `2.5px solid ${lessonTab === id ? C : "transparent"}`, background: "transparent", color: lessonTab === id ? C : "#6b7a99", cursor: "pointer", fontSize: 13, fontWeight: lessonTab === id ? 700 : 500, display: "flex", alignItems: "center", gap: 7, transition: "all .2s", fontFamily: "'DM Sans',sans-serif" }}>
                  {lbl}
                </button>
              ))}
            </div>

            {/* VIDEO TAB */}
            {lessonTab === "video" && (
              <div>
                <VideoPlayer vid={activeLesson.vid} title={activeLesson.title} dur={activeLesson.dur} />
                <div style={{ padding: "24px 28px" }}>
                  <p style={{ fontSize: 13, color: "#9aa5bc", lineHeight: 1.75, marginBottom: 24 }}>{activeLesson.desc}</p>

                  {/* 4 checkboxes */}
                  <div style={{ background: "linear-gradient(135deg,rgba(79,142,247,.1),rgba(124,58,237,.06))", border: "1px solid rgba(79,142,247,.25)", borderRadius: 16, padding: "20px 22px", marginBottom: 20 }}>
                    <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 14, marginBottom: 14, color: "#f0f2f8" }}>✅ Lesson Checklist</div>
                    {CHECKBOXES.map((label, i) => {
                      const checked = ls.checkedBoxes.includes(i);
                      return (
                        <div key={i} onClick={() => toggleCheckbox(lid, i)}
                          style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 14px", borderRadius: 11, cursor: "pointer", marginBottom: 8, background: checked ? "rgba(16,185,129,.1)" : "rgba(255,255,255,.03)", border: `1.5px solid ${checked ? "rgba(16,185,129,.35)" : "rgba(255,255,255,.08)"}`, transition: "all .2s" }}>
                          <div style={{ width: 20, height: 20, borderRadius: 6, border: `2px solid ${checked ? "#10b981" : "rgba(255,255,255,.2)"}`, background: checked ? "rgba(16,185,129,.25)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all .2s" }}>
                            {checked && <span style={{ color: "#10b981", fontSize: 12, fontWeight: 900, animation: "checkPop .3s ease" }}>✓</span>}
                          </div>
                          <span style={{ fontSize: 13, color: checked ? "#10b981" : "#c0c9d9", fontWeight: checked ? 600 : 400, transition: "color .2s" }}>{label}</span>
                        </div>
                      );
                    })}
                    {allBoxesChecked && !ls.quizDone && (
                      <button onClick={() => { generateQuiz(activeLesson); setLessonTab("quiz"); }}
                        style={{ width: "100%", marginTop: 12, padding: "13px", borderRadius: 12, background: `linear-gradient(135deg,${C},#7c3aed)`, color: "#fff", border: "none", cursor: "pointer", fontSize: 14, fontWeight: 800, boxShadow: `0 6px 24px ${C}44`, fontFamily: "'Syne',sans-serif", animation: "glowPulse 2s ease-in-out infinite" }}>
                        🧠 Take AI Quiz →
                      </button>
                    )}
                    {!allBoxesChecked && (
                      <div style={{ marginTop: 10, fontSize: 12, color: "#6b7a99", textAlign: "center", fontFamily: "'JetBrains Mono',monospace" }}>
                        Check all boxes to unlock the quiz ({ls.checkedBoxes.length}/4)
                      </div>
                    )}
                    {ls.quizDone && (
                      <div style={{ marginTop: 12, padding: "11px 14px", borderRadius: 11, background: "rgba(16,185,129,.1)", border: "1px solid rgba(16,185,129,.3)", display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: 18 }}>🏆</span>
                        <span style={{ fontSize: 13, color: "#10b981", fontWeight: 700 }}>Quiz complete! Score: {ls.score}/5 · {ls.unlocked ? "Next lesson unlocked" : "Retry to unlock next"}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* QUIZ TAB */}
            {lessonTab === "quiz" && (
              <div style={{ padding: "28px", maxWidth: 740 }}>
                {/* Generate quiz if not yet */}
                {!qs && !quizLoading[lid] && (
                  <div style={{ textAlign: "center", padding: "40px", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
                    <div style={{ fontSize: 52, animation: "duckBob 2s ease-in-out infinite" }}>🦆</div>
                    <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 18 }}>Ready for the Quiz?</div>
                    <div style={{ fontSize: 13, color: "#9aa5bc", maxWidth: 360, lineHeight: 1.7 }}>
                      Click below to generate 5 AI-powered questions specifically about <strong style={{ color: "#f0f2f8" }}>"{activeLesson.title}"</strong>.
                    </div>
                    {!allBoxesChecked && (
                      <div style={{ fontSize: 12, color: "#f59e0b", padding: "8px 16px", borderRadius: 10, background: "rgba(245,158,11,.1)", border: "1px solid rgba(245,158,11,.3)" }}>
                        ⚠️ Complete the video checklist first
                      </div>
                    )}
                    <button onClick={() => generateQuiz(activeLesson)} disabled={!allBoxesChecked}
                      style={{ padding: "13px 36px", borderRadius: 14, background: allBoxesChecked ? `linear-gradient(135deg,${C},#7c3aed)` : "rgba(255,255,255,.06)", color: allBoxesChecked ? "#fff" : "#6b7a99", border: "none", cursor: allBoxesChecked ? "pointer" : "default", fontSize: 14, fontWeight: 800, boxShadow: allBoxesChecked ? `0 6px 28px ${C}44` : "none", fontFamily: "'Syne',sans-serif" }}>
                      🚀 Generate Quiz
                    </button>
                  </div>
                )}

                {quizLoading[lid] && (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: "40px" }}>
                    <div style={{ fontSize: 52, animation: "duckBob 1s ease-in-out infinite" }}>🦆</div>
                    <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 16 }}>Generating quiz about "{activeLesson.title}"…</div>
                    <div style={{ width: 260, height: 5, borderRadius: 99, background: "rgba(255,255,255,.07)", overflow: "hidden" }}>
                      <div style={{ height: "100%", background: `linear-gradient(90deg,${C},#7c3aed)`, borderRadius: 99, animation: "progressFill 1.5s ease-in-out infinite alternate", width: "65%" }} />
                    </div>
                  </div>
                )}

                {qs === null && !quizLoading[lid] && (
                  <div style={{ textAlign: "center", padding: "30px", color: "#f43f5e" }}>
                    <div style={{ fontSize: 36, marginBottom: 10 }}>⚠️</div>
                    <div style={{ fontWeight: 700, marginBottom: 8 }}>Could not generate quiz</div>
                    <div style={{ fontSize: 12, color: "#9aa5bc", marginBottom: 16 }}>Claude API not reachable from browser (CORS). Connect a backend proxy to enable quiz generation.</div>
                    <button onClick={() => generateQuiz(activeLesson)} style={{ padding: "9px 22px", borderRadius: 10, background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)", color: "#9aa5bc", cursor: "pointer", fontSize: 13 }}>🔄 Retry</button>
                  </div>
                )}

                {qs && qs.length > 0 && !quizLoading[lid] && (
                  <div style={{ animation: "slideUp .3s ease both" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                      <div style={{ animation: "duckWalk .7s ease-in-out infinite", fontSize: 22 }}>🦆</div>
                      <div>
                        <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 15 }}>Quiz: {activeLesson.title}</div>
                        <div style={{ fontSize: 11, color: "#6b7a99", fontFamily: "'JetBrains Mono',monospace" }}>5 questions · Score ≥3/5 to unlock next lesson</div>
                      </div>
                    </div>

                    {!submitted ? (
                      <>
                        {qs.map((q, qi) => (
                          <div key={qi} style={{ background: "#16181f", border: "1px solid rgba(255,255,255,.07)", borderRadius: 14, padding: "20px 22px", marginBottom: 14, animation: `cardPop .4s ${qi * .07}s ease both` }}>
                            <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 15, marginBottom: 14, lineHeight: 1.5 }}>{qi + 1}. {q.q}</div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                              {q.options.map((opt, oi) => {
                                const sel = qAns[qi] === oi;
                                return (
                                  <div key={oi} onClick={() => setQuizAnswers(prev => ({ ...prev, [lid]: { ...(prev[lid] || {}), [qi]: oi } }))}
                                    style={{ display: "flex", gap: 12, alignItems: "center", padding: "12px 16px", borderRadius: 11, cursor: "pointer", background: sel ? `${C}18` : "rgba(255,255,255,.03)", border: `1.5px solid ${sel ? C : "rgba(255,255,255,.08)"}`, transition: "all .18s" }}
                                    onMouseEnter={e => { if (!sel) { e.currentTarget.style.background = "rgba(255,255,255,.06)"; e.currentTarget.style.borderColor = "rgba(255,255,255,.18)"; } }}
                                    onMouseLeave={e => { if (!sel) { e.currentTarget.style.background = "rgba(255,255,255,.03)"; e.currentTarget.style.borderColor = "rgba(255,255,255,.08)"; } }}
                                  >
                                    <div style={{ width: 30, height: 30, borderRadius: 8, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, fontFamily: "'JetBrains Mono',monospace", background: sel ? C : "rgba(255,255,255,.07)", color: sel ? "#fff" : "#6b7a99", transition: "all .18s" }}>
                                      {["A", "B", "C", "D"][oi]}
                                    </div>
                                    <span style={{ fontSize: 13, fontWeight: sel ? 600 : 400, color: sel ? "#f0f2f8" : "#c0c9d9", flex: 1 }}>{opt}</span>
                                    {sel && <div style={{ width: 8, height: 8, borderRadius: "50%", background: C, flexShrink: 0 }} />}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: 12, color: "#6b7a99", fontFamily: "'JetBrains Mono',monospace" }}>{Object.keys(qAns).length}/5 answered</span>
                          <button
                            onClick={() => submitLessonQuiz(lid)}
                            disabled={Object.keys(qAns).length < 5}
                            style={{ padding: "12px 32px", borderRadius: 12, background: Object.keys(qAns).length >= 5 ? `linear-gradient(135deg,${C},#7c3aed)` : "rgba(255,255,255,.06)", color: Object.keys(qAns).length >= 5 ? "#fff" : "#6b7a99", border: "none", cursor: Object.keys(qAns).length >= 5 ? "pointer" : "default", fontSize: 14, fontWeight: 800, boxShadow: Object.keys(qAns).length >= 5 ? `0 6px 24px ${C}44` : "none", transition: "all .3s", fontFamily: "'Syne',sans-serif" }}>
                            Submit Quiz ✓
                          </button>
                        </div>
                      </>
                    ) : (
                      // Results
                      <div style={{ animation: "ringPop .5s ease both" }}>
                        {/* Score Card */}
                        <div style={{ textAlign: "center", padding: "28px", background: `linear-gradient(135deg,${pct2 >= 60 ? "rgba(16,185,129,.12)" : "rgba(244,63,94,.08)"},rgba(15,17,23,.95))`, border: `1.5px solid ${pct2 >= 60 ? "rgba(16,185,129,.35)" : "rgba(244,63,94,.35)"}`, borderRadius: 18, marginBottom: 16 }}>
                          <div style={{ fontSize: 52, marginBottom: 8, animation: "heartBeat 1.5s ease-in-out infinite" }}>{pct2 >= 80 ? "🏆" : pct2 >= 60 ? "⚡" : "📚"}</div>
                          <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 900, fontSize: 48, color: "#f0f2f8", lineHeight: 1 }}>{pct2}<span style={{ fontSize: 24, color: "#6b7a99" }}>%</span></div>
                          <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 18, color: pct2 >= 60 ? "#10b981" : "#f43f5e", margin: "6px 0 4px" }}>{pct2 >= 80 ? "Excellent!" : pct2 >= 60 ? "Good Job!" : "Keep Going!"}</div>
                          <div style={{ fontSize: 13, color: "#9aa5bc", marginBottom: 16 }}>{score}/{totalQs} correct</div>
                        </div>

                        {/* Dynamic next-lesson recommendation */}
                        <div style={{ padding: "14px 18px", borderRadius: 14, marginBottom: 16,
                          background: pct2 >= 80 ? "rgba(16,185,129,.1)" : pct2 >= 60 ? "rgba(79,142,247,.1)" : "rgba(245,158,11,.1)",
                          border: `1px solid ${pct2 >= 80 ? "rgba(16,185,129,.35)" : pct2 >= 60 ? "rgba(79,142,247,.35)" : "rgba(245,158,11,.35)"}`
                        }}>
                          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 6,
                            color: pct2 >= 80 ? "#10b981" : pct2 >= 60 ? "#4f8ef7" : "#f59e0b" }}>
                            {pct2 >= 80 ? "🚀 Excellent performance!" : pct2 >= 60 ? "✅ Good job — ready to advance" : "📚 Consider reviewing before moving on"}
                          </div>
                          <div style={{ fontSize: 12, color: "#9aa5bc", lineHeight: 1.6 }}>
                            {pct2 >= 80
                              ? nextLesson && nextLesson.id !== activeLesson.id
                                ? <>Next up: <strong style={{ color: "#f0f2f8" }}>{nextLesson.title}</strong> — you've earned it!</>
                                : "You've completed all lessons in this course! 🎉"
                              : pct2 >= 60
                                ? nextLesson && nextLesson.id !== activeLesson.id
                                  ? <>Suggested next: <strong style={{ color: "#f0f2f8" }}>{nextLesson.title}</strong></>
                                  : "Great — course complete!"
                                : <>Suggested: <strong style={{ color: "#f0f2f8" }}>Re-watch "{activeLesson.title}"</strong> then retry the quiz</>
                            }
                          </div>
                        </div>

                        {/* Breakdown */}
                        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
                          {qs.map((q, qi) => {
                            const correct = qAns[qi] === q.answer;
                            return (
                              <div key={qi} style={{ padding: "12px 14px", borderRadius: 12, background: correct ? "rgba(16,185,129,.07)" : "rgba(244,63,94,.07)", border: `1px solid ${correct ? "rgba(16,185,129,.2)" : "rgba(244,63,94,.2)"}` }}>
                                <div style={{ display: "flex", gap: 8, marginBottom: 5 }}>
                                  <span>{correct ? "✅" : "❌"}</span>
                                  <div style={{ fontSize: 12, fontWeight: 600, color: "#f0f2f8", flex: 1 }}>{q.q}</div>
                                </div>
                                <div style={{ fontSize: 11, color: "#9aa5bc", marginBottom: q.explanation ? 5 : 0 }}>
                                  Your answer: <span style={{ color: correct ? "#10b981" : "#f43f5e", fontWeight: 600 }}>{q.options[qAns[qi]] || "Not answered"}</span>
                                  {!correct && <> · Correct: <span style={{ color: "#10b981", fontWeight: 600 }}>{q.options[q.answer]}</span></>}
                                </div>
                                {q.explanation && <div style={{ fontSize: 11, color: "#9aa5bc", padding: "6px 9px", borderRadius: 8, background: "rgba(255,255,255,.04)" }}>💡 {q.explanation}</div>}
                              </div>
                            );
                          })}
                        </div>

                        {/* Action buttons */}
                        <div style={{ display: "flex", gap: 10 }}>
                          <button onClick={() => { setQuizAnswers(prev => ({ ...prev, [lid]: {} })); setQuizSubmitted(prev => ({ ...prev, [lid]: false })); generateQuiz(activeLesson); }}
                            style={{ flex: 1, padding: "11px", borderRadius: 11, background: `rgba(${C.includes("4f8ef7") ? "79,142,247" : "124,58,237"},.12)`, border: `1px solid ${C}44`, color: C, cursor: "pointer", fontSize: 13, fontWeight: 700 }}>
                            🔄 Retry Quiz
                          </button>
                          <button onClick={() => setLessonTab("notes")}
                            style={{ flex: 1, padding: "11px", borderRadius: 11, background: "rgba(245,158,11,.1)", border: "1px solid rgba(245,158,11,.3)", color: "#f59e0b", cursor: "pointer", fontSize: 13, fontWeight: 700 }}>
                            📝 Take Notes
                          </button>
                          {nextLesson && nextLesson.id !== activeLesson.id && (
                            <button
                              onClick={() => { setActiveLesson(nextLesson); setLessonTab("video"); }}
                              style={{ flex: 1, padding: "11px", borderRadius: 11,
                                background: pct2 >= 60 ? `linear-gradient(135deg,${C},#7c3aed)` : "rgba(255,255,255,.06)",
                                border: pct2 >= 60 ? "none" : "1px solid rgba(255,255,255,.1)",
                                color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 700,
                                boxShadow: pct2 >= 60 ? `0 4px 16px ${C}44` : "none"
                              }}>
                              {pct2 >= 60 ? `▶ ${nextLesson.title.length > 18 ? nextLesson.title.slice(0,18)+"…" : nextLesson.title} →` : `Skip to Next →`}
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* NOTES TAB */}
            {lessonTab === "notes" && (
              <div style={{ padding: "28px", maxWidth: 740 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 13, background: "linear-gradient(135deg,#f59e0b,#d97706)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>📝</div>
                  <div>
                    <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 17 }}>My Notes</div>
                    <div style={{ fontSize: 12, color: "#6b7a99" }}>Jot down key takeaways from "{activeLesson.title}"</div>
                  </div>
                </div>
                <textarea
                  value={notes}
                  onChange={e => setLessonNotes(prev => ({ ...prev, [lid]: e.target.value }))}
                  placeholder={`📌 Key points from "${activeLesson.title}":\n\n• \n• \n• \n\n💡 My main takeaway:\n\n\n❓ Questions I still have:\n`}
                  style={{ width: "100%", minHeight: 340, padding: "18px", borderRadius: 16, border: "1.5px solid rgba(245,158,11,.25)", background: "rgba(245,158,11,.04)", color: "#f0f2f8", fontSize: 14, lineHeight: 1.8, resize: "vertical", outline: "none", fontFamily: "'DM Sans',sans-serif", boxSizing: "border-box", display: "block", transition: "border-color .2s" }}
                  onFocus={e => { e.target.style.borderColor = "rgba(245,158,11,.6)"; e.target.style.background = "rgba(245,158,11,.08)"; }}
                  onBlur={e => { e.target.style.borderColor = "rgba(245,158,11,.25)"; e.target.style.background = "rgba(245,158,11,.04)"; }}
                />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
                  <span style={{ fontSize: 11, color: "#56637a", fontFamily: "'JetBrains Mono',monospace" }}>{notes.length} chars · saved locally</span>
                  <button onClick={() => setActiveLesson(null)}
                    style={{ padding: "10px 22px", borderRadius: 11, background: `linear-gradient(135deg,${C},#7c3aed)`, color: "#fff", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 700 }}>
                    ← Back to Course
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      } // end activeLesson

      // Course detail (lesson list)
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <button onClick={() => setActiveCourse(null)} style={{ padding: "8px 16px", borderRadius: 10, background: "rgba(255,255,255,.06)", border: "none", color: "#9aa5bc", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>← All Courses</button>
            <span style={{ fontSize: 30 }}>{course.icon}</span>
            <div>
              <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 20 }}>{course.title}</div>
              <div style={{ fontSize: 12, color: "#6b7a99" }}>{completedCount}/{lessons.length} lessons · {course.xp} XP</div>
            </div>
            <Pill label={course.tag || "In Progress"} color={C} />
          </div>

          {/* Progress */}
          <div style={{ background: "#16181f", border: `1px solid ${C}22`, borderRadius: 14, padding: "18px 20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: "#9aa5bc" }}>Progress</span>
              <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 16, color: C }}>{pct}%</span>
            </div>
            <div style={{ height: 7, borderRadius: 99, background: "rgba(255,255,255,.07)" }}>
              <div style={{ height: "100%", width: `${pct}%`, background: `linear-gradient(90deg,${C},${C}99)`, borderRadius: 99, transition: "width 1s ease" }} />
            </div>
          </div>

          {/* Lesson list */}
          <div style={{ background: "#16181f", border: "1px solid rgba(255,255,255,.07)", borderRadius: 14, overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,.07)", fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 15 }}>📖 Lessons</div>
            {lessons.map((l, j) => {
              const ls2 = getLessonState(l.id);
              const locked = !isUnlocked(course.title, j);
              const done = ls2.quizDone;
              return (
                <div key={l.id}
                  style={{ display: "flex", gap: 14, alignItems: "center", padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,.04)", cursor: locked ? "default" : "pointer", opacity: locked ? .5 : 1, transition: "background .15s" }}
                  onMouseEnter={e => { if (!locked) e.currentTarget.style.background = "rgba(255,255,255,.025)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
                  <div style={{ width: 34, height: 34, borderRadius: "50%", flexShrink: 0, background: done ? "rgba(16,185,129,.18)" : locked ? "rgba(255,255,255,.04)" : `${C}14`, border: `2px solid ${done ? "#10b981" : locked ? "rgba(255,255,255,.1)" : C + "44"}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {done ? <span style={{ fontSize: 14, color: "#10b981", fontWeight: 800 }}>✓</span>
                      : locked ? <span style={{ fontSize: 12 }}>🔒</span>
                        : <span style={{ fontSize: 12, fontWeight: 800, color: C, fontFamily: "'Syne',sans-serif" }}>{j + 1}</span>}
                  </div>
                  {/* Thumbnail */}
                  <div style={{ width: 88, height: 50, borderRadius: 8, overflow: "hidden", flexShrink: 0, background: "#0f1117", position: "relative" }}>
                    {locked
                      ? <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg,#1a1a28,#14141e)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <span style={{ fontSize: 20, opacity: 0.4 }}>🔒</span>
                        </div>
                      : <>
                          <img src={`https://img.youtube.com/vi/${l.vid}/mqdefault.jpg`} alt={l.title} style={{ width: "100%", height: "100%", objectFit: "cover", opacity: .85 }} onError={e => { e.target.src = `https://img.youtube.com/vi/${l.vid}/hqdefault.jpg`; }} />
                          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,.28)" }}>
                            <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#ff0000", display: "flex", alignItems: "center", justifyContent: "center" }}><div style={{ width: 0, height: 0, borderTop: "4px solid transparent", borderBottom: "4px solid transparent", borderLeft: "7px solid #fff", marginLeft: 2 }} /></div>
                          </div>
                        </>
                    }
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: locked ? "#3a3a50" : done ? "#9aa5bc" : "#f0f2f8", marginBottom: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {locked ? "🔒 Lesson Locked" : l.title}
                    </div>
                    <div style={{ fontSize: 11, color: "#6b7a99", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {locked ? "Complete the previous quiz to reveal this lesson" : l.desc}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                    {!locked && <span style={{ fontSize: 11, color: "#6b7a99", fontFamily: "'JetBrains Mono',monospace" }}>⏱ {l.dur}</span>}
                    {ls2.quizDone && <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 99, background: "rgba(16,185,129,.15)", color: "#10b981" }}>{ls2.score}/{ls2.total || 5}</span>}
                    {!locked && (
                      <button onClick={() => { setActiveLesson(l); setLessonTab("video"); }}
                        style={{ padding: "6px 14px", borderRadius: 8, background: `linear-gradient(135deg,${C},${C}99)`, border: "none", color: "#fff", cursor: "pointer", fontSize: 11, fontWeight: 700 }}>
                        {done ? "Review" : "▶ Watch"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    } // end activeCourse

    // ── COURSE GRID (default view)
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {/* Course grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
          {COURSES_DATA.map((c, i) => {
            const completed2 = c.lessons.filter(l => getLessonState(l.id).quizDone).length;
            const pct2 = c.lessons.length ? Math.round(completed2 / c.lessons.length * 100) : 0;
            return (
              <div key={i}
                style={{ background: "#1e2130", borderRadius: 14, padding: "20px", border: `1px solid ${c.color}22`, transition: "transform .2s,border-color .2s,box-shadow .2s", cursor: "pointer", animation: `cardPop .4s ${i * .04}s ease both` }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.borderColor = c.color; e.currentTarget.style.boxShadow = `0 8px 32px ${c.color}22`; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.borderColor = `${c.color}22`; e.currentTarget.style.boxShadow = "none"; }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <span style={{ fontSize: 28 }}>{c.icon}</span>
                  <Pill label={c.tag || "Not Started"} color={c.color} />
                </div>
                <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 15, marginBottom: 4, lineHeight: 1.3 }}>{c.title}</div>
                <div style={{ fontSize: 11, color: "#6b7a99", marginBottom: 12 }}>{c.lessons.length} lessons</div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ fontSize: 11, color: "#6b7a99" }}>{completed2}/{c.lessons.length}</span>
                  <span style={{ fontSize: 12, fontWeight: 800, color: c.color, fontFamily: "'Syne',sans-serif" }}>{pct2}%</span>
                </div>
                <div style={{ height: 5, borderRadius: 99, background: "rgba(255,255,255,.07)", marginBottom: 14, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${pct2}%`, background: `linear-gradient(90deg,${c.color},${c.color}88)`, borderRadius: 99, transition: "width 1.2s ease" }} />
                </div>
                <button onClick={() => { setActiveCourse(c); handleStartCourse(c.title); }}
                  style={{ width: "100%", padding: "10px", borderRadius: 10, background: `linear-gradient(135deg,${c.color},${c.color}99)`, color: "#fff", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>
                  {pct2 === 100 ? "Review Course" : completed2 === 0 ? "Start Course →" : "Continue →"}
                </button>
              </div>
            );
          })}
        </div>

        {/* ── PDF Section ── */}
        <div style={{ background: "#16181f", border: "1px solid rgba(255,255,255,.07)", borderRadius: 20, padding: "24px", marginTop: 4 }}>
          <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 17, marginBottom: 4 }}>📄 PDF Study Assistant</div>
          <div style={{ fontSize: 13, color: "#6b7a99", marginBottom: 20 }}>Upload any PDF — get an AI summary and 10 quiz questions instantly</div>

          {!pdfResult && !pdfLoading && (
            <>
              <div
                onClick={() => pdfInputRef.current?.click()}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 20px", borderRadius: 16, border: "2px dashed rgba(124,58,237,.35)", background: "rgba(124,58,237,.05)", cursor: "pointer", transition: "all .2s", gap: 12 }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(124,58,237,.7)"; e.currentTarget.style.background = "rgba(124,58,237,.1)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(124,58,237,.35)"; e.currentTarget.style.background = "rgba(124,58,237,.05)"; }}>
                <span style={{ fontSize: 48, opacity: .6 }}>📄</span>
                <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 16, color: "#a78bfa" }}>Click to upload PDF</div>
                <div style={{ fontSize: 12, color: "#6b7a99" }}>AI will generate a summary + 10 quiz questions</div>
                {pdfError && <div style={{ fontSize: 12, color: "#f43f5e", marginTop: 4 }}>⚠️ {pdfError}</div>}
              </div>
              <input ref={pdfInputRef} type="file" accept=".pdf" style={{ display: "none" }} onChange={e => { const f = e.target.files?.[0]; if (f) { setPdfAnswers({}); setPdfSubmitted(false); handlePdfUpload(f); } }} />
            </>
          )}

          {pdfLoading && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: "40px" }}>
              <div style={{ fontSize: 48, animation: "duckBob 1s ease-in-out infinite" }}>🦆</div>
              <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 16 }}>Analysing "{pdfName}"…</div>
              <div style={{ width: 260, height: 5, borderRadius: 99, background: "rgba(255,255,255,.07)", overflow: "hidden" }}>
                <div style={{ height: "100%", background: "linear-gradient(90deg,#7c3aed,#4f8ef7)", borderRadius: 99, animation: "progressFill 1.5s ease-in-out infinite alternate", width: "65%" }} />
              </div>
              <div style={{ fontSize: 12, color: "#6b7a99", fontFamily: "'JetBrains Mono',monospace" }}>Generating summary and 10 questions…</div>
            </div>
          )}

          {pdfResult && !pdfLoading && (
            <>
              {/* File info + reset */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, padding: "12px 16px", borderRadius: 12, background: "rgba(124,58,237,.1)", border: "1px solid rgba(124,58,237,.3)" }}>
                <span style={{ fontSize: 22 }}>📄</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#a78bfa" }}>{pdfName}</div>
                  <div style={{ fontSize: 11, color: "#6b7a99" }}>Analysis complete</div>
                </div>
                <button onClick={() => { setPdfResult(null); setPdfFile(null); setPdfName(""); setPdfAnswers({}); setPdfSubmitted(false); setPdfError(""); }}
                  style={{ padding: "6px 14px", borderRadius: 9, background: "rgba(244,63,94,.12)", border: "1px solid rgba(244,63,94,.3)", color: "#f43f5e", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>
                  ✕ Clear
                </button>
              </div>

              {/* PDF Tabs */}
              <div style={{ display: "flex", gap: 0, borderBottom: "1px solid rgba(255,255,255,.07)", marginBottom: 20 }}>
                {[["summary", "📋 Summary"], ["questions", "🧠 Quiz (10 Qs)"]].map(([id, lbl]) => (
                  <button key={id} onClick={() => { setPdfTab(id); }}
                    style={{ padding: "12px 22px", border: "none", borderBottom: `2.5px solid ${pdfTab === id ? "#7c3aed" : "transparent"}`, background: "transparent", color: pdfTab === id ? "#a78bfa" : "#6b7a99", cursor: "pointer", fontSize: 13, fontWeight: pdfTab === id ? 700 : 500, transition: "all .2s", fontFamily: "'DM Sans',sans-serif" }}>
                    {lbl}
                  </button>
                ))}
              </div>

              {pdfTab === "summary" && (
                <div style={{ padding: "20px 22px", borderRadius: 16, background: "rgba(124,58,237,.07)", border: "1px solid rgba(124,58,237,.2)", animation: "fadeUp .3s ease both" }}>
                  <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 15, marginBottom: 12, color: "#a78bfa" }}>📋 Document Summary</div>
                  <p style={{ fontSize: 14, color: "#e2e8f0", lineHeight: 1.85, margin: 0, whiteSpace: "pre-wrap" }}>{pdfResult.summary}</p>
                  <button onClick={() => setPdfTab("questions")} style={{ marginTop: 20, padding: "11px 28px", borderRadius: 12, background: "linear-gradient(135deg,#7c3aed,#4f8ef7)", color: "#fff", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 700 }}>
                    Take Quiz on this PDF →
                  </button>
                </div>
              )}

              {pdfTab === "questions" && (
                <div style={{ animation: "fadeUp .3s ease both" }}>
                  {!pdfSubmitted ? (
                    <>
                      {(pdfResult.questions || []).map((q, qi) => (
                        <div key={qi} style={{ background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.07)", borderRadius: 14, padding: "18px 20px", marginBottom: 12, animation: `cardPop .4s ${qi * .05}s ease both` }}>
                          <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 14, marginBottom: 12, lineHeight: 1.5 }}>{qi + 1}. {q.q}</div>
                          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                            {q.options.map((opt, oi) => {
                              const sel = pdfAnswers[qi] === oi;
                              return (
                                <div key={oi} onClick={() => setPdfAnswers(prev => ({ ...prev, [qi]: oi }))}
                                  style={{ display: "flex", gap: 10, alignItems: "center", padding: "10px 14px", borderRadius: 10, cursor: "pointer", background: sel ? "rgba(124,58,237,.18)" : "rgba(255,255,255,.02)", border: `1.5px solid ${sel ? "#7c3aed" : "rgba(255,255,255,.07)"}`, transition: "all .18s" }}
                                  onMouseEnter={e => { if (!sel) { e.currentTarget.style.background = "rgba(255,255,255,.05)"; e.currentTarget.style.borderColor = "rgba(255,255,255,.15)"; } }}
                                  onMouseLeave={e => { if (!sel) { e.currentTarget.style.background = "rgba(255,255,255,.02)"; e.currentTarget.style.borderColor = "rgba(255,255,255,.07)"; } }}
                                >
                                  <div style={{ width: 26, height: 26, borderRadius: 7, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, fontFamily: "'JetBrains Mono',monospace", background: sel ? "#7c3aed" : "rgba(255,255,255,.07)", color: sel ? "#fff" : "#6b7a99", transition: "all .18s" }}>
                                    {["A", "B", "C", "D"][oi]}
                                  </div>
                                  <span style={{ fontSize: 13, color: sel ? "#f0f2f8" : "#c0c9d9", fontWeight: sel ? 600 : 400, flex: 1 }}>{opt}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: 12, color: "#6b7a99", fontFamily: "'JetBrains Mono',monospace" }}>{Object.keys(pdfAnswers).length}/10 answered</span>
                        <button
                          onClick={submitPdfQuiz}
                          disabled={Object.keys(pdfAnswers).length < 10}
                          style={{ padding: "12px 28px", borderRadius: 12, background: Object.keys(pdfAnswers).length >= 10 ? "linear-gradient(135deg,#7c3aed,#4f8ef7)" : "rgba(255,255,255,.06)", color: Object.keys(pdfAnswers).length >= 10 ? "#fff" : "#6b7a99", border: "none", cursor: Object.keys(pdfAnswers).length >= 10 ? "pointer" : "default", fontSize: 13, fontWeight: 800, transition: "all .3s", fontFamily: "'Syne',sans-serif" }}>
                          Submit Answers ✓
                        </button>
                      </div>
                    </>
                  ) : (
                    <div style={{ animation: "ringPop .5s ease both" }}>
                      <div style={{ textAlign: "center", padding: "28px", background: `linear-gradient(135deg,${pdfScore >= 7 ? "rgba(16,185,129,.12)" : "rgba(245,158,11,.1)"},rgba(15,17,23,.95))`, border: `1.5px solid ${pdfScore >= 7 ? "rgba(16,185,129,.35)" : "rgba(245,158,11,.35)"}`, borderRadius: 18, marginBottom: 20 }}>
                        <div style={{ fontSize: 44, marginBottom: 8 }}>{pdfScore >= 8 ? "🏆" : pdfScore >= 6 ? "⚡" : "📚"}</div>
                        <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 900, fontSize: 44, color: "#f0f2f8", lineHeight: 1 }}>{Math.round(pdfScore / 10 * 100)}<span style={{ fontSize: 22, color: "#6b7a99" }}>%</span></div>
                        <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 16, color: pdfScore >= 6 ? "#10b981" : "#f59e0b", margin: "6px 0 4px" }}>{pdfScore >= 8 ? "Excellent!" : pdfScore >= 6 ? "Good Job!" : "Keep Studying!"}</div>
                        <div style={{ fontSize: 13, color: "#9aa5bc" }}>{pdfScore}/10 correct</div>
                      </div>
                      {(pdfResult.questions || []).map((q, qi) => {
                        const correct = pdfAnswers[qi] === q.answer;
                        return (
                          <div key={qi} style={{ padding: "11px 14px", borderRadius: 12, background: correct ? "rgba(16,185,129,.07)" : "rgba(244,63,94,.07)", border: `1px solid ${correct ? "rgba(16,185,129,.2)" : "rgba(244,63,94,.2)"}`, marginBottom: 9 }}>
                            <div style={{ display: "flex", gap: 8, marginBottom: 4 }}>
                              <span>{correct ? "✅" : "❌"}</span>
                              <div style={{ fontSize: 12, fontWeight: 600, color: "#f0f2f8", flex: 1 }}>{q.q}</div>
                            </div>
                            <div style={{ fontSize: 11, color: "#9aa5bc" }}>
                              Your: <span style={{ color: correct ? "#10b981" : "#f43f5e", fontWeight: 600 }}>{q.options[pdfAnswers[qi]] || "—"}</span>
                              {!correct && <> · Correct: <span style={{ color: "#10b981", fontWeight: 600 }}>{q.options[q.answer]}</span></>}
                            </div>
                          </div>
                        );
                      })}
                      <button onClick={() => { setPdfAnswers({}); setPdfSubmitted(false); }} style={{ marginTop: 8, padding: "10px 22px", borderRadius: 11, background: "rgba(124,58,237,.15)", border: "1px solid rgba(124,58,237,.3)", color: "#a78bfa", cursor: "pointer", fontSize: 13, fontWeight: 700 }}>
                        🔄 Retry Quiz
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* ── COURSE API PANEL (quiz + notes from port 5005) ── */}
        {selectedCourse && (
          <div style={{ background: "#16181f", border: "1px solid rgba(79,142,247,.2)", borderRadius: 20, padding: "24px", marginTop: 4 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div>
                <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 17, marginBottom: 2 }}>🎯 {selectedCourse}</div>
                <div style={{ fontSize: 12, color: "#6b7a99" }}>AI-generated quiz & notes for this course</div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={handleDownloadPDF}
                  style={{ padding: "8px 16px", borderRadius: 10, background: "rgba(124,58,237,.15)", border: "1px solid rgba(124,58,237,.3)", color: "#a78bfa", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>
                  ⬇ Download PDF
                </button>
                <button onClick={() => setSelectedCourse(null)}
                  style={{ padding: "8px 14px", borderRadius: 10, background: "rgba(244,63,94,.1)", border: "1px solid rgba(244,63,94,.3)", color: "#f43f5e", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>
                  ✕ Close
                </button>
              </div>
            </div>

            {/* Loading */}
            {courseLoading && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, padding: "36px" }}>
                <div style={{ width: 36, height: 36, border: "3px solid rgba(79,142,247,.2)", borderTop: "3px solid #4f8ef7", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                <div style={{ fontSize: 14, color: "#9aa5bc", fontWeight: 600 }}>Generating quiz & notes…</div>
              </div>
            )}

            {/* Error */}
            {courseError && !courseLoading && (
              <div style={{ background: "rgba(244,63,94,.08)", border: "1px solid rgba(244,63,94,.3)", borderRadius: 14, padding: "16px 20px", display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 20 }}>⚠️</span>
                <div>
                  <div style={{ fontWeight: 700, color: "#f43f5e", fontSize: 14, marginBottom: 4 }}>Failed to load course data</div>
                  <div style={{ fontSize: 12, color: "#9aa5bc" }}>{courseError}</div>
                </div>
                <button onClick={() => handleStartCourse(selectedCourse)}
                  style={{ marginLeft: "auto", padding: "7px 16px", borderRadius: 9, background: "rgba(244,63,94,.12)", border: "1px solid rgba(244,63,94,.3)", color: "#f43f5e", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>
                  Retry
                </button>
              </div>
            )}

            {/* Quiz */}
            {!courseLoading && courseQuiz.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 14, marginBottom: 12, color: "#4f8ef7" }}>🧠 Quick Quiz ({courseQuiz.length} questions)</div>
                {courseQuiz.map((q, qi) => (
                  <div key={qi} style={{ background: "rgba(79,142,247,.06)", border: "1px solid rgba(79,142,247,.15)", borderRadius: 12, padding: "14px 16px", marginBottom: 10 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10, color: "#f0f2f8" }}>{qi + 1}. {q.question}</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                      {q.options && Object.entries(q.options).map(([key, val]) => (
                        <div key={key} style={{ display: "flex", gap: 8, alignItems: "center", padding: "8px 12px", borderRadius: 9, background: key === q.answer ? "rgba(16,185,129,.12)" : "rgba(255,255,255,.03)", border: `1px solid ${key === q.answer ? "rgba(16,185,129,.35)" : "rgba(255,255,255,.07)"}` }}>
                          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, fontWeight: 800, color: key === q.answer ? "#10b981" : "#6b7a99", minWidth: 16 }}>{key}</span>
                          <span style={{ fontSize: 12, color: key === q.answer ? "#10b981" : "#c0c9d9" }}>{val}</span>
                          {key === q.answer && <span style={{ marginLeft: "auto", fontSize: 12 }}>✓</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Notes */}
            {!courseLoading && courseNotes && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 14, marginBottom: 10, color: "#f59e0b" }}>📝 AI Study Notes</div>
                <div style={{ background: "rgba(245,158,11,.06)", border: "1px solid rgba(245,158,11,.2)", borderRadius: 14, padding: "18px 20px", fontSize: 13, color: "#e2e8f0", lineHeight: 1.85, whiteSpace: "pre-wrap" }}>
                  {courseNotes}
                </div>
              </div>
            )}

            {/* All saved notes */}
            {allNotes.length > 0 && (
              <div>
                <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 14, marginBottom: 10, color: "#a78bfa" }}>📚 Saved Notes ({allNotes.length})</div>
                {allNotes.map((n, i) => (
                  <div key={i} style={{ background: "rgba(124,58,237,.06)", border: "1px solid rgba(124,58,237,.18)", borderRadius: 12, padding: "14px 16px", marginBottom: 8 }}>
                    <div style={{ fontWeight: 700, fontSize: 12, color: "#a78bfa", marginBottom: 6 }}>{n.lessonTitle}</div>
                    <div style={{ fontSize: 12, color: "#9aa5bc", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{n.notes}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };
  const renderProgress = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Section title="📈 Monthly Progress" sub="XP & Quiz score trend">
          <LineChartSVG datasets={monthLine.datasets} height={130} labels={monthLine.labels} />
        </Section>
        <Section title="🎯 Competency Radar">
          <div style={{ display: "flex", justifyContent: "center" }}>
            <RadarChartSVG data={radarData} size={180} />
          </div>
        </Section>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Section title="🌊 XP Area Chart"><AreaChartSVG data={studyArea} color="#4f8ef7" height={110} /></Section>
        <Section title="🍩 Study Distribution">
          <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
            <DonutChart segments={pieData} size={130} stroke={16} label="Study" sublabel="Mix" />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
              {pieData.map((p, i) => (
                <div key={i}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 12, color: "#9aa5bc" }}>{p.label}</span>
                    <span style={{ fontSize: 12, color: p.color, fontWeight: 700 }}>{p.v}%</span>
                  </div>
                  <div style={{ height: 4, borderRadius: 99, background: "rgba(255,255,255,.06)" }}>
                    <div style={{ height: "100%", width: `${p.v}%`, background: p.color, borderRadius: 99 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Section>
      </div>
      <Section title="🔵 Score Scatter Plot" sub="Quiz score vs session">
        <ScatterSVG data={scatterData} W={500} H={140} />
      </Section>
    </div>
  );

  const TopicComparisonTool = () => {
    const API_URL = "http://localhost:5008/api/compare";
    const HIST_KEY = "skillio_cmp_history";
    const EXAMPLES = [
      ["React", "Vue"],
      ["Python", "JavaScript"],
      ["MongoDB", "PostgreSQL"],
      ["REST", "GraphQL"],
      ["Docker", "Kubernetes"],
    ];

    const CSS = `
      .cmp-root *{box-sizing:border-box}
      .cmp-root{
        --cmp-cyan:#00e5cc;--cmp-purple:#9b59f5;--cmp-green:#39d98a;
        --cmp-orange:#f5a623;--cmp-red:#f5365c;
        --cmp-surface:#131627;--cmp-card:#181c2e;--cmp-border:#1f2540;
        --cmp-muted:#5a6080;--cmp-text:#d0d6f0;--cmp-white:#fff;
        font-family:'DM Sans',sans-serif;width:100%;
      }
      .cmp-root ::-webkit-scrollbar{width:5px;height:5px}
      .cmp-root ::-webkit-scrollbar-thumb{background:var(--cmp-border);border-radius:3px}
      .cmp-hist-bar{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin-bottom:14px}
      .cmp-hist-label{font-size:11px;color:var(--cmp-muted);margin-right:4px;font-family:'JetBrains Mono',monospace}
      .cmp-hist-chip{display:flex;align-items:center;gap:5px;padding:4px 10px;border-radius:20px;
        background:var(--cmp-surface);border:1px solid var(--cmp-border);cursor:pointer;
        font-size:11px;color:var(--cmp-muted);transition:all .2s;font-family:'JetBrains Mono',monospace}
      .cmp-hist-chip:hover{border-color:rgba(245,162,35,.5);color:var(--cmp-orange)}
      .cmp-hist-vs{color:var(--cmp-border)}
      .cmp-input-card{background:var(--cmp-card);border:1px solid var(--cmp-border);border-radius:16px;padding:20px}
      .cmp-section-tag{display:flex;align-items:center;gap:6px;margin-bottom:14px}
      .cmp-section-dot{width:7px;height:7px;border-radius:50%}
      .cmp-section-label{font-weight:600;color:var(--cmp-white);font-size:13px}
      .cmp-input-row{display:flex;gap:10px;align-items:center;flex-wrap:wrap}
      .cmp-inp-wrap{flex:1;min-width:160px;position:relative}
      .cmp-inp-ab{position:absolute;left:12px;top:50%;transform:translateY(-50%);
        font-size:10px;letter-spacing:.12em;pointer-events:none;font-family:'JetBrains Mono',monospace}
      .cmp-inp-ab.a{color:var(--cmp-cyan)}.cmp-inp-ab.b{color:var(--cmp-purple)}
      .cmp-topic-inp{width:100%;background:var(--cmp-surface);border:1px solid var(--cmp-border);
        border-radius:10px;padding:11px 12px 11px 28px;color:var(--cmp-text);
        font-family:'DM Sans',sans-serif;font-size:14px;outline:none;transition:border .2s}
      .cmp-topic-inp:focus{border-color:var(--cmp-cyan);box-shadow:0 0 0 3px rgba(0,229,204,.1)}
      .cmp-topic-inp.b:focus{border-color:var(--cmp-purple);box-shadow:0 0 0 3px rgba(155,89,245,.1)}
      .cmp-btn-swap{width:38px;height:38px;border-radius:10px;border:1px solid var(--cmp-border);
        background:none;color:var(--cmp-muted);cursor:pointer;display:flex;align-items:center;
        justify-content:center;font-size:18px;flex-shrink:0;transition:all .2s}
      .cmp-btn-swap:hover{border-color:var(--cmp-cyan);color:var(--cmp-cyan);background:rgba(0,229,204,.06)}
      .cmp-btn-compare{background:linear-gradient(135deg,var(--cmp-cyan),var(--cmp-green));
        color:#0d0f1a;border:none;border-radius:10px;padding:11px 24px;font-weight:700;
        font-size:13px;cursor:pointer;display:flex;align-items:center;gap:8px;
        white-space:nowrap;transition:opacity .2s,transform .15s}
      .cmp-btn-compare:hover{opacity:.9}.cmp-btn-compare:active{transform:scale(.97)}
      .cmp-btn-compare:disabled{opacity:.45;cursor:not-allowed}
      .cmp-chips{display:flex;flex-wrap:wrap;gap:6px;margin-top:12px;align-items:center}
      .cmp-chip-label{font-size:11px;color:var(--cmp-muted);margin-right:4px;font-family:'JetBrains Mono',monospace}
      .cmp-chip{background:var(--cmp-surface);border:1px solid var(--cmp-border);border-radius:20px;
        padding:3px 10px;font-size:11px;color:var(--cmp-muted);cursor:pointer;transition:all .2s;
        font-family:'JetBrains Mono',monospace}
      .cmp-chip:hover{border-color:rgba(0,229,204,.4);color:var(--cmp-cyan)}
      @keyframes cmp-spin{to{transform:rotate(360deg)}}
      .cmp-spinner{width:14px;height:14px;border:2px solid rgba(0,0,0,.3);
        border-top-color:#0d0f1a;border-radius:50%;animation:cmp-spin 1s linear infinite}
      .cmp-spin-ring{width:40px;height:40px;border:3px solid var(--cmp-border);
        border-top-color:var(--cmp-cyan);border-radius:50%;animation:cmp-spin 1s linear infinite}
      .cmp-error-box{display:flex;align-items:flex-start;gap:10px;padding:12px 16px;
        border-radius:12px;border:1px solid rgba(245,54,92,.3);background:rgba(245,54,92,.08);margin-top:14px}
      .cmp-error-title{font-size:13px;color:var(--cmp-red);font-weight:600}
      .cmp-error-msg{font-size:11px;color:rgba(245,54,92,.7);margin-top:2px;font-family:'JetBrains Mono',monospace}
      @keyframes cmp-pulse{0%,100%{opacity:.3}50%{opacity:1}}
      .cmp-loading-card{display:flex;flex-direction:column;align-items:center;gap:16px;
        padding:64px 20px;background:var(--cmp-card);border:1px solid rgba(0,229,204,.2);
        border-radius:16px;margin-top:14px}
      .cmp-loading-label{font-weight:600;color:var(--cmp-white);font-size:14px}
      .cmp-loading-sub{font-size:11px;color:var(--cmp-muted);text-align:center;font-family:'JetBrains Mono',monospace}
      .cmp-dots{display:flex;gap:6px}
      .cmp-dot-a{width:6px;height:6px;border-radius:50%;background:rgba(0,229,204,.4);animation:cmp-pulse 1.2s ease infinite}
      .cmp-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;
        padding:64px 20px;gap:14px;border:2px dashed var(--cmp-border);border-radius:16px;margin-top:14px}
      .cmp-empty-icon{width:56px;height:56px;border-radius:16px;background:var(--cmp-surface);
        border:1px solid var(--cmp-border);display:flex;align-items:center;justify-content:center;font-size:24px}
      .cmp-empty-title{font-weight:700;color:var(--cmp-white);font-size:14px}
      .cmp-empty-sub{font-size:12px;color:var(--cmp-muted)}
      .cmp-util-bar{display:flex;gap:8px;justify-content:flex-end;margin-top:14px}
      .cmp-btn-util{display:flex;align-items:center;gap:6px;padding:7px 14px;border-radius:10px;
        border:1px solid var(--cmp-border);background:none;color:var(--cmp-muted);
        font-family:'DM Sans',sans-serif;font-size:12px;cursor:pointer;transition:all .2s}
      .cmp-btn-util:hover{border-color:rgba(0,229,204,.4);color:var(--cmp-cyan)}
      .cmp-summary-card{background:var(--cmp-card);border:1px solid rgba(57,217,138,.2);
        border-radius:16px;padding:20px;margin-top:14px}
      .cmp-vs-row{display:grid;grid-template-columns:1fr auto 1fr;gap:10px;align-items:center;margin:12px 0}
      .cmp-topic-pill{display:flex;align-items:center;gap:8px;padding:8px 12px;border-radius:10px}
      .cmp-pill-a{background:rgba(0,229,204,.08);border:1px solid rgba(0,229,204,.25)}
      .cmp-pill-b{background:rgba(155,89,245,.08);border:1px solid rgba(155,89,245,.25)}
      .cmp-pill-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0}
      .cmp-pill-dot.a{background:var(--cmp-cyan)}.cmp-pill-dot.b{background:var(--cmp-purple)}
      .cmp-pill-text-a{font-weight:700;color:var(--cmp-cyan);font-size:14px}
      .cmp-pill-text-b{font-weight:700;color:var(--cmp-purple);font-size:14px}
      .cmp-vs-badge{font-weight:800;font-size:22px;color:var(--cmp-border);text-align:center}
      .cmp-summary-text{font-size:13px;line-height:1.7;color:var(--cmp-text);
        border-left:2px solid rgba(57,217,138,.4);padding-left:12px;margin-top:4px}
      .cmp-ai-badge{font-size:10px;padding:2px 8px;border-radius:20px;
        background:rgba(57,217,138,.1);color:var(--cmp-green);margin-left:6px;font-family:'JetBrains Mono',monospace}
      .cmp-tab-bar{display:flex;gap:4px;padding:4px;background:var(--cmp-card);
        border:1px solid var(--cmp-border);border-radius:14px;width:fit-content;margin-top:14px}
      .cmp-tab{padding:7px 16px;border-radius:10px;font-weight:600;font-size:12px;
        color:var(--cmp-muted);cursor:pointer;transition:all .2s;border:1px solid transparent}
      .cmp-tab.active{background:linear-gradient(135deg,rgba(0,229,204,.15),rgba(155,89,245,.15));
        color:var(--cmp-white);border-color:rgba(0,229,204,.3)}
      .cmp-table-card{background:var(--cmp-card);border:1px solid var(--cmp-border);
        border-radius:16px;overflow:hidden;margin-top:14px}
      .cmp-table-header{display:flex;align-items:center;justify-content:space-between;
        padding:14px 18px;border-bottom:1px solid var(--cmp-border);flex-wrap:wrap;gap:8px}
      .cmp-table-title{display:flex;align-items:center;gap:8px;font-weight:600;
        color:var(--cmp-white);font-size:13px}
      .cmp-count-badge{font-size:10px;padding:2px 8px;border-radius:20px;font-family:'JetBrains Mono',monospace}
      .cmp-count-badge.c{background:rgba(0,229,204,.1);color:var(--cmp-cyan)}
      .cmp-count-badge.p{background:rgba(155,89,245,.1);color:var(--cmp-purple)}
      .cmp-srch-wrap{position:relative;display:flex;align-items:center}
      .cmp-srch-icon{position:absolute;left:8px;font-size:12px;color:var(--cmp-muted);pointer-events:none}
      .cmp-search-inp{background:var(--cmp-surface);border:1px solid var(--cmp-border);
        border-radius:8px;padding:5px 10px 5px 28px;font-size:12px;color:var(--cmp-text);
        outline:none;width:140px;transition:border .2s}
      .cmp-search-inp:focus{border-color:var(--cmp-cyan)}
      .cmp-table{width:100%;border-collapse:collapse;font-size:13px}
      .cmp-table thead th{padding:10px 16px;text-align:left;font-size:10px;text-transform:uppercase;
        letter-spacing:.1em;color:var(--cmp-muted);border-bottom:1px solid var(--cmp-border);
        font-family:'JetBrains Mono',monospace}
      .cmp-table th.ha{color:var(--cmp-cyan)}.cmp-table th.hb{color:var(--cmp-purple)}
      .cmp-table tbody tr{border-bottom:1px solid rgba(31,37,64,.5);transition:background .15s}
      .cmp-table tbody tr:hover{background:rgba(255,255,255,.02)}
      .cmp-table tbody tr:nth-child(even){background:rgba(255,255,255,.015)}
      .cmp-table td{padding:10px 16px;color:var(--cmp-text);vertical-align:top;line-height:1.5}
      .cmp-table td.cmp-basis{font-family:'JetBrains Mono',monospace;font-size:11px;
        color:var(--cmp-muted);white-space:nowrap;width:130px}
      .cmp-no-rows{padding:32px;text-align:center;font-size:12px;color:var(--cmp-muted);
        font-family:'JetBrains Mono',monospace}
      .cmp-sbs-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;padding:16px}
      .cmp-sbs-col-head{display:flex;align-items:center;gap:8px;padding:8px 12px;
        border-radius:10px;margin-bottom:10px}
      .cmp-sbs-head-a{background:rgba(0,229,204,.08);border:1px solid rgba(0,229,204,.25)}
      .cmp-sbs-head-b{background:rgba(155,89,245,.08);border:1px solid rgba(155,89,245,.25)}
      .cmp-sbs-item{background:var(--cmp-surface);border:1px solid var(--cmp-border);
        border-radius:10px;padding:10px;margin-bottom:6px;transition:border .2s}
      .cmp-sbs-item:hover{border-color:rgba(0,229,204,.25)}
      .cmp-sbs-item.b:hover{border-color:rgba(155,89,245,.25)}
      .cmp-sbs-basis{font-size:9px;color:var(--cmp-muted);text-transform:uppercase;
        letter-spacing:.1em;margin-bottom:4px;font-family:'JetBrains Mono',monospace}
      .cmp-sbs-val{font-size:12px;color:var(--cmp-text);line-height:1.5}
    `;

    const CmpInner = () => {
      const [topic1, setTopic1] = useState("");
      const [topic2, setTopic2] = useState("");
      const [result, setResult] = useState(null);
      const [loading, setLoading] = useState(false);
      const [error, setError] = useState(null);
      const [activeTab, setActiveTab] = useState("basic");
      const [tableSearch, setTableSearch] = useState("");
      const [copiedJSON, setCopiedJSON] = useState(false);
      const [history, setHistory] = useState(() => {
        try { return JSON.parse(localStorage.getItem(HIST_KEY)) || []; }
        catch { return []; }
      });
      const styleRef = useRef(false);

      useEffect(() => {
        if (styleRef.current) return;
        const tag = document.createElement("style");
        tag.textContent = CSS;
        document.head.appendChild(tag);
        styleRef.current = true;
      }, []);

      const saveHistory = (t1_arg, t2_arg, data) => {
        setHistory(prev => {
          const deduped = prev.filter(h => !(h.t1 === t1_arg && h.t2 === t2_arg));
          const next = [{ t1: t1_arg, t2: t2_arg, data }, ...deduped].slice(0, 8);
          localStorage.setItem(HIST_KEY, JSON.stringify(next));
          return next;
        });
      };

      const handleCompare = async () => {
        const res = await fetch("http://localhost:5008/api/compare", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            topic1,
            topic2
          })
        });

        const data = await res.json();
        setResult(data);
      };

      const colA = result?.topic1 ?? topic1;
      const colB = result?.topic2 ?? topic2;
      const table1 = result?.table1 ?? [];
      const table2 = result?.table2 ?? [];
      const summary = result?.summary ?? "";
      const sbsData = table1.length ? table1 : table2;

      const activeData = activeTab === "advanced" ? table2 : table1;
      const filtered = activeData.filter(row =>
        [row.basis, row.topic1, row.topic2]
          .some(v => String(v ?? "").toLowerCase().includes(tableSearch.toLowerCase()))
      );

      const swap = () => { setTopic1(topic2); setTopic2(topic1); };
      const disabled = loading || !topic1.trim() || !topic2.trim();

      const handleDownload = () => {
        const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `compare_${topic1}_vs_${topic2}_${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
      };

      return (
        <div className="cmp-root">

          {/* ── History bar ── */}
          {history.length > 0 && (
            <div className="cmp-hist-bar">
              <span className="cmp-hist-label">Recent:</span>
              {history.map((h, i) => (
                <span key={i} className="cmp-hist-chip" onClick={() => {
                  setTopic1(h.t1); setTopic2(h.t2);
                  setResult(h.data); setError(null); setActiveTab("basic");
                }}>
                  {h.t1} <span className="cmp-hist-vs">vs</span> {h.t2}
                </span>
              ))}
            </div>
          )}

          {/* ── Input card ── */}
          <div className="cmp-input-card">
            <div className="cmp-section-tag">
              <div className="cmp-section-dot" style={{ background: "var(--cmp-cyan)" }} />
              <span className="cmp-section-label">Compare Topics</span>
            </div>
            <div className="cmp-input-row">
              <div className="cmp-inp-wrap">
                <span className="cmp-inp-ab a">A</span>
                <input
                  className="cmp-topic-inp"
                  placeholder="e.g. React"
                  value={topic1}
                  onChange={e => setTopic1(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && !disabled && handleCompare()}
                />
              </div>
              <button className="cmp-btn-swap" onClick={swap} title="Swap topics">⇄</button>
              <div className="cmp-inp-wrap">
                <span className="cmp-inp-ab b">B</span>
                <input
                  className="cmp-topic-inp b"
                  placeholder="e.g. Vue"
                  value={topic2}
                  onChange={e => setTopic2(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && !disabled && handleCompare()}
                />
              </div>
              <button className="cmp-btn-compare" onClick={handleCompare} disabled={disabled}>
                {loading
                  ? <><div className="cmp-spinner" /> Analyzing…</>
                  : <>✦ Compare</>}
              </button>
            </div>
            <div className="cmp-chips">
              <span className="cmp-chip-label">Try:</span>
              {EXAMPLES.map(([a, b]) => (
                <span key={a + b} className="cmp-chip"
                  onClick={() => { setTopic1(a); setTopic2(b); }}>
                  {a} vs {b}
                </span>
              ))}
            </div>
          </div>

          {/* ── Error ── */}
          {error && (
            <div className="cmp-error-box">
              <span style={{ fontSize: 16, color: "var(--cmp-red)" }}>⚠</span>
              <div style={{ flex: 1 }}>
                <div className="cmp-error-title">Error</div>
                <div className="cmp-error-msg">{error}</div>
              </div>
              <span onClick={() => setError(null)}
                style={{ cursor: "pointer", color: "var(--cmp-muted)" }}>✕</span>
            </div>
          )}

          {/* ── Loading ── */}
          {loading && (
            <div className="cmp-loading-card">
              <div className="cmp-spin-ring" />
              <div style={{ textAlign: "center" }}>
                <div className="cmp-loading-label">Analyzing topics…</div>
                <div className="cmp-loading-sub">
                  Comparing{" "}
                  <span style={{ color: "var(--cmp-cyan)" }}>{topic1}</span>{" "}
                  <span style={{ color: "var(--cmp-border)" }}>vs</span>{" "}
                  <span style={{ color: "var(--cmp-purple)" }}>{topic2}</span>
                </div>
              </div>
              <div className="cmp-dots">
                {[0, 1, 2, 3].map(i => (
                  <div key={i} className="cmp-dot-a"
                    style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          )}

          {/* ── Empty state ── */}
          {!result && !loading && !error && (
            <div className="cmp-empty">
              <div className="cmp-empty-icon">🔍</div>
              <div className="cmp-empty-title">Ready to compare</div>
              <div className="cmp-empty-sub">
                Enter two topics above and click Compare to get started.
              </div>
            </div>
          )}

          {/* ── Results ── */}
          {result && !loading && (
            <>
              {/* Util bar */}
              <div className="cmp-util-bar">
                <button className="cmp-btn-util" onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(result, null, 2));
                  setCopiedJSON(true);
                  setTimeout(() => setCopiedJSON(false), 2000);
                }}>
                  {copiedJSON ? "✓ Copied!" : "📋 Copy JSON"}
                </button>
                <button className="cmp-btn-util" onClick={handleDownload}>
                  ⬇ Download JSON
                </button>
              </div>

              {/* Summary */}
              {summary && (
                <div className="cmp-summary-card">
                  <div className="cmp-section-tag">
                    <div className="cmp-section-dot" style={{ background: "var(--cmp-green)" }} />
                    <span className="cmp-section-label">📋 Summary</span>
                    <span className="cmp-ai-badge">Gemini</span>
                  </div>
                  <div className="cmp-vs-row">
                    <div className="cmp-topic-pill cmp-pill-a">
                      <div className="cmp-pill-dot a" />
                      <span className="cmp-pill-text-a">{colA}</span>
                    </div>
                    <div className="cmp-vs-badge">vs</div>
                    <div className="cmp-topic-pill cmp-pill-b">
                      <div className="cmp-pill-dot b" />
                      <span className="cmp-pill-text-b">{colB}</span>
                    </div>
                  </div>
                  <p className="cmp-summary-text">{summary}</p>
                </div>
              )}

              {/* Tabs */}
              <div className="cmp-tab-bar">
                {[
                  { id: "basic", label: "📊 Basic" },
                  { id: "advanced", label: "🔬 Advanced" },
                  { id: "visual", label: "⚡ Side-by-Side" },
                ].map(tab => (
                  <div
                    key={tab.id}
                    className={`cmp-tab${activeTab === tab.id ? " active" : ""}`}
                    onClick={() => { setActiveTab(tab.id); setTableSearch(""); }}
                  >
                    {tab.label}
                  </div>
                ))}
              </div>

              {/* Table: Basic / Advanced */}
              {(activeTab === "basic" || activeTab === "advanced") && (
                <div className="cmp-table-card">
                  <div className="cmp-table-header">
                    <div className="cmp-table-title">
                      <div style={{
                        width: 8, height: 8, borderRadius: "50%",
                        background: activeTab === "basic" ? "var(--cmp-cyan)" : "var(--cmp-purple)"
                      }} />
                      {activeTab === "basic" ? "📊 Basic Comparison" : "🔬 Advanced Comparison"}
                      <span className={`cmp-count-badge ${activeTab === "basic" ? "c" : "p"}`}>
                        {filtered.length} rows
                      </span>
                    </div>
                    <div className="cmp-srch-wrap">
                      <span className="cmp-srch-icon">🔍</span>
                      <input
                        className="cmp-search-inp"
                        placeholder="Filter rows…"
                        value={tableSearch}
                        onChange={e => setTableSearch(e.target.value)}
                      />
                    </div>
                  </div>
                  <table className="cmp-table">
                    <thead>
                      <tr>
                        <th>Basis</th>
                        <th className="ha">{colA}</th>
                        <th className="hb">{colB}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.length === 0
                        ? <tr><td colSpan={3} className="cmp-no-rows">No rows match your filter.</td></tr>
                        : filtered.map((row, i) => (
                          <tr key={i}>
                            <td className="cmp-basis">{row.basis ?? "—"}</td>
                            <td>{row.topic1 ?? "—"}</td>
                            <td>{row.topic2 ?? "—"}</td>
                          </tr>
                        ))
                      }
                    </tbody>
                  </table>
                </div>
              )}

              {/* Side-by-Side */}
              {activeTab === "visual" && (
                <div className="cmp-table-card">
                  <div className="cmp-table-header">
                    <div className="cmp-table-title">
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--cmp-orange)" }} />
                      ⚡ Side-by-Side View
                    </div>
                  </div>
                  <div className="cmp-sbs-grid">
                    <div>
                      <div className="cmp-sbs-col-head cmp-sbs-head-a">
                        <div className="cmp-pill-dot a" />
                        <span className="cmp-pill-text-a">{colA}</span>
                      </div>
                      {sbsData.map((row, i) => (
                        <div key={i} className="cmp-sbs-item">
                          <div className="cmp-sbs-basis">{row.basis ?? "—"}</div>
                          <div className="cmp-sbs-val">{row.topic1 ?? "—"}</div>
                        </div>
                      ))}
                    </div>
                    <div>
                      <div className="cmp-sbs-col-head cmp-sbs-head-b">
                        <div className="cmp-pill-dot b" />
                        <span className="cmp-pill-text-b">{colB}</span>
                      </div>
                      {sbsData.map((row, i) => (
                        <div key={i} className="cmp-sbs-item b">
                          <div className="cmp-sbs-basis">{row.basis ?? "—"}</div>
                          <div className="cmp-sbs-val">{row.topic2 ?? "—"}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      );
    };

    return <CmpInner />;
  };

  const renderQuiz = () => <QuizPage user={user} />;

  const pageTitle = { dashboard: "Dashboard", schedule: "Schedule", courses: "My Courses", quiz: "Quiz Performance", chat: "AI Chat Assistant", resumerecruiter: "Resume Recruiter", topiccompare: "Topic Comparison", codevis: "Code Execution Visualizer", plan: "Adaptive Plan", pomodoro: "Focus Timer", progress: "Progress Analytics", sandbox: "Live Sandbox", roadmap: "Learning Roadmap", profile: "My Profile", settings: "Settings & Security" };

  const pageContent = {
    dashboard: renderDashboard(),
    schedule: <SchedulePage />,
    courses: renderCourses(),
    progress: renderProgress(),
    quiz: renderQuiz(),
    chat: <ChatModule key={chatKey} user={user} onNewChat={() => setChatKey(k => k + 1)} />,
    resumerecruiter: <RecruiterView />,
    topiccompare: <TopicComparisonTool />,
    codevis: <CodeVisualizer />,
    plan: <AdaptiveLearningPlan />,
    sandbox: renderSandbox(),
    roadmap: <RoadmapGenerator />,
    profile: <ProfilePage user={user} />,
    settings: <SettingsPage user={user} />,
    pomodoro: <PomodoroModule user={user} />,
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0f1117", display: "flex", flexDirection: "column", fontFamily: "'DM Sans',sans-serif", color: "#f0f2f8" }}>
      {notifOpen && <NotificationPanel onClose={() => setNotifOpen(false)} onNav={setActivePage} />}

      {/* TOP NAVBAR */}
      <div style={{ background: "#13151d", borderBottom: "1px solid rgba(255,255,255,.07)", display: "flex", alignItems: "center", padding: "0 20px", height: 56, gap: 0, flexShrink: 0, position: "sticky", top: 0, zIndex: 500, overflow: "hidden" }}>
        {/* Logo - fixed width */}
        <div style={{ display: "flex", alignItems: "center", gap: 9, flexShrink: 0, marginRight: 16 }}>
          <img src="/logo.svg" alt="Skillio Logo" style={{ width: 30, height: 30, borderRadius: 9, objectFit: 'contain', boxShadow: "0 0 14px rgba(79,142,247,.35)" }} />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 14, letterSpacing: "-.02em", lineHeight: 1 }}>SKILLIO</div>
            <div style={{ fontSize: 8, color: "#6b7a99", fontFamily: "'JetBrains Mono',monospace", lineHeight: 1.2 }}>Adaptive Learning</div>
          </div>
        </div>

        {/* Horizontal nav - takes all middle space */}
        <div style={{ flex: 1, overflow: "hidden", minWidth: 0 }}>
          <NavDropdown navItems={navItems} activePage={activePage} setActivePage={setActivePage} />
        </div>

        {/* Right controls - fixed */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0, marginLeft: 12 }}>
          {/* Search */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#16181f", border: "1px solid rgba(255,255,255,.08)", borderRadius: 9, padding: "6px 11px", width: 160 }}>
            <span style={{ fontSize: 12, color: "#6b7a99" }}>🔍</span>
            <input placeholder="Search…" style={{ background: "none", border: "none", outline: "none", color: "#f0f2f8", fontSize: 12, width: "100%", fontFamily: "'DM Sans',sans-serif" }} />
          </div>

          {/* Notification */}
          <NotificationBell onClick={() => setNotifOpen(!notifOpen)} count={5} />

          {/* XP bar pill */}
          <div style={{ padding: "5px 10px", borderRadius: 8, background: "rgba(79,142,247,.08)", border: "1px solid rgba(79,142,247,.18)", display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 9, color: "#6b7a99", fontFamily: "'JetBrains Mono',monospace", whiteSpace: "nowrap" }}>LVL 12</span>
            <div style={{ width: 48, height: 3, borderRadius: 99, background: "rgba(255,255,255,.07)" }}>
              <div style={{ height: "100%", width: "76%", background: "linear-gradient(90deg,#4f8ef7,#7c3aed)", borderRadius: 99 }} />
            </div>
            <span style={{ fontSize: 9, color: "#4f8ef7", fontFamily: "'JetBrains Mono',monospace" }}>3840</span>
          </div>

          {/* Profile avatar */}
          <div onClick={() => setActivePage("profile")} style={{ cursor: "pointer", borderRadius: "50%", border: `2px solid ${activePage === "profile" ? "#4f8ef7" : "transparent"}`, transition: "border-color .2s", lineHeight: 0 }}
            onMouseEnter={e => e.currentTarget.style.borderColor = "#4f8ef7"}
            onMouseLeave={e => e.currentTarget.style.borderColor = activePage === "profile" ? "#4f8ef7" : "transparent"}>
            <Ava name={user.name} size={32} />
          </div>

          {/* Logout */}
          <div onClick={onLogout} style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 10px", borderRadius: 8, cursor: "pointer", color: "#6b7a99", transition: "all .2s", fontSize: 11, whiteSpace: "nowrap" }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(244,63,94,.1)"; e.currentTarget.style.color = "#f43f5e"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#6b7a99"; }}>
            <span>🚪</span><span style={{ fontWeight: 500 }}>Out</span>
          </div>
        </div>
      </div>

      {/* MAIN */}
      <div style={{ flex: 1, overflowY: "auto", padding: "28px 32px" }}>
        {/* Top bar */}
        {(() => {
          const gradientPages = ["topiccompare","codevis","plan","pomodoro","progress","sandbox","roadmap","profile","settings","dashboard","courses","schedule","quiz"];
          const isGradient = gradientPages.includes(activePage);
          if (isGradient) {
            const title = pageTitle[activePage] || activePage;
            const words = title.split(" ");
            const lastWord = words[words.length - 1];
            const restWords = words.slice(0, -1).join(" ");
            return (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 28, width: "100%" }}>
                <h1 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 900, fontSize: "2.6rem", lineHeight: 1.05, letterSpacing: "-0.02em", marginBottom: 2, textAlign: "center" }}>
                  {restWords && <span style={{ color: "#e2e8f0" }}>{restWords}{" "}</span>}
                  <span style={{ background: "linear-gradient(135deg, #a78bfa, #60a5fa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{lastWord}</span>
                </h1>
                <div style={{ fontSize: 12, color: "#6b7a99", fontFamily: "'JetBrains Mono',monospace", textAlign: "center" }}>{new Date().toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</div>
              </div>
            );
          }
          return (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
              <div>
                <h1 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 22, marginBottom: 2 }}>{pageTitle[activePage] || activePage}</h1>
                <div style={{ fontSize: 12, color: "#6b7a99", fontFamily: "'JetBrains Mono',monospace" }}>{new Date().toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</div>
              </div>
            </div>
          );
        })()}

        {pageContent[activePage] || (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300, color: "#6b7a99", fontSize: 15 }}>
            🚧 {(pageTitle[activePage] || activePage)} — coming soon
          </div>
        )}
      </div>

      {/* ── FLOATING POMODORO MINI-TIMER — visible on ALL pages when not on focus page ── */}
      {activePage !== "pomodoro" && (
        <div style={{ position: "fixed", bottom: 20, right: 20, zIndex: 9998, animation: "miniPop .4s cubic-bezier(.34,1.56,.64,1) both" }}>
          <div
            onClick={() => setActivePage("pomodoro")}
            style={{
              background: "linear-gradient(135deg,rgba(79,142,247,.22),rgba(15,17,23,.96))",
              border: "1.5px solid rgba(79,142,247,.45)",
              borderRadius: 18, padding: "10px 14px", cursor: "pointer",
              boxShadow: "0 6px 32px rgba(79,142,247,.35)",
              backdropFilter: "blur(18px)",
              display: "flex", alignItems: "center", gap: 10, minWidth: 130,
              transition: "all .2s",
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 10px 40px rgba(79,142,247,.5)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 6px 32px rgba(79,142,247,.35)"; }}>
            {/* Mini ring */}
            <svg width="40" height="40" viewBox="0 0 40 40" style={{ flexShrink: 0 }}>
              <circle cx="20" cy="20" r="16" fill="none" stroke="rgba(255,255,255,.1)" strokeWidth="3.5" />
              <circle cx="20" cy="20" r="16" fill="none" stroke="#4f8ef7" strokeWidth="3.5"
                strokeDasharray={100.5} strokeDashoffset={100.5 * 0.35}
                strokeLinecap="round" transform="rotate(-90 20 20)" />
              <text x="20" y="24" textAnchor="middle" fontSize="8" fill="#f0f2f8" fontFamily="'JetBrains Mono',monospace" fontWeight="700">25:00</text>
            </svg>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#4f8ef7", fontFamily: "'JetBrains Mono',monospace", letterSpacing: ".04em" }}>🍅 Focus Timer</div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,.4)", marginTop: 1 }}>Click to open</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


/* ═══════════════════════════════════════════
   DESIGN TOKENS  (Skillio dark palette)
═══════════════════════════════════════════ */
const REC_T = {
  bg: "#0b0d16",
  bgDeep: "#07080f",
  card: "#12152a",
  cardHov: "#161929",
  border: "rgba(255,255,255,0.07)",
  borderHov: "rgba(255,255,255,0.14)",

  green: "#00d4aa",
  greenDim: "rgba(0,212,170,0.10)",
  greenBord: "rgba(0,212,170,0.30)",
  greenGlow: "rgba(0,212,170,0.25)",

  amber: "#f0a500",
  amberDim: "rgba(240,165,0,0.10)",
  amberBord: "rgba(240,165,0,0.30)",

  purple: "#a78bfa",
  purpleDim: "rgba(167,139,250,0.10)",
  purpleBord: "rgba(167,139,250,0.30)",
  purpleGlow: "rgba(167,139,250,0.30)",

  red: "#f87171",
  redDim: "rgba(248,113,113,0.10)",
  redBord: "rgba(248,113,113,0.30)",

  blue: "#60a5fa",
  blueDim: "rgba(96,165,250,0.10)",
  blueBord: "rgba(96,165,250,0.30)",

  text: "#e2e8f0",
  muted: "#64748b",
  faint: "#1e2535",
};

/* ═══════════════════════════════════════════
   GLOBAL STYLES
═══════════════════════════════════════════ */
const REC_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  ::placeholder { color: ${REC_T.muted}; opacity: 1; }

  textarea:focus, input:focus {
    outline: none !important;
    border-color: ${REC_T.purpleBord} !important;
    box-shadow: 0 0 0 3px ${REC_T.purpleDim} !important;
  }

  textarea::-webkit-scrollbar { width: 4px; }
  textarea::-webkit-scrollbar-track { background: transparent; }
  textarea::-webkit-scrollbar-thumb { background: ${REC_T.faint}; border-radius: 4px; }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0);    }
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  @keyframes slideInLeft {
    from { opacity: 0; transform: translateX(-20px); }
    to   { opacity: 1; transform: translateX(0);     }
  }

  @keyframes scaleIn {
    from { opacity: 0; transform: scale(0.92); }
    to   { opacity: 1; transform: scale(1);    }
  }

  @keyframes countUp {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0);    }
  }

  @keyframes shimmer {
    0%   { background-position: -200% center; }
    100% { background-position:  200% center; }
  }

  @keyframes pulseGlow {
    0%, 100% { box-shadow: 0 0 20px ${REC_T.purpleGlow}; }
    50%       { box-shadow: 0 0 40px ${REC_T.purpleGlow}, 0 0 60px rgba(167,139,250,0.15); }
  }

  @keyframes borderPulse {
    0%, 100% { border-color: ${REC_T.purpleBord}; }
    50%       { border-color: rgba(167,139,250,0.6); }
  }

  @keyframes waveBar {
    0%, 100% { transform: scaleY(0.4); }
    50%       { transform: scaleY(1.0); }
  }

  @keyframes orbFloat {
    0%, 100% { transform: translateY(0px)   scale(1);    opacity: 0.06; }
    50%       { transform: translateY(-12px) scale(1.08); opacity: 0.10; }
  }

  @keyframes badgeIn {
    from { opacity: 0; transform: scale(0.8) translateY(4px); }
    to   { opacity: 1; transform: scale(1)   translateY(0);   }
  }

  @keyframes warningSlide {
    from { opacity: 0; transform: translateX(-10px); }
    to   { opacity: 1; transform: translateX(0);     }
  }

  @keyframes scanLine {
    0%   { top: 0%;   opacity: 0.6; }
    100% { top: 100%; opacity: 0;   }
  }

  /* Button */
  .analyze-btn {
    position: relative;
    overflow: hidden;
    transition: transform 0.18s ease, box-shadow 0.18s ease, opacity 0.18s ease;
  }
  .analyze-btn::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      105deg,
      transparent 30%,
      rgba(255,255,255,0.18) 50%,
      transparent 70%
    );
    background-size: 200% 100%;
    opacity: 0;
    transition: opacity 0.2s;
  }
  .analyze-btn:hover:not(:disabled)::before {
    opacity: 1;
    animation: shimmer 0.7s ease forwards;
  }
  .analyze-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 32px rgba(167,139,250,0.45), 0 2px 8px rgba(0,0,0,0.4);
  }
  .analyze-btn:active:not(:disabled) {
    transform: scale(0.97) translateY(0);
    box-shadow: 0 2px 10px rgba(167,139,250,0.25);
  }

  /* Card hover */
  .result-card {
    transition: border-color 0.25s ease, transform 0.25s ease, box-shadow 0.25s ease;
  }
  .result-card:hover {
    border-color: ${REC_T.borderHov};
    transform: translateY(-2px);
    box-shadow: 0 8px 32px rgba(0,0,0,0.3);
  }

  /* Stat card */
  .stat-card {
    transition: transform 0.25s ease, box-shadow 0.25s ease;
  }
  .stat-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 40px rgba(0,0,0,0.35);
  }

  /* Badge hover */
  .skill-badge {
    transition: transform 0.15s ease, box-shadow 0.15s ease;
    cursor: default;
  }
  .skill-badge:hover {
    transform: translateY(-1px) scale(1.04);
  }

  /* Textarea */
  .resume-textarea {
    transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
  }
  .resume-textarea:focus {
    background: #0f1222 !important;
  }
`;

/* ═══════════════════════════════════════════
   SPARKLINE
═══════════════════════════════════════════ */
const REC_Sparkline = ({ color, animated }) => (
  <svg width="90" height="28" viewBox="0 0 90 28" fill="none" style={{ display: "block" }}>
    <defs>
      <linearGradient id={`sg-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={color} stopOpacity="0.3" />
        <stop offset="100%" stopColor={color} stopOpacity="0" />
      </linearGradient>
    </defs>
    <path
      d="M0,23 L14,18 L28,20 L42,12 L56,15 L70,7 L90,3 L90,28 L0,28 Z"
      fill={`url(#sg-${color.replace("#", "")})`}
      opacity={animated ? 1 : 0}
      style={{ transition: "opacity 0.6s 0.5s ease" }}
    />
    <polyline
      points="0,23 14,18 28,20 42,12 56,15 70,7 90,3"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
      strokeDasharray="200"
      strokeDashoffset={animated ? "0" : "200"}
      style={{ transition: "stroke-dashoffset 1s 0.2s ease" }}
    />
    <circle
      cx="90" cy="3" r="3"
      fill={color}
      opacity={animated ? 1 : 0}
      style={{ transition: "opacity 0.3s 1s ease" }}
    />
  </svg>
);

/* ═══════════════════════════════════════════
   WAVE LOADER
═══════════════════════════════════════════ */
const REC_WaveLoader = () => (
  <div style={{ display: "flex", alignItems: "center", gap: "4px", height: "20px" }}>
    {[0, 1, 2, 3, 4].map(i => (
      <div key={i} style={{
        width: "3px", height: "16px",
        background: REC_T.purple,
        borderRadius: "99px",
        animation: `waveBar 0.9s ease-in-out ${i * 0.12}s infinite`,
        transformOrigin: "center bottom",
      }} />
    ))}
  </div>
);

/* ═══════════════════════════════════════════
   BADGE
═══════════════════════════════════════════ */
const REC_Badge = ({ label, type, delay = 0 }) => {
  const map = {
    green: { bg: REC_T.greenDim, border: REC_T.greenBord, color: REC_T.green, glow: "rgba(0,212,170,0.2)" },
    red: { bg: REC_T.redDim, border: REC_T.redBord, color: REC_T.red, glow: "rgba(248,113,113,0.2)" },
    purple: { bg: REC_T.purpleDim, border: REC_T.purpleBord, color: REC_T.purple, glow: "rgba(167,139,250,0.2)" },
  };
  const s = map[type] || map.green;
  return (
    <span
      className="skill-badge"
      style={{
        display: "inline-block",
        background: s.bg,
        border: `1px solid ${s.border}`,
        color: s.color,
        fontSize: "12px",
        fontWeight: 600,
        fontFamily: "'JetBrains Mono', monospace",
        padding: "4px 12px",
        borderRadius: "6px",
        marginRight: "6px",
        marginBottom: "6px",
        letterSpacing: "0.03em",
        animation: `badgeIn 0.4s ease ${delay}s both`,
      }}
    >
      {label}
    </span>
  );
};

/* ═══════════════════════════════════════════
   MONO LABEL
═══════════════════════════════════════════ */
const REC_Label = ({ children, color }) => (
  <p style={{
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "10px",
    fontWeight: 600,
    letterSpacing: "0.13em",
    textTransform: "uppercase",
    color: color || REC_T.muted,
    marginBottom: "14px",
  }}>
    {children}
  </p>
);

/* ═══════════════════════════════════════════
   STAT CARD
═══════════════════════════════════════════ */
const REC_StatCard = ({ label, value, sub, color, delay = 0 }) => {
  const [animated, setAnimated] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), delay * 1000 + 100);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <div
      className="stat-card"
      style={{
        background: REC_T.card,
        border: `1px solid ${REC_T.border}`,
        borderRadius: "16px",
        padding: "1.25rem",
        position: "relative",
        overflow: "hidden",
        animation: `fadeUp 0.5s ease ${delay}s both`,
      }}
    >
      {/* Animated glow orb */}
      <div style={{
        position: "absolute", top: "-30px", right: "-30px",
        width: "100px", height: "100px", background: color,
        borderRadius: "50%",
        animation: `orbFloat 4s ease-in-out ${delay}s infinite`,
        filter: "blur(28px)",
      }} />
      {/* Scanline effect */}
      <div style={{
        position: "absolute", left: 0, right: 0, height: "2px",
        background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
        opacity: 0.4,
        animation: `scanLine 3s ease-in ${delay + 0.5}s infinite`,
      }} />

      <REC_Label color={color + "99"}>{label}</REC_Label>
      <div style={{
        fontFamily: "'Outfit', sans-serif",
        fontWeight: 900,
        fontSize: "2.8rem",
        color,
        lineHeight: 1,
        letterSpacing: "-0.02em",
        animation: `countUp 0.5s ease ${delay + 0.2}s both`,
      }}>
        {value}
      </div>
      <div style={{
        fontSize: "12px",
        color: REC_T.muted,
        marginTop: "5px",
        fontFamily: "'Outfit', sans-serif",
      }}>
        {sub}
      </div>
      <div style={{ marginTop: "12px" }}>
        <REC_Sparkline color={color} animated={animated} />
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════
   RESULT SECTION CARD
═══════════════════════════════════════════ */
const REC_SectionCard = ({ children, accent, delay = 0, style = {} }) => (
  <div
    className="result-card"
    style={{
      background: REC_T.card,
      border: `1px solid ${REC_T.border}`,
      borderTop: `2px solid ${accent}`,
      borderRadius: "16px",
      padding: "1.4rem 1.5rem",
      animation: `scaleIn 0.45s ease ${delay}s both`,
      ...style,
    }}
  >
    {children}
  </div>
);

/* ═══════════════════════════════════════════
   ANALYZE BUTTON
═══════════════════════════════════════════ */
const REC_AnalyzeButton = ({ onClick, loading, disabled }) => (
  <button
    className="analyze-btn"
    onClick={onClick}
    disabled={disabled}
    style={{
      display: "flex",
      alignItems: "center",
      gap: "10px",
      padding: "12px 28px",
      background: disabled
        ? REC_T.faint
        : "linear-gradient(135deg, #a78bfa 0%, #818cf8 50%, #6366f1 100%)",
      color: disabled ? REC_T.muted : "#fff",
      border: disabled ? `1px solid ${REC_T.border}` : "1px solid rgba(167,139,250,0.4)",
      borderRadius: "10px",
      fontSize: "14px",
      fontWeight: 700,
      fontFamily: "'Outfit', sans-serif",
      cursor: disabled ? "not-allowed" : "pointer",
      letterSpacing: "0.03em",
      whiteSpace: "nowrap",
      animation: !disabled ? "pulseGlow 3s ease infinite" : "none",
    }}
  >
    {loading ? (
      <>
        <REC_WaveLoader />
        <span>Analyzing…</span>
      </>
    ) : (
      <>
        <span style={{ fontSize: "16px" }}>⚡</span>
        <span>Analyze Resume</span>
      </>
    )}
  </button>
);

/* ═══════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════ */
function RecruiterView() {
  const [resumeText, setResumeText] = useState("");
  const [role, setRole] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const resultsRef = useRef(null);

  const handleAnalyze = async () => {
    if (!resumeText) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("http://localhost:5009/api/resume/recruiter-view", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          resumeText,
          role
        })
      });

      const data = await res.json();
      setResult(data);

    } catch (err) {
      setError("Failed to analyze resume");
    } finally {
      setLoading(false);
    }
  };

  const verdictMeta = () => {
    if (!result?.verdict) return { color: REC_T.muted, bg: REC_T.card, border: REC_T.border };
    const v = result.verdict.toLowerCase();
    if (/(strong|excellent|good|great|impressive|solid)/i.test(v))
      return { color: REC_T.green, bg: REC_T.greenDim, border: REC_T.greenBord };
    if (/(weak|poor|basic|improvement|lacking|needs)/i.test(v))
      return { color: REC_T.red, bg: REC_T.redDim, border: REC_T.redBord };
    return { color: REC_T.amber, bg: REC_T.amberDim, border: REC_T.amberBord };
  };
  const vm = verdictMeta();

  const canAnalyze = !loading && resumeText.trim().length > 0;

  return (
    <div style={{
      minHeight: "100vh",
      background: REC_T.bg,
      color: REC_T.text,
      fontFamily: "'Outfit', sans-serif",
      position: "relative",
      overflow: "hidden",
    }}>
      <style>{REC_STYLES}</style>

      {/* ── Ambient background orbs ── */}
      <div style={{
        position: "fixed", top: "-200px", left: "-200px",
        width: "600px", height: "600px",
        background: "radial-gradient(circle, rgba(167,139,250,0.06) 0%, transparent 70%)",
        pointerEvents: "none", zIndex: 0,
      }} />
      <div style={{
        position: "fixed", bottom: "-200px", right: "-100px",
        width: "500px", height: "500px",
        background: "radial-gradient(circle, rgba(0,212,170,0.05) 0%, transparent 70%)",
        pointerEvents: "none", zIndex: 0,
      }} />

      <div style={{ maxWidth: "880px", margin: "0 auto", padding: "2.5rem 1.5rem", position: "relative", zIndex: 1 }}>

        {/* ════ HEADER ════ */}
        <div style={{ marginBottom: "2.25rem", animation: "fadeUp 0.4s ease" }}>
          {/* Brand row */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
            <div style={{
              display: "flex", alignItems: "center", gap: "9px",
              background: "linear-gradient(135deg, rgba(167,139,250,0.15), rgba(99,102,241,0.08))",
              border: `1px solid ${REC_T.purpleBord}`,
              borderRadius: "12px", padding: "7px 14px",
            }}>
              <div style={{
                width: "30px", height: "30px", borderRadius: "8px",
                background: "linear-gradient(135deg, #a78bfa, #6366f1)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "15px", boxShadow: "0 0 12px rgba(167,139,250,0.4)",
              }}>⚡</div>
              <span style={{
                fontWeight: 900, fontSize: "13px",
                letterSpacing: "0.12em", textTransform: "uppercase",
                color: REC_T.text,
              }}>SKILLIO</span>
            </div>
            <div style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "10px", color: REC_T.purple,
              background: REC_T.purpleDim,
              border: `1px solid ${REC_T.purpleBord}`,
              padding: "3px 11px", borderRadius: "99px",
              letterSpacing: "0.1em",
            }}>Recruiter View</div>
          </div>

          <h1 style={{
            fontWeight: 900, fontSize: "2.6rem", lineHeight: 1.05,
            color: REC_T.text, letterSpacing: "-0.02em",
            marginBottom: "8px",
          }}>
            Resume{" "}
            <span style={{
              background: "linear-gradient(135deg, #a78bfa, #60a5fa)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>Analysis</span>
          </h1>
          <p style={{ fontSize: "15px", color: REC_T.muted, lineHeight: 1.6 }}>
            Paste your resume — get a brutally honest AI recruiter breakdown in seconds.
          </p>
        </div>

        {/* ════ INPUT CARD ════ */}
        <div style={{
          background: REC_T.card,
          border: `1px solid ${REC_T.border}`,
          borderRadius: "20px",
          padding: "1.75rem",
          marginBottom: "1.25rem",
          animation: "fadeUp 0.5s ease 0.1s both",
          position: "relative",
          overflow: "hidden",
        }}>
          {/* Top accent line */}
          <div style={{
            position: "absolute", top: 0, left: "10%", right: "10%", height: "1px",
            background: "linear-gradient(90deg, transparent, rgba(167,139,250,0.5), transparent)",
          }} />

          <REC_Label color={REC_T.purple + "cc"}>Resume Text</REC_Label>
          <textarea
            className="resume-textarea"
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            placeholder="Paste your full resume here…"
            rows={9}
            style={{
              width: "100%",
              background: REC_T.bgDeep,
              border: `1px solid ${REC_T.border}`,
              borderRadius: "12px",
              color: REC_T.text,
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "13px",
              lineHeight: 1.8,
              padding: "16px",
              resize: "vertical",
              display: "block",
            }}
          />

          <div style={{
            display: "flex", gap: "10px",
            marginTop: "1.1rem", flexWrap: "wrap", alignItems: "center",
          }}>
            <input
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="Target role (optional) — e.g. Backend Engineer"
              style={{
                flex: 1, minWidth: "200px",
                background: REC_T.bgDeep,
                border: `1px solid ${REC_T.border}`,
                borderRadius: "10px",
                color: REC_T.text,
                fontFamily: "'Outfit', sans-serif",
                fontSize: "14px",
                padding: "11px 16px",
                transition: "border-color 0.2s ease, box-shadow 0.2s ease",
              }}
            />
            <REC_AnalyzeButton
              onClick={handleAnalyze}
              loading={loading}
              disabled={!canAnalyze}
            />
          </div>
        </div>

        {/* ════ ERROR ════ */}
        {error && (
          <div style={{
            background: REC_T.redDim,
            border: `1px solid ${REC_T.redBord}`,
            borderRadius: "12px",
            padding: "1rem 1.25rem",
            color: REC_T.red,
            fontSize: "14px",
            marginBottom: "1.25rem",
            display: "flex", alignItems: "center", gap: "10px",
            animation: "scaleIn 0.3s ease",
          }}>
            <span style={{ fontSize: "18px", flexShrink: 0 }}>⚠</span>
            {error}
          </div>
        )}

        {/* ════ RESULTS ════ */}
        {result && (
          <div ref={resultsRef}>

            {/* Divider */}
            <div style={{
              display: "flex", alignItems: "center", gap: "12px",
              marginBottom: "1.25rem",
              animation: "fadeIn 0.4s ease",
            }}>
              <div style={{ flex: 1, height: "1px", background: REC_T.border }} />
              <span style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "10px", color: REC_T.purple,
                letterSpacing: "0.12em", textTransform: "uppercase",
              }}>Analysis Results</span>
              <div style={{ flex: 1, height: "1px", background: REC_T.border }} />
            </div>

            {/* ── Stat Row ── */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "12px",
              marginBottom: "12px",
            }}>
              <REC_StatCard label="Skills Found" value={result.skillsFound?.length ?? 0} sub="detected in resume" color={REC_T.green} delay={0} />
              <REC_StatCard label="Missing Skills" value={result.missingSkills?.length ?? 0} sub="not on your resume" color={REC_T.red} delay={0.08} />
              <REC_StatCard label="Warnings" value={result.warnings?.length ?? 0} sub="issues flagged" color={REC_T.amber} delay={0.16} />
            </div>

            {/* ── Verdict ── */}
            <REC_SectionCard accent={vm.color} delay={0.22} style={{
              background: vm.bg,
              border: `1px solid ${vm.border}`,
              marginBottom: "12px",
            }}>
              <REC_Label color={vm.color + "aa"}>Verdict</REC_Label>
              <p style={{
                fontSize: "1.05rem",
                fontWeight: 600,
                color: vm.color,
                lineHeight: 1.6,
                fontFamily: "'Outfit', sans-serif",
              }}>
                {result.verdict || "No verdict provided."}
              </p>
            </REC_SectionCard>

            {/* ── Skills 2-col ── */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
              marginBottom: "12px",
            }}>
              <REC_SectionCard accent={REC_T.green} delay={0.3}>
                <REC_Label color={REC_T.green + "99"}>Skills Found</REC_Label>
                {result.skillsFound?.length > 0
                  ? <div>{result.skillsFound.map((s, i) => (
                    <REC_Badge key={i} label={s} type="green" delay={0.32 + i * 0.04} />
                  ))}</div>
                  : <p style={{ fontSize: "13px", color: REC_T.muted }}>No skills detected.</p>
                }
              </REC_SectionCard>

              <REC_SectionCard accent={REC_T.red} delay={0.36}>
                <REC_Label color={REC_T.red + "99"}>Missing Skills</REC_Label>
                {result.missingSkills?.length > 0
                  ? <div>{result.missingSkills.map((s, i) => (
                    <REC_Badge key={i} label={s} type="red" delay={0.38 + i * 0.04} />
                  ))}</div>
                  : <p style={{ fontSize: "13px", color: REC_T.muted }}>None flagged — solid coverage!</p>
                }
              </REC_SectionCard>
            </div>

            {/* ── Warnings ── */}
            <REC_SectionCard accent={REC_T.amber} delay={0.44}>
              <REC_Label color={REC_T.amber + "99"}>Warnings</REC_Label>
              {result.warnings?.length > 0 ? (
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column" }}>
                  {result.warnings.map((w, i) => (
                    <li key={i} style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "12px",
                      fontSize: "14px",
                      color: REC_T.text,
                      lineHeight: 1.6,
                      padding: "11px 0",
                      borderBottom: i < result.warnings.length - 1 ? `1px solid ${REC_T.border}` : "none",
                      animation: `warningSlide 0.4s ease ${0.46 + i * 0.07}s both`,
                    }}>
                      <span style={{
                        marginTop: "2px", flexShrink: 0,
                        width: "22px", height: "22px",
                        borderRadius: "50%",
                        background: REC_T.amberDim,
                        border: `1px solid ${REC_T.amberBord}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "11px", fontWeight: 700, color: REC_T.amber,
                        fontFamily: "'JetBrains Mono', monospace",
                      }}>!</span>
                      {w}
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ fontSize: "13px", color: REC_T.muted }}>No warnings — you're looking solid! 🎉</p>
              )}
            </REC_SectionCard>

          </div>
        )}
      </div>
    </div>
  );
}


/* ══════════════════════════════════════════════════════════
   ROOT APP
══════════════════════════════════════════════════════════ */
/* ══════════════════════════════════════════════════════════
   LANDING HOME PAGE (shown after login, before Dashboard)
══════════════════════════════════════════════════════════ */
const LANDING_CSS = `
@keyframes orbit1 { from{transform:rotate(0deg) translateX(120px) rotate(0deg)} to{transform:rotate(360deg) translateX(120px) rotate(-360deg)} }
@keyframes orbit2 { from{transform:rotate(180deg) translateX(80px) rotate(-180deg)} to{transform:rotate(540deg) translateX(80px) rotate(-540deg)} }
@keyframes morphBg { 0%,100%{border-radius:60% 40% 30% 70%/60% 30% 70% 40%;} 50%{border-radius:30% 60% 70% 40%/50% 60% 30% 60%;} }
@keyframes typewriter { from{width:0} to{width:100%} }
@keyframes blinkCaret { 0%,100%{border-color:transparent} 50%{border-color:#4f8ef7} }
@keyframes floatParticle { 0%{transform:translateY(0) rotate(0deg);opacity:1} 100%{transform:translateY(-80px) rotate(360deg);opacity:0} }
@keyframes heroGlow { 0%,100%{box-shadow:0 0 40px rgba(79,142,247,.3),0 0 80px rgba(124,58,237,.2)} 50%{box-shadow:0 0 80px rgba(79,142,247,.6),0 0 160px rgba(124,58,237,.4)} }
@keyframes progressFill { from{width:0%} to{width:var(--w)} }
@keyframes countUp2 { from{opacity:0;transform:scale(.5)} to{opacity:1;transform:scale(1)} }
@keyframes bookFloat { 0%,100%{transform:translateY(0) rotate(-5deg)} 50%{transform:translateY(-20px) rotate(5deg)} }
@keyframes codeScroll { 0%{transform:translateY(0)} 100%{transform:translateY(-50%)} }
@keyframes gridPulse { 0%,100%{opacity:.03} 50%{opacity:.08} }
@keyframes starTwinkle { 0%,100%{transform:scale(1);opacity:.6} 50%{transform:scale(1.5);opacity:1} }
@keyframes slideFromLeft { from{opacity:0;transform:translateX(-40px)} to{opacity:1;transform:translateX(0)} }
@keyframes slideFromRight { from{opacity:0;transform:translateX(40px)} to{opacity:1;transform:translateX(0)} }
@keyframes slideFromBottom { from{opacity:0;transform:translateY(40px)} to{opacity:1;transform:translateY(0)} }
@keyframes shimmerText { 0%{background-position:-200% center} 100%{background-position:200% center} }
@keyframes aurora { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
@keyframes ribbonFlow { 0%{transform:translateX(-100%)} 100%{transform:translateX(100%)} }
@keyframes floatIcon { 0%,100%{transform:translateY(0) scale(1)} 50%{transform:translateY(-10px) scale(1.1)} }

.landing-poem-line { animation: slideFromBottom .5s ease both; }
.landing-stat { animation: countUp2 .6s cubic-bezier(.34,1.56,.64,1) both; }
.landing-feature { animation: slideFromBottom .5s ease both; }

.header-glow-aura {
  position: fixed;
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(79,142,247,0.12) 0%, rgba(124,58,237,0.04) 50%, transparent 70%);
  border-radius: 50%;
  pointer-events: none;
  z-index: 1;
  filter: blur(40px);
  transition: transform 0.1s linear;
}

.luminous-ribbon {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: linear-gradient(90deg, transparent, #4f8ef7, #ff80b5, #f59e0b, #10b981, transparent);
  background-size: 200% 100%;
  animation: aurora 4s linear infinite, ribbonFlow 6s linear infinite;
  opacity: 0.8;
  z-index: 2000;
}
`;


function LandingHomePage({ user, onGoToDashboard, onLogout }) {
  const [dropOpen, setDropOpen] = useState(false);
  const [particles, setParticles] = useState([]);
  const [activeLine, setActiveLine] = useState(-1);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };


  useEffect(() => {
    const p = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 5,
      dur: 3 + Math.random() * 4,
      size: 4 + Math.random() * 8,
      emoji: ['📚','⚡','🧠','💡','🎯','🚀','✨','📊'][Math.floor(Math.random() * 8)]
    }));
    setParticles(p);
    const lines = [0, 1, 2, 3];
    lines.forEach((_, i) => setTimeout(() => setActiveLine(i), 300 + i * 400));
  }, []);

  const navItems = [
    { icon: '⚡', label: 'Dashboard', key: 'dashboard' },
    { icon: '📅', label: 'Schedule', key: 'schedule' },
    { icon: '📚', label: 'Courses', key: 'courses' },
    { icon: '🧠', label: 'Quiz', key: 'quiz' },
    { icon: '🤖', label: 'AI Chat', key: 'chat' },
    { icon: '📄', label: 'Resume Recruiter', key: 'resumerecruiter' },
    { icon: '⚖️', label: 'Topic Compare', key: 'topiccompare' },
    { icon: '🔍', label: 'Code Visualizer', key: 'codevis' },
    { icon: '📋', label: 'Adaptive Plan', key: 'plan' },
    { icon: '🍅', label: 'Focus Timer', key: 'pomodoro' },
    { icon: '📈', label: 'Progress', key: 'progress' },
    { icon: '💻', label: 'Sandbox', key: 'sandbox' },
    { icon: '🗺️', label: 'Roadmap', key: 'roadmap' },
    { icon: '👤', label: 'Profile', key: 'profile' },
    { icon: '⚙️', label: 'Settings', key: 'settings' },
  ];

  const poemLines = [
    "Learn, practice, rise and grow,",
    "Track your progress as you go.",
    "Stay consistent, build your flow,",
    "Small steps now, big wins — Skillio."
  ];

  const stats = [
    { icon: '🎓', value: '50K+', label: 'Learners' },
    { icon: '📚', value: '200+', label: 'Courses' },
    { icon: '⚡', value: '95%', label: 'Success Rate' },
    { icon: '🏆', value: '4.9★', label: 'Rating' },
  ];

  const features = [
    { icon: '🤖', title: 'AI-Powered Learning', desc: 'Adaptive curriculum that evolves with your pace and style', color: '#4f8ef7' },
    { icon: '🧠', title: 'Smart Quizzes', desc: 'Personalized quiz generation to reinforce concepts', color: '#7c3aed' },
    { icon: '📊', title: 'Progress Analytics', desc: 'Deep insights into your learning journey and growth', color: '#10b981' },
    { icon: '🍅', title: 'Focus Timer', desc: 'Pomodoro-based sessions to maximize productivity', color: '#f59e0b' },
    { icon: '💻', title: 'Live Sandbox', desc: 'Code, run and experiment directly in the browser', color: '#f43f5e' },
    { icon: '🗺️', title: 'Roadmap Gen', desc: 'Visual learning paths tailored to your goals', color: '#06b6d4' },
  ];

  return (
    <div onMouseMove={handleMouseMove} style={{ minHeight: '100vh', background: '#0f1117', fontFamily: "'DM Sans',sans-serif", color: '#f0f2f8', overflowX: 'hidden', position: 'relative' }}>
      <style>{LANDING_CSS}</style>

      {/* Mouse Reactive Aura */}
      <div className="header-glow-aura" style={{ transform: `translate(${mousePos.x - 200}px, ${mousePos.y - 200}px)` }} />

      {/* Top Luminous Ribbon */}
      <div className="luminous-ribbon" />


      {/* Animated grid background */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, backgroundImage: 'linear-gradient(rgba(79,142,247,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(79,142,247,.04) 1px,transparent 1px)', backgroundSize: '60px 60px', animation: 'gridPulse 4s ease-in-out infinite' }} />

      {/* Floating particles */}
      {particles.map(p => (
        <div key={p.id} style={{ position: 'fixed', left: `${p.x}%`, bottom: '-20px', fontSize: p.size, opacity: 0, animation: `floatParticle ${p.dur}s ${p.delay}s ease-in infinite`, zIndex: 1, pointerEvents: 'none' }}>{p.emoji}</div>
      ))}

      {/* Glow blobs */}
      <div style={{ position: 'fixed', top: '-100px', left: '-100px', width: 500, height: 500, borderRadius: '50%', background: 'rgba(79,142,247,.08)', filter: 'blur(100px)', pointerEvents: 'none', zIndex: 0, animation: 'heroGlow 6s ease-in-out infinite' }} />
      <div style={{ position: 'fixed', bottom: '-100px', right: '-100px', width: 400, height: 400, borderRadius: '50%', background: 'rgba(124,58,237,.08)', filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0 }} />

      {/* ── TOP NAVBAR ── */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 1000, background: 'rgba(15,17,23,.92)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,.07)', display: 'flex', alignItems: 'center', padding: '0 32px', height: 60, gap: 16 }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginRight: 'auto' }}>
          <img src="/logo.svg" alt="Skillio Logo" style={{ width: 32, height: 32, borderRadius: 9, objectFit: 'contain', boxShadow: '0 0 16px rgba(79,142,247,.4)' }} />
          <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 16, letterSpacing: '.04em' }}>SKILLIO</span>
        </div>

        {/* Nav menu dropdown */}
        <div style={{ position: 'relative' }}>
          <button onClick={() => setDropOpen(!dropOpen)}
            style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 16px', borderRadius: 10, background: dropOpen ? 'rgba(79,142,247,.18)' : 'rgba(255,255,255,.05)', border: `1px solid ${dropOpen ? 'rgba(79,142,247,.5)' : 'rgba(255,255,255,.1)'}`, color: '#f0f2f8', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans',sans-serif", transition: 'all .2s' }}>
            🧭 Navigate <span style={{ fontSize: 10, transition: 'transform .2s', display: 'inline-block', transform: dropOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>▾</span>
          </button>
          {dropOpen && (
            <div onClick={() => setDropOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 999 }}>
              <div onClick={e => e.stopPropagation()} style={{ position: 'absolute', top: '100%', left: 0, marginTop: 8, width: 240, background: '#13151d', border: '1px solid rgba(255,255,255,.1)', borderRadius: 14, boxShadow: '0 16px 48px rgba(0,0,0,.5)', overflow: 'hidden', animation: 'popIn .2s ease', zIndex: 1000 }}>
                <div style={{ padding: '8px 8px' }}>
                  {navItems.map(item => (
                    <button key={item.key} onClick={() => { setDropOpen(false); onGoToDashboard(item.key); }}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 9, background: 'transparent', border: 'none', color: '#9aa5bc', cursor: 'pointer', fontSize: 13, fontWeight: 500, fontFamily: "'DM Sans',sans-serif", textAlign: 'left', transition: 'all .15s' }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(79,142,247,.12)'; e.currentTarget.style.color = '#f0f2f8'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#9aa5bc'; }}>
                      <span style={{ fontSize: 15, width: 20, textAlign: 'center' }}>{item.icon}</span>
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User + logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ fontSize: 12, color: '#9aa5bc' }}>Hi, <span style={{ color: '#f0f2f8', fontWeight: 700 }}>{user?.name?.split(' ')[0]}</span></div>
          <Ava name={user?.name || ''} size={32} />
          <button onClick={onLogout} style={{ padding: '7px 14px', borderRadius: 9, background: 'rgba(244,63,94,.1)', border: '1px solid rgba(244,63,94,.25)', color: '#f43f5e', cursor: 'pointer', fontSize: 12, fontWeight: 700, fontFamily: "'DM Sans',sans-serif" }}>Logout</button>
        </div>
      </nav>

      {/* ── HERO SECTION ── */}
      <div style={{ position: 'relative', zIndex: 2, maxWidth: 900, margin: '0 auto', padding: '80px 32px 60px', textAlign: 'center' }}>

        {/* Badge */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 99, background: 'rgba(79,142,247,.12)', border: '1px solid rgba(79,142,247,.3)', marginBottom: 32, animation: 'slideFromBottom .4s ease both' }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981', display: 'inline-block', animation: 'pulse 2s ease-in-out infinite' }} />
          <span style={{ fontSize: 12, color: '#4f8ef7', fontWeight: 700, fontFamily: "'JetBrains Mono',monospace", letterSpacing: '.06em' }}>AI-POWERED ADAPTIVE LEARNING</span>
        </div>

        {/* Poem lines with stagger animation */}
        <div style={{ marginBottom: 48 }}>
          {poemLines.map((line, i) => (
            <div key={i} className="landing-poem-line" style={{
              fontFamily: "'Syne',sans-serif", fontWeight: i === 3 ? 900 : 700,
              fontSize: i === 3 ? 42 : 36, lineHeight: 1.25, marginBottom: 4,
              animationDelay: `${i * 0.15 + 0.2}s`,
              background: i === 3 ? 'linear-gradient(135deg,#4f8ef7,#7c3aed,#10b981)' : 'none',
              WebkitBackgroundClip: i === 3 ? 'text' : 'unset',
              WebkitTextFillColor: i === 3 ? 'transparent' : '#f0f2f8',
              backgroundSize: '200% 200%', animation: i === 3 ? 'slideFromBottom .5s ease both, shimmerText 3s linear infinite' : `slideFromBottom .5s ${i * 0.15 + 0.2}s ease both`,
            }}>{line}</div>
          ))}
        </div>

        {/* CTA Buttons */}
        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 72, animation: 'slideFromBottom .5s .8s ease both' }}>
          <button onClick={() => onGoToDashboard('dashboard')}
            style={{ padding: '14px 32px', borderRadius: 13, background: 'linear-gradient(135deg,#4f8ef7,#7c3aed)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 15, fontWeight: 800, fontFamily: "'Syne',sans-serif", boxShadow: '0 8px 32px rgba(79,142,247,.4)', animation: 'gradShift 3s ease infinite', backgroundSize: '200% 200%', transition: 'transform .2s' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px) scale(1.03)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0) scale(1)'}>
            🚀 Go to Dashboard
          </button>
          <button onClick={() => onGoToDashboard('courses')}
            style={{ padding: '14px 32px', borderRadius: 13, background: 'transparent', color: '#f0f2f8', border: '1.5px solid rgba(255,255,255,.2)', cursor: 'pointer', fontSize: 15, fontWeight: 700, fontFamily: "'DM Sans',sans-serif", transition: 'all .2s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#4f8ef7'; e.currentTarget.style.color = '#4f8ef7'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,.2)'; e.currentTarget.style.color = '#f0f2f8'; }}>
            📚 Explore Courses
          </button>
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 80 }}>
          {stats.map((s, i) => (
            <div key={i} className="landing-stat" style={{ animationDelay: `${i * .12 + 1}s`, background: '#16181f', border: '1px solid rgba(255,255,255,.07)', borderRadius: 16, padding: '20px 16px', textAlign: 'center' }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
              <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 24, color: '#4f8ef7', marginBottom: 4 }}>{s.value}</div>
              <div style={{ fontSize: 11, color: '#6b7a99', fontFamily: "'JetBrains Mono',monospace", textTransform: 'uppercase', letterSpacing: '.06em' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Features grid */}
        <div style={{ textAlign: 'left', marginBottom: 60 }}>
          <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 24, textAlign: 'center', marginBottom: 32, animation: 'slideFromBottom .5s 1.2s ease both' }}>Everything you need to master any skill</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
            {features.map((f, i) => (
              <div key={i} className="landing-feature" style={{ animationDelay: `${i * .1 + 1.3}s`, background: '#16181f', border: `1px solid ${f.color}22`, borderRadius: 16, padding: '22px 20px', cursor: 'pointer', transition: 'transform .2s, border-color .2s, box-shadow .2s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.borderColor = f.color; e.currentTarget.style.boxShadow = `0 16px 40px ${f.color}22`; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = `${f.color}22`; e.currentTarget.style.boxShadow = 'none'; }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: `${f.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, marginBottom: 14 }}>{f.icon}</div>
                <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 15, marginBottom: 6, color: '#f0f2f8' }}>{f.title}</div>
                <div style={{ fontSize: 12, color: '#6b7a99', lineHeight: 1.6 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Orbiting animation */}
        <div style={{ position: 'relative', width: 260, height: 260, margin: '0 auto 60px', animation: 'slideFromBottom .5s 1.8s ease both' }}>
          <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '1px dashed rgba(79,142,247,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg,#4f8ef7,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, boxShadow: '0 0 40px rgba(79,142,247,.5)', animation: 'heroGlow 4s ease-in-out infinite' }}>⚡</div>
          </div>
          {[['📚',0], ['🧠',120], ['🚀',240]].map(([em, deg], i) => (
            <div key={i} style={{ position: 'absolute', top: '50%', left: '50%', width: 44, height: 44, marginTop: -22, marginLeft: -22, borderRadius: '50%', background: '#1e2130', border: '1px solid rgba(255,255,255,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, animation: `orbit${i % 2 === 0 ? '1' : '2'} ${6 + i}s linear infinite`, transformOrigin: '0 0', transform: `rotate(${deg}deg) translateX(110px) rotate(-${deg}deg)` }}>{em}</div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ fontSize: 12, color: '#6b7a99', borderTop: '1px solid rgba(255,255,255,.07)', paddingTop: 32, fontFamily: "'JetBrains Mono',monospace" }}>
          © 2026 major project Skillio · AI-Powered Adaptive Learning Platform
        </div>
      </div>
    </div>
  );
}

export default function App() {
  useEffect(() => { injectStyles(); }, []);
  const [page, setPage] = useState("login");
  const [user, setUser] = useState(null);
  const [startPage, setStartPage] = useState('dashboard');

  useEffect(() => {
    if (user && user.email) {
      window.originalFetch = window.originalFetch || window.fetch;
      window.fetch = async (url, options = {}) => {
        if (!url.includes('localhost')) return window.originalFetch(url, options);
        if (options.method === "POST" && options.body) {
          try {
            const body = JSON.parse(options.body);
            body.userId = user.email;
            options.body = JSON.stringify(body);
          } catch(e) {}
        } else if (!options.method || options.method === "GET") {
          url = url + (url.includes("?") ? "&" : "?") + "userId=" + encodeURIComponent(user.email);
        }
        return window.originalFetch(url, options);
      };
    } else if (window.originalFetch) {
      window.fetch = window.originalFetch;
    }
  }, [user]);

  const handleLogin = (u) => { setUser(u); setPage("home"); };
  const handleLogout = () => { setUser(null); setPage("login"); };

  const goToDashboard = (tab) => { setStartPage(tab || 'dashboard'); setPage('dashboard'); };

  const [pageTransition, setPageTransition] = useState(false);
  const goPage = (p) => { setPageTransition(true); setTimeout(() => { setPage(p); setPageTransition(false); }, 200); };
  if (page === "home" && user) return <LandingHomePage user={user} onGoToDashboard={goToDashboard} onLogout={handleLogout} />;
  if (page === "dashboard" && user) return <Dashboard user={user} onLogout={handleLogout} startPage={startPage} />;
  if (page === "register") return <RegisterPage go={goPage} onLogin={handleLogin} />;
  if (page === "forgot") return <ForgotPage go={goPage} />;
  return (
    <div style={{ animation: pageTransition ? "fadeUp .2s ease reverse" : "fadeUp .4s ease both" }}>
      <LoginPage go={goPage} onLogin={handleLogin} />
    </div>
  );
}

