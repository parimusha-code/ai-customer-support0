"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, Files, MessageSquare, Users, ArrowUpRight, Clock, ShieldCheck } from "lucide-react";
import Link from "next/link";

interface Stats {
  totalDocuments: number;
  totalSessions: number;
  activeUsers: number;
  recentDocuments: any[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(err => console.error(err));
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <Loader2 className="animate-spin text-purple-500" size={48} />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-gradient">Admin Command Center</h1>
            <p className="text-slate-500 mt-2 font-medium">Monitoring AI Support Infrastructure</p>
          </div>
          <Link href="/" className="px-6 py-2 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 transition-all text-sm font-bold">
            Back to Agent
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Knowledge Docs" 
            value={stats?.totalDocuments || 0} 
            icon={<Files size={24} />} 
            color="text-blue-400" 
            bg="bg-blue-500/10" 
          />
          <StatCard 
            title="Neural Sessions" 
            value={stats?.totalSessions || 0} 
            icon={<MessageSquare size={24} />} 
            color="text-purple-400" 
            bg="bg-purple-500/10" 
          />
          <StatCard 
            title="Active Handlers" 
            value={stats?.activeUsers || 0} 
            icon={<Users size={24} />} 
            color="text-emerald-400" 
            bg="bg-emerald-500/10" 
          />
          <StatCard 
            title="System Integrity" 
            value="100%" 
            icon={<ShieldCheck size={24} />} 
            color="text-orange-400" 
            bg="bg-orange-500/10" 
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Activity */}
          <div className="lg:col-span-8 glass-card rounded-3xl p-8 neon-glow-purple">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold">Recent Intelligence Syncs</h3>
              <BarChart3 className="text-slate-700" />
            </div>
            <div className="space-y-4">
              {stats?.recentDocuments.map((doc, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-slate-900/50 rounded-2xl border border-slate-800/50 group hover:border-purple-500/30 transition-all">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-slate-400">
                      <Files size={18} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-200">{doc.name}</p>
                      <p className="text-xs text-slate-500 uppercase tracking-widest mt-0.5">{doc.topic}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-xs text-slate-600 font-mono italic">
                      {new Date(doc.created_at).toLocaleDateString()}
                    </span>
                    <ArrowUpRight size={16} className="text-slate-700 group-hover:text-purple-400 transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* System Logs Placeholder */}
          <div className="lg:col-span-4 space-y-6">
            <div className="glass-card rounded-3xl p-8 border-l-4 border-l-blue-500">
              <h3 className="text-lg font-bold mb-6">Service Health</h3>
              <div className="space-y-6">
                <HealthItem label="Embedding Engine" status="Online" />
                <HealthItem label="Supabase Vector" status="Online" />
                <HealthItem label="OpenRouter API" status="Online" />
                <HealthItem label="Gemini 2.0 Core" status="Optimized" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-3xl p-8 relative overflow-hidden group">
              <div className="relative z-10">
                <h3 className="text-xl font-black text-white leading-tight">Scale Your <br /> Knowledge</h3>
                <p className="text-white/70 text-sm mt-4">Upgrade to Enterprise for unlimited docs and custom training.</p>
                <button className="mt-6 w-full py-3 bg-white text-slate-900 rounded-xl font-bold text-sm shadow-xl group-hover:scale-[1.02] transition-transform">
                  Explore Pro
                </button>
              </div>
              <div className="absolute top-[-20%] right-[-20%] w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color, bg }: any) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="glass-card p-6 rounded-3xl relative overflow-hidden"
    >
      <div className={`p-3 ${bg} ${color} rounded-2xl w-fit mb-4`}>
        {icon}
      </div>
      <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">{title}</p>
      <p className="text-3xl font-black mt-2 text-white">{value}</p>
      <div className="absolute right-[-10%] bottom-[-10%] opacity-5">
        {React.cloneElement(icon, { size: 100 })}
      </div>
    </motion.div>
  );
}

function HealthItem({ label, status }: any) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-400 text-sm font-medium">{label}</span>
      <div className="flex items-center space-x-2">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
        <span className="text-xs font-bold text-slate-300 uppercase tracking-tighter">{status}</span>
      </div>
    </div>
  );
}

function Loader2({ className, size }: any) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
  );
}
