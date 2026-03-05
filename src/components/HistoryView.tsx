import React from 'react';
import { HistoryItem } from '../types';
import { convertToBengaliNumber, cn } from '../lib/utils';
import { format } from 'date-fns';
import { bn, enUS } from 'date-fns/locale';
import { Download, Trash2, FileText, Search, RefreshCcw } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAppContext } from '../context/AppContext';
import { translations } from '../translations';

interface HistoryViewProps {
  history: HistoryItem[];
  isLoading: boolean;
  onRefresh: () => void;
}

export default function HistoryView({ history, isLoading, onRefresh }: HistoryViewProps) {
  const { language } = useAppContext();
  const t = translations[language];

  const handleDelete = async (id: number) => {
    const confirmMsg = language === 'bn' 
      ? 'আপনি কি নিশ্চিত যে আপনি এই প্রশ্নপত্রটি মুছে ফেলতে চান?' 
      : 'Are you sure you want to delete this question paper?';
    if (!confirm(confirmMsg)) return;
    
    try {
      const res = await fetch(`/api/history/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success(language === 'bn' ? 'সফলভাবে মুছে ফেলা হয়েছে' : 'Successfully deleted');
        onRefresh();
      }
    } catch (error) {
      toast.error(language === 'bn' ? 'মুছে ফেলতে সমস্যা হয়েছে' : 'Error deleting');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 bengali-text">{t.history}</h1>
          <p className="text-slate-500 mt-1 bengali-text">
            {language === 'bn' ? 'আপনার তৈরি করা সকল প্রশ্নপত্রের তালিকা এখানে পাবেন।' : 'Find all your generated question papers here.'}
          </p>
        </div>
        <button 
          onClick={onRefresh}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600"
          title={language === 'bn' ? 'রিফ্রেশ করুন' : 'Refresh'}
        >
          <RefreshCcw size={20} className={cn(isLoading && "animate-spin")} />
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder={t.search} 
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none bengali-text text-slate-900"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-sm uppercase">
              <tr>
                <th className="px-6 py-4 font-medium bengali-text">{language === 'bn' ? 'বিষয় ও শ্রেণি' : 'Topic & Class'}</th>
                <th className="px-6 py-4 font-medium bengali-text">{t.date}</th>
                <th className="px-6 py-4 font-medium bengali-text">{language === 'bn' ? 'পূর্ণমান ও সময়' : 'Marks & Time'}</th>
                <th className="px-6 py-4 font-medium bengali-text">{language === 'bn' ? 'অ্যাকশন' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {history.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-light text-primary rounded-lg flex items-center justify-center">
                        <FileText size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 bengali-text">{item.topic}</p>
                        <p className="text-xs text-slate-500 bengali-text">{item.class_name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-600 bengali-text">
                      {format(new Date(item.created_at), 'dd MMMM, yyyy', { locale: language === 'bn' ? bn : enUS })}
                    </p>
                    <p className="text-xs text-slate-400 bengali-text">
                      {format(new Date(item.created_at), 'hh:mm a')}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-600 bengali-text">
                      {language === 'bn' ? `পূর্ণমান: ${convertToBengaliNumber(item.marks)}` : `Marks: ${item.marks}`}
                    </p>
                    <p className="text-xs text-slate-500 bengali-text">{item.duration}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        className="p-2 text-slate-400 hover:text-primary hover:bg-primary-light rounded-lg transition-colors"
                        title={language === 'bn' ? 'ডাউনলোড করুন' : 'Download'}
                      >
                        <Download size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title={language === 'bn' ? 'মুছে ফেলুন' : 'Delete'}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {history.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3 text-slate-300">
                      <FileText size={48} strokeWidth={1} />
                      <p className="bengali-text">{t.noHistory}</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
