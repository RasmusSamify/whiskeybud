import { useState, useEffect, useRef, useCallback, useMemo } from "react";

/* ═══════════════════════════════════════════════════════════════
   WHISKYBUD — "COPPER FORGE"
   v3 — Editorial tiles. Asymmetric grids. Diagonal cuts.
   Every tile has its own personality. Zero uniformity.
   ═══════════════════════════════════════════════════════════════ */

const C = {
  // ─ Depth layers — warmer, lifted browns ─
  void: "#110E0B",         // warm dark chocolate
  tar: "#181410",          // dark mocha
  oak: "#221D16",          // toasted oak
  barrel: "#2E271E",       // warm walnut
  char: "#3F3629",         // caramel border

  // ─ Header & Footer ─
  headerBg: "#1C1711",     // deep toffee
  headerBorder: "#3A3024", // warm seam
  footerBg: "#191510",     // roasted chestnut
  footerBorder: "#332A20", // warm seam

  // ─ Accent metals — matched to whiskybud.se orange ─
  copper: "#E08C28",       // their KÖP-button orange
  flame: "#EFA035",        // warm brass
  ember: "#C46A22",        // deep orange
  amber: "#D4A03A",        // aged gold
  gold: "#F0D48A",         // champagne highlight
  rosegold: "#CC8B68",     // warm rosé

  // ─ Neutrals — warmer, lighter ─
  ash: "#9E8E7A",          // warm sand
  smoke: "#716252",        // tobacco
  cream: "#F4EBD9",        // warm parchment
  milk: "#FCF8F0",         // ivory
  cognac: "#56453A",       // lighter cognac mid-tone
  wine: "#6B3040",         // bordeaux
  purple: "#7c3aed",       // samify
  green: "#5A9068",        // online (warmer)
  purple: "#7c3aed",       // samify
  green: "#4A7C59",        // online indicator
};

// Fonts: Fraunces (expressive variable serif) + Syne (geometric bold sans) + JetBrains Mono
(() => {
  const id = "wb3-f";
  if (document.getElementById(id)) return;
  const l = document.createElement("link"); l.id = id; l.rel = "stylesheet";
  l.href = "https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,500;0,9..144,700;0,9..144,900;1,9..144,300;1,9..144,400&family=Syne:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap";
  document.head.appendChild(l);
})();

const LOGO = "https://cdn.abicart.com/shop/ws5/158805/files/design/whiskybud_logo.png?max-width=1200&max-height=300&quality=85&fmt=avif";

// Styles
(() => {
  const id = "wb3-s";
  if (document.getElementById(id)) return;
  const s = document.createElement("style"); s.id = id;
  s.textContent = `
    @keyframes wb3-up{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
    @keyframes wb3-in{from{opacity:0;transform:scale(0.88) rotate(-1deg)}to{opacity:1;transform:scale(1) rotate(0)}}
    @keyframes wb3-cut{from{clip-path:polygon(0 100%,100% 100%,100% 100%,0 100%)}to{clip-path:polygon(0 0,100% 0,100% 100%,0 100%)}}
    @keyframes wb3-pulse{0%,100%{box-shadow:0 0 0 0 rgba(212,129,46,0.6)}50%{box-shadow:0 0 0 14px rgba(212,129,46,0)}}
    @keyframes wb3-drift{0%{transform:translate(0,0)}33%{transform:translate(20px,-15px)}66%{transform:translate(-15px,20px)}100%{transform:translate(0,0)}}
    @keyframes wb3-glow{0%,100%{opacity:.3}50%{opacity:1}}
    @keyframes wb3-panel{from{opacity:0;transform:translateY(16px) scale(0.94)}to{opacity:1;transform:translateY(0) scale(1)}}
    @keyframes wb3-slash{from{transform:scaleX(0)}to{transform:scaleX(1)}}
    @keyframes wb3-shimmer{0%{background-position:-200% center}100%{background-position:200% center}}
    @keyframes wb3-breathe{0%,100%{opacity:0.04;transform:scale(1)}50%{opacity:0.08;transform:scale(1.02)}}
    @keyframes wb3-logo-glow{0%,100%{filter:drop-shadow(0 0 0px rgba(201,153,62,0))}50%{filter:drop-shadow(0 0 8px rgba(201,153,62,0.25))}}
    @keyframes wb3-pillar{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
    @keyframes wb3-corner-draw{from{width:0}to{width:12px}}
    @keyframes wb3-diamond-spin{0%{transform:rotate(45deg) scale(0.8);opacity:0}100%{transform:rotate(45deg) scale(1);opacity:0.5}}
    .wb3-up{animation:wb3-up .45s cubic-bezier(.22,1,.36,1) both}
    .wb3-in{animation:wb3-in .4s cubic-bezier(.34,1.56,.64,1) both}
    .wb3-cut{animation:wb3-cut .6s cubic-bezier(.22,1,.36,1) both}
    .wb3-sb::-webkit-scrollbar{width:2px}
    .wb3-sb::-webkit-scrollbar-thumb{background:${C.smoke};border-radius:2px}
    .wb3-sb::-webkit-scrollbar-track{background:transparent}
    .wb3-range{-webkit-appearance:none;appearance:none;width:100%;height:24px;border-radius:0;outline:none;cursor:pointer;background:transparent;padding:0;margin:0;touch-action:none;user-select:none;-webkit-user-select:none;box-sizing:border-box}
    .wb3-range::-webkit-slider-runnable-track{height:3px;background:${C.barrel};border:none;border-radius:0}
    .wb3-range::-webkit-slider-thumb{-webkit-appearance:none;width:18px;height:18px;border-radius:0;background:${C.copper};border:2px solid ${C.void};cursor:grab;transform:rotate(45deg);transition:transform .15s;margin-top:-7.5px}
    .wb3-range::-webkit-slider-thumb:hover{transform:rotate(45deg) scale(1.15)}
    .wb3-range::-moz-range-track{height:3px;background:${C.barrel};border:none;border-radius:0}
    .wb3-range::-moz-range-thumb{width:18px;height:18px;border-radius:0;background:${C.copper};border:2px solid ${C.void};cursor:grab;transform:rotate(45deg);transition:transform .15s;box-sizing:border-box}
    .wb3-range::-moz-range-thumb:hover{transform:rotate(45deg) scale(1.15)}
  `;
  document.head.appendChild(s);
})();

const fr = (w = 400) => ({ fontFamily: "'Fraunces', 'Georgia', serif", fontWeight: w });
const sy = (w = 400) => ({ fontFamily: "'Syne', sans-serif", fontWeight: w });
const mo = (w = 400) => ({ fontFamily: "'JetBrains Mono', monospace", fontWeight: w });

