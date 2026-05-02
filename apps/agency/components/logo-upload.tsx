'use client';

import { Button } from '@repo/design-system/web/src/components/ui/button';
import { Upload, X } from 'lucide-react';
import Image from 'next/image';
import { useCallback, useRef } from 'react';
import { toast } from 'sonner';

type LogoUploadProps = {
  value?: string;
  onChange: (value: string) => void;
  onRemove: () => void;
};

export function LogoUpload({ value, onChange, onRemove }: LogoUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        // Limit size to 1MB for base64 storage
        if (file.size > 1024 * 1024) {
          toast.error('File size too large. Please upload an image smaller than 1MB.');
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

  return (
    <div className="flex flex-col gap-4">
      {value ? (
        <div className="relative h-40 w-40 overflow-hidden rounded-md border">
          <Image alt="Logo" className="object-contain" fill src={value} />
          <Button
            className="absolute top-1 right-1 h-6 w-6"
            onClick={(e) => {
              e.preventDefault();
              onRemove();
            }}
            size="icon"
            type="button"
            variant="destructive"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <button
          className="flex h-40 w-40 cursor-pointer flex-col items-center justify-center rounded-md border border-dashed hover:bg-accent/50"
          onClick={(e) => {
            e.preventDefault();
            fileInputRef.current?.click();
          }}
          type="button"
        >
          <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
          <span className="text-muted-foreground text-xs">Upload Logo</span>
        </button>
      )}
      <input accept="image/*" className="hidden" onChange={handleFileChange} ref={fileInputRef} type="file" />
    </div>
  );
}
