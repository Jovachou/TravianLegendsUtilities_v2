
import React, { useState, useEffect } from 'react';
import { ResourceManagement } from './components/ResourceManagement';
import { AttackCoordinator } from './components/AttackCoordinator';
import { DefenseCoordinator } from './components/DefenseCoordinator';
import { ProfileManager } from './components/ProfileManager';
import { Shield, Box, MapPin, User, LogIn, ShieldAlert } from 'lucide-react';
import { UserVillage } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'resources' | 'attacks' | 'defense' | 'profile'>('resources');
  const [villages, setVillages] = useState<UserVillage[]>(() => {
    const saved = localStorage.getItem('tl_user_villages');
    return saved ? JSON.parse(saved) : [];
  });
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('tl_logged_in') === 'true');

  useEffect(() => {
    localStorage.setItem('tl_user_villages', JSON.stringify(villages));
  }, [villages]);

  const handleLogin = () => {
    setIsLoggedIn(true);
    localStorage.setItem('tl_logged_in', 'true');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('tl_logged_in');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 p-4 sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <Shield className="w-10 h-10 text-amber-500" />
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-white uppercase">Travian Legends Utilities</h1>
              <p className="text-[10px] text-amber-500 font-bold uppercase tracking-widest">Strategic Command & Planning</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <nav className="flex flex-wrap justify-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
              <button
                onClick={() => setActiveTab('resources')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all text-xs font-bold uppercase ${
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
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all text-xs font-bold uppercase ${
                  activeTab === 'attacks' 
                  ? 'bg-amber-500 text-slate-950 shadow-md' 
                  : 'hover:bg-slate-900 text-slate-400'
                }`}
              >
                <MapPin className="w-4 h-4" />
                Attacks
              </button>
              <button
                onClick={() => setActiveTab('defense')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all text-xs font-bold uppercase ${
                  activeTab === 'defense' 
                  ? 'bg-amber-500 text-slate-950 shadow-md' 
                  : 'hover:bg-slate-900 text-slate-400'
                }`}
              >
                <ShieldAlert className="w-4 h-4" />
                Defense
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all text-xs font-bold uppercase ${
                  activeTab === 'profile' 
                  ? 'bg-amber-500 text-slate-950 shadow-md' 
                  : 'hover:bg-slate-900 text-slate-400'
                }`}
              >
                <User className="w-4 h-4" />
                {isLoggedIn ? 'Villages' : 'Sign In'}
              </button>
            </nav>

            {!isLoggedIn && (
              <button 
                onClick={handleLogin}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase rounded-lg transition-all shadow-lg active:scale-95"
              >
                <LogIn className="w-4 h-4" />
                Login
              </button>
            )}
            {isLoggedIn && (
               <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-full border border-slate-700">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter">Sync Active</span>
               </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow p-4 md:p-6 max-w-7xl mx-auto w-full">
        {activeTab === 'resources' && <ResourceManagement />}
        {activeTab === 'attacks' && <AttackCoordinator userVillages={villages} />}
        {activeTab === 'defense' && <DefenseCoordinator userVillages={villages} />}
        {activeTab === 'profile' && (
          <ProfileManager 
            isLoggedIn={isLoggedIn} 
            onLogin={handleLogin} 
            onLogout={handleLogout}
            villages={villages}
            setVillages={setVillages}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 py-6 px-4 text-center text-slate-500 text-[10px] uppercase tracking-widest border-t border-slate-900">
        <p>&copy; 2024 Travian Legends Utilities. Not affiliated with Travian Games GmbH.</p>
        <p className="mt-1 text-slate-700">Data persists locally on this device. Create an account for cloud synchronization.</p>
      </footer>
    </div>
  );
};

export default App;
