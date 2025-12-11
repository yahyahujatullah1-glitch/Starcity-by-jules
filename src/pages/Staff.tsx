import { useStaff, getCurrentUser } from "@/hooks/useData";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useState } from "react";
import { Plus, Trash2, Shield } from "lucide-react";

export default function Staff() {
  const { staff, addStaff, fireStaff } = useStaff();
  const [isOpen, setIsOpen] = useState(false);
  
  const currentUser = getCurrentUser();
  const isAdmin = currentUser?.role === 'Admin';

  const handleAdd = (e: any) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    addStaff(formData.get('name') as string, formData.get('email') as string, 'Staff', '123');
    setIsOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Staff Directory</h2>
        {isAdmin && <Button onClick={() => setIsOpen(true)}><Plus size={18} /> Add Staff</Button>}
      </div>

      <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-lg">
        <table className="w-full text-left">
          <thead className="bg-white/5 text-gray-400 border-b border-border">
            <tr><th className="p-4 text-xs uppercase">Name</th><th className="p-4 text-xs uppercase">Role</th><th className="p-4 text-xs uppercase">Status</th>{isAdmin && <th className="p-4 text-xs uppercase text-right">Actions</th>}</tr>
          </thead>
          <tbody className="divide-y divide-border">
            {staff.map((s) => (
              <tr key={s.id} className="hover:bg-white/5 transition-colors">
                <td className="p-4 flex items-center gap-3">
                  <img src={s.avatar_url} className="h-10 w-10 rounded-full border border-border" />
                  <div><p className="font-bold text-white">{s.full_name}</p><p className="text-xs text-gray-500">{s.email}</p></div>
                </td>
                <td className="p-4 text-sm text-gray-300"><span className={`flex items-center gap-2 px-2 py-1 rounded text-xs font-bold text-white ${s.roles.color}`}>{s.roles.name}</span></td>
                <td className="p-4"><span className="px-2 py-1 rounded-full text-xs font-bold bg-green-500/10 text-green-500 border border-green-500/20">Active</span></td>
                {isAdmin && (
                  <td className="p-4 text-right"><button onClick={() => fireStaff(s.id)} className="text-gray-500 hover:text-red-500 p-2"><Trash2 size={18} /></button></td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isOpen && (
        <Modal title="Add New Staff" onClose={() => setIsOpen(false)}>
          <form onSubmit={handleAdd} className="space-y-4">
            <div><label className="text-xs text-gray-400 font-bold">Name</label><input name="name" required className="w-full bg-background border border-border rounded p-2 text-white mt-1" /></div>
            <div><label className="text-xs text-gray-400 font-bold">Email</label><input name="email" required className="w-full bg-background border border-border rounded p-2 text-white mt-1" /></div>
            <Button className="w-full">Create</Button>
          </form>
        </Modal>
      )}
    </div>
  );
}
