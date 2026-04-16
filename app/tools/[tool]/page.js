"use client";

import { useState, use, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  File,
  X,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ChevronUp,
  ChevronDown,
  Download,
  Settings2,
} from "lucide-react";
import Link from "next/link";
import { PDFDocument } from "pdf-lib";

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const PDF_MAGIC = "%PDF-";

const toolsInfo = {
  merge: {
    name: "Merge PDF",
    description: "Combine multiple PDF files into one master document.",
    actionLabel: "Combine Files",
    acceptMultiple: true,
    kanji: "結合",
  },
  split: {
    name: "Split PDF",
    description: "Extract pages or split your PDF into separate files.",
    actionLabel: "Split Now",
    acceptMultiple: false,
    kanji: "分割",
  },
  "pdf-to-image": {
    name: "PDF to Image",
    description: "Convert each page of your PDF into high-quality images.",
    actionLabel: "Convert to Image",
    acceptMultiple: false,
    kanji: "画像",
  },
  compress: {
    name: "Compress PDF",
    description: "Reduce the file size of your PDF without losing quality.",
    actionLabel: "Compress Now",
    acceptMultiple: false,
    kanji: "圧縮",
  },
};

function sanitizeFileName(name) {
  return name.replace(/[<>"'&]/g, "_").slice(0, 200);
}

async function validatePdf(file) {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(
      `File "${sanitizeFileName(file.name)}" exceeds the 100MB size limit.`
    );
  }
  const header = await file.slice(0, 5).text();
  if (header !== PDF_MAGIC) {
    throw new Error(
      `File "${sanitizeFileName(file.name)}" is not a valid PDF file.`
    );
  }
}

function parsePageRanges(input, maxPages) {
  if (!input.trim()) return null; // empty means all pages individually
  const ranges = [];
  const parts = input.split(",").map((s) => s.trim());
  for (const part of parts) {
    if (part.includes("-")) {
      const [startStr, endStr] = part.split("-");
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);
      if (isNaN(start) || isNaN(end) || start < 1 || end > maxPages || start > end) {
        throw new Error(`Invalid range "${part}". Pages must be between 1 and ${maxPages}.`);
      }
      for (let i = start; i <= end; i++) {
        if (!ranges.includes(i - 1)) ranges.push(i - 1);
      }
    } else {
      const page = parseInt(part, 10);
      if (isNaN(page) || page < 1 || page > maxPages) {
        throw new Error(`Invalid page "${part}". Must be between 1 and ${maxPages}.`);
      }
      if (!ranges.includes(page - 1)) ranges.push(page - 1);
    }
  }
  return ranges.sort((a, b) => a - b);
}

