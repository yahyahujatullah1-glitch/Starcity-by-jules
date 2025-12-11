import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Mail, Lock, Loader2, ArrowRight } from "lucide-react";

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ email: "", password: "" });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 1. Try to Login
      const { data, error } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      });

      // 2. Check if we got a session (Success)
      if (data.session) {
        // Force redirect even if there was a minor error
        window.location.href = "/";
        return;
      }

      // 3. If no session, throw the error
      if (error) throw error;

    } catch (err: any) {
      console.error("Login Error:", err);
      
      // Special handling for the Schema error
      if (err.message.includes("querying schema")) {
        setError("Database is restarting. Please wait 30 seconds and try again.");
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-black text-white font-sans items-center justify-center">
      <div className="w-full max-w-md p-8 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white">StaffNet</h1>
          <p className="text-zinc-400 text-sm mt-2">Admin Login</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-zinc-500" size={18} />
              <input 
                type="email" 
                required
                value={form.email}
                onChange={e => setForm({...form, email: e.target.value})}
                className="w-full pl-10 py-3 bg-black border border-zinc-800 rounded-xl text-white focus:border-orange-500 outline-none"
                placeholder="admin@staffnet.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-zinc-500" size={18} />
              <input 
                type="password" 
                required
                value={form.password}
                onChange={e => setForm({...form, password: e.target.value})}
                className="w-full pl-10 py-3 bg-black border border-zinc-800 rounded-xl text-white focus:border-orange-500 outline-none"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-lg text-center">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <>Sign In <ArrowRight size={18} /></>}
          </button>
        </form>
      </div>
    </div>
  );
}