// ─── DATA (unchanged) ───
const OCCASIONS = [
  { id: "birthday", label: "Födelsedag", icon: "🎂", sub: "Fira med klass" },
  { id: "thanks", label: "Tackgåva", icon: "🤝", sub: "Visa uppskattning" },
  { id: "enthusiast", label: "Kännaren", icon: "🔍", sub: "För den kräsna" },
  { id: "luxury", label: "Lyxpresent", icon: "👑", sub: "Det allra finaste" },
  { id: "corporate", label: "Företag", icon: "🏛", sub: "Imponera professionellt" },
  { id: "just", label: "Bara för att", icon: "💛", sub: "Ingen anledning behövs" },
];
const BUDGETS = [
  { id: "low", label: "<500", suffix: "SEK", pct: 25 },
  { id: "mid", label: "500–800", suffix: "SEK", pct: 50 },
  { id: "high", label: "800–1200", suffix: "SEK", pct: 75 },
  { id: "lux", label: "1200+", suffix: "SEK", pct: 100 },
];
const TASTE_AXES = [
  { id: "smoke", label: "RÖK", lo: "Ren", hi: "Torveld" },
  { id: "sweet", label: "SÖTMA", lo: "Torr", hi: "Honung" },
  { id: "body", label: "KROPP", lo: "Silk", hi: "Oljig" },
  { id: "fruit", label: "FRUKT", lo: "Kryddor", hi: "Tropisk" },
];
const RECS = {
  smoky: { name: "Elements of Islay", price: "885", region: "Islay", note: "Tre torveldade single malts. Rök, hav, jod.", stars: 4.7, url: "https://whiskybud.se/whisky/elements-of-islay-cask-edit-gift-set" },
  sweet: { name: "Nikka Days", price: "859", region: "Japan", note: "Silkeslen blend. Äpple, vanilj, ljung. Presentbox med 2 glas.", stars: 4.6, url: "https://whiskybud.se/whisky/nikka-days-med-2-whiskyglas" },
  rich: { name: "Nikka from the Barrel", price: "949", region: "Japan", note: "51.4% ABV. Mörk choklad, ingefära, evig finish.", stars: 4.8, url: "https://whiskybud.se/whisky/nikka-fran-barrel-case-silhouette-2024-ed" },
  easy: { name: "Teeling Small Batch", price: "685", region: "Dublin", note: "Rum-fatlagrad. Vanilj, citrus, tropisk frukt.", stars: 4.4, url: "https://whiskybud.se/whisky/teeling-small-batch" },
  gift: { name: "Födelsedagspaket", price: "996", region: "Mixed", note: "Whisky + tillbehör i komplett presentbox.", stars: 4.8, url: "https://whiskybud.se/whisky/fodelsedagspaket" },
};
const TOPLIST = [
  { r: 1, name: "Födelsedagspaket", price: "996", tag: "№1" },
  { r: 2, name: "Nikka from the Barrel", price: "949", tag: "SAMLAR" },
  { r: 3, name: "Elements of Islay Set", price: "885", tag: "GÅVA" },
  { r: 4, name: "Loch Lomond 12 YO", price: "895", tag: "PREMIUM" },
  { r: 5, name: "Thy Whisky Gift Pack", price: "379", tag: "BUDGET" },
];
const FAQS = [
  { q: "Leverans?", a: "2–3 arbetsdagar direkt till dörren. Personlig hälsning följer med." },
  { q: "Moms & skatt?", a: "Alla priser inkluderar moms och svensk alkoholskatt. Inga dolda avgifter." },
  { q: "Ålderskrav?", a: "Mottagaren måste vara 20+. Kontrolleras vid leverans." },
  { q: "Annan adress?", a: "Absolut — det är hela idén. Ange mottagarens adress vid beställning." },
  { q: "Ingen hemma?", a: "Avisering lämnas. Ny tid kan bokas eller hämtas på ombud." },
  { q: "Retur?", a: "Alkohol kan ej returneras enligt lag. Kontakta oss vid problem." },
];

// ─── COMPONENTS ───
function Orbs() {
  const o = useMemo(() => Array.from({ length: 4 }, (_, i) => ({
    s: 80 + Math.random() * 60, x: 15 + Math.random() * 70, y: 10 + Math.random() * 80,
    d: 14 + Math.random() * 8, dl: i * -4, c: [C.copper, C.rosegold, C.amber, C.cognac][i],
  })), []);
  return <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
    {o.map((v, i) => <div key={i} style={{ position: "absolute", left: `${v.x}%`, top: `${v.y}%`, width: v.s, height: v.s, borderRadius: "50%", background: `radial-gradient(circle,${v.c},transparent 70%)`, opacity: 0.07, filter: "blur(25px)", animation: `wb3-drift ${v.d}s ease-in-out ${v.dl}s infinite` }} />)}
  </div>;
}

function Tilt({ children, onClick, style, className = "", delay = 0, disableTilt = false }) {
  const ref = useRef(null);
  const [t, setT] = useState({ x: 0, y: 0, on: false });
  const [isTouch] = useState(() => typeof window !== "undefined" && (("ontouchstart" in window) || !window.matchMedia?.("(hover: hover)").matches));
  const tiltOff = disableTilt || isTouch;
  const mv = useCallback(e => { if (!ref.current) return; const r = ref.current.getBoundingClientRect(); setT({ x: ((e.clientY - r.top) / r.height - 0.5) * -10, y: ((e.clientX - r.left) / r.width - 0.5) * 10, on: true }); }, []);
  const lv = useCallback(() => setT({ x: 0, y: 0, on: false }), []);
  const handlers = tiltOff ? {} : { onMouseMove: mv, onMouseLeave: lv };
  return <div ref={ref} className={className} {...handlers} onClick={onClick}
    style={{ ...style, cursor: onClick ? "pointer" : "default", transform: tiltOff ? "none" : `perspective(500px) rotateX(${t.x}deg) rotateY(${t.y}deg)`, transition: t.on ? "transform .08s" : "transform .4s cubic-bezier(.22,1,.36,1)", animationDelay: `${delay}ms`, willChange: tiltOff ? "auto" : "transform" }}>
    {children}
    {t.on && !tiltOff && <div style={{ position: "absolute", inset: 0, borderRadius: "inherit", pointerEvents: "none", background: `radial-gradient(circle at ${(t.y/10+.5)*100}% ${(-t.x/10+.5)*100}%,rgba(212,129,46,0.1),transparent 50%)` }} />}
  </div>;
}

function AnimPrice({ v, delay = 0 }) {
  const [d, setD] = useState(0);
  const n = parseInt(v.replace(/\D/g, "")) || 0;
  useEffect(() => {
    const start = () => { const t0 = Date.now(); const tick = () => { const p = Math.min((Date.now() - t0) / 700, 1); setD(Math.round(n * (1 - Math.pow(1 - p, 3)))); if (p < 1) requestAnimationFrame(tick); }; requestAnimationFrame(tick); };
    if (delay > 0) { const id = setTimeout(start, delay); return () => clearTimeout(id); }
    start();
  }, [n, delay]);
  return <>{d.toLocaleString("sv-SE")}</>;
}

// Diagonal slash divider
function Slash({ color = C.copper, h = 2, my = 12 }) {
  return <div style={{ margin: `${my}px 0`, height: h, background: color, transformOrigin: "left", animation: "wb3-slash .5s cubic-bezier(.22,1,.36,1) both", clipPath: "polygon(0 0, 100% 40%, 100% 100%, 0 60%)" }} />;
}

