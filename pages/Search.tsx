import React, { useState } from 'react';
import { useDocuments } from '../context/DocumentContext';
import { searchWithAI } from '../services/geminiService';
import { Search as SearchIcon, Sparkles, ArrowRight, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Search: React.FC = () => {
  const { documents } = useDocuments();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [results, setResults] = useState<{ doc: any, score: number }[]>([]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    setAiAnswer(null);

    // 1. Basic Local Filtering (Simulated Vector/Keyword Search)
    const keywords = query.toLowerCase().split(' ');
    const candidates = documents.filter(doc => {
      const text = (doc.title + ' ' + doc.rawText + ' ' + doc.tags.join(' ')).toLowerCase();
      return keywords.some(k => text.includes(k));
    });

    // Rank candidates by simple occurrence count
    const ranked = candidates.map(doc => {
      const text = (doc.title + ' ' + doc.rawText).toLowerCase();
      const score = keywords.reduce((acc, k) => acc + (text.split(k).length - 1), 0);
      return { doc, score };
    }).sort((a, b) => b.score - a.score).slice(0, 5); // Take top 5

    setResults(ranked);

    // 2. AI Enhancement (RAG)
    // If we have candidates, ask Gemini to answer based on them.
    if (ranked.length > 0) {
      const topDocs = ranked.map(r => r.doc);
      const { answer } = await searchWithAI(query, topDocs);
      setAiAnswer(answer);
    } else {
        setAiAnswer("I couldn't find any documents matching your specific keywords to analyze.");
    }

    setIsSearching(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="text-center space-y-4 py-8">
        <h1 className="text-3xl font-bold text-slate-900">Intelligent Search</h1>
        <p className="text-slate-500 max-w-2xl mx-auto">
          Ask questions naturally. Our AI engine scans through SRS, Technical Specs, and Integration Docs to find exact answers and references.
        </p>
      </div>

      <div className="relative max-w-2xl mx-auto">
        <form onSubmit={handleSearch} className="relative z-10">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <SearchIcon className="h-6 w-6 text-slate-400" />
          </div>
          <input
            type="text"
            className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 shadow-lg text-lg outline-none transition-all"
            placeholder="e.g. How do I integrate the Stripe payment gateway?"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button 
            type="submit"
            disabled={isSearching}
            className="absolute right-3 top-2.5 bottom-2.5 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors disabled:bg-slate-300"
          >
            {isSearching ? 'Thinking...' : 'Search'}
          </button>
        </form>
        {/* Decorative blur behind search */}
        <div className="absolute inset-0 -z-10 bg-blue-500/20 blur-3xl rounded-full transform scale-90 translate-y-4"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12">
        {/* Left: Search Results List */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-lg font-semibold text-slate-800 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-slate-500" />
            Found Documents
          </h2>
          {results.length > 0 ? (
            <div className="space-y-3">
              {results.map(({ doc }) => (
                <div 
                  key={doc.id}
                  onClick={() => navigate(`/documents/${doc.id}`)}
                  className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 cursor-pointer transition-all group"
                >
                  <h3 className="font-medium text-slate-900 group-hover:text-blue-600 transition-colors">{doc.title}</h3>
                  <div className="flex items-center space-x-2 mt-2 text-xs text-slate-500">
                    <span className="bg-slate-100 px-2 py-0.5 rounded">{doc.category}</span>
                    <span>•</span>
                    <span>{new Date(doc.uploadDate).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
              No documents found
            </div>
          )}
        </div>

        {/* Right: AI Answer */}
        <div className="lg:col-span-2">
            <h2 className="text-lg font-semibold text-slate-800 flex items-center mb-4">
                <Sparkles className="w-5 h-5 mr-2 text-purple-600" />
                AI Generated Answer
            </h2>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
                <div className="p-8">
                    {isSearching ? (
                        <div className="flex flex-col items-center justify-center py-12 space-y-4">
                            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-slate-500 animate-pulse">Analyzing documents...</p>
                        </div>
                    ) : aiAnswer ? (
                        <div className="prose prose-slate max-w-none">
                            <p className="text-lg leading-relaxed text-slate-700">{aiAnswer}</p>
                            
                            {results.length > 0 && (
                                <div className="mt-6 pt-6 border-t border-slate-100">
                                    <h4 className="text-sm font-semibold text-slate-900 mb-2">Sources:</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {results.slice(0,3).map(({doc}) => (
                                            <button 
                                                key={doc.id}
                                                onClick={() => navigate(`/documents/${doc.id}`)}
                                                className="text-xs bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 px-3 py-1.5 rounded-full transition-colors flex items-center"
                                            >
                                                {doc.title}
                                                <ArrowRight className="w-3 h-3 ml-1" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="py-12 text-center text-slate-400">
                            Perform a search to see an AI-synthesized answer here.
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
