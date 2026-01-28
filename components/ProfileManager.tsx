
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { UserVillage } from '../types';
import { Home, Plus, Trash2, Map, Users, Activity, Loader2, Shield, Sword, Hammer, Castle } from 'lucide-react';

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
  const [newVillage, setNewVillage] = useState({ 
    name: '', x: '', y: '', ts_level: 0, 
    barracks_level: 0, gb_level: 0, 
    stable_level: 0, gs_level: 0, 
    workshop_level: 0 
  });
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
          ts_level: newVillage.ts_level,
          barracks_level: newVillage.barracks_level,
          gb_level: newVillage.gb_level,
          stable_level: newVillage.stable_level,
          gs_level: newVillage.gs_level,
          workshop_level: newVillage.workshop_level
        }]);
      
      if (!error) {
        setNewVillage({ 
          name: '', x: '', y: '', ts_level: 0, 
          barracks_level: 0, gb_level: 0, 
          stable_level: 0, gs_level: 0, 
          workshop_level: 0 
        });
        await refreshVillages();
      } else {
        alert("Operation Failed: " + error.message);
      }
      setIsAdding(false);
    }
  };

  const updateVillageStat = async (id: string, field: keyof UserVillage, value: number) => {
    setUpdatingId(`${id}-${field}`);
    const { error } = await supabase
      .from('villages')
      .update({ [field]: value })
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

  const BuildingSlider = ({ label, value, onChange, icon: Icon, isUpdating }: any) => (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <label className="text-[9px] font-bold text-slate-500 uppercase tracking-tight flex items-center gap-1">
          {Icon && <Icon className={`w-2.5 h-2.5 ${isUpdating ? 'animate-pulse text-amber-500' : 'text-slate-600'}`} />}
          {label}
        </label>
        <span className={`text-[10px] font-mono font-bold ${isUpdating ? 'text-amber-500' : 'text-slate-400'}`}>Lvl {value}</span>
      </div>
      <input 
        type="range" 
        min="0" 
        max="20" 
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-amber-500 h-1 bg-slate-950 rounded-lg appearance-none cursor-pointer"
      />
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-500 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3">
            <Home className="text-amber-500 w-8 h-8" />
            My Villages
          </h2>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">Cloud-synced tactical sectors</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-xl space-y-4 sticky top-24">
            <h3 className="text-xs font-black text-amber-500 uppercase tracking-widest flex items-center gap-2">
              <Plus className="w-4 h-4" /> Add Village
            </h3>
            <div className="space-y-4">
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
              
              <div className="pt-2 border-t border-slate-800 space-y-3">
                <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest block">Infrastructure</span>
                <BuildingSlider label="Tourn. Square" value={newVillage.ts_level} onChange={(v: number) => setNewVillage({...newVillage, ts_level: v})} icon={Castle} />
                <BuildingSlider label="Barracks" value={newVillage.barracks_level} onChange={(v: number) => setNewVillage({...newVillage, barracks_level: v})} icon={Sword} />
                <BuildingSlider label="Gt. Barracks" value={newVillage.gb_level} onChange={(v: number) => setNewVillage({...newVillage, gb_level: v})} icon={Sword} />
                <BuildingSlider label="Stable" value={newVillage.stable_level} onChange={(v: number) => setNewVillage({...newVillage, stable_level: v})} icon={Activity} />
                <BuildingSlider label="Gt. Stable" value={newVillage.gs_level} onChange={(v: number) => setNewVillage({...newVillage, gs_level: v})} icon={Activity} />
                <BuildingSlider label="Workshop" value={newVillage.workshop_level} onChange={(v: number) => setNewVillage({...newVillage, workshop_level: v})} icon={Hammer} />
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

        <div className="lg:col-span-3 space-y-4">
          <div className="bg-slate-950 px-6 py-4 rounded-xl border border-slate-800 flex justify-between items-center">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Tactical Database</span>
            <span className="text-[10px] font-black text-amber-500 uppercase">{villages.length} Villages Tracked</span>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {villages.length === 0 ? (
              <div className="col-span-full p-20 text-center text-slate-700 italic text-sm bg-slate-900 rounded-xl border border-slate-800">No villages registered...</div>
            ) : villages.map((v) => (
              <div key={v.id} className="bg-slate-900 rounded-xl border border-slate-800 shadow-xl flex flex-col hover:border-slate-700 transition-colors group">
                <div className="p-5 border-b border-slate-800 flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center text-amber-500 group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
                      <Map className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-white uppercase tracking-tight">{v.name}</h4>
                      <div className="flex gap-2 mt-0.5">
                        <span className="text-[10px] font-mono text-amber-500/70 font-bold uppercase tracking-widest">({v.x} | {v.y})</span>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => removeVillage(v.id)}
                    className="p-2 text-slate-700 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-5 grid grid-cols-2 gap-x-8 gap-y-6">
                  <div className="space-y-4">
                    <BuildingSlider 
                      label="Tourn. Square" 
                      value={v.ts_level} 
                      onChange={(val: number) => updateVillageStat(v.id, 'ts_level', val)} 
                      icon={Castle}
                      isUpdating={updatingId === `${v.id}-ts_level`}
                    />
                    <BuildingSlider 
                      label="Barracks" 
                      value={v.barracks_level} 
                      onChange={(val: number) => updateVillageStat(v.id, 'barracks_level', val)} 
                      icon={Sword}
                      isUpdating={updatingId === `${v.id}-barracks_level`}
                    />
                    <BuildingSlider 
                      label="Gt. Barracks" 
                      value={v.gb_level} 
                      onChange={(val: number) => updateVillageStat(v.id, 'gb_level', val)} 
                      icon={Sword}
                      isUpdating={updatingId === `${v.id}-gb_level`}
                    />
                  </div>
                  <div className="space-y-4">
                    <BuildingSlider 
                      label="Stable" 
                      value={v.stable_level} 
                      onChange={(val: number) => updateVillageStat(v.id, 'stable_level', val)} 
                      icon={Activity}
                      isUpdating={updatingId === `${v.id}-stable_level`}
                    />
                    <BuildingSlider 
                      label="Gt. Stable" 
                      value={v.gs_level} 
                      onChange={(val: number) => updateVillageStat(v.id, 'gs_level', val)} 
                      icon={Activity}
                      isUpdating={updatingId === `${v.id}-gs_level`}
                    />
                    <BuildingSlider 
                      label="Workshop" 
                      value={v.workshop_level} 
                      onChange={(val: number) => updateVillageStat(v.id, 'workshop_level', val)} 
                      icon={Hammer}
                      isUpdating={updatingId === `${v.id}-workshop_level`}
                    />
                  </div>
                </div>
              </div>
            ))}
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
