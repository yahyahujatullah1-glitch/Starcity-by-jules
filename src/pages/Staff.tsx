import { useStaff } from "@/hooks/useData";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Plus, Trash2, Shield } from "lucide-react";

export default function Staff() {
  const { staff, loading, refresh } = useStaff();
  const [isOpen, setIsOpen] = useState(false);

  const handleAdd = async (e: any) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const { data: role } = await supabase.from('roles').select('id').eq('name', 'Staff').single();
    
    await supabase.from('profiles').insert([{
      full_name: formData.get('name'),
      email: formData.get('email'),
      role_id: role?.id,
      avatar_url: `https://i.pravatar.cc/150?u=${Date.now()}`
    }]);
    
    setIsOpen(false);
    refresh();
  };

  const handleDelete = async (id: string) => {
    if(confirm("Delete this user?")) {
      await supabase.from('profiles').delete().eq('id', id);
      refresh();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Staff Directory</h2>
        <Button onClick={() => setIsOpen(true)}><Plus size={18} /> Add Staff</Button>
      </div>

      <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-lg">
        <table className="w-full text-left">
          <thead className="bg-white/5 text-gray-400 border-b border-border">
            <tr>
              <th className="p-4 font-medium text-xs uppercase">Name</th>
              <th className="p-4 font-medium text-xs uppercase">Role</th>
              <th className="p-4 font-medium text-xs uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? <tr><td className="p-4 text-center text-gray-500" colSpan={3}>Loading...</td></tr> : staff.map((s) => (
              <tr key={s.id} className="hover:bg-white/5 transition-colors">
                <td className="p-4 flex items-center gap-3">
                  <img src={s.avatar_url} className="h-10 w-10 rounded-full border border-border" />
                  <div><p className="font-bold text-white">{s.full_name}</p><p className="text-xs text-gray-500">{s.email}</p></div>
                </td>
                <td className="p-4 text-sm text-gray-300"><span className="flex items-center gap-2"><Shield size={14} className="text-primary"/> {s.roles?.name || 'Staff'}</span></td>
                <td className="p-4">
                  <button onClick={() => handleDelete(s.id)} className="text-gray-500 hover:text-red-500 p-2 rounded hover:bg-red-500/10"><Trash2 size={18} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isOpen && (
        <Modal title="Add New Staff" onClose={() => setIsOpen(false)}>
          <form onSubmit={handleAdd} className="space-y-4">
            <div><label className="text-xs text-gray-400 uppercase font-bold">Full Name</label><input name="name" required className="w-full bg-background border border-border rounded-lg p-2 text-white mt-1 focus:border-primary outline-none" /></div>
            <div><label className="text-xs text-gray-400 uppercase font-bold">Email</label><input name="email" type="email" required className="w-full bg-background border border-border rounded-lg p-2 text-white mt-1 focus:border-primary outline-none" /></div>
            <Button type="submit" className="w-full mt-4">Create Account</Button>
          </form>
        </Modal>
      )}
    </div>
  );
}
