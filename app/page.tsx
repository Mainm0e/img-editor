"use client";
import { useState, useRef, useCallback } from "react";
import ImageEditor from "../components/ImageEditor";
import BatchConverter from "../components/BatchConverter";

export default function Home() {
  const [file, setFile] = useState<string | null>(null);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [showBatchConverter, setShowBatchConverter] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (selectedFile: File) => {
    if (selectedFile && selectedFile.type.startsWith('image/')) {
      setOriginalFile(selectedFile);
      setFile(URL.createObjectURL(selectedFile));
    }
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleQuickConvert = async () => {
    if (!originalFile) return;
    
    setIsProcessing(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result?.toString().split(',')[1];
        
        const response = await fetch('/api/convert', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            image: base64,
            format: 'jpeg',
            quality: 90,
            width: 800
          })
        });
        
        if (response.ok) {
          const processedBase64 = await response.text();
          
          const link = document.createElement('a');
          link.href = `data:image/jpeg;base64,${processedBase64}`;
          link.download = `converted_${originalFile.name.split('.')[0]}.jpg`;
          link.click();
        }
      };
      reader.readAsDataURL(originalFile);
    } catch (error) {
      console.error('Error processing image:', error);
    }
    setIsProcessing(false);
  };

  const handleEditorSave = async (editedImageData: string, settings: any) => {
    setIsProcessing(true);
    try {
      const response = await fetch('/api/convert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: editedImageData,
          format: settings.format,
          quality: settings.quality,
          width: settings.width,
          height: settings.height,
          rotate: settings.rotation,
          filters: {
            brightness: settings.brightness,
            contrast: settings.contrast,
            saturation: settings.saturation,
            blur: settings.blur
          }
        })
      });
      
      if (response.ok) {
        const processedBase64 = await response.text();
        
        const link = document.createElement('a');
        link.href = `data:image/${settings.format};base64,${processedBase64}`;
        link.download = `edited_${originalFile?.name.split('.')[0]}.${settings.format}`;
        link.click();
        
        setShowEditor(false);
      }
    } catch (error) {
      console.error('Error processing image:', error);
    }
    setIsProcessing(false);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-purple-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-black mb-2">Image Editor & Converter</h1>
          <p className="text-black">Upload, edit, and convert your images with professional tools</p>
        </div>

        {/* Upload Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 cursor-pointer ${
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
            onChange={handleUpload}
            className="hidden"
          />
          
          {file ? (
            <div className="space-y-4">
              <img 
                src={file} 
                alt="preview" 
                className="max-w-full max-h-96 mx-auto rounded-lg shadow-lg"
              />
              <p className="text-sm text-black">Click to change image</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-6xl text-gray-400">📷</div>
              <div>
                <p className="text-xl font-semibold text-black mb-2">
                  Drop your image here or click to browse
                </p>
                <p className="text-black">Supports JPG, PNG, WEBP, HEIC and more</p>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {file && (
          <div className="mt-8 space-y-4">
            {/* Primary Actions */}
            <div className="flex flex-wrap gap-4 justify-center">
              <button
                onClick={() => setShowEditor(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <span>🎨</span>
                Edit Image
              </button>
              
              <button
                onClick={handleQuickConvert}
                disabled={isProcessing}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <span>⚡</span>
                {isProcessing ? 'Processing...' : 'Quick Convert'}
              </button>
              
              <button
                onClick={() => setShowBatchConverter(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <span>📁</span>
                Batch Convert
              </button>
            </div>

            {/* Secondary Actions */}
            <div className="flex flex-wrap gap-2 justify-center">
              <button
                onClick={() => {
                  setFile(null);
                  setOriginalFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Clear Image
              </button>
            </div>

            {/* Format Info */}
            <div className="text-center text-sm text-black">
              <p><strong>Quick Convert:</strong> Resize to 800px width + optimize quality</p>
              <p><strong>Edit Image:</strong> Full editor with crop, filters, and custom settings</p>
            </div>
          </div>
        )}

        {/* Batch Converter Section */}
        {!file && (
          <div className="mt-8 text-center">
            <button
              onClick={() => setShowBatchConverter(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg font-medium transition-colors flex items-center gap-3 mx-auto"
            >
              <span className="text-2xl">📁</span>
              <div className="text-left">
                <div className="font-bold">Batch Convert Multiple Images</div>
                <div className="text-sm opacity-90">Convert many images to WebP, JPEG, or PNG at once</div>
              </div>
            </button>
          </div>
        )}

        {/* Features Grid */}
        {!file && (
          <div className="mt-12 grid md:grid-cols-4 gap-6">
            <div className="text-center p-6 bg-white rounded-lg shadow-sm">
              <div className="text-3xl mb-3">✂️</div>
              <h3 className="font-semibold mb-2 text-black">Crop & Resize</h3>
              <p className="text-black text-sm">Perfect your composition with precise cropping and smart resizing</p>
            </div>
            
            <div className="text-center p-6 bg-white rounded-lg shadow-sm">
              <div className="text-3xl mb-3">🎛️</div>
              <h3 className="font-semibold mb-2 text-black">Adjust & Filter</h3>
              <p className="text-black text-sm">Fine-tune brightness, contrast, saturation and apply effects</p>
            </div>
            
            <div className="text-center p-6 bg-white rounded-lg shadow-sm">
              <div className="text-3xl mb-3">💾</div>
              <h3 className="font-semibold mb-2 text-black">Convert Format</h3>
              <p className="text-black text-sm">Export to JPEG, PNG, or WebP with custom quality settings</p>
            </div>
            
            <div className="text-center p-6 bg-white rounded-lg shadow-sm">
              <div className="text-3xl mb-3">📁</div>
              <h3 className="font-semibold mb-2 text-black">Batch Processing</h3>
              <p className="text-black text-sm">Convert multiple images simultaneously with the same settings</p>
            </div>
          </div>
        )}
      </div>

      {/* Image Editor Modal */}
      {showEditor && file && (
        <ImageEditor
          imageSrc={file}
          onSave={handleEditorSave}
          onCancel={() => setShowEditor(false)}
        />
      )}

      {/* Batch Converter Modal */}
      {showBatchConverter && (
        <BatchConverter
          onClose={() => setShowBatchConverter(false)}
        />
      )}
    </div>
  );
}
