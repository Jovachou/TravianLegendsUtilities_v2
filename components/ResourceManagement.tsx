
import React, { useState, useMemo, useEffect } from 'react';
import { TROOP_DATA, TRIBES } from '../data';
import { TribeName, ResourceInput, UnitData } from '../types';
import { Calculator, PieChart, Info, Wheat, Plus, Trash2, Coins, Zap, Box, ArrowUpRight } from 'lucide-react';

interface FwdItem {
  id: string;
  unitName: string;
  amount: number;
}

export const ResourceManagement: React.FC = () => {
  const [fwdTribe, setFwdTribe] = useState<TribeName>(TRIBES[0]);
  const [fwdItems, setFwdItems] = useState<FwdItem[]>([
    { id: Math.random().toString(36).substr(2, 9), unitName: '', amount: 100 }
  ]);
  const [fwdCropConsumption, setFwdCropConsumption] = useState<number>(0);

  const [bwdTribe, setBwdTribe] = useState<TribeName>(TRIBES[0]);
  const [bwdResources, setBwdResources] = useState<ResourceInput>({ wood: 100000, clay: 100000, iron: 100000, crop: 100000 });
  const [bwdCropConsumption, setBwdCropConsumption] = useState<number>(0);
  const [bwdSelections, setBwdSelections] = useState<{ unitName: string; percentage: number }[]>([
    { unitName: '', percentage: 50 },
    { unitName: '', percentage: 30 },
    { unitName: '', percentage: 20 }
  ]);

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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-500">
      {/* Forward Section */}
      <section className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <h2 className="text-xl font-bold flex items-center gap-2 text-white"><Calculator className="text-amber-500 w-5 h-5"/> Forward Planning</h2>
          <select value={fwdTribe} onChange={e => setFwdTribe(e.target.value as TribeName)} className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-amber-500 font-bold text-xs uppercase outline-none">
            {TRIBES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
          {fwdItems.map(item => (
            <div key={item.id} className="flex gap-3 bg-slate-950 p-3 rounded-lg border border-slate-800 hover:border-slate-700 transition-colors">
              <select value={item.unitName} onChange={e => setFwdItems(fwdItems.map(i => i.id === item.id ? {...i, unitName: e.target.value} : i))} className="flex-grow bg-transparent text-slate-200 text-sm outline-none">
                {filteredFwdUnits.map(u => <option key={u.unit} value={u.unit}>{u.unit}</option>)}
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
            {TRIBES.map(t => <option key={t} value={t}>{t}</option>)}
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
                <option value="">-- Select Unit --</option>
                {filteredBwdUnits.map(u => <option key={u.unit} value={u.unit}>{u.unit}</option>)}
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
              className="w-full py-2 bg-amber-500/10 hover:bg-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed border border-amber-500/30 rounded text-[10px] font-bold uppercase tracking-widest text-amber-500 flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg"
            >
              <ArrowUpRight className="w-3 h-3"/> Commit to Forward
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
