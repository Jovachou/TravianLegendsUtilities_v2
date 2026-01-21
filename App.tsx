
import React, { useState } from 'react';
import { ResourceManagement } from './components/ResourceManagement';
import { AttackCoordinator } from './components/AttackCoordinator';
import { Shield, Box, MapPin } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'resources' | 'attacks'>('resources');

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 p-4 sticky top-0 z-10 shadow-lg">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <Shield className="w-10 h-10 text-amber-500" />
            <h1 className="text-2xl font-bold tracking-tight text-white">Travian Legends Utilities</h1>
          </div>
          
          <nav className="flex gap-2 bg-slate-900/50 p-1 rounded-lg border border-slate-700">
            <button
              onClick={() => setActiveTab('resources')}
              className={`flex items-center gap-2 px-6 py-2 rounded-md transition-all ${
                activeTab === 'resources' 
                ? 'bg-amber-600 text-white shadow-md' 
                : 'hover:bg-slate-800 text-slate-400'
              }`}
            >
              <Box className="w-4 h-4" />
              Resource Management
            </button>
            <button
              onClick={() => setActiveTab('attacks')}
              className={`flex items-center gap-2 px-6 py-2 rounded-md transition-all ${
                activeTab === 'attacks' 
                ? 'bg-amber-600 text-white shadow-md' 
                : 'hover:bg-slate-800 text-slate-400'
              }`}
            >
              <MapPin className="w-4 h-4" />
              Attack Coordinator
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow p-4 md:p-8 max-w-7xl mx-auto w-full">
        {activeTab === 'resources' ? <ResourceManagement /> : <AttackCoordinator />}
      </main>

      {/* Footer */}
      <footer className="bg-slate-800 border-t border-slate-700 py-6 px-4 text-center text-slate-500 text-sm">
        <p>&copy; 2024 Travian Legends Utilities. Not affiliated with Travian Games GmbH.</p>
      </footer>
    </div>
  );
};

export default App;
