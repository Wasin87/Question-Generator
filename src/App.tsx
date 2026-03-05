import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  FilePlus, 
  History, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Bell,
  Search,
  User,
  Sun,
  Moon,
  Languages
} from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { View, HistoryItem } from './types';
import Dashboard from './components/Dashboard';
import Generator from './components/Generator';
import HistoryView from './components/HistoryView';
import { useAppContext } from './context/AppContext';
import { translations } from './translations';

export default function App() {
  const { language, setLanguage } = useAppContext();
  const t = translations[language];
  
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const fetchHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const res = await fetch('/api/history');
      const data = await res.json();
      setHistory(data);
    } catch (error) {
      toast.error(language === 'bn' ? 'ইতিহাস লোড করতে ব্যর্থ হয়েছে' : 'Failed to load history');
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const menuItems = [
    { id: 'dashboard', label: t.dashboard, icon: LayoutDashboard },
    { id: 'generate', label: t.generate, icon: FilePlus },
    { id: 'history', label: t.history, icon: History },
    { id: 'settings', label: t.settings, icon: Settings },
  ];

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900">
      <Toaster position="top-right" />
      
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>
      
      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transition-transform duration-300 lg:relative lg:translate-x-0",
          !isSidebarOpen && "-translate-x-full"
        )}
      >
        <div className="h-full flex flex-col p-6">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="text-white font-bold text-xl">{language === 'bn' ? 'অ' : 'Q'}</span>
            </div>
            <h1 className="font-bold text-xl text-slate-900 bengali-text">{t.appName}</h1>
          </div>

          <nav className="flex-1 space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveView(item.id as View);
                  if (window.innerWidth < 1024) setIsSidebarOpen(false);
                }}
                className={cn(
                  "sidebar-item w-full bengali-text",
                  activeView === item.id && "active"
                )}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="pt-6 border-t border-slate-100">
            <button className="sidebar-item w-full text-red-500 hover:bg-red-50 bengali-text">
              <LogOut size={20} />
              <span>{t.logout}</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Nav */}
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-slate-100 rounded-lg lg:hidden text-slate-600"
            >
              <Menu size={20} />
            </button>
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder={t.search} 
                className="pl-10 pr-4 py-2 bg-slate-50 border-none rounded-lg focus:ring-2 focus:ring-primary/20 w-64 bengali-text text-slate-900"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <button 
              onClick={() => setLanguage(language === 'bn' ? 'en' : 'bn')}
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 flex items-center gap-2"
              title={t.langSettings}
            >
              <Languages size={20} />
              <span className="text-xs font-bold uppercase">{language}</span>
            </button>

            <button className="p-2 hover:bg-slate-100 rounded-lg relative">
              <Bell size={20} className="text-slate-600" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            
            <div className="h-8 w-px bg-slate-200 mx-2"></div>
            
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-slate-900">{t.admin}</p>
                <p className="text-xs text-slate-500">admin@example.com</p>
              </div>
              <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center border border-slate-200">
                <User size={20} className="text-slate-600" />
              </div>
            </div>
          </div>
        </header>

        {/* View Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="max-w-7xl mx-auto"
            >
              {activeView === 'dashboard' && <Dashboard history={history} onNavigate={setActiveView} />}
              {activeView === 'generate' && <Generator onGenerated={fetchHistory} />}
              {activeView === 'history' && <HistoryView history={history} isLoading={isLoadingHistory} onRefresh={fetchHistory} />}
              {activeView === 'settings' && (
                <div className="max-w-3xl mx-auto">
                  <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="w-12 h-12 bg-primary-light text-primary rounded-xl flex items-center justify-center">
                        <Settings size={24} />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-slate-900 bengali-text">{t.settings}</h2>
                        <p className="text-sm text-slate-500 bengali-text">
                          {language === 'bn' ? 'আপনার অ্যাপের অভিজ্ঞতা কাস্টমাইজ করুন' : 'Customize your app experience'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="group flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-transparent hover:border-primary/20 transition-all">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm text-primary group-hover:text-primary-dark transition-colors">
                            <Languages size={20} />
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-900 bengali-text">{t.langSettings}</h3>
                            <p className="text-xs text-slate-500">
                              {language === 'bn' ? 'বর্তমান ভাষা: বাংলা' : 'Current Language: English'}
                            </p>
                          </div>
                        </div>
                        <button 
                          onClick={() => setLanguage(language === 'bn' ? 'en' : 'bn')}
                          className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-primary hover:bg-primary-light transition-colors bengali-text"
                        >
                          {language === 'bn' ? 'Switch to English' : 'বাংলায় পরিবর্তন করুন'}
                        </button>
                      </div>

                      <div className="p-5 bg-primary-light/50 rounded-2xl border border-primary/10">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm text-primary">
                            <User size={20} />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-slate-900 bengali-text">{t.admin}</h3>
                            <p className="text-xs text-slate-500 mb-3">admin@example.com</p>
                            <div className="flex gap-2">
                              <span className="px-2 py-1 bg-primary text-white text-[10px] font-bold rounded uppercase tracking-wider">Pro Plan</span>
                              <span className="px-2 py-1 bg-primary text-white text-[10px] font-bold rounded uppercase tracking-wider">Verified</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
