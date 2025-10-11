import React, { useState, useRef } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Upload, X, File, CheckCircle2, AlertCircle } from 'lucide-react';
import { uploadFile, FileUploadOptions, formatFileSize } from '@/lib/storage';

interface FileUploadProps {
  onUploadComplete?: (result: { path: string; publicUrl: string }) => void;
  onUploadError?: (error: string) => void;
  options?: FileUploadOptions;
  multiple?: boolean;
  accept?: string;
  maxFiles?: number;
  className?: string;
}

interface UploadingFile {
  file: File;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  result?: { path: string; publicUrl: string };
  error?: string;
}

export default function FileUpload({
  onUploadComplete,
  onUploadError,
  options = {},
  multiple = false,
  accept = '.pdf,.doc,.docx,.xls,.xlsx,.csv,.jpg,.jpeg,.png,.gif',
  maxFiles = 5,
  className = ''
}: FileUploadProps) {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const fileArray = Array.from(files);
    const totalFiles = uploadingFiles.length + fileArray.length;

    if (totalFiles > maxFiles) {
      onUploadError?.(`Maximum ${maxFiles} files allowed`);
      return;
    }

    const newUploadingFiles: UploadingFile[] = fileArray.map(file => ({
      file,
      progress: 0,
      status: 'uploading' as const
    }));

    setUploadingFiles(prev => [...prev, ...newUploadingFiles]);

    // Start uploading each file
    fileArray.forEach((file, index) => {
      uploadFileWithProgress(file, uploadingFiles.length + index);
    });
  };

  const uploadFileWithProgress = async (file: File, index: number) => {
    try {
      // Simulate progress (since Supabase doesn't provide upload progress)
      const progressInterval = setInterval(() => {
        setUploadingFiles(prev => 
          prev.map((item, i) => 
            i === index && item.status === 'uploading'
              ? { ...item, progress: Math.min(item.progress + 10, 90) }
              : item
          )
        );
      }, 200);

      const result = await uploadFile(file, file.name, options);

      clearInterval(progressInterval);

      if (result.success && result.data) {
        setUploadingFiles(prev =>
          prev.map((item, i) =>
            i === index
              ? {
                  ...item,
                  progress: 100,
                  status: 'completed' as const,
                  result: {
                    path: result.data!.path,
                    publicUrl: result.data!.publicUrl
                  }
                }
              : item
          )
        );
        onUploadComplete?.(result.data);
      } else {
        setUploadingFiles(prev =>
          prev.map((item, i) =>
            i === index
              ? {
                  ...item,
                  status: 'error' as const,
                  error: result.error || 'Upload failed'
                }
              : item
          )
        );
        onUploadError?.(result.error || 'Upload failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setUploadingFiles(prev =>
        prev.map((item, i) =>
          i === index
            ? { ...item, status: 'error' as const, error: errorMessage }
            : item
        )
      );
      onUploadError?.(errorMessage);
    }
  };

  const removeFile = (index: number) => {
    setUploadingFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <Card
        className={`border-2 border-dashed transition-colors cursor-pointer ${
          isDragOver
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Upload className="w-12 h-12 text-gray-400 mb-4" />
          <p className="text-lg font-medium text-gray-700 mb-2">
            Drop files here or click to browse
          </p>
          <p className="text-sm text-gray-500 text-center">
            Supports: {accept.replace(/\./g, '').toUpperCase()}
            <br />
            Max {maxFiles} files, {formatFileSize(options.maxSize || 10 * 1024 * 1024)} each
          </p>
        </CardContent>
      </Card>

      <input
        ref={fileInputRef}
        type="file"
        multiple={multiple}
        accept={accept}
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
      />

      {/* Upload Progress */}
      {uploadingFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Upload Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {uploadingFiles.map((item, index) => (
              <div key={index} className="flex items-center space-x-3">
                <File className="w-5 h-5 text-gray-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {item.file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(item.file.size)}
                  </p>
                  {item.status === 'uploading' && (
                    <Progress value={item.progress} className="mt-1" />
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  {item.status === 'completed' && (
                    <Badge variant="success" className="flex items-center space-x-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Complete</span>
                    </Badge>
                  )}
                  {item.status === 'error' && (
                    <Badge variant="error" className="flex items-center space-x-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>Error</span>
                    </Badge>
                  )}
                  <Button
                    variant="ghost"
                    onClick={() => removeFile(index)}
                    className="p-1 w-8 h-8"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
