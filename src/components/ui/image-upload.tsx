'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { Upload, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ImageUploadProps {
  value?: string | null
  onChange: (url: string | null) => void
  onUpload: (file: File) => Promise<string>
  disabled?: boolean
  className?: string
  aspectRatio?: 'square' | 'landscape' | 'portrait'
  label?: string
}

export function ImageUpload({
  value,
  onChange,
  onUpload,
  disabled,
  className,
  aspectRatio = 'square',
  label = 'Upload Image',
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const aspectClasses = {
    square: 'aspect-square',
    landscape: 'aspect-video',
    portrait: 'aspect-[3/4]',
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB')
      return
    }

    setError(null)
    setIsUploading(true)

    try {
      const url = await onUpload(file)
      onChange(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setIsUploading(false)
      // Reset input
      if (inputRef.current) {
        inputRef.current.value = ''
      }
    }
  }

  function handleRemove() {
    onChange(null)
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  return (
    <div className={cn('space-y-2', className)}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={disabled || isUploading}
        className="hidden"
      />

      {value ? (
        <div className="relative group">
          <div
            className={cn(
              'relative overflow-hidden rounded-lg border bg-muted',
              aspectClasses[aspectRatio]
            )}
          >
            <Image
              src={value}
              alt="Uploaded image"
              fill
              className="object-cover"
            />
          </div>
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleRemove}
            disabled={disabled || isUploading}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={disabled || isUploading}
          className={cn(
            'flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 text-muted-foreground hover:bg-muted/50 hover:border-primary/50 transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50',
            aspectClasses[aspectRatio]
          )}
        >
          {isUploading ? (
            <>
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="text-sm">Uploading...</span>
            </>
          ) : (
            <>
              <Upload className="h-8 w-8" />
              <span className="text-sm">{label}</span>
              <span className="text-xs">PNG, JPG up to 5MB</span>
            </>
          )}
        </button>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
