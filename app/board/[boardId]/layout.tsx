'use client'

interface BoardLayoutProps {
  children: React.ReactNode
}

import { LiveblocksProvider } from '@liveblocks/react'
const BoardLayout: React.FC<BoardLayoutProps> = ({ children }) => {
  return (
    <LiveblocksProvider authEndpoint="/api/liveblocks-auth" throttle={16}>
      {children}
    </LiveblocksProvider>
  )
}

export default BoardLayout
