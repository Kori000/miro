'use client'

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

import { api } from '@/convex/_generated/api'
import { useApiMutation } from '@/hooks/use-api-mutation'
import { useRenameModal } from '@/store/use-rename-modal'
import { FormEventHandler, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '../ui/button'
import { Input } from '../ui/input'

export const RenameModal = () => {
  const { isOpen, onClose, initialValues } = useRenameModal()
  const [title, setTitle] = useState(initialValues.title)

  const { mutate, pending } = useApiMutation(api.board.update)

  const handleClose = () => {
    onClose()
    console.log('123')
  }

  useEffect(() => {
    setTitle(initialValues.title)

    return () => {}
  }, [initialValues.title])

  const onSubmit: FormEventHandler<HTMLFormElement> = e => {
    e.preventDefault()

    mutate({
      id: initialValues.id,
      title,
    })
      .then(() => {
        toast.success('Board renamed')
        handleClose()
      })
      .catch(() => {
        toast.error('Failed to Rename board')
      })
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit board title</DialogTitle>
        </DialogHeader>
        <DialogDescription>Enter a new title for this board</DialogDescription>
        <form onSubmit={onSubmit} className="space-y-4 ">
          <Input
            disabled={pending}
            required
            maxLength={60}
            value={title}
            onChange={e => setTitle(e.target.value.trim())}
            placeholder="Board title"
          />

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant={'outline'} disabled={pending}>
                Cancel
              </Button>
            </DialogClose>

            <Button disabled={pending} type="submit">
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
