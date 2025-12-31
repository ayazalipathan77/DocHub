import React, { useState } from 'react';
import { useDocuments } from '../context/DocumentContext';
import { useNavigate } from 'react-router-dom';
import { FileText, Filter, Search } from 'lucide-react';
import { CATEGORIES, DEPARTMENTS } from '../constants';

export const DocumentList: React.FC = () => {
  const { documents } = useDocuments();
  const navigate = useNavigate();
  const [filterText, setFilterText] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const filtered = documents.filter(doc => {
    const matchesText = doc.title.toLowerCase().includes(filterText.toLowerCase());
    const matchesCat = categoryFilter ? doc.category === categoryFilter : true;
    return matchesText && matchesCat;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-800">All Documents</h1>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Filter by name..." 
              className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none w-full sm:w-64"
              value={filterText}
              onChange={e => setFilterText(e.target.value)}
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <select
              className="pl-9 pr-8 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none appearance-none bg-white w-full sm:w-48"
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
            >
              <option value="">All Categories</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filtered.map(doc => (
          <div 
            key={doc.id} 
            className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all group flex flex-col"
          >
            <div className="p-5 flex-1">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <span className="text-xs font-medium px-2 py-1 bg-slate-100 text-slate-600 rounded-full">
                  {doc.category}
                </span>
              </div>
              <h3 className="font-semibold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                {doc.title}
              </h3>
              <p className="text-sm text-slate-500 line-clamp-2 mb-4">
                {doc.summary || doc.rawText.substring(0, 100)}...
              </p>
              
              <div className="flex flex-wrap gap-2 mt-auto">
                {doc.tags.slice(0, 3).map(tag => (
                  <span key={tag} className="text-[10px] text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="px-5 py-3 border-t border-slate-50 bg-slate-50/50 flex justify-between items-center rounded-b-xl">
              <div className="text-xs text-slate-500">
                <span className="font-medium text-slate-700">{doc.author}</span>
                <span className="mx-1">•</span>
                {new Date(doc.uploadDate).toLocaleDateString()}
              </div>
              <button 
                onClick={() => navigate(`/documents/${doc.id}`)}
                className="text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                Open
              </button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-400">
            No documents found matching your filters.
          </div>
        )}
      </div>
    </div>
  );
};
