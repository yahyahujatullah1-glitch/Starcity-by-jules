import { useEffect, useState } from 'react';

const API_URL = "http://localhost:5000/api";

// --- STAFF ---
export function useStaff() {
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStaff = async () => {
    try {
      const res = await fetch(`${API_URL}/staff`);
      const data = await res.json();
      setStaff(data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchStaff(); }, []);

  const addStaff = async (name: string, email: string, role: string) => {
    await fetch(`${API_URL}/staff`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ full_name: name, email, role })
    });
    fetchStaff();
  };

  const fireStaff = async (id: string) => {
    await fetch(`${API_URL}/staff/${id}`, { method: 'DELETE' });
    fetchStaff();
  };

  return { staff, loading, refresh: fetchStaff, addStaff, fireStaff, roles: [] };
}

// --- TASKS ---
export function useTasks() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    const res = await fetch(`${API_URL}/tasks`);
    const data = await res.json();
    setTasks(data);
    setLoading(false);
  };

  useEffect(() => { fetchTasks(); }, []);

  const addTask = async (title: string, date: string) => {
    // Assign to first user found
    const res = await fetch(`${API_URL}/staff`);
    const users = await res.json();
    
    await fetch(`${API_URL}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, due_date: date, assigned_to: users[0]?._id })
    });
    fetchTasks();
  };

  return { tasks, loading, refresh: fetchTasks, addTask };
}

// --- CHAT ---
export function useChat() {
  const [messages, setMessages] = useState<any[]>([]);

  const fetchMessages = async () => {
    const res = await fetch(`${API_URL}/chat`);
    const data = await res.json();
    setMessages(data);
  };

  useEffect(() => {
    fetchMessages();
    // Poll every 1 second for new messages
    const interval = setInterval(fetchMessages, 1000);
    return () => clearInterval(interval);
  }, []);

  const sendMessage = async (text: string) => {
    // Get Admin ID
    const res = await fetch(`${API_URL}/staff`);
    const users = await res.json();
    const admin = users.find((u: any) => u.email === 'admin@staffnet.com');

    if (admin) {
      await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text, sender_id: admin._id })
      });
      fetchMessages();
    }
  };

  return { messages, sendMessage };
}

// --- ADMIN ---
export function useAdmin() {
    return { logs: [] }; // Placeholder
}
