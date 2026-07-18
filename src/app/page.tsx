"use client";
import Link from "next/link";
import { DollarSign, Eye, ShoppingCart, TrendingUp, ArrowRight, Info } from "lucide-react";

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  burnt:    "#B5451B",   // burnt orange — primary
  burntDim: "#8C3414",   // burnt orange dark
  burntBg:  "#F5E6DC",   // burnt orange tint (very light)
  cream:    "#FDF6EE",   // main background
  cream2:   "#F5EAD8",   // slightly deeper cream
  white:    "#FFFFFF",
  charcoal: "#2C2C2C",   // primary text
  mid:      "#6B6361",   // secondary text
  faint:    "#C4B8AF",   // borders / muted
  cta:      "#C04B1E",   // button burnt orange (slightly richer)
};

const shadow = {
  card:  "0 2px 16px rgba(44,28,20,0.07)",
  heavy: "0 8px 40px rgba(44,28,20,0.12)",
  glow:  `0 8px 32px ${C.burnt}44`,
};

// ─── Tiny sparkline SVG ───────────────────────────────────────────────────────
function Sparkline({ points, color }: { points: number[]; color: string }) {
  const w = 200, h = 60;
  const max = Math.max(...points, 1);
  const xs = points.map((_, i) => (i / (points.length - 1)) * w);
  const ys = points.map((v) => h - (v / max) * (h - 8) - 4);
  const line = xs.map((x, i) => `${i === 0 ? "M" : "L"} ${x} ${ys[i]}`).join(" ");
  const fill = `${line} L ${w} ${h} L 0 ${h} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: 60 }} preserveAspectRatio="none">
      <defs>
        <linearGradient id={`sp-${color.replace("#","")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor={color} stopOpacity={0.25} />
          <stop offset="95%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={fill} fill={`url(#sp-${color.replace("#","")})`} />
      <path d={line} fill="none" stroke={color} strokeWidth={1.5} />
    </svg>
  );
}

// ─── Dashboard mockup — matches real creator dashboard exactly ────────────────
const SP_REVENUE    = [12,18,9,24,30,22,40,36,55,48,62,70,58,80,75,90,83,95,88,100,92,85,97,100,88,94,78,100,96,104];
const SP_VIEWS      = [40,55,38,62,70,60,80,72,88,75,92,85,100,90,78,95,88,100,82,92,86,98,76,100,90,94,88,96,100,92];
const SP_CHECKOUTS  = [20,35,18,45,50,40,60,52,70,58,75,65,80,70,60,78,72,85,68,78,72,82,60,88,76,82,70,86,88,82];
const SP_SALES      = [8,14,6,18,22,16,28,24,35,28,38,32,42,36,28,40,36,44,32,40,36,44,28,48,38,44,34,46,48,42];

