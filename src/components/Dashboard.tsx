import React from 'react';
import { FilePlus, History, FileText, CheckCircle, Clock, Users } from 'lucide-react';
import { HistoryItem, View } from '../types';
import { convertToBengaliNumber, cn } from '../lib/utils';
import { format } from 'date-fns';
import { bn, enUS } from 'date-fns/locale';
import { useAppContext } from '../context/AppContext';
import { translations } from '../translations';

interface DashboardProps {
  history: HistoryItem[];
  onNavigate: (view: View) => void;
}

export default function Dashboard({ history, onNavigate }: DashboardProps) {
  const { language } = useAppContext();
  const t = translations[language];
  
  const stats = [
    { label: t.totalPapers, value: history.length, icon: FileText, color: 'text-primary', bg: 'bg-primary-light' },
    { label: t.totalQuestions, value: history.reduce((acc, curr) => acc + curr.quantity, 0), icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: t.usedTime, value: language === 'bn' ? '১২ ঘণ্টা' : '12 hours', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: t.activeUsers, value: language === 'bn' ? '১' : '1', icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 bengali-text">{t.welcome}</h1>
          <p className="text-slate-500 mt-1 bengali-text">{t.dashboardDesc}</p>
        </div>
        <button 
          onClick={() => onNavigate('generate')}
          className="btn-teal flex items-center gap-2 w-fit bengali-text"
        >
          <FilePlus size={18} />
          <span>{t.newQuestion}</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", stat.bg)}>
              <stat.icon className={stat.color} size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-500 bengali-text">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-900 bengali-text">
                {typeof stat.value === 'number' ? (language === 'bn' ? convertToBengaliNumber(stat.value) : stat.value) : stat.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent History */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-lg text-slate-900 bengali-text">{t.recentPapers}</h3>
            <button 
              onClick={() => onNavigate('history')}
              className="text-primary text-sm font-medium hover:underline bengali-text"
            >
              {t.viewAll}
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 text-sm uppercase">
                <tr>
                  <th className="px-6 py-4 font-medium bengali-text">{t.topic}</th>
                  <th className="px-6 py-4 font-medium bengali-text">{t.class}</th>
                  <th className="px-6 py-4 font-medium bengali-text">{t.date}</th>
                  <th className="px-6 py-4 font-medium bengali-text">{t.qCount}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.slice(0, 5).map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900 bengali-text">{item.topic}</td>
                    <td className="px-6 py-4 text-slate-600 bengali-text">{item.class_name}</td>
                    <td className="px-6 py-4 text-slate-500 text-sm bengali-text">
                      {format(new Date(item.created_at), 'dd MMMM, yyyy', { locale: language === 'bn' ? bn : enUS })}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-primary text-white text-xs font-bold rounded-full bengali-text">
                        {language === 'bn' ? convertToBengaliNumber(item.quantity) : item.quantity} {language === 'bn' ? 'টি' : 'Qs'}
                      </span>
                    </td>
                  </tr>
                ))}
                {history.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-slate-400 bengali-text">
                      {t.noHistory}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions / Info */}
        <div className="space-y-6">
          <div className="bg-primary p-6 rounded-2xl text-white shadow-lg shadow-primary/20">
            <h3 className="font-bold text-lg mb-2 bengali-text">{t.tipsTitle}</h3>
            <p className="text-primary-light text-sm leading-relaxed bengali-text">
              {t.tipsDesc}
            </p>
            <button 
              onClick={() => onNavigate('generate')}
              className="mt-4 w-full bg-white text-primary font-bold py-2 rounded-lg hover:bg-primary-light transition-colors bengali-text"
            >
              {t.start}
            </button>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="font-bold text-lg mb-4 text-slate-900 bengali-text">{t.systemStatus}</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500 bengali-text">{t.aiModel}</span>
                <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-500">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                  {t.active}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500 bengali-text">{t.pdfServer}</span>
                <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-500">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                  {t.active}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500 bengali-text">{t.database}</span>
                <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-500">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                  {t.connected}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
