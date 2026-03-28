"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
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

  const fadeUp = (delay: number) => ({
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  });

  return (
    <div
      className="fixed inset-0 flex items-center justify-center overflow-hidden"
      style={{ background: "var(--login-bg)" }}
    >
      {/* Floating orbs */}
      <div className="absolute w-[340px] h-[340px] rounded-full blur-[80px] opacity-25 -top-20 -left-16 animate-[orbFloat1_14s_ease-in-out_infinite]"
        style={{ background: "rgba(var(--ac-rgb), 0.35)" }} />
      <div className="absolute w-[280px] h-[280px] rounded-full blur-[80px] opacity-20 -bottom-16 -right-10 animate-[orbFloat2_18s_ease-in-out_infinite]"
        style={{ background: "rgba(16, 185, 129, 0.2)" }} />
      <div className="absolute w-[200px] h-[200px] rounded-full blur-[80px] opacity-15 top-1/2 left-[60%] animate-[orbFloat3_16s_ease-in-out_infinite]"
        style={{ background: "rgba(var(--ac2-rgb), 0.15)" }} />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-[min(400px,90vw)] rounded-xl p-[2.8rem_2.5rem_2.2rem] text-center shadow-lg glass"
        style={{
          background: "var(--login-card-bg)",
          border: "1px solid var(--login-card-border)",
        }}
      >
        {/* Glow line */}
        <div className="absolute bottom-0 left-[15%] right-[15%] h-[2px] rounded-full"
          style={{ background: "linear-gradient(90deg, transparent, rgba(var(--ac-rgb), 0.4), transparent)" }} />

        <motion.div {...fadeUp(0.1)} className="text-[2.5rem] mb-2">🏋️</motion.div>
        <motion.h1 {...fadeUp(0.18)} className="text-[1.65rem] font-extrabold text-gradient mb-1">Iron Ledger</motion.h1>
        <motion.p {...fadeUp(0.24)} className="text-[0.6rem] tracking-[0.22em] uppercase text-text-muted mb-8">
          Workout Tracker
        </motion.p>

        {!isRegister ? (
          <form onSubmit={handleLogin} className="space-y-3">
            <motion.input
              {...fadeUp(0.3)}
              type="text"
              placeholder="Username or Email"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 bg-[rgba(var(--ac-rgb),0.03)] border border-border rounded-[var(--radius-md)] text-text text-[0.82rem] font-sans placeholder:text-text-muted"
            />
            <motion.input
              {...fadeUp(0.36)}
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 bg-[rgba(var(--ac-rgb),0.03)] border border-border rounded-[var(--radius-md)] text-text text-[0.82rem] font-sans placeholder:text-text-muted"
            />
            <motion.button
              {...fadeUp(0.42)}
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-accent-grad rounded-[var(--radius-md)] text-[var(--btn-primary-text,#fff)] text-[0.82rem] font-bold shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign In"}
            </motion.button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-3">
            <motion.input {...fadeUp(0.3)} type="text" placeholder="Display Name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required className="w-full px-3.5 py-2.5 bg-[rgba(var(--ac-rgb),0.03)] border border-border rounded-[var(--radius-md)] text-text text-[0.82rem] font-sans placeholder:text-text-muted" />
            <motion.input {...fadeUp(0.33)} type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-3.5 py-2.5 bg-[rgba(var(--ac-rgb),0.03)] border border-border rounded-[var(--radius-md)] text-text text-[0.82rem] font-sans placeholder:text-text-muted" />
            <motion.input {...fadeUp(0.36)} type="password" placeholder="Password (min 6 chars)" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full px-3.5 py-2.5 bg-[rgba(var(--ac-rgb),0.03)] border border-border rounded-[var(--radius-md)] text-text text-[0.82rem] font-sans placeholder:text-text-muted" />
            <motion.input {...fadeUp(0.39)} type="text" placeholder="Registration Code" value={regCode} onChange={(e) => setRegCode(e.target.value)} required className="w-full px-3.5 py-2.5 bg-[rgba(var(--ac-rgb),0.03)] border border-border rounded-[var(--radius-md)] text-text text-[0.82rem] font-sans placeholder:text-text-muted" />
            <motion.button {...fadeUp(0.42)} type="submit" disabled={loading} className="w-full py-2.5 bg-accent-grad rounded-[var(--radius-md)] text-[var(--btn-primary-text,#fff)] text-[0.82rem] font-bold shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50">
              {loading ? "Creating account..." : "Create Account"}
            </motion.button>
          </form>
        )}

        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-3 text-danger text-[0.75rem] font-medium"
          >
            {error}
          </motion.p>
        )}

        <motion.button
          {...fadeUp(0.48)}
          onClick={() => { setIsRegister(!isRegister); setError(""); }}
          className="mt-4 text-[0.75rem] text-accent hover:underline"
        >
          {isRegister ? "Already have an account? Sign in" : "Need an account? Register"}
        </motion.button>
      </motion.div>

      <style jsx>{`
        @keyframes orbFloat1 { 0%, 100% { transform: translate(0,0) scale(1); } 50% { transform: translate(40px,30px) scale(1.1); } }
        @keyframes orbFloat2 { 0%, 100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-35px,-25px) scale(1.08); } }
        @keyframes orbFloat3 { 0%, 100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-20px,35px) scale(0.92); } }
      `}</style>
    </div>
  );
}
