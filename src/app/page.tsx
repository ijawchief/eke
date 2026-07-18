"use client";
import { useState } from "react";

const BARS = [42, 61, 38, 75, 55, 88, 64, 95, 72, 100, 83, 91];
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function DashboardMockup() {
  return (
    <div style={{
      background: "#111", border: "1px solid #222", borderRadius: 20, overflow: "hidden",
      maxWidth: 780, margin: "0 auto", boxShadow: "0 40px 80px rgba(0,0,0,0.18)",
    }}>
      <div style={{ background: "#0d0d0d", borderBottom: "1px solid #1e1e1e", padding: "12px 20px", display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#3a3a3a", display: "inline-block" }} />
        <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#3a3a3a", display: "inline-block" }} />
        <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#3a3a3a", display: "inline-block" }} />
        <span style={{ flex: 1, textAlign: "center", fontSize: 11, color: "#3a3a3a", letterSpacing: "0.02em" }}>veelage — creator dashboard</span>
      </div>
      <div style={{ padding: "28px 28px 32px", display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <p style={{ margin: 0, fontSize: 13, color: "#555" }}>Good morning, Chidi 👋</p>
            <p style={{ margin: "4px 0 0", fontSize: 17, fontWeight: 700, color: "#fff", letterSpacing: "-0.5px" }}>Your earnings this year</p>
          </div>
          <div style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 8, padding: "6px 14px", fontSize: 12, color: "#666" }}>2025</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          {[
            { label: "Total revenue", value: "₦103,847,200", sub: "+24% vs last year", up: true },
            { label: "Total sales", value: "2,841", sub: "across all products", up: false },
            { label: "Avg. order value", value: "₦35,200", sub: "+8% vs last month", up: true },
          ].map((c) => (
            <div key={c.label} style={{ background: "#161616", border: "1px solid #222", borderRadius: 12, padding: "14px 16px" }}>
              <p style={{ margin: "0 0 6px", fontSize: 10, color: "#555", letterSpacing: "0.06em", textTransform: "uppercase" }}>{c.label}</p>
              <p style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 700, color: "#fff", letterSpacing: "-0.5px" }}>{c.value}</p>
              <p style={{ margin: 0, fontSize: 11, color: c.up ? "#f472b6" : "#666" }}>{c.sub}</p>
            </div>
          ))}
        </div>
        <div style={{ background: "#161616", border: "1px solid #222", borderRadius: 12, padding: "18px 18px 14px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: "#ccc" }}>Monthly revenue</p>
            <p style={{ margin: 0, fontSize: 11, color: "#444" }}>₦ Naira</p>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 80 }}>
            {BARS.map((h, i) => (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
                <div style={{ width: "100%", height: `${h}%`, background: i === 11 ? "#f472b6" : "#2a2a2a", borderRadius: 3 }} />
                <span style={{ fontSize: 8, color: "#444" }}>{MONTHS[i]}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ background: "#161616", border: "1px solid #222", borderRadius: 12, overflow: "hidden" }}>
          <div style={{ padding: "12px 16px", borderBottom: "1px solid #1e1e1e" }}>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: "#ccc" }}>Recent sales</p>
          </div>
          {[
            { name: "Adaeze O.", product: "Financial Freedom Blueprint", amount: "₦12,500", time: "2 min ago" },
            { name: "Emeka T.", product: "Crypto Investing for Beginners", amount: "₦8,000", time: "18 min ago" },
            { name: "Fatima A.", product: "Financial Freedom Blueprint", amount: "₦12,500", time: "1 hr ago" },
          ].map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 16px", borderBottom: i < 2 ? "1px solid #1a1a1a" : "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#222", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#666", fontWeight: 600, flexShrink: 0 }}>{s.name[0]}</div>
                <div>
                  <p style={{ margin: 0, fontSize: 12, color: "#ddd", fontWeight: 500 }}>{s.name}</p>
                  <p style={{ margin: 0, fontSize: 10, color: "#555" }}>{s.product}</p>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ margin: 0, fontSize: 12, color: "#fff", fontWeight: 600 }}>{s.amount}</p>
                <p style={{ margin: 0, fontSize: 10, color: "#444" }}>{s.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: 11, letterSpacing: "0.14em", color: "#f472b6", textTransform: "uppercase", marginBottom: "0.75rem", fontWeight: 700 }}>
      {children}
    </p>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{ fontSize: "clamp(1.9rem, 3.8vw, 2.9rem)", fontWeight: 800, letterSpacing: "-1.5px", color: "#0a0a0a", lineHeight: 1.1, margin: 0 }}>
      {children}
    </h2>
  );
}

