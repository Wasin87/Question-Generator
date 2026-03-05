import React, { useState, useRef } from 'react';
import { Download, Eye, EyeOff, Printer, FileText, CheckCircle2, Loader2 } from 'lucide-react';
import { Question } from '../types';
import { convertToBengaliNumber, BENGALI_LABELS, cn } from '../lib/utils';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { toast } from 'react-hot-toast';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';
import { useAppContext } from '../context/AppContext';
import { translations } from '../translations';

interface QuestionPreviewProps {
  questions: Question[];
  meta: {
    topic: string;
    className: string;
    marks: number;
    duration: string;
  };
  onReset: () => void;
}

const MathText = ({ text }: { text: string }) => {
  if (!text) return null;
  
  // Split text by $...$ or $$...$$
  const parts = text.split(/(\$\$.*?\$\$|\$.*?\$)/g);
  
  return (
    <span>
      {parts.map((part, i) => {
        if (part.startsWith('$$') && part.endsWith('$$')) {
          return <BlockMath key={i} math={part.slice(2, -2)} />;
        } else if (part.startsWith('$') && part.endsWith('$')) {
          return <InlineMath key={i} math={part.slice(1, -1)} />;
        }
        return <span key={i}>{part}</span>;
      })}
    </span>
  );
};

export default function QuestionPreview({ questions, meta, onReset }: QuestionPreviewProps) {
  const { language } = useAppContext();
  const t = translations[language];
  
  const [showAnswers, setShowAnswers] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [pdfSettings, setPdfSettings] = useState({
    paperSize: 'a4' as 'a4' | 'letter' | 'legal',
    margin: 'medium' as 'small' | 'medium' | 'large',
    fontSize: 'medium' as 'small' | 'medium' | 'large'
  });
  const paperRef = useRef<HTMLDivElement>(null);

  const getMarginClass = () => {
    switch (pdfSettings.margin) {
      case 'small': return 'p-4 md:p-8';
      case 'medium': return 'p-6 md:p-12';
      case 'large': return 'p-10 md:p-20';
      default: return 'p-6 md:p-12';
    }
  };

  const getFontSizeClass = () => {
    switch (pdfSettings.fontSize) {
      case 'small': return 'text-sm';
      case 'medium': return 'text-base';
      case 'large': return 'text-lg';
      default: return 'text-base';
    }
  };

  const getPaperSizeStyle = () => {
    switch (pdfSettings.paperSize) {
      case 'a4': return { width: '210mm', minHeight: '297mm' };
      case 'letter': return { width: '215.9mm', minHeight: '279.4mm' };
      case 'legal': return { width: '215.9mm', minHeight: '355.6mm' };
      default: return { width: '210mm', minHeight: '297mm' };
    }
  };

  const generatePDF = async () => {
    if (!paperRef.current) return;
    
    setIsExporting(true);
    const toastId = toast.loading(language === 'bn' ? 'পিডিএফ তৈরি হচ্ছে...' : 'Generating PDF...');
    
    try {
      // Create a clone of the paper for rendering to avoid UI issues
      const paperClone = paperRef.current.cloneNode(true) as HTMLDivElement;
      paperClone.style.position = 'fixed';
      paperClone.style.left = '-9999px';
      paperClone.style.top = '0';
      paperClone.style.width = getPaperSizeStyle().width;
      paperClone.style.minHeight = getPaperSizeStyle().minHeight;
      paperClone.style.backgroundColor = '#ffffff';
      document.body.appendChild(paperClone);

      const canvas = await html2canvas(paperClone, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: paperClone.offsetWidth,
        windowHeight: paperClone.offsetHeight
      });
      
      document.body.removeChild(paperClone);
      
      const imgData = canvas.toDataURL('image/png');
      const format = pdfSettings.paperSize === 'letter' ? 'letter' : pdfSettings.paperSize === 'legal' ? 'legal' : 'a4';
      const pdf = new jsPDF('p', 'mm', format);
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      
      const finalWidth = imgWidth * ratio;
      const finalHeight = imgHeight * ratio;
      
      const xOffset = (pdfWidth - finalWidth) / 2;
      const yOffset = 0;
      
      pdf.addImage(imgData, 'PNG', xOffset, yOffset, finalWidth, finalHeight);
      pdf.save(`Question_Paper_${meta.topic.replace(/\s+/g, '_')}_${new Date().toLocaleDateString()}.pdf`);
      
      toast.success(language === 'bn' ? 'পিডিএফ সফলভাবে ডাউনলোড হয়েছে' : 'PDF downloaded successfully', { id: toastId });
    } catch (error) {
      console.error('PDF Generation Error:', error);
      toast.error(language === 'bn' ? 'পিডিএফ তৈরি করতে সমস্যা হয়েছে।' : 'Error generating PDF.', { id: toastId });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary-light text-primary rounded-full flex items-center justify-center">
              <CheckCircle2 size={28} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg bengali-text">{t.qGenerated}</h3>
              <p className="text-sm text-slate-500 bengali-text">
                {language === 'bn' ? convertToBengaliNumber(questions.length) : questions.length} {t.qFound}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => setShowAnswers(!showAnswers)}
              className="px-4 py-2 rounded-lg border border-primary/30 bg-white text-primary hover:bg-primary-light transition-colors text-sm font-medium flex items-center gap-2 bengali-text"
            >
              {showAnswers ? <EyeOff size={16} /> : <Eye size={16} />}
              <span>{showAnswers ? t.hideAns : t.showAns}</span>
            </button>
            <button 
              onClick={onReset}
              className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 text-sm font-medium flex items-center gap-2 transition-colors bengali-text"
            >
              <Printer size={16} />
              <span>{t.startNew}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-slate-100 pt-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider bengali-text">
              {language === 'bn' ? 'কাগজের সাইজ' : 'Paper Size'}
            </label>
            <select 
              value={pdfSettings.paperSize}
              onChange={(e) => setPdfSettings(prev => ({ ...prev, paperSize: e.target.value as any }))}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm outline-none focus:ring-2 focus:ring-primary/20 bengali-text text-slate-900"
            >
              <option value="a4">A4 (210 x 297 mm)</option>
              <option value="letter">Letter (8.5 x 11 in)</option>
              <option value="legal">Legal (8.5 x 14 in)</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider bengali-text">
              {language === 'bn' ? 'মার্জিন' : 'Margin'}
            </label>
            <select 
              value={pdfSettings.margin}
              onChange={(e) => setPdfSettings(prev => ({ ...prev, margin: e.target.value as any }))}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm outline-none focus:ring-2 focus:ring-primary/20 bengali-text text-slate-900"
            >
              <option value="small">{language === 'bn' ? 'ছোট' : 'Small'}</option>
              <option value="medium">{language === 'bn' ? 'মাঝারি' : 'Medium'}</option>
              <option value="large">{language === 'bn' ? 'বড়' : 'Large'}</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider bengali-text">
              {language === 'bn' ? 'ফন্ট সাইজ' : 'Font Size'}
            </label>
            <select 
              value={pdfSettings.fontSize}
              onChange={(e) => setPdfSettings(prev => ({ ...prev, fontSize: e.target.value as any }))}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm outline-none focus:ring-2 focus:ring-primary/20 bengali-text text-slate-900"
            >
              <option value="small">{language === 'bn' ? 'ছোট' : 'Small'}</option>
              <option value="medium">{language === 'bn' ? 'মাঝারি' : 'Medium'}</option>
              <option value="large">{language === 'bn' ? 'বড়' : 'Large'}</option>
            </select>
          </div>
        </div>

        <button 
          onClick={generatePDF}
          disabled={isExporting}
          className="btn-teal w-full flex items-center justify-center gap-2 py-3 text-lg"
        >
          {isExporting ? <Loader2 size={24} className="animate-spin" /> : <Download size={24} />}
          <span>{t.downloadPdf}</span>
        </button>
      </div>

      {/* Exam Paper Preview */}
      <div className="overflow-x-auto pb-8 flex justify-center">
        <div 
          ref={paperRef}
          style={{ 
            backgroundColor: '#ffffff', 
            color: '#000000', 
            borderColor: '#008080',
            ...getPaperSizeStyle()
          }}
          className={cn(
            "border-2 rounded-lg shadow-2xl mx-auto relative overflow-hidden transition-all duration-300",
            getMarginClass(),
            getFontSizeClass()
          )}
        >
          {/* Header */}
          <div className="text-center space-y-2 mb-10">
            <h2 style={{ color: '#000000' }} className="text-2xl font-bold bengali-text">{meta.topic}</h2>
            <p style={{ color: '#008080' }} className="text-lg font-medium bengali-text">{meta.className}</p>
            <div style={{ borderColor: '#008080' }} className="flex justify-between items-end pt-6 border-b-2 pb-2">
              <p style={{ color: '#000000' }} className="font-bold bengali-text">
                {language === 'bn' ? `সময়: ${meta.duration}` : `Time: ${meta.duration}`}
              </p>
              <p style={{ color: '#000000' }} className="font-bold bengali-text">
                {language === 'bn' ? `পূর্ণমান: ${convertToBengaliNumber(meta.marks)}` : `Full Marks: ${meta.marks}`}
              </p>
            </div>
          </div>

          {/* Instructions */}
          <div className="mb-8">
            <p style={{ color: '#008080' }} className="italic text-sm bengali-text">
              {t.instructions}
            </p>
          </div>

          {/* Questions List */}
          <div className="space-y-8">
            {questions.map((q, i) => (
              <div key={i} className="space-y-4">
                <div className="flex gap-2">
                  <span style={{ color: '#000000' }} className="font-bold bengali-text">
                    {language === 'bn' ? `${convertToBengaliNumber(i + 1)}।` : `${i + 1}.`}
                  </span>
                  <div style={{ color: '#000000' }} className="font-medium bengali-text">
                    <MathText text={q.question} />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-4 pl-6">
                  {Object.entries(q.options).map(([key, value]) => (
                    <div 
                      key={key} 
                      style={{ color: showAnswers && q.answer === key ? '#059669' : '#000000' }}
                      className={cn(
                        "flex items-start gap-2 bengali-text",
                        showAnswers && q.answer === key && "font-bold"
                      )}
                    >
                      <span style={{ color: '#008080' }}>({key})</span>
                      <div className="flex-1">
                        <MathText text={value} />
                      </div>
                      {showAnswers && q.answer === key && <CheckCircle2 size={14} className="mt-1 ml-1 shrink-0" />}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div style={{ borderTopColor: '#008080', color: '#008080' }} className="mt-20 pt-10 border-t text-center text-xs bengali-text">
            {t.footer}
          </div>
        </div>
      </div>
    </div>
  );
}
