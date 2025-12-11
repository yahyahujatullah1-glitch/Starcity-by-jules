import { useState, useEffect } from 'react';

// --- INITIAL DATA ---
const INITIAL_DB = {
  staff: [
    { 
      id: '1', 
      full_name: 'Admin User', 
      email: 'admin@staffnet.com', 
      password: 'password123', 
      role: 'Admin', 
      status: 'Active', 
      avatar_url: 'https://cdn-icons-png.flaticon.com/512/2206/2206368.png' // 👨‍💼
    },
    { 
      id: '2', 
      full_name: 'Sarah Manager', 
      email: 'manager@staffnet.com', 
      password: '123',
      role: 'Manager', 
      status: 'Active', 
      avatar_url: 'https://cdn-icons-png.flaticon.com/512/4140/4140047.png' // 👩‍💼
    },
    { 
      id: '3', 
      full_name: 'John Staff', 
      email: 'staff@staffnet.com', 
      password: '123',
      role: 'Staff', 
      status: 'Active', 
      avatar_url: 'https://cdn-icons-png.flaticon.com/512/3048/3048122.png' // 👷
    }
  ],
  tasks: [
    { 
      id: '101', 
      title: 'Update Brand Guidelines', 
      description: 'Please update the logo usage section and color palette.',
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
  logs: [],
  roles: [
    { id: 'r1', name: 'Admin', color: 'bg-red-600' },
    { id: 'r2', name: 'Manager', color: 'bg-orange-500' },
    { id: 'r3', name: 'Staff', color: 'bg-blue-600' },
    { id: 'r4', name: 'Designer', color: 'bg-pink-500' }
  ]
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

const getAvatarByRole = (role: string) => {
  if (role === 'Admin') return 'https://cdn-icons-png.flaticon.com/512/2206/2206368.png'; // 👨‍💼
  if (role === 'Manager') return 'https://cdn-icons-png.flaticon.com/512/4140/4140047.png'; // 👩‍💼
  return 'https://cdn-icons-png.flaticon.com/512/3048/3048122.png'; // 👷
};

// --- AUTH ---
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
  const [roles, setRoles] = useState<any[]>([]);

  const refresh = () => {
    const db = getDB();
    const merged = db.staff.map((s: any) => {
      const r = db.roles.find((role: any) => role.name === s.role);
      return { ...s, roles: r || { name: s.role, color: 'bg-gray-500' } };
    });
    setStaff(merged);
    setRoles(db.roles);
  };

  useEffect(() => {
    refresh();
    window.addEventListener('db-update', refresh);
    return () => window.removeEventListener('db-update', refresh);
  }, []);

  const addStaff = (name: string, email: string, role: string, password: string) => {
    const db = getDB();
    db.staff.push({
      id: Date.now().toString(),
      full_name: name,
      email,
      password,
      role,
      status: 'Active',
      avatar_url: getAvatarByRole(role)
    });
    saveDB(db);
  };

  const fireStaff = (id: string) => {
    const db = getDB();
    db.staff = db.staff.filter((s: any) => s.id !== id);
    saveDB(db);
  };

  const createRole = (name: string, color: string) => {
    const db = getDB();
    db.roles.push({ id: Date.now().toString(), name, color });
    saveDB(db);
  };

  return { staff, roles, refresh, addStaff, fireStaff, createRole };
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
        profiles: sender || { full_name: 'Unknown', role: 'Guest', avatar_url: 'https://cdn-icons-png.flaticon.com/512/149/149071.png' } 
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

export function useAdmin() {
  return { logs: [] };
  }
