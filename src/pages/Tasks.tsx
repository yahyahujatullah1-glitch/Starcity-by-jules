import { useTasks, useStaff, getCurrentUser } from "@/hooks/useData";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useState } from "react";
import { Plus, Link as LinkIcon, ExternalLink, Check, X, User, Calendar, Filter, Trash2 } from "lucide-react";

export default function Tasks() {
  const { tasks, addTask, submitProof, reviewTask } = useTasks();
  const { staff } = useStaff();
  const [isOpen, setIsOpen] = useState(false);
  const [detailTask, setDetailTask] = useState<any>(null);
  const [proofLink, setProofLink] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  const currentUser = getCurrentUser();
  const canManage = currentUser?.access_level === 'Admin' || currentUser?.access_level === 'Manager';

  // Filter tasks
  const filteredTasks = tasks.filter(t => {
    if (filterStatus === 'all') return true;
    return t.status === filterStatus;
  });

  // Format date helper
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleAdd = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(e.target);
      await addTask(
        formData.get('title') as string, 
        formData.get('description') as string,
        formData.get('date') as string,
        formData.get('assignee') as string
      );
      setIsOpen(false);
      e.target.reset();
      showMessage('success', 'Task created successfully!');
    } catch (error) {
      showMessage('error', 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitProof = async (e: any) => {
    e.preventDefault();
    if (!detailTask || !proofLink.trim()) return;
    
    // Check if current user is assigned to this task
    if (detailTask.assigned_to !== currentUser?.id) {
      showMessage('error', 'You can only submit proof for tasks assigned to you');
      return;
    }

    setLoading(true);
    try {
      await submitProof(detailTask.id, proofLink);
      setProofLink("");
      setDetailTask(null);
      showMessage('success', 'Proof submitted successfully!');
    } catch (error) {
      showMessage('error', 'Failed to submit proof');
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (taskId: string, status: 'approved' | 'rejected') => {
    setLoading(true);
    try {
      await reviewTask(taskId, status);
      setDetailTask(null);
      showMessage('success', `Task ${status} successfully!`);
    } catch (error) {
      showMessage('error', `Failed to ${status} task`);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Done': return 'bg-green-500';
      case 'Review': return 'bg-yellow-500';
      case 'In Progress': return 'bg-blue-500';
      default: return 'bg-primary';
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
          {/* Filter Dropdown */}
          <div className="relative">
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-surface border border-border text-white px-4 py-2 rounded-lg appearance-none pr-10 text-sm"
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
            <Button onClick={() => setIsOpen(true)}><Plus size={18} /> New Task</Button>
          )}
        </div>
      </div>

      {/* Success/Error Message */}
      {message && (
        <div className={`p-4 rounded-lg border ${message.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-red-500/10 border-red-500/20 text-red-500'} animate-in fade-in`}>
          {message.text}
        </div>
      )}

      {/* Tasks List */}
      {filteredTasks.length === 0 ? (
        <div className="bg-surface border border-border rounded-xl p-12 text-center">
          <div className="text-gray-500 mb-4">
            <CheckSquare size={48} className="mx-auto opacity-50" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">No tasks found</h3>
          <p className="text-gray-400 text-sm">
            {filterStatus === 'all' 
              ? canManage ? 'Create your first task to get started' : 'No tasks assigned yet'
              : `No tasks with status "${filterStatus}"`
            }
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {filteredTasks.map(t => (
            <div 
              key={t.id} 
              onClick={() => setDetailTask(t)} 
              className="bg-surface border border-border p-4 rounded-xl flex items-center justify-between hover:border-primary/50 cursor-pointer transition-all group"
            >
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className={`h-3 w-3 rounded-full flex-shrink-0 ${getStatusColor(t.status)}`}></div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-white group-hover:text-primary transition-colors truncate">{t.title}</h4>
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                    <Calendar size={12}/> Due: {formatDate(t.due_date)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {t.proof_status === 'pending' && canManage && (
                  <span className="text-xs bg-yellow-500/20 text-yellow-500 px-3 py-1 rounded-full animate-pulse font-medium">
                    Needs Review
                  </span>
                )}
                {t.proof_status === 'approved' && (
                  <span className="text-xs bg-green-500/20 text-green-500 px-3 py-1 rounded-full font-medium flex items-center gap-1">
                    <Check size={12} /> Approved
                  </span>
                )}
                {t.proof_status === 'rejected' && (
                  <span className="text-xs bg-red-500/20 text-red-500 px-3 py-1 rounded-full font-medium flex items-center gap-1">
                    <X size={12} /> Rejected
                  </span>
                )}
                <div className="flex items-center gap-2">
                  <img src={t.profiles?.avatar_url} className="h-8 w-8 rounded-full border border-border" alt={t.profiles?.full_name} />
                  <span className="px-3 py-1 rounded-full bg-white/5 text-xs font-bold border border-white/10">{t.status}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE TASK MODAL */}
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
                placeholder="Describe the task in detail..."
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 font-bold">Due Date *</label>
              <input 
                name="date" 
                type="date" 
                required 
                min={new Date().toISOString().split('T')[0]}
                className="w-full bg-background border border-border rounded p-2 text-white mt-1" 
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 font-bold">Assign To *</label>
              <select name="assignee" required className="w-full bg-background border border-border rounded p-2 text-white mt-1">
                <option value="">Select team member...</option>
                {staff.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.full_name} ({s.job_title})
                  </option>
                ))}
              </select>
            </div>
            <Button className="w-full" disabled={loading}>
              {loading ? 'Creating...' : 'Assign Task'}
            </Button>
          </form>
        </Modal>
      )}

      {/* TASK DETAIL MODAL */}
      {detailTask && (
        <Modal title="Task Details" onClose={() => { setDetailTask(null); setProofLink(""); }}>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-start mb-2">
                <h2 className="text-xl font-bold text-white">{detailTask.title}</h2>
                <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${getStatusColor(detailTask.status)}`}>
                  {detailTask.status}
                </span>
              </div>
              <p className="text-gray-400 text-sm mt-2 bg-white/5 p-3 rounded-lg border border-white/5">
                {detailTask.description || "No description provided."}
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-white/5 p-3 rounded-lg">
                <p className="text-gray-500 text-xs mb-1">Assigned to</p>
                <p className="text-white font-bold flex items-center gap-2">
                  <User size={14} /> {detailTask.profiles?.full_name}
                </p>
              </div>
              <div className="bg-white/5 p-3 rounded-lg">
                <p className="text-gray-500 text-xs mb-1">Due Date</p>
                <p className="text-white font-bold flex items-center gap-2">
                  <Calendar size={14} /> {formatDate(detailTask.due_date)}
                </p>
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <h4 className="font-bold text-gray-300 mb-3 flex items-center gap-2">
                <LinkIcon size={16}/> Proof of Work
              </h4>
              
              {detailTask.proof_url ? (
                <div className="bg-white/5 p-4 rounded-lg border border-white/10 space-y-3">
                  <div className="flex items-center gap-2 text-blue-400 underline truncate">
                    <ExternalLink size={16}/> 
                    <a href={detailTask.proof_url} target="_blank" rel="noopener noreferrer" className="hover:text-blue-300">
                      {detailTask.proof_url}
                    </a>
                  </div>
                  
                  {/* Proof Status Badge */}
                  {detailTask.proof_status === 'pending' && (
                    <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 p-2 rounded text-sm">
                      ⏳ Waiting for review
                    </div>
                  )}
                  {detailTask.proof_status === 'approved' && (
                    <div className="bg-green-500/10 border border-green-500/20 text-green-500 p-2 rounded text-sm flex items-center gap-2">
                      <Check size={16} /> Approved by manager
                    </div>
                  )}
                  {detailTask.proof_status === 'rejected' && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-2 rounded text-sm flex items-center gap-2">
                      <X size={16} /> Rejected - Please resubmit
                    </div>
                  )}
                  
                  {/* Review Buttons - Only show for managers when status is pending */}
                  {canManage && detailTask.proof_status === 'pending' && (
                    <div className="flex gap-2 pt-2">
                      <button 
                        onClick={() => handleReview(detailTask.id, 'approved')} 
                        disabled={loading}
                        className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white py-2 rounded flex items-center justify-center gap-2 transition-colors"
                      >
                        <Check size={16}/> Approve
                      </button>
                      <button 
                        onClick={() => handleReview(detailTask.id, 'rejected')} 
                        disabled={loading}
                        className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white py-2 rounded flex items-center justify-center gap-2 transition-colors"
                      >
                        <X size={16}/> Reject
                      </button>
                    </div>
                  )}
                  {!canManage && detailTask.proof_status === 'pending' && (
                    <p className="text-xs text-gray-500 text-center">Waiting for manager review.</p>
                  )}
                </div>
              ) : (
                /* Submit Proof Form - Only show if assigned to current user and no proof exists */
                detailTask.assigned_to === currentUser?.id ? (
                  <form onSubmit={handleSubmitProof} className="space-y-3">
                    <input 
                      value={proofLink} 
                      onChange={e => setProofLink(e.target.value)} 
                      placeholder="Paste proof link (Google Drive, Video, etc)..." 
                      className="w-full bg-background border border-border rounded p-3 text-sm text-white" 
                      required 
                    />
                    <Button variant="secondary" className="w-full" disabled={loading}>
                      {loading ? 'Submitting...' : 'Submit Proof'}
                    </Button>
                  </form>
                ) : (
                  <div className="bg-white/5 p-4 rounded-lg border border-white/10 text-center text-gray-400 text-sm">
                    No proof submitted yet. Waiting for {detailTask.profiles?.full_name} to submit.
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