// Monoline SVG icon set — inherits color via currentColor
function Icon({ name, size = 24, stroke = 1.5 }) {
  const p = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: stroke, strokeLinecap: "round", strokeLinejoin: "round" };
  switch (name) {
    case "gift":
      return <svg {...p}>
        <rect x="3" y="10" width="18" height="11" />
        <rect x="2" y="7" width="20" height="3.5" />
        <line x1="12" y1="7" x2="12" y2="21" />
        <path d="M12 7 C 9 2, 5 4, 7 7 Z" />
        <path d="M12 7 C 15 2, 19 4, 17 7 Z" />
      </svg>;
    case "birthday":
      return <svg {...p}>
        <rect x="4" y="13" width="16" height="8" />
        <path d="M4 16 Q 8 14.5 12 16 T 20 16" />
        <line x1="12" y1="13" x2="12" y2="9" />
        <circle cx="12" cy="7.5" r="1.5" fill="currentColor" stroke="none" />
      </svg>;
    case "thanks":
      return <svg {...p}>
        <path d="M5 20 Q 12 12 19 4" />
        <path d="M7 17 C 9 15, 12 15, 13 17" />
        <path d="M11 13 C 13 11, 16 11, 17 13" />
        <path d="M15 9 C 17 7, 19 7, 20 9" />
      </svg>;
    case "enthusiast":
      return <svg {...p}>
        <circle cx="10" cy="10" r="6" />
        <line x1="14.5" y1="14.5" x2="20" y2="20" />
      </svg>;
    case "luxury":
      return <svg {...p}>
        <path d="M3 18 L5 8 L9 13 L12 6 L15 13 L19 8 L21 18 Z" />
        <line x1="4" y1="21" x2="20" y2="21" />
      </svg>;
    case "corporate":
      return <svg {...p}>
        <path d="M2 7 L12 3 L22 7" />
        <line x1="3" y1="7" x2="21" y2="7" />
        <line x1="6" y1="7" x2="6" y2="18" />
        <line x1="10" y1="7" x2="10" y2="18" />
        <line x1="14" y1="7" x2="14" y2="18" />
        <line x1="18" y1="7" x2="18" y2="18" />
        <line x1="3" y1="18" x2="21" y2="18" />
        <line x1="2" y1="21" x2="22" y2="21" />
      </svg>;
    case "just":
      return <svg {...p}>
        <path d="M12 20 C 8 17, 4 14, 4 9.5 A 3.5 3.5 0 0 1 12 7 A 3.5 3.5 0 0 1 20 9.5 C 20 14, 16 17, 12 20 Z" />
      </svg>;
    default:
      return null;
  }
}

