"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Trash2, Loader2, Database, Calendar, Tag } from "lucide-react";
import FileUpload from "@/components/FileUpload";
import ChatInterface from "@/components/ChatInterface";

export default function Home() {
  const [docId, setDocId] = useState<string | null>(null);
  const [libraryRefresh, setLibraryRefresh] = useState(0);
  const [documents, setDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchDocuments();
  }, [libraryRefresh]);

  const fetchDocuments = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/documents");
      if (!res.ok) throw new Error("Failed to fetch documents");
      const data = await res.json();
      console.log("Documents fetched from API:", data);
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
      setLibraryRefresh(prev => prev + 1);
    } catch (err) {
      console.error("Error deleting document:", err);
    } finally {
      setIsDeleting(null);
    }
  };

  const handleUploadComplete = (id: string) => {
    setDocId(id);
    setLibraryRefresh(prev => prev + 1);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <main className="min-h-screen relative overflow-hidden flex flex-col items-center py-12 px-4 bg-slate-950">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px] animate-blob"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] animate-blob animation-delay-2000"></div>
      <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-indigo-600/10 rounded-full blur-[100px] animate-blob animation-delay-4000"></div>
      
      <div className="z-10 w-full max-w-6xl flex flex-col items-center">
        <header className="text-center mb-16 relative">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center space-x-2 mb-6 px-4 py-1.5 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-full"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
            </span>
            <span className="text-purple-400 text-[10px] font-bold tracking-widest uppercase">
              Next-Gen AI Support
            </span>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-tight"
          >
            <span className="text-gradient">Intelligent</span> <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">Knowledge Agent</span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-slate-400 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed font-light"
          >
            Transform your static documents into a dynamic, conversational knowledge base. 
            Upload PDFs or TXT files and get precise answers powered by <span className="text-white font-medium">Gemini 2.0</span>.
          </motion.p>
        </header>

        <section className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-5 space-y-6"
          >
            <div className="glass-card p-8 rounded-3xl neon-glow-purple">
              <h2 className="text-2xl font-bold mb-4 text-white">Train Your Agent</h2>
              <p className="text-slate-400 text-sm mb-6">
                Drag and drop your company docs or guides here. We'll chunk and embed them for lightning-fast retrieval.
              </p>
              <FileUpload onUploadComplete={handleUploadComplete} />
            </div>

            <div className="glass-card p-8 rounded-3xl neon-glow-purple">
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-500/20 rounded-lg">
                      <Database size={20} className="text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-100 uppercase tracking-widest">Knowledge Base</h3>
                      <p className="text-[10px] text-slate-500 font-medium">INDEXED INTELLIGENCE</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-1 rounded-md border border-slate-700 font-bold">
                      {documents.length} Units
                    </span>
                  </div>
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
            </div>
            
            <div className="glass-card p-6 rounded-2xl flex items-center space-x-4 border-l-4 border-l-purple-500">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              <div>
                <h4 className="font-semibold text-white">Private & Secure</h4>
                <p className="text-xs text-slate-500 text-balance">Your data is only used for your specific agent and never shared.</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="lg:col-span-7"
          >
            <ChatInterface />
          </motion.div>
        </section>

        <footer className="mt-24 pb-12 text-center">
          <div className="flex items-center justify-center space-x-6 text-slate-600 text-sm font-medium mb-4">
            <span className="hover:text-purple-400 transition-colors cursor-pointer">Support</span>
            <span className="w-1 h-1 rounded-full bg-slate-800"></span>
            <span className="hover:text-purple-400 transition-colors cursor-pointer">Privacy</span>
            <span className="w-1 h-1 rounded-full bg-slate-800"></span>
            <span className="hover:text-purple-400 transition-colors cursor-pointer">Terms</span>
          </div>
          <p className="text-slate-700 text-[10px] tracking-[0.2em] uppercase">© 2026 AI Customer Support Agent • Beta</p>
        </footer>
      </div>
    </main>
  );
}
