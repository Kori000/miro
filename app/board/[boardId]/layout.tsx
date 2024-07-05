'use client'

interface BoardLayoutProps {
  children: React.ReactNode
}

import { LiveblocksProvider } from '@liveblocks/react'
const BoardLayout: React.FC<BoardLayoutProps> = ({ children }) => {
  return (
    <LiveblocksProvider
      publicApiKey="pk_dev_ptKf0xh9npugCugN3Pge5Y1_hyMk1VhEjHRgw3jUfCHKORyDqXREONY204t2RN2z"
      throttle={16}
    >
      {children}
    </LiveblocksProvider>
  )
}

export default BoardLayout
