import { useTasks, useStaff, getCurrentUser } from "@/hooks/useData";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useState } from "react";
import { 
  Plus, 
  Link as LinkIcon, 
  ExternalLink, 
  Check, 
  X, 
  User, 
  Calendar, 
  Filter, 
  Trash2,
  CheckSquare
} from "lucide-react";

export default function Tasks() {
  const { tasks = [], addTask, submitProof, reviewTask } = useTasks();
  const { staff = [] } = useStaff();
  const [isOpen, setIsOpen] = useState(false);
  const [detailTask, setDetailTask] = useState<any>(null);
  const [proofLink, setProofLink] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const currentUser = getCurrentUser();
  const canManage = currentUser?.access_level === 'Admin' || currentUser?.access_level === 'Manager';

  // Filter Tasks
  const filteredTasks = tasks.filter(t => {
    if (!filterStatus || filterStatus === "all") return true;
    return t.status === filterStatus;
  });

  // Fix date formatting for your DB (your DB uses "date", not "due_date")
  const formatDate = (dateString: string) => {
    if (!dateString) return "No date";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { 
      month: "short", 
      day: "numeric", 
      year: "numeric" 
    });
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  // Create Task
  const handleAdd = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    try {
      const form = new FormData(e.target);
      await addTask(
        form.get("title") as string,
        form.get("description") as string,
        form.get("date") as string,     // matches your DB
        form.get("assignee") as string
      );
      setIsOpen(false);
      showMessage("success", "Task created!");
      e.target.reset();
    } catch {
      showMessage("error", "Failed to create task");
    } finally {
      setLoading(false);
    }
  };

  // Submit Proof (your DB uses "proof", not "proof_url")
  const handleSubmitProof = async (e: any) => {
    e.preventDefault();

    if (!proofLink.trim()) return;

    if (detailTask.assigned_to !== currentUser?.id) {
      showMessage("error", "You can only submit proof for your own task.");
      return;
    }

    setLoading(true);
    try {
      await submitProof(detailTask.id, proofLink);
      setProofLink("");
      setDetailTask(null);
      showMessage("success", "Proof submitted!");
    } catch {
      showMessage("error", "Failed to submit proof");
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (taskId: string, status: "approved" | "rejected") => {
    setLoading(true);
    try {
      await reviewTask(taskId, status);
      setDetailTask(null);
      showMessage("success", `Task ${status}!`);
    } catch {
      showMessage("error", `Failed to ${status} task`);
    } finally {
      setLoading(false);
    }
  };

  // Color fix
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Done": return "bg-green-500";
      case "Review": return "bg-yellow-500";
      case "In Progress": return "bg-blue-500";
      default: return "bg-primary";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Project Tasks</h2>
          <p className="text-sm text-gray-400 mt-1">{filteredTasks.length} tasks total</p>
        </div>

        <div className="flex gap-3">
          {/* Filter */}
          <div className="relative">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-surface border border-border text-white px-4 py-2 rounded-lg pr-10 text-sm"
            >
              <option value="all">All Tasks</option>
              <option value="Todo">Todo</option>
              <option value="In Progress">In Progress</option>
              <option value="Review">Review</option>
              <option value="Done">Done</option>
            </select>
            <Filter size={16} className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
          </div>

          {canManage && <Button onClick={() => setIsOpen(true)}><Plus size={18} /> New Task</Button>}
        </div>
      </div>

      {/* Success / Error */}
      {message && (
        <div className={`p-4 rounded-lg border ${
          message.type === 'success' 
          ? 'bg-green-500/10 border-green-500/20 text-green-500' 
          : 'bg-red-500/10 border-red-500/20 text-red-500'
        }`}>
          {message.text}
        </div>
      )}

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <div className="bg-surface border border-border rounded-xl p-12 text-center">
          <CheckSquare size={48} className="mx-auto opacity-50 text-gray-500" />
          <h3 className="text-lg font-bold text-white mt-3">No tasks found</h3>
        </div>
      ) : (
        <div className="grid gap-3">
          {filteredTasks.map((t) => (
            <div
              key={t.id}
              onClick={() => setDetailTask(t)}
              className="bg-surface border border-border p-4 rounded-xl flex items-center justify-between hover:border-primary/50 cursor-pointer"
            >
              <div className="flex items-center gap-4 flex-1">
                <div className={`h-3 w-3 rounded-full ${getStatusColor(t.status)}`}></div>
                <div>
                  <h4 className="font-bold text-white">{t.title}</h4>
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                    <Calendar size={12}/> Due: {formatDate(t.date)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <img 
                  src={t.profiles?.avatar_url || "/default-avatar.png"} 
                  className="h-8 w-8 rounded-full border border-border" 
                />
                <span className="px-3 py-1 rounded-full bg-white/5 text-xs font-bold border border-white/10">
                  {t.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- CREATE TASK MODAL FIXED --- */}
      {isOpen && (
        <Modal title="Assign New Task" onClose={() => setIsOpen(false)}>
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="text-xs text-gray-400">Title *</label>
              <input name="title" required className="w-full bg-background border border-border rounded p-2 text-white" />
            </div>

            <div>
              <label className="text-xs text-gray-400">Description *</label>
              <textarea name="description" required className="w-full bg-background border border-border rounded p-2 h-24 text-white" />
            </div>

            <div>
              <label className="text-xs text-gray-400">Due Date *</label>
              <input 
                name="date" 
                type="date" 
                required 
                min={new Date().toISOString().split("T")[0]} 
                className="w-full bg-background border border-border rounded p-2 text-white"
              />
            </div>

            <div>
              <label className="text-xs text-gray-400">Assign To *</label>
              <select name="assignee" required className="w-full bg-background border border-border rounded p-2 text-white">
                <option value="">Select...</option>
                {staff.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.full_name} ({s.job_title})
                  </option>
                ))}
              </select>
            </div>

            <Button className="w-full" disabled={loading}>
              {loading ? "Creating..." : "Assign Task"}
            </Button>
          </form>
        </Modal>
      )}

      {/* --- TASK DETAILS MODAL (MATCHED TO YOUR DB) --- */}
      {detailTask && (
        <Modal 
          title="Task Details" 
          onClose={() => { setDetailTask(null); setProofLink(""); }}
        >
          <div className="space-y-6">
            {/* Title */}
            <div className="flex justify-between items-start mb-2">
              <h2 className="text-xl font-bold text-white">{detailTask.title}</h2>
              <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${getStatusColor(detailTask.status)}`}>
                {detailTask.status}
              </span>
            </div>

            <p className="text-gray-400 bg-white/5 p-3 rounded-lg border border-white/5">
              {detailTask.description}
            </p>

            {/* Two Columns */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-white/5 p-3 rounded-lg">
                <p className="text-gray-500 text-xs mb-1">Assigned to</p>
                <p className="text-white font-bold flex items-center gap-2">
                  <User size={14}/> {detailTask.profiles?.full_name ?? "Unknown"}
                </p>
              </div>
              <div className="bg-white/5 p-3 rounded-lg">
                <p className="text-gray-500 text-xs mb-1">Due Date</p>
                <p className="text-white font-bold flex items-center gap-2">
                  <Calendar size={14}/> {formatDate(detailTask.date)}
                </p>
              </div>
            </div>

            {/* PROOF SECTION */}
            <div className="border-t border-border pt-4">
              <h4 className="font-bold text-gray-300 mb-3 flex items-center gap-2">
                <LinkIcon size={16}/> Proof of Work
              </h4>

              {/* User already submitted proof */}
              {detailTask.proof ? (
                <div className="bg-white/5 p-4 rounded-lg border border-white/10 space-y-3">
                  <div className="flex items-center gap-2 text-blue-400 underline">
                    <ExternalLink size={16}/>
                    <a href={detailTask.proof} target="_blank" className="hover:text-blue-300">
                      {detailTask.proof}
                    </a>
                  </div>

                  {/* REVIEW BADGES */}
                  {detailTask.proof_status === "pending" && (
                    <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 p-2 rounded text-sm">
                      Waiting for review
                    </div>
                  )}
                  {detailTask.proof_status === "approved" && (
                    <div className="bg-green-500/10 border border-green-500/20 text-green-500 p-2 rounded text-sm flex items-center gap-2">
                      <Check size={16}/> Approved
                    </div>
                  )}
                  {detailTask.proof_status === "rejected" && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-2 rounded text-sm flex items-center gap-2">
                      <X size={16}/> Rejected
                    </div>
                  )}

                  {/* MANAGER REVIEW BUTTONS */}
                  {canManage && detailTask.proof_status === "pending" && (
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => handleReview(detailTask.id, "approved")}
                        disabled={loading}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReview(detailTask.id, "rejected")}
                        disabled={loading}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                // No proof yet
                detailTask.assigned_to === currentUser?.id ? (
                  <form onSubmit={handleSubmitProof} className="space-y-3">
                    <input
                      value={proofLink}
                      onChange={(e) => setProofLink(e.target.value)}
                      placeholder="Paste link to proof..."
                      className="w-full bg-background border border-border rounded p-3 text-white"
                      required
                    />
                    <Button className="w-full" disabled={loading}>
                      {loading ? "Submitting..." : "Submit Proof"}
                    </Button>
                  </form>
                ) : (
                  <div className="bg-white/5 p-4 rounded-lg border border-white/10 text-center text-gray-400 text-sm">
                    No proof submitted yet.
                  </div>
                )
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
                }
