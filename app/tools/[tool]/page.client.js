"use client";

import { useState, useRef } from "react";
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
} from "lucide-react";
import Link from "next/link";
import { PDFDocument } from "pdf-lib";
import { toolsInfo } from "@/lib/tools";
import { sanitizeFileName, validatePdf } from "@/lib/pdf/validate";
import { formatSize, downloadFile, downloadZip } from "@/lib/pdf/download";
import { mergePdfs } from "@/lib/pdf/merge";
import { splitPdf } from "@/lib/pdf/split";
import { compressPdf } from "@/lib/pdf/compress";
import { wrapPdfError, throwIfAborted } from "@/lib/pdf/errors";

const THUMBNAIL_MAX_WIDTH = 200;

export default function ToolPage({ tool }) {
  const info = toolsInfo[tool];

  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [progress, setProgress] = useState("");
  const [pageCount, setPageCount] = useState(0);
  const [pageRangeInput, setPageRangeInput] = useState("");
  const [imageScale, setImageScale] = useState(2);
  const [imageFormat, setImageFormat] = useState("png");
  const [jpegQuality, setJpegQuality] = useState(0.85);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [compressResult, setCompressResult] = useState(null);

  const fileInputRef = useRef(null);
  const dragCounter = useRef(0);
  const abortRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const imageBlobsRef = useRef([]);

  if (!info) {
    return (
      <div className="max-w-4xl mx-auto text-center py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring" }}
        >
          <div className="text-9xl font-black text-accent mb-6" style={{ animation: "shake 0.6s ease-in-out" }}>404</div>
          <h1 className="text-4xl font-black italic uppercase text-white mb-4">Tool Not Found!</h1>
          <p className="text-white/60 font-medium mb-8">
            The tool &quot;{sanitizeFileName(tool)}&quot; doesn&apos;t exist in this dimension.
          </p>
          <Link href="/" className="manga-button inline-block">Back to All Tools</Link>
        </motion.div>
      </div>
    );
  }

  const resetState = () => {
    imageBlobsRef.current.forEach((blob) => URL.revokeObjectURL(blob.url));
    imageBlobsRef.current = [];
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
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const addFiles = async (selectedFiles) => {
    setErrorMessage("");
    const validFiles = [];
    const rejected = [];

    for (const file of selectedFiles) {
      try {
        await validatePdf(file);
        validFiles.push(file);
      } catch (err) {
        rejected.push(err.message);
      }
    }

    if (rejected.length > 0) {
      setErrorMessage(rejected.join(" "));
      if (validFiles.length === 0) return;
    }

    if (info.acceptMultiple) {
      setFiles((prev) => [...prev, ...validFiles]);
    } else if (validFiles.length > 0) {
      setFiles(validFiles.slice(0, 1));
      if (tool === "split") {
        try {
          const buf = await validFiles[0].arrayBuffer();
          const pdf = await PDFDocument.load(buf);
          setPageCount(pdf.getPageCount());
        } catch (err) {
          setPageCount(0);
          setErrorMessage(wrapPdfError(err).message);
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
    await addFiles(Array.from(e.dataTransfer.files));
  };

  const cancelProcessing = () => {
    abortRef.current?.abort();
  };

  const handleAction = async () => {
    if (files.length === 0) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const { signal } = controller;

    setStatus("processing");
    setProgress("");
    setCompressResult(null);
    imageBlobsRef.current.forEach((blob) => URL.revokeObjectURL(blob.url));
    imageBlobsRef.current = [];
    setImagePreviews([]);

    try {
      if (tool === "merge") await handleMerge(signal);
      else if (tool === "split") await handleSplit(signal);
      else if (tool === "compress") await handleCompress(signal);
      else if (tool === "pdf-to-image") await handlePdfToImage(signal);
    } catch (err) {
      if (err.name === "AbortError") {
        setStatus("idle");
        setProgress("");
        return;
      }
      console.error(err);
      setErrorMessage(err.message || "An unexpected error occurred.");
      setStatus("error");
    }
  };

  const handleMerge = async (signal) => {
    setProgress("Creating merged document...");
    const buffers = [];
    for (let i = 0; i < files.length; i++) {
      throwIfAborted(signal);
      setProgress(`Processing file ${i + 1} of ${files.length}...`);
      buffers.push(await files[i].arrayBuffer());
    }
    throwIfAborted(signal);
    setProgress("Saving merged PDF...");
    const pdfBytes = await mergePdfs(buffers);
    throwIfAborted(signal);
    downloadFile(pdfBytes, "merged_vanilla.pdf", "application/pdf");
    setStatus("success");
  };

  const handleSplit = async (signal) => {
    throwIfAborted(signal);
    const arrayBuffer = await files[0].arrayBuffer();
    setProgress("Splitting PDF...");
    const result = await splitPdf(arrayBuffer, pageRangeInput);
    throwIfAborted(signal);

    if (result.mode === "individual" && result.files.length > 1) {
      setProgress("Creating ZIP archive...");
      await downloadZip(result.files, "split_pages.zip");
    } else {
      const { name, data } = result.files[0];
      downloadFile(data, name, "application/pdf");
    }
    setStatus("success");
  };

  const handleCompress = async (signal) => {
    const file = files[0];
    const originalSize = file.size;
    setProgress("Loading PDF...");
    throwIfAborted(signal);
    const pdfBytes = await compressPdf(await file.arrayBuffer());
    throwIfAborted(signal);
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

    downloadFile(pdfBytes, "optimized_vanilla.pdf", "application/pdf");
    setStatus("success");
  };

  const handlePdfToImage = async (signal) => {
    const arrayBuffer = await files[0].arrayBuffer();
    setProgress("Loading PDF renderer...");
    throwIfAborted(signal);
    const pdfjsLib = await import("pdfjs-dist/build/pdf");
    pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

    let pdf;
    try {
      pdf = await pdfjsLib.getDocument({ data: arrayBuffer, verbosity: 0 }).promise;
    } catch (err) {
      throw wrapPdfError(err);
    }

    const previews = [];
    const blobs = [];

    for (let i = 1; i <= pdf.numPages; i++) {
      throwIfAborted(signal);
      setProgress(`Rendering page ${i} of ${pdf.numPages}...`);
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: imageScale });
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      await page.render({ canvasContext: context, viewport }).promise;

      const mimeType = imageFormat === "jpeg" ? "image/jpeg" : "image/png";
      const blob = await new Promise((resolve, reject) => {
        canvas.toBlob(
          (result) => {
            if (!result) {
              reject(
                new Error(
                  `Failed to encode page ${i} as ${imageFormat === "jpeg" ? "JPEG" : "PNG"}. Try a lower scale or quality.`
                )
              );
              return;
            }
            resolve(result);
          },
          mimeType,
          imageFormat === "jpeg" ? jpegQuality : undefined
        );
      });

      const fullUrl = URL.createObjectURL(blob);
      const fileName = `page_${i}.${imageFormat === "jpeg" ? "jpg" : "png"}`;
      blobs.push({ url: fullUrl, fileName, blob });

      const thumbCanvas = document.createElement("canvas");
      const thumbScale = THUMBNAIL_MAX_WIDTH / viewport.width;
      thumbCanvas.width = THUMBNAIL_MAX_WIDTH;
      thumbCanvas.height = viewport.height * thumbScale;
      thumbCanvas.getContext("2d").drawImage(canvas, 0, 0, thumbCanvas.width, thumbCanvas.height);

      previews.push({
        thumbUrl: thumbCanvas.toDataURL("image/jpeg", 0.6),
        pageNum: i,
        fileName,
      });

      canvas.width = 0;
      canvas.height = 0;
      thumbCanvas.width = 0;
      thumbCanvas.height = 0;
    }

    imageBlobsRef.current = blobs;
    setImagePreviews(previews);
    setStatus("success");
  };

  const downloadAllImages = async () => {
    if (imageBlobsRef.current.length === 0) return;
    if (imageBlobsRef.current.length === 1) {
      const { url, fileName } = imageBlobsRef.current[0];
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      link.click();
      return;
    }
    await downloadZip(
      imageBlobsRef.current.map(({ blob, fileName }) => ({ name: fileName, data: blob })),
      "pdf_images.zip"
    );
  };

  const downloadSingleImage = (pageNum) => {
    const idx = imagePreviews.findIndex((p) => p.pageNum === pageNum);
    const entry = imageBlobsRef.current[idx];
    if (!entry) return;
    const link = document.createElement("a");
    link.href = entry.url;
    link.download = entry.fileName;
    link.click();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Link href="/" className="inline-flex items-center gap-2 text-accent font-bold uppercase tracking-widest mb-12 hover:translate-x-[-4px] transition-transform">
        <ArrowLeft className="w-4 h-4" /> Back to Tools
      </Link>

      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ type: "spring", stiffness: 100 }} className="mb-12">
        <div className="flex items-end gap-4 mb-4">
          <h1 className="text-5xl md:text-6xl font-black italic uppercase tracking-tighter text-white">{info.name}</h1>
          <motion.span className="text-accent text-3xl font-black mb-1" animate={{ opacity: [0.6, 1, 0.6] }} transition={{ duration: 3, repeat: Infinity }}>
            {info.kanji}
          </motion.span>
        </div>
        <p className="text-xl text-white/60 font-medium">{info.description}</p>
      </motion.div>

      <motion.div className="manga-card bg-zinc-950 p-8 md:p-12 relative overflow-hidden" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <div className="absolute top-0 right-0 p-8 text-accent/5 font-black text-8xl select-none uppercase italic pointer-events-none">{tool}</div>

        <AnimatePresence mode="wait">
          {status === "idle" && (
            <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center">
              <div
                className={`w-full border-4 border-dashed p-12 flex flex-col items-center group cursor-pointer transition-all relative mb-8 ${isDragging ? "border-accent bg-accent/5 scale-[1.01]" : "border-white/20 hover:border-accent drag-zone-pulse"}`}
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
                  aria-label="Upload PDF files"
                  data-testid="pdf-file-input"
                />
                <Upload className="w-16 h-16 text-white/20 group-hover:text-accent transition-all mb-4" />
                <p className="text-xl font-bold uppercase tracking-widest text-white/40 group-hover:text-white transition-colors">{isDragging ? "Drop it here!" : "Drop your PDF files here"}</p>
                <p className="text-xs text-white/20 mt-2">or click to browse (max 100MB per file)</p>
              </div>

              {errorMessage && (
                <div className="w-full mb-6 p-4 bg-red-950 border-2 border-accent text-accent font-bold text-sm flex items-center gap-3" role="alert">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  {errorMessage}
                </div>
              )}

              {files.length > 0 && (
                <div className="w-full space-y-3 mb-8">
                  <p className="font-bold uppercase tracking-widest text-xs text-accent">Selected Files ({files.length})</p>
                  {files.map((file, idx) => (
                    <div key={`${file.name}-${file.size}-${file.lastModified}-${idx}`} className="flex items-center justify-between p-4 bg-white text-black border-2 border-black font-bold">
                      <div className="flex items-center gap-3 truncate">
                        <File className="w-5 h-5 flex-shrink-0" />
                        <span className="truncate">{sanitizeFileName(file.name)}</span>
                        <span className="text-[10px] bg-zinc-200 px-1">{formatSize(file.size)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {info.acceptMultiple && files.length > 1 && (
                          <>
                            <button onClick={() => moveFile(idx, -1)} disabled={idx === 0} className="p-1 hover:text-accent disabled:opacity-30" aria-label="Move file up"><ChevronUp className="w-4 h-4" /></button>
                            <button onClick={() => moveFile(idx, 1)} disabled={idx === files.length - 1} className="p-1 hover:text-accent disabled:opacity-30" aria-label="Move file down"><ChevronDown className="w-4 h-4" /></button>
                          </>
                        )}
                        <button onClick={() => removeFile(idx)} className="p-1 hover:text-accent" aria-label={`Remove ${sanitizeFileName(file.name)}`}><X className="w-5 h-5" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {tool === "split" && files.length > 0 && pageCount > 0 && (
                <div className="w-full mb-8 p-6 bg-zinc-900 border-2 border-zinc-700">
                  <p className="text-sm text-white/60 mb-3">Total pages: <span className="text-white font-bold">{pageCount}</span></p>
                  <label htmlFor="page-range" className="block text-sm text-white/60 mb-2">Page range (leave empty to split all pages individually):</label>
                  <input id="page-range" type="text" value={pageRangeInput} onChange={(e) => setPageRangeInput(e.target.value)} placeholder={`e.g. 1-3, 5, ${Math.min(7, pageCount)}-${pageCount}`} className="manga-input w-full" />
                </div>
              )}

              {tool === "pdf-to-image" && files.length > 0 && (
                <div className="w-full mb-8 p-6 bg-zinc-900 border-2 border-zinc-700">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="image-scale" className="block text-sm text-white/60 mb-2">Scale</label>
                      <select id="image-scale" value={imageScale} onChange={(e) => setImageScale(Number(e.target.value))} className="manga-select w-full">
                        <option value={1}>1x (Fast)</option>
                        <option value={2}>2x (Recommended)</option>
                        <option value={3}>3x (High Quality)</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="image-format" className="block text-sm text-white/60 mb-2">Format</label>
                      <select id="image-format" value={imageFormat} onChange={(e) => setImageFormat(e.target.value)} className="manga-select w-full">
                        <option value="png">PNG (Lossless)</option>
                        <option value="jpeg">JPEG (Smaller)</option>
                      </select>
                    </div>
                  </div>
                  {imageFormat === "jpeg" && (
                    <div className="mt-4">
                      <label htmlFor="jpeg-quality" className="block text-sm text-white/60 mb-2">
                        JPEG Quality: {Math.round(jpegQuality * 100)}%
                      </label>
                      <input
                        id="jpeg-quality"
                        type="range"
                        min="0.1"
                        max="1"
                        step="0.05"
                        value={jpegQuality}
                        onChange={(e) => setJpegQuality(Number(e.target.value))}
                        className="manga-range w-full"
                      />
                    </div>
                  )}
                </div>
              )}

              <motion.button onClick={handleAction} disabled={files.length === 0} className={`manga-button w-full text-xl ${files.length === 0 ? "opacity-50 grayscale cursor-not-allowed" : ""}`}>
                {info.actionLabel}
              </motion.button>
            </motion.div>
          )}

          {status === "processing" && (
            <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center py-12" aria-live="polite">
              <Loader2 className="w-20 h-20 text-accent animate-spin mb-8" />
              <h2 className="text-3xl font-black italic uppercase tracking-widest text-white mb-2">Processing...</h2>
              {progress && <p className="text-accent font-bold uppercase tracking-wider text-xs">{progress}</p>}
              <button onClick={cancelProcessing} className="manga-button mt-8 bg-white text-black hover:bg-zinc-200">
                Cancel
              </button>
            </motion.div>
          )}

          {status === "success" && (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center py-12">
              <CheckCircle2 className="w-20 h-20 text-green-500 mb-8" />
              <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white mb-2">Mission Accomplished!</h2>

              {compressResult && (
                <div className="mb-6 p-4 bg-zinc-900 border-2 border-zinc-700 w-full max-w-md">
                  <p className="text-white font-bold">Saved {formatSize(compressResult.savings)} ({compressResult.percentage}%)</p>
                  {compressResult.savings <= 0 && (
                    <p className="text-xs text-white/40 mt-3 italic">This PDF was already well-optimized. Browser-based optimization is limited compared to server-side tools.</p>
                  )}
                </div>
              )}

              {imagePreviews.length > 0 && (
                <div className="w-full mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <p className="font-bold uppercase tracking-widest text-xs text-accent">Converted Pages ({imagePreviews.length})</p>
                    <button onClick={downloadAllImages} className="manga-button text-xs py-2 px-4 flex items-center gap-2"><Download className="w-3 h-3" /> Download All</button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                    {imagePreviews.map((img) => (
                      <button type="button" key={img.pageNum} className="relative group w-full cursor-pointer border-2 border-zinc-700 hover:border-accent bg-zinc-900 p-0 text-left" onClick={() => downloadSingleImage(img.pageNum)} aria-label={`Download page ${img.pageNum}`}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img.thumbUrl} alt={`Page ${img.pageNum} preview`} className="w-full h-auto" />
                        <p className="text-center text-xs text-white/60 py-1">Page {img.pageNum}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <button onClick={resetState} className="manga-button bg-white text-black hover:bg-zinc-200">Edit Another</button>
                <Link href="/" className="manga-button">All Tools</Link>
              </div>
            </motion.div>
          )}

          {status === "error" && (
            <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center py-12 text-center" role="alert">
              <AlertCircle className="w-20 h-20 text-accent mb-8" />
              <h2 className="text-3xl font-black italic uppercase tracking-widest text-white mb-4">Critical Failure!</h2>
              <p className="text-red-500 font-bold max-w-md mb-8">{errorMessage}</p>
              <button onClick={resetState} className="manga-button">Try Again</button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
