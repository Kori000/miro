'use client'

import { LayerType } from '@/types/canvas'
import { useStorage } from '@liveblocks/react'
import React, { memo } from 'react'
import { Rectangle } from './rectangle'
import { Ellipse } from './ellipse'

type LayerPreviewProps = {
  id: string
  onLayerPointerDown: (e: React.PointerEvent, layerId: string) => void
  selectionColor?: string
}
export const LayerPreview = memo(
  ({ id, onLayerPointerDown, selectionColor }: LayerPreviewProps) => {
    const layer = useStorage(root => root.layers.get(id))

    if (!layer) return null

    switch (layer.type) {
      case LayerType.Ellipse:
        return (
          <Ellipse
            id={id}
            layer={layer}
            onPointerDown={onLayerPointerDown}
            selectionColor={selectionColor}
          />
        )

      case LayerType.Rectangle:
        return (
          <Rectangle
            id={id}
            layer={layer}
            onPointerDown={onLayerPointerDown}
            selectionColor={selectionColor}
          />
        )

      default:
        return <div />
    }
  },
)

LayerPreview.displayName = 'LayerPreview'
