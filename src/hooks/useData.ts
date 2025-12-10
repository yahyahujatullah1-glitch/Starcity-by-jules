import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

// --- STAFF & ROLES ---
export function useStaff() {
  const [staff, setStaff] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    const { data: s } = await supabase.from('profiles').select('*, roles(*)').order('created_at', { ascending: false });
    const { data: r } = await supabase.from('roles').select('*').order('name');
    if (s) setStaff(s);
    if (r) setRoles(r);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  // ACTIONS
  const createRole = async (name: string, color: string) => {
    await supabase.from('roles').insert([{ name, color, permissions: 'read_write' }]);
    fetchData();
  };

  const updateUserRole = async (userId: string, roleId: string) => {
    await supabase.from('profiles').update({ role_id: roleId }).eq('id', userId);
    fetchData();
  };

  const fireStaff = async (userId: string) => {
    await supabase.from('profiles').delete().eq('id', userId);
    fetchData();
  };

  const createUser = async (email: string, password: string, name: string, roleId: string) => {
    // 1. Create Auth User
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    
    // 2. Create Profile linked to Auth ID
    if (data.user) {
      await supabase.from('profiles').insert([{
        id: data.user.id, // Link to Auth
        email,
        full_name: name,
        role_id: roleId,
        avatar_url: `https://i.pravatar.cc/150?u=${data.user.id}`
      }]);
    }
    fetchData();
  };

  return { staff, roles, loading, refresh: fetchData, createRole, updateUserRole, fireStaff, createUser };
}

// --- TASKS ---
export function useTasks() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    const { data } = await supabase.from('tasks').select('*, profiles!assigned_to(full_name, avatar_url)').order('created_at', { ascending: false });
    if (data) setTasks(data);
    setLoading(false);
  };

  useEffect(() => { fetchTasks(); }, []);

  // ACTIONS
  const submitProof = async (taskId: string, link: string) => {
    await supabase.from('tasks').update({ proof_url: link, proof_status: 'pending', status: 'Review' }).eq('id', taskId);
    fetchTasks();
  };

  const reviewTask = async (taskId: string, status: 'approved' | 'rejected') => {
    const newStatus = status === 'approved' ? 'Done' : 'In Progress';
    await supabase.from('tasks').update({ proof_status: status, status: newStatus }).eq('id', taskId);
    fetchTasks();
  };

  return { tasks, loading, refresh: fetchTasks, submitProof, reviewTask };
}

// --- CHAT (Kept same as before) ---
export function useChat() {
  const [messages, setMessages] = useState<any[]>([]);
  
  const fetchMessages = async () => {
    const { data } = await supabase.from('messages').select('*, profiles(full_name, avatar_url)').order('created_at', { ascending: true });
    if (data) setMessages(data);
  };

  useEffect(() => {
    fetchMessages();
    const channel = supabase.channel('public:messages').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, () => fetchMessages()).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const sendMessage = async (text: string) => {
    let { data: user } = await supabase.from('profiles').select('id').eq('full_name', 'Admin User').single();
    if (!user) {
        const { data: anyUser } = await supabase.from('profiles').select('id').limit(1).single();
        user = anyUser;
    }
    if (user) await supabase.from('messages').insert([{ content: text, sender_id: user.id, channel_id: 'general' }]);
  };

  return { messages, sendMessage };
                                          }
