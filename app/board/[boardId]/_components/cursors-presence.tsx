'use client'

import { useOthersConnectionIds } from '@liveblocks/react'
import { memo } from 'react'
import { Cursor } from './cursor'

const Cursors = () => {
  const ids = useOthersConnectionIds()

  return (
    <>
      {ids.map(connectionId => (
        <Cursor key={connectionId} connectionId={connectionId} />
      ))}
    </>
  )
}

type CursorsPresenceProps = {}
export const CursorsPresence = memo(({}: CursorsPresenceProps) => {
  return (
    <>
      {/* TODO: Draft pencil */}
      <Cursors />
    </>
  )
})

CursorsPresence.displayName = 'CursorsPresence'
