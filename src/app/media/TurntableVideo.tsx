import { useRef } from 'react'
import type { Mineral } from '@/data/samples/schema'

export type Specimen = Mineral['specimens'][number]

export const mediaUrl = (specimenId: string, file: string) => `${import.meta.env.BASE_URL}media/samples/${specimenId}/${file}`

/**
 * A specimen's turntable recording. It loops on its own; dragging across it scrubs the time, so a drag turns the
 * sample, one width being one full recording. Keyboard users get the native controls.
 */
export function TurntableVideo({ specimen, className = '' }: { specimen: Specimen; className?: string }) {
  const video = useRef<HTMLVideoElement>(null)
  const drag = useRef<{ x: number; t: number } | null>(null)
  if (!specimen.turntable) return null
  const { file, poster } = specimen.turntable
  return (
    <video
      ref={video}
      className={`w-full touch-pan-y rounded-lg bg-black ${className}`}
      src={mediaUrl(specimen.id, file)}
      poster={mediaUrl(specimen.id, poster)}
      muted
      loop
      playsInline
      controls
      preload="none"
      aria-label={`${specimen.label ?? specimen.id} on a turntable; drag to turn`}
      onPointerDown={(e) => {
        const v = video.current
        if (!v || e.button !== 0) return
        drag.current = { x: e.clientX, t: v.currentTime }
        v.pause()
        e.currentTarget.setPointerCapture(e.pointerId)
      }}
      onPointerMove={(e) => {
        const v = video.current
        if (!v || !drag.current || !v.duration) return
        const dt = ((e.clientX - drag.current.x) / e.currentTarget.clientWidth) * v.duration
        v.currentTime = ((((drag.current.t + dt) % v.duration) + v.duration) % v.duration)
      }}
      onPointerUp={() => {
        drag.current = null
      }}
      onPointerCancel={() => {
        drag.current = null
      }}
    />
  )
}

/** The first specimen with a recording, if any. */
export const firstSpecimen = (mineral: Mineral): Specimen | undefined => mineral.specimens.find((s) => s.turntable)
