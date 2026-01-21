
import React, { useState, useMemo, useEffect } from 'react';
import { TROOP_DATA, TRIBES } from '../data';
import { TribeName, ResourceInput, UnitData } from '../types';
// Fix: Added missing 'Box' icon import from 'lucide-react'
import { Calculator, PieChart, Info, Wheat, Plus, Trash2, Coins, Zap, Box } from 'lucide-react';

interface FwdItem {
  id: string;
  unitName: string;
  amount: number;
}

export const ResourceManagement: React.FC = () => {
  // Forward Planning State
  const [fwdTribe, setFwdTribe] = useState<TribeName>(TRIBES[0]);
  const [fwdItems, setFwdItems] = useState<FwdItem[]>([
    { id: Math.random().toString(36).substr(2, 9), unitName: '', amount: 100 }
  ]);
  const [fwdCropConsumption, setFwdCropConsumption] = useState<number>(0);

  // Backward Planning State
  const [bwdTribe, setBwdTribe] = useState<TribeName>(TRIBES[0]);
  const [bwdResources, setBwdResources] = useState<ResourceInput>({ wood: 100000, clay: 100000, iron: 100000, crop: 100000 });
  const [bwdCropConsumption, setBwdCropConsumption] = useState<number>(0);
  const [bwdSelections, setBwdSelections] = useState<{ unitName: string; percentage: number }[]>([
    { unitName: '', percentage: 50 },
    { unitName: '', percentage: 30 },
    { unitName: '', percentage: 20 }
  ]);

  // Handle Tribe Change for Forward Planning
  const filteredFwdUnits = useMemo(() => TROOP_DATA.filter(u => u.tribe === fwdTribe), [fwdTribe]);
  
  useEffect(() => {
    setFwdItems(prev => prev.map(item => {
      const exists = filteredFwdUnits.some(u => u.unit === item.unitName);
      return exists ? item : { ...item, unitName: filteredFwdUnits[0]?.unit || '' };
    }));
  }, [fwdTribe, filteredFwdUnits]);

  const addFwdItem = () => {
    setFwdItems([...fwdItems, { 
      id: Math.random().toString(36).substr(2, 9), 
      unitName: filteredFwdUnits[0]?.unit || '', 
      amount: 100 
    }]);
  };

  const removeFwdItem = (id: string) => {
    if (fwdItems.length > 1) {
      setFwdItems(fwdItems.length > 0 ? fwdItems.filter(i => i.id !== id) : []);
    }
  };

  const updateFwdItem = (id: string, updates: Partial<FwdItem>) => {
    setFwdItems(fwdItems.map(i => i.id === id ? { ...i, ...updates } : i));
  };

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

  // Backward Planning Logic
  const filteredBwdUnits = useMemo(() => TROOP_DATA.filter(u => u.tribe === bwdTribe), [bwdTribe]);
  
  useEffect(() => {
    setBwdSelections(prev => prev.map(sel => {
        const unitExists = filteredBwdUnits.some(u => u.unit === sel.unitName);
        return { ...sel, unitName: unitExists ? sel.unitName : '' };
    }));
  }, [filteredBwdUnits]);

  const bwdResults = useMemo(() => {
    const activeSelections = bwdSelections.filter(s => s.unitName !== '');
    if (activeSelections.length === 0) return { standard: [], gold: [], totalSum: 0, availableForGold: 0 };
    
    // Total physical sum
    const totalRawSum = bwdResources.wood + bwdResources.clay + bwdResources.iron + bwdResources.crop;
    const effectiveCrop = Math.max(0, bwdResources.crop - bwdCropConsumption);
    const availableForGold = Math.max(0, totalRawSum - bwdCropConsumption);
    
    // 1. Standard Calculation (Restrictive Resource)
    const standard = activeSelections.map(sel => {
      const unit = TROOP_DATA.find(u => u.unit === sel.unitName)!;
      const portionW = (bwdResources.wood * (sel.percentage / 100));
      const portionCl = (bwdResources.clay * (sel.percentage / 100));
      const portionI = (bwdResources.iron * (sel.percentage / 100));
      const portionCr = (effectiveCrop * (sel.percentage / 100));

      const count = Math.min(
        Math.floor(portionW / unit.wood),
        Math.floor(portionCl / unit.clay),
        Math.floor(portionI / unit.iron),
        Math.floor(portionCr / unit.crop)
      );

      return { unitName: sel.unitName, count };
    });

    // 2. Gold Calculation (Total Resource Sum)
    const gold = activeSelections.map(sel => {
      const unit = TROOP_DATA.find(u => u.unit === sel.unitName)!;
      const resourceBudget = (availableForGold * (sel.percentage / 100));
      const unitTotalCost = unit.wood + unit.clay + unit.iron + unit.crop;
      const count = Math.floor(resourceBudget / unitTotalCost);

      return { unitName: sel.unitName, count };
    });

    return { standard, gold, totalSum: totalRawSum, availableForGold };
  }, [bwdResources, bwdSelections, bwdTribe, bwdCropConsumption]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}h ${m}m ${s}s`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Forward Resource Planning */}
      <section className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl flex flex-col gap-6">
        <div className="flex items-center justify-between border-b border-slate-700 pb-4">
          <div className="flex items-center gap-3">
            <Calculator className="text-amber-500 w-6 h-6" />
            <h2 className="text-xl font-bold">Forward Planning</h2>
          </div>
          <select 
            value={fwdTribe} 
            onChange={(e) => setFwdTribe(e.target.value as TribeName)}
            className="bg-slate-900 border border-slate-700 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-amber-500 outline-none transition-all font-bold text-amber-500"
          >
            {TRIBES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          {fwdItems.map((item) => (
            <div key={item.id} className="flex flex-col sm:flex-row gap-3 bg-slate-900/40 p-3 rounded-lg border border-slate-700 group">
              <div className="flex-grow">
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Unit</label>
                <select 
                  value={item.unitName} 
                  onChange={(e) => updateFwdItem(item.id, { unitName: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-1.5 text-sm focus:ring-1 focus:ring-amber-500 outline-none"
                >
                  {filteredFwdUnits.map(u => <option key={u.unit} value={u.unit}>{u.unit}</option>)}
                </select>
              </div>
              <div className="sm:w-32">
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Amount</label>
                <input 
                  type="number" 
                  min="1"
                  value={item.amount} 
                  onChange={(e) => updateFwdItem(item.id, { amount: Math.max(0, Number(e.target.value)) })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-1.5 text-sm focus:ring-1 focus:ring-amber-500 outline-none"
                />
              </div>
              <div className="flex items-end">
                <button 
                  onClick={() => removeFwdItem(item.id)}
                  className="p-2 text-slate-600 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-0"
                  disabled={fwdItems.length <= 1}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-slate-700/50">
          <button 
            onClick={addFwdItem}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-md transition-all text-xs font-bold uppercase tracking-wider shadow-sm w-full sm:w-auto"
          >
            <Plus className="w-3 h-3" /> Add Unit
          </button>
          
          <div className="w-full sm:w-48">
            <label className="block text-[10px] font-bold text-green-500 uppercase mb-1 flex items-center gap-1">
              <Wheat className="w-3 h-3" /> Crop Consumption / hr
            </label>
            <input 
              type="number" 
              placeholder="0"
              value={fwdCropConsumption || ''} 
              onChange={(e) => setFwdCropConsumption(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-1.5 text-sm focus:ring-1 focus:ring-green-500 outline-none"
            />
          </div>
        </div>

        <div className="bg-slate-900 p-5 rounded-lg border border-slate-700 grid grid-cols-2 sm:grid-cols-4 gap-4 mt-auto">
          <div className="text-center p-2 rounded-md bg-orange-950/20 border border-orange-500/20">
            <span className="block text-[10px] uppercase font-bold text-orange-400 mb-1">Wood</span>
            <span className="text-lg font-mono font-bold text-orange-100">{fwdResults.wood.toLocaleString()}</span>
          </div>
          <div className="text-center p-2 rounded-md bg-red-950/20 border border-red-500/20">
            <span className="block text-[10px] uppercase font-bold text-red-400 mb-1">Clay</span>
            <span className="text-lg font-mono font-bold text-red-100">{fwdResults.clay.toLocaleString()}</span>
          </div>
          <div className="text-center p-2 rounded-md bg-slate-700/20 border border-slate-500/20">
            <span className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Iron</span>
            <span className="text-lg font-mono font-bold text-slate-100">{fwdResults.iron.toLocaleString()}</span>
          </div>
          <div className="text-center p-2 rounded-md bg-green-950/20 border border-green-500/20 relative">
            <span className="block text-[10px] uppercase font-bold text-green-400 mb-1">Crop</span>
            <span className="text-lg font-mono font-bold text-green-100">{fwdResults.crop.toLocaleString()}</span>
            {fwdCropConsumption > 0 && (
               <span className="absolute -bottom-2 left-0 w-full text-[8px] text-green-600 font-bold uppercase truncate">Incl. 1h Buffer</span>
            )}
          </div>
          
          <div className="col-span-full pt-4 mt-4 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex flex-col items-center">
               <span className="text-[10px] text-slate-500 uppercase font-bold">Sum Resources</span>
               <span className="text-amber-400 font-bold text-sm">{fwdResults.sum.toLocaleString()}</span>
            </div>
            <div className="flex flex-col items-center">
               <span className="text-[10px] text-slate-500 uppercase font-bold">Total Upkeep</span>
               <span className="text-red-400 font-bold text-sm">-{fwdResults.upkeep.toLocaleString()} / hr</span>
            </div>
            <div className="flex flex-col items-center">
               <span className="text-[10px] text-slate-500 uppercase font-bold">Build Time (Base)</span>
               <span className="text-sky-400 font-bold text-sm">{formatTime(fwdResults.time)}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Backward Resource Planning */}
      <section className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl flex flex-col gap-6">
        <div className="flex items-center justify-between border-b border-slate-700 pb-4">
          <div className="flex items-center gap-3">
            <PieChart className="text-amber-500 w-6 h-6" />
            <h2 className="text-xl font-bold">Backward Planning</h2>
          </div>
          <select 
            value={bwdTribe} 
            onChange={(e) => setBwdTribe(e.target.value as TribeName)}
            className="bg-slate-900 border border-slate-700 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-amber-500 outline-none transition-all font-bold text-amber-500"
          >
            {TRIBES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        {/* Group: What you have */}
        <div className="bg-slate-900/40 p-5 rounded-xl border border-slate-700 space-y-4">
          <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <Box className="w-3 h-3" /> What you have
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2 sm:col-span-1">
                      <label className="block text-[10px] font-bold text-orange-400 mb-1 uppercase">Wood</label>
                      <input 
                          type="number" 
                          value={bwdResources.wood} 
                          onChange={(e) => setBwdResources({...bwdResources, wood: Number(e.target.value)})}
                          className="w-full bg-slate-900 border border-slate-700 rounded-md px-2 py-1.5 text-sm focus:ring-1 focus:ring-amber-500 outline-none"
                      />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                      <label className="block text-[10px] font-bold text-red-400 mb-1 uppercase">Clay</label>
                      <input 
                          type="number" 
                          value={bwdResources.clay} 
                          onChange={(e) => setBwdResources({...bwdResources, clay: Number(e.target.value)})}
                          className="w-full bg-slate-900 border border-slate-700 rounded-md px-2 py-1.5 text-sm focus:ring-1 focus:ring-amber-500 outline-none"
                      />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                      <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Iron</label>
                      <input 
                          type="number" 
                          value={bwdResources.iron} 
                          onChange={(e) => setBwdResources({...bwdResources, iron: Number(e.target.value)})}
                          className="w-full bg-slate-900 border border-slate-700 rounded-md px-2 py-1.5 text-sm focus:ring-1 focus:ring-amber-500 outline-none"
                      />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                      <label className="block text-[10px] font-bold text-green-400 mb-1 uppercase">Crop Current</label>
                      <input 
                          type="number" 
                          value={bwdResources.crop} 
                          onChange={(e) => setBwdResources({...bwdResources, crop: Number(e.target.value)})}
                          className={`w-full bg-slate-900 border ${bwdResources.crop < bwdCropConsumption ? 'border-red-500' : 'border-slate-700'} rounded-md px-2 py-1.5 text-sm focus:ring-1 focus:ring-amber-500 outline-none`}
                      />
                  </div>
              </div>
              <div>
                  <label className="block text-[10px] font-bold text-green-500 uppercase mb-1 flex items-center gap-1">
                      <Wheat className="w-3 h-3" /> Crop Consumption / hr
                  </label>
                  <input 
                      type="number" 
                      placeholder="Amount to reserve"
                      value={bwdCropConsumption || ''} 
                      onChange={(e) => setBwdCropConsumption(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-1.5 text-sm focus:ring-1 focus:ring-green-500 outline-none h-[calc(100%-20px)]"
                  />
                  <span className="text-[9px] text-slate-500 mt-1 block">Constraint: NPC will keep at least this much Crop.</span>
              </div>
          </div>
        </div>

        <div className="space-y-4 pt-4">
            <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">Unit Allocation (%)</h3>
            {bwdSelections.map((sel, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row items-center gap-4 bg-slate-900/40 p-3 rounded-lg border border-slate-700">
                    <div className="flex-1 w-full">
                        <select 
                            value={sel.unitName} 
                            onChange={(e) => {
                                const newSels = [...bwdSelections];
                                newSels[idx].unitName = e.target.value;
                                setBwdSelections(newSels);
                            }}
                            className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                        >
                            <option value="">-- Select Unit --</option>
                            {filteredBwdUnits.map(u => <option key={u.unit} value={u.unit}>{u.unit}</option>)}
                        </select>
                    </div>
                    <div className="w-full sm:w-48 flex items-center gap-3">
                        <input 
                            type="range" 
                            min="0" 
                            max="100" 
                            value={sel.percentage} 
                            onChange={(e) => {
                                const newSels = [...bwdSelections];
                                newSels[idx].percentage = Number(e.target.value);
                                setBwdSelections(newSels);
                            }}
                            className="flex-1 accent-amber-500 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                        />
                        <span className="text-sm font-mono font-bold text-amber-500 min-w-[3ch]">{sel.percentage}%</span>
                    </div>
                </div>
            ))}
        </div>

        {/* Results Area */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Standard Distribution */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
               <Zap className="w-3 h-3" /> Standard Build
            </h4>
            <div className="bg-slate-900 p-4 rounded-lg border border-slate-700 space-y-2 h-full">
              {bwdResults.standard.length === 0 ? (
                <p className="text-xs text-slate-600 italic">Select units to calculate</p>
              ) : bwdResults.standard.every(r => r.unitName === '') ? (
                <p className="text-xs text-slate-600 italic">Select units above</p>
              ) : bwdResults.standard.map((res, idx) => (
                res.unitName && (
                  <div key={idx} className="flex justify-between items-center bg-slate-800/50 p-2 rounded border border-slate-700/50">
                    <span className="text-xs font-bold text-slate-300 truncate max-w-[100px]">{res.unitName}</span>
                    <span className="text-sm font-mono font-bold text-slate-100">{res.count.toLocaleString()}</span>
                  </div>
                )
              ))}
              <div className="pt-2 border-t border-slate-800 mt-auto">
                 <p className="text-[9px] text-slate-600 italic leading-tight">Limited by single restrictive resource per allocation.</p>
              </div>
            </div>
          </div>

          {/* Gold Use Distribution */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-1">
               <Coins className="w-3 h-3" /> Gold Use (NPC)
            </h4>
            <div className="bg-amber-950/10 p-4 rounded-lg border border-amber-500/20 space-y-2 h-full relative overflow-hidden">
              <div className="absolute top-0 right-0 p-2 opacity-5 pointer-events-none">
                <Coins className="w-16 h-16 text-amber-500" />
              </div>
              
              {bwdResults.gold.length === 0 ? (
                <p className="text-xs text-amber-900/40 italic">Select units to calculate</p>
              ) : bwdResults.gold.every(r => r.unitName === '') ? (
                 <p className="text-xs text-amber-900/40 italic">Select units above</p>
              ) : bwdResults.gold.map((res, idx) => (
                res.unitName && (
                  <div key={idx} className="flex justify-between items-center bg-amber-500/10 p-2 rounded border border-amber-500/20 z-10 relative">
                    <span className="text-xs font-bold text-amber-200 truncate max-w-[100px]">{res.unitName}</span>
                    <span className="text-sm font-mono font-black text-amber-400">{res.count.toLocaleString()}</span>
                  </div>
                )
              ))}

              <div className="pt-2 border-t border-amber-500/10 mt-auto z-10 relative">
                 <div className="flex justify-between items-center">
                    <span className="text-[9px] text-amber-600 uppercase font-black">Available Pool</span>
                    <span className="text-[10px] font-mono font-bold text-amber-500">{bwdResults.availableForGold.toLocaleString()}</span>
                 </div>
                 <p className="text-[8px] text-amber-700 italic leading-tight mt-1">Sum of all resources minus {bwdCropConsumption.toLocaleString()} Crop.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-2 group relative">
          <div className="flex items-center gap-2 p-3 bg-slate-900/20 border border-slate-700/50 rounded-lg cursor-help">
            <Info className="w-4 h-4 text-slate-500" />
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">How Gold Use works</span>
          </div>
          <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block bg-slate-950 p-4 text-[11px] rounded-xl border border-slate-700 w-72 shadow-2xl z-20">
            <p className="font-bold text-amber-500 mb-2 border-b border-amber-500/20 pb-1 flex items-center gap-2">
              <Coins className="w-3 h-3" /> NPC Merchant Logic
            </p>
            <ul className="space-y-2 text-slate-300 leading-snug">
              <li>1. Calculates the <strong className="text-white">Sum of Wood + Clay + Iron + Crop</strong>.</li>
              <li>2. Subtracts the <strong className="text-green-500">1h Crop Upkeep</strong> to ensure the village doesn't starve immediately.</li>
              <li>3. Distributes the remaining "Total Resource Pool" using 1:1 trading to <strong className="text-white">maximize unit production</strong> based on your allocation %.</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};
