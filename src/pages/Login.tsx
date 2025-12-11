import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
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
      const { data, error } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      });

      if (error) throw error;
      if (data.session) navigate("/");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-background text-white font-sans">
      <div className="w-full max-w-md m-auto p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary">StaffNet</h1>
          <p className="text-gray-400">Admin Login</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-gray-500" size={18} />
              <input 
                type="email" 
                required
                value={form.email}
                onChange={e => setForm({...form, email: e.target.value})}
                className="w-full pl-10 py-3 bg-surface border border-border rounded-xl text-white focus:border-primary outline-none"
                placeholder="admin@staffnet.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-500" size={18} />
              <input 
                type="password" 
                required
                value={form.password}
                onChange={e => setForm({...form, password: e.target.value})}
                className="w-full pl-10 py-3 bg-surface border border-border rounded-xl text-white focus:border-primary outline-none"
                placeholder="password123"
              />
            </div>
          </div>

          {error && <div className="p-3 bg-red-500/10 text-red-500 text-sm rounded-lg text-center">{error}</div>}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-primary hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <>Sign In <ArrowRight size={18} /></>}
          </button>
        </form>
      </div>
    </div>
  );
}
