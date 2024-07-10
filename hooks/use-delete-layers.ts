import { useMutation, useSelf } from '@liveblocks/react'

// 删除选中的图层
export const useDeleteLayers = () => {
  const selection = useSelf(me => me.presence.selection)

  return useMutation(
    ({ storage, setMyPresence }) => {
      const liveLayers = storage.get('layers')
      const liveLayerIds = storage.get('layerIds')

      console.log('liveLayerIds', liveLayerIds)

      if (!selection) return
      for (const id of selection) {
        liveLayers.delete(id)

        const index = liveLayerIds.indexOf(id)

        if (index !== -1) {
          liveLayerIds.delete(index)
        }
      }

      setMyPresence(
        {
          selection: [],
        },
        {
          addToHistory: true,
        },
      )

      return
    },
    [selection],
  )
}
