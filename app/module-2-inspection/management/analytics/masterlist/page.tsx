"use client";

import { useState, useRef } from "react";
import { FiUpload, FiFile, FiCheck, FiClock, FiX, FiDownload, FiTrash2, FiEye } from "react-icons/fi";

interface CSVFile {
  id: string;
  name: string;
  uploadDate: string;
  status: 'processing' | 'completed' | 'error';
  size: string;
  rows: number;
}

export default function CSVManager() {
  const [csvFiles, setCSVFiles] = useState<CSVFile[]>([
    {
      id: '1',
      name: 'business_list_2024.csv',
      uploadDate: '2024-01-15 10:30 AM',
      status: 'completed',
      size: '2.4 MB',
      rows: 1250
    },
    {
      id: '2', 
      name: 'violations_january.csv',
      uploadDate: '2024-01-14 3:45 PM',
      status: 'processing',
      size: '1.8 MB',
      rows: 0
    },
    {
      id: '3',
      name: 'compliance_data.csv',
      uploadDate: '2024-01-13 9:15 AM',
      status: 'error',
      size: '3.1 MB',
      rows: 0
    }
  ]);
  
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    const newCSV: CSVFile = {
      id: Date.now().toString(),
      name: file.name,
      uploadDate: new Date().toLocaleString(),
      status: 'processing',
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      rows: 0
    };
    
    setCSVFiles(prev => [newCSV, ...prev]);
    
    // Simulate processing
    setTimeout(() => {
      setCSVFiles(prev => prev.map(f => 
        f.id === newCSV.id 
          ? { ...f, status: 'completed', rows: Math.floor(Math.random() * 2000) + 500 }
          : f
      ));
    }, 3000);
  };

  const getStatusIcon = (status: CSVFile['status']) => {
    switch (status) {
      case 'completed':
        return <FiCheck className="w-5 h-5 text-green-600" />;
      case 'processing':
        return <FiClock className="w-5 h-5 text-yellow-600" />;
      case 'error':
        return <FiX className="w-5 h-5 text-red-600" />;
    }
  };

  const getStatusBadge = (status: CSVFile['status']) => {
    const baseClass = "px-3 py-1 rounded-full text-xs font-medium";
    switch (status) {
      case 'completed':
        return `${baseClass} bg-green-100 text-green-800`;
      case 'processing':
        return `${baseClass} bg-yellow-100 text-yellow-800`;
      case 'error':
        return `${baseClass} bg-red-100 text-red-800`;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">CSV File Manager</h1>
          <p className="text-gray-600">Upload and manage your CSV data files</p>
        </div>

        {/* Upload Area */}
        <div className="mb-8">
          <div
            className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
              dragActive 
                ? 'border-green-500 bg-green-50' 
                : 'border-gray-300 bg-white hover:border-green-400'
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
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <FiUpload className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Drop CSV files here
              </h3>
              <p className="text-gray-600 mb-4">or click to browse</p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-green-600 hover:bg-green-700 text-white font-medium px-6 py-2 rounded-lg transition-colors"
              >
                Select Files
              </button>
            </div>
          </div>
        </div>

        {/* Files Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Uploaded Files</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    File Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Upload Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Size
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rows
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {csvFiles.map((file) => (
                  <tr key={file.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FiFile className="w-5 h-5 text-green-600 mr-3" />
                        <span className="text-sm font-medium text-gray-900">{file.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {file.uploadDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {file.size}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {file.rows.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(file.status)}
                        <span className={`ml-2 ${getStatusBadge(file.status)}`}>
                          {file.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button className="text-green-600 hover:text-green-900 p-1">
                          <FiEye className="w-4 h-4" />
                        </button>
                        <button className="text-gray-600 hover:text-gray-900 p-1">
                          <FiDownload className="w-4 h-4" />
                        </button>
                        <button className="text-red-600 hover:text-red-900 p-1">
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}