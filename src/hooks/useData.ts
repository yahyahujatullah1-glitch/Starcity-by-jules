import { useState, useEffect } from "react";
import supabase from "@/lib/supabase";

/* ============================
   🔐 AUTH HELPER
============================= */
export const getCurrentUser = () => {
  const data = localStorage.getItem("user");
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
};


/* ============================
   👥 FETCH USERS (STAFF)
============================= */
export function useStaff() {
  const [staff, setStaff] = useState([]);

  const fetchStaff = async () => {
    const { data, error } = await supabase
      .from("users")
      .select("id, full_name, email, job_title, access_level, avatar_url")
      .order("created_at", { ascending: false });

    if (!error) setStaff(data);
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

  return { staff };
}


/* ============================
   📝 TASK MANAGEMENT HOOK
   (Matches your real SQL)
============================= */
export function useTasks() {
  const [tasks, setTasks] = useState([]);

  const fetchTasks = async () => {
    const { data, error } = await supabase
      .from("tasks")
      .select(
        `
        *,
        user:assigned_to (
          id,
          full_name,
          avatar_url,
          job_title
        )
      `
      )
      .order("created_at", { ascending: false });

    if (!error) setTasks(data);
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

  /* CREATE TASK */
  const addTask = async (title, description, due_date, assigned_to) => {
    const { error } = await supabase.from("tasks").insert({
      title,
      description,
      due_date,
      status: "Todo",
      priority: "Normal",
      proof_url: null,
      proof_status: "pending",
      assigned_to
    });

    if (error) throw error;
  };

  /* SUBMIT PROOF */
  const submitProof = async (taskId, proofUrl) => {
    const { error } = await supabase
      .from("tasks")
      .update({
        proof_url: proofUrl,
        proof_status: "pending"
      })
      .eq("id", taskId);

    if (error) throw error;
  };

  /* MANAGER REVIEW */
  const reviewTask = async (taskId, status) => {
    const { error } = await supabase
      .from("tasks")
      .update({ proof_status: status })
      .eq("id", taskId);

    if (error) throw error;
  };

  return { tasks, addTask, submitProof, reviewTask };
}


/* ============================
   🔑 AUTH LOGIN HOOK
============================= */
export function useAuth() {
  const [loading, setLoading] = useState(false);

  const loginUser = async (email, pass) => {
    setLoading(true);

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .eq("password", pass) // 🔥 Replace with hashed auth later!
      .single();

    setLoading(false);

    if (error || !data) return null;

    localStorage.setItem("user", JSON.stringify(data));
    return data;
  };

  const logout = () => {
    localStorage.removeItem("user");
    location.reload();
  };

  return { loginUser, logout, loading };
}
