
import React, { useState } from 'react';
import { ResourceManagement } from './components/ResourceManagement';
import { AttackCoordinator } from './components/AttackCoordinator';
import { Shield, Box, MapPin } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'resources' | 'attacks'>('resources');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 p-4 sticky top-0 z-10 shadow-lg">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <Shield className="w-10 h-10 text-amber-500" />
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-white uppercase">Travian Tactics</h1>
              <p className="text-[10px] text-amber-500 font-bold uppercase tracking-widest">Strategy & Command Suite</p>
            </div>
          </div>
          
          <nav className="flex gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setActiveTab('resources')}
              className={`flex items-center gap-2 px-6 py-2 rounded-md transition-all text-sm font-bold uppercase ${
                activeTab === 'resources' 
                ? 'bg-amber-500 text-slate-950 shadow-md' 
                : 'hover:bg-slate-900 text-slate-400'
              }`}
            >
              <Box className="w-4 h-4" />
              Resources
            </button>
            <button
              onClick={() => setActiveTab('attacks')}
              className={`flex items-center gap-2 px-6 py-2 rounded-md transition-all text-sm font-bold uppercase ${
                activeTab === 'attacks' 
                ? 'bg-amber-500 text-slate-950 shadow-md' 
                : 'hover:bg-slate-900 text-slate-400'
              }`}
            >
              <MapPin className="w-4 h-4" />
              Attacks
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow p-4 md:p-6 max-w-7xl mx-auto w-full">
        {activeTab === 'resources' ? <ResourceManagement /> : <AttackCoordinator />}
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 py-6 px-4 text-center text-slate-500 text-[10px] uppercase tracking-widest border-t border-slate-900">
        <p>&copy; 2024 Travian Tactics Utilities. Not affiliated with Travian Games GmbH.</p>
      </footer>
    </div>
  );
};

export default App;
