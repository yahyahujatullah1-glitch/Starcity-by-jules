import { useState, useEffect } from 'react';

// --- INITIAL DATA ---
const INITIAL_DB = {
  staff: [
    { 
      id: '1', 
      full_name: 'Admin User', 
      email: 'admin@staffnet.com', 
      password: 'password123', 
      access_level: 'Admin', // Permissions
      job_title: 'Owner',    // Display Label
      status: 'Active', 
      avatar_url: 'https://cdn-icons-png.flaticon.com/512/2206/2206368.png' 
    },
    { 
      id: '2', 
      full_name: 'Sarah Connor', 
      email: 'manager@staffnet.com', 
      password: '123',
      access_level: 'Manager', 
      job_title: 'Project Lead',
      status: 'Active', 
      avatar_url: 'https://cdn-icons-png.flaticon.com/512/4140/4140047.png' 
    },
    { 
      id: '3', 
      full_name: 'John Doe', 
      email: 'staff@staffnet.com', 
      password: '123',
      access_level: 'Staff', 
      job_title: 'Frontend Dev',
      status: 'Active', 
      avatar_url: 'https://cdn-icons-png.flaticon.com/512/3048/3048122.png' 
    }
  ],
  tasks: [
    { 
      id: '101', 
      title: 'Update Brand Guidelines', 
      description: 'Fix the logo usage.',
      status: 'In Progress', 
      due_date: '2024-10-26', 
      priority: 'High', 
      assigned_to: '3', 
      proof_url: '', 
      proof_status: 'none' 
    }
  ],
  messages: [
    { id: 1, content: "Welcome to StaffNet! 🚀", sender_id: '1', created_at: new Date().toISOString() }
  ],
  logs: []
};

// --- HELPERS ---
const getDB = () => {
  const saved = localStorage.getItem('staffnet_db');
  return saved ? JSON.parse(saved) : INITIAL_DB;
};

const saveDB = (data: any) => {
  localStorage.setItem('staffnet_db', JSON.stringify(data));
  window.dispatchEvent(new Event('db-update'));
};

const getAvatarByAccess = (access: string) => {
  if (access === 'Admin') return 'https://cdn-icons-png.flaticon.com/512/2206/2206368.png'; // 👨‍💼
  if (access === 'Manager') return 'https://cdn-icons-png.flaticon.com/512/4140/4140047.png'; // 👩‍💼
  return 'https://cdn-icons-png.flaticon.com/512/3048/3048122.png'; // 👷
};

export const validateLogin = (email: string, pass: string) => {
  const db = getDB();
  return db.staff.find((u: any) => u.email === email && u.password === pass);
};

export const getCurrentUser = () => {
  return JSON.parse(localStorage.getItem('staffnet_user') || 'null');
};

// --- HOOKS ---

export function useStaff() {
  const [staff, setStaff] = useState<any[]>([]);

  const refresh = () => {
    const db = getDB();
    setStaff(db.staff);
  };

  useEffect(() => {
    refresh();
    window.addEventListener('db-update', refresh);
    return () => window.removeEventListener('db-update', refresh);
  }, []);

  const addStaff = (name: string, email: string, access_level: string, job_title: string, password: string) => {
    const db = getDB();
    db.staff.push({
      id: Date.now().toString(),
      full_name: name,
      email,
      password,
      access_level,
      job_title,
      status: 'Active',
      avatar_url: getAvatarByAccess(access_level)
    });
    saveDB(db);
  };

  const fireStaff = (id: string) => {
    const db = getDB();
    db.staff = db.staff.filter((s: any) => s.id !== id);
    saveDB(db);
  };

  return { staff, refresh, addStaff, fireStaff };
}

export function useTasks() {
  const [tasks, setTasks] = useState<any[]>([]);

  const refresh = () => {
    const db = getDB();
    const merged = db.tasks.map((t: any) => ({
      ...t,
      profiles: db.staff.find((s: any) => s.id === t.assigned_to)
    }));
    setTasks(merged);
  };

  useEffect(() => {
    refresh();
    window.addEventListener('db-update', refresh);
    return () => window.removeEventListener('db-update', refresh);
  }, []);

  const addTask = (title: string, description: string, date: string, assignedTo: string) => {
    const db = getDB();
    db.tasks.unshift({
      id: Date.now().toString(),
      title,
      description,
      due_date: date,
      status: 'Todo',
      assigned_to: assignedTo,
      proof_status: 'none',
      proof_url: ''
    });
    saveDB(db);
  };

  const submitProof = (taskId: string, link: string) => {
    const db = getDB();
    const task = db.tasks.find((t: any) => t.id === taskId);
    if(task) {
      task.proof_url = link;
      task.proof_status = 'pending';
      task.status = 'Review';
    }
    saveDB(db);
  };

  const reviewTask = (taskId: string, status: 'approved' | 'rejected') => {
    const db = getDB();
    const task = db.tasks.find((t: any) => t.id === taskId);
    if(task) {
      task.proof_status = status;
      task.status = status === 'approved' ? 'Done' : 'In Progress';
    }
    saveDB(db);
  };

  return { tasks, refresh, addTask, submitProof, reviewTask };
}

export function useChat() {
  const [messages, setMessages] = useState<any[]>([]);

  const refresh = () => {
    const db = getDB();
    const merged = db.messages.map((m: any) => {
      const sender = db.staff.find((s: any) => s.id === m.sender_id);
      return { 
        ...m, 
        profiles: sender || { full_name: 'Unknown', job_title: 'Guest', avatar_url: 'https://cdn-icons-png.flaticon.com/512/149/149071.png' } 
      };
    });
    setMessages(merged);
  };

  useEffect(() => {
    refresh();
    window.addEventListener('db-update', refresh);
    return () => window.removeEventListener('db-update', refresh);
  }, []);

  const sendMessage = (text: string) => {
    const db = getDB();
    const session = getCurrentUser();
    
    db.messages.push({
      id: Date.now(),
      content: text,
      sender_id: session?.id || '1', 
      created_at: new Date().toISOString()
    });
    saveDB(db);
  };

  return { messages, sendMessage };
}

export function useAdmin() { return { logs: [] }; }
