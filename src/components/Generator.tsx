import React, { useState } from 'react';
import { 
  Wand2, 
  Upload, 
  FileText, 
  Hash, 
  Clock, 
  Target,
  ChevronRight,
  ChevronLeft,
  Download,
  Eye,
  RefreshCcw,
  Users,
  Binary
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI, Type } from "@google/genai";
import { Question } from '../types';
import { convertToBengaliNumber, cn } from '../lib/utils';
import QuestionPreview from './QuestionPreview';
import { useAppContext } from '../context/AppContext';
import { translations } from '../translations';

export default function Generator() {
  const { language } = useAppContext();
  const t = translations[language];
  
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<Question[] | null>(null);
  const [isMathMode, setIsMathMode] = useState(false);
  const [formData, setFormData] = useState({
    topic: '',
    className: '',
    marks: 100,
    duration: language === 'bn' ? '২ ঘণ্টা ৩০ মিনিট' : '2 hours 30 mins',
    quantity: 10,
    content: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'number' || name === 'quantity' ? Number(value) : value 
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData(prev => ({ ...prev, content: event.target?.result as string }));
        toast.success(language === 'bn' ? 'ফাইল সফলভাবে আপলোড হয়েছে' : 'File uploaded successfully');
      };
      reader.readAsText(file);
    }
  };

  const generateQuestions = async () => {
    if (!formData.topic || !formData.content) {
      toast.error(language === 'bn' ? 'অনুগ্রহ করে বিষয় এবং টেক্সট ইনপুট দিন' : 'Please provide topic and content');
      return;
    }

    setIsGenerating(true);
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("Gemini API key is not configured.");
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const prompt = `
        You are a professional academic examiner in Bangladesh.
        
        INPUT TEXT:
        """
        ${formData.content}
        """
        
        TASK:
        1. Analyze the input text. 
        2. If the input text already contains multiple-choice questions (MCQs) with options, extract them exactly as they are, but format them into the required JSON structure.
        3. If the input text is general content (like a textbook passage), generate ${formData.quantity} new MCQ questions based on it.
        
        RULES:
        - Topic: ${formData.topic}
        - Class/Exam: ${formData.className}
        - Language: ${language === 'bn' ? 'Formal academic Bangla (Suddho Bhasha)' : 'Standard English'}.
        - Format: 4 options per question labeled (ক), (খ), (গ), (ঘ) if Bangla, or (a), (b), (c), (d) if English.
        - Balanced difficulty (easy, medium, hard).
        - No repetition.
        - Concept-based questions.
        ${isMathMode ? `
        - MATH MODE ENABLED: 
          * Use LaTeX format for all mathematical equations, formulas, and matrices.
          * For matrices, use standard LaTeX matrix environments like \\begin{pmatrix} ... \\end{pmatrix}.
          * Ensure math symbols are wrapped in $...$ for inline or $$...$$ for block math.
          * Example matrix: $\\begin{pmatrix} 1 & 0 \\\\ 0 & 1 \\end{pmatrix}$
          * If the input contains math symbols, preserve them using LaTeX.
        ` : ''}
        - Return the result as a JSON array of objects.
        
        JSON Structure:
        [
          {
            "question": "Question text here (with LaTeX if math)",
            "options": {
              "${language === 'bn' ? 'ক' : 'a'}": "Option 1",
              "${language === 'bn' ? 'খ' : 'b'}": "Option 2",
              "${language === 'bn' ? 'গ' : 'c'}": "Option 3",
              "${language === 'bn' ? 'ঘ' : 'd'}": "Option 4"
            },
            "answer": "${language === 'bn' ? 'ক' : 'a'}"
          }
        ]
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                options: {
                  type: Type.OBJECT,
                  properties: {
                    [language === 'bn' ? "ক" : "a"]: { type: Type.STRING },
                    [language === 'bn' ? "খ" : "b"]: { type: Type.STRING },
                    [language === 'bn' ? "গ" : "c"]: { type: Type.STRING },
                    [language === 'bn' ? "ঘ" : "d"]: { type: Type.STRING }
                  },
                  required: [language === 'bn' ? "ক" : "a", language === 'bn' ? "খ" : "b", language === 'bn' ? "গ" : "c", language === 'bn' ? "ঘ" : "d"]
                },
                answer: { type: Type.STRING }
              },
              required: ["question", "options", "answer"]
            }
          }
        }
      });

      if (!response.text) {
        throw new Error("AI returned an empty response");
      }

      const questions = JSON.parse(response.text);
      
      if (!Array.isArray(questions) || questions.length === 0) {
        throw new Error("AI failed to generate a valid question array");
      }

      setGeneratedQuestions(questions);
      setStep(3);
      toast.success(language === 'bn' ? 'প্রশ্নপত্র সফলভাবে তৈরি হয়েছে!' : 'Question paper generated successfully!');
    } catch (error: any) {
      console.error('Generation Error:', error);
      toast.error(language === 'bn' ? `প্রশ্ন তৈরি করতে সমস্যা হয়েছে: ${error.message}` : `Error generating questions: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 bengali-text">{t.genTitle}</h1>
          <p className="text-slate-500 mt-1 bengali-text">{t.genDesc}</p>
        </div>
        <div className="flex items-center gap-2">
          {[1, 2, 3].map((s) => (
            <div 
              key={s}
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300",
                step === s ? "bg-primary text-white shadow-lg shadow-primary/20 scale-110" : 
                step > s ? "bg-emerald-500 text-white" : "bg-primary-light text-primary"
              )}
            >
              {language === 'bn' ? convertToBengaliNumber(s) : s}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-4 sm:p-8 space-y-6 bg-white  "
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 flex items-center gap-2 bengali-text">
                    <Target size={16} className="text-primary" />
                    {t.topicName}
                  </label>
                  <input 
                    type="text" 
                    name="topic"
                    value={formData.topic}
                    onChange={handleInputChange}
                    placeholder={t.topicPlaceholder} 
                    className="input-field bengali-text text-slate-900"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 flex items-center gap-2 bengali-text">
                    <Users size={16} className="text-primary" />
                    {language === 'bn' ? 'শ্রেণি / পরীক্ষার ধরন' : 'Class / Exam Type'}
                  </label>
                  <input 
                    type="text" 
                    name="className"
                    value={formData.className}
                    onChange={handleInputChange}
                    placeholder={t.classPlaceholder} 
                    className="input-field bengali-text text-slate-900"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 flex items-center gap-2 bengali-text">
                    <Hash size={16} className="text-primary" />
                    {t.marks}
                  </label>
                  <input 
                    type="number" 
                    name="marks"
                    value={formData.marks}
                    onChange={handleInputChange}
                    className="input-field bengali-text text-slate-900"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 flex items-center gap-2 bengali-text">
                    <Clock size={16} className="text-primary" />
                    {t.duration}
                  </label>
                  <input 
                    type="text" 
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    placeholder={t.durationPlaceholder} 
                    className="input-field bengali-text text-slate-900"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 flex items-center gap-2 bengali-text">
                    <FileText size={16} className="text-primary" />
                    {t.quantity}
                  </label>
                  <select 
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    className="input-field bengali-text text-slate-900"
                  >
                    <option value={10}>{language === 'bn' ? '১০ টি' : '10 Qs'}</option>
                    <option value={20}>{language === 'bn' ? '২০ টি' : '20 Qs'}</option>
                    <option value={30}>{language === 'bn' ? '৩০ টি' : '30 Qs'}</option>
                    <option value={50}>{language === 'bn' ? '৫০ টি' : '50 Qs'}</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 flex items-center gap-2 bengali-text">
                    <Binary size={16} className="text-primary" />
                    {t.mathMode}
                  </label>
                  <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg border border-slate-100">
                    <input 
                      type="checkbox" 
                      id="mathMode"
                      checked={isMathMode}
                      onChange={(e) => setIsMathMode(e.target.checked)}
                      className="w-5 h-5 accent-primary cursor-pointer"
                    />
                    <label htmlFor="mathMode" className="text-xs text-slate-500 cursor-pointer bengali-text">
                      {t.mathModeDesc}
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button 
                  onClick={() => setStep(2)}
                  className="btn-teal flex items-center gap-2 bengali-text"
                >
                  <span>{t.next}</span>
                  <ChevronRight size={18} />
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-4 sm:p-8 space-y-6 bg-white  "
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-slate-700 bengali-text">{t.textContent}</label>
                  <label className="cursor-pointer text-primary hover:text-primary-dark text-sm font-medium flex items-center gap-1.5 bengali-text">
                    <Upload size={16} />
                    {t.uploadFile}
                    <input type="file" accept=".txt" className="hidden" onChange={handleFileUpload} />
                  </label>
                </div>
                <textarea 
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  rows={12}
                  placeholder={t.contentPlaceholder}
                  className="input-field resize-none bengali-text text-slate-900"
                ></textarea>
                <p className="text-xs text-slate-400 bengali-text">
                  {t.aiNote}
                </p>
              </div>

              <div className="flex justify-between pt-4">
                <button 
                  onClick={() => setStep(1)}
                  className="px-6 py-2 rounded-lg border border-primary/20   text-primary   hover:bg-primary-light   font-medium flex items-center gap-2 bengali-text"
                >
                  <ChevronLeft size={18} />
                  <span>{t.prev}</span>
                </button>
                <button 
                  onClick={generateQuestions}
                  disabled={isGenerating}
                  className="btn-teal flex items-center gap-2 bengali-text"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCcw size={18} className="animate-spin" />
                      <span>{t.generating}</span>
                    </>
                  ) : (
                    <>
                      <Wand2 size={18} />
                      <span>{t.genButton}</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && generatedQuestions && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-8"
            >
              <QuestionPreview 
                questions={generatedQuestions} 
                meta={formData} 
                onReset={() => {
                  setStep(1);
                  setGeneratedQuestions(null);
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {isGenerating && (
        <div className="fixed inset-0 bg-white/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <div className="bg-white p-8 rounded-3xl shadow-2xl border border-slate-100 max-w-md w-full text-center space-y-6">
            <div className="relative w-24 h-24 mx-auto">
              <div className="absolute inset-0 border-4 border-primary/10 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Wand2 size={32} className="text-primary" />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 bengali-text">{t.genModalTitle}</h3>
              <p className="text-slate-600 mt-2 bengali-text">{t.genModalDesc}</p>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-primary"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 15, ease: "linear" }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
