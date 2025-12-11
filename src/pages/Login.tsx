import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "@/hooks/useData"; // Import the helper
import { Mail, Lock, Loader2, ArrowRight } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ email: "", password: "" });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 1. Check Credentials against Supabase 'users' table
      const user = await loginUser(form.email, form.password);

      if (user) {
        // 2. Success: Save Session & Redirect
        localStorage.setItem('staffnet_user', JSON.stringify(user));
        window.location.href = "/";
      } else {
        setError("Invalid email or password");
      }
    } catch (err) {
      console.error(err);
      setError("Login failed. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-black text-white font-sans items-center justify-center">
      <div className="w-full max-w-md p-8 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl">
        
        <div className="text-center mb-8">
          <div className="h-12 w-12 bg-orange-600 rounded-xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-orange-900/20">
            <span className="font-bold text-xl text-white">SN</span>
          </div>
          <h1 className="text-2xl font-bold text-white">StaffNet</h1>
          <p className="text-zinc-400 text-sm mt-2">Global Workspace Login</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase">Email</label>
            <div className="relative">
              <div className="absolute left-3 top-3 text-zinc-500"><Mail size={18} /></div>
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

          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase">Password</label>
            <div className="relative">
              <div className="absolute left-3 top-3 text-zinc-500"><Lock size={18} /></div>
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

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-lg text-center animate-in fade-in">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-orange-900/20"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <>Sign In <ArrowRight size={18} /></>}
          </button>
        </form>
      </div>
    </div>
  );
            }
