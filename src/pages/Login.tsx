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
      // 1. Attempt Login via Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      });

      if (error) throw error;

      if (data.session) {
        // 2. Successful Login -> Force Redirect to Dashboard
        // We use window.location to force a full refresh and clear any old errors
        window.location.href = "/";
      }
    } catch (err: any) {
      console.error("Login Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-black text-white font-sans items-center justify-center">
      <div className="w-full max-w-md p-8 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl">
        
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="h-12 w-12 bg-orange-600 rounded-xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-orange-900/20">
            <span className="font-bold text-xl text-white">SN</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Welcome Back</h1>
          <p className="text-zinc-400 text-sm mt-2">Sign in to StaffNet Admin</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          
          {/* Email Field */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase">Email</label>
            <div className="relative">
              <div className="absolute left-3 top-3 text-zinc-500">
                <Mail size={18} />
              </div>
              <input 
                type="email" 
                required
                value={form.email}
                onChange={e => setForm({...form, email: e.target.value})}
                className="w-full pl-10 py-3 bg-black border border-zinc-800 rounded-xl text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all placeholder:text-zinc-700"
                placeholder="admin@staffnet.com"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase">Password</label>
            <div className="relative">
              <div className="absolute left-3 top-3 text-zinc-500">
                <Lock size={18} />
              </div>
              <input 
                type="password" 
                required
                value={form.password}
                onChange={e => setForm({...form, password: e.target.value})}
                className="w-full pl-10 py-3 bg-black border border-zinc-800 rounded-xl text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all placeholder:text-zinc-700"
                placeholder="••••••••"
              />
            </div>
          </div>

          {/* Error Message Display */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-lg text-center">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>Sign In <ArrowRight size={18} /></>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
