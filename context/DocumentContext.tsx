import React, { createContext, useContext, useState, useEffect } from 'react';
import { DocumentData, DocumentMeta } from '../types';
import { MOCK_DOCUMENTS } from '../constants';

interface DocumentContextType {
  documents: DocumentData[];
  addDocument: (doc: DocumentData) => void;
  deleteDocument: (id: string) => void;
  getDocument: (id: string) => DocumentData | undefined;
}

const DocumentContext = createContext<DocumentContextType | undefined>(undefined);

export const DocumentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [documents, setDocuments] = useState<DocumentData[]>([]);

  // Load mock data on init
  useEffect(() => {
    setDocuments(MOCK_DOCUMENTS);
  }, []);

  const addDocument = (doc: DocumentData) => {
    setDocuments(prev => [doc, ...prev]);
  };

  const deleteDocument = (id: string) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
  };

  const getDocument = (id: string) => {
    return documents.find(d => d.id === id);
  };

  return (
    <DocumentContext.Provider value={{ documents, addDocument, deleteDocument, getDocument }}>
      {children}
    </DocumentContext.Provider>
  );
};

export const useDocuments = () => {
  const context = useContext(DocumentContext);
  if (!context) {
    throw new Error('useDocuments must be used within a DocumentProvider');
  }
  return context;
};
