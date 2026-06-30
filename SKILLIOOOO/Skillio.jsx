import { useState, useEffect, useRef } from "react";
import ReactPlayer from "react-player/youtube";

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
  { label: "At least 8 characters",      fn: (p) => p.length >= 8 },
  { label: "Uppercase letter (A–Z)",      fn: (p) => /[A-Z]/.test(p) },
  { label: "Lowercase letter (a–z)",      fn: (p) => /[a-z]/.test(p) },
  { label: "Number (0–9)",               fn: (p) => /[0-9]/.test(p) },
  { label: "Special character (!@#…)",   fn: (p) => /[^A-Za-z0-9]/.test(p) },
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
@keyframes dotBlink { 0%,100%{opacity:.3} 50%{opacity:1} }

.fade-up  { animation: fadeUp .45s ease both; }
.slide-in { animation: slideIn .35s ease both; }
.pop-in   { animation: popIn .4s cubic-bezier(.34,1.56,.64,1) both; }

.float-book   { animation: floatY  3.2s ease-in-out infinite; }
.float-pencil { animation: floatY2 2.6s ease-in-out infinite; }
.twinkle1     { animation: twinkle 1.9s ease-in-out infinite; }
.twinkle2     { animation: twinkle 2.5s ease-in-out infinite .7s; }
.twinkle3     { animation: twinkle 2.1s ease-in-out infinite 1.2s; }
.login-float  { animation: loginFloat 3s ease-in-out infinite; }
.screen-glow  { animation: screenGlow 3s ease-in-out infinite; }

