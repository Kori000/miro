'use client'

import { Layer } from '@/types/canvas'
import { LiveList, LiveMap, LiveObject } from '@liveblocks/client'
import { ClientSideSuspense, RoomProvider } from '@liveblocks/react'

type RoomProps = {
  children: React.ReactNode
  roomId: string
  fallback: NonNullable<React.ReactNode> | null
}
export const Room = ({ children, roomId, fallback }: RoomProps) => {
  return (
    <RoomProvider
      initialPresence={{
        cursor: null,
        selection: [],
        pencilDraft: null,
        penColor: null,
      }}
      initialStorage={{
        layers: new LiveMap<string, LiveObject<Layer>>(),
        layerIds: new LiveList([]),
      }}
      id={roomId}
    >
      <ClientSideSuspense fallback={fallback}>
        {() => children}
      </ClientSideSuspense>
    </RoomProvider>
  )
}
