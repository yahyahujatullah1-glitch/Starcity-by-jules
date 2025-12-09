import { useTasks } from "@/hooks/useData";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Plus, Link as LinkIcon, ExternalLink } from "lucide-react";

export default function Tasks() {
  const { tasks, loading, refresh } = useTasks();
  const [isOpen, setIsOpen] = useState(false);
  const [detailTask, setDetailTask] = useState<any>(null);

  const handleAdd = async (e: any) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const { data: user } = await supabase.from('profiles').select('id').limit(1).single();
    await supabase.from('tasks').insert([{
      title: formData.get('title'),
      due_date: formData.get('date'),
      status: 'Todo',
      assigned_to: user?.id
    }]);
    setIsOpen(false);
    refresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Tasks</h2>
        <Button onClick={() => setIsOpen(true)}><Plus size={18} /> New Task</Button>
      </div>

      <div className="grid gap-3">
        {loading ? <p className="text-gray-500">Loading...</p> : tasks.map(t => (
          <div key={t.id} onClick={() => setDetailTask(t)} className="bg-surface border border-border p-4 rounded-xl flex items-center justify-between hover:border-primary/50 cursor-pointer transition-all group">
            <div className="flex items-center gap-4">
              <div className={`h-3 w-3 rounded-full ${t.status === 'Done' ? 'bg-green-500' : 'bg-primary'}`}></div>
              <div>
                <h4 className="font-bold text-white group-hover:text-primary transition-colors">{t.title}</h4>
                <p className="text-xs text-gray-500">Due: {t.due_date || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <img src={t.profiles?.avatar_url} className="h-8 w-8 rounded-full border border-border" />
              <span className="px-3 py-1 rounded-full bg-white/5 text-xs font-bold border border-white/10">{t.status}</span>
            </div>
          </div>
        ))}
      </div>

      {isOpen && (
        <Modal title="Create New Task" onClose={() => setIsOpen(false)}>
          <form onSubmit={handleAdd} className="space-y-4">
            <div><label className="text-xs text-gray-400 font-bold">Title</label><input name="title" required className="w-full bg-background border border-border rounded p-2 text-white mt-1" /></div>
            <div><label className="text-xs text-gray-400 font-bold">Due Date</label><input name="date" type="date" required className="w-full bg-background border border-border rounded p-2 text-white mt-1" /></div>
            <Button className="w-full">Create Task</Button>
          </form>
        </Modal>
      )}

      {detailTask && (
        <Modal title="Task Details" onClose={() => setDetailTask(null)}>
          <div className="space-y-6">
            <div><h2 className="text-xl font-bold text-white">{detailTask.title}</h2><span className="text-primary text-sm font-medium">{detailTask.status}</span></div>
            <div className="border-t border-border pt-4">
              <h4 className="font-bold text-gray-300 mb-3 flex items-center gap-2"><LinkIcon size={16}/> Proof of Work</h4>
              <div className="flex gap-2">
                <input placeholder="Paste Drive/Video link..." className="flex-1 bg-background border border-border rounded p-2 text-sm text-white" />
                <Button variant="secondary">Add</Button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
