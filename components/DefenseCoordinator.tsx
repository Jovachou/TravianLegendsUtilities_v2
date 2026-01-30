
import React, { useState, useMemo, useEffect } from 'react';
import { TROOP_DATA, TRIBES } from '../data';
import { UserVillage, TribeName } from '../types';
import { Map, Clock, Target, ShieldAlert, ShieldCheck, Globe, Zap, Footprints, Flag } from 'lucide-react';

interface DefenseCoordinatorProps {
  userVillages: UserVillage[];
}

interface VillageSetting {
  tsLevel: number;
  tribe: TribeName;
}

const MAP_SIZE = 401;

export const DefenseCoordinator: React.FC<DefenseCoordinatorProps> = ({ userVillages }) => {
  const [now, setNow] = useState(new Date());
  const [targetX, setTargetX] = useState<string>('0');
  const [targetY, setTargetY] = useState<string>('0');
  const [targetTime, setTargetTime] = useState<string>(
    new Date(Date.now() + 3600000).toISOString().slice(0, 19)
  );

  // Tactical gear
  const [standardBonus, setStandardBonus] = useState<number>(0);
  const [bootsBonus, setBootsBonus] = useState<number>(0);

  const [villageSettings, setVillageSettings] = useState<Record<string, VillageSetting>>({});

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setVillageSettings(prev => {
      const next = { ...prev };
      userVillages.forEach(v => {
        if (!next[v.id]) {
          next[v.id] = {
            tsLevel: v.ts_level,
            tribe: 'Romans'
          };
        } else {
          next[v.id].tsLevel = v.ts_level;
        }
      });
      return next;
    });
  }, [userVillages]);

  const updateVillageSetting = (id: string, updates: Partial<VillageSetting>) => {
    setVillageSettings(prev => ({
      ...prev,
      [id]: { ...prev[id], ...updates }
    }));
  };

  const calculateWrappedDistance = (x1: number | string, y1: number | string, x2: number | string, y2: number | string) => {
    const nx1 = Number(x1) || 0;
    const ny1 = Number(y1) || 0;
    const nx2 = Number(x2) || 0;
    const ny2 = Number(y2) || 0;
    let dx = Math.abs(nx1 - nx2);
    let dy = Math.abs(ny1 - ny2);
    if (dx > MAP_SIZE / 2) dx = MAP_SIZE - dx;
    if (dy > MAP_SIZE / 2) dy = MAP_SIZE - dy;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const parseAsUTC = (val: string) => {
    if (!val) return new Date(NaN);
    return new Date(val.endsWith('Z') ? val : val + 'Z');
  };

  const formatSeconds = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h}h ${m}m ${s}s`;
  };

  const results = useMemo(() => {
    const arrivalLimit = parseAsUTC(targetTime);
    if (isNaN(arrivalLimit.getTime())) return [];

    return userVillages.map(v => {
      const setting = villageSettings[v.id] || { tsLevel: v.ts_level, tribe: 'Romans' };
      const tribeUnits = TROOP_DATA.filter(u => u.tribe === setting.tribe);
      const distance = calculateWrappedDistance(v.x, v.y, targetX, targetY);
      
      const unitResults = tribeUnits.map(unit => {
        // Effective base speed (Standard applies everywhere)
        const baseSpeed = unit.speed * (1 + (standardBonus / 100));
        
        // After 20 tiles multiplier (Boots stack with TS)
        const after20Mult = 1 + (setting.tsLevel * 0.2) + (bootsBonus / 100);

        let tHours = distance <= 20 
          ? distance / baseSpeed 
          : (20 / baseSpeed) + ((distance - 20) / (baseSpeed * after20Mult));

        const travelTimeSeconds = Math.round(tHours * 3600);
        const launchDate = new Date(arrivalLimit.getTime() - travelTimeSeconds * 1000);
        const isOnTime = launchDate.getTime() > now.getTime();

        return {
          unitName: unit.unit,
          travelTimeSeconds,
          launchDate,
          isOnTime
        };
      });

      const possibleCount = unitResults.filter(ur => ur.isOnTime).length;

      return {
        ...v,
        setting,
        distance: distance.toFixed(2),
        unitResults,
        possibleCount
      };
    }).sort((a, b) => b.possibleCount - a.possibleCount);
  }, [userVillages, villageSettings, targetX, targetY, targetTime, now, standardBonus, bootsBonus]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-2xl">
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-emerald-500 shadow-inner">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight uppercase">Defense Coordinator</h2>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Reinforcement Dispatch & Timing</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 w-full xl:w-auto">
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 shadow-inner">
              <label className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-widest">
                <Target className="w-3 h-3 text-emerald-500" /> Target (X|Y)
              </label>
              <div className="flex gap-2">
                <input type="text" value={targetX} onChange={e => setTargetX(e.target.value)} className="bg-transparent border-none text-slate-100 focus:ring-0 outline-none font-mono text-lg w-full text-center" />
                <span className="text-slate-700">|</span>
                <input type="text" value={targetY} onChange={e => setTargetY(e.target.value)} className="bg-transparent border-none text-slate-100 focus:ring-0 outline-none font-mono text-lg w-full text-center" />
              </div>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 shadow-inner">
              <label className="flex items-center gap-2 text-[10px] font-bold text-emerald-500 uppercase mb-1 tracking-widest">
                <Clock className="w-3 h-3" /> Reinforce Before
              </label>
              <input type="datetime-local" step="1" value={targetTime} onChange={(e) => setTargetTime(e.target.value)} className="bg-transparent border-none text-slate-100 focus:ring-0 outline-none font-mono text-lg w-full" />
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 shadow-inner">
              <label className="flex items-center gap-2 text-[10px] font-bold text-emerald-500 uppercase mb-1 tracking-widest">
                <Flag className="w-3 h-3" /> Standard
              </label>
              <select 
                value={standardBonus} 
                onChange={(e) => setStandardBonus(Number(e.target.value))}
                className="bg-transparent border-none text-slate-100 focus:ring-0 outline-none font-mono text-sm w-full font-bold"
              >
                <option value="0" className="bg-slate-900">None</option>
                <option value="15" className="bg-slate-900">Small Standard (+15%)</option>
                <option value="20" className="bg-slate-900">Medium Standard (+20%)</option>
                <option value="25" className="bg-slate-900">Great Standard (+25%)</option>
              </select>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 shadow-inner">
              <label className="flex items-center gap-2 text-[10px] font-bold text-emerald-500 uppercase mb-1 tracking-widest">
                <Footprints className="w-3 h-3" /> Hero Boots
              </label>
              <select 
                value={bootsBonus} 
                onChange={(e) => setBootsBonus(Number(e.target.value))}
                className="bg-transparent border-none text-slate-100 focus:ring-0 outline-none font-mono text-sm w-full font-bold"
              >
                <option value="0" className="bg-slate-900">None</option>
                <option value="25" className="bg-slate-900">Mercenary Boots (+25%)</option>
                <option value="50" className="bg-slate-900">Warrior Boots (+50%)</option>
                <option value="75" className="bg-slate-900">Archon Boots (+75%)</option>
              </select>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 shadow-inner flex flex-col justify-center">
              <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-widest">Server Time</label>
              <div className="text-lg font-mono font-bold text-slate-300">{now.toISOString().slice(11, 19)}</div>
            </div>
          </div>
        </div>
      </div>

      {userVillages.length === 0 ? (
        <div className="bg-slate-900 p-12 rounded-xl border border-slate-800 text-center space-y-4">
          <Globe className="w-8 h-8 text-slate-700 mx-auto" />
          <p className="text-slate-400 font-medium">No villages registered. Initialize your empire in the <span className="text-amber-500 font-bold uppercase tracking-tighter">Villages</span> tab.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
          {results.map(v => (
            <div key={v.id} className={`bg-slate-900 rounded-xl border-2 transition-all overflow-hidden shadow-lg ${v.possibleCount > 0 ? 'border-emerald-500/20' : 'border-rose-900/40'}`}>
              <div className={`p-4 border-b flex justify-between items-center ${v.possibleCount > 0 ? 'bg-emerald-500/5 border-emerald-500/10' : 'bg-rose-500/5 border-rose-500/10'}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded flex items-center justify-center ${v.possibleCount > 0 ? 'bg-emerald-500 text-slate-950' : 'bg-rose-600 text-white'}`}>
                    {v.possibleCount > 0 ? <ShieldCheck className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">{v.name}</h3>
                    <div className="flex items-center gap-2">
                       <span className="text-[10px] font-mono text-slate-500">({v.x} | {v.y})</span>
                       <span className="text-[9px] text-slate-600 font-bold uppercase">{v.distance} Leag.</span>
                    </div>
                  </div>
                </div>
                <div className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full ${v.possibleCount > 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                  {v.possibleCount} Possible
                </div>
              </div>

              <div className="p-5 space-y-4">
                <div className="flex items-end gap-4">
                  <div className="flex-grow space-y-1">
                    <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Tribe Dispatch</label>
                    <select value={v.setting.tribe} onChange={e => updateVillageSetting(v.id, { tribe: e.target.value as TribeName })} className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-xs text-amber-500 font-bold outline-none">
                      {TRIBES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="flex-grow space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">TS Level: <span className="text-amber-500">{v.setting.tsLevel}</span></label>
                    </div>
                    <input type="range" min="0" max="20" value={v.setting.tsLevel} onChange={e => updateVillageSetting(v.id, { tsLevel: Number(e.target.value) })} className="w-full accent-amber-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer" />
                  </div>
                </div>

                <div className="bg-slate-950 rounded-lg border border-slate-800 overflow-hidden">
                   <div className="grid grid-cols-12 bg-slate-900/50 px-3 py-1.5 border-b border-slate-800 text-[8px] font-black text-slate-500 uppercase tracking-tighter">
                      <div className="col-span-4">Unit</div>
                      <div className="col-span-4 text-center">Travel</div>
                      <div className="col-span-4 text-right">Latest Launch</div>
                   </div>
                   <div className="divide-y divide-slate-800/40 max-h-[200px] overflow-y-auto custom-scrollbar">
                      {v.unitResults.map((ur, idx) => (
                        <div key={idx} className={`grid grid-cols-12 px-3 py-2 items-center hover:bg-slate-900/40 transition-colors ${ur.isOnTime ? 'bg-emerald-500/5' : 'bg-rose-500/5'}`}>
                           <div className={`col-span-4 text-[10px] font-bold truncate ${ur.isOnTime ? 'text-emerald-500' : 'text-red-500'}`}>{ur.unitName}</div>
                           <div className="col-span-4 text-[9px] font-mono text-slate-500 text-center">{formatSeconds(ur.travelTimeSeconds)}</div>
                           <div className={`col-span-4 text-[11px] font-mono font-black text-right ${ur.isOnTime ? 'text-emerald-500' : 'text-red-500'}`}>{ur.launchDate.toISOString().slice(11, 19)}</div>
                        </div>
                      ))}
                   </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
