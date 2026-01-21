
import React, { useState, useMemo, useEffect } from 'react';
import { TROOP_DATA, TRIBES } from '../data';
import { TribeName } from '../types';
import { Map, Clock, Target, Send, Plus, Trash2, ListOrdered, Calendar, Save, Download, Upload, Zap, Globe } from 'lucide-react';

interface AttackMission {
  id: string;
  label: string;
  tribe: TribeName;
  unitName: string;
  tsLevel: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

// Map settings for Travian wrap-around calculation
// Based on user: -200 to 200 range (401 fields wide)
const MAP_SIZE = 401;

export const AttackCoordinator: React.FC = () => {
  // Live UTC Clock
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Initialize targetTime as UTC (toISOString returns UTC)
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

  // Toroidal distance calculation
  const calculateWrappedDistance = (x1: number, y1: number, x2: number, y2: number) => {
    let dx = Math.abs(x1 - x2);
    let dy = Math.abs(y1 - y2);
    
    // Wrap around logic
    if (dx > MAP_SIZE / 2) dx = MAP_SIZE - dx;
    if (dy > MAP_SIZE / 2) dy = MAP_SIZE - dy;
    
    return Math.sqrt(dx * dx + dy * dy);
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
        startX: lastMission?.startX || 0,
        startY: lastMission?.startY || 0,
        endX: lastMission?.endX || 0,
        endY: lastMission?.endY || 0
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

  // Persistence
  const handleSave = () => {
    localStorage.setItem('travian_attack_plan', JSON.stringify({ missions, targetTime }));
    alert('Attack plan saved to browser storage!');
  };

  const handleLoad = () => {
    const saved = localStorage.getItem('travian_attack_plan');
    if (saved) {
      const { missions: savedMissions, targetTime: savedTime } = JSON.parse(saved);
      setMissions(savedMissions);
      setTargetTime(savedTime);
    } else {
      alert('No saved plan found.');
    }
  };

  const handleExportCSV = () => {
    const headers = ['Order', 'Label', 'Tribe', 'Unit', 'TS Level', 'Source X', 'Source Y', 'Target X', 'Target Y', 'Distance', 'Launch Time (UTC)', 'Travel Time'];
    const rows = calculatedMissions.map((m, i) => [
      i + 1,
      m.label,
      m.tribe,
      m.unitName,
      m.tsLevel,
      m.startX,
      m.startY,
      m.endX,
      m.endY,
      m.distance,
      m.launchDate.toISOString().replace('T', ' ').slice(0, 19),
      formatSeconds(m.travelTimeSeconds)
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `attack_plan_utc_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const calculatedMissions = useMemo(() => {
    // Treat targetTime string as UTC by appending 'Z'
    const arrivalDate = new Date(targetTime + ':00Z');
    
    return missions.map(m => {
      const unit = TROOP_DATA.find(u => u.unit === m.unitName && u.tribe === m.tribe) || 
                   TROOP_DATA.find(u => u.tribe === m.tribe)!;
      
      const distance = calculateWrappedDistance(m.startX, m.startY, m.endX, m.endY);
      
      let travelTimeHours = 0;
      if (distance <= 20) {
        travelTimeHours = distance / unit.speed;
      } else {
        const timeForFirst20 = 20 / unit.speed;
        const remainingDistance = distance - 20;
        const boostedSpeed = unit.speed * (1 + m.tsLevel * 0.1);
        const timeForRemainder = remainingDistance / boostedSpeed;
        travelTimeHours = timeForFirst20 + timeForRemainder;
      }

      const travelTimeSeconds = Math.round(travelTimeHours * 3600);
      const launchDate = new Date(arrivalDate.getTime() - travelTimeSeconds * 1000);

      return {
        ...m,
        unit,
        distance: distance.toFixed(2),
        travelTimeSeconds,
        launchDate
      };
    }).sort((a, b) => a.launchDate.getTime() - b.launchDate.getTime());
  }, [missions, targetTime]);

  const formatSeconds = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = Math.floor(totalSeconds % 60);
    return `${h}h ${m}m ${s}s`;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl">
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="bg-amber-500/10 p-3 rounded-lg border border-amber-500/20">
              <Map className="text-amber-500 w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Attack Coordinator</h2>
              <p className="text-slate-400 text-sm">Coordinate multi-village operations across toroidal space.</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch gap-4 w-full xl:w-auto">
            {/* The Time Now Box */}
            <div className="bg-slate-900 p-3 rounded-lg border border-slate-700 flex-grow min-w-[140px]">
              <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase mb-1 tracking-widest">
                <Clock className="w-3 h-3 text-sky-400" /> The time now (UTC)
              </label>
              <div className="text-xl font-mono font-black text-sky-400">
                {now.toISOString().slice(11, 19)}
              </div>
            </div>

             <div className="bg-slate-900 p-3 rounded-lg border border-slate-700 flex-grow">
              <label className="flex items-center gap-2 text-[10px] font-black text-amber-500 uppercase mb-1 tracking-widest">
                <Globe className="w-3 h-3" /> Target Arrival Time (UTC)
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
                onClick={handleSave}
                title="Save Plan to Browser"
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-md transition-all text-sm font-bold border border-slate-600 shadow-sm"
              >
                <Save className="w-4 h-4" /> Save
              </button>
              <button 
                onClick={handleLoad}
                title="Load Plan from Browser"
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-md transition-all text-sm font-bold border border-slate-600 shadow-sm"
              >
                <Upload className="w-4 h-4" /> Load
              </button>
              <button 
                onClick={handleExportCSV}
                title="Download CSV Export (UTC Times)"
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-sky-700 hover:bg-sky-600 text-white rounded-md transition-all text-sm font-bold border border-sky-600 shadow-sm"
              >
                <Download className="w-4 h-4" /> CSV
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Mission Inputs */}
        <div className="xl:col-span-2 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-bold flex items-center gap-2 text-slate-200">
              <Target className="w-5 h-5 text-amber-500" /> 
              Launch Villages ({missions.length})
            </h3>
            <button 
              onClick={addMission}
              className="flex items-center gap-2 px-6 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-md transition-all text-sm font-bold shadow-lg transform active:scale-95"
            >
              <Plus className="w-4 h-4" /> Add Launch
            </button>
          </div>

          <div className="space-y-4 max-h-[1200px] overflow-y-auto pr-2 custom-scrollbar">
            {missions.map((m, idx) => (
              <div key={m.id} className="bg-slate-800 p-5 rounded-xl border border-slate-700 shadow-lg relative group transition-all hover:border-slate-500 hover:shadow-2xl">
                <button 
                  onClick={() => removeMission(m.id)}
                  className="absolute -top-2 -right-2 bg-red-600 text-white p-1.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-red-500"
                  title="Remove Mission"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {/* Basic Info */}
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase mb-1 tracking-widest">Village / Friend</label>
                      <input 
                        type="text"
                        value={m.label}
                        onChange={e => updateMission(m.id, { label: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-sm font-semibold focus:ring-1 focus:ring-amber-500 outline-none text-slate-100"
                        placeholder="e.g. Hammer 01"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase mb-1 tracking-widest">Tribe</label>
                      <select 
                        value={m.tribe} 
                        onChange={(e) => updateMission(m.id, { tribe: e.target.value as TribeName })}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-sm focus:ring-1 focus:ring-amber-500 outline-none appearance-none cursor-pointer"
                      >
                        {TRIBES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Troop Info */}
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase mb-1 tracking-widest">Slowest Unit</label>
                      <select 
                        value={m.unitName} 
                        onChange={(e) => updateMission(m.id, { unitName: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-sm focus:ring-1 focus:ring-amber-500 outline-none appearance-none cursor-pointer"
                      >
                        {TROOP_DATA.filter(u => u.tribe === m.tribe).map(u => (
                          <option key={u.unit} value={u.unit}>{u.unit}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase mb-1 tracking-widest flex justify-between">
                        <span>TS Level</span>
                        <span className="text-amber-500 font-bold">{m.tsLevel}</span>
                      </label>
                      <input 
                        type="range" 
                        min="0" max="20" 
                        value={m.tsLevel}
                        onChange={e => updateMission(m.id, { tsLevel: Number(e.target.value) })}
                        className="w-full accent-amber-500 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer mt-2"
                      />
                    </div>
                  </div>

                  {/* Launch Coord */}
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase mb-1 tracking-widest flex items-center gap-1">
                      <Target className="w-3 h-3 text-sky-400" /> Source (X | Y)
                    </label>
                    <div className="flex gap-2">
                      <input 
                        type="number" 
                        placeholder="X"
                        value={m.startX} 
                        onChange={e => updateMission(m.id, { startX: Number(e.target.value) })}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-sm text-center focus:ring-1 focus:ring-sky-500 outline-none font-mono"
                      />
                      <input 
                        type="number" 
                        placeholder="Y"
                        value={m.startY} 
                        onChange={e => updateMission(m.id, { startY: Number(e.target.value) })}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-sm text-center focus:ring-1 focus:ring-sky-500 outline-none font-mono"
                      />
                    </div>
                    <div className="mt-4">
                      <label className="block text-[10px] font-black text-slate-500 uppercase mb-1 tracking-widest flex items-center gap-1">
                        <Target className="w-3 h-3 text-red-400" /> Target (X | Y)
                      </label>
                      <div className="flex gap-2">
                        <input 
                          type="number" 
                          placeholder="X"
                          value={m.endX} 
                          onChange={e => updateMission(m.id, { endX: Number(e.target.value) })}
                          className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-sm text-center focus:ring-1 focus:ring-red-500 outline-none font-mono"
                        />
                        <input 
                          type="number" 
                          placeholder="Y"
                          value={m.endY} 
                          onChange={e => updateMission(m.id, { endY: Number(e.target.value) })}
                          className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-sm text-center focus:ring-1 focus:ring-red-500 outline-none font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Result Panel */}
                  <div className="flex flex-col justify-end">
                    <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-700 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black text-slate-500 uppercase">Distance</span>
                        <span className="text-lg font-mono font-bold text-slate-100">
                          {calculateWrappedDistance(m.startX, m.startY, m.endX, m.endY).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">Launch (UTC)</span>
                        <span className="text-sm font-mono font-bold text-amber-500">
                          {(() => {
                            const unit = TROOP_DATA.find(u => u.unit === m.unitName && u.tribe === m.tribe);
                            if (!unit) return '---';
                            const dist = calculateWrappedDistance(m.startX, m.startY, m.endX, m.endY);
                            let tHours = dist <= 20 ? dist / unit.speed : (20/unit.speed) + ((dist-20)/(unit.speed*(1+m.tsLevel*0.1)));
                            const launch = new Date(new Date(targetTime + ':00Z').getTime() - tHours * 3600000);
                            return launch.toISOString().slice(11, 19);
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

        {/* Chronological Timeline */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold flex items-center gap-2 text-slate-200">
            <ListOrdered className="w-5 h-5 text-amber-500" /> 
            Chronological Schedule (UTC)
          </h3>
          <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col border-t-4 border-t-amber-500">
            <div className="p-4 bg-slate-900/80 border-b border-slate-700 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex justify-between items-center">
              <span>Next To Launch</span>
              <div className="flex items-center gap-1 text-amber-500/50">
                <Globe className="w-3 h-3" />
                UTC
              </div>
            </div>
            <div className="divide-y divide-slate-700 max-h-[850px] overflow-y-auto custom-scrollbar">
              {calculatedMissions.length === 0 ? (
                <div className="p-12 text-center text-slate-500 italic text-sm">
                  Plan your first attack to see the sequence.
                </div>
              ) : (
                calculatedMissions.map((res, idx) => (
                  <div key={res.id} className="p-5 hover:bg-slate-700/30 transition-all border-l-4 border-l-transparent hover:border-l-amber-500">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="w-6 h-6 flex items-center justify-center rounded-full bg-slate-900 text-[10px] font-black text-amber-500 border border-slate-700">
                            {idx + 1}
                          </span>
                          <h4 className="font-bold text-white text-base truncate max-w-[150px]">{res.label}</h4>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-mono font-black text-amber-500 tracking-tighter leading-none">
                          {res.launchDate.toISOString().slice(11, 19)}
                        </div>
                        <span className="block text-[10px] font-bold text-slate-500 mt-1 uppercase">
                          {res.launchDate.toISOString().slice(0, 10)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      <div className="bg-slate-900/50 px-2 py-1 rounded border border-slate-700/50 flex flex-col">
                        <span className="text-[9px] font-black text-slate-600 uppercase">Unit</span>
                        <span className="text-xs font-bold text-slate-300 truncate">{res.unitName}</span>
                      </div>
                      <div className="bg-slate-900/50 px-2 py-1 rounded border border-slate-700/50 flex flex-col">
                        <span className="text-[9px] font-black text-slate-600 uppercase">Travel</span>
                        <span className="text-xs font-bold text-slate-300">{formatSeconds(res.travelTimeSeconds)}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                          <div className="flex flex-col">
                            <span className="text-[8px] text-slate-600 uppercase">From</span>
                            <span className="text-sky-400 font-bold tracking-tight">({res.startX}|{res.startY})</span>
                          </div>
                          <div className="w-4 h-px bg-slate-700 mx-1"></div>
                          <div className="flex flex-col">
                            <span className="text-[8px] text-slate-600 uppercase">To</span>
                            <span className="text-red-400 font-bold tracking-tight">({res.endX}|{res.endY})</span>
                          </div>
                       </div>
                       <div className="text-right flex flex-col items-end">
                          <span className="text-[8px] text-slate-600 uppercase font-black tracking-widest">Dist</span>
                          <span className="text-xs font-black text-slate-400">{res.distance}</span>
                       </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          
          <div className="p-5 bg-slate-800/80 border border-slate-700 rounded-xl space-y-3">
            <h4 className="text-xs font-black text-amber-500 uppercase tracking-widest flex items-center gap-2">
               <Zap className="w-3 h-3" /> Timezone Disclaimer
            </h4>
            <p className="text-[11px] text-slate-400 leading-relaxed italic">
              All calculations are strictly in <strong>UTC</strong>. This matches the standard Travian Legends server time for major regions. Ensure your game interface is set to UTC or offset accordingly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
