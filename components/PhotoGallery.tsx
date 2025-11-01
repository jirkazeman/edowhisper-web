"use client";

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { Trash2, Camera, Upload, X, ZoomIn } from 'lucide-react';

interface PhotoGalleryProps {
  photos: string[];
  onAddPhoto: (file: File) => Promise<void>;
  onDeletePhoto: (index: number) => void;
  editable?: boolean;
  isUploading?: boolean;
}

export default function PhotoGallery({ 
  photos = [], 
  onAddPhoto, 
  onDeletePhoto,
  editable = true,
  isUploading = false 
}: PhotoGalleryProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      await onAddPhoto(files[0]);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('Nepodařilo se nahrát fotku.');
    }
  };

  const handleDeleteClick = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Opravdu chcete smazat tuto fotografii?')) {
      onDeletePhoto(index);
    }
  };

  return (
    <div className="space-y-4">
      {/* Hlavička */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Camera className="w-5 h-5 text-blue-600" />
          <h3 className="text-base font-semibold text-gray-900">Fotografie</h3>
          <span className="text-sm text-gray-500">({photos.length})</span>
        </div>
      </div>

      {/* Galerie */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {/* Tlačítko pro přidání fotky */}
        {editable && (
          <div className="relative">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              disabled={isUploading}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="w-full aspect-square border-2 border-dashed border-blue-500 rounded-xl 
                         hover:bg-blue-50 transition-colors flex flex-col items-center justify-center gap-2
                         disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {isUploading ? (
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              ) : (
                <>
                  <Upload className="w-8 h-8 text-blue-600 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium text-gray-600">Přidat</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Fotky */}
        {photos.map((uri, index) => (
          <div 
            key={index} 
            className="relative group cursor-pointer"
            onClick={() => setSelectedPhoto(uri)}
          >
            <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-gray-100">
              <Image 
                src={uri}
                alt={`Fotografie ${index + 1}`}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-200"
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
              />
              
              {/* Overlay při hover */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              {/* Tlačítko smazat */}
              {editable && (
                <button
                  onClick={(e) => handleDeleteClick(index, e)}
                  className="absolute top-2 right-2 w-8 h-8 bg-red-500 rounded-full 
                             flex items-center justify-center opacity-0 group-hover:opacity-100 
                             transition-opacity hover:bg-red-600 z-10"
                >
                  <Trash2 className="w-4 h-4 text-white" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Prázdný stav */}
      {photos.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
          <Camera className="w-12 h-12 text-gray-400 mb-3" />
          <p className="text-sm font-medium text-gray-600">Zatím žádné fotografie</p>
          <p className="text-sm text-gray-500 mt-1">Přidejte fotky zubů nebo RTG snímky</p>
        </div>
      )}

      {/* Fullscreen modal */}
      {selectedPhoto && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          {/* Tlačítko zavřít */}
          <button
            onClick={() => setSelectedPhoto(null)}
            className="absolute top-4 right-4 w-12 h-12 bg-white/10 hover:bg-white/20 
                       rounded-full flex items-center justify-center transition-colors z-10"
          >
            <X className="w-6 h-6 text-white" />
          </button>

          {/* Fotka na celou obrazovku */}
          <div className="relative w-full h-full max-w-7xl max-h-[90vh]">
            <Image
              src={selectedPhoto}
              alt="Fotografie"
              fill
              className="object-contain"
              sizes="100vw"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
}

