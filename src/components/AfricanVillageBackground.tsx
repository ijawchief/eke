export function AfricanVillageBackground() {
  return (
    <svg
      viewBox="0 0 800 600"
      xmlns="http://www.w3.org/2000/svg"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f97316" stopOpacity="0.25" />
          <stop offset="60%" stopColor="#fed7aa" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#ffedd5" stopOpacity="0.6" />
        </linearGradient>
        <linearGradient id="ground" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c2410c" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#9a3412" stopOpacity="0.28" />
        </linearGradient>
        <linearGradient id="sunset" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fff7ed" />
          <stop offset="100%" stopColor="#ffedd5" />
        </linearGradient>
      </defs>

      {/* Sky */}
      <rect width="800" height="600" fill="url(#sunset)" />
      <rect width="800" height="600" fill="url(#sky)" />

      {/* Sun */}
      <circle cx="680" cy="120" r="55" fill="#f97316" opacity="0.15" />
      <circle cx="680" cy="120" r="38" fill="#ea580c" opacity="0.2" />
      <circle cx="680" cy="120" r="24" fill="#c2410c" opacity="0.25" />

      {/* Distant hills */}
      <ellipse cx="150" cy="380" rx="220" ry="80" fill="#c2410c" opacity="0.08" />
      <ellipse cx="620" cy="360" rx="260" ry="90" fill="#9a3412" opacity="0.07" />

      {/* Ground */}
      <rect x="0" y="420" width="800" height="180" fill="url(#ground)" rx="0" />
      <ellipse cx="400" cy="420" rx="420" ry="18" fill="#c2410c" opacity="0.12" />

      {/* ── BAOBAB TREE (left) ── */}
      {/* Trunk */}
      <rect x="62" y="280" width="36" height="145" rx="8" fill="#7c2d12" opacity="0.55" />
      <rect x="70" y="280" width="20" height="145" rx="6" fill="#9a3412" opacity="0.3" />
      {/* Branches */}
      <line x1="80" y1="295" x2="30" y2="240" stroke="#7c2d12" strokeWidth="10" strokeLinecap="round" opacity="0.5" />
      <line x1="80" y1="285" x2="130" y2="235" stroke="#7c2d12" strokeWidth="10" strokeLinecap="round" opacity="0.5" />
      <line x1="80" y1="300" x2="55" y2="255" stroke="#7c2d12" strokeWidth="7" strokeLinecap="round" opacity="0.4" />
      <line x1="80" y1="292" x2="110" y2="260" stroke="#7c2d12" strokeWidth="7" strokeLinecap="round" opacity="0.4" />
      {/* Canopy blobs */}
      <ellipse cx="30" cy="228" rx="34" ry="24" fill="#ea580c" opacity="0.18" />
      <ellipse cx="132" cy="223" rx="36" ry="26" fill="#c2410c" opacity="0.16" />
      <ellipse cx="56" cy="244" rx="28" ry="20" fill="#f97316" opacity="0.14" />
      <ellipse cx="112" cy="248" rx="24" ry="18" fill="#ea580c" opacity="0.14" />
      <ellipse cx="80" cy="220" rx="30" ry="22" fill="#c2410c" opacity="0.15" />

      {/* ── ACACIA TREE (right) ── */}
      <rect x="700" y="300" width="22" height="125" rx="5" fill="#7c2d12" opacity="0.45" />
      {/* Flat canopy */}
      <ellipse cx="711" cy="290" rx="65" ry="18" fill="#ea580c" opacity="0.16" />
      <ellipse cx="711" cy="282" rx="50" ry="14" fill="#c2410c" opacity="0.14" />

      {/* ── HUT 1 (large, center-left) ── */}
      {/* Body */}
      <rect x="240" y="340" width="120" height="85" rx="6" fill="#c2410c" opacity="0.35" />
      <rect x="248" y="340" width="104" height="85" rx="5" fill="#ea580c" opacity="0.18" />
      {/* Thatched roof */}
      <polygon points="220,342 300,278 380,342" fill="#9a3412" opacity="0.5" />
      <polygon points="228,342 300,284 372,342" fill="#c2410c" opacity="0.3" />
      {/* Roof texture lines */}
      <line x1="300" y1="280" x2="240" y2="340" stroke="#7c2d12" strokeWidth="1.5" opacity="0.2" />
      <line x1="300" y1="280" x2="260" y2="340" stroke="#7c2d12" strokeWidth="1.5" opacity="0.2" />
      <line x1="300" y1="280" x2="280" y2="340" stroke="#7c2d12" strokeWidth="1.5" opacity="0.2" />
      <line x1="300" y1="280" x2="320" y2="340" stroke="#7c2d12" strokeWidth="1.5" opacity="0.2" />
      <line x1="300" y1="280" x2="340" y2="340" stroke="#7c2d12" strokeWidth="1.5" opacity="0.2" />
      <line x1="300" y1="280" x2="360" y2="340" stroke="#7c2d12" strokeWidth="1.5" opacity="0.2" />
      {/* Door */}
      <rect x="282" y="375" width="36" height="50" rx="18" fill="#7c2d12" opacity="0.45" />
      {/* Window */}
      <rect x="340" y="355" width="22" height="18" rx="4" fill="#7c2d12" opacity="0.3" />

      {/* ── HUT 2 (small, far right) ── */}
      <rect x="530" y="365" width="85" height="60" rx="5" fill="#c2410c" opacity="0.3" />
      <polygon points="515,367 572,318 630,367" fill="#9a3412" opacity="0.42" />
      <polygon points="522,367 572,323 622,367" fill="#c2410c" opacity="0.25" />
      <rect x="555" y="390" width="24" height="35" rx="12" fill="#7c2d12" opacity="0.38" />

      {/* ── HUT 3 (small, far left background) ── */}
      <rect x="138" y="368" width="70" height="55" rx="5" fill="#c2410c" opacity="0.22" />
      <polygon points="124,370 173,325" fill="none" />
      <polygon points="124,370 173,325 222,370" fill="#9a3412" opacity="0.32" />
      <rect x="158" y="390" width="20" height="33" rx="10" fill="#7c2d12" opacity="0.3" />

      {/* ── GATHERING PEOPLE ── */}
      {/* Person 1 - standing, centre */}
      <ellipse cx="390" cy="418" rx="10" ry="10" fill="#7c2d12" opacity="0.55" />
      <rect x="384" y="426" width="12" height="28" rx="4" fill="#9a3412" opacity="0.5" />
      <line x1="384" y1="432" x2="374" y2="446" stroke="#7c2d12" strokeWidth="3" strokeLinecap="round" opacity="0.5" />
      <line x1="396" y1="432" x2="406" y2="444" stroke="#7c2d12" strokeWidth="3" strokeLinecap="round" opacity="0.5" />
      <line x1="386" y1="454" x2="382" y2="470" stroke="#7c2d12" strokeWidth="3" strokeLinecap="round" opacity="0.5" />
      <line x1="394" y1="454" x2="398" y2="470" stroke="#7c2d12" strokeWidth="3" strokeLinecap="round" opacity="0.5" />
      {/* Head wrap */}
      <ellipse cx="390" cy="414" rx="11" ry="6" fill="#ea580c" opacity="0.4" />

      {/* Person 2 - standing, slightly left */}
      <ellipse cx="420" cy="416" rx="9" ry="9" fill="#7c2d12" opacity="0.5" />
      <rect x="414" y="423" width="11" height="26" rx="4" fill="#c2410c" opacity="0.45" />
      <line x1="414" y1="428" x2="405" y2="440" stroke="#7c2d12" strokeWidth="2.5" strokeLinecap="round" opacity="0.45" />
      <line x1="425" y1="428" x2="433" y2="438" stroke="#7c2d12" strokeWidth="2.5" strokeLinecap="round" opacity="0.45" />
      <line x1="415" y1="449" x2="412" y2="464" stroke="#7c2d12" strokeWidth="2.5" strokeLinecap="round" opacity="0.45" />
      <line x1="422" y1="449" x2="425" y2="464" stroke="#7c2d12" strokeWidth="2.5" strokeLinecap="round" opacity="0.45" />

      {/* Person 3 - seated on left */}
      <ellipse cx="358" cy="428" rx="9" ry="9" fill="#7c2d12" opacity="0.48" />
      <ellipse cx="358" cy="445" rx="13" ry="10" fill="#9a3412" opacity="0.38" />
      <line x1="350" y1="440" x2="340" y2="450" stroke="#7c2d12" strokeWidth="2.5" strokeLinecap="round" opacity="0.42" />
      <line x1="366" y1="440" x2="374" y2="448" stroke="#7c2d12" strokeWidth="2.5" strokeLinecap="round" opacity="0.42" />

      {/* Person 4 - child, far right of group */}
      <ellipse cx="448" cy="430" rx="7" ry="7" fill="#7c2d12" opacity="0.45" />
      <rect x="443" y="436" width="9" height="20" rx="3" fill="#ea580c" opacity="0.38" />
      <line x1="443" y1="440" x2="436" y2="449" stroke="#7c2d12" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
      <line x1="452" y1="440" x2="458" y2="447" stroke="#7c2d12" strokeWidth="2" strokeLinecap="round" opacity="0.4" />

      {/* Person 5 - far left, carrying something on head */}
      <ellipse cx="195" cy="405" rx="9" ry="9" fill="#7c2d12" opacity="0.45" />
      <rect x="190" y="413" width="11" height="28" rx="4" fill="#c2410c" opacity="0.38" />
      {/* Basket on head */}
      <ellipse cx="195" cy="398" rx="13" ry="5" fill="#9a3412" opacity="0.45" />
      <line x1="190" y1="420" x2="182" y2="432" stroke="#7c2d12" strokeWidth="2.5" strokeLinecap="round" opacity="0.4" />
      <line x1="201" y1="420" x2="208" y2="430" stroke="#7c2d12" strokeWidth="2.5" strokeLinecap="round" opacity="0.4" />
      <line x1="191" y1="441" x2="188" y2="458" stroke="#7c2d12" strokeWidth="2.5" strokeLinecap="round" opacity="0.4" />
      <line x1="199" y1="441" x2="202" y2="458" stroke="#7c2d12" strokeWidth="2.5" strokeLinecap="round" opacity="0.4" />

      {/* ── MARKET STALL / BASKETS ── */}
      <ellipse cx="460" cy="455" rx="18" ry="8" fill="#9a3412" opacity="0.3" />
      <ellipse cx="460" cy="450" rx="14" ry="6" fill="#c2410c" opacity="0.25" />
      <ellipse cx="490" cy="460" rx="12" ry="5" fill="#9a3412" opacity="0.28" />
      <ellipse cx="340" cy="462" rx="15" ry="6" fill="#c2410c" opacity="0.25" />

      {/* ── FIRE / GATHERING POINT (centre) ── */}
      <ellipse cx="405" cy="468" rx="20" ry="6" fill="#7c2d12" opacity="0.2" />
      <polygon points="405,440 398,465 412,465" fill="#ea580c" opacity="0.3" />
      <polygon points="405,445 400,463 410,463" fill="#f97316" opacity="0.35" />
      <polygon points="405,450 402,462 408,462" fill="#fed7aa" opacity="0.4" />

      {/* ── DISTANT BIRDS ── */}
      <path d="M560 180 Q565 174 570 180" stroke="#c2410c" strokeWidth="1.5" fill="none" opacity="0.3" />
      <path d="M575 170 Q580 164 585 170" stroke="#c2410c" strokeWidth="1.5" fill="none" opacity="0.3" />
      <path d="M592 185 Q596 180 600 185" stroke="#c2410c" strokeWidth="1.5" fill="none" opacity="0.25" />

      {/* Ground texture dots */}
      {[320,360,400,440,480,510,540,290,260].map((x, i) => (
        <circle key={i} cx={x} cy={472 + (i % 3) * 6} r="2.5" fill="#9a3412" opacity="0.12" />
      ))}

      {/* Subtle vignette overlay */}
      <rect width="800" height="600" fill="url(#sky)" opacity="0.3" />
    </svg>
  );
}
