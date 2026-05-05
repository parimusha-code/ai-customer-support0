"use client";

import React, { useState, useEffect } from "react";
import { FileText, Trash2, Loader2, Database, Calendar, Tag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Document {
  id: string;
  name: string;
  topic: string;
  created_at: string;
}

interface DocumentLibraryProps {
  refreshTrigger?: number;
}

export default function DocumentLibrary({ refreshTrigger = 0 }: DocumentLibraryProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchDocuments();
  }, [refreshTrigger]);

  const fetchDocuments = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/documents");
      if (!res.ok) throw new Error("Failed to fetch documents");
      const data = await res.json();
      setDocuments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching documents:", err);
      setDocuments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteDocument = async (id: string) => {
    try {
      setIsDeleting(id);
      const res = await fetch(`/api/documents?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete document");
      setDocuments(documents.filter((doc) => doc.id !== id));
    } catch (err) {
      console.error("Error deleting document:", err);
    } finally {
      setIsDeleting(null);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Database size={18} className="text-purple-400" />
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-300">Knowledge Library</h3>
        </div>
        <span className="text-[10px] bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded-full border border-purple-500/20 font-bold">
          {documents.length} Units
        </span>
      </div>

      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-800">
        <AnimatePresence mode="popLayout">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-3 opacity-50">
              <Loader2 className="animate-spin text-purple-500" size={24} />
              <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Accessing Data...</p>
            </div>
          ) : documents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-3 bg-slate-900/40 rounded-2xl border border-dashed border-slate-800">
              <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center border border-slate-800">
                <FileText size={20} className="text-slate-700" />
              </div>
              <p className="text-[10px] uppercase tracking-widest text-slate-600 font-bold">Library Empty</p>
            </div>
          ) : (
            documents.map((doc) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="group relative p-4 bg-slate-900/60 hover:bg-slate-900/90 border border-slate-800/50 hover:border-purple-500/30 rounded-2xl transition-all duration-300"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="mt-1 w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                      <FileText size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-200 truncate max-w-[200px]">{doc.name}</h4>
                      <div className="flex items-center space-x-3 mt-1.5">
                        <div className="flex items-center text-[10px] text-slate-500 font-medium">
                          <Tag size={10} className="mr-1" />
                          {doc.topic || "General"}
                        </div>
                        <div className="flex items-center text-[10px] text-slate-500 font-medium">
                          <Calendar size={10} className="mr-1" />
                          {formatDate(doc.created_at)}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => deleteDocument(doc.id)}
                    disabled={isDeleting === doc.id}
                    className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                  >
                    {isDeleting === doc.id ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Trash2 size={16} />
                    )}
                  </button>
                </div>

                {/* Status Indicator */}
                <div className="absolute top-2 right-2 flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
                  <span className="text-[8px] font-black uppercase tracking-tighter text-green-500/80">Indexed</span>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
