import { useState } from "react";
import { useStaff } from "@/hooks/useData";
import { Shield, UserPlus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function Admin() {
  const { staff, roles, fireStaff, addStaff, createRole } = useStaff();
  const [activeTab, setActiveTab] = useState<'staff' | 'create' | 'roles'>('staff');
  
  // Added Password field
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'Staff' });
  const [newRole, setNewRole] = useState({ name: '', color: 'bg-gray-500' });

  const handleCreateUser = (e: any) => {
    e.preventDefault();
    // Call addStaff with password
    addStaff(newUser.name, newUser.email, newUser.role, newUser.password);
    alert(`User ${newUser.name} created! They can now login.`);
    setNewUser({ name: '', email: '', password: '', role: 'Staff' });
  };

  const handleCreateRole = (e: any) => {
    e.preventDefault();
    createRole(newRole.name, newRole.color);
    alert("Role created!");
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2"><Shield className="text-primary"/> Admin Console</h2>
        <div className="flex gap-2 bg-surface p-1 rounded-lg border border-border">
          <button onClick={() => setActiveTab('staff')} className={`px-4 py-1.5 rounded-md text-sm font-medium ${activeTab === 'staff' ? 'bg-primary text-white' : 'text-gray-400'}`}>Staff</button>
          <button onClick={() => setActiveTab('create')} className={`px-4 py-1.5 rounded-md text-sm font-medium ${activeTab === 'create' ? 'bg-primary text-white' : 'text-gray-400'}`}>Add User</button>
          <button onClick={() => setActiveTab('roles')} className={`px-4 py-1.5 rounded-md text-sm font-medium ${activeTab === 'roles' ? 'bg-primary text-white' : 'text-gray-400'}`}>Roles</button>
        </div>
      </div>

      {/* STAFF LIST */}
      {activeTab === 'staff' && (
        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-white/5 text-gray-400 border-b border-border"><tr><th className="p-4 text-xs">NAME</th><th className="p-4 text-xs">ROLE</th><th className="p-4 text-xs text-right">ACTION</th></tr></thead>
            <tbody className="divide-y divide-border">
              {staff.map(u => (
                <tr key={u.id} className="hover:bg-white/5">
                  <td className="p-4 font-medium text-gray-200">
                    {u.full_name}
                    <div className="text-xs text-gray-500">{u.email}</div>
                  </td>
                  <td className="p-4"><span className={`px-2 py-1 rounded text-xs font-bold text-white ${u.roles.color}`}>{u.roles.name}</span></td>
                  <td className="p-4 text-right"><button onClick={() => fireStaff(u.id)} className="text-red-500 hover:bg-red-500/10 p-2 rounded"><Trash2 size={16}/></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* CREATE USER */}
      {activeTab === 'create' && (
        <div className="max-w-xl mx-auto bg-surface border border-border rounded-xl p-8">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><UserPlus className="text-primary"/> Create User</h3>
          <form onSubmit={handleCreateUser} className="space-y-4">
            <div><label className="text-xs text-gray-400 font-bold">Name</label><input required value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} className="w-full bg-background border border-border rounded p-2 text-white mt-1" /></div>
            <div><label className="text-xs text-gray-400 font-bold">Email</label><input required value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} className="w-full bg-background border border-border rounded p-2 text-white mt-1" /></div>
            
            {/* Password Field */}
            <div><label className="text-xs text-gray-400 font-bold">Password</label><input required type="password" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} className="w-full bg-background border border-border rounded p-2 text-white mt-1" /></div>
            
            <div><label className="text-xs text-gray-400 font-bold">Role</label><select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})} className="w-full bg-background border border-border rounded p-2 text-white mt-1">{roles.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}</select></div>
            <Button className="w-full mt-4">Create User</Button>
          </form>
        </div>
      )}

      {/* CREATE ROLE */}
      {activeTab === 'roles' && (
        <div className="bg-surface border border-border rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Create New Role</h3>
            <form onSubmit={handleCreateRole} className="space-y-4">
              <div><label className="text-xs text-gray-400 font-bold">Role Name</label><input required value={newRole.name} onChange={e => setNewRole({...newRole, name: e.target.value})} className="w-full bg-background border border-border rounded p-2 text-white mt-1" /></div>
              <div><label className="text-xs text-gray-400 font-bold">Color</label><div className="flex gap-2 mt-2">{['bg-red-600', 'bg-blue-600', 'bg-green-600', 'bg-yellow-500'].map(c => <button key={c} type="button" onClick={() => setNewRole({...newRole, color: c})} className={`h-8 w-8 rounded-full ${c} ${newRole.color === c ? 'ring-2 ring-white' : ''}`}></button>)}</div></div>
              <Button className="w-full">Save Role</Button>
            </form>
        </div>
      )}
    </div>
  );
      }
