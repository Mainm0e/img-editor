import sharp from "sharp";
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { image, format = 'jpeg', quality = 90, width, height, rotate, filters = {} } = body;
    
    if (!image) {
      return NextResponse.json({ error: 'No image data provided' }, { status: 400 });
    }

    const imgBuffer = Buffer.from(image, "base64");
    let sharpInstance = sharp(imgBuffer);

    // Apply resize if specified
    if (width || height) {
      sharpInstance = sharpInstance.resize(width, height, {
        fit: 'inside',
        withoutEnlargement: true
      });
    }

    // Apply rotation if specified
    if (rotate) {
      sharpInstance = sharpInstance.rotate(rotate);
    }

    // Apply filters
    if (filters.brightness !== undefined) {
      sharpInstance = sharpInstance.modulate({ brightness: filters.brightness });
    }
    if (filters.saturation !== undefined) {
      sharpInstance = sharpInstance.modulate({ saturation: filters.saturation });
    }
    if (filters.contrast !== undefined) {
      sharpInstance = sharpInstance.linear(filters.contrast, 0);
    }
    if (filters.blur !== undefined && filters.blur > 0) {
      // Sharp requires blur sigma to be between 0.3 and 1000
      const blurValue = Math.max(0.3, Math.min(1000, filters.blur));
      sharpInstance = sharpInstance.blur(blurValue);
    }
    if (filters.sharpen !== undefined && filters.sharpen > 0) {
      sharpInstance = sharpInstance.sharpen(filters.sharpen);
    }

    // Apply output format
    switch (format) {
      case 'png':
        sharpInstance = sharpInstance.png({ quality });
        break;
      case 'webp':
        sharpInstance = sharpInstance.webp({ quality });
        break;
      case 'jpeg':
      default:
        sharpInstance = sharpInstance.jpeg({ quality });
        break;
    }

    const processedBuffer = await sharpInstance.toBuffer();
    
    // Return base64 encoded image
    const base64Image = processedBuffer.toString("base64");
    return new NextResponse(base64Image, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
      },
    });

  } catch (error) {
    console.error('Image processing error:', error);
    return NextResponse.json({ error: 'Failed to process image' }, { status: 500 });
  }
}