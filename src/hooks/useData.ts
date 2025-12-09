import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

// --- STAFF HOOK ---
export function useStaff() {
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStaff = async () => {
    const { data, error } = await supabase.from('profiles').select('*, roles(name)').order('created_at', { ascending: false });
    if (error) console.error("Staff Fetch Error:", error);
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
    if (error) console.error("Tasks Fetch Error:", error);
    if (data) setTasks(data);
    setLoading(false);
  };

  useEffect(() => { fetchTasks(); }, []);
  return { tasks, loading, refresh: fetchTasks };
}

// --- CHAT HOOK (FIXED) ---
export function useChat() {
  const [messages, setMessages] = useState<any[]>([]);
  
  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from('messages')
      .select('*, profiles(full_name, avatar_url)')
      .order('created_at', { ascending: true });
      
    if (error) console.error("Chat Fetch Error:", error);
    if (data) setMessages(data);
  };

  useEffect(() => {
    fetchMessages();
    
    // Realtime Listener
    const channel = supabase.channel('public:messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        console.log("New Message Received:", payload);
        fetchMessages();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const sendMessage = async (text: string) => {
    try {
      // 1. Try to find 'Admin User'
      let userId;
      const { data: admin } = await supabase.from('profiles').select('id').eq('full_name', 'Admin User').single();
      
      if (admin) {
        userId = admin.id;
      } else {
        // 2. Fallback: Use the first user found in the database (Safety Net)
        const { data: anyUser } = await supabase.from('profiles').select('id').limit(1).single();
        userId = anyUser?.id;
      }

      if (!userId) {
        alert("Error: No users found in database to send message as.");
        return;
      }

      // 3. Insert Message
      const { error } = await supabase.from('messages').insert([{ 
        content: text, 
        sender_id: userId, 
        channel_id: 'general' 
      }]);

      if (error) throw error;

      // 4. Refresh immediately (Optimistic update)
      fetchMessages();

    } catch (err) {
      console.error("Send Message Error:", err);
      alert("Failed to send message. Check console.");
    }
  };

  return { messages, sendMessage };
}
