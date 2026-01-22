
import React, { useState, useMemo, useEffect } from 'react';
import { TROOP_DATA, TRIBES } from '../data';
import { TribeName } from '../types';
// Fix: Added missing 'Info' icon to lucide-react imports
import { Map, Clock, Target, Send, Plus, Trash2, ListOrdered, Calendar, Save, Download, Upload, Zap, Globe, RefreshCw, Info } from 'lucide-react';

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

// Map settings for Travian wrap-around calculation
const MAP_SIZE = 401;

export const AttackCoordinator: React.FC = () => {
  const [now, setNow] = useState(new Date());
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isCalculating, setIsCalculating] = useState(false);
  const [lastCalculated, setLastCalculated] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const [targetTime, setTargetTime] = useState<string>(
    new Date(Date.now() + 3600000).toISOString().slice(0, 16)
  );
  
  const [missions, setMissions] = useState<AttackMission[]>([
    {
      id: Math.random().toString(36).substr(2, 9),
      label: 'Mission 1',
      tribe: 'Romans',
      unitName: 'Fire Catapult',
      tsLevel: 0,
      startX: 0,
      startY: 0,
      endX: 0,
      endY: 0
    }
  ]);

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
    // Simulate a brief processing time for visual feedback
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
        label: `Mission ${missions.length + 1}`,
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
    alert('Attack plan saved!');
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
        console.error("Failed to load plan", e);
      }
    }
  };

  const calculatedMissions = useMemo(() => {
    if (!targetTime) return [];
    const arrivalDate = new Date(targetTime + ':00Z');
    if (isNaN(arrivalDate.getTime())) return [];
    
    // We include refreshTrigger to allow manual overrides
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

  const formatSeconds = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h}h ${m}m ${s}s`;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl">
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="bg-amber-500/10 p-3 rounded-lg border border-amber-500/20">
              <Map className="text-amber-500 w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Attack Coordinator</h2>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-slate-400 text-sm">Coordinate multi-village operations across toroidal space.</p>
                {lastCalculated && (
                  <span className="text-[10px] text-emerald-500 font-bold uppercase bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    Synced: {lastCalculated}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch gap-4 w-full xl:w-auto">
            <div className="bg-slate-900 p-3 rounded-lg border border-slate-700 flex-grow min-w-[140px]">
              <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase mb-1 tracking-widest">
                <Clock className="w-3 h-3 text-sky-400" /> Time now (UTC)
              </label>
              <div className="text-xl font-mono font-black text-sky-400">
                {now.toISOString().slice(11, 19)}
              </div>
            </div>

            <div className="bg-slate-900 p-3 rounded-lg border border-slate-700 flex-grow">
              <label className="flex items-center gap-2 text-[10px] font-black text-amber-500 uppercase mb-1 tracking-widest">
                <Globe className="w-3 h-3" /> Target Arrival (UTC)
              </label>
              <input 
                type="datetime-local" 
                step="1"
                value={targetTime} 
                onChange={(e) => setTargetTime(e.target.value)}
                className="bg-transparent border-none text-white focus:ring-0 outline-none font-mono text-lg w-full"
              />
            </div>

            <div className="flex gap-2">
              <button 
                onClick={handleRecalculate} 
                disabled={isCalculating}
                title="Recalculate Schedule"
                className={`px-4 py-2 bg-amber-600 hover:bg-amber-500 disabled:bg-slate-700 text-white rounded-md text-sm font-bold border border-amber-500/50 shadow-lg flex items-center justify-center transition-all ${isCalculating ? 'opacity-50' : 'active:scale-95'}`}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isCalculating ? 'animate-spin' : ''}`} />
                {isCalculating ? '...' : 'Recalculate'}
              </button>
              <button onClick={handleSave} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-md text-sm font-bold border border-slate-600" title="Save Plan"><Save className="w-4 h-4" /></button>
              <button onClick={handleLoad} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-md text-sm font-bold border border-slate-600" title="Load Plan"><Upload className="w-4 h-4" /></button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold flex items-center gap-2 text-slate-200"><Target className="w-5 h-5 text-amber-500" /> Launch Villages</h3>
            <button onClick={addMission} className="flex items-center gap-2 px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-md border border-slate-700 transition-all text-sm font-bold shadow-sm"><Plus className="w-4 h-4" /> Add Village</button>
          </div>

          <div className="space-y-4 max-h-[1200px] overflow-y-auto pr-2 custom-scrollbar">
            {missions.map((m) => (
              <div key={m.id} className="bg-slate-800 p-5 rounded-xl border border-slate-700 shadow-lg relative group hover:border-slate-500 transition-colors">
                <button onClick={() => removeMission(m.id)} className="absolute top-2 right-2 text-slate-500 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="space-y-3">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Village Label</label>
                    <input type="text" value={m.label} onChange={e => updateMission(m.id, { label: e.target.value })} className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-sm focus:ring-1 focus:ring-amber-500 outline-none" placeholder="Village Name"/>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Tribe</label>
                    <select value={m.tribe} onChange={e => updateMission(m.id, { tribe: e.target.value as TribeName })} className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-sm appearance-none cursor-pointer">
                      {TRIBES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Slowest Unit</label>
                    <select value={m.unitName} onChange={e => updateMission(m.id, { unitName: e.target.value })} className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-sm appearance-none cursor-pointer">
                      {TROOP_DATA.filter(u => u.tribe === m.tribe).map(u => <option key={u.unit} value={u.unit}>{u.unit}</option>)}
                    </select>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest flex justify-between">TS Level <span className="text-amber-500">{m.tsLevel}</span></label>
                    <input type="range" min="0" max="20" value={m.tsLevel} onChange={e => updateMission(m.id, { tsLevel: Number(e.target.value) })} className="w-full accent-amber-500 cursor-pointer"/>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-black text-sky-500 uppercase tracking-widest flex items-center gap-1"><Map className="w-2.5 h-2.5"/> Source (X|Y)</label>
                      <div className="flex gap-2">
                        <input type="text" value={m.startX} onFocus={e => e.target.select()} onChange={e => handleCoordChange(m.id, 'startX', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded text-center py-1.5 text-sm font-mono focus:border-sky-500 outline-none"/>
                        <input type="text" value={m.startY} onFocus={e => e.target.select()} onChange={e => handleCoordChange(m.id, 'startY', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded text-center py-1.5 text-sm font-mono focus:border-sky-500 outline-none"/>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-red-500 uppercase tracking-widest flex items-center gap-1"><Target className="w-2.5 h-2.5"/> Target (X|Y)</label>
                      <div className="flex gap-2">
                        <input type="text" value={m.endX} onFocus={e => e.target.select()} onChange={e => handleCoordChange(m.id, 'endX', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded text-center py-1.5 text-sm font-mono focus:border-red-500 outline-none"/>
                        <input type="text" value={m.endY} onFocus={e => e.target.select()} onChange={e => handleCoordChange(m.id, 'endY', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded text-center py-1.5 text-sm font-mono focus:border-red-500 outline-none"/>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col justify-end">
                    <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-700 space-y-1">
                      <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase"><span>Dist</span> <span className="text-white font-mono">{calculateWrappedDistance(m.startX, m.startY, m.endX, m.endY).toFixed(2)}</span></div>
                      <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase"><span>Launch</span> 
                        <span className="text-amber-500 font-mono font-bold">
                          {(() => {
                            const ad = new Date(targetTime + ':00Z');
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
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold flex items-center gap-2 text-slate-200"><ListOrdered className="w-5 h-5 text-amber-500" /> Schedule (UTC)</h3>
            {isCalculating && <span className="text-[10px] text-amber-500 font-bold animate-pulse">RECALCULATING...</span>}
          </div>
          <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-2xl overflow-hidden divide-y divide-slate-700 border-t-4 border-t-amber-600">
            {calculatedMissions.length === 0 ? (
              <div className="p-8 text-center text-slate-500 italic text-sm">No valid plan. Check target time and coordinates.</div>
            ) : calculatedMissions.map((res, i) => (
              <div key={res.id} className="p-4 hover:bg-slate-700/30 transition-all border-l-4 border-l-transparent hover:border-l-amber-500 flex flex-col gap-1">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 flex items-center justify-center bg-slate-900 rounded-full text-[9px] font-black text-amber-500 border border-slate-700">{i + 1}</span>
                    <span className="text-sm font-bold text-white truncate max-w-[120px]">{res.label}</span>
                  </div>
                  <span className="text-xl font-mono font-black text-amber-500 tracking-tight">{res.launchDate.toISOString().slice(11, 19)}</span>
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                   <span className="flex items-center gap-1"><Zap className="w-2.5 h-2.5 text-slate-600"/> {res.unitName}</span>
                   <span>{formatSeconds(res.travelTimeSeconds)} travel</span>
                </div>
                <div className="text-[9px] text-slate-600 font-mono mt-1 flex justify-between uppercase">
                  <span>Src: ({res.startX}|{res.startY})</span>
                  <span>Dist: {res.distance}</span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-700/50">
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1"><Info className="w-3 h-3"/> Coordinator Tips</h4>
            <ul className="text-[10px] text-slate-500 space-y-1 leading-relaxed">
              <li>• Launch times are sorted chronologically (UTC).</li>
              <li>• Distance assumes a 401x401 toroidal map wrap.</li>
              <li>• Level 20 TS provides 500% speed after 20 tiles.</li>
              <li>• Always hit "Recalculate" after bulk coordinate edits.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
