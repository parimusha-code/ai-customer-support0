"use client";

import { useState } from "react";
import FileUpload from "@/components/FileUpload";
import ChatInterface from "@/components/ChatInterface";
import { motion } from "framer-motion";

export default function Home() {
  const [docId, setDocId] = useState<string | null>(null);

  return (
    <main className="min-h-screen relative overflow-hidden flex flex-col items-center py-16 px-4">
      {/* Background Glow */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-purple-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob animation-delay-2000"></div>
      
      <div className="z-10 w-full max-w-6xl">
        <header className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block mb-4 px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-xs font-medium tracking-wider uppercase"
          >
            Powered by Next.js & Gemini
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent"
          >
            AI Customer <br /> Support Agent
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed"
          >
            Build a custom knowledge base in seconds. Upload documents and interact with an AI that answers <span className="text-blue-400 font-semibold underline decoration-blue-400/30 underline-offset-4">only</span> from your data.
          </motion.p>
        </header>

        <section className="space-y-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <FileUpload onUploadComplete={(id) => setDocId(id)} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <ChatInterface />
          </motion.div>
        </section>

        <footer className="mt-20 text-center text-slate-500 text-sm">
          <p>© 2026 AI Customer Support Agent • Built with precision.</p>
        </footer>
      </div>
    </main>
  );
}
