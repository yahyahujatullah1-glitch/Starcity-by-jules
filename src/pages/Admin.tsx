import { useState, useEffect } from "react";
import { useStaff, getCurrentUser } from "@/hooks/useData";
import { Shield, UserPlus, Trash2, Lock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useNavigate } from "react-router-dom";

export default function Admin() {
  const { staff, fireStaff, addStaff } = useStaff();
  const [activeTab, setActiveTab] = useState<'staff' | 'create'>('staff');
  
  const [newUser, setNewUser] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    access_level: 'Staff', 
    job_title: '' 
  });
  
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user || user.access_level !== 'Admin') {
      // Not admin
    } else {
      setIsAdmin(true);
    }
  }, [navigate]);

  if (!isAdmin) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
        <div className="p-4 bg-red-500/10 rounded-full text-red-500"><Lock size={48} /></div>
        <h2 className="text-2xl font-bold text-white">Access Denied</h2>
        <p className="text-gray-400">Only Admins can access this panel.</p>
        <Button onClick={() => navigate("/")}>Go Back Home</Button>
      </div>
    );
  }

  const handleCreateUser = async (e: any) => {
    e.preventDefault();
    try {
      await addStaff(newUser.name, newUser.email, newUser.access_level, newUser.job_title, newUser.password);
      alert(`User ${newUser.name} created!`);
      setNewUser({ name: '', email: '', password: '', access_level: 'Staff', job_title: '' });
    } catch (error) {
      console.error("Error creating user:", error);
      alert("Failed to create user");
    }
  };

  const handleDeleteStaff = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to remove ${name}?`)) {
      try {
        await fireStaff(id);
        alert("Staff member removed");
      } catch (error) {
        console.error("Error deleting staff:", error);
        alert("Failed to delete staff member");
      }
    }
  };

  // Helper function to get role color
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Admin': return 'bg-red-500/20 text-red-500';
      case 'Manager': return 'bg-blue-500/20 text-blue-500';
      default: return 'bg-green-500/20 text-green-500';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2"><Shield className="text-primary"/> Admin Console</h2>
        <div className="flex gap-2 bg-surface p-1 rounded-lg border border-border">
          <button onClick={() => setActiveTab('staff')} className={`px-4 py-1.5 rounded-md text-sm font-medium ${activeTab === 'staff' ? 'bg-primary text-white' : 'text-gray-400'}`}>Staff List</button>
          <button onClick={() => setActiveTab('create')} className={`px-4 py-1.5 rounded-md text-sm font-medium ${activeTab === 'create' ? 'bg-primary text-white' : 'text-gray-400'}`}>Add User</button>
        </div>
      </div>

      {/* STAFF LIST */}
      {activeTab === 'staff' && (
        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-white/5 text-gray-400 border-b border-border">
              <tr>
                <th className="p-4 text-xs">NAME</th>
                <th className="p-4 text-xs">JOB TITLE</th>
                <th className="p-4 text-xs">ACCESS</th>
                <th className="p-4 text-xs text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {staff.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-500">
                    No staff members found. Add one to get started.
                  </td>
                </tr>
              ) : (
                staff.map(u => (
                  <tr key={u.id} className="hover:bg-white/5">
                    <td className="p-4 font-medium text-gray-200">
                      {u.full_name}
                      <div className="text-xs text-gray-500">{u.email}</div>
                    </td>
                    <td className="p-4 text-sm text-white">{u.job_title}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${getRoleColor(u.access_level)}`}>
                        {u.access_level}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => handleDeleteStaff(u.id, u.full_name)} 
                        className="text-red-500 hover:bg-red-500/10 p-2 rounded"
                      >
                        <Trash2 size={16}/>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* CREATE USER */}
      {activeTab === 'create' && (
        <div className="max-w-xl mx-auto bg-surface border border-border rounded-xl p-8">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><UserPlus className="text-primary"/> Create User</h3>
          <form onSubmit={handleCreateUser} className="space-y-4">
            <div><label className="text-xs text-gray-400 font-bold">Full Name</label><input required value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} className="w-full bg-background border border-border rounded p-2 text-white mt-1" /></div>
            <div><label className="text-xs text-gray-400 font-bold">Email</label><input required type="email" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} className="w-full bg-background border border-border rounded p-2 text-white mt-1" /></div>
            <div><label className="text-xs text-gray-400 font-bold">Password</label><input required type="password" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} className="w-full bg-background border border-border rounded p-2 text-white mt-1" /></div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-400 font-bold">Job Title (Role)</label>
                <input required placeholder="e.g. Developer" value={newUser.job_title} onChange={e => setNewUser({...newUser, job_title: e.target.value})} className="w-full bg-background border border-border rounded p-2 text-white mt-1" />
              </div>
              <div>
                <label className="text-xs text-gray-400 font-bold">Access Level</label>
                <select value={newUser.access_level} onChange={e => setNewUser({...newUser, access_level: e.target.value})} className="w-full bg-background border border-border rounded p-2 text-white mt-1">
                  <option value="Staff">Staff (Can View/Submit)</option>
                  <option value="Manager">Manager (Can Assign/Approve)</option>
                  <option value="Admin">Admin (Full Control)</option>
                </select>
              </div>
            </div>

            <Button className="w-full mt-4">Create User</Button>
          </form>
        </div>
      )}
    </div>
  );
}
