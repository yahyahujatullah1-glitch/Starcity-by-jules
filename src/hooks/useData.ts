import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

// --- STAFF HOOK ---
export function useStaff() {
  const [staff, setStaff] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const { data: profiles, error } = await supabase.from('profiles').select('*');
      const { data: roleList } = await supabase.from('roles').select('*');

      if (error || !profiles || profiles.length === 0) throw new Error("No data");

      // Real Data
      const merged = profiles.map(p => {
        const r = roleList?.find(role => role.id === p.role_id);
        return { ...p, roles: r || { name: 'Staff', color: 'bg-gray-500' } };
      });
      setStaff(merged);
      setRoles(roleList || []);

    } catch (err) {
      console.warn("Using Offline Data");
      // Fallback Data
      setStaff([
        { id: '1', full_name: 'Lindsay Walton', email: 'lindsay@example.com', roles: { name: 'Developer', color: 'bg-blue-600' } },
        { id: '2', full_name: 'Tom Cook', email: 'tom@example.com', roles: { name: 'Manager', color: 'bg-orange-500' } }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);
  return { staff, roles, loading, refresh: fetchData };
}

// --- TASKS HOOK ---
export function useTasks() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase.from('tasks').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setTasks(data || []);
    } catch (err) {
      // Fallback Data
      setTasks([
        { id: '1', title: 'Update Brand Guidelines', status: 'In Progress', priority: 'High', due_date: '2024-10-26' },
        { id: '2', title: 'Fix API Integration', status: 'Todo', priority: 'Medium', due_date: '2024-10-28' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTasks(); }, []);
  return { tasks, loading, refresh: fetchTasks };
}

// --- CHAT HOOK ---
export function useChat() {
  const [messages, setMessages] = useState<any[]>([]);
  
  const fetchMessages = async () => {
    const { data } = await supabase.from('messages').select('*').order('created_at', { ascending: true });
    if (data) setMessages(data);
  };

  useEffect(() => {
    fetchMessages();
    const channel = supabase.channel('public:messages').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, () => fetchMessages()).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const sendMessage = async (text: string) => {
    // Optimistic Update
    setMessages(prev => [...prev, { id: Date.now(), content: text, profiles: { full_name: 'You' } }]);
    
    // Try sending to DB
    try {
        let { data: user } = await supabase.from('profiles').select('id').limit(1).single();
        if(user) await supabase.from('messages').insert([{ content: text, sender_id: user.id, channel_id: 'general' }]);
    } catch (e) { console.error(e); }
  };

  return { messages, sendMessage };
}

// --- ADMIN HOOK ---
export function useAdmin() {
    const [logs, setLogs] = useState<any[]>([]);
    useEffect(() => {
        const fetchLogs = async () => {
            const { data } = await supabase.from('audit_logs').select('*').limit(20);
            if(data) setLogs(data);
        };
        fetchLogs();
    }, []);
    return { logs };
}
