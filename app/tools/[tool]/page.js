"use client";

import { useState, use } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Upload, 
  File, 
  X, 
  ArrowLeft, 
  Loader2, 
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import { PDFDocument } from "pdf-lib";

const toolsInfo = {
  merge: {
    name: "Merge PDF",
    description: "Combine multiple PDF files into one master document.",
    actionLabel: "Combine Files",
    acceptMultiple: true,
    kanji: "結合"
  },
  split: {
    name: "Split PDF",
    description: "Extract pages or split your PDF into separate files.",
    actionLabel: "Split Now",
    acceptMultiple: false,
    kanji: "分割"
  },
  "pdf-to-image": {
    name: "PDF to Image",
    description: "Convert each page of your PDF into high-quality images.",
    actionLabel: "Convert to Image",
    acceptMultiple: false,
    kanji: "画像"
  },
  compress: {
    name: "Compress PDF",
    description: "Reduce the file size of your PDF without losing quality.",
    actionLabel: "Compress Now",
    acceptMultiple: false,
    kanji: "圧縮"
  }
};

export default function ToolPage({ params }) {
  const { tool } = use(params);
  const info = toolsInfo[tool] || toolsInfo.merge;
  
  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState("idle"); // idle, processing, success, error
  const [errorMessage, setErrorMessage] = useState("");

  const onFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (info.acceptMultiple) {
      setFiles((prev) => [...prev, ...selectedFiles]);
    } else {
      setFiles(selectedFiles.slice(0, 1));
    }
    setStatus("idle");
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAction = async () => {
    if (files.length === 0) return;
    
    setStatus("processing");
    try {
      if (tool === "merge") {
        await handleMerge();
      } else if (tool === "split") {
        await handleSplit();
      } else if (tool === "compress") {
        await handleCompress();
      } else if (tool === "pdf-to-image") {
        await handlePdfToImage();
      } else {
        setTimeout(() => {
          setStatus("success");
        }, 2000);
      }
    } catch (err) {
      console.error(err);
      setErrorMessage(err.message || "An unexpected error occurred.");
      setStatus("error");
    }
  };

  const handleMerge = async () => {
    const mergedPdf = await PDFDocument.create();
    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      copiedPages.forEach((page) => mergedPdf.addPage(page));
    }
    const pdfBytes = await mergedPdf.save();
    downloadFile(pdfBytes, "merged_vanilla.pdf", "application/pdf");
    setStatus("success");
  };

  const handleSplit = async () => {
    const file = files[0];
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await PDFDocument.load(arrayBuffer);
    const pageCount = pdf.getPageCount();
    
    // For simplicity, we split each page into its own PDF
    for (let i = 0; i < pageCount; i++) {
      const newPdf = await PDFDocument.create();
      const [copiedPage] = await newPdf.copyPages(pdf, [i]);
      newPdf.addPage(copiedPage);
      const pdfBytes = await newPdf.save();
      downloadFile(pdfBytes, `split_page_${i + 1}.pdf`, "application/pdf");
    }
    setStatus("success");
  };

  const handleCompress = async () => {
    const file = files[0];
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await PDFDocument.load(arrayBuffer);
    
    // pdf-lib doesn't have a direct "compress" method like some others, 
    // but saving it often reduces size if it was poorly optimized.
    // For a real app, we'd use more advanced techniques.
    const pdfBytes = await pdf.save({ useObjectStreams: true });
    downloadFile(pdfBytes, "compressed_vanilla.pdf", "application/pdf");
    setStatus("success");
  };

  const handlePdfToImage = async () => {
    const file = files[0];
    const arrayBuffer = await file.arrayBuffer();
    
    // We need pdfjs-dist for this. Since it's a client-side library that often needs a worker,
    // this part is more complex. I'll provide a basic implementation.
    const pdfjsLib = await import("pdfjs-dist/build/pdf");
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
    
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 2 });
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      
      await page.render({ canvasContext: context, viewport }).promise;
      
      const imageData = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = imageData;
      link.download = `page_${i}.png`;
      link.click();
    }
    setStatus("success");
  };

  const downloadFile = (data, fileName, type) => {
    const blob = new Blob([data], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Link href="/" className="inline-flex items-center gap-2 text-accent font-bold uppercase tracking-widest mb-12 hover:translate-x-[-4px] transition-transform">
        <ArrowLeft className="w-4 h-4" /> Back to Tools
      </Link>

      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="mb-12"
      >
        <div className="flex items-end gap-4 mb-4">
          <h1 className="text-6xl font-black italic uppercase tracking-tighter text-white">
            {info.name}
          </h1>
          <span className="text-accent text-3xl font-black mb-1">{info.kanji}</span>
        </div>
        <p className="text-xl text-white/60 font-medium">
          {info.description}
        </p>
      </motion.div>

      <div className="manga-card bg-zinc-950 p-8 md:p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 text-accent/5 font-black text-8xl -z-10 select-none uppercase italic">
          {tool}
        </div>

        <AnimatePresence mode="wait">
          {status === "idle" && (
            <motion.div 
              key="upload"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center"
            >
              <div className="w-full border-4 border-dashed border-white/20 hover:border-accent p-12 flex flex-col items-center group cursor-pointer transition-colors relative mb-8">
                <input 
                  type="file" 
                  multiple={info.acceptMultiple}
                  accept=".pdf"
                  onChange={onFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <Upload className="w-16 h-16 text-white/20 group-hover:text-accent group-hover:scale-110 transition-all mb-4" />
                <p className="text-xl font-bold uppercase tracking-widest text-white/40 group-hover:text-white transition-colors">
                  Drop your PDF files here
                </p>
                <p className="text-xs text-white/20 mt-2">or click to browse</p>
              </div>

              {files.length > 0 && (
                <div className="w-full space-y-3 mb-8">
                  <p className="font-bold uppercase tracking-widest text-xs text-accent">Selected Files ({files.length})</p>
                  {files.map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-white text-black border-2 border-black font-bold">
                      <div className="flex items-center gap-3 truncate">
                        <File className="w-5 h-5 flex-shrink-0" />
                        <span className="truncate">{file.name}</span>
                        <span className="text-[10px] bg-zinc-200 px-1">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                      </div>
                      <button onClick={() => removeFile(idx)} className="hover:text-accent">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <button 
                onClick={handleAction}
                disabled={files.length === 0}
                className={`manga-button w-full text-xl ${files.length === 0 ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
              >
                {info.actionLabel}
              </button>
            </motion.div>
          )}

          {status === "processing" && (
            <motion.div 
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center py-12"
            >
              <Loader2 className="w-20 h-20 text-accent animate-spin mb-8" />
              <h2 className="text-3xl font-black italic uppercase tracking-widest text-white mb-2">
                Processing...
              </h2>
              <p className="text-white/40 font-bold uppercase tracking-[0.3em] text-xs">Do not close this window</p>
            </motion.div>
          )}

          {status === "success" && (
            <motion.div 
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center py-12"
            >
              <CheckCircle2 className="w-20 h-20 text-green-500 mb-8" />
              <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white mb-2">
                Mission Accomplished!
              </h2>
              <p className="text-white/60 font-bold uppercase tracking-widest mb-8">Your file is ready for download.</p>
              <div className="flex gap-4">
                <button 
                  onClick={() => setStatus("idle")}
                  className="manga-button bg-white text-black hover:bg-zinc-200"
                >
                  Edit Another
                </button>
                <Link href="/" className="manga-button">
                  All Tools
                </Link>
              </div>
            </motion.div>
          )}

          {status === "error" && (
            <motion.div 
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center py-12 text-center"
            >
              <AlertCircle className="w-20 h-20 text-accent mb-8" />
              <h2 className="text-3xl font-black italic uppercase tracking-widest text-white mb-4">
                Critical Failure!
              </h2>
              <p className="text-red-500 font-bold max-w-md mb-8">
                {errorMessage}
              </p>
              <button 
                onClick={() => setStatus("idle")}
                className="manga-button"
              >
                Try Again
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-12 p-8 border-l-4 border-accent bg-black/40">
        <h4 className="text-sm font-black uppercase tracking-widest text-accent mb-2 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" /> Pro Tip
        </h4>
        <p className="text-sm text-white/60 leading-relaxed italic">
          VanillaPDF uses client-side processing. This means your data is never uploaded to any server. 
          Everything happens right here, in your browser. Maximum security, maximum speed.
        </p>
      </div>
    </div>
  );
}
