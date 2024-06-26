'use client'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { api } from '@/convex/_generated/api'
import { useApiMutation } from '@/hooks/use-api-mutation'
import { DropdownMenuContentProps } from '@radix-ui/react-dropdown-menu'
import { Link2, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

interface ActionsProps {
  children: React.ReactNode
  side?: DropdownMenuContentProps['side']
  sideOffset?: DropdownMenuContentProps['sideOffset']
  id: string
  title: string
}

export const Actions = ({
  side,
  sideOffset,
  id,
  title,
  children,
}: ActionsProps) => {
  const onCopyLink = () => {
    navigator.clipboard
      .writeText(`${window.location.origin}/board/${id}}`)
      .then(() => toast.success('Link copied'))
      .catch(() => toast.error('Failed to copy link'))
  }

  const { mutate, pending } = useApiMutation(api.board.remove)

  const onDelete = () => {
    mutate({ id })
      .then(() => toast.success('Board deleted'))
      .catch(() => toast.error('Failed to delete board'))
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>

      <DropdownMenuContent
        onClick={e => e.stopPropagation()}
        side={side}
        sideOffset={sideOffset}
        className="w-60 "
      >
        <DropdownMenuItem onClick={onCopyLink} className="p-3 cursor-pointer ">
          <Link2 className="size-4 mr-2 " />
          Copy board link
        </DropdownMenuItem>

        <DropdownMenuItem onClick={onDelete} className="p-3 cursor-pointer ">
          <Trash2 className="size-4 mr-2 " />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
