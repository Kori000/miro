'use client'

import { EmptyBoards } from './empty-boards'
import { EmptyFavorites } from './empty-favorites'
import { EmptySearch } from './empty-search'

type BoardListProps = {
  orgId: string
  query: {
    search?: string
    favorites?: boolean
  }
}
const BoardList = ({ orgId, query }: BoardListProps) => {
  // TODO:
  const data = []

  if (!data.length && query.search) {
    return <EmptySearch />
  }

  if (!data.length && query.favorites) {
    return <EmptyFavorites />
  }

  if (!data.length) {
    return <EmptyBoards />
  }
  return <div></div>
}

export default BoardList