function downloadFile(data, fileName, type) {
  const blob = new Blob([data], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  // Clean up after short delay to ensure download starts
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

export default function ToolPage({ params }) {
  const { tool } = use(params);
  const info = toolsInfo[tool];

  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState("idle"); // idle, processing, success, error
  const [errorMessage, setErrorMessage] = useState("");
  const [progress, setProgress] = useState("");

  // Split-specific state
  const [pageCount, setPageCount] = useState(0);
  const [pageRangeInput, setPageRangeInput] = useState("");

  // PDF-to-Image options
  const [imageScale, setImageScale] = useState(2);
  const [imageFormat, setImageFormat] = useState("png");
  const [jpegQuality, setJpegQuality] = useState(0.85);
  const [imagePreviews, setImagePreviews] = useState([]);

  // Compress result
  const [compressResult, setCompressResult] = useState(null);

  const fileInputRef = useRef(null);
  const dragCounter = useRef(0);
  const [isDragging, setIsDragging] = useState(false);

  // Invalid tool slug
  if (!info) {
    return (
      <div className="max-w-4xl mx-auto text-center py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring" }}
        >
          <div className="text-9xl font-black text-accent mb-6" style={{ animation: "shake 0.6s ease-in-out" }}>404</div>
          <h1 className="text-4xl font-black italic uppercase text-white mb-4">
            Tool Not Found!
          </h1>
          <p className="text-white/60 font-medium mb-8">
            The tool &quot;{sanitizeFileName(tool)}&quot; doesn&apos;t exist in this dimension.
          </p>
          <Link href="/" className="manga-button inline-block">
            Back to All Tools
          </Link>
        </motion.div>
      </div>
    );
  }

  const resetState = () => {
    setFiles([]);
    setStatus("idle");
    setErrorMessage("");
    setProgress("");
    setPageCount(0);
    setPageRangeInput("");
    setImagePreviews([]);
    setCompressResult(null);
  };

  const onFileChange = async (e) => {
    const selectedFiles = Array.from(e.target.files);
    await addFiles(selectedFiles);
    // Reset input so same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const addFiles = async (selectedFiles) => {
    setErrorMessage("");
    const validFiles = [];
    for (const file of selectedFiles) {
      try {
        await validatePdf(file);
        validFiles.push(file);
      } catch (err) {
        setErrorMessage(err.message);
        return;
      }
    }

    if (info.acceptMultiple) {
      setFiles((prev) => [...prev, ...validFiles]);
    } else {
      setFiles(validFiles.slice(0, 1));
      // For split, read page count
      if (tool === "split" && validFiles.length > 0) {
        try {
          const buf = await validFiles[0].arrayBuffer();
          const pdf = await PDFDocument.load(buf);
          setPageCount(pdf.getPageCount());
        } catch {
          setPageCount(0);
        }
      }
    }
    setStatus("idle");
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    if (!info.acceptMultiple) {
      setPageCount(0);
      setPageRangeInput("");
    }
  };

  const moveFile = (index, direction) => {
    setFiles((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  // Drag and drop handlers
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current = 0;
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    await addFiles(droppedFiles);
  };

  const handleAction = async () => {
    if (files.length === 0) return;

    setStatus("processing");
    setProgress("");
    setCompressResult(null);
    setImagePreviews([]);
    try {
      if (tool === "merge") {
        await handleMerge();
      } else if (tool === "split") {
        await handleSplit();
      } else if (tool === "compress") {
        await handleCompress();
      } else if (tool === "pdf-to-image") {
        await handlePdfToImage();
      }
    } catch (err) {
      console.error(err);
      setErrorMessage(err.message || "An unexpected error occurred.");
      setStatus("error");
    }
  };

  const handleMerge = async () => {
    setProgress("Creating merged document...");
    const mergedPdf = await PDFDocument.create();
    for (let i = 0; i < files.length; i++) {
      setProgress(`Processing file ${i + 1} of ${files.length}...`);
      const arrayBuffer = await files[i].arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      copiedPages.forEach((page) => mergedPdf.addPage(page));
    }
    setProgress("Saving merged PDF...");
    const pdfBytes = await mergedPdf.save();
    downloadFile(pdfBytes, "merged_vanilla.pdf", "application/pdf");
    setStatus("success");
  };

  const handleSplit = async () => {
    const file = files[0];
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await PDFDocument.load(arrayBuffer);
    const totalPages = pdf.getPageCount();

    let pageIndices;
    try {
      pageIndices = parsePageRanges(pageRangeInput, totalPages);
    } catch (err) {
      throw new Error(err.message);
    }

    if (pageIndices === null) {
      // Split all pages individually
      for (let i = 0; i < totalPages; i++) {
        setProgress(`Splitting page ${i + 1} of ${totalPages}...`);
        const newPdf = await PDFDocument.create();
        const [copiedPage] = await newPdf.copyPages(pdf, [i]);
        newPdf.addPage(copiedPage);
        const pdfBytes = await newPdf.save();
        downloadFile(pdfBytes, `split_page_${i + 1}.pdf`, "application/pdf");
      }
    } else {
      // Extract specified pages into a single PDF
      setProgress(`Extracting ${pageIndices.length} page(s)...`);
      const newPdf = await PDFDocument.create();
      const copiedPages = await newPdf.copyPages(pdf, pageIndices);
      copiedPages.forEach((page) => newPdf.addPage(page));
      const pdfBytes = await newPdf.save();
      downloadFile(
        pdfBytes,
        `extracted_pages.pdf`,
        "application/pdf"
      );
    }
    setStatus("success");
  };

  const handleCompress = async () => {
    const file = files[0];
    const originalSize = file.size;
    setProgress("Loading PDF...");
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await PDFDocument.load(arrayBuffer);

    // Strip metadata for smaller output
    setProgress("Stripping metadata and optimizing...");
    pdf.setTitle("");
    pdf.setAuthor("");
    pdf.setSubject("");
    pdf.setKeywords([]);
    pdf.setProducer("");
    pdf.setCreator("");

    const pdfBytes = await pdf.save({ useObjectStreams: true });
    const compressedSize = pdfBytes.length;

    setCompressResult({
      originalSize,
      compressedSize,
      savings: originalSize - compressedSize,
      percentage:
        originalSize > 0
          ? (((originalSize - compressedSize) / originalSize) * 100).toFixed(1)
          : 0,
    });

    downloadFile(pdfBytes, "compressed_vanilla.pdf", "application/pdf");
    setStatus("success");
  };

  const handlePdfToImage = async () => {
    const file = files[0];
    const arrayBuffer = await file.arrayBuffer();

    setProgress("Loading PDF renderer...");
    const pdfjsLib = await import("pdfjs-dist/build/pdf");
    pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

    const loadingTask = pdfjsLib.getDocument({
      data: arrayBuffer,
      verbosity: 0,
    });
    const pdf = await loadingTask.promise;
    const previews = [];

    for (let i = 1; i <= pdf.numPages; i++) {
      setProgress(`Rendering page ${i} of ${pdf.numPages}...`);
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: imageScale });
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await page.render({ canvasContext: context, viewport }).promise;

      let dataUrl;
      if (imageFormat === "jpeg") {
        dataUrl = canvas.toDataURL("image/jpeg", jpegQuality);
      } else {
        dataUrl = canvas.toDataURL("image/png");
      }

      previews.push({
        dataUrl,
        pageNum: i,
        fileName: `page_${i}.${imageFormat === "jpeg" ? "jpg" : "png"}`,
      });

      // Clean up canvas
      canvas.width = 0;
      canvas.height = 0;
    }

    setImagePreviews(previews);
    setStatus("success");
  };

  const downloadAllImages = () => {
    imagePreviews.forEach((img) => {
      const link = document.createElement("a");
      link.href = img.dataUrl;
      link.download = img.fileName;
      link.click();
    });
  };

  const downloadSingleImage = (img) => {
    const link = document.createElement("a");
    link.href = img.dataUrl;
    link.download = img.fileName;
    link.click();
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-accent font-bold uppercase tracking-widest mb-12 hover:translate-x-[-4px] transition-transform"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Tools
      </Link>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ type: "spring", stiffness: 100 }}
        className="mb-12"
      >
        <div className="flex items-end gap-4 mb-4">
          <h1 className="text-5xl md:text-6xl font-black italic uppercase tracking-tighter text-white">
            {info.name}
          </h1>
          <motion.span
            className="text-accent text-3xl font-black mb-1"
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            {info.kanji}
          </motion.span>
        </div>
        <p className="text-xl text-white/60 font-medium">{info.description}</p>
      </motion.div>

      <motion.div
        className="manga-card bg-zinc-950 p-8 md:p-12 relative overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="absolute top-0 right-0 p-8 text-accent/5 font-black text-8xl select-none uppercase italic pointer-events-none">
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
              {/* File drop zone */}
              <div
                className={`w-full border-4 border-dashed p-12 flex flex-col items-center group cursor-pointer transition-all relative mb-8 ${
                  isDragging
                    ? "border-accent bg-accent/5 scale-[1.01]"
                    : "border-white/20 hover:border-accent drag-zone-pulse"
                }`}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple={info.acceptMultiple}
                  accept=".pdf"
                  onChange={onFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <motion.div
                  animate={isDragging ? { scale: 1.2, rotate: 5 } : { scale: 1, rotate: 0 }}
                  transition={{ type: "spring" }}
                >
                  <Upload className="w-16 h-16 text-white/20 group-hover:text-accent transition-all mb-4" />
                </motion.div>
                <p className="text-xl font-bold uppercase tracking-widest text-white/40 group-hover:text-white transition-colors">
                  {isDragging ? "Drop it here!" : "Drop your PDF files here"}
                </p>
                <p className="text-xs text-white/20 mt-2">
                  or click to browse (max 100MB per file)
                </p>
              </div>

              {/* Error message inline */}
              <AnimatePresence>
                {errorMessage && status === "idle" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="w-full mb-6 p-4 bg-red-950 border-2 border-accent text-accent font-bold text-sm flex items-center gap-3"
                  >
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    {errorMessage}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* File list */}
              {files.length > 0 && (
                <div className="w-full space-y-3 mb-8">
                  <p className="font-bold uppercase tracking-widest text-xs text-accent">
                    Selected Files ({files.length})
                  </p>
                  <AnimatePresence>
                    {files.map((file, idx) => (
                      <motion.div
                        key={`${file.name}-${idx}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20, height: 0 }}
                        transition={{ type: "spring", stiffness: 200 }}
                        className="flex items-center justify-between p-4 bg-white text-black border-2 border-black font-bold"
                      >
                        <div className="flex items-center gap-3 truncate">
                          <File className="w-5 h-5 flex-shrink-0" />
                          <span className="truncate">
                            {sanitizeFileName(file.name)}
                          </span>
                          <span className="text-[10px] bg-zinc-200 px-1">
                            {formatSize(file.size)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          {/* Reorder buttons for merge */}
                          {info.acceptMultiple && files.length > 1 && (
                            <>
                              <button
                                onClick={() => moveFile(idx, -1)}
                                disabled={idx === 0}
                                className="p-1 hover:text-accent disabled:opacity-30"
                                title="Move up"
                              >
                                <ChevronUp className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => moveFile(idx, 1)}
                                disabled={idx === files.length - 1}
                                className="p-1 hover:text-accent disabled:opacity-30"
                                title="Move down"
                              >
                                <ChevronDown className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => removeFile(idx)}
                            className="p-1 hover:text-accent"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}

              {/* Tool-specific options */}
              {tool === "split" && files.length > 0 && pageCount > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="w-full mb-8 p-6 bg-zinc-900 border-2 border-zinc-700"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <Settings2 className="w-4 h-4 text-accent" />
                    <p className="font-bold uppercase tracking-widest text-xs text-accent">
                      Split Options
                    </p>
                  </div>
                  <p className="text-sm text-white/60 mb-3">
                    Total pages: <span className="text-white font-bold">{pageCount}</span>
                  </p>
                  <label className="block text-sm text-white/60 mb-2">
                    Page range (leave empty to split all pages individually):
                  </label>
                  <input
                    type="text"
                    value={pageRangeInput}
                    onChange={(e) => setPageRangeInput(e.target.value)}
                    placeholder={`e.g. 1-3, 5, ${Math.min(7, pageCount)}-${pageCount}`}
                    className="manga-input w-full"
                  />
                  <p className="text-xs text-white/30 mt-2">
                    Specify ranges to extract into a single PDF, or leave empty for one PDF per page.
                  </p>
                </motion.div>
              )}

              {tool === "pdf-to-image" && files.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="w-full mb-8 p-6 bg-zinc-900 border-2 border-zinc-700"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <Settings2 className="w-4 h-4 text-accent" />
                    <p className="font-bold uppercase tracking-widest text-xs text-accent">
                      Conversion Options
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-white/60 mb-2">
                        Scale
                      </label>
                      <select
                        value={imageScale}
                        onChange={(e) => setImageScale(Number(e.target.value))}
                        className="manga-select w-full"
                      >
                        <option value={1}>1x (Fast)</option>
                        <option value={2}>2x (Recommended)</option>
                        <option value={3}>3x (High Quality)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-white/60 mb-2">
                        Format
                      </label>
                      <select
                        value={imageFormat}
                        onChange={(e) => setImageFormat(e.target.value)}
                        className="manga-select w-full"
                      >
                        <option value="png">PNG (Lossless)</option>
                        <option value="jpeg">JPEG (Smaller)</option>
                      </select>
                    </div>
                  </div>
                  {imageFormat === "jpeg" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="mt-4"
                    >
                      <label className="block text-sm text-white/60 mb-2">
                        JPEG Quality: {Math.round(jpegQuality * 100)}%
                      </label>
                      <input
                        type="range"
                        min="0.1"
                        max="1"
                        step="0.05"
                        value={jpegQuality}
                        onChange={(e) =>
                          setJpegQuality(Number(e.target.value))
                        }
                        className="manga-range w-full"
                      />
                    </motion.div>
                  )}
                </motion.div>
              )}

              <motion.button
                onClick={handleAction}
                disabled={files.length === 0}
                className={`manga-button w-full text-xl ${
                  files.length === 0
                    ? "opacity-50 grayscale cursor-not-allowed"
                    : ""
                }`}
                whileHover={files.length > 0 ? { scale: 1.01 } : {}}
                whileTap={files.length > 0 ? { scale: 0.98 } : {}}
              >
                {info.actionLabel}
              </motion.button>
            </motion.div>
          )}

          {status === "processing" && (
            <motion.div
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center py-12 relative"
            >
              <div className="absolute inset-0 processing-lines opacity-20 pointer-events-none rounded" />
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="relative z-10"
              >
                <Loader2 className="w-20 h-20 text-accent" />
              </motion.div>
              <motion.div
                className="absolute w-32 h-32 border-4 border-accent/20 rounded-full"
                animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <motion.h2
                className="text-3xl font-black italic uppercase tracking-widest text-white mb-2 mt-8 relative z-10"
                animate={{ opacity: [1, 0.7, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                Processing...
              </motion.h2>
              {progress && (
                <motion.p
                  className="text-accent font-bold uppercase tracking-wider text-xs relative z-10"
                  key={progress}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {progress}
                </motion.p>
              )}
              <p className="text-white/40 font-bold uppercase tracking-[0.3em] text-xs mt-4 relative z-10">
                Do not close this window
              </p>
            </motion.div>
          )}

          {status === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 100, damping: 10 }}
              className="flex flex-col items-center py-12 relative"
            >
              {/* Burst effect */}
              <motion.div
                className="absolute w-40 h-40 rounded-full border-4 border-green-500/30"
                initial={{ scale: 0, opacity: 1 }}
                animate={{ scale: 3, opacity: 0 }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
              <motion.div
                className="absolute w-40 h-40 rounded-full border-2 border-green-500/20"
                initial={{ scale: 0, opacity: 1 }}
                animate={{ scale: 4, opacity: 0 }}
                transition={{ duration: 1.2, ease: "easeOut", delay: 0.1 }}
              />

              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 10,
                  delay: 0.1,
                }}
              >
                <CheckCircle2 className="w-20 h-20 text-green-500 mb-8 relative z-10" />
              </motion.div>
              <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white mb-2 relative z-10">
                Mission Accomplished!
              </h2>

              {/* Compress result info */}
              {compressResult && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mb-6 p-4 bg-zinc-900 border-2 border-zinc-700 w-full max-w-md relative z-10"
                >
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-white/40 uppercase text-xs tracking-wider">Original</p>
                      <p className="text-white font-bold">{formatSize(compressResult.originalSize)}</p>
                    </div>
                    <div>
                      <p className="text-white/40 uppercase text-xs tracking-wider">Compressed</p>
                      <p className="text-green-400 font-bold">{formatSize(compressResult.compressedSize)}</p>
                    </div>
                    <div className="col-span-2 border-t border-zinc-700 pt-2 mt-1">
                      <p className="text-white/40 uppercase text-xs tracking-wider">Saved</p>
                      <p className="text-accent font-bold">
                        {formatSize(compressResult.savings)} ({compressResult.percentage}%)
                      </p>
                    </div>
                  </div>
                  {compressResult.savings <= 0 && (
                    <p className="text-xs text-white/40 mt-3 italic">
                      This PDF was already well-optimized. Browser-based compression is limited compared to server-side tools.
                    </p>
                  )}
                </motion.div>
              )}

              {/* Image previews */}
              {imagePreviews.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="w-full mb-6 relative z-10"
                >
                  <div className="flex items-center justify-between mb-4">
                    <p className="font-bold uppercase tracking-widest text-xs text-accent">
                      Converted Pages ({imagePreviews.length})
                    </p>
                    <button
                      onClick={downloadAllImages}
                      className="manga-button text-xs py-2 px-4 flex items-center gap-2"
                    >
                      <Download className="w-3 h-3" /> Download All
                    </button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-96 overflow-y-auto pr-2">
                    {imagePreviews.map((img, idx) => (
                      <motion.div
                        key={img.pageNum}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.05 }}
                        className="relative group cursor-pointer border-2 border-zinc-700 hover:border-accent transition-colors bg-zinc-900"
                        onClick={() => downloadSingleImage(img)}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element -- data URLs cannot use next/image */}
                        <img
                          src={img.dataUrl}
                          alt={`Page ${img.pageNum}`}
                          className="w-full h-auto"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Download className="w-6 h-6 text-white" />
                        </div>
                        <p className="text-center text-xs text-white/60 py-1">
                          Page {img.pageNum}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              <p className="text-white/60 font-bold uppercase tracking-widest mb-8 relative z-10">
                {imagePreviews.length > 0
                  ? "Click any image to download, or download all."
                  : "Your file is ready for download."}
              </p>
              <div className="flex gap-4 relative z-10">
                <button
                  onClick={resetState}
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
              <motion.div
                animate={{
                  x: [0, -4, 4, -4, 4, -2, 2, 0],
                }}
                transition={{ duration: 0.5 }}
              >
                <AlertCircle className="w-20 h-20 text-accent mb-8" />
              </motion.div>
              <motion.h2
                className="text-3xl font-black italic uppercase tracking-widest text-white mb-4"
                style={{ animation: "glitch 0.3s ease-in-out 2" }}
              >
                Critical Failure!
              </motion.h2>
              <p className="text-red-500 font-bold max-w-md mb-8">
                {errorMessage}
              </p>
              <button onClick={resetState} className="manga-button">
                Try Again
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <motion.div
        className="mt-12 p-8 border-l-4 border-accent bg-black/40"
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4 }}
      >
        <h4 className="text-sm font-black uppercase tracking-widest text-accent mb-2 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" /> Pro Tip
        </h4>
        <p className="text-sm text-white/60 leading-relaxed italic">
          VanillaPDF uses client-side processing. This means your data is never
          uploaded to any server. Everything happens right here, in your browser.
          Maximum security, maximum speed.
        </p>
      </motion.div>
    </div>
  );
}
