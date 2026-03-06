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
import Generator from './components/Generator';
import { useAppContext } from './context/AppContext';
import { translations } from './translations';

export default function App() {
  const { language, setLanguage } = useAppContext();
  const t = translations[language];
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);

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
            <button
              className="sidebar-item w-full bengali-text active"
            >
              <FilePlus size={20} />
              <span>{t.generate}</span>
            </button>
            
            <button
              onClick={() => setLanguage(language === 'bn' ? 'en' : 'bn')}
              className="sidebar-item w-full bengali-text"
            >
              <Languages size={20} />
              <span>{language === 'bn' ? 'English' : 'বাংলা'}</span>
            </button>
          </nav>

          <div className="pt-6 border-t border-slate-100">
            <div className="p-4 bg-slate-50 rounded-xl">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{t.admin}</p>
              <p className="text-sm font-semibold text-slate-900 truncate">admin@example.com</p>
            </div>
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
            <h2 className="font-bold text-lg text-slate-800 hidden sm:block bengali-text">{t.genTitle}</h2>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <button className="p-2 hover:bg-slate-100 rounded-lg relative">
              <Bell size={20} className="text-slate-600" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            
            <div className="h-8 w-px bg-slate-200 mx-2"></div>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center border border-slate-200">
                <User size={20} className="text-slate-600" />
              </div>
            </div>
          </div>
        </header>

        {/* View Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            <Generator />
          </div>
        </div>
      </main>
    </div>
  );
}
