import TrackCard from './TrackCard'
import type { Track } from '@/types'

interface Props {
  tracks: Track[]
}

export default function TrackGrid({ tracks }: Props) {
  return (
    <div
      className="sr-track-grid"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '16px',
        alignItems: 'start',
      }}
    >
      {tracks.map((track) => (
        <TrackCard
          key={track.id}
          track={track}
          reason={track.reason}
        />
      ))}
    </div>
  )
}
