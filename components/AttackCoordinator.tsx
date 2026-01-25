
import React, { useState, useMemo, useEffect } from 'react';
import { TROOP_DATA, TRIBES } from '../data';
import { TribeName, UserVillage } from '../types';
import { Map, Clock, Target, Plus, Trash2, ListOrdered, Save, Upload, Zap, Globe, RefreshCw, Layers, Sword, Share2, ExternalLink } from 'lucide-react';

interface AttackMission {
  id: string;
  label: string;
  tribe: TribeName;
  unitName: string;
  tsLevel: number;
  startX: number | string;
  startY: number | string;
  endX: number | string;
  endY: number | string;
}

interface AttackCoordinatorProps {
  userVillages: UserVillage[];
}

type GroupByOption = 'none' | 'target' | 'time';

const MAP_SIZE = 401;

export const AttackCoordinator: React.FC<AttackCoordinatorProps> = ({ userVillages }) => {
  const [now, setNow] = useState(new Date());
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isCalculating, setIsCalculating] = useState(false);
  const [lastCalculated, setLastCalculated] = useState<string | null>(null);
  const [groupBy, setGroupBy] = useState<GroupByOption>('none');

  const [targetTime, setTargetTime] = useState<string>(
    new Date(Date.now() + 3600000).toISOString().slice(0, 19)
  );
  
  const [missions, setMissions] = useState<AttackMission[]>([
    {
      id: Math.random().toString(36).substr(2, 9),
      label: 'Main Siege Wave',
      tribe: 'Romans',
      unitName: 'Fire Catapult',
      tsLevel: 0,
      startX: 0,
      startY: 0,
      endX: 0,
      endY: 0
    }
  ]);

  // Load from URL hash on mount
  useEffect(() => {
    const hash = window.location.hash.substring(1);
    if (hash && hash.startsWith('plan=')) {
      try {
        const encodedData = hash.replace('plan=', '');
        const decodedData = JSON.parse(atob(encodedData));
        if (decodedData.missions && decodedData.targetTime) {
          setMissions(decodedData.missions);
          setTargetTime(decodedData.targetTime);
          setLastCalculated("Imported from Link");
        }
      } catch (e) {
        console.error("Failed to parse shared plan", e);
      }
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const parseAsUTC = (val: string) => {
    if (!val) return new Date(NaN);
    return new Date(val.endsWith('Z') ? val : val + 'Z');
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

  const handleRecalculate = () => {
    setIsCalculating(true);
    setTimeout(() => {
      setRefreshTrigger(prev => prev + 1);
      setLastCalculated(new Date().toLocaleTimeString());
      setIsCalculating(false);
    }, 300);
  };

  const addMission = () => {
    const lastMission = missions[missions.length - 1];
    setMissions([
      ...missions,
      {
        id: Math.random().toString(36).substr(2, 9),
        label: `Brigade ${missions.length + 1}`,
        tribe: lastMission?.tribe || 'Romans',
        unitName: lastMission?.unitName || 'Legionnaire',
        tsLevel: lastMission?.tsLevel || 0,
        startX: lastMission?.startX ?? 0,
        startY: lastMission?.startY ?? 0,
        endX: lastMission?.endX ?? 0,
        endY: lastMission?.endY ?? 0
      }
    ]);
  };

  const removeMission = (id: string) => {
    if (missions.length > 1) {
      setMissions(missions.filter(m => m.id !== id));
    }
  };

  const updateMission = (id: string, updates: Partial<AttackMission>) => {
    setMissions(missions.map(m => m.id === id ? { ...m, ...updates } : m));
  };

  const handleCoordChange = (id: string, field: keyof AttackMission, value: string) => {
    if (value === '' || value === '-' || /^-?\d*$/.test(value)) {
      updateMission(id, { [field]: value });
    }
  };

  const selectUserVillage = (missionId: string, villageId: string) => {
    const village = userVillages.find(v => v.id === villageId);
    if (village) {
      updateMission(missionId, { startX: village.x, startY: village.y });
    }
  };

  const handleSave = () => {
    localStorage.setItem('travian_attack_plan', JSON.stringify({ missions, targetTime }));
    alert('Orders Saved to Archives.');
  };

  const handleLoad = () => {
    const saved = localStorage.getItem('travian_attack_plan');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setMissions(parsed.missions);
        setTargetTime(parsed.targetTime);
        handleRecalculate();
      } catch (e) {
        console.error("Recall failed", e);
      }
    }
  };

  const handleShareLink = () => {
    const data = JSON.stringify({ missions, targetTime });
    const encoded = btoa(data);
    const url = new URL(window.location.href);
    url.hash = `plan=${encoded}`;
    
    navigator.clipboard.writeText(url.toString()).then(() => {
      alert("Shareable Link copied to clipboard! Teammates opening this link will see your current plan.");
    });
  };

  const calculatedMissions = useMemo(() => {
    const arrivalDate = parseAsUTC(targetTime);
    if (isNaN(arrivalDate.getTime())) return [];
    
    const _ = refreshTrigger;

    return missions.map(m => {
      const unit = TROOP_DATA.find(u => u.unit === m.unitName && u.tribe === m.tribe) || 
                   TROOP_DATA.find(u => u.tribe === m.tribe)!;
      
      const distance = calculateWrappedDistance(m.startX, m.startY, m.endX, m.endY);
      
      let tHours = distance <= 20 
        ? distance / unit.speed 
        : (20 / unit.speed) + ((distance - 20) / (unit.speed * (1 + m.tsLevel * 0.2)));

      const travelTimeSeconds = Math.round(tHours * 3600);
      const launchDate = new Date(arrivalDate.getTime() - travelTimeSeconds * 1000);

      return {
        ...m,
        unit,
        distance: distance.toFixed(2),
        travelTimeSeconds,
        launchDate
      };
    }).sort((a, b) => a.launchDate.getTime() - b.launchDate.getTime());
  }, [missions, targetTime, refreshTrigger]);

  const groupedMissions = useMemo(() => {
    if (groupBy === 'none') return [{ key: 'all', label: null, items: calculatedMissions }];

    const groups: Record<string, { label: string; items: any[] }> = {};

    calculatedMissions.forEach(m => {
      let key = '';
      let label = '';

      if (groupBy === 'target') {
        key = `${m.endX}|${m.endY}`;
        label = `Target: ${key}`;
      } else if (groupBy === 'time') {
        const dateStr = m.launchDate.toISOString();
        key = dateStr.slice(0, 13);
        label = `Hour ${m.launchDate.getUTCHours()}:00`;
      }

      if (!groups[key]) {
        groups[key] = { label, items: [] };
      }
      groups[key].items.push(m);
    });

    return Object.entries(groups).map(([key, value]) => ({
      key,
      ...value
    })).sort((a, b) => a.items[0].launchDate.getTime() - b.items[0].launchDate.getTime());
  }, [calculatedMissions, groupBy]);

  const formatSeconds = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h}h ${m}m ${s}s`;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-2xl">
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-amber-500 shadow-inner">
              <Sword className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight uppercase">Attack Coordinator</h2>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Toroidal Matrix Enabled</span>
                {lastCalculated && (
                  <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded">
                    Sync: {lastCalculated}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full xl:w-auto">
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 shadow-inner">
              <label className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-widest">
                <Clock className="w-3 h-3 text-amber-500" /> Current
              </label>
              <div className="text-lg font-mono font-bold text-slate-300">
                {now.toISOString().slice(11, 19)}
              </div>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 shadow-inner">
              <label className="flex items-center gap-2 text-[10px] font-bold text-amber-500 uppercase mb-1 tracking-widest">
                <Globe className="w-3 h-3" /> Target Landing
              </label>
              <input 
                type="datetime-local" 
                step="1"
                value={targetTime} 
                onChange={(e) => setTargetTime(e.target.value)}
                className="bg-transparent border-none text-slate-100 focus:ring-0 outline-none font-mono text-lg w-full"
              />
            </div>

            <div className="flex gap-2">
              <button 
                onClick={handleRecalculate} 
                disabled={isCalculating}
                className="flex-grow flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 disabled:bg-slate-800 text-slate-950 px-4 rounded-lg font-bold uppercase text-xs shadow-lg active:scale-95 transition-all"
              >
                <RefreshCw className={`w-4 h-4 ${isCalculating ? 'animate-spin' : ''}`} />
                Recalculate
              </button>
              <div className="flex gap-1">
                <button onClick={handleSave} title="Save to local storage" className="p-3 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 transition-colors shadow-md"><Save className="w-5 h-5" /></button>
                <button onClick={handleLoad} title="Load from local storage" className="p-3 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 transition-colors shadow-md"><Upload className="w-5 h-5" /></button>
                <button onClick={handleShareLink} title="Generate Shareable URL" className="p-3 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 rounded-lg text-amber-500 transition-colors shadow-md"><Share2 className="w-5 h-5" /></button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-bold flex items-center gap-2 text-white uppercase"><Target className="w-5 h-5 text-amber-500" /> Mission Orders</h3>
            <button onClick={addMission} className="flex items-center gap-2 px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg border border-slate-700 transition-all text-xs font-bold uppercase active:scale-95"><Plus className="w-4 h-4" /> Add Mission</button>
          </div>

          <div className="space-y-4 max-h-[800px] overflow-y-auto pr-2 custom-scrollbar">
            {missions.map((m) => (
              <div key={m.id} className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-lg relative group hover:border-slate-700 transition-colors">
                <button onClick={() => removeMission(m.id)} className="absolute top-4 right-4 text-slate-700 hover:text-red-500 transition-colors"><Trash2 className="w-5 h-5" /></button>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="space-y-3">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Mission Label</label>
                    <input type="text" value={m.label} onChange={e => updateMission(m.id, { label: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-white focus:border-amber-500/50 outline-none" placeholder="Target Name"/>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2">Tribe</label>
                    <select value={m.tribe} onChange={e => updateMission(m.id, { tribe: e.target.value as TribeName })} className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-amber-500 font-bold outline-none cursor-pointer">
                      {TRIBES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Slowest Unit</label>
                    <select value={m.unitName} onChange={e => updateMission(m.id, { unitName: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-slate-200 outline-none">
                      {TROOP_DATA.filter(u => u.tribe === m.tribe).map(u => <option key={u.unit} value={u.unit}>{u.unit}</option>)}
                    </select>
                    <div className="flex justify-between items-center mt-2 mb-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Tournament Square Lvl</label>
                      <span className="text-amber-500 font-mono text-xs">{m.tsLevel}</span>
                    </div>
                    <input type="range" min="0" max="20" value={m.tsLevel} onChange={e => updateMission(m.id, { tsLevel: Number(e.target.value) })} className="w-full accent-amber-500 cursor-pointer"/>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1"><Map className="w-2.5 h-2.5"/> Source (X|Y)</label>
                        {userVillages.length > 0 && (
                          <div className="relative group/sel">
                            <select 
                              onChange={(e) => selectUserVillage(m.id, e.target.value)}
                              className="appearance-none bg-slate-800/50 border border-slate-700/50 rounded-full px-2 py-0.5 text-[8px] font-bold text-amber-500 uppercase outline-none cursor-pointer hover:bg-slate-800 transition-colors"
                            >
                              <option value="">My Villages</option>
                              {userVillages.map(v => (
                                <option key={v.id} value={v.id}>{v.name}</option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <input type="text" value={m.startX} onFocus={e => e.target.select()} onChange={e => handleCoordChange(m.id, 'startX', e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded text-center py-2 text-sm font-mono text-slate-300 outline-none"/>
                        <input type="text" value={m.startY} onFocus={e => e.target.select()} onChange={e => handleCoordChange(m.id, 'startY', e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded text-center py-2 text-sm font-mono text-slate-300 outline-none"/>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-red-500 uppercase tracking-widest flex items-center gap-1 mb-1"><Target className="w-2.5 h-2.5"/> Target (X|Y)</label>
                      <div className="flex gap-2">
                        <input type="text" value={m.endX} onFocus={e => e.target.select()} onChange={e => handleCoordChange(m.id, 'endX', e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded text-center py-2 text-sm font-mono text-slate-300 outline-none focus:border-red-500/50"/>
                        <input type="text" value={m.endY} onFocus={e => e.target.select()} onChange={e => handleCoordChange(m.id, 'endY', e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded text-center py-2 text-sm font-mono text-slate-300 outline-none focus:border-red-500/50"/>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col justify-end">
                    <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-3 shadow-inner min-w-[140px]">
                      <div className="flex justify-between items-center text-[10px] font-bold text-slate-600 uppercase">
                        <span>Leagues</span> 
                        <span className="text-slate-300 font-mono">{calculateWrappedDistance(m.startX, m.startY, m.endX, m.endY).toFixed(2)}</span>
                      </div>
                      <div className="flex flex-col gap-1 border-t border-slate-900 pt-2 overflow-hidden">
                        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Dispatch Time</span> 
                        <span className="text-amber-500 font-mono font-bold text-xl leading-none truncate">
                          {(() => {
                            const ad = parseAsUTC(targetTime);
                            if (isNaN(ad.getTime())) return '---';
                            const dist = calculateWrappedDistance(m.startX, m.startY, m.endX, m.endY);
                            const unit = TROOP_DATA.find(u => u.unit === m.unitName && u.tribe === m.tribe) || { speed: 1 };
                            let tHours = dist <= 20 ? dist / unit.speed : (20 / unit.speed) + ((dist - 20) / (unit.speed * (1 + m.tsLevel * 0.2)));
                            return new Date(ad.getTime() - tHours * 3600000).toISOString().slice(11, 19);
                          })()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col gap-3">
            <h3 className="text-lg font-bold flex items-center gap-2 text-white uppercase"><ListOrdered className="w-5 h-5 text-amber-500" /> Wave Summary</h3>
            
            <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-lg border border-slate-800 shadow-inner">
              <label className="text-[10px] font-bold text-slate-600 uppercase pl-2 flex items-center gap-2 tracking-widest">
                <Layers className="w-3 h-3"/> Group:
              </label>
              <select 
                value={groupBy} 
                onChange={(e) => setGroupBy(e.target.value as GroupByOption)}
                className="bg-transparent border-none text-[10px] font-bold text-amber-500 uppercase focus:ring-0 outline-none cursor-pointer tracking-widest"
              >
                <option value="none">Timeline</option>
                <option value="target">By Target</option>
                <option value="time">By Hour</option>
              </select>
            </div>
          </div>

          <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-xl overflow-hidden max-h-[700px] overflow-y-auto custom-scrollbar">
            {groupedMissions.length === 0 || (groupedMissions.length === 1 && groupedMissions[0].items.length === 0) ? (
              <div className="p-12 text-center text-slate-700 italic text-sm">Deployment waiting...</div>
            ) : groupedMissions.map((group) => (
              <div key={group.key} className="border-b border-slate-800 last:border-0">
                {group.label && (
                  <div className="bg-slate-950 px-4 py-2 border-y border-slate-800 flex justify-between items-center sticky top-0 z-10">
                    <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">{group.label}</span>
                    <span className="text-[9px] font-bold text-slate-700 uppercase">{group.items.length} units</span>
                  </div>
                )}
                <div className="divide-y divide-slate-800/50">
                  {group.items.map((res, i) => (
                    <div key={res.id} className="p-4 hover:bg-slate-800/40 transition-colors border-l-2 border-l-transparent hover:border-l-amber-500">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 flex items-center justify-center bg-slate-950 rounded text-[9px] font-bold text-amber-500 border border-slate-800">{i + 1}</span>
                          <span className="text-sm font-bold text-white truncate max-w-[120px]">{res.label}</span>
                        </div>
                        <span className="text-lg font-mono font-bold text-amber-500">{res.launchDate.toISOString().slice(11, 19)}</span>
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                        <span className="flex items-center gap-1"><Zap className="w-2.5 h-2.5"/> {res.unitName}</span>
                        <span>{formatSeconds(res.travelTimeSeconds)} travel</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          <div className="bg-slate-950/50 p-4 rounded-lg border border-slate-800/50 shadow-inner">
            <h4 className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-2 flex items-center gap-2">Briefing</h4>
            <ul className="text-[10px] text-slate-600 space-y-1 font-medium leading-relaxed">
              <li>• Times are UTC (Universal Epoch).</li>
              <li>• Wrap Distance: 401 League Grid.</li>
              <li>• TS benefit starts after 20 leagues.</li>
              <li>• Launch on the clock for precise hits.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
