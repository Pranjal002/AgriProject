import React, { useState } from 'react';
import { UploadCloud, Image as ImageIcon, X, Sparkles } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const SAMPLE_PHOTOS = [
  { label: 'Mahindra Tractor', url: 'https://images.unsplash.com/photo-1592878904946-b3cd8ae243d0?w=800&auto=format&fit=crop&q=80' },
  { label: 'Power Tiller', url: 'https://images.unsplash.com/photo-1594771804886-a933bb2d609b?w=800&auto=format&fit=crop&q=80' },
  { label: 'Kubota Tractor', url: 'https://images.unsplash.com/photo-1544986581-efac024faf62?w=800&auto=format&fit=crop&q=80' },
  { label: 'Mini Weeder', url: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?w=800&auto=format&fit=crop&q=80' },
];

export default function PhotoUpload({ photos = [], onChange }) {
  const { isNepali } = useLanguage();
  const [compressing, setCompressing] = useState(false);

  // Compress image client side using HTML5 canvas
  const processImageFile = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDim = 1200;
          let width = img.width;
          let height = img.height;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          // Export as compressed JPEG
          const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
          resolve(dataUrl);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setCompressing(true);
    const newUrls = [];
    for (const f of files) {
      if (f.type.startsWith('image/')) {
        const compressed = await processImageFile(f);
        newUrls.push(compressed);
      }
    }
    setCompressing(false);
    onChange([...photos, ...newUrls]);
  };

  const removePhoto = (index) => {
    const updated = [...photos];
    updated.splice(index, 1);
    onChange(updated);
  };

  const addSamplePhoto = (url) => {
    if (!photos.includes(url)) {
      onChange([...photos, url]);
    }
  };

  return (
    <div className="space-y-3">
      {/* Upload Zone */}
      <div className="relative border-2 border-dashed border-slate-300 hover:border-gov-500 rounded-2xl p-6 text-center transition bg-slate-50/50 hover:bg-gov-50/20">
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div className="flex flex-col items-center justify-center pointer-events-none">
          <div className="p-3 bg-gov-100 text-gov-800 rounded-full mb-2">
            <UploadCloud className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-slate-800">
            {isNepali ? 'मेसिनरीको फोटो अपलोड गर्नुहोस्' : 'Upload Machinery Photos'}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">
            {isNepali
              ? 'क्लिक गर्नुहोस् वा फोटो ड्र्याग गर्नुहोस् (स्वतः कम्प्रेस हुन्छ)'
              : 'Click or drag files here (Client-side compressed before saving)'}
          </p>
          {compressing && (
            <p className="text-xs font-semibold text-gov-700 mt-2 animate-pulse">
              {isNepali ? 'फोटो कम्प्रेस हुँदैछ...' : 'Compressing image...'}
            </p>
          )}
        </div>
      </div>

      {/* Quick Sample Selector (Handy for testing) */}
      <div className="flex items-center gap-2 flex-wrap text-xs">
        <span className="text-slate-500 flex items-center gap-1 font-medium">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          {isNepali ? 'नमुना फोटो छान्नुहोस्:' : 'Or pick sample photo:'}
        </span>
        {SAMPLE_PHOTOS.map((item, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => addSamplePhoto(item.url)}
            className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition"
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Preview Grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          {photos.map((url, idx) => (
            <div
              key={idx}
              className="relative group rounded-xl overflow-hidden border border-slate-200 aspect-video bg-slate-100 shadow-sm"
            >
              <img
                src={url}
                alt={`Machinery Photo ${idx + 1}`}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
              />
              <button
                type="button"
                onClick={() => removePhoto(idx)}
                className="absolute top-1.5 right-1.5 p-1 bg-slate-900/75 hover:bg-crimson-600 text-white rounded-full transition shadow"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

