'use client'

import { EntryPhoto } from '@/lib/types'
import Image from 'next/image'

interface PhotosGridProps {
  photos: EntryPhoto[]
}

export function PhotosGrid({ photos }: PhotosGridProps) {
  if (photos.length === 0) return null

  return (
    <div className="grid grid-cols-3 gap-2">
      {photos.map((photo) => (
        <div key={photo.id} className="relative aspect-square rounded-md overflow-hidden bg-muted">
          <Image
            src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${photo.storage_path}`}
            alt={photo.caption || 'Entry photo'}
            fill
            className="object-cover"
          />
        </div>
      ))}
    </div>
  )
}
