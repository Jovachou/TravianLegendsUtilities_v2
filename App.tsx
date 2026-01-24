
import React, { useState } from 'react';
import { ResourceManagement } from './components/ResourceManagement';
import { AttackCoordinator } from './components/AttackCoordinator';
import { Shield, Box, MapPin } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'resources' | 'attacks'>('resources');

  return (
    <div className="min-h-screen bg-stone-950 text-stone-200 flex flex-col font-serif">
      {/* Header */}
      <header className="bg-stone-900 border-b-2 border-amber-900/50 p-6 sticky top-0 z-10 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Shield className="w-12 h-12 text-amber-700" />
              <div className="absolute inset-0 animate-pulse bg-amber-500/10 blur-xl rounded-full"></div>
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-widest text-stone-100 uppercase">Travian Tactics</h1>
              <p className="text-[10px] text-amber-700 font-black uppercase tracking-[0.3em] mt-1">War Room Utilities</p>
            </div>
          </div>
          
          <nav className="flex gap-1 bg-stone-950 p-1 rounded border border-stone-800 shadow-inner">
            <button
              onClick={() => setActiveTab('resources')}
              className={`flex items-center gap-2 px-8 py-3 rounded transition-all duration-300 text-sm font-bold tracking-widest uppercase ${
                activeTab === 'resources' 
                ? 'bg-amber-800 text-white shadow-[0_0_15px_rgba(154,52,18,0.3)] border-b-2 border-amber-500' 
                : 'hover:bg-stone-800 text-stone-500'
              }`}
            >
              <Box className="w-4 h-4" />
              Ledger
            </button>
            <button
              onClick={() => setActiveTab('attacks')}
              className={`flex items-center gap-2 px-8 py-3 rounded transition-all duration-300 text-sm font-bold tracking-widest uppercase ${
                activeTab === 'attacks' 
                ? 'bg-amber-800 text-white shadow-[0_0_15px_rgba(154,52,18,0.3)] border-b-2 border-amber-500' 
                : 'hover:bg-stone-800 text-stone-500'
              }`}
            >
              <MapPin className="w-4 h-4" />
              War Map
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow p-4 md:p-8 max-w-7xl mx-auto w-full relative">
        <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]"></div>
        {activeTab === 'resources' ? <ResourceManagement /> : <AttackCoordinator />}
      </main>

      {/* Footer */}
      <footer className="bg-stone-900 border-t-2 border-stone-800 py-8 px-4 text-center text-stone-600 text-[10px] uppercase tracking-widest">
        <p className="mb-2">&copy; 1204 - 2024 Strategic Archives. For the glory of the Empire.</p>
        <p className="opacity-50">Not affiliated with Travian Games GmbH.</p>
      </footer>
    </div>
  );
};

export default App;