function DashboardMockup() {
  const statCards = [
    {
      label: "Revenue", value: "₦2,847,500", tag: "Wallet: ₦1,203,000",
      tagStyle: { background: "#fff7ed", color: "#c2410c" },
      iconBg: "#fff7ed", icon: <DollarSign size={13} color="#ea580c" />,
      color: "#ea580c", sp: SP_REVENUE,
    },
    {
      label: "Page Views", value: "8,241", tag: "→ checkout: 4.2%",
      tagStyle: { background: "#f3f4f6", color: "#4b5563" },
      iconBg: "#eff6ff", icon: <Eye size={13} color="#3b82f6" />,
      color: "#3b82f6", sp: SP_VIEWS,
    },
    {
      label: "Checkouts", value: "346", tag: "CVR: 28.3%",
      tagStyle: { background: "#111827", color: "#ffffff" },
      iconBg: "#fefce8", icon: <ShoppingCart size={13} color="#eab308" />,
      color: "#f59e0b", sp: SP_CHECKOUTS,
    },
    {
      label: "Sales", value: "98", tag: "All time: 1,241",
      tagStyle: { background: "#f3f4f6", color: "#4b5563" },
      iconBg: "#f0fdf4", icon: <TrendingUp size={13} color="#22c55e" />,
      color: "#22c55e", sp: SP_SALES,
    },
  ];

  const products = [
    { name: "Financial Freedom Blueprint", units: 641, revenue: 100, color: "#ea580c" },
    { name: "Crypto Investing for Beginners", units: 318, revenue: 62, color: "#3b82f6" },
    { name: "Figma UI Kit — 2025 Edition", units: 187, revenue: 44, color: "#eab308" },
    { name: "Brand Identity Starter Kit", units: 95, revenue: 28, color: "#22c55e" },
  ];

  const recentSales = [
    { name: "Adaeze Okafor",  email: "adaeze@gmail.com",   product: "Financial Freedom Blueprint",  amount: "₦12,500", time: "2m ago" },
    { name: "Emeka Tunde",    email: "emeka@outlook.com",   product: "Crypto for Beginners",         amount: "₦8,000",  time: "18m ago" },
    { name: "Fatima Aliyu",   email: "fatima@yahoo.com",    product: "Financial Freedom Blueprint",  amount: "₦12,500", time: "1h ago" },
  ];

  const g = { bg: "#ffffff", border: "#e5e7eb", text: "#111827", sub: "#6b7280", faint: "#9ca3af" };

  return (
    <div style={{ background: "#f9fafb", border: `1px solid ${g.border}`, borderRadius: 20, overflow: "hidden", maxWidth: 860, margin: "0 auto", boxShadow: shadow.heavy }}>
      {/* browser chrome */}
      <div style={{ background: g.bg, borderBottom: `1px solid ${g.border}`, padding: "10px 18px", display: "flex", alignItems: "center", gap: 7 }}>
        {["#f87171","#fbbf24","#4ade80"].map((c) => <span key={c} style={{ width: 9, height: 9, borderRadius: "50%", background: c, display: "inline-block" }} />)}
        <span style={{ flex: 1, textAlign: "center", fontSize: 11, color: g.faint, background: "#f3f4f6", borderRadius: 6, padding: "2px 12px", maxWidth: 240, margin: "0 auto" }}>veelage.co/creator/dashboard</span>
      </div>

      <div style={{ display: "flex", height: 520 }}>
        {/* sidebar */}
        <div style={{ width: 52, background: g.bg, borderRight: `1px solid ${g.border}`, flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 16, gap: 18 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: "#ea580c", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#fff", fontSize: 12, fontWeight: 900 }}>V</span>
          </div>
          {["▣","☰","⊞","◎","⚙"].map((ic, i) => (
            <div key={i} style={{ width: 32, height: 32, borderRadius: 8, background: i === 0 ? "#fff7ed" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: i === 0 ? "#ea580c" : g.faint, cursor: "default" }}>{ic}</div>
          ))}
        </div>

        {/* main */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 22px", display: "flex", flexDirection: "column", gap: 16 }}>
          {/* header */}
          <div>
            <p style={{ margin: 0, fontSize: 16, fontWeight: 800, color: g.text }}>
              Welcome back, <span style={{ fontWeight: 900 }}>Chidi Okonkwo</span>
            </p>
          </div>

          {/* period tabs */}
          <div style={{ display: "flex", gap: 6 }}>
            {["Today","This Week","This Month","Custom"].map((t, i) => (
              <span key={t} style={{ fontSize: 10, fontWeight: 600, padding: "5px 10px", borderRadius: 10, background: i === 2 ? "#ea580c" : g.bg, color: i === 2 ? "#fff" : g.sub, border: i === 2 ? "none" : `1px solid ${g.border}` }}>{t}</span>
            ))}
          </div>

          {/* stat cards 2×2 */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {statCards.map((c) => (
              <div key={c.label} style={{ background: g.bg, borderRadius: 14, padding: "14px 16px", boxShadow: "0 1px 3px rgba(0,0,0,0.07)", display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, color: g.sub }}>
                    <Info size={10} color={g.faint} />
                    <span style={{ fontSize: 11, fontWeight: 600 }}>{c.label}</span>
                    <ArrowRight size={10} color={g.faint} />
                  </div>
                  <div style={{ width: 26, height: 26, borderRadius: 8, background: c.iconBg, display: "flex", alignItems: "center", justifyContent: "center" }}>{c.icon}</div>
                </div>
                <p style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 900, color: g.text, letterSpacing: "-0.5px" }}>{c.value}</p>
                <span style={{ ...c.tagStyle, fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 100, display: "inline-block", marginBottom: 8, alignSelf: "flex-start" }}>{c.tag}</span>
                <Sparkline points={c.sp} color={c.color} />
              </div>
            ))}
          </div>

          {/* product performance */}
          <div style={{ background: g.bg, borderRadius: 14, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.07)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: `1px solid ${g.border}` }}>
              <div>
                <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: g.text }}>Product Performance</p>
                <p style={{ margin: "2px 0 0", fontSize: 10, color: g.faint }}>4 active products</p>
              </div>
              <span style={{ fontSize: 10, color: "#ea580c", fontWeight: 600, display: "flex", alignItems: "center", gap: 3 }}>Manage <ArrowRight size={10} /></span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", borderBottom: "none" }}>
              {products.map((p, i) => (
                <div key={p.name} style={{ padding: "12px 14px", borderRight: i < 3 ? `1px solid ${g.border}` : "none" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                    <div style={{ width: 18, height: 18, borderRadius: 5, background: p.color, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 9, fontWeight: 800 }}>{i+1}</div>
                    <span style={{ fontSize: 9, color: g.faint, fontWeight: 600 }}>{p.units} sold</span>
                  </div>
                  <p style={{ margin: "0 0 4px", fontSize: 10, fontWeight: 600, color: g.text, lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{p.name}</p>
                  <div style={{ height: 4, background: "#f3f4f6", borderRadius: 4, overflow: "hidden", marginTop: 8 }}>
                    <div style={{ height: "100%", width: `${p.revenue}%`, background: p.color, borderRadius: 4 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* recent sales */}
          <div style={{ background: g.bg, borderRadius: 14, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.07)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: `1px solid ${g.border}` }}>
              <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: g.text }}>Recent Sales</p>
              <span style={{ fontSize: 10, color: "#ea580c", fontWeight: 600, display: "flex", alignItems: "center", gap: 3 }}>View all <ArrowRight size={10} /></span>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${g.border}` }}>
                  {["Customer","Product","Amount","Date"].map((h) => (
                    <th key={h} style={{ padding: "8px 14px", textAlign: "left", fontSize: 9, color: g.faint, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentSales.map((s, i) => (
                  <tr key={i} style={{ borderBottom: i < recentSales.length - 1 ? `1px solid #f9fafb` : "none" }}>
                    <td style={{ padding: "9px 14px" }}>
                      <p style={{ margin: 0, fontWeight: 600, color: g.text }}>{s.name}</p>
                      <p style={{ margin: 0, color: g.faint, fontSize: 9 }}>{s.email}</p>
                    </td>
                    <td style={{ padding: "9px 14px", color: g.sub }}>{s.product}</td>
                    <td style={{ padding: "9px 14px", fontWeight: 700, color: g.text }}>{s.amount}</td>
                    <td style={{ padding: "9px 14px", color: g.faint }}>{s.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Home() {
  return (
    <main style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", background: C.cream, color: C.charcoal }}>

      {/* NAV */}
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.1rem 1.5rem", background: `${C.white}ee`, backdropFilter: "blur(12px)", borderBottom: `1px solid ${C.faint}44`, position: "sticky", top: 0, zIndex: 100 }}>
        <span style={{ fontSize: 20, fontWeight: 900, letterSpacing: "-0.5px", color: C.charcoal }}>Veelage</span>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <a href="#how-it-works" className="nav-link" style={{ fontSize: 14, color: C.mid, textDecoration: "none", fontWeight: 500 }}>How it works</a>
          <a href="#features"     className="nav-link" style={{ fontSize: 14, color: C.mid, textDecoration: "none", fontWeight: 500 }}>Features</a>
          <Link href="/login" style={{ fontSize: 14, color: C.white, textDecoration: "none", fontWeight: 700, background: C.cta, padding: "10px 22px", borderRadius: 12, letterSpacing: "-0.2px", boxShadow: shadow.glow }}>
            Get started
          </Link>
        </div>
      </nav>
      <style>{`
        .nav-link { display: none !important; }
        @media (min-width: 640px) { .nav-link { display: block !important; } }
        details[open] summary span.faq-plus { transform: rotate(45deg); }
        details summary span.faq-plus { transition: transform 0.2s; display: inline-block; }
      `}</style>

      {/* HERO */}
      <section style={{ background: `linear-gradient(160deg, ${C.cream} 0%, ${C.cream2} 60%, ${C.burntBg} 100%)`, padding: "7rem 2rem 6rem", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -100, right: -100, width: 400, height: 400, borderRadius: "50%", background: `${C.burnt}09`, pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -80, left: -80, width: 300, height: 300, borderRadius: "50%", background: `${C.burnt}07`, pointerEvents: "none" }} />

        <div style={{ position: "relative", maxWidth: 700, margin: "0 auto" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: C.white, border: `1.5px solid ${C.faint}55`, borderRadius: 100, padding: "6px 18px", marginBottom: "2rem", boxShadow: shadow.card }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: C.burnt, display: "inline-block" }} />
            <span style={{ fontSize: 12, color: C.mid, fontWeight: 600, letterSpacing: "0.03em" }}>The home for creator businesses</span>
          </div>

          <h1 style={{ fontSize: "clamp(2.8rem, 6.5vw, 4.8rem)", fontWeight: 900, lineHeight: 1.0, letterSpacing: "-3px", marginBottom: "1.5rem", color: C.charcoal }}>
            Turn your knowledge<br />
            <span style={{ color: C.burnt }}>and expertise</span><br />
            into a business.
          </h1>

          <p style={{ fontSize: 18, color: C.mid, lineHeight: 1.75, marginBottom: "2.5rem", maxWidth: 440, marginLeft: "auto", marginRight: "auto" }}>
            Sell digital products, courses, and expertise — and get paid. No tech skills needed.
          </p>

          <Link href="/login" style={{ display: "inline-block", textDecoration: "none", background: C.cta, color: C.white, fontWeight: 800, fontSize: 17, padding: "17px 44px", borderRadius: 14, boxShadow: shadow.glow, letterSpacing: "-0.3px" }}>
            Start selling for free →
          </Link>
          <p style={{ fontSize: 13, color: C.faint, marginTop: "1.1rem" }}>Free to join · No credit card required</p>
        </div>
      </section>

      {/* STATS STRIP */}
      <section style={{ background: C.white, borderTop: `1px solid ${C.faint}44`, borderBottom: `1px solid ${C.faint}44`, padding: "2.75rem 2rem" }}>
        <div style={{ maxWidth: 860, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center", flexWrap: "wrap", gap: 48 }}>
          {[
            { value: "₦2B+",    label: "Creator earnings" },
            { value: "50,000+", label: "Products sold" },
            { value: "4,200+",  label: "Active creators" },
            { value: "98%",     label: "Payout success rate" },
          ].map((s) => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <p style={{ fontSize: 28, fontWeight: 900, color: C.burnt, margin: 0, letterSpacing: "-1px" }}>{s.value}</p>
              <p style={{ fontSize: 12, color: C.mid, margin: "4px 0 0", fontWeight: 500 }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* DASHBOARD PREVIEW */}
      <section style={{ background: C.cream2, padding: "6rem 2rem" }}>
        <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
          <p style={{ fontSize: 11, letterSpacing: "0.14em", color: C.burnt, textTransform: "uppercase", marginBottom: "0.75rem", fontWeight: 700 }}>YOUR BUSINESS, AT A GLANCE</p>
          <h2 style={{ fontSize: "clamp(1.9rem, 3.5vw, 2.6rem)", fontWeight: 900, letterSpacing: "-1.5px", color: C.charcoal, margin: 0 }}>
            Everything in one dashboard
          </h2>
        </div>
        <DashboardMockup />
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" style={{ background: C.cream, padding: "7rem 2rem" }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <p style={{ fontSize: 11, letterSpacing: "0.14em", color: C.burnt, textTransform: "uppercase", marginBottom: "0.75rem", fontWeight: 700 }}>IT&apos;S THAT SIMPLE</p>
            <h2 style={{ fontSize: "clamp(1.9rem, 3.8vw, 2.9rem)", fontWeight: 900, letterSpacing: "-1.5px", color: C.charcoal, margin: "0 0 1rem" }}>
              Sell online in 3 steps
            </h2>
            <p style={{ fontSize: 15, color: C.mid, lineHeight: 1.75, maxWidth: 360, margin: "0 auto" }}>
              Get started in minutes and make your first sale the same day.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
            {[
              {
                step: "01", title: "Create an Account",
                desc: "Sign up free in under 2 minutes. No credit card, no setup fees.",
                visual: (
                  <div style={{ background: `linear-gradient(135deg, ${C.cream2} 0%, ${C.burntBg} 100%)`, borderRadius: 14, padding: "20px", marginBottom: 20 }}>
                    <div style={{ background: C.white, borderRadius: 12, padding: "16px", boxShadow: shadow.card }}>
                      <p style={{ margin: "0 0 12px", fontSize: 13, fontWeight: 700, color: C.charcoal }}>Create your account</p>
                      {["Email address", "Password"].map((f) => (
                        <div key={f} style={{ background: C.cream, border: `1px solid ${C.faint}55`, borderRadius: 8, padding: "9px 12px", marginBottom: 8, fontSize: 11, color: C.faint }}>{f}</div>
                      ))}
                      <div style={{ background: C.cta, borderRadius: 8, padding: "9px", textAlign: "center", color: C.white, fontSize: 12, fontWeight: 700, marginTop: 12 }}>Get Started →</div>
                    </div>
                  </div>
                ),
              },
              {
                step: "02", title: "Upload Your Product",
                desc: "Upload your ebook, course, or file. We build your sales page instantly.",
                visual: (
                  <div style={{ background: `linear-gradient(135deg, ${C.cream} 0%, ${C.cream2} 100%)`, borderRadius: 14, padding: "20px", marginBottom: 20 }}>
                    <div style={{ background: C.white, borderRadius: 12, padding: "16px", boxShadow: shadow.card }}>
                      <p style={{ margin: "0 0 12px", fontSize: 13, fontWeight: 700, color: C.charcoal }}>Create product</p>
                      {["Product name", "Price (₦)", "Upload file"].map((f) => (
                        <div key={f} style={{ background: C.cream, border: `1px solid ${C.faint}55`, borderRadius: 8, padding: "9px 12px", marginBottom: 8, fontSize: 11, color: C.faint }}>{f}</div>
                      ))}
                      <div style={{ background: C.cta, borderRadius: 8, padding: "9px", textAlign: "center", color: C.white, fontSize: 12, fontWeight: 700, marginTop: 12 }}>Publish →</div>
                    </div>
                  </div>
                ),
              },
              {
                step: "03", title: "Sell & Get Paid",
                desc: "Share your link. Buyers pay securely and money hits your account automatically.",
                visual: (
                  <div style={{ background: `linear-gradient(135deg, #EDF7F0 0%, #D4F0DE 100%)`, borderRadius: 14, padding: "20px", marginBottom: 20 }}>
                    <div style={{ background: C.white, borderRadius: 12, padding: "16px", boxShadow: shadow.card }}>
                      <p style={{ margin: "0 0 4px", fontSize: 11, color: C.faint }}>Today&apos;s earnings</p>
                      <p style={{ margin: "0 0 14px", fontSize: 24, fontWeight: 900, color: C.charcoal, letterSpacing: "-1px" }}>₦284,500</p>
                      {["Adaeze O. — ₦12,500", "Emeka T. — ₦8,000", "Fatima A. — ₦12,500"].map((t) => (
                        <div key={t} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#3CB97A", flexShrink: 0 }} />
                          <span style={{ fontSize: 11, color: C.mid }}>{t}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ),
              },
            ].map((s) => (
              <div key={s.step} style={{ background: C.white, border: `1px solid ${C.faint}44`, borderRadius: 18, padding: "1.75rem", boxShadow: shadow.card }}>
                {s.visual}
                <p style={{ fontSize: 10, letterSpacing: "0.12em", color: C.burnt, margin: "0 0 8px", fontWeight: 700, textTransform: "uppercase" }}>{s.step}</p>
                <p style={{ fontWeight: 800, fontSize: 16, margin: "0 0 7px", color: C.charcoal, letterSpacing: "-0.3px" }}>{s.title}</p>
                <p style={{ fontSize: 13, color: C.mid, margin: 0, lineHeight: 1.7 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" style={{ background: C.charcoal, padding: "7rem 2rem" }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <p style={{ fontSize: 11, letterSpacing: "0.14em", color: C.burntBg, textTransform: "uppercase", marginBottom: "0.75rem", fontWeight: 700 }}>BUILT TO CONVERT</p>
            <h2 style={{ fontSize: "clamp(1.9rem, 3.8vw, 2.9rem)", fontWeight: 900, letterSpacing: "-1.5px", color: C.white, margin: "0 0 1rem", lineHeight: 1.1 }}>
              Every step optimised<br />for more sales.
            </h2>
            <p style={{ fontSize: 15, color: C.faint, lineHeight: 1.75, maxWidth: 440, margin: "0 auto" }}>
              Most platforms just host your product. Veelage is engineered to squeeze every naira of revenue out of your traffic.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
            {[
              { title: "Sales pages that sell",      desc: "Your product gets a page built to convert — not just look good." },
              { title: "Sell more per order",        desc: "Add upsells and order bumps so every checkout earns you more." },
              { title: "Win back lost buyers",       desc: "Automated emails chase people who didn't complete payment — using your name, not ours." },
              { title: "See where you lose sales",   desc: "Know exactly how many people viewed, started checkout, and paid. Fix what's broken." },
              { title: "Get paid instantly",         desc: "Money goes straight to your bank account after every sale." },
              { title: "Works on any phone",         desc: "Your buyers are on mobile. Your store is ready for them." },
            ].map((f) => (
              <div key={f.title} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "1.5rem" }}>
                <p style={{ fontWeight: 800, fontSize: 14, color: C.white, margin: "0 0 7px", letterSpacing: "-0.1px" }}>{f.title}</p>
                <p style={{ fontSize: 13, color: C.faint, margin: 0, lineHeight: 1.65 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHAT YOU CAN SELL */}
      <section style={{ background: C.cream, padding: "7rem 2rem" }}>
        <div style={{ maxWidth: 860, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 56, alignItems: "center" }}>
          <div>
            <p style={{ fontSize: 11, letterSpacing: "0.14em", color: C.burnt, textTransform: "uppercase", marginBottom: "0.75rem", fontWeight: 700 }}>WHAT YOU CAN SELL</p>
            <h2 style={{ fontSize: "clamp(1.9rem, 3.8vw, 2.7rem)", fontWeight: 900, letterSpacing: "-1.5px", color: C.charcoal, margin: "0 0 1.25rem", lineHeight: 1.1 }}>
              Any knowledge.<br />Any format.
            </h2>
            <p style={{ fontSize: 15, color: C.mid, lineHeight: 1.8, margin: "0 0 2rem" }}>
              Whatever your expertise — Veelage handles the business side so you can focus on creating.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[
                { icon: "📘", label: "Ebooks & PDFs" },
                { icon: "🎓", label: "Online courses" },
                { icon: "📋", label: "Templates" },
                { icon: "🎙️", label: "Coaching sessions" },
                { icon: "🎵", label: "Audio & beats" },
                { icon: "💻", label: "Software & tools" },
              ].map((item) => (
                <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 10, background: C.white, border: `1px solid ${C.faint}44`, borderRadius: 12, padding: "11px 14px", boxShadow: shadow.card }}>
                  <span style={{ fontSize: 16 }}>{item.icon}</span>
                  <span style={{ fontSize: 13, color: C.charcoal, fontWeight: 500 }}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ background: `linear-gradient(160deg, ${C.cream2} 0%, ${C.burntBg} 100%)`, border: `1.5px solid ${C.faint}55`, borderRadius: 22, padding: "1.75rem", boxShadow: shadow.heavy }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: C.burnt, margin: "0 0 16px", textTransform: "uppercase", letterSpacing: "0.08em" }}>Featured products</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { title: "Financial Freedom Blueprint", price: "₦12,500", sales: "1,241 sold", tag: "📘 Ebook" },
                { title: "Crypto for Beginners",        price: "₦8,000",  sales: "842 sold",   tag: "🎓 Course" },
                { title: "Brand Identity Kit",          price: "₦25,000", sales: "318 sold",   tag: "📋 Template" },
              ].map((p) => (
                <div key={p.title} style={{ background: C.white, borderRadius: 14, padding: "14px 16px", boxShadow: shadow.card }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <p style={{ margin: "0 0 4px", fontSize: 13, fontWeight: 700, color: C.charcoal }}>{p.title}</p>
                      <p style={{ margin: 0, fontSize: 11, color: C.faint }}>{p.tag} · {p.sales}</p>
                    </div>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: C.burnt, whiteSpace: "nowrap", marginLeft: 8 }}>{p.price}</p>
                  </div>
                </div>
              ))}
              <Link href="/login" style={{ background: C.cta, borderRadius: 14, padding: "14px 16px", textAlign: "center", color: C.white, fontWeight: 700, fontSize: 13, textDecoration: "none", display: "block", boxShadow: shadow.glow }}>
                Start selling your products →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section style={{ background: C.cream2, padding: "7rem 2rem" }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
            <p style={{ fontSize: 11, letterSpacing: "0.14em", color: C.burnt, textTransform: "uppercase", marginBottom: "0.75rem", fontWeight: 700 }}>CREATOR STORIES</p>
            <h2 style={{ fontSize: "clamp(1.9rem, 3.8vw, 2.9rem)", fontWeight: 900, letterSpacing: "-1.5px", color: C.charcoal, margin: 0 }}>
              Real creators. Real results.
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
            {[
              { name: "Ngozi A.",  role: "Finance Coach · Lagos",         quote: "I made ₦280,000 in my first month. Veelage made it stupidly simple to start selling.", avatar: "N" },
              { name: "Tunde M.", role: "Tech Educator · Abuja",          quote: "My Figma course has sold 600+ copies. The payout hits my account the same day.",        avatar: "T" },
              { name: "Chioma E.", role: "Brand Strategist · Port Harcourt", quote: "I've replaced my 9-5 income with digital product sales. Veelage is the reason.",     avatar: "C" },
            ].map((t) => (
              <div key={t.name} style={{ background: C.white, border: `1px solid ${C.faint}44`, borderRadius: 18, padding: "1.75rem", boxShadow: shadow.card }}>
                <p style={{ fontSize: 32, margin: "0 0 12px", color: C.burntBg, lineHeight: 1 }}>&ldquo;</p>
                <p style={{ fontSize: 14, color: C.mid, lineHeight: 1.75, margin: "0 0 22px" }}>{t.quote}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: C.burntBg, display: "flex", alignItems: "center", justifyContent: "center", color: C.burnt, fontWeight: 800, fontSize: 14, flexShrink: 0 }}>{t.avatar}</div>
                  <div>
                    <p style={{ margin: 0, fontSize: 13, color: C.charcoal, fontWeight: 700 }}>{t.name}</p>
                    <p style={{ margin: 0, fontSize: 11, color: C.faint }}>{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ background: C.white, padding: "7rem 2rem" }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <p style={{ fontSize: 11, letterSpacing: "0.14em", color: C.burnt, textTransform: "uppercase", marginBottom: "0.75rem", fontWeight: 700 }}>FAQ</p>
            <h2 style={{ fontSize: "clamp(1.9rem, 3.8vw, 2.6rem)", fontWeight: 900, letterSpacing: "-1.5px", color: C.charcoal, margin: 0 }}>Common questions</h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { q: "Is it free to join?",                             a: "Yes. Creating an account and listing products is free. Veelage takes a small percentage only when you make a sale." },
              { q: "How do I get paid?",                              a: "Payouts go directly to your Nigerian bank account. Withdraw anytime from your dashboard." },
              { q: "What can I sell?",                                a: "Ebooks, courses, templates, audio files, software, coaching — any digital product or service." },
              { q: "Do I need technical skills?",                     a: "None at all. If you can type and upload a file, you can sell on Veelage." },
              { q: "Can I buy products too if I'm a creator?",        a: "Absolutely. You can switch between your creator and buyer dashboards anytime." },
            ].map((faq) => (
              <details key={faq.q} style={{ background: C.cream, border: `1px solid ${C.faint}55`, borderRadius: 14, padding: "1.1rem 1.4rem", cursor: "pointer" }}>
                <summary style={{ fontWeight: 700, fontSize: 14, color: C.charcoal, listStyle: "none", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  {faq.q}
                  <span className="faq-plus" style={{ color: C.burnt, fontWeight: 600, flexShrink: 0, marginLeft: 12, fontSize: 20, lineHeight: 1 }}>+</span>
                </summary>
                <p style={{ fontSize: 14, color: C.mid, lineHeight: 1.75, margin: "0.85rem 0 0" }}>{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={{ background: `linear-gradient(160deg, ${C.burntDim} 0%, ${C.cta} 60%, ${C.burnt} 100%)`, padding: "7rem 2rem", textAlign: "center" }}>
        <p style={{ fontSize: 12, letterSpacing: "0.14em", color: `${C.burntBg}cc`, textTransform: "uppercase", marginBottom: "1rem", fontWeight: 700 }}>READY TO START?</p>
        <h2 style={{ fontSize: "clamp(2rem, 5vw, 3.4rem)", fontWeight: 900, letterSpacing: "-2px", color: C.white, lineHeight: 1.05, marginBottom: "1.5rem" }}>
          Your creator business<br />starts here.
        </h2>
        <p style={{ fontSize: 16, color: "rgba(255,255,255,0.6)", lineHeight: 1.75, maxWidth: 380, margin: "0 auto 3rem" }}>
          Join thousands of African creators turning their expertise into income.
        </p>
        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/login" style={{ textDecoration: "none", background: C.white, color: C.cta, fontWeight: 800, fontSize: 15, padding: "16px 34px", borderRadius: 14, letterSpacing: "-0.3px" }}>
            Start selling →
          </Link>
          <Link href="/account/login" style={{ textDecoration: "none", background: "rgba(255,255,255,0.12)", color: C.white, fontWeight: 700, fontSize: 15, padding: "16px 34px", borderRadius: 14, border: "1.5px solid rgba(255,255,255,0.25)" }}>
            Browse products
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: C.charcoal, borderTop: `1px solid ${C.faint}22`, padding: "2.5rem 2rem", textAlign: "center" }}>
        <p style={{ margin: "0 0 6px", fontSize: 18, fontWeight: 900, color: C.white, letterSpacing: "-0.3px" }}>Veelage</p>
        <p style={{ color: C.faint, fontSize: 12, margin: 0 }}>© {new Date().getFullYear()} Veelage. All rights reserved.</p>
      </footer>

    </main>
  );
}
