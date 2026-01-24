
import React, { useState, useMemo, useEffect } from 'react';
import { TROOP_DATA, TRIBES } from '../data';
import { TribeName, ResourceInput, UnitData } from '../types';
import { Calculator, PieChart, Info, Wheat, Plus, Trash2, Coins, Zap, Box, ArrowUpRight, Scroll } from 'lucide-react';

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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Forward Section */}
      <section className="bg-stone-900 p-8 rounded border-2 border-stone-800 shadow-[0_10px_40px_rgba(0,0,0,0.6)] space-y-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5">
          <Scroll className="w-32 h-32" />
        </div>
        
        <div className="flex items-center justify-between border-b-2 border-amber-900/30 pb-4 relative z-10">
          <h2 className="text-2xl font-bold tracking-widest flex items-center gap-3 uppercase text-stone-100"><Calculator className="text-amber-700 w-6 h-6"/> Strategic Levy</h2>
          <select value={fwdTribe} onChange={e => setFwdTribe(e.target.value as TribeName)} className="bg-stone-950 border border-amber-900/50 rounded px-4 py-2 text-amber-600 font-bold uppercase text-xs tracking-widest cursor-pointer hover:border-amber-700 transition-colors outline-none">
            {TRIBES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div className="space-y-4 max-h-[350px] overflow-y-auto pr-4 custom-scrollbar relative z-10">
          {fwdItems.map(item => (
            <div key={item.id} className="flex gap-4 bg-stone-950/60 p-4 rounded border border-stone-800 group hover:border-amber-900/50 transition-all">
              <select value={item.unitName} onChange={e => setFwdItems(fwdItems.map(i => i.id === item.id ? {...i, unitName: e.target.value} : i))} className="flex-grow bg-transparent text-stone-300 font-serif outline-none appearance-none cursor-pointer">
                {filteredFwdUnits.map(u => <option key={u.unit} value={u.unit}>{u.unit}</option>)}
              </select>
              <input type="number" value={item.amount} onChange={e => setFwdItems(fwdItems.map(i => i.id === item.id ? {...i, amount: Number(e.target.value)} : i))} className="w-28 bg-stone-900 border border-stone-800 rounded px-3 py-1 text-sm font-mono text-amber-500 text-right outline-none focus:border-amber-700"/>
              <button onClick={() => setFwdItems(fwdItems.filter(i => i.id !== item.id))} className="text-stone-700 hover:text-red-900 transition-colors"><Trash2 className="w-4 h-4"/></button>
            </div>
          ))}
          <button onClick={() => setFwdItems([...fwdItems, {id: Math.random().toString(36).substr(2,9), unitName: filteredFwdUnits[0]?.unit || '', amount: 100}])} className="w-full py-3 border-2 border-dashed border-stone-800 rounded text-stone-600 hover:border-amber-900/50 hover:text-amber-700 text-[10px] font-black uppercase tracking-[0.2em] transition-all bg-stone-950/20">Expand Battalion</button>
        </div>

        <div className="bg-stone-950 p-6 rounded border border-stone-800 shadow-inner grid grid-cols-2 gap-6 relative z-10">
          <div className="space-y-4">
             <div className="flex justify-between items-center"><span className="text-[10px] uppercase text-stone-500 font-bold tracking-widest">Lumber</span><span className="font-mono text-lg text-orange-800">{fwdResults.wood.toLocaleString()}</span></div>
             <div className="flex justify-between items-center"><span className="text-[10px] uppercase text-stone-500 font-bold tracking-widest">Clay</span><span className="font-mono text-lg text-red-900">{fwdResults.clay.toLocaleString()}</span></div>
          </div>
          <div className="space-y-4">
             <div className="flex justify-between items-center"><span className="text-[10px] uppercase text-stone-500 font-bold tracking-widest">Iron</span><span className="font-mono text-lg text-stone-400">{fwdResults.iron.toLocaleString()}</span></div>
             <div className="flex justify-between items-center"><span className="text-[10px] uppercase text-stone-500 font-bold tracking-widest">Crop</span><span className="font-mono text-lg text-emerald-900">{fwdResults.crop.toLocaleString()}</span></div>
          </div>
          <div className="col-span-2 pt-4 border-t border-stone-800 flex justify-between items-center">
            <span className="text-xs uppercase text-amber-700 font-black tracking-[0.2em]">Total Tributes</span>
            <span className="font-mono text-2xl text-stone-100">{fwdResults.sum.toLocaleString()}</span>
          </div>
        </div>
      </section>

      {/* Backwards Section */}
      <section className="bg-stone-900 p-8 rounded border-2 border-stone-800 shadow-[0_10px_40px_rgba(0,0,0,0.6)] space-y-8 relative overflow-hidden">
        <div className="flex items-center justify-between border-b-2 border-amber-900/30 pb-4">
          <h2 className="text-2xl font-bold tracking-widest flex items-center gap-3 uppercase text-stone-100"><PieChart className="text-amber-700 w-6 h-6"/> Backwards</h2>
          <select value={bwdTribe} onChange={e => setBwdTribe(e.target.value as TribeName)} className="bg-stone-950 border border-amber-900/50 rounded px-4 py-2 text-amber-600 font-bold uppercase text-xs tracking-widest cursor-pointer outline-none">
            {TRIBES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div className="bg-stone-950/60 p-6 rounded border border-stone-800 space-y-6">
          <h3 className="text-[10px] font-black text-stone-500 uppercase flex items-center gap-2 tracking-[0.2em]"><Box className="w-3 h-3 text-amber-700"/> Treasury Contents</h3>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1"><label className="text-[10px] font-bold text-stone-600 block uppercase tracking-widest">Lumber</label><input type="number" value={bwdResources.wood} onChange={e => setBwdResources({...bwdResources, wood: Number(e.target.value)})} className="w-full bg-stone-900 border border-stone-800 rounded px-3 py-2 text-sm font-mono text-stone-300 outline-none focus:border-amber-900/50"/></div>
            <div className="space-y-1"><label className="text-[10px] font-bold text-stone-600 block uppercase tracking-widest">Clay</label><input type="number" value={bwdResources.clay} onChange={e => setBwdResources({...bwdResources, clay: Number(e.target.value)})} className="w-full bg-stone-900 border border-stone-800 rounded px-3 py-2 text-sm font-mono text-stone-300 outline-none focus:border-amber-900/50"/></div>
            <div className="space-y-1"><label className="text-[10px] font-bold text-stone-600 block uppercase tracking-widest">Iron</label><input type="number" value={bwdResources.iron} onChange={e => setBwdResources({...bwdResources, iron: Number(e.target.value)})} className="w-full bg-stone-900 border border-stone-800 rounded px-3 py-2 text-sm font-mono text-stone-300 outline-none focus:border-amber-900/50"/></div>
            <div className="space-y-1"><label className="text-[10px] font-bold text-stone-600 block uppercase tracking-widest">Crop</label><input type="number" value={bwdResources.crop} onChange={e => setBwdResources({...bwdResources, crop: Number(e.target.value)})} className="w-full bg-stone-900 border border-stone-800 rounded px-3 py-2 text-sm font-mono text-stone-300 outline-none focus:border-amber-900/50"/></div>
          </div>
          <div className="pt-4 border-t border-stone-800">
            <label className="text-[10px] font-bold text-emerald-900 block uppercase tracking-widest mb-1">Garrison Upkeep (Hourly)</label>
            <input type="number" value={bwdCropConsumption} onChange={e => setBwdCropConsumption(Number(e.target.value))} className="w-full bg-stone-900 border border-stone-800 rounded px-3 py-2 text-sm font-mono text-stone-400 outline-none"/>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
             <span className="text-[10px] font-black text-stone-600 uppercase tracking-widest">Council Allocation</span>
             <span className={`text-[10px] font-black uppercase tracking-widest ${bwdSelections.reduce((s, x) => s + x.percentage, 0) === 100 ? 'text-emerald-700' : 'text-amber-700'}`}>
                {bwdSelections.reduce((s, x) => s + x.percentage, 0)}% / 100%
             </span>
          </div>
          {bwdSelections.map((sel, idx) => (
            <div key={idx} className="flex gap-4 bg-stone-950/40 p-4 rounded border border-stone-800 items-center">
              <select value={sel.unitName} onChange={e => setBwdSelections(bwdSelections.map((s, i) => i === idx ? {...s, unitName: e.target.value} : s))} className="flex-grow bg-transparent text-stone-300 font-serif outline-none cursor-pointer">
                <option value="">-- Summon Troop --</option>
                {filteredBwdUnits.map(u => <option key={u.unit} value={u.unit}>{u.unit}</option>)}
              </select>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={sel.percentage} 
                onChange={e => handleBwdPercentageChange(idx, Number(e.target.value))} 
                className="w-32 accent-amber-800"
              />
              <span className="text-xs font-mono w-12 text-right text-stone-400">{sel.percentage}%</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <div className="bg-stone-950 p-6 rounded border border-stone-800 flex flex-col shadow-inner">
            <div className="flex-grow space-y-3">
              <h4 className="text-[10px] font-black text-stone-500 uppercase flex items-center gap-1 mb-4 tracking-widest border-b border-stone-800 pb-2"><Zap className="w-3 h-3 text-amber-700"/> Standard Build</h4>
              {bwdResults.standard.map((r, i) => r.unitName && (
                <div key={i} className="flex justify-between text-xs font-serif italic border-b border-stone-900/50 pb-1">
                  <span className="text-stone-400">{r.unitName}</span>
                  <span className="text-stone-100 font-mono">{r.count.toLocaleString()}</span>
                </div>
              ))}
              {!bwdResults.standard.some(r => r.unitName) && <div className="text-[10px] text-stone-700 italic">No troops summoned...</div>}
            </div>
            <button 
              onClick={() => sendToForward(bwdResults.standard)}
              disabled={!bwdResults.standard.some(r => r.count > 0)}
              className="mt-6 w-full py-3 bg-stone-800 hover:bg-stone-700 disabled:opacity-30 disabled:cursor-not-allowed border border-stone-700 rounded text-[10px] font-black uppercase tracking-[0.2em] text-stone-300 flex items-center justify-center gap-2 transition-all shadow-md active:translate-y-0.5"
            >
              <ArrowUpRight className="w-3 h-3"/> Commit to Ledger
            </button>
          </div>

          <div className="bg-amber-950/5 p-6 rounded border border-amber-900/20 flex flex-col shadow-inner">
            <div className="flex-grow space-y-3">
              <h4 className="text-[10px] font-black text-amber-700 uppercase flex items-center gap-1 mb-4 tracking-widest border-b border-amber-900/10 pb-2"><Coins className="w-3 h-3"/> Gold Exchange</h4>
              {bwdResults.gold.map((r, i) => r.unitName && (
                <div key={i} className="flex justify-between text-xs font-serif italic border-b border-amber-900/5 pb-1 text-amber-200/80">
                  <span>{r.unitName}</span>
                  <span className="font-bold text-amber-600 font-mono">{r.count.toLocaleString()}</span>
                </div>
              ))}
              {!bwdResults.gold.some(r => r.unitName) && <div className="text-[10px] text-amber-900/30 italic text-center">Awaiting trade...</div>}
            </div>
            <div className="mt-4 mb-4 pt-2 border-t border-amber-900/10 text-[8px] text-amber-800 uppercase font-black text-right tracking-widest">Taxable Pool: {bwdResults.availableForGold.toLocaleString()}</div>
            <button 
              onClick={() => sendToForward(bwdResults.gold)}
              disabled={!bwdResults.gold.some(r => r.count > 0)}
              className="w-full py-3 bg-amber-900/20 hover:bg-amber-900/40 disabled:opacity-30 disabled:cursor-not-allowed border border-amber-900/30 rounded text-[10px] font-black uppercase tracking-[0.2em] text-amber-600 flex items-center justify-center gap-2 transition-all shadow-md active:translate-y-0.5"
            >
              <ArrowUpRight className="w-3 h-3"/> Commit to Ledger
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
