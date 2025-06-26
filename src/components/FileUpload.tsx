import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';

interface FileUploadProps {
  onFileUpload: (file: File) => void;
}

export default function FileUpload({ onFileUpload }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      if (file.type === 'application/pdf') {
        onFileUpload(file);
      } else {
        alert('Please upload a PDF file');
      }
    }
  }, [onFileUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: false,
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false),
    onDropAccepted: () => setIsDragging(false),
    onDropRejected: () => setIsDragging(false)
  });

  return (
    <div
      {...getRootProps()}
      className={`p-10 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 flex flex-col items-center justify-center ${
        isDragActive || isDragging ? 'border-indigo-500 bg-indigo-50/30' : 'border-gray-300 hover:border-indigo-400 hover:bg-indigo-50/10'
      }`}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center gap-5">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors duration-200 ${
          isDragActive || isDragging ? 'bg-indigo-100' : 'bg-indigo-50'
        }`}>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className={`w-8 h-8 transition-transform duration-200 ${
              isDragActive || isDragging ? 'text-indigo-600 scale-110' : 'text-indigo-500'
            }`}
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1.5} 
              d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
            />
          </svg>
        </div>
        <div className="text-center">
          <p className="text-lg font-medium text-gray-800 font-google-sans">
            {isDragActive ? 'Drop your lease agreement here' : 'Upload your lease agreement'}
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Drag and drop your PDF file here, or click to browse
          </p>
          <p className="mt-1 text-xs text-indigo-600">
            Supports PDF files up to 10MB
          </p>
        </div>
        <button
          type="button"
          className="mt-2 px-5 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg shadow-sm hover:bg-indigo-700 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200"
        >
          Select PDF
        </button>
      </div>
    </div>
  );
} 