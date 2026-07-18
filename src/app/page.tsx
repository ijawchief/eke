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
      boxShadow: "0 40px 80px rgba(0,0,0,0.15)",
    }}>
      <div style={{ background: "#0d0d0d", borderBottom: "1px solid #1e1e1e", padding: "12px 20px", display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ width: 12, height: 12, borderRadius: "50%", background: "#333", display: "inline-block" }} />
        <span style={{ width: 12, height: 12, borderRadius: "50%", background: "#333", display: "inline-block" }} />
        <span style={{ width: 12, height: 12, borderRadius: "50%", background: "#333", display: "inline-block" }} />
        <span style={{ flex: 1, textAlign: "center", fontSize: 12, color: "#444", letterSpacing: "0.02em" }}>eke — creator dashboard</span>
      </div>

      <div style={{ padding: "28px 28px 32px", display: "flex", flexDirection: "column", gap: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <p style={{ margin: 0, fontSize: 13, color: "#555" }}>Good morning, Chidi 👋</p>
            <p style={{ margin: "4px 0 0", fontSize: 18, fontWeight: 700, color: "#fff", letterSpacing: "-0.5px" }}>Your earnings this year</p>
          </div>
          <div style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 8, padding: "6px 14px", fontSize: 12, color: "#666" }}>2025</div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
          {[
            { label: "Total revenue", value: "₦103,847,200", sub: "+24% vs last year", up: true },
            { label: "Total sales", value: "2,841", sub: "across all products", up: false },
            { label: "Avg. order value", value: "₦35,200", sub: "+8% vs last month", up: true },
          ].map((c) => (
            <div key={c.label} style={{ background: "#161616", border: "1px solid #222", borderRadius: 12, padding: "16px 18px" }}>
              <p style={{ margin: "0 0 8px", fontSize: 11, color: "#555", letterSpacing: "0.06em", textTransform: "uppercase" }}>{c.label}</p>
              <p style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 700, color: "#fff", letterSpacing: "-0.5px" }}>{c.value}</p>
              <p style={{ margin: 0, fontSize: 11, color: c.up ? "#f472b6" : "#666" }}>{c.sub}</p>
            </div>
          ))}
        </div>

        <div style={{ background: "#161616", border: "1px solid #222", borderRadius: 12, padding: "20px 20px 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#ccc" }}>Monthly revenue</p>
            <p style={{ margin: 0, fontSize: 11, color: "#444" }}>₦ Naira</p>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 90 }}>
            {BARS.map((h, i) => (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <div style={{ width: "100%", height: `${h}%`, background: i === 11 ? "#f472b6" : "#2a2a2a", borderRadius: 4 }} />
                <span style={{ fontSize: 9, color: "#444" }}>{MONTHS[i]}</span>
              </div>
            ))}
          </div>
        </div>

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
    <main style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", background: "#f9f9f7" }}>

      {/* Nav */}
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.25rem 2.5rem", borderBottom: "1px solid #ebebeb", background: "#f9f9f7" }}>
        <span style={{ fontSize: 19, fontWeight: 700, letterSpacing: "-0.5px", color: "#0a0a0a" }}>Veelage</span>
        <a href="/admin" style={{ fontSize: 13, color: "#aaa", textDecoration: "none" }}>sign in</a>
      </nav>

      {/* Hero */}
      <section style={{ maxWidth: 640, margin: "0 auto", padding: "5rem 2rem 3rem", textAlign: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "#fff", border: "1px solid #ebebeb", borderRadius: 100, padding: "5px 14px", marginBottom: "2rem" }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#f472b6", display: "inline-block", flexShrink: 0 }} />
          <span style={{ fontSize: 11, color: "#888", letterSpacing: "0.05em", fontWeight: 500 }}>invite only · limited spots available</span>
        </div>

        <p style={{ fontSize: 12, letterSpacing: "0.14em", color: "#888", textTransform: "uppercase", marginBottom: "1rem", fontWeight: 700 }}>
          Operating system for creators
        </p>

        <h1 style={{ fontSize: "clamp(2.4rem, 5.5vw, 3.8rem)", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-2px", marginBottom: "2.5rem", color: "#0a0a0a" }}>
          Turn your knowledge<br />
          <span style={{ color: "#999" }}>into passive income.</span>
        </h1>

        {submitted ? (
          <div style={{ background: "#fff5f9", border: "1px solid #fbc8e0", borderRadius: 12, padding: "1.5rem", display: "inline-block" }}>
            <p style={{ color: "#db2777", fontWeight: 700, margin: 0 }}>You&apos;re on the waitlist.</p>
            <p style={{ color: "#aaa", fontSize: 13, margin: "0.4rem 0 0" }}>We&apos;ll reach out when your spot is ready.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", gap: 10, maxWidth: 400, margin: "0 auto", flexWrap: "wrap", justifyContent: "center" }}>
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                flex: 1,
                minWidth: 200,
                padding: "13px 16px",
                borderRadius: 10,
                border: "1px solid #e5e5e5",
                background: "#fff",
                color: "#111",
                fontSize: 15,
                outline: "none",
              }}
            />
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "13px 24px",
                borderRadius: 10,
                background: "#f472b6",
                color: "#fff",
                fontWeight: 700,
                fontSize: 15,
                border: "none",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.6 : 1,
                whiteSpace: "nowrap",
              }}
            >
              {loading ? "Joining…" : "Join waitlist"}
            </button>
            {error && <p style={{ width: "100%", color: "#dc2626", fontSize: 13, margin: "4px 0 0", textAlign: "center" }}>{error}</p>}
          </form>
        )}
      </section>

      {/* Dashboard mockup */}
      <section style={{ padding: "2rem 2rem 0", maxWidth: 860, margin: "0 auto" }}>
        <DashboardMockup />
      </section>

      {/* How it works */}
      <section style={{ maxWidth: 800, margin: "0 auto", padding: "6rem 2rem 4rem", textAlign: "center" }}>
        <p style={{ fontSize: 11, letterSpacing: "0.14em", color: "#888", textTransform: "uppercase", marginBottom: "0.75rem", fontWeight: 700 }}>how it works</p>
        <h2 style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)", fontWeight: 800, letterSpacing: "-1px", marginBottom: "0.75rem", color: "#0a0a0a", lineHeight: 1.15 }}>
          Simple. Fast. Profitable.
        </h2>
        <p style={{ fontSize: 15, color: "#888", lineHeight: 1.7, maxWidth: 400, margin: "0 auto 3.5rem" }}>
          Get started in minutes and start making sales the same day.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 16, textAlign: "left" }}>
          {[
            { step: "01", title: "Sign up free", desc: "Create your account in seconds. No credit card needed." },
            { step: "02", title: "Create a product", desc: "Upload your ebook, course, or file. We build your sales page." },
            { step: "03", title: "Make sales", desc: "Share your link. Buyers pay and get instant access." },
            { step: "04", title: "Receive funds", desc: "Money hits your account automatically after every sale." },
          ].map((s) => (
            <div key={s.step} style={{ background: "#fff", border: "1px solid #ebebeb", borderRadius: 14, padding: "1.5rem" }}>
              <p style={{ fontSize: 10, letterSpacing: "0.12em", color: "#f472b6", margin: "0 0 10px", fontWeight: 700 }}>{s.step}</p>
              <p style={{ fontWeight: 700, fontSize: 15, margin: "0 0 6px", color: "#0a0a0a" }}>{s.title}</p>
              <p style={{ fontSize: 13, color: "#888", margin: 0, lineHeight: 1.6 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer style={{ borderTop: "1px solid #ebebeb", padding: "1.75rem", textAlign: "center" }}>
        <p style={{ color: "#ddd", fontSize: 12, margin: 0 }}>© {new Date().getFullYear()} Eke · Oporo System Ltd</p>
      </footer>
    </main>
  );
}
