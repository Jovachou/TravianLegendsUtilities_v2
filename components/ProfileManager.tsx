
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { UserVillage } from '../types';
import { Home, Plus, Trash2, Map, Users, Activity, Loader2, Shield } from 'lucide-react';

interface ProfileManagerProps {
  villages: UserVillage[];
  refreshVillages: () => Promise<void>;
}

interface RegisteredUser {
  id: string;
  display_name: string;
  email: string;
  updated_at: string;
}

export const ProfileManager: React.FC<ProfileManagerProps> = ({ villages, refreshVillages }) => {
  const [newVillage, setNewVillage] = useState({ name: '', x: '', y: '', ts_level: 0 });
  const [isAdding, setIsAdding] = useState(false);
  const [users, setUsers] = useState<RegisteredUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [showRegistry, setShowRegistry] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (showRegistry) {
      fetchUsers();
    }
  }, [showRegistry]);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('updated_at', { ascending: false });
      
      if (!error && data) {
        setUsers(data);
      }
    } catch (e) {
      console.log("Registry could not be loaded.");
    } finally {
      setLoadingUsers(false);
    }
  };

  const addVillage = async () => {
    if (newVillage.name && newVillage.x !== '' && newVillage.y !== '') {
      setIsAdding(true);
      const { error } = await supabase
        .from('villages')
        .insert([{
          name: newVillage.name,
          x: Number(newVillage.x),
          y: Number(newVillage.y),
          ts_level: newVillage.ts_level
        }]);
      
      if (!error) {
        setNewVillage({ name: '', x: '', y: '', ts_level: 0 });
        await refreshVillages();
      } else {
        alert("Operation Failed: " + error.message);
      }
      setIsAdding(false);
    }
  };

  const updateTsLevel = async (id: string, newLevel: number) => {
    setUpdatingId(id);
    const { error } = await supabase
      .from('villages')
      .update({ ts_level: newLevel })
      .eq('id', id);
    
    if (!error) {
      await refreshVillages();
    }
    setUpdatingId(null);
  };

  const removeVillage = async (id: string) => {
    if (confirm("Retire this village from tactical duty?")) {
      const { error } = await supabase
        .from('villages')
        .delete()
        .eq('id', id);
      
      if (!error) {
        await refreshVillages();
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-500 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3">
            <Home className="text-amber-500 w-8 h-8" />
            My Villages
          </h2>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">Cloud-synced tactical sectors</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-xs font-black text-amber-500 uppercase tracking-widest flex items-center gap-2">
              <Plus className="w-4 h-4" /> Add Village
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Village Name</label>
                <input 
                  type="text" 
                  value={newVillage.name}
                  onChange={e => setNewVillage({...newVillage, name: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-white focus:border-amber-500/50 outline-none" 
                  placeholder="e.g. 15c Capital"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">X Coord</label>
                  <input 
                    type="number" 
                    value={newVillage.x}
                    onChange={e => setNewVillage({...newVillage, x: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm font-mono text-slate-300 outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Y Coord</label>
                  <input 
                    type="number" 
                    value={newVillage.y}
                    onChange={e => setNewVillage({...newVillage, y: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm font-mono text-slate-300 outline-none" 
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">TS Level</label>
                  <span className="text-amber-500 font-mono text-xs">{newVillage.ts_level}</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="20" 
                  value={newVillage.ts_level} 
                  onChange={e => setNewVillage({...newVillage, ts_level: Number(e.target.value)})}
                  className="w-full accent-amber-500"
                />
              </div>
              <button 
                onClick={addVillage}
                disabled={isAdding}
                className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold uppercase text-xs rounded-lg transition-all active:scale-95 shadow-lg border border-slate-700 flex items-center justify-center gap-2"
              >
                {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Register Village'}
              </button>
            </div>
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-2xl overflow-hidden">
            <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex justify-between items-center">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Database</span>
              <span className="text-[10px] font-black text-amber-500 uppercase">{villages.length} Registered</span>
            </div>
            
            <div className="divide-y divide-slate-800 max-h-[500px] overflow-y-auto custom-scrollbar">
              {villages.length === 0 ? (
                <div className="p-12 text-center text-slate-700 italic text-sm">No villages registered...</div>
              ) : villages.map((v) => (
                <div key={v.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-slate-800/40 transition-colors group gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center text-amber-500 group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
                      <Map className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white uppercase tracking-tight">{v.name}</h4>
                      <div className="flex gap-2 mt-0.5">
                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">({v.x} | {v.y})</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="flex flex-col gap-1 min-w-[120px]">
                      <div className="flex justify-between items-center">
                        <span className="text-[8px] font-black text-slate-600 uppercase">TS Level</span>
                        <span className={`text-[10px] font-mono font-bold ${updatingId === v.id ? 'text-amber-500 animate-pulse' : 'text-slate-400'}`}>Lvl {v.ts_level}</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="20" 
                        value={v.ts_level}
                        onChange={(e) => updateTsLevel(v.id, Number(e.target.value))}
                        className="accent-amber-500 h-1 bg-slate-950 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                    <button 
                      onClick={() => removeVillage(v.id)}
                      className="p-2 text-slate-700 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="pt-8 border-t border-slate-900">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
             <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                <Users className="w-5 h-5 text-slate-400" />
             </div>
             <h3 className="text-lg font-bold text-white uppercase tracking-tight">Commander Registry</h3>
          </div>
          <button 
            onClick={() => setShowRegistry(!showRegistry)}
            className="text-[10px] font-black uppercase text-amber-500 hover:text-amber-400 tracking-widest transition-colors flex items-center gap-2"
          >
            {showRegistry ? 'Hide Registry' : 'Reveal Registry'}
            <Activity className={`w-3 h-3 ${loadingUsers ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {showRegistry && (
          <div className="bg-slate-900/50 rounded-xl border border-slate-800 overflow-hidden animate-in slide-in-from-top-2 duration-300 shadow-2xl">
            {loadingUsers ? (
              <div className="p-12 flex justify-center">
                <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
              </div>
            ) : users.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-600 italic">No other registered users detected.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-950 border-b border-slate-800 text-[9px] font-black text-slate-600 uppercase tracking-widest">
                      <th className="px-6 py-3">Commander</th>
                      <th className="px-6 py-3">Email Address</th>
                      <th className="px-6 py-3 text-right">Registered On</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {users.map(u => (
                      <tr key={u.id} className="hover:bg-slate-800/20 transition-colors">
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-2">
                             <Shield className="w-3 h-3 text-amber-500/50" />
                             <span className="text-xs font-bold text-slate-300 uppercase tracking-tight">{u.display_name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-3">
                          <span className="text-[10px] font-mono text-slate-600">{u.email}</span>
                        </td>
                        <td className="px-6 py-3 text-right">
                          <div className="flex flex-col items-end">
                             <span className="text-[10px] text-slate-500 font-mono">{new Date(u.updated_at).toLocaleDateString()}</span>
                             <span className="text-[8px] text-slate-700 font-bold uppercase">{new Date(u.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
