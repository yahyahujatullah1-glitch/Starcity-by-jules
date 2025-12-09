import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Users, CheckCircle, Clock, TrendingUp } from "lucide-react";

export default function Dashboard() {
  const [stats, setStats] = useState({ staff: 0, tasks: 0 });

  useEffect(() => {
    const load = async () => {
      const { count: s } = await supabase.from('profiles').select('*', { count: 'exact' });
      const { count: t } = await supabase.from('tasks').select('*', { count: 'exact' }).neq('status', 'Done');
      setStats({ staff: s || 0, tasks: t || 0 });
    };
    load();
  }, []);

  const cards = [
    { label: "Total Staff", val: stats.staff, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Active Tasks", val: stats.tasks, icon: CheckCircle, color: "text-primary", bg: "bg-primary/10" },
    { label: "Pending", val: 5, icon: Clock, color: "text-yellow-500", bg: "bg-yellow-500/10" },
    { label: "Growth", val: "+12%", icon: TrendingUp, color: "text-green-500", bg: "bg-green-500/10" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <h2 className="text-2xl font-bold text-white">Dashboard Overview</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((c) => (
          <div key={c.label} className="bg-surface border border-border p-6 rounded-xl hover:border-primary/50 transition-colors group">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-400 text-sm font-medium">{c.label}</p>
                <h3 className="text-3xl font-bold text-white mt-2 group-hover:text-primary transition-colors">{c.val}</h3>
              </div>
              <div className={`p-3 rounded-lg ${c.bg} ${c.color}`}><c.icon size={24} /></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
