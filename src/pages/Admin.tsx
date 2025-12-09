import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Shield, Activity } from "lucide-react";

export default function Admin() {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(20);
      if(data) setLogs(data);
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-white flex items-center gap-2"><Shield className="text-primary"/> Admin Console</h2>
      <div className="bg-black/40 border border-border rounded-xl p-4 flex flex-col h-96">
        <h3 className="font-bold text-gray-400 mb-4 flex items-center gap-2"><Activity size={16}/> System Logs</h3>
        <div className="flex-1 overflow-y-auto space-y-2 font-mono text-xs">
          {logs.map(log => (
            <div key={log.id} className="border-b border-border/50 pb-2">
              <span className="text-green-500">[{new Date(log.created_at).toLocaleTimeString()}]</span>
              <span className="text-gray-300 ml-2">{log.action}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
