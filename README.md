# 🎨 Image Editor & Converter

A modern, web-based image editor and batch converter built with Next.js. Edit, convert, and optimize your images with professional tools directly in your browser.

![Image Editor Preview](https://img.shields.io/badge/Next.js-16.0.1-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19.2.0-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1.16-38B2AC?style=for-the-badge&logo=tailwind-css)

## ✨ Features

### 🖼️ Single Image Editor
- **Crop & Resize**: Precise cropping with visual guides and smart resizing
- **Transform**: Rotation controls with live preview
- **Filters**: Brightness, contrast, saturation, and blur adjustments
- **Format Export**: Convert to JPEG, PNG, or WebP with quality control
- **Real-time Preview**: See changes instantly as you edit

### 📁 Batch Converter
- **Multi-file Upload**: Drag & drop or browse multiple images at once
- **Bulk Processing**: Convert dozens of images simultaneously
- **Format Options**: Convert to WebP, JPEG, or PNG
- **Resize Options**: Set maximum width/height with aspect ratio preservation
- **Progress Tracking**: Visual status for each file conversion
- **Bulk Download**: Download all converted images at once

### 🚀 Quick Convert
- **One-click Optimization**: Instant resize to 800px width with quality optimization
- **Smart Compression**: Automatic quality settings for best file size
- **Fast Processing**: Perfect for quick social media or web optimization

## 🛠️ Tech Stack

- **Frontend**: Next.js 16 with React 19 and TypeScript
- **Styling**: Tailwind CSS 4 with responsive design
- **Image Processing**: Sharp (server-side) + HTML5 Canvas (client-side)
- **Cropping**: react-image-crop library
- **File Handling**: FileReader API with drag-and-drop support

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Mainm0e/img-editor.git
   cd img-editor
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   ```
   http://localhost:3000
   ```

## 📖 Usage Guide

### Single Image Editing

1. **Upload**: Drag & drop an image or click to browse
2. **Choose Mode**:
   - **Quick Convert**: One-click optimization
   - **Edit Image**: Full editor with advanced tools

#### Edit Image Features:
- **Crop & Resize Tab**: 
  - Adjust rotation (-180° to +180°)
  - Set custom width and height
  - Precise cropping with visual guides
  
- **Adjust Tab**:
  - Brightness (0.5x to 2x)
  - Contrast (0.5x to 2x)
  - Saturation (0x to 2x)
  - Blur (0px to 10px)
  
- **Export Tab**:
  - Choose format (JPEG, PNG, WebP)
  - Set quality (10% to 100%)

### Batch Conversion

1. **Access**: Click "Batch Convert Multiple Images"
2. **Upload**: Select or drag multiple images
3. **Configure Settings**:
   - **Format**: WebP (recommended), JPEG, or PNG
   - **Quality**: 10-100% (85% default for WebP)
   - **Resize**: Optional max width/height
   - **Aspect Ratio**: Maintain proportions
4. **Convert**: Click "Convert X Images"
5. **Download**: Individual files or bulk download

## 🎯 Use Cases

### Web Optimization
- Convert images to WebP for 25-50% smaller file sizes
- Batch resize photos for consistent web display
- Optimize quality vs file size for faster loading

### Social Media
- Resize images for Instagram, Facebook, Twitter
- Apply filters and adjustments for better engagement
- Convert formats for platform compatibility

### Photography
- Batch process photo shoots
- Apply consistent edits across multiple images
- Convert RAW/HEIC files to standard formats

### Email & Sharing
- Reduce file sizes for email attachments
- Convert incompatible formats (HEIC to JPEG)
- Resize large photos for easy sharing

## 🏗️ Project Structure

```
img-editor/
├── app/
│   ├── api/
│   │   └── convert/
│   │       └── route.js          # Image processing API
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Main page
├── components/
│   ├── ImageEditor.tsx           # Single image editor
│   └── BatchConverter.tsx        # Batch conversion tool
├── public/                       # Static assets
├── package.json                  # Dependencies
└── README.md                     # This file
```

## 🔧 API Endpoints

### POST `/api/convert`

Convert and process images with various options.

**Request Body:**
```json
{
  "image": "base64-encoded-image",
  "format": "jpeg|png|webp",
  "quality": 90,
  "width": 800,
  "height": 600,
  "rotate": 90,
  "filters": {
    "brightness": 1.2,
    "contrast": 1.1,
    "saturation": 1.0,
    "blur": 0.5
  }
}
```

**Response:**
- Success: Base64-encoded processed image
- Error: JSON error message

## 🎨 Supported Formats

### Input Formats
- JPEG/JPG
- PNG
- WebP
- HEIC (iOS photos)
- TIFF
- BMP
- GIF (static)

### Output Formats
- **JPEG**: Best for photos, smaller file sizes
- **PNG**: Best for graphics with transparency
- **WebP**: Best compression, modern format (recommended)

## ⚡ Performance Features

- **Optimized Processing**: Sequential batch processing prevents server overload
- **Smart Compression**: Automatic quality optimization
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Real-time Preview**: Instant visual feedback
- **Error Handling**: Graceful failure handling with user feedback
