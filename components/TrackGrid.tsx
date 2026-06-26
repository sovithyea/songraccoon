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
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '16px',
      }}
    >
      {tracks.map((track) => (
        <TrackCard
          key={track.id}
          track={track}
          accessToken={accessToken}
          onAdd={onAdd}
          reason={track.reason}
        />
      ))}
    </div>
  )
}
