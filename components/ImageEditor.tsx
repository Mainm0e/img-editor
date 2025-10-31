"use client";

import { useState, useRef, useCallback } from 'react';
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

interface ImageEditorProps {
  imageSrc: string;
  onSave: (editedImageData: string, settings: EditSettings) => void;
  onCancel: () => void;
}

interface EditSettings {
  crop?: PixelCrop;
  rotation: number;
  brightness: number;
  contrast: number;
  saturation: number;
  blur: number;
  format: 'jpeg' | 'png' | 'webp';
  quality: number;
  width?: number;
  height?: number;
}

export default function ImageEditor({ imageSrc, onSave, onCancel }: ImageEditorProps) {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [rotation, setRotation] = useState(0);
  const [brightness, setBrightness] = useState(1);
  const [contrast, setContrast] = useState(1);
  const [saturation, setSaturation] = useState(1);
  const [blur, setBlur] = useState(0);
  const [format, setFormat] = useState<'jpeg' | 'png' | 'webp'>('jpeg');
  const [quality, setQuality] = useState(90);
  const [width, setWidth] = useState<number>();
  const [height, setHeight] = useState<number>();
  const [activeTab, setActiveTab] = useState<'crop' | 'adjust' | 'export'>('crop');

  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    setWidth(width);
    setHeight(height);
    
    const crop = centerCrop(
      makeAspectCrop({ unit: '%', width: 90 }, 16 / 9, width, height),
      width,
      height
    );
    setCrop(crop);
  }, []);

  const handleCropChange = useCallback((crop: Crop, percentCrop: Crop) => {
    setCrop(percentCrop);
  }, []);

  const handleCropComplete = useCallback((crop: PixelCrop) => {
    setCompletedCrop(crop);
  }, []);

  const drawCroppedImage = useCallback(() => {
    if (!imgRef.current || !canvasRef.current || !completedCrop) return null;

    const image = imgRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return null;

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    canvas.width = completedCrop.width * scaleX;
    canvas.height = completedCrop.height * scaleY;

    ctx.imageSmoothingQuality = 'high';

    // Apply filters
    ctx.filter = `
      brightness(${brightness})
      contrast(${contrast})
      saturate(${saturation})
      blur(${blur}px)
    `;

    // Apply rotation
    if (rotation !== 0) {
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.translate(-canvas.width / 2, -canvas.height / 2);
    }

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      canvas.width,
      canvas.height
    );

    return canvas.toDataURL(`image/${format}`, quality / 100);
  }, [completedCrop, brightness, contrast, saturation, blur, rotation, format, quality]);

  const handleSave = () => {
    const croppedImageData = drawCroppedImage();
    if (croppedImageData) {
      const settings: EditSettings = {
        crop: completedCrop,
        rotation,
        brightness,
        contrast,
        saturation,
        blur,
        format,
        quality,
        width,
        height
      };
      
      // Convert data URL to base64
      const base64Data = croppedImageData.split(',')[1];
      onSave(base64Data, settings);
    }
  };

  const resetFilters = () => {
    setBrightness(1);
    setContrast(1);
    setSaturation(1);
    setBlur(0);
    setRotation(0);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-4 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-xl text-black font-bold ">Edit Image</h2>
            <div className="flex gap-2">
              <button
                onClick={onCancel}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </div>
          
          {/* Tab Navigation */}
          <div className="flex gap-4 mt-4">
            {[
              { id: 'crop', label: 'Crop & Resize' },
              { id: 'adjust', label: 'Adjust' },
              { id: 'export', label: 'Export' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex h-[calc(90vh-180px)]">
          {/* Image Preview */}
          <div className="flex-1 p-4 overflow-auto">
            <div className="flex justify-center">
              <ReactCrop
                crop={crop}
                onChange={handleCropChange}
                onComplete={handleCropComplete}
                aspect={activeTab === 'crop' ? undefined : undefined}
              >
                <img
                  ref={imgRef}
                  src={imageSrc}
                  alt="Edit preview"
                  onLoad={onImageLoad}
                  className="max-w-full h-auto"
                  style={{
                    transform: `rotate(${rotation}deg)`,
                    filter: `brightness(${brightness}) contrast(${contrast}) saturate(${saturation}) blur(${blur}px)`
                  }}
                />
              </ReactCrop>
            </div>
            
            {/* Hidden canvas for processing */}
            <canvas ref={canvasRef} className="hidden" />
          </div>

          {/* Controls Panel */}
          <div className="w-80 border-l bg-gray-50 p-4 overflow-auto">
            {activeTab === 'crop' && (
              <div className="space-y-4">
                <h3 className="font-semibold">Crop & Transform</h3>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Rotation</label>
                  <input
                    type="range"
                    min="-180"
                    max="180"
                    value={rotation}
                    onChange={(e) => setRotation(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="text-sm text-gray-600">{rotation}°</div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium mb-1">Width</label>
                    <input
                      type="number"
                      value={width || ''}
                      onChange={(e) => setWidth(Number(e.target.value) || undefined)}
                      className="w-full px-2 py-1 border rounded"
                      placeholder="Auto"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Height</label>
                    <input
                      type="number"
                      value={height || ''}
                      onChange={(e) => setHeight(Number(e.target.value) || undefined)}
                      className="w-full px-2 py-1 border rounded"
                      placeholder="Auto"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'adjust' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold">Adjustments</h3>
                  <button
                    onClick={resetFilters}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Reset All
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Brightness</label>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={brightness}
                    onChange={(e) => setBrightness(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="text-sm text-gray-600">{brightness.toFixed(1)}</div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Contrast</label>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={contrast}
                    onChange={(e) => setContrast(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="text-sm text-gray-600">{contrast.toFixed(1)}</div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Saturation</label>
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={saturation}
                    onChange={(e) => setSaturation(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="text-sm text-gray-600">{saturation.toFixed(1)}</div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Blur</label>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="0.5"
                    value={blur}
                    onChange={(e) => setBlur(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="text-sm text-gray-600">{blur}px</div>
                </div>
              </div>
            )}

            {activeTab === 'export' && (
              <div className="space-y-4">
                <h3 className="font-semibold">Export Settings</h3>

                <div>
                  <label className="block text-sm font-medium mb-2">Format</label>
                  <select
                    value={format}
                    onChange={(e) => setFormat(e.target.value as any)}
                    className="w-full px-2 py-1 border rounded"
                  >
                    <option value="jpeg">JPEG</option>
                    <option value="png">PNG</option>
                    <option value="webp">WebP</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Quality</label>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={quality}
                    onChange={(e) => setQuality(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="text-sm text-gray-600">{quality}%</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}