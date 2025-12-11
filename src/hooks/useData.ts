import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

// --- AUTH HELPER (Login Check) ---
export const loginUser = async (email: string, pass: string) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .eq('password', pass)
    .single();
  
  if (error) return null;
  return data;
};

// --- STAFF HOOK ---
export function useStaff() {
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStaff = async () => {
    const { data } = await supabase.from('users').select('*').order('created_at', { ascending: false });
    if (data) {
      // Map roles to colors for UI
      const formatted = data.map(u => ({
        ...u,
        roles: { 
          name: u.role, 
          color: u.role === 'Admin' ? 'bg-red-600' : u.role === 'Manager' ? 'bg-orange-500' : 'bg-blue-600' 
        }
      }));
      setStaff(formatted);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStaff();
    // Realtime Listener for new staff
    const ch = supabase.channel('users').on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, fetchStaff).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const addStaff = async (name: string, email: string, role: string, password: string) => {
    await supabase.from('users').insert([{
      full_name: name,
      email,
      role,
      password, // Storing plain text for this demo setup
      avatar_url: `https://i.pravatar.cc/150?u=${Date.now()}`
    }]);
  };

  const fireStaff = async (id: string) => {
    await supabase.from('users').delete().eq('id', id);
  };

  // Placeholder for roles (since we hardcoded them in SQL)
  const roles = [
    { id: '1', name: 'Admin', color: 'bg-red-600' },
    { id: '2', name: 'Manager', color: 'bg-orange-500' },
    { id: '3', name: 'Staff', color: 'bg-blue-600' }
  ];

  return { staff, loading, refresh: fetchStaff, addStaff, fireStaff, createRole: () => {}, roles };
}

// --- TASKS HOOK ---
export function useTasks() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    const { data } = await supabase.from('tasks').select('*').order('created_at', { ascending: false });
    const { data: users } = await supabase.from('users').select('*');

    if (data && users) {
      const merged = data.map(t => {
        const assignee = users.find(u => u.id === t.assigned_to);
        return { ...t, profiles: assignee || { avatar_url: 'https://i.pravatar.cc/150?u=x' } };
      });
      setTasks(merged);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTasks();
    const ch = supabase.channel('tasks').on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, fetchTasks).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const addTask = async (title: string, date: string) => {
    // Assign to first user found
    const { data: users } = await supabase.from('users').select('id').limit(1);
    await supabase.from('tasks').insert([{ title, due_date: date, assigned_to: users?.[0]?.id }]);
  };

  const submitProof = async (taskId: string, link: string) => {
    await supabase.from('tasks').update({ proof_url: link, proof_status: 'pending', status: 'Review' }).eq('id', taskId);
  };

  const reviewTask = async (taskId: string, status: 'approved' | 'rejected') => {
    const newStatus = status === 'approved' ? 'Done' : 'In Progress';
    await supabase.from('tasks').update({ proof_status: status, status: newStatus }).eq('id', taskId);
  };

  return { tasks, loading, refresh: fetchTasks, addTask, submitProof, reviewTask };
}

// --- CHAT HOOK ---
export function useChat() {
  const [messages, setMessages] = useState<any[]>([]);

  const fetchMessages = async () => {
    const { data } = await supabase.from('messages').select('*').order('created_at', { ascending: true });
    const { data: users } = await supabase.from('users').select('*');

    if (data && users) {
      const merged = data.map(m => {
        const sender = users.find(u => u.id === m.sender_id);
        return { 
          ...m, 
          profiles: sender || { full_name: 'Unknown', avatar_url: '' } 
        };
      });
      setMessages(merged);
    }
  };

  useEffect(() => {
    fetchMessages();
    const ch = supabase.channel('messages').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, fetchMessages).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const sendMessage = async (text: string) => {
    // Get current logged in user from LocalStorage
    const session = JSON.parse(localStorage.getItem('staffnet_user') || '{}');
    
    if (session.id) {
      await supabase.from('messages').insert([{
        content: text,
        sender_id: session.id
      }]);
    }
  };

  return { messages, sendMessage };
}

// --- ADMIN HOOK ---
export function useAdmin() {
  return { logs: [] };
      }
