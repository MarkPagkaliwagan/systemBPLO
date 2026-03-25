"use client";

import React, { useState, useRef, useEffect } from "react";
import { FiUpload, FiFile, FiClock, FiDownload, FiTrash2, FiChevronLeft, FiChevronRight, FiAlertCircle, FiFilter, FiPlus } from "react-icons/fi";
import Papa from "papaparse";
import Sidebar from "../../../../components/sidebar";
import { supabase } from "@/lib/supabaseClient";
import DeleteConfirmModal from "./DeleteConfirmModal";
import Link from "next/link";
import ProtectedRoute from "../../../../../components/ProtectedRoute";

interface CSVFile {
  id: string;
  name: string;
  uploadDate: string;
  size: string;
  rows: number;
  status?: string;
  period?: string;
  successCount?: number;
  errorCount?: number;
  skippedCount?: number;
  errors?: string[];
}

function CSVManagerContent() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [csvFiles, setCSVFiles] = useState<CSVFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number } | null>(null);
  const [fileToDelete, setFileToDelete] = useState<CSVFile | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) setIsMobileMenuOpen(false);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const fetchUploadedFiles = async () => {
      try {
        const { data: uploads, error: uploadsError } = await supabase
          .from('csv_uploads')
          .select('*')
          .order('uploaded_at', { ascending: false });

        if (uploadsError) { console.error('❌ fetchUploadedFiles error:', uploadsError); return; }

        const filesWithStatus: CSVFile[] = await Promise.all(
          (uploads ?? []).map(async (upload: any) => {
            const { count: totalCount } = await supabase
              .from('business_records')
              .select('*', { count: 'exact', head: true })
              .eq('file_id', upload.id);

            const { count: reviewedCount } = await supabase
              .from('business_records')
              .select('*', { count: 'exact', head: true })
              .eq('file_id', upload.id)
              .in('status', ['compliant', 'non_compliant', 'for_inspection', 'active']);

            const total = totalCount ?? 0;
            const reviewed = reviewedCount ?? 0;

            let derivedStatus: string;
            if (total === 0 || reviewed === 0) {
              derivedStatus = 'not_reviewed';
            } else if (reviewed < total) {
              derivedStatus = 'processing';
            } else {
              derivedStatus = 'completed';
            }

            // ── Format file_size from Supabase ──────────────────────────────
            let formattedSize = '-';
            if (upload.file_size) {
              if (upload.file_size < 1024 * 1024) {
                formattedSize = `${(upload.file_size / 1024).toFixed(1)} KB`;
              } else {
                formattedSize = `${(upload.file_size / (1024 * 1024)).toFixed(1)} MB`;
              }
            }

            return {
              id: upload.id,
              name: upload.file_name,
              uploadDate: new Date(upload.uploaded_at).toLocaleString(),
              size: formattedSize,
              rows: total,
              successCount: total,
              status: derivedStatus,
            };
          })
        );

        setCSVFiles(filesWithStatus);
      } catch (err) {
        console.error('❌ Exception in fetchUploadedFiles:', err);
      }
    };

    fetchUploadedFiles();
  }, []);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) handleFile(e.target.files[0]);
  };

  const handleFile = (file: File) => {
    const tempId = Date.now().toString();

    // Format size for immediate display on the temp card
    const formattedSize = file.size < 1024 * 1024
      ? `${(file.size / 1024).toFixed(1)} KB`
      : `${(file.size / (1024 * 1024)).toFixed(1)} MB`;

    const newCSV: CSVFile = {
      id: tempId,
      name: file.name,
      uploadDate: new Date().toLocaleString(),
      size: formattedSize,
      rows: 0,
      status: 'processing',
    };

    setCSVFiles(prev => [newCSV, ...prev]);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      beforeFirstChunk: (chunk) => {
        const lines = chunk.split('\n');
        const firstLine = lines[0].trim().replace(/\r/g, '');
        if (firstLine.startsWith('Business Identification Number')) {
          return chunk;
        }
        return lines.slice(5).join('\n');
      },
      transformHeader: (header: string) => {
        return header.trim().replace(/\r/g, '').replace(/\s+/g, ' ');
      },
      complete: async (results) => {
        const rows = results.data as Record<string, any>[];
        setUploadProgress({ current: 0, total: rows.length });

        try {
          const res = await fetch("/api/business-records", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            // ── Send fileSize (in bytes) to the API ──────────────────────────
            body: JSON.stringify({ rows, fileName: file.name, fileSize: file.size }),
          });

          const data = await res.json();
          if (!res.ok) throw new Error(data.error ?? "API error");

          setUploadProgress({ current: rows.length, total: rows.length });

          setCSVFiles(prev => prev.map(f =>
            f.id === tempId
              ? {
                ...f,
                id: data.fileId ?? tempId,
                status: data.errorCount === 0 ? 'not_reviewed' : data.successCount === 0 && data.skippedCount === 0 ? 'error' : 'not_reviewed',
                rows: data.successCount,
                successCount: data.successCount,
                errorCount: data.errorCount,
                skippedCount: data.skippedCount,
                errors: data.errors?.length > 0 ? data.errors : undefined,
              }
              : f
          ));
        } catch (err: any) {
          setCSVFiles(prev => prev.map(f =>
            f.id === tempId ? { ...f, status: 'error', errors: [err.message] } : f
          ));
        } finally {
          setUploadProgress(null);
        }
      },
      error: (err) => {
        setCSVFiles(prev => prev.map(f =>
          f.id === tempId ? { ...f, status: 'error', errors: [err.message] } : f
        ));
        setUploadProgress(null);
      }
    });
  };

  const handleDeleteConfirm = async () => {
    if (!fileToDelete) return;
    setIsDeleting(true);
    try {
      const { error: recordsError } = await supabase
        .from('business_records')
        .delete()
        .eq('file_id', fileToDelete.id);

      if (recordsError) { console.error('❌ delete business_records error:', recordsError); return; }

      const { error: uploadError } = await supabase
        .from('csv_uploads')
        .delete()
        .eq('id', fileToDelete.id);

      if (uploadError) { console.error('❌ delete csv_uploads error:', uploadError); return; }

      setCSVFiles(prev => prev.filter(f => f.id !== fileToDelete.id));
      setFileToDelete(null);
    } catch (err) {
      console.error('❌ Exception in handleDeleteConfirm:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDownload = async (e: React.MouseEvent, file: CSVFile) => {
    e.stopPropagation();
    try {
      const { data, error } = await supabase
        .from('business_records')
        .select('*')
        .eq('file_id', file.id);

      if (error || !data) { console.error('❌ download fetch error:', error); return; }

      const csv = Papa.unparse(data);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${file.name.replace('.csv', '')}_with_review.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('❌ Exception in handleDownload:', err);
    }
  };

  const getStatusStyle = (status?: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'not_reviewed': return 'bg-gray-100 text-gray-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredFiles = csvFiles.filter(file => {
    return !selectedStatus || file.status === selectedStatus;
  });

  const totalPages = Math.ceil(filteredFiles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedFiles = filteredFiles.slice(startIndex, endIndex);

  if (isMobile === null) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="mb-5">
            <div className="h-8 w-52 bg-gray-200 rounded-lg animate-pulse mb-2" />
            <div className="h-4 w-64 bg-gray-100 rounded animate-pulse" />
          </div>
          <div className="mb-5 h-32 bg-gray-100 rounded-xl border-2 border-dashed border-gray-200 animate-pulse" />
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
              <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="p-4 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Sidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        isMobile={isMobile}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      <div className="min-h-screen bg-gray-50 pt-1" style={{ paddingBottom: isMobile ? 80 : 0 }}>
        <div className={`${isMobile ? 'px-3 py-5' : 'max-w-7xl mx-auto px-4 py-6'}`}>

          {/* Header */}
          <div className="mb-5">
            <h1 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-gray-900 mb-1`}>
              CSV File Manager
            </h1>
            <p className="text-sm text-gray-500">Upload and manage your CSV data files</p>
          </div>

          {/* Upload Progress Banner */}
          <div className={`transition-all duration-300 overflow-hidden ${uploadProgress ? 'mb-4 max-h-24 opacity-100' : 'mb-0 max-h-0 opacity-0'}`}>
            {uploadProgress && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-blue-800">
                    Inserting records... {uploadProgress.current} / {uploadProgress.total}
                  </span>
                  <span className="text-sm text-blue-600">
                    {Math.round((uploadProgress.current / uploadProgress.total) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-blue-600 transition-all duration-200"
                    style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Upload Area */}
          <div className="mb-5">
            <div
              className={`relative border-2 border-dashed rounded-xl p-5 text-center transition-colors ${dragActive ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-white hover:border-green-400'
                }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileInput}
                className="hidden"
              />
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mb-2">
                  <FiUpload className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1">
                  {isMobile ? 'Tap to upload CSV' : 'Drop CSV files here'}
                </h3>
                {!isMobile && <p className="text-gray-500 mb-3 text-xs">or click to browse</p>}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={!!uploadProgress}
                  className="bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium px-4 py-2 rounded-lg transition-colors text-sm mt-1"
                >
                  {uploadProgress ? 'Uploading...' : 'Select File'}
                </button>
              </div>
            </div>
          </div>

          {/* Files Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">

            {/* Header + Filter */}
            <div className="px-4 py-3 border-b border-gray-200">
              <div className={`${isMobile ? 'space-y-2' : 'flex items-center justify-between'}`}>
                <h2 className="text-base font-semibold text-gray-900">Uploaded Files</h2>
                <div className={`${isMobile ? 'flex items-center gap-2 w-full' : 'flex items-center gap-4'}`}>
                  <div className="flex items-center gap-2 flex-1">
                    <FiFilter className="w-4 h-4 text-gray-400 shrink-0" />
                    <select
                      value={selectedStatus}
                      onChange={(e) => { setSelectedStatus(e.target.value); setCurrentPage(1); }}
                      className="flex-1 px-2 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-700"
                    >
                      <option value="">All Status</option>
                      <option value="not_reviewed">Not Reviewed</option>
                      <option value="processing">Processing</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                  <span className="text-xs text-gray-400 shrink-0 min-w-[48px] text-right">
                    {filteredFiles.length} file{filteredFiles.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>

            <div className="relative" style={{ minHeight: isMobile ? '200px' : '200px' }}>

              {/* Mobile Cards */}
              {isMobile ? (
                <div className="divide-y divide-gray-100">
                  {paginatedFiles.length === 0 ? (
                    <div className="py-16 text-center text-sm text-gray-400 px-4">
                      No files uploaded yet. Tap the button above to get started.
                    </div>
                  ) : (
                    paginatedFiles.map((file) => (
                      <div key={file.id}>
                        <div className="p-4 transition-colors">

                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <FiFile className="w-4 h-4 text-green-600 shrink-0" />
                              <p className="text-sm font-semibold text-gray-900 truncate">
                                {file.name}
                              </p>
                            </div>
                            {file.status && (
                              <span className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusStyle(file.status)}`}>
                                {file.status.replace(/_/g, ' ').toUpperCase()}
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-gray-400 flex items-center gap-1 mb-1">
                            <FiClock className="w-3 h-3" />
                            {file.uploadDate}
                          </p>

                          {/* ── File size display ── */}
                          <p className="text-xs text-gray-400 mb-2">{file.size}</p>

                          <div className="flex flex-wrap gap-1.5 mb-3">
                            {file.status === 'processing' && !file.successCount ? (
                              <span className="text-xs text-gray-400 flex items-center gap-1">
                                <FiClock className="w-3 h-3" /> Processing...
                              </span>
                            ) : (
                              <>
                                {file.successCount != null && (
                                  <span className="px-2 py-0.5 bg-green-50 text-green-700 text-xs rounded-full">
                                    ✓ {file.successCount} inserted
                                  </span>
                                )}
                                {file.skippedCount != null && file.skippedCount > 0 && (
                                  <span className="px-2 py-0.5 bg-yellow-50 text-yellow-700 text-xs rounded-full">
                                    ⟳ {file.skippedCount} skipped. It is already exist.
                                  </span>
                                )}
                                {file.errorCount != null && file.errorCount > 0 && (
                                  <span className="px-2 py-0.5 bg-red-50 text-red-700 text-xs rounded-full">
                                    ✗ {file.errorCount} failed
                                  </span>
                                )}
                              </>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => { e.stopPropagation(); setFileToDelete(file); }}
                              className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 text-xs font-medium rounded-lg hover:bg-red-100 transition-colors active:scale-95"
                            >
                              <FiTrash2 className="w-3.5 h-3.5" />
                              Delete
                            </button>
                          </div>
                        </div>

                        {file.errors && file.errors.length > 0 && (
                          <div className="mx-4 mb-3 p-3 bg-red-50 rounded-xl border border-red-100">
                            <div className="flex items-start gap-2">
                              <FiAlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                              <div>
                                <p className="text-xs font-semibold text-red-700 mb-1">Insert errors:</p>
                                <ul className="text-xs text-red-600 space-y-0.5">
                                  {file.errors.map((err, i) => (
                                    <li key={i}>• {err}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>

              ) : (
                /* Desktop Table */
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File Name</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Upload Date</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Results</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {paginatedFiles.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-4 py-10 text-center text-sm text-gray-400">
                            No files uploaded yet. Upload a CSV file to get started.
                          </td>
                        </tr>
                      ) : (
                        paginatedFiles.map((file) => (
                          <React.Fragment key={file.id}>
                            <tr className="hover:bg-gray-50">
                              <td className="px-4 py-3 whitespace-nowrap">
                                <div className="flex items-center">
                                  <FiFile className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                                  <span className="text-sm font-medium text-gray-900 truncate max-w-[180px]">{file.name}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{file.uploadDate}</td>
                              {/* ── File size column ── */}
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{file.size}</td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm">
                                {file.status === 'processing' && !file.successCount ? (
                                  <span className="text-gray-400 flex items-center">
                                    <FiClock className="w-3 h-3 mr-1" /> Processing...
                                  </span>
                                ) : (
                                  <div className="space-y-0.5">
                                    {file.successCount != null && (
                                      <div className="text-green-600 text-xs">✓ {file.successCount} inserted</div>
                                    )}
                                    {file.skippedCount != null && file.skippedCount > 0 && (
                                      <div className="text-yellow-600 text-xs">⟳ {file.skippedCount} skipped. It is already exist.</div>
                                    )}
                                    {file.errorCount != null && file.errorCount > 0 && (
                                      <div className="text-red-500 text-xs">✗ {file.errorCount} failed</div>
                                    )}
                                  </div>
                                )}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                {file.status && (
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusStyle(file.status)}`}>
                                    {file.status.replace(/_/g, ' ').toUpperCase()}
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                                <div className="flex items-center justify-end space-x-2">
                  
                                  <button
                                    className="text-red-600 hover:text-red-900 p-1"
                                    onClick={(e) => { e.stopPropagation(); setFileToDelete(file); }}
                                  >
                                    <FiTrash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                            {file.errors && file.errors.length > 0 && (
                              <tr className="bg-red-50">
                                <td colSpan={6} className="px-4 py-2">
                                  <div className="flex items-start space-x-2">
                                    <FiAlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                                    <div>
                                      <p className="text-xs font-medium text-red-700 mb-1">Insert errors (first 10 shown):</p>
                                      <ul className="text-xs text-red-600 space-y-0.5">
                                        {file.errors.map((err, i) => (
                                          <li key={i}>• {err}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-[1.5vw] py-[1vh] border-t border-gray-200 bg-gray-50 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-center" style={{ fontSize: 'clamp(10px, 1vw, 14px)', color: '#6b7280' }}>
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex items-center justify-center flex-wrap" style={{ gap: 'clamp(2px, 0.4vw, 6px)' }}>
                  <button
                    onClick={() => setCurrentPage(p => p - 1)}
                    disabled={currentPage === 1}
                    className="flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    style={{ width: 'clamp(26px, 2.2vw, 40px)', height: 'clamp(26px, 2.2vw, 40px)' }}
                  >
                    <FiChevronLeft style={{ width: 'clamp(11px, 1vw, 16px)', height: 'clamp(11px, 1vw, 16px)' }} />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`flex items-center justify-center rounded-lg font-medium transition-colors ${currentPage === pageNum
                        ? 'bg-green-600 text-white'
                        : 'border border-gray-200 hover:bg-gray-100 text-gray-700'
                        }`}
                      style={{
                        width: 'clamp(26px, 2.2vw, 40px)',
                        height: 'clamp(26px, 2.2vw, 40px)',
                        fontSize: 'clamp(10px, 1vw, 14px)',
                      }}
                    >
                      {pageNum}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(p => p + 1)}
                    disabled={currentPage === totalPages}
                    className="flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    style={{ width: 'clamp(26px, 2.2vw, 40px)', height: 'clamp(26px, 2.2vw, 40px)' }}
                  >
                    <FiChevronRight style={{ width: 'clamp(11px, 1vw, 16px)', height: 'clamp(11px, 1vw, 16px)' }} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <DeleteConfirmModal
        file={fileToDelete}
        isDeleting={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setFileToDelete(null)}
      />

    </>
  );
}

export default function CSVManager() {
  return (
    <ProtectedRoute requiredRole="staff">
      <CSVManagerContent />
    </ProtectedRoute>
  );
}