'use client'

import { pointerEventToCanvasPoint } from '@/lib/utils'
import { Camera, CanvasMode, CanvasState } from '@/types/canvas'
import {
  useCanRedo,
  useCanUndo,
  useHistory,
  useMutation,
  useSelf,
} from '@liveblocks/react'
import React, { useCallback, useState } from 'react'
import { CursorsPresence } from './cursors-presence'
import { Info } from './info'
import { Participants } from './participants'
import { Toolbar } from './toolbar'

type CanvasProps = {
  boardId: string
}
export const Canvas = ({ boardId }: CanvasProps) => {
  const info = useSelf(me => me.info)

  const [canvasState, setCanvasState] = useState<CanvasState>({
    mode: CanvasMode.None,
  })

  const [camera, setCamera] = useState<Camera>({
    x: 0,
    y: 0,
  })

  // 滚轮事件
  const onWheel = useCallback((e: React.WheelEvent) => {
    setCamera(camera => ({
      // delta 滚动距离
      x: camera.x - e.deltaX,
      y: camera.y - e.deltaY,
    }))
  }, [])

  const history = useHistory()

  const canUndo = useCanUndo()
  const canRedo = useCanRedo()

  const onPointerMove = useMutation(
    ({ setMyPresence }, e: React.PointerEvent) => {
      e.preventDefault()

      const current = pointerEventToCanvasPoint(e, camera)

      setMyPresence({ cursor: current })
    },
    [],
  )

  const onPointerLeave = useMutation(({ setMyPresence }) => {
    setMyPresence({
      cursor: null,
    })
  }, [])

  return (
    <main className="h-full w-full relative bg-neutral-100 touch-none ">
      <Info boardId={boardId} />

      <Participants />

      <Toolbar
        canvasState={canvasState}
        setCanvasState={setCanvasState}
        canRedo={canRedo}
        canUndo={canUndo}
        undo={history.undo}
        redo={history.redo}
      />

      <svg
        onWheel={onWheel}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        className="h-[100vh] w-[100vw] "
      >
        <g>
          <CursorsPresence />
        </g>
      </svg>
    </main>
  )
}