export default function Home() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/waitlist", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
      if (!res.ok) { const d = await res.json().catch(() => ({})); setError(d.error ?? "Something went wrong."); }
      else setSubmitted(true);
    } catch { setError("Something went wrong."); }
    finally { setLoading(false); }
  }

  const inputStyle: React.CSSProperties = {
    flex: 1, minWidth: 200, padding: "14px 18px", borderRadius: 12, border: "1px solid #e5e5e5",
    background: "#fff", color: "#111", fontSize: 15, outline: "none",
  };
  const btnStyle: React.CSSProperties = {
    padding: "14px 28px", borderRadius: 12, background: "#f472b6", color: "#fff",
    fontWeight: 700, fontSize: 15, border: "none", cursor: loading ? "not-allowed" : "pointer",
    opacity: loading ? 0.6 : 1, whiteSpace: "nowrap",
  };

  return (
    <main style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", background: "#f9f9f7" }}>

      {/* Nav */}
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.25rem 2.5rem", borderBottom: "1px solid #ebebeb", background: "#fff", position: "sticky", top: 0, zIndex: 100 }}>
        <span style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.5px", color: "#0a0a0a" }}>Veelage</span>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <a href="#how-it-works" style={{ fontSize: 13, color: "#666", textDecoration: "none", fontWeight: 500 }}>How it works</a>
          <a href="#features" style={{ fontSize: 13, color: "#666", textDecoration: "none", fontWeight: 500 }}>Features</a>
          <a href="/admin" style={{ fontSize: 13, color: "#0a0a0a", textDecoration: "none", fontWeight: 600, background: "#f4f4f4", border: "1px solid #e5e5e5", padding: "7px 16px", borderRadius: 8 }}>Sign in</a>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section style={{ maxWidth: 700, margin: "0 auto", padding: "6rem 2rem 4rem", textAlign: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "#fff5f9", border: "1px solid #fce7f3", borderRadius: 100, padding: "5px 14px", marginBottom: "1.75rem" }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#f472b6", display: "inline-block" }} />
          <span style={{ fontSize: 12, color: "#db2777", letterSpacing: "0.04em", fontWeight: 600 }}>invite only · limited spots available</span>
        </div>

        <p style={{ fontSize: 12, letterSpacing: "0.14em", color: "#999", textTransform: "uppercase", marginBottom: "1rem", fontWeight: 700 }}>
          The home for creator businesses
        </p>

        <h1 style={{ fontSize: "clamp(2.6rem, 6vw, 4.2rem)", fontWeight: 900, lineHeight: 1.05, letterSpacing: "-2.5px", marginBottom: "1.5rem", color: "#0a0a0a" }}>
          Turn your knowledge<br />
          <span style={{ color: "#f472b6" }}>and expertise</span><br />
          into a business.
        </h1>

        <p style={{ fontSize: 17, color: "#777", lineHeight: 1.7, marginBottom: "2.5rem", maxWidth: 480, marginLeft: "auto", marginRight: "auto" }}>
          Veelage gives you everything you need to sell digital products, courses, and consulting — and get paid, without the tech headache.
        </p>

        {submitted ? (
          <div style={{ background: "#fff5f9", border: "1px solid #fbc8e0", borderRadius: 14, padding: "1.5rem 2rem", display: "inline-block" }}>
            <p style={{ color: "#db2777", fontWeight: 700, margin: 0, fontSize: 16 }}>You&apos;re on the list.</p>
            <p style={{ color: "#aaa", fontSize: 13, margin: "0.4rem 0 0" }}>We&apos;ll reach out when your spot is ready.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", gap: 10, maxWidth: 440, margin: "0 auto", flexWrap: "wrap", justifyContent: "center" }}>
            <input type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required style={inputStyle} />
            <button type="submit" disabled={loading} style={btnStyle}>{loading ? "Joining…" : "Join waitlist →"}</button>
            {error && <p style={{ width: "100%", color: "#dc2626", fontSize: 13, margin: "4px 0 0", textAlign: "center" }}>{error}</p>}
          </form>
        )}

        <p style={{ fontSize: 12, color: "#bbb", marginTop: "1rem" }}>Free to join · No credit card required</p>
      </section>

      {/* Dashboard mockup */}
      <section style={{ padding: "0 2rem 5rem", maxWidth: 860, margin: "0 auto" }}>
        <DashboardMockup />
      </section>

      {/* ─── SOCIAL PROOF STRIP ─── */}
      <section style={{ background: "#fff", borderTop: "1px solid #ebebeb", borderBottom: "1px solid #ebebeb", padding: "2rem" }}>
        <div style={{ maxWidth: 860, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center", flexWrap: "wrap", gap: 48 }}>
          {[
            { value: "₦2B+", label: "Creator earnings" },
            { value: "50,000+", label: "Products sold" },
            { value: "4,200+", label: "Active creators" },
            { value: "98%", label: "Payout success rate" },
          ].map((s) => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <p style={{ fontSize: 28, fontWeight: 900, color: "#0a0a0a", margin: 0, letterSpacing: "-1px" }}>{s.value}</p>
              <p style={{ fontSize: 12, color: "#999", margin: "4px 0 0", fontWeight: 500 }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section id="how-it-works" style={{ maxWidth: 860, margin: "0 auto", padding: "7rem 2rem 5rem", textAlign: "center" }}>
        <SectionLabel>IT&apos;S THAT SIMPLE</SectionLabel>
        <SectionHeading>Sell online in 3 simple steps</SectionHeading>
        <p style={{ fontSize: 15, color: "#888", lineHeight: 1.7, maxWidth: 400, margin: "1rem auto 4rem" }}>
          Get started in minutes and make your first sale the same day.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 20 }}>
          {[
            {
              step: "Step 1",
              icon: "🚀",
              title: "Create an Account",
              desc: "Create your free account in under 2 minutes. No credit card, no setup fees.",
              visual: (
                <div style={{ background: "linear-gradient(135deg, #f0f4ff 0%, #e8eeff 100%)", borderRadius: 14, padding: "24px 20px", marginBottom: 20 }}>
                  <div style={{ background: "#fff", borderRadius: 10, padding: "16px", boxShadow: "0 4px 16px rgba(0,0,0,0.06)" }}>
                    <p style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 700, color: "#333" }}>Register Now</p>
                    {["Email address", "Password"].map((f) => (
                      <div key={f} style={{ background: "#f9f9f9", border: "1px solid #eee", borderRadius: 7, padding: "8px 12px", marginBottom: 8, fontSize: 11, color: "#bbb" }}>{f}</div>
                    ))}
                    <div style={{ background: "#f472b6", borderRadius: 7, padding: "8px", textAlign: "center", color: "#fff", fontSize: 12, fontWeight: 700, marginTop: 12 }}>Get Started →</div>
                  </div>
                </div>
              ),
            },
            {
              step: "Step 2",
              icon: "📦",
              title: "Upload Your Product",
              desc: "Upload your ebook, course, template, or any digital file. We build your sales page instantly.",
              visual: (
                <div style={{ background: "linear-gradient(135deg, #fff5f9 0%, #ffe4f0 100%)", borderRadius: 14, padding: "24px 20px", marginBottom: 20 }}>
                  <div style={{ background: "#fff", borderRadius: 10, padding: "16px", boxShadow: "0 4px 16px rgba(0,0,0,0.06)" }}>
                    <p style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 700, color: "#333" }}>Create Product</p>
                    {["Product name", "Price", "Upload file or link"].map((f) => (
                      <div key={f} style={{ background: "#f9f9f9", border: "1px solid #eee", borderRadius: 7, padding: "8px 12px", marginBottom: 8, fontSize: 11, color: "#bbb" }}>{f}</div>
                    ))}
                    <div style={{ background: "#f472b6", borderRadius: 7, padding: "8px", textAlign: "center", color: "#fff", fontSize: 12, fontWeight: 700, marginTop: 12 }}>Publish →</div>
                  </div>
                </div>
              ),
            },
            {
              step: "Step 3",
              icon: "💰",
              title: "Sell & Get Paid",
              desc: "Share your link. Buyers pay securely and get instant access. Money hits your account automatically.",
              visual: (
                <div style={{ background: "linear-gradient(135deg, #f0fff4 0%, #dcfce7 100%)", borderRadius: 14, padding: "24px 20px", marginBottom: 20 }}>
                  <div style={{ background: "#fff", borderRadius: 10, padding: "16px", boxShadow: "0 4px 16px rgba(0,0,0,0.06)" }}>
                    <p style={{ margin: "0 0 4px", fontSize: 11, color: "#999" }}>Today&apos;s earnings</p>
                    <p style={{ margin: "0 0 12px", fontSize: 22, fontWeight: 900, color: "#0a0a0a", letterSpacing: "-1px" }}>₦284,500</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {["Adaeze O. — ₦12,500", "Emeka T. — ₦8,000", "Fatima A. — ₦12,500"].map((t) => (
                        <div key={t} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", flexShrink: 0 }} />
                          <span style={{ fontSize: 11, color: "#555" }}>{t}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ),
            },
          ].map((s) => (
            <div key={s.step} style={{ background: "#fff", border: "1px solid #ebebeb", borderRadius: 18, padding: "2rem", textAlign: "left" }}>
              {s.visual}
              <p style={{ fontSize: 10, letterSpacing: "0.1em", color: "#f472b6", margin: "0 0 8px", fontWeight: 700, textTransform: "uppercase" }}>{s.step}</p>
              <p style={{ fontWeight: 800, fontSize: 17, margin: "0 0 8px", color: "#0a0a0a", letterSpacing: "-0.3px" }}>{s.title}</p>
              <p style={{ fontSize: 13, color: "#888", margin: 0, lineHeight: 1.65 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section id="features" style={{ background: "#fff", borderTop: "1px solid #ebebeb", padding: "7rem 2rem" }}>
        <div style={{ maxWidth: 860, margin: "0 auto", textAlign: "center", marginBottom: "4rem" }}>
          <SectionLabel>EVERYTHING YOU NEED</SectionLabel>
          <SectionHeading>One platform. Every tool.</SectionHeading>
          <p style={{ fontSize: 15, color: "#888", lineHeight: 1.7, maxWidth: 440, margin: "1rem auto 0" }}>
            Veelage gives you a full business stack — no third-party tools, no duct tape.
          </p>
        </div>

        <div style={{ maxWidth: 860, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
          {[
            { icon: "🛍️", title: "Beautiful Sales Pages", desc: "Auto-generated product pages that convert. No design skills needed." },
            { icon: "💳", title: "Instant Payouts", desc: "Get paid directly to your Nigerian bank account after every sale. No delays." },
            { icon: "📊", title: "Sales Analytics", desc: "Track revenue, top products, and buyer behaviour in one clean dashboard." },
            { icon: "📧", title: "Email Delivery", desc: "Customers get their download links automatically — we handle everything." },
            { icon: "🔗", title: "Custom Links", desc: "Your products live at your own branded link. Clean and professional." },
            { icon: "📱", title: "Mobile Optimised", desc: "Your storefront looks great on every device. Buyers can pay from anywhere." },
          ].map((f) => (
            <div key={f.title} style={{ background: "#f9f9f7", border: "1px solid #ebebeb", borderRadius: 14, padding: "1.75rem" }}>
              <p style={{ fontSize: 26, margin: "0 0 12px" }}>{f.icon}</p>
              <p style={{ fontWeight: 700, fontSize: 15, color: "#0a0a0a", margin: "0 0 6px", letterSpacing: "-0.2px" }}>{f.title}</p>
              <p style={{ fontSize: 13, color: "#888", margin: 0, lineHeight: 1.65 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── PRODUCT TYPES ─── */}
      <section style={{ maxWidth: 860, margin: "0 auto", padding: "7rem 2rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 40, alignItems: "center" }}>
          <div>
            <SectionLabel>WHAT YOU CAN SELL</SectionLabel>
            <SectionHeading>Any knowledge.<br />Any format.</SectionHeading>
            <p style={{ fontSize: 15, color: "#888", lineHeight: 1.75, margin: "1.25rem 0 2rem" }}>
              Whatever your expertise — Veelage handles the business side so you can focus on creating.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { icon: "📘", label: "Ebooks & PDFs" },
                { icon: "🎓", label: "Online courses & videos" },
                { icon: "📋", label: "Templates & toolkits" },
                { icon: "🎙️", label: "Coaching & consulting" },
                { icon: "🎵", label: "Audio & music beats" },
                { icon: "💻", label: "Software & digital tools" },
              ].map((item) => (
                <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 18 }}>{item.icon}</span>
                  <span style={{ fontSize: 14, color: "#444", fontWeight: 500 }}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ background: "linear-gradient(135deg, #fff5f9 0%, #fce7f3 100%)", border: "1px solid #fce7f3", borderRadius: 20, padding: "2rem" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { title: "Financial Freedom Blueprint", price: "₦12,500", sales: "1,241 sold", tag: "📘 Ebook" },
                { title: "Crypto for Beginners", price: "₦8,000", sales: "842 sold", tag: "🎓 Course" },
                { title: "Brand Identity Kit", price: "₦25,000", sales: "318 sold", tag: "📋 Template" },
              ].map((p) => (
                <div key={p.title} style={{ background: "#fff", borderRadius: 12, padding: "14px 16px", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <p style={{ margin: "0 0 3px", fontSize: 13, fontWeight: 600, color: "#0a0a0a" }}>{p.title}</p>
                      <p style={{ margin: 0, fontSize: 11, color: "#aaa" }}>{p.tag} · {p.sales}</p>
                    </div>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: "#f472b6", whiteSpace: "nowrap", marginLeft: 8 }}>{p.price}</p>
                  </div>
                </div>
              ))}
              <div style={{ background: "#f472b6", borderRadius: 12, padding: "14px 16px", textAlign: "center" }}>
                <p style={{ margin: 0, color: "#fff", fontWeight: 700, fontSize: 13 }}>+ Add your product →</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section style={{ background: "#0a0a0a", padding: "7rem 2rem" }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
            <SectionLabel>CREATOR STORIES</SectionLabel>
            <h2 style={{ fontSize: "clamp(1.9rem, 3.8vw, 2.9rem)", fontWeight: 800, letterSpacing: "-1.5px", color: "#fff", lineHeight: 1.1, margin: 0 }}>
              Real creators. Real results.
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
            {[
              { name: "Ngozi A.", role: "Finance Coach · Lagos", quote: "I made ₦280,000 in my first month. Veelage made it stupidly simple to start selling.", avatar: "N" },
              { name: "Tunde M.", role: "Tech Educator · Abuja", quote: "My Figma course has sold 600+ copies. The payout hits my account the same day.", avatar: "T" },
              { name: "Chioma E.", role: "Brand Strategist · PH", quote: "I've replaced my 9-5 income with digital product sales. Veelage is the reason.", avatar: "C" },
            ].map((t) => (
              <div key={t.name} style={{ background: "#161616", border: "1px solid #222", borderRadius: 16, padding: "1.75rem" }}>
                <p style={{ fontSize: 24, margin: "0 0 16px", color: "#f472b6" }}>&ldquo;</p>
                <p style={{ fontSize: 14, color: "#ccc", lineHeight: 1.7, margin: "0 0 20px" }}>{t.quote}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#f472b6", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 14, flexShrink: 0 }}>{t.avatar}</div>
                  <div>
                    <p style={{ margin: 0, fontSize: 13, color: "#fff", fontWeight: 600 }}>{t.name}</p>
                    <p style={{ margin: 0, fontSize: 11, color: "#555" }}>{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section style={{ maxWidth: 640, margin: "0 auto", padding: "7rem 2rem" }}>
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <SectionLabel>FAQ</SectionLabel>
          <SectionHeading>Common questions</SectionHeading>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[
            { q: "Is it really free to join?", a: "Yes. Creating an account and listing products is free. Veelage takes a small percentage only when you make a sale." },
            { q: "How do I get paid?", a: "Payouts go directly to your Nigerian bank account. You can request a withdrawal anytime from your dashboard." },
            { q: "What can I sell?", a: "Ebooks, courses, templates, audio files, software, coaching sessions — any digital product or service works." },
            { q: "Do I need technical skills?", a: "None at all. If you can type and upload a file, you can sell on Veelage." },
            { q: "How fast will I get access?", a: "We're currently invite-only. Join the waitlist and we'll give you early access as spots open up." },
          ].map((faq) => (
            <details key={faq.q} style={{ background: "#fff", border: "1px solid #ebebeb", borderRadius: 12, padding: "1.25rem 1.5rem", cursor: "pointer" }}>
              <summary style={{ fontWeight: 700, fontSize: 14, color: "#0a0a0a", listStyle: "none", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                {faq.q}
                <span style={{ color: "#ccc", fontWeight: 400, flexShrink: 0, marginLeft: 12 }}>＋</span>
              </summary>
              <p style={{ fontSize: 14, color: "#777", lineHeight: 1.7, margin: "0.75rem 0 0" }}>{faq.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section style={{ background: "#0a0a0a", padding: "7rem 2rem", textAlign: "center" }}>
        <p style={{ fontSize: 12, letterSpacing: "0.14em", color: "#f472b6", textTransform: "uppercase", marginBottom: "1rem", fontWeight: 700 }}>
          Ready to start?
        </p>
        <h2 style={{ fontSize: "clamp(2rem, 4.5vw, 3.2rem)", fontWeight: 900, letterSpacing: "-2px", color: "#fff", lineHeight: 1.1, marginBottom: "1.5rem" }}>
          Your creator business<br />starts here.
        </h2>
        <p style={{ fontSize: 15, color: "#666", lineHeight: 1.7, maxWidth: 380, margin: "0 auto 2.5rem" }}>
          Join thousands of African creators turning their expertise into income.
        </p>
        {submitted ? (
          <div style={{ background: "#1a1a1a", border: "1px solid #333", borderRadius: 14, padding: "1.5rem 2rem", display: "inline-block" }}>
            <p style={{ color: "#f472b6", fontWeight: 700, margin: 0, fontSize: 16 }}>You&apos;re on the list! 🎉</p>
            <p style={{ color: "#666", fontSize: 13, margin: "0.4rem 0 0" }}>We&apos;ll reach out when your spot opens up.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", gap: 10, maxWidth: 440, margin: "0 auto", flexWrap: "wrap", justifyContent: "center" }}>
            <input type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required
              style={{ ...inputStyle, background: "#1a1a1a", border: "1px solid #333", color: "#fff" }} />
            <button type="submit" disabled={loading} style={btnStyle}>{loading ? "Joining…" : "Join waitlist →"}</button>
            {error && <p style={{ width: "100%", color: "#f87171", fontSize: 13, margin: "4px 0 0", textAlign: "center" }}>{error}</p>}
          </form>
        )}
      </section>

      {/* Footer */}
      <footer style={{ background: "#0a0a0a", borderTop: "1px solid #1a1a1a", padding: "2rem", textAlign: "center" }}>
        <p style={{ margin: "0 0 6px", fontSize: 16, fontWeight: 800, color: "#333", letterSpacing: "-0.3px" }}>Veelage</p>
        <p style={{ color: "#333", fontSize: 12, margin: 0 }}>© {new Date().getFullYear()} Veelage · Oporo System Ltd</p>
      </footer>
    </main>
  );
}
