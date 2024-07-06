'use client'

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
      }}
      id={roomId}
    >
      <ClientSideSuspense fallback={fallback}>
        {() => children}
      </ClientSideSuspense>
    </RoomProvider>
  )
}
