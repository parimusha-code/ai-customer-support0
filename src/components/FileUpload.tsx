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

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setFileName(file.name);
    setStatus("uploading");

    const formData = new FormData();
    formData.append("file", file);

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
  }, [onUploadComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "text/plain": [".txt"],
    },
    multiple: false,
  });

  return (
    <div className="w-full max-w-xl mx-auto mb-12">
      <div
        {...getRootProps()}
        className={`relative group cursor-pointer p-8 rounded-2xl border-2 border-dashed transition-all duration-300 ${
          isDragActive
            ? "border-blue-500 bg-blue-500/10 shadow-[0_0_20px_rgba(59,130,246,0.2)]"
            : "border-slate-700 hover:border-slate-500 bg-slate-900/50 hover:bg-slate-900/80"
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <AnimatePresence mode="wait">
            {status === "uploading" ? (
              <motion.div
                key="uploading"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="p-4 bg-blue-500/20 rounded-full"
              >
                <Loader2 className="w-10 h-10 text-blue-400 animate-spin" />
              </motion.div>
            ) : status === "success" ? (
              <motion.div
                key="success"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="p-4 bg-emerald-500/20 rounded-full"
              >
                <CheckCircle className="w-10 h-10 text-emerald-400" />
              </motion.div>
            ) : (
              <motion.div
                key="idle"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className={`p-4 rounded-full transition-colors ${
                  isDragActive ? "bg-blue-500/20" : "bg-slate-800"
                }`}
              >
                <Upload className={`w-10 h-10 ${isDragActive ? "text-blue-400" : "text-slate-400"}`} />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-slate-100">
              {status === "uploading" ? "Analyzing Document..." : 
               status === "success" ? "Ready to Chat!" : 
               "Upload Knowledge Base"}
            </h3>
            <p className="text-slate-400 max-w-xs">
              {fileName || "Drag & drop your PDF or TXT file here to train your AI agent."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
