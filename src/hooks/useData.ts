import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

/* ============================
   🔐 AUTH HELPER
============================= */
export const getCurrentUser = () => {
  // ✅ Fixed: Changed from "user" to "staffnet_user" to match Login.tsx
  const data = localStorage.getItem("staffnet_user");
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
};


/* ============================
   👥 STAFF (users table)
============================= */
export function useStaff() {
  const [staff, setStaff] = useState<any[]>([]);

  const fetchStaff = async () => {
    const { data, error } = await supabase
      .from("users")
      .select("id, full_name, email, job_title, access_level, avatar_url")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching staff:", error);
    } else {
      console.log("Staff fetched:", data); // Debug log
      setStaff(data || []);
    }
  };

  useEffect(() => {
    fetchStaff();

    const channel = supabase
      .channel("users-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "users" },
        fetchStaff
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  // ✅ Added functions to add/remove staff
  const addStaff = async (name: string, email: string, access_level: string, job_title: string, password: string) => {
    const { error } = await supabase.from("users").insert({
      full_name: name,
      email,
      password,
      access_level,
      job_title,
      avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`
    });

    if (error) throw error;
  };

  const fireStaff = async (id: string) => {
    const { error } = await supabase
      .from("users")
      .delete()
      .eq("id", id);

    if (error) throw error;
  };

  return { staff, addStaff, fireStaff };
}


/* ============================
   📝 TASKS MANAGEMENT
============================= */
export function useTasks() {
  const [tasks, setTasks] = useState<any[]>([]);

  const fetchTasks = async () => {
    const { data, error } = await supabase
      .from("tasks")
      .select(`
        *,
        user:assigned_to (
          id,
          full_name,
          avatar_url,
          job_title
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching tasks:", error);
    } else {
      setTasks(data || []);
    }
  };

  useEffect(() => {
    fetchTasks();

    const channel = supabase
      .channel("tasks-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tasks" },
        fetchTasks
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  /* =====================
     CREATE TASK
  ====================== */
  const addTask = async (
    title: string,
    description: string,
    due_date: string,
    assigned_to: string
  ) => {
    const { error } = await supabase.from("tasks").insert({
      title,
      description,
      due_date,
      assigned_to,
      status: "Todo",
      proof_status: null,   // ✅ FIXED
      proof_url: null
    });

    if (error) throw error;
  };

  /* =====================
     SUBMIT PROOF
     → moves task to Review
  ====================== */
  const submitProof = async (taskId: string, proofUrl: string) => {
    const { error } = await supabase
      .from("tasks")
      .update({
        proof_url: proofUrl,
        proof_status: "pending",
        status: "Review"
      })
      .eq("id", taskId);

    if (error) throw error;
  };

  /* =====================
     MANAGER REVIEW
  ====================== */
  const reviewTask = async (
    taskId: string,
    proofStatus: "approved" | "rejected"
  ) => {
    const update =
      proofStatus === "approved"
        ? { proof_status: "approved" }
        : { proof_status: "rejected", status: "In Progress" };

    const { error } = await supabase
      .from("tasks")
      .update(update)
      .eq("id", taskId);

    if (error) throw error;
  };

  /* =====================
     UPDATE TASK STATUS
  ====================== */
  const updateTaskStatus = async (taskId: string, status: string) => {
    const { error } = await supabase
      .from("tasks")
      .update({ status })
      .eq("id", taskId);

    if (error) throw error;
  };

  return {
    tasks,
    addTask,
    submitProof,
    reviewTask,
    updateTaskStatus
  };
}
/* ============================
   💬 CHAT SYSTEM
============================= */
export function useChat() {
  const [messages, setMessages] = useState<any[]>([]);

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from("messages")
      .select(`
        *,
        profiles:sender_id (
          id,
          full_name,
          avatar_url,
          job_title
        )
      `)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching messages:", error);
    } else {
      setMessages(data || []);
    }
  };

  useEffect(() => {
    fetchMessages();

    const channel = supabase
      .channel("messages-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "messages" },
        fetchMessages
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  const sendMessage = async (content: string) => {
    const user = getCurrentUser();
    if (!user) return;

    const { error } = await supabase.from("messages").insert({
      content,
      sender_id: user.id
    });

    if (error) console.error("Error sending message:", error);
  };

  return { messages, sendMessage };
}


/* ============================
   🔑 LOGIN SYSTEM
============================= */
export function useAuth() {
  const [loading, setLoading] = useState(false);

  const loginUser = async (email: string, pass: string) => {
    setLoading(true);

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .eq("password", pass)
      .single();

    setLoading(false);

    if (error || !data) return null;

    // ✅ Fixed: Changed from "user" to "staffnet_user"
    localStorage.setItem("staffnet_user", JSON.stringify(data));
    return data;
  };

  const logout = () => {
    localStorage.removeItem("staffnet_user");
    location.reload();
  };

  return { loginUser, logout, loading };
}

// ✅ Export loginUser as standalone function for Login.tsx
export const loginUser = async (email: string, password: string) => {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .eq("password", password)
    .single();

  if (error || !data) return null;
  return data;
};