// ═══════════════════════════════
// MAIN
// ═══════════════════════════════
export default function WhiskybudWidget() {
  const [open, setOpen] = useState(false);
  const [show, setShow] = useState(false);
  const [scr, setScr] = useState("home");
  const [hist, setHist] = useState([]);
  const [gStep, setGStep] = useState(0);
  const [occ, setOcc] = useState(null);
  const [bud, setBud] = useState(null);
  const [taste, setTaste] = useState({ smoke: 30, sweet: 60, body: 45, fruit: 55 });
  const [msgs, setMsgs] = useState([{ r: "b", t: "Välkommen. Berätta om tillfället, smaken, eller budgeten — jag matchar rätt whisky åt dig." }]);
  const [inp, setInp] = useState("");
  const [busy, setBusy] = useState(false);
  const [faqI, setFaqI] = useState(null);

  useEffect(() => { if (open) requestAnimationFrame(() => setShow(true)); else setShow(false); }, [open]);
  const nav = useCallback(to => { setHist(h => [...h, scr]); setScr(to); }, [scr]);
  const back = useCallback(() => {
    if (scr === "guide" && gStep > 0) { setGStep(g => g - 1); return; }
    if (scr === "guide" && gStep === 0) { setScr("home"); setHist([]); return; }
    setScr(hist[hist.length - 1] || "home"); setHist(h => h.slice(0, -1));
  }, [scr, hist, gStep]);
  const getRec = useCallback(() => {
    const { smoke, sweet, body } = taste;
    if (smoke > 60) return RECS.smoky;
    if (sweet > 65 && body < 50) return RECS.easy;
    if (sweet > 55) return RECS.sweet;
    if (body > 60) return RECS.rich;
    return RECS.gift;
  }, [taste]);
  const sendMsg = useCallback(text => {
    const m = (text || "").trim();
    if (!m || busy) return;
    setMsgs(p => [...p, { r: "u", t: m }]); setInp(""); setBusy(true);
    setTimeout(() => {
      const lo = m.toLowerCase(); let re;
      if (/födelsedag|present|gåva/.test(lo)) re = "**Födelsedagspaket** (996 kr) — bästsäljaren. Vill du ha mer exklusivt? **Nikka from the Barrel** (949 kr) imponerar alltid.";
      else if (/nybörjare|mild|enkel/.test(lo)) re = "**Teeling Small Batch** (685 kr) — rumfatslagrad, vanilj och citrus. Alternativt **Nikka Days** (859 kr) från Japan.";
      else if (/rök|islay|torv/.test(lo)) re = "**Elements of Islay** (885 kr) — tre torveldade Islay-whiskies. Rök, hav, jod.";
      else if (/lever|frakt|skick/.test(lo)) re = "**2–3 arbetsdagar** direkt till dörren. Personlig hälsning ingår. Alla priser inkl. moms & skatt.";
      else if (/pris|billig|budget/.test(lo)) re = "Från **299** till **1 485 kr**. Bästa budgetval: **Thy Whisky Gift Pack** (379 kr).";
      else if (/japan/.test(lo)) re = "**Nikka Days** (859 kr) för silke, **Nikka from the Barrel** (949 kr) för intensitet. Båda i presentförpackning.";
      else re = "Berätta mer — eller testa **Presentsguiden** och **Smakprofilen** i menyn för att hitta rätt match.";
      setMsgs(p => [...p, { r: "b", t: re }]); setBusy(false);
    }, 800 + Math.random() * 500);
  }, [busy]);
  const send = useCallback(() => sendMsg(inp), [inp, sendMsg]);

  const chatEndRef = useRef(null);
  useEffect(() => { if (scr === "chat") chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, busy, scr]);
  const rec = getRec();

  // ═══ HOME ═══
  const homeJSX = (
    <div style={{ padding: "0 16px 16px" }}>
      {/* Hero — editorial, asymmetric */}
      <div className="wb3-up" style={{ padding: "24px 4px 0", position: "relative" }}>
        <img src={LOGO} alt="Whiskybud" style={{ height: 30, objectFit: "contain", opacity: 0.85, marginBottom: 12 }} />
        <p style={{ ...fr(900), fontSize: 32, color: C.cream, margin: 0, lineHeight: 1.05, letterSpacing: "-0.03em" }}>
          Som ett<br/>blombud —
        </p>
        <p style={{
          ...fr(300), fontSize: 28, margin: "2px 0 0", lineHeight: 1.1, fontStyle: "italic",
          background: `linear-gradient(90deg, ${C.copper} 0%, ${C.gold} 45%, ${C.copper} 55%, ${C.copper} 100%)`,
          backgroundSize: "200% auto",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          animation: "wb3-shimmer 4s ease-in-out infinite",
        }}>
          fast med whisky.
        </p>
        {/* Info triptych — three pillars with diamond separators */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0, marginTop: 18, padding: "14px 12px", background: `linear-gradient(90deg, ${C.oak}00, ${C.oak}, ${C.oak}00)`, borderTop: `1px solid ${C.char}`, borderBottom: `1px solid ${C.char}`, position: "relative" }}>
          {/* Animated corner accents */}
          <div style={{ position: "absolute", top: -1, left: 0, height: 1, background: C.copper, animation: "wb3-corner-draw 0.6s cubic-bezier(.22,1,.36,1) 0.3s both" }} />
          <div style={{ position: "absolute", bottom: -1, right: 0, height: 1, background: C.copper, animation: "wb3-corner-draw 0.6s cubic-bezier(.22,1,.36,1) 0.5s both" }} />

          {[
            { label: "Leverans", value: "2–3 dagar" },
            { label: "Priser", value: "Inkl. skatt" },
            { label: "Present", value: "Med hälsning" },
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", animation: `wb3-pillar 0.4s cubic-bezier(.22,1,.36,1) ${0.4 + i * 0.12}s both` }}>
              {i > 0 && (
                <div style={{ width: 5, height: 5, background: C.rosegold, margin: "0 14px", flexShrink: 0, animation: `wb3-diamond-spin 0.3s ease ${0.6 + i * 0.15}s both` }} />
              )}
              <div style={{ textAlign: "center" }}>
                <div style={{ ...mo(600), fontSize: 9, color: C.copper, letterSpacing: "0.2em" }}>{item.label.toUpperCase()}</div>
                <div style={{ ...fr(500), fontSize: 13, color: C.cream, marginTop: 3, letterSpacing: "0.01em" }}>{item.value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Slash color={`linear-gradient(90deg, transparent, ${C.amber}50, ${C.copper}40, transparent)`} h={1} my={16} />

      {/* ═══ TILE GRID — asymmetric, each tile unique ═══ */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "auto", gap: 8 }}>

        {/* TILE 1: Presentsguiden — tall, dominant, warm walnut */}
        <Tilt className="wb3-up" delay={60}
          onClick={() => { setGStep(0); setOcc(null); setBud(null); nav("guide"); }}
          style={{
            gridRow: "span 2", padding: "20px 14px", position: "relative", overflow: "hidden",
            background: `linear-gradient(170deg, ${C.barrel} 30%, ${C.oak})`,
            border: `1px solid ${C.char}`,
            borderRadius: "4px 20px 4px 20px",
          }}>
          {/* Oversized decorative number */}
          <div style={{ position: "absolute", top: -8, right: -4, ...fr(900), fontSize: 100, color: C.amber, opacity: 0.05, lineHeight: 1, pointerEvents: "none", animation: "wb3-breathe 6s ease-in-out infinite" }}>01</div>
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ ...mo(700), fontSize: 9, color: C.copper, letterSpacing: "0.2em", marginBottom: 10 }}>GUIDE</div>
            <div style={{ marginBottom: 10, color: C.copper, display: "inline-flex" }}><Icon name="gift" size={34} stroke={1.4} /></div>
            <div style={{ ...sy(700), fontSize: 16, color: C.cream, lineHeight: 1.2 }}>Present-<br/>guiden</div>
            <div style={{ ...mo(400), fontSize: 10, color: C.ash, marginTop: 8 }}>3 steg → rätt whisky</div>
            {/* Diagonal accent */}
            <div style={{ width: 30, height: 2, background: C.copper, marginTop: 12, transform: "rotate(-12deg)", transformOrigin: "left" }} />
          </div>
        </Tilt>

        {/* TILE 2: Smakprofilen — compact, warm gradient */}
        <Tilt className="wb3-up" delay={120}
          onClick={() => nav("taste")}
          style={{
            padding: "16px 14px", position: "relative", overflow: "hidden",
            background: `linear-gradient(160deg, ${C.char}, ${C.barrel})`,
            border: `1px solid ${C.cognac}60`,
            borderRadius: "20px 4px 20px 4px",
          }}>
          <div style={{ position: "absolute", bottom: -6, left: -4, ...fr(900), fontSize: 72, color: C.amber, opacity: 0.06, lineHeight: 1, pointerEvents: "none", animation: "wb3-breathe 7s ease-in-out 1s infinite" }}>02</div>
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ ...mo(700), fontSize: 9, color: C.amber, letterSpacing: "0.2em", marginBottom: 6 }}>SMAK</div>
            {/* Mini radar preview */}
            <svg width="48" height="48" viewBox="0 0 48 48" style={{ marginBottom: 6 }}>
              <polygon points="24,4 44,24 24,44 4,24" fill="none" stroke={C.char} strokeWidth="1" />
              <polygon points="24,12 36,24 24,36 12,24" fill="none" stroke={C.char} strokeWidth="0.5" />
              <polygon points={`24,${24-taste.smoke/100*18} ${24+taste.sweet/100*18},24 24,${24+taste.body/100*18} ${24-taste.fruit/100*18},24`}
                fill={`${C.copper}30`} stroke={C.copper} strokeWidth="1.5" style={{ transition: "all .2s" }} />
            </svg>
            <div style={{ ...sy(600), fontSize: 13, color: C.cream }}>Smakhjul</div>
          </div>
        </Tilt>

        {/* TILE 3: Sommelier — deep cognac, warm */}
        <Tilt className="wb3-up" delay={180}
          onClick={() => nav("chat")}
          style={{
            padding: "16px 14px", position: "relative", overflow: "hidden",
            background: `linear-gradient(160deg, ${C.cognac}, ${C.tar})`,
            border: `1px solid ${C.cognac}`,
            borderRadius: "4px",
          }}>
          {/* Rosegold accent bar — subtle shimmer */}
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: 3, overflow: "hidden",
          }}>
            <div style={{
              width: "100%", height: "100%",
              background: `linear-gradient(90deg, ${C.rosegold}, ${C.copper} 40%, ${C.gold} 50%, ${C.copper} 60%, ${C.rosegold})`,
              backgroundSize: "200% 100%",
              animation: "wb3-shimmer 5s ease-in-out infinite",
            }} />
          </div>
          <div style={{ position: "relative", zIndex: 1, paddingTop: 4 }}>
            <div style={{ ...mo(700), fontSize: 9, color: C.rosegold, letterSpacing: "0.2em", marginBottom: 6 }}>CHAT</div>
            <div style={{ ...sy(700), fontSize: 14, color: C.cream }}>Sommelier</div>
            <div style={{ ...fr(300), fontSize: 11, color: C.ash, fontStyle: "italic", marginTop: 4 }}>AI-rådgivning</div>
          </div>
        </Tilt>

        {/* TILE 4: Topplistan — wide, warm mahogany gradient */}
        <Tilt className="wb3-up" delay={240}
          onClick={() => nav("top")}
          style={{
            gridColumn: "span 2", padding: "14px 16px", position: "relative", overflow: "hidden",
            background: `linear-gradient(135deg, ${C.barrel}, ${C.oak})`,
            border: `1px solid ${C.char}`,
            borderRadius: "4px 4px 20px 20px",
            display: "flex", alignItems: "center", gap: 16,
          }}>
          {/* Diagonal stripe decoration — amber tinted */}
          <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: 50, overflow: "hidden", pointerEvents: "none", opacity: 0.04 }}>
            {[0,8,16,24,32,40].map(i => <div key={i} style={{ position: "absolute", top: -10, left: i, width: 3, height: "130%", background: C.amber, transform: "rotate(20deg)" }} />)}
          </div>
          <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: 16, width: "100%" }}>
            <div style={{ ...fr(900), fontSize: 36, color: C.copper, lineHeight: 1 }}>№1</div>
            <div style={{ flex: 1 }}>
              <div style={{ ...sy(700), fontSize: 14, color: C.cream }}>Topplistan</div>
              <div style={{ ...mo(400), fontSize: 10, color: C.ash }}>Mest populära just nu</div>
            </div>
            <div style={{ ...sy(300), color: C.smoke, fontSize: 20 }}>→</div>
          </div>
        </Tilt>

        {/* TILE 5: FAQ — minimal, stamp-style, cognac dashed */}
        <Tilt className="wb3-up" delay={300}
          onClick={() => nav("faq")}
          style={{
            gridColumn: "span 2", padding: "12px 16px", position: "relative",
            background: `${C.cognac}18`,
            border: `1px dashed ${C.cognac}`,
            borderRadius: "0",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ ...mo(700), fontSize: 11, color: C.cognac, letterSpacing: "0.15em" }}>FAQ</div>
            <div style={{ width: 1, height: 14, background: C.cognac }} />
            <div style={{ ...fr(300), fontSize: 13, color: C.ash, fontStyle: "italic" }}>Leverans & vanliga frågor</div>
          </div>
          <div style={{ ...mo(400), fontSize: 14, color: C.cognac }}>→</div>
        </Tilt>
      </div>
    </div>
  );

  // ═══ GUIDE ═══
  const guideLabels = ["TILLFÄLLE", "BUDGET", "SMAK", "MATCH"];
  const guideJSX = (
      <div style={{ padding: "0 16px 16px" }}>
        {/* Progress — monospace, industrial */}
        <div style={{ display: "flex", gap: 3, padding: "14px 0 18px" }}>
          {guideLabels.map((l, i) => (
            <div key={l} style={{ flex: 1 }}>
              <div style={{ height: 3, marginBottom: 5, background: i <= gStep ? C.copper : C.barrel, transition: "all .4s", clipPath: "polygon(0 0,100% 0,95% 100%,0 100%)" /* slanted bar */ }} />
              <div style={{ ...mo(i === gStep ? 700 : 400), fontSize: 8, color: i <= gStep ? C.copper : C.smoke, letterSpacing: "0.15em", textAlign: "center" }}>{l}</div>
            </div>
          ))}
        </div>

        {gStep === 0 && (
          <div className="wb3-cut">
            <div style={{ ...fr(900), fontSize: 30, color: C.cream, lineHeight: 1, marginBottom: 4 }}>Vad firas?</div>
            <div style={{ ...mo(400), fontSize: 10, color: C.ash, letterSpacing: "0.1em", marginBottom: 14 }}>VÄLJ TILLFÄLLE</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
              {OCCASIONS.map((o, i) => (
                <Tilt key={o.id} className="wb3-up" delay={i * 40}
                  onClick={() => { setOcc(o); setGStep(1); }}
                  style={{
                    padding: "14px 12px", position: "relative", overflow: "hidden",
                    background: C.oak, border: `1px solid ${C.char}`,
                    borderRadius: i % 3 === 0 ? "16px 4px" : i % 3 === 1 ? "4px 16px" : "4px", /* varied radius */
                    textAlign: "center",
                  }}>
                  <div style={{ marginBottom: 6, color: C.copper, display: "inline-flex" }}><Icon name={o.id} size={26} stroke={1.5} /></div>
                  <div style={{ ...sy(600), fontSize: 12, color: C.cream }}>{o.label}</div>
                  <div style={{ ...mo(400), fontSize: 9, color: C.ash, marginTop: 3 }}>{o.sub}</div>
                </Tilt>
              ))}
            </div>
          </div>
        )}

        {gStep === 1 && (
          <div className="wb3-cut">
            <button onClick={() => setGStep(g => g - 1)}
              style={{ ...mo(400), background: "none", border: "none", color: C.ash, fontSize: 10, cursor: "pointer", letterSpacing: "0.1em", marginBottom: 12, padding: 0 }}>← TILLBAKA</button>
            <div style={{ ...fr(900), fontSize: 30, color: C.cream, lineHeight: 1, marginBottom: 4 }}>Budget?</div>
            <div style={{ ...mo(400), fontSize: 10, color: C.ash, letterSpacing: "0.1em", marginBottom: 14, display: "inline-flex", alignItems: "center", gap: 6 }}><span style={{ color: C.copper, display: "inline-flex" }}><Icon name={occ?.id} size={12} stroke={1.6} /></span>{occ?.label?.toUpperCase()}</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
              {BUDGETS.map((b, i) => (
                <Tilt key={b.id} className="wb3-up" delay={i * 50}
                  onClick={() => { setBud(b); setGStep(2); }}
                  style={{
                    padding: "16px 14px", position: "relative", overflow: "hidden",
                    background: C.oak, border: `1px solid ${C.char}`,
                    borderRadius: i === 0 ? "16px 4px 4px 4px" : i === 3 ? "4px 4px 4px 16px" : "4px",
                  }}>
                  {/* Fill level indicator */}
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: `${b.pct}%`, background: `${C.copper}08`, transition: "height .4s" }} />
                  <div style={{ position: "relative", zIndex: 1 }}>
                    <div style={{ ...fr(700), fontSize: 24, color: C.copper, lineHeight: 1 }}>{b.label}</div>
                    <div style={{ ...mo(400), fontSize: 10, color: C.ash, marginTop: 4 }}>{b.suffix}</div>
                  </div>
                </Tilt>
              ))}
            </div>
          </div>
        )}

        {gStep === 2 && (
          <div className="wb3-cut">
            <button onClick={() => setGStep(g => g - 1)}
              style={{ ...mo(400), background: "none", border: "none", color: C.ash, fontSize: 10, cursor: "pointer", letterSpacing: "0.1em", marginBottom: 12, padding: 0 }}>← TILLBAKA</button>
            <div style={{ ...fr(900), fontSize: 30, color: C.cream, lineHeight: 1, marginBottom: 4 }}>Smak</div>
            <div style={{ ...mo(400), fontSize: 10, color: C.ash, letterSpacing: "0.1em", marginBottom: 18 }}>DRA REGLAGE</div>
            {TASTE_AXES.slice(0, 2).map(ax => (
              <div key={ax.id} style={{ marginBottom: 22 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
                  <span style={{ ...mo(400), fontSize: 9, color: C.ash }}>{ax.lo}</span>
                  <span style={{ ...mo(700), fontSize: 10, color: C.copper, letterSpacing: "0.15em" }}>{ax.label}</span>
                  <span style={{ ...mo(400), fontSize: 9, color: C.ash }}>{ax.hi}</span>
                </div>
                <div style={{ position: "relative" }}>
                  <div style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", height: 3, width: `${taste[ax.id]}%`, background: `linear-gradient(90deg, ${C.copper}, ${C.flame})`, pointerEvents: "none", transition: "width .1s" }} />
                  <input type="range" className="wb3-range" min="0" max="100" value={taste[ax.id]} onInput={e => setTaste(t => ({ ...t, [ax.id]: +e.target.value }))}
                    onChange={e => setTaste(t => ({ ...t, [ax.id]: +e.target.value }))} />
                </div>
              </div>
            ))}
            <button onClick={() => setGStep(3)} className="wb3-up"
              style={{
                width: "100%", padding: 14, border: `2px solid ${C.copper}`, borderRadius: 0, cursor: "pointer",
                background: "transparent", ...sy(700), fontSize: 14, color: C.copper, letterSpacing: "0.06em",
                transition: "all .2s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = C.copper; e.currentTarget.style.color = C.void; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = C.copper; }}>
              VISA MIN MATCH →
            </button>
          </div>
        )}

        {gStep === 3 && (
          <div className="wb3-in" style={{ textAlign: "center" }}>
            <div style={{ ...mo(400), fontSize: 9, color: C.ash, letterSpacing: "0.12em", marginBottom: 14, display: "inline-flex", alignItems: "center", gap: 6 }}><span style={{ color: C.copper, display: "inline-flex" }}><Icon name={occ?.id} size={11} stroke={1.6} /></span>{occ?.label?.toUpperCase()} · {bud?.label} SEK</div>
            <div style={{
              padding: "28px 20px 24px", position: "relative",
              background: C.oak, border: `1px solid ${C.copper}40`,
              borderRadius: "4px 20px 4px 20px",
            }}>
              {/* Stamp badge */}
              <div style={{ position: "absolute", top: -1, left: -1, right: -1, height: 4, background: `linear-gradient(90deg, ${C.copper}, ${C.ember}, ${C.copper})` }} />
              <div style={{ ...mo(700), fontSize: 9, letterSpacing: "0.2em", color: C.copper, marginBottom: 12 }}>REKOMMENDATION</div>
              <div style={{ ...mo(400), fontSize: 10, color: C.ash, fontStyle: "italic", marginBottom: 4 }}>{rec.region}</div>
              <div style={{ ...fr(900), fontSize: 34, color: C.cream, lineHeight: 1.1, marginBottom: 4 }}>{rec.name}</div>
              <div style={{ ...mo(700), fontSize: 32, color: C.copper, margin: "10px 0" }}><AnimPrice v={rec.price} delay={500} /> SEK</div>
              <p style={{ ...sy(400), fontSize: 12, color: C.ash, lineHeight: 1.6, margin: "0 0 14px" }}>{rec.note}</p>
              <div style={{ display: "flex", justifyContent: "center", gap: 2, marginBottom: 16 }}>
                {Array.from({ length: 5 }, (_, i) => <span key={i} style={{ fontSize: 14, color: i < Math.floor(rec.stars) ? C.amber : C.barrel }}>◆</span>)}
                <span style={{ ...mo(500), fontSize: 11, color: C.ash, marginLeft: 6 }}>{rec.stars}</span>
              </div>
              <a href={rec.url} target="_blank" rel="noopener noreferrer"
                style={{ display: "inline-block", padding: "12px 28px", border: `2px solid ${C.copper}`, borderRadius: 0, ...sy(700), fontSize: 13, color: C.copper, textDecoration: "none", letterSpacing: "0.05em", transition: "all .2s" }}
                onMouseEnter={e => { e.currentTarget.style.background = C.copper; e.currentTarget.style.color = C.void; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = C.copper; }}>
                KÖP PÅ WHISKYBUD →
              </a>
            </div>
            <button onClick={() => { setGStep(0); setOcc(null); setBud(null); }}
              style={{ ...mo(400), background: "none", border: "none", color: C.smoke, fontSize: 10, marginTop: 14, cursor: "pointer", letterSpacing: "0.1em" }}>[ BÖRJA OM ]</button>
          </div>
        )}
      </div>
  );

  // ═══ TASTE ═══
  const tasteJSX = (
      <div style={{ padding: "0 16px 16px" }}>
        <div className="wb3-up" style={{ padding: "18px 0" }}>
          <div style={{ ...fr(900), fontSize: 34, color: C.cream, lineHeight: 1 }}>Smak-</div>
          <div style={{ ...fr(300), fontSize: 30, color: C.copper, fontStyle: "italic", lineHeight: 1 }}>profil</div>
          <div style={{ ...mo(400), fontSize: 9, color: C.ash, letterSpacing: "0.12em", marginTop: 6 }}>JUSTERA — VI MATCHAR LIVE</div>
        </div>
        <div className="wb3-up" style={{ padding: 18, background: C.oak, borderRadius: "4px 20px 4px 20px", border: `1px solid ${C.char}`, marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
            <svg width="180" height="180" viewBox="0 0 180 180">
              {/* Diamond grid instead of circles */}
              {[25, 45, 65, 80].map(r => <polygon key={r} points={`90,${90-r} ${90+r},90 90,${90+r} ${90-r},90`} fill="none" stroke={C.char} strokeWidth="0.5" />)}
              <polygon points={TASTE_AXES.map((ax, i) => { const a = (i * Math.PI * 2) / 4 - Math.PI / 2; const r = (taste[ax.id] / 100) * 70 + 10; return `${90 + Math.cos(a) * r},${90 + Math.sin(a) * r}`; }).join(" ")}
                fill={`${C.copper}20`} stroke={C.copper} strokeWidth="2" style={{ transition: "all .15s", filter: `drop-shadow(0 0 6px ${C.copper}30)` }} />
              {TASTE_AXES.map((ax, i) => { const a = (i * Math.PI * 2) / 4 - Math.PI / 2; const r = (taste[ax.id] / 100) * 70 + 10; return (
                <g key={ax.id}>
                  <rect x={90 + Math.cos(a) * r - 5} y={90 + Math.sin(a) * r - 5} width="10" height="10"
                    fill={C.copper} transform={`rotate(45 ${90 + Math.cos(a) * r} ${90 + Math.sin(a) * r})`}
                    style={{ transition: "all .15s", filter: `drop-shadow(0 0 4px ${C.copper}50)` }} />
                  <text x={90 + Math.cos(a) * 92} y={90 + Math.sin(a) * 92} textAnchor="middle" dominantBaseline="middle"
                    fill={C.copper} fontSize="9" fontWeight="700" fontFamily="'JetBrains Mono', monospace" letterSpacing="0.1em">{ax.label}</text>
                </g>
              ); })}
            </svg>
          </div>
          {TASTE_AXES.map(ax => (
            <div key={ax.id} style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ ...mo(400), fontSize: 9, color: C.ash }}>{ax.lo}</span>
                <span style={{ ...mo(400), fontSize: 9, color: C.ash }}>{ax.hi}</span>
              </div>
              <div style={{ position: "relative" }}>
                <div style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", height: 3, width: `${taste[ax.id]}%`, background: `linear-gradient(90deg, ${C.copper}, ${C.flame})`, pointerEvents: "none", transition: "width .1s" }} />
                <input type="range" className="wb3-range" min="0" max="100" value={taste[ax.id]} onInput={e => setTaste(t => ({ ...t, [ax.id]: +e.target.value }))}
                  onChange={e => setTaste(t => ({ ...t, [ax.id]: +e.target.value }))} />
              </div>
            </div>
          ))}
        </div>
        {/* Live match — stamp style */}
        <div className="wb3-up" style={{ padding: "12px 16px", border: `1px solid ${C.copper}40`, borderRadius: 0, background: `${C.copper}06`, position: "relative" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: C.copper }} />
          <div style={{ ...mo(700), fontSize: 8, letterSpacing: "0.2em", color: C.copper, marginBottom: 6 }}>LIVE MATCH</div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ ...fr(700), fontSize: 18, color: C.cream }}>{rec.name}</div>
              <div style={{ ...mo(400), fontSize: 10, color: C.ash }}>{rec.region}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ ...mo(700), fontSize: 18, color: C.copper }}>{rec.price}</div>
              <a href={rec.url} target="_blank" rel="noopener noreferrer" style={{ ...mo(500), fontSize: 9, color: C.copper, textDecoration: "none", letterSpacing: "0.1em" }}>KÖP →</a>
            </div>
          </div>
        </div>
      </div>
  );

  // ═══ CHAT ═══
  const chatJSX = (
      <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <div className="wb3-sb" style={{ flex: 1, overflowY: "auto", padding: "10px 14px 6px" }}>
          {msgs.map((m, i) => (
            <div key={i} className="wb3-up" style={{ display: "flex", justifyContent: m.r === "u" ? "flex-end" : "flex-start", marginBottom: 8, animationDelay: `${Math.min(i * 30, 150)}ms` }}>
              {m.r === "b" && <div style={{ width: 26, height: 26, borderRadius: 0, marginRight: 8, marginTop: 2, flexShrink: 0, background: C.oak, border: `1px solid ${C.char}`, display: "flex", alignItems: "center", justifyContent: "center", ...mo(700), fontSize: 10, color: C.copper, transform: "rotate(45deg)" }}><span style={{ transform: "rotate(-45deg)" }}>W</span></div>}
              <div style={{
                maxWidth: "80%", padding: "10px 14px",
                borderRadius: m.r === "u" ? "14px 2px 14px 14px" : "2px 14px 14px 14px",
                background: m.r === "u" ? `linear-gradient(135deg, ${C.copper}, ${C.ember})` : C.oak,
                border: m.r === "u" ? "none" : `1px solid ${C.char}`,
                ...sy(400), fontSize: 13, lineHeight: 1.55, color: m.r === "u" ? C.milk : C.cream,
              }} dangerouslySetInnerHTML={{ __html: m.t.replace(/\*\*(.*?)\*\*/g, `<strong style="color:${m.r === "u" ? C.milk : C.copper};font-weight:700">$1</strong>`) }} />
            </div>
          ))}
          {busy && (
            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              <div style={{ width: 26, height: 26, borderRadius: 0, background: C.oak, border: `1px solid ${C.char}`, display: "flex", alignItems: "center", justifyContent: "center", ...mo(700), fontSize: 10, color: C.copper, transform: "rotate(45deg)" }}><span style={{ transform: "rotate(-45deg)" }}>W</span></div>
              <div style={{ padding: "12px 16px", background: C.oak, border: `1px solid ${C.char}`, borderRadius: "2px 14px 14px 14px", display: "flex", gap: 5, alignItems: "center" }}>
                {[0, 1, 2].map(d => <div key={d} style={{ width: 5, height: 5, background: C.copper, transform: "rotate(45deg)", animation: `wb3-glow 1s ease ${d * 0.15}s infinite` }} />)}
                <span style={{ ...mo(400), fontSize: 10, color: C.ash, marginLeft: 6 }}>Söker rätt whisky...</span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
        <div style={{ padding: "3px 14px 1px", display: "flex", gap: 5, overflowX: "auto" }}>
          {["Födelsedag", "Rökig", "Budget", "Japan"].map(q => (
            <button key={q} onClick={() => sendMsg(q)}
              style={{ ...mo(500), padding: "4px 10px", border: `1px solid ${C.char}`, borderRadius: 0, background: "transparent", color: C.ash, fontSize: 10, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0, transition: "all .15s", letterSpacing: "0.05em" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = C.copper; e.currentTarget.style.color = C.copper; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = C.char; e.currentTarget.style.color = C.ash; }}>
              {q}
            </button>
          ))}
        </div>
        <div style={{ padding: "8px 14px 10px", display: "flex", gap: 6 }}>
          <input value={inp} onChange={e => setInp(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder="Skriv till sommelieren..."
            style={{ flex: 1, padding: "10px 12px", borderRadius: 0, background: C.oak, border: `1px solid ${C.char}`, color: C.cream, ...sy(400), fontSize: 13, outline: "none", transition: "border-color .2s" }}
            onFocus={e => e.currentTarget.style.borderColor = C.copper} onBlur={e => e.currentTarget.style.borderColor = C.char} />
          <button onClick={send} disabled={!inp.trim()}
            style={{ width: 40, height: 40, borderRadius: 0, border: inp.trim() ? `2px solid ${C.copper}` : `1px solid ${C.char}`, background: inp.trim() ? C.copper : "transparent", cursor: inp.trim() ? "pointer" : "not-allowed", opacity: inp.trim() ? 1 : 0.5, display: "flex", alignItems: "center", justifyContent: "center", transition: "all .2s" }}>
            <span style={{ ...sy(700), fontSize: 16, color: inp.trim() ? C.void : C.smoke, transform: "rotate(-45deg)" }}>↑</span>
          </button>
        </div>
      </div>
  );

  // ═══ TOP ═══
  const topJSX = (
    <div style={{ padding: "0 16px 16px" }}>
      <div className="wb3-up" style={{ padding: "18px 0" }}>
        <div style={{ ...fr(900), fontSize: 34, color: C.cream, lineHeight: 1 }}>Topp-</div>
        <div style={{ ...fr(300), fontSize: 30, color: C.copper, fontStyle: "italic", lineHeight: 1 }}>listan</div>
        <div style={{ ...mo(400), fontSize: 9, color: C.ash, letterSpacing: "0.12em", marginTop: 6 }}>MEST KÖPTA JUST NU</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {TOPLIST.map((item, i) => (
          <Tilt key={i} className="wb3-up" delay={i * 60}
            style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: i === 0 ? "16px 14px" : "12px 14px", position: "relative", overflow: "hidden",
              background: i === 0 ? C.oak : "transparent",
              border: `1px solid ${i === 0 ? C.copper + "50" : C.char}`,
              borderRadius: i === 0 ? "4px 20px 4px 20px" : "0",
            }}>
            {i === 0 && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, overflow: "hidden" }}><div style={{ width: "100%", height: "100%", background: `linear-gradient(90deg, ${C.copper}, ${C.flame} 40%, ${C.gold} 50%, ${C.flame} 60%, ${C.copper})`, backgroundSize: "200% 100%", animation: "wb3-shimmer 5s ease-in-out 1s infinite" }} /></div>}
            <div style={{ ...fr(900), fontSize: i === 0 ? 32 : 22, color: i === 0 ? C.copper : C.smoke, lineHeight: 1, minWidth: 32 }}>{item.r}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ ...sy(600), fontSize: 13, color: C.cream }}>{item.name}</div>
              <span style={{ ...mo(700), fontSize: 8, color: C.copper, letterSpacing: "0.15em" }}>{item.tag}</span>
            </div>
            <div style={{ ...mo(600), fontSize: i === 0 ? 16 : 13, color: i === 0 ? C.copper : C.ash }}>{item.price}</div>
          </Tilt>
        ))}
      </div>
      <a href="https://whiskybud.se/topplistan" target="_blank" rel="noopener noreferrer"
        style={{ display: "block", textAlign: "center", marginTop: 14, padding: 12, border: `1px dashed ${C.smoke}`, borderRadius: 0, ...mo(500), fontSize: 11, color: C.ash, textDecoration: "none", letterSpacing: "0.1em", transition: "all .2s" }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = C.copper; e.currentTarget.style.color = C.copper; e.currentTarget.style.borderStyle = "solid"; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = C.smoke; e.currentTarget.style.color = C.ash; e.currentTarget.style.borderStyle = "dashed"; }}>
        SE HELA TOPPLISTAN →
      </a>
    </div>
  );

  // ═══ FAQ ═══
  const faqJSX = (
    <div style={{ padding: "0 16px 16px" }}>
      <div className="wb3-up" style={{ padding: "18px 0" }}>
        <div style={{ ...fr(900), fontSize: 34, color: C.cream, lineHeight: 1 }}>FAQ &</div>
        <div style={{ ...fr(300), fontSize: 30, color: C.copper, fontStyle: "italic", lineHeight: 1 }}>leverans</div>
      </div>
      {/* Delivery stamp */}
      <Tilt className="wb3-up" style={{
        display: "flex", gap: 14, padding: 14, position: "relative", overflow: "hidden",
        background: C.oak, border: `1px solid ${C.copper}40`,
        borderRadius: "4px 20px 4px 20px", marginBottom: 14,
      }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: C.copper }} />
        <div style={{ ...fr(900), fontSize: 40, color: C.copper, lineHeight: 0.9 }}>2–3</div>
        <div>
          <div style={{ ...sy(600), fontSize: 13, color: C.cream }}>Arbetsdagar</div>
          <div style={{ ...mo(400), fontSize: 9, color: C.ash, letterSpacing: "0.08em", marginTop: 3 }}>DÖRR · HÄLSNING · SKATT INKL.</div>
        </div>
      </Tilt>
      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {FAQS.map((f, i) => (
          <div key={i} className="wb3-up" style={{ animationDelay: `${i * 30}ms` }}>
            <button onClick={() => setFaqI(faqI === i ? null : i)}
              style={{ width: "100%", padding: "12px 14px", textAlign: "left", background: faqI === i ? C.barrel : "transparent", border: `1px solid ${faqI === i ? C.copper + "40" : C.char}`, borderRadius: faqI === i ? "4px 4px 0 0" : 0, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", transition: "all .2s" }}>
              <span style={{ ...sy(600), fontSize: 13, color: C.cream }}>{f.q}</span>
              <span style={{ ...mo(300), fontSize: 18, color: C.copper, transition: "transform .3s", transform: faqI === i ? "rotate(45deg)" : "none" }}>+</span>
            </button>
            <div style={{ maxHeight: faqI === i ? 200 : 0, opacity: faqI === i ? 1 : 0, overflow: "hidden", transition: "max-height 0.3s ease, opacity 0.3s ease" }}>
              <div style={{ padding: "10px 14px", background: C.oak, border: `1px solid ${C.char}`, borderTop: "none", borderRadius: "0 0 4px 4px", ...sy(400), fontSize: 12, color: C.ash, lineHeight: 1.6 }}>{f.a}</div>
            </div>
          </div>
        ))}
      </div>
      <a href="https://whiskybud.se/kontakta-oss" target="_blank" rel="noopener noreferrer"
        style={{ display: "block", textAlign: "center", marginTop: 16, padding: 14, border: `2px solid ${C.copper}`, borderRadius: 0, ...sy(700), fontSize: 13, color: C.copper, textDecoration: "none", letterSpacing: "0.06em", transition: "all .2s" }}
        onMouseEnter={e => { e.currentTarget.style.background = C.copper; e.currentTarget.style.color = C.void; }}
        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = C.copper; }}>
        KONTAKTA OSS
      </a>
    </div>
  );

  // ═══ SHELL ═══
  const titles = { guide: "GUIDE", taste: "SMAK", chat: "SOMMELIER", top: "TOPP", faq: "FAQ" };
  const S = { guide: guideJSX, taste: tasteJSX, chat: chatJSX, top: topJSX, faq: faqJSX };

  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 99999, ...sy(400) }}>
      {open && show && (
        <div style={{
          width: 440, height: 720, overflow: "hidden",
          background: C.void, border: `1px solid ${C.cognac}`,
          borderRadius: "6px 24px 6px 24px",
          boxShadow: `0 32px 80px rgba(0,0,0,0.75), 0 0 0 1px ${C.cognac}40, 0 0 60px ${C.copper}06`,
          display: "flex", flexDirection: "column", marginBottom: 14,
          animation: "wb3-panel 0.35s cubic-bezier(.22,1,.36,1) both",
          transformOrigin: "bottom right", position: "relative",
        }}>
          <Orbs key="orbs" />
          {/* Header — deep cacao with burnished copper accent */}
          <div style={{
            padding: "13px 18px", display: "flex", alignItems: "center", gap: 10,
            borderBottom: `1px solid ${C.headerBorder}`, position: "relative", zIndex: 2,
            background: `linear-gradient(180deg, ${C.headerBg} 60%, ${C.void})`
          }}>
            {/* Gold accent shimmer at top */}
            <div style={{ position: "absolute", top: 0, left: "10%", right: "10%", height: 1, overflow: "hidden" }}>
              <div style={{
                width: "100%", height: "100%",
                background: `linear-gradient(90deg, transparent 20%, ${C.amber}40 45%, ${C.gold}30 50%, ${C.amber}40 55%, transparent 80%)`,
                backgroundSize: "200% 100%",
                animation: "wb3-shimmer 6s ease-in-out infinite",
              }} />
            </div>
            {scr !== "home" && (
              <button onClick={back} style={{ background: "none", border: "none", cursor: "pointer", padding: 2, ...mo(400), fontSize: 16, color: C.cream }}>←</button>
            )}
            <div style={{ flex: 1 }}>
              {scr === "home" ? (
                <img src={LOGO} alt="Whiskybud" style={{ height: 20, objectFit: "contain", opacity: 0.9, animation: "wb3-logo-glow 4s ease-in-out infinite" }} />
              ) : (
                <span style={{ ...mo(600), fontSize: 11, color: C.cream, letterSpacing: "0.15em" }}>{titles[scr]}</span>
              )}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <div style={{ width: 5, height: 5, background: C.green, transform: "rotate(45deg)", boxShadow: `0 0 6px ${C.green}` }} />
              <span style={{ ...mo(400), fontSize: 9, color: C.ash }}>ONLINE</span>
            </div>
          </div>
          {/* Body */}
          <div className="wb3-sb" style={{ flex: 1, overflowY: scr === "chat" ? "hidden" : "auto", position: "relative", zIndex: 1 }}>
            {S[scr] || homeJSX}
          </div>
          {/* Footer — roasted espresso, distinct from header */}
          <div style={{
            padding: "8px 0", textAlign: "center", position: "relative", zIndex: 2,
            borderTop: `1px solid ${C.footerBorder}`,
            background: `linear-gradient(180deg, ${C.void}, ${C.footerBg})`,
          }}>
            {/* Subtle gold seam */}
            <div style={{ position: "absolute", top: 0, left: "15%", right: "15%", height: 1, background: `linear-gradient(90deg, transparent, ${C.amber}18, transparent)` }} />
            <span style={{ fontFamily: "'Montserrat','Syne',sans-serif", fontWeight: 700, fontSize: 9, color: C.smoke, letterSpacing: "0.08em" }}>
              POWERED BY SAMIFY <span style={{ display: "inline-block", width: 5, height: 5, background: C.purple, transform: "rotate(45deg)", verticalAlign: "middle", marginLeft: 3 }} />
            </span>
          </div>
        </div>
      )}
      {/* Launcher */}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button onClick={() => setOpen(!open)}
          style={{
            width: 58, height: 58, cursor: "pointer",
            borderRadius: "6px 18px 6px 18px",
            background: `linear-gradient(135deg, ${C.copper}, ${C.ember})`,
            border: `2px solid ${C.flame}40`,
            display: "flex", alignItems: "center", justifyContent: "center",
            animation: open ? "none" : "wb3-pulse 2.5s ease-in-out infinite",
            boxShadow: `0 6px 28px ${C.copper}${open ? "30" : "50"}`,
            transition: "all .35s cubic-bezier(.22,1,.36,1)",
          }}>
          {open ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.void} strokeWidth="2.5" strokeLinecap="round">
              <line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/>
            </svg>
          ) : (
            <svg width="26" height="26" viewBox="-20 -22 40 44" fill="none" stroke={C.void} strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round">
              <path d="M-10,-18 C-12,-18 -14,-12 -14,-4 C-14,4 -8,10 -6,12 L-4,14 L-4,18 L-8,20 L8,20 L4,18 L4,14 L6,12 C8,10 14,4 14,-4 C14,-12 12,-18 10,-18 Z"/>
              <path d="M-10,-6 C-6,-8 6,-8 10,-6 L8,4 C6,8 4,10 0,12 C-4,10 -6,8 -8,4 Z" fill={C.void} opacity="0.18"/>
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
