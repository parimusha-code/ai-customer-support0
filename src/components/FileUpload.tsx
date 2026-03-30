"use client";

import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, CheckCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FileUploadProps {
  onUploadComplete: (docId: string) => void;
}

export default function FileUpload({ onUploadComplete }: FileUploadProps) {
  const [status, setStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [fileName, setFileName] = useState<string>("");
  const [topic, setTopic] = useState<string>("General");

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setFileName(file.name);
    setStatus("uploading");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("topic", topic);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      setStatus("success");
      onUploadComplete(data.documentId);
      
      setTimeout(() => {
        setStatus("idle");
        setFileName("");
      }, 3000);
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  }, [onUploadComplete, topic]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "text/plain": [".txt"],
    },
    multiple: false,
  });

  return (
    <div className="w-full space-y-4">
      <div className="space-y-2">
        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">
          Knowledge Base Topic
        </label>
        <input 
          type="text" 
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g. Technical Support, HR, Sales"
          className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all mb-2"
        />
      </div>

      <div
        {...getRootProps()}
        className={`relative group cursor-pointer p-10 rounded-2xl border-2 border-dashed transition-all duration-500 overflow-hidden ${
          isDragActive
            ? "border-purple-500 bg-purple-500/10 shadow-[0_0_30px_rgba(168,85,247,0.2)] scale-[1.01]"
            : "border-slate-800 hover:border-slate-700 bg-slate-900/30 hover:bg-slate-900/50"
        }`}
      >
        <input {...getInputProps()} />
        
        {/* Animated Background Mesh */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-500/5 via-transparent to-transparent"></div>
        </div>

        <div className="relative flex flex-col items-center justify-center space-y-4 text-center">
          <AnimatePresence mode="wait">
            {status === "uploading" ? (
              <motion.div
                key="uploading"
                initial={{ scale: 0.8, opacity: 0, rotate: 0 }}
                animate={{ scale: 1, opacity: 1, rotate: 360 }}
                transition={{ rotate: { repeat: Infinity, duration: 2, ease: "linear" } }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="p-4 bg-purple-500/20 rounded-full"
              >
                <Loader2 className="w-10 h-10 text-purple-400" />
              </motion.div>
            ) : status === "success" ? (
              <motion.div
                key="success"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="p-4 bg-emerald-500/20 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.2)]"
              >
                <CheckCircle className="w-10 h-10 text-emerald-400" />
              </motion.div>
            ) : (
              <motion.div
                key="idle"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className={`p-4 rounded-2xl transition-all duration-500 ${
                  isDragActive ? "bg-purple-500/20 shadow-[0_0_20px_rgba(168,85,247,0.3)]" : "bg-slate-800/50"
                }`}
              >
                <Upload className={`w-10 h-10 ${isDragActive ? "text-purple-400" : "text-slate-500"}`} />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white tracking-tight">
              {status === "uploading" ? "Processing Engine..." : 
               status === "success" ? "Network Synced!" : 
               "Drop Document"}
            </h3>
            <p className="text-slate-500 text-xs font-medium uppercase tracking-widest">
              {fileName || "PDF or TXT required"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
