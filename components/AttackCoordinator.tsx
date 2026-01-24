
import React, { useState, useMemo, useEffect } from 'react';
import { TROOP_DATA, TRIBES } from '../data';
import { TribeName } from '../types';
import { Map, Clock, Target, Send, Plus, Trash2, ListOrdered, Calendar, Save, Download, Upload, Zap, Globe, RefreshCw, Info, Layers, Sword } from 'lucide-react';

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

type GroupByOption = 'none' | 'target' | 'time';

const MAP_SIZE = 401;

export const AttackCoordinator: React.FC = () => {
  const [now, setNow] = useState(new Date());
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isCalculating, setIsCalculating] = useState(false);
  const [lastCalculated, setLastCalculated] = useState<string | null>(null);
  const [groupBy, setGroupBy] = useState<GroupByOption>('none');

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const [targetTime, setTargetTime] = useState<string>(
    new Date(Date.now() + 3600000).toISOString().slice(0, 19)
  );
  
  const [missions, setMissions] = useState<AttackMission[]>([
    {
      id: Math.random().toString(36).substr(2, 9),
      label: 'Garrison Alpha',
      tribe: 'Romans',
      unitName: 'Fire Catapult',
      tsLevel: 0,
      startX: 0,
      startY: 0,
      endX: 0,
      endY: 0
    }
  ]);

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

  const handleSave = () => {
    localStorage.setItem('travian_attack_plan', JSON.stringify({ missions, targetTime }));
    alert('War orders saved!');
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
        console.error("Failed to load orders", e);
      }
    }
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
        label = `Castle: ${key}`;
      } else if (groupBy === 'time') {
        const dateStr = m.launchDate.toISOString();
        key = dateStr.slice(0, 13);
        label = `Hour of the ${m.launchDate.getUTCHours()}:00`;
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
    <div className="space-y-12 animate-in fade-in duration-700">
      <div className="bg-stone-900 p-8 rounded border-2 border-stone-800 shadow-[0_20px_50px_rgba(0,0,0,0.7)]">
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8">
          <div className="flex items-center gap-6">
            <div className="bg-amber-900/10 p-4 rounded-full border border-amber-900/30">
              <Sword className="text-amber-700 w-10 h-10" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-stone-100 tracking-[0.1em] uppercase">Tactical Deployment</h2>
              <div className="flex items-center gap-4 mt-2">
                <p className="text-stone-500 text-xs uppercase tracking-widest italic">Toroidal Calculus Engine</p>
                {lastCalculated && (
                  <span className="text-[9px] text-emerald-800 font-black uppercase bg-emerald-900/10 px-3 py-1 rounded border border-emerald-900/20 tracking-widest">
                    Synchronized: {lastCalculated}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch gap-6 w-full xl:w-auto">
            <div className="bg-stone-950 p-4 rounded border border-stone-800 flex-grow min-w-[160px] shadow-inner">
              <label className="flex items-center gap-2 text-[10px] font-black text-stone-600 uppercase mb-2 tracking-[0.2em]">
                <Clock className="w-3 h-3 text-amber-900" /> Current Epoch
              </label>
              <div className="text-2xl font-mono font-black text-stone-300">
                {now.toISOString().slice(11, 19)}
              </div>
            </div>

            <div className="bg-stone-950 p-4 rounded border border-stone-800 flex-grow shadow-inner">
              <label className="flex items-center gap-2 text-[10px] font-black text-amber-800 uppercase mb-2 tracking-[0.2em]">
                <Globe className="w-3 h-3" /> Siege Arrival
              </label>
              <input 
                type="datetime-local" 
                step="1"
                value={targetTime} 
                onChange={(e) => setTargetTime(e.target.value)}
                className="bg-transparent border-none text-stone-100 focus:ring-0 outline-none font-mono text-xl w-full cursor-pointer"
              />
            </div>

            <div className="flex gap-3">
              <button 
                onClick={handleRecalculate} 
                disabled={isCalculating}
                className={`px-6 py-2 bg-amber-800 hover:bg-amber-700 disabled:bg-stone-800 text-white rounded text-xs font-black uppercase tracking-[0.2em] border-b-4 border-amber-950 shadow-lg flex items-center justify-center transition-all ${isCalculating ? 'opacity-50' : 'active:translate-y-1 active:border-b-0'}`}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isCalculating ? 'animate-spin' : ''}`} />
                {isCalculating ? '...' : 'Deploy'}
              </button>
              <button onClick={handleSave} className="p-3 bg-stone-800 hover:bg-stone-700 rounded border border-stone-700 text-stone-400" title="Store Plans"><Save className="w-5 h-5" /></button>
              <button onClick={handleLoad} className="p-3 bg-stone-800 hover:bg-stone-700 rounded border border-stone-700 text-stone-400" title="Recall Plans"><Upload className="w-5 h-5" /></button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
        <div className="xl:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold flex items-center gap-3 text-stone-300 uppercase tracking-widest"><Target className="w-6 h-6 text-amber-700" /> Dispatch Orders</h3>
            <button onClick={addMission} className="flex items-center gap-2 px-8 py-3 bg-stone-900 hover:bg-stone-800 text-stone-100 rounded border-2 border-stone-800 transition-all text-xs font-black uppercase tracking-[0.2em] shadow-lg active:scale-95"><Plus className="w-4 h-4" /> Recruit Garrison</button>
          </div>

          <div className="space-y-6 max-h-[1400px] overflow-y-auto pr-4 custom-scrollbar">
            {missions.map((m) => (
              <div key={m.id} className="bg-stone-900 p-8 rounded border-2 border-stone-800 shadow-[0_10px_30px_rgba(0,0,0,0.5)] relative group hover:border-amber-900/50 transition-colors">
                <button onClick={() => removeMission(m.id)} className="absolute top-4 right-4 text-stone-700 hover:text-red-900 transition-colors"><Trash2 className="w-5 h-5" /></button>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                  <div className="space-y-4">
                    <label className="block text-[10px] font-black text-stone-600 uppercase tracking-[0.2em]">Division Label</label>
                    <input type="text" value={m.label} onChange={e => updateMission(m.id, { label: e.target.value })} className="w-full bg-stone-950 border border-stone-800 rounded px-4 py-2 text-sm text-stone-200 focus:border-amber-900/50 outline-none font-serif italic" placeholder="Fortress Name"/>
                    <label className="block text-[10px] font-black text-stone-600 uppercase tracking-[0.2em]">Allegiance</label>
                    <select value={m.tribe} onChange={e => updateMission(m.id, { tribe: e.target.value as TribeName })} className="w-full bg-stone-950 border border-stone-800 rounded px-4 py-2 text-sm text-amber-700 font-bold tracking-widest outline-none cursor-pointer">
                      {TRIBES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="space-y-4">
                    <label className="block text-[10px] font-black text-stone-600 uppercase tracking-[0.2em]">Slowest Battalion</label>
                    <select value={m.unitName} onChange={e => updateMission(m.id, { unitName: e.target.value })} className="w-full bg-stone-950 border border-stone-800 rounded px-4 py-2 text-sm text-stone-300 outline-none cursor-pointer">
                      {TROOP_DATA.filter(u => u.tribe === m.tribe).map(u => <option key={u.unit} value={u.unit}>{u.unit}</option>)}
                    </select>
                    <label className="block text-[10px] font-black text-stone-600 uppercase tracking-[0.2em] flex justify-between">Square Level <span className="text-amber-700">{m.tsLevel}</span></label>
                    <input type="range" min="0" max="20" value={m.tsLevel} onChange={e => updateMission(m.id, { tsLevel: Number(e.target.value) })} className="w-full accent-amber-900 cursor-pointer"/>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-[10px] font-black text-stone-600 uppercase tracking-[0.2em] flex items-center gap-1"><Map className="w-2.5 h-2.5"/> Source (X|Y)</label>
                      <div className="flex gap-3 mt-1">
                        <input type="text" value={m.startX} onFocus={e => e.target.select()} onChange={e => handleCoordChange(m.id, 'startX', e.target.value)} className="w-full bg-stone-950 border border-stone-800 rounded text-center py-2 text-sm font-mono text-stone-300 outline-none focus:border-amber-900/50"/>
                        <input type="text" value={m.startY} onFocus={e => e.target.select()} onChange={e => handleCoordChange(m.id, 'startY', e.target.value)} className="w-full bg-stone-950 border border-stone-800 rounded text-center py-2 text-sm font-mono text-stone-300 outline-none focus:border-amber-900/50"/>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-red-900 uppercase tracking-[0.2em] flex items-center gap-1"><Target className="w-2.5 h-2.5"/> Castle (X|Y)</label>
                      <div className="flex gap-3 mt-1">
                        <input type="text" value={m.endX} onFocus={e => e.target.select()} onChange={e => handleCoordChange(m.id, 'endX', e.target.value)} className="w-full bg-stone-950 border border-stone-800 rounded text-center py-2 text-sm font-mono text-stone-300 outline-none focus:border-red-900/50"/>
                        <input type="text" value={m.endY} onFocus={e => e.target.select()} onChange={e => handleCoordChange(m.id, 'endY', e.target.value)} className="w-full bg-stone-950 border border-stone-800 rounded text-center py-2 text-sm font-mono text-stone-300 outline-none focus:border-red-900/50"/>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col justify-end">
                    <div className="bg-stone-950/80 p-5 rounded border border-stone-800 space-y-4 shadow-inner min-w-[140px]">
                      <div className="flex justify-between items-center text-[10px] font-black text-stone-600 uppercase tracking-widest">
                        <span>Leagues</span> 
                        <span className="text-stone-300 font-mono">{calculateWrappedDistance(m.startX, m.startY, m.endX, m.endY).toFixed(2)}</span>
                      </div>
                      <div className="flex flex-col gap-1 border-t border-stone-800/50 pt-2">
                        <span className="text-[10px] font-black text-stone-600 uppercase tracking-widest">Dispatch Time</span> 
                        <span className="text-amber-700 font-mono font-black text-xl leading-none">
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

        <div className="space-y-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold flex items-center gap-3 text-stone-300 uppercase tracking-widest"><ListOrdered className="w-6 h-6 text-amber-700" /> Dispatch List</h3>
              {isCalculating && <span className="text-[10px] text-amber-700 font-black animate-pulse uppercase tracking-[0.3em]">Casting...</span>}
            </div>
            
            <div className="flex items-center gap-3 bg-stone-950 p-2 rounded border border-stone-800 shadow-inner">
              <label className="text-[10px] font-black text-stone-600 uppercase pl-3 flex items-center gap-2 tracking-widest">
                <Layers className="w-3 h-3 text-amber-900"/> Grouped By:
              </label>
              <select 
                value={groupBy} 
                onChange={(e) => setGroupBy(e.target.value as GroupByOption)}
                className="bg-transparent border-none text-[10px] font-black text-amber-700 uppercase focus:ring-0 outline-none cursor-pointer tracking-widest"
              >
                <option value="none">Chronological</option>
                <option value="target">Target Castle</option>
                <option value="time">Epoch Window</option>
              </select>
            </div>
          </div>

          <div className="bg-stone-900 rounded border-2 border-stone-800 shadow-2xl overflow-hidden border-t-4 border-t-amber-800 max-h-[1200px] overflow-y-auto custom-scrollbar">
            {groupedMissions.length === 0 || (groupedMissions.length === 1 && groupedMissions[0].items.length === 0) ? (
              <div className="p-12 text-center text-stone-700 italic text-sm font-serif">Awaiting orders from the high command...</div>
            ) : groupedMissions.map((group) => (
              <div key={group.key} className="border-b border-stone-800 last:border-0">
                {group.label && (
                  <div className="bg-stone-950/90 px-6 py-3 border-y border-stone-800 flex justify-between items-center sticky top-0 z-10 backdrop-blur-md">
                    <span className="text-[10px] font-black text-amber-800 uppercase tracking-[0.3em]">{group.label}</span>
                    <span className="text-[9px] font-black text-stone-700 uppercase tracking-widest">{group.items.length} Units</span>
                  </div>
                )}
                <div className="divide-y divide-stone-800/40">
                  {group.items.map((res, i) => (
                    <div key={res.id} className="p-6 hover:bg-stone-800/50 transition-all border-l-4 border-l-transparent hover:border-l-amber-800 flex flex-col gap-3">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 flex items-center justify-center bg-stone-950 rounded border border-stone-800 text-[10px] font-black text-amber-700">{i + 1}</span>
                          <span className="text-sm font-bold text-stone-200 tracking-wider font-serif italic">{res.label}</span>
                        </div>
                        <span className="text-2xl font-mono font-black text-amber-700 tracking-tighter">{res.launchDate.toISOString().slice(11, 19)}</span>
                      </div>
                      <div className="flex justify-between text-[10px] text-stone-500 font-bold uppercase tracking-widest">
                        <span className="flex items-center gap-2"><Zap className="w-3 h-3 text-stone-700"/> {res.unitName}</span>
                        <span>{formatSeconds(res.travelTimeSeconds)} Journey</span>
                      </div>
                      <div className="text-[10px] text-stone-700 font-mono mt-2 flex justify-between uppercase tracking-widest border-t border-stone-800/30 pt-2">
                        <span>Origin: ({res.startX}|{res.startY})</span>
                        <span>Leagues: {res.distance}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          <div className="bg-stone-950/50 p-6 rounded border border-stone-800/50 shadow-inner">
            <h4 className="text-[10px] font-black text-amber-900 uppercase tracking-[0.3em] mb-4 flex items-center gap-2 underline underline-offset-4 decoration-stone-800">Commander's Codex</h4>
            <ul className="text-[11px] text-stone-600 space-y-3 leading-relaxed font-serif italic">
              <li>• Times are recorded in the Universal Epoch (UTC).</li>
              <li>• Distance is calculated based on the 401-League Infinite Wrap.</li>
              <li>• Tournament Squares only provide speed benefits beyond the first 20 Leagues.</li>
              <li>• Use Grouping to organize multi-wave siege operations.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