input, textarea, select {
  font-family: 'DM Sans', sans-serif;
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
        {[1,2,3,4,5].map(i => (
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
          <circle cx="22" cy="22" r="18" fill={"rgba(79,142,247,.15)"} stroke={"#4f8ef7"} strokeWidth="1.2" strokeOpacity=".5"/>
          <circle cx="22" cy="22" r="9" fill={"rgba(79,142,247,.2)"} stroke={"#4f8ef7"} strokeWidth="1" strokeOpacity=".6"/>
          <circle cx="22" cy="22" r="4" fill={"#4f8ef7"} fillOpacity=".95"/>
          <circle cx="22" cy="22" r="1.5" fill="#fff"/>
          <line x1="22" y1="4" x2="22" y2="13" stroke={"#4f8ef7"} strokeWidth="1" strokeOpacity=".4"/>
          <line x1="22" y1="31" x2="22" y2="40" stroke={"#4f8ef7"} strokeWidth="1" strokeOpacity=".4"/>
          <line x1="4" y1="22" x2="13" y2="22" stroke={"#4f8ef7"} strokeWidth="1" strokeOpacity=".4"/>
          <line x1="31" y1="22" x2="40" y2="22" stroke={"#4f8ef7"} strokeWidth="1" strokeOpacity=".4"/>
        </svg>
        <div style={{ position:"absolute", width:8, height:8, borderRadius:"50%", background: "#7c3aed", animation:"orbitDot 2.2s linear infinite", transformOrigin:"0 0", top:"50%", left:"50%", marginTop:-4, marginLeft:-4 }}/>
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
    <span key={0}><span style={{color:"#7c3aed"}}>const</span><span style={{color:"#f0f2f8"}}> learn </span><span style={{color:"#4f8ef7"}}>=</span><span style={{color:"#10b981"}}> () =&gt; {"{"}</span></span>,
    <span key={1}><span style={{color:"#6b7a99"}}>{"  "}</span><span style={{color:"#f59e0b"}}>skill</span><span style={{color:"#f0f2f8"}}>.</span><span style={{color:"#4f8ef7"}}>level</span><span style={{color:"#f0f2f8"}}> ++</span></span>,
    <span key={2}><span style={{color:"#10b981"}}>{"// 🚀 mastered!"}</span></span>,
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
            {["#f43f5e","#f59e0b","#10b981"].map(c => <div key={c} style={{ width: 7, height: 7, borderRadius: "50%", background: c, opacity: .7 }}/>)}
          </div>
          <div style={{ flex: 1, height: 14, background: T.subtle, borderRadius: 4, display: "flex", alignItems: "center", paddingLeft: 6 }}>
            <span style={{ fontSize: 8, color: T.muted, fontFamily: "'JetBrains Mono',monospace" }}>skillio.app</span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 10 }}>
          <div style={{ width: 16, height: 16, borderRadius: 4, background: "linear-gradient(135deg,#4f8ef7,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9 }}>⚡</div>
          <span style={{ fontSize: 10, fontWeight: 800, fontFamily: "'Syne',sans-serif" }}>SKILLIO</span>
        </div>
        <div style={{ background: T.card, border: `1.5px solid ${isTyping ? "#4f8ef7" : T.border}`, borderRadius: 7, padding: "5px 8px", marginBottom: 6, transition: "border-color .3s" }}>
          <div style={{ fontSize: 8, color: T.muted, marginBottom: 2, fontFamily: "'JetBrains Mono',monospace" }}>EMAIL</div>
          <div style={{ fontSize: 9, color: (isTyping||isChecking||isSuccess) ? T.text : T.muted, fontFamily: "'JetBrains Mono',monospace" }}>
            {isTyping ? <><span>you@example</span><span style={{ animation:"typeCursor 1s step-end infinite", color:"#4f8ef7" }}>▌</span></> : (isChecking||isSuccess) ? "you@example.com" : "···"}
          </div>
        </div>
        <div style={{ background: T.card, border: `1.5px solid ${T.border}`, borderRadius: 7, padding: "5px 8px", marginBottom: 10 }}>
          <div style={{ fontSize: 8, color: T.muted, marginBottom: 2, fontFamily: "'JetBrains Mono',monospace" }}>PASSWORD</div>
          <div style={{ fontSize: 9, color: T.muted, letterSpacing: 2 }}>{(isChecking||isSuccess) ? "••••••••" : "••••"}</div>
        </div>
        <div style={{ background: isSuccess ? "linear-gradient(135deg,#10b981,#16a34a)" : isChecking ? "linear-gradient(135deg,#f59e0b,#d97706)" : "linear-gradient(135deg,#4f8ef7,#7c3aed)", borderRadius: 8, padding: "7px", textAlign: "center", fontSize: 10, fontWeight: 700, color: "#fff", transition: "background .4s", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
          {isChecking ? <><span style={{ animation:"spin .7s linear infinite", display:"inline-block" }}>⟳</span><span> Verifying…</span></> : isSuccess ? "✓ Welcome back!" : "Sign In →"}
        </div>
        {isSuccess && (
          <div style={{ position: "absolute", top: -10, right: -10, width: 26, height: 26, borderRadius: "50%", background: "#10b981", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, animation: "checkPop .4s cubic-bezier(.34,1.56,.64,1) both" }}>✓</div>
        )}
        <div style={{ display: "flex", justifyContent: "center", gap: 5, marginTop: 10 }}>
          {[0,1,2,3].map(i => (
            <div key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: i === step ? "#4f8ef7" : T.subtle, transition: "background .3s", animation: i === step ? "dotBlink 1s ease-in-out infinite" : "none" }}/>
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
    { name: "Arjun Mehta", email: "arjun.mehta@gmail.com" },
    { name: "Priya Sharma", email: "priya.sharma@gmail.com" },
  ];

  const validate = () => {
    const e = {};
    if (!email) e.email = "Email is required";
    else if (!validateEmail(email)) e.email = "Enter a valid email";
    if (!pass) e.pass = "Password is required";
    else if (pass.length < 8) e.pass = "Must be at least 8 characters";
    return e;
  };

  const submit = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({}); setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLogin({ name: email.split("@")[0].replace(/\./g, " ").replace(/\b\w/g, c => c.toUpperCase()), email });
    }, 1100);
  };

  const emailOk = validateEmail(email);
  const passOk = pass.length >= 8;

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: `radial-gradient(ellipse at 15% 60%, rgba(79,142,247,.13) 0%, transparent 55%), radial-gradient(ellipse at 85% 15%, rgba(124,58,237,.11) 0%, transparent 55%), ${T.bg}` }}>
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {/* PROVIDER MODAL */}
      {provider && (
        <div onClick={() => setProvider(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, backdropFilter: "blur(8px)" }}>
          <div onClick={e => e.stopPropagation()} className="pop-in" style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 20, padding: 30, width: 380 }}>
            <div style={{ textAlign: "center", marginBottom: 22 }}>
              <div style={{ fontSize: 34, marginBottom: 8 }}>{provider === "Google" ? "🔵" : "⚫"}</div>
              <h3 style={{ fontWeight: 800, fontSize: 17, marginBottom: 4, fontFamily: "'Syne',sans-serif" }}>Sign in with {provider}</h3>
              <p style={{ color: T.muted, fontSize: 13 }}>Choose an account to continue</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 9, marginBottom: 14 }}>
              {ACCOUNTS.map((acc, i) => (
                <button key={i} onClick={() => { setProvider(null); setLoading(true); setTimeout(() => { setLoading(false); onLogin(acc); }, 900); }}
                  style={{ display: "flex", gap: 13, alignItems: "center", padding: "13px 14px", borderRadius: 12, border: `1px solid ${T.border}`, background: T.surface, cursor: "pointer", color: T.text, textAlign: "left", transition: "border-color .2s, background .2s" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = T.accent; e.currentTarget.style.background = T.card; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.background = T.surface; }}>
                  <Ava name={acc.name} size={38} />
                  <div><div style={{ fontWeight: 600, fontSize: 14 }}>{acc.name}</div><div style={{ fontSize: 12, color: T.muted }}>{acc.email}</div></div>
                </button>
              ))}
            </div>
            <button onClick={() => { setProvider(null); go("register"); }}
              style={{ width: "100%", padding: 11, borderRadius: 11, border: `1px dashed ${T.border}`, background: "transparent", color: T.muted, cursor: "pointer", fontSize: 13 }}>
              + Use another account
            </button>
          </div>
        </div>
      )}

      {/* ── LEFT PANEL ── */}
      <div style={{ flex: 1.3, display: "flex", flexDirection: "column", justifyContent: "center", padding: "56px 60px", position: "relative", overflow: "hidden" }}>
        {/* Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 52 }}>
          <div style={{ width: 40, height: 40, borderRadius: 11, background: `linear-gradient(135deg,${T.accent},${T.violet})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, boxShadow: `0 0 28px ${T.accent}44` }}>⚡</div>
          <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 22, letterSpacing: "-.02em" }}>SKILLIO</span>
        </div>

        {/* Hero */}
        <div className="fade-up" style={{ marginBottom: 40 }}>
          <h1 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 38, lineHeight: 1.15, marginBottom: 14, letterSpacing: "-.03em" }}>
            Learn smarter.<br /><span style={{ color: T.accent }}>Grow faster.</span>
          </h1>
          <p style={{ color: T.muted, fontSize: 15, lineHeight: 1.75, maxWidth: 380 }}>AI-powered courses designed for the modern learner. Master new skills at your own pace with expert mentors.</p>
        </div>

        {/* Feature cards */}
        <div style={{ display: "flex", gap: 14, marginBottom: 28 }}>
          <FeatureCardBrain />
          <FeatureCardBars />
          <FeatureCardCode />
        </div>

        {/* Review card */}
        <div className="fade-up" style={{ animationDelay: ".3s", background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: "20px 22px", maxWidth: 420 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
            <Ava name="Priya Sharma" size={42} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>Priya Sharma</div>
              <div style={{ fontSize: 12, color: T.muted }}>UX Designer · Mumbai</div>
            </div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 4, background: `${T.emerald}18`, color: T.emerald, fontSize: 10, fontWeight: 700, padding: "4px 9px", borderRadius: 20, fontFamily: "'JetBrains Mono',monospace", letterSpacing: ".05em" }}>✔ VERIFIED</div>
          </div>
          <div style={{ color: T.amber, fontSize: 13, marginBottom: 8 }}>★★★★★</div>
          <div style={{ fontSize: 13, color: T.muted, lineHeight: 1.65, fontStyle: "italic" }}>"Skillio completely transformed how I learn. The AI tutor is incredibly intuitive — it's like having a personal mentor available 24/7."</div>
        </div>

        <StudyAnim />
      </div>

      {/* ── RIGHT FORM ── */}
      <div style={{ width: 440, background: T.card, borderLeft: `1px solid ${T.border}`, display: "flex", flexDirection: "column", justifyContent: "center", padding: "52px 44px", overflowY: "auto" }}>
        <LoginAppAnim />
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div className="float-book" style={{ width: 52, height: 52, borderRadius: 15, background: `linear-gradient(135deg,${T.accent},${T.violet})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, margin: "0 auto 14px", boxShadow: `0 0 32px ${T.accent}30` }}>⚡</div>
          <h1 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 24, letterSpacing: "-.02em", marginBottom: 5 }}>Welcome back</h1>
          <p style={{ color: T.muted, fontSize: 14 }}>Sign in to continue your learning journey</p>
        </div>

        {/* Social */}
        <div style={{ display: "flex", gap: 9, marginBottom: 20 }}>
          {[["🔵", "Google"], ["⚫", "GitHub"]].map(([ic, lb]) => (
            <button key={lb} onClick={() => setProvider(lb)}
              style={{ flex: 1, padding: "10px", borderRadius: 10, border: `1px solid ${T.border}`, background: T.surface, color: T.text, fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", gap: 7, alignItems: "center", justifyContent: "center", transition: "border-color .2s, background .2s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = T.accent; e.currentTarget.style.background = T.subtle; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.background = T.surface; }}>
              <span style={{ fontSize: 15 }}>{ic}</span>{lb}
            </button>
          ))}
        </div>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 20 }}>
          <div style={{ flex: 1, height: 1, background: T.border }} />
          <span style={{ fontSize: 11, color: T.muted, fontFamily: "'JetBrains Mono',monospace" }}>OR</span>
          <div style={{ flex: 1, height: 1, background: T.border }} />
        </div>

        <Inp label="Email Address" icon="✉" placeholder="you@example.com" value={email}
          onChange={e => { setEmail(e.target.value); setErrors(r => ({ ...r, email: "" })); }} error={errors.email} />
        <Inp label="Password" eye icon="🔒" placeholder="Min 8 characters" value={pass}
          onChange={e => { setPass(e.target.value); setErrors(r => ({ ...r, pass: "" })); }} error={errors.pass} hint="Must be at least 8 characters" />

        {/* Requirements */}
        <div style={{ padding: "11px 13px", borderRadius: 10, background: `rgba(79,142,247,.06)`, border: `1px solid rgba(79,142,247,.15)`, marginBottom: 16, marginTop: -6 }}>
          <div style={{ fontSize: 10, color: T.muted, fontWeight: 700, letterSpacing: ".07em", marginBottom: 7, fontFamily: "'JetBrains Mono',monospace" }}>SIGN IN REQUIREMENTS</div>
          {[{ label: "Valid email address", ok: emailOk }, { label: "Password at least 8 characters", ok: passOk }].map(r => (
            <div key={r.label} style={{ display: "flex", gap: 7, alignItems: "center", fontSize: 12 }}>
              <span style={{ color: r.ok ? T.emerald : T.muted, transition: "color .2s" }}>{r.ok ? "✓" : "○"}</span>
              <span style={{ color: r.ok ? T.emerald : T.muted, transition: "color .2s" }}>{r.label}</span>
            </div>
          ))}
        </div>

        {/* Remember / Forgot */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <label style={{ display: "flex", gap: 7, alignItems: "center", cursor: "pointer", fontSize: 12, color: T.muted }}>
            <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} style={{ accentColor: T.accent }} /> Remember me
          </label>
          <span onClick={() => go("forgot")} style={{ fontSize: 12, color: T.accent, cursor: "pointer", fontWeight: 700 }}>Forgot password?</span>
        </div>

        <Btn fullWidth onClick={submit} disabled={loading} style={{ marginBottom: 14 }}>
          {loading ? <><Spinner /> Signing in…</> : "Sign In →"}
        </Btn>

        <p style={{ textAlign: "center", fontSize: 13, color: T.muted }}>
          No account? <span onClick={() => go("register")} style={{ color: T.accent, cursor: "pointer", fontWeight: 700 }}>Create one free</span>
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: 5, marginTop: 18, padding: "7px 12px", borderRadius: 20, background: `${T.emerald}0a`, border: `1px solid ${T.emerald}22` }}>
          <span style={{ fontSize: 11 }}>🔒</span>
          <span style={{ fontSize: 11, color: T.muted, fontFamily: "'JetBrains Mono',monospace" }}>256-bit SSL · SOC 2 · GDPR</span>
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

  const finish = () => {
    const e = {};
    if (!dName.trim() || dName.trim().split(" ").length < 2) e.name = "First & last name required";
    if (!validateEmail(dEmail)) e.email = "Invalid email";
    if (getStrength(dPass).score < 3) e.pass = "Password too weak";
    if (dPass !== dConfirm) e.confirm = "Passwords don't match";
    if (Object.keys(e).length) { setErrors3(e); return; }
    setErrors3({}); setFinalDone(true);
    setTimeout(() => onLogin({ name: dName, email: dEmail }), 1800);
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

function Sparkline({ data, color, width=80, height=32 }) {
  const max=Math.max(...data),min=Math.min(...data);
  const pts=data.map((v,i)=>{
    const x=(i/(data.length-1))*width;
    const y=height-((v-min)/(max-min||1))*(height-4)-2;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width={width} height={height} style={{display:"block"}}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity=".9"/>
    </svg>
  );
}

function DonutChart({ segments, size=120, stroke=14, label, sublabel }) {
  const total=segments.reduce((s,x)=>s+x.v,0);
  const r=(size-stroke)/2, c=size/2, circ=2*Math.PI*r;
  let offset=0;
  return (
    <svg width={size} height={size} style={{display:"block"}}>
      <circle cx={c} cy={c} r={r} fill="none" stroke="rgba(255,255,255,.06)" strokeWidth={stroke}/>
      {segments.map((seg,i)=>{
        const dash=(seg.v/total)*circ, gap=circ-dash;
        const el=(
          <circle key={i} cx={c} cy={c} r={r} fill="none" stroke={seg.color} strokeWidth={stroke}
            strokeDasharray={`${dash} ${gap}`} strokeLinecap="butt"
            transform={`rotate(${(offset/total)*360-90} ${c} ${c})`}
            style={{transition:"stroke-dasharray 1.2s ease"}}/>
        );
        offset+=seg.v; return el;
      })}
      {label && <text x={c} y={c-6} textAnchor="middle" fill="#f0f2f8" fontSize="15" fontWeight="800" fontFamily="'Syne',sans-serif">{label}</text>}
      {sublabel && <text x={c} y={c+12} textAnchor="middle" fill="#6b7a99" fontSize="10" fontFamily="'JetBrains Mono',monospace">{sublabel}</text>}
    </svg>
  );
}

function BarChartSVG({ data, height=100 }) {
  const max=Math.max(...data.map(d=>d.v),1);
  const W=260, barW=Math.floor((W-data.length*6)/data.length);
  return (
    <svg width="100%" height={height+24} viewBox={`0 0 ${W} ${height+24}`} preserveAspectRatio="none">
      {data.map((d,i)=>{
        const bh=Math.round((d.v/max)*(height-8));
        const x=i*(barW+6), y=height-bh;
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={bh} rx="3" fill={d.c} opacity=".85"/>
            <text x={x+barW/2} y={height+14} textAnchor="middle" fill="#6b7a99" fontSize="9" fontFamily="'JetBrains Mono',monospace">{d.l}</text>
          </g>
        );
      })}
    </svg>
  );
}

function LineChartSVG({ datasets, height=100, labels }) {
  const W=320, allVals=datasets.flatMap(d=>d.data);
  const max=Math.max(...allVals,1), min=Math.min(...allVals,0);
  const pts=(data)=>data.map((v,i)=>{
    const x=(i/(data.length-1))*(W-20)+10;
    const y=height-((v-min)/(max-min||1))*(height-16)-8;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  return (
    <svg width="100%" height={height+20} viewBox={`0 0 ${W} ${height+20}`} preserveAspectRatio="none">
      {[0,0.25,0.5,0.75,1].map((t,i)=>(
        <line key={i} x1={10} y1={(height-((t*(max-min)+min-min)/(max-min||1))*(height-16)-8).toFixed(0)}
          x2={W-10} y2={(height-((t*(max-min)+min-min)/(max-min||1))*(height-16)-8).toFixed(0)}
          stroke="rgba(255,255,255,.05)" strokeWidth="1"/>
      ))}
      {datasets.map((ds,di)=>{
        const p=pts(ds.data).join(" ");
        const areaBottom=`${(W-20+10).toFixed(1)},${height} 10,${height}`;
        return (
          <g key={di}>
            <polyline points={p} fill="none" stroke={ds.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            {ds.data.map((v,i)=>{
              const x=(i/(ds.data.length-1))*(W-20)+10;
              const y=height-((v-min)/(max-min||1))*(height-16)-8;
              return <circle key={i} cx={x.toFixed(1)} cy={y.toFixed(1)} r="3" fill={ds.color}/>;
            })}
          </g>
        );
      })}
      {labels && labels.map((l,i)=>{
        const x=(i/(labels.length-1))*(W-20)+10;
        return <text key={i} x={x.toFixed(0)} y={height+16} textAnchor="middle" fill="#6b7a99" fontSize="9" fontFamily="'JetBrains Mono',monospace">{l}</text>;
      })}
    </svg>
  );
}

function RadarChartSVG({ data, size=130 }) {
  const cx=size/2, cy=size/2, r=size/2-18, n=data.length;
  const angle=(i)=>(i/n)*2*Math.PI - Math.PI/2;
  const gridLevels=[0.25,0.5,0.75,1];
  const pts=data.map((d,i)=>{
    const a=angle(i), ratio=d.v/100;
    return { x:cx+r*ratio*Math.cos(a), y:cy+r*ratio*Math.sin(a) };
  });
  const polyPts=pts.map(p=>`${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  return (
    <svg width={size} height={size}>
      {gridLevels.map(lv=>(
        <polygon key={lv} points={data.map((_,i)=>{
          const a=angle(i);
          return `${(cx+r*lv*Math.cos(a)).toFixed(1)},${(cy+r*lv*Math.sin(a)).toFixed(1)}`;
        }).join(" ")} fill="none" stroke="rgba(255,255,255,.06)" strokeWidth="1"/>
      ))}
      {data.map((_,i)=>(
        <line key={i} x1={cx} y1={cy} x2={(cx+r*Math.cos(angle(i))).toFixed(1)} y2={(cy+r*Math.sin(angle(i))).toFixed(1)} stroke="rgba(255,255,255,.08)" strokeWidth="1"/>
      ))}
      <polygon points={polyPts} fill="rgba(79,142,247,.2)" stroke="#4f8ef7" strokeWidth="2"/>
      {pts.map((p,i)=>(
        <g key={i}>
          <circle cx={p.x.toFixed(1)} cy={p.y.toFixed(1)} r="3.5" fill="#4f8ef7"/>
          <text x={(cx+( r+12)*Math.cos(angle(i))).toFixed(0)} y={(cy+(r+12)*Math.sin(angle(i))+4).toFixed(0)}
            textAnchor="middle" fill="#9aa5bc" fontSize="8" fontFamily="'JetBrains Mono',monospace">{data[i].l}</text>
        </g>
      ))}
    </svg>
  );
}

function ScatterSVG({ data, W=260, H=120 }) {
  const xs=data.map(d=>d.x), ys=data.map(d=>d.y);
  const xMin=Math.min(...xs),xMax=Math.max(...xs);
  const yMin=Math.min(...ys),yMax=Math.max(...ys);
  const sx=(v)=>((v-xMin)/(xMax-xMin||1))*(W-28)+14;
  const sy=(v)=>H-((v-yMin)/(yMax-yMin||1))*(H-20)-10;
  return (
    <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
      <line x1={14} y1={H-10} x2={W-14} y2={H-10} stroke="rgba(255,255,255,.08)" strokeWidth="1"/>
      <line x1={14} y1={10} x2={14} y2={H-10} stroke="rgba(255,255,255,.08)" strokeWidth="1"/>
      {data.map((d,i)=>(
        <circle key={i} cx={sx(d.x).toFixed(1)} cy={sy(d.y).toFixed(1)} r="5" fill={d.c||"#4f8ef7"} opacity=".8"/>
      ))}
    </svg>
  );
}

function AreaChartSVG({ data, color, height=80 }) {
  const W=280, max=Math.max(...data,1);
  const pts=data.map((v,i)=>{
    const x=(i/(data.length-1))*(W-8)+4;
    const y=height-((v/max)*(height-12))-4;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const areaPath=`M 4,${height} ` + pts.map((p,i)=>(i===0?`L ${p}`:p)).join(" L ") + ` L ${W-4},${height} Z`;
  return (
    <svg width="100%" height={height} viewBox={`0 0 ${W} ${height}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id={`ag${color.replace("#","")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.4"/>
          <stop offset="100%" stopColor={color} stopOpacity="0.02"/>
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#ag${color.replace("#","")})`}/>
      <polyline points={pts.join(" ")} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

// ── Nav item
function NavItem({ icon, label, active, onClick, badge }) {
  return (
    <div onClick={onClick} style={{
      display:"flex",alignItems:"center",gap:10,padding:"10px 14px",borderRadius:11,cursor:"pointer",
      background: active?"linear-gradient(135deg,rgba(79,142,247,.18),rgba(124,58,237,.12))":"transparent",
      borderLeft: active?"2px solid #4f8ef7":"2px solid transparent",
      color: active?"#f0f2f8":"#6b7a99",transition:"all .2s",marginBottom:2,
    }}
    onMouseEnter={e=>{ if(!active){e.currentTarget.style.background="rgba(255,255,255,.04)";e.currentTarget.style.color="#f0f2f8";}}}
    onMouseLeave={e=>{ if(!active){e.currentTarget.style.background="transparent";e.currentTarget.style.color="#6b7a99";}}}>
      <span style={{fontSize:16,width:20,textAlign:"center"}}>{icon}</span>
      <span style={{fontSize:13,fontWeight:active?700:500,flex:1}}>{label}</span>
      {badge && <div style={{background:"#f43f5e",color:"#fff",fontSize:9,fontWeight:700,padding:"2px 6px",borderRadius:99}}>{badge}</div>}
    </div>
  );
}

function ActivityItem({ icon, title, sub, time, color }) {
  return (
    <div style={{display:"flex",gap:12,alignItems:"flex-start",padding:"10px 0",borderBottom:"1px solid rgba(255,255,255,.05)"}}>
      <div style={{width:32,height:32,borderRadius:9,background:`${color}22`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,flexShrink:0}}>{icon}</div>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontSize:13,fontWeight:600,color:"#f0f2f8",marginBottom:2}}>{title}</div>
        <div style={{fontSize:11,color:"#6b7a99",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{sub}</div>
      </div>
      <div style={{fontSize:10,color:"#6b7a99",fontFamily:"'JetBrains Mono',monospace",flexShrink:0,marginTop:2}}>{time}</div>
    </div>
  );
}

// ── Section wrapper
function Section({ title, sub, action, children, style:sx={} }) {
  return (
    <div style={{background:"#16181f",border:"1px solid rgba(255,255,255,.07)",borderRadius:16,padding:"20px",...sx}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
        <div>
          <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:15,color:"#f0f2f8"}}>{title}</div>
          {sub && <div style={{fontSize:11,color:"#6b7a99",marginTop:2}}>{sub}</div>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

function Pill({ label, color }) {
  return <span style={{fontSize:10,fontWeight:700,padding:"3px 9px",borderRadius:99,background:`${color}22`,color,fontFamily:"'JetBrains Mono',monospace",letterSpacing:".04em"}}>{label}</span>;
}

/* ══════════════════════════════════════════════════════════
   DASHBOARD MAIN
══════════════════════════════════════════════════════════ */

/* ── Notification Bell with Seminars dropdown ── */
function NotificationBell({ onClick, count }) {
  return (
    <div onClick={onClick} style={{width:40,height:40,borderRadius:11,background:"#16181f",border:"1px solid rgba(255,255,255,.08)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",position:"relative",transition:"border-color .2s"}}
      onMouseEnter={e=>e.currentTarget.style.borderColor="#4f8ef7"}
      onMouseLeave={e=>e.currentTarget.style.borderColor="rgba(255,255,255,.08)"}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9aa5bc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
      </svg>
      {count>0 && <div style={{position:"absolute",top:6,right:6,width:8,height:8,borderRadius:"50%",background:"#f43f5e",border:"2px solid #0f1117"}}/>}
    </div>
  );
}

function NotificationPanel({ onClose, onNav }) {
  const today = new Date();
  const fmt = (daysAhead) => {
    const d = new Date(today); d.setDate(d.getDate()+daysAhead);
    return d.toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"});
  };
  const seminars = [
    {icon:"🧠",title:"AI & Machine Learning Summit",time:"10:00 AM – 12:00 PM",date:fmt(1),tag:"Webinar",color:"#7c3aed",seats:42},
    {icon:"⚛️",title:"React 19 Deep Dive Workshop",time:"2:00 PM – 4:00 PM",date:fmt(2),tag:"Workshop",color:"#4f8ef7",seats:18},
    {icon:"🔐",title:"Ethical Hacking Masterclass",time:"11:00 AM – 1:00 PM",date:fmt(3),tag:"Live",color:"#f43f5e",seats:67},
    {icon:"☁️",title:"Cloud Native Architecture Talk",time:"3:30 PM – 5:00 PM",date:fmt(5),tag:"Webinar",color:"#10b981",seats:120},
    {icon:"📊",title:"Data Visualisation with Python",time:"9:00 AM – 11:00 AM",date:fmt(7),tag:"Workshop",color:"#f59e0b",seats:55},
  ];
  return (
    <div style={{position:"fixed",inset:0,zIndex:9998}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{position:"fixed",top:72,right:32,width:380,background:"#16181f",border:"1px solid rgba(255,255,255,.1)",borderRadius:18,boxShadow:"0 16px 48px rgba(0,0,0,.5)",overflow:"hidden",animation:"popIn .25s ease",zIndex:9999}}>
        <div style={{padding:"16px 20px",borderBottom:"1px solid rgba(255,255,255,.06)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:15}}>🔔 Upcoming Seminars</div>
            <div style={{fontSize:11,color:"#6b7a99",marginTop:2}}>Don't miss these live sessions</div>
          </div>
          <button onClick={onClose} style={{background:"rgba(255,255,255,.06)",border:"none",color:"#9aa5bc",cursor:"pointer",width:28,height:28,borderRadius:7,fontSize:13}}>✕</button>
        </div>
        <div style={{maxHeight:420,overflowY:"auto",padding:"10px 12px"}}>
          {seminars.map((s,i)=>(
            <div key={i} style={{padding:"13px 12px",borderRadius:12,border:`1px solid ${s.color}22`,background:`${s.color}08`,marginBottom:8,cursor:"pointer",transition:"border-color .2s,background .2s"}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=s.color;e.currentTarget.style.background=`${s.color}15`;}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor=`${s.color}22`;e.currentTarget.style.background=`${s.color}08`;}}>
              <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>
                <div style={{width:36,height:36,borderRadius:10,background:`${s.color}22`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,flexShrink:0}}>{s.icon}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:13,fontWeight:700,marginBottom:3,lineHeight:1.3}}>{s.title}</div>
                  <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
                    <span style={{fontSize:10,color:"#9aa5bc",fontFamily:"'JetBrains Mono',monospace"}}>{s.date}</span>
                    <span style={{fontSize:9,color:"#6b7a99"}}>·</span>
                    <span style={{fontSize:10,color:"#6b7a99"}}>{s.time}</span>
                  </div>
                  <div style={{display:"flex",gap:6,marginTop:6,alignItems:"center"}}>
                    <span style={{fontSize:9,fontWeight:700,padding:"2px 7px",borderRadius:99,background:`${s.color}22`,color:s.color,fontFamily:"'JetBrains Mono',monospace"}}>{s.tag}</span>
                    <span style={{fontSize:10,color:"#6b7a99"}}>{s.seats} seats left</span>
                  </div>
                </div>
                <button style={{padding:"5px 11px",borderRadius:8,background:`linear-gradient(135deg,${s.color},${s.color}99)`,color:"#fff",border:"none",cursor:"pointer",fontSize:10,fontWeight:700,flexShrink:0}}>Register</button>
              </div>
            </div>
          ))}
        </div>
        <div style={{padding:"12px 20px",borderTop:"1px solid rgba(255,255,255,.06)"}}>
          <button onClick={()=>{onNav("schedule");onClose();}} style={{width:"100%",padding:"9px",borderRadius:10,border:"1px solid rgba(79,142,247,.3)",background:"rgba(79,142,247,.08)",color:"#4f8ef7",cursor:"pointer",fontSize:12,fontWeight:700}}>View Full Schedule →</button>
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
    {icon:"🔥",label:"7-Day Streak",color:"#f59e0b"},
    {icon:"⚡",label:"Level 12",color:"#4f8ef7"},
    {icon:"🏆",label:"Top 5%",color:"#7c3aed"},
    {icon:"🎓",label:"3 Courses Done",color:"#10b981"},
    {icon:"🧠",label:"Quiz Master",color:"#06b6d4"},
    {icon:"🚀",label:"Early Adopter",color:"#f43f5e"},
  ];
  const stats = [
    {label:"Courses Enrolled",value:"6",color:"#4f8ef7"},
    {label:"Total XP",value:"3,840",color:"#7c3aed"},
    {label:"Quizzes Done",value:"9",color:"#10b981"},
    {label:"Study Hours",value:"24.5h",color:"#f59e0b"},
  ];
  const inp = (lbl,val,set) => (
    <div style={{marginBottom:14}}>
      <div style={{fontSize:11,fontWeight:700,color:"#6b7a99",letterSpacing:".06em",textTransform:"uppercase",fontFamily:"'JetBrains Mono',monospace",marginBottom:6}}>{lbl}</div>
      {editMode
        ? <input value={val} onChange={e=>set(e.target.value)} style={{width:"100%",padding:"10px 13px",borderRadius:10,border:"1.5px solid rgba(79,142,247,.4)",background:"#1e2130",color:"#f0f2f8",fontSize:14,outline:"none",fontFamily:"'DM Sans',sans-serif"}}/>
        : <div style={{fontSize:14,color:"#f0f2f8",padding:"10px 0"}}>{val}</div>
      }
    </div>
  );
  return (
    <div style={{display:"grid",gridTemplateColumns:"280px 1fr",gap:20}}>
      {/* Left card */}
      <div style={{display:"flex",flexDirection:"column",gap:16}}>
        <div style={{background:"#16181f",border:"1px solid rgba(255,255,255,.07)",borderRadius:16,padding:"28px 20px",textAlign:"center"}}>
          <div style={{width:80,height:80,borderRadius:"50%",background:"linear-gradient(135deg,#4f8ef7,#7c3aed)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:32,fontWeight:800,color:"#fff",margin:"0 auto 14px",fontFamily:"'Syne',sans-serif"}}>
            {user.name.split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2)}
          </div>
          <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:18,marginBottom:4}}>{name}</div>
          <div style={{fontSize:12,color:"#10b981",fontWeight:600,marginBottom:8}}>● Pro Learner</div>
          <div style={{fontSize:12,color:"#6b7a99",marginBottom:16}}>{user.email}</div>
          <button onClick={()=>setEditMode(!editMode)} style={{width:"100%",padding:"9px",borderRadius:10,background:editMode?"linear-gradient(135deg,#10b981,#16a34a)":"linear-gradient(135deg,#4f8ef7,#7c3aed)",color:"#fff",border:"none",cursor:"pointer",fontSize:13,fontWeight:700}}>
            {editMode?"✓ Save Profile":"✏ Edit Profile"}
          </button>
        </div>
        <div style={{background:"#16181f",border:"1px solid rgba(255,255,255,.07)",borderRadius:16,padding:"18px"}}>
          <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:14,marginBottom:14}}>🏅 Badges</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9}}>
            {badges.map((b,i)=>(
              <div key={i} style={{padding:"10px",borderRadius:10,background:`${b.color}12`,border:`1px solid ${b.color}30`,textAlign:"center"}}>
                <div style={{fontSize:20,marginBottom:4}}>{b.icon}</div>
                <div style={{fontSize:10,color:b.color,fontWeight:700,fontFamily:"'JetBrains Mono',monospace",lineHeight:1.3}}>{b.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Right */}
      <div style={{display:"flex",flexDirection:"column",gap:16}}>
        <div style={{background:"#16181f",border:"1px solid rgba(255,255,255,.07)",borderRadius:16,padding:"24px"}}>
          <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:15,marginBottom:18}}>👤 Personal Info</div>
          {inp("Display Name",name,setName)}
          {inp("Bio",bio,setBio)}
          {inp("Location",location,setLocation)}
          {inp("Website / GitHub",website,setWebsite)}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
          {stats.map((s,i)=>(
            <div key={i} style={{background:"#16181f",border:"1px solid rgba(255,255,255,.07)",borderRadius:14,padding:"16px",textAlign:"center"}}>
              <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:22,color:s.color,marginBottom:4}}>{s.value}</div>
              <div style={{fontSize:10,color:"#6b7a99",fontFamily:"'JetBrains Mono',monospace",textTransform:"uppercase",letterSpacing:".05em"}}>{s.label}</div>
            </div>
          ))}
        </div>
        <div style={{background:"#16181f",border:"1px solid rgba(255,255,255,.07)",borderRadius:16,padding:"20px"}}>
          <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:15,marginBottom:14}}>🔐 Account Settings</div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {[
              {label:"Change Password",icon:"🔒",color:"#4f8ef7"},
              {label:"Two-Factor Authentication",icon:"🛡",color:"#10b981"},
              {label:"Connected Accounts",icon:"🔗",color:"#7c3aed"},
              {label:"Delete Account",icon:"⚠",color:"#f43f5e"},
            ].map((item,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",borderRadius:11,border:"1px solid rgba(255,255,255,.07)",cursor:"pointer",transition:"background .2s"}}
                onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,.03)"}
                onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <span style={{fontSize:16}}>{item.icon}</span>
                <span style={{flex:1,fontSize:13,fontWeight:500}}>{item.label}</span>
                <span style={{color:item.color,fontSize:12}}>→</span>
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

function SchedulePage() {
  const today = new Date();
  const [view, setView] = useState("week"); // week | month | gantt | timetable
  const [selectedDate, setSelectedDate] = useState(new Date(today));
  const [selMonth, setSelMonth] = useState(today.getMonth());
  const [selYear, setSelYear] = useState(today.getFullYear());
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEvent, setNewEvent] = useState({title:"",type:"course",time:"09:00",duration:45,note:""});
  const [addedEvents, setAddedEvents] = useState([]);
  const [ganttScroll, setGanttScroll] = useState(0);
  const [ganttFilter, setGanttFilter] = useState("all");
  const [tooltip, setTooltip] = useState(null);
  const [expandedSections, setExpandedSections] = useState({Courses:true,Quizzes:true,Seminars:true,Deadlines:true});
  const [searchQ, setSearchQ] = useState("");
  const [focusMode, setFocusMode] = useState(false);
  const [timerSec, setTimerSec] = useState(25*60);
  const [timerRunning, setTimerRunning] = useState(false);
  const timerRef = useRef(null);

  // ── Pomodoro timer
  useEffect(()=>{
    if(timerRunning){
      timerRef.current = setInterval(()=>setTimerSec(s=>{ if(s<=1){clearInterval(timerRef.current);setTimerRunning(false);return 0;} return s-1; }),1000);
    } else { clearInterval(timerRef.current); }
    return ()=>clearInterval(timerRef.current);
  },[timerRunning]);

  const fmt2 = n=>String(n).padStart(2,"0");
  const fmtTimer = s=>`${fmt2(Math.floor(s/60))}:${fmt2(s%60)}`;
  const timerPct = timerSec/(25*60)*100;

  // ── Event factory
  const mk = (dOff,h,m,title,type,color,dur,note="")=>{
    const d=new Date(today); d.setDate(today.getDate()+dOff); d.setHours(h,m,0,0);
    return {id:`ev${dOff}${h}${m}`,date:d,title,type,color,duration:dur,note};
  };

  // ── Rich real-time event set spread across -14d to +30d from today
  const BASE_EVENTS = [
    // ── Past (completed) ──────────────────────────────────
    mk(-14,9,0,"HTML & CSS – Box Model","course","#10b981",45,"Completed ✓"),
    mk(-14,11,0,"Quiz: HTML Basics","quiz","#7c3aed",20,"Score: 85%"),
    mk(-13,10,0,"JavaScript – ES6 Features","course","#4f8ef7",60,"Completed ✓"),
    mk(-13,14,0,"UX Design – Wireframing","course","#10b981",50,"Completed ✓"),
    mk(-12,9,30,"Cybersecurity – Intro to Networks","course","#f43f5e",60,"Completed ✓"),
    mk(-12,13,0,"Quiz: JavaScript ES6","quiz","#7c3aed",20,"Score: 78%"),
    mk(-11,10,0,"React Mastery – JSX & Components","course","#4f8ef7",50,"Completed ✓"),
    mk(-11,15,0,"Python for AI – NumPy Basics","course","#7c3aed",60,"Completed ✓"),
    mk(-10,9,0,"Data Analytics – Intro to Pandas","course","#06b6d4",60,"Completed ✓"),
    mk(-10,11,0,"Cloud DevOps – Linux Fundamentals","course","#f59e0b",45,"Completed ✓"),
    mk(-10,14,0,"Group Study: JS Fundamentals","study","#4f8ef7",60,"Library session"),
    mk(-9,10,0,"React Mastery – Props & State","course","#4f8ef7",50,"Completed ✓"),
    mk(-9,14,30,"Webinar: Open Source 101","seminar","#10b981",90,"Attended"),
    mk(-8,9,0,"Python for AI – Matplotlib","course","#7c3aed",60,"Completed ✓"),
    mk(-8,11,0,"Quiz: React Components","quiz","#7c3aed",25,"Score: 72%"),
    mk(-8,15,0,"UX Design – User Research Methods","course","#10b981",55,"Completed ✓"),
    mk(-7,10,0,"Cloud DevOps – Git & GitHub","course","#f59e0b",60,"Completed ✓"),
    mk(-7,13,0,"Cybersecurity – OWASP Top 10","course","#f43f5e",60,"Completed ✓"),
    mk(-7,16,0,"Weekly Progress Review","review","#9aa5bc",15,"Week 1 done"),
    mk(-6,9,0,"React Mastery – Hooks Intro","course","#4f8ef7",45,"Completed ✓"),
    mk(-6,11,0,"Data Analytics – GroupBy & Merge","course","#06b6d4",60,"Completed ✓"),
    mk(-6,14,0,"Python for AI – Scikit-Learn","course","#7c3aed",75,"Completed ✓"),
    mk(-5,10,0,"Cloud DevOps – Docker Setup","course","#f59e0b",60,"Completed ✓"),
    mk(-5,13,0,"Cybersecurity – SQL Injection Lab","course","#f43f5e",60,"Completed ✓"),
    mk(-5,15,30,"Live Talk: DevOps at Scale","seminar","#f59e0b",60,"Attended"),
    mk(-4,9,0,"UX Design – Figma Prototyping","course","#10b981",60,"Completed ✓"),
    mk(-4,11,0,"Quiz: Python ML Basics","quiz","#7c3aed",25,"Score: 68%"),
    mk(-4,14,0,"React Mastery – useEffect Deep Dive","course","#4f8ef7",50,"Completed ✓"),
    mk(-3,9,0,"Quiz: HTML/CSS","quiz","#7c3aed",20,"Score: 80%"),
    mk(-3,10,0,"Data Analytics – Seaborn Viz","course","#06b6d4",60,"Completed ✓"),
    mk(-3,14,0,"Python for AI – Neural Net Intro","course","#7c3aed",90,"Completed ✓"),
    mk(-3,16,30,"Group Study: Data Science","study","#06b6d4",60,"Online call"),
    mk(-2,9,0,"Cloud DevOps – Docker Compose","course","#f59e0b",75,"Completed ✓"),
    mk(-2,11,0,"Cybersecurity – XSS & CSRF","course","#f43f5e",60,"Completed ✓"),
    mk(-2,14,0,"Cybersecurity – Intro","course","#f43f5e",60,"Completed ✓"),
    mk(-1,8,30,"React Mastery – Custom Hooks Basics","course","#4f8ef7",50,"Completed ✓"),
    mk(-1,10,0,"React Mastery – Hooks Intro","course","#4f8ef7",45,"Completed ✓"),
    mk(-1,13,0,"UX Design – Accessibility Principles","course","#10b981",45,"Completed ✓"),
    mk(-1,15,0,"Quiz: Cloud Fundamentals","quiz","#7c3aed",20,"Score: 74%"),
    mk(-1,17,0,"Weekly Progress Review","review","#9aa5bc",15,"Week 2 summary"),

    // ── TODAY ──────────────────────────────────────────────
    mk(0,8,0,"Morning Stand-up & Planning","review","#9aa5bc",15,"Plan day's learning goals"),
    mk(0,9,0,"React Mastery – Custom Hooks","course","#4f8ef7",50,"Complete exercises 4–7"),
    mk(0,10,0,"React Mastery – useMemo & useCallback","course","#4f8ef7",45,"Performance optimisation"),
    mk(0,11,0,"Quiz: JavaScript Closures","quiz","#7c3aed",20,"Review MDN docs beforehand"),
    mk(0,11,30,"Data Analytics – Pandas Advanced","course","#06b6d4",60,"GroupBy, pivot tables"),
    mk(0,13,30,"Lunch Break Study – JS Patterns","study","#4f8ef7",30,"Design patterns reading"),
    mk(0,14,30,"Webinar: AI Trends 2025","seminar","#10b981",90,"Link sent to email"),
    mk(0,16,30,"Python for AI – Backpropagation","course","#7c3aed",60,"Watch 3Blue1Brown first"),
    mk(0,18,0,"Cybersecurity – Pen Testing Lab","course","#f43f5e",45,"Lab environment needed"),

    // ── DAY +1 ──────────────────────────────────────────────
    mk(1,8,30,"Python for AI – CNN Architecture","course","#7c3aed",60,"Neural nets chapter"),
    mk(1,9,30,"Python for AI – Module 5","course","#7c3aed",60,"Neural nets chapter"),
    mk(1,11,0,"Cybersecurity – Pen Testing Advanced","course","#f43f5e",50,"Metasploit intro"),
    mk(1,12,0,"Cloud DevOps – Docker Networking","course","#f59e0b",60,"Bridge & overlay networks"),
    mk(1,14,0,"React 19 Workshop","seminar","#4f8ef7",120,"Workshop by Vercel team"),
    mk(1,16,30,"UX Design – Interaction Design","course","#10b981",50,"Micro-interactions"),
    mk(1,18,0,"Quiz: Python CNN","quiz","#7c3aed",20,""),

    // ── DAY +2 ──────────────────────────────────────────────
    mk(2,9,0,"UX Design – Portfolio Review","course","#10b981",50,"Bring Figma link"),
    mk(2,10,0,"Data Analytics – Feature Engineering","course","#06b6d4",60,"Kaggle dataset used"),
    mk(2,11,30,"React Mastery – Context API","course","#4f8ef7",45,""),
    mk(2,12,0,"Assignment Due: React App","deadline","#f43f5e",0,"Submit via GitHub"),
    mk(2,13,30,"Group Study – Cloud DevOps","study","#f59e0b",60,"Docker + CI/CD discussion"),
    mk(2,15,30,"Python for AI – LSTM Networks","course","#7c3aed",75,"Time series forecasting"),
    mk(2,17,0,"Cybersecurity – Network Scanning","course","#f43f5e",45,"Nmap practicals"),

    // ── DAY +3 ──────────────────────────────────────────────
    mk(3,8,0,"Morning Review: Yesterday's Notes","review","#9aa5bc",20,""),
    mk(3,9,0,"Cloud DevOps – CI/CD Pipelines","course","#f59e0b",75,"GitHub Actions workflow"),
    mk(3,10,30,"Data Analytics – Matplotlib Charts","course","#06b6d4",50,""),
    mk(3,12,0,"Quiz: Docker Fundamentals","quiz","#7c3aed",25,""),
    mk(3,13,0,"Quiz: Python Basics","quiz","#7c3aed",20,""),
    mk(3,14,0,"React Mastery – State Management","course","#4f8ef7",60,"Redux intro"),
    mk(3,15,30,"UX Design – Prototyping Sprint","course","#10b981",60,"Figma sprint"),
    mk(3,16,0,"Cloud DevOps – Docker Lab","course","#f59e0b",75,"Docker Desktop required"),
    mk(3,18,0,"Group Study: Cybersecurity CTF","study","#f43f5e",90,"Online CTF event"),

    // ── DAY +4 ──────────────────────────────────────────────
    mk(4,9,0,"React Mastery – Redux Toolkit","course","#4f8ef7",60,""),
    mk(4,10,30,"Python for AI – Transfer Learning","course","#7c3aed",75,"Pre-trained models"),
    mk(4,11,0,"Cybersecurity – OWASP Top 10","course","#f43f5e",60,""),
    mk(4,13,0,"Data Analytics – ML Pipeline","course","#06b6d4",75,"End-to-end pipeline"),
    mk(4,14,0,"AI Summit Webinar","seminar","#7c3aed",120,"Register link emailed"),
    mk(4,16,30,"Cloud DevOps – Kubernetes Intro","course","#f59e0b",60,"minikube setup"),
    mk(4,18,0,"Quiz: React Redux","quiz","#7c3aed",20,""),

    // ── DAY +5 (Saturday) ────────────────────────────────────
    mk(5,10,0,"Weekly Progress Review","review","#9aa5bc",15,"Self-assessment"),
    mk(5,11,0,"Python for AI – CNN Models","course","#7c3aed",60,""),
    mk(5,13,0,"UX Design – Capstone Project Work","course","#10b981",90,"Final project"),
    mk(5,14,0,"Data Analytics – Capstone EDA","course","#06b6d4",60,"Exploratory analysis"),
    mk(5,16,0,"Group Study: React Advanced","study","#4f8ef7",60,"hooks deep dive"),

    // ── DAY +6 (Sunday) ──────────────────────────────────────
    mk(6,11,0,"Cloud DevOps – Kubernetes Workloads","course","#f59e0b",75,""),
    mk(6,13,30,"Python for AI – GANs Introduction","course","#7c3aed",60,""),
    mk(6,15,0,"Cybersecurity – Capture The Flag Practice","study","#f43f5e",90,""),
    mk(6,17,0,"Weekly Recap & Next Week Planning","review","#9aa5bc",20,""),

    // ── NEXT WEEK ─────────────────────────────────────────────
    mk(7,9,0,"React Mastery – Redux Saga","course","#4f8ef7",60,""),
    mk(7,10,30,"Data Analytics – Model Evaluation","course","#06b6d4",60,"Cross-validation"),
    mk(7,13,0,"Python for AI – Object Detection","course","#7c3aed",90,"YOLO architecture"),
    mk(7,14,0,"Data Science Seminar","seminar","#10b981",90,""),
    mk(7,16,0,"Cloud DevOps – Helm Charts","course","#f59e0b",60,""),
    mk(8,9,0,"UX Design – Usability Testing","course","#10b981",60,""),
    mk(8,10,0,"Assignment Due: Python ML","deadline","#f43f5e",0,"Submit Jupyter notebook"),
    mk(8,11,30,"Cybersecurity – Web App Pentesting","course","#f43f5e",75,"Burp Suite lab"),
    mk(8,14,0,"React Mastery – Server Components","course","#4f8ef7",60,"Next.js integration"),
    mk(8,16,0,"Quiz: Kubernetes Basics","quiz","#7c3aed",25,""),
    mk(9,9,0,"Python for AI – Transformers Intro","course","#7c3aed",90,"Attention mechanisms"),
    mk(9,10,30,"Cloud DevOps – Terraform","course","#f59e0b",75,"Infrastructure as code"),
    mk(9,13,0,"Data Analytics – NLP Basics","course","#06b6d4",60,""),
    mk(9,14,30,"Group Study: DevOps CI/CD","study","#f59e0b",60,""),
    mk(10,9,0,"React Mastery – Testing with Jest","course","#4f8ef7",60,"Unit & integration tests"),
    mk(10,10,30,"Cybersecurity – Malware Analysis","course","#f43f5e",60,""),
    mk(10,13,0,"UX Design – Design System","course","#10b981",75,"Storybook setup"),
    mk(10,14,0,"Python for AI – BERT & GPT","course","#7c3aed",90,""),
    mk(10,16,0,"Webinar: Future of Web Dev 2025","seminar","#4f8ef7",90,""),
    mk(11,9,0,"Data Analytics – Time Series","course","#06b6d4",75,"ARIMA models"),
    mk(11,11,0,"Cloud DevOps – Monitoring & Logging","course","#f59e0b",60,"Prometheus + Grafana"),
    mk(11,14,0,"Assignment Due: UX Portfolio","deadline","#10b981",0,"Submit Behance link"),
    mk(11,15,0,"Quiz: NLP Fundamentals","quiz","#7c3aed",25,""),
    mk(12,9,0,"React Mastery – Deployment & CI","course","#4f8ef7",60,"Vercel + GitHub Actions"),
    mk(12,11,0,"Python for AI – Fine-Tuning LLMs","course","#7c3aed",90,"HuggingFace pipeline"),
    mk(12,13,30,"Cybersecurity – Incident Response","course","#f43f5e",60,""),
    mk(12,16,0,"Group Study: Data Science Competition","study","#06b6d4",90,"Kaggle team entry"),
    mk(13,9,0,"Cloud DevOps – AWS ECS & EKS","course","#f59e0b",75,""),
    mk(13,10,30,"UX Design – A/B Testing Methods","course","#10b981",60,""),
    mk(13,14,0,"Weekly Progress Review","review","#9aa5bc",20,"Week 3 complete"),
    mk(14,10,0,"React Mastery – Capstone Project","course","#4f8ef7",90,"Full app build"),
    mk(14,14,0,"Python for AI – Deployment with FastAPI","course","#7c3aed",75,"REST API for ML model"),
    mk(15,9,0,"Data Analytics – Dashboard Build","course","#06b6d4",90,"Plotly Dash"),
    mk(15,11,0,"Cybersecurity – Final CTF Challenge","study","#f43f5e",120,""),
    mk(15,14,0,"Assignment Due: Cloud Project","deadline","#f59e0b",0,"Submit AWS architecture"),
    mk(16,10,0,"Cloud DevOps – Security Best Practices","course","#f59e0b",60,""),
    mk(16,13,0,"Quiz: Full Stack Review","quiz","#7c3aed",30,""),
    mk(17,9,0,"UX Design – Final Capstone Presentation","course","#10b981",90,"Demo to peers"),
    mk(17,14,0,"AI & Future Tech Conference","seminar","#7c3aed",180,"Multi-session event"),
    mk(18,9,0,"Python for AI – Production Deployment","course","#7c3aed",75,"Docker + FastAPI"),
    mk(18,11,0,"React Mastery – Final Review","course","#4f8ef7",60,""),
    mk(18,14,0,"Assignment Due: React Capstone","deadline","#4f8ef7",0,"Submit GitHub repo"),
    mk(20,9,0,"Full-Stack Integration Project","course","#4f8ef7",120,"Connect React + FastAPI"),
    mk(20,13,0,"Quiz: Full-Stack Final","quiz","#7c3aed",30,""),
    mk(21,10,0,"Career Readiness: Portfolio Review","review","#9aa5bc",60,"With mentor"),
    mk(21,14,0,"Mock Technical Interview","study","#4f8ef7",60,"Pair programming session"),
    mk(22,9,0,"Data Analytics – Presentation Prep","course","#06b6d4",60,""),
    mk(22,14,0,"Webinar: Internship Prep 2025","seminar","#10b981",90,""),
    mk(25,10,0,"Cloud DevOps – Final Project Deploy","course","#f59e0b",90,"Live deployment"),
    mk(25,14,0,"Assignment Due: All Modules","deadline","#f43f5e",0,"Final submission day"),
    mk(28,10,0,"Course Graduation Ceremony","seminar","#10b981",120,"Virtual ceremony 🎓"),
    mk(30,9,0,"Post-Course: Next Steps Planning","review","#9aa5bc",30,"Set new learning path"),
  ];

  const events = [...BASE_EVENTS, ...addedEvents];

  const typeIcon={course:"📚",quiz:"🧠",seminar:"🎤",deadline:"⚠️",study:"👥",review:"📋"};
  const typeLabel={course:"Course",quiz:"Quiz",seminar:"Seminar",deadline:"Deadline",study:"Study Group",review:"Review"};

  const isSameDay=(a,b)=>a.getDate()===b.getDate()&&a.getMonth()===b.getMonth()&&a.getFullYear()===b.getFullYear();

  const eventsForDay=(d)=>events.filter(e=>isSameDay(e.date,d));
  const filteredEvents=(d)=>{
    let evs=eventsForDay(d);
    if(searchQ) evs=evs.filter(e=>e.title.toLowerCase().includes(searchQ.toLowerCase()));
    return evs.sort((a,b)=>a.date-b.date);
  };

  // ── Stats
  const upcoming = events.filter(e=>e.date>=today&&e.type!=="deadline").length;
  const deadlines = events.filter(e=>e.type==="deadline"&&e.date>=today).length;
  const todayCount = eventsForDay(today).length;
  const weekHours = events.filter(e=>{
    const d=new Date(today); const s=new Date(today);
    s.setDate(today.getDate()-today.getDay()); d.setDate(s.getDate()+7);
    return e.date>=s&&e.date<=d&&e.type==="course";
  }).reduce((sum,e)=>sum+(e.duration||0),0);

  // ── Week planner data
  const weekStart = new Date(selectedDate);
  weekStart.setDate(selectedDate.getDate()-selectedDate.getDay());
  const weekDays = Array.from({length:7},(_,i)=>{ const d=new Date(weekStart); d.setDate(weekStart.getDate()+i); return d; });
  const HOURS = [7,8,9,10,11,12,13,14,15,16,17,18,19,20];
  const HOUR_H = 60;

  // ── Month calendar
  const daysInMonth = new Date(selYear,selMonth+1,0).getDate();
  const firstDOW = new Date(selYear,selMonth,1).getDay();
  const monthName = new Date(selYear,selMonth).toLocaleString("default",{month:"long"});

  // ── Gantt data
  const GANTT_DAYS=45, G_OFFSET=-7, DAY_W=48, LABEL_W=170, VIS=16;
  const gDays=Array.from({length:GANTT_DAYS},(_,i)=>{ const d=new Date(today); d.setDate(today.getDate()+G_OFFSET+i); return d; });
  const maxGScroll=Math.max(0,GANTT_DAYS-VIS);
  const gVis=Math.min(Math.max(0,ganttScroll),maxGScroll);

  const statusStyle={
    "completed":{bg:"rgba(16,185,129,.22)",border:"#10b981",text:"#10b981"},
    "in-progress":{bg:"rgba(79,142,247,.22)",border:"#4f8ef7",text:"#4f8ef7"},
    "upcoming":{bg:"rgba(255,255,255,.07)",border:"rgba(255,255,255,.18)",text:"#9aa5bc"},
    "live":{bg:"rgba(244,63,94,.2)",border:"#f43f5e",text:"#f43f5e"},
    "deadline":{bg:"rgba(245,158,11,.2)",border:"#f59e0b",text:"#f59e0b"},
  };
  const statusLabel={"completed":"Completed","in-progress":"In Progress","upcoming":"Upcoming","live":"Live Now","deadline":"Deadline"};

  const ganttRows=[
    { category:"Courses",icon:"📚",color:"#4f8ef7", items:[
      {label:"⚛️ React Mastery",      color:"#4f8ef7",sub:"72% done",blocks:[
        {s:-7,e:-3,title:"Hooks Intro",status:"completed"},
        {s:-2,e:3,title:"Custom Hooks",status:"in-progress"},
        {s:5,e:12,title:"Context API & Redux",status:"upcoming"},
        {s:14,e:18,title:"Testing & Deploy",status:"upcoming"},
        {s:20,e:25,title:"Capstone Project",status:"upcoming"},
      ]},
      {label:"🐍 Python for AI",      color:"#7c3aed",sub:"45% done",blocks:[
        {s:-10,e:-5,title:"NumPy & Pandas",status:"completed"},
        {s:-4,e:3,title:"Neural Nets",status:"in-progress"},
        {s:6,e:12,title:"CNN & Transfer Learning",status:"upcoming"},
        {s:13,e:18,title:"BERT & Transformers",status:"upcoming"},
        {s:19,e:25,title:"LLM Fine-Tuning",status:"upcoming"},
      ]},
      {label:"🎨 UX Design Pro",      color:"#10b981",sub:"100% ✓",blocks:[
        {s:-14,e:-8,title:"Research & Wireframes",status:"completed"},
        {s:-7,e:-3,title:"Prototyping",status:"completed"},
        {s:-2,e:0,title:"Capstone",status:"completed"},
      ]},
      {label:"☁️ Cloud DevOps",       color:"#f59e0b",sub:"18% done",blocks:[
        {s:-7,e:-3,title:"Git & Linux",status:"completed"},
        {s:1,e:6,title:"Docker",status:"in-progress"},
        {s:7,e:13,title:"Kubernetes",status:"upcoming"},
        {s:14,e:20,title:"Terraform & AWS",status:"upcoming"},
        {s:22,e:27,title:"Final Deployment",status:"upcoming"},
      ]},
      {label:"🔐 Cybersecurity 101",  color:"#f43f5e",sub:"60% done",blocks:[
        {s:-12,e:-7,title:"Network Basics",status:"completed"},
        {s:-6,e:-1,title:"OWASP & XSS",status:"completed"},
        {s:0,e:5,title:"Pen Testing",status:"in-progress"},
        {s:8,e:14,title:"Incident Response",status:"upcoming"},
        {s:16,e:20,title:"CTF Challenge",status:"upcoming"},
      ]},
      {label:"📊 Data Analytics",     color:"#06b6d4",sub:"33% done",blocks:[
        {s:-10,e:-5,title:"Intro to Pandas",status:"completed"},
        {s:-4,e:3,title:"Advanced Pandas",status:"in-progress"},
        {s:5,e:11,title:"ML Pipeline",status:"upcoming"},
        {s:12,e:18,title:"NLP & Time Series",status:"upcoming"},
        {s:20,e:25,title:"Dashboard Capstone",status:"upcoming"},
      ]},
      {label:"🌐 Full-Stack Dev",      color:"#f43f5e",sub:"0% – starts wk3",blocks:[
        {s:18,e:25,title:"React + FastAPI Integration",status:"upcoming"},
        {s:26,e:32,title:"Full Project Build",status:"upcoming"},
      ]},
    ]},
    { category:"Quizzes",icon:"🧠",color:"#7c3aed", items:[
      {label:"HTML & CSS",       color:"#10b981",sub:"85% ✓",  blocks:[{s:-14,e:-13,title:"Quiz #1 ✓",status:"completed"}]},
      {label:"JavaScript ES6",  color:"#7c3aed",sub:"78% ✓",  blocks:[{s:-12,e:-11,title:"Quiz #2 ✓",status:"completed"}]},
      {label:"React Components",color:"#4f8ef7",sub:"72% ✓",  blocks:[{s:-8,e:-7,title:"Quiz #3 ✓",status:"completed"}]},
      {label:"Python ML Basics",color:"#7c3aed",sub:"68% ✓",  blocks:[{s:-4,e:-3,title:"Quiz #4 ✓",status:"completed"}]},
      {label:"Cloud Basics",    color:"#f59e0b",sub:"74% ✓",  blocks:[{s:-1,e:-1,title:"Quiz #5 ✓",status:"completed"}]},
      {label:"JS Closures",     color:"#7c3aed",sub:"Today",  blocks:[{s:0,e:0,title:"Quiz #6 – Due",status:"live"}]},
      {label:"Docker Basics",   color:"#f59e0b",sub:"In 3d",  blocks:[{s:3,e:3,title:"Quiz #7",status:"upcoming"}]},
      {label:"Python CNN",      color:"#7c3aed",sub:"In 7d",  blocks:[{s:7,e:7,title:"Quiz #8",status:"upcoming"}]},
      {label:"React Redux",     color:"#4f8ef7",sub:"In 10d", blocks:[{s:10,e:10,title:"Quiz #9",status:"upcoming"}]},
      {label:"Kubernetes",      color:"#f59e0b",sub:"In 14d", blocks:[{s:14,e:14,title:"Quiz #10",status:"upcoming"}]},
      {label:"NLP Fundamentals",color:"#06b6d4",sub:"In 18d", blocks:[{s:18,e:18,title:"Quiz #11",status:"upcoming"}]},
      {label:"Full-Stack Final", color:"#4f8ef7",sub:"In 22d", blocks:[{s:22,e:22,title:"Quiz #12",status:"upcoming"}]},
    ]},
    { category:"Seminars",icon:"🎤",color:"#10b981", items:[
      {label:"Open Source 101",        color:"#10b981",sub:"Done",blocks:[{s:-9,e:-9,title:"Attended ✓",status:"completed"}]},
      {label:"DevOps at Scale",        color:"#f59e0b",sub:"Done",blocks:[{s:-5,e:-5,title:"Attended ✓",status:"completed"}]},
      {label:"AI Trends 2025",         color:"#10b981",sub:"Today",blocks:[{s:0,e:0,title:"LIVE NOW",status:"live"}]},
      {label:"React 19 Workshop",      color:"#4f8ef7",sub:"In 2d",blocks:[{s:2,e:2,title:"Workshop",status:"upcoming"}]},
      {label:"Cloud Architecture Talk",color:"#06b6d4",sub:"In 5d",blocks:[{s:5,e:5,title:"Live Talk",status:"upcoming"}]},
      {label:"AI Summit Keynote",      color:"#7c3aed",sub:"In 7d",blocks:[{s:7,e:7,title:"Keynote",status:"upcoming"}]},
      {label:"Future of Web Dev 2025", color:"#4f8ef7",sub:"In 10d",blocks:[{s:10,e:10,title:"Webinar",status:"upcoming"}]},
      {label:"AI & Future Tech Conf",  color:"#7c3aed",sub:"In 17d",blocks:[{s:17,e:17,title:"Full Day",status:"upcoming"}]},
      {label:"Internship Prep 2025",   color:"#10b981",sub:"In 22d",blocks:[{s:22,e:22,title:"Career Talk",status:"upcoming"}]},
      {label:"Graduation Ceremony",    color:"#10b981",sub:"In 28d",blocks:[{s:28,e:28,title:"🎓 Virtual",status:"upcoming"}]},
    ]},
    { category:"Deadlines",icon:"⚠️",color:"#f43f5e", items:[
      {label:"React App Submission",    color:"#f43f5e",sub:"In 2d", blocks:[{s:2,e:2,title:"GitHub Submit",status:"deadline"}]},
      {label:"Python ML Notebook",      color:"#7c3aed",sub:"In 8d", blocks:[{s:8,e:8,title:"Jupyter Due",status:"deadline"}]},
      {label:"UX Portfolio",            color:"#10b981",sub:"In 11d",blocks:[{s:11,e:11,title:"Behance Link",status:"deadline"}]},
      {label:"Cloud Project",           color:"#f59e0b",sub:"In 15d",blocks:[{s:15,e:15,title:"AWS Diagram",status:"deadline"}]},
      {label:"React Capstone",          color:"#4f8ef7",sub:"In 18d",blocks:[{s:18,e:18,title:"GitHub Repo",status:"deadline"}]},
      {label:"All Modules Final",       color:"#f43f5e",sub:"In 25d",blocks:[{s:25,e:25,title:"FINAL Submit",status:"deadline"}]},
    ]},
  ];

  const filteredGantt=ganttRows.map(r=>({...r,items:r.items.map(it=>({...it,blocks:it.blocks.filter(b=>ganttFilter==="all"||b.status===ganttFilter)})).filter(it=>ganttFilter==="all"||it.blocks.length>0)})).filter(r=>r.items.length>0);

  // ── Add event
  const handleAddEvent=()=>{
    if(!newEvent.title.trim()) return;
    const d=new Date(selectedDate);
    const [h,m]=newEvent.time.split(":").map(Number);
    d.setHours(h,m,0,0);
    setAddedEvents(prev=>[...prev,{id:`custom${Date.now()}`,date:d,title:newEvent.title,type:newEvent.type,color:{course:"#4f8ef7",quiz:"#7c3aed",seminar:"#10b981",deadline:"#f43f5e",study:"#f59e0b",review:"#9aa5bc"}[newEvent.type],duration:Number(newEvent.duration),note:newEvent.note}]);
    setNewEvent({title:"",type:"course",time:"09:00",duration:45,note:""});
    setShowAddModal(false);
  };

  // ─────────────── VIEWS ───────────────

  // ── Course pool — cycles by date number so each date gets a unique course
  const COURSE_POOL = [
    {label:"React Mastery",  color:"#4f8ef7", icon:"⚛️", short:"React"},
    {label:"Python for AI",  color:"#7c3aed", icon:"🐍", short:"Python"},
    {label:"UX Design",      color:"#10b981", icon:"🎨", short:"UX"},
    {label:"Data Analytics", color:"#06b6d4", icon:"📊", short:"Data"},
    {label:"Cloud DevOps",   color:"#f59e0b", icon:"☁️", short:"DevOps"},
    {label:"Cybersecurity",  color:"#f43f5e", icon:"🔐", short:"Security"},
    {label:"Full-Stack Dev", color:"#a855f7", icon:"🌐", short:"Full-Stack"},
  ];
  // Pick featured course for a given date — cycles by date so each date differs
  const getCourseForDate = (d) => COURSE_POOL[d.getDate() % COURSE_POOL.length];

  // ── WEEK VIEW
  const renderWeek=()=>(
    <div style={{background:"#16181f",border:"1px solid rgba(255,255,255,.07)",borderRadius:16,overflow:"hidden"}}>
      {/* ── DAY COLUMN HEADERS ── */}
      <div style={{display:"grid",gridTemplateColumns:`64px repeat(7,1fr)`,borderBottom:"2px solid rgba(255,255,255,.08)"}}>
        {/* Corner cell */}
        <div style={{background:"#12141b",borderRight:"1px solid rgba(255,255,255,.07)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"8px 4px",gap:3}}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#4f8ef7" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          <span style={{fontSize:8,color:"#4f8ef7",fontFamily:"'JetBrains Mono',monospace",fontWeight:700,letterSpacing:".06em"}}>TIME</span>
        </div>

        {weekDays.map((d,i)=>{
          const isT=isSameDay(d,today);
          const isSel=isSameDay(d,selectedDate);
          const course=getCourseForDate(d);
          const dayEvs=eventsForDay(d);
          const topColors=[...new Set(dayEvs.map(e=>e.color))].slice(0,5);
          return (
            <div key={i} onClick={()=>setSelectedDate(new Date(d))}
              style={{borderLeft:"1px solid rgba(255,255,255,.06)",cursor:"pointer",overflow:"hidden",
                borderBottom:isT?`3px solid ${course.color}`:`3px solid transparent`}}>

              {/* ① COURSE BADGE — top strip */}
              <div style={{
                background:isT?`linear-gradient(135deg,${course.color}50,${course.color}28)`:isSel?`${course.color}22`:`${course.color}14`,
                borderBottom:`1px solid ${course.color}38`,
                padding:"7px 5px 6px",
                display:"flex",alignItems:"center",justifyContent:"center",gap:5,
              }}>
                <span style={{fontSize:15,lineHeight:1,flexShrink:0}}>{course.icon}</span>
                <div style={{minWidth:0,textAlign:"left"}}>
                  <div style={{fontSize:9,fontWeight:800,color:course.color,fontFamily:"'Syne',sans-serif",
                    overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:58,lineHeight:1.25,letterSpacing:"-.01em"}}>{course.label}</div>
                  <div style={{fontSize:7,color:`${course.color}88`,fontFamily:"'JetBrains Mono',monospace",
                    letterSpacing:".05em",textTransform:"uppercase",lineHeight:1.3}}>Day Focus</div>
                </div>
              </div>

              {/* ② WEEKDAY LABEL */}
              <div style={{background:isT?"#12141b":"#1a1c27",padding:"5px 4px 0",textAlign:"center"}}>
                <div style={{fontSize:10,fontFamily:"'JetBrains Mono',monospace",fontWeight:700,letterSpacing:".08em",
                  color:isT?course.color:"#56637a"}}>
                  {d.toLocaleDateString("en-US",{weekday:"short"}).toUpperCase()}
                </div>

                {/* ③ DATE NUMBER */}
                <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,
                  fontSize:isT?28:22,lineHeight:1,
                  color:isT?course.color:isSel?"#f0f2f8":"#9aaabf",
                  padding:"1px 0 3px",
                  textShadow:isT?`0 0 20px ${course.color}55`:"none",
                }}>
                  {d.getDate()}
                </div>

                {/* ④ MONTH (first col or boundary) */}
                {(i===0||d.getDate()===1)&&(
                  <div style={{fontSize:8,color:"#56637a",fontFamily:"'JetBrains Mono',monospace",marginBottom:2,lineHeight:1.3}}>
                    {d.toLocaleDateString("en-US",{month:"short",year:"2-digit"})}
                  </div>
                )}
              </div>

              {/* ⑤ EVENT DOTS + COUNT */}
              <div style={{background:isT?"#12141b":"#1a1c27",padding:"3px 4px 8px",display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                {dayEvs.length>0&&(
                  <div style={{fontSize:8,fontWeight:700,fontFamily:"'JetBrains Mono',monospace",
                    color:isT?course.color:"#56637a",
                    background:isT?`${course.color}20`:"rgba(255,255,255,.05)",
                    padding:"2px 8px",borderRadius:99,lineHeight:1.5}}>
                    {dayEvs.length} session{dayEvs.length!==1?"s":""}
                  </div>
                )}
                <div style={{display:"flex",justifyContent:"center",gap:3,flexWrap:"wrap"}}>
                  {topColors.map((c,j)=>(
                    <div key={j} style={{width:6,height:6,borderRadius:"50%",background:c,
                      boxShadow:`0 0 4px ${c}88`,flexShrink:0}}/>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Time grid */}
      <div style={{overflowY:"auto",maxHeight:520}}>
        {HOURS.map(h=>{
          const hLabel=h<12?`${h}:00 AM`:h===12?"12:00 PM":`${h-12}:00 PM`;
          return (
          <div key={h} style={{display:"grid",gridTemplateColumns:`64px repeat(7,1fr)`,borderBottom:"1px solid rgba(255,255,255,.03)",minHeight:HOUR_H}}>
            <div style={{padding:"8px 8px 8px 4px",fontSize:10,color:"#6b7a99",fontFamily:"'JetBrains Mono',monospace",textAlign:"right",borderRight:"1px solid rgba(255,255,255,.06)",display:"flex",alignItems:"flex-start",justifyContent:"flex-end",flexShrink:0,paddingTop:6}}>
              {hLabel}
            </div>
            {weekDays.map((d,ci)=>{
              const hEvs=filteredEvents(d).filter(e=>e.date.getHours()===h);
              const isT=isSameDay(d,today);
              const course=getCourseForDate(d);
              return (
                <div key={ci} style={{borderLeft:"1px solid rgba(255,255,255,.04)",padding:"3px 5px",background:isT?`${course.color}08`:"transparent",position:"relative"}}>
                  {hEvs.map((ev,j)=>(
                    <div key={j}
                      style={{background:`${ev.color}1c`,borderLeft:`3px solid ${ev.color}`,borderRadius:"0 8px 8px 0",padding:"5px 8px",marginBottom:3,cursor:"pointer",transition:"filter .15s"}}
                      onMouseEnter={e=>{e.currentTarget.style.filter="brightness(1.15)";setTooltip({x:e.clientX,y:e.clientY,ev});}}
                      onMouseLeave={e=>{e.currentTarget.style.filter="brightness(1)";setTooltip(null);}}>
                      <div style={{fontSize:10,fontWeight:700,color:ev.color,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{typeIcon[ev.type]} {ev.title}</div>
                      {ev.duration>0&&<div style={{fontSize:9,color:"rgba(255,255,255,.3)",fontFamily:"'JetBrains Mono',monospace"}}>{ev.duration}m</div>}
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
  const renderMonth=()=>{
    const prevMonth=()=>{ let m=selMonth-1,y=selYear; if(m<0){m=11;y--;} setSelMonth(m); setSelYear(y); };
    const nextMonth=()=>{ let m=selMonth+1,y=selYear; if(m>11){m=0;y++;} setSelMonth(m); setSelYear(y); };
    return (
      <div style={{background:"#16181f",border:"1px solid rgba(255,255,255,.07)",borderRadius:16,padding:20}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <button onClick={prevMonth} style={{width:32,height:32,borderRadius:8,background:"rgba(255,255,255,.06)",border:"none",color:"#f0f2f8",cursor:"pointer",fontSize:16}}>‹</button>
          <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:18}}>{monthName} {selYear}</div>
          <button onClick={nextMonth} style={{width:32,height:32,borderRadius:8,background:"rgba(255,255,255,.06)",border:"none",color:"#f0f2f8",cursor:"pointer",fontSize:16}}>›</button>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:4,marginBottom:8}}>
          {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d=><div key={d} style={{textAlign:"center",fontSize:10,color:"#6b7a99",fontWeight:700,fontFamily:"'JetBrains Mono',monospace",padding:"6px 0"}}>{d}</div>)}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:4}}>
          {Array.from({length:firstDOW}).map((_,i)=><div key={`e${i}`}/>)}
          {Array.from({length:daysInMonth},(_,i)=>{
            const day=i+1;
            const d=new Date(selYear,selMonth,day);
            const isT=isSameDay(d,today);
            const isSel=isSameDay(d,selectedDate);
            const dayEvs=eventsForDay(d);
            return (
              <div key={day} onClick={()=>setSelectedDate(new Date(d))}
                style={{minHeight:80,padding:"6px 5px",borderRadius:10,cursor:"pointer",border:`1px solid ${isSel?"rgba(79,142,247,.5)":isT?"rgba(79,142,247,.22)":"rgba(255,255,255,.05)"}`,background:isSel?"rgba(79,142,247,.12)":isT?"rgba(79,142,247,.07)":"#1e2130",transition:"all .2s"}}
                onMouseEnter={e=>{if(!isT&&!isSel)e.currentTarget.style.borderColor="rgba(255,255,255,.15)";}}
                onMouseLeave={e=>{if(!isT&&!isSel)e.currentTarget.style.borderColor="rgba(255,255,255,.05)";}}>
                {/* Date number row */}
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3}}>
                  <span style={{fontWeight:isSel||isT?800:600,fontSize:13,color:isT||isSel?"#4f8ef7":"#c0c9d9",fontFamily:"'Syne',sans-serif"}}>{day}</span>
                  {dayEvs.length>0&&<span style={{fontSize:8,fontWeight:700,fontFamily:"'JetBrains Mono',monospace",color:isT?"#4f8ef7":"#6b7a99",background:isT?"rgba(79,142,247,.15)":"rgba(255,255,255,.06)",padding:"1px 5px",borderRadius:99}}>{dayEvs.length}</span>}
                </div>
                {/* Featured course banner */}
                {(()=>{ const dc=getCourseForDate(d); return (
                  <div style={{display:"flex",alignItems:"center",gap:3,padding:"3px 5px",borderRadius:6,background:`${dc.color}18`,border:`1px solid ${dc.color}40`,marginBottom:3,borderLeft:`3px solid ${dc.color}`}}>
                    <span style={{fontSize:10,flexShrink:0}}>{dc.icon}</span>
                    <div style={{minWidth:0}}>
                      <div style={{fontSize:8,fontWeight:800,color:dc.color,fontFamily:"'Syne',sans-serif",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:52,lineHeight:1.2}}>{dc.label}</div>
                      <div style={{fontSize:7,color:`${dc.color}80`,fontFamily:"'JetBrains Mono',monospace",letterSpacing:".04em"}}>Day focus</div>
                    </div>
                  </div>
                ); })()}
                {/* Event chips */}
                {dayEvs.slice(0,2).map((ev,j)=>(
                  <div key={j} style={{fontSize:8,fontWeight:700,padding:"2px 4px",borderRadius:4,background:`${ev.color}20`,color:ev.color,marginBottom:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{typeIcon[ev.type]} {ev.title.slice(0,12)}{ev.title.length>12?"…":""}</div>
                ))}
                {dayEvs.length>2&&<div style={{fontSize:8,color:"#6b7a99",fontFamily:"'JetBrains Mono',monospace"}}>+{dayEvs.length-2} more</div>}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // ── TIMETABLE VIEW
  const renderTimetable=()=>{
    const cols=weekDays;
    return (
      <div style={{background:"#16181f",border:"1px solid rgba(255,255,255,.07)",borderRadius:16,overflow:"hidden"}}>
        <div style={{display:"grid",gridTemplateColumns:`80px repeat(7,1fr)`,background:"#12141b",borderBottom:"2px solid rgba(255,255,255,.08)"}}>
          <div style={{padding:"10px 8px 10px 12px",display:"flex",flexDirection:"column",justifyContent:"center",borderRight:"1px solid rgba(255,255,255,.07)"}}>
            <span style={{fontSize:8,color:"#4f8ef7",fontFamily:"'JetBrains Mono',monospace",fontWeight:700,letterSpacing:".08em",textTransform:"uppercase"}}>TIME</span>
          </div>
          {cols.map((d,i)=>{
            const isT=isSameDay(d,today);
            const dc=getCourseForDate(d);
            return (
              <div key={i} style={{borderLeft:"1px solid rgba(255,255,255,.06)",overflow:"hidden",
                borderBottom:isT?`3px solid ${dc.color}`:`3px solid transparent`}}>
                {/* Course strip */}
                <div style={{background:isT?`linear-gradient(135deg,${dc.color}44,${dc.color}22)`:`${dc.color}14`,borderBottom:`1px solid ${dc.color}30`,padding:"6px 5px",display:"flex",alignItems:"center",gap:5,justifyContent:"center"}}>
                  <span style={{fontSize:14,lineHeight:1}}>{dc.icon}</span>
                  <div style={{minWidth:0}}>
                    <div style={{fontSize:9,fontWeight:800,color:dc.color,fontFamily:"'Syne',sans-serif",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:66,lineHeight:1.2}}>{dc.label}</div>
                    <div style={{fontSize:7,color:`${dc.color}80`,fontFamily:"'JetBrains Mono',monospace",letterSpacing:".05em",textTransform:"uppercase"}}>Day Focus</div>
                  </div>
                </div>
                {/* Day + date */}
                <div style={{padding:"5px 4px 7px",textAlign:"center",background:isT?"rgba(0,0,0,.15)":"transparent"}}>
                  <div style={{fontSize:9,fontFamily:"'JetBrains Mono',monospace",fontWeight:700,letterSpacing:".08em",color:isT?dc.color:"#56637a"}}>
                    {d.toLocaleDateString("en-US",{weekday:"short"}).toUpperCase()}
                  </div>
                  <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:20,color:isT?dc.color:"#9aaabf",lineHeight:1,margin:"1px 0 2px",
                    textShadow:isT?`0 0 16px ${dc.color}55`:"none"}}>
                    {d.getDate()}
                  </div>
                  <div style={{fontSize:8,color:"#56637a",fontFamily:"'JetBrains Mono',monospace"}}>
                    {d.toLocaleDateString("en-US",{month:"short",year:"2-digit"})}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div style={{overflowY:"auto",maxHeight:500}}>
          {HOURS.map(h=>(
            <div key={h} style={{display:"grid",gridTemplateColumns:`80px repeat(7,1fr)`,borderBottom:"1px solid rgba(255,255,255,.04)",minHeight:56}}>
              <div style={{padding:"8px 12px",fontSize:11,color:"#6b7a99",fontFamily:"'JetBrains Mono',monospace",borderRight:"1px solid rgba(255,255,255,.06)",display:"flex",alignItems:"center"}}>
                {h<12?`${h}:00 AM`:h===12?"12:00 PM":`${h-12}:00 PM`}
              </div>
              {cols.map((d,ci)=>{
                const hEvs=eventsForDay(d).filter(e=>e.date.getHours()===h);
                const isT=isSameDay(d,today);
                return (
                  <div key={ci} style={{borderLeft:"1px solid rgba(255,255,255,.04)",padding:"4px",background:isT?"rgba(79,142,247,.02)":"transparent"}}>
                    {hEvs.map((ev,j)=>(
                      <div key={j} style={{background:`${ev.color}18`,border:`1px solid ${ev.color}44`,borderRadius:7,padding:"5px 8px",marginBottom:3}}>
                        <div style={{fontSize:10,fontWeight:700,color:ev.color}}>{typeIcon[ev.type]} {ev.title.length>16?ev.title.slice(0,15)+"…":ev.title}</div>
                        <div style={{fontSize:9,color:"rgba(255,255,255,.3)"}}>{ev.duration>0?ev.duration+"m":"Due"}</div>
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
  const renderGantt=()=>(
    <div style={{background:"#16181f",border:"1px solid rgba(255,255,255,.07)",borderRadius:16,padding:20,overflow:"hidden"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <div>
          <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:14}}>📊 Gantt / Swimlane</div>
          <div style={{fontSize:11,color:"#6b7a99",marginTop:2}}>Hover blocks for details · Collapse sections</div>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
          {["all","in-progress","upcoming","completed","live","deadline"].map(f=>(
            <button key={f} onClick={()=>setGanttFilter(f)} style={{padding:"4px 10px",borderRadius:99,border:`1px solid ${ganttFilter===f?"rgba(79,142,247,.6)":"rgba(255,255,255,.1)"}`,background:ganttFilter===f?"rgba(79,142,247,.18)":"transparent",color:ganttFilter===f?"#4f8ef7":"#9aa5bc",fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:"'JetBrains Mono',monospace",textTransform:"capitalize"}}>
              {f==="all"?"All":statusLabel[f]}
            </button>
          ))}
          <button onClick={()=>setGanttScroll(Math.max(0,ganttScroll-4))} style={{width:28,height:28,borderRadius:7,background:"rgba(255,255,255,.06)",border:"none",color:"#f0f2f8",cursor:"pointer",fontSize:14}}>‹</button>
          <button onClick={()=>setGanttScroll(Math.min(maxGScroll,ganttScroll+4))} style={{width:28,height:28,borderRadius:7,background:"rgba(255,255,255,.06)",border:"none",color:"#f0f2f8",cursor:"pointer",fontSize:14}}>›</button>
        </div>
      </div>

      <div style={{overflowX:"hidden",borderRadius:10,border:"1px solid rgba(255,255,255,.06)"}}>
        {/* Day header row */}
        <div style={{display:"flex",background:"#1a1c27",borderBottom:"1px solid rgba(255,255,255,.07)"}}>
          <div style={{width:LABEL_W,flexShrink:0,padding:"10px 14px",fontSize:10,fontWeight:700,color:"#6b7a99",fontFamily:"'JetBrains Mono',monospace",borderRight:"1px solid rgba(255,255,255,.07)"}}>MODULE</div>
          {gDays.slice(gVis,gVis+VIS).map((d,i)=>{
            const isT=isSameDay(d,today);
            return (
              <div key={i} style={{width:DAY_W,flexShrink:0,textAlign:"center",padding:"8px 2px",borderRight:"1px solid rgba(255,255,255,.04)",background:isT?"rgba(79,142,247,.15)":"transparent"}}>
                <div style={{fontSize:9,color:isT?"#4f8ef7":"#6b7a99",fontFamily:"'JetBrains Mono',monospace",fontWeight:isT?700:400}}>{d.toLocaleDateString("en-US",{weekday:"short"})}</div>
                <div style={{fontSize:12,fontWeight:isT?800:500,color:isT?"#4f8ef7":"#9aa5bc"}}>{d.getDate()}</div>
                {isT&&<div style={{width:4,height:4,borderRadius:"50%",background:"#4f8ef7",margin:"2px auto 0"}}/>}
              </div>
            );
          })}
        </div>

        {/* Section + item rows */}
        {filteredGantt.map((sec,si)=>(
          <div key={si}>
            <div onClick={()=>setExpandedSections(prev=>({...prev,[sec.category]:!prev[sec.category]}))}
              style={{display:"flex",background:"rgba(255,255,255,.025)",borderBottom:"1px solid rgba(255,255,255,.06)",cursor:"pointer"}}>
              <div style={{width:LABEL_W,flexShrink:0,padding:"8px 14px",display:"flex",alignItems:"center",gap:7,borderRight:"1px solid rgba(255,255,255,.07)"}}>
                <span style={{fontSize:12}}>{sec.icon}</span>
                <span style={{fontSize:12,fontWeight:700,color:sec.color,fontFamily:"'Syne',sans-serif"}}>{sec.category}</span>
                <span style={{marginLeft:"auto",fontSize:11,color:"#6b7a99"}}>{expandedSections[sec.category]?"▼":"▶"}</span>
              </div>
              <div style={{flex:1,height:34}}/>
            </div>
            {expandedSections[sec.category]&&sec.items.map((item,ii)=>(
              <div key={ii} style={{display:"flex",borderBottom:"1px solid rgba(255,255,255,.04)",minHeight:44,background:ii%2===0?"transparent":"rgba(255,255,255,.01)"}}>
                <div style={{width:LABEL_W,flexShrink:0,padding:"8px 14px",borderRight:"1px solid rgba(255,255,255,.05)",display:"flex",alignItems:"center",gap:8}}>
                  <div style={{width:7,height:7,borderRadius:"50%",background:item.color,flexShrink:0}}/>
                  <div>
                    <div style={{fontSize:11,fontWeight:600,color:"#f0f2f8",lineHeight:1.3}}>{item.label}</div>
                    <div style={{fontSize:9,color:"#6b7a99"}}>{item.sub}</div>
                  </div>
                </div>
                <div style={{flex:1,display:"flex",position:"relative",alignItems:"center",minHeight:44}}>
                  {gDays.slice(gVis,gVis+VIS).map((_,ci)=>(
                    <div key={ci} style={{width:DAY_W,height:"100%",flexShrink:0,borderRight:"1px solid rgba(255,255,255,.03)"}}/>
                  ))}
                  {item.blocks.map((blk,bi)=>{
                    const sDay=blk.s-G_OFFSET-gVis;
                    const eDay=blk.e-G_OFFSET-gVis;
                    if(eDay<0||sDay>=VIS) return null;
                    const cs=Math.max(0,sDay), ce=Math.min(VIS-1,eDay);
                    const left=cs*DAY_W+3, width=(ce-cs+1)*DAY_W-6;
                    if(width<=0) return null;
                    const st=statusStyle[blk.status]||statusStyle["upcoming"];
                    return (
                      <div key={bi} onMouseEnter={e=>setTooltip({x:e.clientX,y:e.clientY,label:item.label,blk})} onMouseLeave={()=>setTooltip(null)}
                        style={{position:"absolute",left,width,height:28,borderRadius:6,background:st.bg,border:`1px solid ${st.border}`,display:"flex",alignItems:"center",paddingLeft:8,cursor:"pointer",overflow:"hidden",zIndex:1,transition:"filter .15s"}}
                        onMouseOver={e=>e.currentTarget.style.filter="brightness(1.15)"}
                        onMouseOut={e=>e.currentTarget.style.filter="brightness(1)"}>
                        <span style={{fontSize:10,fontWeight:700,color:st.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{blk.title}</span>
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
      <div style={{display:"flex",gap:14,marginTop:12,flexWrap:"wrap"}}>
        {[["#10b981","rgba(16,185,129,.22)","Completed"],["#4f8ef7","rgba(79,142,247,.22)","In Progress"],["#9aa5bc","rgba(255,255,255,.07)","Upcoming"],["#f43f5e","rgba(244,63,94,.2)","Live Now"],["#f59e0b","rgba(245,158,11,.2)","Deadline"]].map((l,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:6}}>
            <div style={{width:20,height:10,borderRadius:3,background:l[1],border:`1px solid ${l[0]}`}}/>
            <span style={{fontSize:10,color:"#9aa5bc"}}>{l[2]}</span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{display:"flex",flexDirection:"column",gap:18}}>

      {/* ── TOP BAR: stats + controls ── */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr) 1fr",gap:12}}>
        {[
          {icon:"📅",label:"Today's Sessions",val:todayCount,color:"#4f8ef7"},
          {icon:"📌",label:"Upcoming Events",val:upcoming,color:"#10b981"},
          {icon:"⚠️",label:"Deadlines",val:deadlines,color:"#f43f5e"},
          {icon:"⏱",label:"Course Hrs/Week",val:`${Math.round(weekHours/60)}h ${weekHours%60}m`,color:"#f59e0b"},
        ].map((s,i)=>(
          <div key={i} style={{background:"#16181f",border:`1px solid ${s.color}28`,borderRadius:14,padding:"14px 16px",display:"flex",gap:12,alignItems:"center"}}>
            <div style={{width:36,height:36,borderRadius:10,background:`${s.color}18`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{s.icon}</div>
            <div>
              <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:20,color:s.color}}>{s.val}</div>
              <div style={{fontSize:10,color:"#6b7a99",fontFamily:"'JetBrains Mono',monospace",textTransform:"uppercase",letterSpacing:".04em"}}>{s.label}</div>
            </div>
          </div>
        ))}
        {/* Pomodoro timer card */}
        <div style={{background:"#16181f",border:"1px solid rgba(124,58,237,.3)",borderRadius:14,padding:"12px 14px",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:6}}>
          <div style={{fontSize:10,color:"#7c3aed",fontFamily:"'JetBrains Mono',monospace",fontWeight:700,letterSpacing:".06em"}}>🍅 FOCUS TIMER</div>
          <div style={{position:"relative",width:54,height:54}}>
            <svg width="54" height="54" viewBox="0 0 54 54">
              <circle cx="27" cy="27" r="22" fill="none" stroke="rgba(124,58,237,.15)" strokeWidth="4"/>
              <circle cx="27" cy="27" r="22" fill="none" stroke="#7c3aed" strokeWidth="4"
                strokeDasharray={`${timerPct/100*138.2} 138.2`} strokeLinecap="round" transform="rotate(-90 27 27)" style={{transition:"stroke-dasharray .5s"}}/>
            </svg>
            <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,fontFamily:"'JetBrains Mono',monospace",color:"#7c3aed"}}>{fmtTimer(timerSec)}</div>
          </div>
          <div style={{display:"flex",gap:6}}>
            <button onClick={()=>setTimerRunning(!timerRunning)} style={{padding:"4px 10px",borderRadius:7,background:"rgba(124,58,237,.2)",border:"1px solid rgba(124,58,237,.4)",color:"#a78bfa",fontSize:10,fontWeight:700,cursor:"pointer"}}>{timerRunning?"⏸ Pause":"▶ Start"}</button>
            <button onClick={()=>{setTimerRunning(false);setTimerSec(25*60);}} style={{padding:"4px 8px",borderRadius:7,background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.1)",color:"#6b7a99",fontSize:10,cursor:"pointer"}}>↺</button>
          </div>
        </div>
      </div>

      {/* ── VIEW SWITCHER + SEARCH + ADD ── */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,flexWrap:"wrap"}}>
        <div style={{display:"flex",gap:6,background:"#16181f",border:"1px solid rgba(255,255,255,.07)",borderRadius:12,padding:5}}>
          {[["week","📅 Week"],["month","📆 Month"],["timetable","📋 Timetable"],["gantt","📊 Gantt"]].map(([v,lbl])=>(
            <button key={v} onClick={()=>setView(v)} style={{padding:"7px 16px",borderRadius:9,border:"none",background:view===v?"linear-gradient(135deg,#4f8ef7,#7c3aed)":"transparent",color:view===v?"#fff":"#9aa5bc",fontSize:12,fontWeight:700,cursor:"pointer",transition:"all .2s"}}>{lbl}</button>
          ))}
        </div>
        <div style={{display:"flex",gap:10,alignItems:"center"}}>
          {/* Search */}
          <div style={{display:"flex",alignItems:"center",gap:8,background:"#16181f",border:"1px solid rgba(255,255,255,.08)",borderRadius:10,padding:"8px 14px",width:200}}>
            <span style={{color:"#6b7a99",fontSize:13}}>🔍</span>
            <input value={searchQ} onChange={e=>setSearchQ(e.target.value)} placeholder="Search events…" style={{background:"none",border:"none",outline:"none",color:"#f0f2f8",fontSize:12,width:"100%",fontFamily:"'DM Sans',sans-serif"}}/>
          </div>
          {/* Nav arrows for week */}
          {(view==="week"||view==="timetable")&&(
            <div style={{display:"flex",gap:4}}>
              <button onClick={()=>{ const d=new Date(selectedDate); d.setDate(d.getDate()-7); setSelectedDate(d); }} style={{width:32,height:32,borderRadius:8,background:"rgba(255,255,255,.06)",border:"none",color:"#f0f2f8",cursor:"pointer",fontSize:16}}>‹</button>
              <button onClick={()=>setSelectedDate(new Date(today))} style={{padding:"0 10px",height:32,borderRadius:8,background:"rgba(79,142,247,.15)",border:"1px solid rgba(79,142,247,.3)",color:"#4f8ef7",cursor:"pointer",fontSize:11,fontWeight:700}}>Today</button>
              <button onClick={()=>{ const d=new Date(selectedDate); d.setDate(d.getDate()+7); setSelectedDate(d); }} style={{width:32,height:32,borderRadius:8,background:"rgba(255,255,255,.06)",border:"none",color:"#f0f2f8",cursor:"pointer",fontSize:16}}>›</button>
            </div>
          )}
          {/* Add event */}
          <button onClick={()=>setShowAddModal(true)} style={{padding:"8px 18px",borderRadius:10,background:"linear-gradient(135deg,#4f8ef7,#7c3aed)",color:"#fff",border:"none",cursor:"pointer",fontSize:12,fontWeight:700,display:"flex",alignItems:"center",gap:6}}>+ Add Event</button>
        </div>
      </div>

      {/* ── CURRENT VIEW ── */}
      {view==="week"      && renderWeek()}
      {view==="month"     && renderMonth()}
      {view==="timetable" && renderTimetable()}
      {view==="gantt"     && renderGantt()}

      {/* ── BOTTOM ROW: Day panel + Deadlines + Reminders ── */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:16}}>
        {/* Selected day detail */}
        <div style={{background:"#16181f",border:"1px solid rgba(255,255,255,.07)",borderRadius:16,padding:18}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <div>
              <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:14}}>📋 {selectedDate.toLocaleDateString("en-US",{weekday:"long",month:"short",day:"numeric"})}</div>
              {isSameDay(selectedDate,today)&&<span style={{fontSize:9,padding:"2px 7px",borderRadius:99,background:"rgba(79,142,247,.18)",color:"#4f8ef7",fontFamily:"'JetBrains Mono',monospace",fontWeight:700}}>TODAY</span>}
            </div>
            <div style={{fontSize:12,color:"#6b7a99"}}>{filteredEvents(selectedDate).length} events</div>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:7,maxHeight:250,overflowY:"auto"}}>
            {filteredEvents(selectedDate).length===0
              ? <div style={{color:"#6b7a99",fontSize:12,textAlign:"center",padding:"20px 0"}}>No events</div>
              : filteredEvents(selectedDate).map((ev,i)=>(
                <div key={i} style={{display:"flex",gap:10,alignItems:"flex-start",padding:"9px 10px",borderRadius:10,background:`${ev.color}10`,border:`1px solid ${ev.color}28`}}>
                  <div style={{fontSize:16,flexShrink:0}}>{typeIcon[ev.type]}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:12,fontWeight:700,marginBottom:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{ev.title}</div>
                    <div style={{fontSize:10,color:"#9aa5bc"}}>{ev.date.toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"})}{ev.duration>0?` · ${ev.duration}m`:""}</div>
                    {ev.note&&<div style={{fontSize:10,color:"#6b7a99",marginTop:2,fontStyle:"italic"}}>{ev.note}</div>}
                  </div>
                  <span style={{fontSize:9,fontWeight:700,padding:"2px 6px",borderRadius:99,background:`${ev.color}22`,color:ev.color,flexShrink:0,fontFamily:"'JetBrains Mono',monospace"}}>{typeLabel[ev.type]}</span>
                </div>
              ))
            }
          </div>
        </div>

        {/* Deadline tracker */}
        <div style={{background:"#16181f",border:"1px solid rgba(255,255,255,.07)",borderRadius:16,padding:18}}>
          <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:14,marginBottom:12}}>⚠️ Deadline Tracker</div>
          {events.filter(e=>e.type==="deadline"&&e.date>=today).sort((a,b)=>a.date-b.date).map((d,i)=>{
            const diff=Math.ceil((d.date-today)/(1000*60*60*24));
            const urg=diff<=1?"#f43f5e":diff<=3?"#f59e0b":"#10b981";
            return (
              <div key={i} style={{display:"flex",gap:10,alignItems:"center",padding:"10px 11px",borderRadius:10,border:`1px solid ${urg}28`,background:`${urg}08`,marginBottom:8}}>
                <div style={{width:32,height:32,borderRadius:9,background:`${urg}22`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15}}>⚠️</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:12,fontWeight:700,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{d.title}</div>
                  <div style={{fontSize:10,color:"#9aa5bc"}}>{d.date.toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"})}</div>
                </div>
                <div style={{fontSize:11,fontWeight:800,color:urg,fontFamily:"'JetBrains Mono',monospace",flexShrink:0}}>{diff===0?"Today":diff===1?"Tomorrow":`${diff}d`}</div>
              </div>
            );
          })}
        </div>

        {/* Reminder alerts */}
        <div style={{background:"#16181f",border:"1px solid rgba(255,255,255,.07)",borderRadius:16,padding:18}}>
          <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:14,marginBottom:12}}>🔔 Upcoming Seminars</div>
          {events.filter(e=>e.type==="seminar"&&e.date>=today).sort((a,b)=>a.date-b.date).slice(0,4).map((s,i)=>{
            const diff=Math.ceil((s.date-today)/(1000*60*60*24));
            return (
              <div key={i} style={{display:"flex",gap:10,alignItems:"flex-start",padding:"10px 11px",borderRadius:10,border:`1px solid ${s.color}22`,background:`${s.color}08`,marginBottom:8}}>
                <div style={{fontSize:17,flexShrink:0}}>🎤</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:12,fontWeight:700,marginBottom:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.title}</div>
                  <div style={{fontSize:10,color:"#9aa5bc"}}>{s.date.toLocaleString("en-US",{weekday:"short",month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"})}</div>
                </div>
                <span style={{fontSize:9,fontWeight:700,padding:"2px 7px",borderRadius:99,background:`${s.color}22`,color:s.color,flexShrink:0}}>{diff===0?"Today":diff===1?"Tmr":`+${diff}d`}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── ADD EVENT MODAL ── */}
      {showAddModal&&(
        <div onClick={()=>setShowAddModal(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.65)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:9999,backdropFilter:"blur(6px)"}}>
          <div onClick={e=>e.stopPropagation()} style={{background:"#16181f",border:"1px solid rgba(255,255,255,.1)",borderRadius:20,padding:32,width:440,boxShadow:"0 16px 48px rgba(0,0,0,.5)",animation:"popIn .25s ease"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22}}>
              <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:18}}>+ Add Event</div>
              <button onClick={()=>setShowAddModal(false)} style={{background:"rgba(255,255,255,.06)",border:"none",color:"#9aa5bc",cursor:"pointer",width:30,height:30,borderRadius:8,fontSize:15}}>✕</button>
            </div>
            {[
              {lbl:"Event Title",el:<input value={newEvent.title} onChange={e=>setNewEvent({...newEvent,title:e.target.value})} placeholder="e.g. React Mastery – Hooks" style={{width:"100%",padding:"10px 12px",borderRadius:10,border:"1.5px solid rgba(79,142,247,.3)",background:"#1e2130",color:"#f0f2f8",fontSize:13,outline:"none",fontFamily:"'DM Sans',sans-serif"}}/>},
              {lbl:"Type",el:(
                <select value={newEvent.type} onChange={e=>setNewEvent({...newEvent,type:e.target.value})} style={{width:"100%",padding:"10px 12px",borderRadius:10,border:"1.5px solid rgba(79,142,247,.3)",background:"#1e2130",color:"#f0f2f8",fontSize:13,outline:"none"}}>
                  {Object.entries(typeLabel).map(([k,v])=><option key={k} value={k}>{v}</option>)}
                </select>
              )},
              {lbl:"Time",el:<input type="time" value={newEvent.time} onChange={e=>setNewEvent({...newEvent,time:e.target.value})} style={{width:"100%",padding:"10px 12px",borderRadius:10,border:"1.5px solid rgba(79,142,247,.3)",background:"#1e2130",color:"#f0f2f8",fontSize:13,outline:"none"}}/>},
              {lbl:"Duration (minutes)",el:<input type="number" value={newEvent.duration} onChange={e=>setNewEvent({...newEvent,duration:e.target.value})} style={{width:"100%",padding:"10px 12px",borderRadius:10,border:"1.5px solid rgba(79,142,247,.3)",background:"#1e2130",color:"#f0f2f8",fontSize:13,outline:"none"}}/>},
              {lbl:"Notes",el:<input value={newEvent.note} onChange={e=>setNewEvent({...newEvent,note:e.target.value})} placeholder="Optional note…" style={{width:"100%",padding:"10px 12px",borderRadius:10,border:"1.5px solid rgba(79,142,247,.3)",background:"#1e2130",color:"#f0f2f8",fontSize:13,outline:"none",fontFamily:"'DM Sans',sans-serif"}}/>},
            ].map(({lbl,el},i)=>(
              <div key={i} style={{marginBottom:14}}>
                <div style={{fontSize:11,fontWeight:700,color:"#6b7a99",fontFamily:"'JetBrains Mono',monospace",letterSpacing:".06em",textTransform:"uppercase",marginBottom:6}}>{lbl}</div>
                {el}
              </div>
            ))}
            <div style={{display:"flex",gap:10,marginTop:20}}>
              <button onClick={()=>setShowAddModal(false)} style={{flex:1,padding:"11px",borderRadius:11,border:"1px solid rgba(255,255,255,.1)",background:"transparent",color:"#9aa5bc",cursor:"pointer",fontSize:13,fontWeight:700}}>Cancel</button>
              <button onClick={handleAddEvent} style={{flex:2,padding:"11px",borderRadius:11,background:"linear-gradient(135deg,#4f8ef7,#7c3aed)",color:"#fff",border:"none",cursor:"pointer",fontSize:13,fontWeight:700}}>Add to Schedule</button>
            </div>
          </div>
        </div>
      )}

      {/* ── TOOLTIP ── */}
      {tooltip&&(
        <div style={{position:"fixed",left:tooltip.x+12,top:tooltip.y-70,background:"#1e2130",border:"1px solid rgba(255,255,255,.12)",borderRadius:12,padding:"12px 16px",zIndex:9999,pointerEvents:"none",minWidth:180,boxShadow:"0 8px 32px rgba(0,0,0,.5)"}}>
          {tooltip.ev
            ? <>
              <div style={{fontSize:13,fontWeight:700,marginBottom:4}}>{typeIcon[tooltip.ev.type]} {tooltip.ev.title}</div>
              <div style={{fontSize:11,color:"#9aa5bc",marginBottom:3}}>{tooltip.ev.date.toLocaleString("en-US",{weekday:"short",month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"})}</div>
              {tooltip.ev.duration>0&&<div style={{fontSize:11,color:"#9aa5bc",marginBottom:3}}>Duration: {tooltip.ev.duration} min</div>}
              {tooltip.ev.note&&<div style={{fontSize:10,color:"#6b7a99",fontStyle:"italic"}}>{tooltip.ev.note}</div>}
            </>
            : <>
              <div style={{fontSize:12,fontWeight:700,marginBottom:4}}>{tooltip.label}</div>
              <div style={{fontSize:11,color:"#9aa5bc",marginBottom:4}}>{tooltip.blk.title}</div>
              <div style={{fontSize:10,color:statusStyle[tooltip.blk.status]?.text||"#9aa5bc",fontWeight:700,fontFamily:"'JetBrains Mono',monospace"}}>{statusLabel[tooltip.blk.status]}</div>
            </>
          }
        </div>
      )}
    </div>
  );
}


function VideoPlayer({vid,title,dur}) {
  const [playing,setPlaying]=useState(false);
  const [ready,setReady]=useState(false);
  const [hovered,setHovered]=useState(false);
  const url=`https://www.youtube.com/watch?v=${vid}`;
  return (
    <div style={{position:"relative",width:"100%",paddingBottom:"56.25%",background:"#000",overflow:"hidden"}}>
      {/* ReactPlayer always mounted so it can load */}
      <div style={{position:"absolute",inset:0,display:playing?"block":"none"}}>
        <ReactPlayer
          url={url}
          width="100%"
          height="100%"
          playing={playing}
          controls={true}
          onReady={()=>setReady(true)}
          onError={()=>setPlaying(false)}
          config={{
            youtube:{
              playerVars:{
                autoplay:1,
                rel:0,
                modestbranding:1,
                showinfo:0,
                origin:typeof window!=="undefined"?window.location.origin:"",
              }
            }
          }}
        />
      </div>
      {/* Thumbnail overlay — shown until user clicks play */}
      {!playing&&(
        <div
          style={{position:"absolute",inset:0,cursor:"pointer"}}
          onMouseEnter={()=>setHovered(true)}
          onMouseLeave={()=>setHovered(false)}
          onClick={()=>setPlaying(true)}>
          <img
            src={`https://img.youtube.com/vi/${vid}/maxresdefault.jpg`}
            alt={title}
            style={{width:"100%",height:"100%",objectFit:"cover",opacity:hovered?.92:.78,transition:"opacity .2s,transform .3s",transform:hovered?"scale(1.03)":"scale(1)"}}
            onError={e=>{e.target.src=`https://img.youtube.com/vi/${vid}/hqdefault.jpg`;}}
          />
          <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(0,0,0,.88) 0%,rgba(0,0,0,.1) 55%)"}}/>
          {/* Red play button */}
          <div style={{
            position:"absolute",top:"50%",left:"50%",
            transform:`translate(-50%,-50%) scale(${hovered?1.12:1})`,
            transition:"transform .2s, box-shadow .2s",
            width:76,height:76,borderRadius:"50%",
            background:"#ff0000",
            display:"flex",alignItems:"center",justifyContent:"center",
            boxShadow:hovered?"0 6px 48px rgba(255,0,0,.85)":"0 4px 32px rgba(255,0,0,.55)",
          }}>
            <div style={{width:0,height:0,borderTop:"15px solid transparent",borderBottom:"15px solid transparent",borderLeft:"26px solid #fff",marginLeft:7}}/>
          </div>
          {/* Title */}
          <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"18px 22px"}}>
            <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:18,color:"#fff",marginBottom:4,textShadow:"0 2px 12px rgba(0,0,0,.95)",lineHeight:1.25}}>{title}</div>
            <div style={{fontSize:12,color:"rgba(255,255,255,.55)"}}>Click to play</div>
          </div>
          {/* Duration */}
          <div style={{position:"absolute",top:12,right:14,background:"rgba(0,0,0,.8)",borderRadius:6,padding:"4px 10px",fontSize:11,color:"#fff",fontFamily:"'JetBrains Mono',monospace",fontWeight:700}}>⏱ {dur}</div>
        </div>
      )}
    </div>
  );
}

function Dashboard({ user, onLogout }) {
  const [activePage, setActivePage] = useState("dashboard");
  const [notifOpen, setNotifOpen] = useState(false);
  const [sandboxCode, setSandboxCode] = useState(`// 🚀 Skillio Live Sandbox\nfunction greet(name) {\n  return "Hello, " + name + "! Ready to learn?";\n}\nconsole.log(greet("${(user?.name||"Learner").split(" ")[0]}"));\n`);
  const [sandboxOutput, setSandboxOutput] = useState([]);
  const [sandboxRunning, setSandboxRunning] = useState(false);
  const [activeCourse, setActiveCourse] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);
  const [completedLessons, setCompletedLessons] = useState({});

  const runSandbox = () => {
    setSandboxRunning(true); setSandboxOutput([]);
    const logs=[];
    try {
      const origLog=console.log;
      console.log=(...args)=>logs.push({type:"log",msg:args.map(a=>typeof a==="object"?JSON.stringify(a):String(a)).join(" ")});
      new Function(sandboxCode)();
      console.log=origLog;
    } catch(e){ logs.push({type:"error",msg:e.message}); }
    setTimeout(()=>{setSandboxOutput(logs);setSandboxRunning(false);},400);
  };

  const courses=[
    {icon:"⚛️",title:"React Mastery",     progress:72, tag:"In Progress",color:"#4f8ef7",lessons:24,total:34,lastLesson:"Custom Hooks Deep Dive",xp:840},
    {icon:"🐍",title:"Python for AI",     progress:45, tag:"In Progress",color:"#7c3aed",lessons:14,total:32,lastLesson:"Neural Networks Intro",xp:510},
    {icon:"🎨",title:"UX Design Pro",     progress:100,tag:"Completed",  color:"#10b981",lessons:28,total:28,lastLesson:"Capstone Project",xp:1200},
    {icon:"☁️",title:"Cloud DevOps",      progress:18, tag:"Started",   color:"#f59e0b",lessons:5, total:40,lastLesson:"Docker Basics",xp:180},
    {icon:"🔐",title:"Cybersecurity 101", progress:60, tag:"In Progress",color:"#f43f5e",lessons:18,total:30,lastLesson:"Penetration Testing Intro",xp:620},
    {icon:"📊",title:"Data Analytics",    progress:33, tag:"In Progress",color:"#06b6d4",lessons:10,total:30,lastLesson:"Pandas DataFrames",xp:310},
  ];

  const weekData=[
    {l:"Mon",v:42,c:"#4f8ef7"},{l:"Tue",v:68,c:"#10b981"},{l:"Wed",v:35,c:"#7c3aed"},
    {l:"Thu",v:82,c:"#f59e0b"},{l:"Fri",v:55,c:"#f43f5e"},{l:"Sat",v:90,c:"#06b6d4"},{l:"Sun",v:48,c:"#4f8ef7"},
  ];
  const radarData=[{l:"React",v:72},{l:"Python",v:45},{l:"UX",v:100},{l:"DevOps",v:18},{l:"Security",v:60},{l:"Data",v:33}];
  const scatterData=[
    {x:10,y:40,c:"#4f8ef7"},{x:20,y:55,c:"#7c3aed"},{x:30,y:50,c:"#10b981"},{x:40,y:65,c:"#f59e0b"},
    {x:50,y:0,c:"#f43f5e"},{x:60,y:100,c:"#10b981"},{x:70,y:50,c:"#4f8ef7"},{x:80,y:50,c:"#7c3aed"},
    {x:90,y:0,c:"#f43f5e"},{x:35,y:80,c:"#06b6d4"},{x:55,y:70,c:"#4f8ef7"},{x:75,y:90,c:"#10b981"},
  ];
  const studyArea=[10,25,18,40,35,55,48,70,65,80,72,88];
  const pieData=[
    {label:"Video",v:38,color:"#4f8ef7"},{label:"Reading",v:28,color:"#7c3aed"},
    {label:"Quizzes",v:20,color:"#10b981"},{label:"Sandbox",v:14,color:"#f59e0b"},
  ];
  const monthLine={
    datasets:[
      {data:[20,35,28,52,44,66,58,74,62,80,72,88],color:"#4f8ef7",label:"XP"},
      {data:[60,55,70,65,80,75,85,78,90,88,82,94],color:"#10b981",label:"Quiz%"},
    ],
    labels:["J","F","M","A","M","J","J","A","S","O","N","D"],
  };
  const activities=[
    {icon:"⚛️",title:"React Mastery",sub:"Completed: Hooks & State",time:"2m ago",color:"#4f8ef7"},
    {icon:"📝",title:"Quiz #9 Submitted",sub:"Score: 0/2 — review Java basics",time:"1h ago",color:"#f43f5e"},
    {icon:"🏆",title:"Badge Earned",sub:"7-Day Learning Streak!",time:"Today",color:"#f59e0b"},
    {icon:"🐍",title:"Python for AI",sub:"Started: Neural Networks Intro",time:"Yesterday",color:"#7c3aed"},
    {icon:"📖",title:"New Course",sub:"Enrolled: Cybersecurity 101",time:"2d ago",color:"#f43f5e"},
  ];
  const roadmapSteps=[
    {title:"HTML & CSS Foundations",done:true,color:"#10b981",desc:"Core web structure & styling"},
    {title:"JavaScript Essentials",done:true,color:"#10b981",desc:"Variables, functions, DOM"},
    {title:"React Mastery",done:false,active:true,color:"#4f8ef7",progress:72,desc:"Components, hooks, state management"},
    {title:"Node.js & APIs",done:false,color:"#6b7a99",desc:"Server-side JS & REST APIs"},
    {title:"Databases & SQL",done:false,color:"#6b7a99",desc:"PostgreSQL, Prisma, MongoDB"},
    {title:"Cloud Deployment",done:false,color:"#6b7a99",desc:"AWS, Vercel, Docker"},
    {title:"AI & ML Integration",done:false,color:"#7c3aed",desc:"OpenAI APIs, ML pipelines"},
    {title:"Full-Stack Capstone",done:false,color:"#f59e0b",desc:"Build & deploy your portfolio project"},
  ];
  const quizHistory=[
    {label:"Q1",score:40},{label:"Q2",score:55},{label:"Q3",score:50},{label:"Q4",score:65},
    {label:"Q5",score:0},{label:"Q6",score:100},{label:"Q7",score:50},{label:"Q8",score:50},{label:"Q9",score:0},
  ];

  const navItems=[
    {icon:"⚡",label:"Dashboard",key:"dashboard"},
    {icon:"📅",label:"Schedule",key:"schedule",badge:"3"},
    {icon:"📚",label:"Courses",key:"courses"},
    {icon:"🧠",label:"Quiz",key:"quiz",badge:"2"},
    {icon:"📈",label:"Progress",key:"progress"},
    {icon:"💻",label:"Sandbox",key:"sandbox"},
    {icon:"🗺️",label:"Roadmap",key:"roadmap"},
    {icon:"👤",label:"Profile",key:"profile"},
    {icon:"⚙️",label:"Settings",key:"settings"},
  ];

  // ── KPI STAT CARDS – distinct styles per card
  const renderStatCards=()=>(
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:24}}>
      {/* Card 1: Study Time – blue gradient bg */}
      <div style={{background:"linear-gradient(135deg,rgba(79,142,247,.22),rgba(79,142,247,.06))",border:"1px solid rgba(79,142,247,.35)",borderRadius:16,padding:"20px 18px 16px",position:"relative",overflow:"hidden"}}>
        <div style={{fontSize:10,color:"rgba(79,142,247,.8)",fontFamily:"'JetBrains Mono',monospace",letterSpacing:".08em",marginBottom:10,textTransform:"uppercase",fontWeight:700}}>STUDY TIME</div>
        <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:32,color:"#4f8ef7",lineHeight:1,marginBottom:2}}>24h</div>
        <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:22,color:"rgba(79,142,247,.7)",marginBottom:8}}>30m</div>
        <div style={{fontSize:12,color:"rgba(79,142,247,.6)",marginBottom:12}}>+3h this week</div>
        <Sparkline data={[20,35,28,45,40,60,52,70,65,80]} color="#4f8ef7" width={100} height={32}/>
        <div style={{position:"absolute",top:-10,right:-10,width:60,height:60,borderRadius:"50%",background:"rgba(79,142,247,.1)"}}/>
      </div>
      {/* Card 2: Quiz Score – emerald with left accent */}
      <div style={{background:"#16181f",border:"1px solid rgba(255,255,255,.07)",borderLeft:"3px solid #10b981",borderRadius:16,padding:"20px 18px 16px",position:"relative",overflow:"hidden"}}>
        <div style={{fontSize:10,color:"#6b7a99",fontFamily:"'JetBrains Mono',monospace",letterSpacing:".08em",marginBottom:10,textTransform:"uppercase",fontWeight:700}}>QUIZ SCORE</div>
        <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:38,color:"#10b981",lineHeight:1,marginBottom:8}}>76%</div>
        <div style={{fontSize:12,color:"#10b981",marginBottom:12}}>↑ 8% vs last week</div>
        <Sparkline data={[60,55,70,65,80,75,85,78,90,88]} color="#10b981" width={100} height={32}/>
      </div>
      {/* Card 3: Day Streak – amber, icon prominent */}
      <div style={{background:"#16181f",border:"1px solid rgba(245,158,11,.25)",borderRadius:16,padding:"20px 18px 16px",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:14,right:14,fontSize:28,opacity:.25}}>🔥</div>
        <div style={{fontSize:10,color:"#6b7a99",fontFamily:"'JetBrains Mono',monospace",letterSpacing:".08em",marginBottom:10,textTransform:"uppercase",fontWeight:700}}>DAY STREAK</div>
        <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:38,color:"#f59e0b",lineHeight:1,marginBottom:8}}>7d</div>
        <div style={{fontSize:12,color:"#f59e0b",marginBottom:12}}>Personal best!</div>
        <Sparkline data={[1,3,2,5,4,7,6,7,7,7]} color="#f59e0b" width={100} height={32}/>
      </div>
      {/* Card 4: Total XP – violet, pill badge */}
      <div style={{background:"#16181f",border:"1px solid rgba(255,255,255,.07)",borderRadius:16,padding:"20px 18px 16px",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:12,right:12,fontSize:9,fontWeight:700,padding:"3px 8px",borderRadius:99,background:"rgba(124,58,237,.25)",color:"#a78bfa",fontFamily:"'JetBrains Mono',monospace"}}>LVL 12</div>
        <div style={{fontSize:10,color:"#6b7a99",fontFamily:"'JetBrains Mono',monospace",letterSpacing:".08em",marginBottom:10,textTransform:"uppercase",fontWeight:700}}>TOTAL XP</div>
        <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:32,color:"#7c3aed",lineHeight:1,marginBottom:8}}>3,840</div>
        <div style={{fontSize:12,color:"#9aa5bc",marginBottom:12}}>+320 today</div>
        <Sparkline data={[100,180,140,220,190,280,240,300,260,320]} color="#7c3aed" width={100} height={32}/>
      </div>
    </div>
  );

  // ── COURSE COMPLETION TRACKER
  const renderCompletionTracker=()=>(
    <Section title="✅ Course Completion Tracker" sub="Overall learning progress across all courses" action={<Pill label="6 Courses" color="#4f8ef7"/>}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16,marginBottom:16}}>
        {courses.map((c,i)=>(
          <div key={i} style={{background:"#1e2130",borderRadius:12,padding:"14px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
              <div style={{display:"flex",gap:8,alignItems:"center"}}>
                <span style={{fontSize:18}}>{c.icon}</span>
                <div style={{fontSize:12,fontWeight:700,lineHeight:1.3}}>{c.title}</div>
              </div>
              <span style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:14,color:c.color}}>{c.progress}%</span>
            </div>
            <div style={{height:6,borderRadius:99,background:"rgba(255,255,255,.07)",marginBottom:6,overflow:"hidden"}}>
              <div style={{height:"100%",width:`${c.progress}%`,background:`linear-gradient(90deg,${c.color},${c.color}99)`,borderRadius:99,transition:"width 1.2s ease"}}/>
            </div>
            <div style={{display:"flex",justifyContent:"space-between"}}>
              <span style={{fontSize:10,color:"#6b7a99"}}>{c.lessons}/{c.total} lessons</span>
              <Pill label={c.tag} color={c.color}/>
            </div>
          </div>
        ))}
      </div>
      <div style={{display:"flex",gap:16,padding:"14px 16px",borderRadius:12,background:"rgba(79,142,247,.06)",border:"1px solid rgba(79,142,247,.15)"}}>
        {[{label:"Completed",v:1,color:"#10b981"},{label:"In Progress",v:4,color:"#4f8ef7"},{label:"Started",v:1,color:"#f59e0b"}].map((s,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:8}}>
            <div style={{width:10,height:10,borderRadius:"50%",background:s.color}}/>
            <span style={{fontSize:12,color:"#9aa5bc"}}>{s.v} {s.label}</span>
          </div>
        ))}
        <div style={{marginLeft:"auto",fontSize:12,color:"#4f8ef7",fontWeight:700}}>Avg completion: 54.7%</div>
      </div>
    </Section>
  );

  // ── ACTIVITY TIMELINE
  const renderActivityTimeline=()=>(
    <Section title="⏱ Activity Timeline" sub="Your recent learning actions">
      <div style={{position:"relative",paddingLeft:24}}>
        <div style={{position:"absolute",left:8,top:0,bottom:0,width:1.5,background:"rgba(255,255,255,.07)",borderRadius:99}}/>
        {activities.map((a,i)=>(
          <div key={i} style={{position:"relative",marginBottom:16}}>
            <div style={{position:"absolute",left:-24,top:2,width:14,height:14,borderRadius:"50%",background:`${a.color}33`,border:`2px solid ${a.color}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:7}}/>
            <div style={{background:"#1e2130",borderRadius:11,padding:"11px 14px",border:`1px solid ${a.color}18`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3}}>
                <div style={{fontSize:13,fontWeight:700}}>{a.icon} {a.title}</div>
                <div style={{fontSize:10,color:"#6b7a99",fontFamily:"'JetBrains Mono',monospace"}}>{a.time}</div>
              </div>
              <div style={{fontSize:11,color:"#6b7a99"}}>{a.sub}</div>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );

  const renderDashboard=()=>(
    <>
      {/* Welcome banner */}
      <div style={{background:"linear-gradient(135deg,rgba(79,142,247,.15),rgba(124,58,237,.12))",border:"1px solid rgba(79,142,247,.22)",borderRadius:18,padding:"22px 28px",marginBottom:24,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div>
          <h2 style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:24,marginBottom:6}}>Hi, {user.name.split(" ")[0]}! 👋</h2>
          <p style={{color:"#9aa5bc",fontSize:14}}>You're on a <span style={{color:"#f59e0b",fontWeight:700}}>7-day streak</span> — keep it up! Your next lesson is waiting.</p>
        </div>
        <div style={{display:"flex",gap:16}}>
          {[{e:"🔥",v:"7 DAYS",c:"#f59e0b"},{e:"⚡",v:"LVL 12",c:"#4f8ef7"},{e:"🏆",v:"TOP 5%",c:"#7c3aed"}].map((b,i)=>(
            <div key={i} style={{textAlign:"center",padding:"10px 14px",borderRadius:12,background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.07)"}}>
              <div style={{fontSize:26}}>{b.e}</div>
              <div style={{fontSize:10,color:b.c,fontFamily:"'JetBrains Mono',monospace",fontWeight:700,marginTop:2}}>{b.v}</div>
            </div>
          ))}
        </div>
      </div>

      {renderStatCards()}

      {/* Row 1: Line + Bar + Radar */}
      <div style={{display:"grid",gridTemplateColumns:"1.8fr 1.2fr 1fr",gap:16,marginBottom:20}}>
        <Section title="📈 Study & Quiz Trend" sub="Monthly overview" action={<Pill label="2024" color="#4f8ef7"/>}>
          <div style={{display:"flex",gap:14,marginBottom:10}}>
            {monthLine.datasets.map((ds,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:6}}>
                <div style={{width:10,height:3,borderRadius:99,background:ds.color}}/>
                <span style={{fontSize:10,color:"#9aa5bc",fontFamily:"'JetBrains Mono',monospace"}}>{ds.label}</span>
              </div>
            ))}
          </div>
          <LineChartSVG datasets={monthLine.datasets} height={110} labels={monthLine.labels}/>
        </Section>
        <Section title="📊 Weekly Activity" sub="Minutes per day" action={<Pill label="This Week" color="#7c3aed"/>}>
          <BarChartSVG data={weekData} height={100}/>
          <div style={{display:"flex",justifyContent:"space-between",marginTop:10}}>
            <div><div style={{fontSize:10,color:"#6b7a99"}}>Total</div><div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:16,color:"#4f8ef7"}}>420 min</div></div>
            <div style={{textAlign:"right"}}><div style={{fontSize:10,color:"#6b7a99"}}>Best</div><div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:16,color:"#10b981"}}>Sat 90m</div></div>
          </div>
        </Section>
        <Section title="🎯 Skill Radar" sub="Competency map">
          <div style={{display:"flex",justifyContent:"center"}}>
            <RadarChartSVG data={radarData} size={130}/>
          </div>
        </Section>
      </div>

      {/* Row 2: Area + Donut + Scatter */}
      <div style={{display:"grid",gridTemplateColumns:"1.4fr 1fr 1.2fr",gap:16,marginBottom:20}}>
        <Section title="🌊 XP Growth" sub="Cumulative learning progress">
          <AreaChartSVG data={studyArea} color="#4f8ef7" height={90}/>
          <div style={{display:"flex",justifyContent:"space-between",marginTop:8}}>
            <span style={{fontSize:11,color:"#6b7a99"}}>Started Jan 1</span>
            <span style={{fontSize:11,color:"#4f8ef7",fontWeight:700}}>+760% growth</span>
          </div>
        </Section>
        <Section title="🍩 Time Split" sub="How you spend study hours">
          <div style={{display:"flex",justifyContent:"center",marginBottom:12}}>
            <DonutChart segments={pieData} size={110} stroke={14} label="100%" sublabel="HOURS"/>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:7}}>
            {pieData.map((p,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:8}}>
                <div style={{width:8,height:8,borderRadius:"50%",background:p.color,flexShrink:0}}/>
                <span style={{fontSize:11,color:"#9aa5bc",flex:1}}>{p.label}</span>
                <span style={{fontSize:11,color:p.color,fontFamily:"'JetBrains Mono',monospace",fontWeight:700}}>{p.v}%</span>
              </div>
            ))}
          </div>
        </Section>
        <Section title="🔵 Score Scatter" sub="Distribution across sessions">
          <ScatterSVG data={scatterData} W={240} H={110}/>
          <div style={{display:"flex",justifyContent:"space-between",marginTop:8}}>
            <span style={{fontSize:10,color:"#6b7a99"}}>Session →</span>
            <span style={{fontSize:10,color:"#6b7a99"}}>Score ↑</span>
          </div>
        </Section>
      </div>

      {/* Course Completion Tracker */}
      <div style={{marginBottom:20}}>{renderCompletionTracker()}</div>

      {/* Row 3: Performance (empty) + Courses */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1.6fr",gap:16,marginBottom:20}}>
        <Section title="🚀 My Performance" sub="Linked to Quiz module — complete quizzes to see results" action={<Pill label="Coming Soon" color="#6b7a99"/>}>
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:200,gap:14}}>
            <div style={{fontSize:48,opacity:.25}}>🧠</div>
            <div style={{textAlign:"center",maxWidth:220}}>
              <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:15,marginBottom:6,color:"#f0f2f8"}}>No quiz data yet</div>
              <div style={{fontSize:12,color:"#6b7a99",lineHeight:1.7}}>Your quiz performance will appear here automatically once you complete quizzes in the Quiz module.</div>
            </div>
            <button onClick={()=>setActivePage("quiz")} style={{padding:"9px 20px",borderRadius:10,background:"linear-gradient(135deg,#4f8ef7,#7c3aed)",color:"#fff",border:"none",cursor:"pointer",fontSize:12,fontWeight:700}}>Go to Quizzes →</button>
          </div>
        </Section>
        <Section title="📚 My Courses" action={<span style={{fontSize:11,color:"#4f8ef7",cursor:"pointer",fontWeight:600}} onClick={()=>setActivePage("courses")}>View All →</span>}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            {courses.map((c,i)=>(
              <div key={i} style={{background:"#1e2130",borderRadius:13,padding:"14px 12px",cursor:"pointer",border:`1px solid ${c.color}22`,transition:"transform .2s,border-color .2s"}}
                onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.borderColor=c.color;}}
                onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.borderColor=`${c.color}22`;}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
                  <span style={{fontSize:22}}>{c.icon}</span>
                  <Pill label={c.tag} color={c.color}/>
                </div>
                <div style={{fontSize:13,fontWeight:700,marginBottom:2,lineHeight:1.3}}>{c.title}</div>
                <div style={{fontSize:10,color:"#6b7a99",marginBottom:8}}>Last: {c.lastLesson}</div>
                <div style={{height:3,borderRadius:99,background:"rgba(255,255,255,.07)",marginBottom:6}}>
                  <div style={{height:"100%",width:`${c.progress}%`,background:`linear-gradient(90deg,${c.color},${c.color}88)`,borderRadius:99}}/>
                </div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{fontSize:10,color:"#6b7a99"}}>{c.lessons}/{c.total}</span>
                  <button style={{padding:"3px 9px",borderRadius:7,border:`1px solid ${c.color}55`,background:`${c.color}18`,color:c.color,fontSize:9,fontWeight:700,cursor:"pointer"}} onClick={e=>{e.stopPropagation();setActivePage("courses");}}>
                    {c.progress===100?"Review":"Resume →"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Section>
      </div>

      {/* Row 4: Activity Timeline + Quiz Bar + Leaderboard */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1.2fr",gap:16,marginBottom:20}}>
        {renderActivityTimeline()}
        <Section title="📉 Quiz Score History" sub="Score per quiz attempt">
          <BarChartSVG data={quizHistory.map(q=>({l:q.label,v:q.score,c:q.score>=70?"#10b981":q.score>=40?"#f59e0b":"#f43f5e"}))} height={90}/>
          <div style={{display:"flex",gap:12,marginTop:10}}>
            {[{c:"#10b981",l:"≥70%"},{c:"#f59e0b",l:"40-69%"},{c:"#f43f5e",l:"<40%"}].map((x,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:4}}>
                <div style={{width:8,height:8,borderRadius:2,background:x.c}}/>
                <span style={{fontSize:10,color:"#6b7a99"}}>{x.l}</span>
              </div>
            ))}
          </div>
        </Section>
        <Section title="🏅 Leaderboard" sub="Top learners this week" action={<span style={{fontSize:11,color:"#4f8ef7",cursor:"pointer",fontWeight:600}}>See All →</span>}>
          {[
            {rank:1,name:"Priya Sharma",xp:"9,820",badge:"🥇",you:false},
            {rank:2,name:"Arjun Mehta",xp:"8,540",badge:"🥈",you:false},
            {rank:3,name:"Rahul Gupta",xp:"7,920",badge:"🥉",you:false},
            {rank:4,name:user.name,xp:"3,840",badge:"4",you:true},
            {rank:5,name:"Sneha Patel",xp:"3,210",badge:"5",you:false},
          ].map((l,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 10px",borderRadius:10,background:l.you?"rgba(79,142,247,.1)":"transparent",border:l.you?"1px solid rgba(79,142,247,.25)":"1px solid transparent",marginBottom:4}}>
              <div style={{width:20,textAlign:"center",fontSize:l.rank<=3?15:12,fontWeight:700}}>{l.badge}</div>
              <Ava name={l.name} size={28}/>
              <div style={{flex:1,fontSize:12,fontWeight:l.you?700:500,color:l.you?"#4f8ef7":"#f0f2f8"}}>{l.name}{l.you?" (You)":""}</div>
              <div style={{fontSize:11,fontWeight:700,color:l.you?"#4f8ef7":"#6b7a99",fontFamily:"'JetBrains Mono',monospace"}}>{l.xp} XP</div>
            </div>
          ))}
        </Section>
      </div>
    </>
  );

  const renderRoadmap=()=>(
    <Section title="🗺️ Learning Roadmap" sub="Your personalized Full-Stack Developer path">
      <div style={{position:"relative",paddingLeft:28}}>
        <div style={{position:"absolute",left:11,top:8,bottom:8,width:2,background:"rgba(255,255,255,.08)",borderRadius:99}}/>
        {roadmapSteps.map((s,i)=>(
          <div key={i} style={{position:"relative",marginBottom:20}}>
            <div style={{position:"absolute",left:-28,top:4,width:16,height:16,borderRadius:"50%",background:s.done?"#10b981":s.active?"#4f8ef7":"#252836",border:`2px solid ${s.done?"#10b981":s.active?"#4f8ef7":"rgba(255,255,255,.12)"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:"#fff",zIndex:1}}>
              {s.done?"✓":s.active?"▶":""}
            </div>
            <div style={{background:s.active?"rgba(79,142,247,.08)":"#1e2130",border:`1px solid ${s.active?"rgba(79,142,247,.3)":s.done?"rgba(16,185,129,.2)":"rgba(255,255,255,.06)"}`,borderRadius:12,padding:"14px 16px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:s.active?8:4}}>
                <div style={{fontSize:14,fontWeight:700,color:s.done?"#10b981":s.active?"#f0f2f8":"#6b7a99"}}>{s.title}</div>
                <Pill label={s.done?"Completed":s.active?"In Progress":"Upcoming"} color={s.done?"#10b981":s.active?"#4f8ef7":"#6b7a99"}/>
              </div>
              <div style={{fontSize:11,color:"#6b7a99",marginBottom:s.active?8:0}}>{s.desc}</div>
              {s.active && (
                <>
                  <div style={{height:4,borderRadius:99,background:"rgba(255,255,255,.07)",marginBottom:4}}>
                    <div style={{height:"100%",width:`${s.progress}%`,background:"linear-gradient(90deg,#4f8ef7,#7c3aed)",borderRadius:99}}/>
                  </div>
                  <div style={{fontSize:11,color:"#6b7a99"}}>{s.progress}% complete</div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );

  const renderSandbox=()=>(
    <Section title="💻 Live Sandbox" sub="Write and run JavaScript — no setup needed">
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <span style={{fontSize:12,color:"#6b7a99",fontFamily:"'JetBrains Mono',monospace"}}>editor.js</span>
            <button onClick={runSandbox} disabled={sandboxRunning} style={{padding:"6px 16px",borderRadius:8,background:"linear-gradient(135deg,#4f8ef7,#7c3aed)",color:"#fff",border:"none",cursor:sandboxRunning?"default":"pointer",fontSize:12,fontWeight:700,display:"flex",alignItems:"center",gap:6,opacity:sandboxRunning?.7:1}}>
              {sandboxRunning?<><span style={{animation:"spin .7s linear infinite",display:"inline-block"}}>⟳</span> Running…</>:"▶ Run Code"}
            </button>
          </div>
          <textarea value={sandboxCode} onChange={e=>setSandboxCode(e.target.value)} style={{width:"100%",height:280,background:"#0f1117",border:"1px solid rgba(255,255,255,.1)",borderRadius:12,padding:"16px",color:"#f0f2f8",fontFamily:"'JetBrains Mono',monospace",fontSize:13,lineHeight:1.8,resize:"vertical",outline:"none"}} spellCheck={false}/>
          <div style={{marginTop:8,display:"flex",gap:8}}>
            {[["Hello World","console.log('Hello from Skillio! 🚀');"],["Math Fun","const s=[1,2,3,4,5].reduce((a,b)=>a+b,0);\nconsole.log('Sum:',s,'Avg:',s/5);"],["Arrays","['React','Python','DevOps'].forEach((c,i)=>console.log(i+1+'. '+c));"]].map(([label,code],i)=>(
              <button key={i} onClick={()=>setSandboxCode(code)} style={{padding:"4px 10px",borderRadius:7,border:"1px solid rgba(255,255,255,.1)",background:"#1e2130",color:"#9aa5bc",fontSize:10,cursor:"pointer",fontFamily:"'JetBrains Mono',monospace"}}>{label}</button>
            ))}
          </div>
        </div>
        <div>
          <div style={{fontSize:12,color:"#6b7a99",fontFamily:"'JetBrains Mono',monospace",marginBottom:8}}>output.log</div>
          <div style={{height:280,background:"#0f1117",border:"1px solid rgba(255,255,255,.1)",borderRadius:12,padding:"16px",overflowY:"auto",fontFamily:"'JetBrains Mono',monospace",fontSize:13}}>
            {sandboxOutput.length===0
              ? <span style={{color:"rgba(255,255,255,.2)"}}>// Output will appear here…</span>
              : sandboxOutput.map((log,i)=>(
                <div key={i} style={{color:log.type==="error"?"#f43f5e":"#10b981",marginBottom:4,display:"flex",gap:8}}>
                  <span style={{color:"rgba(255,255,255,.2)"}}>&gt;</span><span>{log.msg}</span>
                </div>
              ))
            }
          </div>
          <div style={{marginTop:12,padding:"12px 14px",borderRadius:10,background:"rgba(79,142,247,.07)",border:"1px solid rgba(79,142,247,.15)",fontSize:12,color:"#6b7a99",lineHeight:1.7}}>
            💡 <strong style={{color:"#4f8ef7"}}>Tip:</strong> Practice concepts from your courses directly here!
          </div>
        </div>
      </div>
    </Section>
  );

  const renderCourses=()=>{
    const COURSE_LESSONS = {
      "React Mastery": [
        {id:"r1",title:"JSX & Component Basics",dur:"12:34",vid:"Tn6-PIqc4UM",done:true,  desc:"Learn JSX syntax and how to build your first React component from scratch."},
        {id:"r2",title:"Props & State Fundamentals",dur:"18:22",vid:"IYvD9oBCuJI",done:true,  desc:"Understand how props flow down and how state drives UI updates."},
        {id:"r3",title:"useState & useEffect Hooks",dur:"24:10",vid:"O6P86uwfdR0",done:true,  desc:"Master the two most important React hooks for side effects and state."},
        {id:"r4",title:"Custom Hooks Deep Dive",dur:"21:45",vid:"6ThXsUwLWvc",done:true,  desc:"Build reusable logic with your own custom hooks."},
        {id:"r5",title:"useMemo & useCallback",dur:"16:30",vid:"_AyFblegDkI",done:false, desc:"Optimise re-renders using memoisation techniques."},
        {id:"r6",title:"Context API",dur:"19:18",vid:"5LrDIWkK_Bc",done:false, desc:"Share state globally without prop-drilling using React Context."},
        {id:"r7",title:"Redux Toolkit",dur:"28:55",vid:"bbkBuqC1rU4",done:false, desc:"Manage complex global state with Redux Toolkit and slices."},
        {id:"r8",title:"React Router v6",dur:"22:14",vid:"Ul3y1LXxzdU",done:false, desc:"Client-side navigation with nested routes and loaders."},
        {id:"r9",title:"Testing with Jest & RTL",dur:"30:00",vid:"8Xwq35cPwYg",done:false, desc:"Write unit and integration tests for your React components."},
        {id:"r10",title:"Deploying to Vercel",dur:"11:22",vid:"2HBIzEx6IZA",done:false, desc:"Deploy your React app to production in minutes."},
      ],
      "Python for AI": [
        {id:"p1",title:"NumPy Arrays & Operations",dur:"20:10",vid:"QUT1VHiLmmI",done:true,  desc:"Work with n-dimensional arrays for numerical computing."},
        {id:"p2",title:"Pandas DataFrames",dur:"25:30",vid:"vmEHCJofslg",done:true,  desc:"Load, clean, and manipulate tabular data with Pandas."},
        {id:"p3",title:"Matplotlib Visualisation",dur:"18:45",vid:"3Xc3CA655Y4",done:false, desc:"Create plots, histograms, and heatmaps for data insights."},
        {id:"p4",title:"Scikit-Learn Basics",dur:"22:00",vid:"0Lt9w8BxKbY",done:false, desc:"Train your first ML model with scikit-learn's simple API."},
        {id:"p5",title:"Neural Networks from Scratch",dur:"35:20",vid:"aircAruvnKk",done:false, desc:"Build a neural network without any framework to understand the maths."},
        {id:"p6",title:"CNN Architecture",dur:"28:14",vid:"zfiSAzpy9NM",done:false, desc:"Convolutional Neural Networks for image recognition tasks."},
        {id:"p7",title:"Transfer Learning",dur:"24:55",vid:"LsdxvjLWkIY",done:false, desc:"Fine-tune pre-trained models like ResNet and VGG."},
        {id:"p8",title:"LSTM & Sequence Models",dur:"31:10",vid:"YCzL96nL7j0",done:false, desc:"Recurrent networks for time-series and NLP data."},
        {id:"p9",title:"Transformers & Attention",dur:"40:00",vid:"4Bdc55j80l8",done:false, desc:"Understand the architecture that powers modern AI."},
        {id:"p10",title:"Deploy ML API with FastAPI",dur:"26:18",vid:"7t2alSnE2-I",done:false, desc:"Serve your model as a REST API using FastAPI and Docker."},
      ],
      "UX Design Pro": [
        {id:"u1",title:"Design Thinking Process",dur:"14:20",vid:"a7sEoEvT8l8",done:true,  desc:"The 5-stage design thinking framework explained with examples."},
        {id:"u2",title:"User Research Methods",dur:"19:45",vid:"7_sFVYfatXY",done:true,  desc:"Interviews, surveys, and usability testing to understand users."},
        {id:"u3",title:"Information Architecture",dur:"16:30",vid:"Pio-kWgbBo4",done:true,  desc:"Organise content and navigation for intuitive user flows."},
        {id:"u4",title:"Wireframing in Figma",dur:"22:10",vid:"FTFaQWZBqQ8",done:true,  desc:"Create low-fidelity wireframes quickly in Figma."},
        {id:"u5",title:"Prototyping & Interactions",dur:"25:00",vid:"PfNMNbNFCyM",done:true,  desc:"Link frames and add micro-interactions for realistic prototypes."},
        {id:"u6",title:"Design Systems",dur:"28:35",vid:"EK-pHkc5EL4",done:true,  desc:"Build scalable component libraries with Figma variables."},
        {id:"u7",title:"Usability Testing",dur:"17:50",vid:"RBm3f0HVq1c",done:true,  desc:"Run moderated tests and analyse results to iterate designs."},
        {id:"u8",title:"Accessibility (WCAG)",dur:"20:22",vid:"ao2TRWZE99o",done:true,  desc:"Make your designs inclusive for all users."},
      ],
      "Cloud DevOps": [
        {id:"c1",title:"Linux Command Line Basics",dur:"16:40",vid:"ZtqBQ68cfJc",done:true,  desc:"Navigating files, permissions, and processes in Linux."},
        {id:"c2",title:"Git & GitHub Workflow",dur:"20:15",vid:"RGOj5yH7evk",done:true,  desc:"Branching, merging, pull requests, and GitHub Actions basics."},
        {id:"c3",title:"Docker Fundamentals",dur:"24:30",vid:"fqMOX6JJhGo",done:false, desc:"Containers, images, volumes, and Docker Compose."},
        {id:"c4",title:"Docker Networking",dur:"18:00",vid:"bKFMS5C4CG0",done:false, desc:"Bridge, overlay, and host networks explained."},
        {id:"c5",title:"CI/CD with GitHub Actions",dur:"22:55",vid:"R8_veQiYBjI",done:false, desc:"Automate build, test, and deploy pipelines."},
        {id:"c6",title:"Kubernetes Intro",dur:"30:10",vid:"s_o8dwzRlu4",done:false, desc:"Pods, deployments, services, and kubectl commands."},
        {id:"c7",title:"Helm Charts",dur:"19:45",vid:"fy8SHvNZGeE",done:false, desc:"Package and deploy Kubernetes applications with Helm."},
        {id:"c8",title:"Terraform Basics",dur:"26:20",vid:"SLB_c_ayRMo",done:false, desc:"Infrastructure as code to provision cloud resources."},
        {id:"c9",title:"AWS ECS & EKS",dur:"34:00",vid:"I9VAMGEjW_o",done:false, desc:"Deploy containerised apps on Amazon's managed services."},
        {id:"c10",title:"Monitoring with Prometheus",dur:"21:35",vid:"h4Sl21AKiDg",done:false, desc:"Set up metrics collection and Grafana dashboards."},
      ],
      "Cybersecurity 101": [
        {id:"s1",title:"Networking Fundamentals",dur:"18:20",vid:"qiQR5rTSshw",done:true,  desc:"OSI model, TCP/IP, DNS, and how the internet works."},
        {id:"s2",title:"Linux for Hackers",dur:"22:10",vid:"lZAoFs75_cs",done:true,  desc:"Essential Linux skills for security professionals."},
        {id:"s3",title:"OWASP Top 10 Explained",dur:"25:45",vid:"ravv3p3OyxI",done:true,  desc:"The 10 most critical web application security risks."},
        {id:"s4",title:"SQL Injection Lab",dur:"19:30",vid:"ciNHn38EyRU",done:true,  desc:"Hands-on exploitation and mitigation of SQLi vulnerabilities."},
        {id:"s5",title:"XSS & CSRF Attacks",dur:"21:15",vid:"EoaDgUgS6QA",done:false, desc:"Cross-site scripting and request forgery with real demos."},
        {id:"s6",title:"Pen Testing with Kali",dur:"32:00",vid:"3Kq1MIfTWCE",done:false, desc:"Set up Kali Linux and run your first penetration test."},
        {id:"s7",title:"Burp Suite Basics",dur:"27:40",vid:"G3hpAeoZ4ek",done:false, desc:"Intercept, modify, and replay HTTP requests."},
        {id:"s8",title:"Incident Response",dur:"20:55",vid:"Ne8F1cBL5cc",done:false, desc:"Detection, containment, and recovery from security incidents."},
      ],
      "Data Analytics": [
        {id:"d1",title:"Intro to Data Analytics",dur:"15:10",vid:"yZvFH7B6gKI",done:true,  desc:"What data analysts do and the tools of the trade."},
        {id:"d2",title:"Pandas Advanced Operations",dur:"26:30",vid:"2uvysYbKdjM",done:false, desc:"GroupBy, pivot tables, merge, and time-series indexing."},
        {id:"d3",title:"Seaborn Visualisation",dur:"20:45",vid:"6GUZXDef2X0",done:false, desc:"Statistical plots, pair plots, and heatmaps with Seaborn."},
        {id:"d4",title:"Feature Engineering",dur:"24:00",vid:"ZbE8jZ_4h7I",done:false, desc:"Creating, selecting, and transforming features for ML."},
        {id:"d5",title:"ML Model Evaluation",dur:"22:15",vid:"LbX4X71-TFI",done:false, desc:"Cross-validation, confusion matrix, ROC curves."},
        {id:"d6",title:"NLP with spaCy",dur:"28:40",vid:"dIUTsFT2MeQ",done:false, desc:"Natural language processing pipelines for text data."},
        {id:"d7",title:"Time Series with ARIMA",dur:"30:10",vid:"e8Yw4alG16Q",done:false, desc:"Stationarity, ACF/PACF, and ARIMA model fitting."},
        {id:"d8",title:"Dashboard with Plotly Dash",dur:"25:55",vid:"hSPmj7mK6ng",done:false, desc:"Build interactive web dashboards in pure Python."},
      ],
    };

    const lessonsByCourse = (title) => COURSE_LESSONS[title] || [];

    const toggleLesson = (courseTitle, lessonId) => {
      const key = `${courseTitle}__${lessonId}`;
      setCompletedLessons(prev => ({...prev, [key]: !prev[key]}));
    };

    const isLessonDone = (courseTitle, lesson) => {
      const key = `${courseTitle}__${lesson.id}`;
      return completedLessons.hasOwnProperty(key) ? completedLessons[key] : lesson.done;
    };

    // ── Full-screen lesson player
    if (activeLesson && activeCourse) {
      const lessons = lessonsByCourse(activeCourse.title);
      const idx = lessons.findIndex(l => l.id === activeLesson.id);
      const prev = lessons[idx-1] || null;
      const next = lessons[idx+1] || null;
      const done = isLessonDone(activeCourse.title, activeLesson);
      const completed = lessons.filter(l => isLessonDone(activeCourse.title, l)).length;
      const ytUrl = `https://www.youtube.com/watch?v=${activeLesson.vid}`;
      const INSIGHTS = {
        "r1":"JSX is syntactic sugar for React.createElement — browsers never see JSX directly.",
        "r2":"Props flow down, events bubble up. Never mutate props.",
        "r3":"useEffect cleanup function prevents memory leaks on unmount.",
        "r4":"Custom hooks let you extract stateful logic without changing component hierarchy.",
        "r5":"useMemo caches computed values; useCallback caches function references.",
        "r6":"Context re-renders every consumer when value changes — use selectors to optimise.",
        "r7":"Redux Toolkit eliminates boilerplate — use createSlice for reducers and actions.",
        "r8":"React Router v6 uses relative routes — no more exact prop needed.",
        "r9":"Test behaviour, not implementation. RTL renders like a real browser.",
        "r10":"Vercel zero-config deploys detect React apps automatically via framework preset.",
        "p1":"NumPy operations are vectorised C code — 100x faster than Python loops.",
        "p2":"Always reset the index after filtering a DataFrame to avoid index gaps.",
        "p3":"Use plt.tight_layout() to prevent subplot labels from overlapping.",
        "p4":"Fit on training data only — never fit_transform on test data.",
        "p5":"Backpropagation is just the chain rule applied to a computation graph.",
        "p6":"Convolutional layers learn spatial hierarchies — edges then shapes then objects.",
        "p7":"Freeze base layers first, then unfreeze top layers for fine-tuning.",
        "p8":"LSTMs solve vanishing gradients via the cell state highway.",
        "p9":"Attention scores tell the model which tokens to focus on at each step.",
        "p10":"FastAPI generates OpenAPI docs automatically — visit /docs after launch.",
        "u1":"Never skip the empathise stage — assumptions kill good UX.",
        "u2":"5 users reveal 85% of usability issues — you don't need hundreds.",
        "u3":"Card sorting reveals users' mental models better than stakeholder guesses.",
        "u4":"Wireframes should be rough enough that stakeholders critique structure, not colour.",
        "u5":"Prototype the riskiest assumption first — not the easiest screen.",
        "u6":"Design tokens are the single source of truth between design and code.",
        "u7":"Think-aloud protocol reveals what users expect, not just what they do.",
        "u8":"WCAG AA requires 4.5:1 contrast ratio for normal text.",
        "c1":"Everything in Linux is a file — even devices and network sockets.",
        "c2":"Git rebase rewrites history — never rebase public/shared branches.",
        "c3":"Docker layers are cached — put infrequently changed instructions first.",
        "c4":"Bridge networks are isolated per host; overlay networks span multiple hosts.",
        "c5":"Fail fast in CI — run lint and unit tests before integration tests.",
        "c6":"Kubernetes self-heals — if a pod crashes, the controller creates a new one.",
        "c7":"Helm values.yaml is the single config file that overrides chart defaults.",
        "c8":"Terraform state is the source of truth — protect it with remote backends.",
        "c9":"ECS is simpler; EKS gives you full Kubernetes control. Choose based on team skills.",
        "c10":"Prometheus scrapes metrics by pulling — not pushing — from targets.",
        "s1":"The OSI model is a conceptual framework; TCP/IP is what the internet actually uses.",
        "s2":"sudo gives temporary root access — prefer specific permissions over blanket sudo.",
        "s3":"Injection flaws top OWASP because they're easy to find and catastrophic to exploit.",
        "s4":"Parameterised queries are the only true defence against SQL injection.",
        "s5":"XSS injects scripts into trusted sites; CSRF tricks authenticated users into actions.",
        "s6":"Reconnaissance is 80% of penetration testing — know before you attack.",
        "s7":"Burp Intruder automates fuzzing — invaluable for finding hidden parameters.",
        "s8":"First 15 minutes of incident response determine containment success.",
        "d1":"Data analysts answer 'what happened'; data scientists answer 'what will happen'.",
        "d2":"GroupBy + agg({}) lets you apply different aggregations to different columns at once.",
        "d3":"Seaborn's pairplot reveals correlations between all numeric variables instantly.",
        "d4":"Feature engineering is where domain knowledge beats algorithmic sophistication.",
        "d5":"Cross-validation gives a less optimistic accuracy estimate than a single train-test split.",
        "d6":"spaCy's pipeline processes text in one pass — far faster than sequential calls.",
        "d7":"Stationarity is the prerequisite for ARIMA — always test with ADF first.",
        "d8":"Plotly Dash callbacks are reactive — output values update when input values change.",
      };
      const insight = INSIGHTS[activeLesson.id] || "Focus on understanding the 'why' before memorising the 'how'.";
      return (
        <div style={{display:"flex",flexDirection:"column",gap:0,background:"#0f1117",borderRadius:16,overflow:"hidden",border:"1px solid rgba(255,255,255,.07)"}}>
          {/* Top nav bar */}
          <div style={{display:"flex",alignItems:"center",gap:12,padding:"13px 20px",background:"#13151d",borderBottom:"1px solid rgba(255,255,255,.08)"}}>
            <button onClick={()=>setActiveLesson(null)} style={{background:"rgba(255,255,255,.07)",border:"none",color:"#9aa5bc",cursor:"pointer",padding:"7px 14px",borderRadius:8,fontSize:12,fontWeight:700}}>← Back</button>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:10,color:"#6b7a99",fontFamily:"'JetBrains Mono',monospace",marginBottom:1}}>Lesson {idx+1} of {lessons.length} · {activeCourse.icon} {activeCourse.title}</div>
              <div style={{fontSize:15,fontWeight:700,color:"#f0f2f8",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{activeLesson.title}</div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
              <span style={{padding:"5px 12px",borderRadius:99,background:"rgba(245,158,11,.18)",border:"1px solid rgba(245,158,11,.4)",color:"#f59e0b",fontSize:11,fontWeight:700}}>Intermediate</span>
              <span style={{padding:"5px 12px",borderRadius:99,background:done?"rgba(16,185,129,.18)":"rgba(255,255,255,.07)",border:`1px solid ${done?"#10b981":"rgba(255,255,255,.15)"}`,color:done?"#10b981":"#9aa5bc",fontSize:11,fontWeight:700}}>{done?"✓ Done":`${Math.round(completed/lessons.length*100)}%`}</span>
              <button onClick={()=>prev&&setActiveLesson(prev)} disabled={!prev} style={{padding:"6px 12px",borderRadius:8,background:prev?"rgba(255,255,255,.07)":"transparent",border:"none",color:prev?"#9aa5bc":"#3a4055",cursor:prev?"pointer":"default",fontSize:12,fontWeight:700}}>‹</button>
              <button onClick={()=>next&&setActiveLesson(next)} disabled={!next} style={{padding:"6px 12px",borderRadius:8,background:next?"rgba(255,255,255,.07)":"transparent",border:"none",color:next?"#9aa5bc":"#3a4055",cursor:next?"pointer":"default",fontSize:12,fontWeight:700}}>›</button>
            </div>
          </div>

          <div style={{display:"grid",gridTemplateColumns:"1fr 300px",minHeight:0}}>
            {/* Left: video + info */}
            <div style={{display:"flex",flexDirection:"column",background:"#0f1117"}}>
              <VideoPlayer key={activeLesson.vid} vid={activeLesson.vid} title={activeLesson.title} dur={activeLesson.dur}/>

              {/* Take Quiz CTA */}
              <div style={{padding:"16px 20px 0",display:"flex",justifyContent:"center"}}>
                <button style={{display:"flex",alignItems:"center",gap:10,padding:"12px 28px",borderRadius:12,background:"linear-gradient(135deg,#4f8ef7,#7c3aed)",color:"#fff",border:"none",cursor:"pointer",fontSize:13,fontWeight:700,boxShadow:"0 4px 20px rgba(79,142,247,.4)",width:"100%",justifyContent:"center"}}>
                  <span style={{fontSize:18}}>🤖</span> Take AI Quiz from this Video
                </button>
              </div>

              {/* Key Insight */}
              <div style={{margin:"16px 20px",padding:"16px 18px",borderRadius:12,background:"rgba(79,142,247,.08)",border:"1px solid rgba(79,142,247,.22)"}}>
                <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:8}}>
                  <span style={{fontSize:14}}>📌</span>
                  <span style={{fontSize:11,fontWeight:800,color:"#4f8ef7",fontFamily:"'JetBrains Mono',monospace",letterSpacing:".08em"}}>KEY INSIGHT</span>
                </div>
                <p style={{fontSize:13,color:"#9aa5bc",lineHeight:1.75,margin:0}}>{insight}</p>
              </div>

              {/* Info row */}
              <div style={{padding:"0 20px 20px",display:"flex",gap:10,flexWrap:"wrap"}}>
                <div style={{padding:"8px 14px",borderRadius:10,background:`${activeCourse.color}14`,border:`1px solid ${activeCourse.color}33`,fontSize:12,color:activeCourse.color,fontWeight:600}}>{activeCourse.icon} {activeCourse.title}</div>
                <div style={{padding:"8px 14px",borderRadius:10,background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.07)",fontSize:12,color:"#6b7a99"}}>Lesson {idx+1} / {lessons.length}</div>
                <div style={{padding:"8px 14px",borderRadius:10,background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.07)",fontSize:12,color:"#6b7a99"}}>{completed}/{lessons.length} done</div>
                <div style={{marginLeft:"auto",display:"flex",gap:8}}>
                  <button onClick={()=>toggleLesson(activeCourse.title,activeLesson)} style={{padding:"8px 16px",borderRadius:10,background:done?"rgba(16,185,129,.18)":"rgba(79,142,247,.15)",border:`1px solid ${done?"#10b981":"#4f8ef7"}`,color:done?"#10b981":"#4f8ef7",cursor:"pointer",fontSize:12,fontWeight:700}}>
                    {done?"✓ Completed":"Mark Complete"}
                  </button>
                  <a href={ytUrl} target="_blank" rel="noreferrer" style={{padding:"8px 14px",borderRadius:10,background:"rgba(255,0,0,.15)",border:"1px solid rgba(255,0,0,.35)",color:"#ff4444",cursor:"pointer",fontSize:12,fontWeight:700,textDecoration:"none",display:"flex",alignItems:"center",gap:5}}>
                    <span>▶</span> YouTube
                  </a>
                </div>
              </div>
            </div>

            {/* Right: lesson sidebar */}
            <div style={{background:"#13151d",borderLeft:"1px solid rgba(255,255,255,.07)",overflowY:"auto",maxHeight:"82vh",display:"flex",flexDirection:"column"}}>
              <div style={{padding:"14px 14px 12px",borderBottom:"1px solid rgba(255,255,255,.07)",flexShrink:0}}>
                <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:13,marginBottom:8}}>Course Lessons</div>
                <div style={{height:4,borderRadius:99,background:"rgba(255,255,255,.07)"}}>
                  <div style={{height:"100%",width:`${Math.round(completed/lessons.length*100)}%`,background:`linear-gradient(90deg,${activeCourse.color},${activeCourse.color}99)`,borderRadius:99,transition:"width .6s ease"}}/>
                </div>
                <div style={{fontSize:10,color:"#6b7a99",marginTop:5,fontFamily:"'JetBrains Mono',monospace"}}>{completed}/{lessons.length} done · {Math.round(completed/lessons.length*100)}%</div>
              </div>
              {lessons.map((l,j)=>{
                const isActive=l.id===activeLesson.id;
                const isDone=isLessonDone(activeCourse.title,l);
                return (
                  <div key={l.id} onClick={()=>{setActiveLesson(l);}}
                    style={{padding:"11px 13px",borderBottom:"1px solid rgba(255,255,255,.04)",cursor:"pointer",
                      background:isActive?`${activeCourse.color}14`:"transparent",
                      borderLeft:`3px solid ${isActive?activeCourse.color:"transparent"}`,transition:"background .15s"}}
                    onMouseEnter={e=>{if(!isActive)e.currentTarget.style.background="rgba(255,255,255,.03)";}}
                    onMouseLeave={e=>{if(!isActive)e.currentTarget.style.background="transparent";}}>
                    <div style={{display:"flex",gap:9,alignItems:"center"}}>
                      <div style={{width:20,height:20,borderRadius:"50%",flexShrink:0,background:isDone?"rgba(16,185,129,.2)":isActive?`${activeCourse.color}22`:"rgba(255,255,255,.06)",border:`1.5px solid ${isDone?"#10b981":isActive?activeCourse.color:"rgba(255,255,255,.1)"}`,display:"flex",alignItems:"center",justifyContent:"center"}}>
                        {isDone?<span style={{fontSize:9,color:"#10b981",fontWeight:900}}>✓</span>:<span style={{fontSize:8,color:isActive?activeCourse.color:"#6b7a99",fontFamily:"'JetBrains Mono',monospace",fontWeight:700}}>{j+1}</span>}
                      </div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:11,fontWeight:isActive?700:500,color:isActive?"#f0f2f8":isDone?"#6b7a99":"#c0c9d9",lineHeight:1.4,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{l.title}</div>
                        <div style={{fontSize:9,color:"#56637a",fontFamily:"'JetBrains Mono',monospace",marginTop:1}}>⏱ {l.dur}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      );
    }

    // ── Course detail view (lesson list)
    if (activeCourse) {
      const lessons = lessonsByCourse(activeCourse.title);
      const completed = lessons.filter(l => isLessonDone(activeCourse.title, l)).length;
      const pct = lessons.length ? Math.round(completed/lessons.length*100) : 0;
      return (
        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          {/* Back + header */}
          <div style={{display:"flex",alignItems:"center",gap:14}}>
            <button onClick={()=>setActiveCourse(null)} style={{padding:"8px 16px",borderRadius:10,background:"rgba(255,255,255,.06)",border:"none",color:"#9aa5bc",cursor:"pointer",fontSize:12,fontWeight:700}}>← All Courses</button>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <span style={{fontSize:32}}>{activeCourse.icon}</span>
              <div>
                <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:20,color:"#f0f2f8"}}>{activeCourse.title}</div>
                <div style={{fontSize:12,color:"#6b7a99"}}>{completed}/{lessons.length} lessons complete · {activeCourse.xp} XP</div>
              </div>
            </div>
            <Pill label={activeCourse.tag} color={activeCourse.color}/>
          </div>

          {/* Progress bar */}
          <div style={{background:"#16181f",border:`1px solid ${activeCourse.color}22`,borderRadius:14,padding:"18px 20px"}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
              <span style={{fontSize:13,color:"#9aa5bc"}}>Overall Progress</span>
              <span style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:16,color:activeCourse.color}}>{pct}%</span>
            </div>
            <div style={{height:8,borderRadius:99,background:"rgba(255,255,255,.07)"}}>
              <div style={{height:"100%",width:`${pct}%`,background:`linear-gradient(90deg,${activeCourse.color},${activeCourse.color}99)`,borderRadius:99,transition:"width 1s ease"}}/>
            </div>
            <div style={{display:"flex",gap:16,marginTop:12}}>
              {[{l:"Total Lessons",v:lessons.length},{l:"Completed",v:completed},{l:"Remaining",v:lessons.length-completed},{l:"XP Earned",v:activeCourse.xp}].map((s,i)=>(
                <div key={i} style={{flex:1,textAlign:"center",padding:"10px",borderRadius:10,background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.06)"}}>
                  <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:18,color:activeCourse.color}}>{s.v}</div>
                  <div style={{fontSize:10,color:"#6b7a99",fontFamily:"'JetBrains Mono',monospace",textTransform:"uppercase",letterSpacing:".04em"}}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Lesson list */}
          <div style={{background:"#16181f",border:"1px solid rgba(255,255,255,.07)",borderRadius:14,overflow:"hidden"}}>
            <div style={{padding:"16px 20px",borderBottom:"1px solid rgba(255,255,255,.07)",fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:15}}>📖 Lessons</div>
            {lessons.map((l,j)=>{
              const isDone=isLessonDone(activeCourse.title,l);
              return (
                <div key={l.id}
                  style={{display:"flex",gap:14,alignItems:"center",padding:"14px 20px",borderBottom:"1px solid rgba(255,255,255,.04)",transition:"background .15s",cursor:"pointer"}}
                  onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,.025)"}
                  onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  {/* Number / check */}
                  <div style={{width:34,height:34,borderRadius:"50%",flexShrink:0,background:isDone?"rgba(16,185,129,.18)":`${activeCourse.color}14`,border:`2px solid ${isDone?"#10b981":activeCourse.color+"44"}`,display:"flex",alignItems:"center",justifyContent:"center"}}>
                    {isDone
                      ? <span style={{fontSize:14,color:"#10b981",fontWeight:800}}>✓</span>
                      : <span style={{fontSize:12,fontWeight:800,color:activeCourse.color,fontFamily:"'Syne',sans-serif"}}>{j+1}</span>
                    }
                  </div>
                  {/* Thumbnail */}
                  <div style={{width:88,height:50,borderRadius:8,overflow:"hidden",flexShrink:0,background:"#0f1117",position:"relative",cursor:"pointer"}} onClick={()=>setActiveLesson(l)}>
                    <img src={`https://img.youtube.com/vi/${l.vid}/mqdefault.jpg`} alt={l.title}
                      style={{width:"100%",height:"100%",objectFit:"cover",opacity:.85}}
                      onError={e=>{e.target.src=`https://img.youtube.com/vi/${l.vid}/hqdefault.jpg`;}}
                    />
                    <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,.28)"}}>
                      <div style={{width:22,height:22,borderRadius:"50%",background:"#ff0000",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 2px 8px rgba(255,0,0,.5)"}}>
                        <div style={{width:0,height:0,borderTop:"5px solid transparent",borderBottom:"5px solid transparent",borderLeft:"8px solid #fff",marginLeft:2}}/>
                      </div>
                    </div>
                  </div>
                  {/* Info */}
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:14,fontWeight:700,color:isDone?"#9aa5bc":"#f0f2f8",marginBottom:4,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{l.title}</div>
                    <div style={{fontSize:12,color:"#6b7a99",lineHeight:1.5,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{l.desc}</div>
                  </div>
                  {/* Duration + actions */}
                  <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
                    <span style={{fontSize:11,color:"#6b7a99",fontFamily:"'JetBrains Mono',monospace"}}>⏱ {l.dur}</span>
                    <button onClick={e=>{e.stopPropagation();toggleLesson(activeCourse.title,l);}}
                      style={{padding:"5px 12px",borderRadius:8,background:isDone?"rgba(16,185,129,.15)":"rgba(255,255,255,.06)",border:`1px solid ${isDone?"#10b981":"rgba(255,255,255,.1)"}`,color:isDone?"#10b981":"#9aa5bc",cursor:"pointer",fontSize:11,fontWeight:700,transition:"all .2s"}}>
                      {isDone?"✓ Done":"Mark Done"}
                    </button>
                    <button onClick={()=>setActiveLesson(l)}
                      style={{padding:"5px 14px",borderRadius:8,background:`linear-gradient(135deg,${activeCourse.color},${activeCourse.color}99)`,border:"none",color:"#fff",cursor:"pointer",fontSize:11,fontWeight:700}}>
                      ▶ Watch
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    // ── Course grid (default)
    return (
      <div style={{display:"flex",flexDirection:"column",gap:16}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16}}>
          {courses.map((c,i)=>{
            const lessons=lessonsByCourse(c.title);
            const completed=lessons.filter(l=>isLessonDone(c.title,l)).length;
            const pct=lessons.length?Math.round(completed/lessons.length*100):c.progress;
            return (
              <div key={i} style={{background:"#1e2130",borderRadius:14,padding:"20px",border:`1px solid ${c.color}22`,transition:"transform .2s,border-color .2s,box-shadow .2s",cursor:"pointer"}}
                onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.borderColor=c.color;e.currentTarget.style.boxShadow=`0 8px 32px ${c.color}22`;}}
                onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.borderColor=`${c.color}22`;e.currentTarget.style.boxShadow="none";}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                  <span style={{fontSize:30}}>{c.icon}</span>
                  <Pill label={c.tag} color={c.color}/>
                </div>
                <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:16,marginBottom:4,lineHeight:1.3}}>{c.title}</div>
                <div style={{fontSize:11,color:"#6b7a99",marginBottom:14}}>Last: <span style={{color:"#9aa5bc"}}>{c.lastLesson}</span></div>
                {/* Lesson progress */}
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                  <span style={{fontSize:11,color:"#6b7a99"}}>{completed}/{lessons.length} lessons</span>
                  <span style={{fontSize:12,fontWeight:800,color:c.color,fontFamily:"'Syne',sans-serif"}}>{pct}%</span>
                </div>
                <div style={{height:5,borderRadius:99,background:"rgba(255,255,255,.07)",marginBottom:16,overflow:"hidden"}}>
                  <div style={{height:"100%",width:`${pct}%`,background:`linear-gradient(90deg,${c.color},${c.color}88)`,borderRadius:99,transition:"width 1.2s ease"}}/>
                </div>
                {/* Mini lesson list preview */}
                {lessons.length>0&&(
                  <div style={{display:"flex",flexDirection:"column",gap:5,marginBottom:14}}>
                    {lessons.slice(0,3).map((l,j)=>{
                      const done=isLessonDone(c.title,l);
                      return (
                        <div key={j} style={{display:"flex",gap:8,alignItems:"center",padding:"5px 7px",borderRadius:7,background:"rgba(255,255,255,.03)"}}>
                          <div style={{width:14,height:14,borderRadius:"50%",background:done?"rgba(16,185,129,.25)":"rgba(255,255,255,.07)",border:`1.5px solid ${done?"#10b981":"rgba(255,255,255,.12)"}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                            {done&&<span style={{fontSize:8,color:"#10b981",fontWeight:900}}>✓</span>}
                          </div>
                          <span style={{fontSize:11,color:done?"#6b7a99":"#c0c9d9",flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{l.title}</span>
                          <span style={{fontSize:9,color:"#56637a",fontFamily:"'JetBrains Mono',monospace",flexShrink:0}}>{l.dur}</span>
                        </div>
                      );
                    })}
                    {lessons.length>3&&<div style={{fontSize:10,color:"#56637a",textAlign:"center",paddingTop:2,fontFamily:"'JetBrains Mono',monospace"}}>+{lessons.length-3} more lessons</div>}
                  </div>
                )}
                <div style={{display:"flex",gap:8}}>
                  <button onClick={()=>setActiveCourse(c)}
                    style={{flex:1,padding:"10px",borderRadius:10,background:`linear-gradient(135deg,${c.color},${c.color}99)`,color:"#fff",border:"none",cursor:"pointer",fontSize:12,fontWeight:700}}>
                    {pct===100?"Review Course":"Open Course →"}
                  </button>
                  <div style={{padding:"10px 12px",borderRadius:10,border:"1px solid rgba(255,255,255,.1)",cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center"}}>📌</div>
                </div>
                <div style={{marginTop:10,fontSize:10,color:"#6b7a99",fontFamily:"'JetBrains Mono',monospace"}}>{c.xp} XP earned</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderProgress=()=>(
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
        <Section title="📈 Monthly Progress" sub="XP & Quiz score trend">
          <LineChartSVG datasets={monthLine.datasets} height={130} labels={monthLine.labels}/>
        </Section>
        <Section title="🎯 Competency Radar">
          <div style={{display:"flex",justifyContent:"center"}}>
            <RadarChartSVG data={radarData} size={180}/>
          </div>
        </Section>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
        <Section title="🌊 XP Area Chart"><AreaChartSVG data={studyArea} color="#4f8ef7" height={110}/></Section>
        <Section title="🍩 Study Distribution">
          <div style={{display:"flex",gap:20,alignItems:"center"}}>
            <DonutChart segments={pieData} size={130} stroke={16} label="Study" sublabel="Mix"/>
            <div style={{flex:1,display:"flex",flexDirection:"column",gap:10}}>
              {pieData.map((p,i)=>(
                <div key={i}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                    <span style={{fontSize:12,color:"#9aa5bc"}}>{p.label}</span>
                    <span style={{fontSize:12,color:p.color,fontWeight:700}}>{p.v}%</span>
                  </div>
                  <div style={{height:4,borderRadius:99,background:"rgba(255,255,255,.06)"}}>
                    <div style={{height:"100%",width:`${p.v}%`,background:p.color,borderRadius:99}}/>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Section>
      </div>
      <Section title="🔵 Score Scatter Plot" sub="Quiz score vs session">
        <ScatterSVG data={scatterData} W={500} H={140}/>
      </Section>
    </div>
  );

  const renderQuiz=()=>(
    <Section title="🧠 Quiz Performance" sub="All quiz attempts — populated from quiz module">
      <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:280,gap:16}}>
        <div style={{fontSize:56,opacity:.2}}>🧠</div>
        <div style={{textAlign:"center",maxWidth:320}}>
          <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:18,marginBottom:8}}>Performance data will appear here</div>
          <div style={{fontSize:13,color:"#6b7a99",lineHeight:1.8}}>Complete quizzes in the Quiz section to automatically populate your performance history, weak topic tracking, and score trends.</div>
        </div>
        <div style={{display:"flex",gap:10}}>
          <button style={{padding:"10px 22px",borderRadius:11,background:"linear-gradient(135deg,#4f8ef7,#7c3aed)",color:"#fff",border:"none",cursor:"pointer",fontSize:13,fontWeight:700}}>Start a Quiz →</button>
          <button style={{padding:"10px 22px",borderRadius:11,border:"1px solid rgba(255,255,255,.1)",background:"transparent",color:"#9aa5bc",cursor:"pointer",fontSize:13,fontWeight:700}}>View History</button>
        </div>
      </div>
    </Section>
  );

  const pageTitle = {dashboard:"Dashboard",schedule:"Schedule",courses:"My Courses",quiz:"Quiz Performance",progress:"Progress Analytics",sandbox:"Live Sandbox",roadmap:"Learning Roadmap",profile:"My Profile",settings:"Settings"};

  const pageContent = {
    dashboard: renderDashboard(),
    schedule:  <SchedulePage/>,
    courses:   renderCourses(),
    progress:  renderProgress(),
    quiz:      renderQuiz(),
    sandbox:   renderSandbox(),
    roadmap:   renderRoadmap(),
    profile:   <ProfilePage user={user}/>,
  };

  return (
    <div style={{minHeight:"100vh",background:"#0f1117",display:"flex",fontFamily:"'DM Sans',sans-serif",color:"#f0f2f8"}}>
      {notifOpen && <NotificationPanel onClose={()=>setNotifOpen(false)} onNav={setActivePage}/>}

      {/* SIDEBAR */}
      <div style={{width:220,background:"#13151d",borderRight:"1px solid rgba(255,255,255,.07)",display:"flex",flexDirection:"column",padding:"24px 12px",flexShrink:0,position:"sticky",top:0,height:"100vh",overflowY:"auto"}}>
        <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:32,padding:"0 4px"}}>
          <div style={{width:36,height:36,borderRadius:10,background:"linear-gradient(135deg,#4f8ef7,#7c3aed)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,boxShadow:"0 0 20px rgba(79,142,247,.35)"}}>⚡</div>
          <div>
            <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:16,letterSpacing:"-.02em"}}>SKILLIO</div>
            <div style={{fontSize:10,color:"#6b7a99",fontFamily:"'JetBrains Mono',monospace"}}>Adaptive Learning</div>
          </div>
        </div>

        {/* User pill – clickable → profile */}
        <div onClick={()=>setActivePage("profile")} style={{display:"flex",alignItems:"center",gap:9,padding:"10px 12px",borderRadius:12,background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.07)",marginBottom:24,cursor:"pointer",transition:"border-color .2s"}}
          onMouseEnter={e=>e.currentTarget.style.borderColor="#4f8ef7"}
          onMouseLeave={e=>e.currentTarget.style.borderColor="rgba(255,255,255,.07)"}>
          <Ava name={user.name} size={32}/>
          <div style={{minWidth:0}}>
            <div style={{fontSize:12,fontWeight:700,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{user.name}</div>
            <div style={{fontSize:10,color:"#10b981",fontWeight:600}}>● Pro Learner</div>
          </div>
        </div>

        <div style={{flex:1}}>
          {navItems.map(n=>(
            <NavItem key={n.key} icon={n.icon} label={n.label} active={activePage===n.key} badge={n.badge} onClick={()=>setActivePage(n.key)}/>
          ))}
        </div>

        <div style={{padding:"12px",borderRadius:11,background:"rgba(79,142,247,.08)",border:"1px solid rgba(79,142,247,.18)",marginBottom:16}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
            <span style={{fontSize:11,color:"#6b7a99",fontFamily:"'JetBrains Mono',monospace"}}>XP Level 12</span>
            <span style={{fontSize:11,color:"#4f8ef7",fontFamily:"'JetBrains Mono',monospace"}}>3840/5000</span>
          </div>
          <div style={{height:4,borderRadius:99,background:"rgba(255,255,255,.07)"}}>
            <div style={{height:"100%",width:"76%",background:"linear-gradient(90deg,#4f8ef7,#7c3aed)",borderRadius:99}}/>
          </div>
        </div>

        <div onClick={onLogout} style={{display:"flex",alignItems:"center",gap:9,padding:"10px 14px",borderRadius:11,cursor:"pointer",color:"#6b7a99",transition:"all .2s"}}
          onMouseEnter={e=>{e.currentTarget.style.background="rgba(244,63,94,.1)";e.currentTarget.style.color="#f43f5e";}}
          onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color="#6b7a99";}}>
          <span style={{fontSize:15}}>🚪</span><span style={{fontSize:13,fontWeight:500}}>Log Out</span>
        </div>
      </div>

      {/* MAIN */}
      <div style={{flex:1,overflowY:"auto",padding:"28px 32px"}}>
        {/* Top bar */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:28}}>
          <div>
            <h1 style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:22,marginBottom:2}}>{pageTitle[activePage]||activePage}</h1>
            <div style={{fontSize:12,color:"#6b7a99",fontFamily:"'JetBrains Mono',monospace"}}>{new Date().toLocaleDateString("en-US",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}</div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{display:"flex",alignItems:"center",gap:8,background:"#16181f",border:"1px solid rgba(255,255,255,.08)",borderRadius:10,padding:"8px 14px",width:220}}>
              <span style={{fontSize:14,color:"#6b7a99"}}>🔍</span>
              <input placeholder="Search courses, topics…" style={{background:"none",border:"none",outline:"none",color:"#f0f2f8",fontSize:13,width:"100%",fontFamily:"'DM Sans',sans-serif"}}/>
            </div>
            <NotificationBell onClick={()=>setNotifOpen(!notifOpen)} count={5}/>
            {/* Profile avatar – clickable */}
            <div onClick={()=>setActivePage("profile")} style={{cursor:"pointer",borderRadius:"50%",border:`2px solid ${activePage==="profile"?"#4f8ef7":"transparent"}`,transition:"border-color .2s",lineHeight:0}}
              onMouseEnter={e=>e.currentTarget.style.borderColor="#4f8ef7"}
              onMouseLeave={e=>e.currentTarget.style.borderColor=activePage==="profile"?"#4f8ef7":"transparent"}>
              <Ava name={user.name} size={38}/>
            </div>
          </div>
        </div>

        {pageContent[activePage] || (
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:300,color:"#6b7a99",fontSize:15}}>
            🚧 {(pageTitle[activePage]||activePage)} — coming soon
          </div>
        )}
      </div>
    </div>
  );
}


/* ══════════════════════════════════════════════════════════
   ROOT APP
══════════════════════════════════════════════════════════ */
export default function App() {
  useEffect(() => { injectStyles(); }, []);
  const [page, setPage] = useState("login");
  const [user, setUser] = useState(null);

  const handleLogin = (u) => { setUser(u); setPage("dashboard"); };
  const handleLogout = () => { setUser(null); setPage("login"); };

  if (page === "dashboard" && user) return <Dashboard user={user} onLogout={handleLogout} />;
  if (page === "register") return <RegisterPage go={setPage} onLogin={handleLogin} />;
  if (page === "forgot") return <ForgotPage go={setPage} />;
  return <LoginPage go={setPage} onLogin={handleLogin} />;
}