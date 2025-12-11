import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

// --- HELPERS ---
export const getCurrentUser = () => {
  return JSON.parse(localStorage.getItem('staffnet_user') || 'null');
};

export const loginUser = async (email: string, pass: string) => {
  const { data } = await supabase.from('users').select('*').eq('email', email).eq('password', pass).single();
  return data;
};

const getAvatarByRole = (role: string) => {
  if (role === 'Admin') return 'https://cdn-icons-png.flaticon.com/512/2206/2206368.png'; // 👨‍💼
  if (role === 'Manager') return 'https://cdn-icons-png.flaticon.com/512/4140/4140047.png'; // 👩‍💼
  return 'https://cdn-icons-png.flaticon.com/512/3048/3048122.png'; // 👷
};

// --- STAFF HOOK ---
export function useStaff() {
  const [staff, setStaff] = useState<any[]>([]);
  
  const fetchStaff = async () => {
    const { data } = await supabase.from('users').select('*').order('created_at', { ascending: false });
    if (data) {
      const formatted = data.map(u => ({
        ...u,
        roles: { 
          name: u.role, 
          color: u.role === 'Admin' ? 'bg-red-600' : u.role === 'Manager' ? 'bg-orange-500' : 'bg-blue-600' 
        }
      }));
      setStaff(formatted);
    }
  };

  useEffect(() => {
    fetchStaff();
    const ch = supabase.channel('users').on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, fetchStaff).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const addStaff = async (name: string, email: string, role: string, password: string) => {
    await supabase.from('users').insert([{
      full_name: name,
      email,
      role,
      password,
      avatar_url: getAvatarByRole(role)
    }]);
  };

  const fireStaff = async (id: string) => {
    await supabase.from('users').delete().eq('id', id);
  };

  return { staff, refresh: fetchStaff, addStaff, fireStaff };
}

// --- TASKS HOOK ---
export function useTasks() {
  const [tasks, setTasks] = useState<any[]>([]);

  const fetchTasks = async () => {
    const { data } = await supabase.from('tasks').select('*').order('created_at', { ascending: false });
    const { data: users } = await supabase.from('users').select('*');

    if (data && users) {
      const merged = data.map(t => {
        const assignee = users.find(u => u.id === t.assigned_to);
        return { ...t, profiles: assignee || { avatar_url: 'https://cdn-icons-png.flaticon.com/512/149/149071.png' } };
      });
      setTasks(merged);
    }
  };

  useEffect(() => {
    fetchTasks();
    const ch = supabase.channel('tasks').on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, fetchTasks).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const addTask = async (title: string, description: string, date: string, assignedTo: string) => {
    await supabase.from('tasks').insert([{ 
      title, 
      description, 
      due_date: date, 
      assigned_to: assignedTo,
      status: 'Todo' 
    }]);
  };

  const submitProof = async (taskId: string, link: string) => {
    await supabase.from('tasks').update({ proof_url: link, proof_status: 'pending', status: 'Review' }).eq('id', taskId);
  };

  const reviewTask = async (taskId: string, status: 'approved' | 'rejected') => {
    const newStatus = status === 'approved' ? 'Done' : 'In Progress';
    await supabase.from('tasks').update({ proof_status: status, status: newStatus }).eq('id', taskId);
  };

  return { tasks, refresh: fetchTasks, addTask, submitProof, reviewTask };
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
          profiles: sender || { full_name: 'Unknown', role: 'Guest', avatar_url: 'https://cdn-icons-png.flaticon.com/512/149/149071.png' } 
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
    const session = getCurrentUser();
    if (session?.id) {
      await supabase.from('messages').insert([{ content: text, sender_id: session.id }]);
    }
  };

  return { messages, sendMessage };
}

export function useAdmin() { return { logs: [] }; }
