"use client";

import { useState } from "react";
import FileUpload from "@/components/FileUpload";
import ChatInterface from "@/components/ChatInterface";
import { motion } from "framer-motion";

export default function Home() {
  const [docId, setDocId] = useState<string | null>(null);

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
              <FileUpload onUploadComplete={(id) => setDocId(id)} />
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
