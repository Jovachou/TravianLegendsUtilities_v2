
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Users, Shield, Map, Activity, Calendar, Loader2 } from 'lucide-react';

interface AllianceMember {
  id: string;
  display_name: string;
  email: string;
  updated_at: string;
  village_count?: number;
}

export const AllianceList: React.FC = () => {
  const [members, setMembers] = useState<AllianceMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlliance();
  }, []);

  const fetchAlliance = async () => {
    setLoading(true);
    try {
      // 1. Fetch profiles
      const { data: profiles, error: pError } = await supabase
        .from('profiles')
        .select('*')
        .order('display_name');

      if (pError) throw pError;

      // 2. Fetch village counts per user (simulating an aggregation since simple Supabase calls don't group well without RPC)
      const { data: villages, error: vError } = await supabase
        .from('villages')
        .select('user_id');

      if (vError) throw vError;

      const counts: Record<string, number> = {};
      villages?.forEach(v => {
        counts[v.user_id] = (counts[v.user_id] || 0) + 1;
      });

      const membersWithStats = (profiles || []).map(p => ({
        ...p,
        village_count: counts[p.id] || 0
      }));

      setMembers(membersWithStats);
    } catch (err: any) {
      console.error("Alliance load failed:", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-amber-500 shadow-inner">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight uppercase">Tactical Alliance Network</h2>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Registry of all authorized commanders</p>
          </div>
        </div>
        <div className="flex gap-4">
           <div className="bg-slate-950 px-4 py-2 rounded-lg border border-slate-800 text-center shadow-inner">
              <span className="block text-[8px] font-black text-slate-600 uppercase tracking-widest">Active Members</span>
              <span className="text-xl font-mono font-bold text-amber-500">{members.length}</span>
           </div>
           <button 
             onClick={fetchAlliance}
             className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg border border-slate-700 transition-all text-xs font-bold uppercase"
           >
             <Activity className="w-4 h-4" /> Refresh Data
           </button>
        </div>
      </div>

      <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-2xl overflow-hidden">
        {loading ? (
          <div className="p-20 flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Accessing Registry...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950 border-b border-slate-800">
                  <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Commander</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Email Contact</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Villages</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Last Tactical Sync</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {members.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-700 italic text-sm">No other commanders detected on the network.</td>
                  </tr>
                ) : (
                  members.map((member) => (
                    <tr key={member.id} className="hover:bg-slate-800/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
                            <Shield className="w-4 h-4" />
                          </div>
                          <span className="text-sm font-bold text-white uppercase tracking-tight">{member.display_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-mono text-slate-500">{member.email}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-950 rounded-full border border-slate-800">
                           <Map className="w-3 h-3 text-amber-500" />
                           <span className="text-xs font-mono font-bold text-slate-300">{member.village_count}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex flex-col items-end gap-1">
                          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                            <Calendar className="w-3 h-3 text-slate-600" />
                            {new Date(member.updated_at).toLocaleDateString()}
                          </div>
                          <div className="text-[10px] text-slate-600 font-bold uppercase">
                            {new Date(member.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="p-4 bg-slate-950/50 rounded-lg border border-slate-800/50 flex items-center gap-4">
        <Activity className="w-5 h-5 text-emerald-500" />
        <p className="text-[10px] text-slate-600 font-bold uppercase tracking-wide leading-relaxed">
          The Alliance Network automatically synchronizes member data. Ensure all commanders register their villages in the "Villages" tab to facilitate coordinated defense operations.
        </p>
      </div>
    </div>
  );
};
