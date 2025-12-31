import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDocuments } from '../context/DocumentContext';
import { ArrowLeft, User, Calendar, Tag, Info } from 'lucide-react';
import clsx from 'clsx';

export const Viewer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getDocument } = useDocuments();
  const navigate = useNavigate();
  const doc = id ? getDocument(id) : undefined;

  if (!doc) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-500">
        <p className="text-lg">Document not found.</p>
        <button onClick={() => navigate('/documents')} className="mt-4 text-blue-600 hover:underline">Go back</button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-8rem)] flex flex-col lg:flex-row gap-6">
      
      {/* Left Sidebar: Metadata */}
      <div className="lg:w-80 shrink-0 space-y-6 overflow-y-auto pr-2">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-sm text-slate-500 hover:text-slate-800 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </button>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Document Info</span>
            <h1 className="text-xl font-bold text-slate-900 mt-1">{doc.title}</h1>
          </div>
          
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <div className="flex items-center text-sm text-slate-600">
              <User className="w-4 h-4 mr-2 text-slate-400" />
              <span>{doc.author}</span>
            </div>
            <div className="flex items-center text-sm text-slate-600">
              <Calendar className="w-4 h-4 mr-2 text-slate-400" />
              <span>{new Date(doc.uploadDate).toLocaleDateString()}</span>
            </div>
             <div className="flex items-center text-sm text-slate-600">
              <Info className="w-4 h-4 mr-2 text-slate-400" />
              <span>Version {doc.version}</span>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Category</span>
            <span className="inline-block px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-medium border border-blue-100">
              {doc.category}
            </span>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block flex items-center">
              <Tag className="w-3 h-3 mr-1" /> Tags
            </span>
            <div className="flex flex-wrap gap-2">
              {doc.tags.map(tag => (
                <span key={tag} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded border border-slate-200">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {doc.summary && (
            <div className="pt-4 border-t border-slate-100">
               <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">AI Summary</span>
               <p className="text-sm text-slate-600 italic leading-relaxed">"{doc.summary}"</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Content: Doc Viewer */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
        <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 flex items-center justify-between">
           <span className="text-xs font-medium text-slate-500">Read Only Mode</span>
           <div className="flex space-x-2">
             <div className="w-3 h-3 rounded-full bg-red-400"></div>
             <div className="w-3 h-3 rounded-full bg-amber-400"></div>
             <div className="w-3 h-3 rounded-full bg-green-400"></div>
           </div>
        </div>
        
        {/* The Actual Content Container */}
        {/* We use dangerouslySetInnerHTML safely because the HTML comes from mammoth parsing of local files */}
        <div className="flex-1 overflow-y-auto p-8 doc-viewer bg-white">
          <div 
            className="prose prose-slate max-w-none prose-headings:font-bold prose-h1:text-2xl prose-h2:text-xl prose-a:text-blue-600"
            dangerouslySetInnerHTML={{ __html: doc.contentHtml }} 
          />
        </div>
      </div>
    </div>
  );
};
