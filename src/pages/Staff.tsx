import { useStaff } from "@/hooks/useData";
import { Shield } from "lucide-react";

export default function Staff() {
  const { staff } = useStaff();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Staff Directory</h2>
      <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-lg">
        <table className="w-full text-left">
          <thead className="bg-white/5 text-gray-400 border-b border-border">
            <tr><th className="p-4 text-xs uppercase">Name</th><th className="p-4 text-xs uppercase">Job Title</th><th className="p-4 text-xs uppercase">Access</th></tr>
          </thead>
          <tbody className="divide-y divide-border">
            {staff.map((s) => (
              <tr key={s.id} className="hover:bg-white/5 transition-colors">
                <td className="p-4 flex items-center gap-3">
                  <img src={s.avatar_url} className="h-10 w-10 rounded-full border border-border" />
                  <div><p className="font-bold text-white">{s.full_name}</p><p className="text-xs text-gray-500">{s.email}</p></div>
                </td>
                <td className="p-4 text-sm text-white font-medium">{s.job_title}</td>
                <td className="p-4 text-sm text-gray-300">
                  <span className={`flex items-center gap-2 px-2 py-1 rounded text-xs font-bold text-white ${s.roleColor}`}>
                    <Shield size={14}/> {s.access_level}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
