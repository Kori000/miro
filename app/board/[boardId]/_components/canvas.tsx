'use client'

import {
  connectionIdToColor,
  findIntersectingLayersWithRectangle,
  pointerEventToCanvasPoint,
  resizeBounds,
} from '@/lib/utils'
import {
  Camera,
  CanvasMode,
  CanvasState,
  Color,
  Layer,
  LayerType,
  Point,
  Side,
  XYWH,
} from '@/types/canvas'
import { LiveObject } from '@liveblocks/client'
import {
  useCanRedo,
  useCanUndo,
  useHistory,
  useMutation,
  useOthersMapped,
  useSelf,
  useStorage,
} from '@liveblocks/react'
import { nanoid } from 'nanoid'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { CursorsPresence } from './cursors-presence'
import { Info } from './info'
import { Participants } from './participants'
import { Toolbar } from './toolbar'
import { LayerPreview } from './layer-preview'
import { SelectionBox } from './selection-box'
import { SelectionTools } from './selection-tools'
import { min } from 'date-fns'

const MAX_LAYERS = 100

const SELECTION_NET_THRESHOLD = 5

type CanvasProps = {
  boardId: string
}
export const Canvas = ({ boardId }: CanvasProps) => {
  const layerIds = useStorage(root => root.layerIds)

  const [canvasState, setCanvasState] = useState<CanvasState>({
    mode: CanvasMode.None,
  })

  const [camera, setCamera] = useState<Camera>({ x: 0, y: 0 })
  const [lastUsedColor, setLastUsedColor] = useState<Color>({
    r: 255,
    g: 255,
    b: 255,
  })

  const history = useHistory()
  const canUndo = useCanUndo()
  const canRedo = useCanRedo()

  const insertLayer = useMutation(
    (
      { storage, setMyPresence },
      layerType:
        | LayerType.Ellipse
        | LayerType.Rectangle
        | LayerType.Text
        | LayerType.Note,
      position: Point,
    ) => {
      const liveLayers = storage.get('layers')

      if (liveLayers.size >= MAX_LAYERS) {
        return
      }

      const liveLayerIds = storage.get('layerIds')
      const layerId = nanoid()
      const layer = new LiveObject<Layer>({
        type: layerType,
        x: position.x,
        y: position.y,
        height: 100,
        width: 100,
        fill: lastUsedColor,
      })

      liveLayerIds.push(layerId)
      liveLayers.set(layerId, layer)

      setMyPresence(
        {
          selection: [layerId],
        },
        {
          addToHistory: true,
        },
      )
      setCanvasState({
        mode: CanvasMode.None,
      })
    },
    [lastUsedColor],
  )
  const unselectLayers = useMutation(
    ({ setMyPresence, self }, e: React.PointerEvent) => {
      if (self.presence.selection.length > 0) {
        setMyPresence(
          {
            selection: [],
          },
          {
            addToHistory: true,
          },
        )
      }
    },
    [],
  )

  const updateSelectionNet = useMutation(
    ({ setMyPresence, storage }, current: Point, origin: Point) => {
      const layers = storage.get('layers').toImmutable()

      setCanvasState({
        mode: CanvasMode.SelectionNet,
        origin,
        current,
      })

      if (!layerIds) return
      const ids = findIntersectingLayersWithRectangle(
        layerIds,
        layers,
        origin,
        current,
      )

      setMyPresence({
        selection: ids,
      })
    },
    [layerIds],
  )

  const startMuletiSelection = useCallback((current: Point, origin: Point) => {
    // 安全距离阈值
    if (
      Math.abs(current.x - origin.x) + Math.abs(current.y - origin.y) >
      SELECTION_NET_THRESHOLD
    ) {
      setCanvasState({
        mode: CanvasMode.SelectionNet,
        origin,
        current,
      })
    }
  }, [])

  const resizeSelectedLayer = useMutation(
    ({ storage, self }, point: Point) => {
      if (canvasState.mode !== CanvasMode.Resizing) {
        return
      }

      const bounds = resizeBounds(
        canvasState.initialBounds,
        canvasState.corner,
        point,
      )

      const liveLayers = storage.get('layers')
      const layer = liveLayers.get(self.presence.selection[0])

      if (layer) {
        layer.update(bounds)
      }
    },
    [canvasState],
  )

  const onPointerUp = useMutation(
    ({}, e) => {
      const point = pointerEventToCanvasPoint(e, camera)

      if (
        canvasState.mode === CanvasMode.None ||
        canvasState.mode === CanvasMode.Pressing
      ) {
        unselectLayers(e)

        setCanvasState({
          mode: CanvasMode.None,
        })
      } else if (canvasState.mode === CanvasMode.Inserting) {
        insertLayer(canvasState.layerType, point)
      } else {
        // 重置状态
        setCanvasState({
          mode: CanvasMode.None,
        })
      }

      history.resume()
    },
    [camera, canvasState, history, insertLayer, unselectLayers],
  )

  const translateSelectedLayer = useMutation(
    ({ storage, self }, point: Point) => {
      if (canvasState.mode !== CanvasMode.Translating) {
        return
      }

      const offset = {
        x: point.x - canvasState.current.x,
        y: point.y - canvasState.current.y,
      }

      const liveLayers = storage.get('layers')

      // 每一个选中的图层都要更新位置
      for (const id of self.presence.selection) {
        const layer = liveLayers.get(id)
        if (layer) {
          layer.update({
            x: layer.get('x') + offset.x,
            y: layer.get('y') + offset.y,
          })
        }

        setCanvasState({
          mode: CanvasMode.Translating,
          current: point,
        })
      }
    },
    [camera, canvasState, history, insertLayer],
  )

  const onResizeHandlePointerDown = useCallback(
    (corner: Side, initialBounds: XYWH) => {
      history.pause()
      setCanvasState({
        mode: CanvasMode.Resizing,
        initialBounds,
        corner,
      })
    },
    [history],
  )

  // 滚轮事件
  const onWheel = useCallback((e: React.WheelEvent) => {
    setCamera(camera => ({
      // delta 滚动距离
      x: camera.x - e.deltaX,
      y: camera.y - e.deltaY,
    }))
  }, [])

  const onPointerMove = useMutation(
    ({ setMyPresence }, e: React.PointerEvent) => {
      e.preventDefault()

      const current = pointerEventToCanvasPoint(e, camera)

      if (canvasState.mode === CanvasMode.Pressing) {
        startMuletiSelection(current, canvasState.origin)
      } else if (canvasState.mode === CanvasMode.SelectionNet) {
        updateSelectionNet(current, canvasState.origin)
      } else if (canvasState.mode === CanvasMode.Translating) {
        translateSelectedLayer(current)
      } else if (canvasState.mode === CanvasMode.Resizing) {
        resizeSelectedLayer(current)
      }
      setMyPresence({ cursor: current })
    },
    [canvasState, resizeSelectedLayer, camera],
  )

  const onPointerLeave = useMutation(({ setMyPresence }) => {
    setMyPresence({
      cursor: null,
    })
  }, [])

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      const point = pointerEventToCanvasPoint(e, camera)

      if (canvasState.mode === CanvasMode.Inserting) {
        return
      }

      setCanvasState({
        origin: point,
        mode: CanvasMode.Pressing,
      })
    },
    [camera, canvasState.mode, setCanvasState],
  )

  const info = useSelf(me => me.info)

  const selections = useOthersMapped(other => other.presence.selection)

  const onLayerPointerDown = useMutation(
    ({ self, setMyPresence }, e: React.PointerEvent, layerId: string) => {
      if (
        canvasState.mode === CanvasMode.Pencil ||
        canvasState.mode === CanvasMode.Inserting
      ) {
        return
      }

      history.pause()
      e.stopPropagation()

      const point = pointerEventToCanvasPoint(e, camera)

      if (!self.presence.selection.includes(layerId)) {
        setMyPresence(
          {
            selection: [layerId],
          },
          {
            addToHistory: true,
          },
        )
      }

      setCanvasState({ mode: CanvasMode.Translating, current: point })
    },
    [setCanvasState, camera, history, canvasState.mode],
  )

  const layerIdsToColorSelection = useMemo(() => {
    const layerIdsToColorSelection: Record<string, string> = {}

    for (const user of selections) {
      const [connectionId, selection] = user

      for (const layerId of selection) {
        layerIdsToColorSelection[layerId] = connectionIdToColor(connectionId)
      }
    }

    return layerIdsToColorSelection
  }, [selections])

  useEffect(() => {
    if (canvasState.mode !== CanvasMode.SelectionNet || !canvasState.current)
      return
    console.log('x 轴在', Math.min(canvasState.origin.x, canvasState.current.x))
    console.log('y 轴在', Math.min(canvasState.origin.y, canvasState.current.y))
    console.log('宽度', Math.abs(canvasState.origin.x - canvasState.current.x))
    console.log('高度', Math.abs(canvasState.origin.y - canvasState.current.y))
  }, [canvasState])

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

      <SelectionTools camera={camera} setLastUsedColor={setLastUsedColor} />
      <svg
        onWheel={onWheel}
        onPointerMove={onPointerMove}
        onPointerDown={onPointerDown}
        onPointerLeave={onPointerLeave}
        onPointerUp={onPointerUp}
        className="h-[100vh] w-[100vw] "
      >
        <g
          style={{
            transform: `translate(${camera.x}px, ${camera.y}px)`,
          }}
        >
          {layerIds?.map(layerId => (
            <LayerPreview
              key={layerId}
              id={layerId}
              onLayerPointerDown={onLayerPointerDown}
              selectionColor={layerIdsToColorSelection[layerId]}
            />
          ))}

          <SelectionBox onResizeHandlePointerDown={onResizeHandlePointerDown} />
          {canvasState.mode === CanvasMode.SelectionNet &&
            canvasState.current !== undefined && (
              <rect
                className="fill-blue-500/5 stroke-blue-500 stroke-1 "
                x={Math.min(canvasState.origin.x, canvasState.current.x)}
                y={Math.min(canvasState.origin.y, canvasState.current.y)}
                width={Math.abs(canvasState.origin.x - canvasState.current.x)}
                height={Math.abs(canvasState.origin.y - canvasState.current.y)}
              />
            )}
          <CursorsPresence />
        </g>
      </svg>
    </main>
  )
}
