import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDocuments } from '../context/DocumentContext';
import { ArrowLeft, User, Calendar, Tag, Info, AlertCircle, Maximize2, Download } from 'lucide-react';
import { renderAsync } from 'docx-preview';

export const Viewer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getDocument } = useDocuments();
  const navigate = useNavigate();
  const doc = id ? getDocument(id) : undefined;
  
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loading, setLoading] = useState(true);

  // Helper to convert base64 to Blob
  const getDocBlob = (base64Data: string) => {
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], {type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'});
  };

  const handleDownload = () => {
    if (!doc?.fileData) return;
    try {
      const blob = getDocBlob(doc.fileData);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${doc.title}.docx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (e) {
      console.error("Download failed:", e);
      alert("Failed to download document.");
    }
  };

  const handleFullscreen = () => {
    if (iframeRef.current) {
      if (iframeRef.current.requestFullscreen) {
        iframeRef.current.requestFullscreen();
      }
    }
  };

  useEffect(() => {
    const renderDoc = async () => {
      if (!doc || !iframeRef.current) return;
      
      setLoading(true);
      const iframe = iframeRef.current;
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;

      if (!iframeDoc) return;

      // 1. Initialize Iframe Environment (CSS Reset & Viewer Styles)
      iframeDoc.open();
      iframeDoc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body {
                margin: 0;
                padding: 40px;
                background-color: #f1f5f9; /* Slate 100 */
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                display: flex;
                flex-direction: column;
                align-items: center;
                min-height: 100vh;
              }
              
              /* Docx Preview Overrides for "Paper" Look */
              .docx-wrapper {
                background: transparent !important;
                padding: 0 !important;
                width: 100%;
                display: flex;
                flex-direction: column;
                align-items: center;
              }
              
              .docx-wrapper > section.docx {
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.06) !important;
                background: white !important;
                margin-bottom: 40px !important;
                padding: 40px !important; /* Internal padding of the page */
              }

              /* Mock Content Fallback Styles */
              .mock-content {
                background: white;
                padding: 60px;
                max-width: 800px;
                width: 100%;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                border-radius: 4px;
              }
              .mock-content h1 { font-size: 24pt; color: #2e2e2e; margin-bottom: 0.5em; }
              .mock-content h2 { font-size: 18pt; color: #2e2e2e; margin-top: 1em; margin-bottom: 0.5em; }
              .mock-content p { font-size: 11pt; line-height: 1.5; color: #333; margin-bottom: 1em; }
              .mock-content ul { padding-left: 20px; }
              .mock-content li { margin-bottom: 0.5em; }
            </style>
          </head>
          <body></body>
        </html>
      `);
      iframeDoc.close();

      // 2. Render Content
      try {
        if (doc.fileData) {
          // Real DOCX Rendering
          const blob = getDocBlob(doc.fileData);
          
          // Render into body, but inject styles into head
          await renderAsync(blob, iframeDoc.body, iframeDoc.head, {
            className: 'docx',
            inWrapper: true,
            ignoreWidth: false, // Use width from docx
            ignoreHeight: false
          });
        } else if (doc.contentHtml) {
          // Mock Data Rendering
          const div = iframeDoc.createElement('div');
          div.className = 'mock-content';
          div.innerHTML = doc.contentHtml;
          iframeDoc.body.appendChild(div);
        }
      } catch (err) {
        console.error("Rendering failed:", err);
        const errDiv = iframeDoc.createElement('div');
        errDiv.style.color = 'red';
        errDiv.innerText = 'Failed to render document.';
        iframeDoc.body.appendChild(errDiv);
      } finally {
        setLoading(false);
      }
    };

    renderDoc();
  }, [doc]);

  if (!doc) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-500">
        <p className="text-lg">Document not found.</p>
        <button onClick={() => navigate('/documents')} className="mt-4 text-blue-600 hover:underline">Go back</button>
      </div>
    );
  }

  return (
    <div className="max-w-[1800px] mx-auto h-[calc(100vh-6rem)] flex flex-col lg:flex-row gap-6">
      
      {/* Left Sidebar: Metadata */}
      <div className="lg:w-80 shrink-0 space-y-6 overflow-y-auto pr-2 custom-scrollbar">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-sm text-slate-500 hover:text-slate-800 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to List
        </button>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Document Info</span>
            <h1 className="text-xl font-bold text-slate-900 mt-1 leading-snug">{doc.title}</h1>
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

      {/* Main Content: Iframe Viewer */}
      <div className="flex-1 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden flex flex-col relative">
        {/* Viewer Toolbar */}
        <div className="bg-slate-800 text-white px-4 py-3 flex items-center justify-between shrink-0 shadow-md z-10">
           <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-slate-300">Read Only Mode</span>
              <span className="h-4 w-px bg-slate-600"></span>
              <span className="text-xs text-slate-400 truncate max-w-[200px]">{doc.title}.docx</span>
           </div>
           <div className="flex items-center space-x-4">
             {doc.fileData && (
               <button 
                onClick={handleDownload}
                className="text-slate-400 hover:text-white transition-colors" 
                title="Download"
               >
                 <Download className="w-5 h-5" />
               </button>
             )}
             <button 
              onClick={handleFullscreen}
              className="text-slate-400 hover:text-white transition-colors" 
              title="Fullscreen"
             >
               <Maximize2 className="w-5 h-5" />
             </button>
           </div>
        </div>
        
        <div className="flex-1 relative bg-slate-100">
          {loading && (
             <div className="absolute inset-0 flex items-center justify-center bg-white z-20">
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
             </div>
          )}
          {/* Iframe acts as the isolated viewer frame */}
          <iframe 
            ref={iframeRef} 
            className="w-full h-full border-0 block" 
            title="Document Viewer"
            sandbox="allow-same-origin allow-scripts"
          />
        </div>
      </div>
    </div>
  );
};