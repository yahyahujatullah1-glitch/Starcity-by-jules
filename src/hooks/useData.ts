import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

// --- STAFF HOOK ---
export function useStaff() {
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStaff = async () => {
    const { data, error } = await supabase.from('profiles').select('*, roles(name)').order('created_at', { ascending: false });
    if (error) console.error("Staff Error:", error);
    if (data) setStaff(data);
    setLoading(false);
  };

  useEffect(() => { fetchStaff(); }, []);
  return { staff, loading, refresh: fetchStaff };
}

// --- TASKS HOOK ---
export function useTasks() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    const { data, error } = await supabase.from('tasks').select('*, profiles!assigned_to(full_name, avatar_url)').order('created_at', { ascending: false });
    if (error) console.error("Tasks Error:", error);
    if (data) setTasks(data);
    setLoading(false);
  };

  useEffect(() => { fetchTasks(); }, []);
  return { tasks, loading, refresh: fetchTasks };
}

// --- CHAT HOOK (REALTIME FIXED) ---
export function useChat() {
  const [messages, setMessages] = useState<any[]>([]);
  
  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from('messages')
      .select('*, profiles(full_name, avatar_url)')
      .order('created_at', { ascending: true });
      
    if (error) console.error("Chat Load Error:", error);
    if (data) setMessages(data);
  };

  useEffect(() => {
    // 1. Initial Load
    fetchMessages();

    // 2. Realtime Subscription
    console.log("Connecting to Realtime Chat...");
    const channel = supabase.channel('public:messages')
      .on(
        'postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'messages' }, 
        (payload) => {
          console.log("🔴 New Message Received from DB:", payload);
          // When a new message arrives, re-fetch to get the profile data (avatar/name)
          fetchMessages();
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') console.log("✅ Chat Connected!");
      });

    return () => { supabase.removeChannel(channel); };
  }, []);

  const sendMessage = async (text: string) => {
    try {
      // 1. Get User
      let { data: user } = await supabase.from('profiles').select('id').eq('full_name', 'Admin User').single();
      
      // Fallback if Admin missing
      if (!user) {
        const { data: anyUser } = await supabase.from('profiles').select('id').limit(1).single();
        user = anyUser;
      }

      // Self-heal if DB empty
      if (!user) {
        const { data: newUser } = await supabase.from('profiles').insert([{
            full_name: 'Admin User',
            email: 'admin@staffnet.com',
            avatar_url: 'https://i.pravatar.cc/150?u=admin'
        }]).select().single();
        user = newUser;
      }

      if (!user) throw new Error("No user found");

      // 2. Send to DB
      const { error } = await supabase.from('messages').insert([{ 
        content: text, 
        sender_id: user.id, 
        channel_id: 'general' 
      }]);

      if (error) throw error;

      // Note: We don't manually update state here anymore because 
      // the Realtime subscription above will catch the INSERT and update it for everyone.

    } catch (err) {
      console.error("Send Error:", err);
    }
  };

  return { messages, sendMessage };
}

// --- ADMIN HOOK ---
export function useAdmin() {
    const [logs, setLogs] = useState<any[]>([]);
    
    useEffect(() => {
        const fetchLogs = async () => {
            const { data } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(20);
            if(data) setLogs(data);
        };
        fetchLogs();
    }, []);

    return { logs };
}
