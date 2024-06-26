import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { OrganizationProfile } from '@clerk/nextjs'
import { DialogTrigger } from '@radix-ui/react-dialog'
import { Plus } from 'lucide-react'

const InviteButton = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant='outline'>
          <Plus className='size-4 mr-2 ' />
          Invite members
        </Button>
      </DialogTrigger>
      <DialogContent className='p-0 bg-transparent border-none max-w-[880px] '>
        <OrganizationProfile routing='hash' />
      </DialogContent>
    </Dialog>
  )
}

export default InviteButton
