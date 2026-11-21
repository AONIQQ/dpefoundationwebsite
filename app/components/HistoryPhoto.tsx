import Image from 'next/image'
import type { Photo } from '@/content/fraternity/photos'

// A captioned photograph from the pledge manual. Small originals (portraits)
// stay small; group photos and buildings fill the column.
export function isPortrait(p: Photo) { return p.width <= 460 }

export default function HistoryPhoto({ photo, priority = false }: { photo: Photo; priority?: boolean }) {
  const small = isPortrait(photo)
  return (
    <figure className={small ? 'w-40 sm:w-44' : 'w-full'}>
      <Image
        src={photo.src}
        width={photo.width}
        height={photo.height}
        alt={photo.caption}
        priority={priority}
        sizes={small ? '176px' : '(min-width: 768px) 720px, 100vw'}
        className="w-full h-auto rounded-md border border-[#d4af36]/30 bg-white shadow-sm"
      />
      <figcaption className="mt-2 text-sm leading-snug text-gray-600 text-center">{photo.caption}</figcaption>
    </figure>
  )
}

/** Photos shown together: portraits side by side, larger photos stacked. */
export function PhotoGroup({ photos }: { photos: Photo[] }) {
  if (!photos.length) return null
  const portraits = photos.filter(isPortrait)
  const large = photos.filter((p) => !isPortrait(p))
  return (
    <div className="my-8 space-y-8">
      {portraits.length > 0 && (
        <div className="flex flex-wrap justify-center gap-6">{portraits.map((p) => <HistoryPhoto key={p.src} photo={p} />)}</div>
      )}
      {large.length > 0 && (
        <div className={`grid gap-8 ${large.length > 1 ? 'sm:grid-cols-2' : ''}`}>
          {large.map((p) => <HistoryPhoto key={p.src} photo={p} />)}
        </div>
      )}
    </div>
  )
}
