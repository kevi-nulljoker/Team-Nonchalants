import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { getPointsSummary } from "../services/pointsApi";

const P = {
  card: "#FFFFFF",
  navy: "#0B1B35",
  blue: "#1A56E8",
  teal: "#1D4ED8",
  purple: "#7C3AED",
  slate: "#64748B",
  muted: "#94A3B8",
  border: "#E2E8F0",
  gold: "#F59E0B",
  goldLight: "#FFFBEB",
  red: "#DC2626",
};

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", to: "/dashboard", icon: "grid" },
  { id: "transactions", label: "Transactions", to: "/transactions", icon: "bar" },
  { id: "insights", label: "Insights", to: "/insights", icon: "trend" },
  { id: "goals", label: "Goals", to: "/goals", icon: "target" },
  { id: "learning", label: "Learning", to: "/learning", icon: "book" },
  { id: "profile", label: "Profile", to: "/signup", icon: "user" },
];

const AUTH_API_BASES = Array.from(
  new Set([
    (import.meta.env.VITE_API_BASE_URL || "/api").replace(/\/$/, ""),
    (import.meta.env.VITE_API_TARGET || "http://127.0.0.1:8001").replace(/\/$/, ""),
  ].filter(Boolean))
);

const NavIcons = {
  grid: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>,
  target: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
  bar: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  trend: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>,
  user: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  book: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
};

export default function AppNavbar() {
  const location = useLocation();
  const [userName, setUserName] = useState("User");
  const [userInitial, setUserInitial] = useState("U");
  const [coinPoints, setCoinPoints] = useState(0);

  useEffect(() => {
    let mounted = true;
    const userId = localStorage.getItem("auth_user_id");
    const storedName = (localStorage.getItem("auth_name") || "").trim();
    const storedEmail = (localStorage.getItem("auth_email") || localStorage.getItem("userEmail") || "").trim();
    const fallbackName = storedName || storedEmail || "User";
    setUserName(fallbackName);
    setUserInitial(fallbackName.charAt(0).toUpperCase() || "U");

    if (!userId) return () => { mounted = false; };
    (async () => {
      for (const baseUrl of AUTH_API_BASES) {
        try {
          const res = await fetch(`${baseUrl}/users/${userId}/profile`);
          if (!res.ok) continue;
          const data = await res.json();
          const dbName = (data?.name || data?.email || fallbackName).trim();
          if (mounted) {
            setUserName(dbName);
            setUserInitial(dbName.charAt(0).toUpperCase() || "U");
          }
          return;
        } catch {
          // Try next auth endpoint
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    const userId = localStorage.getItem("auth_user_id");
    if (!userId) return () => { mounted = false; };

    const loadPoints = async () => {
      try {
        const points = await getPointsSummary(userId);
        if (mounted && typeof points?.total_points === "number") setCoinPoints(points.total_points);
      } catch {
        // Keep last known/fallback points value
      }
    };
    loadPoints();
    window.addEventListener("finsight:points-updated", loadPoints);
    return () => {
      mounted = false;
      window.removeEventListener("finsight:points-updated", loadPoints);
    };
  }, []);

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, padding: "0 4px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: `linear-gradient(135deg,${P.blue},${P.teal})`,
          display: "flex", alignItems: "center", justifyContent: "center", color: "white"
        }}>
          <NavIcons.trend />
        </div>
        <div>
          <p style={{ fontSize: 14, fontWeight: 800, color: P.navy, lineHeight: 1.1, letterSpacing: -0.3 }}>FinSight</p>
          <p style={{ fontSize: 9.5, color: P.muted, fontWeight: 500, letterSpacing: 0.5 }}>SMART FINANCE</p>
        </div>
      </div>

      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        background: P.card, borderRadius: 99, padding: "8px 10px",
        border: `1px solid ${P.border}`, boxShadow: "0 2px 8px rgba(11,27,53,.06)"
      }}>
        {NAV_ITEMS.map(({ id, label, to, icon }) => {
          const IconComponent = NavIcons[icon];
          const active = location.pathname.startsWith(to);
          return (
            <Link
              key={id}
              to={to}
              title={label}
              style={{
                height: 34,
                borderRadius: 999,
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "0 11px",
                fontSize: 11.5,
                fontWeight: 700,
                color: active ? "#fff" : P.slate,
                background: active ? P.navy : "transparent",
                border: "none",
              }}
            >
              <IconComponent />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 6,
          background: `linear-gradient(135deg,${P.gold}18,${P.goldLight})`,
          border: `1px solid ${P.gold}44`,
          borderRadius: 99, padding: "6px 12px",
        }}>
          <span style={{ fontSize: 14 }}>🪙</span>
          <div>
            <p style={{ fontSize: 11, fontWeight: 800, color: P.navy, lineHeight: 1 }}>{coinPoints.toLocaleString()} coins</p>
            <p style={{ fontSize: 9, color: P.muted, lineHeight: 1 }}>{userName}</p>
          </div>
        </div>
        <div style={{
          position: "relative", width: 40, height: 40, borderRadius: "50%",
          background: P.card, border: `1px solid ${P.border}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: P.slate
        }}>
          🔔
          <span style={{
            position: "absolute", top: 8, right: 8, width: 8, height: 8,
            borderRadius: "50%", background: P.red, border: `2px solid ${P.card}`
          }} />
        </div>
        <div style={{
          width: 40, height: 40, borderRadius: "50%",
          background: `linear-gradient(135deg,${P.blue},${P.purple})`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 15, color: "white", fontWeight: 700
        }}>
          {userInitial}
        </div>
      </div>
    </div>
  );
}
