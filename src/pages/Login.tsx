import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { validateLogin } from "@/hooks/useData"; // Import the helper
import { Mail, Lock, Loader2, ArrowRight } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ email: "", password: "" });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    setTimeout(() => {
      // Check against Local Database
      const user = validateLogin(form.email, form.password);

      if (user) {
        // Save User Session
        localStorage.setItem('staffnet_user', JSON.stringify(user));
        window.location.href = "/";
      } else {
        setError("Invalid email or password");
        setLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen w-full flex bg-black text-white font-sans items-center justify-center">
      <div className="w-full max-w-md p-8 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white">StaffNet</h1>
          <p className="text-zinc-400 text-sm mt-2">Workspace Login</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase">Email</label>
            <input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full pl-4 py-3 bg-black border border-zinc-800 rounded-xl text-white focus:border-orange-500 outline-none" placeholder="admin@staffnet.com" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase">Password</label>
            <input type="password" required value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="w-full pl-4 py-3 bg-black border border-zinc-800 rounded-xl text-white focus:border-orange-500 outline-none" placeholder="password123" />
          </div>
          {error && <div className="p-3 bg-red-500/10 text-red-500 text-sm rounded-lg text-center">{error}</div>}
          <button type="submit" disabled={loading} className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2">
            {loading ? <Loader2 className="animate-spin" size={20} /> : <>Sign In <ArrowRight size={18} /></>}
          </button>
        </form>
      </div>
    </div>
  );
            }
