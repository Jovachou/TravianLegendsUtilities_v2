
import React, { useState, useMemo, useEffect } from 'react';
import { TROOP_DATA, TRIBES, TRAINING_TIME_REDUCTION_COMMON, TRAINING_TIME_REDUCTION_BARRACKS } from '../data';
import { TribeName, ResourceInput, UnitData, UserVillage } from '../types';
import { Calculator, PieChart, Info, Wheat, Plus, Trash2, Coins, Zap, Box, ArrowUpRight, Activity, Sword, Hammer, Castle, Settings2, ShieldCheck } from 'lucide-react';

interface FwdItem {
  id: string;
  unitName: string;
  amount: number;
}

interface ResourceManagementProps {
  villages?: UserVillage[];
}

export const ResourceManagement: React.FC<ResourceManagementProps> = ({ villages = [] }) => {
  // Forward Section
  const [fwdTribe, setFwdTribe] = useState<TribeName>(TRIBES[0]);
  const [fwdItems, setFwdItems] = useState<FwdItem[]>([
    { id: Math.random().toString(36).substr(2, 9), unitName: '', amount: 100 }
  ]);
  const [fwdCropConsumption, setFwdCropConsumption] = useState<number>(0);

  // Backwards Section
  const [bwdTribe, setBwdTribe] = useState<TribeName>(TRIBES[0]);
  const [bwdResources, setBwdResources] = useState<ResourceInput>({ wood: 100000, clay: 100000, iron: 100000, crop: 100000 });
  const [bwdCropConsumption, setBwdCropConsumption] = useState<number>(0);
  const [bwdSelections, setBwdSelections] = useState<{ unitName: string; percentage: number }[]>([
    { unitName: '', percentage: 50 },
    { unitName: '', percentage: 30 },
    { unitName: '', percentage: 20 }
  ]);

  // Sustainment Hub Section
  const [selectedVillageId, setSelectedVillageId] = useState<string>('');
  const [sustainConfig, setSustainConfig] = useState<{
    barracksUnit: string;
    gbUnit: string;
    stableUnit: string;
    gsUnit: string;
    workshopUnit: string;
    helmetBonus: number; // 0-20%
    helmetTarget: 'none' | 'infantry' | 'cavalry';
    horseDrinkingTrough: number; // 0-20 (Roman only)
    wateringHole: boolean; // (Egypt only)
    recruitmentBonus: number; // 0-20% (Alliance Recruitment bonus)
  }>({
    barracksUnit: '',
    gbUnit: '',
    stableUnit: '',
    gsUnit: '',
    workshopUnit: '',
    helmetBonus: 0,
    helmetTarget: 'none',
    horseDrinkingTrough: 0,
    wateringHole: false,
    recruitmentBonus: 0,
  });

  const selectedVillage = useMemo(() => villages.find(v => v.id === selectedVillageId), [villages, selectedVillageId]);

  const filteredFwdUnits = useMemo(() => TROOP_DATA.filter(u => u.tribe === fwdTribe), [fwdTribe]);
  
  useEffect(() => {
    setFwdItems(prev => prev.map(item => {
      const exists = filteredFwdUnits.some(u => u.unit === item.unitName);
      return exists ? item : { ...item, unitName: filteredFwdUnits[0]?.unit || '' };
    }));
  }, [fwdTribe, filteredFwdUnits]);

  const fwdResults = useMemo(() => {
    const totals = { wood: 0, clay: 0, iron: 0, crop: 0, upkeep: 0, time: 0, sum: 0 };
    fwdItems.forEach(item => {
      const unit = TROOP_DATA.find(u => u.unit === item.unitName);
      if (unit) {
        totals.wood += unit.wood * item.amount;
        totals.clay += unit.clay * item.amount;
        totals.iron += unit.iron * item.amount;
        totals.crop += unit.crop * item.amount;
        totals.upkeep += unit.crop_upkeep * item.amount;
        totals.time += unit.training_time_s * item.amount;
        totals.sum += unit.sum_resources * item.amount;
      }
    });
    totals.crop += fwdCropConsumption;
    totals.sum += fwdCropConsumption;
    return totals;
  }, [fwdItems, fwdCropConsumption]);

  const filteredBwdUnits = useMemo(() => TROOP_DATA.filter(u => u.tribe === bwdTribe), [bwdTribe]);

  const bwdResults = useMemo(() => {
    const active = bwdSelections.filter(s => s.unitName !== '');
    if (active.length === 0) return { standard: [], gold: [], totalSum: 0, availableForGold: 0 };

    const totalRawSum = bwdResources.wood + bwdResources.clay + bwdResources.iron + bwdResources.crop;
    const availableForGold = Math.max(0, totalRawSum - bwdCropConsumption);
    const effectiveCrop = Math.max(0, bwdResources.crop - bwdCropConsumption);

    const standard = active.map(sel => {
      const unit = TROOP_DATA.find(u => u.unit === sel.unitName)!;
      const budgetMult = sel.percentage / 100;
      const count = Math.min(
        Math.floor((bwdResources.wood * budgetMult) / unit.wood),
        Math.floor((bwdResources.clay * budgetMult) / unit.clay),
        Math.floor((bwdResources.iron * budgetMult) / unit.iron),
        Math.floor((effectiveCrop * budgetMult) / unit.crop)
      );
      return { unitName: sel.unitName, count: Math.max(0, count) };
    });

    const gold = active.map(sel => {
      const unit = TROOP_DATA.find(u => u.unit === sel.unitName)!;
      const budget = availableForGold * (sel.percentage / 100);
      const unitCost = unit.wood + unit.clay + unit.iron + unit.crop;
      return { unitName: sel.unitName, count: Math.floor(budget / unitCost) };
    });

    return { standard, gold, availableForGold };
  }, [bwdResources, bwdSelections, bwdCropConsumption]);

  const sustainResults = useMemo(() => {
    if (!selectedVillage) return null;

    const buildings = [
      { id: 'barracks', unit: sustainConfig.barracksUnit, level: selectedVillage.barracks_level, type: 'infantry' },
      { id: 'gb', unit: sustainConfig.gbUnit, level: selectedVillage.gb_level, type: 'infantry' },
      { id: 'stable', unit: sustainConfig.stableUnit, level: selectedVillage.stable_level, type: 'cavalry' },
      { id: 'gs', unit: sustainConfig.gsUnit, level: selectedVillage.gs_level, type: 'cavalry' },
      { id: 'workshop', unit: sustainConfig.workshopUnit, level: selectedVillage.workshop_level, type: 'siege' },
    ];

    const totals = { wood: 0, clay: 0, iron: 0, crop: 0, upkeep: 0, units: [] as any[] };

    buildings.forEach(b => {
      if (!b.unit || b.level === 0) return;
      const unit = TROOP_DATA.find(u => u.unit === b.unit);
      if (!unit) return;

      // Base time from lookup tables
      const multTable = b.id === 'barracks' ? TRAINING_TIME_REDUCTION_BARRACKS : TRAINING_TIME_REDUCTION_COMMON;
      const lvlMult = multTable[Math.min(b.level - 1, 19)] || 1;

      // Training cost multiplier: Great Buildings cost 3x
      const costMult = (b.id === 'gb' || b.id === 'gs') ? 3 : 1;

      // Other bonuses
      let extraMult = 1;
      
      // Helmet application: Restricted to either Infantry or Cavalry target
      const isHelmetTarget = (sustainConfig.helmetTarget === 'infantry' && b.type === 'infantry') || 
                            (sustainConfig.helmetTarget === 'cavalry' && b.type === 'cavalry');
      
      if (isHelmetTarget) {
        extraMult *= (1 - (sustainConfig.helmetBonus / 100));
      }
      
      extraMult *= (1 - (sustainConfig.recruitmentBonus / 100));
      
      const trainingTime = unit.training_time_s * lvlMult * extraMult;
      const unitsPerHour = 3600 / trainingTime;

      totals.wood += (unit.wood * costMult) * unitsPerHour;
      totals.clay += (unit.clay * costMult) * unitsPerHour;
      totals.iron += (unit.iron * costMult) * unitsPerHour;
      totals.crop += (unit.crop * costMult) * unitsPerHour;
      totals.upkeep += unit.crop_upkeep * unitsPerHour;

      totals.units.push({
        building: b.id.toUpperCase(),
        name: unit.unit,
        perHour: unitsPerHour.toFixed(2),
        perDay: (unitsPerHour * 24).toFixed(0),
        costLabel: costMult === 3 ? '3x Resources' : '1x Resources'
      });
    });

    return totals;
  }, [selectedVillage, sustainConfig]);

  const sendToForward = (results: { unitName: string; count: number }[]) => {
    const items: FwdItem[] = results
      .filter(r => r.count > 0)
      .map(r => ({
        id: Math.random().toString(36).substr(2, 9),
        unitName: r.unitName,
        amount: r.count
      }));
    
    if (items.length > 0) {
      setFwdTribe(bwdTribe);
      setFwdItems(items);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBwdPercentageChange = (idx: number, value: number) => {
    const othersSum = bwdSelections.reduce((sum, s, i) => i === idx ? sum : sum + s.percentage, 0);
    const cappedValue = Math.min(value, 100 - othersSum);
    
    setBwdSelections(bwdSelections.map((s, i) => 
      i === idx ? { ...s, percentage: cappedValue } : s
    ));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Forward Section */}
        <section className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h2 className="text-xl font-bold flex items-center gap-2 text-white"><Calculator className="text-amber-500 w-5 h-5"/> Forward Planning</h2>
            <select value={fwdTribe} onChange={e => setFwdTribe(e.target.value as TribeName)} className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-amber-500 font-bold text-xs uppercase outline-none">
              {TRIBES.map(t => <option key={t} value={t} className="bg-slate-900 text-white">{t}</option>)}
            </select>
          </div>
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {fwdItems.map(item => (
              <div key={item.id} className="flex gap-3 bg-slate-950 p-3 rounded-lg border border-slate-800 hover:border-slate-700 transition-colors">
                <select value={item.unitName} onChange={e => setFwdItems(fwdItems.map(i => i.id === item.id ? {...i, unitName: e.target.value} : i))} className="flex-grow bg-transparent text-slate-200 text-sm outline-none">
                  {filteredFwdUnits.map(u => <option key={u.unit} value={u.unit} className="bg-slate-900 text-slate-200">{u.unit}</option>)}
                </select>
                <input type="number" value={item.amount} onChange={e => setFwdItems(fwdItems.map(i => i.id === item.id ? {...i, amount: Number(e.target.value)} : i))} className="w-24 bg-slate-900 rounded px-2 py-1 text-sm font-mono text-amber-500 outline-none focus:ring-1 focus:ring-amber-500"/>
                <button onClick={() => setFwdItems(fwdItems.filter(i => i.id !== item.id))} className="text-slate-600 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4"/></button>
              </div>
            ))}
            <button onClick={() => setFwdItems([...fwdItems, {id: Math.random().toString(36).substr(2,9), unitName: filteredFwdUnits[0]?.unit || '', amount: 100}])} className="w-full py-2 border-2 border-dashed border-slate-800 rounded-lg text-slate-600 hover:border-amber-500/50 hover:text-amber-500 text-xs font-bold uppercase tracking-widest transition-all">Add Battalion</button>
          </div>
          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-4 shadow-inner">
            <div className="text-center"><span className="block text-[10px] uppercase text-orange-400 font-bold mb-1">Wood</span><span className="font-mono text-white">{fwdResults.wood.toLocaleString()}</span></div>
            <div className="text-center"><span className="block text-[10px] uppercase text-red-400 font-bold mb-1">Clay</span><span className="font-mono text-white">{fwdResults.clay.toLocaleString()}</span></div>
            <div className="text-center"><span className="block text-[10px] uppercase text-slate-400 font-bold mb-1">Iron</span><span className="font-mono text-white">{fwdResults.iron.toLocaleString()}</span></div>
            <div className="text-center"><span className="block text-[10px] uppercase text-green-400 font-bold mb-1">Crop</span><span className="font-mono text-white">{fwdResults.crop.toLocaleString()}</span></div>
          </div>
        </section>

        {/* Backwards Section */}
        <section className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h2 className="text-xl font-bold flex items-center gap-2 text-white"><PieChart className="text-amber-500 w-5 h-5"/> Backwards Planning</h2>
            <select value={bwdTribe} onChange={e => setBwdTribe(e.target.value as TribeName)} className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-amber-500 font-bold text-xs uppercase outline-none">
              {TRIBES.map(t => <option key={t} value={t} className="bg-slate-900 text-white">{t}</option>)}
            </select>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-4 shadow-inner">
            <h3 className="text-xs font-black text-slate-500 uppercase flex items-center gap-2"><Box className="w-3 h-3 text-amber-500"/> Treasure Pool</h3>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-[10px] font-bold text-orange-400 block uppercase mb-1">Wood</label><input type="number" value={bwdResources.wood} onChange={e => setBwdResources({...bwdResources, wood: Number(e.target.value)})} className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1.5 text-sm text-slate-200 font-mono outline-none focus:ring-1 focus:ring-amber-500"/></div>
              <div><label className="text-[10px] font-bold text-red-400 block uppercase mb-1">Clay</label><input type="number" value={bwdResources.clay} onChange={e => setBwdResources({...bwdResources, clay: Number(e.target.value)})} className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1.5 text-sm text-slate-200 font-mono outline-none focus:ring-1 focus:ring-amber-500"/></div>
              <div><label className="text-[10px] font-bold text-slate-400 block uppercase mb-1">Iron</label><input type="number" value={bwdResources.iron} onChange={e => setBwdResources({...bwdResources, iron: Number(e.target.value)})} className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1.5 text-sm text-slate-200 font-mono outline-none focus:ring-1 focus:ring-amber-500"/></div>
              <div><label className="text-[10px] font-bold text-green-400 block uppercase mb-1">Crop</label><input type="number" value={bwdResources.crop} onChange={e => setBwdResources({...bwdResources, crop: Number(e.target.value)})} className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1.5 text-sm text-slate-200 font-mono outline-none focus:ring-1 focus:ring-amber-500"/></div>
              <div className="col-span-2 pt-2 border-t border-slate-800">
                <label className="text-[10px] font-bold text-green-500 block uppercase mb-1">Hourly Garrison Upkeep</label>
                <input type="number" value={bwdCropConsumption} onChange={e => setBwdCropConsumption(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1.5 text-sm text-slate-400 font-mono outline-none"/>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center px-1">
               <span className="text-[10px] font-black text-slate-500 uppercase">Allocation Ratio</span>
               <span className={`text-[10px] font-black uppercase ${bwdSelections.reduce((s, x) => s + x.percentage, 0) === 100 ? 'text-green-500' : 'text-amber-500'}`}>
                  {bwdSelections.reduce((s, x) => s + x.percentage, 0)}% / 100%
               </span>
            </div>
            {bwdSelections.map((sel, idx) => (
              <div key={idx} className="flex gap-4 bg-slate-950 p-3 rounded-lg border border-slate-800 items-center hover:border-slate-700 transition-colors">
                <select value={sel.unitName} onChange={e => setBwdSelections(bwdSelections.map((s, i) => i === idx ? {...s, unitName: e.target.value} : s))} className="flex-grow bg-transparent text-slate-200 text-sm outline-none">
                  <option value="" className="bg-slate-900 text-slate-400">-- Select Unit --</option>
                  {filteredBwdUnits.map(u => <option key={u.unit} value={u.unit} className="bg-slate-900 text-slate-200">{u.unit}</option>)}
                </select>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={sel.percentage} 
                  onChange={e => handleBwdPercentageChange(idx, Number(e.target.value))} 
                  className="w-24 accent-amber-500"
                />
                <span className="text-xs font-mono w-10 text-right text-slate-400">{sel.percentage}%</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 flex flex-col shadow-inner">
              <div className="flex-grow space-y-2">
                <h4 className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-1 mb-2 tracking-widest"><Zap className="w-3 h-3 text-amber-500"/> Standard Build</h4>
                {bwdResults.standard.map((r, i) => r.unitName && (
                  <div key={i} className="flex justify-between text-xs font-mono border-b border-slate-900 pb-1">
                    <span className="text-slate-400">{r.unitName}</span>
                    <span className="text-slate-100">{r.count.toLocaleString()}</span>
                  </div>
                ))}
                {!bwdResults.standard.some(r => r.unitName) && <div className="text-[10px] text-slate-700 italic">No selection...</div>}
              </div>
              <button 
                onClick={() => sendToForward(bwdResults.standard)}
                disabled={!bwdResults.standard.some(r => r.count > 0)}
                className="mt-4 w-full py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed border border-slate-700 rounded text-[10px] font-bold uppercase tracking-widest text-slate-300 flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg"
              >
                <ArrowUpRight className="w-3 h-3"/> Commit to Forward
              </button>
            </div>

            <div className="bg-amber-500/5 p-4 rounded-lg border border-amber-500/20 flex flex-col shadow-inner">
              <div className="flex-grow space-y-2">
                <h4 className="text-[10px] font-black text-amber-500 uppercase flex items-center gap-1 mb-2 tracking-widest"><Coins className="w-3 h-3"/> Gold Exchange</h4>
                {bwdResults.gold.map((r, i) => r.unitName && (
                  <div key={i} className="flex justify-between text-xs font-mono text-amber-200/80 border-b border-amber-500/10 pb-1">
                    <span>{r.unitName}</span>
                    <span className="font-bold text-amber-500">{r.count.toLocaleString()}</span>
                  </div>
                ))}
                {!bwdResults.gold.some(r => r.unitName) && <div className="text-[10px] text-amber-800/40 italic">Awaiting gold...</div>}
              </div>
              <div className="mt-2 mb-4 pt-2 border-t border-amber-500/10 text-[8px] text-amber-700 uppercase font-black text-right">NPC Pool: {bwdResults.availableForGold.toLocaleString()}</div>
              <button 
                onClick={() => sendToForward(bwdResults.gold)}
                disabled={!bwdResults.gold.some(r => r.count > 0)}
                className="w-full py-2 bg-amber-500/10 hover:bg-amber-400/20 disabled:opacity-50 disabled:cursor-not-allowed border border-amber-500/30 rounded text-[10px] font-bold uppercase tracking-widest text-amber-500 flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg"
              >
                <ArrowUpRight className="w-3 h-3"/> Commit to Forward
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Sustainment Hub Section */}
      <section className="bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-2xl space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
              <Activity className="text-amber-500 w-8 h-8" />
              Military Sustainment Hub
            </h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">24/7 Army Maintenance & Throughput</p>
          </div>
          <div className="bg-slate-950 p-2 rounded-xl border border-slate-800 flex items-center gap-3">
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-2">Sector:</span>
            <select 
              value={selectedVillageId} 
              onChange={e => setSelectedVillageId(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-amber-500 font-bold text-xs uppercase outline-none min-w-[180px]"
            >
              <option value="">-- Select Village --</option>
              {villages.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
            </select>
          </div>
        </div>

        {!selectedVillage ? (
          <div className="p-20 text-center bg-slate-950/50 rounded-2xl border border-dashed border-slate-800">
             <Info className="w-8 h-8 text-slate-800 mx-auto mb-4" />
             <p className="text-slate-600 text-sm italic">Select a tactical sector village to calculate permanent sustainment costs.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-2 space-y-6">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Infantry Production */}
                  <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
                     <h3 className="text-xs font-black text-slate-500 uppercase flex items-center gap-2 tracking-[0.2em] mb-4">
                        <Sword className="w-4 h-4 text-amber-500" /> Infantry Facilities
                     </h3>
                     <div className="space-y-4">
                        <div>
                           <div className="flex justify-between items-center mb-1">
                              <label className="text-[10px] font-bold text-slate-600 uppercase">Barracks (Lvl {selectedVillage.barracks_level})</label>
                           </div>
                           <select 
                              value={sustainConfig.barracksUnit}
                              onChange={e => setSustainConfig({...sustainConfig, barracksUnit: e.target.value})}
                              className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-xs text-white outline-none focus:border-amber-500/50"
                           >
                              <option value="">-- Inactive --</option>
                              {TROOP_DATA.map(u => <option key={u.unit} value={u.unit}>{u.unit}</option>)}
                           </select>
                        </div>
                        <div>
                           <div className="flex justify-between items-center mb-1">
                              <label className="text-[10px] font-bold text-slate-600 uppercase">Great Barracks (Lvl {selectedVillage.gb_level})</label>
                           </div>
                           <select 
                              value={sustainConfig.gbUnit}
                              onChange={e => setSustainConfig({...sustainConfig, gbUnit: e.target.value})}
                              className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-xs text-white outline-none focus:border-amber-500/50"
                           >
                              <option value="">-- Inactive --</option>
                              {TROOP_DATA.map(u => <option key={u.unit} value={u.unit}>{u.unit}</option>)}
                           </select>
                        </div>
                     </div>
                  </div>

                  {/* Cavalry Production */}
                  <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
                     <h3 className="text-xs font-black text-slate-500 uppercase flex items-center gap-2 tracking-[0.2em] mb-4">
                        <Activity className="w-4 h-4 text-amber-500" /> Cavalry Facilities
                     </h3>
                     <div className="space-y-4">
                        <div>
                           <div className="flex justify-between items-center mb-1">
                              <label className="text-[10px] font-bold text-slate-600 uppercase">Stable (Lvl {selectedVillage.stable_level})</label>
                           </div>
                           <select 
                              value={sustainConfig.stableUnit}
                              onChange={e => setSustainConfig({...sustainConfig, stableUnit: e.target.value})}
                              className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-xs text-white outline-none focus:border-amber-500/50"
                           >
                              <option value="">-- Inactive --</option>
                              {TROOP_DATA.map(u => <option key={u.unit} value={u.unit}>{u.unit}</option>)}
                           </select>
                        </div>
                        <div>
                           <div className="flex justify-between items-center mb-1">
                              <label className="text-[10px] font-bold text-slate-600 uppercase">Great Stable (Lvl {selectedVillage.gs_level})</label>
                           </div>
                           <select 
                              value={sustainConfig.gsUnit}
                              onChange={e => setSustainConfig({...sustainConfig, gsUnit: e.target.value})}
                              className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-xs text-white outline-none focus:border-amber-500/50"
                           >
                              <option value="">-- Inactive --</option>
                              {TROOP_DATA.map(u => <option key={u.unit} value={u.unit}>{u.unit}</option>)}
                           </select>
                        </div>
                     </div>
                  </div>

                  {/* Workshop */}
                  <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
                     <h3 className="text-xs font-black text-slate-500 uppercase flex items-center gap-2 tracking-[0.2em] mb-4">
                        <Hammer className="w-4 h-4 text-amber-500" /> Siege Factory
                     </h3>
                     <div>
                        <div className="flex justify-between items-center mb-1">
                           <label className="text-[10px] font-bold text-slate-600 uppercase">Workshop (Lvl {selectedVillage.workshop_level})</label>
                        </div>
                        <select 
                           value={sustainConfig.workshopUnit}
                           onChange={e => setSustainConfig({...sustainConfig, workshopUnit: e.target.value})}
                           className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-xs text-white outline-none focus:border-amber-500/50"
                        >
                           <option value="">-- Inactive --</option>
                           {TROOP_DATA.map(u => <option key={u.unit} value={u.unit}>{u.unit}</option>)}
                        </select>
                     </div>
                  </div>

                  {/* Global Modifiers */}
                  <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
                     <h3 className="text-xs font-black text-slate-500 uppercase flex items-center gap-2 tracking-[0.2em] mb-4">
                        <Settings2 className="w-4 h-4 text-amber-500" /> Empire Modifiers
                     </h3>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2 space-y-2">
                           <label className="text-[9px] font-bold text-slate-600 uppercase">Hero Helmet Bonus</label>
                           <div className="grid grid-cols-2 gap-2">
                             <input 
                                type="number" 
                                value={sustainConfig.helmetBonus} 
                                placeholder="Bonus %"
                                onChange={e => setSustainConfig({...sustainConfig, helmetBonus: Number(e.target.value)})}
                                className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1.5 text-xs text-white outline-none font-mono"
                             />
                             <select 
                                value={sustainConfig.helmetTarget}
                                onChange={e => setSustainConfig({...sustainConfig, helmetTarget: e.target.value as any})}
                                className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1.5 text-[10px] text-amber-500 font-bold uppercase outline-none"
                             >
                                <option value="none">None</option>
                                <option value="infantry">Infantry</option>
                                <option value="cavalry">Cavalry</option>
                             </select>
                           </div>
                        </div>
                        <div className="col-span-2 space-y-1">
                           <label className="text-[9px] font-bold text-slate-600 uppercase">Recruitment Bonus (%)</label>
                           <input 
                              type="number" 
                              value={sustainConfig.recruitmentBonus} 
                              onChange={e => setSustainConfig({...sustainConfig, recruitmentBonus: Number(e.target.value)})}
                              className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1.5 text-xs text-white outline-none font-mono"
                           />
                        </div>
                     </div>
                  </div>
               </div>

               <div className="bg-amber-500/5 p-6 rounded-2xl border border-amber-500/10">
                  <h4 className="text-[10px] font-black text-amber-500 uppercase mb-4 tracking-widest">Production Breakdown</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                     {sustainResults?.units.map((u, i) => (
                        <div key={i} className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex flex-col group relative">
                           <div className="flex justify-between items-start mb-2">
                              <div>
                                 <span className="block text-[8px] font-black text-slate-600 uppercase">{u.building}</span>
                                 <span className="text-[10px] font-bold text-white uppercase">{u.name}</span>
                              </div>
                              <div className="text-right">
                                 <span className="block text-[8px] font-black text-amber-500 uppercase tracking-tighter">{u.perHour}/hr</span>
                                 <span className="text-[10px] font-mono text-slate-400 font-bold">+{u.perDay}/day</span>
                              </div>
                           </div>
                           <div className="flex justify-between items-center mt-1 pt-1 border-t border-slate-800/50">
                             <span className={`text-[7px] font-black uppercase tracking-widest ${u.costLabel.includes('3x') ? 'text-red-500' : 'text-slate-600'}`}>{u.costLabel}</span>
                             { (sustainConfig.helmetTarget === 'infantry' && u.building.includes('BARRACKS')) || 
                               (sustainConfig.helmetTarget === 'cavalry' && u.building.includes('STABLE')) ? (
                               <ShieldCheck className="w-2.5 h-2.5 text-amber-500" title="Helmet Active" />
                             ) : null}
                           </div>
                        </div>
                     ))}
                     {sustainResults?.units.length === 0 && <div className="col-span-full py-4 text-center text-[10px] text-slate-700 uppercase font-bold italic">No active production queues detected.</div>}
                  </div>
               </div>
            </div>

            <div className="space-y-6">
               <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-inner flex flex-col h-full">
                  <h3 className="text-xs font-black text-slate-500 uppercase mb-6 flex items-center gap-2 tracking-[0.2em]">
                     <Coins className="w-4 h-4 text-amber-500" /> Resource Throughput
                  </h3>
                  
                  <div className="space-y-6 flex-grow">
                     <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                        <div>
                           <span className="text-[9px] font-bold text-orange-400 uppercase tracking-widest block mb-1">Wood / Hr</span>
                           <span className="text-lg font-mono font-bold text-white">{(sustainResults?.wood || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                        </div>
                        <div>
                           <span className="text-[9px] font-bold text-red-400 uppercase tracking-widest block mb-1">Clay / Hr</span>
                           <span className="text-lg font-mono font-bold text-white">{(sustainResults?.clay || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                        </div>
                        <div>
                           <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Iron / Hr</span>
                           <span className="text-lg font-mono font-bold text-white">{(sustainResults?.iron || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                        </div>
                        <div>
                           <span className="text-[9px] font-bold text-green-400 uppercase tracking-widest block mb-1">Crop / Hr</span>
                           <span className="text-lg font-mono font-bold text-white">{(sustainResults?.crop || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                        </div>
                     </div>

                     <div className="pt-6 border-t border-slate-800 space-y-4">
                        <div className="flex justify-between items-center">
                           <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.1em]">Total Resources / Hr</span>
                           <span className="text-sm font-mono font-black text-slate-300">
                             {((sustainResults?.wood || 0) + (sustainResults?.clay || 0) + (sustainResults?.iron || 0) + (sustainResults?.crop || 0)).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                           </span>
                        </div>
                        <div className="flex justify-between items-center">
                           <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.1em]">Total Resources / Day</span>
                           <span className="text-sm font-mono font-black text-amber-500">
                             {(( (sustainResults?.wood || 0) + (sustainResults?.clay || 0) + (sustainResults?.iron || 0) + (sustainResults?.crop || 0) ) * 24).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                           </span>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-slate-900">
                           <span className="text-[10px] font-black text-green-500 uppercase tracking-[0.1em]">Upkeep Growth / Day</span>
                           <div className="text-right">
                              <span className="text-sm font-mono font-black text-green-500">
                                 +{( (sustainResults?.upkeep || 0) * 24 ).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                              </span>
                              <span className="block text-[8px] font-black text-slate-700 uppercase">Crop Consumption</span>
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="mt-8 p-4 bg-slate-900/50 rounded-xl border border-slate-800">
                     <div className="flex items-center gap-3 text-amber-500/50 mb-2">
                        <Info className="w-4 h-4" />
                        <span className="text-[9px] font-black uppercase">Tactical Insight</span>
                     </div>
                     <p className="text-[10px] text-slate-600 font-bold uppercase leading-relaxed">
                        To sustain this production, ensure your hourly production (plus external trade) matches the throughput totals calculated above. Great buildings incur 3x training costs.
                     </p>
                  </div>
               </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
