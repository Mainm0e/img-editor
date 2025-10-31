"use client";

import { useState, useRef, useCallback } from 'react';

interface BatchConverterProps {
  onClose: () => void;
}

interface BatchFile {
  id: string;
  file: File;
  preview: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  result?: string;
  error?: string;
}

interface BatchSettings {
  format: 'jpeg' | 'png' | 'webp';
  quality: number;
  width?: number;
  height?: number;
  maintainAspectRatio: boolean;
}

export default function BatchConverter({ onClose }: BatchConverterProps) {
  const [files, setFiles] = useState<BatchFile[]>([]);
  const [settings, setSettings] = useState<BatchSettings>({
    format: 'webp',
    quality: 85,
    maintainAspectRatio: true
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((selectedFiles: FileList) => {
    const newFiles: BatchFile[] = [];
    
    Array.from(selectedFiles).forEach((file, index) => {
      if (file.type.startsWith('image/')) {
        newFiles.push({
          id: `${Date.now()}-${index}`,
          file,
          preview: URL.createObjectURL(file),
          status: 'pending'
        });
      }
    });

    setFiles(prev => [...prev, ...newFiles]);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const removeFile = (id: string) => {
    setFiles(prev => {
      const file = prev.find(f => f.id === id);
      if (file) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter(f => f.id !== id);
    });
  };

  const processFile = async (batchFile: BatchFile): Promise<void> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64 = reader.result?.toString().split(',')[1];
          
          const response = await fetch('/api/convert', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              image: base64,
              format: settings.format,
              quality: settings.quality,
              width: settings.width,
              height: settings.height
            })
          });
          
          if (response.ok) {
            const processedBase64 = await response.text();
            
            setFiles(prev => prev.map(f => 
              f.id === batchFile.id 
                ? { ...f, status: 'completed', result: processedBase64 }
                : f
            ));
          } else {
            throw new Error('Conversion failed');
          }
        } catch (error) {
          setFiles(prev => prev.map(f => 
            f.id === batchFile.id 
              ? { ...f, status: 'error', error: 'Failed to process' }
              : f
          ));
        }
        resolve();
      };
      reader.readAsDataURL(batchFile.file);
    });
  };

  const processAllFiles = async () => {
    setIsProcessing(true);
    
    // Update all files to processing status
    setFiles(prev => prev.map(f => ({ ...f, status: 'processing' as const })));

    // Process files sequentially to avoid overwhelming the server
    for (const file of files) {
      await processFile(file);
    }
    
    setIsProcessing(false);
  };

  const downloadAll = () => {
    files.forEach(file => {
      if (file.status === 'completed' && file.result) {
        const link = document.createElement('a');
        link.href = `data:image/${settings.format};base64,${file.result}`;
        link.download = `${file.file.name.split('.')[0]}.${settings.format}`;
        link.click();
      }
    });
  };

  const downloadSingle = (file: BatchFile) => {
    if (file.status === 'completed' && file.result) {
      const link = document.createElement('a');
      link.href = `data:image/${settings.format};base64,${file.result}`;
      link.download = `${file.file.name.split('.')[0]}.${settings.format}`;
      link.click();
    }
  };

  const completedCount = files.filter(f => f.status === 'completed').length;
  const errorCount = files.filter(f => f.status === 'error').length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-black">Batch Image Converter</h2>
              <p className="text-black">Convert multiple images at once</p>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              ✕ Close
            </button>
          </div>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* Settings Panel */}
          <div className="w-80 border-r bg-gray-50 p-6 overflow-auto">
            <h3 className="font-semibold text-black mb-4">Conversion Settings</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-black mb-2">Output Format</label>
                <select
                  value={settings.format}
                  onChange={(e) => setSettings(prev => ({ ...prev, format: e.target.value as any }))}
                  className="w-full px-3 py-2 border rounded"
                >
                  <option value="webp">WebP (Recommended)</option>
                  <option value="jpeg">JPEG</option>
                  <option value="png">PNG</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">Quality: {settings.quality}%</label>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={settings.quality}
                  onChange={(e) => setSettings(prev => ({ ...prev, quality: Number(e.target.value) }))}
                  className="w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-black mb-1">Max Width</label>
                  <input
                    type="number"
                    value={settings.width || ''}
                    onChange={(e) => setSettings(prev => ({ ...prev, width: Number(e.target.value) || undefined }))}
                    className="w-full px-2 py-1 border rounded"
                    placeholder="Auto"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-1">Max Height</label>
                  <input
                    type="number"
                    value={settings.height || ''}
                    onChange={(e) => setSettings(prev => ({ ...prev, height: Number(e.target.value) || undefined }))}
                    className="w-full px-2 py-1 border rounded"
                    placeholder="Auto"
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="aspectRatio"
                  checked={settings.maintainAspectRatio}
                  onChange={(e) => setSettings(prev => ({ ...prev, maintainAspectRatio: e.target.checked }))}
                  className="mr-2"
                />
                <label htmlFor="aspectRatio" className="text-sm text-black">Maintain aspect ratio</label>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-4">
                <button
                  onClick={processAllFiles}
                  disabled={files.length === 0 || isProcessing}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium transition-colors disabled:opacity-50"
                >
                  {isProcessing ? 'Converting...' : `Convert ${files.length} Images`}
                </button>
                
                <button
                  onClick={downloadAll}
                  disabled={completedCount === 0}
                  className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-medium transition-colors disabled:opacity-50"
                >
                  Download All ({completedCount})
                </button>
              </div>

              {/* Progress Info */}
              {files.length > 0 && (
                <div className="text-sm text-black bg-white p-3 rounded border">
                  <div>Total: {files.length}</div>
                  <div>Completed: {completedCount}</div>
                  {errorCount > 0 && <div className="text-red-600">Errors: {errorCount}</div>}
                </div>
              )}
            </div>
          </div>

          {/* File Area */}
          <div className="flex-1 p-6 overflow-auto">
            {/* Upload Area */}
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center mb-6 transition-all duration-200 cursor-pointer ${
                isDragging
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
                className="hidden"
              />
              
              <div className="space-y-4">
                <div className="text-6xl text-gray-400">📁</div>
                <div>
                  <p className="text-xl font-semibold text-black mb-2">
                    Drop multiple images here or click to browse
                  </p>
                  <p className="text-black">Select multiple files at once for batch conversion</p>
                </div>
              </div>
            </div>

            {/* File List */}
            {files.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {files.map(file => (
                  <div key={file.id} className="border rounded-lg p-4 bg-white">
                    <img
                      src={file.preview}
                      alt={file.file.name}
                      className="w-full h-32 object-cover rounded mb-2"
                    />
                    
                    <p className="text-sm font-medium text-black truncate mb-2">
                      {file.file.name}
                    </p>
                    
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-xs px-2 py-1 rounded ${
                        file.status === 'pending' ? 'bg-gray-100 text-gray-700' :
                        file.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                        file.status === 'completed' ? 'bg-green-100 text-green-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {file.status === 'pending' ? 'Pending' :
                         file.status === 'processing' ? 'Processing...' :
                         file.status === 'completed' ? 'Completed' :
                         'Error'}
                      </span>
                      
                      <button
                        onClick={() => removeFile(file.id)}
                        className="text-red-500 hover:text-red-700 text-sm"
                        disabled={isProcessing}
                      >
                        Remove
                      </button>
                    </div>

                    {file.status === 'completed' && (
                      <button
                        onClick={() => downloadSingle(file)}
                        className="w-full bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                      >
                        Download
                      </button>
                    )}

                    {file.status === 'error' && (
                      <p className="text-xs text-red-600">{file.error}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}