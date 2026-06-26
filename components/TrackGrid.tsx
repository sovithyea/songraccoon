import TrackCard from './TrackCard'
import type { Track } from '@/types'

interface Props {
  tracks: Track[]
  accessToken: string | null
  onAdd: (track: Track) => void
}

export default function TrackGrid({ tracks, accessToken, onAdd }: Props) {
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
          accessToken={accessToken}
          onAdd={onAdd}
        />
      ))}
    </div>
  )
}
