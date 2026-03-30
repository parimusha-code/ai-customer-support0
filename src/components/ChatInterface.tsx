"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, User, Bot, Loader2, Info, ChevronLeft, ChevronRight, History, Download, Trash2, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface Message {
  role: "user" | "bot";
  content: string;
}

interface Session {
  id: string;
  title: string;
  created_at: string;
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    if (currentSessionId) {
      fetchMessages(currentSessionId);
    } else {
      setMessages([]);
    }
  }, [currentSessionId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchSessions = async () => {
    try {
      const res = await fetch("/api/chat/history");
      const data = await res.json();
      setSessions(data);
    } catch (err) {
      console.error("Failed to fetch sessions", err);
    }
  };

  const fetchMessages = async (sessionId: string) => {
    try {
      const res = await fetch(`/api/chat/messages?sessionId=${sessionId}`);
      const data = await res.json();
      setMessages(data.map((m: any) => ({ role: m.role, content: m.content })));
    } catch (err) {
      console.error("Failed to fetch messages", err);
    }
  };

  const createNewSession = async () => {
    try {
      const res = await fetch("/api/chat/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: `New Chat ${new Date().toLocaleTimeString()}` }),
      });
      const newSession = await res.json();
      setSessions([newSession, ...sessions]);
      setCurrentSessionId(newSession.id);
    } catch (err) {
      console.error("Failed to create session", err);
    }
  };

  const deleteSession = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await fetch(`/api/chat/history?id=${id}`, { method: "DELETE" });
      setSessions(sessions.filter(s => s.id !== id));
      if (currentSessionId === id) setCurrentSessionId(null);
    } catch (err) {
      console.error("Failed to delete session", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    let sessionId = currentSessionId;
    if (!sessionId) {
      // Auto-create session on first message
      const res = await fetch("/api/chat/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: input.trim().substring(0, 30) + "..." }),
      });
      const newSession = await res.json();
      sessionId = newSession.id;
      setCurrentSessionId(sessionId);
      setSessions([newSession, ...sessions]);
    }

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage, sessionId }),
      });

      if (!res.ok) throw new Error("Chat failed");

      const data = await res.json();
      setMessages((prev) => [...prev, { role: "bot", content: data.reply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "bot", content: "Sorry, I'm having trouble connecting right now." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const exportPDF = async () => {
    if (!chatContainerRef.current) return;
    const canvas = await html2canvas(chatContainerRef.current);
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save("chat-history.pdf");
  };

  return (
    <div className="relative w-full flex bg-slate-950/50 rounded-[2rem] border border-slate-800/50 overflow-hidden glass shadow-2xl h-[700px]">
      {/* Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            className="absolute lg:relative z-30 w-[280px] h-full bg-slate-900/90 backdrop-blur-2xl border-r border-slate-800 p-6 flex flex-col"
          >
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-purple-400">Memory Bank</h3>
              <button 
                onClick={() => setIsSidebarOpen(false)}
                className="lg:hidden p-1 hover:bg-slate-800 rounded-md"
              >
                <ChevronLeft size={16} />
              </button>
            </div>

            <button 
              onClick={createNewSession}
              className="w-full flex items-center justify-center space-x-2 py-3 bg-purple-600 hover:bg-purple-500 rounded-xl font-bold text-sm transition-all mb-6 shadow-lg shadow-purple-900/20"
            >
              <Plus size={16} />
              <span>New Intelligence</span>
            </button>

            <div className="flex-1 overflow-y-auto space-y-2 scrollbar-hide">
              {sessions.map((s) => (
                <div 
                  key={s.id}
                  onClick={() => setCurrentSessionId(s.id)}
                  className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${
                    currentSessionId === s.id ? "bg-purple-500/20 border border-purple-500/30 text-purple-300" : "hover:bg-slate-800 text-slate-400"
                  }`}
                >
                  <div className="flex items-center space-x-3 overflow-hidden">
                    <History size={14} className={currentSessionId === s.id ? "text-purple-400" : "text-slate-600"} />
                    <span className="text-sm truncate font-medium">{s.title}</span>
                  </div>
                  <button 
                    onClick={(e) => deleteSession(e, s.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-opacity"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col h-full min-w-0">
        {/* Header */}
        <div className="p-5 border-b border-slate-800/50 flex items-center justify-between glass-card rounded-none">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-slate-800 rounded-xl transition-colors text-slate-400"
            >
              <History size={20} />
            </button>
            <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-400 neon-border">
              <Bot size={22} />
            </div>
            <div>
              <h2 className="font-bold text-slate-100 uppercase tracking-wider text-sm">Neural Core</h2>
              <div className="flex items-center text-[10px] text-purple-400 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mr-2 animate-pulse shadow-[0_0_8px_rgba(168,85,247,0.8)]"></span>
                ACTIVE PROTOCOL
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={exportPDF}
              className="p-2.5 bg-slate-800/50 hover:bg-slate-800 rounded-xl text-slate-400 transition-all border border-slate-700/50"
              title="Export Intelligence"
            >
              <Download size={18} />
            </button>
            <button className="p-2.5 bg-slate-800/50 hover:bg-slate-800 rounded-xl text-slate-400 transition-all border border-slate-700/50">
              <Info size={18} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth scrollbar-thin scrollbar-thumb-slate-800"
        >
          <div ref={chatContainerRef} className="space-y-6">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-6 opacity-30 py-20">
                <div className="p-6 bg-slate-900 rounded-full border border-slate-800">
                  <Bot size={48} className="text-slate-700" />
                </div>
                <div className="space-y-2">
                  <p className="text-slate-300 font-bold uppercase tracking-widest text-xs">Awaiting Input</p>
                  <p className="text-slate-500 text-sm max-w-xs">Initialize a new dialogue stream to begin knowledge extraction.</p>
                </div>
              </div>
            )}
            
            <AnimatePresence initial={false}>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.98, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`flex max-w-[85%] items-start space-x-3 ${msg.role === "user" ? "flex-row-reverse space-x-reverse" : "flex-row"}`}>
                    <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center border ${
                      msg.role === "user" ? "bg-slate-800 border-slate-700" : "bg-purple-950/30 border-purple-500/30 text-purple-400"
                    }`}>
                      {msg.role === "user" ? <User size={14} /> : <Bot size={14} />}
                    </div>
                    <div className={`p-4 rounded-[1.5rem] text-sm leading-relaxed shadow-sm ${
                      msg.role === "user" 
                        ? "bg-slate-800 text-slate-100 rounded-tr-none" 
                        : "bg-slate-900/60 border border-slate-800 text-slate-200 rounded-tl-none neon-glow-purple"
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex justify-start"
            >
              <div className="bg-slate-900/60 p-4 rounded-2xl rounded-tl-none border border-slate-800 neon-glow-purple">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="p-6 bg-slate-900/40 border-t border-slate-800/50">
          <div className="relative flex items-center group">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Query the knowledge core..."
              className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl py-4 pl-5 pr-14 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all group-hover:border-slate-700"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="absolute right-2.5 p-2.5 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-800 disabled:text-slate-600 rounded-xl text-white transition-all shadow-lg shadow-purple-900/20"
            >
              <Send size={18} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
