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
  CheckSquare
} from "lucide-react";

export default function Tasks() {
  const { tasks = [], addTask, submitProof, reviewTask, updateTaskStatus } = useTasks();
  const { staff } = useStaff();
  const [isOpen, setIsOpen] = useState(false);
  const [detailTask, setDetailTask] = useState<any>(null);
  const [proofLink, setProofLink] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const currentUser = getCurrentUser();
  const canManage = currentUser?.access_level === "Admin" || currentUser?.access_level === "Manager";

  // Filter Tasks
  const filteredTasks = tasks.filter((t) => {
    if (filterStatus === "all") return true;
    return t.status === filterStatus;
  });

  // Format Date
  const formatDate = (d: string) => {
    if (!d) return "No date";
    return new Date(d).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Flash message
  const showMessage = (type: "success" | "error", text: string) => {
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
        form.get("date") as string,
        form.get("assignee") as string
      );
      setIsOpen(false);
      showMessage("success", "Task created successfully!");
      e.target.reset();
    } catch (error) {
      console.error("Error creating task:", error);
      showMessage("error", "Failed to create task");
    } finally {
      setLoading(false);
    }
  };

  // Submit Proof
  const handleSubmitProof = async (e: any) => {
    e.preventDefault();
    if (!detailTask || !proofLink.trim()) return;

    if (detailTask.assigned_to !== currentUser?.id) {
      return showMessage("error", "You can only submit proof for your own task.");
    }

    setLoading(true);
    try {
      await submitProof(detailTask.id, proofLink);
      setProofLink("");
      setDetailTask(null);
      showMessage("success", "Proof submitted for review!");
    } catch (error) {
      console.error("Error submitting proof:", error);
      showMessage("error", "Failed to submit proof");
    } finally {
      setLoading(false);
    }
  };

  // Manager Review (Approve/Reject)
  const handleReview = async (id: string, status: "approved" | "rejected") => {
    if (!canManage) {
      return showMessage("error", "Only managers can review tasks");
    }

    setLoading(true);
    try {
      await reviewTask(id, status);
      setDetailTask(null);
      showMessage("success", `Task ${status === "approved" ? "approved" : "rejected"}!`);
    } catch (error) {
      console.error("Error reviewing task:", error);
      showMessage("error", `Failed to ${status} task`);
    } finally {
      setLoading(false);
    }
  };

  // Change Task Status (for staff to mark as In Progress, etc.)
  const handleStatusChange = async (taskId: string, newStatus: string) => {
    setLoading(true);
    try {
      await updateTaskStatus(taskId, newStatus);
      showMessage("success", `Task status updated to ${newStatus}`);
      // Refresh detail if viewing this task
      if (detailTask?.id === taskId) {
        const updated = tasks.find(t => t.id === taskId);
        if (updated) setDetailTask(updated);
      }
    } catch (error) {
      console.error("Error updating status:", error);
      showMessage("error", "Failed to update task status");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Done": return "bg-green-500";
      case "Review": return "bg-yellow-500";
      case "In Progress": return "bg-blue-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "Done": return "bg-green-500/20 text-green-400 border-green-500/30";
      case "Review": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "In Progress": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
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

          {canManage && (
            <Button onClick={() => setIsOpen(true)}>
              <Plus size={18} /> New Task
            </Button>
          )}
        </div>
      </div>

      {/* Flash Message */}
      {message && (
        <div
          className={`p-4 rounded-lg border ${
            message.type === "success"
              ? "bg-green-500/10 border-green-500/20 text-green-500"
              : "bg-red-500/10 border-red-500/20 text-red-500"
          } transition animate-in fade-in`}
        >
          {message.text}
        </div>
      )}

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <div className="bg-surface border border-border rounded-xl p-12 text-center">
          <CheckSquare size={48} className="mx-auto opacity-50 text-gray-500" />
          <h3 className="text-lg font-bold text-white mt-3">No tasks found</h3>
          <p className="text-gray-500 text-sm mt-1">
            {filterStatus === "all" 
              ? "Create a new task to get started" 
              : `No tasks with status "${filterStatus}"`
            }
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {filteredTasks.map((t) => (
            <div
              key={t.id}
              onClick={() => setDetailTask(t)}
              className="bg-surface border border-border p-4 rounded-xl flex items-center justify-between hover:border-primary/60 cursor-pointer transition"
            >
              <div className="flex items-center gap-4 flex-1">
                <div className={`h-3 w-3 rounded-full ${getStatusColor(t.status)}`}></div>

                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-white truncate">{t.title}</h4>
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                    <Calendar size={12} /> Due: {formatDate(t.due_date)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <img
                  src={t.user?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${t.user?.full_name || 'user'}`}
                  className="h-8 w-8 rounded-full border border-border"
                  alt="avatar"
                />

                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadgeColor(t.status)}`}>
                  {t.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Task Modal */}
      {isOpen && (
        <Modal title="Assign New Task" onClose={() => setIsOpen(false)}>
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="text-xs text-gray-400 font-bold">Title *</label>
              <input
                name="title"
                required
                className="w-full bg-background border border-border rounded p-2 text-white mt-1"
                placeholder="e.g. Design landing page"
              />
            </div>

            <div>
              <label className="text-xs text-gray-400 font-bold">Description *</label>
              <textarea
                name="description"
                required
                className="w-full bg-background border border-border rounded p-2 text-white mt-1 h-24"
                placeholder="Describe the task..."
              />
            </div>

            <div>
              <label className="text-xs text-gray-400 font-bold">Due Date *</label>
              <input
                name="date"
                type="date"
                required
                min={new Date().toISOString().split("T")[0]}
                className="w-full bg-background border border-border rounded p-2 text-white mt-1"
              />
            </div>

            <div>
              <label className="text-xs text-gray-400 font-bold">Assign To *</label>
              <select
                name="assignee"
                required
                className="w-full bg-background border border-border rounded p-2 text-white mt-1"
              >
                <option value="">Select a staff member...</option>
                {staff.map((s: any) => (
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

      {/* Task Details Modal */}
      {detailTask && (
        <Modal
          title="Task Details"
          onClose={() => {
            setDetailTask(null);
            setProofLink("");
          }}
        >
          <div className="space-y-6">
            {/* Title & Status */}
            <div className="flex justify-between items-start mb-2">
              <h2 className="text-xl font-bold text-white">{detailTask.title}</h2>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold text-white ${getStatusColor(
                  detailTask.status
                )}`}
              >
                {detailTask.status}
              </span>
            </div>

            <p className="text-gray-400 bg-white/5 p-3 rounded-lg border border-white/5">
              {detailTask.description}
            </p>

            {/* Task Info */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-white/5 p-3 rounded-lg">
                <p className="text-gray-500 text-xs mb-1">Assigned To</p>
                <p className="text-white font-bold flex items-center gap-2">
                  <User size={14} /> {detailTask.user?.full_name ?? "Unknown"}
                </p>
              </div>
              <div className="bg-white/5 p-3 rounded-lg">
                <p className="text-gray-500 text-xs mb-1">Due Date</p>
                <p className="text-white font-bold flex items-center gap-2">
                  <Calendar size={14} /> {formatDate(detailTask.due_date)}
                </p>
              </div>
            </div>

            {/* Status Update (for assigned user) */}
            {detailTask.assigned_to === currentUser?.id && detailTask.status !== "Done" && (
              <div className="border-t border-border pt-4">
                <h4 className="font-bold text-gray-300 mb-3 text-sm">Update Status</h4>
                <div className="flex gap-2">
                  {detailTask.status === "Todo" && (
                    <button
                      onClick={() => handleStatusChange(detailTask.id, "In Progress")}
                      disabled={loading}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded transition text-sm disabled:opacity-50"
                    >
                      Start Task
                    </button>
                  )}
                  {detailTask.status === "In Progress" && detailTask.proof_url && detailTask.proof_status === "approved" && (
                    <button
                      onClick={() => handleStatusChange(detailTask.id, "Done")}
                      disabled={loading}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded transition text-sm disabled:opacity-50"
                    >
                      Mark as Done
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Proof Section */}
            <div className="border-t border-border pt-4">
              <h4 className="font-bold text-gray-300 mb-3 flex items-center gap-2">
                <LinkIcon size={16} /> Proof of Work
              </h4>

              {/* If proof exists */}
              {detailTask.proof_url ? (
                <div className="bg-white/5 p-4 rounded-lg border border-white/10 space-y-3">
                  <div className="flex items-center gap-2 text-blue-400 truncate">
                    <ExternalLink size={16} />
                    <a
                      href={detailTask.proof_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-blue-300 truncate underline text-sm"
                    >
                      {detailTask.proof_url}
                    </a>
                  </div>

                  {/* Proof Status */}
                  {detailTask.proof_status === "pending" && (
                    <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 p-2 rounded text-sm">
                      ⏳ Waiting for manager review
                    </div>
                  )}
                  {detailTask.proof_status === "approved" && (
                    <div className="bg-green-500/10 border border-green-500/20 text-green-500 p-2 rounded text-sm flex items-center gap-2">
                      <Check size={16} /> Approved by manager
                    </div>
                  )}
                  {detailTask.proof_status === "rejected" && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-2 rounded text-sm flex items-center gap-2">
                      <X size={16} /> Rejected — Please resubmit with corrections
                    </div>
                  )}

                  {/* Manager Review Buttons */}
                  {canManage && detailTask.proof_status === "pending" && (
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => handleReview(detailTask.id, "approved")}
                        disabled={loading}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded transition disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        <Check size={16} /> Approve
                      </button>
                      <button
                        onClick={() => handleReview(detailTask.id, "rejected")}
                        disabled={loading}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded transition disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        <X size={16} /> Reject
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                // No proof yet
                detailTask.assigned_to === currentUser?.id ? (
                  detailTask.status === "In Progress" ? (
                    <form onSubmit={handleSubmitProof} className="space-y-3">
                      <input
                        value={proofLink}
                        onChange={(e) => setProofLink(e.target.value)}
                        placeholder="Paste proof link (screenshot, document, etc.)..."
                        className="w-full bg-background border border-border rounded p-3 text-white"
                        required
                      />

                      <Button className="w-full" disabled={loading}>
                        {loading ? "Submitting..." : "Submit Proof for Review"}
                      </Button>
                    </form>
                  ) : (
                    <div className="bg-white/5 p-4 rounded-lg border border-white/10 text-center text-gray-400 text-sm">
                      Start the task to submit proof of work.
                    </div>
                  )
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
