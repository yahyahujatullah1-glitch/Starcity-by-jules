import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, Users, CheckSquare, MessageSquare, ShieldAlert, Menu, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { clsx } from "clsx";
import { getCurrentUser } from "@/hooks/useData";

export const Layout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const u = getCurrentUser();
    if (!u) navigate("/login");
    else setUser(u);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('staffnet_user');
    navigate("/login");
  };

  const navs = [
    { name: "Dashboard", path: "/", icon: LayoutDashboard },
    { name: "Staff", path: "/staff", icon: Users },
    { name: "Tasks", path: "/tasks", icon: CheckSquare },
    { name: "Chat", path: "/chat", icon: MessageSquare },
    // Only Admin sees Admin Panel
    ...(user?.access_level === 'Admin' ? [{ name: "Admin", path: "/admin", icon: ShieldAlert }] : []),
  ];

  return (
    <div className="flex h-screen w-full bg-background text-gray-200 font-sans overflow-hidden">
      <aside className={clsx("fixed inset-y-0 left-0 z-40 w-64 bg-surface border-r border-border transition-transform md:translate-x-0 md:static flex flex-col", !mobileOpen && "-translate-x-full")}>
        <div className="p-6 flex items-center gap-3 border-b border-border/50">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-orange-700 flex items-center justify-center text-white font-bold shadow-lg shadow-primary/20">SN</div>
          <div><h1 className="font-bold text-white tracking-wide">StaffNet</h1><p className="text-xs text-gray-500">Workspace</p></div>
        </div>
        <nav className="p-4 space-y-1 flex-1">
          {navs.map(n => (
            <NavLink key={n.name} to={n.path} onClick={() => setMobileOpen(false)} className={({ isActive }) => clsx("flex items-center gap-3 px-4 py-3 rounded-lg transition-all", isActive ? "bg-primary/10 text-primary border border-primary/20" : "text-gray-400 hover:bg-white/5 hover:text-white")}>
              <n.icon size={20} /> {n.name}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-border/50">
          <button onClick={handleLogout} className="flex w-full items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-red-500/10 hover:text-red-500 transition-colors">
            <LogOut size={20} /> Logout
          </button>
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-border flex items-center justify-between px-6 bg-surface/50 backdrop-blur-md">
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden text-gray-400"><Menu /></button>
          <div className="hidden md:block text-sm text-gray-500">Logged in as <span className="text-primary font-bold">{user?.full_name}</span> <span className="text-xs bg-white/10 px-2 py-0.5 rounded ml-2">{user?.job_title}</span></div>
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
            <img src={user?.avatar_url} className="h-9 w-9 rounded-full border border-border" />
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-8 bg-background relative">
          <Outlet />
        </main>
      </div>
      {mobileOpen && <div onClick={() => setMobileOpen(false)} className="fixed inset-0 bg-black/50 z-30 md:hidden" />}
    </div>
  );
};
