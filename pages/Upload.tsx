import React, { useState, useRef } from 'react';
import { useDocuments } from '../context/DocumentContext';
import { CATEGORIES, DEPARTMENTS } from '../constants';
import { DocCategory } from '../types';
import { parseDocx } from '../utils/fileParser';
import { analyzeDocument } from '../services/geminiService';
import { UploadCloud, CheckCircle, X, Loader2, FileType } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Upload: React.FC = () => {
  const { addDocument } = useDocuments();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false); // For AI analysis
  const [meta, setMeta] = useState({
    title: '',
    category: 'General' as DocCategory,
    department: DEPARTMENTS[0],
    author: '',
    version: '1.0'
  });
  const [aiAnalysis, setAiAnalysis] = useState<{summary: string, tags: string[]} | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setMeta(prev => ({ ...prev, title: selectedFile.name.replace('.docx', '') }));
      
      // Auto-analyze
      setProcessing(true);
      try {
        const { rawText } = await parseDocx(selectedFile);
        const analysis = await analyzeDocument(rawText);
        setAiAnalysis(analysis);
      } catch (err) {
        console.error("Analysis failed", err);
      } finally {
        setProcessing(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    try {
      const { html, rawText } = await parseDocx(file);
      
      const newDoc = {
        id: crypto.randomUUID(),
        ...meta,
        uploadDate: new Date().toISOString(),
        tags: aiAnalysis ? aiAnalysis.tags : [],
        summary: aiAnalysis ? aiAnalysis.summary : undefined,
        contentHtml: html,
        rawText: rawText
      };

      addDocument(newDoc);
      navigate('/documents');
    } catch (error) {
      console.error("Upload failed", error);
      alert("Failed to process document.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Upload Document</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: File Drop & AI Status */}
        <div className="lg:col-span-1 space-y-6">
          <div 
            className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-colors cursor-pointer ${file ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'}`}
            onClick={() => fileInputRef.current?.click()}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept=".docx" 
              onChange={handleFileChange}
            />
            {file ? (
              <>
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-3">
                  <FileType className="w-6 h-6" />
                </div>
                <p className="font-medium text-slate-900 break-all">{file.name}</p>
                <p className="text-sm text-slate-500 mt-1">{(file.size / 1024).toFixed(0)} KB</p>
                <button 
                  onClick={(e) => { e.stopPropagation(); setFile(null); setAiAnalysis(null); }}
                  className="mt-4 text-xs text-red-500 hover:underline"
                >
                  Remove
                </button>
              </>
            ) : (
              <>
                <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mb-3">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <p className="font-medium text-slate-900">Click to upload</p>
                <p className="text-sm text-slate-500 mt-1">DOCX files only</p>
              </>
            )}
          </div>

          {/* AI Analysis Card */}
          {file && (
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center space-x-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse" />
                <span className="text-sm font-semibold text-slate-700">AI Analysis</span>
              </div>
              
              {processing ? (
                <div className="flex items-center space-x-2 text-sm text-slate-500 py-4">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating summary & tags...</span>
                </div>
              ) : aiAnalysis ? (
                <div className="space-y-3">
                   <div className="text-xs text-slate-600 bg-slate-50 p-2 rounded border border-slate-100">
                     <span className="font-medium block mb-1">Summary:</span>
                     {aiAnalysis.summary}
                   </div>
                   <div className="flex flex-wrap gap-2">
                     {aiAnalysis.tags.map(tag => (
                       <span key={tag} className="text-[10px] uppercase font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded-full border border-purple-100">
                         #{tag}
                       </span>
                     ))}
                   </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400">Waiting for analysis...</p>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Metadata Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Document Title</label>
                <input
                  type="text"
                  required
                  value={meta.title}
                  onChange={e => setMeta({...meta, title: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="e.g. Q4 Marketing Strategy"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                <select
                  value={meta.category}
                  onChange={e => setMeta({...meta, category: e.target.value as DocCategory})}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
                <select
                  value={meta.department}
                  onChange={e => setMeta({...meta, department: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                >
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Author</label>
                <input
                  type="text"
                  required
                  value={meta.author}
                  onChange={e => setMeta({...meta, author: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="e.g. John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Version</label>
                <input
                  type="text"
                  required
                  value={meta.version}
                  onChange={e => setMeta({...meta, version: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="e.g. 1.0"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={!file || loading}
                className={`px-6 py-2 rounded-lg font-medium text-white flex items-center space-x-2 transition-all ${!file || loading ? 'bg-slate-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-md'}`}
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                <span>{loading ? 'Processing...' : 'Upload Document'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
