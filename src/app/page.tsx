"use client";
import { useState } from "react";

const BARS = [42, 61, 38, 75, 55, 88, 64, 95, 72, 100, 83, 91];
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function DashboardMockup() {
  return (
    <div style={{
      background: "#111",
      border: "1px solid #222",
      borderRadius: 20,
      overflow: "hidden",
      maxWidth: 780,
      margin: "0 auto",
      boxShadow: "0 40px 80px rgba(0,0,0,0.6)",
    }}>
      {/* Titlebar */}
      <div style={{ background: "#0d0d0d", borderBottom: "1px solid #1e1e1e", padding: "12px 20px", display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ width: 12, height: 12, borderRadius: "50%", background: "#333", display: "inline-block" }} />
        <span style={{ width: 12, height: 12, borderRadius: "50%", background: "#333", display: "inline-block" }} />
        <span style={{ width: 12, height: 12, borderRadius: "50%", background: "#333", display: "inline-block" }} />
        <span style={{ flex: 1, textAlign: "center", fontSize: 12, color: "#444", letterSpacing: "0.02em" }}>eke — creator dashboard</span>
      </div>

      <div style={{ padding: "28px 28px 32px", display: "flex", flexDirection: "column", gap: 24 }}>
        {/* Greeting */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <p style={{ margin: 0, fontSize: 13, color: "#555" }}>Good morning, Chidi 👋</p>
            <p style={{ margin: "4px 0 0", fontSize: 18, fontWeight: 700, color: "#fff", letterSpacing: "-0.5px" }}>Your earnings this year</p>
          </div>
          <div style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 8, padding: "6px 14px", fontSize: 12, color: "#666" }}>2025</div>
        </div>

        {/* Stat cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
          {[
            { label: "Total revenue", value: "₦103,847,200", sub: "+24% vs last year", up: true },
            { label: "Total sales", value: "2,841", sub: "across all products", up: null },
            { label: "Avg. order value", value: "₦35,200", sub: "+8% vs last month", up: true },
          ].map((c) => (
            <div key={c.label} style={{ background: "#161616", border: "1px solid #222", borderRadius: 12, padding: "16px 18px" }}>
              <p style={{ margin: "0 0 8px", fontSize: 11, color: "#555", letterSpacing: "0.06em", textTransform: "uppercase" }}>{c.label}</p>
              <p style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 700, color: "#fff", letterSpacing: "-0.5px" }}>{c.value}</p>
              <p style={{ margin: 0, fontSize: 11, color: c.up ? "#f472b6" : "#666" }}>{c.sub}</p>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div style={{ background: "#161616", border: "1px solid #222", borderRadius: 12, padding: "20px 20px 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#ccc" }}>Monthly revenue</p>
            <p style={{ margin: 0, fontSize: 11, color: "#444" }}>₦ Naira</p>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 90 }}>
            {BARS.map((h, i) => (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <div style={{
                  width: "100%",
                  height: `${h}%`,
                  background: i === 11 ? "#f472b6" : "#2a2a2a",
                  borderRadius: 4,
                  transition: "height 0.3s",
                }} />
                <span style={{ fontSize: 9, color: "#444" }}>{MONTHS[i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent sales */}
        <div style={{ background: "#161616", border: "1px solid #222", borderRadius: 12, overflow: "hidden" }}>
          <div style={{ padding: "14px 18px", borderBottom: "1px solid #1e1e1e" }}>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#ccc" }}>Recent sales</p>
          </div>
          {[
            { name: "Adaeze O.", product: "Financial Freedom Blueprint", amount: "₦12,500", time: "2 min ago" },
            { name: "Emeka T.", product: "Crypto Investing for Beginners", amount: "₦8,000", time: "18 min ago" },
            { name: "Fatima A.", product: "Financial Freedom Blueprint", amount: "₦12,500", time: "1 hr ago" },
          ].map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 18px", borderBottom: i < 2 ? "1px solid #1a1a1a" : "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#222", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "#666", fontWeight: 600, flexShrink: 0 }}>
                  {s.name[0]}
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: 13, color: "#ddd", fontWeight: 500 }}>{s.name}</p>
                  <p style={{ margin: 0, fontSize: 11, color: "#555" }}>{s.product}</p>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ margin: 0, fontSize: 13, color: "#fff", fontWeight: 600 }}>{s.amount}</p>
                <p style={{ margin: 0, fontSize: 11, color: "#444" }}>{s.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
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
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setError(d.error ?? "Something went wrong. Try again.");
      } else {
        setSubmitted(true);
      }
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>

      {/* ── DARK HERO ── */}
      <div style={{ background: "#0a0a0a", color: "#fff" }}>
        <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.25rem 2.5rem", borderBottom: "1px solid #161616" }}>
          <span style={{ fontSize: 19, fontWeight: 700, letterSpacing: "-0.5px" }}>eke</span>
          <a href="/admin" style={{ fontSize: 13, color: "#555", textDecoration: "none" }}>sign in</a>
        </nav>

        <section style={{ maxWidth: 700, margin: "0 auto", padding: "6rem 2rem 2.5rem", textAlign: "center" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "#161616", border: "1px solid #232323", borderRadius: 100, padding: "5px 14px", marginBottom: "2rem" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#f472b6", display: "inline-block", flexShrink: 0 }} />
            <span style={{ fontSize: 11, color: "#666", letterSpacing: "0.05em" }}>invite only · limited spots available</span>
          </div>

          <h1 style={{ fontSize: "clamp(2.6rem, 6vw, 4.2rem)", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-2px", marginBottom: "1.5rem", color: "#fff" }}>
            Turn your knowledge<br />
            <span style={{ color: "#383838" }}>into passive income.</span>
          </h1>

          <p style={{ fontSize: 17, color: "#4a4a4a", lineHeight: 1.7, maxWidth: 420, margin: "0 auto 2.5rem" }}>
            We fund it. We market it. You earn — without lifting a finger.
          </p>

          <a
            href="#apply"
            style={{
              display: "inline-block",
              padding: "14px 32px",
              borderRadius: 10,
              background: "#f472b6",
              color: "#fff",
              fontWeight: 700,
              fontSize: 15,
              textDecoration: "none",
              letterSpacing: "-0.3px",
            }}
            onClick={(e) => {
              e.preventDefault();
              document.getElementById("apply")?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            Apply to work with us →
          </a>
        </section>

        {/* Dashboard mockup */}
        <section style={{ padding: "4rem 2rem 0", maxWidth: 860, margin: "0 auto" }}>
          <DashboardMockup />
        </section>

        {/* Fade into light */}
        <div style={{ height: 120, background: "linear-gradient(to bottom, #0a0a0a, #f9f9f7)" }} />
      </div>

      {/* ── LIGHT SECTION ── */}
      <div style={{ background: "#f9f9f7", color: "#111" }}>

        {/* How it works */}
        <section style={{ maxWidth: 800, margin: "0 auto", padding: "4rem 2rem", textAlign: "center" }}>
          <p style={{ fontSize: 11, letterSpacing: "0.14em", color: "#aaa", textTransform: "uppercase", marginBottom: "0.75rem" }}>how it works</p>
          <h2 style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)", fontWeight: 800, letterSpacing: "-1px", marginBottom: "0.75rem", color: "#0a0a0a", lineHeight: 1.15 }}>
            You bring the expertise.<br />
            <span style={{ color: "#bbb" }}>We handle the rest.</span>
          </h2>
          <p style={{ fontSize: 15, color: "#999", lineHeight: 1.7, maxWidth: 420, margin: "0 auto 3.5rem" }}>
            No upfront cost. No tech headaches. Just your knowledge — turned into a product that sells while you sleep.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 16, textAlign: "left" }}>
            {[
              { step: "01", title: "Apply", desc: "Tell us your area of expertise." },
              { step: "02", title: "We build", desc: "We create the product and sales page." },
              { step: "03", title: "We market", desc: "We run ads and drive buyers to you." },
              { step: "04", title: "You earn", desc: "Revenue hits your account automatically." },
            ].map((s) => (
              <div key={s.step} style={{ background: "#fff", border: "1px solid #ebebeb", borderRadius: 14, padding: "1.5rem" }}>
                <p style={{ fontSize: 10, letterSpacing: "0.12em", color: "#ccc", margin: "0 0 10px", fontWeight: 700 }}>{s.step}</p>
                <p style={{ fontWeight: 700, fontSize: 15, margin: "0 0 6px", color: "#0a0a0a" }}>{s.title}</p>
                <p style={{ fontSize: 13, color: "#aaa", margin: 0, lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Apply CTA */}
        <section id="apply" style={{ maxWidth: 520, margin: "0 auto", padding: "2rem 2rem 6rem" }}>
          <div style={{ background: "#fff", border: "1px solid #ebebeb", borderRadius: 20, padding: "2.5rem 2.5rem" }}>
            <p style={{ fontSize: 11, letterSpacing: "0.14em", color: "#ccc", textTransform: "uppercase", marginBottom: "0.75rem" }}>apply now</p>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 800, letterSpacing: "-0.5px", marginBottom: "0.5rem", color: "#0a0a0a", lineHeight: 1.2 }}>
              Ready to earn without the work?
            </h2>
            <p style={{ fontSize: 14, color: "#aaa", lineHeight: 1.7, marginBottom: "1.75rem" }}>
              Drop your email. We&apos;ll review your application and reach out within a few days. Spots are limited.
            </p>

            {submitted ? (
              <div style={{ background: "#f0faf4", border: "1px solid #bbf0cc", borderRadius: 10, padding: "1.25rem", textAlign: "center" }}>
                <p style={{ color: "#16a34a", fontWeight: 700, margin: 0 }}>Application received.</p>
                <p style={{ color: "#888", fontSize: 13, margin: "0.4rem 0 0" }}>We&apos;ll be in touch within a few days.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    padding: "13px 16px",
                    borderRadius: 10,
                    border: "1px solid #e5e5e5",
                    background: "#fafaf8",
                    color: "#111",
                    fontSize: 15,
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: "100%",
                    padding: "13px 24px",
                    borderRadius: 10,
                    background: "#f472b6",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: 15,
                    border: "none",
                    cursor: loading ? "not-allowed" : "pointer",
                    opacity: loading ? 0.6 : 1,
                    letterSpacing: "-0.2px",
                  }}
                >
                  {loading ? "Submitting…" : "Apply to work with us"}
                </button>
                {error && <p style={{ color: "#dc2626", fontSize: 13, margin: 0 }}>{error}</p>}
              </form>
            )}
          </div>
        </section>

        <footer style={{ borderTop: "1px solid #ebebeb", padding: "1.75rem", textAlign: "center" }}>
          <p style={{ color: "#ddd", fontSize: 12, margin: 0 }}>© {new Date().getFullYear()} Eke · Oporo System Ltd</p>
        </footer>
      </div>
    </main>
  );
}
