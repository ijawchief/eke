"use client";
import Link from "next/link";

const O = "#ea580c"; // burnt orange primary
const OL = "#fff7ed"; // orange light bg
const OB = "#7c2d12"; // orange dark

const BARS = [42, 61, 38, 75, 55, 88, 64, 95, 72, 100, 83, 91];
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function DashboardMockup() {
  return (
    <div style={{ background: "#111", border: "1px solid #222", borderRadius: 20, overflow: "hidden", maxWidth: 780, margin: "0 auto", boxShadow: "0 40px 100px rgba(234,88,12,0.12), 0 20px 40px rgba(0,0,0,0.3)" }}>
      <div style={{ background: "#0d0d0d", borderBottom: "1px solid #1e1e1e", padding: "12px 20px", display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#3a3a3a", display: "inline-block" }} />
        <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#3a3a3a", display: "inline-block" }} />
        <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#3a3a3a", display: "inline-block" }} />
        <span style={{ flex: 1, textAlign: "center", fontSize: 11, color: "#3a3a3a" }}>veelage — creator dashboard</span>
      </div>
      <div style={{ padding: "28px", display: "flex", flexDirection: "column", gap: 20 }}>
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
            { label: "Total sales", value: "2,841", sub: "across all products" },
            { label: "Avg. order", value: "₦35,200", sub: "+8% this month", up: true },
          ].map((c) => (
            <div key={c.label} style={{ background: "#161616", border: "1px solid #222", borderRadius: 12, padding: "14px 16px" }}>
              <p style={{ margin: "0 0 6px", fontSize: 10, color: "#555", letterSpacing: "0.06em", textTransform: "uppercase" }}>{c.label}</p>
              <p style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 700, color: "#fff", letterSpacing: "-0.5px" }}>{c.value}</p>
              <p style={{ margin: 0, fontSize: 11, color: c.up ? O : "#666" }}>{c.sub}</p>
            </div>
          ))}
        </div>
        <div style={{ background: "#161616", border: "1px solid #222", borderRadius: 12, padding: "18px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: "#ccc" }}>Monthly revenue</p>
            <p style={{ margin: 0, fontSize: 11, color: "#444" }}>₦ Naira</p>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 80 }}>
            {BARS.map((h, i) => (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
                <div style={{ width: "100%", height: `${h}%`, background: i === 11 ? O : "#2a2a2a", borderRadius: 3 }} />
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
                <div style={{ width: 30, height: 30, borderRadius: "50%", background: O + "33", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: O, fontWeight: 700, flexShrink: 0 }}>{s.name[0]}</div>
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

export default function Home() {
  return (
    <main style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", background: "#fafaf8" }}>

      {/* ─── NAV ─── */}
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem 1.25rem", background: "#fff", borderBottom: "1px solid #f0ece8", position: "sticky", top: 0, zIndex: 100 }}>
        <span style={{ fontSize: 20, fontWeight: 900, letterSpacing: "-0.5px", color: "#0a0a0a" }}>Veelage</span>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <a href="#how-it-works" style={{ fontSize: 13, color: "#666", textDecoration: "none", fontWeight: 500, display: "none" }} className="nav-link">How it works</a>
          <a href="#features" style={{ fontSize: 13, color: "#666", textDecoration: "none", fontWeight: 500, display: "none" }} className="nav-link">Features</a>
          <a href="/login" style={{ fontSize: 14, color: "#fff", textDecoration: "none", fontWeight: 700, background: O, padding: "10px 20px", borderRadius: 10, letterSpacing: "-0.2px", whiteSpace: "nowrap" }}>Get started</a>
        </div>
      </nav>
      <style>{`
        @media (min-width: 640px) { .nav-link { display: block !important; } }
      `}</style>

      {/* ─── HERO ─── */}
      <section style={{ background: `linear-gradient(160deg, #fff7ed 0%, #ffedd5 40%, #fed7aa 100%)`, padding: "6rem 2rem 5rem", textAlign: "center", position: "relative", overflow: "hidden" }}>
        {/* decorative blobs */}
        <div style={{ position: "absolute", top: -80, right: -80, width: 320, height: 320, borderRadius: "50%", background: "rgba(234,88,12,0.08)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -60, left: -60, width: 240, height: 240, borderRadius: "50%", background: "rgba(234,88,12,0.06)", pointerEvents: "none" }} />

        <div style={{ position: "relative", maxWidth: 680, margin: "0 auto" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "#fff", border: `1.5px solid ${O}33`, borderRadius: 100, padding: "5px 16px", marginBottom: "1.75rem" }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: O, display: "inline-block" }} />
            <span style={{ fontSize: 12, color: OB, fontWeight: 600, letterSpacing: "0.02em" }}>The home for creator businesses</span>
          </div>

          <h1 style={{ fontSize: "clamp(2.8rem, 6.5vw, 4.6rem)", fontWeight: 900, lineHeight: 1.0, letterSpacing: "-3px", marginBottom: "1.5rem", color: "#0a0a0a" }}>
            Turn your knowledge<br />
            <span style={{ color: O }}>and expertise</span><br />
            into a business.
          </h1>

          <p style={{ fontSize: 18, color: "#78350f", lineHeight: 1.7, marginBottom: "2.5rem", maxWidth: 460, marginLeft: "auto", marginRight: "auto" }}>
            Sell digital products, courses, and expertise — and get paid. No tech skills needed.
          </p>

          <Link href="/login" style={{ display: "inline-block", textDecoration: "none", background: O, color: "#fff", fontWeight: 800, fontSize: 17, padding: "16px 40px", borderRadius: 14, boxShadow: `0 8px 32px ${O}55`, letterSpacing: "-0.3px" }}>
            Start selling for free →
          </Link>
          <p style={{ fontSize: 13, color: "#92400e", marginTop: "1rem" }}>Free to join · No credit card required</p>
        </div>
      </section>

      {/* ─── STATS STRIP ─── */}
      <section style={{ background: "#0a0a0a", padding: "2.5rem 2rem" }}>
        <div style={{ maxWidth: 860, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center", flexWrap: "wrap", gap: 48 }}>
          {[
            { value: "₦2B+", label: "Creator earnings" },
            { value: "50,000+", label: "Products sold" },
            { value: "4,200+", label: "Active creators" },
            { value: "98%", label: "Payout success rate" },
          ].map((s) => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <p style={{ fontSize: 28, fontWeight: 900, color: O, margin: 0, letterSpacing: "-1px" }}>{s.value}</p>
              <p style={{ fontSize: 12, color: "#666", margin: "4px 0 0", fontWeight: 500 }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── DASHBOARD PREVIEW ─── */}
      <section style={{ background: "#111", padding: "6rem 2rem" }}>
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <p style={{ fontSize: 11, letterSpacing: "0.14em", color: O, textTransform: "uppercase", marginBottom: "0.75rem", fontWeight: 700 }}>YOUR BUSINESS, AT A GLANCE</p>
          <h2 style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)", fontWeight: 900, letterSpacing: "-1.5px", color: "#fff", margin: 0 }}>
            Everything in one dashboard
          </h2>
        </div>
        <DashboardMockup />
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section id="how-it-works" style={{ background: "#fafaf8", padding: "7rem 2rem" }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <p style={{ fontSize: 11, letterSpacing: "0.14em", color: O, textTransform: "uppercase", marginBottom: "0.75rem", fontWeight: 700 }}>IT&apos;S THAT SIMPLE</p>
            <h2 style={{ fontSize: "clamp(1.9rem, 3.8vw, 2.9rem)", fontWeight: 900, letterSpacing: "-1.5px", color: "#0a0a0a", margin: "0 0 1rem" }}>
              Sell online in 3 simple steps
            </h2>
            <p style={{ fontSize: 15, color: "#888", lineHeight: 1.7, maxWidth: 380, margin: "0 auto" }}>
              Get started in minutes and make your first sale the same day.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
            {[
              {
                step: "01", icon: "🚀", title: "Create an Account", desc: "Sign up free in under 2 minutes. No credit card, no setup fees.",
                visual: (
                  <div style={{ background: `linear-gradient(135deg, ${OL} 0%, #ffedd5 100%)`, borderRadius: 14, padding: "20px", marginBottom: 20 }}>
                    <div style={{ background: "#fff", borderRadius: 10, padding: "14px", boxShadow: "0 4px 16px rgba(0,0,0,0.06)" }}>
                      <p style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 700, color: "#333" }}>Register Now</p>
                      {["Email address", "Password"].map((f) => (
                        <div key={f} style={{ background: "#f9f9f9", border: "1px solid #eee", borderRadius: 7, padding: "8px 12px", marginBottom: 8, fontSize: 11, color: "#bbb" }}>{f}</div>
                      ))}
                      <div style={{ background: O, borderRadius: 7, padding: "8px", textAlign: "center", color: "#fff", fontSize: 12, fontWeight: 700, marginTop: 10 }}>Get Started →</div>
                    </div>
                  </div>
                ),
              },
              {
                step: "02", icon: "📦", title: "Upload Your Product", desc: "Upload your ebook, course, or file. We build your sales page instantly.",
                visual: (
                  <div style={{ background: `linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%)`, borderRadius: 14, padding: "20px", marginBottom: 20 }}>
                    <div style={{ background: "#fff", borderRadius: 10, padding: "14px", boxShadow: "0 4px 16px rgba(0,0,0,0.06)" }}>
                      <p style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 700, color: "#333" }}>Create Product</p>
                      {["Product name", "Price (₦)", "Upload file"].map((f) => (
                        <div key={f} style={{ background: "#f9f9f9", border: "1px solid #eee", borderRadius: 7, padding: "8px 12px", marginBottom: 8, fontSize: 11, color: "#bbb" }}>{f}</div>
                      ))}
                      <div style={{ background: O, borderRadius: 7, padding: "8px", textAlign: "center", color: "#fff", fontSize: 12, fontWeight: 700, marginTop: 10 }}>Publish →</div>
                    </div>
                  </div>
                ),
              },
              {
                step: "03", icon: "💰", title: "Sell & Get Paid", desc: "Share your link. Buyers pay securely and money hits your account automatically.",
                visual: (
                  <div style={{ background: "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)", borderRadius: 14, padding: "20px", marginBottom: 20 }}>
                    <div style={{ background: "#fff", borderRadius: 10, padding: "14px", boxShadow: "0 4px 16px rgba(0,0,0,0.06)" }}>
                      <p style={{ margin: "0 0 4px", fontSize: 11, color: "#999" }}>Today&apos;s earnings</p>
                      <p style={{ margin: "0 0 12px", fontSize: 24, fontWeight: 900, color: "#0a0a0a", letterSpacing: "-1px" }}>₦284,500</p>
                      {["Adaeze O. — ₦12,500", "Emeka T. — ₦8,000", "Fatima A. — ₦12,500"].map((t) => (
                        <div key={t} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", flexShrink: 0 }} />
                          <span style={{ fontSize: 11, color: "#555" }}>{t}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ),
              },
            ].map((s) => (
              <div key={s.step} style={{ background: "#fff", border: "1px solid #f0ece8", borderRadius: 18, padding: "1.75rem" }}>
                {s.visual}
                <p style={{ fontSize: 10, letterSpacing: "0.12em", color: O, margin: "0 0 8px", fontWeight: 700, textTransform: "uppercase" }}>{s.step}</p>
                <p style={{ fontWeight: 800, fontSize: 16, margin: "0 0 7px", color: "#0a0a0a", letterSpacing: "-0.3px" }}>{s.title}</p>
                <p style={{ fontSize: 13, color: "#888", margin: 0, lineHeight: 1.65 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section id="features" style={{ background: `linear-gradient(160deg, #431407 0%, #7c2d12 50%, #9a3412 100%)`, padding: "7rem 2rem" }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <p style={{ fontSize: 11, letterSpacing: "0.14em", color: "#fb923c", textTransform: "uppercase", marginBottom: "0.75rem", fontWeight: 700 }}>BUILT TO CONVERT</p>
            <h2 style={{ fontSize: "clamp(1.9rem, 3.8vw, 2.9rem)", fontWeight: 900, letterSpacing: "-1.5px", color: "#fff", margin: "0 0 1rem" }}>
              Every step optimised<br />for more sales.
            </h2>
            <p style={{ fontSize: 15, color: "#fdba74", lineHeight: 1.7, maxWidth: 460, margin: "0 auto" }}>
              Most platforms just host your product. Veelage is engineered to squeeze every naira of revenue out of your traffic — from the first click to the final receipt.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
            {[
              { icon: "🛒", title: "Sales pages that sell", desc: "Your product gets a page built to convert — not just look good." },
              { icon: "⬆️", title: "Sell more per order", desc: "Add upsells and order bumps so every checkout earns you more." },
              { icon: "📧", title: "Win back lost buyers", desc: "Automated emails chase people who didn't complete payment — using your name, not ours." },
              { icon: "🔍", title: "See where you're losing sales", desc: "Know exactly how many people viewed, started checkout, and paid. Fix what's broken." },
              { icon: "💳", title: "Get paid instantly", desc: "Money goes straight to your bank account after every sale." },
              { icon: "📱", title: "Works on any phone", desc: "Your buyers are on mobile. Your store is ready for them." },
            ].map((f) => (
              <div key={f.title} style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: "1.5rem", backdropFilter: "blur(4px)" }}>
                <p style={{ fontSize: 26, margin: "0 0 10px" }}>{f.icon}</p>
                <p style={{ fontWeight: 800, fontSize: 14, color: "#fff", margin: "0 0 6px", letterSpacing: "-0.1px" }}>{f.title}</p>
                <p style={{ fontSize: 13, color: "#fdba74", margin: 0, lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── WHAT YOU CAN SELL ─── */}
      <section style={{ background: "#fafaf8", padding: "7rem 2rem" }}>
        <div style={{ maxWidth: 860, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 48, alignItems: "center" }}>
          <div>
            <p style={{ fontSize: 11, letterSpacing: "0.14em", color: O, textTransform: "uppercase", marginBottom: "0.75rem", fontWeight: 700 }}>WHAT YOU CAN SELL</p>
            <h2 style={{ fontSize: "clamp(1.9rem, 3.8vw, 2.7rem)", fontWeight: 900, letterSpacing: "-1.5px", color: "#0a0a0a", margin: "0 0 1.25rem", lineHeight: 1.1 }}>
              Any knowledge.<br />Any format.
            </h2>
            <p style={{ fontSize: 15, color: "#888", lineHeight: 1.75, margin: "0 0 2rem" }}>
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
                <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 10, background: "#fff", border: "1px solid #f0ece8", borderRadius: 10, padding: "10px 14px" }}>
                  <span style={{ fontSize: 16 }}>{item.icon}</span>
                  <span style={{ fontSize: 13, color: "#444", fontWeight: 500 }}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ background: `linear-gradient(160deg, ${OL} 0%, #ffedd5 100%)`, border: `1.5px solid ${O}22`, borderRadius: 20, padding: "1.75rem" }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: O, margin: "0 0 14px", textTransform: "uppercase", letterSpacing: "0.08em" }}>Featured products</p>
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
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: O, whiteSpace: "nowrap", marginLeft: 8 }}>{p.price}</p>
                  </div>
                </div>
              ))}
              <Link href="/login" style={{ background: O, borderRadius: 12, padding: "13px 16px", textAlign: "center", color: "#fff", fontWeight: 700, fontSize: 13, textDecoration: "none", display: "block" }}>
                Start selling your products →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section style={{ background: "#0a0a0a", padding: "7rem 2rem" }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
            <p style={{ fontSize: 11, letterSpacing: "0.14em", color: O, textTransform: "uppercase", marginBottom: "0.75rem", fontWeight: 700 }}>CREATOR STORIES</p>
            <h2 style={{ fontSize: "clamp(1.9rem, 3.8vw, 2.9rem)", fontWeight: 900, letterSpacing: "-1.5px", color: "#fff", margin: 0 }}>
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
                <p style={{ fontSize: 28, margin: "0 0 14px", color: O }}>&ldquo;</p>
                <p style={{ fontSize: 14, color: "#ccc", lineHeight: 1.7, margin: "0 0 20px" }}>{t.quote}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: O, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 14, flexShrink: 0 }}>{t.avatar}</div>
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
      <section style={{ background: "#fff", padding: "7rem 2rem" }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <p style={{ fontSize: 11, letterSpacing: "0.14em", color: O, textTransform: "uppercase", marginBottom: "0.75rem", fontWeight: 700 }}>FAQ</p>
            <h2 style={{ fontSize: "clamp(1.9rem, 3.8vw, 2.6rem)", fontWeight: 900, letterSpacing: "-1.5px", color: "#0a0a0a", margin: 0 }}>Common questions</h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { q: "Is it free to join?", a: "Yes. Creating an account and listing products is free. Veelage takes a small percentage only when you make a sale." },
              { q: "How do I get paid?", a: "Payouts go directly to your Nigerian bank account. Withdraw anytime from your dashboard." },
              { q: "What can I sell?", a: "Ebooks, courses, templates, audio files, software, coaching — any digital product or service." },
              { q: "Do I need technical skills?", a: "None at all. If you can type and upload a file, you can sell on Veelage." },
              { q: "Can I buy products too if I'm a creator?", a: "Absolutely. You can switch between your creator and buyer dashboards anytime." },
            ].map((faq) => (
              <details key={faq.q} style={{ background: "#fafaf8", border: "1px solid #f0ece8", borderRadius: 12, padding: "1.1rem 1.4rem", cursor: "pointer" }}>
                <summary style={{ fontWeight: 700, fontSize: 14, color: "#0a0a0a", listStyle: "none", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  {faq.q}
                  <span style={{ color: O, fontWeight: 600, flexShrink: 0, marginLeft: 12, fontSize: 18 }}>+</span>
                </summary>
                <p style={{ fontSize: 14, color: "#777", lineHeight: 1.7, margin: "0.75rem 0 0" }}>{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section style={{ background: `linear-gradient(160deg, #431407 0%, ${OB} 50%, ${O} 100%)`, padding: "7rem 2rem", textAlign: "center" }}>
        <p style={{ fontSize: 12, letterSpacing: "0.14em", color: "#fb923c", textTransform: "uppercase", marginBottom: "1rem", fontWeight: 700 }}>READY TO START?</p>
        <h2 style={{ fontSize: "clamp(2rem, 5vw, 3.4rem)", fontWeight: 900, letterSpacing: "-2px", color: "#fff", lineHeight: 1.05, marginBottom: "1.5rem" }}>
          Your creator business<br />starts here.
        </h2>
        <p style={{ fontSize: 16, color: "rgba(255,255,255,0.65)", lineHeight: 1.7, maxWidth: 380, margin: "0 auto 3rem" }}>
          Join thousands of African creators turning their expertise into income.
        </p>
        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/login" style={{ textDecoration: "none", background: "#fff", color: O, fontWeight: 800, fontSize: 15, padding: "15px 32px", borderRadius: 12, letterSpacing: "-0.3px", display: "inline-block" }}>
            Start selling →
          </Link>
          <Link href="/account/login" style={{ textDecoration: "none", background: "rgba(255,255,255,0.15)", color: "#fff", fontWeight: 700, fontSize: 15, padding: "15px 32px", borderRadius: 12, border: "1.5px solid rgba(255,255,255,0.3)", display: "inline-block" }}>
            Browse products
          </Link>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer style={{ background: "#0a0a0a", borderTop: "1px solid #1a1a1a", padding: "2rem", textAlign: "center" }}>
        <p style={{ margin: "0 0 6px", fontSize: 17, fontWeight: 900, color: O, letterSpacing: "-0.3px" }}>Veelage</p>
        <p style={{ color: "#333", fontSize: 12, margin: 0 }}>© {new Date().getFullYear()} Veelage</p>
      </footer>
    </main>
  );
}
