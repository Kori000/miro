'use client'

import { api } from '@/convex/_generated/api'
import { useQuery } from 'convex/react'
import { BoardCard } from './board-card'
import { EmptyBoards } from './empty-boards'
import { EmptyFavorites } from './empty-favorites'
import { EmptySearch } from './empty-search'
import { NewBoardButton } from './new-board-button'

type BoardListProps = {
  orgId: string
  query: {
    search?: string
    favorites?: boolean
  }
}
const BoardList = ({ orgId, query }: BoardListProps) => {
  // TODO:
  const data = useQuery(api.boards.get, {
    orgId,
  })

  if (data === undefined) {
    return (
      <div>
        <h2>{query.favorites ? 'Favorite boards' : 'Team boards'}</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-5 mt-8 pb-10 ">
          <NewBoardButton orgId={orgId} disabled />
          <BoardCard.Skeleton />
          <BoardCard.Skeleton />
          <BoardCard.Skeleton />
        </div>
      </div>
    )
  }

  if (!data.length && query.search) {
    return <EmptySearch />
  }

  if (!data.length && query.favorites) {
    return <EmptyFavorites />
  }

  if (!data.length) {
    return <EmptyBoards />
  }
  return (
    <div className="text-3xl ">
      <h2>{query.favorites ? 'Favorite boards' : 'Team boards'}</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-5 mt-8 pb-10 ">
        <NewBoardButton orgId={orgId} />

        {data?.map(board => (
          <BoardCard
            key={board._id}
            id={board._id}
            title={board.title}
            imageUrl={board.imageUrl}
            authorId={board.authorId}
            authorName={board.authorName}
            createdAt={board._creationTime}
            orgId={board.orgId}
            isFavorite={false}
          />
        ))}
      </div>
    </div>
  )
}

export default BoardList
