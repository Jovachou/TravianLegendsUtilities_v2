
import React, { useState } from 'react';
import { UserVillage } from '../types';
import { Home, Plus, Trash2, Save, Cloud, LogOut, Map, Info, Download, Upload } from 'lucide-react';

interface ProfileManagerProps {
  isLoggedIn: boolean;
  onLogin: () => void;
  onLogout: () => void;
  villages: UserVillage[];
  setVillages: React.Dispatch<React.SetStateAction<UserVillage[]>>;
}

export const ProfileManager: React.FC<ProfileManagerProps> = ({ isLoggedIn, onLogin, onLogout, villages, setVillages }) => {
  const [newVillage, setNewVillage] = useState({ name: '', x: '', y: '' });

  const addVillage = () => {
    if (newVillage.name && newVillage.x !== '' && newVillage.y !== '') {
      setVillages([...villages, {
        id: Math.random().toString(36).substr(2, 9),
        name: newVillage.name,
        x: Number(newVillage.x),
        y: Number(newVillage.y)
      }]);
      setNewVillage({ name: '', x: '', y: '' });
    }
  };

  const removeVillage = (id: string) => {
    setVillages(villages.filter(v => v.id !== id));
  };

  const exportVillages = () => {
    const data = JSON.stringify(villages, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `villages_export_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importVillages = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.Clarify;
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (re) => {
          try {
            const imported = JSON.parse(re.target?.result as string);
            if (Array.isArray(imported)) {
              setVillages([...villages, ...imported.map(v => ({ ...v, id: Math.random().toString(36).substr(2, 9) }))]);
              alert("Villages imported successfully!");
            }
          } catch (err) {
            alert("Failed to import. Invalid JSON format.");
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  if (!isLoggedIn) {
    return (
      <div className="max-w-md mx-auto mt-12 space-y-8 animate-in slide-in-from-bottom-4 duration-500">
        <div className="text-center">
          <div className="inline-flex items-center justify-center p-4 bg-amber-500/10 rounded-full border border-amber-500/20 mb-4">
            <Cloud className="w-12 h-12 text-amber-500" />
          </div>
          <h2 className="text-3xl font-black text-white uppercase tracking-tight">Sync Your Empire</h2>
          <p className="text-slate-400 mt-2 text-sm leading-relaxed">
            Register for a free account to persist your village database across multiple devices and never lose your coordinates again.
          </p>
        </div>

        <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-2xl space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Email Address</label>
              <input type="email" placeholder="commander@alliance.com" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-sm focus:border-amber-500/50 outline-none" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Password</label>
              <input type="password" placeholder="••••••••" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-sm focus:border-amber-500/50 outline-none" />
            </div>
          </div>
          <button 
            onClick={onLogin}
            className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black uppercase text-sm rounded-xl shadow-lg transition-all active:scale-95"
          >
            Create Account & Login
          </button>
          <div className="text-center">
            <button className="text-[10px] text-slate-600 font-bold uppercase tracking-widest hover:text-amber-500 transition-colors">Already have an account? Sign In</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3">
            <Home className="text-amber-500 w-8 h-8" />
            My Villages
          </h2>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">Manage your active sector coordinates</p>
        </div>
        <button 
          onClick={onLogout}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-red-500/20 text-slate-400 hover:text-red-500 border border-slate-800 hover:border-red-500/50 rounded-lg transition-all text-xs font-bold uppercase"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
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
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">X Coordinate</label>
                  <input 
                    type="number" 
                    value={newVillage.x}
                    onChange={e => setNewVillage({...newVillage, x: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm font-mono text-slate-300 outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Y Coordinate</label>
                  <input 
                    type="number" 
                    value={newVillage.y}
                    onChange={e => setNewVillage({...newVillage, y: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm font-mono text-slate-300 outline-none" 
                  />
                </div>
              </div>
              <button 
                onClick={addVillage}
                className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold uppercase text-xs rounded-lg transition-all active:scale-95 shadow-lg border border-slate-700"
              >
                Register Village
              </button>
            </div>
          </div>

          <div className="bg-amber-500/5 p-4 rounded-xl border border-amber-500/20 shadow-inner">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-[10px] text-amber-500/80 leading-relaxed font-bold uppercase tracking-tight">
                Villages stored here will appear in the Attack Coordinator dropdowns for rapid coordination.
              </p>
            </div>
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-2xl overflow-hidden">
            <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Database</span>
                <div className="flex gap-2">
                  <button onClick={exportVillages} title="Export to File" className="text-slate-500 hover:text-amber-500 transition-colors"><Download className="w-3.5 h-3.5" /></button>
                  <button onClick={importVillages} title="Import from File" className="text-slate-500 hover:text-amber-500 transition-colors"><Upload className="w-3.5 h-3.5" /></button>
                </div>
              </div>
              <span className="text-[10px] font-black text-amber-500 uppercase">{villages.length} Registered</span>
            </div>
            
            <div className="divide-y divide-slate-800 max-h-[500px] overflow-y-auto custom-scrollbar">
              {villages.length === 0 ? (
                <div className="p-12 text-center text-slate-700 italic text-sm">No villages registered in the sector...</div>
              ) : villages.map((v) => (
                <div key={v.id} className="p-4 flex items-center justify-between hover:bg-slate-800/40 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center text-amber-500 group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
                      <Map className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{v.name}</h4>
                      <div className="flex gap-2 mt-0.5">
                        <span className="text-[10px] font-mono text-slate-500 uppercase">Coord:</span>
                        <span className="text-[10px] font-mono text-amber-500 font-bold">({v.x} | {v.y})</span>
                      </div>
                    </div>
                  </div>
                  <button 
                    // Fix: Fixed "Cannot find name 'id'" by using v.id from map context
                    onClick={() => removeVillage(v.id)}
                    className="p-2 text-slate-700 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
