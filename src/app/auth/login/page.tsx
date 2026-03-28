"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [regCode, setRegCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const err = await login(username, password);
    setLoading(false);
    if (err) {
      setError(err);
    } else {
      router.replace("/dashboard");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const err = await register(displayName, email, password, regCode);
    setLoading(false);
    if (err) {
      setError(err);
    } else {
      router.replace("/dashboard");
    }
  };

  return (
    <div className="login-screen">
      {/* Floating orbs */}
      <div className="login-orb login-orb-1" />
      <div className="login-orb login-orb-2" />
      <div className="login-orb login-orb-3" />

      <div className="login-box">
        <div className="login-logo">
          <svg width="48" height="48" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="6" y="18" width="6" height="28" rx="2" fill="var(--ac, #a1a1aa)"/>
            <rect x="14" y="22" width="5" height="20" rx="1.5" fill="var(--text2, #d4d4d8)"/>
            <rect x="19" y="29" width="26" height="6" rx="3" fill="var(--muted, #71717a)"/>
            <rect x="45" y="22" width="5" height="20" rx="1.5" fill="var(--text2, #d4d4d8)"/>
            <rect x="52" y="18" width="6" height="28" rx="2" fill="var(--ac, #a1a1aa)"/>
          </svg>
        </div>
        <div className="login-brand">Iron Ledger</div>
        <div className="login-sub">Track Every Rep &middot; Forge Your Progress</div>

        {!isRegister ? (
          <form onSubmit={handleLogin}>
            <input
              type="text"
              placeholder="Username or Email"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="login-field"
              autoComplete="username"
              autoFocus
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="login-field"
              autoComplete="current-password"
            />
            <button type="submit" disabled={loading} className="login-btn">
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister}>
            <input
              type="text"
              placeholder="Display Name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              className="login-field"
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="login-field"
            />
            <input
              type="password"
              placeholder="Password (min 6 chars)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="login-field"
            />
            <input
              type="text"
              placeholder="Registration Code"
              value={regCode}
              onChange={(e) => setRegCode(e.target.value)}
              required
              className="login-field"
            />
            <button type="submit" disabled={loading} className="login-btn">
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>
        )}

        {error && (
          <div className="login-error" style={{ display: "block" }}>
            {error}
          </div>
        )}

        <div className="login-hint" onClick={() => { setIsRegister(!isRegister); setError(""); }}>
          {isRegister ? "Already have an account? " : "Don't have an account? "}
          <b>{isRegister ? "Sign in" : "Register here"}</b>
        </div>
      </div>
    </div>
  );
}
