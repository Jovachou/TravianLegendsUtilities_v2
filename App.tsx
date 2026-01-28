
import React, { useState, useEffect } from 'react';
import { ResourceManagement } from './components/ResourceManagement';
import { AttackCoordinator } from './components/AttackCoordinator';
import { DefenseCoordinator } from './components/DefenseCoordinator';
import { ProfileManager } from './components/ProfileManager';
import { AuthSystem } from './components/AuthSystem';
import { supabase } from './lib/supabase';
import { Shield, Box, MapPin, User, LogOut, ShieldAlert, Loader2, AlertTriangle } from 'lucide-react';
import { UserVillage } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'resources' | 'attacks' | 'defense' | 'profile'>('resources');
  const [villages, setVillages] = useState<UserVillage[]>([]);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);

  useEffect(() => {
    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) syncProfile(session.user);
      setLoading(false);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        syncProfile(session.user);
      } else {
        setVillages([]);
        setActiveTab('resources');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const syncProfile = async (user: any) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          display_name: user.user_metadata?.display_name || user.email?.split('@')[0],
          email: user.email,
          updated_at: new Date().toISOString(),
        });
      if (error) console.warn("Profile sync failed. 'profiles' table might be missing.");
    } catch (e) {
      console.log("Profile sync skipped.");
    }
  };

  useEffect(() => {
    if (session?.user) {
      fetchVillages();
    }
  }, [session]);

  const fetchVillages = async () => {
    setDbError(null);
    const { data, error } = await supabase
      .from('villages')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) {
      console.error("Fetch error:", error);
      setDbError(error.message);
    } else if (data) {
      setVillages(data);
    }
  };

  const handleLogout = async () => {
    try {
      setSession(null);
      setVillages([]);
      setActiveTab('resources');
      await supabase.auth.signOut();
      window.location.reload();
    } catch (error) {
      console.error("Logout failed:", error);
      setSession(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-amber-500 animate-spin" />
      </div>
    );
  }

  if (!session) {
    return <AuthSystem />;
  }

  const displayName = session.user.user_metadata?.display_name || session.user.email?.split('@')[0] || 'Commander';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <header className="bg-slate-900 border-b border-slate-800 p-4 sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <Shield className="w-10 h-10 text-amber-500" />
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-white uppercase text-nowrap">Travian Legends Utilities</h1>
              <p className="text-[10px] text-amber-500 font-bold uppercase tracking-widest truncate max-w-[200px]">
                Commander: {displayName}
              </p>
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
                Villages
              </button>
            </nav>

            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-500 border border-slate-700 hover:border-red-500/50 rounded-lg transition-all text-xs font-bold uppercase"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {dbError && (
        <div className="bg-red-500/10 border-b border-red-500/20 p-2 text-center flex items-center justify-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-500" />
          <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest">
            Database Sync Error: {dbError}. Check instructions in the Villages tab.
          </p>
        </div>
      )}

      <main className="flex-grow p-4 md:p-6 max-w-7xl mx-auto w-full">
        {activeTab === 'resources' && <ResourceManagement />}
        {activeTab === 'attacks' && <AttackCoordinator userVillages={villages} />}
        {activeTab === 'defense' && <DefenseCoordinator userVillages={villages} />}
        {activeTab === 'profile' && (
          <ProfileManager 
            villages={villages}
            refreshVillages={fetchVillages}
            hasDbError={!!dbError}
          />
        )}
      </main>

      <footer className="bg-slate-950 py-6 px-4 text-center text-slate-500 text-[10px] uppercase tracking-widest border-t border-slate-900">
        <p>&copy; 2024 Travian Legends Utilities. Not affiliated with Travian Games GmbH.</p>
        <p className="mt-1 text-slate-700">Strategic data is cloud-encrypted and private to your account.</p>
      </footer>
    </div>
  );
};

export default App;
