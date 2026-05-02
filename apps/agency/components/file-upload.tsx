'use client';

import { Upload, X, Image as ImageIcon, FileText, CreditCard, CheckCircle } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import { toast } from 'sonner';

type FileUploadType = 'logo' | 'document' | 'pdf';

type FileUploadProps = {
  type: FileUploadType;
  label: string;
  value?: string;
  onChange: (value: string) => void;
  onRemove: () => void;
  accept?: string;
};

const fileConfig = {
  logo: {
    icon: ImageIcon,
    accept: 'image/*',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  document: {
    icon: FileText,
    accept: '.pdf,.doc,.docx',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
  },
  pdf: {
    icon: FileText,
    accept: '.pdf',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
  },
};

export function FileUpload({ type, label, value, onChange, onRemove, accept }: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const config = fileConfig[type];
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        if (file.size > 5 * 1024 * 1024) {
          toast.error('File size too large. Please upload a file smaller than 5MB.');
          return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
          onChange(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    },
    [onChange]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) {
        if (file.size > 5 * 1024 * 1024) {
          toast.error('File size too large. Please upload a file smaller than 5MB.');
          return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
          onChange(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    },
    [onChange]
  );

  const Icon = config.icon;

  if (value) {
    return (
      <div
        className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-4 transition-all ${config.bgColor} border-${config.color}`}
      >
        <div className={`rounded-full ${config.bgColor} p-3`}>
          <Icon className={`size-8 ${config.color}`} />
        </div>
        <p className="mt-2 text-center text-xs font-medium text-gray-700">Uploaded</p>
        <CheckCircle className="absolute right-2 top-2 size-4 text-green-600" />
        <button
          className="mt-2 flex items-center gap-1 text-xs text-red-500 hover:text-red-700"
          onClick={(e) => {
            e.preventDefault();
            onRemove();
          }}
          type="button"
        >
          <X className="size-3" /> Remove
        </button>
      </div>
    );
  }

  return (
    <div>
      <p className="mb-2 text-sm font-medium text-gray-700">{label}</p>
      <div
        className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-4 transition-all ${
          isDragging ? `${config.bgColor} border-${config.color} scale-105` : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
        }`}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className={`rounded-full ${config.bgColor} p-3`}>
          <Upload className={`size-6 ${config.color}`} />
        </div>
        <p className="mt-2 text-center text-xs text-gray-600">
          <span className="font-medium text-primary">Click to upload</span> or drag and drop
        </p>
        <p className="text-xs text-gray-400">
          {type === 'logo' ? 'PNG, JPG up to 5MB' : 'PDF, DOC up to 5MB'}
        </p>
      </div>
      <input
        accept={accept || config.accept}
        className="hidden"
        onChange={handleFileChange}
        ref={fileInputRef}
        type="file"
      />
    </div>
  );
}
