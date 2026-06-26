import TrackCard from './TrackCard'
import type { Track } from '@/types'

interface Props {
  tracks: Track[]
  isLoggedIn: boolean
  onAdd: (track: Track) => void
}

export default function TrackGrid({ tracks, isLoggedIn, onAdd }: Props) {
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
          isLoggedIn={isLoggedIn}
          onAdd={onAdd}
        />
      ))}
    </div>
  )
}
